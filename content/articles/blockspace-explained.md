---
title: 'Blockspace Explained - What It Is, Why It Is Scarce, and How Networks Price It'
image: /images/nasa-Q1p7bh3SHj8-unsplash.jpg
data-ai-hint: blockchain blocks data network
description: >-
  Blockspace is the limited capacity inside each block for transactions and
  data. Learn how Bitcoin, Ethereum, Polkadot and Avalanche define, measure and
  price it, and what that means for fees and scaling.
category: Educational
publishedDate: '2026-03-11'
lastUpdated: "2026-09-04"
---
Blockspace is the capacity inside each block that can hold transactions and data. Every block has a fixed cap, and new blocks arrive at a roughly fixed rate. That makes blockspace scarce by design. When demand exceeds that cap, users bid for inclusion and fees rise.

Think of it as the product a blockchain sells. The chain produces a set amount of verifiable compute and storage per second. Applications buy it to settle value, run code, or post data. The price reflects how much security, decentralization and flexibility that blockspace carries.

## Who this is for

* **Users who pay fees.** If you send a transaction, swap on a DEX, or mint an NFT, you compete for the same limited slot. You need to know what drives fee spikes and how to time or route a transaction.
* **Developers choosing where to build.** EVM throughput on one chain is not the same good as isolated capacity on an app-specific chain. Your choice affects gas token, latency, and whether another app can crowd you out.
* **Teams planning scale.** If you run a rollup, a game, or an enterprise ledger, you need to decide between sharing public blockspace, renting dedicated blockspace, or posting data to a separate market such as Ethereum blobs or Polkadot coretime.
* **Operators and analysts.** Validators select what fits in a block. Analysts use block utilization as a demand signal. Both need the measurement rules for each network.

If you only hold assets and never transact, you can use this as background. If you build or transact often, the mechanics below affect cost and reliability.

## How blockspace works

Supply is fixed per unit of time. Demand is volatile. That mismatch creates a fee market. Validators and block builders fill each block with the transactions that pay most per unit of the scarce resource, up to the cap. When blocks are full, the next bidder must pay more. When blocks are empty, fees fall to the protocol floor.

Quality differs across networks. A useful frame from Polkadot describes blockspace as a class of commodities judged on three traits: security (how costly it is to revert), availability (how often it is produced and how much is produced), and flexibility (what kinds of operations it can carry). See robert Habermeier's essay Blockspace over Blockchains and the Polkadot Wiki page on Agile Coretime. A high fee on one network and a low fee on another are not directly comparable if the security backing differs.

### Bitcoin - weight units

Bitcoin limits block capacity by weight, not raw bytes.

* **The limit.** Since the SegWit soft fork (BIP 141) activated at block 481,824 on 24 August 2017, consensus enforces 4,000,000 weight units (WU) per block. Before that, the rule was 1,000,000 bytes, added in 2010 around block 68,951. The network message cap before that was 32 MB.
* **How weight is counted.** Weight = base bytes x 4 + witness bytes x 1. Base data is version, inputs, outputs, locktime. Witness data is signatures. This is the 75 percent witness discount. One vbyte equals four weight units. The virtual size cap is therefore 1,000,000 vbytes. Source: Bitcoin Wiki page on Block weight and Bitcoin Core policy files.
* **What fits.** A block with only legacy transactions maxes out near 1 MB. With typical SegWit usage, blocks are about 1.5 to 2.2 MB on disk and weigh 3.0 to 3.9 MWU. A block can hold roughly 2,000 to 4,000 transactions depending on type. Throughput is about 3 to 7 transactions per second at the base layer. The theoretical max near 4 MB requires a pathological witness-only block that almost never occurs.
* **Fee market.** Fees are quoted in satoshis per vbyte (sat/vB). During quiet periods, 1 to 2 sat/vB can confirm. During inscription or market events, rates have exceeded 200 sat/vB. Miners build templates that maximize fee within the 4 MWU budget, which is why mempool depth is reported in vMB.

