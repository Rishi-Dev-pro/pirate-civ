# 🏴‍☠️ 14_DECISION_LOG — Architectural Decision Records (ADR)

This log preserves key architectural choices, trade-offs, and design decisions made throughout the evolution of Pirate-Civ.

```
┌────────────────────────────────────────────────────────────────────────┐
│ DECISION PROTOCOL:                                                     │
│ 1. Every major architectural decision must be logged here.             │
│ 2. Required format: Decision ID, Title, Date, Status, Context,         │
│    Decision, Reason, Alternatives Considered, and Consequences.        │
│ 3. NEVER silently reverse an existing decision without adding a new   │
│    superseding decision record explaining the reason.                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🏛️ Decision Records

### Decision 001: Unified User Model with Role-Based Identity
* **Date:** 2026-10-10
* **Status:** Accepted
* **Context:** The marketplace requires two distinct user personas: Customers (Buyers) and Merchants (Sellers).
* **Decision:** Implement a single, unified `User` collection in MongoDB with a `role` field (`'buyer'`, `'seller'`, `'admin'`) and optional merchant profile attributes (`storeName`, `homeIsland`, `bio`).
* **Reason:** Avoids maintaining duplicate authentication controllers, separate session tables, and redundant password-hashing logic. Simplifies Google OAuth and allows a user account to hold merchant capabilities without dual logins.
* **Alternatives Considered:** Separate `Buyer` and `Seller` Mongoose models. Rejected due to code duplication and session synchronization friction.
* **Consequences:** Controllers must verify `req.user.role === 'seller'` on merchant-specific routes.

---

### Decision 002: Preservation of Express 5 + EJS Architecture
* **Date:** 2026-10-10
* **Status:** Accepted
* **Context:** Consideration of whether to migrate Pirate-Civ to modern SPA/SSR frameworks (React, Next.js).
* **Decision:** Pirate-Civ will remain firmly an Express 5 + EJS server-rendered application.
* **Reason:** The existing codebase already features a rich, working visual theme (nautical grid, custom CSS, client-side mind map). An SPA rewrite would introduce immense migration overhead without enhancing the core pirate immersion.
* **Alternatives Considered:** Next.js with React & TailwindCSS. Rejected as unnecessary over-engineering that risks breaking existing animations.
* **Consequences:** All new pages must be created as EJS templates in `/views` using Vanilla CSS design tokens.

---

### Decision 003: MongoDB as Single Source of Truth for Products
* **Date:** 2026-10-10
* **Status:** Accepted
* **Context:** Product catalogs are currently hardcoded across two separate JavaScript dictionaries (`controller/islands.js` and `public/js/mindmap.js`).
* **Decision:** Migrate all products into a persistent `products` collection in MongoDB. All island pages, search queries, and client scripts must consume data queried from this database.
* **Reason:** Hardcoded products prevent merchants from dynamically creating, editing, or managing stock, and lead to data drift between views.
* **Alternatives Considered:** JSON file persistence (`data.json`). Rejected due to concurrency issues during multi-user checkouts and lack of indexing.
* **Consequences:** Requires a seed script in Phase 2 to migrate hardcoded catalogs without losing existing products.

---

### Decision 004: Single Reusable Product Details Page
* **Date:** 2026-10-10
* **Status:** Accepted
* **Context:** Products on different islands have distinct regional themes; should each island have a bespoke product detail template?
* **Decision:** Implement a single, shared, dynamic template (`views/product_detail.ejs`) accessed via `/product/:productId`.
* **Reason:** Writing bespoke product sheets for every island creates maintenance debt and inconsistent cart behavior. The shared template will dynamically adopt the island's theme badge, seller bio, and product specifics.
* **Alternatives Considered:** 6 individual product views (`astrolabe_item.ejs`, `chronos_item.ejs`, etc.). Rejected due to severe code duplication.
* **Consequences:** Template must accept an `island` context parameter to render matching styling accents.

---

### Decision 005: Explorer Page Evolution into Seller Discovery
* **Date:** 2026-10-10
* **Status:** Accepted
* **Context:** The existing `/users` view lists registered users as generic "Explorers", presenting mock student data.
* **Decision:** Transform `/users` into `/sellers` ("Explore Merchants"), listing registered sellers with store badges, home island affiliation, and active inventory counts.
* **Reason:** In an e-commerce marketplace, discovering merchant shops and their regional lore is meaningful to buyers, whereas viewing raw customer accounts is a privacy violation.
* **Alternatives Considered:** Retaining a global user list. Rejected as inappropriate for an e-commerce platform.
* **Consequences:** Legacy route `/users` will redirect to `/sellers` for backward compatibility.

---

### Decision 006: Product Synchronization Does Not Require WebSockets
* **Date:** 2026-10-10
* **Status:** Accepted
* **Context:** Whether real-time inventory updates and order tracking necessitate a WebSocket server (e.g., Socket.io).
* **Decision:** For the initial architecture (Phases 1–6), standard HTTP request-response patterns and client-side fetch APIs are sufficient. WebSockets are deferred to a post-launch phase.
* **Reason:** WebSockets add connection state complexity and deployment overhead. Standard REST calls provide adequate responsiveness for initial cart and order flows.
* **Alternatives Considered:** Socket.io real-time order tracking. Deferred to keep Phase 1–5 lean and reliable.
* **Consequences:** Order tracking pages will refresh on page reload or poll via lightweight fetch if live updates are desired.

---

### Decision 007: Controlled Seed Migration of Existing Island Products
* **Date:** 2026-10-10
* **Status:** Accepted
* **Context:** Moving products to MongoDB risks wiping the hand-crafted items already charted across the 6 islands.
* **Decision:** Create an idempotent seed script (`scripts/seedProducts.js`) that imports all 28+ existing products from `controller/islands.js` into MongoDB under a canonical seed merchant ("The Grand Admiralty Guild").
* **Reason:** Preserves the visual continuity and creative lore already established in the codebase while enabling database-backed CRUD.
* **Alternatives Considered:** Deleting existing hardcoded items and requiring manual seller re-entry. Rejected as destructive to the user experience.
* **Consequences:** The seed script must be executable safely at any point without producing duplicate product records.

---

### Decision 008: Historical Order Snapshots & Doubloon Payment Status Abstraction
* **Date:** 2026-10-11
* **Status:** Accepted
* **Context:** In a marketplace, products and prices change over time. Old customer orders and merchant earnings must not be corrupted when a product name, price, or image is updated. Additionally, Pirate-Civ transacts in native Doubloons rather than third-party fiat gateways.
* **Decision:** Store historical snapshot values (`name`, `price`, `lineTotal`, `seller`, `image`) directly within each embedded order item, rather than computing line totals or fetching product details from the live `Product` document. Define `paymentStatus` as a controlled enum (`['pending', 'paid', 'failed', 'refunded']`, default `'pending'`) representing native Doubloon transaction state without external gateway dependencies.
* **Reason:** Guarantees historical transaction immutability. If a seller raises a product price from 500 to 900 Doubloons, past orders remain anchored at 500 Doubloons. Decouples order tracking from external gateway SDKs.
* **Alternatives Considered:** Dynamic lookup of Product document by ID for order totals. Rejected because past transactions would retroactively change value when product prices or titles are edited.
* **Consequences:** Order creation must capture snapshots from current Product state. Product stock remains invariant during Order model operations until Phase 5 atomic checkout.

---

### Decision 009: Pre-Phase 3 Codebase Hardening & Centralized Error/Lifecycle Boundaries
* **Date:** 2026-10-11
* **Status:** Accepted
* **Context:** Prior to launching Phase 3 (Marketplace & Buyer Experience), the codebase required verification that all layers are resilient against connection drops, unhandled exceptions, malformed requests, and duplicate database connections.
* **Decision:** Implement singleton protection in `config/db.js` with lifecycle event logging and graceful shutdown (`disconnectDB()`), register `express.json()` for incoming JSON payloads, add an application-level 404 catch-all handler, and implement centralized Express error-handling middleware (`(err, req, res, next)`) that logs server-side while rendering a themed error view without exposing internal stack traces or paths to clients.
* **Reason:** Eliminates Technical Debt #2, prevents process leakage, guarantees that unexpected server errors do not expose sensitive infrastructure details, and hardens the application before introducing complex marketplace features.
* **Alternatives Considered:** Ad-hoc try/catch in individual controllers without a global safety net. Rejected as prone to accidental omissions and unhandled promise rejections.
* **Consequences:** All controllers can safely pass unrecoverable errors to `next(err)` knowing that the centralized handler will render safe, styled client responses.

---

### Decision 010: Demo-Compatible Non-Transactional Order Generation Flow (Phase 5.3)
* **Date:** 2026-10-16
* **Status:** Accepted (Demo Architecture)
* **Context:** Milestone 5.3 requires creating Order documents, decrementing Product stock, and clearing the buyer's persistent Cart upon checkout confirmation. The local development environment operates on a standalone MongoDB deployment without replica set configuration, which does not support multi-document ACID transactions.
* **Decision:** Implement a strictly ordered, defensive, non-transactional order generation workflow:
  1. **STEP A (Final Validation):** Verify live cart, re-read live product stock, calculate authoritative pricing, and validate delivery coordinates. If any check fails, perform zero writes and return HTTP 400.
  2. **STEP B (Create Order):** Insert Order with `status: 'pending'`, `buyer: req.user._id`, and embedded historical snapshots.
  3. **STEP C (Conditional Stock Decrements):** Update each product's stock using conditional query `{ _id, stock: { $gte: quantity }, isAvailable: true }` to guarantee stock never drops below zero.
  4. **STEP D (Clear Cart):** Reset buyer's cart items array only after steps B and C succeed.
  5. Do NOT fake transactions, do NOT call `startTransaction()`, and do NOT claim ACID atomicity.
* **Reason:** Reconfiguring Windows MongoDB into a replica set creates fragile local environment dependencies for a demo project. The ordered write sequence provides strong practical consistency without introducing pseudo-transaction abstractions.
* **Alternatives Considered:**
  1. Reconfiguring Windows MongoDB into a replica set. Rejected as unnecessary complexity for a college demonstration.
  2. Pseudo-transaction wrapper that pretends to provide rollbacks. Rejected as deceptive architecture.
* **Consequences:** A theoretical failure window exists between steps if an unhandled crash occurs. Production deployment must use a MongoDB replica set or sharded cluster with native ACID transactions for true atomic order generation.

---

### Decision 011: Buyer Order History Architecture & Nautical Tracking Timeline Visualizer (Phase 5.4)
* **Date:** 2026-10-17
* **Status:** Accepted
* **Context:** Milestone 5.4 requires a buyer-facing order history index (`/orders`) and a visual nautical tracking timeline on individual order manifests (`/orders/:orderId`). Access must remain strictly isolated to the authenticated buyer, and the visual state machine must handle both normal progression and terminal cancellation states.
* **Decision:**
  1. Implement `renderBuyerOrders` at `GET /orders` guarded strictly with `[authMiddleware, requireBuyer]`. Derive customer identity solely from `req.user._id` (client-spoofed buyer IDs in query/body/headers are strictly ignored).
  2. Reuse the existing single query `Order.findByBuyer(req.user._id)` leveraging the compound index `{ buyer: 1, createdAt: -1 }` to return orders sorted newest first with zero N+1 database queries.
  3. Enforce strict 404 security handling: if another user attempts to open `/orders/:orderId`, return HTTP 404 with zero order metadata leaked (never reveal order existence or ownership).
  4. Define canonical tracking stages (`pending` ➔ `confirmed` ➔ `processing` ➔ `shipped` ➔ `delivered`) in controller configuration, mapping each to completed, current (with radiant pulsing glow), and upcoming states.
  5. Dedicated cancellation terminal visualizer: when `order.status === 'cancelled'`, suppress active pipeline progression and render a clear terminal cancellation banner (`#cancelledBanner`).
  6. Display item details strictly from embedded snapshots (`order.items`) to guarantee historical order immutability.
