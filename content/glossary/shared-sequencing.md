---
term: Shared Sequencing
slug: shared-sequencing
category: technical
difficulty: advanced
image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80"
description: Shared sequencing is an architectural pattern where multiple rollups use a common sequencer network to order transactions across chains. This enables atomic cross-rollup transactions, synchronous composability, and unified MEV markets while maintaining independent rollup state machines.
relatedTerms:
  - sequencer
  - rollup
  - cross-chain
  - atomic-swap
  - composability
synonyms:
  - Cross-rollup sequencing
  - Unified sequencing
  - Multi-rollup ordering
---

# Shared Sequencing

**Shared sequencing** is a rollup architecture where **multiple independent rollups share a common sequencing layer** that coordinates transaction ordering across all participating chains. Instead of each rollup operating its own isolated sequencer, a shared sequencer network simultaneously orders transactions for multiple rollups, enabling atomic cross-chain operations and synchronous composability that's impossible with traditional bridge-based architectures.

This design is one of the most promising solutions to blockchain fragmentation, allowing users to interact with multiple rollups as if they were a single unified system while preserving the sovereignty and customizability of individual rollups. Shared sequencing networks like Espresso, Astria, and Radius are building infrastructure to power the next generation of interoperable Layer 2 ecosystems.

By providing a common ordering layer, shared sequencing creates a "soft finality" zone where cross-rollup transactions can be guaranteed to either fully execute or fully revert across all involved chains—eliminating the asynchronous uncertainty and bridge risk that plague current multi-chain interactions.

## How Shared Sequencing Works

A shared sequencing system typically follows this architecture:

1. **Transaction Submission**: Users submit transactions to the shared sequencer network, specifying which rollup(s) the transaction should execute on
2. **Global Ordering**: The shared sequencer network orders all transactions from all participating rollups into a single unified sequence
3. **Atomic Bundling**: The network creates atomic bundles of cross-rollup transactions that must execute together or fail together
4. **State Distribution**: The ordered transaction batches are distributed to each participating rollup
5. **Parallel Execution**: Each rollup executes its assigned transactions according to the shared ordering
6. **Proof Generation**: Rollups generate validity proofs or fraud proofs as usual for their individual state transitions
7. **L1 Settlement**: All rollups settle their state roots to Ethereum L1, with the shared sequence providing the canonical ordering

The critical innovation is that **all rollups observe the same transaction ordering**, enabling them to coordinate state transitions even though they execute independently.

## Benefits of Shared Sequencing

Shared sequencing solves several fundamental problems in the multi-rollup ecosystem:

**Atomic Cross-Chain Transactions**: Users can execute complex multi-step transactions across multiple rollups with atomicity guarantees—either all steps succeed or all steps revert. This eliminates the bridge failure scenarios where funds get stuck mid-transfer.

**Synchronous Composability**: DeFi protocols on different rollups can interact within a single transaction, enabling arbitrage, flash loans, and complex strategies that span multiple chains without asynchronous delays.

**Unified MEV Markets**: Searchers and builders can optimize across the entire shared sequencing ecosystem rather than per-rollup, leading to more efficient MEV extraction and better user prices.

**Reduced Liquidity Fragmentation**: Assets and liquidity can be efficiently shared across rollups without needing wrapped tokens or bridge liquidity pools on each chain.

**Faster Cross-Chain Interactions**: No waiting for bridge confirmations or proof generation—cross-rollup transactions settle in a single shared sequence block (typically 1-3 seconds).

**Independent Rollup Sovereignty**: Each rollup maintains its own state machine, gas token, governance, and execution environment while gaining composability benefits.

## Technical Architecture Components

A shared sequencing system consists of several key components:

**Sequencer Network**: A decentralized network of sequencers (often using BFT consensus like Tendermint or HotStuff) that collectively orders transactions. This network must be Byzantine fault tolerant to prevent censorship or double-sequencing.

**Transaction Mempool**: A shared mempool where users submit cross-rollup transactions. The mempool may be partitioned or prioritized based on fees, urgency, or rollup-specific policies.

**State Commitments**: Mechanisms for rollups to commit to their pre-state before executing shared sequences, enabling atomic rollback if cross-chain conditions aren't met.

**Proof Aggregation**: Systems for efficiently aggregating proofs from multiple rollups, potentially using recursive proof techniques to reduce L1 settlement costs.

**Rollup Adapters**: Interfaces that allow diverse rollup implementations (Optimistic, ZK, different VMs) to plug into the shared sequencing layer without requiring homogeneous execution environments.

**Escrow and Settlement**: Smart contracts on L1 that escrow assets and enforce the shared sequence ordering, providing ultimate security guarantees.

## Shared Sequencing vs Traditional Bridges

| Aspect | Shared Sequencing | Traditional Bridges |
|--------|------------------|---------------------|
| **Cross-Chain Atomicity** | Native (built-in) | None (async messaging) |
| **Settlement Time** | 1-3 seconds (single sequence) | Minutes to hours (multiple proofs) |
| **Security Model** | Unified sequencer + L1 | Bridge validators + L1 |
| **Composability** | Synchronous (same block) | Asynchronous (separate blocks) |
| **Failure Modes** | All-or-nothing atomic rollback | Partial failures, funds stuck |
| **Liquidity Efficiency** | High (direct cross-chain) | Low (requires pools on each side) |
| **Implementation Complexity** | High (new infrastructure) | Medium (standard message passing) |

