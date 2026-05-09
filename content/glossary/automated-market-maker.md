---
term: Automated Market Maker
slug: automated-market-maker
category: defi
difficulty: beginner
image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&q=80"
description: An Automated Market Maker (AMM) is a smart contract that enables trading by maintaining liquidity pools rather than matching buyers and sellers. AMMs use mathematical formulas to determine prices automatically based on pool reserves, eliminating the need for order books and enabling decentralized exchanges.
relatedTerms:
 - liquidity-pool
 - decentralized-exchange
 - constant-product-formula
 - liquidity-provider
 - slippage
synonyms:
 - Liquidity pool
 - Constant product market maker
 - Decentralized exchange
---

An **Automated Market Maker (AMM)** is a **smart contract that enables trading by maintaining liquidity pools and using mathematical formulas to determine asset prices automatically**. Instead of traditional order books where buyers and sellers directly match, AMMs allow anyone to trade against a pool of assets, with prices determined algorithmically based on the ratio of assets in the pool.

Uniswap popularized AMMs in 2018, launching with the constant-product formula (x × y = k). This innovation enabled decentralized trading without order books, market makers, or centralized intermediaries. AMMs process significant trading volume and represent a dominant trading mechanism in DeFi.

AMMs introduce unique challenges, such as impermanent loss and slippage, that traditional order book exchanges do not have. Understanding how AMMs work is fundamental to DeFi.

## How AMMs Work

### The Constant Product Formula

The most common AMM formula is **x × y = k**:

- **Definition**:
- x = amount of token A in pool
- y = amount of token B in pool
- k = constant (product of x and y at any time)

- **Example**:
- Uniswap ETH/USDC pool with 1000 ETH and 2,000,000 USDC
- k = 1000 × 2,000,000 = 2,000,000,000

### Trading

When someone swaps tokens, they:
1. Send tokens to the pool (input)
2. Receive different tokens from the pool (output)
3. The pool maintains **x × y = k**

- **Example: Swapping 100 USDC for ETH**

Starting state: 1000 ETH, 2,000,000 USDC

1. User sends 100 USDC to pool
2. New USDC: 2,000,100 USDC
3. Calculate new ETH using k: 1000 × 2,000,000 = x × 2,000,100
4. x = 2,000,000,000 ÷ 2,000,100 = 999.95 ETH
5. User receives: 1000 - 999.95 = 0.05 ETH
6. Price: 100 USDC ÷ 0.05 ETH = 2000 USDC/ETH (market price)

- **Key Insight**: As the pool becomes less balanced, prices become worse for traders, increasing slippage.

### Liquidity Providers

- **Role**: Liquidity Providers (LPs) deposit equal values of both assets to the pool.

- **Process**:
1. LP deposits 1 ETH + 2000 USDC to the pool
2. LP receives pool tokens (LP shares) representing their portion
3. LP earns a percentage of all trading fees (typically 0.3%-1%)
4. LP can withdraw anytime by burning pool tokens

- **Risk**: If prices diverge significantly, LPs suffer **impermanent loss**; they would have been better off just holding the assets.

## Types of AMMs

### Constant Product (Uniswap V2, Raydium)

- **Formula**: x × y = k

- **Characteristics**:
- Simple formula
- Requires large trades to move prices significantly
- Works well for all token pairs

### Constant Sum (Curve Finance, in a simplified form)

- **Formula**: x + y = k (for stablecoins)

- **Characteristics**:
- Designed for stablecoin pairs (similar valued assets)
- Much lower slippage for similar-valued assets
- Can become unbalanced (price at boundary = infinity)

### Constant Mean (Balancer)

- **Formula**: (x^w1) × (y^w2) = k (weighted product)

- **Characteristics**:
- Allows arbitrary weights between tokens (not 50/50)
- Example: 80% USDC / 20% ETH pool
- More complex but more flexible

### Hybrid (Curve V2, Solidly)

- **Formula**: Combines constant-product and constant-sum properties

- **Characteristics**:
- Low slippage for similar-valued assets
- Works well across price ranges
- More complex math, higher gas costs

## AMM Design Comparison

| Design | Formula | Best For | Slippage | Complexity |
|--------|---------|----------|----------|------------|
| **Constant Product** | x×y=k | All pairs, volatile | Higher | Low |
| **Constant Sum** | x+y=k | Stablecoins | Very low | Low |
| **Constant Mean** | x^w1 × y^w2=k | Multi-token | Medium | Medium |
| **Hybrid** | (x×y)^p + (x+y)^q=k | Efficient all-pairs | Low-Medium | High |

## Slippage and Price Impact

