# ATS employer audit — 1 October 2026

The audit compared configured boards and cached application URLs with ATS organization metadata, employer-written descriptions, and official careers links. A matching company name or a working endpoint was not sufficient evidence of ownership. Unavailable endpoints and legitimate parent-company/rebrand differences were not treated as unrelated employers.

## Confirmed incorrect sources

The cleanup removed 314 cached jobs from 31 populated boards and disabled five additional incorrect boards with no current cached jobs. The machine-readable rejection list, actual employers, and evidence URLs are in `content/rejected-ats-boards.json`.

| Site employer | Incorrect source | Actual employer/product | Removed jobs |
| --- | --- | --- | ---: |
| RedStone Oracles | Ashby `warp` | Warp employee management/payroll | 21 |
| Socket | Ashby `socket` | Socket software supply-chain security | 28 |
| Parallel | Ashby `parallel` | Parallel Web Systems | 23 |
| Toku | Ashby `toku` | Latin American payment collection | 22 |
| Plume Network | Greenhouse `plume` | WiFi/smart-home software | 19 |
| Cantina | Ashby `cantina` | Social AI | 17 |
| Sphere | Ashby `sphere` | Global tax compliance | 16 |
| Vana | Lever `vana` | Guatemalan consumer lending | 15 |
| Mantra Chain | Lever `mantra` | Manga translation | 14 |
| Skip Protocol | Ashby `skip` | Powered clothing | 12 |
| Vesta | Ashby `vesta` | Mortgage origination software | 12 |
| Lens Protocol | Ashby `lens` | Traffic safety | 11 |
| Safe | Ashby `safe` | Safe Software/FME | 11 |
| Fleek | Ashby `fleek` | Secondhand fashion | 10 |
| Foundry | Greenhouse `foundry` | Enterprise IT media | 10 |
| Kiln | BambooHR `kiln` | Flex offices | 8 |
| Sui Foundation | BambooHR `sui` | Sacramento Ultrasound Institute | 8 |
| Compound | Ashby `compound` | Compound Planning | 7 |
| YEET | Ashby `yeet` | Systems observability | 7 |
| Arch Network | Ashby `arch` | Home-services revenue software | 6 |
| Swan Bitcoin | Ashby `swan` | Defense autonomy | 6 |
| Beam | Greenhouse `beam` | Bridge to Enter Advanced Mathematics | 5 |
| Delphi Digital | Ashby `delphi` | Digital minds/AI | 5 |
| Ethena Labs | Lever `ethena` | Compliance training | 5 |
| Foundation | Ashby `foundation` | Homebuilding software | 4 |
| Saga | Recruitee `saga` | Legal AI | 4 |
| Particle Network | BambooHR `particle` | Men's grooming | 3 |
| Espresso Systems | Ashby `espresso` | SQL compute optimization | 2 |
| Chronicle Labs | Ashby `chronicle-labs` | AI agent testing | 1 |
| Gelato Network | Ashby `gelato` | Print-on-demand | 1 |
| Horizon | Lever `horizon` | Horizon Robotics | 1 |
| Render Network | Ashby `render` | Cloud hosting | 0 |
| Union | Ashby `union` | Union.ai | 0 |
| ApeX Protocol | Greenhouse `apex` | Apex Eye | 0 |
| Paradigm | Greenhouse `paradigm` | Talent/culture consulting | 0 |
| Sei | Greenhouse `sei` | Sustainability education | 0 |

[RedStone's official careers page](https://redstone.finance/careers/) listed zero openings during verification. Its spontaneous-application contact is not a job posting.

## Verified replacements and metadata

- [Toku](https://www.toku.com/) links to Lever `toku`: two actual roles imported.
- [Sphere](https://spherepay.co/) links to Lever `sphere-laboratories`: one actual role imported.
- [Saga](https://saga.xyz/) links to Lever `saga-xyz`: three actual roles imported.
- [Ethena](https://ethena.fi/) links to [its Teamtailor careers site](https://careers.ethena.fi/): eight actual roles imported; the general application was excluded.
- Sui's genuine Ashby board and Plume's genuine Rippling board remain available. Their unrelated BambooHR/Greenhouse namesakes were removed independently.
- Ramp's jobs belong to [ramp.com](https://ramp.com/about-us), not Ramp Network. Corrected its website, social links, and mixed description while retaining its 156 jobs.
- Rain's jobs belong to [rain.xyz](https://www.rain.xyz/careers), the stablecoin payments company. Corrected the rain.fi website, unrelated exchange description, and logo while retaining its 42 jobs.
- Corrected Biti, Brale, Douro Labs, Molecule, and Stronghold website domains using employer-owned sources. Aligned Foundation's profile and website with its existing NFT-marketplace identity.

After these changes the catalog has 6,191 jobs across 299 hiring companies. Counts are a snapshot, not fixed expected totals for future ingestion.

## Recurrence prevention

The old retired-source check ran while loading the previous cache. Incorrect entries still present in the board arrays were then fetched and inserted again. Rejection now applies to source registration, incoming jobs, persisted catalogs, and archived lookup. Both ingestion entry points and standalone importers use the shared policy.

Ashby imports additionally check the company-to-board association and the live, stable organization ID against `content/ashby-employer-identities.json`. New associations require source verification before adding an identity. A missing or changed identity cannot publish fresh rows; transient failures preserve previously accepted records. Entries without an obtainable organization ID remain unavailable for fresh ingestion.

The cleanup marks 1,060 historical alias records as withdrawn, removes their available descriptions and incorrect job images, and writes neutral share previews. Alias keys remain reserved. Where a false listing had occupied an older legitimate job's URL, its pre-existing archive identity is preserved and its preview is refreshed. Archive resolution no longer uses a shared numeric ATS ID or a same-title posting when its actual source URL differs.

`scripts/test-ats-source-ownership.ts` runs in both full and fast build gates. Daily ingestion also cleans the source cache and checks its configured mappings. Tests cover incoming/cache/archive bypasses, stable organization-ID mismatch, legitimate same-brand boards, metadata, descriptions, public catalogs, and retired previews.

Fast prebuild now honors changed input hashes, including employer policy and company metadata, rather than accepting stale outputs merely because files exist. The larger set of corrected historical previews also exposed excessive per-route asset tracing: preview/OG directories are now copied once by the existing standalone asset copier instead of enumerated in every route trace. Standalone asset verification remains mandatory.

## Recheck commands

```sh
npx tsx scripts/audit-ats-employers.ts --quiet
npx tsx scripts/audit-ats-evidence.ts --only=ashby --cached-descriptions --excerpt=500
npx tsx scripts/test-ats-source-ownership.ts
```

The audit reports unresolved sources separately. HTTP failures, a disabled hosted board, custom career portals, and name/domain differences requiring manual review do not establish a company mismatch. `--resume` reuses observations and is for analysis within the same audit, not a substitute for a fresh scheduled audit.
