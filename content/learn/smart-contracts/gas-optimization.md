---
title: Gas Optimization Patterns
description: >-
  Practical techniques to reduce smart contract gas costs, with before/after
  comparisons and benchmarks.
order: 7
readTime: 8 min
difficulty: advanced
prerequisites:
  - solidity
  - first-contract
quiz:
  - question: Why is gas optimization important for smart contracts?
    options:
      - It makes the contract compile faster
      - >-
        Users pay gas for every transaction - cheaper contracts get more usage
        and adoption
      - Ethereum requires contracts to use minimal gas
      - Gas optimization improves contract security
    correct: 1
    explanation: >-
      Every operation in a smart contract costs gas, which users pay in ETH. A
      swap on an unoptimized DEX might cost $15 while an optimized one costs $5.
      Over millions of transactions, this difference determines which protocol
      users choose.
  - question: 'Which is cheaper: reading from ''storage'' or reading from ''memory''?'
    options:
      - Storage is cheaper
      - They cost the same
      - >-
        Memory is cheaper - storage reads cost ~2,100 gas while memory reads
        cost ~3 gas
      - It depends on the data type
    correct: 2
    explanation: >-
      Storage lives on the blockchain permanently and costs ~2,100 gas per read
      (SLOAD). Memory exists only during the function call and costs ~3 gas per
      read. Caching a storage variable in a local memory variable before using
      it multiple times in a loop can save thousands of gas.
  - question: Why are 'uint8' variables sometimes MORE expensive than 'uint256'?
    options:
      - uint8 uses more storage space
      - >-
        The EVM operates on 256-bit words natively - smaller types require extra
        operations to mask and extract
      - uint8 is deprecated
      - Solidity doesn't support uint8
    correct: 1
    explanation: >-
      The EVM's native word size is 256 bits. When you use uint8, the EVM must
      add extra instructions to mask the value to 8 bits. As a standalone
      variable, uint256 is cheaper. However, uint8 saves gas when you pack
      multiple small values into a single 32-byte storage slot.
  - question: What is 'struct packing' and why does it reduce gas?
    options:
      - Compressing structs into a smaller file
      - >-
        Ordering struct fields so that smaller types are adjacent, allowing
        Solidity to fit multiple fields into a single 32-byte storage slot
      - Removing unused fields from a struct
      - Converting structs to arrays
    correct: 1
    explanation: >-
      Each storage slot is 32 bytes. A uint128 + uint128 fit in one slot (16 +
      16 = 32 bytes). But if you put a uint128, then a uint256, then another
      uint128, you use 3 slots. Ordering fields by size lets Solidity pack them
      efficiently, reducing SSTORE operations.
  - question: >-
      Why should you use 'custom errors' instead of 'require(condition, string)'
      in production?
    options:
      - Custom errors are easier to read
      - >-
        Error strings are stored as bytecode - each character costs deployment
        gas. Custom errors encode to 4 bytes regardless of complexity.
      - Custom errors are required since Solidity 0.8
      - require() is deprecated
    correct: 1
    explanation: >-
      require(false, 'Insufficient balance for transfer') stores that entire
      string in the contract bytecode. A custom error like 'error
      InsufficientBalance(uint256 available, uint256 required)' compiles to just
      a 4-byte selector, saving significant deployment and runtime gas.
lastUpdated: 2026-09-04
---

## Why Gas Costs Matter

Every smart contract operation costs gas. Users pay for gas in ETH. The difference between a well-optimized and poorly-optimized contract can be $5 vs. $50 per transaction. Across millions of users, this determines whether a protocol succeeds or gets abandoned.

<div class="diagram">
<svg viewBox="0 0 800 180" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
 <text x="400" y="25" text-anchor="middle" font-size="13" font-weight="bold" fill="#374151">EVM Operation Gas Costs</text>

 <!-- Storage Write -->
 <rect x="50" y="45" width="320" height="28" rx="4" fill="#fef2f2" stroke="#ef4444" stroke-width="1"/>
 <text x="60" y="64" font-size="11" font-weight="600" fill="#991b1b">SSTORE (storage write)</text>
 <text x="360" y="64" text-anchor="end" font-size="11" fill="#991b1b">20,000 gas</text>

 <!-- Storage Read -->
 <rect x="50" y="80" width="160" height="28" rx="4" fill="#fefce8" stroke="#eab308" stroke-width="1"/>
 <text x="60" y="99" font-size="11" font-weight="600" fill="#854d0e">SLOAD (storage read)</text>
 <text x="202" y="99" text-anchor="end" font-size="11" fill="#854d0e">2,100 gas</text>

 <!-- Memory Read -->
 <rect x="50" y="115" width="12" height="28" rx="4" fill="#dcfce7" stroke="#22c55e" stroke-width="1"/>
 <text x="70" y="134" font-size="11" font-weight="600" fill="#166534">MLOAD (memory read)</text>
 <text x="225" y="134" font-size="11" fill="#166534">3 gas</text>

 <!-- Legend -->
 <text x="450" y="65" font-size="11" fill="#64748b">← Cache storage reads</text>
 <text x="450" y="82" font-size="11" fill="#64748b"> in memory to save</text>
 <text x="450" y="99" font-size="11" font-weight="bold" fill="#166534"> 700x per access</text>

 <!-- Bar scale -->
 <text x="50" y="165" font-size="9" fill="#94a3b8">Bar width proportional to gas cost</text>
