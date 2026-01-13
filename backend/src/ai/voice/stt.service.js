import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const transcribeAudio = async (filePath) => {
    if (!filePath) {
        throw new Error("Audio file path is required");
    }

    const result = await openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "whisper-1",
    });

    return result.text.trim();
};
