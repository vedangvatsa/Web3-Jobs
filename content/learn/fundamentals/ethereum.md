---
title: "Ethereum: The World Computer"
description: "Why Ethereum matters, how the EVM works, and why most Web3 apps are built on it."
order: 4
readTime: "10 min"
difficulty: "beginner"
prerequisites: ["blockchains"]
quiz:
 - question: "What makes Ethereum different from Bitcoin?"
 options:
 - "Ethereum is faster than Bitcoin"
 - "Ethereum can run programs (smart contracts), Bitcoin mainly handles money transfers"
 - "Ethereum does not use a blockchain"
 - "Bitcoin has more developers"
 correct: 1
 explanation: "Bitcoin was designed for sending and receiving money. Ethereum added the ability to run programs (smart contracts) on the blockchain, making it a platform for building applications."
 - question: "What is the EVM?"
 options:
 - "A type of cryptocurrency"
 - "A hardware device for mining"
 - "The Ethereum Virtual Machine - the computer that runs smart contracts"
 - "An Ethereum wallet"
 correct: 2
 explanation: "The EVM (Ethereum Virtual Machine) is the computing engine that runs smart contracts. Every node in the network runs the same EVM, so everyone gets the same results."
 - question: "What are gas fees?"
 options:
 - "Monthly subscription costs for Ethereum"
 - "Fees you pay to execute operations on the Ethereum network"
 - "The cost of electricity to run a node"
 - "A tax collected by the Ethereum Foundation"
 correct: 1
 explanation: "Gas fees are paid by users to compensate validators for processing their transactions. Every operation (sending ETH, calling a contract) costs gas. You pay in ETH."
 - question: "What is an ERC-20 token?"
 options:
 - "A type of NFT"
 - "A standard for creating fungible tokens on Ethereum"
 - "A wallet application"
 - "A layer 2 network"
 correct: 1
 explanation: "ERC-20 is a standard that defines how tokens work on Ethereum. It ensures all tokens share the same basic functions (transfer, approve, balance check), making them compatible with any wallet or exchange."
 - question: "How much ETH must a validator stake to participate in Ethereum's consensus?"
 options:
 - "1 ETH"
 - "10 ETH"
 - "32 ETH"
 - "100 ETH"
 correct: 2
 explanation: "Validators must stake 32 ETH to participate in Ethereum's Proof of Stake consensus. This acts as collateral — validators who act dishonestly lose a portion of their stake."
---

## Bitcoin was step one. Ethereum was step two.

Bitcoin proved you could send money without a bank. That was a big deal. But Bitcoin's scripting language is simple on purpose — it handles transfers and not much else.

In 2013, a 19-year-old programmer named Vitalik Buterin published a whitepaper asking: what if a blockchain could run any program, not just money transfers? Two years later, Ethereum launched. It is a blockchain with a built-in computer.

## What Ethereum actually is

Ethereum is a network of thousands of computers that all run the same virtual machine. This machine is called the **EVM** (Ethereum Virtual Machine). Anyone can write a program, deploy it to the EVM, and it will run exactly the same way on every computer in the network.

Think of it like this: Google Docs runs on Google's servers. If Google shuts down, your documents disappear. An Ethereum smart contract runs on thousands of independent computers. No single company can shut it down.

