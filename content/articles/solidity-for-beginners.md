---

title: 'Solidity for Beginners: Your First Smart Contract'
image: 'https://images.unsplash.com/photo-1595675024853-0f3ec9098ac7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMXx8Y29kaW5nfGVufDB8fHx8MTc1NDk1NDI2M3ww&ixlib=rb-4.1.0&q=80&w=1080'
description: 'A step-by-step tutorial for beginners on how to write, compile, and deploy your very first Solidity smart contract. Learn the fundamental concepts of the most popular blockchain programming language.'
category: 'Getting Started'

publishedDate: "2026-03-11"
lastUpdated: "2026-04-27"
---

So, you want to become a [Web3](/what-is-web3) developer. You've heard about the exciting world of decentralized applications (dApps), [DeFi](/what-is-defi), and [NFTs](/what-are-nfts), and you're ready to start building. The journey for most aspiring [blockchain](/what-is-a-blockchain) developers begins with one language: [Solidity](/best-programming-languages-for-blockchain-development). As the primary language for programming [smart contracts](/what-are-smart-contracts) on [Ethereum](/what-is-ethereum) and other EVM-compatible blockchains, Solidity is the key that unlocks the door to Web3 development.

But where do you start? The world of smart contracts can seem intimidating, with its talk of gas fees, immutability, and the Ethereum Virtual Machine (EVM). This guide is designed to cut through the complexity and provide a gentle, step-by-step introduction to Solidity. We'll walk you through the process of setting up your development environment, explain the core concepts of the language, and guide you in writing, compiling, and deploying your very first, simple smart contract. By the end of this tutorial, you'll have a foundational understanding of Solidity and a tangible project to show for it.

## What You'll Need Your Development Environment

Before we write any code, we need a place to write and test it. While professional developers use complex local setups with tools like Hardhat or Foundry, we can start with a much simpler, web-based tool called **Remix IDE**.

**What is Remix?**
Remix is an open-source Integrated Development Environment (IDE) that runs directly in your browser. It has everything we need to get started:
- A code editor for writing Solidity.
- A compiler to turn our Solidity code into bytecode that the EVM can understand.
- A simulated blockchain environment for deploying and testing our contract without needing real cryptocurrency.

