---
title: "Layer 2: Making Blockchains Fast"
description: "How rollups and L2 networks solve Ethereum's speed and cost problems."
order: 11
readTime: "9 min"
difficulty: "beginner"
prerequisites: ["gas-fees"]
quiz:
  - question: "Why does Ethereum need Layer 2 networks?"
    options:
      - "Because Ethereum is broken"
      - "Because Ethereum is too slow and expensive for everyday transactions"
      - "Because Layer 2 replaces Ethereum"
      - "Because regulators require it"
    correct: 1
    explanation: "Ethereum processes ~15-30 transactions per second and fees can reach $20+ during busy periods. Layer 2 networks process thousands of transactions per second at a fraction of the cost."
  - question: "What is a rollup?"
    options:
      - "A type of cryptocurrency"
      - "A Layer 2 that processes transactions off-chain and posts proof to Ethereum"
      - "A method for creating NFTs"
      - "A wallet feature"
    correct: 1
    explanation: "Rollups execute transactions on their own chain, then batch-compress the results and post them to Ethereum. This lets them inherit Ethereum's security while being much faster and cheaper."
  - question: "What is the difference between Optimistic and ZK rollups?"
    options:
      - "Optimistic rollups are faster"
      - "ZK rollups use cryptographic proofs; Optimistic rollups assume validity unless challenged"
      - "They work on different blockchains"
      - "There is no difference"
    correct: 1
    explanation: "Optimistic rollups assume transactions are valid and allow a challenge period (7 days) to dispute fraud. ZK rollups generate a mathematical proof that transactions are valid — no trust or waiting required."
  - question: "Which of these is a Layer 2 network?"
    options:
      - "Bitcoin"
      - "Solana"
      - "Arbitrum"
      - "Cardano"
    correct: 2
    explanation: "Arbitrum is a Layer 2 rollup built on top of Ethereum. Bitcoin and Solana are Layer 1 blockchains. Cardano is also a Layer 1."
  - question: "How do you move assets from Ethereum to a Layer 2?"
    options:
      - "You email the Layer 2 support team"
      - "You use a bridge to transfer tokens from L1 to L2"
      - "Assets automatically appear on Layer 2"
      - "You need to buy new tokens on the Layer 2"
    correct: 1
    explanation: "You use a bridge — a smart contract that locks your tokens on Ethereum and mints equivalent tokens on the Layer 2. When you want to go back, the L2 tokens are burned and the L1 tokens are unlocked."
---

## The scalability problem

Ethereum processes about 15-30 transactions per second. That is enough for a few thousand users, but not for millions. When too many people try to transact at once, fees spike and transactions slow down.

Layer 2 (L2) networks solve this by moving most of the work off the main chain (Layer 1) while still using Ethereum for security.

<div class="diagram">
<svg viewBox="0 0 800 240" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
  <!-- L1 -->
  <rect x="200" y="160" width="400" height="60" rx="10" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="400" y="185" text-anchor="middle" font-size="14" font-weight="bold" fill="#1e40af">Ethereum (Layer 1)</text>
  <text x="400" y="205" text-anchor="middle" font-size="11" fill="#3b82f6">15-30 TPS · Security · Settlement</text>

  <!-- L2 - Arbitrum -->
  <rect x="40" y="30" width="200" height="80" rx="10" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
  <text x="140" y="58" text-anchor="middle" font-size="13" font-weight="600" fill="#166534">Arbitrum</text>
  <text x="140" y="78" text-anchor="middle" font-size="10" fill="#64748b">4,000+ TPS</text>
  <text x="140" y="95" text-anchor="middle" font-size="10" fill="#64748b">Optimistic Rollup</text>

  <!-- L2 - Optimism -->
  <rect x="280" y="30" width="200" height="80" rx="10" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
  <text x="380" y="58" text-anchor="middle" font-size="13" font-weight="600" fill="#991b1b">Optimism</text>
  <text x="380" y="78" text-anchor="middle" font-size="10" fill="#64748b">2,000+ TPS</text>
  <text x="380" y="95" text-anchor="middle" font-size="10" fill="#64748b">Optimistic Rollup</text>

  <!-- L2 - Base -->
  <rect x="520" y="30" width="200" height="80" rx="10" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="620" y="58" text-anchor="middle" font-size="13" font-weight="600" fill="#1e40af">Base</text>
  <text x="620" y="78" text-anchor="middle" font-size="10" fill="#64748b">Built by Coinbase</text>
  <text x="620" y="95" text-anchor="middle" font-size="10" fill="#64748b">Optimistic Rollup</text>

  <!-- Arrows down -->
  <line x1="140" y1="110" x2="300" y2="160" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="4"/>
  <line x1="380" y1="110" x2="400" y2="160" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4"/>
  <line x1="620" y1="110" x2="500" y2="160" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="4"/>

  <text x="400" y="145" text-anchor="middle" font-size="10" fill="#94a3b8">Post transaction proofs to Ethereum</text>
</svg>
</div>

## How rollups work

A rollup is the most common type of Layer 2. It processes transactions on its own chain, bundles them together, and posts a compressed summary back to Ethereum.

Think of it like a mail service. Instead of each person driving to the post office (Ethereum) individually, a mail carrier (the L2) collects letters from the neighborhood, loads them into one truck, and makes a single trip. The post office still handles the final delivery — but with far less traffic.

There are two types:

### Optimistic rollups

Used by: Arbitrum, Optimism, Base

Assume all transactions are valid by default. If someone suspects fraud, they can submit a **fraud proof** during a 7-day challenge window. If the fraud proof is valid, the transaction is reversed and the cheater loses their bond.

The trade-off: withdrawing money from an optimistic rollup to Ethereum takes 7 days (the challenge period). Third-party bridges can speed this up for a fee.

### ZK (Zero-Knowledge) rollups

Used by: zkSync, StarkNet, Polygon zkEVM

Generate a **cryptographic proof** (called a validity proof) that mathematically proves all transactions in the batch are correct. No waiting period. No trust needed.

The trade-off: generating ZK proofs requires significant computing power, making the technology more complex to build. But withdrawals can be much faster since the proof guarantees correctness.

## Cost comparison

| Operation | Ethereum L1 | Arbitrum | Base |
| --- | --- | --- | --- |
| ETH transfer | $0.50-5 | $0.01-0.10 | $0.001-0.01 |
| Token swap | $5-50 | $0.10-0.50 | $0.01-0.10 |
| NFT mint | $10-100 | $0.20-1.00 | $0.02-0.20 |

These are approximate ranges and vary with network congestion. The key point: L2s are 10-100x cheaper for the same operations.

## Key takeaways

- Layer 2 networks process transactions off Ethereum's main chain, then settle back to it.
- **Optimistic rollups** (Arbitrum, Optimism, Base) assume validity, with a 7-day challenge window.
- **ZK rollups** (zkSync, StarkNet) prove validity with math — no challenge period needed.
- L2s reduce costs by 10-100x while inheriting Ethereum's security.
- To use an L2, you bridge your assets from Ethereum using a smart contract.
