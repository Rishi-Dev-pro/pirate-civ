# 🏴‍☠️ 02_MASTER_ROADMAP — The Master Development Roadmap

This master roadmap defines the phased implementation strategy for Pirate-Civ. Execution must follow this sequence strictly. **No phase may be skipped**, and features from future phases must not be implemented out of order.

---

## ⚓ The Cardinal Phase Rule

```
┌────────────────────────────────────────────────────────────────────────┐
│ BEFORE STARTING A PHASE:                                               │
│ 1. Read 02_MASTER_ROADMAP.md to understand the exact scope.            │
│ 2. Read 01_PROJECT_STATUS.md to verify preconditions.                  │
│ 3. Read 16_CURRENT_TASK.md for active blockers or constraints.         │
│ 4. Read relevant architecture and schema docs.                         │
│ 5. Review 14_DECISION_LOG.md and 15_CHANGELOG.md.                      │
├────────────────────────────────────────────────────────────────────────┤
│ AFTER COMPLETING A PHASE:                                              │
│ 1. Update 01_PROJECT_STATUS.md (reclassify completed items).           │
│ 2. Update 02_MASTER_ROADMAP.md (mark milestones complete).             │
│ 3. Update 16_CURRENT_TASK.md (transition active task).                 │
│ 4. Update 15_CHANGELOG.md with a detailed, dated entry.                │
│ 5. Document new architectural choices in 14_DECISION_LOG.md.           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🗺️ The 6 Master Phases

```mermaid
gantt
    title Pirate-Civ Phased Implementation Roadmap
    dateFormat  YYYY-MM-DD
    section Foundation
    Phase 1 : Auth, Roles & Bug Fixes       :p1, 2026-10-11, 4d
    section Data Architecture
    Phase 2 : Database & Product Seeding    :p2, after p1, 5d
    section Experience
    Phase 3 : Dynamic Buyer Marketplace     :p3, after p2, 6d
    Phase 4 : Full Seller Command Deck      :p4, after p3, 7d
    section Transactions
    Phase 5 : Cart, Orders & Fulfillment    :p5, after p4, 6d
    section Polish
    Phase 6 : Entry Gateway Map & Final UI  :p6, after p5, 5d
