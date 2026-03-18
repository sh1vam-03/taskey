/**
 * 02_survey_of_technologies.js
 * ─────────────────────────────────────────
 * CHAPTER 2 — Survey of Technologies
 * ─────────────────────────────────────────
 */

const { h1, h2, h3, h4, jpp, jp, bul, sp, sp2, pb, tbl, codeBlock } = require('./helpers');

const content = [

    h1('CHAPTER 2: SURVEY OF TECHNOLOGIES'),

    jpp('This chapter provides a comprehensive technical survey of every technology, library, framework, and external service used in the development of TASKTIME. For each technology, the discussion covers what it is, why it was selected over alternatives, and how it is used within the project. Understanding this technology landscape is essential context for the system design and implementation chapters that follow.'),
    sp(),

    // ─── 2.1 Frontend ────────────────────────────────────
    h2('2.1 Frontend Technologies'),

    h3('2.1.1 Next.js 16'),
    jpp('Next.js, developed and maintained by Vercel Inc., is the world\'s most widely adopted React framework. It adds server-side rendering (SSR), static site generation (SSG), and the App Router (introduced in Next.js 13) on top of standard React, while providing zero-configuration deployment on Vercel\'s global edge network.'),
    sp(),
    jpp('TASKTIME uses Next.js 16.1.0 with the App Router. The App Router\'s route groups allow clean separation between public pages (landing, pricing, about) and authenticated dashboard routes — without requiring a separate routing configuration file. Next.js also handles environment variable injection, API route proxying during development, and image optimisation automatically. The tight integration with Vercel means every git push to the main branch triggers an automatic production deployment with global CDN distribution.'),
    sp(),
    tbl(
        ['Feature', 'How TASKTIME Uses It'],
        [
            ['App Router (file-based routing)', 'Route groups: (public) for landing pages, (dashboard) for authenticated views'],
            ['Server Components', 'Static public pages rendered on server — faster initial load, better SEO'],
            ['Client Components', "'use client' for interactive dashboard, AI chat, calendar, forms"],
            ['Middleware', 'Auth middleware redirects unauthenticated users away from dashboard routes'],
            ['Environment Variables', 'NEXT_PUBLIC_ prefix exposes API base URL to browser; backend secrets stay server-side'],
            ['Vercel Deployment', 'Zero-config CI/CD — every commit auto-deploys with preview URLs'],
        ],
        [3000, 6360],
    ),
    sp(),

    h3('2.1.2 React 19'),
    jpp('React 19, released by Meta in 2024, is the latest major version of the world\'s most popular UI component library. Key improvements in React 19 relevant to TASKTIME include improved concurrent rendering performance, better streaming support, and the new Actions API for form handling. React\'s component model with hooks (useState, useEffect, useContext, useCallback, useMemo) forms the entire UI logic layer of TASKTIME\'s frontend.'),
    jpp('TASKTIME makes heavy use of React\'s streaming capabilities for the AI chat interface — the streaming AI response from the backend is progressively rendered into the chat bubble as tokens arrive, creating the familiar "typing" effect. React 19\'s improved reconciler handles this high-frequency state update efficiently without performance degradation.'),
    sp(),

    h3('2.1.3 Tailwind CSS 4'),
    jpp('Tailwind CSS is a utility-first CSS framework that eliminates the need to write custom CSS files by providing thousands of pre-composed utility classes directly in JSX markup. Version 4 (released 2025) introduces a significant performance improvement: a Rust-based build engine that is 5× faster than the previous JavaScript implementation, and a new CSS-first configuration model.'),
    jpp('TASKTIME\'s entire visual design is built with Tailwind classes. There are no custom CSS files in the project. This approach dramatically reduces the context-switching cost of frontend development — designers and developers work entirely within the component file. Tailwind\'s responsive prefixes (sm:, md:, lg:) make the dashboard fully responsive across mobile and desktop without media query boilerplate.'),
    sp(),

    h3('2.1.4 Supporting Frontend Libraries'),
    tbl(
        ['Library', 'Version', 'Purpose in TASKTIME'],
        [
            ['Lucide React', '0.563.0', 'Consistent SVG icon library — used for task priority icons, sidebar navigation, action buttons'],
            ['Framer Motion', '12.32.0', 'Smooth page transitions, animated sidebar, staggered list item entrances, loading states'],
            ['Recharts', '3.7.0', 'Productivity score chart, behavioral trend graphs on the dashboard'],
            ['React Hook Form', '7.71.1', 'Form state management for task creation, schedule forms — zero re-renders on keystroke'],
            ['Axios', '1.13.4', 'HTTP client with interceptors for automatic JWT token refresh on 401 responses'],
            ['react-markdown', '10.1.0', 'Renders AI assistant responses with markdown formatting, code blocks, tables'],
            ['date-fns + date-fns-tz', '4.1.0 + 3.2.0', 'Date manipulation for calendar view, timezone-aware date display, schedule rendering'],
            ['Zustand / React Context', '—', 'Global auth state (user object, credits balance, active model) — no Redux complexity'],
        ],
        [2000, 1200, 6160],
    ),
    sp(),

    // ─── 2.2 Backend ─────────────────────────────────────
    h2('2.2 Backend Technologies'),

    h3('2.2.1 Node.js v22 LTS'),
    jpp('Node.js is the JavaScript runtime that powers TASKTIME\'s backend server. Built on Chrome\'s V8 JavaScript engine, Node.js uses a non-blocking, event-driven I/O model that makes it exceptionally efficient for I/O-bound operations — exactly the profile of a web application backend making database queries, external API calls to AI services, and file operations for voice processing.'),
    jpp('TASKTIME uses Node.js v22 LTS (Long Term Support), chosen for its stability guarantees (maintenance until April 2027). The native support for ES Modules (import/export), top-level await, and the built-in crypto module (used for SHA-256 OTP hashing and HMAC verification) in v22 eliminated several dependency requirements that older Node versions would have needed.'),
    sp(),

    h3('2.2.2 Express.js 5'),
    jpp('Express.js is the minimal, unopinionated web framework for Node.js that provides HTTP routing, middleware chaining, and request/response handling. TASKTIME uses Express 5.2.1, the latest major version released in 2024. The most significant improvement in Express 5 over Express 4 is native async/await error handling — async route handlers that throw errors are automatically passed to Express\'s error middleware without requiring manual try/catch blocks in every controller. This eliminated significant boilerplate from TASKTIME\'s codebase.'),
    sp(),
    ...codeBlock([
        '// Express 5: async errors automatically forwarded to error middleware',
        'router.post("/tasks", authenticate, usageLimit, async (req, res) => {',
        '  const task = await taskService.create(req.user.id, req.body);',
        '  res.status(201).json({ success: true, data: task });',
        '  // No try/catch needed — thrown errors go to global error handler',
        '});',
    ]),
    sp(),

    h3('2.2.3 Prisma ORM 6'),
    jpp('Prisma is the next-generation Object-Relational Mapping (ORM) tool for Node.js and TypeScript. Unlike traditional ORMs (Sequelize, TypeORM) that use class decorators and runtime type checking, Prisma generates a fully type-safe client from the declarative schema.prisma file at build time. Every database query is auto-completed by the IDE and verified at compile time — making an entire class of data access bugs impossible.'),
    sp(),
    jpp('TASKTIME\'s schema.prisma defines 18 models and 15 enums, from which Prisma generates the complete database client. The schema acts as the single source of truth for both the database structure (via prisma migrate) and the JavaScript/TypeScript types used throughout the backend. Prisma\'s transaction API ($transaction) is used for the atomic credit deduction logic — ensuring that subscription credits and top-up credits are decremented together with the audit ledger record in a single ACID transaction.'),
    sp(),

    h3('2.2.4 Supporting Backend Libraries'),
    tbl(
        ['Library', 'Version', 'Purpose'],
        [
            ['bcryptjs', '3.0.3', 'Password hashing with cost factor 10. Adaptive hashing resists brute-force attacks.'],
            ['jsonwebtoken', '9.0.3', 'JWT access token signing (15-min expiry) and refresh token signing (7-day / 30-day).'],
            ['cookie-parser', '1.4.7', 'Parse HttpOnly cookies for refresh token extraction on every request.'],
            ['nodemailer', '8.0.1', 'Send OTP, welcome, and password-reset emails via Gmail SMTP (mail.tasktime@gmail.com).'],
            ['node-cron', '4.2.1', 'Schedule three background jobs: missed schedule detection, credit expiry, yearly credit drip.'],
            ['multer', '2.0.2', 'Multipart/form-data parser for voice audio file uploads to the STT endpoint.'],
            ['helmet', '8.0.0', 'Sets 14 security-related HTTP response headers (CSP, HSTS, X-Frame-Options, etc.).'],
            ['morgan', '1.10.0', 'HTTP request logging in dev:combined format for debugging API calls.'],
            ['zod', '3.x', 'Runtime schema validation for AI tool call parameters before service execution.'],
            ['cors', '2.8.5', 'Cross-origin resource sharing — allows frontend (Vercel domain) to call backend API.'],
        ],
        [2000, 1200, 6160],
    ),
    sp(),

    // ─── 2.3 Database ────────────────────────────────────
    h2('2.3 Database Technologies'),

    h3('2.3.1 PostgreSQL 16'),
    jpp('PostgreSQL is the world\'s most advanced open-source relational database system, with over 35 years of active development. TASKTIME uses PostgreSQL 16 for its unmatched combination of reliability, advanced SQL feature support, and native support for data types critical to the project: UUID primary keys (preventing enumeration attacks), native array types (Int[] for WEEKLY schedule\'s repeatOnDays field), ENUM types for type-safe status fields, and partial indexes for performance-critical queries.'),
    sp(),
    jpp('The database is hosted on Supabase\'s free tier in the AWS ap-south-1 (Mumbai) region, giving Indian users the lowest possible network latency. Supabase provides connection pooling (via PgBouncer), automatic backups, and a management dashboard. The free tier\'s 500 MB storage limit is sufficient for the current user scale, with a straightforward upgrade path.'),
    sp(),

    h3('2.3.2 Database Design Principles'),
    tbl(
        ['Principle', 'Implementation in TASKTIME'],
        [
            ['Third Normal Form (3NF)', 'All non-key attributes depend only on the primary key. No transitive dependencies. Eliminates update anomalies.'],
            ['UUID Primary Keys', 'All 18 tables use @default(uuid()) as the primary key. Prevents sequential ID enumeration and enables distributed ID generation.'],
            ['Soft Deletion', 'Tasks use deletedAt DateTime? — records marked deleted rather than physically removed. Preserves data for analytics.'],
            ['Cascade Deletes', 'All foreign keys include onDelete: Cascade. Deleting a user removes all their tasks, schedules, sessions, AI messages, and payments automatically.'],
            ['Composite Unique Constraints', 'ScheduleCompletion: @@unique([scheduleId, completedOn]) prevents duplicate completions for the same slot on the same day.'],
            ['Strategic Indexing', 'B-Tree indexes on email, userId, scheduleDate, completedOn, createdAt, status — all high-frequency query filters.'],
        ],
        [2500, 6860],
    ),
    sp(),

    // ─── 2.4 AI Technologies ─────────────────────────────
    h2('2.4 AI Technologies'),

    h3('2.4.1 LangChain and LangGraph'),
    jpp('LangChain is the industry-standard framework for building applications powered by large language models. It provides abstractions for model invocation, prompt management, tool definitions, and memory systems that work consistently across different AI providers (OpenAI, Google, Anthropic, etc.). LangGraph, introduced by LangChain Inc. in 2024, extends this with a stateful graph paradigm for building multi-step AI agent workflows.'),
    sp(),
    jpp('In LangGraph, an agent is modelled as a directed graph of nodes (functions) connected by conditional edges. State flows through the graph, being transformed at each node, with edges determining which node executes next. This architecture is ideal for TASKTIME\'s AI pipeline because the agent must sometimes: (1) receive a user message, (2) decide it needs more context, (3) call a tool like "get_dashboard_summary", (4) receive the tool result, (5) call another tool like "create_task", and (6) generate a final response — a multi-step process that a simple single LLM call cannot achieve.'),
    sp(),

    h3('2.4.2 AI Models Integrated'),
    tbl(
        ['Model', 'Provider', 'Type', 'Tool Calling', 'Use Case in TASKTIME'],
        [
            ['gemini-1.5-flash', 'Google', 'LLM', 'Yes (native)', 'Default model. Fastest and most cost-effective. Used for all task/schedule management via 5-node LangGraph pipeline.'],
            ['gpt-4o-mini', 'OpenAI', 'LLM', 'Yes (native)', 'Reasoning-heavy tasks. Excellent at complex multi-step planning. Uses identical 5-node LangGraph pipeline.'],
            ['sarvam-m', 'Sarvam AI', 'LLM', 'No (chat only)', 'Default for FREE users. Used via custom 4-node JSON routing graph. Supports Hindi/Indic.'],
            ['sarvam-30b', 'Sarvam AI', 'LLM', 'Yes (OpenAI-compatible)', 'Large Indic-language model. Full native language task management. 5-node LangGraph pipeline.'],
            ['saaras:v3', 'Sarvam AI', 'STT', 'N/A', 'Speech-to-text for Indian accents. 8 credits/minute. Pro+ users.'],
            ['bulbul:v3', 'Sarvam AI', 'TTS', 'N/A', '14 Indian speaker voices. Auto language detection. 15 credits/minute. Pro+ users.'],
            ['whisper-1', 'OpenAI', 'STT', 'N/A', 'Universal STT. Excellent for English. 10 credits/minute. Pro+ users.'],
            ['tts-1', 'OpenAI', 'TTS', 'N/A', 'Natural English voice output. 20 credits/minute. Pro+ users.'],
        ],
        [1600, 1200, 800, 1200, 4560],
    ),
    sp(),

    h3('2.4.3 Sarvam AI — The Indian AI Platform'),
    jpp('Sarvam AI is an Indian artificial intelligence company founded in 2023, backed by Lightspeed India, Peak XV Partners, and the Government of India\'s IndiaAI Mission. Their mission is to build full-stack AI for India — language models, speech systems, and APIs trained on Indic-language data and optimised for Indian accents, names, cultural references, and linguistic patterns that international models mishandle.'),
    sp(),
    jpp('TASKTIME integrates Sarvam\'s complete model suite. The Sarvam-M model (2B parameters) provides a privacy-safe chat experience with no access to personal user data — ideal for general knowledge queries. The Sarvam-30B model (30B parameters, OpenAI-compatible API) provides full tool-calling capability for task management in Hindi and regional languages. The Saaras v3 STT model achieves significantly better accuracy than OpenAI Whisper for Indian English, Hindi, and Hinglish audio. The Bulbul v3 TTS model provides 14 distinct Indian speaker voices (Anushka, Meera, Kavya, Neel, Maitreyi, etc.) with automatic language detection.'),
    sp(),

    h3('2.4.4 AI Tool Definitions (LangChain DynamicStructuredTool)'),
    jpp('TASKTIME defines the following AI tools using LangChain\'s DynamicStructuredTool with Zod schema validation:'),
    sp(),
    tbl(
        ['Tool Name', 'Parameters', 'Action'],
        [
            ['create_task', 'title, description?, priority?, dueDate?', 'Creates a single task. dueDate must be null unless user explicitly mentioned a deadline.'],
            ['create_tasks_bulk', 'tasks[] (title, priority, dueDate?)', 'Creates multiple tasks in a single call. Used when user says "add these 5 tasks".'],
            ['update_task', 'taskId, title?, description?, priority?, dueDate?', 'Updates any fields of an existing task.'],
            ['delete_task', 'taskId', 'Soft-deletes a task (sets deletedAt timestamp).'],
            ['list_tasks', 'priority?, search?, limit?', 'Retrieves filtered task list to display in AI response.'],
            ['create_schedule', 'taskId, scheduleDate, startTime, endTime, recurrence, repeatOnDays?, repeatUntil?', 'Creates schedule with conflict detection. Requires task with dueDate: null.'],
            ['create_schedules_bulk', 'schedules[]', 'Creates multiple schedule blocks at once.'],
            ['update_schedule', 'scheduleId, scheduleDate?, startTime?, endTime?', 'Modifies schedule time fields.'],
            ['delete_schedule', 'scheduleId', 'Removes a schedule block.'],
            ['log_behavior', 'mood, sleepHours?, exercise?', 'Logs or updates the user\'s daily behavioral data.'],
            ['get_dashboard_summary', '(none)', 'Fetches today\'s workload, streak, score — injected into AI context.'],
            ['web_search', 'query', 'Tavily web search (10 credits/request). For general knowledge questions.'],
        ],
        [2200, 3000, 4160],
    ),
    sp(),

    // ─── 2.5 Deployment Platform ─────────────────────────
    h2('2.5 Mobile Technologies'),

    jpp('TASKTIME is available as a native Android application in addition to the web platform. The mobile app is built using React Native — a framework developed by Meta that allows developers to write JavaScript code that compiles to native Android and iOS components, providing near-native performance without maintaining two separate codebases.'),
    sp(),

    h3('2.5.1 React Native'),
    jpp('React Native 0.76 introduces the New Architecture by default, which replaces the old JavaScript bridge with a direct JSI (JavaScript Interface) for synchronous native communication. This eliminates the performance overhead of serializing and deserializing JSON messages across the bridge for every UI interaction. The result is smoother animations, faster startup times, and better responsiveness for gesture-heavy interfaces like the custom bottom tab bar in TASKTIME.'),
    sp(),

    h3('2.5.2 React Navigation'),
    jpp('React Navigation 6 is the standard navigation library for React Native applications. TASKTIME uses a nested navigation structure: a RootNavigator decides whether to show the AuthNavigator (for unauthenticated users) or the MainNavigator (for authenticated users). The MainNavigator contains a bottom-tab navigator with a custom animated tab bar, and each tab has its own stack navigator for screen-level push/pop transitions.'),
    sp(),

    h3('2.5.3 MMKV — Fast Local Storage'),
    jpp('MMKV is a high-performance key-value storage framework originally developed by WeChat and open-sourced by Tencent. Unlike AsyncStorage (React Native\'s default storage, which is asynchronous and JSON-based), MMKV is synchronous and uses memory-mapped files for reads. Benchmarks show MMKV is 10× faster than AsyncStorage for read operations. TASKTIME uses MMKV to store the JWT access and refresh tokens, ensuring that every API request can synchronously attach the Authorization header without awaiting storage reads.'),
    sp(),

    h3('2.5.4 Zustand for State Management'),
    jpp('Zustand is a lightweight state management library for React and React Native. It uses a minimal API — a single create() function produces a store with get/set — without the boilerplate of Redux reducers and actions. TASKTIME uses three Zustand stores: auth.store.js (user profile and tokens), task.store.js (task list and filters), and ui.store.js (theme preference and UI state). Each store persists its state to MMKV using the zustand/middleware persist adapter.'),
    sp(),

    h3('2.5.5 Hermes JavaScript Engine'),
    jpp('Hermes is a JavaScript engine optimised specifically for React Native, developed by Meta. Unlike V8 (used in Node.js and Chrome), Hermes pre-compiles JavaScript to bytecode at build time rather than at runtime, reducing startup time and memory footprint significantly. TASKTIME enables Hermes in both debug and release builds. On a mid-range Android device, Hermes reduces the time-to-interactive from approximately 3.2 seconds (with JSC) to under 1.5 seconds.'),
    sp(),

    tbl(
        ['Technology', 'Version', 'Purpose in TASKTIME'],
        [
            ['React Native', '0.76+', 'Mobile framework — compiles JS to native Android components'],
            ['React Navigation', '6.x', 'Stack + Tab navigation, auth gate, deep linking'],
            ['Zustand', '4.x', 'Global state — user, tasks, UI preferences'],
            ['MMKV', '3.x', 'Fast synchronous token storage (10× faster than AsyncStorage)'],
            ['Axios', '1.x', 'HTTP client with JWT auto-refresh interceptor'],
            ['react-native-config', '1.x', 'Environment variable injection for .env files'],
            ['react-native-svg', '15.x', 'SVG rendering for app logo and visual elements'],
            ['Hermes', 'Built-in RN 0.76', 'Optimised JS engine — faster startup, lower memory'],
        ],
        [2600, 1400, 5360],
    ),
    sp(),

    h2('2.6 Deployment and Infrastructure'),

    h3('2.6.1 Vercel'),
    jpp('Vercel is the cloud platform created by the same team that built Next.js. It provides the most seamless deployment experience for Next.js applications: connect a GitHub repository, configure environment variables, and every push to the main branch automatically triggers a production deployment. Vercel\'s global CDN serves the frontend from 40+ edge locations worldwide, minimising latency. The Hobby (free) tier supports custom domains, unlimited deployments, and generous bandwidth limits sufficient for academic and early-stage SaaS projects.'),
    sp(),

    h3('2.6.2 Supabase'),
    jpp('Supabase is an open-source Firebase alternative providing managed PostgreSQL as a service. TASKTIME\'s database runs on Supabase\'s free tier in the AWS ap-south-1 (Mumbai) region. Supabase provides PgBouncer connection pooling, a visual database table editor, automatic daily backups, real-time subscription capabilities (not used in TASKTIME currently), and a comprehensive REST and GraphQL API. The free tier allows 500 MB storage, 5 GB bandwidth, and 50,000 monthly active users.'),
    sp(),

    h3('2.6.3 AWS S3'),
    jpp('Amazon Web Services Simple Storage Service (S3) is used in TASKTIME to store the audio files generated by the Text-to-Speech system. When a user uses the voice assistant, the TTS service generates an MP3 audio file of the AI\'s response. This file is uploaded to an S3 bucket in ap-south-1, and a time-limited presigned URL is returned to the frontend for immediate audio playback. S3\'s durability (99.999999999%), availability, and pay-per-use pricing make it ideal for this use case.'),
    sp(),

    h3('2.6.4 Razorpay'),
    jpp('Razorpay is India\'s leading payment gateway, processing payments from over 8 million businesses. TASKTIME uses the Razorpay Subscriptions API for recurring billing and the Razorpay Orders API for one-time credit top-up purchases. Razorpay supports all major Indian payment methods: UPI (PhonePe, GPay, Paytm), net banking (50+ banks), credit and debit cards (Visa, Mastercard, RuPay), and wallets. Zero monthly fee with 2% per-transaction pricing makes it economically viable for a student-built SaaS with low initial transaction volume.'),
    sp(),

    h3('2.5.5 Gmail SMTP / Nodemailer'),
    jpp('TASKTIME sends transactional emails — OTP for email verification, password reset links, and welcome emails — via Gmail SMTP using the Nodemailer library. The dedicated email account mail.tasktime@gmail.com is configured with an App Password for SMTP authentication, separate from the account password. Gmail SMTP\'s free tier supports 500 emails/day, sufficient for the current user scale. This approach eliminates the cost of dedicated email services like SendGrid or AWS SES during the early phase.'),
    sp(),

    tbl(
        ['Infrastructure Component', 'Provider', 'Monthly Cost', 'Region'],
        [
            ['Frontend Hosting', 'Vercel (Hobby)', 'Free', 'Global CDN (40+ locations)'],
            ['PostgreSQL Database', 'Supabase (Free Tier)', 'Free (500 MB limit)', 'AWS ap-south-1 (Mumbai)'],
            ['Voice Audio Storage', 'AWS S3', '~₹2–5 (pay-per-use)', 'ap-south-1 (Mumbai)'],
            ['AI — Gemini', 'Google AI Studio', 'Free (15 RPM limit)', 'Google Cloud'],
            ['AI — Sarvam', 'Sarvam AI', 'Free developer credits', 'India (Sarvam cloud)'],
            ['AI — OpenAI', 'OpenAI', '~₹1–10 (pay-per-use)', 'OpenAI Cloud'],
            ['Email', 'Gmail SMTP', 'Free (500/day)', 'Google'],
            ['Payments', 'Razorpay', 'Free + 2% per transaction', 'India'],
            ['Total Monthly Fixed Cost', '—', '₹0 base', '—'],
        ],
        [2500, 2000, 1800, 3060],
    ),

    pb(),
];

module.exports = { content };