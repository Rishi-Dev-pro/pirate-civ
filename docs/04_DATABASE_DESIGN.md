# 🏴‍☠️ 04_DATABASE_DESIGN — Database Schema & Data Modeling

This document defines the official MongoDB schema specifications for Pirate-Civ via Mongoose ODM.

```
┌────────────────────────────────────────────────────────────────────────┐
│ CRITICAL DESIGN DECISION (Decision 001):                               │
│ Do NOT create separate authentication models for Buyers and Sellers    │
│ (e.g. no 'Buyer' model and separate 'Seller' model).                   │
│ Pirate-Civ utilizes a UNIFIED User model with a 'role' field.          │
│ This prevents redundant authentication pipelines, simplifies session   │
│ management, and allows seamless account transitions.                   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--o{ PRODUCT : "sells (if role=seller)"
    USER ||--o| CART : "owns"
    USER ||--o{ ORDER : "places (as buyer)"
    PRODUCT ||--o{ CART_ITEM : "referenced in"
    PRODUCT ||--o{ ORDER_ITEM : "snapshot in"
    ORDER ||--|{ ORDER_ITEM : "contains"
    USER ||--o{ ORDER_ITEM : "fulfilled by (seller)"

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role "buyer | seller | admin"
        string avatar
        string bio
        string storeName
        string homeIsland
        string googleId
        string authSecretHash
        date createdAt
        date updatedAt
    }

    PRODUCT {
        ObjectId _id PK
        ObjectId seller FK
        string name
        string slug UK
        number price "in Doubloons"
        string description
        string image
        string island "astrolabe|chronos|kraken_vault|cutlass_cove|velvet_isle|booty_cay"
        string category
        number stock
        boolean isAvailable
        string rating
        date createdAt
        date updatedAt
    }

    CART {
        ObjectId _id PK
        ObjectId user FK, UK
        array items
        date updatedAt
    }

    ORDER {
        ObjectId _id PK
        ObjectId buyer FK
        array items
        number totalDoubloons
        string status "pending|confirmed|processing|shipped|delivered|cancelled"
        object shippingAddress
        date createdAt
    }

    CONTACT {
        ObjectId _id PK
        string name
        string email
        string subject
        string message
        date createdAt
    }
```

---

## 2. Detailed Schema Specifications

### 2.1 The Unified User Collection (`models/user.js`)
Represents all system users (Buyers, Sellers, Admins).

```javascript
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide your pirate name or alias"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Please provide an email address"],
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: function() { return !this.googleId; } // optional if registered via Google OAuth
    },
    role: {
        type: String,
        enum: ["buyer", "seller", "admin"],
        default: "buyer",
        index: true
    },
    avatar: {
        type: String,
        default: "/images/avatars/default-pirate.png"
    },
    // Merchant Profile Fields (Active when role === 'seller')
    storeName: {
        type: String,
        trim: true,
        default: null
    },
    bio: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ""
    },
    homeIsland: {
        type: String,
        enum: ["astrolabe", "chronos", "kraken_vault", "cutlass_cove", "velvet_isle", "booty_cay", null],
        default: null
    },
    // Authentication & Security Digits
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },
    authSecretHash: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});
```

### 2.2 The Product Collection (`models/product.js`)
Represents items listed across the 6 islands and trading categories.

