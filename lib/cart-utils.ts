// lib/cart-utils.ts
import { CartProduct } from "./types";

export function computeCartTotal(items: CartProduct[]): number {
  if (!items || items.length === 0) return 0;
  return items.reduce((sum, item) => {
    const price = typeof item.price === "number" ? item.price : parseFloat(String(item.price)) || 0;
    const qty = typeof item.quantity === "number" ? item.quantity : parseInt(String(item.quantity)) || 1;
    return sum + price * qty;
  }, 0);
}

export function formatPrice(amount: number): string {
  return `₹${amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export function getMaxEta(items: CartProduct[]): number {
  if (!items || items.length === 0) return 0;
  return Math.max(...items.map((i) => i.eta_minutes));
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
