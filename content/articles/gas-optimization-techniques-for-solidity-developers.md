---
title: Gas Optimization Techniques for Solidity Developers
image: >-
 https://images.unsplash.com/photo-1622186477895-f2af6a0f5a97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxmZWV8ZW58MHx8fHwxNzU1MDM2ODM3fDA&ixlib=rb-4.1.0&q=80&w=1080
data-ai-hint: gas optimization techniques
description: >-
 A practical guide for Ethereum developers on how to write more gas-efficient
 smart contracts. Learn techniques to reduce the execution cost of your.
category: Technology Deep Dives
publishedDate: '2026-03-11'
lastUpdated: "2026-08-27"
---

On the [Ethereum](/what-is-ethereum) [blockchain](/what-is-a-blockchain), every computational step incurs a financial cost, known as "gas." This cost serves as a vital constraint for [smart contract](/what-are-smart-contracts) developers. Skilled [Solidity](/best-programming-languages-for-blockchain-development) developers must write not only secure and functional code but also gas-efficient code. High gas costs can render decentralized applications (dApps) impractical, while optimized contracts can lead to significant savings for users and provide a competitive edge.

This article outlines practical gas optimization techniques that every Ethereum developer should master.

### 1. Minimize State Changes

State modifications in the Ethereum Virtual Machine (EVM) represent the most expensive operations. Reading data incurs a low cost, while writing or changing data can be costly.

- **SSTORE:** The `SSTORE` opcode, which writes to storage, is the most expensive operation. A single `SSTORE` can cost a significant amount of gas.
- **Technique:** Structure your code to minimize storage writes. Load a state variable into a local memory variable, perform calculations, and write back the result to storage only once.

**Example:**

```solidity
// Inefficient: 3 SSTORE operations
function calculateBad() public {
 myStateVar += 1; // SSTORE 1
 myStateVar *= 2; // SSTORE 2
 myStateVar -= 5; // SSTORE 3
}

// Efficient: 1 SSTORE operation
function calculateGood() public {
 uint256 local_myStateVar = myStateVar; // SLOAD (cheap)
 local_myStateVar += 1;
 local_myStateVar *= 2;
 local_myStateVar -= 5;
 myStateVar = local_myStateVar; // SSTORE (once)
}
```

### 2. Use the Right Data Types

The choice of data types in Solidity can significantly influence gas costs due to how the EVM packs data into 256-bit (32-byte) storage slots.

- **The Rule:** When using multiple `uint` variables in a `struct` or as contiguous state variables, prefer smaller types like `uint128` or `uint64` if the values are within their limits. The EVM can pack these smaller variables into a single 32-byte storage slot, which reduces gas usage.

**Example:**

```solidity
// Inefficient: Uses two 32-byte slots
struct BadStruct {
 uint256 a; // Slot 1
 uint256 b; // Slot 2
}

// Efficient: Uses one 32-byte slot
struct GoodStruct {
 uint128 a; // Slot 1 (first 128 bits)
 uint128 b; // Slot 1 (last 128 bits)
}
```

**Caution:** This optimization applies only to storage variables. For local variables in `memory` or `calldata`, using the full `uint256` is typically more cost-effective as the EVM efficiently handles 32-byte words.

### 3. Use `calldata` for External Function Parameters

For `external` functions with dynamic data types like `string` or `bytes`, prefer using `calldata` over `memory`.

- **The Difference:** `calldata` is a read-only, non-persistent area for function arguments. In contrast, `memory` is modifiable.
- **The Optimization:** Using `calldata` avoids the need for memory allocation and copying, thus saving gas.

```solidity
// Inefficient
function doSomething(string memory _myString) external { ... }

// Efficient
function doSomething(string calldata _myString) external { ... }
```

### 4. Use Custom Errors Instead of `require` Strings

Custom errors, introduced in Solidity 0.8.4, provide a more gas-efficient method for handling failed `require` statements.

- **The Problem:** The `require(condition, "Error string")` syntax stores the error string on-chain, which incurs gas costs.
- **The Solution:** Define a custom error and use it in your `require` statement. This approach avoids storing string data, resulting in considerable gas savings.

**Example:**

```solidity
// Inefficient
require(msg.sender == owner, "Caller is not the owner");

// Efficient
error NotOwner();
...
if (msg.sender != owner) {
 revert NotOwner();
}
```

### 5. Use `unchecked` for Safe Arithmetic (Solidity 0.8.0+)

With Solidity 0.8.0, arithmetic operations automatically check for overflow and underflow, adding a small gas cost. If you are confident that an operation will not overflow or underflow, you can wrap it in an `unchecked` block to save gas.

```solidity
// Example: A for loop where `i` will never overflow
for (uint256 i = 0; i < length; i++) {
 unchecked {
 // ... operations with i
 }
}
```
**Warning:** Use this feature cautiously, ensuring that you are certain the arithmetic is safe. An unexpected overflow can create serious security vulnerabilities.

Gas optimization is a complex subject. However, by applying these fundamental techniques, developers can achieve substantial savings. It requires a thorough understanding of how the EVM operates, as well as a focus on both functionality and gas efficiency.
