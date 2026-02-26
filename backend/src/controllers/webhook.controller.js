import crypto from "crypto";
import prisma from "../config/db.js";
import { PLANS } from "../config/plans.config.js";
import { addMonths, addYears } from "date-fns";

export const handleRazorpayWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // Validation
        if (!secret) {
            console.error("RAZORPAY_WEBHOOK_SECRET is not defined");
            return res.status(500).json({ error: "Server Configuration Error" });
        }

        const signature = req.headers["x-razorpay-signature"];
        if (!signature) {
            return res.status(400).json({ error: "Missing Signature" });
        }

        const shasum = crypto.createHmac("sha256", secret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest("hex");

        if (digest !== signature) {
            console.error("Invalid Webhook Signature");
            return res.status(400).json({ error: "Invalid Signature" });
        }

        const { event, payload } = req.body;

        console.log(`Webhook Event Received: ${event}`);

        if (event === "subscription.charged") {
            await handleSubscriptionCharged(payload);
        } else if (event === "subscription.cancelled") {
            await handleSubscriptionCancelled(payload);
        } else if (event === "payment.captured") {
            await handlePaymentCaptured(payload);
        }

        res.json({ status: "ok" });
    } catch (error) {
        console.error("Webhook Error", error);
        // Return 200 to acknowledge receipt even if processing failed to prevent retries loop?
        // Usually better to return 500 so Razorpay retries, but for now 200.
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const handleSubscriptionCharged = async (payload) => {
    const subEntity = payload.subscription.entity;
    const paymentEntity = payload.payment.entity;

    const subscription = await prisma.subscription.findUnique({
        where: { razorpaySubscriptionId: subEntity.id },
        include: { user: true }
    });

    if (!subscription) {
        console.error(`Subscription not found for ID: ${subEntity.id}`);
        return;
    }

    // Calculate credits: always grant monthly portion (cron handles yearly drip)
    const planConfig = PLANS[subscription.plan];
    const monthlyCredits = planConfig?.credits?.MONTHLY || 0;
    const isYearly = subscription.billingCycle === "YEARLY";
    const now = new Date();

    // Expiry: +1 month for monthly, +1 year for yearly
    const expiresAt = isYearly ? addYears(now, 1) : addMonths(now, 1);

    await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
            isActive: true,
            lastBilledAt: now,
            nextBillingAt: new Date(subEntity.charge_at * 1000),
            cycleCredits: monthlyCredits,
            lastCreditGrantedAt: now,
            lastCreditDistributedAt: now
        }
    });

    // Record Payment
    await prisma.payment.upsert({
        where: { razorpayPaymentId: paymentEntity.id },
        update: {
            status: "PAID",
            amount: paymentEntity.amount,
            updatedAt: now
        },
        create: {
            userId: subscription.userId,
            razorpayPaymentId: paymentEntity.id,
            razorpaySubscriptionId: subEntity.id,
            entity: "SUBSCRIPTION",
            purpose: "SUBSCRIPTION",
            amount: paymentEntity.amount,
            currency: paymentEntity.currency,
            status: "PAID"
        }
    });

    // 🚨 GRANT CREDITS (RESET, not accumulate) + set expiry 🚨
    await prisma.$transaction([
        prisma.user.update({
            where: { id: subscription.userId },
            data: {
                subscriptionCredits: monthlyCredits,
                subscriptionCreditsExpiresAt: expiresAt
            }
        }),
        prisma.aiCreditLedger.create({
            data: {
                userId: subscription.userId,
                credits: monthlyCredits,
                source: "PLAN_CYCLE",
                reason: isYearly
                    ? "Subscription Charged — yearly first month drip"
                    : "Subscription Charged — monthly credits reset",
                paymentId: paymentEntity.id
            }
        })
    ]);
};

const handleSubscriptionCancelled = async (payload) => {
    const subEntity = payload.subscription.entity;

    const subscription = await prisma.subscription.findUnique({
        where: { razorpaySubscriptionId: subEntity.id }
    });

    if (!subscription) return;

    await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
            isActive: false,
            endsAt: subEntity.end_at ? new Date(subEntity.end_at * 1000) : new Date()
        }
    });
};

const handlePaymentCaptured = async (payload) => {
    const paymentEntity = payload.payment.entity;

    // Check if it's a Top-Up
    // We stored 'type': 'TOP_UP' in notes during order creation
    const notes = paymentEntity.notes || {};

    if (notes.type === "TOP_UP") {
        const userId = notes.userId;
        const credits = Number(notes.credits);

        if (!userId || !credits) {
            console.error("Invalid Top-Up Payload", notes);
            return;
        }

        // 1. Find existing Payment record
        const payment = await prisma.payment.findFirst({
            where: { razorpayOrderId: paymentEntity.order_id }
        });

        // Guard: If payment already marked PAID, credits were already granted
        // by the frontend verify flow — skip to prevent double-crediting
        if (payment?.status === "PAID") {
            console.log(`Top-Up payment ${paymentEntity.order_id} already processed, skipping webhook credit grant.`);
            return;
        }

        if (payment) {
            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: "PAID",
                    razorpayPaymentId: paymentEntity.id
                }
            });
        } else {
            // Payment record missing (edge case) — create it
            await prisma.payment.create({
                data: {
                    userId,
                    razorpayPaymentId: paymentEntity.id,
                    razorpayOrderId: paymentEntity.order_id,
                    entity: "PAYMENT",
                    purpose: "TOP_UP",
                    amount: paymentEntity.amount,
                    currency: paymentEntity.currency,
                    status: "PAID"
                }
            });
        }

        // 2. Grant Top-Up Credits (permanent, never expire)
        await prisma.$transaction([
            prisma.user.update({
                where: { id: userId },
                data: { topupCredits: { increment: credits } }
            }),
            prisma.aiCreditLedger.create({
                data: {
                    userId,
                    credits: credits,
                    source: "TOP_UP",
                    reason: `Top-Up: ${credits} Credits`,
                    paymentId: paymentEntity.id
                }
            })
        ]);

        console.log(`Granted ${credits} credits to ${userId} via Top-Up webhook`);
    } else {
        // Handle other payments (e.g. one-off invoice not top-up?)
    }
};
