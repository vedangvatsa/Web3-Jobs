---
title: "Liquidation Threshold Explained for Borrowers"
image: "https://picsum.photos/seed/liquidation-threshold/1200/630"
description: "A crucial guide for DeFi borrowers on understanding the liquidation threshold, how it works, and how to avoid having your collateral sold."
category: "Educational"
data-ai-hint: "danger warning"
---

### Introduction

For anyone borrowing assets in Decentralized Finance (DeFi), the "Liquidation Threshold" is one of the most critical parameters to understand. It represents the point of no return for a collateralized loan. If the value of your loan relative to your collateral crosses this threshold, the lending protocol will allow third parties to seize and sell your collateral to repay your debt. This guide explains what the liquidation threshold is, how it's calculated, and what steps you can take to avoid it.

### How It Works

A liquidation threshold is a percentage that represents the maximum allowed value of your loan relative to the value of your collateral. It is a safety mechanism designed to protect the lending protocol and its lenders.

1.  **Setting the Threshold**: Each asset that can be used as collateral in a lending protocol (like Aave or Compound) is assigned a specific liquidation threshold by the protocol's governance. For example, a stable and liquid asset like Ethereum (ETH) might have a liquidation threshold of 85%, while a more volatile asset might have a threshold of 65%.

2.  **Health Factor**: Protocols often represent this risk in a more user friendly way through a "Health Factor." A Health Factor is a number that represents the safety of your loan. A Health Factor greater than 1 means your loan is safely overcollateralized. If your Health Factor drops to 1, it means your debt value has reached the liquidation threshold of your collateral value, and your position is eligible for liquidation.

3.  **The Liquidation Process**: When a loan becomes eligible for liquidation, the protocol opens it up to "liquidators." These are users or bots who are incentivized to monitor the blockchain for risky loans. A liquidator can:
    a.  Repay a portion (or all) of your outstanding debt.
    b.  In return, they are allowed to claim an equivalent amount of your collateral plus a bonus, known as a "liquidation penalty." This penalty is the liquidator's profit and the borrower's loss.

4.  **Example Calculation**:
    - You deposit $10,000 worth of ETH as collateral.
    - The liquidation threshold for ETH is 85%.
    - You borrow $5,000 worth of USDC.
    - Your position is currently safe, as your loan ($5,000) is only 50% of your collateral value ($10,000).
    - Now, imagine the price of ETH drops, and your collateral is now worth only $5,800.
    - Your loan to value ratio is now $5,000 / $5,800 = ~86.2%.
    - Since 86.2% is greater than the 85% liquidation threshold, your position is now underwater and can be liquidated.

### Why It Matters

Understanding the liquidation threshold is not just important; it's essential for survival in DeFi borrowing.

-   **Prevents Loss of Assets**: The most obvious reason it matters is to prevent the forced sale of your collateral. Liquidations are financially painful because you not only lose your collateral but also have to pay a penalty.
-   **Informs Borrowing Strategy**: Knowing the threshold helps you decide how much to borrow. Borrowing close to the maximum allowed (the Collateral Factor) leaves you with very little room for market volatility and increases your risk of liquidation. A more conservative borrower will maintain a larger buffer.
-   **Highlights Asset Risk**: The threshold percentage itself is a signal of how risky the protocol considers an asset. A lower threshold indicates a more volatile or less liquid asset, warning the borrower to be more cautious.

### How to Avoid Liquidation

As a borrower, your primary goal is to keep your Health Factor safely above 1. You can do this in two main ways:

1.  **Add More Collateral**: If the market moves against you and your Health Factor is dropping, you can deposit more collateral into the protocol. This increases the denominator of your loan to value ratio, making your position safer.
2.  **Repay Part of the Loan**: You can also repay a portion of your outstanding debt. This reduces the numerator of the ratio, also increasing your Health Factor.

Proactive monitoring is key. Many dApps have built in notifications, and third party tools exist to alert you when your position is approaching the liquidation threshold, giving you time to act.

### FAQ

**Is the Liquidation Threshold the same as the Collateral Factor?**
No, they are different but related. The **Collateral Factor** determines the maximum amount you can *initially borrow*. The **Liquidation Threshold** is a higher percentage that triggers liquidation. For example, you might be able to borrow up to 80% of your collateral's value, but liquidation might not start until your debt reaches 85% of its value. This gap provides a small safety margin.

**Who gets the liquidation penalty?**
The liquidation penalty is the liquidator's profit. It incentivizes them to perform the crucial function of closing out risky loans, which protects the protocol from accumulating bad debt.

**Can my entire collateral be liquidated at once?**
It depends on the protocol. Many modern protocols are designed to only liquidate the smallest portion of your collateral necessary to bring your loan back to a healthy level. However, during extreme market volatility, multiple liquidations could occur, or a single one could clear a large portion of your position.
