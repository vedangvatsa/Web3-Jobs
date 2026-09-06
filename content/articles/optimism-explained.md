---
title: 'Optimism Explained - OP Mainnet, the OP Stack, and the Superchain'
description: >-
  Optimism is an Ethereum Layer 2 optimistic rollup that runs transactions off
  chain and settles to Ethereum. Learn how OP Mainnet works, what the OP Stack
  and Superchain are, how fees and fault proofs operate, and how governance and
  the OP token fund public goods.
category: Technology Deep Dives
data-ai-hint: optimism blockchain layer2
publishedDate: '2026-03-11'
lastUpdated: "2026-09-06"
---
Optimism is an Ethereum Layer 2 that executes transactions off Ethereum and posts the data back to Ethereum for security. The main network, OP Mainnet, is an optimistic rollup. It gives you Ethereum addresses and tools, near instant confirmations from a sequencer, and fees that are a fraction of mainnet, while final settlement happens on Ethereum.

The same codebase that runs OP Mainnet is packaged as the OP Stack, an open modular framework. Teams use it to launch their own L2s. The set of OP Stack chains that settle to Ethereum together is called the Superchain. Base by Coinbase, World Chain, Mode, Zora, Ink by Kraken, Soneium by Sony, and Unichain are all OP Stack chains.

## Who this guide is for

* **Users who pay gas.** You want to do swaps, transfers, and mints without mainnet fees, but you want to stay inside Ethereum security rather than move to a separate L1.
* **Developers choosing where to deploy.** You need EVM equivalence, low fees, and predictable bridging, and you want to know what you trade for it in withdrawal time and sequencer trust.
* **Teams evaluating the OP Stack.** You are deciding whether to build on OP Mainnet or to launch your own chain with the same stack. You need to understand fees, upgrades, and governance before you commit.

If you only use Ethereum mainnet today, this guide shows when Optimism helps, what it costs, and where the limits are.

## What OP Mainnet is

OP Mainnet is chain ID 10. It uses ETH for gas, not OP. It is EVM equivalent, which means it reuses Ethereum execution code and behaves as close to Ethereum as possible. A contract that costs 100,000 gas on Ethereum costs 100,000 gas on OP Mainnet. The difference is the gas price is much lower on OP Mainnet.

Key facts:

* **Network:** OP Mainnet, chain ID 10, currency ETH. Public RPC at https://mainnet.optimism.io, explorer at https://explorer.optimism.io. Testnet is OP Sepolia.
* **Block time:** 2 seconds. Blocks are produced every two seconds even if empty. You get a soft confirmation from the sequencer in seconds, with full Ethereum finality after the batch is posted, derived, and after the challenge window if you are withdrawing to L1.
* **Data to L1:** Batches are compressed and posted to Ethereum as blob-carrying or calldata transactions via a non-contract address `0xff00...0010` to minimize L1 gas. Posting to L1 is the main cost of an OP Mainnet transaction.
* **Operator:**Today the Optimism Foundation runs the single sequencer that orders transactions and submits batches. You can submit through L1 if the sequencer censors or stalls.

OP Mainnet launched in 2021 as Optimism PBC's first rollup. The current architecture is Bedrock, activated June 6, 2023 at L2 block 105235063 (timestamp 1686068903) after Token House approval. Bedrock made the stack modular, cut fees, shortened block times to 2 seconds, and made multi-client operation practical.

## How optimistic rollups work on Optimism

Optimism does not provide its own consensus. It borrows Ethereum consensus and adds execution off chain.

### The basic flow

1.**Submit.**You send a transaction to the sequencer, or you submit a deposit on L1. Deposits are L1 transactions that the L2 must include. They appear in the first L2 block of the epoch that corresponds to that L1 block, usually a few minutes later.
2.**Execute off chain.**The L2 execution engine `op-geth` runs the transaction and updates the state tree. The rollup node `op-node` can derive the same blocks from L1 data via the derivation pipeline. Execution engines also sync peer to peer for speed, but derivation from L1 is the censorship resistant path.
3.**Batch and compress.**The sequencer groups transactions into batches, compresses them, and posts the compressed bytes to Ethereum. Compression matters because you pay for every byte posted. Since Fjord (July 10, 2024) the fee estimator uses FastLZ and a linear model calibrated against Brotli batch compression.
4.**Commit state.**The rollup contracts on Ethereum store a new output root that commits to the L2 state, plus a batch root for inclusion proofs.
5.**Challenge or finalize.** The output root sits in a challenge window for about 7 days. Anyone running a node can check it against the data on L1. If it is wrong, they can challenge it with a fault proof. If no valid challenge wins, the root is final and L1 contracts can safely accept withdrawal proofs against it. A successful challenge removes only the posted commitment. It does not roll back L2 ordering or state.

