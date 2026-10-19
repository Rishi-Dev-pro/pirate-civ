# PIRATE-CIV — FULL BUYER / SELLER AUTHENTICATION FORENSIC AUDIT

**Audit Date:** October 19, 2026  
**Auditor:** Agentic Forensic Engineering (Antigravity DeepMind)  
**Methodology:** Ralph Loop (Inspect → Trace → Verify → Document → Review) & Ponytail Principles  
**Status:** READ-ONLY COMPREHENSIVE FORENSIC AUDIT COMPLETE  
**Repository Branch:** `main`  
**Base Commit:** `2834b09`  

---

## 1. EXECUTIVE SUMMARY

This forensic audit presents a complete, read-only architectural investigation of the Pirate-Civ authentication, authorization, session management, and role-dispatching systems.

Every flow has been traced from the browser DOM through Express routing, middleware pipelines, controllers, database models, session stores, cookie serialization, and post-authentication redirection.

### Key Takeaways

1. **Shared Route & View Architecture:**  
   The application does **NOT** possess separate routes or dedicated controllers for buyer versus seller authentication. There is:
   - Exactly **ONE shared login route**: `GET /login` and `POST /login`
   - Exactly **ONE shared registration route**: `GET /register` and `POST /register`
   - Exactly **ONE shared logout route**: `GET /logout`
   - Exactly **ONE shared Google OAuth route pair**: `GET /auth/google` and `GET /auth/google/callback`
   - Dedicated routes like `/buyer/login`, `/buyer/register`, `/seller/login`, and `/seller/register` **DO NOT EXIST** in `routes/web.js`.

2. **Login Routing is Role-Invariant (Database Role Governs Redirection):**  
   When a user submits credentials to `POST /login`, authentication is strictly role-governed by the database:
   - If the user has `role: 'seller'`, they are sent to `/seller/dashboard`.
   - If the user has `role: 'buyer'`, they are sent to `/home`.
   - Client intent (`?intent=seller` or `?intent=buyer`) **CANNOT** override an existing user's role in the database. A buyer logging in via a seller-themed portal will still authenticate strictly as a `buyer` and land on `/home`. A seller logging in via a buyer-themed portal will still authenticate strictly as a `seller` and land on `/seller/dashboard`.

3. **Critical Redirection Bug (Session Regeneration Wipes `returnTo`):**  
   In `controller/auth.js` (line 359), `req.session.regenerate()` is executed upon successful password verification to prevent session fixation. However, `req.session.returnTo` and `req.session.authIntent` are **not saved to local variables before regeneration** (unlike `preLoginSessionCart`). Consequently, `req.session.returnTo` is completely lost in the newly generated session, and deep link redirections after login never occur, defaulting always to the role's root landing page (`/seller/dashboard` or `/home`).

4. **Template Parsing Defect (Swallowed Hidden Intent Field):**  
   In `views/login.ejs` (lines 289–295), the hidden `<input type="hidden" name="intent" ...>` field is accidentally situated inside an unclosed HTML comment block. As a result, the browser parser treats it as comment text, and `req.body.intent` is never transmitted by the login form submission.

5. **Client-Controlled Registration Role Assignment:**  
   In `views/register.ejs` and `controller/auth.js`, role selection at registration is driven by `req.body.role` or `req.body.intent`. While `role: 'admin'` is explicitly blocked and sanitized to `'buyer'`, any client or guest can freely register as a `seller` simply by submitting `role=seller`. There is no separate seller invitation, approval gate, or isolated merchant registration workflow.

### Finding Severity Counts
- **P0 (Critical):** 0
- **P1 (High):** 1
- **P2 (Medium):** 4
- **P3 (Low):** 4

---

## 2. CURRENT AUTHENTICATION ARCHITECTURE

The authentication system operates on Express 4.x with session-based and signed cookie-based state.

```
+---------------------------------------------------------------------------------------------------+
|                                        BROWSER / CLIENT                                           |
+---------------------------------------------------------------------------------------------------+
                  |                                                  |
                  | GET /login?intent=seller                         | GET /register?intent=buyer
                  v                                                  v
+---------------------------------------------------------------------------------------------------+
|                                          EXPRESS ROUTER                                           |
|                                         (routes/web.js)                                           |
+---------------------------------------------------------------------------------------------------+
                  |                                                  |
                  +--------------+-------------------+---------------+
                                 |                   |
                                 v                   v
                  +-------------------------------------------------+
                  |                   CONTROLLER                    |
                  |              (controller/auth.js)               |
                  |           (controller/googleAuth.js)            |
                  +-------------------------------------------------+
                                         |
                                         v
                  +-------------------------------------------------+
                  |                     MODELS                      |
                  |                (models/user.js)                 |
                  |               MongoDB / Mongoose                |
                  +-------------------------------------------------+
                                         |
                                         v
                  +-------------------------------------------------+
                  |                SESSION & COOKIES                |
                  |        express-session (MongoDB/Memory)         |
                  |         auth_token (HMAC Signed Cookie)         |
                  +-------------------------------------------------+
```

### Components

