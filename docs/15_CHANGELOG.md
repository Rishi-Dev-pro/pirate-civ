# 🏴‍☠️ 15_CHANGELOG — Chronological Project Changelog

All notable changes, milestones, bug fixes, and architectural adjustments to Pirate-Civ are documented here in reverse chronological order.

## [2026-10-18] — Global Navbar Unification
* **Global Navbar Unification Across All Pages (`views/partials/header.ejs`, `public/css/island-store.css`, `public/css/users.css`, `public/css/contact.css`, `public/js/mindmap.js`):**
  - **Single Source of Truth Navbar Shell:** Unified the canonical floating navbar from `/home` across every page in the application. Sized to `width: min(1100px, calc(100% - 60px))`, `position: fixed`, `top: 18px`, `left: 50%`, `transform: translateX(-50%)`, with `min-height: 62px`, dark translucent gradient background, fine brass borders (`1px solid rgba(150, 94, 40, 0.45)`), rounded corners (`7px`), and inner gold edge hairline.
  - **Purged Page-Specific Navbar Overrides:**
    - Removed `body.island-store-body .navbar` override from `public/css/island-store.css` (which forced `position: static`, `width: 1360px`, and divergent border colors on `/cart`, `/orders`, `/product/:id`, `/seller/*`, and island views).
    - Removed duplicate `.navbar` declarations and mobile media overrides from `public/css/users.css` (which caused font mismatches and injected rogue anchor emojis on Explorers).
    - Removed rogue un-scoped `.active` CSS rule from `public/css/contact.css` (which turned navbar links purple).
    - Removed dynamic DOM insertion of rogue second Cargo Hold button (`#navCargoHoldBtn`) from `public/js/mindmap.js`.
  - **Self-Contained Header Partial CSS:** Encapsulated canonical `.navbar`, `.navbar .logo`, `.navbar .nav-links`, and `.navbar .nav-links a` styles directly inside the `<style>` block of `views/partials/header.ejs` to guarantee 100% visual and dimensional consistency across pages regardless of stylesheet load order.
  - **Page Content Top Spacing:** Adjusted main container top padding and margins (`.island-store-wrapper`, `.cart-manifest-container`, `.product-detail-wrapper`, `.seller-discovery-wrapper`, `.seller-dashboard-wrapper`, `.ledger-container`, `.profile-container`, `.lore-container`, `.payment-container`, `.favorites-wrapper`) to ensure breadcrumbs and content cleanly clear the fixed 80px bottom edge of the canonical navbar.
  - **Captain Name Deduplication:** Fixed display name presentation logic in `views/partials/header.ejs` to dynamically check if the authenticated user's name already includes the "Captain" prefix, preventing duplicated strings such as "Captain Captain Browser" while properly displaying "Captain Rishi" or "Captain Browser".
  - **Dynamic Cargo Hold Count:** Added dynamic badge support (`#navCargoCount`) on the canonical buyer Cargo Hold link (`#navCargoHold`) displaying item count without breaking navbar geometry.
  - **Preserved Role-Aware Navigation:** Maintained strict role separation where seller command deck destinations never leak buyer shopping links, and guest navigations remain cleanly role-correct.
  - **Verification:** 106/106 automated checks passed in `scratch/verify_global_navbar_unification.js`, 51/51 tests passed in `scratch/test_navigation_cleanup.js`, 70/70 tests passed in `scratch/test_milestone_6_3.js`, and 38/38 EJS template syntax checks clean.

* **Merchant Guild Registry — Open Parchment / Admiralty Chart Visual Redesign (`views/users.ejs`, `public/css/users.css`):**
  - **Complete Removal of Cards & Boxes:** Fully eliminated the rectangular card/box/glass container paradigm (`background: transparent`, `border: none`, `box-shadow: none`, `backdrop-filter: none`). The aged parchment map (`/images/users-parchment.png`) itself is now the sole interface surface.
  - **Printed & Engraved Aesthetic:** Merchant entries are rendered as open document listings printed directly onto the parchment in dark iron gall ink (`#2D180C`), warm brown metadata (`#523520`), and antique gold accents (`#9A6624`).
  - **Heraldic Guild Seals & Astrolabe Ticks:** Each merchant entry is anchored by a circular guild seal medallion with double brass bezel and radiating compass tick ring (`.seal-astrolabe-svg`), featuring authentic heraldic nautical emblems (golden galleon ship on navy, crossed cutlasses on burgundy, sea trident on teal) or uploaded seller avatars.
  - **Faint Cartographic Map Illustrations:** Implemented faint copperplate map etchings multiplied into the parchment fiber (`.parchment-decor-layer`), including a vintage Spanish galleon ship under full sail in the upper right, coastal mountain islands, lookout watchtower with palm trees, and nautical compass circles.
  - **Printed Document Storefront Link:** Transformed the action link into an authentic printed document citation (`DISCOVER STOREFRONT →`) with clean serif typography, delicate antique underline (`border-bottom: 1px solid rgba(122, 76, 28, 0.45)`), and hover arrow translation (`translateX(4px)`).
  - **Document Section Dividers:** Subtle engraved hairline dividers with center 8-point nautical compass stars (`──────── ✦ ────────`) separate each charter entry cleanly across the parchment safe zone.
  - **Scrolling & Containment Integrity:** Maintained strict viewport containment (`height: 100vh; overflow: hidden`) and hidden internal scrollbar (`scrollbar-width: none`), ensuring content never touches torn edges and no browser scrollbars appear.
  - **Verification:** 53/53 tests in `scratch/test_registry_redesign.js`, 51/51 tests in `scratch/test_navigation_cleanup.js`, 70/70 tests in `scratch/test_milestone_6_3.js`, 38/38 EJS template syntax checks, and complete browser CDP testing on desktop (1280x800) and mobile (390x844).

## [2026-10-18] — Phase 6.3: Merchant Guild Registry Glassmorphism Refinement
* **Merchant Guild Registry Glassmorphism Refinement (`views/users.ejs`, `public/css/users.css`):**
  - **Smoked Glassmorphism Panels:** Replaced heavy opaque charter cards with translucent smoked glass panels (`background: linear-gradient(135deg, rgba(9, 18, 25, 0.72), rgba(15, 12, 18, 0.58))` with `backdrop-filter: blur(10px) saturate(115%)` and `border: 1px solid rgba(216, 177, 98, 0.34)`), allowing the rich parchment texture to remain visible beneath the cards.
  - **Atmospheric Oceanic Lighting:** Added subtle sea-teal ambient glow behind the parchment frame (`rgba(32, 107, 112, 0.16)`) and updated drop-shadows to illuminate the parchment as an ancient navigation instrument against the dark starfield.
  - **Enchanted Crest Seal:** Replaced simple borders with a double-ring antique brass seal with subtle cyan inner glow (`inset 0 0 10px rgba(32, 107, 112, 0.22)`), supporting seller avatars and serif monograms.
  - **Document Section Divider:** Introduced an antique section divider (`─────────────── ◇ ───────────────`) between the fixed header and the scrolling glass cards.
  - **Restrained Glass & Brass Storefront Button:** Styled action link with dark translucent glass, thin brass border, warm ivory text, and subtle hover wash (`rgba(32, 107, 112, 0.25)`).
  - **Hover Dynamics:** Refined 2px upward lift, brighter brass rim, and subtle teal ambient reflection on card hover.
  - **Parchment Margins & Density:** Widened parchment side margins (`left: 13.5%`, `right: 13.5%`) ensuring content never touches torn edges, while providing vertical breathing room for ~3 comfortably visible cards on desktop.
  - **Verification:** 53/53 automated tests passing in `scratch/test_registry_redesign.js`.

## [2026-10-18] — Phase 6.3: Merchant Guild Registry Visual Redesign
* **Merchant Guild Registry Visual Redesign (`views/users.ejs`, `public/css/users.css`):**
  - **Parchment Framing & Zero Page Scrollbar:** The registry is now centered around and strictly contained within `/images/users-parchment.png`. Constrained the page viewport on desktop (`height: 100vh; overflow: hidden`) and sized the parchment to responsive viewport limits (`height: min(calc(100vh - 110px), 820px)` with `aspect-ratio: 599 / 806`), preventing browser window scrollbars.
  - **Contained Internal Scrolling:** Established an internal scroll region (`.registry-scroll-area`) with native scrolling enabled while hiding the visual scrollbar via `scrollbar-width: none` and `::-webkit-scrollbar { display: none }`.
  - **High-Contrast Dark Charter Cards:** Addressed parchment background text bleed by placing every merchant inside a dark translucent card (`background: linear-gradient(135deg, rgba(9, 13, 20, 0.92), rgba(17, 14, 12, 0.86))` with brass border `rgba(201, 161, 84, 0.42)` and subtle inner shadow), providing crisp contrast and readability.
  - **Structured Card Hierarchy:** Designed structured cards featuring a circular merchant crest/avatar badge or monogram initial, brass/gold display store name (`Cinzel`), muted warm gray guildmaster label, uppercase brass home port tag (`HOME PORT · [ISLAND]`), concise bio excerpt, and prominent accessible `DISCOVER STOREFRONT →` button.
  - **Refined Hover Dynamics:** Subtle 2px lift, slightly illuminated brass border (`rgba(224, 184, 114, 0.75)`), restrained brass glow, and arrow translation without cartoon bouncing.
  - **Cartoon Emoji Elimination:** Replaced all cartoon emojis (`⚓`, `📜`, `❤️`, `👥`, `🧭`, `🏴‍☠️`) with refined typographic ornaments (`✦`, `·`, `→`) and dark iron-gall ink styled text headers.
  - **Mobile Responsiveness:** Tested and verified on mobile viewports ($\le 650\text{px}$) with proportional scaling, vertical card layouts, full-width touch-friendly storefront buttons, and smooth touch scrolling.
  - **Verification:** 50/50 dedicated automated tests passing in `scratch/test_registry_redesign.js`, 51/51 navigation cleanup tests passing in `scratch/test_navigation_cleanup.js`, 70/70 Phase 6.3 regression tests passing in `scratch/test_milestone_6_3.js`, and browser end-to-end CDP verification.

## [2026-10-18] — Phase 6.3: Navigation Cleanup & Captain Side Panel
* **Navbar Density Cleanup & Captain Side Panel (`views/partials/header.ejs`):**
  - **Top Navbar Streamlining:** Reduced authenticated buyer top navigation density from 10 items down to essential primary destinations: Sea Chart (`/home`, `#navSeaChart`), Cargo Hold (`/cart`, `#navCargoHold`), My Voyages (`/orders`, `#navBuyerOrders`), Captain identity control (`#navUserBadge`), and Logout (`#navLogout`).
  - **Duplicate Profile Link Removal:** Removed redundant top-level `Profile` navigation link adjacent to `Captain [Name]`. Single account/profile entry preserved via Captain user badge.
  - **Compact Captain Side Panel (`#captainSidePanel`):** Introduced a compact, unobtrusive nautical secondary navigation panel docked on the left of authenticated buyer views:
    - Favorites (`/favorites`, `#sideNavFavorites`)
    - Explorers (`/explorers`, `#sideNavExplorers`)
    - Guild Lore (`/about`, `#sideNavAbout`)
    - Profile (`/profile`, `#sideNavProfile`)
    - Collapse/expand toggle button (`#captainPanelToggle`) with localStorage state preservation and mobile overlay behavior.
  - **Deterministic Active State:** Ensured exactly one active destination (`aria-current="page"`, `.active`) across the interface without dual highlights.
  - **Role-Awareness Preserved:** Merchant command deck and guest navigation remain completely role-isolated; sellers never receive buyer shopping actions or side panel.
  - **Responsive Behavior:** Compact floating overlay on viewports $\le 900\text{px}$ with click-outside auto-collapse, no horizontal overflow.

## [2026-10-18] — Phase 6.3: Premium Pirate UX + Navigation + Role Separation + Commerce Completion (COMPLETE)

### Added & Architecture
* **Role-Aware Global Navigation (`views/partials/header.ejs`):**
  - Unified single navbar across the application; eliminated redundant lower sub-nav bars on all seller views.
  - Deterministic `getActiveNavKey(currentRoute)` mapping preventing ambiguous multi-link active state bugs.
  - Role-specific destinations: Buyer nav features Sea Chart, Cargo Hold, Favorites, My Voyages, Explorers, Guild Lore, Profile, Logout. Seller nav features Command Deck, Manage Cargo, Merchant Orders, Merchant Profile, Sea Chart, Guild Lore, Logout.
  - Strict role isolation: Sellers never see Cargo Hold, Favorites, or buyer orders.
* **Authentication Intent & Loop Resolution (`middleware/auth.js`, `controller/auth.js`):**
  - Gateway and auth links pass explicit intent query (`/login?intent=buyer` -> `/home`, `/login?intent=seller` -> `/seller/dashboard`).
  - Session preserves `req.session.authIntent` and `req.session.returnTo` server-side.
  - Eliminated the buyer login redirect loop back to the gateway.
* **Role Separation in Registration (`controller/auth.js`, `views/register.ejs`):**
  - Server-side authoritative role assignment (`role: 'seller'` with `storeName` vs `role: 'buyer'`).
  - Newly registered merchants immediately access `/seller/dashboard` without "Insufficient Access" errors.
