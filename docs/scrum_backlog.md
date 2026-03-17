# 📋 Agile Scrum Backlog: Taskey
> **Project Phase:** Full Project Roadmap  
> **Sprint Duration:** 2 Weeks  
> **Methodology:** Scrum  
> **Tech Stack:** Next.js, Node.js (Express), PostgreSQL, Prisma, TailwindCSS.

---

## 👥 Team & Roles
| Name | Role | Responsibility |
|------|------|----------------|
| **Balaji (User)** | Full-Stack Developer | Backend Logic, Database (Prisma/PG), API Security, DevOps |
| **Atharv** | Project Lead, Frontend | Core UI Structure, Global State, Complex Components |
| **Hanumant** | AI Integration | Sarvam AI, Voice, Prompt Engineering |

---

## ✅ Definition of Done (DoD)
All tasks must meet these criteria before being marked as **DONE**:
1.  Code is reviewed and merged into the main branch.
2.  Feature is tested locally (Integration test).
3.  No critical bugs or linting errors.
4.  Documentation updated (if applicable).

---

## 🏃 Sprint 1: Foundation, Authentication & Security
**Goal:** Establish a secure foundation with role-based authentication and operational verify project structure.
**Status:** In Progress 🟡

### Epic 1: Infrastructure & Auth (Backend)

#### `TK-BE-001` Server & Database Initialization
- **Assignee:** Balaji (Backend)
- **Priority:** 🔴 High
- **Story Points:** 3
- **Status:** ✅ Done
- **Description:** Initialize the Node.js/Express server and configure the PostgreSQL connection via Prisma (using Adapter for v7 support).
- **Acceptance Criteria:**
    - [x] Server listens on port 5000.
    - [x] Prisma connects to local PostgreSQL instance successfully.
    - [x] Project structure matches standard MVC pattern.

#### `TK-BE-002` Authentication System (JWT)
- **Assignee:** Balaji (Backend)
- **Priority:** 🔴 High
- **Story Points:** 5
- **Status:** ✅ Done
- **Description:** Implement secure Signup, Login, and "Me" endpoints using JWT and bcrypt.
- **Acceptance Criteria:**
    - [x] `POST /signup` hashes password and creates user in Postgres.
    - [x] `POST /login` validates credentials and returns JWT.
    - [x] `GET /me` returns user profile only if valid Token is provided.

#### `TK-BE-003` Forgot Password Flow
- **Assignee:** Balaji (Backend)
- **Priority:** 🟠 Medium
- **Story Points:** 5
- **Status:** 🔵 To Do
- **Description:** Implement generic "Forgot Password" API using email tokens (NodeMailer).
- **Acceptance Criteria:**
    - [ ] `POST /forgot-password` generates token and simulates email sending.
    - [ ] `POST /reset-password` accepts token and updates `User.password` in Prisma.

### Epic 2: Frontend Foundation & Auth UI

#### `TK-FE-001` Next.js Project Setup & State
- **Assignee:** Atharv (FE-1)
- **Priority:** 🔴 High
- **Story Points:** 3
- **Status:** 🔵 To Do
- **Description:** Initialize the Next.js framework, install TailwindCSS, and set up the global `AuthContext`.
- **Acceptance Criteria:**
    - [ ] Next.js app runs on port 3000.
    - [ ] TailwindCSS is active.
    - [ ] `AuthContext` provides `user`, `login`, `logout` methods.

#### `TK-FE-002` Authentication Forms (UI)
- **Assignee:** Dinesh (FE-2)
- **Priority:** 🟠 Medium
- **Story Points:** 5
- **Status:** 🔵 To Do
- **Description:** Design responsive Login, Signup, and Forgot Pwd pages.
- **Acceptance Criteria:**
    - [ ] **Login:** Email/Password form with validation.
    - **Signup:** Name/Email/Password form.
    - Integration: Forms call `login()` / `signup()` from AuthContext.

---

## 🏃 Sprint 2: Core Task Management & Scheduler
**Goal:** Complete Task CRUD and Daily Schedule planning.
**Status:** ⚪ Planned

### Epic 3: Advanced Task Management (Backend)

#### `TK-BE-004` Task Model & Core CRUD
- **Assignee:** Balaji (Backend)
- **Priority:** 🔴 High
- **Story Points:** 5
- **Description:** Create `Task` model in Prisma and implement CRUD ops.
- **Acceptance Criteria:**
    - [ ] Prisma Model: `Title`, `Desc`, `Priority` (ENUM), `DueDate`, `Status`.
    - [ ] APIs: `POST`, `GET`, `PATCH`, `DELETE` /tasks implemented.
    - [ ] RLS: Users can only see their own tasks.

#### `TK-BE-005` Recurring & One-Time Tasks Logic
- **Assignee:** Balaji (Backend)
- **Priority:** 🟠 Medium
- **Story Points:** 8
- **Description:** Logic to handle tasks that repeat (Daily/Weekly).
- **Acceptance Criteria:**
    - [ ] Prisma Field `isRecurring` (Boolean) and `recurrencePattern` (String).
    - [ ] Cron job or midnight trigger that resets status for recurring tasks.

### Epic 4: Task Dashboard (Frontend)

