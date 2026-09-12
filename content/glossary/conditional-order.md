---
term: Conditional Order
slug: conditional-order
category: trading
difficulty: Intermediate
image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80'
description: >-
  A trading order that only executes when specified conditions are met, enabling
  automated trading strategies based on price, time, or other market conditions.
relatedTerms:
  - order-book
  - dex
  - trading
  - limit-order
synonyms:
  - stop order
  - triggered order
  - conditional trade
lastUpdated: 2026-09-04
---

A conditional order is an instruction to trade or perform another market action only after stated conditions are met. The condition may be a price, a time, an account balance, or data supplied by an oracle. A stop-loss order and a take-profit order are common forms. The order does not promise an exact execution price. It defines when an attempt to trade should begin and, if applicable, the limits that trade must follow.

## How It Works

The user specifies the asset, trade direction, size, trigger, and execution rules. A sell stop, for example, may say: when the reference price is at or below $2,000, attempt to sell 1 ETH. The order system monitors the reference price. Once the trigger condition becomes true, it sends a market order, a limit order, or a swap transaction according to the user's instructions.

Centralized exchanges can hold the order and watch their own order book internally. On a blockchain, a smart contract cannot wake itself up when a price changes. A separate actor must submit a transaction. This actor may be a keeper network, a protocol-operated bot, or a solver competing to fill the order. The contract checks the condition and execution limits before it accepts the action. The actor is normally paid from a fee set aside by the user or by the protocol.

Many on-chain conditions rely on an oracle. An oracle reports a price from one or more markets to a contract. The reported price may update at intervals, have a confidence threshold, or use a time-weighted method. Other designs use the price in a particular liquidity pool. The chosen source is part of the order definition. "ETH below $2,000" is incomplete unless it identifies which price and when it is measured.

## Concrete Example

A trader holds 5 ETH and wants to limit a loss without watching the market. They create a conditional order that triggers when an ETH/USD oracle reports $2,000 or less. The order directs a keeper to swap 5 ETH for USDC through a decentralized exchange, but only if the swap returns at least 9,850 USDC after fees. That minimum-output rule is the order's slippage limit.

If the oracle reaches $2,000, a keeper submits the transaction. The smart contract checks the current oracle value and calls the swap. If available liquidity supports the minimum output, the swap completes. If the market falls quickly and the available output is below 9,850 USDC, the transaction reverts. The trigger occurred, but the order did not fill. The trader may need to revise the limit or accept a different result.

## Limitations And Risks

Price triggers can be late or inaccurate. An oracle may update after the market has already moved, or it may be disrupted by an outage. A pool-price trigger can be manipulated briefly by a large trade, especially in a shallow pool. Oracle protections reduce these risks but add delay or may prevent execution during unusual conditions.

Execution has latency. A keeper must notice the condition, submit a transaction, and have it included in a block. Network congestion, insufficient gas incentives, or keeper downtime can delay or prevent the trade. Public pending transactions can also be observed by other traders. They may trade before the order, changing the price the order receives.

Market orders face slippage. A sell stop can execute far below its trigger during a rapid decline because the trigger price is not a guaranteed sale price. A limit order protects the minimum price but may remain unfilled. Fees can also make small or frequent conditional orders uneconomic, especially when each execution requires an on-chain transaction.

Complex conditions increase both flexibility and failure modes. Conditions based on several assets, external data, or technical indicators require clear definitions and reliable data feeds. A condition that cannot be evaluated on-chain must be evaluated by a trusted off-chain service, which adds a trust assumption.

## Relevant Distinctions

A stop order has a trigger. Once triggered, it commonly becomes a market or limit order. A limit order has an acceptable price but does not necessarily have a separate trigger. A take-profit order is usually a conditional sell or buy intended to close a position at a favorable price. These names describe common trading uses, not identical behavior across platforms.

Conditional orders also differ from recurring orders. A recurring purchase might run every week whether or not a price condition is met. An intent is broader: it states a desired outcome, such as exchanging one asset for another above a minimum amount. A solver may choose the execution path. A conditional order can be expressed as an intent, but its trigger and fill rules must still be defined.
