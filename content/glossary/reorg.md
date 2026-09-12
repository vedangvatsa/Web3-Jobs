---
term: Chain Reorganization
slug: chain-reorganization
category: blockchain-fundamentals
difficulty: Intermediate
image: 'https://images.unsplash.com/photo-1599321753519-a4b4f0cf3947?w=1200&q=80'
description: >-
  An event where a blockchain replaces a sequence of recent blocks with a
  different chain, altering transaction history and potentially reversing recent
  transactions.
relatedTerms:
  - finality
  - consensus
  - proof-of-work
  - fork
synonyms:
  - reorg
  - chain reorg
  - block reorganization
lastUpdated: 2026-09-04
---

## Definition

A chain reorganization, usually called a reorg, happens when a blockchain changes which recent blocks it treats as canonical. A node stops following one branch of recent history and follows another valid branch that consensus ranks higher. Transactions contained only in the discarded blocks are no longer confirmed by that chain branch.

Reorgs are a normal result of distributed consensus. Nodes receive blocks at different times. Two valid blocks can be produced from the same parent before either one reaches the whole network. The chain eventually converges on one branch according to its consensus rules. Proof-of-stake chains use their own fork-choice and finality rules.


## How It Works

Suppose two miners find different blocks at the same height. Some nodes receive block A first and build on it. Other nodes receive block B first and build on that. For a short time, both branches are valid from the perspective of different parts of the network.

If the next valid block extends A's branch, nodes that had followed B switch to the A branch when the consensus fork-choice rule prefers it. Block B becomes non-canonical. Its transactions are removed from the node's canonical chain view. Transactions that remain valid and have not appeared on the winning branch can return to the mempool, where they may be included later. Transactions that conflict with a winning transaction cannot be replayed.

The number of replaced blocks is the reorg depth. A one-block reorg can arise from ordinary propagation delay. A deeper reorg requires a competing branch to catch up or overtake the branch the network had accepted. Deliberate deep reorgs are usually associated with a party controlling enough consensus power or exploiting a serious implementation failure.

## Concrete Example

An exchange credits a customer after seeing a payment in block 800. At nearly the same time, another miner publishes a different block 800 that does not contain that payment. The exchange's node saw the first block and displays one confirmation.

Two more blocks are then built on the second version of block 800. The network's fork choice selects that longer or heavier branch. The exchange node performs a one-block reorg: it removes the original block 800 from its canonical history and adopts the competing block 800 plus its descendants.

The customer's payment is no longer confirmed. If it does not conflict with another transaction and its fee is sufficient, nodes may keep it in their mempools and it might appear in a later block. Until that happens, the exchange should not treat the deposit as settled. If the original payment was part of a deliberate double-spend, the sender may have used the winning branch to spend the same funds elsewhere.

## Limitations and Risks

Confirmation depth reduces risk but does not create an identical guarantee on every chain. A small proof-of-work network can be cheaper to attack than a large one. A chain with low hash rate may be vulnerable to rented or concentrated mining power. Network partitions, client bugs, and validator outages can also produce unexpected reorganizations.

Applications that credit deposits, bridge assets, settle trades, or read contract events can make incorrect decisions if they act on blocks that later disappear. Indexers must be able to roll back data and process the winning branch again. Smart contracts cannot directly undo a finalized execution on their own chain, but contracts or off-chain systems that acted on an event may have a separate exposure.

More confirmations delay deposits, withdrawals, and cross-chain actions. The appropriate delay depends on the chain, transaction value, adversary model, and recovery options. There is no universal safe confirmation count.

## Relevant Distinctions

A reorg is not necessarily a protocol fork. A reorg selects between competing blocks that follow the same rules. A hard fork changes the consensus rules and can permanently split a network if participants do not upgrade together. A soft fork changes rules in a backward-compatible way for some older nodes, but it is also distinct from an ordinary temporary reorg.

An orphaned or stale block is a valid block that lost the fork-choice competition. The label does not mean its miner was dishonest. A mempool transaction is only pending. A confirmed transaction is in the current canonical chain, but it can still be reorged before finality. Finality is the point at which the protocol makes reversal prohibitively costly or subject to severe penalties. Its exact meaning differs between probabilistic and proof-of-stake systems.
