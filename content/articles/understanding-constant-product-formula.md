---

title: "Understanding the Constant Product Formula in AMMs"
description: "A clear and simple guide to the constant product formula (x * y = k), the core mathematical engine that powers decentralized exchanges like Uniswap."
category: "Educational"
image: "https://picsum.photos/seed/xyk/1200/630"
data-ai-hint: "constant product formula"

publishedDate: "2026-03-11"
lastUpdated: "2026-03-15"
---

## Understanding the Constant Product Formula (`x * y = k`): The Engine of AMMs

The **Constant Product Formula**, most famously expressed as `x * y = k`, is the elegant mathematical equation that powers many of the most popular Automated Market Makers (AMMs) and Decentralized Exchanges (DEXs), including Uniswap v2. This formula creates a "bonding curve" that automatically determines the price of assets in a liquidity pool without needing a traditional order book.

Understanding this simple formula is the key to unlocking the magic of how [DeFi](/what-is-defi) liquidity pools work. It dictates how prices are set, why slippage occurs, and why liquidity providers are exposed to impermanent loss.

This guide provides a straightforward explanation of the constant product formula, how it works in practice, and its core characteristics.

### Key Insights

*   **The Formula**: `x * y = k`, where `x` is the amount of [Token](/what-is-a-token) A, `y` is the amount of Token B, and `k` is a constant.
*   **The Rule**: The core rule of the protocol is that `k` must remain constant during a trade. To keep `k` the same, if you take some of `x` out, you must add a proportional amount of `y` in, and vice-versa.
*   **Price Discovery**: The price of an asset in the pool is simply the ratio of the two reserves (`x / y`). Trades automatically adjust the price by changing this ratio.
*   **Infinite Liquidity**: The hyperbolic shape of the `x * y = k` curve means that the pool can theoretically provide liquidity at any price, from zero to infinity.
*   **The Foundation of DeFi**: This simple formula enabled the creation of permissionless, automated exchanges that have become a cornerstone of the DeFi ecosystem.

### Breaking Down the Formula

Let's look at each component of `x * y = k`:

*   **`x`**: The total reserve of Token A in the liquidity pool.
    *   *Example*: The number of [ETH](/what-is-ethereum) tokens in an ETH/USDC pool.
*   **`y`**: The total reserve of Token B in the liquidity pool.
    *   *Example*: The number of USDC tokens in an ETH/USDC pool.
*   **`k`**: The constant product. This value is calculated when liquidity is first added to the pool and only changes when LPs add or remove liquidity. **During a trade, `k` must not change.**

### How a Trade Works Using `x * y = k`

Imagine a liquidity pool for ETH and USDC with the following state:
*   `x` (ETH reserve) = 10 ETH
*   `y` (USDC reserve) = 35,000 USDC

First, we calculate our constant, `k`:
*   `k = x * y = 10 * 35,000 = 350,000`

The protocol's job is to ensure that after any trade, the product of the new reserves is still 350,000.

The current price of ETH is the ratio of the reserves:
*   Price of ETH = `y / x` = 35,000 / 10 = **3,500 USDC per ETH**.

**Now, a trader wants to buy 1 ETH.**

1.  The trader will remove 1 ETH from the pool. The new ETH reserve (`x'`) will be `10 - 1 = 9 ETH`.
2.  The protocol must now solve for the new USDC reserve (`y'`) that will keep `k` constant.
    *   `x' * y' = k`
    *   `9 * y' = 350,000`
    *   `y' = 350,000 / 9 = 38,888.89 USDC`
3.  The amount of USDC the trader must deposit is the difference between the new reserve and the old reserve:
    *   Cost = `y' - y` = 38,888.89 - 35,000 = **3,888.89 USDC**.

Notice what happened:
*   The trader paid 3,888.89 USDC for 1 ETH, an effective price of $3,888.89.
*   The initial price was $3,500. The trader's own trade moved the price against them. This is **[price impact](/what-is-price-impact-in-dex-trading)**.
*   The new price of ETH in the pool is now `38,888.89 / 9 = 4,320.98 USDC`.

The formula automatically adjusted the price based on the change in the ratio of the reserves.

### Characteristics of the Constant Product Curve

The formula `x * y = k` produces a graph that is a hyperbola. This shape has important implications:

*   **Asymptotic Nature (Infinite Liquidity)**: The curve never touches the x or y-axis. This means that no matter how much of one token is bought, the pool will never run out of the other. The price will just become astronomically high. This guarantees that there is always liquidity, at least in theory.

*   **Slippage**: The curve is convex. The more you move along the curve (i.e., the larger your trade), the steeper it gets. This means that larger trades will always suffer from more price impact, or slippage, than smaller trades.

*   **Impermanent Loss**: When the price of the assets in the pool changes, the value of the assets held by a liquidity provider will be less than if they had simply held the assets in their [wallet](/how-to-choose-a-crypto-wallet). This "opportunity cost" is a direct result of the `x * y = k` formula constantly rebalancing the LP's [portfolio](/building-web3-portfolio) in response to price changes.

### Beyond the Basic Formula: Fees

In a real AMM, the formula is slightly modified to include a trading fee. For example, in Uniswap v2, the fee is 0.3%. The formula is closer to:

`x * y = k` (before the trade)
`(x + Δx) * (y - Δy) = k'` (after the trade)

The trading fee means that the `k` value actually *increases* slightly with every trade. This increase is the profit that is distributed to the liquidity providers.

### The Evolution: Beyond `x * y = k`

While the constant product formula was revolutionary, it has limitations, especially in capital efficiency. This has led to the development of new, more advanced invariants:

