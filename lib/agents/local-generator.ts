import type { AISuggestion, HouseholdProfile, ParsedIntent, ProductCategory } from "@/lib/types";

interface LocalItem {
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  servingSize: number;
  keywords: string[];
  returnPolicy?: string;
}

const item = (
  name: string,
  brand: string,
  category: ProductCategory,
  price: number,
  servingSize: number,
  keywords: string[],
  returnPolicy?: string
): LocalItem => ({ name, brand, category, price, servingSize, keywords, returnPolicy });

const RECIPE_SETS: Array<{ matches: string[]; items: LocalItem[] }> = [
  {
    matches: ["appam", "egg roast"],
    items: [
      item("Double Horse Appam Powder 500g", "Double Horse", "pantry staples", 65, 4, ["appam", "rice flour"]),
      item("Suguna Farm Fresh Eggs 6-pack", "Suguna", "dairy", 55, 3, ["eggs", "egg roast"], "no_return"),
      item("Fresh Onions 500g", "Fresh", "fresh produce", 35, 4, ["onion"], "no_return"),
      item("Fresh Tomatoes 500g", "Fresh", "fresh produce", 40, 4, ["tomato"], "no_return"),
      item("Dabur Hommade Coconut Milk 200ml", "Dabur", "pantry staples", 60, 3, ["coconut milk"]),
      item("Fresh Curry Leaves 50g", "Fresh", "fresh produce", 15, 4, ["curry leaves"], "no_return"),
      item("Eastern Garam Masala 100g", "Eastern", "pantry staples", 72, 8, ["garam masala", "spices"]),
    ],
  },
  {
    matches: ["idiyappam", "kadala"],
    items: [
      item("Double Horse Idiyappam Powder 500g", "Double Horse", "pantry staples", 68, 4, ["idiyappam", "rice flour"]),
      item("Tata Sampann Kala Chana 500g", "Tata Sampann", "pantry staples", 92, 5, ["black chickpeas", "kadala"]),
      item("Dabur Hommade Coconut Milk 200ml", "Dabur", "pantry staples", 60, 3, ["coconut milk"]),
      item("Fresh Onions 500g", "Fresh", "fresh produce", 35, 4, ["onion"], "no_return"),
      item("Fresh Tomatoes 500g", "Fresh", "fresh produce", 40, 4, ["tomato"], "no_return"),
      item("Fresh Curry Leaves 50g", "Fresh", "fresh produce", 15, 4, ["curry leaves"], "no_return"),
      item("Eastern Coriander Powder 100g", "Eastern", "pantry staples", 48, 8, ["coriander powder", "spices"]),
    ],
  },
  {
    matches: ["aglio", "olio"],
    items: [
      item("Barilla Spaghetti 500g", "Barilla", "pantry staples", 195, 4, ["spaghetti", "pasta"]),
      item("Borges Extra Virgin Olive Oil 500ml", "Borges", "pantry staples", 499, 8, ["olive oil"]),
      item("Fresh Garlic 250g", "Fresh", "fresh produce", 55, 6, ["garlic"], "no_return"),
      item("Amul Parmesan Cheese 100g", "Amul", "dairy", 210, 4, ["parmesan", "cheese"], "no_return"),
      item("Keya Red Chilli Flakes 40g", "Keya", "pantry staples", 85, 8, ["chilli flakes"]),
    ],
  },
  {
    matches: ["chicken biryani", "biryani"],
    items: [
      item("India Gate Basmati Rice 1kg", "India Gate", "pantry staples", 175, 6, ["basmati rice", "biryani"]),
      item("Fresh Chicken Curry Cut 500g", "Fresh", "fresh produce", 220, 4, ["chicken"], "no_return"),
      item("Amul Masti Dahi 400g", "Amul", "dairy", 48, 4, ["curd", "yogurt"], "no_return"),
      item("Fresh Onions 1kg", "Fresh", "fresh produce", 65, 6, ["onion"], "no_return"),
      item("Fresh Mint Leaves 100g", "Fresh", "fresh produce", 25, 5, ["mint"], "no_return"),
      item("Everest Shahi Biryani Masala 50g", "Everest", "pantry staples", 70, 6, ["biryani masala"]),
    ],
  },
  {
    matches: ["masala dosa", "dosa"],
    items: [
      item("iD Fresh Idli and Dosa Batter 1kg", "iD Fresh", "dairy", 95, 5, ["dosa", "batter"], "no_return"),
      item("Fresh Potatoes 1kg", "Fresh", "fresh produce", 45, 6, ["potato"], "no_return"),
      item("Fresh Onions 500g", "Fresh", "fresh produce", 35, 4, ["onion"], "no_return"),
      item("Fresh Curry Leaves 50g", "Fresh", "fresh produce", 15, 4, ["curry leaves"], "no_return"),
      item("Tata Sampann Mustard Seeds 100g", "Tata Sampann", "pantry staples", 38, 10, ["mustard seeds"]),
    ],
  },
  {
    matches: ["paneer butter masala", "paneer"],
    items: [
      item("Amul Fresh Paneer 200g", "Amul", "dairy", 95, 3, ["paneer"], "no_return"),
      item("Fresh Tomatoes 500g", "Fresh", "fresh produce", 40, 4, ["tomato"], "no_return"),
      item("Amul Fresh Cream 250ml", "Amul", "dairy", 75, 5, ["cream"], "no_return"),
      item("Amul Butter 100g", "Amul", "dairy", 62, 5, ["butter"], "no_return"),
      item("Everest Kitchen King Masala 100g", "Everest", "pantry staples", 82, 8, ["masala", "spices"]),
    ],
  },
  {
    matches: ["homemade pizza", "pizza"],
    items: [
      item("Weikfield Pizza Base Mix 500g", "Weikfield", "pantry staples", 125, 4, ["pizza base", "flour"]),
      item("Veeba Pizza Pasta Sauce 310g", "Veeba", "pantry staples", 135, 4, ["pizza sauce"]),
      item("Amul Diced Mozzarella 200g", "Amul", "dairy", 145, 4, ["mozzarella", "cheese"], "no_return"),
      item("Fresh Capsicum 500g", "Fresh", "fresh produce", 65, 5, ["capsicum"], "no_return"),
      item("Fresh Onions 500g", "Fresh", "fresh produce", 35, 4, ["onion"], "no_return"),
    ],
  },
  {
    matches: ["dal tadka", "dal"],
    items: [
      item("Tata Sampann Toor Dal 500g", "Tata Sampann", "pantry staples", 105, 6, ["toor dal", "lentils"]),
      item("Fresh Tomatoes 500g", "Fresh", "fresh produce", 40, 4, ["tomato"], "no_return"),
      item("Fresh Garlic 250g", "Fresh", "fresh produce", 55, 6, ["garlic"], "no_return"),
      item("Amul Cow Ghee 200ml", "Amul", "pantry staples", 175, 8, ["ghee"]),
      item("Everest Cumin Seeds 100g", "Everest", "pantry staples", 62, 10, ["cumin", "jeera"]),
    ],
  },
  {
    matches: ["chole bhature", "chole"],
    items: [
      item("Tata Sampann Kabuli Chana 500g", "Tata Sampann", "pantry staples", 115, 5, ["chickpeas", "chole"]),
      item("Aashirvaad Maida 1kg", "Aashirvaad", "pantry staples", 68, 8, ["maida", "flour"]),
      item("Amul Masti Dahi 400g", "Amul", "dairy", 48, 4, ["curd"], "no_return"),
      item("Fresh Onions 500g", "Fresh", "fresh produce", 35, 4, ["onion"], "no_return"),
      item("Everest Chhole Masala 100g", "Everest", "pantry staples", 78, 8, ["chole masala"]),
    ],
  },
  {
    matches: ["egg fried rice", "fried rice"],
    items: [
      item("India Gate Basmati Rice 1kg", "India Gate", "pantry staples", 175, 6, ["rice"]),
      item("Suguna Farm Fresh Eggs 6-pack", "Suguna", "dairy", 55, 3, ["eggs"], "no_return"),
      item("Fresh Mixed Vegetables 500g", "Fresh", "fresh produce", 85, 4, ["mixed vegetables"], "no_return"),
      item("Ching's Dark Soy Sauce 200g", "Ching's", "pantry staples", 65, 6, ["soy sauce"]),
      item("Fresh Spring Onion 100g", "Fresh", "fresh produce", 28, 4, ["spring onion"], "no_return"),
    ],
  },
  {
    matches: ["butter chicken"],
    items: [
      item("Fresh Chicken Curry Cut 500g", "Fresh", "fresh produce", 220, 4, ["chicken"], "no_return"),
      item("Amul Butter 100g", "Amul", "dairy", 62, 5, ["butter"], "no_return"),
      item("Amul Fresh Cream 250ml", "Amul", "dairy", 75, 5, ["cream"], "no_return"),
      item("Fresh Tomatoes 500g", "Fresh", "fresh produce", 40, 4, ["tomato"], "no_return"),
      item("Everest Chicken Masala 100g", "Everest", "pantry staples", 85, 6, ["chicken masala"]),
    ],
  },
  {
    matches: ["quick lunch"],
    items: [
      item("India Gate Basmati Rice 1kg", "India Gate", "pantry staples", 175, 6, ["rice"]),
      item("Tata Sampann Toor Dal 500g", "Tata Sampann", "pantry staples", 105, 6, ["dal"]),
      item("Fresh Mixed Vegetables 500g", "Fresh", "fresh produce", 85, 4, ["vegetables"], "no_return"),
      item("Amul Masti Dahi 400g", "Amul", "dairy", 48, 4, ["curd"], "no_return"),
    ],
  },
];

