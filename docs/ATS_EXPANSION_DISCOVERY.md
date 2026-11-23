# ATS employer discovery (Nov 2026)

## Current ingestion surface

| Path | Role |
| --- | --- |
| `scripts/refresh-jobs-cache.ts` | Daily Greenhouse, Lever, Ashby, Workable, Breezy, BambooHR, etc. |
| `scripts/ingest-web3-expansion.ts` | Ownership-verified rows in `content/web3-expansion-sources.json` |
| `content/country-local-crypto-sources.json` | Regional recurring boards |
| `.github/workflows/refresh-jobs-ingest.yml` | Extra Ashby one-shots (Wormhole, …); Mantle/Paradigm now in `refresh-jobs-cache.ts` |

Inventory: `npx tsx -e "import { atsSourceInventory } from './scripts/lib/ats-source-inventory'; console.log(atsSourceInventory().length)"` (~389 board identities).

## Discovery commands

```sh
# Portfolio JSON → unconfigured ATS links (slow; checks GH/Lever/Ashby APIs)
npx tsx scripts/discover-unconfigured-ats.ts

# Curated slug probe + employer metadata
npx tsx scripts/probe-web3-ats-candidates.ts
npx tsx scripts/probe-web3-ats-discovery.ts

# Ownership audit (sample)
npx tsx scripts/audit-ats-employers.ts --quiet
```

Outputs land in `.cache/discovered-unconfigured-ats.json`, `.cache/web3-ats-candidate-hits.json`, `.cache/web3-ats-discovery-report.json`.

## Adding a employer safely

1. **Prove ownership** — official site must link to the same board slug (or pinned Ashby `organizationId` in `content/ashby-employer-identities.json`). Never ingest from slug guessing alone; see `content/rejected-ats-boards.json`.
2. **Ashby** — add identity JSON entry, then `{ board, company }` in `ASHBY_BOARDS` inside `refresh-jobs-cache.ts`.
3. **Greenhouse / Lever / Breezy / …** — add to the matching `*_BOARDS` array in `refresh-jobs-cache.ts`.
4. **High-friction sources** — register in `content/web3-expansion-sources.json` and keep `ingest-web3-expansion.ts` in the daily workflow.
5. **Gate** — `npx tsx scripts/test-ats-source-ownership.ts` before merge.

## Nov 2026 pass (this change)

Merged **22 recurring expansion sources** that were only ingested via `ingest-web3-expansion.ts` into `refresh-jobs-cache.ts` so they run with the main ATS refresh (Ashby boards use existing reviewed identities). Those rows are now `status: ingested-via-refresh-jobs-cache` in `web3-expansion-sources.json` to avoid double ingestion.

Also added **Nous Research** (Ashby `nousresearch`) and moved **Mantle** / **Paradigm** from workflow one-shots into the main Ashby list.

## Dec 2026 batch (+50 employers)

Script `scripts/discover-batch-web3-boards.ts` mined corpora for unconfigured boards; `scripts/bootstrap-ashby-identities-batch.ts` pins Ashby org IDs. **50** recurring feeds added to `refresh-jobs-cache.ts` (12 Greenhouse, 5 Lever, 28 Ashby, 5 Breezy). Discovery artifact: `.cache/batch-web3-board-discovery.json`.

## Backlog (needs manual verification before ingest)

- **Jump Trading** (`greenhouse/jumptrading`, ~86 roles) — distinct from `jumpcrypto`; confirm scope vs Jump Crypto roles.
- **Hiring-links CSV** — `content/sources/hiring-links-636-coverage.json` still has ~116 `ownership-unverified` and ~180 `official-link-vacancies-unverified` rows.
- **False-positive slugs** — `ashby/circle` → circle.so (community SaaS), `ashby/artemis` → Artemis Security (not Artemis analytics); remain in `RETIRED_BAD_BOARD_KEYS`.

Do not add boards listed in `content/rejected-ats-boards.json` or `RETIRED_BAD_BOARD_KEYS` in `refresh-jobs-cache.ts` without clearing the rejection with fresh evidence.