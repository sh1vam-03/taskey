# Auth Test & Verification Report

## Auth Configuration
- **Access Token TTL**: `15m` (Enforced by `process.env.JWT_ACCESS_EXPIRES_IN`)
- **Refresh Token TTL**: `21d` (Enforced by `process.env.JWT_REFRESH_EXPIRES_IN`)
- **Remember Me**: Controls Refresh Token Cookie Persistence (Session vs 21 Days)
- **Session Expiry**: 21 Days (Fixed to match Refresh Token)

## Test Results (Code Verification)

### Phase A: Configuration
- [x] Environment variables used for all TTLs (`backend/src/utils/jwt.js`)
- [x] No dynamic `expiresIn` logic in `auth.service.js`
- [x] Cookies configured with `httpOnly`, `secure` (prod), `sameSite: strict`

### Phase B: Auth Logic
- [x] **Login NO Remember**:
    - Access Token Cookie: 15m
    - Refresh Token Cookie: Session (Browser Close clears it)
- [x] **Login WITH Remember**:
    - Access Token Cookie: 15m
    - Refresh Token Cookie: 21 Days
- [x] **Access Token Expiry**:
    - Frontend `api.js` interceptor catches 401
    - Calls `/auth/refresh`
    - Retries original request
- [x] **Refresh Token Rotation**:
    - `/auth/refresh` endpoint issues NEW Access Token (15m) & NEW Refresh Token (21d)
    - Sets both as cookies
    - Does NOT return tokens in JSON body

### Phase C: Session Security
- [x] **Terminate Session**:
    - Frontend calls `POST /auth/logout`
    - Backend revokes session in DB (`revokedAt`)
    - Clears cookies
- [x] **Password Reset**:
    - Invalidates all sessions (`tokenVersion` increment)
    - Revokes specific session

### Phase D: Frontend Integration
- [x] `withCredentials: true` enabled in `api.js`
- [x] Axios Interceptor implemented for 401 Auto-Refresh
- [x] No token storage in `localStorage` or `sessionStorage`

## Issues Resolved
1.  Removed dynamic `expiresIn` logic from `login` service.
2.  Fixed `refreshToken` endpoint to set correct cookie maxAge (15m vs 7d).
3.  Fixed `refreshToken` endpoint to NOT expose token in response body.
4.  Implemented missing auto-refresh interceptor in Frontend.

## Final Hardening Fixes
- [x] **Refresh Token Source**: Read from `req.cookies.refreshToken` ONLY (Body/Header ignored)
- [x] **Session Persistence**: 
    - `isPersistent` flag added to Session schema.
    - Login sets flag based on "Remember Me".
    - Refresh preserves flag from original session.
    - MaxAge set dynamically: Session Cookie (if not persistent) vs 21 Days (if persistent).
- [x] **Logout Security**:
    - Clears `accessToken` cookie.
    - Clears `refreshToken` cookie (root path + `/auth/refresh` path).
- [x] **Frontend Security**:
    - Verified axios interceptor does not store tokens.

## Phase FA-10 – Environment & Cookie Configuration Lock

- [x] **Token TTLs**: Controlled by `JWT_ACCESS_EXPIRES_IN` and `JWT_REFRESH_EXPIRES_IN`.
- [x] **Cookie Lifetimes**: Controlled by `ACCESS_COOKIE_MAX_AGE` and `REFRESH_COOKIE_PERSISTENT_MAX_AGE`.
- [x] **No Magic Numbers**: `auth.controller.js` uses constants derived from env.
- [x] **Persistence Preserved**: `isPersistent` logic remains unchanged.
- [x] **Cookie-Only Refresh**: Enforced.
- [x] **Logout**: Clears all auth cookies.

## Status
**LOCKED & PRODUCTION READY**
