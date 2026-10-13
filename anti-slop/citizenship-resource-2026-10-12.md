# Citizenship resource delivery review

## Direction and reuse

User direction: reuse the existing pages, code and components. Antislop applied during implementation.

Design read: a citizenship comparison resource for readers already using Nomads and Visas, in the existing Hashtag Web3 resource-page style. ENERGY 1 / RHYTHM 2 / MOTION 1.

- `NomadShell` reuses `PageShell` and `PageHeader` for the same page width, title hierarchy and responsive spacing.
- `ListingToolbar` reuses its search input, `ListingSelect`, result count and responsive control layout.
- `useNomadQuery` retains the existing hydration-safe, shareable URL-state behavior.
- `ListingCard`, `ListingCardHeader` and `ListingCardTitle` reuse the site-wide listing treatment for programs, including the same borders, hover state, title size and spacing used by Nomads. `CardContent` supplies the card body and `NomadPanel` remains the shared detail-section wrapper. Equal program cards support scanning comparable records; detail sections use definition lists for conditions and a source list for provenance.
- `CountryIdentity` reuses `CountryFlag` for country identification, without new image assets.
- `TableFrame` reuses `ScrollableRegion`, including keyboard focus, horizontal overflow containment and its visible scroll hint. `tableStyle` matches the existing comparison and passport tables.
- `EmptyResults` reuses `ListingEmptyState` for filtered-empty results.
- Shared `Button` variants, `Checkbox`, `ResourceLink` and `SourceNote` retain the existing actions, source links and qualification styling. The primary action goes to the authority; supporting links lead to details and related tools. Button labels can wrap with enlarged text while retaining 44px minimum targets. Comparison selection uses the same card highlight as Nomads, plus the shared checkbox checkmark.
- The root header, footer, typography and theme tokens remain the source of visual identity. Link arrows come from the shared resource-link component and identify navigation actions. No decorative imagery, charts or animation were added.
- Existing static catalog sync, slug generation, sitemap generation, OG preview generation, `STATIC_OG.tools` and standalone public-asset verification are reused.

## Source coverage

All five cited pages were opened during this implementation. Review dates record the session date, 2026-10-12, rather than asserting a legal effective date.

| Country | Reviewed route | Published threshold for one main applicant |
| --- | --- | --- |
| Dominica | Economic Diversification Fund | USD 200,000 contribution, plus fees |
| Dominica | Approved real estate | USD 200,000 investment, plus fees including USD 75,000 main-applicant government fee |
| Antigua and Barbuda | National Development Fund | USD 230,000 contribution, plus fees including USD 10,000 single-applicant processing |
| Türkiye | Qualifying real estate | USD 400,000 investment, plus costs not fully priced in the reviewed source |

- https://www.cbiu.gov.dm/investment-options/economic-diversification-fund/
- https://www.cbiu.gov.dm/investment-options/real-estate/
- https://cip.gov.ag/investment-options/ndf/
- https://cip.gov.ag/citizenship/antigua-and-barbuda-passport/
- https://www.invest.gov.tr/en/investmentguide/pages/acquiring-property-and-citizenship.aspx

Each route references a source ID. Each source has a title, URL, check date and a description of the claims it supports. The listing includes active investment routes only. Residence and merit citizenship are explained separately as outside this catalog.

Known coverage limits are visible: processing times are unverified; presence is unverified for Dominica and Türkiye; Türkiye family rules are unverified; Antigua's reviewed NDF page does not establish refund terms. No total-price calculator, passport-access count or eligibility guarantee is presented.

## Validation evidence

Commands ran with Node 24 prepended to PATH.

