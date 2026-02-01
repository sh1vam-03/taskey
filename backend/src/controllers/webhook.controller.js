import crypto from "crypto";
import asyncHandler from "../utils/asyncHandler.js";
import * as webhookService from "../services/webhook.service.js";

export const razorpayWebhook = asyncHandler(async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(req.body.toString()) // ✅ FIXED
        .digest("hex");

    if (signature !== expectedSignature) {
        return res.status(400).json({ message: "Invalid signature" });
    }

    const event = JSON.parse(req.body.toString());

    await webhookService.handleRazorpayEvent(event);

    res.status(200).json({ received: true });
});
