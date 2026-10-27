import express from "express";

import { saveContactDetails } from "../controller/contact.js";

import {
    renderBuyerLogin,
    renderBuyerRegister,
    loginBuyer,
    registerBuyer,
    renderSellerLogin,
    renderSellerRegister,
    loginSeller,
    registerSeller,
    renderDeveloperLogin,
    loginDeveloper,
    logoutDeveloper,
    logoutUser,
    loginUser,
    registerUser
} from "../controller/auth.js";

import {
    getAllUsers
} from "../controller/users.js";

import authMiddleware, { optionalAuth } from "../middleware/auth.js";


const router = express.Router();

// =====================================================
// GLOBAL NAVIGATION CONTEXT MIDDLEWARE
// =====================================================
router.use((req, res, next) => {
    res.locals.currentPath = req.path;
    next();
});


// =====================================================
import { initiateGoogleAuth, handleGoogleCallback } from "../controller/googleAuth.js";

// =====================================================
// DEDICATED BUYER AUTHENTICATION ROUTES
// =====================================================
router.get("/buyer/login", optionalAuth, renderBuyerLogin);
router.post("/buyer/login", loginBuyer);
router.get("/buyer/register", optionalAuth, renderBuyerRegister);
router.post("/buyer/register", registerBuyer);

// =====================================================
// DEDICATED SELLER AUTHENTICATION ROUTES
// =====================================================
router.get("/seller/login", optionalAuth, renderSellerLogin);
router.post("/seller/login", loginSeller);
router.get("/seller/register", optionalAuth, renderSellerRegister);
router.post("/seller/register", registerSeller);

// =====================================================
// DEDICATED DEVELOPER AUTHENTICATION ROUTES
// =====================================================
router.get("/admin/login", optionalAuth, renderDeveloperLogin);
router.post("/admin/login", loginDeveloper);
router.get("/developer/login", optionalAuth, renderDeveloperLogin);
router.post("/developer/login", loginDeveloper);

// =====================================================
// GOOGLE OAUTH ROUTES
// =====================================================
router.get("/auth/google", initiateGoogleAuth);
router.get("/auth/google/callback", handleGoogleCallback);

// =====================================================
// BACKWARD COMPATIBILITY / ALIAS AUTH ROUTES
// =====================================================
router.get("/login", optionalAuth, (req, res) => {
    if (req.user) {
        if (req.user.role === "admin") return res.redirect("/admin/dashboard");
        if (req.user.role === "seller") return res.redirect("/seller/dashboard");
        return res.redirect("/home");
    }

    const rawIntent = (req.query.intent || req.session?.authIntent || "").toLowerCase().trim();
    const queryStr = req.query.error ? `?error=${encodeURIComponent(req.query.error)}` : "";
    if (rawIntent === "seller" || rawIntent === "merchant") {
        return res.redirect(`/seller/login${queryStr}`);
    }
    if (rawIntent === "admin" || rawIntent === "developer") {
        return res.redirect(`/admin/login${queryStr}`);
    }
    return res.redirect(`/buyer/login${queryStr}`);
});

router.get("/register", optionalAuth, (req, res) => {
    if (req.user) {
        if (req.user.role === "seller") return res.redirect("/seller/dashboard");
        return res.redirect("/home");
    }

    const rawIntent = (req.query.intent || req.session?.authIntent || "").toLowerCase().trim();
    const queryStr = req.query.error ? `?error=${encodeURIComponent(req.query.error)}` : "";
    if (rawIntent === "seller" || rawIntent === "merchant") {
        return res.redirect(`/seller/register${queryStr}`);
    }
    return res.redirect(`/buyer/register${queryStr}`);
});

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);


// =====================================================
// USERS / CHARTERED EXPLORERS & MERCHANTS
// =====================================================

router.get(
    "/explorers",
    authMiddleware,
    requireBuyer,
    getAllUsers
);

router.get(
    "/users",
    authMiddleware,
    requireBuyer,
    getAllUsers
);


// =====================================================
// HOME
// =====================================================

router.get(
    "/",
    optionalAuth,
    (req, res) => {

        res.render("gateway", {

            page_title: "PIRATE-CIV — The Sea Awaits",

            user: req.user || null

        });

    }
);

