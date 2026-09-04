---
title: Deploying to Mainnet
description: >-
  The full deployment workflow: from local testing to Ethereum mainnet,
  including gas estimation, verification, and post-deployment checks.
order: 6
readTime: 8 min
difficulty: intermediate
prerequisites:
  - first-contract
  - testing
quiz:
  - question: Why should you deploy to a testnet before mainnet?
    options:
      - Testnets are faster
      - >-
        Testnet deployments use free test ETH, letting you verify everything
        works in a real blockchain environment without risking money
      - Mainnet doesn't support new contracts
      - Testnets have better tooling
    correct: 1
    explanation: >-
      Testnets like Sepolia simulate the exact same environment as Ethereum
      mainnet but use worthless test ETH. You can verify your deployment script,
      test user interactions, and check that your contract behaves correctly on
      a real blockchain before spending actual money.
  - question: What does 'contract verification' on Etherscan do?
    options:
      - It checks the contract for bugs
      - >-
        It publishes your source code so anyone can read it and confirm it
        matches the deployed bytecode
      - It registers the contract with Ethereum governance
      - It makes the contract faster
    correct: 1
    explanation: >-
      When you deploy a contract, only compiled bytecode goes on-chain - humans
      can't read it. Verification submits your Solidity source code to
      Etherscan, which compiles it independently and confirms it produces the
      same bytecode. This lets users verify the contract does what it claims.
  - question: What is the biggest cost when deploying a complex smart contract?
    options:
      - The Etherscan verification fee
      - >-
        Gas - you pay for every byte of bytecode stored on-chain and every
        storage slot initialized
      - The Solidity compiler license
      - Domain registration
    correct: 1
    explanation: >-
      Deployment gas costs scale directly with contract size. A simple ERC-20
      might cost ~$50 to deploy. A complex DeFi protocol with multiple contracts
      can cost $2,000-$10,000+ at typical gas prices. Optimizing bytecode size
      directly reduces deployment costs.
  - question: Why should you NEVER hardcode private keys in deployment scripts?
    options:
      - It makes the script slower
      - >-
        If the script is pushed to GitHub (even accidentally), anyone can steal
        all funds from that wallet
      - Hardcoded keys don't work with Ethereum
      - It violates Solidity style guidelines
    correct: 1
    explanation: >-
      Bots continuously scan GitHub for exposed private keys. If your deployment
      script contains a private key and you push it to a public repo - even for
      one second before deleting it - bots will drain the associated wallet
      within minutes. Always use environment variables or hardware wallets.
  - question: What should you do immediately after deploying to mainnet?
    options:
      - Delete the source code
      - >-
        Verify the contract on Etherscan, test every function with small
        amounts, and document the deployment addresses
      - Start marketing the protocol
      - Nothing - the contract is ready to use
    correct: 1
    explanation: >-
      Post-deployment verification is critical. Verify on Etherscan so users can
      audit the code. Test core functions with minimal amounts to confirm they
      work on mainnet. Record all contract addresses, deployer addresses, and
      constructor arguments in your project documentation.
lastUpdated: 2026-09-04
---

## The Deployment Path

Deploying a smart contract is not like deploying a web app. You cannot update it after it goes live. The sequence matters:

```
Local tests → Testnet deployment → Testnet verification → Mainnet deployment → Mainnet verification
```

Skipping any step is how protocols lose money.

<div class="diagram">
<svg viewBox="0 0 800 130" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
 <rect x="10" y="30" width="130" height="70" rx="10" fill="#dcfce7" stroke="#22c55e" stroke-width="1.5"/>
 <text x="75" y="58" text-anchor="middle" font-size="11" font-weight="bold" fill="#166534">Local Tests</text>
 <text x="75" y="76" text-anchor="middle" font-size="10" fill="#22c55e">forge test</text>

 <line x1="145" y1="65" x2="175" y2="65" stroke="#94a3b8" stroke-width="1.5"/>
 <polygon points="175,61 183,65 175,69" fill="#94a3b8"/>

 <rect x="190" y="30" width="130" height="70" rx="10" fill="#fefce8" stroke="#eab308" stroke-width="1.5"/>
 <text x="255" y="58" text-anchor="middle" font-size="11" font-weight="bold" fill="#854d0e">Testnet Deploy</text>
 <text x="255" y="76" text-anchor="middle" font-size="10" fill="#eab308">Sepolia</text>

 <line x1="325" y1="65" x2="355" y2="65" stroke="#94a3b8" stroke-width="1.5"/>
 <polygon points="355,61 363,65 355,69" fill="#94a3b8"/>

 <rect x="370" y="30" width="130" height="70" rx="10" fill="#f0f9ff" stroke="#3b82f6" stroke-width="1.5"/>
 <text x="435" y="58" text-anchor="middle" font-size="11" font-weight="bold" fill="#1e40af">Verify</text>
 <text x="435" y="76" text-anchor="middle" font-size="10" fill="#3b82f6">Etherscan</text>

 <line x1="505" y1="65" x2="535" y2="65" stroke="#94a3b8" stroke-width="1.5"/>
 <polygon points="535,61 543,65 535,69" fill="#94a3b8"/>

 <rect x="550" y="30" width="110" height="70" rx="10" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
 <text x="605" y="53" text-anchor="middle" font-size="11" font-weight="bold" fill="#991b1b">Mainnet</text>
 <text x="605" y="69" text-anchor="middle" font-size="10" fill="#ef4444">⚠️ Irreversible</text>
 <text x="605" y="85" text-anchor="middle" font-size="9" fill="#64748b">No undo</text>

 <line x1="665" y1="65" x2="695" y2="65" stroke="#94a3b8" stroke-width="1.5"/>
 <polygon points="695,61 703,65 695,69" fill="#94a3b8"/>

 <rect x="710" y="30" width="80" height="70" rx="10" fill="#faf5ff" stroke="#a855f7" stroke-width="1.5"/>
 <text x="750" y="58" text-anchor="middle" font-size="11" font-weight="bold" fill="#7c3aed">Monitor</text>
 <text x="750" y="76" text-anchor="middle" font-size="10" fill="#a855f7">Tenderly</text>
