# Google JobPosting audit — 2026-10-19

## Scope and evidence

Source worktree: `/var/folders/9v/95v6_ny50fq2t6wnlhc140dh0000gn/T/opencode/navbar-push`.

Reviewed Google's [current JobPosting documentation](https://developers.google.com/search/docs/appearance/structured-data/job-posting?hl=en), the detail component, `Job` type, location and salary helpers, date policy, and existing address tests. Changes are local; this audit did not deploy them.

Live catalog checked: <https://hashtagweb3.com/data/jobs-runtime.json>.

- Audit time: **2026-10-19 12:31 UTC**.
- Catalog HTTP date: `Mon, 19 Oct 2026 12:16:19 GMT`.
- Catalog SHA-256: `618d5c0b1b7a6694d866906e5f504af01c1999c07a02cdad98f7d8384fc8b3bb`.
- **1,560 entries**, all passing the existing original-date age gate at audit time.
- Latest original date: `2026-10-19T08:17:22.475Z`.
- **17 live URLs fetched**, yielding **16 job-detail pages** and one homepage preview response.

These counts distinguish full-catalog location checks from sampled HTML checks. They are not a Google Rich Results Test or Search Console result.

## Verified issues and fixes

### Required location evidence

Google requires `jobLocation.address.addressCountry` for a physical job. A fully remote job needs at least one eligible country; a continent or `Worldwide` is insufficient. The deployed renderer emits `JobPosting` even when it cannot supply either form.

Running the pre-change renderer's location rules over the live catalog found **567 rows without country-backed markup**: 374 physical/unknown locations, 154 remote locations with no country, and 39 remote locations represented only by a broad region. This calculation used the catalog, not 1,560 fetched HTML pages. Six of the 16 sampled job pages confirmed missing country evidence in live JSON-LD.

The new gate suppresses only `JobPosting` when location evidence is insufficient. The job's visible content, application link, and breadcrumbs remain. It does not expand regions or `Worldwide` into countries, use employer headquarters as job locations, or widen city/state restrictions to an entire country.

Country parsing now uses individual location tokens instead of substring matches or a country borrowed from a different office. Multiple stated offices/countries are preserved. Ambiguous codes such as `CA`, `IN`, and `DE` require context; known city/state pairs remain supported. Unknown or unsupported locations fail closed.

### Fully remote claims

The current shared location helper already excludes explicit `Hybrid` and `OnSite` workplace types. That protection was retained. However, `remote first in US` was sufficient to emit `TELECOMMUTE`; this does not establish Google's 100%-remote requirement. Ambiguous or conflicting arrangements now suppress markup with `remote-status-unverified`.

The JSON-LD description includes the same location/work-arrangement label displayed in the page header, followed by the full visible description.

### Optional claims without verified fields

- **Employment:** 16 live catalog titles contain `International` or `Internal`, triggering the old `intern` substring rule. `/int15` is a vice-president role published as `INTERN`. Both Smart Contract Engineer titles trigger `CONTRACTOR`, confirmed on `/eng625` and `/eng45`. Other jobs silently default to `FULL_TIME`. The catalog has no verified employment-type field, so this optional property is now omitted.
- **Direct application:** every sampled job schema sets `directApply: true`. The component links to an external job page without verifying Google's application-flow conditions. The property is now omitted.
- **Expiration:** the renderer derives `validThrough` from original date + 30 days. Google says to omit an unknown employer expiration. The derived date is removed; the site's strict **original date ≤30 days** exclusion continues to remove expired job pages/markup independently.
- **Salary:** `getJobSalaryInfo` can infer USD from `$` and infer HOUR/MONTH/YEAR from amount size. `Job.salary` is a display string, sometimes produced by that parser, without separate employer currency/unit provenance. The schema no longer treats this heuristic output as verified `baseSalary`. Visible salary handling is unchanged. Verified employer salary data can be added later with explicit currency, period, and provenance.

### Required content and serialization

Missing title, employer, application URL, empty/title-only descriptions, and the existing synthesized fallback-description marker suppress the schema with reasons. Source posting dates are kept as supplied; no date or provenance is generated. JSON-LD escapes `<` so source text cannot terminate the script element.

## Full-catalog result with the patch

These are **location-gate results**, before full description/application validation:

| Result / diagnostic | Entries |
| --- | ---: |
| Eligible physical/hybrid location | 637 |
| Eligible fully remote country restriction | 245 |
| `physical-country-missing` | 401 |
| `remote-country-missing` | 188 |
| `remote-status-unverified` | 45 |
| `remote-area-unresolved` | 29 |
| `missing-location` | 15 |
| **Total** | **1,560** |

**882 pass the location gate; 678 are suppressed.** Unsupported geographic formats can be included among suppressed rows even when an employer could supply sufficient evidence. Suppression is preferable to inventing or widening eligibility.

`data-job-posting-schema="eligible|suppressed"` and `data-job-posting-schema-reasons` expose the decision on the article element. The builder also returns the reasons for audits/tests.

