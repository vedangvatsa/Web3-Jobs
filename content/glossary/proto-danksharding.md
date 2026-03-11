---
term: "Proto-Danksharding"
slug: "proto-danksharding"
category: "technical"
difficulty: "Advanced"
image: "https://images.unsplash.com/photo-1599321753519-a4b4f0cf3947?w=1200&q=80"
description: "An Ethereum upgrade (EIP-4844) that introduces blob-carrying transactions to reduce rollup data costs, serving as a stepping stone to full danksharding."
relatedTerms: ["eip-4844", "data-availability", "rollup", "scaling"]
synonyms: ["EIP-4844", "blob transactions", "proto-sharding"]
---

Proto-Danksharding refers to Ethereum's EIP-4844 upgrade that introduced blob-carrying transactions, a new data type specifically designed to reduce costs for layer 2 rollups. Unlike traditional calldata that competes for block space with regular transactions, blobs provide dedicated temporary storage that validators do not need to process permanently, making data availability substantially cheaper. Following the Dencun upgrade in March 2024, rollups like Arbitrum and Optimism experienced transaction fee reductions of over 90 percent according to L2Beat, transforming the economics of scaling solutions built on Ethereum. Blobs are stored for approximately 18 days before being pruned, which is sufficient for rollups to finalize their state while avoiding permanent blockchain bloat. This upgrade serves as a stepping stone toward full danksharding, which will expand data availability capacity through data availability sampling across multiple shards. Professionals who understand proto-danksharding mechanics are increasingly sought after for roles in rollup development, infrastructure optimization, and blockchain scaling research.

## How Proto-Danksharding Works

Core mechanics:

**Blob Transactions**: New transaction type carrying data blobs.

**Separate Fee Market**: Blob fees separate from regular gas fees.

**Temporary Storage**: Blobs stored temporarily (not permanently in state).

**DA for Rollups**: Rollups post data in blobs instead of calldata.

Proto-danksharding reduces DA costs.

## Benefits for Rollups

Impact:

**Lower Fees**: Blob data cheaper, lowering L2 fees.

**Higher Throughput**: More data capacity for rollups.

**Scalability**: Rollups can scale without saturating L1.

Proto-danksharding directly benefits L2 ecosystems.

## EIP-4844 Overview

Key features:

**New Blob Space**: Separate data space for rollups.

**KZG Commitments**: Cryptographic commitments to blob data.

**Blob Fee Market**: Independent fee market for blob data.

EIP-4844 is core to proto-danksharding.

## Tradeoffs

Considerations:

**Temporary Data**: Blob data pruned after set period.

**Node Requirements**: Nodes must handle blob data temporarily.

**Complexity**: Adds new transaction type and fee market.

Proto-danksharding adds complexity but large scaling benefits.

## Career Opportunities

Scaling roles:

**Protocol Engineers** earn $130,000-$320,000+.

**Rollup Engineers** earn $130,000-$320,000+.

**Research Engineers** earn $140,000-$340,000+.

## Best Practices

Building with blobs:

**Track Blob Fees**: Monitor blob fee market.

**Optimize Data**: Compress rollup data for blob efficiency.

**Handle Pruning**: Design rollups assuming blob data is temporary.

## The Future of Danksharding

Trends:

**Full Danksharding**: More blob capacity and sampling.

**DA Sampling**: DAS will become key for scalability.

**More Rollups**: Rollup adoption accelerates with cheaper DA.

## Cheap Data Availability for Rollups

Proto-danksharding is a major Ethereum scaling milestone enabling cheaper rollup data. Understanding it is crucial for L2 economics. If you’re interested in scaling, explore [scaling careers](/) at rollup teams.
