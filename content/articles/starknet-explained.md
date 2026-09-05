---
title: Starknet Explained - The Cairo ZK Rollup Scaling Ethereum
description: >-
  Starknet is an Ethereum Layer 2 validity rollup that uses STARK proofs and the
  Cairo language to bundle thousands of transactions off chain and settle them
  on Ethereum. Learn how it works, what it costs, and how to build on it.
category: Technology Deep Dives
data-ai-hint: starknet blockchain layer2
publishedDate: '2026-03-11'
lastUpdated: "2026-09-05"
---
Starknet is a validity rollup (also called a ZK rollup) that runs on top of Ethereum. It executes transactions off chain, bundles thousands of them into a single STARK proof, and posts that proof plus compressed state diffs to Ethereum for verification.

StarkWare built it. StarkWare launched the StarkEx proving service in 2020 and Starknet itself went live on mainnet in late 2021. By 2026 it settles on Ethereum with STARK proofs that need no trusted setup, and it uses its own language, Cairo, instead of the EVM.

## Who this guide is for

* **Users who want cheaper Ethereum activity.** You already use Ethereum but fees and throughput limit what you can do. Starknet gives you Ethereum-level security with fees often below $0.01 per transfer and faster confirms.
* **Developers choosing an L2 stack.** You need to decide between EVM rollups and a custom VM. Starknet trades Solidity compatibility for higher compute per proof and native account abstraction.
* **Teams evaluating appchains or staking.** You consider launching an SN Stack chain, running a validator, or staking STRK or BTC. You need to understand fees, proving, and decentralization status before you commit.

If you only use Ethereum mainnet today, this guide shows what Starknet changes, how it stays tied to Ethereum, and where the trade-offs are.

## What Starknet is

Starknet is a decentralized, permissionless Layer 2 that inherits Ethereum security through validity proofs, as described on docs.starknet.io/learn/protocol/intro. Key facts:

* **Network:** Starknet mainnet settles to Ethereum. Testnet is Starknet Sepolia. Chain IDs are mainnet `SN_MAIN` and Sepolia `SN_SEPOLIA` in hex form. RPC docs list endpoints at `https://starknet-mainnet.public.blastapi.io` and similar providers. Explorers include StarkScan at starkscan.co and Voyager at voyager.online.
* **Proof system:** STARKs (Scalable Transparent Arguments of Knowledge). No Common Reference String, no trusted ceremony, and hash-based construction that docs describe as quantum resistant. This differs from SNARKs that need a setup ceremony.
* **Language:** Cairo, not Solidity. Contracts and the Starknet OS itself are written in Cairo. You cannot deploy EVM bytecode unchanged. Cairo was designed so execution can be proven cheaply, which is why Starknet can prove more computation per proof than an EVM-emulating ZK rollup.
* **Currency for fees:** STRK is the native token for gas. Since Starknet v0.14.0 activated September 1, 2025, fees are paid only in STRK. Before that, users could pay in ETH or STRK. Sequencers may convert part of STRK fees to ETH to pay Ethereum L1 gas, which the Ethereum protocol requires in ETH.
* **Throughput and latency today:** Docs and the 2025 Year in Review describe capacity rising from about 500 TPS to over 1,000 TPS after v0.14.0, with block times cut from about 30 seconds to about 4 seconds and pre-confirmations around 0.5 seconds. A sustained real-world record set during the Flippy Flop campaign in October 2024 was about 127 TPS over 24 hours. Individual bursts have been higher. The stated roadmap target is over 10,000 TPS with the Malachite consensus engine, but that is a target, not current steady state.
* **Stage:** Recognized by L2Beat as a Stage 1 rollup in 2025-2026. Stage 1 means proofs are live, users can exit without operator help, but a Security Council can still intervene under constrained rules. Stage 2 would require a 30-day exit window for upgrades and tighter council controls. Starknet docs and the 2025 review state it is on track for Stage 2 but not there yet.
* **History:**StarkWare founded by Eli Ben Sasson and colleagues. StarkEx powered over $1 trillion in volume and over 1 billion transactions before Starknet public mainnet, per StarkWare. The Cairo verifier has been on Ethereum since July 2020. STRK launched via the Provisions program in February 2024, distributing 700 million+ STRK to about 1.3 million addresses.

## How it works

### From transaction to Ethereum settlement

