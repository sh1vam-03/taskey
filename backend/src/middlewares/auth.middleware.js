import { verifyAccessToken } from "../utils/jwt.js";
import prisma from "../config/db.js";
import { AccountStatus } from "@prisma/client";

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;

        if (!token) {
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
                tokenVersion: true
            },
        });

        if (!user || user.status !== "ACTIVE") {
            return res.status(403).json({ message: "Account disabled or not found" });
        }

        if (decoded.tokenVersion !== user.tokenVersion) {
            return res.status(401).json({ message: "Session expired (Logged out from another device)" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

export default authMiddleware;
