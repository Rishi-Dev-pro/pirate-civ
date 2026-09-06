/* =========================================================
   PIRATE CARTOGRAPHIC E-COMMERCE MIND MAP ENGINE
   Matches Uploaded Demo Sea Chart with Exact Islands,
   Curvy S-Routes, and Slow Cinematic Voyage Animations
========================================================= */

(function () {
    "use strict";

    /* =====================================================
       1. CARTOGRAPHIC REALM TREE DATA
    ====================================================== */
    const REALM_DATA = {
        id: "root",
        name: "Grand Bazaar",
        title: "Capital of the Seven Seas",
        type: "capital",
        icon: "🏰",
        badge: "TRADE CAPITAL",
        desc: "The sovereign trade capital of merchant corsairs, black-market cartographers, and buccaneer armators.",
        image: "/images/island-grand-bazaar-dusty.png",
        children: [
            {
                id: "relics",
                name: "Isle of Ancient Relics",
                title: "Fashion and style",
                type: "archipelago",
                icon: "🧭",
                badge: "EXPEDITION REALM",
                desc: "Mysterious island ring where astronomers, salvage divers, and occult navigators trade rare relics.",
                image: "/images/island-ancient-relics-dusty.png",
                children: [
                    {
                        id: "astrolabe",
                        name: "Astrolabe Atoll",
                        title: "Clothing",
                        type: "isle",
                        icon: "🔭",
                        badge: "INSTRUMENTS",
                        desc: "Sunstone compasses, brass sextants, and star-globes tuned to equatorial currents.",
                        image: "/images/island-astrolabe-dusty.png",
                        products: [
                            {
                                id: "p1",
                                name: "Gilded Celestial Astrolabe",
                                price: 85,
                                rating: "★★★★★",
                                image: "🔭",
                                desc: "Forged in Seville, calibrated for navigating through the Devil's Triangle without magnetic drift."
                            },
                            {
                                id: "p2",
                                name: "Brass Pocket Sextant",
                                price: 42,
                                rating: "★★★★☆",
                                image: "🧭",
                                desc: "Heavy antiqued brass with dual mirrors and engraved lunar distance tables."
                            },
                            {
                                id: "p3",
                                name: "Triton's Spyglass",
                                price: 68,
                                rating: "★★★★★",
                                image: "🔍",
                                desc: "30x magnification coated optics in hand-stitched buffalo leather."
                            }
                        ]
                    },
                    {
                        id: "chronos",
                        name: "Chronos Cay",
                        title: "Footwear",
                        type: "isle",
                        icon: "⏳",
                        badge: "HOROLOGY",
                        desc: "Precision marine chronometers and sandglasses impervious to brine and high-seas squalls.",
                        image: "/images/island-chronos-dusty.png",
                        products: [
                            {
                                id: "p4",
                                name: "Gimbaled Marine Chronometer",
                                price: 140,
                                rating: "★★★★★",
                                image: "🕰️",
                                desc: "Spring detent escapement housed inside solid mahogany lockbox with brass gimbals."
                            },
                            {
                                id: "p5",
                                name: "Dead-Man's Sandglass",
                                price: 30,
                                rating: "★★★★☆",
                                image: "⏳",
                                desc: "Filled with volcanic black sand from Port Royal. Measures exactly 30 minutes of watch."
                            }
                        ]
                    },
                    {
                        id: "kraken_vault",
                        name: "Kraken's Vault",
                        title: "Accessories",
                        type: "isle",
                        icon: "🔮",
                        badge: "CURSED RELICS",
                        desc: "Sunken treasures salvaged from abyss trenches, black pearls, and eldritch kraken amulets.",
                        image: "/images/island-kraken-dusty.png",
                        products: [
                            {
                                id: "p6",
                                name: "Abyssal Black Pearl Amulet",
                                price: 195,
                                rating: "★★★★★",
                                image: "🖤",
                                desc: "18mm baroque black pearl encased in tentacle-wrought oxidized sterling silver."
                            },
                            {
                                id: "p7",
                                name: "Sunken Spanish Doubloon Medallion",
                                price: 55,
                                rating: "★★★★☆",
                                image: "🪙",
                                desc: "Genuine 1692 gold escudo recovered from the seabed of the Florida Straits."
                            }
                        ]
                    }
                ]
            },
            {
                id: "apparel",
                name: "Port of Corsair Apparel",
                title: "Home, Tech & Essentials",
                type: "archipelago",
                icon: "⚔️",
                badge: "BUCCANEER WARE",
                desc: "Raucous pirate haven specializing in weatherproof captains' coats, tempered steel, and swagger.",
                image: "/images/island-corsair-apparel-dusty.png",
                children: [
                    {
                        id: "cutlass_cove",
                        name: "Cutlass Cove",
                        title: "ELECTRONICS",
                        type: "isle",
                        icon: "🗡️",
                        badge: "WEAPONRY",
                        desc: "Damascus steel boarding sabres, heavy brass cutlasses, and engraved boarding daggers.",
                        image: "/images/island-cutlass-dusty.png",
                        products: [
                            {
                                id: "p8",
                                name: "Toledo Steel Boarding Sabre",
                                price: 110,
                                rating: "★★★★★",
                                image: "⚔️",
                                desc: "Curved 28-inch carbon steel blade with basket hilt and rayskin grip."
                            },
                            {
                                id: "p9",
                                name: "Buccaneer Main-Gauche Dagger",
                                price: 48,
                                rating: "★★★★☆",
                                image: "🗡️",
                                desc: "Wide crossguard parrying blade with hidden poison reservoir in the pommel."
                            }
                        ]
                    },
                    {
                        id: "velvet_isle",
                        name: "Velvet Isle",
                        title: "HOME & LIVING",
                        type: "isle",
                        icon: "🧥",
                        badge: "VESTMENTS",
                        desc: "Brocade longcoats, oiled-leather tricorns, and weather-proof sea cloaks fit for pirate lords.",
                        image: "/images/island-velvet-dusty.png",
                        products: [
                            {
                                id: "p10",
                                name: "Crimson Silk Captain's Longcoat",
                                price: 165,
                                rating: "★★★★★",
                                image: "🧥",
                                desc: "Heavy woven damask with antique brass filigree buttons and hidden smuggler pockets."
                            },
                            {
                                id: "p11",
                                name: "Distressed Leather Tricorn Hat",
                                price: 62,
                                rating: "★★★★☆",
                                image: "🎩",
                                desc: "Waterproof waxed steerhide adorned with rooster feather and brass skull pin."
                            }
                        ]
                    },
                    {
                        id: "booty_cay",
                        name: "Booty Cay",
                        title: "BEAUTY",
                        type: "isle",
                        icon: "💰",
                        badge: "TREASURY",
                        desc: "Heavy gold bullion, engraved rum flasks, and pirate dice carved from kraken bone.",
                        image: "/images/island-booty-dusty.png",
                        products: [
                            {
                                id: "p12",
                                name: "Captain's Solid Silver Flask",
                                price: 58,
                                rating: "★★★★★",
                                image: "🍶",
                                desc: "Engraved with nautical compass rose, watertight screw cap, holds 12oz of aged rum."
                            },
                            {
                                id: "p13",
                                name: "Loaded Buccaneer Bone Dice Set",
                                price: 28,
                                rating: "★★★★☆",
                                image: "🎲",
                                desc: "Set of five ivory dice weighted for high-stakes tavern games in Tortuga."
                            }
                        ]
                    }
                ]
            }
        ]
    };

    /* =====================================================
       2. GLOBAL ENGINE STATE
    ====================================================== */
    const state = {
        currentLevel: 1,      // 1: Center Grand Bazaar, 2: 2 Branches, 3: 3 Leaves
        rootNode: REALM_DATA,
        activeParent: REALM_DATA,
        selectedBranch: null,
        breadcrumbTrail: [REALM_DATA],
        cart: [],
        activeVoyagerTimers: [],
        rootNodeEl: null,
        branchEls: [],
        leafEls: [],
        transitioning: false
    };

    /* =====================================================
       3. INITIALIZE ENGINE
    ====================================================== */
    function initMindMap() {
        const stage = document.getElementById("mindmapStage");
        if (!stage) return;

        // Render Navbar Cargo Cart
        setupCartUi();

        // Initial render Level 1
        const nodesLayer = document.getElementById("mindmapNodesLayer");
        const curvesLayer = document.getElementById("mindmapCurvesLayer");
        if (!nodesLayer || !curvesLayer) return;

        nodesLayer.innerHTML = "";
        curvesLayer.innerHTML = "";
        cancelActiveVoyagers();

        // Create Grand Bazaar centered in map (50% X, 48% Y)
        state.rootNodeEl = createCountryElement(state.rootNode, "state-center", {
            x: 50,
            y: 48
        });

        state.rootNodeEl.addEventListener("click", () => {
            if (state.currentLevel === 1) {
                transitionToLevelTwo();
            }
        });

        nodesLayer.appendChild(state.rootNodeEl);

        // Ensure Level 1 exploration decor layer is visible and Phase 2 & 3 are hidden
        const decorLayer = document.getElementById("mindmapDecorLayer");
        if (decorLayer) {
            decorLayer.classList.remove("decor-hidden");
        }
        const decorLayerP2 = document.getElementById("mindmapDecorLayerP2");
        if (decorLayerP2) {
            decorLayerP2.classList.add("decor-hidden");
        }
        const decorLayerP3 = document.getElementById("mindmapDecorLayerP3");
        if (decorLayerP3) {
            decorLayerP3.classList.add("decor-hidden");
        }
        const decorLayerP3Corsair = document.getElementById("mindmapDecorLayerP3Corsair");
        if (decorLayerP3Corsair) {
            decorLayerP3Corsair.classList.add("decor-hidden");
        }

        // Hide breadcrumbs initially
        renderBreadcrumbs();

        // Handle return from dedicated island view (?branch=relics or ?branch=apparel)
        const urlParams = new URLSearchParams(window.location.search);
        const branchParam = urlParams.get("branch");
        if (branchParam === "relics" || branchParam === "apparel") {
            setTimeout(() => {
                transitionToLevelTwo();
                setTimeout(() => {
                    const branchObj = state.branchEls.find(b => b.node.id === branchParam);
                    if (branchObj && branchObj.node && branchObj.el) {
                        transitionToLevelThree(branchObj.node, branchObj.el);
                    }
                }, 2600);
            }, 400);
        }

        // Handle resize
        let resizeTimer;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (state.currentLevel === 2 && !state.transitioning) {
                    returnToLevelTwo();
                }
            }, 200);
        });
    }

    /* =====================================================
       4. CINEMATIC VOYAGE STATE MACHINE & TRANSITIONS
       Matches Shared Video: Slow Glide to Left, Path Drawing,
       and Islands Appearing When Paths Reach Destinations
    ====================================================== */
    function cancelActiveVoyagers() {
        state.activeVoyagerTimers.forEach(id => cancelAnimationFrame(id));
        state.activeVoyagerTimers = [];
    }

    /* ----------------------------------------------------
       TRANSITION: Level 1 -> Level 2
       1. Grand Bazaar slowly glides from center to left
       2. Logbook bar slides in from top-left
       3. Golden dashed paths unroll across the parchment
       4. When paths reach the points, the 2 islands appear!
    ---------------------------------------------------- */
    function transitionToLevelTwo() {
        if (state.transitioning) return;
        state.transitioning = true;
        state.currentLevel = 2;
        state.activeParent = state.rootNode;
        state.breadcrumbTrail = [state.rootNode];

        const nodesLayer = document.getElementById("mindmapNodesLayer");
        const curvesLayer = document.getElementById("mindmapCurvesLayer");
        if (!nodesLayer || !curvesLayer) return;

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        // 1. Immediately fade out the Level 1 decor and reveal Phase 2 decor (ensure Phase 3 is hidden)
        const decorLayer = document.getElementById("mindmapDecorLayer");
        if (decorLayer) {
            decorLayer.classList.add("decor-hidden");
        }
        const decorLayerP2 = document.getElementById("mindmapDecorLayerP2");
        if (decorLayerP2) {
            decorLayerP2.classList.remove("decor-hidden");
        }
        const decorLayerP3 = document.getElementById("mindmapDecorLayerP3");
        if (decorLayerP3) {
            decorLayerP3.classList.add("decor-hidden");
        }
        const decorLayerP3Corsair = document.getElementById("mindmapDecorLayerP3Corsair");
        if (decorLayerP3Corsair) {
            decorLayerP3Corsair.classList.add("decor-hidden");
        }

        // 2. Clear any leftover voyagers and elements
        cancelActiveVoyagers();
        state.branchEls.forEach(({ el }) => el.remove());
        state.branchEls = [];
        state.leafEls.forEach(({ el }) => el.remove());
        state.leafEls = [];
        curvesLayer.innerHTML = "";

        // 2. Mount the 2 destination branch islands on the right (hidden by default CSS on .state-branch)
        const branches = state.rootNode.children;
        const branchConfigs = [
            { node: branches[0], coord: { x: 71.0, y: 18.0 } }, // Isle of Ancient Relics
            { node: branches[1], coord: { x: 69.5, y: 71.5 } }  // Port of Corsair Apparel
        ];

        branchConfigs.forEach(({ node, coord }) => {
            const branchEl = createCountryElement(node, "state-branch is-animating", coord);
            branchEl.addEventListener("click", () => {
                if (state.transitioning) return;
                transitionToLevelThree(node, branchEl);
            });
            nodesLayer.appendChild(branchEl);
            state.branchEls.push({ node, el: branchEl });
        });

        // 3. Show Logbook Bar in top-left
        renderBreadcrumbs();

        if (prefersReducedMotion) {
            // Immediate layout without long glide or staggered animations
            if (state.rootNodeEl) {
                state.rootNodeEl.className = "mindmap-country-node state-left";
                state.rootNodeEl.style.left = "17.5%";
                state.rootNodeEl.style.top = "46.5%";
                state.rootNodeEl.style.opacity = "1";
            }
            state.branchEls.forEach(({ el }) => {
                el.classList.remove("is-animating");
                el.classList.add("sprite-revealed", "plaque-revealed");
            });
            drawAnimatedRoute(curvesLayer, {
                startX: 215, startY: 270, cp1X: 300, cp1Y: 215, cp2X: 450, cp2Y: 130, endX: 635, endY: 115,
                color: "#d49339", duration: 7200, drawDuration: 100, delay: 0, drawStartAnchor: true,
                waypoints: [0.26, 0.62, 0.92]
            });
            drawAnimatedRoute(curvesLayer, {
                startX: 215, startY: 290, cp1X: 270, cp1Y: 310, cp2X: 410, cp2Y: 430, endX: 615, endY: 462,
                color: "#d49339", duration: 8000, drawDuration: 100, delay: 0, drawStartAnchor: false,
                waypoints: [0.12, 0.50, 0.76]
            });
            state.transitioning = false;
            return;
        }

        // ==========================================================
        // MULTI-PHASE CINEMATIC SEQUENCE (MATCHES USER TIMELINE EXACTLY)
        // ==========================================================

        // PHASE 1: Subtle anticipation (0.0s - 0.15s), then smooth glide left (0.15s - 1.85s)
        if (state.rootNodeEl) {
            state.rootNodeEl.classList.add("is-animating", "node-anticipating");
        }

        const glideTimer = setTimeout(() => {
            if (state.rootNodeEl) {
                state.rootNodeEl.classList.remove("node-anticipating");
                state.rootNodeEl.className = "mindmap-country-node state-left is-animating";
                state.rootNodeEl.style.left = "17.5%";
                state.rootNodeEl.style.top = "46.5%";
                state.rootNodeEl.style.opacity = "1";
            }
        }, 150);
        state.activeVoyagerTimers.push(glideTimer);

        // PHASE 2 & 3: Grand Bazaar settles at 15.5%, 46.5% (~1.85s), then short settling pause (until 2.15s).
        // ONLY AFTER GRAND BAZAAR HAS COMPLETELY SETTLED do the two routes begin drawing!
        const settleDelay = 2150; // 150ms anticipation + 1750ms glide + 250ms quiet settle
        let upperComplete = false;
        let lowerComplete = false;
        let upperPathObj = null;
        let lowerPathObj = null;

        function checkAllSettled() {
            if (upperComplete && lowerComplete) {
                // PHASE 7: Everything gently settles into final stable mind map
                setTimeout(() => {
                    if (state.rootNodeEl) state.rootNodeEl.classList.remove("is-animating");
                    state.branchEls.forEach(({ el }) => el.classList.remove("is-animating"));

                    // Launch gentle voyager patrol loops once map has settled
                    if (upperPathObj && upperPathObj.path) {
                        createVoyagerTraveler(curvesLayer, upperPathObj.path, 7200, 200);
                    }
                    if (lowerPathObj && lowerPathObj.path) {
                        createVoyagerTraveler(curvesLayer, lowerPathObj.path, 8000, 400);
                    }

                    // Unlock interaction
                    state.transitioning = false;
                }, 550);
            }
        }

        // PHASE 4: Progressive drawing of routes outward from Grand Bazaar dock
        // Route A: Upper route (Isle of Ancient Relics)
        const upperDuration = 1400;
        upperPathObj = drawAnimatedRoute(curvesLayer, {
            startX: 215, startY: 270,
            cp1X: 300, cp1Y: 215,
            cp2X: 450, cp2Y: 130,
            endX: 635, endY: 115,
            color: "#d49339",
            duration: 7200,
            drawDuration: upperDuration,
            delay: settleDelay, // Starts at 2.15s
            drawStartAnchor: true,
            waypoints: [0.26, 0.62, 0.92],
            onDestinationReached: (path) => {
                // PHASE 5: As upper route reaches destination, Isle of Ancient Relics begins materializing!
                const upperEl = state.branchEls[0]?.el;
                if (upperEl) {
                    upperEl.classList.add("sprite-revealed");

                    // PHASE 6: Destination card fades/slides in AFTER island has become visible
                    setTimeout(() => {
                        upperEl.classList.add("plaque-revealed");
                        upperComplete = true;
                        checkAllSettled();
                    }, 850);
                } else {
                    upperComplete = true;
                    checkAllSettled();
                }
            }
        });

        // Route B: Lower route (Port of Corsair Apparel), slightly staggered (+120ms)
        const lowerDuration = 1480;
        lowerPathObj = drawAnimatedRoute(curvesLayer, {
            startX: 215, startY: 290,
            cp1X: 270, cp1Y: 310,
            cp2X: 410, cp2Y: 430,
            endX: 615, endY: 462,
            color: "#d49339",
            duration: 8000,
            drawDuration: lowerDuration,
            delay: settleDelay + 120, // Staggered by 120ms (starts at 2.27s)
            drawStartAnchor: false,
            waypoints: [0.12, 0.50, 0.76],
            onDestinationReached: (path) => {
                // PHASE 5: As lower route reaches destination, Port of Corsair Apparel begins materializing!
                const lowerEl = state.branchEls[1]?.el;
                if (lowerEl) {
                    lowerEl.classList.add("sprite-revealed");

                    // PHASE 6: Destination card fades/slides in AFTER island has become visible
                    setTimeout(() => {
                        lowerEl.classList.add("plaque-revealed");
                        lowerComplete = true;
                        checkAllSettled();
                    }, 850);
                } else {
                    lowerComplete = true;
                    checkAllSettled();
                }
            }
        });
    }

    /* ----------------------------------------------------
       TRANSITION: Return to Capital (Level 1)
       1. Branch / leaf cards and islands fade out
       2. Curves fade away
       3. Grand Bazaar glides smoothly back to center
       4. Logbook bar hides
    ---------------------------------------------------- */
    function returnToCapital() {
        if (state.transitioning) return;
        state.transitioning = true;
        state.currentLevel = 1;
        state.selectedBranch = null;
        state.breadcrumbTrail = [state.rootNode];

        const curvesLayer = document.getElementById("mindmapCurvesLayer");
        cancelActiveVoyagers();

        // 1. Hide Logbook Bar
        const bar = document.getElementById("mindmapBreadcrumbs");
        if (bar) bar.classList.remove("visible");

        // 2. Hide all branch and leaf islands smoothly
        state.branchEls.forEach(({ el }) => {
            el.classList.remove("sprite-revealed", "plaque-revealed");
            el.style.transition = "opacity 0.4s ease, transform 0.4s ease";
            el.style.opacity = "0";
        });
        state.leafEls.forEach(({ el }) => {
            el.classList.remove("sprite-revealed", "plaque-revealed");
            el.style.transition = "opacity 0.4s ease, transform 0.4s ease";
            el.style.opacity = "0";
        });

        // 3. Fade out route curves
        if (curvesLayer) {
            curvesLayer.style.transition = "opacity 0.4s ease";
            curvesLayer.style.opacity = "0";
        }

        // 4. Grand Bazaar glides smoothly back to the center!
        if (state.rootNodeEl) {
            state.rootNodeEl.classList.add("is-animating");
            state.rootNodeEl.className = "mindmap-country-node state-center is-animating";
            state.rootNodeEl.style.opacity = "1";
            state.rootNodeEl.style.left = "50%";
            state.rootNodeEl.style.top = "48%";
        }

        // 5. Smoothly restore Level 1 exploration decor objects and hide Level 2 & 3 decor
        const decorLayer = document.getElementById("mindmapDecorLayer");
        if (decorLayer) {
            decorLayer.classList.remove("decor-hidden");
        }
        const decorLayerP2 = document.getElementById("mindmapDecorLayerP2");
        if (decorLayerP2) {
            decorLayerP2.classList.add("decor-hidden");
        }
        const decorLayerP3 = document.getElementById("mindmapDecorLayerP3");
        if (decorLayerP3) {
            decorLayerP3.classList.add("decor-hidden");
        }
        const decorLayerP3Corsair = document.getElementById("mindmapDecorLayerP3Corsair");
        if (decorLayerP3Corsair) {
            decorLayerP3Corsair.classList.add("decor-hidden");
        }

        // 5. Clean up DOM after transition
        setTimeout(() => {
            state.branchEls.forEach(({ el }) => el.remove());
            state.branchEls = [];
            state.leafEls.forEach(({ el }) => el.remove());
            state.leafEls = [];
            if (curvesLayer) {
                curvesLayer.innerHTML = "";
                curvesLayer.style.opacity = "1";
                curvesLayer.style.transition = "none";
            }
            if (state.rootNodeEl) {
                state.rootNodeEl.classList.remove("is-animating");
            }
            state.transitioning = false;
        }, 1600);
    }

    /* ----------------------------------------------------
       TRANSITION: Level 2 -> Level 3
       1. Clicked branch island glides smoothly to left (19%, 45%)
       2. Grand Bazaar glides off-screen left
       3. Unselected branch fades out
       4. Settle pause on left
       5. 3 route curves unroll to 3 leaves (staggered)
       6. When curves reach the points, leaf island sprites appear!
       7. Plaque cards fade and slide into position
    ---------------------------------------------------- */
    function transitionToLevelThree(selectedNode, selectedEl) {
        if (state.transitioning) return;
        state.transitioning = true;
        state.currentLevel = 3;
        state.selectedBranch = selectedNode;
        state.breadcrumbTrail = [state.rootNode, selectedNode];

        const nodesLayer = document.getElementById("mindmapNodesLayer");
        const curvesLayer = document.getElementById("mindmapCurvesLayer");
        if (!nodesLayer || !curvesLayer) return;

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        // 1. Update Logbook Breadcrumbs
        renderBreadcrumbs();

        // 2. Clear old curves IMMEDIATELY and synchronously, hide level 2 decor, and reveal correct Phase 3 decor
        cancelActiveVoyagers();
        curvesLayer.innerHTML = "";
        curvesLayer.style.opacity = "1";
        curvesLayer.style.transition = "none";
        const decorLayerP2 = document.getElementById("mindmapDecorLayerP2");
        if (decorLayerP2) {
            decorLayerP2.classList.add("decor-hidden");
        }
        const decorLayerP3 = document.getElementById("mindmapDecorLayerP3");
        const decorLayerP3Corsair = document.getElementById("mindmapDecorLayerP3Corsair");

        if (selectedNode.id === "apparel") {
            if (decorLayerP3) decorLayerP3.classList.add("decor-hidden");
            if (decorLayerP3Corsair) decorLayerP3Corsair.classList.remove("decor-hidden");
        } else {
            if (decorLayerP3) decorLayerP3.classList.remove("decor-hidden");
            if (decorLayerP3Corsair) decorLayerP3Corsair.classList.add("decor-hidden");
        }

        // 3. Grand Bazaar glides off-screen left
        if (state.rootNodeEl) {
            state.rootNodeEl.classList.add("is-animating");
            state.rootNodeEl.style.left = "-25%";
            state.rootNodeEl.style.opacity = "0";
        }

        // 4. Fade out unselected branch island
        state.branchEls.forEach(({ node, el }) => {
            if (node.id !== selectedNode.id) {
                el.classList.remove("sprite-revealed", "plaque-revealed");
                el.style.transition = "opacity 0.45s ease, transform 0.45s ease";
                el.style.opacity = "0";
                setTimeout(() => el.remove(), 500);
            }
        });

        // 5. Selected branch island glides smoothly to left anchor position (13.5%, 46.0%) matching reference image
        selectedEl.className = "mindmap-country-node state-left is-animating";
        selectedEl.style.left = "13.5%";
        selectedEl.style.top = "46.0%";

        // 6. Mount the 3 leaf islands on the right matching respective archipelago coordinates
        state.leafEls = [];
        const leaves = selectedNode.children || [];

        let leafConfigs;
        let routeConfigs;

        if (selectedNode.id === "apparel") {
            // Port of Corsair Apparel: Cutlass Cove, Velvet Isle, Booty Cay
            leafConfigs = [
                { node: leaves[0], coord: { x: 83.5, y: 15.5 }, color: "#f59e0b", colorClass: "amber", duration: 7600 }, // Cutlass Cove (Top Right - lowered clear of border)
                { node: leaves[1], coord: { x: 87.5, y: 41.5 }, color: "#38bdf8", colorClass: "blue", duration: 8000 },  // Velvet Isle (Middle Right)
                { node: leaves[2], coord: { x: 77.5, y: 73.5 }, color: "#f87171", colorClass: "coral", duration: 8400 }  // Booty Cay (Bottom Right)
            ];

            // Custom Curvy Routes Exactly Tracing Reference Image (Dodging Serpent, Shipwrecks, Arch, Atoll & Rocks)
            routeConfigs = [
                // Upper Route (Cutlass Cove): curves through orange waypoints under NW shipwreck, landing smoothly into lowered Cutlass Cove
                {
                    d: "M 170,280 C 200,280 235,255 270,221 C 320,190 395,160 452,136 C 510,100 540,68 591,67 C 650,65 715,78 776,85 C 788,88 798,93 808,98",
                    startX: 170, startY: 280, endX: 808, endY: 98,
                    color: "#f59e0b",
                    colorClass: "amber",
                    waypoints: [0.17, 0.46, 0.68, 0.95],
                    drawAnchor: true,
                    delay: 2050,
                    duration: 7600,
                    drawDuration: 1400
                },
                // Middle Route (Velvet Isle): curves above monster loop, across open strait into Velvet Isle
                {
                    d: "M 170,280 C 200,245 270,250 361,270 C 410,280 460,245 513,241 C 560,240 590,310 625,341 C 660,385 760,335 818,260 C 835,242 850,265 864,276",
                    startX: 170, startY: 280, endX: 864, endY: 276,
                    color: "#38bdf8",
                    colorClass: "blue",
                    waypoints: [0.27, 0.48, 0.69, 0.92],
                    drawAnchor: false,
                    delay: 2200,
                    duration: 8000,
                    drawDuration: 1500
                },
                // Lower Route (Booty Cay): curves between SW shipwreck & Green Atoll into Booty Cay
                {
                    d: "M 170,280 C 185,315 200,345 220,367 C 250,435 320,440 389,436 C 460,435 540,490 620,506 C 660,515 690,485 723,473 C 740,465 760,480 776,491",
                    startX: 170, startY: 280, endX: 776, endY: 491,
                    color: "#f87171",
                    colorClass: "coral",
                    waypoints: [0.10, 0.35, 0.67, 0.88],
                    drawAnchor: false,
                    delay: 2350,
                    duration: 8400,
                    drawDuration: 1600
                }
            ];
        } else {
            // Isle of Ancient Relics: Astrolabe Atoll, Chronos Cay, Kraken's Vault (Untouched!)
            leafConfigs = [
                { node: leaves[0], coord: { x: 84.0, y: 15.0 }, color: "#f59e0b", colorClass: "amber", duration: 7600 }, // Astrolabe Atoll
                { node: leaves[1], coord: { x: 86.5, y: 43.0 }, color: "#38bdf8", colorClass: "blue", duration: 8000 },  // Chronos Cay
                { node: leaves[2], coord: { x: 74.0, y: 78.0 }, color: "#f87171", colorClass: "coral", duration: 8400 }  // Kraken's Vault
            ];

            routeConfigs = [
                // Upper Route (Astrolabe Atoll)
                {
                    d: "M 195,275 C 260,205 335,155 430,145 C 525,135 620,95 780,95",
                    startX: 195, startY: 275, endX: 780, endY: 95,
                    color: "#f59e0b",
                    colorClass: "amber",
                    chevrons: [0.22, 0.50, 0.80],
                    drawAnchor: true,
                    delay: 2050,
                    duration: 7600,
                    drawDuration: 1400
                },
                // Middle Route (Chronos Cay)
                {
                    d: "M 195,285 C 270,245 360,235 460,235 C 550,235 640,260 715,268 C 750,272 780,270 810,270",
                    startX: 195, startY: 285, endX: 810, endY: 270,
                    color: "#38bdf8",
                    colorClass: "blue",
                    chevrons: [0.18, 0.48, 0.72, 0.90],
                    drawAnchor: false,
                    delay: 2050 + 150,
                    duration: 8000,
                    drawDuration: 1400
                },
                // Lower Route (Kraken's Vault)
                {
                    d: "M 205,345 C 240,375 275,405 340,415 C 410,425 460,490 540,490 C 600,490 650,490 700,495",
                    startX: 205, startY: 345, endX: 700, endY: 495,
                    color: "#f87171",
                    colorClass: "coral",
                    chevrons: [0.24, 0.56, 0.85],
                    drawAnchor: false,
                    delay: 2050 + 300,
                    duration: 8400,
                    drawDuration: 1400
                }
            ];
        }

        leafConfigs.forEach(({ node, coord }) => {
            if (!node) return;
            const leafEl = createCountryElement(node, "state-leaf is-animating", coord);
            leafEl.addEventListener("click", () => {
                // Navigate to the dedicated EJS view file for this island
                window.location.href = `/island/${node.id}`;
            });
            nodesLayer.appendChild(leafEl);
            state.leafEls.push({ node, el: leafEl });
        });

        if (prefersReducedMotion) {
            selectedEl.classList.remove("is-animating");
            state.leafEls.forEach(({ el }) => {
                el.classList.remove("is-animating");
                el.classList.add("sprite-revealed", "plaque-revealed");
            });
            routeConfigs.forEach((rc) => {
                drawAnimatedRoute(curvesLayer, {
                    ...rc,
                    drawDuration: 100,
                    delay: 0
                });
            });
            state.transitioning = false;
            return;
        }

        // Settle pause: branch island glides for 1750ms + 300ms quiet settle
        let completedLeaves = 0;
        const totalLeaves = leafConfigs.length;

        function checkLeavesSettled() {
            completedLeaves++;
            if (completedLeaves >= totalLeaves) {
                setTimeout(() => {
                    selectedEl.classList.remove("is-animating");
                    state.leafEls.forEach(({ el }) => el.classList.remove("is-animating"));
                    state.transitioning = false;
                }, 550);
            }
        }

        routeConfigs.forEach((rc, idx) => {
            drawAnimatedRoute(curvesLayer, {
                ...rc,
                onDestinationReached: (path) => {
                    const leafEl = state.leafEls[idx]?.el;
                    if (leafEl) {
                        // Phase 5: Island sprite materializes
                        leafEl.classList.add("sprite-revealed");

                        // Phase 6: Plaque card fades in and slides into position
                        setTimeout(() => {
                            leafEl.classList.add("plaque-revealed");
                            createVoyagerTraveler(curvesLayer, path, rc.duration, 200, rc.colorClass);
                            checkLeavesSettled();
                        }, 850);
                    } else {
                        checkLeavesSettled();
                    }
                }
            });
        });
    }

    /* ----------------------------------------------------
       TRANSITION: Return to Level 2 from Level 3
    ---------------------------------------------------- */
    function returnToLevelTwo() {
        if (state.transitioning) return;
        state.transitioning = true;
        state.currentLevel = 2;
        state.selectedBranch = null;
        state.breadcrumbTrail = [state.rootNode];

        const nodesLayer = document.getElementById("mindmapNodesLayer");
        const curvesLayer = document.getElementById("mindmapCurvesLayer");
        cancelActiveVoyagers();

        // 1. Update breadcrumbs
        renderBreadcrumbs();

        // Reveal Level 2 decor and ensure Level 1 & Level 3 decor are hidden
        const decorLayer = document.getElementById("mindmapDecorLayer");
        if (decorLayer) {
            decorLayer.classList.add("decor-hidden");
        }
        const decorLayerP2 = document.getElementById("mindmapDecorLayerP2");
        if (decorLayerP2) {
            decorLayerP2.classList.remove("decor-hidden");
        }
        const decorLayerP3 = document.getElementById("mindmapDecorLayerP3");
        if (decorLayerP3) {
            decorLayerP3.classList.add("decor-hidden");
        }
        const decorLayerP3Corsair = document.getElementById("mindmapDecorLayerP3Corsair");
        if (decorLayerP3Corsair) {
            decorLayerP3Corsair.classList.add("decor-hidden");
        }

        // 2. Hide and remove leaf islands
        state.leafEls.forEach(({ el }) => {
            el.classList.remove("sprite-revealed", "plaque-revealed");
            el.style.transition = "opacity 0.35s ease";
            el.style.opacity = "0";
            setTimeout(() => el.remove(), 400);
        });
        state.leafEls = [];

        // 3. Clear curves
        if (curvesLayer) {
            curvesLayer.innerHTML = "";
        }

        // 4. Grand Bazaar glides back to Phase 2 left anchor (17.5%, 46.5%)
        if (state.rootNodeEl) {
            state.rootNodeEl.classList.add("is-animating");
            state.rootNodeEl.style.opacity = "1";
            state.rootNodeEl.style.left = "17.5%";
            state.rootNodeEl.style.top = "46.5%";
            state.rootNodeEl.className = "mindmap-country-node state-left is-animating";
        }

        // 5. Re-render the 2 branch islands at Phase 2 coordinates
        state.branchEls.forEach(({ el }) => el.remove());
        state.branchEls = [];

        const branches = state.rootNode.children;
        const branchConfigs = [
            { node: branches[0], coord: { x: 71.0, y: 18.0 } }, // Isle of Ancient Relics
            { node: branches[1], coord: { x: 69.5, y: 71.5 } }  // Port of Corsair Apparel
        ];

        branchConfigs.forEach(({ node, coord }) => {
            const branchEl = createCountryElement(node, "state-branch sprite-revealed plaque-revealed", coord);
            branchEl.addEventListener("click", () => {
                if (state.transitioning) return;
                transitionToLevelThree(node, branchEl);
            });
            nodesLayer.appendChild(branchEl);
            state.branchEls.push({ node, el: branchEl });
        });

        // 6. Redraw Phase 2 routes with voyager loops
        drawAnimatedRoute(curvesLayer, {
            startX: 215, startY: 270,
            cp1X: 300, cp1Y: 215,
            cp2X: 450, cp2Y: 130,
            endX: 635, endY: 115,
            color: "#d49339",
            duration: 7200,
            drawDuration: 700,
            delay: 50,
            drawStartAnchor: true,
            waypoints: [0.26, 0.62, 0.92],
            onDestinationReached: (path) => {
                createVoyagerTraveler(curvesLayer, path, 7200, 200);
            }
        });

        drawAnimatedRoute(curvesLayer, {
            startX: 215, startY: 290,
            cp1X: 270, cp1Y: 310,
            cp2X: 410, cp2Y: 430,
            endX: 615, endY: 462,
            color: "#d49339",
            duration: 8000,
            drawDuration: 750,
            delay: 100,
            drawStartAnchor: false,
            waypoints: [0.12, 0.50, 0.76],
            onDestinationReached: (path) => {
                createVoyagerTraveler(curvesLayer, path, 8000, 400);
            }
        });

        setTimeout(() => {
            if (state.rootNodeEl) state.rootNodeEl.classList.remove("is-animating");
            state.transitioning = false;
        }, 800);
    }

    /* =====================================================
       5. CREATE DOM ELEMENT FOR COUNTRY NODE
    ====================================================== */
    function createCountryElement(nodeData, stateClass, coords) {
        const el = document.createElement("div");
        el.className = `mindmap-country-node ${stateClass}`;
        el.id = `node-${nodeData.id}`;
        el.style.left = `${coords.x}%`;
        el.style.top = `${coords.y}%`;
        el.setAttribute("data-lore", nodeData.desc);

        // Format multi-line title to match the reference image exactly
        let titleHtml = nodeData.name;
        if (nodeData.id === "relics") {
            titleHtml = "ISLE OF ANCIENT<br>RELICS";
        } else if (nodeData.id === "apparel") {
            titleHtml = "PORT OF CORSAIR<br>APPAREL";
        }

        // Top marker pin (e.g. compass rose pin on Ancient Relics, pirate flag on Corsair Apparel)
        const pinHtml = (nodeData.id === "relics") 
            ? `<div class="island-top-marker" title="Navigation Pin">🧭</div>` 
            : (nodeData.id === "apparel" ? `<div class="island-top-marker pirate-flag-marker" title="Jolly Roger Flag">🏴‍☠️</div>` : ``);

        el.innerHTML = `
            <div class="pirate-island-card">
                <!-- Top Pin Marker if present -->
                ${pinHtml}

                <!-- 3D Island Sprite with Subtle Dusty Antique Nautical Patina -->
                <div class="island-sprite-container">
                    <img src="${nodeData.image}" alt="${nodeData.name}" class="dusty-island-sprite" />
                </div>
                
                <!-- Carved Dusty Bronze Plaque (Matches Reference Image) -->
                <div class="dusty-bronze-plaque">
                    <div class="plaque-content">
                        <span class="plaque-badge">${nodeData.badge || "ISLE HARBOR"}</span>
                        <h4 class="plaque-title">${titleHtml}</h4>
                        <p class="plaque-subtitle">${nodeData.title}</p>
                        <div class="plaque-action-prompt">
                            ${nodeData.products ? "EXPLORE ISLAND ➔" : "CHART ROUTE ➔"}
                        </div>
                    </div>
                </div>
            </div>
        `;

        return el;
    }

    /* =====================================================
       6. DRAW CURVY DASHED ROUTE WITH SLOW VOYAGE ANIMATION
    ====================================================== */
    function drawAnimatedRoute(svgLayer, cfg) {
        const pathD = cfg.d || `M ${cfg.startX},${cfg.startY} C ${cfg.cp1X},${cfg.cp1Y} ${cfg.cp2X},${cfg.cp2Y} ${cfg.endX},${cfg.endY}`;
        const colorClass = cfg.colorClass || "amber";

        // 1. Defs & clipPath for progressive dashed drawing
        let defs = svgLayer.querySelector("defs");
        if (!defs) {
            defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            svgLayer.insertBefore(defs, svgLayer.firstChild);
        }

        const clipId = "route-clip-" + Math.random().toString(36).substr(2, 9);
        const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        clipPath.setAttribute("id", clipId);

        const maskPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        maskPath.setAttribute("d", pathD);
        maskPath.setAttribute("fill", "none");
        maskPath.setAttribute("stroke", "#ffffff");
        maskPath.setAttribute("stroke-width", "20");
        maskPath.setAttribute("stroke-linecap", "round");
        clipPath.appendChild(maskPath);
        defs.appendChild(clipPath);

        // 2. Curvy Dashed Path Line with clip-path applied
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathD);
        path.setAttribute("class", `mindmap-curvy-path route-${colorClass}`);
        path.setAttribute("clip-path", `url(#${clipId})`);
        path.setAttribute("stroke", cfg.color || "#d49339");
        path.style.setProperty("stroke", cfg.color || "#d49339", "important");
        path.style.setProperty("filter", `drop-shadow(0 0 7px ${cfg.color || "#d49339"})`, "important");
        path.setAttribute("stroke-width", "3.2");
        path.setAttribute("stroke-linecap", "round");
        svgLayer.appendChild(path);

        const totalLength = path.getTotalLength();
        maskPath.style.strokeDasharray = `${totalLength} ${totalLength}`;
        maskPath.style.strokeDashoffset = `${totalLength}`;

        // 3. Starting Glowing Anchor Node (at dock) - only if not already drawn
        if (cfg.drawStartAnchor !== false) {
            createAnchorNode(svgLayer, cfg.startX, cfg.startY, false, colorClass);
        }

        // 4. Directional Chevrons / Waypoint Beads along route (initially hidden)
        const chevronItems = [];
        if (Array.isArray(cfg.waypoints)) {
            cfg.waypoints.forEach(ratio => {
                const waypointGroup = createWaypointBead(svgLayer, path, ratio, true, colorClass);
                chevronItems.push({ ratio, el: waypointGroup, revealed: false, isWaypoint: true });
            });
        } else if (Array.isArray(cfg.chevrons)) {
            cfg.chevrons.forEach(ratio => {
                const chevronEl = createRouteChevron(svgLayer, path, ratio, colorClass, true);
                chevronItems.push({ ratio, el: chevronEl, revealed: false });
            });
        } else if (cfg.waypointRatio) {
            const waypointGroup = createWaypointBead(svgLayer, path, cfg.waypointRatio, true, colorClass);
            chevronItems.push({ ratio: cfg.waypointRatio, el: waypointGroup, revealed: false, isWaypoint: true });
        }

        // 5. Ending Glowing Anchor Node (at destination dock/shore) - initially hidden!
        const destAnchor = createAnchorNode(svgLayer, cfg.endX, cfg.endY, true, colorClass);

        // 6. Leading warm glowing navigation ember point
        const leadingEmber = document.createElementNS("http://www.w3.org/2000/svg", "g");
        leadingEmber.setAttribute("class", "route-lead-ember");
        leadingEmber.style.opacity = "0";
        const emberColor = colorClass === "blue" ? "#38bdf8" : (colorClass === "coral" ? "#f87171" : "#f59e0b");
        leadingEmber.innerHTML = `
            <circle r="7" fill="${colorClass === 'blue' ? 'rgba(56,189,248,0.35)' : (colorClass === 'coral' ? 'rgba(248,113,113,0.35)' : 'rgba(245,160,60,0.35)')}" />
            <circle r="3.2" fill="#ffffff" stroke="${emberColor}" stroke-width="1.2" filter="drop-shadow(0 0 5px ${emberColor})" />
        `;
        svgLayer.appendChild(leadingEmber);

        const startPt = path.getPointAtLength(0);
        leadingEmber.setAttribute("transform", `translate(${startPt.x}, ${startPt.y})`);

        const drawDur = cfg.drawDuration || 1500;
        const delay = cfg.delay || 0;
        let startTime = null;

        // Smooth cubic bezier easing
        function easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        function step(now) {
            if (!startTime) startTime = now;
            const elapsed = now - startTime;
            const rawProgress = Math.min(1, elapsed / drawDur);
            const progress = easeOutCubic(rawProgress);

            const curLength = progress * totalLength;
            maskPath.style.strokeDashoffset = `${totalLength - curLength}`;

            const pt = path.getPointAtLength(curLength);
            leadingEmber.setAttribute("transform", `translate(${pt.x}, ${pt.y})`);

            // Reveal intermediate chevrons / waypoints when route reaches their length
            chevronItems.forEach(item => {
                if (progress >= item.ratio && !item.revealed) {
                    item.revealed = true;
                    if (item.isWaypoint) {
                        item.el.classList.remove("waypoint-hidden");
                        item.el.classList.add("waypoint-revealed");
                    } else {
                        item.el.classList.remove("chevron-hidden");
                        item.el.classList.add("chevron-revealed");
                    }
                }
            });

            if (rawProgress < 1) {
                const frameId = requestAnimationFrame(step);
                state.activeVoyagerTimers.push(frameId);
            } else {
                // Reached destination!
                maskPath.style.strokeDashoffset = "0";
                path.removeAttribute("clip-path");
                if (clipPath.parentNode) clipPath.parentNode.removeChild(clipPath);

                // Leading ember softly merges into destination anchor
                leadingEmber.style.opacity = "0";
                setTimeout(() => {
                    if (leadingEmber.parentNode) leadingEmber.parentNode.removeChild(leadingEmber);
                }, 250);

                // Destination anchor ignites
                if (destAnchor) {
                    destAnchor.classList.remove("anchor-hidden");
                    destAnchor.classList.add("anchor-revealed");
                }

                // Trigger arrival callback
                if (typeof cfg.onDestinationReached === "function") {
                    cfg.onDestinationReached(path);
                }
            }
        }

        const timerId = setTimeout(() => {
            leadingEmber.style.opacity = "1";
            const frameId = requestAnimationFrame(step);
            state.activeVoyagerTimers.push(frameId);
        }, delay);
        state.activeVoyagerTimers.push(timerId);

        return { path, destAnchor };
    }

    function createRouteChevron(svgLayer, path, ratio, colorClass = "amber", startHidden = false) {
        const totalLength = path.getTotalLength();
        const curLength = ratio * totalLength;
        const pt = path.getPointAtLength(curLength);
        const lookAhead = Math.min(totalLength, curLength + 3);
        const ptNext = path.getPointAtLength(lookAhead);
        const angle = Math.atan2(ptNext.y - pt.y, ptNext.x - pt.x) * (180 / Math.PI);

        const chevron = document.createElementNS("http://www.w3.org/2000/svg", "g");
        chevron.setAttribute("transform", `translate(${pt.x}, ${pt.y}) rotate(${angle})`);
        chevron.setAttribute("class", `route-chevron-group chevron-${colorClass} ${startHidden ? "chevron-hidden" : "chevron-revealed"}`);

        const fillColor = colorClass === "blue" ? "#38bdf8" : (colorClass === "coral" ? "#f87171" : "#f59e0b");
        const strokeColor = colorClass === "blue" ? "#0369a1" : (colorClass === "coral" ? "#991b1b" : "#78350f");

        chevron.innerHTML = `
            <path d="M -7,-5 L 4,0 L -7,5 L -3,0 Z" class="chevron-arrow" style="fill: ${fillColor} !important; stroke: ${strokeColor} !important; filter: drop-shadow(0 0 6px ${fillColor}) !important;" />
        `;

        svgLayer.appendChild(chevron);
        return chevron;
    }

    function createAnchorNode(svgLayer, cx, cy, startHidden = false, colorClass = "amber") {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("transform", `translate(${cx}, ${cy})`);
        g.setAttribute("class", `glowing-dock-anchor anchor-${colorClass} ${startHidden ? "anchor-hidden" : "anchor-revealed"}`);

        const auraColor = colorClass === "blue" ? "rgba(56,189,248,0.35)" : (colorClass === "coral" ? "rgba(248,113,113,0.35)" : "rgba(245,160,60,0.35)");
        const ringColor = colorClass === "blue" ? "#38bdf8" : (colorClass === "coral" ? "#f87171" : "#d49339");
        const coreStroke = colorClass === "blue" ? "#0284c7" : (colorClass === "coral" ? "#dc2626" : "#ff9800");

        g.innerHTML = `
            <!-- Outer Radiant Aura -->
            <circle r="12" class="anchor-aura" style="fill: ${auraColor} !important;" />
            <!-- Ornate Brass Ring -->
            <circle r="8" class="anchor-ring-outer" style="stroke: ${ringColor} !important;" />
            <circle r="6" class="anchor-ring-inner" style="stroke: ${ringColor} !important;" />
            <!-- Cardinal Ticks -->
            <line x1="-10" y1="0" x2="-6" y2="0" class="anchor-tick" style="stroke: ${ringColor} !important;" />
            <line x1="6" y1="0" x2="10" y2="0" class="anchor-tick" style="stroke: ${ringColor} !important;" />
            <line x1="0" y1="-10" x2="0" y2="-6" class="anchor-tick" style="stroke: ${ringColor} !important;" />
            <line x1="0" y1="6" x2="0" y2="10" class="anchor-tick" style="stroke: ${ringColor} !important;" />
            <!-- Radiant Core -->
            <circle r="3.5" class="anchor-core" style="stroke: ${coreStroke} !important;" />
        `;

        svgLayer.appendChild(g);
        return g;
    }

    function createWaypointBead(svgLayer, path, ratio, startHidden = false, colorClass = "amber") {
        const pt = path.getPointAtLength(path.getTotalLength() * ratio);
        const bead = document.createElementNS("http://www.w3.org/2000/svg", "g");
        bead.setAttribute("transform", `translate(${pt.x}, ${pt.y})`);
        bead.setAttribute("class", `route-waypoint-group waypoint-${colorClass} ${startHidden ? "waypoint-hidden" : "waypoint-revealed"}`);

        const auraColor = colorClass === "blue" ? "rgba(56,189,248,0.4)" : (colorClass === "coral" ? "rgba(248,113,113,0.4)" : "rgba(245,160,60,0.4)");
        const ringColor = colorClass === "blue" ? "#38bdf8" : (colorClass === "coral" ? "#f87171" : "#f59e0b");

        bead.innerHTML = `
            <circle r="7" class="bead-halo" style="fill: ${auraColor};" />
            <circle r="4.2" class="bead-ring" style="fill: ${ringColor};" />
            <circle r="2.2" class="bead-core" style="fill: #ffffff;" />
        `;

        svgLayer.appendChild(bead);
        return bead;
    }

    /* ----------------------------------------------------
       SLOW VOYAGE ANIMATOR
       Travels smoothly from parent to child island along curve
    ---------------------------------------------------- */
    function createVoyagerTraveler(svgLayer, path, duration, startDelay, colorClass = "amber") {
        const traveler = document.createElementNS("http://www.w3.org/2000/svg", "g");
        traveler.setAttribute("class", `voyager-traveler voyager-${colorClass}`);

        traveler.innerHTML = `
            <!-- Outer Wave Ripple -->
            <circle r="10" class="voyager-ripple" />
            <!-- Directional Voyage Chevron Arrow -->
            <path d="M -7,-5 L 5,0 L -7,5 L -3,0 Z" class="voyager-arrow" />
            <!-- Glowing Beacon Light -->
            <circle r="3.5" class="voyager-beacon" />
        `;

        svgLayer.appendChild(traveler);

        const totalLength = path.getTotalLength();
        let startTime = null;

        function animate(now) {
            if (!startTime) startTime = now + startDelay;
            const elapsed = now - startTime;

            if (elapsed >= 0) {
                const progress = (elapsed % duration) / duration;
                const curLength = progress * totalLength;

                const pt = path.getPointAtLength(curLength);
                const lookAhead = Math.min(totalLength, curLength + 3);
                const ptNext = path.getPointAtLength(lookAhead);
                const angle = Math.atan2(ptNext.y - pt.y, ptNext.x - pt.x) * (180 / Math.PI);

                traveler.setAttribute("transform", `translate(${pt.x}, ${pt.y}) rotate(${angle})`);

                const opacity = progress < 0.08 ? (progress / 0.08) : (progress > 0.94 ? (1 - progress) / 0.06 : 1);
                traveler.style.opacity = opacity;
            }

            const frameId = requestAnimationFrame(animate);
            state.activeVoyagerTimers.push(frameId);
        }

        const initialFrame = requestAnimationFrame(animate);
        state.activeVoyagerTimers.push(initialFrame);
    }

    /* =====================================================
       7. LOGBOOK BREADCRUMB BAR (MATCHES DEMO EXACTLY)
    ====================================================== */
    function renderBreadcrumbs() {
        const bar = document.getElementById("mindmapBreadcrumbs");
        if (!bar) return;

        bar.innerHTML = "";

        if (state.currentLevel === 1) {
            bar.classList.remove("visible");
            return;
        }

        bar.classList.add("visible");

        // Container styled like the dark leather pill from the demo image
        const logbookBox = document.createElement("div");
        logbookBox.className = "demo-logbook-box";

        // Label: 📜 LOGBOOK:
        const label = document.createElement("span");
        label.className = "logbook-tag";
        label.innerHTML = `📜 LOGBOOK:`;
        logbookBox.appendChild(label);

        // Trail items
        state.breadcrumbTrail.forEach((crumb, idx) => {
            const item = document.createElement("button");
            item.className = "logbook-pill" + (idx === state.breadcrumbTrail.length - 1 ? " current" : "");
            item.innerHTML = `${crumb.icon || "⚓"} ${crumb.name.toUpperCase()}`;

            item.addEventListener("click", () => {
                if (idx === 0) {
                    returnToCapital();
                } else if (idx === 1 && state.currentLevel === 3) {
                    returnToLevelTwo();
                }
            });

            logbookBox.appendChild(item);

            if (idx < state.breadcrumbTrail.length - 1) {
                const sep = document.createElement("span");
                sep.className = "logbook-sep";
                sep.textContent = "➔";
                logbookBox.appendChild(sep);
            }
        });

        // ↺ RETURN TO CAPITAL button (Crimson leather/wax)
        if (state.currentLevel > 1) {
            const resetBtn = document.createElement("button");
            resetBtn.className = "logbook-return-btn";
            resetBtn.innerHTML = `↺ RETURN TO CAPITAL`;
            resetBtn.addEventListener("click", () => {
                returnToCapital();
            });
            logbookBox.appendChild(resetBtn);
        }

        bar.appendChild(logbookBox);
    }

    /* =====================================================
       8. E-COMMERCE PRODUCT MODAL & CARGO HOLD
    ====================================================== */
    function openProductModal(leafNode) {
        let modal = document.getElementById("cargoProductModal");
        if (!modal) {
            modal = createProductModal();
            document.body.appendChild(modal);
        }

        const titleEl = modal.querySelector(".modal-realm-title");
        const descEl = modal.querySelector(".modal-realm-desc");
        const gridEl = modal.querySelector(".modal-products-grid");

        titleEl.innerHTML = `${leafNode.icon || "⚓"} ${leafNode.name}`;
        descEl.textContent = leafNode.desc;
        gridEl.innerHTML = "";

        const products = leafNode.products || [];
        products.forEach(p => {
            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
                <div class="product-icon">${p.image}</div>
                <div class="product-info">
                    <h4>${p.name}</h4>
                    <p class="product-desc">${p.desc}</p>
                    <div class="product-meta">
                        <span class="product-price">🪙 ${p.price} Doubloons</span>
                        <span class="product-rating">${p.rating}</span>
                    </div>
                </div>
                <button class="btn-add-cargo" data-id="${p.id}">
                    Add to Cargo ⚓
                </button>
            `;

            card.querySelector(".btn-add-cargo").addEventListener("click", () => {
                addToCargo(p);
            });

            gridEl.appendChild(card);
        });

        modal.classList.add("open");
    }

    function createProductModal() {
        const modal = document.createElement("div");
        modal.id = "cargoProductModal";
        modal.className = "cargo-modal-backdrop";

        modal.innerHTML = `
            <div class="cargo-modal-frame">
                <button class="modal-close-btn">&times;</button>
                <div class="modal-header">
                    <span class="modal-badge">MERCHANT EMBARGO HARBOR</span>
                    <h3 class="modal-realm-title">Realm Products</h3>
                    <p class="modal-realm-desc"></p>
                </div>
                <div class="modal-products-grid"></div>
            </div>
        `;

        modal.querySelector(".modal-close-btn").addEventListener("click", () => {
            modal.classList.remove("open");
        });

        modal.addEventListener("click", (e) => {
            if (e.target === modal) modal.classList.remove("open");
        });

        return modal;
    }

    function addToCargo(product) {
        state.cart.push(product);
        updateCartUi();
        showToast(`⚓ "${product.name}" stowed in Cargo Hold!`);
    }

    function setupCartUi() {
        let cartBtn = document.getElementById("navCargoHoldBtn");
        if (!cartBtn) {
            const navLinks = document.querySelector(".nav-links");
            if (navLinks) {
                cartBtn = document.createElement("a");
                cartBtn.id = "navCargoHoldBtn";
                cartBtn.href = "#";
                cartBtn.className = "nav-cargo-btn";
                cartBtn.innerHTML = `🪙 Cargo Hold (<span id="cargoCount">0</span>)`;
                cartBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    toggleCargoDrawer();
                });
                navLinks.insertBefore(cartBtn, navLinks.querySelector("a[href='/logout']"));
            }
        }
    }

    function updateCartUi() {
        const count = document.getElementById("cargoCount");
        if (count) count.textContent = state.cart.length;

        const drawerList = document.getElementById("cargoDrawerList");
        const drawerTotal = document.getElementById("cargoTotalDoubloons");
        if (drawerList && drawerTotal) {
            drawerList.innerHTML = "";
            let total = 0;
            state.cart.forEach((item, index) => {
                total += item.price;
                const li = document.createElement("li");
                li.className = "cargo-drawer-item";
                li.innerHTML = `
                    <span>${item.image} ${item.name}</span>
                    <strong>🪙 ${item.price}</strong>
                    <button class="remove-cargo" data-idx="${index}">&times;</button>
                `;
                li.querySelector(".remove-cargo").addEventListener("click", () => {
                    state.cart.splice(index, 1);
                    updateCartUi();
                });
                drawerList.appendChild(li);
            });
            drawerTotal.textContent = `${total} Doubloons`;
        }
    }

    function toggleCargoDrawer() {
        let drawer = document.getElementById("cargoDrawer");
        if (!drawer) {
            drawer = createCargoDrawer();
            document.body.appendChild(drawer);
        }
        drawer.classList.toggle("open");
        updateCartUi();
    }

    function createCargoDrawer() {
        const drawer = document.createElement("div");
        drawer.id = "cargoDrawer";
        drawer.className = "cargo-drawer";

        drawer.innerHTML = `
            <div class="drawer-header">
                <h3>⚓ SHIP'S CARGO HOLD</h3>
                <button class="drawer-close">&times;</button>
            </div>
            <ul class="cargo-drawer-list" id="cargoDrawerList"></ul>
            <div class="drawer-footer">
                <div class="cargo-total-line">
                    <span>Total Bounty:</span>
                    <strong id="cargoTotalDoubloons">0 Doubloons</strong>
                </div>
                <button class="btn-checkout" onclick="alert('🏴‍☠️ Letter of Marque Issued! Goods will be delivered to your port coordinates.')">
                    Seal Trade Pact 📜
                </button>
            </div>
        `;

        drawer.querySelector(".drawer-close").addEventListener("click", () => {
            drawer.classList.remove("open");
        });

        return drawer;
    }

    function showToast(msg) {
        let toast = document.getElementById("pirateToast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "pirateToast";
            toast.className = "pirate-toast";
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add("show");
        setTimeout(() => {
            toast.classList.remove("show");
        }, 2800);
    }

    // Initialize on ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initMindMap);
    } else {
        initMindMap();
    }

})();
