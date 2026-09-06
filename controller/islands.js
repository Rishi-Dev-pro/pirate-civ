// =====================================================
// PIRATE ISLANDS DATA & CONTROLLER
// 6 Distinct Leaf Islands of Rishi's Cartographic Realm
// =====================================================

export const ISLANDS_DATA = {
    astrolabe: {
        id: "astrolabe",
        slug: "astrolabe",
        name: "Astrolabe Atoll",
        title: "Celestial Instruments & Navigation Wear",
        badge: "ASTRONOMICAL INSTRUMENTS",
        parentBranch: "relics",
        parentName: "Isle of Ancient Relics",
        icon: "🔭",
        image: "/images/island-astrolabe-dusty.png",
        coordinates: "18°42'N, 64°31'W",
        tradeWind: "ENE 18 Knots",
        dangerRating: "Low • Guarded by Cartographer Guild",
        desc: "Perched upon a calcified coral ring in the northern straits, Astrolabe Atoll is home to rogue royal astronomers and cartographers exiled for charting forbidden occult trade winds.",
        logbook: "Logbook of Captain Thorne: 'We moored in the outer lagoon under a crescent moon. The astronomers traded Seville brass sextants and sunstone lenses in exchange for fresh spring water and vanilla orchids.'",
        products: [
            {
                id: "astrolabe_1",
                name: "Gilded Celestial Astrolabe",
                price: 85,
                rating: "★★★★★",
                image: "/images/items/astrolabe-telescope.png",
                icon: "🔭",
                category: "navigation instruments",
                isNew: true,
                desc: "Forged in Seville, calibrated for navigation through the Devil's Triangle without magnetic drift."
            },
            {
                id: "astrolabe_2",
                name: "Brass Pocket Sextant",
                price: 42,
                rating: "★★★★★",
                image: "/images/items/astrolabe-sextant.png",
                icon: "🧭",
                category: "instruments navigation",
                isNew: true,
                desc: "Heavy antiqued brass with dual mirrors and engraved lunar distance tables."
            },
            {
                id: "astrolabe_3",
                name: "Triton's Spyglass",
                price: 68,
                rating: "★★★★★",
                image: "/images/items/astrolabe-globe.png",
                icon: "🌐",
                category: "navigation decoratives",
                isNew: true,
                desc: "30x magnification coated optics in hand-stitched buffalo leather."
            },
            {
                id: "astrolabe_4",
                name: "Star Chart Scroll",
                price: 55,
                rating: "★★★★★",
                image: "/images/items/astrolabe-scroll.png",
                icon: "📜",
                category: "charts decoratives",
                isNew: true,
                desc: "Hand-drawn equatorial star maps marking safe passages and hidden coves."
            }
        ]
    },

    chronos: {
        id: "chronos",
        slug: "chronos",
        name: "Chronos Cay",
        title: "Marine Horology & Timekeeping Wares",
        badge: "MARITIME HOROLOGY",
        parentBranch: "relics",
        parentName: "Isle of Ancient Relics",
        icon: "⏳",
        image: "/images/island-chronos-dusty.png",
        coordinates: "14°18'N, 71°22'W",
        tradeWind: "NE 14 Knots",
        dangerRating: "Moderate • Temporal Fog Squalls",
        desc: "Deep within the shrouded mist of Dead Man's Channel, Chronos Cay operates on synchronized pendulum clocks and brine-resistant spring escapements impervious to high-seas squalls.",
        logbook: "Logbook of Navigator Vance: 'No pendulum falters on this cay. The horologists tune their balance springs with whale-oil baths. The time measured here matches Greenwich to the exact fraction of a bell.'",
        products: [
            {
                id: "p4",
                name: "Gimbaled Marine Chronometer",
                price: 140,
                rating: "★★★★★",
                icon: "🕰️",
                desc: "Spring detent escapement housed inside solid mahogany lockbox with double brass gimbals."
            },
            {
                id: "p5",
                name: "Dead-Man's Sandglass",
                price: 30,
                rating: "★★★★☆",
                icon: "⏳",
                desc: "Filled with volcanic black sand from Port Royal. Measures exactly 30 minutes of pirate watch."
            },
            {
                id: "p5_cal",
                name: "Navigator's Perpetual Calendar",
                price: 52,
                rating: "★★★★★",
                icon: "📅",
                desc: "Hand-engraved copper dial calculating leap years, lunar phases, and high-tide intervals."
            },
            {
                id: "p5_sun",
                name: "Sunburst Pocket Sundial",
                price: 38,
                rating: "★★★★☆",
                icon: "☀️",
                desc: "Folding gnomon with integrated magnetic needle for rapid latitude correction."
            }
        ]
    },

    kraken_vault: {
        id: "kraken_vault",
        slug: "kraken_vault",
        name: "Kraken's Vault",
        title: "Abyssal Relics & Sunken Curiosities",
        badge: "CURSED RELICS & TREASURE",
        parentBranch: "relics",
        parentName: "Isle of Ancient Relics",
        icon: "🔮",
        image: "/images/island-kraken-dusty.png",
        coordinates: "09°55'N, 79°58'W",
        tradeWind: "SW 24 Knots (Gale warning)",
        dangerRating: "High • Abyssal Trench Creatures",
        desc: "A jagged basalt spire rising from an oceanic trench where an ancient leviathan rests. Deep-sea salvage divers bring up black pearls of impossible luster, eldritch amulets, and sunken galleon gold.",
        logbook: "Logbook of Diver Silas: 'We dropped the brass diving bell two hundred fathoms down. The trench was glowing with cold blue bioluminescence. We hauled up Spanish chests crushed by the pressure of monsters.'",
        products: [
            {
                id: "p6",
                name: "Abyssal Black Pearl Amulet",
                price: 195,
                rating: "★★★★★",
                icon: "🖤",
                desc: "18mm baroque black pearl encased in tentacle-wrought oxidized sterling silver setting."
            },
            {
                id: "p7",
                name: "Sunken Spanish Doubloon Medallion",
                price: 55,
                rating: "★★★★☆",
                icon: "🪙",
                desc: "Genuine 1692 gold escudo recovered from the seabed wreckage of the Florida Straits."
            },
            {
                id: "p7_charm",
                name: "Eldritch Leviathan Tooth Charm",
                price: 88,
                rating: "★★★★★",
                icon: "🦷",
                desc: "Scrimshaw-engraved cephalopod fang said to ward off rogue tidal waves and maelstroms."
            },
            {
                id: "p7_compass",
                name: "Cursed Mariner's Compass",
                price: 115,
                rating: "★★★★★",
                icon: "🧭",
                desc: "Its blackened needle points not to the poles, but toward the closest submerged hoard of gold."
            }
        ]
    },

    cutlass_cove: {
        id: "cutlass_cove",
        slug: "cutlass_cove",
        name: "Cutlass Cove",
        title: "Tempered Steel & Boarding Blades",
        badge: "CORSAIR WEAPONRY",
        parentBranch: "apparel",
        parentName: "Port of Corsair Apparel",
        icon: "🗡️",
        image: "/images/island-cutlass-dusty.png",
        coordinates: "22°15'N, 83°40'W",
        tradeWind: "E 20 Knots",
        dangerRating: "Moderate • Corsair Blacksmith Bastion",
        desc: "A fortified inlet resounding day and night with anvil clatter. Toledo and Damascus steels are folded, quenched in brine, and honed into lethal boarding sabres and parrying daggers.",
        logbook: "Logbook of Master Smith Morales: 'The cutlass must balance two finger-widths forward of the basket. A good boarding sabre will bite through ship rigging and hold its edge through forty skirmishes.'",
        products: [
            {
                id: "p8",
                name: "Toledo Steel Boarding Sabre",
                price: 110,
                rating: "★★★★★",
                icon: "⚔️",
                desc: "Curved 28-inch carbon steel blade with pierced brass basket hilt and stingray-skin grip."
            },
            {
                id: "p9",
                name: "Buccaneer Main-Gauche Dagger",
                price: 48,
                rating: "★★★★☆",
                icon: "🗡️",
                desc: "Wide parrying crossguard with hollow brass pommel concealing an antidote reservoir."
            },
            {
                id: "p9_cutlass",
                name: "Heavy Boarding Cutlass",
                price: 75,
                rating: "★★★★★",
                icon: "🔪",
                desc: "Broad heavy single-edged blade designed to cleave mooring lines and shatter enemy pikes."
            },
            {
                id: "p9_pistol",
                name: "Flintlock Dragon Blunderbuss",
                price: 135,
                rating: "★★★★★",
                icon: "💥",
                desc: "Engraved brass flared cannon muzzle delivering devastating scattershot across hostile decks."
            }
        ]
    },

    velvet_isle: {
        id: "velvet_isle",
        slug: "velvet_isle",
        name: "Velvet Isle",
        title: "Captains' Coats & Sea Lord Vestments",
        badge: "PIRATE LORDS' REGALIA",
        parentBranch: "apparel",
        parentName: "Port of Corsair Apparel",
        icon: "🧥",
        image: "/images/island-velvet-dusty.png",
        coordinates: "12°04'N, 68°14'W",
        tradeWind: "SE 16 Knots",
        dangerRating: "Low • Merchant Sovereign Haven",
        desc: "The tailoring sanctuary of the Caribbean. Seized Spanish brocades, Lyon velvets, and Dutch woolens are cut into waterproof longcoats, distressed tricorns, and storm cloaks fit for pirate admirals.",
        logbook: "Logbook of Quartermaster Drake: 'A corsair captain commands with his swagger as much as his blade. Velvet Isle stitched my sea-cloak from waxed damask; spray rolls off it like water off an oilskin canvas.'",
        products: [
            {
                id: "p10",
                name: "Crimson Silk Captain's Longcoat",
                price: 165,
                rating: "★★★★★",
                icon: "🧥",
                desc: "Heavy woven damask with antique brass filigree buttons and two concealed interior smuggler pockets."
            },
            {
                id: "p11",
                name: "Distressed Leather Tricorn Hat",
                price: 62,
                rating: "★★★★☆",
                icon: "🎩",
                desc: "Weatherproof waxed steerhide adorned with pheasant plumage and tarnished silver skull badge."
            },
            {
                id: "p11_vest",
                name: "Smuggler's Quilted Velvet Vest",
                price: 45,
                rating: "★★★★☆",
                icon: "🦺",
                desc: "Embroidered black velvet with five hidden coin slips sewn into the lining."
            },
            {
                id: "p11_cloak",
                name: "Corsair Weatherproof Sea Cloak",
                price: 82,
                rating: "★★★★★",
                icon: "🧣",
                desc: "Heavy boiled wool mantle infused with pine pitch to repel howling northern squalls."
            }
        ]
    },

    booty_cay: {
        id: "booty_cay",
        slug: "booty_cay",
        name: "Booty Cay",
        title: "Smugglers' Treasury & High-Stakes Booty",
        badge: "CORSAIR TREASURY",
        parentBranch: "apparel",
        parentName: "Port of Corsair Apparel",
        icon: "💰",
        image: "/images/island-booty-dusty.png",
        coordinates: "16°30'N, 88°20'W",
        tradeWind: "ENE 12 Knots",
        dangerRating: "Moderate • High-Stakes Gambling Den",
        desc: "The untamed banking and gambling island of buccaneers. Gold bullion bars, engraved sterling rum flasks, and loaded dice carved from kraken bone change hands under lantern-lit palm shacks.",
        logbook: "Logbook of Gambler Blackwood: 'The tavern on Booty Cay never sleeps. The stakes are bars of bullion and captured prize vessels. Drink the rum slow, keep your knife loose, and never trust a man rolling sixes.'",
        products: [
            {
                id: "p12",
                name: "Captain's Solid Silver Flask",
                price: 58,
                rating: "★★★★★",
                icon: "🍶",
                desc: "Engraved with nautical compass rose, watertight screw cap, holds 12oz of aged Jamaican rum."
            },
            {
                id: "p13",
                name: "Loaded Buccaneer Bone Dice Set",
                price: 28,
                rating: "★★★★☆",
                icon: "🎲",
                desc: "Set of five polished whalebone dice subtly weighted for high-stakes tavern wagers."
            },
            {
                id: "p13_chest",
                name: "Iron-Banded Oak Treasure Chest",
                price: 180,
                rating: "★★★★★",
                icon: "📦",
                desc: "Solid white oak coffer with dual padlock clasps and secret false bottom for navigation journals."
            },
            {
                id: "p13_rum",
                name: "Tortuga Cask of Dark Spiced Rum",
                price: 65,
                rating: "★★★★★",
                icon: "🍾",
                desc: "Aged 12 years in charred bourbon barrels; notes of clove, molasses, and vanilla smoke."
            }
        ]
    }
};

