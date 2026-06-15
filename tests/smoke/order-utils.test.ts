// @vitest-environment node
import { describe, expect, it } from "vitest";
import { formatOrderDate, getOrderSubtotal, normalizePurchaseRecord } from "../../lib/order-utils";

describe("legacy order normalization", () => {
  it("uses zero instead of NaN for incomplete records", () => {
    const order = normalizePurchaseRecord({ orderId: "OLD-1" }, 0);

    expect(order.total).toBe(0);
    expect(order.itemCount).toBe(0);
  });

  it("computes totals from valid items", () => {
    expect(getOrderSubtotal({
      items: [
        { id: "1", name: "Milk", quantity: 2, price: 2900, image_url: "" },
      ],
    })).toBe(58);
  });

  it("recovers legacy totals from the cart snapshot", () => {
    expect(getOrderSubtotal({
      cartSnapshot: [
        { id: "1", name: "Bread", quantity: 2, price: 4200 } as never,
      ],
    })).toBe(84);
  });

  it("does not render Invalid Date", () => {
    expect(formatOrderDate({ date: "not-a-date" })).toBe("Date unavailable");
  });
});
