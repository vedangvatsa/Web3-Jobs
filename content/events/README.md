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
| `editorial/generated-event-guides.json` | Unpublished generated guides, subject to event retention | No |
| `retention-dates.json`, `editorial/guide-identities.json` | Date/identity links for older guides whose original source row is absent | Reviewed corrections only |
| `../event-tombstones.json` | Temporary event IDs, old root slugs and expiration instants | Generated |
| `redirects.json` | Live event alias redirects; removed with their event | Reviewed corrections only |
| `INDEX.md`, `descriptions.md` | Generated browsing views of every stored description | No |
| `verification-report.json` | Field-by-field comparison from the latest verification pass | No |
| `SCHEMA.md`, `schema-report.json` | Google Event eligibility audit of current detail pages | No |
| `content-origin-report.json` | Every current page's source-backed or unavailable status | No |
| `official-description-report.json` | Official-source fetch outcomes and verified field corrections | No |

Each source record keeps its original `id`, URL, metadata, and `description` together. Overlapping feeds are retained within the retention window so that a duplicate listing cannot silently discard fetched text. The index includes past events until cleanup removes them.

Event pages publish descriptions only when a successful source fetch is recorded in `sourceVerification` or `descriptionSource`. The browsing view applies the same publication cleanup and section formatter. Unverified historical copy remains in the source JSON for review within the retention window and is not published as an event description.

Missing descriptions render an explicit unavailable state and an organizer link where one exists. The renderer never adds guessed agendas, travel advice, attendance numbers, ticket prices, or generic paragraphs to make a page longer. TOKEN2049 follows this same policy.

## Updating content

### Retention

- Ended events leave upcoming listings and the sitemap under the existing date filter.
- Thirty elapsed days after the end, `scripts/retain-events.mjs` deletes stored source rows, description and guide copies, event-specific audit entries, unused covers and responsive variants, and generated preview shells. A date-only end includes the entire final day in the event's timezone (UTC if absent). Multi-day events use their end date.
- Invalid dates, invalid timezones, reversed date ranges and postponed events are retained for review. If feeds disagree on the same identity, every copy must qualify before source deletion. Merged IDs follow their canonical event's lifetime.
- Old canonical root URLs and aliases return HTTP 410 for twelve calendar months **from deletion**, then HTTP 404. February 29 anniversaries clamp to February 28. Middleware checks expiration on each request; daily cleanup also removes expired tombstones. Responses use `no-store` so a cached 410 cannot extend the period.
- Tombstones contain only event identity, root slugs and an expiry instant. Importers reject expired source dates even after tombstone expiry. Event/job/news URL allocation reserves active tombstones. Shared assets and URLs owned by other current content are preserved.

The existing daily event refresh cleans before discovery and again before runtime generation. Builds also clean before checking generator hashes. Event publication owns the tombstone registry and deletion paths. Git history is unchanged; local research caches are outside the tracked repository policy and are not published.

```sh
node scripts/retain-events.mjs --dry-run
npm run retain:events
npm run precompute:events-runtime
npm run precompute:og-previews
npm run test:event-retention
```

The one-time `--recover-history` option reads historical source snapshots to recover dates for orphaned guides; it does not rewrite history. Only small date/identity records for guides still within retention are saved. It is not part of the daily job. Audit counts describe their original audit run; event-level rows are pruned under this policy.

1. Find the event in `INDEX.md` and follow its source-file link.
2. Update that record's `description`, or run `npm run enrich:luma-descriptions` to fetch missing/stub descriptions from Luma.
3. Run `npm run precompute:events-runtime` to regenerate the description index and the runtime event data.
4. Run `npx tsx scripts/generate-slug-types.ts` when events are added or removed, so the page router recognizes the updated listing.
5. Run `npm run check:event-content` and `npm run test:event-descriptions`.

`npm run organize:events` only refreshes the browsing views. It makes no network requests. Builds also refresh these views through the event-runtime precompute step. Commit the updated source records and browsing views together.

## Verifying against Luma

Verification uses the public Luma event pages and event API for URLs already
stored in the feeds. It reuses local snapshots and requires no paid scraping
service or API token.

```sh
npm run verify:luma-events -- --fetch
npm run verify:luma-events -- --fetch-rich
npm run verify:luma-events -- --apply
npm run precompute:events-runtime
npx tsx scripts/generate-slug-types.ts
npm run audit:event-schema
```

`--fetch` retrieves missing page snapshots; use `--limit=3` for a small batch.
`--fetch-rich` retrieves Luma's public event payload by the verified event ID,
retaining ProseMirror headings, list markers, and link destinations. Both modes
reuse cached records and stop on rate limiting.

Without `--apply`, verification writes a comparison report only. Applying updates source-stated fields, clears stale public addresses when Luma withholds them, and preserves published slugs. The report distinguishes verified records from unavailable records and records each changed field. Long before/after descriptions have character counts, previews, and SHA-256 hashes in the report.

Page snapshots, rich-text payloads, source-file backups, and fetch failures are
stored in the git-ignored `.cache/event-verification/` directory. Source records
retain `sourceVerification` with the Luma event ID, URL, method and timestamp.
Historical records may retain an Apify method or run ID as provenance; those
fields do not invoke the retired service.

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

## Reviewed source recovery

The [Mumbai source audit](MUMBAI_AUDIT.md) covers the complete public future Devcon and IBW calendars, Team1 Mumbai and the official IBW spreadsheet. Its report records pagination, primary-page verification, row mappings, exclusions and canonical identity preservation.

`source-recovery.json` records the reviewed event-specific sources used to resolve missing descriptions. It includes explicit evidence checks, session-level context, and confirmed date/venue corrections.

```sh
npm run recover:event-sources
npm run recover:event-sources -- --apply
npm run precompute:events-runtime
npx tsx scripts/generate-slug-types.ts
npm run audit:event-content
npm run test:event-source-recovery
```

The recovery script validates every source before applying any changes. When corrected sources identify duplicate records, their previous slugs are retained as aliases of the canonical event. Postponed events show dates as pending and do not offer a calendar action using superseded dates.
