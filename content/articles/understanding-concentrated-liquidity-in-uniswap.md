---
title: Understanding Concentrated Liquidity in Uniswap v3
description: A rigorous mathematical and architectural guide to Uniswap v3 concentrated liquidity, virtual reserves, discrete tick spaces, and LVR dynamics.
category: Educational
data-ai-hint: concentrated liquidity
publishedDate: '2026-03-11'
lastUpdated: "2026-09-07"
image: /images/articles/charts/concentrated-liquidity-tick-math.svg
---

Decentralized automated market makers transformed digital asset trading by replacing centralized limit order books with continuous liquidity pools governed by algorithmic bonding curves. In early protocols such as [Uniswap v2](https://uniswap.org), liquidity providers supplied equal values of two tokens to satisfy the constant product formula $x \cdot y = k$. While mathematically elegant and passive, this architecture suffered from profound capital inefficiency: liquidity was distributed uniformly across all possible price points from zero to infinity.

Uniswap v3 revolutionized decentralized finance by introducing concentrated liquidity, formalized in the canonical [Uniswap v3 Core Whitepaper](https://uniswap.org/whitepaper-v3.pdf) and implemented in the open-source [Uniswap v3 Core Contracts](https://github.com/Uniswap/v3-core) and [Periphery Contracts](https://github.com/Uniswap/v3-periphery) documented at [Uniswap Developer Docs](https://docs.uniswap.org/). Instead of spreading capital across an infinite price continuum, liquidity providers can allocate their assets within discrete, customizable price intervals. 

This architectural paradigm unlocked unprecedented capital efficiency, enabling market makers to replicate the market depth of massive liquidity pools using a fraction of the underlying capital. However, concentrated liquidity fundamentally altered the risk-reward profile of automated market making, converting passive liquidity provision into an active game of tick management, Loss Versus Rebalancing (LVR), and just-in-time MEV dynamics.

---

## The Mathematical Model of Concentrated Liquidity

To understand concentrated liquidity, one must examine how virtual reserves modify the standard constant product invariant. In Uniswap v2, the bonding curve represents a continuous hyperbola where reserves $x$ and $y$ asymptote to zero only as the price approaches infinity or zero:

$$x \cdot y = k = L^2$$

In this equation, $L$ represents the liquidity parameter, defined as the geometric mean of token reserves: $L = \sqrt{x \cdot y}$. Because trades can theoretically occur at any price between $0$ and $\infty$, the vast majority of the deposited capital sits idle in reserve bands that the market never touches. For instance, in a stablecoin pool where the price fluctuates within a narrow band around one dollar, over 99.5% of capital deposited in a v2-style pool remains unused.

![Concentrated Liquidity Tick Math](/images/articles/charts/concentrated-liquidity-tick-math.svg)

### The Virtual Reserves Formulation

Uniswap v3 solves this inefficiency by allowing a position to operate along a virtual constant product curve bounded between an arbitrary lower price boundary $p_a$ and an upper price boundary $p_b$, where $0 < p_a < p_b < \infty$.

The position behaves exactly as if it were a standard constant product pool with virtual reserves $x_{virtual}$ and $y_{virtual}$, governed by:

$$\left(x + \frac{L}{\sqrt{p_b}}\right) \cdot \left(y + L \sqrt{p_a}\right) = L^2$$

Here, $x$ and $y$ represent the actual, real token balances deposited by the liquidity provider. The real balances are related to the virtual balances by constant horizontal and vertical offsets determined by the price bounds:

$$x_{virtual} = x + \frac{L}{\sqrt{p_b}}$$

$$y_{virtual} = y + L \sqrt{p_a}$$

When the current pool price $p$ lies strictly within the position's designated price interval, $p \in [p_a, p_b]$, the real token balances required to support liquidity $L$ are derived analytically:

$$x = L \cdot \left( \frac{1}{\sqrt{p}} - \frac{1}{\sqrt{p_b}} \right)$$

$$y = L \cdot \left( \sqrt{p} - \sqrt{p_a} \right)$$

### Boundary Conditions and Range Exits

The behavior of real reserves as the market price crosses the interval boundaries demonstrates how concentrated liquidity operates:

1. Price at Lower Bound ($p \le p_a$): When the market price drops to or below the lower bound $p_a$, the real balance of token $y$ reaches zero, and the position consists entirely of token $x$. The required balance of token $x$ reaches its maximum:

$$x_{max} = L \cdot \left( \frac{1}{\sqrt{p_a}} - \frac{1}{\sqrt{p_b}} \right), \quad y = 0$$

2. Price at Upper Bound ($p \ge p_b$): Conversely, when the market price rises to or above the upper bound $p_b$, the real balance of token $x$ is completely depleted, and the position is 100% composed of token $y$:

$$x = 0, \quad y_{max} = L \cdot \left( \sqrt{p_b} - \sqrt{p_a} \right)$$

If the market price exits the $[p_a, p_b]$ boundary on either side, the position becomes completely inactive. It ceases to execute trades, contributes zero market depth to the current price, and earns zero trading fees until the market price returns inside the specified bounds or the liquidity provider removes and redeploys capital.

---

## Capital Efficiency Multiplier

The primary economic incentive for concentrating liquidity is the capital efficiency multiplier. The capital efficiency gain represents how much less capital a liquidity provider must deposit in a concentrated position $[p_a, p_b]$ to achieve the same liquidity depth $L$ as a full-range position spanning $(0, \infty)$.

Consider a position placed symmetrically around the current market price $p$, with bounds defined by a fractional range factor $r > 1$ such that $p_a = p / r$ and $p_b = p \cdot r$. The capital efficiency multiplier $E$ is calculated as:

$$E = \frac{1}{1 - \frac{1}{\sqrt{r}}} = \frac{1}{1 - \left(\frac{p_a}{p_b}\right)^{1/4}}$$

### Quantitative Efficiency Scenarios

The table below demonstrates how narrowing the price boundaries amplifies capital efficiency:

```
+-----------------------------------------------------------------------+
|            UNISWAP V3 CAPITAL EFFICIENCY MULTIPLIER                   |
+-------------------+--------------------+------------------------------+
| Price Range (r)   | Boundary [pa, pb]  | Capital Efficiency Multiplier|
+-------------------+--------------------+------------------------------+
| Full Range        | (0, infinity)      | 1.0x (Baseline v2)           |
| +/- 50%           | [0.50p, 2.00p]     | 3.41x                        |
| +/- 20%           | [0.80p, 1.25p]     | 9.48x                        |
| +/- 10%           | [0.90p, 1.11p]     | 19.49x                       |
| +/- 5%            | [0.95p, 1.05p]     | 39.49x                       |
| +/- 2%            | [0.98p, 1.02p]     | 99.49x                       |
| +/- 0.5%          | [0.995p, 1.005p]   | 399.50x                      |
| +/- 0.1%          | [0.999p, 1.001p]   | 1,999.50x                    |
+-------------------+--------------------+------------------------------+
```

For stablecoin trading pairs like USDC/USDT or pegged assets like wstETH/ETH where prices trade within tightly bounded ranges (involving liquid staking protocols like [Lido](https://docs.lido.fi/), [Rocket Pool](https://docs.rocketpool.net/), and restaking architectures like [EigenLayer](https://docs.eigenlayer.xyz/)), liquidity providers can concentrate capital within 0.1% or 0.05% bands. This achieves between 2,000x and 4,000x higher capital efficiency than Uniswap v2. 

Traders benefit from substantially lower slippage and minimal price impact, while liquidity providers earn elevated fee yields on their deployed assets.

---

## Discrete Tick Spaces and Bitmap Architecture

To implement concentrated liquidity on the Ethereum Virtual Machine efficiently, Uniswap v3 cannot allow arbitrary floating-point price boundaries. Doing so would require continuous integration and unbounded gas consumption to determine which positions are active at any given price point.

Instead, Uniswap v3 discretizes the continuous price spectrum into an array of discrete price boundaries known as ticks.

```
+-----------------------------------------------------------------------+
|                    UNISWAP V3 DISCRETE TICK SPACES                    |
+-----------------------------------------------------------------------+
|                                                                       |
|   ... |  Tick i-1  |   Tick i   |  Tick i+1  |  Tick i+2  | ...       |
|       |            |     *      |            |            |           |
|   ----+------------+-----+------+------------+------------+---->      |
|       p(i-1)       p(i)  Price  p(i+1)       p(i+2)                   |
|                                                                       |
|   Discrete Price Formula:  p(i) = 1.0001^i                            |
|   Tick Spacing by Tier:    0.01% fee -> 1 tick spacing                |
|                            0.05% fee -> 10 tick spacing               |
|                            0.30% fee -> 60 tick spacing               |
|                            1.00% fee -> 200 tick spacing              |
+-----------------------------------------------------------------------+
```

### The 1.0001 Logarithmic Price Base

The price $p$ at integer tick index $i$ is defined by:

$$p(i) = 1.0001^i$$

The constant $1.0001$ was selected because each single tick step corresponds to a price movement of exactly one basis point (0.01% or 1/10,000th of the price):

$$\frac{p(i+1) - p(i)}{p(i)} = \frac{1.0001^{i+1} - 1.0001^i}{1.0001^i} = 1.0001 - 1 = 0.0001 = 0.01\%$$

Because prices are tracked internally using the square root of price $\sqrt{p}$ represented as a fixed-point `Q64.96` binary number, the relationship becomes:

$$\sqrt{p(i)} = 1.0001^{i/2}$$

### Tick Spacing and Fee Tiers

While every integer tick represents one basis point, allowing positions to be initialized at every individual tick would increase gas costs when large trades cross multiple ticks. Therefore, Uniswap v3 enforces tick spacing based on the pool fee tier:

1. 0.01% Fee Tier (Stablecoins): Tick spacing is 1. Positions can be initialized at every tick, providing maximum granularity for tightly pegged assets.
2. 0.05% Fee Tier (Correlated and High-Volume Pairs): Tick spacing is 10. Positions can only be initialized at ticks divisible by 10 (every 10 basis points).
3. 0.30% Fee Tier (Standard Volatile Pairs): Tick spacing is 60. Positions can only be initialized at ticks divisible by 60 (approximately 0.6% price intervals).
4. 1.00% Fee Tier (Exotic and High-Volatility Pairs): Tick spacing is 200. Positions can only be initialized at ticks divisible by 200 (approximately 2.0% price intervals).

### O(1) Gas Complexity via TickBitmap.sol

When a large swap consumes all liquidity at the current tick, the contract must locate the next initialized tick where liquidity exists. Iterating sequentially through empty ticks in a for-loop would consume prohibitive gas, potentially causing transactions to fail due to block gas limits.

Uniswap v3 solves this through [`TickBitmap.sol`](https://github.com/Uniswap/v3-core/blob/main/contracts/libraries/TickBitmap.sol), supported by arithmetic libraries including [`BitMath.sol`](https://github.com/Uniswap/v3-core/blob/main/contracts/libraries/BitMath.sol), [`FullMath.sol`](https://github.com/Uniswap/v3-core/blob/main/contracts/libraries/FullMath.sol), and [`SqrtPriceMath.sol`](https://github.com/Uniswap/v3-core/blob/main/contracts/libraries/SqrtPriceMath.sol). The contract groups ticks into 256-bit words. Each bit in a word represents an initialized tick: a bit value of `1` indicates that at least one position has a boundary at that tick, while `0` indicates no positions are referenced there.

Conforming to memory and execution rules in the [Solidity Language Specification](https://docs.soliditylang.org/) and [Ethereum Yellow Paper](https://ethereum.github.io/yellowpaper/paper.pdf) (and optimizing state transitions with [EIP-1153 Transient Storage](https://eips.ethereum.org/EIPS/eip-1153)), using EVM bitwise operations and assembly opcodes such as `byte`, `shl`, `shr`, and lookup algorithms for most significant bit (`mostSignificantBit`) and least significant bit (`leastSignificantBit`), the contract locates the next active tick in constant $O(1)$ gas complexity, independent of the distance between populated ticks.

---

## Global Fee Accumulators and O(1) Fee Growth

In Uniswap v2, distributing fees was simple: fees were accumulated directly into the pool reserves, causing the value of each fungible LP token to appreciate monotonically. 

In Uniswap v3, this model is impossible because different liquidity providers own distinct, non-fungible price ranges. If fee collection required updating every active position during each swap, decentralized automated market making would become economically unviable.

Uniswap v3 resolves this by tracking global fee growth per unit of liquidity ($feeGrowthGlobal$) and recording the fee growth outside each initialized tick ($feeGrowthOutside$).

### Fee Growth Inside a Range

For any price range defined by lower tick $t_a$ and upper tick $t_b$, the total fee growth earned per unit of liquidity inside that range since its creation ($feeGrowthInside$) is computed analytically in $O(1)$ time by subtracting the fee growth outside the range from the global total:

$$feeGrowthInside = feeGrowthGlobal - feeGrowthBelow(t_a) - feeGrowthAbove(t_b)$$

The values for $feeGrowthBelow$ and $feeGrowthAbove$ are computed dynamically by checking whether the current tick $t_c$ is currently above or below the boundary ticks:

- If $t_c \ge t$: $feeGrowthBelow(t) = feeGrowthOutside(t)$
- If $t_c < t$: $feeGrowthBelow(t) = feeGrowthGlobal - feeGrowthOutside(t)$

When a liquidity provider collects fees or modifies a position, the contract multiplies $feeGrowthInside$ by the position's liquidity $L$ and subtracts previous checkpoints. This enables zero-loop fee accounting regardless of trading frequency.

---

## Non-Fungible Positions (ERC-721)

Because each liquidity position in Uniswap v3 possesses unique parameters (lower tick, upper tick, fee tier, and liquidity quantity), LP positions cannot be represented by standard fungible ERC-20 tokens.

Uniswap v3 encapsulates liquidity positions inside an [ERC-721](https://eips.ethereum.org/EIPS/eip-721) non-fungible token contract called [`NonfungiblePositionManager.sol`](https://github.com/Uniswap/v3-periphery/blob/main/contracts/NonfungiblePositionManager.sol), managing underlying [ERC-20](https://eips.ethereum.org/EIPS/eip-20) token pairs and utilizing audited library routines from [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/). 

Each minted NFT represents ownership of a specific liquidity position with custom range bounds. The NFT metadata encodes:
- Token 0 and Token 1 addresses
- Pool fee tier
- Lower tick index and upper tick index
- Liquidity parameter $L$
- Fee growth checkpoint values
- Unclaimed token fees

This tokenization enables liquidity positions to be transferred, used as collateral in lending protocols such as [Aave](https://aave.com) or [Compound](https://compound.finance), and managed by automated vaults compliant with the [ERC-4626 Tokenized Vault Standard](https://eips.ethereum.org/EIPS/eip-4626) like those built by [Yearn Finance](https://docs.yearn.fi/) and [Frax Finance](https://docs.frax.finance/).

---

## Loss Versus Rebalancing (LVR) and Impermanent Loss Amplification

While concentrated liquidity magnifies fee earnings, it equally magnifies impermanent loss. In academic literature formalized by Tim Roughgarden, Jason Milionis, Ciamac Moallemi, and Andrea Canidio in [Automated Market Making and Loss Versus Rebalancing](https://arxiv.org/abs/2208.06046) and [Quantifying LVR in Automated Market Makers](https://arxiv.org/abs/2210.10601) alongside [Paradigm Research](https://www.paradigm.xyz/research), the risk of automated market making is defined through Loss Versus Rebalancing (LVR).

LVR measures the difference in value between an automated market maker position and an actively rebalanced portfolio with identical market risk on an external reference exchange. LVR isolates the adverse selection cost that liquidity providers pay to toxic order flow and latency arbitrageurs.

```
+-----------------------------------------------------------------------+
|                    LVR AND ADVERSE SELECTION IN AMMS                  |
+-----------------------------------------------------------------------+
|                                                                       |
|  [External Market Price Moves (Binance/Coinbase)]                     |
|                           |                                           |
|                           v                                           |
|  [Latency Arbitrageurs / MEV Searchers]                               |
|                           |                                           |
|                           v (Front-runs retail trades in block)       |
|  [Uniswap v3 Pool Stale Tick Price]                                   |
|                           |                                           |
|                           v                                           |
|  [Extracts Stale Value: LPs Buy Depreciating / Sell Appreciating]     |
+-----------------------------------------------------------------------+
```

### Divergence Loss Amplification

In a concentrated position $[p_a, p_b]$, if the price drops below $p_a$, the LP's position is entirely converted into the depreciating asset at its local peak value, suffering substantially larger percentage losses than a full-range v2 LP. 

If the market price moves out of range and does not return, the LP has effectively bought the falling asset on margin without a stop-loss mechanism. Studies on Ethereum mainnet liquidity provision have shown that for high-volatility pairs, the cumulative losses from LVR and adverse selection frequently exceed the fee revenue earned by retail liquidity providers.

---

## Just-In-Time (JIT) Liquidity and MEV

Concentrated liquidity introduced a novel form of maximal extractable value known as Just-In-Time (JIT) liquidity. 

Because liquidity can be minted and burned within the same Ethereum block, sophisticated MEV searchers monitor the transaction mempool or private order flow via [Flashbots](https://docs.flashbots.net/) (employing tools like [Flashbots Protect](https://docs.flashbots.net/flashbots-protect/overview) and [MEV-Boost](https://boost.flashbots.net/)) for large, unshielded swap transactions.

### The JIT Attack Lifecycle

1. Detection: The searcher observes a pending swap (for example, a trader selling 500 ETH for USDC with 1% allowable slippage).
2. Front-Run Mint: The searcher submits a bundle to a block builder. The first transaction mints massive concentrated liquidity precisely in the single tick where the swap will execute.
3. Target Swap: The victim swap executes against the searcher's concentrated liquidity, paying the searcher over 95% of the transaction swap fee.
4. Back-Run Burn: Within the exact same block, the searcher's second transaction burns the liquidity position, collecting the swap fee and reclaiming the underlying assets.

JIT liquidity benefits the end-trader by reducing price impact and slippage. However, it extracts fee revenue from passive, long-term liquidity providers who bear market inventory risk without earning the corresponding trading fees.

---

## Active Liquidity Management Protocols

Due to the cognitive overhead, gas costs, and mathematical complexity of managing concentrated positions, a secondary ecosystem of active liquidity managers has emerged:

- [Arrakis Finance](https://docs.arrakis.finance/): Manages tokenized automated market making vaults that dynamically shift ranges to follow market trends.
- [Gamma Strategies](https://docs.gamma.xyz/): Implements quantitative algorithmic models to balance range width, fee capture, and divergence loss.
- [DefiEdge](https://docs.defiedge.io/): Enables decentralized asset managers to deploy customized trading strategies and rebalance tick ranges through non-custodial smart contracts.
- [Charm Finance](https://charm.fi/) and [Bunni](https://bunni.pro/): Pioneer concentrated liquidity tranche management and synthetic hook primitives.

These automated vaults wrap complex Uniswap v3 positions back into fungible ERC-20 tokens, restoring composability with decentralized lending markets and yield farming aggregators.

---

## Developer Implementation: Interacting with Uniswap v3 via Solidity

Interacting with Uniswap v3 programmatically involves calling the `NonfungiblePositionManager.sol` contract to mint, adjust, or burn positions. 

Tested using the [Foundry Framework](https://book.getfoundry.sh/) and [Hardhat](https://hardhat.org/), verified against security audits from [Trail of Bits](https://github.com/trailofbits/publications), [Certora Formal Verification](https://docs.certora.com/), and [ConsenSys Diligence](https://consensys.io/diligence/audits/), the following complete Solidity contract demonstrates how to mint a concentrated liquidity position with exact tick parameters, compatible with client libraries like [Ethers.js](https://docs.ethers.org/v6/), [Viem](https://viem.sh/), [Wagmi](https://wagmi.sh/), [RainbowKit](https://www.rainbowkit.com/), [MetaMask SDK](https://docs.metamask.io/), and [WalletConnect](https://docs.walletconnect.com/), monitored via [OpenZeppelin Defender](https://www.openzeppelin.com/defender), inspectable on [Etherscan](https://etherscan.io/):

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface INonfungiblePositionManager {
    struct MintParams {
        address token0;
        address token1;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        uint256 amount0Desired;
        uint256 amount1Desired;
        uint256 amount0Min;
        uint256 amount1Min;
        address recipient;
        uint256 deadline;
    }

    function mint(MintParams calldata params)
        external
        payable
        returns (
            uint256 tokenId,
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        );
}

interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

/// @notice Production router for minting concentrated liquidity positions in Uniswap v3
contract UniswapV3PositionManager {
    INonfungiblePositionManager public immutable positionManager;

    error DeadlinePassed();
    error InvalidTickRange();

    constructor(address _positionManager) {
        positionManager = INonfungiblePositionManager(_positionManager);
    }

    /// @notice Mints a new concentrated liquidity position
    /// @param token0 Address of the first token (sorted by address)
    /// @param token1 Address of the second token
    /// @param fee Tier fee in hundredths of a pip (e.g. 3000 = 0.3%)
    /// @param tickLower Lower tick boundary (must conform to tick spacing)
    /// @param tickUpper Upper tick boundary (must conform to tick spacing)
    /// @param amount0Desired Target deposit for token0
    /// @param amount1Desired Target deposit for token1
    /// @param deadline Unix timestamp deadline
    function mintPosition(
        address token0,
        address token1,
        uint24 fee,
        int24 tickLower,
        int24 tickUpper,
        uint256 amount0Desired,
        uint256 amount1Desired,
        uint256 deadline
    ) external returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1) {
        if (block.timestamp > deadline) revert DeadlinePassed();
        if (tickLower >= tickUpper) revert InvalidTickRange();

        // Pull tokens from caller into this router contract
        IERC20(token0).transferFrom(msg.sender, address(this), amount0Desired);
        IERC20(token1).transferFrom(msg.sender, address(this), amount1Desired);

        // Approve PositionManager to transfer assets
        IERC20(token0).approve(address(positionManager), amount0Desired);
        IERC20(token1).approve(address(positionManager), amount1Desired);

        // Configure mint parameters with 1% slippage protection
        INonfungiblePositionManager.MintParams memory params = INonfungiblePositionManager.MintParams({
            token0: token0,
            token1: token1,
            fee: fee,
            tickLower: tickLower,
            tickUpper: tickUpper,
            amount0Desired: amount0Desired,
            amount1Desired: amount1Desired,
            amount0Min: (amount0Desired * 99) / 100,
            amount1Min: (amount1Desired * 99) / 100,
            recipient: msg.sender,
            deadline: deadline
        });

        (tokenId, liquidity, amount0, amount1) = positionManager.mint(params);

        // Refund any residual unspent tokens back to user
        if (amount0Desired > amount0) {
            IERC20(token0).approve(address(positionManager), 0);
            IERC20(token0).transferFrom(address(this), msg.sender, amount0Desired - amount0);
        }
        if (amount1Desired > amount1) {
            IERC20(token1).approve(address(positionManager), 0);
            IERC20(token1).transferFrom(address(this), msg.sender, amount1Desired - amount1);
        }
    }
}
```

---

## Architectural Comparison: Uniswap v3 vs Curve vs Balancer

Decentralized exchanges have developed specialized invariants tailored for distinct asset dynamics:

```
+-----------------------------------------------------------------------------------+
|                        AMM ARCHITECTURAL COMPARISON                               |
+-----------+-----------------------+-------------------+---------------------------+
| Feature   | Uniswap v3            | Curve Finance     | Balancer v2               |
+-----------+-----------------------+-------------------+---------------------------+
| Invariant | Concentrated Virtual  | StableSwap &      | Constant Mean             |
| Model     | Reserves (Ticks)      | CryptoSwap Hybrid | Invariant (CMMM)          |
| LP Style  | Active range tuning   | Passive           | Passive portfolio weights |
| Asset Fit | High-volume volatile  | Strictly pegged & | Multi-token index funds   |
|           | pairs (ETH/USDC)      | correlated pairs  | (80/20, 60/40)            |
| Position  | ERC-721 NFT           | ERC-20 Pool Token | ERC-20 BPT                |
| Token     | (Unique Ranges)       | (Fungible)        | (Single Vault)            |
+-----------+-----------------------+-------------------+---------------------------+
```

While [Curve Finance](https://curve.fi) dominates stablecoins and [Balancer](https://balancer.fi) dominates multi-asset index portfolios, Uniswap v3 remains the benchmark for volatile token trading. 

DeFi architects and analytics platforms frequently evaluate Uniswap v3 metrics using on-chain oracle feeds from [Chainlink](https://chain.link) and query historical swap volumes via custom subgraphs on [The Graph](https://thegraph.com).

---
