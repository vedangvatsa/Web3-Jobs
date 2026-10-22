# News writer outage, October 17–19, 2026

## Findings

- The live native news index's most recent publication date was October 16. RSS discovery remained healthy: all 16 feeds responded in the October 19 run.
- Jobs continued to ingest and deploy. The October 19 live snapshot contained 1,560 jobs, including employer posting dates of October 17, 18, and 19. These dates describe the source postings, not necessarily when the site first imported them.
- The writer selected `opencode/muse-spark-1.3-contributor-free`, which the provider has retired. The CLI hid its model lookup error behind `UnknownError` without server logging.
- Once an available model was selected, run [39265525837](https://github.com/vedangvatsa/Web3-Jobs/actions/runs/39265525837) reported that the `OPENCODE_API_KEY` secret had expired. The provider requires a new API key; signing in again does not renew it.
- OpenCode upgraded from 1.19.2 to 1.19.3 between the last successful writer run and the outage. A rollback alone did not restore service. The release change is not the confirmed root cause.
- A successful jobs-only morning deployment could also prevent articles recovered later that day from being deployed.

## Changes

- Pin the CLI release rather than installing an untested latest release every day.
- The `NEWS_MODEL` repository variable is now `opencode/mimo-v2.6-flash-free`, the model that completed recovery. The code fallback is `opencode/deepseek-v4.1-flash-free`; both are among the four approved free variants. The selected model also handles session-title generation.
- Refresh the model catalog and require a real readiness response before research starts. The probe requires approval for tools, supplies no approvals, and rejects tool-call events. CLI exit code zero alone is not enough: OpenCode can return an error event with that exit code.
- Limit writer models to the four approved free variants (DeepSeek, GLM, MiniMax, MiMo); never substitute a paid counterpart. The selected free model also handles title generation.
- Print warning/error diagnostics so missing models and expired credentials are visible in Actions.
- The October 19 follow-up-rollout policy was superseded on October 22: the single daily rollout now waits for both fresh jobs and completed original news. Recovery after that rollout waits for the next day; the legacy pending flag cannot authorize another same-day deployment.
- Preserve existing source verification, editorial audits, publication receipts, news-only recovery mode, and the Resend pause.

## Credential recovery

1. Create a new API key in the correct workspace at <https://opencode.ai/console>.
2. Replace the **repository secret** `OPENCODE_API_KEY` at <https://github.com/vedangvatsa/Web3-Jobs/settings/secrets/actions>. Do not put it in a repository variable or source file.
3. Run `refresh-jobs-cache.yml` with `only_news=true` to recover the daily research batch without replaying social posts.
4. Verify the writer readiness check, research coverage, article audits, and publication commit. A successful feed refresh alone does not prove that native articles were published.
5. After publication, the scheduled deployment must also verify that day's jobs refresh and that no daily rollout has already succeeded. If the day already deployed, recovered articles wait for the next daily batch. Verify the shipped articles in `/data/articles-index.json`, `/news`, and their canonical URLs.

The user replaced the expired credential on October 19. The initial tools-denied readiness probe then hit [OpenCode issue #50627](https://github.com/anomalyco/opencode/issues/50627): removing the normal tool definitions triggers a misleading free-tier origin error. Using approval-required permissions instead produced `NEWS_WRITER_READY` with reported cost zero on the official 1.19.2 CLI and `opencode/deepseek-v4.1-flash-free`. No tool calls or approvals occurred. A briefly dispatched paid-model probe was cancelled before its research step; the repository model variable was restored to the free variant.

The corrected GitHub runner passed readiness and produced 15 draft articles before interruption. The recovery artifact `news-research-39276184030-1` was downloaded and its 15 articles plus 15 images were successfully restored into an isolated validation directory. They remain unpublished and require fresh review and the full publication gates.

To resume a saved same-day artifact, dispatch `refresh-jobs-cache.yml` with `news_recovery_run=39276184030`. This prepares a fresh queue, restores only unpublished article/image paths without overwriting anything and re-reviews the drafts. Under the October 22 policy, recovery refreshes missing daily jobs and can use the daily rollout only if none has succeeded yet. Email, videos and social sending stay off. Add `only_news=true` to keep job ingestion and deployment off as well. Cross-day recovery is rejected rather than silently changing publication dates.

GitHub reported [degraded Actions, Pages, and Webhooks](https://stspg.io/nrv2k8s68bwn) during recovery on October 19. API job statuses and logs were intermittently stale or returned 502. Read-only artifact recovery confirmed the saved drafts despite the misleading run status. At that stage, publication and live deployment still required verification.

The first recovery restored all drafts and renamed them, but the writer built shell command strings whose quoted notes were split into separate arguments. The CLI correctly rejected those incomplete review notes, and publication remained blocked. `record-batch --reviews=<JSON file>` now preserves quotes/currency signs and validates all outcomes before writing a checkpoint. The brief also identifies the queue/report JSON shapes and existing root-URL reservations. Recovery uses its own workflow concurrency group and skips unrelated event crawling.

## Resolved and verified

- Recovery run [39287451994](https://github.com/vedangvatsa/Web3-Jobs/actions/runs/39287451994) completed successfully, including research, publication, deployment, live-catalog verification, and completion stamps.
- The October 19 batch completed at 17:20 UTC: **532 candidates, 15 published, 411 rejected, 106 deferred**, with no validation errors. Deferred candidates retain their documented retry reasons; there is no 15-article quota.
- Publication commit: `6bde0e1f9b77abee06ed9a89c54b9336aad440a2`.
- Firebase build `manual-1792430494` and rollout `rollout-manual-1792431894` succeeded; rollout completed at 17:45 UTC.
- Verified all 15 new URLs return HTTP 200, self-referencing canonicals, NewsArticle JSON-LD, and accessible hero images. All 15 appear in the live `/news` listing and `/data/articles-index.json`, dated October 19.
- Configured future daily runs to use `opencode/mimo-v2.6-flash-free`; paid models remain rejected by the writer guard. Resend broadcasts remain paused, and recovery did not replay social posts or email.
