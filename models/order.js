import mongoose from "mongoose";

/* =========================================================
   CANONICAL ORDER & PAYMENT STATUS TAXONOMY
========================================================= */

export const ORDER_STATUSES = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled"
];

export const FULFILLMENT_STATUSES = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled"
];

export const AGGREGATE_ORDER_STATUSES = [
    ...ORDER_STATUSES,
    "partially_fulfilled"
];

export const PAYMENT_STATUSES = [
    "pending",
    "paid",
    "failed",
    "refunded"
];

export const PERMITTED_STATUS_TRANSITIONS = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: []
};


/* =========================================================
   SELLER FULFILLMENT SCHEMA (Embedded Subdocument)
   Stores seller-specific fulfillment lifecycle state (AUD-001)
========================================================= */

const sellerFulfillmentSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Seller reference is required"]
    },
    status: {
        type: String,
        enum: {
            values: FULFILLMENT_STATUSES,
            message: "{VALUE} is not a valid fulfillment status"
        },
        default: "pending"
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });


/* =========================================================
   ORDER ITEM SCHEMA (Embedded Subdocument)
   Stores historical snapshot of product at purchase time
========================================================= */

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
    name: {
        type: String,
        required: [true, "Product name snapshot is required"],
        trim: true
    },
    price: {
        type: Number,
        required: [true, "Unit price snapshot is required"],
        min: [0, "Unit price cannot be negative"]
    },
    quantity: {
        type: Number,
        required: [true, "Quantity is required"],
        min: [1, "Quantity must be at least 1"],
        validate: {
            validator: Number.isInteger,
            message: "Quantity must be an integer"
        }
    },
    lineTotal: {
        type: Number,
        required: [true, "Line total is required"],
        min: [0, "Line total cannot be negative"],
        default: function() {
            if (typeof this.price === "number" && typeof this.quantity === "number") {
                return this.price * this.quantity;
            }
            return undefined;
        }
    },
    image: {
        type: String,
        trim: true,
        default: "/images/items/default-relic.png"
    }
}, { _id: false });

orderItemSchema.pre("validate", function() {
    if (typeof this.price === "number" && typeof this.quantity === "number") {
        if (this.lineTotal === undefined || this.lineTotal === null) {
            this.lineTotal = this.price * this.quantity;
        }
    }
});


/* =========================================================
   ORDER SCHEMA
========================================================= */

const shippingAddressSchema = new mongoose.Schema({
    portName: {
        type: String,
        required: [true, "Port name is required"],
        trim: true
    },
    islandCoordinates: {
        type: String,
        default: "18°42'N, 64°31'W",
        trim: true
    },
    recipientNotes: {
        type: String,
        default: "",
        trim: true
    }
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
            validator: function(items) {
                return Array.isArray(items) && items.length > 0;
            },
            message: "Order must contain at least one item"
        }
    },
    subtotal: {
        type: Number,
        min: [0, "Subtotal cannot be negative"],
        default: function() {
            if (Array.isArray(this.items) && this.items.length > 0) {
                return this.items.reduce((sum, item) => {
                    const price = typeof item.price === "number" ? item.price : 0;
                    const qty = typeof item.quantity === "number" ? item.quantity : 0;
                    const lt = typeof item.lineTotal === "number" ? item.lineTotal : price * qty;
                    return sum + lt;
                }, 0);
            }
            return undefined;
        }
    },
    totalDoubloons: {
        type: Number,
        required: [true, "Total in Doubloons is required"],
        min: [0, "Total Doubloons cannot be negative"],
        default: function() {
            if (typeof this.subtotal === "number") {
                return this.subtotal;
            }
            if (Array.isArray(this.items) && this.items.length > 0) {
                return this.items.reduce((sum, item) => {
                    const price = typeof item.price === "number" ? item.price : 0;
                    const qty = typeof item.quantity === "number" ? item.quantity : 0;
                    const lt = typeof item.lineTotal === "number" ? item.lineTotal : price * qty;
                    return sum + lt;
                }, 0);
            }
            return undefined;
        }
    },
    fulfillments: {
        type: [sellerFulfillmentSchema],
        default: []
    },
    status: {
        type: String,
        enum: {
            values: AGGREGATE_ORDER_STATUSES,
            message: "{VALUE} is not a valid order status"
        },
        default: "pending",
        index: true
    },
    paymentStatus: {
        type: String,
        enum: {
            values: PAYMENT_STATUSES,
            message: "{VALUE} is not a valid payment status"
        },
        default: "pending",
        index: true
    },
    shippingAddress: {
        type: shippingAddressSchema,
        required: [true, "Shipping address is required"]
    }
}, {
    timestamps: true
});


