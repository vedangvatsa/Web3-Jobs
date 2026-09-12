---
term: Proto-Danksharding
slug: proto-danksharding
category: technical
difficulty: Advanced
image: 'https://images.unsplash.com/photo-1599321753519-a4b4f0cf3947?w=1200&q=80'
description: >-
  An Ethereum upgrade (EIP-4844) that introduces blob-carrying transactions to
  reduce rollup data costs, serving as a stepping stone to full danksharding.
relatedTerms:
  - eip-4844
  - data-availability
  - rollup
  - scaling
synonyms:
  - EIP-4844
  - blob transactions
  - proto-sharding
lastUpdated: 2026-09-04
---

Proto-danksharding is the name commonly used for EIP-4844, an Ethereum upgrade that added blob-carrying transactions. A blob is a large piece of data attached to a transaction for a limited retention period. Rollups use blobs to publish the data that lets others reconstruct their transactions and state. The upgrade made this data publication cheaper than putting the same bytes in ordinary Ethereum calldata under many network conditions.

The name comes from danksharding, a broader Ethereum data-availability design. EIP-4844 did not split Ethereum execution into independent shard chains. It introduced the blob transaction format and blob fee market so rollups could use dedicated data space.

## How it works

A blob-carrying transaction can include one or more blobs. Each blob has a fixed maximum size of 131,072 bytes. The blob's contents are not readable by Ethereum's execution layer. Smart contracts receive a versioned hash that identifies a blob commitment, but they cannot directly inspect the blob bytes during execution.

Before submitting a transaction, its sender computes a KZG commitment for each blob. The commitment is a short cryptographic value that binds the sender to the blob data. The transaction includes the corresponding versioned hash. Nodes verify proofs that the blob matches its commitment when processing the transaction. This lets the consensus layer verify that the published data is the committed data without storing all of it in Ethereum's permanent state.

Blobs have their own fee market. A block has a target amount of blob data and a maximum amount. When blob usage is above the target, the blob base fee tends to rise. When usage is below it, the fee tends to fall. This fee is separate from the normal gas fee paid for transaction execution. A rollup therefore pays one cost for its Ethereum transaction and another for its blob data.

Ethereum nodes store blobs for a limited retention window, roughly 18 days under the protocol's current parameters. After that period, clients can prune the blob sidecars. Rollups must retrieve and preserve any data they need before pruning. The finite retention period prevents data posted for rollup availability from increasing Ethereum's permanent state forever.

## Concrete example

Consider a rollup that batches 5,000 user transfers. To let independent observers reconstruct the batch, the rollup compresses the transaction data and places it in a blob. It sends a blob-carrying transaction to Ethereum that contains the batch's state root, the KZG commitment, and the versioned hash.

Ethereum executes the small transaction and validates the attached blob commitment. The rollup's contract records the relevant state information, while full Ethereum nodes retain the blob sidecar for the availability window. A node that wants to verify the rollup downloads the blob, decompresses the batch, and checks that applying those transactions produces the claimed state transition or checks the rollup's proof.

If blob demand is low, this publication can cost less than using calldata. If many rollups are publishing blobs in the same blocks, the separate blob base fee rises. The rollup may delay a batch, charge users more, or use fewer blobs until demand falls.

## Limitations and risks

Blob data is temporary. It is not a place for data that applications need Ethereum nodes to preserve indefinitely. A rollup, archive service, or user must keep a copy before pruning. Losing those copies can make historical reconstruction difficult.

Blobs improve data availability capacity, but they do not make a rollup correct. A rollup still needs a sound validity proof system, fraud-proof system, or trusted sequencer model. Ethereum verifies the blob commitment, not the meaning of the data inside it.

Costs remain variable. A separate fee market prevents blob use from directly competing with normal execution gas in the same way as calldata, but heavy blob demand can still make posting expensive. Nodes also need bandwidth, disk space, and implementation support to process and retain blobs during the retention window.

KZG commitments rely on cryptographic assumptions and a setup ceremony. An implementation error in proof verification, transaction handling, or blob propagation could be serious. The data is also public. Rollups must not put secrets or personal information in blobs merely because the data will later be pruned.

## Relevant distinctions

A blob is not calldata. Calldata is visible to EVM execution and remains in Ethereum's historical transaction data. Blob contents are not EVM-readable and are pruned after the retention period. Both can carry rollup data, but they have different cost and storage properties.

Proto-danksharding is not full danksharding. EIP-4844 established blob transactions and the supporting commitment format. Later work can increase data capacity and use data availability sampling to help light clients check blob availability.

A blob is also not Ethereum state. Contract balances, storage slots, and code are state and must remain available for execution. Blobs are temporary consensus-layer data intended mainly for data availability.
