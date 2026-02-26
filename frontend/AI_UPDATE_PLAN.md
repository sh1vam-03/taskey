# AI Frontend Implementation Plan
**Taskey — AI Section (Updated for Multi-Model Architecture)**

---

## ⚠️ What Changed Since the Last Plan

The backend was fully rebuilt with a **decoupled multi-model architecture**. The old concept of a single `provider: "openai" | "sarvam"` toggle is **gone**. Users now independently select **four** AI components.

| What changed | Old | New |
|---|---|---|
| LLM selection | `provider: "openai" \| "sarvam"` | `chatModel: "gemini-1.5-flash" \| "sarvam-30b" \| "gpt-4o-mini"` |
| Voice LLM | Not separate — same as provider | `voiceModel` — independent, same 3 options |
| TTS model | Implied by provider | `ttsModel: "bulbul:v3" \| "tts-1"` |
| STT model | Implied by provider | `sttModel: "saaras:v3" \| "whisper-1"` |
| Default LLM | OpenAI | **Gemini 1.5 Flash** (fast, cheap, multilingual) |
| Default TTS | — | **Sarvam Bulbul v3** (Indian voices, auto-language) |
| Default STT | — | **Sarvam Saaras v3** (best Indian accent accuracy) |
| Settings API fields | `provider, sttLang, speaker` | `chatModel, voiceModel, ttsModel, sttModel, sttLang, speaker` |
| Settings response | `availableProviders` | `availableChatModels, availableVoiceModels, availableTtsModels, availableSttModels` (each with pricing) |
| Tool calling | Only on OpenAI provider | All 3 LLMs support tool calling |
| TTS language | User selected | **Always auto-detected** from AI response text (no UI needed) |

**Every frontend file that references `provider`, `availableProviders`, or the old settings shape needs to be updated.**

---

## ✅ Backend Status: Production-Ready

All 38 backend files have passed a full production audit. No backend changes required.

**Critical backend fixes applied (frontend must not work around these):**
- LangChain content normalization — AI responses always arrive as clean strings now
- Gemini 1.5 Flash is the new default for all new users
- Conversation title auto-generated on first message
- Voice pipeline fully decoupled: STT/LLM/TTS each independently configurable

---

## API Reference

All routes require `Authorization: Bearer <token>`.  
Base path: `/api/ai/`

### Settings

```
GET  /api/ai/settings
PATCH /api/ai/settings
```

**GET /api/ai/settings — Response shape:**
```js
{
  // Current user selections (with smart defaults applied)
  chatModel:     "gemini-1.5-flash",  // LLM for text chat
  voiceModel:    "gemini-1.5-flash",  // LLM for voice thinking
  ttsModel:      "bulbul:v3",         // Text-to-Speech
  sttModel:      "saaras:v3",         // Speech-to-Text
  sttLang:       "unknown",           // STT input language hint
  speaker:       "shubh",             // Bulbul v3 TTS speaker voice
  creditBalance: 142,
  plan:          "FREE" | "PRO" | "PRO_PLUS",

  // Model catalogs — render these as selection cards in the settings UI
  // Each includes id, name, provider, description, badge, pricing, supportsTools, supportsVoice
  availableChatModels:  [ ...3 models ],   // for text chat LLM selector
  availableVoiceModels: [ ...3 models ],   // for voice LLM selector (same 3 options)
  availableTtsModels:   [ ...2 models ],   // for TTS selector
  availableSttModels:   [ ...2 models ],   // for STT selector

  // Sarvam-specific option lists
  availableSttLangs: [{ code: "unknown", label: "Auto-detect (default)" }, { code: "hi-IN", label: "Hindi" }, ...],
  availableSpeakers: [{ id: "shubh", label: "Shubh", gender: "M" }, ...],

  // Info
  ttsLanguageNote: "TTS language is automatically detected from AI response text.",
  ttsLanguageMode: "auto"
}
```

**Model catalog item shape (for each model in the available* arrays):**
```js
{
  id:          "gemini-1.5-flash",
  name:        "Gemini 1.5 Flash",
  provider:    "Google",
  description: "Fast, smart and multilingual. Best balance of speed, capability and cost.",
  isDefault:   true,
  badge:       "⚡ Recommended",
  pricing: {
    label:          "1 credit/request + 1 credit/1k tokens",
    base:           1,
    per_1000_tokens: 1,
    max_per_call:   80
  },
  supportsTools: true,
  supportsVoice: true
}
```

**PATCH /api/ai/settings — Request body (all fields optional):**
```js
{
  chatModel:  "gemini-1.5-flash" | "sarvam-30b" | "gpt-4o-mini",
  voiceModel: "gemini-1.5-flash" | "sarvam-30b" | "gpt-4o-mini",
  ttsModel:   "bulbul:v3" | "tts-1",
  sttModel:   "saaras:v3" | "whisper-1",
  sttLang:    "unknown" | "en-IN" | "hi-IN" | "mr-IN" | "ta-IN" | "te-IN" | "kn-IN" | "ml-IN" | "gu-IN" | "bn-IN" | "pa-IN" | "od-IN",
  speaker:    "shubh" | "amit" | "sumit" | "manan" | "rahul" | "ratan" | "ritu" | "pooja" | "simran" | "kavya" | "priya" | "ishita" | "shreya" | "shruti"
}
```

