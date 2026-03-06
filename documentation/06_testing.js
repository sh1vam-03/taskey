/**
 * 06_testing.js
 * ─────────────────────────────────────────
 * CHAPTER 6 — Testing
 * ─────────────────────────────────────────
 */

const { h1, h2, h3, h4, jpp, jp, bul, num, sp, sp2, pb, tbl, codeBlock } = require('./helpers');

const content = [

    h1('CHAPTER 6: TESTING'),

    jpp('This chapter presents the testing strategies used to evaluate the TASKTIME system. It includes unit testing, integration testing, system testing, AI behavior validation, security testing, and performance evaluation. The goal of these tests is to ensure that the system functions correctly, maintains reliability, and meets the specified requirements.'),
    sp(),

    // ─── 6 Testing Strategy ────────────────────────────
    h2('6.1 Testing Strategy'),
    jpp('TASKTIME\'s testing follows the standard Testing Pyramid model: a broad base of fast unit tests, a middle layer of API integration tests, and targeted AI behavior and security tests at the top. All testing was conducted against the live staging deployment at tasktime-sh1vam-03.vercel.app.'),
    sp(),

    h3('6.1.1 Unit Tests — Date Utilities'),
    tbl(
        ['ID', 'Function', 'Input', 'Expected', 'Actual', 'Status'],
        [
            ['UT-01', 'appliesOnDate() NONE — match', 'scheduleDate=Mar 5, target=Mar 5', 'true', 'true', 'PASS'],
            ['UT-02', 'appliesOnDate() NONE — mismatch', 'scheduleDate=Mar 5, target=Mar 6', 'false', 'false', 'PASS'],
            ['UT-03', 'appliesOnDate() DAILY — after start', 'scheduleDate=Mar 1, target=Mar 15', 'true', 'true', 'PASS'],
            ['UT-04', 'appliesOnDate() DAILY — before start', 'scheduleDate=Mar 5, target=Mar 4', 'false', 'false', 'PASS'],
            ['UT-05', 'appliesOnDate() DAILY — after repeatUntil', 'repeatUntil=Mar 7, target=Mar 10', 'false', 'false', 'PASS'],
            ['UT-06', 'appliesOnDate() WEEKLY — matching day', 'repeatOnDays=[1,3], target=Monday', 'true', 'true', 'PASS'],
            ['UT-07', 'appliesOnDate() WEEKLY — non-matching', 'repeatOnDays=[1,3], target=Tuesday', 'false', 'false', 'PASS'],
            ['UT-08', 'appliesOnDate() MONTHLY — same date', 'date=5th, target=next month 5th', 'true', 'true', 'PASS'],
            ['UT-09', 'appliesOnDate() MONTHLY — different date', 'date=5th, target=6th', 'false', 'false', 'PASS'],
        ],
        [700, 2000, 2000, 1400, 1200, 800],
    ),
    sp(),

    h3('6.1.2 Unit Tests — Scoring Algorithm'),
    tbl(
        ['ID', 'Function', 'Input', 'Expected', 'Actual', 'Status'],
        [
            ['UT-10', 'calculateBehaviorScore()', 'sleep=8, exercise=true, mood=HAPPY', '100', '100', 'PASS'],
            ['UT-11', 'calculateBehaviorScore()', 'sleep=6, exercise=false, mood=NEUTRAL', '35', '35', 'PASS'],
            ['UT-12', 'calculateBehaviorScore()', 'sleep=4, exercise=false, mood=SAD', '0', '0', 'PASS'],
            ['UT-13', 'calculateBehaviorScore()', 'sleep=7, exercise=true, mood=NEUTRAL', '85', '85', 'PASS'],
            ['UT-14', 'calculateProductivityScore()', 'total=10, done=8, missed=0, behavior=80', '80', '80', 'PASS'],
            ['UT-15', 'calculateProductivityScore()', 'total=5, done=2, missed=2, behavior=40', '30', '30', 'PASS'],
            ['UT-16', 'calculateProductivityScore()', 'total=0 (no tasks), behavior=60', '18', '18', 'PASS'],
            ['UT-17', 'calculateProductivityScore()', 'total=10, done=10, missed=0, behavior=100', '100', '100', 'PASS'],
        ],
        [700, 2200, 2200, 1200, 1200, 800],
    ),
    sp(),

    h3('6.1.3 Integration Tests — Authentication API'),
    tbl(
        ['ID', 'Endpoint', 'Scenario', 'Expected', 'Result'],
        [
            ['IT-01', 'POST /auth/signup', 'Valid new email + password', '201 + OTP email sent', 'PASS'],
            ['IT-02', 'POST /auth/signup', 'Duplicate registered email', '409 Email already registered', 'PASS'],
            ['IT-03', 'POST /auth/verify-otp', 'Valid OTP within 10 min', '200 + isEmailVerified: true', 'PASS'],
            ['IT-04', 'POST /auth/verify-otp', 'Expired OTP (11 min old)', '400 OTP expired', 'PASS'],
            ['IT-05', 'POST /auth/verify-otp', 'Wrong OTP code', '400 Invalid OTP', 'PASS'],
            ['IT-06', 'POST /auth/login', 'Correct credentials, verified email', '200 + accessToken + refreshToken cookie', 'PASS'],
            ['IT-07', 'POST /auth/login', 'Wrong password', '401 Invalid credentials', 'PASS'],
            ['IT-08', 'POST /auth/login', 'Unverified email', '403 Email not verified', 'PASS'],
            ['IT-09', 'POST /auth/refresh-token', 'Valid HttpOnly cookie', '200 + new accessToken', 'PASS'],
            ['IT-10', 'POST /auth/refresh-token', 'No cookie present', '401 No refresh token', 'PASS'],
            ['IT-11', 'POST /auth/logout', 'Valid authenticated user', '200 + session deleted in DB', 'PASS'],
            ['IT-12', 'POST /auth/forgot-password', 'Registered email', '200 + password reset OTP sent', 'PASS'],
            ['IT-13', 'POST /auth/reset-password', 'Valid OTP + new password', '200 + password updated + old sessions revoked', 'PASS'],
        ],
        [700, 2200, 2500, 2000, 800],
    ),
    sp(),

    h3('6.1.4 Integration Tests — Task and Schedule APIs'),
    tbl(
        ['ID', 'Scenario', 'Expected', 'Result'],
        [
            ['IT-14', 'Create task — no due date specified', '201, dueDate: null', 'PASS'],
            ['IT-15', 'Create task — explicit "by Friday" deadline', '201, dueDate: next Friday date', 'PASS'],
            ['IT-16', 'Create task on FREE plan at 200-task limit', '403 Task limit reached for this month', 'PASS'],
            ['IT-17', 'Get tasks with priority=HIGH filter', '200, only HIGH priority tasks in response', 'PASS'],
            ['IT-18', 'Update task title and priority', '200, updated fields reflected', 'PASS'],
            ['IT-19', 'Soft-delete own task', '200, deletedAt timestamp set', 'PASS'],
            ['IT-20', 'Delete another user\'s task', '404 Task not found', 'PASS'],
            ['IT-21', 'Create ONE-TIME (NONE) schedule — no conflict', '201, recurrence: NONE, schedule saved', 'PASS'],
            ['IT-22', 'Create DAILY recurring schedule with repeatUntil', '201, DAILY recurrence, repeatUntil set', 'PASS'],
            ['IT-23', 'Create WEEKLY schedule on Mon+Wed', '201, WEEKLY, repeatOnDays: [1,3]', 'PASS'],
            ['IT-24', 'Create schedule overlapping existing slot', '409 Conflict with existing schedule', 'PASS'],
            ['IT-25', 'Create schedule for task that HAS a dueDate', '400 Cannot schedule a task with due date', 'PASS'],
            ['IT-26', 'Mark schedule completed (same day)', '201, ScheduleCompletion record created', 'PASS'],
            ['IT-27', 'Mark same schedule completed twice same day', '409 Already completed today', 'PASS'],
        ],
        [700, 3500, 2800, 800],
    ),
    sp(),

    h3('6.1.5 AI Behavior Tests — Intent Parsing (Sarvam-M)'),
    tbl(
        ['Input Message', 'Expected Action', 'Expected recurrence', 'Result'],
        [
            ['"Create a task to buy groceries"', 'create_task, dueDate: null', 'N/A', 'PASS'],
            ['"Remind me to pay rent by March 31"', 'create_task, dueDate: 2026-03-31', 'N/A', 'PASS'],
            ['"Add tasks: milk, eggs, bread, butter"', 'create_tasks_bulk, 4 tasks', 'N/A', 'PASS'],
            ['"Schedule gym at 7am tomorrow"', 'create_task_and_schedule', 'NONE', 'PASS'],
            ['"Set up daily morning run at 6am"', 'create_task_and_schedule', 'DAILY', 'PASS'],
            ['"Every Monday and Wednesday yoga at 8am"', 'create_task_and_schedule', 'WEEKLY [1,3]', 'PASS'],
            ['"Monthly bill payment on 1st at 9am"', 'create_task_and_schedule', 'MONTHLY', 'PASS'],
            ['"Daily meditation for March"', 'create_task_and_schedule', 'DAILY + repeatUntil', 'PASS'],
            ['"Show me my tasks"', 'LIST_TASKS (read operation)', 'N/A', 'PASS'],
            ['"Delete task: buy groceries"', 'DELETE_TASK', 'N/A', 'PASS'],
            ['"I slept 7 hours, feeling happy, exercised"', 'LOG_BEHAVIOR', 'N/A', 'PASS'],
            ['"What\'s the capital of France?"', 'unknown (general knowledge)', 'N/A', 'PASS'],
            ['"Hi, how are you?"', 'unknown (conversational)', 'N/A', 'PASS'],
            ['"Create those tasks" (after previous list)', 'create_tasks_bulk (from context)', 'N/A', 'PASS'],
            ['"Gym at 8am every day starting next week for 2 weeks"', 'create_task_and_schedule + DAILY + repeatUntil', 'DAILY', 'PASS'],
        ],
        [3100, 2500, 1800, 800],
    ),
    sp(),
    tbl(
        ['Test Category', 'Cases', 'Passed', 'Accuracy'],
        [
            ['Task creation (deadline handling)', '10', '9', '90%'],
            ['Schedule creation + recurrence', '12', '11', '92%'],
            ['Bulk operations', '6', '6', '100%'],
            ['Read/delete operations', '6', '6', '100%'],
            ['Unknown classification (no hallucination)', '6', '6', '100%'],
            ['OVERALL', '40', '38', '95%'],
        ],
        [3000, 1500, 1500, 2860],
    ),
    sp(),

    h3('6.1.6 Security Tests'),
    tbl(
        ['ID', 'Test', 'Attack / Input', 'Expected Defense', 'Result'],
        [
            ['SEC-01', 'SQL Injection', 'Task title: "test\'; DROP TABLE tasks; --"', 'Prisma parameterized query — no raw SQL execution', 'PASS'],
            ['SEC-02', 'Stored XSS', 'Task description: "<script>alert(1)</script>"', 'Stored as plaintext; React auto-escapes all output', 'PASS'],
            ['SEC-03', 'API without auth', 'GET /tasks with no Authorization header', '401 Unauthorized from authenticate middleware', 'PASS'],
            ['SEC-04', 'Expired JWT', 'Access token 16 minutes old', '401 — jwt.verify() throws TokenExpiredError', 'PASS'],
            ['SEC-05', 'IDOR (access other user\'s task)', 'Valid token + another user\'s taskId', '404 — service adds userId filter on all queries', 'PASS'],
            ['SEC-06', 'Webhook without signature', 'POST /webhook/razorpay — no signature header', '401 Signature verification failed', 'PASS'],
            ['SEC-07', 'Webhook signature tampering', 'Modified JSON body with original signature', '401 HMAC mismatch', 'PASS'],
            ['SEC-08', 'OTP reuse', 'Submit same valid OTP code twice', '400 OTP already used — isUsed: true blocks reuse', 'PASS'],
            ['SEC-09', 'Plan enforcement', 'FREE plan user calls voice STT endpoint', '403 Voice requires Pro Plus plan', 'PASS'],
            ['SEC-10', 'Credit exhaustion', 'AI request with 0 credit balance', '402 Insufficient credits', 'PASS'],
        ],
        [700, 1800, 2200, 2500, 800],
    ),
    sp(),

    h3('6.1.7 Performance Tests'),
    tbl(
        ['Scenario', 'Measurement Method', 'Result', 'Target', 'Status'],
        [
            ['Task list API (50 tasks)', 'Postman timing', '145 ms avg', '< 500 ms', 'PASS'],
            ['Task list API (200 tasks)', 'Postman timing', '290 ms avg', '< 500 ms', 'PASS'],
            ['Schedule create + conflict check (30 existing)', 'Postman timing', '215 ms avg', '< 500 ms', 'PASS'],
            ['Dashboard overview API', 'Postman timing', '385 ms avg', '< 800 ms', 'PASS'],
            ['AI chat (Gemini) — first token', 'Browser DevTools', '1.3 s', '< 2 s', 'PASS'],
            ['AI chat (Sarvam-M) end-to-end', 'Postman timing', '1.9 s avg', '< 3 s', 'PASS'],
            ['Calendar monthly view render', 'Chrome DevTools', '310 ms', '< 500 ms', 'PASS'],
            ['OTP email delivery', 'Manual inbox check', '3–8 seconds', '< 15 s', 'PASS'],
            ['Landing page initial load (CDN)', 'Chrome DevTools', '1.1 s', '< 2 s', 'PASS'],
            ['Voice pipeline (STT+AI+TTS)', 'Browser timing', '5–8 s total', '< 12 s', 'PASS'],
        ],
        [2500, 1800, 1400, 1400, 800],
    ),

    pb(),
];

module.exports = { content };