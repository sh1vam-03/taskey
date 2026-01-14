import { PlanType } from "@prisma/client";

export const PLANS = {
    [PlanType.FREE]: {
        MONTHLY: { price: 0, tokens: 100 },
        YEARLY: { price: 0, tokens: 100 },
    },
    [PlanType.PRO]: {
        MONTHLY: { price: 49900, tokens: 1000 }, // 499 INR
        YEARLY: { price: 499900, tokens: 12000 },
    },
    [PlanType.PRO_PLUS]: {
        MONTHLY: { price: 99900, tokens: 2500 },
        YEARLY: { price: 999900, tokens: 30000 },
    },
    [PlanType.ULTRA]: {
        MONTHLY: { price: 199900, tokens: 10000 },
        YEARLY: { price: 1999900, tokens: 120000 },
    },
};

export const PLAN_ORDER = {
    [PlanType.FREE]: 0,
    [PlanType.PRO]: 1,
    [PlanType.PRO_PLUS]: 2,
    [PlanType.ULTRA]: 3,
};
