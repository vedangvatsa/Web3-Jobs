---

title: "How to Create and Deploy Your First Smart Contract"
image: "https://images.unsplash.com/photo-1639762681057-408e52192e50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxzbWFydCUyMGNvbnRyYWN0fGVufDB8fHx8MTc2Mjg1NjQxM3ww&ixlib=rb-4.1.0&q=80&w=1080"
description: "A beginner-friendly guide to writing, compiling, and deploying a basic smart contract on the Ethereum blockchain using Remix."
category: "Getting Started"
data-ai-hint: "smart contract deployment"

publishedDate: "2026-03-11"
lastUpdated: "2026-06-14"
---

Deploying your first [smart contract](/what-are-smart-contracts) represents a significant milestone for anyone aspiring to become a [Web3](/what-is-web3) developer. While the process may initially appear intimidating, modern tools make it straightforward. This guide provides a detailed walkthrough of creating and deploying a basic smart contract using Remix, a popular web-based Integrated Development Environment (IDE).

### Requirements

To get started, you will need:

- A web browser, preferably Chrome or Firefox.
- The MetaMask browser extension [wallet](/how-to-choose-a-crypto-wallet).

This setup allows you to interact with the Ethereum test network, so there’s no need for real cryptocurrency during this initial phase.

### Step 1: Set Up Your Wallet and Acquire Test ETH

1. **Install MetaMask**: Download the MetaMask extension from the official site if you haven’t done so already.
2. **Switch to a Test Network**: Open MetaMask and select the network dropdown at the top. Choose the "Sepolia" test network.
3. **Obtain Test ETH**: You will need test Ether to cover gas fees on the Sepolia network. Visit a Sepolia faucet (for example, `sepoliafaucet.com`), enter your wallet address, and request some funds. The test ETH may take a few minutes to arrive.

### Step 2: Write Your Smart Contract in Remix

1. **Access Remix**: Open your browser and navigate to `remix.ethereum.org`.
2. **Create a New File**: In the file explorer on the left, create a new file named `HelloWorld.sol`.
3. **Insert the Code**: Copy and paste the following basic smart contract code into the newly created file:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HelloWorld {
 string public message;

 constructor() {
 message = "Hello, Web3 World!";
 }

 function updateMessage(string memory newMessage) public {
 message = newMessage;
 }
}
```

**Code Breakdown:**
- `pragma solidity ^0.8.20;`: This specifies the Solidity compiler version to use.
- `contract HelloWorld { ... }`: This defines the smart contract.
- `string public message;`: This declares a public state variable named `message` of type `string`. Its public visibility ensures that Remix generates a "getter" function for reading its value.
- `constructor()`: This function runs once when the contract is deployed, initializing the `message`.
- `function updateMessage(...)`: This public function allows anyone to change the `message` variable's value.

### Step 3: Compile Your Contract

1. **Navigate to the Compiler Tab**: Click the Solidity compiler icon on the left side of Remix.
2. **Select the Compiler Version**: Ensure the compiler version matches the one specified in your code (e.g., `0.8.20`).
3. **Compile the Contract**: Click the "Compile HelloWorld.sol" button. A green checkmark next to the compiler icon indicates successful compilation.

### Step 4: Deploy to the Sepolia Testnet

1. **Go to the Deploy Tab**: Click the "Deploy & Run Transactions" icon on the left.
2. **Choose Environment**: In the "ENVIRONMENT" dropdown, select "Injected Provider - MetaMask." This instructs Remix to use your MetaMask wallet for deployment. A MetaMask popup will prompt you to connect your account; approve it.
3. **Deploy the Contract**: Make sure your `HelloWorld` contract is selected in the "CONTRACT" dropdown. Click the orange "Deploy" button.
4. **Confirm in MetaMask**: A MetaMask popup will appear for you to confirm the deployment transaction. This will show the estimated gas fee in Sepolia ETH. Click "Confirm."

### Step 5: Interact With Your Deployed Contract

Once the transaction is confirmed, your contract will appear under "Deployed Contracts" at the bottom of the Remix panel.

1. **Read the Message**: Click the blue button labeled `message`. This action retrieves the value of the `message` variable, displaying "Hello, Web3 World!".
2. **Update the Message**: In the `updateMessage` field, type a new message, such as "My first dApp!", and click the orange `transact` button.
3. **Confirm the Transaction**: Another MetaMask popup will appear, as this is a state-changing transaction that requires gas. Click "Confirm."
4. **Read the New Message**: After the transaction confirms, click the `message` button again. You will see the updated value, now reflecting "My first dApp!".

Congratulations on successfully writing, compiling, and deploying your first smart contract to a public [blockchain](/what-is-a-blockchain). This achievement opens the door to exploring more complex contract types and developing frontends that interact with them, advancing your journey as a Web3 developer.
