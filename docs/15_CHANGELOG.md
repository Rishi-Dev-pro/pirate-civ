# 🏴‍☠️ 15_CHANGELOG — Chronological Project Changelog

All notable changes, milestones, bug fixes, and architectural adjustments to Pirate-Civ are documented here in reverse chronological order.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [2026-10-15] — Phase 3 / Milestone 3.6: Buyer Regression & UX Verification (PHASE 3 COMPLETE)

### Added & Verified
* **End-to-End Real Browser Journey Verification:**
  - Authenticated login with test buyer credentials (`buyer@pirate-civ.internal` / `password123`) on port 3000.
  - Full voyage path verified: Login → Astrolabe → Product Detail (`/product/:productId`) → Discover Merchant → Seller Storefront (`/seller/:sellerId`) → Catalog item inspection → Product Detail → Add to Cargo Hold → Cargo Hold Drawer `#storeCartDrawer` animation & real-time badge updates.
  - Full `/cart` manifest verification: itemized table inspection, price line totals, grand total in Doubloons, quantity increment (`+`), quantity decrement (`-`), and individual item discharge.
  - Multi-island product addition: navigated to Chronos Cay, added product to Cargo Hold, verified presence on `/cart`.
  - Session and persistence verification: logged out, logged back in, confirmed persistent cart in MongoDB survived across logout/login sessions.
  - Hold discharge: clicked "Jettison All Cargo", verified empty hold state (`.cart-empty-state`).
  - Canonical island store check: verified all 6 leaf islands (Astrolabe, Chronos, Kraken Vault, Cutlass Cove, Velvet Isle, Booty Cay) load with active MongoDB products, images, Doubloons prices, star ratings, and working links.
  - Verified 0 unexpected console errors or warnings in real browser console.
* **Automated Regression Suite (`scratch/test_milestone_3_6.js`):**
  - 96 automated assertions covering buyer journey, authentication middleware, user cart isolation, price manipulation rejection, stock immutability, zero order creation, and 404 security guards (96/96 passed).
* **Comprehensive Regression Suite:**
  - 695/695 passed across all Phase 3 automated test suites (Milestone 3.1: 160/160, Milestone 3.2: 231/231, Milestone 3.3: 54/54, Milestone 3.4: 72/72, Milestone 3.5: 82/82, Milestone 3.6: 96/96).
* **Scope Boundary:** Phase 4 (Seller platform) and Phase 5 (Checkout, payment, orders) strictly NOT implemented. Phase 3 is officially COMPLETE.

---

## [2026-10-15] — Phase 3 / Milestone 3.5: Persistent Cart Integration (PHASE 3.5 COMPLETE)

### Added & Implemented
* **Persistent Cart Controller (`controller/cart.js`):** Built complete controller handling `getCart`, `addToCart`, `updateCartItem`, `removeCartItem`, and `clearCart`. Dynamically populates authoritative product information from MongoDB (`Product`), ensures non-negative integer quantities, formats safe client payloads, rejects client-side price overrides, and handles guest session carts with automatic migration to MongoDB on login.
* **Optional Authentication Middleware (`middleware/auth.js`):** Exported `optionalAuth` middleware that attaches `req.user` if a valid signed `auth_token` and matching active session exist, but permits unauthenticated visitors to proceed with session carts.
* **RESTful Cart Routes (`routes/web.js`):** Registered `GET /cart`, `POST /cart/add`, `POST /cart/update`, `POST /cart/remove`, and `POST /cart/clear` routes using `optionalAuth`.
* **Dedicated Cargo Hold Manifest Page (`views/cart.ejs`):** Developed full SSR Cargo Manifest view featuring an itemized cargo table, product art, unit valuation in Doubloons, quantity increment/decrement controls, line totals, item discharge buttons, summary manifest card (item count, subtotal, exempt trade port fee, grand total), empty state with link to Sea Chart, and voyage checkout trigger.
* **Client-Side Cargo Engine (`public/js/island-store.js`, `public/css/island-store.css`):** Refactored cart engine to communicate directly with backend `/cart` endpoints. Dynamically syncs topbar Doubloons pill and `#cartCountBadge`, animates the slide-out `#storeCartDrawer`, updates the manifest view on quantity adjustment/removal/jettison, and dispatches toast notifications. Added complete styling for table, controls, and manifest layout.
* **Security & Invariants:** Excludes sensitive user fields (`password`, `authSecretHash`, `googleId`) from all cart responses. Zero stock deductions and zero orders created (Phase 5 boundary strictly maintained).
* **Scope Boundary:** Phase 3.6 / Phase 4 / Phase 5 were strictly NOT implemented.

