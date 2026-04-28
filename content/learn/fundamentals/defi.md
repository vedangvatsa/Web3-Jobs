---
title: "DeFi: Banking Without Banks"
description: "A complete overview of decentralized finance: DEXs, lending, yield, and how it all fits together."
order: 14
readTime: "11 min"
difficulty: "beginner"
prerequisites: ["daos"]
quiz:
  - question: "What is DeFi?"
    options:
      - "A type of cryptocurrency"
      - "Financial services built on smart contracts, without banks or brokers"
      - "A digital bank account"
      - "A government financial program"
    correct: 1
    explanation: "DeFi (Decentralized Finance) rebuilds traditional financial services — trading, lending, borrowing, savings — using smart contracts instead of banks. Anyone with a wallet can use it, 24/7."
  - question: "How does a DEX like Uniswap handle trading?"
    options:
      - "It matches buy and sell orders like a stock exchange"
      - "It uses liquidity pools and a mathematical formula to set prices"
      - "A human market maker sets the prices"
      - "It connects to a bank's trading system"
    correct: 1
    explanation: "Uniswap uses an Automated Market Maker (AMM). Liquidity providers deposit token pairs into pools. A formula (x * y = k) determines the price based on the ratio of tokens in the pool."
  - question: "What is 'collateral' in DeFi lending?"
    options:
      - "The interest rate on a loan"
      - "Crypto you lock up as security to borrow against"
      - "A type of stablecoin"
      - "The fee you pay to a smart contract"
    correct: 1
    explanation: "To borrow in DeFi, you deposit crypto as collateral — typically worth 150%+ of what you borrow. If the value of your collateral drops too far, the smart contract automatically sells it to protect lenders."
  - question: "What is 'Total Value Locked' (TVL)?"
    options:
      - "The price of Ethereum"
      - "The total amount of crypto deposited in DeFi smart contracts"
      - "The number of DeFi users"
      - "The market cap of all cryptocurrencies"
    correct: 1
    explanation: "TVL measures the total value of crypto deposited in DeFi protocols. A higher TVL generally means more liquidity and more trust in the protocol. As of 2024, total DeFi TVL exceeds $80 billion."
  - question: "What is the biggest risk in DeFi?"
    options:
      - "Internet speed"
      - "Smart contract bugs that can lead to fund losses"
      - "Government taxes"
      - "Slow transactions"
    correct: 1
    explanation: "Smart contract risk is the biggest concern. If a contract has a bug, hackers can exploit it and drain funds. Billions of dollars have been lost to DeFi hacks. Always use audited protocols and start with small amounts."
---

## What DeFi replaces

Every financial service you use through a bank can be rebuilt with smart contracts. The difference: no company, no office hours, no credit checks, no geographic restrictions.

<div class="diagram">
<svg viewBox="0 0 800 230" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
  <!-- TradFi -->
  <rect x="20" y="20" width="340" height="190" rx="12" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
  <text x="190" y="48" text-anchor="middle" font-size="14" font-weight="bold" fill="#991b1b">Traditional Finance</text>
  <text x="190" y="75" text-anchor="middle" font-size="11" fill="#64748b">Exchange: NYSE, NASDAQ</text>
  <text x="190" y="95" text-anchor="middle" font-size="11" fill="#64748b">Lending: Banks, credit companies</text>
  <text x="190" y="115" text-anchor="middle" font-size="11" fill="#64748b">Savings: Bank savings accounts</text>
  <text x="190" y="135" text-anchor="middle" font-size="11" fill="#64748b">Insurance: Insurance companies</text>
  <line x1="40" y1="150" x2="340" y2="150" stroke="#fecaca"/>
  <text x="190" y="170" text-anchor="middle" font-size="11" fill="#ef4444">Mon-Fri 9-5 · KYC required</text>
  <text x="190" y="190" text-anchor="middle" font-size="11" fill="#ef4444">2-5 days to settle · Geography limits</text>

  <!-- DeFi -->
  <rect x="420" y="20" width="340" height="190" rx="12" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
  <text x="590" y="48" text-anchor="middle" font-size="14" font-weight="bold" fill="#166534">DeFi</text>
  <text x="590" y="75" text-anchor="middle" font-size="11" fill="#64748b">Exchange: Uniswap, Curve</text>
  <text x="590" y="95" text-anchor="middle" font-size="11" fill="#64748b">Lending: Aave, Compound</text>
  <text x="590" y="115" text-anchor="middle" font-size="11" fill="#64748b">Savings: Yield protocols</text>
  <text x="590" y="135" text-anchor="middle" font-size="11" fill="#64748b">Insurance: Nexus Mutual</text>
  <line x1="440" y1="150" x2="740" y2="150" stroke="#bbf7d0"/>
  <text x="590" y="170" text-anchor="middle" font-size="11" fill="#22c55e">24/7/365 · No KYC needed</text>
  <text x="590" y="190" text-anchor="middle" font-size="11" fill="#22c55e">Instant settlement · Global access</text>
</svg>
</div>

## The DeFi stack

DeFi is not one product. It is layers of protocols that work together, like Lego bricks.

### DEXs (Decentralized Exchanges)

Trade tokens without a centralized exchange. Uniswap is the largest. Instead of matching buyers with sellers (like the stock market), it uses **liquidity pools** — pots of tokens deposited by users.

When you swap ETH for USDC, you are trading against a pool, not a person. The price is set by a formula based on the ratio of tokens in the pool. The more you buy, the more the price moves.

### Lending and borrowing

Deposit crypto to earn interest. Borrow crypto by posting collateral.

On Aave, you can deposit USDC and earn 3-8% APY. Or you can deposit ETH as collateral and borrow USDC against it. If ETH's price drops and your collateral ratio falls below the minimum (typically 80%), the contract liquidates your position.

### Yield

"Yield" is the return you earn on deposited crypto. Sources include:

- **Lending interest**: Earn interest by lending to borrowers
- **Liquidity providing**: Earn trading fees by depositing into DEX pools
- **Staking**: Earn rewards for validating transactions (Ethereum PoS yields ~3-4% APY)

## The real numbers

| Protocol | Category | TVL | What it does |
| --- | --- | --- | --- |
| Lido | Staking | ~$25B | Liquid ETH staking |
| Aave | Lending | ~$15B | Borrow and lend crypto |
| Uniswap | DEX | ~$5B | Token swaps |
| Maker | Stablecoin | ~$8B | DAI stablecoin creation |
| Curve | DEX | ~$2B | Stablecoin swaps (low slippage) |

## The risks

DeFi gives you access to financial tools without a middleman, but it also gives you full responsibility:

- **Smart contract risk**: Bugs in code can be exploited. Billions have been lost.
- **Liquidation risk**: If collateral drops in value, your position gets automatically sold.
- **Impermanent loss**: Liquidity providers can lose money if token prices move significantly.
- **Scams**: Fake protocols exist specifically to steal funds. Verify contracts before depositing.

## Key takeaways

- DeFi rebuilds banking (trading, lending, saving) using smart contracts — open 24/7, no KYC, global.
- DEXs use liquidity pools and formulas instead of order books.
- Lending requires over-collateralization — deposit more than you borrow.
- DeFi gives access but also responsibility — bugs, liquidations, and scams are real risks.
