# Antigravity — TASKTIME Mobile App Master Plan Prompt
# Copy everything below this line and paste into Antigravity

---

Hey, before you write any code at all, I want you to create a master plan first and then work according to it step by step. Here is what I need you to do:

---

## WHO YOU ARE AND WHAT YOU ARE BUILDING

You are building the **TASKTIME React Native mobile app** (no Expo, JavaScript only, React Native CLI). The project already has a working backend and a working web frontend. Your job is to build the mobile app inside the `app/` folder that connects to the same backend API the web frontend uses.

The folder structure of the whole project is:
```
tasktime/
├── app/        ← you work here (React Native)
├── backend/    ← already done, do not touch
└── frontend/   ← already done, read this to understand everything
```

---

## YOUR JOB RIGHT NOW — READ AND ANALYSE FIRST, NO CODING YET

Before touching `app/` folder, read the entire `frontend/` codebase.

The frontend is a Next.js web app that already does everything we need to replicate on mobile. It has all the screens, all the API calls, all the form fields, all the UI states. Your job is to read it, understand it deeply, and then use that knowledge to build the mobile version.

Go through every folder and every file listed below. For each file understand:
- What is shown on screen to the user
- What the user types or taps or selects (inputs, forms, buttons)
- Which API endpoint is called, with what request body or query params
- What success, loading, empty, and error states look like
- What data comes back from the API and how it is displayed

---

## FOLDER BY FOLDER — READ ALL OF THESE

### 1. GLOBAL CSS AND APP ENTRY
```
frontend/src/app/global.css            ← TASKTIME color palette, fonts, design tokens
frontend/src/app/layout.jsx            ← root layout, providers, font setup
frontend/src/app/page.jsx              ← landing page entry
```
From `global.css` extract: all color variables (black, cyan, backgrounds, borders), font families, and any design tokens. You will use these to build `src/theme/colors.js`, `src/theme/typography.js`, `src/theme/spacing.js` in the mobile app.

---

### 2. AUTH SCREENS AND LOGIC
```
frontend/src/app/(auth)/login/page.jsx
frontend/src/app/(auth)/signup/page.jsx
frontend/src/app/(auth)/forgot-password/page.jsx
frontend/src/app/(auth)/reset-password/page.jsx
frontend/src/app/(auth)/layout.jsx

frontend/src/features/auth/components/LoginForm.jsx
frontend/src/features/auth/components/SignupForm.jsx
frontend/src/features/auth/components/ForgotPasswordForm.jsx
frontend/src/features/auth/components/ResetPasswordForm.jsx
frontend/src/features/auth/components/ProtectedRoute.jsx
frontend/src/features/auth/auth.actions.js
frontend/src/features/auth/context/AuthContext.js

frontend/src/context/AuthContext.jsx
frontend/src/services/auth.service.js
```
For each auth screen note:
- Every field the user fills in (email, password, name, OTP digits, etc.)
- Validation rules (required, min length, email format, password match)
- What API is called on submit
- Where the user goes on success
- What error messages are shown on failure

---

