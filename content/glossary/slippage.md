---
term: "Slippage"
slug: "slippage"
category: "Trading & Markets"
difficulty: "Beginner"
image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=600&fit=crop"
imageAlt: "Price movement and trading execution visualization"
description: "The difference between the expected price of a trade and the actual execution price. Occurs due to price movement between order submission and execution, especially in volatile or low-liquidity markets."
relatedTerms: ["dex", "amm", "liquidity-pool"]
synonyms: ["price slippage", "execution difference"]
---

Slippage is the difference between the price you expect to pay for a trade and the price you actually get. If you try to buy a token expecting to pay $100 but end up paying $102, you've experienced 2% slippage. This happens because prices move between when you click "swap" and when your transaction executes, or because your trade itself moves the market—especially common in automated market makers and low-liquidity pairs.

## How Slippage Occurs

In traditional order book exchanges, slippage happens when market orders consume multiple price levels. If you want to buy 10,000 tokens but only 5,000 are available at the best price, your order fills partially at that price then continues filling at progressively worse prices until complete. The average execution price differs from the initial quoted price.

On automated market makers like Uniswap, slippage occurs due to AMM mathematics. The constant product formula means each trade moves the price along a curve. Larger trades relative to pool size cause more price movement. When you swap a significant amount, you're pushing the price as you buy, resulting in worse average execution than the initial quote.

## Slippage Tolerance Settings

Most DEX interfaces let you set maximum acceptable slippage—typically 0.5%, 1%, or custom amounts. If actual slippage would exceed your tolerance, the transaction reverts, protecting you from unexpectedly bad execution. This protects against both natural price movement and front-running attacks where bots see your transaction and trade ahead of you.

Setting appropriate slippage tolerance involves tradeoffs. Too tight and transactions fail frequently when prices move slightly. Too loose and you accept poor execution. Volatile tokens and small-cap coins require higher tolerance due to natural price volatility. Stable pairs like USDC/DAI need minimal tolerance since prices stay close to 1:1.

## Price Impact vs Slippage

Price impact and slippage are related but distinct. Price impact is the immediate market movement your trade causes—visible in the interface before confirming. If a pool has low liquidity and you make a large trade, your price impact will be high. You can see this before submitting the transaction.

Slippage includes price impact plus any additional price movement from other transactions executing between yours. If you see 2% price impact but another trade executes first, pushing prices further, you might experience 2.5% slippage. Price impact is predictable; slippage includes uncertainty from other market participants.

## Front-Running and MEV

Maximal Extractable Value (MEV) bots watch the mempool for large trades. When they spot a transaction with significant price impact, they front-run it—placing their own buy before your trade, then selling after for a profit. Your slippage increases beyond what price impact alone would cause because the bot pushed prices before your trade executed.

Private mempools and MEV-protected services like Flashbots help mitigate this. These services hide transactions from public viewing until inclusion in a block, preventing front-running. The trade-off is you're trusting the service to not exploit your transactions themselves. MEV protection is an evolving area with various solutions offering different trust assumptions.

## Liquidity and Slippage Relationship

Deeper liquidity means less slippage for equivalent trade sizes. A $10,000 trade in a pool with $10 million liquidity causes minimal price impact. The same trade in a $100,000 pool causes significant movement. This is why major pairs on leading DEXs have much better execution than obscure tokens on small exchanges.

Market makers and liquidity providers play a crucial role in reducing slippage. More liquidity provision tightens spreads and reduces slippage for all traders. This creates a positive feedback loop—better liquidity attracts more traders, generating more fees, attracting more liquidity providers.

## Slippage in Limit Orders

Limit orders eliminate slippage by specifying your exact execution price. The order only fills at your limit price or better. The downside is the order might not fill at all if the market doesn't reach your price. This works well when you're patient but not for urgent trades or when you need guaranteed execution.

DEX aggregators combine limit orders with other strategies to minimize slippage. They split orders across multiple venues, route through intermediate tokens for better paths, and time trades to avoid predictable MEV. These sophisticated techniques can significantly improve execution versus simple swaps.

## Slippage During High Volatility

Market volatility dramatically increases slippage risk. During major news events or cascading liquidations, prices move rapidly. A trade you submitted expecting 0.5% slippage might execute with 5% slippage if prices swung violently in the seconds between submission and execution.

