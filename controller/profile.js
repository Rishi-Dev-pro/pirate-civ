import User from "../models/user.js";
import Order from "../models/order.js";
import { processAvatar } from "../middleware/upload.js";
import { CANONICAL_ISLANDS } from "../models/product.js";

/**
 * GET /profile
 * Renders the Buyer Account Profile
 */
export const getBuyerProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect("/login?intent=buyer&returnTo=/profile");
        }

        // If seller hits /profile, redirect to seller profile
        if (req.user.role === "seller") {
            return res.redirect("/seller/profile");
        }

        const user = await User.findById(req.user._id).lean();
        if (!user) {
            return res.redirect("/login");
        }

        const orderCount = await Order.countDocuments({ buyer: user._id });
        const favoritesCount = Array.isArray(user.favorites) ? user.favorites.length : 0;

        return res.render("profile", {
            page_title: "Captain's Quarters — Buyer Profile | Pirate-Civ",
            user: {
                ...user,
                avatar: user.avatar || "/images/avatars/default.png"
            },
            orderCount,
            favoritesCount,
            canonicalIslands: CANONICAL_ISLANDS,
            success: req.query.updated ? "Profile updated successfully, Captain." : null,
            error: null
        });
    } catch (error) {
        console.error("Error in getBuyerProfile:", error);
        return res.status(500).render("home", {
            page_title: "Archipelago Tempest | Error",
            user: req.user || null
        });
    }
};

/**
 * POST /profile
 * Updates the Buyer Account Profile
 */
export const updateBuyerProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect("/login");
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.redirect("/login");
        }

        const { name, bio, homeIsland, removeAvatar } = req.body;

        if (name && typeof name === "string" && name.trim().length >= 2) {
            user.name = name.trim();
        }

        if (typeof bio === "string") {
            user.bio = bio.trim().slice(0, 500);
        }

        if (homeIsland && CANONICAL_ISLANDS.includes(homeIsland.trim())) {
            user.homeIsland = homeIsland.trim();
        }

        if (removeAvatar === "true" || removeAvatar === true || removeAvatar === "1") {
            user.avatar = "/images/avatars/default.png";
        } else if (req.file && req.file.buffer) {
            try {
                const optimizedUrl = await processAvatar(req.file.buffer);
                user.avatar = optimizedUrl;
            } catch (imgErr) {
                console.error("Error processing avatar image:", imgErr);
                // Continue saving other fields even if image fails
            }
        }

        await user.save();

        if (req.xhr || req.headers.accept?.includes("application/json")) {
            return res.json({
                success: true,
                message: "Profile updated successfully.",
                user: {
                    name: user.name,
                    bio: user.bio,
                    homeIsland: user.homeIsland,
                    avatar: user.avatar
                }
            });
        }

        return res.redirect("/profile?updated=1");
    } catch (error) {
        console.error("Error in updateBuyerProfile:", error);
        return res.status(500).render("profile", {
            page_title: "Captain's Quarters | Error",
            user: req.user,
            orderCount: 0,
            favoritesCount: 0,
            canonicalIslands: CANONICAL_ISLANDS,
            success: null,
            error: "An error occurred while saving your profile."
        });
    }
};
