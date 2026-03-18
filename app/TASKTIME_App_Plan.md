# TASKTIME Mobile App — Vibe Coding Plan
## For: Antigravity AI Coding Tool
## Stack: React Native CLI (no Expo) · JavaScript · Android + iOS

---

## PROJECT CONTEXT (Read this first)

You are building the **mobile app** for TASKTIME — an AI-powered task and schedule
management SaaS. The backend and web frontend already exist. The app lives in the
`app/` folder alongside `backend/` and `frontend/`.

**Backend base URL:** use environment variable `API_BASE_URL`
**Auth strategy:** The backend uses dual JWT tokens. On mobile, since HttpOnly cookies
don't work natively, store tokens in `react-native-mmkv` (fast encrypted storage).
Access token → memory/MMKV. Refresh token → MMKV (secure).
**All backend API routes are unchanged** — same endpoints as the web frontend uses.

---

## FOLDER STRUCTURE TO CREATE

```
app/
├── android/                    ← already exists (RN CLI generated)
├── ios/                        ← already exists (RN CLI generated)
├── src/
│   ├── api/
│   │   ├── client.js           ← Axios instance + token refresh interceptor
│   │   ├── auth.api.js
│   │   ├── task.api.js
│   │   ├── schedule.api.js
│   │   ├── behavior.api.js
│   │   ├── dashboard.api.js
│   │   ├── ai.api.js
│   │   └── billing.api.js
│   │
│   ├── store/
│   │   ├── auth.store.js       ← Zustand: user, accessToken, isLoggedIn
│   │   ├── task.store.js       ← Zustand: tasks list, filters
│   │   └── ui.store.js         ← Zustand: loading states, active tab
│   │
│   ├── navigation/
│   │   ├── RootNavigator.js    ← switches between Auth stack and App tabs
│   │   ├── AuthNavigator.js    ← stack: Login → Register → OTP
│   │   └── AppNavigator.js     ← bottom tabs: Dashboard/Tasks/Schedule/Chat/Profile
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   └── OtpScreen.js
│   │   ├── dashboard/
│   │   │   └── DashboardScreen.js
│   │   ├── tasks/
│   │   │   ├── TasksScreen.js
│   │   │   ├── TaskDetailScreen.js
│   │   │   └── CreateTaskScreen.js
│   │   ├── schedule/
│   │   │   ├── ScheduleScreen.js
│   │   │   └── CreateScheduleScreen.js
│   │   ├── ai/
│   │   │   └── AiChatScreen.js
│   │   ├── behavior/
│   │   │   └── BehaviorScreen.js
│   │   └── profile/
│   │       ├── ProfileScreen.js
│   │       └── BillingScreen.js
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   ├── Card.js
│   │   │   ├── Loader.js
│   │   │   ├── Badge.js
│   │   │   └── EmptyState.js
│   │   ├── tasks/
│   │   │   ├── TaskCard.js
│   │   │   └── PriorityBadge.js
│   │   ├── schedule/
│   │   │   └── ScheduleCard.js
│   │   ├── dashboard/
│   │   │   ├── ScoreRing.js
│   │   │   └── StreakBanner.js
│   │   └── ai/
│   │       ├── ChatBubble.js
│   │       └── ModelSelector.js
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useTasks.js
│   │   ├── useSchedule.js
│   │   └── useStream.js        ← handles SSE streaming for AI chat
│   │
│   ├── utils/
│   │   ├── storage.js          ← MMKV wrapper (get/set/delete tokens)
│   │   ├── date.js             ← format helpers (same logic as backend)
│   │   └── constants.js        ← API_BASE_URL, plan limits, colors
│   │
│   └── theme/
│       ├── colors.js           ← TASKTIME black/cyan palette
│       ├── typography.js
│       └── spacing.js
│
├── .env                        ← API_BASE_URL=https://your-backend.com/api
├── babel.config.js
├── metro.config.js
└── package.json
```

---

## DEPENDENCIES TO INSTALL

```bash
# Navigation
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# HTTP + Storage
npm install axios
npm install react-native-mmkv

# State Management
npm install zustand

# UI / Icons
npm install react-native-vector-icons
npm install react-native-reanimated
npm install react-native-gesture-handler

# Date
npm install date-fns

# Markdown (for AI responses)
npm install react-native-markdown-display

# Environment variables
npm install react-native-config
```

---

## PHASE 1 — Foundation (Build this first)

