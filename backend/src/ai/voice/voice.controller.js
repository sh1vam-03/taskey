import asyncHandler from "../../utils/asyncHandler.js";
import { processVoiceInput } from "./voice.service.js";

export const handleVoiceCommand = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Audio file is required",
        });
    }

    const result = await processVoiceInput({
        audioPath: req.file.path,
        user: req.user,
    });

    res.status(200).json({
        success: true,
        data: {
            text: result.inputText,
            emotion: result.emotion,
            plan: result.aiResult,
            audioPath: result.audioPath,
        },
    });
});
