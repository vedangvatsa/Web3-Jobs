---
title: "Liquidation Threshold Explained for Borrowers"
image: "https://picsum.photos/seed/liquidation-threshold/1200/630"
description: "Learn what a liquidation threshold is in DeFi lending and how it determines the risk level of your crypto loan."
category: "DeFi"
data-ai-hint: "warning sign"
---

## Liquidation Threshold Explained for Borrowers

When you take out a loan from a decentralized finance (DeFi) lending protocol, one of the most critical parameters to understand is the **Liquidation Threshold**. This figure represents the point at which your collateral is deemed insufficient to cover your loan, making your position eligible for liquidation.

### What is a Liquidation Threshold?

The Liquidation Threshold is a percentage representing the maximum value your loan can reach relative to your collateral's value before it is considered undercollateralized.

For example, if you deposit Ethereum (ETH) as collateral and it has a liquidation threshold of 85%, your position will be flagged for liquidation if the value of your debt becomes 85% of the value of your collateral.

-   **Formula for Liquidation Point**: `Value of Loan >= Value of Collateral * Liquidation Threshold`

### How It Differs from Collateral Factor (LTV)

It is crucial not to confuse the liquidation threshold with the Collateral Factor, also known as Loan-to-Value (LTV).

-   **Collateral Factor (LTV)**: This determines how much you can **initially borrow**. If ETH has an LTV of 80%, you can borrow up to $800 against $1,000 of ETH.
-   **Liquidation Threshold**: This determines when you get **liquidated**. If the liquidation threshold is 85%, your position is safe as long as your debt-to-collateral ratio stays below this level.

The liquidation threshold is always set higher than the collateral factor. This creates a **safety buffer** for the borrower.

**Example:**
-   You deposit $1,000 of ETH.
-   LTV is 80%, so you borrow the maximum, which is $800 of DAI.
-   Liquidation Threshold is 85%.
-   Your loan is currently at 80% of your collateral's value, so you are safe.

Now, if the price of ETH drops, the value of your collateral decreases. Let's say your ETH collateral is now only worth $940.

-   Your debt is still $800 of DAI.
-   Your debt-to-collateral ratio is now `$800 / $940 = 85.1%`.

Since this ratio is above the 85% liquidation threshold, your position is now eligible for liquidation. A liquidator can step in, repay a portion of your DAI debt, and claim a corresponding amount of your ETH collateral at a discount.

### Why Does the Liquidation Threshold Vary?

Just like LTV, the liquidation threshold is set by protocol governance based on the risk of the collateral asset.

-   **Stable assets** like USDC will have a high liquidation threshold (e.g., 93%) because their price is stable.
-   **Volatile assets** will have a lower liquidation threshold (e.g., 75%) to give the protocol more room to liquidate the asset safely during a price crash.

As a borrower, your primary goal is to keep your loan-to-value ratio well below the liquidation threshold. You can do this by borrowing less than the maximum amount, adding more collateral, or repaying part of your loan if the market moves against you. Monitoring this threshold is key to safely using DeFi lending platforms.