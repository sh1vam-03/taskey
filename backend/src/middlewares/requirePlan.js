import ApiError from "../utils/ApiError.js";
import { UserRole, PlanType } from "@prisma/client";
import { PLAN_RANK } from "./plan.utils.js";

const requirePlan = (minimumPlan) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Unauthorized");
        }

        // 🔥 Admin bypass
        if (req.user.role === UserRole.ADMIN) {
            return next();
        }

        const userPlan = req.user.plan || PlanType.FREE;

        if (PLAN_RANK[userPlan] < PLAN_RANK[minimumPlan]) {
            throw new ApiError(
                403,
                `This feature requires ${minimumPlan} plan`
            );
        }

        next();
    };
};

export default requirePlan;
