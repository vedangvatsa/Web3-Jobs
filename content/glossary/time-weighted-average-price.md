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

Time-Weighted Average Price is an execution strategy that spreads large trades across multiple time intervals to minimize market impact and achieve a more favorable average entry or exit price. Rather than executing a substantial order all at once, which can cause significant slippage and move the market against the trader, TWAP algorithms break the order into smaller chunks executed at regular intervals. Uniswap V3 popularized on-chain TWAP oracles, which sample prices over time to provide manipulation-resistant price feeds for DeFi protocols. Beyond oracles, institutional traders and DEX aggregators like CoW Protocol use TWAP execution to handle large orders without disrupting thin liquidity pools. Professionals who understand TWAP mechanics are increasingly sought after for roles in algorithmic trading, protocol development, and DeFi infrastructure engineering.

## How TWAP Works

Execution mechanics:

- **Order Slicing**: Split large order into smaller slices.

- **Time Intervals**: Execute slices at fixed intervals.

- **Average Price**: Weighted by time, not volume.

- **Completion**: Execute until total size filled.

TWAP reduces market impact.

## TWAP vs VWAP

Comparison:

- **TWAP**: Time-based slicing. Simple and predictable.

- **VWAP**: Volume-weighted average price. Slices based on market volume.

- **Use Case**: TWAP used when volume data unreliable or when simple execution needed.

Different strategies suit different markets.

## TWAP in DeFi Oracles

Oracle use:

- **Price Smoothing**: TWAP reduces impact of short-term volatility.

- **Manipulation Resistance**: TWAP prevents flash loan manipulation.

- **Uniswap TWAP**: Uniswap provides built-in TWAP oracle over configurable windows.

TWAP is critical for secure on-chain oracles.

## Execution Tradeoffs

Challenges:

- **Market Drift**: Price can move away during execution.

- **Opportunity Cost**: Slow execution can miss market moves.

- **Partial Fills**: Volatile markets can cause incomplete execution.

TWAP is not always optimal.

## TWAP Use Cases

Examples:

- **Large Trades**: Institutions use TWAP to reduce impact.

- **Token Buybacks**: Protocols use TWAP for buybacks.

- **Treasury Rebalancing**: DAOs use TWAP to rebalance treasury.

TWAP is a standard tool for large execution.

## Career Opportunities

Execution roles:

**Execution Engineers** earn competitive salaries.

**Quant Traders** earn competitive salaries.

**Oracle Engineers** earn competitive salaries.

## Best Practices

Using TWAP:

- **Choose Interval**: Balance impact vs speed.

- **Monitor Market**: Pause if volatility spikes.

- **Use Aggregators**: Route slices across venues.

## The Future of TWAP

Trends:

- **Adaptive TWAP**: Dynamic intervals based on volatility.

- **Solver Execution**: Solvers optimize TWAP execution.

- **Cross-Chain TWAP**: TWAP across multiple chains.

## Execute Large Orders Safely

TWAP is a foundational execution strategy and a core oracle primitive. If you’re interested in trading execution, explore [trading careers](/) at trading firms and DEX aggregators.
