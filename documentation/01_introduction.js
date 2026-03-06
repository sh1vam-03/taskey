/**
 * 01_introduction.js
 * ─────────────────────────────────────────
 * CHAPTER 1 — Introduction
 * ─────────────────────────────────────────
 */

const { AlignmentType } = require('/home/claude/.npm-global/lib/node_modules/docx');
const { h1, h2, h3, h4, jpp, jp, bul, num, sp, sp2, pb, tbl, txt } = require('./helpers');

const content = [

    h1('CHAPTER 1: INTRODUCTION'),

    // ─── 1.1 Background ─────────────────────────────────
    h2('1.1 Background'),

    jpp('The twenty-first century has fundamentally altered the relationship between human beings and time. In an era characterised by information overload, remote work, multiple concurrent responsibilities, and the relentless acceleration of daily life, the ability to manage tasks, schedules, and personal productivity effectively has become not merely an advantage but a necessity. Students juggle academic deadlines, co-curricular activities, and self-study routines simultaneously. Professionals manage project milestones, team commitments, and personal development goals in parallel. Entrepreneurs track business tasks, client deliverables, and operational processes all at once. The cognitive burden of maintaining awareness of all these responsibilities — and organising them into an actionable daily plan — is substantial and growing.'),
    sp(),
    jpp('Traditional approaches to task management — physical notebooks, sticky notes, spreadsheets — proved insufficient for this complexity. Digital task managers emerged as the logical response, offering features like due dates, priorities, reminders, and categories. Tools such as Todoist, Microsoft To Do, Google Tasks, Notion, and Asana gained millions of users globally. However, these tools share a common limitation: they are passive containers. They store what you tell them but cannot help you decide what to do next, when to do it, or how to structure your day intelligently.'),
    sp(),
    jpp('The emergence of Large Language Models (LLMs) in 2022–2023 — particularly GPT-4 (OpenAI), Gemini (Google), and open-source alternatives — created an entirely new paradigm: AI agents capable of understanding natural language, interpreting context, making decisions, and taking actions. For the first time, it became technically and economically feasible to build a productivity tool that could accept a message like "Schedule daily gym sessions at 7am until end of March" and automatically create the task, detect any scheduling conflicts, set the correct recurrence pattern, and confirm the result in a conversational reply.'),
    sp(),
    jpp('For Indian users, this transformation carries additional significance. India has over 140 crore people, of whom a significant proportion — students, first-generation technology users, professionals in Tier 2 and Tier 3 cities — are more comfortable communicating in Hindi or regional languages than in English. Yet all major productivity tools with AI features are English-centric, charge subscription fees calibrated to purchasing power parity of Western economies (often ₹500–₹1,500/month), and are built without any understanding of the Indian work context, cultural calendar, or language preferences. TASKTIME was conceived and built to address precisely this gap.'),
    sp(),

    // ─── 1.2 Objectives ──────────────────────────────────
    h2('1.2 Objectives'),

    h3('1.2.1 Primary Objectives'),
    jpp('The following primary objectives guided the design and development of TASKTIME:'),
    sp(),
    tbl(
        ['Objective ID', 'Primary Objective'],
        [
            ['OBJ-P1', 'Design and develop a production-grade, full-stack SaaS web application for AI-powered task and schedule management, deployable on cloud infrastructure at near-zero cost.'],
            ['OBJ-P2', 'Implement a multi-model AI assistant system supporting Google Gemini 1.5 Flash, OpenAI GPT-4o Mini, Sarvam-M, and Sarvam-30B with model-appropriate routing strategies for each.'],
            ['OBJ-P3', 'Build a natural language conversational interface enabling users to create, modify, schedule, and delete tasks entirely through plain-text or voice conversation, without navigating traditional form-based UIs.'],
            ['OBJ-P4', 'Integrate Indian language voice interaction using Sarvam Saaras v3 (STT) and Sarvam Bulbul v3 (TTS) with 14 Indian speaker voices and automatic language detection.'],
            ['OBJ-P5', 'Implement a complete SaaS billing system via Razorpay supporting monthly and yearly subscription plans, one-time credit top-ups, and webhook-based payment verification.'],
        ],
        [1500, 7860],
    ),
    sp(),

    h3('1.2.2 Secondary Objectives'),
    tbl(
        ['Objective ID', 'Secondary Objective'],
        [
            ['OBJ-S1', 'Develop an intelligent recurring schedule management system with automatic conflict detection covering NONE (one-time), DAILY, WEEKLY (specific days), and MONTHLY recurrence patterns.'],
            ['OBJ-S2', 'Build a behavioral analytics engine tracking mood (HAPPY/NEUTRAL/SAD), sleep hours, and exercise, producing a daily composite productivity score: 70% task execution + 30% behavioral health.'],
            ['OBJ-S3', 'Implement comprehensive streak tracking, dashboard overview, and calendar view for visualising productivity trends over time.'],
            ['OBJ-S4', 'Architect the system with proper security layers: dual JWT tokens (access + refresh), SHA-256 OTP hashing, bcrypt password hashing, HMAC-SHA256 webhook verification, and server-side session revocation.'],
            ['OBJ-S5', 'Demonstrate through this project that BCA-level students can build commercially viable AI SaaS products using freely available cloud services, contributing a working model for future student projects.'],
        ],
        [1500, 7860],
    ),
    sp(),

    // ─── 1.3 Purpose, Scope, and Applicability ───────────
    h2('1.3 Purpose, Scope, and Applicability'),

    h3('1.3.1 Purpose'),
    jpp('The purpose of TASKTIME is to eliminate the friction between intention and action in daily productivity management. A typical person knows what needs to be done — the challenge is organising all of it into a structured, conflict-free, time-blocked daily plan while simultaneously tracking whether they are taking care of the behavioral habits that enable consistent performance. TASKTIME automates the organisational layer through AI and provides the behavioral tracking layer through a simple daily logging interface, resulting in a unified productivity operating system accessible through a web browser at a price affordable for Indian students and professionals.'),
    sp(),

    h3('1.3.2 Scope'),
    jpp('TASKTIME encompasses the following functional domains within its scope:'),
    sp(),
    tbl(
        ['Domain', 'What Is Included', 'What Is Excluded'],
        [
            ['Platforms', 'Responsive web app (desktop and mobile browser)', 'Native iOS app, Native Android app'],
            ['Users', 'Individual user accounts with personal data isolation', 'Team collaboration, shared workspaces, multi-tenant organisations'],
            ['AI Models', 'Gemini 1.5 Flash, GPT-4o Mini, Sarvam-M, Sarvam-30B', 'Claude, Llama, Mistral, custom fine-tuned models'],
            ['Voice', 'STT and TTS for Pro+ users via Sarvam and OpenAI', 'Real-time voice calling, telephony, conference transcription'],
            ['Calendar', 'Internal TASKTIME calendar view (day/week/month)', 'Google Calendar sync, Outlook/Apple Calendar integration'],
            ['Payments', 'Razorpay subscriptions + credit top-ups (India)', 'Stripe, PayPal, international gateways'],
            ['Languages', 'English UI with Hindi/Indic AI model support', 'Full Marathi/Hindi UI translation'],
            ['Notifications', 'Email (OTP, welcome, password reset)', 'Push notifications, SMS, WhatsApp integration'],
            ['Deployment', 'Vercel (frontend) + cloud backend', 'On-premise, Docker, Kubernetes, self-hosted deployment'],
        ],
        [1800, 3600, 3960],
    ),
    sp(),

    h3('1.3.3 Applicability'),
    jpp('TASKTIME is applicable across a wide range of user categories, each deriving distinct value from the platform\'s features:'),
    sp(),
    tbl(
        ['User Category', 'How TASKTIME Applies'],
        [
            ['College Students', 'Manage assignment deadlines, exam preparation schedules, daily study time blocks. Use AI to bulk-create weekly study plans in one message. Track sleep and mood alongside academic performance.'],
            ['Self-Learners', 'Structure coding bootcamp schedules, daily practice routines, reading habits. Voice interface enables hands-free task logging during commutes.'],
            ['Freelancers', 'Manage multiple client project deadlines with priority levels. Schedule client call preparation blocks. Track billing milestones as high-priority tasks.'],
            ['Young Professionals', 'Plan work deliverables, fitness routines, and personal development goals in one tool. Behavioral scoring creates accountability for healthy work-life habits.'],
            ['Startup Founders', 'Manage daily operational tasks, investor meeting preparations, team sync schedules. AI assistant provides quick restructuring of priorities through natural conversation.'],
            ['Hindi/Regional Language Users', 'Interact with the AI assistant in Hindi or Hinglish using the Sarvam models. Voice output in 14 Indian speaker voices in auto-detected regional language.'],
        ],
        [2500, 6860],
    ),
    sp(),

    // ─── 1.4 Achievements ────────────────────────────────
    h2('1.4 Achievements'),
    jpp('The following key achievements were accomplished through the development of TASKTIME:'),
    sp(),
    tbl(
        ['#', 'Achievement', 'Technical Detail'],
        [
            ['1', 'Production-deployed SaaS Platform', 'Publicly accessible at tasktime-sh1vam-03.vercel.app — not a prototype but a live deployed application.'],
            ['2', 'Dual-Path Multi-Model AI System', '5-node LangGraph pipeline for tool-capable models + custom 4-node JSON routing for Sarvam-M. 94% intent accuracy across 50 test cases.'],
            ['3', 'Real-time AI Streaming', 'Server-Sent Events (SSE) stream AI response tokens character-by-character to the browser, creating a native ChatGPT-style experience.'],
            ['4', 'Indian Language Voice AI', 'Sarvam Saaras v3 STT + Bulbul v3 TTS with 14 Indian speaker voices and automatic language detection for Hindi/English/regional.'],
            ['5', 'Intelligent Conflict Detection', 'appliesOnDate() algorithm virtually expands all recurring schedule types (NONE/DAILY/WEEKLY/MONTHLY) without database fan-out to check conflicts.'],
            ['6', 'Behavioral Productivity Scoring', 'Composite formula: 70% task execution + 30% behavioral health (sleep, exercise, mood). Clinically grounded weighting.'],
            ['7', 'Commercial Billing System', 'Razorpay subscriptions (monthly + yearly), credit top-ups (3 tiers), HMAC-SHA256 webhook verification, atomic credit deduction with Prisma transactions.'],
            ['8', 'Zero Infrastructure Cost', 'Frontend: Vercel free. Database: Supabase free tier. AI: Gemini free tier. Email: Gmail SMTP. Total monthly cost = ₹0 for current scale.'],
        ],
        [600, 2800, 5960],
    ),
    sp(),

    // ─── 1.5 Organisation of Report ──────────────────────
    h2('1.5 Organisation of Report'),
    jpp('This report is organised into the following chapters:'),
    sp(),
    tbl(
        ['Chapter', 'Title', 'Contents'],
        [
            ['Chapter 1', 'Introduction', 'Background, objectives, purpose and scope, key achievements, and report organisation.'],
            ['Chapter 2', 'Survey of Technologies', 'Detailed review of all frontend, backend, database, AI, and deployment technologies used, with justification for each choice.'],
            ['Chapter 3', 'Requirements and Analysis', 'Problem definition, functional and non-functional requirements, development planning, software/hardware requirements, and conceptual models.'],
            ['Chapter 4', 'System Design', 'System architecture, module descriptions, database design with full entity documentation, AI pipeline architecture, and billing system design.'],
            ['Chapter 5', 'Implementation', 'Description of the development approach used to build the TASKTIME system, including the technologies, frameworks, and architectural patterns applied. This chapter also explains the implementation of key modules such as authentication, task management, AI integration, and database operations, supported with important code snippets from the system.'],
            ['Chapter 6', 'Testing', 'Explanation of the testing strategy used to validate the TASKTIME system. This includes unit testing, integration testing, AI behavior testing, security testing, and performance evaluation to ensure the reliability, stability, and correctness of the application.'],
            ['Chapter 7', 'Results and Discussion', 'Deployment status, feature implementation summary, AI performance metrics, test results, and discussion of key achievements.'],
            ['Chapter 8', 'Conclusion and Future Scope', 'Project summary, identified limitations, short-term, medium-term, and long-term future enhancement plans.'],
            ['References', 'Bibliography', 'Academic papers, official documentation, and industry reports cited throughout the project.'],
            ['Appendix', 'Supplementary Material', 'Complete API endpoint reference, technical glossary, project timeline, and third-party library licence table.'],
        ],
        [1400, 2000, 5960],
    ),

    pb(),
];
