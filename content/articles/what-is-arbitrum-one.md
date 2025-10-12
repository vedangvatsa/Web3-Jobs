---
title: "What is Arbitrum One? A Guide to the Leading L2"
image: "/images/nasa-cIX5TlQ_FgM-unsplash.jpg"
data-ai-hint: "arbitrum blockchain"
description: "A deep dive into Arbitrum One, a leading Layer 2 scaling solution for Ethereum that uses Optimistic Rollup technology to provide fast and cheap transactions."
category: "Technology Deep Dives"
---

As Ethereum has grown, the need for scaling solutions has become paramount. **Arbitrum One** has emerged as one of the most dominant and widely adopted **[Layer 2 (L2) scaling solutions](/guide-to-layer-2s)**, providing a way for users to interact with the Ethereum ecosystem at a fraction of the cost and at much greater speeds.

Developed by Offchain Labs, Arbitrum is an **Optimistic Rollup** designed to be fully compatible with the Ethereum Virtual Machine (EVM). This means that developers can deploy their existing Ethereum smart contracts and dApps directly onto Arbitrum with minimal changes, instantly gaining the benefits of its scalability.

### How Arbitrum Works: The Optimistic Rollup Model

Arbitrum's architecture is based on the principle of moving transaction execution off the main Ethereum chain (L1) while still inheriting its security.

1.  **Off-Chain Execution:** Users submit transactions to the Arbitrum "sequencer." The sequencer orders these transactions and executes them in a fast, off-chain environment.
2.  **Batching and Posting:** The sequencer then bundles or "rolls up" thousands of these transactions into a single batch. It posts the compressed data from this batch to the Ethereum L1. This ensures that the transaction data is always available and secured by Ethereum.
3.  **Fraud Proofs (The "Optimistic" Part):** Arbitrum "optimistically" assumes that all transactions posted by the sequencer are valid. It does not provide an upfront proof. This opens a "challenge period" (which lasts for seven days).
4.  **The Challenge Period:** During this week, any honest node (a "validator") can review the transaction data posted to L1. If they spot a fraudulent transaction, they can submit a "fraud proof" to the Ethereum smart contracts that govern the rollup. If the fraud is proven, the malicious sequencer is penalized, and the fraudulent transaction is reverted.
5.  **Finality:** If no challenges are made during the 7-day period, all transactions in the batch are considered final and irreversibly confirmed on Ethereum.

### The Arbitrum Ecosystem

-   **EVM Equivalence:** Arbitrum is designed to be highly compatible with the EVM, making it easy for developers to migrate their dApps.
-   **Vibrant DeFi and Gaming Scene:** Due to its low fees and high speeds, Arbitrum has become a major hub for DeFi protocols, Web3 games, and NFT projects.
-   **The ARB Token:** The Arbitrum ecosystem is governed by the **Arbitrum DAO**, and its native governance token is **ARB**. Holders of the ARB token can vote on proposals that direct the future of the network, from protocol upgrades to how the DAO's treasury funds are allocated.

### Trade-offs and Considerations

The main trade-off of the Optimistic Rollup model is the **long withdrawal time**. When a user wants to move their funds from Arbitrum back to the Ethereum mainnet, they must wait for the 7-day challenge period to complete. However, third-party "bridges" have emerged that allow users to bypass this waiting period for a small fee.

Arbitrum One has established itself as a leader in the race to scale Ethereum. By offering a fast, cheap, and EVM-compatible environment, it has onboarded millions of users and billions of dollars in value, playing a crucial role in making the decentralized internet accessible to a mainstream audience.

---

## Frequently Asked Questions

### 1. What is Arbitrum?
Arbitrum is a **[Layer 2 (L2) scaling solution](/guide-to-layer-2s)** for Ethereum. It processes transactions off-chain to make them faster and cheaper, then posts the data back to the main Ethereum chain to inherit its security.

### 2. How does Arbitrum work?
Arbitrum is an **Optimistic Rollup**. It "optimistically" assumes transactions are valid and uses a 7-day "challenge period" where anyone can submit a "fraud proof" to revert a fraudulent transaction.

### 3. What is the main difference between Arbitrum (Optimistic) and a ZK-Rollup?
An Optimistic Rollup uses fraud proofs and has a long withdrawal period. A **[ZK-Rollup](/how-zkevm-brings-zero-knowledge-proofs-to-ethereum)** uses "validity proofs" (ZKPs) to mathematically prove every transaction is valid, allowing for instant withdrawals.

### 4. Why would a developer build on Arbitrum?
Developers build on Arbitrum to offer their users much lower transaction fees and faster confirmations than on Ethereum mainnet. Its high compatibility with the EVM makes it easy to migrate existing dApps.

### 5. What is the ARB token used for?
The ARB token is the native governance token for the Arbitrum ecosystem. Holders can participate in the **[Arbitrum DAO](/what-is-a-dao)** and vote on the future direction of the protocol.