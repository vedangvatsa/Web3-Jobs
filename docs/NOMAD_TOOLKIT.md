# Nomad Toolkit

Entry points: **Resources → Nomad Toolkit**, the Remote Work & Nomads section on
`/resources`, and the footer. The toolkit has one shared navigation with Cities,
Places, Compare, Living costs, Visas & entry, and a grouped More menu.

## Routes and features

| Route | Purpose |
| --- | --- |
| `/nomads` | City finder, budget/region/connectivity filters, two-city selection and tool directory |
| `/nomads/cities/[city]` | 100 city guides with budgets, monthly climate, places, community links and related Hashtag content |
| `/nomads/places` | Searchable list and optional map of 4,652 workspace/accommodation records |
| `/nomads/compare` | Two selected city details, cost breakdown, connectivity and timezone comparison |
| `/nomads/cost-of-living` | Monthly cost categories and optional remaining take-home income |
| `/nomads/rankings` | Internet benchmarks, safety and walkability reference scores |
| `/nomads/climate` | Month, temperature, humidity and rainfall filters |
| `/digital-nomad-visas` | 71 merged program references plus a 199-passport entry checker and optional map |
| `/nomads/timezones` | Up to four cities, date-specific IANA offsets and quarter-hour work-window overlap |
| `/nomads/schengen` | Inclusive unique-day counting for the rolling 90/180-day rule; optional local-device storage |
| `/nomads/runway` | Savings, reserve, income and spending assumptions across cities |
| `/nomads/taxes` | User-entered effective-rate arithmetic, alongside country reference notes |
| `/nomads/resources` | 59 services across the imported categories |
| `/nomads/report` | Printable top-50 city reference report, including browser Save as PDF |

`/nomad` remains the existing Nomad popup. `/tax` and all other published root
identities retain their owners. City guides are nested; individual directory
places do not receive thousands of new indexable routes. `/nomads` is explicitly
reserved against job slug allocation.

## Data and provenance

The one-time import reads resource literals and public JSON from
`vedangvatsa/PDFtoWebsite`. It does not run that application's code. It reads no
user profiles or credentials and imports no CV upload, authentication or jobs
infrastructure. `content/nomads/sources.json` records the source commit, import
date, reference period, counts and image URLs.

The current dataset contains 100 cities in 57 countries, 4,652 unique places,
71 program references, 199 passport files and 59 services. All existing Hashtag
visa descriptions, requirements, income fields and stay lengths are retained.
Dubai/UAE naming variants are merged rather than counted twice. Place counts
are recomputed from directory records. Missing mobility/safety values stay
missing; the source project's fallback scores are not imported.

Most city/service references are dated June 2026. Internet records keep their own
quarter and sample count. Import time is not a claim of fresh official
verification. Visa, tax and travel pages display sources and reference context.
The tax calculator uses an explicit user assumption, and savings runway does not
claim investment-based financial independence. Related jobs/popups require both
city and country evidence; upcoming events use normalized city/country matching.

Third-party terms and the Passport Index MIT copyright notice are retained in
[`public/nomad-data-notices.txt`](../public/nomad-data-notices.txt).
The hub's source panel and attribution link were removed at the project owner's
request. Ookla's upstream README identifies the public dataset license as
**CC BY-NC-SA 4.0**. On 2026-10-02, the project owner confirmed permission for
Hashtag Web3 to use the imported internet-speed figures in response to the
commercial-use question, and explicitly instructed that they be used. This
resolves the previously recorded permission question for this integration;
source attribution is retained. Place data includes OpenStreetMap/ODbL
attribution. Image source URLs remain in the provenance snapshot.

## Import and build

Run from this repository under Node 24:

```sh
npx tsx scripts/import-nomad-resources.ts --from=/path/to/PDFtoWebsite --images
npm run precompute:nomads
npm run test:nomads
```

`--images` imports missing local hero/thumbnail pairs. An import without that flag
retains existing image paths and source attribution. Source extraction rejects
nonliteral expressions, unmapped cities and missing timezone mappings. External
links accept HTTP(S) only and reject credential-bearing URLs.

Normal prebuild registers `nomad-catalogs`, including every expected shard as an
output. A fresh checkout generates `public/data/nomads/` locally, without source
checkout access, remote APIs or credentials. The standalone copier includes
`public/data/` and `public/images/`; asset assertions check all city images and
all generated Nomad files. Sitemap and preview generation include all 113
canonical routes. OpenAPI and `llms.txt` document the static data paths.

### Static data paths

