// =====================================================
// PIRATE ISLANDS DATA & CONTROLLER
// 6 Distinct Leaf Islands of Rishi's Cartographic Realm
// =====================================================

import Product from "../models/product.js";

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
        title: "Footwear from across time",
        badge: "HOROLOGY",
        parentBranch: "relics",
        parentName: "Isle of Ancient Relics",
        icon: "🧭",
        image: "/images/island-chronos-dusty.png",
        coordinates: "14°18'N, 71°22'W",
        tradeWind: "NE 14 Knots",
        dangerRating: "Moderate • Temporal Fog Squalls",
        desc: "Footwear from across time",
        logbook: "Logbook of Navigator Vance: 'No pendulum falters on this cay. The horologists tune their balance springs with whale-oil baths. The time measured here matches Greenwich to the exact fraction of a bell.'",
        products: [
            {
                id: "chronos_1",
                name: "AEON STRIDER SANDALS",
                price: 85,
                rating: "★★★★★",
                image: "/images/items/chronos-sandals.png",
                icon: "👡",
                category: "sandals casual",
                isNew: true,
                desc: "Timeless comfort for endless journeys."
            },
            {
                id: "chronos_2",
                name: "SKYWARD SNEAKERS",
                price: 92,
                rating: "★★★★★",
                image: "/images/items/chronos-sneakers.png",
                icon: "👟",
                category: "sneakers casual",
                isNew: true,
                desc: "Lightweight. Limitless. Beyond time."
            },
            {
                id: "chronos_3",
                name: "CHRONO RANGER BOOTS",
                price: 120,
                rating: "★★★★★",
                image: "/images/items/chronos-ranger-boots.png",
                icon: "🥾",
                category: "boots adventure",
                isNew: true,
                desc: "Built for explorers of forgotten eras."
            },
            {
                id: "chronos_4",
                name: "TEMPUS FORMAL SHOES",
                price: 98,
                rating: "★★★★★",
                image: "/images/items/chronos-formal.png",
                icon: "👞",
                category: "formal",
                isNew: true,
                desc: "Elegance that never ages."
            },
            {
                id: "chronos_5",
                name: "ISLANDER LOAFERS",
                price: 76,
                rating: "★★★★★",
                image: "/images/items/chronos-loafers.png",
                icon: "🥿",
                category: "casual formal",
                isNew: true,
                desc: "Relaxed steps. Eternal style."
            },
            {
                id: "chronos_6",
                name: "VOYAGER TRAIL BOOTS",
                price: 110,
                rating: "★★★★★",
                image: "/images/items/chronos-trail-boots.png",
                icon: "🥾",
                category: "boots adventure",
                isNew: true,
                desc: "For paths unknown."
            }
        ]
    },

    kraken_vault: {
        id: "kraken_vault",
        slug: "kraken_vault",
        name: "Kraken's Vault",
        title: "Abyssal Relics & Sunken Curiosities",
        badge: "CURSED RELICS",
        parentBranch: "relics",
        parentName: "Isle of Ancient Relics",
        icon: "🔱",
        image: "/images/island-kraken-dusty.png",
        coordinates: "09°55'N, 79°58'W",
        tradeWind: "SW 24 Knots (Gale warning)",
        dangerRating: "High • Abyssal Trench Creatures",
        desc: "Accessories from the depths",
        logbook: "Logbook of Diver Silas: 'We dropped the brass diving bell two hundred fathoms down. The trench was glowing with cold blue bioluminescence. We hauled up Spanish chests crushed by the pressure of monsters.'",
        products: [
            {
                id: "kraken_1",
                name: "DEPTHSEEKER AMULET",
                price: 85,
                rating: "★★★★★",
                image: "/images/items/kraken-amulet.png",
                icon: "🔱",
                category: "amulets relics artifacts",
                isNew: true,
                desc: "A fathom-forged amulet said to guide its wearer through the darkest trenches."
            },
            {
                id: "kraken_2",
                name: "KRAKENBANE RING",
                price: 42,
                rating: "★★★★★",
                image: "/images/items/kraken-ring.png",
                icon: "💍",
                category: "rings trinkets relics",
                isNew: true,
                desc: "Engraved with ancient runes, this ring is said to ward off the creatures of the abyss."
            },
            {
                id: "kraken_3",
                name: "ABYSSAL CHARM",
                price: 68,
                rating: "★★★★★",
                image: "/images/items/kraken-charm.png",
                icon: "🦷",
                category: "charms relics trinkets",
                isNew: true,
                desc: "A mysterious charm infused with the whispers of the deep."
            },
            {
                id: "kraken_4",
                name: "SUNKEN RELIC ORB",
                price: 55,
                rating: "★★★★★",
                image: "/images/items/kraken-orb.png",
                icon: "🔮",
                category: "relics artifacts trinkets",
                isNew: true,
                desc: "A fragment of a forgotten civilization, pulsing with unknown energy."
            }
        ]
    },

    cutlass_cove: {
        id: "cutlass_cove",
        slug: "cutlass_cove",
        name: "Cutlass Cove",
        title: "ELECTRONICS",
        badge: "WEAPONRY",
        parentBranch: "apparel",
        parentName: "Port of Corsair Apparel",
        icon: "🧭",
        image: "/images/island-cutlass-dusty.png",
        coordinates: "22°15'N, 83°40'W",
        tradeWind: "E 20 Knots",
        dangerRating: "Moderate • Corsair Blacksmith Bastion",
        desc: "Innovative tools for modern explorers. Power your journey.",
        logbook: "Logbook of Master Smith Morales: 'The cutlass must balance two finger-widths forward of the basket. A good boarding sabre will bite through ship rigging and hold its edge through forty skirmishes.'",
        products: [
            {
                id: "cutlass_1",
                name: "STORMFURY HEADPHONES",
                price: 120,
                rating: "★★★★★",
                image: "/images/items/cutlass-headphones.png",
                icon: "🎧",
                category: "audio accessories smart",
                isNew: true,
                desc: "Immersive sound for every voyage."
            },
            {
                id: "cutlass_2",
                name: "TIDALIS GAMING MOUSE",
                price: 85,
                rating: "★★★★★",
                image: "/images/items/cutlass-mouse.png",
                icon: "🖱️",
                category: "gaming computing accessories",
                isNew: true,
                desc: "Precision in every move."
            },
            {
                id: "cutlass_3",
                name: "CORSAIR MECHANICAL KEYBOARD",
                price: 140,
                rating: "★★★★★",
                image: "/images/items/cutlass-keyboard.png",
                icon: "⌨️",
                category: "computing gaming accessories",
                isNew: true,
                desc: "Built for relentless explorers."
            },
            {
                id: "cutlass_4",
                name: "VOYAGER PRO CAMERA",
                price: 160,
                rating: "★★★★★",
                image: "/images/items/cutlass-camera.png",
                icon: "📷",
                category: "cameras smart accessories",
                isNew: true,
                desc: "Capture the world beyond."
            },
            {
                id: "cutlass_5",
                name: "SKYWARD DRONE",
                price: 180,
                rating: "★★★★★",
                image: "/images/items/cutlass-drone.png",
                icon: "🛸",
                category: "drones smart gadgets",
                isNew: true,
                desc: "Explore higher vantage points."
            },
            {
                id: "cutlass_6",
                name: "HORIZON POWERBANK",
                price: 70,
                rating: "★★★★★",
                image: "/images/items/cutlass-powerbank.png",
                icon: "🔋",
                category: "power accessories smart",
                isNew: true,
                desc: "Stay powered. Anywhere."
            }
        ]
    },

    velvet_isle: {
        id: "velvet_isle",
        slug: "velvet_isle",
        name: "Velvet Isle",
        title: "HOME & LIVING",
        badge: "ELEVATE EVERY SPACE",
        parentBranch: "apparel",
        parentName: "Port of Corsair Apparel",
        icon: "🌿",
        image: "/images/velvet-bg.jpg",
        coordinates: "12°04'N, 68°14'W",
        tradeWind: "SE 16 Knots",
        dangerRating: "Low • Serene Haven Resort",
        desc: "Timeless living for modern explorers. Discover decor, furniture, textiles and more from the serene shores of Velvet Isle.",
        logbook: "Logbook of Navigator Vance: 'Past the cascading waterfall arches lies Velvet Isle, where master woodcrafters and weavers craft tranquil sanctums from teak, rattan, and linen.'",
        products: [
            {
                id: "velvet_1",
                name: "VELVET LOUNGE SOFA",
                price: "24,999",
                priceNum: 24999,
                rating: "★★★★☆",
                image: "/images/items/velvet-sofa.png",
                icon: "🛋️",
                category: "furniture decor living all",
                subTitle: "Modern Comfort",
                isNew: true,
                desc: "Modern Comfort"
            },
            {
                id: "velvet_2",
                name: "ISLAND WOOD COFFEE TABLE",
                price: "8,999",
                priceNum: 8999,
                rating: "★★★★★",
                image: "/images/items/velvet-table.png",
                icon: "🪵",
                category: "furniture decor living all",
                subTitle: "Rustic Elegance",
                isNew: true,
                desc: "Rustic Elegance"
            },
            {
                id: "velvet_3",
                name: "COASTAL PENDANT LAMP",
                price: "4,499",
                priceNum: 4499,
                rating: "★★★★☆",
                image: "/images/items/velvet-pendant.png",
                icon: "💡",
                category: "lighting decor living all",
                subTitle: "Warm & Tranquil",
                isNew: true,
                desc: "Warm & Tranquil"
            },
            {
                id: "velvet_4",
                name: "VELVET LINEN SET",
                price: "5,999",
                priceNum: 5999,
                rating: "★★★★☆",
                image: "/images/items/velvet-bed.png",
                icon: "🛏️",
                category: "bedding furnishings decor all",
                subTitle: "Pure Comfort",
                isNew: true,
                desc: "Pure Comfort"
            },
            {
                id: "velvet_5",
                name: "CERAMIC DECOR VASE",
                price: "2,499",
                priceNum: 2499,
                rating: "★★★★★",
                image: "/images/items/velvet-vase.png",
                icon: "🏺",
                category: "decor living plants all",
                subTitle: "Artisan Craft",
                isNew: true,
                desc: "Artisan Craft"
            },
            {
                id: "velvet_6",
                name: "ISLE AREA RUG",
                price: "3,999",
                priceNum: 3999,
                rating: "★★★★☆",
                image: "/images/items/velvet-rug.png",
                icon: "🧶",
                category: "rugs furnishings decor living all",
                subTitle: "Coastal Charm",
                isNew: true,
                desc: "Coastal Charm"
            }
        ]
    },

    booty_cay: {
        id: "booty_cay",
        slug: "booty_cay",
        name: "Booty Cay",
        title: "BEAUTY",
        badge: "TREASURY",
        parentBranch: "apparel",
        parentName: "Port of Corsair Apparel",
        icon: "✨",
        image: "/images/booty-bg.jpg",
        coordinates: "16°30'N, 88°20'W",
        tradeWind: "ENE 12 Knots",
        dangerRating: "Low • Enchanted Skull Cove Retreat",
        desc: "Discover treasures that bring out your true beauty.",
        logbook: "Logbook of Corsair Alchemist: 'Past the waterfall cascades of Skull Mountain lies the secret cove of luminous pearls, tropical botanicals, and oceanic elixirs.'",
        products: [
            {
                id: "booty_1",
                name: "OCEAN BLOSSOM",
                price: "1,299",
                priceNum: 1299,
                rating: "★★★★☆",
                image: "/images/items/booty-perfume.png",
                icon: "🏺",
                category: "fragrances luxury natural gift all",
                subTitle: "Eau De Parfum",
                isNew: true,
                desc: "Eau De Parfum"
            },
            {
                id: "booty_2",
                name: "RADIANCE GLOW CREAM",
                price: "899",
                priceNum: 899,
                rating: "★★★★★",
                image: "/images/items/booty-cream.png",
                icon: "🧴",
                category: "skincare bodycare natural luxury all",
                subTitle: "For Luminous Skin",
                isNew: true,
                desc: "For Luminous Skin"
            },
            {
                id: "booty_3",
                name: "VELVET KISS",
                price: "749",
                priceNum: 749,
                rating: "★★★★★",
                image: "/images/items/booty-lipstick.png",
                icon: "💄",
                category: "makeup luxury gift all",
                subTitle: "Matte Lipstick",
                isNew: true,
                desc: "Matte Lipstick"
            },
            {
                id: "booty_4",
                name: "ISLAND ELIXIR",
                price: "1,199",
                priceNum: 1199,
                rating: "★★★★☆",
                image: "/images/items/booty-serum.png",
                icon: "🧴",
                category: "skincare natural luxury all",
                subTitle: "Face Serum",
                isNew: true,
                desc: "Face Serum"
            },
            {
                id: "booty_5",
                name: "TREASURE PALETTE",
                price: "999",
                priceNum: 999,
                rating: "★★★★★",
                image: "/images/items/booty-palette.png",
                icon: "🎨",
                category: "makeup tools gift luxury all",
                subTitle: "Eyeshadow Collection",
                isNew: true,
                desc: "Eyeshadow Collection"
            },
            {
                id: "booty_6",
                name: "TROPICAL BLISS",
                price: "599",
                priceNum: 599,
                rating: "★★★★★",
                image: "/images/items/booty-scrub.png",
                icon: "🛁",
                category: "bodycare skincare natural all",
                subTitle: "Body Scrub",
                isNew: true,
                desc: "Body Scrub"
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
 * Controller action: Render Island page by slug or param with MongoDB-backed products
 */
export const renderIslandPage = (targetSlug) => {
    return async (req, res) => {
        try {
            const rawSlug = targetSlug || req.params.islandId || req.params.slug;
            const normalizedKey = SLUG_MAP[rawSlug] || rawSlug;
            const islandMeta = ISLANDS_DATA[normalizedKey];

            if (!islandMeta) {
                return res.status(404).render("home", {
                    page_title: "Island Not Found",
                    user: req.user
                });
            }

            // Query canonical products from MongoDB
            let products = [];
            try {
                const dbProducts = await Product.find({
                    island: normalizedKey,
                    isAvailable: true
                }).sort({ createdAt: 1 });

                products = dbProducts.map(p => ({
                    id: p._id.toString(),
                    _id: p._id,
                    name: p.name,
                    slug: p.slug,
                    price: p.price,
                    priceNum: p.price,
                    desc: p.description,
                    description: p.description,
                    image: p.image,
                    island: p.island,
                    category: p.category,
                    stock: p.stock,
                    isAvailable: p.isAvailable,
                    rating: p.rating,
                    seller: p.seller
                }));
            } catch (dbErr) {
                console.error("Database query error in renderIslandPage:", dbErr.message);
                products = [];
            }

            const island = {
                ...islandMeta,
                products: products
            };

            // View name corresponds to normalizedKey: astrolabe, chronos, kraken_vault, cutlass_cove, velvet_isle, booty_cay
            const viewName = normalizedKey;

            res.render(viewName, {
                page_title: `${island.name} | Rishi's Web`,
                island: island,
                user: req.user
            });
        } catch (error) {
            console.error("Error rendering island page:", error);
            res.status(500).render("home", {
                page_title: "Archipelago Error",
                user: req.user
            });
        }
    };
};
