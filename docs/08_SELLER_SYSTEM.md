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

## 3. The Seller Command Deck (`/seller/dashboard`)

The seller dashboard is a high-contrast nautical command center designed for rapid operational management:

### 3.1 Metric Telemetry Cards
* **Total Revenue:** Accumulated earnings in Doubloons (🪙).
* **Active Vault Listings:** Total count of live products in catalog.
* **Pending Dispatches:** Count of unfulfilled orders awaiting shipment.
* **Depleted Stocks:** Instant warning banner for items with stock ≤ 3 units.

### 3.2 Quick Actions Bar
* ➕ **Forge New Cargo (Add Product):** Direct link to creation form.
* 📦 **Review Ship Manifests (Orders):** Jump to fulfillment queue.
* ⚓ **Update Harbor Profile:** Modify store banner and description.

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

## 6. Public Seller Discovery (`/seller/:sellerId`) [MILESTONE 3.3 COMPLETE]

A buyer-facing, public discovery layer allowing buyers on product detail sheets to discover the merchant behind the product:

1. **Discovery Entry Points:**
   - On `/product/:productId`, the merchant card features a clickable merchant avatar (`.seller-avatar-link`), store name (`.seller-name-link`), and dedicated `📜 DISCOVER MERCHANT` action button (`.btn-discover-seller`).
2. **Public Identity Rendered:**
   - Merchant store name / alias (`storeName || name`).
   - Chartered Guild Merchant badge (`⚓ CHARTERED GUILD MERCHANT`).
   - Home harbor affiliation (`homeIsland`).
   - Merchant bio chronicle (`bio`).
   - Live catalog count (`totalListings`).
   - Sample chartered relics preview (up to 4 products).
3. **Data Security & Privacy:**
   - Uses the unified `User` model with `role: 'seller'`.
   - Never exposes sensitive credentials (`password`, `authSecretHash`, `googleId`).
   - Non-seller users, malformed ObjectIds, or non-existent IDs return clean 404 responses.
4. **Scope Boundary:**
   - Features a notice banner stating that full storefront catalog filtering, custom banners, and reviews dock in Milestone 3.4. Milestone 3.4 was NOT implemented in 3.3.

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
