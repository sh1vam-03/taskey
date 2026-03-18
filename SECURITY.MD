# Security Policy

## Supported Versions

Only the latest release receives security updates.

| Version | Supported |
|---------|-----------|
| 1.0.0-alpha (latest) | ✅ Active |
| Earlier versions | ❌ Not supported |

---

## Reporting a Vulnerability

**Please do NOT open a public GitHub issue for security vulnerabilities.**

Public disclosure before a fix is in place puts all users at risk. We ask that you follow responsible disclosure practices.

### How to Report

Email us directly at: **l1acker03@gmail.com**

Use the subject line: `[SECURITY] Brief description of the issue`

Include in your report:
- A clear description of the vulnerability
- The component affected (backend API, web frontend, mobile app)
- Proof of concept or steps to reproduce
- Potential impact — what could an attacker do with this?
- Your name / handle (for credit in the acknowledgment, if desired)

### What Happens Next

1. We will acknowledge your report within **48 hours**
2. We will investigate and confirm the vulnerability within **7 days**
3. We will work on a fix and keep you updated on progress
4. We will release a patch and notify you before any public disclosure
5. We will credit you in the changelog and release notes if you wish

---

## Security Practices in This Codebase

### Authentication

- Passwords are hashed using **bcrypt** with a salt factor of 10 — plaintext passwords are never stored
- **JWT tokens** are short-lived (7 days access, 30 days refresh) and signed with a secret stored in environment variables only
- OTP codes expire after 10 minutes and are single-use
- Refresh tokens are rotated on each use

### API Security

- All protected endpoints require a valid `Authorization: Bearer <token>` header
- Input validation on all POST/PUT endpoints
- Rate limiting applied on auth endpoints to prevent brute force
- CORS configured to allow only known origins

### Mobile App

- Tokens are stored using **MMKV** (encrypted native storage) — not AsyncStorage
- No sensitive data is logged in production builds
- ProGuard enabled for release builds

### What NOT to Do

If you are contributing, never commit:
- `.env` files or any file containing real API keys
- The `tasktime-release.keystore` signing file
- Database credentials or JWT secrets
- Real user data of any kind

All of these are covered by `.gitignore`.

---

## Known Limitations (Alpha)

As an alpha release, the following security improvements are planned but not yet implemented:

- No rate limiting on all endpoints (only auth endpoints currently)
- No automated dependency vulnerability scanning (planned via GitHub Dependabot)
- No security headers middleware (Helmet.js planned for v1.1)
- No Content Security Policy on web frontend (planned for v1.1)

These will be addressed in the v1.1 beta release.