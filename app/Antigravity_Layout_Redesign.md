# Antigravity — TASKTIME App Layout Redesign
# Paste everything below into Antigravity

---

The current app layout needs a complete redesign. Do not write any code yet — read this entire document first, understand the new layout fully, then implement it.

---

## NEW APP LAYOUT OVERVIEW

```
┌─────────────────────────────────────┐
│  [📅 Calendar]        [👤 Profile]  │  ← Top bar (two icon buttons)
│                                     │
│                                     │
│         SCREEN CONTENT              │
│                                     │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  Tasks │ Schedule │ 🏠 │ Today │ AI │  ← Bottom navigation (5 tabs)
└─────────────────────────────────────┘
```

---

## BOTTOM NAVIGATION — 5 TABS

The bottom navigation has exactly 5 items in this order:

```
[ Tasks ]  [ Schedule ]  [ 🏠 Home ]  [ Today ]  [ AI ]
```

- **Home** is the center tab — slightly larger icon, always highlighted as the main tab
- All 5 tabs are always visible
- No other pages in the bottom nav
- Pages that are NOT in the bottom nav (Calendar, Billing, Settings, Profile) are accessed differently — explained below

---

## TAB 1 — TASKS

Show exactly the same data and functionality as the Tasks page on the web frontend.

Read these web files to understand what to show:
- `frontend/src/app/(dashboard)/dashboard/tasks/page.jsx`
- `frontend/src/app/(dashboard)/dashboard/tasks/TaskModal.jsx`
- `frontend/src/components/dashboard/TaskItem.jsx`
- `frontend/src/components/dashboard/TaskList.jsx`
- `frontend/src/components/dashboard/UniversalTaskCard.jsx`
- `frontend/src/components/dashboard/TaskDetailDrawer.jsx`
- `frontend/src/features/tasks/useTasks.js`
- `frontend/src/features/tasks/tasks.actions.js`
- `frontend/src/services/task.service.js`

**What to show:**
- Search bar at top
- Filter chips: ALL | HIGH | MEDIUM | LOW priority
- List of task cards (title, priority badge, category, due date if set, completion checkbox)
- Swipe left on a task card → delete with confirmation
- Tap a task card → open task detail bottom sheet
- FAB (floating action button) bottom right → open Create Task modal
- Empty state when no tasks exist

**Create Task modal / bottom sheet contains:**
- Title input (required)
- Description textarea (optional)
- Priority selector: LOW / MEDIUM / HIGH chips
- Due date picker (optional — date only)
- Category selector (loads from GET /categories)
- Save button

---

## TAB 2 — SCHEDULE

Show exactly the same data and functionality as the Schedule page on the web frontend.

Read these web files:
- `frontend/src/app/(dashboard)/dashboard/schedule/page.jsx`
- `frontend/src/app/(dashboard)/dashboard/schedule/ScheduleModal.jsx`
- `frontend/src/services/schedule.service.js`

**What to show:**
- List of upcoming schedule blocks
- Each schedule card: task name, time range (e.g. 7:00 AM – 8:00 AM), date, recurrence badge (DAILY / WEEKLY / MONTHLY if recurring)
- Check button on each card to mark it as done for today
- Swipe left → delete with confirmation
- FAB bottom right → open Create Schedule modal

**Create Schedule modal contains:**
- Task picker — searchable list of tasks that have NO due date (dueDate = null only)
- Date picker
- Start time picker
- End time picker
- Recurrence selector: NONE / DAILY / WEEKLY / MONTHLY
- If WEEKLY is selected → show day-of-week checkboxes (Mon Tue Wed Thu Fri Sat Sun)
- Repeat until date (optional, only shown when recurrence is not NONE)
- Save button
- If API returns 409 conflict → show error: "This time slot conflicts with an existing schedule"

---

## TAB 3 — HOME (Center tab, main screen)

This is the most important screen. It combines data from FOUR web pages into one scrollable screen:
1. Overview / Dashboard page
2. Streaks page
3. Behavior score / Behavior log page
4. Performance page

Read all these web files to understand what each section contains:
- `frontend/src/features/dashboard/components/DashboardOverview.jsx`
- `frontend/src/features/dashboard/components/OverviewCards.jsx`
- `frontend/src/features/dashboard/components/StreaksDashboard.jsx`
- `frontend/src/features/dashboard/components/TodayDashboard.jsx`
- `frontend/src/app/(dashboard)/dashboard/page.jsx`
- `frontend/src/app/(dashboard)/dashboard/streaks/page.jsx`
- `frontend/src/app/(dashboard)/dashboard/behavior/page.jsx`
- `frontend/src/app/(dashboard)/dashboard/performance/page.jsx`
- `frontend/src/components/dashboard/BehaviorLogModal.jsx`
- `frontend/src/components/dashboard/charts/PerformanceChart.jsx`
- `frontend/src/features/dashboard/useDashboard.js`
- `frontend/src/features/dashboard/useStreaks.js`

