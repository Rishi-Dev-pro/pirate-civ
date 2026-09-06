/* =========================================================
   PIRATE CARTOGRAPHIC ISLAND STORE JAVASCRIPT ENGINE
   Unified Functionality for All 6 Islands:
   - Live Category Filtering
   - Live Search Filtering
   - Dynamic Sorting
   - Wishlist Toggle
   - Interactive Cargo Hold Cart Drawer & Persistence
========================================================= */

(function () {
    "use strict";

    // State
    const storeState = {
        activeCategory: "all",
        searchQuery: "",
        sortBy: "default",
        cart: [],
        wishlist: []
    };

    // Load persisted state from localStorage
    function loadPersistedData() {
        try {
            storeState.cart = JSON.parse(localStorage.getItem("pirate_cart") || "[]");
            storeState.wishlist = JSON.parse(localStorage.getItem("pirate_wishlist") || "[]");
        } catch (e) {
            storeState.cart = [];
            storeState.wishlist = [];
        }
        updateCartBadge();
        applyWishlistState();
    }

    function saveCart() {
        try {
            localStorage.setItem("pirate_cart", JSON.stringify(storeState.cart));
        } catch (e) {}
        updateCartBadge();
        renderCartDrawer();
    }

    function saveWishlist() {
        try {
            localStorage.setItem("pirate_wishlist", JSON.stringify(storeState.wishlist));
        } catch (e) {}
    }

    // Update Cart Badge Count
    function updateCartBadge() {
        const cartBadgeEl = document.getElementById("cartCountBadge");
        if (cartBadgeEl) {
            const totalCount = storeState.cart.reduce((sum, item) => sum + (item.qty || 1), 0);
            cartBadgeEl.textContent = `(${totalCount})`;
        }
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

    // Toast Notification
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

    // Filter & Sort Cards
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

    // Cart Drawer Controls
    function renderCartDrawer() {
        const drawerItems = document.getElementById("cartDrawerItems");
        const drawerTotal = document.getElementById("cartDrawerTotal");
        if (!drawerItems || !drawerTotal) return;

        drawerItems.innerHTML = "";
        let total = 0;

        if (storeState.cart.length === 0) {
            drawerItems.innerHTML = `<div class="cart-empty-msg">⚓ Your cargo hold is currently empty.</div>`;
            drawerTotal.textContent = "🪙 0 Doubloons";
            return;
        }

        storeState.cart.forEach((item, index) => {
            const itemTotal = (item.price || 0) * (item.qty || 1);
            total += itemTotal;

            const row = document.createElement("div");
            row.className = "cart-item-row";
            row.innerHTML = `
                <div>
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">🪙 ${item.price} × ${item.qty || 1}</div>
                </div>
                <button class="btn-remove-item" data-index="${index}" title="Remove item">&times;</button>
            `;

            row.querySelector(".btn-remove-item").addEventListener("click", () => {
                storeState.cart.splice(index, 1);
                saveCart();
                showToast(`Removed "${item.name}" from cargo.`);
            });

            drawerItems.appendChild(row);
        });

        drawerTotal.textContent = `🪙 ${total.toLocaleString()} Doubloons`;
    }

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

    // Initialize Event Listeners
    function init() {
        loadPersistedData();

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

        // Add to Cart Buttons
        document.querySelectorAll(".btn-add-cart").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.getAttribute("data-id");
                const name = btn.getAttribute("data-name");
                const price = parseFloat(btn.getAttribute("data-price") || 0);

                const existing = storeState.cart.find(item => item.id === id);
                if (existing) {
                    existing.qty = (existing.qty || 1) + 1;
                } else {
                    storeState.cart.push({ id, name, price, qty: 1 });
                }

                saveCart();
                showToast(`⚓ "${name}" (${price} Doubloons) stowed in Cargo!`);
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
                showToast("⚓ Voyage Cargo Secured! Safe sailing, Captain!");
                storeState.cart = [];
                saveCart();
                setTimeout(() => toggleCartDrawer(false), 1200);
            });
        }
    }

    // Run on DOM Ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
