# Safe Browsing "Social Engineering" Flag — Investigation & Review Package

**Date:** 2026-11-12
**Site:** https://hashtagweb3.com (Firebase App Hosting, 35.219.200.9)
**Report:** Google Search Console email — "Social engineering content detected", sample URL `http://hashtagweb3[.]com/`
**Browser impact:** Chrome "Deceptive Website Warning", Brave "Dangerous site … recently found phishing" (full registrable domain)

## 1. Investigation scope (all checks performed 2026-11-12)

Every check below ran against the **live production site** and the **current repo** (`main` @ `c867e55156`).

### Served content
- **Homepage HTML (208 KB):** 59 inline scripts, all same-origin Next.js flight data. **0 external scripts, 0 iframes, 0 forms.**
- **No cloaking:** homepage response with a Chrome UA vs. Googlebot UA is **byte-identical**; `http://` is a plain 301 → `https://`.
- **All 25 live Next.js JS chunks (1.3 MB):** only React/Next internals (`Function(`, `atob(`, `fromCharCode` in framework code). **No suspicious external origins, no drainer/phishing strings, no wallet-connect code.**
- **240+ URLs crawled (40-URL sample + 200-URL deep crawl biased to job/event/article pages):** **0 offsite redirects, 0 external `<script>`, 0 iframes, 0 password inputs, 0 meta-refresh redirects.** All phrase hits (18 URLs) are legitimate editorial content: glossary wallet-security articles discussing seed phrases, "pay with" in salary/compensation text, a news article reporting on a Binance airdrop (`/spacexstake` — reporting *about* a scam, not running one).
- **Rendered DOM (live browser, JS executed):** `/`, `/jobs`, `/contact`, `/community`, `/developers`, `/login`, `/signin`, job detail pages. External origins are exactly the analytics/CDN allowlist below. No popups, overlays, dialogs, `input[type=password]`, service workers, or notification permission prompts. No delayed-injection popups across repeated post-load checks.
- **`public/preview/*.html` (6,297 static OG/preview files):** 0 malicious scripts/redirects; 107 regex hits all false positives (markdown-style links inside event descriptions, glossary terms).
- **Sitemap (4,034 URLs):** all `hashtagweb3.com`. Job apply links point to legitimate ATS domains (ashbyhq, greenhouse, lever, workable, workday, breezy, recruitee, smartrecruiters, …). Event registration links point to official event sites (luma.com, meetup, eventbrite, official conference domains). One `mailto:` application link (`ckba-payment-channel-team-lead`) — benign.
- **No open redirects:** no route reads a destination URL from query params; `next.config.mjs` rewrites/redirects are all internal; `content/image-redirects.json` (113 entries) has no external destinations; `/api/email/unsubscribe` is token-verified and returns plain text.

### Infrastructure
- **DNS:** apex + `www` → 35.219.200.9 (Firebase App Hosting). Registrar nameservers, AWS SES MX only. **No stray subdomains, no dangling CNAME, no subdomain-takeover surface.**
- **Wayback Machine:** Oct 1–16 homepage captures clean (225 KB, correct title, no external JS beyond archive.org's own injection).
- **Deploy pipeline:** live build matches the current repo (recently added slugs resolve live), i.e. the deployed bundle is the reviewed code.

### Third-party inventory (complete, from rendered DOM + network)
| Service | Origin | Purpose |
|---|---|---|
| Google Tag Manager / GA4 | `www.googletagmanager.com`, `www.google-analytics.com` | analytics (`G-FYBLPS87X0`) |
| Microsoft Clarity | `scripts.clarity.ms`, `c.clarity.ms`, `www.clarity.ms` | session analytics (`yc68wsif01`) |
| PostHog | `us.i.posthog.com`, `us-assets.i.posthog.com` | product analytics |
| Unsplash | `images.unsplash.com` | stock images |
| gstatic | `t0.gstatic.com` | favicon |

Nothing else. No ad networks, no crypto widgets, no external forms.

## 2. Conclusion

**No deceptive, phishing, or social-engineering content was found anywhere on the site — served HTML, rendered DOM, JS bundles, static files, sitemap, or DNS.** The site's topical content (Web3 jobs, wallet-security education, airdrop news coverage) overlaps with vocabulary common to real phishing kits, which is a plausible trigger for a classifier false positive.

## 3. Hardening applied (2026-11-12)

- **PostHog:** surveys and web experiments are the only PostHog features that render page content from the analytics dashboard. The site never uses them; they are now disabled client-side in `src/lib/posthog.ts` (`disable_surveys`, `disable_surveys_autosend`, `disable_web_experiments`) so the analytics account is fully out of the page content path.

## 4. Remaining checklist before requesting review

1. **Search Console → Security Issues report** — capture the full sample URL list and the exact issue categories; attach to this doc.
2. **PostHog dashboard** — check Surveys / Feature Flags / Web Experiments tabs for anything unexpected; confirm no unknown admin members.
3. **Clarity (`yc68wsif01`) and GA4 (`G-FYBLPS87X0`)** — confirm no unknown admins/users; these accounts can run scripts site-wide if compromised.
4. **Firebase hosting release history** — verify no deployments outside this repo's CI (Firebase console → Hosting, or `gcloud firebase hosting:releases list` for project `web3-jobs-aggregator`).
5. **Rotate** analytics write keys and Firebase deploy tokens if anything above looks off.
6. **Request a review** in Search Console once 1–5 are confirmed, referencing this document.