router.get(
    "/home",
    authMiddleware,
    (req, res) => {

        res.render("home", {

            page_title: "Home Page",

            user: req.user

        });

    }
);


// =====================================================
// DEVELOPER REALM / CANONICAL DEVELOPER DASHBOARD
// =====================================================
// DEVELOPER REALM / CANONICAL DEVELOPER DASHBOARD
// =====================================================

import { requireAdmin } from "../middleware/roles.js";
import {
    renderDeveloperDashboard,
    renderSellerApplications,
    approveSeller,
    rejectSeller,
    renderPeople,
    renderDeveloperSellerProducts,
    renderBuyerPurchases,
    renderMarketplace
} from "../controller/developer.js";

// Canonical Dashboard & Aliases
router.get("/developer/dashboard", authMiddleware, requireAdmin, renderDeveloperDashboard);
router.get("/admin/dashboard", authMiddleware, requireAdmin, renderDeveloperDashboard);
router.get("/developer", authMiddleware, requireAdmin, (req, res) => res.redirect("/developer/dashboard"));
router.get("/admin", authMiddleware, requireAdmin, (req, res) => res.redirect("/developer/dashboard"));

// Developer Disconnect (Destroys developer session and returns to Gateway /)
router.get("/developer/logout", logoutDeveloper);
router.get("/admin/logout", logoutDeveloper);

// Seller Applications & Charter Approvals
router.get("/developer/sellers/applications", authMiddleware, requireAdmin, renderSellerApplications);
router.get("/admin/sellers/applications", authMiddleware, requireAdmin, renderSellerApplications);
router.post("/developer/sellers/:id/approve", authMiddleware, requireAdmin, approveSeller);
router.post("/admin/sellers/:id/approve", authMiddleware, requireAdmin, approveSeller);
router.post("/developer/sellers/:id/reject", authMiddleware, requireAdmin, rejectSeller);
router.post("/admin/sellers/:id/reject", authMiddleware, requireAdmin, rejectSeller);

// People: Buyers & Sellers
router.get("/developer/people", authMiddleware, requireAdmin, renderPeople);
router.get("/admin/people", authMiddleware, requireAdmin, renderPeople);

// Marketplace Oversight: Master Cargo & Trade Manifest
router.get("/developer/marketplace", authMiddleware, requireAdmin, renderMarketplace);
router.get("/admin/marketplace", authMiddleware, requireAdmin, renderMarketplace);

// Marketplace Oversight: Seller Products
router.get("/developer/people/sellers/:id/products", authMiddleware, requireAdmin, renderDeveloperSellerProducts);
router.get("/admin/people/sellers/:id/products", authMiddleware, requireAdmin, renderDeveloperSellerProducts);

// Marketplace Oversight: Buyer Purchases
router.get("/developer/people/buyers/:id/orders", authMiddleware, requireAdmin, renderBuyerPurchases);
router.get("/admin/people/buyers/:id/orders", authMiddleware, requireAdmin, renderBuyerPurchases);


// =====================================================
// ABOUT
// =====================================================

router.get(
    "/about",
    optionalAuth,
    (req, res) => {

        res.render("about", {

            page_title: "About Us Page",

            user: req.user || null

        });

    }
);


// =====================================================
// GALLERY
// =====================================================

// router.get(
//     "/gallery",
//     authMiddleware,
//     (req, res) => {
//
//         res.render("gallery", {
//
//             page_title: "Gallery Page",
//
//             user: req.user
//
//         });
//
//     }
// );


// =====================================================
// CONTACT GET
// =====================================================

router.get(
    "/contact",
    authMiddleware,
    (req, res) => {

        const success =
            req.query.success === "true";


        res.render("contact", {

            page_title: "Contact Us Page",

            success: success,

            user: req.user

        });

    }
);


// =====================================================
// CONTACT POST
// =====================================================

router.post(
    "/contact",
    authMiddleware,
    saveContactDetails
);


// =====================================================
// DEDICATED ISLAND VIEWS (6 LEAF NODES)
// =====================================================

import { renderIslandPage } from "../controller/islands.js";

