---

title: "Understanding the Constant Product Formula in AMMs"
description: "A clear and simple guide to the constant product formula (x * y = k), the core mathematical engine that powers decentralized exchanges like Uniswap."
category: "Educational"
image: "https://picsum.photos/seed/xyk/1200/630"
data-ai-hint: "constant product formula"

publishedDate: "2026-03-11"
lastUpdated: "2026-04-27"
---

## Understanding the Constant Product Formula (`x * y = k`): The Engine of AMMs

The **Constant Product Formula**, expressed as `x * y = k`, serves as the mathematical foundation for many Automated Market Makers (AMMs) and Decentralized Exchanges (DEXs), including Uniswap v2. This formula establishes a "bonding curve" that sets asset prices in a liquidity pool automatically, eliminating the need for a traditional order book.

Grasping this formula is essential for understanding how [DeFi](/what-is-defi) liquidity pools function. It governs price settings, explains slippage, and clarifies the risks of impermanent loss faced by liquidity providers.

This article breaks down the constant product formula, its practical applications, and key characteristics.

### Key Insights

| **Term**  | **Definition**                                      |
|-----------|-----------------------------------------------------|
| Formula   | `x * y = k`, where `x` represents the amount of [Token](/what-is-a-token) A, `y` represents the amount of Token B, and `k` is a constant. |
| Rule      | The value of `k` must remain unchanged during a trade. An increase in one token's quantity necessitates an equivalent decrease in the other. |
| Price Discovery | The asset price in the pool is determined by the ratio of the reserves (`x / y`). Trades alter this ratio and therefore the price. |
| Infinite Liquidity | The hyperbolic curve of `x * y = k` suggests the pool can theoretically provide liquidity at any price, extending from zero to infinity. |
| Foundation of DeFi | This formula enabled the establishment of permissionless, automated exchanges that are integral to the DeFi ecosystem. |

### Breaking Down the Formula

Each component of `x * y = k` plays a crucial role:

- **`x`**: Total reserve of Token A in the liquidity pool.
  - *Example*: The number of [ETH](/what-is-ethereum) tokens in an ETH/USDC pool.
- **`y`**: Total reserve of Token B in the liquidity pool.
  - *Example*: The number of USDC tokens in an ETH/USDC pool.
- **`k`**: The constant product. This value is established when liquidity is first added to the pool and only changes when liquidity providers add or withdraw liquidity. During trades, `k` remains constant.

### How a Trade Works Using `x * y = k`

Consider a liquidity pool for ETH and USDC with the following conditions:
- `x` (ETH reserve) = 10 ETH
- `y` (USDC reserve) = 35,000 USDC

We first calculate the constant, `k`:
- `k = x * y = 10 * 35,000 = 350,000`

After any trade, the protocol ensures that the product of the new reserves equals 350,000.

The current price of ETH is derived from the reserve ratio:
- Price of ETH = `y / x` = 35,000 / 10 = **3,500 USDC per ETH**.

**Now, a trader aims to buy 1 ETH.**

1. The trader withdraws 1 ETH from the pool. The new ETH reserve (`x'`) becomes `10 - 1 = 9 ETH`.
2. The protocol must determine the new USDC reserve (`y'`) to maintain `k`:
   - `x' * y' = k`
   - `9 * y' = 350,000`
   - `y' = 350,000 / 9 = 38,888.89 USDC`
3. The amount of USDC the trader must deposit is calculated as the difference between the new and old reserves:
   - Cost = `y' - y` = 38,888.89 - 35,000 = **3,888.89 USDC**.

In this transaction:
- The trader pays 3,888.89 USDC for 1 ETH, resulting in an effective price of 3,888.89 USDC.
- The initial price was 3,500 USDC. The trader's trade caused the price to rise, demonstrating **[price impact](/what-is-price-impact-in-dex-trading)**.
- The new price of ETH in the pool is now `38,888.89 / 9 = 4,320.98 USDC`.

The formula automatically adjusts the price according to the reserve ratio changes.

### Characteristics of the Constant Product Curve

The formula `x * y = k` generates a hyperbolic graph. This shape has critical implications:

- **Asymptotic Nature (Infinite Liquidity)**: The curve never intersects the x or y-axis. Thus, no matter how much of one token is traded, the pool theoretically maintains liquidity for the other token, though at increasingly high prices.
  
- **Slippage**: The curve's convexity means larger trades endure more significant price impacts. As traders move along the curve, the price adjusts steeply, resulting in slippage.

- **Impermanent Loss**: When asset prices shift, the value of the assets held by a liquidity provider may decrease compared to simply holding the assets in their [wallet](/how-to-choose-a-crypto-wallet). This loss reflects the constant rebalancing of the LP’s [portfolio](/building-web3-portfolio) due to price changes inherent in the `x * y = k` formula.

