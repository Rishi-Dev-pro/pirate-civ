import mongoose from "mongoose";

/* =========================================================
   CANONICAL ISLANDS & TRADING BRANCHES TAXONOMY
========================================================= */

export const CANONICAL_ISLANDS = [
    "astrolabe",
    "chronos",
    "kraken_vault",
    "cutlass_cove",
    "velvet_isle",
    "booty_cay"
];

export const TRADING_BRANCHES = [
    "relics",
    "apparel",
    "provisions"
];


/* =========================================================
   PRODUCT SCHEMA
   Foundational Marketplace Item Definition
========================================================= */

const productSchema = new mongoose.Schema({

    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Seller reference is required"],
        index: true
    },

    name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true,
        maxlength: [120, "Product name cannot exceed 120 characters"]
    },

    slug: {
        type: String,
        required: [true, "Product slug is required"],
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
        default: function() {
            if (this.name) {
                return this.name
                    .toLowerCase()
                    .trim()
                    .replace(/[^\w\s-]/g, "")
                    .replace(/[\s_-]+/g, "-")
                    .replace(/^-+|-+$/g, "");
            }
            return undefined;
        }
    },

    price: {
        type: Number,
        required: [true, "Price in Doubloons is required"],
        min: [0, "Price cannot be negative"]
    },

    description: {
        type: String,
        required: [true, "Product description is required"],
        trim: true,
        maxlength: [2000, "Product description cannot exceed 2000 characters"]
    },

    image: {
        type: String,
        required: [true, "Product image path is required"],
        default: "/images/items/default-relic.png",
        trim: true
    },

    island: {
        type: String,
        required: [true, "Product must belong to an official island"],
        enum: {
            values: CANONICAL_ISLANDS,
            message: "{VALUE} is not a valid canonical island"
        },
        index: true
    },

    category: {
        type: String,
        required: [true, "Product category is required"],
        trim: true,
        index: true
    },

    stock: {
        type: Number,
        required: [true, "Product stock is required"],
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
        default: "★★★★★",
        trim: true
    }

}, {
    timestamps: true
});


/* =========================================================
   PRE-VALIDATE HOOK
   Auto-generate slug from name if not provided
========================================================= */

productSchema.pre("validate", function() {
    if (!this.slug && this.name) {
        this.slug = this.name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }
});


/* =========================================================
   INDEXES
   1. island + isAvailable: Fast filtering for island shop views
   2. seller + createdAt: Fast retrieval for merchant inventory
========================================================= */

productSchema.index({ island: 1, isAvailable: 1 });
productSchema.index({ seller: 1, createdAt: -1 });


const Product = mongoose.model("Product", productSchema);

export default Product;