### Tested & Verified
* 82 automated assertions in `scratch/test_milestone_3_5.js` covering login & initial cart loading, multi-island product additions, quantity increment/decrement, line and grand total calculations, item removal, hold clearing, invalid/unavailable product rejection, user cart isolation, client price override prevention, sensitive field exclusion, guest session cart migration to MongoDB on login, stock invariance, zero order creation, and MongoDB persistence (82/82 passed).
* Interactive browser testing via subagent confirmed multi-island additions, badge and drawer updates, quantity increment/decrement, `/cart` manifest rendering, line totals and grand totals, item removal, persistent MongoDB cart across logout/login, "Jettison All Cargo" empty state, and 0 console errors/warnings.
* Full regression test suite passing across all active milestones (Milestone 3.5: 82/82, Milestone 3.4: 72/72, Milestone 3.3: 54/54, Milestone 3.2: 231/231, Milestone 3.1: 160/160; 599 total passed assertions, 0 failed).
* Static syntax: all JavaScript files passed `node --check`.
* Template analysis: `views/cart.ejs` and all EJS templates compiled cleanly (`ejs.compile`).

---

## [2026-10-15] — Phase 3 / Milestone 3.4: Seller Profile / Storefront (PHASE 3.4 COMPLETE)

### Added & Implemented
* **Public Seller Storefront Controller (`controller/sellers.js`):** Upgraded `renderSellerStorefront` (aliasing `renderSellerDiscovery`, `renderPublicSeller`, `renderSellerProfile`). Queries all available products for the target seller from MongoDB using compound-indexed `Product.find({ seller: seller._id, isAvailable: true }).sort({ createdAt: -1 })`.
* **Reusable Public Storefront Template (`views/seller-discovery.ejs`):** Developed full-featured public storefront rendering merchant identity header (avatar, store title, captain alias, chartered merchant badge, Admiralty Guild verification), badged home harbor linking to canonical island (`/island/:homeIsland`), merchant bio chronicle, active product listing telemetry count, and complete catalog grid.
* **Storefront Product Cards (`views/seller-discovery.ejs`, `public/css/island-store.css`):** Each card renders real MongoDB product art, title, Doubloons valuation, star rating, stock telemetry badge (`In Vaults`, `Low Reserve`, `Barren`), direct links to `/product/:productId`, and "Stow in Cargo" buttons (`.btn-add-cart`) integrated with `#storeCartDrawer`.
* **Themed Empty Storefront State (`views/seller-discovery.ejs`, `public/css/island-store.css`):** Displays atmospheric "Harbor Vaults Currently Barren" empty state when a valid merchant has zero active wares, preventing broken templates or crashes.
* **Catalog Isolation & Availability Filtering:** Guarantees that only products belonging to the merchant are displayed; other sellers' wares and unavailable products (`isAvailable: false`) are strictly excluded.
* **Security & Safe 404 Guards:** Enforces `mongoose.isValidObjectId(sellerId)` and `role: "seller"`. Malformed IDs, nonexistent sellers, or non-seller users return clean 404 responses without CastError or stack trace leaks. Strictly strips sensitive credentials (`password`, `authSecretHash`, `googleId`).
* **Route Binding (`routes/web.js`):** Bound `GET /seller/:sellerId` with `authMiddleware` pointing to `renderSellerStorefront`.

### Tested & Verified
* 72 automated assertions in `scratch/test_milestone_3_4.js` covering seller loading, complete catalog retrieval, multi-seller isolation, unavailable product exclusion, empty storefront state, credential security, malformed/nonexistent/non-seller 404 handling, and stock invariance (72/72 passed).
* Live SSR verification script `scratch/verify_live_ssr_3_4.js` executed on port 3000 verifying canonical storefront, multi-seller isolation, empty storefront state, and 404 guards.
* End-to-end browser verification via subagent recording navigation from Island ➔ Product Detail ➔ Click "📜 DISCOVER MERCHANT" ➔ Full Storefront with 32 wares ➔ Clicked catalog product ➔ Product Detail ➔ Cargo Hold interaction with 0 console errors (`seller_storefront_3_4_1792059622743.webp`).
* Full regression test suite passing across all milestones (1,215/1,215 assertions passed; 1,287 total passed across entire project).
* Static syntax: 20/20 JavaScript files passed `node --check`.
* Template analysis: 22/22 EJS templates compiled cleanly (`ejs.compile`).

---

## [2026-10-15] — Phase 3 / Milestone 3.3: Explorer → Seller Discovery (PHASE 3.3 COMPLETE)

