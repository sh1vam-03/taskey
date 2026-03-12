# Antigravity — HomeScreen Implementation Plan
# Paste everything below into Antigravity

---

## WHAT THE HOME SCREEN IS

The Home screen is a single vertical ScrollView that combines four web pages into
one flowing screen. The user sees everything in one place without switching tabs.

The four sections in order, top to bottom:
1. Overview        — from frontend/src/features/dashboard/components/DashboardOverview.jsx
2. Streaks         — from frontend/src/app/(dashboard)/dashboard/streaks/page.jsx
3. Behavior Score  — from frontend/src/app/(dashboard)/dashboard/behavior/page.jsx
4. Performance     — from frontend/src/app/(dashboard)/dashboard/performance/page.jsx

Read all of those files carefully before writing any code.

---

## BEFORE YOU CODE — READ THESE FILES FIRST

```
frontend/src/features/dashboard/components/DashboardOverview.jsx
frontend/src/features/dashboard/components/OverviewCards.jsx
frontend/src/features/dashboard/useDashboard.js
frontend/src/features/dashboard/dashboard.actions.js
frontend/src/services/dashboard.service.js
frontend/src/services/dashboard.services.js

frontend/src/app/(dashboard)/dashboard/streaks/page.jsx
frontend/src/features/dashboard/useStreaks.js

frontend/src/app/(dashboard)/dashboard/behavior/page.jsx
frontend/src/components/dashboard/BehaviorLogModal.jsx
frontend/src/services/behavior.service.js

frontend/src/app/(dashboard)/dashboard/performance/page.jsx
frontend/src/components/dashboard/charts/PerformanceChart.jsx
```

---

## API ENDPOINTS — EXACT URLS

All data comes from these endpoints. Copy them exactly.

```
Overview:
  GET /dashboard/overview?date=YYYY-MM-DD
  Returns: { today: { totalTasks, completedTasks, pendingTasks, missedTasks },
             streaks: { currentStreak, longestStreak },
             todayTasks, completedTasks, behaviorScore, currentStreak }

Streaks:
  GET /dashboard/streaks?date=YYYY-MM-DD
  Returns: { currentStreak, longestStreak, activeStreak }

  GET /dashboard/streak-calendar?date=YYYY-MM-DD
  Returns: { "YYYY-MM-DD": { completed, total, score, totalActivity } }

Behavior:
  GET /behavior/YYYY-MM-DD              — get log for a specific date
  GET /behavior/latest                  — get most recent log entry
  GET /behavior/summary?days=7          — get last N days summary + history array
  GET /behavior/explain/YYYY-MM-DD      — get AI explanation for a day's score
  POST /behavior                        — upsert (create or update) today's log
    body: { date, mood, sleepHours, exercise, notes }

Performance:
  GET /dashboard/performance/daily?date=YYYY-MM-DD
  Returns: { completionRate, totalCompleted, productivityScore,
             hourly: [ { time, total, completed, missed } ] }

  GET /dashboard/performance/weekly?date=YYYY-MM-DD
  Returns: { completionRate, totalCompleted, productivityScore,
             daily: [ { day, total, completed, missed } ] }

  GET /dashboard/performance/monthly?year=YYYY&month=M&date=YYYY-MM-DD
  Returns: { completionRate, totalCompleted, productivityScore,
             history: [ { date, total, completed, missed } ] }
```

---

## FILE STRUCTURE TO CREATE

```
app/src/screens/home/
├── HomeScreen.js                    ← main screen, one ScrollView, all 4 sections
├── sections/
│   ├── OverviewSection.js           ← Section 1
│   ├── StreaksSection.js            ← Section 2
│   ├── BehaviorSection.js           ← Section 3
│   └── PerformanceSection.js        ← Section 4
└── components/
    ├── StatCard.js                  ← reusable stat number card
    ├── SectionHeader.js             ← reusable section title divider
    ├── ScoreRing.js                 ← circular score ring (SVG)
    ├── HeatmapGrid.js               ← activity heatmap (streak calendar)
    ├── MilestoneBar.js              ← streak progress bar toward next goal
    ├── BehaviorLogSheet.js          ← bottom sheet for logging today's behavior
    ├── AreaChart.js                 ← line/area chart (use victory-native or react-native-svg charts)
    └── InsightCard.js               ← colored insight pill (positive/neutral/attention)

app/src/api/
├── dashboard.api.js                 ← all dashboard endpoints
└── behavior.api.js                  ← all behavior endpoints
```

