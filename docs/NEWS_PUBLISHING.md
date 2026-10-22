# Daily news publishing

## Cadence

News research and website deployment use the existing **one daily morning batch**
(03:30 UTC). The scheduler's existing daily retry/catch-up behavior remains in
place. A successful batch is not repeated in the afternoon or evening. Social
distribution has its own slot receipts and posting windows.

There is no two- or three-article quota. The writer reviews assigned candidates and
drafts qualifying stories within the research budget. Articles require source verification,
two independent external sites, 600+ words, credited local images and the existing
editorial checks. A quiet day can finish with zero articles when all candidates
have explained outcomes and discovery actually succeeded.
Research defaults to 75 minutes, with individual invocations capped at 15 minutes.
`NEWS_RESEARCH_BUDGET_MINUTES` can configure 1 through 90 minutes. At the deadline,
or after repeated lack of progress, the controller stops its owned writer tools
and validates the saved ready batch. Unfinished reviews remain genuinely pending.
The 135-minute writing step leaves time for audits and up to three 10-minute repair
invocations within the 180-minute job.

The controller runs the same draft validator used by the publisher. Failures are written to
`.cache/news-research/validation.json` and returned to the writer for up to three
repair rounds. Each round checks all article-publication gates. A writer's
success message cannot mark a batch ready. Protected-file, Git-history and
infrastructure failures stop draft repair; the writer edits only its unpublished
articles and records any remaining sourcing or quality deferrals.

## Discovery and retries

`scripts/news-discover.mjs` compares stories individually, using cited source URLs,
exact headlines and conservative near-headline matches. The duplicate corpus
contains News articles, not guides or unrelated career pages. It does not reject
a headline because its words occur somewhere in the archive. Identity-bearing
query parameters survive URL normalization, and different numbered upgrades are
not automatically merged.

Cross-outlet matches keep all source URLs. Dates outside the 24-hour lookback and
future-dated feed entries are excluded. Feed failures are reported; an outage is
not counted as a slow-news day. The standalone discovery command can limit its
printed output, but preparation uses the full discovered candidate set.
Healthy discovery fixes the daily candidate queue; same-day retries resume it
rather than continually expanding it with newly fetched RSS. New manual tips and
explicitly researched leads can still enter. The next UTC day gets fresh discovery.

`content/news-research.json` is the persistent ledger. It records candidates,
source attempts, reasons, draft slugs, retry searches and daily review outcomes.
Manual tips are included. A sourcing-blocked candidate is deferred until the next
daily batch for up to 72 hours from publication, or discovery for an undated tip.
Expired leads get an explicit stale outcome; their original dates are retained.
In live CI, preparation and each recorded decision checkpoint the ledger to main
with `[skip ci]`. A writing-model timeout therefore retains the assigned leads and
completed research even if the final cleanup step cannot run. Article files are
published only by the final batch coordinator.

```sh
node scripts/news-research.mjs prepare
node scripts/news-research.mjs queue
node scripts/news-research.mjs record --id=<id> --status=deferred --reason=needs-corroboration --note="Read the announcement but could not verify the claimed figure independently." --read=https://company.example/announcement --search="Find independent reporting that confirms the announcement and figure"
node scripts/news-research.mjs report
```

Preparation writes the assigned queue and report under `.cache/news-research/`.
The writer uses `record` for ready, rejected and deferred outcomes. Source-blocking
is not an allowed permanent rejection reason. A duplicate names the existing
article; a duplicate of another ready draft is reopened if that draft's batch fails.

## Publication and completion

The writing agent drafts and records decisions. It does not commit or push.
`node scripts/validate-news-run.mjs` provides a non-publishing readiness check,
including the actual word count, image, formatting, duplicate, typecheck and
source-link rules. It saves the validator feedback and report, exits nonzero for
an incomplete batch, and leaves the publication ledger unchanged. The controller
persists validation feedback while retaining drafts as ready, not published.

Source links still require HTTP 200. A transport failure or selected server error
gets one short retry before it blocks the batch. HTTP 403, 404 and 429 remain
blocking; a longer Retry-After is left for a later run. A transient connection
failure therefore has one chance to recover without another writing-model call.

`publish-news-run.mjs` owns publication:

1. Keep research coverage truthful. Unreviewed candidates remain unreviewed and
   visible in the report; they cannot be relabeled merely to finish publication.
2. Validate ready drafts with quality, image, formatting, duplicate, TypeScript
   and outbound-link checks. Record blocked citations and other failures.
