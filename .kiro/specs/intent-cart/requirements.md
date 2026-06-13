# Requirements Document

## Introduction

IntentCart is a mobile-responsive full-stack web application that serves as an AI-powered shopping mode for Amazon Now. It allows customers to describe an occasion, recipe, or single product need in plain language and receive a complete, quantity-correct shopping cart in under 6 seconds — eliminating the need for manual search, browsing, or individual product decisions.

The application supports three shopping modes: Intent-based shopping (occasion-driven), Cooking/Fresh mode (recipe-driven), and Frictionless Add-on (complementary item suggestions). It is built on Next.js 14, AWS Bedrock (Claude Sonnet), and local JSON product data, with no authentication required.

This spec covers the full working prototype for HackOn with Amazon Season 6.0 — a demo-ready app that must handle 5 core scenarios successfully across 10/10 runs.

---

## Glossary

- **IntentCart**: The full-stack web application being specified.
- **Intent_Parser**: AWS Bedrock Agent 1 that converts natural language input into structured JSON.
- **Cart_Curator**: AWS Bedrock Agent 2 that selects appropriate products from the catalog.
- **Quantity_Calibrator**: AWS Bedrock Agent 3 (runs in parallel with Cart_Curator) that calculates per-person quantities using `ceil(person_count / serving_size)`.
- **Modification_Handler**: AWS Bedrock Agent 4 that processes conversational cart edits and returns a diff.
- **AI_Pipeline**: The 4-agent orchestration layer executed via AWS Bedrock, completing in ≤6 seconds using `Promise.all` for parallel steps.
- **Smart_Cart**: The `/cart` page displaying the fully composed cart with product cards, alternatives, and regional recommendations.
- **ProductCard**: A UI component displaying a single product's details: image, name, brand, rating, quantity, price, ETA, best-before, AI reasoning, and 2 customer reviews.
- **Catalog**: The local `products.json` file containing all available products with metadata.
- **Household_Profile**: User preferences (pin code, dietary restrictions, serving defaults) stored in browser `localStorage`.
- **Region**: A geographic grouping inferred from the user's pin code used to surface locally popular products.
- **Modification_Bar**: A sticky bottom UI element accepting text or voice input for conversational cart changes.
- **Occasion**: A real-world context provided by the user (e.g., "Movie night for 5", "Birthday dinner for 10").
- **Recipe**: A dish name with optional serving count (e.g., "Aglio olio for 3").
- **Web_Speech_API**: The browser-native API used for voice input on supported devices.
- **SARVAM_AI**: A future third-party service for regional language voice recognition (Hindi, Tamil, Telugu, Kannada, Bengali, etc.).
- **Fuse_js**: The client-side fuzzy matching library used for product search and catalog lookups.
- **ETA**: Estimated time of arrival for product delivery, expressed in minutes.
- **PurchaseRecord**: A record of a completed order stored in `localStorage`, containing `orderId`, `occasionTitle`, `cartSnapshot`, and `createdAt`.
- **Budget_Filter**: A server-side hard constraint applied after Cart_Curator returns, removing lowest-priority items until the cart total is within the user's configured budget.

---

## Requirements

### Requirement 1: Mode Selection and Navigation

**User Story:** As a customer, I want to choose my shopping mode from the home page, so that I can start the most relevant shopping experience for my current need.

#### Acceptance Criteria

1. THE IntentCart SHALL render a home page at the `/` route that presents three individually selectable UI elements for: "Shopping by Intent", "Cooking/Fresh", and "Frictionless Add-on".
2. WHEN a user selects "Shopping by Intent" or "Cooking/Fresh", THE IntentCart SHALL navigate the user to the `/intent` page with no mode pre-selected by default.
3. WHEN a user selects "Frictionless Add-on", THE IntentCart SHALL navigate the user to the `/intent` page with the add-on mode UI control in its selected state upon arrival.
4. WHILE the viewport width is between 1280px and 1920px, THE IntentCart SHALL render all three mode options on a single row with no horizontal scrolling and no label truncation. WHILE the viewport width is between 320px and 767px, THE IntentCart SHALL render all three mode options in a stacked vertical layout with no horizontal scrolling and no label truncation.
5. WHEN a user navigates to the `/` route and no Household_Profile key exists in localStorage, THE IntentCart SHALL redirect the user to the `/setup` route.
6. IF a user navigates directly to any route other than `/` (e.g., `/intent`, `/cart`, `/checkout`, `/setup`) and no Household_Profile key exists in localStorage, THEN THE IntentCart SHALL NOT redirect the user to `/setup` and SHALL render the requested route.

