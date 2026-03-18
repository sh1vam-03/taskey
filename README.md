<div align="center">

<img src="https://raw.githubusercontent.com/sh1vam-03/tasktime/main/assets/icon.png" width="120" alt="TASKTIME" />

# TASKTIME

### AI-Powered Task, Schedule & Productivity Management Platform

**Plan smarter. Build habits. Let AI handle the heavy lifting.**

<br/>

[![Version](https://img.shields.io/badge/version-1.0.0--alpha-00d4ff?style=flat-square)](https://github.com/sh1vam-03/tasktime/releases)
[![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Android-00d4ff?style=flat-square)](#-platforms)
[![License](https://img.shields.io/badge/license-MIT-00d4ff?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/status-Alpha-orange?style=flat-square)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)
[![Backend](https://img.shields.io/badge/backend-Railway-blueviolet?style=flat-square)](https://railway.app)
[![Frontend](https://img.shields.io/badge/frontend-Vercel-black?style=flat-square)](https://vercel.com)

<br/>

[🌐 Web App](https://tasktime-sh1vam-03.vercel.app) &nbsp;·&nbsp;
[📱 Download APK](https://github.com/sh1vam-03/tasktime/releases/download/v1.0.0-alpha/TASKTIME-v1.0.0-alpha.apk) &nbsp;·&nbsp;
[📖 Documentation](#-documentation) &nbsp;·&nbsp;
[🐛 Report Bug](https://github.com/sh1vam-03/tasktime/issues) &nbsp;·&nbsp;
[💡 Request Feature](https://github.com/sh1vam-03/tasktime/discussions)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Platforms & Live Links](#-platforms--live-links)
- [Download Android App](#-download-android-app)
- [Features](#-features)
- [Architecture Overview](#-architecture-overview)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Web Frontend Setup](#2-web-frontend-setup)
  - [Mobile App Setup](#3-mobile-app-setup)
  - [Build Release APK](#4-build-release-apk)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Documentation](#-documentation)
- [Team](#-team)
- [Contributing](#-contributing)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🎯 About the Project

**TASKTIME** is an open-source, full-stack productivity platform that combines task management, smart scheduling, habit tracking, and AI assistance — all in one place.

It is designed for people who want more than a simple to-do list. TASKTIME is built around three core ideas:

- **AI-first** — Every feature is designed to work alongside AI, from creating tasks with natural language to getting smart scheduling suggestions.
- **Behavior-aware** — The app tracks not just tasks, but moods, habits, sleep, and productivity patterns to give you a complete picture of your day.
- **Cross-platform** — A full-featured web app and a native Android app, both connected to the same backend.

This project is also built as a real-world, production-grade portfolio project following industry best practices in API design, authentication, database architecture, and mobile development.

### Who is it for?

| Audience | Use case |
|----------|----------|
| 🎓 Students | Manage study schedules, assignments, and habits |
| 💻 Self-learners | Track daily routines and learning streaks |
| 🧑‍💼 Professionals | Plan work tasks, meetings, and deep work sessions |
| 👨‍💻 Developers | A reference project for full-stack + React Native architecture |

---

## 🌐 Platforms & Live Links

| Platform | Technology | Status | URL |
|----------|-----------|--------|-----|
| 🌐 Web App | Next.js 14 + Vercel | ✅ Live | [tasktime-sh1vam-03.vercel.app](https://tasktime-sh1vam-03.vercel.app) |
| 🤖 AI Assistant | Web (Multi-model) | ✅ Live | [tasktime-sh1vam-03.vercel.app/ai](https://tasktime-sh1vam-03.vercel.app/ai) |
| ⚙️ Backend API | Node.js + Railway | ✅ Live | [tasktime-production.up.railway.app/api](https://tasktime-production.up.railway.app/api) |
| 📱 Android App | React Native | ✅ Alpha | [Download below](#-download-android-app) |
| 🍎 iOS App | React Native | 🔜 Planned | — |

---

## 📱 Download Android App

> **⚠️ Alpha Release** — This is an early release. Some features may be incomplete or unstable. We appreciate your feedback via [GitHub Issues](https://github.com/sh1vam-03/tasktime/issues).

### [⬇️ Download TASKTIME-v1.0.0-alpha.apk](https://github.com/sh1vam-03/tasktime/releases/download/v1.0.0-alpha/TASKTIME-v1.0.0-alpha.apk)

**Version:** 1.0.0-alpha &nbsp;|&nbsp; **Size:** ~25MB &nbsp;|&nbsp; **Requires:** Android 7.0+ (API 24)

### Installation Instructions

```
1. Tap the download link above on your Android phone
2. Once downloaded, open the APK file
3. If prompted, go to:
   Settings → Apps → Special app access → Install unknown apps
   and enable it for your browser or file manager
4. Tap Install
5. Open TASKTIME and create your account
```

---

## ✨ Features

### 🔐 Authentication & Security

- Email registration with OTP verification
- JWT-based stateless authentication
- Auto-refresh tokens — stay logged in seamlessly
- Secure password reset via 6-digit OTP
- Account deletion and logout

### ✅ Task Management

- Create, edit, delete, and organize tasks
- Three priority levels — **Low / Medium / High** with color coding
- Status tracking — **Pending / In Progress / Completed**
- Optional due dates with deadline awareness
- Category and label support
- Task search and filtering

### 📆 Smart Scheduling & Calendar

- Assign tasks to specific dates and time slots
- **Recurring schedules** — Daily, Weekly (select days), Monthly
- Multiple schedules for the same task (e.g., gym morning & evening)
- Full calendar views — **Day / Week / Month**
- Schedule conflict detection
- Today's agenda view

### 🧠 AI Assistant

- **Multi-model AI** — Google Gemini, GPT-4o Mini, Sarvam 30B
- Natural language task creation and planning
- Context-aware responses based on your tasks and schedule
- Productivity analysis and smart suggestions
- Conversation history with multiple chat threads
- Credit-based usage system (Free / Pro plans)
- Available on web — mobile version coming soon

### 📊 Behavior & Productivity Tracking

- Daily behavior logs
- Mood tracking (5-point scale)
- Productivity score calculation
- Sleep and exercise indicators
- Personal daily reflection notes
- Streak tracking for habits
- Performance analytics dashboard

### 💳 Billing & Plans

| Feature | Free | Pro |
|---------|------|-----|
| Tasks | 50/month | Unlimited |
| AI credits | 50/month | 500/month |
| Schedules | Basic | Advanced |
| Analytics | Basic | Full |

- Razorpay payment integration (India)
- Automatic credit tracking and renewal

### 🎨 Design System

- Minimal dark theme — `#09090b` background, `#00d4ff` cyan accent
- Typography-first UI inspired by Linear and Vercel
- React Native mobile app with smooth animations
- Consistent design tokens shared across web and mobile

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENTS                             │
│                                                             │
│   ┌──────────────────┐      ┌──────────────────────────┐   │
│   │   Next.js Web    │      │  React Native Android    │   │
│   │   (Vercel)       │      │  (APK / Play Store)      │   │
│   └────────┬─────────┘      └───────────┬──────────────┘   │
└────────────┼───────────────────────────┼─────────────────── ┘
             │         HTTPS             │
             ▼                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API                              │
│            Node.js + Express (Railway)                      │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │   Auth   │ │  Tasks   │ │ Schedule │ │  AI Router   │  │
│  │  Routes  │ │  Routes  │ │  Routes  │ │   Routes     │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────┬───────┘  │
│                                                 │           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐         │           │
│  │Behavior  │ │ Billing  │ │Dashboard │         │           │
│  │  Routes  │ │  Routes  │ │  Routes  │         │           │
│  └──────────┘ └──────────┘ └──────────┘         │           │
└─────────────────────────────┬───────────────────┼───────────┘
                              │                   │
              ┌───────────────┘         ┌─────────┘
              ▼                         ▼
┌─────────────────────┐    ┌────────────────────────────────┐
│    PostgreSQL DB    │    │         AI Providers           │
│   (Prisma ORM)      │    │  Gemini │ GPT-4o │ Sarvam AI  │
└─────────────────────┘    └────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Mobile App (React Native)

| Library | Version | Purpose |
|---------|---------|---------|
| React Native | 0.76+ | Mobile framework |
| React Navigation | 6.x | Screen navigation |
| Zustand | 4.x | Global state management |
| react-native-mmkv | 3.x | Fast local storage |
| Axios | 1.x | HTTP API client |
| react-native-config | 1.x | Environment variables |
| react-native-svg | 15.x | SVG icons & logo |
| react-native-vector-icons | 10.x | Icon library (MaterialCommunityIcons) |
| react-native-safe-area-context | 4.x | Safe area handling |
| react-native-razorpay | 2.x | Payment gateway |
| react-native-markdown-display | 7.x | Markdown rendering in AI chat |

### Web Frontend (Next.js)

| Library | Version | Purpose |
|---------|---------|---------|
| Next.js | 14.x | React framework (App Router) |
| Tailwind CSS | 3.x | Utility-first styling |
| Zustand | 4.x | State management |
| Axios | 1.x | API requests |

### Backend (Node.js)

| Library | Version | Purpose |
|---------|---------|---------|
| Express.js | 4.x | REST API framework |
| Prisma | 5.x | ORM and database migrations |
| PostgreSQL | 15+ | Primary database |
| jsonwebtoken | 9.x | JWT authentication |
| bcryptjs | 2.x | Password hashing |
| Resend | 2.x | Transactional email (OTP, welcome) |
| Razorpay | 2.x | Payments (India) |

### AI & Cloud

| Service | Purpose |
|---------|---------|
| Google Gemini 1.5 Flash / 2.0 | Primary AI model |
| GPT-4o Mini | Fallback AI model |
| Sarvam 30B | Indic language support |
| Railway | Backend hosting |
| Vercel | Frontend hosting |
| Supabase / NeonDB | PostgreSQL hosting |

---

## 📁 Project Structure

```
tasktime/
│
├── app/                              # 📱 React Native Android App
│   ├── src/
│   │   ├── api/                      # API layer
│   │   │   ├── client.js             # Axios instance + interceptors
│   │   │   ├── auth.api.js           # Login, register, OTP, refresh
│   │   │   ├── task.api.js           # Task CRUD
│   │   │   ├── schedule.api.js       # Schedule management
│   │   │   ├── ai.api.js             # AI conversations & streaming
│   │   │   ├── behavior.api.js       # Behavior logs
│   │   │   ├── billing.api.js        # Plans & payments
│   │   │   ├── dashboard.api.js      # Dashboard stats
│   │   │   └── calendar.api.js       # Calendar data
│   │   │
│   │   ├── screens/
│   │   │   ├── auth/                 # Auth flow
│   │   │   │   ├── IntroScreen.js    # Onboarding
│   │   │   │   ├── LoginScreen.js    # Sign in
│   │   │   │   ├── RegisterScreen.js # Sign up
│   │   │   │   ├── OtpScreen.js      # Email verification
│   │   │   │   ├── ForgotPasswordScreen.js
│   │   │   │   ├── ResetPasswordScreen.js
│   │   │   │   └── _authShared.js    # Shared design tokens + components
│   │   │   │
│   │   │   ├── home/                 # Dashboard & overview
│   │   │   ├── tasks/                # Task management
│   │   │   ├── today/                # Today's agenda
│   │   │   ├── schedule/             # Calendar & scheduling
│   │   │   ├── ai/                   # AI assistant (web redirect)
│   │   │   ├── calendar/             # Full calendar view
│   │   │   └── profile/              # Profile, settings, billing
│   │   │
│   │   ├── navigation/
│   │   │   ├── RootNavigator.js      # Auth vs App routing
│   │   │   ├── AuthNavigator.js      # Auth screens stack
│   │   │   ├── MainNavigator.js      # Main app stack
│   │   │   ├── TabNavigator.js       # Bottom tab navigator
│   │   │   └── CustomTabBar.js       # Custom tab bar UI
│   │   │
│   │   ├── store/
│   │   │   ├── auth.store.js         # Auth state (user, tokens)
│   │   │   ├── task.store.js         # Task state
│   │   │   └── ui.store.js           # UI preferences, theme
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js            # Auth helpers
│   │   │   ├── useTasks.js           # Task operations
│   │   │   ├── useSchedule.js        # Schedule operations
│   │   │   └── useStream.js          # SSE streaming for AI
│   │   │
│   │   ├── context/
│   │   │   ├── ThemeContext.js       # Dark/light theme
│   │   │   └── AlertContext.js       # Global alert/dialog
│   │   │
│   │   ├── utils/
│   │   │   ├── constants.js          # API_BASE_URL and app constants
│   │   │   ├── storage.js            # MMKV token storage
│   │   │   └── date.js               # Date formatting helpers
│   │   │
│   │   └── theme/
│   │       ├── colors.js             # Color palette
│   │       ├── typography.js         # Font sizes and weights
│   │       └── spacing.js            # Spacing scale
│   │
│   ├── android/                      # Android native project
│   └── .env                          # Mobile environment variables
│
├── frontend/                         # 🌐 Next.js Web App
│   ├── app/                          # App router pages
│   ├── components/                   # UI components
│   └── utils/                        # Helpers
│
├── backend/                          # ⚙️ Node.js API
│   ├── controllers/                  # Route handlers
│   ├── services/                     # Business logic
│   ├── routes/                       # API route definitions
│   ├── middleware/                   # Auth, error, validation
│   ├── prisma/
│   │   └── schema.prisma             # Database schema
│   └── config/                       # App configuration
│
└── docs/                             # 📚 Documentation
    ├── architecture.md
    ├── database_schema.md
    ├── api_documentation.md
    ├── scrum_backlog.md
    └── testing_strategy.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:

| Tool | Version | Check |
|------|---------|-------|
| Node.js | v18.0+ | `node --version` |
| npm | v9.0+ | `npm --version` |
| Git | v2.30+ | `git --version` |
| Java JDK | 17 | `java --version` |
| Android Studio | Latest | For mobile dev |

---

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/sh1vam-03/tasktime.git
cd tasktime/backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values (see Environment Variables section)

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Backend runs at: `http://localhost:5000`

Verify it's working:
```bash
curl http://localhost:5000/api/v1/health
# Should return: { "status": "ok" }
```

---

### 2. Web Frontend Setup

```bash
cd tasktime/frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Start development server
npm run dev
```

Web app runs at: `http://localhost:3000`

---

### 3. Mobile App Setup

```bash
cd tasktime/app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env — set API_BASE_URL to your backend URL

# Start Metro bundler
npx react-native start

# In a new terminal — run on Android
npx react-native run-android
```

> **Note:** Make sure an Android emulator is running or a physical device is connected with USB debugging enabled.

---

### 4. Build Release APK

```bash
# Generate signing keystore (one time only)
cd app/android/app
keytool -genkeypair -v \
  -keystore tasktime-release.keystore \
  -alias tasktime \
  -keyalg RSA -keysize 2048 \
  -validity 10000

# Add to android/gradle.properties
MYAPP_UPLOAD_STORE_FILE=tasktime-release.keystore
MYAPP_UPLOAD_KEY_ALIAS=tasktime
MYAPP_UPLOAD_STORE_PASSWORD=your_password
MYAPP_UPLOAD_KEY_PASSWORD=your_password

# Build release APK
cd app/android
./gradlew clean
./gradlew assembleRelease
```

Output: `app/build/outputs/apk/release/app-release.apk`

---

## 🔐 Environment Variables

### Backend `.env`

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@host:5432/tasktime?sslmode=require

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# OTP
OTP_EXPIRES_MINUTES=10

# Email (Resend)
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com

# Payments (Razorpay)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# AI Models
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
SARVAM_API_KEY=your_sarvam_api_key
```

### Web Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=https://tasktime-production.up.railway.app/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_key
```

### Mobile App `.env`

```env
API_BASE_URL=https://tasktime-production.up.railway.app/api
```

> ⚠️ **Never commit `.env` files, keystores, or API keys to version control.** All sensitive files are already in `.gitignore`.

---

## 📡 API Reference

Base URL: `https://tasktime-production.up.railway.app/api/v1`

All protected routes require the header:
```
Authorization: Bearer <access_token>
```

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/verify-otp` | Verify email OTP |
| POST | `/auth/login` | Login and get tokens |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/forgot-password` | Send reset OTP |
| POST | `/auth/reset-password` | Reset password with OTP |
| GET | `/auth/me` | Get current user |
| POST | `/auth/logout` | Logout |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all tasks |
| POST | `/tasks` | Create a task |
| GET | `/tasks/:id` | Get task by ID |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |
| PATCH | `/tasks/:id/status` | Update task status |

### Schedule

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/schedules` | Get all schedules |
| POST | `/schedules` | Create a schedule |
| PUT | `/schedules/:id` | Update schedule |
| DELETE | `/schedules/:id` | Delete schedule |
| GET | `/schedules/today` | Get today's schedule |

### AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ai/conversations` | Get all conversations |
| POST | `/ai/conversations` | Create conversation |
| GET | `/ai/conversations/:id/messages` | Get messages |
| POST | `/ai/conversations/:id/stream` | Stream AI response (SSE) |
| DELETE | `/ai/conversations/:id` | Delete conversation |
| GET | `/ai/settings` | Get AI settings |
| PUT | `/ai/settings` | Update AI settings |

For the full API documentation see [`docs/api_documentation.md`](docs/api_documentation.md).

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [📖 Scrum Backlog](docs/scrum_backlog.md) | Feature roadmap, sprint plans, task assignments |
| [🏗️ System Architecture](docs/architecture.md) | High-level design, context diagrams, component breakdown |
| [🗄️ Database Schema](docs/database_schema.md) | ER diagrams, table definitions, relationships |
| [📡 API Documentation](docs/api_documentation.md) | All endpoints, request/response examples |
| [🧪 Testing Strategy](docs/testing_strategy.md) | QA protocols, testing tools, coverage goals |

---

## 👥 Team

TASKTIME is developed by a student team from **Tulsi College, Beed (BAMU)** as both a commercial product and a BCA final-year project.

<br/>

<table align="center">
  <tr>
    <td align="center" width="33%">
      <img src="https://github.com/atharvkundalkar.png" width="100" style="border-radius:50%" alt="Atharv Kundalkar"/><br/><br/>
      <strong>Atharv Kundalkar</strong><br/>
      <sub>Project Lead</sub><br/><br/>
      <div align="left">
        &nbsp;• System Architecture<br/>
        &nbsp;• Multi-Model AI Pipeline<br/>
        &nbsp;• Frontend Framework Design<br/>
        &nbsp;• Global State Management
      </div><br/>
      <a href="https://github.com/atharvkundalkar">GitHub</a> &nbsp;·&nbsp;
      <a href="https://linkedin.com/in/atharv-kundalkar-52467028b">LinkedIn</a>
    </td>
    <td align="center" width="33%">
      <img src="https://github.com/sh1vam-03.png" width="100" style="border-radius:50%" alt="Balaji Bokare"/><br/><br/>
      <strong>Balaji Bokare</strong><br/>
      <sub>Full-Stack Developer</sub><br/><br/>
      <div align="left">
        &nbsp;• REST API & Backend<br/>
        &nbsp;• React Native Mobile App<br/>
        &nbsp;• Authentication & Security<br/>
        &nbsp;• Database Design & DevOps
      </div><br/>
      <a href="https://github.com/sh1vam-03">GitHub</a> &nbsp;·&nbsp;
      <a href="https://linkedin.com/in/sh1vam~03">LinkedIn</a>
    </td>
    <td align="center" width="33%">
      <img src="https://github.com/HanumantSurve.png" width="100" style="border-radius:50%" alt="Hanumant Surve"/><br/><br/>
      <strong>Hanumant Surve</strong><br/>
      <sub>Frontend Developer</sub><br/><br/>
      <div align="left">
        &nbsp;• UI Component Development<br/>
        &nbsp;• Sarvam AI Integration<br/>
        &nbsp;• Voice Interface<br/>
        &nbsp;• Indic Language Routing
      </div><br/>
      <a href="https://github.com/HanumantSurve">GitHub</a>
    </td>
  </tr>
</table>

<br/>

**Academic Guide:** Prof. Ankush Surve &nbsp;·&nbsp; Tulsi College, Beed &nbsp;·&nbsp; B.A.M. University

---

## 🤝 Contributing

Contributions are what make open source amazing. Any contribution you make is **greatly appreciated**.

### How to Contribute

```bash
# 1. Fork the repository
# Click the Fork button on GitHub

# 2. Clone your fork
git clone https://github.com/your-username/tasktime.git
cd tasktime

# 3. Create a feature branch
git checkout -b feature/your-feature-name

# 4. Make your changes
# Write clean code, follow existing patterns, add comments

# 5. Commit your changes
git commit -m "Add: description of your change"

# 6. Push to your branch
git push origin feature/your-feature-name

# 7. Open a Pull Request on GitHub
```

### Branch Naming

```
feature/feature-name       → New features
bugfix/issue-description   → Bug fixes
hotfix/critical-fix        → Urgent production fixes
docs/what-you-updated      → Documentation
refactor/what-you-changed  → Code cleanup
```

### Commit Message Format

```
Add: new thing added
Fix: bug that was fixed
Update: what was changed and why
Remove: what was removed
Docs: documentation update
Refactor: code improvement without behavior change
```

### Code Style

- Use meaningful variable and function names
- Keep functions small and focused (single responsibility)
- Add comments for complex logic
- Follow existing file structure and naming conventions
- No `console.log` in production code — use proper logging

### Reporting Issues

When opening an issue please include:
- Clear title and description
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots or logs if applicable
- Device/OS info for mobile issues

---

## 🗺️ Roadmap

### Version 1.0 — Alpha ✅
- [x] Email authentication with OTP
- [x] Task management (CRUD + priorities + status)
- [x] Smart scheduling with recurrence rules
- [x] Behavior tracking and mood logs
- [x] AI assistant on web
- [x] React Native Android app
- [x] Razorpay billing integration
- [x] Custom dark minimal design system

### Version 1.1 — Beta 🔄
- [ ] Push notifications (Firebase FCM)
- [ ] AI assistant on mobile app
- [ ] Offline mode with sync
- [ ] Task collaboration / sharing
- [ ] Performance optimizations

### Version 2.0 — Stable 🔜
- [ ] iOS app (App Store)
- [ ] Home screen widgets
- [ ] Calendar integrations (Google Calendar, Outlook)
- [ ] Advanced AI analytics
- [ ] Team workspaces
- [ ] Open API for third-party integrations

---

## 📄 License

Distributed under the **MIT License**.

```
MIT License

Copyright (c) 2025 TASKTIME Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

See [`LICENSE`](LICENSE) for the full text.

---

## 💬 Support & Contact

- 🐛 **Bug Reports** → [Open an Issue](https://github.com/sh1vam-03/tasktime/issues)
- 💡 **Feature Requests** → [Start a Discussion](https://github.com/sh1vam-03/tasktime/discussions)
- 📧 **Email** → l1acker03@gmail.com
- 🌐 **Website** → [tasktime-sh1vam-03.vercel.app](https://tasktime-sh1vam-03.vercel.app)

---

<div align="center">

**Built with ❤️ by the TASKTIME Team**

*Making productivity simple, intelligent, and accessible for everyone.*

<br/>

⭐ **Star this repo if you find it useful** — it really helps!

<br/>

[Atharv Kundalkar](https://github.com/atharvkundalkar) &nbsp;·&nbsp;
[Balaji Bokare](https://github.com/sh1vam-03) &nbsp;·&nbsp;
[Hanumant Surve](https://github.com/HanumantSurve)

<br/>

[⬆️ Back to Top](#tasktime)

</div>