const INTENT_SETS: Array<{ matches: string[]; items: LocalItem[] }> = [
  {
    matches: ["movie", "game night"],
    items: [
      item("ACT II Butter Popcorn 3-pack", "ACT II", "snacks", 105, 3, ["popcorn", "movie"]),
      item("Doritos Nacho Cheese Chips 140g", "Doritos", "snacks", 90, 3, ["chips", "nachos"]),
      item("Coca-Cola 750ml", "Coca-Cola", "beverages", 45, 2, ["cola", "drink"]),
      item("Haldiram's Aloo Bhujia 200g", "Haldiram's", "snacks", 65, 3, ["namkeen", "snack"]),
      item("Cadbury Dairy Milk 126g", "Cadbury", "snacks", 110, 3, ["chocolate"]),
    ],
  },
  {
    matches: ["breakfast", "morning"],
    items: [
      item("Amul Taza Milk 500ml", "Amul", "dairy", 29, 2, ["milk"], "no_return"),
      item("Britannia Whole Wheat Bread 400g", "Britannia", "pantry staples", 48, 3, ["bread"], "no_return"),
      item("Suguna Farm Fresh Eggs 6-pack", "Suguna", "dairy", 55, 3, ["eggs"], "no_return"),
      item("Amul Butter 100g", "Amul", "dairy", 62, 5, ["butter"], "no_return"),
      item("Tata Tea Premium 250g", "Tata Tea", "beverages", 130, 12, ["tea"]),
      item("Kellogg's Corn Flakes 475g", "Kellogg's", "pantry staples", 210, 6, ["cereal"]),
    ],
  },
  {
    matches: ["diwali", "puja", "festival"],
    items: [
      item("Haldiram's Soan Papdi 500g", "Haldiram's", "snacks", 180, 8, ["sweets", "diwali"]),
      item("Haldiram's Kaju Katli 250g", "Haldiram's", "snacks", 310, 6, ["mithai", "kaju katli"]),
      item("Bikano Navratan Mixture 400g", "Bikano", "snacks", 145, 8, ["namkeen"]),
      item("Coca-Cola 2.25L", "Coca-Cola", "beverages", 105, 7, ["soft drink"]),
      item("Amazon Brand Paper Cups 50-pack", "Amazon Brand", "cleaning supplies", 120, 20, ["paper cups"]),
      item("Phool Puja Diyas 20-pack", "Phool", "cleaning supplies", 160, 20, ["diya", "puja"]),
    ],
  },
  {
    matches: ["birthday", "kids party", "party"],
    items: [
      item("Britannia Chocolate Cake 300g", "Britannia", "snacks", 160, 6, ["cake"]),
      item("Lays India's Magic Masala 140g", "Lays", "snacks", 80, 3, ["chips"]),
      item("Coca-Cola 2.25L", "Coca-Cola", "beverages", 105, 7, ["soft drink"]),
      item("Real Mixed Fruit Juice 1L", "Real", "beverages", 125, 5, ["juice"]),
      item("Amazon Brand Paper Plates 25-pack", "Amazon Brand", "cleaning supplies", 95, 12, ["paper plates"]),
      item("Cadbury Celebrations 177g", "Cadbury", "snacks", 199, 5, ["chocolate", "celebration"]),
    ],
  },
];

