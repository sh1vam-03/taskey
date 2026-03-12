/**
 * 00_frontmatter.js
 * ─────────────────────────────────────────────────────
 * Title Page, Certificate, Declaration,
 * Acknowledgement, Abstract
 * ─────────────────────────────────────────────────────
 */

const {
    Paragraph, TextRun, Table, TableRow, TableCell,
    AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
} = require('docx');

const {
    txt, jpp, jp, h1, sp, sp2, pb, tbl, W,
} = require('./helpers');

// ─── Reusable signature row helper ────────────────────
const sigRow = (labels) => new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: labels.map(() => Math.floor(W / labels.length)),
    rows: [
        new TableRow({
            children: labels.map(() =>
                new TableCell({
                    borders: {
                        top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                    },
                    children: [new Paragraph({ children: [txt('', { size: 22 })] })],
                })),
        }),
        new TableRow({
            children: labels.map(label =>
                new TableCell({
                    borders: {
                        top: { style: BorderStyle.SINGLE, size: 4, color: '003366', space: 4 },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                    },
                    children: [new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 80, after: 40 },
                        children: [txt(label, { bold: true, size: 22 })],
                    })],
                })),
        }),
    ],
});

// ══════════════════════════════════════════════════════
// TITLE PAGE
// ══════════════════════════════════════════════════════
const titlePage = [
    sp2, sp2,
    jp('DR. BABASAHEB AMBEDKAR MARATHWADA UNIVERSITY, CHHATRAPATI SAMBHAJINAGAR', {
        bold: true, size: 24, align: AlignmentType.CENTER,
    }),
    sp(),
    jp('TULSI COMPUTER SCIENCE & INFORMATION TECHNOLOGY COLLEGE, BEED', {
        bold: true, size: 30, align: AlignmentType.CENTER,
    }),
    jp('Department of Computer Applications', {
        size: 23, italic: true, align: AlignmentType.CENTER,
    }),
    sp2(),
    new Paragraph({
        border: { bottom: { style: BorderStyle.DOUBLE, size: 6, color: '003366', space: 4 } },
        children: [],
    }),
    sp2(),
    jp('PROJECT REPORT', { bold: true, size: 44, align: AlignmentType.CENTER }),
    sp(),
    jp('Submitted in Partial Fulfillment of the Requirements for the Degree of', {
        size: 22, italic: true, align: AlignmentType.CENTER,
    }),
    jp('BACHELOR OF COMPUTER APPLICATIONS (BCA)', {
        bold: true, size: 30, align: AlignmentType.CENTER,
    }),
    sp2(),
    new Paragraph({
        border: { bottom: { style: BorderStyle.DOUBLE, size: 6, color: '003366', space: 4 } },
        children: [],
    }),
    sp2(),
    jp('TASKTIME', { bold: true, size: 52, color: '003366', align: AlignmentType.CENTER }),
    jp('AI-Powered Task & Schedule Management SaaS Platform', {
        bold: true, size: 28, italic: true, align: AlignmentType.CENTER,
    }),
    sp(),
    jp('Multi-Model AI  ·  Voice Interface  ·  Razorpay Billing  ·  Behavioral Analytics', {
        size: 22, italic: true, align: AlignmentType.CENTER,
    }),
    sp2(),
    new Paragraph({
        border: { bottom: { style: BorderStyle.DOUBLE, size: 6, color: '003366', space: 4 } },
        children: [],
    }),
    sp(),
    tbl(
        ['Submitted By', 'Project Guide'],
        [
            ['Atharv Kundalkar  (Project Lead, Backend)', 'Prof. Ankush Surve Sir'],
            ['Balaji Bokare  (Full-Stack Developer)', 'Dept. of Computer Applications'],
            ['Hanumant Surve  (Frontend Developer)', 'Academic Year: 2025 – 2026'],
        ],
        [4680, 4680],
    ),
    pb(),
];

