import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { handleVoiceCommand } from "./voice.controller.js";
import { upload } from "../../middlewares/upload.middleware.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    upload.single("audio"),
    handleVoiceCommand
);

export default router;
