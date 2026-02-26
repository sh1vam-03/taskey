# ✅ Task Completion API

**Base URL:** `/api/tasks`

## 1. Complete Task
- **Method:** `POST`
- **URL:** `/:id/complete`
- **Body:** `{ "date": "2024-05-20" }`

## 2. Undo Completion
- **Method:** `DELETE`
- **URL:** `/:id/completed`

## 3. Bulk Complete
- **Method:** `POST`
- **URL:** `/complete-bulk`

## 4. History
- **Method:** `GET`
- **URL:** `/:id/completed-history`
