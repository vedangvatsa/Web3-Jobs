---
title: How to Build a Simple AMM on an L2
image: >-
 https://images.unsplash.com/photo-1579567761406-4684ee0c75b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMXx8dGVjaHxlbnwwfHx8fDE3NTQ5NTU3OTJ8MA&lib=rb-4.1.0&q=80&w=1080
data-ai-hint: decentralized exchange crypto
description: >-
 A practical guide for developers on how to build a basic Automated Market
 Maker (AMM) style DEX on a Layer 2 network like Arbitrum or Optimism.
category: Technology Deep Dives
publishedDate: '2026-03-11'
lastUpdated: "2026-08-28"
---

Automated Market Makers (AMMs) serve as foundational elements in Decentralized Finance ([DeFi](/what-is-defi)). They enable users to trade assets without intermediaries, using pools of [tokens](/what-is-a-token) instead of traditional order books. This design allows for easy, permissionless trading.

For many developers, creating an AMM represents a significant milestone. This complex project requires proficiency in [Solidity](/best-programming-languages-for-blockchain-development), the Ethereum Virtual Machine (EVM), and essential DeFi principles. Here, I will outline the fundamental steps and code structure necessary to build a basic AMM on a Layer 2 (L2) network.

### Advantages of Building on Layer 2

Developing on an L2 solution, such as Arbitrum, Optimism, or Base, has become the norm for modern decentralized applications (dApps). The reduced gas fees significantly benefit AMMs, especially since users can engage in multiple swaps. the developer experience closely mirrors that of [Ethereum](/what-is-ethereum), enabling a smooth transition of skills.

### Understanding the Core Concept: The `x * y = k` Formula

The essence of a basic AMM is captured by the constant product formula: `x * y = k`.

- `x`: Represents the amount of Token A within the liquidity pool.
- `y`: Represents the amount of Token B within the liquidity pool.
- `k`: A constant value that must remain unchanged.

When a user initiates a trade, they contribute Token A to the pool while removing Token B. The price of the tokens adjusts based on the new proportions of `x` and `y` to maintain the constant value of `k`. This formula provides the foundation for creating a [decentralized exchange](/what-is-a-decentralized-exchange-dex).

### Step 1: Structuring the Smart Contract (`SimpleAMM.sol`)