/* =========================================================
   PRE-VALIDATE HOOK
   Compute subtotal and totalDoubloons if omitted
   Auto-initialize fulfillments from items if missing (AUD-001)
========================================================= */

orderSchema.pre("validate", function() {
    if (Array.isArray(this.items) && this.items.length > 0) {
        if (this.subtotal === undefined || this.subtotal === null) {
            this.subtotal = this.items.reduce((sum, item) => {
                const itemTotal = typeof item.lineTotal === "number"
                    ? item.lineTotal
                    : ((typeof item.price === "number" && typeof item.quantity === "number") ? item.price * item.quantity : 0);
                return sum + itemTotal;
            }, 0);
        }

        if (this.totalDoubloons === undefined || this.totalDoubloons === null) {
            this.totalDoubloons = this.subtotal;
        }

        // Initialize seller fulfillments if missing or empty
        if (!Array.isArray(this.fulfillments) || this.fulfillments.length === 0) {
            this.initializeFulfillments();
        }
    }
});


/* =========================================================
   VIRTUALS
========================================================= */

orderSchema.virtual("total")
    .get(function() { return this.totalDoubloons; })
    .set(function(v) { this.totalDoubloons = v; });


/* =========================================================
   INDEXES
   1. buyer + createdAt: Fast customer order history sorting
   2. items.seller + status: Fast merchant order fulfillment queues
   3. fulfillments.seller + fulfillments.status: Seller fulfillment state indexing
========================================================= */

orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ "items.seller": 1, status: 1 });
orderSchema.index({ "fulfillments.seller": 1, "fulfillments.status": 1 });


/* =========================================================
   LIFECYCLE & QUERY HELPERS
========================================================= */

/**
 * Initialize fulfillments from order items if not already set.
 * Deduplicates by seller ID (exactly one fulfillment per distinct seller).
 */
orderSchema.methods.initializeFulfillments = function() {
    if (!Array.isArray(this.items) || this.items.length === 0) {
        return;
    }
    if (!Array.isArray(this.fulfillments)) {
        this.fulfillments = [];
    }

    const existingSellerIds = new Set(
        this.fulfillments.map(f => (f.seller?._id || f.seller)?.toString()).filter(Boolean)
    );

    const initialStatus = this.status && this.status !== "partially_fulfilled" ? this.status : "pending";

    for (const item of this.items) {
        const itemSellerId = (item.seller?._id || item.seller)?.toString();
        if (itemSellerId && !existingSellerIds.has(itemSellerId)) {
            existingSellerIds.add(itemSellerId);
            this.fulfillments.push({
                seller: item.seller?._id || item.seller,
                status: initialStatus
            });
        }
    }
};

/**
 * Recalculate root order status based on all seller fulfillments (AUD-001).
 * Deterministic aggregate rules:
 * - All pending -> pending
 * - All confirmed -> confirmed
 * - All processing -> processing
 * - All shipped -> shipped
 * - All delivered -> delivered
 * - All cancelled -> cancelled
 * - Mixed seller states -> partially_fulfilled
 * @returns {string} The aggregate status
 */
orderSchema.methods.recalculateAggregateStatus = function() {
    if (!Array.isArray(this.fulfillments) || this.fulfillments.length === 0) {
        if (Array.isArray(this.items) && this.items.length > 0) {
            this.initializeFulfillments();
        }
    }

    if (!Array.isArray(this.fulfillments) || this.fulfillments.length === 0) {
        return this.status || "pending";
    }

    const statuses = this.fulfillments.map(f => f.status);
    const uniqueStatuses = [...new Set(statuses)];

    if (uniqueStatuses.length === 1) {
        this.status = uniqueStatuses[0];
    } else {
        this.status = "partially_fulfilled";
    }

    return this.status;
};