- `npm run typecheck`: passed; the final production build also completed its type validation.
- `npm run test:citizenship`: 3 tests passed, covering malformed comparison URLs, duplicate removal, the three-country limit, combined filters, sorting, country aliases, source references and passport availability.
- `npm run test:nomads`: all 51 existing tests passed.
- `npm run test:prebuild-invalidation`: all 5 existing tests passed.
- `npx eslint src/app/citizenship src/components/citizenship-directory.tsx src/lib/citizenship.ts scripts/test-citizenship.ts scripts/test-citizenship-browser.ts`: passed.
- `npx tsx scripts/generate-slug-types.ts`, `npx tsx scripts/generate-sitemap-json.ts`, `npx tsx scripts/sync-public-catalog-assets.ts` and `npx tsx scripts/precompute-og-previews.ts`: completed. Four new crawler shells generated; existing shells skipped.
- `npx tsx scripts/check-sitemap-slugs.ts`: all 7,597 routes accounted for.
- `npx tsx scripts/test-job-slug-reserved.ts` and `npx tsx scripts/check-slug-collisions.ts`: passed.
- `npx tsx scripts/test-middleware.ts`: 50 checks passed.
- `npx tsx scripts/test-site-catalog-integrity.ts`: passed.
- `npm run build --ignore-scripts`: production build and its catalog/detail regressions passed; `/citizenship` is static and all three country pages are pre-rendered. Standalone public-asset verification passed. Targeted generators above supplied the relevant prebuild artifacts; the full data-prep lifecycle was not run.
- `npm run test:citizenship:browser`: passed against the production build, including search, region/route filters, sort, reset, empty state, keyboard Space/Enter selection and removal, visible checkbox focus, URL reload, malformed selections, comparison persistence through filtering, all detail pages, source anchors, correct official URLs, existing passport selection, Nomads discovery, canonical metadata, unknown-country 404, public JSON, sitemap and social crawler previews.
- Browser sizes: 320, 390, 768 and 1440 pixels, both themes. No page overflow; comparison overflow is confined to the keyboard-scrollable shared region. Detail pages also checked at 320/1440 pixels in both themes and with 200% text sizing.
- Browser computed muted-text contrast: 4.83:1 light and 6.91:1 dark. Comparison body text also asserted above 4.5:1 in both themes after transitions settled.
- No browser runtime/hydration errors or failed local requests.
- `npm run test:prerender-budget`: passed with 133 static routes.
- `git diff --check`: passed.

Screenshots reviewed: directory at 1440/light and 390/dark; Dominica detail at 1440/light and 320/dark. Test screenshots are outside the repository in the session temporary directory.

### Whole-site consistency follow-up

User direction: keep the design consistent with the whole website. The existing ENERGY 1 / RHYTHM 2 / MOTION 1 direction continues. Compared the implementation with Resources, Visas, Nomads, and the site-wide listing, page-header and page-shell components. Program cards now use `ListingCard` directly, action and recovery controls use `Button`, and comparison selection uses `Checkbox`. The comparison source links have explicit spacing so adjacent destinations remain distinct. All styling uses existing theme and spacing tokens.

The production build (including type validation), targeted ESLint, and existing citizenship browser checks passed after the shared-card and control changes. Browser coverage included 320/390/768/1440 widths, both themes, keyboard checkbox selection and removal, filters, table scrolling, detail pages and enlarged detail text. Muted-text contrast remained 4.83:1 in light mode and 6.91:1 in dark mode; screenshots confirmed the shared header, footer and container alignment.

## Antislop delivery gate

Scope: the new citizenship UI and copy, using the established shared site shell.

### Hard gates

- R-02 PASS: new UI copy contains no em dash.
- R-03 PASS: tested 320/390/768/1440 widths; program cards stack and comparison scrolling stays inside `TableFrame`.
- R-17 PASS: published thresholds and fee figures reference opened official sources.
- R-18 PASS: no testimonials or invented people.
- R-23 PASS: existing country identity and branding reused under the user's explicit reuse direction.
- R-24 PASS: new discovery and country links resolve; unknown countries return 404.
- R-25 PASS: measured muted and table text meets AA in both themes; foreground and primary actions use the existing high-contrast inverse theme tokens.
- R-26 PASS: filters, search, sorting, reset, comparison controls, detail links and official links have real behavior; browser flow passed.
- R-27 PASS: shared filtered-empty state and reset exercised; Suspense provides named loading feedback; route error boundary provides retry and directory recovery. Static program data requires no client fetch.
- R-28 PASS: no template FAQ.
- R-32 PASS: native controls and links, keyboard Space/Enter tests, visible focus assertion and keyboard comparison scrolling passed.
- R-33 PASS: application edits made directly with `apply_patch`; existing generators only produced their normal catalog and preview artifacts.
- R-34 PASS: both themes tested at four widths and on country details.
- R-35 PASS: final production build, browser regression and screenshot review completed.
- R-36 PASS: no invented performance, security, approval or passport-access claims.
- R-37 PASS: explicit user direction and design read recorded above.
- R-38 PASS: unsupported fields say they are unverified; no plausible invented values.

