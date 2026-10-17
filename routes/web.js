import express from "express";

import { saveContactDetails } from "../controller/contact.js";

import {
    registerUser,
    loginUser,
    logoutUser
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
// LOGIN PAGE
// =====================================================

router.get("/login", optionalAuth, (req, res) => {
    if (req.user) {
        if (req.user.role === "seller") return res.redirect("/seller/dashboard");
        return res.redirect("/home");
    }

    const intent = (req.query.intent || req.session?.authIntent || "buyer").toLowerCase().trim();
    if (req.session) req.session.authIntent = intent;

    res.render("login", {
        page_title: "Login",
        error: req.query.error || null,
        email: "",
        intent: intent
    });
});


// =====================================================
// REGISTER PAGE
// =====================================================

router.get("/register", optionalAuth, (req, res) => {
    if (req.user) {
        if (req.user.role === "seller") return res.redirect("/seller/dashboard");
        return res.redirect("/home");
    }

    const intent = (req.query.intent || req.session?.authIntent || "buyer").toLowerCase().trim();
    if (req.session) req.session.authIntent = intent;

    res.render("register", {
        page_title: "Register",
        error: req.query.error || null,
        name: "",
        email: "",
        intent: intent
    });
});


// =====================================================
// GOOGLE OAUTH ROUTES
// =====================================================

router.get("/auth/google", initiateGoogleAuth);
router.get("/auth/google/callback", handleGoogleCallback);


// =====================================================
// REGISTER POST
// =====================================================

router.post(
    "/register",
    registerUser
);


// =====================================================
// LOGIN POST
// =====================================================

router.post(
    "/login",
    loginUser
);


// =====================================================
// LOGOUT
// =====================================================

router.get(
    "/logout",
    logoutUser
);


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