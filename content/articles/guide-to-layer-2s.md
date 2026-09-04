---
title: A Guide to Ethereum Layer 2 Scaling Solutions
description: >-
  Ethereum Layer 2 rollups run transactions off chain and post data to Ethereum
  for security. Learn how optimistic and ZK rollups work, what they cost, their
  trade-offs, and how to choose and use them.
category: Technology Deep Dives
data-ai-hint: blockchain ethereum
publishedDate: '2026-03-11'
lastUpdated: "2026-09-04"
---
## What Layer 2 scaling is

Layer 2 (L2) is a separate chain that runs on top of Ethereum. It executes transactions off chain, then posts the data back to Ethereum. Ethereum checks the data and holds the final state, so the L2 inherits Ethereum security while offering higher throughput and lower fees.

This is different from an alt L1 like Solana or Avalanche, which secures itself with its own validators, and from a sidechain, which runs its own consensus and does not post data to Ethereum.

## Who this guide is for

* **Users who pay gas:** You want cheaper swaps, mints, and transfers without leaving Ethereum security. Most low-fee Ethereum activity now happens on L2s.
* **Developers shipping apps:** You need to choose where to deploy. Your choice affects tooling, fees, withdrawal time, and trust assumptions.
* **Teams evaluating risk:** You need to understand data availability, sequencer control, and bridge finality before you move funds or commit to a stack.

If you use only Ethereum mainnet today, this guide helps you decide when to move and which type of rollup fits your use case.

## Why Ethereum needs Layer 2

Ethereum prioritizes decentralization and security, which limits base layer throughput. The trilemma, described by Vitalik Buterin, states that a simple chain design can only maximize two of three properties: decentralization, security, and scalability. Ethereum chose to keep blocks small enough that regular hardware can verify them, to preserve decentralization.

On mainnet this means roughly 15 transactions per second and variable gas fees that spike with demand. The community chose a rollup-centric roadmap instead of simply raising the gas limit. Rollups keep the base layer focused on settlement and data availability, and move execution to L2s where it can scale.

Other scaling designs exist, but they do not inherit the same guarantees. Sidechains and validiums keep data off Ethereum. They can be cheaper but require you to trust their own data holders and consensus. A rollup posts batch data to Ethereum so anyone can reconstruct the chain and check correctness.

## How rollups work: the shared foundation

All rollups share the same basic flow. The difference is how Ethereum decides a state update is valid.

### Step by step

1. **Submit.** You send a transaction to the L2. Most L2s use a sequencer, a single operator that orders transactions and gives you a fast soft confirmation in seconds.
2. **Execute off chain.** The L2 runs the transaction in its own virtual machine and updates its state tree. State is stored as a Merkle tree, and the root of that tree is the compact fingerprint of all accounts and code at that point.
3. **Batch and compress.** The sequencer groups hundreds or thousands of transactions into a batch and compresses it. Ethereum documents a reference example where a basic L1 transfer of about 112 bytes compresses to about 12 bytes on a rollup by removing fields like nonce and signature overhead and using shorter addresses.
4. **Post data to Ethereum.** The batch poster sends the batch to Ethereum. Since the Dencun upgrade on March 13, 2024, rollups can use blob-carrying transactions (type 3) introduced by EIP-4844. Blobs are about 128 KiB usable per blob. Ethereum targets 3 blobs per block and allows up to 6. Blobs are held by consensus nodes for about 4096 epochs, roughly 18 days, then pruned. Rollup operators, exchanges, and indexers that need longer history must store it themselves. Before blobs, rollups used calldata at 16 gas per non-zero byte and 4 gas per zero byte. With blobs, the blob fee market sets the price separately from normal gas.
5. **Commit state.** The rollup contract on Ethereum stores the new state root and the batch root. The state root commits to the new L2 state. The batch root lets anyone prove a specific transaction was included.
6. **Prove or allow a challenge.** Optimistic rollups open a challenge window. ZK rollups submit a validity proof that Ethereum verifies.

