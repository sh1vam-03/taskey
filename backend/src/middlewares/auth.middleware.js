import { verifyAccessToken } from "../utils/jwt.js";
import prisma from "../config/db.js";
import { AccountStatus } from "@prisma/client";

const authMiddleware = async (req, res, next) => {
    try {
        let token = req.cookies?.accessToken;

        if (!token && req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            console.log("Auth Middleware: No access token found");
            return res.status(401).json({ message: "Unauthorized access" });
        }

        // 1️⃣ Verify JWT
        const decoded = verifyAccessToken(token);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                tokenVersion: true,
                plan: true, // Add plan to user object for easy access
                timezone: true
            },
        });

        if (!user || user.status !== "ACTIVE") {
            console.log("Auth Middleware: User not found or inactive");
            return res.status(403).json({ message: "Account disabled or not found" });
        }

        if (decoded.tokenVersion !== user.tokenVersion) {
            console.log(`Auth Middleware: Token version mismatch. Token: ${decoded.tokenVersion}, User: ${user.tokenVersion}`);
            return res.status(401).json({ message: "Session expired (Logged out from another device)" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

export default authMiddleware;
