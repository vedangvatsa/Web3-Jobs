# Competitor employer gap audit (2026-11-25)

Manual review pack for employers listed on [cryptocurrencyjobs.co](https://cryptocurrencyjobs.co), [remote3.co](https://remote3.co), and [web3.career](https://web3.career) that are **not** matched on Hashtag Web3 yet.

## Regenerate

```sh
npm run audit:competitor-employer-gaps
# faster, no ATS HTTP probes:
npm run audit:competitor-employer-gaps -- --no-probe-ats
# tune probe breadth (default 400):
npm run audit:competitor-employer-gaps -- --probe-limit=1200 --concurrency=10
```

## Output files

| File | Use |
| --- | --- |
| `competitor-employer-gaps-2026-11-25.json` | Full machine-readable report (all employers + gaps). |
| `competitor-employer-gaps-priority-2026-11-25.csv` | **Start here:** CCJ and/or Remote3 gaps (~1.7k rows), sorted by ATS job count when probed. |
| `competitor-employer-gaps-ats-probed-2026-11-25.csv` | ~70 priority gaps where a Greenhouse / Lever / Ashby board returned live postings (slug heuristic). |
| `competitor-employer-gaps-2026-11-25.csv` | Full gap list including web3.career-only (~7.5k rows). |

## Snapshot (2026-11-25 run)

| Metric | Count |
| --- | ---: |
| Unique competitor employer slugs (deduped) | 7,791 |
| Matched on Hashtag Web3 (profile, slug, or live jobs) | 253 |
| Gap employers | 7,538 |
| Priority gaps (CCJ / Remote3 / multi-source) | 1,745 |
| Priority gaps with probed ATS (GH / Lever / Ashby) | 71 |

## Matching rules

- **On us** if competitor slug aligns with `content/companies-runtime.json`, `getCompanySlug()` aliases, or any `content/jobs-runtime.json` company name (normalized).
- **web3.career** sitemap noise is filtered: facet URLs (`company+remote`, `/salary`, etc.) are excluded; only base `web3-companies/{slug}` pages are kept.

## ATS columns (important)

ATS URLs are **not** scraped from competitor HTML (those sites mostly gate apply links). They come from **public API probes** using slug guesses derived from the competitor company slug (same approach as `scripts/probe-web3-ats-candidates.ts`).

- Treat every `atsIngestUrl` as **unverified** until you confirm the board belongs to that employer (see `docs/ATS_EXPANSION_DISCOVERY.md` and `content/rejected-ats-boards.json`).
- Common false positives: short/generic boards (`safe`, `ledger`, `binance`, `sentry`, …) that are a different company with the same slug.
- We already ingest some employers under a different display name; check `scripts/ingest-all.ts` and `scripts/refresh-jobs-cache.ts` before adding duplicates.

## ATS web3 review (shortlist)

After the gap audit, run:

```sh
npm run audit:competitor-ats-web3-review
```

Outputs (dated):

- `competitor-ats-web3-review-YYYY-MM-DD.json`
- `competitor-ats-web3-review-YYYY-MM-DD.csv`

Each row includes **ATS org name**, **public website** (Ashby/Greenhouse/Lever), **web3 job count** (keyword scan on titles/descriptions), and a **verdict**:

| Verdict | Meaning |
| --- | --- |
| `ingest_candidate` | Domain matches expected brand + material web3 postings |
| `web3_but_verify_identity` | Some web3 roles and/or ambiguous board ownership |
| `wrong_board` | Slug collision or careers site is the wrong company |
| `not_web3` | Board exists but roles are not web3/crypto |

## After manual approval

1. Verify ownership (careers site ↔ same board slug).
2. For Ashby, add `content/ashby-employer-identities.json` when needed.
3. Add the feed to `refresh-jobs-cache.ts` or `ingest-all.ts` — **do not** enable bulk auto-ingest from this CSV alone.