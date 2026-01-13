# 📊 Usage API

Base URL: `/api/usage`

## Middleware
- `authMiddleware`

---

## 1. Get My Usage
Get current usage statistics for the month (Tasks, Schedules, Behaviors count).
- **URL:** `/me`
- **Method:** `GET`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "month": 5,
      "year": 2024,
      "taskCount": 12,
      "scheduleCount": 5,
      "behaviorCount": 10
    }
  }
  ```
