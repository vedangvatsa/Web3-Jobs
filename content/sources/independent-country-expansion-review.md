# Independent country / expansion ingestion review

Reviewed release: `a5b25c260036a97701865eb6a05e8f0e54c1d323`.
Read-only `git ls-remote origin refs/heads/main` confirmed the same SHA after the review.
Live evidence timestamp: `2026-10-14T21:14:52.755Z` (environment UTC clock).

## Verified defects and fixes

| Severity | Defect at reviewed HEAD | Fix |
| --- | --- | --- |
| High | HTTPS validation did not exclude internal destinations, including redirect targets or DNS answers. | Public-host and resolved IPv4 validation on every hop; pin each connection to its validated address. DNS and GET deadlines, existing 12 MiB bound and four-redirect bound retained. Per-host serialization applies Retry-After before the next request. |
| High | Both importers used a disposable date-history copy for observations they rejected or already covered. Expansion additionally wrote history only when adding a job. An expired first-published observation could be forgotten and a later republish admitted. | Persist verified original-date observations independently of addition; keep earliest identity history. |
| High | Greenhouse unknown/future incoming dates could recover an earlier verified date from history. Country primary future dates could similarly reach history normalization. | Expansion rejects unknown/future current dates before history recovery; country primary verification rejects future dates before returning a job. |
| Medium | Expansion official pages could redirect off the recorded authority while still containing the expected outbound link. The outbound tenant was not explicitly tied to the recurring adapter tenant. | Require recorded final official URL and matching outbound board identity. |
| Medium | Invalid primary checkedAt strings passed age comparisons because comparisons with NaN are false. Some closed-page wording was absent from country primary checks. | Reject non-finite timestamps; detect additional visible closed/soft-404 wording and challenges. |
| Medium | CI retained report hashes but not the immutable response bodies needed to inspect them. Immutable cache writes also used a check-then-write race. | Add hidden-cache body artifact upload; use exclusive immutable body creation. |

## Live evidence

`independent-country-expansion-audit.json` contains the actual GET results, final URLs, timestamps and body hashes for all 81 records. Raw responses are retained under `.cache/country-local-crypto/body-<sha256>.json`; these extend the existing evidence cache without deleting its contents.

- Registry: 46 regional + 35 additional = 81 distinct records.
- All 26 recurring sources passed current official-link and board checks and their feed adapters.
- All 55 careers-only monitors passed current recorded careers-link checks. Their vacancy/eligible counts remain null, not zero. This is not application or rendered-JavaScript verification.
- 12 recurring sources returned empty feeds: Coinmotion, Safello, Ankr, Boost, Eco, Nimbus, Optimism Foundation, Quantstamp, Usual, Violet, ZenLedger, Zircuit.
- 13 Greenhouse roles across Auros, Dialectic, Institute of Free Technology and Makina had original first_published dates older than 30 days; none was eligible.
- 36 Ashby roles were quarantined for unknown original dates. lastPublished, mirrored JSON-LD, updates and GET time were not used as original posting dates.
- XREX returned two roles, both expired on primary structured dates.
- Change returned five roles; two were live-primary sampled and expired. Existing committed-capture tests verify all five original dates as expired.
- Bit2Me returned one eligible role: Legal, Compliance & Operations Intern- Bit2Me STX, originally `2026-10-05T14:04:37+02:00`. Its exact-job application GET returned a matching usable form. No application was submitted.
- Primary live sample limit: two per source; this is not a fresh application audit of every existing catalog job.
- Jobs before/after: **1645 / 1645**, additions **0**, removals **0**. A separate byte comparison confirmed jobs-cache equals HEAD exactly. No expiry pruning ran.

## Verification

