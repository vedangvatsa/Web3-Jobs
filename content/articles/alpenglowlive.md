---
title: Solana Alpenglow goes live on mainnet, cutting finality to 150 milliseconds
ogTitle: "SOLANA ALPENGLOW GOES LIVE ON MAINNET"
description: Alpenglow activated on Solana mainnet-beta at slot 459,653,000 on Oct. 21, replacing TowerBFT and cutting transaction finality from about 12.8 seconds to roughly 150 milliseconds.
image: /images/news/alpenglowlive.jpg
imageCaption: "Physical Solana cryptocurrency tokens. Photo: Clearus via Wikimedia Commons (CC BY-SA 4.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Solana_cryptocurrency_two.jpg
category: News
data-ai-hint: Solana physical coins
publishedDate: '2026-10-22'
lastUpdated: '2026-10-22'
---

Solana's Alpenglow consensus protocol went live on mainnet-beta on Wednesday, Oct. 21, replacing TowerBFT at slot 459,653,000 and cutting the time it takes for a transaction to become irreversible from about 12.8 seconds to roughly 150 milliseconds, core engineering team Anza said. The activation was confirmed on the [Solana Foundation's Alpenglow dashboard](https://solana.com/upgrades/alpenglow/dashboard) at around 1:54 p.m. UTC, [Cointelegraph reported](https://cointelegraph.com/news/solanas-alpenglow-launches-mainnet-99-faster-finality).

The handoff ran on the live network without a restart. Validators kept the existing ledger and coordinated a shared switch point before TowerBFT, in service since March 2020, was retired at around 14:00 UTC, [Decrypt reported](https://decrypt.co/381484/solana-alpenglow-goes-live-in-most-ambitious-upgrade-since-ethereums-merge).

What changed is finality, the moment a transfer stops being reversible, which is the point exchanges, banks and merchants wait for before treating funds as moved. Solana's old system offered a quick conditional confirmation but needed about 12.8 seconds for the irreversible state; Alpenglow collapses both steps into a single vote round.

"This is the largest, most ambitious blockchain upgrade since 'The Merge' and Anza took it from a white paper to running on mainnet in under 18 months," Anza CEO Brennan Watt said, referring to Ethereum's 2022 switch to proof of stake.

## Votor now, Rotor later

What shipped on Oct. 21 is Votor, the voting half of Alpenglow. Validators now pass signed votes peer-to-peer rather than embedding them in later blocks, with weight set by stake. A block finalizes at once when 80 percent or more of stake backs it in the first round. Support between 60 and 80 percent sends the decision to a second round with 60 percent thresholds for finalizing or skipping.

"If you have 80% of the votes say yes, then it's immediately done," Anza head of research Roger Wattenhofer said in an [interview](https://www.youtube.com/watch?v=2RlNav7GiUY) with Solana Foundation technology vice president Jacob Creech published last month. "You immediately know that the block is final."

Wattenhofer said the design tolerates up to 20 percent of stake acting maliciously while another 20 percent sits offline. After 10 seconds without a finalized block, validators stretch block times incrementally until messages land.

Rotor, which would replace Turbine's block propagation with a single relay layer, is the second phase and is not yet scheduled, according to the Solana Foundation's upgrade page. Quantumglow, a research design that would swap Alpenglow's elliptic-curve cryptography for hash-based signatures to resist quantum computers, also has no timeline, Decrypt noted.

## Measured performance after the handoff

At press time after the upgrade, the Solana mainnet showed a 6.6-second transaction finality and a throughput of 4,721 transactions per second on the Alpenglow dashboard, [Cointelegraph reported](https://cointelegraph.com/news/solanas-alpenglow-launches-mainnet-99-faster-finality). That reading is a live network measurement, not the protocol's design target of roughly 150 milliseconds under ideal conditions.

The rollout followed months of preparation: a community test cluster where operators rehearsed the switch, then testnet and devnet activations, alongside red teaming, penetration testing and a security competition. Anza shipped the protocol in its Agave validator software, and independent operators ran the mainnet handoff.

Anza's team published the Alpenglow design in May 2025; the research group is led by ETH Zurich professor Roger Wattenhofer, with Quentin Kniep and Kobi Sliwinski among the authors. Validators approved the upgrade in September 2025, voting 98 percent in favor of SIMD-0236. Anza confirmed the Oct. 21 date on Oct. 13.

Vote traffic leaves blocks entirely under Alpenglow. Validators stop paying about 1 SOL per epoch in vote transaction fees from their identity accounts. In its place each voting validator pays a flat 0.8 SOL per epoch from its vote account, on top of the rent-exempt minimum, under the [Validator Admission Ticket](https://solana.com/upgrades/alpenglow#breaking-change-your-vote-account-pays-the-vat-fee). That accounting shift will reduce headline transaction counts, since vote transactions had been a large share of transactions in a block.

Further upgrades are planned. Rotor will change how block data spreads across the network, and geographically aware leader rotation aims to cut delays as block production passes between validators. Developers at Jump Crypto's Firedancer team have also proposed scrapping Solana's cap of 60 million compute units per block once Alpenglow is live. None of those changes has a committed date.
