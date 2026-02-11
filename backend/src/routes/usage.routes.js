import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import * as usageController from "../controllers/usage.controller.js";

const router = Router();

router.get("/me", authMiddleware, usageController.getMyUsage);

export default router;
