# GCP cost optimization (Firebase App Hosting)

Production HTML for **hashtagweb3.com** runs on **Firebase App Hosting** in **`web3-jobs-aggregator`**. Billing is expected here; the goal is to avoid **mistakes and duplicate work**, not to turn off App Hosting.

## Feed compression and secret synchronization: October 5, 2026

The nine public job/event feeds now declare their existing content types in
`next.config.mjs`. Next.js 15.5.25 otherwise forwards the cached route handler's
content type as a single-element array, which its built-in compression filter
rejects. Setting the header before the route handler lets the existing compressor
negotiate gzip or deflate without changing feed generation or making routes dynamic.

The header rules exclude `?mode=agent` wherever that query rewrites to the JSON
agent catalog. The Events feed retains its existing XML behavior for that query.
Feed content types, contents, hourly ISR, CDN cache lifetimes and middleware
exclusions are preserved. Clients without an accepted encoding receive identity
responses. No new compression dependency or application-level feed cache is used.

Local production HTTP verification on the current catalog measured:

| Feed | Identity bytes | Gzip bytes | Reduction |
|---|---:|---:|---:|
| `/jobs/feed.json` | 263,735 | 60,685 | 77.0% |
| `/jobs/feed.xml` | 626,054 | 164,287 | 73.8% |
| `/events/feed.xml` | 1,556,538 | 477,474 | 69.3% |
| `/jobs/adzuna.xml` and `/adzuna.xml`, each | 8,834,211 | 2,528,785 | 71.4% |
| `/jobs/jora.xml` | 216,548 | 48,089 | 77.8% |
| `/jobs/feed-aggregator-us.xml` and `/myjobhelper.xml`, each | 267,412 | 54,479 | 79.6% |
| `/jooble.xml` | 265,167 | 54,479 | 79.5% |

`npm run test:feed-compression` checks the standalone server after every build.
It compares decompressed responses byte-for-byte with generated feed bodies,
checks encoding preferences and exclusions, HEAD and unsupported methods,
conditional requests, agent rewrites, static caching and one-hour revalidation.
These are measured transfer reductions, not a percentage saving on the total bill.
Production measurements must be repeated after the normal daily rollout.

