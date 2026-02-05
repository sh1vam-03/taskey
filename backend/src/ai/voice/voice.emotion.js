export const VOICE_EMOTIONS = {
    CALM: {
        rate: 0.95,
        pitch: -1,
        style: "calm",
    },

    ENCOURAGING: {
        rate: 1.05,
        pitch: 1,
        style: "cheerful",
    },

    CONCERNED: {
        rate: 0.9,
        pitch: -2,
        style: "empathetic",
    },

    FIRM_CARING: {
        rate: 1.0,
        pitch: 0,
        style: "serious",
    },

    CELEBRATORY: {
        rate: 1.1,
        pitch: 2,
        style: "excited",
    },
};

/**
 * Infers the best voice emotion based on the AI response content.
 * @param {Object} context - { summary: string }
 * @returns {Object} Voice emotion config
 */
export const inferVoiceEmotion = ({ summary }) => {
    if (!summary) return VOICE_EMOTIONS.CALM;

    const text = summary.toLowerCase();

    // Positive / Celebratory
    if (text.includes("congratulations") || text.includes("great job") || text.includes("awesome") || text.includes("proud")) {
        return VOICE_EMOTIONS.CELEBRATORY;
    }

    // Encouraging / Roadmap
    if (text.includes("you can do this") || text.includes("let's start") || text.includes("schedule")) {
        return VOICE_EMOTIONS.ENCOURAGING;
    }

    // Concerned / Health
    if (text.includes("sleep") || text.includes("tired") || text.includes("rest") || text.includes("burnout")) {
        return VOICE_EMOTIONS.CONCERNED;
    }

    // Firm / Discipline
    if (text.includes("focus") || text.includes("deadline") || text.includes("waste time")) {
        return VOICE_EMOTIONS.FIRM_CARING;
    }

    // Default
    return VOICE_EMOTIONS.CALM;
};
