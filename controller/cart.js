// =====================================================
// CARGO CART CONTROLLER (Milestone 3.5)
// Persistent Buyer Cart Integration with MongoDB
// =====================================================

import mongoose from "mongoose";
import Cart from "../models/cart.js";
import Product from "../models/product.js";
import User from "../models/user.js";

/**
 * Format a populated Cart document into a clean, safe JSON response.
 * Authoritative prices and names come strictly from populated Product records.
 * Sensitive user credentials are NEVER exposed.
 */
export const formatCartResponse = (cartDoc) => {
    if (!cartDoc) {
        return {
            id: null,
            items: [],
            totalDoubloons: 0,
            cartTotal: 0,
            itemCount: 0
        };
    }

    const items = [];
    let totalDoubloons = 0;
    let itemCount = 0;

    const rawItems = cartDoc.items || [];
    for (const item of rawItems) {
        // Defensively skip deleted products or unavailable products
        if (!item || !item.product) continue;

        const product = item.product;
        // If product was populated
        const isPopulated = product && typeof product === "object" && product.name !== undefined;
        if (!isPopulated) continue;

        // Skip unavailable products defensively
        if (product.isAvailable === false) continue;

        const unitPrice = typeof product.price === "number" ? product.price : 0;
        const qty = Number(item.quantity) || 1;
        const lineTotal = unitPrice * qty;

        totalDoubloons += lineTotal;
        itemCount += qty;

        const currentStock = typeof product.stock === "number" ? product.stock : 10;
        const isOutOfStock = currentStock <= 0;
        const exceedsStock = qty > currentStock;

        items.push({
            id: product._id ? product._id.toString() : product.toString(),
            product: product._id ? product._id.toString() : product.toString(),
            productId: product._id ? product._id.toString() : product.toString(),
            name: product.name,
            slug: product.slug,
            price: unitPrice,
            image: product.image || "/images/items/default-relic.png",
            rating: product.rating || "★★★★★",
            island: product.island,
            category: product.category,
            stock: currentStock,
            isOutOfStock,
            exceedsStock,
            quantity: qty,
            qty: qty,
            lineTotal: lineTotal
        });
    }

    return {
        id: cartDoc._id ? cartDoc._id.toString() : null,
        items,
        totalDoubloons,
        cartTotal: totalDoubloons,
        itemCount
    };
};

/**
 * Helper: Resolve current active cart for request (authenticated user or guest session).
 */
const resolveRequestCart = async (req) => {
    if (req.user && req.user._id) {
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
            await cart.save();
        }
        await cart.populate({
            path: "items.product",
            select: "name slug price image rating island category stock isAvailable"
        });
        return { isAuth: true, cart };
    }

    // Guest / Session cart
    const sessionItems = req.session && req.session.cart ? req.session.cart : [];
    // Populate session items
    const populatedSessionItems = [];
    for (const sItem of sessionItems) {
        const prodId = sItem.product || sItem.productId || sItem.id;
        if (!prodId || !mongoose.isValidObjectId(prodId)) continue;

        const product = await Product.findOne({ _id: prodId, isAvailable: true })
            .select("name slug price image rating island category stock isAvailable")
            .lean();

        if (product) {
            populatedSessionItems.push({
                product,
                quantity: Number(sItem.quantity || sItem.qty || 1)
            });
        }
    }

    return {
        isAuth: false,
        cart: {
            _id: null,
            items: populatedSessionItems
        }
    };
};

/**
 * GET /cart
 * View Cargo Cart Manifest / Fetch Cart JSON
 */
