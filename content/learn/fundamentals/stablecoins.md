---
title: 'Stablecoins: Digital Dollars'
description: 'How USDC, USDT, and DAI maintain their $1 peg and why they matter for Web3.'
order: 8
readTime: 9 min
difficulty: beginner
prerequisites:
  - tokens
quiz:
  - question: Why do stablecoins exist?
    options:
      - To replace Bitcoin
      - 'To provide a stable store of value in crypto, avoiding price volatility'
      - To mine new cryptocurrency
      - To track stock market prices
    correct: 1
    explanation: >-
      Crypto prices are volatile - ETH can move 10% in a day. Stablecoins stay
      at $1, making them useful for trading, payments, and savings without price
      risk.
  - question: How does USDC maintain its $1 peg?
    options:
      - An algorithm controls the supply
      - The government sets the price
      - Each USDC is backed by real cash and short-term US Treasury bonds
      - Miners agree to keep the price at $1
    correct: 2
    explanation: >-
      USDC is backed 1:1 by reserves held by Circle. These reserves are cash and
      short-term US Treasury bonds, verified by independent accounting firms
      each month.
  - question: What is the main risk of centralized stablecoins like USDC?
    options:
      - They could lose their peg if the backing company has problems
      - They are too slow to use
      - They require mining
      - They can only be used on one blockchain
    correct: 0
    explanation: >-
      Centralized stablecoins depend on the issuing company. If Circle faced a
      regulatory shutdown or its reserve bank failed, USDC's peg could be at
      risk. This happened briefly in March 2023 when Silicon Valley Bank
      collapsed.
  - question: How is DAI different from USDC?
    options:
      - DAI is worth more than USDC
      - 'DAI is backed by crypto collateral in smart contracts, not by a company'
      - DAI can only be used for NFTs
      - DAI is issued by Coinbase
    correct: 1
    explanation: >-
      DAI is created by locking up crypto (like ETH) as collateral in MakerDAO
      smart contracts. No company controls DAI. It is decentralized, but the
      trade-off is more complexity and potential for collateral liquidation.
  - question: What is the total stablecoin market cap approximately?
    options:
      - About $1 billion
      - About $10 billion
      - Over $150 billion
      - Over $1 trillion
    correct: 2
    explanation: >-
      The total stablecoin market cap is over $150 billion as of 2024, with USDT
      being the largest. Stablecoins are the most widely used tokens in crypto.
lastUpdated: 2026-09-04
---

## The problem stablecoins solve

ETH can drop 20% in a week. Bitcoin has fallen 50% in a few months. If you are a freelancer getting paid in crypto, or a business accepting crypto payments, this volatility is a problem.

Stablecoins fix this. They are tokens designed to always be worth $1 (or another fixed value). You get the benefits of crypto (instant transfers, no bank needed, works 24/7) without the price rollercoaster.

## Three ways to stay stable

There are three approaches to keeping a token worth $1. Each has trade-offs.

