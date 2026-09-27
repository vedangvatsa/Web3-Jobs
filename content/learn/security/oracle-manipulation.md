---
title: Oracle Manipulation
description: How a manipulated or stale price feed can affect lending, trading, and liquidations.
order: 7
readTime: 9 min
difficulty: advanced
prerequisites:
  - exploits
quiz:
  - question: What does a price oracle provide to a lending contract?
    options:
      - A prediction of tomorrow's market price.
      - Price data used to value collateral and debt.
      - A guarantee that collateral cannot lose value.
      - A list of approved borrowers.
    correct: 1
    explanation: The contract uses the reported price to calculate borrowing limits and liquidation conditions. The feed's design and freshness affect those calculations.
  - question: Why can a single pool's spot price be a poor collateral price?
    options:
      - It cannot be read by a contract.
      - A trade can change the pool price without a comparable change in the wider market.
      - It is always denominated in ETH.
      - It never changes.
    correct: 1
    explanation: A large trade in a thin pool can distort its spot price. A lending contract that trusts that value may overvalue collateral or trigger incorrect liquidations.
  - question: What does aggregation across data sources help reduce?
    options:
      - Transaction gas limits.
      - Dependence on one market or data provider.
      - The need to check timestamps.
      - All possible oracle failures.
    correct: 1
    explanation: Aggregation reduces dependence on a single source, but shared upstream data, outages, illiquid markets, and integration errors can still affect a feed.
  - question: What is the trade-off of a longer TWAP window?
    options:
      - It removes every form of manipulation.
      - It reduces the influence of brief price changes but responds more slowly to new prices.
      - It guarantees a lower gas fee.
      - It makes a pool more liquid.
    correct: 1
    explanation: A time-weighted average spreads a price change over an observation period. Sustained manipulation and low liquidity still need to be considered.
  - question: What should a consumer check before using a price?
    options:
      - Only the number of followers of the oracle provider.
      - The feed address, decimals, timestamp, and application-specific validity limits.
      - Whether the price is an integer.
      - Whether another user has used the feed before.
    correct: 1
    explanation: A correctly reported number can still be unsuitable if it is stale, scaled incorrectly, or taken from the wrong feed or network.
lastUpdated: 2026-09-27
---

## How protocols use price feeds

A smart contract cannot fetch a market price from an exchange website during execution. It reads data already available on-chain, often through an oracle contract.

A lending protocol uses prices to value collateral and debt. If collateral is overvalued, the protocol may allow a borrower to withdraw more than the collateral can cover. If it is undervalued, the protocol may liquidate a position that would otherwise meet its requirements.

## Manipulating a pool's spot price

An automated market maker quotes prices from its pool state. A sufficiently large trade can move that price, particularly when liquidity is low. The changed pool price may differ substantially from prices on other markets.

A vulnerable integration reads that temporary price as the value of collateral. An attacker may then borrow against an inflated valuation or trade with the protocol on favorable terms. Flash loans can provide capital for an attempt, but the borrowed amount and fee must be repaid within the transaction. An attack only succeeds if the complete sequence remains profitable after trading costs, fees, and repayment.

## What averaging changes

A time-weighted average price, or **TWAP**, measures a price over an observation window. A short-lived change generally has less influence on an average than on a spot reading. The window length, pool liquidity, and oracle implementation determine how much less.

The diagram compares the two approaches. It illustrates the mechanism rather than the result of a particular attack.

<div class="diagram">
<svg viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
 <text x="180" y="25" text-anchor="middle" font-size="14" font-weight="bold" fill="#991b1b">Spot reading</text>
 <rect x="30" y="40" width="300" height="130" rx="10" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
 <text x="180" y="75" text-anchor="middle" font-size="12" fill="#374151">A trade changes the pool price.</text>
 <text x="180" y="105" text-anchor="middle" font-size="12" fill="#374151">The consumer reads that price.</text>
 <text x="180" y="140" text-anchor="middle" font-size="12" fill="#991b1b">Collateral may be misvalued.</text>
 <text x="600" y="25" text-anchor="middle" font-size="14" font-weight="bold" fill="#166534">Time-weighted reading</text>
 <rect x="450" y="40" width="300" height="130" rx="10" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
 <text x="600" y="75" text-anchor="middle" font-size="12" fill="#374151">The price uses a longer window.</text>
 <text x="600" y="105" text-anchor="middle" font-size="12" fill="#374151">Brief changes have less weight.</text>
 <text x="600" y="140" text-anchor="middle" font-size="12" fill="#166534">Liquidity and timing still matter.</text>
</svg>
</div>

A TWAP can still be manipulated. An attacker may hold a price away from the wider market for longer, target a thin pool, or exploit the timing of observations. A longer window also delays the feed's response to genuine market moves.

## Comparing feed designs

**Aggregated feeds**, such as Chainlink Data Feeds, combine reports from multiple sources and oracle nodes. Review the particular feed's configuration, supported market, update conditions, and administrative controls. Aggregation does not remove the need for checks in the consuming contract.

**Pool-derived feeds**, such as Uniswap's historical price observations, use on-chain trading data. Review the available observation history, the averaging method, liquidity, and the cost of moving the underlying market.

**Pull-based feeds**, including Pyth integrations, let a transaction submit an update for the consuming contract to use. The consumer still needs to validate its age and any confidence information provided by the feed.

## Checks in the consuming contract

1. Confirm the feed address, chain, quote currency, and decimal scale.
2. Reject data older than the application's allowed age. Choose that limit with the feed's heartbeat and update behavior in mind.
3. Test missing, zero, negative, delayed, and sharply changing values.
4. Define what happens when independent sources disagree. A fallback needs its own validation rules.
5. On applicable Layer 2 networks, account for sequencer downtime and recovery before allowing price-sensitive operations.
6. Test borrowing and liquidation behavior during a feed outage. Pausing operations can also affect users, so specify the recovery procedure.

For feed update conditions and consumer responsibilities, see the [Chainlink Data Feeds documentation](https://docs.chain.link/data-feeds).
