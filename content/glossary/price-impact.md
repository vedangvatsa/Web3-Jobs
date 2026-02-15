---
term: "Price Impact"
slug: "price-impact"
category: "trading"
difficulty: "Intermediate"
image: "https://images.unsplash.com/photo-1611974519553-bc61f192d934?w=1200&q=80"
description: "The percentage change in asset price resulting from a trade, where larger trades move price more than smaller trades due to limited liquidity."
relatedTerms: ["slippage", "dex", "liquidity", "amm"]
synonyms: ["price slippage", "market impact", "execution cost"]
---

**Price impact** is the change in asset price caused by executing trade. On Uniswap, buying 10 ETH from pool with 1,000 ETH liquidity causes different price impact than buying 1,000 ETH (which would dramatically move price). Price impact increases with trade size. Small trades have negligible impact. Large trades significantly impact price. Price impact is unavoidable cost of trading in liquidity-constrained markets. Understanding price impact is essential for traders avoiding overpaying. Protocols design features minimizing price impact through better liquidity infrastructure.

## How Price Impact Works

Mechanics:

**Liquidity Depth**: Pool size determines impact. 1,000 ETH pool has greater impact than 100,000 ETH pool.

**Trade Size**: Larger trades have larger impact. Trading 1 ETH vs 100 ETH in same pool has vastly different impact.

**Constant Product Formula**: AMMs use formula x*y=k. Trades adjust x and y values, moving price.

Example: ETH/USDC pool with 100 ETH and 200,000 USDC.
- Price: 200,000/100 = $2,000/ETH
- Buy 10 ETH: New state is 90 ETH, 222,222 USDC (roughly)
- New price: 222,222/90 = $2,469/ETH
- Your effective price: (222,222-200,000)/10 = $2,222/ETH
- Price impact: ($2,222-$2,000)/$2,000 = 11%

Large trades have large impact.

## Price Impact vs Slippage

Related but distinct:

**Price Impact**: Change in asset price due to your trade. Market-level metric.

**Slippage**: Difference between expected price when submitting order and actual execution price. User-level metric.

Example: You submit 10 ETH buy order expecting $2,000/ETH execution.
- Expected cost: 10 × $2,000 = $20,000
- Actual execution: 10 ETH at $2,222/ETH = $22,220
- Price impact: 11% (caused by your trade moving market)
- Slippage: 11% (difference you experienced)

In this case, price impact and slippage are same. But slippage includes fees and other costs.

## Minimizing Price Impact

Strategies:

**Split Orders**: Instead of 100 ETH trade, split into 10 separate 10 ETH trades over time.
- Reduces immediate impact
- But spreads out timing risk (price might move against you)

**Liquidation Protocol Trading**: Order book protocols enable matching against existing orders without price impact (if liquidity exists at your price).

**Time Averaging**: Trading over time rather than immediately reduces impact.

**Better Liquidity**: Deeper pools have lower impact. Use most liquid trading pairs.

**Limit Orders**: On order book exchanges, limit orders avoid impact (market orders have impact).

Different strategies balance impact reduction with other risks.

## Price Impact in Different Protocols

Comparing impact:

**Uniswap V2**: Impact based on pool size. 1,000 ETH pool has ~2x impact of 2,000 ETH pool.

**Uniswap V3**: Concentrated liquidity enables different impact profiles. Tight ranges have high impact but allow capital efficiency.

**Curve**: Stablecoin pools designed for low impact. Different curve formula reduces impact compared to constant product.

**Balancer**: Larger pools with multiple tokens reduce impact.

**DEX Aggregators**: Route across multiple DEXs finding lowest impact path.

Protocol design significantly impacts price impact.

## Price Impact Economics

Financial implications:

**For Traders**: Price impact reduces returns on trades. 1% impact on $100 trade = $1 cost.

**For Arbitrageurs**: Price impact limits arbitrage. If impact > arbitrage spread, not profitable.

**For Liquidators**: Price impact on liquidations can make position unprofitable.

**For LPs**: Price impact creates revenue. MEV searchers pay for good execution.

Price impact is major component of trading economics.

## Career Opportunities

Price impact creates roles:

**Quantitative Traders** analyzing impact earn $130,000-$300,000+.

**Protocol Designers** optimizing price impact earn $120,000-$300,000+.

**DEX Builders** creating more capital-efficient protocols earn $110,000-$280,000+.

**Algorithmic Traders** exploiting impact inefficiencies earn $140,000-$350,000+.

**Market Microstructure Researchers** studying impact mechanics earn $120,000-$280,000+.

## Best Practices

For traders:

**Check Impact**: Use DEX aggregators showing estimated impact before trading.

**Small Trades**: If possible, split large trades to reduce impact.

**Time Awareness**: Trade during high liquidity periods (major pairs, active hours).

**Limit Orders**: Use limit orders when possible to avoid slippage.

**Liquidity Research**: Find deepest pools for your trading pair.

## The Future of Price Impact

Impact reduction:

**Better Liquidity Infrastructure**: More sophisticated AMM designs reducing impact.

**Cross-Protocol Liquidity**: Protocols sharing liquidity reducing impact system-wide.

**Intent-Based Architectures**: Solvers competing to provide best execution reducing impact.

**On-Chain Order Books**: Layer 2 order books enabling impact-free matching.

**Private Mempools**: Encrypted execution preventing frontrunning and sandwich attacks (which increase impact).

## Understand Your Costs

Price impact is unavoidable cost of trading in liquidity-constrained markets. Understanding impact helps traders minimize costs and make better trading decisions. If you're interested in trading, market microstructure, or protocol design, explore [DeFi trading careers](/) at DEXs, trading firms, and protocol teams. These roles focus on building better execution infrastructure.
