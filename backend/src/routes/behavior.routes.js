import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { usageLimit } from "../middlewares/usageLimit.middleware.js";
import * as behaviorController from "../controllers/behavior.controller.js";

const router = Router();

router.post("/", authMiddleware, usageLimit("BEHAVIOR"), behaviorController.upsertBehavior);
router.get("/summary", authMiddleware, behaviorController.getBehaviorSummary);
router.get("/latest", authMiddleware, behaviorController.getLatestBehavior);
router.get("/explain/:date", authMiddleware, behaviorController.explainScore);
router.get("/:date", authMiddleware, behaviorController.getBehaviorByDate);

export default router;