### Added & Implemented
* **Seller Discovery Controller (`controller/sellers.js`):** Created `renderSellerDiscovery` (and alias `renderPublicSeller`) controller actions exporting seller discovery logic. Validates seller identifier using `mongoose.isValidObjectId(sellerId)`. Queries MongoDB `User` with indexed `_id` and strict `role: 'seller'` enforcement. Malformed IDs, nonexistent IDs, or non-seller users return clean HTTP 404 responses without database exceptions or `CastError` leaks.
* **Reusable Seller Discovery View (`views/seller-discovery.ejs`):** Developed a nautical discovery view displaying merchant identity, `⚓ CHARTERED GUILD MERCHANT` badge, home harbor affiliation badge with lore name, bio chronicle (`bio`), active trade listing telemetry count (`totalListings`), sample chartered wares preview grid (up to 4 items), breadcrumb navigation back to Sea Chart / origin island, and integrated slide-out Cargo Hold drawer.
* **Phase 3.4 Scope Boundary Notice Banner (`views/seller-discovery.ejs`):** Prominently displays an atmospheric notice banner informing buyers that this page is in Discovery Mode and that full storefront banners, comprehensive product catalogs, and review systems will dock in Milestone 3.4. (Phase 3.4 was strictly NOT implemented).
* **Product Detail Entry Points (`views/product-detail.ejs`, `public/css/island-store.css`):** Enriched the merchant card on the Product Detail page with clickable avatar links (`.seller-avatar-link`), clickable store name links (`.seller-name-link`), and a dedicated `📜 DISCOVER MERCHANT` action button (`.btn-discover-seller`) linking to `/seller/:sellerId`. Safely handles unpopulated or missing seller scenarios without crashing.
* **Route Registration (`routes/web.js`):** Bound `GET /seller/:sellerId` with `authMiddleware` matching `docs/05_ROUTE_MAP.md`.
* **Security & Credential Protection:** Public seller document strictly sanitizes credentials (`password`, `authSecretHash`, `googleId` omitted).
* **Inventory & Stock Immutability:** Discovering a seller or viewing sample wares never mutates product stock or status.

### Tested & Verified
* 54 automated assertions in `scratch/test_milestone_3_3.js` covering seller relationship, real ObjectId resolution, multi-merchant isolation, credential exclusion, non-seller 404 handling, malformed ObjectId 404 handling, live SSR HTTP rendering, and product detail link integration (54/54 passed).
* Live SSR verification script `scratch/verify_live_ssr_3_3.js` executed against dev server on port 3000 verifying multi-island discovery flows, credential safety, and 404 guards.
* End-to-end browser verification via subagent recording navigation from Island ➔ Product Detail ➔ Click "📜 DISCOVER MERCHANT" ➔ Seller Discovery page across Astrolabe Atoll and Cutlass Cove with 0 console errors (`seller_discovery_3_3_1792044976709.webp`).
* Full regression test suite passing across all milestones (1,161/1,161 assertions passed; 1,215 total passed across entire project).
* Static syntax: 20/20 JavaScript files passed `node --check`.
* Template analysis: 22/22 EJS templates compiled cleanly (`ejs.compile`).

---

## [2026-10-15] — Phase 3 / Milestone 3.2: Reusable Product Detail Page (PHASE 3.2 COMPLETE)

### Added & Implemented
* **Reusable Product Details Controller (`controller/products.js`):** Created `renderProductDetail` controller action exporting clean, modular product resolution logic. Validates product identifiers using a safe dual strategy: MongoDB `ObjectId` (`mongoose.isValidObjectId`) or URL slug (`/^[a-z0-9]+(?:-[a-z0-9]+)*$/i`). Malformed or nonexistent identifiers return clean HTTP 404 responses without database exceptions or `CastError` leaks.
* **Single Reusable Detail View (`views/product-detail.ejs`):** Developed one comprehensive, responsive EJS view for all marketplace items across all 6 canonical islands. Displays visual artifact showcase with radial glowing halo, island origin badge, category pill, guild repute badge, Doubloons price valuation (`🪙 XX Doubloons`), three-tier stock telemetry (`In Vaults`, `Low Reserve`, `Barren`), full safe-escaped description, and populated seller store info (`name`, `storeName`, `homeIsland`, `avatar`).
* **Route Registration (`routes/web.js`):** Bound `GET /product/:productId` with `authMiddleware` matching `docs/05_ROUTE_MAP.md`.
* **Island Listing Product Links (`views/*.ejs`, `public/css/island-store.css`):** Connected all dynamic product cards across all 6 canonical island views (`astrolabe`, `chronos`, `kraken_vault`, `cutlass_cove`, `velvet_isle`, `booty_cay`) to `/product/:id` via clickable image wrappers (`.item-asset-link`), title links (`.item-title-link`), and dedicated action buttons (`.btn-card-details`).
* **Product Detail Styles (`public/css/island-store.css`):** Added comprehensive nautical styling for `.product-detail-wrapper`, `.detail-nav-bar`, `.detail-breadcrumbs`, `.detail-container`, `.detail-visual-col`, `.detail-asset-box`, `.detail-asset-img`, `.detail-pills-row`, `.detail-pill`, `.detail-info-col`, `.detail-title`, `.detail-price-box`, `.detail-stock-row`, `.stock-badge`, `.detail-desc-box`, `.detail-seller-box`, `.detail-actions-bar`, `.btn-detail-add-cart`, `.btn-detail-wishlist`, `.btn-detail-back`, and mobile responsive media queries.
* **Security & Credential Protection:** Populated seller document strictly excludes sensitive fields (`password`, `authSecretHash`, `googleId`).
* **Stock Immutability:** Viewing a product never mutates stock, quantities, or database availability states.
* **Cargo Hold Cart Integration:** Integrated Cargo Hold slide-out drawer (`#storeCartDrawer`) and unified `island-store.js` engine on the product detail page, allowing seamless "Stow in Cargo Hold" action and drawer interactions.

