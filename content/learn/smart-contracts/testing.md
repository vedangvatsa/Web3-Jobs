---
title: "Testing Smart Contracts"
description: "How to write unit tests and fuzz tests for Solidity using Hardhat and Foundry."
order: 5
readTime: "9 min"
difficulty: "intermediate"
prerequisites: ["first-contract"]
quiz:
  - question: "Why is testing critical for smart contracts specifically?"
    options:
      - "Because Solidity is a slow language"
      - "Because deployed contracts are immutable — you cannot patch a bug after deployment, and bugs typically mean lost funds"
      - "Because Ethereum requires all contracts to have tests"
      - "Because testing makes contracts run faster"
    correct: 1
    explanation: "Unlike a web app where you can push a hotfix, a deployed smart contract's code is permanent. If a bug allows an attacker to drain funds, there is no undo button. The Parity wallet bug in 2017 permanently froze $150M in ETH because of an accidental self-destruct call."
  - question: "What does a Hardhat unit test verify?"
    options:
      - "That the contract compiles without warnings"
      - "That specific function calls produce expected outputs and state changes"
      - "That the contract uses the latest Solidity version"
      - "That gas fees are below a threshold"
    correct: 1
    explanation: "Unit tests call individual contract functions with specific inputs and assert that the return values and storage changes match expectations. For example: deposit 100 tokens, then assert that the balance mapping shows 100 for that address."
  - question: "What is fuzz testing?"
    options:
      - "Running the same test repeatedly to check for race conditions"
      - "Automatically generating thousands of random inputs to find edge cases a human tester would miss"
      - "Testing the contract on multiple blockchains"
      - "Manually trying to break the contract"
    correct: 1
    explanation: "Fuzz testing (supported natively in Foundry) generates random inputs — extreme values, zero, max uint256, unusual addresses — and runs your test function with each one. This catches edge cases like integer overflow, division by zero, or unexpected behavior with boundary values."
  - question: "What is the purpose of 'vm.prank()' in Foundry tests?"
    options:
      - "To deploy the contract to mainnet"
      - "To simulate a function call as if it came from a specific address, useful for testing access control"
      - "To add a delay between transactions"
      - "To generate random test data"
    correct: 1
    explanation: "vm.prank(address) makes the next call appear to come from that address. This lets you test scenarios like: 'What happens if a non-admin tries to withdraw funds?' or 'Can user B access user A's balance?' without needing multiple real wallets."
  - question: "What should you test FIRST when auditing a contract's security?"
    options:
      - "Gas optimization"
      - "Access control — who can call admin functions, and what happens when unauthorized users try"
      - "The contract's name and symbol"
      - "Frontend integration"
    correct: 1
    explanation: "The most common exploit category is broken access control: an admin-only function that anyone can call, or a withdrawal function that doesn't check the caller's balance. Always test that restricted functions revert when called by unauthorized addresses."
---

## Why Smart Contract Testing Is Different

In traditional software, bugs are annoying. In smart contracts, bugs are catastrophic. A deployed contract is immutable — once it's on Ethereum, the code cannot be changed. If someone finds a vulnerability, they can drain the contract's entire balance before anyone can react.

There is no rollback. There is no hotfix. There is no "we'll patch it in the next release."

This is why smart contract testing is not optional. It is the primary line of defense.

<div class="diagram">
<svg viewBox="0 0 800 160" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
 <!-- Unit Tests -->
 <rect x="20" y="30" width="160" height="100" rx="10" fill="#dcfce7" stroke="#22c55e" stroke-width="1.5"/>
 <text x="100" y="60" text-anchor="middle" font-size="20">🧪</text>
 <text x="100" y="82" text-anchor="middle" font-size="12" font-weight="bold" fill="#166534">Unit Tests</text>
 <text x="100" y="98" text-anchor="middle" font-size="10" fill="#22c55e">Single functions</text>
 <text x="100" y="112" text-anchor="middle" font-size="10" fill="#64748b">Hardhat / Foundry</text>

 <!-- Arrow -->
 <line x1="185" y1="80" x2="220" y2="80" stroke="#94a3b8" stroke-width="1.5"/>
 <polygon points="220,76 228,80 220,84" fill="#94a3b8"/>

 <!-- Fuzz Tests -->
 <rect x="235" y="30" width="160" height="100" rx="10" fill="#fefce8" stroke="#eab308" stroke-width="1.5"/>
 <text x="315" y="60" text-anchor="middle" font-size="20">🎲</text>
 <text x="315" y="82" text-anchor="middle" font-size="12" font-weight="bold" fill="#854d0e">Fuzz Tests</text>
 <text x="315" y="98" text-anchor="middle" font-size="10" fill="#eab308">Random inputs</text>
 <text x="315" y="112" text-anchor="middle" font-size="10" fill="#64748b">Foundry native</text>

 <!-- Arrow -->
 <line x1="400" y1="80" x2="435" y2="80" stroke="#94a3b8" stroke-width="1.5"/>
 <polygon points="435,76 443,80 435,84" fill="#94a3b8"/>

 <!-- Integration Tests -->
 <rect x="450" y="30" width="160" height="100" rx="10" fill="#f0f9ff" stroke="#3b82f6" stroke-width="1.5"/>
 <text x="530" y="60" text-anchor="middle" font-size="20">🔗</text>
 <text x="530" y="82" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e40af">Integration</text>
 <text x="530" y="98" text-anchor="middle" font-size="10" fill="#3b82f6">Multi-contract</text>
 <text x="530" y="112" text-anchor="middle" font-size="10" fill="#64748b">Fork mainnet</text>

 <!-- Arrow -->
 <line x1="615" y1="80" x2="650" y2="80" stroke="#94a3b8" stroke-width="1.5"/>
 <polygon points="650,76 658,80 650,84" fill="#94a3b8"/>

 <!-- Audit -->
 <rect x="665" y="30" width="120" height="100" rx="10" fill="#faf5ff" stroke="#a855f7" stroke-width="1.5"/>
 <text x="725" y="60" text-anchor="middle" font-size="20">🛡️</text>
 <text x="725" y="82" text-anchor="middle" font-size="12" font-weight="bold" fill="#7c3aed">Audit</text>
 <text x="725" y="98" text-anchor="middle" font-size="10" fill="#a855f7">External review</text>
 <text x="725" y="112" text-anchor="middle" font-size="10" fill="#64748b">Before mainnet</text>
