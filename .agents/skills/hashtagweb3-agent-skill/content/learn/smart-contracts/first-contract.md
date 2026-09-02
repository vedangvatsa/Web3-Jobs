---
title: Your First Smart Contract
description: A line-by-line breakdown of a simple Solidity contract.
order: 2
readTime: 10 min
difficulty: beginner
prerequisites:
  - solidity
quiz:
  - question: What does the 'pragma solidity' line do?
    options:
      - Deploys the contract
      - Specifies which version of the compiler should be used
      - Imports external libraries
      - Declares a variable
    correct: 1
    explanation: >-
      The pragma directive tells the compiler which version of Solidity to use.
      This prevents future compiler updates from breaking your code.
  - question: What is a state variable?
    options:
      - A variable that exists only while a function is running
      - A variable whose value is permanently stored on the blockchain
      - A variable that holds the user's wallet address
      - A constant that cannot be changed
    correct: 1
    explanation: >-
      State variables are declared inside the contract but outside of any
      function. Their values are permanently written to the blockchain storage.
  - question: What does the 'public' keyword mean when applied to a state variable?
    options:
      - Anyone can change the variable
      - >-
        The compiler automatically generates a 'getter' function so anyone can
        read its value
      - The variable is free of gas fees
      - The variable is shared across all smart contracts
    correct: 1
    explanation: >-
      Making a variable 'public' tells Solidity to automatically create a
      function that allows anyone (or any other contract) to read the value of
      that variable without needing to write a custom getter function.
  - question: What does msg.sender represent?
    options:
      - The amount of ETH sent in the transaction
      - The address of the account (or contract) that called the function
      - The name of the contract
      - A random number generator
    correct: 1
    explanation: >-
      msg.sender is a global variable in Solidity that always contains the
      Ethereum address of the person or contract that initiated the current
      function call. It is heavily used for access control.
  - question: >-
      If a function only reads state variables but does not change them, what
      keyword should it use?
    options:
      - payable
      - view
      - pure
      - write
    correct: 1
    explanation: >-
      The 'view' keyword indicates that a function promises not to modify the
      state of the contract. Calling a view function from outside the blockchain
      costs no gas.
---

## Let's write a simple contract

We are going to look at a classic "Hello World" contract, but for blockchains: a simple Storage contract that lets anyone save a message and read the current message.

<div class="diagram">
<svg viewBox="0 0 800 170" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
 <text x="400" y="22" text-anchor="middle" font-size="13" font-weight="bold" fill="#374151">Anatomy of a Smart Contract</text>
 <rect x="30" y="35" width="740" height="125" rx="12" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>

 <rect x="50" y="50" width="160" height="40" rx="6" fill="#fefce8" stroke="#eab308" stroke-width="1.5"/>
 <text x="130" y="75" text-anchor="middle" font-size="11" font-weight="bold" fill="#854d0e">pragma solidity</text>
 <text x="130" y="105" text-anchor="middle" font-size="9" fill="#64748b">Compiler version</text>

 <rect x="230" y="50" width="160" height="40" rx="6" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
 <text x="310" y="75" text-anchor="middle" font-size="11" font-weight="bold" fill="#1e40af">State Variables</text>
 <text x="310" y="105" text-anchor="middle" font-size="9" fill="#64748b">Stored on-chain</text>

 <rect x="410" y="50" width="160" height="40" rx="6" fill="#dcfce7" stroke="#22c55e" stroke-width="1.5"/>
 <text x="490" y="75" text-anchor="middle" font-size="11" font-weight="bold" fill="#166534">Functions</text>
 <text x="490" y="105" text-anchor="middle" font-size="9" fill="#64748b">Read / write logic</text>

 <rect x="590" y="50" width="160" height="40" rx="6" fill="#faf5ff" stroke="#a855f7" stroke-width="1.5"/>
 <text x="670" y="75" text-anchor="middle" font-size="11" font-weight="bold" fill="#7c3aed">Modifiers</text>
 <text x="670" y="105" text-anchor="middle" font-size="9" fill="#64748b">Access control</text>

 <text x="400" y="145" text-anchor="middle" font-size="10" fill="#94a3b8">All wrapped inside: contract MyContract { ... }</text>
</svg>
</div>

Here is the entire contract:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleStorage {
 // A state variable permanently stored on the blockchain
 string public message;

 // A function to update the message
 function setMessage(string memory _newMessage) public {
 message = _newMessage;
 }
}
```

## Line-by-line breakdown

Let's tear this apart to understand exactly how Solidity works.

### 1. The License and Pragma
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
```
The first line is a machine-readable comment indicating the open-source license (MIT). The second line, the **pragma**, tells the compiler: "Only compile this code if you are using Solidity version 0.8.19 or higher." This prevents your code from breaking if future compiler versions change how things work.

### 2. Contract Declaration
```solidity
contract SimpleStorage {
```
Think of `contract` exactly like `class` in Python or Java. It defines the blueprint. Everything inside the curly braces belongs to this contract.

### 3. State Variables
```solidity
 string public message;
```
This is a **state variable**. Because it is declared inside the contract but outside any function, it is permanently stored on the Ethereum blockchain. 
- `string`: The data type. It holds text.
- `public`: An access modifier. By declaring it public, Solidity automatically creates a hidden function that allows anyone in the world to read the value of `message`.
- `message`: The name we gave the variable.

### 4. Functions
```solidity
 function setMessage(string memory _newMessage) public {
 message = _newMessage;
 }
```
This is a function that allows users to change the message.
- `function setMessage(...)`: We name the function.
- `(string memory _newMessage)`: The parameters. We expect a string. The keyword `memory` tells the EVM to store this temporary variable in memory while the function executes, rather than saving it to the permanent blockchain storage.
- `public`: Anyone can call this function.
- `message = _newMessage;`: We take the input and overwrite our permanent state variable.

## Adding Access Control

Right now, *anyone* can call `setMessage`. What if we only want the person who created the contract to change the message? We introduce `msg.sender` and a constructor.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract OwnedStorage {
 string public message;
 address public owner;

 // Runs once when the contract is deployed
 constructor() {
 owner = msg.sender;
 }

 function setMessage(string memory _newMessage) public {
 // Require checks a condition. If false, it reverts the entire transaction.
 require(msg.sender == owner, "Only the owner can set the message");
 message = _newMessage;
 }
}
```

### What changed?

1. **`address public owner;`**: We added a state variable of type `address` to hold an Ethereum wallet address (like `0x123...`).
2. **`constructor()`**: This is a special function that runs *only once*, exactly when the contract is deployed. We set the `owner` variable to `msg.sender`.
3. **`msg.sender`**: A global variable that always contains the address of the person calling the function. During deployment, `msg.sender` is the deployer.
4. **`require(...)`**: A gatekeeper. When someone calls `setMessage`, it checks if the caller (`msg.sender`) matches the `owner`. If it doesn't match, the transaction fails immediately, the error string is returned, and any state changes are reversed.

## Key takeaways

- `pragma` locks your compiler version.
- State variables are permanently stored on the blockchain.
- `public` variables automatically get read functions.
- `msg.sender` identifies who is calling the contract.
- `require` is used to enforce rules and access control.