### Deposits and withdrawals

* **L1 to L2 (deposit):** You call the bridge on L1. The deposit is included in the next appropriate L2 block. No challenge period on the way in. You track it via the deposit flow docs.
* **L2 to L1 (withdrawal):** You initiate on L2, then prove on L1 that the withdrawal was included in a posted output root, then finalize after that root is final. Through the canonical bridge that final step takes about 7 days. The dispute game itself has a 3.5 day finality delay, with the full withdrawal clock around a week. Testnets use a shorter window. You can use a third party liquidity bridge for faster exits, but you pay a fee and add counterparty risk.

This is why sequencer confirmations are not L1 finality. Your wallet shows the 2 second confirmation quickly, but a bridge needs the posted root and its challenge window.

## How fees work on OP Mainnet

An OP Mainnet fee has three parts after the Isthmus upgrade. Before Isthmus there were two.

```
before Isthmus: totalFee = gasUsed * (baseFee + priorityFee) + l1Fee
after Isthmus:  totalFee = operatorFee + gasUsed * (baseFee + priorityFee) + l1Fee
```

#### 1. Execution gas fee

Same as Ethereum. EIP-1559 base fee plus optional priority fee. The base fee parameters are tuned for 2 second blocks, but behavior is the same. The sequencer prioritizes higher priority fee transactions. You can estimate with `eth_maxPriorityFeePerGas`. A time-boxed experiment in stake-based priority ordering was scheduled for May 26, 2026 for up to four weeks via `PolicyEngineStaking`, with reversion to priority fee ordering after.

#### 2. L1 data fee

This pays to publish your transaction to Ethereum. It is deducted automatically from the sender. You cannot set a separate max for it with current transaction types. It is the dominant cost on quiet L2 days.

* Before Ecotone (March 14, 2024): computed from zero bytes (4 gas) and non-zero bytes (16 gas), plus fixed overhead 188 gas and dynamic overhead 0.684, multiplied by the Ethereum base fee relayed to L2 every L1 block.
* With Ecotone: adds blob support. The formula switches to a compressed size estimate (`(zero*4 + nonZero*16)/16`) and a weighted gas price `16*base_fee_scalar*base_fee + blob_base_fee_scalar*blob_base_fee`. Scalars are set by chain governance, with base fee scalar initialized from dynamic overhead and blob scalar at 0 at upgrade.
* With Fjord: uses the FastLZ compressed size in a linear model `estimatedSizeScaled = max(minTransactionSize*1e6, intercept + fastlzCoef*fastlzSize)` and computes `l1FeeScaled = baseFeeScalar*l1BaseFee*16 + blobFeeScalar*l1BlobBaseFee`, then `l1Cost = estimatedSizeScaled * l1FeeScaled / 1e12`.

The L1 fee tracks Ethereum base fee and, for blob-enabled chains, the blob base fee. Both are relayed trustlessly to L2 every L1 block and can move at most 12.5 percent per update, so short term swings are small.

Since EIP-4844 in the Dencun upgrade (March 13, 2024), OP Stack chains can post batches as type 3 blob-carrying transactions. Each blob holds 4096 field elements of 32 bytes, about 128 KiB usable per blob. Ethereum targets 3 blobs per block (0.375 MB) and allows up to 6 (0.75 MB). Pectra (May 2025, EIP-7691) doubled the target to 6 and max to 9. Blobs are not kept in execution state. Consensus nodes hold them for about 4096 epochs, roughly 18 days, then prune. Operators and indexers that need longer history must store it themselves. The separate blob fee market means L2 data costs do not have to spike just because mainnet execution is busy.