### Tested & Verified
* 231 focused automated assertions in `scratch/test_milestone_3_2.js` covering product retrieval across all 6 canonical islands, ObjectId & slug queries, unavailable product exclusion (`isAvailable: false`), malformed identifier 404 handling, stock invariance, seller secret protection, unauthenticated 302 redirects, live HTTP SSR rendering, and island card navigation links (231/231 passed).
* 87 live SSR assertions in `scratch/verify_live_ssr_3_2.js` executed against running server (87/87 passed).
* End-to-end browser verification via subagent recording user registration, login, navigation to `/astrolabe`, clicking `🔍 DETAILS`, verifying detail elements, adding item to cargo hold, opening/closing cart drawer, navigating back to island, opening product on `/chronos`, and verifying 0 console errors (`product_detail_check_1792042442719.webp`).
* Full regression test suite passing across all milestones (1,161/1,161 assertions passed, 100%).
* Static syntax: 19/19 JavaScript files passed `node --check`.
* Template analysis: 21/21 EJS template files compiled cleanly (`ejs.compile`).

---

## [2026-10-15] — Phase 3 / Milestone 3.1: Dynamic Island Listings (PHASE 3.1 COMPLETE)

### Added & Hardened
* **Dynamic Island Listings (`controller/islands.js`):** Island store pages for all 6 canonical islands (`astrolabe`, `chronos`, `kraken_vault`, `cutlass_cove`, `velvet_isle`, `booty_cay`) are now genuinely dynamic, backed strictly and exclusively by the MongoDB `Product` model via direct indexed query `Product.find({ island: normalizedKey, isAvailable: true }).sort({ createdAt: 1 }).lean()`.
* **Decoupled Architecture & Catalog Stripping (`controller/islands.js`):** Static product arrays are explicitly stripped from `ISLANDS_DATA` metadata prior to template dispatch (`const { products: _staticCatalog, ...cleanIslandMeta } = islandMeta;`), ensuring zero fallback to or leakage of outdated hardcoded data.
* **Canonical Whitelist Validation & Safe 404 Handling (`controller/islands.js`):** Enforces canonical island slug validation against `CANONICAL_ISLANDS`, returning clean HTTP 404 responses without database query execution or stack trace leakage for invalid inputs.
* **Themed Empty States (`views/*.ejs`, `public/css/island-store.css`):** Added `.store-empty-state`, `.store-empty-icon`, `.store-empty-title`, and `.store-empty-desc` CSS styles and updated all 6 island EJS templates to render graceful, atmospheric empty states when an island has zero available products.
* **Unified Doubloon Pricing (`views/velvet_isle.ejs`, `views/booty_cay.ejs`):** Standardized currency display across Velvet Isle and Booty Cay to use Doubloons (`🪙 XX Doubloons`) matching the canonical economy of Pirate-Civ.
* **Underscore Alias Direct Routes (`routes/web.js`):** Added `/kraken_vault`, `/cutlass_cove`, `/velvet_isle`, and `/booty_cay` shorthand routes matching `docs/05_ROUTE_MAP.md`.

### Tested & Verified
* 160 focused automated assertions in `scratch/test_milestone_3_1.js` covering database queries, availability filtering, cross-island product isolation, security exclusions (no password or secret leakage), empty state handling, and live Express HTTP SSR verification across all routes and invalid cases (160/160 passed).
* 65 live SSR assertions in `scratch/verify_live_ssr.js` against running dev server on port 3000 (65/65 passed).
* Interactive browser testing via subagent: verified page load, product card rendering, images, prices, ratings, Add to Cart interaction, toast alerts, cart drawer contents, and zero console errors.
* Full regression test suite passing across all active milestones: Milestone 3.1 (160/160), Pre-Phase 3 Gate (76/76), Milestone 2.6 (166/166), Milestone 2.5 (283/283), Milestone 2.4 (85/85), Milestone 2.3 (42/42), Milestone 2.2 (42/42), Milestone 2.1 (31/31), Phase 1 (45/45). Total: 930/930 passed (100%).
* Static analysis: 18/18 JavaScript files passed syntax check (`node --check`).
* Template analysis: 20/20 EJS template files compiled cleanly (`ejs.compile`).

---

## [2026-10-11] — Pre-Phase 3 Release Gate: Full Codebase Audit, Integration Verification & Hardening

