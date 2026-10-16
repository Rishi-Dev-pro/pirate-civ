// =====================================================
// ORDERS & CHECKOUT CONTROLLER (Milestone 5.2)
// Checkout Flow, Delivery Coordinates, and Stock Revalidation
// =====================================================

import mongoose from "mongoose";
import Cart from "../models/cart.js";
import Product from "../models/product.js";
import Order from "../models/order.js";

/**
 * Re-reads current Product records from MongoDB for all cart items,
 * validates availability and stock, and calculates server-authoritative totals.
 *
 * @param {Array} rawCartItems - Items array from Cart document
 * @returns {Promise<Object>} Evaluated breakdown object with items and validation flags
 */
export const evaluateCheckoutManifest = async (rawCartItems = []) => {
    const items = [];
    let subtotal = 0;
    let itemCount = 0;
    let hasStockIssue = false;
    let stockErrorMessage = null;

    for (const item of rawCartItems) {
        if (!item || !item.product) continue;

        const prodId = item.product._id || item.product;
        if (!prodId || !mongoose.isValidObjectId(prodId)) continue;

        const product = await Product.findById(prodId);
        const qty = Number(item.quantity) || 1;

        if (!product) {
            hasStockIssue = true;
            stockErrorMessage = "A product in your hold no longer exists in the archipelago catalog.";
            continue;
        }

        if (product.isAvailable === false) {
            hasStockIssue = true;
            stockErrorMessage = `Cannot checkout: "${product.name}" is currently unavailable for trade.`;
        }

        const currentStock = typeof product.stock === "number" ? product.stock : 0;
        if (currentStock <= 0) {
            hasStockIssue = true;
            stockErrorMessage = `Cannot checkout: "${product.name}" vault reserve is exhausted (out of stock).`;
        } else if (qty > currentStock) {
            hasStockIssue = true;
            stockErrorMessage = `Cannot checkout: "${product.name}" requested quantity (${qty}) exceeds available vault reserve (${currentStock}).`;
        }

        const unitPrice = typeof product.price === "number" ? product.price : 0;
        const lineTotal = unitPrice * qty;

        subtotal += lineTotal;
        itemCount += qty;

        items.push({
            id: product._id.toString(),
            productId: product._id.toString(),
            name: product.name,
            slug: product.slug,
            image: product.image || "/images/items/default-relic.png",
            island: product.island || "Archipelago",
            category: product.category,
            seller: product.seller,
            price: unitPrice,
            quantity: qty,
            lineTotal,
            stock: currentStock,
            isAvailable: product.isAvailable,
            isExhausted: currentStock <= 0,
            exceedsStock: qty > currentStock
        });
    }

    // Port delivery fee is exempt according to established project rules
    const portFee = 0;
    const totalDoubloons = subtotal + portFee;

    return {
        items,
        itemCount,
        subtotal,
        portFee,
        totalDoubloons,
        hasStockIssue,
        stockErrorMessage
    };
};

/**
 * GET /checkout
 * Renders the Voyage Checkout / Final Cargo Manifest view for authenticated buyers.
 */
export const renderCheckout = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.redirect("/login");
        }

        // 1. Load authenticated buyer's persistent Cart exclusively from MongoDB
        const cart = await Cart.findOne({ user: req.user._id });

        if (!cart || !cart.items || cart.items.length === 0) {
            const emptyPayload = {
                isEmpty: true,
                items: [],
                itemCount: 0,
                subtotal: 0,
                portFee: 0,
                totalDoubloons: 0
            };

            if (req.xhr || req.headers.accept?.includes("application/json") || req.query.format === "json") {
                return res.json({
                    success: true,
                    cart: emptyPayload,
                    message: "Cargo hold is empty"
                });
            }

            return res.render("checkout", {
                page_title: "Voyage Checkout | Pirate-Civ",
                cart: emptyPayload,
                delivery: {
                    portName: "",
                    islandCoordinates: "18°42'N, 64°31'W",
                    recipientNotes: ""
                },
                error: null,
                successBanner: null,
                user: req.user
            });
        }

        // 2. Re-read current Product records and calculate authoritative breakdown
        const manifest = await evaluateCheckoutManifest(cart.items);

        // Prepopulate shipping coordinates with canonical default
        const defaultPort = req.user.homeIsland
            ? `${req.user.homeIsland.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())} Anchorage`
            : "";

        const deliveryData = {
            portName: defaultPort,
            islandCoordinates: "18°42'N, 64°31'W",
            recipientNotes: ""
        };

        if (req.xhr || req.headers.accept?.includes("application/json") || req.query.format === "json") {
            return res.json({
                success: true,
                cart: {
                    isEmpty: false,
                    ...manifest
                },
                delivery: deliveryData,
                user: {
                    id: req.user._id,
                    name: req.user.name,
                    role: req.user.role
                }
            });
        }

        return res.render("checkout", {
            page_title: "Voyage Checkout | Pirate-Civ",
            cart: {
                isEmpty: false,
                ...manifest
            },
            delivery: deliveryData,
            error: manifest.hasStockIssue ? manifest.stockErrorMessage : null,
            successBanner: null,
            user: req.user
        });

    } catch (error) {
        console.error("Error in renderCheckout:", error);
        if (req.xhr || req.headers.accept?.includes("application/json")) {
            return res.status(500).json({ success: false, error: "Internal server error reading cargo checkout" });
        }
        return res.status(500).render("home", {
            page_title: "Archipelago Tempest | Error",
            user: req.user || null
        });
    }
};

