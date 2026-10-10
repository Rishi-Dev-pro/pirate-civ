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
* **Strict Ownership Guard:** Backend controller validates `product.seller.toString() === req.user._id.toString()`. If a merchant attempts to edit another seller's item, Express rejects the request with HTTP 403 Forbidden.

### 4.3 Product Deletion (`/seller/products/:id/delete`)
* Soft deletion (setting `isAvailable: false`) or hard deletion if no pending orders exist.
* Ownership is strictly verified prior to deletion.

---

## 5. Merchant Order Management & Fulfillment (`/seller/orders`)

When a buyer completes checkout, orders referencing the seller's products appear in the seller's fulfillment queue:

1. **Incoming Order Queue:** Displays Order ID, destination port coordinates, buyer name, item line items, and current status.
2. **Status Transition Engine:**
   - Merchants advance orders through permitted sequential transitions:
     $$\text{pending} \longrightarrow \text{processing} \longrightarrow \text{shipped} \longrightarrow \text{delivered}$$
   - Can flag cancelled if inventory cannot be sourced.
3. **Multi-Seller Isolation:**
   - In orders containing items from multiple sellers, each seller can only view and update their own line-item fulfillment status.

---

## 6. Strict Merchant Security Rules

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
