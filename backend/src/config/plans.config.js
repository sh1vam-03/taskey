import { PlanType } from "@prisma/client";

// ==========================================
// 1. AI USAGE COSTS (In Credits)
// ==========================================
/**
 * Plans & AI Cost Configuration
 *
 * AI_COSTS defines the credit billing rules for every model.
 *
 * CHAT models:
 *   base           – flat credits charged per request (covers overhead)
 *   per_1000_tokens – credits per 1,000 tokens (prompt + completion)
 *   max_per_call    – hard cap per single request (protects against runaway prompts)
 *
 * VOICE models:
 *   per_minute  – credits per minute of audio processed / generated
 *   rounding    – "ceil" (always round up to next full minute)
 *
 * TOOL usage:
 *   per_request         – cost for a standard Tavily search
 *   advanced_multiplier – unused for now; reserved for deep-research tier
 *
 * All values are in your internal "credits" unit.
 * Adjust to match your business pricing strategy.
 */

export const AI_COSTS = {
    CHAT: {
        // ── OpenAI ────────────────────────────────────────────
        "gpt-4o-mini": {
            base: 1,              // flat per request
            per_1000_tokens: 2,   // per 1k tokens (prompt + completion)
            max_per_call: 200     // safety cap
        },
        "gpt-4o": {
            base: 2,
            per_1000_tokens: 8,
            max_per_call: 500
        },

        // ── Sarvam ────────────────────────────────────────────
        "sarvam-m": {
            base: 1,
            per_1000_tokens: 2,   // Same rate for now — tune after real usage data
            max_per_call: 200
        }
    },

    VOICE: {
        // ── OpenAI STT ────────────────────────────────────────
        "whisper-1": {
            per_minute: 10,
            rounding: "ceil"
        },
        // ── OpenAI TTS ────────────────────────────────────────
        "tts-1": {
            per_minute: 20,
            rounding: "ceil"
        },
        // ── Sarvam STT ────────────────────────────────────────
        "saaras:v3": {
            per_minute: 8,        // ~20% cheaper than Whisper — good selling point for India
            rounding: "ceil"
        },
        // ── Sarvam TTS ────────────────────────────────────────
        "bulbul:v3": {
            per_minute: 15,       // ~25% cheaper than OpenAI TTS
            rounding: "ceil"
        }
    },

    TOOL: {
        "tavily": {
            per_request: 10,
            advanced_multiplier: 20   // reserved for future "deep research" mode
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
