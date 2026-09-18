# LinkedIn Integration Setup

Social posting uses env secrets — there is **no** production `/api/auth/linkedin/callback`.

## Required secrets

```env
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
LINKEDIN_ORG_ID=...
LINKEDIN_ACCESS_TOKEN=...   # long-lived / refreshed manually
```

Put the same values in GitHub Actions secrets and Cloudflare Worker secrets for `post-job-openings-social`.

## Getting / refreshing `LINKEDIN_ACCESS_TOKEN`

1. In the LinkedIn developer app, add a **localhost** redirect (e.g. `http://localhost:3000/linkedin-oauth` or any local page you control).
2. Set `LINKEDIN_REDIRECT_URI` to that localhost URL.
3. Open the auth URL from `getLinkedInAuthUrl()` in `src/lib/linkedin.ts`, approve, copy the `code` query param.
4. Exchange the code locally (Node one-liner or temporary script calling `getLinkedInAccessToken(code)`).
5. Save the token as `LINKEDIN_ACCESS_TOKEN` in secrets — do not commit it.

Posting uses `LINKEDIN_ACCESS_TOKEN` from the environment (`src/lib/linkedin.ts`). Firestore OAuth storage was removed with the callback route.

## Related

- Workflow: `.github/workflows/post-job-openings-social.yml`
- Threads: `scripts/social/auth-threads.ts` (localhost `:3001/auth`)