---

### Conversations

```
POST   /api/ai/conversations              body: { message? }
GET    /api/ai/conversations              → array, ordered by updatedAt desc, max 50
GET    /api/ai/conversations/:id
PUT    /api/ai/conversations/:id          body: { title }
DELETE /api/ai/conversations/:id
```

### Messages

```
GET  /api/ai/conversations/:id/messages
POST /api/ai/conversations/:id/message   body: { message, stream? }
                                         ?stream=true → SSE text/event-stream
```

**Message shape:**
```js
{
  id:        "cuid",
  role:      "user" | "assistant",
  content:   "string — always a clean string, never JSON array",
  createdAt: "ISO 8601"
}
```

### Voice

```
POST /api/ai/conversations/:id/voice    multipart: field "audio" (audio/webm or audio/mp4)
POST /api/ai/voice/transcribe           multipart: field "audio"
POST /api/ai/voice/tts                  body: { text, speaker? }
```

**Voice pipeline response:**
```js
{
  success: true,
  data: {
    userText:  "What the user said (STT output)",
    reply:     "AI text response",
    audioUrl:  "data:audio/wav;base64,...",
    models:  { stt: "saaras:v3", llm: "gemini-1.5-flash", tts: "bulbul:v3" },
    billing: {
      stt: { model: "saaras:v3", credits: 8,  durationMinutes: 0.23 },
      tts: { model: "bulbul:v3", credits: 15, durationMinutes: 0.41, detectedLang: "en-IN" }
    }
  }
}
```

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
│       ├── AiSidebar.jsx                       ← REWRITE: conversation list + model badges
│       ├── ChatWindow.jsx                      ← NEW: scrollable message area
│       ├── MessageBubble.jsx                   ← NEW: user/assistant message
│       ├── StreamingMessage.jsx                ← NEW: live token rendering
│       ├── ChatInput.jsx                       ← NEW: text field + voice + send
│       ├── VoiceRecorder.jsx                   ← NEW: record → upload → play response
│       ├── VoicePlayer.jsx                     ← NEW: play base64 audio response
│       ├── AiSettingsPanel.jsx                 ← REWRITE: 4-model selector (was 1 provider toggle)
│       ├── ModelCard.jsx                       ← NEW: selectable model card with pricing
│       ├── ModelBadge.jsx                      ← REWRITE: replaces ProviderBadge (was openai/sarvam)
│       └── CreditBadge.jsx                     ← NEW: shows balance with upgrade CTA
│
├── context/
│   └── AiContext.js                            ← REWRITE: full state (new model fields)
│
└── features/
    └── ai/
        ├── ai.services.js                      ← REWRITE: all API calls (updated settings shape)
        └── useAi.js                            ← REWRITE: hook surface
```

**Delete after rebuild:**
```
frontend/src/services/ai.service.js    ← old duplicate, superseded by features/ai/ai.services.js
```

---

## Phase 1 — API Service Layer

**File:** `features/ai/ai.services.js`

Build this first. Every other file depends on it.

```js
import { getAuthToken } from "@/utils/auth";

const BASE = "/api/ai";

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getAuthToken()}`
});

// ── Settings ─────────────────────────────────────────────────

export const getAiSettings = () =>
  fetch(`${BASE}/settings`, { headers: headers() }).then(r => r.json());

/**
 * @param {Object} patch - Any subset of:
 *   { chatModel, voiceModel, ttsModel, sttModel, sttLang, speaker }
 */
export const updateAiSettings = (patch) =>
  fetch(`${BASE}/settings`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify(patch)
  }).then(r => r.json());

// ── Conversations ─────────────────────────────────────────────

export const createConversation = (message) =>
  fetch(`${BASE}/conversations`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(message ? { message } : {})
  }).then(r => r.json());

export const getConversations = () =>
  fetch(`${BASE}/conversations`, { headers: headers() }).then(r => r.json());

export const getConversation = (id) =>
  fetch(`${BASE}/conversations/${id}`, { headers: headers() }).then(r => r.json());

export const updateConversation = (id, { title }) =>
  fetch(`${BASE}/conversations/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ title })
  }).then(r => r.json());

export const deleteConversation = (id) =>
  fetch(`${BASE}/conversations/${id}`, {
    method: "DELETE",
    headers: headers()
  }).then(r => r.json());

// ── Messages ──────────────────────────────────────────────────

export const getMessages = (conversationId) =>
  fetch(`${BASE}/conversations/${conversationId}/messages`, { headers: headers() }).then(r => r.json());

export const sendMessage = (conversationId, message) =>
  fetch(`${BASE}/conversations/${conversationId}/message`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ message })
  }).then(r => r.json());

/**
 * SSE streaming — calls onToken for each chunk, onDone with full text, onError on failure.
 * Uses fetch + ReadableStream (NOT EventSource — EventSource can't POST with body).
 */
export const sendMessageStream = async (conversationId, message, onToken, onDone, onError) => {
  try {
    const response = await fetch(
      `${BASE}/conversations/${conversationId}/message?stream=true`,
      {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ message, stream: true })
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      onError(err.message || `HTTP ${response.status}`);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      onToken(chunk);
    }

    onDone(fullText);
  } catch (err) {
    onError(err.message || "Stream connection failed");
  }
};