### Purpose gates

- R-01 PASS: existing neutral theme palette and primary-action treatment preserve site identity.
- R-04 PASS: existing search icon and country flags identify controls and countries.
- R-06 PASS: existing site typography preserves continuity with Nomads and Visas.
- R-07 PASS: no decorative background patterns.
- R-08 PASS: shared resource-link arrows identify navigable resources; primary buttons need no arrows.
- R-09 PASS: active status is plain factual text; no decorative badges.
- R-10 PASS: no new glass effects.
- R-12 PASS: shared panels use `shadow-none`.
- R-13 PASS: no glow effects.
- R-14 PASS: equal directory cards compare peer records; detail and comparison content use other structures.
- R-19 PASS: existing hover/color transitions only, consistent with MOTION 1.
- R-22 PASS: no illustrative filler.

### Liveliness and quality

- Dials PASS: ENERGY 1 / RHYTHM 2 / MOTION 1 matches the existing resource-tool presentation.
- Focal point PASS: country/route identity and threshold precede qualifications; official action has the primary treatment.
- Whitespace PASS: shared header, toolbar and panel spacing separate tasks; detail conditions and sources use distinct sections.
- Accent and identity PASS: existing inverse primary action, country identity and resource typography repeat the site's established patterns.
- Design read PASS: stated before implementation.
- C-1 PASS: layout, type, color, spacing and card decisions are justified in the reuse section.
- C-2 PASS: all new controls have handlers or real destinations.
- C-3 PASS: sections cover selection, comparison, conditions and supporting sources.
- C-4 PASS: responsive, theme, keyboard, empty-state and enlarged-text checks passed; loading/error recovery implemented.
- C-5 PASS: source-linked facts and explicit gaps replace unsupported estimates.
- R-05 PASS: directory and detail composition follows their comparison/reference tasks.
- R-11 PASS: shared panel, control and table radii retained.
- R-15 PASS: action-specific labels such as Official program, Route details and Clear comparison.
- R-16 PASS: factual copy without promotional buzzwords.
- R-20 PASS: shared Nomads country identity, page shell and controls maintain Hashtag Web3's resource identity.
- R-21 PASS: existing light/dark mechanism supported rather than choosing a new theme.
- R-29 PASS: inherited neutral palette with the primary action treatment.
- R-30 PASS: follows this repository's approved pages rather than another product.
- R-31 PASS: major visual decisions and reasons recorded above.

## Changed files

Feature and tests:

- `content/citizenship.json`
- `src/lib/citizenship.ts`
- `src/components/citizenship-directory.tsx`
- `src/app/citizenship/page.tsx`
- `src/app/citizenship/[country]/page.tsx`
- `src/app/citizenship/error.tsx`
- `scripts/test-citizenship.ts`
- `scripts/test-citizenship-browser.ts`
- `package.json`

Existing integration points:

- `src/app/resources/page.tsx`
- `src/app/visas/page.tsx`
- `src/components/footer-content.tsx`
- `src/components/nomads/city-explorer.tsx`
- `src/lib/nav-config.ts`
- `src/lib/og-preview.ts`
- `src/lib/reserved-root-slugs.ts`
- `src/lib/sitemap-build.ts`
- `scripts/lib/prebuild-steps.ts`
- `scripts/lib/standalone-public-assets.ts`
- `scripts/prebuild-deploy-gates.ts`
- `scripts/sync-public-catalog-assets.sh`
- `scripts/sync-public-catalog-assets.ts`
- `public/openapi.json`
- `public/api/openapi.json`
- `public/llms.txt`

Generated artifacts:

- `content/prebuild-input-hashes.json`
- `content/sitemap-routes.json`
- `content/slug-types.json`
- `content/social-image-info.json`
- `public/.well-known/sitemap.json`
- `public/sitemap.xml`
- `public/preview/.preview-manifest.json`
- `public/preview/citizenship.html`
- `public/preview/citizenship/dominica.html`
- `public/preview/citizenship/antigua-and-barbuda.html`
- `public/preview/citizenship/turkiye.html`
- `public/data/citizenship.json` (ignored generated CDN copy, reproduced by catalog sync)

This report: `anti-slop/citizenship-resource-2026-10-12.md`.

