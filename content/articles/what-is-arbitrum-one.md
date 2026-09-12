---
title: What is Arbitrum One? Technical Architecture of the Leading Optimistic Rollup
image: /images/nasa-cIX5TlQ_FgM-unsplash.jpg
data-ai-hint: arbitrum blockchain
description: >-
  A deep technical breakdown of Arbitrum One, exploring Optimistic Rollup
  mechanics, Nitro architecture, interactive fraud proofs, WASM execution, and
  Stylus multi-language smart contracts.
category: Technology Deep Dives
publishedDate: '2026-03-11'
lastUpdated: "2026-09-12"
---

As decentralized finance and computational demand expanded across [Ethereum](/what-is-ethereum), mainnet gas fee dynamics necessitated high-throughput, low-latency scaling solutions. **Arbitrum One** has established itself as the leading **[Layer 2 (L2) scaling solution](/guide-to-layer-2s)** on Ethereum, processing thousands of transactions per second while anchoring security guarantees directly to Layer 1.

Engineered by Offchain Labs, Arbitrum One utilizes an **Optimistic Rollup** framework powered by the **Arbitrum Nitro** technology stack. Offering bytecode-level EVM equivalence, Arbitrum enables developers to deploy existing Ethereum [smart contracts](/what-are-smart-contracts) written in Solidity or Vyper with zero modification, immediately benefiting from dramatic execution cost reductions and sub-second user responsiveness.

![Arbitrum One Architecture: Rollup Execution & Fraud Proving](/images/articles/charts/arbitrum-one-architecture.svg)

---

## 1. Architectural Foundations: How Arbitrum Nitro Works

The core design objective of Arbitrum One is offloading heavy execution and state transition logic off-chain while relying on Ethereum Layer 1 exclusively for data availability, sequencing order, and settlement finality.

### The Arbitrum Nitro Execution Stack
Arbitrum One runs on **Nitro**, a complete rewrite of the initial Arbitrum architecture. Nitro achieves EVM equivalence by running a modified core of `go-ethereum` (Geth) compiled directly inside WebAssembly (WASM). This architecture provides three major technical advantages:

1. **Bytecode EVM Equivalence:** Rather than approximating EVM execution through custom emulators, Nitro executes standard EVM bytecode. Gas computation, opcode responses, and system calls behave identically to Ethereum mainnet.
2. **Layered Architecture:** Nitro separates the execution software into distinct layers: base Geth for state transitions, a custom Sequencer module for transaction ordering, and a WASM execution module for fraud proving.
3. **Advanced Batch Compression:** Nitro compresses transaction batches using the Brotli compression algorithm before publishing data to Ethereum Layer 1, minimizing on-chain data availability gas overhead.


---

## 2. The Optimistic Rollup Lifecycle and Fraud Proof Architecture

Arbitrum operates on an "optimistic" security assumption. The system assumes that all state roots published to Layer 1 by the Sequencer are valid without running computationally expensive verification proofs upfront for every block.

### The 5-Step Transaction Lifecycle

```
[ User Action ] ---> [ L2 Sequencer Intake ] ---> [ Instant Soft Finality ]
                                                         |
                                                         v
[ L1 State Root Claim ] <--- [ 7-Day Challenge Window ] <--- [ Batch Posted to L1 Blobs ]
          |
          v
[ L1 Hard Settlement Finality ]
```

1. **Transaction Submission:** A user submits a transaction to the Arbitrum Sequencer node via RPC.
2. **Sequencer Execution & Soft Finality:** The Sequencer orders the transaction, executes it against the local L2 state, and issues a sub-second "soft finality" receipt to the user.
3. **L1 Batch Posting (Data Availability):** The Sequencer packs thousands of soft-finalized transactions into a compressed batch and submits them to Ethereum Layer 1 contracts (utilizing EIP-4844 Blob space).
4. **State Root Assertion:** A Rollup Validator asserts a new L2 state root commitment on the Layer 1 `RollupCore` contract.
5. **The 7-Day Challenge Window:** A 7-day challenge period opens. Honest validators continuously download transaction batches from L1, re-execute state transitions locally, and compare their computed state root against the asserted state root.

