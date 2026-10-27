# 🏴‍☠️ 05_ROUTE_MAP — Comprehensive HTTP Route Map

This document catalogues every HTTP route within Pirate-Civ, defining its method, controller action, middleware guards, authentication status, and role requirements.

---

## 1. Gateway & Public Experience Routes

| Method | Route | Controller | Middleware | Purpose | Auth Req? | Role Req? |
|---|---|---|---|---|:---:|:---:|
| `GET` | `/` | Inline (`gateway.ejs`) | `optionalAuth` | Cinematic Interactive Pirate-Map Gateway (Dual fork to Merchant `/seller/dashboard` vs Buyer `/home`) | Optional | Any |
| `GET` | `/about` | Inline (`about.ejs`) | `optionalAuth` | Guild lore, cartography story, mission | No | Public |
| `GET` | `/contact` | Inline (`contact.ejs`) | `authMiddleware` | Inquiries, support, message dispatch form | Yes | Any |
| `POST` | `/contact` | `contact.js::saveContactDetails`| `authMiddleware` | Persists contact inquiry into MongoDB | Yes | Any |

---

## 2. Authentication & Session Routes

| Method | Route | Controller | Middleware | Purpose | Auth Req? | Role Req? |
|---|---|---|---|---|:---:|:---:|
| `GET` | `/buyer/login` | `auth.js::renderBuyerLogin` | `optionalAuth` | Dedicated Buyer Explorer Login Page | No | Guest |
| `POST` | `/buyer/login` | `auth.js::loginBuyer` | None | Validates buyer credentials, issues session & cookie | No | Guest (Buyer role enforced) |
| `GET` | `/buyer/register` | `auth.js::renderBuyerRegister` | `optionalAuth` | Dedicated Buyer Explorer Commission Page | No | Guest |
| `POST` | `/buyer/register` | `auth.js::registerBuyer` | None | Creates new Explorer/Buyer account (forces `role: 'buyer'`) | No | Guest |
| `GET` | `/seller/login` | `auth.js::renderSellerLogin` | `optionalAuth` | Dedicated Merchant Armator Command Deck Login Page | No | Guest |
| `POST` | `/seller/login` | `auth.js::loginSeller` | None | Validates seller credentials, issues session & cookie | No | Guest (Seller role enforced) |
| `GET` | `/seller/register` | `auth.js::renderSellerRegister`| `optionalAuth` | Dedicated Merchant Armator Fleet Charter Page | No | Guest |
| `POST` | `/seller/register` | `auth.js::registerSeller` | None | Creates new Merchant account (forces `role: 'seller'`, mandates `storeName`) | No | Guest |
| `GET` | `/auth/google` | `googleAuth.js::initiateGoogleAuth` | None | Initiates Google OAuth with cryptographically signed intent state | No | Any |
| `GET` | `/auth/google/callback` | `googleAuth.js::handleGoogleCallback`| None | Validates Google OAuth callback & establishes session | No | Any |
| `GET` | `/logout` | `auth.js::logoutUser` | None | Destroys session, clears signed cookie, redirects to `/buyer/login` | No | Any |
| `GET` | `/login` | Inline redirect | `optionalAuth` | Compatibility Alias: Redirects to `/buyer/login` or `/seller/login` | No | Guest |
| `GET` | `/register` | Inline redirect | `optionalAuth` | Compatibility Alias: Redirects to `/buyer/register` or `/seller/register` | No | Guest |
| `POST` | `/login` | `auth.js::loginUser` | None | Compatibility forwarder | No | Guest |
| `POST` | `/register` | `auth.js::registerUser` | None | Compatibility forwarder | No | Guest |

---

## 3. Buyer Marketplace Routes

