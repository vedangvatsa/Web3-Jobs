---
title: StableSwap Invariant Explained for Traders
description: >-
 A deep dive into the StableSwap invariant, the unique algorithm powering Curve
 Finance that enables highly efficient trading of pegged assets like
 stablecoins.
category: Educational
image: 'https://picsum.photos/seed/stableswap/1200/630'
data-ai-hint: stableswap invariant
publishedDate: '2026-03-11'
lastUpdated: "2026-08-28"
---

## The StableSwap Invariant Explained for Traders and LPs

In Decentralized Finance ([DeFi](/what-is-defi)), automated market makers (AMMs) use mathematical formulas called invariants to price assets. The most well-known invariant is the **[constant product formula](/understanding-constant-product-formula)** (`x * y = k`), which Uniswap v2 employs. However, this formula lacks efficiency for trading pegged assets such as stablecoins.

The **StableSwap invariant**, designed by Curve Finance, addresses this inefficiency. It serves as a specialized bonding curve optimized for trading pegged assets, such as stablecoins, by creating a hybrid curve. This curve is flatter than the constant product curve, resulting in lower slippage and enhanced capital efficiency. Understanding the StableSwap invariant is essential for grasping why **[Curve pools](/what-is-a-curve-pool-in-defi)** dominate the stablecoin trading market.

This article explains the StableSwap invariant, its functionality, and its advantages in pegged asset swaps.

### Key Insights

| Feature | Description |
|---------|-------------|
| **Hybrid Formula** | The StableSwap invariant smoothly transitions between a constant sum formula (`x + y = k`) and a constant product formula (`x * y = k`). |
| **Primary Goal** | It aims to create a bonding curve that remains flat when liquidity pools are balanced but still offers liquidity when one asset de-pegs. |
| **Low Price Impact** | It results in minimal price impact (slippage) for substantial trades between assets like USDC and DAI. |
| **Amplification Parameter (A)** | The shape of the StableSwap curve is influenced by the amplification parameter `A`. A higher value flattens the curve, concentrating liquidity around the peg. |
| **Capital Efficiency** | Concentrating liquidity enables greater capital efficiency compared to general-purpose AMMs. |

### Limitations of the Constant Product Formula for Stablecoins

The `x * y = k` formula is not suitable for stablecoin pairs like USDC/DAI due to several reasons:

- The `x * y = k` curve forms a hyperbola, distributing liquidity across all possible price points from zero to infinity.
- For stablecoins trading near $1.00, liquidity supporting prices far from this value is essentially ineffective.
- With liquidity spread too thin, even moderately sized trades can lead to significant slippage, pushing the price away from the ideal 1:1 ratio.

### The Ideal (But Unsafe) Constant Sum Formula

For trading two equally valued assets, the **constant sum formula** (`x + y = k`) is ideal:

- This formula represents a straight line.
- It allows for a 1:1 exchange rate with **zero slippage**, regardless of trade size.

However, a pool based on this formula is highly fragile. If one stablecoin, such as USDC, de-pegs and trades at a significantly lower value on other exchanges, arbitrage bots would quickly drain all DAI from the pool, leaving only the de-pegged USDC. This scenario leads to significant losses for liquidity providers.

### The StableSwap Invariant: The Best of Both Worlds

The StableSwap invariant merges the benefits of both the constant sum and constant product formulas. While the actual formula is complex, its behavior can be intuitively understood:

> **The StableSwap invariant functions like a constant sum formula when the pool is balanced, then transitions to a constant product formula as the pool becomes imbalanced.**

- **When Balanced**: In a USDC/DAI pool, when the amounts of USDC and DAI are approximately equal, the curve is nearly flat, resembling the `x + y = k` line. This configuration allows for significant trades with minimal slippage.
- **When Imbalanced**: If one asset begins to de-peg, causing an imbalance, the formula's "amplification" effect diminishes. The curve starts bending, behaving more like the `x * y = k` hyperbola. This adjustment ensures that the pool maintains liquidity, preventing total depletion and protecting liquidity providers.

#### The Amplification Parameter (A)

The **amplification parameter**, or `A`, is important in controlling the StableSwap invariant's behavior:

| A Value | Curve Characteristics |
|---------|-----------------------|
| High | Flatter curve, concentrating liquidity tightly around the 1:1 price. Suitable for stable, highly correlated assets (e.g., USDC/DAI/USDT pool). |
| Low | More curved shape resembling a standard constant product formula. Used for pegged assets with higher volatility (e.g., pools involving different liquid [staking](/how-to-become-a-web3-staking-specialist) derivatives like stETH/rETH). |

By adjusting the `A` parameter, Curve pools optimize for the specific characteristics of their assets.

### Visualizing the Difference

The bonding curves can be visualized as follows:

| Formula Type | Description | Visual Representation |
|-----------------------|-------------------------------------------------|--------------------------------|
| Constant Product | Smooth, symmetric hyperbola | ![Constant Product Curve](https://example.com/constant_product_curve) |
| Constant Sum | Perfect diagonal line | ![Constant Sum Curve](https://example.com/constant_sum_curve) |
| StableSwap (Curve) | Almost flat near the center, sharply curves away | ![StableSwap Curve](https://example.com/stableswap_curve) |

This visual representation illustrates how StableSwap can accommodate significantly more volume with less slippage in the critical price range for pegged assets.

### Frequently Asked Questions (FAQ)

**Why is it called an "invariant"?** 
The term "invariant" refers to the constant value `k` computed by the formula, which remains unchanged during trades, disregarding transaction fees.

**Do I need to understand the math to use Curve?** 
No, traders benefit from low slippage without needing to grasp the underlying mathematics. Liquidity providers enjoy high capital efficiency, as the protocol abstracts the complexity.

**Does the StableSwap invariant eliminate impermanent loss?** 
No, but it considerably reduces impermanent loss for pegged assets. Since the assets are expected to maintain similar prices, the risk is lower compared to pools with volatile assets. However, permanent loss can occur if one stablecoin fails to maintain its peg.

**Is the StableSwap formula used by other protocols?** 
Yes, while Curve pioneered the StableSwap concept, other decentralized exchanges focusing on stable assets have adopted similar hybrid bonding curves.
