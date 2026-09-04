---
title: Move Language Explained - Resources, Abilities, and How Aptos and Sui Run It
image: /images/christopher-gower-m_HRfLhgABo-unsplash.jpg
data-ai-hint: code on screen
description: >-
  What Move is, who it is for, how it works under the hood with resources and
  abilities, how Aptos Move and Sui Move differ, pros and cons, and how to start building today.
category: Technology Deep Dives
publishedDate: '2026-03-11'
lastUpdated: "2026-09-04"
---

## What is Move

Move is a next generation language for secure, sandboxed, and formally verified programming where assets are first-class types. The Move Book at move-language.github.io introduces it this way, and every production deployment still reflects it: digital assets are explicit resources that cannot be copied or lost by accident.

Move takes its cue from Rust. Resources use move semantics, hence the name. When you move a coin, the original location no longer holds it. You cannot copy it implicitly, you cannot discard it by accident, and the type system tracks what you can do with it. The Move VM then enforces those guarantees again at runtime with a bytecode verifier that checks every module before it is published and again on every execution.

The first use case was the Diem blockchain at Facebook. The Move paper, Move: A Language With Programmable Resources by Sam Blackshear and colleagues, was published June 18, 2019 alongside the Libra whitepaper. Libra was renamed Diem in December 2020, the Diem Association wound down and sold assets to Silvergate in January 2022, but the language survived. Today the two major Layer 1s that run Move are Aptos, mainnet October 17, 2022, and Sui, mainnet May 3, 2023. Both were founded by former Diem engineers. The original repository at github.com/move-language/move is now archived and notes that development continues in move-language/move-on-aptos and move-language/move-sui. Aptos docs explicitly state the goal for Move to become the JavaScript of web3 for safe code involving assets.

### Who it is for

* **Teams that handle tokens, NFTs, and asset logic and want double-spend and accidental loss ruled out by the type system, not just by review.** If your core bug class is duplicating or losing a coin, Move makes that a compile error.
* **Developers building on Aptos or Sui.** Both chains require Move for on-chain logic. You cannot deploy Solidity there natively.
* **Organizations that need flexible permission controls at the token level.** Aptos docs call out token-level permission controls that exist by default to support real-world asset tokenization without custom plumbing. Sui docs highlight capability-based access control via owned objects.
* **Teams that value formal verification.** Both Aptos and Sui publish framework code verified with the Move Prover, and Aptos framework is fully specified and formally verified. If you want to state an invariant such as sum(balances) == total_supply and prove it rather than only test it, Move gives you the tooling.

It is less useful if your target is EVM or Solana. Move does not run there, its VM and data model are different, and its job market is smaller than Solidity and Rust. Most productive Web3 developers pair one on-chain language with one off-chain language, so Move often sits alongside TypeScript or Python for frontends and data work.

### How it works - core language

Move programs are either modules or scripts.

* **Modules** are libraries that define struct types and functions that operate on those types. Struct types define the schema of global storage and module functions define the rules for updating it. Modules themselves are stored on chain. A module is declared as `module 0x42::my_module { ... }` and the address is the account that publishes it. Named addresses like `my_addr::m` are substituted to literal values at compile time but must be used by name at source level.
* **Scripts** are ephemeral entrypoints similar to a main function. A script has one function, can take any number of arguments, returns nothing, and cannot declare struct types, friends, or access global storage directly. Their job is to call module functions. Publishing a module and executing a script are separate VM operations. A source file can contain multiple modules and scripts.

Privileged operations enforce encapsulation. A struct can only be packed or unpacked inside the module that defines it, and its fields can only be read or mutated inside that module. Other modules see the type but must call public APIs. This is how Move enforces invariants like conservation of money at the language level.

#### Structs, resources, and ownership

By default a struct is linear and ephemeral: cannot be copied, cannot be dropped, and cannot be stored in global storage. That is the safe default for money. The Coin example in the Move Book shows this directly: a `struct Coin has store { value: u64 }` has store but not copy or drop. You must move it, store it inside a resource that has store, or explicitly unpack it. Code like `let x = foo` moves `foo` and the old binding is gone. `copy foo` is rejected unless the type has copy.

You relax the default by adding abilities.

#### The four abilities

Abilities are the type feature that controls what is allowed for a value. They gate bytecode instructions. The four are:

* `copy` - value can be duplicated with `copy` and dereference `*r`. If a type has copy, all fields and type arguments inside it must have copy.
* `drop` - value can be popped or ignored at end of scope, overwritten, or discarded after a semicolon. If a type has drop, all contents must have drop.
* `store` - value can exist inside a struct held in global storage, but not necessarily as a top-level resource. This ability does not gate an operation directly, it gates existence in storage together with key.
* `key` - value can serve as a top-level key for global storage operations `move_to`, `move_from`, `borrow_global`, `borrow_global_mut`, and `exists`. Only the defining module can use those operators on its key type. If a type has key, all fields must have store, not necessarily key itself. That asymmetry is intentional.