```javascript
const productSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true
    },
    price: {
        type: Number,
        required: [true, "Price in Doubloons is required"],
        min: [1, "Price must be at least 1 Doubloon"]
    },
    description: {
        type: String,
        required: [true, "Product description is required"],
        trim: true
    },
    image: {
        type: String,
        required: [true, "Product image path is required"],
        default: "/images/items/default-relic.png"
    },
    island: {
        type: String,
        required: [true, "Product must belong to an official island"],
        enum: [
            "astrolabe",
            "chronos",
            "kraken_vault",
            "cutlass_cove",
            "velvet_isle",
            "booty_cay"
        ],
        index: true
    },
    category: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    stock: {
        type: Number,
        required: true,
        default: 10,
        min: [0, "Stock cannot be negative"],
        validate: {
            validator: Number.isInteger,
            message: "Stock must be an integer value"
        }
    },
    isAvailable: {
        type: Boolean,
        default: true,
        index: true
    },
    rating: {
        type: String,
        default: "★★★★★"
    }
}, {
    timestamps: true
});

// Compound Indexes:
// 1. { island: 1, isAvailable: 1 } -> Fast island shop filtering
// 2. { seller: 1, createdAt: -1 }   -> Fast merchant product catalog queries
productSchema.index({ island: 1, isAvailable: 1 });
productSchema.index({ seller: 1, createdAt: -1 });

// Static & Instance Helpers:
productSchema.statics.findBySeller = function(sellerId, filter = {}) {
    return this.find({ seller: sellerId, ...filter }).sort({ createdAt: -1 });
};

productSchema.methods.isOwnedBy = function(userOrId) {
    if (!userOrId || !this.seller) return false;
    const ownerId = this.seller._id || this.seller;
    const compareId = userOrId._id || userOrId;
    if (ownerId && typeof ownerId.equals === "function") {
        return ownerId.equals(compareId);
    }
    return String(ownerId) === String(compareId);
};
```

#### 2.2.1 Seller ↔ Product Relationship Architecture
* **Cardinality:** `User (1) ──── owns ──── (N) Product`
* **Unified Merchant Model:** Merchants are unified inside the `User` collection with `role = "seller"`. No separate `Seller` or `Vendor` collection exists.
* **Ownership Reference:** The `Product.seller` path stores the `ObjectId` of the merchant user (`ref: 'User'`).
* **Query Isolation:** Products for a given seller are queried via `Product.findBySeller(sellerId)` or `Product.find({ seller: sellerId })`. Index `{ seller: 1, createdAt: -1 }` guarantees rapid indexed retrieval. Empty sellers return `[]`.
* **Safe Ownership Verification:** Controllers verify ownership via `product.isOwnedBy(req.user)` before mutations.
* **Population & Security:** Population resolves via `Product.populate('seller', '-password -authSecretHash')`, strictly omitting authentication secrets.


### 2.3 The Cart Collection (`models/cart.js`)
Maintains server-persisted shopping bags for authenticated buyers.

```javascript
const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    }
}, { _id: false });

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true
    },
    items: [cartItemSchema]
}, {
    timestamps: true
});

// Methods & Statics:
// 1. cart.addItem(productId, quantity): Merges quantities without duplicating product entries
// 2. cart.removeItem(productId, quantity): Decrements or removes items
// 3. Cart.findByUser(userId): Queries user's persistent cart
// 4. Cart.mergeSessionCart(userId, sessionCart): Migrates session cart upon authentication
```

#### 2.3.1 Persistent Cart Architecture & Session Integration
* **Cardinality:** `User (1) ──── owns ──── (1) Cart ──── contains ──── (N) Cart Items`
* **Authoritative Source:** MongoDB is the authoritative state for authenticated users' shopping carts.
* **Session Migration:**
  - When an unauthenticated user logs in with an active session cart (`req.session.cart`), `Cart.mergeSessionCart(user._id, preLoginSessionCart)` migrates the session items into the database.
  - If a product already exists in the persistent cart: `quantity = dbQuantity + sessionQuantity`.
  - If a product is new: the item is appended to `items`.
  - Duplicate session entries are normalized into a single product entry.
  - Nonexistent products or invalid quantities (negative, fractional, non-integer) are safely skipped without crashing the login process.
  - The session cart is cleared upon successful migration.
* **Ownership & Security:** Carts belong strictly to the authenticated `User._id`. Cart operations cannot be overridden via client-provided user IDs. Sensitive authentication secrets are never stored in or leaked through Cart population.
* **Stock Invariance:** Adding products to the cart does **not** alter or reserve `Product.stock`. Inventory deduction occurs only during order placement (Phase 2 → Milestone 2.4 / Phase 5).


### 2.4 The Order Collection (`models/order.js`)
Captures transactions, historical snapshot pricing, buyer information, multi-seller line items, and lifecycle transitions.