---

### Requirement 2: Household Profile Setup

**User Story:** As a first-time user, I want to configure my household preferences, so that the AI can generate relevant carts tailored to my location and dietary needs.

#### Acceptance Criteria

1. THE IntentCart SHALL render a profile setup form at the `/setup` route capturing: pin code (text input), default serving count (numeric stepper), max spend per cart in ₹ (optional numeric input), and dietary preference (selectable option from: "No restriction", "Vegetarian", "Jain").
2. WHEN a user submits a valid setup form, THE IntentCart SHALL serialize the form values as a JSON object and persist it to browser `localStorage` under the key `household_profile`, then navigate the user to the `/` route.
3. IF a user submits the setup form and the pin code field is empty, contains non-numeric characters, or is not exactly 6 digits in length, THEN THE IntentCart SHALL display an inline validation error message adjacent to the pin code field and SHALL NOT invoke any localStorage write or navigation.
4. IF a user submits the setup form and the serving count field contains a value less than 1 or greater than 50, THEN THE IntentCart SHALL display an inline validation error message adjacent to the serving count field and SHALL NOT invoke any localStorage write or navigation.
5. WHEN the `/setup` route is loaded and a `household_profile` key already exists in localStorage, THE IntentCart SHALL read the stored JSON and pre-populate each form field with the corresponding stored value before the first user interaction.
6. WHILE the viewport width is between 1280px and 1920px, THE IntentCart SHALL render the setup form with no horizontal scrolling and all field labels fully visible. WHILE the viewport width is between 320px and 767px, THE IntentCart SHALL render all form fields in a single-column layout with no horizontal overflow.

---

### Requirement 3: Natural Language Intent Input

**User Story:** As a customer, I want to describe an occasion or recipe in plain language, so that the AI can build the right cart without me having to search for individual products.

#### Acceptance Criteria

1. THE IntentCart SHALL render an intent input field at the `/intent` route accepting free-form text of up to 300 characters, and SHALL display a visible character count or limit indicator.
2. IF a user attempts to submit the intent input field while it contains only whitespace or is empty, THEN THE IntentCart SHALL display an inline validation error adjacent to the input field and SHALL NOT invoke the AI_Pipeline.
3. WHEN a user submits a non-empty intent, THE IntentCart SHALL pass the text to the AI_Pipeline and navigate to the `/cart` route upon receiving a successful result.
4. WHILE the AI_Pipeline is executing, THE IntentCart SHALL display a progress indicator on the `/intent` page and SHALL disable the submit button to prevent duplicate submissions.
5. IF the AI_Pipeline does not return a result within 10 seconds of submission, THEN THE IntentCart SHALL display an error message describing the timeout, re-enable the submit button, and allow the user to retry without reloading the page.
6. WHERE the Web_Speech_API is supported by the browser, THE IntentCart SHALL display a microphone button that captures voice input and populates the intent input field with the transcribed text.
7. IF the Web_Speech_API is not supported by the browser, THEN THE IntentCart SHALL not render the microphone button.
8. IF a shopping mode is selected before the user arrives at `/intent`, THEN THE IntentCart SHALL display placeholder text in the intent input field appropriate for that mode (e.g., "Aglio olio for 3" for Cooking/Fresh mode).
9. WHILE the viewport width is between 1280px and 1920px, and WHILE the viewport width is between 320px and 767px, THE IntentCart SHALL render the intent input page with no horizontal scrolling and no overlapping UI elements.

---

### Requirement 4: AI Pipeline — Intent Parsing

