# Missing-page homepage redirects

Missing pages and retired job/event pages send visitors to `/`, as requested.
The former recovery grid has been removed.

## Routing

- Middleware sends browser GET/HEAD requests for missing root pages and retired
  listings to `/` with a temporary 307, `Cache-Control: no-store`, and noindex.
  The redirect discards the query. Browsers may retain a client-only fragment.
- Root-page detection uses the generated slug index, including app pages,
  learning pages, cities, public files and registered aliases. Route additions,
  removals and public-file changes invalidate the fast-build input hash.
  This also covers Next 15.5's otherwise empty dynamic-root 404 response.
- Other unmatched routes use a server-rendered `location.replace('/')` before
  React starts. A `noscript` meta refresh handles JavaScript-disabled browsers.
  Keeping the meta refresh inside `noscript` avoids competing navigations and
  fallback-layout hydration errors.
- Client-router failures retain their protocol errors; Next retries them as
  document navigations, which reach the same homepage recovery.
- Missing APIs/data remain 404. Retired preview/image resources and machine
  requests retain 410 until their existing retention period ends. POST and other
  unsafe methods receive errors without browser-refresh markup.
- Valid aliases, learning redirects and social suffixes retain their intended
  destinations and attribution. Redirecting visitors does not restore expired
  jobs, change original posting dates, or weaken publisher eligibility.

The shared header normalizes internal listing-cache paths before choosing its
posting action. Its reserved 144px action slot and 44px control height keep the
header aligned when navigating between pages with and without an action.

## Verification

Production standalone checks on 14 October 2026:

| Check | Result |
| --- | --- |
| Missing/retired navigation | 47 paths in each JavaScript mode reached the homepage, including nested paths, encoded paths and social aliases |
| Client navigation | Three actual client-router/RSC failures recovered to `/` |
| Existing destinations | 215 valid destinations, 603 configured redirects and 32 social suffixes passed |
| Job retirement | 980 browser/machine requests across 70 retired slugs passed |
| Event retirement | 115 root/alias URLs passed browser GET/HEAD recovery and machine 410 checks |
| Expiry/cache policy | Exact 30-day boundary, bounded cache headers and warm ISR rollover passed in the isolated clock fixture |
| Hydration | Zero React errors and zero failed runtime assets; an actual Resources-menu open/close verifies client execution |
| Header | 320, 390, 768, 1024 and 1440px; light/dark, keyboard/mobile menus and no-JS SSR passed; action measured 44px high |
| Packaging | All 173 generated JavaScript, CSS and font assets matched the build byte-for-byte |
| Build | Normal Node 24 prebuild, production build, postbuild and type validation passed |

Run `npm run test:page-recovery:browser` after a normal production build.
Run `npm run test:header-browser` with `HEADER_TEST_BASE_URL` set to the newly
built server. Local diagnostic reports are in `.cache/page-recovery/` and
`.cache/header-navigation/`; they are not release inputs.

The earlier company browser harness could pass on server-rendered HTML while
client chunks were missing. Packaging now includes `.next/static`, and the
checks reject missing assets, corrupt bytes, React errors and inert controls.

Antislop delivery checks: R-03/R-34 passed the viewport/theme checks above;
R-26/R-32 passed real menu and keyboard interaction; R-35/C-5 use production
evidence; C-1/C-3/R-31 follow the requested immediate navigation and reuse the
existing site header rather than adding an error-page design.