No pending implementation blockers. Coverage limits are listed above and visible in the product. No dependencies, backend, runtime scraping, commits, pushes or deployment added. Pre-existing `.cache/asset-repair-20261008/`, `.cache/mumbai-event-audit/` and `.cache/worktree-recovery/` were left untouched.

## 2026-10-13: Match the rendered News, Events and Nomads listings

This section records the UI revision and its current checks. The production-build evidence above belongs to the earlier implementation.

### Direction and observed differences

Antislop remains in the approved during-work mode. Design read: a country directory for the site's existing mobility readers, following the actual News/Events/Nomads listing hierarchy. ENERGY 1 / RHYTHM 2 / MOTION 1.

Playwright's bundled Chromium rendered the reference pages locally. At 1440px, News, Events and Nomads share a 1104px content width, a 48px title at y=105, a 32px header bottom margin, 44px toolbar controls, 16px grid gaps and 357px-wide cards. News cards measured 74px tall, Events 92px, and Nomads 276px including the city photograph. The old citizenship header measured 148px tall and its cards 507px tall with 24px gaps. The revised citizenship header is 48px tall and the country cards are 195px tall with 16px gaps, leaving room for the country, starting threshold, route kinds and working controls.

The initial Nomads dev render exposed an existing Leaflet Strict Mode error, `Map container is already initialized`. Its separate visual-reference capture holds the lazy map chunk pending, leaving the real listing, controls and cards rendered while the map shows its loading state. No Nomads source was changed. The old port-3000 preview also had stale asset URLs and was not used as successful visual evidence. Full production Nomads navigation remains an integration check after the final build.

### Decisions and reasons

- Keep `NomadShell`/`PageHeader` title-only: this reproduces the measured News/Events/Nomads title spacing rather than merely importing their components.
- Use the exact `grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3` listing grid: it preserves card widths and responsive density across the site.
- Keep `ListingCard`, `ListingCardHeader` and `ListingCardTitle`, including 16px card headings and existing padding: country identity is the first scanning target, as headlines and city names are elsewhere.
- Replace summary paragraphs, full route lists, repeated dates and two CTA buttons in cards with starting amounts and distinct route kinds: detailed requirements remain available on the country page and in comparison disclosures.
- Use the existing country-name link for details, `ResourceLink` for the official source and `Checkbox` for comparison: each record has a concise working action row without promotional buttons or new imagery.
- Derive starting thresholds separately for each published currency: no cross-currency minimum or exchange-rate assumption is introduced.
- Derive all region and route-kind filter options from the catalog. Label amount ordering `Currency, then amount`; sort currency first and the matching route's amount second, with country name as a stable tie-breaker.
- Use `program.officialUrl` for unfiltered program links; a route filter selects the source corresponding to its displayed starting threshold.
- Put the one-applicant/fees legend beside the result count: the price basis stays visible without a page subheading or footer disclaimer.
- Remove the entire directory `SourceNote`, including its scope text, explanatory paragraphs and `Download source-backed data` link. Move mobility links into the lower related-resource navigation.
- Render no comparison section at zero selections, a small prompt and clear control at one, and the table at two or three: comparison only occupies space when there is something to compare.
- Reuse `CountryIdentity`/`CountryFlag` in table headers alongside full country names. Put removal with the country it affects, and split route names, amounts and kinds into readable definition lists.
- Place holding conditions and fees in native keyboard-operable disclosures: the table opens compactly and every original route condition and fee remains available.
- Retain `TableFrame`/`ScrollableRegion`, their scroll hint and keyboard behavior. Give the table a positioning context so screen-reader-only disclosure labels cannot leak horizontal overflow outside the scroll region.
- Keep the existing neutral theme, selected-card treatment, link arrows and hover transitions: they preserve site identity and communicate navigation/selection without additional decorative effects.
- Country detail pages also use title-only headers, compact price-basis copy, 16px route-grid gaps and lower related links. Route facts, fees, source URLs and source-check dates remain available.

### Current validation evidence

Commands used Node 24.21.0. The data agent's expanded catalog was present for the final checks: 11 countries, six route kinds, and JOD and USD investment amounts. This UI work did not edit `content/citizenship.json`.