#### 3. Operator fee (after Isthmus)

A chain-operator set fee for custom pricing or cost recovery. It is charged like other EVM fees, sent to the Operator Fee Vault, and deposits are exempt.

```
after Isthmus: operatorFee = operatorFeeConstant + (gasUsed * operatorFeeScalar / 1e6)
after Jovian:  operatorFee = operatorFeeConstant + (gasUsed * operatorFeeScalar * 100)
```

Values are read from L1 attributes or the L1 Block Info contract at `0x4200000000000000000000000000000000000015` (scalar `uint32` in slot 8 offset 0, constant `uint64` offset 4). Transaction pools must check balance against the worst case operator fee.

Fee vaults collect each component. Unlike Ethereum where base fee is burned, OP Stack chains keep fees in vaults for the operator to withdraw.

What this means in practice for users: an L2 transfer is usually priced as a few cents of execution plus a L1 data fee that moves with Ethereum. OP docs and gas trackers in August 2026 show typical OP Mainnet transfers in the $0.02 to $0.05 range, USDC transfers $0.03 to $0.10, and swaps $0.10 to $0.60 in calm periods, with variation by calldata size and mainnet or blob congestion. A 5-hop swap with large input costs more because the L1 fee scales with input size, and a failed L2 transaction still pays the L1 fee because the data was already posted.

## The OP Stack

The OP Stack is the modular, shared, open source stack that powers OP Mainnet. It separates execution, consensus, settlement, and data availability into swappable layers.

* **Modular.** You can change components without forking everything. The current default uses `op-geth` and `op-node`, but Bedrock was designed for multi-client diversity with at least two clients to reduce single implementation risk.
* **Rollup focused.** The Bedrock release ships as a production optimistic rollup. Other configurations need hacking the stack and you should expect limited support if you deviate.
* **Interoperable direction.** The long term design adds native cross chain messaging so OP Stack chains can communicate with smaller trust assumptions. The interop explainer describes dependency sets and a super node that verifies messages from chains you have opted to trust. Assets move via mint and burn, not wrapping, when that messaging is used.

If you run your own chain, you deploy the L1 contracts, run a sequencer and batcher, choose scalar settings for L1 fees, and handle upgrades via the same hardfork schedule as the Superchain. Bedrock is the base. The Superchain registry sets default activation timestamps and each chain can override them in its config.

### Network upgrades since Bedrock

Bedrock is the root. On top of it the Superchain applies time based hardforks:

* Regolith - at Bedrock genesis
* Canyon - Jan 11, 2024 (OP Mainnet 17:00 UTC), Nov 14 2023 on Sepolia
* Delta - Feb 22, 2024
* Ecotone - March 14, 2024 (00:00:01 UTC) - adds EIP-4844 blob option and scalar changes
* Fjord - July 10, 2024 - FastLZ estimator
* Granite - Sept 11, 2024
* Holocene - Jan 9, 2025
* Isthmus - introduces operator fee
* Jovian - changes operator fee formula

Each activation is governed through the Token House and executed via the portal proxies on L1.

## The Superchain

The Superchain is the network of L2s that share the OP Stack and settle to Ethereum. Optimism's site lists 50 plus chains, including Base, World Chain, Mode, Zora, Ink, Soneium, and Xlayer. The site also states the OP Stack share is a majority of L2 transactions, a claim that moves with weekly volume.

What the Superchain shares today: same execution semantics, common bridge patterns, shared derivation, and common upgrade governance. What it aims to share next: fast native interoperability and shared sequencing options. The current live bridging between OP Stack chains still uses standard L1 settlement unless you opt into the interop dependency set. Treat two OP Stack chains as distinct networks with shared mechanics until the interop set is live on the chains you use.

## Fault proofs and security

Optimistic rollups are secure only if invalid output roots can be caught and removed.

**Fault proofs went live on OP Mainnet June 10, 2024.** They moved proposals and challenges from a permissioned allowlist to permissionless. Key parts:

