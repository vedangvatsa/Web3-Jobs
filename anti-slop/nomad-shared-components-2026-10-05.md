# Nomad shared-component review

Mode: apply the UI consistency rules during implementation, as requested.

Reading this as a destination directory for readers comparing places to live and work, using Hashtag Web3's existing Glossary design language. ENERGY 1 / RHYTHM 2 / MOTION 2: restrained controls, map and photo-card sections, and purposeful map navigation with reduced-motion support.

## Direction and reasons

- Typography: use the same `PageHeader` type scale and font as Glossary so headings belong to the same site.
- Spacing: let `PageShell` and `PageHeader` own page padding and heading margins, rather than overriding them in the Nomad wrapper.
- Filters: reuse `ListingToolbar` and its native select control, with accessible labels and usable touch targets.
- Layout: preserve heading, category chips, map, filters and city cards, matching the user's previous layout direction.
- Color and imagery: retain the established theme tokens and real city photographs. The map and photographs provide the content emphasis.
- Motion: retain map movement only to maintain spatial context; no decorative entrance animation.

## Verification evidence

- Production build and type validation passed, with 131 generated pages and the existing prerender budget.
- Nomad data/calculation checks: 17 passed.
- Nomad browser regression: 102 canonical routes, 122 redirects, all 100 cities through infinite scrolling, filters/reset, map error/retry, 23 distinct zoom samples in the final run, reduced motion, comparison/clipboard/reload, passport loading/error recovery, related city sections and PDF output passed. No browser errors were recorded.
- Glossary regression: all 157 cards, synonym search, letter/category filters, reset, mobile layout and detail navigation passed, with no browser errors.
- Cross-page design review: 98 combinations at 320, 390, 768, 1024 and 1440px, plus mobile and desktop dark mode; zero horizontal overflow and zero recorded baseline errors.
- Nomads and Glossary have matching computed heading font, weight, line height, tracking, padding and following gap. Observed titles are 30px on the tested mobile widths and 48px at the tested tablet/desktop widths; top padding is 32px/48px, and the following gap is 32px.
- Their toolbar inputs and selects have matching computed styles: 44px height, 6px radius, the same borders, colors and padding, with 16px mobile and 14px desktop text. Measured foreground/background contrast for these controls is at least 16.97:1 in the tested themes.
- Desktop, narrow-mobile and dark-mobile screenshots were inspected. The search/filter rows reflow without clipping, and the category chips, map and photo-card order is preserved.

Commands and artifacts:

```sh
FAH_FAST_PREBUILD=1 OG_PRECOMPUTE=0 OG_FILL_MISSING=0 npm run build
CHROME_BIN=/path/to/chrome npm run test:nomads:browser
CHROME_BIN=/path/to/chrome npx tsx scripts/review-nomad-design.ts --label=shared-glossary --verify --all-widths --dark
CHROME_BIN=/path/to/chrome npm run test:cost-savings:browser -- --current-catalogs
```

Screenshots and measurements: `.cache/nomads/design-shared-glossary/`.
Interaction screenshots and PDF: `.cache/nomads/`.

## Delivery gate for the changed components and Nomad views

### Hard gates

- R-02 PASS: the changed UI introduces no em-dash copy.
- R-03 PASS: tested widths have no horizontal overflow; new filter controls and the shared reset action provide 44px targets.
- R-17 PASS: displayed city/visa/place figures remain backed by the imported catalogs and passing integrity tests.
- R-18 PASS: no testimonials or invented identities were added.
- R-23 PASS: the user's Glossary reference and prior Nomad layout directions supply the design; existing city photographs are reused.
- R-24 PASS: 102 canonical Nomad routes, 122 historical redirects and protected root identities passed HTTP checks.
- R-25 PASS: the changed toolbar foreground/background pairs measure at least 16.97:1 in light and dark modes.
- R-26 PASS: search, filters, reset, category toggles, comparison, map controls and printing have exercised handlers.
- R-27 PASS: empty results, initial loading and failed map/passport requests retain usable recovery states.
- R-28 PASS: no FAQ was introduced.
- R-32 PASS: native selects, visible focus styles, keyboard tab changes and Escape dismissal were exercised.
- R-33 PASS: UI changes are implemented in source components; the recovery helper only copied previously edited files byte-for-byte.
- R-34 PASS: both tested themes retain consistent heading/filter styles and readable controls.
- R-35 PASS: the production application was built and exercised in a real Chromium browser.
- R-36 PASS: no new security, customer or performance claims appear in the UI.
- R-37 PASS: the explicit user direction is to reuse Glossary's component design.
- R-38 PASS: no fictional data, navigation or placeholder content was added.

### Purpose gates

- R-01 PASS: existing site theme tokens establish the palette; no decorative gradient was introduced.
- R-04 PASS: search, ranking-direction, comparison, print and map icons identify their actual actions.
- R-06 PASS: the existing Inter typography is reused through the same `PageHeader` and toolbar components.
- R-07 PASS: no decorative background pattern was added.
- R-08 PASS: existing city-link arrows distinguish navigation to a guide from the adjacent comparison action.
- R-09 PASS: map category chips are real filters with real counts, not promotional badges.
- R-10 PASS: no additional blur/glass effects were added.
- R-12 PASS: shared cards remain flat; existing overlays use elevation to distinguish dialogs/popovers.
- R-13 PASS: focus rings communicate keyboard focus rather than decorative glow.
- R-14 PASS: comparable city records reuse `CityCard`, with photographs and ranked metrics establishing content hierarchy.
- R-19 PASS: map movement preserves spatial context and respects reduced motion; no decorative entrance animation was added.
- R-22 PASS: existing location photographs are used instead of unrelated generated illustrations.

### Liveliness and quality

- Dials PASS: ENERGY 1 / RHYTHM 2 / MOTION 2 are declared above and reflected in the retained content-led layout.
- Focal point PASS: the map leads discovery; photographs and ranked metrics lead the result section.
- Whitespace PASS: shared page/header spacing separates sections consistently.
- Identity PASS: existing typography, theme tokens, cards and filter treatments identify the page as part of Hashtag Web3.
- C-1 PASS: the reasons for typography, spacing, controls, layout, color and motion are recorded above.
- C-2 PASS: interaction regressions cover the changed controls and retained Nomad actions.
- C-3 PASS: sections support destination discovery, comparison and related local content.
- C-4 PASS: responsive, theme, keyboard, empty/loading/error and recovery cases were checked.
- C-5 PASS: displayed records retain their existing source/reference-period handling.
- R-05 PASS: the user-directed heading, chips, map, filters and cards order is preserved.
- R-11 PASS: shared controls use 6px corners; category pills retain a distinct functional purpose.
- R-15 PASS: controls use task labels such as Compare, Clear filters, Weather filters and Print city report.
- R-16 PASS: the change adds no promotional buzzwords.
- R-20 PASS: reuse of the site's actual components prevents a separate Nomad visual system.
- R-21 PASS: the existing light/dark theme behavior is respected.
- R-29 PASS: no additional UI palette was introduced.
- R-30 PASS: the reference is another page on the same site, as explicitly requested.
- R-31 PASS: major decisions have written content or consistency reasons.
