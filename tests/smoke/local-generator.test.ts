// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildLocalSuggestions, parseLocalIntent } from "../../lib/agents/local-generator";

const profile = {
  pinCode: "641002",
  servingCount: 3,
  dietary: "No restriction" as const,
  budget: null,
};

describe("quota-free local generation", () => {
  it("parses a cooking request without an external model", () => {
    const parsed = parseLocalIntent("Appam and egg roast for 3", profile);

    expect(parsed.occasion).toBe("Appam and egg roast");
    expect(parsed.person_count).toBe(3);
  });

  it("builds the expected appam and egg roast ingredients", () => {
    const parsed = parseLocalIntent("Appam and egg roast for 3", profile);
    const suggestions = buildLocalSuggestions(parsed, "cooking");
    const names = suggestions.map((suggestion) => suggestion.name.toLowerCase()).join(" ");

    expect(suggestions.length).toBeGreaterThanOrEqual(5);
    expect(names).toContain("appam");
    expect(names).toContain("egg");
    expect(names).toContain("onion");
  });

  it("builds movie night products locally", () => {
    const parsed = parseLocalIntent("Movie night for 5 people", {
      ...profile,
      servingCount: 5,
    });
    const suggestions = buildLocalSuggestions(parsed, "intent");
    const names = suggestions.map((suggestion) => suggestion.name.toLowerCase()).join(" ");

    expect(names).toContain("popcorn");
    expect(names).toContain("chips");
    expect(names).toContain("coca-cola");
  });
});
