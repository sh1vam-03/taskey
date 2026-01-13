import crypto from "crypto";
import asyncHandler from "../utils/asyncHandler.js";
import * as webhookService from "../services/razorpayWebhook.service.js";

export const razorpayWebhook = asyncHandler(async (req, res) => {
    const signature = req.headers["x-razorpay-signature"];

    const body = req.body.toString();
    const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest("hex");

    if (signature !== expected) {
        return res.status(400).send("Invalid signature");
    }

    const event = JSON.parse(body);

    await webhookService.handleEvent(event);

    res.status(200).json({ received: true });
});
