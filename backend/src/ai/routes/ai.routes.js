import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { executeAi, getHistory } from "../controllers/ai.controller.js";

const router = Router();

/**
 * POST /api/ai/text/execute
 * Main AI execution endpoint
 */
router.post("/execute", authMiddleware, executeAi);

/**
 * GET /api/ai/text/history
 * Fetch past AI conversations
 */
router.get("/history", authMiddleware, getHistory);

export default router;
