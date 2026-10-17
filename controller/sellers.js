// =====================================================
// SELLERS CONTROLLER
// Public Seller Profile & Reusable Storefront (Milestone 3.4)
// =====================================================

import mongoose from "mongoose";
import User from "../models/user.js";
import Product, { CANONICAL_ISLANDS, TRADING_BRANCHES } from "../models/product.js";
import Order, { ORDER_STATUSES, FULFILLMENT_STATUSES, PERMITTED_STATUS_TRANSITIONS } from "../models/order.js";
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

/**
 * Controller action: Render Seller Products List (Milestone 4.2)
 * Route: GET /seller/products
 * Protected by: authMiddleware, requireSeller
 */
export const renderSellerProducts = async (req, res) => {
    try {
        const sellerUser = req.user;
        if (!sellerUser || sellerUser.role !== "seller") {
            return res.status(403).send("Access denied: insufficient permissions.");
        }

        const products = await Product.find({ seller: sellerUser._id })
            .sort({ createdAt: -1 })
            .lean();

        const islandMeta = sellerUser.homeIsland && ISLANDS_DATA[sellerUser.homeIsland]
            ? ISLANDS_DATA[sellerUser.homeIsland]
            : null;

        const seller = {
            id: sellerUser._id.toString(),
            _id: sellerUser._id,
            name: sellerUser.name || "Unknown Captain",
            storeName: sellerUser.storeName || "",
            homeIsland: sellerUser.homeIsland || "",
            avatar: sellerUser.avatar || "/images/avatars/default-pirate.png",
            role: sellerUser.role
        };

        const activeCount = products.filter(p => p.isAvailable).length;
        const totalCount = products.length;

        res.render("seller/products", {
            page_title: `${seller.storeName || seller.name} — Product Management | Pirate-Civ`,
            seller,
            island: islandMeta,
            products,
            activeCount,
            totalCount,
            storefrontUrl: `/seller/${seller.id}`,
            user: req.user,
            query: req.query || {}
        });

    } catch (error) {
        console.error("Error in renderSellerProducts:", error);
        res.status(500).render("home", {
            page_title: "Command Deck Tempest | Error",
            user: req.user || null
        });
    }
};

/**
 * Controller action: Render Edit Product Page (Milestone 4.2)
 * Route: GET /seller/products/:productId/edit
 * Protected by: authMiddleware, requireSeller
 */
