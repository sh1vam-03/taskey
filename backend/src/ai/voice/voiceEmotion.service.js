import { VOICE_EMOTIONS } from "./voice.emotions.js";

export const inferVoiceEmotion = ({ summary = "", notes = [] }) => {
    const text = `${summary} ${notes.join(" ")}`.toLowerCase();

    if (text.includes("burnout") || text.includes("rest")) {
        return VOICE_EMOTIONS.CONCERNED;
    }

    if (text.includes("reduced") || text.includes("limited")) {
        return VOICE_EMOTIONS.FIRM_CARING;
    }

    if (text.includes("great") || text.includes("nice work")) {
        return VOICE_EMOTIONS.ENCOURAGING;
    }

    if (text.includes("completed") || text.includes("well done")) {
        return VOICE_EMOTIONS.CELEBRATORY;
    }

    return VOICE_EMOTIONS.CALM;
};
