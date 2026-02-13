import asyncHandler from "../utils/asyncHandler.js";
import * as billingService from "../services/billing.service.js";
import { PLANS } from "../config/plans.config.js";

/**
 * @route POST /api/billing/subscribe
 */
export const subscribe = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { plan, billingCycle } = req.body;

    const data = await billingService.createSubscription(
        userId,
        plan,
        billingCycle
    );

    res.status(200).json({
        success: true,
        data,
    });
});

/**
 * @route POST /api/billing/cancel
 */
export const cancelMySubscription = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const result = await billingService.cancelSubscription(userId);

    res.status(200).json({
        success: true,
        data: result,
    });
});

/**
 * @route POST /api/billing/downgrade
 */
export const downgradePlan = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { newPlan } = req.body;

    const result = await billingService.downgradeSubscription(
        userId,
        newPlan
    );

    res.status(200).json({
        success: true,
        data: result,
    });
});

/**
 * @route GET /api/billing/current
 */
export const getCurrentSubscription = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const subscription = await billingService.getSubscription(userId);

    // Get Plan Config
    const currentPlan = subscription?.plan || "FREE";
    const planConfig = PLANS[currentPlan] || PLANS.FREE;

    // Determine Usage Limit (Credits for the cycle)
    // If FREE, limits.YEARLY/MONTHLY is 0.
    // Use 'MONTHLY' as default for view if no sub.
    const billingCycle = subscription?.billingCycle || "MONTHLY";
    const usageLimit = planConfig.credits[billingCycle] || 0;

    res.status(200).json({
        success: true,
        data: {
            ...subscription,
            plan: currentPlan,
            usageLimit, // Important for Frontend Progress Bar
            billingCycle,
            isActive: subscription?.isActive ?? true,
            endDate: subscription?.endsAt || subscription?.nextBillingAt
        }
    });
});

