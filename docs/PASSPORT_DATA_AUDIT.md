# Passport entry data audit

## Status on 2026-10-08

The reviewed AIP follow-up accounts for all 199 destinations and each destination's
198 non-self origins: **39,402 routes**, partitioned without gaps or overlaps.

| Official review status | Routes |
| --- | ---: |
| Checked government-backed baseline | 33,620 |
| Historical official evidence | 983 |
| Unresolved official review | 4,799 |

The 34,603 source-backed routes include dated archives and historical document
reproductions. They are not 34,603 fresh live government checks. Source titles,
capture URLs, `checkedAt` dates and `historical: true` remain in the catalog and
checker. Historical status follows the evidence, not its hosting domain: the
signed Congo circular reproduction and explicitly pre-transition Syria guidance
are historical even though their citations are outside web.archive.org.
Current evidence remains missing for **5,782 routes** (historical plus unresolved).
Some supported rules establish only air-entry scope or a requirement with uncertain
issuance; these qualifications remain visible and do not certify all-mode travel.

All 199 original Passport Index snapshots (39,402 answers, retrieved 2026-10-07)
remain intact as version 1. Unresolved routes currently retain 3 legacy
government answers and 4,791 Passport Index references, plus five unknown
withdrawn claims. The legacy answers are **not** counted as newly checked.
Of 188 withdrawal records, 183 have reviewed replacements. These include
superseded method wording as well as changed categories or durations.
A withdrawal without a replacement compiles to
unknown with its reason and evidence, never to an older answer.

The complete structured destination audit is
[`content/nomads/entry-factchecks.json`](../content/nomads/entry-factchecks.json):
3,669 losslessly grouped policies, 2,335 source records, all 199 reviews with
findings/attempted URLs and explicit unresolved passport lists, plus withdrawals
and candidate checksums. Findings are destination-level research notes; a
passport-specific blocker in those notes is not assigned to every origin.
The [country-by-country gap report](PASSPORT_FACTCHECK_GAPS.md) lists all 199
destinations, their counts, every unresolved origin code and the research findings.

## Third-pass integration accounting

The baseline SHA-256 was validated as
`628d74004a53c4e3e18467e95a6051e23182bdffd858efc24cdde02b1268d31c`.
All 12 batches own disjoint destination sets. Their reviews exactly partition
all 9,295 baseline gaps; supplied addition policies equal the resolved sets.

| Batch | Baseline gaps | Current additions | Historical additions | Replacements | Remaining gaps |
| --- | ---: | ---: | ---: | ---: | ---: |
| gap-01 | 762 | 132 | 125 | 0 | 505 |
| gap-02 | 771 | 318 | 185 | 1 | 268 |
| gap-03 | 759 | 243 | 31 | 1 | 485 |
| gap-04 | 782 | 127 | 0 | 0 | 655 |
| gap-05 | 758 | 140 | 75 | 7 | 543 |
| gap-06 | 786 | 131 | 0 | 0 | 655 |
| gap-07 | 789 | 221 | 4 | 0 | 564 |
| gap-08 | 785 | 108 | 6 | 0 | 671 |
| gap-09 | 770 | 295 | 0 | 45 | 475 |
| gap-10 | 782 | 266 | 0 | 0 | 516 |
| gap-11 | 770 | 326 | 0 | 0 | 444 |
| gap-12 | 781 | 163 | 205 | 1 | 413 |
| **Total** | **9,295** | **2,470** | **631** | **55** | **6,194** |

The 55 replacements require previously supported routes, an explicit reason,
replacement policy and corresponding evidence. They cover VA→BD, PA→TJ,
seven AZ routes, 45 EC method improvements and CN→KW. The 45 Ecuador records
improve method evidence; they do not imply the earlier visa requirement was wrong.
Six Azerbaijan replacements (BH/KW/OM/SA/JP/KR) downgrade current-labelled
airport-visa evidence to the **2026-07-23 historical ASAN capture**, retaining
three-entry limits and expiry. They do not add six current checks.

Integration also withdrew **IS→SZ**: the prior Brussels exemption conflicts
with the inspected ministry PDF's Iceland `Y` row. Neither supersession nor a
supported replacement was established. This adds one unresolved route outside
the original-gap partition, making the third-pass unresolved count **6,195**.
Its unknown rule preserves both sources and prevents fallback to the old waiver.

Arithmetic: current = 29,761 + 2,470 − 6 − 1 = **32,224**;
historical = 346 + 631 + 6 = **983**. All counts are computed by the importer,
validated by replay and compiler tests, and recorded in the canonical `passes` ledger.
Original batch JSON is versioned unchanged under
`content/nomads/factcheck-passes/gap-pass3/`. The committable pass inputs contain
only the pinned baseline, assignments, patch JSON and manifest. All 12 patch
checksums and the baseline checksum are preserved. Source URL/date/hash provenance
and policy conditions remain in the patches. Raw notes, quotations, evidence
ledgers and captures remain unchanged in ignored `.cache/nomads/gap-pass3/`;
they are not exported into the versioned pass directory.