<div class="diagram">
<svg viewBox="0 0 800 250" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
 <!-- Traditional app -->
 <rect x="20" y="20" width="340" height="210" rx="12" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
 <text x="190" y="48" text-anchor="middle" font-size="15" font-weight="bold" fill="#991b1b">Traditional App</text>
 <rect x="50" y="65" width="120" height="40" rx="6" fill="#fee2e2" stroke="#fca5a5"/>
 <text x="110" y="90" text-anchor="middle" font-size="11" fill="#991b1b">Your Code</text>
 <text x="195" y="90" text-anchor="middle" font-size="16" fill="#94a3b8">→</text>
 <rect x="220" y="65" width="120" height="40" rx="6" fill="#fee2e2" stroke="#fca5a5"/>
 <text x="280" y="85" text-anchor="middle" font-size="11" fill="#991b1b">Company's</text>
 <text x="280" y="98" text-anchor="middle" font-size="11" fill="#991b1b">Server</text>
 <text x="190" y="135" text-anchor="middle" font-size="11" fill="#64748b">One server. Company controls it.</text>
 <text x="190" y="152" text-anchor="middle" font-size="11" fill="#64748b">They can change or shut it down.</text>
 <text x="190" y="195" text-anchor="middle" font-size="12" fill="#ef4444">⚠ Single point of failure</text>

 <!-- Ethereum app -->
 <rect x="420" y="20" width="360" height="210" rx="12" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
 <text x="600" y="48" text-anchor="middle" font-size="15" font-weight="bold" fill="#166534">Ethereum App</text>
 <rect x="450" y="65" width="120" height="40" rx="6" fill="#dcfce7" stroke="#86efac"/>
 <text x="510" y="85" text-anchor="middle" font-size="11" fill="#166534">Smart</text>
 <text x="510" y="98" text-anchor="middle" font-size="11" fill="#166534">Contract</text>
 <text x="595" y="90" text-anchor="middle" font-size="16" fill="#94a3b8">→</text>
 <rect x="620" y="60" width="35" height="25" rx="4" fill="#dcfce7" stroke="#86efac"/>
 <text x="637" y="77" text-anchor="middle" font-size="8" fill="#166534">EVM</text>
 <rect x="660" y="60" width="35" height="25" rx="4" fill="#dcfce7" stroke="#86efac"/>
 <text x="677" y="77" text-anchor="middle" font-size="8" fill="#166534">EVM</text>
 <rect x="700" y="60" width="35" height="25" rx="4" fill="#dcfce7" stroke="#86efac"/>
 <text x="717" y="77" text-anchor="middle" font-size="8" fill="#166534">EVM</text>
 <rect x="620" y="90" width="35" height="25" rx="4" fill="#dcfce7" stroke="#86efac"/>
 <text x="637" y="107" text-anchor="middle" font-size="8" fill="#166534">EVM</text>
 <rect x="660" y="90" width="35" height="25" rx="4" fill="#dcfce7" stroke="#86efac"/>
 <text x="677" y="107" text-anchor="middle" font-size="8" fill="#166534">EVM</text>
 <rect x="700" y="90" width="35" height="25" rx="4" fill="#dcfce7" stroke="#86efac"/>
 <text x="717" y="107" text-anchor="middle" font-size="8" fill="#166534">EVM</text>
 <text x="600" y="145" text-anchor="middle" font-size="11" fill="#64748b">Thousands of computers. Nobody owns it.</text>
 <text x="600" y="162" text-anchor="middle" font-size="11" fill="#64748b">Code runs the same everywhere.</text>
 <text x="600" y="195" text-anchor="middle" font-size="12" fill="#22c55e">✓ No single point of failure</text>
</svg>
</div>

## Ethereum vs Bitcoin

Both are blockchains. Both use cryptocurrency. But they serve different purposes.

| Feature | Bitcoin | Ethereum |
| --- | --- | --- |
| Launched | 2009 | 2015 |
| Purpose | Digital money | Programmable platform |
| Programming | Very limited scripts | Full smart contracts (Solidity) |
| Block time | ~10 minutes | ~12 seconds |
| Consensus | Proof of Work | Proof of Stake (since Sept 2022) |
| Native token | BTC | ETH |
| Main use | Store and send value | Run decentralized applications |

Bitcoin is digital gold. Ethereum is a decentralized computer that happens to have its own currency.

## How smart contracts work on Ethereum

A smart contract is a program stored on the Ethereum blockchain. Once deployed, it cannot be changed. It runs exactly as written, every time.

Here is what happens when you interact with one:

