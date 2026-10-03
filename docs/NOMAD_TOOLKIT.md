# Digital Nomad Resources

Entry points: **Resources > Digital Nomad Resources**, the Remote Work & Nomads
section on `/resources`, and the footer. `/nomads` is one workspace. It has no
separate Cities, Rankings, Places or Compare navigation, and no More tools menu.

## Routes and features

| Route | Purpose |
| --- | --- |
| `/nomads` | Search cities/places, filter region/budget, rank destinations, explore the map, compare in-page and print results |
| `/[city]`, e.g. `/lisbon` | 100 city guides with budgets, monthly climate, places, community links and related Hashtag content |
| `/digital-nomad-visas` | 71 merged program references plus a 199-passport entry checker with an automatic map |

Rank by overall score, living costs, internet, safety, walkability, temperature,
rainfall or humidity. Weather ranks reveal month/range controls. Unknown values
sort last in both directions. Search and ranking share the same city results.
The map retains five category chips and counts, clusters, popups and city links;
there is no full place directory below it. Select two cities to open comparison
in the shared Sheet. Print exports the first 50 matching cities in displayed rank
order, with reference details, using the browser's Save as PDF.

Standalone timezone, Schengen, runway, tax and service pages are removed. Their
imported records and calculation libraries remain for provenance, but are not
promoted as active tools. No replacement Planner page is introduced.

`/nomad` remains the existing Nomad popup. `/tax` and all other published root
identities retain their owners. Every toolkit page has a root-level canonical URL.
The 111 old nested paths and eleven retired root tools permanently redirect with
query strings and social suffixes preserved. `content/nomads/legacy-routes.json`
maps retired roots to the hub, visa checker or resource page. The full historic
`tool-paths.json` remains reserved against job allocation; only the two active
tools and 100 city guides appear in the canonical sitemap and asset expectations.
Individual directory places do not receive separate indexable routes.

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
verification. Visa cards retain the actual requirements and official source links;
generic explanatory footer paragraphs are removed. Related jobs/popups require both
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
all generated Nomad files. Sitemap and preview generation include all 102
canonical routes. OpenAPI and `llms.txt` document the static data paths.

### Static data paths

- `/data/nomads/cities.json`: lightweight city summaries.
- `/data/nomads/cities/{slug}.json`: one city's details.
- `/data/nomads/places.json`: compact directory rows; decoder in `types.ts`.
- `/data/nomads/passports.json`: passport names, IDs and ISO codes.
- `/data/nomads/passports/{id}.json`: references for only the selected passport.

The hub loads the compact places data for its map. Its city projection excludes
nearby/community data and is reused for ranking, comparison and report export.
Comparison does not redownload city shards. Passport maps appear automatically
after selecting a passport and fetch only that passport's shard. Images use locally generated
WebPs with cropped 480px cards, 720-1024px heroes (never upscaled), and 128px table
thumbnails. Width descriptors match the actual files. Unopened city/tool links do
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

The production-browser suite checks all 102 routes, all 122 redirects, city 404s, metadata, sitemap,
social/agent behavior, the original Nomad popup, interactive tools, failed-fetch
retry, real map tiles, intermediate zoom frames, rapid-click/reduced-motion camera
behavior, in-page comparison, URL reloads, desktop/mobile navigation, layouts at
320/390/768/1024/1440px, and filtered PDF output. Screenshots,
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

## Consolidation verification (2026-10-03 UTC)

- Node 24 production build and typecheck passed; 131 prerendered pages across
  the site, with city guides still rendered on demand.
- All 17 Nomad data/calculation/ranking suites passed. All 102 canonical pages
  and 122 retired-root/nested redirects passed HTTP, sitemap and metadata checks.
- Production browser checks passed at 320, 390, 768, 1024 and 1440px with no
  runtime errors or page overflow. Comparison stays in-page, shares and reloads
  its pair, swaps cities, and restores keyboard focus when closed.
- Real CARTO vector tiles loaded. Camera checks recorded 44 distinct zoom samples
  in one animation, plus cluster expansion, rapid clicks, reset and reduced motion.
- Filtered PDF export preserves displayed order. Print-width checks cover all
  columns and counter alignment; the report prepares images before printing.
- Visual checks covered 26 page/viewport combinations against `/news`. The hub
  HTML is about 41KB gzip and visas about 30KB. All 102 distinct OG images and
  existing local display variants passed the asset audit.
- Existing job cleanup, catalog and cost-saving browser regressions passed:
  4,854 gone URLs, 6,159 jobs, 290 company counts, 157 glossary cards, identical
  current feed bytes and no glossary term prefetch.

Artifacts are local only in `.cache/nomads/`, including `design-consolidated/`,
mobile/comparison screenshots and `report.pdf`.

## Historical implementation notes

The following records describe earlier multi-page releases and their tests.
The consolidated architecture above supersedes their navigation and route counts.

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

