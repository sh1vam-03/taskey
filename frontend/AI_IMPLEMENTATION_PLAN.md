# AI Frontend Implementation Plan
**Taskey — AI Section Rebuild**

---

## ✅ Backend Status: Production-Ready

The backend has passed a full production audit across all 38 files.

**The backend API is stable. No further changes required before building the frontend.**

---

## API Reference (What the Frontend Consumes)

All routes are under `/api/ai/` and require `Authorization: Bearer <token>`.

```
GET    /api/ai/settings                          → provider, sttLang, speaker, credits, plan, option lists
PATCH  /api/ai/settings                          → body: { provider?, sttLang?, speaker? }

POST   /api/ai/conversations                     → create, optional body: { message }
GET    /api/ai/conversations                     → list (up to 50, ordered by updatedAt desc)
GET    /api/ai/conversations/:id                 → get single
PUT    /api/ai/conversations/:id                 → body: { title }
DELETE /api/ai/conversations/:id                 → delete

GET    /api/ai/conversations/:id/messages        → full history
POST   /api/ai/conversations/:id/message         → body: { message, stream? }
                                                    ?stream=true → SSE text/event-stream response

POST   /api/ai/conversations/:id/voice           → multipart: audio file field "audio"
                                                    response: { userText, reply, audioUrl, billing }

POST   /api/ai/voice/transcribe                  → multipart: audio field "audio"
POST   /api/ai/voice/tts                         → body: { text, speaker? }
```

**Key response shapes to know:**
```js
// GET /settings
{
  provider: "openai" | "sarvam",
  sttLang: "unknown" | "hi-IN" | ...,
  speaker: "shubh" | ...,
  creditBalance: number,
  plan: "FREE" | "PRO" | "PRO_PLUS",
  ttsLanguageMode: "auto",
  availableProviders: [{ id, name, description, supportsTools, supportsVoice }],
  availableSttLangs:  [{ code, label }],
  availableSpeakers:  [{ id, label, gender }]
}

// Message shape (from GET /messages or POST /message)
{
  id: string,
  role: "user" | "assistant",
  content: string,
  createdAt: ISO string
}

// Voice response (POST /conversations/:id/voice)
{
  userText: string,              // what user said (STT)
  reply: string,                 // AI text response
  audioUrl: "data:audio/wav;base64,...",  // playable audio
  billing: { stt: {...}, tts: {...} }
}
```

---

## Current Frontend AI File Inventory

### Files to **completely rewrite**
| File | Reason |
|---|---|
| `app/(ai)/dashboard/ai/page.jsx` | Main AI chat page — needs full UI |
| `app/(ai)/layout.jsx` | Needs conversation sidebar layout |
| `components/ai/AiSidebar.jsx` | Needs conversation list + provider badge |
| `context/AiContext.js` | Needs full state model for conversations, settings, voice |
| `features/ai/ai.services.js` | Needs all 10 API endpoints |
| `features/ai/useAi.js` | Needs complete hook surface |

### File to **consolidate/delete** if it is a duplicate.
| File | Action |
|---|---|
| `services/ai.service.js` | if **Duplicate** of `features/ai/ai.services.js` — consolidate into `features/ai/` and delete |

### New files to **create**
All in `frontend/src/features/ai/` or `frontend/src/components/ai/`

---

## Target File Structure

```
frontend/src/
├── app/
│   └── (ai)/
│       ├── layout.jsx                          ← REWRITE: full sidebar layout
│       └── dashboard/
│           └── ai/
│               └── page.jsx                    ← REWRITE: main chat view
│
├── components/
│   └── ai/
│       ├── AiSidebar.jsx                       ← REWRITE: conversation list + actions
│       ├── ChatWindow.jsx                      ← NEW: scrollable message area
│       ├── MessageBubble.jsx                   ← NEW: user/assistant message
│       ├── StreamingMessage.jsx                ← NEW: live token rendering
│       ├── ChatInput.jsx                       ← NEW: text field + voice + send
│       ├── VoiceRecorder.jsx                   ← NEW: record → upload → play response
│       ├── VoicePlayer.jsx                     ← NEW: play base64 audio response
│       ├── AiSettingsPanel.jsx                 ← NEW: provider/speaker/lang selector
│       ├── ProviderBadge.jsx                   ← NEW: small "OpenAI" / "Sarvam" pill
│       └── CreditBadge.jsx                     ← NEW: shows balance with upgrade CTA
│
├── context/
│   └── AiContext.js                            ← REWRITE: full state
│
└── features/
    └── ai/
        ├── ai.services.js                      ← REWRITE: all API calls
        └── useAi.js                            ← REWRITE: hook surface
```

