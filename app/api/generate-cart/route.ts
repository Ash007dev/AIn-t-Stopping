import { NextRequest, NextResponse } from "next/server";
import { GenerateCartRequest, GenerateCartResponse } from "@/lib/types";
import { loadCatalog, getRegionalProducts } from "@/lib/catalog";
import { resolveRegion } from "@/lib/region-map";
import { invokeIntentParser } from "@/lib/agents/intent-parser";
import { buildDynamicCart } from "@/lib/agents/cart-curator";
import { computeCartTotal } from "@/lib/cart-utils";
import { groupCartByDarkStore, getConsolidatedEta, getDarkStoreInfo } from "@/lib/dark-store-utils";
import { startPipelineTrace, finalizePipelineTrace } from "@/lib/ai-logger";

export async function POST(req: NextRequest) {
  let trace: ReturnType<typeof startPipelineTrace> | null = null;

  try {
    const body = (await req.json()) as GenerateCartRequest;
    const { intentText, householdProfile } = body;

    if (!intentText || intentText.trim().length === 0)
      return NextResponse.json({ error: "Intent text is required" }, { status: 400 });

    // Start pipeline trace
    trace = startPipelineTrace(intentText, body.mode || "intent");

    // Step 1: Parse intent + load catalog in parallel
    const [parsed, catalog] = await Promise.all([
      invokeIntentParser(intentText, householdProfile, body.imageBase64),
      Promise.resolve(loadCatalog()),
    ]);

    if (parsed.error) {
      if (trace) finalizePipelineTrace(trace.id, { status: "error" });
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    // Step 1b: If AI needs clarification, return the question to the frontend
    if (parsed.clarifying_question) {
      if (trace) finalizePipelineTrace(trace.id, { clarifyingQuestion: parsed.clarifying_question, status: "partial" });
      return NextResponse.json({
        clarifying_question: parsed.clarifying_question,
        parsedIntent: parsed,
      }, { status: 200 });
    }

    const region = resolveRegion(householdProfile.pinCode);

    // Step 2: Determine effective mode — mode_override from intent parser takes priority
    const effectiveMode = parsed.mode_override || body.mode;

    // Step 3: AI-first dynamic cart generation
    const cart = await buildDynamicCart(parsed, catalog, householdProfile.budget, region, effectiveMode, body.imageBase64);

    if (cart.length === 0) {
      if (trace) finalizePipelineTrace(trace.id, { cartItemCount: 0, status: "error" });
      return NextResponse.json({ error: "No matching products found for your request." }, { status: 400 });
    }

    // Step 4: Enforce cart size limits based on person count and mode
    const personCount = parsed.person_count ?? householdProfile.servingCount ?? 1;
    let maxItems: number;
    
    if (effectiveMode === "cooking") {
      maxItems = 20; // Cooking requires many granular ingredients
    } else if (effectiveMode === "predictive") {
      maxItems = 10; // Predictive mode: hard cap at 10
    } else {
      if (personCount <= 2) maxItems = 5;
      else if (personCount <= 5) maxItems = 7;
      else if (personCount <= 10) maxItems = 8;
      else maxItems = 10;
    }

    const trimmedCart = cart.slice(0, maxItems);

    // Step 5: Budget hard trim
    if (householdProfile.budget && householdProfile.budget > 0) {
      const total = computeCartTotal(trimmedCart);
      if (total > householdProfile.budget) {
        // Simple trim: remove lowest-rated items until under budget
        const sorted = [...trimmedCart].sort((a, b) => a.rating - b.rating);
        while (computeCartTotal(sorted) > householdProfile.budget && sorted.length > 2) {
          sorted.shift();
        }
        trimmedCart.length = 0;
        trimmedCart.push(...sorted);
      }
    }

    // Step 6: Get regional suggestions (not for addon or predictive mode)
    const regionalProducts = region && effectiveMode !== "addon" && effectiveMode !== "predictive"
      ? getRegionalProducts(catalog, region)
      : [];

    const occasionTitle = parsed.occasion
      ? `${parsed.occasion.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} for ${personCount}`
      : `Shopping Cart for ${personCount}`;

    // Step 7: Dark store summary
    const darkStoreGroups = groupCartByDarkStore(trimmedCart);
    const darkStoreSummary = Object.entries(darkStoreGroups).map(([storeId, items]) => ({
      store: getDarkStoreInfo(storeId),
      item_count: items.length,
      store_id: storeId
    }));
    const consolidatedEta = getConsolidatedEta(trimmedCart);

    // Finalize pipeline trace
    if (trace) finalizePipelineTrace(trace.id, { cartItemCount: trimmedCart.length, status: "success" });

    const response: GenerateCartResponse = {
      cart: trimmedCart,
      regionalProducts,
      occasionTitle,
      parsedIntent: parsed,
      darkStoreSummary,
      consolidatedEta,
      subtotal: computeCartTotal(trimmedCart),
    };

    return NextResponse.json(response);
  } catch (e) {
    console.error("[generate-cart]", e);
    if (trace) finalizePipelineTrace(trace.id, { status: "error" });
    return NextResponse.json({ error: "AI service unavailable. Please try again." }, { status: 503 });
  }
}
