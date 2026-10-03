# Job application audit and retirement

## 2026-10-03 cleanup

- Audited 9,383 distinct application destinations across the active catalog and
  historical job records, using public employer APIs, HTTP responses and browser
  rendering where needed.
- Excluded 2,396 source identities: the requested `/eio` and `/marketing220`
  removals plus confirmed missing or closed application destinations.
- Removed 45 active listings. The resulting catalog has 6,159 active jobs across
  290 companies. Historical aliases were retired with their source identities.
- Verified 4,854 owned root URLs return HTTP 410 with `X-Robots-Tag: noindex`.
  Other content owning an overlapping slug, such as the `/global` event page,
  is protected from job retirement. The original Bybit ownership of
  `/product578` is also preserved when removing the unrelated Bastion listing
  that had reused that alias.
- Corrected 1,443 location/work-arrangement labels. `/it3` now displays
  `Remote (Worldwide)`, matching its title and the employer's remote flag,
  instead of `Hungary` alone.
- Recorded 269 destinations as unverified because of access restrictions,
  unavailable responses, or inconclusive rendered content. These are not
  treated as evidence of closure.

Evidence is in `content/removed-job-listings.json` and
`content/job-application-audit.json`. Raw resumable audit output is kept in the
ignored `.cache/job-applications/` directory.

## Evidence and safeguards

An employer's live posting API can confirm an opening. Absence from a board list
alone is insufficient: individual posting endpoints or hosted job data are
checked too. Removals require repeated HTTP 404/410 responses, explicit closed
or not-found messages, repeated missing-posting data, or an explicit expired-job
redirect. Authentication failures, rate limiting, timeouts, and a generic
homepage redirect alone remain unverified.

Exclusions are keyed by the existing source-stable identity. They apply to
ingestion, runtime catalogs and archived-job reconstruction, including a
retitled posting or tracking-query variation of the same source URL. A compact
generated slug index handles 410 responses before social-preview rewrites.
Obsolete preview shells and job images are removed instead of generating new
share pages for deleted roles. Job URLs are not reused for unrelated roles.

Work arrangements use employer fields such as `isRemote` and `workplaceType`,
explicit location labels, and unambiguous title qualifiers. A worldwide title
takes precedence over office-location metadata. Regional remote restrictions
stay visible. Missing location evidence is not automatically labelled remote.
Ashby, its hosted-board fallback, Lever, Workable and Breezy ingestion preserve
their available work-arrangement fields.

Job structured data shares the remote classifier. Address parsing understands
the displayed remote/hybrid location wrappers. The country-required Adzuna
feeds use a stated or resolvable country instead of assigning all remote jobs
to the United Kingdom; unspecified/global scopes remain in the main catalog
and general feeds.

## Maintenance

Run with Node 24 from the project root:

```sh
npx tsx scripts/audit-job-applications.ts
npx tsx scripts/audit-job-applications.ts --summary
CHROME_BIN=/path/to/chrome npx tsx scripts/audit-job-applications-browser.ts
npx tsx scripts/apply-job-application-audit.ts
npx tsx scripts/apply-job-application-audit.ts --apply
npx tsx scripts/retire-rejected-job-sources.ts
FAH_FAST_PREBUILD=1 OG_PRECOMPUTE=0 OG_FILL_MISSING=0 npm run build
```

The first audit resumes recent results. Use `--fresh` for a complete new pass,
`--refresh-unverified` to revisit inconclusive entries, or
`--refresh-host=example.com` to revisit an affected host. Applying an audit
requires fresh evidence and matching source URLs. Review the dry-run output
before `--apply`. Exclusions remain until explicitly reviewed and removed.
Builds run the local checks and regenerate indexes; they do not run the network
audit automatically.

## Verification

```sh
npx tsx scripts/test-job-application-cleanup.ts --compare-head
npx tsx scripts/test-job-posting-address.ts
CHROME_BIN=/path/to/chrome npx tsx scripts/test-job-application-cleanup-browser.ts
```

`--compare-head` is a pre-commit check that retained postings keep their original
IDs, slugs, URLs, titles, companies and content; only the intended location fields
may differ. The browser/HTTP check covers all removed URLs, crawler requests,
the live remote example, structured data, regional feed locations, protected
content, the compact visa links and removal of redundant Nomad copy.

The production build, typecheck, ATS ownership checks, catalog/count checks,
published event identities, social previews, all 14 Nomad suites, the 113-route
Nomad browser suite and the current-catalog cost regression passed.

## Yandex query cleanup

`public/robots.txt` includes `Clean-param: amp /` in the YandexBot group.
Sample plain and `?amp&amp` job URLs already use the same clean canonical URL.
The directive lets Yandex avoid redundant crawling after deployment and its
next robots refresh. Content-bearing filter/query parameters are not listed.
