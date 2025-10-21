---
title: "What is Auto-Deleveraging in Crypto Exchanges"
image: "https://picsum.photos/seed/auto-deleverage/1200/630"
description: "Learn about Auto-Deleveraging (ADL), a last-resort mechanism used by exchanges to handle extreme market volatility."
category: "DeFi"
data-ai-hint: "risk reduction"
---

## What is Auto-Deleveraging in Crypto Exchanges?

**Auto-Deleveraging (ADL)** is a mechanism of last resort used by some cryptocurrency derivatives exchanges to manage risk during periods of extreme market volatility. When a liquidated position cannot be closed at a price better than the bankruptcy price, and the exchange's insurance fund is insufficient to cover the losses, the ADL system is triggered.

In essence, ADL automatically closes out profitable positions on the opposite side of the market to cover the shortfall from the liquidated position.

### Why is ADL Necessary? The Liquidation Process

To understand ADL, we first need to understand the standard liquidation process for a leveraged position:

1.  **Liquidation Trigger**: A trader's position is flagged for liquidation when the Mark Price hits their liquidation price.
2.  **Liquidation Engine**: The exchange's liquidation engine takes over the position. It attempts to close the position in the open market.
3.  **Bankruptcy Price**: This is the price at which the trader's initial margin is completely wiped out. For a long position, this is the entry price minus the margin.
4.  **Insurance Fund**: If the liquidation engine can close the position at a price *better* than the bankruptcy price, the remaining funds are added to an insurance fund. This fund is designed to cover losses when positions are closed *worse* than the bankruptcy price.

### When Does Auto-Deleveraging Occur?

ADL is only triggered when two conditions are met simultaneously:

1.  A large position is liquidated during a very fast-moving market, and the liquidation engine cannot close it before the price goes past the bankruptcy price.
2.  The exchange's insurance fund is depleted or insufficient to cover the loss from this liquidation.

When this happens, the protocol has "bad debt" that must be covered. This is where ADL comes in.

### How Does ADL Work?

The ADL system identifies the most profitable, highest-leveraged traders on the **opposite side** of the trade. These profitable positions are then automatically and forcibly closed (deleverage) at the bankruptcy price of the liquidated order to cover the loss.

-   **Who is at risk?** Traders are typically ranked for ADL based on their profitability and leverage. The more profitable and more highly leveraged you are, the higher your rank in the ADL queue. Most exchanges provide an indicator in the UI to show you your approximate position in the queue.
-   **Example**:
    -   A massive leveraged long position is liquidated during a market crash.
    -   The insurance fund is depleted.
    -   The ADL system is triggered.
    -   It identifies the most profitable short-sellers.
    -   The system forcibly closes the positions of these top short-sellers at the bankruptcy price, effectively taking their profits to cover the protocol's loss.

### The Controversial Nature of ADL

Auto-Deleveraging is a controversial mechanism because it socializes losses among the winning traders on the platform. It means that even if you have a profitable and well-managed position, you can be forcibly closed out of it not because of your own actions, but because of the failure of another trader and the insufficiency of the insurance fund.

While it is a necessary evil to ensure the solvency of the exchange, most traders seek to avoid exchanges that frequently rely on ADL, and exchanges aim to build large enough insurance funds to make ADL events extremely rare.