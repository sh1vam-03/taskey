import prisma from "../config/db.js";
import { getCurrentMonthYear } from "../utils/date.utils.js";
import ApiError from "../utils/ApiError.js";
import { PLANS } from "../config/plans.config.js";

export const getMyUsage = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { month, year } = getCurrentMonthYear();

        // Find or create for resiliency (though creation happens on action)
        let usage = await prisma.usageStat.findUnique({
            where: {
                userId_month_year: {
                    userId,
                    month,
                    year
                }
            }
        });

        if (!usage) {
            usage = {
                month,
                year,
                taskCount: 0,
                scheduleCount: 0,
                behaviorCount: 0,
                userId
            };
        }

        const limits = PLANS[req.user.plan]?.limits || {};

        res.status(200).json({
            success: true,
            data: {
                ...usage,
                limits: req.user.plan === "FREE" ? limits : "UNLIMITED"
            }
        });
    } catch (error) {
        next(error);
    }
};
