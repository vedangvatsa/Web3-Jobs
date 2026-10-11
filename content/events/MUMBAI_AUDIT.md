# Mumbai event source audit

The audit uses public source snapshots fetched on October 11, 2026 (UTC). Exact fetch timestamps, calendar entry IDs, primary-page dates and timezones, source-to-catalog mappings and row-level spreadsheet decisions are in [mumbai-audit-report.json](mumbai-audit-report.json). Reviewed descriptions are in [mumbai-reviewed-facts.json](mumbai-reviewed-facts.json).

## Coverage

| Source | Inspected | Published after reconciliation | Excluded |
| --- | --- | --- | --- |
| [Devcon calendar](https://luma.com/devcon) | 19 future entries, 1 page | 17 canonical events | 2 date conflicts |
| [IBW calendar](https://luma.com/ibw) | 57 future entries, 2 pages; 46 Luma and 11 external entries | 52 canonical events | 3 date conflicts and 2 inaccessible short links |
| [Team1 Mumbai](https://luma.com/team1mumbai) | 1 event, not a calendar | 1, also counted in IBW | 0 |
| [IBW spreadsheet](https://docs.google.com/spreadsheets/d/1NZ09OVlqElsM64oUm-8i1yh_A-U0p39BJECthwHCsLA/view) | All 43 populated event rows, including November 7 and 8 | 31 distinct events across the rows | Multichain Day, Crypto Mondays and CT G.A.Y Party |

Both calendar requests exhausted `has_more` pagination through `fetchLumaCalendarEntries`. All 19 Devcon entries also occur in IBW. All 46 distinct Luma events were fetched from their individual primary pages. The sheet has 31 distinct raw linked URLs and four rows without usable links. Repeated days are mapped by event identity, not imported as separate events.

The combined sources account for 54 published canonical events: 52 from IBW's calendar plus the two organizer-sheet-only parties. The sheet's other published events and Team1 are already in the calendar count. These counts are not additive across sources.

Past calendar entries are outside this future-event audit and were not enumerated. No maximum November date was imposed on calendar traversal. Private or unlisted events not exposed by these public sources cannot be counted. Approval-only events with public pages are included, with their admission restrictions retained.

## Catalog changes

The runtime catalog increased from 208 to 231 events: 27 verified additions, two duplicate day listings consolidated, and two previously published events held for review. Two further new source records, A36 and Crypto Mondays, are retained with `publicationStatus: needs-review` and are not published.

All surviving baseline canonical IDs, slugs and runtime external URLs are unchanged. DeFi Security Summit retains `ibw-official-defi-security-summit-day-1-11-01` and `/dssd1`; `/dssd2` resolves to it. Unchained Summit retains `premier-unchained-summit-india-2026` and `/unchained-summit`; `/usd2` resolves to it. The retired identities remain in slug history with an explicit `canonicalId` relationship. Other retired slugs cannot be reassigned through this mechanism.

New public routes:

```text
/ifaf          /3doehm1b      /83ujl6ms      /li3sv90r
/jb4zsel1      /team1mumbai   /mc8pq06y      /h0x443s9
/nyw6qigp      /2kj0jqf9      /uqmzpq5k      /sgrf4yq5
/ib9j3xxe      /ethindia      /qk93a446      /6gnkjcqx
/hr8w0hmd      /ai6owvhz      /xuofsg0p      /qzzu690f
/islzi7v3      /kz3klqjq      /ub56pe38      /5u1evsou
/tswdcctj      /v0fimew1      /0ej7kbb0
```

The machine-readable report supplies names, IDs, source URLs, before/after dates and provenance for each route.

## Resolved discrepancies

| Event | Primary-source result |
| --- | --- |
| MIP-20 | October 30, 15:00-18:00 Asia/Kolkata; sheet says October 24. `/mip-20` retained. |
| Onchain Legal Summit | November 4, 11:00-17:00 Asia/Kolkata; sheet has conflicting November 2 and 4 rows. Both refer to `/cw0h549b`. |
| Afterhours Mixer | November 1, 17:00-21:00 Asia/Kolkata. Organizer explicitly renamed and rescheduled Ravecon; `/rbe` retained. |
| Devcon | November 3-6, replacing the catalog's November 7 end date. Date-only because clock times were not verified. |
| Pragma Mumbai | November 6 according to its primary page, replacing November 4 in the calendar/catalog and November 5 in the sheet. Date-only; `/pragma-mumbai` retained. |
| ETHGlobal Mumbai | November 5-7; sheet says November 6-8. Sheet Day 1 links to MONEY MAKER, so all ETHGlobal rows map to `/ethglobal1` by identity instead. |
| MONEY MAKER | November 6, 13:00 to November 7, 01:00 Asia/Kolkata. Existing `/np3wx7v5` retained. |
| DeFi Security Summit | November 1-2, 10:00-18:00 IST each day. One event; the separately registered November 3 Devcon program is not included. |
| Unchained Summit | November 5-6 at Courtyard by Marriott Mumbai International Airport. Removed unsupported clock times and consolidated day rows. |
| EIP Hub | November 3, 21:00 to November 6, 18:00 Asia/Kolkata, following primary structured dates. The span is not a daily session timetable. |
| Ready for the Run | November 3, 12:00-15:00 Asia/Kolkata; sheet says November 7. Existing `/rrm` already had the correct dates. |
| IBW Institutional Forum | November 1-2 at Fairmont Mumbai; one event despite the sheet's November 2 row. |
| Mumbai Node | October 31, 12:00-18:00 +05:30 on the primary KonfHub ticket page, replacing 10:00-17:00. Venue remains TBD. Existing ID and URLs retained. |
| Builders Brunch | Matched the sheet's linkless row to `5u1evsou` in IBW's calendar and verified its primary page. |

ETHGlobal's direct pages returned HTTP 500, but readable renderings of those same primary URLs exposed the event content. `descriptionSource.evidence.retrievedVia` records the reader URL. No clock times were inferred from an agenda whose timezone was absent.

## Conflicts, exclusions and TBD records

- **A36 (`g3oz48ck`)**: structured dates are October 18 to November 2; description says "Date: TBA." Kept as a source record pending clarification; excluded from the dated catalog.
- **Crypto Mondays (`9bhu9f28`)**: structured times are 14:00-17:30 UTC with timezone `Asia/Dubai`, equivalent to 19:30-23:00 IST. Mumbai agenda and sheet say 18:00-21:30. Excluded pending clarification rather than silently changing the timezone.
- **CT G.A.Y Party (`ena53peq`)**: structured dates say November 5 at 19:30 to November 6 at 01:00 IST; description says December 6, 16:00-19:00. Existing source identity retained, excluded from the dated catalog.
- **Multichain Day**: primary page returns HTTP 404. Existing source identity retained for review; not labeled canceled.
- **Pending candidates `u1m2yuic` and `188n1ye7`**: both return HTTP 404 and are absent from the fetched calendars. Not added.
- **Arbitrum Summit (`t.ly/sEaNC`) and Ethereum Forward Defence Summit (`t.ly/gIAzG`)**: HTTP 403 security challenges prevent resolving primary destinations. Reader attempts also returned the challenges. Calendar-only times are insufficient for integration; both are explicitly excluded.
- **Sidequest: Explore Mumbai**: primary structured span is November 4 at 04:30 through November 7 at 08:30 IST, while prose refers generally to walks during Devcon week and afternoons. The source span is retained and this discrepancy is recorded; no daily sessions are invented.
- **IBW Pre-Conference VIP Night and Official After-Party**: organizer spreadsheet confirms dates and times, but registration links remain TBD. Existing records remain, with spreadsheet provenance and concise descriptions stating that limitation. No venue or precise address is inferred.
- **Location privacy**: hidden-address events have no venue, street address, postal code, neighborhood or coordinates in the updated records. Alpend's prose promises the exact venue only to confirmed guests, so its record is hidden even though the API's visibility field says public.

## Regeneration and verification

```sh
npx tsx scripts/audit-mumbai-events.ts --fetch
npx tsx scripts/audit-mumbai-events.ts --apply
npm run precompute:events-runtime
npx tsx scripts/generate-slug-types.ts
npx tsx scripts/audit-mumbai-events.ts --report
npx tsx scripts/test-mumbai-event-audit.ts
npm run check:event-content
npm run test:event-descriptions
npm run test:event-public-data
npm run test:event-schema
npm run test:event-external-url
npx tsx scripts/test-event-page-quality.ts
npm run audit:event-schema
npm run audit:event-content
npx tsc --noEmit --incremental false
git diff --check
```

The audit caches its snapshot set under `.cache/mumbai-event-audit/`; reruns reuse that set rather than mixing source versions. New calendar identities require a reviewed plan entry. Do not run `import-official-side-events.ts` to reproduce this audit: its date guessing, November 7 cutoff and per-day imports do not implement these decisions.

Event-specific checks pass, including one canonical result for each of the 52 verified calendar events, excluded records, exact source times/timezones, private-address removal, duplicate aliases and runtime/public-copy equality. Content audit reports 231 source-backed pages, no unavailable descriptions and no generated/template descriptions.

Independent release review restored EIP Hub's Devcon-ticket admission requirement. It also resolved the baseline `/fcm` reservation conflict: raw event titles no longer invent reservations; explicit slugs and aliases, including every published event history entry, remain reserved. Coinbase job `8154342` retains `/fcm`, and `test-published-event-slugs.ts` passes without changing job records.

Live cold-request verification found duplicate `Location` headers on page-rendered redirects for `/dssd2` and `/usd2`. Both reviewed merges now have permanent redirects in `next.config.mjs`, resolving before ISR page rendering.
