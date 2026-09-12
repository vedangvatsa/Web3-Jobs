---
title: 'A Deep Dive into Rollups'
image: /images/dell-8pb7Hq539Zw-unsplash.jpg
description: >-
  A full explanation of Layer 2 rollups, including the difference between
  Optimistic and ZK-Rollups, and their important role in the future of.
category: Technology Deep Dives
data-ai-hint: abstract shapes background
publishedDate: '2026-03-11'
lastUpdated: "2026-09-12"
---

## Rollups move execution while retaining Ethereum's settlement role

A rollup is a protocol that executes transactions outside Ethereum's base layer and publishes enough information to Ethereum for the resulting state to be checked or recovered under the rollup's rules. The [Ethereum documentation on rollups](https://ethereum.org/developers/docs/scaling/rollups/) describes the basic objective: reduce the amount of computation Ethereum performs directly while continuing to use Ethereum for data publication and settlement.

Calling every L2 a rollup obscures important differences. A chain can be fast and inexpensive while relying on a multisig, a separate validator set, or off-chain data that Ethereum cannot recover. A rollup's security claims depend on what it posts to Ethereum, how its state transition is verified, who can submit batches, and whether users can exit when ordinary operators fail. Those details are more useful than a throughput number.

## The state transition a rollup is claiming

An Ethereum transaction changes the state according to EVM rules. A rollup performs many such transitions in its own environment, then sends a commitment to L1. The commitment usually includes a new state root, which summarizes the rollup's account and storage state, along with data needed by the protocol. A contract on Ethereum tracks the accepted roots and governs deposits and withdrawals.

The party ordering and submitting transactions is commonly called a sequencer. Centralized sequencing is common in current deployments because it gives quick confirmations and simpler operations. It also creates a liveness dependency: the sequencer can delay a transaction even if it cannot ultimately change a valid state transition. A credible rollup design provides a route for users to submit transactions or withdraw through L1 when the normal path is unavailable. Read a network's documentation for the actual escape mechanism rather than assuming every chain has the same one.

Data availability is separate from validity. If Ethereum receives enough transaction data, independent parties can reconstruct the L2 state and generate a proof or challenge when necessary. If only a state root is posted and the underlying data remains with an operator, users may be unable to determine their balance or force an exit. Ethereum's [data availability overview](https://ethereum.org/developers/docs/data-availability/) explains why publishing data is a central part of the rollup model.

## The cost model changed with blobs

Rollups historically placed transaction data in Ethereum calldata. Calldata is durable and accessible, but it competes with other L1 transaction data and is priced through the main gas market. [EIP-4844](https://eips.ethereum.org/EIPS/eip-4844), activated in the Dencun upgrade, added blob-carrying transactions. Blobs carry rollup data for a limited retention period and use a fee market separate from ordinary execution gas.

Blob data is not directly readable by EVM execution, which helps keep it from becoming general-purpose contract storage. Ethereum nodes retain it for a defined minimum period; EIP-4844 specifies the mechanism and the consensus commitments used to verify it. This makes blobs appropriate for data that a rollup needs while producing or checking its state, not for an application that expects permanent on-chain file storage.

Lower publication costs can reduce an L2 user's fee, but the user fee also includes the L2 execution cost, the sequencer's pricing policy, proof generation where relevant, and demand for blob space. Fee claims should therefore state the time and network being measured. There is no permanent fixed price for a rollup transaction.

## Optimistic rollups accept a claim subject to challenge

Optimistic rollups submit a proposed state transition without a validity proof for every batch. Their L1 contract accepts the claim provisionally. During a challenge period, a participant can dispute an invalid assertion using the protocol's fault-proof system. If the proof succeeds, the invalid claim is rejected and the protocol follows its rules for the responsible bond and state.

The word optimistic refers to this verification timing, not to an assumption that all operators are honest. Security depends on at least one honest, capable party being able to observe assertions and submit a challenge before the deadline. It also depends on the fault-proof implementation, the data needed to recreate the disputed execution, and L1 remaining available. A chain's marketing description cannot replace these conditions.

Modern fault-proof systems may use an interactive game rather than executing an entire batch in a single L1 transaction. Participants narrow a disagreement until the L1 verifier can decide a small instruction or claim. Optimism documents its model and its [fault proofs](https://docs.optimism.io/stack/fault-proofs/index) in detail; Arbitrum documents its [dispute protocol](https://docs.arbitrum.io/how-arbitrum-works/inside-arbitrum-nitro) as part of Nitro. The implementation matters because challenge timing, permissioning, and withdrawal behavior differ.

The challenge period is most visible when withdrawing assets through the canonical bridge to Ethereum. The protocol must wait until a proposed L2 state is no longer challengeable before treating it as finalized on L1. Third-party liquidity providers can offer a faster economic exchange: they pay the user on the destination chain and later claim the canonical withdrawal. That changes the user's counterparty and fee exposure; it does not make the protocol's challenge period disappear.

## Validity rollups prove execution before L1 accepts it

Validity rollups, often called ZK rollups, submit a cryptographic proof that the claimed state transition satisfies the circuit or program accepted by the L1 verifier. The proof can be small relative to the computation it represents, and Ethereum verifies it before accepting the new root. The term zero-knowledge is common in the field, although a validity proof need not make transaction data private. Most general-purpose rollups publish transaction data so the state remains recoverable.

The [ZK proof documentation](https://ethereum.org/developers/docs/scaling/zk-rollups/) gives the high-level distinction: validity proofs establish correctness up front, while optimistic systems provide a window to contest an assertion. A validity-rollup withdrawal can become available after the proof and relevant L1 confirmation are accepted, without an L1 fraud-challenge period. It is still subject to bridge rules, L1 finality, and any operational delay the application adds.

Generating proofs is computationally intensive and requires specialized engineering. The proving system, circuit constraints, trusted setup assumptions where applicable, and verifier contract are all part of the security boundary. Developers should avoid the shorthand that ZK means private or instant. Privacy requires additional design choices about what data is published and who can correlate it. Finality also has a concrete meaning: L2 execution may be confirmed by a sequencer before the associated proof reaches Ethereum.

## EVM equivalence is a compatibility spectrum

Many developers want to deploy Solidity contracts and familiar tooling on an L2. That goal has levels. An EVM-equivalent environment seeks to reproduce Ethereum execution behavior closely. An EVM-compatible environment may support Solidity and bytecode while differing in opcodes, gas accounting, precompiles, transaction types, or system contracts. The distinction appears in edge cases, compiler assumptions, and debugging.

ZK proving makes complete equivalence challenging because the prover must represent EVM operations inside an efficiently provable system. Some networks use a zkEVM; others use a different virtual machine, language, or compilation path. Before deploying, check the network's official compatibility documentation, test contracts on its actual environment, and inspect differences in `block` fields, gas behavior, precompiles, and message passing. A passing unit test on Ethereum mainnet configuration is useful evidence, not a compatibility guarantee.

Optimistic rollups also have differences from L1. System contracts, sequencing behavior, fee payment, and cross-domain messaging are protocol-specific. Treat the target L2 as a target platform with its own release notes and test suite, not as a cheaper RPC URL.

## Bridging is message passing with trust assumptions

A canonical bridge generally locks or burns an asset on one chain and proves a corresponding message on the other. Its contracts, verification method, upgrade authority, and liveness path determine the bridge's risk. Cross-chain bridges are frequent targets because they aggregate assets and combine the security models of multiple systems.

Ethereum's [bridge documentation](https://ethereum.org/developers/docs/bridges/) warns users to consider who validates transactions, who controls upgrades, how long withdrawals take, and whether the bridge has been audited. The same questions apply to developers. A frontend should identify the actual bridge and network rather than presenting an undifferentiated "bridge" button. A token with the same ticker on two chains may be a canonical representation, a third-party wrapped token, or an unrelated asset.

L2-to-L2 transfers often involve at least two bridges or a liquidity network. Their quick user experience may be valuable, but it does not grant them Ethereum's security automatically. Document the route, the intermediary contracts, the expected arrival time, and what happens if a message is delayed or fails.

## Sequencing, censorship, and finality are separate states

Applications often show a transaction as confirmed moments after a sequencer accepts it. That confirmation is useful for interaction, but it is not identical to Ethereum settlement. A clear interface can communicate stages such as submitted to the wallet, accepted by the L2, posted to L1, and finalized under the application's policy. Which stages are visible depends on the chain, but collapsing them into one green check obscures risk.

Sequencer outages demonstrate why this distinction matters. Users may be unable to transact normally even if their balances remain represented in the rollup state. Some protocols expose an L1 inbox that lets users force a transaction into the sequencer's queue. The path may be slower and more expensive, but it is a meaningful part of the system's liveness model. Check whether it is permissionless, how messages are ordered, and whether the deployed configuration enables it.

Censorship resistance has practical limits. An L1 escape hatch cannot make a complex application convenient during a disruption, and a user may need ETH on L1 to invoke it. Developers who hold user assets or build critical interfaces should explain these operational conditions instead of reducing them to a decentralization label.

## A developer's deployment checklist for L2s

Start by reading the network's protocol documentation and canonical bridge documentation. Confirm chain ID, RPC endpoints, explorer, native gas token, supported compiler behavior, and contract verification process. Test deposits, withdrawals, and cross-domain messages in a non-production environment. Test failure paths as well: a message replay, a rejected withdrawal, an unavailable sequencer, and a stale indexed record.

Use the L2's recommended SDK only after understanding the message flow it abstracts. Record both L1 and L2 transaction hashes for cross-domain actions. Wait for the right status before crediting users with a bridged asset. Indexers can lag or reorganize, so retain the source event and block data needed to reconcile records.

Finally, review governance. An upgradeable bridge or rollup contract can be safe enough for a use case, but its administrators and timelocks are part of the risk. The [L2BEAT risk framework](https://docs.l2beat.com/methodology/risks/) is a useful independent vocabulary for examining proof systems, data availability, sequencers, and upgrades. It should lead developers back to the deployed contracts and official documents, not replace them.

Rollups make Ethereum applications cheaper to use by changing where execution happens and how its result is checked. Their differences are not cosmetic. The proof model, posted data, bridge path, sequencer, and governance process determine what a user can verify and what a developer must build around.
