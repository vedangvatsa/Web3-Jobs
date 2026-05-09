---
title: "Smart Contract Security 101"
description: "Reentrancy, access control, and how to write secure Solidity code."
order: 4
readTime: "9 min"
difficulty: "advanced"
prerequisites: ["erc20"]
quiz:
 - question: "What is a reentrancy attack?"
 options:
 - "When a hacker guesses your private key"
 - "When a malicious contract calls a withdrawal function, receives funds, and calls the withdrawal function again before its balance is updated"
 - "When a network processes the same block twice"
 - "When an admin loses their keys"
 correct: 1
 explanation: "Reentrancy occurs when a contract sends ETH to an external address before updating its internal state. A malicious receiving contract can instantly call back ('re-enter') the withdrawal function, draining the contract before the first balance update finishes."
 - question: "What is the standard pattern used to prevent reentrancy attacks?"
 options:
 - "Checks-Effects-Interactions (CEI)"
 - "Object-Oriented Design"
 - "Proof of Work"
 - "Encrypting the source code"
 correct: 0
 explanation: "The Checks-Effects-Interactions pattern dictates that a function should first Check conditions, then update state Effects (like setting balance to zero), and ONLY THEN Interact with external contracts (like sending ETH). This prevents the re-entry from finding a positive balance."
 - question: "What is a reentrancy guard (ReentrancyGuard)?"
 options:
 - "A firewall hardware device"
 - "A modifier (like nonReentrant) that uses a boolean flag to lock a function while it is executing"
 - "An antivirus for Ethereum"
 - "A consensus rule"
 correct: 1
 explanation: "OpenZeppelin's ReentrancyGuard provides a `nonReentrant` modifier. It sets a flag to true when the function starts and false when it ends. If the function is called again while the flag is true, it reverts."
 - question: "What is a common access control vulnerability?"
 options:
 - "Making a sensitive function 'public' without requiring the caller to be an admin/owner"
 - "Using the wrong compiler version"
 - "Storing data on IPFS"
 - "Paying too much gas"
 correct: 0
 explanation: "If you have a function like `withdrawProtocolFees()` and leave it `public` without a `require(msg.sender == owner)`, anyone can call it and steal the fees. Access control is vital."
 - question: "Why should you use audited libraries like OpenZeppelin instead of writing your own token logic?"
 options:
 - "It makes the code run faster"
 - "OpenZeppelin pays you to use their code"
 - "Their code is battle-tested, heavily audited, and secures billions of dollars, reducing your risk of writing a bug"
 - "It is required by law"
 correct: 2
 explanation: "Writing custom implementation of standards like ERC-20 or Ownable introduces unnecessary risk. Using community-audited, battle-tested libraries like OpenZeppelin is the industry standard for safety."
---

## The stakes are high

When you deploy a smart contract, the code is public and immutable. If there is a bug, anyone in the world can analyze the code, find the flaw, and exploit it. Because contracts hold real financial value, the incentives for hackers are massive.

Security must be the primary focus of every Solidity developer. 

<div class="diagram">
<svg viewBox="0 0 800 130" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
 <text x="400" y="20" text-anchor="middle" font-size="13" font-weight="bold" fill="#374151">Top Smart Contract Vulnerabilities</text>

 <rect x="20" y="35" width="175" height="80" rx="8" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
 <text x="107" y="58" text-anchor="middle" font-size="11" font-weight="bold" fill="#991b1b">Reentrancy</text>
 <text x="107" y="75" text-anchor="middle" font-size="9" fill="#ef4444">External call before</text>
 <text x="107" y="88" text-anchor="middle" font-size="9" fill="#ef4444">state update</text>
 <text x="107" y="105" text-anchor="middle" font-size="9" fill="#64748b">Fix: CEI pattern</text>

 <rect x="215" y="35" width="175" height="80" rx="8" fill="#fefce8" stroke="#eab308" stroke-width="1.5"/>
 <text x="302" y="58" text-anchor="middle" font-size="11" font-weight="bold" fill="#854d0e">Access Control</text>
 <text x="302" y="75" text-anchor="middle" font-size="9" fill="#eab308">Missing onlyOwner</text>
 <text x="302" y="88" text-anchor="middle" font-size="9" fill="#eab308">on admin functions</text>
 <text x="302" y="105" text-anchor="middle" font-size="9" fill="#64748b">Fix: OpenZeppelin</text>

 <rect x="410" y="35" width="175" height="80" rx="8" fill="#f0f9ff" stroke="#3b82f6" stroke-width="1.5"/>
 <text x="497" y="58" text-anchor="middle" font-size="11" font-weight="bold" fill="#1e40af">Integer Overflow</text>
 <text x="497" y="75" text-anchor="middle" font-size="9" fill="#3b82f6">Math wraps around</text>
 <text x="497" y="88" text-anchor="middle" font-size="9" fill="#3b82f6">to max/min values</text>
 <text x="497" y="105" text-anchor="middle" font-size="9" fill="#64748b">Fix: Solidity 0.8+</text>

 <rect x="605" y="35" width="175" height="80" rx="8" fill="#faf5ff" stroke="#a855f7" stroke-width="1.5"/>
 <text x="692" y="58" text-anchor="middle" font-size="11" font-weight="bold" fill="#7c3aed">Front-Running</text>
 <text x="692" y="75" text-anchor="middle" font-size="9" fill="#a855f7">Bots see pending TX</text>
 <text x="692" y="88" text-anchor="middle" font-size="9" fill="#a855f7">and trade ahead</text>
 <text x="692" y="105" text-anchor="middle" font-size="9" fill="#64748b">Fix: Slippage checks</text>
