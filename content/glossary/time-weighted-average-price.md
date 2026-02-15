---
term: "Time-Weighted Average Price"
slug: "time-weighted-average-price"
category: "trading"
difficulty: "Intermediate"
image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80"
description: "An execution strategy that spreads large trades over time to reduce price impact, calculating the average price weighted by time intervals."
relatedTerms: ["price-impact", "slippage", "order-book", "trading"]
synonyms: ["TWAP", "time-weighted execution", "time-sliced execution"]
---

**Time-weighted average price (TWAP)** is a strategy that executes a large order over time to reduce price impact. Instead of buying 1,000 ETH at once, TWAP buys 100 ETH every 10 minutes. This reduces slippage and avoids moving the market. TWAP is widely used in traditional finance and crypto. Many DEX aggregators support TWAP execution. Oracles also use TWAPs to smooth price manipulation. Understanding TWAP is essential for execution and oracle design.

## How TWAP Works

Execution mechanics:

**Order Slicing**: Split large order into smaller slices.

**Time Intervals**: Execute slices at fixed intervals.

**Average Price**: Weighted by time, not volume.

**Completion**: Execute until total size filled.

TWAP reduces market impact.

## TWAP vs VWAP

Comparison:

**TWAP**: Time-based slicing. Simple and predictable.

**VWAP**: Volume-weighted average price. Slices based on market volume.

**Use Case**: TWAP used when volume data unreliable or when simple execution needed.

Different strategies suit different markets.

## TWAP in DeFi Oracles

Oracle use:

**Price Smoothing**: TWAP reduces impact of short-term volatility.

**Manipulation Resistance**: TWAP prevents flash loan manipulation.

**Uniswap TWAP**: Uniswap provides built-in TWAP oracle over configurable windows.

TWAP is critical for secure on-chain oracles.

## Execution Tradeoffs

Challenges:

**Market Drift**: Price can move away during execution.

**Opportunity Cost**: Slow execution can miss market moves.

**Partial Fills**: Volatile markets can cause incomplete execution.

TWAP is not always optimal.

## TWAP Use Cases

Examples:

**Large Trades**: Institutions use TWAP to reduce impact.

**Token Buybacks**: Protocols use TWAP for buybacks.

**Treasury Rebalancing**: DAOs use TWAP to rebalance treasury.

TWAP is standard tool for large execution.

## Career Opportunities

Execution roles:

**Execution Engineers** earn $120,000-$300,000+.

**Quant Traders** earn $150,000-$400,000+.

**Oracle Engineers** earn $130,000-$320,000+.

## Best Practices

Using TWAP:

**Choose Interval**: Balance impact vs speed.

**Monitor Market**: Pause if volatility spikes.

**Use Aggregators**: Route slices across venues.

## The Future of TWAP

Trends:

**Adaptive TWAP**: Dynamic intervals based on volatility.

**Solver Execution**: Solvers optimize TWAP execution.

**Cross-Chain TWAP**: TWAP across multiple chains.

## Execute Large Orders Safely

TWAP is a foundational execution strategy and a core oracle primitive. If you’re interested in trading execution, explore [trading careers](/) at trading firms and DEX aggregators.
