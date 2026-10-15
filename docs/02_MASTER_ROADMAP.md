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
* **Milestone 4.3: Product Creation [NEXT]**
  - Add product creation route `/seller/products/new` with island selection (limited to 6 canonical islands) and category selection.
  - Safe product creation attributing new listings to authenticated seller (`req.user._id`).

---

### 📍 PHASE 5 — CART, CHECKOUT & ORDERS
**Goal:** Build a functional, server-persisted transaction engine with multi-party order fulfillment.

* **Milestone 5.1: Database-Backed Cart System**
  - Create API routes `/cart/add`, `/cart/update`, `/cart/remove`, and `/cart`.
  - Sync guest/localStorage cart into MongoDB upon login.
  - Validate requested quantities against current product stock in real time.
* **Milestone 5.2: Checkout Flow**
  - Create `/checkout` view with delivery coordinates input, order breakdown, and Doubloons calculation.
* **Milestone 5.3: Order Generation & State Machine**
  - Save orders into `models/order.js` with initial status `pending`.
  - Implement order state machine: `pending` → `confirmed` → `processing` → `shipped` → `delivered` (or `cancelled`).
* **Milestone 5.4: Buyer Order History & Tracking**
  - Create `/orders` and `/orders/:id` for customer tracking with nautical timeline visualizer.
* **Milestone 5.5: Seller Order Management**
  - Create `/seller/orders` and `/seller/orders/:id` allowing merchants to view items and advance statuses.

---

### 📍 PHASE 6 — ENTRY MAP GATEWAY & FINAL UI POLISH
**Goal:** Unify the two portals behind a grand entry map, optimize responsiveness, and elevate visual presentation.

* **Milestone 6.1: Pirate-Civ Entry Map Gateway**
  - Build landing route `/` with a dual-path fork:
    - 🏴‍☠️ **Customer / Explorer Gateway:** Navigates to buyer portal / sea chart.
    - ⚓ **Merchant / Armator Gateway:** Navigates to seller dashboard / onboarding.
* **Milestone 6.2: Role-Aware Global Navigation**
  - Update `views/partials/header.ejs` to dynamically render options based on `req.user.role`.
* **Milestone 6.3: Comprehensive UI Polish & Micro-Interactions**
  - Polish empty states (empty cart, no orders, empty island listings).
  - Add skeleton loaders and smooth page transitions.
  - Audit and fix all tablet/mobile responsive breakpoints.
