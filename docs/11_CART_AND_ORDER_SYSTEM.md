# 🏴‍☠️ 11_CART_AND_ORDER_SYSTEM — Cargo Manifest & Order Fulfillment

This document defines the architecture of the Cargo Manifest (Cart), the checkout transaction process, and the multi-merchant Order Fulfillment state machine.

---

## 1. Cart Architecture & Lifecycle

```mermaid
stateDiagram-v2
    [*] --> EmptyCart: User Created
    EmptyCart --> ActiveCart: Add Product from Island or Details Sheet
    ActiveCart --> ActiveCart: Update Quantity (Check Stock in DB)
    ActiveCart --> ActiveCart: Remove Item
    ActiveCart --> EmptyCart: Remove Last Item
    ActiveCart --> Checkout: Proceed to Checkout
    Checkout --> OrderPlaced: Submit Delivery Coordinates
    OrderPlaced --> EmptyCart: Cart Cleared in DB
```

### 1.1 Migration from Frontend / Session to MongoDB (Milestone 2.3 Foundation)
* **Foundation Implemented:**
  1. `models/cart.js` implements persistent Cart schema linked to unified `User` (`user: { type: ObjectId, ref: 'User', unique: true }`).
  2. Embedded items structure: `items: [{ product: ObjectId (ref: 'Product'), quantity: Number (min: 1, integer) }]`.
  3. Built-in helpers: `cart.addItem(productId, quantity)` merges quantities without duplicating entries; `cart.removeItem(productId, quantity)` safely decrements or removes items; `Cart.findByUser(userId)` queries persistent cart.
  4. Server-Side Session Migration: When an explorer authenticates, `Cart.mergeSessionCart(user._id, preLoginSessionCart)` migrates guest session items into MongoDB, combining existing item quantities and safely filtering nonexistent products and invalid quantities without crashing.
  5. User Isolation: Cart is strictly bound to `req.user._id`; client-provided user IDs cannot override ownership.
* **Remaining for Phase 3:** Buyer REST endpoints (`/cart/add`, `/cart/remove`) and client-side drawer API wiring.
* **Scope Boundary:** Stock reservation, checkout, and order placement belong to Milestone 2.4 / Phase 5.

---

## 2. Checkout Flow & Order Generation

```
[Review Cart] ──► [Input Delivery Coordinates] ──► [Confirm Doubloons Total]
                                                            │
                                                            ▼
                                              [Atomic Checkout Execution]
                                              1. Lock/Verify Stock
                                              2. Deduct Inventory
                                              3. Create Order Document
                                              4. Wipe Cart Document
                                              5. Emit Confirmation
```

1. **Payment Abstraction:** Payments are processed in native Doubloons (🪙). No third-party payment gateways (Stripe, PayPal) are integrated unless explicitly ordered.
2. **Snapshot Pricing:** When an order is placed, line items capture snapshot fields (`name`, `price`, `image`, `seller`) directly inside the order document. If a seller later changes the price of the product, historical orders remain unaffected.
3. **Atomic Stock Reduction:** Product stock is decremented at the moment of order placement. If an item runs out of stock while in checkout, the transaction aborts with an alert.

---

## 3. Order Status State Machine

Orders progress through an immutable lifecycle:

```mermaid
stateDiagram-v2
    [*] --> Pending: Buyer Submits Checkout
    Pending --> Confirmed: Order Accepted by System
    Confirmed --> Processing: Merchant Packs Cargo at Harbor
    Processing --> Shipped: Vessel Sets Sail (In Transit)
    Shipped --> Delivered: Cargo Discharged at Buyer Port
    
    Pending --> Cancelled: Cancelled by Buyer/Merchant
    Confirmed --> Cancelled: Stock Issue / Heavy Gale
    Processing --> Cancelled: Cargo Damaged
    
    Delivered --> [*]
    Cancelled --> [*]
```

### 3.1 Permitted Transitions
* `pending` ➔ `confirmed` (System validation)
* `confirmed` ➔ `processing` (Merchant marks item being prepared)
* `processing` ➔ `shipped` (Merchant flags fleet departed)
* `shipped` ➔ `delivered` (Final dock receipt)
* `pending` / `confirmed` / `processing` ➔ `cancelled` (Order revoked; restores stock to Product)

---

## 4. Multi-Seller Order Coordination

Because Pirate-Civ is a marketplace, a single customer order may contain artifacts purchased from multiple independent merchants:

```
[Order #7842 - Total: 180 Doubloons]
  ├── Item 1: Seville Astrolabe (85 🪙)  ──> Seller: Captain Thorne (Astrolabe Atoll)
  └── Item 2: Toledo Boarding Sabre (95 🪙) ──> Seller: Master Morales (Cutlass Cove)
```

1. **Merchant Visibility Isolation:**
   - In the `/seller/orders` queue, Captain Thorne only sees Item 1.
   - Master Morales only sees Item 2.
2. **Overall Order Status:**
   - The master order status reflects the composite progress of all contained line items (or tracks per-item status).
