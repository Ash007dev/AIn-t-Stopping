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
    cart = cart.filter((item) => !diff.remove.includes(item.id));
    // Modify quantities
    cart = cart.map((item) => {
      const mod = diff.modify.find((m) => m.id === item.id);
      return mod ? { ...item, quantity: mod.quantity } : item;
    });
    // Add new items
    for (const addition of diff.add) {
      cart.push({ ...addition.product, quantity: addition.quantity, ai_reasoning: "Added based on your request", alternatives: [] });
    }
    set({ cart });
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
}));
