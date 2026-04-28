---
title: "Lending and Borrowing in DeFi"
description: "How smart contracts enable loans without credit checks."
order: 2
readTime: "7 min"
difficulty: "intermediate"
prerequisites: ["how-dexs-work"]
quiz:
  - question: "How does DeFi solve the problem of not having credit scores?"
    options:
      - "By requiring passports"
      - "By using overcollateralization (depositing more value than you borrow)"
      - "By lending small amounts only"
      - "By using social media profiles"
    correct: 1
    explanation: "Because DeFi is anonymous, protocols use overcollateralization. You must deposit more crypto than you want to borrow, ensuring the protocol can always recover the funds if you do not pay."
  - question: "What is an LTV (Loan-to-Value) ratio?"
    options:
      - "The interest rate on the loan"
      - "The maximum amount you can borrow against your collateral"
      - "The price of the token"
      - "The fee the protocol charges"
    correct: 1
    explanation: "LTV dictates borrowing limits. If you deposit $1000 of ETH and the LTV is 80%, you can borrow a maximum of $800."
  - question: "What happens if the value of your collateral drops below the protocol's required threshold?"
    options:
      - "You get a warning email"
      - "Your collateral is automatically liquidated (sold) by the smart contract"
      - "Your debt is forgiven"
      - "Nothing happens"
    correct: 1
    explanation: "To protect lenders, the smart contract automatically sells your collateral to pay off the debt if its value drops too close to the borrowed amount. This is called liquidation."
  - question: "Who sets the interest rates on Aave and Compound?"
    options:
      - "A board of directors"
      - "An algorithm based on supply and demand (utilization rate)"
      - "The US Federal Reserve"
      - "The borrower"
    correct: 1
    explanation: "Rates are algorithmic. If a pool of USDC is heavily borrowed (high utilization), the interest rate automatically increases to encourage more people to deposit and fewer to borrow."
  - question: "Why would someone borrow money if they already have crypto to use as collateral?"
    options:
      - "They want to avoid paying taxes on selling their crypto"
      - "They want to get leverage (e.g., borrow stables to buy more ETH)"
      - "They need cash for real-world expenses but don't want to sell their crypto"
      - "All of the above"
    correct: 3
    explanation: "People use DeFi borrowing to avoid taxable events, gain leverage (borrowing to invest more), or get liquid cash while keeping their long-term crypto positions open."
---

## Loans without banks

If you want a loan from a bank, they check your identity, your income, and your credit score. They need to know you are trustworthy because they are giving you money you do not currently have.

DeFi operates differently. Because wallets are anonymous, trust is impossible. Instead of trust, DeFi uses **math and collateral**.

If you want to borrow $1,000 on Aave or Compound, you cannot just ask for it. You must first deposit $1,500 worth of crypto as collateral. 

<div class="diagram">
<svg viewBox="0 0 800 220" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
  <rect x="50" y="50" width="160" height="120" rx="10" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="130" y="80" text-anchor="middle" font-size="14" font-weight="bold" fill="#1e40af">Borrower</text>
  <text x="130" y="110" text-anchor="middle" font-size="11" fill="#1e40af">Has: 1 ETH ($2000)</text>
  <text x="130" y="130" text-anchor="middle" font-size="11" fill="#1e40af">Needs: $1000 USDC</text>
  
  <rect x="320" y="30" width="160" height="160" rx="10" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
  <text x="400" y="60" text-anchor="middle" font-size="14" font-weight="bold" fill="#166534">Lending Protocol</text>
  <text x="400" y="75" text-anchor="middle" font-size="11" fill="#166534">(Aave / Compound)</text>
  
  <rect x="340" y="100" width="120" height="70" fill="#dcfce7" stroke="#86efac"/>
  <text x="400" y="125" text-anchor="middle" font-size="11" fill="#166534">Locked Collateral:</text>
  <text x="400" y="145" text-anchor="middle" font-size="12" font-weight="bold" fill="#166534">1 ETH</text>

  <!-- Flow lines -->
  <line x1="210" y1="120" x2="320" y2="120" stroke="#3b82f6" stroke-width="2" marker-end="url(#blue-arrow)"/>
  <text x="265" y="110" text-anchor="middle" font-size="10" fill="#3b82f6">1. Deposits ETH</text>
  
  <line x1="320" y1="150" x2="210" y2="150" stroke="#22c55e" stroke-width="2" marker-end="url(#green-arrow)"/>
  <text x="265" y="140" text-anchor="middle" font-size="10" fill="#166534">2. Borrows USDC</text>
  
  <!-- Lenders -->
  <rect x="590" y="50" width="160" height="120" rx="10" fill="#fefce8" stroke="#eab308" stroke-width="1.5"/>
  <text x="670" y="80" text-anchor="middle" font-size="14" font-weight="bold" fill="#854d0e">Lenders</text>
  <text x="670" y="110" text-anchor="middle" font-size="11" fill="#854d0e">Deposit USDC</text>
  <text x="670" y="130" text-anchor="middle" font-size="11" fill="#854d0e">Earn 5% APY</text>

  <line x1="590" y1="90" x2="480" y2="90" stroke="#eab308" stroke-width="2" marker-end="url(#yellow-arrow)"/>
  <text x="535" y="80" text-anchor="middle" font-size="10" fill="#854d0e">Supply Liquidity</text>

  <defs>
    <marker id="blue-arrow" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#3b82f6"/></marker>
    <marker id="green-arrow" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#22c55e"/></marker>
    <marker id="yellow-arrow" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#eab308"/></marker>
  </defs>
</svg>
</div>

## Why overcollateralize?

Why borrow $1,000 if you already have $1,500?

1. **Keep your exposure**: You believe ETH will go up in value. If you sell your ETH for cash, you miss out on the gains. By borrowing against it, you get cash while keeping the ETH.
2. **Avoid taxes**: In many jurisdictions, selling crypto is a taxable event. Borrowing against it is not.
3. **Leverage**: You deposit ETH, borrow USDC, buy *more* ETH, and deposit that. This multiplies your gains (and your losses).

## Liquidation

This system has a strict rule: your debt can never exceed the value of your collateral. If it does, the protocol goes bankrupt.

To prevent this, protocols use a **Liquidation Threshold**. If you deposit $2,000 of ETH and borrow $1,500 USDC, you are safe. But if the market crashes and your ETH is suddenly only worth $1,600, your loan is too risky.

The smart contract will automatically trigger a **liquidation**. It allows a third party (a liquidation bot) to buy your ETH at a discount to immediately pay off your USDC debt. You lose your ETH, but the protocol stays solvent.

## Algorithmic Interest Rates

In DeFi, no central bank sets interest rates. They are determined by **utilization** (supply and demand).

If a pool has 10 million USDC and borrowers have taken 1 million USDC, the utilization is 10%. There is plenty of supply, so interest rates are low (e.g., 2% APY).

If borrowers take 9 million USDC, utilization is 90%. The pool is almost empty. The algorithm automatically spikes the interest rate (e.g., to 20% APY). This does two things:
1. High rates force borrowers to pay back their loans.
2. High rates entice new lenders to deposit USDC to earn the yield.

The system balances itself purely through economic incentives coded into smart contracts.

## Key takeaways

- DeFi lending relies on **overcollateralization** instead of credit checks.
- If your collateral value drops too low, it is automatically **liquidated**.
- Interest rates are driven by an algorithm based on pool utilization.
- Lenders earn interest, and borrowers get liquidity without selling their assets.