*   **[StableSwap Invariant](/stableswap-invariant-explained-for-traders)**: Used by Curve, this hybrid formula is optimized for stablecoins, providing much lower slippage for pegged assets.
*   **Concentrated Liquidity**: Used by Uniswap v3, this allows LPs to provide liquidity in specific price ranges, dramatically improving capital efficiency.
*   **Weighted Pools**: Used by Balancer, this generalizes the formula to allow for more than two assets and custom weightings (e.g., 80/20 instead of 50/50).

### Frequently Asked Questions (FAQ)

**Q: Who invented the constant product formula for AMMs?**
A: While the formula itself is basic math, its application to create an AMM was first described publicly by Vitalik Buterin and was popularized and implemented by Hayden Adams, the founder of Uniswap.

**Q: Why is `k` constant?**
A: `k` is the "invariant" that the AMM is programmed to maintain. It is the core rule of the system. It only changes when liquidity providers add or remove funds from the overall pool, which establishes a new `k`.

**Q: Does the formula account for gas fees?**
A: No. The formula itself does not account for the network gas fees that a trader must pay to execute the transaction. The trader pays the amount dictated by the AMM formula *plus* a separate gas fee to the network validators.

**Q_ Is the price shown on a DEX before a trade the price I will get?**
A: No. The price displayed is the current spot price before your trade. Your trade will have a price impact, and you will always receive a slightly worse average execution price. For large trades, this difference can be significant.

## Why This Matters

Understanding this concept is crucial for your professional success. In today's dynamic workplace environment, professionals who master this skill stand out, earn higher salaries, and advance faster. This is especially true in [Web3](/what-is-web3) organizations where communication and collaboration are paramount.

## Step-by-Step Guide

### Step 1: Understand the Fundamentals

Begin by grasping the core principles. This foundation will inform everything else you do in this area. Take time to read about best practices from industry leaders and thought leaders.

### Step 2: Assess Your Current Situation

Evaluate where you stand today. Are you strong in some aspects and weak in others? What specific challenges are you facing? Understanding your baseline is critical.

### Step 3: Develop Your Personal Strategy

Create a plan tailored to your situation. Everyone's circumstances are different, so your approach should be customized. Consider your role, team dynamics, organization culture, and personal goals.

### Step 4: Implement Gradually

Don't try to change everything at once. Start with one small change and build from there. Track what works and what doesn't. This iterative approach leads to sustainable improvement.

### Step 5: Measure and Adjust

Monitor your progress. Are you seeing results? Adjust your approach based on feedback and outcomes. This continuous improvement mindset is essential.

## Real-World Examples

### Example 1
Consider Sarah, a developer at a [blockchain](/what-is-a-blockchain) startup. She struggled with {topic} until she implemented these strategies. Within 3 months, she saw dramatic improvements in her {relevant metric}.

### Example 2
Juan, a product manager in DeFi, faced similar challenges. By following this framework, he was able to {achieve outcome}. His experience demonstrates how universal these principles are.

### Example 3
Maya, transitioning from Web2 to Web3, used this approach to quickly adapt. Her success shows that this works regardless of your background or experience level.

## Common Mistakes to Avoid

1. **Rushing the Process** - Don't expect overnight results. Sustainable change takes time.

2. **Ignoring Feedback** - Your colleagues, managers, and mentors see things you might miss. Listen to their input.

3. **One-Size-Fits-All Approach** - What works for someone else might not work for you. Adapt these strategies to your context.

4. **Giving Up Too Soon** - Change is uncomfortable. Push through the initial discomfort to reach better outcomes.

5. **Not Tracking Progress** - You can't improve what you don't measure. Keep metrics on your progress.

## FAQ

**Q: How long will this take to implement?**
A: Most people see initial results within 2–4 weeks of consistent application, with significant and measurable improvements visible within 8–12 weeks. The timeline varies depending on your starting baseline, how much daily practice you commit to, and whether you seek feedback actively. Professionals who track their progress — through metrics, peer feedback, or journaling — typically move faster than those who rely on passive observation. Treating implementation as a structured project rather than a vague intention consistently produces better outcomes.

**Q: What if my workplace environment doesn't support this?**
A: Even in genuinely difficult environments, you typically have more agency than it first appears. Start with small, self-contained actions that don't require organizational buy-in — individual habits, personal projects, or internal conversations with aligned colleagues. Build momentum gradually rather than waiting for permission. Document your progress and the results you create. If, after sustained effort, the environment structurally prevents your development, that itself is important career information: the right move may be to seek an environment that actively invests in people.

**Q: How does this apply specifically to Web3?**
A: Web3 organizations differ structurally from traditional companies in ways that amplify the importance of these skills. Hierarchies are flatter, meaning you have more direct access to decision-makers but also more responsibility for self-direction. Teams are predominantly remote and globally distributed, so written communication and async collaboration matter more than in-office dynamics. Pace is faster — product cycles that take quarters in enterprise Web2 often happen in weeks at Web3 startups. Adapting to this environment is itself a core professional skill in the space.

**Q: Can I implement this alongside my current role?**
A: Yes — and this is the recommended approach for most professionals. You rarely need additional hours; you need intentionality within the hours you already have. Identify two or three practices that map directly to work you do every day and focus on applying them consistently rather than trying to overhaul everything at once. The compounding effect of small, deliberate improvements applied daily significantly outperforms sporadic large efforts. Most people who successfully develop new professional habits do so without changing their total work hours.

**Q: What resources can help me go deeper?**
A: The related articles section below covers specific aspects in greater depth — start there for targeted reading. Beyond written resources, the highest-leverage move is finding a mentor or peer group of people who already excel in this area: observing how they operate in practice teaches you things no article can convey. Web3-specific communities on Discord and Telegram often have practitioners willing to share their processes. Structured accountability — committing to a timeline with someone who will check in — also accelerates progress meaningfully.

