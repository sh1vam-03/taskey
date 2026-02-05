import { PlanType } from "@prisma/client";

// ==========================================
// 1. AI USAGE COSTS (In Credits)
// ==========================================
export const AI_COSTS = {
    CHAT: {
        "gpt-4o-mini": 1,
        "gpt-4o": 2
    },
    VOICE: {
        "whisper-1": 3,
        "tts-1": 3
    },
    TOOL: {
        "tavily": 1
    }
};

// ==========================================
// 2. PLAN LIMITS & PRICING (Single Source of Truth)
// ==========================================
export const PLANS = {
    [PlanType.FREE]: {
        label: "Free Tier",
        price: {
            MONTHLY: 0,
            YEARLY: 0
        },
        credits: {
            MONTHLY: 0,
            YEARLY: 0
        },
        limits: {
            task: 20,
            schedule: 30,
            behavior: 15
        },
        rank: 0
    },
    [PlanType.PRO]: {
        label: "Pro",
        price: {
            MONTHLY: 499, // INR
            YEARLY: 4999
        },
        credits: {
            MONTHLY: 50,
            YEARLY: 600 // 50 * 12
        },
        limits: {
            task: 1000,
            schedule: 1000,
            behavior: 100
        },
        rank: 1
    },
    [PlanType.PRO_PLUS]: {
        label: "Pro Plus",
        price: {
            MONTHLY: 999,
            YEARLY: 9999
        },
        credits: {
            MONTHLY: 90,
            YEARLY: 1080 // 90 * 12
        },
        limits: {
            task: 10000,
            schedule: 10000,
            behavior: 1000
        },
        rank: 2
    }
};

// ==========================================
// 3. HELPERS
// ==========================================
export const PLAN_ORDER = [PlanType.FREE, PlanType.PRO, PlanType.PRO_PLUS];

export const getPlanConfig = (planType) => PLANS[planType] || PLANS[PlanType.FREE];

export const getPlanRank = (planType) => getPlanConfig(planType).rank;
