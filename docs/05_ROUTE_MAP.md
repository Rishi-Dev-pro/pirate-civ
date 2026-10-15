# 🏴‍☠️ 05_ROUTE_MAP — Comprehensive HTTP Route Map

This document catalogues every HTTP route within Pirate-Civ, defining its method, controller action, middleware guards, authentication status, and role requirements.

---

## 1. Gateway & Public Experience Routes

| Method | Route | Controller | Middleware | Purpose | Auth Req? | Role Req? |
|---|---|---|---|---|:---:|:---:|
| `GET` | `/` | `gateway.js::renderEntryMap` | None (or conditional) | Pirate-Civ Entry Map (Fork to Buyer vs Seller) | Optional | Any |
| `GET` | `/about` | Inline / `page.js::renderAbout` | None | Guild lore, cartography story, mission | No | Public |
| `GET` | `/contact` | `contact.js::renderContact` | None | Inquiries, support, message dispatch form | No | Public |
| `POST` | `/contact` | `contact.js::saveContactDetails`| None | Persists contact inquiry into MongoDB | No | Public |

---

## 2. Authentication & Session Routes

| Method | Route | Controller | Middleware | Purpose | Auth Req? | Role Req? |
|---|---|---|---|---|:---:|:---:|
| `GET` | `/login` | `auth.js::renderLogin` | Guest-only | Standard Login Page (Buyer default) | No | Guest |
| `POST` | `/login` | `auth.js::loginUser` | Guest-only | Validates credentials, issues session & cookie | No | Guest |
| `GET` | `/register` | `auth.js::renderRegister` | Guest-only | Standard Registration Page (Buyer default) | No | Guest |
| `POST` | `/register` | `auth.js::registerUser` | Guest-only | Creates new Buyer account in MongoDB | No | Guest |
| `GET` | `/buyer/login` | `auth.js::renderBuyerLogin` | Guest-only | Dedicated Customer Login | No | Guest |
| `GET` | `/buyer/register`| `auth.js::renderBuyerRegister`| Guest-only | Dedicated Customer Registration | No | Guest |
| `GET` | `/seller/login` | `auth.js::renderSellerLogin`| Guest-only | Dedicated Merchant Login | No | Guest |
| `GET` | `/seller/register`| `auth.js::renderSellerRegister`| Guest-only| Dedicated Merchant Registration | No | Guest |
| `POST` | `/seller/register`| `auth.js::registerSeller` | Guest-only | Creates Merchant account with store details | No | Guest |
| `GET` | `/logout` | `auth.js::logoutUser` | None | Destroys session, clears signed cookie | No | Any |
| `GET` | `/auth/google` | `oauth.js::googleAuth` | None | Initiates Google OAuth consent screen | No | Public |
| `GET` | `/auth/google/callback` | `oauth.js::googleCallback` | None | Handles OAuth token exchange & user sign-in | No | Public |

---

## 3. Buyer Marketplace Routes

| Method | Route | Controller | Middleware | Purpose | Auth Req? | Role Req? |
|---|---|---|---|---|:---:|:---:|
| `GET` | `/home` | `home.js::renderHome` | `authMiddleware` | Imperial Sea Chart mind map | Yes | Buyer / Any |
| `GET` | `/islands` | `islands.js::listAllIslands` | `authMiddleware` | Overview list of 6 archipelago islands | Yes | Buyer / Any |
| `GET` | `/island/:islandSlug` | `islands.js::renderIslandPage` | `authMiddleware` | Themed island view with MongoDB product list | Yes | Buyer / Any |
| `GET` | `/product/:productId` | `products.js::renderProductDetail` | `authMiddleware` | Reusable Product Details sheet | Yes | Buyer / Any |
| `GET` | `/sellers` | `sellers.js::renderSellersList` | `authMiddleware` | "Explore Sellers" merchant directory (Planned 3.4) | Yes | Buyer / Any |
| `GET` | `/seller/:sellerId` | `sellers.js::renderSellerDiscovery` | `authMiddleware` | Merchant discovery view (Milestone 3.3 active; Full storefront in 3.4) | Yes | Buyer / Any |
| `GET` | `/cart` | `cart.js::renderCart` | `authMiddleware` | View persistent Cargo Cart / Manifest | Yes | Buyer |
| `POST` | `/cart/add` | `cart.js::addToCart` | `authMiddleware` | API: Adds product to user's MongoDB cart | Yes | Buyer |
| `POST` | `/cart/update` | `cart.js::updateCartItem` | `authMiddleware` | API: Updates item quantity | Yes | Buyer |
| `POST` | `/cart/remove` | `cart.js::removeCartItem` | `authMiddleware` | API: Removes item from cart | Yes | Buyer |
| `GET` | `/checkout` | `orders.js::renderCheckout` | `authMiddleware` | Order review and shipping coordinates input | Yes | Buyer |
| `POST` | `/checkout` | `orders.js::processCheckout` | `authMiddleware` | Creates Order, clears Cart, deducts stock | Yes | Buyer |
| `GET` | `/orders` | `orders.js::renderBuyerOrders` | `authMiddleware` | Customer order history list | Yes | Buyer |
| `GET` | `/orders/:id` | `orders.js::renderOrderDetail` | `authMiddleware` | Tracking timeline for specific order | Yes | Buyer |
| `GET` | `/profile` | `users.js::renderBuyerProfile` | `authMiddleware` | Customer account settings & home port | Yes | Buyer |

