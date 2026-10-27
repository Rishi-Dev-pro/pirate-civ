import mongoose from "mongoose";
import User from "../models/user.js";
import Product from "../models/product.js";
import Order from "../models/order.js";

/**
 * GET /developer/dashboard (and /admin/dashboard)
 * Developer Realm Overview with genuine MongoDB aggregates and telemetry.
 */
export const renderDeveloperDashboard = async (req, res) => {
    try {
        const [
            pendingSellersCount,
            approvedSellersCount,
            rejectedSellersCount,
            buyersCount,
            sellersCount,
            productsCount,
            ordersCount
        ] = await Promise.all([
            User.countDocuments({ role: "seller", sellerStatus: "pending" }),
            User.countDocuments({ role: "seller", sellerStatus: "approved" }),
            User.countDocuments({ role: "seller", sellerStatus: "rejected" }),
            User.countDocuments({ role: "buyer" }),
            User.countDocuments({ role: "seller" }),
            Product.countDocuments({}),
            Order.countDocuments({})
        ]);

        return res.render("developer/dashboard", {
            page_title: "PIRATE-CIV // DEVELOPER REALM",
            user: req.user,
            activeNav: "dashboard",
            pendingSellersCount,
            stats: {
                pendingSellersCount,
                approvedSellersCount,
                rejectedSellersCount,
                buyersCount,
                sellersCount,
                productsCount,
                ordersCount
            },
            systemStats: {
                nodeVersion: process.version,
                envMode: process.env.NODE_ENV || "development",
                platform: process.platform,
                uptimeSeconds: Math.floor(process.uptime()),
                databaseStatus: mongoose.connection.readyState === 1 ? "Connected" : "Degraded",
                authEngine: "HMAC-SHA256 Token Vault",
                activeRole: req.user.role
            }
        });
    } catch (error) {
        console.error("Developer Dashboard Error:", error);
        return res.status(500).send("Developer Realm encounters a tempest in telemetry retrieval.");
    }
};

/**
 * GET /developer/sellers/applications (and /admin/sellers/applications)
 * View seller charter applications (pending, approved, rejected).
 */
export const renderSellerApplications = async (req, res) => {
    try {
        const pendingSellersCount = await User.countDocuments({ role: "seller", sellerStatus: "pending" });

        // Retrieve all seller applications, sorted by pending first, then newest
        const applications = await User.find({ role: "seller" })
            .select("name email storeName homeIsland sellerStatus rejectionReason createdAt")
            .sort({
                // Sort order: pending first (custom sort in memory or createdAt)
                createdAt: -1
            })
            .lean();

        // Separate pending applications and historical decisions for clear oversight
        const pendingApplications = applications.filter(a => a.sellerStatus === "pending");
        const resolvedApplications = applications.filter(a => a.sellerStatus !== "pending");

        return res.render("developer/seller-applications", {
            page_title: "PIRATE-CIV // SELLER CHARTERS",
            user: req.user,
            activeNav: "applications",
            pendingSellersCount,
            pendingApplications,
            resolvedApplications,
            totalApplicationsCount: applications.length,
            message: req.query.message || null,
            error: req.query.error || null
        });
    } catch (error) {
        console.error("Developer Seller Applications Error:", error);
        return res.status(500).send("Error loading seller applications.");
    }
};

/**
 * POST /developer/sellers/:id/approve (and /admin/sellers/:id/approve)
 * Server-side seller charter approval.
 */
export const approveSeller = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).send("Invalid seller identifier.");
        }

        const targetUser = await User.findById(id);

        if (!targetUser) {
            return res.status(404).send("Target user not found.");
        }

        // Strict role validation: Only actual sellers can be approved
        if (targetUser.role !== "seller") {
            return res.status(400).send("Cannot approve non-seller account.");
        }

        targetUser.sellerStatus = "approved";
        targetUser.rejectionReason = null;
        await targetUser.save();

        // Minimal application audit log
        console.log(`[DEVELOPER AUDIT] Seller Approved: ${targetUser.email} (ID: ${targetUser._id}) approved by Admin: ${req.user.email}`);

        if (req.xhr || (req.headers.accept && req.headers.accept.includes("application/json"))) {
            return res.json({ success: true, sellerStatus: "approved", sellerId: targetUser._id });
        }

        return res.redirect("/developer/sellers/applications?message=" + encodeURIComponent(`Merchant charter for ${targetUser.storeName || targetUser.name} approved.`));
    } catch (error) {
        console.error("Approve Seller Error:", error);
        return res.status(500).send("Internal error while approving merchant charter.");
    }
};

