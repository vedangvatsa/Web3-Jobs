---
term: "Proposer-Builder Separation"
slug: "proposer-builder-separation"
category: "technical"
difficulty: "Advanced"
image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80"
description: "A blockchain architecture that separates block proposing from block building to mitigate MEV, improve fairness, and enable specialized block builders."
relatedTerms: ["mev", "sequencer", "validator", "block-production"]
synonyms: ["PBS", "block builder separation", "builder-proposer split"]
---

**Proposer-Builder Separation (PBS)** splits block production into two roles: builders and proposers. Builders assemble blocks (ordering transactions), while proposers choose among built blocks. This separation reduces MEV extraction by validators and encourages competition among builders. Ethereum’s roadmap includes PBS to mitigate MEV centralization. Flashbots pioneered PBS via MEV-Boost. PBS improves fairness because proposers can’t reorder transactions after selecting a builder’s block. Understanding PBS is important for MEV mitigation and protocol design.

## PBS Mechanics

How it works:

**Builders**: Collect transactions, construct blocks, optimize for value.

**Relays**: Relays receive blocks from builders, filter invalid blocks.

**Proposers**: Validators choose best block from relay (highest bid).

**Bids**: Builders bid to proposers for block inclusion rights.

**Separation**: Proposers don’t build; builders don’t propose.

PBS creates specialized roles in block production.

## Why PBS Matters

Benefits:

**MEV Mitigation**: Validators can’t directly extract MEV by reordering.

**Fairness**: Users get more predictable execution.

**Specialization**: Builders focus on optimal block construction.

**Competition**: Competition among builders reduces monopoly power.

PBS reduces centralization in MEV capture.

## MEV-Boost

Current implementation:

**Out-of-Protocol**: MEV-Boost is a middleware for Ethereum.

**Builders and Relays**: Builders submit blocks to relays, validators choose.

**Revenue**: Validators earn higher rewards via builder bids.

**Centralization Risk**: Relays can become centralized choke points.

MEV-Boost is early PBS implementation.

## PBS Risks

Challenges:

**Relay Centralization**: Relays can censor or collude.

**Builder Censorship**: Builders can censor transactions.

**Latency**: Additional steps can increase latency.

**Complexity**: More moving parts increase attack surface.

PBS adds complexity and new trust assumptions.

## In-Protocol PBS

Future design:

**Enshrined PBS**: PBS built into protocol (not external).

**Censorship Resistance**: Protocol enforces fairness and availability.

**Security Guarantees**: Stronger guarantees than off-chain relays.

**Economic Alignment**: Better alignment between proposers and builders.

In-protocol PBS is long-term goal.

## Career Opportunities

PBS ecosystem roles:

**Protocol Engineers** earn $130,000-$320,000+.

**MEV Researchers** earn $140,000-$340,000+.

**Block Builder Engineers** earn $140,000-$340,000+.

**Relay Operators** earn $100,000-$260,000+.

## Best Practices

Working with PBS:

**Monitor Relays**: Track relay reliability and censorship.

**Diversify Builders**: Avoid reliance on a single builder.

**Audit MEV Tools**: Ensure MEV infrastructure is secure.

## The Future of PBS

Trends:

**Enshrined PBS**: Protocol-native PBS deployment.

**Decentralized Relays**: More decentralized relay networks.

**Better Fairness**: Reduced censorship and MEV.

## Separate Building From Proposing

PBS is a key MEV mitigation strategy and core scaling component for Ethereum. It reshapes block production economics. If you’re interested in MEV or protocol design, explore [protocol careers](/) at infrastructure teams.
