import { NextRequest, NextResponse } from "next/server";
import { GenerateCartRequest, GenerateCartResponse } from "@/lib/types";
import { loadCatalog, getRegionalProducts } from "@/lib/catalog";
import { resolveRegion } from "@/lib/region-map";
import { invokeIntentParser } from "@/lib/agents/intent-parser";
import { invokeCartCurator } from "@/lib/agents/cart-curator";
import { invokeQuantityCalibrator } from "@/lib/agents/quantity-calibrator";
import { computeCartTotal, applyBudgetTrim } from "@/lib/cart-utils";

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

    // Step 2: Curate + get regional products in parallel
    const [curatedIds, regionalProducts] = await Promise.all([
      invokeCartCurator(parsed, catalog, householdProfile.budget, body.mode),
      Promise.resolve(region && body.mode !== "addon" ? getRegionalProducts(catalog, region) : []),
    ]);

    if (curatedIds.length === 0) {
      return NextResponse.json({ error: "No matching products found for your request." }, { status: 400 });
    }

    // Step 3: Build cart products
    const personCount = parsed.person_count ?? householdProfile.servingCount ?? 1;
    const selectedProducts = curatedIds
      .map(({ id, ai_reasoning }) => {
        const product = catalog.find((p) => p.id === id);
        return product ? { product, ai_reasoning } : null;
      })
      .filter(Boolean) as { product: typeof catalog[0]; ai_reasoning: string }[];

    // Step 4: Calculate quantities
    const quantities = await invokeQuantityCalibrator(
      personCount,
      selectedProducts.map((s) => ({ id: s.product.id, serving_size: s.product.serving_size }))
    );

    // Step 5: Merge into CartProduct[]
    const cart = selectedProducts.map(({ product, ai_reasoning }) => {
      const qItem = quantities.find((q) => q.id === product.id);
      const alts = catalog
        .filter((p) => p.category === product.category && p.id !== product.id && p.in_stock)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 2);
      return { ...product, quantity: qItem?.quantity ?? 1, ai_reasoning, alternatives: alts };
    });

    // Step 6: Budget hard trim
    if (householdProfile.budget && householdProfile.budget > 0) {
      const total = computeCartTotal(cart);
      if (total > householdProfile.budget) {
        const { trimmed, underBudget } = applyBudgetTrim(cart, householdProfile.budget);
        if (!underBudget) {
          return NextResponse.json(
            { error: "Budget too low for a minimum cart" },
            { status: 400 }
          );
        }
        // Replace cart with trimmed version
        cart.length = 0;
        cart.push(...trimmed);
      }
    }

    const occasionTitle = parsed.occasion
      ? `${parsed.occasion.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} for ${personCount}`
      : `Shopping Cart for ${personCount}`;

    const response: GenerateCartResponse = {
      cart,
      regionalProducts,
      occasionTitle,
      parsedIntent: parsed,
    };

    return NextResponse.json(response);
  } catch (e) {
    console.error("[generate-cart]", e);
    return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
  }
}