### Added & Hardened
* **Database Connection Singleton & Lifecycle (`config/db.js`):** Added connection guard (`readyState === 1`) preventing duplicate connections on repeat calls. Added connection drop listeners (`disconnected`, `error`) and exported `disconnectDB()` helper with process signal hooks (`SIGINT`, `SIGTERM`) for graceful process exits.
* **Centralized Express Error Handling (`index.js`):** Registered global error middleware `(err, req, res, next)` logging server-side errors and rendering themed client responses while strictly suppressing internal stack traces, filesystem paths, and secrets.
* **Styled 404 Catch-All Middleware (`index.js`):** Registered catch-all 404 middleware after routes, replacing default raw Express "Cannot GET" responses with styled HTML templates.
* **JSON Body Parser (`index.js`):** Added `server.use(express.json())` alongside URL-encoded parser to safely parse incoming JSON payloads.
* **Environment Template (`.env.example`):** Verified presence of template with safe placeholder values for `PORT`, `MONGO_URI`, `SESSION_SECRET`, `COOKIE_SECRET`, and `NODE_ENV`.
* **Audit Documentation (`docs/18_CODEBASE_AUDIT.md`):** Authored 24-section comprehensive pre-phase release gate audit report.

### Audited & Verified
* Static syntax checked across all 18 JavaScript files (`node --check`) with 100% pass rate.
* Template compilation checked across all 20 EJS views (`ejs.compile`) with 100% pass rate.
* Dependency review (`npm audit`) and security credential leakage checks verified.
* Role-based authorization matrix (`anonymous`, `buyer`, `seller`, `admin`) verified with 403 enforcement.
* Model validations tested across all 5 Mongoose models (`User`, `Product`, `Cart`, `Order`, `Contact`).
* Failure-injection tests executed (invalid URIs, malformed ObjectIds, invalid quantities, negative prices, duplicate emails).
* 76 focused hardening assertions in `scratch/test_pre_phase_3_gate.js` passed (76/76).
* Full regression suite passing across all milestones: Milestone 2.6 (166/166), Milestone 2.5 (283/283), Milestone 2.4 (85/85), Milestone 2.3 (42/42), Milestone 2.2 (42/42), Milestone 2.1 (31/31), Phase 1 (45/45). Total: 770/770 passed (100%).

---

## [2026-10-11] — Phase 2 / Milestone 2.6: Database Integration & Core API/SSR Verification (PHASE 2 COMPLETE)

### Added
* Integrated MongoDB `Product` model into `renderIslandPage` controller action in `controller/islands.js`. The 6 island store views (`astrolabe`, `chronos`, `kraken_vault`, `cutlass_cove`, `velvet_isle`, `booty_cay`) now dynamically query and render live products from MongoDB while preserving static cartographic lore and metadata.
* Formatted Mongoose product documents with complete EJS compatibility (`id`, `_id`, `name`, `slug`, `price`, `priceNum`, `desc`, `description`, `image`, `island`, `category`, `stock`, `isAvailable`, `rating`, `seller`).
* Added `/home` route in `routes/web.js` rendering `views/home.ejs` with `authMiddleware` guard per `docs/05_ROUTE_MAP.md`.
* Added `/islands` overview redirect in `routes/web.js` pointing to `/#sea-chart-section` with `authMiddleware` guard.
* Verified stock invariance: product reads, island page SSR renders, persistent cart operations, and order snapshot creations strictly preserve inventory (`Product.stock` is invariant).
* Verified security & secret exclusions: User password hashes and auth secret tokens are strictly omitted from population and view data.

### Tested
* 166 focused automated tests in `scratch/test_milestone_2_6.js` covering collection access, 32-product catalog presence, canonical merchant seller ownership, taxonomy, controller SSR product injection, invalid island 404 handling, persistent cart with real MongoDB products, order model integration with real products, HTTP test server with unauthenticated 302 redirects, session login, and authenticated 200 OK SSR responses across `/`, `/home`, `/about`, `/contact`, `/users`, and all 6 island store views (166/166 passed).
* Full regression test suite passing across all Phase 1 and Phase 2 milestones: Milestone 2.5 (283/283), Milestone 2.4 (85/85), Milestone 2.3 (42/42), Milestone 2.2 (42/42), Milestone 2.1 (31/31), Phase 1 (45/45). Total: 694/694 passed.
* Verified manual dev server startup and MongoDB connection.

---

## [2026-10-11] — Phase 2 / Milestone 2.5: Controlled Migration of Existing Hardcoded Products

### Added
* Created dedicated, idempotent product migration script `scripts/seedProducts.js` importing the complete 32-item hardcoded catalog from `controller/islands.js` into MongoDB.
* Bootstrapped canonical merchant `Grand Admiralty Cartographers` (`admiralty@pirate-civ.internal`, `role: "seller"`, `homeIsland: "astrolabe"`) with idempotent user lookup and creation.
* Implemented deterministic, URL-safe kebab-case slug generator (`generateDeterministicSlug`) ensuring 100% collision-free slugs across the product catalog.
* Normalized product taxonomy across all 6 canonical islands (`astrolabe`, `chronos`, `kraken_vault`, `cutlass_cove`, `velvet_isle`, `booty_cay`) and 3 categories (`relics`, `apparel`, `provisions`).
* Cleaned and normalized Doubloon prices from comma-separated strings (`"24,999"`) into positive integers (`24999`).
* Preserved visual star rating strings (`"★★★★★"`, `"★★★★☆"`) and original asset image paths (`/images/items/*.png`).
* Implemented idempotent upsert algorithm preserving existing stock levels across repeat runs without deleting database documents.
* Pre-validated all product objects against Mongoose `Product` schema rules before persistence.