The flow is sequencer execution followed by prover verification, as described on starknet.io/what-is-starknet and docs.starknet.io/learn/protocol/SNOS.

1.**Submit.**You send a transaction from an account contract to a sequencer's mempool. Since v0.14.0 the mempool replaced FIFO ordering and now prioritizes by tip. Full nodes forward transactions to sequencers.
2.**Validate and execute off chain.**The sequencer calls your account's `__validate__` to check the signature and rules, then `__execute__` to run the call. It batches passing transactions into a block. The block header commits to the new global state root, transaction and event commitments, and a state diff commitment. The `l1_da_mode` flag in the header records whether state diffs were sent as `BLOB` or `CALLDATA`.
3.**Build execution trace and state diff.**The sequencer records every Cairo step and builtin use (the execution trace) and collects storage diffs, nonce changes, deployed contracts, and declared classes.
4.**Prove with SNOS and SHARP.**SNOS (StarkNet Operating System) is a Cairo program that takes a previous state and a list of transactions and outputs the resulting state. The prover runs SNOS on the block and generates a STARK proof that the execution was correct. StarkWare's SHARP (Shared Prover) aggregates proofs from many blocks using recursion. Docs note that from v0.14.0 SHARP uses the new S-two prover for most jobs (Stone remains for recursive roots), and that recursion lets many batches share one on-chain verification.
5.**Post to Ethereum.** The sequencer submits the proof and compressed state diffs to the Starknet Core contract and Verifier contract on Ethereum. Ethereum verifies the proof with minimal compute. If it passes, the Core contract updates its stored state root. This is settlement. Messages and bridge state become final only after this L1 verification.

Anyone watching Ethereum can reconstruct Starknet state from the posted state diffs. That data availability guarantee is why you do not need to trust the sequencer to keep the chain History.

### Data availability and compression

Docs at docs.starknet.io/learn/protocol/data-availability detail several upgrades:

* Before v0.11.0 state diffs were a `uint256[]` in calldata.
* v0.11.0 added class declaration fields and a flag for deployed versus storage-only updates.
* v0.13.1 added EIP-4844 blob support. Under normal conditions Starknet posts to blobs. If blob prices spike well above calldata, the sequencer can fall back to calldata.
* v0.13.3 added stateless compression. A table-packing scheme compresses field elements by bucketing them by bit size (15, 31, 62, 83, 125, 252 bits) and encoding repetitions with pointers. Docs note this was chosen because the compression itself must be proven inside the OS, so simple lookup wins over Brotli.
* v0.13.4 added stateful compression. A system contract at address `0x2` maps new addresses and storage keys to small counter values starting at 128. This means post-v0.13.4 diffs depend on earlier diffs to decode. Pre-v0.13.4 diffs remain self-contained.

In current format, one `CALLDATA` blob holds about 128 KiB usable per blob on Ethereum, with Ethereum targeting 3 to 6 blobs per block and Starknet competing for that space. Data is held by consensus nodes for about 18 days then pruned, so operators and indexers that need longer history must store it themselves.

### Blocks and gas pricing

Each block header stores `block_number`, `parent_block_hash`, `global_state_root`, `sequencer_address`, `block_timestamp`, counts for transactions and events, commitments to state diff, transactions, events and receipts, `l1_da_mode`, `protocol_version`, and a `gas_prices_hash` that hashes six prices: `l1_gas_price_wei`, `l1_gas_price_fri`, `l1_data_gas_price_wei`, `l1_data_gas_price_fri`, `l2_gas_price_wei`, `l2_gas_price_fri`.

Gas prices on Starknet are derived as:

* `l1_gas_price` and `l1_data_gas_price` are the average of the last 60 L1 base fee samples taken every 60 seconds plus 1 Gwei. The data price is scaled by 0.135 to reflect average compression when posting to Ethereum.
* `l2_gas_price` follows an EIP-1559 style rule after v0.14.0. If the previous block used more than 80 percent of target, price rises. If below target, price falls. Maximum step is `1/48` per block. Minimum floor in current config is 3 gFRI (3 * 10^-9 STRK). v0.14.3, which went live on mainnet on June 22, 2026 per docs and later reports noting July 8 rollout, makes this floor dynamic and cuts target gas per block by about 30 percent while keeping max block size. The result is smaller, more frequent blocks and faster fee feedback.