- `tsx --test scripts/test-citizenship.ts`: 5 tests passed. Coverage includes malformed/duplicate selections and the three-country cap, catalog-derived combined filters, the Turkey alias, empty results, different-currency sorting, matching-route sort order, per-currency minima, default/filtered official URLs and source-reference integrity.
- `tsc --noEmit --incremental false`: passed against the expanded catalog.
- Targeted ESLint on both citizenship pages, its error boundary, directory component, library and two test scripts: passed.
- `CITIZENSHIP_ORIGIN=http://127.0.0.1:3001 CITIZENSHIP_UI_ONLY=1 tsx scripts/test-citizenship-browser.ts`: passed against the controlled development server using bundled Chromium.
- Browser coverage: all 11 cards and detail pages; all six route filters and their official links/prices; region/search/reset; country/currency ordering; absent subheadings and removed boilerplate; zero/one/two/three selection states; compare anchor; URL persistence/reload; malformed URLs; selection persistence through empty filtering; keyboard selection/removal; full fee and condition disclosure content; country flags with names; source anchors; existing passport selections; canonical URLs; unknown-country 404.
- Three selected countries disabled the other eight checkboxes. Removing one re-enabled the fourth country, then selecting again restored the limit.
- 320/390/768/1440px directory/comparison checks passed in both themes. Tests verified no page-level horizontal overflow, contained keyboard table scrolling, 44px control targets and muted/table text contrast. Measured muted contrast: 4.83:1 light, 6.91:1 dark.
- All 11 country details passed 320/1440px light/dark checks and 200% text sizing. The directory/comparison also passed enlarged-text overflow checks.
- No recorded browser runtime/hydration errors or failed local browser requests during the citizenship UI run.
- Targeted `git diff --check`: passed.

### Delivery gate for this UI revision

- R-02 PASS: edited citizenship UI copy contains no em dash; visible copy uses direct field/action names.
- R-03 PASS: all four viewport widths, both themes, 44px targets, contained table scrolling and enlarged text passed browser assertions.
- R-17/R-18/R-36/R-38 PASS: amounts and prose come from the catalog; missing fields remain explicitly unverified; no invented metrics, testimonials or imagery.
- R-23/R-24 PASS: the requested shared country identity and established mobility destinations are reused; all 11 detail pages resolved, source-link hrefs matched the catalog, and passport destinations selected the correct passport.
- R-25 PASS: computed muted and table-text contrast meets AA in both themes.
- R-26/R-32 PASS: filters, reset, comparison selection/removal, anchor navigation and both disclosure types were exercised; keyboard focus, Space/Enter and region scrolling passed.
- R-27 PASS: filtered-empty recovery and zero/one selection states were exercised; named Suspense loading feedback and the existing retry error boundary remain in the route.
- R-28 PASS: no FAQ was introduced.
- R-33 PASS: source and helper edits used `apply_patch`.
- R-34/R-35 PASS: the UI ran locally, all 11 details and both themes were tested, and desktop/mobile screenshots were reviewed. The final production build is a separate handoff item below.
- R-37 PASS: the user's named reference pages supplied the direction; measured render differences, dials and decisions are recorded above.
- Purpose gates PASS: existing typography, theme colors, modest borders, country flags, resource-link arrows and equal peer-record cards each serve the stated hierarchy; no added gradients, glow, glass, illustrations, badges or animation.
- Liveliness PASS: country identity and threshold form the card hierarchy; selected-country contrast is the deliberate accent; listing, conditional comparison and lower navigation supply the stated rhythm.
- C-1/C-2/C-3/C-4/C-5 PASS: decisions are recorded, working interactions are tested, empty sections are removed, responsive states hold, and displayed facts stay tied to the catalog.
- R-05/R-11/R-15/R-16/R-20/R-21/R-29/R-30/R-31 PASS: the layout follows this site's measured listing conventions, component radii and theme system; labels name actual actions and the design reasons are documented.

### Screenshots and local-preview handoff

Artifacts: `/var/folders/9v/95v6_ny50fq2t6wnlhc140dh0000gn/T/opencode/citizenship-ui-20261013/`

- Before: `before-citizenship-1440.png`, `before-news-1440.png`, `before-events-1440.png`, `before-metrics.json`.
- Nomads reference: `reference-nomads-1440.png`, `reference-nomads-listing-1440.png`, `reference-metrics.json` (map held in loading state as described above).
- Revised 11-country directory: `directory-1440-light.png`, `directory-1440-dark.png`, `directory-390-light.png`, `directory-390-dark.png`.
- Revised comparison: `citizenship-1440-light.png`, `citizenship-1440-dark.png`, `citizenship-390-light.png`, `citizenship-390-dark.png`.
- Revised detail: `citizenship-detail-1440-light.png`, `citizenship-detail-1440-dark.png`, `citizenship-detail-320-light.png`, `citizenship-detail-320-dark.png`.