## Fourth-pass integration accounting

Pass four pins the full preceding canonical output at SHA-256
`4f998906b7a139661baf2a82d15de315463be057bd7eccf79c463f2448945055`.
The replayer reconstructs and verifies that baseline before applying the next pass;
it does not need another exported baseline copy. All 12 original patch files retain
their byte-level hashes. Assignments cover the exact 6,195 baseline gaps in disjoint
destination sets, and every resolved/remaining partition is checked against that baseline.

| Batch | Baseline gaps | Current additions | Historical additions | Research corrections | Remaining gaps |
| --- | ---: | ---: | ---: | ---: | ---: |
| gap4-01 | 524 | 138 | 0 | 0 | 386 |
| gap4-02 | 524 | 20 | 0 | 0 | 504 |
| gap4-03 | 524 | 111 | 0 | 0 | 413 |
| gap4-04 | 524 | 167 | 0 | 1 | 357 |
| gap4-05 | 510 | 243 | 0 | 0 | 267 |
| gap4-06 | 524 | 151 | 0 | 0 | 373 |
| gap4-07 | 518 | 25 | 0 | 1 | 493 |
| gap4-08 | 510 | 46 | 0 | 0 | 464 |
| gap4-09 | 510 | 26 | 0 | 0 | 484 |
| gap4-10 | 508 | 188 | 0 | 0 | 320 |
| gap4-11 | 510 | 33 | 0 | 0 | 477 |
| gap4-12 | 509 | 80 | 0 | 0 | 429 |
| **Total** | **6,195** | **1,228** | **0** | **2** | **4,967** |

The research corrections are **CZ→ST**, now an explicitly sourced 15-day waiver,
and **TW→NR**, removal of the Taiwan fee-exemption claim under SL 14/2024 while
retaining visa duty. Neither changes historical status. No extra unresolved
withdrawal was warranted; the Iceland–Eswatini conflict remains unresolved.

### Nauru method qualification

The separate gap4-07 finding was compared with the actual baseline rules and
the cached RONLAW consolidation, including Regulations 12(2)(a), 12(7), 16(4)
and Schedule 3, alongside current Tourism instructions. Visa duty is supported;
the categorical preapproval-only/no-VOA wording is not. The law permits on-entry
applications for the listed fee-exempt nationalities, while Tourism requires
advance application and a printed approval letter. Practical implementation is
unreconciled, so this is neither an unconditional arrival-visa entitlement nor
visa freedom.

**13 integration qualifications**, separately counted from the two research
corrections, cover CN/FJ/FM/KI/MH/PG/PW/SB/TH/TO/TV/VU/WS→NR. They retain `vr`,
`d=0`, passport, photograph, return/onward, accommodation and support conditions,
and distinguish the three-month statutory ceiling from an actual grant. Both
old and new citations remain available. The UAE and Russian treaty waivers
remain intact. No route is newly counted as checked by these qualifications.

`gap-pass4/qualifications.json` contains only authored replacement policy data:
exact previous rule, qualified rule, reason, batch and source IDs. Its hash is
pinned in the manifest. The replayer rejects stale previous rules, duplicate
routes, missing evidence or changes to category, numeric stay, historical status
or coverage through this mechanism. Each qualification also has a canonical
replacement/withdrawal provenance record, preventing fallback to superseded wording.

Fourth-pass arithmetic: **32,224 + 1,228 = 33,452 current-supported**;
**983 historical**, unchanged; **6,195 − 1,228 = 4,967 unresolved**.
Requirement-only, territorial, residence, age and document-recognition additions
retain practical issuance uncertainty; they do not certify functioning tourist
channels or individual admission. The six earlier ASAN historical downgrades
remain historical. Raw fourth-pass notes, ledgers and quotations stay in the
original ignored cache, not in the curated pass directory.

## Reviewed AIP targeted follow-up

This pass pins the preceding canonical output at
`fb7593d6d43a6794e69b98750cf7222936cc03fe16c8a9a041616ab239f49da4`.
Its reviewed research input is identified by SHA-256
`14f734144ac48ca6dee8eca8db88ede562bcf446bd1d2e371dc458426ca32abf`.
The earlier 173-route proposal is superseded: RW→BF is withheld, and the four
Niger corrections are withdrawals to unresolved, not automatic exemptions.

| Destination | Baseline gaps | Current air-entry additions | Newly withdrawn claims | Final gaps |
| --- | ---: | ---: | ---: | ---: |
| Burkina Faso | 169 | 161 | 0 | 8 |
| Niger | 6 | 2 | 4 | 8 |
| Central African Republic | 191 | 9 | 0 | 182 |
| **Targeted total** | **366** | **172** | **4** | **198** |

