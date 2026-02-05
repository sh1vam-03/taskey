import asyncHandler from "../utils/asyncHandler.js";
import * as billingService from "../services/billing.service.js";

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