Preview: `http://127.0.0.1:3001/citizenship`, opened with macOS `open`. Launcher PID **83605**, listening Next server PID **83606**. Root: `/var/folders/9v/95v6_ny50fq2t6wnlhc140dh0000gn/T/opencode/web3-visas-route`. Launch command: Node 24 `node node_modules/next/dist/bin/next dev -H 127.0.0.1 -p 3001`.

Log: `/var/folders/9v/95v6_ny50fq2t6wnlhc140dh0000gn/T/opencode/citizenship-ui-preview.log`. Metadata with PIDs, root, executable and command: `/var/folders/9v/95v6_ny50fq2t6wnlhc140dh0000gn/T/opencode/citizenship-ui-preview.json`.

The preview uses `.next`; stop these owned preview processes before the main agent runs the final production build. Then run the full `test:citizenship:browser` without `CITIZENSHIP_UI_ONLY` to verify the generated public catalog, sitemap, crawler previews and production Nomads discovery with the final data. `CITIZENSHIP_ORIGIN` can target an existing controlled server; otherwise the test owns a temporary production server on port 3196. No final full build or generated-asset refresh was performed by this UI task.

Paths changed by this UI revision:

- `src/app/citizenship/page.tsx`
- `src/app/citizenship/[country]/page.tsx`
- `src/components/citizenship-directory.tsx`
- `src/lib/citizenship.ts`
- `scripts/test-citizenship.ts`
- `scripts/test-citizenship-browser.ts`
- `anti-slop/citizenship-resource-2026-10-12.md` (this section)

## Final simplification and full-list verification

This supersedes the intermediate eleven-country UI and port-3001 handoff above.

- Removed the sorting control and its behavior. Countries stay alphabetical; route minima still keep currencies separate.
- Removed visible result counts, selection instructions, price-basis helper sentences, active/region card metadata and source-check dates. A screen-reader-only status still announces filtering and selection changes.
- Removed all-empty comparison rows and empty country requirement rows. Full route conditions, fees and official source links remain available.
- Retained country flags with names in cards and comparison headers. The existing shared listing, control, table and page components remain the design source.
- Renamed the Nomads `/visas` link to `Visas`.
- Expanded to all thirteen countries on the supplied Henley list plus Vanuatu. Austria and Malta retain their discretionary classifications, Argentina retains its intake-unverified status, and missing fixed thresholds never become zero prices. Detail and social-preview titles distinguish merit and exceptional citizenship.

Validation PASS: five citizenship tests, TypeScript, targeted ESLint, the full `FAH_FAST_PREBUILD=1 npm run prebuild`, production build, postbuild and the complete production citizenship browser suite. All fourteen country routes, public JSON, sitemap entries, crawler previews, source links, passport selection, Nomads discovery and its `Visas` label passed. Browser checks covered 320/390/768/1440 widths, both themes, keyboard controls, comparison disclosures, country flags and 200% text. No browser runtime/hydration errors or failed local requests were recorded. Contrast remained 4.83:1 light and 6.91:1 dark.

The owned stale production preview and temporary dev preview were stopped after verifying their PIDs and working directories. A fresh production preview was started and opened at `http://127.0.0.1:3000/citizenship`; current process metadata is in `.cache/nomads/preview-server.json`. Screenshots in the directory above now show the fourteen-country production build. The production Nomads navigation passed without the earlier dev-only map workaround.

Delivery gate PASS: the earlier shared-component and evidence gates continue to apply, with the final runtime verification above replacing the incomplete-build handoff. No commit, push or remote deployment was performed for this revision.

## 2026-10-13: Final single-page delivery

This section supersedes every earlier country-detail-page design, test and preview handoff. User direction: `/citizenship` is enough, with no further detail view. Antislop continues in the approved during-work mode.

