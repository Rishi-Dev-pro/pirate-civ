/**
 * PIRATE-CIV — CINEMATIC INTERACTIVE GATEWAY LOGIC
 * Implements pointer tracking, active drag across map regions, opposite-side dimming,
 * touch-safe single navigation, and keyboard accessibility.
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
     * Sets active illuminated highlight on targeted portal while dimming opposite side.
     */
    function setFocus(side) {
        if (side === "left") {
            stage.classList.add("stage-focus-left");
            stage.classList.remove("stage-focus-right");
        } else if (side === "right") {
            stage.classList.add("stage-focus-right");
            stage.classList.remove("stage-focus-left");
        } else {
            stage.classList.remove("stage-focus-left");
            stage.classList.remove("stage-focus-right");
        }
    }

    /**
     * Executes role-aware navigation with press feedback.
     */
    function triggerNavigation(portal) {
        if (!portal || isNavigating) return;
        isNavigating = true;

        const href = portal.getAttribute("href") || portal.dataset.href;
        if (!href) return;

        portal.classList.add("portal-pressed");

        setTimeout(() => {
            window.location.href = href;
        }, 120);
    }

    // =========================================================================
    // 1. POINTER HOVER & DRAG TRACKING (Pointer Events API)
    // =========================================================================

    stage.addEventListener("pointermove", (e) => {
        const target = getPortalAtCoords(e.clientX, e.clientY);
        if (target === merchantPortal) {
            setFocus("left");
        } else if (target === buyerPortal) {
            setFocus("right");
        } else {
            setFocus(null);
        }
    });

    stage.addEventListener("pointerleave", () => {
        if (!isPointerDown) {
            setFocus(null);
        }
    });

    stage.addEventListener("pointerdown", (e) => {
        isPointerDown = true;
        const target = getPortalAtCoords(e.clientX, e.clientY);
        if (target === merchantPortal) {
            setFocus("left");
            merchantPortal.classList.add("portal-pressed");
        } else if (target === buyerPortal) {
            setFocus("right");
            buyerPortal.classList.add("portal-pressed");
        }
    });

    window.addEventListener("pointerup", (e) => {
        if (!isPointerDown) return;
        isPointerDown = false;

        merchantPortal.classList.remove("portal-pressed");
        buyerPortal.classList.remove("portal-pressed");

        const target = getPortalAtCoords(e.clientX, e.clientY);
        if (target && !isNavigating) {
            triggerNavigation(target);
        }
    });

    window.addEventListener("pointercancel", () => {
        isPointerDown = false;
        merchantPortal.classList.remove("portal-pressed");
        buyerPortal.classList.remove("portal-pressed");
        setFocus(null);
    });

    // =========================================================================
    // 2. CLICK, TOUCH & KEYBOARD ACCESSIBILITY
    // =========================================================================

    [merchantPortal, buyerPortal].forEach((portal) => {
        const side = portal === merchantPortal ? "left" : "right";

        // Normal click fallback
        portal.addEventListener("click", (e) => {
            e.preventDefault();
            triggerNavigation(portal);
        });

        // Keyboard Enter / Space
        portal.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " " || e.keyCode === 13 || e.keyCode === 32) {
                e.preventDefault();
                triggerNavigation(portal);
            }
        });

        // Keyboard focus states
        portal.addEventListener("focus", () => {
            setFocus(side);
        });

        portal.addEventListener("blur", () => {
            setFocus(null);
        });

        portal.addEventListener("pointerenter", () => {
            setFocus(side);
        });
    });
});
