# Firebase + Cloudflare Workers (dual setup)

Hashtag Web3 is **served on Cloudflare Workers** (OpenNext). Firebase is **not** the web host anymore; it is optional **backend data** for a few features.

**High GCP bills?** See [`GCP_COST_AND_SHUTDOWN.md`](GCP_COST_AND_SHUTDOWN.md) — turn off Firebase App Hosting on `web3-job-board-aggregator`; do not re-enable billing just to fix Artifact Registry errors.

## What Firebase is used for

| Feature | API / code | Needs |
|---------|------------|--------|
| Legacy job-alert subscriber list | `POST /api/send-job-alerts` | Firestore `subscribers` + Admin SDK |
| LinkedIn OAuth token storage | `GET /api/auth/linkedin/callback` | Firestore `config/linkedin` + Admin SDK |

Public job board, Resend broadcasts, and unsubscribe use **Resend** and **static JSON** — not Firestore.

**Switching Firebase projects does not fix Cloudflare Error 1102.** That is Worker CPU/memory on the Next.js bundle. Keep the static-json and precompute work on Cloudflare; use Firebase only where Firestore is required.

## Connect a new Firebase project

1. [Firebase Console](https://console.firebase.google.com/) → **Add project** (or pick an existing one).
2. **Build → Firestore Database** → create DB (production mode is fine; deploy rules below).
3. **Project settings → General → Your apps → Web** → register app → copy the `firebaseConfig` values.
4. **Project settings → Service accounts → Generate new private key** → save JSON (never commit it).
5. Deploy Firestore rules from this repo:
   ```bash
   firebase use <your-project-id>
   firebase deploy --only firestore:rules
   ```
6. Put secrets in **GitHub → Settings → Secrets** (same names as today, **new values**):
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (optional)
   - `FIREBASE_SERVICE_ACCOUNT_KEY` — entire service-account JSON as one line, **or** base64-encoded JSON
7. **Actions → Sync Cloudflare Worker secrets** (workflow_dispatch) to push them to the `hashtagweb3` Worker.
8. Local dev: mirror the same vars in `.env.local` (see `.env.example`).

## Verify

```bash
npx tsx scripts/verify-firebase-connection.ts
```

Then on production (with `CRON_SECRET`):

- `POST /api/send-job-alerts` with `{ "jobs": [...], "dryRun": true }` should not return `DB_NOT_CONFIGURED`.

## Cloudflare stays primary

- Deploy site: **Deploy Cloudflare Worker** workflow or `npm run deploy:cloudflare`.
- Do **not** point `hashtagweb3.com` DNS back to Firebase App Hosting if Workers is production.
- `apphosting.yaml` is legacy; safe to ignore unless you run a staging backend on Firebase.

For **Firestore + Cloudflare only**, you can skip App Hosting entirely: complete steps 1–7 above and ignore Firebase App Hosting rollouts.

## Optional: Firebase App Hosting on a new project

If you connect GitHub to **App Hosting** in `web3-jobs-aggregator` (or any new project), Cloud Build runs **before** `npm run build`. Step **preparer** reads secrets named in [`apphosting.yaml`](../apphosting.yaml) from **Google Cloud Secret Manager** in that same GCP project.

### Error: `fah/misconfigured-secret` / `secretmanager.versions.get` PermissionDenied

The secret is missing **or** the App Hosting backend service account cannot read it. GitHub Actions secrets do **not** apply to App Hosting; you must configure secrets in the **new** Firebase/GCP project.

1. Install/login Firebase CLI and select the project:
   ```bash
   firebase login
   firebase use web3-jobs-aggregator
   ```
2. Create each secret (repeat for every `secret:` entry in `apphosting.yaml`):
   ```bash
   firebase apphosting:secrets:set NEXT_PUBLIC_FIREBASE_API_KEY
   firebase apphosting:secrets:set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   firebase apphosting:secrets:set NEXT_PUBLIC_FIREBASE_PROJECT_ID
   firebase apphosting:secrets:set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   firebase apphosting:secrets:set NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   firebase apphosting:secrets:set NEXT_PUBLIC_FIREBASE_APP_ID
   firebase apphosting:secrets:set NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
   firebase apphosting:secrets:set RESEND_API_KEY
   firebase apphosting:secrets:set CRON_SECRET
   ```
   Paste the same values you use in GitHub (new Firebase web config + Resend + cron secret).

3. Grant the backend access (use your backend ID from **Firebase → App Hosting → Backend settings**):
   ```bash
   firebase apphosting:secrets:grantaccess NEXT_PUBLIC_FIREBASE_API_KEY --backend <backend-id>
   ```
   Grant access for **each** secret above, or use the bulk grant flow shown in the [secret parameters doc](https://firebase.google.com/docs/app-hosting/configure#secret-parameters).

4. **Redeploy** the App Hosting backend (new rollout from console or push to the connected branch).

### Automated sync from GitHub (recommended)

**Actions → Sync Firebase App Hosting secrets** runs [`scripts/sync-firebase-apphosting-secrets.sh`](../scripts/sync-firebase-apphosting-secrets.sh) with values from GitHub secrets.

Requirements:

1. **`FIREBASE_APPHOSTING_SERVICE_ACCOUNT_KEY`** — service account JSON from the **App Hosting** project (`web3-jobs-aggregator`), **or** grant your existing `FIREBASE_SERVICE_ACCOUNT_KEY` principal access **on that project** (see failed workflow log: it prints `client_email` to add in [IAM](https://console.cloud.google.com/iam-admin/iam?project=web3-jobs-aggregator)).
2. **`NEXT_PUBLIC_FIREBASE_*`** in GitHub must match the **same** Firebase project as App Hosting (not the old `web3-job-board-aggregator` values).
3. Re-run the workflow, then trigger a new App Hosting rollout.

**Actions → Sync Cloudflare Worker secrets** is separate — run that after updating GitHub Firebase secrets so Workers stay in sync.

Also add **`FIREBASE_SERVICE_ACCOUNT_KEY`** (or JSON) to **GitHub** and sync to Cloudflare if job alerts / LinkedIn need Admin SDK on Workers — App Hosting does not use that variable from `apphosting.yaml` today; Workers do.
