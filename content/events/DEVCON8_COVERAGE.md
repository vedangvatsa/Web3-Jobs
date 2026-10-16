# Devcon 8 public calendar coverage

Audited the actual <https://luma.com/devcon8> against `fix/ibw-event-descriptions` at baseline `635f31ff014aa4bc0c60f54a681d1a3a47864f17`. The page identifies **Devcon 8 Side Events**, canonical URL <https://luma.com/Devcon8>, calendar ID `cal-uho3uXcPGigtake`. No assumption about `/devcon` was used.

Calendar fetched at **2026-10-16T08:51:26.385Z**, using the system's actual UTC clock. Primary pages were fetched separately on October 16; every receipt has its own timestamp and SHA-256. This is a local source/runtime audit, not a claim that these changes are live.

## Exhaustive pagination

| Public API view | Pages | Raw entries | Terminal response |
| --- | ---: | ---: | --- |
| `future` | 2 | 50 + 28 = 78 | `has_more: false`, no next cursor |
| `past` | 1 | 5 | `has_more: false`, no next cursor |
| Total | 3 | **83** | Both views exhausted |

There are **83 unique calendar-entry IDs and 77 distinct event identities**. No repeated entry IDs or cursors occurred. The future page-two request used the exact page-one `next_cursor`; there was no first-page or top-50 truncation. The 83 entries comprise 62 Luma entries and 21 external-link entries. Six extra rows are separate day occurrences of TokenIQ, Institutional Forum, Future Asset Forum, ETHGlobal Mumbai and Unchained Summit.

The API's views are start-based: the 78 future rows represent 72 identities; the five past-view rows contain **two ongoing programs and three ended events**. Ongoing programs were checked against their primary end dates rather than discarded as past. One external link redirects to an explicitly private Luma page; public-calendar discovery does not make that event eligible for import.

## Reconciliation

| Decision | Calendar rows | Distinct identities |
| --- | ---: | ---: |
| Existing coverage without an unresolved audit hold | 52 | 47 |
| Newly publishable coverage | 15 | 14 |
| Held, including ended entries | 16 | 16 |
| Total | **83** | **77** |

**67 rows / 61 identities are covered in the resulting event runtime. We cannot claim every calendar entry is published.** Held rows may already have a protected record, but conflicting dates or partial program scope are not counted as full coverage.

Comparison used all eight registered `EVENT_SOURCES` feeds, runtime identities, Luma verification IDs, event URLs, `lu.ma`/`luma.com` normalization, canonical redirects and existing aliases. Source-only records, including automated incoming records, were checked before adding anything. Titles alone were not accepted as proof.

The complete row ledger is [`devcon8-coverage.json`](devcon8-coverage.json): every entry ID, event identity, source and primary links, original source matches, coverage decision, reason, runtime slug, receipt and pagination cursor. Raw-field projections and organizer descriptions are retained locally under `.cache/devcon8-audit/`, ignored except for its `.gitignore`. Guests, credentials, tracking payloads and hidden coordinates are not retained as audit evidence.

### Newly publishable identities

Twelve records were appended to registered sources. Two existing source-only records were enriched in place; no duplicate identity was appended for either.

| Canonical route | Source change |
| --- | --- |
| `/road-to-devcon-mumbai-a36` | Added to `india-luma-events.json` |
| `/road-to-devcon-bhopal-a36` | Added to `india-luma-events.json` |
| `/road-to-devcon-pune-a36` | Added to `india-luma-events.json` |
| `/born-up-ibw-mumbai` | Added to `india-luma-events.json` |
| `/off-chain-padel-mumbai` | Added to `india-luma-events.json` |
| `/born-up-devcon-mumbai` | Added to `india-luma-events.json` |
| `/midweek-block-party-mumbai` | Added to `india-luma-events.json` |
| `/notneils-stealth-founder-dinner` | Added to `india-luma-events.json` |
| `/field-station-rajasthan` | Added to `curated-events.json` |
| `/tokeniq-mumbai` | Added to `curated-events.json`; both calendar days map to one event |
| `/dev3pack-devcon-career-fair` | Added to `curated-events.json` |
| `/edge-city-india-village` | Added to `curated-events.json`; ongoing, October 11-November 1 |
| `/hacker-house-goa` | Enriched existing `w3v-hacker-house-goa-26-10-28` in `events-cache.json` |
| `/perps-and-chai-hyprearn-mumbai` | Enriched existing `w3v-perps--chai-with-hyprearn` in `events-cache.json` |

Descriptions retain useful program, eligibility, ticket and access details from full organizer copy. They omit empty sponsor headings, navigation and promotional padding. Luma clock times retain the source UTC values and `Asia/Kolkata` timezone. External events without confirmed clocks use date-only values. Field Station's year is explicitly attributed to calendar metadata; its October 23-31 span comes from the organizer. Free meetup registration is distinguished from required paid conference access. Hidden venues remain hidden.

### Held entries

