---
title: "DeFi Risks and Hacks"
description: "Smart contract bugs, oracle manipulation, and how to evaluate protocol safety."
order: 4
readTime: "8 min"
difficulty: "intermediate"
prerequisites: ["yield-farming-explained"]
quiz:
  - question: "What is an oracle manipulation attack?"
    options:
      - "Hacking the blockchain's core code"
      - "Tricking a smart contract by temporarily manipulating the price feed it relies on"
      - "Stealing someone's private keys"
      - "A phishing website"
    correct: 1
    explanation: "If a lending protocol relies on a single DEX for price data, a hacker can use a massive amount of capital (a flash loan) to temporarily crash the price on that DEX, tricking the lending protocol into liquidating users or allowing under-collateralized borrowing."
  - question: "What is a Flash Loan?"
    options:
      - "A fast transaction on Layer 2"
      - "An uncollateralized loan that must be borrowed and repaid within the exact same transaction block"
      - "A loan for buying NFTs"
      - "A traditional bank loan that settles quickly"
    correct: 1
    explanation: "Flash loans allow anyone to borrow millions of dollars with no collateral, as long as the money is returned in the same transaction. Hackers often use flash loans to fund massive oracle manipulation attacks."
  - question: "What does TVL (Total Value Locked) indicate about a protocol's security?"
    options:
      - "High TVL means the protocol is 100% safe"
      - "High TVL means the code has survived being a high-value target, but it is not a guarantee of safety"
      - "Low TVL is safer because hackers ignore it"
      - "TVL has no relation to security"
    correct: 1
    explanation: "A protocol with $1 billion TVL has an open $1 billion bounty for any hacker who can find a bug. If it has survived for years with high TVL, the code is battle-tested. However, even battle-tested protocols can be hacked."
  - question: "Why do smart contract audits NOT guarantee safety?"
    options:
      - "Auditors don't look at the code"
      - "Auditors only check for spelling errors"
      - "Auditors check for known vulnerabilities, but complex logic bugs or new attack vectors can be missed"
      - "Auditors are usually the hackers"
    correct: 2
    explanation: "An audit is a review by security experts. It catches many bugs, but humans make mistakes. A clean audit reduces risk but does not mean the protocol is 'hack-proof'."
  - question: "What is the safest way to approach a brand new DeFi protocol offering high yields?"
    options:
      - "Put all your savings in to maximize the yield"
      - "Use a new, empty wallet and only deposit funds you are fully prepared to lose"
      - "Trust it if it has an audit"
      - "Borrow money to deposit"
    correct: 1
    explanation: "New protocols are the riskiest. Using a separate, dedicated 'degen' wallet protects your main holdings from malicious approvals, and only risking what you can lose protects you from smart contract bugs."
---

## The dark side of "code is law"

In DeFi, there are no customer service hotlines and no FDIC insurance. If a smart contract has a flaw, the money can be drained instantly. Over $5 billion has been stolen in DeFi hacks since 2020.

Understanding how protocols break is the first step to protecting your funds.

## Types of DeFi Hacks

