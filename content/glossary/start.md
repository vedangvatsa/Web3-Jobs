---
term: STARK
slug: start
category: technical
difficulty: Advanced
image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80'
description: >-
  Scalable Transparent Arguments of Knowledge - cryptographic proofs without
  trusted setup, using only hash functions, but larger than SNARKs.
relatedTerms:
  - zero-knowledge-proof
  - snark
  - cryptography
  - proof
synonyms:
  - STARK proof
  - transparent proof
  - hash-based proof
lastUpdated: 2026-09-04
---

A STARK, short for Scalable Transparent Argument of Knowledge, is a cryptographic proof that lets a verifier check that a computation was performed correctly without repeating the full computation. A STARK can prove facts such as "these transaction state changes follow the program rules." It does not automatically make the computation private. A STARK system can be used for privacy, but privacy depends on which inputs, outputs, and commitments are revealed.

## How It Works

The prover starts with a computation and its execution trace. An execution trace is a record of the intermediate states of the program, such as register values at each step. The prover represents constraints on that trace with mathematical polynomials. The constraints express rules like "the next balance equals the earlier balance plus the transfer amount" or "a signature check passed."

Instead of sending the full trace, the prover commits to encoded data with a Merkle tree. A verifier requests checks at positions that are unpredictable to the prover. In a non-interactive blockchain proof, the Fiat-Shamir transform derives those checks from a hash of the proof data, so there is no live back-and-forth. The FRI protocol, short for Fast Reed-Solomon Interactive Oracle Proofs, helps the verifier check that the committed values match a low-degree polynomial. Passing these random checks gives high confidence that the full computation followed the stated constraints.

STARKs are transparent because they do not require a secret, circuit-specific setup ceremony. Their security rests primarily on hash-function assumptions and the soundness of the proof protocol. Recursive proofs can verify one proof inside another computation, allowing many proofs to be combined into a smaller verification task.

## Concrete Example

A STARK-based rollup collects 1,000 Ethereum transactions off-chain. The rollup executes them against its current state: it checks signatures, updates balances, and produces a new state root. Its prover creates a STARK showing that every state transition followed the rollup's rules and that the new root results from the listed batch.

The rollup posts the proof and the required transaction data or data commitments to Ethereum. Ethereum's verifier contract checks the proof. It does not execute all 1,000 transactions in the same way the rollup prover did. If the proof verifies, the contract accepts the new state root under the rollup's rules. A user can then use the accepted root as the basis for withdrawals or later transactions, subject to the rollup's data-availability and bridge rules.

The proof shows correct execution of the program that was proved. It does not prove that the rollup sequencer fairly ordered transactions, that off-chain data will remain available, or that the bridge contract has no bugs. Those are separate parts of the system.

## Limitations And Risks

STARK proofs are often larger than many SNARK proofs, and their verification can require more data or on-chain resources depending on the implementation. Proving can be computationally intensive. Hardware cost, prover performance, and the design of the computation can limit how quickly batches are produced.

Transparency removes the trusted-setup risk, but it does not remove all cryptographic assumptions. The system relies on the security of its hash functions, correct implementations of the proof protocol, and correctly written constraints. If a circuit or program fails to constrain an important rule, a proof can verify an unintended computation. This is a software and specification problem, not a failure of the STARK idea itself.

STARKs are often described as post-quantum candidates because hash-based assumptions are believed to be more resistant to known quantum attacks than the elliptic-curve assumptions used by many SNARK systems. That is not a guarantee of safety against all quantum advances. Hash output sizes and protocol parameters must be chosen with quantum attack models in mind.

Privacy is limited when inputs or state data are public. A proof can verify a public transaction batch without hiding any transaction details. A private design needs commitments, encryption, or zero-knowledge statements that reveal only the intended facts. Those features can add complexity and may affect auditability or usability.

## Relevant Distinctions

STARKs and SNARKs are both succinct proof systems used to verify computation. A SNARK commonly has a smaller proof and may be cheaper to verify, but many SNARK constructions require a trusted setup or use elliptic-curve cryptography. STARKs avoid a trusted setup and use hash-based techniques, usually in exchange for larger proofs. The details vary by proof system, so neither label alone determines cost or privacy.

A STARK is also not a rollup. It is a proof technology. A validity rollup can use STARKs to prove transaction execution, while an optimistic rollup normally relies on a challenge period and fraud proofs instead. A blockchain may use STARKs for purposes other than scaling, including computation verification. Starknet is one example of a validity rollup that uses STARK proofs; it is not the definition of STARKs.
