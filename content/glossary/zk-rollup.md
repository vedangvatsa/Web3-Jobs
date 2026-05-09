---
term: ZK Rollup
slug: zk-rollup
category: technical
difficulty: advanced
image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80"
description: A ZK (Zero-Knowledge) rollup is a Layer 2 scaling solution that uses validity proofs (zero-knowledge proofs) to prove the correctness of off-chain computations to Ethereum L1. Unlike Optimistic rollups that assume validity, ZK rollups cryptographically prove every batch is correct, enabling faster finality without challenge periods.
relatedTerms:
 - zero-knowledge-proof
 - rollup
 - layer-2
 - zk-snark
 - validity-proof
synonyms:
 - Zero-knowledge rollup
 - Validity rollup
 - ZKR
---

A **ZK (Zero-Knowledge) rollup** is a **Layer 2 scaling solution that uses validity proofs, cryptographic proofs that computations were executed correctly, to secure transaction batches** submitted to Ethereum L1. Rather than optimistically assuming validity like Optimistic rollups, ZK rollups provide mathematical certainty that every state transition is correct, enabling **instant finality** once the proof is verified on L1.

ZK rollups use advanced cryptography (ZK-SNARKs, ZK-STARKs) to generate compact proofs that can verify thousands of transactions in a single L1 transaction. As ZK technology matures, ZK rollups are increasingly seen as a long-term solution for Ethereum scaling.

Major ZK rollups like **zkSync Era**, **Polygon zkEVM**, **Scroll**, and **StarkNet** are processing millions of transactions with low fees.

## How ZK Rollups Work

The ZK rollup architecture involves these key steps:

### 1. Transaction Execution

- Users submit transactions to the rollup sequencer.
- Sequencer executes transactions off-chain using the rollup's VM.
- Transactions are batched together (typically every few minutes).
- Sequencer provides soft confirmation immediately.

### 2. Proof Generation

- After executing a batch, a **prover** generates a validity proof (ZK-SNARK or ZK-STARK).
- The proof cryptographically demonstrates that:
 - All transactions in the batch were executed correctly.
 - The new state root was computed properly.
 - All state transitions follow the rollup's rules.
- Proof generation is computationally intensive and requires specialized hardware.
- Proofs are compact: a proof can verify millions of transactions.

### 3. Data Posting to L1

- Transaction data is posted to Ethereum L1 (calldata or blobs via EIP-4844).
- Some ZK rollups (validiums) post data to alternative DA layers for lower costs.
- Data availability ensures anyone can reconstruct the rollup state.

### 4. Proof Verification on L1

- The proof is submitted to a verifier smart contract on Ethereum L1.
- L1 verifies the proof cryptographically.
- Verification is computationally inexpensive.
- If the proof is valid, the new state root is accepted immediately.

### 5. Instant Finality

- Once the L1 transaction confirming the proof is finalized, the rollup state is final.
- **No challenge period needed**; the proof mathematically guarantees correctness.
- Users can withdraw to L1 as soon as their transaction is in a verified batch.

## Key Advantages of ZK Rollups

### Instant Finality

The biggest advantage is **no withdrawal waiting period**. Once a batch is proven and verified on L1:

- Withdrawals can execute immediately.
- This improves user experience for applications.
- Enables faster CEX deposits, cross-chain bridges, and time-sensitive operations.

### Higher Security Guarantees

ZK rollups provide **cryptographic security** rather than game-theoretic security:

- No need to trust challengers or wait for challenges.
- Mathematical certainty of correctness, assuming cryptography is sound.
- Smaller security assumptions.
- No risk of fraud slipping through if challengers are offline.

### Superior Scalability Potential

ZK rollups can theoretically scale much further:

- **Proof compression**: Thousands of transactions compressed into one small proof.
- **Recursive proofs**: Proofs of proofs, enabling scaling.
- **Data compression**: Some ZK rollups can use state diffs rather than full transaction data.
- **Off-chain data (validiums)**: Can post data off-chain for greater scalability.

### Better Privacy Potential

Zero-knowledge cryptography enables privacy features:

- Transactions can be private while still provably correct.
- User balances can be hidden while maintaining verifiability.
- Selective disclosure allows proving facts without revealing all data.

Projects like Aztec and zkSync are exploring private ZK rollups.

## Types of ZK Proofs

ZK rollups use two main proof systems:

