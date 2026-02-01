import prisma from "../config/db.js";
import {
    PaymentStatus,
    PlanType,
    TokenSource,
} from "@prisma/client";
import { PLANS } from "../config/plans.js";

export const handleRazorpayEvent = async (event) => {
    switch (event.event) {

        /* ================= SUBSCRIPTION ACTIVATED ================= */
        case "subscription.activated": {
            const sub = event.payload.subscription.entity;

            const payment = await prisma.payment.findFirst({
                where: { razorpaySubscriptionId: sub.id },
            });

            if (!payment) return;

            const subscriptionPlan = payment.plan; // stored earlier
            const billingCycle = payment.billingCycle;

            const monthlyTokens =
                PLANS[subscriptionPlan][billingCycle].tokens;

            await prisma.$transaction(async (tx) => {
                await tx.subscription.upsert({
                    where: { userId: payment.userId },
                    update: {
                        plan: subscriptionPlan,
                        billingCycle,
                        monthlyTokens,
                        isActive: true,
                        razorpaySubscriptionId: sub.id,
                    },
                    create: {
                        userId: payment.userId,
                        plan: subscriptionPlan,
                        billingCycle,
                        monthlyTokens,
                        isActive: true,
                        razorpaySubscriptionId: sub.id,
                    },
                });

                await tx.user.update({
                    where: { id: payment.userId },
                    data: {
                        plan: subscriptionPlan,
                        aiTokenBalance: {
                            increment: monthlyTokens,
                        },
                    },
                });

                await tx.payment.update({
                    where: { id: payment.id },
                    data: { status: PaymentStatus.PAID },
                });
            });

            break;
        }

        /* ================= INVOICE PAID (MONTHLY TOKENS) ================= */
        case "invoice.payment_paid": {
            const invoice = event.payload.invoice.entity;

            const subscription = await prisma.subscription.findFirst({
                where: {
                    razorpaySubscriptionId: invoice.subscription_id,
                    isActive: true,
                },
            });

            if (!subscription) return;

            const tokens =
                PLANS[subscription.plan][subscription.billingCycle].tokens;

            await prisma.$transaction(async (tx) => {
                const payment = await tx.payment.create({
                    data: {
                        razorpayPaymentId: invoice.payment_id,
                        razorpaySubscriptionId: invoice.subscription_id,
                        entity: "INVOICE",
                        purpose: "SUBSCRIPTION",
                        amount: invoice.amount_paid,
                        currency: invoice.currency,
                        status: PaymentStatus.PAID,
                        userId: subscription.userId,
                    },
                });

                await tx.user.update({
                    where: { id: subscription.userId },
                    data: {
                        aiTokenBalance: { increment: tokens },
                    },
                });

                await tx.aiTopUp.create({
                    data: {
                        tokensAdded: tokens,
                        source: TokenSource.PLAN_MONTHLY,
                        paymentId: payment.id,
                        userId: subscription.userId,
                    },
                });
            });

            break;
        }

        /* ================= SUBSCRIPTION CANCELLED ================= */
        case "subscription.cancelled":
        case "subscription.completed": {
            const sub = event.payload.subscription.entity;

            const subscription = await prisma.subscription.findFirst({
                where: { razorpaySubscriptionId: sub.id },
            });

            if (!subscription) return;

            await prisma.$transaction(async (tx) => {
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

        /* ================= PAYMENT FAILED ================= */
        case "invoice.payment_failed": {
            const invoice = event.payload.invoice.entity;

            await prisma.payment.create({
                data: {
                    razorpayPaymentId: invoice.payment_id ?? null,
                    razorpaySubscriptionId: invoice.subscription_id,
                    entity: "INVOICE",
                    purpose: "SUBSCRIPTION",
                    amount: invoice.amount_due,
                    currency: invoice.currency,
                    status: PaymentStatus.FAILED,
                    userId: invoice.customer_id,
                },
            });

            break;
        }

        default:
            break;
    }
};
