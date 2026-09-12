---
title: Uniswap Documents StablePair Hook and Initial Ethereum Pools
description: >-
  Uniswap's official v4 hooks repository documents StablePairHook, a dynamic-fee
  hook for two assets expected to trade at parity, and lists USDC/USDT and
  USDC/USDG as initial Ethereum pools.
image: >-
  /api/og?type=article&title=Uniswap%20Documents%20StablePair%20Hook%20and%20Initial%20Ethereum%20Pools
category: News
data-ai-hint: stablecoin liquidity pool
publishedDate: '2026-09-12'
lastUpdated: '2026-09-12'
ogTitle: UNISWAP DEPLOYS STABLEPAIR HOOK ON ETHEREUM
---

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
