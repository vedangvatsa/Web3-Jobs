---

title: "Common Smart Contract Vulnerabilities Explained"
image: "/images/christin-hume-Hcfwew744z4-unsplash.jpg"
data-ai-hint: "security vulnerability lock"
description: "A developer's guide to the most common security flaws in Solidity smart contracts, from reentrancy to integer overflows. Learn how to identify and prevent."
category: "Technology Deep Dives"

publishedDate: "2026-03-11"
lastUpdated: "2026-06-14"
---

In the high-stakes field of [Web3](/what-is-web3), the security of [smart contracts](/what-are-smart-contracts) stands as a top priority. A single vulnerability can result in the loss of significant user funds. Since deployed [blockchain](/what-is-a-blockchain) code remains immutable, errors become permanent, underscoring the necessity for developers to understand common attack vectors.

This guide offers a detailed examination of prevalent smart contract vulnerabilities, particularly those found in the Ethereum Virtual Machine (EVM) environment. It includes explanations of how these vulnerabilities operate, code examples of flawed patterns, and best practices for prevention. This information is important for any aspiring [smart contract auditor](/smart-contract-auditor-career) or security-focused developer.

### 1. Reentrancy

Reentrancy is one of the most notorious smart contract vulnerabilities, infamously connected to the 2016 [DAO](/what-is-a-dao) hack.

- **The Concept:** A reentrancy attack occurs when a malicious external contract calls back into the victim contract, allowing it to re-execute a function before the original call has finished. This can enable attackers to drain funds repeatedly.

- **The Vulnerable Code:** A classic example is a `withdraw` function that transfers Ether before updating the user’s balance.

 ```solidity
 // VULNERABLE CODE
 mapping(address => uint) public balances;

 function withdraw() public {
 uint amount = balances[msg.sender];
 require(amount > 0);
 (bool success, ) = msg.sender.call{value: amount}("");
 require(success, "Failed to send Ether");
 balances[msg.sender] = 0;
 }
 ```

- **The Attack:** An attacker constructs a malicious contract with a `receive()` fallback function, triggered upon receiving Ether. This function calls the victim's `withdraw()` function again. The second call succeeds because `balances[msg.sender]` has not yet been reset to zero. This loop continues until the victim contract is emptied of Ether.

- **The Prevention: The Checks-Effects-Interactions Pattern** 
 To prevent reentrancy, structure functions in the following order:
 1. **Checks:** Perform all validations (`require` statements).
 2. **Effects:** Update all state variables.
 3. **Interactions:** Call external contracts or send Ether.

 ```solidity
 // SECURE CODE
 function withdraw() public {
 uint amount = balances[msg.sender];
 require(amount > 0);
 balances[msg.sender] = 0;
 (bool sent, ) = msg.sender.call{value: amount}("");
 require(sent, "Failed to send Ether");
 }
 ```

### 2. Integer Overflow and Underflow

Integer overflow and underflow were common vulnerabilities in earlier versions of [Solidity](/best-programming-languages-for-blockchain-development).

- **The Concept:** An unsigned integer has a fixed size. For example, a `uint8` can only contain values from 0 to 255. Adding 1 to a `uint8` holding 255 results in a wrap-around to 0 (overflow). Conversely, subtracting 1 from a `uint8` at 0 wraps it around to 255 (underflow).

- **The Vulnerable Code (Pre-Solidity 0.8.0):**

 ```solidity
 // VULNERABLE on Solidity < 0.8.0
 uint8 public balance;
 function deposit() public payable {
 balance += uint8(msg.value); // Could overflow if balance is already high
 }
 ```

- **The Prevention:**
 - **Use Solidity 0.8.0+:** The most straightforward solution. With version 0.8.0, the Solidity compiler automatically checks for overflow and underflow, reverting transactions when they occur. All modern contracts should use `pragma solidity ^0.8.0;`.
 - **SafeMath Libraries:** For older projects, employing OpenZeppelin's `SafeMath` library provides functions (`add`, `sub`, `mul`) with built-in overflow checks.

### 3. Incorrect Access Control

Incorrect access control is a broad yet critical category of vulnerabilities where functions meant for restricted access can be triggered by unauthorized users.

- **The Concept:** Functions that execute sensitive actions, such as changing ownership, minting new [tokens](/what-is-a-token), or upgrading contracts, must be safeguarded to ensure only authorized addresses can invoke them.

- **The Vulnerable Code:**

 ```solidity
 // VULNERABLE CODE
 address public owner;

 function withdrawAll() public { // Problem: No access control! Anyone can call this.
 (bool sent, ) = owner.call{value: address(this).balance}("");
 require(sent);
 }
 ```

