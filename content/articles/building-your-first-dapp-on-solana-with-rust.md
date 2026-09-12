---
title: Building Your First DApp on Solana with Rust
image: >-
  https://images.unsplash.com/photo-1603539947678-cd3954ed515d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyMHx8YXBwfGVufDB8fHx8MTc1NTAzNjY3OXww&ixlib=rb-4.1.0&q=80&w=1080
data-ai-hint: solana blockchain rust
description: >-
  A practical introduction to Solana's account model, Rust programs, Anchor,
  local testing, and a small counter application.
category: Getting Started
publishedDate: '2026-03-11'
lastUpdated: "2026-09-12"
---

Your first Solana application is easier to understand when you stop treating it like a small website with a database attached. A Solana program is deployed code. The changing information that program works with lives in separate accounts. Solana describes accounts as the network's basic unit of state: each address identifies an account, and only the program that owns an account can change its data or debit its lamports. Read the [account model](https://solana.com/docs/core/accounts) before writing code. It explains why a client must pass accounts to every instruction and why account validation belongs in the program.

This guide builds a deliberately small counter. It has two instructions: one creates a counter account at zero, and one adds one. The feature is not commercially useful. It is useful because it forces you to make the decisions that recur in larger applications: what state exists, who pays to create it, which signer authorizes the action, and which account may change. Do not add tokens, a web interface, or a database until you can explain those decisions in the counter.

Rust is a good fit for Solana program work because Anchor uses it for program code and turns its attributes into account parsing and checks. Anchor's own [program structure documentation](https://www.anchor-lang.com/docs/basics/program-structure) identifies the pieces you will see here: `declare_id!`, `#[program]`, `#[derive(Accounts)]`, and `#[account]`. You still need to understand what those declarations mean. A macro can reduce repetitive code; it cannot decide whether your authorization rule is correct.

## Set up a local workspace

