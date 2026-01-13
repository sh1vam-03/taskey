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