You can verify current utilization on explorers such as mempool.space. The mempool research report Block Size Report notes that since SegWit, about 190 G WU of weight went unused on average, which is about 0.475 M vB per block, because miners did not always fill to the cap and because demand varies.

### Ethereum - gas, EIP-1559, and blobs

Ethereum does not have a byte cap. It has a gas limit that caps total computational work per block.

* **Gas limit.** Each block has a gas limit that sets the ceiling for all operations inside it. The network targets 15 million gas per block, with a hard max of 30 million gas. Different operations cost different gas. Simple ETH transfers cost 21,000 gas. A complex contract call can cost hundreds of thousands.
* **EIP-1559 fee market.** Activated 5 August 2021, EIP-1559 replaced a pure first-price auction with a base fee plus tip. Each block has a base fee that acts as a reserve price. The protocol adjusts it every block based on the previous block's usage versus the 15 million gas target. If the previous block used more than the target, the base fee rises. If less, it falls. The max change is 12.5 percent per block. The base fee is burned. Users set a max fee and a max priority fee (tip). Validators keep only the tip. Wallets can estimate fees with eth_baseFee and eth_feeHistory. Source: EIP-1559 spec at eips.ethereum.org and ethereum.org developers docs on gas.
* **What changed for users.** When blocks are below target, the next block's base fee drops a little. When demand persists above target for many blocks, the fee climbs exponentially. Most users set a small tip, about 1 to 2 gwei, and let the wallet set the base fee estimate. Overpaying the tip does not help if the base fee is the binding cost.
* **Blobs and EIP-4844.** Activated 13 March 2024 with the Dencun hard fork, EIP-4844 added a separate blockspace for rollup data. Blobs are 4096 field elements of 32 bytes each, about 128 KiB per blob. The protocol targets 3 blobs per block (about 0.375 MB) and allows up to 6 blobs (about 0.75 MB). Blobs live on the consensus layer, are propagated as sidecars to the beacon block, and are kept for about 18 days, then pruned. They have their own EIP-1559 style fee market for blob gas. Execution layer access is limited to a KZG commitment hash, not the full data. Rollups that moved from calldata to blobs saw costs fall by more than 100 times at launch, before blob fees rose from near zero in later spikes. Source: EIP-4844 spec and the Vitalik Buterin post Ethereum has blobs. Where do we go from here? on 28 March 2024.
* **Why two markets.** Keeping blob gas separate means a surge in rollup posting does not force up execution gas for ordinary transactions in the same way, and vice versa. The long term plan is to scale blob capacity further with techniques such as PeerDAS, aiming for up to 16 MB per slot with sampling, but that requires additional hard forks and testing. Current capacity remains 3 target / 6 max blobs until a parameter change.

### Polkadot - coretime as measured blockspace

Polkadot sells blockspace explicitly through coretime.

* **What coretime is.** Polkadot's relay chain provides shared security. Execution happens on cores. Each core can validate one parablock at a time. Coretime is the time on a core that transforms into blockspace when used. The Polkadot Wiki states: (Secure) blockspace is the resource Polkadot provides, which is measured in and allocated through coretime.
* **Agile Coretime.** Live on Polkadot on 19 September 2024 at block 22602000 via referendum 1161, it replaced the old parachain slot auctions. Previously, teams locked DOT for up to two years to lease a core and produced a block every 12 seconds even if empty. Now coretime is sold in bulk or on demand. Source: Polkadot Developer Docs on Agile Coretime, Polkadot Wiki, and Parity's Agile Coretime: Polkadot beyond parachains post.
* **Bulk coretime.** A 28-day continuous allocation, represented as an NFT, bought in DOT through on-chain sales. It can be split, shared, or resold. If held whole and assigned to one chain, it is eligible for price-capped renewal. Splitting or pooling removes that renewal right. This gives predictable rent for heavy duty chains.
* **On-demand coretime.** Pay per block in DOT from a pool of cores reserved for spot use. Useful for early stage projects, occasional settlement, or elastic scaling when a chain needs extra capacity during a spike.
* **Supply and economics.** The relay chain can handle about a hundred cores cleanly, with tests at 80 cores and work to reach several hundred with optimizations. Coretime sales revenue is burned, which offsets issuance. The broker pallet on the Coretime Chain manages sales, assignments, and renewals.

