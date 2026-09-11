---
title: Gas Fees Explained
image: /images/articles/charts/gas-l2-fees.svg
data-ai-hint: layer 2 fee comparison chart
description: >-
  What gas measures, how EIP-1559 pricing works, why fees spike, and how users
  and developers pay less.
category: Technology Deep Dives
publishedDate: '2026-03-11'
lastUpdated: '2026-09-08'
---

Gas is the unit that measures how much work Ethereum does for your transaction. You pay for that work in ETH, priced per unit of gas. When the network is busy, the price per unit rises. When it is quiet, it falls. [Ethereum's own gas overview](https://ethereum.org/gas/) and its [technical gas documentation](https://ethereum.org/developers/docs/gas/) are the canonical starting points, and this guide builds on them with current numbers.

This guide explains what gas is, who needs to understand it, how the fee market works after EIP-1559, where the trade-offs are, and how users and developers can reduce what they pay.

## What gas is

Gas counts computation on the Ethereum Virtual Machine (EVM). Every opcode has a fixed gas cost. Simple math costs a few gas units. Reading and writing to chain storage costs thousands. Your total fee is gas used multiplied by the price you pay per unit.

Common examples, from [ethereum.org/gas](https://ethereum.org/gas/) and the [technical gas docs](https://ethereum.org/developers/docs/gas/), with [Binance Academy's breakdown](https://www.binance.com/en/academy/articles/how-do-gas-fees-work-on-ethereum) for comparison:

| Action | Gas used, typical | Notes |
|

--- |

--- |

--- |
| Send ETH to another wallet | 21,000 | Fixed, defined in the Yellow Paper as TxGas |
| Send an ERC-20 token such as USDC | 45,000 - 65,000 | Calls a contract, so it costs more than a plain ETH transfer |
| Approve a token for a router | 45,000 - 50,000 | Writes an allowance slot |
| Swap on Uniswap v3 | 120,000 - 185,000 | ethereum.org lists 184,523 for a swap as an example |
| Mint one ERC-721 NFT | 100,000 - 300,000 | Depends on storage writes and extensions |
| Deploy a contract | 1,000,000 and up | Includes 32,000 CREATE cost plus code deposit costs |

These gas-used numbers do not change with ETH price. What changes is the price per unit, quoted in gwei. 1 gwei equals 0.000000001 ETH, or 1,000,000,000 wei. 1 ETH equals 1,000,000,000 gwei. [99Bitcoins' tracker page](https://99bitcoins.com/tools/ethereum-fee-tracker/) keeps the same conversion table with live heatmaps. Wallets quote gas price in gwei because gas per unit is a fraction of an ETH.

Two related terms matter:

- gasUsed is how many units your transaction actually consumed, set by the code path you executed.
- gasLimit is the maximum units you allow. You pay only for what you use and the rest is refunded. Set the limit too low and the transaction fails, but you still pay for work done up to the failure. The same applies when a contract reverts. [MetaMask's user guide](https://support.metamask.io/more-web3/learn/user-guide-gas) walks through exactly how limits, base fees, and out-of-gas failures interact.

## How gas fees work

Who needs this: anyone who sends ETH, swaps, bridges, or mints and has watched a $2 estimate become $40 during a popular mint. Solidity and dapp developers most of all, since contract design sets gasUsed directly and hiring screens probe storage, data locations, and error patterns. Product and infrastructure teams too, because a $15 mainnet swap against a $0.05 Layer 2 changes where to deploy, how to batch, and how to sponsor fees. If you only hold ETH and never transact, skip the detail. If you build or transact, you cannot.

### The base formula

Since August 2021, after EIP-1559, the fee you actually pay is:

```
fee = gasUsed * (baseFeePerGas + priorityFeePerGas)
```

Your wallet sets two caps:

- `maxFeePerGas`: The most you will pay per unit, base fee plus tip combined.
- `maxPriorityFeePerGas`: The most you will tip the validator per unit.

Validators receive only the tip. The base fee is burned, removed from circulation. If you set `maxFeePerGas` higher than the current base fee plus your tip, you are refunded the difference. See the [gas docs](https://ethereum.org/developers/docs/gas/) and the [full EIP-1559 spec](https://eips.ethereum.org/EIPS/eip-1559) for details. [OKX's guide](https://www.okx.com/learn/ethereum/ethereum-eip-1559-guide) adds a clear before-and-after table of first-price auctions versus the post-1559 market.

Example from [ethereum.org](https://ethereum.org/developers/docs/gas/): Jordan sends Taylor 1 ETH. The transaction needs 21,000 gas. The base fee is 10 gwei and Jordan adds a 2 gwei tip. [Etherscan's live gas tracker](https://etherscan.io/gastracker) shows the same arithmetic playing out right now with current base and priority numbers, plus dollar costs for swaps, NFTs, and bridges.

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

Before London, Ethereum used a first-price auction. You set a single `gasPrice` and validators picked the highest bidders. Wallets had to guess. Users routinely overpaid to avoid being stuck, and fees swung sharply with demand. EIP-1559 replaced that blind auction with a protocol-set base fee that moves predictably. The design was formally analyzed in [Tim Roughgarden's economic](https://timroughgarden.org/papers/eip1559.pdf) report for the Ethereum Foundation, also [on arXiv as HTML](https://arxiv.org/html/2012.00854v1) and [PDF](https://arxiv.org/pdf/2012.00854), which proves the mechanism's incentive properties while noting it was never meant to lower average fees. Later work even [minority attacks](https://arxiv.org/html/2304.11478v3) that manipulate the base fee itself.

### After EIP-1559

EIP-1559 shipped with the London hard fork at block 12,965,000 on 5 August 2021 at 12:34 UTC, according to the Ethereum Foundation announcement and coverage at the time. The fork included EIP-1559, EIP-3198 for the BASEFEE opcode, EIP-3529 which reduced refunds, EIP-3541, and EIP-3554 which delayed the difficulty bomb.

Five mechanics define it now:

1. **Base fee is protocol-set and burned.** Every block has a base fee. Your transaction must cover it to be valid. When the block is built, that base fee is destroyed. It does not go to validators. Burning removes the incentive for validators to manipulate fees and offsets issuance. [Etherscan](https://etherscan.io/gastracker) and [Ultrasound.money](https://ultrasound.money/) report about 4.6 million ETH burned between August 2021 and early 2026, even as net supply still rose slightly to around 120 to 121 million ETH by April 2026 after issuance to stakers continued. [Ultrasound's daily view](https://ultrasound.money/?timeFrame=d1) lets you slice the same burn and supply data by time window.

2. **Base fee moves with demand, capped at 12.5 percent per block.** The protocol compares gas used in the previous block to the gas target, which is half the gas limit. If the previous block used more than the target, the base fee increases by up to 12.5 percent. If it used less, it decreases by up to 12.5 percent. Blocks can be up to twice the target size, so during a surge the base fee climbs exponentially and then falls when demand eases. This is why [ethereum.org](https://ethereum.org/developers/docs/gas/) describes the base fee as the network trying to keep average block size at the target.

3. **Priority fee is a tip validators keep.** Validators receive only `priorityFeePerGas * gasUsed`. A transaction that pays only the base fee is valid but less attractive to include. During calm periods a tip of 1 to 2 gwei is often enough. During a congested mint or crash, users add more to be included sooner. Wallets now suggest this automatically, and [MetaMask](https://support.metamask.io/configure/transactions/how-to-customize-gas-settings/) documents exactly how to override gas limit, priority fee, and max fee by hand.

4. **maxFeePerGas protects you from overpaying.** You declare the highest total you accept. If the base fee falls before your transaction is included, you pay the lower effective price and get a refund for the unused allowance. If the base fee exceeds your maxFeePerGas, the transaction waits in the mempool.

5. **Target size is not the limit.** Ethereum can process roughly 15 to 30 simple transfers per second at layer 1. Each block has a target of half the limit. That slack lets the network absorb bursts without immediately rejecting transactions, but sustained demand still pushes the base fee up until some users wait. [Historical charts](https://www.ethtransactionprice.org/ethereum-gas-fee-history.html) show the long arc: about $0.20 average fees in 2017, $53 in 2021, under $1 through 2025 and 2026.

### What storage actually costs in the EVM

Developers care most about storage because it dominates costs.

- Creating a new storage slot from zero to non-zero costs 20,000 gas for the SSTORE itself (SstoreSetGas), plus access costs if the slot is cold.
- Updating an existing non-zero slot to a different non-zero value costs 5,000 gas before Berlin-era adjustments. Since EIP-2929, the net is split into access plus write.
- Reading a slot with SLOAD costs 2,100 gas cold and 100 gas warm after EIP-2929. Cold means first touch of that address and slot in the transaction. Warm means you already touched it, so the client already loaded it.

Cross-check any opcode price in the [community evm-opcodes table](https://github.com/crytic/evm-opcodes) or the [EtherVM opcode reference](https://ethervm.io/), which tracks newer opcodes like PUSH0, TLOAD, TSTORE, BLOBHASH, and BLOBBASEFEE.

EIP-2929 was part of the Berlin upgrade at block 12,244,000 on 15 April 2021. It raised SLOAD from 800 to 2,100 cold and *CALL and related state-access opcodes to 2,600 cold, with a 100 warm cost for repeats. The goal was to align gas with the real database work and close denial-of-service vectors where attackers crafted blocks heavy on state reads. EIP-2930 added optional access lists in the same fork so users could pre-declare addresses and slots they would touch.

Since then, execution specs price SSTORE as access cost plus write cost, with refunds when you clear or restore a slot. The net effect: patterns that do SLOAD then SSTORE on the same slot, like `counter += 1`, got slightly cheaper after Berlin, while isolated cold reads got more expensive. If you use hardcoded gas amounts with `transfer` and 2,300 gas stipends, EIP-2929 also broke some older patterns - which is why `transfer` and `send` are now discouraged.

These numbers come from EIP-2200, EIP-2929, and the go-ethereum protocol params (for example ColdSloadCostEIP2929 = 2,100, WarmStorageReadCostEIP2929 = 100).

### Other data locations

`calldata` is the read-only bytes sent with the transaction. External function arguments arrive in calldata. `memory` is a byte array created during execution and discarded after. Using `calldata` for external inputs avoids copying bytes into memory.

A simple copy from calldata to memory costs gas that grows with size. For one address or uint256 the difference is tiny. For arrays of 1,000 recipients the copy is material. Benchmarks with 1,000-address airdrops show `calldata` inputs saving around 200,000 gas, roughly 0.5 to 1 percent of a large batch, and the saving scales with input length. If you need to modify the array, copy it to memory. If you only read it, keep it as `calldata` and declare the function `external`. [Alchemy's optimization guide](https://www.alchemy.com/overviews/solidity-gas-optimization) puts calldata packing among twelve core patterns worth 20 to 50 percent total savings. [Tenosia's community guide](https://github.com/Tenosia/Gas-Optimization-Guide) sorts the same ideas into costly habits, saving patterns, and code-golf tricks. [CalmOps' playbook](https://calmops.com/programming/blockchain/gas-optimization-solidity/) walks the storage and bytecode reduction path end to end.

## Pros and cons

### What the current design gets right

- **Predictable estimates.** Wallets can suggest `maxFeePerGas` and `maxPriorityFeePerGas` from the recent base fee instead of guessing a blind auction bid. Users see a clearer max cost.
- **DoS resistance.** Gas metering makes infinite loops economically impossible and prices state access closer to real client work after Berlin fixes.
- **Burn aligns fee payment with ETH.** Only ETH pays the base fee, and burning it offsets issuance. Between the Merge in September 2022, which cut daily issuance from about 13,000 ETH to about 1,700 ETH, and steady burn in early 2023, ETH was briefly net deflationary. That effect faded as Layer 2 moved activity off mainnet. [Gas history trackers](https://gasfeepredictor.com/ethereum-gas-fee-history) split the story into five eras: pre-EIP-1559, post-London, post-Merge, post-Dencun, and post-Pectra.
- **Layer 1 stays the settlement anchor.** Expensive mainnet fees fund validator security while high-volume activity moves to cheaper layers that still settle to Ethereum. [CoinLaw's fee history](https://coinlaw.io/ethereum-gas-fee-history) puts the 2021 peak above $70 with single-digit gwei readings by 2026.

### What still hurts

-

### Fees still spike

When demand exceeds roughly 15 to 30 transactions per second, the base fee climbs 12.5 percent per block until users pause. A planned NFT drop, a token launch, a large airdrop claim, or a market sell-off can push a plain transfer from $0.50 to $20 or more for hours.
-

### Tip still needed for speed

To be included in the next block during spikes, you add a higher tip. The protocol does not guarantee inclusion time.
-

### Mainnet is costly for small actions

Deployments, frequent writes, and per-user storage are hard to justify on L1. A swap can still cost many dollars when ETH price is high.
-

### Developer cliff

Gas optimization helps but adds complexity and audit risk. An incorrect `unchecked` block or a bad packing choice can introduce bugs that cost more than the gas saved.

## How to pay less and build cheaper

### If you are a user

1. **Prefer a Layer 2 for routine actions.** Arbitrum, Optimism, Base, and zkSync Era post batches to Ethereum with compressed data and split the L1 cost across many L2 transactions. They are typically 10 to 100 times cheaper than mainnet. [L2 fee boards](https://ethtransactionfee.org/ethereum-layer2-fees.html) compare Arbitrum, Optimism, Base, zkSync, and Polygon side by side. [2026 comparisons](https://qinv.io/blog/base-vs-arbitrum-vs-optimism-comparison) put Base near $0.01 to $0.05, Optimism near $0.01 to $0.10, and Arbitrum near $0.05 to $0.20 against $10 to $50 mainnet actions. [WebbyCoin](https://webbycoin.com/articles/compare-gas-fees-on-arbitrum/) explains why the L1 data share, 80 to 90% pre-Dencun, drove the Nitro versus Bedrock cost shift. [Guardarian's 2026 comparison](https://guardarian.com/blog/arbitrum-vs-optimism-a-detailed-comparison) adds the operator angle on fees, TVL, and ARB versus OP utility. [EarnifyHub's L2 guide](https://earnifyhub.com/blog/crypto/layer2-arbitrum-optimism-base-zksync-comparison) covers the failure modes too, including seven-day withdrawals versus zkSync's minutes. [Chaingain's 2026 explainer](https://chaingain.io/layer-2-explained-2026/) adds bridge risk to the fee picture.

After the Dencun upgrade on 13 March 2024 at epoch 269,568, which activated EIP-4844 proto-danksharding, L2 fees fell further. [canonical blob spec](https://eips.ethereum.org/EIPS/eip-4844) defines 128KB blobs with separate blob gas pricing and roughly 18-day pruning. [Binance Academy](https://www.binance.com/en/academy/articles/what-is-eip-4844-in-ethereum-and-how-can-it-benefit-users) dates Dencun to March 13, 2024 with 80 to 90% L2 cuts. [Status recorded Optimism](https://status.network/blog/what-is-ethereum-dencun-upgrade-layer-2-fees) falling about 98%, Arbitrum 97%, and Base 98% in the days after activation. [contemporaneous March 2024](https://lex.substack.com/p/defi-ethereum-l2-fees-fall-90-as) report confirms the across-the-board collapse. EIP-4844 replaced expensive permanent calldata with temporary blobs that live about 18 days and are not stored forever. By 2026, many L2 swaps and transfers settle for a few cents, though blobs can still get more expensive if blob space fills. [Spark's research](https://www.spark.money/research/ethereum-eip-4844-blob-fee-market) derives the separate blob fee formula and the 95% plus drop. [Datawallet](https://www.datawallet.com/crypto/eip-4844-explained) tracks the follow-ons: Pectra doubling blob counts with EIP-7691, 7623, and 7918 plus Fusaka peerDAS on the roadmap. [Plisio](https://plisio.net/crypto/eip-4844-explained) cites the emblematic $0.50 to $0.01 case with Base volume up 224%. [Thirdweb's developer guide](https://blog.thirdweb.com/ethereum-blob-space-explained-how-eip-4844-is-reshaping-l2-economics-for-web3-developers) explains the 128KB, six-blobs-per-block dual fee market. [Cyfrin's guide](https://www.cyfrin.io/blog/what-is-eip-4844-proto-danksharding-and-blob-transactions) covers multidimensional pricing with maxFeePerBlobGas and KZG commitments. [Eco](https://eco.com/support/en/articles/14796248-eip-4844-proto-danksharding-explained) notes the 1-wei blob floor of 2024 with L2 actions repriced from dollars to cents. [Blofin](https://blofin.com/en/academy/education/ethereum/eip-4844-proto-danksharding) adds the key caveat: blobs never cut L1 execution gas, only the L2 data path. [Gate's wiki](https://www.gate.com/crypto-wiki/article/danksharding-and-proto-danksharding-explained-20260130) confirms the March 2024 activation and KZG role. [Finematics' video transcript](https://ethereum.org/videos/eip-4844-dencun-explained/) walks through blobs versus calldata for visual learners. [Dencun FAQ](https://ethereum.org/roadmap/dencun/) gives the official activation context.

How each rollup passes those savings through differs in the details. [Arbitrum](https://docs.arbitrum.io/how-arbitrum-works/deep-dives/gas-and-fees) documents its Nitro parent-plus-child fee model with Brotli compression and an adaptive data-unit pricer, plus [sequencer](https://docs.arbitrum.io/how-arbitrum-works/deep-dives/sequencer) batches and compresses with blob-versus-calldata selection. [Optimism](https://docs.optimism.io/op-stack/transactions/fees) documents its total-fee formula of execution gas plus L1 data fee with Ecotone and Fjord blob scalars.

Four networks, four cent-level medians. Optimism and Base kept slightly higher medians because their activity mix includes more complex transactions; Arbitrum and zkSync sit at a penny. All four round to noise next to mainnet's double-digit dollars.

2. **Time your mainnet transactions.** Track live fees on [Etherscan's Gas Tracker](https://etherscan.io/gastracker), the [alternative EthScan tracker](https://ethscan.io/gas), or [99Bitcoins' tracker with heatmaps](https://99bitcoins.com/tools/ethereum-fee-tracker/). Fees are often lowest on weekends and during off-peak US hours when fewer users compete for block space. If you are not in a rush, set a lower `maxFeePerGas` and let the transaction wait. [Etherscan](https://docs.etherscan.io/endpoint-showcase/gas-tracker) documents the GasOracle and estimate APIs behind its tracker for builders. History backs the patience play: [2021](https://99bitcoins.com/tools/ethereum-fee-tracker/) averaged about $53 with $300-for-$5 anecdotes at the peak.

3. **Set fees explicitly.** In MetaMask and similar wallets, use advanced settings to set `maxFeePerGas` and `maxPriorityFeePerGas` instead of accepting a single gas price. Set a max base you are willing to pay. You will be refunded if the actual base fee is lower. [MetaMask's own walkthrough](https://support.metamask.io/configure/transactions/how-to-customize-gas-settings/) shows the pencil-icon flow for editing gas limit, priority fee, and max fee.

4. **Batch where possible.** Some apps let you approve and swap in one transaction, or mint several NFTs with ERC-721A for near the cost of one. Off-chain signatures followed by a single on-chain settlement also cut gas. Check if the dapp supports batch calls or permit signatures that avoid an extra approve transaction. The stronger version of this idea is account abstraction: [ERC-4337 paymasters](https://docs.erc4337.io/paymasters/index.html) sponsor user gas through the EntryPoint deposit flow, specified in [EIP-4337 itself](https://eips.ethereum.org/EIPS/eip-4337) and indexed in [ethereum.org's ERC-4337 docs](https://ethereum.org/developers/tools/erc-4337-documentation/). [Thirdweb](https://blog.thirdweb.com/account-abstraction-in-2026-how-eip-7702-and-erc-4337-are-transforming-ethereum-wallets-for-developers/) reports more than 30 million smart accounts by mid-2026 with paymasters clearing millions of sponsored actions a day, plus Pectra's EIP-7702 delegation model. [Ethereum's gasless tutorial](https://ethereum.org/developers/tutorials/gasless) shows the older meta-transaction path with EIP-712 sponsorship.

5. **Avoid failed transactions.** Set a safe gasLimit. A simple ETH transfer always needs 21,000. Contract calls vary - use your wallet's estimate plus a margin. Failed or reverted transactions still consume gas for work done. One more protection exists against the worst spikes: private mempools. [Flashbots' MEV-Boost auction](https://www.flashbots.net/) and private transaction pool with [sealed-bid blockspace documented here](https://docs.flashbots.net/flashbots-auction/overview) let you bypass the public mempool where frontrunning bots live. [CoW DAO's analysis](https://cow.fi/learn/are-private-mempools-a-good-way-to-avoid-mev) weighs the lag-time trade-offs honestly. [Webopedia's walkthrough](https://www.webopedia.com/crypto/learn/flashbots-mev-marketplace-ethereum/) covers the searcher to builder to proposer flow with Protect RPC. [Datawallet](https://www.datawallet.com/crypto/flashbots-explained) reports MEV-Boost in more than 80% of blocks. [EarnifyHub's 2026 MEV](https://earnifyhub.com/blog/crypto/mev-maximal-extractable-value-guide-2026) guide puts yearly ETH-side extraction near $552M with sandwiches taking 0.3 to 2%. [Ethereum's own MEV](https://ethereum.org/developers/docs/mev/) docs explain proposer-builder separation and private channels.

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



### 2. Pack storage variables

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

4. Use custom errors instead of string requires.

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

**5. Use unchecked only when you can prove no overflow.** Since Solidity 0.8.0, arithmetic reverts on overflow by default. That safety costs gas. If a loop index cannot overflow because it is bounded by `length`, you can save gas with `unchecked`.

```solidity
for (uint256 i = 0; i < length; ) {
/ ... work with i
    unchecked { ++i; }
}
```

Do not wrap user balances, token amounts, or math that could overflow. OpenZeppelin and the language docs note the same warning: only use `unchecked` where overflow is impossible by construction.

Other practical steps: use `external` instead of `public` for functions only called externally, order require checks to fail early, emit events for data you only need off-chain instead of storing it, use minimal proxies for cheap deployments, and measure with Hardhat Gas Reporter or Foundry gas reports. [TheEthereum.wiki's walkthrough](https://theethereum.wiki/learn/gas-fees-explained/) adds MEV gas wars and the 10-to-100x L2 rule to the same checklist.

### When fees explode: a short history of spikes

Spikes follow attention, not technology. CryptoKitties clogged December 2017 above 450 gwei. DeFi Summer 2020 printed 480 gwei days. May 2021 averaged $53 to $70 with swaps at $100 to $200 and the BAYC Otherdeeds mint pushing $200 to $800 transactions. BlobScriptions spammed 2,437 blob inscriptions a day across March and April 2024 and spiked the brand-new blob fee market by four orders of magnitude in one case. September 2025's WLFI launch swung base fees from under 1 to over 100 gwei with plain transfers past $145. [DeepNewz](https://deepnewz.com/crypto/ethereum-network-overwhelmed-blob-transactions-fees-soar-to) covered the blob-fee blowup contemporaneously. [Crowdfund Insider's weekly](https://www.crowdfundinsider.com/2025/09/249943-ethereum-gas-fees-web3-thoughts-of-the-week) recap documented the WLFI swing with transfer math. The full arc lives in [CoinLaw's yearly table](https://coinlaw.io/ethereum-gas-fee-history) and [Etherscan-adjacent historical charts](https://www.ethtransactionprice.org/ethereum-gas-fee-history.html) from $0.20 in 2017.

The lesson repeats every cycle: demand spikes are temporary, base-fee math is permanent, and the users who survive them transact on L2s, at off-peak hours, with explicit caps. A decade in three points:

![Ethereum fee milestones 2017 to 2026](/images/articles/charts/gas-fee-history.svg)
*Figure: average-fee milestones, not to vertical scale. Data: [Etherscan-adjacent history](https://www.ethtransactionprice.org/ethereum-gas-fee-history.html), [CoinLaw yearly table](https://coinlaw.io/ethereum-gas-fee-history).*

## FAQ



### Estimating fees in dollars

Look up current base fee and suggested tip on a gas tracker, add them, multiply by your gas limit, and multiply by ETH price. For example, 21,000 gas with base 15 gwei plus tip 2 gwei equals 357,000 gwei, or 0.000357 ETH. At $2,500 per ETH that is $0.89. Wallets and sites like Etherscan show this estimate live.



### Paid failures

Gas pays for work, not success. If the EVM ran opcodes before it hit a revert or out-of-gas, validators did that work. You pay for gas used. If you set too little gasLimit for a transfer, the transaction can be rejected before inclusion and cost nothing, but most failures during execution are paid.

#### What happens to gas if ETH price doubles?

Gas used for an action stays the same. Price per unit in gwei is set by demand. If ETH price doubles and demand stays flat, the same 21,000-unit transfer costs twice as many dollars but the same gwei and ETH. In practice wallets and users target dollar costs, so demand often eases when ETH price rises.



### ETH on Layer 2

Yes, but less. Arbitrum and Optimism still use ETH for gas, and Base uses ETH as well. Fees are lower because execution happens off L1 and only a batch proof and blob or calldata is posted to Ethereum. Some L2s and apps offer paymasters that let you pay fees in USDC or sponsor them entirely, but under the hood the operator still pays ETH to settle.

#### Is it cheaper to set a very low maxFeePerGas and wait?

It can be, if you are not time-sensitive. Your transaction will sit in the mempool until the base fee drops to your max. If the base fee keeps rising, it may never be included and you will need to replace it with a higher maxFeePerGas. Do not set it so low that you miss a time-sensitive mint or liquidation.

**Gas tokens and refunds** No. Tokens like CHI and GST2 exploited old refund rules by writing then clearing storage. EIP-3529 in London cut refunds from up to 50 percent of gas used to 20 percent and removed refunds for SELFDESTRUCT, which made those tokens unprofitable. Focus on batching and Layer 2 instead.

**MEV and personal fees** Maximal extractable value is profit from ordering transactions: frontrunning your swap, sandwiching it, or backrunning it. Searchers bid gas to win ordering, which pushes your costs up during volatile periods. [Ethereum's MEV documentation](https://ethereum.org/developers/docs/mev/) explains proposer-builder separation as the structural answer. Practically, route large swaps through MEV-protected RPCs or private mempools, split size, and set slippage tight. [Flashbots](https://docs.flashbots.net/flashbots-auction/overview) documents the private auction path.

**Third-party gas payment** Yes, through paymasters. [paymaster contract](https://docs.erc4337.io/paymasters/index.html) sponsors UserOperation gas from its EntryPoint deposit after its own validation passes. Apps use this for free trials, gasless onboarding, and USDC-denominated fees. [canonical flow is](https://eips.ethereum.org/EIPS/eip-4337) specified in EIP-4337.

**Tracking fees and burn**

Use the [gas docs](https://ethereum.org/developers/docs/gas/) for mechanics, the [EIP-1559](https://eips.ethereum.org/EIPS/eip-1559) and EIP-2929 specs for details, and a live tracker such as [Etherscan's Gas Tracker](https://etherscan.io/gastracker) for current base fee and tip. For burn and supply, [Ultrasound.money](https://ultrasound.money/) publishes cumulative burn and supply charts.

---

Sources and further reading:

- ethereum.org/developers/docs/gas and ethereum.org/gas for base fee, priority fee, target size, and example calculations.
- eips.ethereum.org/EIPS/eip-1559 for burned base fee, maxFeePerGas, and maxPriorityFeePerGas.
- Ethereum Foundation blog, London mainnet announcement on 15 July 2021 and Berlin announcement on 8 March 2021, for forks, blocks, and EIP lists.
- eips.ethereum.org/EIPS/eip-2929 and EIP-2200 for cold and warm SLOAD and SSTORE pricing.
- docs.soliditylang.org for Solidity 0.8.0 checked arithmetic with unchecked, and Solidity 0.8.4 custom errors.
- Dencun upgrade coverage from the Ethereum Foundation and rollup teams for EIP-4844 blob activation on 13 March 2024 and resulting L2 fee drops reported by across Optimism, Base, and Arbitrum dashboards.
