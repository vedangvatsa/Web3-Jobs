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
- Default to `opencode/deepseek-v4.1-flash-free`, also used for session-title generation. A workflow input or the `NEWS_MODEL` repository variable can override it.
- Refresh the model catalog and require a real, tools-disabled readiness response before research starts. CLI exit code zero alone is not enough: OpenCode can return an error event with that exit code.
- Print warning/error diagnostics so missing models and expired credentials are visible in Actions.
- Deploy newly published articles even if the daily job catalog already shipped. Retain a pending deployment flag if that follow-up rollout fails.
- Preserve existing source verification, editorial audits, publication receipts, news-only recovery mode, and the Resend pause.

## Credential recovery

1. Create a new API key in the correct workspace at <https://opencode.ai/console>.
2. Replace the **repository secret** `OPENCODE_API_KEY` at <https://github.com/vedangvatsa/Web3-Jobs/settings/secrets/actions>. Do not put it in a repository variable or source file.
3. Run `refresh-jobs-cache.yml` with `only_news=true` to recover the daily research batch without replaying social posts.
4. Verify the writer readiness check, research coverage, article audits, and publication commit. A successful feed refresh alone does not prove that native articles were published.
5. After publication, run `fah-fix-and-deploy.yml` and verify the new articles in `/data/articles-index.json`, `/news`, and their canonical URLs.

The investigation did not mark the outage resolved: the expired credential still required replacement when this note was written.
