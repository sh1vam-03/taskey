# 🧠 Behavior API

Log and track mood, sleep, and exercise.

**Base URL:** `/api/behavior`

---

## 1. Log Behavior
Upsert (Create or Update) behavior log for a specific date.
- **Limit:** Free users max 30 logs/month.

- **Method:** `POST`
- **URL:** `/`
- **Auth Required:** Yes

### Request Body
```json
{
  "date": "2024-05-21",
  "mood": "HAPPY", // HAPPY, NEUTRAL, SAD, STRESSED, TIRED
  "sleepHours": 7.5,
  "exercise": true,
  "notes": "Good workout"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Behavior log updated"
}
```

---

## 2. Get Log by Date
- **Method:** `GET`
- **URL:** `/:date`

## 3. Get Summary
Get behavior trends over last N days.
- **Method:** `GET`
- **URL:** `/summary`
- **Query:** `days=7`
