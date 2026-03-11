---
term: "Ethereum"
slug: "ethereum"
category: "Blockchain Fundamentals"
difficulty: "Beginner"
image: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?q=80&w=1080"
imageAlt: "Ethereum cryptocurrency logo and concept"
description: "A decentralized blockchain platform that enables smart contracts and decentralized applications (dApps), founded by Vitalik Buterin in 2015."
relatedTerms: ["Smart Contract", "Solidity", "Gas Fee", "ERC-20", "DeFi"]
synonyms: ["ETH"]
---

Ethereum is a decentralized blockchain platform that enables developers to build and deploy smart contracts and decentralized applications, extending beyond Bitcoin's focus on peer-to-peer payments to create a programmable foundation for Web3 innovation. Launched in 2015 by Vitalik Buterin and a team of co-founders, Ethereum introduced the concept of a global computer where code executes exactly as programmed without downtime or third-party interference. The platform hosts the majority of decentralized finance activity, with protocols like Uniswap demonstrating its practical utility by facilitating billions in trading volume without traditional intermediaries. Ethereum currently secures over $50 billion in total value locked across its DeFi ecosystem (according to DeFiLlama), making it the dominant smart contract platform by usage and developer activity. For professionals seeking Web3 careers, Ethereum development skills including Solidity programming and EVM architecture remain the most consistently demanded competencies across blockchain job postings.

## The Ethereum Vision

Vitalik Buterin, Ethereum's founder, envisioned a "world computer"—a global, decentralized platform where anyone could deploy code that runs exactly as programmed without downtime, censorship, or third-party interference. This vision has made Ethereum the foundation for most Web3 innovation, including DeFi, NFTs, and DAOs.

The whitepaper, published in late 2013 when Buterin was just 19, proposed a blockchain with a built-in Turing-complete programming language. This meant developers could write arbitrary logic—not just simple payment transactions—that executes on-chain. The platform launched in July 2015 after a crowdsale that raised over $18 million.

## How Ethereum Works

Ethereum operates as a state machine. The "state" represents all account balances, smart contract code, and data stored on the network. When users submit transactions, the network processes them and updates to a new state.

Every node in Ethereum's network runs the Ethereum Virtual Machine (EVM), a runtime environment that executes smart contract code. When you interact with a dApp, you're actually sending transactions that trigger smart contract functions on the EVM.

The EVM is stack-based and executes bytecode compiled from higher-level languages like Solidity. Every operation costs gas, preventing infinite loops and ensuring resource accountability. This design makes Ethereum programmable but also deterministic—given the same inputs, all nodes reach identical state transitions.

## Key Features

**Smart Contracts**: Self-executing code deployed on Ethereum that runs automatically when conditions are met. These enable trustless agreements without intermediaries. Once deployed, smart contracts become immutable (unless specifically designed for upgradability), creating transparent and predictable systems.

**Ether (ETH)**: Ethereum's native cryptocurrency used to pay for transaction fees (gas) and secure the network through staking. ETH serves multiple roles: it's the currency for gas fees, the collateral for DeFi protocols, and the economic security layer for Proof of Stake consensus.

**EVM Compatibility**: Other blockchains can adopt Ethereum's architecture, creating an ecosystem where smart contracts can be ported across networks. Chains like Polygon, Avalanche, and BNB Chain use EVM compatibility to attract Ethereum developers and tap into existing tooling.

**Decentralized Applications**: Thousands of dApps run on Ethereum, from financial protocols to games to social networks. Applications include everything from Uniswap (decentralized exchange) to Axie Infinity (gaming) to ENS (domain names).

## The Merge and Proof of Stake

In September 2022, Ethereum completed "The Merge," transitioning from energy-intensive Proof of Work to Proof of Stake consensus. This change reduced Ethereum's energy consumption by approximately 99.95% and laid groundwork for future scalability improvements.

