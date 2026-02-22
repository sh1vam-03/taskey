/**
 * Voice Routes
 *
 * NOTE: The main voice pipeline (POST /conversations/:id/voice) is defined
 * in ai.routes.js to avoid duplicate handler conflicts.
 *
 * This file is reserved for any future standalone voice utilities that are
 * separate from the conversation context.
 *
 * Currently: no active routes (all voice endpoints live in ai.routes.js).
 */

import { Router } from "express";

const router = Router();

// ✅ FIX: Removed POST /conversations/:id/voice from here.
// It was identical to the route in ai.routes.js → duplicate handler conflict.
// ai.routes.js is the single authoritative source for all AI + voice routes.

export default router;
