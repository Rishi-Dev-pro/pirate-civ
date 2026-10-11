# 🏴‍☠️ 15_CHANGELOG — Chronological Project Changelog

All notable changes, milestones, bug fixes, and architectural adjustments to Pirate-Civ are documented here in reverse chronological order.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
