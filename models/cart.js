import mongoose from "mongoose";
import Product from "./product.js";

/* =========================================================
   CART ITEM SCHEMA (Embedded Subdocument)
========================================================= */

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Product reference is required"]
    },
    quantity: {
        type: Number,
        required: [true, "Quantity is required"],
        default: 1,
        min: [1, "Quantity must be at least 1"],
        validate: {
            validator: Number.isInteger,
            message: "Quantity must be an integer value"
        }
    }
}, { _id: false });


/* =========================================================
   CART SCHEMA
========================================================= */

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User reference is required"],
        unique: true,
        index: true
    },
    items: [cartItemSchema]
}, {
    timestamps: true
});


/* =========================================================
   METHODS & STATICS
========================================================= */

/**
 * Add or increment item in cart without creating duplicate entries.
 *
 * @param {mongoose.Types.ObjectId|string} productId - Product ID
 * @param {number} [quantity=1] - Quantity to add (positive integer)
 * @returns {Cart} The current cart document
 */
cartSchema.methods.addItem = function(productId, quantity = 1) {
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
        throw new Error("Quantity must be a positive integer");
    }

    const prodId = productId._id || productId;
    const existingItem = this.items.find(item =>
        item.product && (item.product.equals ? item.product.equals(prodId) : item.product.toString() === prodId.toString())
    );

    if (existingItem) {
        existingItem.quantity += qty;
    } else {
        this.items.push({ product: prodId, quantity: qty });
    }

    return this;
};

/**
 * Remove or decrement an item from the cart.
 *
 * @param {mongoose.Types.ObjectId|string} productId - Product ID
 * @param {number} [quantity] - Optional quantity to remove; if not provided or >= current qty, removes item completely
 * @returns {Cart} The current cart document
 */
cartSchema.methods.removeItem = function(productId, quantity) {
    const prodId = productId._id || productId;
    const index = this.items.findIndex(item =>
        item.product && (item.product.equals ? item.product.equals(prodId) : item.product.toString() === prodId.toString())
    );

    if (index === -1) return this;

    if (quantity === undefined || quantity === null) {
        this.items.splice(index, 1);
    } else {
        const qtyToRemove = Number(quantity);
        if (Number.isInteger(qtyToRemove) && qtyToRemove > 0) {
            this.items[index].quantity -= qtyToRemove;
            if (this.items[index].quantity <= 0) {
                this.items.splice(index, 1);
            }
        }
    }

    return this;
};

/**
 * Find persistent cart by User ID.
 *
 * @param {mongoose.Types.ObjectId|string} userId - User ID
 * @returns {mongoose.Query} Query resolving to the Cart document
 */
cartSchema.statics.findByUser = function(userId) {
    return this.findOne({ user: userId });
};

/**
 * Merges a session-based cart into a user's persistent MongoDB cart.
 * Normalizes duplicates, validates that referenced products exist in the database,
 * merges quantities for existing products, and skips invalid products/quantities safely.
 *
 * @param {mongoose.Types.ObjectId|string} userId - Authenticated user ID
 * @param {Array|Object} sessionCart - Session cart data (array of items or object with items)
 * @returns {Promise<Cart>} The persisted Cart document
 */
cartSchema.statics.mergeSessionCart = async function(userId, sessionCart) {
    if (!userId) return null;

    let cart = await this.findOne({ user: userId });
    if (!cart) {
        cart = new this({ user: userId, items: [] });
    }

    if (!sessionCart) {
        await cart.save();
        return cart;
    }

    let rawItems = [];
    if (Array.isArray(sessionCart)) {
        rawItems = sessionCart;
    } else if (Array.isArray(sessionCart.items)) {
        rawItems = sessionCart.items;
    }

    if (rawItems.length === 0) {
        await cart.save();
        return cart;
    }

    for (const rawItem of rawItems) {
        if (!rawItem) continue;

        const rawProductId = rawItem.product || rawItem.productId || rawItem.id;
        const rawQty = rawItem.quantity !== undefined ? rawItem.quantity : rawItem.qty;

        const qty = Number(rawQty);
        if (!Number.isInteger(qty) || qty < 1) {
            continue; // Skip invalid quantity safely
        }

        if (!rawProductId || !mongoose.Types.ObjectId.isValid(rawProductId)) {
            continue; // Skip invalid ObjectId safely
        }

        try {
            const productExists = await Product.exists({ _id: rawProductId });
            if (!productExists) {
                continue; // Skip nonexistent product safely
            }

            cart.addItem(rawProductId, qty);
        } catch (e) {
            continue; // Skip safely on query error
        }
    }

    await cart.save();
    return cart;
};

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
