---
term: Block Builder
slug: block-builder
category: technical
difficulty: Advanced
image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80'
description: >-
  A specialized entity that constructs optimized blocks by ordering and bundling
  transactions, bidding to have their blocks proposed by validators.
relatedTerms:
  - mev
  - proposer-builder-separation
  - sequencer
  - flashbots
synonyms:
  - builder
  - block constructor
  - MEV builder
lastUpdated: 2026-09-04
---

## Definition

A block builder is a service that assembles a candidate block for a blockchain. It chooses which transactions to include, their order, and sometimes extra transactions that capture maximum extractable value (MEV). In systems with proposer-builder separation, the validator selected to propose a block can choose a builder's block instead of constructing one itself.

Builders compete to make their blocks worth more than other candidates. Value can come from ordinary user fees, arbitrage between exchanges, liquidations in lending markets, or payments from users who want private or reliable execution. The builder normally offers part of that value to the proposer as a bid. The proposer receives the bid if it publishes the builder's valid block.


## How It Works

A builder receives transactions from several places. These can include the public mempool, private transaction endpoints, searchers that submit MEV bundles, and direct agreements with wallets or applications. A bundle is a set of transactions that must be included in a stated order, often only if every transaction succeeds.

The builder simulates candidate blocks against the current chain state. It estimates gas use, transaction fees, bundle payments, and the value of any MEV strategy. It then selects an ordering that fits within the block limits and produces the highest expected value. A valid block also needs the correct parent, state transition, and consensus fields.

In the common Ethereum relay flow, a builder sends a bid and a blinded block header to a relay. The relay checks the submission and makes the bid available to proposers. A validator running MEV-Boost compares bids from its configured relays and signs the header it chooses. Only after that commitment does the relay release the full execution payload. This sequence is intended to stop the proposer from seeing and copying the block contents before choosing it.


## Concrete Example

Suppose a builder sees a public swap that will move the price of ETH on a decentralized exchange. A searcher sends the builder a bundle containing an arbitrage trade that can run after the swap. The bundle promises to pay 0.08 ETH if the trade executes in that position.

The builder tests the bundle with ordinary transactions. Its candidate block earns 0.12 ETH from tips and bundle payments. After allowing for the expected proposer payment, it submits a bid of 0.10 ETH. Another builder submits a valid block worth 0.09 ETH to the proposer. If the proposer selects the first bid and the block lands on chain, the proposer receives 0.10 ETH and the builder retains the remaining value, subject to its own costs and agreements.

If a different transaction changes the market before the block is finalized, the arbitrage may no longer work. The builder must then create a new candidate and bid again for the next slot.

## Limitations and Risks

Builders can see sensitive order flow. A private transaction sent to one builder or its partners may reveal a planned trade before it is public. Private routing can reduce some forms of frontrunning, but it replaces public visibility with trust in the receiving parties and their policies.

Builder markets can concentrate. Firms with low-latency infrastructure, strong searcher relationships, or exclusive order flow can produce higher bids more often. A small set of dominant builders could delay or exclude transactions, especially when proposers depend on the same relays.

Builders can also include harmful MEV strategies, such as sandwich attacks, if their policies and the surrounding market allow them. Separation does not remove MEV. Relay outages, invalid payloads, and late delivery can cause a missed slot or local fallback.

## Relevant Distinctions

A block builder constructs a candidate block. A proposer is the validator selected by consensus to publish a block. A relay is an intermediary used in some out-of-protocol PBS designs. It carries bids and, depending on the design, checks or stores payloads. A searcher finds a specific MEV opportunity and often sends it to one or more builders. One firm can perform more than one of these roles.

Building is also different from mining. In proof-of-work systems, a miner historically assembled a block and competed to find its proof of work. In proof-of-stake PBS systems, the consensus proposer and the block constructor can be separate parties. A sequencer on a rollup has a related ordering role, but it produces rollup batches rather than an Ethereum validator block.
