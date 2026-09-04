---
title: What is MEV? The Invisible Tax on Web3 Explained
description: >-
  Maximal Extractable Value (MEV) is one of the most powerful and complex forces
  in crypto. Learn what it is, how it works, and its impact on the Web3
  ecosystem.
category: Technology Deep Dives
data-ai-hint: blockchain data
publishedDate: '2026-03-11'
lastUpdated: '2026-09-04'
---
## What is MEV? The Invisible Tax on Web3 Explained

### What is it

Maximal Extractable Value (MEV) is the maximum value a block producer can extract beyond the standard block reward and gas fees by choosing which transactions go into a block, in what order, and which get left out. Ethereum.org defines it exactly this way.

The term was first formalized as Miner Extractable Value in the April 2019 paper Flash Boys 2.0 by Phil Daian, Steven Goldfeder, Ari Juels and coauthors. The paper showed bots were already monitoring the public mempool and reordering decentralized exchange trades for profit. After Ethereum switched from proof of work to proof of stake in September 2022, the name changed to Maximal Extractable Value because validators replaced miners, but the mechanics stayed the same.

Flashbots, founded in late 2020 by Phil Daian, Stephane Gosselin and Tina Zhen with Hasu as strategy lead, now provides most of the infrastructure that manages MEV on Ethereum.

### Who it's for

* **Active DEX traders.** If you swap on Uniswap, Curve, or any AMM, your pending transaction is visible before it executes. That visibility is what sandwich bots use.
* **Liquidity providers.** MEV arbitrage constantly picks off stale AMM quotes. Research from CoW Protocol and model calls this loss-versus-rebalancing (LVR) and finds it often exceeds LP fee income.
* **DeFi borrowers.** Lending protocols like Aave and Maker rely on liquidations. Searchers compete to liquidate undercollateralized positions first to collect the bonus.
* **App and protocol developers.** Any contract that uses an on-chain price, assumes transaction order, or handles large swaps can be gamed if you do not design for MEV.
* **Validators and stakers.** MEV now makes up a large share of validator income. How you source blocks affects your rewards and your exposure to censorship risk.

If you only hold on a centralized exchange and never interact on-chain, MEV does not touch you directly. If you trade, provide liquidity, or build on Ethereum or other public mempool chains, it does.

### How it works

1. **Your transaction enters the mempool.** When you submit a swap on Ethereum, it does not execute right away. It sits in the mempool, a public waiting area where pending transactions wait to be included.
2. **Searchers scan for profit.** Searchers are bots and teams running algorithms that watch the mempool and on-chain state for opportunities. They look for large swaps that will move prices, liquidation thresholds, or price differences between venues.
3. **Bundles are built.** A searcher packages the transactions needed to capture the opportunity into a bundle that must execute in a fixed order or not at all. Example: buy before your trade, let your trade push the price, sell after.
4. **Builders assemble blocks.** Builders are specialized entities that collect bundles from many searchers plus normal mempool transactions and construct the most valuable complete block they can.
5. **Proposers pick the best block.** The validator selected to propose the next block does not have to build it. With proposer-builder separation (PBS), the validator runs MEV-Boost, open source middleware that queries multiple builders via relays. Relays validate blocks and forward sealed bids. The validator picks the highest bid, signs the header, and the relay releases the full block. The validator keeps the bid as extra income.

This supply chain is why MEV-Boost matters. According to Flashbots docs and independent trackers, more than 90 percent of Ethereum blocks have been proposed via MEV-Boost since 2023. The market separates the proposer role (any validator) from the builder role (sophisticated, hardware-heavy search for ordering profit).

Flashbots Protect is the user-facing side of the same system. It is a private RPC endpoint at https://rpc.flashbots.net. Transactions sent through it bypass the public mempool and go directly to builders, so searchers cannot see them to front run. Flashbots reported in late 2024 that Protect had served more than 2.1 million unique wallets and protected about $43 billion in DEX volume. MEV Blocker by CoW Protocol works similarly and auctions the right to backrun your transaction, rebating most of the value back to you.

