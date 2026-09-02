---
title: A Deep Dive Into Rollups for Ethereum Scaling
image: /images/bilge-tekin-GiATUqz4NYY-unsplash.jpg
data-ai-hint: ethereum scaling rollup
description: >-
  Rollups execute transactions off chain and post data to Ethereum for security.
  Learn how optimistic and ZK rollups work, their trade-offs, and how to choose
  and use them.
category: Technology Deep Dives
publishedDate: '2026-03-11'
lastUpdated: "2026-08-28"
---

Rollups are Ethereum's main scaling method today. A rollup runs transactions off chain, then posts the data to Ethereum. Ethereum checks the data and holds the canonical state. You get higher throughput and lower fees, with security tied to Ethereum.

## What a rollup is

A rollup is a separate chain that settles on Ethereum. It executes transactions on its own virtual machine. It batches those transactions, compresses them, and publishes the data to Ethereum. Ethereum stores the batch, tracks the rollup's state root, and enforces the rules for withdrawals and disputes.

If the rollup fails or an operator disappears, anyone can rebuild the rollup state from the data on Ethereum. That is what separates a rollup from a sidechain or a validium, which keep data elsewhere and do not inherit the same guarantees.

## Who this guide is for

* **Users who pay gas:** You want cheaper swaps, mints, and transfers without leaving Ethereum's security. Rollups are where most low-fee activity now happens.
* **Developers shipping apps:** You need to decide where to deploy. Your choice affects tooling, gas costs, withdrawal time, and proof assumptions.
* **Teams evaluating risk:** You need to understand data availability, sequencer control, and bridge finality before you move funds or sign a deployment.

If you only use Ethereum mainnet today, this guide helps you know when to move to a rollup and which type fits your use case.

## How rollups work: the shared foundation

All rollups share the same basic flow. The difference is how Ethereum decides a state update is valid.

### Step by step

1. **Submit.** You send a transaction to the rollup. Most rollups use a sequencer, a single operator that orders transactions and gives you a fast soft confirmation in seconds.
2. **Execute off chain.** The rollup executes the transaction on its Layer 2 virtual machine and updates its state tree. The state is stored as a Merkle tree. The root of that tree is the compact fingerprint of all accounts, balances, and code at that point.
3. **Batch and compress.** The sequencer groups hundreds or thousands of transactions into a batch. It compresses the batch. Arbitrum documents use of Brotli for this step. The goal is to reduce the bytes you must pay to publish.
4. **Post data to Ethereum.** The batch poster sends the compressed batch to Ethereum. Since March 2024 it can use blob-carrying transactions (type 3) introduced by EIP-4844. Each blob holds 4096 field elements of 32 bytes, about 128 KiB usable per blob. Ethereum targets 3 blobs per block (about 0.375 MB) and allows up to 6 (about 0.75 MB). Blobs are kept by consensus nodes for about 4096 epochs, roughly 18 days, then pruned. Before blobs, rollups used calldata at 16 gas per non-zero byte and 4 gas per zero byte.
5. **Commit state.** The rollup contract on Ethereum stores the new state root and the batch root. The state root commits to the new Layer 2 state. The batch root lets anyone prove a specific transaction was included.
6. **Prove or allow a challenge.** This step splits by rollup type. An optimistic rollup opens a challenge period. A ZK-rollup submits a validity proof that Ethereum verifies.

After step 6, Ethereum considers the state update settled. Bridges then use that settled root to complete deposits and withdrawals.

### Data availability and settlement

Ethereum provides two guarantees for rollups:

* **Data availability.** Batch data lives on Ethereum so anyone can re-derive the rollup chain. Without this, a challenger cannot build a fraud proof and a user cannot prove a withdrawal.
* **Settlement.** The rollup bridge and proof contracts live on Ethereum. Final withdrawals and cross-chain messages are only safe once Ethereum accepts the rollup block that contains them.

### What EIP-4844 changed

