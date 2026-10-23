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

Form route: `scripts/publisher-forms-probe.mjs`, `scripts/publisher-forms-submit.mjs`, evidence under `.cache/publisher-expansion-2026-10-23/forms/`, receipts under `docs/publisher-outreach/form-*.json`.

Form outcomes on October 23 (submission is not approval or ingestion):

| Platform | Route | Status |
| --- | --- | --- |
| MediaFeed | `mediafeed.us/contact` | Submitted; CF7 confirmation "Thank you! Your submission has been received!" |
| OnTopList | blog directory join form | Submitted; landed on request-review URL with RSS feed field |
| PressReader | business contact form | Submit clicked; unconfirmed (embed form may still show) |
| Inoreader | contact form | Submit clicked; unconfirmed |
| AllTop | contact form | Site policy: "We do not add new sources" — rejected by policy; email target removed |
| SyndiGate | CF7 contact form | Failed (server-side "error trying to send your message") |
| CoinPaprika | contact form | Incomplete (review step did not expose final send in automation) |
| Ground News | contact-us | No standard publisher form (dropdown for other request types) |
| Way2News | contact page | No web form; lists `reach@way2news.com` |
| Newstex | site inspection | Email `support@newstex.com` remains the syndication network contact |

### Expansion email batch (11 targets)

Workflow runs: preview `39966225764`, send `39966412378`, first readback `39966664989`, delivery readback `39967145731`.

| Target | Recipient | Provider event |
| --- | --- | --- |
| ChainFeeds | contact@chainfeeds.xyz | delivered |
| CoinCarp | hello@coincarp.com | delivered |
| CoinCheckup | info@coincheckup.com | delivered |
| CoinCodex | info@coincodex.com | delivered |
| CoinLore | contact@coinlore.com | delivered |
| CryptoCompare | info@cryptocompare.com | delivered |
| Dow Jones | dje-support@dowjones.com | delivered (generic support; enterprise licensing likely needs sales) |
| LiveCoinWatch | contact@livecoinwatch.com | delivered |
| Newstex | support@newstex.com | delivered |
| Newswav | partner@newswav.com | delivered |
| Particle | partners@particle.news | bounced — do not resend; needs an alternate contact or form route |

Receipts: `docs/publisher-outreach/expansion-*-2026-10-23.json`.

Delivery of an inquiry email or a form POST does not mean a publisher account was approved, a feed was validated, or ingestion started.

## Technical reference

- [Google News sitemap requirements](https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap): last two days, original publication date, at most 1,000 news entries per file.
- [MSN feed requirements](https://support.microsoft.com/en-us/msn/partner-hub/msn-feed-setup-and-configuration): HTTPS RSS/Atom, full-content and item-level thumbnail requirements; platform validator required.
- [Apple publishing integration](https://developer.apple.com/news-publisher/): Apple News Format and Apple News API.
- [Resend email API](https://resend.com/docs/api-reference/emails/send-email): idempotency expires after 24 hours.
