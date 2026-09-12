---
term: Preconfirmation
slug: preconfirmation
category: technical
difficulty: Advanced
image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80'
description: >-
  A commitment from validators or sequencers to include a transaction in an
  upcoming block, providing fast certainty before final confirmation.
relatedTerms:
  - sequencer
  - mev
  - rollup
  - confirmation
synonyms:
  - preconf
  - early commitment
  - soft confirmation
lastUpdated: 2026-09-04
---

Preconfirmation is a signed promise that a transaction will be included, often in a particular position, in an upcoming block. It gives a user a fast signal before the normal blockchain confirmation and finality process completes. The promise can come from a rollup sequencer, a validator expected to propose a block, or a specialized group acting for future proposers.

The exact promise matters. A preconfirmation may only say that a transaction has been received. A stronger one may commit to inclusion before a deadline, a fixed ordering relative to other transactions, a maximum execution price, or a particular block slot. It is not finality by itself. The chain's consensus rules still decide which block becomes canonical and when it cannot reasonably be reverted.

## How it works

A user sends a transaction to a preconfirmation provider instead of waiting only for the public mempool and block production. The provider checks that the transaction is valid enough to include. It may simulate the transaction, require an adequate fee, and reserve a place in its local order. It then returns a signed receipt describing its commitment.

For a centralized rollup sequencer, the receipt may be a signature from the sequencer's key. The sequencer later builds a batch containing the transaction and posts it to the rollup or its layer 1 settlement contract. Some designs use a committee of providers.

On a proof-of-stake layer 1, a validator could preconfirm a transaction for a slot it expects to propose. The validator has an economic stake that can be penalized if a protocol makes the commitment enforceable and it breaks the terms. Systems can also coordinate commitments across a sequence of upcoming proposers. These designs need a clear way to prove a violation and to apply a penalty. Without that enforcement, a signature is mostly a reputation-based promise.

The receipt can be useful immediately. A trading interface can show that an order has a reserved place. A game can accept an action while it waits for settlement. A payment receiver can decide whether the receipt is sufficient for a low-value service.

## Concrete example

Mina submits a swap to a rollup sequencer at 12:00:00. The sequencer simulates it against the current state and returns a signed receipt within a second. The receipt says that Mina's transaction will appear before a stated deadline and after a specified sequence number. Mina's wallet displays "preconfirmed" rather than "finalized."

At 12:00:02, the sequencer includes the transaction in its next batch. The swap result becomes visible on the rollup. Later, the batch is posted to Ethereum and passes the rollup's normal proof or challenge process. At that later point, the transaction has the finality guarantees of the settlement chain.

If the sequencer does not include Mina's transaction by the deadline, the outcome depends on the design. The receipt may entitle Mina to compensation from a bonded provider, provide evidence for slashing, or merely show that the sequencer broke a service promise. It does not make Ethereum include the transaction automatically.

## Limitations and risks

Preconfirmations add a trust and availability dependency before finality. A provider can go offline, censor a transaction, produce conflicting receipts, or fail to win the expected right to build a block. A signed receipt cannot overcome a chain reorganization, validator outage, invalid transaction, or a state change that makes the transaction fail before inclusion.

Economic penalties only work if violations are objectively detectable, funds are sufficiently bonded, and the slash or compensation process is reliable. A penalty may be smaller than the benefit of breaking a promise during volatile markets. Users also need to know whether they can submit a receipt as evidence and whether the enforcement system is on-chain or contractual.

Preconfirming order can affect MEV. It may reduce uncertainty for the recipient, but it can also concentrate order flow in one provider. A provider may still reorder transactions within its permitted rules, sell order flow, or favor selected users.

## Relevant distinctions

Preconfirmation is different from mempool acceptance. A node accepting a transaction only means it may relay it. It has not promised inclusion. It is also different from a block confirmation, which means a block containing the transaction has been accepted by the chain.

It differs from finality. Finality is the point at which the consensus protocol treats a block as irreversible or extremely costly to reverse. A preconfirmation can arrive much sooner, but its guarantee is limited by the signer and its enforcement mechanism.

A rollup's soft confirmation is often similar to a preconfirmation, but terminology varies. A soft confirmation may simply report a sequencer's current ordering decision. A preconfirmation should specify a signed commitment and the consequences if the signer does not honor it.
