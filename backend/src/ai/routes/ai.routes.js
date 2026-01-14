import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { executeAi } from "../controllers/ai.controller.js";

const router = Router();

/**
 * POST /api/ai/text/execute
 * Main AI execution endpoint
 */
router.post("/execute", authMiddleware, executeAi);

export default router;