### L1 to L2 and L2 to L1 messaging

Messaging is asynchronous and asymmetric, per docs.starknet.io/learn/protocol/messaging:

* **L1 to L2:** You call `sendMessageToL2` on the Starknet Core contract on Ethereum and pay a fee in ETH. The sequencer waits for enough L1 confirmations, then creates an L1 handler transaction that calls an `l1_handler` function on the target Starknet contract. The handler must succeed or be marked reverted, and its fee is prepaid on L1. A message that is not included can be canceled after a 5-day wait to prevent spam.
* **L2 to L1:** Your Starknet contract calls `send_message_to_l1_syscall`. The sequencer includes the message hash in the block, proves it, and stores it in the Core contract. You then consume it on L1 by calling `consumeMessageFromL2`, which checks the hash and that you are the intended recipient. This manual step plus proof verification is why L2 to L1 messages are not instant. Bridges like StarkGate use this path.

### Native account abstraction

Unlike Ethereum EOAs, every Starknet account is a smart contract. Docs at docs.starknet.io/learn/protocol/accounts list the required interface:

* `__validate__` and `__execute__` (must share the same signature) are always required. `__validate__` is limited to about 1,000,000 Cairo steps and cannot call external contracts, to protect the sequencer from DoS and mempool pollution.
* `__validate_declare__` is required to send DECLARE transactions.
* `__validate_deploy__` is required for DEPLOY_ACCOUNT.

This model lets you build session keys, multisig, passkey login, paymasters, and spending limits without a protocol change. OpenZeppelin's account component follows SNIP-6, the community account standard. A deployed account's nonce starts at 1 for DEPLOY_ACCOUNT or 0 for Universal Deployer Contract flows, and increments on every transaction including reverted ones, providing replay protection.

### Cairo, Sierra, and tooling

Cairo is a Turing-complete language with a Rust-like syntax since Cairo 1.0 (mid-2023). The compiler path is Cairo to Sierra to CASM (Cairo Assembly). Sierra is an intermediate representation that guarantees every program is provable. CASM is what the VM runs.

Tooling in 2026:

* **Scarb** is the package manager, similar to Cargo.
* **Starknet Foundry** provides testing, deployment, and fork tests.
* **Cairo Native** by LambdaClass compiles Cairo ahead of time to machine code for faster execution. Docs flag it as a key lever toward the 10,000 TPS target.
* **Stwo** is StarkWare's next-generation prover. Posts from StarkWare report roughly 100x proving throughput improvement over Stone in benchmarks, which lowers cost to prove blocks and supports client-side proving experiments.

You write contracts with `#[starknet::contract]` macros, compile with Scarb, and deploy with Starkli or Foundry.

### Staking and decentralization

Staking is covered at docs.starknet.io/learn/protocol/staking and starknet.io/staking.

* **Launch:** Phase 1 went live on mainnet in November 2024. That made Starknet the first rollup with permissionless staking on L2. Phase 2 is live in 2026 (second of four planned phases).
* **Who can stake:** Validators stake at least 20,000 STRK on mainnet (1 STRK on Sepolia) and run a Juno or Pathfinder full node with an attestation tool. Delegators can stake to a validator's pool without running a node, if the validator allows delegation.
* **Epochs and attestations:** An epoch is 1,132 blocks on mainnet, about 3,600 seconds. Within each epoch a validator is assigned one block to attest, computed as `h(staked amount, epoch id, validator address) mod (E - W)`, where `W` is the 50-block attestation window. The `attest` transaction includes the block hash and must land within that window. In Phase 2 one attestation per epoch is required, and rewards are all-or-nothing per epoch.
* **Power and BTC staking:** Validator power with dual staking is `(1 - alpha) * s/S + alpha * b/B`, where `alpha = 0.25`, `s` is STRK staked and `b` is BTC staked as a wrapper. BTC staking via wrappers opened Q3 2025 per docs, so Bitcoin holders can lock wrapped BTC representations and earn STRK rewards.
* **Rewards and inflation:** Rewards mint new STRK under a curve `M = C/10 * sqrt(sigma)`, where `C` is 4 percent on mainnet and `sigma` is percent of supply staked. Annual rate is split between STRK and BTC pro-rata. Docs note only about 33 million STRK had been minted by end of 2025, about 0.33 percent annual inflation at that point. Rewards compound per epoch and start after one epoch delay. Unstaking has a 7-day lockup on mainnet (5 minutes on Sepolia).
* **Sequencers today:** Three sequencers run in rotation as of the Grinta upgrade in September 2025, all currently operated by StarkWare. Docs and the 2025 review state full permissionless sequencing with the Malachite consensus engine from Informal Systems is targeted for 2026. Until then StarkWare can order transactions and influence liveness, but cannot steal funds because proofs and data availability are enforced by Ethereum.

