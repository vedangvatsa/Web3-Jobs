---


title: "Common Smart Contract Vulnerabilities Explained"
image: "/images/christin-hume-Hcfwew744z4-unsplash.jpg"
data-ai-hint: "security vulnerability lock"
description: "A developer's guide to the most common security flaws in Solidity smart contracts, from reentrancy to integer overflows. Learn how to identify and prevent."
category: "Technology Deep Dives"

---



In the high-stakes world of Web3, smart contract security is paramount. A single vulnerability in your code can lead to the loss of millions of dollars in user funds. Because deployed blockchain code is immutable, these mistakes are often permanent and irreversible. Therefore, a deep understanding of common attack vectors is not just a good practice for a developer—it is an absolute necessity.

This guide provides a detailed overview of the most common smart contract vulnerabilities, with a focus on those found in the EVM environment. We'll explain how they work, provide code examples of flawed patterns, and outline the best practices for prevention. This is essential reading for any aspiring [smart contract auditor](/smart-contract-auditor-career) or security-conscious developer.

### 1. Reentrancy

This is the most famous and one of the most devastating smart contract vulnerabilities, responsible for the infamous 2016 DAO hack.

-   **The Concept:** A reentrancy attack occurs when a malicious external contract is able to call back into the victim contract and re-execute a function before the original function call has completed. This can allow an attacker to repeatedly drain funds.
-   **The Vulnerable Code:** The classic example is a `withdraw` function that sends Ether *before* updating the user's balance.

    ```solidity
    // VULNERABLE CODE
    mapping(address => uint) public balances;

    function withdraw() public {
        uint amount = balances[msg.sender];
        require(amount > 0);
        // PROBLEM: Interaction (sending ETH) happens before the Effect (updating balance)
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Failed to send Ether");
        balances[msg.sender] = 0;
    }
    ```

-   **The Attack:** An attacker creates a malicious contract with a `receive()` fallback function. This function is triggered when the contract receives Ether. The attacker's `receive()` function simply calls the victim's `withdraw()` function again. The second `withdraw()` call succeeds because `balances[msg.sender]` has not yet been set to zero. This loop continues until the victim contract is drained of all its Ether.

-   **The Prevention: The Checks-Effects-Interactions Pattern**
    This is the golden rule for preventing reentrancy. Structure your functions in this specific order:
    1.  **Checks:** Perform all validations (`require` statements).
    2.  **Effects:** Update all state variables.
    3.  **Interactions:** Call any external contracts or send Ether.

    ```solidity
    // SECURE CODE
    function withdraw() public {
        // 1. Checks
        uint amount = balances[msg.sender];
        require(amount > 0);
        // 2. Effects
        balances[msg.sender] = 0;
        // 3. Interactions
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }
    ```

### 2. Integer Overflow and Underflow

This was a very common vulnerability in older Solidity versions.

-   **The Concept:** A `uint` (unsigned integer) has a fixed size. For example, a `uint8` can only hold values from 0 to 255. If you add 1 to a `uint8` that already holds 255, it doesn't cause an error; it "wraps around" to 0 (overflow). Similarly, subtracting 1 from a `uint8` that holds 0 will wrap it around to 255 (underflow).
-   **The Vulnerable Code (Pre-Solidity 0.8.0):**

    ```solidity
    // VULNERABLE on Solidity < 0.8.0
    uint8 public balance;
    function deposit() public payable {
        balance += uint8(msg.value); // Could overflow if balance is already high
    }
    ```

-   **The Prevention:**
    -   **Use Solidity 0.8.0+:** The simplest solution. Starting with version 0.8.0, the Solidity compiler automatically includes checks for overflow and underflow, and will cause a transaction to revert if one occurs. All modern smart contracts should be written with `pragma solidity ^0.8.0;`.
    -   **SafeMath Libraries:** For older projects, the standard solution was to use OpenZeppelin's `SafeMath` library, which provided functions (`add`, `sub`, `mul`) that had built-in overflow checks.

### 3. Incorrect Access Control

This is a broad but critical category of bugs where functions that should be restricted can be called by unauthorized users.

-   **The Concept:** Functions that perform sensitive actions (like changing the owner, minting new tokens, or upgrading a contract) must be protected so that only privileged addresses can call them.
-   **The Vulnerable Code:**

    ```solidity
    // VULNERABLE CODE
    address public owner;
    // The owner should be set in the constructor
    // constructor() { owner = msg.sender; }
    
    function withdrawAll() public { // Problem: No access control! Anyone can call this.
        (bool sent, ) = owner.call{value: address(this).balance}("");
        require(sent);
    }
    ```

-   **The Prevention:**
    -   **Function Modifiers:** Use a modifier like `onlyOwner` to restrict access.
    -   **Role-Based Access Control:** For more complex systems, use a standardized role-based system like OpenZeppelin's `AccessControl` contract, which allows you to define different roles (e.g., `MINTER_ROLE`, `UPGRADER_ROLE`) and assign them to different addresses.

    ```solidity
    // SECURE CODE
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    function withdrawAll() public onlyOwner { // Protected
        (bool sent, ) = owner.call{value: address(this).balance}("");
        require(sent);
    }
    ```

### 4. Oracle Manipulation

DeFi protocols often rely on oracles to get the price of assets. If this price feed is manipulatable, the protocol can be attacked.

-   **The Concept:** An attacker takes actions to artificially inflate or deflate the price of an asset reported by an oracle. They then use this false price to exploit a protocol, for example, by borrowing assets against overvalued collateral.
-   **The Vulnerable Code:** Using the spot price from a single on-chain source like a Uniswap v2 pool as a price oracle.

    ```solidity
    // VULNERABLE CODE
    function getPrice() internal view returns (uint) {
        // PROBLEM: This price can be easily manipulated in a single transaction.
        return uniswapV2Pair.getReserves()...; 
    }
    ```

-   **The Attack:** An attacker uses a [flash loan](/what-is-mev) to execute a massive trade on the Uniswap pool, drastically changing the spot price. In the same transaction, they interact with your protocol, which now reads the manipulated price.
-   **The Prevention:**
    -   **Use Decentralized Oracle Networks:** Use a robust oracle network like Chainlink, which aggregates prices from dozens of independent, off-chain sources, making it resistant to single-source manipulation.
    -   **Use Time-Weighted Average Prices (TWAPs):** If using an on-chain source, use a TWAP oracle (like those available in Uniswap V3), which averages the price over a period of time, making it much harder and more expensive to manipulate.

### 5. Unchecked External Calls

When your contract calls another contract, you must check if the call was successful.

-   **The Concept:** Low-level calls like `call`, `delegatecall`, and `staticcall` do not cause the parent function to revert if they fail. They simply return `false` as the first return value. If you don't check this return value, your function will continue executing as if the call succeeded, which can lead to unexpected states.
-   **The Vulnerable Code:**

    ```solidity
    // VULNERABLE CODE
    function sendTo(address payable _to, uint amount) public {
        _to.call{value: amount}(""); // PROBLEM: Return value is not checked
        // Function continues even if the send failed
    }
    ```

-   **The Prevention:** Always check the boolean `success` value returned by a low-level call and revert the transaction if it is `false`.

    ```solidity
    // SECURE CODE
    function sendTo(address payable _to, uint amount) public {
        (bool success, ) = _to.call{value: amount}("");
        require(success, "External call failed");
    }
    ```

Smart contract security is a deep and ever-evolving field. While this guide covers some of the most common vulnerabilities, a security-first mindset requires constant learning, rigorous testing, and a healthy dose of paranoia. By understanding how things can break, you can learn to build systems that are robust, resilient, and worthy of your users' trust.