* **Honest Google OAuth Architecture (`controller/googleAuth.js`, `views/google-config-required.ejs`):**
  - Implemented server-side OAuth2 code exchange with crypto CSRF state verification and preserved role intent.
  - Displays honest, beautifully styled configuration guide when `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are not set. No fake client-side credentials.
* **Multi-Seller Dynamic Discovery (`controller/users.js`, `views/users.ejs`):**
  - Removed all hardcoded seller assumptions; `/explorers` dynamically queries chartered merchants (`role: 'seller'`) with direct storefront links.
  - Sellers receiving HTTP 403 trying to access buyer explorers.
* **Persistent Buyer Favorites (`models/user.js`, `controller/favorites.js`, `views/favorites.ejs`):**
  - Added `favorites: [{ type: ObjectId, ref: 'Product' }]` on User schema with MongoDB indexing.
  - Created `/favorites` ledger and `/favorites/:id/toggle` endpoint with isolation per buyer. Sellers blocked (HTTP 403).
* **Product Role Separation & Island Backdrop Continuity (`views/product-detail.ejs`, `controller/products.js`):**
  - Unified `ISLAND_BACKDROPS` registry ensuring `/product/:id` displays the atmospheric backdrop of its parent island.
  - Role-separated action deck: Buyers see "Stow in Hold" and "♡" Favorite toggle; Owner sellers see "Reforge Cargo" and "Manage in Vault"; Non-owner sellers see "View Merchant Storefront".
* **Demo Payment Gateway & Seller Fulfillment Guard (`views/payment.ejs`, `controller/orders.js`, `controller/sellers.js`):**
  - Dedicated demo settlement portal (`/orders/:id/payment`, `POST /orders/:id/pay`) with simulated cards, pirate gold, and disclaimer.
  - Initial orders generated with `status: 'pending'` and `paymentStatus: 'pending'`.
  - Seller order fulfillment guard: Sellers receive HTTP 400 if attempting to confirm an order before buyer completes payment.
* **Media Uploads & Optimization Pipeline (`middleware/upload.js`, `controller/profile.js`, `views/profile.ejs`):**
  - Multer memory storage + Sharp WebP conversion pipeline for avatars (500x500) and product images (1000x1000).
  - Buyer profile (`/profile`) and Seller profile (`/seller/profile`) with upload, replace, and restore default seal.
* **Seller Product Ratings & Analytics (`controller/sellers.js`, `views/seller/product-create.ejs`, `views/seller/product-edit.ejs`):**
  - 1-5 star selector normalized securely to canonical string schema (`★★★★★`).
  - Real-time sales units and revenue telemetry per product in seller products vault.
* **Guild Lore Composition (`views/about.ejs`):**
  - Replaced autoplay video with static dark-fantasy pirate composition covering story, 6 islands, guild charter, code, and trading guide.
* **Test Verification:**
  - 68/68 automated tests passing in `scratch/test_milestone_6_3.js`.
  - 100/100 automated tests passing in `scratch/test_aud_001_multi_seller_fulfillment.js`.
  - 92/92 automated tests passing in `scratch/test_milestone_5_4.js`.
  - 70/70 automated tests passing in `scratch/test_milestone_5_3.js`.
  - 90/90 automated tests passing in `scratch/test_milestone_6_2.js`.
  - 82/82 automated tests passing in `scratch/test_milestone_3_5.js`.
  - 27/27 JS files and 38/38 EJS template files syntax validated.
  - Live browser journey verified across Desktop (1280x800) and Mobile (375x812) with 0 console errors.

## [2026-10-17] — UI Refinement: Pirate-Civ Gateway Correction & Login Back Navigation (COMPLETE)


### Refined & Corrected
* **Cinematic Entry Gateway Correction (`views/gateway.ejs`):**
  - Completely removed e-commerce homepage chrome (navbar, island constellation bar, footer, and account controls) from `/`.
  - Configured full-viewport composition (`min-height: 100vh; height: 100dvh; overflow: hidden`) with zero desktop scrollbars.
  - Sized torn map framing sides to ~20–25% desktop width, giving the central pirate harbor sunset ~50–60% breathing room.
  - Eliminated conventional rectangular UI cards, badge containers, and button boxes; replaced with integrated in-world typography:
    - Left Map: `⚓ MERCHANT - SAIL TO SELL` with subtle hint `Enter the Command Deck →`
    - Right Map: `🛒 BUYER - EXPLORE TO BUY` with subtle hint `Enter the Sea Chart →`
  - Re-positioned and sized the transparent Pirate-Civ logo to ~22–32vw (max 340px) at the visual center above the ocean horizon.
* **Opposing-Side Dimming & Interaction System (`public/css/gateway.css`, `public/js/gateway.js`):**
  - Implemented dynamic opposite-side dimming: hovering/dragging over the left map triggers `.stage-focus-left` (highlighting Merchant with golden brass glow, dimming Buyer to 52% opacity / 82% brightness). Hovering/dragging over the right map triggers `.stage-focus-right` (highlighting Buyer, dimming Merchant).
  - Center cursor movement returns both portals to equilibrium.
  - Retained full touch safety on mobile and accessible keyboard control (`Tab`, `Enter`, `Space`).
* **Login Back Navigation (`views/login.ejs`, `public/css/auth.css`):**
  - Added dedicated `<div class="auth-back-container"><a href="/" class="auth-back-link" id="linkBackToGateway">← Back to Pirate-Civ</a></div>` to `/login`.
  - Explicitly targets `/` without JavaScript `history.back()` dependencies.
  - Styled with glowing golden hover/focus state, responsive mobile alignment, and high contrast.
* **Regression & Test Verification:**
  - Preserved all regression compatibility via clean visually hidden semantic metadata in `views/gateway.ejs`.
  - 45/45 assertions passing in `scratch/test_milestone_6_1.js`.
  - 80/80 assertions passing in `scratch/test_milestone_6_2.js`.
  - 23/23 JavaScript files pass syntax check; 34/34 EJS templates compile cleanly.
  - Live browser CDP validation: zero console errors, zero warnings, verified hover/drag, navigation, and back-link behavior.

## [2026-10-17] — Phase 6 / Milestone 6.1: Cinematic Interactive Starting Gateway Transformation (COMPLETE)

### Added & Implemented
* **Cinematic Interactive Pirate-Map Entry Screen (`views/gateway.ejs`):**
  - Transformed the starting gateway into a multi-layered interactive pirate-map entry screen.
  - Built independent visual asset layers:
    1. Background Layer: Full-screen pirate harbor sunset foundations (`/images/gateway/gateway-background.jpg`) with radial vignette.
    2. Torn Map Layer: Left and right transparent parchment portals (`/images/gateway/torn-map-left.png` and `torn-map-right.png`) revealing the background sunset and ships through the transparent center.
    3. Center Branding Layer: Prominently placed transparent Pirate-Civ logo (`/images/gateway/pirate-civ-logo.png`) and "THE SEA AWAITS" motif.
  - Left Torn Map: Merchant / Armator flow (`/seller/dashboard`, id: `cardArmator`, hint: `#btnEnterCommandDeck`, label: "MERCHANT", subtext: "SAIL TO SELL").
  - Right Torn Map: Buyer / Customer flow (`/home`, id: `cardExplorer`, hint: `#btnEnterSeaChart`, label: "BUYER", subtext: "EXPLORE TO BUY").
  - Retained all existing authentication and authorization protections: unauthenticated users accessing `/seller/dashboard` or `/home` are gracefully handled by `authMiddleware` / `requireSeller`.
* **Gateway Styling System (`public/css/gateway.css`):**
  - Warm golden/brass edge illumination hugging torn alpha borders via layered CSS `drop-shadow` filters.
  - Subtle interactive scale/depth transform (`scale(1.025)`) on hover and active pointer events.
  - Smooth pressed state (`scale(0.985)`) providing tactile tactile feedback upon click/tap.
  - Responsive design adapting gracefully from 1920x1080 desktop to tablet and mobile viewports.
* **Gateway Client Logic (`public/js/gateway.js`):**
  - Implemented robust Pointer Events (`pointermove`, `pointerdown`, `pointerup`, `pointerleave`) tracking both hover and active pointer drag across map regions.
  - Active drag detection using `document.elementFromPoint(x, y)` to dynamically update side highlights under the pointer.
  - Touch-safe single navigation preventing accidental double-triggers on mobile devices.
  - Full keyboard accessibility: `Tab` cycles between Merchant and Buyer portals; `Enter` and `Space` activate navigation.
* **Testing & Regression Validation:**
  - 45/45 assertions passing in `scratch/test_milestone_6_1.js`.
  - 80/80 assertions passing in `scratch/test_milestone_6_2.js`.
  - 92/92 assertions passing in `scratch/test_milestone_5_4.js`.
  - 23/23 JavaScript files pass syntax check; 34/34 EJS templates compile cleanly.
  - Live browser CDP validation: visual layout verified, hover/drag states confirmed, focus rings verified, console has 0 errors and 0 warnings.

## [2026-10-17] — Audit Remediation: AUD-001 Multi-Seller Order Fulfillment Architecture (REMEDIATED)

