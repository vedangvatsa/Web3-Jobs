# Passport entry data audit

## Status on 2026-10-08

The second-pass audit accounts for all 199 destinations and each destination's
198 non-self origins: **39,402 routes**, partitioned without gaps or overlaps.

| Official review status | Routes |
| --- | ---: |
| Checked government-backed baseline | 29,761 |
| Historical official evidence | 346 |
| Unresolved official review | 9,295 |

The 30,107 source-backed policies include dated archives, not 30,107 fresh live
government checks. The 346 historical routes rely on India/Pakistan official
pages captured in August/September 2026. Their original titles, capture URLs,
`checkedAt` dates and `historical: true` remain in the catalog and checker.
Multiple captures in one source retain their individual dates in the URLs.

All 199 original Passport Index snapshots (39,402 answers, retrieved 2026-10-07)
remain intact as version 1. Unresolved routes currently retain 25 legacy
government answers and 9,270 Passport Index references. The legacy answers
are **not** counted as newly checked. All 113 explicit withdrawals currently
have reviewed replacements. A withdrawal without a replacement compiles to
unknown with its reason and evidence, never to an older answer.

The complete structured destination audit is
[`content/nomads/entry-factchecks.json`](../content/nomads/entry-factchecks.json):
2,795 losslessly grouped policies, 1,718 source records, all 199 reviews with
findings/attempted URLs and explicit unresolved passport lists, plus withdrawals
and candidate checksums. Findings are destination-level research notes; a
passport-specific blocker in those notes is not assigned to every origin.
The [country-by-country gap report](PASSPORT_FACTCHECK_GAPS.md) lists all 199
destinations, their counts, every unresolved origin code and the research findings.

All 7,523 electronic-visa/authorization entries and 6,053 visa-on-arrival entries
in the imported matrix had the same 30-day duration. Those figures were not
supported by per-route evidence. The cited upstream repository is archived,
last updated on 2025-01-12. A comparison with its community successor found
13,406 differences in types or days, but agreement with another scraped matrix
is not government verification. The successor is not used as a replacement.

## Confirmed corrections and conditions

- India to Malaysia: up to 30 days for tourism/social visits, not 90. The
  exemption currently ends on 2026-12-31. The High Commission of India's
  2026-09-22 advisory requires six-month passport validity, return travel,
  accommodation and the Malaysia Digital Arrival Card.
- India to Hong Kong: up to 14 days after successful pre-arrival registration.
  Registration validity is six months; it is not a six-month stay permission.
- Singapore: a visa is required for Indian ordinary-passport visitors. An
  online visa application does not establish a 30-day stay. ICA determines the
  permitted stay through the electronic Visit Pass on entry. The same absence
  of a guaranteed fixed allowance applies to visa-exempt passports.
- Schengen short visits: the visa-free allowance is shared across the area,
  up to 90 days in any rolling 180-day period. Biometric/SAR passport and Taiwan
  identity-number conditions are retained. EU free movement is treated
  separately from an ordinary 90-day visitor allowance.
- The Hong Kong government table supplies passport-specific periods and visa
  requirements. Special-document exceptions are retained in the conditions.
- Japan: ePassport, registration, initial-stay and extension conditions are
  retained. Indonesia's registered ePassport route is 15 days; Qatar's is 30.
  The ordinary British visitor's initial grant is 90 days, not an automatic
  six months. Indian home-country residents may use the accredited-agency
  eVisa channel for up to 90-day single-entry tourism; residence/channel and
  live issuance-notice conditions remain explicit.
- UK: current visa and ETA national lists are checked separately. St Lucia and
  Nicaragua now require visas; their expired transitional ETA exceptions do
  not apply. ETA visitors may seek up to six months per visit, not two years.
  Irish/British Common Travel Area rights are separate from visitor limits.
