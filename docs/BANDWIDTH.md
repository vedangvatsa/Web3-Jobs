# App Hosting bandwidth

## September 2026 diagnosis

Cloud Monitoring's `firebaseapphosting.googleapis.com/backend/response_bytes_count`
reported 97.18 GiB through September 30, 21:35 UTC, across 4.85 million requests.
74.87 GiB missed the CDN cache; 9.99 GiB were 404 responses.

A complete App Hosting request-log query through 21:30 UTC found 43,899 requests
to `/events`, totaling 29.61 GiB, with no cache hits. 43,401 requests carried
Next.js's `_rsc` query parameter. These include navigation and prefetch requests;
they are not equivalent to human pageviews. A browser visit to the homepage
downloaded a 758 KB Events prefetch without clicking that link.

## Controls

- Header, mobile navigation, footer, job/event cards, and Events breadcrumbs use
  `prefetch={false}`. Clicking still uses Next.js client navigation.
- Event listings and side-event calendars receive `EventListItem` records, with
  240-character excerpts and no provenance, ticket offers, images, or speaker arrays.
  Event detail pages retain full content and structured data.
- Full-description search downloads the existing events catalog only after the
  user types. Concurrent and subsequent searches share that download; failed
  requests can be retried. Name, location, and excerpt matching remain available
  if the description catalog cannot load.
- `/events`, static catalogs, and content shards are excluded from the middleware
  matcher. App Hosting does not CDN-cache routes affected by Next.js middleware.
  The Events agent query is handled by a Next.js rewrite; social suffix paths
  still use middleware. Keep HTML and RSC response variants distinct.
- Static images have a one-day browser lifetime. Catalogs use five minutes in
  browsers and one hour at the CDN. Jobs fetches respect these HTTP cache rules.
- Known retired APIs and scanner paths return a tiny plain-text 404 instead of
  rendering the application shell. The unsubscribe endpoint and public API
  specification are preserved.
- `optimize-static-images.ts` runs in prebuild, including fast builds. It keeps
  URLs and image formats, resizes oversized rasters without cropping, validates
  replacements, and records output hashes to avoid repeated lossy encoding.
  Mislabeled animated-GIF event covers at JPEG URLs become static JPEG posters.
  Correctly named animated files are preserved.

## Verification

```sh
npm run test:bandwidth
npm run test:jobs-catalog
npm run typecheck
# After a production build; optionally set CHROME_BIN to a Chrome executable:
npm run test:bandwidth:browser
```

The local production check reduced `/events` from the measured live 782,197-byte
gzip response to 168,215 bytes. Listing JSON alone was 81.7% smaller under gzip.
The browser check covers absence of Events prefetch, full-text search beyond the
excerpt, map/calendar views, small screens, social previews, cache headers, small
404 responses, and unchanged full event descriptions.

After deployment, verify the live headers and CDN hit rate in App Hosting Usage.
Local cache eligibility tests do not establish a production cache hit rate.
Cached transfer is still billable: [Firebase pricing](https://firebase.google.com/docs/app-hosting/costs).

## Preview and build regressions repaired (October 2026)

- Only 114 reviewed WebP variants that reduced the already-optimized assets were
  adopted. `content/image-redirects.json` preserves their original public URLs.
  Eight small legacy event posters are pinned in `content/legacy-image-paths.json`.
- Preview generation repairs retained historical shells as well as current pages.
  `preparePreviewImage` resolves image redirects, corrects dimensions and MIME
  types, and supplies a valid branded fallback for missing or invalid images.
  Detail-page metadata uses the same image resolver.
- 88 external preview images were cached locally; one unavailable source uses the
  branded fallback. Refresh this cache with `npm run cache:social-images` before
  `npm run precompute:og-previews`. Production rendering does not fetch these
  third-party images. Uncached external preview images receive the local fallback.
- `npm run test:social-previews` checks all current and historical shells. It is
  part of both full and fast prebuild gates. Cover pruning protects published
  preview images, compatibility files, and image-redirect destinations.
- `content/event-slug-history.json` reserves published event URLs by event ID,
  including retired events. New arrivals and input ordering cannot take them.
- Job minting now reserves runtime event URLs and history, fixing the `/ps3`
  collision. Slugs are healed before dependent catalogs are generated. An
  unresolved active-job collision fails validation instead of continuing silently.
- The sitemap is refreshed before its validation gate, including full builds.
- City-map coverage uses reviewed GeoNames city centres and normalized aliases.
  Narayani is a regional marker rather than a venue coordinate. Missing future
  city coverage still fails the gate; coverage checks were not disabled.
- `package.json#allowScripts` pins the reviewed native/Firebase/browser installer
  versions. The `core-js` donation-banner script is explicitly denied; the
  polyfills remain installed. A clean npm 12 install has no pending install-script
  approvals. See [npm install-scripts](https://docs.npmjs.com/cli/v11/commands/npm-install-scripts).
- Docker uses Node 24. Docker/GCP upload rules exclude local env secrets, caches,
  dependency trees and logs; these rules concern local upload contexts, not a
  guaranteed reduction in GitHub-backed App Hosting build charges.

Additional regressions:

```sh
npx tsx scripts/test-published-event-slugs.ts
npx tsx scripts/test-preview-image-recovery.ts
npx tsx scripts/check-event-map-cities.ts
```

Verification included a full (non-fast) Node 24 production build, all 10,376
preview shells with zero image failures, 114 HTTP image redirects, the four
previously broken legacy previews, and rapid Map/Grid switches in the browser.

## Responsive images and retained event covers

`npm run images:responsive` generates content-hashed, pre-sized variants for
rendered event covers, article heroes, logos, and community photography. It runs
in prebuild and reuses unchanged outputs. The generator keeps full-resolution
fallbacks, avoids upscaling, skips animated originals, and retains a conversion
only when it saves at least 10% and 512 bytes. Full-size PNG-to-WebP alternatives
use lossless encoding; AVIF is limited to three visually reviewed illustrations.

The browser receives only the relevant image plan, not the full image manifest.
Job search loads a small logo-variant catalog on demand. Failed variants fall back
to the original, including failures that happen before React hydration. Social
cards use supported PNG/JPEG/WebP files with matching dimensions and MIME types.
Their metadata is precomputed in `content/social-image-info.json`; runtime image
inspection and per-route tracing of every generated file are unnecessary. The
standalone copier and asset gate verify all variants and social images instead.

Past-event cleanup is reference-based. Current pages, published preview shells,
image redirects, and explicitly retained legacy images protect their originals.
Unreferenced generated variants have a seven-day grace period for cached pages.
The cleanup run removed two redundant JPEG covers (289,061 bytes); their old URLs
continue to redirect to the corresponding WebP files.

```sh
npm run images:responsive
npm run test:responsive-images
npm run test:responsive-browser
npx tsx scripts/prune-stale-event-covers.ts --dry-run
npx tsx scripts/prune-responsive-images.ts
```

## Open Standard job source

The daily Ashby refresh includes `openstandard`, linked to
`https://joinopenstandard.com`. The initial import contains five specific roles
with the employer's full descriptions and published salary ranges. General
Interest and unlisted postings are excluded. Job minting also reserves existing
published preview URLs, so a new job cannot reuse an older shared link simply
because that older posting is no longer in the current catalog.
