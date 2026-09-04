---
title: Sui Blockchain Technology and Developer Ecosystem
image: /images/maxim-hopman-8vn4KvfU640-unsplash.jpg
data-ai-hint: sui blockchain
description: >-
  What Sui is, how its object-centric model and Sui Move enable parallel
  execution, how Mysticeti consensus works, trade-offs versus EVM chains, and
  how developers build and find work in the ecosystem.
category: Educational
publishedDate: '2026-03-11'
lastUpdated: '2026-09-04'
---
Sui is a Layer 1 blockchain built for high throughput, low latency, and direct ownership of on-chain assets. It was developed by Mysten Labs, a team of former Meta engineers from the Novi and Diem projects, and launched on mainnet on May 3, 2023. Sui replaces the account-based state model used by Ethereum with an object-centric model, runs smart contracts in Sui Move, and processes many transactions in parallel instead of one after another.

## What is Sui

Sui is a delegated proof-of-stake network with its own execution and consensus stack. The native token, SUI, has a fixed supply of 10 billion and is used to pay gas, stake with validators, and secure the network. At mainnet launch about 5 percent of the supply was in circulation, with the remainder released on a schedule managed in part by the Sui Foundation. You can verify current circulation via the public endpoints at sui-circulation.suiexplorer.com documented on sui.io/token-schedule.

At the data layer, everything on Sui is an object. Each object has a 32-byte unique ID, an owner field, a version number that increments on each mutation, and BCS-encoded contents. Transactions take objects as inputs and produce new or mutated objects as outputs, forming a DAG of transaction effects. This is documented in the Sui object model at docs.sui.io/concepts/object-model.

Sui Move is the smart contract language. It is a variant of Move, the resource-oriented language first created for Diem. Sui adapts Move to its object model so asset rules are checked by the type system and by the bytecode verifier before a package can be published.

Sui targets use cases where asset ownership, speed, and low fees matter: games with on-chain items, fast payments, marketplaces, DeFi with on-chain order books, and apps that need sponsored or zkLogin-based onboarding.

## Who it is for

**Sui fits you if you:**

* Build games, marketplaces, or social apps where each item is an on-chain object with its own owner and history. The Kiosk standard and dynamic fields make tradable, composable assets simpler than mapping them inside a single contract.
* Need parallel, low-latency writes. If your app does many independent transfers or mints, Sui can execute non-overlapping transactions concurrently without global ordering.
* Want asset safety at the language level. Sui Move prevents accidental duplication or loss of resources through abilities and the verifier. Teams that handle tokens and NFTs get compile-time checks that Solidity requires tests and audits to catch.
* Want built-in onboarding primitives. zkLogin lets users sign with Google, Apple, or other OpenID providers via zero-knowledge proofs, and sponsored transactions let an app pay gas so new users do not need SUI on first use.

**Sui is a weaker fit if you:**

* Must deploy existing Solidity code without changes. Sui does not run EVM bytecode. You will port logic to Sui Move and rethink state as objects, not as mappings in a contract.
* Need the largest library and hiring pool today. Solidity and EVM tooling have more examples, auditors, and answered questions. Sui Move documentation is solid at docs.sui.io and move-book.com, but the community is smaller.
* Require strict EVM equivalence for audits or toolchains. You will maintain separate code paths and tests for EVM and Sui.

Most teams pair Sui Move for on-chain logic with TypeScript for frontends using the Sui TypeScript SDK at sdk.mystenlabs.com/typescript.

## How it works

### Object model and ownership

Sui defines three top-level categories:

* **Sui object:** any on-chain datum with ID, owner, version, and digest. This is the unit of storage and the input to transactions.
* **Sui Move object:** a struct with `key` and a first field `id: UID`, created with `sui::object::new`. Example: `struct Sword has key, store { id: UID, damage: u64 }`. The verifier ensures fresh, never-reused UIDs.
* **Sui Move package:** an immutable set of bytecode modules published as an object. Published packages cannot be changed or removed, and they link to exact versions of dependencies via a linkage table.

