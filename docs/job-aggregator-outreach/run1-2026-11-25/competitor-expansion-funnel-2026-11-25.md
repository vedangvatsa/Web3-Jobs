# Competitor employer expansion funnel (2026-11-25)

Why **7,538** competitor “gaps” is not **7,538 ATS feeds**, what the full priority probe found, and how to expand ingestion **drastically but sanely**.

## Executive summary

| Metric | Value |
| --- | ---: |
| Unique competitor employer slugs (deduped) | 7,791 |
| Listed on Hashtag Web3 today (profile / slug / jobs) | 253 |
| Raw “gap” count | **7,538** |
| **High-signal gaps** (CCJ and/or Remote3, or multi-source) | **1,745** |
| Priority gaps probed (GH / Lever / Ashby slug API) | 1,745 |
| Gaps with **any** live probed ATS board | **175** (~10% of priority) |
| **Net-new** boards vs current refresh config (~533 boards) | **~170** |
| Realistic expansion target (ownership-reviewed) | **+150–300 boards** over quarters |
| Literal ingest of 7,538 | **Not feasible** (most have no public ATS; many are SEO/noise) |

**Outputs from this run**

| File | Purpose |
| --- | --- |
| `competitor-employer-gaps-2026-11-25.json` | Full gap report (`probeLimit: 1745`, `gapWithProbedAts: 175`) |
| `competitor-gap-ats-probed-1745-2026-11-25.csv` | All 175 gap employers with ATS hit (sorted by job count) |
| `competitor-gap-ats-netnew-2026-11-25.json` | 170 boards not yet in `configuredAtsBoards()` |
| `competitor-ats-web3-review-2026-11-25.csv` | Deep review of original 71 shortlist (identity + web3 keywords) |
| `competitor-ats-ingest-approved-2026-11-25.csv` | Strict gate: **5** approved, **66** rejected (71 shortlist) |
| `competitor-employer-gaps-ats-probed-2026-11-25.csv` | **175** ATS hits (priority gaps, same data as probed-1745 CSV) |
| `competitor-employer-gaps-priority-2026-11-25.csv` | 1,745 priority gaps for manual employer review |

Regenerate probe:

```sh
npm run audit:competitor-employer-gaps -- --probe-limit=1745 --concurrency=10
```

---

## Why 7,538 ≠ 7,538 ingestible ATS feeds

The gap script compares **competitor directory slugs** to our employer set (`companies-runtime.json`, `jobs-runtime.json`, slug aliases). A “gap” only means **we don’t match their company page yet**. It does **not** mean:

1. **They use a public Greenhouse / Lever / Ashby API** we can add (many use Workday, custom sites, or no careers stack).
2. **They are Web3 employers** (competitors list tradfi, gaming, consulting, SEO landing pages).
3. **The probed slug is the right board** (short names collide: `amber`, `safe`, `ledger`, `sentry`, etc.).

### Funnel by source (2026-11-25)

| Stage | Count | Notes |
| --- | ---: | --- |
| cryptocurrencyjobs.co company URLs | 1,242 | Curated crypto employer set |
| remote3.co company URLs | 1,000 | Remote Web3-focused list |
| web3.career base company pages (facet URLs stripped) | 6,637 | Long tail; includes many non-ATS / low-signal names |
| **Deduped unique slugs** | 7,791 | |
| **Matched on Hashtag Web3** | 253 | Small vs competitors (256 profile slugs) |
| **Unmatched (“gap”)** | 7,538 | |
| └ CCJ +/or Remote3 (priority) | 1,745 | **Probe window for ATS discovery** |
| └ CCJ-only gap | 581 | |
| └ Remote3-only gap | 421 | |
| └ web3.career-only gap | 5,793 | Mostly **not** probed in the 1,745 batch (lower priority score) |

### ATS probe mechanics and hit rate

For each of the **top 1,745** gaps (sorted by multi-source + CCJ + Remote3), the audit:

1. Guesses board slugs (exact slug, stripped `-labs`, compressed form).
2. Calls public **Greenhouse / Lever / Ashby** list APIs.
3. Records board only if **job count &gt; 0** and slug looks plausible (reduces `find` → `find-satoshi-lab` style false positives).

**Result:** **175 / 1,745 ≈ 10%** of priority gaps expose a live GH/Lever/Ashby board via slug guessing.

- First pass (800 probes): **71** hits → **~8.9%** rate (consistent with full run).
- Full pass (1,745 probes): **175** hits, **~170 net-new** vs existing refresh config.

**Implied backlog if we only ever expand via slug probe on priority gaps:** on the order of **~150–200 boards**, not thousands. To go beyond that you need **non-ATS sources** (scrape competitor job pages, portfolio JSON, manual careers URLs) — not “add 7,538 boards.”

### What we already ingest

`configuredAtsBoards()` ≈ **533** board identities (refresh-jobs-cache, expansion JSON, ingest-all, etc.). Competitor gaps overlap that set in only **~5** probed cases (e.g. Ledger appears on a board we misclassified on Lever instead of Ashby). Most of the **170 net-new** probe hits are **additive candidates**, not duplicates — but many are **wrong-company slug collisions** (Capco, Okta, Sentry) and must be rejected after identity review.

---

## Top boards from full probe (by live job count)

**All 175 rows:** `competitor-gap-ats-probed-1745-2026-11-25.csv`

