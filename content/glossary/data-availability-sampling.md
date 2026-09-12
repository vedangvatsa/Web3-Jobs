---
term: Data Availability Sampling
slug: data-availability-sampling
category: technical
difficulty: Advanced
image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80'
description: >-
  A technique where nodes randomly sample small pieces of block data to
  probabilistically verify that full data is available, enabling scalable block
  sizes without full data download.
relatedTerms:
  - data-availability
  - rollup
  - scaling
  - celestia
synonyms:
  - DAS
  - data sampling
  - availability sampling
lastUpdated: 2026-09-04
---

Data availability sampling, or DAS, is a method for checking whether the data behind a block can be retrieved. A node does not download the whole block. It requests randomly chosen pieces and verifies that the pieces belong to the committed block data. If enough independent requests succeed, the node gains high statistical confidence that the entire block was made available.

Availability matters because a block header or commitment alone is not enough to validate applications built on the data. A block producer could publish a valid commitment while withholding transaction data. Rollups then could not reconstruct state, and users could not verify the claims derived from it. DAS aims to let light clients detect this kind of withholding without requiring each one to download every byte.

## How it works

The block's original data is first divided into small shares. The network applies erasure coding, which creates extra redundant shares. A common model arranges shares in a two-dimensional square, extends each row and column with erasure coding, and commits to the resulting structure with Merkle roots or another commitment scheme.

Erasure coding is important. If a producer withholds some original shares, the redundant encoding means it must withhold a much larger fraction of the extended square before the missing data cannot be reconstructed. That larger missing area makes a random request more likely to hit unavailable data.

A sampling node selects share positions using unpredictable randomness and asks peers for those shares and their proofs. The proof shows that a returned share is part of the committed data square. The node verifies the proof against the block commitment. It repeats this process for several locations, often spreading requests across independent peers.

If a requested share is unavailable, the node has evidence that data availability failed, though it must distinguish withholding from a temporary network problem. If all samples arrive with valid proofs, the node has not proved every share is present. Instead, it has reduced the probability that a producer hid enough data to prevent reconstruction. More samples reduce that probability exponentially when the assumptions about random sampling and peer access hold.

Full nodes still download and store enough data to reconstruct blocks. Their reconstruction can repair a limited amount of missing data using the redundant shares. Light clients use the sampling result to decide whether to accept a block as available without doing that full download.

## Concrete example

Suppose a data availability layer encodes a block into 4,096 shares. Its coding scheme means an attacker must hide at least 1,024 shares to make the block unrecoverable. A light client asks for 30 randomly selected shares. If the attacker has hidden one quarter of the shares and the choices are independent, the chance that all 30 requests avoid the withheld set is roughly `(0.75)^30`, or about 0.018 percent.

The client receives each requested share from peers along with a Merkle proof. It verifies the proofs against the block header. Thirty successful responses do not prove availability with certainty, but they make this particular withholding attack unlikely. Many light clients sampling different positions make coordinated withholding easier to expose. A rollup can use the same layer to publish its transaction data, allowing users to check that the data needed to reconstruct the rollup was published.

## Limitations and risks

DAS gives a probabilistic result, not an absolute guarantee. A small number of samples may miss a strategically withheld set. The security level depends on the number of samples, the erasure code, the amount of data an attacker must hide, and how independently clients choose samples.

Network conditions matter. A share can be unavailable because peers are slow, partitioned, or malicious, even if the producer published it. Conversely, a small group of well-connected peers might answer samples while ordinary users cannot retrieve the full data. Protocols need peer diversity, timeouts, and rules for handling failed requests.

The technique also adds bandwidth and implementation complexity. Sampling clients need to request, verify, and sometimes gossip shares. Nodes that create blocks must generate erasure-coded data and commitments correctly. Faults in the coding or commitment implementation can weaken availability checks.

## Relevant distinctions

Data availability is different from data correctness. DAS can indicate that data is retrievable. It does not prove that transactions follow execution rules or that a rollup's state transition is valid. Validity proofs and fraud proofs address different questions.

DAS is also different from a full node's data download. A full node can reconstruct and inspect all data. A sampling client checks a small random subset for a confidence estimate. Data availability committees offer another approach, where a defined set of members attests that it holds the data. That model can be faster or cheaper, but it trusts the committee's honesty and availability rather than relying mainly on public sampling.