### 3. DASHBOARD — ALL VIEWS
```
frontend/src/app/(dashboard)/dashboard/page.jsx
frontend/src/app/(dashboard)/dashboard/today/page.jsx
frontend/src/app/(dashboard)/dashboard/weekly/page.jsx
frontend/src/app/(dashboard)/dashboard/monthly/page.jsx
frontend/src/app/(dashboard)/dashboard/streaks/page.jsx
frontend/src/app/(dashboard)/dashboard/performance/page.jsx
frontend/src/app/(dashboard)/layout.jsx

frontend/src/app/(dashboard)/dashboard/_components/DashboardHeader.jsx
frontend/src/app/(dashboard)/dashboard/_components/StatCard.jsx
frontend/src/app/(dashboard)/dashboard/_components/CalendarGrid.jsx

frontend/src/features/dashboard/components/DashboardOverview.jsx
frontend/src/features/dashboard/components/OverviewCards.jsx
frontend/src/features/dashboard/components/TodayDashboard.jsx
frontend/src/features/dashboard/components/WeeklyDashboard.jsx
frontend/src/features/dashboard/components/MonthlyDashboard.jsx
frontend/src/features/dashboard/components/StreaksDashboard.jsx

frontend/src/features/dashboard/useDashboard.js
frontend/src/features/dashboard/useTodayDashboard.js
frontend/src/features/dashboard/useWeeklyDashboard.js
frontend/src/features/dashboard/useMonthlyDashboard.js
frontend/src/features/dashboard/useStreaks.js
frontend/src/features/dashboard/dashboard.actions.js
frontend/src/features/dashboard/dashboard.types.js
frontend/src/features/dashboard/api.js

frontend/src/services/dashboard.service.js
frontend/src/services/dashboard.services.js

frontend/src/components/dashboard/DashboardCard.jsx
frontend/src/components/dashboard/PageHeader.jsx
frontend/src/components/dashboard/Sidebar.jsx
frontend/src/components/dashboard/SkeletonLoader.jsx
frontend/src/components/dashboard/charts/PerformanceChart.jsx
```
For each dashboard view note:
- Exactly which numbers and stats are shown (score, streak count, tasks completed, tasks total, etc.)
- Which API endpoint is called and what query params (date ranges, etc.)
- How streak is calculated or what the API returns for it
- What the performance chart shows (days, scores, chart type)
- How today vs weekly vs monthly views differ

---

### 4. TASKS — LIST, DETAIL, CREATE, EDIT
```
frontend/src/app/(dashboard)/dashboard/tasks/page.jsx
frontend/src/app/(dashboard)/dashboard/tasks/TaskModal.jsx

frontend/src/features/tasks/useTasks.js
frontend/src/features/tasks/tasks.actions.js
frontend/src/features/tasks/tasks.constants.js

frontend/src/services/task.service.js
frontend/src/services/tasks.service.js
frontend/src/services/category.service.js

frontend/src/components/dashboard/TaskItem.jsx
frontend/src/components/dashboard/TaskList.jsx
frontend/src/components/dashboard/TaskModal.jsx
frontend/src/components/dashboard/UniversalTaskCard.jsx
frontend/src/components/dashboard/TaskDetailDrawer.jsx
frontend/src/components/dashboard/AiCommandInput.jsx
```
Note:
- Every field in the create/edit task form (title, description, priority, dueDate, categoryId)
- How priority is displayed (colors, labels)
- How categories work (fetched separately, shown as chips)
- How task completion works (checkbox? toggle? what API call?)
- What filters exist on the task list (priority, search, archived)
- What the task detail drawer shows
- What AiCommandInput does (quick AI actions from task list)

---

### 5. SCHEDULE AND CALENDAR
```
frontend/src/app/(dashboard)/dashboard/schedule/page.jsx
frontend/src/app/(dashboard)/dashboard/schedule/ScheduleModal.jsx
frontend/src/app/(dashboard)/dashboard/calendar/page.jsx

frontend/src/services/schedule.service.js
frontend/src/services/calendar.service.js
```
Note:
- Fields in create schedule form (taskId, scheduleDate, startTime, endTime, recurrence type, repeatOnDays, repeatUntil)
- How recurring schedules are displayed on the calendar
- How schedule completion (mark as done) works
- What the calendar grid shows and how it is navigated

---

### 6. AI CHAT — FULL SYSTEM
```
frontend/src/app/(ai)/dashboard/ai/page.jsx
frontend/src/app/(ai)/dashboard/ai/c/[id]/page.jsx
frontend/src/app/(ai)/layout.jsx

frontend/src/components/ai/AiSidebar.jsx
frontend/src/components/ai/ChatWindow.jsx
frontend/src/components/ai/ChatInput.jsx
frontend/src/components/ai/MessageBubble.jsx
frontend/src/components/ai/StreamingMessage.jsx
frontend/src/components/ai/AiSettingsPanel.jsx
frontend/src/components/ai/ModelCard.jsx
frontend/src/components/ai/ModelBadge.jsx
frontend/src/components/ai/CreditBadge.jsx
frontend/src/components/ai/VoiceRecorder.jsx
frontend/src/components/ai/VoicePlayer.jsx

frontend/src/features/ai/useAi.js
frontend/src/features/ai/ai.services.js
frontend/src/context/AiContext.js
```
Note very carefully:
- How the conversation list (sidebar) is shown and how a new conversation is started
- How streaming works — does it use EventSource? fetch with ReadableStream? SSE? What endpoint?
- How voice recording works (what API for STT?) and how voice response plays back (what API for TTS?)
- How the model selector works — which models are shown, which are locked by plan
- How the credit badge works — what number is shown, where does it come from
- How markdown in AI responses is rendered
- The exact streaming endpoint URL and method

