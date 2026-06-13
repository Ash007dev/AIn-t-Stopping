# Implementation Plan: IntentCart

## Overview

Implement the IntentCart Next.js 14 App Router application as a 4-agent AI pipeline that converts plain-language shopping intent into a composed, quantity-correct cart in under 6 seconds. Implementation proceeds in layers: project scaffolding → data models & validation → AI agent utilities → API routes → Zustand store → UI pages and components → integration wiring → testing.

All code is TypeScript. Property-based tests use fast-check with a minimum of 100 iterations. Unit/component tests use Vitest + React Testing Library. The VoiceButton is a disabled stub throughout the initial build.

---

## Tasks

- [ ] 1. Scaffold project structure and core type definitions
  - Initialise a Next.js 14 App Router project with TypeScript, Tailwind CSS, and the following dependencies: `@google/generative-ai`, `zustand`, `fuse.js`, `fast-check`, `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/jest-dom`, `nanoid`
  - Create directory structure: `app/`, `app/api/`, `components/`, `lib/`, `lib/agents/`, `store/`, `public/`
  - Create `lib/types.ts` exporting all shared interfaces: `HouseholdProfile`, `Product`, `CartProduct`, `ParsedIntent`, `CartDiff`, `GenerateCartRequest`, `GenerateCartResponse`, `ModifyCartRequest`
  - Create `.env.local.example` documenting `GEMINI_API_KEY`
  - Configure `vitest.config.ts` with jsdom environment, `@testing-library/jest-dom` setup file, and path aliases matching `tsconfig.json`
  - _Requirements: 9.1, 14.3, 14.4, 14.5_

- [ ] 2. Build catalog data layer and validation
  - [ ] 2.1 Create `products.json` with ≥50 products spanning all 6 categories (snacks, beverages, fresh produce, dairy, pantry staples, cleaning supplies), each with all required fields in valid ranges, with `occasion_tags`, `region_tags`, `keywords`, and `sample_reviews`
    - Include entries tagged for at least the 5 canonical demo scenarios: "movie night", "pasta/aglio olio", "birthday party/kids", "breakfast", and "spaghetti/frictionless"
    - Include at least 4 products per major region string (Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad)
    - _Requirements: 9.2, 9.3, 14.1_
  - [ ] 2.2 Create `lib/catalog.ts` with `loadCatalog()` that reads `products.json` at module scope (cached), validates every entry using `validateProduct()`, logs warnings for excluded products, and exports the validated array
    - `validateProduct(p)` checks all required fields and value ranges as specified in Requirement 9.3; returns `{ valid: boolean; field?: string }`
    - _Requirements: 9.1, 9.4, 9.5_
  - [ ]* 2.3 Write property test for catalog product exclusion (Property 12)
    - **Property 12: Catalog Product Exclusion on Invalid Data**
    - **Validates: Requirements 9.4, 9.5**
    - Use `fc.record({ ...productFields })` with one field randomly set to an out-of-range value; call `validateProduct(p)`; assert product is excluded and `console.warn` called with `id` and offending field name

- [ ] 3. Build validation utilities
  - [ ] 3.1 Create `lib/validation.ts` exporting `validatePinCode(s: string)` and `validateServingCount(n: number)` — each returns `{ valid: boolean; error?: string }` and has no side effects
    - `validatePinCode`: empty → error; non-numeric → error; length ≠ 6 → error; otherwise valid
    - `validateServingCount`: n < 1 or n > 50 → error; otherwise valid
    - _Requirements: 2.3, 2.4_
  - [ ]* 3.2 Write property test for pin code validation (Property 1)
    - **Property 1: Pin Code Validation Rejects All Invalid Formats**
    - **Validates: Requirements 2.3**
    - Use `fc.string()` filtered to invalid pin codes (empty, non-numeric, wrong length); assert `validatePinCode(s).valid === false`
  - [ ]* 3.3 Write property test for serving count validation (Property 2)
    - **Property 2: Serving Count Validation Rejects Out-of-Range Values**
    - **Validates: Requirements 2.4**
    - Use `fc.integer().filter(n => n < 1 || n > 50)`; assert `validateServingCount(n).valid === false`

- [ ] 4. Build region resolution utility
  - [ ] 4.1 Create `lib/region-map.ts` exporting `REGION_MAP` and `resolveRegion(pinCode: string): string | null`
    - Map must include at minimum: `"110"→"Delhi"`, `"400"→"Mumbai"`, `"560"→"Bangalore"`, `"600"→"Chennai"`, `"700"→"Kolkata"`, `"500"→"Hyderabad"`
    - Returns `null` for unrecognised prefixes
    - _Requirements: 12.1, 12.2_