## Projects Building Shared Sequencing

Several major projects are developing shared sequencing infrastructure:

**Espresso**: Building a decentralized sequencing network with HotStuff consensus, focusing on EVM-compatible rollups and privacy-preserving sequencing.

**Astria**: Developing a shared sequencer network using CometBFT (Tendermint) consensus, with a focus on rollup sovereignty and censorship resistance.

**Radius**: Creating encrypted mempools and shared sequencing with built-in MEV protection, using threshold encryption to hide transaction content until after ordering.

**Polygon AggLayer**: Polygon's approach to unified liquidity and state across multiple chains using a shared proving layer and aggregated proofs.

**Flashbots SUAVE**: Building a "universal ordering layer" that coordinates sequencing across multiple domains, including L2s, enabling cross-domain MEV optimization.

As of 2026, several of these networks have launched testnets with multiple rollups, and early mainnets are beginning to emerge.

## Challenges and Considerations

Shared sequencing introduces new technical and economic challenges:

**Centralization Risks**: If the shared sequencer network becomes centralized or captured, it could censor transactions across all participating rollups simultaneously.

**Validator Coordination**: Ensuring BFT consensus across diverse rollups with different economic incentives and governance structures is complex.

**Latency Overhead**: Coordinating across multiple rollups adds latency compared to a single rollup's sequencer, though still faster than bridges.

**Fee Market Design**: Designing fair fee markets where users pay for shared sequencing without one rollup subsidizing another is challenging.

**Rollup Heterogeneity**: Supporting rollups with vastly different execution environments (EVM, SVM, custom VMs) in a unified sequencing layer requires sophisticated adapter layers.

**Exit Security**: Ensuring rollups can exit the shared sequencing network if it becomes malicious or undergoes governance changes they disagree with.

## Use Cases for Shared Sequencing

Shared sequencing enables several powerful use cases:

**Cross-Chain DEX Arbitrage**: Arbitrageurs can atomically trade across DEXs on multiple rollups, ensuring they profit or revert without capital risk.

**Multi-Chain Flash Loans**: Borrow assets on one rollup, use them on another, and repay on a third—all in a single atomic transaction.

**Unified DeFi Protocols**: Lending protocols can have liquidity on one rollup while collateral lives on another, with atomic liquidations.

**Cross-Chain Gaming**: Game assets and state can exist on specialized gaming rollups while settlement happens on general-purpose rollups, with instant coordination.

**Atomic Swaps Without Bridges**: Users can trade assets across rollups peer-to-peer with no bridge risk, as the swap is atomically guaranteed by the shared sequencer.

**Global NFT Marketplaces**: NFT marketplaces can list items across multiple rollups with instant cross-chain bidding and settlement.

## Career Opportunities in Shared Sequencing

As shared sequencing infrastructure matures, specialized roles are emerging:

**Distributed Systems Engineers** ($180,000 - $380,000+) build BFT consensus systems for shared sequencers, implementing HotStuff, Tendermint, or custom consensus protocols.

**Cross-Chain Protocol Developers** ($170,000 - $340,000+) design atomic transaction protocols, cross-rollup state management, and proof aggregation systems.

**Sequencer Network Operators** ($140,000 - $280,000+) run and maintain shared sequencer nodes, ensuring high uptime and censorship resistance.

**MEV Researchers** ($150,000 - $320,000+) study cross-domain MEV opportunities and design fair ordering mechanisms for shared sequencing networks.

**Cryptographic Engineers** ($190,000 - $400,000+) implement threshold encryption, verifiable delay functions, and other cryptographic primitives for fair sequencing.

This field requires deep expertise in distributed systems, blockchain consensus, and cross-chain protocols.

## Best Practices for Developers

When building on shared sequencing infrastructure:

**Design for Atomicity**: Structure cross-chain transactions to take full advantage of atomic guarantees—either all operations succeed or all fail.

**Handle Partial Failures Gracefully**: Even with atomic guarantees, individual rollup congestion or gas spikes can cause transactions to fail—implement robust retry logic.

**Optimize Gas Across Chains**: Different rollups may have different gas costs—design transactions to minimize total cross-chain gas expenditure.

**Test Cross-Chain Edge Cases**: Thoroughly test scenarios where state differs across rollups or where timing assumptions break down.

**Monitor Sequencer Health**: Track shared sequencer liveness and decentralization metrics—have contingency plans if the network degrades.

**Leverage MEV Protection**: Use private mempools or encrypted submission when available to prevent front-running of cross-chain transactions.

## The Future of Shared Sequencing

Shared sequencing is poised to become foundational infrastructure for the multi-rollup future. As the technology matures, we may see:

- **Standardized Shared Sequencing Protocols** that allow rollups to easily plug into multiple competing sequencer networks
- **Hybrid Models** combining shared sequencing with based sequencing for maximum decentralization
- **Cross-Domain Coordination** extending beyond L2 rollups to include L1 shards, sidechains, and even separate L1 blockchains
- **Advanced MEV Mechanisms** that fairly distribute MEV revenue across all participants in the shared sequencing ecosystem

The success of shared sequencing will determine whether the rollup-centric roadmap leads to a unified, composable ecosystem or a fragmented landscape of isolated chains.

**Ready to build cross-chain applications?** Explore Espresso, Astria, or SUAVE, and start designing the atomic multi-rollup experiences of tomorrow.
