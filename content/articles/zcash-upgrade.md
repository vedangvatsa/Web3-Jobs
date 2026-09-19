---
title: Zcash Community Approves NU7 Upgrade With 25-Second Blocks and 2031 Reserve Plan
ogTitle: "ZCASH COMMUNITY APPROVES NU7 UPGRADE WITH 25-SECOND BLOCKS"
description: Zcash coinholders approved preserving scheduled halvings and delaying the release of Network Sustainability Mechanism funds to 2031 in an advisory poll for the upcoming NU7 upgrade.
image: /images/news/zcash-upgrade.jpg
imageCaption: "Zooko Wilcox speaking on payment privacy. Photo: Steve Jurvetson via Wikimedia Commons (CC BY 2.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Zooko%20Wilcox%20on%20Payment%20Privacy%20(51071658282).png
category: News
data-ai-hint: zooko wilcox zcash payment privacy
publishedDate: '2026-09-19'
lastUpdated: '2026-09-19'
---

Zcash coinholders voted to keep the network's quadrennial halving schedule and delay returning burned transaction fees to block rewards until February 2031. The advisory ballot covered five architectural questions for NU7, the privacy chain's next major network upgrade. Between 2.399 million and 2.404 million ZEC participated in each question, with all five easily surpassing the one-million coin threshold required for the vote to be recognized as representative under the [poll rules](https://forum.zcashcommunity.com/t/nu7-coinholder-vote/56912).

The outcome gives protocol developers an unambiguous mandate on monetary policy while setting technical parameters for faster blocks and legacy transaction deprecation. The advisory vote does not automatically activate code on mainnet or bind developers, but core teams have agreed to treat the tally as the decisive signal for finalizing upgrade specifications.

## Halvings preserved by 98 percent margin

The central monetary question asked whether the Network Sustainability Mechanism, an architectural subsystem introduced to capture transaction fees and burnt coins, should replace Zcash's periodic four-year halvings with a continuous, smoothed issuance curve. Proponents of smoothing had argued that gradual reductions would soften the revenue shocks that proof-of-work miners face every four years. Opponents maintained that predictable halvings preserve the monetary shell that attracted original Bitcoin-aligned holders to Zcash.

The [final tally](https://forum.zcashcommunity.com/t/nu7-coinholder-vote/56912/42) recorded 2,375,932.375 ZEC in favor of preserving scheduled halvings, compared with 22,384.875 ZEC for smoothing issuance, a margin exceeding 98.9 percent. The result ensures that Zcash block rewards will continue to step down at fixed block intervals matching Bitcoin's traditional 210,000-block rhythm.

A companion ballot question decided when the network should start recycling coins collected by the Network Sustainability Mechanism back into mining distributions. Holders backed a conservative timetable, with 2,319,643.75 ZEC voting to hold accumulated fees in reserve until February 2031. A proposal to begin disbursing recycled funds as soon as NU7 activates drew 70,239.625 ZEC, while an intermediate start date of February 2027 received 6,283 ZEC.

Holding the mechanism's reserve untouched until 2031 means transaction fees burned under current fee policies will remain locked for more than four years, reducing circulating supply inflation during the transition. The choice also gives core developers time to evaluate fee market dynamics without the mathematical distortion of immediate fee reissuance.

## Faster block times and Sprout retirement

Voters also approved technical changes aimed at speeding up transaction settlement. Nearly 2.4 million ZEC backed reducing target block intervals from 75 seconds down to 25 seconds. If implemented, the change will triple the rate of block production while proportionally reducing the per-block reward so that total daily issuance remains constant.

To prevent faster blocks from overloading nodes with mempool spam, the proposal pairs the 25-second target with strict per-pool action limits. Those limits restrict the number of transparent and shielded operations packed into each block, bounding resource requirements for validation and keeping verification lightweight on consumer hardware.

Legacy transactions faced a decisive verdict as well. About 2.33 million ZEC approved disabling Sprout-era v4 transactions upon NU7 activation. Sprout was Zcash's original 2016 zero-knowledge shielded pool, which relied on slower cryptographic proofs and required a trusted setup. While Sprout addresses have long been deprecated in favor of Sapling and Orchard pools, older node implementations retained parsing logic for v4 transaction formats. Disabling them cleans up legacy verification code paths across core node clients.

A fifth operational question asked whether teams should ship NU7 on schedule even if secondary features miss their deadlines. Approximately 2.38 million ZEC voted to release NU7 without any component that fails to meet a Sept. 30 implementation cutoff, signaling community impatience with past upgrade delays.

## Constituency differences and developer alignment

The coin-weighted ballot contrasted with earlier surveys among non-capital governance groups. The [Zcash Community Advisory Panel](https://zfnd.org/zcap-polling-results-nu7-scope/), a curated advisory body of contributors, researchers, and ecosystem participants administered by the Zcash Foundation, exhibited more division in its polling. Out of 198 eligible advisory members, 135 cast ballots, yielding a 68 percent participation rate. Advisory panel members narrowly favored smoothed issuance and showed stronger appetite for earlier fee recycling starting in 2027.

Despite the divergence between individual headcount and capital weighting, key development organizations confirmed they will follow the coinholder mandate. In a Sept. 15 [discussion summary](https://forum.zcashcommunity.com/t/nu7-sentiment-polls-results/57590), representatives from Shielded Labs, Project Tachyon, ZODL, the Zcash Foundation, and the Valar Group agreed on the February 2031 reserve activation date as the most conservative and consensus-backed path forward. The joint note stated that another governance poll could revisit parameters in future upgrade cycles if fee market dynamics warrant revision.

## Implementation roadmap

The engineering focus now shifts to protocol specification and client implementation across Zebra and zcashd codebases. As of mid-September 2026, the official [NU7 upgrade specification page](https://z.cash/upgrade/nu7/) indicated that the activation block height had not yet been assigned. Technical specifications governing the 25-second block cadence, pool action caps, and halving-preservation mathematics remain open as draft Zcash Improvement Proposals.

Engineers maintain two independent node stacks that must align on consensus rules before activation: Zebra, written in Rust by the Zcash Foundation, and zcashd, the C++ client originally adapted from Bitcoin Core. Both software clients must implement identical transaction parsing rules for v4 transaction deprecation and block validation before public testnet deployment. Mining pools must also reconfigure stratum dispatch software to handle the three-fold increase in block template distribution necessitated by the 25-second target spacing.

Testnet activation is expected in the fourth quarter of 2026 once the Sept. 30 feature cutoff locks down candidate specifications. After testnet stability is demonstrated, node operators and exchanges will receive release binaries containing the hard fork activation height.

