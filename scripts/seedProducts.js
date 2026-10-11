import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import Product from "../models/product.js";
import User from "../models/user.js";
import { ISLANDS_DATA } from "../controller/islands.js";

dotenv.config();

/* =========================================================
   CANONICAL TAXONOMY MAPPER
   Maps island keys to the 3 canonical trading branches
========================================================= */

export const ISLAND_CATEGORY_MAP = {
    astrolabe: "relics",
    chronos: "relics",
    kraken_vault: "relics",
    cutlass_cove: "apparel",
    velvet_isle: "apparel",
    booty_cay: "provisions"
};

/**
 * Generate a deterministic URL-safe kebab-case slug from product name.
 * @param {string} name
 * @returns {string}
 */
export function generateDeterministicSlug(name) {
    if (!name) return "";
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/**
 * Extract and normalize all hardcoded products from ISLANDS_DATA.
 * @returns {Array<Object>}
 */
export function extractSourceProducts() {
    const extracted = [];

    for (const [islandKey, islandObj] of Object.entries(ISLANDS_DATA)) {
        if (!islandObj || !Array.isArray(islandObj.products)) continue;

        const canonicalIsland = islandKey;
        const canonicalCategory = ISLAND_CATEGORY_MAP[islandKey] || "relics";

        for (const rawItem of islandObj.products) {
            if (!rawItem || !rawItem.name) continue;

            let parsedPrice = 0;
            if (rawItem.priceNum !== undefined) {
                parsedPrice = Number(rawItem.priceNum);
            } else if (typeof rawItem.price === "number") {
                parsedPrice = rawItem.price;
            } else if (typeof rawItem.price === "string") {
                parsedPrice = parseInt(rawItem.price.replace(/,/g, "").trim(), 10) || 0;
            }

            const cleanDesc = (rawItem.desc || rawItem.description || rawItem.subTitle || rawItem.name).trim();
            const cleanImage = (rawItem.image || "/images/items/default-relic.png").trim();
            const cleanRating = (rawItem.rating || "★★★★★").trim();
            const deterministicSlug = generateDeterministicSlug(rawItem.name);

            extracted.push({
                legacyId: rawItem.id,
                name: rawItem.name.trim(),
                slug: deterministicSlug,
                price: parsedPrice,
                description: cleanDesc,
                image: cleanImage,
                island: canonicalIsland,
                category: canonicalCategory,
                stock: typeof rawItem.stock === "number" ? rawItem.stock : 15, // Canonical initial seed stock
                isAvailable: rawItem.isAvailable !== undefined ? Boolean(rawItem.isAvailable) : true,
                rating: cleanRating
            });
        }
    }

    return extracted;
}

/**
 * Find or create the canonical merchant: Grand Admiralty Cartographers.
 * Ensures the merchant is uniquely registered with role: 'seller'.
 *
 * @returns {Promise<User>}
 */
export async function getOrCreateCanonicalMerchant() {
    let merchant = await User.findOne({
        $or: [
            { email: "admiralty@pirate-civ.internal" },
            { storeName: "Grand Admiralty Cartographers" }
        ]
    });

    if (!merchant) {
        merchant = await User.create({
            name: "Grand Admiralty Cartographers",
            email: "admiralty@pirate-civ.internal",
            password: "$2b$12$eXAMP1eH4sh3dPassw0rdF0rAdmiraltyMerchant1234567890", // pre-hashed placeholder
            authSecretHash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
            role: "seller",
            storeName: "Grand Admiralty Cartographers",
            homeIsland: "astrolabe",
            bio: "The Grand Admiralty Cartographers maintain the sovereign charts, relics, and provisions across the archipelago."
        });
    } else {
        let needsSave = false;
        if (merchant.role !== "seller") {
            merchant.role = "seller";
            needsSave = true;
        }
        if (merchant.storeName !== "Grand Admiralty Cartographers") {
            merchant.storeName = "Grand Admiralty Cartographers";
            needsSave = true;
        }
        if (needsSave) {
            await merchant.save();
        }
    }

    return merchant;
}

/**
 * Execute controlled idempotent migration of hardcoded products into MongoDB.
 *
 * @param {Object} [options={}]
 * @param {string} [options.connectionUri]
 * @param {boolean} [options.silent=false]
 * @param {boolean} [options.disconnectOnFinish=true]
 * @returns {Promise<Object>} Migration summary
 */
export async function migrateProducts(options = {}) {
    const {
        connectionUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pirate-civ",
        silent = false,
        disconnectOnFinish = true
    } = options;

    let internallyConnected = false;
    if (mongoose.connection.readyState !== 1) {
        if (!silent) console.log(`🔌 Connecting to MongoDB: ${connectionUri}`);
        await mongoose.connect(connectionUri);
        internallyConnected = true;
    }

    const log = (...args) => {
        if (!silent) console.log(...args);
    };

    try {
        log("🏴‍☠️ Starting Controlled Product Migration (Milestone 2.5)...");

        // 1. Resolve Canonical Merchant
        const merchant = await getOrCreateCanonicalMerchant();
        log(`⚓ Canonical Merchant Resolved: ${merchant.storeName} (${merchant.email}) [ID: ${merchant._id}]`);

        // 2. Extract Source Catalog
        const sourceProducts = extractSourceProducts();
        log(`📦 Source Catalog Extracted: ${sourceProducts.length} items`);

        let createdCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;
        let failedCount = 0;

        // 3. Idempotent Upsert Loop
        for (const item of sourceProducts) {
            try {
                const productData = {
                    seller: merchant._id,
                    name: item.name,
                    slug: item.slug,
                    price: item.price,
                    description: item.description,
                    image: item.image,
                    island: item.island,
                    category: item.category,
                    stock: item.stock,
                    isAvailable: item.isAvailable,
                    rating: item.rating
                };

                // Validate before writing
                const testDoc = new Product(productData);
                try {
                    await testDoc.validate();
                } catch (valErr) {
                    console.error(`❌ Validation failed for product '${item.name}':`, valErr.message);
                    failedCount++;
                    continue;
                }

                // Check existing product by deterministic slug
                const existing = await Product.findOne({ slug: item.slug });

                if (existing) {
                    // Update fields idempotently without modifying inventory or unneeded mutations
                    existing.seller = merchant._id;
                    existing.name = item.name;
                    existing.price = item.price;
                    existing.description = item.description;
                    existing.image = item.image;
                    existing.island = item.island;
                    existing.category = item.category;
                    existing.isAvailable = item.isAvailable;
                    existing.rating = item.rating;
                    // Preserve existing stock if valid, otherwise set initial seed stock
                    if (existing.stock === undefined || existing.stock === null) {
                        existing.stock = item.stock;
                    }
                    await existing.save();
                    updatedCount++;
                } else {
                    await Product.create(productData);
                    createdCount++;
                }
            } catch (itemErr) {
                console.error(`❌ Error migrating product '${item.name}':`, itemErr.message);
                failedCount++;
            }
        }

        const totalInDb = await Product.countDocuments();

        log("\n==========================================");
        log("Product Migration Summary");
        log(`Source Items:   ${sourceProducts.length}`);
        log(`Created:        ${createdCount}`);
        log(`Updated:        ${updatedCount}`);
        log(`Skipped:        ${skippedCount}`);
        log(`Failed:         ${failedCount}`);
        log(`Total in DB:    ${totalInDb}`);
        log("==========================================\n");

        return {
            success: failedCount === 0,
            merchant,
            sourceCount: sourceProducts.length,
            createdCount,
            updatedCount,
            skippedCount,
            failedCount,
            totalProducts: totalInDb
        };
    } finally {
        if (internallyConnected && disconnectOnFinish) {
            await mongoose.disconnect();
            log("🔌 Disconnected cleanly from MongoDB.");
        }
    }
}

// CLI runner if executed directly
const isDirectRun = Boolean(process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]));
if (isDirectRun) {
    migrateProducts({ disconnectOnFinish: true })
        .then((res) => {
            if (!res.success) {
                process.exit(1);
            }
            process.exit(0);
        })
        .catch((err) => {
            console.error("Migration Fatal Error:", err);
            process.exit(1);
        });
}
