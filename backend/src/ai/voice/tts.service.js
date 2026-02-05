import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const speakText = async ({ text, emotion }) => {
    const outputPath = path.join(
        process.cwd(),
        "tmp",
        `voice-${Date.now()}.mp3`
    );

    // Map internal 'rate' (0.9 - 1.1) to OpenAI 'speed' (0.25 - 4.0)
    // We clamp it to remain natural (e.g., 0.85 - 1.2)
    let speed = 1.0;
    if (emotion && emotion.rate) {
        speed = Math.max(0.85, Math.min(1.2, emotion.rate));
    }

    const response = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: text,
        speed: speed
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);

    return outputPath;
};