- Node **24.21.0**: **40/40** tests passed: original 17 source/CSV fixtures, four new source/HTTP regressions, and all 19 existing age/Breezy tests.
- Node 24 live public Greenhouse GET: HTTP 200, 2241 bytes.
- `npm run typecheck`: passed.
- Scoped TypeScript project extending the root config, including next-env and the owned ingestion, feed, HTTP, audit and test scripts: passed. Root tsconfig excludes scripts; a bare root check alone is insufficient.
- `git diff --check`: passed.
- CI uses Node 24, npm ci, committed fixture files and declared cheerio/rss-parser/tsx dependencies. The country and expansion adapters use GET requests and do not require a browser cache or Playwright installation.
- Both new ingestors are additive. Source/partial snapshot failures do not close or delete existing jobs. All newly admitted jobs still require the original-date age gate and application proof.
- Workable sources in these registries are careers-only monitors; no Workable recurring adapter or pagination-completeness claim is made here.

## Main-agent integration TODO

1. In shared `scripts/lib/catalog-publication.mjs`, narrowly add `content/sources/country-local-import.json` and `content/sources/hiring-links-636-import.json` to the jobs publication allowlist if reports must survive in Git. Currently CI artifacts retain them for 14 days, but the CAS publisher excludes them. Avoid broadly claiming the entire sources research directory. Job date history and description shards already are allowlisted; concurrent changes to those files fail with retained recovery rather than silently overwrite. This shared publisher file was inspected but not edited in this ownership scope.
2. Run the final combined full build after incorporating both agents' changes. This review intentionally ran targeted checks; it does not certify a new full build.
3. Include the new audit/test files and the intended ingestion/workflow changes when integrating. Preserve the other agent's company/profile/prebuild/OpenAPI changes and the original untracked research helpers. No commit, push, deployment, workflow dispatch or authenticated-provider request was performed.

No blanket no-mistakes claim: this verifies the recorded public source chains and bounded live samples, not every vacancy behind JavaScript/iframe monitors or the complete application history before these observations.

## Earlier combined local integration verification

The integration TODO above is now completed locally. The shared publisher adds exactly `content/sources/country-local-import.json` and `content/sources/hiring-links-636-import.json`. Its real-Git fixture verifies both reports survive publication alongside original-date history, expiry indexes and asset deletions, while raw responses and research leads remain excluded. Shared-map merging and conflict recovery remain intact.

The combined changes also isolate returned company details with a deep clone (including nested job date evidence and socials), invalidate the sitemap on company metadata changes, and document the companies catalog in both OpenAPI mirrors.

Final checks used **Node 24.21.0**:

- `npm run build`: passed the normal production lifecycle, including prebuild data preparation, deploy gates, Next compilation/type validation, standalone catalog/asset copying, prerender budget and postbuild feed compression. The initial 120-second tool window ended during prebuild; rerunning with a sufficient deadline completed successfully.
- `npm run test:job-age` and explicit `node --import tsx --test scripts/test-country-local-crypto.ts scripts/test-web3-expansion-feeds.ts scripts/test-country-source-http.ts scripts/test-hiring-links-csv.ts scripts/test-hiring-links-548-recurring.ts`: **40/40 passed** (19 age/Breezy + 21 source/CSV/HTTP). The new HTTP test is explicitly included because package scripts do not list it separately.
- `npm run test:catalog-publication`: **6/6 passed**, including the report publication regression and concurrent-update recovery fixtures.
- `npm run test:prebuild-invalidation`: **6/6 passed**.
- `npm run typecheck` and the scoped script TypeScript project: passed. The scoped project includes the ingestion, HTTP, audit, source tests, company tests and prebuild invalidation test.
- `npm run test:expansion-company-profiles`: **81 profiles**, all 81 with verified socials, **77 zero-job overviews**; retained job record hashes, original dates, source fingerprints and existing aliases preserved.
- `npm run test:expansion-company-profiles:browser`: **81/81 company pages**, crawler shells, logos, OG images and public catalog rows passed. The original claim that five browser samples proved hydration was incorrect: the harness could pass on server HTML with missing JavaScript. The corrected packaging and interactive verification are recorded below.
- Additional HTTP verification against this same new build: **81/81 metadata/JSON-LD checks and served logo/OG byte hashes**, repeated root requests without 412s, companies freshness SHA matching the exact response body, **255 total catalog companies** and **77 zero-job expansion profiles** passed.
- `npm run test:job-age:http`: **980 retired-path requests**, 70 retired slugs, **1644 eligible jobs / 0 invalid ages**, bounded shared caching, exact expiry, warm ISR rollover and unrelated page preservation passed. Cache rollover additionally uses its explicitly isolated fixture build.
- Source evidence verification: **281 referenced response hashes** across the audit and two import reports matched retained immutable raw bodies; tracked reports contain no raw body fields. Confirmed **26 recurring sources / 55 monitors**, **12 empty feeds**, **13 expired Greenhouse roles** and **36 quarantined Ashby roles**. Monitor vacancy counts remain null. Both OpenAPI mirrors match.
- Actual Node 24 DNS-validated, pinned public GET of the registered Auros Greenhouse API: **HTTP 200**, 22,616 response bytes. A preliminary probe used the wrong unregistered tenant `auros` and returned 404; the registered tenant is `aurosglobal` and passed without changing source data.
- `git diff --check`: passed; repository index remains unstaged.

