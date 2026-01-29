---
title: "What is a Balancer Weighted Pool?"
description: "A comprehensive guide to Balancer's Weighted Pools, a powerful DeFi primitive that allows for multi-asset liquidity pools with custom, unequal weightings."
category: "Educational"
image: "https://picsum.photos/seed/balancer/1200/630"
data-ai-hint: "balancer weighted pool"
---

## What is a Balancer Weighted Pool? A Complete Guide

Balancer is a decentralized exchange (DEX) and automated portfolio manager that offers a more flexible and powerful alternative to standard Automated Market Makers (AMMs). Its flagship product, the **Weighted Pool**, is a type of liquidity pool that generalizes the **[constant product formula](/understanding-constant-product-formula)** to allow for more than two assets and, most importantly, custom, unequal weightings for each asset.

Instead of a simple 50/50 split between two tokens, a Balancer Weighted Pool can hold up to eight different tokens, each with its own target weight (e.g., 40% WETH, 30% WBTC, 20% USDC, 10% DAI). This transforms a liquidity pool from a simple trading venue into a self-rebalancing index fund.

This guide explores what Balancer Weighted Pools are, the mechanics behind them, and the unique use cases they enable for both traders and liquidity providers.

### Key Insights

*   **Beyond 50/50**: Weighted Pools break the rigid 50/50 allocation of traditional AMMs, allowing for multi-token pools with custom weights.
*   **Self-Rebalancing Index Fund**: A Weighted Pool acts like an automated index fund. Arbitrageurs constantly rebalance the pool to maintain the target weights, generating fees for liquidity providers.
*   **Generalized Formula**: Balancer uses a generalized version of the constant product formula that can accommodate multiple tokens and custom weights.
*   **Use Cases**: They are ideal for creating token indexes, bootstrapping liquidity for new projects (**[Liquidity Bootstrapping Pools](/what-is-a-liquidity-bootstrapping-pool)**), and allowing LPs to maintain a desired portfolio exposure.
*   **For Traders**: They enable efficient trading between any two tokens within the pool, even if a direct pair doesn't exist elsewhere.

### The Limitation of Traditional 50/50 Pools

In a standard AMM like Uniswap v2, liquidity providers are forced into a 50/50 value split. If you want to provide liquidity for an ETH/DAI pair, you must deposit an equal value of both ETH and DAI.

This creates several limitations:
*   **Inflexible Exposure**: An LP who is bullish on ETH and wants to maintain a portfolio of 80% ETH and 20% DAI cannot do so while providing liquidity. They are forced into a 50/50 exposure.
*   **Limited to Two Assets**: Standard pools are limited to only two assets, making multi-asset swaps inefficient.

### The Balancer Solution: Weighted Pools

Balancer's Weighted Pools solve these problems by allowing pool creators to define the assets and their target weights.

**The Formula:**
The value function for a Balancer Weighted Pool is a generalization of `x * y = k`. For a pool with *n* tokens, the invariant is:

V = Π (Balance of Token *i*)^(Weight of Token *i*)

Where Π represents the product of all tokens in the pool. The goal of the pool is to keep this value `V` constant.

**How it Works in Practice:**
Let's consider a three-token pool:
*   40% WETH
*   40% USDC
*   20% LINK

1.  **Initial Deposit**: A liquidity provider deposits assets into the pool according to these weights.
2.  **Trading**: Traders can now use this pool to swap between any of the three assets (e.g., USDC to WETH, WETH to LINK, or USDC to LINK).
3.  **Rebalancing through Arbitrage**: Imagine the price of WETH goes up. Traders will sell WETH into the pool to take profits, increasing the amount of WETH relative to the other assets. The pool is now imbalanced. **[Arbitrageurs](/arbitrage-opportunities-in-defi-markets)** will see this and buy the "cheap" WETH out of the pool, selling USDC and LINK into it until the pool's value returns to its target 40/40/20 weights.
4.  **Fee Generation**: Every one of these trades (both from users and arbitrageurs) generates a trading fee, which is collected by the liquidity providers.

### Key Use Cases for Weighted Pools

#### 1. Automated Index Funds

A Weighted Pool effectively acts as a self-rebalancing index fund. If you want to hold a portfolio that tracks a basket of DeFi blue-chip tokens, you can provide liquidity to a Weighted Pool containing those tokens. Instead of paying a fund manager, you *get paid* in trading fees as arbitrageurs do the work of rebalancing the portfolio for you.

#### 2. Liquidity Bootstrapping Pools (LBPs)

This is one of Balancer's most famous use cases. An LBP is a special type of Weighted Pool designed for new projects to launch a token fairly.
*   It typically starts with a high weight for the project's token and a low weight for the collateral token (e.g., 90% PROJECT / 10% USDC).
*   Over a set period, the pool's weights are programmed to automatically shift, for example, to 50/50.
*   This creates downward pressure on the price, forcing genuine price discovery and preventing front-running bots from buying up the entire supply at the start. It allows the team to launch a token with a small amount of initial seed capital.

#### 3. Flexible Liquidity Provision

Weighted Pools give LPs the freedom to provide liquidity while maintaining their desired portfolio exposure. An LP who is long-term bullish on ETH but wants to earn fees can create or join an 80/20 ETH/DAI pool. This allows them to keep a larger exposure to ETH while still putting their capital to work.

### Frequently Asked Questions (FAQ)

**Q: How many tokens can be in a Weighted Pool?**
A: Balancer v2 supports up to 8 tokens per Weighted Pool.

**Q: Do Weighted Pools suffer from impermanent loss?**
A: Yes. Just like any AMM that holds volatile assets, LPs in Weighted Pools are exposed to impermanent loss. The more volatile the assets in the pool, the higher the risk.

**Q: Who sets the trading fee for a pool?**
A: The creator of the pool sets the trading fee. This fee can be fixed or can be managed by the pool owner. This is another layer of flexibility compared to protocols with fixed, protocol-wide fees.

**Q_ What is the difference between Balancer v1 and v2?**
A: Balancer v2 introduced a significant architectural change with the "single vault." In v1, each pool was a separate smart contract holding its own assets. In v2, all assets from all pools are held in one master vault contract. The pools themselves just contain the logic. This makes multi-hop trades between different pools extremely gas-efficient.

