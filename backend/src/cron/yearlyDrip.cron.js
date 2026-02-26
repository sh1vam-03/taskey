import cron from "node-cron";
import prisma from "../config/db.js";
import { PLANS } from "../config/plans.config.js";

/**
 * YEARLY PLAN MONTHLY CREDIT DISTRIBUTION CRON
 * Runs daily at 00:30 UTC
 *
 * For yearly subscriptions, credits are NOT granted all at once.
 * Instead, the MONTHLY allocation is dripped each month:
 *   PRO Yearly:  300 credits/month × 12 = 3600 total
 *   PRO+ Yearly: 900 credits/month × 12 = 10800 total
 *
 * Credits accumulate month-over-month (not reset).
 * All expire at year-end (handled by creditExpiry.cron.js).
 */
cron.schedule("30 0 * * *", async () => {
    const now = new Date();
    console.log("🕒 YEARLY DRIP CRON:", now.toISOString());

    try {
        // Find all active yearly subscriptions
        const yearlySubscriptions = await prisma.subscription.findMany({
            where: {
                isActive: true,
                billingCycle: "YEARLY"
            },
            include: {
                user: {
                    select: { id: true, subscriptionCredits: true }
                }
            }
        });

        if (!yearlySubscriptions.length) {
            console.log("✅ No active yearly subscriptions found.");
            return;
        }

        let distributed = 0;

        for (const sub of yearlySubscriptions) {
            // Determine monthly allocation from config
            const planConfig = PLANS[sub.plan];
            if (!planConfig) continue;

            const monthlyAllocation = planConfig.credits.MONTHLY; // 300 for PRO, 900 for PRO_PLUS

            // Check if distribution is due (more than 30 days since last distribution)
            const lastDistributed = sub.lastCreditDistributedAt;
            const daysSinceLastDrip = lastDistributed
                ? (now - new Date(lastDistributed)) / (1000 * 60 * 60 * 24)
                : Infinity; // null means never distributed (first cycle handled by webhook)

            // Skip if distributed less than 28 days ago (safety margin for monthly)
            if (daysSinceLastDrip < 28) continue;

            // Skip first month — webhook already grants initial credits on activation
            if (!lastDistributed) {
                // Mark as distributed so next month's drip triggers
                await prisma.subscription.update({
                    where: { id: sub.id },
                    data: { lastCreditDistributedAt: now }
                });
                continue;
            }

            // Drip monthly credits (ACCUMULATE, not reset)
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: sub.userId },
                    data: {
                        subscriptionCredits: { increment: monthlyAllocation }
                    }
                }),
                prisma.subscription.update({
                    where: { id: sub.id },
                    data: { lastCreditDistributedAt: now }
                }),
                prisma.aiCreditLedger.create({
                    data: {
                        userId: sub.userId,
                        credits: monthlyAllocation,
                        source: "PLAN_CYCLE",
                        reason: `Yearly plan monthly drip: +${monthlyAllocation} credits`
                    }
                })
            ]);

            distributed++;
        }

        console.log(`✅ Yearly drip: distributed credits to ${distributed} subscription(s).`);
    } catch (err) {
        console.error("❌ YEARLY DRIP CRON FAILED:", err);
    }
});
