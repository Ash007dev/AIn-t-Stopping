import { NextRequest, NextResponse } from "next/server";
import { GenerateCartRequest, GenerateCartResponse } from "@/lib/types";
import { loadCatalog, getRegionalProducts } from "@/lib/catalog";
import { resolveRegion } from "@/lib/region-map";
import { invokeIntentParser } from "@/lib/agents/intent-parser";
import { buildDynamicCart } from "@/lib/agents/cart-curator";
import { computeCartTotal } from "@/lib/cart-utils";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateCartRequest;
    const { intentText, householdProfile } = body;

    if (!intentText || intentText.trim().length === 0)
      return NextResponse.json({ error: "Intent text is required" }, { status: 400 });

    // Step 1: Parse intent + load catalog in parallel
    const [parsed, catalog] = await Promise.all([
      invokeIntentParser(intentText, householdProfile),
      Promise.resolve(loadCatalog()),
    ]);

    if (parsed.error)
      return NextResponse.json({ error: parsed.error }, { status: 400 });

    const region = resolveRegion(householdProfile.pinCode);

    // Step 2: AI-first dynamic cart generation
    const cart = await buildDynamicCart(parsed, catalog, householdProfile.budget, region, body.mode);

    if (cart.length === 0) {
      return NextResponse.json({ error: "No matching products found for your request." }, { status: 400 });
    }

    // Step 3: Enforce cart size limits based on person count and mode
    const personCount = parsed.person_count ?? householdProfile.servingCount ?? 1;
    let maxItems: number;
    
    if (body.mode === "cooking") {
      maxItems = 20; // Cooking requires many granular ingredients
    } else {
      if (personCount <= 2) maxItems = 5;
      else if (personCount <= 5) maxItems = 7;
      else if (personCount <= 10) maxItems = 8;
      else maxItems = 10;
    }

    const trimmedCart = cart.slice(0, maxItems);

    // Step 4: Budget hard trim
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

    // Step 5: Get regional suggestions (not for addon mode)
    const regionalProducts = region && body.mode !== "addon"
      ? getRegionalProducts(catalog, region)
      : [];

    const occasionTitle = parsed.occasion
      ? `${parsed.occasion.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} for ${personCount}`
      : `Shopping Cart for ${personCount}`;

    const response: GenerateCartResponse = {
      cart: trimmedCart,
      regionalProducts,
      occasionTitle,
      parsedIntent: parsed,
    };

    return NextResponse.json(response);
  } catch (e) {
    console.error("[generate-cart]", e);
    return NextResponse.json({ error: "AI service unavailable. Please try again." }, { status: 503 });
  }
}
