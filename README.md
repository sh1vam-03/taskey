<div align="center">

# TASKTIME

### AI-Powered Task, Schedule & Productivity Management Platform

**Plan smarter. Build habits. Let AI handle the heavy lifting.**

<br/>

[![Version](https://img.shields.io/badge/version-1.0.0--alpha-00d4ff?style=flat-square)](https://github.com/sh1vam-03/tasktime/releases/tag/v1.0.0-alpha)
[![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Android-00d4ff?style=flat-square)](#-platforms--live-links)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)
[![Status](https://img.shields.io/badge/status-Alpha-orange?style=flat-square)](#)
[![Backend](https://img.shields.io/badge/backend-Railway-blueviolet?style=flat-square)](https://railway.app)
[![Frontend](https://img.shields.io/badge/frontend-Vercel-black?style=flat-square)](https://vercel.com)
[![Made in India](https://img.shields.io/badge/Made%20in-India-orange?style=flat-square)](#)

<br/>

[🌐 Web App](https://tasktime-sh1vam-03.vercel.app) &nbsp;·&nbsp;
[📱 Download APK](https://github.com/sh1vam-03/tasktime/releases/download/v1.0.0-alpha/TASKTIME-v1.0.0-alpha.apk) &nbsp;·&nbsp;
[🤖 AI Assistant](https://tasktime-sh1vam-03.vercel.app/ai) &nbsp;·&nbsp;
[📖 Docs](#-documentation) &nbsp;·&nbsp;
[🐛 Report Bug](https://github.com/sh1vam-03/tasktime/issues/new?template=bug_report.md) &nbsp;·&nbsp;
[💡 Request Feature](https://github.com/sh1vam-03/tasktime/discussions/new?category=ideas)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Platforms & Live Links](#-platforms--live-links)
- [Download Android App](#-download-android-app)
- [Screenshots](#-screenshots)
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
- [Roadmap](#️-roadmap)
- [License](#-license)
- [Support](#-support)

---

## 🎯 About the Project

**TASKTIME** is an open-source, full-stack productivity platform that combines intelligent task management, smart scheduling, habit tracking, and multi-model AI assistance — all in one unified system.

It is built for people who want more than a simple to-do list. TASKTIME is designed around three core principles:

**AI-First** — Every feature is built to work alongside AI. From natural language task creation to smart scheduling suggestions, the AI layer is deeply integrated throughout the product, not bolted on as an afterthought.

**Behavior-Aware** — TASKTIME tracks not just tasks but the person doing them. Daily mood logs, productivity scores, sleep and exercise indicators, and reflection notes give users a complete picture of their own patterns over time.

**Cross-Platform** — A full-featured Next.js web app and a native Android app built with React Native, both connected to the same backend API on Railway. One account works everywhere.

This project is also built as a real-world, production-grade final-year BCA project at Tulsi College, Beed (B.A.M. University), following industry best practices in REST API design, JWT authentication, database architecture, and mobile development.

### Who Is It For?

| Audience | How TASKTIME helps |
|----------|--------------------|
| 🎓 Students | Manage study schedules, assignments, exam prep, and daily habits |
| 💻 Self-learners | Track learning routines, reading streaks, and daily goals |
| 🧑‍💼 Professionals | Plan work tasks, meetings, deep work sessions, and wellness habits |
| 👨‍💻 Developers | A reference project for full-stack + React Native + AI architecture |
| 🏛️ Recruiters | Evaluate real-world backend, mobile, and AI integration skills |

---

## 🌐 Platforms & Live Links

| Platform | Technology | Status | URL |
|----------|-----------|--------|-----|
| 🌐 Web App | Next.js 14 + Vercel | ✅ Live | [tasktime-sh1vam-03.vercel.app](https://tasktime-sh1vam-03.vercel.app) |
| 🤖 AI Assistant | Web — Multi-model | ✅ Live | [tasktime-sh1vam-03.vercel.app/ai](https://tasktime-sh1vam-03.vercel.app/ai) |
| ⚙️ Backend API | Node.js + Railway | ✅ Live | [tasktime-production.up.railway.app/api](https://tasktime-production.up.railway.app/api) |
| 📱 Android App | React Native | ✅ Alpha | [Download APK](#-download-android-app) |
| 🍎 iOS App | React Native | 🔜 Planned | — |

---

## 📱 Download Android App

> ⚠️ **This is an Alpha release.** Features are functional but some things may be incomplete or unstable. Your feedback helps us improve — please [open an issue](https://github.com/sh1vam-03/tasktime/issues) if you find a bug.

### [⬇️ Download TASKTIME-v1.0.0-alpha.apk](https://github.com/sh1vam-03/tasktime/releases/download/v1.0.0-alpha/TASKTIME-v1.0.0-alpha.apk)

| Detail | Value |
|--------|-------|
| Version | 1.0.0-alpha |
| Minimum Android | 7.0 (API Level 24) |
| Architecture | armeabi-v7a, arm64-v8a |

### How to Install

```
1. Download the APK on your Android phone
2. Open the downloaded file
3. If blocked, go to:
   Settings → Apps → Special app access → Install unknown apps
   Enable for your browser or file manager
4. Tap Install
5. Open TASKTIME and sign up
```

---

## ✨ Features

### 🔐 Authentication & Security

- Email registration with OTP email verification
- JWT-based stateless authentication with Bearer tokens
- Automatic token refresh — stays logged in seamlessly
- Secure 6-digit OTP password reset flow
- Account deletion and full logout
- Tokens stored securely using MMKV on mobile (not AsyncStorage)

### ✅ Task Management

- Full CRUD — create, read, update, delete tasks
- Three priority levels — **Low / Medium / High** with distinct color coding
- Status lifecycle — **Pending → In Progress → Completed**
- Optional due dates with deadline awareness
- Category and label support for organization
- Task search and filtering

### 📆 Smart Scheduling & Calendar

- Assign tasks to specific dates and time slots
- **Recurring schedules** — Daily, Weekly (choose specific days), Monthly
- Multiple schedules for the same task (e.g., gym at 6am and 6pm)
- Calendar views — **Day / Week / Month**
- Today's agenda view with all upcoming items
- Schedule conflict detection

### 🧠 AI Assistant

- **Multi-model support** — Google Gemini 1.5 Flash, GPT-4o Mini, Sarvam 30B
- Natural language task creation and planning
- Context-aware answers using your real task and schedule data
- AI-powered productivity suggestions and analysis
- Full conversation history with multiple named threads
- Server-Sent Events (SSE) streaming for real-time responses
- Credit-based usage system tied to Free/Pro plans
- ✅ Available on web — mobile app version planned

### 📊 Behavior & Productivity Tracking

- Daily behavior logs with structured fields
- Mood tracking on a 5-point scale
- Productivity score calculation per day
- Sleep hours and exercise indicators
- Personal daily reflection notes
- Streak tracking for consistent habits
- Performance analytics dashboard with trends

### 💳 Billing & Subscription Plans

| Feature | Free | Pro |
|---------|------|-----|
| Tasks | Unlimited | Unlimited |
| AI credits / month | 50 | 500 |
| Scheduling | Basic recurrence | Advanced recurrence |
| Analytics | 7-day | 30-day + export |
| Priority support | ❌ | ✅ |

- Razorpay payment gateway (India)
- Automatic credit tracking and monthly renewal
- Plan upgrade/downgrade from app and web

### 🎨 Design System

- Minimal dark theme — `#09090b` background, `#00d4ff` cyan accent
- Typography-first UI inspired by Linear, Vercel, and Clerk
- Shared design tokens across web and mobile via `_authShared.js`
- Staggered entrance animations and smooth transitions
- Custom bottom tab bar with glass morphism effect

---

## 🏗 Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                          CLIENTS                             │
│                                                              │
│    ┌───────────────────┐      ┌──────────────────────────┐   │
│    │   Next.js Web     │      │  React Native Android    │   │
│    │   (Vercel CDN)    │      │  (APK / Play Store)      │   │
│    └─────────┬─────────┘      └────────────┬─────────────┘   │
└──────────────┼─────────────────────────────┼─────────────────┘
               │           HTTPS / JWT        │
               ▼                             ▼
┌──────────────────────────────────────────────────────────────┐
│                       BACKEND API                            │
│              Node.js + Express (Railway)                     │
│                                                              │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │  Auth   │ │  Tasks  │ │ Schedule │ │    AI Router     │  │
│  │ /auth/* │ │/tasks/* │ │/sched/*  │ │   /ai/*          │  │
│  └─────────┘ └─────────┘ └──────────┘ └────────┬─────────┘  │
│                                                 │            │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐           │            │
│  │Behavior │ │ Billing │ │Dashboard │           │            │
│  │/behav/* │ │/bill/*  │ │/dash/*   │           │            │
│  └─────────┘ └─────────┘ └──────────┘           │            │
│                                                 │            │
│          Prisma ORM + Middleware Layer           │            │
└────────────────────────┬────────────────────────┼────────────┘
                         │                        │
            ┌────────────┘               ┌────────┘
            ▼                            ▼
┌───────────────────────┐   ┌────────────────────────────────┐
│     PostgreSQL DB     │   │         AI Providers           │
│   (Prisma ORM)        │   │                                │
│   Hosted on Railway   │   │  • Google Gemini 1.5 Flash     │
│                       │   │  • GPT-4o Mini (OpenAI)        │
└───────────────────────┘   │  • Sarvam 30B (Indic)          │
                            └────────────────────────────────┘
```

**Key design decisions:**
- Stateless JWT auth — no session storage, tokens refresh automatically
- SSE streaming for AI responses — no polling, real-time token delivery
- Shared API base URL — both web and mobile hit the same Railway backend
- MMKV for mobile token storage — 10× faster than AsyncStorage, synchronous reads

---

## 🛠️ Tech Stack

### 📱 Mobile App — React Native

| Library | Version | Purpose |
|---------|---------|---------|
| React Native | 0.76+ | Cross-platform mobile framework |
| React Navigation | 6.x | Stack + Tab navigation |
| Zustand | 4.x | Lightweight global state management |
| react-native-mmkv | 3.x | Fast synchronous local storage |
| Axios | 1.x | HTTP client with interceptors |
| react-native-config | 1.x | `.env` variable injection |
| react-native-svg | 15.x | SVG rendering (logo, icons) |
| react-native-vector-icons | 10.x | MaterialCommunityIcons + Feather |
| react-native-safe-area-context | 4.x | Safe area insets |
| react-native-razorpay | 2.x | In-app payments |
| react-native-markdown-display | 7.x | Markdown in AI chat |

### 🌐 Web Frontend — Next.js

| Library | Version | Purpose |
|---------|---------|---------|
| Next.js | 14.x | React framework with App Router |
| Tailwind CSS | 3.x | Utility-first CSS |
| Zustand | 4.x | Client-side state management |
| Axios | 1.x | API requests |

### ⚙️ Backend — Node.js

| Library | Version | Purpose |
|---------|---------|---------|
| Express.js | 4.x | REST API framework |
| Prisma ORM | 5.x | Type-safe database access + migrations |
| PostgreSQL | 15+ | Primary relational database |
| jsonwebtoken | 9.x | JWT signing and verification |
| bcryptjs | 2.x | Password hashing (salted) |
| Resend | 2.x | Transactional email — OTP, welcome |
| Razorpay SDK | 2.x | Payment order creation + verification |

### 🤖 AI & Cloud Services

| Service | Purpose |
|---------|---------|
| Google Gemini 1.5 Flash / 2.0 | Primary AI model — fast, multimodal |
| OpenAI GPT-4o Mini | Fallback model |
| Sarvam AI 30B | Indic language support |
| Railway | Backend + database hosting |
| Vercel | Frontend hosting with edge CDN |

---

## 📁 Project Structure

```
tasktime/
│
├── app/                                  # 📱 React Native Android App
│   ├── src/
│   │   ├── api/                          # API layer — all HTTP calls
│   │   │   ├── client.js                 # Axios instance, interceptors, auto-refresh
│   │   │   ├── auth.api.js               # Login, register, OTP, refresh, me
│   │   │   ├── task.api.js               # Task CRUD
│   │   │   ├── schedule.api.js           # Schedule management
│   │   │   ├── ai.api.js                 # AI conversations + SSE streaming
│   │   │   ├── behavior.api.js           # Behavior logs
│   │   │   ├── billing.api.js            # Plans and payments
│   │   │   ├── dashboard.api.js          # Dashboard statistics
│   │   │   ├── calendar.api.js           # Calendar data
│   │   │   └── category.api.js           # Task categories
│   │   │
│   │   ├── screens/
│   │   │   ├── auth/                     # Authentication flow
│   │   │   │   ├── _authShared.js        # Design tokens + shared components
│   │   │   │   ├── IntroScreen.js        # Onboarding / hero screen
│   │   │   │   ├── LoginScreen.js        # Sign in
│   │   │   │   ├── RegisterScreen.js     # Sign up + password strength meter
│   │   │   │   ├── OtpScreen.js          # Email verification (6-digit)
│   │   │   │   ├── ForgotPasswordScreen.js
│   │   │   │   └── ResetPasswordScreen.js
│   │   │   │
│   │   │   ├── home/                     # Dashboard & overview
│   │   │   │   ├── HomeScreen.js
│   │   │   │   ├── components/
│   │   │   │   └── sections/
│   │   │   │
│   │   │   ├── tasks/                    # Task management
│   │   │   │   ├── TasksScreen.js
│   │   │   │   └── sections/
│   │   │   │       ├── CreateTaskScreen.js
│   │   │   │       ├── TaskDetailScreen.js
│   │   │   │       └── TaskSheet.js
│   │   │   │
│   │   │   ├── today/                    # Today's agenda
│   │   │   ├── schedule/                 # Calendar & scheduling
│   │   │   ├── calendar/                 # Full calendar view
│   │   │   ├── ai/                       # AI screen (web redirect, mobile coming soon)
│   │   │   └── profile/                  # Profile, settings, billing
│   │   │       ├── ProfileScreen.js
│   │   │       ├── SettingsScreen.js
│   │   │       └── BillingScreen.js
│   │   │
│   │   ├── navigation/
│   │   │   ├── RootNavigator.js          # Auth vs App gate
│   │   │   ├── AuthNavigator.js          # Auth screens stack
│   │   │   ├── MainNavigator.js          # App screens stack
│   │   │   ├── TabNavigator.js           # Bottom tabs
│   │   │   └── CustomTabBar.js           # Custom tab bar with glass effect
│   │   │
│   │   ├── store/
│   │   │   ├── auth.store.js             # User + tokens (Zustand + MMKV)
│   │   │   ├── task.store.js             # Task state
│   │   │   └── ui.store.js               # Theme, preferences
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js                # Auth helpers
│   │   │   ├── useTasks.js               # Task operations
│   │   │   ├── useSchedule.js            # Schedule operations
│   │   │   └── useStream.js              # SSE streaming hook for AI
│   │   │
│   │   ├── context/
│   │   │   ├── ThemeContext.js           # Dark/light theme provider
│   │   │   └── AlertContext.js           # Global alert/confirm dialog
│   │   │
│   │   ├── utils/
│   │   │   ├── constants.js              # API_BASE_URL + app constants
│   │   │   ├── storage.js                # MMKV token get/set helpers
│   │   │   └── date.js                   # Date formatting utilities
│   │   │
│   │   └── theme/
│   │       ├── colors.js                 # Color palette tokens
│   │       ├── typography.js             # Font sizes and weights
│   │       └── spacing.js                # Spacing scale
│   │
│   ├── android/                          # Android native project
│   │   └── app/src/main/res/             # App icons (mipmap-*)
│   └── .env                              # Mobile env variables
│
├── frontend/                             # 🌐 Next.js Web App
│   ├── app/                              # App Router pages
│   ├── components/                       # Reusable UI components
│   └── utils/                            # Helper functions
│
├── backend/                              # ⚙️ Node.js + Express API
│   ├── controllers/                      # Request handlers (thin layer)
│   ├── services/                         # Business logic
│   ├── routes/                           # API route definitions
│   ├── middleware/                       # Auth, error handling, validation
│   ├── prisma/
│   │   └── schema.prisma                 # Database schema + relations
│   └── config/                           # App configuration
│
├── docs/                                 # 📚 Technical documentation (Markdown)
│   ├── architecture.md
│   ├── database_schema.md
│   ├── api_documentation.md
│   ├── scrum_backlog.md
│   └── testing_strategy.md
│
├── documentation/                        # 📄 Academic project reports (DOCX)
│
├── .gitignore
├── README.md                             # This file
├── CONTRIBUTING.md
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
└── LICENSE
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Min Version | Install check |
|------|-------------|---------------|
| Node.js | v18.0+ | `node --version` |
| npm | v9.0+ | `npm --version` |
| Git | v2.30+ | `git --version` |
| Java JDK | 17 | `java --version` |
| Android Studio | Latest | Required for Android emulator |

---

### 1. Backend Setup

```bash
# Clone the repo
git clone https://github.com/sh1vam-03/tasktime.git
cd tasktime/backend

# Install dependencies
npm install

# Copy environment template and fill in values
cp .env.example .env

# Run database migrations
npx prisma migrate dev --name init

# Start development server
npm run dev
```

The backend runs at `http://localhost:5000`.

Verify it's working:
```bash
curl http://localhost:5000/api/v1/health
# → { "status": "ok", "timestamp": "..." }
```

---

### 2. Web Frontend Setup

```bash
cd tasktime/frontend

npm install

cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL to your backend URL

npm run dev
```

Web app opens at `http://localhost:3000`.

---

### 3. Mobile App Setup

```bash
cd tasktime/app

npm install

# Copy env template
cp .env.example .env
# Set API_BASE_URL=http://YOUR_LOCAL_IP:5000/api
# (use your machine's LAN IP, not localhost)

# Start Metro bundler
npx react-native start

# In a second terminal — build and run on Android
npx react-native run-android
```

> Make sure your Android emulator is running or a physical device is connected with USB debugging enabled (`adb devices` to verify).

---

### 4. Build Release APK

```bash
# Step 1: Generate a signing keystore (one time only)
cd app/android/app
keytool -genkeypair -v \
  -keystore tasktime-release.keystore \
  -alias tasktime \
  -keyalg RSA -keysize 2048 \
  -validity 10000

# Step 2: Add credentials to android/gradle.properties
MYAPP_UPLOAD_STORE_FILE=tasktime-release.keystore
MYAPP_UPLOAD_KEY_ALIAS=tasktime
MYAPP_UPLOAD_STORE_PASSWORD=your_password_here
MYAPP_UPLOAD_KEY_PASSWORD=your_password_here

# Step 3: Build
cd app/android
./gradlew clean
./gradlew assembleRelease
```

**Output:** `app/build/outputs/apk/release/app-release.apk`

> ⚠️ Never commit your `.keystore` file or `gradle.properties` passwords to version control.

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
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# OTP
OTP_EXPIRES_MINUTES=10

# Email — Resend (https://resend.com)
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com

# Payments — Razorpay (https://razorpay.com)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx

# AI Models
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
SARVAM_API_KEY=your_sarvam_key
```

### Web Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=https://tasktime-production.up.railway.app/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
```

### Mobile App `.env`

```env
API_BASE_URL=https://tasktime-production.up.railway.app/api
```

> ⚠️ **Security rule:** Never commit `.env` files, API keys, or keystores to Git. They are all excluded in `.gitignore`.

---

## 📡 API Reference

**Base URL:** `https://tasktime-production.up.railway.app/api/v1`

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register new user |
| POST | `/auth/verify-otp` | ❌ | Verify email with OTP |
| POST | `/auth/login` | ❌ | Login, returns tokens |
| POST | `/auth/refresh` | ❌ | Refresh access token |
| POST | `/auth/forgot-password` | ❌ | Send reset OTP to email |
| POST | `/auth/reset-password` | ❌ | Reset password with OTP |
| GET | `/auth/me` | ✅ | Get current user profile |
| POST | `/auth/logout` | ✅ | Logout |
| DELETE | `/auth/delete` | ✅ | Delete account |

### Tasks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/tasks` | ✅ | Get all tasks |
| POST | `/tasks` | ✅ | Create a task |
| GET | `/tasks/:id` | ✅ | Get task by ID |
| PUT | `/tasks/:id` | ✅ | Update task |
| DELETE | `/tasks/:id` | ✅ | Delete task |
| PATCH | `/tasks/:id/status` | ✅ | Update task status |

### Schedule

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/schedules` | ✅ | Get all schedules |
| POST | `/schedules` | ✅ | Create schedule |
| GET | `/schedules/today` | ✅ | Get today's agenda |
| PUT | `/schedules/:id` | ✅ | Update schedule |
| DELETE | `/schedules/:id` | ✅ | Delete schedule |

### AI

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/ai/conversations` | ✅ | List conversations |
| POST | `/ai/conversations` | ✅ | Create conversation |
| GET | `/ai/conversations/:id/messages` | ✅ | Get messages |
| POST | `/ai/conversations/:id/stream` | ✅ | Stream AI response (SSE) |
| PATCH | `/ai/conversations/:id` | ✅ | Rename conversation |
| DELETE | `/ai/conversations/:id` | ✅ | Delete conversation |
| GET | `/ai/settings` | ✅ | Get AI settings + credits |
| PUT | `/ai/settings` | ✅ | Update model preferences |

### Behavior

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/behavior` | ✅ | Get behavior logs |
| POST | `/behavior` | ✅ | Create daily log |
| PUT | `/behavior/:id` | ✅ | Update log |

Full API documentation with request/response examples: [`docs/api_documentation.md`](docs/api_documentation.md)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [📖 Scrum Backlog](docs/scrum_backlog.md) | Feature roadmap, sprint plans, user stories, task assignments |
| [🏗️ System Architecture](docs/architecture.md) | High-level design, context diagrams, component breakdown |
| [🗄️ Database Schema](docs/database_schema.md) | ER diagrams, all table definitions and relationships |
| [📡 API Documentation](docs/api_documentation.md) | All endpoints with full request/response examples |
| [🧪 Testing Strategy](docs/testing_strategy.md) | QA protocols, testing tools, coverage goals |
| [📄 Academic Reports](documentation/) | BCA final-year project submission documents |

---

## 👥 Team

TASKTIME is developed by a student team from **Tulsi College, Beed, Maharashtra** under **B.A.M. University (BAMU)**, as both a commercial SaaS product and a BCA final-year project.

<br/>

<table align="center">
  <tr>
    <td align="center" width="33%">
      <img src="https://github.com/atharvkundalkar.png" width="100" alt="Atharv Kundalkar"/><br/><br/>
      <strong>Atharv Kundalkar</strong><br/>
      <sub>Project Lead</sub><br/><br/>
      <div align="left">
        &nbsp;• System Architecture<br/>
        &nbsp;• Multi-Model AI Pipeline<br/>
        &nbsp;• Frontend Framework Design<br/>
        &nbsp;• Global State Management
      </div><br/>
      <a href="https://github.com/atharvkundalkar">GitHub</a> &nbsp;·&nbsp;
      <a href="https://linkedin.com/in/atharv-kundalkar-52467028b">LinkedIn</a> &nbsp;·&nbsp;
      <a href="https://instagram.com/atharvkundalkar_47">Instagram</a>
    </td>
    <td align="center" width="33%">
      <img src="https://github.com/sh1vam-03.png" width="100" alt="Balaji Bokare"/><br/><br/>
      <strong>Balaji Bokare</strong><br/>
      <sub>Full-Stack Developer</sub><br/><br/>
      <div align="left">
        &nbsp;• REST API & Backend<br/>
        &nbsp;• React Native Mobile App<br/>
        &nbsp;• Authentication & Security<br/>
        &nbsp;• Database Design & DevOps
      </div><br/>
      <a href="https://github.com/sh1vam-03">GitHub</a> &nbsp;·&nbsp;
      <a href="https://linkedin.com/in/sh1vam~03">LinkedIn</a> &nbsp;·&nbsp;
      <a href="https://instagram.com/sh1vam_03">Instagram</a>
    </td>
    <td align="center" width="33%">
      <img src="https://github.com/HanumantSurve.png" width="100" alt="Hanumant Surve"/><br/><br/>
      <strong>Hanumant Surve</strong><br/>
      <sub>Frontend Developer</sub><br/><br/>
      <div align="left">
        &nbsp;• UI Component Development<br/>
        &nbsp;• Sarvam AI Integration<br/>
        &nbsp;• Voice Interface Development<br/>
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

Contributions are what make open source great. Every contribution — bug fix, feature, documentation, or feedback — is valued and appreciated.

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request.

### Quick Start

```bash
# 1. Fork this repo on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/tasktime.git
cd tasktime

# 3. Create a branch
git checkout -b feature/your-feature-name

# 4. Make your changes
# Follow the code style and structure of the existing codebase

# 5. Commit
git commit -m "Add: your change description"

# 6. Push
git push origin feature/your-feature-name

# 7. Open a Pull Request targeting the `develop` branch
```

### Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| New feature | `feature/name` | `feature/push-notifications` |
| Bug fix | `bugfix/name` | `bugfix/otp-expiry` |
| Urgent fix | `hotfix/name` | `hotfix/auth-crash` |
| Documentation | `docs/name` | `docs/api-examples` |
| Refactor | `refactor/name` | `refactor/task-service` |

### Commit Format

```
Add:      new feature or file added
Fix:      bug fixed
Update:   existing code improved
Remove:   code or file removed
Docs:     documentation only change
Refactor: code restructured without behavior change
```

---

## 🗺️ Roadmap

### ✅ v1.0.0-alpha — Released March 2025

- [x] Email authentication with OTP verification
- [x] Task management — CRUD, priorities, status, categories
- [x] Smart scheduling with daily / weekly / monthly recurrence
- [x] Behavior tracking — mood, productivity, sleep, exercise logs
- [x] Multi-model AI assistant on web (Gemini, GPT-4o, Sarvam)
- [x] React Native Android app with full feature parity on web
- [x] Razorpay billing with credit-based AI usage
- [x] Minimal dark design system with shared tokens
- [x] Production deployment — Railway backend, Vercel frontend

### 🔄 v1.1.0-beta — Planned

- [ ] Push notifications via Firebase FCM
- [ ] AI assistant on mobile app
- [ ] Offline mode with background sync
- [ ] Task sharing and collaboration
- [ ] Export data (CSV / PDF)

### 🔜 v2.0.0-stable — Future

- [ ] iOS app (App Store release)
- [ ] Home screen widgets
- [ ] Google Calendar & Outlook integration
- [ ] Advanced AI analytics and weekly reports
- [ ] Team workspaces for small groups
- [ ] Public REST API for third-party integrations

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of this software.

---

## 💬 Support

| Channel | Link |
|---------|------|
| 🐛 Bug Reports | [Open an Issue](https://github.com/sh1vam-03/tasktime/issues/new?template=bug_report.md) |
| 💡 Feature Requests | [Start a Discussion](https://github.com/sh1vam-03/tasktime/discussions/new?category=ideas) |
| 💬 Questions | [Q&A Discussions](https://github.com/sh1vam-03/tasktime/discussions/new?category=q-a) |
| 📧 Email | l1acker03@gmail.com |
| 🌐 Website | [tasktime-sh1vam-03.vercel.app](https://tasktime-sh1vam-03.vercel.app) |

---

## 🏆 Acknowledgments

- Prof. Ankush Surve for academic guidance and mentorship
- The React Native, Next.js, and Prisma open-source communities
- Google, OpenAI, and Sarvam AI for API access
- Everyone who tests, reports bugs, and helps improve TASKTIME

---

<div align="center">

**Built with ❤️ in India by the TASKTIME Team**

*Making productivity simple, intelligent, and accessible for everyone.*

<br/>

⭐ **If you find this project useful, please star the repository — it really helps!**

<br/>

[Atharv Kundalkar](https://github.com/atharvkundalkar) &nbsp;·&nbsp;
[Balaji Bokare](https://github.com/sh1vam-03) &nbsp;·&nbsp;
[Hanumant Surve](https://github.com/HanumantSurve)

<br/>

[⬆️ Back to Top](#tasktime)

</div>
