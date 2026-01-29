---


title: "Understanding Mark Price vs Index Price"
image: "https://picsum.photos/seed/mark-index-price/1200/630"
description: "A guide to the difference between Mark Price and Index Price in crypto derivatives, and why Mark Price is crucial for preventing unfair liquidations."
category: "Educational"
data-ai-hint: "price comparison"

---



### Introduction

When trading perpetual futures or other crypto derivatives, you will notice that exchanges display several different prices for the same asset. The two most important are the **Index Price** and the **Mark Price**. While the last traded price on the exchange is what you see on the chart, it is the Mark Price, not the last traded price, that is used to calculate your unrealized profits and losses and, most importantly, to determine if your position should be liquidated. Understanding this distinction is critical for managing your risk.

### Index Price

The Index Price is intended to be the "true" market price of the underlying asset.

-   **How it's Calculated**: The Index Price is not based on the trading activity on a single exchange. Instead, it is an aggregate price that is calculated by taking a volume-weighted average of the spot price of the asset from several major, independent crypto exchanges.
-   **Purpose**: Its goal is to represent a fair, manipulation-resistant price for the asset. By pulling data from multiple sources, it ensures that a sudden price wick or trading anomaly on a single exchange does not unfairly affect the entire market.
-   **Example**: The Index Price for BTC/USDT on a derivative exchange might be an average of the spot BTC/USDT prices from Coinbase, Binance, Kraken, and Bitstamp.

### Last Price

The Last Price is simply the price at which the most recent trade occurred on that specific derivative exchange's order book. This is the price you see on the main price chart. The Last Price can sometimes deviate from the Index Price due to short-term buying or selling pressure on that particular exchange.

### Mark Price

The Mark Price is the price that is actually used for all margin and liquidation calculations. It is a calculated price designed to be a more stable and manipulation-resistant measure than the Last Price.

-   **How it's Calculated**: The Mark Price is typically calculated using a formula that combines the **Index Price** with a moving average of the **basis** (the difference between the Last Price and the Index Price). The formula is designed to smooth out short-term price fluctuations and converge towards the true spot price (the Index Price) over time.
    *Mark Price = Index Price + Moving Average (Last Price - Index Price)*
-   **Purpose**: The primary purpose of the Mark Price is to **prevent unfair liquidations**. In a volatile market, the Last Price on a single exchange can briefly wick to an extreme value due to a large market order or a temporary liquidity crunch. If liquidations were based on this Last Price, it could unfairly wipe out traders' positions. By using the Mark Price, which is anchored to the more stable Index Price, the exchange ensures that liquidations only happen in response to a sustained, real move in the broader market, not a temporary anomaly on one platform.

### Why It Matters

The use of a Mark Price is a critical feature for protecting traders.

-   **Prevents Unfair Liquidations**: It protects you from being liquidated due to a malicious "liquidation hunt" where a large whale tries to intentionally push the price on a single exchange to a level that triggers a cascade of liquidations.
-   **Accurate PnL Calculation**: It provides a more realistic measure of your unrealized Profits and Losses (PnL). While your position is open, your PnL is based on the difference between your entry price and the current Mark Price. The final, realized PnL is only determined by the actual price at which you close your position.
-   **Market Stability**: By smoothing out price data, it contributes to a more stable and orderly derivatives market, reducing the impact of short-term volatility and manipulation.

### Practical Example

Imagine you have a long position on ETH, and your liquidation price is $2,950.

-   The **Index Price** (from major spot exchanges) is stable at $3,000.
-   The **Last Price** on the derivative exchange you are using suddenly has a flash crash, wicking down to $2,940 for a few seconds due to a large sell order, before immediately bouncing back to $3,000.
-   The **Mark Price**, because it is heavily weighted towards the stable Index Price, might only move down to $2,995 during this event.

**Outcome**: Because your liquidation is based on the **Mark Price**, your position is **safe**. If liquidations were based on the Last Price, your position would have been unfairly closed out by the brief, anomalous price wick.

### FAQ

**Which price should I watch?**
You should be aware of all of them. The **Last Price** shows what is happening on the specific exchange you are trading on. The **Index Price** shows the "true" spot price across the market. The **Mark Price** is what you must monitor to manage your liquidation risk. Most exchanges will clearly display your position's liquidation price, which is always a Mark Price.

**Can the Mark Price and Last Price be very different?**
Yes, for short periods, especially during high volatility. The difference between them is called the "basis". A large basis indicates a significant deviation between the perpetual contract market and the underlying spot market, which is usually corrected over time by the funding rate mechanism.

**When is my final profit calculated?**
Your *unrealized* PnL is calculated using the Mark Price while the position is open. Your *realized* PnL is calculated only when you close your position, based on the actual price your closing trade executes at (the Last Price).
