---

title: "Understanding Concentrated Liquidity in Uniswap v3"
description: "An in-depth guide to Concentrated Liquidity, the new feature of Uniswap v3 that allows for greater capital efficiency, and its implications for."
category: "Educational"
image: "https://picsum.photos/seed/concliquidity/1200/630"
data-ai-hint: "concentrated liquidity"

publishedDate: "2026-03-11"
lastUpdated: "2026-06-14"
---

## Understanding Concentrated Liquidity in Uniswap v3

Uniswap v3 introduced a feature called **Concentrated Liquidity**. This innovation enables liquidity providers (LPs) to allocate their capital within specific price ranges, rather than spreading it across all potential prices from zero to infinity. 

Concentrated Liquidity allows LPs to manage their capital more effectively. By focusing their investments, LPs can earn the same fees with significantly less capital or generate higher fees without increasing their investment. However, this approach also introduces new complexities and risks, such as greater potential for impermanent loss.

This article explains concentrated liquidity, compares it to traditional Automated Market Makers (AMMs), outlines its benefits and risks, and discusses its implications for the [DeFi](/what-is-defi) ecosystem.

### Key Insights

| Aspect | Uniswap v2 | Uniswap v3 |
|------------------------------|-------------------------------------|------------------------------------------|
| Liquidity Distribution | Uniform across all prices | Concentrated in specific price ranges |
| Capital Efficiency | Low, much capital sits idle | High, potential for significant efficiency |
| Management Style | Passive, set-and-forget | Active, requires constant monitoring |
| Risk Profile | Standard impermanent loss | Increased impermanent loss with tight ranges |
| Fee Tiers | Single fee tier | Multiple fee tiers (e.g., 0.05%, 0.30%, 1.00%) |

1. **Core Concept**: Concentrated liquidity allows LPs to provide liquidity within specific price ranges of their choice, enhancing capital efficiency.
2. **Capital Efficiency**: LPs can earn significantly higher fees by concentrating capital around the current price, improving returns on investment.
3. **Active Management**: Unlike the passive nature of Uniswap v2, LPs must actively manage their positions in v3, adjusting price ranges as market conditions change.
4. **Increased Risk**: Concentrated liquidity increases the risk of impermanent loss. If the price moves outside an LP's selected range, their position becomes inactive and they may incur losses.
5. **Customizable Fee Tiers**: Uniswap v3 supports multiple fee tiers, enabling LPs to select a tier that aligns with the volatility of their chosen asset pair.

### The Problem with the Traditional AMM Model

To fully appreciate the advantages of concentrated liquidity, we must first examine the traditional model used by Uniswap v2, which is based on the **[constant product formula](/understanding-constant-product-formula)** (`x * y = k`).

In this model, liquidity is uniformly distributed along an infinite price curve. Consequently, LPs’ capital supports trades across all prices, from zero to infinity. 

However, much of this capital remains unused. For instance, in a stablecoin pair like USDC/DAI, the price typically hovers around one dollar. Funds allocated to support trades at lower or higher prices do not contribute to fee generation, leading to inefficiency.

### The Uniswap v3 Solution: Concentrated Liquidity

Uniswap v3 enables LPs to choose the price ranges where their capital will be deployed.

**How it Works:**
Instead of receiving a standard LP [token](/what-is-a-token) after depositing assets, v3 LPs specify their desired price range.
* **Example**: In an [ETH](/what-is-ethereum)/USDC pool with ETH priced at around $3,500, an LP might select a range of $3,000 to $4,000 for their liquidity provision.
* **Efficiency Gain**: By concentrating their capital in this active trading range, the LP can achieve the same liquidity depth as a v2 LP with significantly less capital. Uniswap estimates that a v3 LP can attain up to significant capital efficiency compared to a v2 LP.

When the asset price moves within the specified range, the LP's position remains active and generates trading fees.

**What Happens When the Price Moves Out of Range?**
This situation presents a significant risk. If the price of ETH falls below $3,000 or rises above $4,000, the LP's position becomes inactive.
* If the price exceeds $4,000, the entire position converts to the "cheaper" asset, USDC.
* If the price falls below $3,000, the LP's position converts entirely to the "more expensive" asset, ETH.

During this inactive period, the position earns zero fees. The LP must either wait for the price to return to their selected range or "re-range" their position by withdrawing liquidity and creating a new position based on the current price.

### The Trade-Off: Higher Fees vs. Higher Impermanent Loss

Concentrated liquidity creates a trade-off:
* **The Tighter the Range, the Higher the Fees**: A narrow price range means capital is highly concentrated, resulting in a larger share of the trading fees for transactions occurring within that range.
* **The Tighter the Range, the Higher the Risk**: Conversely, a narrow range increases the likelihood of price movements outside of it, leading to halted fee generation and greater impermanent loss compared to broader ranges.

This shift transforms liquidity provision from a passive activity into an active market-making strategy. Successful v3 LPs must continuously monitor and adjust their positions, akin to professional market makers.

### Range Orders

Concentrated liquidity allows for a new type of order. LPs can establish narrow liquidity positions in ranges that exist entirely above or below the current market price.

* **Example**: If ETH is priced at around $3,500, an LP could provide liquidity in the range of $4,000 to $4,010, using only USDC.
* **Functionality**: This position functions as a "limit order." If the price of ETH crosses $4,000, the position becomes active, selling USDC for ETH. The LP can then withdraw the ETH, effectively executing a limit sell order while simultaneously earning fees.

### Implications for the DeFi Ecosystem

The introduction of concentrated liquidity has several implications for the DeFi sector:
* **Professionalization of Market Making**: Concentrated liquidity has complicated on-chain market making, favoring sophisticated and active managers.
* **Emergence of LP Management Protocols**: Platforms like Arrakis Finance and Gamma have arisen to manage concentrated liquidity positions for passive users, simplifying the complexities of active range management.
* **Opportunities for MEV**: The structure of v3 has created new opportunities for Miner Extractable Value (MEV), particularly with **[Just-in-Time (JIT) liquidity](/what-is-just-in-time-liquidity)**, where bots provide and withdraw liquidity in the same block to capture fees from large trades.

### Frequently Asked Questions (FAQ)

**Q: Is providing liquidity on Uniswap v3 harder than on v2?** 
A: Yes, it is significantly more demanding. It requires active management and a solid understanding of market dynamics and impermanent loss. This is not a "set-and-forget" strategy.

**Q: What is a "tick" in Uniswap v3?** 
A: The price curve in Uniswap v3 is divided into discrete points called "ticks." LPs must align their price range boundaries with these ticks to optimize their positions.

**Q: How do the different fee tiers work?** 
A: Uniswap v3 allows for pools with varying fee tiers (e.g., 0.05% for stablecoin pairs, 0.30% for standard pairs, 1.00% for more volatile pairs). LPs select the fee tier that best corresponds to the volatility and risk of their asset pair. Higher volatility generally warrants higher fees to compensate for the increased risk of impermanent loss.

**Q: If the price goes out of my range, do I lose all my money?** 
A: No, while you do not lose your principal, your position will consist entirely of the asset that has depreciated in relative value. You will hold an inefficient [portfolio](/building-web3-portfolio) and experience impermanent loss until the price returns to your range or you reposition your liquidity.