```

---

### 📍 PHASE 1 — FOUNDATION & AUTHENTICATION
**Goal:** Establish user identity, role-based security, OAuth support, clean error handling, and resolve existing codebase bugs.

* **Milestone 1.1: Unified User Schema Evolution**
  - Add `role` enum (`'buyer'`, `'seller'`, `'admin'`, default `'buyer'`) to `models/user.js`.
  - Add optional merchant profile fields: `storeName`, `homeIsland`, `bio`, `avatar`, and `googleId`.
* **Milestone 1.2: Role Authorization Middleware**
  - Create `middleware/roles.js` with `requireRole(role)` and `requireSeller` guards.
  - Ensure backend blocks unauthorized route access.
* **Milestone 1.3: Authentication UX & Error Overhaul**
  - Replace raw `res.send(...)` errors in `controller/auth.js` with rendered EJS flash messages and form preservation.
  - Implement "Remember Me" checkbox logic: long-lived cookie (`30 days`) vs session cookie (`1 session`).
* **Milestone 1.4: Google OAuth Integration**
  - Add Google OAuth strategy (`passport-google-oauth20` or Google OAuth2 client) routing through `/auth/google` and `/auth/google/callback`.
* **Milestone 1.5: Immediate Bug Cleanup**
  - Strip rogue markdown ticks from `views/contact.ejs` (lines 1 & 222).
  - Update `views/about.ejs` copy to reflect Pirate-Civ lore.
  - Remove dead `studentInfo` mockup from `routes/web.js`.

---

### 📍 PHASE 2 — DATABASE & PRODUCT FOUNDATION
**Goal:** Migrate hardcoded catalogs into MongoDB with a controlled seed migration without losing existing island products.

* **Milestone 2.1: Product Model Definition**
  - Create `models/product.js` with: `name`, `slug`, `price` (in Doubloons), `description`, `image`, `island` (enum of 6 islands), `category`, `stock`, `isAvailable`, `seller` (ref User), and `rating`.
* **Milestone 2.2: Cart & Order Schemas**
  - Create `models/cart.js` with `user` and array of `{ product, quantity }`.
  - Create `models/order.js` with `buyer`, `items`, `totalDoubloons`, `status`, and `shippingAddress`.
* **Milestone 2.3: Controlled Seed & Migration Process**
  - Create a migration/seed script (`scripts/seedProducts.js`) that imports all 28+ products from `controller/islands.js` and `public/js/mindmap.js`.
  - Create a default canonical "Grand Admiralty Guild" merchant account in MongoDB to own baseline island products.
  - Verify zero products are lost or broken during migration.
* **Milestone 2.4: Database-Driven Island Controllers**
  - Update `controller/islands.js` to query MongoDB (`Product.find({ island: targetIsland })`) while maintaining visual themes.

---

### 📍 PHASE 3 — BUYER EXPERIENCE & PRODUCT DETAILS
**Goal:** Deliver a dynamic, end-to-end shopping experience from exploration to product sheets and merchant discovery.

* **Milestone 3.1: Dynamic Island Listings [COMPLETE]**
  - Ensure all 6 canonical island store listings query dynamically from MongoDB `Product` collection.
  - Enforce availability filtering (`isAvailable: true`), product ordering preservation, and real MongoDB Product `_id` usage.
  - Implement graceful nautical empty states for barren island catalogs and hardened 404 responses for invalid islands.
  - Preserve cartographic island lore and client-side drawer/cart compatibility.
* **Milestone 3.2: Reusable Product Details Sheet [COMPLETE]**
  - Created reusable route `/product/:productId` and view `views/product-detail.ejs` powered by `controller/products.js::renderProductDetail`.
  - Displays dynamic product imagery, Doubloons price, stock telemetry badges (`In Vaults`, `Low Reserve`, `Barren`), island origin, merchant bio/store name, breadcrumb navigation, and add-to-cart controls.
  - Connected all 6 canonical island product card items via image links, title links, and dedicated `🔍 DETAILS` action buttons.
  - Validated safe identifier lookups (ObjectId & slug), 404 for nonexistent/malformed/unavailable items, stock immutability, zero credential leakage, and 100% automated regression pass (1,161 assertions).
* **Milestone 3.3: Explorer → Seller Discovery [COMPLETE]**
  - Built discovery/navigation layer from existing products (`Product.seller → User`) to merchant public credentials.
  - Added clickable merchant card entry points on `/product/:productId` (avatar, store name, and `📜 DISCOVER MERCHANT` action button).
  - Created reusable discovery route `GET /seller/:sellerId` and view `views/seller-discovery.ejs` powered by `controller/sellers.js::renderSellerDiscovery`.
  - Queries MongoDB `User` with indexed `_id` and strict `role: 'seller'` enforcement (non-sellers and malformed IDs return clean 404s without CastError leaks).
  - Displays public seller identity (`storeName`, `avatar`, `homeIsland`, `bio`, active trade listing count, and sample chartered wares preview up to 4 items) while strictly guarding against credential leakage (`password`, `authSecretHash`, `googleId`).
  - Added prominent Phase 3.4 scope notice banner marking full storefront as deferred to Milestone 3.4.
* **Milestone 3.4: Seller Profile / Storefront [COMPLETE]**
  - Upgraded seller discovery page into a unified, reusable public Seller Profile / Storefront (`views/seller-discovery.ejs`) powered by `controller/sellers.js::renderSellerStorefront` at `GET /seller/:sellerId`.
  - Queries the merchant's complete active catalog via compound-indexed `Product.find({ seller: seller._id, isAvailable: true }).sort({ createdAt: -1 })`.
  - Displays merchant store header, avatar, chartered status, storeName, captain personal alias, home harbor badge with canonical island link, bio chronicle, active product telemetry count, and full catalog grid.
  - Every product card links directly to `/product/:productId` with image, Doubloons price, rating, stock status badges (`In Vaults`, `Low Reserve`, `Barren`), and "Stow in Cargo Hold" action buttons integrated with `#storeCartDrawer`.
  - Implements an atmospheric themed empty state for valid sellers with 0 active wares.
  - Guarantees multi-seller catalog isolation, excludes unavailable products (`isAvailable: false`), safe 404 for malformed/nonexistent/non-seller IDs without CastError leaks, and strictly excludes sensitive credentials (`password`, `authSecretHash`, `googleId`).