### Tested
* 283 focused automated tests in `scratch/test_milestone_2_5.js` covering source catalog extraction, taxonomy mapping, slug uniqueness, canonical merchant bootstrap, first-run insertions, second-run idempotency, seller ownership, stock preservation, and data integrity (283/283 passed).
* Full regression test suite passing: Milestone 2.4 (85/85), Milestone 2.3 (42/42), Milestone 2.2 (42/42), Milestone 2.1 (31/31), Phase 1 (45/45). Total: 528/528 passed.
* Verified live MongoDB development database idempotency: Run 1 created 32 items; Run 2 updated 32 items with 0 duplicates (total count strictly 32).

---

## [2026-10-11] — Phase 2 / Milestone 2.4: Order Model & Order Lifecycle Foundation

### Added
* Created foundational Mongoose `Order` model in `models/order.js` linked to unified `User` model (`buyer: { type: ObjectId, ref: 'User' }`).
* Implemented embedded `orderItemSchema` storing historical snapshots of purchased products (`name`, `price`, `quantity`, `lineTotal`, `seller`, `image`, `product`).
* Enforced historical snapshot data integrity: changes to `Product` (name, price, stock) after purchase do not mutate or recalculate historical order line items or totals.
* Implemented controlled order lifecycle enum (`pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`) with permitted state machine transitions map (`PERMITTED_STATUS_TRANSITIONS`).
* Added lifecycle helpers `order.canTransitionTo(targetStatus)` and `order.transitionTo(targetStatus)` to validate and execute permitted status transitions.
* Implemented Doubloon payment status foundation (`paymentStatus: ['pending', 'paid', 'failed', 'refunded']`, default `'pending'`).
* Implemented shipping address schema requiring `portName` and providing default `islandCoordinates` and `recipientNotes`.
* Added compound indexes `{ buyer: 1, createdAt: -1 }` (for buyer order history sorting) and `{ "items.seller": 1, status: 1 }` (for merchant order fulfillment queues).
* Implemented static query helpers `Order.findByBuyer(buyerId, filter)` and `Order.findBySeller(sellerId, filter)`.
* Verified stock invariance: order operations do not mutate or deduct `Product.stock`.
* Verified security credential protection: population strictly omits `password` and `authSecretHash`.

### Tested
* 85 focused automated tests in `scratch/test_milestone_2_4.js` covering schema validation, required fields, embedded items, positive integer quantities, negative price/total rejections, auto-calculated line totals/subtotals, lifecycle state machine transitions, invalid status rejections, live MongoDB multi-seller orders, historical data immutability, stock invariance, query isolation, and credential-free population (85/85 passed).
* Regression test suite covering Milestone 2.3 (42/42 passed), Milestone 2.2 (42/42 passed), Milestone 2.1 (31/31 passed), and Phase 1 full suite (45/45 passed). Total: 245/245 tests passed.

---

## [2026-10-11] — Phase 2 / Milestone 2.3: Persistent Cart (Cart Model & Session Integration)

### Added
* Created persistent Mongoose `Cart` model in `models/cart.js` linked to unified `User` model (`user: { type: ObjectId, ref: 'User', unique: true }`).
* Implemented embedded `cartItemSchema` referencing `Product` (`ref: 'Product'`) with positive integer quantity validation (`min: 1`, `Number.isInteger`).
* Implemented `cart.addItem(productId, quantity)` instance method normalizing duplicate entries and merging quantities automatically.
* Implemented `cart.removeItem(productId, quantity)` instance method to decrement or completely remove items.
* Implemented `Cart.findByUser(userId)` static query helper for fast indexed cart lookups.
* Implemented `Cart.mergeSessionCart(userId, sessionCart)` static method and integrated it into `loginUser` in `controller/auth.js` to migrate guest session carts into MongoDB upon authentication.
* Enforced safe error resilience during cart migration: nonexistent products and invalid quantities are skipped without interrupting the login flow.
* Verified that stock is unaffected by cart operations (`Product.stock` is invariant to cart additions).

### Tested
* 42 focused automated tests in `scratch/test_milestone_2_3.js` covering Cart creation, unique user index, quantity validation (0, -1, 1.5 rejected), duplicate item merging, `findByUser`, user isolation, session cart migration, dirty item filtering, and stock invariance (42/42 passed).
* Regression test suite covering Milestone 2.2 (42/42 passed), Milestone 2.1 (31/31 passed), and Phase 1 full suite (45/45 passed).

---

## [2026-10-11] — Phase 2 / Milestone 2.2: Seller ↔ Product Relationship

