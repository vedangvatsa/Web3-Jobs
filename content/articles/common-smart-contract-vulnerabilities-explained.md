---
title: Common Smart Contract Vulnerabilities Explained
image: /images/christin-hume-Hcfwew744z4-unsplash.jpg
data-ai-hint: security vulnerability lock
description: >-
  A practical Solidity security guide covering reentrancy, arithmetic, access
  control, oracle assumptions, low-level calls, and a review-first workflow.
category: Technology Deep Dives
publishedDate: '2026-03-11'
lastUpdated: "2026-09-12"
---

A smart contract can be correct on the path its author expected and still be unsafe when another contract, a malicious caller, an unusual token, or an unexpected price reaches it. That is the central security problem in [Web3](/what-is-web3): contracts often hold assets, expose public functions, and execute in an environment where callers can compose behavior in ways the original author did not plan.

The Solidity documentation makes the point plainly: it is easier to build software that appears to work than to prove that no one can use it in an unintended way. It also notes that contract execution and much contract source code are public. Read the compiler's [security considerations](https://docs.soliditylang.org/en/latest/security-considerations.html) before treating any short checklist as complete. This article explains recurring failure patterns, but it cannot certify a contract.

Start each review with an inventory. What assets can leave? Who can change parameters, pause operations, mint tokens, or upgrade code? Which external contracts, price feeds, and offchain services does the system trust? What must remain true after every call? An invariant might be that a user cannot withdraw more than their recorded credit, that total claims never exceed collateral, or that no unapproved account can mint. Vulnerabilities are often violations of one of these plain statements.

## 1. Reentrancy

Reentrancy occurs when a contract gives control to an external address before it has finished updating its own state. The recipient may be a contract, and that contract can call back into the first contract while the original function is still running. If the first contract still believes a balance, allowance, or claim is available, the callback may use it again.

The risky order is visible in this simplified withdrawal function. It sends ETH first and clears the internal balance afterward.

```solidity
// Do not use this pattern.
mapping(address => uint256) public balances;

function withdraw() external {
    uint256 amount = balances[msg.sender];
    require(amount > 0, "Nothing to withdraw");

    (bool sent,) = msg.sender.call{value: amount}("");
    require(sent, "Transfer failed");

    balances[msg.sender] = 0;
}
```

An attacker's receiving contract can use its `receive` or fallback function to call `withdraw` again before `balances[msg.sender]` becomes zero. The Solidity documentation uses this same category of example and explains that Ether transfers and other external calls can hand control to another contract. The problem is broader than a single ETH payout: any external interaction can create a reentry point, including a call to a token, hook, callback, or dependent contract.

Use checks-effects-interactions as the default order. Validate inputs and permissions first. Update internal state second. Make an external call last.

```solidity
function withdraw() external {
    uint256 amount = balances[msg.sender];
    require(amount > 0, "Nothing to withdraw");

    balances[msg.sender] = 0;

    (bool sent,) = msg.sender.call{value: amount}("");
    require(sent, "Transfer failed");
}
```

The order prevents the second call from seeing a still-available balance. It does not replace a review of the whole system. A call to another contract can affect related state elsewhere, so inspect cross-contract flows too. A `ReentrancyGuard` can add another line of defense for functions that must not be entered again; OpenZeppelin documents it as a modifier that prevents reentrancy in selected functions. Use it deliberately, name the guarded entry points, and do not let the modifier become a reason to ignore state ordering.

The safest public asset flow is often a pull payment. Record what a recipient can claim, then let that recipient initiate a withdrawal. This isolates a failed payment to one claimant instead of making a loop or batch distribution depend on every recipient accepting a transfer. It also gives you one narrow function to test for repeated calls, zero balances, malicious recipients, and state changes after a failed transfer.

## 2. Integer Overflow and Underflow

Fixed-width integer types have limits. A `uint8` ranges from 0 to 255. In older Solidity versions, incrementing `uint8(255)` wrapped it to zero and decrementing zero wrapped it to 255. A balance check written around that behavior could fail in ways that were difficult to spot from normal inputs.

Solidity 0.8.0 changed the default arithmetic behavior: overflow and underflow now revert unless the operation is placed in an `unchecked` block. The compiler's [0.8.0 release notes](https://docs.soliditylang.org/en/latest/080-breaking-changes.html) describe both the checked default and the explicit opt-out. That makes many old `SafeMath` patterns unnecessary for current code, but it does not make arithmetic review optional.

First, use a current compiler version and state it precisely in `pragma solidity`. Second, treat every `unchecked` block as a security-sensitive decision. It may be appropriate where a bound proves wrapping cannot happen or where modular arithmetic is intentional. Document the bound and test it at the edge. An `unchecked` block added for a small gas saving can restore the exact behavior a modern compiler would otherwise stop.

Checked arithmetic can still make a contract unusable if a reachable operation reverts forever. Consider accumulated rewards, timestamps, narrowing casts, multiplication before division, and a counter with an arbitrary upper bound. Validate inputs and ranges at the boundary. When converting a wide integer to a smaller one, make the permitted range explicit instead of assuming that a cast preserves the value.

## 3. Incorrect Access Control

Access control answers one question: who is allowed to execute this function? If the answer is wrong for a mint, upgrade, withdrawal, configuration change, or emergency pause, the rest of the contract may not matter.

This function sends the entire balance to `owner`, but anyone can call it. The destination is restricted; the action is not.

