# 🏴‍☠️ 06_FEATURE_SPECIFICATION — Core Feature Specifications

This document defines the functional and technical specifications for all major platform features across Pirate-Civ.

---

## 1. Feature Index

1. Entry Map Gateway
2. Customer (Buyer) Authentication
3. Seller (Merchant) Authentication
4. Google OAuth Integration
5. Remember Me Session Persistence
6. Imperial Sea Chart Home
7. Archipelago Islands Exploration
8. Dynamic Product Catalog
9. Reusable Product Details Sheet
10. Explore Sellers Directory
11. Public Seller Profile Storefront
12. Cargo Manifest (Cart) System
13. Checkout & Payment Simulation
14. Order Management & Tracking
15. Customer Profile
16. Seller Command Deck (Dashboard)
17. Seller Product Management (CRUD)
18. Seller Order Fulfillment
19. Admiralty About Page
20. Message Dispatch Contact Page

---

## 2. Detailed Specifications

### 2.1 Entry Map Gateway
* **Purpose:** Provides an atmospheric fork allowing incoming voyagers to enter either as a Customer or a Seller.
* **User:** All incoming visitors.
* **Entry Point:** `GET /`
* **Frontend Behavior:** Split cartographic presentation showing two interactive compass cards: "Customer / Explorer" and "Seller / Merchant Guild". Hover states activate fire ember and lantern glows.
* **Backend Behavior:** Renders `views/entry_map.ejs`. If user is already logged in with an active session, redirects directly to `/home` (if Buyer) or `/seller/dashboard` (if Seller).
* **Database Dependency:** None for initial display; checks `req.session.userId`.
* **Auth / Role Requirement:** Public / Optional.
* **Success State:** User clicks intended path and transitions to appropriate portal.
* **Error State:** N/A.

---

### 2.2 Customer (Buyer) Authentication
* **Purpose:** Registers and logs in buyers, creating secure sessions and signed cookies.
* **User:** Customer / Buyer.
* **Entry Point:** `GET /buyer/login`, `POST /buyer/login`, `GET /buyer/register`, `POST /buyer/register`.
* **Frontend Behavior:** Themed dark parchment form with animated compass corners, brass buttons, and password reveal toggle.
* **Backend Behavior:**
  - Registration: Hashes password with bcrypt (12 rounds), generates 32-byte auth secret, hashes secret via SHA-256, assigns `role: 'buyer'`, saves to MongoDB, establishes session.
  - Login: Compares bcrypt password; upon match, updates session and sets signed `auth_token` cookie.
* **Database Dependency:** `User` collection.
* **Auth / Role Requirement:** Guest-only (redirects if authenticated).
* **Success State:** Redirects to `/home` with welcome toast.
* **Error State:** Renders view with localized flash error: *"Invalid credentials or email not charted"*, preserving form values.

---

### 2.3 Seller (Merchant) Authentication
* **Purpose:** Dedicated onboarding for marketplace sellers, capturing merchant-specific attributes (Store Name, Home Island).
* **User:** Seller / Merchant.
* **Entry Point:** `GET /seller/login`, `GET /seller/register`, `POST /seller/register`.
* **Frontend Behavior:** Distinct merchant guild register form requiring: Captain/Merchant Name, Storefront Title, Home Island origin, and Email/Password.
* **Backend Behavior:** Creates User document with `role: 'seller'`, `storeName`, and `homeIsland`. Creates session and redirects to command deck.
* **Database Dependency:** `User` collection.
* **Auth / Role Requirement:** Guest-only.
* **Success State:** Redirects to `/seller/dashboard`.
* **Error State:** Validation alerts for missing store name or duplicate email.

---

### 2.4 Google OAuth Integration
* **Purpose:** One-click registration and login for voyagers using Google accounts.
* **User:** Buyers and Sellers.
* **Entry Point:** `GET /auth/google`, `GET /auth/google/callback`.
* **Frontend Behavior:** "Sign in with Google" button with parchment brass border.
* **Backend Behavior:** Exposes OAuth redirect, verifies Google ID token, finds or creates User with `googleId`, generates auth secret hash, and creates session.
* **Database Dependency:** `User` collection (`googleId` index).
* **Auth / Role Requirement:** Public.
* **Success State:** Redirects to `/home` or `/seller/dashboard`.
* **Error State:** Redirects to `/login?error=oauth_failed`.

---

### 2.5 Remember Me Session Persistence
* **Purpose:** Allows users to stay authenticated across browser restarts.
* **User:** Buyers and Sellers.
* **Entry Point:** Checkbox on login forms (`name="rememberMe"`).
* **Frontend Behavior:** Checkbox styled as a pirate wax seal toggle.
* **Backend Behavior:** If checked, sets cookie `maxAge` and session cookie `maxAge` to 30 days (`1000 * 60 * 60 * 24 * 30`); if unchecked, defaults to 24 hours.
* **Database Dependency:** `User` collection (`authSecretHash`).
* **Auth / Role Requirement:** Public.
* **Success State:** Cookie persists 30 days.

