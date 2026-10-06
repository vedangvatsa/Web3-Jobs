---
title: Prysm Ships 200M Gas Limit Fix Hours Before Sepolia Test
ogTitle: "PRYSM SHIPS 200M GAS LIMIT FIX HOURS BEFORE SEPOLIA TEST"
description: Prysm released version 7.2.1 on Oct. 5 to default Sepolia validators to a 200 million gas limit at the Oct. 6 Glamsterdam activation.
image: /images/news/prysm-fix.jpg
category: News
data-ai-hint: computer servers in a row
publishedDate: '2026-10-06'
lastUpdated: '2026-10-06'
imageCaption: "Rows of servers in a data facility. Ethereum validators run similar machines to propose and check blocks. Photo: Victorgrigas via Wikimedia Commons (CC BY-SA 3.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Wikimedia_Foundation_Servers-8055_13.jpg
---

Offchain Labs, the team that maintains the Prysm consensus client for Ethereum, published version 7.2.1 on Oct. 5, hours before the Glamsterdam upgrade reaches the Sepolia test network. The patch sets Prysm validators to propose with a 200 million gas limit once the fork activates, [the release notes say](https://github.com/OffchainLabs/prysm/releases/tag/v7.2.1). Without it, those validators would have stayed near the old 60 million default unless operators changed a setting by hand.

Glamsterdam activates on Sepolia at epoch 353024, or 13:53:36 UTC on Oct. 6, [according to the Ethereum Foundation announcement](https://blog.ethereum.org/2026/09/17/glamsterdam-testnet-announcement). Sepolia is a public test network where developers rehearse protocol changes with tokens that carry no real value before deciding what should reach the main network.

The timing issue came from a schedule change that landed after the prior Prysm release. Sepolia's shared configuration was updated on Sept. 24 to lift the gas limit to 200 million at the fork, [Unchained reported](https://unchainedcrypto.com/ethereum-client-prysm-ships-200m-gas-limit-fix-hours-before-glamsterdam-test/). Prysm 7.2.0 had already shipped, and its notes warned that validators on that version would default to 60 million in their post-fork proposer preferences and would need manual configuration to reach 200 million.

Version 7.2.1 carries the Sepolia gas limit schedule, so the higher number needs no action from operators who install it. Those who kept an older gas limit flag from prior setups will still override the schedule, and the client now warns them about that at startup. The flag can also be set through proposer settings files or the keymanager programming interface for operators who want a different value.

Gas measures the computing work a block can hold. A higher limit creates room for more transactions and more complex activity in each block, but it also asks more of the computers that run Ethereum. At 200 million, the Sepolia limit will stand at more than three times the 60 million default it replaces.

[CoinDesk reported](https://www.coindesk.com/tech/2026/10/06/ethereum-s-glamsterdam-test-gets-last-minute-fix-before-major-capacity-jump) that blocks proposed at the old limit would have diluted the test, which exists to show how the network copes with larger sizes. Validators on the new version will start proposing 200 million gas blocks automatically when Glamsterdam activates on Sepolia at about 13:53 UTC on Oct. 6.

The Foundation's announcement lists Prysm 7.2.1 among the Sepolia-ready consensus releases, alongside Grandine, Lighthouse, Lodestar, Nimbus and Teku builds. It notes that Teku 26.9.1 supports the fork but defaults to 60 million after activation, so Teku validators that want 200 million must set a command-line flag. As of Tuesday morning, 26.9.1 remained Teku's newest release on GitHub, [Unchained noted](https://unchainedcrypto.com/ethereum-client-prysm-ships-200m-gas-limit-fix-hours-before-glamsterdam-test/).

The patch does more than adjust the gas number. Partial data columns are now switched on by default, so nodes trade individual cells of blob data instead of whole columns. Operators who prefer the old behavior can pass a flag to fall back to full column gossip, while the older flag for the same feature is now deprecated and has no effect, [the notes say](https://github.com/OffchainLabs/prysm/releases/tag/v7.2.1).

Builder configuration for the Gloas consensus side also changes. Proposer settings files now take builder authorization data and builder public keys as hex with a 0x prefix, matching the keymanager interface, instead of base64. New validator flags set builder web addresses, minimum bids, boost factors and maximum execution payments for all validators at once. The default wait for builder bids rises to 600 milliseconds from 300 milliseconds.

Two fixes address the fork transition itself, including block production for the first post-fork block when its payload identifier is not cached and replay of historical states when required records are missing. Those details matter because the Sepolia test is the first public run of code paths that later face real value on the main network.

Glamsterdam pairs enshrined proposer-builder separation with block-level access lists. The first writes the handoff between validators and block builders into protocol rules, and the second lets nodes process unrelated transactions at the same time. Vitalik Buterin has argued that the builder separation alone does not stop a small group of builders from gaining outsized influence, [according to the same Unchained report](https://unchainedcrypto.com/ethereum-client-prysm-ships-200m-gas-limit-fix-hours-before-glamsterdam-test/).

Hoodi and mainnet activation dates have not been decided, the Foundation said. Tuesday's Sepolia run will show whether validators can handle blocks more than three times larger on a public network before developers set capacity for Ethereum itself, [CoinDesk added](https://www.coindesk.com/tech/2026/10/06/ethereum-s-glamsterdam-test-gets-last-minute-fix-before-major-capacity-jump).