After this step, Ethereum considers the state update settled. Bridges use that settled root to complete deposits and withdrawals.

The Fusaka upgrade in December 2025 added PeerDAS, a more efficient way for validators to sample blob availability without downloading full blobs. Ethereum.org notes this as part of scaling to support many more rollups without requiring larger home validators.

### Data availability and settlement

Ethereum provides two guarantees for rollups:

* **Data availability.** Batch data lives on Ethereum so anyone can re-derive the L2 chain. Without this, a challenger cannot build a fraud proof and a user cannot prove a withdrawal.
* **Settlement.** The bridge and proof contracts live on Ethereum. Final withdrawals and cross-chain messages are only safe once Ethereum accepts the rollup block that contains them.

### What EIP-4844 changed

EIP-4844 is Proto-Danksharding. Before it, more than 90 percent of rollup cost came from posting data permanently as calldata. By moving rollup data to temporary blobs, Proto-Danksharding reduced the cost of data posting. Rollups have moved batch submission to blobs since March 2024, which lowered user fees on major L2s. Full Danksharding, with proposer-builder separation and data availability sampling across many more blobs, is the next step toward another 100 to 1000x of scale. Work on it continues.

## Optimistic rollups: assume valid, prove fraud if needed

Optimistic rollups assume a batch is valid unless someone proves it is not. This is often called innocent until proven guilty.

**Live examples:** Arbitrum One, OP Mainnet, and Base. Base is built on the OP Stack, the same open framework that powers OP Mainnet.

### How they run

1. The sequencer posts a batch and claims a new state root. It does not include a validity proof.
2. The claim enters a challenge period. On OP Stack chains the canonical withdrawal period is about 7 days. Arbitrum One under its Bounded Liquidity Delay model uses about 6.4 days. These delays exist to give watchers time to get a challenge included on Ethereum even if the network is busy.
3. Any node that keeps a copy of the L2 state can check the claim. If it disagrees, it posts a fraud proof.
4. Ethereum acts as referee. Modern designs use multi-round interactive proving with bisection. The asserter and challenger split the disputed execution in half repeatedly until they isolate a single step. Ethereum then verifies that one step and penalizes the loser by slashing the bonded stake. Part of the bond can reward the challenger and part is burned to reduce collusion.
5. If no valid challenge succeeds before the period ends, Ethereum accepts the state root. Bridges can then finalize withdrawals.

During the window, later blocks can build on an unconfirmed root, but they can be reverted if their parent is found invalid.

### Security and cost details you should know

* **Bonds and watchers.** Validators must post a bond before they can assert. The security assumption is that at least one honest node is watching the data on Ethereum and is willing to pay gas to challenge. If no one watches, an invalid root can finalize.
* **EVM fit.** Optimistic rollups keep high compatibility with the Ethereum Virtual Machine at the bytecode level. Most existing Solidity contracts port without changes and can use Hardhat, Foundry, and other familiar tools.
* **Throughput.** Ethereum.org estimates optimistic rollups can offer up to 10 to 100 times throughput improvements by compression, with current live implementations often in the range of a few thousand transactions per second when batching is efficient. Your actual throughput depends on data compression and how much blob space is used alongside other traffic.
* **Fees.** Ethereum.org tracks current costs as about 5 to 20 times cheaper than L1 for rollups in general, with fees composed of L1 data publication (blob or calldata) plus L2 execution fees. Check a live fee tracker for the chain you plan to use, since blob base fees change per block.

### Censorship handling

A single sequencer orders transactions today on most optimistic rollups. If it censors or goes offline, you can submit through an L1 delayed inbox so the L2 must include your transaction or stop finalizing. On OP Stack chains this is typically enforced within hours, on Arbitrum One the force inclusion delay is up to 24 hours with additional timeout buffers. This gives you an escape hatch, but it costs time and L1 gas.

## ZK-rollups: prove valid before accepting

ZK-rollups prove validity up front with cryptography. This is often called guilty until proven valid.

