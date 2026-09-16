---
title: Uniswap Documents StablePair Hook and Initial Ethereum Pools
description: >-
  Uniswap's official v4 hooks repository documents StablePairHook, a dynamic-fee
  hook for two assets expected to trade at parity, and lists USDC/USDT and
  USDC/USDG as initial Ethereum pools.
image: /images/news/uniswap-hook.jpg
imageCaption: "Ethereum founder Vitalik Buterin on stage in 2015. Photo: John Phillips via Wikimedia Commons (CC BY 2.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Vitalik_Buterin_TechCrunch_London_2015.jpg
category: News
data-ai-hint: vitalik buterin ethereum stage
publishedDate: '2026-09-12'
lastUpdated: "2026-09-15"
ogTitle: UNISWAP DEPLOYS STABLEPAIR HOOK ON ETHEREUM
---

Uniswap Labs launched StablePair Hook on Sept. 10, a Uniswap v4 dynamic-fee hook built for stable pairs such as USDC/USDT, live on Ethereum mainnet with two pools: USDC/USDG and USDC/USDT. "StablePair Hook gives traders consistent, predictable quotes on every swap, and LPs a bigger share of the value they create," [the company said](https://blog.uniswap.org/stablepair-hook-a-fee-that-moves-with-the-market). The venue is large: stablecoin-to-stablecoin swaps on the Uniswap protocol alone reached $43.4 billion in the second quarter of 2026, more than the next three onchain venues combined, [per the launch post](https://blog.uniswap.org/stablepair-hook-a-fee-that-moves-with-the-market).

Uniswap's [official v4 hooks repository](https://github.com/Uniswap/v4-hooks-public) describes StablePairHook as a dynamic-fee hook for pools of two assets expected to hold the same price. Its deployment table lists USDC/USDT and USDC/USDG pools on Ethereum, both initialized on Sept. 10, 2026.

The hook's [technical specification](https://github.com/Uniswap/v4-hooks-public/blob/main/docs/technical/StablePairHook.md) says it overrides the liquidity-provider fee before each swap, using the pool's automated-market-maker price relative to a configured reference price. The specification calls the reference price the pair's "true" exchange rate; it is a configured pool parameter, not a guarantee of an external market price.

## Fees tied to the pool price

Within a configured range around the reference price, the specification says the hook sets fees to make pre-impact buy and sell prices consistent. Outside that range, swaps that move the price farther from the reference pay no liquidity-provider fee, while fees on swaps toward the reference decay over time toward a target fee. Actual execution prices also depend on swap size and liquidity depth, according to the [specification](https://github.com/Uniswap/v4-hooks-public/blob/main/docs/technical/StablePairHook.md).

The configuration is pool-specific. The repository's technical specification identifies the configurable reference price, range width, decay factor and target multiplier, but the public deployment table does not publish the values selected for either initial pool.

## A v4 hook rather than a new exchange

StablePair Hook uses the hooks system introduced with Uniswap v4. Under the [official v4 documentation](https://docs.uniswap.org/contracts/v4/concepts/hooks), a hook is an external smart contract attached to an individual liquidity pool. Hooks are optional: a v4 pool can operate without one. Where a hook is used, it can add custom behavior at defined points in a pool's lifecycle instead of requiring all pools to follow the same behavior.

The documentation says a pool can have one hook contract, while one hook can serve many pools. The hook is specified when a pool is created, as part of its pool configuration. It cannot later be added to a pool that was created without a hook, removed from a pool that has one, or exchanged for a different hook. A pool seeking a different hook would need to be created with that hook.

V4 makes hook calls available around initialization, liquidity additions and removals, swaps, and donations to liquidity providers. Developers choose which of those available lifecycle functions their contract implements, according to the [v4 hooks documentation](https://docs.uniswap.org/contracts/v4/concepts/hooks). The documentation also lists dynamic fees among the cases where a hook may be used. StablePairHook's [technical specification](https://github.com/Uniswap/v4-hooks-public/blob/main/docs/technical/StablePairHook.md) identifies `beforeSwap` as its fee-calculation entry point.

The StablePairHook repository supplies the [source code](https://github.com/Uniswap/v4-hooks-public/tree/main/src/stable), [technical specification](https://github.com/Uniswap/v4-hooks-public/blob/main/docs/technical/StablePairHook.md), Ethereum proxy address, pool IDs and an OpenZeppelin audit link. Its deployment table says the proxy's owner and configuration manager are the Uniswap Governance Timelock, so fee-configuration changes and implementation upgrades go through governance proposals.

The v4 documentation cautions that creating a hook does not automatically route liquidity to it from the Uniswap frontend. The repository identifies initial pools and their deployment records, but does not report their liquidity, routing or observed results.

## Corrective swaps run as auctions

The launch post spells out the mechanism in plainer terms than the specification. On every swap, the hook measures how far the pool has drifted from its reference price and sets the fee to match. Inside a tight band around that rate, the fee adjusts under every swap to quote a fixed bid-ask spread. Once the price drifts outside the band, swaps pushing it further off pay no fee, since they hand the pool a good price to begin with, [Uniswap explains](https://blog.uniswap.org/stablepair-hook-a-fee-that-moves-with-the-market). Swaps correcting the price from outside the band go through a Dutch auction: the fee starts high, then drops with each block until someone takes the trade, and liquidity providers keep the difference.

StablePair joins DualPool, Permissioned Pools, and LitePSM in the hook family, with more on the roadmap. Pool parameters and fee logic can be upgraded through Uniswap governance, so the mechanism can improve without pools migrating, [per the post](https://blog.uniswap.org/stablepair-hook-a-fee-that-moves-with-the-market).

## The USDG side of the first pools

One of the two launch pools pairs USDC with Global Dollar, or USDG, the stablecoin of a network that passed $3 billion in circulation across more than 150 partners as of Sept. 3, [PR Newswire reported](https://www.prnewswire.com/news-releases/mantle-joins-global-dollar-network-as-usdg-circulation-surpasses-3b-across-150-partners-302869024.html). USDG is issued by Paxos Digital Singapore, a Major Payments Institution supervised by the Monetary Authority of Singapore, with a European issuance arm under Finnish supervision that complies with MiCA, [the network says](https://globaldollar.com/network). Paxos holds only dollar deposits, short-term U.S. government securities, and cash equivalents against the tokens, keeping one-to-one parity with redemption for fiat at all times, and DBS, Southeast Asia's largest bank, handles cash management and custody, [Paxos said at launch](https://www.paxos.com/newsroom/paxos-introduces-global-dollar-usdg). Unlike issuers that keep reserve revenue, the network passes rewards back to partners based on minting, custody, and acceptance, with partners receiving up to the full return on backing assets held on the platform. Members include Anchorage Digital, Bullish, Kraken, OKX, Paxos, Robinhood, and Worldpay.

The hook arrives as dollar-pegged trading concentrates. Adjusted stablecoin transaction volume hit a record $1.79 trillion in June 2026, up 63 percent from May and 125 percent from a year earlier, with $8.82 trillion moving in the first half. USDC carried about 70 percent of that adjusted volume against about 25 percent for USDT, [CoinDesk reported in July](https://www.coindesk.com/business/2026/07/06/circle-s-usdc-is-leaving-tether-behind-in-the-stablecoin-volume-race). A hook tuned for exactly the USDC pairs dominating those flows is a direct bid for the deepest stable liquidity onchain.
