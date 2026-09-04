---
title: 'NEAR Protocol Explained: Nightshade Sharding, Chain Abstraction and How to Build'
description: >-
  NEAR is a sharded, proof-of-stake layer-1 with human-readable accounts and low fees. Learn how Nightshade, Chain Signatures and Intents work, where NEAR fits, trade-offs, and practical steps to build.
category: Technology Deep Dives
data-ai-hint: blockchain near protocol
publishedDate: '2026-03-11'
lastUpdated: "2026-09-04"
---

NEAR Protocol is a layer-one, sharded, proof-of-stake blockchain built to be fast, low-cost, and easy to use. Docs at docs.near.org describe it as a user-friendly and carbon-neutral chain where accounts look like `alice.near`, finality is about 1.3 seconds, and average fees are about $0.002.

What started in 2018 as a scalability research project by Illia Polosukhin and Alexander Skidanov has grown into a stack that handles base-layer consensus, cross-chain signing, and intent-based execution for apps and AI agents. This guide explains what NEAR is, who should use it, how the pieces work, where it helps and where it hurts, and how to try it.

## What NEAR Protocol is

In technical terms NEAR is a [layer-one](https://coinmarketcap.com/academy/glossary/layer-1-blockchain), [sharded](https://near.org/blog/near-launches-nightshade-sharding-paving-the-way-for-mass-adoption), [proof-of-stake](https://en.wikipedia.org/wiki/Proof_of_stake) blockchain. Layer-one means NEAR secures its own state and execution rather than posting to another chain for security. Sharded means the network splits work across parallel chunks. Proof-of-stake means validators lock NEAR to produce and validate blocks instead of burning energy with proof-of-work.

In practical terms NEAR is an account-based platform for apps where you get:

* Named accounts like `alice.near` and implicit accounts derived from keys, plus Ethereum-compatible addresses for familiar wallet flows. One account can hold a contract, manage keys, and with Chain Signatures control accounts on other chains.
* Sub-second blocks and cheap storage. Docs list blocks around 600 ms, finality about 1.3 seconds, and fees under one cent. The protocol refunds storage when you delete data, and contracts earn a share of the fees they generate.
* A WASM runtime for contracts in Rust and JavaScript, plus full EVM compatibility through Aurora which runs as the `aurora` contract on NEAR. If you have Solidity code, you can deploy it on Aurora with existing tools like Hardhat or Foundry.
* Built-in chain abstraction primitives: Chain Signatures for cross-chain signing via MPC, and NEAR Intents for outcome-based swaps across 31+ chains.

History in brief: Illia Polosukhin and Alexander Skidanov founded NEAR in 2018. Illia co-authored the 2017 Transformer paper "Attention Is All You Need" at Google. Alex led distributed database work at MemSQL. The project launched after paying global contributors showed how hard cross-border value movement was in 2018. Mainnet went live in 2020 with a genesis supply of 1 billion NEAR. Near.org history and the white paper trace this arc from sharding research to chain abstraction.

The NEAR token (NEAR) has three roles defined in docs.near.org/protocol/network/tokens: securing the network through staking, pricing computation and storage as a unit of account, and moving value as a medium of exchange. You also use NEAR to reserve storage for accounts and contract state.

Current chain stats from docs.near.org as of August 2026: five years of 100 percent uptime on mainnet, more than 4 billion transactions processed (tracked on Pikes Peak), and daily peaks above 13 million transactions. Apps like Sweat, Kai Ching and Hot Wallet each report millions of users on DappRadar rankings linked from the docs.

Tokenomics snapshot: initial supply 1 billion NEAR in 2020. Annual issuance targets 5 percent at launch, now 2.5 percent after the halving upgrade described in the Feb 24 2026 post "Evolving NEAR Tokenomics." Of new issuance about 90 percent goes to validators and delegators and about 10 percent to the protocol treasury. All transaction fees except the contract rebate are burned. That burn can offset issuance when activity is high, which pushes net issuance down. The supply is fully unlocked and governed through House of Stake, the on-chain governance body introduced in 2025-2026. NEAR Intents adds protocol revenue that House of Stake directs toward buybacks. The February 2026 update noted more than $13 billion in Intents settlement volume and an initial 1 million NEAR buyback funded by Intents fees.

## Who it is for

**Developers who want simple accounts and cheap state.** If managing hex addresses, manual nonce tracking, and large gas buffers slows you down, NEAR named accounts with multiple access keys feel closer to web apps. FunctionCall keys let a dapp call one method up to a limit without giving away full control. Small teams appreciate that contract storage is refundable and contracts receive 30 percent of the gas they burn as a rebate.

**Teams shipping cross-chain products.** If your roadmap includes Bitcoin, Ethereum, Solana, and Cosmos support, Chain Signatures lets one NEAR account derive addresses on all of them via an MPC network. You write the logic once on NEAR and sign on the remote chain without running separate relayers or wrapping assets. Solvers on NEAR Intents compete to fill swaps, so you can offer one-click swaps without building your own liquidity.

**Ethereum teams looking for a low-cost home.** If you have audited Solidity contracts and a MetaMask flow, Aurora lets you deploy without rewriting. Same Solidity, same JSON-RPC shape, but settlement inherits NEAR finality and lower fees. This helpsNFT, DeFi, and tooling teams test on testnet before committing to a full rewrite in Rust or JavaScript.

**AI and agent builders.** NEAR AI docs frame NEAR as execution for agents that need confidential inference and verifiable attestations. Shade Agents run inside Trusted Execution Environments and use Chain Signatures plus Intents to move assets and call across chains. If your agent needs to hold keys, sign transactions, and prove how it decided, NEAR positions that stack as native.

**Users who pay small amounts often.** Social, gaming, and move-to-earn apps benefit when a transaction costs a fraction of a cent and confirms in about a second. That cost curve makes micro-rewards and frequent actions viable without sponsoring gas.

It is less suited if you need deep Ethereum L1 compatibility at the consensus level, if you rely on tooling that only exists on a specific L1, or if you need full anonymity at the protocol layer. NEAR is transparent by default. Private execution via the planned private shard and Confidential Intents was previewed at NEARCON 2026 but is not yet the default path.

## How it works

### Accounts, keys, and access

NEAR is account-based like Ethereum, but the model differs in ways that matter day to day. Details are on docs.near.org/protocol/accounts-contracts/account-model and /protocol/accounts-contracts/access-keys.

* **Account ID.** You can create `alice.near` style named accounts, implicit accounts like `a1b2c3...` derived from a public key, or Ethereum-like accounts linked to Ethereum wallets. Names are readable and resolve without ENS.
* **Multiple keys per account.** An account can hold many key pairs. A `FullAccess` key can do anything. A `FunctionCall` key can only call specific methods on a specific contract up to an allowance. If a key leaks you rotate that key rather than moving the whole account. Apps use FunctionCall keys as session tokens.
* **Smart contract as account state.** An account may hold WASM code and key-value storage as a trie. The runtime loads the contract state with the `#[near(contract_state)]` macro in Rust and executes the requested function. Storage costs are charged as you write and refunded when you delete, with price linked to NEAR via token economics.

Comparison to Ethereum in one glance:

| Area | Ethereum | NEAR |
| --- | --- | --- |
| Address | `0x123...` public key | `alice.near` name or implicit hash |
| Keys | One private key | Many keys with scoped permissions |
| Execution | Synchronous call returns in one block | Asynchronous receipts passed between shards |
| Fees | Often dollars on L1 | Under one cent, about $0.002 average per docs |
| Block time | About 12 seconds | About 600 ms, finality about 1.3 seconds |

### Nightshade sharding and static versus dynamic growth

NEAR scales with Nightshade, the sharding design first published in 2019 and updated to version 2.0 in 2024. The paper is hosted at discovery-domain.org/papers/nightshade.pdf and summarized at near.org/papers. The core idea is different from the common beacon-plus-shards picture. NEAR produces a single block that aggregates chunks from each shard. Each chunk contains transactions and receipts for its shard. Chunk producers produce chunks and block producers assemble the block. This keeps the logical chain unified even though work is parallel.

The lifecycle so far:

* **Phase 0, single shard.** All state lived in one shard at mainnet start in 2020.
* **Phase 1, four shards.** NEAR expanded to four shards and then to six during 2023-2024 as demand grew.
* **Nightshade 2.0, stateless validation.** Live on mainnet in 2024, it splits validation so validators check chunks without holding the full state locally. Validators fetch witness data on demand and verify execution, which lowers hardware needs and lets hardware stay modest while shards increase.
* **Nightshade 3.0, previewed at NEARCON 2026.** CTO Bowen Wang outlined separation of consensus and execution, atomic cross-shard transactions, and a live private shard for confidential execution. The stated goal is to clear bottlenecks where consensus work slows execution and to make private computation a first-class shard.

Dynamic resharding is part of that roadmap. The protocol can adjust shard count and restate trie ranges without a hard fork at the application layer. The authoritative guide to sharding on near.org explains how the trie is partitioned between shards and resharding redistributes keys when a shard fills. For builders this means you do not pick a shard. Every account lives in one shard at a time, and the network routes receipts.

This design has a tested ceiling that NEAR cites as a benchmark rather than steady state. A publicly verifiable load test referenced on near.org achieved more than 1 million transactions per second of token transfers in a controlled environment with many shards. Production throughput is far lower and depends on transaction size, cross-shard ratio, and validator capacity. Aurora docs note about 1,000 TPS typical on Aurora today, up to about 10,000 at peaks, with 100,000+ plausible as shards increase. Treat the 1 million figure as what the architecture allows, not what you pay for today.

### Blockchain layer and runtime layer

Docs separate NEAR into two logical layers at docs.near.org/protocol/network/architecture.

* **Blockchain layer.** Handles chunks, blocks, trie partitioning, peer communication, and consensus. It knows about shards and routing but only treats transactions and receipts as messages to move.
* **Runtime layer.** Executes the WASM contract logic, meters gas, applies token and storage accounting, and emits new receipts. It assumes the needed account state is local and does not know which shard it is in. It sees a batch of receipts in and a batch out.

Transactions are what users sign and submit via RPC. Receipts are internal messages created by the runtime when a contract calls another contract or issues a tracking promise. This message-passing model is why cross-contract calls are asynchronous on NEAR. You do not get a synchronous return value. You schedule a call, the runtime creates a receipt, the receiving shard executes it, and a callback receipt returns to you.

### Consensus, validators, and epochs

NEAR uses proof-of-stake with an in-protocol election. The validator docs at docs.near.org/protocol/network/validators and the validator site near-nodes.io cover this.

* **Roles.** The top 100 validators by stake are block and chunk producers. They produce chunks for their assigned shard and blocks for the whole chain. Validators outside the top 100 can join as chunk validators who validate and endorse chunks without producing them. This widens participation with lower hardware.
* **Stake threshold.** Anyone can submit a validator proposal. The seat price is set by the 300th largest proposal and must exceed 25,500 NEAR. Nearblocks.io shows the live seat price. If your stake is above the price you enter the active set. Below it you wait.
* **Rewards.** Validators earn a target annualized reward of 2.5 percent of total supply, paid per epoch. If less than 100 percent of NEAR is staked, the return on staked tokens is higher because the same issuance is split among fewer stakers. Validators take a commission from delegators and keep the rest.
* **Slashing and kickout.** Validators who double-sign or produce invalid blocks can be slashed and lose part of stake. Validators who miss too many chunks or blocks are kicked for the next epoch but not slashed. The kickout thresholds sit at 90 percent per the protocol config.
* **Epochs.** Time is divided into epochs of 43,200 blocks. At roughly 600 ms per block that is about 7.2 hours per epoch in ideal conditions. The `protocol_config` RPC shows the live value. Epoch boundaries rotate validators, calculate rewards, and update shard assignment. Nodes that are not archival garbage collect data older than five epochs.

Figment, Everstake, and Blockdaemon validators publish staking guides that match these docs and add operational notes such as unstaking takes one epoch and rewards compound per epoch.

### Gas, fees, and storage

Gas on NEAR measures compute and storage. You attach a gas amount and a NEAR price. The receipt pays for execution. Three facts matter for budgeting, per docs.near.org/protocol/transactions/gas and the validator economics page.

* **Fees are small and predictable.** Average fees are about $0.002 per the Why NEAR cards in docs. Simple transfers are cheapest. Contract calls add byte and compute costs. Fees are refundable storage when you delete.
* **Burn and rebate split.** All fees collected in an epoch are burned except for a 30 percent rebate paid to the contract that was called. That rebate is why the docs say you earn from your contract's fees. The rebate creates a direct incentive to write efficient contracts.
* **No fee market spikes like pre-4844 Ethereum.** NEAR sets a dynamic gas price that adjusts per block based on usage per shard. When a shard is busy, its gas price rises until demand shifts. Because work is sharded, one hot contract does not raise prices for an unrelated shard.

### Smart contracts and tooling

The contract runtime uses WASM. You write with near-sdk-rs for Rust or near-sdk-js for JavaScript. A minimal Rust pattern looks like this on docs.near.org/smart-contracts/anatomy/anatomy:

```rust
use near_sdk::near;

#[near(contract_state)]
pub struct Counter {
    count: u64,
}

#[near]
impl Counter {
    #[init]
    pub fn new() -> Self { Self { count: 0 } }

    pub fn get(&self) -> u64 { self.count }

    pub fn increment(&mut self) { self.count += 1; }
}
```

From there the loop is familiar to NEAR developers: `cargo near new hello-world`, `cargo near build`, `cargo test`, `cargo near deploy` to testnet, then call with `near call` or from a frontend with near-api-js and Wallet Selector. Create testnet accounts with `near create-account` or via wallet.near.org and fund with the faucet.

On the EVM side, Aurora runs at `aurora` on NEAR. You configure Aurora Mainnet with chain ID 1313161554, RPC `https://mainnet.aurora.dev`, and explorer `https://aurorascan.dev`. Deploy with Hardhat or Foundry as if it were Ethereum. Gas on Aurora is priced in ETH at about 0.07 GWei per Aurora cloud docs, which they translate to about $0.003 per simple transaction, though actual cost moves with ETH price and contract complexity.

### Chain Signatures: one account controls many chains

Chain Signatures, shipped to mainnet in 2024, let a NEAR account request signatures for other chains without ever holding the foreign private key in one place. The flow is documented at docs.near.org/chain-abstraction/chain-signatures.

Three parts interact:

1. **Derivation path.** A string like `bitcoin-1` or `ethereum-1` plus the NEAR account ID and the MPC public key derives a foreign address. Use a distinct path per chain so a signature on Ethereum cannot be replayed on another EVM chain if you sign a legacy payload without EIP-155 chainId.
2. **Multichain contract `v1.signer`.** Your contract or frontend calls `sign` with payload hash, path, and domain ID where 0 is Secp256k1 and 1 is Ed25519. The contract yields, waits for the MPC network, and returns a signature you then broadcast on the target chain.
3. **MPC network.** Eight independent nodes today each hold a share of the master key. No single node can sign. Nodes produce signature shares over several rounds and aggregate them off chain, then write the signature back to `v1.signer`. The node set can grow via on-chain votes on `v1.signer`.

Supported curves cover most chains including Bitcoin, Ethereum, Solana, XRP, Aptos, Sui, TON, Stellar, TRON, and EVM rollups. The current example implementations sign Bitcoin Taproot and EVM EIP-155 transactions, Solana with Ed25519, and so on.

What this enables in practice: a NEAR smart contract can hold logic for a Bitcoin DeFi vault while Bitcoin stays on Bitcoin. A wallet with one recovery method can let users deposit native BTC to a derived address, trigger a NEAR contract that computes interest, and sign the outbound BTC transaction via MPC without a bridge wrapping BTC. Infinex integrated Chain Signatures in late 2024 to let its non-custodial exchange handle Bitcoin and XRP without separate custody.

Two caveats to internalize. Chain Signatures sign outbound transactions only. If you need to read state on the remote chain, use a bridge or oracle like Omnibridge. And signatures are only replay-safe if the payload commits to the target chain. For EVM that means EIP-155 typed transactions. For Bitcoin-like chains, consider chains with distinct sighash forks when choosing paths.

### NEAR Intents: solvers instead of pools

NEAR Intents is the intent-based cross-chain execution layer built on top of Chain Signatures. It went to beta as Defuse in late 2024 by Aurora Labs and now runs at `intents.near` as core infrastructure. The simplest way to describe it:

* You express an intent like swap 1,000 USDC on Ethereum for native BTC to a Bitcoin address. You sign that intent once with your NEAR wallet.
* Professional solvers who watch a WebSocket relay compete to quote. Each solver uses its own liquidity which can be on-chain, on centralized exchanges, or OTC. No single pool constrains price.
* The best quote is shown, you accept, and settlement is atomic through the Intents verifier on NEAR. Either the whole swap lands or nothing does. No partial fills leave funds stuck mid-route.

Observed stats as of April 2026 from docs and Intents explorers linked in near.org intents pages: more than $10 billion in cumulative volume in some dashboards and more than $13 billion in the tokenomics post, 15.7 million swaps on LeoDex reporting, 1.6 million users, 31+ supported chains from Bitcoin and Ethereum to Dogecoin, TRON, TON, XRP, and Starknet. Base protocol fee is 1 basis point (0.01 percent) plus gas and any frontend fee. The verifier contract is `intents.near`. The system has an active bug bounty on HackenProof and an audit trail led by Hacken.

Confidential Intents, previewed in March 2026, add private execution inside a TEE-backed private shard. The goal is to hide solver routing and amounts while still allowing selective disclosure for compliance.

### Other primitives: Aurora, Omnibridge, Shade Agents, and user-owned AI

* **Aurora** as above is the EVM execution environment. It is not a sidechain with its own validators. It is WASM code on NEAR, so it inherits NEAR validator security and economics.
* **Rainbow Bridge and Omnibridge** handle asset movement where chain signatures are not enough. Rainbow Bridge uses light-client proofs between NEAR and Ethereum: about 16 minutes Ethereum to NEAR and about 4 hours NEAR to Ethereum to wait for finality. Third-party explorers like Nearblocks surface bridge proofs and should be part of testing.
* **Shade Agents** are contracts that run logic inside Trusted Execution Environments. They use Chain Signatures to keep keys out of enclaves while still letting the TEE attest that code ran as written. Early examples pitched at SF hackathons in 2025 include autonomous rebalancers and portfolio agents.
* **NEAR AI** includes on-chain primitives for user-owned AI. The stack presented at near.ai pairs confidential TEs, credential isolation, and TEE reports that anchor inference results into auditable state transitions. IronClaw 1.0 docs describe the agent verification flow.

## Pros and cons

**Where NEAR helps**

* Cheap and fast at the point of use. One transfer or contract call often costs a fraction of a cent and settles in about a second. That makes high-frequency flows like sweat-to-earn or game moves viable without custom sponsoring.
* Readable accounts and scoped keys. Splitting FullAccess and FunctionCall keys maps well to apps that ask for narrow permission. Key rotation is built in, which reduces lockouts.
* Sharding without developer shard choice. You do not assign an account to a shard. The trie placement is handled for you, which keeps mental models simple as shards grow. Stateless validation lowers the bar for new validators compared to stateful sharding.
* Chain Signatures remove one wallet per chain. One recovery flow covers many chains, and one contract controls logic everywhere. This cuts integration work for wallets and DeFi dashboards.
* Intents give broad chain coverage with low quoted fees. 31+ chains and 1 bps base fee is wider and cheaper on paper than AMM-per-chain bridges like THORChain for mid-size swaps, though THORChain can have deeper native BTC pools for very large trades.
* EVM path exists. Aurora lets Solidity teams deploy on day one and then decide whether a native rewrite is worth it.

**Where it costs or adds risk**

* Asynchronous execution. If you expect Ethereum-style synchronous returns, the receipt model takes adjustment. Cross-contract calls need callbacks and careful error handling. Developer guides warn to plan for failure receipts.
* MPC trust assumption. Chain Signatures rely on an 8-node MPC set today. No single node can sign, but the set is smaller and newer than L1 validator sets. MPC nodes colluding or a bug in `v1.signer` could misuse funds on derived addresses. Review the contract and monitor node diversity before putting large balances on derived accounts.
* Bridge finality windows. NEAR to Ethereum proof generation still takes hours. Treat in-flight bridge transfers as pending in your UI and accounting.
* Young private execution. Confidential Intents and private shards were previewed in 2026 but have less battle time than base execution. Privacy features should be evaluated with auditors and with a disclosure policy.
* Ecosystem size and liquidity. NEAR has real users, but depth of tooling and liquidity on any single app is often thinner than on Ethereum mainnet. Spreads may be wider for niche assets.
* Inflation dynamics. Staking yield depends on total stake ratio, validator commission, and burn rate. A drop in usage can raise net issuance, which affects holders who do not stake.

**Trade-off table**

| Use | Gain | Cost you pay |
| --- | --- | --- |
| Frequent micro-transactions | Sub-cent fees and 1.3s finality | Need to handle async receipts |
| Launch on many chains at once | One NEAR account and one contract controls 30+ chains | Trust in MPC set and verifier contract |
| Swap BTC to USDC without wrapping UX | Solver-based routing with 1 bps base fee | Solver depth varies for very large size |
| Port Ethereum app quickly | Aurora EVM with familiar tools | Extra settlement hop on NEAR |
| Add privacy later | Private shard path previewed | Feature is new, audit coverage limited |
| Keep app state cheap | Storage refund on delete plus contract gas rebate | Must manage storage staking amount per account |

## How to get started

### If you are a user

1. Create a wallet. Go to wallet.near.org or mynearwallet.com and pick a name like `yourname.near`. Back up the recovery phrase. Add a second device or a hardware key if you plan to hold size. On mobile, HERE Wallet at t.me/herewalletbot offers Telegram-based onboarding.

2. Fund a little NEAR. Buy on a major exchange and withdraw to `yourname.near`. You need about 0.01 NEAR to open accounts, and each later transfer is fractions of a cent. If you only want to test, switch the wallet to testnet and use the faucet at near-faucet.io.

3. Try a simple action. Send 0.1 NEAR to a friend or swap USDC on a NEAR dapp such as Rhea Finance or Sweat. Confirm the fee line shows under one cent and confirmation in about one second.

4. Try chain abstraction. Open near.org/intents or a wallet with Intents built in and swap USDC on Base for native BTC to a Bitcoin address you control. This swap signs on NEAR, routes via solvers, and settles on Bitcoin without you installing a second wallet.

5. Harden the account. Add a FunctionCall key for dapps, remove unused keys under Account settings, and enable a 2FA or multisig contract if you hold treasury amounts. House of Stake governance pages show pending proposals and vote with staked NEAR.

### If you are a builder

1. Pick a path. Use Rust for maximum access to NEAR primitives or JavaScript if you want to ship on the web stack quickly. Keep Solidity if you need to port. Decide up front: native NEAR, Aurora EVM, or hybrid where Aurora handles EVM logic and NEAR handles MPC or storage.

2. Install tools. Install Rust via rustup, then add the NEAR toolchain and CLI:

```bash
rustup target add wasm32-unknown-unknown
cargo install cargo-near --locked
npm install -g near-cli
near login
```

3. Create and deploy a hello contract to testnet:

```bash
cargo near new hello-world
cd hello-world
cargo near build
# create a subaccount for the contract
near create-account hello.yourname.testnet --useFaucet
cargo near deploy build/hello_world.wasm --accountId hello.yourname.testnet --initCall new
near call hello.yourname.testnet get --accountId yourname.testnet
near call hello.yourname.testnet increment --accountId yourname.testnet
```

If you prefer JavaScript, run `npx create-near-app@latest`, pick Vite or Next.js, then `npm run dev`. The template wires near-api-js, Wallet Selector, and a sample contract call.

For Aurora, add the network to Hardhat:

```ts
// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config"
const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    aurora: {
      url: "https://mainnet.aurora.dev",
      chainId: 1313161554,
      accounts: [process.env.PRIVATE_KEY as string]
    }
  }
}
export default config
```

Then deploy as usual with `npx hardhat run scripts/deploy.ts --network aurora` and verify on `https://aurorascan.dev`.

4. Add cross-chain signing. From docs.near.org/chain-abstraction/chain-signatures/implementation, basic shape in Rust using `v1.signer`:

```rust
use near_sdk::{env, near, Promise};

#[near]
impl Contract {
    pub fn request_eth_signature(&self, payload_hash: [u8; 32], path: String) -> Promise {
        Promise::new("v1.signer".parse().unwrap())
            .function_call("sign".to_string(), near_sdk::serde_json::json!({
                "payload": payload_hash,
                "path": path,
                "key_version": 0
            }).to_string().into_bytes(), 0, env::prepaid_gas() / 3)
    }
}
```

Derive the Ethereum address off chain with the MPC public key plus `yourcontract.near` plus path `ethereum-1`, fund it with a little ETH on testnet, request a signature for an EIP-1559 transaction, receive the signature in the callback, and broadcast via your usual Ethereum RPC.

5. Add cross-chain swaps with Intents API. Register at docs.near-intents.org, open a WebSocket intents channel, POST an intent of form source chain, asset, amount, destination chain and address, display solver quotes, and call the verifier `intents.near` to settle. For widget-only integration the Intents widget completes this in a day per near.org. For full API control plan about a week.

6. Budget gas and storage. Call `view` methods for free, then estimate with `near view` and `max_gas` before sending a state change. Remember that storing 10 KB costs on the order of 1 NEAR locked, refunded when you delete, and you earn 30 percent of gas used on your contract. Test storage growth with realistic user counts.

7. Ship safely. Run unit tests with `cargo test`, run simulation tests with near-workspaces-rs, and add integration tests that exercise failure receipts. If your MPC logic holds funds, set per-path limits and monitor `v1.signer` upgrades and MPC node liveness. If you bridge, mark transfers pending until light-client proofs finalize.

**Costs to budget.** Estimate $0.001 to $0.01 per NEAR call depending on bytes and storage, about $0.003 to $0.10 per Aurora transaction depending on complexity, plus MPC signing and verifier gas for cross-chain flows. Storage locks are larger but refundable. Keep about 0.1 NEAR extra per user account for reserves.

## FAQ

**Is NEAR an Ethereum layer-2?**

No. NEAR is an independent layer-one with its own validators and consensus. Aurora is the EVM environment on NEAR. If you deploy on Aurora you use Ethereum tooling, but you settle to NEAR state rather than posting rollup data to Ethereum.

**How does NEAR scale differently from Ethereum?**

Ethereum today scales mainly through rollups that post data back to L1. NEAR scales its L1 with Nightshade sharding. A single NEAR block aggregates chunks from many shards. Each chunk is produced in parallel. Stateless validation and dynamic resharding let shard count grow with load without users picking a shard.

**How fast and cheap is NEAR in practice?**

Docs list about 600 ms block time, about 1.3 second finality, and average fees about $0.002. A simple NEAR transfer is under one cent. Contract calls vary with storage. Aurora transactions are typically a few tenths of a cent to about $0.10 for complex calls.

**What makes an account like `alice.near` different?**

It is a native named account with multiple keys and optional contract code. You keep one readable name, manage scoped keys, and rotate them without moving assets. This contrasts with Ethereum where one private key maps to one `0x` address.

**Do I need NEAR to pay gas if I use Aurora?**

On NEAR native you pay in NEAR. On Aurora you pay in ETH at the Aurora RPC, but final settlement still touches NEAR. If you use NEAR account abstraction via meta transactions or relayers, a dapp can sponsor your first calls so you do not need NEAR upfront.

**What is Chain Signatures in one sentence?**

A decentralized MPC service that lets a NEAR account request signatures to move assets on Bitcoin, Ethereum, Solana and other chains without exposing the private key in one place, using derivation paths and the `v1.signer` contract.

**What is NEAR Intents and how is it different from bridges or DEX aggregators?**

Bridges move assets between chains. Aggregators route within one chain. Intents let you state the outcome you want across chains and have solvers compete to deliver it atomically via the `intents.near` verifier. Solvers source liquidity broadly, which is why Intents lists 31+ chains and a 1 bps base fee. There is no pool you must seed.

**How many shards does NEAR have now?**

NEAR has expanded from one shard at launch to six and beyond as usage grew, with Nightshade 2.0 enabling stateless validation. The exact count moves with resharding. Query `protocol_config` via RPC or check Pikes Peak dashboards for the live shard layout.

**Who secures NEAR and what do they earn?**

Stakers delegate to validators. The protocol targets about 2.5 percent annual issuance for validator rewards, paid per epoch. Actual yield depends on commission, uptime, and how much NEAR is staked network-wide. All fees minus the 30 percent contract rebate are burned.

**Where should I start building?**

Start with the NEAR docs quickstart at docs.near.org/smart-contracts/quickstart for Rust or the web app quickstart for JavaScript. For cross-chain, read docs.near.org/chain-abstraction/chain-signatures and docs.near-intents.org. For the canonical design, read the NEAR white paper and Nightshade paper at near.org/papers, the Definitive Guide at near.org/blog/what-is-near-protocol, and the House of Stake pages for current governance parameters.

**What should I read next?**

Docs hub at docs.near.org, NEAR papers at near.org/papers, Aurora docs at doc.aurora.dev, the Intents widget and API at docs.near-intents.org, and the economics pieces at near.org/blog/near-protocol-economics and near.org/blog/evolving-near-tokenomics. For code, see near-examples on GitHub and the v1.signer contract at nearblocks.io/address/v1.signer.