### SN Stack for appchains

The SN Stack (Starknet Stack) is the modular stack that powers Starknet. Teams can launch appchains with custom block time, fees, and features while sharing proving and tooling. Three flavors are documented: the StarkWare Sequencer flavor (most battle-tested), the Madara flavor (most customizable, built in Substrate), and the Dojo flavor (for on-chain games). Appchains still post proofs to a settlement layer and can choose Ethereum or other DA options.

## Fees, finality, and scaling numbers you can check

Every Starknet transaction fee has three parts, per docs.starknet.io/learn/protocol/fees:

* **L2 computation:** Measured in Sierra gas for Sierra 1.7.0+ contracts (1 Sierra gas = 1 L2 gas) or VM resources (steps and builtins) for older contracts. Builtin costs include Pedersen 4,050, Poseidon 491, ECDSA 10,561, Keccak 136,189, etc.
* **L2 data:** Calldata 5,120 gas per felt, events 5,120 to 10,240 per felt, CASM and Sierra bytecode 40,000 per felt, ABI 1,280 per character. Converted at 1 L1 gas = 40,000 L2 gas when paying.
* **L1 data:** Cost to post state diffs and L2 to L1 messages to Ethereum. If `l1_da_mode` is `BLOB`, cost is `l1_data_gas_price * 32 * (l + 2*(n-1) + 2*(m-1) + 2*D)`. If `CALLDATA`, similar but with `l1_gas_price` and discounts. Variables are number of contracts with class changes, unique contracts touched, and storage slots updated.

What that means in practice for users: docs and the 2025 review state average fees below $0.001 to $0.01 per simple transfer in calm periods, well below Ethereum mainnet. The Starknet fee tracker and StarkScan show live STRK prices per L2 gas and L1 data gas. Your actual fee depends on which resources your transaction touches and on Ethereum base fee and blob price sampled by the sequencer.

Finality is two-step: you get a soft pre-confirmation in about 0.5 seconds and a block in about 4 seconds, but L1 finality only after the proof is verified on Ethereum. That proof cadence is about minutes to an hour depending on batching and SHARP aggregation, not seconds.

Scaling numbers that are published and checkable: average cost dominated by L1 data posting before compression, now reduced by blob use and stateless plus stateful compression; verification gas per recursive proof around 1M gas packing dozens of batches versus about 5M gas for early 2023 single batches, per community benchmarks; throughput capacity over 1,000 TPS with headroom to scale toward 10,000 TPS via Cairo Native and Malachite, but live steady state is lower.

## Pros and cons at a glance

| Area | What Starknet gives you | What you trade |
| --- | --- | --- |
| Validation method | STARK validity proofs verified on Ethereum. No challenge window. State accepted only if proof passes. | Proving cost and complexity. You rely on correct verifier and SNOS logic rather than a simple fraud game. |
| Data posted to L1 | Compressed state diffs on Ethereum (blobs with fallback to calldata). Anyone can reconstruct. | Post-0.13.4 diffs need prior diffs to decode due to stateful compression. Blob space competes with other rollups. |
| EVM fit | No. You write in Cairo. Expressive for provable logic and heavy compute like perps and games. | Solidity code must be rewritten or transpiled. Audit surface is Cairo-specific, and EVM tooling does not directly apply. |
| Fees | Three-resource pricing with EIP-1559 style L2 gas after v0.14.3, STRK-denominated, often cents or less for simple operations in calm periods. | Fees move with STRK price and Ethereum blob base fee. You must set `resource_bounds` for L1 gas, L2 gas, and L1 data gas in v3 transactions. |
| Speed | About 4 second blocks, about 0.5 second pre-confirms after Grinta. L1 to L2 minutes, L2 to L1 requires proof then manual consume. | Soft confirm is not L1 finality. Large value requires waiting for proof verification on Ethereum before treating as settled. |
| Accounts | Native smart accounts. Session keys, multisig, passkeys, paymasters without protocol changes. | Validation function limits (1M steps, no external calls). Custom account bugs can drain funds if `__execute__` checks are missing. |
| Decentralization today | Stage 1 rollup, SHARP plus S-two provers, staking live with 1.1B+ STRK staked by end of 2025 (from 110M at start of year). | Sequencing still run by StarkWare (three instances). Permissionless sequencers and provers are roadmap for 2026, not yet live for anyone. |
| Ecosystem | Growing DeFi (Ekubo, mySwap, Nostra), perps (Paradex), and on-chain games using Dojo. SN Stack for appchains. | Smaller TVL and daily active users than Arbitrum or Base in 2026 snapshots. Less Solidity liquidity and shared tooling. |

