# GCP cost optimization (Firebase App Hosting)

Production HTML for **hashtagweb3.com** runs on **Firebase App Hosting** in **`web3-jobs-aggregator`**. Billing is expected here; the goal is to avoid **mistakes and duplicate work**, not to turn off App Hosting.

## What drives spend today

| Item | Why it adds up |
|------|----------------|
| **Cloud Build (App Hosting rollouts)** | Every **`main` push** with GitHub connected runs `npm ci` + full `npm run build` + prebuild scripts |
| **`OG_PRECOMPUTE=0`** on FAH; **`OG_FILL_MISSING=1`** only renders missing PNGs | Build time drops when `public/og` is in git (committed by daily ingest) |
| **Incremental `precompute:og-incremental`** on ingest + event publish | New/changed jobs/companies/events only |
| **Review `OG_PRECOMPUTE`** — set `1` only for one-off full regen (`--full` previews) | Emergency only |
| **Automated commits to `main`** | Daily jobs ingest + 3×/day publish workflows commit **`content/**`** → new rollouts. Social/alerts commits use `[skip ci]` but **still trigger App Hosting** |
| **Overlapping rollouts** | Several pushes close together queue multiple builds; only the latest revision matters — older builds still bill |
| **Artifact Registry** | `firebaseapphosting-images` storage per image layer |
| **Runtime** | [`apphosting.yaml`](../apphosting.yaml) uses **`minInstances: 0`** (good). Traffic scales to **`maxInstances: 1`** — avoid raising min instances unless you need always-on |
| **Legacy [`cloudbuild.yaml`](../cloudbuild.yaml)** | Separate **Cloud Run** deploy (`web3-jobs`, `asia-south1`, **E2_HIGHCPU_8**) — if a trigger still exists in GCP, it bills **in addition** to App Hosting |

## Avoidable mistakes

1. **Two deploy pipelines for the same app** — Confirm in [Cloud Build → Triggers](https://console.cloud.google.com/cloud-build/triggers?project=web3-jobs-aggregator) whether **`cloudbuild.yaml` / Cloud Run `web3-jobs`** is still enabled. Disable if App Hosting is the only target.
2. **Stale GCP project `web3-job-board-aggregator`** — Old App Hosting + billing errors (`firebaseapphosting-images` permission denied). **Do not re-enable billing** there unless you need that project. Delete/disable old backends and triggers (see shutdown section below).
3. **Running GitHub “Deploy Cloudflare Worker”** — Wastes CI time and can confuse which host is live; disable the workflow if Firebase-only.
4. **Letting build queues stack** — Cancel superseded builds (see [`scripts/cancel-old-builds.py`](../scripts/cancel-old-builds.py) pattern for `web3-jobs-aggregator`).

## Reduce cost without leaving Firebase

| Action | Impact |
|--------|--------|
| **Cancel queued/stale Cloud Builds** when several rollouts are pending | Medium — less duplicate build minutes |
| **Batch bot commits** (fewer pushes to `main`) or use a **`content/` branch** merged less often | High — fewer App Hosting builds |
| **Keep `minInstances: 0`** | High if you ever raised it |
| **Review `OG_PRECOMPUTE`** — keep `1` only for a forced full regen; daily ingest commits incremental `public/og` + `public/preview` | High on build time |
| **Prune Artifact Registry** old images | Low–medium storage |
| **Right-size `runConfig`** in `apphosting.yaml` (CPU/RAM) if builds succeed with less | Medium runtime |

Firebase App Hosting does **not** honor GitHub path filters; any push to the connected branch starts a build.

## OG PNGs and preview shells (incremental)

| Step | Where |
|------|--------|
| **Daily ingest** ([`refresh-jobs-ingest.yml`](../.github/workflows/refresh-jobs-ingest.yml)) | `npm run precompute:og-incremental` → fingerprint-new/changed job & company PNGs, prune removed slugs, update bot preview HTML → commit `public/og/` + `public/preview/` |
| **Event publish** ([`refresh-jobs-cache.yml`](../.github/workflows/refresh-jobs-cache.yml)) | `precompute-events-runtime` + incremental previews → commit `content/events-runtime.json` + preview deltas |
| **FAH build** | Skips full OG; **`OG_FILL_MISSING=1`** only renders PNGs that are still absent |

**One-time:** After merging this flow, seed git with existing assets (if not already committed):

```bash
npm run precompute:og-incremental
git add public/og public/preview
git commit -m "chore: seed OG PNGs and preview shells for incremental deploys"
```

Optional full preview rebuild: `npx tsx scripts/precompute-og-previews.ts --full`.

## Billing reports

In [Billing → Reports](https://console.cloud.google.com/billing), filter by:

- Cloud Build  
- App Hosting / Cloud Run (FAH adapter)  
- Artifact Registry  
- Secret Manager (small unless many versions)

Project: **`web3-jobs-aggregator`** (active). Also check **`web3-job-board-aggregator`** for stray charges.

## Shut down old project only (`web3-job-board-aggregator`)

If this project is retired:

1. Firebase Console → **App Hosting** → delete/disable all backends.  
2. Disconnect **GitHub** auto-deploy for this repo on that project.  
3. Delete unused Cloud Build triggers and `firebaseapphosting-*` repos.  
4. Leave billing **off** unless you still need Firestore there.

Do **not** use this checklist on **`web3-jobs-aggregator`** if that is your live production project.

## Repo guardrails

- [`apphosting.yaml`](../apphosting.yaml): `minInstances: 0`, `OG_PRECOMPUTE=0`, `OG_FILL_MISSING=1`, **`FAH_FAST_PREBUILD=1`** at BUILD.  
- [`docs/FIREBASE_AND_CLOUDFLARE.md`](FIREBASE_AND_CLOUDFLARE.md): production hosting reference (filename kept for existing links).
