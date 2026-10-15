/* =========================================================
   PIRATE CARTOGRAPHIC ISLAND STORE JAVASCRIPT ENGINE
   Unified Functionality for All 6 Islands & Cargo Hold:
   - Live Category Filtering
   - Live Search Filtering
   - Dynamic Sorting
   - Wishlist Toggle
   - Interactive Persistent Cargo Hold (Milestone 3.5)
   - Synchronized Drawer and Manifest Page Updates
========================================================= */

(function () {
    "use strict";

    // Application State
    const storeState = {
        activeCategory: "all",
        searchQuery: "",
        sortBy: "default",
        cart: [],
        wishlist: [],
        totalDoubloons: 0,
        itemCount: 0
    };

    // Load wishlist from localStorage
    function loadWishlist() {
        try {
            storeState.wishlist = JSON.parse(localStorage.getItem("pirate_wishlist") || "[]");
        } catch (e) {
            storeState.wishlist = [];
        }
        applyWishlistState();
    }

    function saveWishlist() {
        try {
            localStorage.setItem("pirate_wishlist", JSON.stringify(storeState.wishlist));
        } catch (e) {}
    }

    // Apply Wishlist Active States
    function applyWishlistState() {
        document.querySelectorAll(".btn-wishlist").forEach(btn => {
            const itemId = btn.getAttribute("data-id");
            if (storeState.wishlist.includes(itemId)) {
                btn.classList.add("active");
                btn.innerHTML = "❤️";
            } else {
                btn.classList.remove("active");
                btn.innerHTML = "♡";
            }
        });
    }

    // Toast Notification System
    function showToast(message) {
        let toast = document.getElementById("storeToast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "storeToast";
            toast.className = "store-toast";
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add("show");
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2800);
    }

    // Update Cart Badge Count
    function updateCartBadge(count) {
        const totalCount = count !== undefined ? count : storeState.itemCount;
        const cartBadgeEl = document.getElementById("cartCountBadge");
        if (cartBadgeEl) {
            cartBadgeEl.textContent = `(${totalCount})`;
        }
    }

    // Sync state with server-provided cart object
    function syncCartData(cartData) {
        if (!cartData) return;
        storeState.cart = cartData.items || [];
        storeState.totalDoubloons = cartData.totalDoubloons || cartData.cartTotal || 0;
        storeState.itemCount = cartData.itemCount || storeState.cart.reduce((sum, it) => sum + (it.quantity || it.qty || 1), 0);

        updateCartBadge(storeState.itemCount);
        renderCartDrawer();
        renderManifestPage();
    }

    // Fetch live persistent cart from MongoDB / Express session
    async function fetchCartFromServer() {
        try {
            const res = await fetch("/cart", {
                headers: { "Accept": "application/json" }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.cart) {
                    syncCartData(data.cart);
                }
            }
        } catch (err) {
            console.warn("Failed to fetch cart from server:", err);
        }
    }

    // Post: Add item to Cargo Hold
    async function addToCargoHold(productId, name) {
        try {
            const res = await fetch("/cart/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ productId, quantity: 1 })
            });

            const data = await res.json();
            if (data.success && data.cart) {
                syncCartData(data.cart);
                showToast(`⚓ "${name}" stowed in Cargo Hold!`);
            } else {
                showToast(`⚠️ ${data.error || "Could not stow item."}`);
            }
        } catch (err) {
            console.error("Error adding to cart:", err);
            showToast("⚠️ Network tempest encountered while stowing cargo.");
        }
    }

    // Post: Update item quantity
    async function updateCargoQuantity(productId, action) {
        try {
            const res = await fetch("/cart/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ productId, action })
            });

            const data = await res.json();
            if (data.success && data.cart) {
                syncCartData(data.cart);
            } else {
                showToast(`⚠️ ${data.error || "Could not update cargo quantity."}`);
            }
        } catch (err) {
            console.error("Error updating cart quantity:", err);
            showToast("⚠️ Network tempest encountered.");
        }
    }

    // Post: Remove item from Cargo Hold
    async function removeCargoItem(productId, name) {
        try {
            const res = await fetch("/cart/remove", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ productId })
            });

            const data = await res.json();
            if (data.success && data.cart) {
                syncCartData(data.cart);
                showToast(name ? `Discharged "${name}" from cargo.` : "Item discharged from cargo.");
            } else {
                showToast(`⚠️ ${data.error || "Could not discharge item."}`);
            }
        } catch (err) {
            console.error("Error removing cart item:", err);
            showToast("⚠️ Network tempest encountered.");
        }
    }

    // Post: Clear entire Cargo Hold
    async function clearCargoHold() {
        try {
            const res = await fetch("/cart/clear", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            });

            const data = await res.json();
            if (data.success && data.cart) {
                syncCartData(data.cart);
                showToast("⚓ All cargo jettisoned from hold.");
            }
        } catch (err) {
            console.error("Error clearing cart:", err);
            showToast("⚠️ Network tempest encountered.");
        }
    }

    // Render Cart Drawer
    function renderCartDrawer() {
        const drawerItems = document.getElementById("cartDrawerItems");
        const drawerTotal = document.getElementById("cartDrawerTotal");
        if (!drawerItems || !drawerTotal) return;

        drawerItems.innerHTML = "";

        if (storeState.cart.length === 0) {
            drawerItems.innerHTML = `<div class="cart-empty-msg">⚓ Your cargo hold is currently empty.</div>`;
            drawerTotal.textContent = "🪙 0 Doubloons";
            return;
        }

        storeState.cart.forEach(item => {
            const prodId = item.id || item.productId;
            const unitPrice = item.price || 0;
            const qty = item.quantity || item.qty || 1;
            const lineTotal = item.lineTotal || (unitPrice * qty);

            const row = document.createElement("div");
            row.className = "cart-item-row";
            row.innerHTML = `
                <img src="${item.image || '/images/items/default-relic.png'}" alt="${item.name}" class="cart-item-thumb" onerror="this.onerror=null; this.src='/images/items/default-relic.png';">
                <div class="cart-item-details">
                    <a href="/product/${prodId}" class="cart-item-name" title="${item.name}">${item.name}</a>
                    <div class="cart-item-meta">
                        <span>🪙 ${unitPrice.toLocaleString()}</span>
                        <div class="cart-item-qty-controls">
                            <button type="button" class="btn-qty-adjust btn-qty-minus" data-id="${prodId}" title="Decrease">-</button>
                            <span class="cart-qty-text">${qty}</span>
                            <button type="button" class="btn-qty-adjust btn-qty-plus" data-id="${prodId}" title="Increase">+</button>
                        </div>
                    </div>
                </div>
                <div class="cart-item-subtotal">🪙 ${lineTotal.toLocaleString()}</div>
                <button type="button" class="btn-remove-item" data-id="${prodId}" data-name="${item.name}" title="Discharge Item">&times;</button>
            `;

            // Wire Quantity Plus
            row.querySelector(".btn-qty-plus").addEventListener("click", () => {
                updateCargoQuantity(prodId, "increase");
            });

            // Wire Quantity Minus
            row.querySelector(".btn-qty-minus").addEventListener("click", () => {
                updateCargoQuantity(prodId, "decrease");
            });

            // Wire Remove Button
            row.querySelector(".btn-remove-item").addEventListener("click", () => {
                removeCargoItem(prodId, item.name);
            });

            drawerItems.appendChild(row);
        });

        drawerTotal.textContent = `🪙 ${storeState.totalDoubloons.toLocaleString()} Doubloons`;
    }

    // Render Standalone Manifest Page (if active)
    function renderManifestPage() {
        const manifestContainer = document.getElementById("cartManifestContent");
        if (!manifestContainer) return;

        const pageTotalBadge = document.getElementById("pageTotalBadge");
        if (pageTotalBadge) {
            pageTotalBadge.textContent = `${storeState.totalDoubloons.toLocaleString()} Doubloons`;
        }

        if (storeState.cart.length === 0) {
            manifestContainer.innerHTML = `
                <div class="cart-empty-state">
                    <div class="cart-empty-icon">⚓</div>
                    <h2 class="cart-empty-title">Your Cargo Hold is Empty, Captain</h2>
                    <p class="cart-empty-desc">
                        No trade crates, spices, weapons, or enchanted relics are currently stowed aboard.
                        Plot a course across the six trading islands to stow plunder into your hold.
                    </p>
                    <div class="cart-empty-actions">
                        <a href="/home#sea-chart-section" class="btn-manifest-cta">
                            🗺️ Chart Course to Islands
                        </a>
                    </div>
                </div>
            `;
            return;
        }

        // Generate Rows
        let tableRowsHtml = "";
        storeState.cart.forEach(item => {
            const prodId = item.id || item.productId;
            const unitPrice = item.price || 0;
            const qty = item.quantity || item.qty || 1;
            const lineTotal = item.lineTotal || (unitPrice * qty);

            tableRowsHtml += `
                <tr class="cart-table-row" data-product-id="${prodId}">
                    <td class="col-item">
                        <div class="manifest-item-info">
                            <img src="${item.image || '/images/items/default-relic.png'}" alt="${item.name}" class="manifest-item-thumb" onerror="this.onerror=null; this.src='/images/items/default-relic.png';">
                            <div>
                                <a href="/product/${prodId}" class="manifest-item-name">${item.name}</a>
                                <span class="manifest-item-island">Island: ${item.island || 'Archipelago'}</span>
                            </div>
                        </div>
                    </td>
                    <td class="col-price">
                        <span class="price-val">🪙 ${unitPrice.toLocaleString()}</span>
                    </td>
                    <td class="col-qty">
                        <div class="cart-qty-ctrls">
                            <button type="button" class="btn-qty-ctrl btn-qty-minus" data-id="${prodId}" title="Decrease Quantity">-</button>
                            <span class="qty-display">${qty}</span>
                            <button type="button" class="btn-qty-ctrl btn-qty-plus" data-id="${prodId}" title="Increase Quantity">+</button>
                        </div>
                    </td>
                    <td class="col-total">
                        <span class="total-val">🪙 ${lineTotal.toLocaleString()}</span>
                    </td>
                    <td class="col-action">
                        <button type="button" class="btn-item-remove-direct" data-id="${prodId}" data-name="${item.name}" title="Discharge Item">&times;</button>
                    </td>
                </tr>
            `;
        });

        manifestContainer.innerHTML = `
            <div class="cart-manifest-layout">
                <div class="cart-table-wrapper">
                    <table class="cart-manifest-table">
                        <thead>
                            <tr>
                                <th class="col-item">Cargo Item</th>
                                <th class="col-price">Unit Value</th>
                                <th class="col-qty">Quantity</th>
                                <th class="col-total">Line Total</th>
                                <th class="col-action">Discharge</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRowsHtml}
                        </tbody>
                    </table>
                </div>

                <aside class="cart-summary-card">
                    <h2 class="summary-card-title">Hold Summary</h2>
                    <div class="summary-line">
                        <span>Stowed Crates:</span>
                        <span id="summaryItemCount">${storeState.itemCount} items</span>
                    </div>
                    <div class="summary-line">
                        <span>Trade Port Fee:</span>
                        <span class="summary-free">0 Doubloons (Exempt)</span>
                    </div>
                    <div class="summary-line summary-total-line">
                        <span>Cargo Total:</span>
                        <span id="summaryTotalVal" class="summary-total-gold">🪙 ${storeState.totalDoubloons.toLocaleString()} Doubloons</span>
                    </div>

                    <div class="summary-actions">
                        <button id="btnManifestCheckout" class="btn-manifest-checkout">
                            ⚓ Secure Cargo Hold
                        </button>
                        <button id="btnClearHold" class="btn-manifest-clear">
                            🗑️ Jettison All Cargo
                        </button>
                        <a href="/home#sea-chart-section" class="btn-manifest-continue">
                            🗺️ Continue Island Plunder
                        </a>
                    </div>
                </aside>
            </div>
        `;

        wireManifestEventListeners();
    }

    // Attach event listeners for manifest table controls
    function wireManifestEventListeners() {
        document.querySelectorAll(".cart-manifest-table .btn-qty-plus").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                updateCargoQuantity(id, "increase");
            });
        });

        document.querySelectorAll(".cart-manifest-table .btn-qty-minus").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                updateCargoQuantity(id, "decrease");
            });
        });

        document.querySelectorAll(".cart-manifest-table .btn-item-remove-direct").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                const name = btn.getAttribute("data-name");
                removeCargoItem(id, name);
            });
        });

        const clearBtn = document.getElementById("btnClearHold");
        if (clearBtn) {
            clearBtn.addEventListener("click", clearCargoHold);
        }

        const checkoutBtn = document.getElementById("btnManifestCheckout");
        if (checkoutBtn) {
            checkoutBtn.addEventListener("click", () => {
                if (storeState.cart.length === 0) {
                    showToast("Your cargo hold is empty!");
                    return;
                }
                showToast("⚓ Hold verified! Ready for voyage. (Checkout unlocks in Phase 3.6)");
            });
        }
    }

    // Toggle Drawer Open/Close
    function toggleCartDrawer(open) {
        const drawer = document.getElementById("storeCartDrawer");
        if (!drawer) return;
        if (open) {
            renderCartDrawer();
            drawer.classList.add("open");
        } else {
            drawer.classList.remove("open");
        }
    }

    // Filter & Sort Cards for Store Island Views
    function filterAndSortCards() {
        const grid = document.getElementById("storeItemsGrid");
        if (!grid) return;

        const cards = Array.from(grid.querySelectorAll(".store-item-card"));

        // Filter
        cards.forEach(card => {
            const categories = (card.getAttribute("data-category") || "").toLowerCase();
            const title = (card.getAttribute("data-name") || "").toLowerCase();
            const desc = (card.getAttribute("data-desc") || "").toLowerCase();

            const matchCat = storeState.activeCategory === "all" || categories.includes(storeState.activeCategory);
            const matchSearch = !storeState.searchQuery || title.includes(storeState.searchQuery) || desc.includes(storeState.searchQuery);

            if (matchCat && matchSearch) {
                card.style.display = "flex";
            } else {
                card.style.display = "none";
            }
        });

        // Sort
        const visibleCards = cards.filter(c => c.style.display !== "none");
        visibleCards.sort((a, b) => {
            const priceA = parseFloat(a.getAttribute("data-price") || 0);
            const priceB = parseFloat(b.getAttribute("data-price") || 0);
            const nameA = (a.getAttribute("data-name") || "").toLowerCase();
            const nameB = (b.getAttribute("data-name") || "").toLowerCase();

            if (storeState.sortBy === "price-low") return priceA - priceB;
            if (storeState.sortBy === "price-high") return priceB - priceA;
            if (storeState.sortBy === "name") return nameA.localeCompare(nameB);
            return 0; // default order
        });

        visibleCards.forEach(c => grid.appendChild(c));
    }

    // Initialize Event Listeners
    function init() {
        loadWishlist();
        fetchCartFromServer();

        // Category Sidebar Clicks
        document.querySelectorAll(".sidebar-nav-item").forEach(item => {
            item.addEventListener("click", () => {
                document.querySelectorAll(".sidebar-nav-item").forEach(i => i.classList.remove("active"));
                item.classList.add("active");
                storeState.activeCategory = item.getAttribute("data-category") || "all";
                filterAndSortCards();
            });
        });

        // Search Input
        const searchInput = document.getElementById("storeSearchInput");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                storeState.searchQuery = e.target.value.trim().toLowerCase();
                filterAndSortCards();
            });
        }

        // Sort Select
        const sortSelect = document.getElementById("storeSortSelect");
        if (sortSelect) {
            sortSelect.addEventListener("change", (e) => {
                storeState.sortBy = e.target.value;
                filterAndSortCards();
            });
        }

        // Wishlist Buttons
        document.querySelectorAll(".btn-wishlist").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const itemId = btn.getAttribute("data-id");
                const itemName = btn.getAttribute("data-name") || "Item";

                if (storeState.wishlist.includes(itemId)) {
                    storeState.wishlist = storeState.wishlist.filter(id => id !== itemId);
                    btn.classList.remove("active");
                    btn.innerHTML = "♡";
                    showToast(`Removed "${itemName}" from Wishlist`);
                } else {
                    storeState.wishlist.push(itemId);
                    btn.classList.add("active");
                    btn.innerHTML = "❤️";
                    showToast(`❤️ Added "${itemName}" to Wishlist!`);
                }
                saveWishlist();
            });
        });

        // Add to Cart Buttons across Island Cards and Product Detail
        document.querySelectorAll(".btn-add-cart").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const id = btn.getAttribute("data-id");
                const name = btn.getAttribute("data-name") || "Archipelago Plunder";
                addToCargoHold(id, name);
            });
        });

        // Cart Drawer Toggle
        const openCartBtn = document.getElementById("btnOpenCart");
        if (openCartBtn) {
            openCartBtn.addEventListener("click", () => toggleCartDrawer(true));
        }

        const closeCartBtn = document.getElementById("btnCloseCart");
        if (closeCartBtn) {
            closeCartBtn.addEventListener("click", () => toggleCartDrawer(false));
        }

        const checkoutBtn = document.getElementById("btnCheckoutCargo");
        if (checkoutBtn) {
            checkoutBtn.addEventListener("click", () => {
                if (storeState.cart.length === 0) {
                    showToast("Your cargo hold is empty!");
                    return;
                }
                showToast("⚓ Hold verified! Ready for voyage. (Checkout unlocks in Phase 3.6)");
            });
        }

        // Initial wire up of manifest page controls if already rendered via SSR
        wireManifestEventListeners();
    }

    // Run on DOM Ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
