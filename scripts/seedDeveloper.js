import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import dotenv from "dotenv";
import User from "../models/user.js";

dotenv.config();

export async function getOrCreateDeveloper(options = {}) {
    const { silent = false } = options;
    const email = "developer@pirate-civ.internal";

    let devUser = await User.findOne({ email });

    if (!devUser) {
        const hashedPassword = await bcrypt.hash("Developer2026!", 12);
        const authSecret = crypto.randomBytes(32).toString("hex");
        const authSecretHash = crypto.createHash("sha256").update(authSecret).digest("hex");

        devUser = await User.create({
            name: "Architect of the Realm",
            email,
            password: hashedPassword,
            role: "admin",
            authSecretHash,
            bio: "Grand Architect and System Sovereign of the Pirate-Civ Realm."
        });

        if (!silent) {
            console.log("⚓ Canonical Developer user created:", email);
        }
    } else if (devUser.role !== "admin") {
        devUser.role = "admin";
        await devUser.save();
        if (!silent) {
            console.log("⚓ Existing user elevated to admin role:", email);
        }
    }

    return devUser;
}

if (process.argv[1] && process.argv[1].endsWith("seedDeveloper.js")) {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pirate-civ";
    await mongoose.connect(uri);
    await getOrCreateDeveloper();
    await mongoose.disconnect();
    console.log("Done seeding developer.");
}
