import prisma from "../config/db.js";
import {
    PaymentStatus,
    PlanType,
    TokenSource,
} from "@prisma/client";
import { PLANS, RAZORPAY_PLAN_MAP } from "../config/plans.js";

export const handleEvent = async (event) => {
    const { event: type, payload } = event;

    switch (type) {

        // ✅ Subscription started
        case "subscription.activated": {
            const sub = payload.subscription.entity;

            const payment = await prisma.payment.findFirst({
                where: { razorpaySubscriptionId: sub.id },
            });

            if (!payment) return;

            const plan = RAZORPAY_PLAN_MAP[sub.plan_id];
            if (!plan) return;

            await prisma.$transaction(async (tx) => {
                await tx.subscription.upsert({
                    where: { userId: payment.userId },
                    update: {
                        plan,
                        isActive: true,
                        razorpaySubscriptionId: sub.id,
                    },
                    create: {
                        userId: payment.userId,
                        plan,
                        billingCycle: "MONTHLY",
                        monthlyTokens: PLANS[plan].MONTHLY.tokens,
                        razorpaySubscriptionId: sub.id,
                    },
                });

                await tx.user.update({
                    where: { id: payment.userId },
                    data: { plan },
                });

                await tx.payment.update({
                    where: { id: payment.id },
                    data: { status: PaymentStatus.PAID },
                });
            });

            break;
        }

        // ✅ Monthly invoice paid → add tokens
        case "invoice.payment_paid": {
            const invoice = payload.invoice.entity;

            const sub = await prisma.subscription.findFirst({
                where: {
                    razorpaySubscriptionId: invoice.subscription_id,
                    isActive: true,
                },
            });

            if (!sub) return;

            const tokens = PLANS[sub.plan].MONTHLY.tokens;

            await prisma.$transaction(async (tx) => {
                const payment = await tx.payment.create({
                    data: {
                        razorpayPaymentId: invoice.payment_id,
                        razorpaySubscriptionId: invoice.subscription_id,
                        entity: "INVOICE",
                        purpose: "SUBSCRIPTION",
                        amount: invoice.amount_paid,
                        currency: invoice.currency,
                        status: "PAID",
                        userId: sub.userId,
                    },
                });

                await tx.user.update({
                    where: { id: sub.userId },
                    data: {
                        aiTokenBalance: { increment: tokens },
                    },
                });

                await tx.aiTopUp.create({
                    data: {
                        tokensAdded: tokens,
                        source: TokenSource.PLAN_MONTHLY,
                        paymentId: payment.id,
                        userId: sub.userId,
                    },
                });
            });

            break;
        }

        // ❌ Subscription cancelled
        case "subscription.cancelled": {
            const sub = payload.subscription.entity;

            await prisma.$transaction(async (tx) => {
                const subscription = await tx.subscription.findFirst({
                    where: { razorpaySubscriptionId: sub.id },
                });

                if (!subscription) return;

                await tx.subscription.update({
                    where: { id: subscription.id },
                    data: {
                        isActive: false,
                        endsAt: new Date(),
                    },
                });

                await tx.user.update({
                    where: { id: subscription.userId },
                    data: { plan: PlanType.FREE },
                });
            });

            break;
        }

        // ❌ Invoice failed (no downgrade yet)
        case "invoice.payment_failed": {
            // log only
            break;
        }

        default:
            break;
    }
};