---

## Phase 1 — API Service Layer

**File:** `features/ai/ai.services.js`

This is the foundation. Build this first — everything else depends on it.

```js
// All functions to implement:

// Settings
getAiSettings()                                 // GET /api/ai/settings
updateAiSettings({ provider, sttLang, speaker })// PATCH /api/ai/settings

// Conversations
createConversation(message?)                    // POST /api/ai/conversations
getConversations()                              // GET /api/ai/conversations
getConversation(id)                             // GET /api/ai/conversations/:id
updateConversation(id, { title })               // PUT /api/ai/conversations/:id
deleteConversation(id)                          // DELETE /api/ai/conversations/:id

// Messages
getMessages(conversationId)                     // GET /api/ai/conversations/:id/messages
sendMessage(conversationId, message)            // POST /api/ai/conversations/:id/message (non-streaming)
sendMessageStream(conversationId, message, onToken, onDone, onError)
  // POST /api/ai/conversations/:id/message?stream=true → SSE

// Voice
sendVoiceMessage(conversationId, audioBlob)     // POST /api/ai/conversations/:id/voice (multipart)
transcribeAudio(audioBlob)                      // POST /api/ai/voice/transcribe
synthesizeSpeech(text, speaker?)                // POST /api/ai/voice/tts
```

**SSE Streaming implementation notes:**
```js
// sendMessageStream uses fetch + ReadableStream, not EventSource
// (EventSource doesn't support POST with body)
const response = await fetch(url, { method: "POST", body: JSON.stringify({message, stream: true}), ... });
const reader = response.body.getReader();
const decoder = new TextDecoder();
// Loop: decode chunks → call onToken(chunk) → accumulate → call onDone(fullText)
```

**Voice upload:**
```js
// sendVoiceMessage: audioBlob comes from MediaRecorder
const formData = new FormData();
formData.append("audio", audioBlob, "recording.webm");
await fetch(`/api/ai/conversations/${id}/voice`, { method: "POST", body: formData });
// Do NOT set Content-Type — browser sets it with boundary
```

---

## Phase 2 — Context & State

**File:** `context/AiContext.js`

Single context that owns all AI state. All components read from here.

```js
// State shape:
{
  // Settings (loaded once on mount)
  settings: {
    provider: "openai",
    sttLang: "unknown",
    speaker: "shubh",
    creditBalance: 0,
    plan: "FREE",
    availableProviders: [],
    availableSttLangs: [],
    availableSpeakers: [],
  },

  // Conversations
  conversations: [],          // list (from GET /conversations)
  activeConversationId: null, // currently open
  messages: [],               // messages for activeConversationId

  // UI state
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  isStreaming: false,
  streamingContent: "",       // live token accumulator for streaming message
  isRecording: false,         // voice recording in progress
  isProcessingVoice: false,   // voice pipeline running (STT→LLM→TTS)
  voiceResponse: null,        // { audioUrl, userText, reply } from last voice call

  // Errors
  error: null,
}

// Actions (provided via context):
loadSettings()
updateSettings(patch)
loadConversations()
openConversation(id)          // sets activeConversationId + loads messages
createNewConversation()       // creates new → navigates
deleteConversation(id)
renameConversation(id, title)
sendMessage(text)             // handles streaming internally
sendVoiceMessage(blob)        // full pipeline
clearError()
```

**Critical UX requirement — Optimistic updates:**
When a user sends a message, immediately append the user bubble to `messages` before the API responds. The streaming message appears as it arrives. Don't wait for the round-trip before showing the user's own message.

---

## Phase 3 — Main Layout

**File:** `app/(ai)/layout.jsx`

Two-panel layout: resizable conversation sidebar + main chat area.

```
┌─────────────────────────────────────────────────────────┐
│  [← Dashboard]    Taskey AI         [Credits] [Settings]│
├──────────────────┬──────────────────────────────────────┤
│  [+ New Chat]    │                                       │
│                  │                                       │
│  CONVERSATIONS   │         CHAT WINDOW                   │
│  ─────────────   │                                       │
│  > Chat 1  [✎✕] │                                       │
│    Chat 2  [✎✕] │                                       │
│    Chat 3  [✎✕] │                                       │
│                  │                                       │
│  Provider:       │                                       │
│  [Sarvam  ▼]     │                                       │
│  ─────────────   │                                       │
│  [user details]  │       [input bar + voice button]      │
└──────────────────┴──────────────────────────────────────┘
```