| Method | Route | Controller | Middleware | Purpose | Auth Req? | Role Req? |
|---|---|---|---|---|:---:|:---:|
| `GET` | `/home` | Inline (`home.ejs`) | `authMiddleware` | Imperial Sea Chart mind map | Yes | Any authenticated |
| `GET` | `/users` | `users.js::getAllUsers` | `authMiddleware` | Registered Explorers directory | Yes | Any authenticated |
| `GET` | `/islands` | Inline redirect | `authMiddleware` | Overview redirect to `/#sea-chart-section` | Yes | Any authenticated |
| `GET` | `/island/:islandId` | `islands.js::renderIslandPage` | `authMiddleware` | Themed island view with MongoDB product list | Yes | Any authenticated |
| `GET` | `/product/:productId` | `products.js::renderProductDetail` | `authMiddleware` | Reusable Product Details sheet | Yes | Any authenticated |
| `GET` | `/seller/:sellerId` | `sellers.js::renderSellerStorefront` | `authMiddleware` | Public merchant storefront & catalog (Milestone 3.4) | Yes | Any authenticated |
| `GET` | `/cart` | `cart.js::getCart` | `optionalAuth` | View Cargo Cart Manifest / Fetch Cart JSON | Optional | Any |
| `POST` | `/cart/add` | `cart.js::addToCart` | `optionalAuth` | API: Adds product to DB cart (auth) or session cart (guest) | Optional | Any |
| `POST` | `/cart/update` | `cart.js::updateCartItem` | `optionalAuth` | API: Updates item quantity in cart | Optional | Any |
| `POST` | `/cart/remove` | `cart.js::removeCartItem` | `optionalAuth` | API: Removes item from cart | Optional | Any |
| `POST` | `/cart/clear` | `cart.js::clearCart` | `optionalAuth` | API: Clears all items from cargo hold | Optional | Any |
| `GET` | `/checkout` | `orders.js::renderCheckout` | `authMiddleware`, `requireBuyer` | Order review and shipping coordinates input | Yes | Buyer |
| `POST` | `/checkout` | `orders.js::validateCheckout` | `authMiddleware`, `requireBuyer` | Server-side validation of shipping coordinates | Yes | Buyer |
| `POST` | `/checkout/confirm`| `orders.js::processCheckout` | `authMiddleware`, `requireBuyer` | Creates Order, clears Cart, deducts stock | Yes | Buyer |
| `GET` | `/orders` | `orders.js::renderBuyerOrders` | `authMiddleware`, `requireBuyer` | Captain's Voyage Ledger (Buyer order history) | Yes | Buyer |
| `GET` | `/orders/:orderId` | `orders.js::renderBuyerOrderDetail` | `authMiddleware`, `requireBuyer` | Voyage Manifest & nautical tracking timeline | Yes | Buyer |

---

## 4. Seller Command Deck Routes

| Method | Route | Controller | Middleware | Purpose | Auth Req? | Role Req? |
|---|---|---|---|---|:---:|:---:|
| `GET` | `/seller/dashboard` | `sellers.js::renderSellerDashboard` | `authMiddleware`, `requireSeller` | Merchant metrics, catalog stats & alert feed | Yes | Seller |
| `GET` | `/seller/products` | `sellers.js::renderSellerProducts` | `authMiddleware`, `requireSeller` | Manage active store inventory | Yes | Seller |
| `GET` | `/seller/products/new` | `sellers.js::renderCreateProduct` | `authMiddleware`, `requireSeller` | Product creation form (island & branch selector) | Yes | Seller |
| `POST` | `/seller/products/new` | `sellers.js::createProduct` | `authMiddleware`, `requireSeller` | Persists new product into MongoDB | Yes | Seller |
| `GET` | `/seller/products/:productId/edit` | `sellers.js::renderEditProduct` | `authMiddleware`, `requireSeller` | Product edit form (ownership guarded) | Yes | Seller |
| `POST` | `/seller/products/:productId/edit` | `sellers.js::updateProduct` | `authMiddleware`, `requireSeller` | Updates product details and stock | Yes | Seller |
| `POST` | `/seller/products/:productId/toggle-availability` | `sellers.js::toggleProductAvailability` | `authMiddleware`, `requireSeller` | Toggles product public availability | Yes | Seller |
| `POST` | `/seller/products/:productId/delete` | `sellers.js::deleteProduct` | `authMiddleware`, `requireSeller` | Deletes/unlists merchant product | Yes | Seller |
| `GET` | `/seller/orders` | `sellers.js::renderSellerOrders` | `authMiddleware`, `requireSeller` | Incoming customer orders for this merchant | Yes | Seller |
| `GET` | `/seller/orders/:orderId` | `sellers.js::renderSellerOrderDetail`| `authMiddleware`, `requireSeller` | Order details with packing slip | Yes | Seller |
| `POST` | `/seller/orders/:orderId/status`| `sellers.js::updateOrderStatus` | `authMiddleware`, `requireSeller` | Updates fulfillment status | Yes | Seller |
| `GET` | `/seller/profile` | `sellers.js::renderSellerProfile` | `authMiddleware`, `requireSeller` | Edit store name, bio, home island | Yes | Seller |
| `POST` | `/seller/profile` | `sellers.js::updateSellerProfile` | `authMiddleware`, `requireSeller` | Saves store profile updates | Yes | Seller |