* **Milestone 3.5: Persistent Cart Integration [COMPLETE]**
  - Built persistent MongoDB cart endpoints (`GET /cart`, `POST /cart/add`, `POST /cart/update`, `POST /cart/remove`, `POST /cart/clear`) with optional authentication (`optionalAuth`) and session fallback.
  - Developed full SSR Cargo Manifest view (`views/cart.ejs`) with itemized table, line totals, trade port fee exemption, grand total, empty state, and action buttons.
  - Wired client-side engine (`public/js/island-store.js`) to sync topbar badge, drawer (`#storeCartDrawer`), and `/cart` manifest with backend state.
  - Seamlessly migrates guest session cart to MongoDB on login (`Cart.mergeSessionCart`).
  - Supports multi-island product additions, quantity increment/decrement, and item removal / jettison all.
  - Strictly enforces authoritative server-side pricing, inventory verification, client price override rejection, user isolation, and credential protection.
  - Guaranteed stock invariance and zero orders created (Phase 5 boundary preserved).
  - Validated with 82/82 automated milestone tests, full regression suite (599 assertions), and browser verification with 0 console errors.
* **Milestone 3.6: Buyer Regression & UX Verification [COMPLETE]**
  - Verified complete buyer journey in real browser: Login → Astrolabe → Product Detail → Discover Merchant → Seller Storefront → Catalog Navigation → Add to Cargo Hold → Cargo Hold Drawer → `/cart` Manifest → Quantity increment/decrement → Item removal → Multi-island add (Chronos) → Logout → Login again → Persistent MongoDB Cart verified → Jettison All Cargo → Empty State verified.
  - Verified all 6 canonical islands (Astrolabe, Chronos, Kraken Vault, Cutlass Cove, Velvet Isle, Booty Cay) with real MongoDB products, images, Doubloons prices, ratings, and navigation.
  - Verified user cart isolation, 404 security handling, stock invariance, zero credential leaks, and 0 unexpected console errors in browser subagent execution.
  - Automated regression suite: 695/695 passed (Phase 3.1: 160/160, Phase 3.2: 231/231, Phase 3.3: 54/54, Phase 3.4: 72/72, Phase 3.5: 82/82, Phase 3.6: 96/96).
  - Phase 3 is fully verified and COMPLETE.

---

### 📍 PHASE 4 — SELLER PLATFORM
**Goal:** Empower merchants to establish stores, manage inventory, and list products within the 6 islands.

* **Milestone 4.1: Seller Portal & Onboarding [COMPLETE]**
  - Established authenticated seller portal at `/seller/dashboard`, `/seller`, and `/seller/portal` guarded by `[authMiddleware, requireSeller]`.
  - Rejects buyers and admins with HTTP 403, and unauthenticated visitors with redirect to `/login`.
  - Derives seller identity strictly from authenticated `req.user`.
  - Renders reusable Seller Command Deck (`views/seller/dashboard.ejs`) displaying store name, captain alias, chartered merchant status badge, home harbor port link, bio chronicle, and real-time MongoDB telemetry counts (active vs. total catalog products) via indexed count queries.
  - Links directly to existing public storefront (`/seller/:id`).
  - Provides graceful fallbacks for missing optional profile fields and empty catalogs, plus placeholder operation tiles for future milestones.
  - Strictly protects sensitive credentials (`password`, `authSecretHash`, `googleId`).
  - Fully tested: 64/64 automated tests, 96/96 Phase 3 regression tests, and real browser verification with 0 console errors.
* **Milestone 4.2: Seller Product Management [COMPLETE]**
  - Built seller product management hub at `/seller/products` guarded by `[authMiddleware, requireSeller]`.
  - Queries strictly authenticated seller's products using compound index `{ seller: 1, createdAt: -1 }`.
  - Full product list with image, name, category, canonical island, Doubloons valuation, stock, availability status badges, and actions.
  - Implemented product edit flow (`GET /seller/products/:productId/edit`, `POST /seller/products/:productId/edit`) with field validation, safe sanitization, and strict ownership checks (`product.isOwnedBy(req.user)`).
  - Implemented instant availability toggle (`POST /seller/products/:productId/toggle-availability`) synchronized with public storefronts and listings.
  - Implemented safe product deletion (`POST /seller/products/:productId/delete`) with cross-seller guards, preserving historical Order snapshots and Cart integrity.
  - Fully tested: 67/67 automated tests, Phase 4.1 regression pass (64/64), Phase 3 regression pass (96/96), and real browser verification with 0 console errors.
