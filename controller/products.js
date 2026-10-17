// =====================================================
// PRODUCTS CONTROLLER
// Reusable Product Detail Engine for Pirate-Civ Marketplace
// =====================================================

import mongoose from "mongoose";
import Product from "../models/product.js";
import { ISLANDS_DATA } from "./islands.js";

/**
 * Canonical Island Presentation Backdrops
 * Deterministic mapping for 6 distinct island leaf environments
 */
export const ISLAND_BACKDROPS = {
    astrolabe: "/images/astrolabe-bg.jpg",
    chronos: "/images/chronos-bg.jpg",
    kraken_vault: "/images/kraken-bg.jpg",
    cutlass_cove: "/images/cutlass-bg.jpg",
    velvet_isle: "/images/velvet-bg.jpg",
    booty_cay: "/images/booty-bg.jpg"
};

/**
 * Controller action: Render reusable Product Detail Page
 * Route: GET /product/:productId
 */
export const renderProductDetail = async (req, res) => {
    try {
        const rawParam = req.params.productId || req.params.id || "";
        const param = typeof rawParam === "string" ? rawParam.trim() : "";

        if (!param) {
            return res.status(404).render("home", {
                page_title: "Product Not Found | Terra Incognita",
                user: req.user || null
            });
        }

        // Validate identifier safely: only query MongoDB with valid ObjectId or valid slug format
        let query = null;
        if (mongoose.isValidObjectId(param)) {
            query = { _id: param, isAvailable: true };
        } else if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(param)) {
            query = { slug: param.toLowerCase(), isAvailable: true };
        } else {
            // Malformed identifier: return safe 404 without querying DB or leaking CastError
            return res.status(404).render("home", {
                page_title: "Product Not Found | Terra Incognita",
                user: req.user || null
            });
        }

        // Fetch product with safe projection: only populate public seller presentation fields
        const product = await Product.findOne(query)
            .populate("seller", "name storeName homeIsland bio avatar")
            .lean();

        // Safe 404 if not found or not available
        if (!product) {
            return res.status(404).render("home", {
                page_title: "Product Not Found | Terra Incognita",
                user: req.user || null
            });
        }

        // Defensive sanitize: ensure sensitive seller credentials are NEVER exposed
        if (product.seller) {
            delete product.seller.password;
            delete product.seller.authSecretHash;
            delete product.seller.googleId;
        }

        // Island presentation lore metadata with deterministic island backdrop
        const rawIslandMeta = ISLANDS_DATA[product.island] || {};
        const backdropImage = ISLAND_BACKDROPS[product.island] || "/images/astrolabe-bg.jpg";

        const islandMeta = {
            ...rawIslandMeta,
            id: product.island,
            slug: product.island,
            name: rawIslandMeta.name || product.island,
            badge: rawIslandMeta.badge || "ARCHIPELAGO OUTPOST",
            icon: rawIslandMeta.icon || "🏝️",
            image: backdropImage,
            backdrop: backdropImage,
            coordinates: rawIslandMeta.coordinates || "Uncharted Waters",
            tradeWind: rawIslandMeta.tradeWind || "Variable",
            dangerRating: rawIslandMeta.dangerRating || "Guarded Port"
        };

        const viewProduct = {
            ...product,
            id: product._id.toString(),
            _id: product._id
        };

        let isFavorited = false;
        if (req.user && req.user.favorites && Array.isArray(req.user.favorites)) {
            const pIdStr = product._id.toString();
            isFavorited = req.user.favorites.some(fId => (fId._id || fId).toString() === pIdStr);
        }

        res.render("product-detail", {
            page_title: `${product.name} | Pirate-Civ`,
            product: viewProduct,
            island: islandMeta,
            isFavorited: isFavorited,
            user: req.user || null
        });

    } catch (error) {
        console.error("Error in renderProductDetail:", error);
        res.status(500).render("home", {
            page_title: "Archipelago Tempest | Error",
            user: req.user || null
        });
    }
};

export default {
    renderProductDetail,
    ISLAND_BACKDROPS
};
