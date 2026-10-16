// =====================================================
// ORDERS & CHECKOUT CONTROLLER (Milestone 5.2 & 5.3)
// Checkout Flow, Order Generation, and State Machine
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
 * Validates delivery coordinates and re-verifies inventory bounds.
 * If req.body.action === 'confirm' or req.query.action === 'confirm', delegates to order creation.
 */
export const validateCheckout = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.redirect("/login");
        }

        // If confirmation requested, delegate directly to order creation
        if (req.body.action === "confirm" || req.query.action === "confirm") {
            return processCheckout(req, res);
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

        // 5. Validation clearance (Milestone 5.2 mode)
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

/**
 * POST /checkout/confirm (or POST /checkout with action: confirm)
 * Milestone 5.3 — Demo-Compatible Order Generation
 *
 * Ordered execution flow:
 * STEP A: Final Validation (cart, products, availability, stock, coordinates) -> 0 writes if invalid
 * STEP B: Create Order with status 'pending' and historical item snapshots
 * STEP C: Reduce stock with conditional atomic updates
 * STEP D: Clear buyer's persistent Cart
 *
 * NOTE: The local demo deployment is a standalone MongoDB instance without multi-document
 * ACID transactions. This is a deliberate demo design. Production upgrades should configure
 * a replica set for true transactional atomicity.
 */
export const processCheckout = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.redirect("/login");
        }

        const { portName, islandCoordinates, recipientNotes } = req.body;

        // Safe submitted values for retention if error occurs
        const submittedDelivery = {
            portName: typeof portName === "string" ? portName.trim() : "",
            islandCoordinates: typeof islandCoordinates === "string" && islandCoordinates.trim() ? islandCoordinates.trim() : "18°42'N, 64°31'W",
            recipientNotes: typeof recipientNotes === "string" ? recipientNotes.trim() : ""
        };

        const renderFailure = (errorMessage, statusCode = 400, manifest = null) => {
            if (req.xhr || req.headers.accept?.includes("application/json") || req.query.format === "json") {
                return res.status(statusCode).json({
                    success: false,
                    error: errorMessage,
                    delivery: submittedDelivery
                });
            }
            return res.status(statusCode).render("checkout", {
                page_title: "Voyage Checkout | Pirate-Civ",
                cart: manifest ? { isEmpty: false, ...manifest } : { isEmpty: true, items: [], itemCount: 0, subtotal: 0, portFee: 0, totalDoubloons: 0 },
                delivery: submittedDelivery,
                error: errorMessage,
                successBanner: null,
                user: req.user
            });
        };

        // -------------------------------------------------------------
        // STEP A: FINAL SERVER-SIDE VALIDATION (ZERO WRITES BEFORE THIS PASSES)
        // -------------------------------------------------------------

        // 1. Validate shipping address fields
        if (!submittedDelivery.portName || submittedDelivery.portName.length < 2 || submittedDelivery.portName.length > 120) {
            return renderFailure("Delivery port anchorage name is required (2 to 120 characters).");
        }

        if (submittedDelivery.islandCoordinates.length > 120) {
            return renderFailure("Island coordinates cannot exceed 120 characters.");
        }

        if (submittedDelivery.recipientNotes.length > 500) {
            return renderFailure("Harbor delivery notes cannot exceed 500 characters.");
        }

        // 2. Load authenticated buyer's persistent Cart from MongoDB
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart || !cart.items || cart.items.length === 0) {
            return renderFailure("Cannot place order: cargo hold is empty.");
        }

        // 3. Re-read every product in cart and validate live stock & availability
        const orderItems = [];
        let subtotal = 0;

        for (const item of cart.items) {
            if (!item || !item.product) continue;

            const prodId = item.product._id || item.product;
            if (!prodId || !mongoose.isValidObjectId(prodId)) {
                return renderFailure("Invalid product reference found in cargo hold.");
            }

            const product = await Product.findById(prodId);
            if (!product) {
                return renderFailure("A cargo item in your hold no longer exists in the archipelago catalog.");
            }

            if (product.isAvailable === false) {
                return renderFailure(`Cannot checkout: "${product.name}" is currently unavailable for trade.`);
            }

            const qty = Number(item.quantity);
            if (!Number.isInteger(qty) || qty < 1) {
                return renderFailure(`Invalid quantity specified for "${product.name}".`);
            }

            const currentStock = typeof product.stock === "number" ? product.stock : 0;
            if (currentStock <= 0) {
                return renderFailure(`Cannot checkout: "${product.name}" vault reserve is exhausted (out of stock).`);
            }

            if (qty > currentStock) {
                return renderFailure(`Cannot checkout: "${product.name}" requested quantity (${qty}) exceeds available vault reserve (${currentStock}).`);
            }

            const unitPrice = typeof product.price === "number" ? product.price : 0;
            const lineTotal = unitPrice * qty;
            subtotal += lineTotal;

            // Build immutable historical item snapshot
            orderItems.push({
                product: product._id,
                seller: product.seller,
                name: product.name,
                price: unitPrice,
                quantity: qty,
                lineTotal: lineTotal,
                image: product.image || "/images/items/default-relic.png"
            });
        }

        if (orderItems.length === 0) {
            return renderFailure("Cannot place order: no valid wares in cargo hold.");
        }

        // -------------------------------------------------------------
        // STEP B: CREATE ORDER DOCUMENT (INITIAL STATUS: 'pending')
        // -------------------------------------------------------------
        const portFee = 0; // Trade Port Fee: 0 Doubloons (Exempt)
        const totalDoubloons = subtotal + portFee;

        const newOrder = new Order({
            buyer: req.user._id, // Authoritative authenticated buyer ID
            items: orderItems,
            subtotal: subtotal,
            totalDoubloons: totalDoubloons,
            status: "pending",
            paymentStatus: "pending",
            shippingAddress: {
                portName: submittedDelivery.portName,
                islandCoordinates: submittedDelivery.islandCoordinates,
                recipientNotes: submittedDelivery.recipientNotes
            }
        });

        await newOrder.save();

        // -------------------------------------------------------------
        // STEP C: REDUCE PRODUCT STOCK (CONDITIONAL ATOMIC PER-DOCUMENT UPDATES)
        // -------------------------------------------------------------
        for (const item of orderItems) {
            const updateResult = await Product.updateOne(
                {
                    _id: item.product,
                    stock: { $gte: item.quantity },
                    isAvailable: true
                },
                {
                    $inc: { stock: -item.quantity }
                }
            );

            if (updateResult.modifiedCount !== 1) {
                console.warn(`[DEMO WARNING] Product stock conditional update missed for ${item.product}. Note: Standalone MongoDB demo lacks multi-document ACID transactions.`);
            }
        }

        // -------------------------------------------------------------
        // STEP D: CLEAR BUYER'S PERSISTENT CART
        // -------------------------------------------------------------
        cart.items = [];
        await cart.save();

        // -------------------------------------------------------------
        // STEP E: SUCCESS RESPONSE / REDIRECT
        // -------------------------------------------------------------
        if (req.xhr || req.headers.accept?.includes("application/json") || req.query.format === "json") {
            return res.status(201).json({
                success: true,
                orderId: newOrder._id.toString(),
                order: {
                    id: newOrder._id.toString(),
                    status: newOrder.status,
                    paymentStatus: newOrder.paymentStatus,
                    totalDoubloons: newOrder.totalDoubloons,
                    subtotal: newOrder.subtotal,
                    itemsCount: newOrder.items.length,
                    items: newOrder.items,
                    shippingAddress: newOrder.shippingAddress,
                    createdAt: newOrder.createdAt
                },
                message: "Voyage manifest signed! Order placed successfully."
            });
        }

        return res.redirect(`/orders/${newOrder._id}?placed=1`);

    } catch (error) {
        console.error("Error in processCheckout:", error);
        if (req.xhr || req.headers.accept?.includes("application/json")) {
            return res.status(500).json({ success: false, error: "Internal server error generating order" });
        }
        return res.status(500).render("home", {
            page_title: "Archipelago Tempest | Error",
            user: req.user || null
        });
    }
};

