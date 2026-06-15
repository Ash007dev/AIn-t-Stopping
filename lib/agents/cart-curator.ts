// lib/agents/cart-curator.ts - AI-first dynamic product generation
import { ParsedIntent, Product, CartProduct, ProductCategory, AISuggestion } from "@/lib/types";
import { invokeAI, setAgentContext } from "./gemini-client";
import Fuse from "fuse.js";
import { getMemoryContext } from "@/lib/user-memory";
import { buildLocalSuggestions } from "./local-generator";

/**
 * Build the dynamic SYSTEM PROMPT based on mode.
 */
function buildSystemPrompt(mode: string, budget: number | null, region: string | null, dietary: string[], hasImage: boolean): string {
  let budgetInstruction = "";
  if (budget && budget > 0) {
    budgetInstruction = `\n\nIMPORTANT BUDGET CONSTRAINT: The total cart price must not exceed ₹${budget}. Prioritise lower-priced products that meet quality thresholds.`;
  }

  let regionHint = "";
  if (region) {
    regionHint = `\nThe customer is located in ${region}. Prefer regionally popular brands when relevant.`;
  }
  
  let dietaryInstruction = "";
  if (dietary.includes("Vegetarian") || dietary.includes("vegetarian")) {
    dietaryInstruction = `\nDIETARY RULES:\n- vegetarian: MUST exclude chicken, fish, meat, eggs, gelatin-containing products. DO NOT INCLUDE EGGS OR MEAT.`;
  } else if (dietary.includes("Jain") || dietary.includes("jain")) {
    dietaryInstruction = `\nDIETARY RULES:\n- jain: MUST exclude chicken, fish, meat, eggs, onion, garlic, potatoes, root vegetables.`;
  }

  return `You are a product curator for Amazon Now, an Indian quick-commerce platform.
Your job is to build a cart that gets delivered in 10-20 minutes from a nearby dark store.

CRITICAL RULES - FOLLOW EXACTLY:

0. IMAGE SCANNING RULES:
   ${hasImage ? '- AN IMAGE HAS BEEN PROVIDED. Extract all necessary ingredients, items, or products shown in the image or required to make the dish shown in the image.\n   - Base your generated cart heavily on the visual context.' : '- No image provided.'}

1. PRODUCT SCOPE: You are NOT limited to any catalog. Use your knowledge of real Indian
   retail brands. Name specific products: "Amul Taza Milk 500ml" not just "milk".
   "Borges Spaghetti 500g" not "pasta". Be precise. Customers recognize real brands.

2. QUANTITY RULES (non-negotiable):
   - Calculate: Math.ceil(person_count / serving_size) = quantity
   - A 500ml milk serves 2 people → for 1 person: 1 unit. For 3 people: 2 units.
   - A 500g pasta serves 4 → for 3 people: 1 unit. For 5 people: 2 units.
   - A 500ml Pepsi serves 1 → for 5 people: 5 units.
   - NEVER exceed 2 units for any ingredient/food item unless it is a per-person drink.
   - Total cart size: 1-2 people → 3-4 products. 3-5 people → 5-6 products.
     6-10 people → 6-8 products. 10+ people → 7-10 products. HARD CAP at 10.

3. PACKAGING SIZES - use realistic Indian retail sizes:
   - Oil: 500ml or 1L (not 5L for quick commerce)
   - Milk: 500ml or 1L (not 5L)
   - Pasta/Rice: 500g or 1kg max
   - Spices: 50g-100g sachets (not 500g bulk)
   - Bread: 400g loaf
   - Butter: 100g or 200g

4. REPLENISHABLE GOODS - these are the core of quick commerce:
   Milk, bread, eggs, butter, cooking oil, salt, sugar, tea/coffee, onion, tomato,
   lemon, green chillies, coriander, phone chargers, power banks, hand sanitizer,
   toilet paper, dishwash liquid, detergent pods - know the common replenishables.
   When the occasion suggests a replenishable (morning routine, cooking, cleaning),
   prefer well-known high-velocity brands that people actually reorder.

5. MODE-SPECIFIC BEHAVIOUR:
${dietaryInstruction}

   MODE = "intent" (Shopping by Occasion):
   - Occasion-first thinking. Movie night → snacks + drinks ONLY (no random groceries).
   - Birthday party for kids → sweet snacks + soft drinks + paper plates/cups.
   - Study session → tea/coffee + light snacks + glucose biscuits.
   - DO NOT add unrelated items. Stay within the occasion's scope.

   MODE = "cooking" (Recipe/Fresh):
   - List ONLY ingredients for the EXACT stated recipe. Nothing else.
   - If the user specifies a pairing (e.g., "Idiyappam and Kadala Curry"), you MUST provide ingredients for BOTH items (e.g., rice flour, black chickpeas, coconut milk, curry leaves, spices). DO NOT ignore the second item.
   - DO NOT hallucinate default accompaniments (like sambar or chutney) unless the user specifically asks for a generic dish like "Idli" without specifying a side.
   - "Aglio olio for 3" → spaghetti 500g, olive oil 500ml, garlic 250g, parmesan 100g, red chilli flakes 50g.
   - DO NOT add drinks, snacks, or anything not needed for the recipe.

   MODE = "addon" (Frictionless):
   - User has ONE anchor product already in cart.
   - Suggest ONLY 4-5 products that are directly complementary.
   - Spaghetti → pasta sauce, olive oil, garlic, parmesan, basil
   - Diapers → baby wipes, diaper rash cream, cotton balls, baby powder
   - Bread → butter, eggs, jam, cheese slices
   - Phone charger → cable tie organizer, power bank, screen protector
   - Tags: set is_suggestion: true on ALL add-on suggestions (not the anchor)

   MODE = "predictive" (Predictive & Confident):
   - You receive a life situation, not an occasion.
   - Be CONFIDENT and PRESCRIPTIVE. The customer does not know what they need.
   - Explain each product in the reasoning: "You will use this every 2-3 hours."
   - Do NOT hedge. Do NOT say "you might want". Say "you need this."
   - Situations and their essentials:
     * "new_baby": Pampers NB diapers 44ct, WaterWipes 60ct, Himalaya Baby Lotion 100ml,
       Johnsons Baby Soap, Johnsons Baby Shampoo, Mamaearth Rash Cream, Cotton Balls 100ct,
       Himalaya Nipple Cream (if breastfeeding), Mee Mee Feeding Bottle 150ml.
       For newborn: NO food products. Only care essentials.
     * "new_home": Vim Dishwash Liquid 500ml, Harpic 500ml, Colin 500ml, Dettol Handwash 250ml,
       Scotch-Brite Scrub Pad 2-pack, Amul Butter 100g, Tata Salt 1kg, Saffola Oil 1L,
       Aashirvaad Atta 1kg, Britannia Bread 400g, Tata Tea 250g.
     * "home_office": Portronics Adaptor, boAt 65W Charger, Mobell Laptop Stand, Blue-Tack
       Adhesive, Dettol Sanitizer 200ml, Britannia Milk Bikis 250g, Nescafe Sachets 10-pack.
     * "sick_person": Nimulid MD Paracetamol 500mg 10-tab, Vicks VapoRub 50g, Strepsils 24-count,
       Dabur Honey 250g, Brooke Bond Tulsi Tea 25 bags, Electral Powder 4-pack, Dettol Soap 2-pack.
       NOTE: Always add disclaimer - "Consult a doctor. These are common OTC comfort items."
     * "college_first_week": Dettol Handwash, Britannia Bread, Amul Butter, Maggi 12-pack,
       Parle-G 800g, Nescafe Classic 50g jar, Colgate 150g, Dove Shampoo 340ml, Harpic 500ml.

6. AI REASONING FORMAT (for every product - this appears in the "Why this?" section):
   Format: "[Brand] chosen - [ranking/review stat]. [serving info]. [why for this occasion]."
   Example: "Amul Taza 500ml chosen - #1 selling milk brand, 4.6 stars from 45,000+ reviews.
   One 500ml pack is the right size for 1-2 people's morning tea. Essential for your breakfast kit."

7. DARK STORE ASSIGNMENT:
   Add a "dark_store" field to each product. Assign realistically:
   - Products with eta_minutes 10-15 → "DS-North" (1.2km away)
   - Products with eta_minutes 16-22 → "DS-Central" (2.8km away)
   - Products with eta_minutes 23-30 → "DS-East" (4.1km away)
   Most products in a cart should come from the same dark store.
   Occasionally (for 1 product) use a different dark store to show multi-store sourcing.

8. RETURN POLICY:
   Add "return_policy" field to each product:
   - Fresh produce, dairy, bread, eggs, idli batter → "no_return"
   - Packaged food, snacks, beverages → "7_day_return"
   - Electronics, chargers, cables → "7_day_return"
   - Baby care, personal care → "7_day_return"
   - Medicines → "no_return"
${regionHint}${budgetInstruction}

Return ONLY a valid JSON array. No markdown. No explanation. No trailing commas.
${getMemoryContext()}

JSON format per product:
{
  "name": "Amul Taza Homogenised Milk 500ml",
  "brand": "Amul",
  "category": "dairy",
  "suggested_price": 29,
  "serving_size": 2,
  "quantity": 1,
  "ai_reasoning": "Amul Taza chosen - #1 milk brand in India, 4.7 stars from 45,000+ reviews. 500ml is the right size for 1-2 people. Core breakfast essential.",
  "keywords": ["milk", "dairy", "taza", "amul", "breakfast"],
  "occasion_tags": ["breakfast", "cooking", "morning"],
  "is_bestseller": true,
  "suggested_rating": 4.7,
  "suggested_review_count": 45000,
  "is_suggestion": false,
  "dark_store": "DS-North",
  "return_policy": "no_return"
}`;
}

