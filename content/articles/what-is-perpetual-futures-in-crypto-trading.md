---
title: "What is Perpetual Futures in Crypto Trading"
image: "https://picsum.photos/seed/perpetual-futures/1200/630"
description: "An introduction to perpetual futures, the most popular crypto derivative, and how they work without an expiry date."
category: "DeFi"
data-ai-hint: "infinite chart"
---

## What is Perpetual Futures in Crypto Trading?

A **perpetual future**, often called a "perpetual swap" or simply a "perp," is a type of derivative product in cryptocurrency trading that is similar to a traditional futures contract but with one key difference: **it has no expiration date**.

This feature has made perpetual futures the most popular and widely traded derivative in the crypto market, as it allows traders to hold a leveraged position for as long as they wish, provided they maintain sufficient margin.

### Traditional Futures vs. Perpetual Futures

To understand perpetuals, it helps to first understand traditional futures contracts:

-   **Traditional Futures**: An agreement to buy or sell an asset at a predetermined price on a specific date in the future (the expiration date). As the expiration date approaches, the price of the futures contract naturally converges with the spot price of the underlying asset.
-   **Perpetual Futures**: A contract that tracks the price of an underlying asset but never expires. Since there is no expiration date to force price convergence, a different mechanism is needed to keep the perpetual contract's price in line with the spot price. This mechanism is called the **funding rate**.

### The Funding Rate: The Key Mechanism

The funding rate is the central innovation of perpetual futures. It is a periodic payment made between traders who are long (buyers) and traders who are short (sellers) to keep the perp price tethered to the spot price of the underlying asset.

The funding rate mechanism works as follows:

1.  **If the perpetual price is trading ABOVE the spot price (Contango):**
    -   **Meaning**: There is more buying pressure on the perpetual contract. Longs are optimistic.
    -   **Funding Rate is POSITIVE**: Traders who are long pay a small fee to traders who are short.
    -   **Effect**: This incentivizes traders to open short positions (to receive the funding fee) and for longs to close their positions (to stop paying the fee), which pushes the perpetual price back down towards the spot price.

2.  **If the perpetual price is trading BELOW the spot price (Backwardation):**
    -   **Meaning**: There is more selling pressure on the perpetual contract. Shorts are pessimistic.
    -   **Funding Rate is NEGATIVE**: Traders who are short pay a small fee to traders who are long.
    -   **Effect**: This incentivizes traders to open long positions (to receive the funding fee) and for shorts to close their positions (to stop paying the fee), which pushes the perpetual price back up towards the spot price.

Funding payments are typically exchanged every 8 hours (though this can vary by exchange) and do not go to the exchange, but directly between traders.

### Why Trade Perpetuals?

-   **Leverage**: Perpetual futures allow traders to use leverage, meaning they can open a position much larger than their initial capital (margin). This magnifies both potential profits and potential losses.
-   **No Expiry**: Traders can hold a position indefinitely without having to worry about rolling it over to a new contract as an expiration date approaches.
-   **Shorting**: They provide an easy way to bet against the price of an asset (go short) without actually owning it.

Perpetual futures are powerful tools, but they are also high-risk due to the use of leverage. A small adverse price movement can lead to the complete loss of a trader's margin (liquidation).