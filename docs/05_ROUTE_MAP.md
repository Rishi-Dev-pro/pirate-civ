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
| `GET` | `/login` | Inline (`login.ejs`) | Guest-only | Standard Login Page | No | Guest |
| `POST` | `/login` | `auth.js::loginUser` | Guest-only | Validates credentials, issues session & cookie | No | Guest |
| `GET` | `/register` | Inline (`register.ejs`) | Guest-only | Standard Registration Page | No | Guest |
| `POST` | `/register` | `auth.js::registerUser` | Guest-only | Creates new Explorer/Buyer account in MongoDB | No | Guest |
| `GET` | `/logout` | `auth.js::logoutUser` | None | Destroys session, clears signed cookie | No | Any |

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

## 5. Backward Compatibility & Alias Routes

To preserve existing bookmarks and frontend links during the phased transition:

| Legacy Route | Redirects / Resolves To | Status |
|---|---|---|
| `/seller`, `/seller/portal` | `/seller/dashboard` | Redirects to Seller Command Deck |
| `/islands` | `/#sea-chart-section` | Overview redirect to home sea chart grid |
| `/astrolabe` | `/island/astrolabe` | Canonical alias retained |
| `/chronos` | `/island/chronos` | Canonical alias retained |
| `/kraken-vault`, `/kraken_vault` | `/island/kraken_vault` | Canonical alias retained |
| `/cutlass-cove`, `/cutlass_cove` | `/island/cutlass_cove` | Canonical alias retained |
| `/velvet-isle`, `/velvet_isle` | `/island/velvet_isle` | Canonical alias retained |
| `/booty-cay`, `/booty_cay` | `/island/booty_cay` | Canonical alias retained |