/**
 * Ask the AI to generate the ideal cart (not limited to catalog).
 */
async function invokeCartCuratorAI(
  parsed: ParsedIntent,
  budget: number | null,
  region: string | null,
  mode: string,
  imageBase64?: string | null
): Promise<AISuggestion[]> {
  if (!imageBase64) {
    return buildLocalSuggestions(parsed, mode);
  }

  const systemPrompt = buildSystemPrompt(mode, budget, region, parsed.dietary || [], !!imageBase64);

  const userMessage = JSON.stringify({
    occasion: parsed.occasion,
    person_count: parsed.person_count,
    time_context: parsed.time_context,
    dietary: parsed.dietary,
    exclusions: parsed.exclusions,
    mode,
  });

  setAgentContext("cart-curator");
  let raw: string;
  try {
    raw = await invokeAI(systemPrompt, userMessage, "pro", 8192, imageBase64);
  } catch (error) {
    console.error("[cart-curator] Vision generation failed, using local cart fallback", error);
    return buildLocalSuggestions(parsed, mode);
  }

  // Extract JSON array
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start === -1 || end === -1) {
    throw new Error(`No JSON array found in AI response: ${raw.substring(0, 200)}`);
  }

  const suggestions = JSON.parse(raw.substring(start, end + 1)) as unknown;
  if (!Array.isArray(suggestions)) {
    throw new Error("AI response was valid JSON but not a product array.");
  }

  return suggestions as AISuggestion[];
}

