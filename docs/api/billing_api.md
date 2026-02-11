# 💳 Billing & Plans API

This module handles Subscriptions, Plan Management, and Webhooks.

**Base URL:** `/api/billing`

---

## 💎 Plans & Credits System

The system operates on a tiered plan model with **Monthly Resource Limits** and **AI Credits**.

### Plan Tiers
| Plan | Price (INR) | Task Limit | Schedule Limit | AI Credits (Monthly) |
|------|-------------|------------|----------------|----------------------|
| **FREE** | ₹0 | 20 | 30 | 0 |
| **PRO** | ₹499 | 1000 | 1000 | 50 |
| **PRO_PLUS** | ₹999 | 10,000 | 10,000 | 90 |

### AI Usage Costs (Credits)
Credits are deducted per action:
- **Chat (GPT-4o)**: 1 Credit / request
- **Voice Input (Whisper)**: 3 Credits / request
- **Voice Response (TTS)**: 3 Credits / response
- **Tool Usage (Search)**: 1 Credit / action

---

## 1. Subscribe (Create Order)
Initiate a new subscription.

- **Method:** `POST`
- **URL:** `/subscribe`
- **Auth Required:** Yes

### Request Body
```json
{
  "plan": "PRO", // PRO, PRO_PLUS
  "billingCycle": "MONTHLY" // MONTHLY, YEARLY
}
```

### Success Response (200)
Returns Razorpay Subscription ID. Frontend should open Razorpay Checkout.
```json
{
  "success": true,
  "data": {
    "id": "sub_K...",
    "entity": "subscription",
    "short_url": "..."
  }
}
```

---

## 2. Get Current Subscription
Get details of the active plan.

- **Method:** `GET`
- **URL:** `/current`
- **Auth Required:** Yes

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "plan": "PRO",
    "isActive": true,
    "billingCycle": "MONTHLY",
    "creditsBalance": 45,
    "nextBillingAt": "2024-06-25T00:00:00.000Z"
  }
}
```

---

## 3. Cancel Subscription
Stops auto-renewal. Benefits persist until the cycle ends.

- **Method:** `POST`
- **URL:** `/cancel`
- **Auth Required:** Yes

### Success Response (200)
```json
{
  "success": true,
  "message": "Subscription cancelled. Access remains until end of cycle."
}
```

---

## 4. Downgrade Plan
Switch to a lower tier (effective at the end of the current billing cycle).

- **Method:** `POST`
- **URL:** `/downgrade`
- **Auth Required:** Yes

### Request Body
```json
{
  "newPlan": "PRO"
}
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Plan downgrade scheduled for next billing cycle."
}
```

---

## 5. Webhooks (Razorpay)
Handle async payment events.

- **Method:** `POST`
- **URL:** `/api/webhook/razorpay` (Note: Root /api path)
- **Auth Required:** Public (Signature Verified)

**Handled Events:**
- `subscription.charged`: Grants credits, renews access.
- `subscription.cancelled`: Marks subscription ensuring expiry.
- `payment.captured`: Records successful payments.
