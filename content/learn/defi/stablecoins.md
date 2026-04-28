---
title: "Stablecoin Mechanics"
description: "How USDC, DAI, and algorithmic stablecoins maintain their peg — and how they break."
order: 5
readTime: "8 min"
difficulty: "intermediate"
prerequisites: ["dexs"]
quiz:
  - question: "How does USDC maintain its $1 peg?"
    options:
      - "An algorithm adjusts the supply automatically"
      - "Each USDC is redeemable for $1 of reserves held by Circle in regulated bank accounts"
      - "Miners vote on the price daily"
      - "It is backed by ETH collateral"
    correct: 1
    explanation: "USDC is a fiat-backed stablecoin. Circle holds cash and short-term U.S. Treasuries in regulated banks. Anyone can redeem 1 USDC for $1 through Circle's platform, which creates an arbitrage floor that keeps the price anchored."
  - question: "Why does MakerDAO require over-collateralization to mint DAI?"
    options:
      - "To generate extra revenue for the protocol"
      - "Because crypto collateral is volatile — if ETH drops 30%, the loan must still be fully backed"
      - "It is a regulatory requirement"
      - "To prevent users from minting too many tokens"
    correct: 1
    explanation: "If you deposit $150 of ETH to mint 100 DAI, there is a buffer. If ETH drops 30%, your collateral is still worth $105 — enough to cover the 100 DAI. Without over-collateralization, a price drop would leave the stablecoin unbacked."
  - question: "What caused TerraUSD (UST) to collapse in May 2022?"
    options:
      - "A hack of the Terra blockchain"
      - "The U.S. government banned it"
      - "A death spiral where selling pressure on UST crashed LUNA, which was supposed to back UST, causing more selling"
      - "The developers ran out of funding"
    correct: 2
    explanation: "UST relied on minting and burning LUNA to maintain its peg. When large UST holders sold, LUNA was minted to absorb the pressure, flooding the market with LUNA and crashing its price. This made the backing mechanism worthless, triggering a death spiral that wiped out $40B."
  - question: "What is a 'depeg event'?"
    options:
      - "When a stablecoin's code is updated"
      - "When a stablecoin trades significantly above or below its target price"
      - "When a new stablecoin launches"
      - "When gas fees spike on Ethereum"
    correct: 1
    explanation: "A depeg event occurs when market confidence in the stablecoin's backing mechanism breaks down. USDC briefly depegged to $0.87 in March 2023 when Silicon Valley Bank (which held $3.3B of Circle's reserves) collapsed. It re-pegged after the FDIC guaranteed the deposits."
  - question: "What is the main trade-off between fiat-backed and crypto-backed stablecoins?"
    options:
      - "Fiat-backed are faster, crypto-backed are slower"
      - "Fiat-backed require trust in a centralized issuer; crypto-backed are decentralized but capital-inefficient"
      - "There is no trade-off; crypto-backed are strictly better"
      - "Fiat-backed cannot be used on-chain"
    correct: 1
    explanation: "USDC is simple and capital-efficient (1:1 backing) but you must trust Circle and its banks. DAI is fully transparent on-chain and censorship-resistant, but requires $150+ of collateral to mint $100 of stablecoins. Each model serves different needs."
---

## Why Stablecoins Exist

Crypto is volatile. If you sell ETH for profit, you need somewhere to park the value without converting back to a bank account. Stablecoins solve this: they are tokens designed to hold a steady $1 value, letting you stay on-chain without exposure to price swings.

Stablecoins are also the backbone of DeFi. Lending protocols, DEX liquidity pools, and yield farms all depend on stablecoins as their primary unit of account. Over $150B of stablecoins circulate across blockchains as of 2025.

There are three fundamentally different designs.

