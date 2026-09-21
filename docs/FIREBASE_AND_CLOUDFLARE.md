# Firebase App Hosting (production)

**Hashtagweb3.com** is served on **Firebase App Hosting** (GCP project **`web3-jobs-aggregator`**, backend in [`firebase.json`](../firebase.json)). Builds use [`apphosting.yaml`](../apphosting.yaml) (`npm run build`; **`OG_PRECOMPUTE=0`**, **`OG_FILL_MISSING=1`** — OG PNGs come from git, filled incrementally in CI).

OpenNext / Cloudflare Workers paths in this repo are **legacy** (workflows and scripts may remain for reference). Do not treat Cloudflare as production when changing deploy or DNS docs.

## What Firebase is used for

| Layer | Role |
|-------|------|
| **App Hosting** | Next.js 14 HTML, middleware, `/api/*` route handlers |
| **Firestore** | Optional product data (rules in [`firestore.rules`](../firestore.rules)) |
| **Secret Manager** | App Hosting env via `firebase apphosting:secrets:*` |
| **Cloud Build** | Every App Hosting rollout (`npm ci` + full prebuild/build) |

Public job board, Resend broadcasts, and unsubscribe use **Resend** + **static JSON** under `content/` and `public/data/` — not Firestore for the main catalog.

LinkedIn/Threads posting uses **GitHub/Action secrets** (`LINKEDIN_ACCESS_TOKEN`, etc.), refreshed via local scripts — not production OAuth callbacks on the site.

## Connect / verify Firebase

1. [Firebase Console](https://console.firebase.google.com/) → project **`web3-jobs-aggregator`**.
2. **App Hosting** → confirm backend **`web3-jobs-aggregator`** is connected to this repo and **`main`** (or your deploy branch).
3. **Build → Firestore** (if used) → deploy rules: `firebase deploy --only firestore:rules`.
4. GitHub secrets: `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_SERVICE_ACCOUNT_KEY`, `RESEND_API_KEY`, `CRON_SECRET`, etc. (see `.env.example`).
5. Local: `npx tsx scripts/verify-firebase-connection.ts`.

## App Hosting secrets (Secret Manager)

GitHub Actions secrets **do not** automatically apply to App Hosting. Use **Actions → Sync Firebase App Hosting secrets** or:

```bash
firebase login
firebase use web3-jobs-aggregator
firebase apphosting:secrets:set NEXT_PUBLIC_FIREBASE_API_KEY
# … repeat for each secret in apphosting.yaml / sync script
firebase apphosting:secrets:grantaccess SECRET_NAME --backend web3-jobs-aggregator
```

Script: [`scripts/sync-firebase-apphosting-secrets.sh`](../scripts/sync-firebase-apphosting-secrets.sh).

## Deploy flow

1. Push to **`main`** (or trigger rollout in Firebase Console).
2. App Hosting runs Cloud Build → `npm run build` (prebuild gates; OG PNGs/previews from git — see [`GCP_COST_OPTIMIZATION.md`](GCP_COST_OPTIMIZATION.md)).
3. New revision serves traffic when rollout completes.

**Note:** `[skip ci]` in commit messages skips many **GitHub Actions** workflows; it does **not** skip Firebase App Hosting when GitHub is connected to the backend.

## Cost

See [`GCP_COST_OPTIMIZATION.md`](GCP_COST_OPTIMIZATION.md) — build frequency, `OG_PRECOMPUTE`, duplicate Cloud Build rollouts, and the old **`web3-job-board-aggregator`** project.

## Legacy Cloudflare (optional cleanup)

- Workflow [`.github/workflows/deploy-cloudflare.yml`](../.github/workflows/deploy-cloudflare.yml) — disable in GitHub if unused.
- [`wrangler.jsonc`](../wrangler.jsonc), `npm run deploy:cloudflare` — not production path.
