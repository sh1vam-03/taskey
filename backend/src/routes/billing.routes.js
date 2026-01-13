import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import * as billingController from "../controllers/billing.controller.js";

const router = Router();

router.post("/subscribe", authMiddleware, billingController.subscribe);
router.post("/cancel", authMiddleware, billingController.cancelMySubscription);
router.post("/downgrade", authMiddleware, billingController.downgradePlan);

export default router;
