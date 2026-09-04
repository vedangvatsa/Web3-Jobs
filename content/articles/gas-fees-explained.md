---
title: 'Gas Fees Explained: How Ethereum Fees Work and How to Pay Less'
image: /images/nasa-1lfI7wkGWZ4-unsplash.jpg
data-ai-hint: ethereum gas fees
description: >-
  What gas measures, how EIP-1559 sets base fee and tip, why fees spike, and
  what users and Solidity developers can do to cut costs - with current numbers
  and verified EVM costs.
category: Technology Deep Dives
publishedDate: '2026-03-11'
lastUpdated: '2026-09-04'
---
Gas is the unit that measures how much work Ethereum does for your transaction. You pay for that work in ETH, priced per unit of gas. When the network is busy, the price per unit rises. When it is quiet, it falls.

This guide explains what gas is, who needs to understand it, how the fee market works after EIP-1559, where the trade-offs are, and how users and developers can reduce what they pay.

## What gas is

Gas counts computation on the Ethereum Virtual Machine (EVM). Every opcode has a fixed gas cost. Simple math costs a few gas units. Reading and writing to chain storage costs thousands. Your total fee is gas used multiplied by the price you pay per unit.

Common examples, from ethereum.org/gas and ethereum.org/developers/docs/gas:

| Action | Gas used, typical | Notes |
| --- | --- | --- |
| Send ETH to another wallet | 21,000 | Fixed, defined in the Yellow Paper as TxGas |
| Send an ERC-20 token such as USDC | 45,000 - 65,000 | Calls a contract, so it costs more than a plain ETH transfer |
| Approve a token for a router | 45,000 - 50,000 | Writes an allowance slot |
| Swap on Uniswap v3 | 120,000 - 185,000 | ethereum.org lists 184,523 for a swap as an example |
| Mint one ERC-721 NFT | 100,000 - 300,000 | Depends on storage writes and extensions |
| Deploy a contract | 1,000,000 and up | Includes 32,000 CREATE cost plus code deposit costs |

These gas-used numbers do not change with ETH price. What changes is the price per unit, quoted in gwei. 1 gwei equals 0.000000001 ETH, or 1,000,000,000 wei. 1 ETH equals 1,000,000,000 gwei. Wallets quote gas price in gwei because gas per unit is a fraction of an ETH.

Two related terms matter:

- **gasUsed**: How many units your transaction actually consumed. Determined by the code path you executed.
- **gasLimit**: The maximum units you allow. You pay only for what you use, the rest is refunded. If you set the limit too low, the transaction fails and you still pay for work done up to the failure. If a contract reverts, you still pay for gas used.

## Who this guide is for

**Users who send ETH, swap, bridge, or mint.** If you have ever seen a wallet estimate of $2 and then $40 during a popular mint, you need to know why fees move and how to time or route transactions to save money.

**Solidity and dapp developers.** Your contract design directly sets gasUsed. Teams hiring for EVM roles screen for gas-aware patterns: minimizing storage writes, using the right data locations, and writing efficient errors and loops. Small choices compound across thousands of calls.

**Product and infrastructure teams.** Gas dictates UX. If a swap costs $15 on mainnet but $0.05 on a Layer 2, that changes where you deploy, how you batch, and how you sponsor fees.

If you only hold ETH and never transact, you can skip the detail. If you build or transact, you cannot.

## How gas fees work

### The base formula

Since August 2021, after EIP-1559, the fee you actually pay is:

```
fee = gasUsed * (baseFeePerGas + priorityFeePerGas)
```

Your wallet sets two caps:

- `maxFeePerGas`: The most you will pay per unit, base fee plus tip combined.
- `maxPriorityFeePerGas`: The most you will tip the validator per unit.

Validators receive only the tip. The base fee is burned, removed from circulation. If you set `maxFeePerGas` higher than the current base fee plus your tip, you are refunded the difference. See ethereum.org/developers/docs/gas and eips.ethereum.org/EIPS/eip-1559 for the full spec.

