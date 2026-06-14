// lib/dark-store-utils.ts
import darkStores from "../data/dark-stores.json";
import { CartProduct } from "./types";

export type DarkStoreId = keyof typeof darkStores;

export interface DarkStoreInfo {
  name: string;
  distance_km: number;
  base_eta_minutes: number;
}

export function getDarkStoreInfo(storeId: string): DarkStoreInfo | null {
  return (darkStores as Record<string, DarkStoreInfo>)[storeId] || null;
}

export function groupCartByDarkStore(cart: CartProduct[]): Record<string, CartProduct[]> {
  const groups: Record<string, CartProduct[]> = {};
  for (const item of cart) {
    const storeId = item.dark_store || "DS-Central";
    if (!groups[storeId]) groups[storeId] = [];
    groups[storeId].push(item);
  }
  return groups;
}

export function getConsolidatedEta(cart: CartProduct[]): number {
  if (!cart.length) return 0;
  return Math.max(...cart.map(item => {
    const store = getDarkStoreInfo(item.dark_store || "DS-Central");
    return store ? store.base_eta_minutes : 18;
  }));
}
