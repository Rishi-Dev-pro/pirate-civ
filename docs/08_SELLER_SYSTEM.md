# 🏴‍☠️ 08_SELLER_SYSTEM — The Seller / Merchant Platform

This document describes the merchant experience, seller command deck, inventory controls, and order fulfillment capabilities for the Merchant/Armator persona in Pirate-Civ.

---

## 1. High-Level Seller Flow

```
[Entry Map Gateway]
         │ (Selects "Seller / Merchant Guild")
         ▼
[Seller Registration / Login]
         │
         ▼
[Seller Command Deck (Dashboard)]
    ├──► [Store Profile Management] (Name, Bio, Home Island)
    │
    ├──► [Product Catalog (CRUD)]
    │         ├──► [Create Listing] (Choose Island + Category + Stock)
    │         ├──► [Edit Listing] (Price, Stock, Description, Image)
    │         └──► [Delete / Unlist Product]
    │
    └──► [Order Fulfillment Queue]
              └──► [Update Status: Processing ➔ Shipped ➔ Delivered]
```

---

## 2. Seller Registration & Store Onboarding

When a merchant registers at `/seller/register`, the system captures both standard authentication credentials and merchant identity details:
1. **Captain / Merchant Name:** Personal alias.
2. **Merchant Storefront Title:** e.g., *"Blackbeard's Armory"*, *"Seville Astronomical Guild"*.
3. **Home Island Affiliation:** Must select one of the **6 official islands** (Astrolabe, Chronos, Kraken Vault, Cutlass Cove, Velvet Isle, Booty Cay) as their primary harbor.
4. **Merchant Bio & Lore:** Short narrative describing their wares and reputation.
5. **Credentials:** Email and password (hashed with bcrypt).

The user is assigned `role: 'seller'` in the unified `User` collection.

---

## 3. The Seller Command Deck (`/seller/dashboard`) [MILESTONE 4.1 COMPLETE]

The seller dashboard is a high-contrast nautical command center designed for operational management and merchant identity:

### 3.1 Access Control & Security
* **Route:** `GET /seller/dashboard` (aliased by `GET /seller` and `GET /seller/portal`).
* **Middleware Guard:** `[authMiddleware, requireSeller]`.
* **RBAC Enforcement:** Permits strictly `User.role === 'seller'`.
  - Buyers receive `HTTP 403 Access denied: insufficient permissions.`
  - Admins receive `HTTP 403 Access denied: insufficient permissions.`
  - Unauthenticated visitors redirect to `/login` (HTTP 302).
* **Identity Source:** Derived strictly from authenticated session `req.user`. Query parameters and body overrides are ignored.
* **Credential Protection:** Passwords, `authSecretHash`, and `googleId` are defensively stripped and never passed to views or responses.

### 3.2 Merchant Hero & Identity Header
* **Avatar & Charter:** Displays custom avatar (or default fallback) with `⚓ CHARTERED GUILD MERCHANT` gold badge.
* **Titles:** Displays Merchant Storefront Title (`seller.storeName`) and Captain Alias (`seller.name`).
* **Harbor Anchor:** Badged link to home island (`/island/:homeIsland`) or fallback to `Archipelago Waters`.
* **Charter Chronicle:** Narrative bio lore section with graceful empty-lore fallback.
* **Public Storefront Link:** Direct action button and navbar links pointing to `/seller/:sellerId`.

### 3.3 Metric Telemetry Cards
* **Active Vault Listings:** Live count of products available in the market (`Product.countDocuments({ seller, isAvailable: true })`).
* **Total Catalog Listings:** Total wares registered in merchant vault (`Product.countDocuments({ seller })`).
* **Registry Port:** Canonical trading harbor name and settlement status.
* **Guild Standing:** Verified Admiralty Guild credentialing status.

