---
term: "Rollup"
slug: "rollup"
category: "protocols"
difficulty: "Advanced"
image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80"
description: "A Layer 2 scaling solution that bundles thousands of transactions together, submitting a compressed record to the main blockchain to reduce costs and increase throughput while inheriting main chain security."
relatedTerms: ["layer-2", "optimistic-rollup", "zk-rollup", "ethereum-scaling"]
synonyms: ["L2 rollup", "transaction rollup", "commit chain"]
---

**Rollups** are Layer 2 scaling solutions that execute transactions off-chain but submit transaction data and proofs to Ethereum or other Layer 1 blockchains. Instead of every transaction being processed and stored on-chain (expensive), rollups bundle thousands of transactions, compress them, and post a single proof on-chain. This reduces costs from $5-20 per transaction to $0.10-0.50 while maintaining Layer 1 security. Rollups are currently the dominant L2 scaling approach, with Arbitrum and Optimism processing billions in daily transaction volume and billions in total value locked.

## How Rollups Work

Rollups operate through a simple but powerful mechanism:

**Off-Chain Execution**: Users submit transactions to rollup sequencer, which executes them in rollup VM. Transactions are processed, accounts updated, state computed.

**Batching**: Sequencer batches thousands of transactions together rather than processing individually. Batching amortizes overhead across many transactions.

**Compression**: Transaction data is compressed (removing redundancy, using shorter formats). A gigabyte of transactions can compress to megabytes.

**Proof Submission**: Sequencer submits compressed transaction data and proof to Layer 1. Proof proves all transactions were executed correctly.

**Layer 1 Verification**: Layer 1 smart contract verifies proofs or transaction data. If valid, state transition is accepted. Rollup state is now secured by Layer 1.

**User Exits**: Users can always withdraw funds from rollup back to Layer 1, forcing transaction execution even if sequencer is offline.

This simple mechanism scales transactions from dozens/second (Layer 1) to thousands/second (rollups).

## Optimistic vs. ZK Rollups

Two main rollup types with different security models:

**Optimistic Rollups** (Arbitrum, Optimism):
- Assume transactions are valid unless proved otherwise
- Post transaction data and compressed state to Layer 1
- Anyone can challenge transactions using fraud proofs
- If challenge succeeds, invalid state is reverted
- Simpler to implement but longer withdrawal periods (7 days dispute window)

**ZK Rollups** (zkSync, StarkNet, Polygon zkEVM):
- Submit cryptographic zero-knowledge proofs proving all transactions valid
- Layer 1 verifies proofs mathematically
- No dispute period—state is proven valid immediately
- More complex to implement but faster withdrawals (1-2 hours)
- Proof verification is computationally intense

Both approaches inherit Layer 1 security while scaling throughput.

## Key Rollup Characteristics

Rollups share important features:

**High Throughput**: Process 100-4,000 transactions/second depending on compression and sequencer efficiency. 10-100x Ethereum throughput.

**Low Fees**: Transaction costs drop 10-50x because costs are amortized across many transactions.

**Layer 1 Security**: All transaction data posted on-chain (optimistic) or proofs verified on-chain (ZK). Users can force withdrawals. Security = Layer 1 security.

**Composability Challenges**: Smart contracts can't directly call Layer 2 smart contracts. Need bridges for cross-layer interaction.

**Withdrawal Latency**: Optimistic rollups require 7-day dispute period. ZK rollups are faster (1-2 hours) but prove generation is slow.

**Sequencer Risk**: If sequencer censors or goes offline, users can force transactions but with latency. Single sequencer is centralization point.

## Popular Rollup Solutions

Major rollups demonstrate the ecosystem:

**Arbitrum**: Optimistic rollup for EVM-equivalent smart contracts. $2-3B TVL, billions in weekly volume. Largest rollup by usage.

**Optimism**: Optimistic rollup for EVM-equivalent contracts. ~$1B TVL, billions in weekly volume. Focus on developer experience.

**zkSync Era**: ZK rollup with smart contracts support. ~500M TVL, millions in daily volume. Fast finality (hours not days).

**StarkNet**: ZK rollup using Stark proofs, custom Cairo language. Lower TVL but cutting-edge technology. Ethereum-native scaling.

**Polygon zkEVM**: ZK rollup compatible with Ethereum EVM. Aims to be EVM-equivalent while having ZK finality.

Each has different tradeoffs between speed, cost, security, and developer experience.

## Rollup Economics

Rollups create interesting economic dynamics:

**Transaction Fees**: Typically $0.10-1 vs $5-50 on Layer 1. Fee reduction is primary scaling benefit.