**User Story:** As a customer, I want the system to understand my natural language input accurately, so that the resulting cart reflects my actual occasion, group size, and preferences.

#### Acceptance Criteria

1. WHEN an intent string is submitted, THE Intent_Parser SHALL produce a structured JSON object containing: `occasion` (string or null), `person_count` (integer or null), `time_context` (string or null), `dietary` (array of strings), and `exclusions` (array of strings); fields that cannot be parsed from the input SHALL be set to null or empty array rather than omitted.
2. WHEN the intent string does not specify a person count, THE Intent_Parser SHALL set `person_count` to the value stored in the Household_Profile's serving count field.
3. IF the Household_Profile serving count is also absent or zero, THEN THE Intent_Parser SHALL default `person_count` to 1.
4. WHEN the intent string contains one or more dietary keywords (e.g., "vegan", "no onion"), THE Intent_Parser SHALL add each identified constraint as a discrete, non-duplicate string entry in the `dietary` or `exclusions` array.
5. IF the Intent_Parser receives an input string containing no parseable content for any of the five output fields, THEN THE Intent_Parser SHALL return a JSON object with an `error` field containing a non-empty descriptive string.
6. WHEN THE Intent_Parser returns an error response, THE IntentCart SHALL display a user-facing error message and SHALL NOT navigate to the `/cart` route.
7. THE Intent_Parser SHALL complete parsing within 2 seconds when processing a single request with an input string of up to 500 characters.

---

### Requirement 5: AI Pipeline — Product Selection and Quantity Calculation

**User Story:** As a customer, I want the AI to select relevant products and calculate the right quantities for my group size, so that I don't under- or over-buy.

#### Acceptance Criteria

1. WHEN the Intent_Parser produces a structured intent object, THE Cart_Curator SHALL select products from the Catalog whose `occasion_tags` array contains at least one tag matching the parsed `occasion` field, and whose tags do not appear in the `dietary` or `exclusions` arrays.
2. WHEN the Cart_Curator selects products, THE Quantity_Calibrator SHALL calculate the required quantity for each product as `ceil(person_count / serving_size)`, where `person_count` is a positive integer between 1 and 500 and `serving_size` is the product's catalog value.
3. WHEN cart generation begins, THE Cart_Curator and Quantity_Calibrator steps SHALL complete and both return results within 3 seconds.
4. THE Cart_Curator SHALL exclude any product from selection where `in_stock` is `false` in the Catalog.
5. WHEN a user's Household_Profile contains dietary preferences, THE Cart_Curator SHALL exclude any product whose `occasion_tags` or `keywords` contain a tag present in the profile's dietary restriction or exclusions list.
6. THE Cart_Curator SHALL select a minimum of 3 and a maximum of 15 products per cart.
7. IF fewer than 3 in-stock products in the Catalog match the parsed `occasion` and dietary constraints, THEN THE Cart_Curator SHALL return an error response and THE IntentCart SHALL display a user-facing message indicating no suitable products were found.
8. IF a product in the Catalog has a `serving_size` value of 0 or less, THEN THE Quantity_Calibrator SHALL skip that product and log a warning rather than performing a division-by-zero operation.

---

### Requirement 6: AI Pipeline — Execution Time

**User Story:** As a customer, I want my cart to appear quickly, so that I can complete my shopping in a time-sensitive situation.

#### Acceptance Criteria

1. THE AI_Pipeline SHALL deliver a complete, non-empty cart response to the client within 6 seconds of intent submission, measured from when the client sends the request to when the last byte of the response is received, under a network round-trip latency of ≤200ms.
2. WHEN cart generation begins, THE IntentCart SHALL initiate the Catalog read and Region filter operations at the same time as the Cart_Curator and Quantity_Calibrator steps, without waiting for either agent step to complete before starting the data fetch.
3. WHEN all parallel pipeline steps have returned results, THE IntentCart SHALL merge the results into a single cart object and return it in a single API response, without requiring the client to make an additional request to retrieve the merged data.
4. WHEN the merged cart response is received by the client, THE IntentCart SHALL render the Smart_Cart page displaying at least one ProductCard before indicating to the user that loading is complete.
5. IF the AI_Pipeline fails to return a complete response within 10 seconds, THEN THE IntentCart SHALL display an error message on the current page and SHALL NOT navigate to the `/cart` route.

