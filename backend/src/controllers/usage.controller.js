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

        const planConfig = PLANS[req.user.plan] || PLANS.FREE;
        const limits = planConfig.limits || {};

        // Calculate AI Tokens Used/Remaining
        // We can use the user.aiCreditBalance, but the frontend asks for "Used".
        // "Used" = (Total Granted) - (Current Balance)
        // BUT user might have done top-ups, so "Total Granted" is variable.
        // Frontend logic: `(usage?.aiTokensUsed / (subscription?.usageLimit || 100)) * 100`
        // Frontend assumes `usage.aiTokensUsed`.
        // We should calculate `aiTokensUsed` strictly or just send the balance?
        // If we send `aiTokensUsed`, we need to know how many were available.
        // Let's check `AiCreditLedger` to see total credits ever added vs current balance?
        // Too expensive.
        // Simplified approach: Return `aiCreditBalance` and let frontend adapt?
        // NO, user said "Do NOT Redesign" frontend. Frontend expects `aiTokensUsed`.
        // AND `subscription.usageLimit`.
        // Let's try to approximate `aiTokensUsed`.
        // Actually, we can just fetch the `usage.aiTokensUsed`?
        // Does `UsageStat` have `aiTokensUsed`?
        // Schema check: `UsageStat` has `taskCount`, `scheduleCount`, `behaviorCount`. NO `aiTokensUsed`.
        // `User` has `aiCreditBalance`.
        // So we need to calculate `aiTokensUsed` for this month?
        // We can check `AiUsage` table for this month.

        // Count AI Usage for this month
        /*
        const aiUsageCount = await prisma.aiUsage.aggregate({
             where: {
                 userId,
                 createdAt: {
                     gte: new Date(year, month - 1, 1),
                     lt: new Date(year, month, 1)
                 }
             },
             _sum: {
                 creditsUsed: true
             }
        });
        */
        // This is the correct way to get "Used".

        const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
        const endOfMonth = new Date(Date.UTC(year, month, 1));

        const aiUsageAgg = await prisma.aiUsage.aggregate({
            where: {
                userId,
                createdAt: {
                    gte: startOfMonth,
                    lt: endOfMonth
                }
            },
            _sum: {
                creditsUsed: true
            }
        });

        const aiTokensUsed = aiUsageAgg._sum.creditsUsed || 0;

        res.status(200).json({
            success: true,
            data: {
                ...usage,
                aiTokensUsed,
                limits: limits, // Send the limits object directly
                plan: req.user.plan // Send plan name for reference
            }
        });
    } catch (error) {
        next(error);
    }
};
