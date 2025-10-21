---
title: "Understanding Mark Price vs Index Price"
image: "https://picsum.photos/seed/mark-index/1200/630"
description: "Learn the crucial difference between Mark Price and Index Price in derivatives trading and why it matters for liquidation."
category: "DeFi"
data-ai-hint: "price comparison"
---

## Understanding Mark Price vs. Index Price

When trading perpetual futures or other crypto derivatives, you will encounter several different prices: the price on the exchange's order book (Last Price), the Index Price, and the Mark Price. While they are often very close, understanding their distinct roles is critical for risk management, especially regarding liquidations.

### Index Price: The "True" Spot Price

-   **What it is**: The Index Price is an aggregated price of the underlying asset, calculated by taking the average spot price from multiple major cryptocurrency exchanges.
-   **Purpose**: Its goal is to represent the "true," fair market value of the asset, resistant to manipulation on any single exchange. If one exchange experiences a flash crash or a sudden price spike, the Index Price will not be significantly affected because it is an average of many sources.
-   **Example**: The BTC/USD Index Price might be an average of the spot BTC price on Coinbase, Binance, Kraken, and Bitstamp.

The Index Price is the anchor of truth for the derivatives market.

### Mark Price: The Price Used for Liquidation

-   **What it is**: The Mark Price is the price that is actually used to calculate a trader's unrealized profits and losses (PnL) and, most importantly, to determine if a leveraged position should be liquidated.
-   **Purpose**: The primary purpose of the Mark Price is to prevent unfair liquidations caused by short-term volatility or manipulation on a single exchange.
-   **How it's Calculated**: The Mark Price is typically calculated as a combination of the **Index Price** and the **funding basis**. The funding basis represents the small difference (premium or discount) between the perpetual futures price and the spot price.
    -   `Mark Price = Index Price * (1 + Funding Basis)`

This formula ensures that the Mark Price moves closely with the spot price of the asset, rather than the potentially volatile price on the exchange's own order book.

### Last Price: The Price on the Order Book

-   **What it is**: The Last Price is simply the price at which the most recent trade occurred on that specific exchange's perpetual futures market.
-   **Purpose**: It reflects the current trading activity on that platform.
-   **Why it's not used for liquidations**: The Last Price can be volatile and is susceptible to manipulation. A single large, illiquid trade could cause a huge price spike or dip. If liquidations were based on the Last Price, it would be easy for malicious actors to trigger unfair liquidations on other traders.

### Why the Distinction Matters: An Example

Imagine you have a leveraged long position on ETH. A whale trader executes a massive market sell order on the exchange you are using, causing the **Last Price** of the ETH perpetual to flash crash by 10% for a few seconds before recovering.

-   If the exchange used the **Last Price** for liquidations, your position would be unfairly liquidated due to this temporary, localized price manipulation.
-   However, because exchanges use the **Mark Price**, your position is safe. The Mark Price did not crash because it primarily follows the **Index Price**, which was not affected by the event on that single exchange.

In summary:
-   **Index Price** = The true spot price of the asset from multiple sources.
-   **Last Price** = The most recent trade price on your specific exchange.
-   **Mark Price** = The price used for calculating PnL and liquidations, derived from the Index Price to prevent manipulation.

Always monitor the Mark Price for your positions, as this is what determines your liquidation risk.