### Multi-Round Interactive Fraud Proving
Unlike zero-knowledge rollups that submit cryptographic validity proofs (zk-SNARKs or STARKs) alongside state updates, Optimistic Rollups only run proofs when a dispute occurs. Arbitrum pioneered **Multi-Round Interactive Fraud Proofs**, significantly reducing L1 gas expenses during challenges.

```
Validator A (Assertor): "State root after 1,000,000 steps is Root X."
Validator B (Challenger): "I dispute Root X."

  Round 1: Bisect 1,000,000 steps into 2 halves of 500,000 steps on L1 contract.
  Round 2: Challenger identifies disputable half (Steps 500,001 - 1,000,000).
  Round 3: Bisect 500,000 steps into 250,000 steps...
  ...
  Final Round: Disagreement narrowed down to a SINGLE WASM Execution Instruction.

  Execution: Ethereum L1 contract executes 1 WASM instruction via One-Step Prover.
  Outcome:   Dishonest party loses stake; valid state root finalized.
```

By narrowing down disputes to a single execution opcode before calling the L1 contract, Arbitrum ensures that fraud resolution never exceeds the gas limits of a single Ethereum block.

---

## 3. The Arbitrum Product Matrix: One vs. Nova vs. Stylus

The Arbitrum ecosystem expands beyond a single Layer 2 chain, offering specialized chains tailored for varying performance, cost, and developer requirements.

| Layer 2 Subnet | Primary Technology | Security Guarantee | Target Use Cases |
| :--- | :--- | :--- | :--- |
| **Arbitrum One** | Optimistic Rollup (Nitro) | Full Ethereum L1 Security | DeFi, Lending, Asset Management, High-Value DEXs |
| **Arbitrum Nova** | AnyTrust (Data Availability Committee) | DAC 6-of-7 Trust Assumption | Web3 Gaming, Social Protocols, High-Frequency Micro-Transactions |
| **Arbitrum Stylus** | WASM Multi-Language Engine | EVM + WASM Co-Processing | High-Performance Cryptography, AI Inference, Rust/C++ Smart Contracts |

### Arbitrum Nova and AnyTrust Architecture
For applications requiring micro-penny fees (such as Web3 gaming actions, social tipping, or collectible trading), publishing transaction data directly to Ethereum L1 Blobs can still present cost bottlenecks. **Arbitrum Nova** implements Offchain Labs' **AnyTrust** technology.

Instead of writing transaction data to Layer 1, Nova sends data to an off-chain **Data Availability Committee (DAC)** consisting of reputable entities (such as Google Cloud, Consensys, QuickNode, and Offchain Labs). The DAC signs a data availability certificate confirming they store the raw transaction data. Only the certificate is posted to Ethereum L1. If 2 out of $N$ committee members remain honest, transaction data remains recoverable. If the committee fails or refuses to sign, Nova gracefully falls back to a standard Rollup data posting model.

### Arbitrum Stylus: Multi-Language Smart Contracts
**Arbitrum Stylus** introduces a major upgrade to Arbitrum One and Nova by enabling developers to write smart contracts in mainstream programming languages like **Rust, C, and C++** alongside Solidity.

Stylus leverages a WebAssembly (WASM) co-processor integrated directly into the Nitro engine. Contracts compiled to WASM run with dramatically higher execution efficiency:

- **Memory Cost Reductions:** WASM memory operations cost a fraction of EVM memory operations.
- **Compute Performance:** Heavy cryptographic calculations (such as BLS signature verification, secp256r1 curve operations, or zero-knowledge proof verification) run up to 10x-100x faster than in pure EVM bytecode.
- **Interoperability:** Rust contracts can call Solidity contracts directly within the same execution call stack, maintaining full access to existing ERC-20 and ERC-721 token balances.

---

### Stylus SDK Rust Smart Contract Example

To appreciate how Arbitrum Stylus expands language boundaries beyond EVM bytecode, consider a basic counter smart contract written in Rust using the `stylus-sdk`. Unlike Solidity, which requires custom state mapping abstractions, Rust contracts utilize native types with zero-overhead WASM compilation.

