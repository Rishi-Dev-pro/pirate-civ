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
                title: "Curiosities & Navigation",
                type: "archipelago",
                icon: "🧭",
                badge: "EXPEDITION REALM",
                desc: "Mysterious island ring where astronomers, salvage divers, and occult navigators trade rare relics.",
                image: "/images/island-ancient-relics-dusty.png",
                children: [
                    {
                        id: "astrolabe",
                        name: "Astrolabe Atoll",
                        title: "Navigational Instruments",
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
                        title: "Maritime Timepieces",
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
                        title: "Deep-Sea Talismans",
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
                title: "Garb, Blades & Finery",
                type: "archipelago",
                icon: "⚔️",
                badge: "BUCCANEER WARE",
                desc: "Raucous pirate haven specializing in weatherproof captains' coats, tempered steel, and swagger.",
                image: "/images/island-corsair-apparel-dusty.png",
                children: [
                    {
                        id: "cutlass_cove",
                        name: "Cutlass Cove",
                        title: "Blades & Armory",
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
                        title: "Coats & Fine Garb",
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
                        title: "Treasure & Doubloons",
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

        // Hide breadcrumbs initially
        renderBreadcrumbs();

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

        // 1. Clear any leftover voyagers and elements
        cancelActiveVoyagers();
        state.branchEls.forEach(({ el }) => el.remove());
        state.branchEls = [];
        state.leafEls.forEach(({ el }) => el.remove());
        state.leafEls = [];
        curvesLayer.innerHTML = "";

        // 2. Mount the 2 destination branch islands on the right (hidden by default CSS on .state-branch)
        const branches = state.rootNode.children;
        const branchConfigs = [
            { node: branches[0], coord: { x: 68.0, y: 28.5 } }, // Isle of Ancient Relics
            { node: branches[1], coord: { x: 67.0, y: 69.5 } }  // Port of Corsair Apparel
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
                state.rootNodeEl.style.left = "19.0%";
                state.rootNodeEl.style.top = "45.0%";
                state.rootNodeEl.style.opacity = "1";
            }
            state.branchEls.forEach(({ el }) => {
                el.classList.remove("is-animating");
                el.classList.add("sprite-revealed", "plaque-revealed");
            });
            drawAnimatedRoute(curvesLayer, {
                startX: 254, startY: 290, cp1X: 360, cp1Y: 270, cp2X: 480, cp2Y: 185, endX: 605, endY: 185,
                color: "#d49339", duration: 7200, drawDuration: 100, delay: 0, drawStartAnchor: true
            });
            drawAnimatedRoute(curvesLayer, {
                startX: 254, startY: 290, cp1X: 360, cp1Y: 320, cp2X: 480, cp2Y: 450, endX: 605, endY: 450,
                color: "#d49339", duration: 8000, drawDuration: 100, delay: 0, drawStartAnchor: false
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
                state.rootNodeEl.style.left = "19.0%";
                state.rootNodeEl.style.top = "45.0%";
                state.rootNodeEl.style.opacity = "1";
            }
        }, 150);
        state.activeVoyagerTimers.push(glideTimer);

        // PHASE 2 & 3: Grand Bazaar settles at 19%, 45% (~1.85s), then short settling pause (until 2.15s).
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
            startX: 254, startY: 290,
            cp1X: 360, cp1Y: 270,
            cp2X: 480, cp2Y: 185,
            endX: 605, endY: 185,
            color: "#d49339",
            duration: 7200,
            drawDuration: upperDuration,
            delay: settleDelay, // Starts at 2.15s
            drawStartAnchor: true,
            waypointRatio: 0.42,
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
            startX: 254, startY: 290,
            cp1X: 360, cp1Y: 320,
            cp2X: 480, cp2Y: 450,
            endX: 605, endY: 450,
            color: "#d49339",
            duration: 8000,
            drawDuration: lowerDuration,
            delay: settleDelay + 120, // Staggered by 120ms (starts at 2.27s)
            drawStartAnchor: false,
            waypointRatio: 0.42,
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

        // 2. Clear old curves IMMEDIATELY and synchronously
        cancelActiveVoyagers();
        curvesLayer.innerHTML = "";
        curvesLayer.style.opacity = "1";
        curvesLayer.style.transition = "none";

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

        // 5. Selected branch island glides smoothly to left anchor position (19%, 45%)
        selectedEl.className = "mindmap-country-node state-left is-animating";
        selectedEl.style.left = "19.0%";
        selectedEl.style.top = "45.0%";

        // 6. Mount the 3 leaf islands on the right (INITIALLY HIDDEN)
        state.leafEls = [];
        const leaves = selectedNode.children || [];
        const leafCoords = [
            { x: 68.0, y: 19.0 },
            { x: 68.0, y: 47.0 },
            { x: 68.0, y: 75.0 }
        ];

        leaves.forEach((leaf, idx) => {
            const coord = leafCoords[idx];
            const leafEl = createCountryElement(leaf, "state-leaf is-animating", coord);
            leafEl.addEventListener("click", () => {
                openProductModal(leaf);
            });
            nodesLayer.appendChild(leafEl);
            state.leafEls.push({ node: leaf, el: leafEl });
        });

        if (prefersReducedMotion) {
            selectedEl.classList.remove("is-animating");
            state.leafEls.forEach(({ el }) => {
                el.classList.remove("is-animating");
                el.classList.add("sprite-revealed", "plaque-revealed");
            });
            const leafTargets = [
                { y: 125, drawAnchor: true },
                { y: 305, drawAnchor: false },
                { y: 488, drawAnchor: false }
            ];
            leafTargets.forEach((t) => {
                drawAnimatedRoute(curvesLayer, {
                    startX: 254, startY: 290,
                    cp1X: 380, cp1Y: (290 + t.y) / 2,
                    cp2X: 485, cp2Y: t.y,
                    endX: 605, endY: t.y,
                    color: "#d49339",
                    duration: 7600,
                    drawDuration: 100,
                    delay: 0,
                    drawStartAnchor: t.drawAnchor
                });
            });
            state.transitioning = false;
            return;
        }

        // Settle pause: branch island glides for 1750ms + 300ms quiet settle
        const settleDelay = 2050;
        let completedLeaves = 0;
        const totalLeaves = leaves.length;

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

        const leafTargets = [
            { y: 125, delay: settleDelay, drawAnchor: true },
            { y: 305, delay: settleDelay + 120, drawAnchor: false },
            { y: 488, delay: settleDelay + 240, drawAnchor: false }
        ];

        leafTargets.forEach((t, idx) => {
            drawAnimatedRoute(curvesLayer, {
                startX: 254, startY: 290,
                cp1X: 380, cp1Y: (290 + t.y) / 2,
                cp2X: 485, cp2Y: t.y,
                endX: 605, endY: t.y,
                color: "#d49339",
                duration: 7600 + idx * 400,
                drawDuration: 1350,
                delay: t.delay,
                drawStartAnchor: t.drawAnchor,
                waypointRatio: 0.42,
                onDestinationReached: (path) => {
                    const leafEl = state.leafEls[idx]?.el;
                    if (leafEl) {
                        // Phase 5: Island sprite materializes
                        leafEl.classList.add("sprite-revealed");

                        // Phase 6: Plaque card fades in and slides into position
                        setTimeout(() => {
                            leafEl.classList.add("plaque-revealed");
                            createVoyagerTraveler(curvesLayer, path, 7600 + idx * 400, 200);
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

        // 4. Grand Bazaar glides back to left (19.0%, 45.0%)
        if (state.rootNodeEl) {
            state.rootNodeEl.classList.add("is-animating");
            state.rootNodeEl.style.opacity = "1";
            state.rootNodeEl.style.left = "19.0%";
            state.rootNodeEl.style.top = "45.0%";
            state.rootNodeEl.className = "mindmap-country-node state-left is-animating";
        }

        // 5. Re-render the 2 branch islands
        state.branchEls.forEach(({ el }) => el.remove());
        state.branchEls = [];

        const branches = state.rootNode.children;
        const branchConfigs = [
            { node: branches[0], coord: { x: 68.0, y: 28.5 } },
            { node: branches[1], coord: { x: 67.0, y: 69.5 } }
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

        // 6. Redraw routes
        drawAnimatedRoute(curvesLayer, {
            startX: 254, startY: 290,
            cp1X: 360, cp1Y: 270,
            cp2X: 480, cp2Y: 185,
            endX: 605, endY: 185,
            color: "#d49339",
            duration: 7200,
            drawDuration: 600,
            delay: 50,
            drawStartAnchor: true,
            onDestinationReached: (path) => {
                createVoyagerTraveler(curvesLayer, path, 7200, 200);
            }
        });

        drawAnimatedRoute(curvesLayer, {
            startX: 254, startY: 290,
            cp1X: 360, cp1Y: 320,
            cp2X: 480, cp2Y: 450,
            endX: 605, endY: 450,
            color: "#d49339",
            duration: 8000,
            drawDuration: 600,
            delay: 100,
            drawStartAnchor: false,
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

        // Top marker pin (e.g. compass rose pin on Ancient Relics in reference image)
        const pinHtml = (nodeData.id === "relics") 
            ? `<div class="island-top-marker" title="Navigation Pin">🧭</div>` 
            : ``;

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
                            ${nodeData.products ? "INSPECT CARGO ➔" : "CHART ROUTE ➔"}
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
        const pathD = `M ${cfg.startX},${cfg.startY} C ${cfg.cp1X},${cfg.cp1Y} ${cfg.cp2X},${cfg.cp2Y} ${cfg.endX},${cfg.endY}`;

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
        path.setAttribute("class", "mindmap-curvy-path");
        path.setAttribute("clip-path", `url(#${clipId})`);
        path.setAttribute("stroke", cfg.color || "#d49339");
        path.setAttribute("stroke-width", "3.2");
        path.setAttribute("stroke-linecap", "round");
        svgLayer.appendChild(path);

        const totalLength = path.getTotalLength();
        maskPath.style.strokeDasharray = `${totalLength} ${totalLength}`;
        maskPath.style.strokeDashoffset = `${totalLength}`;

        // 3. Starting Glowing Anchor Node (at dock) - only if not already drawn
        if (cfg.drawStartAnchor !== false) {
            createAnchorNode(svgLayer, cfg.startX, cfg.startY, false);
        }

        // 4. Intermediate waypoint bead (initially hidden)
        const waypointRatio = cfg.waypointRatio || 0.42;
        const waypointGroup = createWaypointBead(svgLayer, path, waypointRatio, true);

        // 5. Ending Glowing Anchor Node (at destination dock/shore) - initially hidden!
        const destAnchor = createAnchorNode(svgLayer, cfg.endX, cfg.endY, true);

        // 6. Leading warm glowing navigation ember point
        const leadingEmber = document.createElementNS("http://www.w3.org/2000/svg", "g");
        leadingEmber.setAttribute("class", "route-lead-ember");
        leadingEmber.style.opacity = "0";
        leadingEmber.innerHTML = `
            <circle r="7" fill="rgba(245, 160, 60, 0.35)" />
            <circle r="3.2" fill="#fff3d0" stroke="#f59e0b" stroke-width="1.2" filter="drop-shadow(0 0 5px #ffb300)" />
        `;
        svgLayer.appendChild(leadingEmber);

        const startPt = path.getPointAtLength(0);
        leadingEmber.setAttribute("transform", `translate(${startPt.x}, ${startPt.y})`);

        const drawDur = cfg.drawDuration || 1500;
        const delay = cfg.delay || 0;
        let startTime = null;
        let waypointRevealed = false;

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

            // Reveal intermediate waypoint bead when route passes it
            if (progress >= waypointRatio && !waypointRevealed) {
                waypointRevealed = true;
                if (waypointGroup) {
                    waypointGroup.classList.remove("waypoint-hidden");
                    waypointGroup.classList.add("waypoint-revealed");
                }
            }

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

    function createAnchorNode(svgLayer, cx, cy, startHidden = false) {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("transform", `translate(${cx}, ${cy})`);
        g.setAttribute("class", `glowing-dock-anchor ${startHidden ? "anchor-hidden" : "anchor-revealed"}`);

        g.innerHTML = `
            <!-- Outer Golden Aura -->
            <circle r="12" class="anchor-aura" />
            <!-- Ornate Brass Ring -->
            <circle r="8" class="anchor-ring-outer" />
            <circle r="6" class="anchor-ring-inner" />
            <!-- Cardinal Ticks -->
            <line x1="-10" y1="0" x2="-6" y2="0" class="anchor-tick" />
            <line x1="6" y1="0" x2="10" y2="0" class="anchor-tick" />
            <line x1="0" y1="-10" x2="0" y2="-6" class="anchor-tick" />
            <line x1="0" y1="6" x2="0" y2="10" class="anchor-tick" />
            <!-- Radiant Core -->
            <circle r="3.5" class="anchor-core" />
        `;

        svgLayer.appendChild(g);
        return g;
    }

    function createWaypointBead(svgLayer, path, ratio, startHidden = false) {
        const pt = path.getPointAtLength(path.getTotalLength() * ratio);
        const bead = document.createElementNS("http://www.w3.org/2000/svg", "g");
        bead.setAttribute("transform", `translate(${pt.x}, ${pt.y})`);
        bead.setAttribute("class", `route-waypoint-group ${startHidden ? "waypoint-hidden" : "waypoint-revealed"}`);

        bead.innerHTML = `
            <circle r="5" class="bead-halo" />
            <circle r="2.8" class="bead-core" />
        `;

        svgLayer.appendChild(bead);
        return bead;
    }

    /* ----------------------------------------------------
       SLOW VOYAGE ANIMATOR
       Travels smoothly from parent to child island along curve
    ---------------------------------------------------- */
    function createVoyagerTraveler(svgLayer, path, duration, startDelay) {
        const traveler = document.createElementNS("http://www.w3.org/2000/svg", "g");
        traveler.setAttribute("class", "voyager-traveler");

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
