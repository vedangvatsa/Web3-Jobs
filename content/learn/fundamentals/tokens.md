---
title: What Are Tokens?
description: >-
  ETH, stablecoins, governance tokens, and utility tokens - what they are and
  how they work.
order: 7
readTime: 9 min
difficulty: beginner
prerequisites:
  - transactions
quiz:
  - question: What is the difference between a coin and a token?
    options:
      - They are the same thing
      - >-
        A coin is native to its blockchain (like ETH), a token is created by a
        smart contract on that blockchain
      - Coins are more valuable than tokens
      - Tokens can only be used for voting
    correct: 1
    explanation: >-
      ETH is a coin - it is native to Ethereum. USDC is a token - it was created
      by a smart contract deployed on Ethereum. Both live on the same
      blockchain, but coins are built into the protocol while tokens are created
      by developers.
  - question: What does ERC-20 define?
    options:
      - How NFTs work
      - How to run a validator node
      - A standard set of functions all fungible tokens must have
      - The price of Ethereum
    correct: 2
    explanation: >-
      ERC-20 defines functions like transfer(), balanceOf(), and approve().
      Because all ERC-20 tokens share these functions, any wallet, exchange, or
      DeFi protocol can work with any ERC-20 token.
  - question: What is a governance token used for?
    options:
      - Paying gas fees
      - Mining cryptocurrency
      - Voting on protocol decisions
      - Storing files on-chain
    correct: 2
    explanation: >-
      Governance tokens give holders voting power over protocol decisions. UNI
      holders vote on Uniswap changes, AAVE holders vote on Aave risk
      parameters, and MKR holders vote on MakerDAO policies.
  - question: What makes a token 'fungible'?
    options:
      - It can only be used once
      - Every unit is identical and interchangeable
      - It is connected to a physical object
      - It cannot be transferred
    correct: 1
    explanation: >-
      Fungible means interchangeable. One USDC is identical to any other USDC,
      just like one dollar bill is the same as any other dollar bill. NFTs are
      non-fungible - each one is unique.
  - question: What does 'token supply' mean?
    options:
      - How fast tokens can be sent
      - The total number of tokens that exist or will ever exist
      - The price of the token
      - The number of people who own the token
    correct: 1
    explanation: >-
      Token supply is the total number of tokens. Bitcoin has a fixed supply of
      21 million. ETH has no hard cap but burns some tokens with each
      transaction. Some tokens have inflationary supply, others are
      deflationary.
lastUpdated: 2026-09-04
---

## Coins vs tokens

People use "coin" and "token" interchangeably, but they are different things.

A **coin** is native to its blockchain. ETH is Ethereum's coin. BTC is Bitcoin's coin. You need the native coin to pay gas fees.

A **token** is created by a smart contract on an existing blockchain. USDC, UNI, and LINK are tokens built on Ethereum. They follow the ERC-20 standard so they work with any Ethereum wallet.

<div class="diagram">
<svg viewBox="0 0 800 180" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
 <rect x="20" y="20" width="760" height="140" rx="12" fill="#f8fafc" stroke="#334155" stroke-width="1.5"/>
 <text x="400" y="48" text-anchor="middle" font-size="14" font-weight="bold" fill="#1e293b">Ethereum Blockchain</text>

 <rect x="50" y="65" width="130" height="75" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
 <text x="115" y="90" text-anchor="middle" font-size="13" font-weight="bold" fill="#1e40af">ETH</text>
 <text x="115" y="108" text-anchor="middle" font-size="10" fill="#64748b">Native coin</text>
 <text x="115" y="123" text-anchor="middle" font-size="10" fill="#64748b">Pays for gas</text>

 <rect x="210" y="65" width="130" height="75" rx="8" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
 <text x="275" y="90" text-anchor="middle" font-size="13" font-weight="600" fill="#166534">USDC</text>
 <text x="275" y="108" text-anchor="middle" font-size="10" fill="#64748b">ERC-20 token</text>
 <text x="275" y="123" text-anchor="middle" font-size="10" fill="#64748b">Stablecoin</text>

 <rect x="370" y="65" width="130" height="75" rx="8" fill="#fefce8" stroke="#eab308" stroke-width="1.5"/>
 <text x="435" y="90" text-anchor="middle" font-size="13" font-weight="600" fill="#854d0e">UNI</text>
 <text x="435" y="108" text-anchor="middle" font-size="10" fill="#64748b">ERC-20 token</text>
 <text x="435" y="123" text-anchor="middle" font-size="10" fill="#64748b">Governance</text>

 <rect x="530" y="65" width="130" height="75" rx="8" fill="#fdf2f8" stroke="#ec4899" stroke-width="1.5"/>
 <text x="595" y="90" text-anchor="middle" font-size="13" font-weight="600" fill="#9d174d">LINK</text>
 <text x="595" y="108" text-anchor="middle" font-size="10" fill="#64748b">ERC-20 token</text>
 <text x="595" y="123" text-anchor="middle" font-size="10" fill="#64748b">Utility</text>

 <rect x="690" y="65" width="70" height="75" rx="8" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4"/>
 <text x="725" y="100" text-anchor="middle" font-size="11" fill="#94a3b8">1000s</text>
 <text x="725" y="115" text-anchor="middle" font-size="11" fill="#94a3b8">more</text>
</svg>
</div>

## Types of tokens

Tokens serve different purposes. The four main categories:

### Stablecoins

Designed to hold a steady value, usually $1. Used for trading, payments, and savings without price volatility.

- **USDC** - backed by cash and US Treasury bonds. Issued by Circle.
- **USDT (Tether)** - the most widely traded stablecoin. Backed by reserves.
- **DAI** - backed by crypto collateral locked in smart contracts. No company controls it.

### Governance tokens

Give holders the right to vote on protocol decisions.

- **UNI** - vote on Uniswap fee structures and treasury spending
- **AAVE** - vote on lending risk parameters and new asset listings
- **MKR** - vote on MakerDAO stability fees and collateral types

### Utility tokens

Required to use a specific service.

- **LINK** - paid to Chainlink oracle nodes for providing off-chain data to smart contracts
- **FIL** - paid to Filecoin storage providers for decentralized file storage
- **GRT** - paid to indexers on The Graph for querying blockchain data

### Wrapped tokens

Represent an asset from another blockchain.

- **WBTC** (Wrapped Bitcoin) - Bitcoin represented as an ERC-20 token on Ethereum
- **WETH** (Wrapped ETH) - ETH wrapped in an ERC-20 format for DeFi compatibility

## Token supply and economics

Every token has a supply schedule. This matters because supply affects price.

| Token | Max supply | Model |
| --- | --- | --- |
| BTC | 21 million | Fixed, halving every ~4 years |
| ETH | No hard cap | Net issuance can be negative (deflationary since EIP-1559) |
| USDC | No cap | Minted when dollars are deposited, burned when redeemed |
| UNI | 1 billion | Fixed, fully distributed over 4 years |

**Inflationary** tokens continuously mint new tokens (like new money being printed). **Deflationary** tokens burn tokens over time, reducing supply. ETH burns a portion of gas fees, which sometimes makes it deflationary during high-usage periods.

## Key takeaways

- **Coins** (ETH, BTC) are native to their blockchain. **Tokens** (USDC, UNI) are created by smart contracts.
- ERC-20 is the standard that makes all tokens compatible with every Ethereum wallet and app.
- Tokens come in four main types: stablecoins, governance, utility, and wrapped.
- Token supply (fixed, inflationary, or deflationary) directly affects value over time.
