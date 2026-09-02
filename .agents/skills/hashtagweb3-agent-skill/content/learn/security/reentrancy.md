---
title: Reentrancy Deep Dive
description: >-
  The most famous smart contract vulnerability - how it works, real exploits
  that used it, and the three defenses.
order: 4
readTime: 9 min
difficulty: advanced
prerequisites:
  - auditor-mindset
quiz:
  - question: What is a reentrancy attack?
    options:
      - When a user calls a function twice in a row
      - >-
        When a malicious contract calls back into the victim contract during an
        external call, before the victim has updated its state
      - When a contract runs out of gas
      - When two contracts deploy simultaneously
    correct: 1
    explanation: >-
      Reentrancy exploits the order of operations. If a contract sends ETH
      before updating the sender's balance, the receiving contract's fallback
      function can call withdraw() again. The balance hasn't been updated yet,
      so the check passes again. This loops until the contract is drained.
  - question: How much was stolen in the 2016 DAO hack?
    options:
      - $1 million
      - >-
        $3.6 million (60 million at the time) - roughly one-third of The DAO's
        total funds
      - $100 million
      - $500 million
    correct: 1
    explanation: >-
      The DAO held $150M in ETH. The attacker used a reentrancy exploit to drain
      $60M (~3.6M ETH). This hack was so severe that the Ethereum community
      voted to hard-fork the blockchain to reverse the theft, creating Ethereum
      (the fork) and Ethereum Classic (the original chain).
  - question: What is the Checks-Effects-Interactions pattern?
    options:
      - A deployment checklist
      - >-
        A coding pattern where you: (1) check conditions, (2) update state
        variables, (3) make external calls - in that exact order
      - A testing methodology
      - A Solidity compiler optimization
    correct: 1
    explanation: >-
      By updating state (setting balance to 0) BEFORE making the external call
      (sending ETH), a reentrant call will see the updated balance of 0 and fail
      the check. The order matters: Checks first, then Effects on state, then
      Interactions with other contracts.
  - question: What does a reentrancy guard (mutex) do?
    options:
      - It encrypts the function call
      - >-
        It uses a boolean lock that prevents any function from being entered
        while it is already executing
      - It limits how much gas a function can use
      - It restricts which addresses can call the function
    correct: 1
    explanation: >-
      A reentrancy guard sets a 'locked' flag to true when a function starts
      executing and sets it back to false when it finishes. If a reentrant call
      tries to enter the function while locked is true, it reverts.
      OpenZeppelin's ReentrancyGuard is the standard implementation.
  - question: What is 'cross-function reentrancy'?
    options:
      - Calling a function on a different blockchain
      - >-
        When the attacker reenters a DIFFERENT function in the same contract
        that shares state with the vulnerable function
      - When two contracts call each other simultaneously
      - A type of reentrancy that only affects proxies
    correct: 1
    explanation: >-
      If withdraw() sends ETH before updating the balance, and transfer() reads
      the balance to move tokens, the attacker's fallback can call transfer()
      during the reentrancy window. The balance hasn't been updated by
      withdraw() yet, so transfer() sees the old, inflated balance.
---

## The Most Famous Bug in Crypto History

On June 17, 2016, an attacker exploited a reentrancy vulnerability in The DAO - a decentralized investment fund - and drained 3.6 million ETH ($60M at the time). The hack was so catastrophic that the Ethereum community voted to hard-fork the entire blockchain to reverse it, splitting the network into Ethereum and Ethereum Classic.

Nine years later, reentrancy remains one of the most common smart contract vulnerabilities. Every auditor needs to understand this attack inside out.

