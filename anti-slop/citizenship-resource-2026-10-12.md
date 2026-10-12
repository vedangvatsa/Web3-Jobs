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
