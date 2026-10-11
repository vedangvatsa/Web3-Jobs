# Missing-page recovery

Reading this as a recovery page for people following Web3 job, event, guide and
tool links, using the existing Hashtag Web3 typography, neutral palette and shared
components. Energy 1 / Rhythm 1 / Motion 1: the user's requested concise copy,
centered symmetry, equal navigation cells and hover/focus feedback.

## Decisions

- The visible copy is a 404 label, Page not found heading and one short sentence.
  Four links have short labels and two- or three-word descriptions.
- `PageShell`, `PageHeader` and `Button` keep the page aligned with the
  rest of the site. A centered homepage button follows the navigation grid.
- The page has no search form, catalog fetch or server-side lookup. It offers
  ordinary links to existing pages, with link prefetch disabled. Its small
  client component only orders the links using the current pathname.
- Known URL prefixes select a relevant section. A one-character typo or
  adjacent-letter swap in a known hub can produce a labelled suggestion;
  no automatic redirect is used.
- Four descriptive hub links offer a route forward without a search. City/visa
  paths prioritize those tools. Stable hubs avoid advertising possibly expired
  individual listings as current recommendations.
- The page does not display the requested URL, query string or fragment.
- The grid has two equal columns from 360px and a centered single column on
  narrower screens. All four cells share a row height and can grow with text.
  The heading, grid and homepage action share a centerline. Controls have
  at least 44px touch targets. Existing light/dark tokens and
  visible focus styles apply. Button boundaries use the darker muted-foreground
  token rather than a low-contrast decorative border.
- Next's not-found handling retains the 404 response and noindex metadata. The
  page imports no full catalog and performs no recommendation/API fetch.
- Unknown legacy `/learn/*` routes use the static not-found response after the
  registered redirect lookup. Their async route previously streamed a 200 before
  calling `notFound()`. Existing learning redirects retain their 308 and query.
- Existing company, blog and glossary compatibility redirects can remove the old prefix.
  Recovery uses the final pathname and stays generic when its purpose is unknown.
- Footer social links wrap at enlarged text sizes instead of overflowing the
  mobile viewport.

## Verification

`npm run test:page-recovery:browser` exercises the production standalone build.
Passed on 11 October 2026:

| Check | Evidence |
| --- | --- |
| Recovery behavior | 11 URL contexts, three compatibility-redirect cases and 10 working destinations |
| Status and discovery | Real 404 responses, Page not found title and noindex; retained 410 and learning 308 responses |
| Hosting work | Zero catalogue/API requests when opening the 404; recovery links have prefetch disabled |
| R-03, R-34 | 320, 390, 768, 1024 and 1440px in light and dark themes, with no horizontal overflow |
| Symmetry | Matching cell widths and heights, aligned rows and columns, and a shared heading/grid centerline at every tested width |
| R-25 | Minimum measured text contrast 4.83:1 light and 6.91:1 dark |
| R-26, R-32 | All five default recovery links have at least 44px targets; Tab order, visible focus, Enter activation and browser back passed |
| R-35, C-4 | 200% text enlargement on mobile passed; zero browser exceptions |
| R-17, R-18, R-36, R-38, C-5 | Destinations are existing pages; no invented counts, testimonials, results or reasons for a missing page |
| R-02, R-15, R-16 | Plain, specific copy and action labels; no decorative error-page copy or fabricated assurances |
| C-1, C-3, R-31 | Existing shared components, equal link cells and centered alignment; decisions documented above |
| Query privacy | Requested paths, query strings and fragments are not displayed |
| Build | Node 24 production build, asset validation, catalogue checks, typecheck and four learning-route tests passed |

Screenshots and machine-readable results are in ignored `.cache/page-recovery/`.
Build validation also required regenerating stale `content/social-image-info.json`
against the tracked jobs snapshot: 103 obsolete entries removed, 166 current entries
added, and no retained entries changed.

The static unmatched-route 404 provides its default links with JavaScript disabled.
The dynamic root-slug
error response was separately inspected: Next 15.5 returns 404 metadata and a
client-rendered error body there, so that case still needs JavaScript. This
change does not claim to fix that framework response behavior.