- [ ] 5. Build Gemini agent utility
  - [ ] 5.1 Create `lib/agents/gemini-client.ts` exporting `invokeGeminiAgent(systemPrompt, userMessage, tier: "pro" | "flash"): Promise<string>`
    - Initialise `GoogleGenerativeAI` with `process.env.GEMINI_API_KEY!`
    - Maintain `MODEL_CANDIDATES` with `pro: ["gemini-2.5-pro", "gemini-2.0-pro", "gemini-pro"]` and `flash: ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash"]`
    - Resolve first available model by catching 404/model-not-found errors; cache resolved model per tier in module scope
    - Combine system prompt + user message and call `model.generateContent(...)`; return `result.response.text()`
    - On Gemini API throw, catch and throw a typed error `{ error: "AI service unavailable" }`
    - _Requirements: 4.7, 5.3, 6.1, 8.7, 14.5_

- [ ] 6. Implement AI agents
  - [ ] 6.1 Create `lib/agents/intent-parser.ts` exporting `invokeIntentParser(intentText: string, profile: HouseholdProfile): Promise<ParsedIntent>`
    - System prompt: instruct model to return only JSON with exactly `{ occasion, person_count, time_context, dietary, exclusions }`; inject profile serving count as fallback: "if person_count not mentioned, use {servingCount}; if that is 0 or absent, use 1"
    - `generationConfig: { maxOutputTokens: 256 }`, tier: `"flash"`
    - On JSON parse error or missing fields, return `{ error: "..." }`
    - Export helper `resolvePersonCount(parsed, profileServingCount)` and `deduplicateDietary(arr)` as pure functions for unit testing
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_
  - [ ]* 6.2 Write property test for Intent_Parser schema completeness (Property 4)
    - **Property 4: Intent_Parser Output Schema Completeness**
    - **Validates: Requirements 4.1**
    - Use `fc.string({ minLength: 1 })` as mock Gemini responses; call `parseIntentOutput(mockResponse)`; assert all 5 fields present with correct types
  - [ ]* 6.3 Write property test for person count fallback chain (Property 5)
    - **Property 5: Intent_Parser Person Count Fallback Chain**
    - **Validates: Requirements 4.2, 4.3**
    - Use `fc.record({ intentText: fc.string(), profileServingCount: fc.integer() })`; call `resolvePersonCount()`; assert correct fallback: profile value when ≥1, 1 when 0 or absent
  - [ ]* 6.4 Write property test for dietary deduplication (Property 6)
    - **Property 6: Intent_Parser Dietary Deduplication**
    - **Validates: Requirements 4.4**
    - Inject arrays with duplicate dietary keywords; call `deduplicateDietary(arr)`; assert each distinct keyword appears at most once
  - [ ] 6.5 Create `lib/agents/cart-curator.ts` exporting `invokeCartCurator(parsed: ParsedIntent, catalog: Product[]): Promise<{ id: string; ai_reasoning: string }[]>`
    - System prompt: instructs model to select product IDs from catalog matching parsed intent; dietary/exclusion filtering at both prompt level and hard filter after response
    - `generationConfig: { maxOutputTokens: 1024 }`, tier: `"pro"`
    - Export pure `filterAndSelectProducts(parsed, catalog)` for property testing
    - _Requirements: 5.1, 5.4, 5.5, 5.6, 5.7_
  - [ ]* 6.6 Write property test for cart product selection invariants (Property 8)
    - **Property 8: Cart Product Selection Invariants**
    - **Validates: Requirements 5.1, 5.4, 5.5, 5.6**
    - Generate arbitrary `ParsedIntent` and catalog subsets; call `filterAndSelectProducts()`; assert: occasion_tag match, no dietary-excluded products, all `in_stock === true`, cardinality between 3 and 15
  - [ ] 6.7 Create `lib/agents/quantity-calibrator.ts` exporting `invokeQuantityCalibrator(personCount: number, products: { id: string; serving_size: number }[]): Promise<{ id: string; quantity: number }[]>`
    - System prompt: compute `ceil(person_count / serving_size)` for each product; `generationConfig: { maxOutputTokens: 512 }`, tier: `"flash"`
    - Export pure `calculateQuantity(personCount, servingSize)` for property testing
    - Skip products where `serving_size ≤ 0` with `console.warn`
    - _Requirements: 5.2, 5.3, 5.8_
  - [ ]* 6.8 Write property test for quantity calibration formula (Property 7)
    - **Property 7: Quantity Calibration Formula**
    - **Validates: Requirements 5.2**
    - Use `fc.record({ personCount: fc.integer({ min: 1, max: 500 }), servingSize: fc.integer({ min: 1, max: 9999 }) })`; assert `calculateQuantity(personCount, servingSize) === Math.ceil(personCount / servingSize)`
  - [ ] 6.9 Create `lib/agents/modification-handler.ts` exporting `invokeModificationHandler(modText: string, currentCart: CartProduct[]): Promise<CartDiff | { error: string }>`
    - System prompt: return only JSON `{ add, remove, modify }`; `generationConfig: { maxOutputTokens: 512 }`, tier: `"flash"`
    - Export pure `parseModificationResponse(raw)` for property testing
    - _Requirements: 8.4, 8.6, 8.7_
  - [ ]* 6.10 Write property test for modification diff structure (Property 17)
    - **Property 17: Modification Diff Structure**
    - **Validates: Requirements 8.4**
    - Mock Gemini returning various response shapes; call `parseModificationResponse(raw)`; assert only valid `{ add, remove, modify }` or `{ error: string }` shapes pass validation