### Step 1.1 — Theme (src/theme/)

**colors.js**
```js
export const colors = {
  bg: '#0a0a0a',           // main background — deep black
  surface: '#111111',      // card background
  border: '#1e1e1e',       // borders
  cyan: '#00d4ff',         // primary accent — TASKTIME cyan
  cyanDim: '#00d4ff22',    // cyan with low opacity for backgrounds
  text: '#ffffff',
  textMuted: '#888888',
  textDim: '#555555',
  error: '#ff4444',
  success: '#00cc88',
  warning: '#ffaa00',
  priorityHigh: '#ff4444',
  priorityMedium: '#ffaa00',
  priorityLow: '#00cc88',
};
```

**typography.js** — define fontSizes (xs:11, sm:13, md:15, lg:17, xl:20, xxl:26)  
**spacing.js** — define spacing scale (xs:4, sm:8, md:12, lg:16, xl:24, xxl:32)

---

### Step 1.2 — Storage Utility (src/utils/storage.js)

```js
import { MMKV } from 'react-native-mmkv';
const storage = new MMKV({ id: 'tasktime-storage' });

export const Storage = {
  setAccessToken:  (t) => storage.set('accessToken', t),
  getAccessToken:  ()  => storage.getString('accessToken') ?? null,
  setRefreshToken: (t) => storage.set('refreshToken', t),
  getRefreshToken: ()  => storage.getString('refreshToken') ?? null,
  setUser:         (u) => storage.set('user', JSON.stringify(u)),
  getUser:         ()  => { const u = storage.getString('user'); return u ? JSON.parse(u) : null; },
  clear:           ()  => storage.clearAll(),
};
```

---

### Step 1.3 — API Client (src/api/client.js)

```js
import axios from 'axios';
import { Storage } from '../utils/storage';
import { API_BASE_URL } from '../utils/constants';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
client.interceptors.request.use((config) => {
  const token = Storage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
  failedQueue = [];
};

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return client(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = Storage.getRefreshToken();
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken }     // send as body on mobile (no cookies)
        );
        Storage.setAccessToken(data.accessToken);
        if (data.refreshToken) Storage.setRefreshToken(data.refreshToken);
        processQueue(null, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return client(original);
      } catch (err) {
        processQueue(err, null);
        Storage.clear();
        // trigger logout via auth store
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default client;
```

> ⚠️ **Backend note:** The backend refresh-token endpoint currently reads the token
> from an HttpOnly cookie. You will need to add support for reading it from the
> request body as a fallback for mobile clients. Add this to the backend's
> refresh-token controller:
> ```js
> const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
> ```

---

### Step 1.4 — Auth Store (src/store/auth.store.js)

```js
import { create } from 'zustand';
import { Storage } from '../utils/storage';

export const useAuthStore = create((set) => ({
  user:        Storage.getUser(),
  accessToken: Storage.getAccessToken(),
  isLoggedIn:  !!Storage.getAccessToken(),

  setAuth: (user, accessToken, refreshToken) => {
    Storage.setUser(user);
    Storage.setAccessToken(accessToken);
    if (refreshToken) Storage.setRefreshToken(refreshToken);
    set({ user, accessToken, isLoggedIn: true });
  },

  logout: () => {
    Storage.clear();
    set({ user: null, accessToken: null, isLoggedIn: false });
  },

  updateUser: (updates) => set((s) => {
    const updated = { ...s.user, ...updates };
    Storage.setUser(updated);
    return { user: updated };
  }),
}));
```

---

### Step 1.5 — Navigation (src/navigation/)

**RootNavigator.js**
```js
// If isLoggedIn → show AppNavigator (bottom tabs)
// If not → show AuthNavigator (login/register stack)
// Read isLoggedIn from useAuthStore
```

**AuthNavigator.js** — Stack: Login → Register → OtpVerification

**AppNavigator.js** — Bottom tabs with icons:
| Tab | Icon | Screen |
|-----|------|--------|
| Dashboard | home | DashboardScreen |
| Tasks | check-square | TasksScreen |
| Schedule | calendar | ScheduleScreen |
| AI Chat | message-circle | AiChatScreen |
| Profile | user | ProfileScreen |

---

## PHASE 2 — Auth Screens

### LoginScreen.js
- Email + Password inputs
- "Remember Me" toggle
- Login button → POST /auth/login → store tokens → navigate to App
- "Don't have account?" → Register
- "Forgot password?" → ForgotPassword flow

