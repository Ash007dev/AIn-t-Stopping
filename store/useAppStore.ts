// store/useAppStore.ts
"use client";
import { create } from "zustand";
import { CartProduct, CartDiff, ParsedIntent, Product, GenerateCartResponse, PurchaseRecord } from "@/lib/types";

interface AppStore {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  selectedMode: "intent" | "cooking" | "addon" | null;
  setMode: (mode: AppStore["selectedMode"]) => void;
  isPipelineRunning: boolean;
  setPipelineRunning: (v: boolean) => void;
  cart: CartProduct[];
  regionalProducts: Product[];
  occasionTitle: string;
  parsedIntent: ParsedIntent | null;
  setCartResult: (result: GenerateCartResponse) => void;
  switchProduct: (cardIndex: number, alternativeId: string) => void;
  applyDiff: (diff: CartDiff) => void;
  clearCart: () => void;
  purchaseHistory: PurchaseRecord[];
  addToHistory: (record: PurchaseRecord) => void;
  modificationError: string | null;
  setModificationError: (e: string | null) => void;
  prefillIntent: string | null;
  setPrefillIntent: (v: string | null) => void;
  addSuggestionToCart: (productId: string) => void;
}

function loadPurchaseHistory(): PurchaseRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("purchase_history") ?? "[]");
  } catch {
    return [];
  }
}

function loadTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem("app_theme") as "light" | "dark") || "light";
}

export const useAppStore = create<AppStore>((set, get) => ({
  theme: loadTheme(),
  setTheme: (theme) => {
    set({ theme });
    try {
      localStorage.setItem("app_theme", theme);
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {}
  },
  selectedMode: null,
  setMode: (mode) => set({ selectedMode: mode }),
  isPipelineRunning: false,
  setPipelineRunning: (v) => set({ isPipelineRunning: v }),
  cart: [],
  regionalProducts: [],
  occasionTitle: "",
  parsedIntent: null,
  setCartResult: (result) => set({
    cart: result.cart,
    regionalProducts: result.regionalProducts,
    occasionTitle: result.occasionTitle,
    parsedIntent: result.parsedIntent,
  }),
  switchProduct: (cardIndex, alternativeId) => {
    const cart = [...get().cart];
    const card = cart[cardIndex];
    if (!card) return;
    const alt = card.alternatives.find((a) => a.id === alternativeId);
    if (!alt) return;
    cart[cardIndex] = { ...alt, quantity: card.quantity, ai_reasoning: card.ai_reasoning, alternatives: card.alternatives };
    set({ cart });
  },
  applyDiff: (diff) => {
    let cart = [...get().cart];

    // Remove
    if (diff.remove?.length) {
      cart = cart.filter((item) => !diff.remove.includes(item.id));
    }

    // Modify quantities
    if (diff.modify?.length) {
      cart = cart.map((item) => {
        const mod = diff.modify.find((m) => m.id === item.id);
        return mod ? { ...item, quantity: Math.max(1, mod.quantity) } : item;
      });
    }

    // Add new items (from AI suggestion in modification)
    if (diff.add?.length) {
      for (const addition of diff.add) {
        // Check if it's the old format { product, quantity } or the new flat format
        const isOldFormat = addition.product && typeof addition.product === "object";
        
        if (isOldFormat) {
          cart.push({ ...addition.product, quantity: addition.quantity, ai_reasoning: "Added based on your request", alternatives: [] });
        } else {
          // New flat format from AI modification
          const existingIdx = cart.findIndex(
            (i) => i.id === addition.id || i.name?.toLowerCase() === addition.name?.toLowerCase()
          );
          if (existingIdx >= 0) {
            cart[existingIdx] = { ...cart[existingIdx], quantity: cart[existingIdx].quantity + (addition.quantity || 1) };
          } else {
            const newProduct: CartProduct = {
              id: addition.id || `mod-${Date.now()}`,
              name: addition.name || "Added product",
              brand: addition.brand || "",
              category: addition.category || "snacks",
              price: addition.price || 0,
              rating: 4.3,
              review_count: 1200,
              is_bestseller: false,
              serving_size: addition.serving_size || 2,
              image_url: "/placeholder-product.png",
              occasion_tags: [],
              region_tags: [],
              in_stock: true,
              eta_minutes: 18,
              expiry_months: null,
              keywords: [],
              sample_reviews: [
                { author: "Customer", text: "Good product." },
                { author: "Buyer", text: "As expected." },
              ],
              quantity: addition.quantity || 1,
              ai_reasoning: addition.ai_reasoning || "Added based on your request",
              alternatives: [],
            };
            cart.push(newProduct);
          }
        }
      }
    }

    set({ cart, modificationError: (diff as any).error || null });
  },
  clearCart: () => set({ cart: [], regionalProducts: [], occasionTitle: "", parsedIntent: null }),
  purchaseHistory: loadPurchaseHistory(),
  addToHistory: (record) => {
    const history = [record, ...get().purchaseHistory].slice(0, 10);
    set({ purchaseHistory: history });
    try {
      localStorage.setItem("purchase_history", JSON.stringify(history));
    } catch {}
  },
  modificationError: null,
  setModificationError: (e) => set({ modificationError: e }),
  prefillIntent: null,
  setPrefillIntent: (v) => set({ prefillIntent: v }),
  addSuggestionToCart: (productId: string) => {
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === productId ? { ...item, is_suggestion: false } : item
      ),
    }));
  },
}));