### Added
* Formalized the seller-ownership relationship between the unified `User` model (`role: 'seller'`) and `Product` in `models/product.js` via `seller: ObjectId` reference (`ref: 'User'`).
* Implemented `Product.findBySeller(sellerId, filter)` static query helper, leveraging the `{ seller: 1, createdAt: -1 }` compound index for fast merchant catalog retrieval sorted by newest item first.
* Implemented `product.isOwnedBy(userOrId)` instance method providing robust, type-safe ownership verification supporting populated User documents, raw ObjectIds, and string comparisons.
* Verified query isolation ensuring merchant queries never leak items across sellers, and empty sellers return an empty array `[]`.
* Verified Mongoose `.populate('seller')` resolution and demonstrated strict exclusion of authentication secrets (`password`, `authSecretHash`).

### Tested
* 42 automated tests covering schema ownership, ObjectId comparison, `isOwnedBy` helper, static `findBySeller`, empty seller handling, live MongoDB query isolation, population with secret exclusion, and Milestone 2.1 model regression checks (42/42 passed).
* Full regression test suite passing (45/45 passed).

---

## [2026-10-11] — Phase 2 / Milestone 2.1: Product Model & Category/Island Structure

### Added
* Created foundational Mongoose `Product` model in `models/product.js`.
* Modeled product-to-seller relationship referencing the unified `User` model (`ref: 'User'`).
* Canonical island taxonomy enum enforcing the 6 official islands: `astrolabe`, `chronos`, `kraken_vault`, `cutlass_cove`, `velvet_isle`, and `booty_cay`.
* Automated slug generation hook/default in kebab-case ensuring human-readable URL identifiers.
* Price validation denominated in Doubloons (`min: 0`), non-negative integer stock validation (`Number.isInteger`), and default availability (`isAvailable: true`).
* Strategic compound indexes for marketplace performance: `{ island: 1, isAvailable: 1 }` (for island storefronts) and `{ seller: 1, createdAt: -1 }` (for merchant inventory management).
* Exported canonical taxonomy arrays (`CANONICAL_ISLANDS`, `TRADING_BRANCHES`) for system-wide consistency.

### Tested
* 31 automated unit test assertions covering valid product creation, required fields, ObjectId seller references, non-negative price constraints, integer stock enforcement, canonical island enum checks, auto-slug generation, timestamps, and index configurations (31/31 passed).
* Full regression test suite passing (45/45 passed).

---

## [2026-10-10] — Phase 1 / Milestone 1.3: Authentication UX, Error Handling & Bug Cleanup

### Added
* Human-readable authentication error UX in `controller/auth.js`, rendering errors on the same page with retained input fields (`name`, `email`) rather than raw string responses (`res.send(...)`).
* Styled dark-fantasy alert banners (`.auth-error-banner`, `.error-icon`) in `public/css/auth.css`, matching the atmospheric nautical aesthetics across `views/login.ejs` and `views/register.ejs`.
* "Remember Me" checkbox on the login page wrapped in flexible `.auth-options` row with "Forgot your map key?".
* Server-side dynamic session and signed cookie `auth_token` lifetime handling: 30 days (`maxAge: 1000 * 60 * 60 * 24 * 30`) when Remember Me is selected; 24 hours standard session when unchecked.
* Defensive duplicate account detection catching both pre-validation duplicates and MongoDB `E11000` duplicate key errors without leaking stack traces or database internals.
* Registration success workflow redirecting explorers directly to `/login`.

