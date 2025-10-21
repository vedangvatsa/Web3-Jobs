---
title: "What is a Health Factor in DeFi Lending"
image: "https://picsum.photos/seed/health-factor/1200/630"
description: "Discover what the Health Factor is in DeFi protocols like Aave and how it helps you manage your loan's risk of liquidation."
category: "DeFi"
data-ai-hint: "health meter"
---

## What is a Health Factor in DeFi Lending?

In many DeFi lending protocols, particularly Aave, the **Health Factor** is a single, clear number that represents the safety of your loan position against your collateral. It is a crucial indicator that helps you quickly assess your risk of liquidation.

### How is the Health Factor Calculated?

The Health Factor is a representation of your borrowing position's health. It is calculated based on the value of your deposited collateral and the liquidation threshold of those assets, compared to the value of your borrowed assets.

The simplified formula is:

**Health Factor = (Total Collateral Value * Average Liquidation Threshold) / Total Value of Borrows**

-   A **Health Factor greater than 1** means your position is safe. The higher the number, the safer your loan.
-   If your **Health Factor drops to 1 or below**, your position is considered undercollateralized. At this point, your collateral becomes eligible for liquidation to repay your debt.

### An Intuitive Example

Imagine you deposit $1,000 worth of Ethereum (ETH), which has a liquidation threshold of 85%. You then borrow $400 worth of USDC.

-   **Effective Collateral Value**: $1,000 * 85% = $850
-   **Value of Borrows**: $400
-   **Health Factor**: $850 / $400 = 2.125

Your Health Factor is 2.125, which is a very safe position.

Now, let's say the price of ETH drops, and your collateral is now only worth $500.

-   **Effective Collateral Value**: $500 * 85% = $425
-   **Value of Borrows**: $400
-   **Health Factor**: $425 / $400 = 1.0625

Your Health Factor is now 1.0625, which is much closer to the liquidation point. If the value of your ETH collateral drops just a little more, your Health Factor will hit 1, and your position can be liquidated.

### Why is the Health Factor Useful?

The Health Factor consolidates several complex variables (multiple types of collateral, different liquidation thresholds, and various borrowed assets) into one easy-to-understand number.

-   **At-a-Glance Risk Assessment**: Instead of manually calculating your debt-to-collateral ratio for each asset, you can simply look at your Health Factor.
-   **Clear Action Signal**: A decreasing Health Factor is a clear signal that you need to take action to avoid liquidation.

### How to Manage Your Health Factor

If your Health Factor is getting dangerously close to 1, you have two primary options:

1.  **Repay Your Loan**: Repaying a portion of your borrowed assets will decrease the "Total Value of Borrows" in the formula, increasing your Health Factor.
2.  **Add More Collateral**: Depositing more collateral will increase the "Total Collateral Value" in the formula, also increasing your Health Factor.

By keeping a close eye on your Health Factor and keeping it well above 1, you can safely navigate the world of DeFi lending and avoid the painful process of liquidation.