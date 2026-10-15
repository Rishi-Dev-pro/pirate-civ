// =====================================================
// SELLERS CONTROLLER
// Merchant Discovery & Public Seller Identification
// =====================================================

import mongoose from "mongoose";
import User from "../models/user.js";
import Product from "../models/product.js";
import { ISLANDS_DATA } from "./islands.js";

/**
 * Controller action: Render minimal Seller Discovery page (Milestone 3.3)
 * Route: GET /seller/:sellerId
 */
export const renderSellerDiscovery = async (req, res) => {
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

        // 6. Preview of up to 4 available products using existing indexed query { seller: 1, createdAt: -1 }
        let sampleProducts = [];
        let totalListingsCount = 0;
        try {
            totalListingsCount = await Product.countDocuments({
                seller: seller._id,
                isAvailable: true
            });

            const dbProducts = await Product.find({
                seller: seller._id,
                isAvailable: true
            })
            .sort({ createdAt: -1 })
            .limit(4)
            .lean();

            sampleProducts = dbProducts.map(p => ({
                id: p._id.toString(),
                _id: p._id,
                name: p.name,
                price: p.price,
                image: p.image,
                rating: p.rating || "★★★★★",
                island: p.island,
                category: p.category
            }));
        } catch (prodErr) {
            console.error("Error retrieving sample products for seller discovery:", prodErr.message);
            sampleProducts = [];
            totalListingsCount = 0;
        }

        const viewSeller = {
            ...seller,
            id: seller._id.toString(),
            _id: seller._id,
            totalListings: totalListingsCount
        };

        res.render("seller-discovery", {
            page_title: `${seller.storeName || seller.name} — Merchant Discovery | Pirate-Civ`,
            seller: viewSeller,
            island: islandMeta,
            sampleProducts: sampleProducts,
            user: req.user || null
        });

    } catch (error) {
        console.error("Error in renderSellerDiscovery:", error);
        res.status(500).render("home", {
            page_title: "Archipelago Tempest | Error",
            user: req.user || null
        });
    }
};

export const renderPublicSeller = renderSellerDiscovery;

export default {
    renderSellerDiscovery,
    renderPublicSeller
};