Example from ethereum.org: Jordan sends Taylor 1 ETH. The transaction needs 21,000 gas. The base fee is 10 gwei and Jordan adds a 2 gwei tip.

```
21,000 * (10 + 2) = 252,000 gwei = 0.000252 ETH
```

Taylor receives 1 ETH. Jordan pays 1.000252 ETH total. The validator gets 0.000042 ETH for the tip. The 0.00021 ETH base fee is burned.

Another case, closer to what you see when the network is busy: base 30 gwei, tip 2 gwei, Uniswap swap using 150,000 gas.

```
150,000 * 32 gwei = 4,800,000 gwei = 0.0048 ETH
```

At ETH around $3,000, that is about $14.40. The same swap during a spike with base 80 gwei would be near $38. That variation is all price per unit, not a change in gasUsed.

### Before EIP-1559

Before London, Ethereum used a first-price auction. You set a single `gasPrice` and validators picked the highest bidders. Wallets had to guess. Users routinely overpaid to avoid being stuck, and fees swung sharply with demand. EIP-1559 replaced that blind auction with a protocol-set base fee that moves predictably.

### After EIP-1559

EIP-1559 shipped with the London hard fork at block 12,965,000 on 5 August 2021 at 12:34 UTC, according to the Ethereum Foundation announcement and coverage at the time. The fork included EIP-1559, EIP-3198 for the BASEFEE opcode, EIP-3529 which reduced refunds, EIP-3541, and EIP-3554 which delayed the difficulty bomb.

Five mechanics define it now:

1. **Base fee is protocol-set and burned.** Every block has a base fee. Your transaction must cover it to be valid. When the block is built, that base fee is destroyed. It does not go to validators. Burning removes the incentive for validators to manipulate fees and offsets issuance. Trackers such as Etherscan and Ultrasound.money report about 4.6 million ETH burned between August 2021 and early 2026, even as net supply still rose slightly to around 120 to 121 million ETH by April 2026 after issuance to stakers continued.

2. **Base fee moves with demand, capped at 12.5 percent per block.** The protocol compares gas used in the previous block to the gas target, which is half the gas limit. If the previous block used more than the target, the base fee increases by up to 12.5 percent. If it used less, it decreases by up to 12.5 percent. Blocks can be up to twice the target size, so during a surge the base fee climbs exponentially and then falls when demand eases. This is why ethereum.org describes the base fee as the network trying to keep average block size at the target.

3. **Priority fee is a tip validators keep.** Validators receive only `priorityFeePerGas * gasUsed`. A transaction that pays only the base fee is valid but less attractive to include. During calm periods a tip of 1 to 2 gwei is often enough. During a congested mint or crash, users add more to be included sooner. Wallets now suggest this automatically, and you can still set it manually.

4. **maxFeePerGas protects you from overpaying.** You declare the highest total you accept. If the base fee falls before your transaction is included, you pay the lower effective price and get a refund for the unused allowance. If the base fee exceeds your maxFeePerGas, the transaction waits in the mempool.

5. **Target size is not the limit.** Ethereum can process roughly 15 to 30 simple transfers per second at layer 1. Each block has a target of half the limit. That slack lets the network absorb bursts without immediately rejecting transactions, but sustained demand still pushes the base fee up until some users wait.

### What storage actually costs in the EVM

Developers care most about storage because it dominates costs.

- Creating a new storage slot from zero to non-zero costs 20,000 gas for the SSTORE itself (SstoreSetGas), plus access costs if the slot is cold.
- Updating an existing non-zero slot to a different non-zero value costs 5,000 gas before Berlin-era adjustments. Since EIP-2929, the net is split into access plus write.
- Reading a slot with SLOAD costs 2,100 gas cold and 100 gas warm after EIP-2929. Cold means first touch of that address and slot in the transaction. Warm means you already touched it, so the client already loaded it.

EIP-2929 was part of the Berlin upgrade at block 12,244,000 on 15 April 2021. It raised SLOAD from 800 to 2,100 cold and *CALL and related state-access opcodes to 2,600 cold, with a 100 warm cost for repeats. The goal was to align gas with the real database work and close denial-of-service vectors where attackers crafted blocks heavy on state reads. EIP-2930 added optional access lists in the same fork so users could pre-declare addresses and slots they would touch.

