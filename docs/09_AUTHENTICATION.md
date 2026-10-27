# 🏴‍☠️ 09_AUTHENTICATION — Authentication, Authorization & Security

This document details the security architecture of Pirate-Civ, including credential handling, session management, signed cookies, role-based access control (RBAC), and third-party OAuth.

---

## 1. Current Authentication Architecture

The current baseline implementation in `controller/auth.js` and `middleware/auth.js` uses a double-validation security model:

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant Server as Express (controller/auth.js)
    participant Session as Memory Session Store
    participant DB as MongoDB (User Collection)

    Note over User, Server: Registration / Login
    User->>Server: POST /login { email, password }
    Server->>DB: User.findOne({ email })
    Server->>Server: bcrypt.compare(password, user.password)
    Server->>Server: crypto.randomBytes(32).toString('hex') -> authSecret
    Server->>Server: crypto.createHash('sha256').update(authSecret).digest('hex') -> authSecretHash
    Server->>DB: user.authSecretHash = authSecretHash; user.save()
    Server->>Session: req.session.userId = user._id; req.session.authToken = authSecret
    Server->>User: Set-Cookie: auth_token=s:<signedSecret>; HttpOnly; SameSite=Lax
    Server-->>User: Redirect to /

    Note over User, Server: Subsequent Request Verification (middleware/auth.js)
    User->>Server: GET /island/astrolabe (Sends cookie & session)
    Server->>Server: Check req.session.userId & req.session.authToken
    Server->>Server: Check req.signedCookies.auth_token === req.session.authToken
    Server->>DB: User.findById(req.session.userId)
    Server->>Server: sha256(req.signedCookies.auth_token) === user.authSecretHash
    Server->>Server: req.user = user
    Server-->>User: Render protected view
```

### 1.1 Key Security Assets
* **Bcrypt Password Hashing:** Passwords are salted and hashed with a cost factor of 12 (`bcrypt.hash(password, 12)`).
* **Double-Token Verification:** Storing the raw random token in the signed cookie and session while persisting only its SHA-256 digest in MongoDB prevents database leak exploits.
* **Signed Cookies:** Cookies are cryptographically signed with `process.env.COOKIE_SECRET` to prevent tampering.

---

## 2. Target Authentication Architecture

The target architecture extends this foundation with:
1. **User Role Support:** Every user record carries a verified `role` (`'buyer'`, `'seller'`, `'admin'`).
2. **Remember Me Capability:** Dynamic cookie expiration based on user preference.
3. **Google OAuth 2.0:** Secure federated identity integration.
4. **Role Authorization Middleware:** Server-side route gates.

---

## 3. Session & Cookie Policy

| Context | Cookie Name | `httpOnly` | `secure` | `sameSite` | Expiration (`maxAge`) |
|---|---|:---:|:---:|:---:|---|
| **Standard Session** | `connect.sid` | `true` | `true` (in prod) | `lax` | Browser session (or 24 hours) |
| **Auth Signed Cookie** | `auth_token` | `true` | `true` (in prod) | `lax` | 24 hours |
| **Remember Me Active** | `auth_token` | `true` | `true` (in prod) | `lax` | **30 days** (`1000 * 60 * 60 * 24 * 30`) |

---

## 4. Role-Based Access Control (RBAC)

```
┌────────────────────────────────────────────────────────────────────────┐
│ CRITICAL SECURITY MANDATE:                                             │
│ NEVER rely on frontend-only authorization (e.g. hiding UI links).       │
│ Every protected backend route MUST enforce authorization on the        │
│ server before executing controller logic.                              │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Middleware Guards (`middleware/roles.js`)

```javascript
/**
 * Verifies that the authenticated user possesses the required role
 * @param {string|string[]} allowedRoles
 */
export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.redirect("/login");
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).render("error", {
                page_title: "Forbidden Waters",
                message: "You lack the rank or merchant charter required to anchor here.",
                user: req.user
            });
        }

        next();
    };
};

export const requireSeller = requireRole("seller", "admin");
export const requireBuyer = requireRole("buyer", "admin");
```

---

## 5. Dedicated Buyer / Seller Authentication Architecture

To ensure strict role separation, prevent role injection, and eliminate ambiguous shared flows:

### 5.1 Dedicated Route Contracts

| Flow | Method | Canonical Route | Views Rendered | Role Enforcement |
|---|---|---|---|---|
| **Buyer Sign-In** | `GET` / `POST` | `/buyer/login` | `views/buyer/login.ejs` | Accepts ONLY `role: 'buyer'`. Sellers receive 403 Forbidden with prompt to use Merchant Login. |
| **Buyer Registration** | `GET` / `POST` | `/buyer/register` | `views/buyer/register.ejs` | Strictly forces `role: 'buyer'`. Ignores client `role` inputs. No `storeName` required. |
| **Seller Sign-In** | `GET` / `POST` | `/seller/login` | `views/seller/login.ejs` | Accepts ONLY `role: 'seller'`. Buyers receive 403 Forbidden with prompt to use Explorer Login. |
| **Seller Registration** | `GET` / `POST` | `/seller/register` | `views/seller/register.ejs` | Strictly forces `role: 'seller'`. Mandates `storeName`. Sets `sellerStatus: 'pending'`. |