## How to get started

### If you are a user

1. **Add Starknet to a wallet.**Starknet is not EVM compatible, so use a native wallet for full features like paymasters and session keys. Argent X and Braavos are the two most used. Download from the official sites, not search ads. Save the seed phrase and add a second device or hardware signer if you hold size.
2.**Get STRK for gas.**Since v0.14.0 you need STRK on Starknet to pay fees. You can bridge ETH or stablecoins and swap to STRK on Starknet, or on-ramp directly to Starknet via supported on-ramps listed on starknet.io/bridges-and-onramps. If you need to pay with another token, use a paymaster via AVNU, which sponsors the STRK fee and accepts payment in your token.
3.**Bridge with the canonical bridge.**StarkGate at starkgate.starknet.io is the canonical bridge for ETH and ERC-20 between Ethereum and Starknet. For large moves start with a small test amount. Third party bridges via Orbiter, Layerswap, or RocketX can route from 180+ chains, but they front funds and add separate risk.
4.**Track finality.**A fast 0.5 second confirmation is not Ethereum settlement. For treasury moves check StarkScan for block inclusion, then check the L1 Core contract for the verified state update before you consider the transfer final.
5.**Explore cheap but real activity.**Try a swap on Ekubo or AVNU, a position on Nostra, or a game on Dojo. Confirm fee lines show fractions of a cent to a few cents for simple actions. Use the Starknet status page at status.starknet.io if a transaction stalls.

### If you are a developer

1.**Install the Cairo stack.**Install Rust via rustup, then Scarb and Starknet Foundry. Check versions at docs.starknet.io and starknet.io/developers/version-releases. The current Cairo is 1.x/2.x series with Sierra in between. Do not start new code on Cairo 0.
2.**Create and deploy to Sepolia first:**```bash
# install
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh
curl -L https://raw.githubusercontent.com/foundry-rs/starknet-foundry/master/scripts/install.sh | sh

# new project
scarb new hello_starknet
cd hello_starknet
scarb build
snforge test

# deploy to Sepolia
sncast --url https://starknet-sepolia.public.blastapi.io declare --contract-name HelloStarknet
sncast --url https://starknet-sepolia.public.blastapi.io deploy --class-hash <CLASS_HASH>
sncast --url https://starknet-sepolia.public.blastapi.io invoke --contract-address <ADDRESS> --function increment
```

Fund Sepolia accounts via the faucet at starknet.io or the docs faucet page. Verify contracts on StarkScan.

3.**Measure fees with the three resources.**Use `starknet_estimateFee` via RPC or `sncast estimate-fee` to see `l1_gas`, `l1_data_gas`, and `l2_gas` before you send. Set `resource_bounds` with `max_amount` and `max_price_per_unit` for each resource in v3 transactions. Compress calldata and avoid unneeded storage writes, since each unique slot posted to L1 adds cost.
4.**Handle cross-chain timing.**L1 to L2 messages need minutes and trigger an `l1_handler` call. L2 to L1 needs proof generation then a separate L1 `consumeMessageFromL2` transaction. Do not build logic that assumes a synchronous callback. Emit events, prove inclusion, then execute on L1.
5.**Plan for sequencer liveness.**You can force inclusion via L1 messaging, but today ordering is still centralized. Add a UI path that retries via higher tip if the mempool is congested, and monitor `status.starknet.io` and `l2beat.com` for stage and sequencer status. Test upgrades on Sepolia with v0.14 and v0.14.3 fee changes before mainnet.

### If you are considering staking