The 172 additions comprise 156 prior-electronic-visa requirements into Burkina
Faso and 16 named exemptions (BF 5, NE 2, CF 9). Every new label starts with
**Air entry only**, and every note excludes unproved land/sea entry, crew,
airside transit, employment and residence. No third-country status is assumed.
All numeric stays remain `d=0`: Mali→Niger retains up to **three months**, while
Burkina→Niger retains the **three months versus 60 days** conflict with no chosen
maximum. Other existing Niger fee, stay and method records are unchanged.

### Continuing publication and historical context

Current support comes from operative entry text and its specific continuing
publication, not merely the date on the overall AIP package:

- Burkina Faso GEN 1.3 pages are dated **2 October 2025**, introduced by
  **AMDT 10/25**, and individually retained in the full **AMDT 10/26** page
  register effective **1 October 2026**. The January 2026 HTML title is not an
  enactment date. Ordinary-passport exemptions are separate from the
  diplomatic/service CEN-SAD 30-day provision.
- Niger GEN 1.3 pages are dated **11 June 2026**, replaced by **AMDT 06/26**,
  and individually retained in that October register. The ordinary exemptions
  are in **passengers at entry**, not exit, transit, fee or special-passport rules.
- CAR **AIC 17/A/22FC**, dated **25 March 2022**, remains listed **PERM** in the
  current AIC index. Only nine named air-entry exemptions are added. No residual
  default, general CEMAC exemption, US permission or unconditional Bangui VOA is
  inferred. The exceptional less-than-one-month process requires prior MFA
  validation; it is not the visa-free stay allowance.
- Superseded **AMDT 08/24** is explicitly historical comparison evidence only.
  It supports conflict history, never a new current or historical policy route.

### Niger conflicts and fallback blocking

**SE/MR/MU/RW→NE** now compile to **unknown / unresolved** with the actual AIP,
Paris mission default, relevant origin-government evidence, older comparison
where relevant, and previous source ID retained. No duration or replacement visa
category is assigned. The original pass-four rules remain in replacement records
with `replacement: null`; neither legacy policies nor Passport Index can fill them.
The Swedish/Mauritanian AIP exemptions already existed in 2024, and first
appearance of Mauritius/Rwanda in the compared 2026 text does not prove priority
over contrary official evidence. RW→BF remains unresolved for its separate
origin-government waiver versus AIP-default conflict.

Arithmetic: **33,452 + 172 − 4 = 33,620 current-supported**;
**983 historical**, unchanged; **4,967 − 172 + 4 = 4,799 unresolved**.
Only BF/NE/CF are targeted. Their original gaps are exhaustively partitioned;
all other destination reviews and untouched policies remain lossless.

Curated inputs are `factcheck-passes/aip-research/assignments.json` and
`aip-reviewed.json`, with hashes, research-input fingerprint and four withdrawal
records in the manifest. The capture adapter validates the reviewed v2 research
candidate, source bytes, dates, scope, holds and baseline before exporting the
v1 patch. It exports authored policy/source summaries and URL/date/hash provenance
only; original notes, quotations, evidence ledgers, receipts and PDFs stay unchanged
in the ignored cache. All prior pass-three/pass-four artifacts and hashes remain intact.

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

Use Node 24. The default importer reads the versioned pass manifest at
`content/nomads/factcheck-passes/manifest.json`: a byte-pinned pass-two baseline,
then ordered, hash-pinned assignments, all 24 original third-/fourth-pass patches
and the curated targeted AIP patch.
Replay verifies only these data-artifact fingerprints. No raw research notes,
evidence ledgers, cache or network are required. The manifest explicitly lists
integration withdrawals and the data-only Nauru qualification artifact;
its schema rejects research-file fields and paths.
The capture helper copies only the named baseline, assignments and batch JSON;
it never scans or exports research notes or evidence directories.
Each subsequent pass pins the complete canonical output of the preceding pass;
the manifest-prefix fingerprint keeps earlier outputs stable when a later pass is added.
`scripts/capture-passport-gap-pass4.ts` is the one-time append operation: it
validates the cache baseline against both canonical bytes and preceding replay,
validates all candidates, then captures only assignments/patches and authored
qualification data. It refuses to append a duplicate pass or overwrite artifacts.
`scripts/capture-passport-aip-review.ts` similarly performs the one-time reviewed
AIP conversion, with no network requests or writes to original research files.
Targeted assignments must explicitly declare `scope: targeted`; default passes
still require coverage of every baseline gap destination. Both modes require
exact assigned-origin partitions and preserve every unassigned destination.

