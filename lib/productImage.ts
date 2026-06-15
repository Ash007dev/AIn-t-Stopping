// lib/productImage.ts — resolves a clean, always-correct visual for any product.
// The dataset ships every product with the same "/placeholder-product.png" and there is
// no reliable free service that returns the exact packshot for 1008 arbitrary items,
// so we map each product to a recognisable emoji/illustration based on its name,
// keywords and category. This is deterministic and never shows an irrelevant photo.

type ImgProduct = {
  id?: string;
  name?: string;
  brand?: string;
  category?: string;
  keywords?: string[];
  image_url?: string;
};

// Ordered most-specific → most-general. First substring hit wins.
const EMOJI_RULES: { keys: string[]; emoji: string }[] = [
  // Baby & personal care
  { keys: ['diaper', 'pamper', 'huggies'], emoji: '🧷' },
  { keys: ['wipe'], emoji: '🧻' },
  { keys: ['lotion', 'cream', 'moistur'], emoji: '🧴' },
  { keys: ['shampoo', 'conditioner'], emoji: '🧴' },
  { keys: ['soap', 'handwash', 'bodywash'], emoji: '🧼' },
  { keys: ['toothpaste', 'tooth'], emoji: '🪥' },
  { keys: ['detergent', 'cleaner', 'cleaning', 'phenyl', 'bleach'], emoji: '🧼' },
  { keys: ['tissue', 'napkin', 'roll'], emoji: '🧻' },

  // Drinks
  { keys: ['pepsi', 'coke', 'coca', 'cola', 'soft drink', 'soda', 'sprite', 'fanta', 'thums'], emoji: '🥤' },
  { keys: ['juice'], emoji: '🧃' },
  { keys: ['water'], emoji: '💧' },
  { keys: ['tea'], emoji: '🍵' },
  { keys: ['coffee'], emoji: '☕' },
  { keys: ['beer', 'wine'], emoji: '🍷' },

  // Snacks & sweets
  { keys: ['doritos', 'chips', 'lays', 'kurkure', 'wafer', 'nacho'], emoji: '🍟' },
  { keys: ['chocolate', 'choco', 'dairy milk', 'kitkat'], emoji: '🍫' },
  { keys: ['biscuit', 'cookie', 'cracker', 'rusk'], emoji: '🍪' },
  { keys: ['cake', 'pastry', 'muffin'], emoji: '🧁' },
  { keys: ['ice cream', 'icecream', 'kulfi'], emoji: '🍦' },
  { keys: ['popcorn'], emoji: '🍿' },
  { keys: ['candy', 'toffee', 'lollipop'], emoji: '🍬' },
  { keys: ['honey'], emoji: '🍯' },
  { keys: ['namkeen', 'bhujia', 'mixture'], emoji: '🥜' },

  // Staples / cooking
  { keys: ['idli', 'dosa', 'batter'], emoji: '🍚' },
  { keys: ['spaghetti', 'pasta', 'macaroni', 'penne'], emoji: '🍝' },
  { keys: ['noodle', 'maggi', 'ramen'], emoji: '🍜' },
  { keys: ['bread', 'bun', 'pav', 'loaf'], emoji: '🍞' },
  { keys: ['atta', 'flour', 'maida', 'wheat', 'besan'], emoji: '🌾' },
  { keys: ['basmati', 'rice', 'poha'], emoji: '🍚' },
  { keys: ['dal', 'lentil', 'rajma', 'chana', 'moong', 'toor', 'urad'], emoji: '🫘' },
  { keys: ['oil', 'ghee'], emoji: '🫗' },
  { keys: ['sugar', 'jaggery'], emoji: '🧂' },
  { keys: ['salt', 'masala', 'spice', 'powder', 'turmeric', 'haldi'], emoji: '🧂' },
  { keys: ['sauce', 'ketchup', 'mayo', 'jam', 'spread'], emoji: '🥫' },
  { keys: ['pickle', 'achaar'], emoji: '🥫' },

  // Dairy & eggs
  { keys: ['egg'], emoji: '🥚' },
  { keys: ['milk'], emoji: '🥛' },
  { keys: ['cheese'], emoji: '🧀' },
  { keys: ['butter'], emoji: '🧈' },
  { keys: ['paneer', 'tofu'], emoji: '🧀' },
  { keys: ['curd', 'yogurt', 'yoghurt', 'lassi', 'buttermilk'], emoji: '🥛' },

  // Meat & fish
  { keys: ['chicken', 'mutton', 'meat', 'sausage', 'kebab'], emoji: '🍗' },
  { keys: ['fish', 'prawn', 'seafood'], emoji: '🐟' },

  // Fruits
  { keys: ['apple'], emoji: '🍎' },
  { keys: ['banana'], emoji: '🍌' },
  { keys: ['mango'], emoji: '🥭' },
  { keys: ['orange', 'nagpur', 'sweet lime', 'mosambi'], emoji: '🍊' },
  { keys: ['grape'], emoji: '🍇' },
  { keys: ['watermelon'], emoji: '🍉' },
  { keys: ['muskmelon', 'melon'], emoji: '🍈' },
  { keys: ['pineapple'], emoji: '🍍' },
  { keys: ['papaya'], emoji: '🍈' },
  { keys: ['guava'], emoji: '🍐' },
  { keys: ['pear'], emoji: '🍐' },
  { keys: ['pomegranate', 'anar'], emoji: '🍎' },
  { keys: ['strawberry', 'berry'], emoji: '🍓' },
  { keys: ['cherry'], emoji: '🍒' },
  { keys: ['kiwi'], emoji: '🥝' },
  { keys: ['peach', 'plum', 'apricot'], emoji: '🍑' },
  { keys: ['coconut'], emoji: '🥥' },
  { keys: ['lemon', 'lime'], emoji: '🍋' },
  { keys: ['dragon fruit', 'sapota', 'amla', 'litchi', 'fig', 'dates'], emoji: '🍑' },

  // Vegetables
  { keys: ['onion'], emoji: '🧅' },
  { keys: ['tomato'], emoji: '🍅' },
  { keys: ['potato', 'aloo'], emoji: '🥔' },
  { keys: ['sweet potato'], emoji: '🍠' },
  { keys: ['garlic'], emoji: '🧄' },
  { keys: ['ginger'], emoji: '🫚' },
  { keys: ['carrot'], emoji: '🥕' },
  { keys: ['corn', 'maize'], emoji: '🌽' },
  { keys: ['chilli', 'chili'], emoji: '🌶️' },
  { keys: ['capsicum', 'bell pepper', 'pepper'], emoji: '🫑' },
  { keys: ['brinjal', 'eggplant', 'aubergine'], emoji: '🍆' },
  { keys: ['cauliflower', 'broccoli'], emoji: '🥦' },
  { keys: ['cucumber', 'zucchini', 'gourd', 'ridge', 'bottle', 'bitter', 'coccinia'], emoji: '🥒' },
  { keys: ['mushroom'], emoji: '🍄' },
  { keys: ['pea', 'beans', 'bean'], emoji: '🫛' },
  { keys: ['avocado'], emoji: '🥑' },
  { keys: ['ladies finger', 'okra', 'bhindi'], emoji: '🥬' },
  { keys: ['spinach', 'methi', 'coriander', 'mint', 'curry leaves', 'cabbage', 'lettuce',
           'basil', 'parsley', 'spring onion', 'leaves', 'greens', 'sprout', 'colocasia', 'raw banana'], emoji: '🥬' },
];

