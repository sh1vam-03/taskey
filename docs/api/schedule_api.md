# 🕒 Schedule API

Base URL: `/api/schedules`

## Middleware
- `authMiddleware`
- `usageLimit("SCHEDULE")`: Applied only to CREATE endpoint for FREE users.

---

## 1. Create Schedule
Time-block a task.
- **URL:** `/`
- **Method:** `POST`
- **Limit:** Free users max 30 schedules/month.
- **Body:**
  ```json
  {
    "taskId": "uuid",
    "scheduleDate": "2024-05-21",
    "startTime": "09:00",
    "endTime": "10:30",
    "recurrence": "NONE" // DAILY, WEEKLY, MONTHLY
  }
  ```

## 2. Get Schedules
- **URL:** `/`
- **Method:** `GET`
- **Query Params:** `from` (date), `to` (date)

## 3. Update Schedule
- **URL:** `/:id`
- **Method:** `PUT`

## 4. Delete Schedule
- **URL:** `/:id`
- **Method:** `DELETE`

---

## 🏁 Schedule Completion

### 1. Complete Schedule
- **URL:** `/:id/complete`
- **Method:** `POST`

### 2. Undo Complete
- **URL:** `/:id/complete`
- **Method:** `DELETE`

### 3. Bulk Complete
- **URL:** `/complete-bulk`
- **Method:** `POST`
- **Body:** `{ "scheduleIds": ["..."] }`
