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

Proposer-Builder Separation is a blockchain architecture design that divides block production into two distinct roles, where specialized builders compete to assemble optimized blocks and validators simply propose the winning block without needing to understand transaction ordering strategies. This separation addresses maximum extractable value centralization concerns by preventing validators from directly manipulating transaction sequences for profit while enabling a competitive marketplace for block construction. Ethereum implemented this concept through MEV-Boost, developed by Flashbots. The architecture creates a sealed-bid auction system where builders submit complete blocks with bids, and proposers select the highest-paying option without seeing internal transaction details, ensuring fair ordering and reducing harmful MEV extraction like sandwich attacks. Professionals who understand PBS mechanics find opportunities in protocol engineering, MEV research, and blockchain infrastructure roles as networks increasingly adopt builder-proposer market designs.

## PBS Mechanics

How it works:

- **Builders**: Collect transactions, construct blocks, optimize for value.

- **Relays**: Relays receive blocks from builders, filter invalid blocks.

- **Proposers**: Validators choose the best block from relay (highest bid).

- **Bids**: Builders bid to proposers for block inclusion rights.

- **Separation**: Proposers don't build; builders don't propose.

PBS creates specialized roles in block production.

## Why PBS Matters

Benefits:

- **MEV Mitigation**: Validators can't directly extract MEV by reordering.

- **Fairness**: Users get more predictable execution.

- **Specialization**: Builders focus on optimal block construction.

- **Competition**: Competition among builders reduces monopoly power.

PBS reduces centralization in MEV capture.

## MEV-Boost

Current implementation:

- **Out-of-Protocol**: MEV-Boost is a middleware for Ethereum.

- **Builders and Relays**: Builders submit blocks to relays, validators choose.

- **Revenue**: Validators earn higher rewards via builder bids.

- **Centralization Risk**: Relays can become centralized choke points.

MEV-Boost is an early PBS implementation.

## PBS Risks

Challenges:

- **Relay Centralization**: Relays can censor or collude.

- **Builder Censorship**: Builders can censor transactions.

- **Latency**: Additional steps can increase latency.

- **Complexity**: More moving parts increase attack surface.

PBS adds complexity and new trust assumptions.

## In-Protocol PBS

Future design:

- **Enshrined PBS**: PBS built into protocol (not external).

- **Censorship Resistance**: Protocol enforces fairness and availability.

- **Security Guarantees**: Stronger guarantees than off-chain relays.

- **Economic Alignment**: Better alignment between proposers and builders.

In-protocol PBS is a long-term goal.

## Career Opportunities

PBS ecosystem roles:

- **Protocol Engineers**.

- **MEV Researchers**.

- **Block Builder Engineers**.

- **Relay Operators**.

## Best Practices

Working with PBS:

- **Monitor Relays**: Track relay reliability and censorship.

- **Diversify Builders**: Avoid reliance on a single builder.

- **Audit MEV Tools**: Ensure MEV infrastructure is secure.

## The Future of PBS

Trends:

- **Enshrined PBS**: Protocol-native PBS deployment.

- **Decentralized Relays**: More decentralized relay networks.

- **Better Fairness**: Reduced censorship and MEV.

## Separate Building From Proposing

PBS is a key MEV mitigation strategy and core scaling component for Ethereum. It reshapes block production economics. If you're interested in MEV or protocol design, explore [protocol careers](/) at infrastructure teams.