| Entry | Reason |
| --- | --- |
| [Pune Final Edition](https://luma.com/3qtj8ogp) | Full description is only "Coming Soon." No program invented. |
| [Bittensor Builders House](https://luma.com/bittensor-hh) | Copy ends October 31; structured schedule ends November 1. |
| [Codecrax Stay](https://luma.com/3xweds1f) | Accommodation booking coordination, not a scheduled event. |
| [IBW Pre-Conference VIP Night](https://indiablockchainweek.com/) | Calendar starts 17:00; existing organizer-sheet evidence says 19:00-23:00. Shared homepage is not proof of the separate night. |
| [Crypto Mondays](https://luma.com/9bhu9f28) | Structured 19:30-23:00 schedule conflicts with 18:00-21:30 agenda. |
| [Pragma Mumbai](https://ethglobal.com/events/pragma-mumbai) | Calendar November 4 conflicts with reviewed November 6 evidence; fresh primary GET returned 500. |
| [Ethereum Forward Defence Summit](https://tinyurl.com/2sx9f622) | Redirected primary is explicitly private. Only public identity metadata retained. |
| [Open House](https://luma.com/gjfpaw4r) | Structured end is 19:30; copy and closing-party agenda end 22:00. |
| [Biggest CT G.A.Y Party](https://luma.com/ena53peq) | Structured November 5 schedule conflicts with December 6 in the description. |
| [NEAR x Quantus](https://luma.com/xuofsg0p) | Fresh primary says 17:30-20:30; protected runtime says 18:00-21:00. Existing record preserved for review. |
| [Enterprise AI Summit](https://luma.com/y2o1cuts) | Primary confirms December 5 but provides no verified Web3 program. |
| [A36 Global Residency](https://luma.com/g3oz48ck) | Structured August-September 2027 dates conflict with "Dates: Coming Soon." |
| [ShanHaiWoo GBA](https://luma.com/47rm8enp) | Ongoing wider October 15-November 10 program. Existing Mumbai extension covers November 1-6 only; not counted as the entire program. |
| [Hacktoberfest Mumbai x FAIR](https://luma.com/rtta1cub) | Ended October 11, 2026. |
| [AI x Filmmaking screening](https://luma.com/ycicqehv) | Ended November 2, 2025. |
| [AI x Filmmaking Artist Edition](https://luma.com/mumb.ai) | Ended November 2, 2025. |

There are eight date/clock holds, three ended entries, and one each for insufficient program, accommodation-only, private visibility, unverified Web3 relevance and partial-program coverage. None of the current fetched Luma metadata marked an event cancelled.

The IBW conference Luma row is covered by `/ibw`: its primary copy directly links the official conference site and confirms Hashed Emergent, Fairmont Mumbai and November 1-2. Distinct hubs and side events retain their own IDs; the parent conference alone was not used to cover them. Monad Blitz's renamed Luma URL matches the existing verified event ID. ETHGlobal Mumbai's three day rows match the existing November 5-7 identity and prior primary receipts; its fresh page also returned HTTP 500, so fresh primary availability is a stated limitation.

## Discovery and preservation

- Added `devcon8` to the scheduled collector's static `LUMA_COMMUNITIES` list in `scripts/fetch-web3-events.mjs`. It resolves the actual calendar page and uses the existing paginated public GET collector. Logs now state page and entry counts after exhaustion.
- `scripts/lib/luma-calendar.mjs` keeps `future` as its default, supports an explicit `past` audit, returns cursor/entry receipts, and requires an explicit boolean `has_more`. HTTP failures, repeated cursors and page-limit exhaustion fail rather than certify a partial fetch.
- All 206 surviving baseline runtime records compare exactly. All 54 protected IBW rows retain their description digests; reviewed description/fact override files are unchanged. `/free-society-hackathon` remains intact.
- Event-only precompute produced **220 active events: 207 + 14 - 1 naturally ended event**. `/extraordinary-founders-dinner` ended October 16 at 04:00 UTC and left the active runtime normally.
- Normal 30-day retention removed `india-luma-qtv4687s` and the Tatra Banka banking-breakfast source record, both ended September 16. It updated their tombstones, removed their stale verification entries and pruned the unused Tatra Banka event cover and its optimization metadata. Expired records were not restored.
- Social/RSS parallel work, jobs, news, pause controls, shared build configuration and the old read-only worktree were not edited. No commit, push, workflow rerun or deployment was performed.

## Validation

- Event-only precompute and its detail-formatting gate passed.
- `scripts/lib/luma-calendar.test.mjs`: three tests passed, including external entries, repeated cursors, page-limit failure, explicit terminal `has_more` and past-view requests.
- `scripts/test-devcon8-coverage.ts`: passed all 83 decisions, 77 identities, 14 new runtime identities, slug/alias ownership, source hashes, hidden-venue privacy, exact baseline preservation and retention checks.
- Existing event-description tests passed for 1,364 stored Luma descriptions; event schema, public-data tests for 220 events, event formatting and content-index consistency passed.
- The source and public runtime JSON copies are identical. Actual check timestamps and the two retention removals are recorded in `.cache/devcon8-audit/validation.json`.
- A scoped TypeScript check did not finish within the attempted time limits. It is not reported as passing. The new audit/import scripts and regression checks executed successfully with `tsx`.
- Copy review passed: each new description is backed by the recorded organizer text or explicitly identified calendar metadata; no invented agenda, promotional padding, empty headings or forbidden punctuation was added.
- The normal production build, generated route/preview/sitemap assets, browser checks and deployment remain part of main's release work. Chrome DevTools was unavailable because Google Chrome is not installed at its configured path.

Reproduction uses `scripts/audit-devcon8-coverage.ts --primary` for public capture, `scripts/finalize-devcon8-coverage.ts --apply` for the reviewed additions, event-only precompute, then `scripts/finalize-devcon8-coverage.ts --check-runtime` and `scripts/test-devcon8-coverage.ts`. Existing capture files are reused deliberately; a new dated audit needs a fresh cache. The reviewed additions manifest is [`devcon8-reviewed-additions.json`](devcon8-reviewed-additions.json).
