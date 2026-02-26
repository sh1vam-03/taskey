# Dashboard Information Architecture

## Design Philosophy
"Calm, Focused, AI-First."
The dashboard is not a data dump; it is a cockpit.

## 1. Structure & Layout
**File:** `src/app/(dashboard)/layout.jsx`
- **Sidebar (Left):** Fixed width `240px`. Dark subtle background.
    - Navigation: Dashboard, Schedule, Tasks, AI Console.
    - User Profile at bottom.
- **Main Content (Right):** Flex-grow.
    - Max-width `1200px` centered.
    - Padding `2rem`.

## 2. Core Pages

### A. Dashboard Home (`/dashboard`)
**API:** `/api/dashboard/overview`, `/api/dashboard/today`
**Sections:**
1.  **Greeting Context:** "Good morning. You have 3 high-priority tasks."
2.  **Focus Area (Left 2/3):**
    - **AI Input:** "Ask Taskey to plan your day..."
    - **Today's Plan:** Merged view of Schedule + Tasks.
3.  **Insights Panel (Right 1/3):**
    - **Streaks:** Current consistency streak.
    - **Efficiency:** Small chart (mocked initially if needed, or simple CSS bar).

### B. Task Management (`/dashboard/tasks`)
**API:** `/api/task`
- List View (Cards).
- Status Toggles (Todo / Done).
- "Add Task" Modal.

### C. Schedule (`/dashboard/schedule`)
**API:** `/api/schedule`
- Time-blocking view.
- Vertical timeline.

### D. AI Console (`/dashboard/ai`)
**API:** `/api/ai/conversations`
- Full-screen chat interface.
- History sidebar.

## 3. Data Strategy
**No external libraries (SWR/React Query) as per strict constraints.**
- **Pattern:** `useEffect` + `fetch` in Client Components.
- **State:** Local `useState` for page-level data.
- **Loading:** Skeleton UI components (Shimmer).
- **Global State:** AuthContext (existing) for user data.

## 4. Component Hierarchy
- `components/dashboard/`
    - `Sidebar.jsx`
    - `TopBar.jsx` (Mobile only or Global Search)
    - `DashboardShell.jsx` (Layout wrapper)
    - `StatCard.jsx`
    - `TaskItem.jsx`
    - `AiCommandInput.jsx`
    - `SkeletonLoader.jsx`

## 5. Visual Language
- **Background:** `#000000` (Black)
- **Surfaces:** `#0A0A0A` (Dark Gray)
- **Accents:** Cyan (AI), Purple (Tasks)
- **Typography:** Inter (Clean, legible)

## 6. Next Steps (Phase D-3)
1.  Create `Sidebar.jsx`
2.  Create `layout.jsx`
3.  Implement Responsive wrapper.
