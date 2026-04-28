---
term: Optimistic Rollup
slug: optimistic-rollup
category: technical
difficulty: intermediate
image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=80"
description: An Optimistic rollup is a Layer 2 scaling solution that assumes transactions are valid by default (hence "optimistic") and only runs computation to prove fraud if someone challenges a state transition. This approach enables high throughput and EVM compatibility while maintaining Ethereum security through fraud proofs and a challenge period.
relatedTerms:
  - rollup
  - fraud-proof
  - layer-2
  - arbitrum
  - optimism
synonyms:
  - Optimistic L2
  - OR
  - Fraud-proof rollup
---

An **Optimistic rollup** is a **Layer 2 scaling solution that optimistically assumes all transactions are valid** unless proven otherwise through a fraud proof mechanism. Rather than verifying every transaction on Ethereum L1, Optimistic rollups post transaction data to L1 and only require verification if someone disputes a state transition during a challenge period (typically 7 days).

This "innocent until proven guilty" approach enables Optimistic rollups to achieve scalability improvements over Ethereum L1 while maintaining EVM compatibility and inheriting Ethereum's security. Major Optimistic rollups like **Arbitrum One** and **Optimism Mainnet** process millions of transactions daily with fees that are cheaper than L1.

## How Optimistic Rollups Work

The Optimistic rollup architecture involves several key steps:

### 1. Transaction Execution

- Users submit transactions to the rollup sequencer.
- Sequencer executes transactions off-chain using the rollup's VM (typically EVM).
- Sequencer immediately provides soft confirmation.
- Transactions are batched together (typically every few minutes).

### 2. Data Posting to L1

- Sequencer posts transaction data to Ethereum L1 as calldata or blob data (EIP-4844).
- Data includes all information needed to reconstruct the rollup state.
- This ensures data availability; anyone can download the data and verify correctness.

### 3. State Root Submission

- Sequencer computes the new state root after executing the batch.
- State root is submitted to the rollup contract on Ethereum L1.
- The state root is initially "pending" and subject to challenge.

### 4. Challenge Period

- A challenge window opens (typically 7 days for Arbitrum and Optimism).
- Anyone can act as a challenger (or "validator") by running the rollup software.
- Challengers re-execute the batch locally and check if the state root matches.
- If there's a mismatch, the challenger can submit a fraud proof.

### 5. Fraud Proof (If Needed)

- Challenger identifies the specific transaction or state transition that's incorrect.
- An interactive game occurs on L1 to narrow down the dispute to a single computation step.
- That single step is executed on L1 to determine correctness.
- If fraud is proven, the incorrect state root is reverted and the dishonest sequencer loses their bond.
- If no challenge occurs during the window, the state root is finalized.

### 6. Finality

- After the challenge period without successful fraud proofs, the state root is considered final.
- Withdrawals from the rollup to L1 can be executed; users must wait the full challenge period.
- The rollup state is now secured by Ethereum L1.

## Key Properties

### Optimistic Assumption

The core innovation is the **optimistic assumption**: we assume the sequencer is honest unless someone proves otherwise. This means:

- No expensive verification happens for every batch.
- Only dishonest or faulty state transitions trigger on-chain verification.
- As long as at least one honest challenger is watching, security is maintained.

This reduces L1 gas costs since verification only happens when needed.

### Fraud Proofs

**Fraud proofs** are cryptographic proofs that a specific state transition was computed incorrectly. The challenge game works by:

1. Challenger claims state root is incorrect.
2. Interactive bisection game narrows disagreement to a single computation step.
3. That single step is executed on L1 to determine correctness.
4. Sequencer loses their bond if fraud is proven; challenger is rewarded.

- **Interactive vs. Non-Interactive**:
- **Interactive** (Arbitrum): Multiple rounds of back-and-forth to narrow down the dispute.
- **Non-Interactive** (proposed for Optimism): Challenger submits proof directly without interaction.

Interactive fraud proofs are more complex but more efficient; non-interactive proofs are simpler but more expensive.

### Challenge Period

The **7-day challenge period** is a fundamental tradeoff:

**Why 7 Days?**
- Gives challengers time to detect fraud, generate proofs, and submit them even if systems are down.
- Provides buffer for social coordination if something goes wrong.
- Allows for L1 congestion, network issues, or other delays.