const PREDICTIVE_SETS: Record<string, LocalItem[]> = {
  new_baby: [
    item("Pampers Newborn Diapers 24-pack", "Pampers", "baby", 299, 1, ["diapers", "newborn"]),
    item("Himalaya Gentle Baby Wipes 72-pack", "Himalaya", "baby", 180, 1, ["baby wipes"]),
    item("Himalaya Baby Lotion 200ml", "Himalaya", "baby", 210, 1, ["baby lotion"]),
    item("Johnson's Baby Shampoo 200ml", "Johnson's", "baby", 195, 1, ["baby shampoo"]),
    item("Mamaearth Diaper Rash Cream 50g", "Mamaearth", "baby", 199, 1, ["rash cream"]),
  ],
  new_home: [
    item("Vim Dishwash Liquid 500ml", "Vim", "cleaning supplies", 99, 1, ["dishwash"]),
    item("Harpic Toilet Cleaner 500ml", "Harpic", "cleaning supplies", 105, 1, ["toilet cleaner"]),
    item("Colin Glass Cleaner 500ml", "Colin", "cleaning supplies", 110, 1, ["glass cleaner"]),
    item("Aashirvaad Atta 1kg", "Aashirvaad", "pantry staples", 72, 5, ["atta"]),
    item("Tata Salt 1kg", "Tata", "pantry staples", 28, 10, ["salt"]),
  ],
  home_office: [
    item("Nescafe Classic Coffee 50g", "Nescafe", "beverages", 175, 10, ["coffee"]),
    item("Britannia NutriChoice Biscuits 300g", "Britannia", "snacks", 75, 6, ["biscuits"]),
    item("Portronics 65W Charger", "Portronics", "cleaning supplies", 999, 1, ["charger"]),
    item("Dettol Hand Sanitizer 200ml", "Dettol", "cleaning supplies", 95, 1, ["sanitizer"]),
  ],
  sick_person: [
    item("Electral ORS Powder 4-pack", "Electral", "beverages", 88, 4, ["ors"]),
    item("Dabur Honey 250g", "Dabur", "pantry staples", 135, 8, ["honey"]),
    item("Brooke Bond Tulsi Tea 25 Bags", "Brooke Bond", "beverages", 145, 12, ["tea"]),
    item("Origami Facial Tissues 100-pull", "Origami", "cleaning supplies", 85, 1, ["tissues"]),
  ],
  college_first_week: [
    item("Maggi 2-Minute Noodles 12-pack", "Maggi", "pantry staples", 180, 6, ["noodles"]),
    item("Parle-G Biscuits 800g", "Parle", "snacks", 95, 8, ["biscuits"]),
    item("Nescafe Classic Coffee 50g", "Nescafe", "beverages", 175, 10, ["coffee"]),
    item("Colgate Strong Teeth 150g", "Colgate", "cleaning supplies", 92, 1, ["toothpaste"]),
    item("Dove Daily Shine Shampoo 340ml", "Dove", "cleaning supplies", 285, 1, ["shampoo"]),
  ],
};

