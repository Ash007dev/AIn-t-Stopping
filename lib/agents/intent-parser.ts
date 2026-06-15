// lib/agents/intent-parser.ts
import { ParsedIntent, HouseholdProfile } from "@/lib/types";
import { invokeAI, setAgentContext } from "./gemini-client";
import { parseLocalIntent } from "./local-generator";

export function resolvePersonCount(parsed: ParsedIntent, profileServingCount: number): number {
  if (parsed.person_count && parsed.person_count >= 1) return parsed.person_count;
  if (profileServingCount >= 1) return profileServingCount;
  return 1;
}

export function deduplicateDietary(arr: string[]): string[] {
  return Array.from(new Set(arr.map((s) => s.toLowerCase())));
}

export async function invokeIntentParser(intentText: string, profile: HouseholdProfile, imageBase64?: string | null): Promise<ParsedIntent> {
  if (!imageBase64) {
    return parseLocalIntent(intentText, profile);
  }

  const SYSTEM_PROMPT = `You are an intent parser for a grocery shopping app. Parse the user's shopping request and extract structured data.

Return ONLY valid JSON with exactly these fields:
{
  "occasion": string or null (e.g., "movie_night", "birthday", "cooking", "breakfast", "party"),
  "person_count": integer or null (number of people),
  "time_context": string or null (e.g., "morning", "evening", "tonight", "afternoon"),
  "dietary": array of strings (e.g., ["vegetarian", "no onion"]),
  "exclusions": array of strings (items to exclude),
  "mode_override": string or null (set ONLY when a predictive life-situation is detected),
  "clarifying_question": string or null (set ONLY when the intent is too vague to act on)
}

Rules:
- If person_count is not mentioned, use ${profile.servingCount || 1} as default.
- Convert occasion descriptions to snake_case tags (e.g., "movie night" → "movie_night").
- For cooking/recipe requests, set occasion to the EXACT FULL name of the dish/recipe requested. If the user asks for a pairing (e.g., "idiyappam and egg roast", "puttu and kadala curry"), PRESERVE THE ENTIRE PHRASE (e.g., "idiyappam and egg roast"). Do NOT truncate it to just the first word. Do NOT overwrite the user's request with the generic word "cooking".
- For single product requests (frictionless mode), set occasion to the EXACT product requested.
- Extract ALL dietary constraints mentioned.
- Do NOT include any text outside the JSON object.

IMAGE SCANNING RULES:
- If an image is provided, identify the dish, recipe, or grocery list shown in the image.
- Set the 'occasion' field to the name of the dish or the context of the list (e.g. "Pizza Recipe", "Grocery List").
- Ignore intentText if it just says "Create a recipe based on this image" and rely heavily on the visual context.

ADAPTIVE CLARIFYING QUESTIONS - set clarifying_question when:
- The request is dangerously vague (e.g., "I need medicine", "I need stuff", "buy things").
  → clarifying_question: "What symptoms are you experiencing? (e.g., fever, cold, headache)"
- The request is missing critical context (e.g., "party" without person count or type).
  → clarifying_question: "What type of party? How many guests?"
- The category is too broad (e.g., "I need groceries", "get me food").
  → clarifying_question: "What type of food? Are you cooking a specific dish or stocking up?"
- NOTE: If the intent is CLEAR ENOUGH to act on (e.g., "movie night for 5", "birthday party for 20 kids"), do NOT set clarifying_question. Only ask when genuinely ambiguous.

PREDICTIVE MODE DETECTION - set mode_override when these life situations are detected:
- If user mentions "new baby", "newborn", "just had a baby", "first baby" → occasion = "new_baby", mode_override = "predictive"
- If user mentions "new home", "moved in", "new house", "shifting" → occasion = "new_home", mode_override = "predictive"
- If user mentions "home office", "work from home setup", "WFH setup" → occasion = "home_office", mode_override = "predictive"
- If user mentions "someone sick", "fever", "cold", "ill at home" → occasion = "sick_person", mode_override = "predictive"
- If user mentions "college", "hostel", "first week of college" → occasion = "college_first_week", mode_override = "predictive"
- For all other requests, set mode_override to null.`;

  try {
    setAgentContext("intent-parser");
    const raw = await invokeAI(SYSTEM_PROMPT, intentText, "flash", 1024, imageBase64);
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
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : String(e);
    console.error("[invokeIntentParser] Error:", errMsg);
    return parseLocalIntent(intentText, profile);
  }
}
