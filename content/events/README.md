# Event content

Start with [INDEX.md](INDEX.md) to find an event by name, date, or source feed. Each entry links to its formatted copy in [descriptions.md](descriptions.md).

## Files

| Location | Purpose | Edit directly? |
| --- | --- | --- |
| `sources/curated-events.json` | Curated events, including Luma imports | Yes |
| `sources/kbw-luma-events.json` | Korea Blockchain Week side events | Yes |
| `sources/ibw-side-events.json` | India Blockchain Week / Devcon side events | Yes |
| `sources/india-luma-events.json` | India Luma events | Yes |
| `sources/luma-crypto-events.json` | Luma crypto calendar imports | Yes |
| `sources/events-cache.json` | Aggregated event feed, including Luma host imports | Yes |
| `editorial/generated-event-guides.json` | Archived generated guides; never used by event pages | Archive only |
| `INDEX.md`, `descriptions.md` | Generated browsing views of every stored description | No |
| `verification-report.json` | Field-by-field comparison from the latest verification pass | No |
| `SCHEMA.md`, `schema-report.json` | Google Event eligibility audit of current detail pages | No |
| `content-origin-report.json` | Every current page's source-backed or unavailable status | No |
| `official-description-report.json` | Official-source fetch outcomes and verified field corrections | No |

Each source record keeps its original `id`, URL, metadata, and `description` together. Overlapping feeds are retained so that a duplicate listing cannot silently discard fetched text. The index includes past events that still exist in the source files. It does not recover records previously removed by ingestion.

Event pages publish descriptions only when a successful source fetch is recorded in `sourceVerification` or `descriptionSource`. The browsing view applies the same publication cleanup and section formatter. Unverified historical copy remains in the source JSON for review and is not published as an event description.

Missing descriptions render an explicit unavailable state and an organizer link where one exists. The renderer never adds guessed agendas, travel advice, attendance numbers, ticket prices, or generic paragraphs to make a page longer. TOKEN2049 follows this same policy.

## Updating content

1. Find the event in `INDEX.md` and follow its source-file link.
2. Update that record's `description`, or run `npm run enrich:luma-descriptions` to fetch missing/stub descriptions from Luma.
3. Run `npm run precompute:events-runtime` to regenerate the description index and the runtime event data.
4. Run `npx tsx scripts/generate-slug-types.ts` when events are added or removed, so the page router recognizes the updated listing.
5. Run `npm run check:event-content` and `npm run test:event-descriptions`.

`npm run organize:events` only refreshes the browsing views. It makes no network requests. Builds also refresh these views through the event-runtime precompute step. Commit the updated source records and browsing views together.

## Verifying against Luma

The direct-URL Apify actor is [`solidcode/luma-scraper`](https://apify.com/solidcode/luma-scraper). It fetches full event details for the URLs already stored in the feeds. Only results matching those URLs are imported. It does not add unrelated search results.

Set `APIFY_TOKEN` in your shell environment, then run:

```sh
npm run refresh:luma-apify -- --start
npm run refresh:luma-apify -- --collect=RUN_ID
npm run verify:luma-events -- --apify-run=RUN_ID
npm run verify:luma-events -- --fetch-rich
npm run verify:luma-events -- --apply
npm run precompute:events-runtime
npx tsx scripts/generate-slug-types.ts
npm run audit:event-schema
```

The first command starts a paid Apify run and prints its ID. Collect after it finishes; `--partial` can download completed results from an active run. Use `--limit=3` with `--start` for a small trial.

`--fetch-rich` fetches Luma's public event payload by the verified event ID. This retains ProseMirror headings, list markers, and link destinations that the actor's plain-text description may omit. It reuses cached records and stops on rate limiting. `--fetch` is an optional direct-page fallback for URLs not returned by Apify.

Without `--apply`, verification writes a comparison report only. Applying updates source-stated fields, clears stale public addresses when Luma withholds them, and preserves published slugs. The report distinguishes verified records from unavailable records and records each changed field. Long before/after descriptions have character counts, previews, and SHA-256 hashes in the report.

Complete actor results, rich-text payloads, source-file backups, and fetch failures are stored together in the git-ignored `.cache/event-verification/` directory. Source records carry `sourceVerification` with the Luma event ID, URL, method, timestamp, and Apify run ID when available. API credentials are read from the environment and are not stored in these records.

## Other official event websites

```sh
npm run refresh:official-event-descriptions -- --fetch --discover
npm run refresh:official-event-descriptions -- --apply
npm run precompute:events-runtime
npx tsx scripts/generate-slug-types.ts
npm run audit:event-content
npm run audit:event-schema
npm run test:official-event-descriptions
npx tsx scripts/test-event-page-quality.ts
```

The fetcher checks event identity and edition before accepting Event JSON-LD, organizer sections, or an official meta description. It follows matching event links from official sites, rejects unrelated company homepages, and records fetch failures. `--fetch --refresh` bypasses the 24-hour snapshot cache. `--apply` is the only mode that updates source records. Official structured event dates and addresses take precedence over stale listing values; separately listed sessions keep their own dates.

`descriptionSource` records the exact source URL, fetch timestamp, extraction method, page title, and original-text SHA-256. Descriptions can be short when the organizer supplies only a brief summary. No minimum-length padding is allowed. The page's source link and checked date make that provenance visible.

## How pages use this content

- `src/lib/event-sources.ts` registers the six source feeds in listing-precedence order.
- `src/lib/events-listing-build.ts` normalizes and deduplicates listings, then filters ended events.
- `content/events-runtime.json` and `public/data/events-runtime.json` are generated delivery files. Edit the source records instead.
- `src/lib/event-guide-store.ts` and the compatibility `getEventEditorialGuide` export both use `src/lib/event-content.ts`. Source-backed descriptions are the only body content they can return.
- `src/lib/luma-event-content.ts` arranges organizer copy into sections. It recognizes explicit Markdown headings and common event labels, while keeping agenda labels such as `Speaker:` inside their section.
- `src/components/event-guide-content.tsx` renders paragraphs, bullet lists, numbered lists, quotes, and external links.
- `src/lib/event-schema.ts` emits Google Event JSON-LD for eligible physical, publicly bookable events with a detailed address. It omits unsupported virtual-only or restricted events and never invents prices, currencies, availability, or status. Source timezones also drive displayed event dates.
- Historical handwritten guides remain in `src/lib/event-guides.ts` as an unused reference; image overrides remain in `content/event-image-overrides.json`.

The page presentation follows the existing Hashtagweb3 event typography and colors. Section spacing separates topics; list markers distinguish steps from prose. The content remains static for reading (energy 1, rhythm 1, motion 1).
