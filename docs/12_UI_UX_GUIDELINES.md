# 🏴‍☠️ 12_UI_UX_GUIDELINES — Visual Identity & Interface Guidelines

This document defines the design language, aesthetic guidelines, typography, color tokens, and usability standards of Pirate-Civ.

---

## 1. Visual Identity & Aesthetic Principles

Pirate-Civ marries **17th-century cartographic romance** with modern interface polish. Its aesthetic revolves around:
* **Burnt Parchment & Weathered Leather:** Textured backgrounds, aged map cartography, and compass grids.
* **Warm Brass & Gold Filigree:** Polished metallic accents, ornamental card borders, and engraved corner flourishes.
* **Atmospheric Embers & Smoke:** Ambient floating particles, smoke drifts, and dynamic candlelight glows.
* **Doubloon Coinage:** Golden currency iconography (🪙) integrated cleanly into all price tags.
* **Island Atmospheres:** Distinct regional identities (Astrolabe's celestial blue, Chronos' temporal fog, Kraken's deep abyss, Cutlass' forged steel, Velvet's serene silk, Booty's skull cove glow).

```
┌────────────────────────────────────────────────────────────────────────┐
│ USABILITY DIRECTIVE:                                                   │
│ Never sacrifice usability for visual effects.                          │
│ Embers, smoke, and lantern cursor effects must NEVER lag page          │
│ scrolling, obscure critical checkout buttons, or break mobile layouts. │
│ Visual flourishes must elevate the experience, not obstruct it.        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Design Tokens & Color Palette

```css
:root {
    /* Primary Deep Nautical Backdrops */
    --color-abyss-black: #080b10;
    --color-ocean-dark: #0d131a;
    --color-deck-wood: #151a22;
    --color-parchment-dark: #1e1915;

    /* Metallic & Brass Accents */
    --color-brass-gold: #c69f58;
    --color-brass-bright: #e5be75;
    --color-gold-coin: #ffd700;
    --color-bronze-trim: #8c6a38;

    /* Parchment Text & Neutral Shades */
    --color-parchment-light: #f5eedc;
    --color-parchment-muted: #bfa98b;
    --color-ink-faint: rgba(245, 238, 220, 0.65);

    /* Atmospheric & Danger Tones */
    --color-fire-ember: #ff5522;
    --color-lantern-glow: rgba(255, 170, 50, 0.18);
    --color-danger-crimson: #c82333;
    --color-success-emerald: #28a745;

    /* Border Radii & Shadows */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 14px;
    --shadow-brass-glow: 0 0 15px rgba(198, 159, 88, 0.35);
    --shadow-deck: 0 10px 30px rgba(0, 0, 0, 0.6);
}
```

---

## 3. Typography Hierarchy

* **Display & Heading Font:** `Cinzel`, serif (Weights: 600, 700, 800)  
  *Used for island titles, imperial badges, product names, and navigation anchors.*
* **Body & Data Font:** `Inter`, sans-serif (Weights: 300, 400, 500, 600)  
  *Used for lore descriptions, prices, specs, telemetry, form inputs, and buttons.*

```css
h1, h2, h3, .nav-logo, .chart-badge {
    font-family: 'Cinzel', serif;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

body, p, input, select, button, .price-tag {
    font-family: 'Inter', sans-serif;
}
```

---

## 4. Universal Page Requirements

Every page across the application must fulfill five UX states:

### 4.1 Loading State
* Asynchronous actions (e.g. adding to cart, updating stock) must display a subtle rotating brass compass loader or disable buttons with a spinning indicator to prevent duplicate clicks.

### 4.2 Error State
* Failed requests or invalid forms must render styled parchment alert boxes (`.alert-pirate`) rather than raw browser error text (`res.send(...)`).

### 4.3 Empty State
* If an island has no products, or the cart is empty, or a seller has zero orders, present an illustrated empty state:
  - Empty Cart: *"Your cargo hold is empty, Captain. Set sail for an island to claim loot."* + CTA button to Sea Chart.
  - No Orders: *"No voyages logged yet."*

### 4.4 Responsive Design
* Mobile breakpoints (`≤ 768px`) must collapse navigation into a slide-over nautical menu.
* Island product cards must switch from 3 columns to 1–2 columns without horizontal overflow.
* The sea chart mind map must allow touch panning or switch to an accessible card grid.

### 4.5 Accessible Controls
* High contrast between text (`--color-parchment-light`) and card backgrounds (`--color-deck-wood`).
* Accessible `alt` tags on all product and decor images.
* Clear visual `:focus` rings on form inputs and interactive buttons.

---

## 5. Reusable Components vs. Themed Island Atmospheres

* **Unique Themed Atmosphere:** The 6 island pages retain their individual regional background textures, ambient glows, and badge accents to preserve the fantasy world.
* **Shared Reusable Components:**
  - `views/product_detail.ejs` — Single shared template for all products.
  - `views/partials/header.ejs` — Shared universal navigation with role-aware links.
  - `views/partials/footer.ejs` — Shared Admiralty footer.
  - Cart Drawer & Order Badges — Shared global styling.

---

## 6. Pirate-Civ Entry Map Gateway Experience (`views/gateway.ejs`)

* **Aesthetic Direction:** Cinematic pirate title-screen composition combining 17th-century cartographic romance with immersive high-seas atmosphere.
* **Layered Asset Architecture:**
  - **Foundation Background:** Full-screen pirate harbor and ocean scene (`/images/gateway/gateway-background.jpg`) with radial vignette and cinematic cropping (`object-fit: cover`).
  - **Torn Map Portals:** Authentic transparent torn-parchment assets (`/images/gateway/torn-map-left.png` and `torn-map-right.png`) framing the left and right interactive regions.
  - **Center Sunset Window:** The transparent center space between the torn maps reveals the sunset harbor, sailing galleons, and sea horizon.
  - **Hero Branding:** Centered transparent Pirate-Civ skull, cutlasses, and ship wheel logo (`/images/gateway/pirate-civ-logo.png`) anchored above the sunset horizon.
* **Dual Interactive Regions:**
  - **🏴‍☠️ Merchant / Armator (`#cardArmator` / `.portal-merchant`):** Left map side leading to `/seller/dashboard` with gold chest badge, "MERCHANT" header, "SAIL TO SELL" subtext, and `#btnEnterCommandDeck` destination hint.
  - **⚓ Buyer / Customer (`#cardExplorer` / `.portal-buyer`):** Right map side leading to `/home` with gold cargo cart badge, "BUYER" header, "EXPLORE TO BUY" subtext, and `#btnEnterSeaChart` destination hint.
* **Glow & Interaction System (`public/css/gateway.css`, `public/js/gateway.js`):**
  - **Warm Brass/Fire Glow:** Layered CSS `drop-shadow` filters hugging the transparent ragged edges of the torn parchment.
  - **Pointer Events & Drag:** Pointer movement across the stage dynamically highlights the portal directly beneath coordinates using `document.elementFromPoint()`. Moving into the central sunset window automatically clears the highlight.
  - **Tactile Feedback:** Subtle `scale(1.025)` lift on hover/drag and `scale(0.985)` press response on activation before routing.
  - **Touch & Mobile Safety:** Single touch tap activation avoiding double-clicks, with graceful responsive stacking for smaller screens.
  - **Accessible Keyboard Control:** Full `Tab` navigation order (Merchant ➔ Buyer) with visible gold `:focus-visible` rings and `Enter`/`Space` activation.

---

## 7. Role-Aware Global Navigation Guidelines (`views/partials/header.ejs`)

* **Architecture:** Single unified partial included across all application views (`<%- include("partials/header") %>`), deriving navigation state strictly from authenticated session `user.role` or guest default.
* **Role-Based Navigation Matrix:**
  - **Guest:**
    - Brand Logo: Points to root landing gateway (`/`).
    - Links: The Sea Awaits (`/`), Guild Lore (`/about`), Dispatch (`/contact`), Sign In (`/login`), Join Crew (`/register`).
    - Prohibited: Authenticated-only links (Logout, Cargo Hold, My Voyages, Command Deck, Manage Cargo, Merchant Orders, Merchant Profile) are strictly omitted.
  - **Buyer (`user.role === 'buyer'`):**
    - Brand Logo: Points directly to Sea Chart (`/home`).
    - Links: Sea Chart (`/home`), Cargo Hold (`/cart`, `#navCargoHold`), My Voyages (`/orders`, `#navBuyerOrders`), Explorers (`/users`), Guild Lore (`/about`).
    - Identity: Compact Captain user badge (`<span id="navUserBadge">⚓ Captain [Name]</span>`).
    - Actions: Logout (`/logout`, `#navLogout`).
    - Prohibited: Seller management links (Command Deck, Manage Cargo, Merchant Orders, Merchant Profile) are strictly omitted.
  - **Seller (`user.role === 'seller'`):**
    - Brand Logo: Points directly to Command Deck (`/seller/dashboard`).
    - Links: Command Deck (`/seller/dashboard`, `#navSellerDeck`), Manage Cargo (`/seller/products`, `#navSellerProducts`), Merchant Orders (`/seller/orders`, `#navSellerOrders`), Merchant Profile (`/seller/profile`, `#navSellerProfile`), Sea Chart (`/home`, `#navSeaChart`).
    - Identity: Compact Merchant badge (`<span id="navUserBadge">⚓ [Store/Captain Name]</span>`).
    - Actions: Logout (`/logout`, `#navLogout`).
    - Prohibited: Buyer-specific operational links (`#navBuyerOrders`, Checkout) are strictly omitted.
  - **Admin (`user.role === 'admin'`):**
    - Brand Logo: Points to `/home`.
    - Links: Sea Chart (`/home`), Explorers (`/users`), Guild Lore (`/about`), Dispatch (`/contact`), Admin badge, Logout.
* **Active Destination State:** Indicated through `.active` CSS class and `aria-current="page"` attribute, evaluated via `isNavActive` helper checking `currentPath` and `page_title`.
* **Responsive Mobile Drawer:**
  - On viewports `≤ 900px`, links collapse into an accessible floating menu toggled by `#navToggleBtn` (`aria-expanded`, `aria-controls`).
  - Closes on outside clicks; maintains accessible tap targets (`min-height: 44px`) and prevents horizontal overflow.