### RegisterScreen.js
- Name + Email + Password inputs
- Register button → POST /auth/signup → navigate to OTP screen passing email

### OtpScreen.js
- 6-box OTP input (one digit per box)
- Auto-advance focus on each digit entry
- "Verify" → POST /auth/verify-otp → navigate to App
- "Resend OTP" button with 30-second cooldown timer

---

## PHASE 3 — Dashboard Screen

**API:** `GET /dashboard/overview`

**UI sections (top to bottom):**
1. **Header** — "Good morning, {name} 👋" + cyan greeting
2. **Score Ring** — circular progress showing productivity score 0–100
3. **Streak Banner** — "🔥 {n} day streak"
4. **Quick Stats row** — Tasks Today | Completed | Scheduled (3 cards)
5. **Today's Timeline** — flat list of today's schedule blocks ordered by startTime
6. **Upcoming Tasks** — next 5 tasks with dueDate, sorted by priority

**Pull-to-refresh** on the whole screen.

---

## PHASE 4 — Tasks Screen

**API:** `GET /tasks` with query params

**UI:**
- Top bar: search input + filter button (priority dropdown)
- Priority filter chips: ALL | HIGH | MEDIUM | LOW
- FlatList of TaskCard components
- Each TaskCard: title, priority badge, category chip, due date (if any), checkbox to complete
- Swipe left on card → delete (with confirmation)
- FAB (floating action button) bottom-right → opens CreateTaskScreen
- Empty state illustration when no tasks

**CreateTaskScreen (modal/bottom sheet):**
- Title input (required)
- Description textarea
- Priority selector: LOW / MEDIUM / HIGH chips
- Due date picker (optional) — react-native DateTimePicker
- Category selector (fetches from GET /categories)
- Save button → POST /tasks

---

## PHASE 5 — Schedule Screen

**API:** `GET /calendar/range?from=YYYY-MM-DD&to=YYYY-MM-DD`

**UI:**
- Week strip calendar at top (7 days, tap to select day)
- Selected day's schedule list below
- Each ScheduleCard: task title, time range (e.g. 7:00 AM – 8:00 AM), recurrence badge
- Check button on each card → POST /schedules/:id/complete
- FAB → CreateScheduleScreen

**CreateScheduleScreen:**
- Task picker (searchable — fetches GET /tasks, only tasks with dueDate = null)
- Date picker
- Start time + End time pickers
- Recurrence selector: NONE / DAILY / WEEKLY / MONTHLY
- If WEEKLY → day-of-week multi-select (Mon–Sun checkboxes)
- Repeat until date (optional)
- Save → POST /schedules (shows conflict error if 409)

---

## PHASE 6 — AI Chat Screen

**API:** `POST /ai/conversations/:id/stream` (streaming)

**UI:**
- Conversation list screen (GET /ai/conversations)
  - Each item: conversation title, last message preview, model badge
  - FAB → start new conversation
- Chat screen:
  - FlatList of ChatBubble components (user = right, assistant = left)
  - Streaming: as tokens arrive, update the last assistant bubble in real-time
  - Bottom bar: text input + send button + model selector icon
  - Model selector opens bottom sheet with 4 model options

**Streaming implementation (useStream.js hook):**
```js
// React Native cannot use browser EventSource/ReadableStream
// Use fetch with response.body reader OR use a streaming-compatible library
// Recommended: use XMLHttpRequest with onprogress for RN streaming
// OR install: react-native-sse package

import RNEventSource from 'react-native-sse';

// Connect to stream endpoint, accumulate chunks, update state per chunk
```

**ChatBubble.js:**
- User bubble: right-aligned, cyan background
- Assistant bubble: left-aligned, dark surface background, renders markdown
- Shows model name below assistant bubbles (e.g. "Gemini 1.5 Flash")
- Streaming cursor animation (blinking) while response is incomplete

---

## PHASE 7 — Behavior Log Screen

**API:** `POST /behavior` (upsert), `GET /behavior/:date`

**UI (daily log card):**
- Date display: "Today, March 7"
- Mood selector: 😊 HAPPY  😐 NEUTRAL  😔 SAD (tappable icons, selected = cyan border)
- Sleep hours: horizontal slider 0–12 hours, shows value e.g. "7.5 hrs"
- Exercise: large toggle switch "Did you exercise today?"
- Notes: optional multiline text input
- Save button → POST /behavior
- Below: last 7 days mini behavior history (colored dots — green/yellow/red)

