import prisma from "../config/db.js";
import { PaymentStatus, PlanType } from "@prisma/client";
import { PLANS } from "../config/plans.config.js";
import { addMonths, addYears } from "date-fns";

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

            // Determine credit amount based on billing cycle
            // Monthly: grant full monthly credits
            // Yearly: grant only the MONTHLY portion (drip — cron handles subsequent months)
            const isYearly = billingCycle === "YEARLY";
            const monthlyCredits = PLANS[subscriptionPlan]?.credits?.MONTHLY || 0;
            const credits = monthlyCredits; // Always grant monthly portion
            const now = new Date();
            const expiresAt = isYearly ? addYears(now, 1) : addMonths(now, 1);

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

                // Grant Credits (first month's allocation)
                await tx.user.update({
                    where: { id: payment.userId },
                    data: {
                        plan: subscriptionPlan,
                        subscriptionCredits: credits,
                        subscriptionCreditsExpiresAt: expiresAt,
                    },
                });

                // Set distribution tracking for yearly drip
                await tx.subscription.update({
                    where: { userId: payment.userId },
                    data: { lastCreditDistributedAt: now }
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
            // Monthly: full monthly credits. Yearly: monthly portion (cron handles rest)
            const monthlyCredits = PLANS[subscription.plan]?.credits?.MONTHLY || 0;
            const isYearly = subscription.billingCycle === "YEARLY";
            const now = new Date();
            const expiresAt = isYearly ? addYears(now, 1) : addMonths(now, 1);

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

                // Grant Credits (RESET for new billing cycle)
                await tx.user.update({
                    where: { id: subscription.userId },
                    data: {
                        subscriptionCredits: monthlyCredits,
                        subscriptionCreditsExpiresAt: expiresAt,
                    },
                });

                // Reset distribution tracking for yearly drip
                await tx.subscription.update({
                    where: { id: subscription.id },
                    data: { lastCreditDistributedAt: now }
                });

                await tx.aiCreditLedger.create({
                    data: {
                        userId: subscription.userId,
                        credits: monthlyCredits,
                        source: "PLAN_CYCLE",
                        paymentId: payment.id,
                        reason: isYearly ? "Yearly Renewal — first month drip" : "Monthly Renewal"
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

                // Downgrade plan to FREE
                // BUT subscription credits remain until subscriptionCreditsExpiresAt
                // The creditExpiry cron will clear them when they expire
                // Top-up credits are NEVER touched
                await tx.user.update({
                    where: { id: subscription.userId },
                    data: {
                        plan: PlanType.FREE,
                    },
                });

                await tx.aiCreditLedger.create({
                    data: {
                        userId: subscription.userId,
                        credits: 0,
                        source: "PLAN_CYCLE",
                        reason: "Subscription cancelled — credits remain until expiry"
                    }
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