// Parametric routes
router.get("/island/:islandId", authMiddleware, renderIslandPage());
router.get("/islands/:islandId", authMiddleware, renderIslandPage());
router.get("/islands", authMiddleware, (req, res) => {
    res.redirect("/#sea-chart-section");
});

// Named convenience routes for the 6 islands
router.get("/island/astrolabe", authMiddleware, renderIslandPage("astrolabe"));
router.get("/island/chronos", authMiddleware, renderIslandPage("chronos"));
router.get("/island/kraken_vault", authMiddleware, renderIslandPage("kraken_vault"));
router.get("/island/kraken-vault", authMiddleware, renderIslandPage("kraken_vault"));
router.get("/island/cutlass_cove", authMiddleware, renderIslandPage("cutlass_cove"));
router.get("/island/cutlass-cove", authMiddleware, renderIslandPage("cutlass_cove"));
router.get("/island/velvet_isle", authMiddleware, renderIslandPage("velvet_isle"));
router.get("/island/velvet-isle", authMiddleware, renderIslandPage("velvet_isle"));
router.get("/island/booty_cay", authMiddleware, renderIslandPage("booty_cay"));
router.get("/island/booty-cay", authMiddleware, renderIslandPage("booty_cay"));

// Direct shorthand routes
router.get("/astrolabe", authMiddleware, renderIslandPage("astrolabe"));
router.get("/chronos", authMiddleware, renderIslandPage("chronos"));
router.get("/kraken-vault", authMiddleware, renderIslandPage("kraken_vault"));
router.get("/kraken_vault", authMiddleware, renderIslandPage("kraken_vault"));
router.get("/cutlass-cove", authMiddleware, renderIslandPage("cutlass_cove"));
router.get("/cutlass_cove", authMiddleware, renderIslandPage("cutlass_cove"));
router.get("/velvet-isle", authMiddleware, renderIslandPage("velvet_isle"));
router.get("/velvet_isle", authMiddleware, renderIslandPage("velvet_isle"));
router.get("/booty-cay", authMiddleware, renderIslandPage("booty_cay"));
router.get("/booty_cay", authMiddleware, renderIslandPage("booty_cay"));


// =====================================================
// REUSABLE PRODUCT DETAIL ROUTE
// =====================================================

import { renderProductDetail } from "../controller/products.js";

router.get("/product/:productId", authMiddleware, renderProductDetail);


// =====================================================
// SELLER PORTAL & COMMAND DECK (MILESTONE 4.1 & 4.2)
// =====================================================

import { requireSeller } from "../middleware/roles.js";
import {
    renderSellerDashboard,
    renderSellerProducts,
    renderCreateProduct,
    createProduct,
    renderEditProduct,
    updateProduct,
    toggleProductAvailability,
    deleteProduct,
    renderSellerStorefront,
    renderSellerOrders,
    renderSellerOrderDetail,
    updateOrderStatus,
    renderSellerProfile,
    updateSellerProfile
} from "../controller/sellers.js";

import {
    uploadAvatarMiddleware,
    uploadProductImageMiddleware
} from "../middleware/upload.js";

import {
    getFavorites,
    toggleFavorite
} from "../controller/favorites.js";

import {
    getBuyerProfile,
    updateBuyerProfile
} from "../controller/profile.js";

router.get("/seller/dashboard", authMiddleware, requireSeller, renderSellerDashboard);
router.get("/seller/portal", authMiddleware, requireSeller, (req, res) => res.redirect("/seller/dashboard"));
router.get("/seller", authMiddleware, requireSeller, (req, res) => res.redirect("/seller/dashboard"));

// Seller Profile Management (Milestone 4.5 & Phase 6.3)
router.get("/seller/profile", authMiddleware, requireSeller, renderSellerProfile);
router.post("/seller/profile", authMiddleware, requireSeller, uploadAvatarMiddleware, updateSellerProfile);
router.post("/seller/profile/edit", authMiddleware, requireSeller, uploadAvatarMiddleware, updateSellerProfile);