---

### 2.6 Imperial Sea Chart Home
* **Purpose:** The core discovery engine: an animated nautical chart of the Seven Seas.
* **User:** Authenticated Customer.
* **Entry Point:** `GET /home`
* **Frontend Behavior:** Canvas grid with drifting embers, animated smoke, interactive compass rose, SVG routes, and clickable island nodes displaying trade winds and coordinates.
* **Backend Behavior:** Fetches user info and island summaries, renders `views/home.ejs`.
* **Database Dependency:** `User` collection (for active session banner).
* **Auth / Role Requirement:** `authMiddleware` required.
* **Success State:** Smooth interactive cartographic navigation.

---

### 2.7 Archipelago Islands Exploration
* **Purpose:** Allows users to visit each of the 6 canonical islands and inspect island products.
* **User:** Customer.
* **Entry Point:** `GET /island/:islandSlug`
* **Frontend Behavior:** Immersive themed view (astrolabe brass, chronos clocks, kraken mist, cutlass forge, velvet silk, booty treasure) with product cards.
* **Backend Behavior:** Queries `Product.find({ island: islandSlug, isAvailable: true })`, maps island metadata, renders island view.
* **Database Dependency:** `Product` collection.
* **Auth / Role Requirement:** `authMiddleware` required.
* **Success State:** Products render with real Doubloons prices and stock statuses.
* **Error State:** 404 with nautical "Island lost in the fog" error view.

---

### 2.8 Dynamic Product Catalog
* **Purpose:** Serves database-backed products across all islands and search filters.
* **User:** Customer.
* **Entry Point:** Shared catalog queries in island controllers and explorer views.
* **Frontend Behavior:** Product cards with image, name, Doubloons badge, stock pill, and "Inspect" button.
* **Backend Behavior:** Queries MongoDB with filtering by island and category.
* **Database Dependency:** `Product` collection.
* **Auth / Role Requirement:** `authMiddleware` required.

---

### 2.9 Reusable Product Details Sheet
* **Purpose:** Dedicated single product view for any item in the marketplace.
* **User:** Customer.
* **Entry Point:** `GET /product/:productId`
* **Frontend Behavior:** Rich product imagery, seller store badge, price in Doubloons, category tags, description, stock count, quantity stepper, and "Add to Cargo" button.
* **Backend Behavior:** Queries `Product.findById(id).populate('seller')`.
* **Database Dependency:** `Product` and `User` collections.
* **Auth / Role Requirement:** `authMiddleware` required.
* **Success State:** Renders `views/product_detail.ejs`.
* **Error State:** 404 page if product is missing or unpublished.

---

### 2.10 Explore Sellers Directory
* **Purpose:** Allows buyers to discover independent merchants across the archipelago.
* **User:** Customer.
* **Entry Point:** `GET /sellers` (replaces legacy `/users`).
* **Frontend Behavior:** Grid of pirate merchant cards displaying store name, home island badge, avatar, and total active listings.
* **Backend Behavior:** Queries `User.find({ role: 'seller' })` with listing counts.
* **Database Dependency:** `User` and `Product` collections.
* **Auth / Role Requirement:** `authMiddleware` required.

---

### 2.11 Public Seller Profile Storefront
* **Purpose:** Dedicated storefront page for a specific merchant.
* **User:** Customer.
* **Entry Point:** `GET /seller/:sellerId`
* **Frontend Behavior:** Store banner, captain bio, home island affiliation, customer feedback rating, and grid of products sold by this merchant.
* **Backend Behavior:** Queries `User.findById(sellerId)` and `Product.find({ seller: sellerId, isAvailable: true })`.
* **Database Dependency:** `User` and `Product` collections.
* **Auth / Role Requirement:** `authMiddleware` required.

---

### 2.12 Cargo Manifest (Cart) System
* **Purpose:** Persistent shopping cart backed by MongoDB, synchronized with stock.
* **User:** Customer.
* **Entry Point:** `GET /cart`, `POST /cart/add`, `POST /cart/update`, `POST /cart/remove`.
* **Frontend Behavior:** Slide-out drawer or full cart page showing product thumbnails, Doubloons subtotals, quantity adjusters, and checkout CTA.
* **Backend Behavior:**
  - Upserts items into `Cart` collection for the authenticated user.
  - Re-validates inventory: if requested quantity exceeds product stock, caps quantity and alerts user.
* **Database Dependency:** `Cart` and `Product` collections.
* **Auth / Role Requirement:** `authMiddleware`, `requireRole('buyer')`.
* **Success State:** Instant UI updates and total Doubloons calculation.
* **Error State:** "Cannot exceed available island stock" warning.

---

