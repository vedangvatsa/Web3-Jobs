---
term: Sandwich Attack
slug: sandwich-attack
category: security
difficulty: Intermediate
image: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1200&q=80'
description: >-
  An MEV exploit where an attacker observes pending transactions and
  strategically places their own transactions before and after to profit from
  price movements.
relatedTerms:
  - mev
  - front-running
  - mempool
  - security
synonyms:
  - frontrun-backrun
  - MEV attack
  - transaction ordering
lastUpdated: 2026-09-04
---

## Definition

A sandwich attack is a form of maximal extractable value, or MEV, in which a trader places one transaction before and another after a target trade. The first transaction moves a market price in a direction that makes the target execute at a worse rate. The second reverses the attacker's position after the target has moved the price further. The target trade is the filling between the attacker's two trades.

The attack commonly affects swaps against automated market maker pools. These pools set prices from their token reserves. A pending swap that is large relative to a pool can change the reserve ratio and price. If an attacker can see the swap before it is included and can influence ordering, the attacker can trade around it for profit.

The user's transaction can be valid and still receive a worse execution price because of how other transactions are placed around it.

## How It Works

On a public mempool, a submitted transaction is visible before a validator includes it in a block. Specialized searchers monitor those pending transactions for swaps with enough expected price impact. They estimate the user's slippage limit, gas cost, liquidity, and the profit from trading first.

For a user buying token A with token B, the attacker may first buy token A from the same pool. This raises A's price. The attacker sends a sufficiently competitive transaction or submits a bundle to a block builder so this purchase is ordered before the user's swap. The user's transaction then executes at the higher price, as long as it remains within the user's slippage tolerance.

The attacker next sells the acquired token A after the user's swap. The user's purchase has pushed A's price still higher, allowing the attacker to receive more token B than was spent in the first trade. The attack is profitable only if the difference exceeds swap fees, gas, builder payments, and the risk of the target transaction failing. If the user's trade reverts, a well-designed bundle generally makes the attacker's surrounding trades revert too.

## Concrete Example

Assume a pool starts with 100 ETH and 200,000 USDC, ignoring fees. Its constant-product value is 20,000,000. A user submits a transaction to spend 20,000 USDC for ETH, with a loose slippage limit.

An attacker first spends 10,000 USDC. The pool then holds 210,000 USDC and about 95.238 ETH. The attacker receives about 4.762 ETH. The user's 20,000 USDC swap follows. The pool reaches 230,000 USDC and about 86.957 ETH, so the user receives about 8.281 ETH.

The attacker then sells the 4.762 ETH back into the pool. This returns the pool to roughly 91.719 ETH and pays the attacker about 11,010 USDC. Before fees and transaction costs, the attacker gained about 1,010 USDC over the 10,000 USDC first trade. The user received less ETH than they would have received without the first attacker trade. Actual results vary with pool fees, rounding, order routing, and the user's slippage limit.

## Limitations And Risks

Attackers face execution risk. Another searcher can outbid them, the target can be replaced or canceled, or the user's slippage limit can cause the target swap to revert. Pool fees and block-building costs can erase the apparent profit.

For users, setting a high slippage tolerance creates room for a larger adverse price move. A low tolerance can reduce the maximum loss but may cause the swap to fail in a volatile market. Large trades against shallow pools are more exposed because they have greater price impact. Routing through several pools can reduce price impact but can also create more complex opportunities for searchers.

Private transaction submission can reduce public mempool exposure, but it shifts trust to the relay, wallet, builder, or provider handling the order. A private route may still leak, censor, delay, or reorder transactions. No single measure guarantees a favorable execution price.

## Relevant Distinctions

A sandwich attack includes both a front-run and a back-run around one target transaction. Front-running by itself means acting before known order flow. Back-running means acting after an event, often to capture an arbitrage opportunity. Not all MEV is a sandwich attack. Liquidations, ordinary arbitrage, and some block rewards can be MEV without directly worsening a particular user's swap.

Sandwiching also differs from ordinary slippage. Slippage is the difference between an expected price and execution price, often caused by a trade's own size, market movement, or fees. A sandwich intentionally adds a price move around the trade to capture value. Price impact is the mechanical effect that a trade has on a pool price. In a sandwich, the attacker uses both its own price impact and the target's price impact. A failed transaction does not necessarily mean a sandwich occurred; it can fail for many unrelated reasons.
