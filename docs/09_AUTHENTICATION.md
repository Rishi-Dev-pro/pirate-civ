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

## 5. Google OAuth 2.0 Integration Strategy

1. **Flow Initiation:** User clicks *"Sign in with Google"* at `/auth/google`.
2. **Consent & Callback:** Google redirects to `/auth/google/callback` with authorization code.
3. **Identity Resolution:**
   - Check if a user with `googleId` exists.
   - If found: generate new `authSecretHash`, establish session, set signed cookie.
   - If not found: check if email exists. If so, link `googleId`. If not, create new user document with `role: 'buyer'`, random password, and `googleId`.
4. **Redirection:** Direct buyer to `/home` or seller to `/seller/dashboard`.

---

## 6. Protection Matrix

| Route Pattern | `authMiddleware` | Role Middleware | Permitted Users |
|---|:---:|:---:|---|
| `/login`, `/register`, `/buyer/*`, `/seller/login` | No (Guest) | N/A | Unauthenticated |
| `/`, `/about`, `/contact` | Optional | None | All |
| `/home`, `/islands`, `/island/*`, `/product/*` | **Required** | None | Authenticated (Buyers & Sellers) |
| `/cart`, `/checkout`, `/orders`, `/profile` | **Required** | `requireBuyer` | Buyers & Admins |
| `/seller/dashboard`, `/seller/products/*`, `/seller/orders/*` | **Required** | `requireSeller` | Sellers & Admins |