3. Preserve unapproved new News drafts/images outside the publishable content
   directory, with exact hashes and an unapproved staging manifest. Reject changes
   to published files, existing code, generated catalogues or unsafe filesystem paths.
4. Publish only the approved new article files, their images and
   research ledger together. Existing articles/images and published root URLs
   cannot be overwritten.
5. Preserve unrelated newer main commits using a scoped temporary Git index.
   Conflicts retain recovery artifacts rather than force-pushing or rebasing.
6. Save JSON/Markdown outcome reports and a GitHub Actions recovery artifact.

Failed article-quality batches publish the review ledger only. A passing ready
batch may publish while other research remains pending. `complete` in the research
report still means coverage completion; `publicationComplete` separately records
the exact published IDs/slugs and the pending IDs. The workflow's completion output
means the publication transaction succeeded, and its `coverage_complete` output
reports the remaining research separately. Pending and deferred leads carry forward
under existing expiry/retry rules. No second publication is made that UTC day.

Normal recovery restores drafts for fresh review. Explicit `validate_saved_news`
recovery can reuse direct same-day ready reviews from a trusted artifact only when
the restored article/image hashes, dates, identity and source records match. It
preserves original review timestamps and artifact provenance. It still reruns all
current article audits and repairs actual failures; reuse alone is not publication
approval. It performs no new candidate research.

Live publication is restricted to GitHub Actions. `--dry-run` validates and reports
without creating commits. The workflow's news dry-run input selects the news-only
path, with deployment, social posts and videos disabled for that diagnostic run.

The report's `published` state means committed to main. The single scheduled daily
rollout waits for that UTC day's jobs refresh and completed, validated original-news
publication, with at least one new published article. Failed publication delays deployment rather
than shipping jobs alone. Recovery after a successful daily rollout waits for the next
day's combined batch; article changes cannot authorize a second same-day rollout.
The serialized deployment guard records actual rollout success before live checks.
See [the deployment and recovery policy](PUBLISHING_RELIABILITY_2026-10-22.md).
These scripts do not trigger live posts or deployments during tests.

## Article catalogue freshness

The `articles-index` prebuild step generates both `content/articles-index.json`
and `content/latest-articles.json`. Its inputs include article files and both
generator scripts. Article data, root-slug registration and the sitemap depend
on the article index, so new reporting invalidates those outputs on fast builds.
The public catalogue copier also requires the article index and checks that its
CDN copy exists before skipping a sync.

Hash acknowledgements are scoped to generators that completed successfully:

```sh
npm run update:prebuild-hashes -- --step=jobs-runtime --step=companies-runtime --step=slug-types
npm run update:prebuild-hashes -- --step=events-runtime
```

The jobs and events workflows cannot acknowledge unrelated article outputs merely
because an older JSON file exists. Calling the hash-update command without an
explicit completed-step list fails. Prebuild records each generator after it runs;
it does not blanket-refresh hashes at the end.

## Telegram handoff

Telegram reads native article metadata from the deployed
`https://hashtagweb3.com/data/articles-index.json`, so a checkout from before the
daily article commit cannot hide the new stories or expose unpublished drafts.
An invalid/unavailable native catalog fails visibly instead of silently treating
it as an empty native feed. Rejected early native summaries do not stop the search
after the first three attempts; selection scans up to 12 candidates to fill the
existing three-story digest. Existing delivery receipts and cooldowns still apply.

## Checks

```sh
node --test scripts/news-discover.test.mjs scripts/news-workflow.test.mjs scripts/run-news-research.test.mjs scripts/lib/news-research.test.mjs scripts/lib/news-publish.test.mjs scripts/lib/news-validation.test.mjs scripts/lib/news-source-links.test.mjs scripts/social/telegram-native-news.test.mjs scripts/social/publish-slot-plan.test.mjs scripts/social/posting-slot.test.mjs
npm run test:prebuild-invalidation
```

Tests use fixtures, mocked feeds and local bare Git repositories. They cover
discovery precision, source URL grouping, candidate carryover/expiry, partial
reviews, failed gates, daily idempotency, dry runs, concurrent writers, protected
files/URLs, and the deployed-catalog handoff. They do not send Telegram messages,
invoke the writing model or launch a deployment.

The 11 October recovery batch passed the actual publication dry run after three
source-checked draft repairs: 15 ready, zero unreviewed and zero validation errors.
It remains unpublished. The clean-workspace prebuild also passed, including the
passport capture test without a pre-existing research cache. Dynamic Open Standard
job counts are checked against the company catalogue and reviewed ATS identity,
rather than a fixed historical count of five roles.