* **Permissionless proposals.** Anyone can submit a state proposal via `DisputeGameFactory`. Most commonly you use this to prove your own withdrawal if the operator is not posting.
* **Permissionless challenges.** Anyone running a node with `op-challenger` can dispute a proposal within the window of about 7 days. Ethereum settles the dispute by interactive bisection down to a single step executed in the Cannon VM. The loser is slashed.
* **Bonds.** Proposals require a bond. OP Mainnet uses 0.08 ETH initial bond per `FaultDisputeGame`. Posting hourly across the 7 day window needs roughly 14 ETH locked plus gas. Bond amounts escalate with counter claims to deter spam, as seen on OP Sepolia games.
* **Modularity.** The system is built for multi-proof. Cannon is the first proof program. Others can be added so a bug in one system does not have to be fatal.
* **Safeguards.** Off chain monitoring `op-dispute-mon` watches roots, an airgap window after a game finalizes lets the Guardian reject a bad root before withdrawals execute, and `DelayedWETH` holds bonds with a payout delay so they can be redirected if a game resolved incorrectly.

The Guardian is the Optimism Security Council. It can pause withdrawals, blacklist a game, or fall back to a permissioned game if the fault proof system fails. The trust assumption is that the Guardian does not need to intervene for normal operation, which maps to Stage 1 in L2Beat's stages. Stage 0 relies on operators, Stage 1 has live proofs with some safeguards, Stage 2 is the goal of full decentralization.

Other risks:

* **Single sequencer.** Today there is one sequencer per chain. It can delay or reorder until you force inclusion through L1. On OP Mainnet L1 to L2 force inclusion has an up to 12 hour delay pattern versus Arbitrum's 24 hour plus timeout variant. You keep safety via forced inclusion, but you pay time and L1 gas.
* **Data availability.** Output roots are useful only if the data is on Ethereum. OP Mainnet posts to Ethereum, so anyone can rebuild and challenge. Chains that post elsewhere give up that guarantee.
* **Upgrade keys and proofs.** Most OP Stack chains still use a small prover set and upgrade proxies controlled by a multisig or Security Council that can change contracts. Check L2Beat, the chain docs, and the `superchain-registry` for your chain's stage and delay before you lock large value.

## Governance and the OP token

The Optimism Collective governs the protocol and the allocation of OP. It uses two houses.

* **Token House.** OP holders and their delegates. They vote on protocol upgrades, treasury allocation, chain inclusion in the Superchain, and sequencer selection. To vote you must delegate. You keep ownership of the tokens. You can delegate to yourself or to a third party. Undelegated OP cannot vote.
* **Citizens House.** One person one vote, based on identity via soulbound attestations (AttestationStation). Its main job is to allocate funding for public goods through Retro Funding. Citizens are selected as badgeholders. Criteria have changed over rounds and are set by governance.

The two houses together execute upgrades via on chain governance that controls the L1 proxy contracts for OP Mainnet and other Superchain chains.

### Retro Funding

Retro Funding (formerly RetroPGF) pays for impact that has already happened, on the idea that it is easier to judge what was useful than to predict what might be useful. A funding scope is declared, projects apply, Citizens review impact, and voting produces scores that set payouts.

* Round 2 (Jan 2023) allocated 10 million OP to public goods and OP Stack work.
* Round 3 (fall 2023) allocated 30 million OP for contributions that supported development and adoption of Optimism, with voting Nov 6 to Dec 7 2023 and disbursement in early 2024.
* Later rounds continue quarterly. Future scope will be set by Citizens rather than the Foundation.

Funding comes from two sources: a 20 percent share of the initial OP supply reserved for Retro Funding, and sequencer revenue from OP Mainnet and other chains that contributes to the treasury for redistribution. Sequencer revenue is the long term sustainable source. The right to sell sequencing participation is planned to contribute as sequencing decentralizes.

### OP tokenomics

Total supply is 4,294,967,296 OP (2^32). The initial allocation in community docs is:

* Ecosystem Fund 25 percent - proactive grants to projects and communities
* Retro Funding reserve 20 percent - retro rewards for public goods
* User airdrops 19 percent - series of airdrops for helpful behaviors
* Core contributors 19 percent - lockup applies
* Investors 17 percent - lockup applies