---

### Requirement 7: Smart Cart Display

**User Story:** As a customer, I want to see a clear, detailed cart page, so that I can review every item, understand why it was chosen, and make any changes before checkout.

#### Acceptance Criteria

1. THE IntentCart SHALL render the Smart_Cart at the `/cart` route displaying: occasion title, ETA badge, total cart price, and a checkout button fixed to the bottom of the viewport while the user scrolls.
2. THE IntentCart SHALL render one ProductCard per selected product containing: product image, name, brand, star rating rendered as filled/half/empty icon stars, review count, bestseller badge (shown only when `is_bestseller` is `true`), quantity with reason string, unit price and line total, ETA in minutes, best-before duration (shown only when `expiry_months` is present and ≤18), AI reasoning line (truncated at 160 characters), and 2 customer review cards.
3. THE IntentCart SHALL display exactly 2 alternative product suggestions per ProductCard, each with a "Switch to this" button.
4. WHEN a user taps "Switch to this" on an alternative product, THE IntentCart SHALL replace the primary product in that ProductCard with the selected alternative, recalculate the cart total, and ensure the newly added product does not appear in its own 2 alternative slots.
5. THE IntentCart SHALL render a regional section labelled "📍 Popular in [City]" containing up to 4 ProductCards filtered from the Catalog by the user's Region; IF the Catalog contains fewer than 4 products matching the resolved Region, THEN THE IntentCart SHALL display all matching products without padding.
6. WHILE the viewport width is between 1280px and 1920px, THE IntentCart SHALL render the Smart_Cart in a multi-column layout. WHILE the viewport width is between 320px and 767px, THE IntentCart SHALL render the Smart_Cart in a single-column layout with no horizontal overflow.
7. THE IntentCart SHALL display the total cart price as the arithmetic sum of `(unit_price × quantity)` for all currently selected products, updated immediately after any product switch or quantity change.
8. IF the current cart contains zero products, THEN THE IntentCart SHALL display an empty-cart message, hide the checkout button, and hide the total price display.

---

### Requirement 8: Conversational Cart Modification

**User Story:** As a customer, I want to modify my cart using natural language, so that I can make changes without hunting through menus or forms.

#### Acceptance Criteria

1. THE IntentCart SHALL render a Modification_Bar as a sticky element fixed to the bottom of the viewport on the `/cart` page, accepting free-form text input of up to 300 characters and submitting when the user presses Enter or taps the send button.
2. WHERE the Web_Speech_API is supported, THE IntentCart SHALL provide a voice input button in the Modification_Bar that captures speech and populates the text field with the transcript.
3. THE IntentCart SHALL display between 2 and 5 hint chips in the Modification_Bar, each chip label being no longer than 30 characters, suggesting common modification actions (e.g., "Make it vegetarian", "Add 2 more people", "Switch Pepsi to Sprite").
4. WHEN a user submits a non-empty modification request, THE Modification_Handler SHALL return a diff object containing three arrays: `add` (products to add with quantities), `remove` (product IDs to remove), and `modify` (product IDs with updated quantities).
5. WHEN the Modification_Handler returns a diff, THE IntentCart SHALL apply each change in the diff to the current cart state, visually highlight each affected ProductCard with a distinct background color for exactly 3 seconds, and leave all unaffected ProductCards unchanged.
6. IF the Modification_Handler returns a response indicating it cannot parse the modification request, THEN THE IntentCart SHALL display an inline error message within the Modification_Bar and SHALL NOT alter any item in the current cart state.
7. THE Modification_Handler SHALL return a response within 3 seconds of receiving the modification request under a network round-trip latency of ≤200ms.
8. IF the Modification_Handler does not return a response within 3 seconds, THEN THE IntentCart SHALL display a timeout error message in the Modification_Bar and SHALL NOT alter the current cart state.

