// lib/agents/modification-handler.ts
import { CartProduct, CartDiff } from "@/lib/types";
import { invokeAI } from "./gemini-client";

const MODIFICATION_SYSTEM_PROMPT = `You are a cart modification assistant for an Indian quick-commerce app.
You receive a modification request in natural language and the current cart.

Your job: Return ONLY a valid JSON object describing what to change. No other text.

Modification types you must handle:
1. "Remove X" → add X's id to remove array
2. "Switch X to Y" → remove X, add Y with same quantity
3. "Make it vegetarian" → remove all non-vegetarian items (chicken, fish, egg, meat products)
4. "Add X" → add product X with appropriate quantity for the group
5. "For N people" or "change to N people" → modify ALL quantities: new_qty = Math.ceil(N / item.serving_size)
6. "Add more X" or "N more X" → increase quantity of existing item by N
7. "Less X" or "remove one X" → decrease quantity, minimum 1
8. "Replace all drinks with X" → remove all beverages, add X
9. "Use pre-made mixes" → remove raw granular spices/dals and replace with a pre-made masala/mix (e.g. MTR Kadala Curry Mix)
10. "Cook from scratch" → remove pre-made mixes and add raw granular ingredients (spices, dals, etc.)

Return format (ALL keys must be present, even if array is empty):
{
  "add": [{"id": "new-id", "name": "Product Name", "brand": "Brand", "category": "snacks", "price": 90, "quantity": 2, "serving_size": 2, "ai_reasoning": "Added based on your request"}],
  "remove": ["product-id-1"],
  "modify": [{"id": "product-id-2", "quantity": 3}],
  "error": null
}

If you cannot understand the request, set error to a human-readable message and leave other arrays empty.
NEVER return anything except this JSON object. No markdown. No explanation.`;

export async function invokeModificationHandler(
  modificationText: string,
  currentCart: CartProduct[]
): Promise<CartDiff & { error?: string | null }> {
  const userMessage = JSON.stringify({
    modification: modificationText,
    current_cart: currentCart.map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      price: p.price,
      quantity: p.quantity,
      serving_size: p.serving_size,
      keywords: p.keywords,
    })),
  });

  try {
    const raw = await invokeAI(MODIFICATION_SYSTEM_PROMPT, userMessage, "flash", 1024);
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) {
      throw new Error("No JSON found");
    }
    const parsed = JSON.parse(cleaned.substring(start, end + 1));

    return {
      add: Array.isArray(parsed.add) ? parsed.add : [],
      remove: Array.isArray(parsed.remove) ? parsed.remove : [],
      modify: Array.isArray(parsed.modify) ? parsed.modify : [],
      error: parsed.error || null,
    };
  } catch (e) {
    console.error("[modification-handler] Failed:", e);
    return { add: [], remove: [], modify: [], error: "Could not process modification. Try rephrasing." };
  }
}
