---
term: Time-Weighted Average Price
slug: time-weighted-average-price
category: trading
difficulty: Intermediate
image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80'
description: >-
  An execution strategy that spreads large trades over time to reduce price
  impact, calculating the average price weighted by time intervals.
relatedTerms:
  - price-impact
  - slippage
  - order-book
  - trading
synonyms:
  - TWAP
  - time-weighted execution
  - time-sliced execution
lastUpdated: 2026-09-04
---

Time-weighted average price, or TWAP, is an average price measured across a stated time period. The same term is used in two related ways. A trader can use a TWAP execution strategy to split a large order into scheduled smaller orders. A protocol can use a TWAP oracle to report an average market price over a recent interval. In both cases, time, rather than traded volume, determines the weighting.

A single market price can change sharply for a few seconds. Using an average can make an execution schedule less concentrated in one moment and make an oracle less sensitive to a brief price move. It does not make a trade free of price impact or make a price feed impossible to manipulate.

## How it works

For order execution, a trader chooses a total size and a duration. A request to buy 100 ETH over ten hours can be split into ten 10 ETH orders, one each hour. A simple schedule uses equal sizes at equal intervals. The realized execution TWAP is the average of the prices paid during the chosen intervals.

The schedule avoids putting the entire order into an order book or liquidity pool at once. A large immediate buy can consume the lowest sell offers and push the marginal price upward. Small slices give liquidity time to refill. The strategy still takes the available price at each scheduled point.

For an oracle, the protocol records prices or cumulative price values over time. Uniswap v3 pools, for example, maintain cumulative tick observations. A contract can compare observations from two timestamps. The cumulative difference divided by elapsed time gives an average tick over that window, which can be converted to a price. The pool need not write a separate price record every second for each consumer.

The selected window is part of the oracle's security and responsiveness. A 30-minute TWAP is less affected by a one-block move than a spot price. It is also slower to reflect a genuine market change. A protocol should understand the pool's liquidity, its observation history, and how often required observations can be read.

## Concrete example

A DAO wants to exchange 1,000,000 USDC for ETH. Its treasury system chooses a four-hour execution window with 24 slices. Every ten minutes it submits an order for roughly 41,667 USDC, subject to a maximum acceptable price. At the start, ETH is 2,000 USDC. Some slices execute near 2,005 and later slices execute near 1,995. The DAO's final average may be close to 2,000 even though no individual trade received exactly that price.

Separately, a lending protocol uses a 30-minute ETH/USDC TWAP from a deep liquidity pool for collateral valuation. An attacker uses borrowed capital to push the pool price up for one block. The current spot price changes sharply, but the 30-minute average moves only slightly because the manipulated price existed for very little of the window. If the attacker can maintain the distortion for a large part of the interval, the TWAP can still be materially affected.

## Limitations and risks

Execution TWAP assumes that time is a useful proxy for available liquidity. It can perform poorly when volume is concentrated at particular times, when news changes the market, or when liquidity disappears. A rising market means later buy slices may cost more. A falling market means later sell slices may receive less. A limit price can reduce this exposure, but it can leave part of the order unfilled.

Predictable schedules are visible. Other traders may trade ahead of known slices or change liquidity around them. Fees and repeated pool swaps can outweigh reduced impact for a small order. On a decentralized exchange, each slice can be exposed to sandwich attacks.

An oracle TWAP is only as reliable as its source market. A shallow pool can be manipulated over time. A long window reduces sensitivity to short attacks but makes the feed stale during a real move. A short window responds quickly but needs more liquidity to resist manipulation. Missing or sparse pool observations, incorrect decimal handling, and selecting the wrong price direction can also produce wrong values.

## Relevant distinctions

TWAP differs from VWAP, or volume-weighted average price. VWAP gives more weight to intervals with more trading volume. A VWAP execution strategy often tries to match the market's expected volume pattern. TWAP uses a time schedule and does not require a volume forecast.

TWAP is not a guaranteed execution price. It describes a schedule or measured average. The actual result depends on fills, fees, liquidity, and market movement.

An on-chain TWAP is not automatically a safe oracle. It is a price statistic from a defined market and window. A protocol may combine it with other sources, liquidity checks, and circuit breakers, but those measures address separate risks.
