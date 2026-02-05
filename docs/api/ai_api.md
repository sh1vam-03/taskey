# 🤖 AI Assistant API

Base URL: `/api/ai`

## Middleware
- `authMiddleware`
- `requireAiTokens(type)`: checks if the user has enough tokens BEFORE processing.

---

## 1. Chat with Assistant
Ask questions or get advice. Context (Tasks/Schedule) is automatically injected.
- **URL:** `/chat`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "prompt": "What should I focus on today?"
  }
  ```
- **Estimate Cost:** ~10-100 tokens depending on usage.
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "reply": "Based on your schedule, you have a meeting at 2PM...",
      "tokensUsed": 45
    }
  }
  ```

## 2. Voice Assistant (Simulated)
Process voice duration (future capability).
- **URL:** `/voice`
- **Method:** `POST`
- **Body:** `{"durationSeconds": 10}`
- **Cost:** 5 tokens per second.
