# Job age policy and website cleanup

Worktree: `web3-job-age-fix`, based on `b68fb507a`.

Primary application/date integration produced **1,606 active jobs across 175 companies**. The live 30-day expiry at `2026-10-13T00:00:00.001Z` subsequently removed `ddrm`, leaving **1,605 jobs / 175 companies** without a build. The additional 61 audit exclusions and the evidence-backed Breezy ingestion fix are documented in [JOB_APPLICATION_AUDIT_INTEGRATION.md](JOB_APPLICATION_AUDIT_INTEGRATION.md).

## Initial age cleanup results

The cleanup at `2026-10-12T20:54:26.209Z` reduced the active cache and runtime from **5,646 to 1,667 jobs**, across **177 companies**.

| Exclusion reason | Records |
| --- | ---: |
| Expired original posting date | 3,917 |
| Unverified posting date | 62 |
| Total removed | 3,979 |

The unverified group includes 25 Comeet update-time records, 10 Amazon/Google/Apple discovery-time records, 11 previously flagged first-party records, and 16 Greenhouse records without a confirmed current `first_published` value. Sixteen unverified records also had dates older than 30 days, accounting for the original 3,933-over-30-days audit total.

All nine Harmony jobs were removed. `/marketing4`, its social suffixes, `/jobs/marketing4`, both preview paths, and its OG image path return 410 without Apply content or JobPosting schema.

Cleanup removed 3,979 description bodies and 10,782 obsolete job preview/image files. Subsequent image pruning removed 93 stale PNGs. Company OG images were regenerated without static open-role counts, which would become false between builds. Preview validation checked 5,331 shells and 3,288 local images with zero failures. Historical job identities, slug reservations, and social delivery receipts were retained. Remaining source identities keep their original canonical slugs.

## Contract and enforcement

- `src/lib/job-age-policy.mjs`: pure shared `MAX_JOB_AGE_DAYS = 30`, `jobAgeExclusionReason(job, now)`, and `isJobAgeEligible(job, now)`. Exact 30 days is inclusive; one millisecond older is rejected. Dates require a valid calendar date and an explicit timezone, or a UTC date-only value. Inactive, explicitly unverified, missing, invalid, and future dates fail closed.
- `src/lib/job-source-date.ts` and `content/job-date-history.json`: retain the earliest verified source date by posting identity. Rescraping or republishing the same ATS posting cannot reset its age. Recruitee's explicit `... UTC` source dates are normalized without calendar rollover.
- Scrapers no longer use current time, `updated_at`, or Comeet's `time_updated` as the posting date. Prior-date recovery goes through the verified history helper rather than unqualified cached timestamps.
- `scripts/lib/retire-ineligible-jobs.ts`: repeatable cleanup, called during runtime generation and prebuild. It removes active content while preserving historical URL identity.
- `getJobs`, cached slug/id lookup, company lists, client pagination, cards, Apply buttons and feed generation recheck age. Detail HTML retains ISR behind the middleware age gate. Archived records cannot be reconstructed into job pages. Alias redirects require posting identity rather than matching company/title alone.
- `content/job-age-paths.json`: middleware checks canonical URLs, ids, aliases, social suffixes, preview shells, and job images before serving cached content.
- `/data/jobs-runtime.json`, `/data/companies-runtime.json`, job shards, description shards, feeds and sitemap formats keep their existing URLs. On shared-cache misses their handlers filter current eligibility. Their headers are `public, max-age=0, s-maxage=N, must-revalidate`, with N capped at 3600 and shortened to end before the earliest included job's expiry. No stale allowance is used; only TTL-zero boundary responses use `no-store`.
- `/data/catalog-freshness.json` retains the build timestamp and recomputes jobs/company response hashes, so release verification still works after time-based expiry.
- Shared root details retain ISR, and listing pages remain initially prebuilt. `content/job-age-page-scopes.json` selects a new on-demand ISR cache window when a relevant job expires. Old windows return 410. Unrelated articles, courses, glossary and event pages retain their original cache behavior. Build checks continue to enforce the static-route budget and permit genuinely empty eligible catalogs.

## Provenance evidence

`content/job-date-provenance.json` contains the public Greenhouse date checks. Of 963 otherwise-recent Greenhouse candidates, 947 had confirmed `first_published` values. This was a targeted source-date check, not a full job scrape. `content/job-age-cleanup-report.json` records each removed identity, date, slug, and exclusion reason.

