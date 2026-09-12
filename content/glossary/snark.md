---
term: SNARK
slug: snark
category: technical
difficulty: Advanced
image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80'
description: >-
  Succinct Non-Interactive Arguments of Knowledge - cryptographic proofs that
  are very small and fast to verify, used in blockchain scaling and privacy
  applications.
relatedTerms:
  - zero-knowledge-proof
  - cryptography
  - proof
  - zk-rollup
synonyms:
  - SNARK proof
  - succinct proof
  - zero-knowledge argument
lastUpdated: 2026-09-04
---

## Definition

A SNARK is a Succinct Non-interactive Argument of Knowledge. It is a cryptographic proof that lets a prover show that a statement is true under specified rules. The verifier can check the proof without repeating the full computation. "Succinct" means the proof and verification work are small compared with the computation being proved. "Non-interactive" means the prover can create one proof that a verifier checks later, rather than taking part in a live challenge-and-response exchange.

Many SNARKs can also be zero knowledge. In that case, the proof establishes that a prover knows a valid witness without revealing the witness itself. For example, a user can prove that a private transaction conserves value and has valid authorization without publishing the sender, receiver, or amount. Not every SNARK application needs the privacy property. A rollup can use a proof to show that a batch of public transactions was executed correctly.

An argument is computationally sound, not mathematically absolute in the way a simple proof is. Its security depends on stated cryptographic assumptions and on correct implementation.

## How It Works

The application first expresses a computation as a circuit or constraint system over a finite field. The circuit might check account signatures, balances, and state updates. Public inputs are values the verifier can see, such as an old state root and a new state root. The witness contains the private inputs or intermediate values that satisfy the constraints.

The prover runs a proving algorithm with the circuit, public inputs, and witness. It produces a proof showing that it knows values that make every constraint hold. The verifier uses a verification key, public inputs, and the proof. It accepts only if the cryptographic checks succeed. On a blockchain, a verifier smart contract can reject a state update when its corresponding proof is invalid.

Different SNARK families use different mathematics. Groth16 is known for very small proofs and typically uses a circuit-specific trusted setup. PLONK-style systems aim to use a more reusable setup. They make different choices about proving speed, proof size, recursion, and verification cost.

## Concrete Example

Consider a rollup that processes 1,000 token transfers off the base chain. Its operator starts with a published state root, checks each signed transfer, updates balances, and calculates a new root. The operator builds a SNARK whose public inputs are the old root and new root. The witness includes the transaction details, Merkle paths, signatures, and intermediate balance updates required by the circuit.

The operator sends the proof and new root to a contract on Ethereum. The contract verifies the proof much more cheaply than replaying all 1,000 transfers in the Ethereum Virtual Machine. If valid, it records the new root. Users can then rely on the rollup's rules for deposits, withdrawals, and data access.

The proof does not automatically make the rollup private. If the operator posts the transaction list as public data, anyone can read it. Privacy requires the circuit and data-publication design to conceal the relevant information.

## Limitations And Risks

SNARK circuits are difficult to design and audit. A circuit can omit a required check while its proof system still works perfectly. For instance, failing to constrain a balance update can let an invalid state transition satisfy the circuit. The security of the application depends on the circuit, proof library, serialization, verifier contract, and surrounding protocol.

Proof generation can require substantial memory, time, or specialized hardware. A proof that is cheap to verify may be expensive to create. This can centralize proving in a small number of operators. On-chain verification also consumes gas, and the cost varies by proof system and base chain.

Some SNARK constructions require a trusted setup. If the toxic waste, meaning secret setup randomness, is retained or compromised in certain schemes, an attacker may be able to forge proofs. Multi-party ceremonies reduce this risk when at least one participant destroys its contribution, but they do not fix errors in the circuit. Cryptographic assumptions may also weaken over time, including under advances in quantum computing.

## Relevant Distinctions

SNARK is a family label, not one algorithm. A zero-knowledge proof is the wider category; a SNARK is often a compact non-interactive form of it. A validity proof is an application of a proof system that verifies a state transition. It may reveal all transaction data or conceal part of it.

SNARKs differ from STARKs. STARKs generally rely on hash-based assumptions and do not require a trusted setup, but their proofs are commonly larger. A proof is also different from data availability. A SNARK can show that a computation obeyed a circuit, while users may still need published data to reconstruct state or withdraw assets.