1. **`routes/web.js`**: Exposes `/login`, `/register`, `/logout`, `/auth/google`, and `/auth/google/callback`.
2. **`controller/auth.js`**: Contains `loginUser`, `registerUser`, `logoutUser`.
3. **`controller/googleAuth.js`**: Contains `initiateGoogleAuth` and `handleGoogleCallback`.
4. **`middleware/auth.js`**: Contains `authMiddleware` (enforcing authentication) and `optionalAuth` (decorating `req.user` if present).
5. **`middleware/roles.js`**: Contains `requireRole(role)`, `requireSeller`, `requireBuyer`, `requireAdmin`, and `forbidSeller`.
6. **`models/user.js`**: Unified Mongoose schema storing identity, role (`'buyer' | 'seller' | 'admin'`), `storeName`, `homeIsland`, `authSecretHash`, and `googleId`.

---

## 3. CURRENT ROUTE MAP

| Method | Route | Middleware | Controller | View Rendered | Role Context | Guest Behavior | Success Action | Failure Behavior |
|---|---|---|---|---|---|---|---|---|
| **GET** | `/login` | `optionalAuth` | Inline in `web.js` | `views/login.ejs` | Read from query/session (`intent`) | Displays form | N/A (Form display) | Falls back to defaults |
| **POST** | `/login` | None | `loginUser` (`auth.js`) | Re-renders `login.ejs` on error | Read from DB `user.role` | Verifies credentials | Regenerates session, sets cookie, redirects | HTTP 400/401, re-renders `login.ejs` |
| **GET** | `/register` | `optionalAuth` | Inline in `web.js` | `views/register.ejs` | Read from query/session (`intent`) | Displays form | N/A (Form display) | Falls back to defaults |
| **POST** | `/register` | None | `registerUser` (`auth.js`) | Re-renders `register.ejs` on error | Taken from `req.body.role` / `intent` | Creates `User` | Sets session, sets cookie, redirects | HTTP 400/409, re-renders `register.ejs` |
| **GET** | `/logout` | None | `logoutUser` (`auth.js`) | None (Redirect) | Any | Clears session/cookies | Redirects to `/login` | Redirects to `/login` |
| **GET** | `/auth/google` | None | `initiateGoogleAuth` (`googleAuth.js`) | None (Redirect to Google) | Stored in session | Redirects to Google OAuth | Redirects to Google consent | Redirects to `/login?error=...` |
| **GET** | `/auth/google/callback` | None | `handleGoogleCallback` (`googleAuth.js`) | None (Redirect) | Preserves existing DB role or assigns intent | Authenticates or registers | Regenerates session, redirects | Redirects to `/login?error=...` |

### Explicit Answers to Architectural Inventory Questions
- **A. Does the application have one shared login page?** **YES.** (`views/login.ejs` served at `GET /login`).
- **B. Does the application have one shared register page?** **YES.** (`views/register.ejs` served at `GET /register`).
- **C. Does the application have a separate buyer login?** **NO.** There is no `/buyer/login`.
- **D. Does the application have a separate seller login?** **NO.** There is no `/seller/login`.
- **E. Does the application have a separate buyer registration?** **NO.** There is no `/buyer/register`.
- **F. Does the application have a separate seller registration?** **NO.** There is no `/seller/register`.

---

## 4. BUYER LOGIN FLOW

### Trace
1. **Gateway**: Visitor clicks **"EXPLORE THE REALM"** (`#cardExplorer`), pointing to `/home`.
2. **Middleware Trigger**: Route `GET /home` is protected by `authMiddleware`.
3. **Redirect to Login**: `authMiddleware` calls `redirectToLogin(req, res)`:
   - Sets `req.session.authIntent = 'buyer'`
   - Sets `req.session.returnTo = '/home'`
   - Redirects HTTP 302 to `/login`
4. **GET `/login`**: Renders `views/login.ejs`:
   - Inspects `req.query.intent` (absent) -> falls back to `req.session.authIntent` (`'buyer'`).
   - Renders tab switch active on "Buyer / Explorer".
5. **Form Action**: Form submits via `POST /login` with fields `email`, `password`, `rememberMe`.
   - *Note:* `<input type="hidden" name="intent" ...>` is swallowed by an unclosed HTML comment in `views/login.ejs` line 289.
6. **POST `/login` Validation (`controller/auth.js`)**:
   - Validates `email` and `password` presence and format.
   - Database lookup: `User.findOne({ email })`.
   - Verifies password with `bcrypt.compare(password, user.password)`.
7. **Session Regeneration**:
   - `req.session.regenerate()` is called.
   - **BUG:** `req.session.returnTo` is erased during regeneration.
   - Populates new session:
     ```js
     req.session.user = {
       id: user._id.toString(),
       name: user.name,
       email: user.email,
       role: user.role, // 'buyer'
       avatar: user.avatar,
       homeIsland: user.homeIsland
     };
     ```
8. **Auth Token & Signed Cookie**:
   - Issues HMAC signed JWT/token stored in `auth_token` HTTP-only cookie.
9. **Final Redirect**:
   - `req.session.returnTo` is evaluated (now `undefined`).
   - Defaults to role landing: `user.role === 'seller' ? '/seller/dashboard' : '/home'`.
   - Buyer is redirected HTTP 302 to `/home`.

### Buyer Login Test Cases

