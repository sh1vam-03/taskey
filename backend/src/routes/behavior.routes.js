import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import * as behaviorController from "../controllers/behavior.controller.js";

const router = Router();

// No usageLimit middleware here — behavior uses upsert (create + update same endpoint)
// Limit checking is handled in the controller, only for NEW logs
router.post("/", authMiddleware, behaviorController.upsertBehavior);
router.get("/summary", authMiddleware, behaviorController.getBehaviorSummary);
router.get("/latest", authMiddleware, behaviorController.getLatestBehavior);
router.get("/explain/:date", authMiddleware, behaviorController.explainScore);
router.get("/:date", authMiddleware, behaviorController.getBehaviorByDate);

export default router;
