// lib/agents/cart-curator.ts
import { ParsedIntent, Product } from "@/lib/types";
import { invokeGeminiAgent } from "./gemini-client";

export function filterAndSelectProducts(parsed: ParsedIntent, catalog: Product[]): Product[] {
  let filtered = catalog.filter((p) => p.in_stock);
  if (parsed.dietary.includes("vegetarian") || parsed.dietary.includes("jain")) {
    // Filter out non-veg keywords
    const nonVegKeywords = ["chicken", "mutton", "fish", "egg", "meat", "pork", "beef", "prawn", "shrimp"];
    filtered = filtered.filter((p) =>
      !p.keywords.some((k) => nonVegKeywords.includes(k.toLowerCase()))
    );
  }
  // Filter exclusions
  if (parsed.exclusions.length > 0) {
    filtered = filtered.filter((p) =>
      !p.keywords.some((k) => parsed.exclusions.includes(k.toLowerCase())) &&
      !p.occasion_tags.some((t) => parsed.exclusions.includes(t.toLowerCase()))
    );
  }
  return filtered;
}

export async function invokeCartCurator(
  parsed: ParsedIntent,
  catalog: Product[],
  budget: number | null,
  mode: string = "intent"
): Promise<{ id: string; ai_reasoning: string }[]> {
  let budgetInstruction = "";
  if (budget && budget > 0) {
    budgetInstruction = `\n\nIMPORTANT BUDGET CONSTRAINT: The total cart price must not exceed ₹${budget}. Prioritise lower-priced products that meet quality thresholds.`;
  }

  const modeInstruction = mode === "addon" 
    ? "CRITICAL RULE: Select the requested product and ONLY 1-2 HIGHLY relevant complementary items (e.g. if noodles, select soy sauce or ketchup). Do NOT select random items just to fill space. If there are no obvious complements, return ONLY the requested product. Zero tolerance for unrelated items like batters or powders for a noodle request."
    : "- Select 3-15 products that perfectly match the occasion/intent.";

  const SYSTEM_PROMPT = `You are a smart shopping cart curator for an Indian grocery delivery app. Given a parsed shopping intent and a product catalog, select the most relevant products.

Return ONLY a valid JSON array of objects with { "id": string, "ai_reasoning": string }.

Rules:
${modeInstruction}
- Only select products where in_stock is true
- Prefer bestsellers and higher-rated products
- Include a mix of categories appropriate for the occasion
- ai_reasoning should be a brief explanation (max 160 chars) of why this product was selected
- Match products by occasion_tags, keywords, and category relevance
- For cooking/recipe intents, select ingredients needed for the dish
- Do NOT include any text outside the JSON array${budgetInstruction}`;

  const catalogSummary = catalog
    .filter((p) => p.in_stock)
    .map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      rating: p.rating,
      is_bestseller: p.is_bestseller,
      occasion_tags: p.occasion_tags,
      keywords: p.keywords,
      serving_size: p.serving_size,
    }));

  const userMessage = JSON.stringify({
    intent: parsed,
    catalog: catalogSummary,
    budget,
  });

  try {
    const raw = await invokeGeminiAgent(SYSTEM_PROMPT, userMessage, "pro", 2048);
    const start = raw.indexOf('[');
    const end = raw.lastIndexOf(']');
    if (start !== -1 && end !== -1) {
      return JSON.parse(raw.substring(start, end + 1));
    }
    throw new Error(`No JSON array found in response: ${raw}`);
  } catch (e: any) {
    console.error("[invokeCartCurator] JSON parse error:", e.message || e);
    return [];
  }
}
