import mongoose from "mongoose";
import User from "../models/user.js";
import Product from "../models/product.js";

/**
 * GET /favorites
 * View buyer's saved treasures / wishlist
 */
export const getFavorites = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect("/login?intent=buyer");
        }

        const user = await User.findById(req.user._id)
            .populate({
                path: "favorites",
                populate: {
                    path: "seller",
                    select: "name storeName homeIsland avatar"
                }
            })
            .lean();

        const favoriteItems = (user && user.favorites)
            ? user.favorites.filter(p => p && p._id && p.isAvailable !== false)
            : [];

        res.render("favorites", {
            page_title: "Captain's Favorites | Pirate-Civ",
            products: favoriteItems,
            user: req.user
        });

    } catch (error) {
        console.error("Error in getFavorites:", error);
        res.status(500).render("home", {
            page_title: "Archipelago Tempest | Error",
            user: req.user || null
        });
    }
};

/**
 * POST /favorites/:productId/toggle
 * Toggle product in buyer's favorites list
 */
export const toggleFavorite = async (req, res) => {
    try {
        if (!req.user) {
            if (req.xhr || req.headers.accept?.includes("application/json")) {
                return res.status(401).json({ success: false, error: "Authentication required" });
            }
            return res.redirect("/login?intent=buyer");
        }

        const { productId } = req.params;
        if (!productId || !mongoose.isValidObjectId(productId)) {
            if (req.xhr || req.headers.accept?.includes("application/json")) {
                return res.status(400).json({ success: false, error: "Invalid product identifier" });
            }
            return res.redirect("back");
        }

        const product = await Product.findById(productId);
        if (!product) {
            if (req.xhr || req.headers.accept?.includes("application/json")) {
                return res.status(404).json({ success: false, error: "Product not found" });
            }
            return res.redirect("back");
        }

        const user = await User.findById(req.user._id);
        if (!user.favorites) {
            user.favorites = [];
        }

        const prodIdStr = product._id.toString();
        const existingIdx = user.favorites.findIndex(id => id.toString() === prodIdStr);
        let isFavorited = false;

        if (existingIdx > -1) {
            user.favorites.splice(existingIdx, 1);
            isFavorited = false;
        } else {
            user.favorites.push(product._id);
            isFavorited = true;
        }

        await user.save();

        if (req.xhr || req.headers.accept?.includes("application/json")) {
            return res.json({
                success: true,
                isFavorited,
                count: user.favorites.length,
                message: isFavorited ? "Treasure secured to Favorites" : "Treasure removed from Favorites"
            });
        }

        return res.redirect(req.get("Referrer") || "/favorites");

    } catch (error) {
        console.error("Error in toggleFavorite:", error);
        if (req.xhr || req.headers.accept?.includes("application/json")) {
            return res.status(500).json({ success: false, error: "Internal server error toggling favorite" });
        }
        res.redirect("back");
    }
};

export default {
    getFavorites,
    toggleFavorite
};