// ══════════════════════════════════════════════════════
// CERTIFICATE
// ══════════════════════════════════════════════════════
const certificatePage = [
    jp('TULSI COMPUTER SCIENCE & INFORMATION TECHNOLOGY COLLEGE, BEED', {
        bold: true, size: 28, align: AlignmentType.CENTER,
    }),
    jp('Affiliated to Dr. Babasaheb Ambedkar Marathwada University, Chhatrapati Sambhajinagar', {
        size: 22, align: AlignmentType.CENTER, italic: true,
    }),
    sp2(), sp(),
    jp('CERTIFICATE', { bold: true, size: 44, align: AlignmentType.CENTER }),
    new Paragraph({
        border: { bottom: { style: BorderStyle.DOUBLE, size: 6, color: '003366', space: 4 } },
        children: [],
    }),
    sp(),
    jpp('This is to certify that the project entitled:'),
    sp(),
    jp('"TASKTIME: AI-Powered Task & Schedule Management SaaS Platform"', {
        bold: true, size: 26, align: AlignmentType.CENTER,
    }),
    sp(),
    jpp('has been successfully completed by the following students of Bachelor of Computer Applications (BCA), Third Year, Tulsi Computer Science & Information Technology College, Beed, in partial fulfillment of the requirements for the award of the Degree of Bachelor of Computer Applications from Dr. Babasaheb Ambedkar Marathwada University, Chhatrapati Sambhajinagar. The project has been carried out under the guidance of Prof. Ankush Surve Sir, Department of Computer Applications, during the Academic Year 2025–2026. The work presented in this report is original and has not been submitted for the award of any other degree or diploma at any other university or institution.'),
    sp2(),
    tbl(
        ['Sr. No.', 'Student Name', 'Roll Number', 'Signature'],
        [
            ['1.', 'Atharv Kundalkar', '___________', '____________________'],
            ['2.', 'Balaji Bokare', '___________', '____________________'],
            ['3.', 'Hanumant Surve', '___________', '____________________'],
        ],
        [1000, 3200, 2500, 2660],
    ),
    sp2(), sp2(),
    sigRow(['Project Guide\nProf. Ankush Surve Sir', 'Head of Department', 'Principal / Director']),
    sp(),
    jp('Date: ________________          Place: Beed, Maharashtra', {
        size: 22, align: AlignmentType.LEFT,
    }),
    pb(),
];

// ══════════════════════════════════════════════════════
// DECLARATION
// ══════════════════════════════════════════════════════
const declarationPage = [
    h1('DECLARATION'),
    jpp('We, the undersigned students of Bachelor of Computer Applications (BCA), Third Year, Tulsi Computer Science & Information Technology College, Beed, affiliated to Dr. Babasaheb Ambedkar Marathwada University, Chhatrapati Sambhajinagar, hereby solemnly declare that the project entitled:'),
    sp(),
    jp('"TASKTIME: AI-Powered Task & Schedule Management SaaS Platform"', {
        bold: true, size: 26, align: AlignmentType.CENTER,
    }),
    sp(),
    jpp('submitted to the Department of Computer Applications in partial fulfillment of the requirements for the award of the Degree of Bachelor of Computer Applications, is an authentic record of our own work carried out during the academic year 2025–2026 under the supervision and guidance of Prof. Ankush Surve Sir. We further declare that:'),
    sp(),
    new Paragraph({
        numbering: { reference: 'numbers', level: 0 },
        children: [txt('This project has not been submitted to any other university, institute, or examination body for the award of any degree, diploma, or certificate.')],
        spacing: { before: 80, after: 80 },
    }),
    new Paragraph({
        numbering: { reference: 'numbers', level: 0 },
        children: [txt('All information, data, results, diagrams, and conclusions presented in this report are original, genuine, and based entirely on our own development and research work.')],
        spacing: { before: 80, after: 80 },
    }),
    new Paragraph({
        numbering: { reference: 'numbers', level: 0 },
        children: [txt('All third-party libraries, frameworks, APIs, services, and code snippets used in this project have been properly acknowledged and credited in the References and Appendix sections of this report.')],
        spacing: { before: 80, after: 80 },
    }),
    new Paragraph({
        numbering: { reference: 'numbers', level: 0 },
        children: [txt('No part of this project report has been plagiarized or copied from any other project, publication, or academic submission. Wherever material has been cited, it is properly referenced.')],
        spacing: { before: 80, after: 80 },
    }),
    new Paragraph({
        numbering: { reference: 'numbers', level: 0 },
        children: [txt('We understand that any false declaration will render us liable to disciplinary action as per the university rules and regulations.')],
        spacing: { before: 80, after: 80 },
    }),
    sp2(), sp(),
    tbl(
        ['Student Name', 'Signature', 'Date'],
        [
            ['Atharv Kundalkar', '____________________', '________________'],
            ['Balaji Bokare', '____________________', '________________'],
            ['Hanumant Surve', '____________________', '________________'],
        ],
        [3800, 3000, 2560],
    ),
    pb(),
];