| Case | Input / Condition | HTTP Status | Render / Redirect | Role Integrity | Notes |
|---|---|---|---|---|---|
| 1 | Correct buyer credentials | 302 | Redirect `/home` | Intact (`buyer`) | Normal success flow |
| 2 | Wrong password | 401 | Re-renders `login.ejs` | N/A | Generic error banner displayed |
| 3 | Unknown email | 401 | Re-renders `login.ejs` | N/A | Generic error (no enumeration) |
| 4 | Empty email | 400 | Re-renders `login.ejs` | N/A | "Email and password are required" |
| 5 | Invalid email format | 400 | Re-renders `login.ejs` | N/A | Regex validation fails |
| 6 | Empty password | 400 | Re-renders `login.ejs` | N/A | "Email and password are required" |
| 7 | Seller credentials on buyer login | 302 | Redirect `/seller/dashboard` | Intact (`seller`) | Database role overrides portal intent |
| 8 | Buyer credentials with `intent=seller` | 302 | Redirect `/home` | Intact (`buyer`) | Database role overrides portal intent |
| 9 | Buyer login with `intent=buyer` | 302 | Redirect `/home` | Intact (`buyer`) | Normal flow |
| 10 | Buyer login without intent | 302 | Redirect `/home` | Intact (`buyer`) | Defaults to `/home` |
| 11 | Stale `returnTo` in session | 302 | Redirect `/home` | Intact (`buyer`) | `returnTo` wiped by `session.regenerate()` |
| 12 | Malformed `returnTo` query | 302 | Redirect `/home` | Intact (`buyer`) | Sanitized by `validateReturnTo` |
| 13 | Buyer already authenticated visits `/login` | 200 | Renders `login.ejs` | Intact (`buyer`) | Navbar shows active profile |
| 14 | Login after logout | 302 | Redirect `/home` | Intact (`buyer`) | Session cleanly recreated |
| 15 | Remember Me checked | 302 | Redirect `/home` | Intact (`buyer`) | Cookie `maxAge` set to 30 days |
| 16 | Remember Me unchecked | 302 | Redirect `/home` | Intact (`buyer`) | Cookie `maxAge` defaults to 24 hours |

---

## 5. SELLER LOGIN FLOW

### Trace
1. **Gateway**: Visitor clicks **"COMMAND SELLER DECK"** (`#cardArmator`), pointing to `/seller/dashboard`.
2. **Middleware Trigger**: Route `GET /seller/dashboard` is protected by `requireSeller` (`requireRole("seller")`).
3. **Redirect to Login**: `requireRole` calls `redirectToLogin(req, res)`:
   - Sets `req.session.authIntent = 'seller'`
   - Sets `req.session.returnTo = '/seller/dashboard'`
   - Redirects HTTP 302 to `/login`
4. **GET `/login`**: Renders `views/login.ejs`:
   - `roleIntent` resolved as `'seller'`.
   - UI activates the "Merchant / Seller" tab.
   - Heading displays "Armator Deck Login".
5. **Form Action**: Submits `POST /login` with seller credentials.
6. **POST `/login` Validation (`controller/auth.js`)**:
   - Authenticates seller against MongoDB `User` record.
   - `user.role` is verified as `'seller'`.
7. **Session Regeneration**:
   - `req.session.regenerate()` creates clean session.
   - Session `user.role` set to `'seller'`.
8. **Final Redirect**:
   - Line 451: `user.role === 'seller' ? '/seller/dashboard' : '/home'`.
   - Redirects HTTP 302 to `/seller/dashboard`.

### Cross-Role Boundary Tests
- **Seller entering credentials into Buyer-themed `/login?intent=buyer`:**
  - Authenticates successfully.
  - Server detects `user.role === 'seller'`.
  - Redirection target is `/seller/dashboard`.
  - **Verdict:** Seller is **NEVER** stranded in buyer home; database role strictly enforces destination.
- **Buyer entering credentials into Seller-themed `/login?intent=seller`:**
  - Authenticates successfully.
  - Server detects `user.role === 'buyer'`.
  - Redirection target is `/home`.
  - **Verdict:** Buyer is **NEVER** granted access to seller dashboard; database role strictly enforces destination.

---

## 6. BUYER REGISTRATION FLOW

### Trace
1. **Gateway / Navbar**: User navigates to `/register` or `/register?intent=buyer`.
2. **GET `/register`**:
   - Resolves `roleIntent = 'buyer'`.
   - Renders `views/register.ejs` with buyer fields displayed and seller fields hidden.
3. **Form Action**: Submits `POST /register` with:
   - `name`, `email`, `password`, `confirmPassword`, `homeIsland`, `role: 'buyer'`.
4. **Controller Processing (`controller/auth.js:registerUser`)**:
   - Validates required fields, email format, password minimum length (6 characters), password confirmation match.
   - Sanitizes role:
     ```js
     const requestedRole = (req.body.role || req.body.intent || req.query.intent || req.session?.authIntent || "buyer").toLowerCase().trim();
     const finalRole = requestedRole === "seller" ? "seller" : "buyer";
     ```
   - Checks email collision: `User.findOne({ email: normalizedEmail })`.
   - Hashes password: `bcrypt.hash(password, 10)`.
   - Generates random `authSecretHash`.
   - Creates `User` document with `role: 'buyer'`.
5. **Session & Cookie Setup**:
   - Sets `req.session.user` with `role: 'buyer'`.
   - Sets `auth_token` cookie.
   - Redirects HTTP 302 to `/home`.

### Critical Security Analysis: Can the Client Choose the Role?
- **YES.** In the current implementation, `req.body.role` is accepted directly from the client form.
- If a client posts `role: "seller"`, `finalRole` becomes `"seller"`.
- If a client posts `role: "admin"`, line 151 clamps it: `requestedRole === "seller" ? "seller" : "buyer"`. Admin escalation is blocked.

---

## 7. SELLER REGISTRATION FLOW

