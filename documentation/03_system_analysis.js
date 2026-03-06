/**
 * 03_requirements_analysis.js
 * ─────────────────────────────────────────
 * CHAPTER 3 — Requirements and Analysis
 * ─────────────────────────────────────────
 */

const { h1, h2, h3, h4, jpp, jp, bul, num, sp, sp2, pb, tbl, codeBlock } = require('./helpers');

const content = [

    h1('CHAPTER 3: REQUIREMENTS AND ANALYSIS'),

    jpp('This chapter establishes the complete requirements baseline for TASKTIME. It begins with a structured problem definition, moves through functional and non-functional requirements, presents the development planning methodology, documents hardware and software requirements, and concludes with a preliminary product description and conceptual models illustrating the system\'s key workflows.'),
    sp(),

    // ─── 3.1 Problem Definition ──────────────────────────
    h2('3.1 Problem Definition'),
    jpp('Existing task management tools fail Indian users across five distinct dimensions. A structured analysis of each problem domain follows:'),
    sp(),

    h3('3.1.1 The Intelligence Gap'),
    jpp('Current tools are passive repositories. They store what the user explicitly types but cannot interpret natural language, understand context, or take autonomous action. A user who types "Schedule gym every morning at 7am starting Monday" into Todoist must still manually: (1) create a task titled "Gym", (2) navigate to the recurring settings, (3) select Daily, (4) set the start time, and (5) save. TASKTIME reduces this to one natural language message. This is not incremental improvement — it is a fundamentally different interaction paradigm.'),
    sp(),

    h3('3.1.2 The Language Barrier'),
    jpp('According to the 2011 Census of India (the most recent official data), approximately 53.6% of Indians cite Hindi as their first language, and over 90% speak one of the 22 Scheduled Languages as their primary mode of communication. Yet every AI-powered productivity tool — Todoist AI, Notion AI, Motion — operates exclusively in English. Users comfortable in Hindi, Marathi, Bengali, or Tamil are completely excluded from AI productivity features. TASKTIME\'s integration of Sarvam AI models directly addresses this structural exclusion.'),
    sp(),

    h3('3.1.3 The Pricing Problem'),
    jpp('Productivity tools with AI features are priced for Western purchasing power. Todoist Pro costs $4/month (≈₹330), Notion AI adds $8/month (≈₹665), and Motion charges $19/month (≈₹1,580). For a student in India — with a typical monthly pocket money of ₹1,000–₹3,000 — these prices are prohibitive. TASKTIME\'s PRO plan at ₹29/month (less than the cost of a cold coffee) and credit-based consumption model makes AI productivity genuinely accessible to Indian students.'),
    sp(),

    h3('3.1.4 The Behavioral Blindness Problem'),
    jpp('No mainstream productivity tool tracks the behavioral inputs that determine whether a user is capable of productive work on a given day. A person who slept 4 hours and is feeling low should not be scheduled for 6 hours of deep focus work. Yet existing tools have no awareness of health state. TASKTIME\'s behavioral logging system (mood, sleep, exercise) and its integration into the AI context window means the assistant can acknowledge: "I see you only got 4 hours of sleep. Let me suggest a lighter schedule for today."'),
    sp(),

    h3('3.1.5 The Scheduling Disconnect'),
    jpp('Task managers and calendar applications are separate products that do not communicate. A user managing tasks in Todoist and schedules in Google Calendar must manually copy task names into calendar events, check for conflicts manually, and maintain two separate systems. TASKTIME unifies tasks and schedules in a single data model: every schedule is linked to a task, the AI can create both in a single conversation turn, and the calendar view displays schedule blocks derived directly from the task database.'),
    sp(),
    tbl(
        ['Problem', 'Impact', 'TASKTIME Solution'],
        [
            ['Manual UI-based task creation', 'Cognitive friction, reduced adoption', 'Natural language AI assistant creates tasks conversationally'],
            ['No Hindi/Indic language support', 'Exclusion of 500M+ Indian users from AI productivity', 'Sarvam-M and Sarvam-30B models with full Indic language support'],
            ['Prohibitive pricing for India', 'AI productivity inaccessible to students', 'PRO at ₹29/month, FREE tier with 10 trial credits'],
            ['No behavioral intelligence', 'AI unaware of user\'s health and capacity', 'Daily behavior logging integrated into AI context via buildSystemContext()'],
            ['Task manager and calendar disconnected', 'Double data entry, missed conflicts', 'Tasks and schedules in same database; conflict detection built-in'],
            ['No voice interface for Indian accents', 'Hands-free productivity inaccessible', 'Sarvam Saaras STT + Bulbul TTS with Indian voices'],
        ],
        [2200, 2400, 4760],
    ),
    sp(),

    // ─── 3.2 Requirements Specification ──────────────────
    h2('3.2 Requirements Specification'),

    h3('3.2.1 Functional Requirements — Authentication Module'),
    tbl(
        ['ID', 'Requirement', 'Priority'],
        [
            ['FR-01', 'The system shall allow new users to register with name, email address, and password.', 'HIGH'],
            ['FR-02', 'The system shall send a 6-digit OTP to the user\'s email within 30 seconds of registration.', 'HIGH'],
            ['FR-03', 'OTP codes shall expire after 10 minutes and shall be stored as SHA-256 hashes — never in plaintext.', 'HIGH'],
            ['FR-04', 'The system shall issue a 15-minute access token (JWT) and a 7-day or 30-day refresh token on successful login.', 'HIGH'],
            ['FR-05', 'Refresh tokens shall be stored as SHA-256 hashes in the Session table, enabling server-side revocation.', 'HIGH'],
            ['FR-06', 'The system shall support logout from a single device and logout-all-devices operations.', 'HIGH'],
            ['FR-07', 'The system shall allow password reset via OTP sent to the registered email.', 'HIGH'],
            ['FR-08', 'The system shall support user profile updates: name, timezone, preferred AI models, voice settings.', 'MEDIUM'],
        ],
        [900, 6400, 800],
    ),
    sp(),

    h3('3.2.2 Functional Requirements — Task Management'),
    tbl(
        ['ID', 'Requirement', 'Priority'],
        [
            ['FR-09', 'The system shall allow creating tasks with title (required), description, priority (LOW/MEDIUM/HIGH), and optional due date.', 'HIGH'],
            ['FR-10', 'Tasks created without an explicit due date shall have dueDate set to NULL — not the current date.', 'HIGH'],
            ['FR-11', 'Tasks shall optionally belong to a user-defined Category with name, colour, and icon.', 'MEDIUM'],
            ['FR-12', 'The system shall support task archiving (soft deletion) preserving data for productivity analytics.', 'HIGH'],
            ['FR-13', 'The system shall enforce monthly task creation limits per plan: FREE = 200, PRO = 300, PRO_PLUS = 1000.', 'HIGH'],
            ['FR-14', 'The system shall track task completion per day via TaskDailyCompletion records for streak calculation.', 'HIGH'],
            ['FR-15', 'Users shall be able to filter tasks by priority, search by title/description, and sort by any field.', 'MEDIUM'],
        ],
        [900, 6400, 800],
    ),
    sp(),

    h3('3.2.3 Functional Requirements — Schedule Management'),
    tbl(
        ['ID', 'Requirement', 'Priority'],
        [
            ['FR-16', 'Every schedule must be linked to an existing task. Standalone schedules are not permitted.', 'HIGH'],
            ['FR-17', 'Only tasks with dueDate = NULL shall be schedulable. Tasks with explicit deadlines cannot be scheduled.', 'HIGH'],
            ['FR-18', 'The system shall support four recurrence types: NONE (one-time), DAILY, WEEKLY, and MONTHLY.', 'HIGH'],
            ['FR-19', 'WEEKLY recurrence shall allow specific day selection via integer array (0=Sunday through 6=Saturday).', 'HIGH'],
            ['FR-20', 'The system shall detect and reject schedule creation that conflicts with any existing schedule on the target date.', 'HIGH'],
            ['FR-21', 'Conflict detection shall work for all recurrence types by virtually expanding schedules via appliesOnDate().', 'HIGH'],
            ['FR-22', 'A nightly cron job at 00:05 UTC shall detect uncompleted schedules from yesterday and record them as MissedSchedule entries.', 'HIGH'],
            ['FR-23', 'Users shall be able to mark any schedule occurrence as completed for a specific date.', 'HIGH'],
        ],
        [900, 6400, 800],
    ),
    sp(),

    h3('3.2.4 Functional Requirements — AI Assistant'),
    tbl(
        ['ID', 'Requirement', 'Priority'],
        [
            ['FR-24', 'The system shall route AI chat requests to the model selected in the user\'s profile (aiChatModel field).', 'HIGH'],
            ['FR-25', 'FREE plan users shall only be able to use the sarvam-m model. All other models require a paid plan.', 'HIGH'],
            ['FR-26', 'The AI shall support at minimum 12 action types through tool calling including bulk creation, CRUD operations, and behavior logging.', 'HIGH'],
            ['FR-27', 'Tool-capable models (Gemini, GPT-4o-mini, Sarvam-30B) shall use a 5-node LangGraph agentic pipeline.', 'HIGH'],
            ['FR-28', 'Sarvam-M (no native tool calling) shall use a custom 4-node JSON routing system to achieve equivalent task management.', 'HIGH'],
            ['FR-29', 'AI responses shall stream via server-sent events for real-time character-by-character rendering in the browser.', 'HIGH'],
            ['FR-30', 'AI credits shall be deducted atomically using Prisma transactions, consuming subscription credits before top-up credits.', 'HIGH'],
            ['FR-31', 'The AI context window shall include: current date/time, user timezone, today\'s workload, last 3 behavior logs, and conversation summary.', 'HIGH'],
        ],
        [900, 6400, 800],
    ),
    sp(),

    h3('3.2.5 Functional Requirements — Billing System'),
    tbl(
        ['ID', 'Requirement', 'Priority'],
        [
            ['FR-32', 'The system shall support three subscription plans: FREE (₹0), PRO (₹29/mo), PRO_PLUS (₹79/mo).', 'HIGH'],
            ['FR-33', 'The system shall support both monthly and yearly billing cycles for paid plans.', 'HIGH'],
            ['FR-34', 'The system shall support credit top-up packages: 200 credits (₹29), 450 credits (₹49), 1000 credits (₹99).', 'HIGH'],
            ['FR-35', 'All Razorpay webhook events shall be verified using HMAC-SHA256 signature before processing.', 'HIGH'],
            ['FR-36', 'All credit transactions (grant, deduction, top-up) shall be recorded in an immutable AiCreditLedger table.', 'HIGH'],
        ],
        [900, 6400, 800],
    ),
    sp(),

    h3('3.2.6 Non-Functional Requirements'),
    tbl(
        ['Category', 'Requirement', 'Target / Metric'],
        [
            ['Performance', 'Standard API endpoint response time', '< 500 milliseconds (p95)'],
            ['Performance', 'AI streaming: time to first token', '< 2 seconds'],
            ['Performance', 'Dashboard overview API load time', '< 800 milliseconds'],
            ['Performance', 'Frontend initial page load (Vercel CDN)', '< 2 seconds'],
            ['Reliability', 'Application uptime (Vercel)', '> 99.5% monthly'],
            ['Security', 'Password storage', 'bcrypt hash, cost factor 10'],
            ['Security', 'Access token lifetime', '15 minutes (JWT)'],
            ['Security', 'Refresh token storage', 'HttpOnly + Secure + SameSite=None cookie'],
            ['Security', 'OTP storage', 'SHA-256 hash only — plaintext never stored'],
            ['Security', 'Payment webhook verification', 'HMAC-SHA256 with Razorpay secret'],
            ['Security', 'SQL injection protection', 'Prisma parameterized queries on all queries'],
            ['Scalability', 'Backend architecture', 'Stateless — supports horizontal scaling behind load balancer'],
            ['Compatibility', 'Minimum browser support', 'Chrome 90+, Firefox 88+, Safari 14+, Edge 90+'],
            ['Accessibility', 'Minimum mobile viewport', '320px width and above'],
            ['Maintainability', 'Code organisation', 'MVC with service layer — controllers never touch database directly'],
        ],
        [1800, 3000, 4560],
    ),
    sp(),

    // ─── 3.3 Planning and Scheduling ─────────────────────
    h2('3.3 Planning and Scheduling'),
    jpp('TASKTIME was developed using an Agile Scrum methodology with two-week sprint cycles. The project was planned as 10 sequential phases:'),
    sp(),
    tbl(
        ['Phase', 'Period', 'Sprint Goal', 'Status'],
        [
            ['1 — Research & Architecture', 'Jul–Aug 2025', 'Literature review, tech stack finalization, DB schema design, architecture planning', 'Completed'],
            ['2 — Auth & Database', 'Aug–Sep 2025', 'Prisma schema + Supabase setup, JWT dual-token auth, OTP email, session management', 'Completed'],
            ['3 — Core Task & Schedule API', 'Sep–Oct 2025', 'Task CRUD, schedule management, conflict detection, categories, usage limits', 'Completed'],
            ['4 — Dashboard & Analytics', 'Oct 2025', 'Dashboard overview API, productivity score, streak tracking, behavioral logging', 'Completed'],
            ['5 — AI Pipeline (Tool-Calling Models)', 'Oct–Nov 2025', 'LangGraph graph, tool definitions, Gemini + GPT-4o-mini integration, streaming', 'Completed'],
            ['6 — Sarvam-M Custom Router', 'Nov 2025', 'Custom 4-node JSON routing, intent extraction prompt, executor, validation', 'Completed'],
            ['7 — Voice System', 'Nov–Dec 2025', 'Sarvam Saaras STT, Bulbul TTS, OpenAI Whisper + TTS-1, S3 audio storage', 'Completed'],
            ['8 — Billing System', 'Dec 2025', 'Razorpay subscriptions, credit top-ups, webhook HMAC verification, atomic deduction', 'Completed'],
            ['9 — Frontend Development', 'Oct 2025–Jan 2026', 'All pages: dashboard, tasks, schedules, calendar, AI chat, billing, settings', 'Completed'],
            ['10 — Testing & Deployment', 'Jan–Mar 2026', 'Full test suite, bug fixes, production deployment, report writing', 'Completed'],
        ],
        [2200, 1600, 3500, 1800],
    ),
    sp(),

    // ─── 3.4 Software and Hardware Requirements ──────────
    h2('3.4 Software and Hardware Requirements'),

    h3('3.4.1 Development Environment — Software'),
    tbl(
        ['Software', 'Version', 'Purpose'],
        [
            ['Node.js', 'v22 LTS', 'Backend JavaScript runtime'],
            ['npm', '10.x', 'Package manager for both frontend and backend'],
            ['Next.js', '16.1.0', 'React framework for frontend'],
            ['PostgreSQL', '16+', 'Local development database (mirroring Supabase schema)'],
            ['Prisma CLI', '6.19.1', 'Database migrations and client generation'],
            ['VS Code', 'Latest', 'Primary IDE — Prisma, ESLint, Tailwind CSS extensions'],
            ['Postman', '11.x', 'API endpoint testing and documentation'],
            ['Git', '2.x', 'Version control'],
            ['GitHub', '—', 'Repository hosting, CI/CD trigger for Vercel'],
        ],
        [2200, 1400, 5760],
    ),
    sp(),

    h3('3.4.2 Development Hardware Requirements'),
    tbl(
        ['Component', 'Minimum Specification', 'Recommended'],
        [
            ['RAM', '8 GB', '16 GB (running frontend dev server + backend + PostgreSQL simultaneously)'],
            ['Processor', 'Intel Core i5 (8th gen) or AMD Ryzen 5', 'Intel Core i7 / AMD Ryzen 7 or above'],
            ['Storage', '50 GB SSD', '256 GB SSD (node_modules are large)'],
            ['Internet', '5 Mbps broadband', '25 Mbps+ (AI API calls require stable connection)'],
            ['Display', '1366×768', '1920×1080 (dual-monitor setup for frontend + backend)'],
        ],
        [1600, 2500, 5260],
    ),
    sp(),

    h3('3.4.3 End-User Requirements (Production)'),
    tbl(
        ['Requirement', 'Specification'],
        [
            ['Device', 'Any device with a modern web browser — desktop, laptop, smartphone, or tablet'],
            ['Browser', 'Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ — any Chromium-based browser'],
            ['Internet', '1 Mbps minimum; 5 Mbps recommended for voice features'],
            ['Screen Resolution', '320px minimum width (fully responsive design)'],
            ['JavaScript', 'Must be enabled in browser'],
            ['Audio (for voice)', 'Microphone access required for STT; speakers/headphones for TTS playback'],
        ],
        [2500, 6860],
    ),
    sp(),

    // ─── 3.5 Preliminary Product Description ─────────────
    h2('3.5 Preliminary Product Description'),
    jpp('TASKTIME is a web-based SaaS productivity platform that a user accesses through any modern browser. The user journey proceeds as follows:'),
    sp(),
    tbl(
        ['Step', 'User Action', 'System Response'],
        [
            ['1', 'User visits the landing page', 'Server-rendered landing page with feature overview, pricing table, team details served by Next.js SSR via Vercel CDN'],
            ['2', 'User clicks Sign Up, enters name, email, password', 'Backend creates user record with bcrypt-hashed password, generates 6-digit OTP, sends to email via Gmail SMTP'],
            ['3', 'User enters OTP from email', 'Backend verifies SHA-256 hash, marks isEmailVerified = true, returns JWT access token + HttpOnly refresh token cookie'],
            ['4', 'User is redirected to Dashboard', 'Dashboard fetches overview data: today\'s tasks, upcoming schedules, productivity score, streak count'],
            ['5', 'User types in AI Chat: "Schedule daily morning run at 6am"', 'AI pipeline invokes Gemini via LangGraph, calls create_task_and_schedule tool, checks conflicts, creates records, streams confirmation reply'],
            ['6', 'User views Calendar page', 'Calendar fetches all schedules for selected month, renders recurring slots virtually using appliesOnDate() algorithm'],
            ['7', 'User logs today\'s behavior (mood, sleep, exercise)', 'BehaviorLog upsert updates the score algorithm inputs; updated productivity score visible on dashboard'],
            ['8', 'User upgrades to PRO plan', 'Razorpay checkout opens; on payment.captured webhook: plan updated, 300 credits granted, premium models unlocked'],
            ['9', 'User switches to voice mode', 'Browser records audio, sends to Sarvam Saaras STT, text processed by AI, TTS response audio returned from S3'],
            ['10', 'Nightly at 00:05 UTC', 'Cron job scans all schedules, finds uncompleted ones for yesterday, writes MissedSchedule records for penalty scoring'],
        ],
        [600, 2500, 6260],
    ),
    sp(),

    // ─── 3.6 Conceptual Models ───────────────────────────
    h2('3.6 Conceptual Models'),

    h3('3.6.1 Use Case Model — Primary Actors'),
    tbl(
        ['Actor', 'Description', 'Applicable Plan'],
        [
            ['Guest User', 'Unauthenticated visitor. Can view landing, pricing, and about pages. Can register.', 'None'],
            ['Free User', 'Authenticated user on FREE plan. Has 10 trial AI credits. Limited to sarvam-m model only.', 'FREE'],
            ['Pro User', 'Authenticated user on PRO plan (₹29/month). 300 credits/month. Access to all text AI models.', 'PRO'],
            ['Pro+ User', 'Authenticated user on PRO_PLUS plan (₹79/month). 900 credits/month. Voice AI enabled.', 'PRO_PLUS'],
            ['Admin User', 'Internal admin account bypassing all usage limits. Manages system health.', 'ADMIN role'],
            ['Cron System', 'Automated scheduler running 3 background jobs nightly.', 'System'],
            ['Razorpay', 'External payment system. Sends HMAC-signed webhook events on payment events.', 'External'],
        ],
        [1600, 4500, 2800],
    ),
    sp(),

    h3('3.6.2 Core Use Case: Create Task and Schedule via AI Chat'),
    tbl(
        ['Element', 'Description'],
        [
            ['Use Case Name', 'Create Task and Schedule via AI Conversation'],
            ['Primary Actor', 'Authenticated User (Free / Pro / Pro+)'],
            ['Pre-conditions', '1. User is authenticated (valid JWT). 2. User has > 0 AI credits. 3. The task to be scheduled does not already have a dueDate.'],
            ['Trigger', 'User sends message: "Schedule gym workout at 7am tomorrow"'],
            ['Main Success Flow', '1. Frontend sends POST /api/ai/chat/stream with message text.\n2. authenticate middleware validates JWT access token.\n3. AI credit middleware checks balance — rejects with 402 if insufficient.\n4. Orchestrator resolves model from user.aiChatModel.\n5. buildSystemContext() fetches: today\'s workload, last 3 behavior logs, conversation summary (parallel queries).\n6. LangGraph graph invoked with full context + system prompt.\n7. Planner Node identifies intent as PLANNING.\n8. Agent Node decides to call create_task tool, then create_schedule tool.\n9. Tool Node: calls taskService.createTask() → receives taskId.\n10. Tool Node: calls scheduleService.createSchedule({taskId, scheduleDate, startTime: "07:00:00", endTime: "08:00:00", recurrence: "NONE"}).\n11. Conflict detection: fetches all user schedules, runs appliesOnDate() on each, finds no overlap.\n12. Task and schedule records created in PostgreSQL.\n13. Reflection Node: detects no errors in tool results.\n14. Finalize Node: LLM generates confirmation message.\n15. Response streams token-by-token to browser via SSE.\n16. Credits atomically deducted via Prisma transaction.\n17. AiMessage record saved to database.'],
            ['Alternative Flow', 'If schedule conflict detected: scheduleService throws 409 error → Tool Node returns error JSON → Reflection Node injects retry guidance → Agent Node responds with conflict message explaining the overlap.'],
            ['Post-conditions', 'Task created (dueDate: null). Schedule created for tomorrow at 07:00–08:00 (NONE recurrence). Credits deducted. SSE stream closed.'],
        ],
        [2000, 7360],
    ),
    sp(),

    h3('3.6.3 System Workflow — AI Processing Pipeline'),
    jpp('The following diagram describes the high-level processing flow when a user sends an AI chat message:'),
    sp(),
    ...codeBlock([
        'User Message',
        '    ↓',
        'POST /api/ai/chat/stream',
        '    ↓',
        'authenticate middleware  →  [401 if token invalid]',
        '    ↓',
        'AI credit check          →  [402 if balance = 0]',
        '    ↓',
        'Model routing:',
        '  └─ gemini / gpt-4o-mini / sarvam-30b  →  LangGraph 5-Node Pipeline',
        '  └─ sarvam-m                            →  Custom 4-Node JSON Router',
        '    ↓',
        'buildSystemContext() [parallel DB queries]',
        '  ├─ today\'s dashboard workload',
        '  ├─ last 3 behavior log entries',
        '  └─ conversation summary (if exists)',
        '    ↓',
        'LangGraph Pipeline:',
        '  [1] Planner Node  →  classify intent',
        '  [2] Agent Node    →  LLM invocation + tool call decisions',
        '  [3] Tool Node     →  execute tools (taskService, scheduleService...)',
        '  [4] Reflection    →  check for errors, inject retry if needed',
        '  [5] Finalize      →  normalize response format',
        '    ↓',
        'Stream tokens  →  SSE to browser',
        '    ↓',
        'Atomic credit deduction (Prisma $transaction)',
        '    ↓',
        'Save AiMessage to PostgreSQL',
    ]),

    pb(),
];

module.exports = { content };