Builtin types map like this: `bool`, `u8` through `u256`, and `address` have copy, drop, store. `signer` has only drop, it cannot be copied and cannot be put into storage directly. `vector<T>` and references inherit abilities from `T`. Generic structs like `struct Cup<T> has copy, drop, store { item: T }` have those abilities only when `T` satisfies them, so `Cup<signer>` does not have copy because `signer` does not.

A fungible coin typically has `store` but not `copy` or `drop`. A point in geometry has `copy, drop, store`. The book shows both patterns to make the contrast explicit.

#### References, signer, and generics

Move has `&` and `&mut` references with Rust-like borrowing rules, but no references in global storage. A `signer` is a runtime-checked capability representing the transaction sender. Only the signer can add resources to its account with `move_to`. Generics with phantom type parameters and ability constraints allow collection types without separate types for each ability set, similar to how `vector<T>` works.

#### Global storage structure

The Move Book defines global storage as a forest rooted at addresses:

```
struct GlobalStorage {
  resources: Map<(address, ResourceType), ResourceValue>
  modules: Map<(address, ModuleName), ModuleBytecode>
}
```

Each address stores at most one resource value of a given type and one module of a given name. This is the Diem-style model that Aptos keeps.

Storage operators are only available inside the defining module:

* `move_to<T>(&signer, resource)` - publish a resource under the signer's address. Aborts if that address already holds a `T`.
* `move_from<T>(address)` - remove and return the resource, aborts if not present.
* `borrow_global<T>(address)` and `borrow_global_mut<T>(address)` - read without removing.
* `exists<T>(address)` - check presence.

The bytecode verifier checks types, abilities, and that resources are not duplicated or lost on every publish and every call.

#### Signer and access control

Access control comes from two pieces: the `signer` address that signed the transaction and module visibility. Only public functions can be called from other modules, and only the module that defines a key type can use the storage operators for it. Unless a struct has a public constructor, only its defining module can create it. This pushes token permissions into the module rather than into ad hoc mappings.

#### Formal verification

Move on Aptos provides a specification language and the Move Prover. The prover checks user-written specs alongside code in a style similar to a linter or type checker. The Aptos framework, including governance, fungible assets, and digital assets, is published with specs and verified. On Sui, the book and framework also use prover specs for core invariants. The workflow is to write invariants like conservation of supply and run `aptos move prove` or the Sui prover step in CI.

#### Tooling and runtime principles

Aptos documentation lists four principles behind Move: secure by default, runtime verification of bytecode even if source looked correct, formal verification with the prover, and simplicity of bytecode so it can be decompiled, verified, and inspected. The simplicity point matters: unlike trying to subset a general language like Rust for chain use, Move bytecode is intentionally small.

Standard tooling that both ecosystems share: Move package manager with `Move.toml`, built-in unit tests that run without a network, coverage at source and bytecode level, disassembler and decompiler for on-chain bytecode, and IDE plugins for VS Code, Cursor, and IntelliJ.

### How Aptos Move works

Aptos keeps the Diem-style account model and adds extensions documented on aptos.dev/build/smart-contracts/why-move:

* **Full gas accounting.** Move VM on Aptos has 100 percent gas coverage. Gas is charged for CPU, memory, storage, and I/O. Aptos presents this as no hidden gas exploits.
* **On-chain source and bytecode.** Aptos stores both source code and bytecode on chain for audit. Anyone can fetch and decompile a published package.
* **Object model.** Aptos introduced an object model alongside accounts, described in AIP-10. An object allows a heterogeneous collection of resources to be stored together at a single address, so tokens can share a common core layer with richer extensions like a ticket or sword at the same address. This also enables deletability and resource groups for gas efficiency. Aptos docs explicitly compare: Aptos and Sui Move store differently, Solana stores within owner accounts, EVM stores within contract accounts.
* **Fungible Asset and Digital Asset standards.** Influenced by ERC-20, ERC-721, ERC-1155, and Token-2022, but implemented as Move objects and resources with unified APIs. These are AIP-21, AIP-22 and related.
* **In-place upgradeability with compatibility checks.** Packages can be upgraded in place if the new bytecode is layout-compatible, so downstream apps do not need explicit migration. The compatibility checker is enforced by the VM.
* **Sponsored transactions.** Another account can pay gas for a transaction without custom contract code, useful for onboarding where the app pays for the first transactions.
* **Native randomness, type_info, and resource groups.** `aptos_std::type_info::type_of` identifies a type at runtime, resource groups batch storage for efficiency.