Install Rust with `rustup`. The Rust project recommends it as the normal installer and uses it to manage toolchains. Its [installation page](https://www.rust-lang.org/tools/install) also explains where the command-line tools are placed if a new terminal cannot find `cargo` or `rustc`.

Next install the Solana CLI and Anchor. The current Anchor [installation instructions](https://www.anchor-lang.com/docs/installation) describe a bundled installer as well as separate installation paths. They also document the commands used later in this article: `anchor init`, `anchor build`, `anchor deploy`, and `anchor test`. Follow the versions and platform instructions in the docs rather than copying a version number from an old tutorial. Toolchains change together, and a program that compiles with one combination of Solana, Rust, and Anchor can fail with another.

After installation, verify the commands in a new terminal:

```bash
rustc --version
solana --version
anchor --version
node --version
```

Node is relevant when you choose a JavaScript or TypeScript test template. [Anchor says](https://www.anchor-lang.com/docs/installation) its default test template is now Rust with LiteSVM, while `--test-template` selects alternatives such as Mocha or Jest. That distinction prevents a common surprise: a newly initialized project may not contain the TypeScript test file shown in an older guide.

Create a project with an explicit test template:

```bash
anchor init counter --test-template mocha
cd counter
```

The generated repository contains program code under `programs/`, configuration in `Anchor.toml`, and build output under `target/` after a build, as described in [Anchor's setup documentation](https://www.anchor-lang.com/docs/installation). Read `Anchor.toml` before deploying. It records the cluster and wallet settings that determine where commands send transactions. A local experiment should remain local until you have run its tests and inspected its account constraints.

Create a separate development keypair if you do not already have one. The Anchor setup guide documents `solana-keygen new`, then shows how the CLI configuration selects `localhost`, `devnet`, or mainnet. A keypair controls the wallet that pays fees and, when needed, account-creation costs. Never paste a seed phrase into a repository, chat, issue, or test fixture. Treat a development wallet as disposable, but treat its secret material as secret material all the same.

## Think in accounts before handlers

The counter needs one data account. It stores a `u64` count. When the account is initialized, someone must fund its storage and sign the transaction. Later, the counter instruction needs a mutable reference to that account. The program does not keep a hidden global variable. It receives the counter account as part of the instruction context and writes its serialized data.

This separation is the practical difference many developers miss when moving from an application server to Solana. A program can operate on many counter accounts, because each account has its own address and state. That gives you a choice: a counter per user, a counter per community, or a counter for the whole application. The counter below does not choose an access policy beyond requiring a writable account for incrementing. That is suitable for a learning exercise only. A production design must state who is allowed to increment and encode that rule in account constraints and instruction logic.

Anchor's `#[account]` attribute defines data stored in a custom account. Anchor documents that it adds an account discriminator and serializes the struct; its example allocates eight bytes for that discriminator plus eight bytes for a `u64`. That is the origin of `8 + 8` below. Allocate exact space intentionally. Account storage has a refundable minimum lamport balance tied to data size, according to Solana's [account documentation](https://solana.com/docs/core/accounts), so an oversized layout has a real cost.

## Write the counter program

Open `programs/counter/src/lib.rs` and use this program as the starting point. Replace the placeholder program ID after the first build; do not deploy with an ID copied from another project.

```rust
use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.counter.count = 0;
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        ctx.accounts.counter.count = ctx.accounts.counter.count.checked_add(1).unwrap();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 8)]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut)]
    pub counter: Account<'info, Counter>,
}

#[account]
pub struct Counter {
    pub count: u64,
}
```

`#[program]` marks the module whose public functions become callable instructions. Each handler's first argument is `Context<T>`, where `T` names the accounts required for that instruction. Anchor validates the specified account types and constraints before the handler runs, as described in its [account-validation reference](https://www.anchor-lang.com/docs/basics/program-structure). In `Initialize`, `init` asks Anchor to create the counter account, `payer = user` identifies the funding signer, and `Signer<'info>` ensures that `user` signed.

`Increment` is intentionally narrow. The `mut` constraint says the account may be written. It does not say who may submit the instruction. Anyone who knows the account address can ask this version to increment it. That behavior is a feature of the example, not an acceptable default. If a user should own a counter, store their public key in the account during initialization and require a matching signer when incrementing. If a counter belongs to a program-derived address, derive it from stable seeds and check those seeds. Do not rely on a button being hidden in the interface; clients can construct transactions without your interface.

The `checked_add` call makes the overflow decision visible. A `u64` has a finite range. At the maximum value, this instruction currently panics through `unwrap`; a real program should return a custom error that the client can display. The point is not that a counter will reach that value. The point is to practice defining failure behavior rather than assuming a mathematical operation cannot fail.

## Build, sync the ID, and run locally

Build the program from the repository root:

```bash
anchor build
anchor keys sync
anchor test
```

The Anchor documentation says `anchor build` writes the compiled program to `target/deploy`. It also documents `anchor keys sync` as the command that updates `declare_id!` to match the generated program keypair. Run it after a build and inspect the resulting change. The program ID in Rust and the configuration used for deployment must agree; a mismatch is a direct route to confusing client errors.

For a `localnet` configuration, [Anchor documents](https://www.anchor-lang.com/docs/installation) that `anchor test` starts a local validator, deploys the program, runs the tests, and stops the validator. You can also start `solana-test-validator` yourself in another terminal when you want to inspect accounts between commands. Keep the test run local while the program is changing. Solana's [fee documentation](https://solana.com/docs/core/fees) explains that every transaction includes a base fee and may include a prioritization fee, so even a small deployment has costs outside a local test environment.

Your first test should prove the two state transitions, not merely that an RPC call returned a signature. Create a new keypair for the counter account. Call `initialize`, fetch the account, and assert that `count` is zero. Then call `increment`, fetch again, and assert one. Add a negative test once you add authorization: submit the same instruction from a different signer and assert that it fails. A test that names the rule is better than a test that only observes a happy path.

## Read failures as design feedback

When a transaction fails, first identify whether the error happened before or inside your handler. Missing signatures, wrong program IDs, absent system programs, and unmet Anchor constraints indicate that the instruction context was wrong. A custom error or log from inside the handler indicates that the context passed validation and your own rule rejected it. This split makes debugging faster than changing random fields in a client call.

Inspect the generated IDL and the account data as you work. The IDL is the contract between your Rust program and a client. Confirm that an instruction name, account name, and argument type are what the client expects. Then make one purposeful change at a time: add an owner field, introduce a `reset` instruction, or turn the account into a PDA. Each change should begin with a written rule and end with a test that proves the rule.

The counter is also a useful portfolio artifact when you document it honestly. Include the program source, the exact local commands you ran, a short architecture note, and tests. Explain that it has no authorization rule if that remains true. That is more credible than presenting a two-function tutorial as a production protocol. The next project can add a user-owned counter, events, a client interface, and a threat model, but it should retain the habit learned here: enumerate state, validate every account, and test the rules you claim to enforce.