Ownership determines how a transaction is processed. From docs.sui.io/develop/objects/object-ownership:

* **Address owned:** held by a specific 32-byte address. Only that address can use it. These bypass consensus.
* **Shared:** created with `transfer::share_object`. Anyone can read it, and mutations go through consensus because multiple users can contend on it. A DEX pool or Kiosk listing is shared.
* **Immutable:** frozen after creation. Anyone can use it, no one can mutate it.
* **Wrapped:** nested inside another object. Access goes through the parent.
* **Consensus-address owned / party:** address-owned but sequenced through consensus, exposed as `ConsensusAddressOwner`.

Version and digest matter. A transaction must provide an (ID, version, digest) reference for each input object. Validators check that the reference matches committed state, which makes parallel scheduling safe.

### Parallel execution, not global ordering

Traditional EVM chains order all transactions globally. Sui does not. It uses a state-access method. Each transaction declares its object inputs up front. The network can run transactions with non-overlapping objects in parallel, and simple transfers of owned objects can finalize on a fast path without full consensus. Only transactions that touch shared objects need ordering through consensus. The Sui blog post All About Parallelization explains this as parallelism by default rather than an optimistic retry layer used by Aptos Block-STM, Monad, and similar engines.

Within a checkpoint, Sui includes transactions first-come, first-served, then orders them by gas price inside the checkpoint. This limits contention for hot shared objects while keeping inclusion fair for minimum-gas transactions.

### Consensus: from Narwhal and Bullshark to Mysticeti v2

At launch, Sui used Narwhal as a DAG-based mempool and Bullshark for ordering. In July 2024 Sui switched to Mysticeti, an uncertified DAG protocol described at sui.io/mysticeti and in the Mysticeti paper at arxiv.org/abs/2310.14821.

Key changes:

* **No per-block certification.** Mysticeti validators sign and share blocks directly, cutting round trips from three to three message delays. Test results cited by Mysten Labs showed about 500 ms for consensus commits and about 250 ms for single-owner transactions, with throughput above 50,000 TPS under low latency and above 100,000 TPS at around 1 second in lab conditions.
* **Multiple leaders per round.** Bullshark committed every two to three rounds through a single leader sub-DAG. Mysticeti can elect multiple anchors per round, so transactions that arrive just after a commit do not wait extra rounds.
* **Lower CPU cost.** Eliminating explicit certification saved about 40 percent of consensus CPU in production, as reported in the March 2026 Decentralized Thoughts analysis of Mysticeti.

Mysticeti v2, detailed on the Sui Blog on November 6, 2025, integrates transaction validation into consensus and adds a Transaction Driver client. Valid transactions no longer need a separate two-thirds quorum vote before consensus. Accept votes are implicit via DAG links. Only rejections need explicit votes. The client submits each transaction to a single validator instead of all validators, batching signatures in block proposals. In rollout measurements, Mysten Labs reported about 35 percent lower latency on Asia-based full nodes (about 1.00 s to 0.65 s) and 25 percent on Europe nodes (about 0.55 s to 0.40 s). From Sui node v1.60, Mysticeti v2 and Transaction Driver became the default path.

All of this keeps the property Sui started with: owned-object transactions skip consensus entirely, shared-object transactions pay consensus cost. For an NFT mint where each mint touches a fresh owned object plus one shared mint counter, most transfers still parallelize, while mints on the shared counter serialize.

### Sui Move: how it differs from Diem Move

The Sui Move Concepts page lists five differences that affect every package:

1. **No global storage.** Diem Move uses `move_to`, `move_from`, `borrow_global` rooted at account addresses. Sui removes these operators. The verifier rejects them. Storage lives in Sui objects outside the module. You pass objects explicitly by ID in the transaction, which enables the parallel schedule above.

2. **Address is a 32-byte object ID.** Diem Move uses 16-byte addresses for accounts. Sui repurposes `address` as 32 bytes for both object IDs and account addresses. An object wraps its address in `id: UID`.