- **Drawbacks**:
- **Slow Withdrawals**: Users must wait 7 days to withdraw funds from the rollup to L1.
- **Poor UX**: 7-day wait is unacceptable for many use cases.
- **Capital Inefficiency**: Liquidity providers filling "fast withdrawals" need to lock capital for 7 days.

Some rollups are exploring shorter challenge periods or preconfirmation mechanisms to mitigate this.

## Optimistic Rollup Projects

### Arbitrum One

- **Overview**: The largest Optimistic rollup by TVL and usage, developed by Offchain Labs.

- **Key Features**:
- **Arbitrum Nitro**: Second-generation tech using WASM for faster execution.
- **Interactive fraud proofs**: Efficient multi-round challenge protocol.
- **EVM+ compatibility**: Supports EVM plus additional precompiles.
- **ARB token**: Governance token for Arbitrum DAO.

### Optimism Mainnet

- **Overview**: The original Optimistic rollup, developed by OP Labs.

- **Key Features**:
- **OP Stack**: Modular framework for deploying OP-based rollups.
- **Superchain**: Vision of many interconnected OP Stack chains.
- **EVM equivalence**: Strives for byte-for-byte EVM compatibility.
- **OP token**: Governance token and core of the Optimism Collective.

### Base

- **Overview**: Coinbase's Optimistic rollup built on the OP Stack.

- **Key Features**:
- **OP Stack-based**: Uses Optimism's technology.
- **Coinbase backing**: Strong institutional support and fiat on-ramps.
- **Consumer focus**: Targets mainstream consumer applications.
- **No token (yet)**: No separate token, may eventually join OP governance.

### Other OP Stack Chains

- **Zora Network**: NFT-focused OP Stack chain.
- **Mode Network**: DeFi and AI focused.
- **Public Goods Network (PGN)**: Gitcoin's chain for public goods funding.
- **Dozens more**: OP Stack has enabled permissionless rollup deployment.

## Optimistic vs. ZK Rollups

The Optimistic vs. ZK (Zero-Knowledge) rollup debate is fundamental to L2 scaling:

| Aspect | Optimistic Rollups | ZK Rollups |
|--------|-------------------|-----------|
| **Verification** | Fraud proofs (if challenged) | Validity proofs (always) |
| **Finality** | ~7 days (challenge period) | Minutes to hours (proof generation) |
| **EVM Compatibility** | Native (easy to deploy contracts) | Difficult (requires custom zkEVM) |
| **L1 Gas Costs** | Low (only if challenged) | Higher (must verify proofs) |
| **Complexity** | Lower (standard EVM execution) | Higher (zero-knowledge cryptography) |
| **Maturity** | More mature (2021+) | Emerging (2023+ for zkEVMs) |
| **Security Assumption** | 1-of-N honest (one honest challenger) | Cryptographic (math guarantees) |
| **Throughput** | High | Very high (100-1000x L1 potential) |
| **Examples** | Arbitrum, Optimism, Base | zkSync, Polygon zkEVM, Scroll |

## EVM Compatibility

Optimistic rollups excel at EVM compatibility:

- **Optimism**: "EVM-equivalent", aims for byte-for-byte compatibility with Ethereum, so contracts deploy identically.

- **Arbitrum**: "EVM+", supports all EVM features plus some additional functionality.

- **Benefits**:
- Existing Ethereum contracts deploy with minimal or no changes.
- Developer tools (Hardhat, Foundry, Remix) work out-of-the-box.
- Solidity skills directly transferable.
- Faster ecosystem growth.

This EVM compatibility is a major reason for Optimistic rollup adoption.

## Security Model

Optimistic rollups security relies on:

- **1-of-N Honest Assumption**: As long as at least one party is monitoring and willing to challenge fraud, the rollup is secure.

- **Economic Security**: Sequencers must post bonds that get slashed if fraud is proven, incentivizing honesty.

- **Data Availability**: All transaction data posted to L1 ensures anyone can verify correctness independently.

- **L1 Settlement**: Ultimately, Ethereum L1 arbitrates disputes and enforces the correct state.

- **Risks**:
- If all challengers are offline or compromised simultaneously, fraud could slip through.
- If the L1 contract has bugs, rollup security is compromised.
- During the challenge period, state is not yet final.