</svg>
</div>

## 1. The Reentrancy Attack

This is the most famous vulnerability in Ethereum history (it caused the 2016 DAO hack that split the Ethereum network).

### The Flawed Code

Imagine a contract where users can deposit and withdraw ETH.

```solidity
contract VulnerableBank {
 mapping(address => uint256) public balances;

 // 1. User requests withdrawal
 function withdraw() public {
 uint256 amount = balances[msg.sender];
 require(amount > 0, "No balance");

 // 2. Contract sends the ETH to the user
 (bool success, ) = msg.sender.call{value: amount}("");
 require(success, "Transfer failed");

 // 3. Contract updates the user's balance to 0
 balances[msg.sender] = 0;
 }
}
```

This looks logical, but it is fatally flawed. 

When a smart contract sends ETH to another smart contract, the receiving contract's `receive()` function is automatically triggered. A malicious contract can receive the ETH, and in its `receive()` function, **immediately call `withdraw()` again**. 

Because `VulnerableBank` hasn't reached step 3 yet, the hacker's balance is still greater than 0. The contract sends the ETH again. This loops until the bank is empty.

### The Fix: Checks-Effects-Interactions

Always update your state *before* interacting with the outside world.

```solidity
contract SafeBank {
 mapping(address => uint256) public balances;

 function withdraw() public {
 // CHECKS
 uint256 amount = balances[msg.sender];
 require(amount > 0, "No balance");

 // EFFECTS (Update state FIRST)
 balances[msg.sender] = 0;

 // INTERACTIONS (Send ETH LAST)
 (bool success, ) = msg.sender.call{value: amount}("");
 require(success, "Transfer failed");
 }
}
```
Now, if the hacker tries to re-enter, the `amount` will be 0 on the second loop, and the attack fails. Developers also commonly use OpenZeppelin's `nonReentrant` modifier to lock functions during execution.

## 2. Access Control Flaws

Access control defines *who* is allowed to call certain functions. A classic mistake is leaving a sensitive administrative function as `public` without checking the caller.

```solidity
// VULNERABLE
function changeOwner(address newOwner) public {
 owner = newOwner; // Anyone can call this and take over the contract!
}

// SAFE
function changeOwner(address newOwner) public {
 require(msg.sender == owner, "Not authorized");
 owner = newOwner;
}
```

**Best Practice:** Do not write custom ownership logic. Use OpenZeppelin's `Ownable` contract, which provides a heavily audited `onlyOwner` modifier.

## 3. Integer Overflow and Underflow

Before Solidity 0.8.0, if you subtracted 1 from a `uint256` that was equal to 0, it would "underflow" and wrap around to the maximum possible number. Hackers used this to give themselves near-infinite balances.

**The Fix:** If you are using Solidity 0.8.0 or higher, the compiler automatically checks for math overflows and underflows and will revert the transaction if they happen. If you are reading older code, you will see the `SafeMath` library being used to prevent this.

## 4. Front-Running

Because all transactions sit in a public "mempool" before being processed, miners and bots can see what you are trying to do. If you submit a transaction to buy a token on Uniswap, a bot can see your transaction, pay a slightly higher gas fee to buy the token before you, let your purchase drive the price up, and then immediately sell the token to you for a profit. This is called MEV (Maximal Extractable Value).

**The Fix:** Smart contracts handling trades must include "slippage tolerance" checks—requiring the transaction to fail if the execution price is worse than the user expected.

## Key takeaways

- Use the **Checks-Effects-Interactions** pattern to prevent reentrancy.
- Never trust external calls. Always assume any external contract is malicious.
- Use heavily audited libraries (like OpenZeppelin) instead of writing your own security logic.
- Ensure strict access control on all administrative functions.

## Congratulations

You have completed the Smart Contract Development track. You now understand Solidity syntax, basic state management, token standards, and core security vulnerabilities.

**Start Building:** The best way to learn is to write code. Head to [Remix IDE](https://remix.ethereum.org) and deploy your first contract to a testnet!
