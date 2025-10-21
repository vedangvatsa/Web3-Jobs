---
title: "What is Open Interest in Crypto Derivatives"
image: "https://picsum.photos/seed/open-interest/1200/630"
description: "A guide to understanding Open Interest, a key metric that measures the total number of outstanding derivative contracts and indicates market activity."
category: "Educational"
data-ai-hint: "contract document"
---

### Introduction

In the world of crypto derivatives trading, metrics like price and volume are familiar to everyone. However, there is another crucial data point that provides a deeper insight into market activity and sentiment: **Open Interest**. Open Interest (OI) represents the total number of outstanding derivative contracts, such as futures or options, that have not yet been settled or closed. It is a measure of the total capital and number of active positions in a market, and analyzing its changes can offer valuable clues about the market's strength and potential direction.

### How It Works

Open Interest is a straightforward tally of all open contracts. It's important to distinguish it from trading volume.

-   **Volume** counts the total number of contracts traded during a specific period. Every trade, whether it opens a new position or closes an old one, adds to the volume.
-   **Open Interest** only counts the contracts that are currently active.

Here’s how different actions affect Open Interest:

1.  **A trader opens a new long position, and another trader opens a new short position**: A new contract is created. **Open Interest increases by 1.**
2.  **A trader closes their long position by selling to a new short trader**: The contract is passed from one party to another. The total number of open contracts remains the same. **Open Interest is unchanged.**
3.  **A trader with a long position closes it by selling to a trader who is closing their short position**: An existing contract is closed out. **Open Interest decreases by 1.**

In essence, Open Interest only increases when new capital enters the market (creating a new long and a new short) and only decreases when capital leaves the market (when a long and a short cancel each other out).

### Why It Matters

Analyzing changes in Open Interest in conjunction with price and volume can provide a much richer picture of the market dynamics.

-   **Indicator of Market Strength**: A rising Open Interest alongside a rising price is generally a bullish signal. It indicates that new money is entering the market to support the uptrend, suggesting the trend is strong and likely to continue.
-   **Warning of a Weak Trend**: A falling Open Interest during a price trend (either up or down) can be a warning sign. It suggests that participants are closing their positions and capital is leaving the market, indicating that the current trend may be running out of steam and is due for a reversal.
-   **Sign of a "Short Squeeze" or "Long Squeeze"**: A rapid, sharp increase in Open Interest during a period of consolidation can signal that a large number of new positions are being built up. If the price then moves suddenly against this large pool of positions (e.g., a sudden price jump when OI is high and many are short), it can trigger a cascade of liquidations, known as a "squeeze."

### Interpreting Open Interest with Price

Here is a common framework for interpreting OI changes:

| Price | Open Interest | Volume | Interpretation |
| :--- | :--- | :--- | :--- |
| **Rising** | **Rising** | High | **Bullish**: New money is entering to support the uptrend. The trend is strong. |
| **Rising** | **Falling** | Low | **Bearish**: Traders are closing their long positions (taking profit) and not enough new buyers are entering. The uptrend may be weakening. |
| **Falling** | **Rising** | High | **Bearish**: New money is entering to open short positions. The downtrend is strong. |
| **Falling** | **Falling** | Low | **Bullish**: Traders are closing their short positions. The downtrend may be losing momentum and could be due for a reversal. |

### Practical Example

Imagine the price of Ethereum is rising steadily.

-   **Scenario 1**: As the price of ETH moves from $3,000 to $3,200, you observe that the Open Interest for ETH perpetual futures also increases significantly. This is a bullish confirmation. It tells you that new buyers are confidently entering the market, adding capital and conviction to the uptrend.

-   **Scenario 2**: As the price of ETH moves from $3,000 to $3,200, you notice that Open Interest is actually flat or declining. This is a bearish divergence and a potential warning sign. It suggests that the price rise is being driven by shorts closing their positions, not by new longs entering. The rally may not be sustainable.

### FAQ

**Where can I find data on Open Interest?**
Most major crypto exchanges display Open Interest for their derivative products. Additionally, data analytics platforms like Coinglass, Velo Data, and Glassnode provide comprehensive charts and data on Open Interest across all major exchanges.

**Is high Open Interest always bullish?**
Not necessarily. High Open Interest simply means there are a large number of active positions. It can indicate a strong trend in *either* direction. High OI during an uptrend is bullish, but high OI during a downtrend is bearish. High OI can also indicate that the market is heavily leveraged and vulnerable to a squeeze.

**What is the difference between Open Interest in USD and in the native coin?**
OI is often displayed in both USD terms and in terms of the underlying coin (e.g., ETH or BTC). Looking at OI in coin terms can sometimes be more accurate, as it removes the effect of the coin's own price changes on the USD value of the contracts.
