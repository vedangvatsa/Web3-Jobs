# Country-local crypto employers

## Expanded CSV follow-up

The subsequent [548-row audit](HIRING_LINKS_548_AUDIT.md) added **35 more employer sources** across **20 country associations**: **2 recurring feeds** and **33 careers-only monitors**. The registry now contains **46 employers** (**5 recurring**, **41 careers-only**). That follow-up added no eligible jobs; the 1,708-job catalog and earlier Bit2Me `/cmp117` record remained unchanged. The results below describe the earlier 11-employer pass, not the current registry total.

Final combined validation subsequently regenerated the catalog to **1,707 jobs** after Flow Traders `/tr3` legitimately crossed the 30-day age boundary. Bit2Me `/cmp117` remains unchanged and eligible. See `content/sources/hiring-links-548-final-verification.json` for the current verification snapshot; the earlier pass counts below are historical.

Verified 2026-10-14T10:59:52.012Z in the durable country-expansion worktree. **11 new employers in 11 countries**, **3 recurring feeds**, **8 careers-only monitors**. Reviewed 13 employers; NDAX and Bitso were already configured.

Final cache and runtime: **1711 -> 1708 jobs**, **1 added**, **4 expired during normal runtime regeneration**, net **-3**. The scoped importer itself removed zero jobs. Earlier temporary-worktree work is unavailable, not restored, and receives no credit in these totals.

Countries describe the sourced operating market, office, registered office or headquarters below. They do not describe every job location.

