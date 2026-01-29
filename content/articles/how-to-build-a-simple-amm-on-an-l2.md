---


title: "How to Build a Simple AMM on an L2"
image: "https://images.unsplash.com/photo-1579567761406-4684ee0c75b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMXx8dGVjaHxlbnwwfHx8fDE3NTQ5NTU3OTJ8MA&lib=rb-4.1.0&q=80&w=1080"
data-ai-hint: "decentralized exchange crypto"
description: "A practical guide for developers on how to build a basic Automated Market Maker (AMM) style DEX on a Layer 2 network like Arbitrum or Optimism."
category: "Technology Deep Dives"

---



Automated Market Makers (AMMs) like Uniswap are one of the foundational pillars of Decentralized Finance (DeFi). They allow users to trade assets in a permissionless way by trading against a pool of tokens rather than a traditional order book.

Building your own AMM is a rite of passage for many DeFi developers. It's a challenging project that demonstrates a deep understanding of Solidity, the EVM, and core DeFi concepts. This guide will walk through the high-level steps and code structure for building a very simple AMM on a Layer 2 network.

### Why Build on a Layer 2?

Building on an L2 like Arbitrum, Optimism, or Base is now the standard for modern dApps. The low gas fees are essential for an AMM, where users may perform multiple swaps. The developer experience is nearly identical to Ethereum, so the skills are directly transferable.

### The Core Concept: The `x * y = k` Formula

The heart of a simple AMM is the constant product formula: `x * y = k`.

*   `x`: The amount of Token A in the liquidity pool.
*   `y`: The amount of Token B in the liquidity pool.
*   `k`: A constant value.

When a user wants to trade, they add some of Token A to the pool and remove some of Token B. To keep `k` constant, the price of the tokens changes based on the new ratio of `x` and `y`. This elegant formula is all we need to create a decentralized exchange.

### Step 1: The Smart Contract (`SimpleAMM.sol`)

Let's outline the structure of our smart contract. We'll need two ERC-20 tokens to trade. For this example, let's assume we have two tokens, `TokenA` and `TokenB`.

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
