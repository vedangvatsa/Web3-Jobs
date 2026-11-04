---
title: Ethereum postpones Glamsterdam's Hoodi testnet activation over contract risks
ogTitle: "ETHEREUM POSTPONES GLAMSTERDAM HOODI ACTIVATION"
description: The Ethereum Foundation canceled the Oct. 26 Glamsterdam activation on the Hoodi testnet and set no replacement date after developers ordered more study of EIP-8037's effects on existing smart contracts.
image: /images/news/hoodidelay.jpg
imageCaption: "Ethereum co-founder Vitalik Buterin speaking at TechCrunch London in 2015. Photo: John Phillips via Wikimedia Commons (CC BY 2.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Vitalik_Buterin_TechCrunch_London_2015.jpg
category: News
data-ai-hint: ethereum founder speaking at conference
publishedDate: '2026-10-24'
lastUpdated: '2026-10-24'
---

The Ethereum Foundation postponed the Glamsterdam upgrade on the Hoodi testnet on Oct. 22, four days before the activation scheduled for Oct. 26 at 17:42:48 UTC, epoch 132,352. No new activation date has been set, the Foundation said in its [postponement notice](https://blog.ethereum.org/2026/10/22/glamsterdam-hoodi-delay), which supersedes the schedule and activation instructions published in the Oct. 16 Hoodi announcement.

Core developers reached the decision during [All Core Developers Execution call #248](https://github.com/ethereum/pm/issues/2267), according to the notice, to allow further investigation of how EIP-8037 interacts with mainnet smart contracts. The delay strips the Amsterdam execution-layer activation and the Gloas consensus-layer activation from Hoodi's configuration. It also removes the schedule that would have lifted the testnet's block gas limit to 200 million at the same epoch.

The Foundation characterized the change as a rollback of configuration for a future upgrade rather than a reversal of the testnet's history. "This rolls back the configuration for a future upgrade; it does not revert Hoodi's chain history," the post states. The updated configuration carries no replacement epoch or timestamp, and the Foundation said scheduling of the replacement upgrade will be announced at a later date.

Node and validator operators have until Oct. 26 to check both their execution and consensus layer clients against the revised configuration, the notice says. Software still scheduling Glamsterdam at the old activation time must be updated. The Foundation published a table of confirmed releases including go-ethereum v1.17.10, Nethermind 2.2.1, Reth v2.8.1, Besu 26.10.1, Lighthouse v8.3.2, Prysm v7.3.1 and Teku 26.10.2, and told operators not to treat the client tables in the earlier announcement as confirmation that those versions incorporate the postponement.

The delay follows a [ChainSecurity analysis published Oct. 13](https://www.chainsecurity.com/blog/glamsterdam-gas/index.html) of two proposals scheduled for Glamsterdam. EIP-8037 creates a separate gas reserve for state creation, and EIP-8038 reprices the cost of accessing and modifying existing state. ChainSecurity found that gas refilled or returned after a failed call can let a failure handler finish where it previously ran out of gas, which breaks an assumption contracts use to tell an out-of-gas failure apart from a real error. The firm's post walks through cases where a slot clear refills up to 97,920 gas, where a reverting intermediary returns state-gas charges it had already spent, and where a budget that covered a call under current rules no longer does.

ChainSecurity said it had "already found 13 real-world examples" in deployed applications and was running responsible disclosure with the affected projects, [CryptoSlate reported](https://cryptoslate.com/ethereums-long-awaited-glamsterdam-upgrade-hits-another-roadblock-as-13-security-risks-emerge/) on Oct. 23. The report said the changes could undermine safeguards in decentralized finance applications that handle withdrawals and batched transactions, where a contract records an operation as permanently failed and blocks a retry that would otherwise be valid. An attacker could deliberately supply too little gas for a valid operation while leaving enough for the contract to record the failure.

The postponement also suspends the gas-limit test itself. Hoodi had been set to raise its target to 200 million gas at the same activation, which developers were using to rehearse the network's capacity plans, CryptoSlate noted. The Foundation's notice states that application developers should not plan Hoodi testing around an Oct. 26 activation and that the update does not set a Glamsterdam mainnet date.

Glamsterdam had already slipped more than once. The Foundation targeted the first half of 2026 in February, and by September developers were working toward a December activation. The [Oct. 22 meeting agenda](https://github.com/ethereum/pm/issues/2267) listed Dec. 1, Dec. 8 and Dec. 9 as candidate mainnet dates, with a decision planned for the following week after Hoodi testing, according to CryptoSlate. That sequence is now interrupted, leaving the year-end target uncertain while the analysis continues.

The upgrade is expected to carry enshrined proposer-builder separation and block-level access lists, changes aimed at how transactions are processed and how much capacity the network carries. The Foundation's notice says node operators should follow their client teams' release notes for the revised Hoodi schedule and that a new activation date will be published separately.
