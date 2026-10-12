# Job publisher incident and release handoff

## Confirmed incident

Run [38298064137](https://github.com/vedangvatsa/Web3-Jobs/actions/runs/38298064137), evening of October 12, 2026, sent Harmony's Marketing Lead through **Telegram Bot API `sendMessage`**:

| Destination | Message | Accepted at (UTC) |
|---|---|---|
| `@web3hiring` | [16529](https://t.me/web3hiring/16529) | `2026-10-12T19:32:09.848Z` |
| `@jobsweb3` | [120](https://t.me/jobsweb3/120) | `2026-10-12T19:32:13.743Z` |

Evidence: `.telegram-jobs-deliveries-web3hiring.json`, reservation IDs `762456c4-89d7-4107-ab2e-a7f6a4097faa` and `b86d18db-bc21-4989-8579-b9c38c5d8e5f`. The job ID is `e18deeab-40ef-4a00-b627-d20fae6cb410`, slug `marketing4`, original posting date `2024-03-09T05:33:00.298Z`. The reported direct Lever application returned 404.

`telegram-post.mjs` selected records using `active !== false`, without checking their original dates. Its HTTP check looked at the website URL and treated uncertain responses as usable. A stored retry digest bypassed selection entirely. The opening-social job in the same run posted Stripe `cm10` and Robinhood `mgr164`; its successful preview checks also did not validate employer applications.

## Guarded entrypoints

| Entrypoint | Enforcement |
|---|---|
| `scripts/telegram-post.mjs` | Selects only age-eligible published catalog records; keeps original snapshots in new digests; checks applications for selected jobs. |
| `scripts/social/telegram-jobs-delivery.mjs` | Rechecks the full batch before each destination and after its durable reservation. Unknown legacy snapshots and mismatched stored message bodies cannot be retried. Sent receipts and ambiguous reservations remain authoritative. |
| `scripts/social/post-job-openings.ts` | Loads the published catalog instead of `jobs-cache.json`; filters age before rotation; checks again at each platform mutation. Covers X/Buffer, Threads container and publish, Bluesky, each Farcaster target, each LinkedIn account, and Facebook. Empty pools do not reset history. `--force` does not bypass age or receipts. |
| `scripts/social/post-job-videos.ts` and `job-video-core.ts` | Checks both the original video snapshot and current job. Requires unchanged original date and matching captions. New creations and Instagram `media_publish` resumes recheck live catalog and employer availability, including after receipt persistence. Existing provider IDs can be verified without creating another post. |
| `scripts/linkedin-auto-post.ts` via `src/lib/linkedin.ts` | Filters Firestore candidates, requires a matching live job, and rechecks before upload/post. A transactional reservation prevents concurrent/ambiguous retries from duplicating a delivery. |
| `scripts/send-resend-broadcast.ts` via `src/lib/resend-daily.ts` | Selects age-eligible jobs from the live catalog within its existing seven-day pool. Preflights selected applications and rechecks the complete batch immediately before `broadcasts.create(send: true)`. Dry runs perform no provider writes. |
| `scripts/telegram-ai-jobs.mjs` | Applies the same age policy to original Greenhouse/Ashby posting dates. Removes updated/fetch-time fallbacks and history-reset refill. Direct employer GETs run at selection and final send. |
| `scripts/social/buffer-refill.ts`, `buffer-schedule.ts`, `publish-social.ts` | Generic queues refuse job records, job-specific links and job announcements at selection and submission. Provider-managed future queues cannot perform delivery-time employer verification; job announcements must use the guarded publishers. |

The script/workflow audit found six workflow files. Actual job delivery routes are the two dedicated social workflows, Telegram in `refresh-jobs-cache.yml`, and `daily-job-alerts.yml`. News/event publishers and event outreach do not select job records. Other social scheduling one-offs contain fixed general career/meme content rather than job listings.

## Employer verification

`scripts/lib/job-publish-guard.mjs` imports the shared `src/lib/job-age-policy.mjs` contract. It does not define a second age policy or consult archived job sources.

- Exactly 30 days is allowed. Older, missing, invalid, future, explicitly unverified and inactive records are refused, including stale stored payloads when the catalog has a newer date.
- Every new delivery needs a fresh, bounded direct-employer **GET**. A website preview or HEAD response is not application evidence.
- 404/410 and recognized closed/soft-404 pages are reported as closed. Redirects away from the requested job, generic pages, 403/429/5xx, challenges, unsupported bodies and timeouts are reported as unverified and refused. There is no 403 bypass.
- A successful page needs matching JobPosting data or matching job heading plus an application action. Expired employer structured data is refused.
- Opening/video replacement selection checks at most ten candidates. Telegram checks its selected five; email caps its selected batch at twenty. No whole-catalog application crawler runs during publication.

### Identity-backed canonical redirects

`scripts/lib/job-application-identity.mjs` validates official hosts, known routes, tenant and numeric job ID before using the repository's `normalizeJobLink` identity helper. A `gh_jid` query on an arbitrary host is not trusted. All observed hops must retain the same identity. The final HTTPS page must independently match the title and employer; conflicting structured metadata cannot fall back to a matching heading.

Replaying all 1,667 original URLs against the audit's saved GET responses at its frozen clock produced **1,229 passes**: all 829 previous strict passes plus 400 recovered redirects. There were no newly admitted API-only, uncertain or dead records.

| Newly accepted route family | Recovered records |
|---|---:|
| `boards.greenhouse.io` to `job-boards.greenhouse.io`, same board and job ID | 27 |
| Stripe `/jobs/search?gh_jid=ID` via `/careers/search/redirect` to `/careers/listing/.../ID` | 234 |
| Coinbase `/careers/positions/ID` to a locale-prefixed equivalent | 55 |
| Block original HTTP `/careers/jobs/ID` to HTTPS on the same host | 83 |
| Fireblocks `/careers/position?gh_jid=ID` to `/careers/positions/ID` | 1 |

The remaining 20 of the audit's 420 redirect candidates are still refused:

- 14 Jane Street chains downgrade HTTPS to HTTP before returning to HTTPS. The guard stops before requesting the HTTP destination. These require a verified canonical source URL from the data owner.
- Six Stripe records have conflicting `hiringOrganization` metadata: `mkt94` and `sls278` name Privy; `mgr131`, `sec69`, `pm103` and `pm17` name Bridge. Their catalog company is Stripe. The data owner must resolve the employer identity; the guard does not treat parent/subsidiary names as interchangeable.

The 256 API-only records, 154 uncertain records and eight closed/dead records in the frozen audit remain blocked for publication. The audit replay is not a fresh publication authorization. Every live delivery still runs fresh GET checks.

Redirect regressions use the actual audit URL pairs and job IDs with dynamic fixture dates. They cover changed IDs/tenants, malicious hosts carrying copied `gh_jid` values, internal-address redirects, HTTPS downgrades, old/future employer dates, conflicting companies and the observed Breezy closure text (`Position Closed`, `no longer accepting candidates`). No catalog dates, links, slugs or receipts are rewritten by redirect verification.

## Workflow integration for the release owner

The two dedicated social workflows already run the guard tests before publication. Add these to the appropriate shared-workflow test steps before release:

```sh
node --test scripts/lib/job-publish-guard.test.mjs scripts/social/telegram-jobs-delivery.test.mjs scripts/telegram-ai-jobs.test.mjs
npx tsx --test scripts/job-alert-publish.test.ts
```

`daily-job-alerts.yml` still describes a dry run as creating/deleting a draft. Its description should be updated to read-only validation. The CLI now makes no draft writes.

Release the publisher code together with the shared age policy and cleaned live catalogs. No historical receipt files, external posts, external provider queues or job-video manifests were edited during this work. No commit, push, deploy or live send was performed.

## Local verification

Node 24 commands:

```sh
node --test scripts/lib/job-publish-guard.test.mjs scripts/social/job-video-*.test.ts scripts/social/telegram-jobs-delivery.test.mjs scripts/social/posting-slot.test.mjs scripts/telegram-ai-jobs.test.mjs
node --import tsx --test scripts/social/job-publisher-age.test.ts scripts/job-alert-publish.test.ts scripts/social/buffer-x.test.ts scripts/social/linkedin-targets.test.ts scripts/social/linkedin-personal.test.ts scripts/social/job-image-policy.test.ts
npm run typecheck
git diff --check
```

Tests use injected clocks, realistic fresh jobs, complete HTML/provider bodies, fake transports and isolated receipt stores. The original 65 video tests remain, including CAS retries, monotonic merges, ambiguous-result handling and read-only reconciliation.

After the canonical-redirect update, both command groups pass: 104 native Node tests and 28 tsx tests, preserving the original 120 publisher tests and adding 12 redirect/closure regressions.

Antislop review: new diagnostics distinguish confirmed closure from unverified availability; new comments explain constraints; no claims of publication are derived from an unverified response.