3. **Key means object.** A struct with `key` must have `id: UID` as its first field. Example:

```move
module 0x0::my_coin {
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;

    struct MyCoin has key, store {
        id: UID,
        value: u64,
    }

    public fun mint(value: u64, ctx: &mut TxContext): MyCoin {
        MyCoin { id: object::new(ctx), value }
    }

    public fun transfer(coin: MyCoin, recipient: address) {
        transfer::public_transfer(coin, recipient)
    }
}
```

The same coin on Aptos would use `move_to` to an account address. On Sui you create the object and transfer it with `public_transfer`.

4. **Module initializer.** An optional private `fun init(ctx: &mut TxContext)` runs once at publish time to create singleton objects such as a `TreasuryCap` or a shared registry. It must be named `init`, take `&mut TxContext`, return nothing, and be private.

5. **Entry and PTBs.** Sui marks some functions as `entry` so they can be called in a Programmable Transaction Block but not from other packages. This matters for randomness and for enforcing transaction-level composition. A PTB groups up to 1,024 commands (Move calls, transfers, splits, merges, publishes) into one atomic transaction. Outputs of one command can be inputs to the next, effects apply only if all commands succeed, and fresh objects must be consumed or transferred inside the same PTB. This is lightweight compared to deploying a wrapper contract for batching on EVM.

Other Move properties remain: modules versus scripts, privileged packing and unpacking inside the defining module, four abilities (`copy`, `drop`, `store`, `key`), `signer` checks replaced where relevant by `TxContext::sender`, and bytecode verification plus optional formal verification with the Move Prover.

### Programmable Transaction Blocks in practice

PTBs are the normal transaction format on Sui. With the TypeScript SDK you build them like:

```ts
import { Transaction } from "@mysten/sui/transactions";

const tx = new Transaction();
const [coin] = tx.splitCoins(tx.gas, [1_000_000_000]);
tx.transferObjects([coin], "0xRecipientAddress");
const result = await client.signAndExecuteTransaction({ transaction: tx, signer: keypair });
```

For game or DeFi flows, a single PTB can create an NFT, list it in a Kiosk, split a payment coin, and call a DeepBook limit order, all atomically and with one gas charge. The CLI equivalent is `sui client ptb` documented at docs.sui.io/references/cli/ptb.

### Tokens, storage fund, and fees

Gas is paid in SUI. Storage costs are refundable when you delete or shrink an object, which creates a storage rebate path. A share of fees goes to a storage fund that subsidizes long-term state growth so early and late users pay similar effective rates. The docs note that the sender who touches an object receives a percentage of the rebate, and a portion of the storage fund share of rewards is reinvested.

PTBs save gas versus many single-command transactions because per-transaction overhead is paid once and effects are batched. For shared-object contention, Sui applies per-object gas limits per commit and can defer transactions that exceed the budget, with a configurable maximum of deferral rounds before cancellation.

### Sui Stack and ecosystem primitives

Sui presents itself as more than a settlement layer. Since 2024 to 2025 Mysten Labs shipped several stack components that docs.sui.io now groups under the Sui Stack:

* **zkLogin:** authenticate with Google, Apple, Facebook, etc., via OpenID and a zero-knowledge proof that maps to a Sui address. No seed phrase on first session, yet self-custody is preserved. Documented at docs.sui.io/concepts/cryptography/zklogin.
* **Sponsored transactions:** another address can pay gas for a transaction without custom contract logic. Useful for onboarding.
* **Kiosk:** a shared-object system for commerce with transfer policies and royalties enforced on chain. Objects placed in a Kiosk are wrapped and can only leave through policy-checked purchase flows.
* **DeepBook:** native on-chain central limit order book (CLOB) for spot trading. Protocols use DeepBook for liquidity instead of building isolated AMMs. DeepBook v3 work adds margin and fee sharing. DeepBook and Walrus were included in Grayscale Trusts launched August 12, 2025.
* **Walrus:** decentralized storage and data availability protocol built by Mysten Labs, tightly integrated with Sui but chain-agnostic. Stores blobs referenced by Sui objects, with erasure coding across storage nodes.
* **Seal:** decentralized key management and access control layer on top of Walrus. Seal went to mainnet on September 3, 2025, making Walrus the first decentralized data platform with native on-chain access control. It uses identity-based and threshold encryption so Move logic can gate decryption.
* **Nautilus:** verifiable off-chain compute framework. Results run off chain and are proven back on chain for use in Move contracts.

