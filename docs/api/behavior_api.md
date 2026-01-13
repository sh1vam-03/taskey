# 🧠 Behavior API

Base URL: `/api/behavior`

## Middleware
- `authMiddleware`
- `usageLimit("BEHAVIOR")`: Applied to Upsert endpoint for FREE users.

---

## 1. Log Behavior (Upsert)
Log daily mood, sleep, exercise.
- **URL:** `/`
- **Method:** `POST`
- **Limit:** Free users max 30 logs/month.
- **Body:**
  ```json
  {
    "date": "2024-05-21",
    "mood": "HAPPY",
    "sleepHours": 7.5,
    "exercise": true,
    "notes": "Good day"
  }
  ```

## 2. Get Log by Date
- **URL:** `/:date` (YYYY-MM-DD)
- **Method:** `GET`
- **Response:** Includes calculated `productivityScore`.

## 3. Get Summary
- **URL:** `/summary`
- **Method:** `GET`
- **Query:** `days=7`

## 4. Explain Score
Get breakdown of how productivity score was calculated.
- **URL:** `/explain/:date`
- **Method:** `GET`
