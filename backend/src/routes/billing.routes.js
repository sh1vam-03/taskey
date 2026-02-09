import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import requireRole from "../middlewares/requireRole.js";
import * as billingController from "../controllers/billing.controller.js";

const router = Router();

router.post(
    "/subscribe",
    authMiddleware,
    requireRole("USER"), // optional but good
    billingController.subscribe
);

router.post(
    "/cancel",
    authMiddleware,
    requireRole("USER"),
    billingController.cancelMySubscription
);

router.post(
    "/downgrade",
    authMiddleware,
    requireRole("USER"),
    billingController.downgradePlan
);

router.get(
    "/current",
    authMiddleware,
    requireRole("USER"),
    billingController.getCurrentSubscription
);

export default router;
