# 🕒 Schedule API

Manage time-blocking and recurring schedules.

**Base URL:** `/api/schedules`

---

## 1. Create Schedule
Time-block a task.
- **Limit:** Free users max 30 schedules/month.

- **Method:** `POST`
- **URL:** `/`
- **Auth Required:** Yes

### Request Body
```json
{
  "taskId": "uuid",
  "scheduleDate": "2024-05-21",
  "startTime": "09:00",
  "endTime": "10:30",
  "recurrence": "NONE", // NONE, DAILY, WEEKLY, MONTHLY
  "repeatUntil": "2024-06-21", // Required if recurrence != NONE
  "repeatOnDays": [1, 3, 5] // Required if recurrence == WEEKLY (1=Mon)
}
```

### Success Response (201)
```json
{
  "success": true,
  "message": "Schedule created successfully",
  "data": {
    "id": 1,
    "date": "2024-05-21",
    "startTime": "09:00",
    "endTime": "10:30"
  }
}
```

---

## 2. Get Schedules
Retrieve schedules within a date range.

- **Method:** `GET`
- **URL:** `/`
- **Auth Required:** Yes

### Query Parameters
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `from` | Date | No | Start date (YYYY-MM-DD) |
| `to` | Date | No | End date (YYYY-MM-DD) |
| `taskId` | UUID | No | Filter by specific task |

---

## 3. Update Schedule
- **Method:** `PUT`
- **URL:** `/:id`
- **Auth Required:** Yes

### Request Body (Partial)
Updates times, dates, or recurrence settings.

---

## 4. Delete Schedule
- **Method:** `DELETE`
- **URL:** `/:id`
- **Auth Required:** Yes

---

# ✅ Schedule Completion API

**Base URL:** `/api/schedule-completion`

## 1. Complete Schedule
- **Method:** `POST`
- **URL:** `/:id/complete`

## 2. Undo Completion
- **Method:** `DELETE`
- **URL:** `/:id/complete`

## 3. Bulk Complete
- **Method:** `POST`
- **URL:** `/complete-bulk`
- **Body:** `{ "scheduleIds": [1, 2, 3] }`

## 4. History
- **Method:** `GET`
- **URL:** `/history`
