# Dashboard API Map

## Base URL
All routes are prefixed with: `http://localhost:3001/api` (Development)

## 1. Dashboard Core (Analytics & Overview)
**Base:** `/api/dashboard`

| Method | Endpoint | Description | UI Feature |
|dist|---|---|---|
| GET | `/overview` | General stats (tasks completed, etc.) | Top Context Area / Header Stats |
| GET | `/today` | Today's specific data | "Today's Focus" Section |
| GET | `/weekly` | Weekly summary | Weekly Review Panel |
| GET | `/monthly` | Monthly summary | Monthly Insights |
| GET | `/streaks` | Current streak info | Secondary Panel / Gamification |
| GET | `/performance/daily` | Daily efficiency graph | Insights Panel (Charts) |
| GET | `/performance/weekly` | Weekly trend graph | Insights Panel (Charts) |

## 2. Task Management
**Base:** `/api/task`

| Method | Endpoint | Description | UI Feature |
|---|---|---|---|
| GET | `/` | List all tasks | Main Workspace / Task List |
| POST | `/` | Create new task | "Add Task" / AI Quick Action |
| GET | `/:id` | Get single task details | Task Detail Modal |
| PUT | `/:id` | Update task (status, title) | Task List Actions (Check/Edit) |
| DELETE | `/:id` | Remove task | Task List Actions (Delete) |

## 3. Schedule / Calendar
**Base:** `/api/schedule`

| Method | Endpoint | Description | UI Feature |
|---|---|---|---|
| GET | `/` | List schedule items | Main Workspace / Calendar View |
| POST | `/` | Create schedule block | "Block Time" / AI Automation |
| PUT | `/:id` | Update schedule item | Calendar Interaction (Drag/Drop) |
| DELETE | `/:id` | Remove schedule item | Calendar Interaction (Delete) |

## 4. AI Intelligence (The Core)
**Base:** `/api/ai`

| Method | Endpoint | Description | UI Feature |
|---|---|---|---|
| POST | `/conversations` | Start new context | AI Command Center / New Chat |
| GET | `/conversations` | List past contexts | Sidebar / History |
| GET | `/conversations/:id/messages` | Get message history | AI Chat Interface |
| POST | `/conversations/:id/message` | Send text command | AI Command Input |
| POST | `/conversations/:id/voice` | Send voice command | Voice Input / Microphone |

## 5. Metadata
- **Auth:** All routes require `Authorization: Bearer <token>`
- **Response Format:** Standard JSON `{ success: true, data: ... }`
