// lib/fallbacks.ts
import { GenerateCartResponse } from "./types";
import { loadCatalog } from "./catalog";

export function getFallbackCart(scenario: 1 | 2 | 3 | 4 | 5): GenerateCartResponse {
  const catalog = loadCatalog();
  const getProduct = (id: string) => catalog.find((p) => p.id === id)!;

  const fallbacks: Record<number, GenerateCartResponse> = {
    1: {
      occasionTitle: "Movie Night for 5 🎬",
      parsedIntent: { occasion: "movie_night", person_count: 5, time_context: "evening", dietary: [], exclusions: [] },
      regionalProducts: catalog.filter((p) => p.region_tags.includes("Coimbatore") && p.in_stock).slice(0, 4),
      cart: [
        { ...getProduct("snk-001"), quantity: 3, ai_reasoning: "#1 bestseller in chips, ideal sharing size for 5 people", alternatives: [getProduct("snk-003"), getProduct("snk-004")] },
        { ...getProduct("bev-001"), quantity: 5, ai_reasoning: "1 can per person, most popular beverage choice for movie nights", alternatives: [getProduct("bev-003"), getProduct("bev-005")] },
        { ...getProduct("snk-009"), quantity: 1, ai_reasoning: "Microwave popcorn - the quintessential movie night snack", alternatives: [getProduct("snk-002"), getProduct("snk-007")] },
      ],
    },
    2: {
      occasionTitle: "Aglio Olio for 3 🍝",
      parsedIntent: { occasion: "cooking", person_count: 3, time_context: "evening", dietary: [], exclusions: [] },
      regionalProducts: [],
      cart: [
        { ...getProduct("stpl-001"), quantity: 2, ai_reasoning: "500g spaghetti serves 2 people; 2 packs for 3 people", alternatives: [getProduct("stpl-009"), getProduct("stpl-001")] },
        { ...getProduct("stpl-002"), quantity: 1, ai_reasoning: "Extra virgin olive oil - essential for authentic aglio olio", alternatives: [getProduct("stpl-008"), getProduct("stpl-002")] },
        { ...getProduct("frsh-004"), quantity: 1, ai_reasoning: "Fresh garlic - the star ingredient of aglio olio", alternatives: [getProduct("frsh-004"), getProduct("frsh-004")] },
        { ...getProduct("stpl-010"), quantity: 1, ai_reasoning: "Red chilli flakes for that signature heat", alternatives: [getProduct("stpl-010"), getProduct("stpl-010")] },
      ],
    },
    3: {
      occasionTitle: "Birthday Party for 20 Kids 🎂",
      parsedIntent: { occasion: "birthday", person_count: 20, time_context: "afternoon", dietary: [], exclusions: [] },
      regionalProducts: [],
      cart: [
        { ...getProduct("snk-006"), quantity: 20, ai_reasoning: "1 gems pack per child - colorful party favourite", alternatives: [getProduct("snk-011"), getProduct("snk-008")] },
        { ...getProduct("bev-008"), quantity: 4, ai_reasoning: "Pack of 6 each - 24 drinks for 20 kids, enough for extras", alternatives: [getProduct("bev-001"), getProduct("bev-005")] },
        { ...getProduct("snk-001"), quantity: 10, ai_reasoning: "1 bag serves 2 kids - 10 bags for 20 children", alternatives: [getProduct("snk-003"), getProduct("snk-012")] },
        { ...getProduct("snk-011"), quantity: 4, ai_reasoning: "Oreo pack serves 6; 4 packs covers 20 kids with extras", alternatives: [getProduct("snk-007"), getProduct("snk-009")] },
      ],
    },
    4: {
      occasionTitle: "Quick Breakfast for 2 ☀️",
      parsedIntent: { occasion: "breakfast", person_count: 2, time_context: "morning", dietary: [], exclusions: [] },
      regionalProducts: [],
      cart: [
        { ...getProduct("stpl-003"), quantity: 1, ai_reasoning: "1 loaf serves 4 people - plenty for 2 people's breakfast", alternatives: [getProduct("stpl-013"), getProduct("stpl-003")] },
        { ...getProduct("dair-001"), quantity: 1, ai_reasoning: "100g butter is plenty for 2 people's breakfast toast", alternatives: [getProduct("dair-004"), getProduct("dair-001")] },
        { ...getProduct("bev-002"), quantity: 1, ai_reasoning: "250g tea makes ~50 cups - sufficient for 2 people's morning chai", alternatives: [getProduct("bev-007"), getProduct("bev-002")] },
        { ...getProduct("stpl-012"), quantity: 1, ai_reasoning: "12 eggs serve 4 - perfect for 2 people's omelette and extras", alternatives: [getProduct("stpl-012"), getProduct("stpl-012")] },
      ],
    },
    5: {
      occasionTitle: "Pasta Kit 🍝",
      parsedIntent: { occasion: "cooking", person_count: 2, time_context: "evening", dietary: [], exclusions: [] },
      regionalProducts: [],
      cart: [
        { ...getProduct("stpl-001"), quantity: 1, ai_reasoning: "The base spaghetti for your pasta dish", alternatives: [getProduct("stpl-009"), getProduct("stpl-001")] },
        { ...getProduct("stpl-002"), quantity: 1, ai_reasoning: "Essential olive oil to complete the dish", alternatives: [getProduct("stpl-008"), getProduct("stpl-002")] },
      ],
    },
  };

  return fallbacks[scenario];
}