EIP-4844 is Proto-Danksharding. It went live with the Dencun upgrade on March 13, 2024. It added the blob transaction type and a separate blob fee market. More than 90 percent of rollup cost before the upgrade came from posting data. Research on the first 180,000 blocks before and after Dencun measured a 71 percent drop in total fees paid by rollups and a 54 percent drop in gas used for data posting, with total data posted rising as rollups posted more often. Optimistic rollups shifted more sharply to blobs than ZK-rollups, because ZK batches still include proof verification data that must stay in calldata.

The change is not the end state. The next step is full Danksharding with data availability sampling (DAS) and proposer-builder separation (PBS). The Ethereum roadmap describes it as a further 100 to 1000x scale up in blob space, with the goal of sub-cent transactions across many rollups. Work is in progress.

## Optimistic rollups: how they work

Optimistic rollups assume a batch is valid unless someone proves it is not. The model is often called innocent until proven guilty.

### Step by step on an optimistic rollup

1. The sequencer posts a batch and claims a new state root. It does not include a validity proof.
2. The claim enters a challenge period. On OP Stack chains the withdrawal finality delay is 604,800 seconds, 7 days, enforced in the OptimismPortal. The dispute game itself has a 3.5 day finality delay. On Arbitrum One under BoLD, the confirmation period is 6.4 days, about 45,818 L1 blocks, with an additional grace and bonding logic that bounds disputes to that window.
3. Any node that keeps a copy of the rollup state can check the claim. If it disagrees, it posts a fraud proof.
4. Ethereum acts as referee. Modern designs use multi-round interactive proving with bisection. The asserter and challenger split the disputed execution in half repeatedly until they isolate a single step. Ethereum then runs a one-step proof, in Arbitrum's case a WASM/WAVM step inside a contract, and slashes the loser. The winner's bond is partly rewarded, partly burned to reduce collusion.
5. If no valid challenge succeeds before the period ends, Ethereum accepts the state root. Bridges can then finalize withdrawals.

During the challenge window, anyone can keep building on top of an unconfirmed root, but those later blocks can be reverted if their parent is found invalid.

### Fraud proofs in practice

Older single-round designs required re-executing the whole disputed transaction on L1 and publishing per-transaction state commitments, which was gas heavy. Multi-round bisection reduces on chain work to one step and avoids publishing intermediate commitments for every transaction.

The security assumption is one honest validator. You need at least one party watching the posted data, willing to pay gas to challenge, and able to get its challenge transaction included on Ethereum within the window. If no one watches, an invalid root can finalize. That is why operators must stake a bond, for example Optimism documents a suggested 0.08 ETH initial bond per FaultDisputeGame and roughly 14 ETH locked if you propose hourly across a 7 day window, and Arbitrum One requires a one-time 3600 WETH stake to join as a validator under BoLD.

### Concrete examples

* **Arbitrum One.** The largest optimistic rollup by value locked. Uses the Nitro stack, centralized sequencer operated by Offchain Labs today, BoLD permissionless validation, Brotli batch compression, and EVM equivalence at the bytecode level. Over 99 percent of existing contracts port without changes.
* **OP Mainnet and Base.** OP Mainnet is run by OP Labs. Base is built on the OP Stack by Coinbase. Both use the same fault proof system since the June 2024 permissionless fault proof upgrade. Both moved to blob posting after Dencun.
* **Censorship handling.** If the sequencer censors or goes offline, you can submit through the L1 delayed inbox. On Arbitrum the force inclusion delay is 24 hours, with a newer Censorship Timeout buffer that can shrink that window if the sequencer repeatedly delays messages. On OP Mainnet the equivalent delay is up to 12 hours for L1 to L2 messages.

## ZK-rollups: how they work

ZK-rollups prove validity up front with cryptography. The model is guilty until proven valid.

### Step by step on a ZK-rollup

