---
term: Verkle Tree
slug: verkle-tree
category: security
difficulty: Advanced
image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80'
description: >-
  A cryptographic data structure using vector commitments to create much smaller
  proofs than Merkle trees, enabling efficient stateless clients.
relatedTerms:
  - merkle-tree
  - stateless-client
  - cryptography
  - ethereum
synonyms:
  - vector commitment tree
  - Verkle proof
  - polynomial tree
lastUpdated: 2026-09-04
---

A Verkle tree is a cryptographic tree that commits to a large set of key-value pairs and can prove the value, or absence of a value, for a chosen key. It uses vector commitments at its internal nodes rather than only hashes. This can produce much smaller proofs for many related state accesses than a traditional Merkle tree.

Blockchains need a compact commitment to their current state. Ethereum's state includes account balances, contract code, and storage slots. A state root in a block header commits to all of it. When a node needs a specific account or storage value, a proof can show that the value is consistent with that root. Smaller proofs are useful for clients that do not keep the entire state database locally.

## How it works

Keys are split into path components. Each component selects a child position in a wide tree. A Verkle node can have many children, commonly 256, so paths can be short. The node creates a vector commitment to its child values or child commitments.

A vector commitment binds the prover to every element in that vector. It also lets the prover create a short proof that a particular position has a particular value. Verkle designs commonly use polynomial commitments related to KZG commitments. The verifier uses the root commitment, claimed values, and proofs to check that each requested path is consistent.

Proofs can be aggregated. Suppose one block reads an account's balance, nonce, code hash, and several storage slots. These keys share parts of their paths. A prover can combine the opening proofs for shared nodes instead of sending a separate full path proof for each key. The result is often much smaller than sending all the hash siblings needed by a binary or hexary Merkle structure.

To prove a missing key, the proof shows an empty value at the relevant child position. To update state, a client changes affected leaf values and recomputes commitments on the path to the root. The new root becomes the state commitment for the next block. Implementations must agree on the encoding details or they will compute different roots.

## Concrete example

Assume a block executes a transfer from Alice to Bob and calls a token contract. The execution needs Alice's account record, Bob's account record, the token contract's code, Alice's token balance slot, and Bob's token balance slot. A block producer has the full state and prepares a witness containing those values plus the Verkle proofs needed to connect them to the previous state root.

A stateless verifier stores the previous root but not the full database. It checks the witness against that root, confirms the old balances, runs the transfer, and calculates the changed values. It then checks that the resulting commitments produce the new state root in the block. It did not need unrelated accounts or storage slots.

If the witness claims that Alice has 100 tokens but the proof does not open the committed storage slot to 100, verification fails. If it omits a value needed by execution, the stateless client rejects the block.

## Limitations and risks

Verkle trees reduce proof size but require more complex cryptography. KZG-style commitments use elliptic-curve operations and pairings that are generally more expensive to verify than ordinary hashes. A client may trade less network and disk use for more CPU work.

Some commitment schemes require a trusted setup. The setup does not let its participants forge proofs unless its secret material is compromised, but a compromised secret can be catastrophic. Systems need clear assumptions about the setup, curve security, and cryptographic libraries.

Migration is also difficult. Clients, block builders, sync methods, database formats, and testing tools must agree on the new tree. Producing witnesses efficiently requires access to the right state data. A small proof does not remove the need for some participants to retain and serve full state.

## Relevant distinctions

A Verkle tree differs from a Merkle tree in its commitment primitive. Merkle trees use collision-resistant hashes and expose sibling hashes along a path. Verkle trees use vector commitments and can aggregate openings. Their proofs are not literally constant size for every arbitrary query, but they can grow much more slowly, especially for many accesses.

It also differs from a Merkle-Patricia trie, which Ethereum currently uses for state. A Merkle-Patricia trie combines path compression with hash-based branching and has different key encoding and proof rules. A Verkle tree is a possible replacement state commitment format, not a new consensus mechanism.

Finally, a Verkle tree is not a stateless client. It is a data structure that can make stateless verification practical by reducing witness size. Stateless execution also needs block witnesses, client support, and rules for generating and distributing them.
