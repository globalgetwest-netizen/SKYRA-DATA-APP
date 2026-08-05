# Skyra Data — Backend API Contract

This document defines the HTTP contract the mobile app expects from the Skyra
Data backend when `EXPO_PUBLIC_USE_MOCK_DATA=false`.

The client implementation lives in [`src/services/httpService.ts`](../src/services/httpService.ts)
and every response is validated at the boundary with the Zod schemas in
[`src/types/index.ts`](../src/types/index.ts). If your backend returns a shape
that doesn’t match, the client fails loudly rather than rendering corrupt data.

- **Base URL:** `EXPO_PUBLIC_API_BASE_URL` (HTTPS required in production).
- **Auth:** `Authorization: Bearer <accessToken>` on all endpoints except the
  auth/OTP endpoints (which are anonymous).
- **Content type:** `application/json`.
- **Idempotency:** money-moving requests send an `Idempotency-Key` header. The
  backend MUST treat repeats of the same key as the same operation.
- **Envelopes:** endpoints may return the resource directly or wrapped
  (`{ "networks": [...] }`, `{ "order": {...} }`). The client accepts both.

---

## Conventions

- Money is in **major GHS units** (e.g. `10` = GHS 10.00), currency `"GHS"`.
- Timestamps are ISO-8601 strings.
- Phone numbers are **E.164** (`+233XXXXXXXXX`).
- Errors use standard HTTP status codes with a JSON body:
  ```json
  { "message": "Human-readable, safe to display." }
  ```
  The client maps status → kind: `401 unauthorized`, `403 forbidden`,
  `404 not_found`, `409 conflict`, `422 validation`, `429 rate_limited`,
  `5xx server`. `409`/`422` are surfaced to the user; `network`/`timeout`/`5xx`
  are retryable.

---

## Catalogue

### `GET /networks`

```json
{
  "networks": [
    { "code": "MTN", "name": "MTN Ghana", "logo": null, "status": "available" },
    { "code": "TELECEL", "name": "Telecel Ghana", "logo": null, "status": "available" },
    { "code": "AT", "name": "AT Ghana", "logo": null, "status": "maintenance" }
  ]
}
```

`status`: `available | unavailable | maintenance`.

### `GET /networks/:network/bundles`

`:network` is `MTN | TELECEL | AT`.

```json
{
  "bundles": [
    {
      "id": "bundle_001",
      "network": "MTN",
      "name": "1 GB",
      "volume": 1,
      "unit": "GB",
      "price": 10,
      "currency": "GHS",
      "validity": "24 hours",
      "category": "data",
      "badge": "Popular",
      "available": true
    }
  ]
}
```

> Prices MUST come from the provider/backend. The client never invents pricing.

---

## Orders

### `POST /orders`

Creates an order in `PENDING_PAYMENT`. Send `Idempotency-Key`.

```jsonc
// request
{ "network": "MTN", "bundleId": "bundle_001", "recipient": "+233241234567" }
```

```jsonc
// response 201
{
  "order": {
    "id": "ord_...",
    "reference": "SKY-7F3K2A",
    "status": "PENDING_PAYMENT",
    "network": "MTN",
    "networkName": "MTN Ghana",
    "recipient": "+233241234567",
    "bundle": { "id": "bundle_001", "name": "1 GB", "validity": "24 hours" },
    "amount": 10,
    "fee": 0.5,
    "total": 10.5,
    "currency": "GHS",
    "paymentMethod": null,
    "createdAt": "2026-07-30T12:00:00Z",
    "updatedAt": "2026-07-30T12:00:00Z",
    "failureReason": null
  }
}
```

The backend computes `fee` and `total` — these are authoritative and shown on
the review screen.

### `GET /orders/:id`

Returns the current order (the client polls this while the status is in-flight).

### `GET /orders`

Returns the authenticated user’s orders, newest first: `{ "orders": [ ... ] }`.

### `POST /orders/:id/retry`

Retries fulfilment for a recoverable failed order. Returns the updated order.

---

## Payments

### `POST /payments/initialize`

Initialises payment for an existing order. Send `Idempotency-Key`.

```jsonc
// request
{ "orderId": "ord_...", "method": "mobile_money" }   // or "card"
```

```jsonc
// response
{
  "payment": {
    "paymentId": "pay_...",
    "orderId": "ord_...",
    "provider": "paystack",
    "method": "mobile_money",
    "authorizationUrl": "https://checkout.example.com/...", // or null
    "reference": "SKY-7F3K2A",
    "status": "PAYMENT_PROCESSING"
  }
}
```

- **`authorizationUrl` present** → hosted checkout; the client opens it and then
  polls status.
- **`authorizationUrl` null** → provider charges the wallet directly (mobile
  money); the client polls status.

### `GET /payments/:id/status`

```json
{ "payment": { "paymentId": "pay_...", "orderId": "ord_...", "status": "SUCCESS" } }
```

The client polls this (and/or the order) until a terminal status. **The backend
independently verifies payment and confirms fulfilment before returning
`SUCCESS`.** The client never marks a purchase successful on its own.

---

## Transaction status machine

```
PENDING_PAYMENT → PAYMENT_PROCESSING → PAYMENT_SUCCESS
  → FULFILMENT_PROCESSING → SUCCESS
                          ↘ FAILED → REFUND_PENDING → REFUNDED
PENDING_PAYMENT/… → CANCELLED
```

In-flight (client keeps polling): `PENDING_PAYMENT`, `PAYMENT_PROCESSING`,
`PAYMENT_SUCCESS`, `FULFILMENT_PROCESSING`.
Terminal: `SUCCESS`, `FAILED`, `REFUNDED`, `CANCELLED`.

---

## Authentication (phone + OTP)

### `POST /auth/otp/request` (anonymous)

```jsonc
{ "phone": "+233241234567", "name": "Ama Mensah" }  // name optional (register)
```

```jsonc
{
  "challenge": {
    "challengeId": "otp_...",
    "phone": "+233241234567",
    "expiresInSeconds": 300,
    "devCode": null              // ONLY set in non-production for testing
  }
}
```

Backend responsibilities: OTP expiry, per-number attempt limits, and rate
limiting.

### `POST /auth/otp/verify` (anonymous)

```jsonc
{ "challengeId": "otp_...", "code": "123456" }
```

```jsonc
{
  "session": {
    "accessToken": "…",
    "refreshToken": "…",
    "expiresAt": 1750000000000,   // epoch ms
    "user": {
      "id": "usr_...",
      "phone": "+233241234567",
      "name": "Ama Mensah",
      "email": null,
      "phoneVerified": true
    }
  }
}
```

### `GET /me`

Returns the current `user`.

### `POST /auth/signout`

Invalidates the session server-side (best-effort from the client).

---

## Support

### `POST /support/tickets`

```jsonc
{
  "issueType": "data_not_received",   // data_not_received | charged_twice | wrong_number | payment_failed | other
  "transactionId": "SKY-7F3K2A",      // optional
  "description": "…"
}
```

```jsonc
{ "ticket": { "id": "tkt_...", "reference": "SUP-9K2P4X", "status": "open", "createdAt": "…" } }
```

---

## Notes for backend implementers

- Enforce that a recipient’s `network` and the requested bundle’s `network`
  agree, and validate the MSISDN, before charging.
- Make order/payment creation idempotent on `Idempotency-Key`.
- Never trust client-supplied prices — always price from your catalogue.
- Only transition to `SUCCESS` after the data provider confirms delivery.
