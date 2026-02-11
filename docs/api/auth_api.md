# 🔐 Authentication API

This module handles user registration, session management, and security.

**Base URL:** `/api/auth`

---

## 🛡️ Authentication Model

The system uses a **Dual-Token Architecture** (Access + Refresh) stored in **HTTP-Only Cookies** for maximum security.

### 1. Access Token (`accessToken`)
- **Type:** JWT (JSON Web Token)
- **Storage:** `httpOnly` Cookie
- **Lifespan:** 15 minutes
- **Purpose:** Authorizes API requests. Sent automatically by browser.

### 2. Refresh Token (`refreshToken`)
- **Type:** Opaque / JWT
- **Storage:** `httpOnly` Cookie
- **Path:** `/api/auth/refresh` (and root for logout)
- **Lifespan:**
  - **Session Mode:** Cleared on browser close (if "Remember Me" is unchecked).
  - **Persistent Mode:** 21 Days (if "Remember Me" is checked).
- **Purpose:** Obtains new Access Tokens when they expire.

### 3. Token Rotation
Every time a Refresh Token is used:
1. The old Refresh Token is invalidated.
2. A **NEW** Access Token is issued.
3. A **NEW** Refresh Token is issued.
This prevents replay attacks.

---

## ⚡ Global Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description",
  "stack": "..." // Only in Development
}
```

**Common Codes:**
- `400`: Validation Error (Missing fields, invalid data)
- `401`: Unauthorized (Invalid/Expired Token)
- `403`: Forbidden (Account inactive/banned)
- `404`: Not Found
- `500`: Internal Server Error

---

## 1. Signup
Create a new user account.

- **Method:** `POST`
- **URL:** `/signup`
- **Auth Required:** No

### Request Body
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePassword123!"
}
```

### Success Response (201)
```json
{
  "success": true,
  "message": "Registered! OTP sent to email"
}
```

---

## 2. Verify OTP
Verify email using the 6-digit OTP sent to email.

- **Method:** `POST`
- **URL:** `/verify-otp`
- **Auth Required:** No

### Request Body
```json
{
  "email": "jane@example.com",
  "otp": "123456"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

## 3. Login
Authenticate and establish a session.

- **Method:** `POST`
- **URL:** `/login`
- **Auth Required:** No

### Request Body
```json
{
  "email": "jane@example.com",
  "password": "SecurePassword123!",
  "remember": true // If true, session lasts 21 days. If false, session ends on browser close.
}
```

### Success Response (200)
**Cookies Set:** `accessToken` (15m), `refreshToken` (Session or 21d)

```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "USER",
      "plan": "FREE",
      "aiTokenBalance": 10
    }
  }
}
```

---

## 4. Refresh Token
Get a new Access Token. Frontend should call this on 401 response.

- **Method:** `POST`
- **URL:** `/refresh-token`
- **Auth Required:** Cookie (`refreshToken`)

### Request Body
*(None - handled via Cookie)*

### Success Response (200)
**Cookies Set:** New `accessToken`, New `refreshToken`

```json
{
  "success": true,
  "message": "Session refreshed"
}
```

---

## 5. Get Profile
Get current user details.

- **Method:** `GET`
- **URL:** `/me`
- **Auth Required:** Yes (Cookie)

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "plan": "PRO",
    "aiTokenBalance": 450
  }
}
```

---

## 6. Logout
Invalidate current session.

- **Method:** `POST`
- **URL:** `/logout`
- **Auth Required:** Yes (Cookie)

### Success Response (200)
**Cookies Cleared:** `accessToken`, `refreshToken`

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 7. Request OTP (Resend)
Resend the verification OTP.

- **Method:** `POST`
- **URL:** `/otp-request`
- **Auth Required:** No

### Request Body
```json
{
  "email": "jane@example.com"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

---

## 8. Forgot Password
Initiate password reset via email link.

- **Method:** `POST`
- **URL:** `/forgot-password`
- **Auth Required:** No

### Request Body
```json
{
  "email": "jane@example.com"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Password reset link sent to email"
}
```

---

## 9. Reset Password
Set a new password using the token from email.

- **Method:** `POST`
- **URL:** `/reset-password`
- **Auth Required:** No

### Request Body
```json
{
  "token": "token-from-email-link",
  "password": "NewSecurePassword123!"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## 10. Logout All Devices
Invalidate **ALL** active sessions for this user (Security feature).

- **Method:** `POST`
- **URL:** `/logout-all`
- **Auth Required:** Yes

### Success Response (200)
```json
{
  "success": true,
  "message": "Logged out from all devices"
}
```

---

## 11. Delete Account
Permanently delete user account and data.

- **Method:** `DELETE`
- **URL:** `/me`
- **Auth Required:** Yes

### Success Response (200)
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```