Example Aptos structure in pseudocode: a module `0xcafe::basic_coin` defines `struct CoinStore has key { coin: Coin }` and `struct Coin has store { value: u64 }`, then `public fun mint(account: &signer, value: u64)` checks capability with `signer::address_of` and uses `move_to`.

### How Sui Move differs

Sui made larger changes to fit an object-centric, parallel execution model. The Sui docs page sui-move-concepts lists five key differences, and the Mysten Labs blog explains the why.

* **No global storage, no global storage operators.** Original Move uses `move_to`, `move_from` with global storage rooted at addresses. Sui removes all of those operators. The bytecode verifier rejects them. Storage happens in Sui storage outside Move. When you publish, the package is stored as a Sui object. When you create an asset, you create a Sui object. All inputs to a transaction must be passed explicitly as object IDs so the network can schedule non-overlapping transactions in parallel. This is similar to the scaling issue that other chains face with large internal mappings.
* **Addresses repurposed as 32-byte object IDs.** Original Move uses a 16-byte address for accounts. Sui uses a 32-byte address for both objects and accounts. Every object wraps its address in an `id: UID` field. Transaction sender is available via `TxContext`.
* **Key means object.** On Sui a struct with `key` is a Sui object and must have `id: UID` as its first field: `struct MyNFT has key, store { id: UID, name: String }`. The verifier ensures fresh UIDs, never reused, immutable after creation.
* **Module initializers.** Sui runs an optional private function `fun init(ctx: &mut TxContext)` once at publish time to create singleton objects like a shared treasury cap. It must be named `init`, take `&mut TxContext`, return nothing, and be private.
* **Entry functions and Programmable Transaction Blocks (PTBs).** Sui has an `entry` visibilty for functions that should be callable from a transaction but not from other packages. This is used for randomness and to prevent front-running wrappers. More importantly, Sui composes at the transaction level: a single transaction can call up to 1,024 Move functions with outputs of one call fed as inputs to the next, without dynamic dispatch or reentrancy inside the PTB. This is how Sui does batching safely.

Sui docs also note dynamic fields, where an object can gain or lose fields at runtime and link to other objects, and shared versus owned objects. Owned objects bypass consensus, shared objects go through consensus. That distinction lets Sui parallelize owned-object transfers.

In practice a minimal Sui module looks different from Aptos:

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

The presence of `UID` and the `TxContext` parameter, and the absence of `move_to`, signal Sui Move. The same coin on Aptos would use `move_to` to an address.

The two dialects are not portable without edits. Aptos code that uses `borrow_global` will not compile on Sui, and Sui objects with `UID` will not verify on Aptos without changes to `object.move`.

### Pros and cons

**Pros**

* **Asset safety by construction.** Resources without copy and drop cannot be duplicated or lost silently. Conservation of supply bugs that are common in Solidity mappings become compile errors. This is the reason the language exists.
* **Bytecode verification plus source on chain on Aptos, and object model on Sui.** Every module is verified at publish and at runtime. Aptos adds decompilers and stored source so auditors can compare source to bytecode directly.
* **Formal specs.** The Move Prover lets you prove invariants such as total supply equals sum of balances, or that only the owner can mint, instead of relying only on tests. Aptos framework ships verified specs, which sets the expectation for ecosystem projects.
* **Small, auditable bytecode.** No inheritance, no dynamic dispatch in the usual sense, no operator overloading in early designs. Auditors can search for a type and find every place it is created or destroyed because packing and unpacking are module-private.
* **Parallelism on Sui, clear gas on Aptos.** On Sui, explicit object inputs let validators run non-overlapping transactions in parallel. On Aptos, full gas accounting removes a class of gas exploits that other VMs still patch around.

**Cons**

* **Smaller ecosystem and fewer libraries.** Solidity has the most tutorials, templates, audits, and answered questions. Vyper and Move communities are smaller. You will often port Solidity examples and audit guides by hand, and documentation varies between Aptos and Sui despite shared ancestry.
* **Chain coupling.** Concepts like objects, accounts, storage abilities, signer versus TxContext, and sponsored transactions differ between implementations. A module written for Aptos needs structural changes for Sui, especially around storage operators and UID.
* **Newer patterns and upfront design work.** Resource reasoning, abilities, and writing specs require design before coding. Teams coming from EVM need time to model assets as types rather than as numbers in a map.
* **Niche hiring today but scarce supply.** There are fewer postings than Solidity, though roles often post at higher pay because qualified Move developers are scarce. This is a trade-off between volume of openings and differentiation.
* **Breaks conventional web tooling expectations.** Move packages use `Move.toml`, not npm. Testing is `aptos move test` or `sui move test`, not jest. Frontends still need TypeScript with Aptos TS SDK or Sui TypeScript SDK to build PTBs or Aptos transactions, so full dApps are bilingual.

