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
* **Milestone 3.2: Reusable Product Details Sheet [NEXT]**
  - Create route `/product/:productId` and shared view `views/product_detail.ejs`.
  - Display dynamic product imagery, Doubloons price, stock telemetry, island origin, merchant bio, and add-to-cart controls.
* **Milestone 3.3: Seller Discovery ("Explore Sellers")**
  - Refactor `/users` into `/sellers` with updated view `views/sellers.ejs`.
  - Display registered merchants, their home island badges, and active catalog counts.
* **Milestone 3.4: Public Seller Profile**
  - Create route `/seller/:sellerId` and view `views/seller_profile.ejs`.
  - Show merchant store banner, lore, ratings, and all products listed by this seller.
* **Milestone 3.5: Customer Account Profile**
  - Create route `/profile` for buyers to view their account info, home port, and personal preferences.

---

### 📍 PHASE 4 — SELLER PLATFORM
**Goal:** Empower merchants to establish stores, manage inventory, and list products within the 6 islands.

* **Milestone 4.1: Dedicated Seller Auth & Onboarding**
  - Add `/seller/register` and `/seller/login` routes with merchant-specific onboarding fields.
* **Milestone 4.2: Seller Command Deck (Dashboard)**
  - Create route `/seller/dashboard` and view `views/seller/dashboard.ejs`.
  - Display revenue in Doubloons, total products, out-of-stock alerts, and incoming orders.
* **Milestone 4.3: Product Catalog Management (CRUD)**
  - Create product route `/seller/products/new` with island selection (limited to 6 islands) and category selection.
  - Implement product edit (`/seller/products/:id/edit`) and delete (`/seller/products/:id/delete`).
  - Enforce ownership validation: sellers can modify only their own products.
* **Milestone 4.4: Stock & Inventory Management**
  - Quick-update stock toggle and availability flags from the seller dashboard.

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