**MEV**: Rollup sequencers can extract MEV similar to Layer 1, but often with better tools. MEV extraction is shared among stakers rather than layer 1 validators.

**Sequencer Revenue**: Sequencers earn transaction fees. Arbitrum and Optimism currently have permissioned sequencers (Offchain Labs/Optimism Foundation). Future decentralized sequencers will involve market competition.

**Data Availability**: Rollups pay Layer 1 for data storage. This is major cost. EIP-4844 (Dencun upgrade) reduces this 10-100x through temporary blobspace.

**Capital Efficiency**: Users can employ capital in rollups earning yields, generating returns on less capital needed vs. Layer 1.

Rollup economics favor high-volume applications and trading activity where fee savings are material.

## Rollup Challenges

Rollups aren't perfect scaling:

**Developer Experience**: Learning new tooling, contracts written in different languages (Cairo for StarkNet), debugging is harder.

**Fragmented Liquidity**: Each rollup has separate liquidity. Capital is fragmented across Arbitrum, Optimism, zkSync, etc. No shared pools.

**Bridge Risks**: Withdrawals require bridges which have security risks and latency.

**Centralized Sequencers**: Current rollups have single sequencers that could censor transactions or go offline.

**Proof Generation**: ZK rollup proof generation is compute-intensive and slow, limiting update frequency.

**Ecosystem Adoption**: Many applications haven't migrated to rollups, limiting composability and ecosystem size.

**Long Withdrawal Times**: Optimistic rollup 7-day withdrawal period means you can't move capital quickly off rollup.

Despite challenges, rollups are viable and widely adopted scaling solution.

## Rollup Roadmaps

Future directions for rollups:

**Decentralized Sequencers**: Arbitrum and Optimism both plan decentralized sequencer networks instead of single permissioned sequencers.

**Proof Aggregation**: Multiple rollups submitting proofs together, amortizing cost across many chains.

**Recursive Rollups**: Rollups on top of rollups for further scaling.

**Cross-Rollup Communication**: Better mechanisms for smart contracts to interact across different rollups.

**EIP-4844 Integration**: Using Dencun upgrade's blobspace to reduce data availability costs 10-100x.

**Fast Finality**: Achieving faster finality than current 7-day periods through better proof mechanisms.

Next 2-3 years will see substantial rollup evolution as they mature.

## Career Opportunities

Rollups create engineering roles:

**Rollup Engineers** building and optimizing rollup systems earn $150,000-$350,000+.

**Proof Systems Engineers** designing and optimizing cryptographic proof systems earn $160,000-$380,000+.

**Smart Contract Developers** building applications on rollups earn $120,000-$250,000+.

**Sequencer Operators** managing sequencer infrastructure earn $130,000-$280,000+.

**Research Scientists** researching rollup scalability and proving systems earn $140,000-$320,000+.

**Performance Engineers** optimizing rollup throughput and latency earn $130,000-$280,000+.

## Best Practices

Using rollups effectively:

**Understand Bridges**: Know exactly how bridges work and risks before moving capital across.

**Use Established Rollups**: Arbitrum and Optimism are most mature. Newer rollups carry higher risk.

**Monitor Sequencer**: Understand sequencer configuration. Decentralized sequencers are preferable to permissioned.

**Withdrawal Planning**: Plan for 7-day (optimistic) or 1-2 hour (ZK) withdrawal delays. Don't move capital to rollup if you need instant access.

**Diversify**: Don't keep all capital in single rollup. Spread across multiple chains.

**Bridge Quality**: Use official bridges when possible. Third-party bridges introduce additional risk.

## The Future of Scaling

Rollups are currently the practical scaling solution dominating Ethereum Layer 2s. However, rollup landscape is evolving:

**Proofs Becoming Mainstream**: ZK rollup proofs are becoming faster and easier to generate, making ZK approach more viable.

**Shared Sequencing**: Future rollups might share sequencers, reducing fragmentation.

**Unified Liquidity**: Bridges and cross-rollup protocols enabling unified liquidity across rollups.

**Alternative Approaches**: Sharding (Ethereum's long-term plan), sovereign rollups, or other mechanisms might compete with rollups long-term.

## Scale Ethereum

Rollups are essential infrastructure enabling Ethereum to scale to millions of transactions without losing security. If you're interested in scaling technology, cryptographic proofs, or blockchain infrastructure, explore [blockchain engineering careers](/) at rollup teams, protocol companies, and research organizations. These roles focus on one of crypto's most important challenges: maintaining decentralization and security while scaling to global usage.
