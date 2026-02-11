import crypto from "crypto";
import prisma from "../config/db.js";
import { PLANS } from "../config/plans.config.js";

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

    // Update Subscription
    // Calculate next credits based on plan
    const planConfig = PLANS[subscription.plan];
    const credits = planConfig?.credits[subscription.billingCycle] || 0;

    await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
            isActive: true, // It is charged, so active
            lastBilledAt: new Date(),
            nextBillingAt: new Date(subEntity.charge_at * 1000), // Unix to Date
            cycleCredits: credits, // Reset/Refill credits
            lastCreditGrantedAt: new Date()
        }
    });

    // Record Payment
    await prisma.payment.upsert({
        where: { razorpayPaymentId: paymentEntity.id },
        update: {
            status: "PAID",
            amount: paymentEntity.amount, // in paise
            updatedAt: new Date()
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

    // Log credit ledger? (Optional but good)
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
            isActive: false, // Cancelled immediately or at end?
            // Razorpay usually keeps it 'active' until period end, but status changes.
            // But for simplicity, we mark as cancelled if the event says halted/cancelled.
            // If it's just 'scheduled for cancellation', we might wait.
            // Let's rely on `subEntity.status`.
            endsAt: subEntity.end_at ? new Date(subEntity.end_at * 1000) : new Date()
        }
    });
};

const handlePaymentCaptured = async (payload) => {
    // Handle one-off payments (Credits top-up)
    // Needs logic to find the user via notes or order_id
    const paymentEntity = payload.payment.entity;

    // Check if it's already recorded
    const existing = await prisma.payment.findUnique({
        where: { razorpayPaymentId: paymentEntity.id }
    });

    if (existing) {
        await prisma.payment.update({
            where: { id: existing.id },
            data: { status: "PAID" }
        });
        // Grant credits if it was a top-up
    }
};