### How to get started

Pick one chain first. Do not try to learn both dialects at once.

**If you pick Aptos**

1. Install the Aptos CLI from aptos.dev, run `aptos --version`. Create a package with `aptos move init --name hello_move --assume-yes`. This creates `Move.toml` and `sources/`.
2. Read the Move Book chapters on modules and scripts, structs and resources, and abilities. Then implement a fungible coin where only the publisher with a capability resource can mint. Store balances with `key` resources under user addresses using `move_to` and `borrow_global_mut`.
3. Test without a network with `aptos move test`. Add coverage with `aptos move test --coverage`. Write a prover spec that states `sum(balances) == total_supply` and run `aptos move prove`. Publish to devnet with `aptos move publish --profile devnet` and verify source on the explorer.
4. Add IDE support: VS Code extension Aptos Move or Cursor and IntelliJ equivalents, all listed on aptos.dev.

**If you pick Sui**

1. Install the Sui CLI, run `sui --version`. Create a package with `sui move new hello_move`.
2. Learn the Sui object model. Create an object `struct Counter has key, store { id: UID, value: u64 }` and an `entry fun increment(counter: &mut Counter)` plus a `fun init` that creates a singleton shared counter on publish.
3. Test with `sui move test`, build with `sui move build`, publish with `sui client publish`. Compose a PTB in TypeScript that calls multiple entry functions atomically, up to 1,024 calls per transaction.
4. Read the Sui Move book section on objects and global storage differences so you do not try to use `move_to` or `borrow_global`.

**Common path for both**

* Start with the BasicCoin tutorial in the Move repository `language/documentation/tutorial` steps 1 to 8, which walks through design, implementation, unit tests, and prover verification. Then port the same coin to your chosen chain's example.
* Keep an off-chain TypeScript frontend from the start. Use `@aptos-labs/ts-sdk` on Aptos or `@mysten/sui` on Sui to connect a wallet, build transactions, and read objects. This teaches you how Move state appears to apps.
* Study the verified frameworks directly: `aptos-framework`, `aptos-token-objects`, and Sui framework `sui-framework/sources`. They are the most reviewed Move code you can read.

### FAQ

**Is Move the same on Aptos and Sui?**
No. They share the base language and VM verifier, but diverge on storage. Aptos keeps account-based global storage with `move_to` and `borrow_global`, adds its object model as a framework, and supports full gas accounting and in-place upgrades. Sui replaces global storage with an object-centric model where every key type has `id: UID`, removes global storage operators, adds `init` and `entry` semantics, and composes transactions as PTBs. Expect changes when porting.

**Why does Move prevent double spends at compile time?**
Because assets are resources with abilities. A token type without `copy` cannot be duplicated by assignment. `let y = x` moves `x`, it does not copy it. Discarding also fails unless the type has `drop`. The compiler enforces this, and the bytecode verifier enforces it again, so duplication fails to build rather than failing in production.

**How is Move different from Rust?**
Syntax looks similar and both use move semantics, but Move is a small bytecode language for assets with abilities, global storage operators, signer, and a prover. Rust is a general systems language with ownership, lifetimes, macros, and no built-in Move VM or prover. Rust is used on Solana and for chain clients. Move is only for Sui, Aptos, and a few smaller chains.

**Is Move safer than Solidity?**
It removes or mitigates bug classes by construction. Original Move docs and Aptos docs note that reentrancy and double spend patterns are structurally harder, bytecode is verified, and the prover can check invariants. Whether a specific project is safer depends more on design, tests, specs, and audits than on language alone. Some teams keep core vaults in Vyper or Move for auditability and surrounding logic in Solidity.

**Can I use formal verification from day one?**
Yes and you should. Start with simple specs: only the right capability can mint, conservation of supply, no overflow on mint, and access control on admin functions. Run the prover in CI so a change that breaks an invariant fails the build.

**Does Move support NFTs and fungible tokens directly?**
Yes through framework standards. On Aptos, use the Fungible Asset and Digital Asset (Token Objects) standards defined in AIPs and implemented in `aptos-token-objects`. On Sui, tokens are objects with `key` and `store`, with closed-loop token and coin standards built on the same model. Both were influenced by ERC-20, ERC-721, ERC-1155 and Token-2022 but use Move structs rather than mappings.

**Which should I learn first if I already know Solidity?**
Learn Aptos Move first if you want the closest mental model to Diem and want `move_to` and account storage. Learn Sui Move first if you are drawn to object-centric parallel execution and PTB composition. Either way, work through the BasicCoin tutorial and then rewrite a small Solidity ERC20 you already understand as a Move module to see where resources replace mappings.

Move is not a drop-in for Solidity. Treat it as a language for modeling scarcity and access control, with the VM checking your work twice, once at compile and once at verification.