- [ ] 7. Checkpoint — core library tests
  - Ensure all property tests in tasks 2.3, 3.2, 3.3, 6.2–6.4, 6.6, 6.8, 6.10 pass with `vitest --run`
  - Ask the user if questions arise before proceeding to API routes.

- [ ] 8. Implement API route handlers
  - [ ] 8.1 Create `app/api/catalog/route.ts` implementing `GET /api/catalog`
    - Call `loadCatalog()` and return the validated product array as JSON
    - On `loadCatalog()` throw, return HTTP 500 with `{ error: "Catalog unavailable" }`
    - _Requirements: 9.1_
  - [ ] 8.2 Create `app/api/generate-cart/route.ts` implementing `POST /api/generate-cart`
    - Parse and validate request body (`intentText` max 300 chars, `householdProfile`)
    - Step 1: `Promise.all([invokeIntentParser(...), loadCatalog()])` — parse + catalog in parallel
    - Guard: if parser returns `error` field, return HTTP 400 `{ error }`
    - Step 2: `Promise.all([invokeCartCurator(parsed, catalog), invokeQuantityCalibrator(parsed.person_count, products)])` — curate + calibrate in parallel
    - Filter regional products from catalog using `resolveRegion`
    - Guard: if Cart_Curator returns < 3 products, return HTTP 400 `{ error: "Not enough matching products" }`
    - Merge into `GenerateCartResponse` and return HTTP 200
    - Wrap all Gemini errors and return HTTP 503 with `{ error: "AI service unavailable" }`
    - _Requirements: 4.5, 4.6, 5.3, 5.6, 5.7, 6.1, 6.2, 6.3, 12.1, 12.6_
  - [ ] 8.3 Create `app/api/modify/route.ts` implementing `POST /api/modify`
    - Parse request body (`modificationText` max 300 chars, `currentCart`)
    - Call `invokeModificationHandler(modText, currentCart)`
    - Return diff on success (HTTP 200) or error (HTTP 400)
    - On Gemini throw, return HTTP 503
    - _Requirements: 8.4, 8.6, 8.7_

- [ ] 9. Build cart utility functions
  - [ ] 9.1 Create `lib/cart-utils.ts` exporting `computeCartTotal(items: CartProduct[])`, `applyDiffToCart(cart, diff)`, and `applySwitch(cart, cardIndex, alternativeId)`
    - `computeCartTotal`: returns `Σ (product.price × product.quantity)` for all items
    - `applySwitch`: replaces primary product; ensures the alternative does not appear in its own 2 alternative slots
    - `applyDiffToCart`: applies `add`, `remove`, `modify` arrays to produce new cart state
    - _Requirements: 7.4, 7.7, 8.4, 8.5_
  - [ ]* 9.2 Write property test for cart total price invariant (Property 9)
    - **Property 9: Cart Total Price Invariant**
    - **Validates: Requirements 7.7**
    - Use `fc.array(fc.record({ price: fc.float({ min: 0.01, max: 99999.99 }), quantity: fc.integer({ min: 1, max: 100 }) }), { minLength: 1 })`; assert `computeCartTotal(items) === items.reduce((sum, i) => sum + i.price * i.quantity, 0)`
  - [ ]* 9.3 Write property test for product switch invariants (Property 11)
    - **Property 11: Product Switch Invariants**
    - **Validates: Requirements 7.4**
    - Generate random carts with alternatives; call `applySwitch(cart, cardIndex, alternativeId)`; assert: original product absent, alternative in primary slot, alternative not in its own alternative slots, total recalculated correctly