<div class="diagram">
<svg viewBox="0 0 800 220" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:750px">
  <!-- Fiat-Backed -->
  <rect x="10" y="10" width="240" height="200" rx="12" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
  <text x="130" y="40" text-anchor="middle" font-size="13" font-weight="bold" fill="#166534">Fiat-Backed</text>
  <text x="130" y="58" text-anchor="middle" font-size="11" fill="#166534">USDC / USDT</text>
  <rect x="40" y="75" width="80" height="35" rx="6" fill="#dcfce7"/>
  <text x="80" y="97" text-anchor="middle" font-size="10" fill="#166534">$1 Token</text>
  <text x="155" y="95" text-anchor="middle" font-size="16" fill="#22c55e">↔</text>
  <rect x="170" y="75" width="55" height="35" rx="6" fill="#dcfce7"/>
  <text x="197" y="97" text-anchor="middle" font-size="10" fill="#166534">$1 Cash</text>
  <text x="130" y="135" text-anchor="middle" font-size="10" fill="#64748b">1:1 bank reserves</text>
  <text x="130" y="155" text-anchor="middle" font-size="10" font-weight="600" fill="#166534">✓ Simple</text>
  <text x="130" y="175" text-anchor="middle" font-size="10" fill="#dc2626">✗ Centralized trust</text>
  <text x="130" y="195" text-anchor="middle" font-size="10" fill="#64748b">~$195B market cap</text>

  <!-- Crypto-Backed -->
  <rect x="280" y="10" width="240" height="200" rx="12" fill="#fefce8" stroke="#eab308" stroke-width="1.5"/>
  <text x="400" y="40" text-anchor="middle" font-size="13" font-weight="bold" fill="#854d0e">Crypto-Backed</text>
  <text x="400" y="58" text-anchor="middle" font-size="11" fill="#854d0e">DAI (MakerDAO)</text>
  <rect x="300" y="75" width="80" height="35" rx="6" fill="#fef9c3"/>
  <text x="340" y="97" text-anchor="middle" font-size="10" fill="#854d0e">$150 ETH</text>
  <text x="415" y="95" text-anchor="middle" font-size="16" fill="#eab308">→</text>
  <rect x="435" y="75" width="70" height="35" rx="6" fill="#fef9c3"/>
  <text x="470" y="97" text-anchor="middle" font-size="10" fill="#854d0e">100 DAI</text>
  <text x="400" y="135" text-anchor="middle" font-size="10" fill="#64748b">150% collateral ratio</text>
  <text x="400" y="155" text-anchor="middle" font-size="10" font-weight="600" fill="#166534">✓ Decentralized</text>
  <text x="400" y="175" text-anchor="middle" font-size="10" fill="#dc2626">✗ Capital inefficient</text>
  <text x="400" y="195" text-anchor="middle" font-size="10" fill="#64748b">~$5B market cap</text>

  <!-- Algorithmic -->
  <rect x="550" y="10" width="240" height="200" rx="12" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
  <text x="670" y="40" text-anchor="middle" font-size="13" font-weight="bold" fill="#991b1b">Algorithmic</text>
  <text x="670" y="58" text-anchor="middle" font-size="11" fill="#991b1b">UST / LUNA ☠️</text>
  <rect x="580" y="75" width="70" height="35" rx="6" fill="#fee2e2"/>
  <text x="615" y="97" text-anchor="middle" font-size="10" fill="#991b1b">Burn UST</text>
  <text x="685" y="95" text-anchor="middle" font-size="16" fill="#ef4444">↔</text>
  <rect x="705" y="75" width="70" height="35" rx="6" fill="#fee2e2"/>
  <text x="740" y="97" text-anchor="middle" font-size="10" fill="#991b1b">Mint LUNA</text>
  <text x="670" y="135" text-anchor="middle" font-size="10" fill="#64748b">No real collateral</text>
  <text x="670" y="155" text-anchor="middle" font-size="10" fill="#dc2626">✗ Death spiral risk</text>
  <text x="670" y="175" text-anchor="middle" font-size="10" fill="#dc2626">✗ Collapsed May 2022</text>
  <text x="670" y="195" text-anchor="middle" font-size="10" fill="#64748b">$40B destroyed</text>
</svg>
</div>

## 1. Fiat-Backed: USDC and USDT

**How it works:** A company (Circle for USDC, Tether for USDT) holds real dollars in bank accounts. For every stablecoin token they issue on-chain, they hold $1 in reserves. You can redeem tokens 1:1 for cash.

**Why it holds its peg:** Arbitrage. If USDC drops to $0.98 on a DEX, traders buy it cheaply and redeem it with Circle for $1, pocketing the $0.02 difference. This buying pressure pushes the price back up. If USDC trades at $1.02, traders mint new USDC from Circle at $1 and sell it on the market.

**The risk:** You are trusting that the reserves actually exist and that the banking system remains functional. In March 2023, USDC briefly traded at $0.87 when Silicon Valley Bank — which held $3.3B of Circle's reserves — failed. It recovered after the FDIC stepped in to guarantee deposits.

| Stablecoin | Issuer | Reserve Composition | Market Cap (2025) |
|---|---|---|---|
| USDT | Tether | U.S. Treasuries, cash, commercial paper | ~$140B |
| USDC | Circle | Cash, short-term U.S. Treasuries | ~$55B |

## 2. Crypto-Backed: DAI (MakerDAO)

**How it works:** Instead of holding dollars in a bank, DAI is backed by crypto locked in smart contracts. You deposit ETH (or other tokens) into a MakerDAO "Vault" and mint DAI against it. The system requires **over-collateralization**: you must deposit at least $150 of ETH to mint $100 of DAI.

**Why it holds its peg:** If your collateral ratio falls below a threshold (e.g., ETH drops in price), your position is automatically liquidated — the smart contract auctions off your ETH to buy back and burn DAI, maintaining the system's solvency.

**The trade-off:** DAI is decentralized and transparent. Anyone can inspect the collateral on-chain. But it is capital-inefficient. Locking up $150 to get $100 is expensive compared to USDC's 1:1 model.

## 3. Algorithmic: The Cautionary Tale of UST/LUNA

**How it was supposed to work:** TerraUSD (UST) had no collateral backing at all. Instead, it used an arbitrage mechanism with a companion token (LUNA). If UST dropped below $1, holders could burn 1 UST to mint $1 worth of LUNA, reducing UST supply and pushing the price up. If UST rose above $1, holders could burn LUNA to mint UST.

**What actually happened (May 2022):**
1. Large holders began selling hundreds of millions of UST.
2. The protocol minted massive amounts of LUNA to absorb the selling pressure.
3. The flood of new LUNA crashed LUNA's price.
4. A cheaper LUNA meant even more LUNA had to be minted per UST redeemed, creating hyperinflation.
5. LUNA went from $80 to $0.0001. UST went from $1 to $0.02. Over $40 billion in value was destroyed in 72 hours.

This event is the clearest demonstration of why purely algorithmic stablecoins — with no external collateral — are considered fundamentally fragile.

## Key takeaways

- Fiat-backed stablecoins (USDC, USDT) are the simplest model: trust a company to hold real dollars.
- Crypto-backed stablecoins (DAI) are decentralized but require over-collateralization to absorb volatility.
- Algorithmic stablecoins attempted to maintain a peg without any collateral. The UST/LUNA collapse proved this model has a catastrophic failure mode.
- Depeg events can happen to any stablecoin. Understanding the backing mechanism tells you how likely recovery is.