export const getCart = async (req, res) => {
    try {
        if (req.user && req.user.role === "seller") {
            if (req.xhr || (req.headers.accept && req.headers.accept.includes("application/json"))) {
                return res.status(403).json({ success: false, error: "Access denied: merchants cannot maintain a buyer cargo hold." });
            }
            return res.status(403).send("Access denied: merchants cannot maintain a buyer cargo hold.");
        }

        const { isAuth, cart } = await resolveRequestCart(req);
        const formatted = formatCartResponse(cart);


        // Check if client expects JSON (AJAX / API)
        const isJsonReq = req.xhr ||
            (req.headers.accept && req.headers.accept.includes("application/json")) ||
            req.query.format === "json";

        if (isJsonReq) {
            return res.json({
                success: true,
                authenticated: isAuth,
                cart: formatted
            });
        }

        // Render themed Cargo Hold Manifest page for direct browser visits
        return res.render("cart", {
            page_title: "Cargo Hold Manifest | Pirate-Civ",
            cart: formatted,
            user: req.user || null
        });

    } catch (error) {
        console.error("Error in getCart:", error);
        if (req.xhr || req.headers.accept?.includes("application/json")) {
            return res.status(500).json({ success: false, error: "Internal server error reading cargo hold" });
        }
        return res.status(500).render("home", {
            page_title: "Archipelago Tempest | Error",
            user: req.user || null
        });
    }
};

/**
 * POST /cart/add
 * Add or increment item in Cargo Hold with real-time stock validation
 */
export const addToCart = async (req, res) => {
    try {
        if (req.user && req.user.role === "seller") {
            return res.status(403).json({
                success: false,
                error: "Access denied: merchants cannot maintain a buyer cargo hold."
            });
        }

        const rawProductId = req.body.productId || req.body.id;

        const rawQuantity = req.body.quantity !== undefined ? req.body.quantity : req.body.qty;

        // 1. Validate Product ID
        if (!rawProductId || !mongoose.isValidObjectId(rawProductId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid product identifier provided"
            });
        }

        // 2. Validate Quantity (must be positive integer)
        let qty = 1;
        if (rawQuantity !== undefined) {
            const num = Number(rawQuantity);
            if (!Number.isInteger(num) || num < 1) {
                return res.status(400).json({
                    success: false,
                    error: "Quantity must be a positive integer"
                });
            }
            qty = num;
        }

        // 3. Verify Product exists and is available
        const product = await Product.findById(rawProductId);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Product not found in archipelago catalog"
            });
        }

        if (product.isAvailable !== true) {
            return res.status(400).json({
                success: false,
                error: "Product is currently unavailable for trade"
            });
        }

        // Real-time stock validation: check if stock is exhausted
        const maxStock = typeof product.stock === "number" ? product.stock : 10;
        if (maxStock <= 0) {
            return res.status(400).json({
                success: false,
                error: `Cannot stow "${product.name}": vault reserve is exhausted (out of stock)`,
                availableStock: 0
            });
        }

        // 4. Persist to MongoDB Cart for authenticated users (User Isolation guaranteed)
        if (req.user && req.user._id) {
            let userCart = await Cart.findOne({ user: req.user._id });
            if (!userCart) {
                userCart = new Cart({ user: req.user._id, items: [] });
            }

            const existingItem = userCart.items.find(
                item => item.product && item.product.toString() === product._id.toString()
            );
            const currentInCart = existingItem ? existingItem.quantity : 0;

            if (currentInCart + qty > maxStock) {
                const remaining = Math.max(0, maxStock - currentInCart);
                return res.status(400).json({
                    success: false,
                    error: remaining > 0
                        ? `Cannot stow requested quantity: only ${remaining} additional unit(s) available in vault reserve (already stowed: ${currentInCart}, max: ${maxStock})`
                        : `Cannot stow additional units: maximum vault reserve limit (${maxStock}) already stowed in cargo hold`,
                    availableStock: maxStock,
                    currentInCart
                });
            }

            userCart.addItem(product._id, qty);
            await userCart.save();

            await userCart.populate({
                path: "items.product",
                select: "name slug price image rating island category stock isAvailable"
            });

            return res.json({
                success: true,
                message: `Stowed ${product.name} in cargo hold`,
                authenticated: true,
                cart: formatCartResponse(userCart)
            });
        }

        // 5. Guest session fallback with real-time stock verification
        req.session.cart = req.session.cart || [];
        const existingSessionItem = req.session.cart.find(
            item => (item.product || item.productId || item.id) === product._id.toString()
        );

        const rawSessionQty = existingSessionItem
            ? (existingSessionItem.quantity !== undefined ? existingSessionItem.quantity : existingSessionItem.qty)
            : 0;
        const currentSessionQty = Number.isInteger(Number(rawSessionQty)) && Number(rawSessionQty) > 0
            ? Number(rawSessionQty)
            : 0;

        if (currentSessionQty + qty > maxStock) {
            const remaining = Math.max(0, maxStock - currentSessionQty);
            return res.status(400).json({
                success: false,
                error: remaining > 0
                    ? `Cannot stow requested quantity: only ${remaining} additional unit(s) available in vault reserve (already stowed: ${currentSessionQty}, max: ${maxStock})`
                    : `Cannot stow additional units: maximum vault reserve limit (${maxStock}) already stowed in temporary cargo`,
                availableStock: maxStock,
                currentInCart: currentSessionQty
            });
        }

        if (existingSessionItem) {
            existingSessionItem.quantity = currentSessionQty + qty;
        } else {
            req.session.cart.push({
                product: product._id.toString(),
                productId: product._id.toString(),
                id: product._id.toString(),
                quantity: qty
            });
        }

        const { cart } = await resolveRequestCart(req);
        return res.json({
            success: true,
            message: `Stowed ${product.name} in temporary session cargo`,
            authenticated: false,
            cart: formatCartResponse(cart)
        });

    } catch (error) {
        console.error("Error in addToCart:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to stow item in cargo hold"
        });
    }
};

