// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  getNearbyDarkStores,
  haversineDistanceKm,
  sourceCartFromNearbyStores,
} from "../../lib/dark-store-utils";
import type { CartProduct } from "../../lib/types";

describe("nearby dark-store sourcing", () => {
  it("sorts stores by customer distance", () => {
    const stores = getNearbyDarkStores({
      latitude: 11.0087,
      longitude: 76.9558,
      source: "device",
    });

    expect(stores[0].id).toBe("DS-North");
    expect(stores[0].distance_km).toBeLessThanOrEqual(stores[1].distance_km);
  });

  it("calculates realistic geographic distance", () => {
    expect(haversineDistanceKm(
      { latitude: 11.0087, longitude: 76.9558 },
      { latitude: 11.0183, longitude: 76.9674 }
    )).toBeGreaterThan(1);
  });

  it("routes charger inventory to an electronics-capable store", () => {
    const charger = {
      id: "charger",
      name: "Amazon Basics 20W USB-C Charger",
      brand: "Amazon Basics",
      category: "pantry staples",
      keywords: ["charger", "usb-c"],
      quantity: 1,
    } as CartProduct;

    const [sourced] = sourceCartFromNearbyStores([charger], null, "641002");
    expect(sourced.dark_store).toBe("DS-East");
    expect(sourced.eta_minutes).toBeGreaterThan(0);
  });
});