Since then, execution specs price SSTORE as access cost plus write cost, with refunds when you clear or restore a slot. The net effect: patterns that do SLOAD then SSTORE on the same slot, like `counter += 1`, got slightly cheaper after Berlin, while isolated cold reads got more expensive. If you use hardcoded gas amounts with `transfer` and 2,300 gas stipends, EIP-2929 also broke some older patterns - which is why `transfer` and `send` are now discouraged.

These numbers come from EIP-2200, EIP-2929, and the go-ethereum protocol params (for example ColdSloadCostEIP2929 = 2,100, WarmStorageReadCostEIP2929 = 100).

### Other data locations

`calldata` is the read-only bytes sent with the transaction. External function arguments arrive in calldata. `memory` is a byte array created during execution and discarded after. Using `calldata` for external inputs avoids copying bytes into memory.

A simple copy from calldata to memory costs gas that grows with size. For one address or uint256 the difference is tiny. For arrays of 1,000 recipients the copy is material. Benchmarks with 1,000-address airdrops show `calldata` inputs saving around 200,000 gas, roughly 0.5 to 1 percent of a large batch, and the saving scales with input length. If you need to modify the array, copy it to memory. If you only read it, keep it as `calldata` and declare the function `external`.

## Pros and cons

### What the current design gets right

- **Predictable estimates.** Wallets can suggest `maxFeePerGas` and `maxPriorityFeePerGas` from the recent base fee instead of guessing a blind auction bid. Users see a clearer max cost.
- **DoS resistance.** Gas metering makes infinite loops economically impossible and prices state access closer to real client work after Berlin fixes.
- **Burn aligns fee payment with ETH.** Only ETH pays the base fee, and burning it offsets issuance. Between the Merge in September 2022, which cut daily issuance from about 13,000 ETH to about 1,700 ETH, and steady burn in early 2023, ETH was briefly net deflationary. That effect faded as Layer 2 moved activity off mainnet.
- **Layer 1 stays the settlement anchor.** Expensive mainnet fees fund validator security while high-volume activity moves to cheaper layers that still settle to Ethereum.

### What still hurts

- **Fees still spike.** When demand exceeds roughly 15 to 30 transactions per second, the base fee climbs 12.5 percent per block until users pause. A planned NFT drop, a token launch, a large airdrop claim, or a market sell-off can push a plain transfer from $0.50 to $20 or more for hours.
- **Tip still needed for speed.** To be included in the next block during spikes, you add a higher tip. The protocol does not guarantee inclusion time.
- **Mainnet is costly for small actions.** Deployments, frequent writes, and per-user storage are hard to justify on L1. A swap can still cost many dollars when ETH price is high.
- **Developer cliff.** Gas optimization helps but adds complexity and audit risk. An incorrect `unchecked` block or a bad packing choice can introduce bugs that cost more than the gas saved.

## How to pay less and build cheaper

### If you are a user

1. **Prefer a Layer 2 for routine actions.** Arbitrum, Optimism, Base, and zkSync Era post batches to Ethereum with compressed data and split the L1 cost across many L2 transactions. They are typically 10 to 100 times cheaper than mainnet. After the Dencun upgrade on 13 March 2024 at epoch 269,568, which activated EIP-4844 proto-danksharding, L2 fees fell further. EIP-4844 replaced expensive permanent calldata with temporary blobs that live about 18 days and are not stored forever. Reports from March 2024 showed Optimism median fees falling from about $1.40 to about $0.04, Base from about $1.50 to about $0.03, and Arbitrum and zkSync seeing 50 to 90 percent drops as they adopted blobs. By 2026, many L2 swaps and transfers settle for a few cents, though blobs can still get more expensive if blob space fills.

2. **Time your mainnet transactions.** Track live fees on Etherscan Gas Tracker or a similar estimator. Fees are often lowest on weekends and during off-peak US hours when fewer users compete for block space. If you are not in a rush, set a lower `maxFeePerGas` and let the transaction wait.