// Seller Product Management (Milestone 4.2 & 4.3 & Phase 6.3 Uploads)
router.get("/seller/products", authMiddleware, requireSeller, renderSellerProducts);
router.get("/seller/products/new", authMiddleware, requireSeller, renderCreateProduct);
router.post("/seller/products/new", authMiddleware, requireSeller, uploadProductImageMiddleware, createProduct);
router.post("/seller/products", authMiddleware, requireSeller, uploadProductImageMiddleware, createProduct);

router.get("/seller/products/:productId/edit", authMiddleware, requireSeller, renderEditProduct);
router.post("/seller/products/:productId/edit", authMiddleware, requireSeller, uploadProductImageMiddleware, updateProduct);
router.post("/seller/products/:productId/update", authMiddleware, requireSeller, uploadProductImageMiddleware, updateProduct);
router.post("/seller/products/:productId/toggle-availability", authMiddleware, requireSeller, toggleProductAvailability);
router.post("/seller/products/:productId/toggle", authMiddleware, requireSeller, toggleProductAvailability);
router.post("/seller/products/:productId/delete", authMiddleware, requireSeller, deleteProduct);
router.delete("/seller/products/:productId", authMiddleware, requireSeller, deleteProduct);

// Seller Order Management & Fulfillment (Milestone 4.4)
router.get("/seller/orders", authMiddleware, requireSeller, renderSellerOrders);
router.get("/seller/orders/:orderId", authMiddleware, requireSeller, renderSellerOrderDetail);
router.post("/seller/orders/:orderId/status", authMiddleware, requireSeller, updateOrderStatus);
router.post("/seller/orders/:orderId/transition", authMiddleware, requireSeller, updateOrderStatus);


// =====================================================
// REUSABLE SELLER PROFILE / STOREFRONT ROUTE (MILESTONE 3.4)
// =====================================================

router.get("/seller/:sellerId", authMiddleware, renderSellerStorefront);


// =====================================================
// CARGO CART / CARGO HOLD ROUTES (MILESTONE 3.5)
// =====================================================

import { forbidSeller } from "../middleware/roles.js";
import {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart
} from "../controller/cart.js";

router.get("/cart", optionalAuth, forbidSeller, getCart);
router.post("/cart/add", optionalAuth, forbidSeller, addToCart);
router.post("/cart/update", optionalAuth, forbidSeller, updateCartItem);
router.post("/cart/remove", optionalAuth, forbidSeller, removeCartItem);
router.post("/cart/clear", optionalAuth, forbidSeller, clearCart);



// =====================================================
// VOYAGE CHECKOUT & DEMO PAYMENT ROUTES (MILESTONE 5.2 & PHASE 6.3)
// =====================================================

import { requireBuyer } from "../middleware/roles.js";
import {
    renderCheckout,
    validateCheckout,
    processCheckout,
    renderPaymentPage,
    processPayment,
    renderBuyerOrders,
    renderBuyerOrderDetail
} from "../controller/orders.js";

router.get("/checkout", authMiddleware, requireBuyer, renderCheckout);
router.post("/checkout", authMiddleware, requireBuyer, validateCheckout);
router.post("/checkout/confirm", authMiddleware, requireBuyer, processCheckout);

// Demo Payment Routes (Phase 6.3 Section 28 & 29)
router.get("/orders/:orderId/payment", authMiddleware, requireBuyer, renderPaymentPage);
router.post("/orders/:orderId/pay", authMiddleware, requireBuyer, processPayment);

// Buyer Order History & Tracking (Milestone 5.4)
router.get("/orders", authMiddleware, requireBuyer, renderBuyerOrders);
router.get("/orders/:orderId", authMiddleware, requireBuyer, renderBuyerOrderDetail);


// =====================================================
// FAVORITES / WISHLIST ROUTES (PHASE 6.3 SECTION 25)
// =====================================================

router.get("/favorites", authMiddleware, requireBuyer, getFavorites);
router.post("/favorites/:productId/toggle", authMiddleware, requireBuyer, toggleFavorite);


// =====================================================
// BUYER PROFILE MANAGEMENT (PHASE 6.3 SECTION 33)
// =====================================================

router.get("/profile", authMiddleware, getBuyerProfile);
router.post("/profile", authMiddleware, uploadAvatarMiddleware, updateBuyerProfile);



// =====================================================

export default router;