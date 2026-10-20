# Web3 event discovery, October 20, 2026

## Result

- 145 new event identities and 47 previously unpublished source records verified for publication.
- 390 upcoming events after regeneration. Two events from the initial 200-record runtime had ended.
- 188 of the 192 additions/recoveries have verified, self-hosted artwork, using 169 source images. Posters retain their aspect ratio. Four listings have no verified usable cover.
- 133 of the 390 events qualify for the site's conservative Google Event schema gate. Restricted, hidden-location, online-only and multi-venue listings retain ordinary pages without unsupported rich-result markup.
- All current event cities resolve on the map. Forty public geographic markers were added, with source receipts; these are city or regional markers, not private venue pins.

The import covers conferences, hackathons, technical workshops, local protocol communities and documented conference side activities. Examples include ETH Shenzhen, Zcon 7, W3Node Cape Town, Road to ETHPrague, Chainlink CCIP 2.0, India university workshops, Devcon community sessions and London Breakpoint activities.

## Research and evidence

Six research scopes covered global conferences, the Americas, Europe, Asia/Africa, India/Devcon and London/Breakpoint. Discovery included Ethereum and Solana calendars, organizer websites, official community calendars, Luma, Meetup, Eventbrite and organizer-linked ticket pages. Each accepted record has a primary-source description and fetch provenance.

The review considered 310 candidate records. Cross-scope overlaps were consolidated before import. Nine additional candidates were held during editorial review because their event-specific Web3 relevance was not established. Earlier source holds, cancelled editions, unannounced dates, private listings and conflicting schedules remain excluded.

Calendar pagination was incomplete where Luma returned HTTP 429. Challenges, private pages and organizer-hidden locations were not bypassed. This is a broad source review, not a claim to have exhausted every online calendar.

Durable receipts:

- `content/events/discovery-audit-2026-10-20.json`: additions, recoveries, holds, duplicates, primary evidence, source availability and image receipts.
- `content/events/map-city-sources-2026-10-20.json`: geographic sources and coordinates.
- `content/events/sources/verified-discovery.json`: new event identities.
- `content/events/sources/events-cache.json`: verified recoveries using their original IDs.

## Preservation and privacy

Existing canonical URLs, aliases and descriptions are preserved. The audited IBW descriptions and Free Society facts pass their regression checks.

One existing description changed for privacy: the organizer of **200ms** now withholds its venue. The page retains its identity and dates, but the old address, coordinates and address-bearing prose were removed from both source and reviewed metadata.

Plan B El Salvador and BCE#3 retain separate venues rather than an invented single location. Public approval-required events disclose their restrictions. Exact clock times are used only where verified; date-only announcements retain date precision.

## Verification

Checks ran with Node 24.21.0:

- `npx tsx scripts/test-event-discovery.ts`: all 192 imported/recovered records, evidence, dates, privacy, local covers, map coverage and prior URL/description preservation.
- `npx tsx scripts/test-current-event-catalog.ts`: 390 events and 154 migrations.
- `npx tsx scripts/test-event-page-quality.ts`: all 390 descriptions source-backed.
- `npx tsx scripts/test-event-schema.ts` and nine address-review tests.
- `npm run check:event-content` and `npm run test:event-descriptions`.
- `npm run test:prebuild-invalidation`: eight tests.
- `npm run typecheck -- --incremental false`.
- Published-event URL, root collision, sitemap and site-catalog integrity checks.
- Social-routing/preview suite: 24 tests, including the 20,340-request routing matrix. Asset check: 6,377 preview shells, zero missing images.
- `npm run test:bandwidth`: event-list payload 62,537 bytes gzipped, map parity and payload budgets passed.
- Ten representative pages checked in Chromium at 390px and 1440px in light/dark themes: HTTP status, canonical, source-backed body, artwork, schema eligibility and horizontal overflow.

The fresh checkout required normal generation of public catalogs, job shards, article data and an existing derived preview-image alias before site-wide checks could run. A new address-proof mismatch was corrected by carrying the already-verified locality/country into the event fields; all address tests then passed.

Deployment and live verification are pending.