---

### 7. BEHAVIOR LOGGING
```
frontend/src/app/(dashboard)/dashboard/behavior/page.jsx
frontend/src/components/dashboard/BehaviorLogModal.jsx
frontend/src/services/behavior.service.js
```
Note:
- The three behavior fields (mood: HAPPY/NEUTRAL/SAD, sleepHours: 0–12, exercise: true/false)
- Optional notes field
- How the save works (is it a upsert — i.e., one log per day?)
- What history is shown below the form

---

### 8. BILLING AND PLANS
```
frontend/src/app/(dashboard)/dashboard/billing/page.jsx
frontend/src/services/billing.service.js
frontend/src/services/usage.service.js
frontend/src/components/RazorpayScript.jsx
frontend/src/components/ui/UpgradeModal.jsx
```
Note:
- The three plan tiers shown (FREE, PRO at ₹29/month, PRO_PLUS at ₹79/month)
- Monthly vs yearly billing toggle and how prices change
- The credit top-up packages (200/450/1000 credits)
- How Razorpay checkout is triggered — what happens after payment
- What usage limits are shown and where

---

### 9. SETTINGS
```
frontend/src/app/(dashboard)/dashboard/settings/page.jsx
```
Note:
- What settings exist (timezone? AI model preference? voice model? TTS speaker? language?)
- Which API endpoint saves each setting
- What input type each setting uses (dropdown, toggle, text)

---

### 10. UI COMPONENTS — DESIGN SYSTEM
```
frontend/src/components/ui/Button.jsx
frontend/src/components/ui/Input.jsx
frontend/src/components/ui/Card.jsx
frontend/src/components/ui/Badge.jsx
frontend/src/components/ui/Modal.jsx
frontend/src/components/ui/Spinner.jsx
frontend/src/components/ui/Toggle.jsx
frontend/src/components/ui/Skeleton.jsx
frontend/src/components/ui/ConfirmationModal.jsx
frontend/src/components/ui/UpgradeModal.jsx
frontend/src/components/ui/ErrorBoundary.jsx
```
For each UI component note:
- What props it accepts
- What variants it has (e.g. Button has primary/outline/ghost/danger)
- What sizes it has (sm/md/lg)
- The exact colors used (from global.css variables)

---

### 11. SERVICES AND API LAYER
```
frontend/src/services/api.js
frontend/src/services/auth.service.js
frontend/src/services/task.service.js
frontend/src/services/tasks.service.js
frontend/src/services/schedule.service.js
frontend/src/services/calendar.service.js
frontend/src/services/behavior.service.js
frontend/src/services/billing.service.js
frontend/src/services/category.service.js
frontend/src/services/dashboard.service.js
frontend/src/services/dashboard.services.js
frontend/src/services/usage.service.js
frontend/src/services/public.service.js
```
From `api.js` understand:
- How the base Axios instance is created
- How the auth token is attached to requests
- How the token refresh interceptor works on 401 responses

From each service file: copy the exact API endpoint URLs, HTTP methods, request bodies, and query params. These are your ground truth for the mobile API layer.

---

### 12. CONTEXTS AND HOOKS
```
frontend/src/context/AuthContext.jsx
frontend/src/context/AiContext.js
frontend/src/context/ToastContext.jsx
frontend/src/hooks/useDarkmode.js
frontend/src/lib/utils.js
frontend/src/config/dashboard-navigation.js
```
Note:
- What state AuthContext holds (user object, tokens, isLoggedIn, plan, credits balance)
- What AiContext holds (conversations list, active conversation, model, streaming state)
- What toast notifications exist and when they are triggered
- What the sidebar navigation items are (from dashboard-navigation.js)