/**
 * Find fulfillment entry for a given seller.
 * @param {mongoose.Types.ObjectId|string} sellerId
 * @returns {Object|null}
 */
orderSchema.methods.getFulfillmentForSeller = function(sellerId) {
    if (!sellerId) return null;
    const sIdStr = (sellerId._id || sellerId).toString();

    if (!Array.isArray(this.fulfillments) || this.fulfillments.length === 0) {
        this.initializeFulfillments();
    }

    return this.fulfillments.find(f => {
        const itemSellerId = f.seller?._id || f.seller;
        return itemSellerId && itemSellerId.toString() === sIdStr;
    }) || null;
};

/**
 * Check if a specific seller's fulfillment can transition to target status.
 * @param {mongoose.Types.ObjectId|string} sellerId
 * @param {string} targetStatus
 * @returns {boolean}
 */
orderSchema.methods.canTransitionFulfillment = function(sellerId, targetStatus) {
    if (!targetStatus || !FULFILLMENT_STATUSES.includes(targetStatus)) {
        return false;
    }
    const fulfillment = this.getFulfillmentForSeller(sellerId);
    if (!fulfillment) {
        return false;
    }
    const permitted = PERMITTED_STATUS_TRANSITIONS[fulfillment.status] || [];
    return permitted.includes(targetStatus);
};

/**
 * Transition a specific seller's fulfillment status and recalculate aggregate status.
 * Leaves all other sellers' fulfillments strictly untouched.
 * @param {mongoose.Types.ObjectId|string} sellerId
 * @param {string} targetStatus
 * @returns {Order} this
 */
orderSchema.methods.transitionFulfillment = function(sellerId, targetStatus) {
    const fulfillment = this.getFulfillmentForSeller(sellerId);
    if (!fulfillment) {
        throw new Error(`Seller '${sellerId}' does not have a fulfillment record in this order.`);
    }
    if (!this.canTransitionFulfillment(sellerId, targetStatus)) {
        throw new Error(`Invalid status transition from '${fulfillment.status}' to '${targetStatus}'.`);
    }
    fulfillment.status = targetStatus;
    fulfillment.updatedAt = new Date();
    this.recalculateAggregateStatus();
    return this;
};

/**
 * Check if transitioning to the target status is permitted.
 * @param {string} targetStatus
 * @returns {boolean}
 */
orderSchema.methods.canTransitionTo = function(targetStatus) {
    if (!targetStatus || !AGGREGATE_ORDER_STATUSES.includes(targetStatus)) {
        return false;
    }
    const permitted = PERMITTED_STATUS_TRANSITIONS[this.status] || [];
    return permitted.includes(targetStatus);
};

/**
 * Transition order status to a new permitted status.
 * Throws an Error if transition is not permitted.
 * Updates fulfillments if single-seller order.
 * @param {string} targetStatus
 * @returns {Order} this
 */
orderSchema.methods.transitionTo = function(targetStatus) {
    if (!this.canTransitionTo(targetStatus)) {
        throw new Error(`Invalid status transition from '${this.status}' to '${targetStatus}'`);
    }
    this.status = targetStatus;
    if (Array.isArray(this.fulfillments) && this.fulfillments.length === 1) {
        this.fulfillments[0].status = targetStatus;
        this.fulfillments[0].updatedAt = new Date();
    }
    return this;
};

/**
 * Find orders for a buyer sorted newest first.
 * @param {mongoose.Types.ObjectId|string} buyerId
 * @param {Object} [filter={}]
 * @returns {mongoose.Query}
 */
orderSchema.statics.findByBuyer = function(buyerId, filter = {}) {
    return this.find({ buyer: buyerId, ...filter }).sort({ createdAt: -1 });
};

/**
 * Find orders containing items for a seller.
 * @param {mongoose.Types.ObjectId|string} sellerId
 * @param {Object} [filter={}]
 * @returns {mongoose.Query}
 */
orderSchema.statics.findBySeller = function(sellerId, filter = {}) {
    return this.find({ "items.seller": sellerId, ...filter }).sort({ createdAt: -1 });
};


const Order = mongoose.model("Order", orderSchema);

export default Order;
