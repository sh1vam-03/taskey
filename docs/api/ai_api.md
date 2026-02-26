# 🤖 AI Assistant API

Interact with the Gemini-powered Assistant.

**Base URL:** `/api/ai`

---

## ⚡ AI Credit Usage
Requesting these endpoints consumes AI Credits from the user's plan.
- **Chat:** 1 Credit
- **Voice:** 3 Credits

If credits are insufficient (`User.aiTokenBalance < Cost`), the API returns `403 Forbidden`.

---

## 1. Create Conversation
Start a new chat thread.

- **Method:** `POST`
- **URL:** `/conversations`
- **Auth Required:** Yes

### Request Body
```json
{
  "message": "Help me plan my week" // Optional initial message
}
```

### Success Response (201)
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "uuid",
      "title": "Help me plan my week...",
      "updatedAt": "..."
    },
    "message": { ... } // If message was sent
  }
}
```

---

## 2. Get Conversations
List all chat history.

- **Method:** `GET`
- **URL:** `/conversations`
- **Auth Required:** Yes

### Success Response (200)
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "title": "...", "createdAt": "..." }
  ]
}
```

---

## 3. Get Conversation Messages
Retrieve full chat history for a thread.

- **Method:** `GET`
- **URL:** `/conversations/:id/messages`
- **Auth Required:** Yes

### Success Response (200)
```json
{
  "success": true,
  "data": [
    { "role": "user", "content": "Hi" },
    { "role": "assistant", "content": "Hello! How can I help?" }
  ]
}
```

---

## 4. Send Message (Chat)
Continue a conversation.

- **Method:** `POST`
- **URL:** `/conversations/:id/message`
- **Auth Required:** Yes

### Request Body
```json
{
  "message": "Add a task for 2PM"
}
```

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "role": "assistant",
    "content": "I've added the task to your schedule."
  }
}
```

---

## 5. Voice Assistant
Upload audio for transcription and AI response.

- **Method:** `POST`
- **URL:** `/conversations/:id/voice`
- **Auth Required:** Yes
- **Headers:** `Content-Type: multipart/form-data`

### Request Body
- `audio`: File (mp3/wav/webm)

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "transcription": "What is on my calendar?",
    "reply": "You have a meeting at 2 PM.",
    "audioUrl": "http://.../response.mp3"
  }
}
```
