---
title: "Oracle Manipulation"
description: "How price oracle attacks work and how protocols defend against them."
order: 7
readTime: "9 min"
difficulty: "advanced"
prerequisites: ["exploits"]
quiz:
  - question: "What is a price oracle in DeFi?"
    options:
      - "A prediction market for token prices."
      - "A system that feeds external price data into smart contracts."
      - "A tool that predicts future prices using AI."
      - "A decentralized exchange's order book."
    correct: 1
    explanation: "An oracle is a bridge between off-chain data and on-chain smart contracts. Price oracles specifically feed asset prices that DeFi protocols use for lending, liquidations, and trading."
  - question: "Why are spot price oracles dangerous for DeFi?"
    options:
      - "They are too slow."
      - "An attacker can manipulate the spot price in a single transaction using flash loans, causing the oracle to report a fake price."
      - "They cost too much gas."
      - "They only work on Ethereum."
    correct: 1
    explanation: "Using a DEX's current spot price as an oracle is dangerous because flash loans can artificially move the price in a single block. Time-weighted average prices (TWAPs) resist this by averaging over multiple blocks."
---

## Why Oracles Matter

Smart contracts cannot access external data on their own. They cannot check the price of ETH on Binance or read a stock ticker. An **oracle** is the mechanism that brings this external data on-chain.

For DeFi protocols, price oracles are the most critical piece of infrastructure. A lending protocol needs to know the price of collateral to decide when to liquidate. A synthetic asset protocol needs accurate prices to maintain its peg. If the oracle is wrong, the protocol loses money.

## How Oracle Attacks Work

### Spot Price Manipulation

The simplest oracle attack targets protocols that use the current price on a DEX (like Uniswap) as their price feed.

Attack flow:
1. Flash-borrow a massive amount of Token A.
2. Dump Token A on the DEX, crashing its price.
3. The victim protocol's oracle reads this artificially low price.
4. Use the low price to borrow against cheap collateral, or liquidate positions at advantageous prices.
5. Repay the flash loan. Profit.

This has been used in dozens of DeFi exploits, including attacks on Harvest Finance ($34M), Mango Markets ($114M), and many smaller protocols.

### Multi-Block Attacks

More sophisticated attacks manipulate prices across multiple blocks. By bribing or controlling block producers (MEV), an attacker can sustain a fake price for long enough to trick TWAP oracles that average over short windows.

## Oracle Solutions

### Chainlink Price Feeds
The industry standard. Chainlink aggregates prices from multiple exchanges and data providers through a decentralized network of oracle nodes. Each node stakes LINK tokens as collateral, creating economic incentives for accurate reporting.

**Strengths:** Battle-tested, wide asset coverage, resistant to single-source manipulation.
**Weaknesses:** Centralization concerns (the Chainlink team controls node selection), update frequency may lag during extreme volatility.

### Uniswap TWAP (Time-Weighted Average Price)
Uniswap v3 provides built-in TWAP oracles that calculate the average price over a configurable time window. Since the average spans multiple blocks, single-block manipulation has minimal impact.

**Strengths:** Fully on-chain, no external dependencies, manipulation-resistant for longer windows.
**Weaknesses:** Lags during rapid price movements, vulnerable to multi-block attacks on low-liquidity pairs.

### Pyth Network
A pull-based oracle built for speed. Unlike Chainlink (which pushes updates on a schedule), Pyth lets protocols request the latest price on-demand. Prices are sourced directly from first-party data providers (exchanges and market makers).

**Strengths:** Sub-second updates, first-party data sources.
**Weaknesses:** Newer, smaller network of data providers.

### RedStone
A modular oracle that embeds price data directly into transaction calldata, reducing gas costs. It supports both push and pull models.

## Best Practices for Protocols

1. **Never use spot prices.** Always use TWAP or aggregated oracles.
2. **Use multiple oracle sources.** Compare Chainlink, TWAP, and others. If they disagree significantly, pause operations.
3. **Set price deviation limits.** If the oracle price moves more than X% in one block, reject it.
4. **Implement circuit breakers.** Automatically pause lending and liquidations during extreme oracle deviations.

## Key Takeaways

- Oracles are DeFi's most critical and most attacked infrastructure.
- Flash loan attacks exploit spot-price oracles in single transactions.
- TWAP oracles and Chainlink aggregation provide stronger guarantees.
- Defense in depth: use multiple oracle sources and circuit breakers.
