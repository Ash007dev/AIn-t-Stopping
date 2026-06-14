// lib/agents/intent-parser.ts
import { ParsedIntent, HouseholdProfile } from "@/lib/types";
import { invokeAI } from "./gemini-client";

export function resolvePersonCount(parsed: ParsedIntent, profileServingCount: number): number {
  if (parsed.person_count && parsed.person_count >= 1) return parsed.person_count;
  if (profileServingCount >= 1) return profileServingCount;
  return 1;
}

export function deduplicateDietary(arr: string[]): string[] {
  return Array.from(new Set(arr.map((s) => s.toLowerCase())));
}

export async function invokeIntentParser(intentText: string, profile: HouseholdProfile): Promise<ParsedIntent> {
  const SYSTEM_PROMPT = `You are an intent parser for a grocery shopping app. Parse the user's shopping request and extract structured data.

Return ONLY valid JSON with exactly these fields:
{
  "occasion": string or null (e.g., "movie_night", "birthday", "cooking", "breakfast", "party"),
  "person_count": integer or null (number of people),
  "time_context": string or null (e.g., "morning", "evening", "tonight", "afternoon"),
  "dietary": array of strings (e.g., ["vegetarian", "no onion"]),
  "exclusions": array of strings (items to exclude)
}

Rules:
- If person_count is not mentioned, use ${profile.servingCount || 1} as default.
- Convert occasion descriptions to snake_case tags (e.g., "movie night" → "movie_night").
- For cooking/recipe requests, set occasion to the EXACT FULL name of the dish/recipe requested. If the user asks for a pairing (e.g., "idiyappam and egg roast", "puttu and kadala curry"), PRESERVE THE ENTIRE PHRASE (e.g., "idiyappam and egg roast"). Do NOT truncate it to just the first word. Do NOT overwrite the user's request with the generic word "cooking".
- For single product requests (frictionless mode), set occasion to the EXACT product requested.
- Extract ALL dietary constraints mentioned.
- Do NOT include any text outside the JSON object.`;

  try {
    const raw = await invokeAI(SYSTEM_PROMPT, intentText, "flash", 1024);
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start === -1 || end === -1) {
      throw new Error(`No JSON object found in response: ${raw}`);
    }
    const cleaned = raw.substring(start, end + 1);
    const parsed = JSON.parse(cleaned) as ParsedIntent;
    return {
      ...parsed,
      person_count: resolvePersonCount(parsed, profile.servingCount),
      dietary: deduplicateDietary([
        ...(parsed.dietary || []),
        profile.dietary || "No restriction"
      ]),
    };
  } catch (e: any) {
    console.error("[invokeIntentParser] Error:", e.message || e);
    return {
      occasion: null,
      person_count: profile.servingCount || 1,
      time_context: null,
      dietary: [],
      exclusions: [],
      error: "Parse failed: " + (e.message || "Unknown error"),
    };
  }
}