function normalizeIntentText(intentText: string): string {
  return intentText.trim().replace(/_/g, " ").replace(/\s+/g, " ");
}

function extractPersonCount(text: string, fallback: number): number {
  const match = text.match(/\b(?:for\s+)?(\d{1,2})\s*(?:people|persons|guests|kids)?\b/i);
  return match ? Math.max(1, Number(match[1])) : Math.max(1, fallback);
}

export function parseLocalIntent(intentText: string, profile: HouseholdProfile): ParsedIntent {
  const normalized = normalizeIntentText(intentText);
  const lower = normalized.toLowerCase();
  const personCount = extractPersonCount(normalized, profile.servingCount);
  const predictive = Object.keys(PREDICTIVE_SETS).find((key) =>
    lower.includes(key.replace(/_/g, " "))
  );

  const occasion = normalized
    .replace(/\s+for\s+\d{1,2}(?:\s+(?:people|persons|guests|kids))?/i, "")
    .trim();

  return {
    occasion: predictive || occasion || normalized,
    person_count: personCount,
    time_context: ["morning", "afternoon", "evening", "tonight", "tomorrow"].find((time) =>
      lower.includes(time)
    ) || null,
    dietary: [profile.dietary.toLowerCase()],
    exclusions: [],
    mode_override: predictive ? "predictive" : null,
    clarifying_question: lower.length < 3 ? "What would you like to shop for?" : null,
  };
}

function findMatchingSet(
  lower: string,
  sets: Array<{ matches: string[]; items: LocalItem[] }>
): LocalItem[] | null {
  const exactPair = sets.find(({ matches }) =>
    matches.length > 1 && matches.every((match) => lower.includes(match))
  );
  if (exactPair) return exactPair.items;

  return sets.find(({ matches }) => matches.some((match) => lower.includes(match)))?.items || null;
}

