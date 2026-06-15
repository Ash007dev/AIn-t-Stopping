import type { Product } from "@/lib/types";

export type ProductShelf =
  | "top"
  | "vegetables"
  | "fruits"
  | "dairy"
  | "drinks"
  | "oils"
  | "rice-dal"
  | "breakfast"
  | "chocolates"
  | "baby";

const NON_GROCERY =
  /\b(case|cover|decal|paint|clothes|clothing|outfit|legging|sweatshirt|shirt|blouse|tunic|knit|album|book|organizer|night light|candle|screen protector|watch|wedding decoration|romper|pants|vinyl|faucet|bathroom|basin|bath taps?|sink taps?|parachute oil|hair oil)\b/i;

const TOP_GROCERY =
  /\b(chips|snack|biscuit|cookie|chocolate|candy|milk|curd|yogurt|paneer|cheese|butter|egg|bread|rice|atta|flour|dal|lentil|oil|ghee|pepper|masala|spice|batter|oats|cereal|noodle|pasta|juice|cola|coffee|tea|diaper|baby wipes|onion|tomato|potato|carrot|banana|apple|orange|mango|coconut|dessert|halwa|baking soda|baking powder)\b/i;

const SHELF_PATTERNS: Record<Exclude<ProductShelf, "top">, RegExp> = {
  vegetables:
    /\b(onion|tomato|potato|carrot|cucumber|capsicum|spinach|coriander|chilli|garlic|ginger|cabbage|cauliflower|beans|okra|bhindi|brinjal|beetroot|radish|pumpkin|gourd|peas|corn|mushroom)\b/i,
  fruits:
    /\b(apple|banana|orange|mango|grape|watermelon|pineapple|papaya|guava|pomegranate|pear|kiwi|muskmelon|coconut|lemon|lime|avocado|dragon fruit|strawberry)\b/i,
  dairy:
    /\b(milk|curd|dahi|yogurt|paneer|cheese|butter|cream|egg|eggs|lassi|buttermilk)\b/i,
  drinks:
    /\b(juice|cola|pepsi|sprite|fanta|soda|soft drink|beverage|water|coffee|tea|shake|energy drink|coconut water)\b/i,
  oils:
    /\b(oil|ghee|olive oil|sunflower oil|mustard oil|groundnut oil|coconut oil)\b/i,
  "rice-dal":
    /\b(rice|basmati|dal|lentil|chana|rajma|moong|toor|urad|masoor|atta|flour|maida|sooji|rava|millet)\b/i,
  breakfast:
    /\b(oats|cereal|corn flakes|muesli|bread|jam|peanut butter|idli|dosa|appam|batter|poha|upma|noodle|pasta)\b/i,
  chocolates:
    /\b(chocolate|choco|cocoa|candy|toffee|wafer|brownie|truffle|fudge|dairy milk|kitkat|munch|perk|snickers)\b/i,
  baby:
    /\b(diaper|baby wipes|baby lotion|baby shampoo|baby soap|rash cream|feeding bottle|newborn|pampers|huggies|mamy poko|sebamed|johnson's baby|himalaya baby)\b/i,
};

const SHELF_EXCLUSIONS: Partial<Record<Exclude<ProductShelf, "top">, RegExp>> = {
  vegetables: /\b(essence|powder|masala|sauce|paste|chips|pickle|juice)\b/i,
  fruits: /\b(essence|paint|case|cover|syrup|flavour|powder|juice|candy)\b/i,
  dairy: /\b(batter|coconut milk|milk masala|milk powder|chocolate slab|egg curry masala|egg free)\b/i,
  drinks: /\b(powder|masala|night light|candy)\b/i,
  breakfast: /\b(masala only|pasta masala)\b/i,
  baby: /\b(baby corn|baby potato|baby clothes|baby girls|baby boys)\b/i,
};

function searchableText(product: Product): string {
  return [product.name, product.brand, ...(product.keywords || [])].join(" ").toLowerCase();
}

export function isGroceryProduct(product: Product): boolean {
  const text = searchableText(product);
  return Boolean(product.in_stock) && !NON_GROCERY.test(text);
}

export function isProductOnShelf(product: Product, shelf: Exclude<ProductShelf, "top">): boolean {
  if (!isGroceryProduct(product)) return false;

  const text = searchableText(product);
  const exclusion = SHELF_EXCLUSIONS[shelf];
  return SHELF_PATTERNS[shelf].test(text) && !(exclusion?.test(text) ?? false);
}

export function getProductsForShelf(
  products: Product[],
  shelf: ProductShelf,
  limit = 8
): Product[] {
  const valid = products.filter(isGroceryProduct);

  if (shelf === "top") {
    return valid
      .filter((product) => product.is_bestseller && TOP_GROCERY.test(searchableText(product)))
      .sort((a, b) => b.rating - a.rating || b.review_count - a.review_count)
      .slice(0, limit);
  }

  return valid
    .filter((product) => isProductOnShelf(product, shelf))
    .sort((a, b) => Number(b.is_bestseller) - Number(a.is_bestseller) || b.rating - a.rating)
    .slice(0, limit);
}