**Live examples:** zkSync Era by Matter Labs, Starknet by StarkWare, Polygon zkEVM, Scroll, Taiko, and Linea by Consensys. They sit at different points on the zkEVM spectrum. Taiko aims for full Ethereum equivalence, others trade exact equivalence for easier proving.

### How they run

1. The operator executes a batch off chain and collects state diffs, logs, and messages.
2. A prover generates a validity proof for the batch. The proof covers every state transition in that batch, checked against Merkle proofs for sender and receiver accounts.
3. The operator posts the batch data to Ethereum and submits the proof to the verifier contract. Since Dencun, batch data often goes in blobs, with only small commitments kept in calldata for the point evaluation precompile.
4. Ethereum verifies the proof. It checks the pre-state root matches the stored root, the proof is valid, and the claimed post-state root follows. If it passes, Ethereum updates the stored root. No extra challenge period is needed.
5. Bridges complete withdrawals using a Merkle proof against the verified batch root.

### Proof systems: SNARKs and STARKs

* **ZK-SNARKs (Succinct Non-Interactive Argument of Knowledge).** Small proof size and verification around 500,000 gas on Ethereum. They need a Common Reference String. Most deployments use a multi-party ceremony where each participant contributes randomness and then discards it. Security holds if at least one participant did so.
* **ZK-STARKs (Scalable Transparent Argument of Knowledge).** No trusted setup, use public randomness, and scale more efficiently for large batches. They are considered resistant to quantum attacks on elliptic curve assumptions, but proofs are larger and verification can cost more on L1. Starknet uses STARKs and aggregates many blocks into one proof via its shared prover, so one on-chain verification can finalize many blocks.

Both let the L1 verifier confirm correctness without re-running every transaction. Many teams also use recursion, where a proof verifies other proofs, to finalize multiple blocks with one submission.

### The zkEVM challenge

Proving simple transfers is straightforward. Proving arbitrary EVM execution is hard. The EVM has many opcodes and state touches in memory, stack, and storage. A zkEVM must recreate that logic inside a circuit and prove each step. That is why full EVM support came later for ZK rollups than for optimistic rollups, and why prover costs remain the main trade-off.

## Fees, finality, and scaling numbers you can check

Ethereum.org summarizes the current picture as:

* Rollups today are about 5 to 20 times cheaper than Ethereum L1
* ZK designs aim for about 40 to 100 times cheaper as compression and proving improve
* Future blob expansion targets another 100 to 1000 times of scaling, with a goal of transactions under $0.001

Your actual fee has three parts: the L1 data cost (blob or calldata), the L2 execution fee, and for ZK the amortized cost to generate and verify the proof across the batch. Large batches spread cost, but posting small batches often raises per-transaction cost. Blob base fees rise when many rollups compete for the 3 to 6 blobs per block, and some ZK operators fall back to calldata when blobs are expensive.

For recent network-level fees, Ethereum.org points to its networks page. As of late August 2026 it lists average fees like $0.054 on Ethereum mainnet, $0.002 on Base, $0.005 on Arbitrum One, $0.004 on Starknet, with wide variance by operation and congestion. Use a live L2 fee tracker and the rollup explorer to confirm batch posting status for the transaction you care about.

## Pros and cons at a glance