---

## AFTER READING ALL FILES — CREATE CHECKLIST 1

Once you have read every file above, produce **Checklist 1 — Frontend Analysis**.

Format it exactly like this for every screen/feature:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHECKLIST 1 — FRONTEND ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DESIGN SYSTEM
─────────────
[ ] Primary background:      #______
[ ] Surface / card:          #______
[ ] Primary accent (cyan):   #______
[ ] Text primary:            #______
[ ] Text muted:              #______
[ ] Error color:             #______
[ ] Success color:           #______
[ ] Priority HIGH color:     #______
[ ] Priority MEDIUM color:   #______
[ ] Priority LOW color:      #______
[ ] Primary font family:     ______
[ ] Heading font sizes:      ______
[ ] Body font size:          ______

AUTH — LOGIN
─────────────
[ ] Fields user fills:       email (text), password (secure)
[ ] Extras:                  "Remember me" toggle
[ ] Validation:              email format, password min 8 chars
[ ] API call:                POST /auth/login  { email, password, remember }
[ ] On success:              store accessToken + refreshToken → go to Dashboard
[ ] Error states:            invalid credentials, email not verified
[ ] Other links:             Forgot password, Go to signup

AUTH — SIGNUP
─────────────
[ ] Fields user fills:       name, email, password, confirm password
[ ] Validation:              ...
[ ] API call:                POST /auth/signup  { name, email, password }
[ ] On success:              go to OTP verification screen
[ ] Error states:            email already registered

AUTH — OTP VERIFICATION
────────────────────────
[ ] Fields user fills:       6-digit code (one box per digit)
[ ] API call:                POST /auth/verify-otp  { email, code }
[ ] On success:              store tokens → go to Dashboard
[ ] Resend OTP:              POST /auth/otp-request  { email }
[ ] Resend cooldown:         __ seconds

AUTH — FORGOT PASSWORD
───────────────────────
[ ] Fields user fills:       email
[ ] API call:                POST /auth/forgot-password  { email }
[ ] On success:              show "check your email" message

AUTH — RESET PASSWORD
──────────────────────
[ ] Fields user fills:       OTP code, new password, confirm password
[ ] API call:                POST /auth/reset-password  { token, password }
[ ] On success:              go to Login

DASHBOARD — OVERVIEW
─────────────────────
[ ] Data shown:              productivity score (0-100), streak days, ...
[ ] API call:                GET /dashboard/overview
[ ] Response fields used:    ...
[ ] Loading state:           skeleton cards
[ ] Empty state:             ...

DASHBOARD — TODAY
──────────────────
[ ] Data shown:              ...
[ ] API call:                ...

DASHBOARD — WEEKLY
───────────────────
[ ] Data shown:              ...
[ ] API call:                ...

DASHBOARD — MONTHLY
────────────────────
[ ] Data shown:              ...
[ ] API call:                ...

DASHBOARD — STREAKS
────────────────────
[ ] Data shown:              ...
[ ] API call:                ...

DASHBOARD — PERFORMANCE
────────────────────────
[ ] Data shown:              chart type, x-axis, y-axis, time range
[ ] API call:                ...

TASKS — LIST
─────────────
[ ] Data shown:              title, priority badge, category chip, dueDate, completion checkbox
[ ] Filters:                 priority (ALL/HIGH/MEDIUM/LOW), search by title, archived toggle
[ ] API call:                GET /tasks  { priority, search, isArchived, page, limit }
[ ] Actions per task:        complete, edit, delete (swipe or button?)
[ ] Empty state:             ...

TASKS — CREATE / EDIT MODAL
─────────────────────────────
[ ] Fields:                  title (required), description, priority selector, dueDate picker, categoryId selector
[ ] API create:              POST /tasks  { title, description, priority, dueDate, categoryId }
[ ] API edit:                PATCH /tasks/:id  { ...fields }
[ ] Category fetch:          GET /categories