1. The sequencer or operator executes a batch off chain and groups state diffs, L2 to L1 logs and messages, and compressed bytecode where needed.
2. A prover generates a validity proof for the batch. The proof covers every state transition in the batch, checked against Merkle proofs for sender and receiver accounts.
3. The operator posts the batch data to Ethereum and submits the proof to the verifier contract. For zkSync Era this includes pubdata commitments that the point evaluation precompile checks against the blob's KZG commitment. For Starknet the sequencer posts state diffs as blobs by default since version 0.13.1, with a fallback to calldata if blob fees spike.
4. Ethereum verifies the proof. It checks the pre-state root matches the stored root, the proof is valid, and the claimed post-state root follows. If it passes, Ethereum updates the stored root. No extra challenge period is needed.
5. Bridges complete withdrawals using a Merkle proof against the verified batch root.

### Validity proofs: SNARKs and STARKs

Two proof systems are in production:

* **ZK-SNARKs (Succinct Non-Interactive Argument of Knowledge).** Small proof size and cheap L1 verification, often about 500,000 gas for verification alone. They need a Common Reference String setup. Many deployments use a multi-party ceremony where each participant contributes randomness and then destroys their share. Security holds if at least one participant did so. zkSync Era used PLONK and now uses its Boojum system, a STARK wrapped in a SNARK for cheap L1 verification, with 8 GiB CRS files for the wrapper.
* **ZK-STARKs (Scalable Transparent Argument of Knowledge).** No trusted setup. They use public randomness, scale quasilinearly, and are considered resistant to quantum attacks on ECC assumptions. Proofs are larger and verification can be heavier on L1. Starknet uses STARKs and aggregates many blocks into one proof through SHARP, StarkWare's shared prover, which uses proof recursion so one on chain verification can finalize many blocks.

Both systems share a property: the L1 verifier can confirm correctness without re-running every transaction.

### Concrete examples

* **zkSync Era by Matter Labs.** EVM compatible zkEVM. Publishes pubdata that includes state diffs and logs. Since Dencun it can publish via blobs, with calldata that only holds 144 bytes per blob of versioned hash, opening point, commitment, and KZG proof data needed for the point evaluation precompile.
* **Starknet by StarkWare.** Uses Cairo VM and STARKs. Version 0.13.1 switched to blobs for state diffs, 0.13.3 added stateless compression with a lookup table, and 0.13.4 added stateful compression that indexes repeated contract addresses and storage keys. Uses SHARP aggregation.
* **Polygon zkEVM, Scroll, Linea, Taiko.** Each offers a different point on the zkEVM spectrum. Polygon zkEVM, Scroll, and Linea aim for EVM equivalence or close to it. Taiko positions as a Type 1 zkEVM that aims to match Ethereum's execution exactly. All verify validity proofs on Ethereum before accepting state.

### The zkEVM challenge

Proving simple transfers is straightforward. Proving arbitrary EVM execution is hard. The EVM has many opcodes, gas rules, and state touches in memory, stack, and storage. A zkEVM must recreate that logic inside a circuit and prove each step correctly. That is why full EVM support came later for ZK-rollups than for optimistic rollups, and why prover costs remain the main trade-off.

## Pros and cons at a glance

| Feature | Optimistic rollups | ZK-rollups |
| --- | --- | --- |
| Validation method | Fraud proofs during a challenge window. State accepted unless a valid challenge proves fraud. | Validity proofs verified on L1 before state is accepted. |
| Challenge period | Yes. Typically about 7 days on OP Stack chains, 6.4 days on Arbitrum One under BoLD. | No challenge period. Finality follows proof verification and L1 confirmation. |
| Withdrawal through the canonical bridge | About 7 days. Fast liquidity bridges exist but charge a fee and add their own trust assumptions. | No 7 day wait. Users still wait for batch inclusion, proof generation, and L1 confirmation, often minutes to a few hours. |
| Security model | Cryptoeconomic. Needs at least one honest watcher and bonded sequencer. Misbehavior is penalized by slashing. | Cryptographic. Math guarantees the state transition is valid if the verifier contract accepts the proof. |
| EVM compatibility | High today. Most contracts deploy with little or no change. | Improving fast. zkEVMs now support most Solidity contracts, but edge cases and gas differences remain. Check your specific rollup. |
| Proving cost | Low. Fraud proof computation is done by ordinary nodes. | High. Provers need specialized hardware, often GPUs, and the work is done by a small set of operators today. |
| Data posted to L1 | Full batch data must be on L1 for challengers to check. | Also posts data for reconstruction, but can use stronger compression since validity does not depend on re-execution. |
| Examples | Arbitrum One, OP Mainnet, Base | zkSync Era, Starknet, Polygon zkEVM, Scroll, Linea |