3. **Set fees explicitly.** In MetaMask and similar wallets, use advanced settings to set `maxFeePerGas` and `maxPriorityFeePerGas` instead of accepting a single gas price. Set a max base you are willing to pay. You will be refunded if the actual base fee is lower.

4. **Batch where possible.** Some apps let you approve and swap in one transaction, or mint several NFTs with ERC-721A for near the cost of one. Off-chain signatures followed by a single on-chain settlement also cut gas. Check if the dapp supports batch calls or permit signatures that avoid an extra approve transaction.

5. **Avoid failed transactions.** Set a safe gasLimit. A simple ETH transfer always needs 21,000. Contract calls vary - use your wallet's estimate plus a margin. Failed or reverted transactions still consume gas for work done.

### If you are a Solidity developer

These five patterns give the largest savings for the least risk. All are documented in the Solidity docs and Ethereum specs.

**1. Minimize storage writes. Cache in memory.**

Storage is the costliest access. Load once, work in memory, write once.

```solidity
// Costly: three SSTOREs
function bumpBad() external {
    count += 1;
    count *= 2;
    count -= 5;
}

// Cheaper: one SLOAD, one SSTORE
function bumpGood() external {
    uint256 c = count; // SLOAD, cold 2,100 or warm 100
    c += 1;
    c *= 2;
    c -= 5;
    count = c; // SSTORE once
}
```

**2. Pack storage variables.**

The EVM stores state in 32-byte slots. Two `uint128` values can share one slot if placed contiguously, but a `uint128` next to a `uint256` forces separate slots.

```solidity
// Inefficient: three slots
struct Bad { uint128 a; uint256 b; uint128 c; }

// Efficient: two slots, a and c packed
struct Good { uint128 a; uint128 c; uint256 b; }
```

This only helps storage. For memory or calldata variables, use `uint256` - the EVM works natively on 32-byte words, so smaller types there can cost more.

**3. Use calldata for read-only external inputs.**

```solidity
// Copies bytes into memory
function processBad(string memory data) external { }

// Reads directly from the transaction bytes
function processGood(string calldata data) external { }
```

For dynamic types like `bytes`, `string`, and arrays, `calldata` avoids a copy. It is read-only, so you cannot modify it without copying to memory. Use it when you read and do not mutate.

**4. Use custom errors instead of string requires.**

Custom errors shipped in Solidity 0.8.4, documented on soliditylang.org in April 2021. They store a 4-byte selector instead of a full string, which saves deployment gas and runtime gas when the revert is hit.

```solidity
// Higher cost: stores the string
require(msg.sender == owner, "not owner");

// Lower cost: selector only
error NotOwner(address caller);

function withdraw() external {
    if (msg.sender != owner) revert NotOwner(msg.sender);
}
```

**5. Use unchecked only when you can prove no overflow.**

Since Solidity 0.8.0, arithmetic reverts on overflow by default. That safety costs gas. If a loop index cannot overflow because it is bounded by `length`, you can save gas with `unchecked`.

```solidity
for (uint256 i = 0; i < length; ) {
    // ... work with i
    unchecked { ++i; }
}
```

Do not wrap user balances, token amounts, or math that could overflow. OpenZeppelin and the language docs note the same warning: only use `unchecked` where overflow is impossible by construction.

Other practical steps: use `external` instead of `public` for functions only called externally, order require checks to fail early, emit events for data you only need off-chain instead of storing it, use minimal proxies for cheap deployments, and measure with Hardhat Gas Reporter or Foundry gas reports.

## FAQ

**How do I estimate a fee in dollars before sending?**

Look up current base fee and suggested tip on a gas tracker, add them, multiply by your gas limit, and multiply by ETH price. For example, 21,000 gas with base 15 gwei plus tip 2 gwei equals 357,000 gwei, or 0.000357 ETH. At $2,500 per ETH that is $0.89. Wallets and sites like Etherscan show this estimate live.

**Why did my transaction fail but still cost gas?**

