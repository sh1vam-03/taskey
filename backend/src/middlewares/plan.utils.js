import { PlanType } from "@prisma/client";

export const PLAN_RANK = {
    [PlanType.FREE]: 0,
    [PlanType.PRO]: 1,
    [PlanType.PRO_PLUS]: 2,
    [PlanType.ULTRA]: 3,
};
