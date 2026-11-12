# Security Policy — Hashtag Web3

## Reporting Security Issues

Please report security vulnerabilities to **hello@hashtagweb3.com** or via Telegram **@web3jobs_rep**.

We aim to acknowledge reports within 48 hours and provide a preliminary assessment within 5 business days.

## Scope

This policy covers:
- hashtagweb3.com and all subdomains
- Static JSON catalogs under `/data/*`
- Public preview shells under `/preview/*`
- Agent discovery endpoints under `/.well-known/*`

## Out of Scope

- Third-party job application sites (Greenhouse, Lever, Ashby, etc.) — we link to employer career pages only
- External event registration sites (Luma, Eventbrite, etc.)
- Content from aggregated news RSS feeds

## Content Safety

Hashtag Web3 is a **Web3 job board and educational platform**. Our content includes:

1. **Job listings** — Aggregated from verified employer career pages (ATS: Greenhouse, Lever, Ashby, Workday, etc.). We sanitize all HTML via `sanitize-html` library, stripping tracking codes, corrupted markup, and ATS artifacts.

2. **Educational articles** — Technical guides on Web3 topics including wallet security, seed phrases, private keys, smart contract vulnerabilities, and scam awareness. These are **educational/reporting content**, not promotion of malicious activity.

3. **Event listings** — Web3 conferences, hackathons, meetups. Some workshops mention "install wallet" for testnet/educational purposes.

4. **News aggregation** — RSS feeds from reputable crypto publications (CoinDesk, CoinTelegraph, The Block, etc.) reporting on industry events including security incidents.

## Automated Filtering

- **Job source policy** (`job-source-policy.ts`): Rejects known misattributed ATS boards and employer impersonation
- **HTML sanitization** (`sanitize-html.ts`): Strips `data-*` attributes, tracking pixels, corrupted Slack/Greenhouse markup
- **Content classification**: Pages with security keywords (seed phrase, private key, scam, phish) are educational/reporting in nature

## No User-Generated Content

- No user registration, login, or accounts
- No file uploads
- No comment systems
- No wallet connections or transaction signing
- Contact form uses `mailto:` only (client-side)

## Security Headers

- CSP with `frame-ancestors`, `form-action`, `base-uri` restrictions
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- HSTS with preload

## Third-Party Services (Allowed in CSP)

- Google Analytics / Tag Manager
- PostHog (analytics)
- Microsoft Clarity (analytics)
- Ashby, Greenhouse, Lever APIs (job data fetching at build time only)
- Carto basemaps (nomads feature)

## Hall of Fame

Security researchers who responsibly disclose valid issues are acknowledged at `/hall-of-fame` (TBD).

---

*Last updated: 2026-11-12*