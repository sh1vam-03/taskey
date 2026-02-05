/**
 * Safety Validator
 * Basic input sanitization to prevent prompt injection or malicious content.
 */
export const validateInputSafety = (text) => {
    if (!text) return true;

    // 1. Check for common jailbreak patterns
    const jailbreakPatterns = [
        /ignore previous instructions/i,
        /system override/i,
        /dev mode/i,
    ];

    for (const pattern of jailbreakPatterns) {
        if (pattern.test(text)) {
            console.warn("Safety Check Failed: Jailbreak attempt detected.");
            return false;
        }
    }

    // 2. Check length (basic DoS protection)
    if (text.length > 50000) {
        return false;
    }

    return true;
};
