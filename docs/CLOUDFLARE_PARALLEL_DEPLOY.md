# Cloudflare parallel deploy (Workers Free)

Production stays on Firebase App Hosting. **Cloudflare Workers Free** provides a parallel URL that proxies to `https://hashtagweb3.com`.

## Live URL

**https://hashtagweb3.vatsvedang.workers.dev**

| Path | Behavior |
|------|----------|
| `/` | Redirect to `/jobs` on the same workers.dev host |
| Other paths | Proxied to the same path on `hashtagweb3.com` |

Responses include `x-hashtagweb3-mirror: cloudflare-workers`.

This is a **mirror**, not a second independent origin. If production is down, the mirror cannot serve a fresh build.

## GitHub Actions

Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` (account `eaff49c009e2f11471aa2dca4fe49abd`).

Token needs **Workers Scripts (Edit)** on that account.

```bash
gh workflow run "Cloudflare Worker deploy" -R vedangvatsa/Web3-Jobs
```

Pushes to `main` that touch `cloudflare/` or `wrangler.jsonc` also deploy automatically.

## Local deploy

```bash
export CLOUDFLARE_API_TOKEN=…
export CLOUDFLARE_ACCOUNT_ID=eaff49c009e2f11471aa2dca4fe49abd
npx wrangler@4 deploy
```

Use only the API token env vars (not an old global key from another Cloudflare account).