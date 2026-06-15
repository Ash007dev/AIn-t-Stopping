import { NextResponse } from "next/server";
import { loadCatalog } from "@/lib/catalog";

// The top replenishable goods for quick commerce - hardcoded for speed (no AI needed)
const REPLENISHABLE_IDS = [
  "dair-amul-milk-500",
  "stpl-britannia-bread",
  "dair-amul-butter-100",
  "stpl-tata-salt-1kg",
  "bev-tata-tea-250",
  "fresh-eggs-6pk",
  "stpl-saffola-oil-500",
  "clean-vim-500",
  "clean-dettol-handwash",
  "stpl-maggi-masala-70g"
];

export async function GET() {
  const catalog = loadCatalog();
  // Try to find from catalog, or create stubs
  const replenishables = REPLENISHABLE_IDS.map(id => {
    const found = catalog.find(p => p.id === id);
    return found || null;
  }).filter(Boolean);

  // If catalog doesn't have enough, add synthetic replenishables
  if (replenishables.length < 6) {
    return NextResponse.json({ replenishables: getSyntheticReplenishables() });
  }

  return NextResponse.json({ replenishables });
}

function getSyntheticReplenishables() {
  return [
    { id: "rep-001", name: "Amul Taza Milk 500ml", brand: "Amul", price: 29, image_url: "/placeholder-product.png", category: "dairy", eta_minutes: 12, in_stock: true, dark_store: "DS-North", return_policy: "no_return" },
    { id: "rep-002", name: "Britannia Bread 400g", brand: "Britannia", price: 42, image_url: "/placeholder-product.png", category: "pantry staples", eta_minutes: 14, in_stock: true, dark_store: "DS-North", return_policy: "no_return" },
    { id: "rep-003", name: "Amul Butter 100g", brand: "Amul", price: 52, image_url: "/placeholder-product.png", category: "dairy", eta_minutes: 12, in_stock: true, dark_store: "DS-North", return_policy: "7_day_return" },
    { id: "rep-004", name: "Tata Salt 1kg", brand: "Tata", price: 26, image_url: "/placeholder-product.png", category: "pantry staples", eta_minutes: 16, in_stock: true, dark_store: "DS-Central", return_policy: "7_day_return" },
    { id: "rep-005", name: "Tata Tea Premium 250g", brand: "Tata", price: 130, image_url: "/placeholder-product.png", category: "beverages", eta_minutes: 16, in_stock: true, dark_store: "DS-Central", return_policy: "7_day_return" },
    { id: "rep-006", name: "Maggi 2-Minute Noodles 70g x4", brand: "Nestle", price: 68, image_url: "/placeholder-product.png", category: "pantry staples", eta_minutes: 18, in_stock: true, dark_store: "DS-Central", return_policy: "7_day_return" },
    { id: "rep-007", name: "Vim Dishwash Liquid 500ml", brand: "Vim", price: 99, image_url: "/placeholder-product.png", category: "cleaning supplies", eta_minutes: 18, in_stock: true, dark_store: "DS-Central", return_policy: "7_day_return" },
    { id: "rep-008", name: "Dettol Handwash 250ml", brand: "Dettol", price: 79, image_url: "/placeholder-product.png", category: "cleaning supplies", eta_minutes: 14, in_stock: true, dark_store: "DS-North", return_policy: "7_day_return" },
  ];
}
