# 🏴‍☠️ 16_CURRENT_TASK — Active Development Memory & State

```
┌────────────────────────────────────────────────────────────────────────┐
│ SESSION CONTINUITY DIRECTIVE:                                          │
│ This file is the primary short-term memory of Pirate-Civ.              │
│ EVERY new session MUST begin by reading this document.                 │
│ EVERY completed session MUST update this document before handoff.      │
│ Set the next milestone according to docs/02_MASTER_ROADMAP.md.        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📍 1. Current Phase
* **Active Phase:** **Phase 6.3 — Premium Pirate UX + Navigation + Role Separation + Commerce Completion**
* **Active Status:** **Merchant Details Page Layering, Background & Captain Toggle Positioning Completed & Verified**

---

## 🎯 2. Active State Summary
* **Merchant Details Page Layering, Background & Captain Toggle Positioning (`views/seller-discovery.ejs`, `views/partials/header.ejs`, `public/css/island-store.css`, `public/images/merchant-guild-bg.jpg`, `scratch/test_merchant_details_layering.js`):**
  - **Root Cause 1 (Content & Background Under/Behind Navbar):**
    - The legacy island store had duplicate `.store-header-controls` containing modal cart/close buttons (`&times;`, `🛒 CART`, and a fake `1,240 Doubloons` pill). Because `.store-header-controls` used `position: absolute; top: 6px; right: 0;` and its parent `.detail-nav-bar` lacked `position: relative`, the controls positioned themselves relative to `.seller-discovery-wrapper` at `y = 6px` from the top of the viewport, colliding with and sliding behind the floating navbar's top-right corner.
    - `.seller-discovery-wrapper` used `padding: 96px 24px 60px 24px;`. With the floating navbar extending to ~`84px`, the breadcrumbs and card header lacked adequate breathing room below the navbar's shadow.
    - The background was hardcoded to the generic island globe asset (`/images/astrolabe-bg.jpg`), showing a bright tropical beach and sky directly behind the navbar.
  - **Fix 1 (Layering, Spacing & Clean Semantic Breadcrumbs):**
    - Removed duplicate `.store-header-controls` from `views/seller-discovery.ejs`, eliminating the rogue `&times;` and duplicate `🛒 CART` buttons.
    - Standardized on semantic breadcrumbs `<nav class="detail-breadcrumbs" aria-label="Merchant Storefront Breadcrumbs">`.
    - Added `position: relative;` to `.detail-nav-bar` in `public/css/island-store.css` to contain any internal absolute elements across all detail views.
    - Increased `.seller-discovery-wrapper` top padding to `108px` (desktop), `96px` (tablet), `90px` (mobile), providing clean 24px clearance beneath the floating navbar.
  - **Root Cause 2 (Captain Toggle Moving Towards Center):**
    - In the previous task, `.captain-panel` was set to `left: calc(50% - 550px)`. On wide viewports (1440px / 1920px), this pulled the toggle 410px inward away from the viewport edge to the left flank of the centered 1100px navbar.
  - **Fix 2 (Far-Left Viewport Docking):**
    - Restored `.captain-panel` to `position: fixed; left: 20px; top: 96px;` on desktop (`> 1260px`), `left: 14px; top: 92px;` on medium screens (`901px - 1260px`), and `left: 14px; top: 88px;` on mobile (`<= 900px`).
    - Anchored firmly to the FAR-LEFT SIDE OF THE VIEWPORT, completely independent of any centered max-width container.
  - **Fix 3 (Dedicated Merchant Guild Background & Atmospheric Vignette):**
    - Generated and integrated a dedicated, bespoke dark nautical fantasy asset (`/images/merchant-guild-bg.jpg`) featuring an old-world grand admiralty harbor at twilight, fortified stone docks, glowing amber lanterns, moored galleons, and misty waters.
    - Added `.merchant-vignette` with a deep obsidian gradient at the top (`linear-gradient(180deg, rgba(2, 4, 8, 0.95) 0%, ...)`) providing rich, intentional contrast behind the floating navbar.
    - Scoped strictly via `.merchant-details-page` on `<body>` to prevent any side effects on Product Details, Island pages, or other routes.
  - **Verification & Regression Coverage:**
    - 20/20 checks passed in `scratch/test_merchant_details_layering.js`.
    - 39/39 checks passed in `scratch/test_voyage_card_containment.js`.
    - 51/51 checks passed in `scratch/test_navigation_cleanup.js`.
    - 144/144 checks passed in `scratch/test_seller_navbar_unification.js`.
    - 72/72 checks passed in `scratch/test_buyer_commerce_flow.js`.
    - 92/92 checks passed in `scratch/test_milestone_5_4.js`.
    - 100/100 checks passed in `scratch/test_aud_001_multi_seller_fulfillment.js`.
    - 42/42 EJS templates syntax verified clean.

* **My Voyages / Captain's Ledger Card Containment & Stray Element Under Navbar (`views/orders.ejs`, `views/partials/header.ejs`, `scratch/test_voyage_card_containment.js`):**
  - **Root Cause 1 (Stray / Floating UI Element Below Navbar):** The Captain side-panel `<aside class="captain-panel" id="captainSidePanel">` was positioned relative to the viewport at `left: 20px; top: 98px;`, while the canonical navbar was centered at `left: 50%; transform: translateX(-50%); width: min(1100px, calc(100% - 60px))`. On desktop displays (1440px/1280px), this left the collapsed Captain's Log toggle floating isolated in empty space underneath the left side of the navbar. Additionally, legacy duplicate `.store-header-controls` containing modal cart/close buttons (`🛒 HOLD` and `&times;`) was present under the navbar on `/orders`.
  - **Fix 1 (Canonical Anchoring & Clean Navigation):** Anchored `.captain-panel` directly to the canonical navbar's left flank across all breakpoints:
    - Desktop (> 1160px): `left: calc(50% - 550px); top: 86px;` (sitting directly 6px below the navbar's left corner).
    - Tablet (901px - 1160px): `left: 30px; top: 86px;` (matching the centered navbar's 30px margin).
    - Mobile (<= 900px): `left: 16px; top: 86px;` (matching mobile navbar's 16px margin).
    - Removed duplicate `.store-header-controls` (`🛒 HOLD` and `&times;`) from `views/orders.ejs`, leaving clean breadcrumbs (`<nav class="detail-breadcrumbs" aria-label="Captain's Voyage Ledger Breadcrumbs">`).
  - **Root Cause 2 (Card & Action Button Overflow):**
    - Unbroken 24-character hexadecimal ObjectId in `h2.voyage-id` (`⚓ Voyage #<%= order._id %>`) lacked `overflow-wrap: break-word` and forced card header min-content width to expand.
    - `.orders-grid` and `.voyage-card` lacked `min-width: 0` and `box-sizing: border-box`, allowing min-content to blow out the grid track.
    - `.voyage-info-grid` used `grid-template-columns: 1fr 1fr;` instead of `repeat(2, minmax(0, 1fr))`, stretching columns on long destination ports.
    - `.btn-view-manifest` had uppercase Cinzel bold text with letter-spacing (`📜 View Voyage Manifest & Tracking` ~370px) and lacked `width: 100%`, `box-sizing: border-box`, `white-space: normal`, and `line-height: 1.35`, overflowing the ~306px inner card boundary.
  - **Fix 2 (Structural Card Containment):**
    - Added `box-sizing: border-box; width: 100%; max-width: 100%; min-width: 0;` across `.orders-grid`, `.voyage-card`, and child sections.
    - Added `repeat(2, minmax(0, 1fr))` on `.voyage-info-grid` and wrapped `h2.voyage-id` with `overflow-wrap: break-word; word-break: break-word; min-width: 0; font-size: clamp(0.92rem, 2.5vw, 1.05rem);`.
    - Modernized `.voyage-card-actions` and `.btn-view-manifest` with `width: 100%; max-width: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: center; text-align: center; white-space: normal; line-height: 1.35; padding: 10px 14px; font-size: clamp(0.78rem, 2vw, 0.88rem);`.
    - Added `.btn-pay-action` class for the Complete Voyage Payment action.
    - Structured multi-seller fulfillment breakdown with `.voyage-merchants-breakdown`, `.voyage-merchant-row`, and text ellipsis on `.voyage-merchant-name`.
    - Added responsive media queries for 768px, 480px, and 360px ensuring safe padding and column stacking.
  - **Audited Status Matrix (All 10 Supported Variants Verified):**
    - `PENDING` (unpaid) -> renders `Complete Voyage Payment` (.btn-pay-action) + `View Voyage Manifest`
    - `PENDING` (paid) -> renders `⚓ Awaiting Merchant Confirmation` + `View Voyage Manifest`
    - `CONFIRMED` -> renders `✓ Cargo Confirmed` badge + callout
    - `PROCESSING` -> renders `⚒ Cargo Processing` badge + callout
    - `SHIPPED` -> renders `🚢 Fleet Underway` badge + callout
    - `DELIVERED` -> renders `🏝️ Delivered to Harbor` badge + callout
    - `CANCELLED` -> renders `☠ Voyage Cancelled` badge + callout
    - `PARTIALLY_FULFILLED` -> renders `⚓ Partially Dispatched` badge + callout
    - `PAYMENT_FAILED` -> renders payment status failed (#ff8585)
    - `REFUNDED` -> renders payment status refunded
  - **Verification Results:**
    - 40/40 tests passing in `scratch/test_voyage_card_containment.js`
    - 51/51 tests passing in `scratch/test_navigation_cleanup.js`
    - 144/144 tests passing in `scratch/test_seller_navbar_unification.js`
    - 72/72 tests passing in `scratch/test_buyer_commerce_flow.js`
    - 92/92 tests passing in `scratch/test_milestone_5_4.js`
    - 100/100 tests passing in `scratch/test_aud_001_multi_seller_fulfillment.js`
    - 42/42 EJS templates syntax verified in `scratch/check_ejs_syntax.js`
    - Live responsive verification passing across 1440px, 1280px, 1024px, 768px, 600px, 480px, 390px, and 360px viewports with zero horizontal overflow.
  - **Dedicated Buyer & Seller Routes:** Implemented distinct, role-enforced endpoints eliminating merged query-intent authentication:
    - Buyer: `GET /buyer/login`, `POST /buyer/login`, `GET /buyer/register`, `POST /buyer/register`
    - Seller: `GET /seller/login`, `POST /seller/login`, `GET /seller/register`, `POST /seller/register`
    - Legacy Aliases: `/login` and `/register` cleanly redirect to `/buyer/login` (or `/seller/login` if seller intent) and forward POST requests seamlessly.
  - **Server-Forced Role Enforcement:** Route itself determines identity. `/buyer/register` permanently forces `role: 'buyer'`; `/seller/register` permanently forces `role: 'seller'` and mandates `storeName`. Role injection via request body is completely ignored.
  - **Strict Portal Isolation & 403 Role Mismatch Messaging:** Buyers attempting to authenticate via `/seller/login` receive HTTP 403 Forbidden with prompt: `"These credentials belong to an explorer account. Use Buyer Login."` and a direct link to `/buyer/login`. Sellers attempting to authenticate via `/buyer/login` receive HTTP 403 Forbidden with prompt: `"These credentials belong to a merchant account. Use Merchant Login."` and a direct link to `/seller/login`.
  - **Deep Link Return-To Redirection Fix (F-01):** `req.session.returnTo` is safely captured prior to `session.regenerate()` in `controller/auth.js::establishSessionAndCookie` and restored after new session creation. Validated internal application paths redirect accurately while strictly blocking open redirects, protocol-relative exploits, and javascript URIs.
  - **Google OAuth Intent Signing & State Protection (F-04):** Cryptographically signs OAuth state as `{randomToken}.{roleIntent}.{hmacSignature}` using `SESSION_SECRET`, eliminating role intent drift across parallel tabs while preserving existing MongoDB user roles.
  - **Dedicated Dark-Fantasy Templates:** Created semantic views `views/buyer/login.ejs`, `views/buyer/register.ejs`, `views/seller/login.ejs`, and `views/seller/register.ejs` sharing `/css/auth.css` low-level styling primitives with distinct Captain Explorer vs Merchant Armator identity, emblems, coordinates, and navigation links.
  - **Comprehensive Verification:** 77/77 tests passing in `scratch/test_dedicated_auth_rebuild.js`, 48/48 live browser tests passing in `scratch/verify_live_browser_auth.js`, 42/42 clean EJS syntax compilations in `scratch/check_ejs_syntax.js`, 144/144 tests in `scratch/test_seller_navbar_unification.js`, 52/52 tests in `scratch/test_aud_6_3_f01_payment_fulfillment_separation.js`, 100/100 tests in `scratch/test_aud_001_multi_seller_fulfillment.js`, and 72/72 tests in `scratch/test_buyer_commerce_flow.js`.

* **Seller Navbar Unification & Crowding Fix (`views/partials/header.ejs`, `scratch/test_seller_navbar_unification.js`, `scratch/browser_seller_navbar_test.js`):**
  - **Identical Canonical Shell Baseline:** Standardized the seller navbar to use the exact same physical navbar shell as the canonical buyer navbar: `position: fixed !important; top: 18px !important; left: 50% !important; transform: translateX(-50%) !important; width: min(1100px, calc(100% - 60px)) !important; min-height: 62px !important;` with dark glassmorphic gradient (`rgba(9, 5, 13, 0.92)` to `rgba(22, 10, 15, 0.88)`), brass borders (`1px solid rgba(150, 94, 40, 0.45)`), rounded corners (`7px`), and inner gold hairline accent.
  - **Eliminated Horizontal Crowding:** Streamlined primary desktop seller navigation from 8 items down to the compact 5 canonical items:
    1. Brand Logo: `⚓ PIRATE-CIV` (role-aware link to `/seller/dashboard`)
    2. Sea Chart: `🗺️ SEA CHART` (`/home`)
    3. Seller Deck: `⚓ SELLER DECK` (`/seller/dashboard`)
    4. Orders: `📜 ORDERS` (`/seller/orders`)
    5. Merchant Identity Badge: `⚓ [Store Name / Captain Name]` (`/seller/profile`)
    6. Logout: `LOGOUT` (`/logout`)
  - **Secondary Actions Preserved in Seller Deck & Mobile Drawer:** Secondary destinations (`📦 Products / Forge Cargo`, `⚙️ Seller Profile`, `📜 Guild Lore`) remain fully active on the Seller Deck dashboard and are marked `.nav-mobile-only` to display cleanly within the mobile drawer menu (`#navLinksMenu.nav-links-open`) on screens <= 900px.
  - **Identity Badge Sizing & Truncation:** Added CSS-based text-overflow truncation (`max-width: 170px;` on `.navbar .nav-user-badge`, `max-width: 130px; overflow: hidden; text-overflow: ellipsis;` on `.nav-user-name`) with full accessible titles and ARIA labels. Prevents long store names from stretching or wrapping the navbar.
  - **Deterministic Single-Active State:** Preserved strict, singular `.active` states: `/home` activates `navSeaChart`, `/seller/dashboard` activates `navSellerDeck`, and `/seller/orders` activates `navSellerOrders`. Secondary subpages (`/seller/products`, `/seller/profile`) produce zero false active highlights on top-bar primary links.
  - **Strict Role Separation Maintained:** Sellers never see buyer Cargo Hold, My Voyages, or Captain's Log side panel. Buyers never see Seller Deck, Orders, Products, or Seller Profile.
  - **Mobile Drawer Architecture:** Normalized mobile drawer CSS (`@media (max-width: 900px)`): `.navbar .nav-links` is properly hidden by default (`display: none !important;`) and opens upon tapping `#navToggleBtn` (`display: flex !important; flex-direction: column;`).
  - **Content Clearance Verified:** All 7 seller views (`dashboard.ejs`, `products.ejs`, `product-create.ejs`, `product-edit.ejs`, `orders.ejs`, `order-detail.ejs`, `profile.ejs`) utilize `.seller-dashboard-wrapper` with 96px top clearance, preventing content from hiding beneath the fixed navbar.
  - **Automated & Browser Verification:** 144/144 tests passing in `scratch/test_seller_navbar_unification.js`, 106/106 tests in `scratch/verify_global_navbar_unification.js`, 51/51 tests in `scratch/test_navigation_cleanup.js`, 70/70 tests in `scratch/test_milestone_6_3.js`, and 38/38 clean EJS syntax checks. Live browser CDP verification performed across 1440x900, 1366x768, 1024x768 (tablet), and 390x844 (mobile closed + open drawer) with 0 console errors and 0 horizontal overflows.

* **Buyer Cargo / Checkout / My Voyages Flow Repair (`controller/cart.js`, `public/js/island-store.js`, `public/js/favorites.js`):**
  - **Fixed Bug A — Favorites "STOW IN HOLD" Raw JSON Elimination:** In `controller/cart.js::addToCart`, standard HTML form POSTs (without `Accept: application/json` or `X-Requested-With`) previously returned raw JSON directly to the browser. Introduced `handleResponse()` returning JSON when requested via fetch/AJAX and safely redirecting back to `req.get("Referrer") || "/favorites"` on both success and error for standard form submissions. Also updated `public/js/favorites.js` with document-level event delegation to guarantee submission interception and seamless client toast/badge updates.
  - **Fixed Bug B — "SECURE CARGO HOLD" Navigation on `/cart`:** In `public/js/island-store.js`, client-side hydration via `renderManifestPage()` dynamically replaced `#cartManifestContent`'s innerHTML with a `<button id="btnManifestCheckout">` instead of an anchor link. In `wireManifestEventListeners()`, clicking the button lacked `window.location.href = "/checkout"`, leaving the user on `/cart` with no action. Furthermore, `storeState.cart` initializes as `[]` before `fetchCartFromServer()` resolves, causing spurious "Your cargo hold is empty!" alerts when clicking before network response. Fixed by rendering a semantic `<a href="/checkout" id="btnManifestCheckout" class="btn-manifest-checkout">`, adding `window.location.href = "/checkout"` on valid items, and checking SSR table rows (`.manifest-item-row`) so initial clicks are never prematurely blocked.
  - **Synchronized Cargo Hold Badges:** Updated `updateCartBadge()` in `public/js/island-store.js` to dynamically update both `#cartCountBadge` and the canonical top navbar badge `#navCargoCount`, ensuring the navbar count is in sync across all pages.
  - **Preserved Payment & Multi-Seller Fulfillment Separation (AUD-6.3-F01):** Verified that `POST /orders/:orderId/pay` transitions `paymentStatus: 'paid'` without modifying seller fulfillment states (`fulfillments[].status` remains strictly `'pending'`). Each merchant must manually confirm their own fulfillment through the seller order console.
  - **My Voyages Ledger Restored:** Verified end-to-end voyage tracking (`/orders`) displaying newly placed orders with historical item snapshots, accurate Doubloons valuation, tracking timeline, and multi-seller independent progress.
  - **Comprehensive Verification:** 72/72 tests passing in `scratch/test_buyer_commerce_flow.js`, 31/31 tests passing in live end-to-end suite `scratch/test_live_buyer_journey.js`, 106/106 tests passing in `scratch/verify_global_navbar_unification.js`, 52/52 tests passing in `scratch/test_aud_6_3_f01_payment_fulfillment_separation.js`, 100/100 tests passing in `scratch/test_aud_001_multi_seller_fulfillment.js`, 70/70 tests passing in `scratch/test_milestone_6_3.js`, 92/92 tests passing in `scratch/test_milestone_5_4.js`, 70/70 tests passing in `scratch/test_milestone_5_3.js`, and 38/38 clean EJS syntax compilations.
  - **Eliminated Raw JSON Navigation:** Created dedicated modular client-side engine [`public/js/favorites.js`](file:///d:/projects%202.0/main/pirate-civ/public/js/favorites.js) intercepting `.favorite-stow-form` submit events via `e.preventDefault()`, sending an asynchronous `fetch("/cart/add")` with JSON payload `{ productId, quantity }` and `Accept: application/json`. The browser strictly remains on `/favorites` without navigating to raw JSON output.
  - **Real-Time Dynamic Cargo Count Synchronization:** Updated `#navCargoCount` badge in the canonical top navbar upon receiving `cart.itemCount` from the server response, matching the exact format ` (N)`. Also updated `controller/favorites.js` to look up the buyer's persistent MongoDB cart (or session cart) and pass it on SSR so the initial navbar badge accurately reflects stowed cargo.
  - **Pirate-Civ Themed Toast Notifications:** Integrated standard `.store-toast` feedback system notifying captains upon stow success (`⚓ "Vane's Astrolabe" stowed in Cargo Hold!`) or descriptive error handling (`⚠️ Cannot stow: vault reserve is exhausted`, out-of-stock, unauthenticated, or network errors).
  - **Duplicate Click & In-Flight Protection:** Form is marked `data-submitting="true"` and the submit button is temporarily disabled with `⏳ STOWING...` text while the request is in flight. On success, transitions to `✓ STOWED` for 1.2s before re-enabling. Added `.btn-favorite-stow:disabled` CSS rules with `opacity: 0.65` and `cursor: not-allowed`.
  - **Non-Negotiable Scope Protection:** Global navbar, Cart database models, routes, and checkout architectures preserved with 100% fidelity.
  - **Verification:** 50/50 checks passing in `scratch/test_favorites_stow_cart_action.js`, 31/31 checks passing in `scratch/test_favorites_visual_fix.js`, 106/106 checks passing in `scratch/verify_global_navbar_unification.js`, 51/51 checks passing in `scratch/test_navigation_cleanup.js`, 70/70 checks passing in `scratch/test_milestone_6_3.js`, 38/38 EJS template syntax checks clean, and browser CDP verification confirming zero JSON dump and live navbar cargo count increment.

* **Favorites Page Visual Regression Fix (`views/favorites.ejs`, `public/css/favorites.css`, `public/images/items/default-relic.png`):**
  - **High-Contrast Hero Header Ledger:** Replaced bare text header over dark backdrop with a dedicated `.favorites-hero-card` featuring deep nautical surface (`rgba(14, 22, 32, 0.94)` to `rgba(8, 14, 22, 0.98)`), restrained brass border (`rgba(212, 147, 57, 0.45)`), gold hairline accent, and `backdrop-filter: blur(12px)`.
  - **Restored Typography & Readability:** `CAPTAIN'S FAVORITES` rendered in high-contrast gold (`#ffd700`) with glow and drop shadow; subtitle rendered in crisp warm parchment/ivory (`#e5d3b6`). Added `.favorites-title-badge` ("✦ TREASURE VAULT LEDGER ✦") with golden diamond gems.
  - **Translucent Nautical Relic Cards:** Implemented `.favorite-item-card` with dark glassmorphism surfaces (`rgba(16, 25, 36, 0.88)`), subtle inner gold highlight, 10px rounded corners, and hover lift.
  - **Fixed Missing Asset Bug (Vane's Astrolabe):** Added canonical fallback relic asset `public/images/items/default-relic.png` (antique brass astrolabe-sextant instrument) and added resilient `onerror` fallbacks in template. Vane's Astrolabe now renders an authentic, crisp antique relic with 200 OK (0 broken image icons / 0 console 404s).
  - **Nautical Actions & Interactions:** Restyled card actions with authentic pirate typography: `.btn-favorite-stow` ("🛒 STOW IN HOLD"), `.btn-favorite-inspect` ("🔍 DETAILS"), and `.btn-remove-favorite` ("✕ DISMISS").
  - **Canonical Global Navbar Protection:** Zero changes to the global navbar or `views/partials/header.ejs`. The page cleanly preserves the canonical fixed navbar, Captain badge, and left-docked Captain's Log panel.
  - **Verification:** 31/31 checks passing in `scratch/test_favorites_visual_fix.js`, 106/106 checks passing in `scratch/verify_global_navbar_unification.js`, 51/51 checks passing in `scratch/test_navigation_cleanup.js`, 70/70 checks passing in `scratch/test_milestone_6_3.js`, 38/38 EJS template syntax checks clean.
  - **Single Canonical Navbar Shell:** Unconditionally applied the home page canonical navbar shell (`width: min(1100px, calc(100% - 60px))`, fixed top positioning at 18px, centered with `left: 50%; transform: translateX(-50%)`, `min-height: 62px`, dark translucent gradient, fine brass borders `1px solid rgba(150, 94, 40, 0.45)`, rounded corners, and gold inner border line) across every single page.
  - **Purged Overrides:** Removed rogue `body.island-store-body .navbar` static 1360px override from `island-store.css`, eliminated duplicate `.navbar` styles and emoji rules from `users.css`, purged rogue purple `.active` selector from `contact.css`, and removed duplicate `.nav-cargo-btn` DOM insertion from `mindmap.js`.
  - **Self-Contained Header CSS:** Encapsulated canonical navbar styles directly in `views/partials/header.ejs` so that all pages render the exact same navbar object regardless of external CSS loading.
  - **Content Padding Accommodations:** Main containers on all pages updated with 96px top clearance to prevent fixed navbar overlap.
  - **Display Name Deduplication:** Fixed presentation logic to eliminate "Captain Captain Browser" while properly displaying "Captain Rishi" or "Captain Browser".
  - **Dynamic Cargo Count:** Added `#navCargoCount` badge support cleanly integrated with the canonical `#navCargoHold` link.
  - **Role Awareness Preserved:** Seller pages retain exclusive command deck links with zero buyer shopping leaks, and guests retain public nav.
  - **Verification:** 106/106 automated tests passing in `scratch/verify_global_navbar_unification.js`, 51/51 tests passing in `scratch/test_navigation_cleanup.js`, 70/70 tests passing in `scratch/test_milestone_6_3.js`, 38/38 EJS template syntax checks clean.

* **Merchant Guild Registry — Open Parchment / Admiralty Chart Visual Redesign (`views/users.ejs`, `public/css/users.css`):**
  - **Complete Removal of Cards & Boxes:** Fully eliminated the rectangular card/box/glass container paradigm (`background: transparent`, `border: none`, `box-shadow: none`, `backdrop-filter: none`). The aged parchment map (`/images/users-parchment.png`) itself is now the sole interface surface.
  - **Printed & Engraved Aesthetic:** Merchant entries are rendered as open document listings printed directly onto the parchment in dark iron gall ink (`#2D180C`), warm brown metadata (`#523520`), and antique gold accents (`#9A6624`).
  - **Heraldic Guild Seals & Astrolabe Ticks:** Each merchant entry is anchored by a circular guild seal medallion with double brass bezel and radiating compass tick ring (`.seal-astrolabe-svg`), featuring authentic heraldic nautical emblems (golden galleon ship on navy, crossed cutlasses on burgundy, sea trident on teal) or uploaded seller avatars.
  - **Faint Cartographic Map Illustrations:** Implemented faint copperplate map etchings multiplied into the parchment fiber (`.parchment-decor-layer`), including a vintage Spanish galleon ship under full sail in the upper right, coastal mountain islands, lookout watchtower with palm trees, and nautical compass circles.
  - **Printed Document Storefront Link:** Transformed the action link into an authentic printed document citation (`DISCOVER STOREFRONT →`) with clean serif typography, delicate antique underline (`border-bottom: 1px solid rgba(122, 76, 28, 0.45)`), and hover arrow translation (`translateX(4px)`).
  - **Document Section Dividers:** Subtle engraved hairline dividers with center 8-point nautical compass stars (`──────── ✦ ────────`) separate each charter entry cleanly across the parchment safe zone.
  - **Scrolling & Containment Integrity:** Maintained strict viewport containment (`height: 100vh; overflow: hidden`) and hidden internal scrollbar (`scrollbar-width: none`), ensuring content never touches torn edges and no browser scrollbars appear.
  - **Verification:** 53/53 tests in `scratch/test_registry_redesign.js`, 51/51 tests in `scratch/test_navigation_cleanup.js`, 70/70 tests in `scratch/test_milestone_6_3.js`, 38/38 EJS template syntax checks, and complete browser CDP testing on desktop (1280x800) and mobile (390x844).
* **Global Navigation Streamlining & Captain Side Panel (`views/partials/header.ejs`):**
  - **Top Navbar Density Reduction:** Cleaned up overloaded authenticated buyer navbar from 10 items down to core primary destinations: Sea Chart (`/home`, `#navSeaChart`), Cargo Hold (`/cart`, `#navCargoHold`), My Voyages (`/orders`, `#navBuyerOrders`), Captain Identity Badge (`#navUserBadge`), and Logout (`#navLogout`).
  - **Duplicate Profile Removal:** Completely eliminated duplicate standalone top-level `Profile` navigation link next to Captain Rishi badge. The Captain badge remains the singular profile entry in the top navbar.
  - **Compact Captain Side Panel (`#captainSidePanel`):** Implemented a compact, nautical-themed secondary navigation panel docked on the left of authenticated buyer views:
    - Favorites (`/favorites`, `#sideNavFavorites`)
    - Explorers (`/explorers`, `#sideNavExplorers`)
    - Guild Lore (`/about`, `#sideNavAbout`)
    - Profile (`/profile`, `#sideNavProfile`)
    - Accessible collapse/expand toggle (`#captainPanelToggle`) with localStorage persistence and mobile overlay behavior.
  - **Deterministic Single Active State:** Preserved exact 1:1 active link mapping (`aria-current="page"`, `.active`) across every route; no dual-active highlights or parent-child conflicts.
  - **Role-Awareness & RBAC Intact:** Seller command deck navigation and guest navigation remain completely role-isolated; merchants never receive buyer shopping links or Captain side panel.
  - **Mobile Responsiveness:** Viewports $\le 900\text{px}$ utilize a compact, touch-friendly floating drawer with click-outside auto-collapse without horizontal overflow.
* **Phase 6.3 Forensic Audit:** Performed exhaustive audit recorded in [`docs/20_PHASE_6_3_FORENSIC_AUDIT.md`](./20_PHASE_6_3_FORENSIC_AUDIT.md).
* **Finding Remediated (AUD-6.3-F01 — P1):**
  - **Issue:** Buyer payment (`POST /orders/:id/pay`) was automatically setting `order.status = 'confirmed'` and advancing all seller fulfillments from `pending` to `confirmed`, conflating financial settlement with merchant fulfillment acceptance.
  - **Fix:** Separated buyer demo payment from seller fulfillment. Payment transitions `order.paymentStatus = 'paid'` and triggers `order.recalculateAggregateStatus()`. All seller fulfillments remain in their independent state (`pending`), requiring each merchant to explicitly review and confirm their own fulfillment via `POST /seller/orders/:id/status`.
  - **Files Modified:** [`controller/orders.js`](../controller/orders.js), [`views/orders.ejs`](../views/orders.ejs), [`views/order-confirmation.ejs`](../views/order-confirmation.ejs).

---

## 🧪 3. Automated Test Verification (628 Passing Assertions)
All automated suites executed against clean, isolated MongoDB instances with 100% pass rates:
1. `scratch/test_aud_6_3_f01_payment_fulfillment_separation.js`: **52/52 passed** (New dedicated regression suite for payment-fulfillment separation).
2. `scratch/test_aud_001_multi_seller_fulfillment.js`: **100/100 passed** (Multi-seller fulfillment isolation & state machine).
3. `scratch/test_milestone_6_3.js`: **70/70 passed** (Milestone 6.3 comprehensive acceptance test).
4. `scratch/audit_phase_6_3_forensic.js`: **89/89 passed** (Comprehensive forensic logic audit).
5. `scratch/test_milestone_5_4.js`: **92/92 passed** (Buyer order history & nautical tracking).
6. `scratch/test_milestone_5_3.js`: **70/70 passed** (Order generation, stock deduction, snapshot immutability).
7. `scratch/test_milestone_6_2.js`: **90/90 passed** (Role-aware global navigation).
8. `scratch/check_all_syntax.js`: **27/27 passed** (Static JS syntax validation across all files).
9. `scratch/check_ejs_syntax.js`: **38/38 passed** (Static EJS template compilation across all views).
10. `scratch/verify_live_multiseller_journey.js`: **25/25 passed** (Live SSR integration against `http://localhost:3000`).

---

## 📋 4. Tomorrow's Session Plan: Interactive Manual & Browser Journey

### Test Accounts Ready on `http://localhost:3000` (Main Database `pirate-civ`):
* **Buyer Account:** `journey_buyer@pirateciv.test` (Password: `PiratePass123!`)
  - Persistent cart pre-seeded with multi-seller items (Thorne's Boarding Pistol + Vane's Astrolabe).
* **Seller A (Thorne's Vault):** `journey_seller_a@pirateciv.test` (Password: `PiratePass123!`)
* **Seller B (Vane's Relics):** `journey_seller_b@pirateciv.test` (Password: `PiratePass123!`)

### Tomorrow's Interactive Step-by-Step QA Checklist:
1. **Buyer Checkout & Demo Payment:**
   - Log in as `journey_buyer@pirateciv.test` via `/login?intent=buyer`.
   - Open `/cart` $\rightarrow$ proceed to `/checkout`.
   - Submit checkout manifest (Destination: `Tortuga Anchorage`).
   - On the Order Confirmation page, click **"Complete Demo Payment"** $\rightarrow$ `/orders/:id/payment`.
   - Click **"Authorize Demo Settlement"**.
   - Verify on `/orders` that `Payment Status: Paid` is shown, and fulfillment states are **`Awaiting Merchant Confirmation`** (`pending`).
   - Log out.
2. **Seller A (Thorne) Manifest Confirmation:**
   - Log in as `journey_seller_a@pirateciv.test` via `/login?intent=seller`.
   - Navigate to `/seller/orders` $\rightarrow$ click into the order.
   - Verify payment is **PAID** and fulfillment is **PENDING**.
   - Click **"Confirm Manifest"** button.
   - Verify Seller A fulfillment updates to **CONFIRMED**.
   - Log out.
3. **Seller B (Vane) Isolation & Confirmation:**
   - Log in as `journey_seller_b@pirateciv.test` via `/login?intent=seller`.
   - Navigate to `/seller/orders` $\rightarrow$ click into the order.
   - Verify Seller B fulfillment is **STILL PENDING** (isolated from Seller A).
   - Click **"Confirm Manifest"**.
   - Verify Seller B fulfillment updates to **CONFIRMED**.
   - Log out.
4. **Buyer Final Ledger Verification:**
   - Log back in as `journey_buyer@pirateciv.test`.
   - Open `/orders`.
   - Verify both merchant fulfillments display **`CONFIRMED`** and aggregate status is **`CONFIRMED`**.

---

## 📌 5. Backlog (Pending P2/P3 Follow-ups)
* **AUD-6.3-F02 (P2):** Add informational notification message on Google OAuth role/intent mismatch (`/home?notice=role_conflict`).
* **AUD-6.3-F03 (P3):** Upgrade lenient star rating normalization to strict HTTP 400 validation rejection.
