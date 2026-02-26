# 📈 Usage API

Track resource usage against plan limits.

**Base URL:** `/api/usage`

---

## 1. Get My Usage
Retrieve current month's usage counts.

- **Method:** `GET`
- **URL:** `/me`
- **Auth Required:** Yes

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "month": 5,
    "year": 2024,
    "taskCount": 12,
    "scheduleCount": 5,
    "behaviorCount": 10,
    "limits": {
      "task": 20,
      "schedule": 30,
      "behavior": 15
    }
  }
}
```
