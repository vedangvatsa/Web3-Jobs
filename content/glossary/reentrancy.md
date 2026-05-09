---
term: "Reentrancy"
slug: "reentrancy"
category: "security"
difficulty: "Advanced"
image: "https://images.unsplash.com/photo-1611974519553-bc61f192d934?w=1200&q=80"
description: "A smart contract vulnerability where a function can be called recursively before internal state is updated, allowing attackers to drain funds through repeated calls."
relatedTerms: ["smart-contract", "security", "exploit", "vulnerability"]
synonyms: ["recursive call attack", "function reentrancy", "state attack"]
---

Reentrancy is a smart contract vulnerability that occurs when a function can be called repeatedly before its internal state updates are complete, enabling attackers to drain funds through recursive calls. The most infamous example is the 2016 DAO hack on Ethereum, where an attacker exploited a reentrancy flaw in the withdraw function to siphon 3.6 million ETH, triggering a contentious hard fork that created Ethereum Classic. The attack works by having a malicious contract's receive function repeatedly call back into the vulnerable withdraw function before the victim contract can update the sender's balance to zero. Modern developers prevent reentrancy using the checks-effects-interactions pattern or reentrancy guard modifiers that block recursive calls. Security auditors and smart contract developers who understand reentrancy vulnerabilities remain highly sought after as protocols prioritize protecting user funds.

## Reentrancy Mechanics

How attacks work:

- **1. Initial Call**: Attacker calls withdraw function. Contract checks balance (sufficient), then sends funds.

- **2. Before State Update**: Funds sent before balance is updated in contract storage.

- **3. Fallback Function**: Attacker's contract has fallback function triggered when receiving funds.

- **4. Recursive Call**: Fallback function calls withdraw again, triggering same function recursively.

- **5. Repeated**: Function executes again with outdated balance, pays attacker again.

- **6. State Finally Updates**: After all recursive calls, balance finally updated. But attacker drained multiple times.

Recursive calls exploit delayed state updates.

## The DAO Hack

Historical example:

- **Setup**: DAO held ETH. Users could withdraw funds by calling withdraw() function.

- **Vulnerability**: Withdraw function sent funds before updating balance ledger.

- **Attack**: Attacker called withdraw(). Contract sent 1 ETH. Attacker's fallback function called withdraw() again. Got sent 1 ETH again. Repeated multiple times.

- **Result**: Attacker drained 3.6M ETH exploiting reentrancy.

- **Impact**: Hard fork required to recover funds. Spawned Ethereum Classic.

The DAO hack was a significant moment for smart contract security.

## Reentrancy Prevention

How to prevent:

- **Checks-Effects-Interactions**: Pattern ensuring state updates before interactions.

```solidity
// BAD - Vulnerable to reentrancy
function withdraw() {
 uint amount = balances[msg.sender];
 (bool success, ) = msg.sender.call{value: amount}("");
 require(success);
 balances[msg.sender] = 0; // Updated AFTER sending funds
}

// GOOD - Prevents reentrancy
function withdraw() {
 uint amount = balances[msg.sender];
 balances[msg.sender] = 0; // Update BEFORE sending
 (bool success, ) = msg.sender.call{value: amount}("");
 require(success);
}
```

State should update before sending funds.

## Reentrancy Guards

Automated prevention:

- **Mutex Pattern**: Lock prevents function re-entry while executing.

```solidity
bool locked = false;

modifier nonReentrant() {
 require(!locked);
 locked = true;
 _;
 locked = false;
}

function withdraw() nonReentrant {
 // Reentrancy protected
}
```

OpenZeppelin provides ReentrancyGuard ensuring non-reentrant execution.

## Reentrancy Types

Different variations:

- **Single-Function Reentrancy**: Function calls itself. Most common.

- **Cross-Function Reentrancy**: Function A calls function B which calls function A. More subtle.

- **Cross-Contract Reentrancy**: Reentrancy across multiple contracts. Very subtle.

- **Read-Only Reentrancy**: Reading inconsistent state during reentrancy (different vulnerability).

Modern guard patterns protect against most variants.

## Recent Reentrancy Exploits

Modern examples:

- **Pancakebunny**: Reentrancy across multiple pools drained funds.

- **Cream Finance**: Cross-contract reentrancy via flash loans drained funds.

- **bZx**: Multiple reentrancy vulnerabilities in DeFi protocols.

Even modern protocols are vulnerable if not careful.

## Career Opportunities

Security creates roles:

- **Smart Contract Auditors** finding reentrancy vulnerabilities earn competitive salaries.

- **Security Researchers** studying exploit patterns earn competitive salaries.

- **Protocol Security Engineers** preventing exploits earn competitive salaries.

- **Formal Verification Engineers** proving contract safety earn competitive salaries.

- **Incident Response Teams** responding to exploits earn competitive salaries.

## Best Practices

Preventing reentrancy:

- **Use Checks-Effects-Interactions**: Always update state before interactions.

- **Use Reentrancy Guards**: Use OpenZeppelin's ReentrancyGuard.

- **Avoid Dangerous Patterns**: Don't use .call for payments if possible.

- **Audit Thoroughly**: Have contracts professionally audited.

- **Test Edge Cases**: Include reentrancy tests in test suite.

- **Stay Updated**: Follow security best practices as patterns evolve.

## The Future of Security

Security evolution:

- **Formal Verification**: Proving contract correctness mathematically.

- **Automated Auditing**: Tools automatically finding vulnerabilities.

- **Safer Languages**: Languages with built-in safety.

- **Staged Rollouts**: More protocols doing careful staged rollouts.

- **Bug Bounties**: Protocols offering bounties for vulnerability discovery.

## Prevent Recursive Attacks

Reentrancy is a serious vulnerability but preventable with proper patterns. Understanding reentrancy is critical for smart contract developers. If you're interested in smart contract security, explore [security careers](/) at audit firms and protocol teams. These roles focus on keeping DeFi safe.