- [ ] 10. Build Fuse.js integration for frictionless mode
  - [ ] 10.1 Create `lib/fuse-search.ts` exporting `findProduct(query: string, catalog: Product[]): Product | null` and `findComplementary(product: Product, catalog: Product[]): Product[]`
    - `findProduct`: Fuse.js with `keys: ["name", "keywords"]`, `threshold: 0.4`, `ignoreLocation: true`; returns null if no result or score > 0.4
    - `findComplementary`: returns products sharing ≥1 string between `occasion_tags ∪ keywords` with the submitted product; returns 2–5 results
    - _Requirements: 10.1, 10.2, 10.6_
  - [ ]* 10.2 Write property test for frictionless complementary tag overlap (Property 13)
    - **Property 13: Frictionless Complementary Tag Overlap**
    - **Validates: Requirements 10.2**
    - Generate random product and catalog; call `findComplementary(product, catalog)`; assert every result shares ≥1 tag/keyword with the submitted product

- [ ] 11. Build Zustand store
  - [ ] 11.1 Create `store/useAppStore.ts` implementing the full `AppStore` interface with `persist` middleware using `sessionStorage` (key `intent_cart_session`)
    - Actions: `setMode`, `setPipelineRunning`, `setCartResult`, `switchProduct` (calls `applySwitch`), `applyDiff` (calls `applyDiffToCart`), `clearCart`, `setModificationError`
    - `setCartResult` sets `cart`, `regionalProducts`, `occasionTitle`, `parsedIntent` atomically
    - _Requirements: 7.4, 7.7, 8.4, 11.4_

- [ ] 12. Build shared UI components
  - [ ] 12.1 Create `components/StarRating.tsx` — pure display, accepts `rating: number` (1.0–5.0), renders filled/half/empty SVG stars; accessible `aria-label`
    - _Requirements: 7.2_
  - [ ] 12.2 Create `components/BestsellerBadge.tsx` — renders badge only when `is_bestseller` is true; otherwise returns null
    - _Requirements: 7.2_
  - [ ] 12.3 Create `components/ReviewCard.tsx` — renders author and review text
    - _Requirements: 7.2_
  - [ ] 12.4 Create `components/AlternativeCard.tsx` — renders alternative product with "Switch to this" button; calls `onSwitch` prop
    - _Requirements: 7.3, 7.4_
  - [ ] 12.5 Create `components/ProductCard.tsx` implementing the full `ProductCardProps` interface
    - Renders: image, name, brand, `StarRating`, review count, `BestsellerBadge`, quantity with reason, unit price, line total, ETA in minutes, best-before (shown only when `expiry_months` present and ≤18), AI reasoning truncated at 160 chars, exactly 2 `ReviewCard`s, exactly 2 `AlternativeCard`s
    - _Requirements: 7.2, 7.3, 7.4_
  - [ ]* 12.6 Write property test for ProductCard renders all required fields (Property 10)
    - **Property 10: ProductCard Renders All Required Fields**
    - **Validates: Requirements 7.2**
    - Generate arbitrary valid `CartProduct` objects; render `<ProductCard />`; assert product name, brand, star rating, review count, quantity, unit price, line total, ETA, AI reasoning (≤160 chars in DOM), and exactly 2 ReviewCard elements are present
  - [ ] 12.7 Create `components/VoiceButton.tsx` — stub only: renders `<button disabled aria-disabled="true" title="Voice input coming soon" />`; `onTranscript` prop accepted but never called
    - _Requirements: 3.6, 3.7, 8.2 (deferred voice input)_
  - [ ] 12.8 Create `components/HintChip.tsx` — renders clickable chip; `label` trimmed to ≤30 chars at render time; calls `onClick` prop
    - _Requirements: 8.3_
  - [ ] 12.9 Create `components/ModificationBar.tsx` implementing `ModificationBarProps`
    - Sticky `position: fixed; bottom: 0`
    - Text input capped at 300 chars; submits on Enter or send button tap
    - Renders 2–5 `HintChip`s from a static hints array
    - Renders stubbed `VoiceButton`
    - Inline error display for modification failures and timeouts
    - 3-second `AbortController` timeout; on timeout display timeout message, do not alter cart
    - Calls `POST /api/modify`, on success calls `onApplyDiff`
    - _Requirements: 8.1, 8.2, 8.3, 8.5, 8.6, 8.7, 8.8_
  - [ ]* 12.10 Write property test for modification hint chip constraints (Property 16)
    - **Property 16: Modification Hint Chip Constraints**
    - **Validates: Requirements 8.3**
    - Render `<ModificationBar />`; count HintChip elements; assert count is between 2 and 5; assert each chip label is ≤30 chars
  - [ ] 12.11 Create `components/PipelineProgress.tsx` — animated spinner/progress indicator displayed while AI pipeline is running
    - _Requirements: 3.4_
  - [ ] 12.12 Create `components/ModeCard.tsx` — renders a single mode selection card with icon, title, and description; calls `onSelect` on click
    - _Requirements: 1.1, 1.4_
  - [ ] 12.13 Create `components/IntentInput.tsx` — controlled textarea capped at 300 chars with visible character counter; shows inline validation error on whitespace-only submit; calls `onSubmit` prop; disables submit during pipeline run
    - _Requirements: 3.1, 3.2, 3.4_
  - [ ]* 12.14 Write property test for intent whitespace rejection (Property 3)
    - **Property 3: Intent Whitespace Rejection**
    - **Validates: Requirements 3.2**
    - Use `fc.string().filter(s => s.trim() === "")`; render `<IntentInput />`; set value and submit; assert inline error shown and `fetch` mock not called

