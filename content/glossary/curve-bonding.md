---
term: Curve Bonding
slug: curve-bonding
category: defi
difficulty: Advanced
image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80'
description: >-
  A DeFi mechanism where tokens are minted and burned along a mathematical
  curve, enabling continuous price discovery and automatic market making without
  liquidity pools.
relatedTerms:
  - bonding-curve
  - amm
  - token-pricing
  - defi
synonyms:
  - bonding-curve
  - automated token pricing
  - curve pricing
lastUpdated: 2026-09-04
---

## Definition

Curve bonding, more commonly called a bonding curve, is a token pricing mechanism implemented by a smart contract. The contract mints tokens when users buy and burns tokens when users sell. Its price is determined by a mathematical function of token supply, reserve balance, or both, rather than by matching individual buy and sell orders in an order book.

The contract holds reserve assets, such as ETH or a stablecoin. A buyer pays reserve assets into the contract and receives newly minted tokens. A seller returns tokens to the contract, which burns them and pays out reserve assets according to the curve.


## How It Works

Let `P(s)` be the marginal price of the next token when the supply is `s`. For a linear curve, `P(s) = a + bs`, where `a` is the starting price and `b` controls how quickly price rises. The cost to buy a range of tokens is the area under the curve between the starting and ending supply, not simply the final marginal price multiplied by every token.

When a buyer adds reserve assets, the contract calculates how many tokens the payment buys under the curve. Supply rises and the marginal price usually rises with it. When a seller burns tokens, the contract calculates the reserve payout over the same supply interval in reverse. A curve can be linear, quadratic, exponential, or use a custom formula with limits.

Fees or different buy and sell curves create a spread. A symmetric curve without fees has price impact for large orders, but no separate spread.

## Concrete Example

Consider a simple linear curve where the first token costs 1 DAI and each additional token raises the marginal price by 0.01 DAI. At a supply of 100 tokens, the next token costs 2 DAI. A buyer who wants 10 new tokens pays the sum of prices from supply 100 through 109, which is about 20.45 DAI before fees. The supply becomes 110, and the next token is priced near 2.10 DAI.

If the buyer immediately sells the same 10 tokens back to a symmetric curve with no fees and no other trades, the contract returns about 20.45 DAI. If the contract charges a 2 percent fee on each trade, the buyer receives less on the sale. If other users buy first, the seller may receive more because the sale starts at a higher supply. If other users sell first, the payout may be lower.

The reserve balance is important. In this simplified design, the contract must retain enough DAI to honor sales permitted by its formula. A curve can define an issuance schedule, but it cannot create reserve assets from nothing.

## Limitations and Risks

A bonding curve sets an internal contract price. It does not prove that the token has economic value outside the contract. If demand disappears, sellers can drive the price down and drain much of the available reserve. Early buyers may profit from later demand, while later buyers can bear sharp losses when demand reverses.

Large trades experience price impact. A steep curve can make a modest purchase expensive and make a sale return much less than the displayed marginal price. Fees, a buy-sell spread, and limits on redemption can add further losses. If the reserve asset itself loses value, holders are exposed to that loss as well.

Smart-contract bugs, incorrect curve math, rounding errors, and reentrancy flaws can put the reserve at risk. A poorly chosen curve can also create incentives for bots to buy before expected users and sell after them. Public pending transactions make this type of frontrunning possible unless the trading design addresses it.

## Relevant Distinctions

A bonding curve is related to an automated market maker (AMM), but the models differ. A constant-product AMM prices trades from the ratio of two existing token reserves and normally relies on liquidity providers. A bonding curve can mint and burn its own token against a reserve contract. Both can have slippage, but their inventory and redemption rules are different.

A bonding curve is also different from a fixed-price sale. A fixed-price sale gives every buyer the same stated price until its allocation ends. A curve changes the marginal price as supply changes. It is different from a traditional order book because no separate buyer and seller need to meet at a quoted price. The contract is the standing counterparty, subject to its reserve and code.
