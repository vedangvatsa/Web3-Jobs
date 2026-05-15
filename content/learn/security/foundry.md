---
title: "Using Foundry and Slither"
description: "The professional toolkit for testing and auditing smart contracts."
order: 3
readTime: "8 min"
difficulty: "advanced"
prerequisites: ["exploits"]
quiz:
  - question: "What is Foundry?"
    options:
      - "A blockchain network"
      - "A blazing fast, Rust-based testing framework for Solidity developers"
      - "A decentralized exchange"
      - "A visual code editor"
    correct: 1
    explanation: "Foundry is the industry standard toolchain for smart contract development. Written in Rust, it allows developers to write their tests directly in Solidity and execute them incredibly fast."
  - question: "What is 'Fuzz Testing'?"
    options:
      - "Testing the code while sleepy"
      - "A testing method where a tool generates thousands of random inputs to throw at your functions to see if they break"
      - "Testing the user interface styling"
      - "Checking the code for spelling errors"
    correct: 1
    explanation: "Fuzz testing (supported natively by Foundry) feeds a massive amount of random data into your functions. This helps uncover edge cases and vulnerabilities that a developer might not think to test manually."
  - question: "What is Slither?"
    options:
      - "A malicious smart contract"
      - "A Python-based static analysis tool that automatically scans Solidity code for known vulnerabilities"
      - "A type of cryptocurrency"
      - "A blockchain explorer"
    correct: 1
    explanation: "Slither is a static analyzer. You point it at your codebase, and within seconds it prints out a report of potential security flaws, like missing access controls or reentrancy risks."
  - question: "Why is writing tests in Solidity (via Foundry) preferred over writing them in JavaScript (via Hardhat) for deep security?"
    options:
      - "JavaScript is too slow"
      - "It allows developers to use the exact same language and math libraries for testing as they do for the protocol itself, reducing context switching and translation errors"
      - "JavaScript cannot connect to the blockchain"
      - "Hardhat is illegal"
    correct: 1
    explanation: "While Hardhat (JS/TS) is great for frontend integration, Foundry allows security engineers to write tests in Solidity. This means they can use precise EVM math and state manipulations without dealing with JavaScript's BigNumber conversions."
  - question: "Does getting a clean report from Slither mean the contract is safe?"
    options:
      - "Yes, Slither catches everything"
      - "No, static analyzers only catch known patterns; they cannot understand the specific business logic or economic design flaws of your protocol"
      - "Yes, if Foundry tests also pass"
      - "No, because Python is unreliable"
    correct: 1
    explanation: "Tools like Slither are the absolute bare minimum first step. They catch common mistakes (like uninitialized variables), but they cannot tell you if your tokenomics are flawed or if your oracle can be manipulated."
---

## The Auditor's Toolkit

You cannot audit a smart contract just by reading the code on GitHub. You need to run it, break it, and analyze it. 

The Web3 security industry relies on a specific set of tools to automate the discovery of basic bugs so that human auditors can focus on complex, systemic logic flaws.

## 1. Static Analysis: Slither

Before an auditor writes a single test, they run **Slither**.

Slither is an open-source static analysis framework written in Python. "Static analysis" means it reads your code without actually executing it on a blockchain. It looks for known patterns of bad code.

**What Slither catches in seconds:**
- Reentrancy vulnerabilities.
- Uninitialized state variables.
- `public` functions that should probably be `internal`.
- Using outdated or dangerous Solidity keywords (like `tx.origin` for authorization).

If you are a developer, you should run Slither on your code before committing it. It is the spell-checker of smart contract security. However, Slither cannot understand your business logic. It won't know if your DeFi protocol's mathematical formula is flawed.

## 2. The Testing Framework: Foundry

For years, the standard tool for testing smart contracts was Hardhat, which required writing tests in JavaScript or TypeScript. The problem? Solidity math involves massive 256-bit integers, and JavaScript struggles with large numbers, requiring clunky workarounds.

