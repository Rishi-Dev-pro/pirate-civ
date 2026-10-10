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