const CATEGORY_EMOJI: Record<string, string> = {
  'fresh produce': '🥗',
  dairy: '🥛',
  beverages: '🥤',
  snacks: '🍿',
  'pantry staples': '🛒',
  baby: '🍼',
  'cleaning supplies': '🧼',
};

/** Returns a recognisable emoji that represents the product. */
export function getProductEmoji(p: ImgProduct): string {
  const hay = `${p.name || ''} ${(p.keywords || []).join(' ')}`.toLowerCase();
  for (const rule of EMOJI_RULES) {
    if (rule.keys.some(k => hay.includes(k))) return rule.emoji;
  }
  if (p.category && CATEGORY_EMOJI[p.category]) return CATEGORY_EMOJI[p.category];
  return '🛒';
}

/** Returns a real remote image if the product has one, otherwise null (use emoji). */
export function getProductImage(p: ImgProduct): string | null {
  if (p.image_url && p.image_url.startsWith('http')) return p.image_url;
  return null;
}

/** Soft background tint per category, for the emoji tile. */
export function getProductTint(p: ImgProduct): string {
  switch (p.category) {
    case 'fresh produce': return '#EAF7EA';
    case 'dairy': return '#EAF2FB';
    case 'beverages': return '#F3EAFB';
    case 'snacks': return '#FFF4E5';
    case 'pantry staples': return '#FBF3E7';
    case 'baby': return '#FDEAF1';
    case 'cleaning supplies': return '#E9F6F8';
    default: return '#F2F4F4';
  }
}
