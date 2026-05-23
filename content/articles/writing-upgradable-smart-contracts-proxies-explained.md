---

title: "Writing Upgradable Smart Contracts: Proxies Explained"
image: "https://images.unsplash.com/photo-1489875347897-49f64b51c1f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyMHx8Y29kaW5nfGVufDB8fHx8MTc1NDk1NDI2M3ww&lib=rb-4.1.0&q=80&w=1080"
data-ai-hint: "software update upgrade"
description: "Smart contracts are immutable, so how do you fix bugs or add new features? This guide explains the Transparent Proxy Pattern, the industry standard for."
category: "Technology Deep Dives"

publishedDate: "2026-03-11"
lastUpdated: "2026-05-20"
---

One of the defining characteristics of a [smart contract](/what-are-smart-contracts) is its immutability. Once it is deployed on the [blockchain](/what-is-a-blockchain), its code remains unchanged. This feature enhances security and builds trust, but it also poses significant challenges. What happens when you identify a bug or wish to introduce new features?

Deploying a completely new contract and migrating all associated data and users can be intricate and costly. The solution lies in using an **upgradability pattern**. The most established and reliable method is the **Transparent Proxy Pattern**.

This article explains how this pattern operates and how you can apply it to develop flexible and maintainable smart contracts.

### The Core Idea: Separating State and Logic

The proxy pattern divides your application into two distinct contracts:

1. **The Proxy Contract:** This contract interacts directly with users. It maintains all the state, including data and user balances, for your application. Importantly, it houses minimal logic. Its primary function is to forward all function calls to another contract. The address of this proxy contract remains constant.

2. **The Implementation Contract (or Logic Contract):** This contract encompasses all the business logic for your application. It is stateless and solely executes the functions forwarded to it by the proxy.

### How it Works: `delegatecall`

The mechanism that links these two contracts is a unique EVM opcode named `delegatecall`.

When the Proxy contract receives a function call, such as `deposit()`, it does not execute the function directly. Instead, it uses `delegatecall` to relay the function call to the current Implementation contract.

**`delegatecall` operates uniquely:** It executes the code of the Implementation contract while running in the *context of the Proxy contract's state*. This allows the Implementation contract to read and write to the Proxy's storage as if it were its own.

The Proxy contract contains a state variable that records the address of the current Implementation contract. The owner of the proxy can update this address as needed.

### How to Perform an Upgrade

The upgrade process is straightforward but effective:

1. **Deploy a New Implementation:** When you identify a bug or want to add a feature, develop a new version of your logic contract (e.g., `ImplementationV2.sol`). Deploy this new contract to the blockchain, which assigns it a new address.

2. **Update the Proxy:** As the owner of the Proxy contract, call a special administrative function on the Proxy (for example, `upgradeTo(newImplementationAddress)`).

3. **The Change Takes Effect:** The Proxy contract updates its state to reference the address of `ImplementationV2.sol`.

This process completes the upgrade. Users continue to interact with the same Proxy address, but all their calls are directed to the new logic contract. The application's state, stored in the Proxy, remains intact.

### Using OpenZeppelin for Upgradable Contracts

Avoid crafting your own proxy contracts from scratch. This task is complex and laden with risks. The industry standard is to use the **OpenZeppelin Upgrades Plugins**.

| Plugin Name | Description |
|--------------------------------------|-----------------------------------|
| `@openzeppelin/hardhat-upgrades` | Integration with Hardhat |
| `@openzeppelin/foundry-upgrades` | Integration with Foundry |

**A typical workflow with Hardhat includes:**

1. **Write your V1 contract:** Create your initial `MyContract.sol` as usual, but initialize state variables through an `initializer` function instead of a `constructor`.

2. **Deploy as upgradable:** Use the OpenZeppelin plugin for deployment instead of a standard deployment script:

 ```javascript
 const MyContract = await ethers.getContractFactory("MyContract");
 const instance = await upgrades.deployProxy(MyContract, [arg1, arg2]);
 await instance.waitForDeployment();
 ```
 The plugin deploys your implementation contract, establishes a proxy contract, and links both together automatically.

3. **Upgrade:** When you are ready to upgrade, create `MyContractV2.sol` and execute:

 ```javascript
 const MyContractV2 = await ethers.getContractFactory("MyContractV2");
 const upgraded = await upgrades.upgradeProxy(instance.address, MyContractV2);
 ```
 The plugin manages the deployment of the new implementation and invokes the `upgradeTo` function on the proxy.

### Important Considerations and Risks

- **Storage Collisions:** When developing a new version of your implementation contract, you must avoid altering the order or type of existing state variables. Such changes can result in "storage collisions," corrupting your contract's state. The OpenZeppelin plugins provide tools to identify these issues.

- **Centralization:** The capacity to upgrade a contract introduces a new trust dynamic. Users must trust that the proxy owner, often the development team or a multisig wallet, will not upgrade to a malicious version. Established protocols often transfer proxy ownership to community-governed [DAOs](/what-is-a-dao) or timelock contracts to decentralize this authority.

Upgradability is a valuable tool, enabling projects to evolve and adapt over time. By employing standard, tested solutions like the OpenZeppelin Upgrades Plugins, developers can create reliable decentralized applications (dApps) that ensure security and long-term viability.

### The Importance of Upgradability

Understanding the Transparent Proxy Pattern and upgradability is essential for your professional growth. Mastering these concepts can significantly enhance your value in the tech industry, particularly in [Web3](/what-is-web3) environments where flexibility and collaboration are fundamental.

### Step-by-Step Guide to Implementing Upgradable Contracts

#### Step 1: Understand the Fundamentals

Begin with a solid grasp of the principles behind the Transparent Proxy Pattern. Familiarize yourself with best practices from industry leaders and experts.

#### Step 2: Assess Your Current Situation

Evaluate your knowledge and skills. Identify your strengths and weaknesses in this area. Understanding your current capabilities is important for effective improvement.

#### Step 3: Develop Your Personal Strategy

Craft a plan that fits your unique circumstances. Consider factors such as your role, team dynamics, organizational culture, and personal objectives.

#### Step 4: Implement Gradually

Avoid attempting to change everything at once. Start with manageable adjustments, monitoring what works and what does not. This iterative strategy supports sustainable development.

#### Step 5: Measure and Adjust

Keep track of your progress. Are you achieving the desired results? Modify your approach based on feedback and outcomes. Embracing a mindset of continuous improvement is vital.
