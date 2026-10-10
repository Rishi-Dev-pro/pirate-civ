# 🏴‍☠️ 16_CURRENT_TASK — Active Development Memory & State

```
┌────────────────────────────────────────────────────────────────────────┐
│ SESSION CONTINUITY DIRECTIVE:                                          │
│ This file is the primary short-term memory of Pirate-Civ.              │
│ EVERY new session MUST begin by reading this document.                 │
│ EVERY completed session MUST update this document before handoff.      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📍 1. Current Phase
* **Active Phase:** **Phase 1 — Foundation & Authentication**
* **Active Milestone:** **Milestone 1.1 — Unified User Schema**
* **Status:** **COMPLETE**

---

## 🎯 2. Current Task
* **Task Name:** Milestone 1.1 — Unified User Schema Foundation
* **Status:** Complete, Tested, Verified, and Documented.

---

## ✅ 3. Completed in This Task
* Updated [`models/user.js`](file:///d:/projects%202.0/main/pirate-civ/models/user.js):
  - Added `role` field: `['buyer', 'seller', 'admin']` with default `'buyer'`.
  - Added optional merchant profile fields: `storeName` (String, default null), `homeIsland` (String, default null), `bio` (String, default ""), and `avatar` (String, default default avatar).
  - Added `googleId` field with `sparse: true` and `unique: true` indexes for future Google OAuth integration.
  - Preserved all existing legacy fields (`name`, `email`, `password`, `authSecretHash`, `timestamps`).
* Created [`docs/17_DEVELOPMENT_WORKFLOW_RULES.md`](file:///d:/projects%202.0/main/pirate-civ/docs/17_DEVELOPMENT_WORKFLOW_RULES.md) establishing permanent engineering and Ralph Loop workflow rules.
* Ran automated validation test suite: 25 assertions covering default buyer role, seller profile fields, admin role, invalid role rejection, googleId sparse indexing, and legacy auth validation (25/25 passed).
* Performed syntax and integrity checks on server entry point (`node --check index.js`).
* Synchronized documentation: [`docs/01_PROJECT_STATUS.md`](file:///d:/projects%202.0/main/pirate-civ/docs/01_PROJECT_STATUS.md), [`docs/15_CHANGELOG.md`](file:///d:/projects%202.0/main/pirate-civ/docs/15_CHANGELOG.md), and [`docs/README.md`](file:///d:/projects%202.0/main/pirate-civ/docs/README.md).

---

## ⏳ 4. Currently Working On
* Milestone 1.1 is finalized. Ready to proceed to Milestone 1.2 upon instruction.

---

## 🔮 5. Next Task
* **Phase 1, Milestone 1.2:** Role-Based Authorization Middleware
  - Create `middleware/roles.js` (`requireRole`, `requireSeller`, `requireBuyer`).
  - Unit test role protection against unauthorized routes.
  - *Note: Milestone 1.2 is NOT started yet.*

---

## 🛑 6. Blockers
* **None.**

---

## 📝 7. Files Modified in Milestone 1.1
* [`models/user.js`](file:///d:/projects%202.0/main/pirate-civ/models/user.js) — Unified User schema updates.
* [`docs/17_DEVELOPMENT_WORKFLOW_RULES.md`](file:///d:/projects%202.0/main/pirate-civ/docs/17_DEVELOPMENT_WORKFLOW_RULES.md) — Antigravity workflow rules document.
* [`docs/01_PROJECT_STATUS.md`](file:///d:/projects%202.0/main/pirate-civ/docs/01_PROJECT_STATUS.md) — Updated model status.
* [`docs/15_CHANGELOG.md`](file:///d:/projects%202.0/main/pirate-civ/docs/15_CHANGELOG.md) — Milestone 1.1 changelog entry.
* [`docs/16_CURRENT_TASK.md`](file:///d:/projects%202.0/main/pirate-civ/docs/16_CURRENT_TASK.md) — Active memory synchronization.
* [`docs/README.md`](file:///d:/projects%202.0/main/pirate-civ/docs/README.md) — Index updated with workflow rules document.

---

## 🧪 8. Tests Performed
* 25/25 automated schema validation assertions passed.
* Node syntax check on `index.js` passed (exit code 0).
* Git diff review completed.

---

## ⚠️ 9. Known Codebase Issues (Queued for Subsequent Phase 1 Milestones)
1. **Contact Form Markdown Syntax Bug:** `views/contact.ejs` lines 1 & 222 have markdown ticks.
2. **About Page Boilerplate Copy:** `views/about.ejs` has generic academic text instead of pirate marketplace lore.
3. **Dead Student Mock Data:** `routes/web.js` passes mock university students to `home.ejs`.
4. **Auth Error UX:** `controller/auth.js` returns raw string errors via `res.send(...)`.
5. **Remember Me Checkbox:** Present on frontend login form but ignored by backend session logic.

---

## 🚫 10. DO NOT TOUCH
* **`public/js/mindmap.js` Canvas Math & Animations:** Do NOT modify SVG S-curve math, animation timers, or decor layers.
* **`views/home.ejs` Sea Chart Grid:** Retain full layout and visual DOM elements.
* **`views/islands/*.ejs` CSS Themes:** Retain the distinct aesthetic identities of the 6 islands.
