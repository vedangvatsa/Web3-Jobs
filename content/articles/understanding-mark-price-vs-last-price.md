---
title: Understanding Mark Price vs Index Price
description: >-
  A guide to the difference between Mark Price and Index Price in crypto
  derivatives, and why Mark Price is important for preventing unfair
  liquidations.
category: Educational
data-ai-hint: price comparison
publishedDate: '2026-03-11'
lastUpdated: "2026-09-04"
---
### Introduction

In crypto derivatives trading, particularly with perpetual futures, exchanges present various price points for the same asset. The two most significant prices are the **Index Price** and the **Mark Price**. While traders often look at the last traded price displayed on charts, the Mark Price is important for calculating unrealized profits and losses. More importantly, it determines whether a position will be liquidated. A strong grasp of these concepts is essential for effective risk management.

### Index Price

The Index Price aims to reflect the "true" market value of the underlying asset.

- **Calculation Method**: The Index Price is not derived from a single exchange's trading activity. Instead, it represents a volume-weighted average of the spot prices from several major, independent exchanges, such as Coinbase, Binance, Kraken, and Bitstamp. This aggregation helps mitigate the influence of price anomalies that can occur on individual platforms.
- **Objective**: It strives to provide a fair and manipulation-resistant price point. By sourcing data from multiple exchanges, it minimizes the risk that a sudden price spike or drop on one platform will affect the overall market perception of the asset's value.
- **Example**: For instance, the Index Price for [BTC](/what-is-bitcoin)/USDT on a derivatives platform may be calculated from the average spot prices across several exchanges, ensuring a balanced view of market conditions.

### Last Price

The Last Price represents the most recent transaction executed on a specific derivative exchange. This is the figure prominently featured on trading charts. Due to immediate buying or selling pressure, the Last Price can sometimes diverge from the Index Price, especially during periods of heightened trading activity.

### Mark Price

The Mark Price serves as the benchmark for margin and liquidation calculations within a derivatives trading framework. It is designed to provide a more stable and less susceptible measure than the Last Price.

- **Calculation Method**: Typically, the Mark Price is computed using a formula that combines the **Index Price** with a moving average of the **basis**, which is the difference between the Last Price and the Index Price. This formula smooths out short-term fluctuations, allowing the Mark Price to converge toward the Index Price over time. The formula is represented as follows:

 ```
 Mark Price = Index Price + Moving Average (Last Price - Index Price)
 ```

- **Objective**: The primary role of the Mark Price is to prevent unfair liquidations. In volatile markets, the Last Price on an exchange can spike or plummet due to significant market orders or liquidity shortages. If liquidations were based solely on this Last Price, it could lead to unjust losses for traders. The Mark Price, anchored to the more reliable Index Price, ensures that liquidations occur only in response to genuine market movements rather than temporary fluctuations on a single platform.

### Importance of Mark Price

The Mark Price is important for protecting traders from adverse market conditions.

- **Protection Against Unfair Liquidations**: It shields traders from being liquidated during "liquidation hunts," where a large trader might attempt to manipulate the price on an exchange to trigger a wave of liquidations.
- **Realistic Profit and Loss Calculations**: The Mark Price provides a more accurate measure of unrealized profits and losses (PnL). While a position remains open, the unrealized PnL is determined by the difference between the entry price and the current Mark Price. The final realized PnL is only calculated when the position is closed at the Last Price.
- **Market Stability**: By averaging out price data, the Mark Price contributes to a more stable derivatives market, reducing the adverse effects of short-term volatility and market manipulation.

### Practical Example

Consider a scenario where you hold a long position on [ETH](/what-is-ethereum) with a liquidation price set at a certain level.

- The **Index Price** across major exchanges remains stable.
- However, the **Last Price** on your chosen derivative exchange experiences a flash crash, momentarily dropping due to a substantial sell order, before quickly rebounding.
- During this event, the **Mark Price**, influenced primarily by the stable Index Price, might only decrease slightly.

**Outcome**: Because your liquidation is based on the **Mark Price**, your position remains intact. If liquidations were determined by the Last Price, your position would have been unfairly liquidated due to the temporary price anomaly.

### FAQ

**Which price should I monitor?** 
Keep an eye on all three prices. The **Last Price** indicates current trading activity on your specific exchange. The **Index Price** reflects the broader market value, while the **Mark Price** is important for assessing your liquidation risk. Most exchanges display the liquidation price based on the Mark Price.

**Can there be significant differences between Mark Price and Last Price?** 
Yes, especially during periods of high volatility. The disparity between these prices is termed the "basis." A large basis signals a notable deviation between the perpetual contract market and the underlying spot market, typically corrected over time via the funding rate mechanism.

**When is my final profit calculated?** 
While your position is active, the unrealized PnL is computed using the Mark Price. Once you close your position, the realized PnL is calculated based on the Last Price at the time of your trade execution.

## Understanding Mark Price and Index Price: Key Differences

| Feature | Index Price | Last Price | Mark Price |
|---------------|--------------------------------------------------|------------------------------|--------------------------------------------------|
| **Definition**| Aggregate price from multiple exchanges | Price of the last executed trade | Price used for liquidation and margin calculations |
| **Stability** | Designed to be stable and manipulation-resistant | Can fluctuate rapidly | More stable, smoothing out short-term fluctuations |
| **Impact on Trades** | Reflects true market conditions | Affected by immediate market activity | Affects liquidation risk and unrealized PnL |
| **Calculation Method** | Volume-weighted average of spot prices | Based on the order book | Combination of Index Price and moving average of basis |

## Verifiable Primary Sources & References

1. [Ethereum Official Yellow Paper & Protocol Specification](https://ethereum.github.io/yellowpaper/paper.pdf)
2. [Ethereum Consensus Specs & Proof of Stake Architecture](https://github.com/ethereum/consensus-specs)
3. [Base Layer 2 Network Official Documentation](https://docs.base.org/)
4. [Solana Core Architecture Documentation](https://docs.solana.com/)
5. [zkSync Era Documentation & Zero Knowledge Proofs Architecture](https://docs.zksync.io/)
6. [U.S. Securities and Exchange Commission (SEC) EDGAR Database](https://www.sec.gov/edgar/searchedgar/companysearch)
7. [Ethereum Official Developer Resources & Specs](https://ethereum.org/en/developers/docs/)
8. [Solidity Language Documentation & Safety Guidelines](https://docs.soliditylang.org/)
9. [OpenZeppelin Audited Smart Contract Libraries](https://docs.openzeppelin.com/)
10. [Foundry Book Ethereum Testing & Deployment Guide](https://book.getfoundry.sh/)
