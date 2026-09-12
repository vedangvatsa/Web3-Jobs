---
term: Proposer-Builder Separation
slug: proposer-builder-separation
category: technical
difficulty: Advanced
image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80'
description: >-
  A blockchain architecture that separates block proposing from block building
  to mitigate MEV, improve fairness, and enable specialized block builders.
relatedTerms:
  - mev
  - sequencer
  - validator
  - block-production
synonyms:
  - PBS
  - block builder separation
  - builder-proposer split
lastUpdated: 2026-09-04
---

## Definition

Proposer-builder separation, or PBS, divides block production into two roles. A builder assembles the transactions and execution payload for a candidate block. A proposer is the validator selected by consensus to publish a block for that slot. Instead of building its own block, the proposer can select a bid from a builder.

The arrangement exists because constructing a high-value block has become specialized work. Builders can combine transactions, private order flow, and maximum extractable value (MEV) bundles faster than many individual validators. PBS lets proposers receive a share of that value without operating their own sophisticated trading and ordering systems.

PBS does not make transaction ordering fair by itself. Its effects depend on the participants, rules, and alternatives available to users.

## How It Works

Builders gather public mempool transactions and private submissions. They simulate combinations of those transactions, check that the resulting block is valid, and calculate a payment they can offer to the proposer. The payment may come from transaction tips, bundle payments, arbitrage, liquidations, or other MEV.

In a common Ethereum setup using MEV-Boost, builders submit signed bid data and a blinded block header to relays. A relay distributes the available bids to validators. The proposer compares bids from its configured relays and signs the header for one candidate. After the proposer has committed to that header, the relay releases the full block payload for publication.

Blinding means the proposer sees the bid and block header information needed to make a selection, but not the complete transaction contents before it commits. This is intended to prevent a proposer from copying a profitable transaction ordering into its own block. The published block is still validated by Ethereum nodes. A relay cannot make an invalid block valid.

MEV-Boost is an out-of-protocol implementation. Ethereum selects the proposer but does not require relay use or a particular builder.

## Concrete Example

For one Ethereum slot, three builders submit bids through a relay. Builder A offers 0.18 ETH, Builder B offers 0.21 ETH, and Builder C offers 0.20 ETH. Each bid represents the value the builder will transfer to the proposer if its payload is used.

The assigned validator receives the bid headers and chooses Builder B's 0.21 ETH option. It signs the blinded header. The relay then returns Builder B's full payload, including ordinary user transactions and a bundle that captures an arbitrage opportunity. The validator publishes the block, and other nodes verify its transactions and state transition. If it is valid and becomes canonical, the proposer receives the promised value.

If the relay fails to deliver the payload in time, the validator can miss the slot or use a fallback path if it has one. If the block is invalid, the network rejects it, and the promised payment does not turn an invalid state transition into an accepted block.

## Limitations and Risks

PBS can create new points of concentration. Builders with private order flow, fast infrastructure, and strong searcher relationships may win a large share of blocks. Relays can become gatekeepers if validators rely on only a few of them. Either role can apply censorship policies or experience outages.

The extra communication steps are time-sensitive. A bid, signature, and payload must arrive within a short slot window. Delays can reduce block quality or cause missed proposals. The system also adds operational complexity, including relay trust choices, software configuration, monitoring, and fallback behavior.

PBS redistributes MEV but does not eliminate it. Builders may include sandwich attacks or other extraction strategies where profitable and permitted. Users whose trades are exploited may not benefit.

## Relevant Distinctions

PBS is not the same as a block builder. PBS is the division of roles and the protocol or middleware arrangement that supports it. A builder makes candidate blocks. A proposer publishes one. A relay is a common intermediary in current out-of-protocol PBS systems. A searcher discovers a specific MEV opportunity and generally submits it to builders.

Out-of-protocol PBS relies on software such as MEV-Boost and on relay services. Enshrined PBS refers to a design where these responsibilities and guarantees are built into the protocol's consensus rules. The distinction matters because external relays can add trust, availability, and censorship assumptions that a protocol design may address differently.

PBS is also distinct from a sequencer. A sequencer orders transactions for a rollup. It may use builder-like techniques, but its role, settlement process, and security assumptions depend on the rollup rather than Ethereum's validator slots.