### 5.2 Seller Approval Lifecycle (`sellerStatus`)

To prevent unvetted merchants from trading or listing cargo, all newly registered sellers start in a pending charter state:

* **Field Definition (`models/user.js`):**
  - `sellerStatus`: Enum `["pending", "approved", "rejected", null]`. Defaults to `null` for buyers.
  - `rejectionReason`: Optional string providing context when an application is rejected.
* **Access Rules (`middleware/roles.js`):**
  - `sellerStatus === "pending"`: Blocked from protected seller routes with HTTP 403: *"Your Merchant Charter is awaiting approval from the Admiralty."*
  - `sellerStatus === "rejected"`: Blocked from protected seller routes with HTTP 403: *"Your Merchant Charter application was rejected."* Displays rejection reason if present.
  - `sellerStatus === "approved"`: Granted full access to Seller Command Deck, Products, and Order management.

### 5.3 Deep Link Redirection Fix (F-01 Resolution)
`req.session.returnTo` is captured into local variables **BEFORE** `req.session.regenerate()` is executed. Post-login redirection honors verified internal return destinations (rejecting open redirects, protocol-relative paths, and javascript URIs) while preventing buyers from inheriting seller destinations.

### 5.4 Google OAuth 2.0 Integration Strategy

1. **Flow Initiation:** User clicks *"Sign in with Google"* at `/auth/google?intent=buyer` or `/auth/google?intent=seller`.
2. **Cryptographic State Signing:** Generates `stateToken = `${rand}.${roleIntent}.${hmacSignature}``, preventing intent drift across parallel tabs.
3. **Consent & Callback:** Google redirects to `/auth/google/callback` with authorization code and signed state.
4. **Identity Resolution:**
   - Existing user: links `googleId` if missing; **MongoDB `role` is NEVER altered**.
   - New user: assigns `role` from verified state (`buyer` or `seller`). If seller, sets `sellerStatus: 'pending'`.
5. **Redirection:** Honors verified deep link or falls back to `/home` (buyer) or `/seller/dashboard` (seller).

---

## 6. Developer Realm Security (V1 & V2 Authorities)

* **Identity & Canonical Role:** The Developer UI uses `"DEVELOPER"` terminology (`PIRATE-CIV // DEVELOPER REALM`, `THE SOVEREIGN CIPHER VAULT`). Internally, the database security role strictly remains `role: 'admin'`. Never rename the database role to developer.
* **Perimeter Defense:** The secret skull click entrance is a discovery gateway, not an authentication bypass. All protected Developer Realm routes require `[authMiddleware, requireAdmin]`.
* **RBAC Isolation:** Buyers and sellers attempting to navigate to Developer Realm endpoints receive strict HTTP 403 Forbidden.
* **Disconnect Behavior (V2):**
  - Clicking `DISCONNECT` destroys the developer/admin session and clears authentication cookies.
  - The developer is redirected strictly to `/` (the Pirate-Civ Gateway / character-selection starting page) to choose between Merchant / Buyer again.
  - Developers are never redirected to `/buyer/login`, `/seller/login`, or `/admin/login`.
* **Authority Scope:**
  - **Seller Charters:** View pending/approved/rejected applications; approve or reject sellers server-side with strict validation.
  - **People Registry:** Read-only census of buyers and sellers.
  - **Marketplace Oversight:** Read-only master cargo & trade manifest of listed products and customer orders with doubloon volume metrics.

---

## 7. Protection Matrix

| Route Pattern | `authMiddleware` | Role Middleware | Permitted Users |
|---|:---:|:---:|---|
| `/buyer/login`, `/buyer/register`, `/seller/login`, `/seller/register`, `/admin/login`, `/developer/login` | No (Guest) | N/A | Unauthenticated |
| `/login`, `/register` (Compatibility Aliases) | Optional | N/A | Redirects to dedicated `/buyer/*`, `/seller/*`, or `/admin/*` |
| `/`, `/about`, `/contact` | Optional | None | All |
| `/home`, `/islands`, `/island/*`, `/product/*` | **Required** | None | Authenticated (Buyers & Sellers) |
| `/cart`, `/checkout`, `/orders`, `/profile` | **Required** | `requireBuyer` | Buyers & Admins |
| `/seller/dashboard`, `/seller/products/*`, `/seller/orders/*` | **Required** | `requireSeller` | Approved Sellers & Admins |
| `/developer/*`, `/admin/*` | **Required** | `requireAdmin` | Admins (Developer) Only |