**Home screen layout — scroll top to bottom:**

```
┌──────────────────────────────────┐
│  Good morning, {name} 👋         │  ← greeting header
│  {date}                          │
├──────────────────────────────────┤
│                                  │
│   SECTION 1 — OVERVIEW           │
│   (same data as web overview)    │
│   Score ring + quick stat cards  │
│                                  │
├──────────────────────────────────┤
│                                  │
│   SECTION 2 — STREAKS            │
│   (same data as web streaks)     │
│   Current streak, best streak,   │
│   streak calendar/history        │
│                                  │
├──────────────────────────────────┤
│                                  │
│   SECTION 3 — BEHAVIOR SCORE     │
│   (same data as web behavior)    │
│   Today's mood + sleep + exercise│
│   Log behavior button            │
│   Last 7 days behavior history   │
│                                  │
├──────────────────────────────────┤
│                                  │
│   SECTION 4 — PERFORMANCE        │
│   (same data as web performance) │
│   Productivity score chart       │
│   over last 7/30 days            │
│                                  │
└──────────────────────────────────┘
```

Each section has a clear section header with title. Sections are separated by a divider or spacing. The whole screen is one ScrollView — user scrolls through all four sections.

**Behavior Log interaction:**
- Section 3 shows today's logged behavior if it exists
- If today's behavior is not logged yet → show a "Log Today's Behavior" button
- Tapping it opens a bottom sheet / modal with:
  - Mood selector: 😊 HAPPY  😐 NEUTRAL  😔 SAD (tap to select, selected = cyan highlighted)
  - Sleep hours: slider from 0 to 12 (shows value like "7 hrs")
  - Exercise toggle: Did you exercise today? YES / NO
  - Notes: optional text input
  - Save button → POST /behavior

---

## TAB 4 — TODAY

Show exactly the same data as the Today page on the web frontend.

Read these web files:
- `frontend/src/app/(dashboard)/dashboard/today/page.jsx`
- `frontend/src/features/dashboard/components/TodayDashboard.jsx`
- `frontend/src/features/dashboard/useTodayDashboard.js`

**What to show:**
- Today's date as a header
- All tasks scheduled for today in time order
- Each item shows: task name, time block (start – end), completion status
- Tap item → mark as complete
- Summary stats at top: total today, completed, remaining
- Pull to refresh

---

## TAB 5 — AI

Show the full AI chat experience — both the conversation list and the chat window.

Read these web files:
- `frontend/src/app/(ai)/dashboard/ai/page.jsx`
- `frontend/src/app/(ai)/dashboard/ai/c/[id]/page.jsx`
- `frontend/src/components/ai/AiSidebar.jsx`
- `frontend/src/components/ai/ChatWindow.jsx`
- `frontend/src/components/ai/ChatInput.jsx`
- `frontend/src/components/ai/MessageBubble.jsx`
- `frontend/src/components/ai/StreamingMessage.jsx`
- `frontend/src/components/ai/AiSettingsPanel.jsx`
- `frontend/src/components/ai/ModelCard.jsx`
- `frontend/src/components/ai/CreditBadge.jsx`
- `frontend/src/components/ai/VoiceRecorder.jsx`
- `frontend/src/components/ai/VoicePlayer.jsx`
- `frontend/src/features/ai/useAi.js`
- `frontend/src/features/ai/ai.services.js`
- `frontend/src/context/AiContext.js`

**AI tab layout:**

When user is on the AI tab they see the conversation list:
- "+ New Chat" button at top right
- List of past conversations (title, last message preview, date, model name badge)
- Tap a conversation → opens Chat Screen (navigates to it as a stack screen ON TOP of the tab, not a new tab)
- Swipe left on conversation → delete with confirmation

**Chat Screen (stack screen, not a tab):**
- Back button top left → returns to conversation list
- Model name + credit balance shown in top bar
- FlatList of chat bubbles
  - User messages: right aligned, cyan background
  - AI messages: left aligned, dark card background, renders markdown
  - While streaming: show animated typing cursor at end of last AI bubble
- Bottom input bar:
  - Text input
  - Voice button (microphone icon) — tap to record, tap again to stop and send
  - Send button
  - Model selector icon — tap to open bottom sheet with available AI models
- Credit badge shows remaining credits

**AI Streaming — CRITICAL:**
React Native does not have `EventSource` or browser `ReadableStream`.
Use `react-native-sse` package for Server-Sent Events, OR use `XMLHttpRequest` with `onprogress`.
The stream endpoint is: `POST /ai/conversations/:id/stream`

---

## TOP BAR — LEFT SIDE — CALENDAR ICON