SCHEDULE — LIST
────────────────
[ ] Data shown:              ...
[ ] API call:                ...

SCHEDULE — CREATE MODAL
────────────────────────
[ ] Fields:                  taskId, scheduleDate, startTime, endTime, recurrence, repeatOnDays, repeatUntil
[ ] Recurrence options:      NONE / DAILY / WEEKLY / MONTHLY
[ ] WEEKLY extra:            day-of-week multi-select (Mon–Sun)
[ ] Task picker:             only tasks with dueDate = null shown
[ ] API call:                POST /schedules  { ... }
[ ] Conflict error (409):    show message explaining overlap

CALENDAR VIEW
──────────────
[ ] Navigation:              month strip? week strip? how does user move between dates?
[ ] Data shown per day:      schedule blocks with time + task name
[ ] API call:                GET /calendar/range?from=...&to=...

AI CHAT — CONVERSATIONS LIST
──────────────────────────────
[ ] Data shown:              conversation title, last message preview, date, model used
[ ] API call:                GET /ai/conversations
[ ] New conversation:        POST /ai/conversations  { type }
[ ] Delete conversation:     DELETE /ai/conversations/:id

AI CHAT — CHAT WINDOW
──────────────────────
[ ] Streaming method:        EventSource / fetch ReadableStream / SSE — which one exactly?
[ ] Stream endpoint:         POST /ai/conversations/:id/stream
[ ] User message bubble:     right side, which color?
[ ] AI response bubble:      left side, renders markdown?
[ ] Voice input:             which STT API? what audio format? what endpoint?
[ ] Voice output:            which TTS model? how is audio played back?
[ ] Model selector:          which models shown? which locked behind plan?
[ ] Credit display:          what number shown? where from?

BEHAVIOR LOG
─────────────
[ ] Fields:                  mood (HAPPY/NEUTRAL/SAD), sleepHours (0-12), exercise (bool), notes (optional)
[ ] API call:                POST /behavior  { mood, sleepHours, exercise, notes, date }
[ ] One log per day?:        yes/no
[ ] History shown:           how many days back?

BILLING
────────
[ ] Plans shown:             FREE (₹0), PRO (₹29/mo or ₹299/yr), PRO_PLUS (₹79/mo or ₹799/yr)
[ ] Top-up packages:         200 credits ₹29, 450 credits ₹49, 1000 credits ₹99
[ ] Razorpay trigger:        POST /billing/subscribe  { plan, billingCycle }
[ ] After payment:           webhook on backend grants credits + updates plan
[ ] Current plan info:       GET /billing/current
[ ] Usage limits shown:      tasks remaining, schedules remaining this month

SETTINGS
─────────
[ ] Settings available:      list each one
[ ] Each setting type:       dropdown / toggle / text input
[ ] API call per setting:    PATCH /auth/me  { field: value }