1. You send a transaction to the contract's address (like calling a function)
2. Every node on the network executes the contract code in their EVM
3. All nodes arrive at the same result (because the EVM is deterministic)
4. The result is recorded on the blockchain

Every operation the EVM performs costs **gas**. Simple operations (addition, comparison) cost a little gas. Complex operations (storing data on-chain) cost more. You pay for gas in ETH.

<div class="diagram">
<svg viewBox="0 0 800 180" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
 <rect x="20" y="40" width="150" height="100" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
 <text x="95" y="70" text-anchor="middle" font-size="12" font-weight="600" fill="#1e40af">You</text>
 <text x="95" y="90" text-anchor="middle" font-size="10" fill="#64748b">Send tx + gas fee</text>
 <text x="95" y="105" text-anchor="middle" font-size="10" fill="#64748b">to contract address</text>

 <line x1="170" y1="90" x2="250" y2="90" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#a1)"/>

 <rect x="250" y="40" width="150" height="100" rx="8" fill="#fefce8" stroke="#eab308" stroke-width="1.5"/>
 <text x="325" y="70" text-anchor="middle" font-size="12" font-weight="600" fill="#854d0e">Smart Contract</text>
 <text x="325" y="90" text-anchor="middle" font-size="10" fill="#64748b">Code executes</text>
 <text x="325" y="105" text-anchor="middle" font-size="10" fill="#64748b">on every node's EVM</text>

 <line x1="400" y1="90" x2="480" y2="90" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#a1)"/>

 <rect x="480" y="40" width="150" height="100" rx="8" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
 <text x="555" y="70" text-anchor="middle" font-size="12" font-weight="600" fill="#166534">Result</text>
 <text x="555" y="90" text-anchor="middle" font-size="10" fill="#64748b">State updated</text>
 <text x="555" y="105" text-anchor="middle" font-size="10" fill="#64748b">on blockchain</text>

 <defs><marker id="a1" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#94a3b8"/></marker></defs>
</svg>
</div>

## The token standards

Ethereum introduced token standards — templates for creating digital assets. The two most important ones:

**ERC-20** is for fungible tokens (every token is identical). USDC, UNI, LINK, and thousands of other tokens use this standard. Think of them like currencies — one USDC is the same as any other USDC.

**ERC-721** is for non-fungible tokens (NFTs). Each token is unique. A CryptoPunk NFT is different from every other CryptoPunk. Think of them like concert tickets — each one has a unique seat number.

Because these are standards, any ERC-20 token works with any wallet, any exchange, and any DeFi protocol. This interoperability is one of Ethereum's biggest strengths.

## Ethereum's numbers

Some facts about the network today:

- **Validators**: Over 1 million active validators secure the network
- **Staking requirement**: 32 ETH per validator
- **Block time**: 12 seconds
- **Transactions per day**: Over 1 million
- **Smart contracts deployed**: Millions (most are inactive)
- **Total value locked in DeFi**: Tens of billions of dollars

## What Ethereum cannot do (yet)

Ethereum has real limits:

**Speed**: 12 seconds per block, ~15-30 transactions per second on the main chain. Visa handles ~1,700 per second. This is why Layer 2 networks exist — they process transactions off the main chain and settle back to Ethereum periodically.

**Cost**: During busy periods, a simple token swap can cost $5-50 in gas fees. Layer 2 networks reduce this to pennies.

**Storage**: Storing data on-chain is expensive. That is why NFT images are usually stored on IPFS (a decentralized file system), not directly on Ethereum.

## Key takeaways

- Ethereum is a blockchain with a built-in computer (the EVM) that can run programs called smart contracts.
- Smart contracts are permanent, unstoppable, and run exactly as written.
- Every operation costs gas, paid in ETH.
- ERC-20 (fungible tokens) and ERC-721 (NFTs) are the two main token standards.
- Ethereum is slow and expensive on its own, which is why Layer 2 networks exist.
