
# 📚 API Documentation Hub

**Base Server URL:** `http://localhost:5000/api`  
**Content-Type:** `application/json`

Welcome to the Taskey REST API documentation. This hub serves as the central index for all API specifications available in the system.

The API is designed around **RESTful** principles and uses standard **HTTP status codes**.

---

## 📑 Table of Contents

| Module | Description | Documentation Link |
|--------|-------------|-------------------|
| **🌐 Public API** | System Health Checks and Contact Forms. Accessible without auth. | [View Public API](./api/public_api.md) |
| **🔐 Authentication** | Signup, Login, Password Reset, and User Profile. | [View Auth API](./api/auth_api.md) |
| **📝 Task Management** | CRUD operations for Tasks. | [View Task API](./api/task_api.md) |
| **📂 Task Category Management** | CRUD operations for Task Categories. | [View Category API](./api/category_api.md) |
| **✅ Task Completion** | Mark tasks as Done/Undone, History, Bulk actions. | [View Completion API](./api/task_completion_api.md) |
| **📅 Calendar** | Day, Week, and Month views of scheduled tasks. | [View Calendar API](./api/calendar_api.md) |
| **🕒 Schedule Management** | Create and manage time blocks for tasks. | [View Schedule API](./api/schedule_api.md) |
| **🏁 Schedule Completion** | Track schedule execution (done/missed). | [View Schedule Completion API](./api/schedule_completion_api.md) |
| **📊 Dashboard & Analytics** | Aggregated insights, streaks, and performance metrics. | [View Dashboard API](./api/dashboard_api.md) |
| **🧠 Behavior & Mood** | Log mood, sleep, exercise, and get productivity insights. | [View Behavior API](./api/behavior_api.md) |
| **🤖 AI Assistant** | Chat with Gemini, RAG Context, Voice logs. | [View AI API](./api/ai_api.md) |
| **💳 Billing & Plans** | Subscriptions, Webhooks, Invoices. | [View Billing API](./api/billing_api.md) |
| **📈 Usage Limits** | Track free tier usage. | [View Usage API](./api/usage_api.md) |
---

## ⚠️ Common Standards

### Response Format
All API responses generally follow this wrapper structure:
```json
{
  "success": boolean,
  "message": string,
  "data": object | array
}
```

### Error Handling
Errors are returned with appropriate HTTP codes (4xx, 5xx) and a helpful message.
- `400`: Bad Request (Validation failed)
- `401`: Unauthorized (Invalid/Missing Token)
- `404`: Not Found
- `500`: Internal Server Error

---

> **Developer Note:**
> Ensure you have your `.env` file configured correctly before making requests.





# 📚 API Documentation Hub

**Base Server URL:** `http://localhost:5000/api`  
**Standard Response:** JSON  
**Auth Strategy:** HttpOnly Cookies (Access + Refresh)

---

## 📑 Core Modules

| Module | Description | Docs |
|--------|-------------|------|
| **🔐 Authentication** | Login, Signup, OTP, Token Rotation, Session Mgmt. | [View Auth API](./api/auth_api.md) |
| **💳 Billing & Plans** | Subscriptions (Razorpay), Webhooks, Credits. | [View Billing API](./api/billing_api.md) |
| **📝 Task Management** | CRUD, Priorities, Completion. | [View Task API](./api/task_api.md) |
| **🕒 Schedule** | Time-blocking, Recurring events. | [View Schedule API](./api/schedule_api.md) |
| **🤖 AI Assistant** | Chat, Voice, RAG Context. | [View AI API](./api/ai_api.md) |
| **🧠 Behavior** | Mood & Habit tracking. | [View Behavior API](./api/behavior_api.md) |
| **📊 Dashboard** | Analytics & Performance. | [View Dashboard API](./api/dashboard_api.md) |
| **🌐 Public/System** | Health Check, Contact Forms. | [View Public API](./api/public_api.md) |

---

## ⚠️ Global Error Format
All endpoints return standard error responses:
```json
{
  "success": false,
  "message": "Specific error description",
  "statusCode": 400
}
```
*(Stack trace included in Development mode)*

---

## 🔐 Auth Model Summary
- **Access Token:** 15 min expiry, httpOnly Cookie.
- **Refresh Token:** 21 days (Persistent) or Session-based.
- **Auto-Rotation:** New Access+Refresh tokens issued on every refresh.
