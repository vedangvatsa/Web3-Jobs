---
title: "Real-World Assets (RWAs)"
description: "How tokenization is bringing stocks, bonds, real estate, and commodities on-chain."
order: 8
readTime: "10 min"
difficulty: "intermediate"
prerequisites: ["lending"]
quiz:
 - question: "What are Real-World Assets (RWAs) in crypto?"
 options:
 - "Physical items like gold bars stored in vaults."
 - "Traditional financial assets (bonds, stocks, real estate) represented as tokens on a blockchain."
 - "NFTs of real-world photos."
 - "Stablecoins backed by real USD."
 correct: 1
 explanation: "RWAs are tokens that represent ownership of or exposure to traditional financial assets like US Treasury bonds, real estate, private credit, and equities, bringing them into the DeFi ecosystem."
 - question: "Why is RWA tokenization growing rapidly?"
 options:
 - "Because crypto is replacing all traditional finance."
 - "Because DeFi yields declined, making tokenized Treasury bonds (earning 4-5%) attractive as low-risk yield sources for on-chain capital."
 - "Because regulators require it."
 - "Because gas fees are now zero."
 correct: 1
 explanation: "After the DeFi yield compression of 2022-2023, stablecoin holders sought safer yield. Tokenized Treasuries offer US government-backed 4-5% yields accessible 24/7 on-chain."
---

## What Are RWAs?

Real-World Assets (RWAs) are traditional financial instruments — government bonds, corporate debt, real estate, commodities, equities — that have been **tokenized** on a blockchain.

Tokenization means creating a digital token that represents legal ownership or economic exposure to the underlying asset. When you hold a tokenized Treasury bond, you hold a token that entitles you to the same yield as holding the actual bond.

## Why RWAs Are the Fastest-Growing DeFi Sector

After the DeFi summer of 2020-2021, on-chain yields collapsed. Liquidity mining rewards dried up. Stablecoin yields on Aave and Compound dropped below 1%. Meanwhile, the Federal Reserve raised interest rates, making US Treasury bonds yield 4-5%.

This created a massive arbitrage: **trillions of dollars in stablecoins sitting on-chain earning near-zero yield, while off-chain Treasuries offered risk-free 5%.**

RWA protocols bridge this gap by bringing those yields on-chain.

## Major RWA Categories

### Tokenized US Treasuries
The largest and fastest-growing category. Protocols issue tokens backed 1:1 by US Treasury bills.

- **Ondo Finance (USDY):** Offers tokenized Treasury exposure. USDY automatically accrues yield.
- **Mountain Protocol (USDM):** A regulated, yield-bearing stablecoin backed by short-term Treasuries.
- **BlackRock's BUIDL:** The world's largest asset manager entered crypto with a tokenized Treasury fund on Ethereum.

The total value of tokenized Treasuries grew from ~$100M in early 2023 to over $2.5 billion by 2024.

### Private Credit
Protocols that tokenize loans to real-world businesses, offering DeFi investors exposure to corporate lending yields.

- **Maple Finance:** Institutional lending pools where borrowers are vetted companies (trading firms, fintech companies).
- **Goldfinch:** Lending to businesses in emerging markets, connecting DeFi capital with real-world borrowers.
- **Centrifuge:** Tokenizes invoices, mortgages, and other structured finance products.

### Real Estate
Fractional ownership of real estate properties via tokens.

- **RealT:** Tokenized rental properties in the US. Token holders earn daily rental income.
- **Parcl:** Synthetic exposure to real estate price indices.

### Commodities
- **Paxos Gold (PAXG):** Each token is backed by one fine troy ounce of London Good Delivery gold.
- **Tether Gold (XAUT):** Similar gold-backed token.

## How Tokenization Works

1. **Asset Selection:** A real-world asset (e.g., $10M in T-bills) is identified.
2. **Legal Wrapper:** A Special Purpose Vehicle (SPV) or trust holds the asset. Legal documentation establishes that token holders have a claim on the underlying asset.
3. **Token Minting:** An ERC-20 token is minted representing shares in the SPV.
4. **Redemption:** Token holders can redeem their tokens for the underlying asset or its cash equivalent.

The legal wrapper is the critical piece. Without proper legal structure, you are holding a token that *claims* to be backed by an asset, but has no enforceable legal claim. Always verify the legal structure.

## Risks

- **Regulatory uncertainty:** Securities laws vary by jurisdiction, and many RWA tokens may be classified as securities.
- **Counterparty risk:** You are trusting the issuer to actually hold and manage the underlying assets.
- **Liquidity:** Many RWA tokens have thin secondary markets.
- **Legal enforceability:** In bankruptcy, token holders' claims may not be recognized by courts in all jurisdictions.

## Why This Matters

RWAs represent the most likely bridge between traditional finance (a $600 trillion market) and DeFi (a ~$100 billion market). If even 1% of traditional financial assets are tokenized, that represents $6 trillion flowing on-chain — orders of magnitude larger than current DeFi TVL.

Major institutions (BlackRock, JPMorgan, Franklin Templeton) are already building on-chain, signaling that RWA tokenization is not a niche experiment but a long-term structural shift.

## Key Takeaways

- RWAs bring real-world yields (Treasuries, credit, real estate) on-chain.
- Tokenized Treasuries are the fastest-growing DeFi sector, exceeding $2.5B.
- Legal structure is critical — always verify the SPV or trust backing the tokens.
- RWAs may be the bridge that brings trillions from TradFi into DeFi.