- **The Prevention:**
 - **Function Modifiers:** Implement a modifier like `onlyOwner` to restrict access.
 - **Role-Based Access Control:** For complex systems, use a standardized role-based approach, such as OpenZeppelin's `AccessControl` contract, which allows defining various roles (e.g., `MINTER_ROLE`, `UPGRADER_ROLE`) and assigning them to different addresses.

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

[DeFi](/what-is-defi) protocols frequently rely on oracles to obtain asset prices. Manipulating these price feeds can lead to vulnerabilities within the protocol.

- **The Concept:** An attacker can artificially inflate or deflate the price of an asset reported by an oracle, allowing them to exploit the protocol by borrowing assets against overvalued collateral.

- **The Vulnerable Code:** Using a single on-chain source, such as a Uniswap v2 pool, as a price oracle poses risks.

 ```solidity
 // VULNERABLE CODE
 function getPrice() internal view returns (uint) {
 return uniswapV2Pair.getReserves()...; 
 }
 ```

- **The Attack:** An attacker could use a [flash loan](/what-is-mev) to execute a large trade on the Uniswap pool, significantly altering the spot price. They then interact with your protocol in the same transaction, which now reads the manipulated price.

- **The Prevention:**
 - **Use Decentralized Oracle Networks:** Implement a reliable oracle network like Chainlink, which aggregates prices from multiple independent, off-chain sources, making it resilient to single-source manipulation.
 - **Use Time-Weighted Average Prices (TWAPs):** For on-chain sources, consider using a TWAP oracle (as available in Uniswap V3), which averages prices over time, complicating manipulation efforts.

### 5. Unchecked External Calls

When your contract invokes another contract, checking for call success is essential.

- **The Concept:** Low-level calls such as `call`, `delegatecall`, and `staticcall` do not revert the parent function upon failure; they simply return `false` as the first return value. Failing to check this return value allows the function to proceed as if the call succeeded, potentially leading to unexpected states.

- **The Vulnerable Code:**

 ```solidity
 // VULNERABLE CODE
 function sendTo(address payable _to, uint amount) public {
 _to.call{value: amount}(""); // PROBLEM: Return value is not checked
 }
 ```

- **The Prevention:** Always verify the boolean `success` value returned by a low-level call, and revert the transaction if it returns `false`.

 ```solidity
 // SECURE CODE
 function sendTo(address payable _to, uint amount) public {
 (bool success, ) = _to.call{value: amount}("");
 require(success, "External call failed");
 }
 ```

### Summary of Common Vulnerabilities

| Vulnerability | Description | Prevention Strategies |
|------------------------------|---------------------------------------------------------------|-----------------------|
| Reentrancy | Attackers drain funds by re-entering a function | Checks-Effects-Interactions pattern |
| Integer Overflow/Underflow | Inaccurate calculations from exceeding variable limits | Use Solidity 0.8.0 or SafeMath libraries |
| Incorrect Access Control | Unauthorized users access sensitive functions | Use function modifiers or role-based access control |
| Oracle Manipulation | Manipulated price feeds compromise protocol integrity | Use decentralized oracles or TWAPs |
| Unchecked External Calls | Ignoring failure of external contract calls | Always check call success |

Smart contract security encompasses a vast and continually changing field. This guide highlights some of the most prevalent vulnerabilities, but a security-first mindset requires ongoing education, thorough testing, and vigilance. By recognizing potential pitfalls, developers can design strong and reliable systems that uphold user trust.

Understanding these vulnerabilities proves essential for professional advancement. Mastering this knowledge distinguishes you in the competitive field of Web3, where security is critical. Professionals with a solid grasp of these principles often command higher salaries and advance more quickly.

### Steps for Mastering Smart Contract Security

1. **Understand the Fundamentals:** Begin with the foundational principles of smart contract security. This groundwork will inform your subsequent actions. Read extensively on best practices shared by industry leaders.

2. **Assess Your Current Skills:** Evaluate your existing knowledge and capabilities. Identify your strengths and weaknesses in smart contract security. Pinpoint specific challenges you face.

3. **Develop a Personal Strategy:** Tailor a plan that fits your circumstances. Everyone's journey is unique; your approach should reflect your role, team dynamics, organizational culture, and personal career goals.

4. **Implement Gradually:** Avoid overwhelming yourself with drastic changes. Start small, focusing on one aspect at a time. Track your progress to understand what works and what does not.

5. **Measure and Adjust:** Continuously monitor your advancements. Are you seeing tangible results? Adapt your strategies based on feedback and outcomes. This mindset of continuous improvement is vital for success.