The current light website is the visual reference, using `/news`, `/resources`,
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
CHROME_BIN=/path/to/chrome npx tsx scripts/review-nomad-design.ts --label=root-routes --verify
```

This captures 44 page/viewport combinations: 13 tools, the selected-passport
state, three representative city guides and five existing reference pages,
across desktop and mobile. Assertions compare
toolkit fonts, heading scale and content alignment with `/news`, and check
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
  480px thumbnails and source hero images. Fixed image boxes keep different source aspect ratios
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
links still work; `types=` supports multiple categories. Map and directory stay
visible together, without a List/Map switch. Changing categories preserves the map view.

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

## Root URLs, image delivery and final design audit (2026-10-03)

- All 113 canonical pages now use root URLs. The 100 city guides share the site's
  existing `[slug]` dispatcher and on-demand rendering. Eleven tool pages moved
  to root routes; `/nomads` and `/digital-nomad-visas` retain their URLs.
- All 111 former nested paths return 308 redirects, preserving queries and share
  suffixes. Internal links, metadata, sitemap, preview shells, root reservations
  and the sitemap registry gate use the new routes. Older preview files also
  carry the new canonical URL and image.
- Tool headings are concise, with no introductory paragraph or breadcrumb.
  Shared `PageHeader`, `PageShell`, `Input`, `Select`, cards and navigation retain
  the site's existing typography and layout. Four city-finder filters are equal
  width and 44px high on desktop.
- `precompute-nomad-images.ts` generates 200 cropped display WebPs from the 100
  originals, with source-content fingerprints and no upscaling. `CityImage` now
  reuses the site's `ResponsiveImage` fallback and accurate width descriptors.
  The general image optimizer excludes these generated variants to avoid a
  second lossy encoding. Original URLs and attribution remain available.
- Display heroes average 90,277 bytes (27% smaller than the original heroes);
  480px cards average 27,312 bytes (32% smaller than the previous thumbnails).
  Table thumbnails average 3,224 bytes. These are file-size comparisons, not
  production billing estimates.
- The existing static-page OG generator now creates a distinct 1200×630 PNG for
  every tool/city route, using the site's existing card design. All 113 are
  connected to Open Graph, Twitter and preview metadata, average 7,214 bytes,
  and stay below 9 KB. Prebuild output checks and standalone assertions cover
  both display variants and social assets.
- Production build/typecheck, 14 Nomad suites, 113 canonical pages, all 111
  redirects, map interactions and stable dropdown scrolling passed. No toolkit
  browser errors or page-level overflow at 320px/390px were found.
- The design audit passed 44 desktop/mobile views against `/news`, including
  fonts, heading sizes, content alignment, touch targets and navigation. Current
  screenshots and metrics are in `.cache/nomads/design-root-routes/`.
- Existing catalog, ATS, event identity, responsive-image and social-preview
  checks passed. The cost-saving browser regression retained all 157 glossary
  cards, no term prefetch, unchanged current feeds and zero browser errors.

Run the complete asset coverage audit after prebuild:

```sh
npx tsx scripts/audit-nomad-assets.ts
```

## Simpler controls and balanced layouts

- Visa programs and Passport checker use the shared `ListingViewTabs` and
  `ListingToolbar`. The view switch shares the search/filter row on desktop and
  fills the available width on small screens. Arrow keys switch views without
  losing focus or the URL-backed filters. Rankings uses the same pattern.
- Passport maps are automatic, centered inside the shared site card, capped at
  640px and responsive to the available width. There is no Show/Hide map button
  or small-destinations caption. Category counts are integrated into the legend,
  including a passport-country key and matching unavailable-data colors.
- Places always shows its map and directory together. The redundant List/Map
  toggle is removed; search, category filters, cluster zoom and Locate remain.
- Comparison selectors share one row, with a compact swap control. City cards
  lead directly into the right-aligned data table without a redundant
  cost-difference summary. Long country names no longer make city cards uneven.
- Savings Runway groups the city filter with its other inputs. Schengen groups
  the date control with two balanced counters and removes the repeated date
  card. Timezone form controls align along their bottom edge.
- Verification passed the production build, typecheck, all 14 Nomad suites and
  the full 113-route browser suite. A 44-view review covered all tool pages and
  representative city guides; another 15 visa views covered 320, 390, 768, 1024
  and 1440px widths, including map centering and clipped-control checks.
  No toolkit browser errors or page-level overflow were found.

Current screenshots are in `.cache/nomads/design-simple-layout/` and
`.cache/nomads/visa-toolbar/` (ignored local review artifacts).

Explanatory copy is limited to information needed to interpret the data or use
the controls. The report's large how-to panel, repeated tax instructions, generic
service-category introductions and promotional passport empty-state heading
have been removed. The report's ordering and units are a short note below its
table; the passport checker prompts for a selection in one line.

Official visa-program URLs are compact, labelled icon links in the card header.
The shared card accepts an optional header action; programs without additional
details no longer get a footer just for the website link. Browser checks covered
all 45 official links across the 71 cards at 320, 390 and 1440px.
