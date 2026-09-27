---
title: The Auditor Mindset
description: How smart contract auditors think and why code review is different in Web3.
order: 1
readTime: 7 min
difficulty: advanced
prerequisites: []
quiz:
  - question: How does Web3 security differ from traditional Web2 cybersecurity?
    options:
      - It doesn't; they are identical
      - >-
        Web2 focuses on keeping hackers out of servers; Web3 code is public, so
        security is entirely about flawless logic
      - Web3 relies on antivirus software
      - Web2 is more secure
    correct: 1
    explanation: >-
      In Web3, the smart contract code is public and immutable. Hackers don't
      need to bypass firewalls; they just read the code, find a logical flaw,
      and execute an exploit directly on the blockchain.
  - question: What is the primary goal of a smart contract audit?
    options:
      - To fix spelling errors in the code
      - To guarantee 100% that the code can never be hacked
      - >-
        To identify vulnerabilities, edge cases, and deviations from intended
        logic before deployment
      - To rewrite the code in a different language
    correct: 2
    explanation: >-
      An audit cannot guarantee perfect security. Its goal is to thoroughly
      review the code, identify known vulnerability patterns, and ensure the
      contract logic matches the documentation.
  - question: What does it mean to 'assume the caller is malicious'?
    options:
      - Never talk to strangers
      - >-
        In Solidity, you must build functions assuming every input is designed
        to break the system
      - Hackers always use specific IP addresses
      - You should ban all users
    correct: 1
    explanation: >-
      The core auditor mindset is adversarial thinking. Because anyone can
      interact with a public contract, every function parameter, external call,
      and state change must be scrutinized against malicious manipulation.
  - question: What do invariant checks test during an audit?
    options:
      - They check if the compiler is working
      - >-
        They are core mathematical truths about the protocol that must always
        remain true (e.g., total deposits must equal total liabilities)
      - They check for variable names
      - They ensure the contract deploys quickly
    correct: 1
    explanation: >-
      Invariants are the fundamental rules of a system. An auditor tests every
      possible state change to ensure invariants are never broken. If a rule can
      be broken, an exploit exists.
  - question: What happens if a critical bug is found after a contract is deployed?
    options:
      - The developers press the undo button
      - The blockchain is paused
      - >-
        If the contract is not upgradeable, the funds might be lost or the
        contract must be abandoned
      - The gas fee is refunded
    correct: 2
    explanation: >-
      Smart contracts are immutable by default. Unless the contract was
      specifically designed with an upgrade proxy pattern, fixing a bug requires
      deploying a completely new contract and migrating users over.
lastUpdated: 2026-09-04
---

## What a contract audit examines

A contract audit examines whether code behaves as intended when users, administrators, and external contracts interact with it. Reviewers check access controls, asset accounting, state changes, and dependencies.

The review should identify which code version and deployment configuration are in scope.

A deployed contract may control assets that its operator cannot recover after a faulty transfer. Upgrade and pause mechanisms can provide recovery options, but they introduce permissions that also need review.

Auditing combines code review, testing, and checks of the assumptions the protocol makes about other systems.

## Web2 vs Web3 Security

<div class="diagram">
<svg viewBox="0 0 800 220" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
 <!-- Web2 -->
 <rect x="50" y="20" width="320" height="180" rx="8" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>
 <text x="210" y="50" text-anchor="middle" font-size="14" font-weight="bold" fill="#334155">Web2 Security (The Castle)</text>

 <circle cx="210" cy="120" r="40" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/>
 <text x="210" y="125" text-anchor="middle" font-size="12" font-weight="bold" fill="#334155">Server</text>

 <!-- Walls -->
 <path d="M 150,120 A 60,60 0 0,1 270,120" fill="none" stroke="#ef4444" stroke-width="4" stroke-dasharray="4"/>
 <text x="210" y="80" text-anchor="middle" font-size="10" fill="#ef4444">Firewalls / Auth</text>

 <text x="210" y="185" text-anchor="middle" font-size="11" fill="#475569">Goal: Keep the hacker OUT of the system.</text>

 <!-- Web3 -->
 <rect x="430" y="20" width="320" height="180" rx="8" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
 <text x="590" y="50" text-anchor="middle" font-size="14" font-weight="bold" fill="#166534">Web3 Security (The Board Game)</text>

 <rect x="530" y="90" width="120" height="60" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
 <text x="590" y="115" text-anchor="middle" font-size="12" font-weight="bold" fill="#166534">Public Code</text>
 <text x="590" y="135" text-anchor="middle" font-size="9" fill="#166534">Hackers are already inside.</text>

 <text x="590" y="185" text-anchor="middle" font-size="11" fill="#166534">Goal: Ensure the rules (code) are flawless.</text>
</svg>
</div>

Web applications and smart contracts both need access control and correct application logic. Public contracts also expose callable functions and state that an adversary can inspect directly.

Review the surrounding infrastructure too: compromised administrator keys, deployment scripts, websites, or oracle services can affect a contract even when its own functions behave as written.

## The Auditor's Mindset

An auditor does not read code looking for typos. They read code adversarially. They ask: *"If I were trying to steal money from this contract, how would I do it?"*

### 1. Identify the Assets
The first step is always mapping out the value. Where is the ETH? Where are the ERC-20 tokens? Who has permission to move them?

### 2. Identify the Actors
Who interacts with the contract? Regular users, admins, external protocols? 
Test untrusted inputs and unexpected behavior from external actors, including privileged accounts that could be compromised.

### 3. Establish Invariants
Invariants are rules that must *always* be true, no matter what happens.
- *Example 1:* In an ERC-20 token, the sum of all individual user balances must exactly equal the `totalSupply`.
- *Example 2:* In a lending pool, `Total Deposits >= Total Borrows`.

Auditors look for any sequence of complex interactions that could temporarily or permanently break these invariants.

### 4. Analyze External Calls
Whenever a smart contract calls another smart contract, danger exists. The auditor assumes the external contract will attempt a **reentrancy attack** (calling back into the original contract before it finishes updating its state) or return unexpected data to crash the transaction.

## The Role of the Auditor

Auditing firms (like Trail of Bits, OpenZeppelin, Consensys Diligence) are hired by protocol developers before a project launches. 

The auditors spend weeks trying to break the code. They deliver a report detailing every vulnerability they found, categorized by severity (Critical, High, Medium, Low). The developers fix the bugs, and the auditors verify the fixes before the code goes live.

An audit report records findings within a stated scope and review period. Check unresolved findings, follow-up work, and whether the deployed version matches the reviewed code. A completed audit does not prove that no vulnerabilities remain.

## Key takeaways

- Publicly callable functions must handle adversarial inputs and unexpected call sequences.
- Audit testing should use an authorized test environment and a defined scope.
- Invariants describe conditions that the implementation is expected to preserve.
- An audit minimizes risk but does not guarantee 100% safety.
