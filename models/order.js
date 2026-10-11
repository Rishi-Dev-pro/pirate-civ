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
    status: {
        type: String,
        enum: {
            values: ORDER_STATUSES,
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
========================================================= */

orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ "items.seller": 1, status: 1 });


/* =========================================================
   LIFECYCLE & QUERY HELPERS
========================================================= */

/**
 * Check if transitioning to the target status is permitted.
 * @param {string} targetStatus
 * @returns {boolean}
 */
orderSchema.methods.canTransitionTo = function(targetStatus) {
    if (!targetStatus || !ORDER_STATUSES.includes(targetStatus)) {
        return false;
    }
    const permitted = PERMITTED_STATUS_TRANSITIONS[this.status] || [];
    return permitted.includes(targetStatus);
};

/**
 * Transition order status to a new permitted status.
 * Throws an Error if transition is not permitted.
 * @param {string} targetStatus
 * @returns {Order} this
 */
orderSchema.methods.transitionTo = function(targetStatus) {
    if (!this.canTransitionTo(targetStatus)) {
        throw new Error(`Invalid status transition from '${this.status}' to '${targetStatus}'`);
    }
    this.status = targetStatus;
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