> **Action:** Open your browser and navigate to [remix.ethereum.org](https://remix.ethereum.org).

You'll be greeted with a default workspace. You can explore the example files, but for this tutorial, we'll create our own.

## Step 1: Create Your First Contract File

In the Remix file explorer on the left, you'll see a folder named `contracts`.
1.  Right-click on the `contracts` folder.
2.  Select "New File".
3.  Name your file `SimpleStorage.sol`. The `.sol` extension is crucial.

A new, empty file will open in the editor. Now, we're ready to write some code.

## Step 2: Understanding the Basic Structure of a Solidity Contract

Every Solidity file has a few essential components. Let's break them down as we build our contract.

### 1. The SPDX License Identifier

The very first line of any Solidity file should be a comment specifying the software license. This is a best practice that builds trust in the open-source ecosystem.

```solidity
// SPDX-License-Identifier: MIT
```
This line tells everyone that our code is licensed under the MIT License, a permissive open-source license.

### 2. The Pragma Directive

The next line tells the compiler which version of Solidity we're using. This is important because Solidity is a rapidly evolving language, and a new version might introduce "breaking changes" that would make old code incompatible.

```solidity
pragma solidity ^0.8.20;
```
-   `pragma` is a directive to the compiler.
-   `solidity ^0.8.20` means this code is compatible with Solidity version 0.8.20 and any newer *patch* versions (e.g., 0.8.21), but not with a new *minor* version (like 0.9.0). The caret `^` is what specifies this rule.

### 3. The Contract Keyword

Now, we define the contract itself. A contract is a collection of code (its *functions*) and data (its *state*) that resides at a specific address on the blockchain. We use the `contract` keyword, followed by the name of our contract.

```solidity
contract SimpleStorage {
    // Our code will go in here
}
```
Our contract is named `SimpleStorage`. All the variables and functions that belong to this contract will be inside these curly braces `{}`.

Your `SimpleStorage.sol` file should now look like this:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleStorage {
    // Our code will go in here
}
```

## Step 3: Adding State Variables

A "state variable" is a variable whose value is permanently stored in the contract's storage on the blockchain. Think of it as writing data to a database. Any change to a state variable is a transaction that modifies the blockchain's state.

Let's create a state variable to store a number.

```solidity
contract SimpleStorage {
    uint256 public favoriteNumber;
}
```
Let's break this down:
-   `uint256`: This is the data type. `uint` stands for "unsigned integer," meaning it cannot be negative. `256` refers to the number of bits it takes up in storage. This is the standard type for numbers in Solidity.
-   `public`: This is a visibility keyword. Making a variable `public` tells the Solidity compiler to automatically create a *getter function* for it. This means other contracts (and us!) can read the value of this variable without us having to write a specific function for it.
-   `favoriteNumber`: This is the name of our variable.

## Step 4: Writing Functions to Modify State

Reading data is useful, but the real power of smart contracts comes from modifying their state. To do this, we need to write a function.

Let's create a function called `store` that will allow us to change the value of `favoriteNumber`.

```solidity
contract SimpleStorage {
    uint256 public favoriteNumber;

    function store(uint256 _newFavoriteNumber) public {
        favoriteNumber = _newFavoriteNumber;
    }
}
```

Dissecting the `store` function:
-   `function store(...)`: We use the `function` keyword to declare a function named `store`.
-   `(uint256 _newFavoriteNumber)`: This defines the function's input parameters. We expect one parameter, a `uint256`, which we'll call `_newFavoriteNumber`. It's a common convention to prefix parameter names with an underscore `_` to distinguish them from state variables.
-   `public`: This visibility keyword means the function can be called by anyone (any external account or other smart contract).
-   `{ favoriteNumber = _newFavoriteNumber; }`: This is the function's body. It takes the input `_newFavoriteNumber` and assigns its value to our state variable `favoriteNumber`. This action changes the state of the blockchain and will require a transaction (and gas fees, on a real network).

## Step 5: Compiling Your Smart Contract

Now that our code is written, we need to compile it.
1.  On the left-hand side of Remix, click on the "Solidity compiler" icon (it looks like a plug).
2.  Make sure the "Compiler" version matches the one in your pragma directive (e.g., 0.8.20 or newer). Remix usually selects the correct one automatically.
3.  Click the big blue "Compile SimpleStorage.sol" button.

If everything is correct, you'll see a green checkmark appear on the compiler icon. Congratulations, you've successfully compiled your first smart contract!

## Step 6: Deploying and Interacting with Your Contract

Compiling the code is just the first step. To use it, we need to deploy it to a blockchain. Remix provides a simulated blockchain for this purpose.

1.  On the left-hand side, click the "Deploy & run transactions" icon (it looks like the Ethereum logo).
2.  **Environment:** Make sure the environment is set to "Remix VM (London)". This is your personal, in-browser blockchain.
3.  **Account:** You'll see a list of accounts, each pre-loaded with fake Ether. This is the account you'll use to deploy the contract.
4.  **Deploy:** Ensure your `SimpleStorage` contract is selected in the "Contract" dropdown. Click the orange "Deploy" button.

You should see some activity in the Remix terminal at the bottom, and then under "Deployed Contracts," you will see your `SimpleStorage` contract.

### Interacting with Your Deployed Contract

Click the small arrow next to your `SimpleStorage` contract to expand it. You will see buttons corresponding to the `public` parts of your contract.

-   **`favoriteNumber` (blue button):** This is the public getter function for our state variable. Click it now. It will instantly return the value `0`, which is the default value for a `uint256`.
-   **`store` (orange button):** This is our function for changing the state.
    -   In the input field next to the `store` button, type a number (e.g., `77`).
    -   Click the `store` button. This simulates a transaction. You'll see it logged in the terminal.
-   **Check the new value:** Now, click the blue `favoriteNumber` button again. It will now return `77`!

You have successfully written, compiled, deployed, and interacted with a smart contract. You have stored a value on a (simulated) blockchain and then retrieved it. This is the fundamental pattern behind all dApps.

## Your Final Code (`SimpleStorage.sol`)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleStorage
 * @author Your Name
 * @notice This is a very simple contract to store and retrieve a number.
 */
contract SimpleStorage {
    // A state variable to store a number.
    // It is public, so Solidity automatically creates a getter function for it.
    uint256 public favoriteNumber;

    /**
     * @notice Stores a new favorite number in the contract.
     * @param _newFavoriteNumber The new number to store.
     */
    function store(uint256 _newFavoriteNumber) public {
        favoriteNumber = _newFavoriteNumber;
    }

    /**
     * @notice Retrieves the currently stored favorite number.
     * @dev This function is not strictly necessary because the state variable
     * is public, which automatically creates a getter. However, it's included
     * here for educational purposes to show how a view function works.
     */
    function retrieve() public view returns (uint256) {
        return favoriteNumber;
    }
}
```
*Note: I've added a `retrieve` function and some comments (`@notice`, `@dev`) which are part of a documentation standard called NatSpec. This is a good habit to get into early! The `view` keyword in the `retrieve` function means it only reads from the blockchain state and doesn't modify it, so it doesn't cost any gas to call.*

This simple contract is the "Hello, World!" of Web3. From here, you can explore more complex data types, function modifiers, and contract interactions. But every complex DeFi protocol or NFT marketplace is built upon these same core principles: storing state and defining functions to change that state according to a set of rules. Your journey as a Web3 developer has officially begun.