Under Proof of Stake, validators stake 32 ETH to participate in block production and earn rewards. This replaced miners who previously competed to solve computational puzzles. The Merge represented years of research and one of the most complex engineering feats in blockchain history—transitioning a live $200 billion+ network with zero downtime.

Validators propose and attest to blocks, earning rewards for correct behavior and facing slashing penalties for misbehavior. This economic security model means attacking Ethereum would require acquiring and risking billions of dollars in ETH—a strong disincentive against malicious activity.

## Ethereum's Ecosystem

Ethereum hosts the largest Web3 ecosystem by total value locked and developer activity. Major sectors include:

**DeFi**: Lending protocols like Aave and Compound, decentralized exchanges like Uniswap, and derivatives platforms handle billions in assets. At its peak, DeFi on Ethereum held over $100 billion in total value locked. These protocols compose with each other—you can borrow on Aave, trade on Uniswap, and stake on Lido all in one transaction.

**NFTs**: The majority of NFT marketplaces and collections operate on Ethereum, from art to gaming assets. Collections like CryptoPunks, Bored Ape Yacht Club, and Art Blocks originated on Ethereum. The ERC-721 standard became the de facto specification for digital ownership across the industry.

**DAOs**: Decentralized autonomous organizations coordinate governance and treasury management through Ethereum smart contracts. MakerDAO, Uniswap DAO, and ENS DAO manage hundreds of millions in treasuries through on-chain voting.

**Stablecoins**: Major stablecoins like USDC and DAI are built on Ethereum as ERC-20 tokens. Over $100 billion in stablecoins circulate on Ethereum, serving as the primary medium of exchange for DeFi and crypto trading.

**Identity and Credentials**: ENS (Ethereum Name Service) provides human-readable addresses. Protocols like Proof of Humanity and Worldcoin build identity systems on Ethereum.

## Scaling Solutions

Ethereum's base layer processes about 15-30 transactions per second. To address this limitation, Layer 2 solutions like Arbitrum, Optimism, and zkSync bundle transactions off-chain and settle them on Ethereum's mainnet, achieving 1000x+ improvements in throughput while maintaining security.

Rollups—the dominant L2 approach—batch hundreds of transactions, prove their validity cryptographically, and post minimal data to Ethereum. Optimistic rollups assume transactions are valid unless challenged; ZK-rollups use zero-knowledge proofs for instant finality.

The roadmap ahead focuses on data availability improvements (Proto-Danksharding/EIP-4844) that will make rollups even cheaper, potentially supporting millions of transactions per second across the L2 ecosystem.

## Token Standards

Ethereum pioneered token standards that became industry-wide conventions:

**ERC-20**: Fungible tokens (coins that are interchangeable). Most cryptocurrencies on Ethereum follow ERC-20.

**ERC-721**: Non-fungible tokens (unique, non-interchangeable assets). The standard for NFTs and digital collectibles.

**ERC-1155**: Semi-fungible tokens supporting both fungible and non-fungible items in one contract. Popular in gaming.

These standards enable composability—any wallet or protocol supporting the standard can interact with any token following it.

## Career Opportunities

Ethereum's dominance in Web3 has created massive demand for developers proficient in Solidity, the primary language for Ethereum smart contracts. Companies hire Ethereum developers, smart contract auditors, protocol engineers, and DeFi specialists. Knowledge of Ethereum's architecture, gas optimization, and security best practices commands premium salaries in the blockchain job market.

Roles span:

**Solidity Development**: Writing smart contracts for dApps, DeFi protocols, and NFT projects.

**Smart Contract Auditing**: Reviewing code for vulnerabilities before deployment. Auditors prevent hacks that could drain millions.

**Protocol Engineering**: Building core infrastructure—wallets, indexers, oracles, and scaling solutions.

**DeFi Engineering**: Creating lending protocols, DEXs, derivatives platforms, and yield strategies.

**Research**: Working on Ethereum's roadmap, cryptographic improvements, and formal verification.

Ethereum's ecosystem offers some of the highest-paying Web3 roles, with senior engineers often earning $200k-$500k+ when including token compensation.
