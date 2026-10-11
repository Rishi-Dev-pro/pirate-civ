import mongoose from "mongoose";

let isConnecting = false;

const connectDB = async (customUri) => {
    const mongoUri = customUri || process.env.MONGO_URI;

    // Singleton guard: already connected
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (isConnecting) {
        return;
    }

    try {
        isConnecting = true;
        await mongoose.connect(mongoUri);
        isConnecting = false;
        console.log("MongoDB Connected Successfully");
        return mongoose.connection;
    } catch (error) {
        isConnecting = false;
        console.error("MongoDB Connection Failed:", error.message);
        if (process.env.NODE_ENV !== "test") {
            process.exit(1);
        }
        throw error;
    }
};

// Lifecycle listeners
mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB Disconnected");
});

mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
});

// Graceful shutdown helper
export const disconnectDB = async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        console.log("🔌 Disconnected cleanly from MongoDB");
    }
};

// Process termination hooks
if (process.env.NODE_ENV !== "test") {
    process.on("SIGINT", async () => {
        await disconnectDB();
        process.exit(0);
    });
    process.on("SIGTERM", async () => {
        await disconnectDB();
        process.exit(0);
    });
}

export default connectDB;