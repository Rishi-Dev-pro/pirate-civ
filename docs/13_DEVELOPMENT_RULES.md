# 🏴‍☠️ 13_DEVELOPMENT_RULES — Cardinal Development Rules

This document establishes the **15 non-negotiable engineering laws** of Pirate-Civ. Every developer and AI assistant contributing to this codebase is bound by these rules.

---

## ⚓ The 15 Cardinal Rules

### 📜 RULE 1: Do Not Rewrite Working Features Without Reason
Never refactor, replace, or re-implement an existing working feature unless it is broken or an explicit task instruction requires it. If code functions correctly, build upon it.

### 📜 RULE 2: Preserve Express 5 + EJS Architecture
Do not convert the project to React, Next.js, Vue, or any client-side SPA framework unless explicitly ordered by the user. Pirate-Civ is intentionally an Express + EJS platform.

### 📜 RULE 3: No Fake Backend Functionality
Never mock backend endpoints or simulate database persistence in client-side storage while claiming the feature is complete. If an endpoint is a stub or frontend-only, clearly label it in comments and documentation.

### 📜 RULE 4: Database Is the Single Source of Truth
The MongoDB database must be the sole source of truth for:
* Users & Merchant Profiles
* Products & Island Inventories
* Cargo Manifests (Carts)
* Customer Orders & Fulfillment Records

### 📜 RULE 5: Do Not Hardcode Dynamic Marketplace Data
Never hardcode product arrays, merchant rosters, or order lists into EJS views or static client JavaScript. Fetch data dynamically via Mongoose models.

### 📜 RULE 6: Do Not Duplicate Product Data Between Files
Eliminate split data dictionaries (e.g. duplicating item descriptions in both `controller/islands.js` and `public/js/mindmap.js`). Define data once in MongoDB.

### 📜 RULE 7: Use Reusable Templates & Components
Avoid creating redundant views for identical experiences. All product detail views must use the shared `views/product_detail.ejs`. All global headers, footers, and alert modals must be partials.

### 📜 RULE 8: Enforce Backend Role Authorization
Never rely solely on frontend logic or hidden buttons to protect sensitive operations. Every protected backend route must verify roles via middleware (`requireRole('seller')`, `requireRole('buyer')`).

### 📜 RULE 9: Strict Merchant Isolation
A seller can view, edit, or delete **ONLY** their own products and order items. Every mutating controller must explicitly verify `product.seller.equals(req.user._id)`.

### 📜 RULE 10: Justify New Dependencies
Do not run `npm install` for convenience packages when native Node.js or existing packages suffice. If a new library is necessary, record the rationale in documentation.

### 📜 RULE 11: Record Deleted Functionality
Never silently delete a route, controller, view, or asset. If deprecation is necessary, record the reason in [`14_DECISION_LOG.md`](./14_DECISION_LOG.md) and [`15_CHANGELOG.md`](./15_CHANGELOG.md).

### 📜 RULE 12: Inspect Before Modifying
Before editing any file, inspect all existing references and imports across the codebase (`grep_search` or `view_file`) to ensure changes will not produce cascade breakage.

### 📜 RULE 13: Test Affected Flows After Changes
After modifying a model, route, or controller, manually test the affected user flows (e.g., login, checkout, product edit) to verify end-to-end functionality.

### 📜 RULE 14: Update Project Documentation Continuously
Documentation is a primary deliverable. After completing any meaningful task:
1. Update [`16_CURRENT_TASK.md`](./16_CURRENT_TASK.md)
2. Update [`01_PROJECT_STATUS.md`](./01_PROJECT_STATUS.md)
3. Update [`15_CHANGELOG.md`](./15_CHANGELOG.md)
4. Update architectural docs when designs change.

### 📜 RULE 15: Never Claim Completion Without Verification
Never mark a task, feature, or phase as "Complete" unless the code runs without runtime errors, connects to the database, and has been verified.

---

## 🛡️ Pre-Commit Verification Checklist

Before ending any development session, verify:
- [ ] No server startup crashes (`npm start` boots smoothly).
- [ ] No unhandled Promise rejections or orphaned console errors.
- [ ] All new routes are registered with appropriate middleware guards.
- [ ] MongoDB queries use proper indexing and error handling (`try/catch`).
- [ ] Sensitive operations verify user ownership.
- [ ] Documentation files in `/docs` reflect the current reality.
