# Design Document: IntentCart

## Overview

IntentCart is a Next.js 14 (App Router) web application that converts plain-language shopping intent into a fully composed, quantity-correct cart in under 6 seconds. It targets Amazon Now's mobile-first audience and must function as a reliable hackathon demo across 5 canonical scenarios.

The core value proposition is collapsing "product discovery → quantity decisions → cart assembly" into a single natural-language prompt. The system achieves this through a 4-agent AI pipeline running on Google Gemini Pro, with critical steps parallelised via `Promise.all` to meet the 6-second SLA.

Key design constraints driving every decision:
- **No backend persistence** — product data lives in `products.json`; user state lives in `localStorage`/`sessionStorage`
- **No authentication** — no identity layer of any kind
- **All Gemini API calls server-side** — never exposed to the browser
- **Mobile-first, 320px–1920px** — single responsive implementation, no separate mobile builds
- **Demo reliability** — 5 canonical scenarios must succeed 10/10 runs

---

## Architecture

### System Layers

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser (Client Layer)                                          │
│  ┌───────────────┐  ┌────────────────┐  ┌───────────────────┐  │
│  │  React Pages  │  │  Zustand Store │  │  localStorage /   │  │
│  │  (App Router) │  │  (cart state)  │  │  sessionStorage   │  │
│  └───────┬───────┘  └────────────────┘  └───────────────────┘  │
│          │  fetch()                                              │
└──────────┼──────────────────────────────────────────────────────┘
           │
┌──────────┼──────────────────────────────────────────────────────┐
│  Next.js API Routes (Server Layer)                               │
│          │                                                       │
│  ┌───────▼───────────────────────────────────────────────────┐  │
│  │  POST /api/generate-cart                                   │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Promise.all([                                       │  │  │
│  │  │    invokeIntentParser(intentText),    ← sequential   │  │  │
│  │  │    loadCatalog(),                     ← parallel     │  │  │
│  │  │    resolveRegion(pinCode)             ← parallel     │  │  │
│  │  │  ])                                                  │  │  │
│  │  │  → then Promise.all([                                │  │  │
│  │  │    invokeCartCurator(parsed, catalog),               │  │  │
│  │  │    invokeQuantityCalibrator(parsed)  ← parallel      │  │  │
│  │  │  ])                                                  │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─────────────────────┐   ┌──────────────────────────────┐     │
│  │  POST /api/modify   │   │  GET /api/catalog             │     │
│  │  (Modification_     │   │  (products.json → validated) │     │
│  │   Handler)          │   └──────────────────────────────┘     │
│  └─────────────────────┘                                        │
└──────────┬───────────────────────────────────────────────────────┘
           │  @google/generative-ai
