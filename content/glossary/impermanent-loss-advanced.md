---
term: "Impermanent Loss"
slug: "impermanent-loss"
category: "defi"
difficulty: "Intermediate"
image: "https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=1200&q=80"
description: "The opportunity cost suffered by liquidity providers when the price of pooled assets diverges significantly, where holding assets separately would have been more profitable."
relatedTerms: ["liquidity-pool", "amm", "yield-farming", "risk"]
synonyms: ["divergence loss", "temporary loss", "IL"]
---

**Impermanent loss** is loss LPs suffer when prices diverge. Deposit 1 ETH + $2000 USDC (1:1 ratio). ETH price doubles to $4000. LP now has 0.707 ETH + $2828 USDC (worth $5656). If held separately: 1 ETH + $2000 = $6000. LP has $344 less. Called "impermanent" because loss reverses if price returns. But if price doesn't return, loss becomes permanent. IL is critical consideration for LPs. Large IL can exceed earned fees. Understanding IL essential for LP decisions.

## Calculating Impermanent Loss

Formula:

**IL %** = (2 × √(price ratio)) / (1 + price ratio) - 1

**Example**: Price increases 2x:
- IL = (2 × √2) / (1 + 2) - 1 = 5.4%

**50% Price Change**: IL = 0.62%

**2x Price Change**: IL = 5.4%

**10x Price Change**: IL = 49.7%

IL increases non-linearly with price movement.

## IL Compensation

Fee consideration:

**Fees Earned**: LPs earn trading fees.

**IL Cost**: IL reduces returns.

**Net Return**: Fee - IL = Net return.

**High Volatility**: High volatility pairs need higher fees to compensate for IL.

**Stablecoin Pairs**: Low volatility = low IL. Stable pairs can use lower fees.

Fees must compensate for expected IL.

## Concentrated Liquidity Impact

Uniswap V3 effect:

**Concentration**: LPs concentrate in tighter range.

**IL Risk**: Concentration increases IL if price leaves range.

**Capital Efficiency**: Better capital efficiency but higher IL risk.

**Range Selection**: Choosing optimal range is critical.

Concentrated liquidity changes IL dynamics.

## IL Examples

Real cases:

**ETH/USDC**: 50% ETH price increase = 0.62% IL.

**BTC/USDC**: 100% BTC price increase = 5.4% IL.

**ALT/USDC**: 5x price increase = 20% IL.

**Stablecoin Pairs**: Minimal IL (price barely moves).

IL varies by volatility.

## IL Mitigation

Strategies:

**Low Volatility Pairs**: Provide in stable pairs.

**Fee Optimization**: Ensure fees exceed expected IL.

**Range Management**: Actively manage concentrated liquidity ranges.

**Insurance**: Insurance products against IL.

**Diversification**: Pool across multiple pairs.

IL management important for LPs.

## Career Opportunities

LP management creates roles:

**LP Managers** managing positions earn $80,000-$200,000+.

**Protocol Designers** optimizing IL earn $130,000-$320,000+.

**Data Analysts** analyzing IL earn $100,000-$260,000+.

**Risk Managers** managing LP risks earn $110,000-$260,000+.

## Best Practices

Providing liquidity:

**Understand IL**: Know expected IL before providing.

**Fee Analysis**: Ensure fees exceed expected IL.

**Volatility Expectations**: Consider price movement expectations.

**Active Management**: Actively manage ranges.

**Monitoring**: Monitor positions regularly.

## The Future of Impermanent Loss

Evolution:

**IL Insurance**: Insurance products against IL.

**Better Mechanisms**: AMM designs reducing IL.

**Predictive Tools**: Better IL forecasting.

**Diversified Pools**: Multi-token pools reducing IL.

## Manage Price Divergence Risk

Impermanent loss is critical LP consideration. Balance fees vs IL. Understanding IL essential for profitability. If you're interested in liquidity provision, explore [LP careers](/) at DeFi protocols. These roles focus on capital efficiency and returns.