## Trade-offs you should weigh before you choose

**Fees.** On Ethereum's scaling page, rollups are described as roughly 5 to 20 times cheaper than L1 today, with ZK designs aiming for 40 to 100 times cheaper as compression improves and blob space grows. Your actual fee includes three parts: the L1 data cost (blob or calldata), the rollup execution fee, and for ZK the cost to generate and verify the proof spread across the batch. Large batches amortize cost, but posting small batches often can raise your cost.

**Finality for your use case.** If you need to exit to L1 through the canonical bridge, optimistic means a week of waiting. That matters for treasury rebalancing or for apps that must unwind on L1 quickly. Validiums and sidechains offer faster exits but give up Ethereum data availability. Third party bridges that front you the funds on L1 are useful, but they rely on liquidity providers and introduce counterparty risk.

**EVM fit.** For a direct lift of an existing dApp, optimistic is still the fewest changes. For high volume apps where proof cost can be spread over many transactions, ZK can be cheaper per user operation at scale. Starknet's median batch in recent analysis held over 30,000 user operations, compared with about 800 for zkSync Era at that time, which illustrates how aggregation changes the economics.

**Hardware and decentralization.** Running a ZK prover requires high spec machines. That tends to centralize proving today. Optimistic proving is lighter, any full node can challenge with ordinary hardware. Both types still commonly run a centralized sequencer that orders transactions and can earn ordering value. Etherscan and L2Beat track which rollups have open sequencer or prover sets and which still use a permissioned allowlist or a security council that can pause or override.

**Censorship and liveness.** A sequencer can delay or reorder your transaction until you use force inclusion through L1. That delay costs you time, not safety, because you can still force an exit using the data on L1. If a ZK operator stalls, you can also force an exit if the rollup contract allows it. Check whether your chosen rollup has escape hatches enabled and how long they take.

## How to get started

### If you are a user