1.**Read the staking docs and spec.**See docs.starknet.io/learn/protocol/staking and the staking spec at github.com/starkware-libs/starknet-staking. Mainnet staking contract addresses are listed on docs cheatsheets.
2.**Run a full node first.**Sync Juno or Pathfinder and run the matching attestation tool (Nethermind or Equilibrium). You need a synced node to attest correctly. Attesting to a wrong hash loses the epoch reward.
3.**Budget for lockup and keys.**Validator minimum is 20,000 STRK plus operational funds for attest transactions. Rewards address and staking address should be cold. Operational address can be hot but losing it loses yield. Withdrawal needs a 7-day wait after `unstake_intent`.
4.**Evaluate BTC staking if you hold BTC.** Check `get_active_tokens` on the staking contract for supported wrappers. Weight `alpha = 0.25` means BTC contributes, but STRK dominates power. Understand wrapper trust before locking size.

## Risks and constraints you should weigh

* **Centralized sequencing today.** Three sequencers exist, but all run by StarkWare. They can reorder or delay until permissionless Malachite consensus ships. Forced inclusion via L1 helps, but costs time and ETH.
* **Small prover set.** SHARP and S-two are operated by StarkWare today. Proving is permissionless on the roadmap, but not yet open to anyone.
* **Cairo learning cost.** Fewer developers know Cairo than Solidity. Auditors for Cairo are fewer, and bugs in custom account `__validate__` or `__execute__` checks have led to drain risks documented in the account danger notes.
* **Proof and SNOS bugs.** All validity rollups trust the verifier and OS program. SNOS is the final arbiter of correctness. Review the SNOS Rust repo and audit history before you lock large value.
* **Blob competition and pricing.** After v0.14.3, L2 gas is dynamic. If many L2s compete for blobs, L1 data gas rises and your fee follows. Starknet can switch from blobs to calldata when blobs are expensive, which then tracks Ethereum base fee instead.
* **Ecosystem size.** TVL around $200 million to $800 million in 2026 snapshots depending on source and day, well below Arbitrum and Base. DeFi depth and bridge liquidity are thinner, so spreads can be wider for niche assets.
* **Token and inflation dynamics.**STRK inflation funds staking. If stake ratio falls, rewards per staker rise but total inflation changes. Locked investor and contributor allocations continue vesting through March 2027, which adds supply.

## FAQ**Is Starknet EVM compatible?**No. Starknet does not run EVM bytecode. You write contracts in Cairo. Solidity code must be rewritten or transpiled. Aurora on NEAR or Kakarot experiments inside Starknet can run Solidity in limited form, but they are not the main path. Use Cairo plus Starknet Foundry for native builds.**How is a STARK different from a SNARK?**Both prove computational integrity. SNARKs need a trusted setup ceremony for secret parameters and have smaller proofs (about 500k gas to verify on Ethereum). STARKs need no trusted setup, use public randomness, and are hash based, which docs describe as quantum resistant. Starknet uses STARKs.**How long do withdrawals take?**Starknet has no 7-day challenge window like optimistic rollups. Withdrawals still need batch inclusion, proof generation, L1 verification, and a manual consume on L1. That is usually minutes to a few hours depending on SHARP cadence and L1 load, not instant.**What are blobs and how long do they stay?**Blobs are data fields in EIP-4844 type 3 transactions. They hold about 128 KiB usable per blob. Consensus nodes keep them for about 18 days (4,096 epochs) then prune. Execution state sees only the versioned hash of the KZG commitment. Starknet operators and indexers must store longer history themselves.**Do I need STRK to pay gas?**Yes, since v0.14.0 on September 1, 2025. All v3 transactions on Starknet set STRK-denominated `max_amount` and `max_price_per_unit` for L2 gas, L1 gas, and L1 data gas. If you hold other tokens, a paymaster can pay STRK for you and accept your token.**How is Starknet different from Optimism or Arbitrum?**Optimism and Arbitrum are optimistic rollups that assume batches are valid and open a 7-day fraud window. Starknet is a validity rollup that proves correctness before L1 accepts the state. That removes the long exit wait but requires a heavy prover. Optimism and Arbitrum are EVM equivalent. Starknet uses Cairo and proves more compute per proof.**What is SHARP and S-two?**SHARP is StarkWare's shared prover that aggregates many Cairo programs into one recursive proof to spread verification cost. Stone was the first prover. S-two is the next generation prover used for most Starknet jobs since v0.14.0, with faster throughput and smaller proofs. Atlantic is a managed service that lets apps submit Cairo PIEs to SHARP.**What is STRK supply and distribution?**Initial supply was 10 billion STRK minted November 30, 2022. Planned distribution per docs.starknet.io/learn/protocol/strk is 20.04 percent early contributors, 18.17 percent investors, 10.76 percent StarkWare, 12.93 percent grants including development partners, 9 percent community provisions, 9 percent community rebates, 10 percent foundation strategic reserves, 8.10 percent foundation treasury, and 2 percent donations. Investor and contributor allocations are released monthly through March 2027. Supply grows over time via staking minting.**How does native account abstraction help users?**All accounts are smart contracts. You can add 2FA, session keys that allow a game to move a character without a full approval each time, daily limits, social recovery, and paymasters that sponsor gas. These are contract patterns, not protocol upgrades.**Which should I pick today if I need fast canonical exits and heavy compute?**If you need fast canonical withdrawals without a third party bridge and you can handle Cairo, Starknet is a good fit. Its validity proofs finalize on verification, not after a 7-day window. If you need minimal code changes from Solidity and broad EVM tooling, an optimistic rollup like Arbitrum or an OP Stack chain will be less work.**Where should I track changes?**
Core docs at docs.starknet.io/learn/protocol, Starknet site at starknet.io/developers/version-releases, status at status.starknet.io, governance at governance.starknet.io, L2Beat stage page for Starknet, the SNOS repo at github.com/keep-starknet-strange/snos, and the community forum at community.starknet.io.

