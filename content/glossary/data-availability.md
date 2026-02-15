---
term: "Data Availability"
slug: "data-availability"
category: "technical"
difficulty: "Advanced"
image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd58?w=1200&q=80"
description: "The guarantee that blockchain data required to verify state transitions is publicly accessible, ensuring that anyone can validate blocks and preventing hidden data attacks."
relatedTerms: ["rollup", "consensus", "data-availability-sampling", "scaling"]
synonyms: ["DA", "data availability layer", "DA security"]
---

**Data availability (DA)** means block data is publicly accessible so anyone can verify state. If data is missing, validators can’t verify transactions. In rollups, data availability is critical: rollup publishes data to L1 so anyone can reconstruct state. Without DA, sequencer could hide data, preventing users from exiting and enabling fraud. DA is a core security assumption for L2s and modular blockchains. Celestia and EigenDA are dedicated DA layers. Understanding DA is essential for scaling.

## Why Data Availability Matters

Key reasons:

**Verifiability**: Users can verify state transitions only if data is available.

**Fraud Proofs**: Optimistic rollups need data to detect fraud.

**Exit Safety**: Users can exit L2 only if they can reconstruct state.

**Censorship Resistance**: Hidden data enables censorship and theft.

DA is fundamental for blockchain security.

## DA in Rollups

Rollup model:

**Transaction Data**: Rollups post transaction data to L1 (calldata) for DA.

**State Roots**: Rollups publish state roots for verification.

**Proofs**: ZK rollups provide validity proofs, but still need DA for full state.

**Optimistic Rollups**: Need DA to allow fraud proofs.

DA underpins rollup security.

## DA Sampling

Efficiency technique:

**Sampling**: Validators sample random data chunks.

**Probability**: High probability of detecting missing data.

**Scalability**: Allows large data without full download.

**Celestia**: Uses DA sampling to scale.

DA sampling improves scalability.

## DA Layers

Dedicated layers:

**Celestia**: Modular DA layer using DA sampling.

**EigenDA**: Ethereum-based DA layer using restaking.

**Avail**: DA layer focusing on low-cost data.

**Ethereum**: L1 provides DA via calldata.

DA layers provide scalable data availability.

## DA Tradeoffs

Considerations:

**Cost**: Posting data to Ethereum is expensive.

**Security**: DA layer security is critical for rollup safety.

**Latency**: DA layers add latency to rollups.

**Censorship**: DA provider can censor data if centralized.

DA design has tradeoffs.

## DA Attacks

Threats:

**Data Withholding**: Sequencer hides data to prevent exits.

**Censorship**: DA provider refuses to publish data.

**Fraudulent State**: Without DA, attackers can create invalid states.

**Availability Failure**: DA outage halts rollups.

DA security is critical.

## Career Opportunities

DA infrastructure roles:

**Protocol Engineers** earn $130,000-$320,000+.

**Research Engineers** earn $140,000-$340,000+.

**Infrastructure Operators** earn $100,000-$260,000+.

**Security Researchers** earn $120,000-$300,000+.

## Best Practices

Using DA layers:

**Understand Trust**: Know DA layer security model.

**Redundancy**: Consider multiple DA sources.

**Monitor Availability**: Track uptime and data publication.

**Audit**: Audit DA code and protocols.

## The Future of Data Availability

Trends:

**Cheaper DA**: Proto-danksharding and blob data reduce costs.

**Modular Stack**: More modular L2 stacks with dedicated DA.

**Cross-DA Bridging**: Interoperable DA layers.

## Ensure Verifiable State

Data availability ensures users can verify state transitions. It is central to rollup security and modular blockchain design. If you’re interested in scaling infrastructure, explore [infrastructure careers](/) at DA-layer teams.