A Governance Fund of about 5.4 percent sits inside the Ecosystem Fund for Token House votes on project incentives. The Foundation expects the proactive Ecosystem Fund to be replaced over time by private investment that can be repaid via Retro Funding exit.

Airdrops to date were 5 rounds between 2022 and 2024 totaling 269.1 million OP. Airdrop 1 in May 2022 distributed over 200 million OP across 248,699 addresses, based on early and frequent Optimism use and on Ethereum behaviors like Gitcoin donations. Eligibility checked on app.optimism.io, with claim requiring delegation. On August 19, 2026 governance approved moving the remaining User Airdrop allocation of about 546.9 million OP (roughly 12.7 percent of supply, about $50 million at the vote time) into a new Strategic Ecosystem Fund controlled by the Foundation for partnerships, liquidity on OP Mainnet, and institutional onboarding. There is no active user airdrop planned after that vote. Rely on gov.optimism.io and the official app for any future claim.

OP does not pay gas. Gas is ETH on OP Mainnet. OP is a governance token and a funding rail for the ecosystem.

## Pros and cons at a glance

| Area | What Optimism gives you | What you trade |
| --- | --- | --- |
| Fees | Execution gas much lower than L1, plus a L1 data fee that is small per tx when batches compress well and blobs are calm. Typically cents per transfer in normal conditions, an order of magnitude cheaper than L1 for swaps and mints. | You still pay L1. Large calldata, many L2s competing for blobs, or a mainnet gas spike raises your OP fee. You cannot cap the L1 fee with current transaction types. |
| Speed | 2 second soft confirms from sequencer. Apps feel instant. | Soft confirm is not L1 finality. Canonical bridge exits take about 7 days. You need a liquidity bridge for speed, which adds cost and trust. |
| EVM fit | EVM equivalent at bytecode level. Most Solidity, Hardhat, and Foundry workflows port without changes. | Edge differences remain in fee estimation and L1 fee accounting. Test your app on OP Sepolia, not just mainnet fork. |
| Security | Posts data to Ethereum and enforces fault proofs. Stronger than a sidechain or validium that keeps data off L1. | Single sequencer today, upgrade keys held by Security Council, and fault proof liveness depends on watchers paying L1 gas. Stage 1, not Stage 2. |
| Ecosystem | Superchain gives shared tooling, bridges, explorers, and RPC providers. 50 plus chains share the same core. | Superchain interop is still rolling out. Cross chain today still settles via L1 unless you use an explicit interop dependency set and supernode. |
| Funding | Retro Funding rewards work that already helped the Collective. Useful for open source funding and grants. | Retro allocation is governed and competitive. Do not plan revenue on winning it. Check round scope and scoring before you apply. |

## How to get started

### If you are a user

1. **Add OP Mainnet to your wallet.**Chain ID 10, currency ETH, RPC https://mainnet.optimism.io, explorer https://explorer.optimism.io. Use the docs for the exact `chainId` and contract addresses. Do not trust random RPCs in search results.
2.**Bridge ETH to OP Mainnet first.**Use the official bridge at https://app.optimism.io/bridge/deposit for the canonical path. It locks on L1 and mints on L2. Start with a small test amount and confirm receipt before you move more. Third party bridges and aggregators are faster for returns, but they front funds and add risk.
3.**Track finality for money moves.**For a deposit, check L1 inclusion and the L2 epoch. For a withdrawal, check the L2 transaction, the batch posted on L1, the fault game status, and the 7 day clock. Do not treat a sequencer confirmation as settled for a treasury move.
4.**Watch fees before large transactions.**Check Ethereum base fee and blob base fee. When mainnet is calm, OP fees drop too. Avoid large calldata transactions during spikes. Remember failed L2 transactions still pay the L1 fee.
5.**Use native tooling.**OP Mainnet uses the same explorers and wallets as Ethereum. Set allowance limits, revoke unused approvals, and keep high value exits on the canonical bridge.

### If you are a developer