/**
 * GET /orders/:orderId
 * Renders or returns the confirmed Voyage Manifest for the authenticated buyer.
 */
export const renderBuyerOrderDetail = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.redirect("/login");
        }

        const { orderId } = req.params;

        if (!orderId || !mongoose.isValidObjectId(orderId)) {
            if (req.xhr || req.headers.accept?.includes("application/json")) {
                return res.status(404).json({ success: false, error: "Invalid order identifier provided." });
            }
            return res.status(404).render("home", {
                page_title: "Order Not Found | Pirate-Civ",
                user: req.user
            });
        }

        // Scoped strictly to the authenticated buyer (User Isolation)
        const order = await Order.findOne({
            _id: orderId,
            buyer: req.user._id
        }).populate("items.seller", "name storeName homeIsland");

        if (!order) {
            if (req.xhr || req.headers.accept?.includes("application/json")) {
                return res.status(404).json({ success: false, error: "Order not found or access denied." });
            }
            return res.status(404).render("home", {
                page_title: "Order Not Found | Pirate-Civ",
                user: req.user
            });
        }

        if (req.xhr || req.headers.accept?.includes("application/json") || req.query.format === "json") {
            return res.json({
                success: true,
                order
            });
        }

        return res.render("order-confirmation", {
            page_title: `Voyage Manifest #${order._id} | Pirate-Civ`,
            order,
            user: req.user
        });

    } catch (error) {
        console.error("Error in renderBuyerOrderDetail:", error);
        if (req.xhr || req.headers.accept?.includes("application/json")) {
            return res.status(500).json({ success: false, error: "Internal server error fetching order manifest" });
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
    processCheckout,
    renderBuyerOrderDetail,
    evaluateCheckoutManifest
};