</svg>
</div>

## Step 1: Prepare Your Environment

Before touching mainnet, set up your deployment configuration.

### Hardhat Config

```javascript
// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
 solidity: "0.8.20",
 networks: {
 sepolia: {
 url: process.env.SEPOLIA_RPC_URL,
 accounts: [process.env.DEPLOYER_PRIVATE_KEY],
 },
 mainnet: {
 url: process.env.MAINNET_RPC_URL,
 accounts: [process.env.DEPLOYER_PRIVATE_KEY],
 },
 },
 etherscan: {
 apiKey: process.env.ETHERSCAN_API_KEY,
 },
};
```

### Critical Rule: Never Expose Keys

Your `.env` file holds your private key. Your `.gitignore` must include `.env`. Period.

```
# .env (NEVER commit this file)
DEPLOYER_PRIVATE_KEY=0xabc123...
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-key
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-key
ETHERSCAN_API_KEY=your-etherscan-api-key
```

Bots scan every GitHub push for private keys. If yours leaks for even one second, your wallet will be drained.

## Step 2: Write the Deployment Script

```javascript
// scripts/deploy.js
const hre = require("hardhat");

async function main() {
 const initialSupply = hre.ethers.parseEther("1000000");

 console.log("Deploying SimpleToken...");
 const token = await hre.ethers.deployContract("SimpleToken", [initialSupply]);
 await token.waitForDeployment();

 const address = await token.getAddress();
 console.log(`SimpleToken deployed to: ${address}`);

 // Wait for 5 block confirmations before verifying
 console.log("Waiting for block confirmations...");
 await token.deploymentTransaction().wait(5);

 // Verify on Etherscan
 console.log("Verifying on Etherscan...");
 await hre.run("verify:verify", {
 address: address,
 constructorArguments: [initialSupply],
 });

 console.log("Deployment and verification complete.");
}

main().catch(console.error);
```

## Step 3: Deploy to Testnet First

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

After deployment:
1. Check the contract on [Sepolia Etherscan](https://sepolia.etherscan.io).
2. Call every function. Transfer tokens. Test edge cases.
3. Have someone else test it. Fresh eyes catch what you missed.

## Step 4: Estimate Mainnet Costs

Before deploying to mainnet, estimate the gas cost:

```javascript
const factory = await hre.ethers.getContractFactory("SimpleToken");
const deployTx = await factory.getDeployTransaction(initialSupply);
const estimatedGas = await hre.ethers.provider.estimateGas(deployTx);
const gasPrice = await hre.ethers.provider.getFeeData();

const costInWei = estimatedGas * gasPrice.gasPrice;
const costInEth = hre.ethers.formatEther(costInWei);
console.log(`Estimated deployment cost: ${costInEth} ETH`);
```

Typical costs (at 20 gwei gas price):
- Simple ERC-20: ~$30-80
- ERC-721 (NFT): ~$50-150
- Complex DeFi protocol (multiple contracts): ~$2,000-10,000

## Step 5: Deploy to Mainnet

```bash
npx hardhat run scripts/deploy.js --network mainnet
```

This is the point of no return. Double-check everything before pressing enter.

## Post-Deployment Checklist

| Step | Action | Why |
|---|---|---|
| 1 | Verify on Etherscan | Users need to read and trust the source code |
| 2 | Test with small amounts | Confirm functions work on mainnet |
| 3 | Record addresses | Document every contract address in your repo |
| 4 | Transfer ownership | Move admin keys to a multisig (like Gnosis Safe) |
| 5 | Monitor | Set up alerts for unusual transactions (via Tenderly or OpenZeppelin Defender) |

## Foundry Deployment

If you use Foundry instead of Hardhat:

```bash
# Deploy
forge create --rpc-url $MAINNET_RPC_URL \
 --private-key $DEPLOYER_PRIVATE_KEY \
 src/SimpleToken.sol:SimpleToken \
 --constructor-args 1000000000000000000000000

# Verify
forge verify-contract $CONTRACT_ADDRESS \
 src/SimpleToken.sol:SimpleToken \
 --etherscan-api-key $ETHERSCAN_API_KEY
```

## Key takeaways

- Always deploy to a testnet first. Mainnet deployments are irreversible.
- Never expose private keys in code or Git history. Use environment variables and `.gitignore`.
- Verify your contract on Etherscan so users can audit the source code.
- After mainnet deployment, transfer ownership to a multisig wallet. A single compromised key should never control the protocol.
