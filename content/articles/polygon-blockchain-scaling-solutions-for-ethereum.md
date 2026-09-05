---
title: Polygon Blockchain Scaling Solutions for Ethereum
image: /images/johannes-plenio-FZpCcPss9to-unsplash.jpg
data-ai-hint: polygon blockchain network
description: >-
  A guide to Polygon, the EVM-compatible network anchored to Ethereum. Learn how
  Polygon Chain works, what changed with the POL token, and how AggLayer and CDK
  fit in.
category: Educational
publishedDate: '2026-03-11'
lastUpdated: "2026-09-05"
---
## What Polygon is

Polygon is an EVM-compatible blockchain anchored to Ethereum that executes transactions off Ethereum mainnet and periodically posts state to Ethereum for security. It started as Matic Network in 2017 and rebranded to Polygon in 2021. Today Polygon Chain (often still called Polygon PoS) is the live production network, while Polygon Labs builds related infrastructure around it.

In short, Polygon lowers cost and raises throughput for Ethereum-compatible apps without requiring developers to rewrite Solidity code.

## Who this guide is for

* **Users who pay fees on Ethereum.** You want sub-cent fees and fast confirmation for transfers, swaps, and mints while staying in the EVM ecosystem. Polygon reports an average fee around $0.002 and finality in seconds, compared with variable fees on Ethereum mainnet that can spike above $1 during congestion.
* **Developers choosing where to deploy.** You need EVM equivalence, familiar tooling (Hardhat, Foundry, viem, ethers.js), and a bridge to Ethereum. Polygon Chain runs unmodified Solidity and supports the same RPC and wallet flows.
* **Teams evaluating payments or stablecoin use cases.** Stripe, Revolut, and other fintechs use Polygon for stablecoin settlement. The docs now frame the broader product as the Open Money Stack, which bundles Polygon Chain with wallets, on- and off-ramps, and cross-chain routing.

If you already use Ethereum mainnet and want lower cost without leaving the Ethereum address format, this guide covers what Polygon keeps, what it does differently, and where trade-offs remain.

## How Polygon Chain works

Polygon Chain is not a rollup that posts every transaction batch to Ethereum for data availability. It is a sidechain that runs its own consensus and anchors state to Ethereum through checkpoints. That design is faster and cheaper than posting full data to Ethereum, but it means security depends on Polygon validators, not only on Ethereum.

### Two layers: Bor and Heimdall

The docs describe a dual-layer architecture:

* **Bor - execution.** Bor is the block production layer. It is a fork of Go Ethereum (Erigon is also supported) that executes EVM transactions. Each span has a single block producer selected by Heimdall from a small eligible pool. Block time is around 1.5 to 2 seconds.
* **Heimdall - consensus and anchoring.** Heimdall is the consensus layer built on CometBFT and the Cosmos SDK. It monitors staking contracts on Ethereum, validates Bor blocks, picks block producers, and submits periodic checkpoints to Ethereum. Heimdall-v2 is the current version after the migration from Tendermint.

Validators run both Bor and Heimdall. They stake on Ethereum, not on Polygon itself. The minimum is 10,000 POL and the active set is capped at 105 validators. The validator dashboard lists around 3.5 to 3.6 billion POL staked as of 2025 to 2026.

### Finality: milestones vs checkpoints

With Heimdall v2, deterministic finality on Polygon itself takes about 2 to 5 seconds via a milestone mechanism. Validators vote on the longest common sequence of Bor block hashes since the last milestone, and agreement by two thirds of stake finalizes it.

Checkpoints are different. A checkpoint is a Merkle root of Bor blocks submitted to contracts on Ethereum at governance-controlled intervals. Checkpoints are required only for bridging back to Ethereum. For activity that stays on Polygon, milestone finality is what matters. For a withdrawal to Ethereum, you wait for the relevant checkpoint to be submitted and verified, then you submit a proof against the exit queue on Ethereum.

## The POL token and the MATIC migration

POL replaced MATIC as the native gas and staking token on September 4, 2024, at a 1 to 1 rate.