</svg>
</div>

## 1. Cache Storage Reads

The single most impactful optimization. Storage reads (SLOAD) cost 2,100 gas. Memory reads cost 3 gas.

```solidity
// BAD: 3 storage reads = 6,300 gas
function bad_getTotal() public view returns (uint256) {
 return balances[msg.sender] + balances[msg.sender] + balances[msg.sender];
}

// GOOD: 1 storage read + 2 memory reads = 2,106 gas
function good_getTotal() public view returns (uint256) {
 uint256 bal = balances[msg.sender]; // cache in memory
 return bal + bal + bal;
}
```

This matters most inside loops. If you read `array.length` from storage on every iteration, you pay 2,100 gas per loop.

## 2. Pack Storage Variables

Each storage slot is 32 bytes. Solidity packs adjacent variables into the same slot if they fit.

```solidity
// BAD: Uses 3 storage slots (3 × 20,000 gas to write)
struct BadUser {
 uint256 id; // slot 0 (32 bytes)
 uint8 level; // slot 1 (1 byte, but takes a full slot)
 uint256 balance; // slot 2 (32 bytes)
}

// GOOD: Uses 2 storage slots (2 × 20,000 gas to write)
struct GoodUser {
 uint256 id; // slot 0 (32 bytes)
 uint256 balance; // slot 1 (32 bytes)
 uint8 level; // slot 1 (packed with balance? No - but...)
}

// BEST: Uses 2 storage slots
struct BestUser {
 uint8 level; // slot 0 (1 byte)
 address wallet; // slot 0 (20 bytes) ← packed together = 21 bytes
 uint256 balance; // slot 1 (32 bytes)
}
```

Rule: put smaller types next to each other. `uint8 + address` (1 + 20 = 21 bytes) fit in one slot.

## 3. Use Custom Errors

Introduced in Solidity 0.8.4. Error strings are stored as bytecode - every character costs gas at deployment and at runtime.

```solidity
// BAD: String stored in bytecode
require(balance >= amount, "ERC20: transfer amount exceeds balance");

// GOOD: Compiles to 4-byte selector
error InsufficientBalance(uint256 available, uint256 required);

function transfer(address to, uint256 amount) public {
 if (balances[msg.sender] < amount) {
 revert InsufficientBalance(balances[msg.sender], amount);
 }
 // ...
}
```

Saves ~200 gas per revert on average, plus deployment gas proportional to string length.

## 4. Use `unchecked` for Safe Arithmetic

Solidity 0.8+ automatically checks for overflow/underflow on every arithmetic operation. Each check costs ~100 gas. When you know overflow is impossible, wrap the operation in `unchecked`.

```solidity
// Common pattern: loop counter can never overflow
for (uint256 i = 0; i < length;) {
 // ... do work ...
 unchecked { ++i; } // saves ~100 gas per iteration
}
```

Only use `unchecked` when you have a mathematical proof that overflow cannot occur. For a loop counter bounded by an array length, this is always safe.

## 5. Use `calldata` Instead of `memory` for Read-Only Arrays

When a function receives an array it doesn't modify, use `calldata` instead of `memory`. This avoids copying the array into memory.

```solidity
// BAD: Copies the entire array into memory
function sum(uint256[] memory values) public pure returns (uint256) { ... }

// GOOD: Reads directly from the transaction data
function sum(uint256[] calldata values) public pure returns (uint256) { ... }
```

For a 100-element array, this saves ~10,000 gas.

## Quick Reference

| Technique | Gas Saved | Difficulty |
|---|---|---|
| Cache storage in memory | 2,000+ per extra read | Easy |
| Pack struct variables | 20,000 per saved slot | Easy |
| Custom errors over strings | 200+ per revert | Easy |
| `unchecked` arithmetic | 100 per operation | Medium |
| `calldata` over `memory` | 100+ per array element | Easy |
| Short-circuit `&&` / `\|\|` | Variable | Easy |

## Key takeaways

- Storage operations are by far the most expensive EVM operations. Cache storage reads in memory variables.
- Order struct fields by size to pack them into fewer 32-byte storage slots.
- Custom errors save both deployment and runtime gas compared to string error messages.
- Use `unchecked` arithmetic only when you can prove overflow is impossible.
- Measure before and after. Use `forge test --gas-report` or Hardhat's gas reporter to quantify savings.