Gas pays for work, not success. If the EVM ran opcodes before it hit a revert or out-of-gas, validators did that work. You pay for gas used. If you set too little gasLimit for a transfer, the transaction can be rejected before inclusion and cost nothing, but most failures during execution are paid.

**What happens to gas if ETH price doubles?**

Gas used for an action stays the same. Price per unit in gwei is set by demand. If ETH price doubles and demand stays flat, the same 21,000-unit transfer costs twice as many dollars but the same gwei and ETH. In practice wallets and users target dollar costs, so demand often eases when ETH price rises.

**Do I need ETH on a Layer 2?**

Yes, but less. Arbitrum and Optimism still use ETH for gas, and Base uses ETH as well. Fees are lower because execution happens off L1 and only a batch proof and blob or calldata is posted to Ethereum. Some L2s and apps offer paymasters that let you pay fees in USDC or sponsor them entirely, but under the hood the operator still pays ETH to settle.

**Is it cheaper to set a very low maxFeePerGas and wait?**

It can be, if you are not time-sensitive. Your transaction will sit in the mempool until the base fee drops to your max. If the base fee keeps rising, it may never be included and you will need to replace it with a higher maxFeePerGas. Do not set it so low that you miss a time-sensitive mint or liquidation.

**Do gas tokens or refunds help me now?**

No. Tokens like CHI and GST2 exploited old refund rules by writing then clearing storage. EIP-3529 in London cut refunds from up to 50 percent of gas used to 20 percent and removed refunds for SELFDESTRUCT, which made those tokens unprofitable. Focus on batching and Layer 2 instead.

**Where should I track fees and burn?**

Use ethereum.org/developers/docs/gas for mechanics, eips.ethereum.org/EIPS/eip-1559 and EIP-2929 for spec details, and a live tracker such as Etherscan Gas Tracker for current base fee and tip. For burn and supply, Ultrasound.money and Glassnode publish cumulative burn and supply charts.

---

Sources and further reading:

- ethereum.org/developers/docs/gas and ethereum.org/gas for base fee, priority fee, target size, and example calculations.
- eips.ethereum.org/EIPS/eip-1559 for burned base fee, maxFeePerGas, and maxPriorityFeePerGas.
- Ethereum Foundation blog, London mainnet announcement on 15 July 2021 and Berlin announcement on 8 March 2021, for forks, blocks, and EIP lists.
- eips.ethereum.org/EIPS/eip-2929 and EIP-2200 for cold and warm SLOAD and SSTORE pricing.
- docs.soliditylang.org for Solidity 0.8.0 checked arithmetic with unchecked, and Solidity 0.8.4 custom errors.
- Dencun upgrade coverage from the Ethereum Foundation and rollup teams for EIP-4844 blob activation on 13 March 2024 and resulting L2 fee drops reported by across Optimism, Base, and Arbitrum dashboards.

## Verifiable Primary Sources & References

1. [Ethereum EIP-20 Token Standard Specification](https://eips.ethereum.org/EIPS/eip-20)
2. [Ethereum EIP-721 Non-Fungible Token Standard Specification](https://eips.ethereum.org/EIPS/eip-721)
3. [Ethereum EIP-1559 Fee Market Change Specification](https://eips.ethereum.org/EIPS/eip-1559)
4. [Ethereum EIP-4337 Account Abstraction Using Alt Mempool](https://eips.ethereum.org/EIPS/eip-4337)
5. [Ethereum EIP-4844 Proto-Danksharding Specification](https://eips.ethereum.org/EIPS/eip-4844)
6. [Ethereum EIP-712 Typed Structured Data Hashing and Signing](https://eips.ethereum.org/EIPS/eip-712)
7. [Ethereum Official Yellow Paper & Protocol Specification](https://ethereum.github.io/yellowpaper/paper.pdf)
8. [Ethereum Consensus Specs & Proof of Stake Architecture](https://github.com/ethereum/consensus-specs)
9. [Solidity Compiler Official Documentation & Language Spec](https://docs.soliditylang.org/)
10. [OpenZeppelin Smart Contract Standard Libraries & Security Audits](https://docs.openzeppelin.com/)
