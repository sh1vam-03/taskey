# 🤖 AI Assistant API

Base URL: `/api/ai`

## Middleware
- `authMiddleware`
- `usageLimit` (Internal checks may apply)

---

## 1. Create Conversation (Start Chat)
Start a new conversation context or simply start tracking a new thread.
- **URL:** `/conversations`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "message": "Help me plan my day" // Optional: If provided, sends first message immediately
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "conversation": {
        "id": "uuid",
        "title": "Help me plan my day...",
        "createdAt": "..."
      },
      "message": { // Only if message was provided in body
        "role": "assistant",
        "content": "Sure! Here is your plan..."
      }
    }
  }
  ```

## 2. Get All Conversations
Retrieve list of past conversations (history).
- **URL:** `/conversations`
- **Method:** `GET`
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      { "id": "uuid", "title": "...", "updatedAt": "..." }
    ]
  }
  ```

## 3. Get Single Conversation
- **URL:** `/conversations/:id`
- **Method:** `GET`

## 4. Get Messages
Retrieve chat history for a specific conversation.
- **URL:** `/conversations/:id/messages`
- **Method:** `GET`
- **Response:**
  ```json
  {
    "success": true,
    "data": [
      { "role": "user", "content": "Hi" },
      { "role": "assistant", "content": "Hello!" }
    ]
  }
  ```

## 5. Send Message
Continue an existing conversation.
- **URL:** `/conversations/:id/message`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "message": "Add a task to buy milk"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "role": "assistant",
      "content": "I have added 'Buy Milk' to your tasks."
    }
  }
  ```

## 6. Delete Conversation
- **URL:** `/conversations/:id`
- **Method:** `DELETE`

## 7. Voice Assistant
Process voice audio blob for a conversation.
- **URL:** `/conversations/:id/voice`
- **Method:** `POST`
- **Headers:** `Content-Type: multipart/form-data`
- **Body:** `audio` (File)
- **Response:**
  ```json
  {
    "success": true,
    "data": {
       "transcription": "What is on my calendar?",
       "reply": "You have a meeting at 2 PM.",
       "audioUrl": "http://.../response.mp3" // Logic for TTS response
    }
  }
  ```
