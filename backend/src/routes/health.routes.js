import express from "express";
import healthCheck from "../controllers/health.controller.js";
import { requireRole } from "../middlewares/role.middleware.js";
const router = express.Router();

router.get("/health", requireRole("ADMIN"), healthCheck);

export default router;
