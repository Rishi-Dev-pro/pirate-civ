import multer from "multer";
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, "../public");

// Ensure upload directories exist
const avatarsDir = path.join(publicDir, "uploads", "avatars");
const productsDir = path.join(publicDir, "uploads", "products");

if (!fs.existsSync(avatarsDir)) {
    fs.mkdirSync(avatarsDir, { recursive: true });
}
if (!fs.existsSync(productsDir)) {
    fs.mkdirSync(productsDir, { recursive: true });
}

// Memory storage for safe in-memory validation and Sharp processing
const storage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only JPG, PNG, WEBP, GIF, and AVIF images are permitted."), false);
    }
};

export const uploadAvatarMiddleware = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: imageFileFilter
}).single("avatar");

export const uploadProductImageMiddleware = multer({
    storage,
    limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
    fileFilter: imageFileFilter
}).single("productImage");

/**
 * Optimizes an uploaded avatar image:
 * Resizes to 400x400 max, converts to WebP, quality 85.
 * Returns public URL path like '/uploads/avatars/avatar-xxx.webp'
 */
export async function processAvatar(fileBuffer) {
    const safeHash = crypto.randomBytes(12).toString("hex");
    const filename = `avatar-${Date.now()}-${safeHash}.webp`;
    const outputPath = path.join(avatarsDir, filename);

    await sharp(fileBuffer)
        .resize(400, 400, { fit: "cover", position: "center" })
        .webp({ quality: 85 })
        .toFile(outputPath);

    return `/uploads/avatars/${filename}`;
}

/**
 * Optimizes an uploaded product image:
 * Resizes to max 800x800, converts to WebP, quality 85.
 * Returns public URL path like '/uploads/products/product-xxx.webp'
 */
export async function processProductImage(fileBuffer) {
    const safeHash = crypto.randomBytes(12).toString("hex");
    const filename = `product-${Date.now()}-${safeHash}.webp`;
    const outputPath = path.join(productsDir, filename);

    await sharp(fileBuffer)
        .resize(800, 800, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(outputPath);

    return `/uploads/products/${filename}`;
}
