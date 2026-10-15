// =====================================================
// SELLERS CONTROLLER
// Public Seller Profile & Reusable Storefront (Milestone 3.4)
// =====================================================

import mongoose from "mongoose";
import User from "../models/user.js";
import Product from "../models/product.js";
import { ISLANDS_DATA } from "./islands.js";

/**
 * Controller action: Render Reusable Public Seller Profile / Storefront (Milestone 3.4)
 * Route: GET /seller/:sellerId
 */
export const renderSellerStorefront = async (req, res) => {
    try {
        const rawId = req.params.sellerId || req.params.id || "";
        const sellerId = typeof rawId === "string" ? rawId.trim() : "";

        // 1. Validate ObjectId format safely
        if (!sellerId || !mongoose.isValidObjectId(sellerId)) {
            return res.status(404).render("home", {
                page_title: "Merchant Not Found | Terra Incognita",
                user: req.user || null
            });
        }

        // 2. Query seller by _id with role guard: must be a seller
        const seller = await User.findOne({
            _id: sellerId,
            role: "seller"
        })
        .select("name storeName homeIsland bio avatar createdAt")
        .lean();

        // 3. Return 404 if nonexistent or not a seller
        if (!seller) {
            return res.status(404).render("home", {
                page_title: "Merchant Not Found | Terra Incognita",
                user: req.user || null
            });
        }

        // 4. Defensive credentials scrub: NEVER expose private credentials
        delete seller.password;
        delete seller.authSecretHash;
        delete seller.googleId;
        delete seller.email;

        // 5. Look up seller's home island lore metadata if applicable
        const islandMeta = seller.homeIsland && ISLANDS_DATA[seller.homeIsland]
            ? ISLANDS_DATA[seller.homeIsland]
            : null;

        // 6. Complete product catalog query for this seller:
        //    Must strictly filter by { seller: seller._id, isAvailable: true }
        //    Leverages compound index { seller: 1, createdAt: -1 }
        let catalogProducts = [];
        try {
            const dbProducts = await Product.find({
                seller: seller._id,
                isAvailable: true
            })
            .sort({ createdAt: -1 })
            .lean();

            catalogProducts = dbProducts.map(p => ({
                id: p._id.toString(),
                _id: p._id,
                name: p.name,
                slug: p.slug,
                price: p.price,
                image: p.image || "/images/items/default-relic.png",
                rating: p.rating || "★★★★★",
                island: p.island,
                category: p.category,
                stock: typeof p.stock === "number" ? p.stock : 10,
                description: p.description || ""
            }));
        } catch (prodErr) {
            console.error("Error retrieving products for seller storefront:", prodErr.message);
            catalogProducts = [];
        }

        const viewSeller = {
            ...seller,
            id: seller._id.toString(),
            _id: seller._id,
            totalListings: catalogProducts.length
        };

        // Render reusable public storefront
        res.render("seller-discovery", {
            page_title: `${seller.storeName || seller.name} — Merchant Storefront | Pirate-Civ`,
            seller: viewSeller,
            island: islandMeta,
            products: catalogProducts,
            sampleProducts: catalogProducts.slice(0, 4), // Backwards compatibility for discovery preview
            user: req.user || null
        });

    } catch (error) {
        console.error("Error in renderSellerStorefront:", error);
        res.status(500).render("home", {
            page_title: "Archipelago Tempest | Error",
            user: req.user || null
        });
    }
};

/**
 * Controller action: Render Reusable Seller Dashboard / Command Deck (Milestone 4.1)
 * Route: GET /seller/dashboard
 * Protected by: authMiddleware, requireSeller
 */
export const renderSellerDashboard = async (req, res) => {
    try {
        // Authenticated seller is derived securely from req.user
        const sellerUser = req.user;
        if (!sellerUser || sellerUser.role !== "seller") {
            return res.status(403).send("Access denied: insufficient permissions.");
        }

        // Parallel count operations using existing indexed fields (seller + isAvailable)
        const [activeProductCount, totalProductCount] = await Promise.all([
            Product.countDocuments({ seller: sellerUser._id, isAvailable: true }),
            Product.countDocuments({ seller: sellerUser._id })
        ]);

        // Defensive data scrub: ensure no sensitive credentials leak to view
        const seller = {
            id: sellerUser._id.toString(),
            _id: sellerUser._id,
            name: sellerUser.name || "Unknown Captain",
            storeName: sellerUser.storeName || "",
            homeIsland: sellerUser.homeIsland || "",
            bio: sellerUser.bio || "",
            avatar: sellerUser.avatar || "/images/avatars/default-pirate.png",
            role: sellerUser.role
        };

        const islandMeta = seller.homeIsland && ISLANDS_DATA[seller.homeIsland]
            ? ISLANDS_DATA[seller.homeIsland]
            : null;

        res.render("seller/dashboard", {
            page_title: `${seller.storeName || seller.name} — Command Deck | Pirate-Civ`,
            seller,
            island: islandMeta,
            activeProductCount,
            totalProductCount,
            storefrontUrl: `/seller/${seller.id}`,
            user: req.user
        });

    } catch (error) {
        console.error("Error in renderSellerDashboard:", error);
        res.status(500).render("home", {
            page_title: "Command Deck Tempest | Error",
            user: req.user || null
        });
    }
};

// Aliases for route & backwards compatibility
export const renderSellerDiscovery = renderSellerStorefront;
export const renderPublicSeller = renderSellerStorefront;
export const renderSellerProfile = renderSellerStorefront;

export default {
    renderSellerStorefront,
    renderSellerDiscovery,
    renderPublicSeller,
    renderSellerProfile,
    renderSellerDashboard
};