---

### Requirement 9: Catalog Data Model

**User Story:** As a developer, I want a well-defined product catalog structure, so that all AI agents and UI components read from a consistent, complete data source.

#### Acceptance Criteria

1. THE IntentCart SHALL read product data exclusively from a local `products.json` file via a Next.js API route, and SHALL NOT read product data directly from the filesystem in client-side code.
2. THE Catalog SHALL contain at least 50 products spanning the following categories: snacks, beverages, fresh produce, dairy, pantry staples, and cleaning supplies.
3. EACH product in the Catalog SHALL contain the following fields with the specified types and valid ranges: `id` (string, non-empty), `name` (string, non-empty), `brand` (string, non-empty), `category` (string, one of the defined category values), `price` (number, 0.01–99999.99 INR), `rating` (number, 1.0–5.0 inclusive), `review_count` (number, 0–999999), `is_bestseller` (boolean), `serving_size` (number, 1–9999), `image_url` (string, non-empty), `occasion_tags` (array of strings), `region_tags` (array of strings), `in_stock` (boolean), `eta_minutes` (number, 1–180), `expiry_months` (number, 0–120 or null), `keywords` (array of strings), `sample_reviews` (array of exactly 2 objects each containing `author` (string) and `text` (string)).
4. WHEN product data is loaded, IF a product entry is missing any required field, THEN THE IntentCart SHALL log a warning identifying the product `id` and the missing field, and SHALL exclude that product from all AI_Pipeline operations and UI display.
5. WHEN product data is loaded, IF a product entry contains a field value outside the specified valid range (e.g., `rating` of 6.0), THEN THE IntentCart SHALL log a warning identifying the product `id` and the out-of-range field, and SHALL exclude that product from all AI_Pipeline operations and UI display.

---

### Requirement 10: Frictionless Add-on Mode

**User Story:** As a customer adding a single item, I want the AI to suggest complementary products, so that I don't forget related items I'll likely need.

#### Acceptance Criteria

1. WHEN a user submits a single product name (e.g., "Spaghetti") in Frictionless Add-on mode, THE Cart_Curator SHALL add the closest matching product from the Catalog to the cart and suggest between 2 and 5 complementary products.
2. THE Cart_Curator SHALL select complementary products whose `occasion_tags` or `keywords` arrays contain at least one string in common with the submitted product's `occasion_tags` or `keywords` arrays in the Catalog.
3. WHEN the Cart_Curator returns complementary suggestions, THE IntentCart SHALL render each suggestion on the Smart_Cart page with an "Add to cart" button.
4. WHEN a user taps "Add to cart" on a complementary suggestion and the add operation succeeds, THE IntentCart SHALL add the product to the active cart and recalculate the total price.
5. IF the "Add to cart" operation for a complementary suggestion encounters an error, THEN THE IntentCart SHALL display an inline error message adjacent to that suggestion and SHALL NOT recalculate the cart total or alter any existing cart items.
6. IF the submitted product name does not match any product in the Catalog within an acceptable fuzzy match threshold, THEN THE IntentCart SHALL display a "product not found" message and SHALL NOT navigate to the `/cart` route.

---

### Requirement 11: Checkout Confirmation

**User Story:** As a customer, I want a checkout confirmation page, so that I can review my final order before placing it.

#### Acceptance Criteria

1. WHEN a user taps the checkout button on the Smart_Cart and the active cart contains at least one product, THE IntentCart SHALL navigate to the `/checkout` route and render a read-only order summary.
2. IF a user navigates directly to the `/checkout` route and the active cart is empty or absent, THEN THE IntentCart SHALL redirect the user to the `/cart` route.
3. THE checkout page SHALL display: occasion title, a list of all selected products each showing name, quantity, and line total, cart subtotal, a delivery fee line (₹0 — free delivery), the grand total, the estimated delivery time expressed in minutes as the maximum ETA value across all selected products, and a "Place Order" button.
4. WHEN a user taps "Place Order", THE IntentCart SHALL simulate a 1.5-second processing delay, then display a confirmation message containing a mock order ID in the format `ORD-XXXXXX` (where X is an alphanumeric character), then clear the active cart from sessionStorage only after the confirmation message is visible in the DOM.
5. WHILE the viewport width is between 1280px and 1920px, and WHILE the viewport width is between 320px and 767px, THE IntentCart SHALL render the checkout page with no horizontal scrolling and all product names fully visible without truncation.

