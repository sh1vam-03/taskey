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
 * @route POST /api/billing/top-up/verify
 */
export const verifyTopUp = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    const result = await billingService.verifyTopUpPayment(
        userId,
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature
    );

    res.status(200).json({
        success: true,
        data: result,
    });
});

/**
 * @route POST /api/billing/top-up
 */
export const createTopUp = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { topUpId } = req.body;

    const data = await billingService.createTopUpOrder(userId, topUpId);

    res.status(200).json({
        success: true,
        data,
    });
});

/**
 * @route GET /api/billing/history
 */
export const getHistory = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const history = await billingService.getPaymentHistory(userId);

    res.status(200).json({
        success: true,
        data: history
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

    // Use authenticated user's plan as source of truth (set during login/token refresh)
    // Fall back to subscription record, then to FREE
    const currentPlan = req.user.plan || subscription?.plan || "FREE";
    const planConfig = PLANS[currentPlan] || PLANS.FREE;

    // Determine Usage Limit (Credits for the cycle)
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

