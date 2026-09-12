---
title: Starknet's 2024 Upgrade Added Parallel Execution
description: >-
  Starknet's v0.13.2 mainnet upgrade, deployed on August 28, 2024, introduced
  optimistic parallelization in the sequencer for independent transactions.
image: >-
  /api/og?type=article&title=Starknet%27s%202024%20Upgrade%20Added%20Parallel%20Execution
category: News
data-ai-hint: starknet parallel execution blockchain
publishedDate: '2026-09-12'
lastUpdated: '2026-09-12'
ogTitle: STARKNET ENABLES OPTIMISTIC PARALLEL EXECUTION
---

Starknet's v0.13.2 upgrade went live on mainnet on Aug. 28, 2024. The network's [version notes](https://docs.starknet.io/resources/version-notes/) list "optimistic parallelization in the sequencer" among the release's changes.

In its [v0.13.2 announcement](https://www.starknet.io/blog/bolt-version-upgrade/), Starknet said the feature lets the sequencer execute independent transactions simultaneously instead of processing every transaction sequentially. Its example contrasts two unrelated transfers with two transactions in which one depends on the result of the other.

The same release paired parallel execution with block packing, a separate change intended to reduce fixed Layer 1 costs and shorten confirmation times. The upgrade announcement describes parallel execution as increasing execution capacity; it does not publish a general latency reduction figure attributable to parallel execution alone.

Starknet's documentation identifies the underlying approach as optimistic parallelization. The cited [specifications repository](https://github.com/starkware-libs/starknet-specs) publishes the network's JSON-RPC, wallet, proving and peer-to-peer specifications; it is not a release announcement or a specification of the sequencer's parallel-execution implementation.
