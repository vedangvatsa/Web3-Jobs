---
term: "Conditional Order"
slug: "conditional-order"
category: "trading"
difficulty: "Intermediate"
image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80"
description: "A trading order that only executes when specified conditions are met, enabling automated trading strategies based on price, time, or other market conditions."
relatedTerms: ["order-book", "dex", "trading", "limit-order"]
synonyms: ["stop order", "triggered order", "conditional trade"]
---

Conditional Order refers to a trading instruction that executes automatically only when predefined criteria are satisfied, such as price thresholds, time triggers, or complex market conditions. This mechanism enables traders to implement strategies without constant market monitoring, automating decisions like selling an asset when it reaches a target price or buying when technical indicators align. In traditional finance, stop-loss and take-profit orders represent basic conditional orders, while decentralized protocols like dYdX and GMX have expanded these capabilities to include multi-condition triggers and cross-asset dependencies. DeFi protocols increasingly compete on advanced order types, with conditional execution becoming a standard feature across major exchanges. Professionals who understand conditional order implementation and smart contract automation find strong demand in quantitative trading, protocol development, and trading infrastructure roles throughout the cryptocurrency industry.

## Conditional Order Types

Different conditions:

**Price Triggers**: Execute when price reaches a level. Stop-loss (below price), stop-gain (above price).

**Time Triggers**: Execute at a specific time or after a delay.

**Technical Indicators**: Execute when an indicator (RSI, MACD) reaches a level.

**Oracle Triggers**: Execute when an oracle reports a condition.

**Composite Conditions**: Combine multiple conditions with AND/OR logic.

**Account Balance**: Execute when balance reaches a threshold.

Conditional orders enable flexible automation.

## Implementation Approaches

How protocols enable:

**Smart Contract Orders**: User-submitted smart contracts that execute on conditions.

**Keeper Networks**: Keepers monitor conditions and execute orders when triggered (ChainLink Automation, Gelato).

**Intent System**: Users specify intent, solvers execute when conditions are met.

**DEX Native**: Native conditional orders in DEX smart contracts.

Different implementations have different UX and costs.

## Conditional Order Examples

Real use cases:

**Stop Loss**: "If ETH drops below $1500, sell all ETH". Protects against losses.

**Take Profit**: "If ETH rises above $2500, sell 50% of ETH". Lock in gains.

**Rebalancing**: "If portfolio weight of BTC drops below 40%, buy BTC to rebalance".

**Dollar Cost Averaging**: "Buy 100 USDC of ETH every week".

**Arbitrage**: "If ETH/USDC price on DEX-A > price on DEX-B by 2%, buy DEX-B, sell DEX-A".

Conditional orders enable many strategies.

## Costs and Trade-offs

Considerations:

**Keeper Fees**: Keepers executing orders charge fees.

**Gas Costs**: On-chain execution requires gas.

**Latency**: Checking conditions adds latency compared to immediate execution.

**Missed Conditions**: If an oracle fails or a keeper is offline, the condition might not execute.

**Complexity**: Complex conditions are hard to verify and secure.

Costs must be justified by strategy value.

## Career Opportunities

Conditional orders create roles:

**Protocol Designers** designing order mechanisms earn competitive salaries.

**Keeper Operators** running keepers earn variable salaries.

**Smart Contract Engineers** implementing orders earn competitive salaries.

**Automation Specialists** building strategies earn competitive salaries.

## Best Practices

Using conditional orders:

**Test Conditions**: Carefully test conditions before deployment.

**Monitor Keepers**: Ensure keepers execute reliably.

**Cost Analysis**: Ensure order fees do not exceed strategy value.

**Redundancy**: Use multiple keeper networks for reliability.

## The Future of Conditional Orders

Evolution:

**More Conditions**: Support for complex conditions.

**Cross-Chain**: Conditional orders spanning chains.

**Lower Costs**: Cheaper automation as infrastructure improves.

**Standardization**: Industry standards for condition specifications.

## Automate Trading Intelligently

Conditional orders enable automated trading without constant monitoring. Important for sophisticated strategies. If you're interested in trading or automation, explore [trading careers](/) at DeFi protocols. These roles focus on building trading infrastructure.
