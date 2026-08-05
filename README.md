# Skyra Data

A Ghana-focused mobile app for buying mobile data bundles across the major
Ghanaian networks — **MTN Ghana**, **Telecel Ghana** and **AT Ghana** — from
one fast, native experience.

Built with React Native + Expo (TypeScript). The app ships with a fully
isolated development mock so the entire flow is runnable today, and a clean
provider seam so real telecom and payment backends drop in without touching the
UI.

> Skyra Data is an independent product. It is not affiliated with any other
> brand, group or ecosystem.

---

## Highlights

- **One-screen purchase** — choose network, enter recipient, pick a bundle, and
  review, all from Home.
- **Real transaction state machine** — `PENDING_PAYMENT → PAYMENT_PROCESSING →
  PAYMENT_SUCCESS → FULFILMENT_PROCESSING → SUCCESS | FAILED …`. The UI only ever
  reflects backend-confirmed state; it never fabricates success.
- **Provider abstraction** — a single `DataService` interface backs the whole
  app. Flip one flag to swap the in-memory mock for the real backend.
- **Payment-secret-free client** — the app never holds payment/telecom secret
  keys. Charging and verification happen on the backend.
- **Idempotent purchases** — an idempotency key is minted per purchase draft so
  double taps and retries can’t create duplicate orders.
- **Secure sessions** — auth tokens live in the device Keychain/Keystore via
  Expo SecureStore; only non-sensitive preferences use AsyncStorage.
- **Polished, minimal UI** — Inter typography, a restrained white interface,
  subtle motion (Reanimated), haptics, skeletons, and full empty/error/offline
  states.

---

## Tech stack

| Concern | Choice |
|--------|--------|
| Framework | React Native + Expo (SDK 52), TypeScript |
| Navigation | Expo Router (typed routes) |
| Server state | TanStack Query |
| Client state | Zustand |
| Forms & validation | React Hook Form + Zod |
| Motion / gestures | Reanimated, Gesture Handler |
| Secure storage | Expo SecureStore (tokens), AsyncStorage (prefs) |
| Design system | Centralised StyleSheet tokens + primitives |
| Builds | EAS Build (`eas.json`) |

---

## Getting started

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env
# .env defaults to development + mock data — runnable immediately.

# 3. Run
npx expo start
```

Open in Expo Go or a development build. The app starts on **Home** and, in mock
mode, a bright banner makes development mode unmistakable.

### Type-check

```bash
npm run typecheck
```

---

## Development vs production data

A single flag decides the entire data layer.

```bash
EXPO_PUBLIC_USE_MOCK_DATA=true    # isolated in-memory mock (dev only)
EXPO_PUBLIC_USE_MOCK_DATA=false   # real Skyra Data backend
```

- In mock mode, networks, bundles, payment and fulfilment are simulated
  locally, including a timed transaction state machine and an occasional
  simulated failure so failure UX is testable. Prices are **illustrative
  placeholders, not real tariffs**.
- Production builds **force mock off** (see `src/config/env.ts`) so a shipped
  app can never accidentally serve fake data.

See [`docs/API.md`](docs/API.md) for the backend contract and
[`docs/PROVIDERS.md`](docs/PROVIDERS.md) for connecting real telecom and payment
providers.

---

## Architecture

```
UI (screens/components)
      │  depends only on hooks + the DataService interface
State (Zustand: auth, purchase, recipients)
      │
Hooks (TanStack Query) ── api: DataService ──┐
                                             │  swappable behind USE_MOCK_DATA
                     ┌───────────────────────┴───────────────────────┐
             MockDataService (dev)                       HttpDataService (prod)
                                                                 │
                                                     Skyra Data Backend API
                                                                 │
                                          Payment Provider · Telecom/Data Provider
                                                                 │
                                                      Ghana Mobile Network
```

The seam is `src/services/types.ts` (`DataService`). Every screen imports the
shared `api` object and never knows which implementation is behind it.

### Project structure

```
app/                         # Expo Router routes
├── _layout.tsx              # providers, fonts, dev banner, root stack
├── index.tsx                # entry gate (guest-friendly → Home)
├── auth/                    # login · register · verify-otp
├── (tabs)/                  # home · activity · recipients · profile
├── purchase/                # review · payment · processing · success
├── transactions/[id].tsx    # transaction detail / receipt
├── support/                 # help centre + report a transaction
├── settings/                # preferences & legal
└── modal-add-recipient.tsx  # add saved recipient (modal)

src/
├── api/                     # http client, errors, query client
├── components/              # ui primitives + purchase/transaction pieces
├── config/                  # typed env access
├── hooks/                   # TanStack Query hooks
├── lib/                     # secure store + async storage wrappers
├── services/                # DataService: mock + http impls, payment registry
├── store/                   # Zustand stores
├── theme/                   # colors, tokens, design system
├── types/                   # Zod schemas + inferred types (the contract)
└── utils/                   # phone (Ghana MSISDN), formatting, ids
```

> **Design note.** The brief’s suggested route tree splits network/recipient/
> bundle into separate screens. Skyra Data instead combines selection on Home
> for a faster “buy in as few steps as possible” flow, then runs a linear
> `review → payment → processing → success` checkout. This is an intentional,
> documented improvement on the suggested structure.

---

## Primary user journey

```
Home (network · recipient · bundle)
  → Review purchase   (backend creates the order; fees/total are authoritative)
  → Payment           (choose method; backend initialises payment)
  → Processing        (poll real status; never assume success)
  → Success           (confirmed fulfilment) → Receipt / Activity
```

---

## Ghana networks & numbers

- Supported: **MTN**, **Telecel**, **AT**.
- The app can pre-select a network from a typed number using local prefixes,
  but this is a convenience only — numbers are portable, so the user can
  override it and the backend performs final validation before charging.
- Numbers are normalised to E.164 (`+233XXXXXXXXX`) before leaving the client.

We deliberately do **not** ship imitation carrier logos. Networks are shown with
a neutral, honest lettermark in the carrier’s brand colour; a licensed brand
asset URL from the backend can replace it later.

---

## Security

- No payment/telecom secret keys, webhook secrets, or provider credentials in
  the client — ever. See [`docs/PROVIDERS.md`](docs/PROVIDERS.md).
- Auth tokens stored with Expo SecureStore (`WHEN_UNLOCKED_THIS_DEVICE_ONLY`).
- HTTPS enforced for the production API base URL.
- Idempotency keys on order/payment creation prevent duplicate charges.
- Session expiry is validated on hydration; expired sessions are cleared.
- Payment verification and fulfilment are always backend-authoritative.

---

## Building

```bash
# Development client
eas build --profile development

# Internal preview (real backend, staging env)
eas build --profile preview

# Production
eas build --profile production
```

Set the real `projectId` in `app.json` (`extra.eas.projectId`) and configure
per-profile env in `eas.json` / EAS secrets before building.

---

## License

Proprietary — all rights reserved.
