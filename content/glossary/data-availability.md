---
term: Data Availability
slug: data-availability
category: technical
difficulty: Advanced
image: 'https://images.unsplash.com/photo-1599321753519-a4b4f0cf3947?w=1200&q=80'
description: >-
  The guarantee that blockchain data required to verify state transitions is
  publicly accessible, ensuring that anyone can validate blocks and preventing
  hidden data attacks.
relatedTerms:
  - rollup
  - consensus
  - data-availability-sampling
  - scaling
synonyms:
  - DA
  - data availability layer
  - DA security
lastUpdated: 2026-09-04
---

## Definition

Data availability is the property that the data behind a published block can be obtained by network participants. A block header or a state root alone is not enough for independent verification. Nodes need the transactions, or equivalent state-transition data, to reproduce the result, check a fraud proof, or construct a withdrawal.

This matters most when execution and data publication happen in different places. A rollup may execute many transactions through a sequencer, then post a compressed record to another chain. Users must be able to retrieve that record. If the sequencer publishes only a new state root and hides the inputs that created it, users cannot reliably determine the current state or challenge it.

Availability is about access to data, not whether that data is correct. A fully available block may contain invalid transactions. Validity rules and proofs address correctness. Availability makes it possible for others to check those rules.

## How It Works

On a conventional blockchain, full nodes receive a block, download its contents, validate it, and keep or serve the data. Consensus participants reject blocks that do not meet the network's rules.

Rollups commonly publish transaction data, state differences, or compressed batches to a data availability layer. Ethereum offers data availability through calldata and blob data. Blob data is designed for rollups and is retained by Ethereum nodes for a limited period. A rollup's bridge, fraud-proof system, and withdrawal design must account for where the required data is published and how long it remains accessible.

Dedicated data availability networks can spread encoded data across many validators. Some use erasure coding, which expands a data block into pieces so that the full block can be reconstructed even when some pieces are missing. Data availability sampling lets a light client request randomly selected pieces instead of downloading the full block. If many random requests succeed, the client gains statistical confidence that enough data was published for reconstruction. Sampling does not prove every byte was downloaded by that client.

## Concrete Example

Imagine a rollup sequencer processes 10,000 transfers and produces a new state root. It posts a batch of the transaction data as a blob on Ethereum. Independent rollup nodes download the blob, replay the transactions, and compare their calculated state root with the root claimed by the sequencer.

If the rollup is optimistic, a watcher can use the published batch to produce a fraud proof when the sequencer claims an invalid result. If the rollup uses validity proofs, the proof can show that a state transition followed the circuit rules, but users still need accessible data to learn their balances and to generate transactions or withdrawals under the protocol's design.

Now assume the sequencer publishes the state root but sends the transaction batch only to a private server. The root may look normal, yet users cannot reconstruct the state from public information. A user who needs to prove a balance to withdraw could be blocked. This is a data withholding failure, even if the sequencer's hidden data would have produced a valid root.

## Limitations And Risks

Publishing data on a highly secured base chain can be costly. A rollup may reduce its fees by posting less data or by using a separate availability network, but that choice can alter its security model. Users must trust the availability layer's validators, sampling guarantees, and recovery procedures to the extent that the rollup depends on them.

Data may be available at block time but not stored forever. Systems using temporary blob storage need a separate plan for historical indexing and for users who need old records. Availability outages can delay transaction processing, proof generation, or withdrawals. A centralized sequencer can also refuse to accept transactions even when the data layer itself remains available.

Sampling has probability-based guarantees. A client that makes too few samples may fail to detect a partially withheld block. Erasure coding and commitments add complexity. Available transaction data may reveal activity. Data availability does not provide privacy.

## Relevant Distinctions

Data availability differs from data storage. Availability asks whether participants can obtain enough data to verify or recover a recent block. Storage asks how data is retained and served over the long term. A system can make data available briefly while relying on separate archives for permanent access.

It also differs from data validity. A validity proof can establish that a computation followed certain rules, while availability lets people access the inputs and state information needed by the wider system. Data availability sampling is not the same as downloading a block. It gives a probabilistic test that the encoded block was widely published. A data availability layer is also not automatically a settlement layer. It may publish and attest to data without resolving disputes or holding the assets secured by a rollup.
