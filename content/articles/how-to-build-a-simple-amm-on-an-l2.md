---


title: "How to Build a Simple AMM on an L2"
image: "https://images.unsplash.com/photo-1579567761406-4684ee0c75b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMXx8dGVjaHxlbnwwfHx8fDE3NTQ5NTU3OTJ8MA&lib=rb-4.1.0&q=80&w=1080"
data-ai-hint: "decentralized exchange crypto"
description: "A practical guide for developers on how to build a basic Automated Market Maker (AMM) style DEX on a Layer 2 network like Arbitrum or Optimism."
category: "Technology Deep Dives"

---



Automated Market Makers (AMMs) like Uniswap are one of the foundational pillars of Decentralized Finance ([DeFi](/what-is-defi)). They allow users to trade assets in a permissionless way by trading against a pool of [tokens](/what-is-a-token) rather than a traditional order book.

Building your own AMM is a rite of passage for many DeFi developers. It's a challenging project that demonstrates a deep understanding of [Solidity](/best-programming-languages-for-blockchain-development), the EVM, and core DeFi concepts. This guide will walk through the high-level steps and code structure for building a very simple AMM on a Layer 2 network.

### Why Build on a Layer 2?

Building on an L2 like Arbitrum, Optimism, or Base is now the standard for modern dApps. The low gas fees are essential for an AMM, where users may perform multiple swaps. The developer experience is nearly identical to [Ethereum](/what-is-ethereum), so the skills are directly transferable.

### The Core Concept: The `x * y = k` Formula

The heart of a simple AMM is the constant product formula: `x * y = k`.

*   `x`: The amount of Token A in the liquidity pool.
*   `y`: The amount of Token B in the liquidity pool.
*   `k`: A constant value.

When a user wants to trade, they add some of Token A to the pool and remove some of Token B. To keep `k` constant, the price of the tokens changes based on the new ratio of `x` and `y`. This elegant formula is all we need to create a [decentralized exchange](/what-is-a-decentralized-exchange-dex).

### Step 1: The Smart Contract (`SimpleAMM.sol`)