* **What changed on Polygon Chain.** Holders with MATIC on Polygon Chain saw an automatic conversion. No manual swap was needed, though some wallets continued to display "MATIC" until users updated the token symbol in network settings.
* **What changed on Ethereum.** Holders with MATIC on Ethereum use the migration contract via the Polygon Portal at portal.polygon.technology/pol-upgrade, or via aggregators that have integrated the contract. Holders on Polygon zkEVM needed to bridge to Ethereum first and then migrate.
* **Supply and emission.** Initial supply is 10 billion POL, matching MATIC at migration. POL can be minted via the EmissionManager contract at up to 2 percent per year, split between the community treasury and validator rewards. PIP-26 schedules validator emission as 2 percent in year four, 1.5 percent in year five, then 1 percent thereafter, for an effective 2 percent annual emission after June 2025. The rate can only be changed by governance and cannot exceed the mintPerSecondCap in the POL contract.
* **Status.** Polygon reported in September 2025 that about 99 percent of MATIC on the Polygon network had migrated to POL, with every Polygon PoS transaction using POL as gas since September 2024. The migration contract holds the deposited MATIC and includes an unmigration path back to MATIC controlled by governance, though it is not burned.

POL is used for gas, for staking to secure the network, and for governance over the Community Treasury. Bridges now disburse POL rather than MATIC, so contracts that expected MATIC from the bridge must be checked.

## Beyond the sidechain: AggLayer, CDK, and what happened to zkEVM

The original article framed zkEVM as the flagship Layer 2. That is no longer accurate.

* **Polygon zkEVM Mainnet Beta is sunset.** Polygon announced in June 2025 that the zkEVM Mainnet Beta sequencer would be discontinued, with the network no longer producing blocks as of July 3, 2026. Withdrawals can no longer be processed through the Agglayer Bridge after that date. Assets held in self-custodied wallets on zkEVM at sunset are recoverable on Ethereum through the Polygon zkEVM Claims interface at zkevm-claims.polygon.technology. The chain generated limited usage and, according to disclosures cited by researchers, ran at a loss before the decision.
* **AggLayer is the current interoperability layer.** First components went live in February 2024. Agglayer is a cross-chain bridge that connects heterogeneous chains in one protocol. It keeps native asset identity without wrapped tokens, supports atomic cross-chain actions, and uses pessimistic proofs so a compromised chain cannot drain more than it deposited. It is bundled with CDK and other chains can also connect. Miden has joined as a non-EVM connected chain.
* **Polygon CDK for dedicated chains.** Polygon Chain Development Kit lets institutions launch a bespoke chain with Agglayer connectivity by default. Options include sovereign mode with pessimistic proofs, validium with offchain data availability, and private validium for privacy needs. Polygon quotes up to 20,000 plus TPS when tuned for payment workloads and capacity over 100 Mgas/s, with managed deployment rather than a self-serve kit. Discontinuation of the older Polygon Edge framework was announced to focus on CDK.
* **Incubations.** Projects that were previously described as Polygon products, such as Miden (a STARK-based VM), ZisK, Katana, and Billions, are now listed as incubations with separate roadmaps. Miden uses a STARK-based design and the Miden VM, distinct from EVM equivalence.

For practical purposes, think of Polygon as Polygon Chain for public settlement, plus CDK plus AggLayer for connected appchains.

## Fees, throughput, and real usage numbers

Use official sources and check live dashboards before you plan capacity. Figures shift with upgrades.

* **Fees.** polygon.technology lists an average transaction cost around $0.002 on Polygon Chain. A 24 hour snapshot on PolygonScan has shown around $0.01 to $0.016 for average fees, which illustrates variance by activity and gas price.
* **Throughput.** The Polygon Chain overview docs describe sub-5 second finality and a design capacity around 3,800 TPS. Marketing pages have cited 5,000 plus TPS, while the Gigagas roadmap targets 1,000 TPS achieved with the Bhilai hard fork and Heimdall v2 in mid 2025, with the Rio upgrade on testnet targeting around 5,000 TPS for mainnet later in 2025. Observed live TPS is lower and varies hour to hour.
* **Usage reported by Polygon.** The marketing site reports about 175 million unique wallet addresses, more than 7 billion total transactions, about 590 million total addresses on PolygonScan including contracts, and $2.7 trillion in transfer volume with about $3.4 billion in stablecoin supply. Stablecoin TVL around $1.15 billion and daily active addresses near 590,000 to 600,000 were cited in Q3 2025 reports.
* **Stability.**Polygon Chain notes over five years of production and 99.99 percent uptime.

Treat the low fee and high capacity numbers as best case under light load. Actual cost depends on Bor gas price, batch checkpoint timing, and Ethereum fees for bridging.

