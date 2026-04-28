---
title: "Smart Contracts Explained"
description: "What smart contracts are, how they work, and real examples you can understand."
order: 9
readTime: "10 min"
difficulty: "beginner"
prerequisites: ["stablecoins-digital-dollars"]
quiz:
  - question: "What is a smart contract?"
    options:
      - "A legal document stored on a blockchain"
      - "A program that runs on a blockchain and executes automatically"
      - "A contract between two cryptocurrency exchanges"
      - "An AI chatbot that answers legal questions"
    correct: 1
    explanation: "A smart contract is a program deployed on a blockchain. It runs automatically when someone sends a transaction to it. No human approves or denies the action — the code just runs."
  - question: "Why can't you change a smart contract after deploying it?"
    options:
      - "The Ethereum Foundation locks it"
      - "It is too expensive to change"
      - "The code is stored on the blockchain, which is immutable"
      - "Only the government can change it"
    correct: 2
    explanation: "Smart contract code is stored on the blockchain, which cannot be changed. This is a feature, not a bug — it means users can trust that the code will always work as written. Some contracts use proxy patterns to allow upgrades, but the original code remains on-chain."
  - question: "What is a real-world use case for a smart contract?"
    options:
      - "Sending an email"
      - "A decentralized exchange that swaps tokens without a middleman"
      - "Downloading a mobile app"
      - "Logging into a website"
    correct: 1
    explanation: "Decentralized exchanges like Uniswap are smart contracts. When you swap ETH for USDC on Uniswap, a smart contract calculates the price, takes your ETH, and sends you USDC — all in one transaction."
  - question: "What is a 'rug pull'?"
    options:
      - "A type of consensus mechanism"
      - "When a developer deploys a contract with a hidden backdoor and drains user funds"
      - "When a blockchain forks into two chains"
      - "When gas fees become very high"
    correct: 1
    explanation: "A rug pull is when a developer deploys a contract that looks legitimate but contains hidden code allowing them to steal deposited funds. This is why audits and reading verified contracts matter."
  - question: "What does it mean for a smart contract to be 'audited'?"
    options:
      - "The government has approved it"
      - "Independent security experts have reviewed the code for vulnerabilities"
      - "It has been running for over a year"
      - "It has more than 1000 users"
    correct: 1
    explanation: "An audit is when independent security firms (like Trail of Bits, OpenZeppelin, or Certik) review the contract code for bugs and vulnerabilities. An audit reduces risk but does not guarantee safety."
---

## What a smart contract actually is

A smart contract is a program stored on a blockchain. It has an address (just like a wallet), it holds money, and it runs code when someone interacts with it.

The name is misleading. It is not smart (it does exactly what the code says, nothing more) and it is not a legal contract (it is software). Think of it as an automatic vending machine: you put in money, the machine follows its rules, and something comes out. No negotiation. No judgment calls.

## A simple example

Imagine a bet between Alice and Bob: "If it rains tomorrow, Alice pays Bob 1 ETH. If it does not rain, Bob pays Alice 1 ETH."

Without a smart contract, they need to trust each other. With a smart contract:

1. Both Alice and Bob send 1 ETH to the contract
2. The contract checks a weather data feed (called an oracle) the next day
3. If it rained, the contract sends 2 ETH to Bob
4. If it did not rain, the contract sends 2 ETH to Alice
5. Neither party can cheat or refuse to pay