UI COMPONENTS INVENTORY
────────────────────────
[ ] Button variants:         primary, outline, ghost, danger, loading state, disabled state
[ ] Input variants:          default, with icon, with error, password (show/hide toggle)
[ ] Card:                    background, border, radius, padding values
[ ] Badge:                   colors per variant
[ ] Modal:                   how it opens/closes, backdrop tap behavior
[ ] Skeleton:                shimmer or pulse animation
```

---

## AFTER CHECKLIST 1 IS APPROVED — CREATE CHECKLIST 2

After I confirm Checklist 1, create **Checklist 2 — Implementation Plan**.

This is every single file you will create in `app/src/`, in the exact order you will create them. For each file write:
- Full file path
- One-line description of what it does
- Which frontend file(s) it is based on
- What it depends on (imports from)

Format:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHECKLIST 2 — IMPLEMENTATION PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PHASE 1 — Theme and Utilities (zero dependencies, build first)
──────────────────────────────────────────────────────────────
[ ] app/src/theme/colors.js
    What: TASKTIME color palette as JS object
    Based on: frontend/src/app/global.css
    Imports: nothing

[ ] app/src/theme/typography.js
    What: font sizes, font weights, line heights
    Based on: frontend/src/app/global.css
    Imports: nothing

[ ] app/src/theme/spacing.js
    What: spacing scale (xs/sm/md/lg/xl/xxl)
    Based on: general design system
    Imports: nothing

[ ] app/src/utils/constants.js
    What: API_BASE_URL, plan names, credit costs, recurrence types
    Based on: frontend/src/features/tasks/tasks.constants.js
    Imports: nothing

[ ] app/src/utils/storage.js
    What: MMKV wrapper for token storage (replaces HttpOnly cookies)
    Based on: frontend/src/context/AuthContext.jsx (token handling)
    Imports: react-native-mmkv
    ⚠ NOTE: web uses HttpOnly cookies, mobile must use MMKV

[ ] app/src/utils/date.js
    What: date formatting helpers (format to YYYY-MM-DD, display "Today", etc.)
    Based on: usage across all dashboard and schedule components
    Imports: date-fns

PHASE 2 — API Layer
────────────────────
[ ] app/src/api/client.js
    What: Axios instance with base URL + auth header + 401 refresh interceptor
    Based on: frontend/src/services/api.js
    Imports: axios, storage.js, constants.js
    ⚠ NOTE: web sends refresh token as cookie, mobile sends as req.body.refreshToken

[ ] app/src/api/auth.api.js
    What: login, signup, verifyOtp, forgotPassword, resetPassword, getMe, updateMe, logout
    Based on: frontend/src/services/auth.service.js
    Imports: client.js

[ ] app/src/api/task.api.js
    ...

[ ] app/src/api/category.api.js
    ...

[ ] app/src/api/schedule.api.js
    ...

[ ] app/src/api/calendar.api.js
    ...

[ ] app/src/api/dashboard.api.js
    ...

[ ] app/src/api/behavior.api.js
    ...

[ ] app/src/api/ai.api.js
    ...
    ⚠ NOTE: streaming is handled in useStream hook, not here

[ ] app/src/api/billing.api.js
    ...

PHASE 3 — State Management (Zustand stores)
─────────────────────────────────────────────
[ ] app/src/store/auth.store.js
    What: user object, isLoggedIn, setAuth(), logout(), updateUser()
    Based on: frontend/src/context/AuthContext.jsx
    Imports: zustand, storage.js

[ ] app/src/store/ui.store.js
    What: global loading state, toast messages
    Based on: frontend/src/context/ToastContext.jsx
    Imports: zustand

PHASE 4 — Navigation
──────────────────────
[ ] app/src/navigation/RootNavigator.js
    What: shows AuthNavigator or AppNavigator based on isLoggedIn
    Based on: frontend/src/features/auth/components/ProtectedRoute.jsx
    Imports: auth.store.js, AuthNavigator.js, AppNavigator.js

[ ] app/src/navigation/AuthNavigator.js
    What: Stack navigator — Login → Register → OtpVerification → ForgotPassword → ResetPassword
    Imports: react-navigation/native-stack

[ ] app/src/navigation/AppNavigator.js
    What: Bottom tab navigator — Dashboard | Tasks | Schedule | AI Chat | Profile
    Based on: frontend/src/config/dashboard-navigation.js
    Imports: react-navigation/bottom-tabs

PHASE 5 — Common UI Components
────────────────────────────────
[ ] app/src/components/common/Button.js
    Based on: frontend/src/components/ui/Button.jsx
    Variants: primary, outline, ghost, danger

[ ] app/src/components/common/Input.js
    Based on: frontend/src/components/ui/Input.jsx

[ ] app/src/components/common/Card.js
    Based on: frontend/src/components/ui/Card.jsx

[ ] app/src/components/common/Badge.js
    Based on: frontend/src/components/ui/Badge.jsx

[ ] app/src/components/common/Spinner.js
    Based on: frontend/src/components/ui/Spinner.jsx

[ ] app/src/components/common/EmptyState.js
    What: illustration + message for empty lists

[ ] app/src/components/common/ConfirmModal.js
    Based on: frontend/src/components/ui/ConfirmationModal.jsx

[ ] app/src/components/common/Toast.js
    Based on: frontend/src/context/ToastContext.jsx

PHASE 6 — Auth Screens
────────────────────────
[ ] app/src/screens/auth/LoginScreen.js
    Based on: frontend/src/features/auth/components/LoginForm.jsx

[ ] app/src/screens/auth/RegisterScreen.js
    Based on: frontend/src/features/auth/components/SignupForm.jsx

[ ] app/src/screens/auth/OtpScreen.js
    Based on: OTP verification flow from auth.actions.js

[ ] app/src/screens/auth/ForgotPasswordScreen.js
    Based on: frontend/src/features/auth/components/ForgotPasswordForm.jsx

[ ] app/src/screens/auth/ResetPasswordScreen.js
    Based on: frontend/src/features/auth/components/ResetPasswordForm.jsx

PHASE 7 — Dashboard Screens
──────────────────────────────
[ ] app/src/components/dashboard/StatCard.js
    Based on: frontend/src/app/(dashboard)/dashboard/_components/StatCard.jsx

[ ] app/src/components/dashboard/ScoreRing.js
    What: circular progress ring showing productivity score
    Imports: react-native-svg

[ ] app/src/components/dashboard/StreakBanner.js
    Based on: frontend/src/features/dashboard/components/StreaksDashboard.jsx

[ ] app/src/screens/dashboard/DashboardScreen.js
    Based on: frontend/src/features/dashboard/components/DashboardOverview.jsx

[ ] app/src/screens/dashboard/TodayScreen.js
    Based on: frontend/src/features/dashboard/components/TodayDashboard.jsx

[ ] app/src/screens/dashboard/WeeklyScreen.js
    Based on: frontend/src/features/dashboard/components/WeeklyDashboard.jsx

[ ] app/src/screens/dashboard/MonthlyScreen.js
    Based on: frontend/src/features/dashboard/components/MonthlyDashboard.jsx

[ ] app/src/screens/dashboard/StreaksScreen.js
    Based on: frontend/src/features/dashboard/components/StreaksDashboard.jsx

[ ] app/src/screens/dashboard/PerformanceScreen.js
    Based on: frontend/src/app/(dashboard)/dashboard/performance/page.jsx
    Imports: react-native-chart-kit or victory-native for charts

PHASE 8 — Task Screens
────────────────────────
[ ] app/src/components/tasks/TaskCard.js
    Based on: frontend/src/components/dashboard/UniversalTaskCard.jsx

[ ] app/src/components/tasks/PriorityBadge.js
    Based on: frontend/src/components/ui/Badge.jsx (priority variant)

[ ] app/src/screens/tasks/TasksScreen.js
    Based on: frontend/src/app/(dashboard)/dashboard/tasks/page.jsx

[ ] app/src/screens/tasks/CreateTaskScreen.js
    Based on: frontend/src/app/(dashboard)/dashboard/tasks/TaskModal.jsx

[ ] app/src/screens/tasks/TaskDetailScreen.js
    Based on: frontend/src/components/dashboard/TaskDetailDrawer.jsx

PHASE 9 — Schedule Screens
────────────────────────────
[ ] app/src/components/schedule/ScheduleCard.js
    Based on: schedule display from schedule/page.jsx

[ ] app/src/screens/schedule/ScheduleScreen.js
    Based on: frontend/src/app/(dashboard)/dashboard/schedule/page.jsx

[ ] app/src/screens/schedule/CreateScheduleScreen.js
    Based on: frontend/src/app/(dashboard)/dashboard/schedule/ScheduleModal.jsx

[ ] app/src/screens/schedule/CalendarScreen.js
    Based on: frontend/src/app/(dashboard)/dashboard/calendar/page.jsx

PHASE 10 — AI Chat Screens
────────────────────────────
[ ] app/src/hooks/useStream.js
    What: handles SSE streaming for AI chat responses
    Based on: frontend/src/features/ai/useAi.js (streaming logic)
    ⚠ NOTE: browser EventSource does NOT exist in React Native
    Use: XMLHttpRequest with onprogress OR install react-native-sse package
    The stream endpoint is: POST /ai/conversations/:id/stream

[ ] app/src/components/ai/ChatBubble.js
    Based on: frontend/src/components/ai/MessageBubble.jsx
    + frontend/src/components/ai/StreamingMessage.jsx

[ ] app/src/components/ai/ModelSelector.js
    Based on: frontend/src/components/ai/ModelCard.jsx
    + frontend/src/components/ai/ModelBadge.jsx

[ ] app/src/components/ai/CreditDisplay.js
    Based on: frontend/src/components/ai/CreditBadge.jsx

[ ] app/src/screens/ai/ConversationsScreen.js
    Based on: frontend/src/app/(ai)/dashboard/ai/page.jsx
    + frontend/src/components/ai/AiSidebar.jsx

[ ] app/src/screens/ai/ChatScreen.js
    Based on: frontend/src/app/(ai)/dashboard/ai/c/[id]/page.jsx
    + frontend/src/components/ai/ChatWindow.jsx
    + frontend/src/components/ai/ChatInput.jsx

PHASE 11 — Behavior Screen
────────────────────────────
[ ] app/src/screens/behavior/BehaviorScreen.js
    Based on: frontend/src/app/(dashboard)/dashboard/behavior/page.jsx
    + frontend/src/components/dashboard/BehaviorLogModal.jsx

PHASE 12 — Profile and Billing Screens
────────────────────────────────────────
[ ] app/src/screens/profile/ProfileScreen.js
    Based on: frontend/src/app/(dashboard)/dashboard/settings/page.jsx

[ ] app/src/screens/profile/BillingScreen.js
    Based on: frontend/src/app/(dashboard)/dashboard/billing/page.jsx
    Imports: react-native-razorpay
    ⚠ NOTE: web uses RazorpayScript (loads JS in browser), mobile uses native SDK
```

