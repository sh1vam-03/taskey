import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { usageLimit } from "../middlewares/usageLimit.middleware.js";
import * as taskController from "../controllers/task.controller.js";

const router = express.Router();

/**
 * CREATE TASK (LIMITED FOR FREE)
 */
router.post(
    "/",
    authMiddleware,
    usageLimit("TASK"),
    taskController.createTask
);

/**
 * READ TASKS (NO LIMIT)
 */
router.get("/", authMiddleware, taskController.getTasks);
router.get("/:id", authMiddleware, taskController.getTask);

/**
 * UPDATE TASK (NO LIMIT)
 */
router.put("/:id", authMiddleware, taskController.updateTask);

/**
 * DELETE TASK (NO LIMIT)
 */
router.delete("/:id", authMiddleware, taskController.deleteTask);

export default router;