* **Milestone 4.3: Product Creation [COMPLETE]**
  - Added authenticated product creation routes `GET /seller/products/new` and `POST /seller/products/new` guarded by `[authMiddleware, requireSeller]`.
  - Reusable creation form (`views/seller/product-create.ejs`) with canonical island validation (6 islands), canonical category validation (relics, apparel, provisions), non-negative price, non-negative integer stock, and availability toggle.
  - Implemented pre-check slug conflict detection and MongoDB E11000 duplicate handling without server crashes.
  - Activated "Forge New Cargo" action card (`#tileAddProduct`) and header quick link on the Command Deck.
  - Full catalog synchronization: newly created active products immediately appear in the seller catalog, public storefront, island listing, and product detail sheet, while unavailable products remain private to the seller.
  - Tested: 78/78 dedicated automated tests, full regressions (305 passed total), live server tests on port 3000, and end-to-end real browser CDP execution with 0 console errors.
* **Milestone 4.4: Merchant Order Management & Fulfillment [COMPLETE]**
  - Built authenticated seller order console at `GET /seller/orders`, order detail view at `GET /seller/orders/:orderId`, and status transition endpoint at `POST /seller/orders/:orderId/status` guarded by `[authMiddleware, requireSeller]`.
  - Scoped order queries server-side to the authenticated seller (`Order.findBySeller(req.user._id)`) utilizing the compound index `{ "items.seller": 1, status: 1 }`.
  - Multi-seller order isolation: exposes strictly authenticated seller's line items and seller-specific subtotal, while completely hiding other merchants' wares and financials in multi-merchant orders.
  - Snapshot preservation: renders historical item snapshots (`name`, `price`, `quantity`, `lineTotal`, `image`) directly from `Order.items`, ensuring product catalog updates never mutate historical orders.
  - Lifecycle state machine: reuses authoritative `models/order.js` methods (`canTransitionTo`, `transitionTo`) to enforce canonical status progression (`pending` ➔ `confirmed` ➔ `processing` ➔ `shipped` ➔ `delivered`, with safe cancellations) and rejects invalid/terminal transitions.
  - Activated "Dispatch Manifests" action card (`#tileOrders`) and header quick link on the Command Deck.
  - Telemetry counters: displays real-time counts of total, pending, confirmed, processing, shipped, delivered, and cancelled manifests with interactive filter tabs.
  - Fully tested: 75/75 automated dedicated tests, full regression suite (380/380 assertions passing), and real browser verification with 0 console errors.
* **Milestone 4.5: Seller Profile Management [COMPLETE]**
  - Created authenticated seller profile customizer at `GET /seller/profile`, `POST /seller/profile`, and `POST /seller/profile/edit` guarded strictly by `[authMiddleware, requireSeller]`.
  - Reused existing unified `User` model fields (`name`, `storeName`, `homeIsland`, `bio`, `avatar`) without creating redundant Seller/Merchant models.
  - Derived seller identity strictly from authenticated `req.user._id`, ignoring client-spoofed IDs in body or parameters.
  - Enforced server-side validation on captain name (required, max 120), storefront title (optional, max 120), canonical 6 islands (`astrolabe`, `chronos`, `kraken_vault`, `cutlass_cove`, `velvet_isle`, `booty_cay`), bio lore (optional, max 2000), and avatar path/URL with malicious protocol rejection (`javascript:`, etc.).
  - Preserved safe submitted values on validation failure with descriptive error feedback without crashing or corrupting data.
  - Explicitly excluded account security fields (`email`, `password`, `authSecretHash`, `googleId`, `role`) from updating, strictly preventing privilege escalation or role mutation.
  - Activated "Captain's Profile" action card (`#tileProfile`) and header quick link (`#headerProfileLink`) across seller portal screens.
  - Ensured immediate synchronization of profile changes to the Seller Command Deck (`/seller/dashboard`) and Public Merchant Storefront (`/seller/:sellerId`).
  - Catalog and order immutability preserved: existing products, carts, and order records/snapshots unaffected.
  - Fully tested: 76/76 automated dedicated tests, full regression suite (456/456 assertions passing), and real browser verification with 0 console errors.
  - **Phase 4 is fully verified and COMPLETE.**

---

