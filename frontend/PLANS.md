🎯 CORE PRICING ARCHITECTURE

You have two completely different credit types:

1️⃣ Subscription Credits (plan-based)
2️⃣ Top-Up Credits (purchased separately)

They MUST be stored separately.
Never mix them.

🧠 CREDIT LIFECYCLE RULES
✅ 1. Subscription Credits

They are:

Recurring

Time-based

Expiring

Automatically refreshed

But lifecycle depends on plan type.

🟢 MONTHLY PLAN LOGIC

Example:

Plan: PRO Monthly
Price: ₹29/month
Credits: 300/month
Lifecycle:

User pays ₹29

System adds 300 subscription credits

Credits expire at end of billing period

Auto-renew runs next month

System clears old subscription credits

Adds new 300 credits

Important:

At renewal:

subscription_credits = 300

Not:

subscription_credits += 300

You RESET. Not accumulate.

🟢 YEARLY PLAN LOGIC

Example:

Plan: PRO Yearly
Price: ₹299/year
Total: 3600/year
But distributed as 300/month

This is where many developers make mistakes.

Payment:

User pays ₹299 upfront.

But credits are NOT added 3600 at once.

Instead:

Each month:

Add 300 subscription credits
🔁 Yearly Lifecycle Timeline

Month 1:

Add 300

Expires at end of year plan

Month 2:

Add 300

Expires at end of year plan

Month 3:

Add 300

Expires at end of year plan

...

Month 12:

Add 300

At end of year:

All unused subscription credits expire

If renewed → restart cycle

⚠️ VERY IMPORTANT DIFFERENCE
Plan Type	Credit Added	Expiry
Monthly	Full monthly amount	End of that month
Yearly	Monthly portion only	End of yearly plan
🟡 2. TOP-UP CREDITS LOGIC

Top-up credits:

Never expire

Never reset

Never get deleted at renewal

Stack permanently

If user buys:

₹49 → 450 credits

Then:

topup_credits += 450

And they stay forever.

🧱 DATABASE DESIGN (VERY IMPORTANT)

User table should NOT have:

credits: number

Instead use:

subscription_credits: number
topup_credits: number
subscription_expires_at: date
subscription_plan_type: "monthly" | "yearly"
subscription_monthly_allocation: number
💳 HOW CREDIT DEDUCTION MUST WORK

When AI usage happens:

Always deduct in this order:

1️⃣ subscription_credits
2️⃣ topup_credits

Why?

Because subscription credits expire.
Top-up does not.

So consume expiring credits first.

🔄 MONTHLY CRON JOB LOGIC

You need scheduled jobs.

🕒 Monthly Plan Cron

Run daily check:

If:

now >= subscription_expires_at

Then:

If auto-renew successful:

subscription_credits = monthly_allocation
subscription_expires_at = +1 month

Else:

subscription_credits = 0
plan_status = expired
🕒 Yearly Plan Monthly Distribution Cron

For yearly plan:

Every month check:

if current_month > last_credit_distributed_month

Then:

subscription_credits += monthly_allocation

But DO NOT reset existing credits.

Expire all at year-end.

🎯 FULL CREDIT PRIORITY SYSTEM

When user consumes 50 credits:

if subscription_credits >= 50
    deduct from subscription
else
    deduct remaining from topup
🔥 EDGE CASES
1. Upgrade Monthly → Yearly

Clear remaining subscription credits

Start new yearly cycle

2. Downgrade Yearly → Monthly

Clear subscription credits

Start monthly fresh

3. Cancel Subscription

Subscription credits remain until expiration

After expiration → remove

Top-up remains forever

🏗 REAL PRODUCTION FLOW

User → Payment success webhook → Update subscription → Credit allocation → Schedule renewal job.

Do NOT trust frontend.
Always verify via payment gateway webhook.

🧠 CREDIT STATE MACHINE
ACTIVE
↓
EXPIRED
↓
RENEWED
↓
RESET

For yearly:

ACTIVE_YEAR
↓ monthly allocation
↓
ACTIVE_YEAR
↓
EXPIRED_YEAR
↓
RENEWED_YEAR
💡 WHY THIS DESIGN IS PROFESSIONAL

Because:

Clear separation of credit types

Deterministic lifecycle

No hidden accumulation

Predictable accounting

Prevents abuse

Easy revenue tracking

🧾 FINAL SYSTEM SUMMARY FOR YOUR AI AGENT
Two credit types:
- subscription_credits (expiring)
- topup_credits (non-expiring)

Monthly:
- Add full monthly credits
- Reset every renewal

Yearly:
- Add monthly portion each month
- Expire at end of yearly cycle

Consumption:
- Deduct subscription first
- Then top-up

Renewal:
- Triggered by payment webhook
- Never by frontend