---

## PHASE 8 — Profile Screen

**UI sections:**
1. **User Card** — avatar initials circle, name, email, plan badge (FREE/PRO/PRO+)
2. **AI Preferences** — current model, tap to change (bottom sheet with model list)
3. **Subscription** — current plan details, credits remaining, upgrade button
4. **BillingScreen** — plan cards (FREE / PRO / PRO+) with Razorpay integration
5. **Settings** — timezone, dark mode toggle
6. **Danger Zone** — Logout button, Delete Account (with confirmation)

**BillingScreen:**
- 3 plan cards: FREE / PRO (₹29) / PRO_PLUS (₹79)
- Monthly / Yearly toggle (show discounted price for yearly)
- "Upgrade" button → POST /billing/subscribe → opens Razorpay SDK
- Credit top-up section: 3 packages (200/450/1000 credits)
- Install: `npm install react-native-razorpay`

---

## PHASE 9 — API Files

Create one file per domain. Each exports async functions that call `client.js`.

**src/api/auth.api.js**
```js
import client from './client';

export const login    = (email, password, remember) =>
  client.post('/auth/login', { email, password, remember });

export const register = (name, email, password) =>
  client.post('/auth/signup', { name, email, password });

export const verifyOtp = (email, code) =>
  client.post('/auth/verify-otp', { email, code });

export const refreshToken = (token) =>
  client.post('/auth/refresh-token', { refreshToken: token });

export const logout   = () => client.post('/auth/logout');
export const getMe    = () => client.get('/auth/me');
export const forgotPassword = (email) =>
  client.post('/auth/forgot-password', { email });
export const resetPassword = (email, code, password) =>
  client.post('/auth/reset-password', { email, code, password });
```

**src/api/task.api.js**
```js
export const getTasks    = (params) => client.get('/tasks', { params });
export const createTask  = (data)   => client.post('/tasks', data);
export const updateTask  = (id, d)  => client.patch(`/tasks/${id}`, d);
export const deleteTask  = (id)     => client.delete(`/tasks/${id}`);
export const completeTask = (id)    => client.post(`/tasks/${id}/complete`);
```

**src/api/schedule.api.js**
```js
export const getCalendar    = (from, to) =>
  client.get('/calendar/range', { params: { from, to } });
export const createSchedule = (data) => client.post('/schedules', data);
export const deleteSchedule = (id)   => client.delete(`/schedules/${id}`);
export const completeSchedule = (id) =>
  client.post(`/schedules/${id}/complete`);
```

**src/api/ai.api.js**
```js
export const getConversations = () => client.get('/ai/conversations');
export const createConversation = (type) =>
  client.post('/ai/conversations', { type });
export const getMessages = (id) =>
  client.get(`/ai/conversations/${id}/messages`);
// Streaming handled separately in useStream.js hook
```

**src/api/dashboard.api.js**
```js
export const getOverview = () => client.get('/dashboard/overview');
```

**src/api/behavior.api.js**
```js
export const logBehavior  = (data)  => client.post('/behavior', data);
export const getBehavior  = (date)  => client.get(`/behavior/${date}`);
```

**src/api/billing.api.js**
```js
export const getSubscription = () => client.get('/billing/current');
export const subscribe = (plan, billingCycle) =>
  client.post('/billing/subscribe', { plan, billingCycle });
export const createTopUp = (packageId) =>
  client.post('/billing/topup', { packageId });
```

---

## PHASE 10 — Common Components

### Button.js
```
Props: title, onPress, variant (primary/outline/ghost/danger),
       loading (bool), disabled (bool), size (sm/md/lg)
Primary: cyan background, black text
Outline: transparent bg, cyan border + text
Ghost: no border, cyan text
Danger: red border + text
Loading: shows ActivityIndicator instead of text
```

### Input.js
```
Props: label, value, onChangeText, placeholder, secureTextEntry,
       error (string), multiline, leftIcon, rightIcon
Style: dark background (#111), cyan focus border, error = red border
Show error text below input when error prop is set
```

### Card.js
```
Props: children, style, onPress
Style: #111111 background, 1px #1e1e1e border, 12px border radius, 16px padding
```

### TaskCard.js
```
Shows: checkbox, title, priority badge (colored), category chip, due date
Checkbox tap → calls completeTask API → strike-through animation
Priority colors: HIGH=#ff4444 MEDIUM=#ffaa00 LOW=#00cc88
```