- Sri Lanka: HKSAR visitors require prior online ETA, then an entry visa at
  Bandaranaike airport for up to 30 days. These are sequential steps, not
  interchangeable ETA/arrival alternatives. Fee waivers are not visa waivers.
- Georgia: eligible nationalities receive one full year, represented as
  `d: 0, stay: "1 year"`, not 360 days or a guessed calendar-day conversion.
- Thailand: the September 2026 schedule replaces earlier periods, including
  30 days for US and Russian tourists; TDAC and other conditions are retained.
- Cambodia: PRC/Macao's temporary 14-day exemption ends 2026-10-15. It cannot
  fall back to an older eVisa/VOA answer when that documented waiver expires.
- Palau: the current prior-visa/written-preclearance list is preserved, including
  Nigeria. Preclearance and formal visas have distinct stay rules. US/FSM/Marshall
  Islands visitor exemptions are not labelled unrestricted free movement.

The original legacy rules remain in `content/nomads/entry-policies.json`;
reviewed corrections and full audit findings are in `entry-factchecks.json`.
The archived imported matrix remains
in `content/nomads/passport-rules.json`; it is no longer promoted into public
entry claims without evidence.

## Data generation and review

Use Node 24. The reproducible importer reads the ten reviewed candidate files
from `.cache/nomads/factcheck/<group>.json`, using the committed jurisdiction
contract in `content/nomads/factcheck-groups.json`:

```sh
npm run import:passport-factchecks
npm run import:passport-factchecks -- --check
npm run precompute:nomads
npm run test:nomads
npm run typecheck
npx tsx scripts/audit-passport-corpus.ts
npx tsx scripts/report-passport-factcheck-gaps.ts
```

The `--check` mode verifies exact reproducibility, including candidate SHA-256s.
Regular builds need only the committed audit, not research caches or network
access. The importer validates every destination exactly once, exhaustive
policy/unresolved partitions, codes, self exclusion, duplicate/conflicting
routes, source IDs, dates, types, stays, methods and withdrawal evidence.
Only identical policies are coalesced. Conditions and source-specific checks
are preserved. Public citations omit ephemeral nonce/token URLs when stable
landing URLs exist; raw receipts and source HTML remain in ignored caches.
Re-running imports never advances a source date.

`npm run precompute:nomads` builds all 199 public shards offline. It rejects
missing passports, incomplete destination tables, conflicting rules, unknown
country codes and unsupported source records.
Precedence is reviewed replacement, explicit withdrawal, legacy government
rule, then Passport Index reference. Merely unresolved routes retain previous
answers with an unresolved review status. Unknown and expired rules retain
evidence where available. A generic `vr` means a visa requirement; it does not
prove eVisa unavailability. The UI states this method uncertainty. `d: 0` means
no single documented day limit; `stay` preserves calendar or variable periods.

The client requests schema version 4 and rejects old cached shards. Each
destination has `review: checked | historical | unresolved`, separate from its
answer and source kind. Source details render useful titles and readable dates.
The client also
checks exemption expiry at display time, so an old cached Malaysian waiver
cannot continue to appear current after 2026-12-31.

## Live Passport Index import

`scripts/import-passport-index.ts` reads live dashboards or saved HTML pages,
using the visible `.vrules` and `.vdays` fields rather than mobility-score CSS
classes. For example, Armenia's eVisa appears in a VOA scoring bucket, but is
still imported as an eVisa. Combined eVisa/VOA options are retained, and a
missing duration stays unspecified. Arrival declarations are distinguished
from visas. Affiliate application links and passport images are not imported.
Fee-free visas on arrival are still visas, and an electronic visa-on-arrival
process is not split into two independent options. EASE and fast-track labels,
travel permits, registration requirements and reported restrictions retain
their source wording.

Snapshots in `content/nomads/passport-index.json` retain the source URL,
retrieval timestamp, HTML checksum and original published claims. The India
page itself reports Malaysia as "Digital Arrival Card 90"; the public result
keeps the government-confirmed 30-day limit. An expired official exemption
does not fall back to a contradictory reference.