### 3.4 Command Operations Deck (Action Tiles)
* 📜 **Public Storefront (ACTIVE):** Direct link to the merchant's live public storefront (`/seller/:sellerId`).
* ➕ **Forge New Cargo (MILESTONE 4.3 ACTIVE):** Direct action tile (`#tileAddProduct`) linking to `/seller/products/new` for listing creation.
* ⚖️ **Vault Products (MILESTONE 4.2 ACTIVE):** Direct management hub (`/seller/products`) for catalog inspection, valuations, stock updates, availability toggling, and product deletion.
* 📦 **Dispatch Manifests (Phase 4.4):** Tile indicating order fulfillment queue docking in Phase 4.4.

### 3.5 Corner Cases & Invariants
* **Empty Vaults:** When `totalProductCount === 0`, an atmospheric "Vault Currently Barren" notice is displayed.
* **Missing Fields:** Sellers lacking storeName, bio, or homeIsland render with graceful defaults without crashing.
* **Stock & Order Immutability:** Accessing the dashboard never alters product stock or creates orders.

---

## 4. Product Catalog Management (CRUD) [MILESTONE 4.3 COMPLETE]

Sellers have complete lifecycle control over their catalog products via `/seller/products`.

### 4.1 Product Catalog Listing (`GET /seller/products`)
* **Guards:** `[authMiddleware, requireSeller]`.
* **Data Scoping:** Queries strictly `Product.find({ seller: req.user._id }).sort({ createdAt: -1 })` utilizing the compound index `{ seller: 1, createdAt: -1 }`.
* **Catalog Telemetry:** Displays total wares, active wares, and unavailable wares.
* **Product Table:** Renders thumbnail image, authoritative name, category, canonical island origin, Doubloons valuation (`🪙`), real-time stock count, and active/hidden status badges.
* **Action Controls:** Provides direct links to edit (`/seller/products/:id/edit`), instant availability toggle button, and safe deletion button with confirmation. Includes quick access to "Forge New Cargo" (`/seller/products/new`).
* **Multi-Seller Isolation:** Strict isolation ensures sellers cannot view, edit, toggle, or delete wares belonging to other merchants.

### 4.2 Product Updating (`GET /seller/products/:id/edit`, `POST /seller/products/:id/edit`)
* **Edit Form:** Accessible at `GET /seller/products/:id/edit`. Prepopulates name, price, description, image path, category dropdown, canonical island dropdown, stock, and availability checkbox.
* **Ownership Verification:** Before updating, validates ObjectId and confirms ownership via `product.isOwnedBy(req.user)`. Rejects non-owners with HTTP 403.
* **Field Validation & Sanitization:**
  - Validates non-empty names and descriptions.
  - Enforces numeric non-negative price (`min: 0`) and stock (`min: 0`, integer).
  - Enforces canonical island enum (`astrolabe`, `chronos`, `kraken_vault`, `cutlass_cove`, `velvet_isle`, `booty_cay`).
  - Enforces canonical category enum (`relics`, `apparel`, `provisions`).
* **Persistence:** Saves changes directly to MongoDB and redirects back to `/seller/products` with a success notice.

### 4.3 Availability Toggle (`POST /seller/products/:id/toggle-availability`)
* Allows instant flipping of `isAvailable` without modifying stock or deleting the record.
* Unavailable products immediately disappear from public island listings and seller public storefronts.
* Products remain fully visible and manageable within the seller's `/seller/products` console.

### 4.4 Safe Product Deletion (`POST /seller/products/:id/delete`)
* Ownership verified via `product.isOwnedBy(req.user)`. Cross-seller attempts return HTTP 403.
* Safely deletes product from `products` collection via `Product.deleteOne`.
* **Historical Order Snapshot Preservation:** Historical orders in `models/order.js` store embedded snapshots (`name`, `price`, `quantity`, `lineTotal`, `seller`, `product`). Product deletion never mutates past order records or alters historic revenues.
* **Cart Resilience:** `controller/cart.js` safely filters out non-existent or deleted products, preventing buyer cart crashes.

