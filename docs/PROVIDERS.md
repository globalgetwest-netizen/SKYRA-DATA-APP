# Provider Integration Guide

How to connect **real** telecom (data) and payment providers to Skyra Data. The
guiding rule:

> The mobile app never talks to a telecom or payment provider directly, and
> never holds a secret key. All provider integration lives on the backend.

```
Expo app  →  Skyra Data backend  →  Payment provider  →  Data/Telecom provider  →  Ghana network
```

---

## 1. What the client already gives you

- A stable `DataService` contract (`src/services/types.ts`) the whole UI depends
  on. Real integration is a **backend** job plus config — no UI rewrite.
- Idempotency keys on order + payment creation (dedupe on your side).
- A client payment registry (`src/services/payment/providers.ts`) that decides
  which methods to render and how to finish a charge (`poll` vs `redirect`).

To go live, set:

```bash
EXPO_PUBLIC_USE_MOCK_DATA=false
EXPO_PUBLIC_API_BASE_URL=https://api.yourdomain.com
EXPO_PUBLIC_PAYMENT_PUBLIC_KEY=pk_live_...   # publishable key ONLY (not secret)
```

Everything else — secret keys, provider credentials, webhook secrets — lives on
the backend as environment variables.

---

## 2. Payment providers

The client models two completion styles; pick per provider in
`getActiveProvider()`:

| Completion | Meaning | Client behaviour |
|-----------|---------|------------------|
| `redirect` | Backend returns a hosted `authorizationUrl` | Open the URL, then poll status |
| `poll` | Provider charges the wallet directly (mobile money) | Poll status only |

### Paystack (example, `redirect`)

Backend flow:

1. `POST /payments/initialize` → call Paystack **Initialize Transaction** with
   your **secret** key, `amount` (in pesewas), `email`/phone, and `channels`
   (`mobile_money`, `card`). Return Paystack’s `authorization_url` to the client
   as `authorizationUrl`.
2. Client opens the URL; the user pays.
3. **Webhook**: verify the `x-paystack-signature` header (HMAC-SHA512 of the raw
   body with your secret). On `charge.success`, mark the order `PAYMENT_SUCCESS`
   and begin fulfilment.
4. Also support **verification-on-poll**: when the client calls
   `GET /payments/:id/status`, verify with Paystack’s **Verify Transaction**
   endpoint if you haven’t received the webhook yet. Never trust the client.

### Flutterwave (example, `redirect` or `poll`)

- Use **Charge** (mobile money GH) or **Standard** checkout. Verify via webhook
  (`verif-hash` header) and/or the verify endpoint. Same rule: backend-verified
  only.

### Adding a provider

1. Implement it on the backend behind your own payment interface.
2. Add a `PaymentProviderConfig` entry in `providers.ts` (name + supported
   methods + completion style) and select it in `getActiveProvider()`, or have
   the backend advertise the active provider/methods and drive the UI from that.
3. No screen changes required — the payment screen renders whatever methods the
   active provider exposes.

---

## 3. Data / telecom fulfilment

After payment is **verified**, the backend calls your data provider (an
aggregator/reseller API that delivers bundles to MTN / Telecel / AT, or a direct
carrier integration) to deliver the purchased bundle to the recipient MSISDN.

Backend responsibilities:

- Keep a **catalogue** (`/networks`, `/networks/:network/bundles`) sourced from
  the provider so prices are always real and current.
- Validate the recipient number and that it matches the bundle’s network before
  charging (numbers are portable — resolve the true carrier server-side).
- Only transition an order to `SUCCESS` once the provider **confirms delivery**.
  If delivery fails after a successful charge, move to `FAILED` →
  `REFUND_PENDING` and reconcile. Never report delivery you can’t confirm.
- Handle provider webhooks for async fulfilment confirmation and reconciliation.

### Fulfilment state mapping

| Provider event | Order status |
|---------------|--------------|
| Payment verified | `PAYMENT_SUCCESS` |
| Fulfilment submitted / pending | `FULFILMENT_PROCESSING` |
| Delivery confirmed | `SUCCESS` |
| Delivery failed (paid) | `FAILED` → `REFUND_PENDING` |
| Refund settled | `REFUNDED` |

---

## 4. Webhooks (backend only)

- Verify **every** webhook signature against the raw request body using the
  provider’s secret. Reject unsigned/invalid payloads.
- Make webhook handlers **idempotent** (providers retry).
- Treat webhooks and status-verification as complementary; whichever confirms
  first wins, and the other must be a safe no-op.

---

## 5. Security checklist

- [ ] No secret keys in the Expo client (only `EXPO_PUBLIC_PAYMENT_PUBLIC_KEY`).
- [ ] Backend verifies payment independently before fulfilment.
- [ ] Order + payment creation idempotent on `Idempotency-Key`.
- [ ] Webhook signatures verified; handlers idempotent.
- [ ] Server-side pricing (never trust client amounts).
- [ ] Recipient MSISDN + network validated server-side.
- [ ] Rate limiting + OTP expiry/attempt limits on auth endpoints.
- [ ] HTTPS everywhere in production.

---

## 6. Going live checklist

1. Deploy the backend implementing [`docs/API.md`](API.md).
2. Configure provider secret keys + webhook secrets as backend env vars.
3. Point `EXPO_PUBLIC_API_BASE_URL` at production; set the publishable payment
   key; `EXPO_PUBLIC_USE_MOCK_DATA=false`.
4. Set the real EAS `projectId` in `app.json`.
5. `eas build --profile production` and submit to the App Store / Play Store.
