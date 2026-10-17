/**
 * PIRATE-CIV — CINEMATIC INTERACTIVE GATEWAY LOGIC
 * Handles pointer movement, drag detection, hover illumination, touch, and navigation.
 */

document.addEventListener("DOMContentLoaded", () => {
    const merchantPortal = document.getElementById("cardArmator");
    const buyerPortal = document.getElementById("cardExplorer");
    const stage = document.getElementById("gatewayStage");

    if (!merchantPortal || !buyerPortal || !stage) {
        return;
    }

    let isPointerDown = false;
    let isNavigating = false;
    let dragThresholdPassed = false;
    let startX = 0;
    let startY = 0;

    /**
     * Resolves which portal is located directly beneath client coordinates.
     */
    function getPortalAtCoords(x, y) {
        const el = document.elementFromPoint(x, y);
        if (!el) return null;
        if (merchantPortal.contains(el) || el === merchantPortal) return merchantPortal;
        if (buyerPortal.contains(el) || el === buyerPortal) return buyerPortal;
        return null;
    }

    /**
     * Sets active illuminated highlight on the targeted portal.
     */
    function setHighlight(portal) {
        if (portal === merchantPortal) {
            merchantPortal.classList.add("portal-active");
            buyerPortal.classList.remove("portal-active");
        } else if (portal === buyerPortal) {
            buyerPortal.classList.add("portal-active");
            merchantPortal.classList.remove("portal-active");
        } else {
            merchantPortal.classList.remove("portal-active");
            buyerPortal.classList.remove("portal-active");
        }
    }

    /**
     * Executes safe, role-aware navigation without duplicate triggers.
     */
    function triggerNavigation(portal) {
        if (!portal || isNavigating) return;
        isNavigating = true;

        const href = portal.getAttribute("href") || portal.dataset.href;
        if (!href) return;

        portal.classList.add("portal-pressed");

        setTimeout(() => {
            window.location.href = href;
        }, 140);
    }

    // =========================================================================
    // 1. POINTER HOVER & DRAG TRACKING (Pointer Events API)
    // =========================================================================

    stage.addEventListener("pointermove", (e) => {
        // Track movement across stage for both hover and active pointer drag
        const target = getPortalAtCoords(e.clientX, e.clientY);
        setHighlight(target);

        if (isPointerDown) {
            const dx = Math.abs(e.clientX - startX);
            const dy = Math.abs(e.clientY - startY);
            if (dx > 5 || dy > 5) {
                dragThresholdPassed = true;
            }
        }
    });

    stage.addEventListener("pointerleave", () => {
        if (!isPointerDown) {
            setHighlight(null);
        }
    });

    stage.addEventListener("pointerdown", (e) => {
        isPointerDown = true;
        dragThresholdPassed = false;
        startX = e.clientX;
        startY = e.clientY;

        const target = getPortalAtCoords(e.clientX, e.clientY);
        setHighlight(target);
        if (target) {
            target.classList.add("portal-pressed");
        }
    });

    window.addEventListener("pointerup", (e) => {
        if (!isPointerDown) return;
        isPointerDown = false;

        merchantPortal.classList.remove("portal-pressed");
        buyerPortal.classList.remove("portal-pressed");

        // If pointer was released over an interactive portal
        const target = getPortalAtCoords(e.clientX, e.clientY);
        if (target && !isNavigating) {
            triggerNavigation(target);
        }
    });

    window.addEventListener("pointercancel", () => {
        isPointerDown = false;
        merchantPortal.classList.remove("portal-pressed");
        buyerPortal.classList.remove("portal-pressed");
        setHighlight(null);
    });

    // =========================================================================
    // 2. CLICK, TOUCH & KEYBOARD ACCESSIBILITY
    // =========================================================================

    [merchantPortal, buyerPortal].forEach((portal) => {
        // Standard click handler fallback (ensures normal clicks always work)
        portal.addEventListener("click", (e) => {
            e.preventDefault();
            triggerNavigation(portal);
        });

        // Keyboard navigation (Enter / Space triggers destination)
        portal.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " " || e.keyCode === 13 || e.keyCode === 32) {
                e.preventDefault();
                triggerNavigation(portal);
            }
        });

        // Individual hover safety
        portal.addEventListener("pointerenter", () => {
            setHighlight(portal);
        });

        portal.addEventListener("focus", () => {
            setHighlight(portal);
        });

        portal.addEventListener("blur", () => {
            setHighlight(null);
        });
    });
});