export const renderEditProduct = async (req, res) => {
    try {
        const sellerUser = req.user;
        if (!sellerUser || sellerUser.role !== "seller") {
            return res.status(403).send("Access denied: insufficient permissions.");
        }

        const { productId } = req.params;
        if (!productId || !mongoose.isValidObjectId(productId)) {
            return res.status(404).render("home", {
                page_title: "Artifact Not Found | Pirate-Civ",
                user: req.user || null
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).render("home", {
                page_title: "Artifact Not Found | Pirate-Civ",
                user: req.user || null
            });
        }

        // Ownership verification: seller can only edit their own products
        if (!product.isOwnedBy(sellerUser)) {
            return res.status(403).send("Access denied: you do not own this product.");
        }

        const islandMeta = sellerUser.homeIsland && ISLANDS_DATA[sellerUser.homeIsland]
            ? ISLANDS_DATA[sellerUser.homeIsland]
            : null;

        const seller = {
            id: sellerUser._id.toString(),
            _id: sellerUser._id,
            name: sellerUser.name || "Unknown Captain",
            storeName: sellerUser.storeName || "",
            homeIsland: sellerUser.homeIsland || "",
            avatar: sellerUser.avatar || "/images/avatars/default-pirate.png",
            role: sellerUser.role
        };

        res.render("seller/product-edit", {
            page_title: `Edit ${product.name} — Vault Management | Pirate-Civ`,
            seller,
            island: islandMeta,
            product,
            canonicalIslands: CANONICAL_ISLANDS,
            error: null,
            user: req.user
        });

    } catch (error) {
        console.error("Error in renderEditProduct:", error);
        res.status(500).render("home", {
            page_title: "Command Deck Tempest | Error",
            user: req.user || null
        });
    }
};

/**
 * Controller action: Update Product Details (Milestone 4.2)
 * Route: POST /seller/products/:productId/edit
 * Protected by: authMiddleware, requireSeller
 */
export const updateProduct = async (req, res) => {
    try {
        const sellerUser = req.user;
        if (!sellerUser || sellerUser.role !== "seller") {
            return res.status(403).send("Access denied: insufficient permissions.");
        }

        const { productId } = req.params;
        if (!productId || !mongoose.isValidObjectId(productId)) {
            return res.status(404).render("home", {
                page_title: "Artifact Not Found | Pirate-Civ",
                user: req.user || null
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).render("home", {
                page_title: "Artifact Not Found | Pirate-Civ",
                user: req.user || null
            });
        }

        // Ownership verification
        if (!product.isOwnedBy(sellerUser)) {
            return res.status(403).send("Access denied: you do not own this product.");
        }

        const {
            name,
            price,
            description,
            stock,
            island,
            category,
            isAvailable,
            image,
            rating
        } = req.body;

        const islandMeta = sellerUser.homeIsland && ISLANDS_DATA[sellerUser.homeIsland]
            ? ISLANDS_DATA[sellerUser.homeIsland]
            : null;

        // Validation: Name
        const trimmedName = typeof name === "string" ? name.trim() : "";
        if (!trimmedName || trimmedName.length > 120) {
            return res.status(400).render("seller/product-edit", {
                page_title: `Edit ${product.name} — Vault Management | Pirate-Civ`,
                seller: sellerUser,
                island: islandMeta,
                product: { ...product.toObject(), ...req.body },
                canonicalIslands: CANONICAL_ISLANDS,
                error: "Product name is required and cannot exceed 120 characters.",
                user: req.user
            });
        }

        // Validation: Price
        const numPrice = Number(price);
        if (isNaN(numPrice) || numPrice < 0) {
            return res.status(400).render("seller/product-edit", {
                page_title: `Edit ${product.name} — Vault Management | Pirate-Civ`,
                seller: sellerUser,
                island: islandMeta,
                product: { ...product.toObject(), ...req.body },
                canonicalIslands: CANONICAL_ISLANDS,
                error: "Price must be a valid non-negative number.",
                user: req.user
            });
        }

        // Validation: Description
        const trimmedDesc = typeof description === "string" ? description.trim() : "";
        if (!trimmedDesc || trimmedDesc.length > 2000) {
            return res.status(400).render("seller/product-edit", {
                page_title: `Edit ${product.name} — Vault Management | Pirate-Civ`,
                seller: sellerUser,
                island: islandMeta,
                product: { ...product.toObject(), ...req.body },
                canonicalIslands: CANONICAL_ISLANDS,
                error: "Product description is required and cannot exceed 2000 characters.",
                user: req.user
            });
        }

        // Validation: Stock
        const numStock = Number(stock);
        if (!Number.isInteger(numStock) || numStock < 0) {
            return res.status(400).render("seller/product-edit", {
                page_title: `Edit ${product.name} — Vault Management | Pirate-Civ`,
                seller: sellerUser,
                island: islandMeta,
                product: { ...product.toObject(), ...req.body },
                canonicalIslands: CANONICAL_ISLANDS,
                error: "Stock must be a non-negative integer.",
                user: req.user
            });
        }

        // Validation: Island
        if (island && !CANONICAL_ISLANDS.includes(island.trim())) {
            return res.status(400).render("seller/product-edit", {
                page_title: `Edit ${product.name} — Vault Management | Pirate-Civ`,
                seller: sellerUser,
                island: islandMeta,
                product: { ...product.toObject(), ...req.body },
                canonicalIslands: CANONICAL_ISLANDS,
                error: "Selected island must be one of the 6 canonical trading islands.",
                user: req.user
            });
        }

        // Validation: Category
        const trimmedCat = typeof category === "string" ? category.trim() : "";
        if (!trimmedCat) {
            return res.status(400).render("seller/product-edit", {
                page_title: `Edit ${product.name} — Vault Management | Pirate-Civ`,
                seller: sellerUser,
                island: islandMeta,
                product: { ...product.toObject(), ...req.body },
                canonicalIslands: CANONICAL_ISLANDS,
                error: "Product category is required.",
                user: req.user
            });
        }

        // Apply validated changes
        product.name = trimmedName;
        product.price = numPrice;
        product.description = trimmedDesc;
        product.stock = numStock;
        if (island) product.island = island.trim();
        product.category = trimmedCat;

        if (isAvailable !== undefined) {
            product.isAvailable = isAvailable === true || isAvailable === "true" || isAvailable === "on" || isAvailable === 1 || isAvailable === "1";
        }

        if (typeof image === "string" && image.trim()) {
            product.image = image.trim();
        }

        if (typeof rating === "string" && rating.trim()) {
            product.rating = rating.trim();
        }

        await product.save();

        if (req.xhr || req.headers.accept?.includes("application/json")) {
            return res.json({ success: true, product });
        }

        return res.redirect("/seller/products?updated=1");

    } catch (error) {
        console.error("Error in updateProduct:", error);
        res.status(500).render("home", {
            page_title: "Command Deck Tempest | Error",
            user: req.user || null
        });
    }
};

/**
 * Controller action: Toggle Product Availability (Milestone 4.2)
 * Route: POST /seller/products/:productId/toggle-availability
 * Protected by: authMiddleware, requireSeller
 */
export const toggleProductAvailability = async (req, res) => {
    try {
        const sellerUser = req.user;
        if (!sellerUser || sellerUser.role !== "seller") {
            return res.status(403).send("Access denied: insufficient permissions.");
        }

        const { productId } = req.params;
        if (!productId || !mongoose.isValidObjectId(productId)) {
            return res.status(404).render("home", {
                page_title: "Artifact Not Found | Pirate-Civ",
                user: req.user || null
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).render("home", {
                page_title: "Artifact Not Found | Pirate-Civ",
                user: req.user || null
            });
        }

        // Ownership verification
        if (!product.isOwnedBy(sellerUser)) {
            return res.status(403).send("Access denied: you do not own this product.");
        }

        product.isAvailable = !product.isAvailable;
        await product.save();

        if (req.xhr || req.headers.accept?.includes("application/json")) {
            return res.json({
                success: true,
                productId: product._id,
                isAvailable: product.isAvailable
            });
        }

        return res.redirect("/seller/products?toggled=1");

    } catch (error) {
        console.error("Error in toggleProductAvailability:", error);
        res.status(500).render("home", {
            page_title: "Command Deck Tempest | Error",
            user: req.user || null
        });
    }
};

/**
 * Controller action: Safe Delete Seller Product (Milestone 4.2)
 * Route: POST /seller/products/:productId/delete
 * Protected by: authMiddleware, requireSeller
 */
export const deleteProduct = async (req, res) => {
    try {
        const sellerUser = req.user;
        if (!sellerUser || sellerUser.role !== "seller") {
            return res.status(403).send("Access denied: insufficient permissions.");
        }

        const { productId } = req.params;
        if (!productId || !mongoose.isValidObjectId(productId)) {
            return res.status(404).render("home", {
                page_title: "Artifact Not Found | Pirate-Civ",
                user: req.user || null
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).render("home", {
                page_title: "Artifact Not Found | Pirate-Civ",
                user: req.user || null
            });
        }

        // Ownership verification: strictly verify seller owns this product
        if (!product.isOwnedBy(sellerUser)) {
            return res.status(403).send("Access denied: you do not own this product.");
        }

        // Safe catalog deletion
        // Note: Historical Orders embed subdocuments storing complete price/name snapshots,
        // so removing the active catalog record does NOT alter past Orders.
        await Product.deleteOne({ _id: product._id, seller: sellerUser._id });

        if (req.xhr || req.headers.accept?.includes("application/json")) {
            return res.json({
                success: true,
                deletedId: product._id
            });
        }

        return res.redirect("/seller/products?deleted=1");

    } catch (error) {
        console.error("Error in deleteProduct:", error);
        res.status(500).render("home", {
            page_title: "Command Deck Tempest | Error",
            user: req.user || null
        });
    }
};

/**
 * Controller action: Render Create Product Page (Milestone 4.3)
 * Route: GET /seller/products/new
 * Protected by: authMiddleware, requireSeller
 */
export const renderCreateProduct = async (req, res) => {
    try {
        const sellerUser = req.user;
        if (!sellerUser || sellerUser.role !== "seller") {
            return res.status(403).send("Access denied: insufficient permissions.");
        }

        const islandMeta = sellerUser.homeIsland && ISLANDS_DATA[sellerUser.homeIsland]
            ? ISLANDS_DATA[sellerUser.homeIsland]
            : null;

        const seller = {
            id: sellerUser._id.toString(),
            _id: sellerUser._id,
            name: sellerUser.name || "Unknown Captain",
            storeName: sellerUser.storeName || "",
            homeIsland: sellerUser.homeIsland || "",
            avatar: sellerUser.avatar || "/images/avatars/default-pirate.png",
            role: sellerUser.role
        };

        res.render("seller/product-create", {
            page_title: "Forge New Cargo — Vault Management | Pirate-Civ",
            seller,
            island: islandMeta,
            product: {
                name: "",
                price: "",
                description: "",
                stock: 10,
                island: sellerUser.homeIsland && CANONICAL_ISLANDS.includes(sellerUser.homeIsland) ? sellerUser.homeIsland : "astrolabe",
                category: "relics",
                image: "/images/items/default-relic.png",
                isAvailable: true,
                rating: "★★★★★"
            },
            canonicalIslands: CANONICAL_ISLANDS,
            tradingBranches: TRADING_BRANCHES,
            error: null,
            user: req.user
        });

    } catch (error) {
        console.error("Error in renderCreateProduct:", error);
        res.status(500).render("home", {
            page_title: "Command Deck Tempest | Error",
            user: req.user || null
        });
    }
};

/**
 * Controller action: Create New Seller Product (Milestone 4.3)
 * Route: POST /seller/products/new or POST /seller/products
 * Protected by: authMiddleware, requireSeller
 */
export const createProduct = async (req, res) => {
    try {
        const sellerUser = req.user;
        if (!sellerUser || sellerUser.role !== "seller") {
            return res.status(403).send("Access denied: insufficient permissions.");
        }

        const {
            name,
            price,
            description,
            stock,
            island,
            category,
            isAvailable,
            image,
            rating
        } = req.body;

        const islandMeta = sellerUser.homeIsland && ISLANDS_DATA[sellerUser.homeIsland]
            ? ISLANDS_DATA[sellerUser.homeIsland]
            : null;

        const seller = {
            id: sellerUser._id.toString(),
            _id: sellerUser._id,
            name: sellerUser.name || "Unknown Captain",
            storeName: sellerUser.storeName || "",
            homeIsland: sellerUser.homeIsland || "",
            avatar: sellerUser.avatar || "/images/avatars/default-pirate.png",
            role: sellerUser.role
        };

        const renderFormError = (errorMessage) => {
            return res.status(400).render("seller/product-create", {
                page_title: "Forge New Cargo — Vault Management | Pirate-Civ",
                seller,
                island: islandMeta,
                product: { ...req.body },
                canonicalIslands: CANONICAL_ISLANDS,
                tradingBranches: TRADING_BRANCHES,
                error: errorMessage,
                user: req.user
            });
        };

        // 1. Validation: Name
        const trimmedName = typeof name === "string" ? name.trim() : "";
        if (!trimmedName || trimmedName.length > 120) {
            return renderFormError("Product name is required and cannot exceed 120 characters.");
        }

        // 2. Validation: Price
        const numPrice = Number(price);
        if (price === "" || price === undefined || isNaN(numPrice) || numPrice < 0) {
            return renderFormError("Valuation price must be a non-negative number in Doubloons.");
        }

        // 3. Validation: Description
        const trimmedDesc = typeof description === "string" ? description.trim() : "";
        if (!trimmedDesc || trimmedDesc.length > 2000) {
            return renderFormError("Product description is required and cannot exceed 2000 characters.");
        }

        // 4. Validation: Stock
        const numStock = stock === "" || stock === undefined ? 10 : Number(stock);
        if (isNaN(numStock) || !Number.isInteger(numStock) || numStock < 0) {
            return renderFormError("Stock must be a non-negative integer.");
        }

        // 5. Validation: Island
        const trimmedIsland = typeof island === "string" ? island.trim() : "";
        if (!trimmedIsland || !CANONICAL_ISLANDS.includes(trimmedIsland)) {
            return renderFormError("Selected island must be one of the 6 canonical trading islands.");
        }

        // 6. Validation: Category
        const trimmedCategory = typeof category === "string" ? category.trim() : "";
        if (!trimmedCategory || !TRADING_BRANCHES.includes(trimmedCategory)) {
            return renderFormError("Selected category must be one of the canonical trading branches (relics, apparel, provisions).");
        }

        // 7. Validation: Availability
        const parsedAvailability = isAvailable === undefined
            ? false
            : (isAvailable === true || isAvailable === "true" || isAvailable === "on" || isAvailable === 1 || isAvailable === "1");

        // 8. Image & Rating
        const trimmedImage = typeof image === "string" && image.trim()
            ? image.trim()
            : "/images/items/default-relic.png";
        const trimmedRating = typeof rating === "string" && rating.trim()
            ? rating.trim()
            : "★★★★★";

        // 9. Slug Pre-Check & Duplicate Protection
        const baseSlug = trimmedName
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");

        if (baseSlug) {
            const existingProductWithSlug = await Product.findOne({ slug: baseSlug });
            if (existingProductWithSlug) {
                return renderFormError("A product with a conflicting title/slug already exists in the archipelago. Please choose a distinct title.");
            }
        }

        // 10. Instantiate & Save Product
        const newProduct = new Product({
            seller: sellerUser._id, // Strictly authenticated seller identity
            name: trimmedName,
            price: numPrice,
            description: trimmedDesc,
            stock: numStock,
            island: trimmedIsland,
            category: trimmedCategory,
            isAvailable: parsedAvailability,
            image: trimmedImage,
            rating: trimmedRating
        });

        await newProduct.save();

        if (req.xhr || req.headers.accept?.includes("application/json")) {
            return res.status(201).json({
                success: true,
                product: newProduct
            });
        }

        return res.redirect("/seller/products?created=1");

    } catch (error) {
        // Handle MongoDB duplicate key error gracefully
        if (error.code === 11000) {
            return res.status(400).render("seller/product-create", {
                page_title: "Forge New Cargo — Vault Management | Pirate-Civ",
                seller: {
                    id: req.user._id.toString(),
                    _id: req.user._id,
                    name: req.user.name || "Unknown Captain",
                    storeName: req.user.storeName || "",
                    homeIsland: req.user.homeIsland || "",
                    avatar: req.user.avatar || "/images/avatars/default-pirate.png",
                    role: req.user.role
                },
                island: req.user.homeIsland && ISLANDS_DATA[req.user.homeIsland] ? ISLANDS_DATA[req.user.homeIsland] : null,
                product: { ...req.body },
                canonicalIslands: CANONICAL_ISLANDS,
                tradingBranches: TRADING_BRANCHES,
                error: "A ware with a conflicting title/slug already exists. Please choose a unique title.",
                user: req.user
            });
        }

        console.error("Error in createProduct:", error);
        res.status(500).render("home", {
            page_title: "Command Deck Tempest | Error",
            user: req.user || null
        });
    }
};

// Aliases for route & backwards compatibility
export const renderSellerDiscovery = renderSellerStorefront;
export const renderPublicSeller = renderSellerStorefront;

/**
 * Controller action: Render Seller Profile Management Page (Milestone 4.5)
 * Route: GET /seller/profile
 * Protected by: authMiddleware, requireSeller
 */
export const renderSellerProfile = async (req, res) => {
    try {
        const sellerUser = req.user;
        if (!sellerUser || sellerUser.role !== "seller") {
            return res.status(403).send("Access denied: insufficient permissions.");
        }

        const islandMeta = sellerUser.homeIsland && ISLANDS_DATA[sellerUser.homeIsland]
            ? ISLANDS_DATA[sellerUser.homeIsland]
            : null;

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

        const successMessage = req.query.updated === "1"
            ? "Captain's profile and charter lore successfully updated."
            : null;

        res.render("seller/profile", {
            page_title: `${seller.storeName || seller.name} — Captain's Profile | Pirate-Civ`,
            seller,
            island: islandMeta,
            canonicalIslands: CANONICAL_ISLANDS,
            storefrontUrl: `/seller/${seller.id}`,
            error: null,
            success: successMessage,
            user: req.user
        });

    } catch (error) {
        console.error("Error in renderSellerProfile:", error);
        res.status(500).render("home", {
            page_title: "Command Deck Tempest | Error",
            user: req.user || null
        });
    }
};

/**
 * Controller action: Update Seller Profile (Milestone 4.5)
 * Route: POST /seller/profile (and POST /seller/profile/edit)
 * Protected by: authMiddleware, requireSeller
 */
export const updateSellerProfile = async (req, res) => {
    try {
        const sellerUser = req.user;
        if (!sellerUser || sellerUser.role !== "seller") {
            return res.status(403).send("Access denied: insufficient permissions.");
        }

        // Strictly whitelist permitted profile fields ONLY
        // NEVER accept or allow modification of email, password, authSecretHash, googleId, or role!
        const {
            name,
            storeName,
            homeIsland,
            bio,
            avatar
        } = req.body;

        const renderFormError = (errorMessage, safeFormData = {}) => {
            const mergedSeller = {
                id: sellerUser._id.toString(),
                _id: sellerUser._id,
                name: typeof safeFormData.name === "string" ? safeFormData.name : (sellerUser.name || ""),
                storeName: typeof safeFormData.storeName === "string" ? safeFormData.storeName : (sellerUser.storeName || ""),
                homeIsland: typeof safeFormData.homeIsland === "string" ? safeFormData.homeIsland : (sellerUser.homeIsland || ""),
                bio: typeof safeFormData.bio === "string" ? safeFormData.bio : (sellerUser.bio || ""),
                avatar: typeof safeFormData.avatar === "string" ? safeFormData.avatar : (sellerUser.avatar || "/images/avatars/default-pirate.png"),
                role: sellerUser.role
            };

            const islandMeta = mergedSeller.homeIsland && ISLANDS_DATA[mergedSeller.homeIsland]
                ? ISLANDS_DATA[mergedSeller.homeIsland]
                : null;

            if (req.xhr || req.headers.accept?.includes("application/json")) {
                return res.status(400).json({
                    success: false,
                    error: errorMessage
                });
            }

            return res.status(400).render("seller/profile", {
                page_title: `${mergedSeller.storeName || mergedSeller.name} — Captain's Profile | Pirate-Civ`,
                seller: mergedSeller,
                island: islandMeta,
                canonicalIslands: CANONICAL_ISLANDS,
                storefrontUrl: `/seller/${sellerUser._id}`,
                error: errorMessage,
                success: null,
                user: req.user
            });
        };

        // 1. Fetch exclusively the authenticated user's document from MongoDB upfront
        const user = await User.findById(sellerUser._id);
        if (!user) {
            return res.status(404).send("Merchant record not found.");
        }

        // 2. Validation: Captain Name (Required if provided, or must already exist; Max 120 chars)
        if (name !== undefined) {
            if (typeof name !== "string") {
                return renderFormError("Captain / Merchant name is required.", req.body);
            }
            const trimmedName = name.trim();
            if (!trimmedName || trimmedName.length > 120) {
                return renderFormError("Captain / Merchant name is required and cannot exceed 120 characters.", req.body);
            }
            user.name = trimmedName;
        } else if (!user.name) {
            return renderFormError("Captain / Merchant name is required.", req.body);
        }

        // 3. Validation: Storefront Title (Optional, Trimmed, Max 120 chars; retain saved value if omitted)
        if (storeName !== undefined) {
            if (storeName === null || storeName === "") {
                user.storeName = null;
            } else {
                if (typeof storeName !== "string") {
                    return renderFormError("Store title must be a valid text string.", req.body);
                }
                const trimmedStoreName = storeName.trim();
                if (trimmedStoreName.length > 120) {
                    return renderFormError("Store title cannot exceed 120 characters.", req.body);
                }
                user.storeName = trimmedStoreName || null;
            }
        }

        // 4. Validation: Home Island (Must be member of canonical 6 islands or null; retain saved value if omitted)
        if (homeIsland !== undefined) {
            if (homeIsland === null || homeIsland === "") {
                user.homeIsland = null;
            } else {
                if (typeof homeIsland !== "string") {
                    return renderFormError("Home island must be a valid text string.", req.body);
                }
                const trimmedIsland = homeIsland.trim();
                if (trimmedIsland && !CANONICAL_ISLANDS.includes(trimmedIsland)) {
                    return renderFormError("Selected island must be one of the 6 canonical trading islands.", req.body);
                }
                user.homeIsland = trimmedIsland || null;
            }
        }

        // 5. Validation: Bio (Optional, Trimmed, Max 2000 chars; retain saved value if omitted)
        if (bio !== undefined) {
            if (bio === null || bio === "") {
                user.bio = "";
            } else {
                if (typeof bio !== "string") {
                    return renderFormError("Merchant bio must be a valid text string.", req.body);
                }
                const trimmedBio = bio.trim();
                if (trimmedBio.length > 2000) {
                    return renderFormError("Merchant bio lore cannot exceed 2000 characters.", req.body);
                }
                user.bio = trimmedBio;
            }
        }

        // 6. Validation: Avatar (Optional, Path or URL, safe scheme, Max 500 chars; retain saved value if omitted)
        if (avatar !== undefined) {
            if (avatar === null || avatar === "") {
                user.avatar = "/images/avatars/default-pirate.png";
            } else {
                if (typeof avatar !== "string") {
                    return renderFormError("Avatar path must be a valid string.", req.body);
                }
                const trimmedAvatar = avatar.trim();
                if (trimmedAvatar.length > 500) {
                    return renderFormError("Avatar path/URL cannot exceed 500 characters.", req.body);
                }
                const lowerAvatar = trimmedAvatar.toLowerCase();
                if (lowerAvatar.startsWith("javascript:") || lowerAvatar.startsWith("vbscript:") || lowerAvatar.startsWith("data:") || lowerAvatar.includes("<script>")) {
                    return renderFormError("Avatar contains an invalid or malicious protocol.", req.body);
                }
                if (trimmedAvatar.startsWith("//")) {
                    return renderFormError("Protocol-relative URLs are not allowed for avatar.", req.body);
                } else if (trimmedAvatar.startsWith("/")) {
                    user.avatar = trimmedAvatar;
                } else {
                    try {
                        const parsedUrl = new URL(trimmedAvatar);
                        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
                            return renderFormError("Avatar contains an invalid or malicious protocol. URL must use http: or https: protocol.", req.body);
                        }
                        user.avatar = trimmedAvatar;
                    } catch (e) {
                        return renderFormError("Avatar must be a valid relative path (starting with /) or web URL (http:// or https://).", req.body);
                    }
                }
            }
        }

        await user.save();

        // Refresh in-memory req.user
        req.user.name = user.name;
        req.user.storeName = user.storeName;
        req.user.homeIsland = user.homeIsland;
        req.user.bio = user.bio;
        req.user.avatar = user.avatar;

        if (req.xhr || req.headers.accept?.includes("application/json")) {
            return res.json({
                success: true,
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    storeName: user.storeName,
                    homeIsland: user.homeIsland,
                    bio: user.bio,
                    avatar: user.avatar
                }
            });
        }

        return res.redirect("/seller/profile?updated=1");

    } catch (error) {
        console.error("Error in updateSellerProfile:", error);
        res.status(500).render("home", {
            page_title: "Command Deck Tempest | Error",
            user: req.user || null
        });
    }
};

/**
 * Controller action: Render Seller Order Management Console (Milestone 4.4)
 * Route: GET /seller/orders
 * Protected by: authMiddleware, requireSeller
 */
export const renderSellerOrders = async (req, res) => {
    try {
        const sellerUser = req.user;
        if (!sellerUser || sellerUser.role !== "seller") {
            return res.status(403).send("Access denied: insufficient permissions.");
        }

        const sellerIdStr = sellerUser._id.toString();

        // 1. Query all orders containing items for this seller
        // Leverages compound index { "items.seller": 1, status: 1 }
        const allSellerOrders = await Order.findBySeller(sellerUser._id)
            .populate("buyer", "name")
            .populate("fulfillments.seller", "name storeName")
            .lean();

        // 2. Compute seller order telemetry (strictly scoped to this seller's fulfillments - AUD-001)
        const telemetry = {
            total: allSellerOrders.length,
            pending: 0,
            confirmed: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
        };

        allSellerOrders.forEach(o => {
            const f = (o.fulfillments || []).find(item => {
                const sId = item.seller?._id || item.seller;
                return sId && sId.toString() === sellerIdStr;
            });
            const s = f ? f.status : o.status;
            if (telemetry[s] !== undefined) {
                telemetry[s]++;
            }
        });

        // 3. Optional status filtering via query parameter (based on seller's fulfillment status)
        const activeFilter = typeof req.query.status === "string" ? req.query.status.trim().toLowerCase() : "all";
        let filteredOrders = allSellerOrders;
        if (activeFilter && activeFilter !== "all" && FULFILLMENT_STATUSES.includes(activeFilter)) {
            filteredOrders = allSellerOrders.filter(o => {
                const f = (o.fulfillments || []).find(item => {
                    const sId = item.seller?._id || item.seller;
                    return sId && sId.toString() === sellerIdStr;
                });
                const s = f ? f.status : o.status;
                return s === activeFilter;
            });
        }

        // 4. Transform orders: expose ONLY seller-relevant items, fulfillment status, and totals
        // Multi-seller rule (AUD-001): Each seller sees their own fulfillment state and cargo items!
        const viewOrders = filteredOrders.map(order => {
            const sellerItems = (order.items || []).filter(item => {
                const itemSellerId = item.seller?._id || item.seller;
                return itemSellerId && itemSellerId.toString() === sellerIdStr;
            });

            const sellerSubtotal = sellerItems.reduce((sum, item) => {
                const lt = typeof item.lineTotal === "number"
                    ? item.lineTotal
                    : ((item.price || 0) * (item.quantity || 1));
                return sum + lt;
            }, 0);

            const sellerItemCount = sellerItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

            const sellerFulfillment = (order.fulfillments || []).find(f => {
                const itemSellerId = f.seller?._id || f.seller;
                return itemSellerId && itemSellerId.toString() === sellerIdStr;
            });
            const sellerStatus = sellerFulfillment ? sellerFulfillment.status : order.status;

            return {
                ...order,
                id: order._id.toString(),
                items: sellerItems,
                sellerSubtotal,
                sellerItemCount,
                sellerStatus,
                fulfillmentStatus: sellerStatus,
                buyerName: order.buyer ? order.buyer.name : "Archipelago Explorer",
                formattedDate: order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                }) : "Unknown Date"
            };
        });

        const islandMeta = sellerUser.homeIsland && ISLANDS_DATA[sellerUser.homeIsland]
            ? ISLANDS_DATA[sellerUser.homeIsland]
            : null;

        const seller = {
            id: sellerUser._id.toString(),
            _id: sellerUser._id,
            name: sellerUser.name || "Unknown Captain",
            storeName: sellerUser.storeName || "",
            homeIsland: sellerUser.homeIsland || "",
            avatar: sellerUser.avatar || "/images/avatars/default-pirate.png",
            role: sellerUser.role
        };

        res.render("seller/orders", {
            page_title: `${seller.storeName || seller.name} — Dispatch Manifests | Pirate-Civ`,
            seller,
            island: islandMeta,
            orders: viewOrders,
            telemetry,
            activeFilter,
            canonicalStatuses: ORDER_STATUSES,
            storefrontUrl: `/seller/${seller.id}`,
            user: req.user,
            query: req.query || {}
        });

    } catch (error) {
        console.error("Error in renderSellerOrders:", error);
        res.status(500).render("home", {
            page_title: "Command Deck Tempest | Error",
            user: req.user || null
        });
    }
};

