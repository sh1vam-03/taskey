import cron from "node-cron";
import prisma from "../config/db.js";

/**
 * CREDIT EXPIRY CRON
 * Runs daily at 00:15 UTC
 *
 * Finds all users whose subscription credits have expired
 * (subscriptionCreditsExpiresAt <= now) and clears them.
 * Top-up credits are NEVER touched.
 */
cron.schedule("15 0 * * *", async () => {
    const now = new Date();
    console.log("🕒 CREDIT EXPIRY CRON:", now.toISOString());

    try {
        // Find users with expired subscription credits
        const expiredUsers = await prisma.user.findMany({
            where: {
                subscriptionCredits: { gt: 0 },
                subscriptionCreditsExpiresAt: { lte: now }
            },
            select: {
                id: true,
                subscriptionCredits: true
            }
        });

        if (!expiredUsers.length) {
            console.log("✅ No expired subscription credits found.");
            return;
        }

        for (const user of expiredUsers) {
            await prisma.$transaction([
                // Clear expired subscription credits
                prisma.user.update({
                    where: { id: user.id },
                    data: {
                        subscriptionCredits: 0,
                        subscriptionCreditsExpiresAt: null
                    }
                }),
                // Ledger entry for audit trail
                prisma.aiCreditLedger.create({
                    data: {
                        userId: user.id,
                        credits: -user.subscriptionCredits,
                        source: "PLAN_CYCLE",
                        reason: "Subscription credits expired"
                    }
                })
            ]);
        }

        console.log(`✅ Cleared expired credits for ${expiredUsers.length} user(s).`);
    } catch (err) {
        console.error("❌ CREDIT EXPIRY CRON FAILED:", err);
    }
});
