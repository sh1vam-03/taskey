// config/aiTokens.js
export const PLAN_TOKENS = {
    FREE: 0,
    PRO: 50_000,
    PRO_PLUS: 150_000,
    ULTRA: 500_000,
};

export const AI_TOKEN_COST = {
    CHAT: 1,        // per token (LLM tokens)
    VOICE: 5,       // per second OR fixed multiplier
};

// FREE plan limits (monthly)
const FREE_LIMITS = {
    tasks: 20,
    schedules: 30,
    behaviors: 15,
};

import requirePlan from "./requirePlan.js";
import { PlanType, BillingCycle } from "@prisma/client";

export const PLANS = {
    [PlanType.PRO]: {
        MONTHLY: { price: 4900, tokens: 50000 },
        YEARLY: { price: 49900, tokens: 600000 },
    },
    [PlanType.PRO_PLUS]: {
        MONTHLY: { price: 14900, tokens: 150000 },
        YEARLY: { price: 149900, tokens: 1800000 },
    },
    [PlanType.ULTRA]: {
        MONTHLY: { price: 29900, tokens: 300000 },
        YEARLY: { price: 299900, tokens: 3600000 },
    },
};

export const PLAN_ORDER = [PlanType.FREE, PlanType.PRO, PlanType.PRO_PLUS, PlanType.ULTRA];

export const requirePro = requirePlan(PlanType.PRO);
export const requireProPlus = requirePlan(PlanType.PRO_PLUS);
export const requireUltra = requirePlan(PlanType.ULTRA);