Around these primitives, community projects include Aftermath Finance, Cetus, Navi, Suilend, SuiNS, and others. The Sui Foundation tracks ecosystem directories at sui.directory and docs.sui.io.

Sui also provides standard tooling: the Sui CLI with `sui move build`, `sui move test`, and `sui client publish`, the Move Analyzer language server for VS Code, Cursor, and IntelliJ with go-to-definition and diagnostics, a Move formatter, the Move Registry (MVR) for on-chain package naming and versioning, and RPC via JSON-RPC, gRPC, and GraphQL. You can run a local stack with `sui devstack` that boots Sui, Walrus, Seal, and DeepBook together for testing.

## Pros and cons

**Pros**

* **Parallel owned-object path.** Most wallets transfers, peer-to-peer payments, and item mints do not contend. They finalize without waiting for global ordering, which keeps latency low when load spikes.
* **Sub-second finality with measured data.** Mysticeti commits at about 400 to 500 ms in production, and owned-object transactions can be lower. The July 2023 load test reached 65 million transactions in a single day. Lab benchmarks reported 50,000 to well above 100,000 TPS depending on latency target. These numbers come from the Sui blog and Mysticeti paper, not from marketing TPS claims alone.
* **Asset safety by construction.** Sui Move resources without `copy` and `drop` cannot be duplicated or lost by accident. Privileged packing, ability checks, and bytecode verification enforce this at publish time and at runtime.
* **On-chain verifiability and auditability.** Package bytecode is on chain, the verifier runs on every publish and call, and the object history forms a DAG you can audit cryptographically.
* **Built-in onboarding and commerce.** zkLogin, sponsored transactions, and Kiosk reduce custom account and marketplace code you would otherwise write and audit.
* **Integrated data and liquidity.** Walrus with Seal for storage plus access control, and DeepBook for native order book liquidity, let you compose apps without stitching three external services manually.

**Cons**

* **Smaller ecosystem and fewer examples.** You will often port Solidity or EVM audit guides by hand. Documentation quality varies across SDK versions, and Sui Move differs enough from Aptos Move that code does not port without edits, especially around `move_to`, `borrow_global`, and `UID`.
* **New mental model.** Modeling assets as objects with explicit ownership, dynamic fields, and shared versus owned access takes design time. Teams from EVM need to stop mapping assets inside one contract and start creating one object per asset.
* **Chain coupling.** Concepts like objects, `TxContext`, `sui::transfer`, sponsorship, and PTB composition do not translate to EVM or Solana. A module written for Aptos needs structural changes for Sui.
* **Tooling split.** Move packages use `Move.toml` and `sui move test`, not npm and jest. Full dApps are bilingual: Move for on-chain logic plus TypeScript for PTBs and frontend.
* **Shared-object contention.** If your app puts all activity through one shared object (for example a single global counter or auction), transactions touching it still serialize and you pay consensus cost. You must shard hot state, use dynamic fields, or batch via PTBs.
* **Hiring volume versus differentiation.** There are fewer Sui Move roles than Solidity roles, though scarcity can mean higher pay for proven Move developers. If you need volume of openings quickly, start with EVM and add Sui Move as a second specialization.

## How to get started

Pick Sui or Aptos first. Do not try to learn both dialects at once.

**1. Install and verify the toolchain**

Install the Sui CLI from docs.sui.io/guides/developer/getting-started/sui-install. Check `sui --version` (current releases at time of writing are in the 1.x line). Install the TypeScript SDK with `npm install @mysten/sui`. Add the Move Analyzer extension in VS Code for diagnostics and auto-format with the Prettier Move plugin.

