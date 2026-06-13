// lib/agents/modification-handler.ts
import { CartProduct, CartDiff } from "@/lib/types";
import { invokeGeminiAgent } from "./gemini-client";
import { loadCatalog } from "@/lib/catalog";

export async function invokeModificationHandler(
  modificationText: string,
  currentCart: CartProduct[]
): Promise<CartDiff> {
  const catalog = loadCatalog();

  const SYSTEM_PROMPT = `You are a cart modification handler for a grocery shopping app. Given the current cart and a modification request, return a JSON diff object.

Return ONLY valid JSON with this exact structure:
{
  "add": [{ "product": { full product object from catalog }, "quantity": number }],
  "remove": ["product_id_to_remove"],
  "modify": [{ "id": "product_id", "quantity": new_quantity }]
}

Rules:
- For "remove X": add the product ID to the remove array
- For "add X": find the best matching product from the catalog sample and add it
- For "change quantity": use the modify array
- For "make it vegetarian": remove non-veg items
- For "add N more people": increase quantities proportionally
- Keep arrays empty if no changes of that type are needed
- Do NOT include any text outside the JSON object`;

  const userMessage = JSON.stringify({
    modification: modificationText,
    currentCart: currentCart.map((p) => ({
      id: p.id,
      name: p.name,
      quantity: p.quantity,
      price: p.price,
      category: p.category,
      keywords: p.keywords,
    })),
    catalogSample: catalog.slice(0, 50).map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      keywords: p.keywords,
      occasion_tags: p.occasion_tags,
      in_stock: p.in_stock,
    })),
  });

  try {
    const raw = await invokeGeminiAgent(SYSTEM_PROMPT, userMessage, "flash", 1024);
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start === -1 || end === -1) {
      throw new Error(`No JSON object found in response: ${raw}`);
    }
    const cleaned = raw.substring(start, end + 1);
    const parsed = JSON.parse(cleaned);
    
    return {
      diff: {
        remove: parsed.diff.remove || [],
        modify: parsed.diff.modify || [],
        add: [],
      },
      new_intent: parsed.new_intent,
    };
  } catch (e: any) {
    console.error("[invokeModificationHandler] JSON parse error:", e.message || e);
    return null;
  }
}