---

## SECTION 1 — OVERVIEW

**Reference file:** `frontend/src/features/dashboard/components/OverviewCards.jsx`

**API call:**
```js
GET /dashboard/overview
// pass today's date: new Date().toLocaleDateString('en-CA')
```

**What to show:**

Greeting header at the very top of the screen:
```
Good morning, {user.name} 👋
{formatted date, e.g. "Sunday, March 8"}
```

Then 4 stat cards in a 2×2 grid:

| Card | Value from API | Icon | Accent color |
|------|---------------|------|--------------|
| Today Tasks | data.todayTasks | activity | cyan |
| Completed | data.completedTasks | check-square | green |
| Behavior Score | data.behaviorScore | brain | purple |
| Current Streak | data.currentStreak | fire | orange |

Each StatCard shows:
- Small uppercase label (e.g. "TODAY TASKS")
- Large bold number
- Icon in a tinted rounded square on the right
- Subtle glass card background

**Loading state:** show 4 skeleton cards (grey pulsing rectangles)
**Error state:** show a red card with "Failed to load" + Retry button

---

## SECTION 2 — STREAKS

**Reference file:** `frontend/src/app/(dashboard)/dashboard/streaks/page.jsx`

**API calls:**
```js
// Both called in parallel with Promise.all
GET /dashboard/streaks?date=YYYY-MM-DD
GET /dashboard/streak-calendar?date=YYYY-MM-DD
```

**What to show:**

**Sub-section 2a — Three streak cards in a row:**

| Card | Value | Icon | Style |
|------|-------|------|-------|
| Current Streak | streakData.currentStreak days | 🔥 fire | orange gradient bg, glow shadow |
| Best Streak | streakData.longestStreak days | 🏆 trophy | dark zinc bg |
| Active Streak | streakData.activeStreak | 📅 calendar-check | dark zinc bg |

Current Streak card has a pulsing fire icon watermark in the background (opacity 0.10).

**Sub-section 2b — Next Goal milestone bar:**