---

## CRITICAL RULES — NEVER FORGET THESE

Write these at the top of every session so you remember:

**1. No Expo.** Pure React Native CLI only.

**2. JavaScript only.** No TypeScript, no .ts files, no type annotations.

**3. Token storage.** The web frontend uses HttpOnly cookies. That does NOT work in React Native. Instead:
- Store `accessToken` in MMKV
- Store `refreshToken` in MMKV
- Attach `accessToken` as `Authorization: Bearer <token>` header on every API request
- Send `refreshToken` as `req.body.refreshToken` when calling the refresh endpoint

**4. One backend code change required.** In the backend refresh-token controller, add one line:
```js
const token = req.cookies?.refreshToken || req.body?.refreshToken;
```
This makes the refresh endpoint work for both web (cookie) and mobile (body).

**5. AI streaming.** The web uses browser `EventSource` or `ReadableStream`. These do NOT exist in React Native. For streaming AI responses on mobile, either:
- Install `react-native-sse` package and use it as an EventSource polyfill
- OR use `XMLHttpRequest` with `onprogress` callback to receive chunks

**6. Razorpay.** The web loads Razorpay via a `<script>` tag. On mobile install `react-native-razorpay` and use `RazorpayCheckout.open(options)`.

**7. No web APIs.** No `window`, no `document`, no `localStorage`, no `sessionStorage`, no `fetch` with `credentials: 'include'` (cookies). Everything must use React Native equivalents.

**8. Same backend API.** Every API endpoint URL is identical to what the web frontend calls. Only the auth delivery changes (header instead of cookie).

---

## HOW TO WORK — RULES FOR THIS TASK

- Read all frontend files FIRST. Do not skip any.
- Produce Checklist 1. Show it to me and WAIT for my approval.
- After I approve Checklist 1, produce Checklist 2. Show it to me and WAIT for my approval.
- After I approve Checklist 2, start coding phase by phase.
- Complete one full file at a time. Do not jump between files.
- After each file, tell me: "✅ Done: [filename]. Next: [next filename]. Should I continue?"
- If you are unsure about any UI detail, refer back to the specific frontend file — the answer is always there.
- Never assume. If the frontend does it a certain way, do it the same way on mobile.

---

Ready. Start with Step 1: read all the frontend files listed above and produce Checklist 1.