### ZK-SNARKs (Succinct Non-Interactive Argument of Knowledge)

- **Properties**:
- Very small proofs.
- Fast verification.
- Requires trusted setup.
- Based on elliptic curve pairings.

- **Used By**: zkSync Era, Polygon zkEVM (early versions), Scroll.

### ZK-STARKs (Scalable Transparent Argument of Knowledge)

- **Properties**:
- Larger proofs.
- Slower verification.
- No trusted setup.
- Quantum-resistant.
- Based on hash functions and polynomial commitments.

- **Used By**: StarkNet, Polygon zkEVM (transitioning), some Validiums.

## ZK-EVM: The Holy Grail

The biggest challenge for ZK rollups has been **EVM compatibility**. The Ethereum Virtual Machine wasn't designed for zero-knowledge proofs, making it difficult to build a "zkEVM" that:

- Executes EVM bytecode exactly like Ethereum.
- Generates ZK proofs of execution.
- Does so efficiently.

### Types of zkEVMs

- **Type 1 (Ethereum-Equivalent)**:
- Byte-for-byte identical to Ethereum.
- Can verify Ethereum L1 blocks with ZK proofs.
- Slowest proving times.

- **Type 2 (EVM-Equivalent)**:
- Equivalent at the EVM level but makes minor modifications for efficiency.
- Existing contracts deploy unchanged.
- Moderate proving times.

- **Type 2.5 (EVM-Compatible with Gas Changes)**:
- Nearly EVM-equivalent but changes gas costs for ZK-friendly operations.
- Most contracts work with minor adjustments.
- Faster proving.

- **Type 3 (Almost EVM-Compatible)**:
- Some EVM features removed or modified for faster proving.
- Most contracts work but some require rewrites.

- **Type 4 (High-Level Language Compatible)**:
- Compiles Solidity to a different VM.
- Many contracts need significant changes.
- Fastest proving times.

- **The Race**: Type 2 zkEVMs (Polygon, Scroll) are balancing compatibility with performance. Type 1 remains the long-term goal.

## Major ZK Rollup Projects

### zkSync Era

- **Developer**: Matter Labs 
- **Type**: Type 3 zkEVM transitioning toward Type 2 
- **Proof System**: ZK-SNARKs 

- **Key Features**:
- Native account abstraction.
- Strong ecosystem growth.
- ZK token for governance.
- Plans for zkEVM full compatibility.

- **Status**: Mainnet since March 2023.

### Polygon zkEVM

- **Developer**: Polygon Labs 
- **Type**: Type 2 zkEVM 
- **Proof System**: FRI-based STARKs + SNARKs (hybrid) 

- **Key Features**:
- High EVM equivalence.
- Part of Polygon 2.0 vision.
- Integrated with Polygon ecosystem.

- **Status**: Mainnet since March 2023.

### Scroll

- **Developer**: Scroll Foundation 
- **Type**: Type 2 zkEVM 
- **Proof System**: ZK-SNARKs 

- **Key Features**:
- Close EVM equivalence for easy migration.
- Bytecode-level compatibility.
- Open-source prover.

- **Status**: Mainnet since October 2023.

### StarkNet

- **Developer**: StarkWare 
- **Type**: Type 4 (Cairo VM, not EVM) 
- **Proof System**: ZK-STARKs 

- **Key Features**:
- Cairo language (custom for ZK-friendliness).
- No trusted setup.
- Native account abstraction.

- **Status**: Mainnet since 2021.

### Other Notable Projects

- **Linea** (ConsenSys): Type 2 zkEVM, tight MetaMask integration. 
- **Taiko**: Type 1 zkEVM (most Ethereum-equivalent), based rollup. 
- **Aztec**: Privacy-focused ZK rollup with confidential transactions.

## Challenges Facing ZK Rollups

Despite advantages, ZK rollups face significant challenges:

### Proof Generation Costs

- **Problem**: Generating ZK proofs requires:
- Specialized hardware.
- Significant electricity costs.
- Expertise in cryptographic engineering.

- **Solution**: Amortize costs over large batches, hardware acceleration, improved proof systems.

### Proving Time

- **Problem**: Generating proofs can take:
- Minutes to hours for large batches.

- **Impact**: Delays finality even though no challenge period exists.

- **Solution**: Faster provers, recursive proofs, batching optimizations.