- **Slippage** is the difference between expected price and actual execution price.

- **Cause**: Large trades move the price, causing the pool to become less balanced.

- **Formula**: Price Impact = (Input / (Input + Pool Balance))

- **Example**:
- Pool: 1000 USDC, 1 ETH (price = 1000 USDC/ETH)
- Swap 100 USDC for ETH
- Price impact = 100 / (100 + 1000) = 9.1%
- You get worse than market price due to slippage

- **Implications**:
- Large trades result in higher slippage and worse execution.
- Slippage increases as pools become imbalanced.
- Slippage decreases as pool liquidity increases.

## Liquidity Provider Rewards and Risks

### Rewards

LPs earn:
1. **Trading Fees**: Percentage of every swap (0.01%-1%)
2. **Incentive Tokens**: Governance/protocol tokens as incentives
3. **Fee Compounding**: Fees automatically reinvested, earning yields on yields

### Risks

- **Impermanent Loss (IL)**: Most significant risk for LPs.

- **How IL Works**:
1. LP deposits 1 ETH + 2000 USDC (1:2000 ratio)
2. Price changes: 1 ETH = 4000 USDC
3. Pool rebalances: LP now has 0.707 ETH + 2828 USDC
4. Current value: 0.707 × 4000 + 2828 = 5656 USDC
5. If they held: 1 × 4000 + 2000 = 6000 USDC
6. IL = 5656 - 6000 = -344 USDC loss

- **Why IL Happens**: AMM requires a 50/50 balance. As price moves, the pool sells the appreciating asset and buys the depreciating one, causing the LP to have less of the winning asset.

- **IL is "Impermanent"**: If price returns to the original ratio, IL disappears. It becomes permanent only if you withdraw at a higher price divergence.

- **IL vs Fees**: Low-volatility pairs (stablecoin pairs) have low IL but lower fees. High-volatility pairs have high IL but potentially higher fees.

## Concentrated Liquidity (Uniswap V3)

- **Innovation**: Instead of providing liquidity across all price ranges, LPs provide within a specific range.

- **Benefits**:
- Lower impermanent loss if price stays in range
- Higher fee earnings with the same volume and less capital
- More capital efficient

- **Drawbacks**:
- More complex, requiring management of price ranges
- Risk if price moves outside range (0% fees until price returns)
- Requires active management

## Popular AMM Platforms

### Uniswap

- **Features**:
- Constant product (V2) and concentrated (V3)
- Multi-chain deployment
- Strong ecosystem

### Curve Finance

- **Specialization**: Stablecoin trading

- **Features**:
- Constant-sum formula optimized for stablecoins
- Extremely low slippage
- High trading volume

### Balancer

- **Specialization**: Multi-token pools, index investments

- **Features**:
- Weighted pools (not just 50/50)
- Liquidity as a Service platform
- Self-balancing portfolios

### PancakeSwap (BSC), Raydium (Solana)

- **Specialization**: L2/alternative chain AMMs

- **Features**:
- Similar to Uniswap but on different chains
- Lower fees, lower security

### Astroport (Terra), Thruster (Blast)

- **Specialization**: Newer chain AMMs

- **Features**:
- Latest AMM innovations
- Lower liquidity, higher risk

## Career Opportunities in AMMs

The AMM ecosystem offers diverse roles:

- **AMM Protocol Developer**: Design and implement AMM smart contracts, optimize formulas.

- **Liquidity Strategy Manager**: Develop strategies for LP capital allocation across pools.

- **AMM Arbitrage Developer**: Build bots detecting and executing AMM arbitrage.

- **Market Maker**: Provide liquidity and manage LP positions for profit.

- **Research Economists**: Study AMM design tradeoffs and optimal formula development.

## The Future of AMMs

AMMs continue to evolve:

- **Hybrid Designs**: Combining multiple formulas for different asset types in single pools.

- **Intent-Based**: Users specify trading intent, and solvers find optimal routing across multiple AMMs.

- **Privacy**: Private AMMs hiding trading information from other participants.

- **Limit Orders**: AMMs supporting limit orders like traditional exchanges.

- **Better Capital Efficiency**: New designs enabling more capital efficiency with less impermanent loss.

- **Cross-Chain AMMs**: AMMs operating across multiple blockchains simultaneously.

AMMs have transformed trading, enabling significant daily volume without centralized intermediaries. As they evolve, AMMs will likely become more efficient and user-accessible.

- **Providing liquidity to AMMs?** Understand impermanent loss, start with stablecoin pools if risk-averse, or volatile pairs if seeking high yields. Active management or delegating to professional LPs will likely generate better returns than passive LP positions.
