import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import { PlanType, UserRole } from "@prisma/client";
import { getCurrentMonthYear } from "../utils/date.utils.js";

// FREE plan limits
const FREE_LIMITS = {
    TASK: 20,
    SCHEDULE: 30,
    BEHAVIOR: 30,
};

export const usageLimit = (type) => {
    return async (req, res, next) => {
        const { id: userId, plan, role } = req.user;

        // 1️⃣ Admin bypass
        if (role === UserRole.ADMIN) {
            return next();
        }

        // 2️⃣ Paid plans bypass
        if (plan !== PlanType.FREE) {
            return next();
        }

        const { month, year } = getCurrentMonthYear();

        // 3️⃣ Find or create usage stat
        let usage = await prisma.usageStat.findUnique({
            where: {
                userId_month_year: {
                    userId,
                    month,
                    year,
                },
            },
        });

        if (!usage) {
            usage = await prisma.usageStat.create({
                data: {
                    userId,
                    month,
                    year,
                },
            });
        }

        // 4️⃣ Check limits
        if (type === "TASK" && usage.taskCount >= FREE_LIMITS.TASK) {
            throw new ApiError(
                403,
                "Free plan task limit reached. Upgrade to PRO."
            );
        }

        if (type === "SCHEDULE" && usage.scheduleCount >= FREE_LIMITS.SCHEDULE) {
            throw new ApiError(
                403,
                "Free plan schedule limit reached. Upgrade to PRO."
            );
        }

        if (type === "BEHAVIOR" && usage.behaviorCount >= FREE_LIMITS.BEHAVIOR) {
            throw new ApiError(
                403,
                "Free plan behavior limit reached. Upgrade to PRO."
            );
        }

        // 5️⃣ Attach usage info (optional)
        req.usage = usage;

        next();
    };
};