Newer infrastructure is moving toward decentralization. BuilderNet, launched in late 2024 and operated jointly by Flashbots, Beaverbuild and Nethermind, runs builders inside Trusted Execution Environments (TEEs). Spark reported BuilderNet produced about 25 percent of Ethereum blocks by early 2026. Flashbots' longer term project SUAVE aims to be a cross-chain encrypted mempool and auction layer, but it remains in testnet as of 2026.

### The main types of MEV

**Sandwich attack - the most common user-facing type**
This is a front run plus back run around a single victim trade.

* You submit: swap 10 ETH for USDC on Uniswap with 1 percent slippage tolerance.
* Bot sees your pending swap and calculates its price impact on the pool.
* Bot transaction 1 - front run: buys USDC with higher gas so it executes before you. The pool price of USDC ticks up.
* Your transaction executes at the worse price, still inside your slippage tolerance, so it does not revert. You get fewer USDC than the quote showed.
* Bot transaction 2 - back run: sells the USDC it just bought at the now higher price. Profit equals the spread minus gas for two transactions.

EigenPhi data reported by Cointelegraph Research in December 2025 found sandwich bots drained about $40 million from Ethereum users across 2025. Monthly extraction fell from almost $10 million in late 2024 to about $2.5 million in October 2025 as protection tools spread, but attack count stayed high at 60,000 to 90,000 sandwiches per month. Average net profit per attack had fallen to about $3. About a third of sandwich bots ran at breakeven and another 30 percent at a net loss that month, while one address, jaredfromsubway.eth, accounted for roughly 70 percent of sandwich activity according to The Block's analysis of its lifetime revenue of about 82,679 ETH against 76,850 ETH in gas.

**DEX arbitrage - usually price-correcting**
If ETH is $2,000 on Uniswap and $2,010 on Sushiswap, a searcher buys on Uniswap and sells on Sushiswap in one atomic transaction. This keeps prices aligned across venues. Searchers often pay 90 percent or more of the arbitrage revenue in gas to validators because competition is intense. Techniques like gas golfing, such as using addresses with leading zeroes to save storage gas, exist specifically to squeeze out extra margin here.

**Liquidations**
When a borrower's collateral falls below the protocol's threshold, anyone can liquidate and collect a fee. Searchers race to be first. This helps keep lending protocols solvent, but the borrower pays the liquidation penalty.

**NFT MEV**
During popular mints or when an NFT is listed far below floor, searchers program transactions to be first in the block or buy the entire set in one transaction. In one 2021 case a searcher spent $7 million to buy every CryptoPunk at floor price using private transaction routing to keep the strategy hidden until inclusion.

**Just-in-time (JIT) liquidity**
A searcher adds liquidity to a pool right before a large swap and removes it right after, collecting the swap fee with almost no price risk. The swapper still pays the fee.

**Generalized frontrunners**
Some bots do not understand specific protocols at all. They copy any pending transaction that looks profitable, replace the recipient address with their own, simulate it locally, and if it would profit, replay it with higher gas. Flashbots was originally built to stop this by taking transactions out of the public mempool.

### Pros and cons

This is a trade-off system, not purely good or bad.

**Where MEV helps**

* Arbitrage keeps DEX prices consistent. Without it, users would get worse quotes across fragmented liquidity.
* Fast liquidations keep lending markets solvent. Without searchers, bad debt would accumulate.
* MEV-Boost distributes MEV income to any validator that runs it, including solo stakers, instead of leaving it only to sophisticated operators. The proposer receives the builder's bid regardless of the proposer's own MEV skill.

**Where MEV hurts**

* Sandwiches are a direct cost to swappers. On Ethereum mainnet, base fees spent most of 2025 and 2026 below 1 gwei, so gas cost rarely stops a bot. Trades from about $1,000 upward in medium liquidity pools can be profitable to sandwich.
* Gas auctions and spam raise fees for everyone. Before Flashbots, searchers competed by bidding up gas in public. Now the auction is off-chain via relays, but block space is still used for extraction rather than user transactions.
* Centralization pressure. Leading builders like Titan and Beaver Build have at times built large shares of blocks. Because relays are trusted intermediaries run by Flashbots, bloXroute, Aestus and others, a few entities influence which transactions are included. OFAC-compliant relays have filtered Tornado Cash transactions, which raised censorship concerns.
* Fragile incentives. If MEV in a single block exceeds the normal block reward, validators have an incentive to reorg the chain to capture it, which weakens consensus stability. Ethereum.org notes this was already theorized for Bitcoin as fees replace block rewards.

