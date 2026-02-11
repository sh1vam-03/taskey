# 🌐 Public & System API

Routes accessible without authentication.

**Base URL:** `/api` (and `/api/publicPages`)

---

## 1. System Health Check
- **Endpoint:** `/health`
- **Method:** `GET`
- **Auth:** Private (Admin Token Required)

### Response
```json
{
  "message": "Api is working..."
}
```

---

## 2. Contact Support
- **Endpoint:** `/publicPages/contact-us`
- **Method:** `POST`
- **Auth:** Public

### Request Body
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "subject": "Help",
  "message": "I need help with..."
}
```

### Success Response (200/201)
```json
{
  "success": true,
  "message": "Your contact us message has been sent successfully"
}
```
