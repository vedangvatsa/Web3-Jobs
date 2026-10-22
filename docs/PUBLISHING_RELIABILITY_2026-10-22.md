# News and job publishing, October 22

## Observed failure

Morning run [39717530592](https://github.com/vedangvatsa/Web3-Jobs/actions/runs/39717530592) imported 76 new job records and deployed them successfully. Its original-news batch remained incomplete: 20 drafts were ready, 90 candidates lacked review outcomes, and no articles published. The writer attempted scratch work outside the allowed workspace and ran repository-relative tools from a temporary directory. The coordinator stopped after two invocations without persisted progress.

Telegram waited for news research and deployment, then reached its send step at 05:27 UTC, after the morning window closed at 04:30 UTC. Company LinkedIn job submissions retained IDs but lacked verified delivery receipts. Other job-social destinations published both selected openings.

## Changes

- The news runner sets its working directory to the repository root and directs `TMPDIR`, `TMP` and `TEMP` to `.cache/news-research/scratch/`. It rejects an external scratch symlink and preserves existing permission restrictions.
- Each research invocation gets up to eight pending candidates in `assignment.json`. It checkpoints outcomes individually; the coordinator continues until all daily candidates are reviewed. A stalled batch gets a one-candidate retry. This changes invocation size, not the number of articles allowed per day. Unreviewed candidates still block publication.
- Same-day retries automatically look for a prior failed/cancelled run's saved drafts. Selection checks repository, main branch, trusted trigger, date, artifact provenance and attempt. Explicit recovery IDs remain supported. Drafts are restored without overwriting files and must be reviewed again.
- Job social and Telegram depend only on the slot gate and select from already-live catalogues. News processing and rollout duration cannot delay their start.
- The single scheduled daily website rollout requires both that UTC day's refreshed jobs catalogue and completed, validated original-news batch. A news failure delays the rollout; later slots retry unfinished research. At least one newly published original article must be present. An empty batch cannot authorize a jobs-only deployment.
- `articles_changed` and the legacy `newsDeployPending` flag cannot authorize another rollout after that day has deployed. Explicit news recovery refreshes missing daily jobs and uses the same deployment policy. `only_news`, `news_dry_run` and `website_recovery` remain content-only.
- Scheduled job social receives its original date and slot. Checks before claims and provider mutations enforce the same exclusive 60-minute window as Telegram, including multi-step image/container publishing. Known-ID reconciliation remains read-only outside the window.
- Company LinkedIn verification polls an accepted ID with bounded reads and reports the actual mismatch or provider error. It still requires the exact account, text, sent status and native permalink. An unverified accepted ID cannot trigger a replacement post.

## Follow-up recovery

Healthy feed discovery now defines one daily queue. Same-day retries resume it
instead of continually adding new RSS candidates while reopening saved drafts.
Failed discovery is retried, explicit manual tips still enter the queue, and the
next UTC day gets fresh discovery. The separate RSS snapshot continues refreshing.

Retries could lose useful draft files after their ready outcomes were reset, and
the writer spent most of an invocation retrying inaccessible feeds before reaching
the saved articles. Recovery now preserves every owned unpublished draft with its
source-check history and prioritizes it for fresh review. Older draft publication
dates are flagged for correction after a timeliness check; restoration never
rewrites article bytes or source-event dates.

Before research, `check-news-sources.mjs` performs bounded, deduplicated GET checks.
It records a temporary source-blocked deferral only when every known source has a
definite denial/unavailability response and the candidate has no protected draft.
Historical primary/corroborating URLs are included. Responding URLs, uncertain
network results and saved drafts remain for research. The report explicitly says
that this is availability evidence, not a source read or factual approval. These
deferrals retain their retry searches and existing 72-hour retry window.

## Verification and recovery

Inside the global `fah-deploy` concurrency lock, the deployment job checks a fresh `main` checkout against `content/catalog-refresh-state.json`, `content/news-research.json`, the published article files and the current deployment state fetched from GitHub. The build uses the verified commit SHA, so later branch changes cannot change the batch being shipped.

Before any build request, a GitHub Contents API compare-and-swap records its build/rollout IDs and source revision in `scripts/social/publish-slot-state.json`. A confirmed successful rollout is acknowledged there before live-catalog verification and before the concurrency lock is released. Live-verification failures still fail the job, but cannot authorize a second rollout. Parent completion stamps do not infer deployment success from a job result.

Confirmed build/rollout failures remain recorded and permit a new attempt. Timeouts, lost responses and unacknowledged outcomes retain their active claims and block automatic replacement attempts, including on a later day. Inspect the recorded provider IDs and the `daily-deploy-*` artifact before reconciling an uncertain result; do not clear the claim just to retry. A run that crosses UTC midnight cannot start yesterday's rollout. If a started rollout finishes after midnight, its acknowledgement also blocks another rollout on the confirmation day.

October 22 already has a successful rollout at 05:25 UTC. Articles recovered later on October 22 wait for the next daily rollout, which must also include October 23's jobs and completed news batch. The standalone deployment workflow remains an explicit operator entry; automatic parents must supply a date and pass the daily guard.

The normal offline workflow tests cover news assignment/recovery, complete review coverage, job ages, employer availability, slot boundaries, provider failures and immutable receipts. `node --test scripts/lib/daily-deploy.test.mjs scripts/news-workflow.test.mjs scripts/social/publish-slot-plan.test.mjs` covers deployment readiness, queued callers, CAS races, unknown outcomes and post-rollout verification failures. Run `npm run typecheck -- --incremental false` with Node 24 as well.

To inspect a saved LinkedIn job receipt, dispatch `inspect-job-receipts.yml` with its comma-separated Buffer post IDs. It has read-only repository permissions, queries only IDs already present in the job ledger and writes a diagnostic artifact. It cannot create posts or edit delivery receipts.

To recover news without a website deployment or social sends:

```sh
gh workflow run refresh-jobs-cache.yml --repo vedangvatsa/Web3-Jobs --ref main \
  -f only_news=true -f news_recovery_run=39717530592
```

The date must still be October 22 for that artifact. Automatic same-day selection also works without `news_recovery_run`. The source, image, duplicate, formatting, typecheck and complete-review gates still apply.

The unresolved Telegram reservation for `@web3hiring` from October 21 at 11:31 UTC requires evidence-based reconciliation. Do not delete it or send a replacement to clear an error. Job-video publishing separately requires fresh hosted video inputs; the schedule fix does not create those assets.
