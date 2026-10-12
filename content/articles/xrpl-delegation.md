---
title: XRP Ledger activates account delegation for banks and stablecoin issuers
ogTitle: "XRP LEDGER ACTIVATES ACCOUNT DELEGATION FOR BANKS"
description: The PermissionDelegationV1_1 amendment went live Oct. 8 at ledger 107,524,865, letting institutions split account duties across delegates without sharing keys, while a related minting fix moved into its activation countdown.
image: /images/news/xrpl-delegation.jpg
imageCaption: "The Bank of England building in London. Photo: Diliff via Wikimedia Commons (CC BY-SA 3.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Bank_of_England_Building%2C_London%2C_UK_-_Diliff.jpg
category: News
data-ai-hint: central bank building facade
publishedDate: '2026-10-12'
lastUpdated: '2026-10-12'
---

The XRP Ledger switched on account delegation on Oct. 8. The PermissionDelegationV1_1 amendment went live at ledger 107,524,865, listed at 5:29 p.m. ET, [Unchained reported](https://unchainedcrypto.com/xrp-ledger-enables-account-delegation-as-a-token-minting-fix-lacks-two-validator-votes/). CoinDesk matched the date and the ledger number against the XRPL Dashboard tracker, in its [Oct. 9 report](https://www.coindesk.com/tech/2026/10/09/xrp-ledger-adds-new-controls-for-banks-stablecoins-and-tokenized-funds).

An account owner can now authorize other accounts to transact on its behalf without handing over primary keys. Delegates carry up to 10 permissions each, granted and revoked by submitting a new permission list. The design fits banks, stablecoin issuers and tokenized funds that want payments handled by one desk and compliance by another while the main keys stay offline. Limits apply by action type only. No spending cap or asset-specific restriction exists in the current design, [CoinDesk noted](https://www.coindesk.com/tech/2026/10/09/xrp-ledger-adds-new-controls-for-banks-stablecoins-and-tokenized-funds).

Ledger upgrades need strictly more than 80 percent of trusted validators behind them for two weeks. On the current 35-validator list that means at least 29 supporters, a threshold the live [amendment tracker](https://xrpldashboard.com/amendments) restates.

## The minting fix and its countdown

Delegation shipped with a warning attached. Until a second amendment called fixCleanup3_4_0 is enabled, no one should delegate the PaymentBurn permission, because a delegate holding it could create new trust-line and multi-purpose tokens rather than only burning. The caution covers issued tokens, not newly minted XRP, and other permissions are unaffected, [per the Oct. 9 version](https://unchainedcrypto.com/xrp-ledger-enables-account-delegation-as-a-token-minting-fix-lacks-two-validator-votes/).

That fix sat at 27 of 35 validator votes on Oct. 9, two short of the 29 needed. [One Oct. 9 version](https://unchainedcrypto.com/xrp-ledger-enables-account-delegation-as-a-token-minting-fix-lacks-two-validator-votes/) and [another](https://www.coindesk.com/tech/2026/10/09/xrp-ledger-adds-new-controls-for-banks-stablecoins-and-tokenized-funds/) agree on the count. The count has since moved. The tracker showed fixCleanup3_4_0 at 29 of 35 on Oct. 12, inside its 14-day countdown, with majority reached Oct. 9 at 5:34 a.m. ET and activation projected for Oct. 23. The "two votes short" framing from Oct. 9 is therefore stale, and this report uses the current count.

A counting quirk explains part of the slow climb. Version 3.4.1 stops counting a validator after it rotates its signing key and drops it from the denominator, so a round can read 33 validations against a threshold of 26 instead of 35 against 28. Developer xVet filed the issue as XRPLF/rippled#8534 on Oct. 8, and the [issue thread](https://github.com/XRPLF/rippled/issues/8534) records a proposed patch in PR #8540. The thread states no amendment outcome currently differs because of the bug.

Two related upgrades crossed the line on Oct. 9. FixBatchV1_2 enabled at 10:15 a.m. ET at ledger 107,540,481, and BatchV1_1 followed at 10:47 a.m. ET at ledger 107,540,993, the [tracker](https://xrpldashboard.com/amendments) shows. CryptoSlate confirmed the Batch arrival the same day, writing under a headline about institutions sharing duties without sharing keys, in its [Oct. 9 piece](https://cryptoslate.com/ripple-wants-to-turn-xrpls-4-5-billion-in-tokenized-assets-into-round-the-clock-collateral/). With delegation live and batch settlement behind it, the remaining dated marker is the fixCleanup countdown toward Oct. 23.

The PaymentBurn caution lives in the ledger's own documentation. All three outlets point readers to the known-amendments and permission-delegation pages, which carry the warning against delegating that permission before the cleanup fix enables. The CryptoSlate account links the activation itself to an xrpscan record of the enabling transaction. Reporting ran overnight. Bylines and times: Shaurya Malwa at 12:21 a.m. EDT on Oct. 9; 6:27 a.m. ET the same morning; and the third the same day. The tracker, read Oct. 12 near ledger 107,597,749, restates the standing rule that 28 of 35 supporters loses the majority.

The institutional context comes with competing snapshots. One version cites $3.72 billion in tokenized assets plus $539 million in RLUSD during the second quarter via Evernorth, in its [Oct. 9 report](https://www.coindesk.com/tech/2026/10/09/xrp-ledger-adds-new-controls-for-banks-stablecoins-and-tokenized-funds). The other cites an Oct. 7 RWA Foundation snapshot near $3.7 billion in year-to-date growth excluding stablecoins, alongside an Oct. 9 RWA.xyz read near $4.54 billion represented with $499 million distributed, in its [Oct. 9 piece](https://cryptoslate.com/ripple-wants-to-turn-xrpls-4-5-billion-in-tokenized-assets-into-round-the-clock-collateral/). Different metrics and dates explain the spread, so this report keeps them separate. The XRPL Foundation blog lists an Oct. 9 vulnerability disclosure for rippled 3.4.1 without a delegation activation post, which leaves the dashboard and the three outlets as the activation record.
