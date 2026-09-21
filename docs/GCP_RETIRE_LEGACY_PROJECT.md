# Retiring legacy GCP (`web3-job-board-aggregator`)

Production is **`web3-jobs-aggregator`** only — Firebase App Hosting backend **`studio`** (`hashtagweb3.com`).

## Automated (repo + API)

From a machine with the ops service account key:

```bash
python3 scripts/retire-stray-gcp.py          # audit
python3 scripts/retire-stray-gcp.py --apply  # disable LEGACY Cloud Build triggers
```

The script disables triggers on **`web3-jobs-aggregator`** that point at **`cloudbuild.yaml`** / Cloud Run **`web3-jobs`**. It attempts to list **`web3-job-board-aggregator`** (may 403 without cross-project access).

## Repo changes (done)

| Item | Action |
|------|--------|
| [`.firebaserc`](../.firebaserc) | **`default`** → `web3-jobs-aggregator` (was `web3-job-board-aggregator`) |
| [`cloudbuild.yaml`](../cloudbuild.yaml) | Retired stub — **no** valid deploy steps |
| [`cloudbuild.legacy.yaml`](../cloudbuild.legacy.yaml) | Archived Kaniko → Cloud Run `web3-jobs` pipeline |

## Manual — production project `web3-jobs-aggregator`

1. [Cloud Build → Triggers](https://console.cloud.google.com/cloud-build/triggers?project=web3-jobs-aggregator) — confirm **no enabled** trigger for `cloudbuild.yaml` / `web3-jobs`.
2. [Firebase → App Hosting](https://console.firebase.google.com/project/web3-jobs-aggregator/apphosting) — only **`studio`** (or your live backend); **disconnect** duplicate GitHub links if any.
3. Optional: delete unused Cloud Run service **`web3-jobs`** in **`asia-south1`** if you no longer need the old URL.

## Manual — legacy project `web3-job-board-aggregator`

Do **not** re-enable billing unless you still need Firestore/email scripts there.

1. [Firebase Console](https://console.firebase.google.com/project/web3-job-board-aggregator) → **App Hosting** → delete/disable all backends.
2. Disconnect **GitHub** auto-deploy for this repo on that project.
3. [Cloud Build triggers](https://console.cloud.google.com/cloud-build/triggers?project=web3-job-board-aggregator) → delete/disable all.
4. [Artifact Registry](https://console.cloud.google.com/artifacts?project=web3-job-board-aggregator) → delete `firebaseapphosting-*` repos if empty.
5. Leave billing **off**; optionally [shut down project](https://console.cloud.google.com/iam-admin/settings/project?project=web3-job-board-aggregator) when sure nothing uses Firestore.

## Scripts still targeting legacy Firestore

These admin scripts use **`web3-job-board-aggregator`** for Firestore only (not hosting):

- `scripts/dedup-subscribers.mjs`
- `scripts/add-manual-emails.mjs`

Migrate data to production or update `PROJECT` before deleting the legacy project.

## Verify

```bash
python3 scripts/retire-stray-gcp.py
```

All production triggers should show **`ok`** or **`disabled=true`**. No second deploy on push to `main`.
