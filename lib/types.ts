// lib/types.ts

export interface HouseholdProfile {
  pinCode: string;
  servingCount: number;
  dietary: "No restriction" | "Vegetarian" | "Jain";
  budget: number | null;
}

export type ProductCategory =
  | "snacks"
  | "beverages"
  | "fresh produce"
  | "dairy"
  | "pantry staples"
  | "cleaning supplies";

export interface SampleReview {
  author: string;
  text: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  rating: number;
  review_count: number;
  is_bestseller: boolean;
  serving_size: number;
  image_url: string;
  occasion_tags: string[];
  region_tags: string[];
  in_stock: boolean;
  eta_minutes: number;
  expiry_months: number | null;
  keywords: string[];
  sample_reviews: [SampleReview, SampleReview];
}

export interface CartProduct extends Product {
  quantity: number;
  ai_reasoning: string;
  alternatives: Product[];
  is_suggestion?: boolean;
  dark_store?: string;
  return_policy?: string;
}

export interface ParsedIntent {
  occasion: string | null;
  person_count: number | null;
  time_context: string | null;
  dietary: string[];
  exclusions: string[];
  mode_override?: string | null;
  error?: string;
}

export interface CartDiff {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  add: Record<string, any>[];
  remove: string[];
  modify: { id: string; quantity: number }[];
}

export interface GenerateCartRequest {
  intentText: string;
  householdProfile: HouseholdProfile;
  mode: "intent" | "cooking" | "addon" | "predictive";
}

export interface GenerateCartResponse {
  cart: CartProduct[];
  regionalProducts: Product[];
  occasionTitle: string;
  parsedIntent: ParsedIntent;
  darkStoreSummary?: { store: { name: string; distance_km: number; base_eta_minutes: number } | null; item_count: number; store_id: string }[];
  consolidatedEta?: number;
  subtotal?: number;
}

export interface ModifyCartRequest {
  modificationText: string;
  currentCart: CartProduct[];
}

export interface PurchaseRecord {
  occasionTitle: string;
  cartSnapshot: CartProduct[];
  createdAt: string;
  orderId: string;
}

export interface AISuggestion {
  name: string;
  brand: string;
  category: string;
  suggested_price: number;
  serving_size: number;
  quantity: number;
  ai_reasoning: string;
  keywords: string[];
  occasion_tags: string[];
  is_bestseller: boolean;
  suggested_rating: number;
  suggested_review_count: number;
  is_suggestion?: boolean;
  dark_store?: string;
  return_policy?: string;
}
