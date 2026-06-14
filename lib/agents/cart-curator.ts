// lib/agents/cart-curator.ts - AI-first dynamic product generation
import { ParsedIntent, Product, CartProduct, ProductCategory, AISuggestion } from "@/lib/types";
import { invokeAI } from "./gemini-client";
import Fuse from "fuse.js";

/**
 * Build the dynamic SYSTEM PROMPT based on mode.
 */
function buildSystemPrompt(mode: string, budget: number | null, region: string | null, dietary: string[]): string {
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

  return `You are a product curator for an Indian quick-commerce platform (Amazon Now / Amazon Fresh).
You receive a parsed shopping intent and your job is to decide what products should be in the cart.

CRITICAL: You are NOT limited to any predefined catalog. Use your knowledge of Indian grocery and
retail products to suggest the BEST products. Think like a knowledgeable Indian shopper.

You will receive the occasion, person_count, mode, and any dietary/exclusion constraints.

For each product you suggest, provide:
- A specific Indian brand name and product name. VERY IMPORTANT: You must pick realistic package sizes (e.g., 250g, 500g, 1L, 200ml) rather than defaulting to large sizes like 1kg for everything. (e.g., "Everest Turmeric Powder 100g", not "1kg").
- The category it belongs to
- A realistic Indian market price in ₹
- How many people ONE unit of this product serves
- Why this specific product was chosen

QUANTITY RULES (CRITICAL - follow these exactly):
- Calculate quantity as: Math.ceil(person_count / serving_size)
- If person_count = 3, serving_size = 4 → quantity = 1 (one pack is enough)
- If person_count = 10, serving_size = 2 → quantity = 5
- NEVER suggest more than 2 units of any single product unless it is a beverage/drink
- For drinks: 1 unit per person (serving_size = 1)
- For snacks: 1 pack per 2-3 people
- For ingredients: calculate based on recipe serving size
- For a party of 1-2 people: 3-4 products total (Exception: cooking mode allows up to 15)
- For a party of 5-8 people: 5-7 products total (Exception: cooking mode allows up to 18)
- For a party of 10-20 people: 6-9 products total (Exception: cooking mode allows up to 20)
- NEVER suggest more than 10 products outside of cooking mode. Cooking mode can suggest up to 20 granular ingredients.

OCCASION-SPECIFIC RULES:
- movie_night: 2-3 snack varieties + 1-2 drink varieties + optionally paper plates/cups. NO groceries, NO fresh produce unless explicitly asked.
- cooking (recipe): ONLY the ingredients needed for that specific recipe. For "aglio olio": spaghetti, olive oil, garlic, parmesan, chilli flakes, parsley. Nothing else.
- breakfast: Suggest 3-5 authentic breakfast items suitable for the specific region or request. Do NOT force idli/dosa unless requested.
- birthday_party: sweet snacks, soft drinks, chips, paper plates, possibly a cake mix
- baby_essentials: diapers (correct size), baby wipes, baby lotion, cotton, feeding essentials
- study_session: biscuits/cookies, 1-2 drinks (tea/coffee/energy drink), light snacks
- frictionless (addon): ONLY complementary products for the stated anchor product. If anchor = spaghetti, suggest: pasta sauce, olive oil, garlic, parmesan. 4-6 items max.

MODE-SPECIFIC BEHAVIOUR:

If mode = "intent" (Shopping by Intent):
- This is an OCCASION-based request (movie night, party, birthday, study session)
- Build a complete cart for the occasion - snacks, drinks, party supplies, whatever fits
- Group size determines quantities for ALL items
- Think like a human shopper who knows this occasion well

If mode = "cooking" (Cooking/Fresh):
- This is a RECIPE-based request (e.g., aglio olio, biryani, puttu)
- CRITICAL: Think like a chef. If the user asks for a specific pairing (like "Egg Roast", "Chicken Curry"), you MUST include the primary ingredients (Eggs, Chicken, Meat, etc.) and all raw vegetables, spices, and oils needed to cook it.
- List the RAW, GRANULAR ingredients needed to cook BOTH the main dish AND the accompaniments from scratch.
- DO NOT just suggest pre-made mixes unless requested. Suggest the actual vegetables, whole spices (mustard, bayleaf), dals, oils, curry leaves, etc., needed to cook it authentically.
- Do NOT add unrelated snacks or drinks unless explicitly requested. Quantities must be ingredient-appropriate.

If mode = "addon" (Frictionless Add-on):
- The user has ONE specific anchor product (the thing they just added to cart)
- CRITICAL FOR ADDON MODE:
  - You MUST include the anchor product itself as the FIRST item with "is_suggestion": false. Set its quantity to exactly 1 unless the user explicitly requested multiple. DO NOT scale the anchor product by person_count.
  - Suggest ONLY 3-5 complementary products that naturally go with it.
  - For all the complementary products you suggest, you MUST set "is_suggestion": true.
- Complementary means: used together, part of the same meal/occasion, or commonly bought together
- Do NOT suggest random popular items - ONLY directly complementary ones

${dietaryInstruction}

INDIAN PRODUCT KNOWLEDGE to use:
- Preferred brands: Amul, Britannia, Parle, MDH, Aachi, MTR, Nestle, Tata, iD Fresh, Everest,
  Lays, Doritos, Kurkure, Haldirams, Bikaji, Grand Sweets, Del Monte, Borges, Figaro,
  Mother Dairy, Nandini, Kaveri, Pampers, Huggies, Himalaya Baby, Johnsons Baby
- For South India (Chennai, Coimbatore, Bangalore, Hyderabad): prefer MTR, Aachi, iD Fresh, Grand Sweets
- For North India (Delhi, Lucknow, Jaipur): prefer Everest, Haldirams, Mother Dairy

SELECTION CRITERIA (hardcode this logic in ai_reasoning):
- ALWAYS prefer products with high review counts (>1000) and high ratings (>4.0)
- ALWAYS prefer bestselling products in each category
- State the reasoning clearly: "[Brand Name] [Product Name] chosen - #1 bestseller in [category], 4.7★
  from 18,000+ reviews. One pack serves 4 people, so 1 pack is ideal for 3 people."
${regionHint}${budgetInstruction}

Return ONLY a valid JSON array. No other text. No markdown. No explanation outside JSON.

JSON format:
[
  {
    "name": "Specific Authentic Ingredient or Product Name (with exact size e.g., 250g, 500g, 1L)",
    "brand": "Popular Regional Brand",
    "category": "category name",
    "suggested_price": 95,
    "serving_size": 4,
    "quantity": 1,
    "ai_reasoning": "This brand is the #1 bestseller. 4.7★ from 18,000+ reviews. 250g serves 3-4 people perfectly.",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "occasion_tags": ["occasion1", "occasion2"],
    "is_bestseller": true,
    "suggested_rating": 4.7,
    "suggested_review_count": 18000,
    "is_suggestion": false
  }
]`;
}

/**
 * Ask the AI to generate the ideal cart (not limited to catalog).
 */
async function invokeCartCuratorAI(
  parsed: ParsedIntent,
  budget: number | null,
  region: string | null,
  mode: string
): Promise<AISuggestion[]> {
  const systemPrompt = buildSystemPrompt(mode, budget, region, parsed.dietary || []);

  const userMessage = JSON.stringify({
    occasion: parsed.occasion,
    person_count: parsed.person_count,
    time_context: parsed.time_context,
    dietary: parsed.dietary,
    exclusions: parsed.exclusions,
    mode,
  });

  const raw = await invokeAI(systemPrompt, userMessage, "pro", 8192);

  // Extract JSON array
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start === -1 || end === -1) {
    throw new Error(`No JSON array found in AI response: ${raw.substring(0, 200)}`);
  }

  return JSON.parse(raw.substring(start, end + 1)) as AISuggestion[];
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
    eta_minutes: 18,
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
  mode: string = "intent"
): Promise<CartProduct[]> {
  // Step 1: AI generates what should be in the cart
  const aiSuggestions = await invokeCartCuratorAI(parsed, budget, region, mode);

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
