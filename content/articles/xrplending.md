---
title: XRP Ledger patches its lending code before the feature ever turns on
ogTitle: "XRPL PATCHES LENDING CODE PRE-LAUNCH"
description: A bug-fix package is set to activate on the XRP Ledger on Oct. 23, repairing Ripple's uncollateralized lending design while the LendingProtocol amendment still sits in the voting queue.
image: /images/news/xrplending.jpg
imageCaption: "A signed contract. XRP Ledger lending uses off-chain underwriting rather than on-chain collateral. Photo: Blogtrepreneur via Wikimedia Commons (CC BY 2.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Legal_Contract_%26_Signature_-_Warm_Tones.jpg
category: News
data-ai-hint: signed loan contract
publishedDate: '2026-10-20'
lastUpdated: '2026-10-20'
---

The XRP Ledger is fixing a feature that has not launched yet. A package of bug fixes is scheduled to take effect around 09:34 UTC on Friday, Oct. 23, after securing the 29 validator votes required for approval, [CoinDesk reported](https://www.coindesk.com/tech/2026/10/19/xrp-ledger-is-set-to-fix-its-lending-code-before-anyone-can-use-it). Among the targets: the design of Ripple's proposed uncollateralized lending system, which is still waiting in the amendment queue and has never processed a loan.

## The lending system being patched

Ripple has been pitching an on-chain lending market to banks and payment companies since June. The mechanics, laid out in the network's [lending protocol documentation](https://xrpl.org/docs/concepts/tokens/lending-protocol), differ from the DeFi default. Loans are fixed-term and uncollateralized, drawn from pooled funds. Borrower vetting happens off chain rather than through automated collateral and liquidation. A loan broker puts up first-loss capital to absorb initial defaults. Issuers keep compliance tools, including the ability to freeze accounts and claw back funds.

The feature ships as an amendment called LendingProtocol, which needs 80% of the 35 validators the network trusts by default, a threshold of 29 votes that has to hold for two consecutive weeks. As of Monday it sat at 19 votes. A companion vault amendment had 21. The lending system was ten votes short of activation, and no loan has been originated against it because the code path simply is not enabled on the mainnet yet.

## Fixing it in the queue

Rather than wait for the flawed version to go live and then emergency-patch it, developers published a second amendment, LendingProtocolV1_1, that repairs the original while both sit in the voting queue. The documentation now lists both amendments as prerequisites, so the network would adopt the repaired design from the start, [Decrypt explained](https://decrypt.co/381358/xrp-ledger-repairs-lending-protocol-before-live).

The Friday package is broader than lending alone. It closes a loophole that could have let certain accounts create tokens despite holding permissions only to destroy them, a permissions edge case that sits in the same family of surprises as the vault rounding fixes the package also carries. Loan-default rules are being revised in the same pass. The caution follows a close call disclosed earlier: a dormant payment-engine bug that could have let an attacker mint counterfeit XRP, hidden in the code for roughly a decade before a researcher flagged it.

That history explains the sequencing. The XRP Ledger's amendment system lets the network ship a repair before the feature it repairs ever processes value. Developers do not have to choose between waiting for a flaw to surface in production and ripping out an amendment that has not activated. Both versions can sit in the queue, with the repaired one standing as the version that would take effect if the votes ever arrive.

## How amendments work here

New features on the XRP Ledger never ship directly. They enter as amendments that must clear the 80% threshold over a two-week window before validators enable them. The counting is public: every trusted validator's position on each amendment is visible, which is how CoinDesk could put the lending tally at 19 and the vault tally at 21 on Monday. An amendment at 19 votes is a proposal. An amendment at 29 is a scheduled change, assuming the support holds for the full window rather than spiking and fading.

The patch package reached the 29-vote threshold ahead of its expected effective time. The lending and vault amendments themselves remain short, with the gap still measuring ten votes on the lending side. Validators move slowly by design, and vote counts can drift for weeks before an amendment crosses. Until those amendments cross, Ripple's institutional lending pitch stays a specification with a scheduled repair attached, rather than a product running on the mainnet.
