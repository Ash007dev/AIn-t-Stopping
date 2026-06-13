// lib/fuse-search.ts
import Fuse from "fuse.js";
import { Product } from "./types";

export function findProduct(query: string, catalog: Product[]): Product | null {
  const fuse = new Fuse(catalog, {
    keys: ["name", "keywords"],
    threshold: 0.4,
    ignoreLocation: true,
    includeScore: true,
  });

  const results = fuse.search(query);
  if (!results.length || (results[0].score ?? 1) > 0.4) return null;
  return results[0].item;
}

export function findComplementary(product: Product, catalog: Product[]): Product[] {
  const tags = new Set([...product.occasion_tags, ...product.keywords]);
  return catalog
    .filter((p) => {
      if (p.id === product.id || !p.in_stock) return false;
      const pTags = [...p.occasion_tags, ...p.keywords];
      return pTags.some((t) => tags.has(t));
    })
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);
}
