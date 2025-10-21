---
title: "What is Perpetual Futures in Crypto Trading"
image: "https://picsum.photos/seed/perpetual-futures/1200/630"
description: "An introduction to perpetual futures, the most popular crypto derivative, explaining how they work without an expiry date through the funding rate mechanism."
category: "Educational"
data-ai-hint: "infinity chart"
---

### Introduction

Perpetual futures, often called "perpetuals" or "perps," are the most popular and heavily traded derivative product in the crypto markets. They are a type of futures contract, but with one key difference: they have no expiry date. This unique feature allows traders to hold a leveraged position for as long as they want, provided they have enough margin to cover it. Understanding how perpetuals work, particularly the funding rate mechanism, is essential for any aspiring crypto trader.

### How It Works

A traditional futures contract has a set expiry date. As the contract approaches expiry, its price naturally converges with the underlying asset's spot price. Since a perpetual future never expires, it needs a different mechanism to keep its price tethered to the spot price. This mechanism is the **funding rate**.

1.  **The Contract**: A perpetual future is an agreement to buy or sell an asset at a predetermined price, but with no settlement date. You are not trading the actual asset (like ETH), but rather a contract that tracks its price. This allows for high leverage.

2.  **Price Peg Mechanism (The Funding Rate)**: The funding rate is the core innovation of perpetuals. It is a periodic payment made between traders who are long (betting the price will go up) and traders who are short (betting the price will go down).
    -   **When the perpetual price is > spot price**: The contract is trading at a premium. This indicates there are more buyers (longs) than sellers (shorts). To pull the price back down, the funding rate becomes **positive**. This means that traders who are long must pay a small fee to traders who are short. This incentivizes new shorts to enter the market and existing longs to close their positions, pushing the price down towards the spot price.
    -   **When the perpetual price is < spot price**: The contract is trading at a discount. This indicates more shorts than longs. The funding rate becomes **negative**. Traders who are short must pay a fee to traders who are long. This incentivizes new longs to enter and existing shorts to close, pushing the price up towards the spot price.

3.  **Leverage and Liquidation**: Like other derivatives, perpetuals allow traders to use leverage, meaning they can open a position that is much larger than their initial capital (margin). For example, with 10x leverage, a $100 deposit can control a $1,000 position. While this amplifies potential profits, it also amplifies losses. If the price moves against a trader's position by a certain percentage, their margin will be insufficient to cover the loss, and the exchange will automatically close their position. This is called **liquidation**.

### Why It Matters

Perpetual futures have come to dominate the crypto trading landscape for several reasons.

-   **No Expiry Date**: This is the main appeal. Traders can hold a position for days, weeks, or months without having to worry about rolling it over to a new contract, which is a hassle in traditional futures markets.
-   **High Liquidity**: Perpetuals are the most liquid products for many crypto assets, often having more trading volume than the spot markets themselves. This means traders can enter and exit large positions with minimal price impact (slippage).
-   **Leverage**: They provide easy access to high leverage, allowing traders to amplify their exposure to price movements with a small amount of capital.
-   **Ability to Go Short**: Perpetuals provide a simple way for traders to bet against the market and profit from a decrease in an asset's price.

### Practical Example

Let's say the spot price of Bitcoin is $60,000.

-   **Scenario 1: Bullish Sentiment**
    -   Due to high demand from buyers, the price of the Bitcoin perpetual future (BTC-PERP) trades at $60,050, a premium to the spot price.
    -   The protocol calculates a **positive funding rate** of +0.01%.
    -   Every 8 hours (a common interval), traders who are holding long positions will automatically pay 0.01% of their position size to traders who are holding short positions.
    -   This small but constant cost for longs discourages further buying and encourages shorting, which helps to anchor the perpetual price back to the $60,000 spot price.

-   **Scenario 2: Bearish Sentiment**
    -   The BTC-PERP price trades at $59,950, a discount to spot.
    -   The funding rate becomes **negative** (-0.01%).
    -   Now, shorts must pay longs 0.01% of their position size every 8 hours. This makes it expensive to be short and profitable to be long, encouraging price convergence.

### FAQ

**Who sets the funding rate?**
The funding rate is not set by the exchange. It is calculated algorithmically based on the difference (the "basis") between the perpetual contract price and the underlying spot price.

**Is the funding rate a fee paid to the exchange?**
No. The funding rate is a peer to peer payment directly between traders. The exchange does not collect it. The exchange makes money by charging a small trading fee on each transaction.

**What are the risks of trading perpetuals?**
The primary risk is liquidation due to the use of leverage. Even a small adverse price move can wipe out your entire margin if you are using high leverage. Other risks include unexpected funding rate costs and the counterparty risk of the exchange itself.
