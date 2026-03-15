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

A **validium** is a **scaling solution that uses validity proofs (like ZK rollups) to ensure computational correctness but posts transaction data off-chain** to a trusted data availability (DA) committee instead of to Ethereum L1. This hybrid approach enables **10-100x higher throughput and lower costs than ZK rollups** while maintaining cryptographic proof of correct execution, though with an additional trust assumption around data availability.

Validiums occupy a middle ground in the blockchain scaling trilemma: **stronger security than sidechains** (L1 enforces computational correctness via proofs) but **weaker guarantees than rollups** (relies on DA committee instead of L1 data availability). They're ideal for applications that need high throughput and low costs but can tolerate slightly relaxed security assumptions—such as gaming, social media, and high-frequency trading.

Major validium implementations include **StarkEx** (powering dYdX, Immutable X, Sorare), **zkPorter** (zkSync's validium mode), and **Polygon Miden**, collectively processing hundreds of millions of transactions with sub-cent fees.

## How Validiums Work

The validium architecture parallels ZK rollups with one critical difference:

### 1. Transaction Execution

- Users submit transactions to the validium operator
- Operator executes transactions off-chain
- Batches are created (typically thousands of transactions per batch)
- Users receive instant soft confirmations

### 2. Off-Chain Data Posting

**Key Difference from Rollups**:
- Transaction data is NOT posted to Ethereum L1
- Instead, data is posted to a **Data Availability Committee (DAC)**
- DAC consists of trusted parties (e.g., 6 members with 4-of-6 multisig)
- DAC signs attestations that they have received and stored the data
- Only the DAC attestations are posted to L1 (very cheap)

### 3. Proof Generation

- A prover generates a validity proof (ZK-SNARK or ZK-STARK)
- Proof demonstrates that all transactions were executed correctly
- Proof includes commitment to the transaction data (Merkle root)

### 4. L1 Verification

- Proof + data availability attestation submitted to L1 contract
- L1 verifies:
  - The validity proof is correct (computation was done right)
  - The DAC signed off on data availability (enough members attested)
- New state root accepted on L1

### 5. User Withdrawals

- Users can withdraw to L1 if they can provide a Merkle proof of their balance
- If DAC withholds data, users cannot generate proofs and can't withdraw
- **Exit safety depends on DAC honesty**

## Validium vs. ZK Rollup

| Aspect | Validium | ZK Rollup |
|--------|---------|-----------|
| **Data Availability** | Off-chain (DAC) | On-chain (L1) |
| **Security** | Proof + DAC trust | Proof + L1 DA |
| **Throughput** | Very high (10,000+ TPS) | High (1,000-5,000 TPS) |
| **Cost per Transaction** | Very low ($0.001-$0.01) | Low ($0.05-$0.50) |
| **L1 Footprint** | Minimal (just proofs + attestations) | Moderate (proofs + data) |
| **Trust Assumptions** | DAC majority honest | None (L1 guarantees DA) |
| **User Exit Risk** | Can be censored by DAC | Always possible (DA on L1) |
| **Use Cases** | Gaming, social, high-frequency trading | DeFi, high-value transfers |
| **Examples** | StarkEx, zkPorter | zkSync Era, Polygon zkEVM |

**Core Tradeoff**: Validiums trade **data availability trust assumptions** for **massive cost reductions and throughput increases**.

## Data Availability Committees (DAC)

The DAC is the critical component that differentiates validiums:

### Structure

**Membership**: Typically 5-20 trusted entities (exchanges, validators, institutions, community members)

**Threshold**: Require majority (e.g., 4-of-6 or 7-of-10) to sign availability attestations

**Duties**:
- Store transaction data off-chain
- Provide data to users on request
- Sign attestations that data is available
- Participate in data reconstruction if needed

### DAC Examples

**StarkEx DAC** (used by dYdX, Immutable X):
- 6 members including Nethermind, ConsenSys, Consensys Codefi
- 4-of-6 threshold
- Members selected by StarkWare and application operators

**zkPorter DAC** (zkSync):
- Uses zkSync validators as DAC members
- Secured by zkSync token stake
- Slashing for data withholding

**Polygon Miden DAC**:
- Committee of Polygon validators
- Backed by MATIC stake

### DAC Risks

**Collusion**: If majority of DAC members collude, they can withhold data and censor withdrawals.

**Liveness**: If too many DAC members go offline, data might become unavailable (though redundancy helps).

**Censorship**: DAC can censor specific users by refusing to serve their data or include their transactions.

**Regulatory Pressure**: As identifiable entities, DAC members could be pressured to censor transactions.

**Trust Concentration**: Security depends on trusting specific entities, reducing decentralization.

## Benefits of Validiums

Despite trust assumptions, validiums offer significant advantages:

### Massive Cost Reduction

**Transaction Costs**: $0.001-$0.01 per transaction vs. $0.05-$0.50 for rollups.

**Why So Cheap?**
- No L1 calldata/blob costs (biggest expense for rollups)
- Only proofs and tiny attestations posted to L1
- Can batch 100,000+ transactions per proof
- Minimal L1 gas footprint

This makes validiums ideal for micro-transactions and high-frequency applications.

### Very High Throughput

**TPS**: 10,000-50,000+ TPS depending on implementation

**Scalability**: Since L1 data posting doesn't bottleneck, throughput is limited only by:
- Sequencer/operator performance
- Prover speed
- DAC bandwidth

Validiums can handle AAA game transaction volumes or social network activity that rollups cannot.

### Low Latency

**Soft Confirmations**: Instant (<100ms)

**Hard Finality**: Minutes (just proof generation + L1 confirmation), no DAC delays since attestations happen in parallel

Faster finality than rollups since there's less data to post to L1.

### Privacy Potential

Like ZK rollups, validiums can implement privacy features:
- Hide transaction details while proving correctness
- Only reveal data to DAC, not publicly on L1
- Selective disclosure models

## Use Cases for Validiums

Validiums excel in specific scenarios:

### Gaming

**Why**: Games generate millions of micro-transactions (item trades, moves, achievements) that don't individually justify L1 data costs.

**Examples**:
- **Immutable X**: NFT gaming platform using StarkEx validium, processing millions of NFT trades
- **Sorare**: Fantasy sports using StarkEx, handling card trades and game actions

**Trade-off**: Gaming transactions are low-value; users can tolerate small DAC trust for massive cost savings.

### Social Media / Content Platforms

**Why**: Social interactions (posts, likes, follows) need extremely low costs and high throughput.

**Potential**: Twitter-scale (1,000+ tweets/sec) social networks on validiums.

**Trade-off**: Social content isn't high-value; censorship risk from DAC is acceptable vs. centralized platforms.

### High-Frequency Trading

**Why**: HFT needs very low latency and costs, with frequent small trades.

**Example**:
- **dYdX V3**: Used StarkEx validium for perpetuals trading, processing 100,000+ trades daily with instant finality

**Trade-off**: Traders accept DAC trust for superior performance vs. centralized exchanges.

### Non-Financial Applications

**Why**: Applications where security of funds isn't the primary concern but scalability is critical.

**Examples**:
- Loyalty points
- In-game currencies
- Achievement systems
- Social tokens

## Validium Implementations

### StarkEx

**Developer**: StarkWare
**Proof System**: ZK-STARKs

**Features**:
- Powers dYdX, Immutable X, Sorare, DeversiFi
- 6-member DAC with 4-of-6 threshold
- Can process 500,000+ transactions per batch
- Sub-penny transaction costs

**Mode Options**: StarkEx offers both validium mode (off-chain DA) and rollup mode (on-chain DA), allowing applications to choose their tradeoff.

**Status**: Battle-tested, billions in trading volume, millions of users.

### zkPorter

**Developer**: Matter Labs (zkSync)
**Proof System**: ZK-SNARKs

**Features**:
- Validium mode for zkSync
- DAC backed by zkSync token stakers
- Slashing for data withholding
- Hybrid: users choose rollup or validium mode per-account

**Status**: Planned for zkSync 2.0 (zkSync Era), not yet mainnet.

### Polygon Miden

**Developer**: Polygon Labs
**Proof System**: ZK-STARKs

**Features**:
- Client-side proving (users generate their own proofs)
- Validium mode with Polygon validator DAC
- Local data storage by users
- High privacy potential

**Status**: Testnet, planned mainnet 2026.

### StarkNet with Validium Mode

**Developer**: StarkWare
**Proof System**: ZK-STARKs

**Features**:
- StarkNet (the L2) can optionally use validium for specific applications
- Applications choose rollup or validium mode
- Shared proving and settlement infrastructure

**Status**: In development, expected 2026.

## Hybrid Rollup-Validium Models

Some systems offer **hybrid modes** where users choose their security level:

### zkSync's Approach

**zkRollup Mode**:
- Data posted to L1
- Higher security, slower, more expensive
- For high-value assets (ETH, DAI, USDC)

**zkPorter Mode** (Validium):
- Data posted to DAC
- Lower security, faster, cheaper
- For gaming assets, social tokens, small amounts

**Benefits**: Users choose based on needs; high-value stays secure, high-volume goes cheap.

### StarkEx Data Availability Modes

**Rollup Mode**:
- All data on L1
- For applications needing max security

**Validium Mode**:
- All data with DAC
- For applications needing max scale

**Volition Mode** (future):
- Users choose per-transaction
- Flexibility for different asset types

## Security Model

Validium security relies on:

**Computational Correctness**: L1-enforced via validity proofs (no trust needed here—cryptographic guarantee)

**Data Availability**: DAC majority honest (trust assumption)

**State Transitions**: L1 smart contract enforces rules (no trust needed)

**Exit Safety**: Depends on DAC providing data for Merkle proofs

**Realistic Threat Model**:
- If DAC majority is honest → security equivalent to ZK rollup
- If DAC majority is dishonest → users can be censored, funds frozen (but not stolen)
- L1 still prevents invalid state transitions and theft

Validiums accept **liveness/censorship risk** but maintain **safety** (can't steal funds, only freeze them).

## Upgrading from Validium to Rollup

Some validiums plan **upgrade paths** to full rollups:

**Gradual Migration**: Start as validium for low costs during bootstrapping, transition to rollup as value grows.

**Example**: dYdX V3 (StarkEx validium) → dYdX V4 (app chain) → potential future rollup mode.

**Benefit**: Early users get low costs; as the platform matures and stakes increase, stronger security justifies rollup's higher costs.

## Career Opportunities in Validiums

The validium ecosystem offers specialized roles:

**Validium Protocol Engineers** ($180,000 - $400,000+): Build validium systems, integrating ZK proofs with off-chain DA.

**DAC Infrastructure Engineers** ($150,000 - $340,000+): Build and maintain data availability committee infrastructure, storage systems, and attestation protocols.

**ZK Proof Engineers** ($200,000 - $450,000+): Optimize proof generation for high-throughput validium applications.

**Game/Social Developers** ($140,000 - $320,000+): Build applications on validiums, leveraging ultra-low costs for consumer applications.

**Security Researchers** ($160,000 - $360,000+): Audit DACs, analyze trust models, and design improvements to validium security.

Validium expertise combines ZK knowledge with distributed systems and game theory around data availability.

## Best Practices for Validium Developers

When building on validiums:

**Assess Security Needs**: Ensure your application can tolerate DAC trust assumptions; avoid validiums for high-value DeFi.

**Understand DAC**: Research DAC members, threshold, reputation, and governance.

**Design for Exits**: Implement robust exit mechanisms and warn users if DAC seems compromised.

**Leverage Low Costs**: Build applications impossible on rollups due to cost constraints (games, social, micro-transactions).

**Plan for Upgrades**: Consider paths to stronger security (rollup mode, on-chain DA) if application value grows.

**Monitor DAC Health**: Track DAC liveness, member status, and attestation patterns.

**Educate Users**: Clearly communicate the DAC trust assumption and what it means for their assets.

## The Future of Validiums

Validiums continue to evolve:

**Decentralized DACs**: Transition from small trusted committees to larger, permissionless validator sets with economic incentives.

**Hybrid Systems**: More projects offering users choice between rollup and validium modes.

**Improved DA Solutions**: Integration with Celestia, EigenDA, or Avail for trust-minimized off-chain DA.

**Staked DACs**: DAC members posting stake with slashing for misbehavior, reducing trust requirements.

**Validium-to-Rollup Paths**: Smooth upgrade paths for projects that start as validiums and graduate to rollups.

**Regulatory Frameworks**: Clarification on whether validiums require different compliance than rollups.

As EIP-4844 reduces rollup costs, validiums may become less necessary for many applications—but they'll remain the go-to choice for extreme scale requirements (gaming, social, IoT) where even blob costs are too expensive.

**Building high-throughput applications?** Consider validiums if your use case can tolerate DAC trust assumptions in exchange for 10-100x lower costs and higher throughput than rollups. For gaming and consumer apps, the tradeoff often makes sense.