### Trace
1. **Gateway / Tab Switch**: User navigates to `/register?intent=seller`.
2. **GET `/register`**:
   - Resolves `roleIntent = 'seller'`.
   - Client JS (`public/js/auth.js`) detects seller intent and reveals `#storeNameGroup`.
3. **Form Action**: Submits `POST /register` with:
   - `name`, `email`, `password`, `confirmPassword`, `homeIsland`, `storeName`, `role: 'seller'`.
4. **Controller Processing (`registerUser`)**:
   - `requestedRole` evaluates to `'seller'`.
   - Validates `storeName`:
     ```js
     if (finalRole === "seller" && !storeName?.trim()) {
       return res.status(400).render("register", { error: "Store / Fleet name is required for Armators.", ... });
     }
     ```
   - Creates `User` document with `role: 'seller'`, `storeName: storeName.trim()`.
5. **Redirection**:
   - Session initialized with `role: 'seller'`.
   - Redirects HTTP 302 to `/seller/dashboard`.

### Is Seller Creation Genuinely Seller-Specific?
- **NO.** It is the exact same route (`POST /register`) and controller (`registerUser`), differing only in an `if (finalRole === "seller")` branch checking for `storeName`.

---

## 8. GOOGLE OAUTH FORENSIC TRACE

### Implementation Overview
Google OAuth is handled by `controller/googleAuth.js` and mounted at:
- `GET /auth/google` (`initiateGoogleAuth`)
- `GET /auth/google/callback` (`handleGoogleCallback`)

### Step-by-Step Execution Trace

```
Browser                         Express Server                       Google Accounts
   |                                  |                                     |
   |--- GET /auth/google?intent=X --->|                                     |
   |                                  |-- Generates random state & nonce    |
   |                                  |-- Saves state, intent to session    |
   |                                  |                                     |
   |<-- HTTP 302 Redirect ------------|                                     |
   |    (to accounts.google.com)      |                                     |
   |                                                                        |
   |-------------------- User Authenticates & Grants Consent -------------->|
   |                                                                        |
   |<------------------- HTTP 302 Redirect with code & state ---------------|
   |                                                                        |
   |--- GET /auth/google/callback --->|                                     |
   |    (?code=...&state=...)         |-- Validates state === session.state |
   |                                  |-- Exchanges code for tokens -------->
   |                                  |<-- Returns ID Token & User Info ----|
   |                                  |-- Looks up user by googleId or email|
   |                                  |   (Existing vs New User)            |
   |                                  |-- Regenerates session               |
   |                                  |-- Sets auth_token cookie            |
   |<-- HTTP 302 Redirect ------------|                                     |
```

### Critical Cross-Role Analysis: Existing User vs Google Intent

#### Case 1: Existing Buyer clicks "Continue with Google" from Seller Portal
- User registered previously via password as a `buyer` (`user.role === 'buyer'`).
- User opens `/login?intent=seller` and clicks "Continue with Google".
- `req.session.googleAuth.intent = 'seller'`.
- Google returns callback matching existing user's email.
- **Controller Logic (`controller/googleAuth.js:134-140`):**
  ```javascript
  if (user) {
    if (!user.googleId) {
      user.googleId = googleUser.id;
      await user.save();
    }
    // user.role is NOT updated!
  }
  ```
- **Result:** The user's role remains `buyer`. The redirect logic inspects `user.role`:
  ```javascript
  const destination = user.role === "seller" ? "/seller/dashboard" : "/home";
  ```
- **VERIFIED:** The buyer is redirected to `/home`. The buyer **CANNOT** escalate to seller via Google OAuth.

#### Case 2: Existing Seller clicks "Continue with Google" from Buyer Portal
- User registered previously as a `seller` (`user.role === 'seller'`).
- User clicks "Continue with Google" on buyer login (`intent=buyer`).
- User matches by email.
- `user.role` remains `seller`.
- User is redirected to `/seller/dashboard`.
- **VERIFIED:** The seller's merchant status is preserved.

