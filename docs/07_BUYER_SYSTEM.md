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
* **Dynamic Product Integration (Milestone 3.1 COMPLETE):**
  - Products displayed on each island are loaded directly and exclusively from MongoDB (`Product.find({ island: normalizedKey, isAvailable: true }).sort({ createdAt: 1 }).lean()`).
  - Compound indexed retrieval on `{ island: 1, isAvailable: 1 }` guarantees sub-millisecond query performance.
  - Unavailable products (`isAvailable: false`) are strictly omitted from public island listings.
  - Each product card displays product title, Doubloons price badge (`🪙 XX Doubloons`), star rating, real MongoDB `_id` in `data-id` attributes, and direct Add to Cart buttons.
  - Barren/empty catalogs render a dedicated nautical empty state (`.store-empty-state`) rather than blank spaces or broken templates.
  - Hardcoded island catalog dependencies have been removed from runtime controllers; MongoDB is the sole source of truth.

---

## 5. Reusable Product Details Page (`/product/:productId`) [Milestone 3.2 COMPLETE]

Rather than fragmented templates, all marketplace items share a single, rich, responsive detail template (`views/product-detail.ejs`) served by `controller/products.js::renderProductDetail`:

```
┌────────────────────────────────────────────────────────────────────────┐
│ [← Sea Chart > Astrolabe Atoll > Gilded Astrolabe]    [Flagship Cart]  │
├────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────┐   ASTROLABE ATOLL • ARCHIPELAGO MANIFEST  │
│ │                          │   ★ ★ ★ ★ ★ (Archipelago Certified)       │
│ │                          │                                           │
│ │   [Visual Artifact Glow] │   GILDED CELESTIAL ASTROLABE              │
│ │   [High-Res Relic Image] │   Trade Valuation: 🪙 85 Doubloons        │
│ │                          │                                           │
│ └──────────────────────────┘   [⚓ In Vaults (15 units available)]     │
│                                                                        │
│ Item Chronicle & Provenance:   "Forged in Seville, calibrated for... " │
│                                                                        │
│ Chartered Merchant: Grand Admiralty Cartographers (Home Port: Astrolabe)
│                                                                        │
│ [ 🛒 STOW IN CARGO HOLD ]      [ ♡ ]       [ ⚓ Back to Island ]        │
└────────────────────────────────────────────────────────────────────────┘
```

**Attributes Dynamically Rendered:**
1. **Visual Artifact Box:** Glowing halo backdrop with high-res PNG relic image and fallback on broken images.
2. **Provenance Badges:** Island origin badge (`🏝️ Astrolabe Atoll`), category pill, and guild badge.
3. **Valuation:** Price formatted cleanly in Doubloons (`🪙 XX Doubloons`).
4. **Item Chronicle:** Full safe-escaped description from MongoDB.
5. **Stock Telemetry:** Dynamic stock indicator (`⚓ In Vaults` for >5, `⚠️ Low Reserve` for 1-5, `🚫 Barren` for 0).
6. **Merchant Presentation:** Populated seller store name/name, avatar, and home port with zero credential exposure (`password`, `authSecretHash`, `googleId` omitted).
7. **Interactive Cargo Actions:** "Stow in Cargo Hold" (`.btn-add-cart`) button with real MongoDB `_id`, Wishlist toggle, and seamless Cargo Hold drawer integration.
8. **Breadcrumb Navigation:** Full hierarchical links (`Sea Chart` ➔ `[Origin Island]` ➔ `[Product Name]`) and Back to Island button.
9. **Safe Error Handling:** Nonexistent products, malformed IDs, and unavailable products (`isAvailable: false`) return safe 404 responses with 0 stack trace leakage.

---

## 6. Explore Sellers & Public Seller Profiles
 
### 6.1 Explorer → Seller Discovery (`/seller/:sellerId`) [MILESTONE 3.3 COMPLETE]
* **Discovery Flow:** Buyer navigates from `Island ➔ Product Detail ➔ Merchant Discovery`.
* **Entry Points on Product Detail:**
  - Clickable Merchant Avatar (`.seller-avatar-link`)
  - Clickable Merchant Store Name (`.seller-name-link`)
  - Prominent Action Button: `📜 DISCOVER MERCHANT` (`.btn-discover-seller`)
* **Reusable Discovery View (`views/seller-discovery.ejs`):**
  - Powered by `controller/sellers.js::renderSellerDiscovery` at `GET /seller/:sellerId`.
  - Requires authenticated session (`authMiddleware`).
  - Indexed lookup against MongoDB `User` by `_id`, strictly enforcing `{ role: 'seller' }`.
  - Exposes only sanitized public credentials: `name`, `storeName`, `avatar`, `homeIsland`, `bio`, and active trade listing count.
  - Queries active wares chartered by the merchant, rendering a sample preview grid of up to 4 items.
  - **Security Guarantee:** Strictly omits `password`, `authSecretHash`, and `googleId`.
  - **Error Guards:** Malformed ObjectIds, non-existent users, and non-seller users return clean 404 responses without CastError or stack trace leakage.
  - **Milestone 3.4 Scope Banner:** Features a prominent notice banner indicating that full storefront banners, comprehensive product catalogs, and review systems dock in Milestone 3.4.