| Feature | Optimistic rollups | ZK-rollups |
| --- | --- | --- |
| Validation method | Fraud proofs during a challenge window. State accepted unless a valid challenge proves fraud. | Validity proofs verified on L1 before state is accepted. |
| Challenge period | Yes. Typically about 7 days on OP Stack chains, 6.4 days on Arbitrum One. | No challenge period. Finality follows proof verification and L1 confirmation. |
| Withdrawal through the canonical bridge | About 7 days. Fast liquidity bridges exist but charge a fee and add their own trust assumptions. | No 7 day wait. You still wait for batch inclusion, proof generation, and L1 confirmation, often minutes to a few hours. |
| Security model | Cryptoeconomic. Needs at least one honest watcher and bonded sequencer. Misbehavior is penalized by slashing. | Cryptographic. Math guarantees the transition is valid if the verifier contract accepts the proof. |
| EVM compatibility | High today. Most contracts deploy with little or no change. | Improving fast. zkEVMs now support most Solidity, but edge cases and gas differences remain. Starknet uses Cairo, not Solidity. |
| Proving cost | Low. Fraud proof work is done by ordinary nodes. | High. Provers need specialized hardware, often GPUs, and the work is done by a small set of operators today. |
| Data posted to L1 | Full batch data must be on L1 for challengers to check. | Also posts data for reconstruction, but can use stronger compression since validity does not depend on re-execution. |
| Examples | Arbitrum One, OP Mainnet, Base | zkSync Era, Starknet, Polygon zkEVM, Scroll, Linea, Taiko |

## How rollups compare to sidechains and validiums

A sidechain runs its own consensus and does not post data to Ethereum. A validium posts validity proofs to Ethereum but keeps data off chain. Both can be fast and cheap, but they do not inherit Ethereum data availability. That means you must trust their operators and data holders to stay available and honest. Ethereum.org classifies only rollups, which post data to Ethereum and derive security from Ethereum consensus, as Layer 2 in the strict sense. The others are separate scaling approaches with different trust assumptions.

## Trade-offs and risks before you choose

* **Centralized sequencers.** Most L2s today run a single sequencer that orders transactions and can earn ordering value. L2Beat tracks which rollups have permissionless sequencer sets and which still use an allowlist.
* **Proof systems not yet fully open.** Even where fraud or validity proofs are live, the prover set is often small and upgrade keys are held by a multisig or security council that can pause the bridge. L2Beat stages reflect this. Stage 0 means the system still relies on operators, Stage 1 means proofs are live with some safeguards, Stage 2 is the goal of full decentralization.
* **Cost volatility.** Blob space is limited. If many rollups compete for blobs, blob fees rise and your L2 fee changes from block to block.
* **Proof and contract bugs.** Both fraud proof and validity proof code have had fixes. Review audit history and upgrade delays before you lock large value.
* **Bridge assumptions.** Keep custody logic on Ethereum when possible. Use the canonical bridge for large exits. Third party bridges that front funds on L1 are useful but add counterparty risk and fees.

## How to get started

### If you are a user

1. **Pick a rollup that matches your app.** Use L2Beat and the project docs. For general DeFi and NFTs, Arbitrum One, OP Mainnet, or Base are common choices. For apps that need fast canonical withdrawals, look at zkSync Era or Starknet.
2. **Add the network to your wallet.** All of these L2s use Ethereum addresses. Add the RPC from the official docs or via a chain list. Fund it with a bridge. Start with a small test amount.
3. **Track finality.** A fast confirmation from the sequencer is not L1 finality. For optimistic rollups, check the explorer for the batch posting time and the remaining challenge window. For ZK, check when the validity proof is verified.
4. **Choose your bridge deliberately.** Canonical bridges are secured by the L2 contracts on Ethereum. Third party bridges and aggregators are faster for optimistic withdrawals but add fees and separate risk. Do not put more through them than you can afford to wait on if they pause.
5. **Watch blob fees.** After Dencun, blob base fees are the key cost lever. Explorers show pending blobs per block. High demand can raise fees.

### If you are a developer

1. **Deploy as you would on Ethereum where equivalence is high.** On Arbitrum and OP Stack chains you can usually deploy compiled Solidity with Hardhat or Foundry unchanged. Test gas and calldata use specifically, since the L2 charges an L1 data fee that reflects what you publish.
2. **Adapt for ZK constraints.** On zkSync, Scroll, Linea, or Taiko, run the project compiler and test suite. On Starknet you write in Cairo. Measure proof-related limits like maximum batch size and pubdata overhead.
3. **Handle cross chain timing.** L1 to L2 messages take minutes. L2 to L1 messages from optimistic rollups take about a week via the canonical path. Do not build logic that assumes a synchronous call back.
4. **Plan for sequencer downtime.** Add a UI path that submits through L1 if the sequencer does not include a transaction. Test force inclusion on testnet.
5. **Audit bridge assumptions.** Keep high value exits on the canonical bridge. If you use a liquidity provider, bound your exposure.