Every screen (all 5 tabs) has a top app bar. On the **left side** of the top bar there is a **calendar icon button**.

```
[ 📅 ]                              [ 👤 ]
```

When the user taps the calendar icon:
- A new screen slides in (stack navigation) — OR a full-screen modal opens
- This screen is called **CalendarScreen**
- At the top of CalendarScreen there are 3 tab buttons: **Daily | Weekly | Monthly**

Read these web files to understand each calendar view:
- `frontend/src/app/(dashboard)/dashboard/calendar/page.jsx`
- `frontend/src/app/(dashboard)/dashboard/today/page.jsx`
- `frontend/src/app/(dashboard)/dashboard/weekly/page.jsx`
- `frontend/src/app/(dashboard)/dashboard/monthly/page.jsx`
- `frontend/src/services/calendar.service.js`
- `frontend/src/app/(dashboard)/dashboard/_components/CalendarGrid.jsx`

**CalendarScreen layout:**

```
┌──────────────────────────────────┐
│  ← Back        Calendar          │
├──────────────────────────────────┤
│  [ Daily ]  [ Weekly ]  [Monthly]│  ← 3 tab buttons
├──────────────────────────────────┤
│                                  │
│   Calendar view for selected tab │
│   (same data as web)             │
│                                  │
└──────────────────────────────────┘
```

- **Daily tab**: shows a day-by-day view with all schedule blocks for that day. User can navigate day by day with left/right arrows.
- **Weekly tab**: shows a week view. Same data as web weekly page.
- **Monthly tab**: shows a month grid. Same data as web monthly page. Dots or indicators on days that have schedules.

API calls to use:
- `GET /calendar/range?from=YYYY-MM-DD&to=YYYY-MM-DD` for weekly and monthly
- `GET /calendar/day/:date` for daily view

---

## TOP BAR — RIGHT SIDE — PROFILE ICON

On the **right side** of the top bar (on every screen / all 5 tabs) there is a **profile icon button** — like Google Play Store style.

Show the user's avatar (first letter of name in a colored circle) or a generic person icon.

When the user taps the profile icon:
- A **bottom sheet slides up** (or a modal) — called the **Profile Panel**

**Profile Panel contains — in this exact order:**

```
┌──────────────────────────────────┐
│                                  │
│   ● [Avatar]  {User Name}        │
│               {email}            │
│               [PRO] plan badge   │
│                                  │
├──────────────────────────────────┤
│                                  │
│   💳  Billing & Usage      →     │
│                                  │
├──────────────────────────────────┤
│                                  │
│   ⚙️  Settings              →     │
│                                  │
├──────────────────────────────────┤
│                                  │
│   🚪  Logout                     │
│                                  │
├──────────────────────────────────┤
│                                  │
│   App Version 1.0.0              │  ← small muted text at bottom
│                                  │
└──────────────────────────────────┘
```

Tapping **Billing & Usage** → opens BillingScreen as a stack screen
Tapping **Settings** → opens SettingsScreen as a stack screen
Tapping **Logout** → show confirmation dialog → on confirm: clear MMKV tokens → navigate to Login

---

## BILLING & USAGE SCREEN (stack screen, opened from profile panel)

Read these web files:
- `frontend/src/app/(dashboard)/dashboard/billing/page.jsx`
- `frontend/src/services/billing.service.js`
- `frontend/src/services/usage.service.js`
- `frontend/src/components/ui/UpgradeModal.jsx`

**What to show:**
- Current plan card at top (shows plan name, credits remaining, renewal date)
- Usage meters: tasks this month (X / 200 used), schedules this month (X / 50 used) — bars with percentage
- Plan comparison cards: FREE | PRO (₹29/mo) | PRO_PLUS (₹79/mo)
  - Monthly / Yearly toggle (yearly shows discounted price)
  - Currently active plan is highlighted
  - Upgrade button on non-active plans
- Credit top-up section:
  - 3 packages: 200 credits (₹29) | 450 credits (₹49) | 1000 credits (₹99)
  - Buy button on each → triggers Razorpay
- Razorpay on mobile: use `react-native-razorpay` package, call `RazorpayCheckout.open(options)`

---

## SETTINGS SCREEN (stack screen, opened from profile panel)

Read this web file:
- `frontend/src/app/(dashboard)/dashboard/settings/page.jsx`

**What to show — all the same settings as web:**
- AI model preference (chat model selector)
- Voice model preferences (TTS + STT selectors)
- Sarvam speaker voice (if Sarvam TTS selected)
- Language setting
- Timezone
- Any notification preferences if they exist
- Each setting saved via: `PATCH /auth/me  { fieldName: value }`

---

## NAVIGATION ARCHITECTURE (how all screens connect)

