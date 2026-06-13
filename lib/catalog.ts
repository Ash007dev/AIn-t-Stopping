// lib/catalog.ts
import { Product } from "./types";
import productsRaw from "../data/products.json";

function validateProduct(p: Record<string, unknown>): { valid: boolean; field?: string } {
  const required = [
    "id","name","brand","category","price","rating","review_count",
    "is_bestseller","serving_size","image_url","occasion_tags",
    "region_tags","in_stock","eta_minutes","keywords","sample_reviews",
  ];
  for (const field of required) {
    if (p[field] === undefined || p[field] === null) return { valid: false, field };
  }
  if (typeof p.rating === "number" && (p.rating < 1 || p.rating > 5))
    return { valid: false, field: "rating" };
  if (typeof p.price === "number" && (p.price < 0.01 || p.price > 99999.99))
    return { valid: false, field: "price" };
  if (typeof p.serving_size === "number" && p.serving_size < 1)
    return { valid: false, field: "serving_size" };
  if (!Array.isArray(p.sample_reviews) || p.sample_reviews.length < 2)
    return { valid: false, field: "sample_reviews" };
  return { valid: true };
}

let _catalog: Product[] | null = null;

export function loadCatalog(): Product[] {
  // if (_catalog) return _catalog; // Disabled cache to ensure hot-reloading works for JSON
  const raw = productsRaw as Record<string, unknown>[];
  const valid: Product[] = [];
  for (const p of raw) {
    const result = validateProduct(p);
    if (result.valid) {
      valid.push(p as unknown as Product);
    } else {
      console.warn(`[catalog] Excluded product id=${p.id} — invalid field: ${result.field}`);
    }
  }
  _catalog = valid;
  return _catalog;
}

export function getProductsByOccasion(catalog: Product[], occasion: string): Product[] {
  return catalog.filter((p) =>
    p.occasion_tags.some((t) => t.toLowerCase().includes(occasion.toLowerCase()))
  );
}

export function getRegionalProducts(catalog: Product[], region: string): Product[] {
  return catalog
    .filter((p) => p.region_tags.some((t) => t.toLowerCase() === region.toLowerCase()) && p.in_stock)
    .slice(0, 4);
}
