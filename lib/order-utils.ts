import type { PurchaseRecord } from "@/lib/types";

function asFiniteNumber(value: unknown, fallback = 0): number {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function normalizeUnitPrice(value: unknown): number {
  const price = Math.max(0, asFiniteNumber(value));
  return price >= 1000 ? Math.round(price / 100) : price;
}

export function getOrderSubtotal(order: Partial<PurchaseRecord>): number {
  const items = Array.isArray(order.items) ? order.items : [];
  const itemTotal = items.reduce((sum, item) => {
    const quantity = Math.max(1, asFiniteNumber(item.quantity, 1));
    return sum + normalizeUnitPrice(item.price) * quantity;
  }, 0);

  if (itemTotal > 0) return itemTotal;
  return Math.max(0, asFiniteNumber(order.total));
}

export function getOrderDate(order: Partial<PurchaseRecord>): Date | null {
  const rawDate = order.date || order.createdAt;
  if (!rawDate) return null;

  const date = new Date(rawDate);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatOrderDate(
  order: Partial<PurchaseRecord>,
  includeTime = false
): string {
  const date = getOrderDate(order);
  if (!date) return "Date unavailable";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function normalizePurchaseRecord(
  record: Partial<PurchaseRecord>,
  index: number
): PurchaseRecord {
  const items = Array.isArray(record.items) ? record.items : [];
  const cartSnapshot = Array.isArray(record.cartSnapshot) ? record.cartSnapshot : [];
  const createdAt = getOrderDate(record)?.toISOString() || new Date(0).toISOString();
  const total = getOrderSubtotal(record);

  return {
    orderId: record.orderId || `LEGACY-${index + 1}`,
    occasionTitle: record.occasionTitle || "Your Order",
    cartSnapshot,
    createdAt,
    date: createdAt,
    total,
    itemCount: Math.max(0, asFiniteNumber(record.itemCount, items.length || cartSnapshot.length)),
    items,
  };
}