### How to use and get started - protecting yourself in practice

You do not need to run a bot to avoid most MEV. One change removes most exposure.

**1. Use a private transaction path**

* **Flashbots Protect:** Add https://rpc.flashbots.net as a custom RPC in MetaMask, Rabby, or Frame. Or use wallets like Rabby that route to Protect by default. Cost is the same gas, but your transaction is not visible until included.
* **MEV Blocker:** Free endpoint at https://mevblocker.io. Like Protect, it hides you from sandwich bots and rebates backrun value. CoW Swap routes through this type of flow by default.
* **CoW Swap or 1inch Fusion:** CoW Swap matches trades in batch auctions off-chain and settles on-chain. Everyone in the same batch gets the same clearing price, so there is no intra-batch ordering to exploit.

Private mempools now carry about half of all Ethereum gas as of 2024 to 2025, which is why average sandwich profit collapsed even though bot count stayed high.

**2. Set tight slippage**

Slippage tolerance is the maximum price move you accept. A sandwich is only profitable if it can extract value within that tolerance.

* Stable pairs like USDC/USDT: 0.1 to 0.3 percent
* Major volatile pairs like ETH/USDC: 0.5 to 1 percent
* Small caps: 1 to 3 percent, but expect higher failure rates in volatility

If your transaction fails often, widen slightly. A failed transaction that costs gas is still often cheaper than being sandwiched on a large trade. A 2026 audit of top DEX integrations cited by Thirdweb found about 40 percent still used dangerously wide defaults.

**3. Split large orders**

A $100,000 swap moves price more than ten $10,000 swaps and is a more attractive single target. Use TWAP execution or an aggregator that splits across pools when the gas trade-off makes sense. On low-fee chains or layer 2s, splitting costs little.

**4. Time and route consciously**

Trade in deeper pools and during higher liquidity periods when possible. Compare quotes across aggregators. On layer 2 rollups with centralized sequencers, ordering rules differ today, but sequencer decentralization will bring mainnet-like MEV dynamics, so the same hygiene applies.

### For developers - building MEV-aware apps

* **Do not use spot AMM prices as oracles.** A sandwich or flash loan can move a pool price inside one block. Use Chainlink or TWAP oracles with manipulation thresholds.
* **Add proper slippage checks.** In Uniswap v3, set amountOutMinimum to an actual quote-derived value, not zero. The sherlock-audit issue 91 in July 2025 flagged contracts that left amountOutMinimum at 0 and relied only on sqrtPriceLimitX96, which does not prevent sandwiches.
* **Consider commit-reveal or batch auctions.** For voting, games, or NFT mints, hide choices until all commitments are in. For trading, Uniswap v4 hooks now allow batch auction logic directly in pools, following CoW Protocol's design.
* **Set deadlines.** Enforce short transaction deadlines so bots cannot hold a transaction for several blocks waiting for a profitable reorder.
* **Test with MEV simulation.** Tools like MEV-Inspect and EigenPhi let you replay transactions against historical mempool state to measure LVR and sandwich exposure.

### What is changing in 2025 to 2026

**Enshrined PBS (EIP-7732).** Today PBS runs off-protocol via MEV-Boost and relays. EIP-7732 would move the builder auction into the Ethereum protocol itself, removing the need to trust relays and guaranteeing the proposer is paid even if a builder withholds a payload. Ethereum.org's PBS roadmap notes the spec is advanced but not finalized, with at least a year of research and prototyping ahead as of mid 2026.

**Inclusion lists and FOCIL.** To counter builder censorship, proposers will be able to publish inclusion lists that builders must respect. Each FOCIL list is currently capped at 8 kilobytes. Validators could force inclusion of censored transactions within one to two slots even if the builder would prefer to skip them.

