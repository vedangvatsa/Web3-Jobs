---
term: Stateless Client
slug: stateless-client
category: technical
difficulty: Advanced
image: 'https://images.unsplash.com/photo-1599321753519-a4b4f0cf3947?w=1200&q=80'
description: >-
  A blockchain client that can verify blocks without storing the entire
  blockchain state, using cryptographic witnesses to prove state validity.
relatedTerms:
  - verkle-tree
  - merkle-tree
  - scaling
  - ethereum
synonyms:
  - witness-based client
  - stateless verification
  - zero-state client
lastUpdated: 2026-09-04
---

Stateless client is a blockchain client that verifies state transitions without keeping the entire current state database on local disk. It receives a witness with each block. The witness contains the specific account, storage, code, and cryptographic proof data needed to execute that block. The client verifies the witness against the prior state root, executes the block, and checks that the result matches the new state root.

Traditional full nodes keep a local copy of the state so they can look up any account or contract storage slot while executing transactions. State grows as users create accounts and contracts write storage. A stateless client aims to avoid this long-term storage burden. "Stateless" describes state storage, not the absence of all local data.

## How it works

Each block begins with a commitment to the previous state, usually called the state root. The block producer has access to the full state and determines every value the block's transactions will read or change. It packages those values with proofs that connect them to the previous root. This package is the witness.

For a simple transfer, the witness may contain the sender's nonce and balance, the receiver's account record, and proofs for both. For a contract call, it can also contain contract code and every storage slot that execution reads or writes. The witness must prove absence as well as presence. Creating a new account or setting an unused storage slot requires a proof that the old value was empty.

The stateless client validates each proof against the old root. It then runs the same transaction execution rules as a full node. If a transfer subtracts 3 ETH from one account and adds 3 ETH to another, the client starts from the witnessed old values and calculates the new ones. It updates the relevant commitment paths and checks that the resulting root equals the block's declared new state root.

If the block omits a required value, the client cannot guess it from a database. Execution fails because the witness is incomplete. If the witness provides a wrong value, its proof will not match the old root. This means a stateless client can reject invalid blocks without holding all unrelated state.

Witness sizes depend on the state commitment format. Verkle trees can aggregate many openings, making witnesses more practical for blocks with many state accesses.

## Concrete example

Suppose a block contains a transaction where Leo sends 2 ETH to Noor. The previous state root commits to Leo's balance of 7 ETH, Leo's nonce of 14, and Noor's balance of 1 ETH. The producer includes these values and proofs that link them to the old root.

A stateless client verifies all three proofs. It checks Leo's signature and nonce, then calculates the new values: Leo has 5 ETH and nonce 15, while Noor has 3 ETH. It updates the witnessed paths and obtains the proposed new state root. If that root matches the block header, the state transition is valid for this transaction.

For a token contract call, the witness also needs the token code and relevant balance slots. It must account for every state access made during execution.

## Limitations and risks

Stateless verification moves work and data rather than eliminating them. Somebody must keep enough full state to build blocks, generate witnesses, serve historical data, and help new full nodes bootstrap.

Witnesses add block bandwidth and processing costs. A block with many contract accesses may need a large witness. Duplicate accesses, access patterns that depend on execution, and poorly designed contracts can increase the size. Block propagation can slow if witnesses are too large, and validators need sufficient CPU to verify the proofs and execute the block.

The design requires exact client agreement. A missed storage read, malformed proof, different empty-value rule, or incorrect commitment update can cause consensus failures. Producers also need a reliable way to generate complete witnesses. An unavailable or incomplete witness should make a block unverifiable, not cause clients to accept unproven state.

## Relevant distinctions

A stateless client is not a light client in the usual sense. A light client often verifies block headers and consensus proofs but does not execute every transaction. A stateless client can fully execute and validate blocks, provided it receives valid witnesses.

It is also not an archive node. Archive nodes preserve extensive historical state for queries. A stateless client stores little or no current state, while the network still needs full and archival services for data availability and applications.

Statelessness differs from zero-knowledge validity proofs. A validity proof can show that a computation was performed correctly without replaying every step. A stateless client re-executes the block but obtains the required state through cryptographic witnesses. The two approaches can be used together, but they solve different verification and data-access problems.