┌──────────▼───────────────────────────────────────────────────────┐
│  Google Gemini API (model resolved dynamically)                   │
│  ┌─────────────────┐  ┌──────────────────────────────────────┐   │
│  │  Intent_Parser  │  │  Cart_Curator + Quantity_Calibrator  │   │
│  │  (Agent 1)      │  │  (Agents 2 & 3, parallel)           │   │
│  └─────────────────┘  └──────────────────────────────────────┘   │
│  ┌─────────────────────┐                                          │
│  │  Modification_      │                                          │
│  │  Handler (Agent 4)  │                                          │
│  └─────────────────────┘                                          │
└──────────────────────────────────────────────────────────────────┘
```

### Execution Timeline (6-second budget)

```
t=0ms   Client submits intent
t=0ms   Server starts: loadCatalog() + resolveRegion() + IntentParser call begin in parallel
t=~800ms  Intent_Parser returns parsed JSON
t=~800ms  Cart_Curator + Quantity_Calibrator begin (catalog already loaded)
t=~2800ms  Cart_Curator returns product selection
t=~2800ms  Quantity_Calibrator returns quantities
t=~2900ms  Server merges results, serialises response
t=~3000ms  Client receives full cart payload; renders /cart
```

The two sequential Gemini API calls (parse → curate) are the critical path. Parallelising catalog loading with the parse call and curating/calibrating in parallel saves ~1.5 seconds versus a naive sequential approach.

### Route Structure

| Route | Type | Description |
|---|---|---|
| `/` | Client Page | Mode selection; redirects to `/setup` if no profile |
| `/setup` | Client Page | Household_Profile form |
| `/intent` | Client Page | Natural language input + voice capture |
| `/cart` | Client Page | Smart_Cart display + Modification_Bar |
| `/checkout` | Client Page | Read-only order summary + Place Order |
| `/api/generate-cart` | Route Handler | Orchestrates full AI pipeline |
| `/api/modify` | Route Handler | Invokes Modification_Handler |
| `/api/catalog` | Route Handler | Reads and validates products.json |

---

## Components and Interfaces

### Page Components

#### `app/page.tsx` — Home / Mode Selection
- Renders three `ModeCard` components (Shopping by Intent, Cooking/Fresh, Frictionless Add-on)
- Reads `household_profile` from `localStorage` on mount; redirects to `/setup` if absent
- Passes selected mode to the Zustand `useAppStore` before navigating to `/intent`
- **Recent orders row**: on mount, reads `purchaseHistory` from Zustand store. If non-empty, renders a "Recent orders" row below the mode cards showing up to 3 chips (most recent first, ordered by `createdAt` descending). Each chip displays `occasionTitle`. On chip tap: calls `setPrefillIntent(occasionTitle)` and navigates to `/intent`. The row is hidden entirely when `purchaseHistory` is empty.
- On mobile (≤767px), the "Recent orders" chips row is horizontally scrollable with no vertical overflow.
- **Responsive**: row layout ≥1280px, stacked ≤767px

#### `app/setup/page.tsx` — Household Profile Setup
- Controlled form with four fields: `pinCode` (text), `servingCount` (number stepper), `budget` (optional numeric input), `dietary` (select)
- The `budget` field is positioned between `servingCount` and `dietary`; it is optional — blank maps to `null`
- On mount: reads existing profile from `localStorage` and pre-populates fields (including `budget` if present)
- On submit: validates pin code, serving count, and budget (if non-empty: must be integer ≥ 1; show inline error adjacent to field on failure) → writes `localStorage` (including `budget` as number or null) → pushes to `/`
- Inline validation errors rendered adjacent to each field

#### `app/intent/page.tsx` — Intent Input
- Reads `mode` from Zustand store; sets placeholder text accordingly
- On mount: reads `prefillIntent` from Zustand store; if non-null, pre-fills the intent textarea and calls `setPrefillIntent(null)` immediately after
- Contains `IntentInput` (textarea, 300-char cap, char counter) and `VoiceButton` (**stubbed/disabled** in initial build — renders as a disabled placeholder; SARVAM AI voice input is deferred)
- On submit: `POST /api/generate-cart` → stores result in Zustand → navigate to `/cart`
- Shows `PipelineProgress` spinner during API call; disables submit button
- 10-second client-side timeout; re-enables submit on timeout

#### `app/cart/page.tsx` — Smart Cart
- Reads `cart` from Zustand store; renders `ProductCard` list
- Renders `RegionalSection` if profile has a resolvable pin code
- `ModificationBar` fixed at bottom
- Empty-cart state hides checkout button and total

#### `app/checkout/page.tsx` — Checkout
- Reads `cart` from Zustand store; redirects to `/cart` if empty
- Renders read-only order summary
- `Place Order` simulates 1.5s delay, generates `ORD-XXXXXX`, clears `sessionStorage` cart
- **Purchase history recording**: after order confirmation is visible in the DOM (inside the `useEffect` watching `orderConfirmed` state), calls `addToHistory({ orderId, occasionTitle, cartSnapshot: deepCopy(cart), createdAt: new Date().toISOString() })` before or alongside `clearCart()`. The `addToHistory` action handles the `localStorage` write atomically.

### Shared UI Components

#### `ProductCard`
```typescript
interface ProductCardProps {
  product: CartProduct;
  alternatives: Product[];
  onSwitch: (productId: string, alternativeId: string) => void;
}
```
Renders: image, name, brand, `StarRating`, review count, `BestsellerBadge`, quantity with reason, unit price, line total, ETA, best-before (conditional), AI reasoning (truncated at 160 chars), 2 `ReviewCard`s, 2 `AlternativeCard`s with "Switch to this" buttons.

#### `ModificationBar`
```typescript
interface ModificationBarProps {
  cartId: string;
  onApplyDiff: (diff: CartDiff) => void;
}
```
Sticky `position: fixed; bottom: 0`. Contains text input (300-char cap), 2–5 `HintChip`s, and send button.

> **Voice button in ModificationBar**: The `VoiceButton` rendered inside `ModificationBar` is **stubbed/disabled** in the initial build (see `VoiceButton` component below). It appears as a disabled mic icon and does not capture audio. Full SARVAM AI-powered voice input is deferred to a later phase.

#### `VoiceButton` ⚠️ DEFERRED — Stub Only (Initial Build)

> **This component is out of scope for the initial implementation.** It will be rendered as a disabled or visually hidden placeholder in the initial build. Full voice input functionality will be added in a later phase.
>
> **Technology**: When implemented, voice input will use **SARVAM AI** (not Web_Speech_API) for transcription, with Web_Speech_API as a fallback if SARVAM AI is unavailable. No Web_Speech_API integration will be built as a primary voice method.
>
> **Initial build behaviour**: The `VoiceButton` component is stubbed — it renders as a disabled button (grayed out, `disabled` attribute set, `aria-disabled="true"`) or is conditionally hidden via a feature flag. It performs no recognition and fires no events.

```typescript
// Stub implementation — initial build
// Full implementation with SARVAM AI is deferred
interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}
// Rendered as: <button disabled aria-disabled="true" title="Voice input coming soon" />
```

#### `StarRating`
Pure display component. Accepts `rating: number` (1.0–5.0), renders filled/half/empty star icons using SVG.

#### `HintChip`
Renders a clickable chip that pre-fills the modification input. Labels sourced from a static array; each trimmed to ≤30 characters at render time.

### API Route Handlers

#### `POST /api/generate-cart`
```typescript
// Request
interface GenerateCartRequest {
  intentText: string;         // max 300 chars
  householdProfile: HouseholdProfile;  // budget included here
}

