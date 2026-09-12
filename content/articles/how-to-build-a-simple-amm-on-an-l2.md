---
title: How to Build a Simple AMM on an L2
image: >-
  https://images.unsplash.com/photo-1579567761406-4684ee0c75b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMXx8dGVjaHxlbnwwfHx8fDE3NTQ5NTU3OTJ8MA&lib=rb-4.1.0&q=80&w=1080
data-ai-hint: decentralized exchange crypto
description: >-
  A technical guide to a minimal constant-product AMM on an EVM Layer 2,
  including liquidity accounting, swap math, tests, security limits, and deployment risks.
category: Technology Deep Dives
publishedDate: '2026-03-11'
lastUpdated: '2026-09-12'
---

An automated market maker (AMM) is a smart contract that quotes a trade from token balances held in a pool rather than matching orders. This guide builds the smallest useful version: one pool for two standard ERC-20 tokens, fungible liquidity shares, and a fixed swap fee. It is for Solidity developers who want to understand the accounting before using an established protocol.

The model is educational, not a production DEX. A public pool is exposed to price manipulation, sandwiching, malicious tokens, operational mistakes, and loss for liquidity providers when relative prices move. Established implementations have years of review and battle testing; deploying this example with valuable funds would be unsafe. The [Uniswap v2 whitepaper](https://uniswap.org/whitepaper.pdf) and its [core contracts](https://github.com/Uniswap/v2-core) are the appropriate reference point for a production design.

## The Constant-Product Model

Let `x` be the reserve of token A and `y` the reserve of token B. A constant-product pool uses the invariant:

```text
x * y = k
```

For a fee-free trade that sends `dx` token A in, the largest possible output is:

```text
dy = y - (x * y) / (x + dx)
```

The marginal price of A in B changes as the trade moves the reserves. It is approximately `y / x` before a small trade, but a larger trade receives a worse average price. That difference is price impact, not merely a user-interface quote. A pool cannot create liquidity: a small reserve relative to trade size produces large slippage.

With a 0.30% fee, only `dx * 997 / 1000` is used to calculate output:

```text
amountInWithFee = amountIn * 997
amountOut = reserveOut * amountInWithFee /
            (reserveIn * 1000 + amountInWithFee)
```

The contract receives the full input. The difference stays in reserves, so the product after a successful swap is greater than or equal to the old product when measured with the actual balances. That is how this simple fee accrues to LPs. The fee formula and invariant check are derived from the [Uniswap v2 pair implementation](https://github.com/Uniswap/v2-core/blob/master/contracts/UniswapV2Pair.sol), although this article intentionally omits its factory, oracle accumulators, flash swaps, and protocol-fee machinery.

Integer division rounds down. The contract must reject a zero output and callers must supply their own minimum acceptable output. A quote alone is not a guarantee: pool state can change between a frontend quote and transaction execution.

## Pool Scope and Assumptions

Keep the first contract narrow. Accept exactly two distinct token addresses at construction. Use only normal ERC-20 tokens for a learning deployment: no fee-on-transfer, rebasing, callback, or ERC-777-style behavior. The ERC-20 standard defines `transfer`, `transferFrom`, balances, allowances, and their return values in [EIP-20](https://eips.ethereum.org/EIPS/eip-20); it does not promise that every token follows the simple balance-change assumptions an AMM needs.

Token ordering also matters. Store `token0` and `token1` in a deterministic order, such as ascending address order, and reject a duplicate pair. A factory normally enforces one pool per pair and deterministic addresses. For one tutorial pool, the constructor can do the ordering. Do not let a user select the output token independently of the input; derive it from the pair so a swap cannot accidentally transfer an arbitrary asset.

Track reserves separately and update them after every state-changing operation. For plain ERC-20s, reserve variables should match on-chain `balanceOf(address(this))`. In tests, assert that relationship. In a production-like implementation, calculate the actual input as the observed post-transfer balance minus the stored reserve. This is the pattern that lets Uniswap v2 support certain fee-on-transfer input tokens, but it still does not make every unusual token safe.

## Liquidity Shares and Initial Price

LP shares represent a pro-rata claim on both reserves. If total shares are `S`, a withdrawal of `s` shares returns:

```text
amount0 = s * reserve0 / S
amount1 = s * reserve1 / S
```

The first deposit chooses the initial ratio, and therefore the pool's initial implied price. That is a serious responsibility. If token A has an external price of 1,000 token B but the initializer deposits 1 A and 100 B, arbitrageurs can trade against the pool until its price approaches other markets. The initializer, not the contract, pays for that error.

For the initial deposit, mint shares proportional to `sqrt(amount0 * amount1)`, not an arbitrary number. The geometric mean treats the two sides symmetrically and is the conventional constant-product approach. Permanently lock a small minimum number of shares at an irrecoverable address so the pool cannot be reset to a new price after all ordinary liquidity is removed. Uniswap v2 calls this `MINIMUM_LIQUIDITY`; see its [`mint` function](https://github.com/Uniswap/v2-core/blob/master/contracts/UniswapV2Pair.sol#L109-L131).

For later deposits, mint the smaller proportional amount:

```text
shares = min(amount0 * S / reserve0, amount1 * S / reserve1)
```

The smaller side is limiting. A minimal contract should require callers to supply exactly the current reserve ratio, or it should refund the excess. Pulling both requested amounts and minting only against the smaller side gives a donor worse economics and is a bug. A router can calculate optimal amounts before calling the pool; the core pool should make its policy explicit.

## A Minimal Contract Shape

Use audited primitives rather than hand-written token-call wrappers. OpenZeppelin's [`SafeERC20`](https://docs.openzeppelin.com/contracts/5.x/api/token/erc20#SafeERC20) handles ERC-20s that return no boolean, and [`ReentrancyGuard`](https://docs.openzeppelin.com/contracts/5.x/api/utils#ReentrancyGuard) provides a simple guard for externally callable state transitions. The following is deliberately a shape, not copy-and-deploy code. It omits the share token implementation and uses `balanceOf` only to illustrate checks.

```solidity
uint256 public constant FEE_NUMERATOR = 997;
uint256 public constant FEE_DENOMINATOR = 1000;
uint256 public constant MINIMUM_LIQUIDITY = 1_000;

IERC20 public immutable token0;
IERC20 public immutable token1;
uint112 private reserve0;
uint112 private reserve1;

function swap(uint256 amount0Out, uint256 amount1Out, address to)
    external
    nonReentrant
{
    require(amount0Out > 0 || amount1Out > 0, "zero output");
    (uint112 r0, uint112 r1) = (reserve0, reserve1);
    require(amount0Out < r0 && amount1Out < r1, "insufficient liquidity");
    require(to != address(token0) && to != address(token1), "bad recipient");

    if (amount0Out > 0) token0.safeTransfer(to, amount0Out);
    if (amount1Out > 0) token1.safeTransfer(to, amount1Out);

    uint256 balance0 = token0.balanceOf(address(this));
    uint256 balance1 = token1.balanceOf(address(this));
    uint256 amount0In = balance0 > r0 - amount0Out
        ? balance0 - (r0 - amount0Out) : 0;
    uint256 amount1In = balance1 > r1 - amount1Out
        ? balance1 - (r1 - amount1Out) : 0;
    require(amount0In > 0 || amount1In > 0, "zero input");

    uint256 adjusted0 = balance0 * FEE_DENOMINATOR - amount0In * 3;
    uint256 adjusted1 = balance1 * FEE_DENOMINATOR - amount1In * 3;
    require(adjusted0 * adjusted1 >=
        uint256(r0) * r1 * FEE_DENOMINATOR ** 2, "K");
    _update(balance0, balance1);
}
```

This is a "send input, then call swap" interface. It demonstrates why a real router is useful: it transfers the input, computes `amountOut` from current reserves, checks the user's `amountOutMin`, then calls the pair atomically. A friendlier single-call pool API can instead call `safeTransferFrom` first, observe balances, and calculate output internally. In either design, include `deadline` and `amountOutMin` parameters at the user-facing boundary. A deadline prevents a signed transaction from remaining valid indefinitely; a minimum output limits execution at a price worse than the caller accepted.

The invariant check must use balances after outputs and inputs, rather than trusting an `amountIn` argument. The checks-effects-interactions ordering above reduces the reentrancy surface, but it is not a substitute for the guard or a token allowlist. Solidity's security guidance explains the [checks-effects-interactions pattern](https://docs.soliditylang.org/en/latest/security-considerations.html#use-the-checks-effects-interactions-pattern) and cautions that external calls can transfer control.

Use `uint256` for intermediate math. A production pair may pack reserves into `uint112` after enforcing bounds, but a tutorial should not silently truncate balances. Solidity 0.8 checks arithmetic overflow by default, yet overflow protection does not validate economic assumptions, decimal conversions, or a wrong reserve ratio.

## Tests That Establish the Accounting

Test behavior and invariants, not only individual happy paths. Foundry supports Solidity tests, fuzzing, invariant tests, and fork tests; its [testing documentation](https://getfoundry.sh/forge/tests/overview/) describes the available test types. Hardhat can provide the same coverage with TypeScript tests. Use local mock ERC-20s with different decimals, but keep all AMM arithmetic in raw token units. The contract does not need to normalize 6-decimal USDC and 18-decimal WETH; its frontend quote formatting does.

Start with deterministic tests:

- Constructor rejects zero addresses, identical tokens, and incorrect ordering if ordering is part of the interface.
- The first deposit mints `sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY` shares to the LP and locks the minimum shares.
- A proportional second deposit mints the expected shares. A non-proportional deposit reverts or refunds its excess according to the documented policy.
- Burning shares returns the LP's pro-rata assets, decreases total supply, and cannot burn more than the sender owns.
- A quoted A-to-B swap transfers the input and output, emits an event, keeps output below the old output reserve, and updates reserves to actual balances.
- The reverse direction works, zero amounts revert, and an output at or above reserves reverts.
- A swap with the fee disabled in a dedicated test configuration preserves the invariant subject to rounding; with the configured fee, the effective invariant does not decrease.

Then fuzz. Generate nonzero reserves, inputs, and LP share amounts inside bounded ranges. Assert no reserve underflows, users cannot receive more than the pool can pay, and the share supply remains consistent with balances. Invariant tests should run arbitrary sequences of deposits, swaps, withdrawals, and `sync`-like balance updates, then assert `reserve0 == token0.balanceOf(address(pool))` and the pool owns enough assets to honor every outstanding share pro rata. Include a hostile token mock that reenters a public function and verify the guard blocks it.

Test a fork only after unit tests pass. Fork tests reveal real token quirks and RPC behavior, but they are not a security audit. Add static analysis such as [Slither](https://github.com/crytic/slither) to CI, run a compiler version pinned in `foundry.toml` or your lockfile, and require a human review of the deployed bytecode and constructor arguments.

## Security and Economic Risks

Reentrancy is only one failure mode. Do not add arbitrary external callbacks, upgrade hooks, or owner withdrawal functions to a pool without a concrete design and review. If the pool has an owner, minimize its powers, put changes behind a timelock, and document whether the owner can change fees, pause swaps, or recover tokens. A privileged key is part of the protocol's threat model.

Do not use a spot AMM price as a price oracle for lending, collateral, liquidation, or settlement. An attacker can move the pool price within one transaction, consume the downstream protocol's bad quote, and restore the pool with a flash loan. Uniswap v2's [oracle guide](https://docs.uniswap.org/contracts/v2/concepts/core-concepts/oracles) describes cumulative-price time-weighted average prices (TWAPs) and their trade-offs. A TWAP can make manipulation more expensive but does not make a thin or newly created pool trustworthy. For high-value decisions, use a well-designed oracle system with freshness, liquidity, and deviation checks, such as [Chainlink Data Feeds](https://docs.chain.link/data-feeds).

Public mempools expose swaps before inclusion. Searchers can sandwich a user by buying before the user and selling after them, leaving the user with a worse execution price. `amountOutMin` is mandatory but does not eliminate the attack; loose tolerance still permits harmful execution. Private transaction submission can change visibility, but it introduces relay and builder trust assumptions. Users should set a narrow, realistic slippage limit and applications should show price impact separately from the fee.

LPs face adverse selection. When an external price moves, arbitrage trades rebalance the pool and LPs end with relatively more of the asset that fell and less of the asset that rose. Swap fees may or may not offset that outcome. This is an economic property of constant-product liquidity, not a Solidity defect.

## Deploying on an EVM L2

Arbitrum, OP Mainnet, and Base are EVM-compatible, so the Solidity contract and standard tooling are familiar. Compatibility does not make deployments identical to Ethereum. Select the exact chain ID, RPC provider, block explorer, native gas token, canonical token address, and bridge route before compiling. Never accept a token symbol as identity; use a verified address from the token issuer or the chain's authoritative documentation.

Deploy first to the chain's current testnet and record the immutable constructor arguments. Optimism's [network documentation](https://docs.optimism.io/chain/networks) lists supported networks and chain IDs; Arbitrum publishes its [chain information](https://docs.arbitrum.io/for-devs/dev-tools-and-resources/chain-info). Treat third-party RPC endpoints as infrastructure dependencies: configure retries and monitoring, but do not let a frontend silently fall back to a different chain.

An L2 transaction is cheaper than an L1 transaction, not free. OP Stack chains charge execution and L1-data components, described in the [OP Stack fee documentation](https://docs.optimism.io/stack/transactions/fees). Users also need a bridge path for assets and enough native gas token for transactions. Display the chain name and wallet network explicitly, and reject calls when `block.chainid` is not a supported deployment.

Before a mainnet deployment, verify source code on the chain explorer, publish the compiler settings and commit hash, transfer a small amount through each operation, and monitor `Swap`, `Mint`, `Burn`, and reserve-update events. Set a circuit-breaker policy before an incident: who can pause, what evidence is required, how the action is announced, and whether withdrawals remain available. A pause can reduce further damage but cannot repair an incorrect invariant or compensate users.

## Practical Next Steps

Build the pool only after writing the math tests. Add a router with `amountOutMin`, `amountInMax`, and deadlines, then a frontend that obtains a fresh quote immediately before signing. Test the entire path on the target L2 testnet with the exact token contracts and wallet flow. If the goal is a user-facing exchange rather than a learning project, integrate an audited AMM protocol or obtain an independent smart-contract audit and an economic review before accepting deposits.

## FAQ

### Is `x * y = k` exactly constant after charging a fee?

No. The fee is retained in the pool, so the raw balance product generally increases after a swap. The invariant calculation applies the fee adjustment to the input side to ensure the trader did not receive too much output.

### Can the pool support any ERC-20?

No. Fee-on-transfer, rebasing, paused, blacklisting, callback-enabled, and nonstandard tokens can break assumptions or produce unexpected outcomes. Start with specifically approved, conventional tokens and test every supported asset.

### Does deploying on an L2 prevent MEV?

No. Transaction ordering and price manipulation remain possible on L2s. Execution environments and sequencing differ by chain, but users still need minimum-output protection and protocols still need manipulation-resistant oracle design.