/**
 * POST /cart/update
 * Update item quantity in Cargo Hold with real-time stock validation
 */
export const updateCartItem = async (req, res) => {
    try {
        const rawProductId = req.body.productId || req.body.id;
        const action = req.body.action; // "increase" | "decrease"
        const delta = req.body.delta !== undefined ? parseInt(req.body.delta, 10) : null;
        const explicitQty = req.body.quantity !== undefined ? parseInt(req.body.quantity, 10) : null;

        if (!rawProductId || !mongoose.isValidObjectId(rawProductId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid product identifier provided"
            });
        }

        // Verify product in database to validate stock and availability
        const product = await Product.findById(rawProductId);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Product not found in archipelago catalog"
            });
        }

        const maxStock = typeof product.stock === "number" ? product.stock : 10;

        // Authenticated user
        if (req.user && req.user._id) {
            let userCart = await Cart.findOne({ user: req.user._id });
            if (!userCart) {
                return res.status(404).json({
                    success: false,
                    error: "Cart not found"
                });
            }

            const itemIndex = userCart.items.findIndex(item =>
                item.product && item.product.toString() === rawProductId.toString()
            );

            if (itemIndex === -1) {
                return res.status(404).json({
                    success: false,
                    error: "Item not present in cargo hold"
                });
            }

            let newQty = userCart.items[itemIndex].quantity;
            let isIncrease = false;
            if (action === "increase" || delta === 1) {
                newQty += 1;
                isIncrease = true;
            } else if (action === "decrease" || delta === -1) {
                newQty -= 1;
            } else if (explicitQty !== null) {
                if (explicitQty > newQty) isIncrease = true;
                newQty = explicitQty;
            }

            if (isIncrease && product.isAvailable !== true) {
                return res.status(400).json({
                    success: false,
                    error: "Product is currently unavailable for trade"
                });
            }

            if (newQty > maxStock) {
                return res.status(400).json({
                    success: false,
                    error: `Cannot increase quantity beyond available vault reserve stock (${maxStock} units available)`,
                    availableStock: maxStock,
                    currentQuantity: userCart.items[itemIndex].quantity
                });
            }

            if (newQty <= 0) {
                userCart.items.splice(itemIndex, 1);
            } else {
                userCart.items[itemIndex].quantity = newQty;
            }

            await userCart.save();
            await userCart.populate({
                path: "items.product",
                select: "name slug price image rating island category stock isAvailable"
            });

            return res.json({
                success: true,
                message: "Cargo hold quantity updated",
                cart: formatCartResponse(userCart)
            });
        }

        // Guest session update
        req.session.cart = req.session.cart || [];
        const sessionIndex = req.session.cart.findIndex(
            item => (item.product || item.productId || item.id) === rawProductId.toString()
        );

        if (sessionIndex === -1) {
            return res.status(404).json({
                success: false,
                error: "Item not present in temporary session cargo"
            });
        }

        const rawExistingSessionQty = req.session.cart[sessionIndex].quantity !== undefined
            ? req.session.cart[sessionIndex].quantity
            : req.session.cart[sessionIndex].qty;
        let sessionQty = Number.isInteger(Number(rawExistingSessionQty)) && Number(rawExistingSessionQty) > 0
            ? Number(rawExistingSessionQty)
            : 1;

        let isIncrease = false;
        if (action === "increase" || delta === 1) {
            sessionQty += 1;
            isIncrease = true;
        } else if (action === "decrease" || delta === -1) {
            sessionQty -= 1;
        } else if (explicitQty !== null) {
            if (explicitQty > sessionQty) isIncrease = true;
            sessionQty = explicitQty;
        }

        if (isIncrease && product.isAvailable !== true) {
            return res.status(400).json({
                success: false,
                error: "Product is currently unavailable for trade"
            });
        }

        if (sessionQty > maxStock) {
            return res.status(400).json({
                success: false,
                error: `Cannot increase quantity beyond available vault reserve stock (${maxStock} units available)`,
                availableStock: maxStock,
                currentQuantity: req.session.cart[sessionIndex].quantity
            });
        }

        if (sessionQty <= 0) {
            req.session.cart.splice(sessionIndex, 1);
        } else {
            req.session.cart[sessionIndex].quantity = sessionQty;
        }

        const { cart } = await resolveRequestCart(req);
        return res.json({
            success: true,
            message: "Temporary session cargo updated",
            cart: formatCartResponse(cart)
        });

    } catch (error) {
        console.error("Error in updateCartItem:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to update item quantity"
        });
    }
};

