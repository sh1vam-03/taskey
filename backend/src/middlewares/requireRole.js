import ApiError from "../utils/ApiError.js";
import { UserRole } from "@prisma/client";

const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            throw new ApiError(401, "Unauthorized");
        }

        if (req.user.role.toUpperCase() !== role.toUpperCase()) {
            throw new ApiError(403, "Access denied");
        }
        next();
    };
};

export default requireRole;