<div class="diagram">
<svg viewBox="0 0 800 230" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
  <!-- Alice -->
  <rect x="20" y="20" width="120" height="60" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="80" y="45" text-anchor="middle" font-size="12" font-weight="600" fill="#1e40af">Alice</text>
  <text x="80" y="62" text-anchor="middle" font-size="10" fill="#64748b">Sends 1 ETH</text>

  <!-- Bob -->
  <rect x="20" y="140" width="120" height="60" rx="8" fill="#fefce8" stroke="#eab308" stroke-width="1.5"/>
  <text x="80" y="165" text-anchor="middle" font-size="12" font-weight="600" fill="#854d0e">Bob</text>
  <text x="80" y="182" text-anchor="middle" font-size="10" fill="#64748b">Sends 1 ETH</text>

  <!-- Arrows to contract -->
  <line x1="140" y1="50" x2="260" y2="100" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#sc1)"/>
  <line x1="140" y1="170" x2="260" y2="120" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#sc1)"/>

  <!-- Smart contract -->
  <rect x="260" y="70" width="180" height="80" rx="10" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
  <text x="350" y="95" text-anchor="middle" font-size="13" font-weight="bold" fill="#166534">Smart Contract</text>
  <text x="350" y="115" text-anchor="middle" font-size="10" fill="#64748b">Holds 2 ETH</text>
  <text x="350" y="130" text-anchor="middle" font-size="10" fill="#64748b">Checks weather oracle</text>

  <!-- Oracle -->
  <rect x="300" y="170" width="100" height="40" rx="6" fill="#fdf2f8" stroke="#ec4899" stroke-width="1"/>
  <text x="350" y="195" text-anchor="middle" font-size="10" fill="#9d174d">Weather Oracle</text>
  <line x1="350" y1="150" x2="350" y2="170" stroke="#ec4899" stroke-width="1" stroke-dasharray="4"/>

  <!-- Outcome arrows -->
  <line x1="440" y1="90" x2="540" y2="50" stroke="#22c55e" stroke-width="1.5" marker-end="url(#sc2)"/>
  <line x1="440" y1="130" x2="540" y2="170" stroke="#22c55e" stroke-width="1.5" marker-end="url(#sc2)"/>

  <!-- Outcomes -->
  <rect x="540" y="25" width="220" height="50" rx="8" fill="#dcfce7" stroke="#86efac"/>
  <text x="650" y="45" text-anchor="middle" font-size="11" fill="#166534">☔ Rained → 2 ETH to Bob</text>
  <text x="650" y="62" text-anchor="middle" font-size="10" fill="#64748b">Automatic, no dispute</text>

  <rect x="540" y="145" width="220" height="50" rx="8" fill="#dcfce7" stroke="#86efac"/>
  <text x="650" y="165" text-anchor="middle" font-size="11" fill="#166534">☀ Sunny → 2 ETH to Alice</text>
  <text x="650" y="182" text-anchor="middle" font-size="10" fill="#64748b">Automatic, no dispute</text>

  <defs>
    <marker id="sc1" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#94a3b8"/></marker>
    <marker id="sc2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#22c55e"/></marker>
  </defs>
</svg>
</div>

## Real smart contracts you use today

**Uniswap** — a decentralized exchange. Its smart contracts hold over $5 billion in tokens. When you swap ETH for USDC, you interact with a contract that calculates the price using a mathematical formula and executes the trade instantly.

**Aave** — a lending protocol. You deposit ETH into a smart contract and earn interest. Borrowers deposit collateral and borrow against it. The contract enforces all the rules: interest rates, collateral ratios, and liquidations.

**OpenSea** — an NFT marketplace. When you buy an NFT, a smart contract transfers the NFT to your wallet and the payment to the seller. No middleman handles the exchange.

## What makes smart contracts different from regular programs

| Feature | Regular program | Smart contract |
| --- | --- | --- |
| Runs on | Company's servers | Thousands of blockchain nodes |
| Can be changed | Yes, the company pushes updates | No (code is permanent on-chain) |
| Can be shut down | Yes, by the company | No (runs as long as the blockchain exists) |
| Transparency | Usually closed-source | Code is publicly readable |
| Access | Company decides who can use it | Anyone with a wallet can interact |
| Costs to run | Company pays server bills | Users pay gas fees per transaction |

## The risks

Smart contracts are only as good as their code. A bug in a smart contract can be exploited.

**The DAO hack (2016)**: A smart contract on Ethereum held $60 million in ETH. A hacker found a reentrancy bug that let them drain $50 million. This led to Ethereum splitting into two chains (Ethereum and Ethereum Classic).

**How to reduce risk**: Look for contracts that have been audited by firms like Trail of Bits, OpenZeppelin, or Certora. Check if the project has a bug bounty program. Start with small amounts. And remember: audits reduce risk but do not eliminate it.

## Key takeaways

- Smart contracts are programs on a blockchain that run automatically when triggered.
- They are permanent, transparent, and unstoppable.
- Real applications include exchanges (Uniswap), lending (Aave), and marketplaces (OpenSea).
- Bugs in smart contracts can lead to major losses — always check for audits.
- Oracles (like Chainlink) connect smart contracts to real-world data.