### 4.5 Product Creation (`GET /seller/products/new`, `POST /seller/products/new`) [MILESTONE 4.3 COMPLETE]
* **Guards:** Strict `[authMiddleware, requireSeller]`. Unauthenticated users redirect to `/login`; buyers receive HTTP 403; admins receive HTTP 403 unless assigned seller role.
* **Creation Form:** Accessible at `GET /seller/products/new`. Renders Pirate-Civ themed form (`views/seller/product-create.ejs`) with name, price, stock, canonical category, canonical island, image path/URL, description, and availability toggle.
* **Seller Ownership:** Strictly enforced as `req.user._id`. Client-provided seller IDs in query/body are discarded.
* **Field Validation & Sanitization:**
  - `name`: Required, trimmed, max 120 chars.
  - `price`: Required, numeric, non-negative (`>= 0`).
  - `stock`: Integer, non-negative (`>= 0`).
  - `description`: Required, trimmed, max 2000 chars.
  - `island`: Required, strictly member of canonical 6 islands (`astrolabe`, `chronos`, `kraken_vault`, `cutlass_cove`, `velvet_isle`, `booty_cay`).
  - `category`: Required, strictly member of canonical categories (`relics`, `apparel`, `provisions`).
  - `isAvailable`: Strict boolean parsing.
  - `image`: Retains existing Product schema fallback/URL architecture; no unnecessary upload infrastructure.
* **Slug Safety & Collision Handling:**
  - Auto-generated slug checked via `Product.findOne({ slug })` prior to creation.
  - MongoDB unique index `E11000` duplicate slug errors caught gracefully, rendering user-friendly feedback without server crash.
* **Error Resilience & State Retention:**
  - If validation fails, re-renders the creation form with descriptive error banner and retains safe user inputs.
* **Storefront Integration:**
  - Newly created wares with `isAvailable: true` immediately show in seller's management catalog (`/seller/products`), seller's public storefront (`/seller/:sellerId`), canonical island bazaar (`/island/:islandName`), and product detail (`/product/:slug`).
  - Wares created with `isAvailable: false` are cataloged in seller management but excluded from public views.

---

## 5. Merchant Order Management & Fulfillment (`/seller/orders`) [MILESTONE 4.4 COMPLETE]

Merchants have access to a private, authenticated order management console and fulfillment deck (`controller/sellers.js`, `routes/web.js`, backed by `models/order.js`):

### 5.1 Route Guards & Scoping
* **Endpoints:**
  - `GET /seller/orders`: Dispatch Manifests console listing all orders with items chartered under the authenticated seller.
  - `GET /seller/orders/:orderId`: Dedicated manifest detail and fulfillment action deck.
  - `POST /seller/orders/:orderId/status`: Status transition processor (aliased by `POST /seller/orders/:orderId/transition`).
* **Guards:** Strict `[authMiddleware, requireSeller]`. Unauthenticated access redirects to `/login` (302), buyers receive HTTP 403, and admins receive HTTP 403 unless assigned seller role.
* **Seller Identity:** Pinned strictly to `req.user._id`. Client-provided seller IDs in forms or queries are ignored.
* **Server-Side Filtering:** Scoped via `Order.findBySeller(req.user._id)` leveraging compound index `{ "items.seller": 1, status: 1 }`. Never loads all orders into memory.

### 5.2 Multi-Seller Order Rule & Privacy Isolation
* **Multi-Merchant Architecture:** A customer Order in Pirate-Civ may contain wares purchased from multiple independent sellers.
* **Hermetic Item Filtering:** In `/seller/orders` and `/seller/orders/:orderId`, line items are filtered server-side to expose *only* items belonging to `req.user._id`.
* **Zero Leakage:** Other merchants' products, prices, quantities, line totals, and operational notes are completely excluded from the seller's view.
* **Seller-Specific Totals:** Manifest subtotal displays strictly the sum of the authenticated seller's line items.
* **Access Rejection:** An authenticated merchant attempting to view an order that contains no products from their store is rejected with HTTP 403.

