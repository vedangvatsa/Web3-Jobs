---
title: Rust for Blockchain Explained
image: >-
  https://images.unsplash.com/photo-1555066931-4365d14bab8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHByb2dyYW1taW5nfGVufDB8fHx8MTc1NTAzNjY3OXww&ixlib=rb-4.1.0&q=80&w=1080
data-ai-hint: rust programming blockchain
description: >-
  What Rust is, why Solana, Polkadot, and NEAR use it, how ownership and
  borrowing work, and how to set up rustup, Cargo, and Anchor to ship your
  first on chain program.
category: Technology Deep Dives
publishedDate: '2026-03-11'
lastUpdated: "2026-09-02"
---

## What is Rust

Rust is a systems programming language that builds reliable and efficient software without a garbage collector. The Rust project at rust-lang.org describes three goals: performance with no runtime overhead, reliability through compile time checks, and productivity through documentation, helpful compiler errors, and integrated tooling.

You use Rust where mistakes are costly and speed matters. That is why it appears in browsers, operating systems, embedded devices, and in three major blockchain stacks: Solana programs, Polkadot SDK chains, and NEAR smart contracts.

If you are new to Rust, the official starting point is The Rust Programming Language at doc.rust-lang.org/book/. The installation page at rust-lang.org/tools/install is the source for the supported install method. Everything below is verified against those two sources plus Solana, Polkadot, and NEAR docs.

## Who it is for

**You should learn Rust for blockchain if you:**

* Want to write Solana programs. Solana lists Rust as its primary supported language for on chain programs. Most production Solana programs and the Anchor framework are Rust.
* Want to build a chain, not just a contract. The Polkadot SDK, which includes Substrate and FRAME, is a Rust framework for building sovereign chains and parachains. Runtimes compile to WebAssembly with Rust tooling.
* Want to write NEAR contracts with mature tooling. NEAR recommends its Rust SDK for production contracts. The SDK uses macros and the cargo-near helper to build and test against WASM.
* Come from systems, backend, or security work and like explicit control over memory, threads, and costs.

**You can likely skip Rust for now if you:**

* Only target EVM chains like Ethereum, Base, Arbitrum, or Polygon. Solidity and Vyper cover that VM. You can still use Rust off chain for indexers or clients, but it is not required to deploy there.
* Prefer fast prototyping in JavaScript or Python. NEAR also supports JavaScript, and many teams use TypeScript clients with Rust programs.

## How Rust works

### Ownership, borrowing, and why the compiler says no

Rust manages heap memory through ownership. The book states three rules in ch04-01 What Is Ownership:

1. Each value in Rust has an owner.
2. There can only be one owner at a time.
3. When the owner goes out of scope, the value is dropped. Drop frees the heap memory automatically.

This is different from garbage collected languages that sweep later, and from C where you call free manually. The compiler checks ownership on every build, so a violation does not ship.

Assigning a value moves it. After `let s2 = s1;`, `s1` is no longer valid. That prevents double free. Types that live entirely on the stack and are cheap to copy can implement the Copy trait, such as integers. Types that manage heap data or a resource with Drop cannot be Copy.

Passing a value to a function also moves or copies by the same rule. If you only need to look at data, you borrow it instead.

References and borrowing are covered in ch04-02:

* You create a reference with `&s1` and accept `&String` in the function. Borrowing lets you use a value without taking ownership.
* References are immutable by default. Use `&mut String` to borrow mutably.
* At any given time, you can have either one mutable reference or any number of immutable references. Not both.
* References must always be valid. The compiler rejects dangling references that point to data that has gone out of scope.

These restrictions prevent data races at compile time. A data race needs two or more pointers to access the same data at the same time, at least one write, and no synchronization. Rust refuses to compile that pattern. You can still write a logic bug, but you cannot compile a large class of memory bugs and thread bugs that cause failures in production blockchains handling real assets.

### No garbage collector, zero cost abstractions, and compile time checks