### Beyond the Basic Formula: Fees

In practice, AMMs incorporate trading fees into the formula. For instance, Uniswap v2 applies a trading fee. The modified formulas are as follows:

- Before the trade: `x * y = k`
- After the trade: `(x + Δx) * (y - Δy) = k'`

The trading fee slightly increases the `k` value with each trade. This increment represents profit distributed to liquidity providers.

### The Evolution: Beyond `x * y = k`

While the constant product formula was pioneering, it exhibits limitations in capital efficiency. Consequently, more advanced invariants have emerged:

- **[StableSwap Invariant](/stableswap-invariant-explained-for-traders)**: Utilized by Curve, this hybrid formula optimizes trading for stablecoins, minimizing slippage for pegged assets.
- **Concentrated Liquidity**: Implemented by Uniswap v3, this feature lets LPs provide liquidity within specific price ranges, significantly enhancing capital efficiency.
- **Weighted Pools**: Used by Balancer, this variant allows for multiple assets with custom weightings (e.g., 80/20 instead of 50/50).

### Frequently Asked Questions (FAQ)

**Who invented the constant product formula for AMMs?**  
The formula is based on fundamental mathematics. Its application to AMMs was first articulated by Vitalik Buterin and popularized by Hayden Adams, the founder of Uniswap.

**Why is `k` constant?**  
`k` is the invariant the AMM is designed to maintain. It changes only when liquidity providers add or remove assets from the pool, which establishes a new `k`.

**Does the formula account for gas fees?**  
No, the formula does not include the network gas fees required to execute a transaction. Traders pay the amount specified by the AMM formula in addition to the gas fee.

**Is the price displayed on a DEX the price I will receive?**  
No, the displayed price reflects the current spot price before your trade. Your transaction will incur price impact, leading to a slightly worse execution price. Larger trades will experience a more pronounced difference.

## Why This Matters

Understanding the constant product formula is essential for professionals in the DeFi space. Mastery of this concept can enhance career prospects, increase earning potential, and accelerate advancement. This is particularly relevant in [Web3](/what-is-web3) organizations, where effective communication and collaboration are critical.

## Step-by-Step Guide

### Step 1: Understand the Fundamentals

Begin by comprehending core principles. This foundational knowledge will inform your future decisions. Read insights from industry leaders and thought leaders.

### Step 2: Assess Your Current Situation

Evaluate your current understanding. Identify your strengths and weaknesses. Recognizing specific challenges is vital for progress.

### Step 3: Develop Your Personal Strategy

Create a tailored plan. Consider your role, team dynamics, and personal goals. A customized approach yields the best results.

### Step 4: Implement Gradually

Avoid overwhelming changes. Start with small, manageable adjustments. Monitor what works and what does not to ensure sustainable improvement.

### Step 5: Measure and Adjust

Track your progress. Are you achieving desired results? Adjust your strategy based on feedback and outcomes. This iterative approach is essential for continuous improvement.

## Real-World Examples

### Example 1
Sarah, a developer at a [blockchain](/what-is-a-blockchain) startup, faced challenges with liquidity management. After implementing strategies based on the constant product formula, she improved her liquidity provisioning efficiency significantly within three months.

### Example 2
Juan, a product manager in DeFi, struggled with slippage in trades. By applying insights from the constant product model, he reduced slippage, enhancing overall trading efficiency.

### Example 3
Maya transitioned from Web2 to Web3 and rapidly adapted by applying the principles of the constant product formula. Her successful implementation led to a smoother onboarding process and increased her team's trading volume significantly in two months.

## Common Mistakes to Avoid

1. **Rushing the Process**: Expecting immediate results can lead to frustration. Sustainable change requires time.

2. **Ignoring Feedback**: Colleagues and mentors offer perspectives that may highlight blind spots. Actively seek their input.

3. **One-Size-Fits-All Approach**: Tailor strategies to your unique context. What works for others may not work for you.

4. **Giving Up Too Soon**: Embrace discomfort as a part of growth. Persist through initial challenges to achieve better outcomes.

5. **Not Tracking Progress**: Measuring progress is essential for improvement. Keep detailed metrics on your development.

## Conclusion

The constant product formula `x * y = k` is fundamental to understanding how AMMs operate. This knowledge equips professionals to manage the DeFi sector effectively. Mastering this concept not only enhances individual trading strategies but also elevates overall professional competence in the Web3 ecosystem. Engaging with this formula can lead to improved liquidity management, better trading decisions, and ultimately, greater success in the rapidly growing world of decentralized finance.
