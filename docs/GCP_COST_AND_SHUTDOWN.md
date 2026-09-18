# GCP cost and shutting down Firebase App Hosting

Production for **hashtagweb3.com** is **Cloudflare Workers**. Google Cloud billing on **`web3-job-board-aggregator`** was mostly driven by **Firebase App Hosting**, not by Firestore alone.

## What was expensive

| Item | Why it adds up |
|------|----------------|
| **`minInstances: 1`** (historical `apphosting.yaml`) | Always-on **2 vCPU / 4 GiB** Cloud Run–style instance, 24/7, even with low traffic |
| **Cloud Build on every `main` push** | App Hosting rebuilds Next.js (`npm ci` + `npm run build`) when GitHub is connected — including bot commits (social state, alerts). `[skip ci]` only skips **GitHub Actions**, not Firebase |
| **Artifact Registry** `firebaseapphosting-images` | Container image storage for App Hosting |
| **Extra rollouts** | Social workflow pushes to `main` up to **8×/day** when state changes → repeated builds |

Cloudflare deploys are path-filtered and **do not** run on those bot-only JSON commits.

## The billing error you saw

```
CreateRepository(.../firebaseapphosting-images): ... billing to be enabled
project #web3-job-board-aggregator
```

Something (new App Hosting backend, rollout, or secret sync against the **old** project) tried to create App Hosting infrastructure. **Billing is off** on that project, so GCP correctly returns **permission_denied**.

**Do not re-enable billing** just to clear this error unless you intentionally want App Hosting again. For Cloudflare + optional Firestore, you do **not** need App Hosting on `web3-job-board-aggregator`.

## Shutdown checklist (old project `web3-job-board-aggregator`)

Do this while logged into the Google account that owns the project:

1. **Firebase Console → App Hosting** → delete or **disable** every backend (stop traffic and rollouts).
2. **Firebase / GitHub integration** → disconnect App Hosting auto-deploy for `vedangvatsa/Web3-Jobs` (or limit to a branch you never push to).
3. **Billing** → leave disabled on this project if you are not using GCP services here, **or** keep billing on only for Firestore if you still read legacy data (watch Firestore usage in Billing → Reports).
4. **Cloud Build / Artifact Registry** (optional cleanup): delete old `firebaseapphosting-*` repositories and build triggers if shown in console (reduces storage, not runtime once backends are gone).
5. **Do not** point `hashtagweb3.com` DNS at Firebase; keep Cloudflare.

## New project `web3-jobs-aggregator`

If you only need Firestore + secrets for Workers:

- Use **Firestore + service account** and **Sync Cloudflare Worker secrets** in GitHub.
- **Skip App Hosting** entirely to avoid repeating the same bill.

If App Hosting on the new project fails with **misconfigured secrets**, fix Secret Manager — that is separate from re-enabling billing on the **old** project.

## Repo guardrails

- [`apphosting.yaml`](../apphosting.yaml): `minInstances: 0`, lower CPU/RAM (only applies if a backend is ever deployed again).
- [`docs/FIREBASE_AND_CLOUDFLARE.md`](FIREBASE_AND_CLOUDFLARE.md): dual setup without App Hosting.

After console shutdown, expect **no new charges** from App Hosting; review [Billing → Reports](https://console.cloud.google.com/billing) filtered by **App Hosting**, **Cloud Run**, **Cloud Build**, and **Artifact Registry** for the closed month.