#### `TK-FE-003` Dashboard Shell & Navigation
- **Assignee:** Dinesh (FE-2)
- **Priority:** 🟠 Medium
- **Story Points:** 3
- **Description:** Main layout wrapper. Sidebar, Navbar, Dark Mode toggle.
- **Acceptance Criteria:**
    - [ ] Sidebar links: Dashboard, Schedule, Analytics.
    - [ ] Responsive interaction (Hamburgermenu on mobile).

#### `TK-FE-004` Task Management UI
- **Assignee:** Atharv (FE-1)
- **Priority:** 🔴 High
- **Story Points:** 8
- **Description:** Main Dashboard View. Task Cards with priority colors.
- **Acceptance Criteria:**
    - [ ] List View of tasks.
    - [ ] "Add Task" Modal with Form.
    - [ ] "Mark Complete" checkbox updates DB instantly.

### Epic 5: Schedule Tracker

#### `TK-BE-006` Schedule & Time Slots API
- **Assignee:** Balaji (Backend)
- **Priority:** 🟠 Medium
- **Story Points:** 5
- **Description:** Models for Time Slots (e.g. 9:00-10:00 AM).
- **Acceptance Criteria:**
    - [ ] `ScheduleSlot` model linked to User.
    - [ ] Logic to detect "Missed" tasks if `endTime` < `Date.now()` and status is pending.

#### `TK-FE-005` Daily Planner Timeline View
- **Assignee:** Atharv (FE-1)
- **Priority:** 🔴 High
- **Story Points:** 8
- **Description:** Visual Timeline component for drag-and-drop planning.
- **Acceptance Criteria:**
    - [ ] Vertical timeline (9AM - 9PM).
    - [ ] Visual blocks represent tasks.
    - [ ] Red line indicating current time.

---

## 🏃 Sprint 3: Behavior Tracking & "Smart" Insights
**Goal:** Implement the Behavior Tracker and Data Analytics.
**Status:** ⚪ Planned

### Epic 6: Behavior Tracking

#### `TK-BE-007` Behavior Log Model & API
- **Assignee:** Balaji (Backend)
- **Priority:** 🟠 Medium
- **Story Points:** 5
- **Description:** Store daily behavior metrics in Postgres.
- **Acceptance Criteria:**
    - [ ] Schema: `Make Mood`, `Productivity` (Int), `Sleep` (Int), `Exercise` (Bool).
    - [ ] Constraint: Only 1 log per user per day.

#### `TK-FE-006` Behavior Check-in Widget
- **Assignee:** Dinesh (FE-2)
- **Priority:** 🟢 Low
- **Story Points:** 3
- **Description:** End-of-day popup asking "How was your day?".
- **Acceptance Criteria:**
    - [ ] Emoji selector for Mood.
    - [ ] Slider for Productivity.
    - [ ] Submit posts to API.

### Epic 7: Analytics Engine

#### `TK-BE-008` Insights Aggregation Pipeline
- **Assignee:** Balaji (Backend)
- **Priority:** 🔴 High
- **Story Points:** 8
- **Description:** Complex SQL/Prisma aggregations.
- **Acceptance Criteria:**
    - [ ] Query: `AVG(Productivity)` grouped by Day of Week.
    - [ ] Query: `Count(CompletedTasks)` vs `Mood`.

#### `TK-FE-007` Analytics Dashboard
- **Assignee:** Atharv (FE-1)
- **Priority:** 🔴 High
- **Story Points:** 8
- **Description:** Visualize data using Chart.js / Recharts.
- **Acceptance Criteria:**
    - [ ] Line Graph: Productivity over last 7 days.
    - [ ] Pie Chart: Task Categories.
    - [ ] Insight Text: "You are most productive on Mondays".

---

## 🏃 Sprint 4: Notifications & Polish
**Goal:** User Engagement features (Notifications, Streaks).
**Status:** ⚪ Planned

### Epic 8: Notification System

#### `TK-BE-009` Notification Service
- **Assignee:** Balaji (Backend)
- **Priority:** � Medium
- **Story Points:** 5
- **Description:** Background service for reminders.
- **Acceptance Criteria:**
    - [ ] Node-cron job runs every hour.
    - [ ] Checks for tasks due in < 1 hour.
    - [ ] mock-send Email or Log notification.

#### `TK-FE-008` In-App Notifications
- **Assignee:** Dinesh (FE-2)
- **Priority:** 🟢 Low
- **Story Points:** 3
- **Description:** Toast notifications.
- **Acceptance Criteria:**
    - [ ] Toast appears on Success/Error.
    - [ ] "Bell" icon with unread count.

### Epic 9: Gamification & Polish

#### `TK-BE-010` Streak System Logic
- **Assignee:** Balaji (Backend)
- **Priority:** 🟢 Low
- **Story Points:** 3
- **Description:** Streak counter.
- **Acceptance Criteria:**
    - [ ] `User.streak` increments on daily login + task completion.
    - [ ] Resets if day missed.

#### `TK-FE-009` UI Polish & Animations
- **Assignee:** Dinesh (FE-2)
- **Priority:** 🟢 Low
- **Story Points:** 5
- **Description:** Micro-interactions and polish.
- **Acceptance Criteria:**
    - [ ] Confetti animation on task completion.
    - [ ] Loading skeletons for data fetching.

---

## 🧊 Icebox / Future Features
- **Calendar Sync:** Google Calendar integration.
- **Team Collaboration:** Shared workspaces.
