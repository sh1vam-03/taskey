/* -------------------------------------------------------------------------- */
/*                       PRODUCTIVITY SCORE (WEIGHTED)                        */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                       SCORE CALCULATIONS                                   */
/* -------------------------------------------------------------------------- */

const clamp = (v, min = 0, max = 100) =>
    Math.max(min, Math.min(max, v));

/**
 * Calculates the pure Lifestyle/Behavior Score (0-100)
 * Based ONLY on user input (Sleep, Exercise, Mood)
 */
export const calculateBehaviorScore = ({
    sleepHours,
    exercise,
    mood // HAPPY, NEUTRAL, SAD
}) => {
    let score = 0;

    // 1. Sleep (Max 40 pts)
    if (sleepHours != null) {
        if (sleepHours >= 7) score += 40;       // Optimal
        else if (sleepHours >= 5) score += 20;  // Acceptable
        else score += 0;                        // Deprived
    }

    // 2. Exercise (Max 30 pts)
    if (exercise === true) score += 30;

    // 3. Mood (Max 30 pts)
    if (mood === "HAPPY") score += 30;
    else if (mood === "NEUTRAL") score += 15;
    else score += 0; // SAD

    return clamp(Math.round(score));
};

/**
 * Calculates the Productivity Score (0-100)
 * Composite of Task Execution (60%) and Behavior (40%)
 */
export const calculateProductivityScore = ({
    total,
    completed,
    missed,
    behaviorScore // 0-100 (Required, calculated via calculateBehaviorScore)
}) => {
    let executionScore = 0;

    // 1. Task Execution (0-100 base)
    if (total > 0) {
        executionScore = (completed / total) * 100;
    }

    // 2. Penalties for Missed Tasks
    if (missed > 0) {
        executionScore -= Math.min(missed * 5, 20); // -5 per missed, max -20
    }
    executionScore = clamp(executionScore);

    // 3. Composite Formula
    // 70% Execution + 30% Behavior
    const finalScore = (executionScore * 0.7) + (behaviorScore * 0.3);

    return clamp(Math.round(finalScore));
};
