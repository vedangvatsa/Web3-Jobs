---
term: Privacy Pool
slug: privacy-pool
category: security
difficulty: Advanced
image: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1200&q=80'
description: >-
  A cryptographic system that allows users to deposit funds into a shared pool
  and later withdraw anonymously, breaking the on-chain link between sender and
  receiver.
relatedTerms:
  - zk
  - zero-knowledge-proof
  - privacy
  - mixer
synonyms:
  - mixer
  - anonymity pool
  - privacy mixer
lastUpdated: 2026-09-04
---

## Definition

A privacy pool is a smart-contract system that groups deposits and lets a user later withdraw without publicly identifying which deposit they own. It uses cryptography, usually a zero-knowledge proof, to show that the user is entitled to withdraw while hiding the link between the deposit address and the withdrawal address.

Many pools use fixed denominations, such as exactly 1 ETH per deposit. Equal amounts prevent an observer from matching a unique deposit amount to a unique withdrawal. Some designs support private balances or variable amounts, which requires more detailed proofs and accounting.

## How It Works

When depositing, the user generates a secret and a random value locally. The contract receives the funds and stores a cryptographic commitment derived from those values. The commitment identifies a deposit without revealing the secret needed to spend it. Commitments are commonly collected in a Merkle tree, whose root represents the current set of deposits.

To withdraw, the user creates a zero-knowledge proof. The proof says that the user knows a secret for one commitment in an accepted Merkle root, without revealing which commitment it is. The withdrawal also includes a nullifier, a value derived from the secret. The contract records the nullifier and rejects it if it appears again, which prevents the same deposit from being withdrawn twice.

The withdrawal can go to a new address. A relayer may submit it and pay the network fee, then deduct that fee from the withdrawn amount. This avoids requiring the new address to hold public gas funds. It does not hide every network-level signal. The relayer, wallet provider, browser, or internet connection can still expose information depending on how the user connects.

## Concrete Example

Assume 200 people each deposit 1 ETH into the same pool over several days. Alice creates her deposit secret on her device, sends 1 ETH to the contract, and receives no transferable receipt. The chain shows her deposit transaction and adds one commitment to the pool's Merkle tree.

Later, Alice generates a proof that one of the 200 commitments belongs to her. She asks a relayer to submit a withdrawal of 0.995 ETH to a fresh address, leaving 0.005 ETH for the relayer and network costs. The contract verifies the proof and confirms that Alice's nullifier has not been used. It sends the funds to the new address but cannot tell from the proof which of the 200 deposits was spent.

An observer may still make guesses. If Alice deposits and withdraws within minutes when no one else is active, the timing gives a strong clue. If she later combines the withdrawn ETH with funds from her known address in one transaction, that transaction can also weaken the separation.

## Limitations and Risks

A privacy pool protects only against some on-chain linking. Small pools give weak protection because the anonymity set is small. Repeated patterns, unusual timing, deposit and withdrawal amounts, and address reuse can allow statistical tracing. Chain-analysis firms may use those signals together with exchange records and other off-chain data.

The smart contract and proof system can fail. A bug in the verifier, Merkle-tree logic, nullifier handling, or relayer payment path can lock funds or allow theft. A user who loses the deposit secret cannot prove ownership and normally cannot recover the deposit. Relayers may be unavailable, censor withdrawals, or charge high fees.

Privacy tools may be subject to sanctions, licensing rules, reporting obligations, or other laws that vary by jurisdiction. A pool itself does not determine whether a user's activity is lawful. Users and operators can face legal or service-access risks, including blocked addresses or exchange scrutiny. This is an operational and legal issue, not a cryptographic guarantee.

## Relevant Distinctions

A privacy pool is often called a mixer, but the terms are not exact equivalents. A basic mixer may use simpler pooling or account methods. A zero-knowledge privacy pool proves membership without exposing the deposited note. A coinjoin coordinates a joint transaction among participants, usually without a pooled withdrawal claim. A shielded blockchain or shielded account system can hide transfers within a larger private ledger rather than a fixed-denomination withdrawal pool.

Privacy pools are also different from encryption. Encryption hides data from parties without a decryption key. A public privacy-pool contract still verifies a proof on-chain. The transaction and proof are public, while the proof hides the connection it establishes.
