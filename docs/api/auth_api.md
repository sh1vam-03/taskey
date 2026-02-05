# 🔐 Authentication API

Base URL: `/api/auth`

## Middleware
All endpoints except Login/Signup/Verify/Forgot require the `authMiddleware`.
- **Header:** `Authorization: Bearer <token>`

---

## 1. Signup
Create a new user account.
- **URL:** `/signup`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Resgistered! OTP sent to email"
  }
  ```

## 2. Verify OTP
Verify email using the OTP sent.
- **URL:** `/verify-otp`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "otp": "123456"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Email verified successfully"
  }
  ```

## 3. Login
Authenticate and receive JWT and Session info.
- **URL:** `/login`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "ey...",
      "refreshToken": "ey...",
      "user": { ... }
    }
  }
  ```

## 4. Get Profile
Get current user details.
- **URL:** `/me`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER",
      "plan": "FREE",
      "aiTokenBalance": 100
    }
  }
  ```

## 5. Logout
Invalidate current session.
- **URL:** `/logout`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`

## 6. Refresh Token
Get a new access token using a refresh token.
- **URL:** `/refresh-token`
- **Method:** `POST`
- **Body:** `{"refreshToken": "..."}`
