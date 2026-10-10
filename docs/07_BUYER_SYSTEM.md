# 🏴‍☠️ 07_BUYER_SYSTEM — The Buyer / Customer Platform

This document describes the customer journey, buyer interface specifications, and dynamic e-commerce behavior for the Explorer/Buyer persona in Pirate-Civ.

---

## 1. High-Level Buyer Journey

```
[Entry Map Gateway]
         │ (Selects "Customer / Explorer")
         ▼
[Customer Login / Register / Google OAuth]
         │
         ▼
[Customer Home: Sea Chart / Mind Map]
    ├──► [Explore 6 Islands] ──► [Island Trade Post] ──► [Reusable Product Details]
    │                                                            │
    ├──► [Explore Sellers Directory] ──► [Seller Profile] ───────┤
    │                                                            ▼
    └──► [Cargo Cart] ──► [Checkout] ──► [Order Placed] ──► [Track Order]
```

---

## 2. Authentication & Onboarding

1. **Gateway Selection:** The voyager selects **"Customer / Explorer"** on the entry map.
2. **Login / Register Flow:**
   - **Existing User:** Enters email & password (or clicks "Sign in with Google"). Checks optional "Remember Me" wax seal to preserve session across voyages.
   - **New User:** Enters Name, Email, Password, Confirm Password. Account is created with `role: 'buyer'`. Automatically redirected to login (or logged in directly).
3. **Future Extension:** Password reset / recovery via dispatch carrier pigeon (email token).

---

## 3. The Sea Chart Home (`/home`)

The customer lands upon the Imperial Sea Chart ("Terra Incognita"), the visual signature of Pirate-Civ:
* **Visual Identity:** Retains the exact 17th-century cartographic style, nautical grid overlay, drifting embers, animated smoke, brass corner compasses, and interactive lantern lighting following the mouse cursor.
* **Navigation Hierarchy:**
  - **Level 1 (Capital):** Grand Bazaar.
  - **Level 2 (Branches):** Isle of Ancient Relics & Port of Corsair Apparel.
  - **Level 3 (Leaves):** The 6 canonical islands (Astrolabe, Chronos, Kraken Vault, Cutlass Cove, Velvet Isle, Booty Cay).
* **Guiding Rule:** **Do NOT destroy or degrade the existing visual identity of the Sea Chart.** All dynamic product integrations must seamlessly preserve the chart's aesthetic.

---

## 4. Island Exploration (`/island/:islandSlug`)

Customers navigate to any of the 6 canonical leaf islands:
* **Themed Atmosphere:**
  - `astrolabe`: Astronomical instruments & Seville brass sextants.
  - `chronos`: Horology & footwear through temporal mists.
  - `kraken_vault`: Abyssal relics & sunken Spanish doubloons.
  - `cutlass_cove`: Corsair blades & high-tech voyager tools.
  - `velvet_isle`: Teak wood furniture, silk cloaks & island living.
  - `booty_cay`: Fragrances, glowing botanical elixirs & cosmetics.
* **Dynamic Product Integration:**
  - Products displayed on each island must be loaded directly from MongoDB (`Product.find({ island: islandSlug, isAvailable: true })`).
  - Each product card displays product title, Doubloons price badge, stock pill, and direct links to inspect or add to cargo.

---

## 5. Reusable Product Details Page (`/product/:productId`)

Rather than fragmented templates, all marketplace items share a single, rich, responsive detail template (`views/product_detail.ejs`):

```
┌────────────────────────────────────────────────────────────────────────┐
│ [← Back to Island]              [Flagship Cart (3 items)]              │
├────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────┐   ★ ★ ★ ★ ★ (4.9 Rating)                 │
│ │                          │   ASTROLABE ATOLL • INSTRUMENTS           │
│ │                          │                                           │
│ │   [High-Res Imagery]     │   GILDED CELESTIAL ASTROLABE              │
│ │                          │   85 Doubloons (🪙)                        │
│ │                          │                                           │
│ └──────────────────────────┘   "Forged in Seville, calibrated for... " │
│                                                                        │
│ Sold by: Captain Thorne's Guild  [View Merchant Profile]               │
│ Stock Remaining: 14 units in vault                                     │
│                                                                        │
│ Quantity: [-] [ 1 ] [+]        [ 🛒 Add to Cargo Manifest ]            │
└────────────────────────────────────────────────────────────────────────┘
```

**Attributes Dynamically Rendered:**
1. Product Image with zoom / lightbox.
2. Product Name and Subtitle.
3. Price in Doubloons (🪙).
4. Full Lore Description.
5. Island Origin badge & Category tag.
6. Available Stock indicator (with out-of-stock guard).
7. Merchant Information (Store name, captain avatar, link to public seller profile).
8. Interactive Quantity Stepper.
9. Persistent "Add to Cart" CTA.

---

## 6. Explore Sellers & Public Seller Profiles

### 6.1 Explore Sellers (`/sellers`)
* Refactors the legacy `/users` page into a true **Merchant Directory**.
* Displays merchant cards: Storefront Name, Captain Alias, Home Island emblem, and total active listings.
* Search and filter merchants by Home Island.

### 6.2 Public Seller Profile (`/seller/:sellerId`)
* When a customer clicks on a merchant's card or the "Sold by" link on a product sheet, they arrive at the seller's dedicated public storefront (`views/seller_profile.ejs`).
* **Header:** Merchant's custom store banner, bio, home island affiliation, and seller rating.
* **Catalog Grid:** All products currently listed by this merchant in MongoDB.
* Clicking any product transitions directly into the Reusable Product Details page.

---

## 7. Cargo Manifest (Cart), Checkout & Order Tracking

1. **Persistent Cart:**
   - Backed by MongoDB `Cart` collection (`models/cart.js`, implemented in Milestone 2.3).
   - Synchronized across browser sessions and devices for authenticated users.
   - Automatically migrates and merges guest session cart items into MongoDB upon user login (`Cart.mergeSessionCart`).
   - Normalizes duplicate items and enforces positive integer quantities.
   - Future REST endpoints (`/cart/add`, `/cart/remove`) and frontend drawer API wiring belong to Phase 3.
2. **Checkout (`/checkout`):**
   - Review itemized cargo manifest, subtotal, and grand total in Doubloons.
   - Input delivery coordinates: Destination Port, Island, and Courier Notes.
   - Submit order: creates persistent record in `Order` collection, deducts product stock, and clears cart.
3. **Order Tracking (`/orders` & `/orders/:id`):**
   - Shows active and past voyages.
   - Visual voyage map tracking status transitions from `pending` to `delivered`.
