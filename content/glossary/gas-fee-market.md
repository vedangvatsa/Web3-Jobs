---
term: Gas Fee Market
slug: gas-fee-market
category: technical
difficulty: Intermediate
image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80'
description: >-
  The dynamic marketplace where users bid for block space by offering gas fees,
  with prices fluctuating based on network demand and capacity.
relatedTerms:
  - gas
  - ethereum
  - fee
  - blockspace
synonyms:
  - fee market
  - blockspace market
  - transaction fees
lastUpdated: 2026-09-04
---

## Definition

A gas fee market is the process by which a blockchain prices access to its limited block space. Users attach fees to transactions. Validators, sequencers, or block builders use those fees, along with other rules, when deciding which transactions to include. When more transactions compete for the same capacity, the cost of prompt inclusion usually rises.

Gas measures computation and storage work, not a fixed currency amount. The total fee is generally gas used multiplied by its price. A transaction's gas limit caps the work it may consume.

## How It Works

On Ethereum, each block has a target amount of gas and can expand up to a defined maximum. The protocol sets a base fee per unit of gas. If recent blocks are above the target, the base fee rises in the next block. If they are below the target, it falls. This adjustment does not guarantee a particular inclusion time, but it makes the required base fee visible before a user sends a transaction.

A user normally specifies `maxFeePerGas` and `maxPriorityFeePerGas`. The transaction can be included only when its maximum fee covers the current base fee. Its effective price is the base fee plus a priority fee, limited by the user's maximum. The base-fee portion is burned. The priority fee, commonly called a tip, goes to the block proposer through the block's payment rules.

Builders and proposers may also consider direct payments from private bundles. Public gas prices are not a complete view of block-space competition.

## Concrete Example

Assume Ethereum's current base fee is 30 gwei. Maya sends a swap that uses 120,000 gas. She sets a maximum fee of 40 gwei and a maximum priority fee of 3 gwei. The effective price is 33 gwei because the base fee plus the available tip is 30 plus 3, which is below her maximum.

Her maximum possible charge is 120,000 times 40 gwei, but that is not what she pays in this case. Her actual fee is 120,000 times 33 gwei, or 0.00396 ETH. Of that, 0.0036 ETH corresponding to the base fee is burned, and 0.00036 ETH is the priority fee. If the base fee rises above 40 gwei before inclusion, the transaction cannot be included until the fee falls or Maya replaces it with a higher limit.

During a market move, many liquidators and traders may submit higher-paying transactions. Maya's 3 gwei tip may then be less attractive, so her transaction can remain pending even though it is technically valid.

## Limitations and Risks

Fee estimates are estimates. Network demand can change quickly, especially during volatile markets, token launches, or liquidation cascades. A low fee may leave a transaction pending. A high maximum fee can expose a user to a higher actual price if the base fee moves within that limit, although unused headroom is not charged.

The fee is paid even if a contract call reverts after consuming gas. This can happen because a trade's price condition changes, a nonce is wrong, or contract logic rejects the call. Gas limits also matter. Too low a limit causes out-of-gas failure. An excessively high limit does not by itself charge more, but a wallet must still reserve enough balance for the maximum possible fee.

Public fee bidding can encourage priority gas auctions, where automated actors repeatedly replace transactions with higher fees. This can increase congestion and make simple user transactions expensive. Private order flow can avoid some public bidding but adds trust and censorship concerns.

## Relevant Distinctions

Gas price is the price per unit of work. Gas limit is the maximum amount of work a transaction may use. The transaction fee is their relevant product, based on actual gas used. A fee market prices inclusion and execution resources. It does not set the token price or guarantee that a transaction will produce a favorable trading result.

An Ethereum layer 2 also has fees, but its total cost often has two parts: execution on the layer 2 and the cost of publishing data or proofs to the layer 1. A lower layer-2 execution fee does not mean all fees are fixed or that congestion cannot occur. Some rollups use a centralized sequencer today, which makes their ordering and fee policies different from Ethereum's validator-driven block production.