### 📍 PHASE 5 — CART, CHECKOUT & ORDERS
**Goal:** Build a functional, server-persisted transaction engine with multi-party order fulfillment.

* **Milestone 5.1: Database-Backed Cart System [COMPLETE]**
  - Reconciled roadmap with existing persistent Cart architecture from Milestone 2.3 and 3.5 without duplicating models, collections, or routes.
  - Verified pre-login guest session cart capture and automatic migration into MongoDB upon authentication (`Cart.mergeSessionCart`).
  - Implemented real-time stock validation on `/cart/add` (rejecting exhausted inventory with 400 and bounding additions to remaining stock).
  - Implemented real-time stock validation on `/cart/update` (rejecting increments beyond available reserve stock with 400; rejecting increases on unavailable products).
  - Enhanced `Cart.mergeSessionCart` to clamp excess quantities to available product stock and safely filter exhausted products.
  - Added live "Vault Reserve: X available" indicator to Cargo Hold Manifest table (`views/cart.ejs`) and client store script (`public/js/island-store.js`).
  - Enforced single cart per user constraint at MongoDB level (`user: 1` unique index) and strict isolation (`req.user._id`).
  - Preserved catalog stock invariance and verified zero orders created.
  - Validated with 60/60 automated dedicated tests (`scratch/test_milestone_5_1.js`), 389 regression tests (Phase 4.5: 76/76, Phase 4.4: 75/75, Phase 3.6: 96/96, Phase 3.5: 82/82), and real browser verification with 0 console errors.
* **Milestone 5.2: Checkout Flow [COMPLETE]**
  - Built Voyage Checkout view (`views/checkout.ejs`) with atmospheric nautical layout, responsive grid, breadcrumbs, and live summary valuation.
  - Implemented `controller/orders.js` exporting `renderCheckout` (`GET /checkout`) and `validateCheckout` (`POST /checkout`) guarded with `[authMiddleware, requireBuyer]`.
  - Re-read authoritative Product records from MongoDB for live pricing, availability, and vault reserve checks on every checkout request.
  - Calculated server-side Doubloons breakdown: item line totals (`price * quantity`), subtotal, trade port fee (exempt: 0 Doubloons), and grand total.
  - Added delivery coordinates collection (`portName`, `islandCoordinates`, `recipientNotes`) matching `models/order.js` shippingAddress schema with strict validation and safe value retention.
  - Enforced Phase 5.2 Order Boundary: Verified zero Order documents created, zero Product.stock decrements, and buyer Cart intact.
  - Validated with 64/64 dedicated automated tests (`scratch/test_milestone_5_2.js`), 327 regression assertions (5.1, 4.5, 4.4, 3.6), clean syntax on 22 JS and 31 EJS files, and real browser verification.
* **Milestone 5.3: Order Generation & State Machine [COMPLETE]**
  - Implemented authoritative buyer order generation endpoint (`POST /checkout/confirm`) and confirmation view (`GET /orders/:orderId`) guarded with `[authMiddleware, requireBuyer]`.
  - Reused existing single `models/order.js` schema; orders created with initial status `pending` and paymentStatus `pending`.
  - Generated historical immutable snapshots (`product`, `seller`, `name`, `price`, `quantity`, `lineTotal`, `image`) directly from live MongoDB `Product` records.
  - Calculated server-side authoritative pricing: line totals, subtotal, 0 trade port fee (exempt), and grand total.
  - Implemented double-submission protection via client-side submit button locking and server-side empty cart validation.
  - Implemented inventory deduction using conditional update filters (`{ _id, stock: { $gte: quantity }, isAvailable: true }`) ensuring stock never drops below zero.
  - Cleared buyer's persistent Cart (`cart.items = []`) upon successful order creation.
  - Integrated with existing Order state machine (`canTransitionTo`, `transitionTo`) and verified full lifecycle (`pending` ➔ `confirmed` ➔ `processing` ➔ `shipped` ➔ `delivered`, with permitted cancellations).
  - Integrated with Seller Order Console (`Order.findBySeller`), allowing merchants to view stowed cargo and advance fulfillment.
  - **Important Architecture Limitation (Demo-Compatible Implementation):** The local development environment operates on a standalone MongoDB deployment without replica sets. Order creation uses a strictly validated write sequence (Validation ➔ Order Creation ➔ Stock Updates ➔ Cart Clearance) and is non-transactional. Production deployments must configure a replica set or sharded cluster to use native MongoDB multi-document transactions for true ACID atomicity.
  - Validated with 70/70 dedicated automated tests (`scratch/test_milestone_5_3.js`), 487 regression assertions, 22 JS and 32 EJS syntax checks, and real browser verification.