From rust-lang.org: Rust has no runtime or garbage collector. Performance-critical blockchain code runs without pause times. Abstractions like iterators and traits compile down to low level code with little overhead. When you add a check in types, you pay at compile time, not on each transaction.

The type system and borrow checker run before the program runs. If the rules are violated, the program does not compile. That is why Rust programs often feel strict at first and then run with fewer surprises.

### Cargo, rustup, and the release train

**Cargo** is the integrated package manager and build tool. You create a project with `cargo new`, add a dependency with `cargo add`, build with `cargo build`, and test with `cargo test`. Dependencies come from crates.io. Each project has a `Cargo.toml` that lists name, version, edition, and crates.

**rustup** manages Rust installations. The official install for Unix and macOS is:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

On Windows, download `rustup-init.exe` from the install page. After install, tools live in `~/.cargo/bin`, including `rustc`, `cargo`, and `rustup`. Run `rustc --version` to verify. Update with `rustup update`. Uninstall with `rustup self uninstall`.

Rust ships on a 6 week rapid release process with stable, beta, and nightly channels. The book currently documents edition 2024 with Rust 1.90.0 or later, while rust-lang.org lists the latest stable. Use `rustc --version` to know what you have. You can also open local docs with `rustup doc` or `rustup doc --book` for offline reading.

## Why blockchain teams choose Rust

### Performance and determinism

Chains execute the same program on many machines and charge per compute unit. They need deterministic, low overhead code. Rust gives control over allocations and threads without a collector that could cause timing jitter. Solana docs note that each transaction has a fixed compute budget and programs log or check remaining units with `sol_log_compute_units` and `sol_remaining_compute_units`. A collector would make budgeting harder.

### Safety for value

Solana programs, Polkadot runtimes, and NEAR contracts hold funds directly. A use after free or a data race can become a loss of funds. Ownership and borrowing catch those at compile time. For Solana, the solana-program crate replaces some standard behavior intentionally: `println!` is replaced by `msg!` for on chain logs, and `rand` is not available in the deterministic runtime. If you depend on a crate that pulls in `rand`, the build fails. That strictness reduces nondeterminism.

### Where Rust runs on chain

**Solana.** Programs are primarily written in Rust. Native programs depend on `solana-program`, expose an entrypoint with the `entrypoint!` macro instead of `main`, and compile to BPF/SBF bytecode with `cargo build-sbf` or `cargo build-bpf` for deployment as a `.so`. Anchor wraps this with a Rust eDSL, an Interface Definition Language for clients, and a CLI. Anchor handles account validation and serialization, and is recommended for beginners.

Solana's account model matters for Rust. Everything is an account, including programs marked executable and data accounts. Programs are stateless. All state lives in separate accounts passed into the instruction and validated with `#[derive(Accounts)]`. Ownership of a data account belongs to a program, and only that program can mutate it. Accounts also have rent, so you typically make them rent exempt with a minimum balance.

**Polkadot SDK / Substrate.** Substrate is a modular Rust framework for chains. FRAME lets you compose pallets, each marked with `#[frame_support::pallet]`, to build runtime logic for balances, staking, governance, and more. Runtimes build to both native and WASM, with `substrate-wasm-builder` producing `target/.../wbuild/.../*.wasm`. Polkadot itself and its system parachains are Substrate chains. Cumulus makes a Substrate chain Polkadot aware. If you want a custom chain rather than a single contract, this is the Rust path.

**NEAR.** NEAR supports Rust, JavaScript, TypeScript, and Python for contracts, but docs recommend the Rust SDK for production for its maturity and safety. You annotate a struct with `#[near(contract_state)]` and its impl with `#[near]`, then build with `cargo near build` from `cargo-near`. The SDK provides `env::*` for blockchain interaction and standards crates for fungible tokens (NEP-141) and non fungible tokens (NEP-171). Minimum supported Rust version is currently 1.93 for near-sdk.

## Pros and cons for blockchain work

**Pros**