Missing `dateVerified` remains compatible with existing actual source dates. It is not permission to import discovery/update timestamps. Known synthetic legacy dates were explicitly excluded; unknown future inputs must remain empty or unverified.

## Checks

Run with Node 24 (validated here with 24.21.0):

```sh
npm run test:job-age
npm run test:job-age:http
npm run test:jobs-catalog
npm run test:catalog-recovery
node --import tsx scripts/test-company-jobs.ts
node --import tsx scripts/test-job-slug-resolution.ts
node --import tsx scripts/test-job-slug-reserved.ts
node --import tsx scripts/test-job-description-shards.ts
node --import tsx --test scripts/test-verified-job-corrections.ts scripts/test-prebuild-invalidation.ts
node --import tsx scripts/test-middleware.ts
node --import tsx scripts/test-job-application-cleanup.ts
node --import tsx scripts/test-ats-source-ownership.ts
node --import tsx scripts/test-social-preview-assets.ts
node --import tsx scripts/test-job-page-content-quality.ts
node node_modules/typescript/bin/tsc --noEmit --incremental false
```

Run the HTTP check after the full production build and postbuild. It cold-starts `.next/standalone/server.js` on an ephemeral local port, verifies copied policy files, and checks browser/bot 410s, current detail rendering, runtime catalog rewrites, headers, shards, company counts, sitemaps, and live freshness hashes. It also builds a small production-mode cache fixture under `.cache/` using the real middleware, catalog handler and cache router. Warm-cache tests advance time across the exact expiry and verify that old records disappear without a build while unrelated pages stay ISR hits. Set `SITE_ORIGIN` and `DEPLOY_STARTED_AT` to reuse the read-only website checks after deployment.

## Release-owner integration

1. Add `content/job-date-history.json`, `content/job-age-paths.json` and `content/job-age-page-scopes.json` to the jobs paths in `scripts/lib/catalog-publication.mjs`. Include the changed image-alias and image metadata outputs where that publisher requires an allowlist. That publisher-owned file was not edited here.
2. Ensure the main-owned refresh workflow retains the cleanup/history/path-index outputs. The ingestion workflow and precompute/prebuild hooks already apply the policy.
3. Confirmed application exclusions and primary-date corrections are now integrated through `content/removed-job-listings.json`, provenance and history. All 135 other uncertain audit records remain; publisher preflight must continue to fail closed for them.
4. The social owner should review the 5,708 obsolete catalog snapshots listed in `content/job-primary-audit-verification.json`. Preserve delivery/deduplication receipts; they are not active job content. No video library or hosting assets were changed here.
5. Run the final production build and release checks after concurrent edits finish. No commit, push, deployment, or outbound message was performed for this website/ingestion work.

The final public-text audit found no `/marketing4` URL or Harmony posting id in the generated public JSON, HTML, XML, Markdown, or text files. It also removed 5,534 expired `job-ig` render-manifest entries; these are image-generation fingerprints, not delivery receipts.

Antislop was applied during the changes: counts are measured, posting dates are source-bound, no filler jobs were added, and comments explain date/cache constraints rather than narrating implementation.

## Cost-safe cache revision

Blanket `force-dynamic` on the shared root route and blanket `no-store` headers were removed. The production fixture measured `public, max-age=0, s-maxage=599, must-revalidate` with ten minutes remaining, `no-store` at the inclusive 30-day boundary, and a 3600-second shared lifetime after excluding the expired record. Listing pages returned `x-nextjs-cache: HIT` in both expiry windows; old detail/preview/image/window URLs returned 410. Article and lesson pages stayed ISR hits across the transition.

Firebase documents that middleware-matched routes bypass Cloud CDN. HTML requests therefore still pass through middleware, but reuse Next ISR renders. Middleware-excluded catalogs, feeds and sitemaps can use shared CDN caching. The fixture verifies real Next headers and ISR hits; its shared-cache simulation is not a claim that a deployed Google CDN cache hit was observed. Main must verify the final production artifact and deployed cache behavior after release.

The new listing cache entries are created only for visited expiry windows, not bulk-generated. Old windows are inaccessible but remain subject to normal Next cache eviction/redeployment. Company scopes avoid invalidation for unrelated employers. Directory and nomad scopes intentionally use the whole catalog because their counts depend on it. Encoded catalog paths are canonicalized so they cannot bypass filtered handlers; company case variants share the same cache window. Release verification must also confirm that pre-fix cached catalog responses are no longer served.

