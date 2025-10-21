---
title: "What is Auto-Deleveraging in Crypto Exchanges"
image: "https://picsum.photos/seed/auto-deleveraging/1200/630"
description: "Understand Auto-Deleveraging (ADL), the last-resort mechanism used by exchanges to manage risk when the insurance fund is depleted."
category: "Educational"
data-ai-hint: "risk scale"
---

### Introduction

In the high-stakes world of leveraged crypto derivatives trading, exchanges need robust systems to manage risk. The primary safety net is the **liquidation** of undercollateralized positions, with any remaining losses being covered by an **insurance fund**. However, in moments of extreme market volatility, it's possible for a position to be liquidated at a price so poor that the loss exceeds the user's initial margin, and the insurance fund is insufficient to cover the deficit. In these rare cases, exchanges employ a last-resort mechanism known as **Auto-Deleveraging (ADL)**.

### What is Auto-Deleveraging (ADL)?

Auto-Deleveraging is a process where a derivatives exchange automatically closes out profitable opposing positions to cover the losses from a bankrupt liquidated position. It is a mechanism of socialized loss, but instead of applying to all users, it is targeted specifically at profitable, high-leverage traders on the other side of the market.

**The Waterfall of Risk Management:**

To understand ADL, you must first understand the standard risk management process:
1.  **Margin**: A user posts margin to open a leveraged position.
2.  **Liquidation**: If the market moves against the user and their margin is depleted, the exchange's liquidation engine takes over the position and attempts to close it in the market.
3.  **Bankruptcy**: In a very fast-moving market, the price might move so quickly that the position is closed at a price *worse* than the bankruptcy price (where the loss equals the initial margin). This leaves a deficit.
4.  **Insurance Fund**: The exchange maintains an insurance fund, built up from the fees of non-bankrupt liquidations, to cover these deficits.
5.  **Auto-Deleveraging (ADL)**: If the insurance fund is depleted and cannot cover the loss, ADL is triggered.

### How ADL Works

When ADL is triggered, the exchange needs to find someone to take the other side of the bankrupt position. It does this by force-closing the positions of profitable traders on the opposite side of the market.

1.  **The ADL Queue**: The exchange maintains a ranking system for all open positions. This ranking is based on profitability and leverage. Traders with the highest profits and the highest effective leverage are placed at the front of the queue. Most exchanges have an indicator on the trading interface (often a series of five lit bars) that shows your priority in the ADL queue.
2.  **Position Matching**: The system identifies the most profitable, highest-leveraged traders who are on the opposite side of the bankrupt position.
3.  **Forced Closure**: The positions of the traders at the front of the ADL queue are automatically closed (deleveraged) at the bankruptcy price of the liquidated order. These profitable traders are forced to realize their profits and give up their position to cover the system's loss.

### Why It Matters

ADL is a highly controversial but sometimes necessary mechanism.

-   **System Solvency**: It is the final backstop that prevents the entire exchange from going insolvent. It ensures that the exchange can always cover its losses and that the winning traders' profits are not socialized across the entire platform (a "clawback").
-   **Risk to Profitable Traders**: For individual traders, ADL is a major risk. It means that even if you have a highly profitable position, it can be forcibly closed against your will, causing you to miss out on future potential gains.
-   **Incentivizes Risk Management**: The existence of ADL encourages traders to manage their own leverage. By using lower leverage, you reduce your position in the ADL queue and are less likely to be auto-deleveraged.

### Practical Example

-   A trader, Alice, is long 1,000 BTC contracts and is highly profitable. Her position is ranked at the top of the ADL queue for longs.
-   The market crashes violently. Another trader, Bob, who had a large leveraged long position, gets liquidated.
-   The crash is so fast that Bob's position is closed at a price that results in a loss greater than his margin, creating a deficit that the insurance fund cannot cover.
-   ADL is triggered. The exchange needs someone to take the short side of Bob's bankrupt long position.
-   The system identifies Alice as the highest-ranking opposing (long) trader.
-   Alice's profitable long position is automatically closed at the bankruptcy price of Bob's position. She keeps her realized profits up to that point but loses the position and cannot profit from any subsequent market recovery.

### FAQ

**How can I avoid being auto-deleveraged?**
The primary way is to lower your effective leverage. The ADL ranking is based on both profit and leverage. By reducing your leverage, you lower your priority in the queue. Some traders will also close and re-open positions to "reset" their unrealized profit, though this is a less reliable method.

**Is ADL common?**
No. It is a rare, last-resort event. On major, highly liquid exchanges, the liquidation engines and insurance funds are typically robust enough to handle even extreme volatility. However, it can and does happen, especially on less liquid pairs or during unprecedented market crashes.

**Do all exchanges use ADL?**
Most derivatives exchanges have some form of ADL or a similar mechanism (sometimes called a socialized loss system) as a final backstop. However, the exact implementation and priority ranking system can differ between exchanges.