## Live URLs checked

All returned HTTP 200. The 16 detail pages had self-referencing canonicals and `index, follow` metadata. Each had one `JobPosting`, unconditional `directApply: true`, and a computed 30-day `validThrough`.

| URL | Observation / patched result |
| --- | --- |
| <https://hashtagweb3.com/mgr48> | Hybrid, Philippines. Retained as physical location. |
| <https://hashtagweb3.com/be80> | UAE and Malaysia offices; deployed schema kept only UAE. Both retained. |
| <https://hashtagweb3.com/arc25> | Singapore. Retained. |
| <https://hashtagweb3.com/mgr47> | Bangalore without country. Suppressed. |
| <https://hashtagweb3.com/cmp24> | Menlo Park and New York offices. Both retained; unverified optional claims omitted. |
| <https://hashtagweb3.com/pm312> | Remote US. Retained. |
| <https://hashtagweb3.com/eng621> | Generic Remote without country. Suppressed. |
| <https://hashtagweb3.com/rec42> | Remote North America without countries. Suppressed. |
| <https://hashtagweb3.com/sec20> | EMEA emitted as Europe, without a country. Suppressed. |
| <https://hashtagweb3.com/int15> | VP, International Communications emitted as INTERN. Retained with employment claim omitted. |
| <https://hashtagweb3.com/cmp118> | Hybrid despite `isRemote: true`; correctly physical. Retained. |
| <https://hashtagweb3.com/eng625> | Smart Contract Engineer emitted as CONTRACTOR; New York City lacks country evidence. Suppressed. |
| <https://hashtagweb3.com/eng45> | Smart Contract Engineer emitted as CONTRACTOR; Remote US. Retained with employment claim omitted. |
| <https://hashtagweb3.com/dc> | **Not a job page:** homepage preview and homepage canonical. See remaining work. |
| <https://hashtagweb3.com/ops25> | Six eligible countries; deployed schema kept only Cyprus. All six retained. |
| <https://hashtagweb3.com/do16> | Remote Worldwide without countries. Suppressed. |
| <https://hashtagweb3.com/int45> | Remote-first US emitted as TELECOMMUTE. Suppressed pending fully remote evidence. |

Applying the patched builder to the 16 sampled job pages retains nine and suppresses seven.

## Files and verification

- `src/components/job-detail-view.tsx`: conditional schema rendering, omission diagnostics, safe serialization; retains date-policy `notFound()` guard and address-helper re-exports used by existing feeds.
- `src/lib/job-posting-location.ts`: country/address parsing and job-page-specific location eligibility.
- `src/lib/job-posting-schema.ts`: required-field/age/location checks and evidence-limited JSON-LD.
- `scripts/test-job-posting-address.ts`: existing address checks plus ambiguous-code and cross-office regressions.
- `scripts/test-job-posting-schema.ts`: 12 builder/rendering regressions, including date boundaries, actual DOM preservation, fallback text, multi-location restrictions, and script delimiters.
- `scripts/audit-job-posting-schema.ts`: read-only live-catalog/sample audit that prints JSON, including catalog hash and per-page results.

Passing checks:

```sh
npx tsx --test scripts/test-job-posting-schema.ts
npx tsx scripts/test-job-posting-address.ts
node --test scripts/test-job-age-policy.mjs scripts/test-job-age-cache.mjs
npm run typecheck -- --incremental false
git diff --check
```

Results: **12 schema/rendering tests passed**, address regression script passed, **9 age/cache tests passed**, project typecheck passed. Local environment: Node 22.16.0 (repository declares Node 24.x). Dependencies installed with `npm ci --ignore-scripts --no-audit --no-fund`; lockfile unchanged.

Reproduce the live audit:

```sh
npx tsx scripts/audit-job-posting-schema.ts
```

## Remaining work

1. Parent release must deploy these local changes, then validate representative eligible and suppressed URLs with Google's Rich Results Test and URL Inspection. Browser tooling was unavailable here because Chrome was not installed; this audit used fetched HTML, code inspection, SSR tests, and typecheck.
2. Recover structured employer location evidence for suppressed jobs. Generic remote/continent labels alone cannot establish eligible countries. Precise sub-country restrictions need a representation that preserves those restrictions.
3. Preserve explicit employer employment type, expiration, salary currency/period, and application-flow evidence before restoring those optional properties. Do not derive these from discovery dates or arbitrary defaults.
4. **Routing fix included:** `/dc` belongs to an active catalog job (Director, Compensation), but `dc` also appears in `SOCIAL_UTM_MAP`. Previously, `stripSocialPathSuffix('/dc')` selected the homepage shell. The assigned job root now takes precedence; `/dc/x` and `/dc/dc` still attach attribution to the job, and `/discord` remains the homepage Discord link. The shortlink regression suite passes 20,340 matrix requests plus the dedicated collision checks. This preserves `/dc` for the original posting even after expiry.
5. The audit did not verify every employer application's current availability or every full job description. Required metadata checks are necessary but do not guarantee Google's inclusion.
