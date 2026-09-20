# Static generation budget

The September 20 build generated 37,174 routes: approximately 8,265 root detail URLs, 28,757 job aliases/IDs, and the directory/tool/course pages. A Docker-only flag limited that work, but Firebase App Hosting uses buildpacks and did not set the flag.

The root detail route and `/jobs/[slug]` now return an empty `generateStaticParams()` array on every deployment target. The public detail route uses `dynamic = 'force-static'`, `dynamicParams = true`, and a one-hour revalidation interval. A detail page is server-rendered on its first request and cached; it remains available without having been built in advance. The first visitor to an uncached URL pays the rendering cost.

The homepage, job/event/news/company directories, tools, glossary categories, and the finite course pages remain prebuilt. Data preparation still generates all runtime catalogs and job shards. The sitemap still advertises all canonical URLs; it no longer drives HTML generation.

This applies to plain `npm run build`, Firebase App Hosting, Docker/Cloud Run, and OpenNext builds. No Docker-specific environment variable is needed to keep generation bounded.

The normal production build runs this check in `postbuild`. It can also be run directly after a build:

```bash
npm run test:prerender-budget
```

The check reads the actual Next.js prerender manifest, enforces a 300-route budget, checks that directory pages are static, and rejects bulk generation of detail pages or job redirects. Changing back to exhaustive generation will fail this check.

`Generating static pages` will still appear in build logs. Its total should be a small, fixed set of pages, not tens of thousands of catalog entries. Build/prebuild caches and this route budget solve different problems: restoring prepared JSON does not stop Next.js from rendering every URL returned by `generateStaticParams`.

For self-hosted Next.js, keep the standalone server's incremental cache writable. Each instance initially has a cold cache unless the hosting platform supplies a shared incremental cache. Do not set `dynamicParams = false` as a speed fix; that would turn unbuilt job, event, and article URLs into 404s.
