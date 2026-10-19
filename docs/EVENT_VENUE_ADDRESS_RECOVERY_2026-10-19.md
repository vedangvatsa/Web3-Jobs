# Event venue address recovery — October 19, 2026

## Coverage

The earlier live audit found 156 missing detailed addresses. The current source snapshot contained 155 such records after one expired record was retired. Every one of those 155 records received a research outcome.

| Research outcome | Records |
| --- | ---: |
| Verified single-venue address | 45 |
| Multiple venues / city tour | 5 |
| Hidden, private, or an existing privacy hold | 66 |
| Venue not announced or only a district/city is public | 29 |
| Unavailable source or mismatched event identity | 6 |
| Conflicting edition, date, or venue information | 4 |

Four multi-venue pages received 12 named public locations, including 11 street addresses. Plaza Gerardo Barrios is identified publicly, but its street/intersection remains unverified. The national India Blockchain & AI Tour does not have a single venue; its city stops were researched separately.

The generated catalog contains 203 active events. Missing-detailed-address exclusions fall from 155 to **107**. **54 events** now pass the Google Event gate, compared with 25 before this enrichment. Address verification alone does not remove registration, privacy, online-only, or multi-venue restrictions.

## Sources and stored evidence

- `content/events/venue-address-audit.json` records the outcome, source URLs, retrieval times, excerpts, and proposed fields for every target.
- `content/events/venue-address-reviews.json` contains the 45 verified single-venue patches and four multi-venue records consumed by the catalog builder.
- Public Luma pages were fetched anonymously. Address extraction required matching identity/date, explicit public/shown location flags, and the address appearing in the visible page text. Neighborhoods such as Bandra West, Bandra Kurla Complex, and SoHo were rejected as incomplete addresses.
- Organizer event pages established the venue; official venue or government pages supplied addresses where needed. Visitor addresses were distinguished from administrative offices, postal boxes, older-edition venues, and shuttle destinations.
- ETHGlobal's main detail pages returned 500, but their current public information pages exposed matching published Mumbai and Pragma records with explicit Jio World Convention Centre addresses. AIBC's venue was verified through current official SiGMA/AIBC World pages and Fiera Roma's visitor directions.
- No private-address APIs, map-pin inference, or invented building numbers/postcodes were used. Expiring signed asset URLs were excluded from committed evidence.

Examples include Money20/20 USA, Plan B Forum, Meridian, TokenIQ, Bitmela, Solana Breakpoint, LABITCONF, AIBC World, CryptoCon Sydney, Binance Blockchain Week, ETHConf, and both Consensus editions.

## Code and data corrections

- Added source-bound address verification for authentic unnumbered, rural, and landmark addresses. Verification must match the current venue/address fields and event edition.
- Fixed recognition of compound German/Dutch street names and other published address forms.
- Prevented the catalog formatter from collapsing verified full addresses back to a city when the city also occurs in the venue name.
- Preserved source restrictions; a newer organizer snapshot can withdraw or replace a reviewed address. Reviews cannot change approval flags, descriptions, or event dates.
- Added a visible venue/address list for multi-venue events. These retain a separate multi-venue schema exclusion rather than presenting one venue as the entire event.
- Corrected stale geography: LABITCONF to Buenos Aires, Africa Stablecoin Summit to Cape Town, Bitcoin Histórico to San Salvador, and Africa Prediction Markets Summit to Cape Town (its venue remains unannounced).
- Corrected the published date ranges for North American Blockchain Summit (November 18–19) and BlockCon Punta Cana (November 25–28) using their current organizer sources. Exact hours were not invented.
- Marked Bitcoin MENA postponed after the organizer announced a move to 2027 without precise dates; its original date fields remain for identity/history.

Protected IBW descriptions, Free Society facts/aliases, and registration restrictions remain covered by regressions.

## Remaining source limitations

The unresolved records are explicit in the audit JSON. They include organizer-hidden addresses, IBT city venues marked TBD, dead Luma pages, a ShanHaiWoo link pointing to a different program, UK Tokenisation Summit's conflicting edition pages, and conflicting/TBA venue guidance for Global Blockchain Show and Global Trading Show. These do not justify guessed venue assignments.

## Checks

```sh
npx tsx --test scripts/test-event-address-reviews.ts
npx tsx scripts/test-event-schema.ts
npx tsx scripts/test-current-event-catalog.ts
npx tsx scripts/check-event-map-cities.ts
npm run test:prebuild-invalidation
npm run typecheck -- --incremental false
```

Research inputs remain in the ignored `.cache/event-address-enrichment/` working directory. `scripts/import-event-address-reviews.ts` previews the vetted import and applies it with `--apply`; unrelated prior address reviews are preserved, and older evidence cannot overwrite newer reviews.

The historical `test-devcon8-coverage.ts` release-snapshot check was also attempted. It already fails against the pre-change revision `db387bd1485e4a9e196788ddb1d724ceaf0bb9e1`: the October 16 snapshot expects `india-luma-6sp22vxd`, which is absent from that newer baseline catalog. Its exact historical catalog hashes are not current-data expectations. The current-catalog, privacy, address, and protected-description checks pass; the historical fixture was not changed and retired events were not resurrected to satisfy it.
