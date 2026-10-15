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
* ➕ **Forge New Cargo (Phase 4.3):** Tile indicating listing creation capability docking in Phase 4.3.
* ⚖️ **Vault Inventory (Phase 4.3):** Tile indicating valuation, stock, and availability editing in Phase 4.3.
* 📦 **Dispatch Manifests (Phase 4.4):** Tile indicating order fulfillment queue docking in Phase 4.4.

### 3.5 Corner Cases & Invariants
* **Empty Vaults:** When `totalProductCount === 0`, an atmospheric "Vault Currently Barren" notice is displayed.
* **Missing Fields:** Sellers lacking storeName, bio, or homeIsland render with graceful defaults without crashing.
* **Stock & Order Immutability:** Accessing the dashboard never alters product stock or creates orders.

---

## 4. Product Catalog Management (CRUD)

Sellers have complete lifecycle control over the products they list.

### 4.1 Product Creation Flow (`/seller/products/new`)
1. **Island Selection:** Dropdown strictly limited to the **6 canonical islands**:
   - Astrolabe Atoll
   - Chronos Cay
   - Kraken's Vault
   - Cutlass Cove
   - Velvet Isle
   - Booty Cay
2. **Category / Trade Branch Selection:** Selection constrained to the **3 major trading branches/categories**:
   - Ancient Relics & Instruments
   - Corsair Apparel & Modern Gear
   - Provisions, Treasury & Elixirs
3. **Product Information Fields:**
   - **Name:** Clear, evocative title (e.g., *"Gilded Seville Sextant"*).
   - **Doubloons Price (🪙):** Positive numeric value.
   - **Available Stock:** Initial physical inventory count.
   - **Description / Lore:** Item background, craftsmanship, and specifications.
   - **Image Selection:** File path or upload of product imagery.
4. **Submission:** Product is validated, assigned `seller: req.user._id`, and written to MongoDB. It becomes immediately discoverable on the respective island page.

### 4.2 Product Updating (`/seller/products/:id/edit`)
* Merchants can modify price, inventory stock, description, image, or availability flag (`isAvailable: true/false`).
* **Strict Ownership Guard:** Backend controller validates ownership via `product.isOwnedBy(req.user)` (implemented in Milestone 2.2) or `product.seller.equals(req.user._id)`. If a merchant attempts to edit another seller's item, Express rejects the request with HTTP 403 Forbidden.
* *(Note: Seller CRUD routes and dashboard UI belong to Phase 4; Milestone 2.2 establishes the underlying database ownership relationship and query foundation).*

### 4.3 Product Deletion (`/seller/products/:id/delete`)
* Soft deletion (setting `isAvailable: false`) or hard deletion if no pending orders exist.
* Ownership is strictly verified via `product.isOwnedBy(req.user)` prior to deletion.

---

## 5. Merchant Order Management & Fulfillment (`/seller/orders`)

When a buyer completes checkout, orders referencing the seller's products appear in the seller's fulfillment queue (backed by `models/order.js`, foundation implemented in Milestone 2.4):

1. **Incoming Order Queue:**
   - Displays Order ID, destination port coordinates, buyer name, item line items, and current status.
   - Queried efficiently via static helper `Order.findBySeller(sellerId)`, supported by compound index `{ "items.seller": 1, status: 1 }`.
2. **Status Transition Engine:**
   - Orders follow a strictly controlled lifecycle state machine:
     $$\text{pending} \longrightarrow \text{confirmed} \longrightarrow \text{processing} \longrightarrow \text{shipped} \longrightarrow \text{delivered}$$
   - Cancellation transitions are permitted from `pending`, `confirmed`, and `processing`.
   - Transitions are validated and applied via model helpers `order.canTransitionTo(status)` and `order.transitionTo(status)`.
3. **Multi-Seller Isolation:**
   - In orders containing items from multiple sellers, line items maintain individual `seller: ObjectId (ref: 'User')` links.
   - Merchant queries isolate matching orders, and population strictly omits merchant and customer authentication secrets (`password`, `authSecretHash`).


---

## 6. Public Seller Profile & Reusable Storefront (`/seller/:sellerId`) [MILESTONE 3.4 COMPLETE]

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
   - *Note:* Seller management, product CRUD, and seller order fulfillment remain strictly deferred to Phase 4.

---

## 7. Strict Merchant Security Rules

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
└────────────────────────────────────────────────────────────────────────┘
```
