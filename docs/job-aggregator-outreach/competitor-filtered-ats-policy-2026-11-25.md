# Web3-titles-only ingest (rejected full-board pass)

Full-board ingest was **rejected** for 40 employers in the 175-probe web3 tier. This pass ingests **only postings** that pass `isWeb3Job()` in `src/lib/web3-job-classifier.ts`.

## Rules

1. **Never** title-filter boards with wrong employer / slug collision (Amber→`ambersearch.de`, Fuse→`f.energy`, GH `space`, etc.).
2. **`web3TitlesOnly: 'strict'`** on very large mixed boards (Okta) — score ≥ 6, not just ≥ 3.
3. Skip staffing-style aggregators and duplicate ATS (Wealthsimple, OnHires, Binance GH duplicate).

## Wired in `refresh-jobs-cache.ts` (Nov 2026)

| Company | ATS | Mode | Audit web3/live |
|---------|-----|------|-------------------|
| Capco | GH `capco` | normal | 47/695 |
| Okta | GH `okta` | strict | 83/371 → fewer after strict |
| Metropolis | GH `metropolis` | normal | 7/80 |
| Betsson Group | GH `betsson` | normal | 6/76 |
| project44 | GH `project44` | normal | 3/15 |
| Akuna Capital | GH `akunacapital` | normal | 2/33 |
| Sparksoft | GH `sparksoftcorporation` | normal | 2/19 |
| Future Works | GH `future` | normal | 2/8 |
| DISCO | GH `disco` | normal | 1/35 |
| IDEO CoLab | GH `ideo` | normal | 1/8 |
| Xsolla | Lever `xsolla` | normal | 15/188 |
| Meter | Ashby `meter` | normal | 6/61 |
| Toogeza | Ashby `toogeza` | normal | 4/50 |

**~180 roles** max from the reject set (before strict Okta filter); **~20 collision boards blocked entirely**.

## Product notes

- Jobs list under the **legal employer** (e.g. Capco, Okta), not a crypto-native brand page.
- Company profiles may be auto-generated on first refresh unless curated.
- Keyword scoring can still tag generic “protocol” / “wallet” noise — tighten terms in `web3-job-classifier.ts` if needed.