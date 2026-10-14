# Employer expansion publication verification

This verification supersedes the earlier audits' catalog counts and their
pre-publication status. Those audits retain the original source research and
import outcomes.

## Reviewed scope

- Expansion commit: `bb856b3f3307a3ed960a21145fe3327250e72261`.
- Ordinary merge preserved `origin/main` at
  `92cd24df33a9cef22f54440959466964a3040990`. All 25 newer automation files,
  including the news catalog and social delivery state, match that remote
  revision byte-for-byte.
- Country registry: 46 employers, five recurring sources and 41 monitors.
- Additional expansion registry: 35 employers, 21 recurring sources and 14
  monitors. Together these are 81 deduplicated employers.
- Verified profile inputs: 81 official website roots, researched About
  paragraphs, validated official logos, and exact-brand social accounts.
  The profile index contains 634 entries. The regenerated company catalog
  contains 255 companies, including 77 researched zero-job overviews; 178
  companies have current eligible jobs.
- double jump.tokyo retains the corporate X account `doublejumptokyo` and
  LinkedIn company page `doublejump-tokyo`, with company-release provenance.
  Its About paragraph distinguishes NSuite, RIKYU, and Wallet Engine.

## Freshness and preservation

The validated job cache and runtime both contain **1,645 jobs**. The final
regeneration retired `/crs`, `/eng33`, and `/rec` after their original dates
crossed the existing 30-day boundary. Every surviving raw job remains exactly
equal to its pre-merge record. These three expiries follow earlier normal
expiries already recorded by the expansion audits; they are not importer
deletions.

Bit2Me `/cmp117` remains eligible with original publication
`2026-10-05T14:04:37+02:00` and its original application URL. The country and
expansion registries, original-date history, and date-provenance file retain
their protected hashes. All original CSV input hashes were checked unchanged;
the CSVs were not copied or committed.

Generated changes also include the existing event-retention pipeline's nine
expired-event tombstones and corresponding source, guide, outreach, index,
and asset removals. Article indexes, latest-article summaries, news crawler
shells, and responsive assets were generated from existing committed content.
They were reviewed as normal pipeline outputs. No native article or separate
Devcon event-copy work was included.

## Reproducibility and staging

Committed fixture excerpts make the 548 recurring-source tests independent
of local raw captures. The daily ingestion workflow uses Node 24, runs source
tests, records explicit source failures, uploads evidence, regenerates verified
company profiles, and incorporates branding into OG cache invalidation.
Original-date and exact-job application checks remain enforced.

The durable inputs and reports retain public source URLs, timestamps, quotes,
and SHA-256 provenance. Raw research remains ignored and preserved locally;
runtime generation and committed tests do not require it. Twenty-seven local
one-off research helpers were preserved outside staging. Cache/log files,
credentials, symlinks, and original CSV files were excluded. The staged
credential-pattern scan found no new credential tokens; an unchanged public
maps-image key in an existing job description was identified separately.

## Actual validation

Under Node 24:

- `FAH_FAST_PREBUILD=0 npm run build`: passed full prebuild gates, production
  compilation/type validation, 127 generated pages, standalone asset checks,
  the 125-route prerender budget, and all nine feed-compression checks.
- Root and source-specific TypeScript checks: passed.
- Source adapters, original-date rejection, ownership/application failures,
  pagination, captured ATS responses, and CSV parsing: 17 tests passed.
- Job age: 19 tests passed; catalog publication: six tests passed; prebuild
  invalidation: five tests passed.
- Company-job associations: 178 active companies and 1,645 jobs, with no
  count/list mismatches.
- Profile preservation test: all 81 employers passed, with 81 verified social
  accounts and 77 honest zero-job overviews.
- Production HTTP/crawler/browser verification: all 81 company pages, their
  public catalog rows, official assets, and OG cards passed; five hydrated
  browser samples passed.
- Full-build site catalog integrity, responsive images, social previews,
  sitemap routes, and event-retention checks passed.
- `git diff --check`: passed.

Machine-readable final evidence:
`content/sources/expansion-publication-verification.json` and
`content/sources/company-profile-browser-verification.json`.

Only repository publication was requested. No remote deployment workflow,
social/email send, provider write, or authentication flow was dispatched.