Original-date history cannot advance on refresh. Explicit update/discovery/fetch provenance is rejected when seeding history, and cannot replace an earlier verified publication date. Source-date regression tests cover both cases.

## Final release-owner validation (2026-10-12 UTC)

- Node 24.21.0: fast prebuild, full production build, postbuild and typecheck passed. The production prerender manifest contains 124 static routes; shared details retain on-demand ISR and no listing expiry windows are bulk-built.
- All 132 offline publisher tests passed (104 native Node, 28 tsx). Catalog-publication tests prove that date history, provenance, exclusion records, expiry paths/scopes and image aliases reach main alongside asset deletions.
- The standalone cold-start test at `2026-10-12T23:13:42Z` returned 1,606 eligible jobs / 175 companies, with zero invalid ages and correct company membership/counts. All 70 incident slugs (nine Harmony plus 61 primary-audit exclusions) passed 980 browser/bot canonical, alias, social, preview and image requests returning 410 without Apply content or JobPosting schema.
- Actual production HTML and catalog responses used expiry-bounded `s-maxage=2777, must-revalidate`; homepage/jobs/companies warm requests were ISR hits. Feed compression retained 68.3–79.7% savings. Event-feed ISR remains unchanged; dynamic job RSS comparisons allow only its response-time `lastBuildDate` to vary.
- The separate production clock fixture passed 599-second shared caching with 600 seconds to expiry, exact-boundary no-store, expired-content removal and subsequent ISR hits. Unrelated article/course pages retained cached rendering.
- HTTP release checks now launch the built standalone server directly. Next 15's custom-server development initializer ignores the supplied `conf` override; using it would clear the default `.next` artifact. No development server or port 3000 is needed for this release check.
- The deployment workflow's IAM grants and secret synchronization are explicit opt-in repairs. Default dispatch performs permission checks, website build/rollout and live catalog verification only.
- These are pre-deployment checks. Successful scheduled publishing cycles have not yet been observed under the new guards. The retained 135 uncertain application links are not claimed verified; each attempted delivery requires fresh direct-employer evidence.

The first website rollout (`38321410027`, build `manual-1791847134`) succeeded at `2026-10-12T23:29:39.909550Z` for commit `b98dd3d34be503cf2968bfd9c1e023af1320cfd6`. The stable jobs URL returned an actual `cdn-cache-status: hit`, `Age: 2`, `s-maxage=1738` and `Expires: Mon, 12 Oct 2026 23:59:58 GMT`; the old stale-while-revalidate policy was gone. Firebase changes middleware 410 headers to `max-age=0, must-revalidate, private` and HTML headers to `no-store`. The live verifier accepts only these identified Firebase overrides, still requires warm Next ISR hits, and keeps catalog caching assertions strict.

Release follow-up restores the original generation acknowledgements for unrelated outputs that were excluded from the jobs commit. This ensures the next fast build regenerates those catalogs from the existing repository sources instead of incorrectly marking unstaged generated outputs as published. It changes no article/event source content.

The full live check passed at `2026-10-12T23:38:05.533Z`: 1,606 jobs, 175 companies, zero invalid ages, all 70 incident slugs absent, and 152 browser/bot 410 checks. Stable catalogs, shards, feeds, sitemaps and freshness hashes passed. Homepage, jobs, companies, a current job, news, an article and a course all produced warm Next ISR hits. Unrelated news retains its pre-existing Firebase private/stale header; job surfaces still disallow every stale allowance.

## Deployed expiry-window cache follow-up (2026-10-13 UTC)

The midnight live transition proved catalog removal and updated homepage totals without a build. It also exposed a platform-specific cost regression: a middleware rewrite response served fresh listing HTML without an ISR hit, while direct requests to the same internal cache path did hit ISR. The second rollout had correctly enforced age but did not preserve public-listing ISR after that transition.

The follow-up selects the expiry window through a middleware-owned request header and scoped Next `beforeFiles` routing. All job listing scopes now use that same route path, including the initial window, so deployment verification immediately exercises the production routing. Four initial directory windows are prebuilt; later windows and company/nomad pages remain on demand. Full prebuild, production build, postbuild and typecheck passed; the artifact has 128 static routes. The production clock fixture passed initial/next-window ISR hits, expiry-bounded shared caching, exact-boundary removal, and caller-supplied window-header rejection. The full standalone HTTP check at `2026-10-13T00:14:58.967Z` passed with 1,605 jobs and 175 companies.