## Pros and cons

| Area | What is good | What to watch |
| --- | --- | --- |
| Fees and speed | Average fees near $0.002 and confirmation in 2 to 5 seconds on Polygon itself. EVM execution is fast enough for payments. | Fees still vary with Bor congestion. Ethereum bridging adds its own gas cost. |
| Developer fit | Full EVM compatibility. Solidity, Hardhat, Foundry, viem, and ethers.js work by pointing at the Polygon RPC at polygon-rpc.com. | Contracts that assumed MATIC from the bridge must be updated for POL. Test on Amoy testnet first. |
| Ecosystem and liquidity | Large wallet base, thousands of dApps, deep stablecoin liquidity cited at over $3 billion, Polymarket launched exclusively on Polygon. | Liquidity is still fragmented across chains. AggLayer aims to unify it, but cross-chain routing adds complexity. |
| Security model | Checkpoints anchor state to Ethereum and provide a withdrawal proof. Staking on Ethereum adds economic security. | Sidechain trust. Security depends on the 105 validators and their honesty and liveness, not solely on Ethereum. Nakamoto coefficient around 4 means a small number of entities hold significant stake. If Bor or Heimdall stalls, apps stall. |
| Decentralization and ops | Small active validator set enables speed. 10,000 POL minimum lowers the barrier relative to some chains. | 105 validators is small compared with Ethereum. Most validation is operated by professional providers. Governance and upgrade keys still matter. Review audit history and checkpoint governance via PIPs. |
| Bridging | Portal bridge at portal.polygon.technology handles Ethereum to Polygon and back with a well documented flow. | Polygon to Ethereum withdrawals must wait for a checkpoint and require a proof submission on Ethereum. Keep large exits on the canonical bridge and use third party bridges only for small, time sensitive moves. |
| Future direction | CDK and AggLayer provide a path to appchains that share liquidity instead of splitting it. Open Money Stack adds wallets and fiat ramps in one integration recently expanded via Coinme and Sequence. | zkEVM, the earlier ZK flagship, is sunset. Teams that built on it must migrate. Long term value of POL now depends on adoption of AggLayer and CDK, which is subject to governance. |

## How to get started

### If you are a user

1.**Add the network.**In MetaMask or any EVM wallet, add Polygon Mainnet. Chain ID is 137. RPC is https://polygon-rpc.com. Symbol is POL. If it still shows MATIC, update the network symbol manually.
2.**Get POL for gas.**On Polygon Chain you need POL, not MATIC. If you hold MATIC on Ethereum, migrate 1 to 1 at portal.polygon.technology/pol-upgrade. If you hold MATIC on Polygon Chain after September 2024, it is already POL though your display may lag.
3.**Bridge small first.**Use the Polygon Portal at portal.polygon.technology to move assets from Ethereum to Polygon. Send a test amount, confirm it arrives, then send the rest. Keep some POL for gas.
4.**Track finality.**A wallet confirmation is a Bor soft confirmation. For Polygon to Polygon activity, milestone finality in seconds is sufficient. For Polygon to Ethereum moves, wait for the checkpoint and keep the transaction hash. Block explorers and the validator dashboard show checkpoint status.
5.**Manage bridges and ramps.**For fiat on- and off-ramps, Polygon now routes through the Open Money Stack partners including Coinme for cash rails. Compare fees and know your custody model before you deposit.

### If you are a builder

1.**Deploy as on Ethereum where possible.**Point Hardhat or Foundry at the Polygon RPC and deploy compiled Solidity. No custom compiler is needed on Polygon Chain. Check gas accounting, since fees are paid in POL.
2.**Check the POL assumption.**Search for any code that handles native token receipt from the bridge. If it checked for MATIC, update it for POL. Run tests on Amoy and verify with a real bridge round trip.
3.**Handle cross chain timing.**Ethereum to Polygon messages take minutes. Polygon to Ethereum messages require a checkpoint and proof, so do not build logic that assumes synchronous callbacks.
4.**Plan for sequencer and validator liveness.**A single Bor producer per span means downtime can delay inclusion. Provide a retry path and do not assume instant inclusion under load.
5.**Choose CDK versus public chain deliberately.**Use Polygon Chain if you want public liquidity and immediate users. Use CDK if you need private blockspace, access controls, or custom throughput and can justify operating a chain. Agglayer connectivity is included with CDK and is also available to other chains.

