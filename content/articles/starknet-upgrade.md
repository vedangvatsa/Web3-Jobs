---
title: Starknet Activates Parallel Execution to Reduce L2 Transaction Latency
description: Starknet has deployed parallel transaction execution to its mainnet sequencer, enabling non-conflicting state changes to process concurrently rather than sequentially.
image: /api/og?type=article&title=Starknet%20Activates%20Parallel%20Execution%20to%20Reduce%20L2%20Transaction%20Latency
category: News
data-ai-hint: starknet parallel execution blockchain
publishedDate: '2026-09-12'
lastUpdated: '2026-09-12'
---

Starknet core developers have enabled parallel transaction execution on the network's mainnet sequencer, allowing independent transactions to process simultaneously rather than in single-file order. The change updates the Starknet sequencer engine to analyze state access dependencies before execution, running non-overlapping calls across multiple worker threads. Starkware published the technical release details in its [specifications repository](https://github.com/starkware-libs/starknet-specs).

For Layer-2 scaling, the update targets bottlenecked block production during high-volume network events. Under single-threaded execution, transactions that touch unrelated smart contract states (such as separate token transfers or distinct NFT mints) had to wait for preceding transactions to complete. The parallel engine uses an optimistic execution algorithm to execute incoming transactions concurrently, validating state diffs afterward and re-executing any transaction that encounters a collision with a prior state write.

Starkware reported that parallel execution reduces latency for block inclusion while maintaining deterministic state updates for validators. The implementation preserves full equivalence with Cairo VM execution rules, ensuring that contracts written in Cairo do not require code changes or redeployment to benefit from parallelized processing.

![High performance enterprise server data center](https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Data_center_server_racks.jpg/1200px-Data_center_server_racks.jpg)

*High-performance enterprise server racks. Starknet's mainnet sequencer update enables multi-threaded parallel execution across node hardware worker pools. Photo via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Data_center_server_racks.jpg).*

## Sequencer architecture and collision handling

The update alters how the Starknet sequencer handles pending block transactions. Before parallel execution, the sequencer processed block transactions sequentially through a single Cairo VM instance. Under the revised pipeline, an orchestrator thread distributes transactions to a pool of worker instances, each running an independent execution attempt against the current block state.

If two transactions in the same execution batch attempt to read or modify the same storage key, the sequencer detects a dependency conflict during the post-execution validation phase. The conflicting transaction is aborted, rolled back, and re-queued for execution against the updated state left by the preceding transaction. Starkware noted that transactions interacting with popular liquidity pools or high-demand mint contracts will naturally fallback to sequential processing due to storage collisions, while isolated peer-to-peer transfers and distinct application calls run fully parallelized.

The execution upgrade accompanies memory layout optimizations in the block builder, reducing overall memory overhead per transaction. Starkware said the changes prepare the network for higher throughput benchmarks planned in subsequent protocol releases.