/**
 * Controller action: Render Seller Order Detail Page (Milestone 4.4 & AUD-001)
 * Route: GET /seller/orders/:orderId
 * Protected by: authMiddleware, requireSeller
 */
export const renderSellerOrderDetail = async (req, res) => {
    try {
        const sellerUser = req.user;
        if (!sellerUser || sellerUser.role !== "seller") {
            return res.status(403).send("Access denied: insufficient permissions.");
        }

        const { orderId } = req.params;
        if (!orderId || !mongoose.isValidObjectId(orderId)) {
            return res.status(404).render("home", {
                page_title: "Voyage Manifest Not Found | Pirate-Civ",
                user: req.user || null
            });
        }

        const order = await Order.findById(orderId)
            .populate("buyer", "name")
            .populate("fulfillments.seller", "name storeName")
            .lean();

        if (!order) {
            return res.status(404).render("home", {
                page_title: "Voyage Manifest Not Found | Pirate-Civ",
                user: req.user || null
            });
        }

        const sellerIdStr = sellerUser._id.toString();

        // Multi-Seller Order Verification: Seller must own at least one item in the order
        const sellerItems = (order.items || []).filter(item => {
            const itemSellerId = item.seller?._id || item.seller;
            return itemSellerId && itemSellerId.toString() === sellerIdStr;
        });

        if (sellerItems.length === 0) {
            return res.status(403).send("Access denied: you do not have permission to view this order.");
        }

        // Expose ONLY the seller-relevant portion of the order
        const sellerSubtotal = sellerItems.reduce((sum, item) => {
            const lt = typeof item.lineTotal === "number"
                ? item.lineTotal
                : ((item.price || 0) * (item.quantity || 1));
            return sum + lt;
        }, 0);

        // Seller-specific fulfillment lifecycle state (AUD-001)
        const sellerFulfillment = (order.fulfillments || []).find(f => {
            const itemSellerId = f.seller?._id || f.seller;
            return itemSellerId && itemSellerId.toString() === sellerIdStr;
        });
        const sellerStatus = sellerFulfillment ? sellerFulfillment.status : order.status;

        const permittedTransitions = PERMITTED_STATUS_TRANSITIONS[sellerStatus] || [];

        const islandMeta = sellerUser.homeIsland && ISLANDS_DATA[sellerUser.homeIsland]
            ? ISLANDS_DATA[sellerUser.homeIsland]
            : null;

        const seller = {
            id: sellerUser._id.toString(),
            _id: sellerUser._id,
            name: sellerUser.name || "Unknown Captain",
            storeName: sellerUser.storeName || "",
            homeIsland: sellerUser.homeIsland || "",
            avatar: sellerUser.avatar || "/images/avatars/default-pirate.png",
            role: sellerUser.role
        };

        const viewOrder = {
            ...order,
            id: order._id.toString(),
            items: sellerItems,
            sellerSubtotal,
            sellerStatus,
            fulfillmentStatus: sellerStatus,
            buyerName: order.buyer ? order.buyer.name : "Archipelago Explorer",
            formattedDate: order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }) : "Unknown Date"
        };

        res.render("seller/order-detail", {
            page_title: `Manifest #${order._id} — Fulfillment | Pirate-Civ`,
            seller,
            island: islandMeta,
            order: viewOrder,
            permittedTransitions,
            storefrontUrl: `/seller/${seller.id}`,
            user: req.user,
            query: req.query || {},
            error: req.query.error || null
        });

    } catch (error) {
        console.error("Error in renderSellerOrderDetail:", error);
        res.status(500).render("home", {
            page_title: "Command Deck Tempest | Error",
            user: req.user || null
        });
    }
};