**2. Create a minimal object package**

Create a package and implement one owned object with access control:

```bash
sui move new hello_sui
cd hello_sui
sui move build
sui move test
```

Write `sources/counter.move`:

```move
module hello_sui::counter {
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;
    use sui::transfer;

    struct Counter has key, store {
        id: UID,
        value: u64,
        owner: address,
    }

    fun init(ctx: &mut TxContext) {
        let sender = ctx.sender();
        let c = Counter { id: object::new(ctx), value: 0, owner: sender };
        transfer::share_object(c);
    }

    entry fun increment(c: &mut Counter) {
        c.value = c.value + 1;
    }
}
```

`init` creates a shared Counter on publish. `increment` mutates the shared object and will go through consensus. For an owned-object variant, remove `share_object`, create the Counter with `transfer::public_transfer(c, sender)`, and add a function `increment_owned(c: &mut Counter)` that bypasses consensus.

**3. Test without a network, then publish**

Run `sui move test` for unit tests, `sui move test --coverage` for coverage. Read the Move Book chapters on modules, structs and resources, and abilities before adding a coin. Publish to testnet or devnet with `sui client publish --gas-budget 100000000` and note the package ID and object IDs in the transaction effects.

**4. Compose a PTB in TypeScript**

Use the SDK to call multiple functions atomically:

```ts
import { Transaction } from "@mysten/sui/transactions";
import { SuiClient } from "@mysten/sui/client";

const client = new SuiClient({ url: "https://fullnode.testnet.sui.io" });
const tx = new Transaction();
const counterArg = tx.object("0xYourSharedCounterId");
tx.moveCall({ target: "0xPackage::counter::increment", arguments: [counterArg] });
const [newCoin] = tx.splitCoins(tx.gas, [100_000]);
tx.transferObjects([newCoin], tx.pure.address("0xFriend"));
const signed = await client.signAndExecuteTransaction({ transaction: tx, signer: wallet });
```

This PTB increments a shared counter and sends a coin in one atomic execution with one gas payment. Explore the PTB cookbook at docs.sui.io/develop/transactions/ptbs/ptb-cookbook for sponsored, kiosk, and split/merge patterns.

**5. Add real ecosystem pieces**

* Add zkLogin by following docs.sui.io/concepts/cryptography/zklogin. Create a proof via the Mysten Labs prover, derive the Sui address from the JWT and salt, and submit a transaction where the sponsor pays gas.
* List an item in a Kiosk instead of using `public_transfer` so royalties and transfer policies are enforced. See docs.sui.io/standards/kiosk.
* For DeFi, call DeepBook with a PTB that places a limit order: `deepbook::book::place_limit_order`. For data, store a blob with the Walrus CLI at docs.wal.app and gate access with Seal at docs.seal.mystenlabs.com.

**6. Study verified examples**

Read the Sui framework at github.com/MystenLabs/sui/tree/main/crates/sui-framework/packages/sui-framework/sources. It is the most reviewed Sui Move you can copy patterns from. Complete the BasicCoin tutorial at github.com/move-language/move/tree/main/language/documentation/tutorial steps 1 to 8, then port that coin to Sui with `UID` and `TxContext` so you see exactly where global storage operators disappear.

## FAQ

**Is Sui EVM compatible?**
No. Sui does not run Solidity or Yul. You write Sui Move and compose calls with PTBs. EVM developers lower migration cost with OpenZeppelin contracts for Sui at docs.openzeppelin.com/contracts-sui and with the Move Book at move-book.com, but you still rewrite state as objects.

**How is Sui Move different from Aptos Move?**
They share the base language and VM verifier but differ on storage. Aptos keeps account-based global storage with `move_to` and `borrow_global`, adds an object model as a framework at package level, and supports in-place upgrades with compatibility checks. Sui removes global storage, requires `id: UID` for any `key` struct, adds `init` and `entry` semantics for the object model, and composes transactions as PTBs. Expect changes when porting.