1.**Deploy on OP Sepolia first.**Use https://console.optimism.io/faucet for test ETH. Deploy with Hardhat, Foundry, or Remix as you would on Ethereum. Verify on the explorer and test the bridge flows in both directions.
2.**Measure fees, not just gas.**Your 100,000 gas contract costs 100,000 gas on OP Mainnet, but you need to measure the L1 data fee. Use the `GasPriceOracle` at `0x4200...000F` and the L2 fee estimators. Compress input calldata and avoid unneeded bytes. After Isthmus, check operator fee scalar and constant at `0x4200000000000000000000000000000000000015`.
3.**Handle cross chain timing in code.**L1 to L2 takes minutes. L2 to L1 via the canonical path takes about a week. Do not assume a synchronous callback. Emit an event on L2, prove it on L1 after finality, then execute on L1. Test message passing with the Standard Bridge examples in the docs.
4.**Plan for sequencer outages.**Add a path that submits a deposit through L1 if the sequencer does not include a transaction. Test force inclusion on Sepolia with a delayed sequencer scenario. Document it for support.
5.**Review the chain you depend on.**Check `superchain-registry`, L2Beat stage, audit history, scalar settings, and whether blobs are enabled and how fallback to calldata works when blob fees spike. Pin to a hardfork version and test upgrades like Ecotone, Fjord, and Isthmus before they activate on mainnet.

### If you are launching an OP Stack chain

1.**Start from Bedrock, not a hack.**Use the chain operator quickstart and the `superchain-registry` defaults. Deploy L1 contracts, configure batcher, proposer, and challenger, and fund the proposer bond (0.08 ETH per game, about 14 ETH to sustain hourly proposals across a week on OP Mainnet params).
2.**Set fees deliberately.**Choose `base_fee_scalar` and `blob_base_fee_scalar` to recover L1 spend, plus operator fee values if you enable Isthmus. See the Tune batcher costs guide for calibration.
3.**Run the challenger.**If you enable permissionless fault proofs, run `op-challenger` and `op-dispute-mon`. Normal users do not need to run `op-proposer` except to propose their own withdrawal root if you stop proposing.
4.**Use governance.** Superchain chain additions, sequencer set changes, and upgrades go through the Token House. Track proposals at https://vote.optimism.io and the governance forum.

## Risks and constraints you should weigh

* **Centralized sequencing.** One sequencer orders blocks and can extract ordering value. Etherscan and L2Beat flag which chains have permissionless sequencing. L1 forced inclusion is your escape hatch, but it costs time.
* **Proof system youth.** Fault proofs are live and open source since June 2024, but the prover set is small, `op-challenger` operation is specialized, and the Guardian can intervene. L2 stages reflect this. Wait for Stage 2 before you assume no trust in the council.
* **Blob competition.** Blob space is limited. When many rollups post at once, blob base fee rises and your L1 fee follows. Some chains fall back to calldata when blobs are expensive, which then tracks Ethereum base fee instead.
* **Contract and circuit bugs.** Fraud proof, derivation, and bridge contracts have had fixes. Review audits, the fault proof specs at specs.optimism.io, and the 3.5 day plus 7 day delays before you treat a large bridge as instant.
* **Token price volatility.**Retro Funding and airdrop budgets are denominated in OP. If OP falls, funding buys less. If you build public goods for retro rewards, keep a treasury plan that does not need the award to survive.