Secret synchronization now covers exactly the seven secrets declared in
`apphosting.yaml`. It no longer compares, creates, reads or grants a Secret Manager
copy of `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, which App Hosting already receives as a
plain configuration value. The project-ID environment fallback used to select the
target project is retained. The unbound `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` is
also excluded. Regression tests reject any drift between YAML bindings and the
synchronization/grant lists, and verify that real secret updates still work.

This change prevents redundant future operations and versions; it does not remove
existing billable versions. Secret Manager DATA_READ auditing was enabled and
verified separately on October 5. Historical-version retirement remains subject
to observed consumers, current references and a reversible disable review. The
first observation review is no earlier than October 12. Deployment cadence and
runtime resources are unchanged.

## Read-only audit: October 1–2, 2026

The supplied billing screenshot totals **₹2,205.59**: App Hosting ₹1,432.61,
Cloud Run ₹522.52, Secret Manager ₹168.39, and Artifact Registry ₹82.07.
The screenshot does not show its billing date range. The separate 3.6 GB usage
screenshot is below the 10 GiB monthly App Hosting allowance; it is not itself
an additional bandwidth charge.

### Findings

- Cloud Monitoring reported approximately **4.64 GiB** and **164,941 requests**
  in the query window October 1, 00:00–22:01 UTC; about **84% of bytes missed
  the CDN cache**. Treat Monitoring windows separately from the billing report.
- A capped 12,000-request sample from 19:35–20:00 UTC contained 404 MB of
  responses: `/events` accounted for 191 MB and `/glossary` for 42 MB. This was
  a peak-period sample, not a complete daily or monthly traffic distribution.
- The previous Events improvements reached production with
  `rollout-2026-10-01-000`, which succeeded at **22:04:49 UTC**. Live Events HTML
  measured **154,976 gzip bytes**, compared with the previously measured 782,197.
- The live `studio` service has **1 vCPU, 2 GiB RAM, zero minimum instances**,
  request-based CPU allocation, and revision-level maximum instances of one.
  The October memory-utilization p99 query reached approximately **98%** for
  `studio`. Reducing memory is not a supported saving based on this evidence.
- Secret metadata showed **153 enabled versions across eight secret names**.
  The deploy script unconditionally creates versions on each run. At published
  prices, 153 automatically replicated versions retained for a full month are
  approximately **$8.82/month** after the six-version allowance, before taxes
  and other account usage. This is a run-rate calculation, not the screenshot's
  historical Secret Manager charge.
- Artifact Registry reported **0.814 GB** in `us-central1/firebaseapphosting-images`
  and **7.391 GB** in the older `asia-south1/cloud-run-source-deploy` repository.
  The latter still backs the legacy `web3-jobs` service. Its complete removal
  would have an upper-bound storage saving near **$0.74/month**, but requires a
  separate dependency and rollback-retention review. Summed image sizes overcount
  shared layers and must not be used as storage-savings estimates.

### Functionality-preserving changes prepared

1. **Glossary serialization:** the directory now receives only the fields its
   client uses. Full descriptions, synonyms and search fields are retained;
   full article content remains available on detail pages and in the public
   glossary catalog. Compressed listing data fell from **415,908 to 15,310 bytes**.
   Local production HTML fell from **468,182 to 46,218 gzip bytes (90.1%)**.
   Automatic prefetch of unopened glossary detail pages is disabled; links still
   navigate normally.
2. **Public feed caching:** an explicit list of public XML/JSON feed routes is
   excluded from Next middleware, making eligible responses available to the
   Firebase CDN. Existing feed contents, item limits and refresh settings are
   preserved, as is `?mode=agent` behavior. Large feeds exceeding Firebase's
   **10 MiB cache limit** are not assumed cacheable. No new compression or
   application-level feed cache was introduced.
3. **Idempotent secret synchronization:** with an explicit backend and working
   gcloud authentication, the sync script compares the desired bytes against the
   enabled latest value through a read-only API call. Identical values reuse
   the existing version. Changed values, unavailable comparisons, disabled
   versions, missing secrets and read failures retain the existing update path.
   Backend access grants still run. Values and access tokens are never logged.

These changes do not delete or disable secret versions, delete containers,
alter production RAM/CPU limits, change autoscaling, or change deployment cadence.
Existing secret versions continue to incur storage charges. The sync change
prevents unnecessary future growth; each avoided group of eight versions avoids
another **$0.48/month of ongoing version storage** if retained for a full month.

At 10,000 glossary requests, the measured HTML reduction avoids about **3.93 GiB**
of transfer: approximately **$0.59–$0.79** at published cached/uncached rates once
the bandwidth allowance is exhausted. Actual monthly savings require the
post-deployment traffic mix; this is not a guaranteed percentage of the whole bill.

### Verification

```sh
npm run test:cost-savings
npm run typecheck
FAH_FAST_PREBUILD=1 OG_PRECOMPUTE=0 OG_FILL_MISSING=0 npm run build
# Uses the local standalone server; set CHROME_BIN if necessary.
npm run test:cost-savings:browser
```

The browser regression compares all 157 rendered cards against the previous
build, exercises synonym search, alphabet/category filters, clear/reset, mobile
layout and detail navigation, verifies feed response content and agent queries,
and checks canonical glossary social previews. Secret-sync tests use mocked
commands and HTTP responses; they exercise byte-exact comparison, failure
fallback, whitespace, Unicode, access grants, CLI symlinks and output redaction.

Prices: [App Hosting and associated services](https://firebase.google.com/docs/app-hosting/costs),
[Secret Manager](https://cloud.google.com/secret-manager/pricing),
[Firebase CDN cache eligibility](https://firebase.google.com/docs/app-hosting/optimize-cache),
[Artifact Registry cleanup policies](https://cloud.google.com/artifact-registry/docs/repositories/cleanup-policy).

The remainder of this document records earlier cost controls; automatic-push
build behavior applies only when automatic rollouts are enabled.

## What drives spend today

| Item | Why it adds up |
|------|----------------|
| **Cloud Build (App Hosting rollouts)** | Each requested rollout runs dependency installation, build, and prebuild scripts; automatic-push builds depend on the backend's rollout policy |
| **`OG_PRECOMPUTE=0`** on FAH; **`OG_FILL_MISSING=0`** (OG PNGs from ingest commits) | No build-time OG pass on deploy |
| **Incremental `precompute:og-incremental`** on ingest + event publish | New/changed jobs/companies/events only |
| **Review `OG_PRECOMPUTE`** — set `1` only for one-off full regen (`--full` previews) | Emergency only |
| **Automated commits to `main`** | With automatic rollouts enabled, bot commits can create extra builds; GitHub `[skip ci]` does not control Firebase's separate rollout policy |
| **Overlapping rollouts** | Several pushes close together queue multiple builds; only the latest revision matters — older builds still bill |
| **Artifact Registry** | `firebaseapphosting-images` storage per image layer |
| **Runtime** | [`apphosting.yaml`](../apphosting.yaml) uses **`minInstances: 0`** (good). Traffic scales to **`maxInstances: 1`** — avoid raising min instances unless you need always-on |
| **Legacy [`cloudbuild.yaml`](../cloudbuild.yaml)** | Separate **Cloud Run** deploy (`web3-jobs`, `asia-south1`, **E2_HIGHCPU_8**) — if a trigger still exists in GCP, it bills **in addition** to App Hosting |

## Avoidable mistakes

1. **Two deploy pipelines for the same app** — Confirm in [Cloud Build → Triggers](https://console.cloud.google.com/cloud-build/triggers?project=web3-jobs-aggregator) whether **`cloudbuild.yaml` / Cloud Run `web3-jobs`** is still enabled. Disable if App Hosting is the only target.
2. **Stale GCP project `web3-job-board-aggregator`** — See [`GCP_RETIRE_LEGACY_PROJECT.md`](GCP_RETIRE_LEGACY_PROJECT.md). **Do not re-enable billing** there unless you need that project.
3. **Turn off legacy CI you don’t use** — **Deploy Cloudflare Worker** workflow is disabled (`if: false`); production is Firebase-only.
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

Firebase App Hosting's automatic rollout policy is separate from GitHub Actions path filters. Check the actual backend policy before attributing build spend to every push.

## OG PNGs and preview shells (incremental)

| Step | Where |
|------|--------|
| **Daily ingest** ([`refresh-jobs-ingest.yml`](../.github/workflows/refresh-jobs-ingest.yml)) | `npm run precompute:og-incremental` → fingerprint-new/changed job & company PNGs, prune removed slugs, update bot preview HTML → commit `public/og/` + `public/preview/` |
| **Event publish** ([`refresh-jobs-cache.yml`](../.github/workflows/refresh-jobs-cache.yml)) | `precompute-events-runtime` + incremental previews + **`prune-stale-event-covers`** → commit `content/events-runtime.json`, `public/events/` (live covers only), preview deltas |
| **FAH build** | **`FAH_FAST_PREBUILD=1`** reuses unchanged artifacts, rebuilds changed/missing dependencies, refreshes preview metadata, and runs smoke gates; full OG PNG generation is off |

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

Full checklist: [`GCP_RETIRE_LEGACY_PROJECT.md`](GCP_RETIRE_LEGACY_PROJECT.md) (Console steps + `scripts/retire-stray-gcp.py`).

Do **not** use this checklist on **`web3-jobs-aggregator`** if that is your live production project.

## Repo guardrails

- [`apphosting.yaml`](../apphosting.yaml): `minInstances: 0`, `OG_PRECOMPUTE=0`, `OG_FILL_MISSING=0`, **`FAH_FAST_PREBUILD=1`** at BUILD. Catalog copy runs once in prebuild via [`scripts/sync-public-catalog-assets.sh`](../scripts/sync-public-catalog-assets.sh).  
- **Event cover bloat:** `public/events/` should only hold covers referenced by the live listing (+ overrides). Run `npm run prune:stale-event-covers` locally; CI runs it on publish. Guard: `npm run test:stale-event-covers`.  
- **Git pack history:** Old monolithic `content/job-descriptions.json` blobs may still inflate `.git` (~1 GiB pack). Removing them needs a history rewrite: [`scripts/shrink-git-drop-job-descriptions.sh`](../scripts/shrink-git-drop-job-descriptions.sh) then `git push --force-with-lease origin main` (coordinate with anyone else using the repo).  
- [`docs/FIREBASE_AND_CLOUDFLARE.md`](FIREBASE_AND_CLOUDFLARE.md): production hosting reference (filename kept for existing links).
