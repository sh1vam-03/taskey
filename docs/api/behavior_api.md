# 🧠 Behavior API

**Base URL:** `/api/behavior`

The Behavior API allows users to log their daily mood, habits, and receiving productivity insights.

---

## 1. Upsert Behavior Log

Creates or updates the behavior log for a specific date. If no date is provided, it defaults to the current date.

- **URL:** `/`
- **Method:** `POST`
- **Auth Required:** Yes

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mood` | string | **Yes** | User's mood (e.g., "Happy", "Stressed", "Neutral"). |
| `date` | string (ISO Date) | No | Date for the log. Defaults to today. Future dates are generally not trusted for scores but allowed for logging. |
| `notes` | string | No | Optional notes or journal entry for the day. |
| `sleepHours` | number | No | Number of hours slept. |
| `exercise` | boolean | No | Whether the user exercised that day. |

**Example Request:**
```json
{
  "date": "2023-11-15T00:00:00Z",
  "mood": "Focused",
  "notes": "Had a great coding session today.",
  "sleepHours": 7.5,
  "exercise": true
}
```

### Success Response

- **Code:** `200 OK`

**Example Response:**
```json
{
  "success": true,
  "message": "Behavior log saved successfully",
  "data": {
    "id": "cm3...",
    "userId": "usr_123",
    "date": "2023-11-15T00:00:00.000Z",
    "mood": "Focused",
    "notes": "Had a great coding session today.",
    "sleepHours": 7.5,
    "exercise": true,
    "productivityScore": 0,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Error Responses
- `400 Bad Request`: Missing `mood`, invalid `date`, or future date violation.
- `401 Unauthorized`: User is not logged in.

---

## 2. Get Behavior By Date

Retrieve a specific behavior log for a given date, including the calculated productivity score.

- **URL:** `/:date`
- **Method:** `GET`
- **Auth Required:** Yes

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | string | ISO Date string or YYYY-MM-DD format. |

### Success Response

- **Code:** `200 OK`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "cm3...",
    "userId": "usr_123",
    "date": "2023-11-15T00:00:00.000Z",
    "mood": "Focused",
    "notes": "Had a great coding session today.",
    "sleepHours": 7.5,
    "exercise": true,
    "productivityScore": 85
  }
}
```

- **Note**: The `productivityScore` is dynamically calculated based on completed tasks, missed tasks, sleep, and exercise.

### Error Responses
- `400 Bad Request`: Invalid date format.
- `401 Unauthorized`: User is not logged in.

---

## 3. Get Behavior Summary

Get aggregated behavior statistics over a specified period (default last 7 days).

- **URL:** `/summary`
- **Method:** `GET`
- **Auth Required:** Yes

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `days` | number | `7` | Number of past days to include in the summary (max 90). |

### Success Response

- **Code:** `200 OK`

**Example Response:**
```json
{
  "success": true,
  "message": "Behavior summary fetched successfully",
  "data": {
    "avgProductivity": 78,
    "moodDistribution": {
      "Focused": 3,
      "Tired": 1,
      "Happy": 2
    },
    "daysLogged": 6
  }
}
```

### Error Responses
- `400 Bad Request`: `days` is out of valid range (1-90).
- `401 Unauthorized`: User is not logged in.

---

## 4. Explain Productivity Score

Get a detailed breakdown of why a specific score was assigned for a given date. Useful for showing the user what factors influenced their score.

- **URL:** `/explain/:date`
- **Method:** `GET`
- **Auth Required:** Yes

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | string | ISO Date string or YYYY-MM-DD format. |

### Success Response

- **Code:** `200 OK`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "date": "2023-11-15",
    "baseScore": 80,
    "breakdown": {
      "totalTasks": 5,
      "completedTasks": 4,
      "pointsPerTask": 20
    },
    "penalties": [
       {
         "type": "MISSED_TASK",
         "impact": -5,
         "message": "Missed 1 scheduled task"
       }
    ],
    "bonuses": [
       {
         "type": "EXERCISE",
         "impact": 3,
         "message": "Exercise improved focus and energy"
       }
    ],
    "finalScore": 78,
    "tips": [
      "Completing all tasks increases your base score"
    ]
  }
}
```

### Error Responses
- `400 Bad Request`: Invalid date.
- `401 Unauthorized`: User is not logged in.