// ── Voice ─────────────────────────────────────────────────────

/**
 * Full voice pipeline: audio → STT → LLM → TTS.
 * audioBlob comes from MediaRecorder.
 * Do NOT set Content-Type — browser sets multipart boundary automatically.
 */
export const sendVoiceMessage = async (conversationId, audioBlob) => {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");

  const response = await fetch(`${BASE}/conversations/${conversationId}/voice`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getAuthToken()}` }, // NO Content-Type
    body: formData
  });

  return response.json();
};

export const transcribeAudio = async (audioBlob) => {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");

  const response = await fetch(`${BASE}/voice/transcribe`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    body: formData
  });

  return response.json();
};

export const synthesizeSpeech = (text, speaker) =>
  fetch(`${BASE}/voice/tts`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ text, ...(speaker && { speaker }) })
  }).then(r => r.json());
```

---

## Phase 2 — Context & State

**File:** `context/AiContext.js`

**⚠️ Key change from old plan:** Replace all `provider` references with the 4 new model fields. The `settings` object now holds `chatModel`, `voiceModel`, `ttsModel`, `sttModel` instead of a single `provider`.

```js
import { createContext, useContext, useReducer, useCallback, useEffect } from "react";
import * as api from "@/features/ai/ai.services";

const AiContext = createContext(null);

// ── Initial State ─────────────────────────────────────────────

const initialState = {
  // Settings — loaded once on mount, updated on PATCH response
  settings: {
    chatModel:     "gemini-1.5-flash",  // LLM for text chat
    voiceModel:    "gemini-1.5-flash",  // LLM for voice thinking
    ttsModel:      "bulbul:v3",         // TTS model
    sttModel:      "saaras:v3",         // STT model
    sttLang:       "unknown",
    speaker:       "shubh",
    creditBalance: 0,
    plan:          "FREE",

    // Catalog arrays — populated from GET /settings
    availableChatModels:  [],
    availableVoiceModels: [],
    availableTtsModels:   [],
    availableSttModels:   [],
    availableSttLangs:    [],
    availableSpeakers:    [],
    ttsLanguageMode:      "auto",       // always "auto" — TTS lang is never user-set
  },

  // Conversations
  conversations:         [],
  activeConversationId:  null,
  messages:              [],

  // Loading states
  isLoadingSettings:       false,
  isLoadingConversations:  false,
  isLoadingMessages:       false,
  isSendingMessage:        false,
  isStreaming:             false,
  streamingContent:        "",        // accumulates SSE tokens during streaming
  isRecording:             false,
  isProcessingVoice:       false,

  // Voice response from last voice call
  voiceResponse: null,               // { audioUrl, userText, reply, billing, models }

  // Error
  error: null,
};

// ── Reducer ───────────────────────────────────────────────────

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.payload }, isLoadingSettings: false };

    case "SET_CONVERSATIONS":
      return { ...state, conversations: action.payload, isLoadingConversations: false };

    case "SET_ACTIVE_CONVERSATION":
      return { ...state, activeConversationId: action.payload, messages: [], streamingContent: "" };

    case "SET_MESSAGES":
      return { ...state, messages: action.payload, isLoadingMessages: false };

    case "APPEND_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };

    case "UPDATE_LAST_USER_MESSAGE":
      // Used to update optimistic "🎤 Processing..." bubble with real transcript
      return {
        ...state,
        messages: state.messages.map((m, i) =>
          i === state.messages.length - 1 && m.role === "user"
            ? { ...m, content: action.payload }
            : m
        )
      };

    case "SET_STREAMING":
      return { ...state, isStreaming: action.payload, streamingContent: action.payload ? state.streamingContent : "" };

    case "APPEND_STREAM_TOKEN":
      return { ...state, streamingContent: state.streamingContent + action.payload };

    case "STREAM_DONE":
      // Commit the accumulated streaming content as a final assistant message
      return {
        ...state,
        isStreaming: false,
        streamingContent: "",
        isSendingMessage: false,
        messages: [
          ...state.messages,
          { id: Date.now().toString(), role: "assistant", content: action.payload, createdAt: new Date().toISOString() }
        ]
      };

    case "SET_VOICE_RESPONSE":
      return { ...state, voiceResponse: action.payload, isProcessingVoice: false };

    case "UPDATE_CONVERSATION_IN_LIST": {
      const updated = action.payload;
      return {
        ...state,
        conversations: state.conversations.map(c => c.id === updated.id ? { ...c, ...updated } : c)
      };
    }

    case "REMOVE_CONVERSATION":
      return {
        ...state,
        conversations: state.conversations.filter(c => c.id !== action.payload),
        activeConversationId: state.activeConversationId === action.payload ? null : state.activeConversationId
      };

    case "ADD_CONVERSATION":
      return { ...state, conversations: [action.payload, ...state.conversations] };

    case "SET_LOADING":
      return { ...state, [action.key]: action.value };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    default:
      return state;
  }
};

// ── Provider ──────────────────────────────────────────────────

export const AiProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    loadConversations();
  }, []);

  const loadSettings = useCallback(async () => {
    dispatch({ type: "SET_LOADING", key: "isLoadingSettings", value: true });
    try {
      const res = await api.getAiSettings();
      if (res.success) dispatch({ type: "SET_SETTINGS", payload: res.data });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: "Failed to load AI settings" });
    }
  }, []);

  /**
   * Updates any subset of model settings.
   * Accepts: { chatModel?, voiceModel?, ttsModel?, sttModel?, sttLang?, speaker? }
   */
  const updateSettings = useCallback(async (patch) => {
    try {
      const res = await api.updateAiSettings(patch);
      if (res.success) {
        // Refresh full settings to get updated catalog data
        const fresh = await api.getAiSettings();
        if (fresh.success) dispatch({ type: "SET_SETTINGS", payload: fresh.data });
      } else {
        dispatch({ type: "SET_ERROR", payload: res.message || "Failed to update settings" });
      }
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Failed to update settings" });
    }
  }, []);

  const loadConversations = useCallback(async () => {
    dispatch({ type: "SET_LOADING", key: "isLoadingConversations", value: true });
    try {
      const res = await api.getConversations();
      if (res.success) dispatch({ type: "SET_CONVERSATIONS", payload: res.data });
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Failed to load conversations" });
    }
  }, []);

  const openConversation = useCallback(async (id) => {
    dispatch({ type: "SET_ACTIVE_CONVERSATION", payload: id });
    dispatch({ type: "SET_LOADING", key: "isLoadingMessages", value: true });
    try {
      const res = await api.getMessages(id);
      if (res.success) dispatch({ type: "SET_MESSAGES", payload: res.data });
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Failed to load messages" });
    }
  }, []);

  const createNewConversation = useCallback(async () => {
    try {
      const res = await api.createConversation();
      if (res.success) {
        dispatch({ type: "ADD_CONVERSATION", payload: res.data.conversation });
        dispatch({ type: "SET_ACTIVE_CONVERSATION", payload: res.data.conversation.id });
        dispatch({ type: "SET_MESSAGES", payload: [] });
        return res.data.conversation.id;
      }
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Failed to create conversation" });
    }
  }, []);

  const renameConversation = useCallback(async (id, title) => {
    try {
      const res = await api.updateConversation(id, { title });
      if (res.success) dispatch({ type: "UPDATE_CONVERSATION_IN_LIST", payload: { id, title } });
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Failed to rename conversation" });
    }
  }, []);

  const deleteConversation = useCallback(async (id) => {
    try {
      await api.deleteConversation(id);
      dispatch({ type: "REMOVE_CONVERSATION", payload: id });
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Failed to delete conversation" });
    }
  }, []);

  /**
   * Sends a text message with streaming.
   * Optimistically appends user bubble immediately, then streams AI response.
   */
  const sendMessage = useCallback(async (text) => {
    const { activeConversationId } = state;
    if (!activeConversationId || !text.trim()) return;

    // 1. Optimistic user bubble
    const optimisticUserMsg = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString()
    };
    dispatch({ type: "APPEND_MESSAGE", payload: optimisticUserMsg });
    dispatch({ type: "SET_LOADING", key: "isSendingMessage", value: true });
    dispatch({ type: "SET_STREAMING", payload: true });

    await api.sendMessageStream(
      activeConversationId,
      text,
      (token) => dispatch({ type: "APPEND_STREAM_TOKEN", payload: token }),
      (fullText) => {
        dispatch({ type: "STREAM_DONE", payload: fullText });
        // Reorder conversations list (active one bubbles to top)
        loadConversations();
      },
      (errMsg) => {
        dispatch({ type: "SET_STREAMING", payload: false });
        dispatch({ type: "SET_LOADING", key: "isSendingMessage", value: false });
        // Handle 402 (credit exhaustion) vs other errors
        dispatch({ type: "SET_ERROR", payload: errMsg });
      }
    );
  }, [state.activeConversationId, loadConversations]);

  /**
   * Full voice pipeline.
   * Optimistically shows "🎤 Processing audio..." then replaces with real transcript.
   */
  const sendVoiceMessage = useCallback(async (audioBlob) => {
    const { activeConversationId } = state;
    if (!activeConversationId) return;

    // Optimistic placeholder
    const placeholderMsg = {
      id: `voice-temp-${Date.now()}`,
      role: "user",
      content: "🎤 Processing audio...",
      createdAt: new Date().toISOString()
    };
    dispatch({ type: "APPEND_MESSAGE", payload: placeholderMsg });
    dispatch({ type: "SET_LOADING", key: "isProcessingVoice", value: true });

    try {
      const res = await api.sendVoiceMessage(activeConversationId, audioBlob);
      if (res.success) {
        const { userText, reply, audioUrl, billing, models } = res.data;

        // Replace placeholder with real transcript
        dispatch({ type: "UPDATE_LAST_USER_MESSAGE", payload: userText });

        // Add AI response
        dispatch({
          type: "APPEND_MESSAGE",
          payload: { id: `ai-${Date.now()}`, role: "assistant", content: reply, createdAt: new Date().toISOString() }
        });

        // Store audio + billing info for VoicePlayer
        dispatch({ type: "SET_VOICE_RESPONSE", payload: { audioUrl, userText, reply, billing, models } });

        loadConversations();
      } else {
        dispatch({ type: "UPDATE_LAST_USER_MESSAGE", payload: "🎤 Voice message failed" });
        dispatch({ type: "SET_LOADING", key: "isProcessingVoice", value: false });
        dispatch({ type: "SET_ERROR", payload: res.message || "Voice processing failed" });
      }
    } catch (err) {
      dispatch({ type: "UPDATE_LAST_USER_MESSAGE", payload: "🎤 Voice message failed" });
      dispatch({ type: "SET_LOADING", key: "isProcessingVoice", value: false });
      dispatch({ type: "SET_ERROR", payload: "Voice processing failed" });
    }
  }, [state.activeConversationId, loadConversations]);

  const clearError = useCallback(() => dispatch({ type: "CLEAR_ERROR" }), []);

  const value = {
    ...state,
    loadSettings,
    updateSettings,
    loadConversations,
    openConversation,
    createNewConversation,
    renameConversation,
    deleteConversation,
    sendMessage,
    sendVoiceMessage,
    clearError,
  };

  return <AiContext.Provider value={value}>{children}</AiContext.Provider>;
};

export const useAiContext = () => {
  const ctx = useContext(AiContext);
  if (!ctx) throw new Error("useAiContext must be used within AiProvider");
  return ctx;
};
```

---

## Phase 3 — Main Layout

**File:** `app/(ai)/layout.jsx`

Two-panel layout. Wrap everything in `AiProvider` here.

```
┌─────────────────────────────────────────────────────────────┐
│  [← Dashboard]    Taskey AI         [Credits] [⚙ Settings] │
├──────────────────┬──────────────────────────────────────────┤
│  [+ New Chat]    │                                          │
│                  │                                          │
│  CONVERSATIONS   │         CHAT WINDOW                      │
│  ─────────────   │                                          │
│  > Chat 1  [✎✕] │                                          │
│    Chat 2  [✎✕] │                                          │
│    Chat 3  [✎✕] │                                          │
│                  │                                          │
│  Chat: Gemini ▾  │                                          │
│  Voice: Gemini ▾ │                                          │
│  TTS: Bulbul ▾   │                                          │
│  STT: Saaras ▾   │                                          │
│  ─────────────   │                                          │
│  [User Details]  │         [input bar + voice button]       │
└──────────────────┴──────────────────────────────────────────┘
```
**Responsive behaviour:**
- Desktop (≥ 1024px): side-by-side panels
- Tablet (768–1023px): sidebar collapses to icon strip, tap to expand as overlay
- Mobile (< 768px): bottom sheet for conversations, full-screen chat

```jsx
// layout.jsx
import { AiProvider } from "@/context/AiContext";

export default function AiLayout({ children }) {
  return (
    <AiProvider>
      <div className="flex h-screen overflow-hidden">
        <AiSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </AiProvider>
  );
}
```

---

## Phase 4 — Conversation Sidebar

**File:** `components/ai/AiSidebar.jsx`

**⚠️ Change from old plan:** Bottom section shows 4 model badges (chat, voice, TTS, STT), not a single provider pill.

```
WHAT IT RENDERS:
  Top:
    - "New Conversation" button

  Middle (scrollable):
    - List of conversations ordered by updatedAt desc
    - Each item: title | relative time | hover: [✎ rename] [✕ delete]
    - Active conversation highlighted
    - Untitled conversations shown as "New conversation"

  Bottom:
    - 4 model quick-info lines (not selectors — just status display):
        Chat LLM:  [Gemini Flash ▸]    ← click → opens settings panel
        Voice LLM: [Gemini Flash ▸]
        TTS:       [Bulbul v3 ▸]
        STT:       [Saaras v3 ▸]
    - Credit balance badge
    - User avatar / name

BEHAVIOUR:
  - Click conversation → openConversation(id)
  - Click "+ New" → createNewConversation()
  - Inline rename: pencil icon → input → blur/Enter calls renameConversation()
  - Delete: confirmation modal → deleteConversation()
  - Click any model line → opens AiSettingsPanel
```

---

## Phase 5 — Chat Window

**File:** `components/ai/ChatWindow.jsx`

No changes to core logic vs old plan. Ensure it handles:

- Empty state when no conversation selected
- Loading skeleton when `isLoadingMessages === true`
- Scrollable message list with auto-scroll to bottom
- Shows `StreamingMessage` component when `isStreaming === true`
- "Scroll to bottom" button when user has scrolled up

```jsx
// Auto-scroll logic
const bottomRef = useRef(null);
const [userScrolledUp, setUserScrolledUp] = useState(false);

useEffect(() => {
  if (!userScrolledUp) {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }
}, [messages, streamingContent]);
```

---

## Phase 6 — Message Bubbles

**File:** `components/ai/MessageBubble.jsx`

**⚠️ Change from old plan:** The model badge on assistant messages shows the specific model name (e.g., "Gemini Flash") not just "OpenAI" or "Sarvam".

```
USER BUBBLE:    Right-aligned, plain text, timestamp on hover
ASSISTANT BUBBLE:
  - Left-aligned
  - Markdown rendered (react-markdown + remark-gfm)
  - Code blocks with syntax highlighting (react-syntax-highlighter)
  - Copy button on hover
  - Model badge: shows which LLM generated this response (from settings.chatModel or voiceModel)
  - Timestamp
  - For voice responses: VoicePlayer component embedded below text

STREAMING (StreamingMessage.jsx):
  - Animated "▍" cursor at end of live text
  - Same styling as assistant bubble
  - Cursor disappears when stream completes → merges into MessageBubble
```

```jsx
// MessageBubble.jsx — key model badge logic
const modelName = useAiContext().settings.chatModel; // e.g. "gemini-1.5-flash"
const LABELS = {
  "gemini-1.5-flash": "Gemini Flash",
  "sarvam-30b":       "Sarvam 30B",
  "gpt-4o-mini":      "GPT-4o Mini"
};
```

---

## Phase 7 — Chat Input Bar

**File:** `components/ai/ChatInput.jsx`

No logic changes vs old plan. Disabled when `isStreaming || isSendingMessage || isProcessingVoice`.

```
LAYOUT:    [ Textarea (auto-resize) ] [ 🎤 Voice ] [ ▶ Send ]
VOICE MODE: [ ● Recording 0:05     ] [ ✕ Cancel ] [ ✓ Send ]
PROCESSING: [ 🎤 Processing...                              ]
```

---

## Phase 8 — Voice Components

### `components/ai/VoiceRecorder.jsx`

No logic changes vs old plan. Key points:

```js
// iOS Safari fallback — detect supported MIME type
const mimeType = MediaRecorder.isTypeSupported("audio/webm")
  ? "audio/webm"
  : MediaRecorder.isTypeSupported("audio/mp4")
    ? "audio/mp4"
    : "audio/webm"; // hope for the best

// Auto-stop at 2 minutes to prevent large bills
const MAX_DURATION_MS = 120_000;

// Waveform via Web Audio API AnalyserNode — simple bar visualizer
// Pulsing red dot during active recording
// Timer "0:12" display
// Handle permission denied gracefully (show message, not crash)
```

**Recording state machine:**
```
idle → recording → recorded → uploading → responding → done
```

### `components/ai/VoicePlayer.jsx`

Receives `audioUrl: "data:audio/wav;base64,..."` from voice response. Auto-plays on arrival.

```jsx
// VoicePlayer.jsx
export const VoicePlayer = ({ audioUrl }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(() => {}); // auto-play may be blocked on some browsers
      setPlaying(true);
    }
  }, [audioUrl]);

  // Render: play/pause button + progress bar using <audio> element
};
```

---

## Phase 9 — Settings Panel

**File:** `components/ai/AiSettingsPanel.jsx`

**⚠️ Major redesign from old plan.** Replaces the single "provider" toggle with **4 independent model selectors**, each rendered as `ModelCard` components with pricing displayed.

Slide-in panel from the right, triggered by ⚙ icon in header or clicking any model badge in sidebar.

```
┌─── AI Settings ──────────────────────────────────────────┐
│                                                           │
│  TEXT CHAT MODEL                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │ ⚡ Gemini 1.5 Flash  (Google)        ✓ SELECTED  │    │
│  │  Fast, smart, multilingual                        │    │
│  │  1 credit/request + 1 credit/1k tokens            │    │
│  ├──────────────────────────────────────────────────┤    │
│  │ 🇮🇳 Sarvam 30B  (Sarvam AI)                       │    │
│  │  Optimised for Indian languages                   │    │
│  │  1 credit/request + 2 credits/1k tokens           │    │
│  ├──────────────────────────────────────────────────┤    │
│  │ 🤖 GPT-4o Mini  (OpenAI)                          │    │
│  │  Strong reasoning, complex tasks                  │    │
│  │  1 credit/request + 2 credits/1k tokens           │    │
│  └──────────────────────────────────────────────────┘    │
│                                                           │
│  VOICE THINKING MODEL                    [same 3 cards]  │
│                                                           │
│  TEXT-TO-SPEECH (TTS)                                     │
│  ┌──────────────────────────────────────────────────┐    │
│  │ 🇮🇳 Sarvam Bulbul v3              ✓ SELECTED     │    │
│  │  Indian voices, auto-language detection           │    │
│  │  15 credits/minute                                │    │
│  ├──────────────────────────────────────────────────┤    │
│  │ 🤖 OpenAI TTS (tts-1)                             │    │
│  │  Natural English voice                            │    │
│  │  20 credits/minute                                │    │
│  └──────────────────────────────────────────────────┘    │
│  ℹ️ TTS language is auto-detected from AI response text  │
│                                                           │
│  SPEECH-TO-TEXT (STT)                    [same 2 cards]  │
│                                                           │
│  VOICE INPUT LANGUAGE                                     │
│  [ Auto-detect ▼ ]  (for Saaras v3 accuracy)             │
│                                                           │
│  SPEAKER VOICE (Bulbul v3)                                │
│  ┌──────────────────────────────────────────────────┐    │
│  │ MALE     Shubh  Amit   Sumit  Manan  Rahul  Ratan│    │
│  │ FEMALE   Ritu   Pooja  Simran Kavya  Priya       │    │
│  │          Ishita Shreya Shruti                    │    │
│  └──────────────────────────────────────────────────┘    │
│  (Speaker selector only shown when ttsModel = bulbul:v3) │
│                                                           │
│  CREDITS & PLAN                                           │
│  Balance: 142 ✦  Plan: FREE   [Upgrade Plan →]           │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**Implementation notes:**
```jsx
// All changes save immediately via PATCH /api/ai/settings
// No save button needed

const handleModelSelect = async (field, value) => {
  await updateSettings({ [field]: value });
  // updateSettings refreshes full settings from server → ModelCards re-render
};

// field is one of: "chatModel" | "voiceModel" | "ttsModel" | "sttModel"
// Speaker selector only visible when settings.ttsModel === "bulbul:v3"
// STT language selector always visible (affects saaras:v3 accuracy)
// Show toast on success, toast on error
```

---

## Phase 10 — Model Badge Component

**File:** `components/ai/ModelBadge.jsx`

**⚠️ Replaces `ProviderBadge.jsx` from old plan.** Shows specific model name, not just provider.

```jsx
// MODEL_DISPLAY maps model IDs to short labels and colors
const MODEL_DISPLAY = {
  "gemini-1.5-flash": { label: "Gemini Flash", color: "blue",   icon: "⚡" },
  "sarvam-30b":       { label: "Sarvam 30B",   color: "orange", icon: "🇮🇳" },
  "gpt-4o-mini":      { label: "GPT-4o Mini",  color: "green",  icon: "🤖" },
  "bulbul:v3":        { label: "Bulbul v3",    color: "orange", icon: "🔊" },
  "tts-1":            { label: "OpenAI TTS",   color: "green",  icon: "🔊" },
  "saaras:v3":        { label: "Saaras v3",    color: "orange", icon: "🎤" },
  "whisper-1":        { label: "Whisper",      color: "green",  icon: "🎤" },
};

// Usage:
<ModelBadge model="gemini-1.5-flash" />  // → ⚡ Gemini Flash (blue pill)
<ModelBadge model="sarvam-30b" />        // → 🇮🇳 Sarvam 30B (orange pill)
```

Used in: sidebar footer (4 badges), message bubbles, chat header.  
Clicking any badge opens `AiSettingsPanel`.

---

## Phase 11 — Credit Badge

**File:** `components/ai/CreditBadge.jsx`

No change from old plan:

```
> 50 credits : neutral   "142 ✦"
10–50 credits: yellow    "28 ✦ Low"
< 10 credits : red       "4 ✦ Upgrade" → click → billing page
```

---

## Phase 12 — Hook Surface

**File:** `features/ai/useAi.js`

```js
import { useAiContext } from "@/context/AiContext";

// Primary hook — thin wrapper
export const useAi = () => useAiContext();

// Convenience derived hooks
export const useActiveConversation = () => {
  const { conversations, activeConversationId } = useAiContext();
  return conversations.find(c => c.id === activeConversationId) ?? null;
};

export const useAiSettings = () => {
  const { settings, updateSettings, isLoadingSettings } = useAiContext();
  return { settings, updateSettings, isLoadingSettings };
};

export const useVoice = () => {
  const { isRecording, isProcessingVoice, voiceResponse, sendVoiceMessage } = useAiContext();
  return { isRecording, isProcessingVoice, voiceResponse, sendVoiceMessage };
};

export const useCredits = () => {
  const { settings: { creditBalance, plan } } = useAiContext();
  const isLow     = creditBalance <= 50 && creditBalance > 10;
  const isUrgent  = creditBalance <= 10;
  return { creditBalance, plan, isLow, isUrgent };
};
```

---

## State Flow Diagrams

### Text Message (Streaming)
```
User types → clicks Send
  → optimistically append { role: "user", content } to messages
  → SET_STREAMING: true, streamingContent: ""
  → POST /conversations/:id/message?stream=true
  → SSE arrives: each token → APPEND_STREAM_TOKEN → React re-renders StreamingMessage
  → SSE ends: STREAM_DONE → appends final assistant message, clears streamingContent
  → loadConversations() → sidebar re-orders with fresh updatedAt
```

### Voice Message
```
User clicks 🎤 → MediaRecorder starts
  → pulsing dot + waveform + timer shown
User clicks ✓ → MediaRecorder stops → Blob created
  → APPEND_MESSAGE: { role: "user", content: "🎤 Processing audio..." }
  → SET_LOADING: isProcessingVoice = true
  → POST /conversations/:id/voice (multipart)
  → response: { userText, reply, audioUrl, billing, models }
  → UPDATE_LAST_USER_MESSAGE: userText (replaces placeholder)
  → APPEND_MESSAGE: { role: "assistant", content: reply }
  → SET_VOICE_RESPONSE: { audioUrl, ... } → VoicePlayer auto-plays
  → SET_LOADING: isProcessingVoice = false
  → loadConversations()
```

### Settings Change
```
User clicks model card in AiSettingsPanel
  → updateSettings({ chatModel: "sarvam-30b" })
  → PATCH /api/ai/settings { chatModel: "sarvam-30b" }
  → GET /api/ai/settings (refresh)
  → SET_SETTINGS with fresh data
  → All ModelBadge components re-render with new selection
  → Next message automatically uses new model (no page reload)
```

---

## Error Handling Strategy

| Error | Status | UI Response |
|---|---|---|
| Insufficient credits | 402 | Toast with "Upgrade Plan" CTA button, link to billing. Not a raw error string. |
| Invalid model ID | 400 | Toast with server message — shouldn't happen if UI only shows valid options |
| Network failure | — | Toast "Connection lost — please retry" + retry button on input bar |
| Mic permission denied | — | Inline message inside VoiceRecorder: "Microphone access is required for voice input" |
| Unsupported browser (no MediaRecorder) | — | VoiceRecorder shows: "Voice not supported in this browser. Try Chrome or Safari." |
| Audio empty transcript | 400 | Toast "Couldn't understand audio — please try again" |
| Streaming interrupted | — | StreamingMessage shows `[Response interrupted — tap to retry]`, retry re-sends message |
| Settings save failure | 4xx/5xx | Toast with error, revert optimistic UI change |

---

## Critical UX Rules

1. **Never block UI on AI response** — User message appears instantly. AI bubble appears as a streaming skeleton while waiting. Never show a spinner that blocks the input.

2. **Streaming must feel real** — Each SSE token renders immediately with zero debounce. Do not batch or throttle tokens.

3. **Voice requires HTTPS** — `getUserMedia` only works on `localhost` or `https://`. Show a clear, user-friendly error if not available.

4. **Credit exhaustion is a first-class state** — 402 errors must show a friendly upgrade prompt. Never show raw HTTP error text to users.

5. **Model switch is immediate** — After `updateSettings()` resolves, the next message uses the new model. No page reload, no conversation reset.

6. **iOS audio format fallback** — Detect `audio/webm` support and fall back to `audio/mp4` for iOS Safari:
   ```js
   const mimeType = MediaRecorder.isTypeSupported("audio/webm")
     ? "audio/webm"
     : "audio/mp4";
   ```

7. **Auto-scroll with escape hatch** — Always scroll to new messages. Stop auto-scrolling the moment the user manually scrolls up. Resume when they scroll back to bottom.

8. **TTS language is never a user input** — The backend always auto-detects TTS language from the AI response text. Do not show a TTS language selector in the UI. The `ttsLanguageMode: "auto"` field confirms this.

9. **All 4 model selections are independent** — Changing `chatModel` does not reset `voiceModel`, `ttsModel`, or `sttModel`. Each has its own selector in the settings panel.

10. **Max voice recording: 2 minutes** — Auto-stop at 120 seconds. Show countdown in the last 30 seconds.

---

## Technical Dependencies

Add to `package.json` if not already present:

```json
"react-markdown": "^9.x",
"remark-gfm": "^4.x",
"react-syntax-highlighter": "^15.x"
```

No audio library needed — use native `MediaRecorder` + `<audio>` element.

---

## Implementation Order (Recommended)

```
Phase 1:  ai.services.js             → test all endpoints with Postman/curl
Phase 2:  AiContext.js               → test in isolation, check state transitions
Phase 3:  layout.jsx                 → verify two-panel layout, AiProvider wrapping
Phase 4:  AiSidebar.jsx              → verify conversations load, create/delete/rename work
Phase 5:  ChatWindow.jsx             → verify messages load, scroll behaviour
Phase 6:  MessageBubble.jsx          → verify markdown rendering, model badge
Phase 7:  ChatInput.jsx              → verify send (non-streaming first)
Phase 8:  Add streaming              → SSE loop, token-by-token rendering
Phase 9:  VoiceRecorder.jsx          → test on HTTPS, iOS fallback, permission errors
Phase 10: VoicePlayer.jsx            → test base64 audio playback, auto-play
Phase 11: AiSettingsPanel.jsx        → 4 model selectors, immediate save, credit display
Phase 12: ModelBadge.jsx             → verify model labels and colors
Phase 13: CreditBadge.jsx            → verify thresholds (50/10 credit boundaries)
Phase 14: useAi.js hooks             → verify derived hook correctness
Phase 15: Mobile responsive          → test breakpoints on real devices
Phase 16: Error states               → simulate all error paths (402, network, mic denied)
```

---

## Files to Delete After Rebuild

```
frontend/src/services/ai.service.js
```

Search for `from.*services/ai.service` across the codebase before deleting. Update any remaining imports to point to `features/ai/ai.services.js`.

---

## Definition of Done

- [ ] User can create, rename, and delete conversations
- [ ] Text messages send and stream token-by-token with no lag
- [ ] Voice recording works end-to-end: record → STT → LLM → TTS → audio plays back
- [ ] Settings panel shows all 4 model selectors with pricing info from API
- [ ] Selecting any model saves immediately, next message uses new model
- [ ] Credit balance shows live in header badge, degrades gracefully at 0 (402 → upgrade CTA)
- [ ] ModelBadge shows correct model name (not just "OpenAI" or "Sarvam")
- [ ] All error states have proper UI (network, credits, voice permission, empty transcript)
- [ ] Works on mobile iOS Safari and Android Chrome
- [ ] Voice iOS format fallback (`audio/mp4`) tested and working
- [ ] TTS language is never shown as a user-configurable option
- [ ] Auto-scroll + manual escape hatch works correctly
- [ ] Switching any of the 4 models mid-conversation works without page reload