**Responsive behaviour:**
- Desktop (≥ 1024px): side-by-side panel layout
- Tablet (768–1023px): sidebar collapses to icon-only, tap to expand as overlay
- Mobile (< 768px): bottom sheet for conversation list, full-screen chat

**Implementation:**
```jsx
// layout.jsx wraps everything in AiProvider
// Sidebar is always rendered but conditionally visible
// Active conversation renders in the main slot
```

---

## Phase 4 — Conversation Sidebar

**File:** `components/ai/AiSidebar.jsx`

```
WHAT IT RENDERS:
  - "New Conversation" button (top)
  - Scrollable list of conversations:
      - Title (or "New conversation" if untitled)
      - Relative timestamp ("2 min ago", "Yesterday")
      - On hover: rename (pencil) + delete (trash) icons
      - Active conversation highlighted
  - Provider badge + quick switch at bottom
  - Credit balance badge (low balance = warning color)

BEHAVIOUR:
  - Click conversation → openConversation(id)
  - Click "New" → createNewConversation()
  - Inline rename: click pencil → text input in place → blur/Enter saves
  - Delete: confirmation modal (use existing ConfirmationModal.jsx)
  - Conversations ordered by updatedAt desc (server already does this)
```

---

## Phase 5 — Chat Window

**File:** `components/ai/ChatWindow.jsx`

```
WHAT IT RENDERS:
  - Empty state when no conversation selected
  - Loading skeleton when messages are loading
  - Scrollable message list
  - Auto-scroll to bottom on new messages
  - Provider badge showing which AI is responding

SCROLL BEHAVIOUR:
  - useRef + scrollIntoView on message append
  - "Scroll to bottom" button appears if user scrolled up manually
  - Don't auto-scroll if user is reading older messages
```

---

## Phase 6 — Message Bubbles

**File:** `components/ai/MessageBubble.jsx`

```
USER BUBBLE:
  - Right-aligned
  - Shows user message text
  - Timestamp on hover

ASSISTANT BUBBLE:
  - Left-aligned
  - Renders markdown (use react-markdown or similar)
    → Code blocks with syntax highlighting
    → Bold, italic, lists, tables
    → No raw HTML (security)
  - Copy button on hover (copies raw text)
  - Provider badge (which AI responded)
  - Timestamp

STREAMING STATE (StreamingMessage.jsx):
  - Animated cursor "▍" at end of streaming text
  - Same styling as assistant bubble
  - Cursor disappears when stream completes
  - Merges into MessageBubble when done
```

---

## Phase 7 — Chat Input Bar

**File:** `components/ai/ChatInput.jsx`

```
LAYOUT:
  [ Textarea (auto-resize) ] [ 🎤 Voice ] [ ▶ Send ]

BEHAVIOUR:
  - Textarea: auto-grows up to 6 lines, then scrolls
  - Enter → send (Shift+Enter → newline)
  - Disabled when: isStreaming || isSendingMessage || isProcessingVoice
  - Voice button: opens VoiceRecorder when clicked
  - Send button: disabled + spinner when sending
  - Character counter not needed (server enforces nothing on text)

VOICE MODE:
  When user clicks 🎤, the input area transforms:
  [ ● Recording... 0:05 ] [ ✕ Cancel ] [ ✓ Send ]
  After sending voice: input area shows "Processing..." until response arrives
```

---

## Phase 8 — Voice Recorder

**File:** `components/ai/VoiceRecorder.jsx`

This is the most technically complex component. It manages the full voice lifecycle.

