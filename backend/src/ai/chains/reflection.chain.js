import { validateSchedules } from "../validators/schedule.validator.js";

const MAX_REPAIR_ATTEMPTS = 2;

export const reflectAndRepairPlan = async ({
    agent,
    originalInput,
    aiResult,
}) => {
    let attempt = 0;
    let lastError = null;

    while (attempt <= MAX_REPAIR_ATTEMPTS) {
        try {
            validateSchedules(aiResult.schedules);
            return aiResult;
        } catch (error) {
            lastError = error;
            attempt++;

            if (attempt > MAX_REPAIR_ATTEMPTS) break;

            aiResult = await agent.run({
                mode: "REFLECTION",
                input: originalInput,
                previousResult: aiResult,
                validationError: error.message,
            });
        }
    }

    throw new Error(
        `Unable to create a safe plan. Reason: ${lastError.message}`
    );
};