```rust
#![no_main]
extern crate alloc;

use stylus_sdk::{console, evm, msg, prelude::*};

sol_storage! {
    #[entrypoint]
    pub struct Counter {
        uint256 number;
        address owner;
    }
}

#[external]
impl Counter {
    pub fn number(&self) -> Result<U256, Vec<u8>> {
        Ok(self.number.get())
    }

    pub fn set_number(&mut self, new_number: U256) -> Result<(), Vec<u8>> {
        if msg::sender() != self.owner.get() {
            return Err("Unauthorized".into());
        }
        self.number.set(new_number);
        Ok(())
    }

    pub fn increment(&mut self) -> Result<(), Vec<u8>> {
        let current = self.number.get();
        self.number.set(current + U256::from(1));
        Ok(())
    }
}
```

This Rust contract compiles to WebAssembly bytecode. When executed on Arbitrum Stylus, WASM execution gas is priced according to WASM opcodes rather than EVM opcodes, reducing execution costs by up to 90% for compute-intensive logic.

---

## 5. Gas Fee Mechanics and EIP-4844 Blob Integration

Understanding gas pricing on Arbitrum One requires analyzing the two-dimensional fee model: execution gas on Layer 2 and data availability gas on Layer 1.

### Two-Dimensional Gas Pricing Formula
The total transaction fee paid by a user on Arbitrum One is calculated as:

$$\text{Total Fee} = (\text{L2 Gas Used} \times \text{L2 Gas Price}) + (\text{L1 Data Units} \times \text{L1 Estimated Fee})$$

1. **L2 Execution Fee:** Covers the CPU and memory resources required by the Sequencer to execute the transaction on the Nitro engine.
2. **L1 Data Posting Fee:** Dynamically estimates the gas cost to publish compressed transaction data to Ethereum Layer 1. Following Ethereum's Dencun upgrade (EIP-4844), data is posted as dedicated **Blobs** rather than costly `CALLDATA`, reducing L1 data posting overhead by over 90%.

### L2 Gas Price Mechanism
Arbitrum One utilizes an EIP-1559 style dynamic fee market for Layer 2 execution gas. When transaction demand spikes, the L2 base fee automatically adjusts upward to regulate congestion. However, because L2 block space capacity is orders of magnitude higher than L1, base fees remain consistently below a few cents during normal network activity.

---

## 6. Cross-Chain Bridging and Arbitrum DAO Governance

Operating an L2 requires reliable cross-chain messaging primitives and community-led governance structures.

### Canonical Bridge Architecture
Moving assets between Ethereum L1 and Arbitrum One occurs through canonical smart contract bridges:


To bypass the 7-day withdrawal window for liquid ERC-20 tokens, users frequently utilize third-party liquidity bridges (such as Hop Protocol, Across, or Stargate). These protocol liquidity providers issue instant funds on Layer 1 in exchange for taking on the 7-day L2 state root settlement risk for a small convenience fee.

### Arbitrum DAO and $ARB Governance
In March 2023, Arbitrum launched its native governance token, **\$ARB**, alongside the establishment of the **Arbitrum DAO**. The DAO governs both Arbitrum One and Arbitrum Nova.

- **Self-Executing Proposals:** Unlike DAOs whose votes are advisory, Arbitrum DAO proposals execute code changes directly on-chain via a Constitutional Council and Security Council framework once passed.
- **Security Council Emergency Powers:** A 9-of-12 multi-sig Security Council composed of elected security professionals maintains emergency patch authorization to resolve zero-day vulnerabilities in Rollup contracts without waiting for governance delay periods.
- **Ecosystem Development Fund:** The DAO manages a multi-billion dollar treasury reserved for developer grants, protocol incentives, and core infrastructure research.

---

## 7. Building a Developer Career in the Arbitrum Ecosystem

As Arbitrum One maintains dominant TVL and transaction volume among Ethereum Layer 2 networks, demand for specialized L2 engineers, smart contract developers, and infrastructure specialists continues to grow rapidly across global Web3 markets.

### Critical Engineering Competencies
- **Solidity & EVM Assembly (Yul):** Deep understanding of state storage packing, reentrancy guards, cross-contract calls, and L1-L2 messaging interfaces (`IBridge`, `IInbox`, `IOutbox`).
- **Rust & WASM Development:** Proficiency in Rust for building high-performance Arbitrum Stylus contracts, customized indexers, and rollup client nodes.
- **Go Software Engineering:** Expertise in Go to audit, modify, and optimize Nitro core modules derived from `go-ethereum`.
- **Infrastructure & Node Operations:** Operating Arbitrum Nitro validator nodes, relayers, and customized RPC endpoints using Docker and Kubernetes.