Many traders widen slippage tolerance during volatile periods to ensure transactions execute. The alternative—tight tolerance with frequent failures—can be worse than accepting higher slippage. However, this creates vulnerability to MEV since bots know you'll accept poor execution to get trades through.

## Stablecoin Swaps and Low Slippage

Stablecoin pairs like USDC/USDT/DAI typically have minimal slippage. These assets should trade near 1:1, so large trades cause little price movement. Curve Finance specializes in these low-slippage stable swaps using mathematical formulas optimized for similarly-priced assets.

Even stablecoin pairs experience slippage during stress events. If one stablecoin depegs, arbitrage pressure causes slippage as market makers step back and liquidity dries up. The May 2022 UST depeg saw massive slippage on UST pairs as it fell from $1 to pennies—even small trades experienced devastating slippage.

## Batch Auctions and Uniform Pricing

Alternative DEX designs like CoW Swap use batch auctions to reduce slippage and MEV. Trades collect in batches, then clear at uniform prices that maximize trading volume. This approach eliminates the sequential execution that enables front-running. Coincidence of wants—when batch participants directly trade with each other—provides even better execution.

The downside is delayed execution—trades don't execute immediately but wait for batch intervals. For time-sensitive trades this matters. For users prioritizing best execution over speed, batch auctions often deliver superior results to AMMs, especially for larger trades.

## Impact of Trade Size

Slippage scales nonlinearly with trade size. A $1,000 trade might experience 0.1% slippage while a $100,000 trade sees 5% slippage in the same pool. This nonlinear relationship comes from AMM bonding curves—each marginal trade unit faces worse prices than the previous unit.

Professional traders break large orders into smaller chunks to reduce slippage. Time-weighted average price (TWAP) strategies split orders over time. Dollar-cost averaging naturally provides this slippage reduction as a side effect. The tradeoff is execution time and complexity versus accepting high slippage for immediate execution.

## Reversion and Failed Transactions

When actual slippage exceeds your tolerance, transactions revert, wasting gas fees but protecting you from terrible execution. This happens frequently with tight slippage settings on volatile pairs. While annoying, it's generally better than accepting 10% slippage when you expected 1%.

Failed transactions cost gas but save you from potentially much larger losses. If your $1,000 trade would have executed with $100 slippage, paying $20 in gas for a reverted transaction is a good outcome. Some interfaces help by simulating transactions and warning about likely failures before submission.

## Layer 2 and Alt Chains

Layer 2 networks and alternative chains generally have lower liquidity than Ethereum mainnet, meaning higher slippage for equivalent trade sizes. However, the much lower transaction costs enable strategies like splitting orders that aren't economical on mainnet. The overall user experience might be better despite less liquidity.

Cross-chain MEV is less developed than Ethereum MEV, potentially providing better execution temporarily. As these networks mature and MEV infrastructure develops, this advantage may diminish. Understanding these cross-chain dynamics helps traders choose optimal venues for their trades.

## Slippage in Limit Order Books

Centralized exchanges with order books display all available liquidity at each price level. Traders can see exactly what slippage to expect before placing market orders. This transparency allows better informed trading decisions, though the liquidity might be fake—wash trading and spoofing remain issues on some exchanges.

Decentralized order book exchanges are emerging to combine DEX trustlessness with order book precision. Projects like dYdX and Serum provide limit order books on-chain or through L2 solutions. These might reduce slippage versus AMMs for large trades while maintaining decentralization, though they introduce different trade-offs around liquidity fragmentation.

## Educational Importance

Understanding slippage is crucial for anyone trading on DEXs or using DeFi protocols. New users often don't realize why they received fewer tokens than expected, or they set extremely high slippage tolerance and get exploited. Education around slippage, price impact, and appropriate tolerance settings protects users from costly mistakes.

Interfaces have improved dramatically at explaining slippage, showing price impact estimates and warning about potentially problematic trades. However, many users still don't fully understand what they're seeing. Clear slippage education remains important for broad DeFi adoption.

## Career Applications

Trading professionals must deeply understand slippage to execute efficiently. Quantitative traders develop algorithms minimizing slippage through optimal order routing and timing. DEX protocol designers architect AMMs and mechanisms reducing slippage. Market makers provide liquidity that reduces slippage for all traders.

User experience designers balance protecting users from bad trades while not creating excessive friction. Smart contract developers implement slippage protection in protocols that make trades on users' behalf. Understanding slippage mechanics and mitigation strategies matters across many blockchain trading roles, from protocol development to market making to user education and customer support.