```sh
npm run import:passport-factchecks
npm run import:passport-factchecks -- --check
# Optional: reproduce the pinned baseline from the original ten cached candidates,
# then apply every manifest pass (never overwrite the audit with only pass two).
npm run import:passport-factchecks -- --check --legacy-inputs
npm run precompute:nomads
npm run test:nomads
npm run typecheck
npx tsx scripts/audit-passport-corpus.ts --write
npx tsx scripts/audit-passport-corpus.ts --check
npx tsx scripts/report-passport-factcheck-gaps.ts
npx tsx scripts/report-passport-factcheck-gaps.ts --check
# Optional research-cache check, separate from builds/offline import:
npx tsx scripts/verify-passport-source-captures.ts
```

The `--check` mode verifies exact reproducibility, including candidate SHA-256s.
Regular builds need only the committed audit, not research caches or network
access. The importer validates every destination exactly once, exhaustive
policy/unresolved partitions, codes, self exclusion, duplicate/conflicting
routes, source IDs, dates, types, stays, methods and withdrawal evidence.
The merger subtracts exact passport/destination pairs only for explicit replacements;
multi-destination baseline policies keep their other routes. All untouched rules
and sources are compared losslessly, including conditions. Findings and attempted
URLs accumulate rather than being overwritten. Each canonical `replacements`
record preserves batch, reason, evidence, previous rule and replacement rule
(or `null` for withdrawal). Matching withdrawal records merge reasons and sources
instead of duplicating a route. New source IDs must use their batch prefix;
references to existing baseline IDs retain their original dates and content.
Public citations omit ephemeral nonce/token URLs when stable
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
  the unchanged source snapshots: 6,366 category changes, 10,269 day-count
  changes and 7,523 stay/alternative-method changes (overlapping counts).
  The reproducible machine report is [PASSPORT_CORPUS_AUDIT.json](PASSPORT_CORPUS_AUDIT.json).
- Regression checks cover lossless expansion of every reviewed policy,
  retention of unresolved provenance, withdrawal without replacement, expiry,
  archives, generic method uncertainty, variable methods/stays and worldwide
  corrections. Existing program-preservation checks still cover all programs.
- Full shards total 33,476,127 bytes raw / 8,568,366 bytes gzip. The largest
  shard is Somalia at 182,953 bytes raw / 48,296 bytes gzip, exceeding both
  preceding limits. The measured budget is now 185,000 raw / 50,000 gzip per shard.
  The additional bytes carry per-route conditions, sources and review status.
  Policies are grouped in the canonical audit; public JSON is minified, unused
  source records are removed, and repeated conditions compress during transfer.
  The checker still lazy-loads **only the selected passport**, not all 199.
- The original reference file SHA-256 is
  `cfbba9ffc469e7f80b9140aa36a1371aabdb2260499b3108771c4684afbb3f6e`.
- Node 24.21.0: offline and legacy-input importer checks, precompute, all 48
  Nomad/data tests and TypeScript checks passed. Tests cover malformed patch
  partitions/corrections, exact-pair subtraction, overlapping withdrawal deduplication,
  historical downgrades, supplemental source registration, manifest replay and
  data-only capture/export with byte-preserved inputs and untouched research files,
  pass-four corrections, coverage-preserving Nauru qualifications, targeted-pass
  isolation, AIP air scope/dates and all four Niger fallback-blocking withdrawals.
- Pass four adds 233 source records: all 192 declared hashes match preserved
  captures, including two reused earlier captures. The 41 composite/excerpt
  sources without a single declared hash retain their URLs/dates and original
  cache provenance; no fabricated digest is assigned. Together with pass three,
  550 declared hashes match preserved captures; 52 sources have no single hash.
  The AIP follow-up adds 15 hashed source records; all match preserved captures.
  Its capture also verified 31 distinct component hashes. The Swedish hash is
  explicitly a preserved webfetch receipt, not an original HTTP-body hash.
  Across all appended passes, 565 declared hashes match, with 52 unhashed
  composite/excerpt records. The superseded Niger source is historical context only.
- Production browser checks passed on isolated port 3184: all 199 served v4
  shards exactly match generated files, 102 canonical pages, 123 redirects,
  widths 320–1440px, selected-passport lazy loading, archive/provenance display
  and program preservation. No browser runtime errors. The port-3000 preview
  process was not stopped or restarted.
- Fast production build and postbuild passed, including standalone public assets,
  prerender budget and feed compression, after the separately completed asset repair.
  The catalog smoke check reports 5,824 active jobs. No broad prebuild was run.

## Remaining work

Continue destination-by-destination primary-source review for the 4,799
unresolved routes and refresh the 983 historical-evidence routes from current
official evidence. The structured audit records the specific evidence gaps.
Add official rule sets and traveler/document conditions;
do not fill missing rules with inferred visa-free status or generic stay lengths.
Source-backed short-visit rules do not cover every individual travel profile,
third-country residence permit, transit route or work/residence permission.
