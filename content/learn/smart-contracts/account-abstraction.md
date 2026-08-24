---
title: Account Abstraction (ERC-4337)
description: >-
  How smart contract wallets are replacing EOAs and enabling gasless,
  social-recovery experiences.
order: 9
readTime: 9 min
difficulty: intermediate
prerequisites:
  - first-contract
quiz:
  - question: What is the main limitation of Externally Owned Accounts (EOAs)?
    options:
      - They cannot hold tokens.
      - >-
        They require a private key for every action, offer no recovery, and
        cannot batch transactions.
      - They are too expensive to create.
      - They only work on Ethereum.
    correct: 1
    explanation: >-
      EOAs are controlled by a single private key. Lose it, and your funds are
      gone forever. They cannot natively batch transactions, sponsor gas fees,
      or implement custom security policies.
  - question: How does ERC-4337 achieve 'gasless' transactions?
    options:
      - By eliminating gas fees entirely.
      - >-
        By allowing a third party (Paymaster) to sponsor the gas fees on behalf
        of the user.
      - By using a faster blockchain.
      - By compressing transactions to use less gas.
    correct: 1
    explanation: >-
      ERC-4337 introduces Paymasters - smart contracts that pay gas fees on
      behalf of users. This allows apps to offer gasless experiences by
      absorbing gas costs.
  - question: What problem does Account Abstraction solve?
    options:
      - It makes transactions faster.
      - >-
        It replaces rigid externally owned accounts (EOAs) with programmable
        smart contract wallets that support social recovery, session keys, and
        batched transactions.
      - It removes the need for private keys.
      - It eliminates gas fees entirely.
    correct: 1
    explanation: >-
      Traditional EOAs (MetaMask-style wallets) have a single point of failure:
      lose the private key, lose everything. Account abstraction makes wallets
      programmable - you can add recovery options, spending limits, multi-sig
      approval, and even let apps transact on your behalf within defined rules.
  - question: What are 'session keys' and why are they important for Web3 gaming?
    options:
      - Keys that expire after each login.
      - >-
        Temporary keys with limited permissions that let a game sign
        transactions on your behalf without prompting for wallet approval on
        every action.
      - Keys shared between multiple users.
      - Keys stored on the blockchain.
    correct: 1
    explanation: >-
      In a Web3 game, approving every sword swing or item pickup with a wallet
      popup would be unplayable. Session keys grant the game temporary, scoped
      permission (e.g., 'can spend up to 0.01 ETH on in-game actions for the
      next 2 hours') without exposing your main private key.
  - question: What is a 'UserOperation' in ERC-4337?
    options:
      - A regular Ethereum transaction.
      - >-
        A pseudo-transaction object that represents the user's intent - it gets
        collected by a Bundler, batched with other UserOperations, and submitted
        to the blockchain as a single transaction.
      - A database query.
      - A smart contract deployment.
    correct: 1
    explanation: >-
      ERC-4337 introduced UserOperations as an alternative to standard
      transactions. Instead of users paying gas directly, they create UserOps
      that are collected by Bundlers (specialized relayers). The Bundler groups
      multiple UserOps into one on-chain transaction, allowing flexible gas
      payment and sponsorship.
---

## The Problem with Traditional Wallets

Every Ethereum account today is an Externally Owned Account (EOA) - a raw public-private key pair. MetaMask, Coinbase Wallet, and every hardware wallet use EOAs.

This creates terrible UX:

- **No recovery:** Lose your seed phrase, lose everything.
- **No batching:** Each action (approve + swap) requires a separate transaction.
- **Manual gas:** Users must hold ETH to pay gas, even when transacting with other tokens.
- **No spending limits:** You cannot set daily transfer caps.
- **Single point of failure:** One compromised key = total loss.

These problems make crypto hostile to mainstream users. Account abstraction fixes this.

## What Is Account Abstraction?

Account abstraction means turning your wallet from a dumb key pair into a **smart contract** that can have custom logic:

- Multiple signers (2FA, multisig)
- Social recovery (trusted friends can help you regain access)
- Spending limits and transaction rules
- Gas sponsorship (someone else pays gas)
- Transaction batching (approve + swap in one click)
- Session keys (grant temporary, limited permissions to apps)

## ERC-4337: The Standard

ERC-4337 is the Ethereum standard for account abstraction, deployed on mainnet in March 2023. It works without changing Ethereum's core protocol.

### Key Components

**UserOperation:** Instead of sending a regular transaction, users create a "UserOperation" - a data structure describing what they want to do.

**Bundler:** A node that collects UserOperations from multiple users and submits them as a single on-chain transaction. Bundlers earn fees for this service.

**EntryPoint:** A singleton smart contract (deployed once on each chain) that verifies and executes UserOperations.

**Paymaster:** An optional smart contract that sponsors gas fees. Apps can deploy Paymasters to pay gas for their users, enabling gasless experiences.

**Account Contract:** The user's smart contract wallet that defines custom verification logic (what signatures are required, what spending limits apply, etc.).

### The Flow

1. User creates a UserOperation ("swap 100 USDC for ETH on Uniswap").
2. The UserOperation is sent to a Bundler (off-chain).
3. The Bundler submits it to the EntryPoint contract.
4. EntryPoint calls the user's Account Contract to verify the operation.
5. If a Paymaster is specified, EntryPoint asks the Paymaster to cover gas.
6. The operation executes.

<div class="diagram">
<svg viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
 <rect x="10" y="70" width="100" height="60" rx="8" fill="#f0f9ff" stroke="#3b82f6" stroke-width="2"/>
 <text x="60" y="95" text-anchor="middle" font-size="12" font-weight="600" fill="#1e40af">User</text>
 <text x="60" y="112" text-anchor="middle" font-size="10" fill="#64748b">creates UserOp</text>

 <line x1="110" y1="100" x2="170" y2="100" stroke="#3b82f6" stroke-width="1.5" marker-end="url(#a4337)"/>

 <rect x="170" y="70" width="110" height="60" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
 <text x="225" y="95" text-anchor="middle" font-size="12" font-weight="600" fill="#92400e">Bundler</text>
 <text x="225" y="112" text-anchor="middle" font-size="10" fill="#b45309">batches ops</text>

 <line x1="280" y1="100" x2="340" y2="100" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#a4337b)"/>

 <rect x="340" y="70" width="120" height="60" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
 <text x="400" y="95" text-anchor="middle" font-size="12" font-weight="600" fill="#1e40af">EntryPoint</text>
 <text x="400" y="112" text-anchor="middle" font-size="10" fill="#64748b">validates + runs</text>

 <line x1="460" y1="85" x2="520" y2="85" stroke="#22c55e" stroke-width="1.5" marker-end="url(#a4337c)"/>
 <line x1="460" y1="115" x2="520" y2="115" stroke="#ec4899" stroke-width="1.5" marker-end="url(#a4337d)"/>

 <rect x="520" y="50" width="120" height="40" rx="8" fill="#dcfce7" stroke="#22c55e" stroke-width="1.5"/>
 <text x="580" y="75" text-anchor="middle" font-size="11" font-weight="600" fill="#166534">Account</text>

 <rect x="520" y="110" width="120" height="40" rx="8" fill="#fdf2f8" stroke="#ec4899" stroke-width="1.5"/>
 <text x="580" y="135" text-anchor="middle" font-size="11" font-weight="600" fill="#9d174d">Paymaster</text>

 <text x="680" y="75" font-size="10" fill="#64748b">verifies signer</text>
 <text x="680" y="135" font-size="10" fill="#64748b">pays gas</text>

 <defs>
 <marker id="a4337" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#3b82f6"/></marker>
 <marker id="a4337b" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#f59e0b"/></marker>
 <marker id="a4337c" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#22c55e"/></marker>
 <marker id="a4337d" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#ec4899"/></marker>
 </defs>
</svg>
</div>

## Real-World Implementations

### Safe (formerly Gnosis Safe)
The most widely used smart contract wallet. Over $100 billion in assets secured. Supports multisig (e.g., 3/5 owners must approve), modules for automation, and now ERC-4337 support.

### Coinbase Smart Wallet
Coinbase launched a smart wallet using ERC-4337 with passkey authentication. Users create wallets with biometrics (Face ID, fingerprint) instead of seed phrases.

### Pimlico, Alchemy, Stackup
Infrastructure providers that run Bundler services and Paymaster contracts, making it easy for apps to integrate ERC-4337.

## Session Keys: The major shift

Session keys allow a smart wallet to grant temporary, scoped permissions to an application. For example:

"Allow this gaming app to move my in-game NFTs for the next 2 hours, with a maximum of 10 transactions, and zero access to my ETH or USDC."

This eliminates the constant "approve transaction" popups that plague current Web3 UX while maintaining granular security.

## Why This Matters

Account abstraction is the single most important UX improvement in Web3. It enables:
- **Onboarding without seed phrases** (use email, passkeys, social login).
- **Gasless transactions** for new users.
- **Recovery without hardware wallets** (social recovery, email recovery).
- **Institutional-grade security** (multisig, spending limits, timelocks).

The next billion crypto users will use smart contract wallets without even knowing they are interacting with a blockchain.

## Key Takeaways

- EOAs (MetaMask-style wallets) have fundamental UX limitations.
- ERC-4337 enables smart contract wallets with custom logic.
- Paymasters enable gasless transactions by sponsoring gas fees.
- Session keys give apps temporary, scoped permissions.
- Account abstraction is the path to mainstream crypto adoption.