- `/data/nomads/cities.json`: lightweight city summaries.
- `/data/nomads/cities/{slug}.json`: one city's details.
- `/data/nomads/places.json`: compact directory rows; decoder in `types.ts`.
- `/data/nomads/passports.json`: passport names, IDs and ISO codes.
- `/data/nomads/passports/{id}.json`: references for only the selected passport.

Maps load on request. The hub does not fetch the place directory or passport
matrix; comparison downloads two city records. Images use locally generated
WebPs with 480px thumbnails and up-to-1280px heroes. Unopened city/tool links do
not prefetch page payloads. City pages use on-demand ISR rather than bulk
prerendering; the overall build remains within its existing 300-page budget.

`useNomadQuery` keeps filter state in the URL. It matches the empty query of the
static shell during initial hydration, then reads the actual browser query;
shared filtered links therefore reload without hydration mismatches.

## Verification

```sh
npm run typecheck
npm run test:nomads
FAH_FAST_PREBUILD=1 OG_PRECOMPUTE=0 OG_FILL_MISSING=0 npm run build
CHROME_BIN=/path/to/chrome npm run test:nomads:browser
```

The data/calculation tests cover calendar rollovers, DST/fractional offsets,
overnight work windows, overlapping Schengen trips, an independent day-by-day
count, runway/tax boundaries, complete image/shard delivery, bandwidth budgets,
data integrity, existing visa preservation, URL safety and reserved identities.

The production-browser suite checks all 113 routes, city 404s, metadata, sitemap,
social/agent behavior, the original Nomad popup, interactive tools, failed-fetch
retry, real map tiles, optional trip persistence, URL reloads, desktop/mobile
navigation, 320px/390px layouts in light/dark mode, and PDF output. Screenshots,
failure artifacts and the generated PDF go into ignored `.cache/nomads/`.

Existing prebuild gates also run ATS ownership, published event identities,
catalog integrity, social image, responsive image, middleware and slug checks.
For the separate cost-saving browser regression after an upstream job refresh:

```sh
CHROME_BIN=/path/to/chrome npm run test:cost-savings:browser -- --current-catalogs
```

That flag preserves the glossary baseline comparison and byte equality against
the current generated feed files, while avoiding comparison of today's jobs
against the older captured job snapshot. It does not overwrite the baseline.

Implementation and local verification do not deploy the site. Firebase rollout
continues through the repository's existing release workflow.

### Local verification results (2026-10-02)

- Node 24 production build, including TypeScript checks and standalone asset assertions, passed.
- All 10 Nomad calculation/data suites passed; 200 local city images and all 299 city/passport detail files validated.
- All 113 canonical routes returned 200 with the expected canonical metadata; unknown cities returned 404.
- Production-browser interactions, share-link reloads, map loading, passport failure/retry, optional trip persistence, both navigation menus and PDF generation passed with zero browser runtime errors.
- All tools were checked at 320px and 390px in light/dark mode without page-level horizontal overflow.
- Toolkit HTML measured about 14.6–31.4 KB gzip per tool page; the hub was 30,992 bytes. These are local HTML payloads, excluding scripts/images, not production billing estimates.
- The build generated 140 static routes; city details render on demand.
- Existing checks passed for 6,194 jobs, 295 company count/list pairs, 869 published event identities and 11,500 social preview assets.
- Cost-saving browser regression retained all 157 glossary cards, correct filters, feed bytes, agent/social behavior and a 46,356-byte gzip glossary page.

## Website design alignment

The current light website is the visual reference, using `/resources`,
`/salary-calculator`, `/remote-work-checklist` and `/events` for comparison.
Toolkit pages use the existing `PageHeader`, `PageShell` and `Card` components,
Inter typography, site-width container, neutral palette and primary-button
colors. Tool headings follow the site's centered layout; city-detail headings
use its left-aligned detail-page treatment at the same type scale.

The design pass also provides:

- A secondary navigation below the page heading, with complete mobile access
  through More instead of clipped labels.
- Consistent 44px form controls, 16px mobile input text, aligned labels and compact
  filter grids where the viewport allows them.
- City comparison cards that show monthly costs immediately, with smaller photos.
- Consistent metric cards, row-header styling and keyboard-scrollable tables with
  an overflow hint only when horizontal scrolling is necessary.
- Native date/time control colors that follow the existing CSS theme rules.

Reproduce the visual review against a production build:

```sh
CHROME_BIN=/path/to/chrome npx tsx scripts/review-nomad-design.ts --label=after --dark --verify
```

This captures 63 page/viewport combinations: 13 tools, the selected-passport
state, three representative city guides and four existing reference pages,
across desktop, mobile and the pre-existing dark-color CSS. Assertions compare
toolkit fonts, heading scale and content alignment with `/resources`, and check
control sizes, native-control themes and unclipped navigation. This review does
not add a theme switch. Screenshots, contact sheets and measurements are saved to
ignored `.cache/nomads/design-after/`; the initial comparison is in
`.cache/nomads/design-before/`.

