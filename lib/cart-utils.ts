// lib/cart-utils.ts
import { CartProduct } from "./types";

export function computeCartTotal(items: CartProduct[]): number {
  if (!items || items.length === 0) return 0;
  return items.reduce((sum, item) => {
    const rawPrice = typeof item.price === "number" ? item.price : parseFloat(String(item.price)) || 0;
    const actualPrice = rawPrice < 1000 ? rawPrice : Math.round(rawPrice / 100);
    const qty = typeof item.quantity === "number" ? item.quantity : parseInt(String(item.quantity)) || 1;
    return sum + actualPrice * qty;
  }, 0);
}

export function formatPrice(amount: number): string {
  return `₹${amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export function getMaxEta(items: CartProduct[]): number {
  if (!items || items.length === 0) return 0;
  let max = 0;
  items.forEach(i => {
    let eta = i.eta_minutes;
    if (!eta) {
      // Generate a deterministic pseudo-random ETA between 12 and 22 based on product id length
      eta = 12 + (i.id.length % 10);
    }
    if (eta > max) max = eta;
  });
  return max;
}

export function generateOrderId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ORD-${result}`;
}

export function applyBudgetTrim(
  items: CartProduct[],
  budget: number
): { trimmed: CartProduct[]; underBudget: boolean } {
  const trimmed = [...items].sort((a, b) => a.rating - b.rating);
  while (computeCartTotal(trimmed) > budget && trimmed.length > 3) {
    trimmed.shift(); // Remove lowest-rated item
  }
  return {
    trimmed,
    underBudget: computeCartTotal(trimmed) <= budget,
  };
}