### Fixed
* Removed rogue markdown code fences (````html` and ````) from `views/contact.ejs`.
* Replaced generic placeholder content in `views/about.ejs` with authentic Pirate-Civ dark-fantasy nautical lore, archipelago cards, and merchant narrative.
* Purged dead university mock student array (`studentInfo` and `student_data`) from home route `/` in `routes/web.js`.

### Tested
* 40 automated test assertions across all 10 verification scenarios: login success/failure, registration validation, duplicate handling, Remember Me 30-day persistence vs 24-hour session, protected routes, role middleware integration, Contact HTML syntax, and About lore content (40/40 passed).
* Live server boot and HTTP route responses verified (`/login` 200, `/register` 200).

---

## [2026-10-10] — Phase 1 / Milestone 1.2: Role-Based Authorization Middleware

### Added
* Created `middleware/roles.js` exporting `requireRole(...allowedRoles)`, `requireSeller`, `requireBuyer`, and `requireAdmin`.
* Support for single and multiple role checks (e.g. `requireRole('seller')`, `requireRole('seller', 'admin')`).
* Defensive handling for unauthenticated requests (redirects to `/login` without runtime exceptions).
* Explicit role enforcement: rejected roles respond with HTTP 403 Forbidden without role-inheritance leakage.

### Tested
* 26 automated unit test assertions covering seller access, buyer access, admin access, unauthorized role rejections, multi-role arrays, missing user redirects, and invalid/undefined role handling (26/26 passed).
* Node syntax check on `middleware/roles.js` (`node --check middleware/roles.js`).

### Remaining
* Phase 1 — Milestone 1.3: Authentication UX, Error Handling & Bug Cleanup (`views/contact.ejs` ticks, `views/about.ejs` copy, `routes/web.js` mock cleanup).

---

## [2026-10-10] — Phase 1 / Milestone 1.1: Unified User Schema Foundation

### Added
* `role` field to `models/user.js` (`['buyer', 'seller', 'admin']`) defaulting to `'buyer'`.
* Optional merchant profile fields to `models/user.js`: `storeName`, `homeIsland`, `bio`, and `avatar`.
* `googleId` field with sparse unique index to `models/user.js` for future Google OAuth support.
* Permanent engineering workflow rules document: `docs/17_DEVELOPMENT_WORKFLOW_RULES.md`.

### Changed
* User schema evolved into unified foundation supporting both buyer and seller personas without splitting into multiple auth models.

### Tested
* 25 automated schema test assertions covering default buyer role, seller profile fields, admin role, invalid role rejection, googleId sparse indexing, and legacy auth field validation (all passed).
* Node syntax check on application entry point (`node --check index.js`).

### Remaining
* Phase 1 — Milestone 1.2: Role-Based Authorization Middleware (`middleware/roles.js`).

---

## [2026-10-10] — Documentation Foundation & Project Memory Setup

### Added
* Established complete `/docs` project memory architecture (18 foundational documents).
* Comprehensive product vision and world bible covering Grand Bazaar and the 6 leaf islands (`00_PROJECT_VISION.md`).
* Exhaustive audit-based reality report across Complete, Partial, Frontend-Only, Broken, and Missing tiers (`01_PROJECT_STATUS.md`).
* 6-phase master implementation roadmap with cardinal phase rule (`02_MASTER_ROADMAP.md`).
* System architecture specification for Express 5 + EJS + MongoDB MVC pipeline (`03_ARCHITECTURE.md`).
* Unified User model and Mongoose schema definitions for User, Product, Cart, Order, and Contact (`04_DATABASE_DESIGN.md`).
* Complete HTTP route registry with auth and role middleware requirements (`05_ROUTE_MAP.md`).
* Detailed technical and functional specifications for 20 platform features (`06_FEATURE_SPECIFICATION.md`).
* Buyer system workflow, sea chart preservation, and reusable product detail specifications (`07_BUYER_SYSTEM.md`).
* Seller platform workflow, command deck metrics, and product CRUD ownership rules (`08_SELLER_SYSTEM.md`).
* Authentication, RBAC middleware, signed cookies, and Google OAuth strategy (`09_AUTHENTICATION.md`).
* Product catalog taxonomy, Doubloons currency, and controlled seed migration plan (`10_PRODUCT_SYSTEM.md`).
* Persistent cart, checkout atomicity, and multi-merchant order state machine (`11_CART_AND_ORDER_SYSTEM.md`).
* UI/UX visual guidelines, nautical tokens, Cinzel/Inter typography, and UX state rules (`12_UI_UX_GUIDELINES.md`).
* 15 Cardinal Engineering Rules and pre-commit verification checklist (`13_DEVELOPMENT_RULES.md`).
* Architectural Decision Records covering Decisions 001 through 007 (`14_DECISION_LOG.md`).
* Active short-term memory document for session handoffs (`16_CURRENT_TASK.md`).
* Documentation directory index and reading order (`README.md`).

### Changed
* Project memory formalized inside repository root.

### Fixed
* Documented existing defects for scheduled resolution in Phase 1 (contact form markdown tick wrapper bug, about page copy mismatch, and unused mock student data).

### Tested
* Verified all 18 documentation files exist with cross-referencing integrity.

### Remaining
* Phase 1: Foundation & Authentication execution (Unified user role schema, RBAC middleware, login error styling, Remember Me, Google OAuth, bug fixes).

---

## [2026-10-10] — Initial Audit Baseline

### Added
* Initial read-only discovery audit performed on the entire repository.

### Confirmed Existing Reality
* **Express 5 & MongoDB:** Active server with working Mongoose connection.
* **Authentication:** Bcrypt password hashing and SHA-256 secret token with signed cookie active, but missing roles and Remember Me logic.
* **Buyer Frontend:** Rich visual presentation for Home Sea Chart (`home.ejs`, `mindmap.js`) and 6 leaf islands (`astrolabe`, `chronos`, `kraken_vault`, `cutlass_cove`, `velvet_isle`, `booty_cay`).
* **Catalog Data:** Products are hardcoded in JavaScript files (`ISLANDS_DATA`, `REALM_DATA`); zero products exist in MongoDB.
* **Cart System:** Add to Cart operates exclusively in browser `localStorage`.
* **Checkout:** Simulated alert; zero order generation.
* **Seller System:** 0% implemented (no model, no dashboard, no product CRUD, no fulfillment).
* **Orders & Profiles:** Completely missing.
* **Defects Identified:** Contact view has rogue markdown wrapper ticks; About page has generic placeholder content; Home route passes dead student mock array.