---

### Requirement 12: Regional Product Recommendations

**User Story:** As a customer in a specific city, I want to see locally popular products, so that I can discover region-relevant items that suit my context.

#### Acceptance Criteria

1. WHEN cart generation begins and the Household_Profile contains a pin code that resolves to a known Region, THE IntentCart SHALL filter the Catalog for products whose `region_tags` array includes the resolved Region string.
2. IF the Household_Profile pin code is absent or does not resolve to a known Region, THEN THE IntentCart SHALL omit the regional section from the Smart_Cart entirely.
3. THE IntentCart SHALL display up to 4 products from the regionally filtered result set in the Smart_Cart's regional section.
4. IF the regionally filtered result set contains fewer than 4 products and at least 1 product, THEN THE IntentCart SHALL display all matching products without adding placeholder or padding items.
5. IF the regionally filtered result set contains 0 products, THEN THE IntentCart SHALL omit the regional section from the Smart_Cart entirely.
6. WHEN cart generation begins, THE IntentCart SHALL perform the Region filter operation in parallel with the Cart_Curator and Quantity_Calibrator steps without waiting for either agent step to complete first.

---

### Requirement 13: Voice Input

**User Story:** As a customer, I want to speak my shopping intent or cart modifications, so that I can interact hands-free especially on mobile.

#### Acceptance Criteria

1. WHERE the Web_Speech_API is supported, THE IntentCart SHALL require a user tap on the microphone button to activate voice capture, and SHALL stop capture when the button is tapped again or after 10 seconds of silence.
2. WHEN voice capture produces a non-empty transcript, THE IntentCart SHALL populate the associated text input field with the transcript text and allow the user to edit the text before submission.
3. IF voice capture completes and produces an empty transcript, THEN THE IntentCart SHALL display a "Couldn't hear you, try again" message adjacent to the microphone button, and SHALL dismiss the message when the microphone button is next activated.
4. WHERE SARVAM_AI integration is configured, THE IntentCart SHALL route audio from voice capture through SARVAM_AI for transcription before populating the text field; IF SARVAM_AI is unavailable or returns an error, THEN THE IntentCart SHALL fall back to the Web_Speech_API transcript.
5. IF the browser denies microphone permission, THEN THE IntentCart SHALL display a "Microphone access denied" message adjacent to the microphone button and SHALL NOT attempt to activate voice capture until the button is tapped again.

---

### Requirement 14: Performance and Stability

**User Story:** As a demo presenter, I want the app to perform reliably under demo conditions, so that the 5 core scenarios succeed every time without failures.

#### Acceptance Criteria

1. THE AI_Pipeline SHALL produce a response containing at least 1 product item and no unhandled exceptions for each of the following 5 canonical scenarios: "Movie night for 5", "Aglio olio for 3", "Birthday party for 20 kids", "Quick breakfast for 2", and "Add spaghetti".
2. WHEN a canonical scenario input is submitted 10 consecutive times, THE AI_Pipeline SHALL return a cart whose product category names overlap with the first run's product category names by at least 80% on each subsequent run.
3. THE IntentCart SHALL operate without a persistent backend server, using only Next.js API routes as the server-side layer.
4. THE IntentCart SHALL render all routes and complete all user interactions without requiring a user login or authentication token.
5. THE IntentCart SHALL not execute any AWS Bedrock API call from client-side JavaScript running in the browser; all Bedrock invocations SHALL occur exclusively within Next.js API route handlers on the server.
6. THE total AWS Bedrock token usage during the hackathon demo period (a single 8-hour session) SHALL not exceed a cost equivalent to $3.60 USD (approximately ₹300 at ₹83/USD exchange rate).

