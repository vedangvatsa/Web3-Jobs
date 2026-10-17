# Devcon side-events sheet: event catalogue coverage

Audit: 2026-10-16T23:53:53.671Z. Workbook capture: 2026-10-16T23:14:08.292Z.

**Not all events in the sheet are added.** This report checks event identities and current event-catalogue records; employer coverage is not used.

## Totals

All **8 tabs**, **168 exported rows**: **152 event occurrences**, **8 headers**, **8 promotional rows**. The occurrences resolve to **74 canonical groups** and **78 repeated/variant occurrences** (73 exact full-cell repeats plus five retained variations). All tab CSVs were checked against the public XLSX.

| Presence in the local catalogue | Canonical groups | Sheet occurrences |
|---|---:|---:|
| runtime | 62 | 127 |
| source-only | 2 | 4 |
| absent | 10 | 21 |

Runtime coverage comprises **60 standalone event groups + 2 explicitly described embedded programs**, mapping to **61 distinct runtime event records**. Embedded programs are the Devcon Community Hubs umbrella and Unchained Pitch Challenge; these are not separate standalone listings.

Independently: **10 groups are held/review-constrained** (6 absent, 2 runtime, 2 source-only), **0 ended**, **1 private primary**, **0 registration-closed**. Held counts overlap presence counts.

| Mutually exclusive audit disposition | Groups | Occurrences |
|---|---:|---:|
| covered-runtime | 60 | 123 |
| source-only | 0 | 0 |
| held | 10 | 21 |
| ended | 0 | 0 |
| missing | 4 | 8 |

Inventory: **2234 source records across 8 feeds**, **222 local runtime events**. The local public runtime mirror is byte-identical. Public deployed snapshot: **218 events**, with **62 sheet groups represented**. Presence checks do not certify unresolved times or registration availability.

## Public events missing from both source and runtime