## FAQ**What is the difference between Optimism, OP Mainnet, and the OP Stack?**Optimism is the project and the Collective that governs it. OP Mainnet is the main L2 network, chain ID 10, that settles to Ethereum. The OP Stack is the modular open source codebase that powers OP Mainnet and lets others launch their own L2s with the same semantics.**Why not just make Ethereum blocks bigger instead of using Optimism?**Bigger blocks need larger nodes and hurt decentralization. Rollups keep L1 small and secure and move execution to L2s that post data to L1. That is the rollup centric roadmap Ethereum chose.**How does Optimism compare to Arbitrum or Base?**All three are optimistic rollups with 7 day style challenge windows and compression to L1. OP Mainnet and Base share the same OP Stack and fault proof system since June 2024. Arbitrum One uses the Nitro stack and BoLD with a 6.4 day window and its own bonding logic. Base often prices its L1 scalars slightly lower than OP Mainnet, so an identical transaction can be a few cents cheaper on Base. Check fee scalars and L2Beat stages rather than picking on price alone.**Is Optimism cheaper than Ethereum?**In normal conditions an OP Mainnet transfer is $0.02 to $0.05 versus $0.50 to $3 on L1, roughly 20 to 60 times less. Swaps are often $0.10 to $0.60 versus $5 to $30 on L1. The saving comes from sharing one L1 posting cost across many L2 transactions and from blob posting since March 2024. Costs rise when mainnet or blob fees spike.**How long do withdrawals take, and can I speed them up?**Via the canonical bridge about 7 days on mainnet. The fault game contributes about 3.5 days of that. Liquidity bridges and aggregators can move funds in minutes by fronting capital and charging a fee, but you trust them to remain solvent and not pause.**What are blobs and how long do they stay?**Blobs are binary fields in type 3 blob-carrying transactions introduced by EIP-4844. They are about 128 KiB usable per blob. Consensus nodes hold them for about 18 days (4096 epochs) then prune. Execution state sees only the versioned hash of the KZG commitment. Rollup operators and indexers must store history themselves if they need it longer.**Is the OP token used for gas?**No. Gas on OP Mainnet is ETH. OP is for governance in the Token House and for funding via the Ecosystem Fund and Retro Funding. To vote you delegate OP to yourself or to a delegate.**Who governs Optimism?**The Optimism Collective with the Token House (OP holders, delegated) and the Citizens House (identity based, badgeholders). Together they approve upgrades that change the L1 portal contracts that secure OP Mainnet and other Superchain chains. The Security Council acts as Guardian for fault proof fallback.**Which should I pick today if I need fast canonical exits?**If you cannot wait 7 days and you want the canonical path, look at a well reviewed ZK rollup such as zkSync Era or Starknet, which finalize on proof verification in minutes to hours instead of a challenge window. If you need the fewest code changes and broad tooling, an optimistic OP Stack chain like OP Mainnet or Base is usually less work.**Where should I track changes?**
Docs at https://docs.optimism.io, specs at https://specs.optimism.io, governance at https://gov.optimism.io and https://vote.optimism.io, and network status at https://status.optimism.io. Use the superchain registry for canonical chain configs and upgrade timestamps.

---

*Sources: docs.optimism.io - OP Stack introduction, Rollup protocol overview, Transaction fees, Fault proofs explainer, Network upgrades, Block production and bridging flows (pages accessed August 2026); specs.optimism.io - fault proof and derivation specs; optimism.io - OP Stack and Superchain overview; community.optimism.io and github.com/ethereum-optimism/community-hub - OP token overview and Retro Funding; gov.optimism.io - Bedrock and fault proof upgrade proposals; airdrops.io and app.optimism.io - OP airdrop and August 19, 2026 Strategic Ecosystem Fund vote. Figures for calldata gas (16 per non-zero, 4 per zero), Bedrock activation (June 6, 2023, block 105235063), Ecotone/Fjord/Granite/Holocene dates, blob sizes (128 KiB, 4096 field elements), Dencun date (March 13, 2024), Pectra EIP-7691 (May 2025), fault proof activation (June 10, 2024), bond (0.08 ETH) and Guardian roles are from the docs pages cited.*

## Verifiable Primary Sources & References

1. [Ethereum EIP-1559 Fee Market Change Specification](https://eips.ethereum.org/EIPS/eip-1559)
2. [Ethereum EIP-4844 Proto-Danksharding Specification](https://eips.ethereum.org/EIPS/eip-4844)
3. [Ethereum Official Yellow Paper & Protocol Specification](https://ethereum.github.io/yellowpaper/paper.pdf)
4. [Ethereum Consensus Specs & Proof of Stake Architecture](https://github.com/ethereum/consensus-specs)
5. [Solidity Compiler Official Documentation & Language Spec](https://docs.soliditylang.org/)
6. [Foundry Book Development & Testing Framework Documentation](https://book.getfoundry.sh/)
7. [Hardhat Ethereum Development Environment Documentation](https://hardhat.org/docs)
8. [Ethers.js Complete Web3 Library Documentation](https://docs.ethers.org/)
9. [Chainlink Decentralized Oracle Networks Architecture Whitepaper](https://chain.link/whitepaper)
10. [OP Stack Open Source Rollup Specifications](https://stack.optimism.io/)