// Response
interface GenerateCartResponse {
  cart: CartProduct[];
  regionalProducts: Product[];
  occasionTitle: string;
  parsedIntent: ParsedIntent;
}
```
Orchestration logic:
1. `Promise.all([invokeIntentParser(intentText, profile), loadCatalog()])` — parse + catalog load in parallel
2. Guard: if parser returns `error` field, return 400 with error message
3. `Promise.all([invokeCartCurator(parsed, catalog, budget), invokeQuantityCalibrator(parsed, catalog)])` — curate + calibrate in parallel; `budget` is passed from `householdProfile.budget`
4. Filter regional products from catalog using `resolvedRegion`
5. Merge Cart_Curator and Quantity_Calibrator results into `mergedItems`
6. **Budget_Filter trim** (if `budget > 0` and `computeCartTotal(mergedItems) > budget`): sort `mergedItems` by `rating` ascending, remove items from the front one at a time until `computeCartTotal ≤ budget` or exactly 3 items remain; if 3 items remain and `computeCartTotal` still exceeds `budget`, return HTTP 400 `{ error: "Budget too low for a minimum cart" }`
7. Return `GenerateCartResponse` with trimmed cart, 200

#### `POST /api/modify`
```typescript
// Request
interface ModifyCartRequest {
  modificationText: string;   // max 300 chars
  currentCart: CartProduct[];
}

// Response — success
interface CartDiff {
  add: { product: Product; quantity: number }[];
  remove: string[];           // product IDs
  modify: { id: string; quantity: number }[];
}
// Response — error: { error: string }
```

#### `GET /api/catalog`
Returns the full validated catalog. Reads `products.json` at startup (or on first request), validates all entries, and caches in module scope to avoid re-reading on every request.

### AI Agent Interfaces

#### `invokeGeminiAgent(systemPrompt, userMessage, tier)`
Shared utility wrapping `@google/generative-ai`:
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Preferred model candidates in priority order.
// The utility tries each in sequence and uses the first one that responds successfully.
// This means the app works regardless of which specific model versions Google has available.
const MODEL_CANDIDATES = {
  pro:   ["gemini-2.5-pro", "gemini-2.0-pro", "gemini-pro"],
  flash: ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash"],
};

async function invokeGeminiAgent(
  systemPrompt: string,
  userMessage: string,
  tier: "pro" | "flash" = "flash",
): Promise<string>
```
At startup, the utility resolves the first available model from `MODEL_CANDIDATES[tier]` by attempting a lightweight availability check (or simply trying and catching a 404/model-not-found error on the first real call). This means the app automatically adapts to whatever Gemini models Google has available without requiring a config change.

All prompts instruct the model to return only valid JSON. The system prompt and user message are combined and passed to `model.generateContent(...)`. The response text is extracted from `result.response.text()` and parsed as JSON.

**Tier selection per agent** (model resolved dynamically from candidates list):
- `Intent_Parser` → `flash` tier (small structured output, latency-sensitive)
- `Cart_Curator` → `pro` tier (large catalog input, reasoning-heavy)
- `Quantity_Calibrator` → `flash` tier (deterministic math, minimal tokens)
- `Modification_Handler` → `flash` tier (moderate input, fast response needed)

#### Intent_Parser System Prompt Strategy
- Instructed to return exactly: `{ occasion, person_count, time_context, dietary, exclusions }`
- Person count fallback: injected into system prompt as "if person_count not mentioned, use {profile.servingCount}; if that is 0 or absent, use 1"
- **Tier**: `flash` (first available from `MODEL_CANDIDATES.flash`)
- `generationConfig: { maxOutputTokens: 256 }` — tight budget since output is small structured JSON

#### Cart_Curator System Prompt Strategy
- Receives: parsed intent JSON + catalog JSON (full products.json)
- Instructed to return array of product IDs with AI reasoning strings
- Dietary/exclusion filtering is both prompt-level (instructed) and code-level (hard filter after response)
- **Budget prompt injection**: when `budget > 0`, the following instruction is appended to the system prompt: `"The total cart price must not exceed ₹{budget}. Prioritise lower-priced products that meet quality thresholds."`
- **Tier**: `pro` (first available from `MODEL_CANDIDATES.pro` — large context input, reasoning-heavy)
- `generationConfig: { maxOutputTokens: 1024 }`

#### Quantity_Calibrator System Prompt Strategy
- **Runs in parallel with Cart_Curator**
- Receives: `person_count` + array of `{ id, serving_size }` tuples for all products
- Computes `ceil(person_count / serving_size)` — while this is pure math, running it through Gemini allows a single unified pipeline. *Note: for production, this would be a pure TypeScript function; for the hackathon, it runs as a Gemini call to keep the "4-agent" demo narrative intact. The calculation is deterministic and verified by the Quantity_Calibrator property.*
- **Tier**: `flash` (first available from `MODEL_CANDIDATES.flash`)
- `generationConfig: { maxOutputTokens: 512 }`

#### Modification_Handler System Prompt Strategy
- Receives: current cart state + modification text
- Returns diff object `{ add, remove, modify }`
- **Tier**: `flash` (first available from `MODEL_CANDIDATES.flash`)
- `generationConfig: { maxOutputTokens: 512 }`

---

## Data Models