Let's outline the structure of our [smart contract](/what-are-smart-contracts). We'll need two ERC-20 tokens to trade. For this example, let's assume we have two tokens, `TokenA` and `TokenB`.

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
        // ... Logic to transfer tokens from user and mint LP shares
    }

    // Function to remove liquidity
    function removeLiquidity(uint256 _shares) public {
        // ... Logic to burn LP shares and return tokens to user
    }
    
    // Function to swap tokens
    function swap(address _tokenIn, uint256 _amountIn) public returns (uint256 amountOut) {
        // ... Logic to calculate output amount and transfer tokens
    }
}
```

### Step 2: Implementing `addLiquidity`

This function allows users to deposit an equal value of both tokens into the pool. In return, they receive "LP tokens" that represent their share of the pool.

```solidity
function addLiquidity(uint256 _amountA, uint256 _amountB) public {
    tokenA.transferFrom(msg.sender, address(this), _amountA);
    tokenB.transferFrom(msg.sender, address(this), _amountB);

    uint256 shares;
    if (totalSupply == 0) {
        // First liquidity provider sets the initial exchange rate
        shares = 100;
    } else {
        // Subsequent providers add liquidity proportional to the current reserves
        shares = (_amountA * totalSupply) / reserveA;
    }

    require(shares > 0, "No shares minted");
    
    balanceOf[msg.sender] += shares;
    totalSupply += shares;
    
    reserveA += _amountA;
    reserveB += _amountB;
}
```

**Practical Insight:** The first liquidity provider is special. They get to set the initial price of the assets in the pool. All subsequent providers must deposit tokens at the current ratio.

### Step 3: Implementing `swap`

This is where the `x * y = k` magic happens. A user sends in some `_tokenIn` and receives `_tokenOut`.

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
    // This includes a 0.3% fee for liquidity providers
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

**Practical Insight:** Notice the `* 997` and `* 1000`. This is a simple way to implement a 0.3% trading fee. This fee stays in the pool, increasing the value of the reserves and rewarding the liquidity providers.

### Step 4: Testing and Deployment

*   **Testing:** Writing a thorough test suite for an AMM is critical. You need to test all functions, including edge cases like what happens when a pool is empty or when a huge swap is made. Use Foundry or Hardhat for this.
*   **Deployment:**
    1.  Get some testnet ETH for an L2 like Arbitrum Sepolia or Base Sepolia from a public faucet.
    2.  First, you'll need to deploy two separate ERC-20 token contracts to use for your trading pair.
    3.  Then, deploy your `SimpleAMM` contract, passing the addresses of your two token contracts into the constructor.
    4.  Build a simple frontend with React and Ethers.js/Viem to interact with your deployed contracts.

This guide provides a simplified overview. A production-ready AMM has many more features, such as protection against certain types of MEV and more sophisticated fee structures. However, building this simple version is an excellent way to gain a deep, practical understanding of how

## Why This Matters

Understanding this concept is crucial for your professional success. In today's dynamic workplace environment, professionals who master this skill stand out, earn higher salaries, and advance faster. This is especially true in [Web3](/what-is-web3) organizations where communication and collaboration are paramount.

## Step-by-Step Guide

### Step 1: Understand the Fundamentals

Begin by grasping the core principles. This foundation will inform everything else you do in this area. Take time to read about best practices from industry leaders and thought leaders.

### Step 2: Assess Your Current Situation

Evaluate where you stand today. Are you strong in some aspects and weak in others? What specific challenges are you facing? Understanding your baseline is critical.

### Step 3: Develop Your Personal Strategy

Create a plan tailored to your situation. Everyone's circumstances are different, so your approach should be customized. Consider your role, team dynamics, organization culture, and personal goals.

### Step 4: Implement Gradually

Don't try to change everything at once. Start with one small change and build from there. Track what works and what doesn't. This iterative approach leads to sustainable improvement.

### Step 5: Measure and Adjust

Monitor your progress. Are you seeing results? Adjust your approach based on feedback and outcomes. This continuous improvement mindset is essential.

## Real-World Examples

### Example 1
Consider Sarah, a developer at a [blockchain](/what-is-a-blockchain) startup. She struggled with {topic} until she implemented these strategies. Within 3 months, she saw dramatic improvements in her {relevant metric}.

### Example 2
Juan, a product manager in DeFi, faced similar challenges. By following this framework, he was able to {achieve outcome}. His experience demonstrates how universal these principles are.

### Example 3
Maya, transitioning from Web2 to Web3, used this approach to quickly adapt. Her success shows that this works regardless of your background or experience level.

## Common Mistakes to Avoid

1. **Rushing the Process** - Don't expect overnight results. Sustainable change takes time.

2. **Ignoring Feedback** - Your colleagues, managers, and mentors see things you might miss. Listen to their input.

3. **One-Size-Fits-All Approach** - What works for someone else might not work for you. Adapt these strategies to your context.

4. **Giving Up Too Soon** - Change is uncomfortable. Push through the initial discomfort to reach better outcomes.

5. **Not Tracking Progress** - You can't improve what you don't measure. Keep metrics on your progress.

## FAQ

**Q: How long will this take to implement?**
A: Most people see initial results within 2-4 weeks, with significant improvements visible within 8-12 weeks. The timeline depends on your starting point and how consistently you apply these strategies.

**Q: What if my workplace environment doesn't support this?**
A: Even in challenging environments, you have more agency than you might think. Start with small actions and build momentum. If the environment truly prevents progress, it might be time to consider other opportunities.

**Q: How does this apply specifically to Web3?**
A: Web3 organizations often have flatter hierarchies, more remote teams, and faster pace than traditional companies. This makes these skills even more critical for success.

**Q: Can I implement this alongside my current role?**
A: Absolutely. You don't need extra time-just intentionality in your current work. Integrate these practices into your daily activities.

**Q: What resources can help me go deeper?**
A: Check the related articles section below for deeper dives into specific aspects. Also consider finding a mentor who excels in this area.