**Why can Sui run transactions in parallel?**
Because each transaction declares its object inputs. The network can check whether inputs overlap. If they do not, transactions run concurrently. Owned-object transactions do not need ordering, so they finalize faster. Shared-object transactions still go through Mysticeti consensus.

**How fast is finality?**
In production Mysticeti commits at about 400 ms, with batch throughput above 50,000 TPS in low-latency tuning and above 100,000 TPS at about 1 second in the April 2024 Mysticeti post. Single-owner transactions are lower, reported at about 250 ms in the same tests, and the November 2025 Mysticeti v2 post showed further latency reductions via Transaction Driver. Actual user latency also depends on full node location and load.

**What does Mysticeti v2 change for apps?**
You get lower latency and lower cost for the same PTB. The client no longer broadcasts every transaction to all validators for signatures. It picks one validator, includes the transaction in the validator's DAG block, and retrieves certified effects via the DAG position. For most developers the change is transparent, handled by the SDK and full nodes from node v1.60 onward.

**Does Sui have sponsored transactions and zkLogin?**
Yes, both are native. Sponsored transactions let a gas station or app pay gas. zkLogin lets users derive a Sui address from an OAuth JWT with a zero-knowledge proof. Together they allow onboarding without requiring new users to hold SUI first. See docs.sui.io for the current SDK calls.

**What are PTBs?**
Programmable Transaction Blocks. They group up to 1,024 commands into one atomic transaction. Results of one command can be used as arguments to the next. Effects apply only if all commands succeed. This is how Sui does batching without deploying a wrapper contract.

**How should I store data?**
Store small, consensus-critical state as Sui objects. Store larger blobs on Walrus and keep the blob ID plus access policy in a Sui object. Use Seal for encryption and fine-grained decryption policies checked by Move. This pattern is used by marketplace, media, and AI data projects on Sui.

**How does Sui handle fees and storage?**
Fees are paid in SUI. You pay computation plus storage for new objects, and you get a rebate when you delete objects. The storage fund, funded by past fees, covers long-term replication cost so ongoing fees remain similar for new users. You set a gas budget per transaction, and the protocol caps compute per commit per object to bound shared-object contention.

**Which primitives should I learn first if I already know Solidity?**
Start with objects and ownership plus one PTB. Recreate a simple ERC-20 you understand as a Sui coin with `store` but not `copy` or `drop`, with a `TreasuryCap` singleton created in `init` that gates `mint`. Then build a PTB that mints, transfers, and lists the coin in a Kiosk. That path makes resources replace mappings in your mental model.

Sui is not a drop-in for an EVM chain. Treat it as a language for scarcity and access control with an object store and a DAG consensus that checks your work twice: the compiler checks abilities, and the network schedules your object inputs in parallel.

## Verifiable Primary Sources & References

1. [Ethereum EIP-20 Token Standard Specification](https://eips.ethereum.org/EIPS/eip-20)
2. [Ethereum EIP-721 Non-Fungible Token Standard Specification](https://eips.ethereum.org/EIPS/eip-721)
3. [Ethereum EIP-4844 Proto-Danksharding Specification](https://eips.ethereum.org/EIPS/eip-4844)
4. [Ethereum EIP-712 Typed Structured Data Hashing and Signing](https://eips.ethereum.org/EIPS/eip-712)
5. [Ethereum EIP-2981 NFT Royalty Standard Specification](https://eips.ethereum.org/EIPS/eip-2981)
6. [Ethereum Official Yellow Paper & Protocol Specification](https://ethereum.github.io/yellowpaper/paper.pdf)
7. [Ethereum Consensus Specs & Proof of Stake Architecture](https://github.com/ethereum/consensus-specs)
8. [Solidity Compiler Official Documentation & Language Spec](https://docs.soliditylang.org/)
9. [OpenZeppelin Smart Contract Standard Libraries & Security Audits](https://docs.openzeppelin.com/)
10. [Foundry Book Development & Testing Framework Documentation](https://book.getfoundry.sh/)
