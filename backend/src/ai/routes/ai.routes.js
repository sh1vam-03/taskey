import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { createConversation, getConversations, getConversation, deleteConversation, getMessages, sendMessage } from "../controllers/ai.controller.js";
// import { upload } from "../../middlewares/upload.middleware.js";

const router = Router();

// Conversations
router.post("/conversations", authMiddleware, createConversation);
router.get("/conversations", authMiddleware, getConversations);
router.get("/conversations/:id", authMiddleware, getConversation);
router.delete("/conversations/:id", authMiddleware, deleteConversation);

// Messages (Text)
router.get("/conversations/:id/messages", authMiddleware, getMessages);
router.post("/conversations/:id/message", authMiddleware, sendMessage);



export default router;