### `HouseholdProfile`
```typescript
interface HouseholdProfile {
  pinCode: string;            // exactly 6 numeric digits
  servingCount: number;       // 1–50
  budget: number | null;      // ≥1 INR, or null for no limit
  dietary: "No restriction" | "Vegetarian" | "Jain";
}
```
Stored under `localStorage` key `household_profile` as JSON.

### `PurchaseRecord`
```typescript
interface PurchaseRecord {
  orderId: string;            // format: ORD-XXXXXX
  occasionTitle: string;      // from cart's occasionTitle at time of order
  cartSnapshot: CartProduct[]; // deep copy of cart at time of placement
  createdAt: string;          // ISO 8601 timestamp
}
```
Stored in `localStorage` under key `purchase_history` as a JSON array. Hydrated on store initialisation via `JSON.parse(localStorage.getItem('purchase_history') ?? '[]')`. This is managed with `localStorage` directly, separate from the Zustand `persist` middleware (which uses `sessionStorage` for the active cart).

---

### `Product` (Catalog entry)
```typescript
interface Product {
  id: string;                  // non-empty
  name: string;                // non-empty
  brand: string;               // non-empty
  category: "snacks" | "beverages" | "fresh produce" | "dairy" | "pantry staples" | "cleaning supplies";
  price: number;               // 0.01–99999.99
  rating: number;              // 1.0–5.0
  review_count: number;        // 0–999999
  is_bestseller: boolean;
  serving_size: number;        // 1–9999
  image_url: string;           // non-empty
  occasion_tags: string[];
  region_tags: string[];
  in_stock: boolean;
  eta_minutes: number;         // 1–180
  expiry_months: number | null; // 0–120 or null
  keywords: string[];
  sample_reviews: [
    { author: string; text: string },
    { author: string; text: string }
  ];
}
```

### `CartProduct`
```typescript
interface CartProduct extends Product {
  quantity: number;            // ceil(person_count / serving_size)
  ai_reasoning: string;        // max 160 chars rendered
  alternatives: Product[];     // exactly 2 elements
}
```

### `ParsedIntent`
```typescript
interface ParsedIntent {
  occasion: string | null;
  person_count: number | null;
  time_context: string | null;
  dietary: string[];
  exclusions: string[];
  error?: string;              // present only on parse failure
}
```

### `CartDiff`
```typescript
interface CartDiff {
  add: { product: Product; quantity: number }[];
  remove: string[];
  modify: { id: string; quantity: number }[];
}
```

### Region Map
```typescript
// lib/region-map.ts
// Maps pin code prefix (first 3 digits) to region/city name
const REGION_MAP: Record<string, string> = {
  "110": "Delhi",
  "400": "Mumbai",
  "560": "Bangalore",
  "600": "Chennai",
  "700": "Kolkata",
  "500": "Hyderabad",
  // ... extended as needed
};

function resolveRegion(pinCode: string): string | null {
  const prefix = pinCode.slice(0, 3);
  return REGION_MAP[prefix] ?? null;
}
```

### Zustand Store
```typescript
// store/useAppStore.ts
interface AppStore {
  // Mode
  selectedMode: "intent" | "cooking" | "addon" | null;
  setMode: (mode: AppStore["selectedMode"]) => void;

  // Pipeline state
  isPipelineRunning: boolean;
  setPipelineRunning: (v: boolean) => void;

  // Cart
  cart: CartProduct[];
  regionalProducts: Product[];
  occasionTitle: string;
  parsedIntent: ParsedIntent | null;
  setCartResult: (result: GenerateCartResponse) => void;
  switchProduct: (cardIndex: number, alternativeId: string) => void;
  applyDiff: (diff: CartDiff) => void;
  clearCart: () => void;

  // Modification
  modificationError: string | null;
  setModificationError: (e: string | null) => void;

  // Purchase History
  purchaseHistory: PurchaseRecord[];
  addToHistory: (record: PurchaseRecord) => void;

  // Intent pre-fill (home page chip → /intent)
  prefillIntent: string | null;
  setPrefillIntent: (v: string | null) => void;
}
```

**`addToHistory` behaviour**: appends the new `PurchaseRecord` to `purchaseHistory`, then writes the full updated array to `localStorage` under key `purchase_history`. It is called atomically alongside `clearCart` inside the "Place Order" flow (after order confirmation is visible in the DOM).

**`purchaseHistory` hydration**: on store initialisation, `purchaseHistory` is populated from `JSON.parse(localStorage.getItem('purchase_history') ?? '[]')`. This is separate from the Zustand `persist` middleware — purchase history uses `localStorage` directly (not `sessionStorage`).

**`prefillIntent` usage**: set to an `occasionTitle` string when a user taps a recent-order chip on the home page. Read and cleared on `/intent` page mount — the value pre-fills the intent input field, then `setPrefillIntent(null)` is called immediately after.

Cart state is also mirrored to `sessionStorage` (key `intent_cart_session`) on every mutation via a Zustand middleware (`persist` with `sessionStorage` as the backing store), satisfying the requirement that clearing `sessionStorage` after order placement removes the cart.