- Deleted `src/app/citizenship/[country]/page.tsx`. All fourteen compact cards retain the flag, plain H2 country name, starting amount or explicit unknown, route kinds, official link and compare checkbox. Comparison headers are plain flag/name text; the Sources row contains only official links. Existing comparison fee/condition disclosures remain. No new drawer, accordion, modal or detail section was added.
- Preserved the title-only header, removed sorting/count/helper/source-note UI and Nomads `Visas` label. The complete source JSON, fee context and Austria/Malta/Argentina null-threshold distinctions are unchanged by this follow-up.
- Added catalog-allowlisted permanent redirects in `next.config.mjs`, preserving its pending event-alias configuration. All fourteen former country URLs, including the three previously published ones, return 308 to `/citizenship#<slug>`. All 32 existing social suffixes retain root social handling, query parameters and the card fragment; unknown countries and unsupported suffix paths return 404. Card IDs, scroll margins and a post-hydration scroll make fresh-load anchors work.
- Removed country paths from sitemap and OG collectors, deleted all fourteen country preview files with `apply_patch`, and removed unused detail-page helpers. The existing preview generator pruned stale manifest entries without changes to its source: zero shells rewritten, 9,192 skipped. Sitemap generation retained 7,598 current routes; only `/citizenship` remains for this resource.

Validation PASS with Node 24.21.0: five unchanged citizenship unit/source tests; targeted ESLint; TypeScript; sitemap-slug validation; all 50 middleware checks; final `npm run build --ignore-scripts`; `npm run postbuild` including standalone assets, 130-route prerender budget and feed compression; complete `test:citizenship:browser` against the fresh port-3000 production server. The first browser run caught initial fragment scrolling before hydration; the final build fixes it and desktop/mobile redirect/reload anchor assertions pass.

The final browser suite covers all fourteen cards, filters, official URLs, zero/one/two/three comparison selections, keyboard controls, existing full fee/condition text, flags, malformed comparison URLs, all 32 social suffixes, query/fragment preservation, unknown-path 404s, Nomads/Visas discovery, exact public source JSON, root-only XML/JSON sitemaps, OG paths/manifest and prerender routes. At 320/390/768/1440px in both themes, scrolling stays contained, controls meet 44px targets and enlarged text does not overflow. Muted contrast is 4.83:1 light / 6.91:1 dark; no recorded runtime/hydration errors or failed local browser requests. Fresh desktop-light/mobile-dark directory and comparison screenshots were reviewed in `citizenship-ui-20261013/` at the temporary artifact path above.

Preview: `http://127.0.0.1:3000/citizenship`, original `web3-visas-route` worktree, standalone server PID **4659**, started **2026-10-12T20:56:20.390Z**. `.cache/nomads/preview-server.json` records ownership and `.cache/nomads/local-preview.log` records output. Earlier owned preview PIDs 98522 and 3426 are stopped; port 3001 has no listener. Pending event work and deleted skill/docs files remain preserved. No commit, push, deployment, fetch or merge was performed.

## Isolated push integration, 13 October 2026

Revalidated the final single-page implementation in `web3-events-citizenship-push`, based on main at `409510566`. The source worktree and its port-3000 preview were untouched. Shared routing retains the deployed job expiry-window header and ISR rewrites.

- PASS: five citizenship tests; Node 24.21.0 fast prebuild, production build, postbuild and typecheck. The artifact has 125 prerendered routes, with only `/citizenship` for this resource.
- PASS: the full production citizenship browser suite at port 3196, including all fourteen cards, three nullable thresholds, filters, comparison, keyboard controls, flags, official links, anchors, permanent redirects, all 32 social suffixes and root-only public artifacts.
- PASS: 320/390/768/1440 widths, both themes and enlarged text. Muted contrast remains 4.83:1 light and 6.91:1 dark. No runtime/hydration errors or failed local browser requests.
- PASS: desktop-light and mobile-dark directory screenshots and desktop comparison screenshot reviewed in the temporary `citizenship-push-20261013` artifact directory. Existing shared-component purpose, liveliness and content-evidence gates remain satisfied.
- PASS: 1,675 main-owned jobs preserved, zero invalid ages, 980 retired-path browser/bot 410 requests, expiry-bounded shared caching and warm ISR rollover. The isolated cache fixture includes empty event/citizenship catalogs required by the merged Next configuration.
- Targeted ESLint reports zero errors and one existing Nomads `useMemo` dependency warning outside the changed link label. Article generators, article indexes and the Nomads OG image are excluded from the feature change.
