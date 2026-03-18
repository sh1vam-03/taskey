/**
 * 010_appendix.js
 * ─────────────────────────────────────────
 * Appendix A — Complete API Reference
 * Appendix B — Technical Glossary
 * Appendix C — Project Timeline
 * Appendix D — Third-Party Library Licences
 * ─────────────────────────────────────────
 */

const { h1, h2, h3, jpp, sp, pb, tbl } = require('./helpers');

const content = [

    h1('APPENDIX'),

    // ─── Appendix A — API Reference ──────────────────────
    h2('Appendix A: Complete API Endpoint Reference'),
    jpp('All TASKTIME REST API endpoints. Base URL: /api. All endpoints except Auth and Public require a valid Authorization: Bearer <accessToken> header or the HttpOnly accessToken cookie. Standard response format: { success: boolean, message: string, data: object | array }.'),
    sp(),
    tbl(
        ['Module', 'Method', 'Endpoint', 'Auth', 'Description'],
        [
            // Auth
            ['Auth', 'POST', '/auth/signup', 'None', 'Register new user. Sends OTP email.'],
            ['Auth', 'POST', '/auth/verify-otp', 'None', 'Verify OTP code. Activates account.'],
            ['Auth', 'POST', '/auth/login', 'None', 'Login. Returns access token + sets HttpOnly refresh cookie.'],
            ['Auth', 'POST', '/auth/refresh-token', 'Cookie', 'Exchange refresh cookie for new access token.'],
            ['Auth', 'POST', '/auth/logout', 'Token', 'Invalidate current session. Clear cookies.'],
            ['Auth', 'POST', '/auth/logout-all', 'Token', 'Invalidate ALL sessions for this user.'],
            ['Auth', 'POST', '/auth/otp-request', 'None', 'Resend OTP email to registered address.'],
            ['Auth', 'POST', '/auth/forgot-password', 'None', 'Send password reset OTP to email.'],
            ['Auth', 'POST', '/auth/reset-password', 'None', 'Reset password using valid OTP.'],
            ['Auth', 'GET', '/auth/me', 'Token', 'Get current authenticated user profile.'],
            ['Auth', 'PATCH', '/auth/me', 'Token', 'Update user profile fields (name, timezone, AI model preferences).'],
            ['Auth', 'DELETE', '/auth/me', 'Token', 'Permanently delete account and all data.'],
            // Tasks
            ['Tasks', 'GET', '/tasks', 'Token', 'List tasks. Filters: priority, search, categoryId, isArchived, page, limit, sortBy.'],
            ['Tasks', 'POST', '/tasks', 'Token', 'Create task. Body: title, description, priority, dueDate, categoryId.'],
            ['Tasks', 'GET', '/tasks/:id', 'Token', 'Get single task with category and completion data.'],
            ['Tasks', 'PATCH', '/tasks/:id', 'Token', 'Update task fields (partial update supported).'],
            ['Tasks', 'DELETE', '/tasks/:id', 'Token', 'Soft-delete task (sets deletedAt timestamp).'],
            ['Tasks', 'POST', '/tasks/:id/complete', 'Token', 'Mark task complete for today (TaskDailyCompletion).'],
            ['Tasks', 'DELETE', '/tasks/:id/complete', 'Token', 'Undo today\'s task completion.'],
            // Categories
            ['Categories', 'GET', '/categories', 'Token', 'List user\'s categories.'],
            ['Categories', 'POST', '/categories', 'Token', 'Create category: name, color, icon.'],
            ['Categories', 'PATCH', '/categories/:id', 'Token', 'Update category name/color/icon.'],
            ['Categories', 'DELETE', '/categories/:id', 'Token', 'Delete category (tasks become uncategorised).'],
            // Schedules
            ['Schedules', 'GET', '/schedules', 'Token', 'List schedules. Filters: from, to, taskId.'],
            ['Schedules', 'POST', '/schedules', 'Token', 'Create schedule with conflict detection. Body: taskId, scheduleDate, startTime, endTime, recurrence, repeatOnDays, repeatUntil.'],
            ['Schedules', 'PATCH', '/schedules/:id', 'Token', 'Update schedule time fields.'],
            ['Schedules', 'DELETE', '/schedules/:id', 'Token', 'Delete schedule.'],
            ['Schedules', 'POST', '/schedules/:id/complete', 'Token', 'Mark schedule occurrence complete for date.'],
            ['Schedules', 'DELETE', '/schedules/:id/complete', 'Token', 'Undo schedule completion for date.'],
            // Calendar
            ['Calendar', 'GET', '/calendar/range', 'Token', 'Get schedule calendar for date range. Query: from, to (YYYY-MM-DD).'],
            ['Calendar', 'GET', '/calendar/day/:date', 'Token', 'Get all schedules applying to a single date.'],
            // Dashboard
            ['Dashboard', 'GET', '/dashboard/overview', 'Token', 'Full dashboard: tasks, schedules, score, streak, upcoming events.'],
            ['Dashboard', 'GET', '/dashboard/today', 'Token', 'Today\'s task and schedule timeline only.'],
            // Behavior
            ['Behavior', 'POST', '/behavior', 'Token', 'Log or update daily behavior (upsert by date). Body: mood, sleepHours, exercise, notes.'],
            ['Behavior', 'GET', '/behavior/:date', 'Token', 'Get behavior log for specific date (YYYY-MM-DD).'],
            ['Behavior', 'GET', '/behavior/history', 'Token', 'Get last 30 days of behavior logs.'],
            // AI
            ['AI', 'GET', '/ai/conversations', 'Token', 'List all AI conversations.'],
            ['AI', 'POST', '/ai/conversations', 'Token', 'Create new conversation. Body: type (GENERAL/DAILY_PLANNING/REFLECTION/VOICE).'],
            ['AI', 'GET', '/ai/conversations/:id/messages', 'Token', 'Get all messages in a conversation.'],
            ['AI', 'POST', '/ai/conversations/:id/message', 'Token', 'Send message (non-streaming). Returns complete response.'],
            ['AI', 'POST', '/ai/conversations/:id/stream', 'Token', 'Send message (streaming SSE). Streams tokens as plain text.'],
            ['AI', 'DELETE', '/ai/conversations/:id', 'Token', 'Delete conversation and all its messages.'],
            // Voice
            ['Voice', 'POST', '/voice/stt', 'Token (Pro+)', 'Speech-to-text. Body: multipart/form-data audio file. Returns transcription text.'],
            ['Voice', 'POST', '/voice/tts', 'Token (Pro+)', 'Text-to-speech. Body: text. Returns S3 presigned URL for audio playback.'],
            // Billing
            ['Billing', 'POST', '/billing/subscribe', 'Token', 'Create Razorpay subscription. Body: plan (PRO/PRO_PLUS), billingCycle (MONTHLY/YEARLY).'],
            ['Billing', 'POST', '/billing/topup', 'Token', 'Create credit top-up order. Body: packageId (CREDIT_200/CREDIT_450/CREDIT_1000).'],
            ['Billing', 'GET', '/billing/current', 'Token', 'Get current subscription status, credit balance, next billing date.'],
            ['Billing', 'POST', '/billing/cancel', 'Token', 'Cancel subscription (effective at end of current billing cycle).'],
            ['Billing', 'GET', '/billing/ledger', 'Token', 'Get credit transaction history (AiCreditLedger).'],
            // Webhook
            ['Webhook', 'POST', '/webhook/razorpay', 'HMAC', 'Razorpay event handler. Verified via HMAC-SHA256 signature.'],
            // Public
            ['Public', 'GET', '/health', 'None', 'Server health check. Returns { status: "ok", uptime }.'],
            ['Public', 'POST', '/contact', 'None', 'Submit contact form message. Body: name, email, subject, message.'],
        ],
        [1300, 700, 2300, 1100, 3960],
    ),
    sp(),

    // ─── Appendix B — Glossary ───────────────────────────
    h2('Appendix B: Technical Glossary'),
    sp(),
    tbl(
        ['Term', 'Definition'],
        [
            ['SaaS (Software-as-a-Service)', 'Cloud-hosted software accessed via browser subscription rather than installed locally. TASKTIME is a SaaS product.'],
            ['API (Application Programming Interface)', 'Defined contract of endpoints enabling two software systems to communicate. TASKTIME\'s backend exposes a REST API consumed by the frontend.'],
            ['REST (Representational State Transfer)', 'Architectural style for web APIs using HTTP verbs (GET, POST, PATCH, DELETE) and stateless request/response.'],
            ['JWT (JSON Web Token)', 'Compact, URL-safe token format for securely transmitting authentication claims between parties. RFC 7519.'],
            ['HttpOnly Cookie', 'Browser cookie inaccessible to JavaScript, protecting it from XSS attacks. TASKTIME stores the refresh token as an HttpOnly cookie.'],
            ['OTP (One-Time Password)', 'Single-use verification code. In TASKTIME: 6-digit code, 10-minute expiry, SHA-256 hashed in database.'],
            ['bcrypt', 'Password hashing algorithm designed to be computationally expensive, resisting brute-force attacks. TASKTIME uses cost factor 10.'],
            ['HMAC (Hash-based Message Authentication Code)', 'Cryptographic technique for verifying message integrity using a shared secret key. Used for Razorpay webhook verification.'],
            ['JWT Token Rotation', 'Issuing a new access token AND refresh token on every refresh request. Prevents replay attacks with stolen refresh tokens.'],
            ['LLM (Large Language Model)', 'AI model trained on massive text corpora to understand and generate human language. E.g., Gemini 1.5 Flash, GPT-4o Mini.'],
            ['Tool Calling (Function Calling)', 'AI model capability to identify when an external function should be called and output the function name and parameters in structured JSON.'],
            ['LangGraph', 'LangChain Inc.\'s framework for building stateful, multi-node AI agent workflows as directed graphs. Used for TASKTIME\'s 5-node AI pipeline.'],
            ['Agentic AI', 'AI system that can autonomously plan and execute multi-step actions (using tools) to accomplish a goal, rather than just generating text responses.'],
            ['SSE (Server-Sent Events)', 'HTTP protocol for server-to-browser one-way data streaming. TASKTIME uses SSE for real-time AI response token streaming.'],
            ['STT (Speech-to-Text)', 'Converting spoken audio to written text. TASKTIME integrates Sarvam Saaras v3 and OpenAI Whisper.'],
            ['TTS (Text-to-Speech)', 'Converting written text to synthesised audio. TASKTIME integrates Sarvam Bulbul v3 (14 Indian voices) and OpenAI TTS-1.'],
            ['ORM (Object-Relational Mapping)', 'Database access via object-oriented API instead of raw SQL. TASKTIME uses Prisma ORM 6.'],
            ['UUID (Universally Unique Identifier)', '128-bit globally unique ID. TASKTIME uses UUIDs as primary keys for all 18 database tables to prevent enumeration attacks.'],
            ['Soft Delete', 'Marking records as deleted via a deletedAt timestamp without physically removing them, preserving data for analytics.'],
            ['Prisma Transaction ($transaction)', 'Executing multiple database operations atomically — all succeed together or all are rolled back. Used for credit deduction.'],
            ['Sarvam AI', 'Indian AI company building language models, STT, and TTS systems optimised for Indic languages. Backed by Government of India IndiaAI Mission.'],
            ['Razorpay', 'India\'s leading payment gateway. TASKTIME uses Razorpay for subscription billing and one-time credit top-up purchases.'],
            ['Supabase', 'Open-source Firebase alternative providing managed PostgreSQL as a service. TASKTIME\'s database runs on Supabase free tier.'],
            ['Vercel', 'Cloud platform by the Next.js creators. TASKTIME\'s frontend is deployed on Vercel with automatic CI/CD on git push.'],
            ['CORS (Cross-Origin Resource Sharing)', 'HTTP mechanism allowing browsers to make API requests to a different domain than the page origin. Required for TASKTIME frontend → backend communication.'],
            ['Webhook', 'HTTP callback where one system notifies another of events in real-time by sending a POST request. Razorpay sends webhooks on payment events.'],
            ['Cron Job', 'Time-based task scheduler executing background processes at specified intervals. TASKTIME runs 3 cron jobs: missed schedules, credit expiry, yearly drip.'],
            ['CDN (Content Delivery Network)', 'Globally distributed network serving static assets from the nearest edge location to the user. Vercel\'s CDN serves TASKTIME\'s frontend globally.'],
        ],
        [2800, 6560],
    ),
    sp(),

    // ─── Appendix C — Project Timeline ───────────────────
    h2('Appendix C: Project Timeline'),
    sp(),
    tbl(
        ['Phase', 'Timeline', 'Key Deliverables', 'Team Members'],
        [
            ['Phase 1: Research & Architecture', 'July – August 2025', 'Technology selection document, ER diagram, system architecture diagram, Prisma schema v1, scrum backlog', 'All 3'],
            ['Phase 2: Authentication & Database', 'August – September 2025', 'Working signup/login/OTP/JWT system, Prisma migrations, Supabase connection established', 'Atharv, Balaji'],
            ['Phase 3: Task & Schedule Core', 'September – October 2025', 'Full task CRUD, schedule creation, conflict detection with appliesOnDate(), category management', 'Atharv, Balaji'],
            ['Phase 4: Dashboard & Scoring', 'October 2025', 'Dashboard API, productivity score algorithm, streak tracking, behavioral logging', 'Balaji'],
            ['Phase 5: AI Pipeline (Tool-Calling Models)', 'October – November 2025', 'LangGraph 5-node graph, all 12 tool definitions, Gemini + GPT-4o-mini integration, streaming SSE', 'Hanumant'],
            ['Phase 6: Sarvam-M Custom Router', 'November 2025', 'Custom 4-node JSON routing graph, intent prompt, executor, 95% accuracy achieved', 'Hanumant'],
            ['Phase 7: Voice System', 'November – December 2025', 'Sarvam Saaras STT, Bulbul TTS, Whisper, TTS-1, S3 audio storage, Pro+ plan enforcement', 'Balaji'],
            ['Phase 8: Billing System', 'December 2025', 'Razorpay subscriptions, credit top-ups, HMAC webhook handler, atomic credit deduction', 'Balaji'],
            ['Phase 9: Frontend Development', 'October 2025 – January 2026', 'All pages: landing, dashboard, tasks, schedules, calendar, AI chat, billing, settings, profile', 'Hanumant + Atharv'],
            ['Phase 10: Testing, Deployment & Report', 'January – March 2026', 'Full test suite, bug fixes, production deployment on Vercel, final project report writing', 'All 3'],
        ],
        [2200, 1600, 3400, 1800],
    ),
    sp(),

    // ─── Appendix D — Library Licences ───────────────────
    h2('Appendix D: Third-Party Library and Service Licences'),
    sp(),
    tbl(
        ['Library / Service', 'Version', 'Licence', 'Usage in TASKTIME'],
        [
            ['Next.js', '16.1.0', 'MIT', 'Frontend React framework and deployment platform'],
            ['React', '19.2.3', 'MIT', 'UI component library'],
            ['Tailwind CSS', '4.0', 'MIT', 'Utility-first CSS styling'],
            ['Framer Motion', '12.32.0', 'MIT', 'UI animations and page transitions'],
            ['Recharts', '3.7.0', 'MIT', 'Productivity score and behavior charts'],
            ['Lucide React', '0.563.0', 'ISC', 'SVG icon library'],
            ['React Hook Form', '7.71.1', 'MIT', 'Form state management'],
            ['Axios', '1.13.4', 'MIT', 'HTTP client with token refresh interceptor'],
            ['react-markdown', '10.1.0', 'MIT', 'Markdown rendering for AI responses'],
            ['date-fns', '4.1.0', 'MIT', 'Date manipulation utilities'],
            ['date-fns-tz', '3.2.0', 'MIT', 'Timezone-aware date operations'],
            ['Express.js', '5.2.1', 'MIT', 'Backend web framework'],
            ['Prisma ORM', '6.19.1', 'Apache 2.0', 'Type-safe database ORM'],
            ['@prisma/client', '6.19.1', 'Apache 2.0', 'Auto-generated database client'],
            ['bcryptjs', '3.0.3', 'MIT', 'Password hashing'],
            ['jsonwebtoken', '9.0.3', 'MIT', 'JWT signing and verification'],
            ['nodemailer', '8.0.1', 'MIT', 'Email sending via SMTP'],
            ['node-cron', '4.2.1', 'ISC', 'Background job scheduling'],
            ['multer', '2.0.2', 'MIT', 'Multipart file upload for voice audio'],
            ['helmet', '8.0.0', 'MIT', 'HTTP security headers'],
            ['cors', '2.8.5', 'MIT', 'Cross-Origin Resource Sharing middleware'],
            ['razorpay', '2.9.6', 'MIT', 'Razorpay payment gateway SDK'],
            ['langchain', '1.2.25', 'MIT', 'AI framework — tools, prompts, models'],
            ['langgraph', '1.1.5', 'MIT', 'Stateful AI agent graph orchestration'],
            ['@langchain/google-genai', '2.1.20', 'MIT', 'Google Gemini 1.5 Flash integration'],
            ['@langchain/openai', '1.2.2', 'MIT', 'OpenAI GPT-4o-mini + Sarvam AI integration'],
            ['zod', '3.x', 'MIT', 'Runtime schema validation for AI tools'],
            ['@aws-sdk/client-s3', '3.x', 'Apache 2.0', 'AWS S3 voice audio file storage'],
        ],
        [2200, 1200, 1500, 4460],
    ),

    pb(),
];

module.exports = { content };