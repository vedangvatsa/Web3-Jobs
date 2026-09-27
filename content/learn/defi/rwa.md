---
title: Real-World Assets (RWAs)
description: >-
  How tokenization is bringing stocks, bonds, real estate, and commodities
  on-chain.
order: 8
readTime: 10 min
difficulty: intermediate
prerequisites:
  - lending
quiz:
  - question: What are Real-World Assets (RWAs) in crypto?
    options:
      - Physical items like gold bars stored in vaults.
      - >-
        Traditional financial assets (bonds, stocks, real estate) represented as
        tokens on a blockchain.
      - NFTs of real-world photos.
      - Stablecoins backed by real USD.
    correct: 1
    explanation: >-
      RWAs are tokens that represent ownership of or exposure to traditional
      financial assets like US Treasury bonds, real estate, private credit, and
      equities, bringing them into the DeFi ecosystem.
  - question: Why is RWA tokenization growing rapidly?
    options:
      - Because crypto is replacing all traditional finance.
      - >-
        Because DeFi yields declined, making tokenized Treasury bonds (earning
        4-5%) attractive as low-risk yield sources for on-chain capital.
      - Because regulators require it.
      - Because gas fees are now zero.
    correct: 1
    explanation: >-
      After the DeFi yield compression of 2022-2023, stablecoin holders sought
      safer yield. Tokenized Treasuries offer US government-backed 4-5% yields
      accessible 24/7 on-chain.
  - question: What is a 'Real World Asset' (RWA) in the context of DeFi?
    options:
      - A physical object stored on the blockchain.
      - >-
        A token that represents ownership or a claim on a real-world asset like
        US Treasuries, real estate, or private credit.
      - A stablecoin.
      - An NFT of a real painting.
    correct: 1
    explanation: >-
      RWA tokenization creates on-chain representations of off-chain assets. A
      tokenized Treasury bill, for example, is a token backed by actual US
      government debt, giving holders the yield and security of Treasuries with
      the composability of DeFi.
  - question: >-
      What legal entity typically sits between the real-world asset and the
      on-chain token?
    options:
      - A DAO.
      - >-
        A Special Purpose Vehicle (SPV) - a legal entity that holds the actual
        asset and issues tokens representing claims on it.
      - A centralized exchange.
      - A mining pool.
    correct: 1
    explanation: >-
      An SPV is a legal entity created specifically to hold the underlying asset
      (e.g., Treasury bills). The SPV issues tokens that represent fractional
      ownership. This is the bridge between the legal system and the blockchain.
  - question: >-
      What is the primary risk of RWA tokens compared to fully on-chain DeFi
      assets?
    options:
      - They are more volatile.
      - >-
        They depend on off-chain custodians and legal systems - if the entity
        holding the real asset defaults, mismanages funds, or faces regulatory
        action, token holders may lose value.
      - They use too much gas.
      - They cannot be traded.
    correct: 1
    explanation: >-
      Unlike fully on-chain assets where 'code is law,' RWA tokens require trust
      in off-chain entities: the custodian holding the asset, the legal
      jurisdiction governing the SPV, and the oracle reporting the asset's
      value. This reintroduces counterparty risk that pure DeFi eliminates.
lastUpdated: 2026-09-04
---

## What Are RWAs?

Real-World Assets (RWAs) are traditional financial instruments - government bonds, corporate debt, real estate, commodities, equities - that have been **tokenized** on a blockchain.

Tokenization means creating a digital token that represents legal ownership or economic exposure to the underlying asset. When you hold a tokenized Treasury bond, you hold a token that entitles you to the same yield as holding the actual bond.

## Why an asset issuer might use tokens

After the DeFi summer of 2020-2021, on-chain yields collapsed. Liquidity mining rewards dried up. Stablecoin yields on Aave and Compound dropped below 1%. Meanwhile, the Federal Reserve raised interest rates, making US Treasury bonds yield 4-5%.

A tokenized product can make an off-chain asset accessible through an on-chain interface. Its return still depends on the asset, fees, legal structure, and access terms; a Treasury-backed token is not interchangeable with a directly held Treasury security.

RWA protocols bridge this gap by bringing those yields on-chain.

## Major RWA Categories

### Tokenized US Treasuries
Tokenized Treasury products can represent interests in funds, notes, or other legal structures. Check what the specific token represents and which assets back it.

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

<div class="diagram">
<svg viewBox="0 0 800 160" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
 <rect x="10" y="50" width="140" height="60" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
 <text x="80" y="75" text-anchor="middle" font-size="12" font-weight="600" fill="#92400e">Real Asset</text>
 <text x="80" y="93" text-anchor="middle" font-size="10" fill="#b45309">$10M in T-Bills</text>

 <line x1="150" y1="80" x2="200" y2="80" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arwa)"/>

 <rect x="200" y="50" width="140" height="60" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
 <text x="270" y="75" text-anchor="middle" font-size="12" font-weight="600" fill="#1e40af">SPV / Trust</text>
 <text x="270" y="93" text-anchor="middle" font-size="10" fill="#3b82f6">Holds asset legally</text>

 <line x1="340" y1="80" x2="390" y2="80" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#arwa2)"/>

 <rect x="390" y="50" width="140" height="60" rx="8" fill="#dcfce7" stroke="#22c55e" stroke-width="2"/>
 <text x="460" y="75" text-anchor="middle" font-size="12" font-weight="600" fill="#166534">ERC-20 Token</text>
 <text x="460" y="93" text-anchor="middle" font-size="10" fill="#22c55e">Minted on-chain</text>

 <line x1="530" y1="80" x2="580" y2="80" stroke="#22c55e" stroke-width="1.5" marker-end="url(#arwa3)"/>

 <rect x="580" y="50" width="140" height="60" rx="8" fill="#fdf2f8" stroke="#ec4899" stroke-width="2"/>
 <text x="650" y="75" text-anchor="middle" font-size="12" font-weight="600" fill="#9d174d">DeFi</text>
 <text x="650" y="93" text-anchor="middle" font-size="10" fill="#ec4899">Lend, trade, collateral</text>

 <text x="400" y="140" text-anchor="middle" font-size="11" fill="#94a3b8">Token holders can redeem for underlying asset or cash equivalent</text>

 <defs>
 <marker id="arwa" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#f59e0b"/></marker>
 <marker id="arwa2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#3b82f6"/></marker>
 <marker id="arwa3" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#22c55e"/></marker>
 </defs>
</svg>
</div>

## Risks

- **Regulatory uncertainty:** Securities laws vary by jurisdiction, and many RWA tokens may be classified as securities.
- **Counterparty risk:** You are trusting the issuer to actually hold and manage the underlying assets.
- **Liquidity:** Many RWA tokens have thin secondary markets.
- **Legal enforceability:** In bankruptcy, token holders' claims may not be recognized by courts in all jurisdictions.

## Why This Matters

Evaluate the claim represented by the token, who holds the underlying assets, how valuations are reported, and how redemption works. Market-size forecasts do not establish those rights.

Institutional tokenization projects use different legal and technical structures. Read the documents for the specific product rather than infer its terms from its issuer's name.

## Key Takeaways

- RWAs bring real-world yields (Treasuries, credit, real estate) on-chain.
- Tokenized Treasury products differ in legal claims, fees, eligibility, and redemption terms.
- Legal structure is critical - always verify the SPV or trust backing the tokens.
- A token's enforceable rights and redemption terms matter more than forecasts about sector size.