/**
 * Fuzzy-match an AI suggestion against the static catalog.
 */
function findBestCatalogMatch(
  suggestionName: string,
  suggestionBrand: string,
  fuse: Fuse<Product>
): Product | null {
  const results = fuse.search(`${suggestionBrand} ${suggestionName}`);
  if (results.length > 0 && results[0].score !== undefined && results[0].score < 0.2) {
    return results[0].item;
  }
  return null;
}

/**
 * Create a dynamic product from an AI suggestion when no catalog match exists.
 */
function createDynamicProduct(suggestion: AISuggestion): CartProduct {
  const id = `dynamic-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  // Derive ETA from dark store assignment
  const storeEtaMap: Record<string, number> = { "DS-North": 12, "DS-Central": 18, "DS-East": 24 };
  const eta = storeEtaMap[suggestion.dark_store || "DS-Central"] || 18;
  return {
    id,
    name: suggestion.name,
    brand: suggestion.brand,
    category: suggestion.category as ProductCategory,
    price: suggestion.suggested_price,
    rating: suggestion.suggested_rating || 4.4,
    review_count: suggestion.suggested_review_count || 2500,
    is_bestseller: suggestion.is_bestseller || false,
    serving_size: suggestion.serving_size,
    image_url: "/placeholder-product.png",
    occasion_tags: suggestion.occasion_tags || [],
    region_tags: [],
    in_stock: true,
    eta_minutes: eta,
    expiry_months: null,
    keywords: suggestion.keywords || [],
    sample_reviews: [
      { author: "Verified Customer", text: "Great product, exactly what I needed." },
      { author: "Frequent Buyer", text: "Good quality, fast delivery." },
    ],
    quantity: suggestion.quantity,
    ai_reasoning: suggestion.ai_reasoning,
    alternatives: [],
    is_suggestion: suggestion.is_suggestion,
    dark_store: suggestion.dark_store || "DS-Central",
    return_policy: suggestion.return_policy || "7_day_return",
  };
}

/**
 * Main entry point: AI generates ideal cart → fuzzy-match to catalog → dynamic fallback.
 */
export async function buildDynamicCart(
  parsed: ParsedIntent,
  catalog: Product[],
  budget: number | null,
  region: string | null,
  mode: string = "intent",
  imageBase64?: string | null
): Promise<CartProduct[]> {
  // Step 1: AI generates what should be in the cart
  const aiSuggestions = await invokeCartCuratorAI(parsed, budget, region, mode, imageBase64);

  if (!aiSuggestions || aiSuggestions.length === 0) {
    return [];
  }

  // Optimize: Create Fuse instance ONCE instead of inside the loop
  const fuse = new Fuse(catalog.filter(p => p.in_stock), {
    keys: [
      { name: "name", weight: 0.5 },
      { name: "brand", weight: 0.3 },
      { name: "keywords", weight: 0.2 },
    ],
    threshold: 0.2,
    includeScore: true,
  });

  // Step 2: For each AI suggestion, try to match to catalog
  const results: CartProduct[] = [];

  for (const suggestion of aiSuggestions) {
    const catalogMatch = findBestCatalogMatch(
      suggestion.name,
      suggestion.brand,
      fuse
    );

    if (catalogMatch) {
      // Check if we already have this product in results
      const existingIdx = results.findIndex((r) => r.id === catalogMatch.id);
      if (existingIdx >= 0) {
        results[existingIdx].quantity += suggestion.quantity;
        // Keep it as a suggestion if all merged versions are suggestions
        if (!suggestion.is_suggestion) {
          results[existingIdx].is_suggestion = false;
        }
      } else {
        const alternatives = catalog
          .filter((p) => p.category === catalogMatch.category && p.id !== catalogMatch.id && p.in_stock)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 2);

        results.push({
          ...catalogMatch,
          quantity: suggestion.quantity,
          ai_reasoning: suggestion.ai_reasoning,
          alternatives,
          is_suggestion: suggestion.is_suggestion,
        });
      }
    } else {
      // No catalog match - create a dynamic product from AI knowledge
      const newProduct = createDynamicProduct(suggestion);
      results.push(newProduct);
    }
  }

  return results;
}