Normal build maintenance changed generated local catalogs and assets: one Stripe job (`eng34`, original posting `2026-09-14T17:21:04-04:00`) crossed the strict 30-day expiry, leaving **1644** jobs; its expired OG/preview assets were removed. One event reached retention and received a tombstone, leaving **217** runtime events. These legitimate maintenance changes are retained locally; no original posting date was refreshed to keep a listing eligible. There are **178 active-job companies plus 77 published zero-job profiles**, totaling 255 catalog rows. The original review's 1645/1645 source-audit counts above describe its earlier observation, not this later build snapshot.

Read-only remote verification after all checks confirmed local HEAD and remote `main` both remain `a5b25c260036a97701865eb6a05e8f0e54c1d323`. All fixes and generated changes remain local and uncommitted. No repository staging, commit, push, deployment, workflow dispatch, authenticated-provider action, social post or email was performed. Existing research helpers and evidence caches are preserved; generated `.cache` fixtures are local test artifacts and must not be included in any future commit.

Evidence limits remain: live source evidence is timestamped at the earlier audit observation, careers-only monitors are public-link checks rather than full rendered vacancy/application audits, and these local passes do not certify a deployment of the fixes or every historical vacancy.

## Release verification after the browser audit

The user subsequently requested homepage redirects for missing and expired pages
and authorized a push after verification. Additional defects were reproduced
before their fixes:

- A recent Greenhouse API date could override an older primary `datePosted`.
  The earlier verified date now wins; malformed/future primary dates reject.
  Three new cases bring the source/CSV/HTTP suite to 24 passing tests.
- The TOKEN2049 gate rejected two approved slug migrations. Its assertion now
  requires declared migrations, identity-bound history and retained aliases.
  The frozen-incident suite has 33 cases, including 27 dedicated rejection cases;
  the combined event-import/catalog workflow suite has 46 passing cases.
- Standalone packaging omitted `.next/static`. It now copies and byte-checks
  every current generated asset, checks manifest references and rejects stale
  files, missing files and same-size corruption. Packaging/browser-guard
  regressions passed, and all 173 generated assets matched the production build.
- Browser validation now requires real menu interaction, decoded fonts/images,
  successful local asset requests and no React/page errors. All 81 company HTTP,
  metadata, crawler and asset checks passed, with five interactive company
  samples plus the homepage. The 77 zero-job profiles remain honest overviews.
- Missing/expired page recovery passed 47 paths with JavaScript enabled and
  disabled, three client-router navigations, 215 valid destinations, 603 existing
  redirects and 32 social suffixes. The header passed five viewport widths,
  light/dark, keyboard and no-JS checks. Details: `docs/404_RECOVERY.md`.

Root/scoped TypeScript, six publication tests and seven prebuild invalidation
tests passed. The normal Node 24 build includes deploy gates, static asset
validation, prerender budget and feed compression. Strict job-age checks and
the isolated expiry/cache fixture remain enabled. Records that aged out during
verification are removed by normal prebuild maintenance; their original dates
are not refreshed. Served counts can fall between builds as expiry filtering
continues.

These are local production-build results. Git publication and live deployment
are separate steps; no deployment is certified by this report. The timestamped
source audit above was not rerun during browser verification.