### `products.json` Schema Validation
Validation runs once at catalog load time in `lib/catalog.ts`. A product is excluded (with `console.warn`) if:
- Any required field is missing
- `price` not in [0.01, 99999.99]
- `rating` not in [1.0, 5.0]
- `review_count` not in [0, 999999]
- `serving_size` not in [1, 9999]
- `eta_minutes` not in [1, 180]
- `expiry_months` present and not in [0, 120]
- `sample_reviews` does not have exactly 2 entries

### `lib/validation.ts` — Validation Utilities

In addition to `validatePinCode` and `validateServingCount`, this module exports:

```typescript
function validateBudget(n: number | null): { valid: boolean; error?: string } {
  if (n === null) return { valid: true };            // null = no limit, always valid
  if (!Number.isInteger(n) || n < 1)
    return { valid: false, error: "Budget must be an integer ≥ 1" };
  return { valid: true };
}
```

Rules:
- `null` → valid (no budget limit)
- Non-integer or value < 1 → `{ valid: false, error: "Budget must be an integer ≥ 1" }`
- Integer ≥ 1 → `{ valid: true }`

---

### Fuse.js Integration
Used exclusively for Frictionless Add-on mode product lookup:
```typescript
import Fuse from "fuse.js";

const fuse = new Fuse(catalog, {
  keys: ["name", "keywords"],
  threshold: 0.4,       // stricter than default 0.6 for demo reliability
  ignoreLocation: true,
  includeScore: true,
});

function findProduct(query: string): Product | null {
  const results = fuse.search(query);
  if (!results.length || (results[0].score ?? 1) > 0.4) return null;
  return results[0].item;
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

**Property-based testing library**: [fast-check](https://fast-check.dev/) (TypeScript-native, excellent arbitrary generators for objects, arrays, strings, and numbers).

**Property reflection**: Before finalising, properties from the prework were reviewed for redundancy:
- Requirements 5.1 and 5.5 both test product filtering by tags/dietary constraints → merged into Property 5 (product selection filter invariant)
- Requirements 9.4 and 9.5 both test catalog validation exclusion logic → merged into Property 9 (catalog product exclusion)
- Requirements 7.3 and 10.1 both involve cardinality constraints on AI-generated lists → kept separate (different contexts: alternatives vs complementary products)
- Requirements 7.5 and 12.1–12.3 overlap on regional filtering → merged into Property 10
- Requirements 16.7 and 16.8 (Budget_Filter) → combined into a single Property 18 covering both the trim invariant and the 400-error boundary
- Requirements 15.2 and 15.3 (Purchase History) → combined into a single Property 19 covering append correctness and chip display count

---

### Property 1: Pin Code Validation Rejects All Invalid Formats

*For any* string that is either empty, contains a non-numeric character, or has a length other than 6, the profile form validation function SHALL return an error and SHALL NOT invoke any localStorage write.

**Validates: Requirements 2.3**

---

### Property 2: Serving Count Validation Rejects Out-of-Range Values

*For any* integer less than 1 or greater than 50, the profile form validation function SHALL reject the value and SHALL NOT invoke any localStorage write.

**Validates: Requirements 2.4**

---

### Property 3: Intent Whitespace Rejection

*For any* string composed entirely of whitespace characters (including empty string), submitting the intent form SHALL display an error and SHALL NOT invoke the AI pipeline.

**Validates: Requirements 3.2**

---

### Property 4: Intent_Parser Output Schema Completeness

*For any* non-empty intent string passed to the Intent_Parser, the parsed output SHALL be a JSON object containing exactly the five fields: `occasion` (string or null), `person_count` (integer or null), `time_context` (string or null), `dietary` (array of strings), and `exclusions` (array of strings). No field shall be omitted from the response.

**Validates: Requirements 4.1**

---

### Property 5: Intent_Parser Person Count Fallback Chain

*For any* intent string that contains no numeric person count, and for any household profile serving count value, the parsed `person_count` SHALL equal the profile's `servingCount` when it is ≥ 1, or SHALL equal 1 when the profile's `servingCount` is 0 or absent.

**Validates: Requirements 4.2, 4.3**

---

### Property 6: Intent_Parser Dietary Deduplication

*For any* intent string that repeats a dietary keyword one or more times, the resulting `dietary` and `exclusions` arrays SHALL contain each distinct keyword at most once (no duplicate entries).

**Validates: Requirements 4.4**

---

### Property 7: Quantity Calibration Formula

*For any* `person_count` in the range [1, 500] and any `serving_size` in the range [1, 9999], the Quantity_Calibrator SHALL return exactly `Math.ceil(person_count / serving_size)` for that product's quantity.

**Validates: Requirements 5.2**

---

### Property 8: Cart Product Selection Invariants

*For any* parsed intent object and any catalog snapshot, every product returned by the Cart_Curator SHALL satisfy all of the following simultaneously:
- At least one `occasion_tag` matches the parsed `occasion`
- No tag in `occasion_tags` or `keywords` appears in `parsed.dietary` or `parsed.exclusions`
- `in_stock` is `true`
- The total number of selected products is between 3 and 15 (inclusive)

**Validates: Requirements 5.1, 5.4, 5.5, 5.6**

---

### Property 9: Cart Total Price Invariant

*For any* collection of `CartProduct` objects with arbitrary `unit_price` and `quantity` values, the displayed cart total SHALL equal exactly `Σ (product.price × product.quantity)` for all currently selected products, and SHALL update immediately after any product switch or quantity modification.

**Validates: Requirements 7.7**

---

### Property 10: ProductCard Renders All Required Fields

*For any* `CartProduct` object with valid field values, the rendered `ProductCard` component SHALL produce output containing: product name, brand, star rating representation, review count, quantity, unit price, line total, ETA in minutes, AI reasoning (truncated at 160 chars), and exactly 2 review cards.

**Validates: Requirements 7.2**

---

### Property 11: Product Switch Invariants

*For any* cart state and any "Switch to this" action targeting a valid alternative, the resulting cart state SHALL satisfy:
- The original product is absent from the card's primary slot
- The selected alternative occupies the primary slot
- The selected alternative does NOT appear in its own 2 alternative slots
- The cart total is recalculated correctly

**Validates: Requirements 7.4**

---

### Property 12: Catalog Product Exclusion on Invalid Data

*For any* products.json entry that is missing a required field OR contains a field value outside its valid range, that product SHALL be absent from all cart generation results and all UI displays, and a warning SHALL have been logged identifying the product `id` and the offending field.

**Validates: Requirements 9.4, 9.5**

---

### Property 13: Frictionless Complementary Tag Overlap

*For any* submitted product and any set of complementary product suggestions, every complementary product SHALL share at least one string in common between its `occasion_tags` ∪ `keywords` and the submitted product's `occasion_tags` ∪ `keywords`.

**Validates: Requirements 10.2**

---

### Property 14: Checkout Page Renders All Required Fields

*For any* non-empty cart, the `/checkout` page SHALL render: occasion title, a product list with name/quantity/line total per item, cart subtotal, a ₹0 delivery fee line, grand total, estimated delivery time (max ETA across all products), and a "Place Order" button.

**Validates: Requirements 11.3**

---

### Property 15: Regional Section Cardinality and Tag Correctness

*For any* pin code resolving to a known region and any catalog, the regional products section SHALL display `min(4, count)` products where `count` is the number of catalog products whose `region_tags` array includes the resolved region string, and every displayed product SHALL have the resolved region string in its `region_tags`.

**Validates: Requirements 12.1, 12.3, 12.4**

---

### Property 16: Modification Hint Chip Constraints

*For any* rendering of the `ModificationBar`, the number of hint chips SHALL be between 2 and 5 (inclusive), and each chip label SHALL be no longer than 30 characters.

**Validates: Requirements 8.3**

---

### Property 17: Modification Diff Structure

*For any* non-empty modification request submitted to the `Modification_Handler`, the response SHALL be either a valid diff object containing exactly three array fields (`add`, `remove`, `modify`) or an error object with a non-empty `error` string — no other response shapes are valid.

**Validates: Requirements 8.4**

---

### Property 18: Budget Hard-Trim Invariant

*For any* cart and any `budget > 0`, after applying the Budget_Filter trim, `computeCartTotal(trimmedCart) ≤ budget` SHALL hold, OR the cart contains exactly 3 items (the minimum) and an HTTP 400 error is returned.

**Validates: Requirements 16.7, 16.8**

---

### Property 19: Purchase History Append Invariant

*For any* sequence of N successful "Place Order" actions, the `purchase_history` array in localStorage SHALL contain exactly N entries in descending `createdAt` order, and the "Recent orders" row SHALL display `min(3, N)` chips.

**Validates: Requirements 15.2, 15.3**

---

## Error Handling

### AI Pipeline Errors

| Scenario | Handling |
|---|---|
| Intent_Parser returns `{ error: "..." }` | API route returns HTTP 400; client shows inline error on `/intent`; no navigation to `/cart` |
| Gemini API throws (network, throttle, auth) | Caught in `invokeGeminiAgent`; wrapped as `{ error: "AI service unavailable" }`; propagated as 503 |
| Cart_Curator returns < 3 products | API route returns 400 `{ error: "Not enough matching products" }`; client shows user message |
| Budget too low after trim | After Budget_Filter trim, if 3 items remain and `computeCartTotal` still exceeds `budget` → HTTP 400 `{ error: "Budget too low for a minimum cart" }`; client shows user-facing error on `/intent` page; no navigation to `/cart` |
| Quantity_Calibrator receives `serving_size ≤ 0` | Product skipped with `console.warn`; not included in cart |
| Pipeline exceeds 10s (client timeout) | `AbortController` cancels fetch; error shown; submit re-enabled; no navigation |
| Modification_Handler parse failure | Returns `{ error: "..." }`; ModificationBar shows inline error; cart state unchanged |
| Modification_Handler timeout (3s) | Client `AbortController` fires; timeout message in ModificationBar; cart unchanged |

### Catalog Load Errors

- Missing `products.json` file: server throws at startup; `/api/catalog` returns 500
- Invalid product entries: excluded with `console.warn(product.id, missingField)` — app continues with remaining valid products

### Client-Side Navigation Guards

- `/`: if no `household_profile` in `localStorage` → `router.replace('/setup')`
- `/checkout`: if `sessionStorage` cart is empty/absent → `router.replace('/cart')`
- Direct navigation to `/intent`, `/cart`, `/setup` without profile: allowed (no redirect)

### Voice Input Errors ⚠️ DEFERRED — Not Applicable for Initial Build

> Voice input error handling is **deferred** along with the `VoiceButton` component. The initial build ships with a stubbed/disabled voice button that produces no audio capture errors. This section documents the intended error handling for when SARVAM AI-powered voice input is implemented in a later phase.

| Scenario | Handling (Deferred) |
|---|---|
| Empty transcript | "Couldn't hear you, try again" message adjacent to mic button; dismissed on next mic tap |
| Microphone permission denied | "Microphone access denied" message; no further capture attempt until next tap |
| SARVAM AI unavailable or error | Fallback to Web_Speech_API transcript silently |
| `SpeechRecognition` not in `window` | Mic button not rendered; no error shown |

### Order Placement

- `Place Order` tap: 1.5s simulated delay via `setTimeout`; confirmation renders `ORD-${nanoid(6).toUpperCase()}`; `sessionStorage.removeItem('intent_cart_session')` called only after confirmation is visible in DOM (inside `useEffect` watching `orderConfirmed` state)

---

## Testing Strategy

### Overview

The testing strategy uses two complementary layers: **unit/property tests** (fast, deterministic, run in CI) and **integration tests** (slower, require real or mocked Gemini API, run in pre-demo checks).

**Test runner**: [Vitest](https://vitest.dev/) (native TypeScript, compatible with Next.js 14, fast)  
**Property-based testing**: [fast-check](https://fast-check.dev/)  
**Component testing**: [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)  
**Mocking**: Vitest's built-in `vi.mock`, `vi.fn()`

### Unit and Property Tests

All property tests run a **minimum of 100 iterations** via fast-check's `fc.assert(fc.property(...), { numRuns: 100 })`.

Each property test is tagged with a comment in this format:
```
// Feature: intent-cart, Property N: <property_text>
```

#### Validation Layer (`lib/validation.ts`)

- **Property 1**: `fc.string()` → filter to invalid pin codes (empty, non-numeric, wrong length) → assert `validatePinCode(s)` returns error and no localStorage write
- **Property 2**: `fc.integer().filter(n => n < 1 || n > 50)` → assert `validateServingCount(n)` returns error
- **Budget validation**: `fc.oneof(fc.constant(null), fc.float().filter(n => !Number.isInteger(n) || n < 1))` → assert `validateBudget(n)` returns `{ valid: false }` for invalid inputs; `fc.integer({ min: 1 })` → assert `{ valid: true }`; `fc.constant(null)` → assert `{ valid: true }`

#### Intent Input (`components/IntentInput.tsx`)

- **Property 3**: `fc.string().filter(s => s.trim() === "")` → render component, set value, submit → assert error shown, mock `fetch` not called

#### Intent_Parser (`lib/agents/intent-parser.ts`)

- **Property 4**: `fc.string({ minLength: 1 })` → call `parseIntentOutput(mockGeminiResponse)` → assert schema completeness. *(Parser output parsing is unit-tested; actual Gemini API calls are integration-tested.)*
- **Property 5**: `fc.record({ intentText: fc.string(), profileServingCount: fc.integer() })` → assert fallback chain logic in `resolvePersonCount()`
- **Property 6**: `fc.array(fc.constantFrom("vegan", "no onion", "gluten-free"), { minLength: 2 })` with duplicates injected → assert `deduplicateDietary()` returns unique array

#### Quantity Calibration (`lib/agents/quantity-calibrator.ts`)

- **Property 7**: `fc.record({ personCount: fc.integer({ min: 1, max: 500 }), servingSize: fc.integer({ min: 1, max: 9999 }) })` → assert `calculateQuantity(personCount, servingSize) === Math.ceil(personCount / servingSize)`

#### Cart Curator Logic (`lib/agents/cart-curator.ts`)

- **Property 8**: Generate arbitrary `ParsedIntent` and catalog subsets via fast-check. Call `filterAndSelectProducts(parsed, catalog)`. Assert all four invariants (tag match, dietary exclusion, in_stock, cardinality 3–15).

#### Cart Pricing (`lib/cart-utils.ts`)

- **Property 9**: `fc.array(fc.record({ price: fc.float({ min: 0.01, max: 99999.99 }), quantity: fc.integer({ min: 1, max: 100 }) }), { minLength: 1 })` → assert `computeCartTotal(items) === items.reduce((sum, i) => sum + i.price * i.quantity, 0)`

#### ProductCard Component

- **Property 10**: Generate random `CartProduct` objects with valid fields. Render `<ProductCard />`. Assert all required text fields present in DOM. Assert exactly 2 ReviewCard elements.

#### Product Switch Logic

- **Property 11**: Generate random cart with alternatives. Pick random switch action. Assert four invariants on resulting state via `applySwitch(cart, cardIndex, alternativeId)`.

#### Catalog Validation (`lib/catalog.ts`)

- **Property 12**: `fc.record({ ...productFields })` with one field randomly set to invalid value. Call `validateProduct(p)`. Assert product excluded and `console.warn` called with `id` and field name.

#### Frictionless Complementary Logic

- **Property 13**: Generate random product and random catalog. Call `findComplementary(product, catalog)`. Assert every result shares ≥1 tag/keyword with submitted product.

#### Checkout Page

- **Property 14**: Generate random non-empty carts. Render `/checkout` with that cart. Assert all required fields present in DOM.

#### Regional Section

- **Property 15**: Generate catalogs with known `region_tags` and pin codes. Call `filterRegionalProducts(catalog, region)`. Assert cardinality `min(4, count)` and all results have matching region_tag.

#### Modification_Bar (`components/ModificationBar.tsx`)

- **Property 16**: Render `<ModificationBar />`. Count `HintChip` elements. Assert 2–5 chips, each label ≤ 30 chars.

#### Modification_Handler Output Parser

- **Property 17**: Generate arbitrary modification strings. Mock Gemini to return various response shapes. Assert only valid diff or error object shapes pass validation.

#### Budget Filter (`lib/cart-utils.ts` / `app/api/generate-cart/route.ts`)

- **Property 18**: `fc.record({ items: fc.array(fc.record({ price: fc.float({ min: 0.01 }), quantity: fc.integer({ min: 1 }) }), { minLength: 3, maxLength: 15 }), budget: fc.integer({ min: 1 }) })` → call `applyBudgetTrim(items, budget)` → assert either `computeCartTotal(result) ≤ budget` OR `result.length === 3` (with a 400 error path)

#### Purchase History (`store/useAppStore.ts` / `app/checkout/page.tsx`)

- **Property 19**: `fc.array(fc.record({ orderId: fc.string(), occasionTitle: fc.string(), cartSnapshot: fc.array(fc.record({ ... })), createdAt: fc.date() }), { minLength: 1, maxLength: 20 })` → simulate N `addToHistory` calls → assert `localStorage.getItem('purchase_history')` contains exactly N entries in descending `createdAt` order, and `purchaseHistory.slice(0, 3)` matches the 3 most recent

### Integration Tests

Run against the real Gemini API in a dedicated test environment. Each scenario is a single execution (not repeated 100 times due to rate limits).

| Test | Description | Acceptance Criteria |
|---|---|---|
| Pipeline latency | Submit canonical intent, measure end-to-end time | ≤ 6000ms (Req 6.1) |
| Parallel execution | Measure wall clock; assert ≈ max(individual times) not sum | Req 6.2, 12.6 |
| Canonical scenario 1 | "Movie night for 5" | ≥1 product, no exceptions (Req 14.1) |
| Canonical scenario 2 | "Aglio olio for 3" | ≥1 product, no exceptions |
| Canonical scenario 3 | "Birthday party for 20 kids" | ≥1 product, no exceptions |
| Canonical scenario 4 | "Quick breakfast for 2" | ≥1 product, no exceptions |
| Canonical scenario 5 | "Add spaghetti" | ≥1 product, no exceptions |
| Consistency (10 runs) | Run scenario 1 ten times, measure category overlap | ≥80% overlap (Req 14.2) |
| Intent_Parser latency | 500-char input → parse | < 2000ms (Req 4.7) |
| Modification_Handler latency | Modification request → diff | < 3000ms (Req 8.7) |
| ~~SARVAM_AI fallback~~ | ~~Mock SARVAM_AI 503, assert Web_Speech_API used~~ | **DEFERRED** — Req 13.4 (voice input not in initial build; SARVAM AI integration deferred) |

> **Requirement 13 (Voice Input)**: All acceptance criteria under Requirement 13 are **deferred** for the initial build. The `VoiceButton` component is stubbed and disabled. No voice input integration tests are run until SARVAM AI integration is implemented in a later phase.

### Smoke Tests

Run once as part of project setup / CI pre-flight:

| Test | What it checks |
|---|---|
| Catalog integrity | `products.json` has ≥50 entries, all 6 categories present |
| No client-side Gemini imports | `grep -r "@google/generative-ai" src/app` finds 0 matches in non-server files |
| All required env vars defined | `GEMINI_API_KEY` present in `.env.local` |
| No persistent server config | No `server.js`, no Express/Koa setup |

### Cost and Rate Limits

This project uses the **Google Gemini free tier** via Google AI Studio (`GEMINI_API_KEY`). No billing account or credit card is required.

**Model resolution strategy:**
- The app maintains a priority list of candidate models for two tiers: `pro` and `flash`
- At runtime it tries candidates in order and uses the first one that responds — so it automatically adapts to whatever Google has available without any config changes
- Preferred candidates: `gemini-2.5-pro` → `gemini-2.0-pro` → `gemini-pro` (pro tier); `gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-flash` (flash tier)

**Free tier limits (Google AI Studio, 2025):**
- **15 RPM** (requests per minute)
- **1,000,000 TPM** (tokens per minute)
- **1,500 RPD** (requests per day) — 4 calls per pipeline run = ~375 full runs/day

With 4 Gemini calls per pipeline run, the 15 RPM cap allows 3–4 concurrent pipeline executions per minute — sufficient for a single-user hackathon demo. No dollar cost incurred.

To stay within rate limits:
- Set `generationConfig: { maxOutputTokens: ... }` caps per agent (as listed in the Agent Interface section above)
- Gate integration tests behind a `CI_INTEGRATION=true` env flag to avoid burning the daily quota during development
