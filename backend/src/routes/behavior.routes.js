import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { usageLimit } from "../middlewares/usageLimit.middleware.js";
import * as behaviorController from "../controllers/behavior.controller.js";

const router = Router();

/**
 * CREATE / UPDATE behavior
 * 👉 usage limit applies ONLY here
 */
router.post(
    "/",
    authMiddleware,
    usageLimit("BEHAVIOR"),
    behaviorController.upsertBehavior
);

/**
 * READ routes (NO LIMIT)
 */
router.get(
    "/summary",
    authMiddleware,
    behaviorController.getBehaviorSummary
);

router.get(
    "/explain/:date",
    authMiddleware,
    behaviorController.explainScore
);

router.get(
    "/:date",
    authMiddleware,
    behaviorController.getBehaviorByDate
);

export default router;