* **Reason:** Maintains strict security boundaries, prevents cross-user order snooping, ensures smooth responsive UX across desktop and mobile without unnecessary client-side JavaScript or external tracking APIs, and respects established state machine rules.
* **Alternatives Considered:**
  1. Storing tracking events as separate documents in a new `Tracking` collection. Rejected as over-engineered for the current milestone (Ponytail principle / YAGNI).
  2. Introducing client-side WebSockets for live status updates. Rejected as premature scope expansion (expressly on the NO-GO list).
* **Consequences:** Order tracking state is driven directly by authoritative Order document status, ensuring complete consistency across the Seller Order Console and Buyer Voyage Ledger.

---

### Decision 012: Multi-Seller Order Fulfillment Architecture (AUD-001 Remediation)
* **Date:** 2026-10-17
* **Status:** Accepted
* **Context:** In Pirate-Civ, a single checkout Order can contain cargo items originating from multiple distinct merchants. Prior to AUD-001 remediation, `Order` possessed only one global `status` at the document root. When Seller A advanced their cargo status from `pending` to `confirmed` or `shipped`, it mutated the entire Order document, incorrectly altering the fulfillment state for Seller B and Seller C.
* **Decision:**
  1. Embed seller fulfillment states directly within the existing `Order` document as an array: `fulfillments: [{ seller: ObjectId, status: String, updatedAt: Date }]`.
  2. Maintain historical item snapshots exclusively inside authoritative `Order.items`; do NOT duplicate product data into the fulfillment records.
  3. Automatically initialize exactly one fulfillment record per distinct seller during checkout order creation and schema validation, defaulting to `pending`.
  4. Root `Order.status` becomes a deterministically computed aggregate status via `Order.recalculateAggregateStatus()`:
     - Uniform states: when all fulfillments share the same status, root `status` matches that state (`pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`).
     - Mixed states: when seller fulfillments are at different stages, root `status` becomes `partially_fulfilled`.
     - Invariance: root status never falsely claims `delivered` until every seller fulfillment reaches `delivered`.
  5. Seller lifecycle actions (`POST /seller/orders/:orderId/status`) update strictly `req.user._id`'s fulfillment subdocument, recalculating aggregate `order.status` and leaving all co-chartered sellers untouched.
  6. MongoDB transaction architecture (AUD-002) is intentionally kept outside this remediation to maintain focused milestone boundaries.
* **Reason:**
  - Embedding fulfills the exact requirements without introducing the complexity, query joins, or orphan document risks of an unnecessary separate `Fulfillments` collection (Ponytail principle / YAGNI).
  - Keeps historical item records immutable and normalized.
  - Guarantees server-enforced merchant isolation and accurate multi-merchant buyer tracking.
* **Alternatives Considered:**
  1. Separate `Fulfillment` collection with multi-document references. Rejected as over-engineered; requires multi-collection joins and introduces synchronization overhead without tangible benefit for the current scale.
  2. Per-item status field (`items[i].status`). Rejected in favor of per-seller fulfillment records because merchant operations naturally happen at the merchant manifest level rather than requiring sellers to click 10 buttons for 10 line items.
* **Consequences:** Seller order views and buyer tracking seamlessly reflect individual merchant lifecycle progress, while legacy orders without fulfillments retain full backward compatibility without crashing.
