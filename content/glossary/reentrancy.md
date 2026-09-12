---
term: Reentrancy
slug: reentrancy
category: security
difficulty: Advanced
image: 'https://images.unsplash.com/photo-1611974519553-bc61f192d934?w=1200&q=80'
description: >-
  A smart contract vulnerability where a function can be called recursively
  before internal state is updated, allowing attackers to drain funds through
  repeated calls.
relatedTerms:
  - smart-contract
  - security
  - exploit
  - vulnerability
synonyms:
  - recursive call attack
  - function reentrancy
  - state attack
lastUpdated: 2026-09-04
---

Reentrancy is a smart contract bug where an external call gets control before the calling contract has finished updating its own state. The recipient can call back into the first contract while balances, accounting, or permissions still reflect the earlier state. If the second call passes the same checks, the contract can pay or account for the same value more than once.

The common example is a withdrawal function. A contract checks that Alice has 1 ETH recorded in its internal ledger, sends Alice 1 ETH, and only then sets her balance to zero. If Alice is a contract, receiving ETH can run its `receive` function. That function can call `withdraw` again before the first call reaches the balance update. The second call still sees a balance of 1 ETH.

The DAO incident in 2016 showed why this order matters. A reentrancy flaw let an attacker repeatedly withdraw before the relevant accounting completed. The incident helped make contract-call order, withdrawal design, and independent review central parts of Ethereum security work. It is not the only form of reentrancy, and copying a guard into one function does not automatically protect an entire protocol.

## A vulnerable call sequence

A typical vulnerable sequence has four steps:

1. A caller asks to withdraw an amount recorded in a contract mapping.
2. The contract checks the mapping and makes an external call to send assets.
3. The recipient's code runs before the first function has updated the mapping.
4. The recipient calls the withdrawal function again, using the stale balance.

The external call does not need to be an ETH transfer. It can be a token transfer with a callback, a call to another protocol, an oracle update, a hook, or any other interaction that lets untrusted code run. Solidity's [security considerations](https://docs.soliditylang.org/en/latest/security-considerations.html) describe this as a risk whenever control passes to an external contract.

The first call often succeeds because the contract uses `call`, which forwards control to the recipient. `transfer` and `send` used to be treated as a simple defense because of their gas limits. That is not a safe general rule. Gas costs can change, legitimate recipients may need more gas, and protocols still have to keep their accounting correct before every external interaction.

## Update state before calling out

The usual pattern is checks-effects-interactions. Check inputs and permissions first. Update the contract's own state second. Make the external call last.

```solidity
// Unsafe: external code runs before the balance changes.
function withdraw() {
 uint amount = balances[msg.sender];
 require(amount > 0);
 (bool success, ) = msg.sender.call{value: amount}("");
 require(success);
 balances[msg.sender] = 0;
}

// Safer: the second call sees a zero balance.
function withdraw() {
 uint amount = balances[msg.sender];
 require(amount > 0);
 balances[msg.sender] = 0;
 (bool success, ) = msg.sender.call{value: amount}("");
 require(success);
}
```

Updating the balance first means a reentrant call fails the balance check. In production code, the same rule applies to shares, debt, collateral, allowances, reward indices, and governance votes. A developer must identify every state value that a later call could rely on, not only the most obvious token balance.

## Reentrancy guards

A reentrancy guard adds a temporary lock around a function. While the function is running, another call to a protected function reverts.

```solidity
bool locked = false;

modifier nonReentrant() {
 require(!locked);
 locked = true;
 _;
 locked = false;
}

function withdraw() nonReentrant {
 // Update state, then make the external transfer.
}
```

OpenZeppelin's [ReentrancyGuard](https://docs.openzeppelin.com/contracts/api/utils#ReentrancyGuard) provides a standard implementation. It is a useful second control, but it is not a substitute for correct accounting. A guard can also create design constraints: two `nonReentrant` functions cannot call each other directly, so shared work often belongs in an internal function without the modifier.

## Variants to check

Single-function reentrancy is the direct example above. Cross-function reentrancy is less obvious. A recipient may reenter a different public function that reads or changes related state. For example, a withdrawal function may be guarded while an unguarded claim function still treats the caller's old collateral or share balance as valid.

Cross-contract reentrancy spans more than one contract. A vault, token, controller, and price module can each look safe alone while their combined call order exposes inconsistent state. This is common in systems with hooks, callback-based token standards, or composable DeFi integrations.

Read-only reentrancy does not always steal funds in the first call. Instead, a callback causes another contract to read a temporary, inconsistent value. That contract may calculate a price, mint shares, or approve a loan using the wrong value. The vulnerable contract may have restored its state by the end of the transaction, but the second contract has already acted on the transient result.

Reviewers test reentrancy by writing a hostile receiver contract, not by assuming a normal wallet is the recipient. They should try repeated calls, calls into related public functions, zero-value and partial withdrawals, failed transfers, and interactions through token or protocol callbacks. The goal is to show that every reachable path preserves its accounting rules before and after an external call.