#### Case 3: Brand New User registers via Google
- User does not exist in MongoDB.
- `controller/googleAuth.js:145-160` creates a new user:
  ```javascript
  const roleIntent = (req.session.googleAuth?.intent || "buyer").toLowerCase().trim();
  const assignedRole = roleIntent === "seller" ? "seller" : "buyer";
  user = await User.create({
    name: googleUser.name || "Google Voyager",
    email: googleUser.email.toLowerCase(),
    role: assignedRole,
    googleId: googleUser.id,
    storeName: assignedRole === "seller" ? `${googleUser.name}'s Fleet` : undefined,
    homeIsland: "Cutlass Cove"
  });
  ```
- **VERIFIED:** If the new user arrived with `intent=seller`, they become a seller. If with `intent=buyer`, they become a buyer.

---

## 9. SESSION & COOKIE FORENSICS

### Configuration Details (`index.js`)

```javascript
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
  })
);
```

### Cookie Strategy: Dual State Architecture
1. **Express Session Cookie (`connect.sid`):**
   - Signed session identifier storing `req.session.user`.
   - `httpOnly: true`, `sameSite: 'lax'`.
2. **HMAC Signed JWT Cookie (`auth_token`):**
   - Token storing `{ id, role }`, signed with `process.env.AUTH_SECRET`.
   - `httpOnly: true`.
   - Checked in `authMiddleware` if session is missing or expired, regenerating `req.session.user` seamlessly.

### Logout Forensics (`controller/auth.js:logoutUser`)
- Invoked on `GET /logout`.
- Clears `auth_token` cookie: `res.clearCookie("auth_token")`.
- Destroys Express session: `req.session.destroy()`.
- Clears session cookie: `res.clearCookie("connect.sid")`.
- Redirects to `/login`.
- **VERIFIED:** Logout leaves no residual authentication state in memory or client cookies.

---

## 10. INTENT ANALYSIS

| Property | Implementation Reality |
|---|---|
| **Origin Points** | Query parameter (`?intent=seller`), session cache (`req.session.authIntent`), or form field (`req.body.intent`). |
| **Manual Modification** | User can edit `?intent=seller` in the address bar at any time. |
| **Control of DB Role** | **Controls role on REGISTRATION only.** Has **ZERO** control on login for existing users. |
| **Control of UI** | Controls active tab, header subtitle, and dynamic display of seller fields on `/login` and `/register`. |
| **Control of Redirection** | Supposed to inform fallback destination, but overridden by actual DB role upon login. |
| **Survival across Sessions** | Survives in `req.session.authIntent` until overwritten or destroyed by logout. |

---

## 11. returnTo & REDIRECT SECURITY

### Source Tracing
`returnTo` originates from:
1. `redirectToLogin` middleware when an unauthenticated user hits a protected URL:
   `req.session.returnTo = req.originalUrl || req.path;`
2. Form submission query parameter: `?returnTo=/seller/orders`.

### Sanitization Function (`controller/auth.js:validateReturnTo`)
```javascript
function validateReturnTo(raw) {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  // Reject absolute URLs, protocol-relative URLs, javascript:, and external schemes
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("://") || trimmed.toLowerCase().startsWith("javascript:")) {
    return null;
  }
  return trimmed;
}
```

### Open Redirect Test Matrix

| URL Tested | Result | Safe? |
|---|---|---|
| `/home` | Allowed | YES |
| `/seller/dashboard` | Allowed | YES |
| `https://evil.example.com` | Rejected (Returns `null`) | YES |
| `//evil.example.com` | Rejected (Returns `null`) | YES |
| `javascript:alert(1)` | Rejected (Returns `null`) | YES |
| `/seller/dashboard?ref=1` | Allowed | YES |

**VERIFIED:** The application is completely protected against Open Redirect attacks.

---

## 12. ROLE ESCALATION & CONFUSION AUDIT

### Analysis of Privilege Boundaries

1. **Buyer to Seller Escalation via Login:**
   - **Impossible.** Credentials match existing user whose `role` is `'buyer'`. Server reads `user.role` from MongoDB.
2. **Buyer to Seller Escalation via Google OAuth:**
   - **Impossible.** `controller/googleAuth.js` explicitly preserves `user.role` on existing accounts.
3. **Buyer to Admin Escalation via Registration:**
   - **Impossible.** Clamped by `finalRole = requestedRole === "seller" ? "seller" : "buyer"`.
4. **Guest to Seller Registration:**
   - **Allowed by design.** Any guest can choose `role: 'seller'` during registration.
5. **Role Spoofing via Cookie Manipulation:**
   - **Impossible.** Both `connect.sid` and `auth_token` are cryptographically signed with HMAC SHA-256 secrets.

---

## 13. UI SEPARATION ANALYSIS

### Shared Elements in `views/login.ejs` and `views/register.ejs`

1. **Tab Switcher:**
   Both templates render a pill toggle allowing the user to flip between "Buyer / Explorer" and "Merchant / Seller":
   ```html
   <div class="auth-role-tabs">
     <a href="/login?intent=buyer" class="auth-role-tab <%= roleIntent !== 'seller' ? 'active' : '' %>">
     <a href="/login?intent=seller" class="auth-role-tab <%= roleIntent === 'seller' ? 'active' : '' %>">
   </div>
   ```
2. **Shared Form Actions:**
   - Login form posts to `/login` regardless of selected role.
   - Register form posts to `/register` regardless of selected role.
3. **Dynamic Client-Side Toggling:**
   In `public/js/auth.js`, the visibility of `storeNameGroup` is toggled using DOM manipulation rather than distinct, server-rendered views:
   ```javascript
   function syncRoleFields(role) {
     const storeGroup = document.getElementById("storeNameGroup");
     if (storeGroup) storeGroup.style.display = role === "seller" ? "block" : "none";
   }
   ```

---

## 14. AUTHENTICATION NAVIGATION & GATEWAY

### Gateway Flow Map (`views/gateway.ejs`)

```
                          [ GATEWAY PORTAL ]
                                  |
         +------------------------+------------------------+
         |                                                 |
         v                                                 v
  "COMMAND SELLER DECK"                            "EXPLORE THE REALM"
      (#cardArmator)                                 (#cardExplorer)
         |                                                 |
         v                                                 v
   GET /seller/dashboard                               GET /home
         |                                                 |
         v                                                 v
  [requireSeller]                                   [authMiddleware]
  (Unauthenticated)                                 (Unauthenticated)
         |                                                 |
         v                                                 v
  req.session.authIntent = 'seller'                 req.session.authIntent = 'buyer'
  req.session.returnTo = '/seller/dashboard'        req.session.returnTo = '/home'
         |                                                 |
         v                                                 v
    HTTP 302                                          HTTP 302
  Redirect to /login                                Redirect to /login
         |                                                 |
         v                                                 v
  GET /login (renders Seller Tab)                   GET /login (renders Buyer Tab)
```

