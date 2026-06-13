// lib/agents/quantity-calibrator.ts
import { invokeGeminiAgent } from "./gemini-client";

export function calculateQuantity(personCount: number, servingSize: number): number {
  if (servingSize <= 0) { console.warn("[qty-cal] Invalid serving_size"); return 1; }
  return Math.ceil(personCount / servingSize);
}

export async function invokeQuantityCalibrator(
  personCount: number,
  products: { id: string; serving_size: number }[]
): Promise<{ id: string; quantity: number }[]> {
  const SYSTEM_PROMPT = `You are a quantity calculator. Given person_count and a list of products with serving_size, return a JSON array of { id, quantity } where quantity = Math.ceil(person_count / serving_size). Return ONLY valid JSON array. No other text.`;
  const userMessage = JSON.stringify({ person_count: personCount, products });
  try {
    const raw = await invokeGeminiAgent(SYSTEM_PROMPT, userMessage, "flash", 1024);
    const start = raw.indexOf('[');
    const end = raw.lastIndexOf(']');
    if (start === -1 || end === -1) {
      throw new Error(`No JSON object found in response: ${raw}`);
    }
    const cleaned = raw.substring(start, end + 1);
    return JSON.parse(cleaned);
  } catch {
    // Fallback to pure math
    return products.map((p) => ({ id: p.id, quantity: calculateQuantity(personCount, p.serving_size) }));
  }
}
