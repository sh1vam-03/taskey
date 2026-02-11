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

## 3. Downgrade Plan
Downgrade to a lower tier (effective at end of cycle).
- **URL:** `/downgrade`
- **Method:** `POST`
- **Body:** `{"newPlan": "PRO"}`

## 4. Get Current Subscription
- **URL:** `/current`
- **Method:** `GET`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "plan": "PRO",
      "isActive": true,
      "billingCycle": "MONTHLY"
    }
  }
  ```

---

## 5. Webhooks (Razorpay)
**Endpoint:** `POST /api/webhook/razorpay`
- **Access:** Public (Signature Verified)
- Handles `subscription.charged`, `subscription.cancelled`, `payment.captured`.
- Updates `User.plan` and subscription status automatically.
