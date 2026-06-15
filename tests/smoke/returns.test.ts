// @vitest-environment node
import { describe, expect, it } from "vitest";
import { getReturnResolution } from "../../lib/returns";

describe("return resolution", () => {
  it("uses quality resolution for perishables", () => {
    expect(getReturnResolution({ name: "Amul Taza Milk 500ml" })).toBe("quality_resolution");
  });

  it("keeps electronics returnable", () => {
    expect(getReturnResolution({ name: "USB-C Phone Charger", return_policy: "7_day_return" })).toBe("returnable");
  });
});