### 5.3 Historical Snapshot Integrity
* Line items render historical snapshots (`item.name`, `item.price`, `item.quantity`, `item.lineTotal`, `item.image`) directly from `order.items`.
* Subsequent changes to a `Product` document's name, price, stock, or deletion in the catalog never rewrite or alter existing Order records.

### 5.4 Lifecycle State Machine & Fulfillment Actions
* **Canonical Taxonomies:** Statuses strictly follow `models/order.js`: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`.
* **State Machine Transitions:**
  - `pending` ➔ `confirmed` | `cancelled`
  - `confirmed` ➔ `processing` | `cancelled`
  - `processing` ➔ `shipped` | `cancelled`
  - `shipped` ➔ `delivered`
  - `delivered` / `cancelled`: Terminal states (no transitions permitted).
* **Authoritative Helpers:** State changes are validated via `order.canTransitionTo(status)` and applied via `order.transitionTo(status)`. Invalid transitions are safely rejected with descriptive human-readable errors without altering the database.
* **Order-Level Status Architecture:** In the current architecture, status operates at the Order level rather than per-item. Seller fulfillment actions advance the whole voyage manifest, preserving existing model behavior without introducing premature Phase 5 abstractions.

### 5.5 Manifest Telemetry & Dashboard Integration
* **Telemetry Cards:** Displays live counts of Total Manifests, Pending, Confirmed, Processing, Shipped, Delivered, and Cancelled orders scoped to the seller.
* **Filter Tabs:** Allows quick filtering by status (`?status=...`).
* **Command Deck Tile:** Activated `#tileOrders` ("Dispatch Manifests") and header quick link (`#headerOrdersLink`) on `/seller/dashboard`.

---

## 6. Seller Profile Management (`/seller/profile`) [MILESTONE 4.5 COMPLETE]

Authenticated merchants can customize their sovereign store profile, harbor registry, and charter lore (`controller/sellers.js::renderSellerProfile`, `controller/sellers.js::updateSellerProfile`, `views/seller/profile.ejs`):

### 6.1 Route Guards & Scoping
* **Endpoints:**
  - `GET /seller/profile`: Renders the Captain's Profile & Storefront Customizer form.
  - `POST /seller/profile`: Processes updates to permitted merchant profile fields (aliased by `POST /seller/profile/edit`).
* **Guards:** Strict `[authMiddleware, requireSeller]`. Unauthenticated requests redirect to `/login` (302), and non-sellers (buyers and admins) receive HTTP 403 Forbidden.
* **Seller Ownership:** Derived strictly and exclusively from `req.user._id`. Query parameters, route parameters, and client-submitted body IDs are completely discarded.
* **Model Reuse:** Reuses the unified `User` model (`name`, `storeName`, `homeIsland`, `bio`, `avatar`). No duplicate `Seller`, `Merchant`, `Vendor`, or `SellerProfile` models exist.

### 6.2 Editable Fields & Validation Rules
* **Captain / Merchant Name (`name`):**
  - Required, trimmed, non-empty, max 120 characters.
  - Rejects empty strings, whitespace-only, or oversized names with descriptive human-readable errors.
* **Storefront Title (`storeName`):**
  - Optional, trimmed string, max 120 characters. Blank values preserve `null` convention.
* **Home Island Anchorage (`homeIsland`):**
  - Must select one of the **6 canonical islands**: `astrolabe`, `chronos`, `kraken_vault`, `cutlass_cove`, `velvet_isle`, `booty_cay`. Non-canonical island inputs are strictly rejected.
* **Merchant Bio & Charter Chronicle (`bio`):**
  - Optional, trimmed text, max 2000 characters. Safely escaped in EJS templates to prevent arbitrary HTML or script injection.
* **Avatar (`avatar`):**
  - Local image path (starting with `/`) or absolute URL (`http://` or `https://`), max 500 characters. Default fallback: `/images/avatars/default-pirate.png`. Rejects malicious protocols (`javascript:`, etc.) without introducing unnecessary upload dependencies.