function getLocalItems(parsed: ParsedIntent, mode: string): LocalItem[] {
  const lower = (parsed.occasion || "").toLowerCase().replace(/_/g, " ");

  if (mode === "predictive") {
    const key = Object.keys(PREDICTIVE_SETS).find((candidate) =>
      lower.includes(candidate.replace(/_/g, " "))
    );
    return (key && PREDICTIVE_SETS[key]) || PREDICTIVE_SETS.new_home;
  }

  if (mode === "cooking") {
    return findMatchingSet(lower, RECIPE_SETS) || [
      item("Fresh Onions 500g", "Fresh", "fresh produce", 35, 4, ["onion"], "no_return"),
      item("Fresh Tomatoes 500g", "Fresh", "fresh produce", 40, 4, ["tomato"], "no_return"),
      item("Fresh Garlic 250g", "Fresh", "fresh produce", 55, 6, ["garlic"], "no_return"),
      item("Fortune Sunflower Oil 1L", "Fortune", "pantry staples", 145, 12, ["cooking oil"]),
      item("Everest Kitchen King Masala 100g", "Everest", "pantry staples", 82, 8, ["masala"]),
    ];
  }

  if (mode === "addon") {
    const addonItems: { matches: string[]; product: LocalItem }[] = [
      {
        matches: ["milk"],
        product: item("Amul Taza Milk 500ml", "Amul", "dairy", 29, 1, ["milk"], "no_return"),
      },
      {
        matches: ["egg"],
        product: item("Suguna Farm Fresh Eggs 6-pack", "Suguna", "dairy", 55, 1, ["eggs"], "no_return"),
      },
      {
        matches: ["atta", "flour"],
        product: item("Aashirvaad Whole Wheat Atta 5kg", "Aashirvaad", "pantry staples", 245, 1, ["atta", "wheat flour"]),
      },
      {
        matches: ["cooking oil", "sunflower oil"],
        product: item("Fortune Sunflower Oil 1L", "Fortune", "pantry staples", 165, 1, ["cooking oil"]),
      },
      {
        matches: ["dishwash", "dish wash"],
        product: item("Vim Dishwash Liquid 500ml", "Vim", "cleaning supplies", 99, 1, ["dishwash liquid"]),
      },
      {
        matches: ["charger", "usb-c", "usb c"],
        product: item("Amazon Basics 20W USB-C Charger", "Amazon Basics", "pantry staples", 499, 1, ["charger", "usb-c", "electronics"]),
      },
      {
        matches: ["diaper"],
        product: item("Pampers Newborn Diapers 24 Count", "Pampers", "baby", 349, 1, ["diapers", "baby"], "7_day_return"),
      },
    ];
    const directAddon = addonItems.find(({ matches }) =>
      matches.some((match) => lower.includes(match))
    );
    if (directAddon) return [directAddon.product];

    if (lower.includes("bread")) {
      return [
        item("Britannia Whole Wheat Bread 400g", "Britannia", "pantry staples", 42, 1, ["bread"], "no_return"),
      ];
    }
    if (lower.includes("spaghetti") || lower.includes("pasta")) {
      return RECIPE_SETS.find(({ matches }) => matches.includes("aglio"))!.items.slice(1);
    }
  }

  return findMatchingSet(lower, INTENT_SETS) || INTENT_SETS[1].items;
}

export function buildLocalSuggestions(parsed: ParsedIntent, mode: string): AISuggestion[] {
  const people = Math.max(1, parsed.person_count || 1);
  const occasion = parsed.occasion || mode;

  return getLocalItems(parsed, mode).map((product, index) => {
    const isDrink = product.category === "beverages";
    const calculatedQuantity = Math.ceil(people / Math.max(1, product.servingSize));
    const quantity = mode === "addon"
      ? 1
      : isDrink
      ? Math.max(1, calculatedQuantity)
      : Math.min(2, Math.max(1, calculatedQuantity));

    return {
      name: product.name,
      brand: product.brand,
      category: product.category,
      suggested_price: product.price,
      serving_size: product.servingSize,
      quantity,
      ai_reasoning: `${product.brand} selected for ${occasion}. Pack size and quantity are calculated for ${people}.`,
      keywords: product.keywords,
      occasion_tags: [occasion.toLowerCase().replace(/\s+/g, "_")],
      is_bestseller: index < 2,
      suggested_rating: index < 2 ? 4.7 : 4.4,
      suggested_review_count: index < 2 ? 12000 : 3500,
      is_suggestion: mode === "addon",
      dark_store: index === 4 ? "DS-Central" : "DS-North",
      return_policy: product.returnPolicy ||
        (product.category === "dairy" || product.category === "fresh produce"
          ? "no_return"
          : "7_day_return"),
    };
  });
}