### High-Demand Technical Roles
- **Arbitrum Smart Contract Engineer:** Builds optimized DeFi protocols, perpetual DEXs, or automated yield vaults using sub-second block times.
- **Stylus Systems Developer:** Port existing C/C++/Rust libraries into WASM smart contracts for advanced cryptographic and AI applications.
- **L2 Infrastructure Engineer:** Manages RPC infrastructure, Sequencer routing, and data availability pipeline monitoring across Arbitrum chains.
- **Protocol Security Auditor:** Specializes in analyzing cross-chain bridge logic, multi-round fraud-proof edge cases, and L2 gas metering logic.

### Interview Technical Scenario: L1-to-L2 Message Execution

When interviewing for L2 protocol engineering positions, candidates should be prepared to trace an L1-to-L2 retryable ticket transaction and examine the underlying Solidity messaging interface:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IInbox {
    function createRetryableTicket(
        address to,
        uint256 l2CallValue,
        uint256 maxSubmissionCost,
        address excessFeeRefundAddress,
        address callValueRefundAddress,
        uint256 gasLimit,
        uint256 maxFeePerGas,
        bytes calldata data
    ) external payable returns (uint256);
}

contract L1CrossChainSender {
    IInbox public immutable inbox;

    constructor(address inboxAddress) {
        inbox = IInbox(inboxAddress);
    }

    function sendMessageToL2(
        address l2TargetContract,
        bytes calldata payload,
        uint256 maxSubmissionCost,
        uint256 gasLimit,
        uint256 maxFeePerGas
    ) external payable {
        uint256 totalCost = maxSubmissionCost + (gasLimit * maxFeePerGas);
        require(msg.value >= totalCost, "Insufficient ETH for L2 ticket execution");

        inbox.createRetryableTicket{value: msg.value}(
            l2TargetContract,
            0, // l2CallValue
            maxSubmissionCost,
            msg.sender, // excess fee refund
            msg.sender, // callvalue refund
            gasLimit,
            maxFeePerGas,
            payload
        );
    }
}
```

The execution flow proceeds as follows:

1. **Submission:** An L1 smart contract calls `Inbox.createRetryableTicket(...)`, paying L1 gas and depositing L2 execution callvalue into the bridge escrow.
2. **Sequencing:** The Sequencer observes the L1 event log, assigns an L2 transaction hash, and queues it for L2 execution in the L2 Sequencer Inbox.
3. **Auto-Redeem:** If the gas provided is sufficient, the Nitro engine auto-redeems the ticket on L2 instantly, executing `l2TargetContract.call(payload)`.
4. **Manual Redeem:** If L2 gas prices surge unexpectedly and auto-redeem fails, the ticket persists in the L2 Retryable Ticket buffer for 7 days, allowing any user to manually execute `Redeem()` before expiration.

---

## 8. Layer 3 Application-Specific Chains with Arbitrum Orbit

To support sovereign protocols requiring dedicated throughput, custom gas tokens, and tailored governance rules, Offchain Labs introduced **Arbitrum Orbit**.


Arbitrum Orbit enables developers to launch dedicated **Layer 3 (L3) rollups or AnyTrust chains** that settle directly to Arbitrum One or Arbitrum Nova rather than Ethereum mainnet. Orbit chains offer several distinct advantages:

1. **Custom Gas Token Flexibility:** Orbit chains can configure any ERC-20 token as the native gas currency for paying transaction fees, enabling direct tokenomics integration for Web3 games or enterprise platforms.
2. **Dedicated Throughput:** By isolating execution to a dedicated L3 state tree, Orbit chains eliminate gas spikes caused by unrelated high-frequency L2 DEX trading or NFT mints.
3. **Custom Precompiles & Account Abstraction:** Protocol engineers can embed custom cryptographic precompiles directly into the WASM/Nitro execution engine, enabling hardware-level WebAuthn passkey authentication, gasless user onboarding, and custom fee-abstraction models.

Arbitrum One represents a critical milestone in blockchain scalability. By pairing full EVM equivalence with multi-round fraud proofs, WASM execution through Stylus, and reliable Layer 1 security, it provides the core infrastructure required to onboard the next wave of global decentralized applications.
