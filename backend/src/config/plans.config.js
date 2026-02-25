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
 *   base            – flat credits per request (covers overhead)
 *   per_1000_tokens – credits per 1,000 tokens (prompt + completion)
 *   max_per_call    – hard cap per single request
 *
 * VOICE models:
 *   per_minute – credits per minute of audio processed / generated
 *   rounding   – "ceil" (always round up to next full minute)
 *
 * TOOL usage:
 *   per_request – cost for a standard Tavily search
 */

export const AI_COSTS = {
    CHAT: {
        // ── Google Gemini ──────────────────────────────────────
        "gemini-1.5-flash": {
            base: 1,
            per_1000_tokens: 1,    // Most affordable — ideal default for all users
            max_per_call: 80
        },

        // ── OpenAI ────────────────────────────────────────────
        "gpt-4o-mini": {
            base: 1,
            per_1000_tokens: 2,
            max_per_call: 200
        },
        "gpt-4o": {
            base: 2,
            per_1000_tokens: 8,
            max_per_call: 500
        },

        // ── Sarvam ────────────────────────────────────────────
        "sarvam-m": {
            base: 1,
            per_1000_tokens: 2,
            max_per_call: 200
        },
        "sarvam-30b": {
            base: 1,
            per_1000_tokens: 2,
            max_per_call: 200
        }
    },

    VOICE: {
        // ── STT: OpenAI Whisper ───────────────────────────────
        "whisper-1": {
            per_minute: 10,
            rounding: "ceil"
        },
        // ── TTS: OpenAI ───────────────────────────────────────
        "tts-1": {
            per_minute: 20,
            rounding: "ceil"
        },
        // ── STT: Sarvam Saaras ────────────────────────────────
        "saaras:v3": {
            per_minute: 8,
            rounding: "ceil"
        },
        // ── TTS: Sarvam Bulbul ────────────────────────────────
        "bulbul:v3": {
            per_minute: 15,
            rounding: "ceil"
        }
    },

    TOOL: {
        "tavily": {
            per_request: 10,
            advanced_multiplier: 20
        }
    }
};

// ─────────────────────────────────────────────────────────────
// MODEL_INFO — display catalog for the frontend settings UI.
// Frontend uses this to render pricing cards so users can
// compare cost before choosing a model.
// ─────────────────────────────────────────────────────────────

export const MODEL_INFO = {
    // ── LLM options (used for both text chat AND voice thinking) ──
    CHAT_MODELS: [
        {
            id: "gemini-1.5-flash",
            name: "Gemini 1.5 Flash",
            provider: "Google",
            description: "Fast, smart and multilingual. Best balance of speed, capability and cost.",
            isDefault: true,
            badge: "⚡ Recommended",
            pricing: {
                label: "1 credit/request + 1 credit/1k tokens",
                base: AI_COSTS.CHAT["gemini-1.5-flash"].base,
                per_1000_tokens: AI_COSTS.CHAT["gemini-1.5-flash"].per_1000_tokens,
                max_per_call: AI_COSTS.CHAT["gemini-1.5-flash"].max_per_call
            },
            supportsTools: true,
            supportsVoice: true
        },
        {
            id: "sarvam-m",
            name: "Sarvam-M",
            provider: "Sarvam AI",
            description: "High-performance multilingual and reasoning model. Ideal for text research and chat.",
            isDefault: false,
            badge: "🇮🇳 Indic Chat",
            pricing: {
                label: "1 credit/request + 2 credits/1k tokens",
                base: AI_COSTS.CHAT["sarvam-m"].base,
                per_1000_tokens: AI_COSTS.CHAT["sarvam-m"].per_1000_tokens,
                max_per_call: AI_COSTS.CHAT["sarvam-m"].max_per_call
            },
            supportsTools: false,
            supportsVoice: true
        },
        {
            id: "sarvam-30b",
            name: "Sarvam 30B",
            provider: "Sarvam AI",
            description: "Optimised for Indian languages — Hindi, Marathi, Tamil and more. Full tool calling.",
            isDefault: false,
            badge: "🇮🇳 Indian Languages",
            pricing: {
                label: "1 credit/request + 2 credits/1k tokens",
                base: AI_COSTS.CHAT["sarvam-30b"].base,
                per_1000_tokens: AI_COSTS.CHAT["sarvam-30b"].per_1000_tokens,
                max_per_call: AI_COSTS.CHAT["sarvam-30b"].max_per_call
            },
            supportsTools: true,
            supportsVoice: true
        },
        {
            id: "gpt-4o-mini",
            name: "GPT-4o Mini",
            provider: "OpenAI",
            description: "Powerful reasoning and tool use. Excellent for complex multi-step tasks.",
            isDefault: false,
            badge: "🤖 OpenAI",
            pricing: {
                label: "1 credit/request + 2 credits/1k tokens",
                base: AI_COSTS.CHAT["gpt-4o-mini"].base,
                per_1000_tokens: AI_COSTS.CHAT["gpt-4o-mini"].per_1000_tokens,
                max_per_call: AI_COSTS.CHAT["gpt-4o-mini"].max_per_call
            },
            supportsTools: true,
            supportsVoice: true
        }
    ],

    // ── TTS options ───────────────────────────────────────────
    TTS_MODELS: [
        {
            id: "bulbul:v3",
            name: "Sarvam Bulbul v3",
            provider: "Sarvam AI",
            description: "Indian voices with auto-language detection. Supports Hindi, English, Tamil and 8 more.",
            isDefault: true,
            badge: "🇮🇳 Indian Voices",
            pricing: {
                label: "15 credits/minute",
                per_minute: AI_COSTS.VOICE["bulbul:v3"].per_minute
            }
        },
        {
            id: "tts-1",
            name: "OpenAI TTS",
            provider: "OpenAI",
            description: "Natural, expressive English voice. High quality output.",
            isDefault: false,
            badge: "🤖 OpenAI",
            pricing: {
                label: "20 credits/minute",
                per_minute: AI_COSTS.VOICE["tts-1"].per_minute
            }
        }
    ],

    // ── STT options ───────────────────────────────────────────
    STT_MODELS: [
        {
            id: "saaras:v3",
            name: "Sarvam Saaras v3",
            provider: "Sarvam AI",
            description: "Best accuracy for Indian languages and accents. Supports Hindi, English, Tamil and more.",
            isDefault: true,
            badge: "🇮🇳 Indian Accents",
            pricing: {
                label: "8 credits/minute",
                per_minute: AI_COSTS.VOICE["saaras:v3"].per_minute
            }
        },
        {
            id: "whisper-1",
            name: "OpenAI Whisper",
            provider: "OpenAI",
            description: "Universal transcription. Excellent for English and international languages.",
            isDefault: false,
            badge: "🤖 OpenAI",
            pricing: {
                label: "10 credits/minute",
                per_minute: AI_COSTS.VOICE["whisper-1"].per_minute
            }
        }
    ]
};

/** Valid model ID sets — used for input validation in the controller */
export const VALID_CHAT_MODELS = MODEL_INFO.CHAT_MODELS.map(m => m.id);
// ["gemini-1.5-flash", "sarvam-30b", "gpt-4o-mini"]

export const VALID_TTS_MODELS = MODEL_INFO.TTS_MODELS.map(m => m.id);
// ["bulbul:v3", "tts-1"]

export const VALID_STT_MODELS = MODEL_INFO.STT_MODELS.map(m => m.id);
// ["saaras:v3", "whisper-1"]

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
