---
term: MEV Supply Chain
slug: mev-supply-chain
category: defi
difficulty: advanced
image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80'
description: >-
  The MEV supply chain describes the flow of Maximum Extractable Value from
  transaction originators through searchers, builders, and relays to
  validators/proposers. This multi-party system has evolved from simple MEV
  extraction to a complex market with specialized roles and infrastructure.
relatedTerms:
  - mev
  - flashbots
  - proposer-builder-separation
  - block-builder
  - searcher
synonyms:
  - MEV pipeline
  - Block production supply chain
  - PBS supply chain
---

The **MEV supply chain** (also called the **MEV pipeline** or **block production supply chain**) is the multi-stage value flow that begins with on-chain transaction opportunities and ends with validators/proposers receiving a share of the extracted MEV. This supply chain has evolved from a simple two-party system (searchers directly bribing miners) to a complex four-party ecosystem involving **searchers**, **builders**, **relays**, and **proposers**, each playing a specialized role in identifying, packaging, and capturing MEV opportunities.

Understanding the MEV supply chain is critical for comprehending modern Ethereum block production, as MEV extraction influences transaction ordering, gas prices, and user experience. The supply chain architecture, pioneered by Flashbots and formalized through proposer-builder separation (PBS), has become the standard for Ethereum mainnet.

## The Four Parties of the MEV Supply Chain

The modern MEV supply chain consists of four distinct roles:

### 1. Searchers

- **Searchers** (also called "MEV searchers" or "bots") are actors who continuously scan the mempool and blockchain state to identify profitable MEV opportunities. Searchers run algorithms to detect:

  - **Arbitrage opportunities**: Price discrepancies across DEXs that can be exploited for profit
  - **Liquidation opportunities**: Undercollateralized positions in lending protocols like Aave or Compound
  - **Sandwich attack opportunities**: Large trades that can be front-run and back-run for profit
  - **NFT sniping**: Underpriced NFT listings or mints

When searchers identify an opportunity, they construct a **bundle** of transactions designed to extract the MEV (e.g., a flash loan to fund arbitrage, the arbitrage trades, and repayment). Searchers compete to submit the most profitable bundles to builders.

Successful searchers use advanced strategies: custom smart contracts, high-performance infrastructure (co-location near relays), private transaction pools, and algorithms (reinforcement learning, game theory models).

### 2. Builders

- **Builders** (also called "block builders") are specialized entities that construct full Ethereum blocks by assembling bundles from searchers with transactions from the public mempool. Builders compete to create the most valuable blocks (highest total fees + MEV) to maximize the payment they can offer to proposers.

Builders receive bundles from multiple searchers simultaneously and must:
- **Simulate bundle execution** to verify profitability and ensure they don't revert
- **Solve the block packing problem**: optimally arrange bundles and transactions to maximize value within gas limits
- **Balance searcher payments and proposer bids**: extract sufficient margin while remaining competitive
- **Handle conflicts**: resolve situations where multiple bundles try to extract the same MEV opportunity

Leading builders like Titan, Beaver Build, and Flashbots Builder dominate the market. Builder centralization is a major concern for censorship resistance.

### 3. Relays

- **Relays** are intermediaries that sit between builders and proposers, enabling communication while preventing theft. Relays serve several critical functions:

  - **Receive sealed blocks** from builders with bid amounts (but not full block content)
  - **Validate blocks** for correctness (proper gas limits, valid transactions, accurate bid amounts)
  - **Forward the highest bid** to the proposer without revealing block contents
  - **Escrow block contents** until the proposer commits to the block
  - **Release the full block** only after the proposer has cryptographically committed to it

This "sealed bid auction" model prevents proposers from stealing MEV by looking at block contents and rebuilding the block themselves. Relays are currently trusted entities (operated by Flashbots, bloXroute, Aestus, etc.), though researchers are working on trustless relay designs.

### 4. Proposers (Validators)

