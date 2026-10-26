/**
 * PIRATE-CIV — CINEMATIC INTERACTIVE GATEWAY LOGIC
 * Implements pointer tracking, active drag across map regions, opposite-side dimming,
 * touch-safe single navigation, keyboard accessibility, and the secret
 * triple-logo click Admin Entrance Easter Egg.
 */

document.addEventListener("DOMContentLoaded", () => {
    const merchantPortal = document.getElementById("cardArmator");
    const buyerPortal = document.getElementById("cardExplorer");
    const stage = document.getElementById("gatewayStage");
    const heroLogo = document.getElementById("gatewayHeroLogo");
    const secretEntrance = document.getElementById("secretAdminEntrance");
    const secretSkullBtn = document.getElementById("secretAdminSkullBtn");
    const secretSkullImg = document.getElementById("secretAdminSkullImg");

    if (!merchantPortal || !buyerPortal || !stage) {
        return;
    }

    let isPointerDown = false;
    let isNavigating = false;

    // Secret Admin Entrance State Machine
    let logoClicks = 0;
    let logoResetTimer = null;
    let isSecretSequenceActive = false;
    let isSkullInteractive = false;
    let isNavigatingToAdmin = false;
    let skullPreloaded = false;

    /**
     * Preloads the transparent skull image asset on early interaction.
     */
    function preloadSkullAsset() {
        if (skullPreloaded) return;
        skullPreloaded = true;
        const img = new Image();
        img.src = "/images/gateway/pirate-civ-skull.png";
    }

    /**
     * Resolves which portal is located directly beneath client coordinates.
     */
    function getPortalAtCoords(x, y) {
        if (isSecretSequenceActive) return null;
        const el = document.elementFromPoint(x, y);
        if (!el) return null;
        if (heroLogo && (heroLogo.contains(el) || el === heroLogo)) return null;
        if (merchantPortal.contains(el) || el === merchantPortal) return merchantPortal;
        if (buyerPortal.contains(el) || el === buyerPortal) return buyerPortal;
        return null;
    }

    /**
     * Sets active illuminated highlight on targeted portal while dimming opposite side.
     */
    function setFocus(side) {
        if (isSecretSequenceActive) return;
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
        if (!portal || isNavigating || isSecretSequenceActive) return;
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
        if (isSecretSequenceActive) return;
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
        if (!isPointerDown && !isSecretSequenceActive) {
            setFocus(null);
        }
    });

    stage.addEventListener("pointerdown", (e) => {
        if (isSecretSequenceActive) return;
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

        if (isSecretSequenceActive) return;
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
    // 2. CLICK, TOUCH & KEYBOARD ACCESSIBILITY FOR MAP PORTALS
    // =========================================================================

    [merchantPortal, buyerPortal].forEach((portal) => {
        const side = portal === merchantPortal ? "left" : "right";

        // Normal click fallback
        portal.addEventListener("click", (e) => {
            if (isSecretSequenceActive) return;
            e.preventDefault();
            triggerNavigation(portal);
        });

        // Keyboard Enter / Space
        portal.addEventListener("keydown", (e) => {
            if (isSecretSequenceActive) return;
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

    // =========================================================================
    // 3. SECRET ADMIN ENTRANCE — TRIPLE LOGO CLICK STATE MACHINE
    // =========================================================================

    /**
     * Resets the secret sequence state completely, closing the overlay if active.
     */
    function resetSecretSequence() {
        logoClicks = 0;
        if (logoResetTimer) {
            clearTimeout(logoResetTimer);
            logoResetTimer = null;
        }

        if (isSecretSequenceActive && !isNavigatingToAdmin) {
            isSecretSequenceActive = false;
            isSkullInteractive = false;

            if (secretEntrance) {
                secretEntrance.classList.remove("secret-entrance-blackout", "secret-entrance-dissolve");
                secretEntrance.setAttribute("aria-hidden", "true");
            }
            if (secretSkullBtn) {
                secretSkullBtn.disabled = true;
                secretSkullBtn.setAttribute("tabindex", "-1");
            }
            if (secretSkullImg) {
                secretSkullImg.classList.remove("skull-revealed", "skull-breathing", "skull-dissolve");
            }
        }
    }

    /**
     * Executes the forbidden chamber sequence:
     * Phase A: 1.5s blackout transition
     * Phase B: 600ms deliberate black hold
     * Phase C: 1.5s slow skull reveal
     * Phase D: Subtle breathing atmosphere and interactive activation
     */
    function launchSecretAdminEntrance() {
        if (!secretEntrance || !secretSkullBtn || !secretSkullImg) return;

        isSecretSequenceActive = true;
        setFocus(null);

        // Lock map press states
        merchantPortal.classList.remove("portal-pressed");
        buyerPortal.classList.remove("portal-pressed");

        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const blackoutDuration = reducedMotion ? 200 : 1500;
        const blackHoldDuration = reducedMotion ? 150 : 600;
        const revealDuration = reducedMotion ? 200 : 1500;

        // Phase A: Begin slow cinematic fade-to-black
        secretEntrance.setAttribute("aria-hidden", "false");
        secretEntrance.classList.remove("secret-entrance-dissolve");
        secretEntrance.classList.add("secret-entrance-blackout");

        // Phase B: Full black hold
        setTimeout(() => {
            if (!isSecretSequenceActive) return;

            // Phase C: Slowly reveal the skull into the center
            secretSkullImg.classList.add("skull-revealed");

            // Phase D: Make skull interactive & enable atmospheric breathing
            setTimeout(() => {
                if (!isSecretSequenceActive) return;

                if (!reducedMotion) {
                    secretSkullImg.classList.add("skull-breathing");
                }
                secretSkullBtn.disabled = false;
                secretSkullBtn.setAttribute("tabindex", "0");
                isSkullInteractive = true;
            }, revealDuration);

        }, blackoutDuration + blackHoldDuration);
    }

    /**
     * Navigates to canonical admin dashboard route upon skull activation.
     */
    function triggerAdminNavigation() {
        if (!isSkullInteractive || isNavigatingToAdmin) return;
        isNavigatingToAdmin = true;

        secretSkullBtn.disabled = true;

        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const exitDuration = reducedMotion ? 200 : 650;

        // Cinematic dissolve
        secretSkullImg.classList.add("skull-dissolve");
        secretEntrance.classList.add("secret-entrance-dissolve");

        setTimeout(() => {
            window.location.href = "/admin/dashboard";
        }, exitDuration);
    }

    if (heroLogo) {
        // Prevent pointerdown from triggering stage drag/portal selection
        heroLogo.addEventListener("pointerdown", (e) => {
            e.stopPropagation();
        });

        heroLogo.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();

            if (isSecretSequenceActive) return;

            // Preload asset immediately on first click
            preloadSkullAsset();

            logoClicks++;

            // Subtle visual feedback: tiny pulse and glow
            heroLogo.classList.remove("logo-click-pulse");
            void heroLogo.offsetWidth; // Force CSS reflow
            heroLogo.classList.add("logo-click-pulse");
            setTimeout(() => {
                heroLogo.classList.remove("logo-click-pulse");
            }, 180);

            if (logoResetTimer) {
                clearTimeout(logoResetTimer);
            }

            if (logoClicks >= 3) {
                logoClicks = 0;
                launchSecretAdminEntrance();
            } else {
                // Forgiving 3.5s reset timeout
                logoResetTimer = setTimeout(() => {
                    logoClicks = 0;
                }, 3500);
            }
        });
    }

    if (secretSkullBtn) {
        secretSkullBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            triggerAdminNavigation();
        });

        secretSkullBtn.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " " || e.keyCode === 13 || e.keyCode === 32) {
                e.preventDefault();
                e.stopPropagation();
                triggerAdminNavigation();
            }
        });
    }

    // Escape key resets/cancels the sequence
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" || e.keyCode === 27) {
            resetSecretSequence();
        }
    });
});
