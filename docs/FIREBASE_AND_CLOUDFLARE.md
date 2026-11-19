# Firebase App Hosting (production)

**Hashtagweb3.com** is served on **Firebase App Hosting** (GCP project **`hashtagweb3-97583`**, backend in [`firebase.json`](../firebase.json)). Builds use [`apphosting.yaml`](../apphosting.yaml) (`npm run build`; **`OG_PRECOMPUTE=0`**, **`OG_FILL_MISSING=0`** — OG PNGs come from git via daily ingest).

The OpenNext/Cloudflare Workers build toolchain has been removed. This document's
filename is retained for existing links. The supported deployment path is Firebase
App Hosting; repository cleanup does not change domain DNS or external accounts.

## What Firebase is used for

| Layer | Role |
|-------|------|
| **App Hosting** | Next.js 15 HTML, middleware, `/api/*` route handlers |
| **Firestore** | Optional product data (rules in [`firestore.rules`](../firestore.rules)) |
| **Secret Manager** | App Hosting env via `firebase apphosting:secrets:*` |
| **Cloud Build** | Every App Hosting rollout (`npm ci` + full prebuild/build) |

Public job board, Resend broadcasts, and unsubscribe use **Resend** + **static JSON** under `content/` and `public/data/` — not Firestore for the main catalog.

LinkedIn/Threads posting uses **GitHub/Action secrets** (`LINKEDIN_ACCESS_TOKEN`, etc.), refreshed via local scripts — not production OAuth callbacks on the site.

## Connect / verify Firebase

1. [Firebase Console](https://console.firebase.google.com/) → project **`hashtagweb3-97583`**.
2. **App Hosting** → confirm backend **`studio`** is connected to this repo and **`main`** (or your deploy branch).
3. **Build → Firestore** (if used) → deploy rules: `firebase deploy --only firestore:rules`.
4. GitHub secrets: `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_SERVICE_ACCOUNT_KEY`, `RESEND_API_KEY`, `CRON_SECRET`, etc. (see `.env.example`).
5. Local: `npx tsx scripts/verify-firebase-connection.ts`.

## App Hosting secrets (Secret Manager)

GitHub Actions secrets **do not** automatically apply to App Hosting. The daily
deployment workflow runs the synchronization script below. For manual setup:

```bash
firebase login
firebase use hashtagweb3-97583
firebase apphosting:secrets:set NEXT_PUBLIC_FIREBASE_API_KEY
# … repeat for each secret in apphosting.yaml / sync script
firebase apphosting:secrets:grantaccess SECRET_NAME --backend studio --project hashtagweb3-97583
```

Script: [`scripts/sync-firebase-apphosting-secrets.sh`](../scripts/sync-firebase-apphosting-secrets.sh).

## Homepage (`/`) 404 on App Hosting

Symptom: `GET /` returns Google’s generic **404** HTML (~272 bytes, **no**
`x-fah-adapter` header) while `GET /jobs` reaches Next.

Observed on the old `studio` backend of `web3-jobs-aggregator`: its edge never
routed `/` to the app, on the default `hosted.app` URL as well as the custom
domain, and no rollout (including redirect-only and static-page builds) changed
that. Other backends on the same code route `/` correctly, so the code is not
the cause.

Fix that worked: serve `hashtagweb3.com` from a backend where `/` reaches Next
(a new backend, or the `hashtagweb3-97583` project), then `src/app/page.tsx`
serves the job board directly. If `/` returns the 272-byte 404 again, test the
`hosted.app` URL of the backend before changing code.

## Deploy flow

1. Push to **`main`**. The normal daily workflow creates the build and rollout;
   automatic Firebase rollouts are disabled.
2. App Hosting runs Cloud Build → `npm run build` (prebuild gates; OG PNGs/previews from git — see [`GCP_COST_OPTIMIZATION.md`](GCP_COST_OPTIMIZATION.md)).
3. New revision serves traffic when rollout completes.

**Note:** `[skip ci]` in commit messages skips many **GitHub Actions** workflows; it does **not** skip Firebase App Hosting when GitHub is connected to the backend.

## Cost

See [`GCP_COST_OPTIMIZATION.md`](GCP_COST_OPTIMIZATION.md) — build frequency, `OG_PRECOMPUTE`, duplicate Cloud Build rollouts, and the old **`web3-job-board-aggregator`** project.

## Runtime catalog recovery

Catalogs load from local `content/` or `public/data/` files first, then recover
through the public site URL when necessary. No Worker context or asset binding is
required. `npm run test:catalog-recovery` exercises retries, malformed responses,
request deduplication and alias isolation.