- **Proposers** are Ethereum validators selected by the consensus layer to propose the next block. In the PBS model, proposers:

  - **Receive block bids** from multiple relays
  - **Select the highest bid** (maximizing their MEV revenue)
  - **Commit to the block** by signing a block header
  - **Receive the full block content** from the relay after committing
  - **Propose the block** to the network
  - **Collect payment** (the builder's bid plus normal priority fees)

Proposers effectively "rent out" their block space to the highest-bidding builder, capturing MEV revenue without needing to run sophisticated MEV extraction strategies themselves. This democratizes MEV rewards across all validators, not just those with technical MEV extraction capabilities.

## The MEV Supply Chain Flow

Here's how value flows through the system:

1. **Opportunity Discovery**: A user submits a large DEX swap to the mempool
2. **Searcher Detection**: Multiple searchers detect the sandwich attack opportunity
3. **Bundle Construction**: Each searcher creates a bundle (front-run tx, victim tx, back-run tx) and calculates profit
4. **Bundle Submission**: Searchers submit bundles to builders with a bid (percentage of profit)
5. **Block Construction**: Builders simulate all bundles, select the most profitable ones, and construct a complete block
6. **Block Auction**: Builders submit sealed blocks to relays with bids for the proposer
7. **Relay Validation**: Relays validate blocks and forward bids to the proposer
8. **Proposer Selection**: The proposer selects the highest bid
9. **Commitment and Release**: Proposer commits, relay releases full block
10. **Block Proposal**: Proposer includes the block in the blockchain
11. **Value Distribution**: MEV flows from the victim to the searcher, then to the builder, relay (fees), and proposer

The victim loses value to the sandwich, the searcher takes profit minus their builder payment, the builder takes margin minus their proposer bid, and the proposer receives the bid amount.

## Value Capture at Each Stage

The MEV supply chain distributes value across its participants:

- **Searchers**: Capture a portion of gross MEV after paying builders, depending on competition and bundle quality. Elite searchers with proprietary strategies capture more; commodity arbitrage yields less.

- **Builders**: Capture a margin between the value they receive from searchers and the bids they pay to proposers. Margins have compressed as builder competition intensified.

- **Relays**: Charge minimal fees or operate as public goods. Some relays charge subscription fees instead.

- **Proposers**: Capture a significant portion of gross MEV through competitive builder bids, boosting validator returns beyond base issuance and priority fees.

- **Users (Victims)**: Lose value to MEV extraction, especially in sandwich attacks.

## Evolution of the MEV Supply Chain

The MEV supply chain has evolved significantly:

- **2019-2020**: Simple two-party model, searchers directly bribe miners via gas auctions, leading to network congestion and inefficiency.

- **2021**: Flashbots launches MEV-Geth, introducing bundles and off-chain auctions, significantly improving efficiency and reducing spam.

- **2022**: PBS architecture is formalized, relays are introduced, and MEV-Boost is launched. Builder role professionalizes with dedicated entities.

- **2023-2024**: Builder market consolidates, relay diversity increases, and order flow auctions emerge. Privacy and censorship concerns intensify.

- **2025-2026**: In-protocol PBS proposals mature, enshrined builder selection moves on-chain, and cross-domain MEV emerges as a new frontier.

## Concerns and Criticisms

The MEV supply chain faces several criticisms:

- **Builder Centralization**: A small number of builders control a significant portion of blocks, creating censorship risks. OFAC-compliant builders may censor transactions from sanctioned addresses.

- **Relay Trust Assumptions**: Relays are trusted intermediaries that could collude with builders or proposers, steal MEV, or censor transactions.

- **User Harm**: The supply chain efficiently extracts value from users, particularly in sandwich attacks.

- **Complexity and Opacity**: The multi-party system is opaque to regular users who do not understand why their transactions are being reordered or why they are receiving worse prices.

- **Validator Inequality**: Sophisticated stakers can run their own builders/relays to capture more MEV, while home stakers rely on public infrastructure and capture less.

- **Systemic Risk**: The entire block production process depends on a small number of entities (builders and relays), creating single points of failure.

## Career Opportunities in the MEV Supply Chain

The MEV ecosystem has created specialized roles:

- **MEV Searchers**: Build and operate MEV extraction bots, requiring deep DeFi knowledge, algorithmic trading skills, and smart contract expertise.

- **Block Builder Engineers**: Design and optimize block construction algorithms, manage searcher relationships, and operate high-performance infrastructure.

- **Relay Operators**: Run and maintain relay infrastructure, implement validation logic, and ensure uptime and censorship resistance.

- **MEV Researchers**: Study MEV markets, propose protocol improvements, model game-theoretic incentives, and design user protection mechanisms.

- **Smart Contract Auditors (MEV Focus)**: Audit MEV-related smart contracts for security vulnerabilities and economic exploits.

This field rewards deep technical knowledge and rapid execution.

## Protecting Against MEV Extraction

Users and protocols can take steps to reduce MEV exposure:

- **Use Private Mempools**: Submit transactions to services that hide transactions from public searchers.

- **Choose MEV-Protected RPCs**: Use RPC endpoints that route to MEV-protected builders or encrypt transaction content.

- **Avoid Large Public Market Orders**: Break large trades into smaller pieces or use TWAP execution to reduce sandwich profitability.

- **Use MEV-Resistant Protocols**: Use DEXs with built-in MEV protection.

- **Time Transactions Carefully**: Execute during low-volatility periods when arbitrage opportunities are smaller.

- **Understand Slippage Settings**: Tight slippage tolerance prevents large sandwiches but increases failure risk; find the right balance.

## The Future of the MEV Supply Chain

The MEV supply chain continues to evolve:

- **Enshrined PBS**: Moving builder selection on-chain to reduce relay trust assumptions and improve censorship resistance.

- **Inclusion Lists**: Allowing proposers to force inclusion of certain transactions, preventing builder censorship.

- **MEV Redistribution**: Protocols that redistribute proposer MEV rewards across all validators to reduce inequality.

- **Cross-Domain MEV**: Extending the supply chain to cover L2 rollups, app chains, and cross-chain MEV opportunities.

- **Encrypted Mempools**: Threshold encryption and time-lock puzzles to hide transaction content until after ordering, reducing front-running.

The supply chain that emerges from these innovations will shape Ethereum's decentralization and fairness for years to come.

- **Want to participate in the MEV economy?** Start by running a searcher on testnets, study builder algorithms, or contribute to relay infrastructure. The MEV supply chain rewards technical excellence and strategic thinking.