</svg>
</div>

## Testing with Hardhat (JavaScript)

Hardhat is the most popular development framework for Ethereum. Tests are written in JavaScript or TypeScript using Mocha and Chai.

### A Simple Token Test

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleToken", function () {
 let token, owner, alice;

 beforeEach(async function () {
 [owner, alice] = await ethers.getSigners();
 const Token = await ethers.getContractFactory("SimpleToken");
 token = await Token.deploy(1000); // mint 1000 tokens to deployer
 });

 it("should assign total supply to the owner", async function () {
 const balance = await token.balanceOf(owner.address);
 expect(balance).to.equal(1000);
 });

 it("should transfer tokens between accounts", async function () {
 await token.transfer(alice.address, 100);
 expect(await token.balanceOf(alice.address)).to.equal(100);
 expect(await token.balanceOf(owner.address)).to.equal(900);
 });

 it("should revert when sender has insufficient balance", async function () {
 await expect(
 token.connect(alice).transfer(owner.address, 1)
 ).to.be.revertedWith("Insufficient balance");
 });
});
```

**What this tests:**
1. Initial state is correct (deployer gets all tokens).
2. The core function works (transfer moves tokens).
3. Error handling works (transferring more than you have reverts).

Run with: `npx hardhat test`

## Testing with Foundry (Solidity)

Foundry lets you write tests in Solidity itself. This is faster (no JavaScript overhead) and gives you access to powerful features like fuzz testing and cheatcodes.

### The Same Test in Foundry

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/SimpleToken.sol";

contract SimpleTokenTest is Test {
 SimpleToken token;
 address alice = makeAddr("alice");

 function setUp() public {
 token = new SimpleToken(1000);
 }

 function test_OwnerGetsInitialSupply() public view {
 assertEq(token.balanceOf(address(this)), 1000);
 }

 function test_Transfer() public {
 token.transfer(alice, 100);
 assertEq(token.balanceOf(alice), 100);
 assertEq(token.balanceOf(address(this)), 900);
 }

 function test_RevertOnInsufficientBalance() public {
 vm.prank(alice); // next call comes from alice
 vm.expectRevert("Insufficient balance");
 token.transfer(address(this), 1);
 }
}
```

Run with: `forge test`

## Fuzz Testing

Fuzz testing is where Foundry excels. Instead of testing with hardcoded values, you let the framework generate random inputs.

```solidity
function testFuzz_TransferNeverExceedsSupply(uint256 amount) public {
 // Bound the amount to something reasonable
 amount = bound(amount, 0, token.totalSupply());

 token.transfer(alice, amount);

 // Invariant: total supply should never change
 assertEq(
 token.balanceOf(address(this)) + token.balanceOf(alice),
 token.totalSupply()
 );
}
```

Foundry will run this function with hundreds of random `amount` values — including 0, 1, max uint256, and everything in between. If any input breaks the invariant, Foundry reports the exact failing case.

## What to Test: A Checklist

| Category | What to verify | Example |
|---|---|---|
| **Access control** | Only authorized addresses can call admin functions | `onlyOwner` modifier works; random users get reverted |
| **State changes** | Functions modify storage correctly | After deposit, balance increases by exact amount |
| **Edge cases** | Zero amounts, max values, empty arrays | Transferring 0 tokens doesn't break anything |
| **Reverts** | Invalid operations fail cleanly | Withdrawing more than your balance reverts |
| **Reentrancy** | External calls don't allow re-entry | Callback during withdrawal can't drain the contract |
| **Events** | Correct events are emitted | Transfer event fires with correct `from`, `to`, `amount` |

## Key takeaways

- Smart contract bugs are permanent and expensive. Testing is the first and most important layer of security.
- Hardhat uses JavaScript tests (familiar, good ecosystem). Foundry uses Solidity tests (faster, native fuzz testing).
- Fuzz testing automatically generates random inputs to catch edge cases you would never think of manually.
- Always test access control first — who can call what, and what happens when unauthorized users try.
