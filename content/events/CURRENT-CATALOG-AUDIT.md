# Current event catalog audit, 12 October 2026

Reviewed the 229 published records present at the start of this audit. The resulting catalog has 227 events: Ready for the Run Jaipur ended on October 10, and the two Cosmoverse/Hong Kong Digital Asset Summit records describe the same event. No events were added. A stale Global Blockchain Show feed duplicate is also explicitly merged so correcting the main event's dates cannot publish a second listing.

## Changes

- 151 surviving events have new readable canonical slugs. A further old URL now resolves to the merged Cosmoverse event. All 152 URL corrections are listed in `slug-migrations.json`; historical aliases remain owned by their event identities.
- 135 surviving events have changed published descriptions. Copy includes verified program, audience, registration and access details where available. Scraped navigation, empty sponsor headings, old-edition speaker claims and malformed promotion links were removed from the affected descriptions. Short organizer announcements remain short.
- 74 surviving events have corrected title, date, price, approval, privacy or postponement fields.
- ETHwali moves from `/0ej7kbb0` to `/ethwali`. Its description identifies Secret Society, November 8 from 18:00 to 23:30 IST, the Diwali/community format, free registration, host approval and the private venue.
- Date corrections include Global Blockchain Show (December 10–11), Africa Prediction Markets Summit (June 3–4, 2027), PlanX (November 25–26), HackMeridian (October 25–26), and the December Bitcoin Hong Kong meetup (December 17).
- Bitcoin Korea's two venues are distinguished. Web3 Digest Coffee Chat is marked postponed. Approval requirements and hidden addresses are preserved across source refreshes.

## Sources requiring follow-up

- AIBC Europe: primary page returned HTTP 403. The revised copy explicitly distinguishes the stored listing from a fresh verification.
- ETHGlobal Mumbai and Pragma Mumbai: primary pages returned HTTP 500. Previously reviewed descriptions remain; no new program details were invented.
- Wealth Tech Executive Forum Geneva: organizer prose says August 27, 2026, while structured scheduling data lists 2027. The description flags the conflict and asks attendees to confirm with the host.
- Africa Prediction Markets Summit: the new date banner says June 3–4, 2027, but the agenda and FAQ still describe a one-day format. The published description distinguishes the new dates from the unconfirmed daily timetable.
- Eight India Blockchain & AI Tour city ticket links return tour-wide content. Descriptions no longer present the generic page as a verified city-specific agenda or venue announcement.
- Nine initially short records had no substantive additional program to recover from the checked source. Their per-record outcomes are in `current-catalog-audit.json`.

Luma initially rate-limited requests. A later sequential pass recovered the affected pages without an access workaround. HTML snapshots and rendered-page transcripts retain their real retrieval times and hashes. Raw evidence is in `.cache/current-event-audit/`; the committed review artifacts contain source URLs, retrieval times and digests rather than copies of full pages.

## Storage and refresh precedence

`catalog-copy-revisions.json` is the editorial input. `catalog-fact-revisions.json` records explicit primary-page fact corrections and matching evidence strings. `audit-current-event-catalog.ts --compile` combines those inputs with checked snapshots into `catalog-reviewed-descriptions.json`, `catalog-reviewed-facts.json` and the per-record audit. `--publication` records the actual before/after publication counts.

`src/lib/event-catalog-review.ts` applies the reviewed records to every source feed in `EVENT_SOURCES`. These reviews take precedence over older feed copies and the earlier `mumbai-reviewed-facts.json` plan. The Mumbai audit writer also applies the same reviews, so rerunning it cannot restore the short descriptions. Update the reviewed record when accepting a later organizer correction. Compilation retains corrections for inactive identities until normal retention removes them; rebuilding an active-only snapshot must not resurrect an ended event from an older feed date.

`identity-merges.json` records duplicate identities. Slug assignment preserves prior canonical URLs as aliases, reserves those aliases against reuse, and checks root-content collisions. New events use readable names, with city/date disambiguation when needed. Next.js redirects aliases before page rendering, preserving query parameters. The 30-day source retention and twelve-month tombstone policy remain in force.

## Verification

- Full Node 24 prebuild gates and production build passed, including catalog integrity, root collisions, sitemap coverage, event-map cities, source-backed event pages, social preview assets and standalone asset checks.
- Event identity, Mumbai audit, descriptions, current-record provenance hashes, external URLs, formatting, schema, public-data and retention tests passed.
- HTTP regression checks cover every surviving alias, all migration destinations, query preservation and social suffixes. Browser checks cover ETHwali and representative long, approval-gated and official-source pages on desktop/mobile and in light/dark mode.
- The unscoped historical provenance test still detects a pre-existing hash mismatch on expired `premier-token2049-singapore-2026`. Its source file is unchanged. All current-record provenance checks pass.

The full prebuild regenerated runtime catalogs, routing indexes, sitemaps, preview shells, responsive assets and image-optimization bookkeeping. It also optimized existing event covers through the repository's standard build step. No commit, push or deployment was performed.

## Copy and browser delivery checks

- Evidence PASS: authored revisions have matching description digests and identify the actual primary capture or explicitly retained older source. Unavailable pages and conflicting schedules are reported above.
- Content PASS: revised descriptions use event-specific facts, keep announced plans distinct from confirmed details, and do not invent programs to satisfy a length threshold.
- Verification PASS: the production build and current-catalog checks passed. Five representative pages passed browser checks at 1280px and 390px in both themes, including headings, structured data, keyboard focus and absence of JavaScript page errors.

## Integration verification, 13 October 2026

Integrated the reviewed inputs onto main at `409510566`, preserving subsequent source refreshes, event identities, the `/uk` historical alias and the deployed job-age/cache policy. Generated assets came from these integrated inputs rather than the older audit worktree.

The current catalog contains 225 events. Crypto World's Fair Hackathon ended at 19:00 UTC on October 12 and Company Brain Hackathon ended at 00:00 UTC on October 13. Their migration history remains reserved, and neither event is restored to the upcoming catalog. The migration tests now require source-backed end dates for absent destinations and check that their former and new paths return 404 or 410.

PASS: all 152 migration records retain identity; HTTP checks cover 189 active aliases, 150 active migration destinations, both ended migrations and social/query preservation. Current source hashes, Mumbai audit, event descriptions, retention, schema, public data and external-URL tests pass. Production browser checks pass for five representative event pages in both themes at desktop/mobile widths. Full fast prebuild, production build and postbuild pass alongside the 30-day job tests and production expiry-window fixture.