## FAQ

**Why not just make Ethereum blocks bigger?**
Bigger blocks need larger nodes and more specialized hardware. That reduces the number of people who can run a node and hurts decentralization. Rollups keep the base layer small and secure while adding throughput in a separate layer that still settles on Ethereum.

**How is a rollup different from a sidechain or a validium?**
A rollup publishes batch data to Ethereum and Ethereum enforces validity through fraud or validity proofs. A sidechain runs its own consensus and does not publish data to Ethereum, so it has separate security. A validium publishes proofs to Ethereum but keeps data off Ethereum, so you must trust its data holders.

**Why do optimistic rollups make you wait 7 days to withdraw?**
To give any watcher time to post a fraud proof and get it included on Ethereum, even if an attacker tries to censor challenges. Seven days, or 6.4 days under Arbitrum Bounded Delay, balances user wait time against censorship risk. Shorter exits exist via third party bridges that front the funds, but they move the trust elsewhere.

**Are ZK rollup withdrawals instant?**
No. They skip the 7 day window, but you still wait for your transaction to be included in a batch, for the prover to generate the proof, for the proof to be verified on Ethereum, and for the bridge message to be relayed. That is usually minutes to a few hours, depending on batch cadence and L1 load.

**Do L2s reduce security compared to L1?**
A rollup that posts data to Ethereum and enforces fraud or validity proofs is stronger than a sidechain, but it is not identical to using L1 directly. You add dependence on sequencer liveness, proof correctness, and bridge contracts. Check the rollup stage, audits, and upgrade mechanism before you deposit.

**What are blobs and how long do they stay?**
Blobs are binary fields carried in type 3 transactions. They are not kept in Ethereum execution state. Consensus nodes hold them for about 18 days, then prune. Operators and indexers that need longer history must store it themselves.

**Which rollup should I pick today?**
Pick by your constraint. If you need the fewest code changes and broad tooling, use an optimistic rollup like Arbitrum One or an OP Stack chain. If you need faster canonical exits and can handle zk tooling or Cairo, use a ZK rollup like zkSync Era or Starknet. Check current fees on a fee tracker and confirm data availability is on Ethereum.

---

*Sources: ethereum.org - Scaling, Optimistic Rollups, Zero-Knowledge Rollups, Layer 2, Roadmap Scaling, Roadmap Danksharding, Layer 2 Networks (pages last updated June-August 2026). Specific figures for calldata costs, proof verification, blob lifetimes, Dencun date, and fee multiples are taken from those pages.*

## Verifiable Primary Sources & References

1. [Ethereum EIP-721 Non-Fungible Token Standard Specification](https://eips.ethereum.org/EIPS/eip-721)
2. [Ethereum EIP-1559 Fee Market Change Specification](https://eips.ethereum.org/EIPS/eip-1559)
3. [Ethereum EIP-4844 Proto-Danksharding Specification](https://eips.ethereum.org/EIPS/eip-4844)
4. [Ethereum EIP-712 Typed Structured Data Hashing and Signing](https://eips.ethereum.org/EIPS/eip-712)
5. [Ethereum Official Yellow Paper & Protocol Specification](https://ethereum.github.io/yellowpaper/paper.pdf)
6. [Ethereum Consensus Specs & Proof of Stake Architecture](https://github.com/ethereum/consensus-specs)
7. [Solidity Compiler Official Documentation & Language Spec](https://docs.soliditylang.org/)
8. [Foundry Book Development & Testing Framework Documentation](https://book.getfoundry.sh/)
9. [Hardhat Ethereum Development Environment Documentation](https://hardhat.org/docs)
10. [Curve Finance Automated Market Maker Specification](https://curve.fi/files/stableswap-paper.pdf)