---

## 5. Developer Realm Routes (V1 Authorities)

| Method | Route | Controller | Middleware | Purpose | Auth Req? | Role Req? |
|---|---|---|---|---|:---:|:---:|
| `GET` | `/developer/dashboard`, `/admin/dashboard` | `developer.js::renderDeveloperDashboard` | `authMiddleware`, `requireAdmin` | Developer Realm Overview with real stats (Pending Sellers, People, Marketplace) | Yes | Admin |
| `GET` | `/developer`, `/admin` | Inline redirect | `authMiddleware`, `requireAdmin` | Redirects to `/developer/dashboard` | Yes | Admin |
| `GET` | `/developer/sellers/applications`, `/admin/sellers/applications` | `developer.js::renderSellerApplications` | `authMiddleware`, `requireAdmin` | View pending and resolved merchant charter applications | Yes | Admin |
| `POST` | `/developer/sellers/:id/approve`, `/admin/sellers/:id/approve` | `developer.js::approveSeller` | `authMiddleware`, `requireAdmin` | Approves seller charter; sets `sellerStatus = 'approved'` | Yes | Admin |
| `POST` | `/developer/sellers/:id/reject`, `/admin/sellers/:id/reject` | `developer.js::rejectSeller` | `authMiddleware`, `requireAdmin` | Rejects seller charter with reason; sets `sellerStatus = 'rejected'` | Yes | Admin |
| `GET` | `/developer/people`, `/admin/people` | `developer.js::renderPeople` | `authMiddleware`, `requireAdmin` | Census view of all Buyers and Sellers | Yes | Admin |
| `GET` | `/developer/marketplace`, `/admin/marketplace` | `developer.js::renderMarketplace` | `authMiddleware`, `requireAdmin` | Master Cargo & Trade Manifest (real products and orders oversight) | Yes | Admin |
| `GET` | `/developer/logout`, `/admin/logout` | `auth.js::logoutDeveloper` | None | Destroys developer session/cookie and redirects strictly to Gateway (`/`) | No | None |
| `GET` | `/developer/people/sellers/:id/products`, `/admin/people/sellers/:id/products` | `developer.js::renderDeveloperSellerProducts` | `authMiddleware`, `requireAdmin` | Read-only marketplace oversight of products listed by seller | Yes | Admin |
| `GET` | `/developer/people/buyers/:id/orders`, `/admin/people/buyers/:id/orders` | `developer.js::renderBuyerPurchases` | `authMiddleware`, `requireAdmin` | Read-only marketplace oversight of orders placed by buyer | Yes | Admin |
| `GET` | `/developer/cinematic`, `/admin/cinematic` | `developer.js::renderCinematicArchive` | `authMiddleware`, `requireAdmin` | Sovereign Cinematic Archive: full showcase MP4 video viewer with AAC stereo audio inside aged timber frame | Yes | Admin |

---

## 6. Backward Compatibility & Alias Routes

To preserve existing bookmarks and frontend links during the phased transition:

| Legacy Route | Redirects / Resolves To | Status |
|---|---|---|
| `/admin`, `/developer` | `/developer/dashboard` | Redirects to Developer Realm Dashboard |
| `/seller`, `/seller/portal` | `/seller/dashboard` | Redirects to Seller Command Deck |
| `/islands` | `/#sea-chart-section` | Overview redirect to home sea chart grid |
| `/astrolabe` | `/island/astrolabe` | Canonical alias retained |
| `/chronos` | `/island/chronos` | Canonical alias retained |
| `/kraken-vault`, `/kraken_vault` | `/island/kraken_vault` | Canonical alias retained |
| `/cutlass-cove`, `/cutlass_cove` | `/island/cutlass_cove` | Canonical alias retained |
| `/velvet-isle`, `/velvet_isle` | `/island/velvet_isle` | Canonical alias retained |
| `/booty-cay`, `/booty_cay` | `/island/booty_cay` | Canonical alias retained |

