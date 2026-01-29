---


title: "Writing Upgradable Smart Contracts: Proxies Explained"
image: "https://images.unsplash.com/photo-1489875347897-49f64b51c1f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyMHx8Y29kaW5nfGVufDB8fHx8MTc1NDk1NDI2M3ww&lib=rb-4.1.0&q=80&w=1080"
data-ai-hint: "software update upgrade"
description: "Smart contracts are immutable, so how do you fix bugs or add new features? This guide explains the Transparent Proxy Pattern, the industry standard for making your contracts upgradable."
category: "Technology Deep Dives"

---



One of the core properties of a smart contract is immutability. Once deployed to the blockchain, its code cannot be changed. This is a powerful feature for security and trust, but it presents a major challenge: What do you do if you find a bug, or if you want to add a new feature?

Deploying a completely new contract and migrating all the data and users is a complex and expensive process. The solution to this problem is to use an **upgradability pattern**. The most common and battle-tested method is the **Transparent Proxy Pattern**.

This guide will explain how this pattern works and how you can use it to build flexible and maintainable smart contracts.

### The Core Idea: Separating State and Logic

The proxy pattern works by splitting your application into two separate contracts:

1.  **The Proxy Contract:** This is the contract that users interact with. It holds all of the state (the data and user balances) for your application. Crucially, it contains very little logic. Its only real job is to forward all function calls to another contract. The address of this proxy contract never changes.

2.  **The Implementation Contract (or Logic Contract):** This contract contains all of the actual business logic for your application. It is stateless and simply executes the functions that are forwarded to it by the proxy.

### How it Works: `delegatecall`

The magic that connects these two contracts is a special EVM opcode called `delegatecall`.

When the Proxy contract receives a function call (e.g., `deposit()`), it doesn't execute the function itself. Instead, it uses `delegatecall` to pass the function call on to the current Implementation contract.

**`delegatecall` is special:** It executes the code of the Implementation contract, but it does so in the *context of the Proxy contract's state*. This means the Implementation contract can read and write to the Proxy's storage as if it were its own.

The Proxy contract has a state variable that stores the address of the current Implementation contract. This address can be updated by the owner of the proxy.

### How to Perform an Upgrade

The upgrade process is simple but powerful:

1.  **Deploy a New Implementation:** You find a bug or want to add a feature, so you write a new version of your logic contract (`ImplementationV2.sol`). You deploy this new contract to the blockchain, and it gets a new address.

2.  **Update the Proxy:** As the owner of the Proxy contract, you call a special administrative function on the Proxy (e.g., `upgradeTo(newImplementationAddress)`).

3.  **The Change Takes Effect:** The Proxy contract updates its state to point to the address of `ImplementationV2.sol`.

That's it. The upgrade is complete. Users continue to interact with the same, unchanged Proxy address, but all their calls are now being delegated to the new logic contract. All the application's state, which is stored in the Proxy, is preserved.

### Using OpenZeppelin for Upgradable Contracts

You should never try to write your own proxy contracts from scratch. It is a complex and high-risk task. The industry standard is to use the **OpenZeppelin Upgrades Plugins**.

*   **@openzeppelin/hardhat-upgrades**
*   **@openzeppelin/foundry-upgrades**

**A typical workflow with Hardhat:**

1.  **Write your V1 contract:** Write your initial `MyContract.sol` as you normally would, but initialize state variables in an `initializer` function instead of a `constructor`.

2.  **Deploy as upgradable:** Instead of a normal deployment script, you use the OpenZeppelin plugin:

    ```javascript
    const MyContract = await ethers.getContractFactory("MyContract");
    const instance = await upgrades.deployProxy(MyContract, [arg1, arg2]);
    await instance.waitForDeployment();
    ```
    The plugin will automatically deploy your implementation contract, deploy a proxy contract, and link them together.

3.  **Upgrade:** When you're ready to upgrade, you write `MyContractV2.sol` and run:

    ```javascript
    const MyContractV2 = await ethers.getContractFactory("MyContractV2");
    const upgraded = await upgrades.upgradeProxy(instance.address, MyContractV2);
    ```
    The plugin handles deploying the new implementation and calling the `upgradeTo` function on the proxy.

### Important Considerations and Risks

*   **Storage Collisions:** When writing a new version of your implementation contract, you must be extremely careful not to change the order or type of the existing state variables. Doing so can lead to "storage collisions" where your contract's state becomes corrupted. The OpenZeppelin plugins have tools to help detect this.
*   **Centralization:** The ability to upgrade a contract introduces a new trust assumption. Users must trust that the owner of the proxy (usually the development team or a multisig) will not upgrade the contract to a malicious version. For mature protocols, it is common to transfer ownership of the proxy to a community-governed DAO or to a timelock contract to decentralize this power.

Upgradability is a powerful tool that allows projects to evolve and adapt over time. By using standard, battle-tested solutions like the OpenZeppelin Upgrades Plugins, developers can build robust dApps that are both secure and future-proof.
