# Older Devcon backlog reconciliation

Reconciled on October 15, 2026 against current `fcb00131c6adb400d4a1b97742282040dae89fd3`, using the read-only `Web3-Jobs-devcon-directory` worktree and its own HEAD as the three-way baseline. No commit, push or deployment was performed in this pass.

## Applied

**17 description revisions** were still unpublished: their current descriptions exactly matched the older HEAD baseline. Imported only their reviewed-description entries, including the original October 14 source timestamps and hashes:

- Privacy, Technology and Bitcoin: English translation alongside the Japanese announcement.
- Money20/20 USA; Bitcoin Amsterdam; Bitcoin Histórico; Solana Breakpoint; Global Trading Show: primary-backed program, speakers and attendance information.
- Ready for the Run Pune and Lucknow: local partner and community-selected discussion format respectively.
- Founder House Singapore: eligibility, building format, conditional awards and application process.
- EDCON: published October 17–18 agenda instead of application/sponsor copy.
- North American Blockchain Summit: substantive infrastructure scope without promotional headings.
- Community Call and UK Tokenisation Summit: explicit unresolved primary-date conflicts; existing dates retained.
- Finnovation Day: remove the no-longer-confirmed payments theme.
- ETHWomen; Tencent Cloud AI CAN DO IT Hackathon; Rayls London Meetup: useful event details without empty headings or promotional repetition.

**Three new listings** were verified again with ordinary public GET requests on October 15:

| Route | Confirmed primary facts |
| --- | --- |
| `/arbiverse-mumbai` | November 2, 10:30–18:30 IST; Arbitrum and Aditi Chopra; approval required; private exact location. The old Arbitrum Summit URL redirects to this primary event. |
| `/shanhaiwoo-mumbai-extension` | November 1–6, date-only, in the organizer's Mumbai extension announcement. The wider registration record's Shenzhen dates and timezone were not applied to Mumbai. No Mumbai venue or daily timetable announced. |
| `/alchemy-devcon-meetings` | November 3–6; organizer meeting-request form, not a fixed session program. No meeting venue announced. |

All three covers returned HTTP 200 with image content types. Existing October 14 description evidence remains attached; fresh evidence has its own actual response hashes and capture timestamps. New slugs were checked against reserved content roots, jobs, companies, news/articles, popups, event aliases/history/tombstones, historical previews and legacy job aliases before insertion.

## Superseded work retained on current main

Five of the older 22 short-content revisions were superseded by October 15 reviews: **Shaktipith, India Blockchain & AI Tour Mumbai, Sidequest Happy Hour, Alpend Collateral Call, and Afterdark Devcon**. The separately pending **Unchained Summit Pitch Challenge** addition is also already covered more fully by current main, including its deadline conflict.

The older Sidequest facts edit was the only changed reviewed-facts entry; current facts take precedence. `catalog-reviewed-facts.json` is unchanged. Current canonical names and the `ibt-mumbai` and `tbe-devcon26` aliases remain intact. All 54 IBW audit IDs and all 55 existing IBW-associated runtime records, including Free Society Hackathon, compare exactly before and after.

The directory's six held entries remain held: AI x Filmmaking Festival, The Dream House, Crypto Mondays, Biggest CT G.A.Y Party, Seer x Kleros, and ZK Real World Summit. Historical refresh failures are not treated as cancellations. Existing closed/rescheduled records and their facts were preserved.

## Evidence and scope

[`devcon-backlog-reconciliation.json`](devcon-backlog-reconciliation.json) records every revision decision, baseline/current/older/proposed description hashes, original source provenance and relevant captured primary text, plus fresh checks for each addition. It identifies and hashes all nine older audit/report inputs. Those historical reports describe their original worktree checks, not this release.

The only hand-selected catalog changes are 17 reviewed-description entries and three appended source records. The current event generator produced runtime, description index and slug-history updates. No older runtime, jobs, news, prebuild, sitemap, email or receipt files were imported. Existing source rows were preserved. Current runtime already uses source-backed event guides, so no legacy guide deletion or formatting-code duplication was necessary.

All tracked non-event files retain their starting hashes, including jobs and original posting dates, news and `/jio-perpetuals`, passport content, receipts, workflow changes, and the paused Resend policy. Untracked research helpers and other worktrees were preserved.

## Validation and release handoff

- `npm run precompute:events-runtime`: **216 active events** from 214 + 3 additions − 1 naturally ended event. `ai-agents-space-yacht-fireside` ended October 15 at 14:00 UTC; its source was not deleted. Retention reported zero source removals and zero tombstone changes.
- Passed: `test:event-descriptions`, `test:event-schema`, `test:event-public-data`, `check:event-content`, `scripts/test-event-formatting.ts`, and `git diff --check`.
- Independent checks: all 216 descriptions resolve as source-backed; all existing metadata is exact; only the 17 selected descriptions changed; unaffected records and the 55 protected IBW-associated records are exact; Free Society Hackathon remains present; public runtime matches the source runtime.
- `test:event-source-recovery` fails at its historical expectation that `w3v-crypto-worlds-fair-hackathon-by-colosseum` remains published. That route is absent from both the starting `fcb00131c` runtime and the regenerated runtime. The test was not replaced with the older worktree's assertions.

Main release review still needs its normal production build/deployment gates, generated route/sitemap/preview assets, and any browser checks. The existing source-recovery test's expired-record assumption should be considered during that review. Local reconciliation helpers and raw fresh captures live in ignored `.cache/devcon-reconciliation/`.

## Main integration verification

The subsequent normal Node 24 production build passed, including prebuild gates,
type validation, standalone asset verification and feed checks. All 20 affected
pages (17 revisions and three additions) passed production HTTP checks for full
rendered descriptions, names and canonical metadata. The existing IBW release
check passed with 56 linked events, 182 aliases, both Jio article embeds, the
Popups control, three viewport widths and both themes. It now permits verified
additions while still checking every protected IBW identity and description.

Normal prebuild maintenance removed the expired Stripe `pm180` role and its
preview assets, preserving its original date in the existing history. No older
job or news snapshot was imported. Resend remains paused. These checks establish
push readiness; they do not certify a live deployment of this backlog.
