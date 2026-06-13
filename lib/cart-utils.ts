// lib/cart-utils.ts
import { CartProduct } from "./types";

export function computeCartTotal(items: CartProduct[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getMaxEta(items: CartProduct[]): number {
  if (items.length === 0) return 0;
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
  let trimmed = [...items].sort((a, b) => a.rating - b.rating);
  while (computeCartTotal(trimmed) > budget && trimmed.length > 3) {
    trimmed.shift(); // Remove lowest-rated item
  }
  return {
    trimmed,
    underBudget: computeCartTotal(trimmed) <= budget,
  };
}