1. **Pick a rollup that matches your app.** Use [L2Beat](https://l2beat.com) and the project's docs. For general DeFi and NFTs, Arbitrum One, OP Mainnet, or Base are common. For apps that prize fast canonical withdrawals, look at zkSync Era or Starknet.
2. **Add the network to your wallet.** All of these rollups use Ethereum addresses. Add the RPC from the official docs or via chainlist. Fund it with a bridge. The canonical bridge is the safest but respects the withdrawal delay. For the first deposit, start with a small amount.
3. **Track finality.** A fast confirmation from the sequencer is not L1 finality. If you plan to bridge back to L1 soon, check the rollup explorer for batch posting status. For optimistic you will see the 7 day window, for ZK you will see when the validity proof is verified.
4. **Choose your bridge deliberately.** Canonical bridges are secured by the rollup's Ethereum contracts. Third party bridges and aggregators are faster for optimistic withdrawals but add fees and separate risk. Do not put more through them than you can afford to wait on if they pause.
5. **Watch blob fees.** After Dencun, blob base fees are the key cost lever. Explorers show pending blobs per block. High demand can raise blob fees, and Starknet notes it can fall back to calldata when blobs are expensive.

### If you are a developer

1. **Deploy as you would on Ethereum where equivalence is high.** On Arbitrum and OP Stack you can usually deploy compiled Solidity with Hardhat or Foundry unchanged. Test gas and calldata use specifically. The rollup charges an L1 data fee that reflects what you publish.
2. **Adapt for ZK constraints.** On zkSync Era, Starknet, Scroll, or Linea, run the project's compiler and test suite. On Starknet you write in Cairo. On zkSync you use its zksolc path. Measure proof-related limits like maximum batch size and pubdata overhead per blob.
3. **Handle cross chain timing.** L1 to L2 messages take minutes. L2 to L1 messages from optimistic rollups take about a week via the canonical path. Do not build logic that assumes a synchronous call back.
4. **Plan for sequencer downtime.** Add a UI path that submits through L1 if the sequencer does not include a transaction. Test force inclusion on testnet so support can guide users.
5. **Audit bridge assumptions.** Keep custody logic on Ethereum. Use the rollup's official bridge contracts for high value exits. If you use a liquidity provider, bound your exposure.

## Rollup risks and where decentralization is still in progress

Rollups inherit Ethereum security only when data is on Ethereum and the proof or fraud system is live and permissionless. Many rollups still operate with a single sequencer and a small prover set with upgrade keys held by a multisig or council that can pause the bridge. L2Beat flags these as stage 0 or stage 1 systems for a reason. This is not a flaw unique to one team, it is the staged path most teams are on. Assume sequencer control until the docs show it is decentralized, and review upgrade delays and guardian roles before you lock large value.

A second risk is cost volatility. Blob space is limited to 3 target and 6 maximum blobs per block. If many rollups compete for that space, blob fees rise. Sequencers decide between blobs and calldata based on that fee, which changes your L2 fee from block to block.

A third risk is proof system bugs. Optimistic systems depend on correct bisection and one-step logic. ZK systems depend on correct circuits and verifier contracts. Both have been audited, but both have had fixes. Keep a watch list for upgrades.

## FAQ

**Why not just make Ethereum blocks bigger?**
Bigger blocks need larger nodes and more specialized hardware. That reduces the number of people who can run a node and hurts decentralization. Rollups keep Ethereum's base layer small and secure while adding throughput in a separate layer that still settles on Ethereum.

**How is a rollup different from a sidechain or a validium?**
A rollup publishes batch data to Ethereum and Ethereum enforces validity. A sidechain runs its own consensus and does not publish data to Ethereum, so it has separate security. A validium publishes a validity proof to Ethereum but keeps data off Ethereum, so you must trust its data holders to remain available.

**Why do optimistic rollups make you wait 7 days?**
To give any watcher time to post a fraud proof and get it included on Ethereum, even if the attacker tries to censor challenges. Seven days, or 6.4 days under Arbitrum BoLD, is a policy choice that balances user wait time against censorship risk. Shorter windows are possible via extra bridges, but they move the trust elsewhere.

**Are ZK-rollup withdrawals instant?**
No. They skip the 7 day challenge window, but you still wait for your transaction to be included in a batch, for the prover to generate the proof, for the proof to be verified on Ethereum, and for the bridge message to be relayed. That is usually minutes to a few hours, not seconds, and it depends on batch cadence and L1 load.

**Do rollups lower security?**
A properly operating rollup that posts data to Ethereum and enforces fraud or validity proofs is more secure than a sidechain, but it is not identical to using L1 directly. You add dependence on sequencer liveness, proof correctness, and bridge contracts. Check the rollup's stage, audit history, and upgrade mechanism.

**What are blobs and how long do they stay?**
Blobs are 128 KiB binary fields carried in type 3 transactions. They are not kept in Ethereum's execution state. Consensus nodes hold them for about 18 days, then prune. Rollup operators and indexers that need longer history must store and serve the data themselves.

**Which rollup should I pick today?**
Pick by your constraint. If you need the fewest code changes and broad tooling, use an optimistic rollup like Arbitrum One or an OP Stack chain. If you need faster canonical exits and can handle zk tooling or Cairo, use a ZK-rollup like zkSync Era or Starknet. Check current fees on an L2 fee tracker, and verify the rollup's data availability is on Ethereum, not external.
