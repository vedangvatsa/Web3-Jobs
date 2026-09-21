# Header navigation review

Scope: shared header, contextual posting action, mobile menu, and homepage container alignment. Direction comes from the user's screenshots and request for a steady, consistently sized navigation bar. Dials: ENERGY 1 / RHYTHM 1 / MOTION 1.

## Decisions

- Shared `site-container` sizing aligns the header with the listings. Removing the nested homepage container eliminates the extra inset on job cards.
- Equal desktop side columns keep the links centered independently of the posting action. A reserved 128px action slot keeps geometry unchanged when its label changes or the action is absent.
- One path-based action replaces two independent DOM-inspection effects. It resolves during server rendering and client navigation, so outgoing page content cannot leave the wrong button behind.
- Existing monochrome branding and Inter typography follow the supplied reference. The single high-contrast action is the header's focal point.
- Fixed logo dimensions prevent image loading from changing spacing. Dark-mode inversion preserves the existing logo's contrast.
- Menus provide state feedback; the header itself has no movement animation. Resources uses a non-modal dropdown to avoid unnecessary page scroll locking.
- Mobile keeps one posting action in the header, a labeled Menu control, and a drawer for navigation. The drawer does not duplicate the posting action.

## Delivery gate

| Gate | Status and evidence |
| --- | --- |
| R-02, R-15, R-16: copy | PASS: contextual labels are “Post a Job”, “Post an Event”, and “Menu”; no new marketing copy. |
| R-03: responsive layout | PASS: browser checks at 320, 390, 768, 1024, and 1440px; no horizontal overflow. Header action, menu trigger, drawer close, and mobile links have 44px targets. |
| R-17, R-18, R-36, R-38: factual content | PASS: no statistics, testimonials, people, or claims were added to the UI. |
| R-23, R-37: direction/assets | PASS: existing logo and navigation structure retained; explicit user screenshots and behavior requirements supply the direction. |
| R-24, R-26: functional navigation | PASS: main links exercised through client navigation; dropdown and drawer open/close; posting action retains its real Telegram destination. |
| R-25: contrast | PASS: measured navigation text 4.83:1 light and 6.91:1 dark; posting action 16.97:1 in both. |
| R-27: page states | PASS: route checks cover index/detail pages, no-action pages, unknown routes, and initial HTML with JavaScript disabled. |
| R-28: FAQ | PASS: no FAQ introduced. |
| R-32: keyboard | PASS: Resources opens with Enter, closes with Escape, and restores focus; drawer closes with Escape. Visible focus rings are present. |
| R-33: implementation | PASS: components and stylesheet edited directly; browser scripts only test and capture output. |
| R-34: themes | PASS: light/dark layout checks at all tested widths; existing logo remains visible through dark-mode inversion. |
| R-35: execution | PASS: exercised the local Next.js app using Playwright; browser check reports no page errors. |
| Purpose gates | PASS: layout, contrast, dimensions, typography, and menu choices are explained above. No decorative effects or imagery added. |
| Liveliness and identity | PASS: calm dials match the stable header request; original stacked wordmark and single monochrome action retain the site's identity. Whitespace reserves fixed structural positions. |
| C-1 through C-5 and quality locks | PASS: user-driven layout, working destinations, responsive state coverage, and measured rather than assumed alignment/contrast. |

## Reproduce

With Next.js running at `http://127.0.0.1:3125`:

```bash
npm run test:header-cta
npm run test:header-browser
npm run typecheck
```

`HEADER_TEST_BASE_URL` can point the browser check at a different local server. Browser verification includes exact header bounding-box comparisons across client-side navigation and alignment of the logo/action with the homepage job grid.

## Addendum 2026-09-21: page-width alignment

Glossary term pages used `max-w-4xl` and resource pages `max-w-5xl`, so their left edge sat inside the header's `max-w-6xl` measure (reported on `/amm`). Full-bleed tool shells (`container mx-auto px-4` with no cap) overshot it the other way, and several `max-w-6xl` shells used `px-4` instead of the shared `px-4 sm:px-6` rhythm.

Decisions (same dials, ENERGY 1 / RHYTHM 1 / MOTION 1):

- Every page shell now uses the shared `site-container` measure: glossary term article, resource hero/body, glossary category sections, learn category/lesson shells, remote-work checklist, JD-builder and invoice bodies, route loader, career quiz states, and footer.
- Full-width hero bands on resource and glossary-category pages stay full-bleed by design; their inner content uses `site-container`, so text edges still line up with the header.
- Centered article headlines keep their narrower text measure inside the full-width shell; only left-aligned body containers were widened, per the explicit alignment request.
- No color, type, copy, or motion changes.

Gate delta: R-03 PASS (320-1440px, no overflow; measured header/content boxes equal at x=144 w=1152 on `/amm`, a resource page, a learn lesson, and a glossary category page at 1440px); R-35 PASS (`test:header-browser` now asserts content-box equality for those routes). All other gates unchanged.

## Addendum 2026-09-21 (evening): full-site width audit

Audited every page shell for the shared measure. Fixed the last offender: both quiz states in `web3-career-quiz.tsx` (`max-w-6xl` with `px-4`-only padding → `site-container`). Verified `/web3-career-quiz`, `/interview-questions`, `/about`, `/developers`, `/community`, `/blog` all report header/content boxes equal at x=144 w=1152.

Deliberately unchanged: employer-form pages whose outer wrapper is uncapped but whose content Card is itself `site-container` (aligned); centered headlines and intro paragraphs with narrower text measures inside aligned shells; full-bleed hero bands with `site-container` inners. Reason (R-31): one shared outer measure for alignment, narrower measures only where they serve reading hierarchy inside it.

## Addendum 2026-09-21: glossary category heading

Category pages rendered the category name as the H1, replacing "Web3 Glossary". The H1 now stays "Web3 Glossary" with the category name as a small supporting line above it plus the existing category description below, so orientation is preserved. Tab titles and social metadata stay per-category for SEO; no other copy or layout changes.
