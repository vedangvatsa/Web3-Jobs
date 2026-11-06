# News distribution and publisher enrollment

## Application details

User-provided publisher: **Hashtag Web3**, registered organization, **United States**.
Authorized correspondence address: **hi@hashtagweb3.com**, sent through Resend.
These details are for applications; account approval and legal agreements remain separate steps.

Publisher positioning: **a global Web3 community of 100,000+ professionals, knowledge publisher and original crypto/Web3 news publisher**. Use [the community profile](https://hashtagweb3.com/community) as the main introduction. Reusable application text is in `PUBLISHER_PROFILE.md`.

## Website delivery

The RSS feed and news sitemap were deployed in run `39921126214` on October 23, 2026. Live checks confirmed HTTP 200 for both: 100 RSS items and 34 recent news sitemap entries, including all seven articles from that day's recovered publication.

- `/news/feed.xml`: RSS 2.0 summaries of the latest 100 native News articles, canonical links, original dates, author and images. External syndicated headlines are excluded. Invalid dates and future articles are excluded.
- `/news/sitemap.xml`: Google News sitemap containing only native news published within the last 48 hours, with original dates and publication metadata. Advertised in robots.txt. Older articles remain discoverable through the main sitemap.
- News pages already emit `NewsArticle` JSON-LD. Native news metadata now permits large image previews.
- These endpoints refresh from the deployed article catalogue. New committed articles become available following the existing daily combined deployment. There is no additional deployment or platform push implicit in generating a feed.
- RSS summaries are not yet a full-content MSN or SmartFormat feed. Add target-specific bodies, media metadata, AI disclosure and confirmed image syndication rights after account/format requirements are established. Do not label a generic RSS endpoint as approved for every platform.

## Enrollment status and verified routes

Checked October 2026. No platform approval or active ingestion is established by this document.

| Platform | Route | Current state / next step |
| --- | --- | --- |
| Google News / Top stories | [Google guidance](https://support.google.com/news/publisher-center/answer/9607025?hl=en) | Automatic consideration through crawling. No submission guarantees inclusion. Verify Search Console ownership, submit the news sitemap after deployment, and inspect the Google News report. |
| Bing News | [Bing Webmaster Tools / PubHub](https://www.bing.com/webmasters/pubhub) | Authenticated webmaster account and site verification needed; no authenticated session available. |
| MSN | [Partner Hub](https://partnerhub.msn.com), [feed setup](https://support.microsoft.com/en-us/msn/partner-hub/how-to-set-up-rss-and-atom-feeds-in-msn-partner-hub) | Account/invitation, publisher review, agreement and feed validation required. Public portal rendered blank in this environment. Original inquiry and community-profile follow-up delivered to the official support address; application/approval still pending. |
| Flipboard | [Publisher signup](https://flipboard.com/publisher_signup), [official FAQ](https://about.flipboard.com/forpublishers/publisher-faq/) | Publisher profile and RSS review required. Signup returned CloudFront 403 from this environment. Complete account access, then submit the live feed for review. |
| SmartNews | [Publisher information](https://about.smartnews.com/en/press/publishers.html), [application](https://partner-portal.smartnews.com/publishers) | Application portal reports maintenance. Requires a validated SmartFormat feed and editorial acceptance. |
| Apple News | [News Publisher](https://www.icloud.com/newspublisher/), [eligibility](https://support.apple.com/en-in/guide/news-publisher/apde42330c66/icloud) | User-provided US organization satisfies the country category, subject to Apple's review. Apple Account sign-in, professional-publication review, agreements and Apple News Format/API integration are required. RSS alone is insufficient. |
| Yahoo | [Creators application](https://creators.yahoo.com/apply), [requirements](https://www.yahoocreators.com/faq) | Application redirects to Yahoo sign-in. Creator program is for qualifying US-resident individuals, with writing samples and at least 10,000 combined followers; it is not organization-wide RSS syndication. Need the appropriate publisher partnership path or an eligible individual. |
| NewsBreak | [Publisher program](https://publishers.newsbreak.com/), [application](https://mp.newsbreak.com/pss/signup) | Focuses on local US news outlets and full articles. Original inquiry and community-profile follow-up delivered; application/approval still pending. The signup page requires a contact's first/last name, email and password. |

## Correspondence

MSN and NewsBreak inquiries were sent on October 23, 2026 from `hi@hashtagweb3.com` through Resend. Both have a `delivered` provider event on subsequent readback. This confirms delivery only; no publisher acceptance has been received.

- [MSN send receipt workflow](https://github.com/vedangvatsa/Web3-Jobs/actions/runs/39909739436), [readback](https://github.com/vedangvatsa/Web3-Jobs/actions/runs/39911056391).
- [NewsBreak send receipt workflow](https://github.com/vedangvatsa/Web3-Jobs/actions/runs/39909742867), [readback](https://github.com/vedangvatsa/Web3-Jobs/actions/runs/39911060517).

`publisher-outreach.yml` is manual-only, defaults to preview, and has two fixed destinations: MSN's documented partner support and NewsBreak's documented publisher contact. It sends an onboarding inquiry, not an agreement or article syndication authorization. It does not resume subscriber broadcasts.

The `community-profile` message is a separately tracked follow-up with the updated positioning, `/community` introduction and now-live RSS URL. It requires a confirmed original inquiry, has its own immutable send claim, and cannot overwrite or resend the original correspondence.

Both community-profile follow-ups were confirmed **delivered** on October 23:

- MSN: [send](https://github.com/vedangvatsa/Web3-Jobs/actions/runs/39941390804), [delivery readback](https://github.com/vedangvatsa/Web3-Jobs/actions/runs/39941649920).
- NewsBreak: [send](https://github.com/vedangvatsa/Web3-Jobs/actions/runs/39941394959), [delivery readback](https://github.com/vedangvatsa/Web3-Jobs/actions/runs/39941654164).

The follow-ups lead with the 100,000+ professional Web3 community and its knowledge/news publishing, link to `/community` rather than `/about`, and provide the live RSS URL plus three native article samples. Neither message is a completed platform application or publisher approval.

Before any send, the script saves a durable GitHub receipt claim. A claimed request cannot be resent automatically, even after Resend's 24-hour idempotency expiry. Returned IDs are checkpointed and can be read back without a second send. Network ambiguity requires inspecting Resend. Receipt JSON under `docs/publisher-outreach/` and the workflow artifact are the evidence; an accepted email is not a publisher application approval.

Keep credentials out of source. Account sign-ins, verification challenges, publisher agreements and any tax/payment details must be completed using the owner's authorized accounts. Do not invent audience figures, staff bylines, addresses, or existing partner status.

## Expansion enrollment (October 23, 2026)

Target registry: `docs/publisher-expansion-targets.json` — platforms that **onboard external publishers or syndicate third-party feeds** (aggregators, syndication networks, feed directories, discovery apps). Peer news publishers are out of scope. Microsoft/MSN and NewsBreak are excluded because initial and community-profile inquiries were already delivered.

Outreach template (both `scripts/publisher-outreach.mjs` and `scripts/publisher-expansion.mjs`) now includes:

- Clickable HTML anchors for every website URL plus a plain-text alternative.
- Owner-provided reach figures: 55M job-post views last year, 26M LinkedIn views last month, 150k newsletter subscribers, 60k Telegram subscribers, weekly X Spaces with 20–40k live listeners (guests include a Pink Floyd band member, EY partners, the Father of Digital Twin, and a former Microsoft CSO), and event partnerships (Harvard Blockchain Conference, ETH Vietnam, Oxford Blockchain Conference, Token2049, Taipei Blockchain Week, ETH Oxford, Gitex, ETH Brussels).

Email route: `scripts/publisher-expansion.mjs` + `.github/workflows/publisher-expansion.yml` (`list` / `preview` / `send` / `readback`, optional target slug and limit, optional dry-run claim). Same immutable per-target CAS receipts under `docs/publisher-outreach/expansion-*.json`.

### Email outreach ledger

Seventy-eight inquiry emails were sent on October 23 from `hi@hashtagweb3.com` through Resend across three waves: **55 delivered, 21 bounced, 2 sent-pending** (readback-confirmed). Delivery is not approval, feed validation, or ingestion.

Delivered (55): Blockchair, Bundle, Cafeyn, Calameo, ChainFeeds, Coin360, CoinBureau (`info@`), CoinCarp, CoinCheckup, CoinCodex, CoinGecko (`support@`), CoinLore, CoinMarketCal, CoinMarketCap, CoinPaprika (`contact@`), Coinranking, CoinStats, Coinalyze, Coinigy, Coinglass, CryptoCompare, CryptoPanic, CryptoRank, CryptoSlate, Dailyhunt (`yourfriends@`), DappRadar, Dow Jones, EBSCO (`contact@`), Feedbin, Feedly, Flipboard (`partners@`), Flipster, Gale, Glassnode, Ground News, Gunosy, Inshorts, Joomag, Kaiko, LiveCoinWatch, Magzter, MediaFeed, Meltwater, Memeorandum, NewsBlur, NewsPicks, NewsPoint, Newstex, Newswav, Readly, Readwise, Scooper News, Scribd, SmartNews (`press@`), Way2News, Yumpu, Zinio.

Bounced (21, address invalid; do not resend without a verified address): Amberdata (`info@`), CoinAPI (`info@`), CoinBureau (`contact@`), CoinGecko (`info@`), Coinlib (`contact@` and `support@`), CoinPaprika (`partners@`), CoinSpectator (`info@` and `support@`), CryptoQuant (`support@`), Dailyhunt (`partners@`), EBSCO (`support@`), Flipboard (`publishers@`), Messari (`info@`), Nansen (`contact@`), Particle (`partners@`), SmartNews (`contact@`), Spinn3r (`info@` and `sales@`), Upday (`contact@` and `publishers@`).

Form route: `scripts/publisher-forms-probe.mjs`, `scripts/publisher-forms-submit.mjs`, evidence under `.cache/publisher-expansion-2026-10-23/forms/`, receipts under `docs/publisher-outreach/form-*.json`.

Form outcomes on October 23 (submission is not approval or ingestion):

Full per-platform form receipts: `docs/publisher-outreach/form-*-2026-10-23.json` and rollup `docs/publisher-outreach/form-submissions-2026-10-23.json` (31 platforms).

Confirmed form submissions on October 23 (still not approval):

- **MediaFeed** — CF7 confirmation "Thank you! Your submission has been received!"
- **OnTopList** — listing accepted to request-review URL with RSS feed field
- **CoinCarp** — `/submit/` form accepted
- **Newswav** — contact form "Thank you for your feedback!"

Submitted but unconfirmed (no explicit thank-you captured): PressReader, Inoreader, Inshorts, JioNews, Associated Press, NewsNow (partnership contact type POST observed).

Blocked or non-form routes: AllTop (policy: does not add new sources), SyndiGate (CF7 server error), CoinPaprika (review step), TipRanks (disabled submit), Crypto News (consent/submit disabled), Blogarama (login required), Cryptopanic (403), plus platforms with email-only or marketing-only pages (inkl, Feeder, The Old Reader, Ground News, Way2News, ProQuest, Reuters Connect, Squid, Issuu, FinancialContent, Content Catalyst, etc.).

Delivery of an inquiry email or a form POST does not mean a publisher account was approved, a feed was validated, or ingestion started.

## Expansion waves (November 4–5, 2026)

Registry grew 129 → 137 targets (100 with verified emails) from the news-aggregator harvest batches (batch 1: readers + PR wires; batch 2: aggregator cohort). Evidence: harvester page text in `.cache/publisher-expansion-2026-10-23/verified-emails*.json` (+ `verified-emails-b2-aggregators.json`).

Wave of November 4 (run 41813689186-era send, readback 41815355204 then 41987798491):

- **Delivered (11/11):** Feedspot (`team@`), Business Wire (`info@`), GlobeNewswire (`support@`), OpenPR (`service@`), Newswire (`sales@`), Cision (`support@`), DappRadar partnerships (`partnerships@`), DefiLlama (`support@`), Dune (`support@`), CryptoPanic sources (`sources@`), CoinStats sales (`sales@`).

Wave of November 5 (send run 41987599171, readback 41987798491): 9 targets, 8 delivered / 1 bounced.

- **Delivered (8):** Inoreader (`support@inoreader.com`), Feeder (`support@feeder.co`), PR Underground (`help@prunderground.com`), ClickPress (`editor@clickpress.com`), 1888 Press Release (`support_team@1888pressrelease.com`), PR Fire (`hello@prfire.com`), Dubai PRNetwork (`editor@dubaiprnetwork.com`), MindStick (`submit.article@mindstick.com`).
- **Bounced (1):** NewsWhip (`research@newswhip.com`) — on-page-verified but invalid; no alternative route published; do not resend without a distinct verified address.
- **Added as excluded, never sent:** Techmeme (about pages expose only advertising routes — sponsor@, events@, my.podcast@ — no publisher-onboarding channel), KenyanWallstreet (peer news publisher, out of scope).
- **No verifiable email published:** Worldnews (wn.com), Feed43, Netvibes, SmartNews contact/media retries, Webrazzi.

Running totals after both waves: **101 receipts, 74 confirmed delivered, 22 bounced** (+3 stale `claimed` receipts held and never dispatched: BazQux, AllSides (feedback), The Old Reader — never sent; pending an explicit release decision).

Receipt files: `docs/publisher-outreach/expansion-*-2026-10-23.json` (filename date stamp is the registry batch id; Nov 4/5 sends share it).

## Inbound reply wave (November 6, 2026)

Screened the 1,531 received emails in the Resend receiving mailboxes (`received-emails-inventory-2026-11-05.json`): 10 threads respond to our outreach or ask onboarding questions; all landed in `hi@hashtagweb3.com`. Full reads via `resend-email-reply.mjs` batch-lookup (run 42130378223). Replies threaded with `In-Reply-To`/`References` from the receiving mailbox; receipts `docs/publisher-outreach/reply-thread-<id8>-2026-11-06.json`.

Replies sent (7, accepted by Resend):

| Thread | Resend send id | Answer |
|---|---|---|
| Cision `Support.CisionOne@cision.com` (`dac2dda7…`) | `01a1b065-0b8a…` | Wants **both** CisionOne-stream publication (primary) and media-database inclusion; supplied specs, reach, AI-disclosure willingness. |
| CoinCheckup `info@coincheckup.com` (`67f92a25…`) | `01a1b065-88cc…` | Proposal is **free syndication**, no paid licensing from them; open to reviewing their standard terms. |
| CoinCarp `info@coincarp.com` (`52c41f62…`) | `01a1b066-1945…` | Supplied their review checklist: attribution, canonical links, feed spec, rights, AI disclosure, contract willingness. |
| CoinCodex `info@coincodex.com` (`52c0cabe…`) | `01a1b066-a95f…` | Compact review package for the team they forwarded to. |
| Readly `support@readly.com` (`c76f9412…`) | `01a1b06d-031b…` | Confirmed filling their publishers form; supplied package. |
| NewsPicks `support@newspicks.zendesk.com` (`6491991f…`) | `01a1b06d-acc4…` | Japanese reply confirming their 編成許諾申請フォーム submission. |
| NewsBreak `publishers@newsbreak.com` (`2bc42eff…`) | `01a1b06e-3d81…` | Confirmed proceeding via mp.newsbreak.com/pss/signup registration; sent press kit. |

Runs: 42202597536 / 42202674028 / 42202749286 / 42202824048 (first four — the sends were accepted; only the final receipt write failed with GitHub 422 because the blob sha was missing; receipts were corrected locally from the Actions logs) and 42203716107 / 42203801788 / 42203886542 (last three, receipts written in-run). Script fixes in `scripts/resend-email-reply.mjs`: final write now supplies the blob sha, and the reply subject is used verbatim so helpdesk prefixes like `[Readly]` / `[NewsPicks サポート] 返信:` are preserved.

Threads read and deliberately **not** replied to:

- CoinGecko (`fd8aef54…`) — declined our proposal; no reply, no nagging.
- Dailyhunt (`cc9fb6c3…`) — Freshdesk auto-acknowledgment only, no question asked.
- NoonLaunch (`59e868bc…`) — product-launch-directory marketing, not job/news/event feed inclusion; a possible `Stop` reply is pending a user decision.
- NewsBreak's older thread (`67673f8c…`, community-profile reel) is superseded by the newer `2bc42eff…` application thread.

Form follow-ups started on November 6 (receipts `form-readly-2026-11-06.json`, `form-newspicks-2026-11-06.json`):

- **Readly** `se.readly.com/publishers_info`: every field filled truthfully in-browser (incl. Gratis magazine availability, B2C type, reach + AI-workflow note), stopped at two items only the user can resolve: the required country dropdown has **no United States option** (European/British-Isles only — won't state a false registration country) and a reCAPTCHA v2. If no country fits our legal registration, follow up in the Readly thread asking the correct route for non-EU/EEA publishers instead of submitting.
- **NewsPicks** `forms.gle/xcDNsPDA7tw28VW46` (= 編成許諾申請フォーム): field entry IDs mapped from `FB_PUBLIC_LOAD_DATA_`, all values prepared, direct formResponse POST rejected with `data-captcha-challenge-failed=true` (reCAPTCHA enforced, nothing submitted), so a **prefilled viewform URL** is open in the browser; user completes 3 radios + captcha + Submit.
- **NewsBreak** registration at `mp.newsbreak.com/pss/signup`: **account created and email activated on November 6** (first name Alex, last name HashtagWeb3, hi@hashtagweb3.com, generated password held locally in `.cache/newsbreak-password.txt`, never committed; confirmation email `welcome@newsbreakapp.me` id `7b75120c…` → activation link `mp.newsbreak.com/pss/activate-email?active_code=…` opened: "email has been activated"). Platform sign-in at `/pss/signin` returned a server error at completion time, so signing in and finishing the application remain a next step.

#### Stale claim release (November 6, 2026)

The user approved re-dispatching the three held claims via verified routes. Stale claim receipts were archived as `expansion-<slug>-2026-11-06-released-stale-claim.json`, the old receipt paths were cleared so fresh claims could be written, and the three sends are `accepted_by_resend`:

| Target | Route verified | Resend id |
|---|---|---|
| BazQux | hello@bazqux.com (bazqux.com footer mailto) | `01a1b085-59d7…` |
| AllSides (feedback) | feedback@allsides.com (decoded mailto on allsides.com/contact; same address the stale claim targeted — never dispatched, so no duplicate) | `01a1b087-75c6…` |
| The Old Reader | hello@theoldreader.com (theoldreader.com/en/tos; registry's support@theoldreader.com route marked superseded) | `01a1b085-dbf8…` |

+3 fresh campaign sends accepted by Resend; delivery readbacks pending like the rest of the expansion waves.

Delivery of these replies/form responses does not itself mean database/stream/catalog inclusion was granted; each thread keeps its own acceptance step.

## Technical reference

- [Google News sitemap requirements](https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap): last two days, original publication date, at most 1,000 news entries per file.
- [MSN feed requirements](https://support.microsoft.com/en-us/msn/partner-hub/msn-feed-setup-and-configuration): HTTPS RSS/Atom, full-content and item-level thumbnail requirements; platform validator required.
- [Apple publishing integration](https://developer.apple.com/news-publisher/): Apple News Format and Apple News API.
- [Resend email API](https://resend.com/docs/api-reference/emails/send-email): idempotency expires after 24 hours.