---

### Requirement 15: Purchase History

**User Story:** As a returning customer, I want to see my recent orders on the home page, so that I can quickly re-shop for a past occasion without re-typing.

#### Acceptance Criteria

1. WHEN a user successfully places an order (order confirmation is visible in the DOM), THE IntentCart SHALL create a `PurchaseRecord` object containing: `orderId` (the generated ORD-XXXXXX string), `occasionTitle` (the current cart's occasion title), `cartSnapshot` (a deep copy of the current `CartProduct[]` at time of placement), and `createdAt` (ISO 8601 timestamp string at time of placement).
2. WHEN a `PurchaseRecord` is created, THE IntentCart SHALL append it to the purchase history array stored in `localStorage` under key `purchase_history` (a JSON array), and SHALL update the Zustand store's `purchaseHistory` array atomically.
3. THE IntentCart SHALL render a "Recent orders" row on the home page (`/` route) below the mode selection cards, displaying up to 3 `PurchaseRecord` entries as tappable chips ordered by `createdAt` descending (most recent first).
4. IF `localStorage` key `purchase_history` is absent or empty, THEN THE IntentCart SHALL NOT render the "Recent orders" row on the home page.
5. WHEN a user taps a recent order chip, THE IntentCart SHALL navigate to the `/intent` route and pre-fill the intent input field with the `occasionTitle` from the tapped `PurchaseRecord`.
6. THE IntentCart SHALL persist the full `purchase_history` array across browser sessions using `localStorage`; it SHALL NOT be cleared when the active cart is cleared from `sessionStorage` after order placement.
7. WHILE the viewport width is between 320px and 767px, THE IntentCart SHALL render recent order chips in a horizontally scrollable row with no vertical overflow.

---

### Requirement 16: Budget Filter

**User Story:** As a budget-conscious customer, I want to set a maximum spend limit, so that the AI only builds carts I can afford.

#### Acceptance Criteria

1. THE IntentCart SHALL add an optional numeric input field labelled "Max spend per cart (₹)" to the `/setup` form, positioned between the serving count field and the dietary preference field; the field SHALL accept integers ≥ 1 or be left blank (representing no budget limit).
2. WHEN a user submits the setup form with a non-empty budget field containing a value less than 1 or a non-integer value, THE IntentCart SHALL display an inline validation error adjacent to the budget field and SHALL NOT invoke any localStorage write or navigation.
3. WHEN a user submits a valid setup form, THE IntentCart SHALL persist the `budget` field (as a number or null if left blank) as part of the `household_profile` JSON object in localStorage.
4. WHEN the `/setup` route is loaded and a `household_profile` key exists in localStorage, THE IntentCart SHALL pre-populate the budget field with the stored value if present, or leave it blank if `budget` is null.
5. WHEN a cart generation request is made and the resolved `budget` value is greater than 0, THE IntentCart SHALL include the budget value in the `GenerateCartRequest` payload sent to `/api/generate-cart`.
6. WHEN `invokeCartCurator` receives a `budget > 0`, THE Cart_Curator system prompt SHALL include the instruction: "The total cart price must not exceed ₹{budget}. Prioritise lower-priced products that meet quality thresholds."
7. AFTER the Cart_Curator returns its product selection and quantities are calculated, IF `computeCartTotal(items) > budget` and `budget > 0`, THEN THE IntentCart server route SHALL remove items from the cart in ascending priority order (lowest AI reasoning confidence or lowest rating) until `computeCartTotal(items) ≤ budget` or only 3 items remain (the minimum cart size).
8. IF applying the budget hard-trim reduces the cart to fewer than 3 items while `computeCartTotal` of the 3 remaining items still exceeds the budget, THEN THE IntentCart SHALL return an HTTP 400 response with error message "Budget too low for a minimum cart" and SHALL NOT navigate to the `/cart` route.
9. WHEN `budget` is null or 0 in the household profile, THE IntentCart SHALL NOT apply any budget constraint to cart generation, behaving identically to the pre-budget-filter behaviour.
