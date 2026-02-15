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

**Conditional orders** execute only when conditions met. Price above $50? Then sell. Time reaches 3pm? Then buy. Time-weighted average price matches target? Execute. Conditional orders enable automated strategies without constant monitoring. Traditional finance has stop-loss orders (sell if drops below price), stop-gain orders (sell if rises above). DeFi enabling more complex conditional orders. Example: "If ETH/USDC price > 2000, then swap 10 ETH to USDC". Conditional orders improve UX and enable sophisticated strategies. More DeFi protocols adding conditional order support.

## Conditional Order Types

Different conditions:

**Price Triggers**: Execute when price reaches level. Stop-loss (below price), stop-gain (above price).

**Time Triggers**: Execute at specific time or after delay.

**Technical Indicators**: Execute when indicator (RSI, MACD) reaches level.

**Oracle Triggers**: Execute when oracle reports condition.

**Composite Conditions**: Combine multiple conditions with AND/OR logic.

**Account Balance**: Execute when balance reaches threshold.

Conditional orders enable flexible automation.

## Implementation Approaches

How protocols enable:

**Smart Contract Orders**: User-submitted smart contracts that execute on conditions.

**Keeper Networks**: Keepers monitor conditions, execute orders when triggered (ChainLink Automation, Gelato).

**Intent System**: Users specify intent, solvers execute when conditions met.

**DEX Native**: Native conditional orders in DEX smart contracts.

Different implementations have different UX/costs.

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

**Latency**: Checking conditions adds latency vs immediate execution.

**Missed Conditions**: If oracle fails or keeper offline, condition might not execute.

**Complexity**: Complex conditions hard to verify and secure.

Costs must be justified by strategy value.

## Career Opportunities

Conditional orders create roles:

**Protocol Designers** designing order mechanisms earn $130,000-$320,000+.

**Keeper Operators** running keepers earn $50,000-$150,000+ (variable).

**Smart Contract Engineers** implementing orders earn $120,000-$300,000+.

**Automation Specialists** building strategies earn $100,000-$260,000+.

## Best Practices

Using conditional orders:

**Test Conditions**: Carefully test conditions before deployment.

**Monitor Keepers**: Ensure keepers executing reliably.

**Cost Analysis**: Ensure order fees don't exceed strategy value.

**Redundancy**: Use multiple keeper networks for reliability.

## The Future of Conditional Orders

Evolution:

**More Conditions**: Support for complex conditions.

**Cross-Chain**: Conditional orders spanning chains.

**Lower Costs**: Cheaper automation as infrastructure improves.

**Standardization**: Industry standards for condition specifications.

## Automate Trading Intelligently

Conditional orders enable automated trading without constant monitoring. Important for sophisticated strategies. If you're interested in trading or automation, explore [trading careers](/) at DeFi protocols. These roles focus on building trading infrastructure.
