---
term: "Stateless Client"
slug: "stateless-client"
category: "technical"
difficulty: "Advanced"
image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd58?w=1200&q=80"
description: "A blockchain client that can verify blocks without storing the entire blockchain state, using cryptographic witnesses to prove state validity."
relatedTerms: ["verkle-tree", "merkle-tree", "scaling", "ethereum"]
synonyms: ["witness-based client", "stateless verification", "zero-state client"]
---

**Stateless clients** verify blocks without storing full state. Instead of maintaining full state database, they receive witnesses (proofs) with each block proving state changes are valid. Stateless clients drastically reduce node hardware requirements, improving decentralization. Ethereum is moving toward stateless clients using Verkle trees. Stateless clients enable nodes to run on consumer hardware with minimal storage. Understanding stateless clients is key for blockchain scalability and decentralization roadmaps.

## How Stateless Clients Work

Mechanics:

**Witnesses**: Block proposers include cryptographic proofs (witnesses) with blocks.

**Verification**: Clients verify witnesses without accessing full state.

**State-Root**: Clients track only state root hash.

**Minimal Storage**: No need to store gigabytes of state data.

Stateless clients verify state without storing it.

## Benefits

Advantages:

**Lower Hardware**: Reduces storage from hundreds of GB to MB.

**Decentralization**: More nodes can participate.

**Fast Sync**: New nodes sync instantly (no state download).

**Scalability**: Reduces long-term storage burden.

Stateless clients improve accessibility.

## Verkle Trees

Enabling technology:

**Smaller Proofs**: Verkle trees produce smaller witnesses than Merkle trees.

**Efficiency**: Witnesses remain practical even as state grows.

**Ethereum Roadmap**: Verkle trees planned for Ethereum.

Verkle trees make stateless clients feasible.

## Tradeoffs

Challenges:

**Witness Size**: Witnesses add data overhead to blocks.

**Complexity**: More complex than traditional clients.

**Backward Compatibility**: Requires state tree migration.

**Proposer Burden**: Block proposers must generate witnesses.

Stateless clients add complexity.

## Ethereum Stateless Vision

Roadmap:

**Verkle Tree Transition**: Migrate from Merkle-Patricia to Verkle trees.

**Witness Generation**: Validators generate witnesses for blocks.

**Client Diversity**: Multiple stateless client implementations.

Stateless clients are long-term goal.

## Career Opportunities

Stateless client roles:

**Protocol Engineers** earn $130,000-$320,000+.

**Cryptography Researchers** earn $150,000-$380,000+.

**Client Developers** earn $120,000-$300,000+.

## Best Practices

Preparing for stateless:

**Follow Roadmap**: Track Ethereum stateless roadmap.

**Test Verkle**: Experiment with Verkle tree clients.

**Optimize Witnesses**: Design protocols minimizing witness size.

## The Future of Stateless Clients

Trends:

**Production Deployment**: Stateless clients on mainnet.

**Cross-Chain Adoption**: Other chains adopting stateless designs.

**Better Compression**: More efficient witness schemes.

## Verify Without Full State

Stateless clients enable verification without full state storage, improving decentralization and accessibility. If you're interested in protocol design, explore [protocol careers](/) at Ethereum client teams.