* **Compile time safety for assets.** Ownership and the borrow checker catch double free, use after free, and data races before deploy. When contracts deal with tokens, that matters more than shaving minutes off compile time.
* **No collector and predictable cost.** You control allocations and can reason about the compute budget per transaction. Solana, Substrate, and NEAR all justify Rust on this basis.
* **Strong WASM story.** Substrate and NEAR compile Rust to WASM. Solana compiles Rust to its own bytecode. One language covers many VMs without switching ecosystems.
* **Tooling that teams share.** Cargo, crates.io, `rustup`, and `rustfmt` give a common workflow across chains. Docs and compiler errors are specific, which helps new contributors in open source chain repos.

**Cons**

* **Steep learning curve.** Ownership and borrowing take weeks to internalize if you come from JavaScript, Python, or Solidity. Lifetime errors are common at first.
* **Slower compile feedback.** Rust compile times are longer than Solidity or TypeScript for large crates like Substrate. You trade faster checks for slower builds.
* **More boilerplate without a framework.** Native Solana Rust requires account handling and serialization by hand. Most teams use Anchor to reduce that, which adds its own macros and IDL to learn.
* **Smaller hiring pool for contracts.** If your goal is fastest job access on EVM, Solidity has more open roles today. Rust roles often sit at L1 teams, infra, and high throughput dApps that interview more deeply on systems topics.

## How to get started

### 1. Install Rust the supported way

Do not use a system package manager for your first install unless your chain docs say so.

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"
rustc --version
cargo --version
```

Install a linker if the build fails. On macOS run `xcode-select --install`. On Ubuntu install `build-essential`. Keep Rust in PATH via `~/.cargo/bin`.

### 2. Learn ownership before you write chain code

Work through The Rust Programming Language chapters 4, 10, and 15. Type the examples and fix the compiler errors. Practice these until they are automatic:

* Move vs clone vs copy. Try `let s2 = s1;` then `println!("{}", s1);` and read the error.
* Mutable vs immutable borrows. Try creating two `&mut` refs to the same String in one scope.
* Dangling references. Try returning `&s` from a function that creates `s` inside, then fix by returning `String`.

These exercises mirror real contract bugs, like passing the wrong account as mutable or storing a reference beyond its scope.

### 3. Pick one chain stack and build a small program

**Option A: Solana with Anchor (recommended for dApp builders)**

```bash
cargo install --git https://github.com/solana-foundation/anchor avm --force
avm install latest
avm use latest
anchor --version
anchor init my-counter-dapp
```

Open `programs/my-counter-dapp/src/lib.rs`. A minimal Anchor program has `declare_id!`, `#[program]`, and `#[derive(Accounts)]` structs for each instruction. Anchor creates an account with `init`, `payer = user`, and `space = 8 + 8` where 8 is the Anchor discriminator and 8 stores a `u64`. Use `msg!` for logs. Test with `anchor test`, which starts a local validator, deploys, and runs TypeScript tests that call `program.methods.initialize()` and fetch `program.account.counter`.

When you move to native Rust without Anchor, add `solana-program = "2"` to Cargo, use `entrypoint!`, and build with `cargo build-sbf`.

**Option B: NEAR with near-sdk**

```bash
cargo install cargo-near --locked
cargo near new my-near-counter
cargo near build
cargo test
```

Contracts look like:

```rust
use near_sdk::{near, env};

#[near(contract_state)]
pub struct Contract {
    greeting: String,
}

#[near]
impl Contract {
    pub fn set_greeting(&mut self, greeting: String) {
        self.greeting = greeting;
    }
    pub fn get_greeting(&self) -> String {
        self.greeting.clone()
    }
}
```

Deploy with `cargo near deploy` to testnet after `cargo near create-dev-account`.

**Option C: Polkadot SDK chain with FRAME**

Start from a template rather than from scratch. Clone the Polkadot SDK parachain template listed at paritytech/polkadot-sdk, then modify a pallet. A pallet uses `#[frame_support::pallet]` and macros for `#[pallet::storage]`, `#[pallet::call]`, and `#[pallet::event]`. Build with `cargo build --release`; the WASM runtime appears under `target/.../wbuild/...`. Read the FRAME docs for benchmarking and weights before you expose an extrinsic that users will pay for.