Enter **Foundry**. 

Written in Rust, Foundry is insanely fast. More importantly, **you write your tests in Solidity.** This is a major shift for security researchers. If you are auditing a contract written in Solidity, you can write exploit scripts in the exact same language.

### Fuzz Testing with Foundry

The most powerful feature Foundry brings to auditors is native **Fuzz Testing**.

When writing a standard unit test, a developer might write:
*"If user deposits 100 tokens, balance should equal 100."*

But what if the user deposits `0` tokens? What if they deposit `115,792,089,237,316,195,423,570,985,008,687,907,853,269` tokens?

Fuzz testing automates this. You define the rules (the invariants), and Foundry automatically generates tens of thousands of random inputs and fires them at your smart contract. If even one random input breaks the contract, Foundry stops and tells you exactly which input caused the failure.

<div class="diagram">
<svg viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
 <rect x="50" y="50" width="160" height="100" rx="8" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
 <text x="130" y="90" text-anchor="middle" font-size="14" font-weight="bold" fill="#991b1b">Fuzzer</text>
 <text x="130" y="110" text-anchor="middle" font-size="11" fill="#991b1b">Generates 10,000</text>
 <text x="130" y="125" text-anchor="middle" font-size="11" fill="#991b1b">random inputs</text>

 <!-- Arrows representing multiple inputs -->
 <line x1="220" y1="80" x2="330" y2="80" stroke="#ef4444" stroke-width="1.5" marker-end="url(#arrow-red)"/>
 <line x1="220" y1="100" x2="330" y2="100" stroke="#ef4444" stroke-width="1.5" marker-end="url(#arrow-red)"/>
 <line x1="220" y1="120" x2="330" y2="120" stroke="#ef4444" stroke-width="1.5" marker-end="url(#arrow-red)"/>

 <rect x="340" y="50" width="160" height="100" rx="8" fill="#f1f5f9" stroke="#64748b" stroke-width="1.5"/>
 <text x="420" y="90" text-anchor="middle" font-size="14" font-weight="bold" fill="#334155">Smart Contract</text>
 <text x="420" y="110" text-anchor="middle" font-size="11" fill="#475569">Function executes</text>

 <line x1="510" y1="100" x2="620" y2="100" stroke="#16a34a" stroke-width="2" marker-end="url(#arrow-green)"/>

 <rect x="630" y="50" width="140" height="100" rx="8" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
 <text x="700" y="90" text-anchor="middle" font-size="14" font-weight="bold" fill="#166534">Invariant</text>
 <text x="700" y="110" text-anchor="middle" font-size="11" fill="#166534">Did it break?</text>

 <defs>
 <marker id="arrow-red" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#ef4444"/></marker>
 <marker id="arrow-green" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#16a34a"/></marker>
 </defs>
</svg>
</div>

### Mainnet Forking

If a hacker is executing a flash loan attack, they are interacting with live, deployed protocols like Uniswap and Aave. How do you test your defense against this?

Foundry allows for **Mainnet Forking**. With one command, Foundry creates a local simulation on your laptop of the *entire Ethereum blockchain* at its current exact state. You can deploy your test contract locally, and have it interact with the real Uniswap liquidity pools to see exactly how your protocol behaves in live market conditions, all without spending a dime on gas.

## How to get started in Security

If you want to become a smart contract auditor (a highly lucrative career):
1. Master Solidity. You cannot break what you do not understand.
2. Learn Foundry. It is the required toolkit for modern security researchers.
3. Read past audit reports. Firms like Consensys Diligence publish their findings publicly.
4. Compete on platforms like **Code4rena** or **Sherlock**, where protocols post bounties for developers to find bugs in their code.

## Congratulations

You have completed the Web3 Security & Auditing track. You now understand the adversarial mindset, advanced EVM exploits, and the professional tools used to secure billions of dollars in decentralized finance.
