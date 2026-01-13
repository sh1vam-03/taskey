import { transcribeAudio } from "./stt.service.js";
import { speakText } from "./tts.service.js";
import { createAgent } from "../agent/agent.factory.js";
import { inferVoiceEmotion } from "./voiceEmotion.service.js";

export const processVoiceInput = async ({ audioPath, user }) => {
    // 1️⃣ Speech → Text
    const inputText = await transcribeAudio(audioPath);

    // 2️⃣ Run SAME AI agent
    const agent = createAgent({ user });

    const aiResult = await agent.run({
        input: inputText,
        mode: "VOICE",
    });

    // 3️⃣ Infer emotion
    const emotion = inferVoiceEmotion(aiResult);

    // 4️⃣ Emotion-aware speech text
    const spokenText = buildSpokenResponse(aiResult, emotion);

    // 5️⃣ Text → Speech
    const audioPathResult = await speakText({ text: spokenText });

    return {
        inputText,
        aiResult,
        emotion,
        audioPath: audioPathResult,
    };
};

const buildSpokenResponse = (aiResult, emotion) => {
    switch (emotion) {
        case "ENCOURAGING":
            return `Nice work. ${aiResult.summary}`;

        case "CONCERNED":
            return `I adjusted this carefully for your wellbeing. ${aiResult.summary}`;

        case "FIRM_CARING":
            return `I couldn’t follow your request exactly, but here’s a healthier plan. ${aiResult.summary}`;

        case "CELEBRATORY":
            return `Great job. ${aiResult.summary}`;

        default:
            return aiResult.summary;
    }
};
