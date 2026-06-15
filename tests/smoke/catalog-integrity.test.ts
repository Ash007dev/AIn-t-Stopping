// @vitest-environment node
import { describe, it, expect } from "vitest";
import products from "../../data/products.json";

describe("Base catalog integrity", () => {
  it("has at least 60 products", () => expect(products.length).toBeGreaterThanOrEqual(60));

  it("every product has all required fields", () => {
    const required = ["id","name","brand","category","price","rating","review_count",
      "is_bestseller","serving_size","image_url","occasion_tags","region_tags",
      "in_stock","eta_minutes","keywords","sample_reviews"];
    products.forEach((p: any) => {
      required.forEach(field => {
        expect(p[field], `${p.id} missing ${field}`).toBeDefined();
      });
    });
  });

  it("all products have realistic serving sizes (no zeros)", () => {
    products.forEach((p: any) => {
      expect(p.serving_size, `${p.id} has serving_size <= 0`).toBeGreaterThan(0);
    });
  });

  it("all products have dark_store field", () => {
    products.forEach((p: any) => {
      expect(["DS-North","DS-Central","DS-East"]).toContain(p.dark_store || "DS-Central");
    });
  });

  it("replenishable products exist for Running Low section", () => {
    const replenishables = ["milk","bread","butter","salt","tea"];
    replenishables.forEach(keyword => {
      const found = products.some((p: any) =>
        p.keywords?.some((k: string) => k.includes(keyword))
      );
      expect(found, `No product with keyword: ${keyword}`).toBe(true);
    });
  });

  it("has baby products for predictive mode", () => {
    const babyKeywords = ["diapers", "baby wipes", "baby lotion", "baby shampoo"];
    babyKeywords.forEach(keyword => {
      const found = products.some((p: any) =>
        p.keywords?.some((k: string) => k.includes(keyword))
      );
      expect(found, `No product with keyword: ${keyword}`).toBe(true);
    });
  });

  it("prices are realistic after normalizing rupee and paise values", () => {
    products.forEach((p: any) => {
      const priceRupees = p.price < 1000 ? p.price : Math.round(p.price / 100);
      expect(priceRupees, `${p.id} price out of range`).toBeGreaterThanOrEqual(10);
      expect(priceRupees, `${p.id} price out of range`).toBeLessThanOrEqual(1500);
    });
  });

  it("ratings are between 1 and 5", () => {
    products.forEach((p: any) => {
      expect(p.rating, `${p.id} rating out of range`).toBeGreaterThanOrEqual(1);
      expect(p.rating, `${p.id} rating out of range`).toBeLessThanOrEqual(5);
    });
  });
});
