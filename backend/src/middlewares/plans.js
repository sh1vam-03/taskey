import requirePlan from "./requirePlan.js";
import { PlanType } from "@prisma/client";

export const requirePro = requirePlan(PlanType.PRO);
export const requireProPlus = requirePlan(PlanType.PRO_PLUS);
export const requireUltra = requirePlan(PlanType.ULTRA);