This model makes waste visible. A chain that posts empty blocks every 12 seconds on a leased core was wasting blockspace. With coretime, that same chain can buy less and scale up only when needed.

### Avalanche - isolated blockspace per L1

Avalanche isolates blockspace by giving each application its own chain when needed.

* **Primary Network.** Three chains share one validator set: P-Chain coordinates validators and L1 management, C-Chain runs the EVM for Solidity contracts, X-Chain handles asset creation. C-Chain uses AVAX for gas and supports standard Ethereum tooling with chain ID 43114. RPC is https://api.avax.network/ext/bc/C/rpc. Source: build.avax.network docs on Avalanche L1s.
* **From subnets to Avalanche L1s.** Subnet was the old term. Since the Etna upgrade (Fuji 25 November 2024, mainnet 16 December 2024), they are called Avalanche L1s. The key Etna change is ACP-77: an L1 validator no longer needs to validate the Primary Network and no longer needs to stake 2,000 AVAX. Source: Avax Network blog post Etna: Enhancing the Sovereignty of Avalanche L1 Networks and L1 FAQ at support.avax.network.
* **Continuous fee.** L1 validators pay a continuous fee to the P-Chain instead of a large stake. The minimum is 512 nAVAX per second, which is about 1.33 AVAX per validator per month while the network is below its validator target, adjusted by a dynamic fee model under ACP-103. If the P-Chain fee balance runs out, the validator is removed. Primary Network validators still stake 2,000 AVAX.
* **Own rules per L1.** Each L1 runs its own VM. Subnet-EVM is a fork of go-ethereum for EVM L1s. The operator can set genesis allocations, choose any token for gas, decide whether fees burn or go to a treasury, set a higher gas limit for higher throughput, and enforce allowlists, geographic or KYC rules, or a private chain where data is visible only to approved validators. That choice controls who can use that specific blockspace.
* **Isolation.** Load on one L1 does not raise gas price on another. A popular NFT mint on the C-Chain does not push fees on a gaming L1. This avoids the noisy neighbor effect seen on a single shared state. The cost is that each L1 has its own smaller validator set, often 5 to 20 validators on smaller L1s, versus hundreds on the Primary Network, and must run its own infrastructure and messaging.

### What about other networks

Solana uses a different capacity model with high throughput and a fee market that has evolved to include local fee markets per account and priority fees. Base layers that use proof of history and parallel processing measure blockspace differently from Bitcoin weight or Ethereum gas. Compare only after adjusting for those designs. A fee of 0.05 dollars on a rollup and 2 dollars on Ethereum L1 do not reflect the same security or data retention guarantees.

## How blockspace is priced in practice

* **Fixed supply per second.** Bitcoin produces a block about every 10 minutes with up to 4 MWU. Ethereum produces a block every 12 seconds with up to 30 M gas plus up to 6 blobs. No extra supply appears even if more miners or validators join. More hardware raises security, not immediate throughput.
* **Demand spikes.** NFT mints, airdrops, liquidations, and MEV bots cause bursts that fill blocks. When utilization hits the cap, the fee auction binds. Bitcoin fees are in sat/vB. Ethereum base fee rises up to 12.5 percent per block until demand cools. Blob base fee rises only when blob usage exceeds its separate target.
* **Selection.** Validators and builders sort pending transactions by fee per weight or fee per gas and pack the most profitable set. That is why two transactions of the same byte size can pay very different fees if one uses copied witness data or does more computation.
* **Evidence of trade-offs.** A 2025 SBFC paper that studies EIP-1559 on Ethereum finds that base fee predictability rose after the upgrade, but average fee and dispersion also rose in its sample, while transactions per block fell as blocks were dynamically sized. Other studies find different net effects depending on window. The point is measurable: mechanism design changes distribution of fees and inclusion, and data must be checked per period.

