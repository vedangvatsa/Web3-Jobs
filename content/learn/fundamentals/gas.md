---
title: 'Gas Fees: Why They Exist'
description: 'How gas fees work on Ethereum, why they spike, and how to pay less.'
order: 10
readTime: 8 min
difficulty: beginner
prerequisites:
  - smart-contracts
quiz:
  - question: Why do gas fees exist?
    options:
      - To make the Ethereum Foundation money
      - To prevent spam and compensate validators for processing transactions
      - To pay for Ethereum's marketing
      - To keep the price of ETH high
    correct: 1
    explanation: >-
      Gas fees serve two purposes: they prevent spam (it costs money to flood
      the network) and they compensate validators for the computing resources
      used to process and verify transactions.
  - question: What happens to the base fee portion of gas?
    options:
      - It goes to the validators
      - It is burned (permanently destroyed)
      - It goes to the Ethereum Foundation
      - It is refunded to the user
    correct: 1
    explanation: >-
      Since EIP-1559 (August 2021), the base fee is burned - permanently removed
      from circulation. Only the priority tip goes to validators. This burning
      mechanism can make ETH deflationary during high-usage periods.
  - question: When are gas fees highest?
    options:
      - On weekends
      - At night
      - 'When the network is busy (popular NFT mints, market crashes)'
      - When ETH price is low
    correct: 2
    explanation: >-
      Gas fees rise when demand exceeds capacity. Popular NFT drops, market
      panic, and new token launches all increase demand for block space, which
      drives up fees.
  - question: What determines the fee difference between mainnet and a Layer 2?
    options:
      - A fixed ratio shared by every network
      - The name of the network's token
      - Execution costs, data costs, and current demand
      - Layer 2 transactions are always free
    correct: 2
    explanation: >-
      Compare current estimates for the same operation. Fee differences vary
      by network, transaction type, demand, and data-publication costs.
  - question: What unit is commonly used to quote the price per unit of gas?
    options:
      - Dollars
      - Bitcoin
      - Gwei (one billionth of an ETH)
      - Megabytes
    correct: 2
    explanation: >-
      Gas prices are measured in gwei. One gwei is 0.000000001 ETH (one
      billionth). A typical transaction might cost 20-30 gwei per unit of gas,
      multiplied by the number of gas units the operation requires.
lastUpdated: 2026-09-04
---

## Gas is not a fee - it is a unit of computation

Every operation the EVM performs costs a specific amount of gas. Simple operations cost little gas. Complex operations cost more.

| Operation | Gas cost | Example |
| --- | --- | --- |
| Transfer ETH | 21,000 gas | Send ETH to another wallet |
| Transfer ERC-20 token | ~65,000 gas | Send USDC to someone |
| Uniswap swap | ~150,000 gas | Swap ETH for USDC |
| NFT mint | ~100,000-300,000 gas | Mint a new NFT |
| Deploy a contract | ~1,000,000+ gas | Deploy a new smart contract |

Gas use depends on the operations executed, their inputs, and the relevant state. The **price per unit of gas** also changes with demand. The table gives examples rather than guaranteed costs for every implementation.

## How the fee is calculated

Since August 2021 (EIP-1559), Ethereum uses this formula:

<div class="diagram">
<svg viewBox="0 0 800 140" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:650px">
 <rect x="20" y="20" width="760" height="100" rx="12" fill="#f8fafc" stroke="#334155" stroke-width="1.5"/>

 <rect x="50" y="45" width="160" height="50" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
 <text x="130" y="65" text-anchor="middle" font-size="12" font-weight="600" fill="#1e40af">Gas Used</text>
 <text x="130" y="82" text-anchor="middle" font-size="10" fill="#64748b">21,000 for a transfer</text>

 <text x="230" y="75" text-anchor="middle" font-size="20" fill="#94a3b8">×</text>

 <rect x="250" y="45" width="200" height="50" rx="8" fill="#fefce8" stroke="#eab308" stroke-width="1.5"/>
 <text x="350" y="62" text-anchor="middle" font-size="12" font-weight="600" fill="#854d0e">Base Fee + Tip</text>
 <text x="350" y="82" text-anchor="middle" font-size="10" fill="#64748b">Set by network demand</text>

 <text x="470" y="75" text-anchor="middle" font-size="20" fill="#94a3b8">=</text>

 <rect x="490" y="45" width="260" height="50" rx="8" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
 <text x="620" y="65" text-anchor="middle" font-size="12" font-weight="600" fill="#166534">Total Fee (in ETH)</text>
 <text x="620" y="82" text-anchor="middle" font-size="10" fill="#64748b">21,000 × 30 gwei = 0.00063 ETH</text>
</svg>
</div>

**Base fee**: Set automatically by the protocol. Goes up when blocks are full, goes down when they are not. This portion is **burned** (permanently destroyed). Nobody receives it.

**Priority tip**: An optional tip you add to incentivize validators to include your transaction faster. During busy periods, higher tips get processed first.

## Why fees spike

Ethereum can process about 15-30 transactions per second. When demand exceeds this, users bid against each other for block space. Fees rise until enough people stop transacting.

Events that cause fee spikes:

- **Popular NFT mints**: When a hyped NFT collection launches, thousands of people try to mint at the same time
- **Market crashes**: Everyone rushes to sell or move funds to safety
- **New token launches**: Speculators race to buy new tokens early
- **Airdrop claims**: When a protocol distributes free tokens, everyone claims at once

The dollar cost depends on gas used, the effective gas price, and ETH's market price. Review the wallet's current estimate before submitting a transaction.

## How to pay less

| Strategy | How it works |
| --- | --- |
| **Compare networks** | Check current execution and data fees on networks supported by the application |
| **Wait when practical** | Monitor demand rather than assume a particular day is cheapest |
| **Set fee caps carefully** | A fee cap limits the price per gas unit; the gas limit caps units available to execution |
| **Batch transactions** | Some protocols let you combine multiple operations into one transaction |
| **Use gas tracking tools** | Sites like etherscan.io/gastracker show current fees in real-time |

## The burn mechanism

Before EIP-1559, all fees went to miners. Now, the base fee is burned. In high-usage periods, more ETH is burned than created by new block rewards. This makes ETH **deflationary** - the total supply decreases.

Since EIP-1559 launched, over 4 million ETH has been burned (worth billions of dollars). Whether ETH is inflationary or deflationary in any given period depends on how busy the network is.

## Key takeaways

- Gas is a unit of computation. The price per unit depends on network demand.
- Total fee = gas used × (base fee + priority tip). The base fee is burned.
- Fees spike during high-demand events (NFT mints, market crashes).
- Layer 2 fees depend on execution costs, data costs, and network demand.
- Use gas trackers and time transactions to save money.
