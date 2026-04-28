---
term: Validium
slug: validium
category: technical
difficulty: advanced
image: "https://images.unsplash.com/photo-1551033406-611cf9a28f67?w=1200&q=80"
description: A validium is a scaling solution similar to a ZK rollup that uses validity proofs to verify computation correctness, but posts transaction data off-chain to a data availability committee rather than to Ethereum L1. This provides higher throughput and lower costs at the expense of slightly weaker security assumptions.
relatedTerms:
  - zk-rollup
  - data-availability
  - layer-2
  - plasma
  - zkporter
synonyms:
  - Off-chain DA rollup
  - Validium chain
  - DA committee chain
---

A **validium** is a **scaling solution that uses validity proofs (like ZK rollups) to ensure computational correctness but posts transaction data off-chain** to a trusted data availability (DA) committee instead of to Ethereum L1. This hybrid approach enables higher throughput and lower costs than ZK rollups while maintaining cryptographic proof of correct execution, though with an additional trust assumption around data availability.

Validiums occupy a middle ground in the blockchain scaling trilemma. They provide stronger security than sidechains, as L1 enforces computational correctness via proofs, but offer weaker guarantees than rollups since they rely on a DA committee instead of L1 data availability. They're suitable for applications that need high throughput and low costs but can tolerate slightly relaxed security assumptions, such as gaming, social media, and high-frequency trading.

