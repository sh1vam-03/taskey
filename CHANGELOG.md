# Changelog

All notable changes to TASKTIME are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Push notifications via Firebase FCM
- AI assistant on mobile app
- Offline mode with background sync
- Task sharing and collaboration
- iOS app

---

## [1.0.0-alpha] — 2025-03-18

First public alpha release of TASKTIME. This release covers the full core feature set across all three platforms — backend API, Next.js web app, and React Native Android app.

### Added

**Backend API (Node.js + Express + Prisma)**
- Email registration with 6-digit OTP verification via Resend
- JWT authentication with access + refresh token pair
- Auto-refresh on 401 with queued request retry
- Secure password reset flow via OTP
- Account deletion endpoint
- Full task CRUD with priority, status, due date, and category support
- Schedule management with daily / weekly / monthly recurrence rules
- Today's agenda endpoint aggregating all scheduled items
- Behavior logging — mood, productivity score, sleep, exercise, notes
- AI conversation management — create, list, delete, rename
- Multi-model AI streaming via Server-Sent Events (SSE)
- AI model preference settings (Gemini, GPT-4o, Sarvam)
- Credit balance tracking and plan-based limits
- Razorpay payment order creation and webhook verification
- Dashboard statistics endpoint
- Production deployment on Railway

**Web Frontend (Next.js 14)**
- Full authentication flow — register, login, OTP, forgot/reset password
- Task management dashboard
- Calendar and scheduling views
- AI assistant with multi-model support, conversation history, SSE streaming
- Behavior tracking dashboard
- Billing and plan management
- Responsive minimal dark design system
- Deployment on Vercel with edge CDN

**Mobile App (React Native 0.76 — Android)**
- Complete authentication flow with typography-first dark design
  - IntroScreen with hero TASKTIME wordmark
  - LoginScreen, RegisterScreen (with password strength meter)
  - OtpScreen with animated 6-digit input boxes
  - ForgotPasswordScreen, ResetPasswordScreen (live requirements checklist)
- Custom shared design system (`_authShared.js`) — tokens, components, animations
- Home dashboard with overview, performance, behavior, and streaks sections
- Task management — create, edit, detail, priority badges
- Today's agenda view
- Schedule / calendar screen
- AI screen — redirects to web platform (native AI coming in v1.1)
- Profile, Settings, and Billing screens
- Custom animated bottom tab bar with glass effect
- Zustand state management with MMKV persistent storage
- Axios client with JWT auto-refresh interceptor
- Dark/light theme context
- Global alert/confirm dialog context
- SSE streaming hook (`useStream.js`) with AbortController and deduplication
- Release APK signed and published on GitHub Releases

**Design System**
- Dark background `#09090b`, cyan accent `#00d4ff`
- Consistent border radius, spacing, and typography tokens
- Staggered entrance animations across all auth screens
- LegalLinks component linking to Terms of Service and Privacy Policy
- TASKTIME app icon — analog clock T-mark at 12:19, all standard Android mipmap sizes

**DevOps & Project**
- PostgreSQL database with full Prisma schema
- Environment-based configuration for dev/production
- `.gitignore` covering all sensitive files
- MIT License
- Open-source governance files

### Fixed
- Android build error: missing `SplashScreen_SplashTheme` resource
- Android build error: missing `splash_image` drawable reference
- `newArchEnabled=false` deprecation warning in Gradle
- Release APK login failure caused by ProGuard stripping `react-native-config` values — fixed by updating fallback URL in `constants.js`
- AI screen duplicate messages on reload caused by missing AbortController in streaming hook — full useStream rewrite

### Security
- Passwords hashed with bcrypt (salt rounds: 10)
- JWT secret enforced via environment variable
- Keystore excluded from version control
- All API keys excluded from version control

---

## Notes

For older history before public release, see the [commit log](https://github.com/sh1vam-03/tasktime/commits/main).