### EVM Compatibility Complexity

- **Problem**: Making the EVM ZK-friendly is difficult:
- EVM has many opcodes, many not ZK-friendly.
- Ethereum's state model is complex.

- **Solution**: Type 2 zkEVMs making tradeoffs, continued research on proof systems.

### Prover Centralization

- **Problem**: Specialized hardware and expertise means only a few entities can generate proofs.

- **Concerns**: Centralized provers could censor by refusing to prove certain batches.

- **Solution**: Permissionless prover networks, fallback mechanisms.

### Immaturity

- **Problem**: ZK technology is still emerging:
- Bug risks in complex cryptographic code.
- Limited auditing expertise.

- **Solution**: Extensive audits, formal verification, bug bounties.

## ZK Rollups vs. Optimistic Rollups

| Aspect | ZK Rollups | Optimistic Rollups |
|--------|-----------|-------------------|
| **Finality** | Instant (proof verified) | ~7 days (challenge period) |
| **Security** | Cryptographic (validity proofs) | Game-theoretic (fraud proofs) |
| **EVM Compatibility** | Difficult (zkEVM required) | Native (easy) |
| **L1 Gas Costs** | Higher (proof verification) | Lower (only if challenged) |
| **Proving Costs** | High (specialized hardware) | None |
| **Proving Time** | Minutes to hours | N/A |
| **Complexity** | Very high (cryptography) | Medium |
| **Scalability** | Very high | High |
| **Privacy Potential** | High | Low |
| **Maturity** | Emerging | More mature |

## ZK Rollup Economics

### User Costs

- **Transaction Fees**: Currently similar to Optimistic rollups.

- **Cost Breakdown**:
- L1 data posting: 60-80% of cost.
- Proof generation: 20-30%.
- Proof verification on L1: 5-10%.
- Sequencer margin: 5%.

### Rollup Economics

- **Costs**:
- Prover hardware and electricity.
- L1 data availability and proof verification.
- Sequencer infrastructure.

- **Revenue**:
- Transaction fees from users.
- MEV extraction.
- Protocol tokens.

ZK rollups are more capital-intensive than Optimistic rollups due to proving costs, but improving efficiency and scaling to millions of transactions per batch make them viable.

## Career Opportunities in ZK Rollups

The ZK rollup ecosystem offers roles:

- **Cryptographic Engineers**: Design and implement ZK proof systems, optimize circuits, and develop proof generation algorithms.

- **zkEVM Engineers**: Build EVM-compatible ZK rollups, implementing opcodes as ZK circuits.

- **Proof System Researchers**: Research new proof systems and prove security properties.

- **Hardware Engineers (ZK)**: Design ASICs, FPGAs, and GPU accelerators for proof generation.

- **Smart Contract Developers (ZK L2)**: Build dApps on ZK rollups, understanding ZK-specific considerations.

- **Formal Verification Engineers**: Formally verify ZK circuits and proof systems for correctness.

## Best Practices for ZK Rollup Developers

When building on ZK rollups:

- **Test on Specific Rollup**: Even with EVM compatibility, test on the actual ZK rollup as subtle differences exist.

- **Understand Gas Differences**: Some operations may have different gas costs due to ZK proving complexity.

- **Optimize for ZK**: Minimize operations expensive to prove when possible.

- **Use Native Features**: Use rollup-specific features.

- **Plan for Proving Time**: Account for proving delays in your application flow.

- **Monitor Provers**: Understand the rollup's prover decentralization and have contingencies for prover downtime.

## The Future of ZK Rollups

ZK rollups are fast-moving:

- **Type 1 zkEVMs**: Eventually, full Ethereum equivalence will be achieved with acceptable proving times.

- **Hardware Acceleration**: Specialized hardware will make proving faster and cheaper.

- **Recursive Proofs**: Proofs of proofs enabling scaling.

- **Privacy Features**: Native private transactions and confidential smart contracts.

- **Prover Decentralization**: Permissionless prover networks removing centralization concerns.

- **Hybrid Models**: Combining ZK and Optimistic approaches for optimal tradeoffs.

- **Universal Adoption**: As technology matures, ZK rollups may become the default L2 solution.

ZK rollups represent the forefront of blockchain scaling and cryptography. While they're more complex and less mature than Optimistic rollups today, their fundamental advantages suggest they'll dominate the long-term L2 solutions.