| Event | Primary identity / link | Confirmed local schedule |
|---|---|---|
| NEAR Builder's Cafe #2 | [evt-ZwfO8bu83v1Qqe8](https://luma.com/ijy8hzbj) | 31 Oct 2026, 18:00 → 31 Oct 2026, 21:00 (Asia/Kolkata) |
| P2P Networking Hub @ Devcon 8 (Devcon ticket needed) | [evt-jHFnev6fVW7VZNJ](https://luma.com/cz51ibrc) | 3 Nov 2026, 09:00 → 6 Nov 2026, 15:00 (Asia/Kolkata) |
| Zypherpunks Dinner @ Devcon | [evt-Mr3xwAWeAXMdGam](https://luma.com/jlisaxzz) | 3 Nov 2026, 19:00 → 3 Nov 2026, 23:00 (Asia/Kolkata) |
| Logos Circle Mumbai: Run Club (6:30am, Marine Drive) | [evt-n7ByAuH2ZtA86Jf](https://luma.com/iumnt6zf) | 4 Nov 2026, 06:30 → 4 Nov 2026, 09:00 (Asia/Kolkata) |

These primary pages were freshly checked. No event was imported. Hidden venues and approval/ticket conditions remain protected. The September “NEAR Builders Cafe: Roast My Repo” is a different, ended event and is not a match for Cafe #2.

## Held / review-constrained events

| Event | Catalogue presence | Why held |
|---|---|---|
| [Bittensor Builders House (Chondhi, near Alibaug)](https://luma.com/bittensor-hh) | absent | Existing Devcon review holds Bittensor Builders House: organizer description says October 27–31, while structured metadata ends November 1 at 10:00 IST. Fresh public GET confirms that structured end. No source/runtime record is present; retain the hold rather than choose a checkout explanation. |
| [IBW 2026 Pre-Conference VIP Night (announced, RSVP TBA)](https://indiablockchainweek.com/) | runtime · [route](https://hashtagweb3.com/ibw-pre-conference-vip-night) | The exact VIP Night record exists at /ibw-pre-conference-vip-night. The shared IBW homepage is not event-specific proof. The earlier calendar starts at 17:00 IST while the protected organizer-sheet record says 19:00–23:00. Runtime presence is counted independently; the unresolved clock hold is retained. Conference and after-party records are rejected as URL-only collisions. |
| [The Dream House: Devcon Mumbai Residency](https://devconbuddy.me/events) | absent | The Dream House is named in the prior backlog's held list. The supplied Devcon Buddy URL is a general directory: the current public response exposes no exact Dream House event record, dates or registration identity. No runtime/source match is established and no time is inferred from the sheet. |
| [Crypto Mondays: Devcon India Edition](https://luma.com/9bhu9f28) | source-only | An exact source-only record exists with publicationStatus=needs-review. Structured times are 19:30–23:00 IST, but the organizer agenda says 18:00–21:30. The secondary incoming duplicate is not a published event. |
| [House of HYPE (Khar)](https://luma.com/x6m1zvfh) | absent | Fresh ordinary GET identifies House of HYPE as Luma evt-4BPahiHsZbnPfhz with visibility=private. No exact source/runtime record was found. Keep only public identity/visibility evidence; do not import or publish private program/venue metadata. |
| [Open House by lil room (builders & founders)](https://luma.com/gjfpaw4r) | absent | No source/runtime record is present. The earlier review holds Open House because the structured schedule ends 19:30 IST, while organizer copy and the indicative closing-party agenda end 22:00. Fresh GET still returns the 19:30 structured end; no time is selected. |
| [Biggest CT G.A.Y Party](https://luma.com/ena53peq) | source-only | Exact source-only record is marked needs-review. Structured schedule is November 5–6, while organizer description says December 6. Incoming duplicate source rows do not constitute runtime coverage. |
| [NEAR × Quantus Networking Mixer @ Devcon Mumbai](https://luma.com/xuofsg0p) | runtime · [route](https://hashtagweb3.com/near-quantus-happy-hour) | Exact runtime record exists. Primary currently says November 5, 17:30–20:30 IST; protected reviewed runtime says 18:00–21:00. The previous hold is retained without overwriting protected times. |
| [Seer × Kleros side event (announced, RSVP TBA)](https://x.com/seer_pm) | absent | Sheet says TBA and links a Seer social profile, not a dated event. The existing backlog review keeps Seer x Kleros held. Current public profile retrieval supplies no exact event-specific registration/date identity; no source/runtime record was established. |
| [ZK Real World Summit @ Devcon Mumbai (announced, RSVP TBA)](https://x.com/zk_monk) | absent | Public zkMonk profile contains a Devcon Mumbai 2026 summit announcement, but the sheet date and RSVP remain TBA. The prior backlog hold is retained; no dated source/runtime event was established. |

“Absent” does not necessarily mean an importable omission: private events, undated announcements and conflicting schedules remain held. “Source-only” does not mean published. Closed registrations, ended records and tombstones were not restored or removed.

## Identity and duplicate checks

- TokenIQ’s two older calendar days map to one two-day event. Institutional Forum, Future Asset Forum, ETHGlobal Mumbai and Unchained Summit day occurrences likewise map to one event each.
- The IBW conference, VIP night and official after-party share a homepage but are distinct events. Each was matched to its explicit source ID and date; the shared URL never supplies blanket coverage.
- Monad Blitz’s renamed `Blitz-Mumbai-Devcon-2026` link matches the verified Luma ID behind `india-luma-qk93a446`; its midnight end explains the two calendar dates.
- Afterhours Mixer maps to the existing rescheduled Ravecon identity. MONEY MAKER is independently matched by its own Luma ID, not confused with ETHGlobal Mumbai.
- Unchained Pitch Challenge is already described inside `/unchained-summit`. Its October 25/30 application-deadline conflict remains documented. The umbrella Community Hubs program is described inside `/devcon`; that does not cover the missing named P2P Networking Hub.
- Pragma is already present on November 6, which agrees with this sheet. The older calendar’s November 4 conflict is recorded separately, not automatically transferred to the sheet row. The exact primary page still returns HTTP 500; no date or cancellation is invented.
- EIP Hub’s documented clock differences remain visible. Protected NEAR × Quantus hours and the ShanHaiWoo Mumbai component dates are not overwritten.

Timing for the sheet-specific event/component: 1 ongoing, 69 upcoming, 4 unknown. The wider ShanHaiWoo primary is ongoing, but the sheet's Mumbai component is upcoming; those scopes are not conflated.

ShanHaiWoo is covered for the actual sheet scope: **November 1–6 Mumbai extension**, confirmed in the organizer body and matching the existing date-only record. The older calendar reviewed the wider October 15–November 10 GBA program, so its whole-program hold is not transferred to this component. Mumbai clocks, venue and event-specific registration remain unannounced.

## Comparison with the previous 83-row / 77-identity review

The actual prior ledger was parsed: **83 rows / 77 identities**. This sheet overlaps **68 prior rows / 62 prior identities**, across **62 sheet groups**. **12 sheet groups are outside that exact ledger**. Parent-program context is reported separately. Its old “61 covered identities” result was not reused as the answer for this workbook.

The prior calendar contains **3 ended entries outside this sheet**, and a different private event; none is restored or counted as a new sheet omission.

## All 74 canonical groups

| Sheet group | Event | Presence / review | Catalogue route |
|---|---|---|---|
| 0:3 | [Edge City India 2026 (pop-up village)](https://www.edgecity.live/india26) | runtime / covered-runtime | [/edge-city-india-village](https://hashtagweb3.com/edge-city-india-village) |
| 0:4 | [TOKENIQ 2026 (Navi Mumbai)](https://joinfingrad.com/tokeniq) | runtime / covered-runtime | [/tokeniq-mumbai](https://hashtagweb3.com/tokeniq-mumbai) |
| 0:5 | [Bittensor Builders House (Chondhi, near Alibaug)](https://luma.com/bittensor-hh) | absent / held | — |
| 0:6 | [Hacker House Goa 2026](https://hacker-house-goa-2026.devfolio.co/) | runtime / covered-runtime | [/hacker-house-goa](https://hashtagweb3.com/hacker-house-goa) |
| 0:7 | [MIP-20: Road to Devcon](https://luma.com/ndrr1yqe) | runtime / covered-runtime | [/mip-20](https://hashtagweb3.com/mip-20) |
| 0:8 | [IBW 2026 Pre-Conference VIP Night (announced, RSVP TBA)](https://indiablockchainweek.com/) | runtime / held | [/ibw-pre-conference-vip-night](https://hashtagweb3.com/ibw-pre-conference-vip-night) |
| 0:9 | [India Blockchain & AI Tour 2026: Mumbai Node](https://konfhub.com/india-blockchain-tour-2026-mumbai-node) | runtime / covered-runtime | [/india-blockchain-ai-tour-mumbai](https://hashtagweb3.com/india-blockchain-ai-tour-mumbai) |
| 0:10 | [NEAR Builder's Cafe #2](https://luma.com/ijy8hzbj) | absent / missing | — |
| 0:11 | [Afterhours Mixer: Mumbai (moved from Ravecon, Nov 4)](https://luma.com/1cnairat) | runtime / covered-runtime | [/afterhours-mixer-mumbai](https://hashtagweb3.com/afterhours-mixer-mumbai) |
| 0:12 | [BORN UP: IBW Community Networking Meetup](https://luma.com/bornlive-tpiy) | runtime / covered-runtime | [/born-up-ibw-mumbai](https://hashtagweb3.com/born-up-ibw-mumbai) |
| 0:13 | [Catalyst: Founder Residency at Devcon](https://luma.com/jb4zsel1) | runtime / covered-runtime | [/catalyst-founder-residency](https://hashtagweb3.com/catalyst-founder-residency) |
| 0:14 | [DeFi Security Summit (DSS) 2026](https://luma.com/9qtxqqxx) | runtime / covered-runtime | [/defi-security-summit](https://hashtagweb3.com/defi-security-summit) |
| 0:15 | [IBW Future Asset Forum (invite-only)](https://indiablockchainweek.com/future-asset-forum) | runtime / covered-runtime | [/ibw-future-asset-forum](https://hashtagweb3.com/ibw-future-asset-forum) |
| 0:16 | [India Blockchain Week (IBW) 2026 Conference](https://indiablockchainweek.com/) | runtime / covered-runtime | [/ibw](https://hashtagweb3.com/ibw) |
| 0:17 | [Run & Rave (6am run into IBW & Devcon)](https://luma.com/3doehm1b) | runtime / covered-runtime | [/run-and-rave](https://hashtagweb3.com/run-and-rave) |
| 0:18 | [Shaktipith: Women-only Residency](https://luma.com/li3sv90r) | runtime / covered-runtime | [/shaktipith-women-residency](https://hashtagweb3.com/shaktipith-women-residency) |
| 0:19 | [ShanHaiWoo GBA 2026: Mumbai Global Extension](https://luma.com/47rm8enp) | runtime / covered-runtime | [/shanhaiwoo-mumbai-extension](https://hashtagweb3.com/shanhaiwoo-mumbai-extension) |
| 0:20 | [The Dream House: Devcon Mumbai Residency](https://devconbuddy.me/events) | absent / held | — |
| 0:21 | [Zcash World – Mumbai](https://luma.com/83ujl6ms) | runtime / covered-runtime | [/zcash-world-mumbai](https://hashtagweb3.com/zcash-world-mumbai) |
| 0:22 | [ArbiVerse Mumbai (Arbitrum Summit @ Devcon)](https://luma.com/arbiverse-mumbai) | runtime / covered-runtime | [/arbiverse-mumbai](https://hashtagweb3.com/arbiverse-mumbai) |
| 0:23 | [Crypto Mondays: Devcon India Edition](https://luma.com/9bhu9f28) | source-only / held | — |
| 0:24 | [Ethereum Cypherpunk Congress #3](https://luma.com/spsnos9t) | runtime / covered-runtime | [/ethereum-cypherpunk-congress](https://hashtagweb3.com/ethereum-cypherpunk-congress) |
| 0:25 | [IBW Institutional Forum](https://www.indiablockchainweek.com/institutional-forum) | runtime / covered-runtime | [/ibw-institutional-forum](https://hashtagweb3.com/ibw-institutional-forum) |
| 0:26 | [IBW Official After-Party (announced, RSVP TBA)](https://indiablockchainweek.com/) | runtime / covered-runtime | [/ibw-official-after-party](https://hashtagweb3.com/ibw-official-after-party) |
| 0:27 | [Off-Chain Padel (7am)](https://luma.com/m8jxna31) | runtime / covered-runtime | [/off-chain-padel-mumbai](https://hashtagweb3.com/off-chain-padel-mumbai) |
| 0:28 | [Onchain Dev City: Devcon [8] India](https://luma.com/n0a39ago) | runtime / covered-runtime | [/onchain-dev-city](https://hashtagweb3.com/onchain-dev-city) |
| 0:29 | [Solana Summit India](https://luma.com/solana-summit-india) | runtime / covered-runtime | [/solana-summit-india](https://hashtagweb3.com/solana-summit-india) |
| 0:30 | [Team1 India: Networking Gala Mumbai](https://luma.com/Team1Mumbai) | runtime / covered-runtime | [/team1-mumbai-networking-gala](https://hashtagweb3.com/team1-mumbai-networking-gala) |
| 0:31 | [The Institutional Table: Private Dinner on Tokenization, Stablecoins & Security (invite-only)](https://luma.com/quilla-vmnc) | runtime / covered-runtime | [/institutional-table-mumbai](https://hashtagweb3.com/institutional-table-mumbai) |
| 0:32 | [AI Economic Forum (AIEF): Truth Intelligence Summit](https://luma.com/a0e6b8at) | runtime / covered-runtime | [/ai-economic-forum-mumbai](https://hashtagweb3.com/ai-economic-forum-mumbai) |
| 0:33 | [Alchemy 1:1 Meetings @ Devcon 8](https://www.alchemy.com/events/devcon-2026) | runtime / covered-runtime | [/alchemy-devcon-meetings](https://hashtagweb3.com/alchemy-devcon-meetings) |
| 0:34 | [BORN UP: Devcon Community Networking Meetup](https://luma.com/4al1ai5x) | runtime / covered-runtime | [/born-up-devcon-mumbai](https://hashtagweb3.com/born-up-devcon-mumbai) |
| 0:35 | [Devcon 8 Community Hubs (inside venue)](https://devcon.org/en/) | runtime (embedded program) / covered-runtime | [/devcon](https://hashtagweb3.com/devcon) |
| 0:36 | [EIP Hub @ Devcon 8 India](https://luma.com/czi58jpe) | runtime / covered-runtime | [/eip-hub-devcon](https://hashtagweb3.com/eip-hub-devcon) |
| 0:37 | [Fluid at Mumbai \| Smart Liquidity](https://luma.com/uqmzpq5k) | runtime / covered-runtime | [/fluid-mumbai-smart-liquidity](https://hashtagweb3.com/fluid-mumbai-smart-liquidity) |
| 0:38 | [House of HYPE (Khar)](https://luma.com/x6m1zvfh) | absent / held | — |
| 0:39 | [Liquidity Pool @ Devcon 8](https://luma.com/sgrf4yq5) | runtime / covered-runtime | [/liquidity-pool-devcon](https://hashtagweb3.com/liquidity-pool-devcon) |
| 0:40 | [P2P Networking Hub @ Devcon 8 (Devcon ticket needed)](https://luma.com/cz51ibrc) | absent / missing | — |
| 0:41 | [Ready for the Run @ Mumbai](https://luma.com/08ogvz1i) | runtime / covered-runtime | [/ready-for-the-run-mumbai](https://hashtagweb3.com/ready-for-the-run-mumbai) |
| 0:42 | [World of DeSci @ Devcon (DeSci Community Hub)](https://luma.com/mc8pq06y) | runtime / covered-runtime | [/world-of-desci-devcon](https://hashtagweb3.com/world-of-desci-devcon) |
| 0:43 | [Zypherpunks Dinner @ Devcon](https://luma.com/jlisaxzz) | absent / missing | — |
| 0:44 | [Capital Connect (invite-only, LPs & VCs)](https://luma.com/kz3klqjq) | runtime / covered-runtime | [/capital-connect](https://hashtagweb3.com/capital-connect) |
| 0:45 | [Collateral Call: Institutional Credit Night](https://luma.com/qzzu690f) | runtime / covered-runtime | [/alpend-collateral-call](https://hashtagweb3.com/alpend-collateral-call) |
| 0:46 | [Digital Asset Regulation, Policy & Global Compliance Roundtable](https://luma.com/6gnkjcqx) | runtime / covered-runtime | [/digital-asset-regulation-roundtable](https://hashtagweb3.com/digital-asset-regulation-roundtable) |
| 0:47 | [Diyas: NEAR @ Devcon (agent economy evening)](https://luma.com/hr8w0hmd) | runtime / covered-runtime | [/diyas-near-devcon](https://hashtagweb3.com/diyas-near-devcon) |
| 0:48 | [ETHIndia 2026 @ Devcon (1-day conference)](https://ethindia.co/) | runtime / covered-runtime | [/ethindia](https://hashtagweb3.com/ethindia) |
| 0:49 | [EVA Symposium III (invite-only)](https://luma.com/ai6owvhz) | runtime / covered-runtime | [/eva-symposium-iii](https://hashtagweb3.com/eva-symposium-iii) |
| 0:50 | [Logos Circle Mumbai: Run Club (6:30am, Marine Drive)](https://luma.com/iumnt6zf) | absent / missing | — |
| 0:51 | [Midweek Block Party](https://luma.com/86nrj6he) | runtime / covered-runtime | [/midweek-block-party-mumbai](https://hashtagweb3.com/midweek-block-party-mumbai) |
| 0:52 | [Monad Blitz Mumbai: Devcon Edition (hackathon)](https://luma.com/Blitz-Mumbai-Devcon-2026) | runtime / covered-runtime | [/monad-blitz-mumbai](https://hashtagweb3.com/monad-blitz-mumbai) |
| 0:53 | [Money Layer @ Devcon Week](https://luma.com/islzi7v3) | runtime / covered-runtime | [/money-layer-devcon](https://hashtagweb3.com/money-layer-devcon) |
| 0:54 | [Onchain Legal Summit :: Devcon India 2026](https://luma.com/cw0h549b) | runtime / covered-runtime | [/onchain-legal-summit](https://hashtagweb3.com/onchain-legal-summit) |
| 0:55 | [Open House by lil room (builders & founders)](https://luma.com/gjfpaw4r) | absent / held | — |
| 0:56 | [Sidequest: Happy Hour](https://luma.com/2kj0jqf9) | runtime / covered-runtime | [/sidequest-happy-hour](https://hashtagweb3.com/sidequest-happy-hour) |
| 0:57 | [The Yield Layer of Social Impact](https://luma.com/7729jnr3) | runtime / covered-runtime | [/yield-layer-social-impact](https://hashtagweb3.com/yield-layer-social-impact) |
| 0:58 | [Zcash Free Society Hackathon](https://luma.com/freesocietyhackathon) | runtime / covered-runtime | [/free-society-hackathon](https://hashtagweb3.com/free-society-hackathon) |
| 0:59 | [Biggest CT G.A.Y Party](https://luma.com/ena53peq) | source-only / held | — |
| 0:60 | [Builders Brunch, Mumbai](https://luma.com/5u1evsou) | runtime / covered-runtime | [/builders-brunch-mumbai](https://hashtagweb3.com/builders-brunch-mumbai) |
| 0:61 | [ETHGlobal Mumbai](https://ethglobal.com/events/mumbai) | runtime / covered-runtime | [/ethglobal-mumbai](https://hashtagweb3.com/ethglobal-mumbai) |
| 0:62 | [Frontier of Intelligence Hackathon](https://luma.com/ub56pe38) | runtime / covered-runtime | [/frontier-of-intelligence-hackathon](https://hashtagweb3.com/frontier-of-intelligence-hackathon) |
| 0:63 | [NEAR × Quantus Networking Mixer @ Devcon Mumbai](https://luma.com/xuofsg0p) | runtime / held | [/near-quantus-happy-hour](https://hashtagweb3.com/near-quantus-happy-hour) |
| 0:64 | [notneils' Stealth Founder Dinner](https://luma.com/kfh8wkql) | runtime / covered-runtime | [/notneils-stealth-founder-dinner](https://hashtagweb3.com/notneils-stealth-founder-dinner) |
| 0:65 | [The Best Event: Afterdark Devcon](https://luma.com/TBE-Devcon26) | runtime / covered-runtime | [/afterdark-devcon](https://hashtagweb3.com/afterdark-devcon) |
| 0:66 | [Unchained Summit India, Day 1 (Markets & Finance)](https://unchainedsummit.com/india/) | runtime / covered-runtime | [/unchained-summit](https://hashtagweb3.com/unchained-summit) |
| 0:67 | [Unchained Summit Pitch Competition (apply by 25 Oct)](https://unchainedsummit.com/india/pitch-competition/) | runtime (embedded program) / covered-runtime | [/unchained-summit](https://hashtagweb3.com/unchained-summit) |
| 0:68 | [Devcon Afterparty (unofficial)](https://luma.com/tswdcctj) | runtime / covered-runtime | [/unofficial-devcon-afterparty](https://hashtagweb3.com/unofficial-devcon-afterparty) |
| 0:69 | [MONEY MAKER](https://luma.com/np3wx7v5) | runtime / covered-runtime | [/money-maker](https://hashtagweb3.com/money-maker) |
| 0:70 | [Perps & Chai with HyprEarn](https://luma.com/58b4n6e6) | runtime / covered-runtime | [/perps-and-chai-hyprearn-mumbai](https://hashtagweb3.com/perps-and-chai-hyprearn-mumbai) |
| 0:71 | [Pragma Mumbai](https://ethglobal.com/events/pragma-mumbai) | runtime / covered-runtime | [/pragma-mumbai](https://hashtagweb3.com/pragma-mumbai) |
| 0:72 | [Ship Safe: Devcon Mumbai Security Sessions](https://luma.com/quilla-rvp4) | runtime / covered-runtime | [/ship-safe](https://hashtagweb3.com/ship-safe) |
| 0:73 | [Mumbai Edition: Crypto Afterhours](https://luma.com/v0fimew1) | runtime / covered-runtime | [/crypto-afterhours-mumbai](https://hashtagweb3.com/crypto-afterhours-mumbai) |
| 0:74 | [ETHwali (Diwali party)](https://luma.com/0ej7kbb0) | runtime / covered-runtime | [/ethwali](https://hashtagweb3.com/ethwali) |
| 0:75 | [Seer × Kleros side event (announced, RSVP TBA)](https://x.com/seer_pm) | absent / held | — |
| 0:76 | [ZK Real World Summit @ Devcon Mumbai (announced, RSVP TBA)](https://x.com/zk_monk) | absent / held | — |

## Evidence and validation

- Per-tab rows, all 152 occurrences, source file/JSON pointers, runtime routes, exact Luma IDs, aliases/history, tombstones, previous-review evidence and current primary receipts are in `content/sources/sheet-1MDHdcFf-event-coverage.json`.
- Readable occurrence ledger: `content/sources/sheet-1MDHdcFf-event-coverage.csv`. Primary projections: `docs/sheet-1MDHdcFf-event-coverage.primary.json`.
- New GETs are bounded at 2 MiB and 25 seconds; no authentication, registration or challenge bypass. Private event evidence contains identity/visibility only.
- 56 pre-existing inputs are hash-protected, including all event feeds, runtime copies, reviewed descriptions/facts, slug history and tombstones. Changed inputs since baseline: 0.
- Validation: `node --import tsx docs/sheet-1MDHdcFf-event-coverage.mjs validate`; results in `docs/sheet-1MDHdcFf-event-coverage.validation.json`.

- json: `content/sources/sheet-1MDHdcFf-event-coverage.json`
- csv: `content/sources/sheet-1MDHdcFf-event-coverage.csv`
- human: `docs/sheet-1MDHdcFf-event-coverage.md`
- primary: `docs/sheet-1MDHdcFf-event-coverage.primary.json`
- decisions: `docs/sheet-1MDHdcFf-event-coverage.decisions.json`
- baseline: `docs/sheet-1MDHdcFf-event-coverage.baseline.json`
- generator: `docs/sheet-1MDHdcFf-event-coverage.mjs`
- validation: `docs/sheet-1MDHdcFf-event-coverage.validation.json`
- cache: `.cache/sheet-1MDHdcFf-event-coverage`

No shared catalogue edits, imports, rebuilds, commits, pushes, deployment, email or social actions were performed.
