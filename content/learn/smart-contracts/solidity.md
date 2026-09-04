---
title: What is Solidity?
description: An introduction to the programming language of Ethereum and the EVM.
order: 1
readTime: 6 min
difficulty: beginner
prerequisites: []
quiz:
  - question: What is Solidity primarily used for?
    options:
      - Building frontend websites
      - Writing smart contracts that run on the Ethereum Virtual Machine (EVM)
      - Training AI models
      - Managing SQL databases
    correct: 1
    explanation: >-
      Solidity is the primary language used to write smart contracts for
      Ethereum and other EVM-compatible blockchains.
  - question: Which language does Solidity closely resemble syntactically?
    options:
      - Python
      - 'C++, JavaScript, and C#'
      - HTML
      - Ruby
    correct: 1
    explanation: >-
      Solidity's syntax is heavily influenced by C++, JavaScript, and C#. It
      uses curly braces, static typing, and object-oriented programming
      concepts.
  - question: What does it mean that Solidity is 'statically typed'?
    options:
      - Variables cannot change values
      - You must declare the data type of each variable at compile time
      - The code cannot be deleted from the blockchain
      - It runs slowly
    correct: 1
    explanation: >-
      In statically typed languages like Solidity, you must declare whether a
      variable is an integer, a string, or an address when you write the code.
      It is not inferred dynamically like in JavaScript.
  - question: >-
      What compiles Solidity code into instructions the blockchain can
      understand?
    options:
      - The browser
      - The Solidity Compiler (solc) turns it into EVM bytecode
      - A web server
      - A consensus algorithm
    correct: 1
    explanation: >-
      Solidity code is compiled into EVM bytecode, which is the low-level
      hexadecimal format that nodes on the Ethereum network actually execute.
  - question: Can a Solidity contract be modified after it is deployed?
    options:
      - 'Yes, anytime by the creator'
      - 'No, the code is immutable once deployed'
      - 'Yes, if the Ethereum Foundation approves'
      - 'No, but you can delete the blockchain'
    correct: 1
    explanation: >-
      Once deployed to a blockchain, the code of a smart contract cannot be
      altered. To change the logic, developers must deploy a new contract
      (though proxy patterns allow for upgradeable architecture).
lastUpdated: 2026-09-04
---

## The Language of Web3

If you want to build on Ethereum, Arbitrum, Optimism, Base, or Polygon, you need to write code that the Ethereum Virtual Machine (EVM) understands. 

The EVM only reads machine-level "bytecode." Writing bytecode by hand is incredibly difficult. **Solidity** is the high-level language designed specifically to write smart contracts that compile down into that bytecode.

## Key Characteristics of Solidity

Solidity was designed with specific constraints in mind, because code running on a blockchain handles real financial value and cannot be changed once deployed.

1. **Object-Oriented**: Contracts in Solidity behave a lot like classes in object-oriented programming. They contain state variables (data) and functions (behavior). Contracts can also inherit from other contracts.
2. **Statically Typed**: You must declare what type of data a variable holds (e.g., `uint256` for a positive integer, `address` for a wallet address, `bool` for true/false). This helps catch errors before the code is deployed.
3. **State Management**: Solidity is built to interact with the blockchain's state. Variables defined at the contract level are permanently stored on the blockchain.
4. **Value Transfers**: Built-in keywords like `payable` and types like `address` make it incredibly easy to send and receive ETH directly within the code.

## The Compilation Process

<div class="diagram">
<svg viewBox="0 0 800 150" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
 <rect x="50" y="35" width="160" height="80" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
 <text x="130" y="65" text-anchor="middle" font-size="14" font-weight="bold" fill="#1e40af">Solidity Code</text>
 <text x="130" y="85" text-anchor="middle" font-size="11" fill="#3b82f6">.sol files (Human readable)</text>

 <line x1="210" y1="75" x2="330" y2="75" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>
 <text x="270" y="65" text-anchor="middle" font-size="11" fill="#64748b">Compiler (solc)</text>

 <rect x="330" y="20" width="160" height="50" rx="8" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
 <text x="410" y="40" text-anchor="middle" font-size="12" font-weight="bold" fill="#166534">ABI</text>
 <text x="410" y="55" text-anchor="middle" font-size="9" fill="#166534">JSON interface for UI to interact</text>

 <rect x="330" y="80" width="160" height="50" rx="8" fill="#fefce8" stroke="#eab308" stroke-width="1.5"/>
 <text x="410" y="100" text-anchor="middle" font-size="12" font-weight="bold" fill="#854d0e">Bytecode</text>
 <text x="410" y="115" text-anchor="middle" font-size="9" fill="#854d0e">0x60806040... (Machine code)</text>

 <line x1="490" y1="105" x2="610" y2="105" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>
 <text x="550" y="95" text-anchor="middle" font-size="11" fill="#64748b">Deployed to</text>

 <rect x="610" y="65" width="140" height="80" rx="8" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
 <text x="680" y="100" text-anchor="middle" font-size="14" font-weight="bold" fill="#991b1b">Blockchain</text>
 <text x="680" y="120" text-anchor="middle" font-size="11" fill="#ef4444">(EVM executes it)</text>

 <defs>
 <marker id="arrow" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#94a3b8"/></marker>
 </defs>
</svg>
</div>

When you finish writing your `.sol` file, you compile it. The compiler outputs two crucial things:

1. **Bytecode**: The actual hex code that is deployed to the blockchain and executed by the EVM.
2. **ABI (Application Binary Interface)**: A JSON file that describes all the functions and variables in your contract. Frontend applications (like a React app) use the ABI to know how to interact with the deployed contract.

## Why developers learn Solidity

While other languages exist (like Rust for Solana, or Vyper for Ethereum), Solidity has the largest developer ecosystem, the most audited standard libraries (like OpenZeppelin), and the vast majority of developer tooling (Hardhat, Foundry, Remix). 

If you want to become a smart contract engineer, Solidity is the mandatory starting point.

## Key takeaways

- Solidity is a statically typed, object-oriented language for writing EVM smart contracts.
- Code is compiled into bytecode (deployed to the blockchain) and an ABI (used by frontends to interact with the contract).
- Contracts are immutable once deployed.
- It is the most dominant language in the Web3 developer ecosystem.