**Loop Vulnerability Check:**  
No infinite redirect loops were detected. Once authenticated, `/seller/dashboard` renders HTTP 200 for sellers and `/home` renders HTTP 200 for buyers.

---

## 15. DATABASE USER MODEL

### Schema Audit (`models/user.js`)

```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, default: null },
  role: {
    type: String,
    enum: ["buyer", "seller", "admin"],
    default: "buyer"
  },
  storeName: { type: String, trim: true, default: "" },
  homeIsland: {
    type: String,
    enum: ["Cutlass Cove", "Booty Cay", "Velvet Isle", "Kraken Vault", "Chronos", "Astrolabe"],
    default: "Cutlass Cove"
  },
  avatar: { type: String, default: "/images/default-avatar.png" },
  googleId: { type: String, sparse: true, unique: true },
  authSecretHash: { type: String, required: true }
});
```

### Is a Single Unified Model Architecturally Sound?
- **YES.** Having a single `User` collection with a strict `role` enum is standard, robust, and maintains relational integrity with Orders, Products, and Reviews. Splitting into separate `Buyer` and `Seller` collections is **not recommended** as it would unnecessarily complicate Google OAuth identity deduplication and session lookups.

---

## 16. EXISTING TEST COVERAGE

### Audit of Existing Test Suites

1. **`scratch/check_ejs_syntax.js`:**
   - Compiles all 38 EJS template files.
   - Result: **All 38 templates pass cleanly.**
2. **`scratch/test_seller_navbar_unification.js`:**
   - Tests role-based navbar isolation, links, identity badges, and logout across buyer and seller views.
   - Result: **144 assertions passed, 0 failed.**
3. **`scratch/test_aud_6_3_f01_payment_fulfillment_separation.js`:**
   - Tests role authorization on order payment and seller fulfillment isolation.
   - Result: **52 assertions passed, 0 failed.**
4. **`scratch/test_aud_001_multi_seller_fulfillment.js`:**
   - Tests multi-seller lifecycle, seller authorization boundaries, and live HTTP sessions.
   - Result: **100 assertions passed, 0 failed.**
5. **`scratch/test_milestone_1_3.js`:**
   - Historic milestone test for contact, lore, registration, and login primitives.
   - Identified test brittleness: Mock requests omitting `req.query` cause `TypeError` on line 435 of `controller/auth.js`.

### Identified Test Coverage Gaps
- No automated tests for `GET /auth/google/callback` role mismatch.
- No automated test asserting that `req.session.returnTo` survives login.
- No automated test asserting behavior when an authenticated seller visits `/register`.

---

## 17. FULL AUTHENTICATION MATRIX

| Flow | Guest | Buyer | Seller | Admin | Current Code Result | Expected Target Result | Risk Level |
|---|---|---|---|---|---|---|---|
| **Buyer Login (`GET /login?intent=buyer`)** | Renders login page (Buyer tab active) | Shows profile in navbar; accessible | Shows seller profile in navbar | Shows admin profile | Renders form | Renders clean buyer login | Low |
| **Seller Login (`GET /login?intent=seller`)** | Renders login page (Seller tab active) | Shows buyer profile | Shows seller profile | Shows admin profile | Renders form | Renders dedicated Armator login | Low |
| **Submit Buyer Credentials** | Authenticates -> `/home` | Already auth -> Re-authenticates -> `/home` | N/A | N/A | Redirects `/home` | Redirects `/home` | None |
| **Submit Seller Credentials** | Authenticates -> `/seller/dashboard` | N/A | Re-authenticates -> `/seller/dashboard` | N/A | Redirects `/seller/dashboard` | Redirects `/seller/dashboard` | None |
| **Submit Wrong-Role Credentials (e.g. Buyer on Seller Tab)** | Authenticates -> `/home` | Redirects `/home` | N/A | N/A | Redirects to DB role destination | Friendly notice or redirect to role home | Low |
| **Buyer Registration** | Creates `role: 'buyer'` -> `/home` | Creates new or 409 duplicate | Creates new or 409 duplicate | N/A | Creates buyer | Creates buyer | Low |
| **Seller Registration** | Creates `role: 'seller'` -> `/seller/dashboard` | Creates new or 409 duplicate | Creates new or 409 duplicate | N/A | Creates seller | Dedicated seller onboarding | Medium |
| **Google OAuth (New User, Buyer Intent)** | Creates `role: 'buyer'` -> `/home` | N/A | N/A | N/A | Creates buyer | Creates buyer | None |
| **Google OAuth (New User, Seller Intent)** | Creates `role: 'seller'` -> `/seller/dashboard` | N/A | N/A | N/A | Creates seller | Creates seller | Low |
| **Google OAuth (Existing Buyer, Seller Intent)** | Links Google ID -> Redirects `/home` | Preserves `role: 'buyer'` | N/A | N/A | Preserves buyer role | Preserves buyer role & alerts | Low |
| **Google OAuth (Existing Seller, Buyer Intent)** | Links Google ID -> Redirects `/seller/dashboard` | N/A | Preserves `role: 'seller'` | N/A | Preserves seller role | Preserves seller role & alerts | Low |
| **Logout (`GET /logout`)** | Redirects `/login` | Destroys session -> `/login` | Destroys session -> `/login` | Destroys session -> `/login` | Redirects `/login` | Redirects `/login` | None |
| **Login with `returnTo`** | Redirects to role default (`/home` or `/seller/dashboard`) | Redirects to role default | Redirects to role default | Redirects to role default | **BROKEN:** `returnTo` lost | Redirects to deep link destination | **High (P1)** |

