# 💳 Billing & Subscription API

Base URL: `/api/billing`

## Middleware
- `authMiddleware`: Required for all actions.

---

## 1. Subscribe (Create Order)
Initiate a new subscription (PRO, PRO_PLUS, ULTRA).
- **URL:** `/subscribe`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "plan": "PRO",
    "billingCycle": "MONTHLY"
  }
  ```
- **Response:**
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
- **Note:** Implementation uses Razorpay Subscriptions. Frontend should open Razorpay Checkout with this ID.

## 2. Cancel Subscription
Stops auto-renewal. Access continues until the cycle end.
- **URL:** `/cancel`
- **Method:** `POST`

## 3. Webhooks (Razorpay)
**URL:** `/api/webhook/razorpay`
- Handles `subscription.activated`, `invoice.payment_paid`, `subscription.cancelled`, `invoice.payment_failed`.
- Updates `User.plan` and `User.aiTokenBalance`.
