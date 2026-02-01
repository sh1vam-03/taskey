import Razorpay from "razorpay";
import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import { PLANS, PLAN_ORDER } from "../config/plans.js";
import { PaymentPurpose, RazorpayEntity } from "@prisma/client";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createSubscription = async (userId, plan, billingCycle) => {
    // 1️⃣ Validate plan
    if (!PLANS[plan]) {
        throw new ApiError(400, "Invalid plan");
    }

    const config = PLANS[plan][billingCycle];
    if (!config) {
        throw new ApiError(400, "Invalid billing cycle");
    }

    // 2️⃣ Prevent duplicate active subscription
    const existing = await prisma.subscription.findUnique({
        where: { userId },
    });

    if (existing?.isActive) {
        throw new ApiError(400, "You already have an active subscription");
    }

    // 3️⃣ Create Razorpay subscription
    const razorpaySubscription = await razorpay.subscriptions.create({
        plan_id:
            process.env[`RAZORPAY_${plan}_${billingCycle}_PLAN_ID`],
        customer_notify: 1,
        total_count: billingCycle === "YEARLY" ? 1 : 12,
    });

    // 4️⃣ Save payment intent
    await prisma.payment.create({
        data: {
            userId,
            entity: RazorpayEntity.SUBSCRIPTION,
            purpose: PaymentPurpose.SUBSCRIPTION,
            amount: config.price,
            currency: "INR",
            status: "CREATED",
            razorpaySubscriptionId: razorpaySubscription.id,
        },
    });

    return razorpaySubscription;
};

export const cancelSubscription = async (userId) => {
    const sub = await prisma.subscription.findUnique({
        where: { userId },
    });

    if (!sub || !sub.razorpaySubscriptionId || !sub.isActive) {
        throw new ApiError(404, "No active subscription found");
    }

    // Cancel at end of cycle
    await razorpay.subscriptions.cancel(
        sub.razorpaySubscriptionId,
        false
    );

    return {
        message: "Subscription will be cancelled at the end of billing cycle",
    };
};

export const downgradeSubscription = async (userId, newPlan) => {
    if (!PLANS[newPlan]) {
        throw new ApiError(400, "Invalid plan");
    }

    const sub = await prisma.subscription.findUnique({
        where: { userId },
    });

    if (!sub || !sub.razorpaySubscriptionId) {
        throw new ApiError(404, "No active subscription");
    }

    // Only allow downgrade
    if (PLAN_ORDER[newPlan] >= PLAN_ORDER[sub.plan]) {
        throw new ApiError(400, "Only downgrades are allowed");
    }

    await razorpay.subscriptions.update(
        sub.razorpaySubscriptionId,
        {
            plan_id:
                process.env[`RAZORPAY_${newPlan}_${sub.billingCycle}_PLAN_ID`],
            schedule_change_at: "cycle_end",
        }
    );

    return {
        message: `Plan will be downgraded to ${newPlan} at next billing cycle`,
    };
};