- [ ] 13. Checkpoint — component tests
  - Ensure all property tests in tasks 9.2, 9.3, 12.6, 12.10, 12.14 pass with `vitest --run`
  - Ensure `computeCartTotal`, `applySwitch`, `applyDiffToCart` unit tests pass
  - Ask the user if questions arise before proceeding to page implementations.

- [ ] 14. Implement app pages
  - [ ] 14.1 Create `app/setup/page.tsx` — Household Profile Setup
    - Controlled form with `pinCode` (text), `servingCount` (number stepper), `dietary` (select: "No restriction" | "Vegetarian" | "Jain")
    - On mount: read `localStorage.getItem("household_profile")` and pre-populate fields
    - On submit: call `validatePinCode` and `validateServingCount`; show inline errors adjacent to fields on failure; on success write `localStorage.setItem("household_profile", JSON.stringify(values))` and `router.push("/")`
    - Responsive: single-column layout 320px–767px, full layout ≥1280px
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  - [ ] 14.2 Create `app/page.tsx` — Home / Mode Selection
    - On mount: check `localStorage` for `household_profile`; if absent, `router.replace("/setup")`
    - Renders three `ModeCard` components; on click: calls `setMode(...)` in Zustand store and `router.push("/intent")`
    - Frictionless Add-on card sets mode and navigates to `/intent` with add-on mode active
    - Responsive: row layout ≥1280px, stacked ≤767px
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [ ] 14.3 Create `app/intent/page.tsx` — Intent Input Page
    - Reads `selectedMode` from Zustand; sets placeholder text based on mode
    - Renders `IntentInput` and disabled `VoiceButton` stub
    - Renders `PipelineProgress` while `isPipelineRunning` is true
    - On submit: set `setPipelineRunning(true)`, `POST /api/generate-cart` with 10s `AbortController` timeout, on success call `setCartResult(...)` and `router.push("/cart")`, on error display inline error and re-enable submit, on timeout display timeout error and re-enable submit
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_
  - [ ] 14.4 Create `app/cart/page.tsx` — Smart Cart Page
    - Reads `cart`, `regionalProducts`, `occasionTitle` from Zustand
    - Renders occasion title, ETA badge (max across all products), cart total, `ProductCard` list
    - Renders `RegionalSection` ("📍 Popular in [City]") if `regionalProducts.length > 0`
    - Renders `ModificationBar` at bottom; on `onApplyDiff` call: calls `applyDiff(diff)` in store and highlight affected cards for 3 seconds
    - Empty cart state: show empty-cart message, hide checkout button and total
    - Checkout button fixed to bottom viewport; navigates to `/checkout`
    - Responsive: multi-column ≥1280px, single-column ≤767px
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 8.1–8.8, 12.2, 12.3, 12.4, 12.5_
  - [ ] 14.5 Create `app/checkout/page.tsx` — Checkout Page
    - On mount: if `cart` is empty/absent in sessionStorage, `router.replace("/cart")`
    - Renders read-only order summary: occasion title, product list (name, quantity, line total), subtotal, ₹0 delivery fee, grand total, max ETA across products, "Place Order" button
    - On "Place Order": 1.5s delay via `setTimeout`, generate `ORD-${nanoid(6).toUpperCase()}`, display confirmation, then `sessionStorage.removeItem("intent_cart_session")` inside `useEffect` watching `orderConfirmed`
    - Responsive: no horizontal scroll, all product names visible at 320px–1920px
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  - [ ]* 14.6 Write property test for checkout page renders all required fields (Property 14)
    - **Property 14: Checkout Page Renders All Required Fields**
    - **Validates: Requirements 11.3**
    - Generate arbitrary non-empty `CartProduct[]`; render `/checkout` with that cart in store; assert occasion title, each product name/quantity/line total, subtotal, ₹0 delivery fee, grand total, max ETA, and "Place Order" button are present in DOM
  - [ ]* 14.7 Write property test for regional section cardinality and tag correctness (Property 15)
    - **Property 15: Regional Section Cardinality and Tag Correctness**
    - **Validates: Requirements 12.1, 12.3, 12.4**
    - Generate catalogs with known `region_tags` and pin codes; call `filterRegionalProducts(catalog, region)`; assert result count is `min(4, count)` and every displayed product has the resolved region string in `region_tags`

