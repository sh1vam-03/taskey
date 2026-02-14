import { PlanType } from "@prisma/client";

// ==========================================
// 1. AI USAGE COSTS (In Credits)
// ==========================================
export const AI_COSTS = {
    CHAT: {
        "gpt-4o-mini": 1
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
// 1.5. TOP-UP PACKS
// ==========================================
export const TOP_UP_PLANS = {
    CREDIT_100: {
        id: "CREDIT_100",
        label: "100 Credits",
        credits: 100,
        price: 99 // INR
    },
    CREDIT_500: {
        id: "CREDIT_500",
        label: "500 Credits",
        credits: 500,
        price: 399
    },
    CREDIT_1000: {
        id: "CREDIT_1000",
        label: "1000 Credits",
        credits: 1000,
        price: 699
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
            MONTHLY: 10,
            YEARLY: 10
        },
        limits: {
            task: 100,
            schedule: 300,
            behavior: 30
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
            task: 300,
            schedule: 600,
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
            task: 500,
            schedule: 1000,
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