<div class="diagram">
<svg viewBox="0 0 800 280" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
 <!-- Fiat-backed -->
 <rect x="20" y="20" width="240" height="240" rx="12" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
 <text x="140" y="48" text-anchor="middle" font-size="14" font-weight="bold" fill="#1e40af">Fiat-Backed</text>
 <text x="140" y="68" text-anchor="middle" font-size="11" fill="#3b82f6">USDC, USDT</text>
 <line x1="40" y1="78" x2="240" y2="78" stroke="#bfdbfe" stroke-width="1"/>
 <text x="140" y="100" text-anchor="middle" font-size="11" fill="#64748b">$1 token = $1 in a bank</text>
 <text x="140" y="120" text-anchor="middle" font-size="11" fill="#64748b">Reserves: cash + Treasuries</text>
 <text x="140" y="140" text-anchor="middle" font-size="11" fill="#64748b">Audited monthly</text>
 <line x1="40" y1="155" x2="240" y2="155" stroke="#bfdbfe" stroke-width="1"/>
 <text x="140" y="175" text-anchor="middle" font-size="11" fill="#22c55e">✓ Simple and reliable</text>
 <text x="140" y="195" text-anchor="middle" font-size="11" fill="#22c55e">✓ Easy to understand</text>
 <text x="140" y="220" text-anchor="middle" font-size="11" fill="#ef4444">⚠ Centralized (company)</text>
 <text x="140" y="240" text-anchor="middle" font-size="11" fill="#ef4444">⚠ Can freeze accounts</text>

 <!-- Crypto-backed -->
 <rect x="280" y="20" width="240" height="240" rx="12" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
 <text x="400" y="48" text-anchor="middle" font-size="14" font-weight="bold" fill="#166534">Crypto-Backed</text>
 <text x="400" y="68" text-anchor="middle" font-size="11" fill="#22c55e">DAI</text>
 <line x1="300" y1="78" x2="500" y2="78" stroke="#bbf7d0" stroke-width="1"/>
 <text x="400" y="100" text-anchor="middle" font-size="11" fill="#64748b">$1 token = $1.50+ of crypto</text>
 <text x="400" y="120" text-anchor="middle" font-size="11" fill="#64748b">Over-collateralized in ETH</text>
 <text x="400" y="140" text-anchor="middle" font-size="11" fill="#64748b">Smart contract enforced</text>
 <line x1="300" y1="155" x2="500" y2="155" stroke="#bbf7d0" stroke-width="1"/>
 <text x="400" y="175" text-anchor="middle" font-size="11" fill="#22c55e">✓ Decentralized</text>
 <text x="400" y="195" text-anchor="middle" font-size="11" fill="#22c55e">✓ No company can freeze it</text>
 <text x="400" y="220" text-anchor="middle" font-size="11" fill="#ef4444">⚠ Complex mechanism</text>
 <text x="400" y="240" text-anchor="middle" font-size="11" fill="#ef4444">⚠ Liquidation risk if ETH crashes</text>

 <!-- Algorithmic -->
 <rect x="540" y="20" width="240" height="240" rx="12" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
 <text x="660" y="48" text-anchor="middle" font-size="14" font-weight="bold" fill="#991b1b">Algorithmic</text>
 <text x="660" y="68" text-anchor="middle" font-size="11" fill="#ef4444">UST (failed), FRAX</text>
 <line x1="560" y1="78" x2="760" y2="78" stroke="#fecaca" stroke-width="1"/>
 <text x="660" y="100" text-anchor="middle" font-size="11" fill="#64748b">$1 token = supply/demand algo</text>
 <text x="660" y="120" text-anchor="middle" font-size="11" fill="#64748b">No physical backing</text>
 <text x="660" y="140" text-anchor="middle" font-size="11" fill="#64748b">Code adjusts supply</text>
 <line x1="560" y1="155" x2="760" y2="155" stroke="#fecaca" stroke-width="1"/>
 <text x="660" y="175" text-anchor="middle" font-size="11" fill="#22c55e">✓ Fully decentralized</text>
 <text x="660" y="195" text-anchor="middle" font-size="11" fill="#22c55e">✓ Capital efficient</text>
 <text x="660" y="220" text-anchor="middle" font-size="11" fill="#ef4444">⚠ Can collapse (UST lost $40B)</text>
 <text x="660" y="240" text-anchor="middle" font-size="11" fill="#ef4444">⚠ Unproven long-term</text>
</svg>
</div>

### Fiat-backed: USDC and USDT

The simplest model. A company holds real dollars (and Treasury bonds) in a bank. For every USDC in circulation, there is $1 in reserves. When you want to redeem, the company burns the token and sends you dollars.

**USDC** (issued by Circle): Reserves are audited monthly by Deloitte. Backed by cash and short-term US Treasury bonds held in the Circle Reserve Fund, managed by BlackRock.

**USDT** (issued by Tether): The largest stablecoin by market cap. Has faced scrutiny over its reserves transparency but remains the most traded crypto asset by volume.

### Crypto-backed: DAI

DAI uses smart contracts instead of a company. To create DAI, you lock up ETH (or other crypto) worth more than the DAI you mint. If you want $100 of DAI, you lock up at least $150 of ETH as collateral.

If the value of your collateral drops too low, the smart contract automatically sells it to protect the system. This is called **liquidation**.

### Algorithmic: the risky experiment

Algorithmic stablecoins use code to adjust supply. When the price rises above $1, the algorithm mints more tokens. When it drops below $1, it burns tokens.

In May 2022, the algorithmic stablecoin UST (Terra) lost its peg and collapsed from $18 billion to near zero in days. Its companion token LUNA went from $80 to $0.0001. This event shook the entire crypto market and led to tighter regulation.

## The stablecoin market today

| Stablecoin | Type | Market Cap | Issuer |
| --- | --- | --- | --- |
| USDT | Fiat-backed | ~$110B | Tether |
| USDC | Fiat-backed | ~$35B | Circle |
| DAI | Crypto-backed | ~$5B | MakerDAO |
| FDUSD | Fiat-backed | ~$3B | First Digital |

Stablecoins are the most widely used tokens in crypto. They handle more transaction volume than ETH or BTC on most days.

## Key takeaways

- Stablecoins are tokens designed to hold a steady $1 value, solving crypto's volatility problem.
- **Fiat-backed** (USDC, USDT) are the simplest and most widely used - backed by real reserves.
- **Crypto-backed** (DAI) are decentralized but complex, requiring over-collateralization.
- **Algorithmic** stablecoins have a poor track record - UST's $40B collapse is a cautionary tale.
- Stablecoins are critical infrastructure for DeFi, payments, and cross-border transfers.
