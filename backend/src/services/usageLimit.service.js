import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import { PLANS } from "../config/plans.config.js";
import { PlanType } from "@prisma/client";
import { getCurrentMonthYear } from "../utils/date.utils.js";

/**
 * Check if user has reached their limit for a specific resource
 * @param {string} userId
 * @param {'task' | 'schedule' | 'behavior'} type
 */
export const checkUsageLimit = async (userId, type) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true }
    });

    if (!user) throw new ApiError(404, "User not found");

    // Admins or Pro plans might be unlimited
    const planConfig = PLANS[user.plan] || PLANS[PlanType.FREE];
    const limit = planConfig.limits[type];

    // If no limit or unlimited (e.g. -1 or undefined implies limited unless specified otherwise)
    // Actually our config has specific numbers. If plans are unlimited, we set high number or handle here.
    // PLANS.PRO has limits: task: 1000.
    // PLANS.PRO_PLUS has limits: task: 10000.
    // Basically "Unlimited" is just a high number in our config.

    const { month, year } = getCurrentMonthYear();

    const usage = await prisma.usageStat.findUnique({
        where: {
            userId_month_year: {
                userId,
                month,
                year
            }
        }
    });

    if (!usage) return; // No usage yet = safe

    const currentUsage = usage[`${type}Count`] || 0;

    if (currentUsage >= limit) {
        throw new ApiError(403, `${type} limit reached for ${planConfig.label}. Please upgrade.`);
    }
};

/**
 * Increment usage count
 * @param {string} userId
 * @param {'task' | 'schedule' | 'behavior'} type
 */
export const incrementUsage = async (userId, type) => {
    const { month, year } = getCurrentMonthYear();

    await prisma.usageStat.upsert({
        where: {
            userId_month_year: {
                userId,
                month,
                year
            }
        },
        create: {
            userId,
            month,
            year,
            [`${type}Count`]: 1
        },
        update: {
            [`${type}Count`]: {
                increment: 1
            }
        }
    });
};
