---
title: How DAG-Based Blockchains Differ From Traditional Chains
image: /images/nasa-Q1p7bh3SHj8-unsplash.jpg
data-ai-hint: dag blockchain network
description: >-
  A technical comparison of directed acyclic graph ledgers and linear
  blockchains, including transaction ordering, finality, security, and use cases.
category: Technology Deep Dives
publishedDate: '2026-03-11'
lastUpdated: '2026-09-12'
---

A directed acyclic graph (DAG) ledger records objects such as transactions, blocks, or events as vertices in a graph. A new vertex references earlier vertices, and those references point in one direction only. The graph cannot contain a path that returns to its starting vertex. A conventional blockchain also uses hashes to link history, but it normally selects one chain of blocks as the canonical history. That distinction changes how a network admits concurrent work, resolves conflicts, and tells an application that a result is final.

The terminology needs care. A DAG is a data structure, not a consensus algorithm. Two systems can both use DAGs while making very different choices about who proposes data, which messages count as votes, how conflicts are decided, and whether execution has a single order. Likewise, a protocol may use a DAG internally and still expose a linear sequence of blocks to smart contracts. The [NIST glossary definition of a blockchain](https://csrc.nist.gov/glossary/term/blockchain) describes the familiar model as a distributed digital ledger of cryptographically signed transactions grouped into blocks; it does not make a linked-list-shaped history the sole possible ledger design.

This article is for developers, product teams, and protocol researchers comparing ledger architectures. The useful question is not whether DAGs are "faster than blockchains." It is which ordering and security properties an application requires, and what a particular protocol must add to supply them.

## Linear blockchains choose one history

In a typical chain, transactions enter a mempool, a producer packages some of them into a block, and the block contains a cryptographic reference to its parent. Competing blocks can briefly exist at the same height. The consensus protocol chooses one branch, and nodes treat blocks on the other branch as orphaned or non-canonical. Bitcoin's original design describes this as a proof-of-work chain in which the valid history is the chain with the most accumulated work; participants wait for later blocks because each added block makes reversing the earlier one more expensive ([Nakamoto, 2008](https://bitcoin.org/bitcoin.pdf)).

This construction gives the ledger a total order at the block level: every accepted block has one predecessor and one position in the selected chain. Transactions within a block also have an explicit order. That order is valuable when two valid-looking operations compete for the same state. If Alice tries to spend the same unspent output twice, only the transaction that appears in the accepted history can consume it. If two contracts write the same storage slot, deterministic execution can apply one transaction before the other.

"One block after another" does not mean every task on a blockchain is serial. Nodes can validate signatures and execute independent transactions in parallel, and rollups can batch work before settling it to a base chain. The protocol still needs a canonical ordering point for state-changing transactions. Block size, block interval, propagation delay, and the work each node must verify impose practical throughput limits. Raising a block's capacity can increase bandwidth, storage, validation costs, and the chance that producers build on stale blocks.

Finality on a linear chain depends on the consensus family. Bitcoin offers probabilistic finality: a sufficiently deep payment becomes increasingly unlikely to be reorganized, rather than becoming mathematically irreversible at a fixed height. Proof-of-stake protocols often add a finality gadget or quorum voting. Ethereum distinguishes a block's head from checkpoint finalization; under its normal assumptions, finalization requires votes from at least two-thirds of the active stake and prevents conflicting finalized checkpoints without slashable behavior ([Ethereum proof-of-stake documentation](https://ethereum.org/developers/docs/consensus-mechanisms/pos/)). Applications therefore choose confirmation rules according to the chain and the cost of reversal.

## A DAG preserves causality, not automatically one order

In a DAG ledger, a vertex may reference several parents, and several new vertices may be created without waiting for one shared tip. The links establish a partial order. If vertex C references B and B references A, C is causally later than A and B. But two vertices created independently may be incomparable: neither is an ancestor of the other. Both can be valid entries in the graph.

That difference makes concurrent data easy to represent. A protocol can accept messages or blocks arriving from different peers and connect them once their parents are available, instead of discarding every branch outside one immediate chain tip. The graph can also carry more information about what a node had observed when it created a vertex. It does not, by itself, decide whether two incomparable transactions conflict or which should execute first.

There are two common shapes. In a transaction DAG, each transaction is a vertex that approves or references earlier transactions. IOTA's original Tangle paper is an example: it describes a transaction as approving two earlier transactions and uses cumulative weight to express subsequent approval ([Popov, 2018](https://doi.org/10.13140/RG.2.2.10492.18566)). In a block DAG, vertices are blocks that can contain many transactions. Multiple blocks can be produced concurrently, then the protocol uses the graph and votes or a deterministic rule to select an order. The [GHOSTDAG paper](https://eprint.iacr.org/2018/104) studies a block-DAG protocol that orders a selected set of blocks while accounting for blocks created during network delay.

Account-chain designs are related but deserve a separate label. Nano's [protocol documentation](https://docs.nano.org/protocol-design/ledger/) describes a block-lattice in which every account has its own chain. Each account chain gives a local sequence for that account, while a receive block references a send block. A fork within one account chain is resolved by representative voting. That is not the same mechanism as a transaction DAG in which every new transaction validates arbitrary tips, even though both depart from one global chain.

## Ordering is an application requirement

Some applications need only causal relationships. Recording device readings, anchoring document timestamps, or distributing independent payments can tolerate concurrent entries if the protocol reliably rejects duplicates and eventually settles conflicts. A DAG is a natural representation for that workload because independent operations need not wait behind a global sequencer merely to be recorded.

General-purpose smart contracts have a harder requirement. Contract calls commonly read and write shared state, emit events, depend on nonces, and may call other contracts. Consider two swaps against the same automated market maker pool. Executing swap A then B produces a different price and output than executing B then A. A network must give every honest node the same result, so it needs a deterministic total order for conflicting operations, or a concurrency-control model that produces an equivalent deterministic outcome.

This is why a DAG protocol can still have an ordering layer. Hedera Hashgraph, for example, uses a gossip-about-gossip graph and virtual voting to establish consensus timestamps and order; its [technical documentation](https://docs.hedera.com/hedera/core-concepts/hashgraph-consensus-algorithms) describes the resulting order rather than asking applications to interpret an unordered graph. Other systems choose a preferred set of DAG vertices and apply a topological ordering, breaking ties with a deterministic rule. The graph supplies relationships and evidence; consensus supplies the rule that turns them into a ledger state.

Ordering also involves fairness. A deterministic tie-breaker is necessary for replicas to agree, but it does not prove that the order is neutral. A block producer, a transaction relay, or an ordering committee may see one transaction before another and may be able to delay, insert, or reorder messages within protocol rules. DAGs reduce one source of waiting, but they do not remove maximum extractable value, censorship, or network-topology concerns.

## Finality and security come from the protocol around the graph

Hash pointers make tampering evident: changing an old vertex changes its identifier and invalidates descendants that commit to it. They do not make an honest history win. A network also needs Sybil resistance and a rule for accepting, rejecting, or resolving conflicting vertices. Proof of work, staked voting, delegated representatives, permissioned membership, and Byzantine-fault-tolerant (BFT) voting are different ways to obtain that rule.

For BFT-style systems, the essential threshold and network assumptions should be explicit. The classic [Practical Byzantine Fault Tolerance paper](https://www.usenix.org/legacy/publications/library/proceedings/osdi99/full_papers/castro/castro.pdf) shows agreement among replicas under partial synchrony when fewer than one-third of replicas are Byzantine, with authenticated messages and an appropriate quorum protocol. Modern DAG BFT protocols use the graph to disseminate causally related messages while retaining quorum certificates or votes to commit decisions. For example, [Narwhal and Tusk](https://arxiv.org/abs/2105.11827) separate a DAG-based data-dissemination layer from asynchronous consensus. Their design illustrates the point: efficient availability of batches is not identical to agreement on their order.

Transaction-DAG designs face a distinct bootstrap issue. If approval weight or confirmation confidence depends on honest future activity, sparse traffic can leave honest vertices with less timely support and can make attacker-generated activity more influential. A protocol may address this with stake-weighted voting, rate controls, mana or reputation-like resources, coordinators during an early phase, or a separate consensus layer. Those choices must be evaluated from the current protocol specification, not inferred from the word "DAG." Protocols also change: IOTA's [current architecture documentation](https://docs.iota.org/about-iota/iota-architecture) specifies consensus and sequencing for transactions that modify shared objects, so historical Tangle descriptions are not a substitute for the current design.

Finality language also varies. Some DAG systems provide deterministic finality once a quorum certificate is formed. Others provide a confidence score, a preferred branch, or economic finality that becomes stronger with later activity. Engineers should ask four concrete questions: what event marks a transaction final; what assumptions make that event safe; how long does it normally take; and what penalty or cost applies if validators equivocate? A dashboard's "confirmed" label is not enough to answer them.

## Performance gains have costs

DAGs can improve utilization when a network receives many independent transactions or blocks at once. Instead of treating all concurrent blocks as wasted, a block-DAG protocol may retain useful data from them. Parallel admission can also reduce the queueing delay caused by waiting for the next block. These are potential design benefits, not a universal throughput guarantee. Every full participant still has to receive, store, validate, and in many systems execute the relevant data.

The main trade-offs are operational and economic:

- **State conflicts still serialize.** A DAG can represent independent work concurrently, but hot accounts, popular pools, and a shared contract state force contention somewhere in execution or ordering.
- **Networking becomes part of the security budget.** More concurrent vertices increase metadata, parent retrieval, duplicate suppression, and anti-spam requirements. Nodes with weaker connectivity can learn the graph later and may disagree temporarily about its frontier.
- **Graph maintenance is not free.** Nodes need rules for missing parents, tips, pruning, snapshots, and the set of vertices that are eligible for consensus. A simple chain tip is easier to explain and audit than a large live graph.
- **Fee-free does not mean cost-free.** Signature checks, bandwidth, storage, and execution consume resources. Networks without per-transaction fees still need an admission-control mechanism, such as rate limits, resource credits, staking, proof of work, or a subsidy, to resist spam.
- **Decentralization depends on participation rules.** A permissioned council can reach low-latency BFT finality with a known validator set. A permissionless system must also make validator entry, Sybil resistance, and data availability work under adversarial conditions. The DAG shape alone says little about those properties.

## When a DAG design fits

A DAG-oriented ledger can fit high-volume, mostly independent events where rapid admission and causal references are useful: machine-to-machine payments, supply-chain attestations, telemetry commitments, or exchanges of small digital goods. It can also fit a protocol whose internal consensus wants to disseminate transaction batches before choosing their final order. In both cases, the team should measure end-to-end confirmation, conflict resolution, node cost, and recovery behavior under loss and congestion rather than relying on nominal transactions-per-second figures.

A conventional linear chain remains a straightforward choice when an application needs a widely understood canonical order, has frequent shared-state conflicts, or relies on an established execution environment and security budget. This does not make it technically inferior. A globally replicated ordered state machine is intentionally restrictive because the restriction makes state transitions deterministic and independently verifiable.

The practical selection criterion is the guarantee, not the graph. For each candidate network, document its transaction data model, conflict rule, ordering rule, finality condition, validator assumptions, fee or spam-control mechanism, and the consequences of a network partition. A DAG can be the right substrate for a ledger, but it becomes a usable distributed system only through those surrounding rules.

## FAQ

### Is a DAG a blockchain?

Usually, no in the narrow structural sense: a conventional blockchain selects one parent-linked sequence of blocks, while a DAG permits multiple parent references and concurrent branches. In broad industry usage, both may be called distributed-ledger technologies. The protocol's consensus and execution semantics are more informative than the label.

### Do DAG ledgers remove transaction fees?

No. Some protocols charge no explicit per-transaction fee, but each transaction consumes network resources. A secure public network still needs a way to limit spam and allocate those resources. The mechanism may be a fee, staking requirement, rate control, proof of work, or another protocol-specific rule.

### Can a DAG support smart contracts?

Yes, but concurrent graph insertion does not eliminate the need for deterministic handling of shared state. A smart-contract DAG network commonly adds consensus ordering, partitions state, restricts transaction interactions, or uses a deterministic concurrency-control method. Check how the specific protocol handles conflicting calls before treating parallel data ingestion as parallel contract execution.

### Are DAGs more secure than traditional blockchains?

Neither structure is categorically more secure. Security follows from the adversary model, validator or miner incentives, quorum thresholds, network assumptions, implementation quality, and the protocol's conflict-resolution rule. A sound comparison must name those mechanisms for the two networks being evaluated.