Major validium implementations include **StarkEx** (powering dYdX, Immutable X, Sorare), **zkPorter** (zkSync's validium mode), and **Polygon Miden**.

## How Validiums Work

The validium architecture parallels ZK rollups with one critical difference:

### 1. Transaction Execution

- Users submit transactions to the validium operator.
- The operator executes transactions off-chain.
- Batches are created, typically consisting of thousands of transactions.
- Users receive instant soft confirmations.

### 2. Off-Chain Data Posting

- **Key Difference from Rollups**:
- Transaction data is NOT posted to Ethereum L1.
- Instead, data is posted to a **Data Availability Committee (DAC)**.
- The DAC consists of trusted parties, such as members with a multisig.
- The DAC signs attestations that they have received and stored the data.
- Only the DAC attestations are posted to L1.

### 3. Proof Generation

- A prover generates a validity proof (ZK-SNARK or ZK-STARK).
- The proof demonstrates that all transactions were executed correctly.
- The proof includes a commitment to the transaction data (Merkle root).

### 4. L1 Verification

- Proof and data availability attestation are submitted to the L1 contract.
- L1 verifies:
  - The validity proof is correct.
  - The DAC signed off on data availability.
- A new state root is accepted on L1.

### 5. User Withdrawals

- Users can withdraw to L1 if they can provide a Merkle proof of their balance.
- If the DAC withholds data, users cannot generate proofs and cannot withdraw.
- **Exit safety depends on DAC honesty**.

## Validium vs. ZK Rollup

| Aspect | Validium | ZK Rollup |
|--------|---------|-----------|
| **Data Availability** | Off-chain (DAC) | On-chain (L1) |
| **Security** | Proof + DAC trust | Proof + L1 DA |
| **Throughput** | Very high | High |
| **Cost per Transaction** | Very low | Low |
| **L1 Footprint** | Minimal | Moderate |
| **Trust Assumptions** | DAC majority honest | None (L1 guarantees DA) |
| **User Exit Risk** | Can be censored by DAC | Always possible |
| **Use Cases** | Gaming, social, high-frequency trading | DeFi, high-value transfers |
| **Examples** | StarkEx, zkPorter | zkSync Era, Polygon zkEVM |

- **Core Tradeoff**: Validiums trade **data availability trust assumptions** for **cost reductions and throughput increases**.

## Data Availability Committees (DAC)

The DAC is the critical component that differentiates validiums:

### Structure

- **Membership**: Typically 5-20 trusted entities.

- **Threshold**: Requires a majority to sign availability attestations.

- **Duties**:
- Store transaction data off-chain.
- Provide data to users on request.
- Sign attestations that data is available.
- Participate in data reconstruction if needed.

### DAC Examples

- **StarkEx DAC** (used by dYdX, Immutable X):
- 6 members including Nethermind and ConsenSys.
- 4-of-6 threshold.
- Members selected by StarkWare and application operators.

- **zkPorter DAC** (zkSync):
- Uses zkSync validators as DAC members.
- Secured by zkSync token stake.
- Slashing for data withholding.

- **Polygon Miden DAC**:
- Committee of Polygon validators.
- Backed by MATIC stake.

### DAC Risks

- **Collusion**: If a majority of DAC members collude, they can withhold data and censor withdrawals.

- **Liveness**: If too many DAC members go offline, data might become unavailable.

- **Censorship**: The DAC can censor specific users by refusing to serve their data or include their transactions.

- **Regulatory Pressure**: As identifiable entities, DAC members could be pressured to censor transactions.

- **Trust Concentration**: Security depends on trusting specific entities, reducing decentralization.

## Benefits of Validiums

Despite trust assumptions, validiums offer significant advantages:

### Massive Cost Reduction

- **Transaction Costs**: Validiums have lower transaction costs compared to rollups.

- **Why So Cheap?**
- No L1 calldata costs.
- Only proofs and small attestations are posted to L1.
- Can batch many transactions per proof.
- Minimal L1 gas footprint.

This makes validiums ideal for micro-transactions and high-frequency applications.

### Very High Throughput

Validiums can handle high transaction volumes depending on implementation.

- **Scalability**: Throughput is limited by:
- Sequencer/operator performance.
- Prover speed.
- DAC bandwidth.

Validiums can handle transaction volumes that rollups cannot.

### Low Latency

- **Soft Confirmations**: Instant confirmations.

- **Hard Finality**: Minutes for proof generation and L1 confirmation, with no DAC delays.

Faster finality than rollups since there's less data to post to L1.

### Privacy Potential

Like ZK rollups, validiums can implement privacy features:
- Hide transaction details while proving correctness.
- Only reveal data to DAC, not publicly on L1.
- Selective disclosure models.

## Use Cases for Validiums

Validiums excel in specific scenarios:

### Gaming

- **Why**: Games generate many micro-transactions that don't individually justify L1 data costs.

- **Examples**:
- **Immutable X**: NFT gaming platform using StarkEx validium.
- **Sorare**: Fantasy sports using StarkEx.

- **Trade-off**: Gaming transactions are low-value; users can tolerate small DAC trust for cost savings.

### Social Media / Content Platforms

- **Why**: Social interactions need extremely low costs and high throughput.

- **Potential**: Social networks on validiums can handle high volumes.

- **Trade-off**: Social content isn't high-value; censorship risk from DAC is acceptable.

### High-Frequency Trading

- **Why**: HFT needs very low latency and costs, with frequent small trades.

- **Example**:
- **dYdX V3**: Used StarkEx validium for perpetuals trading.

- **Trade-off**: Traders accept DAC trust for superior performance.

### Non-Financial Applications

- **Why**: Applications where security of funds isn't the primary concern but scalability is critical.

- **Examples**:
- Loyalty points.
- In-game currencies.
- Achievement systems.
- Social tokens.

## Validium Implementations

### StarkEx

- **Developer**: StarkWare
- **Proof System**: ZK-STARKs

- **Features**:
- Powers dYdX, Immutable X, Sorare.
- 6-member DAC with 4-of-6 threshold.
- Can process many transactions per batch.
- Low transaction costs.

- **Mode Options**: StarkEx offers both validium mode and rollup mode.

- **Status**: Established with significant trading volume and users.

### zkPorter

- **Developer**: Matter Labs (zkSync)
- **Proof System**: ZK-SNARKs

- **Features**:
- Validium mode for zkSync.
- DAC backed by zkSync token stakers.
- Slashing for data withholding.
- Users choose rollup or validium mode per account.

- **Status**: Planned for zkSync 2.0.

### Polygon Miden

- **Developer**: Polygon Labs
- **Proof System**: ZK-STARKs

- **Features**:
- Client-side proving.
- Validium mode with Polygon validator DAC.
- Local data storage by users.
- High privacy potential.

- **Status**: Testnet, planned mainnet.

### StarkNet with Validium Mode

- **Developer**: StarkWare
- **Proof System**: ZK-STARKs

- **Features**:
- StarkNet can optionally use validium for specific applications.
- Applications choose rollup or validium mode.

- **Status**: In development.

## Hybrid Rollup-Validium Models

Some systems offer **hybrid modes** where users choose their security level:

### zkSync's Approach

- **zkRollup Mode**:
- Data posted to L1.
- Higher security, slower, more expensive.

- **zkPorter Mode** (Validium):
- Data posted to DAC.
- Lower security, faster, cheaper.

- **Benefits**: Users choose based on needs.

### StarkEx Data Availability Modes

- **Rollup Mode**:
- All data on L1.

- **Validium Mode**:
- All data with DAC.

- **Volition Mode** (future):
- Users choose per-transaction.

## Security Model

Validium security relies on:

- **Computational Correctness**: L1-enforced via validity proofs.

- **Data Availability**: DAC majority honest.

- **State Transitions**: L1 smart contract enforces rules.

- **Exit Safety**: Depends on DAC providing data for Merkle proofs.

- **Realistic Threat Model**:
- If DAC majority is honest, security is equivalent to ZK rollup.
- If DAC majority is dishonest, users can be censored, funds frozen.

Validiums accept **liveness/censorship risk** but maintain **safety**.

## Upgrading from Validium to Rollup

Some validiums plan **upgrade paths** to full rollups:

- **Gradual Migration**: Start as validium for low costs, transition to rollup as value grows.

- **Example**: dYdX V3 (StarkEx validium) → dYdX V4 (app chain) → potential future rollup mode.

- **Benefit**: Early users get low costs; stronger security justifies rollup's higher costs.

## Career Opportunities in Validiums

The validium ecosystem offers specialized roles:

- **Validium Protocol Engineers**: Build validium systems, integrating ZK proofs with off-chain DA.

- **DAC Infrastructure Engineers**: Build and maintain data availability committee infrastructure.

- **ZK Proof Engineers**: Optimize proof generation for high-throughput validium applications.

- **Game/Social Developers**: Build applications on validiums.

- **Security Researchers**: Audit DACs and analyze trust models.

Validium expertise combines ZK knowledge with distributed systems.

## Best Practices for Validium Developers

When building on validiums:

- **Assess Security Needs**: Ensure your application can tolerate DAC trust assumptions.

- **Understand DAC**: Research DAC members, threshold, reputation, and governance.

- **Design for Exits**: Implement strong exit mechanisms.

- **Use Low Costs**: Build applications that benefit from low costs.

- **Plan for Upgrades**: Consider paths to stronger security if application value grows.

- **Monitor DAC Health**: Track DAC liveness and member status.

- **Educate Users**: Clearly communicate the DAC trust assumption.

## The Future of Validiums

Validiums continue to evolve:

- **Decentralized DACs**: Transition from small trusted committees to larger, permissionless validator sets.

- **Hybrid Systems**: More projects offering users choice between rollup and validium modes.

- **Improved DA Solutions**: Integration with solutions for trust-minimized off-chain DA.

- **Staked DACs**: DAC members posting stake with slashing for misbehavior.

- **Validium-to-Rollup Paths**: Smooth upgrade paths for projects that start as validiums.

- **Regulatory Frameworks**: Clarification on compliance for validiums.

As EIP-4844 reduces rollup costs, validiums may become less necessary for many applications but will remain the choice for extreme scale requirements.
