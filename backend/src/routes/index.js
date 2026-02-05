import express, { Router } from "express";
const router = express.Router();

import healthRoutes from "./health.routes.js";
import publicPagesRoutes from "./publicPages.routes.js";
import authRoutes from "./auth.routes.js";
import taskRoutes from "./task.routes.js";
import taskCompletionRoutes from "./taskCompletion.routes.js";
import categoryRoutes from "./category.routes.js";
import calendarRoutes from "./calendar.routes.js";
import scheduleRoutes from "./schedule.routes.js";
import scheduleCompletionRoutes from "./scheduleCompletion.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import behaviorRoutes from "./behavior.routes.js";
// import usageRoutes from "./usage.routes.js";
import billingRoutes from "./billing.routes.js";
import aiRoutes from "../ai/routes/ai.routes.js";
import voiceRoutes from "../ai/routes/voice.routes.js";
// voiceRoutes import removed

router.use("/api", healthRoutes);
// ...
router.use("/api/billing", billingRoutes);
router.use("/api/ai", aiRoutes);
router.use("/api/ai", voiceRoutes); // Mounts voice routes under /api/ai/conversations/...
// router.use("/api/voice", voiceRoutes); // Consolidated into aiRoutes

export default router;