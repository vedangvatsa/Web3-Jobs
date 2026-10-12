---
title: Solana activates final 200-millisecond slots at epoch 1053
ogTitle: "SOLANA ACTIVATES FINAL 200-MILLISECOND SLOTS"
description: Solana cut slot time to 200 milliseconds on Oct. 9 at epoch 1053, completing the four-step SIMD-0525 rollout from 400 milliseconds and doubling block-production opportunities ahead of Alpenglow.
image: /images/news/slot-times.jpg
imageCaption: "Rows of servers in a data center. Photo: BalticServers.com via Wikimedia Commons (CC BY-SA 3.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:BalticServers_data_center.jpg
category: News
data-ai-hint: data center server racks
publishedDate: '2026-10-12'
lastUpdated: '2026-10-12'
---

Solana cut its slot time to 200 milliseconds on Oct. 9, the fourth and final step of a rollout that halved block times from 400 milliseconds. The change took effect at epoch 1053, slot 454,896,000, at about 14:35 UTC, according to Solana's [upgrade page](https://solana.com/upgrades/reduced-slot-times).

The schedule comes from SIMD-0525, titled Reduce Slot Times and authored by Anza's Brennan Watt. It was first discussed in SIMD Discussion 469 and formally proposed in May. It laid out four 50-millisecond cuts: 350 milliseconds on Aug. 21 at epoch 1020, 300 on Aug. 28 at epoch 1024, 250 on Sept. 18 at epoch 1037, and 200 on Oct. 9 at epoch 1053. All four feature gates now show as live on mainnet, the [page says](https://solana.com/upgrades/reduced-slot-times). The page carries an October 2026 update stamp. The Agave 4.2 overview dates to August 2026 and the Alpenglow page to September 2026. Compass noted that no epoch-wide 200-millisecond average existed as of 15:21 UTC on Oct. 9, with the epoch less than an hour old.

CoinDesk previewed the final step hours before the boundary, writing that the network would move from 250 to 200 milliseconds at epoch 1053 around 15:00 UTC on Oct. 9, in its [Oct. 9 report](https://www.coindesk.com/tech/2026/10/09/solana-is-about-to-halve-its-block-times-as-final-200-millisecond-upgrade-nears). The piece, by Shaurya Malwa and published at 1 a.m. EDT, used Anza's pre-estimate, which is why its 15:00 UTC differs by minutes from the 14:35 to 14:40 UTC times confirmed after the fact. Anza confirmed completion at 14:42 UTC, shortly after the network crossed into the epoch, Solana Compass [reported](https://solanacompass.com/news/solanas-200ms-slot-time-is-live-on-mainnet-at-epoch-1053-completing-simd-0525) at 15:25 UTC.

## What changes for the network

Five block-production opportunities per second replace the previous two and a half. An epoch now takes about a day instead of two. "Blocks land twice as often. An epoch now takes about a day instead of two," Anza said, in remarks [CryptoSlate carried](https://cryptoslate.com/solana-doubles-block-production-speed-to-200ms-as-network-prepares-for-alpenglow-upgrade/) in its Oct. 10 confirmation.

Faster slots mean smaller blocks. The per-block limit drops to 30 million compute units at 200 milliseconds from 37.5 million at 250, keeping total capacity roughly flat while a leader's four-slot window shrinks from 1.6 seconds to 800 milliseconds. Measured times run above the targets: the 250-millisecond stage averaged about 266 to 269 milliseconds in practice, and an early 200-millisecond sample across 1,413 slots came in near 222 milliseconds, [CryptoSlate reported](https://cryptoslate.com/solana-doubles-block-production-speed-to-200ms-as-network-prepares-for-alpenglow-upgrade/).

Each cut had its own feature gate, activated independently and taking effect about an epoch later. Core developers spaced the steps to watch cluster performance, with block skip rates as the gating check. The network would not move to the next reduction if skip rates ran too high, according to the [SIMD-0525 proposal](https://github.com/solana-foundation/solana-improvement-documents/blob/main/proposals/0525-reduce-slot-times.md). The GitHub file still carries a Draft status label, which looks stale against the live activation, so this report treats the status field as outdated rather than current. No validator vote count for the reductions appears in the opened sources. Measured history shows targets running warm: Compass records stage averages of 415 to 423 milliseconds under the 400 target, 365 to 367 under 350, 315 to 317 under 300, and 266 to 269 under 250, in its [Oct. 9 confirmation](https://solanacompass.com/news/solanas-200ms-slot-time-is-live-on-mainnet-at-epoch-1053-completing-simd-0525).

This is distinct from the Sept. 18 move to 250 milliseconds covered earlier. The 200-millisecond activation is a new event at a new epoch, confirmed after the fact rather than scheduled.

## Alpenglow stays separate

Solana Foundation vice president of technology Jacob Creech celebrated the completion and named Alpenglow as the next milestone, [CryptoSlate reported](https://cryptoslate.com/solana-doubles-block-production-speed-to-200ms-as-network-prepares-for-alpenglow-upgrade/). The slot-time cut changes block-production cadence. Alpenglow, tracked as SIMD-0326, replaces the TowerBFT consensus with a design called Votor and targets about 150 milliseconds to finality against roughly 12.8 seconds today, leaving execution unchanged. Agave 4.2 ships Alpenglow code without activating it on mainnet, with activation expected in Agave 4.3 targeted for October, Solana's [release overview](https://solana.com/upgrades/agave-4-2-release-overview) says. Testnet and devnet runs are done. No mainnet date has been announced, [as noted Oct. 10](https://cryptoslate.com/solana-doubles-block-production-speed-to-200ms-as-network-prepares-for-alpenglow-upgrade/). Blockhash expiry now sits at 30 seconds, or 150 blocks, against 60 seconds at the old 400-millisecond cadence.
