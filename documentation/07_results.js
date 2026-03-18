/**
 * 07_results_discussion.js
 * ─────────────────────────────────────────
 * CHAPTER 7 — Results and Discussion
 * ─────────────────────────────────────────
 */

const { h1, h2, h3, h4, jpp, jp, bul, sp, sp2, pb, tbl, codeBlock } = require('./helpers');

const content = [

    h1('CHAPTER 7: RESULTS AND DISCUSSION'),

    jpp('This chapter presents the results of the TASKTIME project — the deployed system\'s feature completeness, AI performance metrics, test outcomes, and deployment status — followed by a structured discussion of the key achievements, observed limitations, and insights gained during development.'),
    sp(),

    // ─── 7.1 Deployment Status ───────────────────────────
    h2('7.1 Deployment Status'),

    jpp('TASKTIME has been successfully developed and deployed as a fully functional, production-grade AI-powered SaaS platform. The application is publicly accessible at tasktime-sh1vam-03.vercel.app. All planned features outlined in the project objectives (Chapter 1) and requirements (Chapter 3) have been implemented, tested, and deployed.'),
    sp(),
    tbl(
        ['Component', 'Platform', 'Status', 'Notes'],
        [
            ['Frontend (Next.js 16)', 'Vercel Hobby Tier', 'Live', 'Auto-deploys on every git push. Global CDN.'],
            ['Android App (React Native)', 'GitHub Releases', 'Live (Alpha)', 'APK v1.0.0-alpha available for direct download. Signed release build.'],
            ['Backend API (Node.js/Express)', 'Cloud Hosting', 'Live', 'All API endpoints operational.'],
            ['Database (PostgreSQL 16)', 'Supabase Free Tier', 'Live', 'AWS ap-south-1 (Mumbai). Connection pooling active.'],
            ['Voice Audio Storage', 'AWS S3', 'Live', 'ap-south-1, presigned URLs for voice file access.'],
            ['Email (OTP)', 'Gmail SMTP', 'Live', 'mail.tasktime@gmail.com — 500 emails/day.'],
            ['Payment Processing', 'Razorpay', 'Live (Test Mode)', 'All 4 subscription variants configured. Webhooks active.'],
        ],
        [2000, 1800, 1200, 4360],
    ),
    sp(),

    // ─── 7.2 Feature Implementation Summary ──────────────
    h2('7.2 Feature Implementation Summary'),
    tbl(
        ['Feature', 'Status', 'Details'],
        [
            ['User Registration + Email OTP Verification', 'Complete', 'SHA-256 hashed OTPs, 10-minute expiry, isUsed flag prevents reuse'],
            ['JWT Dual-Token Auth (Access + Refresh)', 'Complete', '15-min access, 7/30-day refresh, HttpOnly cookie, server-side session table'],
            ['Password Reset via Email OTP', 'Complete', 'Separate OTP purpose = PASSWORD_RESET. tokenVersion incremented on reset.'],
            ['Logout + Logout All Devices', 'Complete', 'Single session deletion + all sessions deletion for user'],
            ['Task CRUD (Full)', 'Complete', 'Create, read, update, soft-delete. Priority, category, dueDate, description.'],
            ['Task Categories', 'Complete', 'User-defined name, colour, icon. Unique per user.'],
            ['Monthly Usage Limits (per plan)', 'Complete', 'FREE: 200 tasks, 50 schedules. PRO: 300/100. PRO_PLUS: 1000/500.'],
            ['Task Completion Tracking', 'Complete', 'TaskDailyCompletion records per task per date. Streak calculation.'],
            ['Schedule Management (4 recurrence types)', 'Complete', 'NONE, DAILY, WEEKLY (specific days), MONTHLY — all functional'],
            ['Schedule Conflict Detection', 'Complete', 'appliesOnDate() checks all recurring types before allowing new schedule'],
            ['Schedule Completion Tracking', 'Complete', 'ScheduleCompletion unique per (scheduleId, date). Duplicate prevention.'],
            ['Nightly Missed Schedule Cron (00:05 UTC)', 'Complete', 'MissedSchedule records written atomically. skipDuplicates: true.'],
            ['Dashboard Overview API', 'Complete', 'Today\'s workload, upcoming schedules, score, streak in single response'],
            ['Behavioral Logging (Mood/Sleep/Exercise)', 'Complete', 'Daily upsert via @@unique([userId, date]). Integrated into AI context.'],
            ['Productivity Score Algorithm', 'Complete', '70% task execution + 30% behavioral health. Clamped 0–100.'],
            ['AI Chat — Gemini 1.5 Flash', 'Complete', '5-node LangGraph pipeline. Native tool calling. Streaming.'],
            ['AI Chat — GPT-4o Mini', 'Complete', '5-node LangGraph pipeline. OpenAI tool calling. Streaming.'],
            ['AI Chat — Sarvam-M', 'Complete', 'Custom 4-node JSON routing. 95% accuracy. Free tier access.'],
            ['AI Chat — Sarvam-30B', 'Integrated', 'OpenAI-compatible API. Marked "Coming Soon" pending extended testing.'],
            ['Streaming AI Responses (SSE)', 'Complete', 'Token-by-token streaming from LangGraph to browser via chunked transfer'],
            ['Voice STT — Sarvam Saaras v3', 'Complete', 'Indian accent transcription. Pro+ plan only. 8 credits/min.'],
            ['Voice STT — OpenAI Whisper', 'Complete', 'Universal transcription. Pro+ plan only. 10 credits/min.'],
            ['Voice TTS — Sarvam Bulbul v3', 'Complete', '14 Indian speaker voices. Auto language detection. 15 credits/min.'],
            ['Voice TTS — OpenAI TTS-1', 'Complete', 'English-optimised voice output. 20 credits/min.'],
            ['React Native Android App — Auth Screens', 'Complete', '6 screens: Intro, Login, Register (password strength), OTP, ForgotPassword, ResetPassword. Staggered animations, shared design tokens.'],
            ['React Native Android App — Core Screens', 'Complete', 'Home dashboard, Tasks, Today view, Schedule/Calendar, Profile, Settings, Billing. Full feature parity with web.'],
            ['React Native Android App — Navigation', 'Complete', 'Custom animated bottom tab bar, stack navigators, auth gate. Root → Auth or Main navigator.'],
            ['React Native Android App — Auth & Storage', 'Complete', 'JWT auto-refresh via Axios interceptor. Tokens stored in MMKV (encrypted, synchronous).'],
            ['React Native Android App — AI Screen', 'Complete', 'Redirects to web platform. Native AI assistant planned for v1.1.'],
            ['Android Release APK', 'Complete', 'Signed APK published on GitHub Releases. v1.0.0-alpha. Direct download link available.'],
            ['Razorpay Subscription Billing', 'Complete', 'PRO + PRO_PLUS × MONTHLY + YEARLY = 4 variants. Webhook verified.'],
            ['Credit Top-Up Packages', 'Complete', '200/450/1000 credit packs at ₹29/₹49/₹99. Razorpay order API.'],
            ['Atomic Credit Deduction', 'Complete', 'Prisma $transaction(). Subscription credits consumed before top-up.'],
            ['AiCreditLedger Audit Trail', 'Complete', 'Immutable record for every credit transaction. Source + reason logged.'],
            ['Calendar View (Day/Week/Month)', 'Complete', 'Recurring schedules virtually expanded on frontend using appliesOnDate().'],
        ],
        [3000, 1400, 4960],
    ),
    sp(),

    // ─── 7.3 Test Reports ────────────────────────────────
    h2('7.3 Test Reports'),

    h3('7.3.1 Summary Test Results'),
    tbl(
        ['Test Category', 'Total Cases', 'Passed', 'Failed', 'Pass Rate'],
        [
            ['Unit Tests — Date Utilities (appliesOnDate)', '9', '9', '0', '100%'],
            ['Unit Tests — Scoring Algorithm', '8', '8', '0', '100%'],
            ['Integration Tests — Authentication', '13', '13', '0', '100%'],
            ['Integration Tests — Task Management', '7', '7', '0', '100%'],
            ['Integration Tests — Schedule Management', '7', '7', '0', '100%'],
            ['AI Behavior Tests — Sarvam-M Intent Parsing', '40', '38', '2', '95%'],
            ['Security Tests', '10', '10', '0', '100%'],
            ['Performance Tests', '10', '10', '0', '100%'],
            ['OVERALL', '104', '102', '2', '98%'],
        ],
        [2800, 1500, 1200, 1200, 1400],
    ),
    sp(),

    h3('7.3.2 User Acceptance Testing'),
    jpp('Informal user acceptance testing was conducted with 8 volunteers (5 students, 2 freelancers, 1 professional) over a two-week period. Key feedback and observations:'),
    sp(),
    tbl(
        ['User Observation', 'Frequency', 'Action Taken'],
        [
            ['"The AI chat creates tasks and schedules immediately — feels like magic"', '7/8 users', 'No change needed — core value proposition validated'],
            ['"I didn\'t realise tasks with due dates can\'t be scheduled"', '4/8 users', 'Added tooltip on UI + updated AI confirmation messages to be clearer'],
            ['"The streaming response makes it feel alive"', '6/8 users', 'Streaming confirmed as essential UX differentiator'],
            ['"Voice assistant in Hindi is surprisingly accurate"', '3 Hindi-speaking users', 'Sarvam Saaras STT validated for Indian English and Hindi'],
            ['"₹29/month is very reasonable for the features offered"', '8/8 users', 'Pricing validated for target Indian market'],
            ['"Dashboard score gives me daily accountability"', '6/8 users', 'Behavioral scoring feature validated as motivating'],
        ],
        [3500, 1500, 4360],
    ),
    sp(),

    // ─── 7.4 Discussion ──────────────────────────────────
    h2('7.4 Discussion'),

    h3('7.4.1 AI Architecture — The Dual-Path Innovation'),
    jpp('The most significant technical achievement in TASKTIME is the dual-path AI architecture that handles the fundamental incompatibility between tool-capable and chat-only AI models. Before implementing the custom Sarvam-M routing system, all attempts to use Sarvam-M for task management through a standard LangGraph pipeline failed because the model could not generate structured tool_call output — it would simply describe what it intended to do in plain text rather than invoking the tool.'),
    sp(),
    jpp('The custom 4-node JSON routing graph solves this elegantly: instead of asking the model to produce tool_call format output (which it cannot), the system asks it to produce a specific JSON structure that the executor can interpret. The key insight was that a model without tool-calling capability can still be used for autonomous task management if the "tool routing" is moved from the model\'s output format to the application layer\'s parsing and dispatch logic. This approach achieved 95% accuracy — competitive with native tool-calling models for structured task management operations.'),
    sp(),

    h3('7.4.2 Behavioral Scoring — Clinical Grounding'),
    jpp('The productivity scoring algorithm\'s 70/30 weighting between task execution and behavioral health was not arbitrary. Academic literature on performance psychology consistently identifies sleep quality, physical exercise, and emotional state as the three primary modifiable predictors of cognitive performance. By incorporating these factors into a daily productivity metric, TASKTIME creates a feedback loop that encourages users to maintain healthy habits alongside task completion.'),
    sp(),
    jpp('In user acceptance testing, 6 of 8 participants reported that the daily behavioral score created a sense of accountability they had not experienced with other task managers. One participant specifically noted: the score helped me realise that the reason I was completing only 40% of my tasks was because I had been sleeping poorly all week — not because I was bad at planning.'),
    sp(),

    h3('7.4.3 Pricing Strategy — Indian Market Focus'),
    jpp('TASKTIME\'s pricing at ₹29/month for the PRO plan represents a deliberate positioning decision. This price point is: (1) lower than a single cup of coffee at a café, (2) accessible on a student\'s monthly pocket money, and (3) still 10 times higher than ₹0, creating the psychological commitment that drives regular usage. The credit-based top-up system allows power users who exceed their monthly credit allocation to pay incrementally rather than being forced to upgrade plans, reducing churn.'),
    sp(),

    h3('7.4.4 Zero Infrastructure Cost — Proof of Concept'),
    jpp('TASKTIME demonstrates that a production-quality SaaS application with AI features, voice processing, payment integration, and global deployment can be built with ₹0 monthly fixed infrastructure cost. This is significant for BCA students who want to build real products but assume cloud infrastructure costs will be prohibitive. Vercel + Supabase + Gemini free tier + Gmail SMTP is a viable zero-cost stack for early-stage SaaS products up to hundreds of monthly active users.'),

    pb(),
];

module.exports = { content };