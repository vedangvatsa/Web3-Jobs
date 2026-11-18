# Cloudflare deploy (OpenNext / real Next.js)

Production primary host is **Firebase App Hosting** (`hashtagweb3.com`). **Vercel is not used** (Git auto-deploy is off in `vercel.json`). Cloudflare runs the **same Next.js app** via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) (not a reverse proxy).

## URL

**https://hashtagweb3.vatsvedang.workers.dev**

## CI

Workflow: **Cloudflare Worker deploy**

1. `npm ci`
2. `npm run build:cloudflare` — hydrate gitignored `public/` catalogs, fast production `next build`, OpenNext bundle (`.open-next/`)
3. `wrangler deploy`

Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`

Token needs **Workers Scripts (Edit)**. Large apps usually need **Workers Paid** (compressed worker bundle limit ~10 MiB vs ~3 MiB on Free).

## Local

```bash
export CLOUDFLARE_API_TOKEN=…
export CLOUDFLARE_ACCOUNT_ID=eaff49c009e2f11471aa2dca4fe49abd
export OPENNEXT_CLOUDFLARE=1
npm run deploy:cloudflare
```

Firebase builds are unchanged: without `OPENNEXT_CLOUDFLARE=1`, `next.config.mjs` still uses `output: 'standalone'`.