/**
 * Controller action: Perform Order Status Transition (Milestone 4.4 & AUD-001)
 * Route: POST /seller/orders/:orderId/status
 * Protected by: authMiddleware, requireSeller
 *
 * Updates ONLY this authenticated seller's fulfillment status.
 * Leaves all other sellers' fulfillments strictly untouched.
 * Automatically recalculates root Order.status as the aggregate status.
 */
export const updateOrderStatus = async (req, res) => {
    try {
        const sellerUser = req.user;
        if (!sellerUser || sellerUser.role !== "seller") {
            return res.status(403).send("Access denied: insufficient permissions.");
        }

        const { orderId } = req.params;
        if (!orderId || !mongoose.isValidObjectId(orderId)) {
            return res.status(404).render("home", {
                page_title: "Voyage Manifest Not Found | Pirate-Civ",
                user: req.user || null
            });
        }

        // Fetch order as Mongoose Document to utilize lifecycle methods
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).render("home", {
                page_title: "Voyage Manifest Not Found | Pirate-Civ",
                user: req.user || null
            });
        }

        const sellerIdStr = sellerUser._id.toString();

        // Ownership verification: must contain at least one item belonging to this seller
        const hasSellerItem = (order.items || []).some(item => {
            const itemSellerId = item.seller?._id || item.seller;
            return itemSellerId && itemSellerId.toString() === sellerIdStr;
        });

        if (!hasSellerItem) {
            return res.status(403).send("Access denied: you do not have permission to modify this order.");
        }

        const rawStatus = req.body.status || req.body.targetStatus;
        const targetStatus = typeof rawStatus === "string" ? rawStatus.trim().toLowerCase() : "";

        // Authoritative seller fulfillment lifecycle validation (AUD-001)
        if (!order.canTransitionFulfillment(sellerUser._id, targetStatus)) {
            const fulfillment = order.getFulfillmentForSeller(sellerUser._id);
            const currentFulfillmentStatus = fulfillment ? fulfillment.status : order.status;
            const errorMsg = `Invalid status transition from '${currentFulfillmentStatus}' to '${targetStatus}'.`;
            if (req.xhr || req.headers.accept?.includes("application/json")) {
                return res.status(400).json({
                    success: false,
                    error: errorMsg,
                    currentStatus: currentFulfillmentStatus
                });
            }
            return res.redirect(`/seller/orders/${order._id}?error=${encodeURIComponent(errorMsg)}`);
        }

        // Apply transition to strictly this seller's fulfillment and recalculate aggregate status
        order.transitionFulfillment(sellerUser._id, targetStatus);
        await order.save();

        const updatedFulfillment = order.getFulfillmentForSeller(sellerUser._id);

        if (req.xhr || req.headers.accept?.includes("application/json")) {
            return res.json({
                success: true,
                orderId: order._id,
                status: updatedFulfillment ? updatedFulfillment.status : order.status,
                orderStatus: order.status
            });
        }

        return res.redirect(`/seller/orders/${order._id}?updated=1`);

    } catch (error) {
        console.error("Error in updateOrderStatus:", error);
        res.status(500).render("home", {
            page_title: "Command Deck Tempest | Error",
            user: req.user || null
        });
    }
};

export default {
    renderSellerStorefront,
    renderSellerDiscovery,
    renderPublicSeller,
    renderSellerProfile,
    renderSellerDashboard,
    renderSellerProducts,
    renderEditProduct,
    updateProduct,
    toggleProductAvailability,
    deleteProduct,
    renderCreateProduct,
    createProduct,
    renderSellerOrders,
    renderSellerOrderDetail,
    updateOrderStatus,
    updateSellerProfile
};
