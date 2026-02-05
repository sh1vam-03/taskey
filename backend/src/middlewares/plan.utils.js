import { PLANS } from "../config/plans.config.js";
import { PlanType } from "@prisma/client";

// Re-construct PLAN_RANK for compatibility with requirePlan.js
export const PLAN_RANK = {
    [PlanType.FREE]: PLANS[PlanType.FREE].rank,
    [PlanType.PRO]: PLANS[PlanType.PRO].rank,
    [PlanType.PRO_PLUS]: PLANS[PlanType.PRO_PLUS].rank
};