---

## 18. DETAILED FINDINGS

### [F-01] Session Regeneration Erases `returnTo` Deep Link Destination
- **ID:** F-01
- **Severity:** **P1 (High)**
- **File:** `controller/auth.js` (lines 359–455)
- **Exact Behavior:** When a user logs in, `req.session.regenerate()` is called to prevent session fixation attacks. Unlike `preLoginSessionCart` (which was cached on line 357), `req.session.returnTo` and `req.session.authIntent` are not saved to local constants prior to regeneration. Once the new session is instantiated, `req.session.returnTo` is `undefined`. Consequently, lines 445–451:
  ```javascript
  const destination = returnTo || (user.role === "seller" ? "/seller/dashboard" : "/home");
  ```
  always evaluate `returnTo` to falsy, and deep link redirection never occurs.
- **Security Impact:** Low (No privilege bypass).
- **UX Impact:** High (Users attempting to checkout or view an order who are prompted to log in are sent to `/home` instead of returning to their checkout/order page).
- **Recommended Fix:** Cache `const savedReturnTo = req.session.returnTo; const savedIntent = req.session.authIntent;` prior to calling `req.session.regenerate()`, and restore them on the new session.

---

### [F-02] Hidden Intent Input Swallowed by HTML Comment in Login Template
- **ID:** F-02
- **Severity:** **P2 (Medium)**
- **File:** `views/login.ejs` (lines 289–295)
- **Exact Behavior:** The hidden intent field is enclosed within an unclosed comment block:
  ```html
  <!-- =================================================================
       HIDDEN INTENT PRESERVATION
  ================================================================== -->
  <!-- Keep role context across form submissions -->
  <input type="hidden" name="intent" value="<%= roleIntent %>">
  <!-- =================================================================
       LOGIN BUTTON
  ================================================================== -->
  ```
  Browsers parse this as part of the HTML comment, preventing `req.body.intent` from ever being submitted in the POST body.
- **Security Impact:** None (Server falls back safely to `req.query.intent` or DB role).
- **UX Impact:** Medium (Loss of client-side role context in certain error re-render flows).
- **Recommended Fix:** Close the comment block properly before the `<input>` tag.

---

### [F-03] Client-Controlled Role Selection on Registration
- **ID:** F-03
- **Severity:** **P2 (Medium)**
- **File:** `views/register.ejs` (line 330) & `controller/auth.js` (line 150)
- **Exact Behavior:** `views/register.ejs` exposes `<select name="role" id="regRole">`, and `registerUser` reads `req.body.role` directly. Any client can register as an Armator (seller) by posting `role=seller`.
- **Security Impact:** Low (Admin is blocked, but unvetted users can become sellers immediately).
- **UX Impact:** Medium (Confusing registration interface where buyer and seller requirements collide).
- **Recommended Fix:** Separate `/buyer/register` and `/seller/register` into dedicated routes with explicit server-assigned roles.

---

### [F-04] Google OAuth Role Intent Fragility on Parallel Tabs
- **ID:** F-04
- **Severity:** **P2 (Medium)**
- **File:** `controller/googleAuth.js` (lines 35–45)
- **Exact Behavior:** `req.session.googleAuth = { state, intent }` stores intent globally in the session. If a user opens buyer login in Tab 1, then opens seller login in Tab 2, and completes OAuth in Tab 1, they may be registered as a seller instead of a buyer.
- **Security Impact:** Low (Affects initial role assignment for new users only; does not affect existing accounts).
- **UX Impact:** Medium (Accidental merchant creation).
- **Recommended Fix:** Encode intent directly into the cryptographic OAuth `state` parameter rather than session root.

---

### [F-05] Unsafe Property Access on `req.query` in Login Controller
- **ID:** F-05
- **Severity:** **P3 (Low)**
- **File:** `controller/auth.js` (line 435)
- **Exact Behavior:**
  ```javascript
  const requestedIntent = (req.body.intent || req.query.intent || req.session?.authIntent || "").toLowerCase().trim();
  ```
  If `req.query` is undefined (e.g., during programmatic unit tests or middleware-free invocation), Node.js throws `TypeError: Cannot read properties of undefined (reading 'intent')`.
- **Security Impact:** None.
- **UX Impact:** Low.
- **Recommended Fix:** Use optional chaining: `req.query?.intent`.

---

### [F-06] Stale `authIntent` Persistence across Gateway Browsing
- **ID:** F-06
- **Severity:** **P3 (Low)**
- **File:** `middleware/auth.js` (lines 80–90)
- **Exact Behavior:** If a guest clicks `#cardArmator` on Gateway, `req.session.authIntent` is set to `'seller'`. If the guest abandons login, returns to Gateway, and clicks a general link, `/login` still renders with the Seller tab active.
- **Security Impact:** None.
- **UX Impact:** Low.
- **Recommended Fix:** Expire or reset `authIntent` when navigating to neutral pages.

---

### [F-07] Shared Error Presentation Bleed
- **ID:** F-07
- **Severity:** **P3 (Low)**
- **File:** `views/login.ejs` & `views/register.ejs`
- **Exact Behavior:** Error flash messages use generic terms that do not reflect whether the error applies to a Buyer or Seller context.
- **Security Impact:** None.
- **UX Impact:** Low.
- **Recommended Fix:** Dedicated error templates for each portal.

---