- [ ] 15. Checkpoint — full page render and navigation tests
  - Run `vitest --run` to confirm all property tests and component tests pass
  - Verify `/setup` → profile write → redirect to `/` → select mode → `/intent` → pipeline → `/cart` → modification → `/checkout` → place order flow compiles and links correctly
  - Ask the user if questions arise before proceeding to integration wiring.

- [ ] 16. Wire integration and smoke tests
  - [ ] 16.1 Create `tests/smoke/catalog-integrity.test.ts`
    - Assert `products.json` has ≥50 entries
    - Assert all 6 required categories are present
    - Assert no client-side file imports `@google/generative-ai` (search via `fs.readFileSync` on `app/` directory, excluding `app/api/`)
    - _Requirements: 9.2, 14.5_
  - [ ] 16.2 Create `tests/integration/pipeline.test.ts` — guarded by `CI_INTEGRATION=true` environment flag
    - Tests: pipeline latency ≤6000ms, parallel execution wall-clock check, all 5 canonical scenarios return ≥1 product with no exceptions, 10-run consistency check (≥80% category overlap), Intent_Parser latency <2000ms, Modification_Handler latency <3000ms
    - Each test calls the real Gemini API; tagged with `// Feature: intent-cart` comments
    - _Requirements: 4.7, 5.3, 6.1, 6.2, 6.3, 8.7, 14.1, 14.2_

- [ ] 17. Final checkpoint — all tests pass
  - Run `vitest --run` confirming all unit and property tests pass
  - Confirm smoke tests pass (catalog integrity, no client-side Gemini imports, env var check)
  - Ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP pass — they are property/unit tests that validate correctness invariants but are not blocking for a working demo.
- All non-optional tasks are required for a complete, shippable implementation.
- The `VoiceButton` component is a stub throughout the initial build; Requirement 13 (voice input) is deferred entirely.
- Checkpoints at tasks 7, 13, 15, and 17 gate progression between major phases.
- Property tests use `fc.assert(fc.property(...), { numRuns: 100 })` minimum.
- Integration tests (task 16.2) require `CI_INTEGRATION=true` and a valid `GEMINI_API_KEY` in `.env.local`.
- All Gemini API calls must remain server-side; never import `@google/generative-ai` in `app/` client components.

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "3.1", "4.1", "5.1"] },
    { "id": 1, "tasks": ["2.2", "6.1", "6.5", "6.7", "6.9", "9.1", "10.1"] },
    { "id": 2, "tasks": ["2.3", "3.2", "3.3", "6.2", "6.3", "6.4", "6.6", "6.8", "6.10", "9.2", "9.3", "10.2"] },
    { "id": 3, "tasks": ["8.1", "8.2", "8.3", "11.1", "12.1", "12.2", "12.3", "12.4", "12.7", "12.8"] },
    { "id": 4, "tasks": ["12.5", "12.9", "12.11", "12.12", "12.13"] },
    { "id": 5, "tasks": ["12.6", "12.10", "12.14"] },
    { "id": 6, "tasks": ["14.1", "14.2", "14.3"] },
    { "id": 7, "tasks": ["14.4", "14.5"] },
    { "id": 8, "tasks": ["14.6", "14.7"] },
    { "id": 9, "tasks": ["16.1", "16.2"] }
  ]
}
```
