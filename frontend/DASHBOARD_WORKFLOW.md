# 🚀 Frontend Dashboard Workflow

## Phase FD-1 – API Client Architecture
- [ ] Setup Axios instance with `withCredentials: true`
- [ ] Implement Response Interceptor for Global Error Handling
- [ ] Implement Silent Refresh Logic (401 -> /refresh-token -> retry)
- [ ] Ensure No LocalStorage for Tokens

## Phase FD-2 – Dashboard Layout & Structure
- [ ] Create `src/app/(dashboard)/layout.jsx`
- [ ] Implement Sidebar Component (Responsive)
- [ ] Implement Topbar Component (User Profile, Credits)
- [ ] Define Navigation Links (Overview, Tasks, Schedule, Behavior, AI, Billing)

## Phase FD-3 – Dashboard Overview (`/dashboard`)
- [ ] Integrate `GET /api/dashboard/overview`
- [ ] Integrate `GET /api/usage/me`
- [ ] Integrate `GET /api/auth/me` (Profile)
- [ ] Display Stats Cards (Tasks, Schedules, Behavior)
- [ ] Display Credit Balance & Plan Badge

## Phase FD-4 – Task Management (`/dashboard/tasks`)
- [x] Task List View (Pagination, Filtering)
- [x] Create Task Modal (Limit check for Free Plan)
- [x] Edit/Delete Task Actions
- [x] Task Completion Toggle
- [x] Integrate `GET`, `POST`, `PUT`, `DELETE` /api/tasks

## Phase FD-5 – Schedule Management (`/dashboard/schedule`)
- [x] Calendar View Integration
- [x] Create Schedule Modal (Recurrence support)
- [x] Schedule Completion/Undo
- [x] Integrate Schedule APIs

## Phase FD-6 – AI Assistant (`/dashboard/ai`)
- [x] Chat Interface (WebSocket/Polling or Revalidation)
- [x] Voice Input Component (Recorder)
- [x] Credit Cost Display (Pre-action check)
- [x] Integrate `POST /api/ai/conversations` & Messages

## Phase FD-7 – Billing & Plans (`/dashboard/billing`)
- [x] Pricing Table (Free vs Pro vs Pro Plus)
- [x] Upgrade Flow (Razorpay Integration)
- [x] Usage Progress Bars
- [x] Helper: Credit Cost Table

## Phase FD-8 – Global Error Handling & UX
- [ ] Toast Notification System
- [ ] Skeletons & Loading States
- [ ] 403 Permission Denied Screens