// ══════════════════════════════════════════════════════
// ACKNOWLEDGEMENT
// ══════════════════════════════════════════════════════
const acknowledgementPage = [
    h1('ACKNOWLEDGEMENT'),
    jpp('The successful completion of TASKTIME — an AI-powered task and schedule management SaaS platform — has been the result of tireless effort, collaborative learning, and invaluable support from many individuals. We consider it our privilege to express our sincere and heartfelt gratitude to everyone who contributed to this project, directly or indirectly.'),
    sp(),
    jpp('First and foremost, we express our deepest gratitude to our project guide, Prof. Ankush Surve Sir, for his exceptional mentorship, technical expertise, unwavering patience, and consistent encouragement throughout every phase of this project. His constructive feedback during code reviews, system design discussions, and report writing kept our work on track and pushed us to aim for production-grade quality. This project would not have reached its depth and breadth without his dedicated guidance.'),
    sp(),
    jpp('We sincerely thank the Principal and Head of Department of Tulsi Computer Science & Information Technology College, Beed, for providing us with a well-equipped computer laboratory, high-speed internet access, and an academic environment that encourages innovation and independent research. The institution\'s infrastructure proved invaluable during the many intensive development sessions that shaped TASKTIME.'),
    sp(),
    jpp('We extend our heartfelt appreciation to all the teaching faculty members of the Department of Computer Applications. The knowledge imparted through subjects such as Database Management Systems, Object-Oriented Programming with Java, Web Technologies, Software Engineering, Computer Networks, and Systems Analysis & Design formed the intellectual foundation upon which TASKTIME was built. Every module of this project draws from concepts taught in these courses.'),
    sp(),
    jpp('Special acknowledgement is due to the open-source and developer communities whose work made this project possible at zero infrastructure cost. We are grateful to the LangChain and LangGraph teams for their pioneering work on agentic AI frameworks; the Next.js and React teams at Meta and Vercel for transforming frontend development; the Prisma team for making database access type-safe and developer-friendly; Supabase for providing free managed PostgreSQL hosting; Vercel for seamless zero-configuration deployment; Razorpay for the most developer-friendly payment gateway in India; and especially the Sarvam AI team for their mission to build AI for India — their models made TASKTIME\'s Hindi and Indic language features possible.'),
    sp(),
    jpp('We also acknowledge Google for providing the Gemini API with a generous free tier, OpenAI for GPT-4o-mini and the Whisper / TTS-1 voice models, and Amazon Web Services for S3 storage. Without these services being accessible to students and developers at little to no cost, a project of this technical scope would have been economically impossible for a college final year team.'),
    sp(),
    jpp('On a personal note, we are profoundly grateful to our families for their unshakeable moral support, patience during late-night coding sessions, and belief in our abilities. Their encouragement was our constant source of motivation when debugging seemed endless and deadlines felt overwhelming. We also thank our classmates and friends who provided valuable feedback as early users of TASKTIME, helping us identify and resolve usability issues that formal testing alone could not uncover.'),
    sp(),
    jpp('Finally, we thank Dr. Babasaheb Ambedkar Marathwada University, Chhatrapati Sambhajinagar, for the academic framework that gave us the opportunity to undertake this project — and for encouraging students to build technology that is relevant, ambitious, and grounded in real-world needs.'),
    sp2(), sp(),
    jp('Atharv Kundalkar', { bold: true, align: AlignmentType.RIGHT }),
    jp('Balaji Bokare', { bold: true, align: AlignmentType.RIGHT }),
    jp('Hanumant Surve', { bold: true, align: AlignmentType.RIGHT }),
    jp('BCA Third Year  —  Tulsi College, Beed  —  2025–2026', {
        italic: true, align: AlignmentType.RIGHT,
    }),
    pb(),
];

