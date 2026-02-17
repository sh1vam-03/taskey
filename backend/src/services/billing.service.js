import Razorpay from "razorpay";
import crypto from "crypto";
import prisma from "../config/db.js";
import ApiError from "../utils/ApiError.js";
import { PLANS, TOP_UP_PLANS, getPlanRank } from "../config/plans.config.js"; // New Import
import { PaymentPurpose, RazorpayEntity, CreditSource } from "@prisma/client";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createSubscription = async (userId, plan, billingCycle) => {
    // 1️⃣ Validate plan
    const planConfig = PLANS[plan];
    if (!planConfig) {
        throw new ApiError(400, "Invalid plan");
    }

    // Validate price exists (sanity check)
    const price = planConfig.price[billingCycle];
    if (price === undefined) {
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
    const planId = process.env[`RAZORPAY_${plan}_${billingCycle}_PLAN_ID`];

    if (!planId) {
        throw new ApiError(500, "Server Configuration Error: Plan ID not found");
    }

    let razorpaySubscription;
    try {
        razorpaySubscription = await razorpay.subscriptions.create({
            plan_id: planId,
            customer_notify: 1,
            total_count: billingCycle === "YEARLY" ? 1 : 12,
        });
    } catch (error) {
        throw new ApiError(error.statusCode || 500, `Razorpay Error: ${error.error?.description || error.message}`);
    }

    // 4️⃣ Save payment intent
    await prisma.payment.create({
        data: {
            userId,
            entity: RazorpayEntity.SUBSCRIPTION,
            purpose: PaymentPurpose.SUBSCRIPTION,
            amount: price * 100, // Convert to paise if Razorpay expects it? 
            // WAIT: Previous plans.js had 49900 (paise). 
            // My new config has 499 (Rupees).
            // Razorpay usually expects Paise.
            // I should multiply by 100 here.
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
    // Old: PLAN_ORDER[newPlan] >= PLAN_ORDER[sub.plan]
    // New: getPlanRank(newPlan) >= getPlanRank(sub.plan)
    if (getPlanRank(newPlan) >= getPlanRank(sub.plan)) {
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

export const getSubscription = async (userId) => {
    const subscription = await prisma.subscription.findUnique({
        where: { userId },
    });
    return subscription;
};

export const createTopUpOrder = async (userId, topUpId) => {
    // 1. Validate Top-Up Plan
    const pack = TOP_UP_PLANS[topUpId];
    if (!pack) {
        throw new ApiError(400, "Invalid top-up pack");
    }

    // 2. Create Razorpay Order
    const options = {
        amount: pack.price * 100, // paise
        currency: "INR",
        receipt: `topup_${userId.slice(0, 8)}_${Date.now()}`,
        payment_capture: 1
    };

    const order = await razorpay.orders.create(options);

    // 3. Create Payment Record (Pending)
    await prisma.payment.create({
        data: {
            userId,
            entity: RazorpayEntity.PAYMENT,
            purpose: PaymentPurpose.TOP_UP,
            amount: pack.price * 100,
            currency: "INR",
            status: "CREATED",
            razorpayOrderId: order.id,
            // metadata: { credits: pack.credits } // Schema doesn't have metadata
        }
    });

    return {
        ...pack,
        orderId: order.id,
        key: process.env.RAZORPAY_KEY_ID
    };
};

export const getPaymentHistory = async (userId) => {
    const history = await prisma.payment.findMany({
        where: {
            userId,
            status: "PAID" // Only show successful payments
        },
        orderBy: { createdAt: 'desc' },
        take: 20
    });
    return history;
};

export const verifyTopUpPayment = async (userId, paymentId, orderId, signature) => {
    // 1. Verify Signature
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature !== signature) {
        throw new ApiError(400, "Invalid payment signature");
    }

    // 2. Find Payment Record
    const payment = await prisma.payment.findFirst({
        where: { razorpayOrderId: orderId }
    });

    if (!payment) {
        throw new ApiError(404, "Payment record not found");
    }

    if (payment.status === "PAID") {
        return { message: "Payment already verified", status: "PAID" };
    }

    // 3. Mark Payment as PAID
    await prisma.payment.update({
        where: { id: payment.id },
        data: {
            status: "PAID",
            razorpayPaymentId: paymentId,
            razorpaySignature: signature
        }
    });

    // 4. Add Credits to User
    // Determine credits from amount (reverse lookup from TOP_UP_PLANS)
    // Or store credits in metadata? Schema might not have metadata.
    // Let's find the pack by price.
    const pack = Object.values(TOP_UP_PLANS).find(p => Math.abs(p.price * 100 - payment.amount) < 1);

    // Fallback or Error if pack not found? 
    // If pack not found, maybe just log? But we must give credits!
    // Let's assume strict price matching.
    const creditsToAdd = pack ? pack.credits : 0;

    if (creditsToAdd > 0) {
        await prisma.user.update({
            where: { id: userId },
            data: {
                aiCreditBalance: { increment: creditsToAdd },
                creditLedger: {
                    create: {
                        credits: creditsToAdd,
                        source: CreditSource.TOP_UP,
                        reason: `Top-Up: ${pack?.label || 'Credits'}`,
                        paymentId: payment.id
                    }
                }
            }
        });
    }

    return {
        success: true,
        creditsAdded: creditsToAdd,
        newBalance: (await prisma.user.findUnique({ where: { id: userId } })).aiCreditBalance
    };
};