## Pros and cons

**Pros:**

* **Clear scarcity gives predictable incentives.** Fees replace inflation as demand grows. Bitcoin's halving schedule explicitly relies on fee revenue to fund security as subsidy falls.
* **Verifiable settlement.** Buying blockspace means your transaction is ordered by consensus and quickly becomes expensive to revert. That is different from off-chain promises.
* **Flexible products.** You can now choose executed blockspace (EVM gas), data-availability blockspace (blobs), measured coretime (Polkadot), or isolated chain blockspace (Avalanche L1). Each has different cost, retention and security.
* **Ecosystem reuse.** Layer 2 solutions compress many L2 transactions into one L1 blob or calldata batch. Rollups process thousands of user actions while using far less L1 blockspace per action than sending each one directly to L1.

**Cons:**

* **Congestion pricing can exclude small users.** When blocks are full, a 5 dollar fee is trivial for a large trader but blocks a remittance. Timing and batching matter.
* **Fragmentation.** Isolated blockspace splits liquidity, stablecoin supply and tooling. Moving value between L1s or rollups needs bridges or messaging such as Avalanche ICM with Teleporter or Ethereum blob verification flows, which add complexity and trust assumptions.
* **New dimensions add complexity.** Separate blob fees, coretime markets and L1 fee balances are more to monitor. A Polkadot team must manage renewals and splits correctly to keep price caps. An Avalanche L1 team must fund its P-Chain balance or lose validators.
* **Quality vs cost trade-off is real.** The cheapest blockspace is not always the most secure. A small L1 validator set or a new rollup sequencer has different liveness and reorg assumptions than Bitcoin or Ethereum mainnet. Check the actual economic security backing the blockspace you rent.

## How to use this

### If you are paying for transactions

1. **Check utilization before you send.** Look at the block explorer or fee estimator. For Bitcoin, mempool.space shows vMB queued and fee tiers. For Ethereum, explorers and wallets show base fee, priority fee, and blob base fee. When utilization is low, you can use a lower tip.
2. **Pick the right blockspace.** For an Ethereum rollup, see if the app uses blobs. Posting to a rollup that uses blobs will usually cost cents versus dollars on L1 directly. For a Polkadot app, see if it uses on-demand coretime for occasional writes.
3. **Batch and compress.** Group transfers, use multisend, or move activity to a rollup or L1 where your transactions do not compete with global traffic.
4. **Do not overpay tips blindly.** On Ethereum, raising the tip only helps you outbid others in the same block. If the base fee is high due to recent full blocks, you still pay that base fee regardless of tip.

### If you are building an app

1. **Estimate honestly.** Measure gas per action on testnet with realistic data. On Ethereum, test both execution gas and blob gas costs. On Bitcoin, test vsize per transaction type. On Avalanche, set your L1 gas limit to match validator bandwidth.
2. **Decide on isolation.** Start on a shared chain if you need immediate liquidity, wallets, and tooling. Move to an Avalanche L1, Polkadot coretime, or an Ethereum rollup when you need your own fee rules, token for gas, compliance controls, or predictable latency under your own load.
3. **Plan for retention.** Blobs are available for about 18 days, not forever. If you need permanent data, pin to an indexing service or data availability layer. If you need long term state on Polkadot, budget for bulk coretime renewals. If you run an Avalanche L1, fund the P-Chain fee balance and monitor the validator manager contract.
4. **Wire pricing into UX.** Show gas estimates in the user's currency, explain why a fee rose, and offer alternatives: wait for lower utilization, use lower priority, or switch to a layer with cheaper blockspace for that action.

## FAQ

**What is blockspace in one sentence?**
Blockspace is the limited amount of data and computation a blockchain can include and finalize in each block, sold per unit of time to those who want their transactions settled.

