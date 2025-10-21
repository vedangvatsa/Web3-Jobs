---
title: "Insurance Fund in Derivatives Trading Explained"
image: "https://picsum.photos/seed/insurance-fund/1200/630"
description: "Understand the crucial role of an insurance fund in a derivatives exchange and how it protects traders from auto-deleveraging."
category: "DeFi"
data-ai-hint: "safety net"
---

## Insurance Fund in Derivatives Trading Explained

An **Insurance Fund** is a pool of capital maintained by a cryptocurrency derivatives exchange to cover losses when a leveraged position is liquidated at a price worse than the user's bankruptcy price. Its primary purpose is to prevent the need for **auto-deleveraging (ADL)**, where profitable traders have their positions forcibly closed to cover the exchange's losses.

In short, the insurance fund acts as a safety net that protects winning traders from the negative consequences of other traders' losses.

### How Does the Liquidation Process Lead to an Insurance Fund?

To understand the insurance fund, you need to understand the three key prices in a liquidation:

1.  **Liquidation Price**: The price at which a user's position is taken over by the liquidation engine because their margin is too low.
2.  **Bankruptcy Price**: The price at which the user's entire initial margin is lost. For a long position, this is the entry price minus the initial margin per contract.
3.  **Closing Price**: The price at which the liquidation engine actually manages to close the position in the market.

The insurance fund is funded by successful liquidations.

**Scenario: A Contribution to the Insurance Fund**
-   A trader has a leveraged long position on ETH with a bankruptcy price of $3,000.
-   The market drops, and their position is liquidated.
-   The exchange's liquidation engine is able to close the position in the market at a price of $3,010 (the closing price).
-   This price is **better** than the bankruptcy price. The extra funds generated from closing the position ($10 per contract in this example) are deposited into the insurance fund.

### How is the Insurance Fund Used?

The fund is used to cover losses from unsuccessful liquidations.

**Scenario: A Payout from the Insurance Fund**
-   A trader has a leveraged long position during an extremely volatile market crash.
-   Their position is liquidated, with a bankruptcy price of $3,000.
-   The market is moving so fast that the liquidation engine can only close the position at $2,990.
-   This price is **worse** than the bankruptcy price, resulting in a loss for the exchange (the position has negative equity).
-   This loss is covered by drawing funds from the insurance fund, ensuring the exchange remains solvent and that no other traders are affected.

### Why is a Large Insurance Fund Important?

A large and healthy insurance fund is a sign of a stable and reliable exchange.

-   **Prevents Auto-Deleveraging (ADL)**: As long as the insurance fund has sufficient capital to cover losses from failed liquidations, the exchange will not need to trigger its ADL system. This means profitable traders can be confident that their winning positions will not be forcibly closed to cover someone else's losses.
-   **Market Stability**: It ensures the exchange can remain solvent even during extreme market volatility and large liquidation events.

Traders often monitor the size of an exchange's insurance fund as a key indicator of its safety and risk management capabilities. A consistently growing fund suggests that the exchange's liquidation engine is efficient and that it is well-prepared to handle market turmoil.