```
STATES:
  idle → recording → recorded → uploading → responding → done

RECORDING (MediaRecorder API):
  1. navigator.mediaDevices.getUserMedia({ audio: true })
  2. new MediaRecorder(stream, { mimeType: "audio/webm" })
  3. Collect chunks: mediaRecorder.ondataavailable
  4. On stop: new Blob(chunks, { type: "audio/webm" })

UPLOAD + PIPELINE:
  5. Call sendVoiceMessage(conversationId, blob)
  6. Server: STT → LLM → TTS → returns { userText, reply, audioUrl }
  7. Add both user transcript and AI reply as messages in UI
  8. Auto-play audio response

PERMISSIONS:
  - Handle mic permission denied gracefully (show message, not crash)
  - Handle unsupported browsers (no MediaRecorder)

MAX RECORDING DURATION:
  - Auto-stop at 120 seconds (2 min) to avoid huge bills
  - Show countdown timer in UI

UI DETAILS:
  - Pulsing red dot during recording
  - Waveform visualizer (use AnalyserNode from Web Audio API, simple bars)
  - Duration timer "0:12"
```

**File:** `components/ai/VoicePlayer.jsx`

```
Simple audio player for TTS responses:
  - Receives audioUrl (data:audio/wav;base64,...)
  - Auto-plays when audioUrl appears
  - Play/Pause toggle button on the message bubble
  - Progress bar
  - Uses HTML5 <audio> element under the hood
```

---

## Phase 9 — Settings Panel

**File:** `components/ai/AiSettingsPanel.jsx`

Slide-in panel (from right) or modal, triggered by settings icon in header.

```
SECTIONS:

1. AI PROVIDER
   ┌─────────────────────────────────────┐
   │ ● OpenAI (GPT-4o mini)              │  ← Selected
   │   Full tools, web search, tasks     │
   │                                     │
   │ ○ Sarvam AI (sarvam-m)              │
   │   Indian languages, no tool calling │
   └─────────────────────────────────────┘
   Selecting "Sarvam" shows: ⚠️ "Tool calling disabled on this provider"

2. VOICE INPUT LANGUAGE (STT)
   Dropdown: [ Auto-detect ▼ ]
   Options: Auto-detect, English, Hindi, Marathi, Tamil, Telugu, ...
   Helper text: "Helps Saaras accurately transcribe your spoken input"

3. TTS VOICE / SPEAKER (Sarvam only — greyed out when provider = OpenAI)
   Speaker grid:
   MALE        FEMALE
   Shubh  Amit  Ritu   Pooja
   Sumit  Manan Simran Kavya
   Rahul  Ratan shubh  Ishita
               Shreya Shruti
   Selected speaker has highlight ring
   "TTS language is auto-detected from AI response text" note in grey

4. CREDIT BALANCE
   Balance: 142 credits  [Upgrade Plan →]

All changes → PATCH /api/ai/settings immediately (no save button needed)
Show toast on success/error.
```

---

## Phase 10 — Utility Components

### `components/ai/ProviderBadge.jsx`
```
Small pill badge showing current provider:
  [OpenAI] — blue background, gear icon
  [Sarvam] — orange/saffron, star icon
Used in: sidebar footer, message bubbles, chat header
Clicking it opens settings panel quick-switch
```

### `components/ai/CreditBadge.jsx`
```
Shows credit balance in header:
  > 50 credits: neutral/green "142 ✦"
  10–50 credits: yellow warning "28 ✦ Low"
  < 10 credits: red urgent "4 ✦ Upgrade" → clicking opens billing
```

---

## Phase 11 — Hook Surface

**File:** `features/ai/useAi.js`

Thin hook that reads from `AiContext`. Components should call `useAi()` not `useContext(AiContext)` directly.

```js
export const useAi = () => {
  const ctx = useContext(AiContext);
  if (!ctx) throw new Error("useAi must be used within AiProvider");
  return ctx;
};

// Convenience derived hooks:
export const useActiveConversation = () => { ... };   // returns active conversation object
export const useAiSettings = () => { ... };           // returns settings + updateSettings
export const useVoice = () => { ... };                // returns voice-specific state + actions
```

---

## State Flow Diagrams

### Text Message (Streaming)
```
User types → clicks Send
  → optimistically append { role: "user", content } to messages
  → set isStreaming = true, streamingContent = ""
  → POST /conversations/:id/message?stream=true
  → SSE: each token → streamingContent += token (React re-renders)
  → SSE done: append final { role: "assistant", content: fullText }
  → set isStreaming = false, streamingContent = ""
  → conversation updatedAt refreshed → sidebar reorders
```