---

## 4. Seller Command Deck Routes

| Method | Route | Controller | Middleware | Purpose | Auth Req? | Role Req? |
|---|---|---|---|---|:---:|:---:|
| `GET` | `/seller/dashboard` | `seller.js::renderDashboard` | `authMiddleware`, `requireSeller` | Merchant metrics, catalog stats & alert feed | Yes | Seller |
| `GET` | `/seller/products` | `seller.js::renderProductList` | `authMiddleware`, `requireSeller` | Manage active store inventory | Yes | Seller |
| `GET` | `/seller/products/new` | `seller.js::renderProductCreate` | `authMiddleware`, `requireSeller` | Product creation form (island & branch selector) | Yes | Seller |
| `POST` | `/seller/products/new` | `seller.js::createProduct` | `authMiddleware`, `requireSeller` | Persists new product into MongoDB | Yes | Seller |
| `GET` | `/seller/products/:id/edit` | `seller.js::renderProductEdit` | `authMiddleware`, `requireSeller` | Product edit form (ownership guarded) | Yes | Seller |
| `POST` | `/seller/products/:id/edit` | `seller.js::updateProduct` | `authMiddleware`, `requireSeller` | Updates product details and stock | Yes | Seller |
| `POST` | `/seller/products/:id/delete` | `seller.js::deleteProduct` | `authMiddleware`, `requireSeller` | Deletes/unlists merchant product | Yes | Seller |
| `GET` | `/seller/orders` | `seller.js::renderSellerOrders` | `authMiddleware`, `requireSeller` | Incoming customer orders for this merchant | Yes | Seller |
| `GET` | `/seller/orders/:id` | `seller.js::renderSellerOrderDetail`| `authMiddleware`, `requireSeller` | Order details with packing slip | Yes | Seller |
| `POST` | `/seller/orders/:id/status`| `seller.js::updateOrderStatus` | `authMiddleware`, `requireSeller` | Updates fulfillment status | Yes | Seller |
| `GET` | `/seller/profile` | `seller.js::renderSellerProfile` | `authMiddleware`, `requireSeller` | Edit store name, bio, home island | Yes | Seller |
| `POST` | `/seller/profile` | `seller.js::updateSellerProfile` | `authMiddleware`, `requireSeller` | Saves store profile updates | Yes | Seller |

---

## 5. Backward Compatibility & Alias Routes

To preserve existing bookmarks and frontend links during the phased transition:

| Legacy Route | Redirects / Resolves To | Status |
|---|---|---|
| `/users` | `/sellers` | Refactored from student list to merchant explorer |
| `/astrolabe` | `/island/astrolabe` | Canonical alias retained |
| `/chronos` | `/island/chronos` | Canonical alias retained |
| `/kraken-vault`, `/kraken_vault` | `/island/kraken_vault` | Canonical alias retained |
| `/cutlass-cove`, `/cutlass_cove` | `/island/cutlass_cove` | Canonical alias retained |
| `/velvet-isle`, `/velvet_isle` | `/island/velvet_isle` | Canonical alias retained |
| `/booty-cay`, `/booty_cay` | `/island/booty_cay` | Canonical alias retained |