/**
 * POST /cart/remove
 * Remove an item completely or decrement from Cargo Hold
 */
export const removeCartItem = async (req, res) => {
    try {
        const rawProductId = req.body.productId || req.body.id;
        const qtyToRemove = req.body.quantity !== undefined ? parseInt(req.body.quantity, 10) : null;

        if (!rawProductId || !mongoose.isValidObjectId(rawProductId)) {
            return res.status(400).json({
                success: false,
                error: "Invalid product identifier provided"
            });
        }

        if (req.user && req.user._id) {
            let userCart = await Cart.findOne({ user: req.user._id });
            if (userCart) {
                userCart.removeItem(rawProductId, qtyToRemove);
                await userCart.save();

                await userCart.populate({
                    path: "items.product",
                    select: "name slug price image rating island category stock isAvailable"
                });

                return res.json({
                    success: true,
                    message: "Item discharged from cargo hold",
                    cart: formatCartResponse(userCart)
                });
            }
        }

        // Guest session
        req.session.cart = req.session.cart || [];
        const index = req.session.cart.findIndex(
            item => (item.product || item.productId || item.id) === rawProductId.toString()
        );

        if (index !== -1) {
            if (qtyToRemove && Number.isInteger(qtyToRemove) && qtyToRemove > 0) {
                req.session.cart[index].quantity -= qtyToRemove;
                if (req.session.cart[index].quantity <= 0) {
                    req.session.cart.splice(index, 1);
                }
            } else {
                req.session.cart.splice(index, 1);
            }
        }

        const { cart } = await resolveRequestCart(req);
        return res.json({
            success: true,
            message: "Item discharged from session cargo",
            cart: formatCartResponse(cart)
        });

    } catch (error) {
        console.error("Error in removeCartItem:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to remove item from cargo hold"
        });
    }
};

/**
 * POST /cart/clear
 * Clear all items from Cargo Hold
 */
export const clearCart = async (req, res) => {
    try {
        if (req.user && req.user._id) {
            const userCart = await Cart.findOne({ user: req.user._id });
            if (userCart) {
                userCart.items = [];
                await userCart.save();
            }
        }

        if (req.session) {
            req.session.cart = [];
        }

        return res.json({
            success: true,
            message: "Cargo hold cleared",
            cart: {
                id: null,
                items: [],
                totalDoubloons: 0,
                cartTotal: 0,
                itemCount: 0
            }
        });
    } catch (error) {
        console.error("Error in clearCart:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to clear cargo hold"
        });
    }
};

export default {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    formatCartResponse
};