**Encrypted mempools.** Threshold encryption and time-lock puzzles would hide transaction content until after ordering is fixed, so a searcher cannot see what to front run. This is active research and not yet deployed on mainnet.

**Cross-domain MEV.** As activity moves to layer 2s and bridges, MEV spreads across domains. Flashbots' Block Assembly Marketplace (BAM) for Solana's Jito network and similar builder markets for rollups show the same supply chain forming elsewhere. On Solana, Jito-Solana runs on more than 95 percent of stake as of mid 2026, and cumulative Jito tips have reached about $674 million according to Jito's dashboard.

None of these removes MEV entirely. Transparent blockchains with AMMs will always have arbitrage and liquidation incentives. The goal is to keep price-correcting MEV while removing sandwich-style extraction from regular users.

### FAQ

**Is MEV the same as a gas fee?**
No. Gas is the fee you pay to execute computation. MEV is the extra value extracted by reordering or inserting transactions around yours within your slippage. You still pay the same gas, but you receive fewer tokens.

**Does MEV happen on Bitcoin?**
Traditional MEV like sandwiches requires smart contracts and AMMs, so Bitcoin has negligible MEV today. Miners can reorder transactions, and time-bandit reorgs are theoretically possible as block rewards shrink, but this is not comparable to Ethereum DEX MEV.

**Will using Flashbots Protect slow my transaction?**
No. Your transaction goes directly to builders instead of gossiping through the public mempool. Inclusion time is the same, sometimes faster, and gas cost is unchanged.

**Can I profit from MEV myself?**
Running a searcher is a full-time quantitative and infrastructure job. By late 2025 only about 100 of roughly 515 active Ethereum MEV bots were consistently profitable on sandwiches. For most users, protecting trades and providing liquidity through MEV-aware pools returns more than trying to compete.

**Is MEV illegal?**
MEV is not illegal as a protocol mechanic. Arbitrage is widely seen as beneficial. Sandwich frontrunning looks like market manipulation under traditional finance rules, and jurisdictions may treat it differently as regulation develops. ESMA's 2024 to 2025 guidance and US wire fraud charges in the 2023 Peraire-Bueno case show regulators are paying attention.

**Does layer 2 remove MEV?**
No. Today most rollups use centralized sequencers that control ordering, which limits public sandwiching but centralizes MEV with the sequencer. As sequencers decentralize, layer 2 MEV will look more like mainnet. Use the same protections where available.

**What is the simplest protection if I do nothing else?**
Route swaps through Flashbots Protect, MEV Blocker, or CoW Swap. That one habit removes about 95 percent of sandwich exposure for a normal retail trader.

MEV is a core part of how public blockchains work. You cannot avoid it by ignoring it, but you can choose routing and settings that keep price-correcting MEV for the market and keep sandwich MEV off your trades.

## Verifiable Primary Sources & References

1. [Ethereum EIP-721 Non-Fungible Token Standard Specification](https://eips.ethereum.org/EIPS/eip-721)
2. [Ethereum Official Yellow Paper & Protocol Specification](https://ethereum.github.io/yellowpaper/paper.pdf)
3. [Ethereum Consensus Specs & Proof of Stake Architecture](https://github.com/ethereum/consensus-specs)
4. [Solidity Compiler Official Documentation & Language Spec](https://docs.soliditylang.org/)
5. [Uniswap v3 Core Architecture Protocol Whitepaper](https://uniswap.org/whitepaper-v3.pdf)
6. [Aave v3 Technical Protocol Architecture Documentation](https://docs.aave.com/developers/)
7. [Chainlink Decentralized Oracle Networks Architecture Whitepaper](https://chain.link/whitepaper)
8. [MakerDAO Technical Documentation & Maker Protocol Specs](https://docs.makerdao.com/)
9. [Curve Finance Automated Market Maker Specification](https://curve.fi/files/stableswap-paper.pdf)
10. [Base Layer 2 Network Official Documentation](https://docs.base.org/)
