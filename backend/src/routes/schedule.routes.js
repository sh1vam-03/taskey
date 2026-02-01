import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { usageLimit } from "../middlewares/usageLimit.middleware.js";
import * as scheduleController from "../controllers/schedule.controller.js";

const router = express.Router();

/**
 * CREATE schedule (LIMITED for FREE)
 */
router.post(
    "/",
    authMiddleware,
    usageLimit("SCHEDULE"),
    scheduleController.createSchedule
);

/**
 * READ schedules (NO LIMIT)
 */
router.get("/", authMiddleware, scheduleController.getSchedules);

/**
 * UPDATE schedule (NO LIMIT)
 */
router.put("/:id", authMiddleware, scheduleController.updateSchedule);

/**
 * DELETE schedule (NO LIMIT)
 */
router.delete("/:id", authMiddleware, scheduleController.deleteSchedule);

export default router;