---

*Sources: starknet.io/what-is-starknet and starknet.io/faqs (validity rollup definition, sequencer and prover roles, Cairo and STARK details); docs.starknet.io/learn/protocol/intro, /SNOS, /SHARP, /blocks, /data-availability, /fees, /accounts, /messaging, /staking, /strk, /cryptography (architecture, state diff formats v0.11.0 to v0.13.4, fee formula with L1 gas / L2 gas / L1 data gas and blob versus calldata, account structure with __validate__ and __execute__, L1-L2 messaging with 5-day cancel, staking phases with 20K STRK minimum / 1132-block epochs / 50-block window / alpha 0.25 BTC weight / 7-day lockup); starkware.co/starknet (Cairo verifier on Ethereum since 2020, StarkEx volume); starknet.io/blog Technical Roadmap March 2026 and Starknet in 2025 Year in Review Dec 2025 (Grinta v0.14.0 with 30s to 4s blocks / 0.5s pre-confirms / mempool with tips / v3 only STRK fees, v0.14.3 with dynamic L2 gas and 30 percent target cut, capacity over 1000 TPS / 127 TPS sustained record, 1.1B STRK staked, SN Stack flavors Madara and Dojo); governance.starknet.io and starknet.io/staking (BTC staking Q3 2025). Figures for blob size (128 KiB usable per blob), protocol limits, and Cairo builtin gas costs are from the docs pages cited. Accessed August 2026.*

## Verifiable Primary Sources & References

1. [Ethereum EIP-20 Token Standard Specification](https://eips.ethereum.org/EIPS/eip-20)
2. [Ethereum EIP-1559 Fee Market Change Specification](https://eips.ethereum.org/EIPS/eip-1559)
3. [Ethereum EIP-4337 Account Abstraction Using Alt Mempool](https://eips.ethereum.org/EIPS/eip-4337)
4. [Ethereum EIP-4844 Proto-Danksharding Specification](https://eips.ethereum.org/EIPS/eip-4844)
5. [Ethereum EIP-712 Typed Structured Data Hashing and Signing](https://eips.ethereum.org/EIPS/eip-712)
6. [Ethereum Official Yellow Paper & Protocol Specification](https://ethereum.github.io/yellowpaper/paper.pdf)
7. [Ethereum Consensus Specs & Proof of Stake Architecture](https://github.com/ethereum/consensus-specs)
8. [Solidity Compiler Official Documentation & Language Spec](https://docs.soliditylang.org/)
9. [OpenZeppelin Smart Contract Standard Libraries & Security Audits](https://docs.openzeppelin.com/)
10. [Foundry Book Development & Testing Framework Documentation](https://book.getfoundry.sh/)
