import { PlanType } from "@prisma/client";

// ==========================================
// 1. AI USAGE COSTS (In Credits)
// ==========================================
export const AI_COSTS = {
    CHAT: {
        base: 1,              // 1 credit per API call minimum
        per_1000_tokens: 2,   // 1 credit per 1k tokens
        max_per_call: 200      // safety cap: e.g., don't charge more than 50 credits per call without human review
    },
    VOICE: {
        "whisper-1": {
            per_minute: 10,      // 1 credit per minute transcribed
            rounding: "ceil"    // round up partial minutes
        },
        "tts-1": {
            per_minute: 20,      // 2 credits per minute generated
            rounding: "ceil"
        }
    },
    TOOL: {
        "tavily": {
            per_request: 10,     // 1 credit per basic search
            advanced_multiplier: 20  // if advanced search used, charge 2 credits
        }
    }
};


// ==========================================
// 1.5. TOP-UP PACKS
// ==========================================
export const TOP_UP_PLANS = {
    CREDIT_200: {
        id: "CREDIT_200",
        label: "200 Credits",
        credits: 200,
        price: 29 // INR
    },
    CREDIT_450: {
        id: "CREDIT_450",
        label: "450 Credits",
        credits: 450,
        price: 49 // INR
    },
    CREDIT_1000: {
        id: "CREDIT_1000",
        label: "1000 Credits",
        credits: 1000,
        price: 99 // INR
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
            task: 200,
            schedule: 50,
            behavior: 30
        },
        rank: 0
    },
    [PlanType.PRO]: {
        label: "Pro",
        price: {
            MONTHLY: 29, // INR
            YEARLY: 299
        },
        credits: {
            MONTHLY: 300,
            YEARLY: 3600 // 300 * 12
        },
        limits: {
            task: 300,
            schedule: 100,
            behavior: 50
        },
        rank: 1
    },
    [PlanType.PRO_PLUS]: {
        label: "Pro Plus",
        price: {
            MONTHLY: 79,
            YEARLY: 799
        },
        credits: {
            MONTHLY: 900,
            YEARLY: 10800 // 900 * 12
        },
        limits: {
            task: 1000,
            schedule: 500,
            behavior: 100
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
