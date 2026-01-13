import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getMyUsage } from "../controllers/usage.controller.js";

const router = Router();

router.get("/me", authMiddleware, getMyUsage);

export default router;