/**
 * POST /checkout
 * Validates delivery coordinates and re-verifies inventory bounds without prematurely creating Orders.
 * Phase 5.2 Order Boundary: Stock mutation and Order document generation belong strictly to Milestone 5.3.
 */
export const validateCheckout = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.redirect("/login");
        }

        const { portName, islandCoordinates, recipientNotes } = req.body;

        // 1. Load authenticated buyer's Cart
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart || !cart.items || cart.items.length === 0) {
            const errMsg = "Cannot proceed to checkout with an empty cargo hold.";
            if (req.xhr || req.headers.accept?.includes("application/json")) {
                return res.status(400).json({ success: false, error: errMsg });
            }
            return res.status(400).render("checkout", {
                page_title: "Voyage Checkout | Pirate-Civ",
                cart: { isEmpty: true, items: [], itemCount: 0, subtotal: 0, portFee: 0, totalDoubloons: 0 },
                delivery: { portName: "", islandCoordinates: "18°42'N, 64°31'W", recipientNotes: "" },
                error: errMsg,
                successBanner: null,
                user: req.user
            });
        }

        // 2. Re-read current Product records from MongoDB for stock and availability
        const manifest = await evaluateCheckoutManifest(cart.items);

        // Safe submitted values for form retention
        const submittedDelivery = {
            portName: typeof portName === "string" ? portName.trim() : "",
            islandCoordinates: typeof islandCoordinates === "string" && islandCoordinates.trim() ? islandCoordinates.trim() : "18°42'N, 64°31'W",
            recipientNotes: typeof recipientNotes === "string" ? recipientNotes.trim() : ""
        };

        const renderError = (errorMessage) => {
            if (req.xhr || req.headers.accept?.includes("application/json")) {
                return res.status(400).json({
                    success: false,
                    error: errorMessage,
                    delivery: submittedDelivery
                });
            }
            return res.status(400).render("checkout", {
                page_title: "Voyage Checkout | Pirate-Civ",
                cart: {
                    isEmpty: false,
                    ...manifest
                },
                delivery: submittedDelivery,
                error: errorMessage,
                successBanner: null,
                user: req.user
            });
        };

        // 3. Server-side validation of delivery coordinates
        if (!submittedDelivery.portName || submittedDelivery.portName.length < 2 || submittedDelivery.portName.length > 120) {
            return renderError("Delivery port anchorage name is required (2 to 120 characters).");
        }

        if (submittedDelivery.islandCoordinates.length > 120) {
            return renderError("Island coordinates cannot exceed 120 characters.");
        }

        if (submittedDelivery.recipientNotes.length > 500) {
            return renderError("Harbor delivery notes cannot exceed 500 characters.");
        }

        // 4. Server-side real-time stock check
        if (manifest.hasStockIssue) {
            return renderError(manifest.stockErrorMessage);
        }

        // 5. Phase 5.2 Order Boundary Enforcement:
        // Do NOT create an Order document in MongoDB.
        // Do NOT decrement Product.stock.
        // Do NOT clear Cart.
        // Verification success prepares the buyer for Milestone 5.3 Order Generation.
        const successMessage = "Cargo manifest and delivery coordinates verified for voyage. Ready for Order Generation (Milestone 5.3).";

        if (req.xhr || req.headers.accept?.includes("application/json")) {
            return res.json({
                success: true,
                validated: true,
                readyForOrder: true,
                message: successMessage,
                breakdown: {
                    itemCount: manifest.itemCount,
                    subtotal: manifest.subtotal,
                    portFee: manifest.portFee,
                    totalDoubloons: manifest.totalDoubloons
                },
                shippingAddress: {
                    portName: submittedDelivery.portName,
                    islandCoordinates: submittedDelivery.islandCoordinates,
                    recipientNotes: submittedDelivery.recipientNotes
                }
            });
        }

        return res.render("checkout", {
            page_title: "Voyage Checkout | Pirate-Civ",
            cart: {
                isEmpty: false,
                ...manifest
            },
            delivery: submittedDelivery,
            error: null,
            successBanner: successMessage,
            user: req.user
        });

    } catch (error) {
        console.error("Error in validateCheckout:", error);
        if (req.xhr || req.headers.accept?.includes("application/json")) {
            return res.status(500).json({ success: false, error: "Internal server error during checkout validation" });
        }
        return res.status(500).render("home", {
            page_title: "Archipelago Tempest | Error",
            user: req.user || null
        });
    }
};

export default {
    renderCheckout,
    validateCheckout,
    evaluateCheckoutManifest
};
