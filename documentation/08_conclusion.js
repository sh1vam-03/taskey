/**
 * 08_conclusion.js
 * ─────────────────────────────────────────
 * CHAPTER 8 — Conclusion and Future Scope
 * ─────────────────────────────────────────
 */

const { h1, h2, h3, h4, jpp, jp, bul, sp, sp2, pb, tbl } = require('./helpers');

const content = [

    h1('CHAPTER 8: CONCLUSIONS AND FUTURE SCOPE'),

    // ─── 8.1 Conclusion ──────────────────────────────────
    h2('8.1 Conclusion'),

    jpp('TASKTIME represents the successful realisation of an ambitious academic vision: to build a production-grade AI-powered SaaS product that genuinely serves Indian users with a combination of technical depth, cultural awareness, and price accessibility that existing tools fail to provide. What began as a final year BCA project requirement evolved, through months of focused development, into a functioning commercial-quality platform that competes feature-for-feature with established productivity applications.'),
    sp(),
    jpp('All five primary objectives established at the outset have been achieved. TASKTIME is deployed and publicly accessible. The multi-model AI system routes seamlessly between four language models with model-appropriate processing pipelines. The conversational interface allows users to manage their entire task and schedule system through natural language — a genuine paradigm shift from traditional form-based productivity tools. Indian language voice interaction via Sarvam AI models provides a capability that no comparable affordable tool offers. And the Razorpay billing system provides a complete SaaS monetisation infrastructure with subscription management, credit billing, and payment audit trails.'),
    sp(),
    jpp('The technical depth achieved in this project goes significantly beyond standard BCA curriculum requirements. The LangGraph agentic pipeline, the custom Sarvam-M JSON routing system, the dual JWT token security architecture with server-side session management, the HMAC-SHA256 webhook verification, the atomic Prisma transaction credit management, and the virtual schedule conflict detection algorithm are all techniques used in production commercial applications. Building this system gave the development team practical experience with patterns and tools that are directly applicable to professional software engineering careers.'),
    sp(),
    jpp('Perhaps most importantly, TASKTIME demonstrates a proof of concept for the broader opportunity: India has over 500 million internet users, millions of students and young professionals who need productivity tools, and an AI ecosystem (led by companies like Sarvam AI) that is rapidly maturing. The intersection of affordable AI APIs, zero-cost cloud infrastructure, and a massively underserved Indian market creates a genuine opportunity for the next generation of developers to build tools that are not adaptations of Western products but are built from the ground up for Indian needs, languages, and price points.'),
    sp(),

    // ─── 8.2 Limitations ─────────────────────────────────
    h2('8.2 Limitations of the System'),

    jpp('The following limitations are acknowledged honestly as areas where TASKTIME\'s current implementation falls short of its full potential:'),
    sp(),
    tbl(
        ['Limitation', 'Description', 'Impact Level'],
        [
            ['Third-party AI dependency', 'TASKTIME relies on Google, OpenAI, and Sarvam AI APIs for all AI functionality. Any pricing change, API deprecation, or service outage directly affects TASKTIME\'s core features.', 'HIGH'],
            ['Gemini free tier rate limits', 'Google AI Studio\'s free tier allows only 15 requests per minute for Gemini 1.5 Flash. Under concurrent heavy usage, users may experience throttling or slower responses.', 'MEDIUM'],
            ['No offline functionality', 'TASKTIME requires internet connectivity for all operations. There is no Progressive Web App (PWA) service worker for offline task creation or cached schedule viewing.', 'MEDIUM'],
            ['Web-only platform', 'No native iOS or Android application. While the web app is mobile-responsive, it lacks native app features: push notifications, widget support, or home screen task creation.', 'MEDIUM'],
            ['No calendar sync', 'Users already using Google Calendar or Outlook cannot import existing events. TASKTIME exists as an isolated calendar island with no external synchronisation.', 'MEDIUM'],
            ['Sarvam-M routing limitations', 'The 4-node JSON routing approach works well for the 16 defined action types but is less flexible than native tool calling for complex multi-step or ambiguous user requests.', 'LOW'],
            ['No team collaboration', 'TASKTIME is built exclusively for individual users. There is no shared task list, team dashboard, or collaborative scheduling feature for small teams or student project groups.', 'LOW'],
        ],
        [2800, 4500, 1500],
    ),
    sp(),

    // ─── 8.3 Future Scope ────────────────────────────────
    h2('8.3 Future Scope of the Project'),

    h3('8.3.1 Short-Term Enhancements (0–6 Months)'),
    tbl(
        ['Enhancement', 'Description', 'Estimated Effort'],
        [
            ['Custom Domain (tasktime.in)', 'Deploy on a custom domain for brand credibility, improved SEO indexing, and professional email addresses.', '1–2 days'],
            ['Progressive Web App (PWA)', 'Add service worker for offline task creation, background sync, and "Add to Home Screen" support on mobile browsers.', '1–2 weeks'],
            ['Push Notifications', 'Browser-based push notifications (via Web Push API) for scheduled task reminders and overdue alerts.', '1–2 weeks'],
            ['Email Digest (Daily/Weekly)', 'Automated email summary every morning listing today\'s scheduled tasks and yesterday\'s productivity score.', '3–5 days'],
            ['Sarvam-30B Full Release', 'Complete extended testing of Sarvam-30B integration and remove the "Coming Soon" restriction for Pro+ users.', '1–2 weeks'],
            ['Redis Caching', 'Cache dashboard overview responses and frequently-accessed task lists in Redis to reduce Supabase query load and improve API response times to < 100ms.', '2–3 weeks'],
        ],
        [2500, 4500, 1800],
    ),
    sp(),

    h3('8.3.2 Medium-Term Enhancements (6–12 Months)'),
    tbl(
        ['Enhancement', 'Description', 'Business Impact'],
        [
            ['Google Calendar Sync', 'Two-way synchronisation: import existing Google Calendar events as schedules, export TASKTIME schedules to Google Calendar. Dramatically reduces migration barrier for new users.', 'HIGH — removes the biggest adoption barrier for users switching from Google Calendar'],
            ['Multilingual UI (Hindi + Marathi)', 'Full translation of the application interface into Hindi and Marathi, making TASKTIME accessible to non-English-comfortable users in Maharashtra and across India.', 'HIGH — opens access to a much larger user base'],
            ['AI Proactive Recommendations', 'Background service analyses behavioral patterns and proactively suggests schedule adjustments — e.g., "You\'ve been sleeping poorly this week; I\'ve cleared your Friday afternoon for rest."', 'HIGH — differentiates TASKTIME significantly from all competitors'],
            ['Fine-Tuned Intent Model', 'Fine-tune an open-source model (Llama 3 or Sarvam base) on TASKTIME-specific conversation datasets to push intent accuracy above 98%.', 'MEDIUM — reduces misinterpretation rate'],
            ['Chrome Extension', 'Capture tasks from any webpage, email, or document with a single click without opening the dashboard. Direct integration with Gmail for task creation from emails.', 'MEDIUM — improves daily utility and habit formation'],
        ],
        [2500, 3000, 3000],
    ),
    sp(),

    h3('8.3.3 Long-Term Vision (1–2+ Years)'),
    tbl(
        ['Feature', 'Description'],
        [
            ['Team Workspaces', 'Shared task lists, collaborative scheduling, and team-level productivity analytics. Target market: small businesses, student project teams, freelancer collectives.'],
            ['TASKTIME for Education', 'Specialised school/college version with features for assignment tracking, exam scheduling, study time blocking, and AI study plan generation aligned with Indian academic calendars.'],
            ['TASKTIME API (Public)', 'REST API with API key authentication allowing third-party developers to integrate TASKTIME task management into their own applications — creating an ecosystem.'],
            ['AI Schedule Optimiser', 'Machine learning model trained on completion pattern data to suggest optimal time slots for new tasks based on when each user is historically most productive during the day and week.'],
            ['VS Code / IDE Extension', 'Manage coding tasks, track GitHub issues as TASKTIME tasks, and schedule code review sessions without leaving the development environment.'],
            ['Mobile Application', 'Native React Native application for iOS and Android with push notifications, widgets, offline support, and voice task creation via phone microphone.'],
        ],
        [2500, 6860],
    ),

    pb(),
];

module.exports = { content };