### 4. Add a client in TypeScript or Python

Most Rust programs on Solana and NEAR are called from a TypeScript client using `@coral-xyz/anchor` or `near-api-js`. Keep the on chain code small and move formatting, batching, and analytics off chain.

### 5. Practice secure patterns

* Validate every account in `#[derive(Accounts)]`. Check `owner`, `signer`, and `has_one` where Anchor supports it.
* Check arithmetic. Rust checks `u64` overflow in debug, but use checked math explicitly in release for token amounts.
* Test rent exemption and account space before mainnet.
* For NEAR and Substrate, review standards: NEP-141 for fungible tokens and FRAME weight benchmarking so a extrinsic cannot be abused for free.

## FAQ

**Do I need to know C++ to learn Rust?**
No. Rust borrows syntax from many languages but does not require C++ experience. The book introduces variables, types, functions, and control flow in chapter 3 without assuming systems background. Ownership in chapter 4 is new for most developers regardless of prior language.

**Can I write EVM contracts in Rust?**
Not directly for deployment to Ethereum mainnet, which runs EVM bytecode from Solidity, Vyper, or compiled Yul. You can use Rust for off chain tools, indexers, MEV bots, or for chains that add Rust based VMs. For Ethereum smart contracts, learn Solidity first and add Rust if you move to Solana, NEAR, or Substrate.

**Why do Solana docs replace `println!` with `msg!` and remove `rand`?**
On chain programs must be deterministic and fit a compute budget. `println!` targets stdout, which does not exist on chain, so `msg!` writes to program logs with lower cost. `rand` would produce different outputs on different validators, so it is not allowed in the runtime. A crate that depends on `rand` will fail to build for the SBF target.

**Is Rust hard to learn for Web3?**
The borrow checker is strict. Many developers report a few weeks until basics feel comfortable and several months until they can design pallets or Solana programs without frequent rewrites. The payoff is that the compiler catches many asset safety bugs before audit. Pair Rust study with one chain framework so you apply borrowing to accounts and storage right away.

**What minimum Rust version do I need?**
Check the stack you target. The book requires 1.90.0 with edition 2024. NEAR near-sdk lists MSRV 1.93.0 as of the latest README. Solana toolchains ship with their own pinned `rustc`. Run `rustc --version` after `rustup update` and match the MSRV in the stack docs you follow.

**Should I start with native Solana Rust or Anchor?**
Start with Anchor. Solana docs and the Anchor book both point beginners to Anchor because it generates the IDL, checks accounts, and removes much unsafe boilerplate. Learn native `solana-program` and `entrypoint!` later when you need fine control or want to reduce dependencies.

**How does Rust compare to Move for Aptos and Sui?**
Both aim at asset safety. Move models assets as resources that cannot be copied or lost implicitly. Rust models safety through ownership and type checks. If you target Aptos, Sui, or Movement, learn Move. If you target Solana, Polkadot, or NEAR, learn Rust. Many teams know both.

## Sources to verify

* rust-lang.org front page and rust-lang.org/tools/install for no garbage collector, ownership model promises, Cargo, rustup, 6 week release, and install command.
* doc.rust-lang.org/book ch04-01 and ch04-02 for the three ownership rules, move vs copy, Copy and Drop interaction, and the reference rules that prevent data races and dangling references.
* solana.com/docs/intro/installation and solana.com/docs/programs/rust plus solana.com/news/rust-to-solana for `solana-program`, `entrypoint!`, `msg!`, `cargo build-sbf`, compute budget, and Anchor as the recommended framework.
* paritytech/polkadot-sdk docs for Substrate as a Rust framework, FRAME pallets, and WASM build output.
* near-sdk-rs and docs.near.org for `#[near]`, `cargo-near build`, NEP standards, and Rust as the recommended production language on NEAR.
