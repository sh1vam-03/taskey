/**
 * Language Detector for Bulbul v3 TTS
 *
 * Analyzes the Unicode character composition of LLM output text and returns
 * the correct BCP-47 language code for Sarvam's Bulbul v3 TTS model.
 *
 * WHY THIS EXISTS:
 * Bulbul v3 requires a `target_language_code` param. The LLM (sarvam-m or
 * gpt-4o-mini) responds in whatever language the user wrote in — Hindi, Tamil,
 * Hinglish, English, etc. Instead of forcing users to manually set a TTS language,
 * we detect it automatically from the actual text characters.
 *
 * SUPPORTED BULBUL v3 LANGUAGES:
 *   en-IN  English
 *   hi-IN  Hindi
 *   bn-IN  Bengali
 *   ta-IN  Tamil
 *   te-IN  Telugu
 *   kn-IN  Kannada
 *   ml-IN  Malayalam
 *   mr-IN  Marathi      ← shares Devanagari with Hindi (see MARATHI NOTE below)
 *   gu-IN  Gujarati
 *   pa-IN  Punjabi
 *   od-IN  Odia
 *
 * HINGLISH HANDLING:
 * Hinglish text mixes Latin (English) and Devanagari (Hindi) characters.
 * Bulbul v3 does not have a "Hinglish" code — we map it to "hi-IN", which
 * handles code-switched content well in practice.
 *
 * MARATHI NOTE:
 * Both Hindi and Marathi use Devanagari script, making them indistinguishable
 * by Unicode character analysis alone. We default Devanagari → "hi-IN".
 * If your app primarily serves Marathi users, change DEVANAGARI_DEFAULT below.
 *
 * DETECTION ALGORITHM:
 * 1. Scan every character and classify it into a Unicode script block.
 * 2. Count how many characters belong to each script.
 * 3. If an Indian script is dominant (≥ 15% of significant chars) → use that code.
 * 4. Otherwise → "en-IN" (Latin / unknown).
 */

// ─────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────

/**
 * What language code to use when Devanagari script is detected.
 * Hindi and Marathi both use Devanagari — change to "mr-IN" if needed.
 */
const DEVANAGARI_DEFAULT = "hi-IN";

/**
 * Minimum ratio of a script's characters to total significant characters
 * for that script to be considered "dominant".
 * 0.15 = 15% — low enough to catch Hinglish, high enough to ignore stray chars.
 */
const DOMINANCE_THRESHOLD = 0.15;

// ─────────────────────────────────────────────────────────────
// UNICODE SCRIPT RANGES
// Each entry maps a Unicode block to a Bulbul v3 language code.
// ─────────────────────────────────────────────────────────────

const SCRIPT_RANGES = [
    // Devanagari — Hindi AND Marathi (see DEVANAGARI_DEFAULT above)
    { min: 0x0900, max: 0x097F, code: DEVANAGARI_DEFAULT },
    // Bengali
    { min: 0x0980, max: 0x09FF, code: "bn-IN" },
    // Gurmukhi → Punjabi
    { min: 0x0A00, max: 0x0A7F, code: "pa-IN" },
    // Gujarati
    { min: 0x0A80, max: 0x0AFF, code: "gu-IN" },
    // Odia
    { min: 0x0B00, max: 0x0B7F, code: "od-IN" },
    // Tamil
    { min: 0x0B80, max: 0x0BFF, code: "ta-IN" },
    // Telugu
    { min: 0x0C00, max: 0x0C7F, code: "te-IN" },
    // Kannada
    { min: 0x0C80, max: 0x0CFF, code: "kn-IN" },
    // Malayalam
    { min: 0x0D00, max: 0x0D7F, code: "ml-IN" },
];

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────

/**
 * Detects the dominant language of a text string and returns the
 * appropriate Bulbul v3 `target_language_code`.
 *
 * Examples:
 *   detectTextLanguage("Hello, how are you?")
 *     → "en-IN"
 *
 *   detectTextLanguage("आज का दिन अच्छा रहा।")
 *     → "hi-IN"
 *
 *   detectTextLanguage("Aaj ka din bahut अच्छा था!")   ← Hinglish
 *     → "hi-IN"
 *
 *   detectTextLanguage("நான் நலமாக இருக்கிறேன்.")
 *     → "ta-IN"
 *
 * @param {string} text - The LLM output text to analyze
 * @returns {string} BCP-47 language code for Bulbul v3 (default: "en-IN")
 */
export const detectTextLanguage = (text) => {
    if (!text || text.trim().length === 0) return "en-IN";

    const scriptCounts = {}; // code → character count
    let latinCount = 0;
    let totalSignificant = 0;

    for (const char of text) {
        const cp = char.codePointAt(0);
        if (cp === undefined) continue;

        // ── Skip: ASCII punctuation, digits, whitespace, symbols ──
        if (cp < 0x0041) continue;                           // below 'A'
        if (cp >= 0x0041 && cp <= 0x005A) {                 // A–Z
            latinCount++;
            totalSignificant++;
            continue;
        }
        if (cp >= 0x0061 && cp <= 0x007A) {                 // a–z
            latinCount++;
            totalSignificant++;
            continue;
        }
        if (cp <= 0x007F) continue;                          // other ASCII

        // ── Check against Indian script blocks ──
        let matched = false;
        for (const { min, max, code } of SCRIPT_RANGES) {
            if (cp >= min && cp <= max) {
                scriptCounts[code] = (scriptCounts[code] || 0) + 1;
                totalSignificant++;
                matched = true;
                break;
            }
        }
        // Non-matched Unicode (e.g. Arabic, CJK, emoji) — ignore for detection
    }

    if (totalSignificant === 0) return "en-IN";

    // ── Find the Indian script with the most characters ──
    let dominantCode = null;
    let dominantCount = 0;

    for (const [code, count] of Object.entries(scriptCounts)) {
        if (count > dominantCount) {
            dominantCount = count;
            dominantCode = code;
        }
    }

    // ── No Indian script found → pure English (or unsupported script) ──
    if (!dominantCode) return "en-IN";

    // ── Is the Indian script dominant enough? ──
    // Even at 15% it's dominant — covers Hinglish where Latin chars may be majority
    const ratio = dominantCount / totalSignificant;
    if (ratio >= DOMINANCE_THRESHOLD) return dominantCode;

    // ── Tiny trace of Indian chars in otherwise-Latin text → English ──
    return "en-IN";
};

// ─────────────────────────────────────────────────────────────
// UTILITY — for logging / debugging
// ─────────────────────────────────────────────────────────────

/**
 * Returns a language label for display/logging.
 * @param {string} code - BCP-47 code
 * @returns {string}
 */
export const getLanguageLabel = (code) => {
    const LABELS = {
        "en-IN": "English",
        "hi-IN": "Hindi",
        "bn-IN": "Bengali",
        "ta-IN": "Tamil",
        "te-IN": "Telugu",
        "kn-IN": "Kannada",
        "ml-IN": "Malayalam",
        "mr-IN": "Marathi",
        "gu-IN": "Gujarati",
        "pa-IN": "Punjabi",
        "od-IN": "Odia",
    };
    return LABELS[code] || code;
};