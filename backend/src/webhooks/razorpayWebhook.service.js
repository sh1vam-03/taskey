import prisma from "../config/db.js";
import { PaymentStatus, PlanType } from "@prisma/client";
import { PLANS } from "../config/plans.config.js"; // New Import

export const handleRazorpayEvent = async (event) => {
    switch (event.event) {

        /* ================= SUBSCRIPTION ACTIVATED ================= */
        case "subscription.activated": {
            const sub = event.payload.subscription.entity;

            const payment = await prisma.payment.findFirst({
                where: { razorpaySubscriptionId: sub.id },
            });

            if (!payment) return;

            const subscriptionPlan = payment.plan; // stored earlier (e.g. PRO)
            const billingCycle = payment.billingCycle; // MONTHLY or YEARLY

            // Fetch credit amount from new config
            // WAS: PLANS[subscriptionPlan][billingCycle].credits
            // NOW: PLANS[subscriptionPlan].credits[billingCycle]
            const credits = PLANS[subscriptionPlan]?.credits?.[billingCycle] || 0;

            await prisma.$transaction(async (tx) => {
                await tx.subscription.upsert({
                    where: { userId: payment.userId },
                    update: {
                        plan: subscriptionPlan,
                        billingCycle,
                        cycleCredits: credits,
                        isActive: true,
                        razorpaySubscriptionId: sub.id,
                    },
                    create: {
                        userId: payment.userId,
                        plan: subscriptionPlan,
                        billingCycle,
                        cycleCredits: credits,
                        isActive: true,
                        razorpaySubscriptionId: sub.id,
                    },
                });

                // Grant Credits + Ledger
                await tx.user.update({
                    where: { id: payment.userId },
                    data: {
                        plan: subscriptionPlan,
                        aiCreditBalance: { increment: credits },
                    },
                });

                await tx.aiCreditLedger.create({
                    data: {
                        userId: payment.userId,
                        credits: credits,
                        source: "PLAN_CYCLE",
                        paymentId: payment.id,
                        reason: `Subscription Activated: ${subscriptionPlan}`
                    }
                });

                await tx.payment.update({
                    where: { id: payment.id },
                    data: { status: PaymentStatus.PAID },
                });
            });

            break;
        }

        /* ================= INVOICE PAID (RECURRING) ================= */
        case "invoice.payment_paid": {
            const invoice = event.payload.invoice.entity;

            const subscription = await prisma.subscription.findFirst({
                where: {
                    razorpaySubscriptionId: invoice.subscription_id,
                    isActive: true,
                },
            });

            if (!subscription) return;

            // Fetch credits based on active subscription
            const credits = PLANS[subscription.plan]?.credits?.[subscription.billingCycle] || 0;

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

                // Grant Credits + Ledger
                await tx.user.update({
                    where: { id: subscription.userId },
                    data: {
                        aiCreditBalance: { increment: credits },
                    },
                });

                await tx.aiCreditLedger.create({
                    data: {
                        userId: subscription.userId,
                        credits: credits,
                        source: "PLAN_CYCLE",
                        paymentId: payment.id,
                        reason: "Monthly Renewal"
                    }
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

            // Log attempt
            await prisma.payment.create({
                data: {
                    razorpayPaymentId: invoice.payment_id ?? null,
                    razorpaySubscriptionId: invoice.subscription_id,
                    entity: "INVOICE",
                    purpose: "SUBSCRIPTION",
                    amount: invoice.amount_due,
                    currency: invoice.currency,
                    status: PaymentStatus.FAILED,
                    userId: invoice.customer_id, // Ensure this maps to our UUID if Razorpay uses our ID
                },
            });

            break;
        }

        default:
            break;
    }
};
