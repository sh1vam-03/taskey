import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
    const dotenv = await import("dotenv");
    dotenv.config();
} // Load env before other imports

// Server restart trigger for env update
import app from "./app.js";
import prisma from "./config/db.js";
import "./cron/missedSchedule.cron.js";
import "./cron/creditExpiry.cron.js";
import "./cron/yearlyDrip.cron.js";

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
    try {
        await prisma.$connect();
        console.log("✅ Database connected");
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.log("❌ Database connection error", error);
        process.exit(1);
    }
}

startServer();
