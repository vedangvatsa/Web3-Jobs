# Static generation budget

The September 20 build generated 37,174 routes: approximately 8,265 root detail URLs, 28,757 job aliases/IDs, and the directory/tool/course pages. A Docker-only flag limited that work, but Firebase App Hosting uses buildpacks and did not set the flag.

The root `[slug]` detail route prebuilds only the finite learning routes. Other details use `dynamic = 'force-static'`, `dynamicParams = true`, and a one-hour revalidation interval. A detail page is server-rendered on its first request and cached; it remains available without having been built in advance. The first visitor to an uncached URL pays the rendering cost.

The homepage, job/event/news/company directories, tools, glossary categories, and the finite course pages remain prebuilt. Data preparation still generates all runtime catalogs and job shards. The sitemap still advertises all canonical URLs; it no longer drives HTML generation.

## Job expiry and cache boundaries

Jobs expire exactly after 30 days from their original posting date. Middleware rejects expired job detail, alias, preview and image paths before Next can reuse their ISR content. Valid job responses have an HTTP shared-cache lifetime capped at the posting deadline, without stale-while-revalidate.

Listing pages need a second safeguard: one expired role must disappear from a cached multi-job HTML page. `content/job-age-page-scopes.json` records their expiry boundaries. The initial window uses the ordinary prebuilt/ISR page. At a relevant expiry, middleware rewrites to `/job-listing-cache/<window>/<original-path>`, an on-demand ISR route with an empty `generateStaticParams()`. Its cache key changes at the deadline, making the previous HTML unreachable. Direct requests to old windows return 410. Company pages use their own roles' deadlines; community includes every job that can enter its nine-row list as earlier rows expire, while ignoring never-visible rows. Directories and nomad pages use the catalog deadline set because their counts and related-company data also depend on it. Unrelated articles, lessons, glossary and event details retain normal ISR.

Raw job/company catalogs, job shards, description shards, feeds and sitemaps cannot be immutable build snapshots once a record expires. Their existing public URLs therefore return filtered responses on shared-cache misses. They are excluded from middleware and return `public, max-age=0, s-maxage=N, must-revalidate`, where `N` is at most 3600 seconds and ends before the earliest included posting deadline. `Date` and `Expires` preserve the absolute deadline across response transit; the final subsecond boundary uses `no-store`. No stale allowance is added.

[Firebase App Hosting cache documentation](https://firebase.google.com/docs/app-hosting/optimize-cache) states that routes affected by middleware bypass Cloud CDN. Thus HTML safety uses Next's server-side ISR cache; shared-CDN savings apply to the middleware-excluded catalog/feed/sitemap paths. This distinction is tested rather than treating a public header as proof of a CDN hit.

After the production build and postbuild, `npm run test:job-age:http` cold-starts the real standalone application on an ephemeral local port and also builds a small production-mode clock fixture using the real middleware, catalog handler and listing cache router. It verifies standalone policy files, bounded HTTP lifetimes, exact-boundary filtering, ISR hits before/after window rollover, expired 410s and unrelated article/course caching. The full production artifact must exist before running this check.

This applies to plain `npm run build`, Firebase App Hosting, Docker/Cloud Run, and OpenNext builds. No Docker-specific environment variable is needed to keep generation bounded.

The normal production build runs this check in `postbuild`. It can also be run directly after a build:

```bash
npm run test:prerender-budget
```

The check reads the actual Next.js prerender manifest, enforces a 300-route budget, checks that directory pages are static, and rejects bulk generation of detail pages or job redirects. Changing back to exhaustive generation will fail this check.

`Generating static pages` will still appear in build logs. Its total should be a small, fixed set of pages, not tens of thousands of catalog entries. Build/prebuild caches and this route budget solve different problems: restoring prepared JSON does not stop Next.js from rendering every URL returned by `generateStaticParams`.

For self-hosted Next.js, keep the standalone server's incremental cache writable. Each instance initially has a cold cache unless the hosting platform supplies a shared incremental cache. Do not set `dynamicParams = false` as a speed fix; that would turn unbuilt job, event, and article URLs into 404s.

**Catalog integrity (all page types):** detail pages must resolve from local catalogs inside `.next/standalone` (jobs, events, glossary, companies, articles, news, description shards, articles-data). They must not depend on opportunistic CDN fetches. Postbuild runs `copy-standalone-catalogs.ts` (including `public/logo`, `public/events`, `public/images`, and other static UI assets) and `test-standalone-public-assets.ts`. Deploy gates run `test-site-catalog-integrity.ts` so a missing catalog fails the build before rollout.