### [F-08] Documentation Drift regarding Auth Routes
- **ID:** F-08
- **Severity:** **P3 (Low)**
- **File:** `docs/05_ROUTE_MAP.md` & `docs/09_AUTHENTICATION.md`
- **Exact Behavior:** Older documentation files claim dedicated buyer and seller auth routes exist, which is refuted by `routes/web.js`.
- **Security Impact:** None.
- **UX Impact:** Low (Developer confusion).
- **Recommended Fix:** Update documentation to reflect reality after architectural restructuring.

---

## 19. CLASSIFICATION SUMMARY

| Finding ID | Severity | Category | Summary |
|---|---|---|---|
| **F-01** | **P1 (High)** | Session Management | `req.session.returnTo` lost during `session.regenerate()`, breaking post-login deep linking. |
| **F-02** | **P2 (Medium)** | Template Defect | Hidden `intent` input enclosed inside HTML comment in `views/login.ejs`. |
| **F-03** | **P2 (Medium)** | Architecture / UX | Client-controlled `role` field on registration allows unvetted seller creation. |
| **F-04** | **P2 (Medium)** | OAuth Security | Session-level OAuth intent can drift if user opens parallel login tabs. |
| **F-05** | **P3 (Low)** | Code Robustness | Missing optional chaining on `req.query?.intent` in `controller/auth.js`. |
| **F-06** | **P3 (Low)** | Session Hygiene | Stale `authIntent` persists after navigating back to Gateway. |
| **F-07** | **P3 (Low)** | UI / UX | Generic error messaging across merged auth templates. |
| **F-08** | **P3 (Low)** | Documentation | Documentation claims dedicated auth routes exist contrary to code. |

---

## 20. RECOMMENDED TARGET ARCHITECTURE

### Evaluation of Architectural Options

#### Option A: Dedicated Routes & Templates with Shared Low-Level Primitives (RECOMMENDED)
- **Routes:**
  - Buyer: `GET /buyer/login`, `POST /buyer/login`, `GET /buyer/register`, `POST /buyer/register`
  - Seller: `GET /seller/login`, `POST /seller/login`, `GET /seller/register`, `POST /seller/register`
  - Legacy Aliases: `/login` and `/register` redirect based on intent or default to `/buyer/login`.
- **Controllers:** Shared auth core (`services/authService.js`) handling bcrypt hashing, token signing, and session regeneration, wrapped by dedicated buyer and seller controllers.
- **Templates:** Completely separate views (`views/buyer/login.ejs`, `views/seller/login.ejs`, `views/buyer/register.ejs`, `views/seller/register.ejs`).
- **Evaluation:**
  - **Security:** High. Role is fixed by the route itself; clients cannot spoof `role` via form fields.
  - **Maintainability:** High. Eliminates client-side DOM swapping and tangled query intent logic.
  - **UX:** Excellent. Clear visual distinction between entering the marketplace as a buyer vs commanding an Armator merchant deck.

#### Option B: Shared Routes with Server-Side Intent Enforcement
- Retains `/login?intent=seller` and `/register?intent=seller`.
- **Evaluation:** Brittle. Query strings are easily lost during redirects, form errors, and OAuth round-trips. Not recommended.

#### Option C: Split Database Models (Buyer vs Seller Collections)
- **Evaluation:** High risk and unnecessary. Splits user identity, complicates Google OAuth deduplication, and breaks existing Order/Product foreign keys. **Strongly rejected.**

---

## 21. RECOMMENDED FIX ORDER (FOR FUTURE IMPLEMENTATION)

When the user authorizes implementation, execute changes in the following discrete phases:

1. **Step 1: Fix Session Regeneration Bug (P1 - F-01):**
   - Update `controller/auth.js` to preserve `returnTo` and `authIntent` across `session.regenerate()`.
2. **Step 2: Correct Template HTML Comment (P2 - F-02):**
   - Close the comment tag in `views/login.ejs` so `req.body.intent` is transmitted properly.
3. **Step 3: Harden `req.query` Access (P3 - F-05):**
   - Change `req.query.intent` to `req.query?.intent` in `controller/auth.js:435`.
4. **Step 4: Implement Dedicated Route Architecture (Option A):**
   - Create `/buyer/login`, `/buyer/register`, `/seller/login`, `/seller/register` in `routes/web.js`.
   - Separate views into dedicated directories with zero client-side role toggling.
   - Enforce hardcoded `role = 'buyer'` on buyer endpoints and `role = 'seller'` on seller endpoints.
5. **Step 5: Harden Google OAuth State (P2 - F-04):**
   - Encode intent directly into the signed OAuth `state` parameter.

---

## 22. EXPLICIT "DO NOT IMPLEMENT IN THIS AUDIT" SECTION

In accordance with the absolute constraints of this forensic audit task:

- **NO PRODUCTION CODE HAS BEEN MODIFIED.**
  - `controller/auth.js` remains unmodified.
  - `controller/googleAuth.js` remains unmodified.
  - `routes/web.js` remains unmodified.
  - `middleware/auth.js` and `middleware/roles.js` remain unmodified.
  - `models/user.js` remains unmodified.
  - `views/login.ejs` and `views/register.ejs` remain unmodified.
  - All CSS and client-side JavaScript remain unmodified.
- **NO ROUTES HAVE BEEN CREATED OR RENAMED.**
- **NO REFACTORING HAS BEEN PERFORMED.**
- **NO TESTS HAVE BEEN MODIFIED.**
- This document serves strictly as an empirical, read-only architectural audit.