<div class="diagram">
<svg viewBox="0 0 800 220" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
 <text x="400" y="22" text-anchor="middle" font-size="13" font-weight="bold" fill="#374151">Reentrancy Attack Flow</text>

 <!-- Attacker -->
 <rect x="30" y="40" width="140" height="160" rx="10" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
 <text x="100" y="65" text-anchor="middle" font-size="12" font-weight="bold" fill="#991b1b">Attacker</text>
 <text x="100" y="85" text-anchor="middle" font-size="10" fill="#ef4444">1. withdraw()</text>
 <text x="100" y="130" text-anchor="middle" font-size="10" fill="#ef4444">4. receive() fires</text>
 <text x="100" y="150" text-anchor="middle" font-size="10" fill="#ef4444">5. withdraw() again!</text>
 <text x="100" y="185" text-anchor="middle" font-size="9" fill="#991b1b">↻ loop until drained</text>

 <!-- Arrows -->
 <line x1="170" y1="82" x2="260" y2="82" stroke="#ef4444" stroke-width="1.5" marker-end="url(#arrR)"/>
 <line x1="260" y1="115" x2="170" y2="115" stroke="#22c55e" stroke-width="1.5" marker-end="url(#arrGn)"/>
 <text x="215" y="106" text-anchor="middle" font-size="9" fill="#22c55e">3. send ETH</text>
 <line x1="170" y1="148" x2="260" y2="148" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4" marker-end="url(#arrR)"/>

 <!-- Vault -->
 <rect x="270" y="40" width="200" height="160" rx="10" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
 <text x="370" y="65" text-anchor="middle" font-size="12" font-weight="bold" fill="#166534">Vulnerable Vault</text>
 <text x="370" y="88" text-anchor="middle" font-size="10" fill="#166534">2. check balance ✓</text>
 <rect x="290" y="100" width="160" height="30" rx="5" fill="#dcfce7"/>
 <text x="370" y="120" text-anchor="middle" font-size="10" fill="#166534">send ETH to caller</text>
 <rect x="290" y="140" width="160" height="30" rx="5" fill="#fee2e2"/>
 <text x="370" y="157" text-anchor="middle" font-size="10" fill="#991b1b">balance = 0</text>
 <text x="370" y="188" text-anchor="middle" font-size="9" fill="#dc2626">↑ runs TOO LATE</text>

 <!-- Fix -->
 <rect x="520" y="40" width="260" height="160" rx="10" fill="#f0f9ff" stroke="#3b82f6" stroke-width="1.5"/>
 <text x="650" y="65" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e40af">Fix: CEI Pattern</text>
 <rect x="540" y="80" width="220" height="25" rx="5" fill="#dbeafe"/>
 <text x="650" y="97" text-anchor="middle" font-size="10" fill="#1e40af">1. Check: require(bal > 0)</text>
 <rect x="540" y="112" width="220" height="25" rx="5" fill="#dcfce7"/>
 <text x="650" y="129" text-anchor="middle" font-size="10" fill="#166534">2. Effect: balance = 0 ← FIRST</text>
 <rect x="540" y="144" width="220" height="25" rx="5" fill="#fefce8"/>
 <text x="650" y="161" text-anchor="middle" font-size="10" fill="#854d0e">3. Interact: send ETH</text>
 <text x="650" y="188" text-anchor="middle" font-size="9" fill="#3b82f6">Reentry sees balance = 0, reverts ✓</text>

 <defs>
 <marker id="arrR" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#ef4444"/></marker>
 <marker id="arrGn" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#22c55e"/></marker>
 </defs>
</svg>
</div>

## How Reentrancy Works

The vulnerability exploits the order in which a contract performs operations.

### Vulnerable Code

```solidity
contract VulnerableVault {
 mapping(address => uint256) public balances;

 function deposit() external payable {
 balances[msg.sender] += msg.value;
 }

 function withdraw() external {
 uint256 amount = balances[msg.sender];
 require(amount > 0, "No balance");

 // BUG: Sends ETH BEFORE updating the balance
 (bool success, ) = msg.sender.call{value: amount}("");
 require(success, "Transfer failed");

 // This line runs too late — the attacker already re-entered
 balances[msg.sender] = 0;
 }
}
```

### The Attack

```solidity
contract Attacker {
 VulnerableVault vault;

 constructor(address _vault) {
 vault = VulnerableVault(_vault);
 }

 function attack() external payable {
 vault.deposit{value: 1 ether}();
 vault.withdraw();
 }

 // This function fires automatically when the vault sends ETH
 receive() external payable {
 if (address(vault).balance >= 1 ether) {
 vault.withdraw(); // Re-enter before balance is set to 0
 }
 }
}
```

### The Execution Flow

```
1. Attacker calls withdraw()
2. Vault checks balance: 1 ETH ✓
3. Vault sends 1 ETH to Attacker
4. → Attacker's receive() fires
5. → Attacker calls withdraw() AGAIN
6. → Vault checks balance: still 1 ETH (not updated yet!) ✓
7. → Vault sends 1 ETH to Attacker
8. → Attacker's receive() fires again
9. → ... repeats until vault is empty
10. balances[attacker] = 0 ← finally runs, but vault is already drained
```

## The Three Defenses

### Defense 1: Checks-Effects-Interactions Pattern

Reorder the code so state is updated before any external call.

```solidity
function withdraw() external {
 uint256 amount = balances[msg.sender];
 require(amount > 0, "No balance"); // CHECK

 balances[msg.sender] = 0; // EFFECT (update state first)

 (bool success, ) = msg.sender.call{value: amount}(""); // INTERACTION
 require(success, "Transfer failed");
}
```

Now when the attacker re-enters, `balances[msg.sender]` is already 0, so the `require` fails.

### Defense 2: Reentrancy Guard (Mutex)

Use a lock that prevents re-entry.

```solidity
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SecureVault is ReentrancyGuard {
 mapping(address => uint256) public balances;

 function withdraw() external nonReentrant {
 uint256 amount = balances[msg.sender];
 require(amount > 0, "No balance");

 (bool success, ) = msg.sender.call{value: amount}("");
 require(success, "Transfer failed");

 balances[msg.sender] = 0;
 }
}
```

The `nonReentrant` modifier sets a boolean lock. Any reentrant call sees the lock is active and reverts. This works even if the Checks-Effects-Interactions order is wrong.

### Defense 3: Pull Over Push

Instead of sending ETH to users, let them withdraw it themselves.

```solidity
// Instead of: send ETH directly during the function
// Do: credit an internal balance, let users call a separate withdraw

function claimRewards() external {
 uint256 reward = calculateReward(msg.sender);
 pendingWithdrawals[msg.sender] += reward;
}

function withdraw() external nonReentrant {
 uint256 amount = pendingWithdrawals[msg.sender];
 pendingWithdrawals[msg.sender] = 0;
 (bool success, ) = msg.sender.call{value: amount}("");
 require(success);
}
```

## Cross-Function Reentrancy

The attacker does not have to re-enter the same function. If `withdraw()` sends ETH before updating the balance, the attacker's fallback can call `transfer()` - a completely different function - that reads the still-inflated balance.

```solidity
// During reentrancy window, balance is still 10 ETH
function transfer(address to, uint256 amount) external {
 require(balances[msg.sender] >= amount); // passes with stale balance
 balances[msg.sender] -= amount;
 balances[to] += amount;
}
```

This is why reentrancy guards should protect ALL functions that share mutable state, not just the one making external calls.

## Key takeaways

- Reentrancy occurs when a contract makes an external call before updating its own state, allowing the recipient to call back in and exploit the stale state.
- The DAO hack ($60M, 2016) used this exact pattern and caused Ethereum to hard-fork.
- Defense in depth: use Checks-Effects-Interactions ordering AND a reentrancy guard AND the pull pattern when possible.
- Cross-function reentrancy targets different functions that share state - guards must cover all of them.