Commands:

```sh
npx tsx scripts/import-passport-index.ts --passport IN --html /path/to/india.html --fetched-at 2026-10-07T17:04:12Z --write
npx tsx scripts/import-passport-index.ts --all --html-dir /path/to/saved-dashboards --fetched-at 2026-10-07T17:04:12Z --write
npx tsx scripts/import-passport-index.ts --all --write
npx tsx scripts/import-passport-index.ts --all --user-agent opencode --write
npm run precompute:nomads
```

The complete-matrix import rejects missing passports or incomplete rows before
replacing the published snapshot. Use `--user-agent` only to identify the actual
client; the OpenCode collection identified itself as `opencode`, as its web
fetch tool does. Initial requests from the generic importer received HTTP 403.
An HTTP 429 stopped collection; collection resumed after a cooldown with a
five-second interval. All 199 dashboards subsequently returned complete tables.
The source HTML and per-page retrieval receipts are cached locally for audit.

No community mirror was substituted for these live pages. The latest checked
`A-contresens/passport-index-data` mirror contains an empty JSON object despite
recent commits. An older complete snapshot was inspected but not adopted.

## Validation and payloads

- Compared all 39,402 imported labels and stay fields against the 199 saved
  source tables and verified each HTML checksum. The snapshot preserves 20,098
  unstated durations and 2,676 routes with alternative entry options.
- The corpus audit measures all generated shards and compares each route with
  the unchanged source snapshots: 5,017 category changes, 9,121 day-count
  changes and 6,919 stay/alternative-method changes (overlapping counts).
- Regression checks cover lossless expansion of every reviewed policy,
  retention of unresolved provenance, withdrawal without replacement, expiry,
  archives, generic method uncertainty, variable methods/stays and worldwide
  corrections. Existing program-preservation checks still cover all programs.
- Full shards total 27,849,495 bytes raw / 6,645,999 bytes gzip. The largest
  gzip shard is Canada at 38,114 bytes (153,903 raw). Budgets are 45,000 gzip
  and 180,000 raw bytes per shard, replacing the obsolete 6,000 gzip budget.
  The additional bytes carry per-route conditions, sources and review status.
  Policies are grouped in the canonical audit; public JSON is minified, unused
  source records are removed, and repeated conditions compress during transfer.
  The checker still lazy-loads **only the selected passport**, not all 199.
- The original reference file SHA-256 is
  `cfbba9ffc469e7f80b9140aa36a1371aabdb2260499b3108771c4684afbb3f6e`.
- Node 24.21.0: importer `--check`, precompute, all 36 Nomad/data tests and
  TypeScript checks passed. Production browser checks passed for all 199 served
  shards, 102 canonical pages, 123 redirects and widths 320–1440px, including
  expanded archive citations, unresolved reference provenance, corrected routes,
  lazy shard loading and program preservation. No browser runtime errors.
- Full production build and postbuild passed after repairing stale generated
  social-image metadata against the current catalogs. The metadata referenced
  117 retired images; the existing generator preserved all 8,044 valid entries
  and added 115 current entries. No deleted image was restored and no asset
  gate was weakened. The local production preview was refreshed on port 3000.
- Browser checks were repeated after the repair and review-label changes:
  all 199 served v4 shards match the generated files. Map tooltips also expose
  review status. Validators reject reference or historical evidence labelled
  as a current government check. Expiry-aware browser coverage checks do not
  mistake a correctly expired waiver for an import regression.

## Remaining work

Continue destination-by-destination primary-source review for the 9,295
unresolved routes and refresh the 346 archive-dependent routes from current
official evidence. The structured audit records the specific evidence gaps.
Add official rule sets and traveler/document conditions;
do not fill missing rules with inferred visa-free status or generic stay lengths.
Source-backed short-visit rules do not cover every individual travel profile,
third-country residence permit, transit route or work/residence permission.
