// src/ai/utils/token.utils.js

/**
 * VERY SIMPLE token estimator
 * (safe approximation, not exact)
 */
export const estimateTokens = (inputText = "", aiResult = {}) => {
    let tokens = 0;

    // input cost
    tokens += Math.ceil(inputText.length / 4);

    // output cost
    if (aiResult?.tasks) {
        tokens += aiResult.tasks.length * 50;
    }

    if (aiResult?.schedules) {
        tokens += aiResult.schedules.length * 30;
    }

    if (aiResult?.notes) {
        tokens += aiResult.notes.join(" ").length / 4;
    }

    return Math.max(50, Math.floor(tokens)); // minimum cost
};