### 6.3 Security Boundary & Field Immutability
* **Excluded Security Fields:** Profile editing NEVER allows modification of `email`, `password`, `authSecretHash`, `googleId`, or `role`.
* **Privilege Escalation Prevention:** Even if a request payload contains `role: 'admin'`, the server strictly updates only explicitly permitted profile fields. Role remains immutable.
* **Cross-Seller Isolation:** A seller can only update their own profile; requests attempting to specify another seller's ID affect strictly the authenticated caller.

### 6.4 Synchronization & Invariants
* **Seller Dashboard Integration:** Activated `#headerProfileLink` in header navigation and `#tileProfile` ("Captain's Profile") action tile on the Command Deck (`views/seller/dashboard.ejs`). Changes to store title, captain alias, bio, and home island reflect immediately on the dashboard.
* **Public Storefront Synchronization:** Updates immediately synchronize to the public storefront (`/seller/:sellerId`) without requiring re-login.
* **Catalog & Order Immutability:** Profile changes affect seller identity and presentation only. Product catalog prices, stock, names, availability, order snapshots, and customer carts remain strictly unchanged.

---

## 7. Public Seller Profile & Reusable Storefront (`/seller/:sellerId`) [MILESTONE 3.4 COMPLETE]

The buyer-facing, public merchant storefront allows buyers to explore a seller's full identity, lore, and chartered product catalog:

1. **Storefront Entry Points:**
   - Navigable from any Product Detail sheet (`views/product-detail.ejs`) via clickable merchant avatar, store name, or dedicated action button.
   - Reusable across any valid merchant account in MongoDB.
2. **Public Identity & Storefront Hero:**
   - Merchant store name / title (`storeName || name`).
   - Captain personal alias / name where distinct from store name.
   - Chartered Guild Merchant badge (`⚓ CHARTERED GUILD MERCHANT`) and Admiralty Guild Verification badge.
   - Home harbor affiliation badge with direct link to canonical island (`/island/:homeIsland`).
   - Merchant bio chronicle and harbor lore.
   - Live catalog count badge (`📦 XX Active Trade Listings`).
3. **Complete Product Catalog:**
   - Backed strictly by MongoDB query: `Product.find({ seller: seller._id, isAvailable: true }).sort({ createdAt: -1 })` utilizing compound index `{ seller: 1, createdAt: -1 }`.
   - Renders product cards with high-res imagery, title, Doubloons price, rating, stock status badge (`In Vaults`, `Low Reserve`, `Barren`), and direct links to `/product/:id`.
   - "Stow in Cargo" buttons (`.btn-add-cart`) integrated with `#storeCartDrawer`.
   - Catalog isolation: only products belonging to this seller are displayed; other sellers' wares and unavailable products (`isAvailable: false`) are strictly excluded.
4. **Themed Empty Storefront State:**
   - If a valid seller has zero available trade wares, renders an atmospheric empty state (`.seller-empty-state`) with "Harbor Vaults Currently Barren" and return navigation.
5. **Security & Boundary:**
   - Strictly omits `password`, `authSecretHash`, `googleId`.
   - Requires `role: "seller"`; buyers, nonexistent IDs, or malformed ObjectIds return clean 404 responses.

---

## 8. Strict Merchant Security Rules

```
┌────────────────────────────────────────────────────────────────────────┐
│ CARDINAL SELLER SECURITY RULES:                                        │
│ 1. Backend Route Guard: Every /seller/* route MUST run both           │
│    authMiddleware AND requireRole('seller').                           │
│ 2. Ownership Verification: Never rely on URL parameters alone.         │
│    Always verify that req.user._id matches product.seller before       │
│    executing any UPDATE or DELETE operation.                           │
│ 3. Isolated Order Views: A merchant may NEVER view line items or       │
│    financial data belonging to another merchant.                       │
│ 4. Whitelisted Profile Updates: Only permitted profile identity        │
│    fields (name, storeName, homeIsland, bio, avatar) may be updated.   │
│    Role, email, password, and auth secrets are strictly IMMUTABLE.     │
└────────────────────────────────────────────────────────────────────────┘
```