* **Milestone 5.4: Buyer Order History & Tracking [COMPLETE]**
  - Built authenticated customer order history index (`/orders`) and enhanced voyage manifest tracking (`/orders/:orderId`) guarded by `[authMiddleware, requireBuyer]`.
  - Pinned order access strictly to authenticated `req.user._id`, sorting newest orders first via `{ buyer: 1, createdAt: -1 }` compound index.
  - Implemented strict ownership isolation: attempts to view another buyer's order return HTTP 404 with zero order data leakage.
  - Created Captain's Voyage Ledger view (`views/orders.ejs`) with order summary metrics, order cards, destination port, Doubloon grand total, payment status, cargo item preview, and a themed empty state ("No voyages recorded yet, Captain.") with island exploration CTA.
  - Enhanced Voyage Manifest view (`views/order-confirmation.ejs`) with an accessible, responsive Nautical Tracking Timeline (`Pending` ➔ `Confirmed` ➔ `Processing` ➔ `Shipped` ➔ `Delivered`) visually distinguishing completed, current, and upcoming stages.
  - Added dedicated terminal cancellation banner (`#cancelledBanner`) for revoked charters.
  - Preserved historical snapshot integrity and added role-aware `⚓ My Voyages` navigation link in `views/partials/header.ejs`.
  - Validated with 92/92 dedicated automated tests (`scratch/test_milestone_5_4.js`), full regression suite (645 assertions passing), clean JS/EJS syntax checks, and real browser verification.
  - **PHASE 5 IS FULLY VERIFIED AND COMPLETE.**
* **Milestone 5.5: Seller Order Management [COMPLETE in Milestone 4.4]**
  - Seller order console at `/seller/orders` and `/seller/orders/:id` allowing merchants to view items and advance statuses was implemented in Phase 4.4 and verified integrated with Phase 5.3 orders.

---

### 📍 PHASE 6 — ENTRY MAP GATEWAY & FINAL UI POLISH
**Goal:** Unify the two portals behind a grand entry map, optimize responsiveness, and elevate visual presentation.

* **Milestone 6.1: Pirate-Civ Entry Map Gateway [COMPLETE]**
  - Replaced the root entry experience at `GET /` with a visually distinctive Pirate-Civ cartographic gateway (`views/gateway.ejs`).
  - Implemented dual-path fork choices:
    - 🏴‍☠️ **Customer / Explorer Gateway:** Navigates directly to Sea Chart (`/home`).
    - ⚓ **Merchant / Armator Gateway:** Navigates directly to Seller Command Deck (`/seller/dashboard`).
  - Route `GET /` uses `optionalAuth`, returning HTTP 200 without requiring login.
  - Zero unnecessary MongoDB work: zero product queries, zero order queries, zero cart queries, and zero user mutations on root gateway.
  - Preserved authoritative route protection: `/home` strictly requires authentication (`authMiddleware`), `/seller/dashboard` strictly enforces seller authorization (`authMiddleware, requireSeller`).
  - Minimal branded navigation with role-aware user badge, logout, or login/join-the-crew links.
  - Canonical 6-island archipelago displayed as world-building constellation chips.
  - Fully responsive layout on desktop and mobile viewports with accessible keyboard focus states and subtle interactive hover effects.
  - Validated with 45/45 dedicated automated tests (`scratch/test_milestone_6_1.js`), 636/636 regression assertions (5.4, 5.3, 5.2, 5.1, 4.5, 4.4, 4.3, 4.2, 4.1, 3.6), 22 JS and 34 EJS syntax checks, and real browser verification with 0 console errors.
* **Milestone 6.2: Role-Aware Global Navigation [NEXT]**
  - Update `views/partials/header.ejs` to dynamically render options based on `req.user.role`.
* **Milestone 6.3: Comprehensive UI Polish & Micro-Interactions**
  - Polish empty states (empty cart, no orders, empty island listings).
  - Add skeleton loaders and smooth page transitions.
  - Audit and fix all tablet/mobile responsive breakpoints.