<div class="diagram">
<svg viewBox="0 0 800 280" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
  <!-- Logic Bugs -->
  <rect x="20" y="20" width="240" height="240" rx="12" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
  <text x="140" y="48" text-anchor="middle" font-size="14" font-weight="bold" fill="#991b1b">Logic Bugs</text>
  <line x1="40" y1="65" x2="240" y2="65" stroke="#fecaca"/>
  <text x="140" y="90" text-anchor="middle" font-size="11" fill="#64748b">Flaws in the smart contract code.</text>
  
  <rect x="40" y="110" width="200" height="40" rx="6" fill="#fee2e2"/>
  <text x="140" y="128" text-anchor="middle" font-size="11" font-weight="bold" fill="#991b1b">Reentrancy</text>
  <text x="140" y="142" text-anchor="middle" font-size="9" fill="#991b1b">Withdrawing funds repeatedly</text>
  
  <rect x="40" y="160" width="200" height="40" rx="6" fill="#fee2e2"/>
  <text x="140" y="178" text-anchor="middle" font-size="11" font-weight="bold" fill="#991b1b">Access Control</text>
  <text x="140" y="192" text-anchor="middle" font-size="9" fill="#991b1b">Hacker calling admin functions</text>

  <!-- Oracle Attacks -->
  <rect x="280" y="20" width="240" height="240" rx="12" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="400" y="48" text-anchor="middle" font-size="14" font-weight="bold" fill="#b45309">Oracle Manipulation</text>
  <line x1="300" y1="65" x2="500" y2="65" stroke="#fde68a"/>
  <text x="400" y="90" text-anchor="middle" font-size="11" fill="#64748b">Tricking the protocol's price feed.</text>

  <rect x="300" y="110" width="200" height="60" rx="6" fill="#fef3c7"/>
  <text x="400" y="128" text-anchor="middle" font-size="11" font-weight="bold" fill="#b45309">Flash Loans</text>
  <text x="400" y="145" text-anchor="middle" font-size="9" fill="#b45309">Borrow $50M, crash a token price,</text>
  <text x="400" y="158" text-anchor="middle" font-size="9" fill="#b45309">trick a protocol, repay loan in 1 block.</text>

  <!-- Economic Exploits -->
  <rect x="540" y="20" width="240" height="240" rx="12" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="660" y="48" text-anchor="middle" font-size="14" font-weight="bold" fill="#1d4ed8">Economic Exploits</text>
  <line x1="560" y1="65" x2="760" y2="65" stroke="#bfdbfe"/>
  <text x="660" y="90" text-anchor="middle" font-size="11" fill="#64748b">Code works, but mechanics fail.</text>

  <rect x="560" y="110" width="200" height="60" rx="6" fill="#dbeafe"/>
  <text x="660" y="128" text-anchor="middle" font-size="11" font-weight="bold" fill="#1d4ed8">Liquidity Crisis</text>
  <text x="660" y="145" text-anchor="middle" font-size="9" fill="#1d4ed8">Everyone tries to withdraw,</text>
  <text x="660" y="158" text-anchor="middle" font-size="9" fill="#1d4ed8">but the funds are locked up.</text>
</svg>
</div>

### 1. Logic Bugs (Smart Contract Exploits)
A developer makes a mistake in the code. The most famous is the **reentrancy attack**, where a hacker tricks a contract into sending them funds repeatedly before the contract can update their balance to zero. 

### 2. Oracle Manipulation and Flash Loans
DeFi protocols need to know the price of assets (e.g., "What is the price of ETH?"). They get this from "oracles" or by checking DEX pools. 

A **Flash Loan** allows anyone to borrow tens of millions of dollars with no collateral, provided they return it in the same transaction block. Hackers use flash loans to massively disrupt a DEX pool's price, forcing the lending protocol to read the fake price. They then exploit the confused protocol (e.g., borrowing $10M against collateral that is temporarily reading as worth $100M).

### 3. Bridge Hacks
To move assets from Ethereum to Solana, you use a "bridge." A bridge works by locking your Ethereum in a smart contract and minting equivalent tokens on Solana. Bridges hold massive amounts of crypto, making them prime targets. Some of the largest hacks in crypto history ($600M+) have been bridge exploits where hackers forged signatures to unlock the funds.

## How to Evaluate Protocol Safety

If you are going to deposit funds into DeFi, follow this checklist:

1. **Lindy Effect (Time on Market):** Has the protocol been holding over $100 million for more than a year? Hackers follow the money. If it has held a massive bounty for a year without being hacked, it is significantly safer than a protocol launched yesterday.
2. **Audits:** Go to the protocol's documentation. Have they been audited by top-tier firms like Trail of Bits, OpenZeppelin, or Consensys Diligence? (Note: An audit is not a guarantee of safety, but lack of an audit is a massive red flag).
3. **Bug Bounty:** Do they offer millions of dollars to "white hat" hackers who find bugs and report them safely? (Check Immunefi).
4. **Admin Keys:** Can the developers change the code whenever they want? If the developers get hacked, the protocol gets drained. Look for protocols governed by a DAO or requiring a multi-sig (multiple people to sign off on changes).

## Key takeaways

- DeFi hacks usually stem from smart contract logic bugs, oracle manipulation, or bridge exploits.
- Flash loans weaponize market manipulation, allowing hackers with zero capital to execute massive attacks.
- Time on the market (Lindy effect) and high TVL are the strongest indicators of battle-tested code.
- Always assume new protocols are extremely high risk.
