// @vitest-environment node
import { describe, expect, it } from "vitest";
import products from "../../data/products.json";
import { getProductsForShelf } from "../../lib/product-shelves";
import type { Product } from "../../lib/types";

const catalog = products as Product[];

describe("product shelf classification", () => {
  it("always returns top grocery picks from the catalog", () => {
    const names = getProductsForShelf(catalog, "top").map(product => product.name.toLowerCase());

    expect(names).toHaveLength(8);
    expect(names.some(name => name.includes("shirt") || name.includes("bathroom"))).toBe(false);
  });

  it("keeps pasta out of chocolates", () => {
    const names = getProductsForShelf(catalog, "chocolates", 20)
      .map((product) => product.name.toLowerCase());

    expect(names.some((name) => name.includes("pasta"))).toBe(false);
    expect(names.some((name) => name.includes("strawberry") && !name.includes("chocolate"))).toBe(false);
    expect(names.some((name) => name.includes("chocolate") || name.includes("choco"))).toBe(true);
  });

  it("keeps batter out of dairy", () => {
    const names = getProductsForShelf(catalog, "dairy", 30)
      .map((product) => product.name.toLowerCase());

    expect(names.some((name) => name.includes("batter"))).toBe(false);
  });

  it("keeps obvious marketplace noise out of grocery shelves", () => {
    const shelves = ["vegetables", "fruits", "dairy", "baby"] as const;
    const names = shelves.flatMap((shelf) =>
      getProductsForShelf(catalog, shelf, 30).map((product) => product.name.toLowerCase())
    );

    expect(names.some((name) => name.includes("screen protector"))).toBe(false);
    expect(names.some((name) => name.includes("clothes"))).toBe(false);
    expect(names.some((name) => name.includes("night light"))).toBe(false);
  });
});
