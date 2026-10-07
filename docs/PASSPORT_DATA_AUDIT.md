# Passport entry data audit

## Status on 2026-10-07

The original matrix has 199 passports and 39,402 passport/destination pairs.
The official-source passes support 6,668 pairs. **32,734 pairs have not been
independently checked against government sources.** This is not a completed
worldwide government verification.

All 199 live Passport Index dashboards were retrieved on 2026-10-07. Each has
198 destination rows: **39,402 sourced routes, with no missing passports or
destinations**. Government rules take precedence for 6,668 routes. The remaining
32,734 are explicitly labelled Passport Index references, not independently
government-verified rules. India is one of the 199 passports; its 35 government
rules and 163 reference rules use the same pipeline as every other passport.

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
  six months. India's visa requirement is not a generic 30-day eVisa claim.
- UK: current visa and ETA national lists are checked separately. St Lucia and
  Nicaragua now require visas; their expired transitional ETA exceptions do
  not apply. ETA visitors may seek up to six months per visit, not two years.
  Irish/British Common Travel Area rights are separate from visitor limits.
- Sri Lanka: tourist fee waivers do not remove the prior-ETA requirement.
  The usual tourist ETA is 30 days, with only the balance available on second
  entry. The portal specifies 90 days for Maldives nationals and a separate
  30-day visa-on-arrival exception for Hong Kong SAR citizens.

The official URLs, checked dates, extracted-table hashes and grouped rules are
in `content/nomads/entry-policies.json`. The archived imported matrix remains
in `content/nomads/passport-rules.json`; it is no longer promoted into public
entry claims without evidence.

## Data generation and review

`node scripts/import-passport-policies.mjs` fetches government tables and writes
candidate policies, source HTML and coverage into `.cache/nomads/passport-audit/`.
Review the table mappings, passport types, footnotes and coverage before using
`--write` to update the committed policy file. Manually reviewed policy dates
are fixed and must not be advanced just because the importer was rerun.

`npm run precompute:nomads` builds all 199 public shards offline. It rejects
missing passports, incomplete destination tables, conflicting rules, unknown
country codes and unsupported source records.
Routes without either a government policy or an imported reference have
`t: unknown, d: 0`; the map and table explicitly show "Not yet verified".
Original unsupported answers remain available only in the
archived input, not as current travel advice. The display reports verification
coverage and provides each confirmed rule's conditions and official sources.

The client requests schema version 3 and rejects old cached shards. It also
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

## Validation

- Compared all 39,402 imported labels and stay fields against the 199 saved
  source tables and verified each HTML checksum. The snapshot preserves 20,098
  unstated durations and 2,676 routes with alternative entry options.
- Checked all 199 generated files over HTTP in the production-mode local
  preview: 39,402 routes, 6,668 government rules, 32,734 reference rules and zero
  unsupported routes as of collection.
- All 31 Nomad/data tests, TypeScript checks, production build and postbuild
  checks passed. Regression tests reject empty/partial worldwide snapshots and
  preserve government overrides after an exemption expires.
- Browser checks passed for India, US, Germany, China and UAE passport cases,
  source links, entry filters, 102 canonical pages, 123 redirects and viewport
  widths from 320 to 1440 pixels, with no browser runtime errors.

## Remaining work

Continue destination-by-destination primary-source review for the 32,734
unverified pairs. Add official rule sets and traveler/document conditions;
do not fill missing rules with inferred visa-free status or generic stay lengths.
Source-backed short-visit rules do not cover every individual travel profile,
third-country residence permit, transit route or work/residence permission.
