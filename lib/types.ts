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
}

export interface ParsedIntent {
  occasion: string | null;
  person_count: number | null;
  time_context: string | null;
  dietary: string[];
  exclusions: string[];
  error?: string;
}

export interface CartDiff {
  add: any[];
  remove: string[];
  modify: { id: string; quantity: number }[];
}

export interface GenerateCartRequest {
  intentText: string;
  householdProfile: HouseholdProfile;
  mode: "intent" | "cooking" | "addon";
}

export interface GenerateCartResponse {
  cart: CartProduct[];
  regionalProducts: Product[];
  occasionTitle: string;
  parsedIntent: ParsedIntent;
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
}
