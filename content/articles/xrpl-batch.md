---
title: XRP Ledger Nears Activation of Batch Payments Upgrade
ogTitle: "XRP LEDGER NEARS ACTIVATION OF BATCH PAYMENTS UPGRADE"
description: Batch V1.1 would let XRP Ledger users settle up to eight linked transactions as one unit, and validators have held support above the 80 percent needed for activation around Sept. 29.
image: /images/news/xrpl-batch.jpg
imageCreditUrl: https://commons.wikimedia.org/wiki/File:BalticServers_data_center.jpg
imageCaption: "Server racks in a data center. Validators run XRP Ledger servers and vote on protocol upgrades. Photo: BalticServers.com via Wikimedia Commons (CC BY-SA 3.0)."
category: News
data-ai-hint: server racks data center
publishedDate: '2026-09-19'
lastUpdated: '2026-09-19'
---

The XRP Ledger has entered the final countdown to its next payments upgrade, a rebuilt amendment that would let users settle several linked transactions as a single unit. The activation clock for Batch V1.1 started on Sept. 15 at 14:06:41 UTC, and the change is projected to take effect shortly after the same time on Sept. 29, provided validator support stays at or above 80 percent for the full 14-day window, [CoinDesk reported](https://www.coindesk.com/tech/2026/09/19/ripple-says-asset-managers-are-preparing-for-xrp-ledger-s-next-payments-upgrade).

The amendment had backing from 30 of the 35 tracked validators, above the 28 votes required to start the countdown, according to the same report, which cited amendment tracking data. Validators can still change their votes during the window, so the Sept. 29 date is conditional rather than locked in.

"Batch allows multiple transactions to be grouped together so they either all execute or none do," Ayo Akinyele, head of engineering at RippleX, said in comments shared with CoinDesk. "That is particularly important for use cases like delivery-versus-payment, where the asset and payment need to move atomically." Akinyele added that the team will share more once the feature is live, "including work with key asset managers."

The feature, known as Batch V1.1, can combine as many as eight transactions into one operation. In its all-or-nothing mode, every inner transaction succeeds or the entire group is canceled, which removes the case where one side of a deal settles while the other fails. A custody move could be paired with its matching payment so neither leg lands alone.

Exchanges, wallets, and marketplaces could also attach their own charges directly to a customer payment. A transfer and the platform fee would clear as one operation instead of two separate transfers that might settle apart. [Crowdfund Insider](https://www.crowdfundinsider.com/2026/09/310563-xrp-ledger-nears-activation-of-batch-v1-1-payments-upgrade/), describing official protocol documentation, added that a batch can run in more than one mode, including setups where only one inner transaction should succeed, processing stops at the first failure, or each inner transaction is applied on its own.

## Commercial demand

RippleX says commercial projects are already being built around the feature. "Some projects are already being built with Batch in mind, so activation would allow that work to move closer to production," Akinyele said, adding that specifics on partners and launch timing will follow as plans are finalized. The companies have not been named, and [questions about their identities](https://www.coindesk.com/tech/2026/09/19/ripple-says-asset-managers-are-preparing-for-xrp-ledger-s-next-payments-upgrade) remain unanswered.

The account matches what developers said earlier in the week. RippleX told CoinDesk on Sept. 15 that commercial projects using Batch were under contract or in development, though it had not named the companies as of that date, [in the earlier report](https://www.coindesk.com/tech/2026/09/15/xrp-ledger-is-one-vote-away-from-starting-its-next-big-payments-upgrade). [Crypto.news](https://crypto.news/xrpl-batch-upgrade-nears-activation-after-developers-fix-11-bugs) gave the same picture on the same day, writing that the developer team had not publicly identified the firms involved.

Validator backing rose step by step. On Sept. 8 the amendment held 24 votes from the 35 validators on the default Unique Node List, or 68.57 percent, crypto.news previously reported. Three more validators added support after that, leaving the proposal at 27 of 35, roughly 77 percent, in a Sept. 15 snapshot, one vote short of the 80 percent line. The missing vote arrived the same day, and the two-week clock began.

XRP Ledger governance sets a high bar on purpose. An amendment must keep support from more than 80 percent of trusted validators for 14 straight days before it can activate, a rule meant to ensure changes take effect only when nearly every trusted operator agrees. The missing vote arrived the same day the 27-vote snapshot was published, and the two-week clock began.

## A rebuilt amendment

The vote now underway is the second attempt at the feature. Researchers found a critical flaw in the original Batch design in February while it was still awaiting activation. A signature-validation routine returned success too early when it met a signer whose account did not yet exist on the ledger, skipping checks on the remaining signers. That logic error could have let an attacker place transactions from another account inside a batch without the owner approval, Crowdfund Insider explained.

The vulnerable code never governed the live ledger, so no funds were exposed. Trusted validators were advised to vote against the original version, and an emergency software release marked that code unsupported. The official vulnerability disclosure published by the XRP Ledger project records that sequence, the outlet added.

RippleX then went beyond a narrow patch before returning the feature for another vote. "We used it as an opportunity to go much deeper on the implementation, redesign parts of the signing and authorization model, and significantly expand the security review," Akinyele said. The replacement shipped in xrpld version 3.3.0, released Aug. 6, and that implementation is the code validators are now voting to activate.

The review covered internal adversarial testing, AI-assisted analysis, a Sherlock attack contest, and assessments by security firms Halborn and Common Prefix. RippleX software engineer Mayukha Vadari laid out the same list in a Sept. 14 post on X, writing that the team completed a root-cause fix, review by four senior engineers, a Sherlock attackathon, and audits from Halborn and Common Prefix, as quoted by crypto.news.

That extra scrutiny surfaced 11 more defects involving signatures, authorization checks, and software conditions able to crash servers. One flaw rated critical by Common Prefix could have let an attacker reuse a signed permission to carry out more transactions than the user meant to authorize, [according to the Sept. 15 account](https://www.coindesk.com/tech/2026/09/15/xrp-ledger-is-one-vote-away-from-starting-its-next-big-payments-upgrade). Other findings covered how batch transactions verified permissions and processed signatures. Developers fixed the reported problems before the amendment reached its current voting stage, and ran automated analysis plus regression testing on Devnet and Testnet.

The project release notes for [xrpld 3.3.0](https://xrpl.org/blog/2026/xrpld-3.3.0) list BatchV1_1 as atomic batch transactions under proposal number XLS-56, adding a Batch transaction that lets an account submit up to eight inner transactions and fixing and replacing the original Batch amendment disabled in version 3.1.1. The same release introduced sibling proposals on private token transfers, token controls, permission delegation, and transaction sponsoring, each of which needs its own validator vote before going live.

"The bigger point is that we established a very high bar," Akinyele said. "We found a serious issue in V1.0 before activation, stopped it, redesigned and hardened the implementation, expanded the review considerably, and only then put V1.1 back in front of validators." The amendment stays in its countdown through Sept. 29. If support slips below 80 percent before then, the clock stops and a fresh 14-day window must begin after the proposal regains the required majority.