```solidity
address payable public owner;

function withdrawAll() external {
    (bool sent,) = owner.call{value: address(this).balance}("");
    require(sent, "Transfer failed");
}
```

The narrow correction is a clear authorization check.

```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
}

function withdrawAll() external onlyOwner {
    (bool sent,) = owner.call{value: address(this).balance}("");
    require(sent, "Transfer failed");
}
```

For a simple contract, one owner may be enough. For systems with separate responsibilities, use separate roles and name them after the capability: `MINTER_ROLE`, `PAUSER_ROLE`, `UPGRADER_ROLE`, and so on. OpenZeppelin's [access-control guide](https://docs.openzeppelin.com/contracts/5.x/access-control) explains that ownership suits a single administrator, while role-based access control can assign permissions such as minting and burning separately.

Review role administration as carefully as the role check. Who grants and revokes a role? Can a role manage itself? Does a default admin have more power than intended? What happens if the owner is the wrong address, a compromised key, or a contract that cannot execute the needed action? A multisignature account or a timelock can change operational risk, but neither compensates for a function that exposes the wrong capability.

Avoid `tx.origin` for authorization. Solidity documents an example in which an attacker uses an intermediary contract to preserve the original transaction sender and trick a `tx.origin` check. Authorize the immediate caller with `msg.sender`, then design the contract explicitly if a trusted forwarder or account-abstraction flow needs different behavior.

## 4. Oracle and Price Assumptions

A contract cannot read a market price, weather result, identity record, or other external fact by itself. It receives a value through an oracle or derives a value from onchain activity. The source, update frequency, scaling, and failure behavior are part of the contract's security model.

A dangerous pattern is treating a spot exchange price as an unquestionable price oracle for a borrow, liquidation, or minting decision. A trade can change a pool's immediate reserve ratio. If a protocol reads that immediate value during the same transaction, an attacker may try to trade, use the changed value in the protocol, and unwind the position. The issue is not that onchain data is always wrong. The issue is assuming that a price valid for one use is safe for collateral valuation without considering how it can be moved.

Choose the feed for the decision being made. Chainlink describes its [Data Feeds](https://docs.chain.link/data-feeds) as onchain data feeds that aggregate multiple data sources, and its documentation tells consuming applications to inspect configuration and monitor the data they depend on. A feed integration still needs local checks. Confirm the deployed feed address for the network, read its decimals, reject a non-positive result where the application requires a positive price, and check that the update time is recent enough for your risk model.

Do not hard-code a generic staleness period from another protocol. The correct period depends on the feed's update conditions, the asset, and what the contract does with the price. Chainlink states that feeds update when a deviation threshold is reached or a heartbeat passes, and advises applications to check the timestamp from `latestRoundData`. If the answer is stale, choose an explicit behavior: pause the sensitive operation, use a defined fallback if the design permits one, or revert. Silent use of an old answer is a decision too.

If you use an onchain time-weighted observation, define the window, liquidity assumptions, and fallback behavior. A longer observation can reduce the influence of a single immediate trade, but it introduces a different delay. Test the economic effect of the chosen window instead of treating any acronym as protection. Oracle security is a system question involving data providers, contracts, liquidators, frontends, monitoring, and the people who can respond to a bad feed.

## 5. Unchecked External Calls

Low-level calls return a success flag rather than automatically reverting the caller. Solidity explicitly notes that `.call()`, `.delegatecall()`, `.staticcall()`, and `.send()` can return `false`. Ignoring that result can let a function continue as though a transfer or downstream operation completed.

```solidity
function sendTo(address payable recipient, uint256 amount) external {
    recipient.call{value: amount}("");
}
```

At minimum, check the return value and decide how failure should affect state.

```solidity
function sendTo(address payable recipient, uint256 amount) external {
    (bool success,) = recipient.call{value: amount}("");
    require(success, "Transfer failed");
}
```

For a typed call to a known interface, prefer the typed interface over hand-built low-level calldata. It lets the compiler check the signature and gives readers a clearer view of the dependency. When a low-level call is necessary, validate the target, decode return data only against the expected schema, and decide whether an error should bubble up or be handled. `delegatecall` deserves special suspicion because it runs another contract's code in the caller's storage context.

Checking `success` is not the whole review. A successful call can still return misleading data, transfer control to a hostile contract, or change an assumption elsewhere. Treat every external boundary as both a failure boundary and a control-transfer boundary.

## A Security Workflow That Holds Up

Security begins before deployment. Write down assets, actors, permissions, dependencies, and invariants. Keep functions short enough that a reviewer can follow the state changes. Use the latest appropriate compiler release, take warnings seriously, and remove dead code that creates an unreviewed path. The Solidity documentation also recommends keeping contracts small and modular and seeking peer review.

Test normal behavior first, then write adversarial tests. Try a second withdrawal, an unauthorized role call, a stale price, a token that returns an unexpected value, a callback during a transfer, a failed external call, and values at numeric boundaries. Foundry runs Solidity tests from `test/` and supports fuzz tests when test functions take parameters; its [testing guide](https://book.getfoundry.sh/forge/writing-tests) shows both ordinary tests and generated inputs. Fuzzing broadens the inputs you see, but it does not tell you which security property matters. Define the property first.

Finally, separate a review from a guarantee. An audit, test suite, or library reduces risk; none removes it. Make changes small, review privileged paths twice, monitor dependencies after release, and give the protocol a limited response path for cases where a dangerous condition is detected. Users should not discover the emergency procedure at the same time as the exploit.
