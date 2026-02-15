---
term: "Block Builder"
slug: "block-builder"
category: "technical"
difficulty: "Advanced"
image: "https://images.unsplash.com/photo-1516321318423-f06f70991d9d?w=1200&q=80"
description: "A specialized entity that constructs optimized blocks by ordering and bundling transactions, bidding to have their blocks proposed by validators."
relatedTerms: ["mev", "proposer-builder-separation", "sequencer", "flashbots"]
synonyms: ["builder", "block constructor", "MEV builder"]
---

**Block builders** are specialized entities that construct blocks in PBS (Proposer-Builder Separation) systems. Builders collect transactions from the mempool and private order flow, order them optimally to extract MEV, and bid to validators to have their blocks included. Flashbots pioneered block building via MEV-Boost. Builders compete to create the most valuable blocks. Understanding block builders is essential for MEV markets and protocol economics.

## Block Builder Role

What builders do:

**Transaction Collection**: Gather transactions from public mempool and private sources.

**MEV Extraction**: Order transactions to capture arbitrage, liquidations, sandwiches.

**Block Construction**: Bundle transactions into optimized blocks.

**Bidding**: Bid to proposers for block inclusion rights.

Builders specialize in block value maximization.

## Builder Competition

Market dynamics:

**Competitive Bidding**: Builders compete by offering higher bids to proposers.

**Specialization**: Different builders optimize for different strategies.

**Private Order Flow**: Builders with exclusive order flow have advantages.

**Latency**: Faster builders can capture more MEV.

Competition drives efficiency and value distribution.

## Builder Centralization Risks

Concerns:

**Censorship**: Dominant builders can censor transactions.

**Collusion**: Builders can collude with proposers.

**Market Power**: A few builders dominate most blocks.

**Privacy Risk**: Builders see private transaction flow.

Builder centralization is an ongoing concern.

## MEV-Boost Architecture

Current system:

**Relays**: Intermediaries between builders and proposers.

**Block Submission**: Builders submit blocks to relays.

**Proposer Selection**: Validators choose highest-paying block.

**Revenue Share**: Builders pay validators, keep remaining MEV.

MEV-Boost enables builder-proposer separation.

## Builder Revenue

Economics:

**MEV Capture**: Builders capture arbitrage, liquidations, etc.

**Validator Payments**: Pay validators for inclusion rights.

**Profit Margin**: Keep difference as profit.

**Competition**: High competition compresses margins.

Builder profitability depends on MEV capture and competition.

## Career Opportunities

Builder ecosystem roles:

**Block Builder Engineers** earn $140,000-$340,000+.

**MEV Researchers** earn $140,000-$340,000+.

**Infrastructure Engineers** earn $130,000-$320,000+.

**Quant Traders** earn $150,000-$400,000+.

## Best Practices

Working with builders:

**Understand Incentives**: Know how builders optimize blocks.

**Use Private Order Flow**: Submit to builders for MEV protection.

**Monitor Censorship**: Track builder censorship rates.

## The Future of Block Builders

Trends:

**Decentralized Building**: More decentralized builder networks.

**Better Competition**: Lower barriers to entry.

**Enshrined PBS**: Protocol-native builder separation.

## Construct Optimal Blocks

Block builders are key players in MEV markets and block production. They optimize transaction ordering and bid for inclusion. If you're interested in MEV, explore [MEV careers](/) at builder teams.
