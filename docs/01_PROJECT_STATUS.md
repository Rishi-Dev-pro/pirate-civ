# 🏴‍☠️ 01_PROJECT_STATUS — Current Reality of the Codebase

**Audit Baseline Date:** 2026-10-10  
**Current State:** Initial Audit Completed — Baseline Established  
**Next Mandatory Update:** At the conclusion of Phase 1  

This document reflects the **unvarnished, ground-truth reality** of the Pirate-Civ codebase. No feature may be marked as "Complete" unless it is fully backed by database persistence, protected by server-side authorization, and verified via end-to-end testing.

---

## 1. System Status by Category

### 🟢 COMPLETE
* **Express 5 Framework:** Server initialization, middleware pipeline, static serving, and environment configuration in `index.js`.
* **Database Connection:** Resilient MongoDB connection handler via Mongoose in `config/db.js`.
* **Cryptographic Token Auth Backend:** Password hashing via `bcrypt` (salt rounds: 12), random 32-byte secret generation, SHA-256 token hashing, signed cookie handling (`auth_token`), and session comparison in `controller/auth.js` and `middleware/auth.js`.
* **Logout Flow:** Route `/logout` clears the session and invalidates the signed `auth_token` cookie.
* **Basic Protected Routes:** Core routes (`/`, `/about`, `/contact`, `/users`, `/island/*`) are guarded by `authMiddleware`.
* **Home Page Sea Chart UI:** Interactive cartographic mind map with animated SVGs, fire embers, smoke backdrop, lantern cursor tracking, and celestial compass rose in `views/home.ejs` and `public/js/mindmap.js`.
* **Island Views (Frontend Presentation):** 6 themed EJS views (`astrolabe.ejs`, `chronos.ejs`, `kraken_vault.ejs`, `cutlass_cove.ejs`, `velvet_isle.ejs`, `booty_cay.ejs`) with custom visual styling and atmospheric details.
* **Unified User Model (`models/user.js`):** Schema supports `role` (`'buyer'` default, `'seller'`, `'admin'`), optional merchant profile fields (`storeName`, `homeIsland`, `bio`, `avatar`), and `googleId` with sparse unique index. Fully tested for backward compatibility.
* **Role-Based Authorization Middleware (`middleware/roles.js`):** Modular RBAC middleware exporting `requireRole(...roles)`, `requireSeller`, `requireBuyer`, and `requireAdmin`. Rejects unauthorized roles with HTTP 403 and unauthenticated requests with redirect to `/login`. Fully verified.
* **Authentication UX & Error Handling (`controller/auth.js`, `views/login.ejs`, `views/register.ejs`):** Styled dark-fantasy error banners, input retention (name/email), generic security-conscious login failures, duplicate email detection without raw MongoDB error leaks, and registration redirect to login.
* **Remember Me Foundation & Persistence (`controller/auth.js`, `views/login.ejs`):** Dynamic session and signed `auth_token` cookie lifetime (30 days persistence when checked vs. 24 hours standard session). Passwords are never stored in cookies or localStorage.
* **Contact View Template Fix (`views/contact.ejs`):** Removed rogue markdown fences (````html` and ````), maintaining full MongoDB submission capability and clean HTML DOM rendering.
* **About Page Themed Copy (`views/about.ejs`):** Replaced placeholder text with polished Pirate-Civ dark-fantasy nautical lore, archipelago cards, and merchant trading narrative.
* **Cleaned Dead Mock Data (`routes/web.js`):** Removed unused `studentInfo` mockup and `student_data` parameter from home route `/`.
* **Contact Submission to DB:** Form POST `/contact` persists name, email, subject, and message into MongoDB `contacts` collection via `models/contact.js` and `controller/contact.js`.
* **Product Model Foundation (`models/product.js`):** Foundational Mongoose model linking items to `User` (seller reference), supporting canonical island enum (6 islands), auto-slug generation, Doubloons pricing, integer non-negative stock, availability toggle, and compound indexes. Tested and verified.
* **Seller ↔ Product Relationship (`models/product.js`):** Formalized seller ownership between unified `User` (`role: 'seller'`) and `Product` via `seller: ObjectId` reference (`ref: 'User'`). Added static `Product.findBySeller(sellerId)` utilizing `{ seller: 1, createdAt: -1 }` compound index and instance helper `product.isOwnedBy(userOrId)` for safe ownership comparisons. Tested query isolation, empty seller results, and population with secret exclusion.
* **Persistent Cart Model & Session Integration (`models/cart.js`, `controller/auth.js`):** MongoDB-backed Cart model establishing `User 1 ──── owns ──── 1 Cart` with embedded `items: [{ product, quantity }]`. Enforces positive integer quantities (`min: 1`, `Number.isInteger`), unique user indexing (`unique: true`), duplicate item merging via `cart.addItem()`, `Cart.findByUser(userId)`, safe session cart migration upon authentication (`Cart.mergeSessionCart`), invalid product/quantity filtering without crashing, and user isolation. Tested and verified.
* **Order Model & Order Lifecycle Foundation (`models/order.js`):** MongoDB-backed Order model with embedded `items` capturing historical price and name snapshots (`name`, `price`, `quantity`, `lineTotal`, `seller`, `product`). Guarantees historical transaction immutability regardless of subsequent product updates. Enforces canonical status lifecycle (`pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`) with permitted state machine transitions (`canTransitionTo`, `transitionTo`), payment status foundation (`pending`, `paid`, `failed`, `refunded`), required shipping address, compound indexes (`{ buyer: 1, createdAt: -1 }`, `{ "items.seller": 1, status: 1 }`), query helpers (`findByBuyer`, `findBySeller`), stock invariance, and credential exclusion upon population. Fully tested and verified.
* **Controlled Product Migration & Seeding (`scripts/seedProducts.js`):** Standalone and modular idempotent migration script importing the entire 32-item product catalog from `controller/islands.js` into MongoDB. Attributed to the canonical merchant (`Grand Admiralty Cartographers`, `admiralty@pirate-civ.internal`, `role: "seller"`). Normalizes price strings to integer Doubloons, maps taxonomy cleanly to the 6 canonical islands and 3 categories, generates deterministic slugs, preserves stock invariance on reruns, and pre-validates against the Mongoose `Product` schema. Verified idempotent across repeated runs.
* **Database Integration & Core SSR Verification (`controller/islands.js`, `routes/web.js`):** Integrated MongoDB `Product` model into `renderIslandPage` controller action. All 6 island store views (`astrolabe`, `chronos`, `kraken_vault`, `cutlass_cove`, `velvet_isle`, `booty_cay`) dynamically hydrate products directly from MongoDB while preserving static lore/cartographic metadata. Formatted attributes maintain 100% EJS compatibility. Verified HTTP SSR responses, unauthenticated redirects, and user isolation. **PHASE 2 IS COMPLETE.**
* **Pre-Phase 3 Release Gate: Full Codebase Audit & Hardening (`docs/18_CODEBASE_AUDIT.md`):** Complete repository-wide audit covering static syntax (18/18 JS files), EJS compilation (20/20 templates), database singleton lifecycle, graceful shutdown (`SIGINT`/`SIGTERM`), centralized error handler, styled 404 handler, JSON body parsing, failure injection, credential leakage protection, and role-based authorization matrix. 770/770 automated regression tests passing. **PRE-PHASE 3 READY.**
* **Dynamic Island Listings (Milestone 3.1 COMPLETE):** All 6 canonical leaf islands (`astrolabe`, `chronos`, `kraken_vault`, `cutlass_cove`, `velvet_isle`, `booty_cay`) genuinely dynamic backed solely by MongoDB `Product` model via `{ island: normalizedKey, isAvailable: true }` compound indexed query. Added graceful nautical empty states when an island has zero available products, hardened canonical island parameter validation with 404 error responses, sanitized product mapping with safe ObjectId/string compatibility, unified Doubloon pricing displays, added underscore alias shorthand routes, and validated 160/160 automated tests + 65/65 live SSR tests + browser end-to-end verification. **MILESTONE 3.1 COMPLETE.**
* **Reusable Product Detail Page (Milestone 3.2 COMPLETE):** Created one unified reusable Product Detail Page (`views/product-detail.ejs`) backed by `controller/products.js::renderProductDetail` and routed at `GET /product/:productId`. Safely queries MongoDB `Product` by ObjectId or unique slug with availability check (`isAvailable: true`), populates safe public seller metadata without leaking sensitive credentials (`password`, `authSecretHash`, `googleId`), displays visual artifact showcase with atmospheric glow, Doubloons valuation, stock level badges, breadcrumbs, return to island link, and integrated Cargo Hold drawer. Connected all 6 island listing product cards via image links, title links, and dedicated `🔍 DETAILS` buttons. Validated with 231/231 automated milestone tests, 87/87 live SSR tests, full 1,161-assertion regression suite, and browser end-to-end recording with 0 console errors. **MILESTONE 3.2 COMPLETE.**
* **Explorer → Seller Discovery (Milestone 3.3 COMPLETE):** Implemented merchant discovery navigation layer from existing products (`Product.seller → User`). On Product Detail (`views/product-detail.ejs`), enriched merchant card with clickable avatar link, clickable store name link, and a dedicated `📜 DISCOVER MERCHANT` action button leading to `GET /seller/:sellerId`. Created reusable Seller Discovery view (`views/seller-discovery.ejs`) backed by `controller/sellers.js::renderSellerDiscovery`. Safely queries MongoDB `User` with indexed `_id` and strict `role: 'seller'` enforcement (non-sellers and malformed IDs return clean 404s without CastError leaks). Exposes only public identity (`storeName`, `avatar`, `homeIsland`, `bio`, active trade listing count, and sample chartered wares preview up to 4 items) while strictly guarding against credential leakage (`password`, `authSecretHash`, `googleId`). Clearly marked Milestone 3.4 scope boundary banner. Validated with 54/54 automated milestone tests, live SSR tests on port 3000, 1,161 regression tests (1,215 total), and browser end-to-end verification with 0 console errors. Milestone 3.4 was NOT implemented. **MILESTONE 3.3 COMPLETE.**

---

### 🟡 PARTIALLY COMPLETE
* **Explorer Page (`/users`):** Displays all registered users from MongoDB in a nautical grid (`views/users.ejs`), but treats them as generic students/users rather than pirate merchants and marketplace sellers.
* **Responsive UI:** Desktop layouts are polished, but certain island product grids, cart drawers, and mind map canvas scaling require mobile/tablet tuning.
* **Cargo Cart:** Backend Cart schema, user isolation, and session-to-DB migration are complete; buyer REST endpoints (`/cart/add`, `/cart/remove`) and frontend drawer API wiring belong to Phase 3.

---

### 🟠 FRONTEND ONLY (Simulated / Non-Persistent)
* **Add to Cart UI:** Clicking "Add to Cart" on the static island views operates via browser `localStorage` in `public/js/island-store.js`. (Database persistence foundation is ready in `models/cart.js`).
* **Shopping Cart Drawer UI:** The slide-out cart UI displays items from `localStorage` awaiting Phase 3 endpoint connection.
* **Checkout Flow:** The checkout button triggers a simulated toast/alert without generating an order record or checking user balances.

---

### 🔴 BACKEND ONLY
*(None currently — all existing backend endpoints have an associated frontend page).*

---

### ⚪ NOT IMPLEMENTED
* **Product CRUD APIs:** No routes or controllers for creating, updating, or deleting products.
* **Seller Management Platform:** The entire seller portal (registration, dashboard, inventory management, incoming order tracking) is 0% implemented.
* **Public Seller Discovery & Profiles:** No `/sellers` directory or `/seller/:sellerId` profile view.
* **Dynamic Product Details Page:** No dedicated `/product/:productId` route or template; users cannot view an isolated product sheet.
* **Buyer Order History & Profile:** No `/orders` or `/profile` page for buyers to view past purchases or account details.
* **Entry Map Gateway:** No gateway screen allowing incoming visitors to branch into the Buyer or Seller experience before entering the market.
* **Google OAuth Authentication:** No OAuth2 strategy or credential linkage configured.

---

### ⚠️ BROKEN / DEFECTIVE
*(None currently — all identified template syntax bugs and placeholder copy issues were resolved in Milestone 1.3).*

---

### 🛠️ TECHNICAL DEBT
1. **Product Data Duplication:** RESOLVED. MongoDB is now the single runtime source of truth for island product catalogs via `Product.find(...)`. Static island lore and cartographic metadata remain in `ISLANDS_DATA`.
2. **No Centralized Error Handling:** RESOLVED. Added centralized Express error handler (`server.use((err, req, res, next) => ...)`) in `index.js` suppressing stack trace leakage, along with styled 404 catch-all handler.
3. **Session Store In-Memory:** Express-session currently uses default memory storage; restarting the server invalidates active sessions.

---

## 2. Component Readiness Matrix

| Component | Frontend State | Backend State | Database State | Overall Readiness |
|---|---|---|---|:---:|
| **Unified User Model** | N/A (Schema) | 🟢 Complete Mongoose model | 🟢 Validated schema | **100%** |
| **Role Authorization Middleware** | N/A (Middleware) | 🟢 Complete RBAC guards | 🟢 Evaluates user.role | **100%** |
| **Buyer Auth (Register/Login)** | 🟢 Polished UI, error banner | 🟢 Validated, RBAC role assigned | 🟢 Unified User schema | **100%** |
| **Remember Me** | 🟢 Checkbox styled & wired | 🟢 Dynamic maxAge handling | 🟢 Secure authSecretHash | **100%** |
| **Contact Page** | 🟢 Clean template & styling | 🟢 Connected to MongoDB | 🟢 Model active | **100%** |
| **About Page** | 🟢 Nautical lore & cards | 🟢 Functional route | N/A | **100%** |
| **Product Model** | N/A (Schema) | 🟢 Complete Mongoose model | 🟢 Validated schema & indexes | **100%** |
| **Seller ↔ Product Relationship** | N/A (Data Architecture) | 🟢 findBySeller & isOwnedBy | 🟢 ref: 'User' & compound index | **100%** |
| **Product Migration & Seeding** | N/A (Data Architecture) | 🟢 Idempotent seed script (`scripts/seedProducts.js`) | 🟢 32 products migrated under canonical merchant | **100%** |
| **Persistent Cart (Model & Persistence)** | 🟡 Frontend / localStorage | 🟢 Session migration & Cart helpers | 🟢 Validated schema & unique user index | **85%** |
| **Entry Map Gateway** | ❌ Missing | ❌ Missing | N/A | **0%** |
| **Google OAuth** | ❌ Missing | ❌ Missing | 🟡 Schema ready (`googleId`) | **20%** |
| **Sea Chart / Home** | 🟢 Complete & animated | 🟢 Clean controller route | 🟢 32 products ready in DB | **85%** |
| **6 Leaf Islands** | 🟢 Complete themed views | 🟢 MongoDB-backed SSR (`controller/islands.js`) | 🟢 32 products active in DB | **100%** |
| **Product Detail Page** | 🟢 Complete reusable EJS view (`views/product-detail.ejs`) | 🟢 MongoDB-backed SSR (`controller/products.js`) | 🟢 Live products queryable by _id & slug with availability guards | **100%** |
| **Seller Discovery from Product** | 🟢 Reusable discovery view (`views/seller-discovery.ejs`) & links | 🟢 MongoDB-backed SSR (`controller/sellers.js`) | 🟢 Real User _id, role: 'seller', credentials scrubbed, 404 guards | **100%** |
| **Public Seller Profile & Full Storefront** | ❌ Deferred to 3.4 | ❌ Deferred to 3.4 | 🟡 Preview wares up to 4 items active | **20%** |
| **Order Model & Lifecycle Foundation** | N/A (Schema) | 🟢 State machine & Query helpers | 🟢 Validated schema & snapshot integrity | **100%** |
| **Cargo Cart** | 🟡 Frontend / localStorage | ❌ Missing API | 🟢 Schema ready (`models/cart.js`) | **25%** |
| **Checkout Flow** | 🟡 Simulated UI | ❌ Missing API | ❌ Missing | **10%** |
| **Buyer Orders & Tracking** | ❌ Missing | ❌ Missing | 🟢 Schema ready (`models/order.js`) | **20%** |
| **Buyer Profile** | ❌ Missing | ❌ Missing | ❌ Missing | **0%** |
| **Seller Dashboard** | ❌ Missing | ❌ Missing | ❌ Missing | **0%** |
| **Seller Product CRUD** | ❌ Missing | ❌ Missing | ❌ Missing | **0%** |
| **Seller Order Fulfillment** | ❌ Missing | ❌ Missing | 🟢 Schema ready (`models/order.js`) | **20%** |
