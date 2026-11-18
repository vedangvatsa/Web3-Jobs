# Cloudflare parallel deploy (Hashtag Web3)

## Workers URL

After a successful GitHub Actions run:

- **Mirror (Workers Free):** `https://hashtagweb3.vatsvedang.workers.dev` proxies to `https://hashtagweb3.com` (use when the account is not on Workers Paid).
- **Full container (Workers Paid):** same URL, but the Next.js standalone app runs inside a Cloudflare Container (independent of Firebase).

## Enable the full container

1. Upgrade the Cloudflare account to [**Workers Paid**](https://dash.cloudflare.com/?to=/:account/workers/plans) (`eaff49c009e2f11471aa2dca4fe49abd`).
2. Create an API token with **Workers Scripts (Edit)** and **Containers (Edit)**.
3. Set GitHub secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
4. Run **Actions → Cloudflare container deploy**. The workflow detects container access and runs `wrangler deploy` (Docker image) instead of the mirror Worker.

## Manual trigger

```bash
gh workflow run "Cloudflare container deploy" -R vedangvatsa/Web3-Jobs
```