/**
 * POST /developer/sellers/:id/reject (and /admin/sellers/:id/reject)
 * Server-side seller charter rejection with reason.
 */
export const rejectSeller = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).send("Invalid seller identifier.");
        }

        const targetUser = await User.findById(id);

        if (!targetUser) {
            return res.status(404).send("Target user not found.");
        }

        // Strict role validation: Only actual sellers can be rejected
        if (targetUser.role !== "seller") {
            return res.status(400).send("Cannot reject non-seller account.");
        }

        const reason = (req.body?.reason || req.body?.rejectionReason || "Application rejected by the Admiralty.").trim();

        targetUser.sellerStatus = "rejected";
        targetUser.rejectionReason = reason;
        await targetUser.save();

        // Minimal application audit log
        console.log(`[DEVELOPER AUDIT] Seller Rejected: ${targetUser.email} (ID: ${targetUser._id}) reason: "${reason}" by Admin: ${req.user.email}`);

        if (req.xhr || (req.headers.accept && req.headers.accept.includes("application/json"))) {
            return res.json({ success: true, sellerStatus: "rejected", sellerId: targetUser._id, reason });
        }

        return res.redirect("/developer/sellers/applications?message=" + encodeURIComponent(`Merchant charter for ${targetUser.storeName || targetUser.name} rejected.`));
    } catch (error) {
        console.error("Reject Seller Error:", error);
        return res.status(500).send("Internal error while rejecting merchant charter.");
    }
};

/**
 * GET /developer/people (and /admin/people)
 * View all buyers and sellers across the realm.
 */
export const renderPeople = async (req, res) => {
    try {
        const [buyers, sellers, pendingSellersCount] = await Promise.all([
            User.find({ role: "buyer" })
                .select("name email homeIsland createdAt")
                .sort({ createdAt: -1 })
                .lean(),
            User.find({ role: "seller" })
                .select("name email storeName homeIsland sellerStatus createdAt")
                .sort({ createdAt: -1 })
                .lean(),
            User.countDocuments({ role: "seller", sellerStatus: "pending" })
        ]);

        return res.render("developer/people", {
            page_title: "PIRATE-CIV // PEOPLE REGISTRY",
            user: req.user,
            activeNav: "people",
            pendingSellersCount,
            buyers,
            sellers
        });
    } catch (error) {
        console.error("Developer People Registry Error:", error);
        return res.status(500).send("Error retrieving People registry.");
    }
};

/**
 * GET /developer/people/sellers/:id/products (and /admin/people/sellers/:id/products)
 * Marketplace oversight: View all products listed by a seller.
 */
export const renderDeveloperSellerProducts = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).send("Seller not found.");
        }

        const seller = await User.findById(id).select("-password -authSecretHash -googleId").lean();

        if (!seller || seller.role !== "seller") {
            return res.status(404).send("Seller not found.");
        }

        const [products, pendingSellersCount] = await Promise.all([
            Product.find({ seller: seller._id }).sort({ createdAt: -1 }).lean(),
            User.countDocuments({ role: "seller", sellerStatus: "pending" })
        ]);

        return res.render("developer/seller-products", {
            page_title: `PIRATE-CIV // ${seller.storeName || seller.name} WAREHOUSE`,
            user: req.user,
            activeNav: "people",
            pendingSellersCount,
            seller,
            products
        });
    } catch (error) {
        console.error("Developer Seller Products Oversight Error:", error);
        return res.status(500).send("Error retrieving seller products.");
    }
};

/**
 * GET /developer/people/buyers/:id/orders (and /admin/people/buyers/:id/orders)
 * Marketplace oversight: View all purchases/orders made by a buyer.
 */
export const renderBuyerPurchases = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(404).send("Buyer not found.");
        }

        const buyer = await User.findById(id).select("-password -authSecretHash -googleId").lean();

        if (!buyer || buyer.role !== "buyer") {
            return res.status(404).send("Buyer not found.");
        }

        const [orders, pendingSellersCount] = await Promise.all([
            Order.find({ buyer: buyer._id }).sort({ createdAt: -1 }).lean(),
            User.countDocuments({ role: "seller", sellerStatus: "pending" })
        ]);

        return res.render("developer/buyer-orders", {
            page_title: `PIRATE-CIV // ${buyer.name} VOYAGE LEDGER`,
            user: req.user,
            activeNav: "people",
            pendingSellersCount,
            buyer,
            orders
        });
    } catch (error) {
        console.error("Developer Buyer Purchases Oversight Error:", error);
        return res.status(500).send("Error retrieving buyer purchases.");
    }
};