### 2.13 Checkout & Payment Simulation
* **Purpose:** Finalizes cargo purchase, captures delivery port coordinates, and deducts inventory.
* **User:** Customer.
* **Entry Point:** `GET /checkout`, `POST /checkout`
* **Frontend Behavior:** Shipping coordinates form (Port Name, Island, Special Instructions), order summary review, and "Seal with Doubloons" button.
* **Backend Behavior:**
  - Verifies cart is not empty.
  - Deducts purchased quantities from each Product document.
  - Creates new `Order` record with status `pending`.
  - Clears user's `Cart`.
* **Database Dependency:** `Cart`, `Product`, `Order` collections.
* **Auth / Role Requirement:** `authMiddleware`, `requireRole('buyer')`.
* **Success State:** Redirects to `/orders/:orderId` with success fanfare.
* **Error State:** If an item went out of stock during checkout, aborts with specific error.

---

### 2.14 Order Management & Tracking
* **Purpose:** Allows customers to track order progress from packing to dock delivery.
* **User:** Customer.
* **Entry Point:** `GET /orders`, `GET /orders/:id`.
* **Frontend Behavior:** Visual voyage tracker displaying milestones: `Pending` ➔ `Confirmed` ➔ `Processing` ➔ `Shipped` ➔ `Delivered`.
* **Backend Behavior:** Queries `Order.find({ buyer: req.user._id })`.
* **Database Dependency:** `Order` collection.
* **Auth / Role Requirement:** `authMiddleware`, `requireRole('buyer')`.

---

### 2.15 Customer Profile
* **Purpose:** Buyer account management (profile updates, saved home port, password updates).
* **User:** Customer.
* **Entry Point:** `GET /profile`, `POST /profile`.
* **Frontend Behavior:** Parchment profile dashboard with pirate alias, email, and preferred island.
* **Backend Behavior:** Updates User record.
* **Database Dependency:** `User` collection.
* **Auth / Role Requirement:** `authMiddleware`.

---

### 2.16 Seller Command Deck (Dashboard)
* **Purpose:** Central management hub for merchants to oversee listings, stock, and orders.
* **User:** Seller / Merchant.
* **Entry Point:** `GET /seller/dashboard`
* **Frontend Behavior:** Analytics widgets (Total Doubloons Earned, Active Cargo Listings, Pending Dispatches, Low Stock Alerts).
* **Backend Behavior:** Aggregates metrics from `Product` and `Order` collections matching `seller: req.user._id`.
* **Database Dependency:** `Product`, `Order`, `User` collections.
* **Auth / Role Requirement:** `authMiddleware`, `requireRole('seller')`.

---

### 2.17 Seller Product Management (CRUD)
* **Purpose:** Allows merchants to create, edit, stock, and delete product listings.
* **User:** Seller / Merchant.
* **Entry Point:** `GET /seller/products`, `GET /seller/products/new`, `POST /seller/products/new`, `GET /seller/products/:id/edit`, `POST /seller/products/:id/edit`, `POST /seller/products/:id/delete`.
* **Frontend Behavior:** Forms with dropdowns strictly constrained to the **6 islands** and **3 category branches**, image path input, price in Doubloons, and initial stock.
* **Backend Behavior:** Validates inputs, creates or updates Product document. Strictly verifies `product.seller.equals(req.user._id)` before allowing mutation.
* **Database Dependency:** `Product` collection.
* **Auth / Role Requirement:** `authMiddleware`, `requireRole('seller')`.
* **Success State:** Product listed in MongoDB; visible immediately on island page.
* **Error State:** 403 Forbidden if seller attempts to alter another seller's product.

---

### 2.18 Seller Order Fulfillment
* **Purpose:** Merchants review incoming orders and update delivery status.
* **User:** Seller / Merchant.
* **Entry Point:** `GET /seller/orders`, `POST /seller/orders/:id/status`.
* **Frontend Behavior:** List of incoming orders with customer port, ordered items, and status transition selector (`Processing`, `Shipped`, `Delivered`).
* **Backend Behavior:** Updates status in `Order` document.
* **Database Dependency:** `Order` collection.
* **Auth / Role Requirement:** `authMiddleware`, `requireRole('seller')`.

---

### 2.19 Admiralty About Page
* **Purpose:** Immersive storytelling explaining Pirate-Civ's cartographic origins.
* **User:** Public / All users.
* **Entry Point:** `GET /about`
* **Frontend Behavior:** Video backdrop, nautical parchment typography, mission statement, and cartographic guild lore.
* **Backend Behavior:** Renders `views/about.ejs` with updated pirate lore.
* **Auth / Role Requirement:** Public.

---

### 2.20 Message Dispatch Contact Page
* **Purpose:** Public communication channel for questions or custom order inquiries.
* **User:** Public / All users.
* **Entry Point:** `GET /contact`, `POST /contact`
* **Frontend Behavior:** Cleaned form without rogue markdown ticks, video background, and success banner upon dispatch.
* **Backend Behavior:** Validates inputs, saves to `Contact` collection in MongoDB, redirects with `?success=true`.
* **Database Dependency:** `Contact` collection.
* **Auth / Role Requirement:** Public.
