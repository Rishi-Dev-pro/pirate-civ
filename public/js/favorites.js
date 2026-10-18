/**
 * PIRATE-CIV — FAVORITES CLIENT CONTROLLER
 * Handles client-side "Stow in Hold" interactions without raw JSON navigation.
 */
(function() {
    "use strict";

    // Show Pirate-Civ Toast Notification
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
        }, 3200);
    }

    // Update global navbar Cargo Hold count badge
    function updateNavbarCargoCount(itemCount) {
        const navCargoCount = document.getElementById("navCargoCount");
        if (navCargoCount && typeof itemCount === "number") {
            navCargoCount.textContent = itemCount > 0 ? ` (${itemCount})` : "";
        }
    }

    // Attach Stow in Hold form submission handlers
    function initFavoritesStow() {
        const forms = document.querySelectorAll(".favorite-stow-form");
        forms.forEach(form => {
            form.addEventListener("submit", async function(e) {
                e.preventDefault();

                const submitBtn = form.querySelector(".btn-favorite-stow") || form.querySelector("button[type='submit']");
                if (!submitBtn || submitBtn.disabled || form.dataset.submitting === "true") {
                    return; // Prevent duplicate clicks
                }

                const productIdInput = form.querySelector("input[name='productId']");
                const quantityInput = form.querySelector("input[name='quantity']");
                const productId = productIdInput ? productIdInput.value : form.dataset.productId;
                const quantity = quantityInput ? parseInt(quantityInput.value, 10) || 1 : 1;
                const productName = form.dataset.productName || (submitBtn.dataset.name) || "Treasure";

                if (!productId) {
                    showToast("⚠️ Missing product identifier.");
                    return;
                }

                // Protect against duplicate submissions
                form.dataset.submitting = "true";
                submitBtn.disabled = true;
                const originalHtml = submitBtn.innerHTML;
                submitBtn.innerHTML = "<span>⏳ STOWING...</span>";

                try {
                    const res = await fetch("/cart/add", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        body: JSON.stringify({ productId, quantity })
                    });

                    let data;
                    try {
                        data = await res.json();
                    } catch (parseErr) {
                        data = null;
                    }

                    if (res.ok && data && data.success) {
                        // 1. Update Cargo Hold Count in navbar
                        if (data.cart && typeof data.cart.itemCount === "number") {
                            updateNavbarCargoCount(data.cart.itemCount);
                        }

                        // 2. Clear success feedback matching Pirate-Civ standard
                        const successMsg = data.message ? `⚓ ${data.message}!` : `⚓ "${productName}" stowed in Cargo Hold!`;
                        showToast(successMsg);

                        // 3. Visual button feedback
                        submitBtn.innerHTML = "<span>✓ STOWED</span>";
                        setTimeout(() => {
                            submitBtn.innerHTML = originalHtml;
                            submitBtn.disabled = false;
                            form.dataset.submitting = "false";
                        }, 1200);
                    } else {
                        // Handle server errors
                        const errorMsg = (data && data.error)
                            ? data.error
                            : (res.status === 401 ? "Please sign in to stow cargo." : "Could not stow item into Cargo Hold.");
                        showToast(`⚠️ ${errorMsg}`);
                        submitBtn.innerHTML = originalHtml;
                        submitBtn.disabled = false;
                        form.dataset.submitting = "false";
                    }
                } catch (err) {
                    console.error("Error stowing favorite product:", err);
                    showToast("⚠️ Network tempest encountered while stowing cargo.");
                    submitBtn.innerHTML = originalHtml;
                    submitBtn.disabled = false;
                    form.dataset.submitting = "false";
                }
            });
        });
    }

    // Delegated click handler to intercept any click directly on .btn-favorite-stow
    document.addEventListener("click", function(e) {
        const btn = e.target.closest(".btn-favorite-stow");
        if (btn) {
            const form = btn.closest(".favorite-stow-form");
            if (form && form.dataset.submitting !== "true") {
                // If the form has an attached submit listener, let submit event trigger
                // Otherwise dispatch submit
                if (!form._stowBound) {
                    e.preventDefault();
                    form._stowBound = true;
                    form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
                }
            }
        }
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initFavoritesStow);
    } else {
        initFavoritesStow();
    }
})();