After this pass, the production build and full 113-route browser suite passed
with zero toolkit runtime errors. Mobile tests additionally navigate to Living
costs and Visas through More and horizontally scroll a data table by keyboard.
The toolkit's compressed HTML remained approximately 15–32 KB per tool page.

## Visual and cross-site refinement

Following the local-preview review:

- Removed the source panel, its separate attribution link and visible toolkit
  breadcrumbs. The source notice remains available as a static document.
- Reused the original `VisaCard` and `ListingToolbar` for visa programs, retaining
  their country flags, income/stay fields and visible requirements.
- Replaced native dropdowns with `FilterSelect`, built on the site's existing
  Radix `Select` primitives. Shared `Input` controls now supply the form fields.
- Added `CountryFlag`, `CityIdentity`, `CityThumbnail` and `CityCard` for uniform
  flag/photo/name alignment across listings, numeric tables and related cities.
  Financial and measurement columns are right-aligned with tabular numerals.
- Generated 100 small 128×96 WebP thumbnails for table rows, alongside the existing
  480px and 1280px images. Fixed image boxes keep different source aspect ratios
  from creating uneven cards or oversized city headers.
- Added lightweight SVG temperature/rainfall charts with all twelve monthly
  values retained underneath. Missing observations remain missing.
- Replaced nearby-city buttons with responsive image cards that fill each row.
- Connected city guides to the existing `JobCard`, `EventCard`, `CompanyCard` and
  `PopupCard`, organized in the site's shared `Tabs`. Country-wide results are
  labeled with the country when no exact-city results exist. Company references
  use matching job locations, with explicit local-role counts; they do not infer
  headquarters. Popup and job summaries omit large unused bodies/descriptions.
- Grouped directory suggestions into workspaces and stays/coliving. Both the
  directory and city guides reuse `PlaceCard`; local community links are compact
  cards with additional links in an expandable list.

The refreshed production build and 113-route interaction suite passed with zero
browser runtime errors. All 13 calculation/data/relationship suites passed,
including ambiguous-location checks and climate gaps. All 300 city image files
are validated. HTML for the tool pages measured approximately 15–36 KB gzip.

Visual review outputs are in `.cache/nomads/design-visual/` and
`.cache/nomads/design-details/`. The latter includes climate, nearby-city and
every available cross-site tab on desktop and mobile:

```sh
CHROME_BIN=/path/to/chrome npx tsx scripts/review-nomad-design.ts --label=details --city-details --verify
```

Set `NOMAD_REVIEW_BASE_URL=http://127.0.0.1:3000` to inspect an already-running
local preview instead of starting a separate standalone instance.

### Counts, filters and attribution cleanup

The hub overview counts have been removed. Its four filters now occupy equal
columns, with the shared input/select controls fixed at 44px high. The layout
uses four columns on desktop, two on wider phones/tablets, and one on narrow
phones. CVin attribution sections have also been removed from the rankings,
passport checker, report and public notice, in addition to the hub panel and
separate attribution link. Import provenance remains in the internal snapshot.

### Compact listings and clustered map

Tool-title introductions and redundant overview cards have been removed. Listing
filters follow the flatter `/news` pattern, while calculator inputs/results keep
their functional grouping. City location labels remain on detail pages.

The shared Select viewport now owns the height constraint. Conditional scroll
arrows were removed: previously their insertion moved the options viewport by
24px and changed its height while scrolling. Browser checks cover Region, City,
Passport and the site's existing salary-calculator select.

The places page opens in map view, with five multi-select category chips and
counts, blue/purple/red numbered clusters, cluster expansion, individual place
popups, directions, city-guide links, and compact zoom/reset controls. `type=`
links still work; `types=` supports multiple categories, and `view=list` shows
the card directory alone. Changing categories preserves the map view.

The implementation reuses Leaflet and the site cards, with Supercluster for the
point index and MapLibre's Leaflet adapter for CARTO's public Positron vector
style. The raster endpoint returns API-key placeholder images, so it is not
used. The vector source was verified with actual map rendering. The map has an
OpenStreetMap fallback for unavailable WebGL/styles. Vector workers and only
the required CARTO domains are included in the CSP.

The final build, all 14 data/calculation suites, and the 113-route browser suite
passed. Browser verification includes cluster zooming, chip filtering, popup
close/reopen, map teardown/remount, vector-basemap readiness, and stable dropdown
geometry during scrolling. Tool HTML remains approximately 15–35 KB gzip.