Overall, Optimistic rollups inherit Ethereum's security with the additional assumption that at least one honest challenger exists.

## Economics and Costs

### User Costs

- **Transaction Fees**: Transaction fees are significantly lower than L1.

- **Breakdown**:
- Execution cost: Minimal (off-chain computation is cheap).
- L1 data cost: Majority of cost (posting calldata/blobs to L1).
- Sequencer fee: Small markup for sequencer operation.

### Rollup Economics

- **Revenue Sources**:
- Transaction fees from users.
- MEV extraction by sequencer.
- L1 data cost savings.

- **Costs**:
- L1 data availability (calldata/blob costs).
- L1 state root posting and proof verification.
- Infrastructure (sequencers, RPC nodes, indexers).
- Development and operations.

Most Optimistic rollups are currently profitable or close to breakeven.

## Limitations and Criticisms

Despite success, Optimistic rollups have limitations:

- **Slow Finality**: 7-day withdrawal period is a major UX issue.

- **Centralized Sequencers**: Most rollups use centralized sequencers, creating censorship risks.

- **Data Availability Dependency**: Require L1 for data availability; if L1 is congested or unavailable, rollup can't post batches.

- **No Native Interoperability**: Different rollups are isolated; cross-rollup transactions require bridges or special infrastructure.

- **Security Reliance on Challengers**: If no one is watching, fraud could theoretically succeed.

- **Lower Throughput Than ZK Long-Term**: ZK rollups have higher theoretical throughput potential.

## Career Opportunities in Optimistic Rollups

The Optimistic rollup ecosystem offers diverse roles:

- **Rollup Protocol Engineers**: Build core rollup infrastructure, including sequencers, fraud proof systems, and L1 contracts.

- **Smart Contract Developers (L2)**: Build dApps on Optimistic rollups, leveraging cheap fees and high throughput.

- **Fraud Proof Researchers**: Research and implement fraud proof mechanisms, challenge games, and verification systems.

- **Sequencer Engineers**: Build and operate high-performance sequencers with low latency and high reliability.

- **Bridge Engineers**: Build bridges connecting Optimistic rollups to L1 and other rollups.

- **DAO Contributors**: Contribute to Arbitrum DAO or Optimism Collective governance, protocol upgrades, and ecosystem growth.

Optimistic rollup expertise is highly valued as rollups become the dominant Ethereum scaling solution.

## Best Practices for Developers

When building on Optimistic rollups:

- **Test Thoroughly**: Despite EVM compatibility, subtle differences exist, test on rollup testnets before mainnet.

- **Optimize for L1 Data**: Minimize calldata size to reduce costs.

- **Handle Challenge Period**: For withdrawals or cross-chain operations, account for the 7-day wait in your UX.

- **Use Native Bridges**: Use official rollup bridges for L1↔L2 transfers rather than third-party bridges when possible.

- **Monitor Sequencer**: Track sequencer uptime and have contingency plans for downtime.

- **Gas Optimization**: While gas is cheap, optimize for large-scale applications to minimize cumulative costs.

- **Leverage Cheap Blockspace**: Build applications that were economically impossible on L1.

## The Future of Optimistic Rollups

Optimistic rollups continue to evolve:

- **Decentralized Sequencers**: Major rollups moving toward decentralized sequencing.

- **Shorter Challenge Periods**: Research into shorter challenge periods without compromising security.

- **Preconfirmations**: Sequencers offering fast guarantees backed by bonds to mitigate slow finality.

- **Cross-Rollup Communication**: Shared sequencing and native interoperability between Optimistic rollups.

- **Hybrid OR/ZK**: Some rollups exploring hybrid models with optional ZK proofs for instant finality.

- **OP Stack Expansion**: Hundreds of OP Stack chains creating interconnected rollups.

Despite the rise of ZK rollups, Optimistic rollups will likely remain dominant for the foreseeable future due to their maturity, EVM compatibility, and strong ecosystem adoption. The rollup wars are just beginning, and Optimistic rollups have a strong early lead.

**Building on L2?** Start with an Optimistic rollup like Arbitrum or Base for the easiest development experience and largest existing user base. The OP Stack makes deploying your own Optimistic rollup accessible if you need full control.
