---
title: "ZK-Rollups and Privacy"
description: "How zero-knowledge proofs enable scalable and private blockchain transactions."
order: 8
readTime: "11 min"
difficulty: "advanced"
prerequisites: ["reentrancy"]
quiz:
 - question: "What is a zero-knowledge proof?"
 options:
 - "A way to encrypt data so nobody can read it."
 - "A cryptographic method that proves a statement is true without revealing the underlying data."
 - "A consensus mechanism for blockchains."
 - "A type of digital signature."
 correct: 1
 explanation: "Zero-knowledge proofs let you prove something (e.g., 'I have enough balance to make this transaction') without revealing the actual data (your balance). The verifier learns nothing except that the statement is true."
 - question: "How do ZK-Rollups improve blockchain scalability?"
 options:
 - "By running on faster hardware."
 - "By batching thousands of transactions off-chain and posting a single proof to the main chain that verifies all of them."
 - "By reducing the size of each transaction."
 - "By using a different programming language."
 correct: 1
 explanation: "ZK-Rollups execute transactions off-chain, then generate a cryptographic proof that all transactions were valid. Only the proof (not all the transaction data) needs to be verified on-chain, dramatically reducing costs."
---

## What Are Zero-Knowledge Proofs?

A zero-knowledge proof (ZKP) lets you prove you know something without revealing what you know. The classic example:

Imagine a cave with a fork — two paths that connect in the back. You claim you know the secret password to open the door connecting them. Instead of telling me the password, you enter the cave, I shout which side to come out of, and you emerge from the correct side every time. After enough rounds, I am convinced you know the password — but I never learned it.

In cryptography, ZKPs let you prove:
- "I have enough money for this transaction" (without revealing your balance)
- "These 10,000 transactions are all valid" (without re-executing them)
- "I am over 18" (without revealing your birth date)

## Types of ZK Proofs

### SNARKs (Succinct Non-interactive Arguments of Knowledge)
- **Succinct:** The proof is small and fast to verify.
- **Non-interactive:** The prover sends the proof once; no back-and-forth.
- Most widely used in production (zkSync, Scroll).
- Requires a "trusted setup" ceremony — a one-time event where cryptographic parameters are generated.

### STARKs (Scalable Transparent Arguments of Knowledge)
- **Transparent:** No trusted setup needed.
- **Scalable:** Proof generation scales better for very large computations.
- Used by StarkNet (StarkWare).
- Proofs are larger than SNARKs but have stronger security assumptions.

| Feature | SNARKs | STARKs |
| --- | --- | --- |
| Trusted Setup | Required | Not required |
| Proof Size | Small (~300 bytes) | Larger (~50 KB) |
| Verification Speed | Very fast | Fast |
| Quantum Resistance | No | Yes |
| Used By | zkSync, Scroll, Polygon | StarkNet, StarkWare |

## ZK-Rollups: Scaling with Proofs

ZK-Rollups are Layer 2 scaling solutions that use zero-knowledge proofs to batch transactions off-chain while inheriting Ethereum's security.

### How They Work

1. **Users submit transactions** to the ZK-Rollup.
2. **The sequencer** collects transactions into batches (thousands at a time).
3. **The prover** generates a ZK proof that all transactions in the batch are valid.
4. **The proof + compressed data** is posted to Ethereum mainnet.
5. **The Ethereum smart contract** verifies the proof (cheap) instead of re-executing all transactions (expensive).

The key insight: verifying a proof is much cheaper than re-executing the computation. A proof that verifies 10,000 transactions costs roughly the same as verifying a proof for 100 transactions.

### Major ZK-Rollups

#### zkSync Era (Matter Labs)
- Uses SNARKs.
- EVM-compatible (you can deploy existing Solidity contracts).
- Native account abstraction (smart contract wallets by default).
- Has its own ZK token.

#### StarkNet (StarkWare)
- Uses STARKs.
- Not EVM-compatible — uses Cairo, a custom programming language.
- Recursive proofs (proofs of proofs) for maximum scalability.
- Has STRK token.

#### Scroll
- Uses SNARKs with a focus on maximum EVM equivalence.
- Aims to be "bytecode-level compatible" with Ethereum.
- Less opinionated than zkSync — closer to running the exact same EVM.

#### Polygon zkEVM
- SNARKs-based.
- Part of the broader Polygon ecosystem.
- Focuses on EVM equivalence for easy migration.

## Privacy Applications

ZK proofs enable privacy features that are impossible with transparent blockchains:

### Private Transactions
- **Zcash:** Uses ZK-SNARKs to create fully private transactions where sender, receiver, and amount are all hidden.
- **Aztec:** A privacy-focused ZK-rollup on Ethereum that enables private DeFi transactions.

### Private Identity
- **Proof of personhood:** Prove you are a unique human without revealing your identity (used by World/Worldcoin).
- **Credential verification:** Prove you have a degree, are a citizen, or meet age requirements without revealing the underlying document.
- **Compliance proofs:** Prove your funds are from legitimate sources without revealing your transaction history.

### Private Voting
- Cast a vote in a DAO election with a ZK proof that you hold the required tokens, without revealing which address voted for which option.

## The Trade-offs

**Prover cost:** Generating ZK proofs requires significant computational resources. Proof generation for complex computations can take minutes and requires specialized hardware.

**Complexity:** ZK circuits are extremely difficult to write and audit. Bugs in ZK circuits can lead to funds being stolen or proofs being forged.

**Latency:** Proof generation adds latency. A ZK-Rollup might take 10-30 minutes to finalize a batch, compared to ~7 days for optimistic rollups (though optimistic rollups have instant soft-finality).

## Key Takeaways

- ZK proofs let you prove a statement is true without revealing the underlying data.
- SNARKs are small and fast; STARKs are transparent and quantum-resistant.
- ZK-Rollups batch thousands of transactions into one proof, slashing costs.
- Privacy applications include private transactions, identity verification, and voting.
- ZK technology is advancing rapidly — expect major breakthroughs in prover efficiency.