We will outline the architecture of our [smart contract](/what-are-smart-contracts). For this example, we will use two ERC-20 tokens, `TokenA` and `TokenB`.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SimpleAMM {
 IERC20 public immutable tokenA;
 IERC20 public immutable tokenB;

 uint256 public reserveA;
 uint256 public reserveB;

 uint256 public totalSupply; // Total LP shares
 mapping(address => uint256) public balanceOf; // LP shares for each user

 constructor(address _tokenA, address _tokenB) {
 tokenA = IERC20(_tokenA);
 tokenB = IERC20(_tokenB);
 }

 // Function to add liquidity
 function addLiquidity(uint256 _amountA, uint256 _amountB) public {
 // Logic to transfer tokens from user and mint LP shares
 }

 // Function to remove liquidity
 function removeLiquidity(uint256 _shares) public {
 // Logic to burn LP shares and return tokens to user
 }

 // Function to swap tokens
 function swap(address _tokenIn, uint256 _amountIn) public returns (uint256 amountOut) {
 // Logic to calculate output amount and transfer tokens
 }
}
```

### Step 2: Implementing the `addLiquidity` Function

This function allows users to deposit equal values of both tokens into the pool. In return, they receive liquidity provider (LP) tokens that represent their share of the pool.

```solidity
function addLiquidity(uint256 _amountA, uint256 _amountB) public {
 tokenA.transferFrom(msg.sender, address(this), _amountA);
 tokenB.transferFrom(msg.sender, address(this), _amountB);

 uint256 shares;
 if (totalSupply == 0) {
 // First liquidity provider sets the initial exchange rate
 shares = 100;
 } else {
 // Subsequent providers add liquidity proportionally to the current reserves
 shares = (_amountA * totalSupply) / reserveA;
 }

 require(shares > 0, "No shares minted");

 balanceOf[msg.sender] += shares;
 totalSupply += shares;

 reserveA += _amountA;
 reserveB += _amountB;
}
```

**Practical Insight**: The first liquidity provider has a unique advantage. They set the initial price of the assets in the pool. All subsequent providers must deposit tokens according to the existing ratio.

### Step 3: Implementing the `swap` Function

The `swap` function applies the `x * y = k` principle. A user inputs `_tokenIn` and receives `_tokenOut`.

```solidity
function swap(address _tokenIn, uint256 _amountIn) public returns (uint256 amountOut) {
 require(_tokenIn == address(tokenA) || _tokenIn == address(tokenB), "Invalid token");

 uint256 reserveIn;
 uint256 reserveOut;

 if (_tokenIn == address(tokenA)) {
 reserveIn = reserveA;
 reserveOut = reserveB;
 } else {
 reserveIn = reserveB;
 reserveOut = reserveA;
 }

 // Calculate output amount based on the constant product formula
 uint256 amountInWithFee = _amountIn * 997;
 amountOut = (reserveOut * amountInWithFee) / (reserveIn * 1000 + amountInWithFee);

 // Perform the token transfers
 if (_tokenIn == address(tokenA)) {
 tokenA.transferFrom(msg.sender, address(this), _amountIn);
 tokenB.transfer(msg.sender, amountOut);
 reserveA += _amountIn;
 reserveB -= amountOut;
 } else {
 tokenB.transferFrom(msg.sender, address(this), _amountIn);
 tokenA.transfer(msg.sender, amountOut);
 reserveB += _amountIn;
 reserveA -= amountOut;
 }
}
```

**Practical Insight**: The inclusion of `* 997` and `* 1000` implements a trading fee. This fee accumulates in the pool, enhancing the value of the reserves and rewarding liquidity providers.

### Step 4: Testing and Deployment Process

- **Testing**: Developing a detailed test suite for an AMM is essential. This ensures all functions work properly under various scenarios, including edge cases like empty pools or large trades. Use platforms like Foundry or Hardhat for testing.

- **Deployment**:
 1. Acquire testnet ETH for Layer 2 solutions like Arbitrum Sepolia or Base Sepolia from a public faucet.
 2. Deploy two ERC-20 token contracts to create your trading pair.
 3. Deploy the `SimpleAMM` contract, passing the addresses of your two token contracts into the constructor.
 4. Build a simple frontend using React and Ethers.js/Viem to interact with your deployed contracts.

This overview simplifies the process. A production-level AMM would include additional features, such as mechanisms against specific types of miner extractable value (MEV) and more advanced fee structures. However, creating this basic version provides a solid foundation and understanding of AMM mechanics.

## Step-by-Step Development Guide

### 1. Grasp the Fundamentals

Understanding the core principles of AMMs will influence all subsequent decisions. Study best practices from industry leaders to build a solid foundation.

### 2. Assess Your Current Capabilities

Evaluate your existing skills and identify areas for improvement. Understanding your strengths and weaknesses is essential for growth.

### 3. Create a Tailored Strategy

Develop a plan that aligns with your specific situation. Consider your role, the team dynamics, company culture, and personal objectives.

### 4. Implement Changes Gradually

Focus on incremental changes rather than attempting to transform everything simultaneously. Track the effectiveness of these modifications. An iterative approach builds sustainable improvements.

### 5. Measure Progress and Adapt

Regularly assess your results. Are you achieving your goals? Be prepared to adjust your strategy based on feedback and outcomes. A continuous improvement mindset is important.

## Real-World Case Studies

### Common Mistakes to Avoid

1. **Rushing the Development Process**: Sustainable change requires time. Patience is important.

2. **Neglecting Feedback**: Input from colleagues and mentors can provide valuable insights you might overlook. Always listen to feedback.

3. **One-Size-Fits-All Thinking**: Tailor strategies to fit your unique context. What works for others may not be effective for you.

4. **Quitting Too Soon**: Change often involves discomfort. Persistence through initial challenges leads to better outcomes.

5. **Failing to Track Progress**: You cannot improve without metrics. Keep a close eye on your development.