### 6.2 Public Seller Profile & Full Storefront (`/seller/:sellerId`) [MILESTONE 3.4 COMPLETE]
* **Upgraded Storefront Architecture:** Upgraded discovery view into the full reusable Public Seller Profile & Storefront (`views/seller-discovery.ejs`) powered by `controller/sellers.js::renderSellerStorefront`.
* **Complete Active Catalog Querying:** Queries MongoDB using the `{ seller: 1, createdAt: -1 }` compound index:
  `Product.find({ seller: seller._id, isAvailable: true }).sort({ createdAt: -1 })`.
* **Storefront Capabilities:**
  - **Merchant Identity Hero:** Large avatar with fallback, chartered merchant badge, store title, captain personal alias, and Admiralty Guild verification.
  - **Home Island Navigation:** Badged home harbor linking directly to canonical island route (`/island/:homeIsland`).
  - **Merchant Log:** Detailed narrative bio and trading lore.
  - **Full Catalog Grid:** Renders all active items listed by the merchant with high-res product art, title, Doubloons valuation (`🪙 XX Doubloons`), star rating, stock telemetry badge (`In Vaults`, `Low Reserve`, `Barren`), and direct links to the Reusable Product Details sheet (`/product/:id`).
  - **Cargo Integration:** Every product card includes a "Stow in Cargo" action button (`.btn-add-cart`) wired into the slide-out Cargo Hold drawer (`#storeCartDrawer`).
  - **Sensible Empty State:** Valid merchants with 0 available wares render an atmospheric themed empty state (`.seller-empty-state`) with navigation back to the Sea Chart.
  - **Catalog Isolation:** Guarantees that only products belonging to the specified merchant appear, and unavailable products (`isAvailable: false`) are strictly omitted.
  - **Security Assurance:** Strictly excludes `password`, `authSecretHash`, `googleId`. Safe 404 on malformed/nonexistent/non-seller IDs without `CastError` leaks.

### 6.3 Explore Sellers Directory (`/sellers`) [PLANNED FUTURE]
* Refactors the legacy `/users` page into a true **Merchant Directory** with island filtration and captain cards.

---

## 7. Cargo Manifest (Cart), Checkout & Order Tracking

1. **Persistent Cart (Milestone 3.5 COMPLETE):**
   - Backed by MongoDB `Cart` collection (`models/cart.js`) and persistent controller (`controller/cart.js`).
   - Synchronized across browser sessions and devices for authenticated users via MongoDB persistence.
   - For unauthenticated explorers, guest cart is maintained in session storage and seamlessly migrated/merged into MongoDB upon login via `Cart.mergeSessionCart`.
   - Dedicated SSR Cargo Hold Manifest page at `GET /cart` (`views/cart.ejs`) with itemized table, line totals, port fee exemption, grand total, empty state, and action buttons.
   - RESTful endpoints (`GET /cart`, `POST /cart/add`, `POST /cart/update`, `POST /cart/remove`, `POST /cart/clear`) wrapped with `optionalAuth`.
   - Client engine (`public/js/island-store.js`) dynamically syncs the topbar doubloon/hold badge, slide-out drawer (`#storeCartDrawer`), and manifest view with server responses.
   - Supports multi-island product additions, quantity increments/decrements, item removal, and full hold discharge ("Jettison All Cargo").
   - Authoritative server-side pricing directly from `Product` collection; client-side price manipulation is strictly prevented.
   - Zero stock deduction and zero orders created (Phase 5 boundary strictly respected).
2. **Checkout (`/checkout`) [Phase 3.6 / Phase 5]:**
   - Review itemized cargo manifest, subtotal, and grand total in Doubloons.
   - Input delivery coordinates: Destination Port (`portName`), Island coordinates, and Courier Notes (`recipientNotes`).
   - Submit order: creates persistent record in `Order` collection (`models/order.js`), deducts product stock, and clears cart (Phase 5).
3. **Order Tracking (`/orders` & `/orders/:id`):**
   - Backed by MongoDB `Order` collection (`models/order.js`, foundation implemented in Milestone 2.4).
   - Shows active and past voyages queried via `Order.findByBuyer(buyerId)`.
   - Immutable snapshot pricing guarantees that past orders maintain historical pricing and item names even if merchants modify products later.
   - Visual voyage map tracking status transitions: `pending` ➔ `confirmed` ➔ `processing` ➔ `shipped` ➔ `delivered` (or `cancelled`).

