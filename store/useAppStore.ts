// store/useAppStore.ts
"use client";
import { create } from "zustand";
import { CartProduct, CartDiff, ParsedIntent, Product, GenerateCartResponse, PurchaseRecord } from "@/lib/types";

interface AppStore {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  selectedMode: "intent" | "cooking" | "addon" | "predictive" | null;
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
  pinCode: string;
  setPinCode: (code: string) => void;
  scannedImageBase64: string | null;
  setScannedImageBase64: (val: string | null) => void;
  // Profile
  profile: UserProfile;
  setProfileInfo: (info: Partial<Pick<UserProfile, "name" | "email" | "phone">>) => void;
  addAddress: (a: Omit<Address, "id">) => void;
  updateAddress: (id: string, a: Partial<Address>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  addPayment: (p: Omit<PaymentMethod, "id">) => void;
  removePayment: (id: string) => void;
  setDefaultPayment: (id: string) => void;
}

export interface Address {
  id: string;
  label: string;        // Home, Work, Other
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "upi" | "cod";
  label: string;        // e.g. "Visa ****1234" or "name@upi"
  detail?: string;      // expiry / holder
  isDefault?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
  payments: PaymentMethod[];
}

function loadProfile(): UserProfile {
  const fallback: UserProfile = { name: "", email: "", phone: "", addresses: [], payments: [] };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem("user_profile");
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function saveProfile(p: UserProfile) {
  try { localStorage.setItem("user_profile", JSON.stringify(p)); } catch {}
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

function loadPinCode(): string {
  if (typeof window === "undefined") return "641002";
  return localStorage.getItem("user_pincode") || "641002";
}

export const useAppStore = create<AppStore>((set, get) => ({
  theme: loadTheme(),
  setTheme: (theme) => {
    set({ theme });
    try {
      localStorage.setItem("app_theme", theme);
      document.documentElement.classList.toggle("dark", theme === "dark");
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
  pinCode: loadPinCode(),
  setPinCode: (code) => {
    set({ pinCode: code });
    try { localStorage.setItem("user_pincode", code); } catch {}
  },
  scannedImageBase64: null,
  setScannedImageBase64: (val) => set({ scannedImageBase64: val }),

  // ===== Profile =====
  profile: loadProfile(),
  setProfileInfo: (info) => {
    const profile = { ...get().profile, ...info };
    set({ profile });
    saveProfile(profile);
  },
  addAddress: (a) => {
    const addresses = [...get().profile.addresses];
    const id = `addr-${Date.now()}`;
    const isFirst = addresses.length === 0;
    const newAddr: Address = { ...a, id, isDefault: isFirst || a.isDefault };
    if (newAddr.isDefault) addresses.forEach(x => (x.isDefault = false));
    addresses.push(newAddr);
    const profile = { ...get().profile, addresses };
    set({ profile });
    saveProfile(profile);
  },
  updateAddress: (id, a) => {
    const addresses = get().profile.addresses.map(x => (x.id === id ? { ...x, ...a } : x));
    const profile = { ...get().profile, addresses };
    set({ profile });
    saveProfile(profile);
  },
  removeAddress: (id) => {
    const addresses = get().profile.addresses.filter(x => x.id !== id);
    if (addresses.length && !addresses.some(x => x.isDefault)) addresses[0].isDefault = true;
    const profile = { ...get().profile, addresses };
    set({ profile });
    saveProfile(profile);
  },
  setDefaultAddress: (id) => {
    const addresses = get().profile.addresses.map(x => ({ ...x, isDefault: x.id === id }));
    const profile = { ...get().profile, addresses };
    set({ profile });
    saveProfile(profile);
  },
  addPayment: (p) => {
    const payments = [...get().profile.payments];
    const id = `pay-${Date.now()}`;
    const isFirst = payments.length === 0;
    const newPay: PaymentMethod = { ...p, id, isDefault: isFirst || p.isDefault };
    if (newPay.isDefault) payments.forEach(x => (x.isDefault = false));
    payments.push(newPay);
    const profile = { ...get().profile, payments };
    set({ profile });
    saveProfile(profile);
  },
  removePayment: (id) => {
    const payments = get().profile.payments.filter(x => x.id !== id);
    if (payments.length && !payments.some(x => x.isDefault)) payments[0].isDefault = true;
    const profile = { ...get().profile, payments };
    set({ profile });
    saveProfile(profile);
  },
  setDefaultPayment: (id) => {
    const payments = get().profile.payments.map(x => ({ ...x, isDefault: x.id === id }));
    const profile = { ...get().profile, payments };
    set({ profile });
    saveProfile(profile);
  },
}));