**Top 20 net-new** (not in current refresh config — **verify brand before ingest**):

| Jobs | Provider | Board | Competitor label |
| ---: | --- | --- | --- |
| 696 | greenhouse | `capco` | Capco |
| 371 | greenhouse | `okta` | Okta INC |
| 228 | greenhouse | `binance` | Binance |
| 188 | lever | `xsolla` | Xsolla |
| 80 | greenhouse | `metropolis` | Metropolis |
| 76 | greenhouse | `betsson` | Betsson Group |
| 61 | ashby | `meter` | Meter |
| 53 | greenhouse | `fetch` | Fetch AI |
| 53 | greenhouse | `monzo` | Monzo |
| 50 | ashby | `toogeza` | Toogeza |
| 46 | ashby | `apollo` | Apollo |
| 46 | ashby | `sentilink` | Sentilink |
| 44 | ashby | `fuse` | Fuse / Fuse Energy |
| 42 | greenhouse | `virtu` | Virtu Swap |
| 41 | ashby | `sentry` | Sentry |
| 37 | ashby | `onhires` | Onhires |
| 37 | ashby | `wealthsimple` | Wealthsimple |
| 35 | greenhouse | `disco` | Disco |
| 35 | lever | `zeta` | Zeta |
| 34 | greenhouse | `alloy` | Alloy |

Most of the top of this list is **not Web3-native** (consulting, fintech, monitoring, HR). They illustrate why **probe job count ≠ ingest quality**. Use `npm run audit:competitor-ats-web3-review` on batches you promote from this CSV.

**High-signal crypto names in the 175** (smaller boards, better fit — still require ownership check): Arca, Nibiru, Dapper, Nash, Amber Group, Analog (see web3 review — **Analog board is wrong company**), LayerZero (already configured), Binance (already configured, fix pipeline), XION via `greenhouse:burnt` (in full gap JSON when probed in CCJ set).

---

## Phased expansion plan

### Phase 1 — Fix misconfig (week 0)

| Issue | Action | Status (2026-11-25, local) |
| --- | --- | --- |
| **Ledger** on Lever in `refresh-jobs-cache.ts` | Move to **Ashby** `ledger` | **Done** — `ashby:ledger` + identity JSON |
| **Binance** GH `binance` | Debug visibility on site (~228 API jobs) | **Open** |
| **LayerZero** Ashby `layerzerolabs` | Confirm board still canonical | **Open** |

### Phase 2 — Net-new verified crypto employers (week 1–2)

Wired in `refresh-jobs-cache.ts` after strict review (`scripts/build-competitor-ats-ingest-approved.ts`):

| Employer | ATS | Board | Status |
| --- | --- | --- | --- |
| Arca | ashby | `arca` | **Added** |
| Nibiru | lever | `nibiru` | **Added** |
| XION (Burnt) | greenhouse | `burnt` | **Added** |
| SFOX | greenhouse | `sfox` | **Added** |

**Next:** extend strict review to **`competitor-gap-ats-probed-1745-2026-11-25.csv`** (104 boards not in the original 71 shortlist). Do not bulk-add top rows by job count (Capco, Okta, etc.).

### Phase 3 — Batch backlog (ongoing)

1. **Rank** `competitor-gap-ats-netnew-2026-11-25.json` by: multi-source CCJ+R3, then job count, then web3 review pass.
2. **Add ~10–25 boards/week** through ownership review → `refresh-jobs-cache.ts` / expansion JSON.
3. **Reject** collisions into `content/rejected-ats-boards.json`.
4. **Target:** **+150–300** reviewed boards over ~2–4 quarters (≈15–35% growth on current ~533), not 7,538.
5. **Parallel track:** create company profiles for priority gaps that already match via jobs but lack pages; widen matching aliases so “253 on us” catches employers we ingest under different names.

### Phase 4 — Beyond slug probe (if you want >300)

| Source | Role |
| --- | --- |
| CCJ / Remote3 **job** sitemaps + apply-link extraction | Finds ATS when company slug ≠ board slug |
| `discover-unconfigured-ats.ts` portfolio JSON | VC portfolio boards |
| `discover-batch-web3-boards.ts` / `probe-web3-ats-candidates.ts` | Curated slug lists |
| web3.career-only gaps (5,793) | Low priority; probe only when CCJ/R3 corroborate same slug |

---

## Commands

```sh
# Full priority ATS probe (15–40 min)
npm run audit:competitor-employer-gaps -- --probe-limit=1745 --concurrency=10

# Web3 + identity review on a CSV shortlist
npm run audit:competitor-ats-web3-review

# Config inventory
npx tsx -e "import { configuredAtsBoards } from './scripts/lib/ats-source-inventory'; console.log(configuredAtsBoards().length);"
```

---

## For parent coordinator (user messaging)

- **Drastic expansion** = treat **1,745 priority competitor employers** as the backlog, not 7,538.
- **Automatic ATS discovery** yielded **175 live boards** on full probe; **~170** are net-new vs config — but **most top-by-count rows are not Web3**.
- **Sane target:** add **150–300 ownership-verified boards** over time; run weekly batches from `competitor-gap-ats-netnew-2026-11-25.json` after web3 review.
- **Do not** bulk-ingest the 175 without review — same discipline as `rejected-ats-boards.json` and `ATS_EXPANSION_DISCOVERY.md`.