**Is blockspace the same on every chain?**
No. Bitcoin measures it in weight units, Ethereum in gas plus blob gas, Polkadot in coretime that turns into blockspace, and Avalanche L1s define their own gas and fee rules. Do not compare fees across networks without adjusting for security and retention.

**Why not just make blocks bigger?**
Bigger blocks raise bandwidth, storage and validation cost for every node. That can raise the cost to run a full node and reduce decentralization. Bitcoin kept a conservative weight cap. Ethereum caps execution gas and uses a separate, pruned blob space for data. Polkadot scales by adding cores. Each approach trades throughput against node requirements differently.

**What does EIP-1559 fix and what does it not fix?**
It makes base fee changes predictable, with a 12.5 percent per block limit and a burn that offsets issuance, and it lets blocks expand to 30 M gas briefly when demand spikes. It does not add long term throughput and does not prevent fee spikes when demand stays above target for many consecutive blocks.

**What do blobs change for Ethereum users?**
Blobs give rollups a cheaper place to post batch data. After March 2024, rollups shifted from expensive calldata (16 gas per non-zero byte, 4 per zero byte) to blobs with a separate fee market. That lowered L2 fees sharply when blob supply was ample. When blob demand exceeds the 3 target per block, blob fees rise independently.

**How does Polkadot coretime differ from renting a parachain slot?**
Slots locked DOT for up to two years and gave a core every 12 seconds regardless of use. Coretime is bought for 28 days in bulk or per block on demand, can be split and resold, and offers a price-capped renewal if kept whole. It went live 19 September 2024.

**How does Avalanche keep app traffic from spiking fees for everyone?**
By isolation. Each Avalanche L1 has its own VM, gas token, fee config and validator set. A surge on one L1 does not compete for gas on another L1 or the C-Chain. After Etna, L1 validators pay about 1.33 AVAX per month per validator to the P-Chain instead of staking 2,000 AVAX on the Primary Network.

**When should I use a rollup versus an Avalanche L1 versus Polkadot coretime?**
Use a rollup if you want Ethereum security for settlement while posting data cheaper to blobs and inheriting Ethereum wallets and liquidity. Use an Avalanche L1 if you need a sovereign chain with your own gas token, fee burning rules, or permissioning. Use Polkadot coretime if you want shared security via the relay chain with explicit rental of execution cores that you can scale up on demand.

**Where can I verify these numbers?**
Bitcoin weight and limits on en.bitcoin.it wiki and Bitcoin Core source. Ethereum gas and fee history on ethereum.org developers docs, EIP-1559 and EIP-4844 at eips.ethereum.org, and blob details on the Vitalik Buterin blog. Polkadot coretime on docs.polkadot.com and wiki.polkadot.com. Avalanche L1 fees and Etna details at build.avax.network and support.avax.network.

## Verifiable Primary Sources & References

1. [Ethereum EIP-721 Non-Fungible Token Standard Specification](https://eips.ethereum.org/EIPS/eip-721)
2. [Ethereum EIP-1559 Fee Market Change Specification](https://eips.ethereum.org/EIPS/eip-1559)
3. [Ethereum EIP-4844 Proto-Danksharding Specification](https://eips.ethereum.org/EIPS/eip-4844)
4. [Ethereum EIP-712 Typed Structured Data Hashing and Signing](https://eips.ethereum.org/EIPS/eip-712)
5. [Ethereum Official Yellow Paper & Protocol Specification](https://ethereum.github.io/yellowpaper/paper.pdf)
6. [Bitcoin: A Peer-to-Peer Electronic Cash System Whitepaper](https://bitcoin.org/bitcoin.pdf)
7. [Ethereum Consensus Specs & Proof of Stake Architecture](https://github.com/ethereum/consensus-specs)
8. [Solidity Compiler Official Documentation & Language Spec](https://docs.soliditylang.org/)
9. [Base Layer 2 Network Official Documentation](https://docs.base.org/)
10. [Solana Core Architecture Documentation](https://docs.solana.com/)