### Voice Message
```
User clicks 🎤 → MediaRecorder starts
  → timer runs, waveform shows
User clicks ✓ → MediaRecorder stops → Blob created
  → set isProcessingVoice = true
  → optimistically append { role: "user", content: "🎤 Processing audio..." }
  → POST /conversations/:id/voice (multipart)
  → response: { userText, reply, audioUrl }
  → update user message content to userText
  → append { role: "assistant", content: reply }
  → set voiceResponse = { audioUrl }
  → VoicePlayer auto-plays audioUrl
  → set isProcessingVoice = false
```

---

## Error Handling Strategy

| Error | UI Response |
|---|---|
| 402 Insufficient Credits | Toast with "Upgrade plan" CTA button, not just error text |
| 400 Bad Request | Toast with server error message |
| Network failure | Toast "Connection lost, please retry" + retry button on input |
| Mic permission denied | Inline message in VoiceRecorder: "Microphone access needed" |
| Audio processing failed | Toast + user message bubble changes to error state |
| Streaming error | Streaming message shows `[Response interrupted]`, can retry |

---

## Implementation Order (Recommended)

Build in this sequence — each phase is independently testable:

```
Phase 1:  api.services.js      → test all endpoints with curl/Postman
Phase 2:  AiContext.js         → test in isolation with console.log
Phase 3:  layout.jsx           → verify two-panel layout renders
Phase 4:  AiSidebar.jsx        → verify conversations load + create/delete work
Phase 5:  ChatWindow.jsx       → verify messages load + scroll
Phase 6:  MessageBubble.jsx    → verify markdown rendering
Phase 7:  ChatInput.jsx        → verify send (non-streaming first)
Phase 8a: Add streaming         → SSE connection, verify token-by-token render
Phase 8b: VoiceRecorder.jsx    → test on HTTPS (MediaRecorder requires it)
Phase 8c: VoicePlayer.jsx      → test base64 audio playback
Phase 9:  AiSettingsPanel.jsx  → verify settings read/write + provider switch
Phase 10: ProviderBadge.jsx + CreditBadge.jsx → cosmetic polish
Phase 11: Mobile responsive    → test breakpoints
Phase 12: Error states         → test all error paths
```

---

## Technical Dependencies

Add to `package.json` if not already present:

```json
"react-markdown": "^9.x",          // markdown rendering for AI responses
"remark-gfm": "^4.x",              // github-flavoured markdown (tables, strikethrough)
"react-syntax-highlighter": "^15.x" // code block highlighting inside AI responses
```

No additional audio library needed — use native `MediaRecorder` + `<audio>` element.

---

## Critical UX Rules (Non-Negotiable)

1. **Never block UI on AI response** — User message appears instantly. AI bubble appears as a skeleton/typing indicator while waiting.

2. **Streaming must feel real** — Each token from SSE should render with zero debounce. Don't batch tokens — show them as they arrive.

3. **Voice requires HTTPS** — `getUserMedia` only works on `localhost` or `https://`. Ensure dev server or staging is HTTPS. Show a clear error if not.

4. **Credit exhaustion is a first-class state** — 402 errors should surface as a friendly upgrade prompt, never a raw error message.

5. **Provider switch is immediate** — When user changes provider in settings panel, the next message uses the new provider. No page reload needed.

6. **Mobile voice must work** — Test on actual iOS Safari and Android Chrome. `audio/webm` may not be supported everywhere. Detect and fall back to `audio/mp4` on iOS.

```js
const mimeType = MediaRecorder.isTypeSupported("audio/webm")
  ? "audio/webm"
  : "audio/mp4"; // iOS Safari fallback
```

7. **Auto-scroll with escape hatch** — Always scroll to new messages, but stop auto-scrolling the moment the user manually scrolls up (they're reading).

---

## Files to Delete After Rebuild

```
frontend/src/services/ai.service.js    ← duplicate, replace with features/ai/ai.services.js
```

Verify nothing else imports from `services/ai.service.js` before deleting. Search for `from.*services/ai.service` in the codebase.

---

## Definition of Done

The AI section is complete when:

- [ ] User can create, rename, and delete conversations
- [ ] Text messages send and stream token-by-token
- [ ] Voice recording works end-to-end (record → transcribe → AI response → play audio)
- [ ] Settings panel saves provider, STT lang, and speaker without page reload
- [ ] Credit balance shows live and degrades gracefully at 0
- [ ] All three error categories (network, credits, voice permission) have proper UI
- [ ] Works on mobile (iOS + Android)
- [ ] Switching provider mid-conversation works correctly
- [ ] Sarvam provider shows "no tool calling" warning