### PriorityBadge.js
```
Props: priority (LOW/MEDIUM/HIGH)
Small pill with colored background + text
```

### ScoreRing.js
```
Props: score (0-100)
Circular progress ring — use react-native-svg to draw arc
Inner text: large score number + small "/ 100"
Color: interpolate cyan → yellow → red based on score
```

---

## KEY IMPLEMENTATION NOTES

### 1. Token storage on mobile
HttpOnly cookies don't work in React Native. Store both tokens in MMKV:
- Access token: `MMKV.set('accessToken', token)`
- Refresh token: `MMKV.set('refreshToken', token)`

### 2. Backend change required (1 line)
In `backend/src/controllers/auth.controller.js`, the refresh-token endpoint
must also accept the token from `req.body.refreshToken` (not just cookie):
```js
const token = req.cookies?.refreshToken || req.body?.refreshToken;
```

### 3. AI Streaming on React Native
Browser `EventSource` and `ReadableStream` are NOT available in React Native.
Use one of:
- `react-native-sse` package (EventSource polyfill)
- `XMLHttpRequest` with `onprogress` callback (receives chunks)
- `fetch` with `response.body.getReader()` — works in RN 0.73+

### 4. Razorpay on mobile
Install: `npm install react-native-razorpay`  
Run on Android: `cd android && ./gradlew clean`  
Usage:
```js
import RazorpayCheckout from 'react-native-razorpay';
RazorpayCheckout.open(options).then(handleSuccess).catch(handleFailure);
```

### 5. Android back button
Handle hardware back button with `BackHandler` in navigation-heavy screens
(especially the chat screen and modals).

### 6. Keyboard avoiding
Wrap all forms and the chat input in `KeyboardAvoidingView` with
`behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`.

---

## BUILD ORDER FOR ANTIGRAVITY

Tell Antigravity to build in this exact sequence:

```
1. src/theme/colors.js + typography.js + spacing.js
2. src/utils/storage.js
3. src/utils/constants.js
4. src/api/client.js
5. src/api/auth.api.js + task.api.js + schedule.api.js +
   behavior.api.js + dashboard.api.js + ai.api.js + billing.api.js
6. src/store/auth.store.js + task.store.js + ui.store.js
7. src/navigation/RootNavigator.js + AuthNavigator.js + AppNavigator.js
8. src/components/common/ (Button, Input, Card, Loader, Badge, EmptyState)
9. src/screens/auth/ (Login, Register, OTP)
10. src/screens/dashboard/DashboardScreen.js
11. src/components/tasks/TaskCard.js + PriorityBadge.js
12. src/screens/tasks/ (Tasks list + Create)
13. src/screens/schedule/ (Schedule list + Create)
14. src/components/ai/ (ChatBubble, ModelSelector)
15. src/hooks/useStream.js
16. src/screens/ai/AiChatScreen.js
17. src/screens/behavior/BehaviorScreen.js
18. src/screens/profile/ (Profile + Billing)
```

---

## SCREENS SUMMARY

| Screen | Route Name | API Called |
|--------|-----------|------------|
| Login | Login | POST /auth/login |
| Register | Register | POST /auth/signup |
| OTP Verify | OtpVerification | POST /auth/verify-otp |
| Dashboard | Dashboard | GET /dashboard/overview |
| Tasks List | Tasks | GET /tasks |
| Create Task | CreateTask | POST /tasks |
| Task Detail | TaskDetail | GET /tasks/:id, PATCH /tasks/:id |
| Schedule | Schedule | GET /calendar/range |
| Create Schedule | CreateSchedule | POST /schedules |
| AI Chat List | ChatList | GET /ai/conversations |
| AI Chat | Chat | POST /ai/conversations/:id/stream |
| Behavior | Behavior | GET+POST /behavior |
| Profile | Profile | GET /auth/me |
| Billing | Billing | GET /billing/current |

---

## .env file

```
API_BASE_URL=https://your-backend-url.com/api
```

For local development:
```
API_BASE_URL=http://10.0.2.2:5000/api   ← Android emulator → localhost
API_BASE_URL=http://localhost:5000/api  ← iOS simulator → localhost
```

---

*TASKTIME Mobile App Plan v1.0 — Antigravity Vibe Coding*
*React Native CLI · JavaScript · Android + iOS*
