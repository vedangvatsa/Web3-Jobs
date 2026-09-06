---
title: 'Move Language Explained - Resources, Abilities, and How Aptos and Sui Run It'
image: /images/christopher-gower-m_HRfLhgABo-unsplash.jpg
data-ai-hint: code on screen
description: >-
  What Move is, who it is for, how it works under the hood with resources and
  abilities, how Aptos Move and Sui Move differ, pros and cons, and how to start
  building today.
category: Technology Deep Dives
publishedDate: '2026-03-11'
lastUpdated: "2026-09-06"
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

#### Verifiable Primary Sources & References

1. [Ethereum EIP-20 Token Standard Specification](https://eips.ethereum.org/EIPS/eip-20)
2. [Ethereum EIP-721 Non-Fungible Token Standard Specification](https://eips.ethereum.org/EIPS/eip-721)
3. [Ethereum EIP-1155 Multi-Token Standard Specification](https://eips.ethereum.org/EIPS/eip-1155)
4. [Ethereum Official Yellow Paper & Protocol Specification](https://ethereum.github.io/yellowpaper/paper.pdf)
5. [Bitcoin: A Peer-to-Peer Electronic Cash System Whitepaper](https://bitcoin.org/bitcoin.pdf)
6. [Ethereum Consensus Specs & Proof of Stake Architecture](https://github.com/ethereum/consensus-specs)
7. [Solidity Compiler Official Documentation & Language Spec](https://docs.soliditylang.org/)
8. [Uniswap v3 Core Architecture Protocol Whitepaper](https://uniswap.org/whitepaper-v3.pdf)
9. [Base Layer 2 Network Official Documentation](https://docs.base.org/)
10. [Solana Core Architecture Documentation](https://docs.solana.com/)
