import { verifyAccessToken } from "../utils/jwt.js";
import prisma from "../config/db.js";
import { AccountStatus } from "@prisma/client";

const authMiddleware = async (req, res, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // 1️⃣ Verify JWT
        const decoded = verifyAccessToken(token);

        // 2️⃣ Validate session
        const session = await prisma.session.findFirst({
            where: {
                accessTokenJti: decoded.jti,
                revokedAt: null,
                expiresAt: {
                    gt: new Date(),
                },
            },
            include: {
                user: true,
            },
        });

        if (!session) {
            return res.status(401).json({ message: "Session expired" });
        }

        // 3️⃣ Check account status
        if (session.user.status !== AccountStatus.ACTIVE) {
            return res.status(403).json({ message: "Account not active" });
        }

        // 4️⃣ Attach safe user
        req.user = {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
            plan: session.user.plan,
        };

        // Needed for logout
        req.sessionId = session.id;

        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

export default authMiddleware;
