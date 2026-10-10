# 🏴‍☠️ Pirate-Civ Documentation Index

Welcome to the central documentation archive of **Pirate-Civ**, a pirate-themed two-sided e-commerce marketplace built with Express 5, EJS, and MongoDB.

This `/docs` directory serves as the **immutable source of truth and living memory** for the entire project. Before writing any code or beginning a new development session, developers and AI agents must consult these documents.

---

## 🧭 Documentation Map & Reading Order

| File | Document | Purpose & Description | When to Consult |
|---|---|---|---|
| [`00_PROJECT_VISION.md`](./00_PROJECT_VISION.md) | **Project Vision** | High-level product definition, user roles (Buyer vs Seller), end-to-end user journeys, and cartographic world lore. | Starting work, onboarding, conceptual alignment. |
| [`01_PROJECT_STATUS.md`](./01_PROJECT_STATUS.md) | **Current Real Status** | Ground-truth inventory of what is Complete, Partial, Frontend-only, Backend-only, Broken, and Missing. | Before planning any implementation task. |
| [`02_MASTER_ROADMAP.md`](./02_MASTER_ROADMAP.md) | **Master Roadmap** | 6-phase master execution plan from authentication foundation to final UI polish. | Understanding milestones, sequencing, and next steps. |
| [`03_ARCHITECTURE.md`](./03_ARCHITECTURE.md) | **System Architecture** | Technical architecture, Express 5 + EJS pipeline, MVC flow, middleware chains, and state management. | Structuring controllers, routes, and data flows. |
| [`04_DATABASE_DESIGN.md`](./04_DATABASE_DESIGN.md) | **Database Design** | Mongoose schemas, Unified User model, Product, Cart, Order, Contact collections, relations, and indexes. | Designing or querying database entities. |
| [`05_ROUTE_MAP.md`](./05_ROUTE_MAP.md) | **Route Map** | Complete HTTP route registry with methods, controllers, middlewares, auth/role requirements, and templates. | Adding or modifying routes and endpoints. |
| [`06_FEATURE_SPECIFICATION.md`](./06_FEATURE_SPECIFICATION.md) | **Feature Specifications** | Deep specifications for all 20 platform features (UI behavior, backend logic, error states, and edge cases). | Implementing a specific feature. |
| [`07_BUYER_SYSTEM.md`](./07_BUYER_SYSTEM.md) | **Buyer System** | Detailed customer experience: entry map, sea chart, island navigation, product detail, explorer, cart, checkout, order tracking. | Building or updating buyer-facing flows. |
| [`08_SELLER_SYSTEM.md`](./08_SELLER_SYSTEM.md) | **Seller System** | Detailed merchant platform: seller onboarding, dashboard, catalog management (CRUD), inventory, incoming orders, and fulfillment. | Building or updating seller-facing flows. |
| [`09_AUTHENTICATION.md`](./09_AUTHENTICATION.md) | **Authentication & Security** | Security architecture: sessions, signed cookies, crypto token hashing, role authorization, Remember Me, Google OAuth. | Modifying auth, sessions, cookies, or role guards. |
| [`10_PRODUCT_SYSTEM.md`](./10_PRODUCT_SYSTEM.md) | **Product System** | Product lifecycle, catalog structure, 6 islands, categories, Doubloons currency, and MongoDB seeding strategy. | Managing product catalog and seed scripts. |
| [`11_CART_AND_ORDER_SYSTEM.md`](./11_CART_AND_ORDER_SYSTEM.md) | **Cart & Order System** | Cart state transition (localStorage to MongoDB), checkout flow, order lifecycle, status state machine, and merchant fulfillment. | Implementing cart, checkout, and order features. |
| [`12_UI_UX_GUIDELINES.md`](./12_UI_UX_GUIDELINES.md) | **UI/UX Design Guidelines** | Visual identity: dark nautical fantasy, parchment, brass filigree, embers, smoke, typography, and responsive design rules. | Styling pages, designing layouts, or adding components. |
| [`13_DEVELOPMENT_RULES.md`](./13_DEVELOPMENT_RULES.md) | **Development Rules** | Strict engineering guardrails (15 cardinal rules), verification checklists, and anti-patterns. | **Mandatory before modifying any code.** |
| [`14_DECISION_LOG.md`](./14_DECISION_LOG.md) | **Decision Log (ADR)** | Permanent log of architectural decisions (Decisions 001–007+), context, trade-offs, and consequences. | Reviewing why decisions were made before refactoring. |
| [`15_CHANGELOG.md`](./15_CHANGELOG.md) | **Changelog** | Chronological record of changes, fixes, tests, and deliverables per phase. | Updating at the close of every phase. |
| [`16_CURRENT_TASK.md`](./16_CURRENT_TASK.md) | **Current Task & Memory** | **Most critical short-term memory file.** Active phase, active task, blockers, modified files, and handoff notes. | **Read first upon session start; update before session end.** |
| [`17_DEVELOPMENT_WORKFLOW_RULES.md`](./17_DEVELOPMENT_WORKFLOW_RULES.md) | **Workflow Rules** | Permanent development principles: Scope discipline, Ponytail minimal code, Ralph Loop, GSD, and Git practices. | Before planning or writing any code. |

---

## ⚓ Documentation Maintenance Protocol

1. **Continuous Documentation:** Documentation is not a post-project chore; it is an active deliverable of every development phase.
2. **Before Starting a Task:**
   - Read [`16_CURRENT_TASK.md`](./16_CURRENT_TASK.md)
   - Read [`01_PROJECT_STATUS.md`](./01_PROJECT_STATUS.md)
   - Read [`02_MASTER_ROADMAP.md`](./02_MASTER_ROADMAP.md)
   - Verify architectural rules in [`13_DEVELOPMENT_RULES.md`](./13_DEVELOPMENT_RULES.md)
3. **After Completing a Task:**
   - Update [`16_CURRENT_TASK.md`](./16_CURRENT_TASK.md) with exact work done, tests performed, and next steps.
   - Update [`01_PROJECT_STATUS.md`](./01_PROJECT_STATUS.md) to reflect actual codebase state changes.
   - Update [`15_CHANGELOG.md`](./15_CHANGELOG.md) with a dated entry.
   - If an architectural choice was made, record it in [`14_DECISION_LOG.md`](./14_DECISION_LOG.md).
