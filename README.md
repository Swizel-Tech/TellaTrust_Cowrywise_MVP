# TellaTrust

A savings & investment platform **prototype / proof of concept**, built by
**Swizel Technologies Limited** for Mr Joshua Edobor. Modeled on Cowrywise.

> This is a POC. Auth, database, RBAC and business logic are real; **money movement
> is simulated** (no live payment gateway). A "DEMO" badge stays visible in the UI.

## Monorepo layout

```
.
├── apps/
│   ├── web/        Customer PWA (React + Vite + TS + Tailwind, installable)
│   └── admin/      Admin console (role-gated dashboard shell)
├── functions/      Firebase Cloud Functions (TypeScript) — server-only logic
├── packages/
│   └── shared/     Shared domain types & helpers
├── firestore.rules        Role-aware security rules
├── firestore.indexes.json
├── firebase.json
└── netlify.toml           Builds apps/web; admin deploys as a separate Netlify site
```

## Prerequisites

- Node.js 18+
- npm 9+ (workspaces)
- A Firebase project (Auth + Firestore) and the Firebase CLI (`npm i -g firebase-tools`)

## Getting started

```bash
# 1. install all workspace deps from the repo root
npm install

# 2. add your Firebase keys
cp .env.example apps/web/.env      # fill in VITE_FIREBASE_* values
cp .env.example apps/admin/.env

# 3. run the customer app  (http://localhost:5173)
npm run dev:web

# run the admin console    (http://localhost:5174)
npm run dev:admin
```

The app boots even before Firebase keys are added — the splash sequence and landing
page render in "preview mode"; auth-dependent screens come online once keys are set.

## Deploying

- **Web (customer):** Netlify, using the root `netlify.toml` (base `apps/web`).
- **Admin:** a second Netlify site from the same repo with base `apps/admin`.
- **Backend:** `firebase deploy --only firestore:rules,functions`.

## Roadmap (see the build plan PDF)

Phase 2 foundation is scaffolded here. Next: auth & onboarding, wallet & savings,
investments & growth tools, the full admin (users, KYC, products, support inbox,
filterable/exportable **activity logs**), notifications and live support chat.

---
© Swizel Technologies Limited — You Imagine, We Build · swizel.co