// Normalize aliases (hyphenated vs underscore)
const SLUG_MAP = {
    "astrolabe": "astrolabe",
    "astrolabe-atoll": "astrolabe",
    "chronos": "chronos",
    "chronos-cay": "chronos",
    "kraken_vault": "kraken_vault",
    "kraken-vault": "kraken_vault",
    "kraken": "kraken_vault",
    "cutlass_cove": "cutlass_cove",
    "cutlass-cove": "cutlass_cove",
    "cutlass": "cutlass_cove",
    "velvet_isle": "velvet_isle",
    "velvet-isle": "velvet_isle",
    "velvet": "velvet_isle",
    "booty_cay": "booty_cay",
    "booty-cay": "booty_cay",
    "booty": "booty_cay"
};

/**
 * Controller action: Render Island page by slug or param
 */
export const renderIslandPage = (targetSlug) => {
    return (req, res) => {
        const rawSlug = targetSlug || req.params.islandId || req.params.slug;
        const normalizedKey = SLUG_MAP[rawSlug] || rawSlug;
        const island = ISLANDS_DATA[normalizedKey];

        if (!island) {
            return res.status(404).render("home", {
                page_title: "Island Not Found",
                user: req.user,
                student_data: []
            });
        }

        // View name corresponds to normalizedKey: astrolabe, chronos, kraken_vault, cutlass_cove, velvet_isle, booty_cay
        const viewName = normalizedKey;

        res.render(viewName, {
            page_title: `${island.name} | Rishi's Web`,
            island: island,
            user: req.user
        });
    };
};
