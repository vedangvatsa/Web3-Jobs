---
title: Radix Traces $1.3M Vault Drain to 2023 Code Cleanup
ogTitle: "RADIX TRACES $1.3M VAULT DRAIN TO 2023 CODE CLEANUP"
description: The Radix Foundation said on Sept. 17, 2026 that a flaw introduced in a June 2023 code tidy-up let an attacker drain about $1.3 million on Aug. 31 and forced validators to stop the network for 10 days.
image: /images/news/radix-halt.jpg
imageCaption: "Rows of server racks in a data center corridor. Photo: Joel van der Loo via Wikimedia Commons (CC BY-SA 4.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Duga-1%20radar%20data%20center%20inside%20dark%20corridor%202018.jpg
category: News
data-ai-hint: server racks data center corridor
publishedDate: '2026-09-18'
lastUpdated: '2026-09-18'
---

The Radix Foundation on Sept. 17, 2026 published its account of an Aug. 31 attack that drained roughly $1.3 million from third-party vaults and left the Radix network unable to process transactions for 10 days. The [incident report](https://www.radixdlt.com/blog/public-incident-report-vault-authorisation-vulnerability-2026), reference RDX-INC-2026-0831, pins the cause on a defect introduced during a routine code tidy-up in June 2023 by RDX Works, the company then contracted to develop the protocol.

The attacker ran 26 exploit transactions between 16:02 and 16:57 UTC on Aug. 31, withdrawing bridged assets from vaults the attacker did not own and sending them across the Hyperlane bridge to other chains, the report states. Community validators noticed the unauthorized withdrawals at 17:37 UTC and escalated to Foundation leadership within minutes.

About 458,915 USDC, 72,420 USDT, 61.08 ETH, 6.35 wrapped bitcoin, 536.16 SOL and 32.91 BNB left the network across the 26 transactions. CryptoSlate [reported](https://cryptoslate.com/3-year-old-bug-triggers-1-3-million-drain-and-forces-10-day-blockchain-halt/) on Sept. 18 that the haul was worth roughly $1.26 million at Aug. 31 prices, with the two stablecoins alone accounting for about $531,335. The attacker took another 13,000 XRD from a vault to pay transaction fees.

A community reconstruction of the ledger gives matching totals down to the decimal. The radix.wiki history page [shows](https://radix.wiki/contents/history/hyperlane-asset-drain-2026) 458,914.89 hUSDC and 72,420.38 hUSDT burned out of Radix, with the remaining wrapped assets reduced to fractions of one unit. The two stablecoins carry a face value of $531,335.27, and the page states no dollar total for the rest.

The stolen assets traveled through Hyperlane to Ethereum, BNB Chain and Solana, then were sold for ETH, the Foundation said. Hyperlane itself worked as designed, since the attacker had already taken the assets on Radix before using the bridge to move them. No private keys were compromised.

The flaw sat in the Radix Engine, the software layer that executes transactions and enforces asset ownership. A transaction could name any vault on the network by its internal address, pass that address into purpose-built smart-contract code, and call the vault's ordinary withdrawal function. The engine should have rejected the call because the caller did not own the vault, and instead treated the reference as authorized. Direct-access references exist so recall can work, and recall stays gated behind the resource's recall role. The defect let the attacker's package call the ordinary take method through such a reference, because the engine never asked who owned the vault. The report describes the affected resources and their role settings as correct, with the engine failing to enforce the boundary those settings relied on.

The bug entered the code in June 2023, when an RDX Works development team cleaned up the Radix Engine. Hacken had audited the engine before that change and passed it. Zellic audited the protocol in August 2024, including the engine kernel holding the defect, passed it with a high score for a layer 1 protocol, and did not find the flaw.

The Foundation said RDX Works has been told of the situation and the root cause and has yet to respond. The report presents that silence as a plain fact without drawing conclusions from it.

Foundation investigators believe the attacker may have used AI-assisted code-analysis tools to find the flaw in the public source code. The report offers that as the assessment of the Foundation and its forensic team rather than as proven evidence. CryptoSlate [noted](https://cryptoslate.com/3-year-old-bug-triggers-1-3-million-drain-and-forces-10-day-blockchain-halt/) the same qualification, writing that the Foundation believes such tools may have helped the attacker identify the years-old defect.

The response moved fast once validators raised the alarm. Hyperlane disabled its Radix validator, relayer and scraper operations between 17:53 and 18:09 UTC. The Foundation brought in the Security Alliance emergency group known as SEAL 911, engaged Zellic and Hacken, and stopped its own market making on centralized exchanges while asking venues to pause XRD deposits, withdrawals and trading. A second barrier went onchain before 19:45, when the Foundation signed a multi-signature transaction pausing the Ethereum bridge route at the contract level.

At 20:30 UTC the Foundation, board members and key validators held an emergency call and decided to break network liveness. Investigators had concluded the flaw exposed every vault on Radix, not only the bridged holdings the attacker had targeted for their liquidity elsewhere. The report places the loss of liveness between 20:30 and 23:30, and the ledger's last committed round at 21:19:48 UTC falls inside that window, according to [the reconstruction](https://radix.wiki/contents/history/hyperlane-asset-drain-2026).

Radix consensus needs more than two thirds of staked XRD validating, so node runners took enough stake offline to cross below that line and no further transaction could be committed. The network was not switched off by any single party. It stopped because its own consensus rules refused to proceed without sufficient stake.

The halt lasted 254 hours, 15 minutes and 40 seconds. The network committed its first round in 10 days at 11:35:28 UTC on Sept. 11, then ran empty system-only rounds under a transaction moratorium until the fix enacted and user transactions resumed at 11:39:25 UTC, the ledger history records.

The repair, named Eagle Ray, adds a check that runs before any method call and rejects an ordinary withdrawal attempted through a direct-access reference with a new InvalidInvokeAccess error. One contributor wrote the fix on the night of the drain, opening the pull request on Sept. 2 with commits dating back to hours after the last exploit transaction. The engine half merged on Sept. 7 and shipped as Scrypto v1.4.0 that evening. The node half, which sets the enactment epoch and refuses user transactions for the epoch before it, shipped final as babylon-node v1.4.0.0 on Sept. 10. Audit firms and other security parties reviewed the fix on test networks of their own and found no critical issue, the Foundation said.

The restarted network faced a live-fire test within hours. A package named VaultDrainer carrying the old attack logic was submitted to mainnet on the afternoon of Sept. 11, and the network rejected the drain call with the new InvalidInvokeAccess error. The publish step succeeded and paid its fee, while the theft itself never landed on the ledger.

The drain kept causing damage after the initial theft through the liquidity pools it had emptied. An automated market maker prices one asset against what it holds of the other, so pools left holding only XRD priced it near nothing and kept trading at that price. A different account from the attacker swept about 5.69 million XRD out of the distorted pools within the hour through ordinary signed transactions that needed no flaw, only the broken prices, the community ledger analysis found.

The Foundation reported the theft as a crime on Sept. 2 to the States of Jersey Police and to UK police through Action Fraud, supplying the exploit transactions, the malicious package code, attacker-controlled addresses and the liquidation trail. The report asks exchanges holding funds tied to the attacker addresses to come forward.

The report draws four lessons. Code tidy-ups of security-critical components must face the same rigor as new features. Audits sample rather than prove, so the Foundation recommends continuous automated analysis alongside them. Outsourced protocol development must come with evidenced change control, and the coordinated liveness break that worked on the night must be formalized and rehearsed.

The report itself publishes no dollar figure for the loss, no per-asset amounts and no attacker addresses, leaving those readings to the ledger. The Radix Accountability Council said it tried the exploit against the restarted network and every attempt failed.
