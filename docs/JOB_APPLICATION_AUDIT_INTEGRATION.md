# Primary application and posting-date audit integration

## Result

The `job-application-audit-20261012` evidence was applied without repeating external GETs. Cleanup at `2026-10-12T22:17:57.550Z` changed the catalog from **1,667 jobs / 177 companies to 1,606 jobs / 175 companies**.

| Exclusion | Jobs |
| --- | ---: |
| Confirmed unavailable application URL | 11 |
| Explicitly closed primary application page | 2 |
| Expired verified original posting date | 43 |
| Unverified primary posting date | 5 |
| Total removed | 61 |

The unavailable group consists of the five FinTax roles (`tc`, `fsic`, `dev9`, `dev8`, `sls80`), Tether `infra3`, and the five Gate.io roles (`job37`, `job35`, `web5`, `web4`, `web2`). Transak `sls4` and Nexo `senior52` use the existing `application-closed` reason.

Gate.io entries explicitly record `applicationState: unavailable` and `atsState: active`. Their original application URLs returned 404 twice; job closure is not established by that evidence. Exact posting identities are excluded, without blocking the whole employer.

## Breezy evidence findings

All 83 remaining Breezy records were checked against the saved primary-page bodies. Their raw SHA-256 hashes were verified before parsing.

- 78 contained a matching JobPosting date.
- 45 original dates were older than 30 days. These include the two closed roles, leaving 43 separate expired exclusions.
- 33 remain eligible with primary-date evidence.
- Five had no matching primary JobPosting date: `2026`, `product542`, `eng422`, `eng47`, and `sup`. These are unverified-date quarantines, not claims of closed applications.

The supplied discrepancy file identified 16 expired dates. Matching the posting URL/id and title across all saved Breezy bodies found **29 additional expired dates**, including cases with an expanded employer display name. Employer identity is checked against the name or the exact board homepage; there is no company-alias or title-template age exception.

Examples:

| Slug | Previous API date | Verified original date |
| --- | --- | --- |
| `marketing211` | 2026-10-09 | 2026-01-29 |
| `engineer816` | 2026-10-09 | 2020-09-03 |
| `engineer624` | 2026-10-10 | 2026-03-19 |

The detailed old/new dates, checkedAt values, body hashes, and additional discrepancies are in `content/job-primary-audit-integration.json`. Original-date facts are stored in `content/job-date-provenance.json` and `content/job-date-history.json`. All 198 legacy Breezy API-history entries were invalidated as posting-date evidence; 78 were replaced with primary-page proof. The unsupported API dates remain recorded as unverified history rather than being treated as original dates.

## Future ingestion and read-time guards

- Breezy `published_date` is no longer used as an original posting date.
- `scripts/lib/breezy-primary-date.ts` fetches the primary page. Failed GETs, challenges, malformed or missing structured dates, and mismatched identities fail closed.
- `src/lib/breezy-posting-date.ts` checks the primary URL identity, title, employer/board and valid calendar date, then records URL, checkedAt, SHA-256 and datePosted evidence.
- Old inferred API history cannot restore an unverified Breezy candidate or override a proved original date. A later republish date cannot advance the first verified posting date.
- Runtime loading, listing generation, company generation and client catalog pagination also enforce the provider's date-evidence requirement.
- Confirmed link exclusions use `content/removed-job-listings.json` and the existing `getJobSourceIssue` path, so a future scrape cannot restore those identities because the ATS API still lists them.

## Preservation and verification

All **135 remaining uncertain audit records** were retained. These are the original 154 uncertain records minus the 14 specifically expired Nexo/Transak records and five broken Gate.io URLs. No unrelated 403/429, redirect, oversized-response or uncertain records were removed.

Verification confirms preserved IDs, slugs, application URLs, and non-Breezy dates for every retained audit record. Historical aliases remain reserved; exclusion reasons were propagated to matching archived aliases. External posts, delivery receipts, publisher guards, video-library records and video hosting assets were not changed by this integration.

Regenerated outputs include runtime/homepage catalogs, all 64 job shards and description shards, company counts, source exclusions, alias/path indexes, expiry scopes, sitemap formats and preview shells. Cleanup removed 61 description bodies and 135 obsolete job preview/image files. Preview checks passed for 5,257 shells and 3,225 local images with zero failures.

The HTTP test checked 62 retired slugs (61 from this phase plus Harmony) under canonical, `/jobs/`, social suffix, preview and OG paths for browser and crawler requests. Every path returned 410 without Apply content or JobPosting schema. Current pages, catalogs, shards, sitemaps and freshness hashes passed. The expiry-bounded CDN/ISR behavior remains in place.

## Read-only video-library follow-up

`content/job-primary-audit-verification.json` lists **5,708 of 6,500 video-library snapshots** whose identity is absent from the eligible catalog or whose snapshot is missing. This is an inventory for the social owner, not a deletion instruction or a claim that every underlying job is closed. No library or hosted video was pruned.

## Commands and handoff

```sh
node --import tsx scripts/apply-primary-job-audit.ts /path/to/job-application-audit-20261012 --apply
node --import tsx scripts/retire-ineligible-jobs.ts --report=content/job-application-cleanup-report.json
node --import tsx scripts/verify-primary-job-audit.ts /path/to/job-application-audit-20261012
npm run test:job-age
node scripts/test-job-age-http.mjs
```

The first command validates cached evidence; it makes no external requests. Preserve the initial integration report when replaying it for diagnostics. Main owns publisher allowlists/shared workflows and the final production build/release. Include the updated exclusion, provenance and history data, generated path/scopes artifacts, and the three audit integration/cleanup/verification reports in the reviewed change set. No commit, push, deployment or outbound publishing was performed here.