| Country and relationship | Company | Official careers | ATS / monitoring destination | Status | Imported |
|---|---|---|---|---|---|
| Finland (operating-market) | Coinmotion | [Official](<https://www.coinmotion.com/careers/>) | [teamtailor](<https://careers.coinmotion.com/>) | recurring | 0 |
| Philippines (operating-market) | PDAX | [Official](<https://pdax.ph/careers/>) | [darwinbox](<https://pdax.darwinbox.com/ms/candidate/careers>) | careers-only | 0 |
| Brazil (office) | Foxbit | [Official](<https://foxbit.com.br/carreira>) | [inhire](<https://foxbit.com.br/carreira>) | careers-only | 0 |
| Germany (registered-office) | Finoa | [Official](<https://www.finoa.io/careers>) | [personio](<https://finoa.jobs.personio.com/>) | careers-only | 0 |
| Switzerland (regulated-market) | Taurus | [Official](<https://www.taurushq.com/careers/>) | [join](<https://join.com/companies/taurusgroup>) | careers-only | 0 |
| Taiwan (operating-market) | XREX | [Official](<https://xrex.io/careers>) | [breezy](<https://xrex.breezy.hr/>) | recurring | 0 |
| Netherlands (headquarters) | Finst | [Official](<https://finst.com/en>) | [welcomekit](<https://finst.welcomekit.co/>) | careers-only | 0 |
| Nigeria (operating-market) | Breet | [Official](<https://breet.io/career>) | [zoho](<https://breet.io/career>) | careers-only | 0 |
| Spain (operating-market) | Bit2Me | [Official](<https://bit2me.com/>) | [bizneo](<https://empleo.bit2me.com/jobs>) | recurring | 1 |
| Kenya (office) | HoneyCoin | [Official](<https://honeycoin.app/>) | [hibob](<https://honeycoin.careers.hibob.com/>) | careers-only | 0 |
| South Korea (office) | Dunamu | [Official](<https://www.dunamu.com/careers/jobs>) | [first-party](<https://careers.dunamu.com/>) | careers-only | 0 |

## Imported vacancy
- [Legal, Compliance & Operations Intern- Bit2Me STX](<https://empleo.bit2me.com/jobs/legal-compliance-operations-intern-bit2me-stx>), original date **2026-10-05T14:04:37+02:00**, site route **/cmp117**. The import report records separate successful primary and job-bound application GETs, timestamps and SHA-256 hashes.

## Source decisions
- **Coinmotion:** No matching jobs on official board; empty RSS confirmed. Connect is not a vacancy.
- **PDAX:** Official Darwinbox board is a client-rendered shell. Original vacancy dates not verified.
- **Foxbit:** Official careers page and InHire outbound verified. SRE card links to # and is not an application. No original-date adapter.
- **Finoa:** Five Personio listings observed, but original dates and applications not verified. Current homepage describes technology infrastructure, not a licensed CASP.
- **Taurus:** Four JOIN listings observed; no original-date/application adapter. Swiss market does not label Cyprus vacancies as Swiss.
- **XREX:** Official Next.js careers redirect points to Breezy. Primary dates, not API update dates, determine eligibility.
- **Finst:** Board explicitly reports no job openings. Spontaneous application excluded.
- **Breet:** Official careers source monitored. Linked Zoho board GET timed out; no claim of verified active vacancies.
- **Bit2Me:** Custom-domain Bizneo board. Only original JobPosting dates and exact-job GET forms can qualify.
- **HoneyCoin:** Official site lists a Nairobi office. HiBob shell does not establish active vacancies or original dates.
- **Dunamu:** Seoul office (native Korean evidence). Upbit operator also has securities products. Talent pools excluded; no job-date adapter.
- **NDAX:** Workable ndax is already in refresh-jobs-cache.ts. Not a new employer.
- **Bitso:** Existing Greenhouse bitso configuration. Corporate page now embeds BambooHR. Mexico is a research lead, not established from this careers page; no new employer or geography claim.

## Daily operation
- `.github/workflows/refresh-jobs-ingest.yml` runs `scripts/ingest-country-local-crypto.ts` and uploads its report as an artifact. No deployment was performed.
- The importer rechecks official outbound links and destinations on every run. Careers-only entries report null fetched/eligible counts. They cannot enter the job importer.
- Coinmotion uses Teamtailor RSS cross-checked against its paginated HTML index. XREX reuses the existing Breezy original-date verifier. Bit2Me uses source JobPosting timestamps and the exact-job Bizneo application fragment.
- The scoped importer is additive and leaves existing records unchanged. Malformed or incomplete feeds fail closed. The normal runtime generator invokes the existing retirement policy; its separate expiries are listed below.
- Requests are sequential public HTTPS GETs, with response/deadline limits and Retry-After delays. No social interactions, account creation, contact forms, application submission or provider writes.

## Separate runtime expiries
- /cc6: 1inch, Corporate Counsel. Original date 2026-09-14T10:19:59.607Z; expired.
- /ops6: Stripe, GTM Strategy & Operations Analyst. Original date 2026-09-14T06:02:54-04:00; expired.
- /pm7: Ripple, Product Operations Specialist. Original date 2026-09-14T05:56:26-04:00; expired.
- /sls8: ComplyAdvantage, Manager- Business Development. Original date 2026-09-14T04:25:32-04:00; expired.

## Evidence
- `content/country-local-crypto-sources.json`: registry with official ownership, crypto-product and geography quotes plus dates and hashes.
- `content/sources/country-local-crypto-discovery.json`: independent baseline, new-versus-covered counts, limitations and imported jobs.
- `content/sources/country-local-import.json`: live ownership, feed, original-date and application results.
- `.cache/country-local-crypto/`: ignored raw captures, immutable body-hash captures and the pre-import baseline.

No commit, push or deployment. The original `/Users/vedang/ZCodeProject/Web3-Jobs` worktree was not edited.

## Validation completed

- `npx tsc --project tsconfig.country-local.json`: passed.
- `npx tsx --test scripts/test-country-local-crypto.ts`: 4 tests passed, covering current ownership, original dates, pagination failure and exact-job application forms.
- `npm run test:job-age`: 19 tests passed.
- `npx tsx scripts/report-country-local-crypto.ts`: passed after the build. Verified unchanged surviving baseline records, unchanged prior date history and protected policy files, and matching raw evidence hashes.
- `npm run build` under Node 24: full prebuild, production build and postbuild passed. Generated 127 pages; standalone asset checks, prerender budget and feed compression passed. Normal prebuild generated catalog, event, sitemap and preview outputs in this worktree.
- `git diff --check`: passed.
