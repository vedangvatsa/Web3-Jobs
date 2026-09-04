---
title: Yield Farming Explained
description: Where DeFi yields actually come from and how to spot unsustainable returns.
order: 3
readTime: 8 min
difficulty: intermediate
prerequisites:
  - lending
quiz:
  - question: Where does sustainable yield in DeFi come from?
    options:
      - The Ethereum Foundation printing new tokens
      - Real economic activity like trading fees and borrowing interest
      - New users depositing money to pay older users
      - Mining new blocks
    correct: 1
    explanation: >-
      Sustainable yield comes from real economic activity. When you provide
      liquidity to a DEX, you earn trading fees. When you lend on Aave, you earn
      interest paid by borrowers.
  - question: What is 'liquidity mining'?
    options:
      - Extracting minerals to power blockchain hardware
      - >-
        When a protocol gives its own governance token to users as a reward for
        depositing funds
      - A hacking technique
      - Creating new liquidity pools
    correct: 1
    explanation: >-
      Liquidity mining is a marketing strategy. Protocols give away their own
      tokens to incentivize users to deposit funds. This often results in high
      initial APYs that drop over time as the token price falls or rewards run
      out.
  - question: 'Why do some protocols offer 10,000% APY?'
    options:
      - They found a risk-free arbitrage opportunity
      - >-
        They are heavily inflating their own token supply to pay depositors,
        which is usually unsustainable
      - The stock market is doing poorly
      - They are officially endorsed by regulators
    correct: 1
    explanation: >-
      Astronomical APYs are almost always paid in a highly inflationary, newly
      created token. The APY looks high on paper, but as they print more tokens
      to pay the yield, the token price usually crashes.
  - question: What does APY stand for?
    options:
      - Annual Percentage Yield
      - Average Protocol Yearly
      - Automated Pricing Yield
      - Annual Payment Yield
    correct: 0
    explanation: >-
      Annual Percentage Yield (APY) includes the effect of compounding. APR
      (Annual Percentage Rate) does not. In DeFi, APY rates change constantly
      based on market conditions.
  - question: What is a 'yield aggregator'?
    options:
      - A spreadsheet tracking prices
      - >-
        A protocol like Yearn Finance that automatically moves your funds to
        wherever the yield is highest
      - A regulatory body
      - A type of stablecoin
    correct: 1
    explanation: >-
      Yield aggregators automatically deploy your funds across different DeFi
      protocols to find the best return, rebalancing as rates change, saving you
      gas fees and time.
lastUpdated: 2026-09-04
---

## Where does the money come from?

In traditional finance, if a bank offers you 4% on your savings, they are taking your money, lending it out for 7%, and keeping the difference. 

In DeFi, if you see a 10% yield, you should always ask: **Where is this money coming from?** If you cannot answer that question, you are probably the source of the money.

## The two types of yield

DeFi yields generally fall into two categories: real yield and inflationary yield.

<div class="diagram">
<svg viewBox="0 0 800 240" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
 <!-- Real Yield -->
 <rect x="20" y="20" width="360" height="200" rx="12" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
 <text x="200" y="50" text-anchor="middle" font-size="14" font-weight="bold" fill="#166534">Real Yield (Sustainable)</text>

 <rect x="50" y="75" width="300" height="40" rx="6" fill="#dcfce7"/>
 <text x="200" y="100" text-anchor="middle" font-size="11" fill="#166534">Trading Fees (DEXs like Uniswap)</text>

 <rect x="50" y="125" width="300" height="40" rx="6" fill="#dcfce7"/>
 <text x="200" y="150" text-anchor="middle" font-size="11" fill="#166534">Borrowing Interest (Aave / Compound)</text>

 <rect x="50" y="175" width="300" height="40" rx="6" fill="#dcfce7"/>
 <text x="200" y="200" text-anchor="middle" font-size="11" fill="#166534">Staking Rewards (Securing Ethereum)</text>

 <!-- Inflationary Yield -->
 <rect x="420" y="20" width="360" height="200" rx="12" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
 <text x="600" y="50" text-anchor="middle" font-size="14" font-weight="bold" fill="#991b1b">Inflationary Yield (Short-term)</text>

 <rect x="450" y="75" width="300" height="80" rx="6" fill="#fee2e2"/>
 <text x="600" y="100" text-anchor="middle" font-size="12" font-weight="bold" fill="#991b1b">Liquidity Mining</text>
 <text x="600" y="120" text-anchor="middle" font-size="10" fill="#991b1b">Protocol prints its own token</text>
 <text x="600" y="135" text-anchor="middle" font-size="10" fill="#991b1b">and gives it to depositors to attract capital.</text>

 <text x="600" y="180" text-anchor="middle" font-size="11" fill="#ef4444">⚠ Can lead to massive price dumps</text>
 <text x="600" y="195" text-anchor="middle" font-size="11" fill="#ef4444">when users sell the reward tokens.</text>
</svg>
</div>

### 1. Real Yield

This is yield generated by actual economic activity. 
- You deposit USDC into Aave. A borrower takes that USDC and pays 5% interest. You get 4% (the protocol keeps 1%).
- You provide ETH/USDC liquidity on Uniswap. Traders swap back and forth, paying a 0.3% fee on every trade. Those fees go directly to you.

Real yield is sustainable because someone is actively paying for a service. Typical returns are 2% to 15% APY, depending on market demand.

### 2. Inflationary Yield (Liquidity Mining)

Imagine a new protocol launches: SuperDEX. It has zero users and zero liquidity. To attract money, SuperDEX announces: "If you deposit your crypto here, we will give you our new SUPER token as a reward, offering 1,000% APY!"

This is **liquidity mining**. Yield farmers rush in, deposit funds, and receive SUPER tokens. The high APY is entirely subsidized by the protocol printing its own token out of thin air. 

What usually happens? The farmers take the SUPER tokens they earned and immediately sell them on the market for stablecoins. The massive sell pressure crashes the price of the SUPER token. The 1,000% APY quickly drops to 2%, and the farmers leave for the next protocol.

## Strategies and Aggregators

A "yield farmer" is someone who constantly moves their capital between protocols to chase the highest return. Doing this manually costs time and gas fees.

**Yield Aggregators** (like Yearn Finance) automate this. You deposit your stablecoins into a Yearn Vault. The vault's smart contract automatically moves the pooled funds across Aave, Curve, and other protocols to find the best yield. Because the funds are pooled, the gas costs are shared among all depositors, making it highly efficient.

## Key takeaways

- Never invest in a yield without understanding exactly where the money comes from.
- Real yield comes from trading fees, borrowing interest, and network staking.
- Inflationary yield comes from protocols printing their own tokens to incentivize deposits. It is rarely sustainable.
- High APYs (over 20%) almost always involve significant token inflation or extreme risk.
