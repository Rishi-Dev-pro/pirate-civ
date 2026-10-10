# 🏴‍☠️ 01_PROJECT_STATUS — Current Reality of the Codebase

**Audit Baseline Date:** 2026-10-10  
**Current State:** Initial Audit Completed — Baseline Established  
**Next Mandatory Update:** At the conclusion of Phase 1  

This document reflects the **unvarnished, ground-truth reality** of the Pirate-Civ codebase. No feature may be marked as "Complete" unless it is fully backed by database persistence, protected by server-side authorization, and verified via end-to-end testing.

---

## 1. System Status by Category

### 🟢 COMPLETE
* **Express 5 Framework:** Server initialization, middleware pipeline, static serving, and environment configuration in `index.js`.
* **Database Connection:** Resilient MongoDB connection handler via Mongoose in `config/db.js`.
* **Cryptographic Token Auth Backend:** Password hashing via `bcrypt` (salt rounds: 12), random 32-byte secret generation, SHA-256 token hashing, signed cookie handling (`auth_token`), and session comparison in `controller/auth.js` and `middleware/auth.js`.
* **Logout Flow:** Route `/logout` clears the session and invalidates the signed `auth_token` cookie.
* **Basic Protected Routes:** Core routes (`/`, `/about`, `/contact`, `/users`, `/island/*`) are guarded by `authMiddleware`.
* **Home Page Sea Chart UI:** Interactive cartographic mind map with animated SVGs, fire embers, smoke backdrop, lantern cursor tracking, and celestial compass rose in `views/home.ejs` and `public/js/mindmap.js`.
* **Island Views (Frontend Presentation):** 6 themed EJS views (`astrolabe.ejs`, `chronos.ejs`, `kraken_vault.ejs`, `cutlass_cove.ejs`, `velvet_isle.ejs`, `booty_cay.ejs`) with custom visual styling and atmospheric details.
* **Unified User Model (`models/user.js`):** Schema supports `role` (`'buyer'` default, `'seller'`, `'admin'`), optional merchant profile fields (`storeName`, `homeIsland`, `bio`, `avatar`), and `googleId` with sparse unique index. Fully tested for backward compatibility.
* **Contact Submission to DB:** Form POST `/contact` persists name, email, subject, and message into MongoDB `contacts` collection via `models/contact.js` and `controller/contact.js`.

---

### 🟡 PARTIALLY COMPLETE
* **Buyer Registration:** User registration route `/register` creates users in MongoDB, but only captures `name`, `email`, `password`, and `authSecretHash`. It lacks role assignment (`role: 'buyer'`), avatar selection, validation feedback in the UI, and remember-me handling.
* **Buyer Login:** Route `/login` validates credentials against MongoDB, but error feedback is raw text (e.g. `res.send("Invalid email or password")`) rather than styled flash messages in the EJS view. "Remember Me" checkbox is present on the frontend but not processed on the backend.
* **Explorer Page (`/users`):** Displays all registered users from MongoDB in a nautical grid (`views/users.ejs`), but treats them as generic students/users rather than pirate merchants and marketplace sellers.
* **Responsive UI:** Desktop layouts are polished, but certain island product grids, cart drawers, and mind map canvas scaling require mobile/tablet tuning.

---

### 🟠 FRONTEND ONLY (Simulated / Non-Persistent)
* **Item Listings:** Products displayed on island views and the sea chart mind map are hardcoded in `controller/islands.js` (`ISLANDS_DATA`) and `public/js/mindmap.js` (`REALM_DATA`). Zero products exist in MongoDB.
* **Add to Cart:** Clicking "Add to Cart" operates strictly inside browser `localStorage` or in-memory JavaScript arrays. No network request is dispatched to Express.
* **Shopping Cart Drawer:** The slide-out cart UI displays items from `localStorage` without server sync, stock validation, or session continuity across devices.
* **Checkout Flow:** The checkout button triggers a simulated toast/alert without generating an order record or checking user balances.

---

### 🔴 BACKEND ONLY
*(None currently — all existing backend endpoints have an associated frontend page).*

---

