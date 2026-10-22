# News and job publishing, October 22

## Observed failure

Morning run [39717530592](https://github.com/vedangvatsa/Web3-Jobs/actions/runs/39717530592) imported 76 new job records and deployed them successfully. Its original-news batch remained incomplete: 20 drafts were ready, 90 candidates lacked review outcomes, and no articles published. The writer attempted scratch work outside the allowed workspace and ran repository-relative tools from a temporary directory. The coordinator stopped after two invocations without persisted progress.

Telegram waited for news research and deployment, then reached its send step at 05:27 UTC, after the morning window closed at 04:30 UTC. Company LinkedIn job submissions retained IDs but lacked verified delivery receipts. Other job-social destinations published both selected openings.

## Changes

- The news runner sets its working directory to the repository root and directs `TMPDIR`, `TMP` and `TEMP` to `.cache/news-research/scratch/`. It rejects an external scratch symlink and preserves existing permission restrictions.
- Each research invocation gets up to eight pending candidates in `assignment.json`. It checkpoints outcomes individually; the coordinator continues until all daily candidates are reviewed. A stalled batch gets a one-candidate retry. This changes invocation size, not the number of articles allowed per day. Unreviewed candidates still block publication.
- Same-day retries automatically look for a prior failed/cancelled run's saved drafts. Selection checks repository, main branch, trusted trigger, date, artifact provenance and attempt. Explicit recovery IDs remain supported. Drafts are restored without overwriting files and must be reviewed again.
- Job social and Telegram depend only on the slot gate and select from already-live catalogues. News processing and rollout duration cannot delay their start. The existing job ingestion and daily website rollout remain in place.
- Scheduled job social receives its original date and slot. Checks before claims and provider mutations enforce the same exclusive 60-minute window as Telegram, including multi-step image/container publishing. Known-ID reconciliation remains read-only outside the window.
- Company LinkedIn verification polls an accepted ID with bounded reads and reports the actual mismatch or provider error. It still requires the exact account, text, sent status and native permalink. An unverified accepted ID cannot trigger a replacement post.

## Verification and recovery

The normal offline workflow tests cover news assignment/recovery, complete review coverage, job ages, employer availability, slot boundaries, provider failures and immutable receipts. Run `npm run typecheck -- --incremental false` with Node 24 as well.

To inspect a saved LinkedIn job receipt, dispatch `inspect-job-receipts.yml` with its comma-separated Buffer post IDs. It has read-only repository permissions, queries only IDs already present in the job ledger and writes a diagnostic artifact. It cannot create posts or edit delivery receipts.

To recover news without a website deployment or social sends:

```sh
gh workflow run refresh-jobs-cache.yml --repo vedangvatsa/Web3-Jobs --ref main \
  -f only_news=true -f news_recovery_run=39717530592
```

The date must still be October 22 for that artifact. Automatic same-day selection also works without `news_recovery_run`. The source, image, duplicate, formatting, typecheck and complete-review gates still apply.

The unresolved Telegram reservation for `@web3hiring` from October 21 at 11:31 UTC requires evidence-based reconciliation. Do not delete it or send a replacement to clear an error. Job-video publishing separately requires fresh hosted video inputs; the schedule fix does not create those assets.
