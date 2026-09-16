---
title: Starknet's Fee and Privacy Overhauls Land as v0.14.4 Enters Prerelease
description: >-
  Starknet put an EIP-1559-style STRK fee market and a 30 percent gas-target cut
  on mainnet in July, shipped in-protocol privacy tooling through the spring,
  and opened v0.14.4 prerelease notes on Sept. 9.
image: /images/news/starknet-upgrade.jpg
imageCaption: "Tel Aviv skyline. Photo: Ynhockey via Wikimedia Commons (CC BY-SA 4.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Tel_Aviv_Skyline_03.jpg
category: News
data-ai-hint: tel aviv skyline
publishedDate: '2026-09-12'
lastUpdated: "2026-09-15"
ogTitle: STARKNET SHIPS FEE OVERHAUL, PRIVACY ENGINE
---

Starknet opened prerelease notes for its v0.14.4 upgrade on Sept. 9, continuing a run of network changes that replaced its fee market, cut gas targets, and added native privacy tooling through the spring and summer. A forum topic for the v0.14.4 prerelease appeared on Sept. 9, [the release thread shows](https://community.starknet.io/t/starknet-0-14-3-pre-release-notes/116211). The contents of that release were not yet published; the thread for the prior version remains the latest detailed account of what changed.

The biggest live change is v0.14.3, which reached mainnet on July 6. It introduced automatic adjustment of the minimum base fee from block to block, based on how full the previous block was against a target, mirroring the EIP-1559 mechanism on Ethereum. Fees are denominated in STRK, and since v0.14.0 transactions specify STRK maximum amounts and prices across three fee categories, [per the prerelease notes](https://community.starknet.io/t/starknet-0-14-3-pre-release-notes/116211). The same upgrade cut the target amount of L2 gas per block by 30 percent while leaving the maximum unchanged, raised the gas cost of reads and writes to compensate, and shortened block times.

That fee-market work sits on top of the v0.14.0 release, codenamed Grinta, which went live on Sept. 1, 2025. Grinta cut block times from about 30 seconds to about 6 seconds, moved sequencing to three sequencers running Tendermint consensus, and made STRK the only token accepted for transaction fees, replacing ETH and then a dual ETH-and-STRK period. The sequencer may convert part of fee revenue into ETH to cover its own Layer 1 gas costs, [the protocol documentation says](https://docs.starknet.io/learn/protocol/strk). Older transaction versions fell out of support in the same release.

The v0.14 line also carried Starknet's privacy push. Version 0.14.2, live on mainnet since April 20, added in-protocol proof verification, letting transactions reference off-chain proofs through new fields in the Invoke transaction type. That change enabled confidential state transitions and opened the way for encrypted balances and private Bitcoin on the network, [Starknet said](https://www.starknet.io/blog/starknet-v0-14-2-the-privacy-engine-arrives). The release also repriced storage and shipped StarkGate version 3.

Built on that base, May brought strkBTC, an ERC-20 token on Starknet backed by BTC locked on Bitcoin. It runs in two modes: a public mode that behaves like an ordinary ERC-20, and a shielded mode that hides balances and transfers. Wallets including Xverse and Ready support it, bridging runs through StarkWare and Atomiq infrastructure plus Garden Finance, and DeFi integrations cover lending on Vesu, liquidity provision on Ekubo, and liquid staking of xstrkBTC on Endur, [according to the launch post](https://www.starknet.io/blog/strkbtc-is-live-private-bitcoin-arrives-on-starknet/).

June extended the same tooling to Circle's USDC. Privacy features for USDC went live via the STRK20 token standard: balances can be shielded, transferred privately, and used in DeFi without leaving the ERC-20 format, with asset type, amount, and wallets hidden. Each transaction carries a fixed fee rather than a percentage toll, and a viewing key held by a third-party auditor and scoped to individual users covers legal requests, [the announcement says](https://www.starknet.io/blog/privacy-features-for-usdc-on-starknet/). Starknet opened the wider privacy stack to builders on July 15 and published a compliance layer for onchain privacy a day earlier.

A separate track is quantum readiness. On Aug. 7, Starknet described a transfer on mainnet of about six cents using a quantum-resistant wallet, settled publicly and verifiable on an explorer. The wallet switched from elliptic-curve to quantum-resistant signatures on its own, with no fork, no coordinated migration, and no new address, though the project called the effort experimental and unaudited, [per the post](https://www.starknet.io/blog/quantum-resistance). The argument for the network's head start is architectural: Starknet proves computation with STARKs built on hash functions rather than elliptic curves, and every account is a smart contract that chooses its accepted signatures in code. The demonstration used the Falcon-512 post-quantum scheme, with S2morrow showing a working account in Cairo and OpenZeppelin publishing deployable versions and building the account behind the transfer.

That demo followed a formal three-phase roadmap published June 30. Phase one replaces Pedersen hashing, which rests on elliptic-curve assumptions, with BLAKE2 across the state, chain environment, and consensus, with the operating-system configuration hash change already on testnet and due on mainnet in early July and the remaining items about two months out. Phase two carries older contracts forward; phase three depends on Ethereum, covering bridge signature syscalls and EIP-4844 KZG blobs, [StarkWare wrote](https://starkware.co/blog/the-architecture-advantage-starknets-quantum-readiness-roadmap/).

Staking underpins the economics of all of it. Validators must hold at least 20,000 STRK on mainnet, delegators face no minimum, and withdrawals lock for seven days. The protocol is in the second of four planned staking phases, Bitcoin wrappers have been stakable for STRK rewards since the third quarter of 2025, and validator power blends self-stake and delegated stake with a weighting factor of 0.25, [the documentation says](https://docs.starknet.io/learn/protocol/staking). Rewards come from newly minted STRK under a minting curve.

All of this descends from earlier scaling work, including the v0.13.2 upgrade of August 2024, which introduced optimistic parallelization in the sequencer so independent transactions could execute simultaneously rather than one by one. Its [version notes](https://docs.starknet.io/learn/cheatsheets/version-notes.md) list the feature alongside block packing, a change meant to cut fixed Layer 1 costs and shorten confirmation times. What v0.14.4 adds to the stack should become clear as its prerelease notes fill in; for now the verified record shows a network that spent 2026 repricing its blocks, privatizing its transfers, and preparing its cryptography in parallel.