### ⚪ NOT IMPLEMENTED
* **Role-Based Authorization Middleware:** No check exists to distinguish buyers from sellers (`requireRole('seller')`, `requireRole('buyer')`).
* **Seller Model / Seller Profile:** No schema or controller exists for merchants, store profiles, merchant descriptions, or merchant ratings.
* **Product Model (`models/product.js`):** No schema exists for catalog products, pricing, stock, categories, or seller relationships.
* **Cart Model (`models/cart.js`):** No server-side schema exists for tracking active user shopping carts.
* **Order Model (`models/order.js`):** No schema exists for managing orders, order statuses, item snapshots, or shipping addresses.
* **Product CRUD APIs:** No routes or controllers for creating, updating, or deleting products.
* **Seller Management Platform:** The entire seller portal (registration, dashboard, inventory management, incoming order tracking) is 0% implemented.
* **Public Seller Discovery & Profiles:** No `/sellers` directory or `/seller/:sellerId` profile view.
* **Dynamic Product Details Page:** No dedicated `/product/:productId` route or template; users cannot view an isolated product sheet.
* **Buyer Order History & Profile:** No `/orders` or `/profile` page for buyers to view past purchases or account details.
* **Entry Map Gateway:** No gateway screen allowing incoming visitors to branch into the Buyer or Seller experience before entering the market.
* **Google OAuth Authentication:** No OAuth2 strategy or credential linkage configured.

---

### ⚠️ BROKEN / DEFECTIVE
* **Contact View Template Syntax Bug (`views/contact.ejs`):** The file begins with markdown code fence ````html` at line 1 and ends with ```` at line 222, causing raw markdown ticks to render into the HTML DOM.
* **About Page Content Mismatch (`views/about.ejs`):** Displays generic academic/portfolio boilerplate ("Rishi's Web is a modern Node.js + Express + EJS project...") instead of Pirate-Civ maritime marketplace lore and merchant guild information.
* **Hardcoded Student Mock Data in Home Route (`routes/web.js`):** Route `/` passes an unused array of mock university students (`studentInfo`) to `home.ejs`.

---

### 🛠️ TECHNICAL DEBT
1. **Product Data Duplication:** Product data is duplicated between `controller/islands.js` (server-side data dictionary) and `public/js/mindmap.js` (client-side data dictionary) with minor discrepancies in product titles and categories.
2. **Raw String Error Responses:** Auth controllers use `res.send("Passwords do not match")` and `res.send("User already exists")`, destroying the user's form state and breaking design consistency.
3. **No Centralized Error Handling:** Missing express global error-handling middleware (`app.use((err, req, res, next) => ...)`).
4. **Missing Production Seed Script:** No migration or seed script exists to populate MongoDB with the baseline catalog from the 6 islands.
5. **Session Store In-Memory:** Express-session currently uses default memory storage; restarting the server invalidates active sessions.

---

## 2. Component Readiness Matrix

| Component | Frontend State | Backend State | Database State | Overall Readiness |
|---|---|---|---|:---:|
| **Unified User Model** | N/A (Schema) | 🟢 Complete Mongoose model | 🟢 Validated schema | **100%** |
| **Entry Map Gateway** | ❌ Missing | ❌ Missing | N/A | **0%** |
| **Buyer Auth (Register/Login)** | 🟡 Complete UI, poor error UX | 🟡 Missing roles & validation | 🟡 Partial user schema | **50%** |
| **Remember Me** | 🟡 Checkbox present | ❌ Not handled | ❌ No persistent token | **20%** |
| **Google OAuth** | ❌ Missing | ❌ Missing | ❌ No googleId | **0%** |
| **Sea Chart / Home** | 🟢 Complete & animated | 🟢 Controller wired | ❌ Products in JS files | **80%** |
| **6 Leaf Islands** | 🟢 Complete themed views | 🟡 Hardcoded data | ❌ No DB query | **60%** |
| **Product Detail Page** | ❌ Missing | ❌ Missing | ❌ No Product model | **0%** |
| **Explore Sellers Directory** | ❌ (Shows generic users) | 🟡 Generic `/users` | ❌ No seller role | **15%** |
| **Public Seller Profile** | ❌ Missing | ❌ Missing | ❌ Missing | **0%** |
| **Cargo Cart** | 🟡 Frontend / localStorage | ❌ Missing API | ❌ No Cart model | **25%** |
| **Checkout Flow** | 🟡 Simulated UI | ❌ Missing API | ❌ Missing | **10%** |
| **Buyer Orders & Tracking** | ❌ Missing | ❌ Missing | ❌ No Order model | **0%** |
| **Buyer Profile** | ❌ Missing | ❌ Missing | ❌ Missing | **0%** |
| **Seller Dashboard** | ❌ Missing | ❌ Missing | ❌ Missing | **0%** |
| **Seller Product CRUD** | ❌ Missing | ❌ Missing | ❌ Missing | **0%** |
| **Seller Order Fulfillment** | ❌ Missing | ❌ Missing | ❌ Missing | **0%** |
| **Contact Page** | ⚠️ Buggy template wrapper | 🟢 Connected to MongoDB | 🟢 Model active | **75%** |
| **About Page** | ⚠️ Wrong copy | 🟢 Functional route | N/A | **60%** |