## FAQ**Is Polygon a Layer 2 or a sidechain?**Docs call it an EVM-compatible blockchain anchored to Ethereum via checkpoints. It uses its own validators and does not post full transaction data to Ethereum like a rollup. Many trackers list it as a sidechain. Security rests on Polygon validators plus Ethereum-anchored checkpoints, not only on Ethereum.**What happened to MATIC?**MATIC was the native token before September 4, 2024. POL now serves as gas and staking token on a 1 to 1 basis. Initial supply is 10 billion POL. MATIC on Polygon Chain converted automatically. MATIC on Ethereum migrates via the Portal contract. Stakers and delegators on Polygon PoS did not need to take action at the time.**Is Polygon zkEVM still available?**No. The sequencer was sunset on July 3, 2026 after an announcement in June 2025, and the network no longer produces blocks. Use Polygon Chain, or a CDK chain if you need a ZK-based appchain. If you held funds on zkEVM at sunset, recovery is via the claims interface at zkevm-claims.polygon.technology and bridging through the Agglayer interface should have been done before the cutoff.**What is Miden?**Miden is a separate ZK rollup incubated by Polygon Labs, using STARKs and the Miden VM rather than the EVM. It focuses on parallel execution and privacy features, and is distinct from the sunset zkEVM.**What are AggLayer and CDK?**AggLayer is the cross-chain settlement layer that connects chains with pessimistic proofs, unified liquidity without wrapped tokens, and atomic operations. Polygon CDK is the toolkit for launching custom chains that ship with Agglayer connectivity. First AggLayer components went live in February 2024, with formal AggLayer launch notes in 2024 and expansion through 2025 to 2026.**How fast and cheap is it really?**Docs cite around $0.002 average fee and sub-5 second finality with capacity near 3,800 TPS. Real fees on explorers have shown $0.01 or more in busy periods, and observed TPS is often in the low hundreds. The Bhilai and Heimdall v2 upgrades delivered 1,000 plus TPS and about 5 second finality in 2025, with a follow on upgrade targeting 5,000 TPS.**How long do Polygon to Ethereum withdrawals take?**Longer than a normal transfer. You must wait for Heimdall to submit the checkpoint that contains your burn or exit transaction, then you submit a proof against the contracts on Ethereum. Milestones do not replace checkpoints for this path. Allow minutes to hours depending on checkpoint interval and Ethereum load.**Do I need POL to use Polygon?**
Yes for gas and for staking. If you are bridging from Ethereum, you will need POL on Polygon for fees after the bridge completes. Fund a small amount first. Some paymaster or EIP-7702 flows can sponsor gas, but the network fee itself is still paid in POL.

---
*Sources: polygon.technology and about page (stats, timeline, product scope, and zkEVM sunset notice), docs.polygon.technology POS overview, architecture overview, Bor, Heimdall v2, POL token and MATIC to POL migration pages, CDK overview, Agglayer overview, PIP-17 to PIP-26 and PIP-43 to PIP-62, Polygon Portal migration interface, forum announcement on sunsetting zkEVM Mainnet Beta (June 11 2025), and PolygonScan charts. Stats quoted as reported on those pages as of August 2026.*

## Verifiable Primary Sources & References

1. [Ethereum EIP-4337 Account Abstraction Using Alt Mempool](https://eips.ethereum.org/EIPS/eip-4337)
2. [Ethereum EIP-7702 Set EOA Account Code Specification](https://eips.ethereum.org/EIPS/eip-7702)
3. [Ethereum Official Yellow Paper & Protocol Specification](https://ethereum.github.io/yellowpaper/paper.pdf)
4. [Ethereum Consensus Specs & Proof of Stake Architecture](https://github.com/ethereum/consensus-specs)
5. [Solidity Compiler Official Documentation & Language Spec](https://docs.soliditylang.org/)
6. [Foundry Book Development & Testing Framework Documentation](https://book.getfoundry.sh/)
7. [Hardhat Ethereum Development Environment Documentation](https://hardhat.org/docs)
8. [Viem TypeScript Interface for Ethereum Specification](https://viem.sh/docs/getting-started)
9. [Ethers.js Complete Web3 Library Documentation](https://docs.ethers.org/)
10. [MakerDAO Technical Documentation & Maker Protocol Specs](https://docs.makerdao.com/)