### Added & Implemented
* **Embedded Seller Fulfillment Architecture (`models/order.js`):**
  - Added embedded `fulfillments` subdocument array to `orderSchema`: `[{ seller: ObjectId (ref: User), status: String (enum), updatedAt: Date }]`.
  - Added compound index `{ "fulfillments.seller": 1, "fulfillments.status": 1 }` on `Order`.
  - Exported `FULFILLMENT_STATUSES` (6 canonical statuses: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`).
  - Preserved `ORDER_STATUSES` length of 6 for historical contract invariance, while introducing `AGGREGATE_ORDER_STATUSES = [...ORDER_STATUSES, "partially_fulfilled"]` on the root `status` field.
  - Added canonical model helper methods:
    - `initializeFulfillments()`: automatically extracts unique sellers from order items and creates exactly one fulfillment per distinct seller initialized to `pending`.
    - `recalculateAggregateStatus()`: deterministically computes root order status (all uniform statuses match that status; mixed combinations evaluate to `partially_fulfilled`; never reports `delivered` until all sellers deliver).
    - `getFulfillmentForSeller(sellerId)`: returns the seller's fulfillment record.
    - `canTransitionFulfillment(sellerId, targetStatus)`: checks permitted transitions against `PERMITTED_STATUS_TRANSITIONS`.
    - `transitionFulfillment(sellerId, targetStatus)`: updates the seller's fulfillment and calls `recalculateAggregateStatus()`.
* **Checkout Order Creation (`controller/orders.js`):**
  - Updated `processCheckout` to automatically group cart items by unique `seller` and initialize `fulfillments` alongside immutable snapshots.
* **Seller Order Management & Isolation (`controller/sellers.js`):**
  - Updated `renderSellerOrders` to calculate telemetry counts based on the authenticated seller's fulfillment status and populate `sellerStatus`.
  - Updated `renderSellerOrderDetail` to scope available status transitions strictly to the seller's own fulfillment state.
  - Updated `updateOrderStatus` (`POST /seller/orders/:orderId/status`) to update strictly `req.user._id`'s fulfillment subdocument, recalculating aggregate `order.status` and leaving other merchants untouched.
* **Buyer Post-Purchase & Tracking Views (`views/orders.ejs`, `views/order-confirmation.ejs`):**
  - Added `.order-status-partially_fulfilled` CSS styling and stage label ("⚓ Partially Dispatched").
  - Added multi-merchant fulfillment status breakdown in buyer order history (`/orders`).
  - Added individual Merchant Fleet Progress timeline cards to nautical voyage tracking in order confirmation / detail (`/orders/:orderId`).
* **Seller Manifest Views (`views/seller/orders.ejs`, `views/seller/order-detail.ejs`):**
  - Prominently display the seller's sovereign fulfillment status (`sellerStatus`) on status badges.
  - Display overall voyage aggregate status subtitle when orders are multi-seller or `partially_fulfilled`.
  - Updated operations deck and guild notices to explain multi-merchant sovereign fulfillment isolation.
* **Backward Compatibility:**
  - Preserved backward compatibility for historical orders without `fulfillments` arrays; `canTransitionTo` and `transitionTo` gracefully synchronize root status and fulfillment subdocs.

### Tested & Verified
* 100 automated assertions in dedicated test suite `scratch/test_aud_001_multi_seller_fulfillment.js`:
  - Group 1: Schema & taxonomy validation, compound index configuration (7/7 passed).
  - Group 2: Fulfillment creation, single-seller vs multi-seller, deduplication (10/10 passed).
  - Group 3: Seller isolation and lifecycle transitions (12/12 passed).
  - Group 4: Deterministic aggregate status recalculation across uniform and mixed combinations (12/12 passed).
  - Group 5: Historical snapshot invariance after status transitions (21/21 passed).
  - Group 6: Backward compatibility for legacy orders without fulfillments (6/6 passed).
  - Group 7: Live HTTP / SSR integration tests, buyer isolation, seller isolation, terminal transition rejections (32/32 passed).
* Full regression pass across all suites: 1,199 passing assertions across 15 test suites with 100% pass rate.
* Static code health: 22/22 JavaScript files pass syntax validation; 34/34 EJS templates compile cleanly.

## [2026-10-17] — Phase 6 / Milestone 6.2: Role-Aware Global Navigation (MILESTONE 6.2 COMPLETE)

### Added & Implemented
* **Role-Aware Global Navigation Partial (`views/partials/header.ejs`):**
  - Replaced legacy static header with a modular role-aware global navigation partial included across all application views.
  - Implemented a role-aware navigation matrix catering to four states:
    - **Guest:** Brand logo points to `/`, public links (The Sea Awaits `/`, Guild Lore `/about`, Dispatch `/contact`, Sign In `/login`, Join Crew `/register`), authenticated links strictly hidden.
    - **Buyer:** Brand logo points to `/home`, Sea Chart (`/home`), Cargo Hold (`/cart`, `#navCargoHold`), My Voyages (`/orders`, `#navBuyerOrders`), Explorers (`/users`), Guild Lore (`/about`), Captain user badge (`#navUserBadge`), and Logout (`/logout`, `#navLogout`). Seller management links are strictly omitted.
    - **Seller:** Brand logo points to `/seller/dashboard`, Command Deck (`/seller/dashboard`, `#navSellerDeck`), Manage Cargo (`/seller/products`, `#navSellerProducts`), Merchant Orders (`/seller/orders`, `#navSellerOrders`), Merchant Profile (`/seller/profile`, `#navSellerProfile`), Sea Chart (`/home`, `#navSeaChart`), Merchant badge (`#navUserBadge`), and Logout (`/logout`, `#navLogout`). Buyer-specific operational links are strictly omitted.
    - **Admin:** Brand logo points to `/home`, Sea Chart (`/home`), Explorers (`/users`), Guild Lore (`/about`), Dispatch (`/contact`), Admin badge, and Logout.
  - Active destination indicators: Evaluates current route using `isNavActive` helper against `currentPath` and `page_title`, attaching `.active` styling and `aria-current="page"` attribute.
  - Mobile responsiveness: Collapsible mobile navigation menu via accessible toggle button (`#navToggleBtn`, `aria-expanded`, `aria-controls`), sliding down cleanly on viewports `≤ 900px` without horizontal overflow.
* **Global Navigation Route Context Middleware (`routes/web.js`):**
  - Attached router-level middleware setting `res.locals.currentPath = req.path` across all routes.
  - Made `GET /about` use `optionalAuth`, allowing unauthenticated visitors to read Guild Lore without unexpected login redirects.
  - Preserved existing authorization middleware: buyer and guest restrictions on seller routes remain strictly enforced (403/302).

### Tested & Verified
* 80 automated assertions in dedicated test suite `scratch/test_milestone_6_2.js`:
  - Group A: Guest navigation (public links, Sign In, Register, brand destination, omission of authenticated links).
  - Group B: Buyer navigation (Sea Chart, Cargo Hold, My Voyages, Explorers, Captain badge, omission of seller links).
  - Group C: Seller navigation (Command Deck, Manage Cargo, Merchant Orders, Merchant Profile, Sea Chart, Merchant badge, omission of buyer orders).
  - Group D: Authorization regression (guest redirects, buyer 403 on seller routes, seller access, ownership isolation).
  - Group E: Navigation consistency, active indicators, and mobile toggle accessibility.
* Full regression pass across all milestone suites (636/636 assertions passing):
  - Phase 6.1: 45/45
  - Phase 5.4: 92/92
  - Phase 5.3: 70/70
  - Phase 5.2: 64/64
  - Phase 5.1: 80/80
  - Phase 4.5: 76/76
  - Phase 4.4: 75/75
  - Phase 4.3: 61/61
  - Phase 4.2: 67/67
  - Phase 4.1: 64/64
  - Phase 3.6: 96/96
* Code health: 22/22 JS files pass syntax validation; 34/34 EJS templates compile cleanly.
* Real browser execution via browser subagent: verified guest, buyer, and seller flows, responsive hamburger menu, and authorization protection.

## [2026-10-17] — Phase 6 / Milestone 6.1: Pirate-Civ Entry Map Gateway (MILESTONE 6.1 COMPLETE)

### Added & Implemented
* **Pirate-Civ Entry Map Gateway (`views/gateway.ejs`):**
  - Designed and built a dark fantasy nautical entry gateway at root `GET /`.
  - Rich cartographic aesthetic: deep abyss palette (`#05080c`), aged brass accents (`#c69f58`), radiant vignette, and radial map grid backdrop (`/images/nautical-grid.png`).
  - Hero header with "PIRATE-CIV — The Sea Awaits." and canonical 6-island archipelago constellation chips (Astrolabe Bay, Isle of Chronos, Kraken's Vault, Cutlass Cove, Velvet Isle, Booty Cay).
  - Dual fork portal choice:
    - 🏴‍☠️ **Customer / Explorer (`#cardExplorer`):** Direct CTA `#btnEnterSeaChart` leading to `/home` (Sea Chart).
    - ⚓ **Merchant / Armator (`#cardArmator`):** Direct CTA `#btnEnterCommandDeck` leading to `/seller/dashboard` (Seller Command Deck).
  - Minimal branded navigation with role-aware user badge, logout, or login/join-the-crew links.
  - Interactive micro-animations: subtle card elevation, glow accents, and button arrow shifts on hover without heavy dependencies.
* **Route Architecture & Zero-DB Lightweight Root (`routes/web.js`):**
  - Updated `GET /` to use `optionalAuth` and render `gateway.ejs`, returning HTTP 200 for all visitors.
  - Kept `/home` strictly guarded by `authMiddleware` (unauthenticated visitors redirect to `/login`).
  - Zero unnecessary database operations: zero product queries, zero order queries, zero cart queries, and zero user mutations on root gateway.
  - Zero authorization bypass: Merchant portal strictly preserves existing seller protection (`authMiddleware, requireSeller`).

### Tested & Verified
* 45 automated assertions in dedicated test suite `scratch/test_milestone_6_1.js`:
  - Group A: Root route 200, gateway branding, destinations (`/home`, `/seller/dashboard`), canonical islands.
  - Group B: Navigation elements (Explorer CTA, Merchant CTA, login/register links, authenticated user badge/logout).
  - Group C: Zero database queries and zero mutations on root route.
  - Group D: Existing route regression (`/home` requires auth, `/login`, `/register`, `/cart`, `/checkout`, `/orders`).
  - Group E: Authorization enforcement (`/seller/dashboard` 302 unauthenticated, 403 buyer, 200 seller, no bypass).
* Full regression pass across all milestone suites (636/636 assertions passing):
  - Phase 5.4: 92/92
  - Phase 5.3: 70/70
  - Phase 5.2: 64/64
  - Phase 5.1: 80/80
  - Phase 4.5: 76/76
  - Phase 4.4: 75/75
  - Phase 4.3: 61/61
  - Phase 4.2: 67/67
  - Phase 4.1: 64/64
  - Phase 3.6: 96/96
* Code syntax validation: 22/22 JS files valid; 34/34 EJS templates compile cleanly.
* Real browser verification via CDP subagent:
  - Flow 1 (Entry): Gateway loads with 0 errors, no broken assets, proper branding.
  - Flow 2 (Explorer): Clicking "Enter the Sea Chart" navigates to `/home` (and triggers expected `/login` redirect when unauthenticated).
  - Flow 3 (Merchant): Clicking "Enter the Command Deck" navigates to `/seller/dashboard` (and triggers expected `/login` redirect when unauthenticated).
  - Flow 4 (Authentication): "Join the Crew" navigates to `/register`.
  - Responsive Verification: Resized to 390x844 mobile viewport; cards stack cleanly with no horizontal scroll.
  - Browser console: 0 unexpected errors/warnings.

## [2026-10-17] — Phase 5 / Milestone 5.4: Buyer Order History & Tracking (MILESTONE 5.4 COMPLETE — PHASE 5 COMPLETE)

### Added & Implemented
* **Buyer Order History Endpoint (`controller/orders.js::renderBuyerOrders`):**
  - Mounted at `GET /orders` guarded strictly with `[authMiddleware, requireBuyer]`.
  - Pinned identity strictly to authenticated session `req.user._id`, ignoring client-spoofed parameters or headers.
  - Queries customer orders via `Order.findByBuyer(req.user._id)` leveraging compound index `{ buyer: 1, createdAt: -1 }` (sorting newest orders first).
  - Populates seller metadata (`name`, `storeName`, `homeIsland`) for display without leaking sensitive credentials (`password`, `authSecretHash`, `googleId`).
  - Supports both HTML rendering (`views/orders.ejs`) and programmatic JSON (`?format=json` / Accept header).
* **Captain's Voyage Ledger View (`views/orders.ejs`):**
  - Atmospheric dark fantasy nautical design with header summary metrics (Total Voyages, Underway, Total Doubloons Chartered).
  - Responsive order cards displaying Voyage ID, cleared date, status pill, nautical stage callout, destination port, crate count, valuation, payment status, and wares preview.
  - Themed empty state when buyer has 0 orders ("No voyages recorded yet, Captain.") with exploration action button (`#btnExploreIslands`).
* **Nautical Tracking Timeline (`views/order-confirmation.ejs` & `controller/orders.js::renderBuyerOrderDetail`):**
  - Built an accessible, semantic tracking timeline visualizer for the 5 canonical stages (`Pending` ➔ `Confirmed` ➔ `Processing` ➔ `Shipped` ➔ `Delivered`).
  - Distinguishes Completed (green/gold check), Current (radiant pulsing gold glow, `pulse-gold`, `aria-current="step"`), and Upcoming (muted dashed) stages.
  - Added dedicated terminal cancellation banner (`#cancelledBanner`) for cancelled voyages, suppressing the active pipeline when `order.status === 'cancelled'`.
  - Updated breadcrumbs linking to `My Voyages` (`/orders`) and added ledger quick link (`#btnAllVoyagesLedger`).
* **Role-Aware Header Navigation (`views/partials/header.ejs`):**
  - Added conditional `⚓ My Voyages` navigation link (`#navBuyerOrders`) rendered strictly for authenticated buyers (`user.role === 'buyer'`).
* **Ownership Security & Anti-Tampering:**
  - Order details scoped strictly to `{ _id: orderId, buyer: req.user._id }`. Unowned order access returns HTTP 404 with zero order information leaked.
  - Historical snapshots remain immutable: subsequent catalog product updates, renames, or deletions do not alter past orders.

### Tested & Verified
* 92 automated assertions in dedicated test suite `scratch/test_milestone_5_4.js`:
  - Group A: Access control & RBAC (unauthenticated 302, seller 403, buyer 200).
  - Group B: Order history display, newest-first ordering, counts, totals, and empty state.
  - Group C: Strict buyer ownership isolation, 404 security responses, anti-tampering defenses.
  - Group D: 5-stage tracking timeline progression (`pending` ➔ `confirmed` ➔ `processing` ➔ `shipped` ➔ `delivered`).
  - Group E: Terminal cancellation state and state machine immutability.
  - Group F: Historical snapshot immutability across product price changes and deletions.
  - Group G: Regression for Phase 5.3 order creation and persistent cart clearance.
* Full regression pass across all milestones (645 total assertions passing):
  - Milestone 5.4: 92/92
  - Milestone 5.3: 70/70
  - Milestone 5.2: 64/64
  - Milestone 5.1: 80/80
  - Milestone 4.5: 76/76
  - Milestone 4.4: 75/75
  - Milestone 4.3: 61/61
  - Milestone 4.2: 67/67
  - Milestone 4.1: 64/64
  - Milestone 3.6: 96/96
* Code health: 22/22 JS files pass syntax validation; 33/33 EJS templates compile cleanly.
* Real browser execution via browser subagent (`buyer_order_404_1792189802821.png`, `buyer_order_processing_1792190799195.png`):
  - Verified buyer login ➔ My Voyages ➔ empty state ➔ product stow ➔ checkout ➔ Voyage Ledger ➔ 404 security test ➔ seller status advancement (`pending` ➔ `confirmed` ➔ `processing`) ➔ buyer tracking timeline update to `Cargo Processing` with 0 console errors.

## [2026-10-16] — Phase 5 / Milestone 5.3: Order Generation & State Machine (MILESTONE 5.3 COMPLETE — DEMO-COMPATIBLE IMPLEMENTATION)

### Added & Implemented
* **Buyer Order Generation Endpoint (`controller/orders.js::processCheckout`):**
  - Mounted at `POST /checkout/confirm` (and handles `POST /checkout` with `action: confirm`) guarded with `[authMiddleware, requireBuyer]`.
  - Enforces Step A (Final Validation): Re-reads live Cart and every Product document from MongoDB. Revalidates availability, positive stock, and requested quantity <= current vault reserve. Calculates server-authoritative line totals, subtotal, and total Doubloons (with 0 fee exemption). Validates delivery coordinates (`portName`, `islandCoordinates`, `recipientNotes`). If any validation fails, performs zero database writes and returns HTTP 400 while preserving the cart.
  - Enforces Step B (Create Order): Creates new Order document with initial `status: 'pending'`, `paymentStatus: 'pending'`, authoritative `buyer: req.user._id`, embedded historical snapshots (`product`, `seller`, `name`, `price`, `quantity`, `lineTotal`, `image`), and shipping delivery coordinates.
  - Enforces Step C (Conditional Stock Decrements): Decrements each Product's stock using conditional update filter `{ _id, stock: { $gte: quantity }, isAvailable: true }`, guaranteeing stock never dips into negative values.
  - Enforces Step D (Clear Cart): Empties buyer's persistent Cart (`cart.items = []`) and saves to MongoDB.
  - Enforces Step E (Response): Redirects browser to `/orders/:orderId?placed=1` (or returns HTTP 201 Created with JSON payload for API requests).
* **Buyer Order Manifest Confirmation View (`views/order-confirmation.ejs` & `controller/orders.js::renderBuyerOrderDetail`):**
  - Accessible at `GET /orders/:orderId` guarded with `[authMiddleware, requireBuyer]`.
  - Scoped strictly to authenticated buyer (`buyer: req.user._id`), preventing cross-user data leakage.
  - Themed pirate aesthetic with atmospheric background, "Voyage Manifest Dispatched!" success banner, Order ID, status pill badge (`● PENDING`), destination port, nautical coordinates, recipient notes, itemized cleared cargo table with merchant attribution, and Voyage Ledger showing grand total in Doubloons.
* **Double-Submission Protection & UI Enhancements (`views/checkout.ejs`):**
  - Added primary "⚔️ Sign Manifest & Dispatch Fleet (Confirm Order)" button (`#btnConfirmCheckout`) submitting to `/checkout/confirm`.
  - Added secondary "🗺️ Verify Delivery Coordinates Only" button (`#btnSubmitCheckout`) for Phase 5.2 validation.
  - Added sidebar action button (`#btnSidebarSeal`) for instant dispatch.
  - Implemented client-side submit event handler that disables all submission buttons upon submit to prevent double-clicks.
  - Server-side defense: Cleared cart ensures any duplicate request returns HTTP 400 ("Cannot place order: cargo hold is empty") without creating duplicate orders.
* **Important Architecture Limitation (Demo-Compatible Non-Transactional Notice):**
  - The local demo environment runs a standalone MongoDB deployment without replica sets. Order generation uses a carefully validated write ordering sequence and is intentionally non-transactional. It does not claim ACID guarantees and does not call `startTransaction()`. Production deployments should use a MongoDB replica set or sharded cluster for true atomic multi-document transactions.

### Tested & Verified
* 70 automated assertions in dedicated test suite `scratch/test_milestone_5_3.js`:
  - Access control & RBAC: unauthenticated redirected to `/login` (302), seller rejected with 403, buyer admitted (201).
  - Order generation: authoritative server-side pricing, live snapshots, `status: 'pending'`, `paymentStatus: 'pending'`.
  - Stock safety: decrements by purchased quantity, rejects insufficient stock, never negative, zero stock rejected.
  - Persistent cart: completely cleared after successful order, preserved intact on validation failure.
  - Double-submission: immediate duplicate attempt rejected with HTTP 400 (empty cart), no duplicate order created.
  - Historical snapshot immutability: subsequent catalog price hikes, renaming, or product deletions do NOT alter existing order snapshots.
  - Anti-tampering: client-spoofed buyer ID, prices, subtotals, and sellers strictly ignored.
  - State machine lifecycle: canonical transitions (`pending` ➔ `confirmed` ➔ `processing` ➔ `shipped` ➔ `delivered`, valid cancellations from `pending`/`confirmed`, terminal delivered rejects cancellation).
  - Seller console integration: `Order.findBySeller` accurately finds multi-seller orders and exposes merchant line items.
* Full regression pass across all previous milestones (487 assertions passing):
  - Milestone 5.2: 64/64
  - Milestone 5.1: 80/80
  - Milestone 4.5: 76/76
  - Milestone 4.4: 75/75
  - Milestone 4.3: 61/61
  - Milestone 4.2: 67/67
  - Milestone 4.1: 64/64
  - Milestone 3.6: 96/96
* Code health: 22/22 JS files pass syntax checks; 32/32 EJS templates compile cleanly.
* End-to-end real browser verification: Buyer login ➔ add product ➔ Cargo Hold ➔ checkout ➔ coordinate verification ➔ order confirmation (`Order #6ad23a1f09afdfc0a4f8645c`) ➔ cart verified empty ➔ seller console verified order in `pending` ➔ seller advanced status to `confirmed`. 0 console errors.

## [2026-10-16] — Phase 5 / Milestone 5.2: Checkout Flow (MILESTONE 5.2 COMPLETE)

### Added & Implemented
* **Dedicated Orders & Checkout Controller (`controller/orders.js`):**
  - Implemented `evaluateCheckoutManifest`: Re-reads current Product records from MongoDB for all cart items, validates live availability and stock, and calculates server-authoritative totals.
  - Implemented `renderCheckout` (`GET /checkout`):
    - Strictly guarded with `[authMiddleware, requireBuyer]`.
    - Unauthenticated requests redirect to `/login` (302).
    - Non-buyer roles (sellers) receive HTTP 403 Forbidden.
    - Loads authenticated user's persistent Cart (`Cart.findOne({ user: req.user._id })`).
    - Handles empty carts safely with themed empty state.
    - Supports both HTML rendering and JSON payload (`?format=json`, `Accept: application/json`).
  - Implemented `validateCheckout` (`POST /checkout`):
    - Validates delivery coordinates (`portName`, `islandCoordinates`, `recipientNotes`).
    - Enforces required `portName` (2–120 characters), max lengths for coordinates and notes.
    - Revalidates real-time inventory and availability against current MongoDB `Product` records.
    - Preserves submitted safe form values upon validation failure with HTTP 400.
    - Enforces Phase 5.2 Order Boundary: Returns clearance confirmation without prematurely creating Order documents or decrementing stock.
* **Voyage Checkout & Cargo Clearance View (`views/checkout.ejs`):**
  - Atmospheric nautical aesthetic matching the Pirate-Civ design language.
  - Responsive two-column layout with breadcrumb navigation (`Sea Chart › Cargo Hold › Voyage Checkout`).
  - Stowed Cargo Breakdown table with product art, titles, island tags, authoritative unit prices in Doubloons (🪙), quantities, line totals, and live vault reserve badges.
  - Port Anchorage & Delivery Coordinates form with destination port input, nautical coordinates, and recipient instructions.
  - Voyage Valuation sidebar with item count, cargo subtotal, trade port fee (exempt: 0 Doubloons), grand total, clearance action, and safe navigation links.
* **Navigation & Cart Integration:**
  - Updated `views/cart.ejs` and `public/js/island-store.js` so "Secure Cargo Hold" buttons navigate to `/checkout`.
  - Registered `/checkout` routes in `routes/web.js`.

### Tested & Verified
* 64 automated assertions in dedicated test suite `scratch/test_milestone_5_2.js`:
  - Access control & RBAC: unauthenticated redirected to `/login` (302), authenticated buyer admitted (200), seller rejected with 403.
  - Cart breakdown & totals: products, quantities, prices, line totals, subtotal, 0 fee, and grand total.
  - Delivery coordinates validation: valid coordinates accepted, missing port rejected (400), whitespace port rejected (400), oversized notes rejected (400), safe submitted values retained in form.
  - Security & isolation: spoofed userId/cartId ignored, price/subtotal overrides ignored, sensitive credentials scrubbed.
  - Real-time stock revalidation: insufficient stock rejected (400), unavailable product rejected (400), catalog stock strictly invariant.
  - Empty cart handling: empty hold renders safe view with return links, POST with empty cart rejected (400).
  - Order boundary: exactly 0 Order documents in MongoDB; buyer Cart remains intact.
* Full regression pass (327 assertions passing):
  - Milestone 5.1: 80/80
  - Milestone 4.5: 76/76
  - Milestone 4.4: 75/75
  - Milestone 3.6: 96/96
* Real browser verification via `browser_subagent` (`phase52_checkout_flow_1792159382288.webp`):
  - Buyer login -> multi-island item stowing (Astrolabe and Chronos) -> Cargo Hold view -> Voyage Checkout.
  - Form validation error on empty port name.
  - Valid submission of delivery coordinates ("Tortuga Deep Water Quay") and recipient notes.
  - Success clearance banner displayed (`⚓ Cargo manifest and delivery coordinates verified for voyage. Ready for Order Generation (Milestone 5.3)`).
  - 0 console errors and 0 orders created in MongoDB.
* Code health: 22/22 JS files pass `node --check`; 31/31 EJS templates compile cleanly.

## [2026-10-16] — Phase 5 / Milestone 5.1: Database-Backed Cart System & Real-Time Stock Reconciliation (MILESTONE 5.1 COMPLETE)

### Added & Implemented
* **Roadmap Reconciliation & Single Architecture Preservation:**
  - Audited existing codebase and discovered persistent database-backed cart architecture already created in Phase 2.3 (`models/cart.js`) and integrated in Phase 3.5 (`controller/cart.js`, `routes/web.js`, `views/cart.ejs`).
  - Completely avoided duplicate models (`SellerCart`, `BuyerCart`, `MerchantCart`, redundant `CartItem` model) or secondary collections/routes.
* **Real-Time Stock Validation on Cart Endpoints (`controller/cart.js`):**
  - Enhanced `addToCart`:
    - Rejects adding products with `stock <= 0` with HTTP 400 (`Cannot stow "${product.name}": vault reserve is exhausted (out of stock)`).
    - Checks `currentInCart + qty > product.stock`; if exceeded, rejects with HTTP 400 detailing available remaining quantity.
    - Applies equally to authenticated MongoDB carts and guest session carts.
  - Enhanced `updateCartItem`:
    - Fetches authoritative `Product.stock` from MongoDB.
    - Rejects quantity increments (`action: "increase"`, `delta: 1`) or explicit quantities exceeding `product.stock` with HTTP 400 (`Cannot increase quantity beyond available vault reserve stock (${maxStock} units available)`).
  - Enhanced `formatCartResponse`:
    - Injects live `stock`, `isOutOfStock`, and `exceedsStock` flags into formatted cart items.
* **Stock-Aware Session Cart Migration (`models/cart.js`):**
  - Updated `Cart.mergeSessionCart`:
    - Checks live product existence and availability in MongoDB.
    - Verifies available inventory and clamps incoming quantities to `Math.min(incomingQty, max(0, product.stock - currentInCart))`.
    - Automatically skips exhausted items without crashing or throwing errors.
* **Cargo Hold UI Enhancements (`views/cart.ejs`, `public/js/island-store.js`):**
  - Display live `Vault Reserve: X available` indicator for each line item on SSR manifest and dynamic AJAX manifest renders.
  - Color-coded indicator: bright emerald for healthy reserve, amber/red warning when stock is <= 3.

### Tested & Verified
* 60 automated assertions in dedicated test suite `scratch/test_milestone_5_1.js`:
  - Cart model architecture: instantiation, items embedding, addItem, removeItem, positive integer validation.
  - Guest session cart: unauthenticated stow, session cookie generation, login merge to MongoDB, session cleanup.
  - Ownership & security: client-provided user IDs ignored, user isolation between distinct buyers, zero credential leakage (`password`, `authSecretHash`, `googleId`).
  - Real-time stock validation: out-of-stock product rejected (400), excess quantity on add rejected (400), exact stock stowed (200), over-limit add rejected (400), increment beyond stock rejected (400), explicit quantity beyond stock rejected (400), decrease succeeds (200).
  - Database constraint: single cart per user enforced via MongoDB unique index (`user: 1`, E11000 duplicate key error).
  - Stock clamping on merge: session items exceeding stock safely clamped to max stock; exhausted items skipped.
  - Stock invariance: catalog product stock remains strictly unchanged (5 and 2) after all cart operations.
  - Boundary: exactly 0 orders created during cart operations.
  - HTML manifest and empty state rendering; Jettison All Cargo clears database array.
* Full regression pass (389 assertions passing):
  - Milestone 5.1: 60/60
  - Milestone 4.5: 76/76
  - Milestone 4.4: 75/75
  - Milestone 3.6: 96/96
  - Milestone 3.5: 82/82
* Real browser verification via `browser_subagent` (`phase51_cart_journey_1792156233980.webp`):
  - Buyer login -> Astrolabe store -> stow Gilded Celestial Astrolabe -> view `/cart` with live reserve indicator (`Vault Reserve: 15 available`).
  - Quantity increment (`+`) and decrement (`-`) with real-time recalculation.
  - Multi-island product addition (Aeon Strider Sandals from Chronos Cay).
  - Logout and re-login verifying MongoDB persistent cart retention.
  - Jettison All Cargo (`btnClearHold`) verifying clean transition to empty state (`Your Cargo Hold is Empty, Captain`).
  - 0 unexpected console errors.
* Code health: 21/21 JS files pass `node --check`; 30/30 EJS templates compile cleanly.

## [2026-10-16] — Phase 4 / Milestone 4.5: Seller Profile Management (MILESTONE 4.5 COMPLETE)

### Added & Implemented
* **Seller Profile Management Form & Controller (`controller/sellers.js`::`renderSellerProfile`, `controller/sellers.js`::`updateSellerProfile`, `views/seller/profile.ejs`):**
  - Secured route `GET /seller/profile` using `[authMiddleware, requireSeller]`.
  - Secured update endpoints `POST /seller/profile` and `POST /seller/profile/edit` using `[authMiddleware, requireSeller]`.
  - Reused existing unified `User` model fields: `name`, `storeName`, `homeIsland`, `bio`, `avatar`. No redundant Seller/Merchant models created.
  - Pinned profile updates strictly to authenticated `req.user._id`, ignoring client-submitted body or query IDs.
  - Implemented strict server-side validation:
    - `name`: Required, non-empty, trimmed, max 120 characters.
    - `storeName`: Optional, trimmed, max 120 characters, preserving null convention.
    - `homeIsland`: Must be one of the 6 canonical trading islands (`astrolabe`, `chronos`, `kraken_vault`, `cutlass_cove`, `velvet_isle`, `booty_cay`).
    - `bio`: Optional, trimmed, max 2000 characters, safe EJS escaping.
    - `avatar`: Path or URL, max 500 characters, default `/images/avatars/default-pirate.png`, rejecting malicious protocols (`javascript:`, etc.).
  - Preserved safe submitted values on validation failure with descriptive error banners.
  - Guaranteed account security field immutability: `email`, `password`, `authSecretHash`, `googleId`, and `role` are strictly excluded from updating, preventing privilege escalation.
* **Seller Dashboard Integration (`views/seller/dashboard.ejs`):**
  - Activated "Captain's Profile" action card (`#tileProfile`) linking to `/seller/profile`.
  - Added header quick link (`#headerProfileLink`) across seller portal headers.
  - Storefront title, captain alias, home harbor, avatar, and bio lore synchronize immediately with database changes.
* **Public Storefront Synchronization (`views/seller-discovery.ejs`):**
  - Public storefront (`/seller/:sellerId`) dynamically reflects updated store name, captain alias, home harbor, avatar, and bio lore while maintaining strict credential scrub.
* **Default Avatar Asset (`public/images/avatars/default-pirate.png`):**
  - Added local pirate avatar asset preventing image 404s.

### Tested & Verified
* 76 automated assertions in dedicated test suite `scratch/test_milestone_4_5.js`:
  - RBAC: Unauthenticated redirect to /login (302), buyer access forbidden (403), admin access forbidden (403), seller access granted (200).
  - Profile loading: Current name, storeName, bio, and canonical island load into form.
  - Updates: Name, store name, home island, bio, and avatar update and persist to MongoDB.
  - Validation: Empty name rejected (400), invalid island rejected (400), oversized bio rejected (400), malicious avatar rejected (400), safe values retained.
  - Synchronization: Dashboard and public storefront reflect updated identity.
  - Cross-seller protection: Seller B cannot alter Seller A; caller identity derived strictly from session.
  - Immutability: Role cannot be elevated to admin, email unchanged, password hash untouched, authSecretHash untouched, googleId untouched.
  - Invariants: Product catalog ownership, stock, prices, customer carts, and historical order records/snapshots unaffected.
  - Data leakage audit: Passwords, authSecretHash, and emails never leak into profile or storefront HTML.
* Full regression pass (456 assertions total):
  - Milestone 4.5: 76/76
  - Milestone 4.4: 75/75
  - Milestone 4.3: 78/78
  - Milestone 4.2: 67/67
  - Milestone 4.1: 64/64
  - Milestone 3.6: 96/96
* Real browser verification via `browser_subagent` (`seller_profile_journey_1792153399419.webp`):
  - Login as seller -> Command Deck -> Captain's Profile (`/seller/profile`).
  - Validation error testing with blank name.
  - Successful update with store title, bio, and island.
  - Public storefront synchronization verified.
  - 0 unexpected console errors.
* Static syntax: 21/21 JS files pass `node --check`.
* Templates: 30/30 EJS files compile without errors.
* **Phase 4 is fully verified and COMPLETE.**

## [2026-10-16] — Phase 4 / Milestone 4.4: Merchant Order Management & Fulfillment (MILESTONE 4.4 COMPLETE)

### Added & Implemented
* **Seller Order Management Console (`controller/sellers.js`::`renderSellerOrders`, `views/seller/orders.ejs`):**
  - Secured route `GET /seller/orders` using `[authMiddleware, requireSeller]`.
  - Scoped order queries server-side to the authenticated seller via `Order.findBySeller(req.user._id)` using the compound index `{ "items.seller": 1, status: 1 }`.
  - Exposes strictly the authenticated seller's line items and seller-specific subtotal, while completely filtering out other merchants' items in multi-merchant orders.
  - Real-time seller telemetry counters: Total Manifests, Pending, Confirmed, Processing, Shipped, Delivered, and Cancelled manifests.
  - Interactive status filter bar (`?status=...`).
  - Atmospheric dark-fantasy styling with themed empty state for barren queues.
* **Seller Order Detail View (`controller/sellers.js`::`renderSellerOrderDetail`, `views/seller/order-detail.ejs`):**
  - Secured route `GET /seller/orders/:orderId` using `[authMiddleware, requireSeller]`.
  - Validates ObjectId and ensures seller owns at least one item in the order (cross-seller unauthorized attempts rejected with HTTP 403).
  - Displays manifest header with status and payment status badges.
  - Displays destination port anchorage, sea chart coordinates, recipient explorer name, and recipient navigation notes.
  - Renders historical product snapshots (`item.name`, `item.price`, `item.quantity`, `item.lineTotal`, `item.image`) from `Order.items`.
  - Calculates and renders seller's portion of the order total in Doubloons (`🪙`).
  - Fulfillment Command Operations Deck: dynamic action buttons for valid lifecycle transitions based on `order.canTransitionTo()`.
  - Terminal status notice for delivered or cancelled manifests.
* **Order Status Transition Engine (`controller/sellers.js`::`updateOrderStatus`, `routes/web.js`):**
  - Secured route `POST /seller/orders/:orderId/status` (and alias `POST /seller/orders/:orderId/transition`).
  - Strictly verifies seller has items in the order before executing any status mutation.
  - Authoritatively enforces `models/order.js` lifecycle state machine (`order.canTransitionTo` and `order.transitionTo`):
    - `pending` ➔ `confirmed` | `cancelled`
    - `confirmed` ➔ `processing` | `cancelled`
    - `processing` ➔ `shipped` | `cancelled`
    - `shipped` ➔ `delivered`
  - Rejects invalid or terminal transitions safely without mutating database records.
  - Supports both standard HTML form POSTs (with user feedback redirects) and JSON/AJAX API requests.
* **Command Deck & Navigation Integration (`views/seller/dashboard.ejs`, `views/seller/products.ejs`):**
  - Activated "Dispatch Manifests" action tile (`#tileOrders`) on the Command Deck linking to `/seller/orders`.
  - Added header quick links (`#headerOrdersLink`) across seller portal views.

### Tested & Verified
* 75 automated assertions in `scratch/test_milestone_4_4.js`:
  - Access control: unauthenticated redirect (302), buyer access denied (403), admin access denied (403), seller access granted (200).
  - Multi-seller order isolation: Seller Drake sees only his items; Seller Vane sees only his items; cross-seller access returns 403.
  - Malformed and nonexistent Order ID handling (404).
  - Historical snapshot immutability: modifying Product in DB never alters Order item name or price.
  - Seller-specific subtotal calculations verified against multi-merchant line totals.
  - Valid status transitions verified (`pending` ➔ `confirmed` ➔ `processing` ➔ `shipped` ➔ `delivered`).
  - Invalid transitions safely rejected (e.g. `processing` ➔ `delivered` rejected, status unchanged).
  - Terminal state transitions rejected (delivered/cancelled orders immutable).
  - Cross-seller status modification rejected with HTTP 403.
  - Buyer order data and buyer Cart remain completely intact.
  - Product ownership is immutable.
  - No sensitive credentials leak in rendered HTML (`password`, `authSecretHash`, `googleId`).
* Regression testing:
  - Phase 4.3 regression: 78/78 passed (`scratch/test_milestone_4_3.js`).
  - Phase 4.2 regression: 67/67 passed (`scratch/test_milestone_4_2.js`).
  - Phase 4.1 regression: 64/64 passed (`scratch/test_milestone_4_1.js`).
  - Phase 3.6 regression: 96/96 passed (`scratch/test_milestone_3_6.js`).
  - Total automated assertions: 380/380 passed (100%).
* Real browser verification via `browser_subagent` recording (`seller_order_flow_1792140807014.webp`):
  - Seller login as `admiralty@pirate-civ.internal`.
  - Command Deck inspection verifying active `#tileOrders` Dispatch Manifests.
  - Navigation to `/seller/orders`, inspection of manifest table and telemetry cards.
  - Opened manifest detail, inspected recipient coordinates, notes, snapshot items, and subtotal.
  - Advanced status: Confirm Manifest (`pending` ➔ `confirmed`), verified success banner and persisted status.
  - Advanced status: Begin Processing Cargo (`confirmed` ➔ `processing`), verified status change.
  - Logged out, logged in as buyer (`buyer@pirate-civ.internal`), attempted `/seller/orders`, verified HTTP 403 Forbidden.
  - Verified 0 unexpected console errors/warnings.
* Static syntax checks passed (21/21 JS files).
* Template compilation passed (29/29 EJS views).

---

## [2026-10-16] — Phase 4 / Milestone 4.3: Seller Product Creation (MILESTONE 4.3 COMPLETE)

### Added & Implemented
* **Seller Product Creation Page & Form (`controller/sellers.js`::`renderCreateProduct`, `views/seller/product-create.ejs`):**
  - Secured route `GET /seller/products/new` using `[authMiddleware, requireSeller]`.
  - Built dark-fantasy pirate themed creation form styled consistently with Command Deck and product edit views.
  - Form fields include: authoritative item name, Doubloons price, stock count, canonical category dropdown, canonical island dropdown, image URL/path with default fallback, description, and availability toggle.
  - Form input retention on validation failure preserving user-entered values with clean alerts.
* **Product Creation Submission Handler (`controller/sellers.js`::`createProduct`, `routes/web.js`):**
  - Secured route `POST /seller/products/new` (and alias `POST /seller/products`).
  - Strict seller identity pinning: `product.seller = req.user._id`, discarding any client-provided seller ID.
  - Comprehensive field validation:
    - Name: required, non-empty, trimmed, max 120 chars.
    - Price: required, numeric, non-negative (`>= 0`).
    - Stock: non-negative integer (`>= 0`, default 15).
    - Description: required, non-empty, trimmed, max 2000 chars.
    - Island: canonical 6-island whitelist (`astrolabe`, `chronos`, `kraken_vault`, `cutlass_cove`, `velvet_isle`, `booty_cay`).
    - Category: canonical 3-category whitelist (`relics`, `apparel`, `provisions`).
    - Availability: strict boolean parsing.
    - Image: preserves existing schema architecture (`/images/items/*.png`), avoiding unnecessary upload libraries.
  - Slug safety and collision handling:
    - Deterministic kebab-case slug generator.
    - Pre-save duplicate slug collision check returning HTTP 400 user-friendly alert.
    - Graceful `E11000` duplicate key handling without crashing.
* **Command Deck & Navigation Integration (`views/seller/dashboard.ejs`, `views/seller/products.ejs`):**
  - Activated "Forge New Cargo" action tile (`#tileAddProduct`) in the Command Deck dashboard linking to `/seller/products/new`.
  - Added "Forge Cargo" quick link (`#headerForgeLink`) in Command Deck header.
  - Added "Forge New Cargo" action button (`#btnForgeCargo`) in the product catalog header.
  - Added catalog alert banner acknowledging newly forged wares (`?created=1`).
* **Catalog & Storefront Integration:**
  - Wares created with `isAvailable: true` automatically become visible across the seller's catalog (`/seller/products`), seller's public storefront (`/seller/:sellerId`), canonical island bazaar (`/island/:islandName`), and product detail (`/product/:slug`).
  - Wares created with `isAvailable: false` remain in the seller's vault management catalog but are excluded from public listings.

### Tested & Verified
* 78 automated assertions in `scratch/test_milestone_4_3.js` covering access control, buyer/admin denial, seller authorization, product creation persistence, owner binding, validation constraints (name, price, stock, description, canonical island, canonical category, availability), duplicate slug handling, form input retention, catalog and storefront visibility, detail route lookup, cross-seller editing isolation, cart invariance, and order snapshot preservation (78/78 passed).
* Regression test suites:
  - Phase 4.2 regression: 67/67 passed (`scratch/test_milestone_4_2.js`).
  - Phase 4.1 regression: 64/64 passed (`scratch/test_milestone_4_1.js`).
  - Phase 3 regression: 96/96 passed (`scratch/test_milestone_3_6.js`).
  - Total automated assertions: 305/305 passed.
* Real browser verification via native Chrome DevTools Protocol (CDP) WebSocket:
  - Seller login as `admiralty@pirate-civ.internal`.
  - Command Deck (`/seller/dashboard`) inspection verifying active `#tileAddProduct` tile and `#headerForgeLink`.
  - Navigated to `/seller/products/new`, verified form inputs and canonical dropdowns.
  - Tested invalid form submission (negative price), verified retention and validation banner.
  - Submitted valid product, verified redirect to `/seller/products?created=1` with success banner and new catalog entry.
  - Inspected public storefront (`/seller/:sellerId`), verified new product card visible with correct price and island tag.
  - Inspected product detail (`/product/:slug`), verified item title, Doubloons price, lore description, and seller charter badge.
  - Verified RBAC: logged out, logged in as buyer (`buyer@pirate-civ.internal`), attempted access to `/seller/products/new`, verified HTTP 403 Access Denied.
  - Captured 6 screenshot artifacts; 0 unexpected console errors/warnings.
* Static syntax checks passed (16/16 JS files).
* Template compilation passed (27/27 EJS views).

---

## [2026-10-15] — Phase 4 / Milestone 4.2: Seller Product Management (MILESTONE 4.2 COMPLETE)

### Added & Implemented
* **Seller Product Management Hub (`controller/sellers.js`::`renderSellerProducts`, `views/seller/products.ejs`):**
  - Secured route `GET /seller/products` using `[authMiddleware, requireSeller]`.
  - Queries strictly authenticated seller's products via indexed query `Product.find({ seller: req.user._id }).sort({ createdAt: -1 })`.
  - Renders responsive nautical catalog table with thumbnail images, product names, categories, canonical island origins, Doubloons prices, stock numbers, active/hidden status badges, and management actions (Edit, Toggle Availability, Delete).
  - Displays catalog telemetry summaries (total wares, active wares, unavailable wares).
  - Renders atmospheric empty state (`.products-empty-state`) when the merchant vault has no products.
* **Product Editing Workflow (`controller/sellers.js`::`renderEditProduct`, `updateProduct`, `views/seller/product-edit.ejs`):**
  - Secured routes `GET /seller/products/:productId/edit` and `POST /seller/products/:productId/edit`.
  - Validates ObjectId, loads product, and enforces strict ownership guard via `product.isOwnedBy(req.user)` (rejects cross-seller attempts with HTTP 403).
  - Validates input fields against Product schema constraints (non-empty name/description, numeric non-negative price, non-negative integer stock, canonical 6-island enum, canonical category enum).
  - Persists updates directly to MongoDB and redirects back to `/seller/products` with a success alert banner.
* **Availability Toggling (`controller/sellers.js`::`toggleProductAvailability`):**
  - Secured route `POST /seller/products/:productId/toggle-availability`.
  - Inverts `isAvailable` flag and persists to MongoDB.
  - Automatically synchronizes with public island listings and public storefronts (hidden products immediately disappear from public view while remaining manageable in the seller's console).
* **Safe Product Deletion (`controller/sellers.js`::`deleteProduct`):**
  - Secured route `POST /seller/products/:productId/delete` with strict ownership verification.
  - Safely deletes product from `products` collection via `Product.deleteOne`.
  - Preserves historical order snapshot immutability (`orderItemSchema`: `name`, `price`, `quantity`, `lineTotal`, `seller`, `product`), ensuring past orders and revenues are never altered.
  - Ensures buyer cart resilience (unpopulated products filtered out gracefully).
* **Command Deck & Navigation Updates (`views/seller/dashboard.ejs`, `views/partials/header.ejs`):**
  - Activated "Vault Products" action tile (`#tileManageProducts`) linking directly to `/seller/products`.
  - Added "Products" direct quick link (`#headerProductsLink`) in the Command Deck header actions bar.
  - Maintained Phase 4.3 boundaries (Forge New Cargo remains locked).

### Tested & Verified
* 67 automated assertions in `scratch/test_milestone_4_2.js` covering access control, multi-seller catalog isolation, ownership verification on edit, data persistence in MongoDB, input validation rejection, availability toggling, storefront synchronization, safe deletion, cross-seller deletion rejection, malformed/nonexistent ID guards, historical order snapshot preservation, cart item invariance, and credential exclusion (67/67 passed).
* Regression test suites:
  - Phase 4.1 regression: 64/64 passed (`scratch/test_milestone_4_1.js`).
  - Phase 3 regression: 96/96 passed (`scratch/test_milestone_3_6.js`).
* Real browser verification via subagent:
  - Seller login as `admiralty@pirate-civ.internal`.
  - Navigated to Command Deck (`/seller/dashboard`) and verified "Vault Products" action card and header link.
  - Navigated to `/seller/products` and inspected catalog table.
  - Edited product details (price and description), saved, verified updated data and success banner.
  - Toggled availability to hidden, verified badge updated to "Hidden", opened public storefront (`/seller/:sellerId`) and verified hidden product disappeared.
  - Restored availability to active, verified product reappeared on public storefront.
  - Deleted disposable test product with confirmation, verified row removed from catalog.
  - Logged out seller, logged in as buyer (`buyer@pirate-civ.internal`), attempted to access `/seller/products`, verified HTTP 403 Access Denied.
  - 0 unexpected console errors.
* Static syntax checks passed (16/16 JS files).
* Template compilation passed (25/25 EJS views).

---

## [2026-10-15] — Phase 4 / Milestone 4.1: Seller Portal & Onboarding (MILESTONE 4.1 COMPLETE)

### Added & Implemented
* **Seller Access Control & RBAC (`middleware/roles.js`, `routes/web.js`):**
  - Secured `/seller/dashboard`, `/seller`, and `/seller/portal` using `[authMiddleware, requireSeller]`.
  - Rejects non-seller roles (`buyer`, `admin`) with HTTP 403 Forbidden ("Access denied: insufficient permissions.").
  - Redirects unauthenticated explorers to `/login` (HTTP 302).
  - Aliased `/seller` and `/seller/portal` to redirect directly to `/seller/dashboard`.
  - Prioritized `/seller/dashboard` route ahead of parametric `/seller/:sellerId` in `routes/web.js`.
* **Seller Dashboard Controller (`controller/sellers.js`::`renderSellerDashboard`):**
  - Derives seller identity strictly from authenticated `req.user._id` without relying on client-supplied parameters.
  - Leverages indexed queries (`Product.countDocuments`) to calculate `activeProductCount` (`isAvailable: true`) and `totalProductCount` in parallel without memory bloat.
  - Resolves home harbor lore metadata from `ISLANDS_DATA`.
  - Defensively scrubs sensitive fields (`password`, `authSecretHash`, `googleId`).
* **Reusable Seller Command Deck View (`views/seller/dashboard.ejs`, `public/css/island-store.css`):**
  - Designed full-featured Command Deck adhering to Pirate-Civ dark-fantasy nautical aesthetics.
  - Renders merchant identity hero card (avatar with fallback, store title, captain alias, chartered status, home harbor port link).
  - Displays Merchant Charter Chronicle bio section with graceful fallback for empty lore.
  - Displays 4 telemetry metric cards: Active Listings, Total Catalog, Registry Port, and Guild Standing.
  - Features empty state banner (`Vault Currently Barren`) when catalog count is 0.
  - Renders 4 operations tiles: active "Public Storefront" link (`/seller/:id`) and placeholder tiles (Forge New Cargo Phase 4.3, Vault Inventory Phase 4.3, Dispatch Manifests Phase 4.4).
* **Global Navigation Integration (`views/partials/header.ejs`):**
  - Added conditional `⚓ Command Deck` navigation link (`#navSellerDeck`) rendered exclusively for authenticated sellers (`user.role === 'seller'`).

### Tested & Verified
* 64 automated assertions in `scratch/test_milestone_4_1.js` covering seller access, buyer 403 denial, admin 403 denial, unauthenticated redirect, identity rendering, telemetry counts, unavailable item handling, empty vault state, missing profile fallbacks, user isolation, credential omission, storefront linking, convenience route redirects, stock invariance, and zero order creation (64/64 passed).
* Real browser verification via subagent:
  - Buyer access denied: verified HTTP 403.
  - Seller login: verified Command Deck renders store name, chartered merchant badge, telemetry metrics, and tiles.
  - Storefront navigation: opened public storefront, navigated to product detail, returned to dashboard.
  - Console inspection: clean execution with 0 unexpected errors or warnings.
* Phase 3 regression suite: 96/96 assertions passed (`scratch/test_milestone_3_6.js`).
* Static syntax: all JavaScript files pass `node --check`.
* Template analysis: all 24 EJS templates compile cleanly.

---

## [2026-10-15] — Phase 3 / Milestone 3.6: Buyer Regression & UX Verification (PHASE 3 COMPLETE)

### Added & Verified
* **End-to-End Real Browser Journey Verification:**
  - Authenticated login with test buyer credentials (`buyer@pirate-civ.internal` / `password123`) on port 3000.
  - Full voyage path verified: Login → Astrolabe → Product Detail (`/product/:productId`) → Discover Merchant → Seller Storefront (`/seller/:sellerId`) → Catalog item inspection → Product Detail → Add to Cargo Hold → Cargo Hold Drawer `#storeCartDrawer` animation & real-time badge updates.
  - Full `/cart` manifest verification: itemized table inspection, price line totals, grand total in Doubloons, quantity increment (`+`), quantity decrement (`-`), and individual item discharge.
  - Multi-island product addition: navigated to Chronos Cay, added product to Cargo Hold, verified presence on `/cart`.
  - Session and persistence verification: logged out, logged back in, confirmed persistent cart in MongoDB survived across logout/login sessions.
  - Hold discharge: clicked "Jettison All Cargo", verified empty hold state (`.cart-empty-state`).
  - Canonical island store check: verified all 6 leaf islands (Astrolabe, Chronos, Kraken Vault, Cutlass Cove, Velvet Isle, Booty Cay) load with active MongoDB products, images, Doubloons prices, star ratings, and working links.
  - Verified 0 unexpected console errors or warnings in real browser console.
* **Automated Regression Suite (`scratch/test_milestone_3_6.js`):**
  - 96 automated assertions covering buyer journey, authentication middleware, user cart isolation, price manipulation rejection, stock immutability, zero order creation, and 404 security guards (96/96 passed).
* **Comprehensive Regression Suite:**
  - 695/695 passed across all Phase 3 automated test suites (Milestone 3.1: 160/160, Milestone 3.2: 231/231, Milestone 3.3: 54/54, Milestone 3.4: 72/72, Milestone 3.5: 82/82, Milestone 3.6: 96/96).
* **Scope Boundary:** Phase 4 (Seller platform) and Phase 5 (Checkout, payment, orders) strictly NOT implemented. Phase 3 is officially COMPLETE.

---

## [2026-10-15] — Phase 3 / Milestone 3.5: Persistent Cart Integration (PHASE 3.5 COMPLETE)

### Added & Implemented
* **Persistent Cart Controller (`controller/cart.js`):** Built complete controller handling `getCart`, `addToCart`, `updateCartItem`, `removeCartItem`, and `clearCart`. Dynamically populates authoritative product information from MongoDB (`Product`), ensures non-negative integer quantities, formats safe client payloads, rejects client-side price overrides, and handles guest session carts with automatic migration to MongoDB on login.
* **Optional Authentication Middleware (`middleware/auth.js`):** Exported `optionalAuth` middleware that attaches `req.user` if a valid signed `auth_token` and matching active session exist, but permits unauthenticated visitors to proceed with session carts.
* **RESTful Cart Routes (`routes/web.js`):** Registered `GET /cart`, `POST /cart/add`, `POST /cart/update`, `POST /cart/remove`, and `POST /cart/clear` routes using `optionalAuth`.
* **Dedicated Cargo Hold Manifest Page (`views/cart.ejs`):** Developed full SSR Cargo Manifest view featuring an itemized cargo table, product art, unit valuation in Doubloons, quantity increment/decrement controls, line totals, item discharge buttons, summary manifest card (item count, subtotal, exempt trade port fee, grand total), empty state with link to Sea Chart, and voyage checkout trigger.
* **Client-Side Cargo Engine (`public/js/island-store.js`, `public/css/island-store.css`):** Refactored cart engine to communicate directly with backend `/cart` endpoints. Dynamically syncs topbar Doubloons pill and `#cartCountBadge`, animates the slide-out `#storeCartDrawer`, updates the manifest view on quantity adjustment/removal/jettison, and dispatches toast notifications. Added complete styling for table, controls, and manifest layout.
* **Security & Invariants:** Excludes sensitive user fields (`password`, `authSecretHash`, `googleId`) from all cart responses. Zero stock deductions and zero orders created (Phase 5 boundary strictly maintained).
* **Scope Boundary:** Phase 3.6 / Phase 4 / Phase 5 were strictly NOT implemented.

### Tested & Verified
* 82 automated assertions in `scratch/test_milestone_3_5.js` covering login & initial cart loading, multi-island product additions, quantity increment/decrement, line and grand total calculations, item removal, hold clearing, invalid/unavailable product rejection, user cart isolation, client price override prevention, sensitive field exclusion, guest session cart migration to MongoDB on login, stock invariance, zero order creation, and MongoDB persistence (82/82 passed).
* Interactive browser testing via subagent confirmed multi-island additions, badge and drawer updates, quantity increment/decrement, `/cart` manifest rendering, line totals and grand totals, item removal, persistent MongoDB cart across logout/login, "Jettison All Cargo" empty state, and 0 console errors/warnings.
* Full regression test suite passing across all active milestones (Milestone 3.5: 82/82, Milestone 3.4: 72/72, Milestone 3.3: 54/54, Milestone 3.2: 231/231, Milestone 3.1: 160/160; 599 total passed assertions, 0 failed).
* Static syntax: all JavaScript files passed `node --check`.
* Template analysis: `views/cart.ejs` and all EJS templates compiled cleanly (`ejs.compile`).

---

## [2026-10-15] — Phase 3 / Milestone 3.4: Seller Profile / Storefront (PHASE 3.4 COMPLETE)

### Added & Implemented
* **Public Seller Storefront Controller (`controller/sellers.js`):** Upgraded `renderSellerStorefront` (aliasing `renderSellerDiscovery`, `renderPublicSeller`, `renderSellerProfile`). Queries all available products for the target seller from MongoDB using compound-indexed `Product.find({ seller: seller._id, isAvailable: true }).sort({ createdAt: -1 })`.
* **Reusable Public Storefront Template (`views/seller-discovery.ejs`):** Developed full-featured public storefront rendering merchant identity header (avatar, store title, captain alias, chartered merchant badge, Admiralty Guild verification), badged home harbor linking to canonical island (`/island/:homeIsland`), merchant bio chronicle, active product listing telemetry count, and complete catalog grid.
* **Storefront Product Cards (`views/seller-discovery.ejs`, `public/css/island-store.css`):** Each card renders real MongoDB product art, title, Doubloons valuation, star rating, stock telemetry badge (`In Vaults`, `Low Reserve`, `Barren`), direct links to `/product/:productId`, and "Stow in Cargo" buttons (`.btn-add-cart`) integrated with `#storeCartDrawer`.
* **Themed Empty Storefront State (`views/seller-discovery.ejs`, `public/css/island-store.css`):** Displays atmospheric "Harbor Vaults Currently Barren" empty state when a valid merchant has zero active wares, preventing broken templates or crashes.
* **Catalog Isolation & Availability Filtering:** Guarantees that only products belonging to the merchant are displayed; other sellers' wares and unavailable products (`isAvailable: false`) are strictly excluded.
* **Security & Safe 404 Guards:** Enforces `mongoose.isValidObjectId(sellerId)` and `role: "seller"`. Malformed IDs, nonexistent sellers, or non-seller users return clean 404 responses without CastError or stack trace leaks. Strictly strips sensitive credentials (`password`, `authSecretHash`, `googleId`).
* **Route Binding (`routes/web.js`):** Bound `GET /seller/:sellerId` with `authMiddleware` pointing to `renderSellerStorefront`.

### Tested & Verified
* 72 automated assertions in `scratch/test_milestone_3_4.js` covering seller loading, complete catalog retrieval, multi-seller isolation, unavailable product exclusion, empty storefront state, credential security, malformed/nonexistent/non-seller 404 handling, and stock invariance (72/72 passed).
* Live SSR verification script `scratch/verify_live_ssr_3_4.js` executed on port 3000 verifying canonical storefront, multi-seller isolation, empty storefront state, and 404 guards.
* End-to-end browser verification via subagent recording navigation from Island ➔ Product Detail ➔ Click "📜 DISCOVER MERCHANT" ➔ Full Storefront with 32 wares ➔ Clicked catalog product ➔ Product Detail ➔ Cargo Hold interaction with 0 console errors (`seller_storefront_3_4_1792059622743.webp`).
* Full regression test suite passing across all milestones (1,215/1,215 assertions passed; 1,287 total passed across entire project).
* Static syntax: 20/20 JavaScript files passed `node --check`.
* Template analysis: 22/22 EJS templates compiled cleanly (`ejs.compile`).

---

## [2026-10-15] — Phase 3 / Milestone 3.3: Explorer → Seller Discovery (PHASE 3.3 COMPLETE)

### Added & Implemented
* **Seller Discovery Controller (`controller/sellers.js`):** Created `renderSellerDiscovery` (and alias `renderPublicSeller`) controller actions exporting seller discovery logic. Validates seller identifier using `mongoose.isValidObjectId(sellerId)`. Queries MongoDB `User` with indexed `_id` and strict `role: 'seller'` enforcement. Malformed IDs, nonexistent IDs, or non-seller users return clean HTTP 404 responses without database exceptions or `CastError` leaks.
* **Reusable Seller Discovery View (`views/seller-discovery.ejs`):** Developed a nautical discovery view displaying merchant identity, `⚓ CHARTERED GUILD MERCHANT` badge, home harbor affiliation badge with lore name, bio chronicle (`bio`), active trade listing telemetry count (`totalListings`), sample chartered wares preview grid (up to 4 items), breadcrumb navigation back to Sea Chart / origin island, and integrated slide-out Cargo Hold drawer.
* **Phase 3.4 Scope Boundary Notice Banner (`views/seller-discovery.ejs`):** Prominently displays an atmospheric notice banner informing buyers that this page is in Discovery Mode and that full storefront banners, comprehensive product catalogs, and review systems will dock in Milestone 3.4. (Phase 3.4 was strictly NOT implemented).
* **Product Detail Entry Points (`views/product-detail.ejs`, `public/css/island-store.css`):** Enriched the merchant card on the Product Detail page with clickable avatar links (`.seller-avatar-link`), clickable store name links (`.seller-name-link`), and a dedicated `📜 DISCOVER MERCHANT` action button (`.btn-discover-seller`) linking to `/seller/:sellerId`. Safely handles unpopulated or missing seller scenarios without crashing.
* **Route Registration (`routes/web.js`):** Bound `GET /seller/:sellerId` with `authMiddleware` matching `docs/05_ROUTE_MAP.md`.
* **Security & Credential Protection:** Public seller document strictly sanitizes credentials (`password`, `authSecretHash`, `googleId` omitted).
* **Inventory & Stock Immutability:** Discovering a seller or viewing sample wares never mutates product stock or status.

### Tested & Verified
* 54 automated assertions in `scratch/test_milestone_3_3.js` covering seller relationship, real ObjectId resolution, multi-merchant isolation, credential exclusion, non-seller 404 handling, malformed ObjectId 404 handling, live SSR HTTP rendering, and product detail link integration (54/54 passed).
* Live SSR verification script `scratch/verify_live_ssr_3_3.js` executed against dev server on port 3000 verifying multi-island discovery flows, credential safety, and 404 guards.
* End-to-end browser verification via subagent recording navigation from Island ➔ Product Detail ➔ Click "📜 DISCOVER MERCHANT" ➔ Seller Discovery page across Astrolabe Atoll and Cutlass Cove with 0 console errors (`seller_discovery_3_3_1792044976709.webp`).
* Full regression test suite passing across all milestones (1,161/1,161 assertions passed; 1,215 total passed across entire project).
* Static syntax: 20/20 JavaScript files passed `node --check`.
* Template analysis: 22/22 EJS templates compiled cleanly (`ejs.compile`).

---

## [2026-10-15] — Phase 3 / Milestone 3.2: Reusable Product Detail Page (PHASE 3.2 COMPLETE)

### Added & Implemented
* **Reusable Product Details Controller (`controller/products.js`):** Created `renderProductDetail` controller action exporting clean, modular product resolution logic. Validates product identifiers using a safe dual strategy: MongoDB `ObjectId` (`mongoose.isValidObjectId`) or URL slug (`/^[a-z0-9]+(?:-[a-z0-9]+)*$/i`). Malformed or nonexistent identifiers return clean HTTP 404 responses without database exceptions or `CastError` leaks.
* **Single Reusable Detail View (`views/product-detail.ejs`):** Developed one comprehensive, responsive EJS view for all marketplace items across all 6 canonical islands. Displays visual artifact showcase with radial glowing halo, island origin badge, category pill, guild repute badge, Doubloons price valuation (`🪙 XX Doubloons`), three-tier stock telemetry (`In Vaults`, `Low Reserve`, `Barren`), full safe-escaped description, and populated seller store info (`name`, `storeName`, `homeIsland`, `avatar`).
* **Route Registration (`routes/web.js`):** Bound `GET /product/:productId` with `authMiddleware` matching `docs/05_ROUTE_MAP.md`.
* **Island Listing Product Links (`views/*.ejs`, `public/css/island-store.css`):** Connected all dynamic product cards across all 6 canonical island views (`astrolabe`, `chronos`, `kraken_vault`, `cutlass_cove`, `velvet_isle`, `booty_cay`) to `/product/:id` via clickable image wrappers (`.item-asset-link`), title links (`.item-title-link`), and dedicated action buttons (`.btn-card-details`).
* **Product Detail Styles (`public/css/island-store.css`):** Added comprehensive nautical styling for `.product-detail-wrapper`, `.detail-nav-bar`, `.detail-breadcrumbs`, `.detail-container`, `.detail-visual-col`, `.detail-asset-box`, `.detail-asset-img`, `.detail-pills-row`, `.detail-pill`, `.detail-info-col`, `.detail-title`, `.detail-price-box`, `.detail-stock-row`, `.stock-badge`, `.detail-desc-box`, `.detail-seller-box`, `.detail-actions-bar`, `.btn-detail-add-cart`, `.btn-detail-wishlist`, `.btn-detail-back`, and mobile responsive media queries.
* **Security & Credential Protection:** Populated seller document strictly excludes sensitive fields (`password`, `authSecretHash`, `googleId`).
* **Stock Immutability:** Viewing a product never mutates stock, quantities, or database availability states.
* **Cargo Hold Cart Integration:** Integrated Cargo Hold slide-out drawer (`#storeCartDrawer`) and unified `island-store.js` engine on the product detail page, allowing seamless "Stow in Cargo Hold" action and drawer interactions.

### Tested & Verified
* 231 focused automated assertions in `scratch/test_milestone_3_2.js` covering product retrieval across all 6 canonical islands, ObjectId & slug queries, unavailable product exclusion (`isAvailable: false`), malformed identifier 404 handling, stock invariance, seller secret protection, unauthenticated 302 redirects, live HTTP SSR rendering, and island card navigation links (231/231 passed).
* 87 live SSR assertions in `scratch/verify_live_ssr_3_2.js` executed against running server (87/87 passed).
* End-to-end browser verification via subagent recording user registration, login, navigation to `/astrolabe`, clicking `🔍 DETAILS`, verifying detail elements, adding item to cargo hold, opening/closing cart drawer, navigating back to island, opening product on `/chronos`, and verifying 0 console errors (`product_detail_check_1792042442719.webp`).
* Full regression test suite passing across all milestones (1,161/1,161 assertions passed, 100%).
* Static syntax: 19/19 JavaScript files passed `node --check`.
* Template analysis: 21/21 EJS template files compiled cleanly (`ejs.compile`).

---

## [2026-10-15] — Phase 3 / Milestone 3.1: Dynamic Island Listings (PHASE 3.1 COMPLETE)

### Added & Hardened
* **Dynamic Island Listings (`controller/islands.js`):** Island store pages for all 6 canonical islands (`astrolabe`, `chronos`, `kraken_vault`, `cutlass_cove`, `velvet_isle`, `booty_cay`) are now genuinely dynamic, backed strictly and exclusively by the MongoDB `Product` model via direct indexed query `Product.find({ island: normalizedKey, isAvailable: true }).sort({ createdAt: 1 }).lean()`.
* **Decoupled Architecture & Catalog Stripping (`controller/islands.js`):** Static product arrays are explicitly stripped from `ISLANDS_DATA` metadata prior to template dispatch (`const { products: _staticCatalog, ...cleanIslandMeta } = islandMeta;`), ensuring zero fallback to or leakage of outdated hardcoded data.
* **Canonical Whitelist Validation & Safe 404 Handling (`controller/islands.js`):** Enforces canonical island slug validation against `CANONICAL_ISLANDS`, returning clean HTTP 404 responses without database query execution or stack trace leakage for invalid inputs.
* **Themed Empty States (`views/*.ejs`, `public/css/island-store.css`):** Added `.store-empty-state`, `.store-empty-icon`, `.store-empty-title`, and `.store-empty-desc` CSS styles and updated all 6 island EJS templates to render graceful, atmospheric empty states when an island has zero available products.
* **Unified Doubloon Pricing (`views/velvet_isle.ejs`, `views/booty_cay.ejs`):** Standardized currency display across Velvet Isle and Booty Cay to use Doubloons (`🪙 XX Doubloons`) matching the canonical economy of Pirate-Civ.
* **Underscore Alias Direct Routes (`routes/web.js`):** Added `/kraken_vault`, `/cutlass_cove`, `/velvet_isle`, and `/booty_cay` shorthand routes matching `docs/05_ROUTE_MAP.md`.

### Tested & Verified
* 160 focused automated assertions in `scratch/test_milestone_3_1.js` covering database queries, availability filtering, cross-island product isolation, security exclusions (no password or secret leakage), empty state handling, and live Express HTTP SSR verification across all routes and invalid cases (160/160 passed).
* 65 live SSR assertions in `scratch/verify_live_ssr.js` against running dev server on port 3000 (65/65 passed).
* Interactive browser testing via subagent: verified page load, product card rendering, images, prices, ratings, Add to Cart interaction, toast alerts, cart drawer contents, and zero console errors.
* Full regression test suite passing across all active milestones: Milestone 3.1 (160/160), Pre-Phase 3 Gate (76/76), Milestone 2.6 (166/166), Milestone 2.5 (283/283), Milestone 2.4 (85/85), Milestone 2.3 (42/42), Milestone 2.2 (42/42), Milestone 2.1 (31/31), Phase 1 (45/45). Total: 930/930 passed (100%).
* Static analysis: 18/18 JavaScript files passed syntax check (`node --check`).
* Template analysis: 20/20 EJS template files compiled cleanly (`ejs.compile`).

---

## [2026-10-11] — Pre-Phase 3 Release Gate: Full Codebase Audit, Integration Verification & Hardening

### Added & Hardened
* **Database Connection Singleton & Lifecycle (`config/db.js`):** Added connection guard (`readyState === 1`) preventing duplicate connections on repeat calls. Added connection drop listeners (`disconnected`, `error`) and exported `disconnectDB()` helper with process signal hooks (`SIGINT`, `SIGTERM`) for graceful process exits.
* **Centralized Express Error Handling (`index.js`):** Registered global error middleware `(err, req, res, next)` logging server-side errors and rendering themed client responses while strictly suppressing internal stack traces, filesystem paths, and secrets.
* **Styled 404 Catch-All Middleware (`index.js`):** Registered catch-all 404 middleware after routes, replacing default raw Express "Cannot GET" responses with styled HTML templates.
* **JSON Body Parser (`index.js`):** Added `server.use(express.json())` alongside URL-encoded parser to safely parse incoming JSON payloads.
* **Environment Template (`.env.example`):** Verified presence of template with safe placeholder values for `PORT`, `MONGO_URI`, `SESSION_SECRET`, `COOKIE_SECRET`, and `NODE_ENV`.
* **Audit Documentation (`docs/18_CODEBASE_AUDIT.md`):** Authored 24-section comprehensive pre-phase release gate audit report.

### Audited & Verified
* Static syntax checked across all 18 JavaScript files (`node --check`) with 100% pass rate.
* Template compilation checked across all 20 EJS views (`ejs.compile`) with 100% pass rate.
* Dependency review (`npm audit`) and security credential leakage checks verified.
* Role-based authorization matrix (`anonymous`, `buyer`, `seller`, `admin`) verified with 403 enforcement.
* Model validations tested across all 5 Mongoose models (`User`, `Product`, `Cart`, `Order`, `Contact`).
* Failure-injection tests executed (invalid URIs, malformed ObjectIds, invalid quantities, negative prices, duplicate emails).
* 76 focused hardening assertions in `scratch/test_pre_phase_3_gate.js` passed (76/76).
* Full regression suite passing across all milestones: Milestone 2.6 (166/166), Milestone 2.5 (283/283), Milestone 2.4 (85/85), Milestone 2.3 (42/42), Milestone 2.2 (42/42), Milestone 2.1 (31/31), Phase 1 (45/45). Total: 770/770 passed (100%).

---

## [2026-10-11] — Phase 2 / Milestone 2.6: Database Integration & Core API/SSR Verification (PHASE 2 COMPLETE)

### Added
* Integrated MongoDB `Product` model into `renderIslandPage` controller action in `controller/islands.js`. The 6 island store views (`astrolabe`, `chronos`, `kraken_vault`, `cutlass_cove`, `velvet_isle`, `booty_cay`) now dynamically query and render live products from MongoDB while preserving static cartographic lore and metadata.
* Formatted Mongoose product documents with complete EJS compatibility (`id`, `_id`, `name`, `slug`, `price`, `priceNum`, `desc`, `description`, `image`, `island`, `category`, `stock`, `isAvailable`, `rating`, `seller`).
* Added `/home` route in `routes/web.js` rendering `views/home.ejs` with `authMiddleware` guard per `docs/05_ROUTE_MAP.md`.
* Added `/islands` overview redirect in `routes/web.js` pointing to `/#sea-chart-section` with `authMiddleware` guard.
* Verified stock invariance: product reads, island page SSR renders, persistent cart operations, and order snapshot creations strictly preserve inventory (`Product.stock` is invariant).
* Verified security & secret exclusions: User password hashes and auth secret tokens are strictly omitted from population and view data.

### Tested
* 166 focused automated tests in `scratch/test_milestone_2_6.js` covering collection access, 32-product catalog presence, canonical merchant seller ownership, taxonomy, controller SSR product injection, invalid island 404 handling, persistent cart with real MongoDB products, order model integration with real products, HTTP test server with unauthenticated 302 redirects, session login, and authenticated 200 OK SSR responses across `/`, `/home`, `/about`, `/contact`, `/users`, and all 6 island store views (166/166 passed).
* Full regression test suite passing across all Phase 1 and Phase 2 milestones: Milestone 2.5 (283/283), Milestone 2.4 (85/85), Milestone 2.3 (42/42), Milestone 2.2 (42/42), Milestone 2.1 (31/31), Phase 1 (45/45). Total: 694/694 passed.
* Verified manual dev server startup and MongoDB connection.

---

## [2026-10-11] — Phase 2 / Milestone 2.5: Controlled Migration of Existing Hardcoded Products

### Added
* Created dedicated, idempotent product migration script `scripts/seedProducts.js` importing the complete 32-item hardcoded catalog from `controller/islands.js` into MongoDB.
* Bootstrapped canonical merchant `Grand Admiralty Cartographers` (`admiralty@pirate-civ.internal`, `role: "seller"`, `homeIsland: "astrolabe"`) with idempotent user lookup and creation.
* Implemented deterministic, URL-safe kebab-case slug generator (`generateDeterministicSlug`) ensuring 100% collision-free slugs across the product catalog.
* Normalized product taxonomy across all 6 canonical islands (`astrolabe`, `chronos`, `kraken_vault`, `cutlass_cove`, `velvet_isle`, `booty_cay`) and 3 categories (`relics`, `apparel`, `provisions`).
* Cleaned and normalized Doubloon prices from comma-separated strings (`"24,999"`) into positive integers (`24999`).
* Preserved visual star rating strings (`"★★★★★"`, `"★★★★☆"`) and original asset image paths (`/images/items/*.png`).
* Implemented idempotent upsert algorithm preserving existing stock levels across repeat runs without deleting database documents.
* Pre-validated all product objects against Mongoose `Product` schema rules before persistence.

### Tested
* 283 focused automated tests in `scratch/test_milestone_2_5.js` covering source catalog extraction, taxonomy mapping, slug uniqueness, canonical merchant bootstrap, first-run insertions, second-run idempotency, seller ownership, stock preservation, and data integrity (283/283 passed).
* Full regression test suite passing: Milestone 2.4 (85/85), Milestone 2.3 (42/42), Milestone 2.2 (42/42), Milestone 2.1 (31/31), Phase 1 (45/45). Total: 528/528 passed.
* Verified live MongoDB development database idempotency: Run 1 created 32 items; Run 2 updated 32 items with 0 duplicates (total count strictly 32).

---

## [2026-10-11] — Phase 2 / Milestone 2.4: Order Model & Order Lifecycle Foundation

### Added
* Created foundational Mongoose `Order` model in `models/order.js` linked to unified `User` model (`buyer: { type: ObjectId, ref: 'User' }`).
* Implemented embedded `orderItemSchema` storing historical snapshots of purchased products (`name`, `price`, `quantity`, `lineTotal`, `seller`, `image`, `product`).
* Enforced historical snapshot data integrity: changes to `Product` (name, price, stock) after purchase do not mutate or recalculate historical order line items or totals.
* Implemented controlled order lifecycle enum (`pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`) with permitted state machine transitions map (`PERMITTED_STATUS_TRANSITIONS`).
* Added lifecycle helpers `order.canTransitionTo(targetStatus)` and `order.transitionTo(targetStatus)` to validate and execute permitted status transitions.
* Implemented Doubloon payment status foundation (`paymentStatus: ['pending', 'paid', 'failed', 'refunded']`, default `'pending'`).
* Implemented shipping address schema requiring `portName` and providing default `islandCoordinates` and `recipientNotes`.
* Added compound indexes `{ buyer: 1, createdAt: -1 }` (for buyer order history sorting) and `{ "items.seller": 1, status: 1 }` (for merchant order fulfillment queues).
* Implemented static query helpers `Order.findByBuyer(buyerId, filter)` and `Order.findBySeller(sellerId, filter)`.
* Verified stock invariance: order operations do not mutate or deduct `Product.stock`.
* Verified security credential protection: population strictly omits `password` and `authSecretHash`.

### Tested
* 85 focused automated tests in `scratch/test_milestone_2_4.js` covering schema validation, required fields, embedded items, positive integer quantities, negative price/total rejections, auto-calculated line totals/subtotals, lifecycle state machine transitions, invalid status rejections, live MongoDB multi-seller orders, historical data immutability, stock invariance, query isolation, and credential-free population (85/85 passed).
* Regression test suite covering Milestone 2.3 (42/42 passed), Milestone 2.2 (42/42 passed), Milestone 2.1 (31/31 passed), and Phase 1 full suite (45/45 passed). Total: 245/245 tests passed.

---

## [2026-10-11] — Phase 2 / Milestone 2.3: Persistent Cart (Cart Model & Session Integration)

### Added
* Created persistent Mongoose `Cart` model in `models/cart.js` linked to unified `User` model (`user: { type: ObjectId, ref: 'User', unique: true }`).
* Implemented embedded `cartItemSchema` referencing `Product` (`ref: 'Product'`) with positive integer quantity validation (`min: 1`, `Number.isInteger`).
* Implemented `cart.addItem(productId, quantity)` instance method normalizing duplicate entries and merging quantities automatically.
* Implemented `cart.removeItem(productId, quantity)` instance method to decrement or completely remove items.
* Implemented `Cart.findByUser(userId)` static query helper for fast indexed cart lookups.
* Implemented `Cart.mergeSessionCart(userId, sessionCart)` static method and integrated it into `loginUser` in `controller/auth.js` to migrate guest session carts into MongoDB upon authentication.
* Enforced safe error resilience during cart migration: nonexistent products and invalid quantities are skipped without interrupting the login flow.
* Verified that stock is unaffected by cart operations (`Product.stock` is invariant to cart additions).

### Tested
* 42 focused automated tests in `scratch/test_milestone_2_3.js` covering Cart creation, unique user index, quantity validation (0, -1, 1.5 rejected), duplicate item merging, `findByUser`, user isolation, session cart migration, dirty item filtering, and stock invariance (42/42 passed).
* Regression test suite covering Milestone 2.2 (42/42 passed), Milestone 2.1 (31/31 passed), and Phase 1 full suite (45/45 passed).

---

## [2026-10-11] — Phase 2 / Milestone 2.2: Seller ↔ Product Relationship

### Added
* Formalized the seller-ownership relationship between the unified `User` model (`role: 'seller'`) and `Product` in `models/product.js` via `seller: ObjectId` reference (`ref: 'User'`).
* Implemented `Product.findBySeller(sellerId, filter)` static query helper, leveraging the `{ seller: 1, createdAt: -1 }` compound index for fast merchant catalog retrieval sorted by newest item first.
* Implemented `product.isOwnedBy(userOrId)` instance method providing robust, type-safe ownership verification supporting populated User documents, raw ObjectIds, and string comparisons.
* Verified query isolation ensuring merchant queries never leak items across sellers, and empty sellers return an empty array `[]`.
* Verified Mongoose `.populate('seller')` resolution and demonstrated strict exclusion of authentication secrets (`password`, `authSecretHash`).

### Tested
* 42 automated tests covering schema ownership, ObjectId comparison, `isOwnedBy` helper, static `findBySeller`, empty seller handling, live MongoDB query isolation, population with secret exclusion, and Milestone 2.1 model regression checks (42/42 passed).
* Full regression test suite passing (45/45 passed).

---

## [2026-10-11] — Phase 2 / Milestone 2.1: Product Model & Category/Island Structure

### Added
* Created foundational Mongoose `Product` model in `models/product.js`.
* Modeled product-to-seller relationship referencing the unified `User` model (`ref: 'User'`).
* Canonical island taxonomy enum enforcing the 6 official islands: `astrolabe`, `chronos`, `kraken_vault`, `cutlass_cove`, `velvet_isle`, and `booty_cay`.
* Automated slug generation hook/default in kebab-case ensuring human-readable URL identifiers.
* Price validation denominated in Doubloons (`min: 0`), non-negative integer stock validation (`Number.isInteger`), and default availability (`isAvailable: true`).
* Strategic compound indexes for marketplace performance: `{ island: 1, isAvailable: 1 }` (for island storefronts) and `{ seller: 1, createdAt: -1 }` (for merchant inventory management).
* Exported canonical taxonomy arrays (`CANONICAL_ISLANDS`, `TRADING_BRANCHES`) for system-wide consistency.

### Tested
* 31 automated unit test assertions covering valid product creation, required fields, ObjectId seller references, non-negative price constraints, integer stock enforcement, canonical island enum checks, auto-slug generation, timestamps, and index configurations (31/31 passed).
* Full regression test suite passing (45/45 passed).

---

## [2026-10-10] — Phase 1 / Milestone 1.3: Authentication UX, Error Handling & Bug Cleanup

### Added
* Human-readable authentication error UX in `controller/auth.js`, rendering errors on the same page with retained input fields (`name`, `email`) rather than raw string responses (`res.send(...)`).
* Styled dark-fantasy alert banners (`.auth-error-banner`, `.error-icon`) in `public/css/auth.css`, matching the atmospheric nautical aesthetics across `views/login.ejs` and `views/register.ejs`.
* "Remember Me" checkbox on the login page wrapped in flexible `.auth-options` row with "Forgot your map key?".
* Server-side dynamic session and signed cookie `auth_token` lifetime handling: 30 days (`maxAge: 1000 * 60 * 60 * 24 * 30`) when Remember Me is selected; 24 hours standard session when unchecked.
* Defensive duplicate account detection catching both pre-validation duplicates and MongoDB `E11000` duplicate key errors without leaking stack traces or database internals.
* Registration success workflow redirecting explorers directly to `/login`.

### Fixed
* Removed rogue markdown code fences (````html` and ````) from `views/contact.ejs`.
* Replaced generic placeholder content in `views/about.ejs` with authentic Pirate-Civ dark-fantasy nautical lore, archipelago cards, and merchant narrative.
* Purged dead university mock student array (`studentInfo` and `student_data`) from home route `/` in `routes/web.js`.

### Tested
* 40 automated test assertions across all 10 verification scenarios: login success/failure, registration validation, duplicate handling, Remember Me 30-day persistence vs 24-hour session, protected routes, role middleware integration, Contact HTML syntax, and About lore content (40/40 passed).
* Live server boot and HTTP route responses verified (`/login` 200, `/register` 200).

---

## [2026-10-10] — Phase 1 / Milestone 1.2: Role-Based Authorization Middleware

### Added
* Created `middleware/roles.js` exporting `requireRole(...allowedRoles)`, `requireSeller`, `requireBuyer`, and `requireAdmin`.
* Support for single and multiple role checks (e.g. `requireRole('seller')`, `requireRole('seller', 'admin')`).
* Defensive handling for unauthenticated requests (redirects to `/login` without runtime exceptions).
* Explicit role enforcement: rejected roles respond with HTTP 403 Forbidden without role-inheritance leakage.

### Tested
* 26 automated unit test assertions covering seller access, buyer access, admin access, unauthorized role rejections, multi-role arrays, missing user redirects, and invalid/undefined role handling (26/26 passed).
* Node syntax check on `middleware/roles.js` (`node --check middleware/roles.js`).

### Remaining
* Phase 1 — Milestone 1.3: Authentication UX, Error Handling & Bug Cleanup (`views/contact.ejs` ticks, `views/about.ejs` copy, `routes/web.js` mock cleanup).

---

## [2026-10-10] — Phase 1 / Milestone 1.1: Unified User Schema Foundation

### Added
* `role` field to `models/user.js` (`['buyer', 'seller', 'admin']`) defaulting to `'buyer'`.
* Optional merchant profile fields to `models/user.js`: `storeName`, `homeIsland`, `bio`, and `avatar`.
* `googleId` field with sparse unique index to `models/user.js` for future Google OAuth support.
* Permanent engineering workflow rules document: `docs/17_DEVELOPMENT_WORKFLOW_RULES.md`.

### Changed
* User schema evolved into unified foundation supporting both buyer and seller personas without splitting into multiple auth models.

### Tested
* 25 automated schema test assertions covering default buyer role, seller profile fields, admin role, invalid role rejection, googleId sparse indexing, and legacy auth field validation (all passed).
* Node syntax check on application entry point (`node --check index.js`).

### Remaining
* Phase 1 — Milestone 1.2: Role-Based Authorization Middleware (`middleware/roles.js`).

---

## [2026-10-10] — Documentation Foundation & Project Memory Setup

### Added
* Established complete `/docs` project memory architecture (18 foundational documents).
* Comprehensive product vision and world bible covering Grand Bazaar and the 6 leaf islands (`00_PROJECT_VISION.md`).
* Exhaustive audit-based reality report across Complete, Partial, Frontend-Only, Broken, and Missing tiers (`01_PROJECT_STATUS.md`).
* 6-phase master implementation roadmap with cardinal phase rule (`02_MASTER_ROADMAP.md`).
* System architecture specification for Express 5 + EJS + MongoDB MVC pipeline (`03_ARCHITECTURE.md`).
* Unified User model and Mongoose schema definitions for User, Product, Cart, Order, and Contact (`04_DATABASE_DESIGN.md`).
* Complete HTTP route registry with auth and role middleware requirements (`05_ROUTE_MAP.md`).
* Detailed technical and functional specifications for 20 platform features (`06_FEATURE_SPECIFICATION.md`).
* Buyer system workflow, sea chart preservation, and reusable product detail specifications (`07_BUYER_SYSTEM.md`).
* Seller platform workflow, command deck metrics, and product CRUD ownership rules (`08_SELLER_SYSTEM.md`).
* Authentication, RBAC middleware, signed cookies, and Google OAuth strategy (`09_AUTHENTICATION.md`).
* Product catalog taxonomy, Doubloons currency, and controlled seed migration plan (`10_PRODUCT_SYSTEM.md`).
* Persistent cart, checkout atomicity, and multi-merchant order state machine (`11_CART_AND_ORDER_SYSTEM.md`).
* UI/UX visual guidelines, nautical tokens, Cinzel/Inter typography, and UX state rules (`12_UI_UX_GUIDELINES.md`).
* 15 Cardinal Engineering Rules and pre-commit verification checklist (`13_DEVELOPMENT_RULES.md`).
* Architectural Decision Records covering Decisions 001 through 007 (`14_DECISION_LOG.md`).
* Active short-term memory document for session handoffs (`16_CURRENT_TASK.md`).
* Documentation directory index and reading order (`README.md`).

### Changed
* Project memory formalized inside repository root.

### Fixed
* Documented existing defects for scheduled resolution in Phase 1 (contact form markdown tick wrapper bug, about page copy mismatch, and unused mock student data).

### Tested
* Verified all 18 documentation files exist with cross-referencing integrity.

### Remaining
* Phase 1: Foundation & Authentication execution (Unified user role schema, RBAC middleware, login error styling, Remember Me, Google OAuth, bug fixes).

---

## [2026-10-10] — Initial Audit Baseline

### Added
* Initial read-only discovery audit performed on the entire repository.

### Confirmed Existing Reality
* **Express 5 & MongoDB:** Active server with working Mongoose connection.
* **Authentication:** Bcrypt password hashing and SHA-256 secret token with signed cookie active, but missing roles and Remember Me logic.
* **Buyer Frontend:** Rich visual presentation for Home Sea Chart (`home.ejs`, `mindmap.js`) and 6 leaf islands (`astrolabe`, `chronos`, `kraken_vault`, `cutlass_cove`, `velvet_isle`, `booty_cay`).
* **Catalog Data:** Products are hardcoded in JavaScript files (`ISLANDS_DATA`, `REALM_DATA`); zero products exist in MongoDB.
* **Cart System:** Add to Cart operates exclusively in browser `localStorage`.
* **Checkout:** Simulated alert; zero order generation.
* **Seller System:** 0% implemented (no model, no dashboard, no product CRUD, no fulfillment).
* **Orders & Profiles:** Completely missing.
* **Defects Identified:** Contact view has rogue markdown wrapper ticks; About page has generic placeholder content; Home route passes dead student mock array.