```javascript
const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product reference is required"]
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Seller reference is required"],
        index: true
    },
    name: { type: String, required: [true, "Product name snapshot is required"], trim: true },
    price: { type: Number, required: [true, "Unit price snapshot is required"], min: [0, "Unit price cannot be negative"] }, // Doubloons snapshot at purchase time
    quantity: {
        type: Number,
        required: [true, "Quantity is required"],
        min: [1, "Quantity must be at least 1"],
        validate: { validator: Number.isInteger, message: "Quantity must be an integer" }
    },
    lineTotal: {
        type: Number,
        required: [true, "Line total is required"],
        min: [0, "Line total cannot be negative"]
    },
    image: { type: String, trim: true, default: "/images/items/default-relic.png" }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Buyer reference is required"],
        index: true
    },
    items: {
        type: [orderItemSchema],
        validate: {
            validator: (items) => Array.isArray(items) && items.length > 0,
            message: "Order must contain at least one item"
        }
    },
    subtotal: {
        type: Number,
        min: [0, "Subtotal cannot be negative"]
    },
    totalDoubloons: {
        type: Number,
        required: [true, "Total in Doubloons is required"],
        min: [0, "Total Doubloons cannot be negative"]
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
        default: "pending",
        index: true
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
        index: true
    },
    shippingAddress: {
        portName: { type: String, required: [true, "Port name is required"], trim: true },
        islandCoordinates: { type: String, default: "18°42'N, 64°31'W", trim: true },
        recipientNotes: { type: String, default: "", trim: true }
    }
}, {
    timestamps: true
});

// Compound Indexes:
// 1. { buyer: 1, createdAt: -1 }      -> Fast customer order history sorting
// 2. { "items.seller": 1, status: 1 } -> Fast merchant order fulfillment queues
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ "items.seller": 1, status: 1 });

// Methods & Statics:
// 1. order.canTransitionTo(status): Validates lifecycle transition rules
// 2. order.transitionTo(status): Advances status or throws Error if invalid
// 3. Order.findByBuyer(buyerId, filter): Queries orders for a buyer sorted newest first
// 4. Order.findBySeller(sellerId, filter): Queries orders containing items for a merchant
```

#### 2.4.1 Historical Snapshot Integrity & Multi-Seller Architecture
* **Historical Data Immutability:** When an order is placed, line items capture immutable snapshots (`name`, `price`, `quantity`, `lineTotal`, `seller`, `image`). If a merchant later alters product title, price, or description in `products`, past orders remain entirely unchanged.
* **Stock Invariance:** The Order model database foundation does not mutate or deduct `Product.stock`. Stock deduction is atomic during Phase 5 checkout.
* **Multi-Seller Independence:** Orders contain items from independent merchants; each item maintains `seller: ObjectId (ref: 'User')`. Merchant order queries via `Order.findBySeller(sellerId)` isolate relevant orders through the `{ "items.seller": 1, status: 1 }` compound index.
* **Unified Security:** References strictly utilize the unified `User` model (`ref: 'User'`). Population via `.populate('buyer', '-password -authSecretHash').populate('items.seller', '-password -authSecretHash')` protects authentication hashes.


### 2.5 The Contact Collection (`models/contact.js`)
Existing active collection capturing customer inquiries.

```javascript
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true }
}, {
    timestamps: true
});
```

---

## 3. Database Indexes & Performance Strategy

1. **Compound Indexes:**
   - `Product.index({ island: 1, isAvailable: 1 })` — Optimizes rendering island product lists.
   - `Product.index({ seller: 1, isAvailable: 1 })` — Optimizes seller profile storefronts.
   - `Order.index({ buyer: 1, createdAt: -1 })` — Optimizes customer order history sorting.
   - `Order.index({ "items.seller": 1, status: 1 })` — Optimizes merchant order fulfillment queues.
2. **Slug Uniqueness:**
   - Products enforce unique, URL-safe slugs generated from product names.
3. **Referential Integrity:**
   - When a product is soft-deleted or marked unavailable (`isAvailable: false`), active cart items are flagged with out-of-stock notices instead of breaking cart views.