```
RootNavigator
├── AuthStack (if not logged in)
│   ├── LoginScreen
│   ├── RegisterScreen
│   ├── OtpScreen
│   ├── ForgotPasswordScreen
│   └── ResetPasswordScreen
│
└── MainStack (if logged in)
    ├── BottomTabNavigator  ← the 5 tabs
    │   ├── Tab: Tasks      → TasksScreen
    │   │                      (+ CreateTaskScreen as modal)
    │   │                      (+ TaskDetailScreen as modal)
    │   ├── Tab: Schedule   → ScheduleScreen
    │   │                      (+ CreateScheduleScreen as modal)
    │   ├── Tab: Home       → HomeScreen (Overview+Streaks+Behavior+Performance)
    │   ├── Tab: Today      → TodayScreen
    │   └── Tab: AI         → ConversationsScreen
    │                          (+ ChatScreen as stack)
    │
    ├── CalendarScreen      ← opened from top bar left icon
    │   (with Daily/Weekly/Monthly internal tabs)
    │
    ├── BillingScreen       ← opened from profile panel
    └── SettingsScreen      ← opened from profile panel
```

The `MainStack` wraps the `BottomTabNavigator` so that CalendarScreen, BillingScreen, SettingsScreen, and ChatScreen can slide in on top of the tabs without replacing the tab bar.

---

## HEADER / TOP BAR COMPONENT

Create a reusable `AppHeader` component that is used on all 5 tab screens.

```
AppHeader props:
- title (string) — screen title shown in center
- showCalendar (bool, default true) — show calendar icon on left
- showProfile (bool, default true) — show profile icon on right
```

```
┌──────────────────────────────────┐
│  [📅]      TASKTIME       [👤]   │
└──────────────────────────────────┘
```

The TASKTIME wordmark or the screen name goes in the center.
Calendar icon on the left, profile avatar on the right.

---

## DESIGN RULES

- **Background**: deep black (#0a0a0a or read exact value from `frontend/src/app/global.css`)
- **Cards / surfaces**: slightly lighter (#111111 or similar — read from global.css)
- **Accent color**: TASKTIME cyan (read exact hex from global.css)
- **Text primary**: white
- **Text secondary / muted**: gray (~#888)
- **Borders**: dark (#1e1e1e or similar)
- **Priority HIGH**: red
- **Priority MEDIUM**: orange/amber  
- **Priority LOW**: green
- **Bottom tab bar**: same dark background as app, active tab icon in cyan, inactive in gray
- **Tap animations**: use `react-native-reanimated` for smooth press feedback
- Read `frontend/src/app/global.css` and `frontend/src/components/ui/` files to match the exact design system

---

## FILES TO CREATE OR MODIFY

After reading all the frontend files, update or create these files in `app/src/`:

**Navigation:**
- `app/src/navigation/RootNavigator.js` — AuthStack vs MainStack
- `app/src/navigation/AuthNavigator.js` — login/register/otp stack
- `app/src/navigation/MainNavigator.js` — MainStack containing tabs + Calendar + Billing + Settings
- `app/src/navigation/TabNavigator.js` — the 5-tab bottom navigator

**Top bar:**
- `app/src/components/common/AppHeader.js` — reusable header with calendar + profile icons
- `app/src/components/common/ProfilePanel.js` — bottom sheet that opens from profile icon

**Screens (new or redesigned):**
- `app/src/screens/home/HomeScreen.js` — Overview + Streaks + Behavior + Performance all in one scroll
- `app/src/screens/home/sections/OverviewSection.js`
- `app/src/screens/home/sections/StreaksSection.js`
- `app/src/screens/home/sections/BehaviorSection.js`
- `app/src/screens/home/sections/PerformanceSection.js`
- `app/src/screens/calendar/CalendarScreen.js` — with Daily/Weekly/Monthly tabs
- `app/src/screens/billing/BillingScreen.js`
- `app/src/screens/settings/SettingsScreen.js`
- `app/src/screens/tasks/TasksScreen.js`
- `app/src/screens/schedule/ScheduleScreen.js`
- `app/src/screens/today/TodayScreen.js`
- `app/src/screens/ai/ConversationsScreen.js`
- `app/src/screens/ai/ChatScreen.js`

---

## HOW TO PROCEED

1. Read ALL the frontend files mentioned in this document for each screen
2. Show me a quick summary of what you found in each section (confirm you understood what each page shows and what APIs it calls)
3. Wait for my approval
4. Then implement screen by screen in the order listed above, starting with:
   - Theme files (colors from global.css)
   - AppHeader component
   - Navigation structure
   - TabNavigator with 5 tabs
   - HomeScreen (most important)
   - Then the remaining screens one by one

After finishing each file: tell me "✅ Done: [filename] — ready for next?"
Do not jump ahead. One file at a time.