Logic (copy exactly from the web page's `getNextMilestone` function):
```js
const milestones = [7, 14, 30, 60, 90, 100, 365];
const next = milestones.find(m => m > currentStreak) || 365;
const progress = Math.min((currentStreak / next) * 100, 100);
const remaining = next - currentStreak;
```

Show:
- Title: "NEXT GOAL"
- "{next} Days" large text on left, "{remaining} days left" cyan text on right
- Progress bar: cyan → purple gradient, rounded, height 10px
- Caption: "Reach a {next}-day streak to unlock the next level."

**Sub-section 2c — Streak Habits / Insights:**

Logic (copy exactly from web page's `getInsights` function):
```js
// Iterate calendarData, count perfectCount where score===100 && total>0
// Find firstActiveIndex (first day with total > 0)
// consistency = Math.round((perfectCount / relevantData.length) * 100)
// if consistency >= 80 → "You are unstoppable! Extremely consistent."
// if consistency >= 50 → "Building good habits. Keep it up!"
// else → "Try to perform tasks at least 3 days a week."
// Also find bestDayIndex (day of week with most perfect days)
// → "You are most productive on {dayName}s."
```

Show each insight as a row: small cyan dot + text.

**Sub-section 2d — Activity Heatmap:**

Transform the streak-calendar API response:
```js
// calendar response is { "YYYY-MM-DD": { completed, total, score, totalActivity } }
const calendarArray = Object.entries(calendar).map(([date, status]) => ({
    date,
    count: Math.min(status.totalActivity || status.completed || 0, 4), // 0–4 scale
    score: status.score || 0,
    total: status.total || 0,
})).sort((a, b) => new Date(a.date) - new Date(b.date));
```

Render a grid of small squares (14×14px each, 2px gap):
- Count 0 → rgba(255,255,255,0.05) — nearly invisible
- Count 1 → rgba(0,212,255,0.20)   — dim cyan
- Count 2 → rgba(0,212,255,0.45)   — medium cyan
- Count 3 → rgba(0,212,255,0.70)   — bright cyan
- Count 4 → rgba(0,212,255,1.0)    — full cyan

Use a horizontal ScrollView so it doesn't break the layout.
Below the grid show a LESS → MORE legend row with 5 sample squares.

---

## SECTION 3 — BEHAVIOR SCORE

**Reference files:**
- `frontend/src/app/(dashboard)/dashboard/behavior/page.jsx`
- `frontend/src/components/dashboard/BehaviorLogModal.jsx`

**API calls on mount (all parallel):**
```js
const today = new Date().toLocaleDateString('en-CA');
Promise.all([
    GET /behavior/summary?days=7,
    GET /behavior/{today}          // today's log, may return null
    GET /behavior/explain/{today}  // AI explanation text
    GET /behavior/latest           // most recent log for pre-filling
])
```

**What to show:**

**Sub-section 3a — Score Ring + Explanation:**

Large circular ring showing today's behaviorScore (0–100):
- Ring color based on score:
  - score >= 80 → green
  - score >= 60 → cyan
  - score >= 40 → yellow
  - score < 40  → red
- Score number large in the center
- "Today's Score" small label below the number
- Below the ring: AI explanation text in a frosted card
  (from GET /behavior/explain/{today})

If today's log doesn't exist yet, score shows 0 and explanation says
"Log your activity to see your score."

**Sub-section 3b — Log / Update button:**

A full-width button below the ring:
- If today's log EXISTS → button says "Update Today's Activity" (outline variant)
- If today's log DOES NOT EXIST → button says "Log Today's Activity" (primary/cyan variant)

Tapping this button opens the BehaviorLogSheet (bottom sheet modal).

**Sub-section 3c — 7-day behavior chart:**

Period toggle: [ 7D ] [ 30D ] — changes which data is shown

Chart type: AreaChart with:
- x-axis: date
- y-axis: behaviorScore (0–100)
- one area line: cyan color with gradient fill under it
- Data from: summary.history array (each item has { date, behaviorScore })

**Sub-section 3d — Stats mini-cards (2 in a row):**

| Card | Value | Label | Color |
|------|-------|-------|-------|
| Sleep | dayDetails.sleepHours + " hrs" | SLEEP DURATION | purple top border |
| Exercise | "DONE" or "NO RECORD" | EXERCISE | cyan top border |

**Sub-section 3e — Day browser (5-day strip):**

A horizontal row of 5 day buttons showing a window of days centered on selectedDate.
Each button shows:
- Day abbreviation (Mon, Tue...)
- Day number (1, 2...)
- Selected day = cyan highlighted border

Prev (←) and Next (→) arrow buttons to move the window.
Cannot go past today.

Tapping a day fetches:
```js
GET /behavior/{dateStr}      // that day's log
GET /behavior/explain/{dateStr}  // that day's explanation
```
And updates the score ring and stats cards.

---

## BEHAVIOR LOG BOTTOM SHEET (BehaviorLogSheet.js)

**Reference:** `frontend/src/components/dashboard/BehaviorLogModal.jsx`

This opens from the "Log Today's Activity" button. It is a bottom sheet (slides up from
the bottom). Use `@gorhom/bottom-sheet` or a Modal with `animationType="slide"`.

**Fields inside the sheet:**

1. **Mood selector** — 3 buttons side by side:
   - 😊 HAPPY  → green tint when selected
   - 😐 NEUTRAL → yellow tint when selected
   - 😔 SAD    → red tint when selected
   - Selected state: colored background + border
   - Default: NEUTRAL

2. **Sleep hours input:**
   - Label: "HOURS OF SLEEP"
   - TextInput with keyboardType="decimal-pad"
   - Default: 7
   - Range: 0–24, step 0.5

3. **Exercise toggle button:**
   - Full width, toggles between states
   - Active state: cyan border + "✓ Did exercise"
   - Inactive state: grey + "Not today"

4. **Notes textarea (optional):**
   - Label: "NOTES"
   - multiline TextInput
   - Placeholder: "Anything important about today?"
   - minHeight: 80px

5. **Bottom action row:**
   - Cancel button (ghost) + Save Activity button (primary)

**On Save:**
```js
POST /behavior  {
    date: new Date().toLocaleDateString('en-CA'),
    mood,           // "HAPPY" | "NEUTRAL" | "SAD"
    sleepHours: Number(sleepHours),
    exercise,       // boolean
    notes
}
```

**Pre-fill logic:**
- If editing today's existing log → fill all fields from currentLog
- If no log today but latestLog exists → fill sleepHours and exercise from latestLog, reset mood to NEUTRAL, reset notes
- Otherwise → defaults (NEUTRAL, 7hrs, exercise false)

**Error handling:**
- 403 → show "Free plan limit reached. Upgrade to Pro."
- Other error → show "Failed to save. Please try again."

---

## SECTION 4 — PERFORMANCE

**Reference files:**
- `frontend/src/app/(dashboard)/dashboard/performance/page.jsx`
- `frontend/src/components/dashboard/charts/PerformanceChart.jsx`

**What to show:**

**Sub-section 4a — View toggle:**
Three buttons in a pill group: [ DAILY ] [ WEEKLY ] [ MONTHLY ]
Default: WEEKLY

**API calls per view:**
```js
const localDate = new Date().toLocaleDateString('en-CA');

if (view === 'daily')
    GET /dashboard/performance/daily?date={localDate}
    // chart data: data.hourly [ { time, total, completed, missed } ]

if (view === 'weekly')
    GET /dashboard/performance/weekly?date={localDate}
    // chart data: data.daily [ { day, total, completed, missed } ]

if (view === 'monthly')
    const d = new Date();
    GET /dashboard/performance/monthly?year={d.getFullYear()}&month={d.getMonth()+1}&date={localDate}
    // chart data: data.history [ { date, total, completed, missed } ]
```

Cache results per view — don't refetch if already loaded (use a `cache` object in state).

**Sub-section 4b — 3 key metric cards in a row:**

| Card | Value | Label | Accent |
|------|-------|-------|--------|
| Completion Rate | data.completionRate + "%" | COMPLETION RATE | cyan |
| Tasks Completed | data.totalCompleted | TASKS COMPLETED | purple |
| Productivity Score | data.productivityScore | PRODUCTIVITY SCORE | yellow |

Each card has a subtle background icon (FaChartPie/Bar/Line) at opacity 0.10.

**Sub-section 4c — Area chart:**

Use the same AreaChart component.
Three overlapping area lines:
- Assigned → purple (#8b5cf6)
- Completed → cyan (#06b6d4)
- Missed → red (#f43f5e)

Each with a gradient fill from color at 25% opacity down to transparent.

Show loading spinner while fetching.
Show "No data available for this cycle." if data array is empty.

**Sub-section 4d — AI Performance Insights:**

Logic (copy from web page's `getInsights` function):
```js
// completionRate >= 80 → positive: "Excellent Consistency!..."
// completionRate >= 50 → neutral: "Good momentum..."
// else → attention: "Focus needed..."
// productivityScore >= 80 → positive: "High Productivity Zone..."
// totalCompleted > 10 → neutral: "High Volume: You've crushed {n} tasks..."
```

Each insight is a colored card:
- positive → green bg/border
- attention → red bg/border
- neutral → blue bg/border

Show relevant icon on the left (chart line / chart bar / chart pie).

---

## HomeScreen.js — MASTER STRUCTURE

```js
export default function HomeScreen() {
    // Greet based on hour
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={cyan} />
                }
            >
                {/* Greeting */}
                <View style={styles.greetingRow}>
                    <Text style={styles.greetingText}>{greeting}, {user?.name} 👋</Text>
                    <Text style={styles.dateText}>{formattedDate}</Text>
                </View>

                <SectionHeader title="Overview" icon="view-dashboard" />
                <OverviewSection />

                <SectionHeader title="Streaks & Habits" icon="fire" />
                <StreaksSection />

                <SectionHeader title="Behavior Score" icon="brain" />
                <BehaviorSection />

                <SectionHeader title="Performance" icon="chart-line" />
                <PerformanceSection />

                {/* Bottom padding so last section clears the tab bar */}
                <View style={{ height: 120 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
```

Pull-to-refresh calls all four section refresh functions simultaneously via Promise.all.

---

## SectionHeader.js

```
Props: title (string), icon (MaterialCommunityIcons name)

Renders:
[ cyan icon ]  SECTION TITLE
───────────────────────────── (thin cyan line, 30% opacity)
```

Uppercase title, small cyan icon on left, full-width divider line below.

---

## StatCard.js

```
Props: label, value, icon (name), color (hex), bg (rgba)

Renders a glass card:
┌────────────────────────────┐
│  LABEL (small, muted)      │
│  VALUE (large, bold white) │  [ icon in tinted square ]
└────────────────────────────┘

Glass style: rgba(255,255,255,0.04) bg, 1px rgba(255,255,255,0.08) border
```

---

## ScoreRing.js (for Behavior section)

Use `react-native-svg` to draw a circular arc.
```
Props: score (0–100), size (default 160), strokeWidth (default 12)

Logic:
- Full circle circumference = 2 * Math.PI * radius
- arcLength = circumference * (score / 100)
- Use SVG <Circle> for background ring
- Use SVG <Circle> with strokeDasharray for the colored arc
- Animate the arc on mount with Animated.Value

Color based on score:
- >= 80 → #00cc88 (green)
- >= 60 → #00d4ff (cyan)
- >= 40 → #ffaa00 (yellow)
- <  40 → #ff4444 (red)
```

---

## AreaChart.js

Use `react-native-svg` or install `victory-native` for charts.

If using victory-native:
```
npm install victory-native
```

Props:
- data (array of objects)
- xKey (string — which field is the x axis)
- lines (array of { key, name, color })
- height (default 200)

Renders an area chart with:
- Semi-transparent gradient fill under each line
- No background grid lines (or very faint)
- X axis labels at bottom, small muted text
- Tooltip on press showing all values for that data point

---

## HeatmapGrid.js

```
Props: data (array of { date, count })

Renders inside a horizontal ScrollView:
- Each day = 14×14px View, 2px gap
- Color based on count (0–4 scale, cyan intensity)
- Organized in columns of 7 (week columns) like GitHub contribution graph

Below grid: LESS [ □ □ □ □ □ ] MORE legend
```

---

## DATA FLOW

Each section manages its own loading/error state independently.
They do NOT share a single loading state — each section can load and
show its skeleton independently, so the screen feels fast.

```
HomeScreen mounts
    ↓
All 4 sections start fetching simultaneously (no await between them)
    ↓
Each section shows skeleton → replaces with real data when ready
    ↓
Pull-to-refresh → calls all refresh() functions at once
```

---

## CHART LIBRARY DECISION

The web uses Recharts (browser only — cannot be used in React Native).

For React Native use one of:
- `victory-native` — easiest to set up, good API
- `react-native-chart-kit` — simpler but less control
- Raw `react-native-svg` — most control, most work

Recommended: **victory-native**
```
npm install victory-native
```

---

## DESIGN TOKENS (read exact values from frontend/src/app/global.css)

```
Background:      theme.bg         (deep black)
Surface/card:    theme.surface    (slightly lighter dark)
Accent:          theme.cyan       (#00d4ff)
Text:            theme.text       (white)
Text muted:      theme.textMuted  (#888)
Text dim:        theme.textDim    (#555)
Border:          theme.border     (#1e1e1e)
Error:           #ff4444
Success:         #00cc88
Warning:         #ffaa00
Orange (streak): #f97316
Purple (brain):  #a855f7
```

---

## BUILD ORDER

Build in this exact sequence to avoid missing dependencies:

```
1.  app/src/screens/home/components/SectionHeader.js
2.  app/src/screens/home/components/StatCard.js
3.  app/src/screens/home/components/ScoreRing.js
4.  app/src/screens/home/components/HeatmapGrid.js
5.  app/src/screens/home/components/MilestoneBar.js
6.  app/src/screens/home/components/AreaChart.js
7.  app/src/screens/home/components/InsightCard.js
8.  app/src/screens/home/components/BehaviorLogSheet.js
9.  app/src/api/dashboard.api.js
10. app/src/api/behavior.api.js
11. app/src/screens/home/sections/OverviewSection.js
12. app/src/screens/home/sections/StreaksSection.js
13. app/src/screens/home/sections/BehaviorSection.js
14. app/src/screens/home/sections/PerformanceSection.js
15. app/src/screens/home/HomeScreen.js
```

---

## RULES

- JavaScript only, no TypeScript
- No Expo — pure React Native CLI
- Read the frontend files listed above before writing each section
- Match the exact logic from the web (getNextMilestone, getInsights, calendar transform)
- Each section independently handles its own loading and error state
- Do not use Recharts — it is browser-only
- After each file: tell me done and wait for approval before next file