// ══════════════════════════════════════════════════════
// ABSTRACT
// ══════════════════════════════════════════════════════
const abstractPage = [
    h1('ABSTRACT'),
    jpp('The digital era demands productivity tools that are not only functional but genuinely intelligent — tools that understand natural language, adapt to individual behavioral patterns, speak in a user\'s native language, and take action autonomously on their behalf. TASKTIME is a full-stack, AI-powered task and schedule management Software-as-a-Service (SaaS) platform designed precisely to meet this demand, with a specific focus on Indian users who are underserved by existing Western-centric productivity tools.'),
    sp(),
    jpp('TASKTIME enables users to create and manage tasks with three priority levels, schedule recurring time blocks with automatic conflict detection, log daily behavioral health data (mood, sleep, exercise), and interact with a sophisticated multi-model AI assistant through both text and voice interfaces. The platform integrates four AI language models: Google Gemini 1.5 Flash, OpenAI GPT-4o Mini, Sarvam-M, and Sarvam-30B. The inclusion of Sarvam AI\'s Indic-language models — combined with Sarvam Saaras v3 for speech-to-text and Bulbul v3 for text-to-speech with 14 Indian speaker voices — makes TASKTIME capable of full Hindi and regional language AI interaction, a capability absent from all comparable productivity platforms.'),
    sp(),
    jpp('The technology stack is carefully selected for production-grade reliability and cost efficiency. The frontend is built with Next.js 16 and React 19, styled with Tailwind CSS 4, and deployed on Vercel\'s global CDN. The backend is a Node.js application using Express.js 5 with Prisma ORM 6 connecting to a PostgreSQL 16 database hosted on Supabase. The AI pipeline is orchestrated using LangGraph, a stateful graph-based framework enabling multi-step agentic workflows. Payments are processed via Razorpay with support for monthly and yearly subscriptions plus one-time credit top-ups.'),
    sp(),
    jpp('The core technical innovation is a dual-path AI architecture: models supporting native function/tool calling (Gemini 1.5 Flash, GPT-4o Mini, Sarvam-30B) traverse a five-node LangGraph pipeline (Planner → Agent → Tools → Reflection → Finalize) with full CRUD capability over tasks and schedules. The Sarvam-M model, which lacks native tool-calling, uses a purpose-built four-node manual JSON routing system that achieves equivalent task execution through deterministic intent extraction and a structured action dispatcher.'),
    sp(),
    jpp('Security is implemented at multiple layers: dual JWT tokens with HttpOnly cookie storage, bcrypt password hashing at cost factor 10, SHA-256 OTP hashing, HMAC-SHA256 Razorpay webhook verification, and Prisma\'s parameterized queries eliminating SQL injection risks. A productivity scoring algorithm computes a composite score of 70% task execution and 30% behavioral health, giving users a meaningful daily metric that accounts for both what they accomplished and how they took care of themselves.'),
    sp(),
    jpp('Testing results demonstrate 94% AI intent parsing accuracy across 50 diverse natural language inputs, sub-500ms API response times for all standard endpoints, and successful payment processing for all four subscription variants. The entire platform is deployed and publicly accessible. This project demonstrates that a team of three BCA final year students can design, build, and deploy a production-grade AI SaaS product using freely available cloud infrastructure.'),
    sp(),
    new Paragraph({
        spacing: { before: 120, after: 120 },
        children: [
            txt('Keywords: ', { bold: true }),
            txt('Task Management, SaaS, Artificial Intelligence, LangGraph, Agentic AI, Multi-Model, Natural Language Processing, Next.js, React, Prisma ORM, PostgreSQL, Razorpay, Sarvam AI, Voice Interface, Behavioral Analytics, Productivity, India.'),
        ],
    }),
    pb(),
];

// ─── Export ───────────────────────────────────────────
module.exports = {
    content: [
        ...titlePage,
        ...certificatePage,
        ...declarationPage,
        ...acknowledgementPage,
        ...abstractPage,
    ],
};