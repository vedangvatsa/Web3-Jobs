---
title: 'An Introduction to Foundry: The Modern Solidity Toolkit'
image: >-
  https://images.unsplash.com/photo-1607705703571-c5a8695f18f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMnx8Y29kaW5nfGVufDB8fHx8MTc1NDk1NDI2M3ww&ixlib=rb-4.1.0&q=80&w=1080
data-ai-hint: foundry software toolkit
description: >-
  Learn what Foundry includes, why Solidity-native testing is fast, how to write
  a basic Forge test, and how its workflow compares with Hardhat.
category: Getting Started
publishedDate: '2026-03-11'
lastUpdated: "2026-08-27"
---

Foundry is a Rust-based toolkit for Ethereum development that lets you compile, test, fuzz, debug and deploy Solidity contracts from the command line. The official book at getfoundry.sh describes it as a blazing fast, portable and modular toolkit. You write tests and deployment scripts in Solidity and run them directly on a fast local EVM.

It is open source at github.com/foundry-rs/foundry, licensed Apache-2.0 and MIT, and installed with a single version manager called foundryup.

## What is Foundry?

Foundry is four tools that install together:

- **Forge** - Build, test, fuzz, debug, format, lint and deploy Solidity contracts. This is where you spend most of your time. See getfoundry.sh/forge.
- **Cast** - Swiss Army knife for chain interaction. Read blocks and storage, send transactions, encode calldata, manage wallets, and call JSON-RPC. See getfoundry.sh/cast.
- **Anvil** - Fast local Ethereum node for development. It runs in memory, mines instantly by default, and can fork mainnet or any EVM chain. See getfoundry.sh/anvil.
- **Chisel** - Interactive Solidity REPL for quick experiments without creating a full project. See getfoundry.sh/chisel.

All four are prebuilt Rust binaries. You do not need Node.js to use them.

## Who it is for

Foundry fits you if:

- You write Solidity or Vyper contracts and want tests in the same language.
- You care about fast feedback loops, fuzz testing, invariant testing, and low-level EVM control.
- You audit contracts or build protocols where security testing matters. Many DeFi teams and auditors use Forge as their default test runner.
- You prefer a terminal workflow and explicit dependency pinning via git submodules or Soldeer.

You might pair it with Hardhat or choose Hardhat 3 instead if:

- Your team lives in a TypeScript monorepo and needs Hardhat plugins, Hardhat Ignition, or OP Stack simulation.
- You need extensive JavaScript-based deployment orchestration across many networks.

In 2026 a common setup is both: Forge for unit and fuzz tests, Hardhat for scripting or plugins. Hardhat 3 can read foundry.toml and share artifacts, so mixing is practical.

## How it works

### Project layout

`forge init` creates a standard layout. Defaults are set in `foundry.toml` and can be changed:

```
project/
  foundry.toml      # compiler, remappings, fuzz, rpc, profiles
  src/              # production contracts (.sol)
  test/             # tests (.t.sol)
  script/           # deploy scripts (.s.sol)
  lib/              # dependencies, usually git submodules like forge-std
  out/              # compiled artifacts (ABI, bytecode)
  cache/            # compiler cache
  broadcast/        # logs from forge script --broadcast
```

Files are identified by suffix: `.sol` for contracts, `.t.sol` for tests, `.s.sol` for scripts. Remappings for imports are auto-detected from `lib/` or declared in `foundry.toml` or `remappings.txt`.

### Forge test execution

Forge compiles with the configured `solc` version and runs tests in REVM, a Rust EVM implementation. Tests are Solidity contracts:

- Each test file ends in `.t.sol` and the contract inherits from `forge-std/Test.sol`.
- Functions starting with `test` or `test_` are tests. `setUp()` runs before each test case.
- Assertions like `assertEq`, `assertTrue` come from forge-std and DSTest.
- Forge isolates each top-level call by default for precise gas accounting. Use `--no-isolate` or `isolate = false` in `foundry.toml` if you need warm storage to carry across calls inside a single test.

Verbosity is controlled with `-v`: no flag for pass/fail, `-v` for test names, `-vv` for logs, `-vvv` for traces on failures, `-vvvv` for traces on all tests, `-vvvvv` to include storage changes.

### Fuzz, invariant and other test types

Any test that takes parameters is a fuzz test. Forge generates random inputs and runs it 256 times by default:

```solidity
function testFuzz_SetNumber(uint256 x) public {
    counter.setNumber(x);
    assertEq(counter.number(), x);
}
```

You control that in `foundry.toml`:

```toml
[fuzz]
runs = 1000
max_test_rejects = 65536
```

Use `vm.assume(x > 0)` to discard bad inputs or `bound(x, 1, 100 ether)` to clamp them. Invariant tests, symbolic tests with `--symbolic` and `check*` or `prove*` functions, and table tests with `table*` and `fixture*` datasets are also built in.

### Cheatcodes

The `vm` object manipulates chain state inside tests. Common ones:

```solidity
vm.warp(1700000000);              // set block.timestamp
vm.roll(18000000);                // set block.number
vm.prank(alice);                  // next call as alice
vm.deal(alice, 100 ether);        // fund an address
vm.store(address(token), bytes32(uint256(0)), bytes32(uint256(1000))); // write storage
vm.expectRevert("Not authorized"); // next call should revert
vm.expectEmit(true, true, false, true); // check indexed topics and data
```

Full list is in the cheatcodes reference at getfoundry.sh/reference/cheatcodes/overview.

### Cast, Anvil and Chisel in practice

**Cast** works inside or outside a project:

```bash
cast block-number --rpc-url $RPC_URL
cast balance vitalik.eth --ether --rpc-url $RPC_URL
cast call 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 "balanceOf(address)(uint256)" 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 --rpc-url $RPC_URL
cast send 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --value 0.01ether --private-key $PRIVATE_KEY --rpc-url $RPC_URL
```

**Anvil** gives you a local chain with 10 accounts funded with 10,000 ETH each:

```bash
anvil
anvil --accounts 20 --balance 1000
anvil --fork-url https://ethereum.reth.rs/rpc --fork-block-number 18000000
```

Default mnemonic is `test test test test test test test test test test test junk`. Do not use it on public networks. Anvil exposes custom RPC methods like `anvil_impersonateAccount`, `evm_mine`, `evm_snapshot`, and `anvil_dumpState` for deterministic workflows.

**Chisel** is the REPL:

```bash
chisel
chisel --fork-url $RPC_URL
chisel eval "uint256 x = 10 + 20; x"
```

Inside Chisel try `!help` for session commands. You can save, load, and export sessions with `chisel list`, `chisel load`, and `chisel view`.

## Writing a test in Forge: a working example

This matches the sample that `forge init` creates, verified against getfoundry.sh/forge/testing.

`src/Counter.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Counter {
    uint256 public number;

    function setNumber(uint256 newNumber) public {
        number = newNumber;
    }

    function increment() public {
        number++;
    }
}
```

`test/Counter.t.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {Counter} from "../src/Counter.sol";

contract CounterTest is Test {
    Counter public counter;

    function setUp() public {
        counter = new Counter();
        counter.setNumber(0);
    }

    function test_Increment() public {
        counter.increment();
        assertEq(counter.number(), 1);
    }

    function testFuzz_SetNumber(uint256 x) public {
        counter.setNumber(x);
        assertEq(counter.number(), x);
    }
}
```

Run:

```bash
forge test
forge test -vvv           # traces for failures
forge test --match-test testFuzz_SetNumber --fuzz-runs 1000
forge test --fork-url $RPC_URL --fork-block-number 21000000
forge coverage
forge snapshot            # writes .gas-snapshot for regression tracking
```

Key rules: test contracts inherit from `Test`, file name ends in `.t.sol`, test functions start with `test`, `setUp` is optional but runs before each test if present.

## Project setup and day-to-day commands

Prerequisites: `git` and `curl`. Rust is only needed if you build from source.

**Install and update**

Current docs at getfoundry.sh/introduction/installation use the getfoundry.sh installer:

```bash
curl -L https://getfoundry.sh/install | bash
# restart terminal or source ~/.bashrc / ~/.zshrc
foundryup
```

This installs `forge`, `cast`, `anvil` and `chisel` to `~/.foundry` by default, or `$XDG_CONFIG_HOME/.foundry` if that is set. Override with `FOUNDRY_DIR`. Update anytime with `foundryup`. Pin a version with `foundryup --install 1.7.1` or use nightly with `foundryup --install nightly`. Before the v1.7 line Tempo-specific flags existed; as of v1.7 they are deprecated and plain `foundryup` ships Tempo support.

Verify:

```bash
forge --version
cast --version
anvil --version
```

Alternatives: download prebuilt binaries from github.com/foundry-rs/foundry/releases, Docker via `ghcr.io/foundry-rs/foundry`, or build with `cargo install --git https://github.com/foundry-rs/foundry --profile release --locked forge cast anvil chisel`.

**Create and build a project**

```bash
forge init my-project
cd my-project
forge build
forge test
```

`forge init` pulls `forge-std` as a submodule into `lib/forge-std`. Inside an existing directory use `forge init --force`. Dependencies are added with `forge install OpenZeppelin/openzeppelin-contracts` and removed with `forge remove`. The Soldeer package manager is an alternative at getfoundry.sh/projects/soldeer.

**Common tasks**

```bash
forge fmt                 # format Solidity
forge lint                # lint, see getfoundry.sh/forge/linting
forge inspect Counter storage-layout
forge script script/Counter.s.sol --rpc-url $RPC_URL --broadcast --account dev
forge verify-contract 0xYourAddress src/Counter.sol:Counter --etherscan-api-key $KEY
cast wallet import dev --interactive
anvil --fork-url $RPC_URL  # leave running, use another terminal for forge test --fork-url http://127.0.0.1:8545
```

Configs live in `foundry.toml`, with profiles for dev, CI, and production. Environment variables like `FOUNDRY_SOLC_VERSION` override file settings.

## Pros and cons

**Pros**

- Single-language workflow. You stay in Solidity for contracts, tests, and scripts, which reduces mental switching and keeps logic next to the code it tests.
- Fast feedback. Everything is a static Rust binary running REVM directly, no Node startup and no transpilation. Parallel execution is on by default.
- Built-in testing power. Fuzzing, invariant testing, fork testing, gas reports, coverage, and a large cheatcode set ship without plugins.
- Simple dependencies. Git submodules or Soldeer with explicit remappings make builds reproducible without a JavaScript package manager.
- Full local chain control. Anvil can fork any EVM chain at a block, impersonate accounts, warp time, snapshot and restore state, and dump state to a file.

**Cons and trade-offs**

- Command-line focus. Teams that prefer TypeScript tooling and Hardhat plugins face a learning curve.
- Smaller plugin ecosystem than Hardhat and NPM. You will write more Solidity instead of installing a plugin.
- Solidity scripting is different. `forge script` runs a Solidity contract as a script, which is powerful but less familiar if you expect Hardhat Ignition or viem scripting.
- Platform constraints. Windows requires WSL or Git Bash. PowerShell and cmd are not supported by foundryup.
- Pinning discipline is on you. You must pin `solc` in `foundry.toml`, pin `forge-std` and other libs to a commit, and pin the Foundry version in CI (for example via `foundry-rs/foundry-toolchain` GitHub Action) to keep local and CI builds identical.

## Foundry vs Hardhat in 2026: what to actually expect

Both changed since 2024, so older comparisons mislead.

| Feature | Foundry | Hardhat |
| --- | --- | --- |
| Test language | Solidity (and Vyper via solc) | JavaScript/TypeScript, and since Hardhat 3 also Solidity tests via EDR |
| Execution | Rust binary + REVM, parallel | Hardhat 3 uses Rust Ethereum Development Runtime (EDR) for simulation, scripting and plugins remain TypeScript |
| Built-in fuzz/invariant | Yes, 256 runs default, configurable | In Hardhat via plugins or via Hardhat 3 Solidity tests, not as central as Forge |
| Local node | Anvil, in-memory, instant mining, forking, custom anvil_* and evm_* RPC | Hardhat Network, also supports forking and mining control |
| Linter/formatter | `forge fmt`, `forge lint` | Plugins like prettier-plugin-solidity, solhint |
| Dependencies | `forge install` (git submodule) or `forge soldeer install` | npm/pnpm |
| Deployment | `forge script` with Solidity, `forge create`, `cast send` | Hardhat Ignition, hardhat-deploy, viem/ethers scripts |

On speed, be careful with numbers. Foundry publishes version-over-version results at getfoundry.sh/benchmarks, not a cross-tool comparison. That page benchmarks five repos including aave-v4, spark-psm, uniswap/v4-core and solady on each release. As of late August 2026 it compared v1.7.1 to v1.8.0 and showed an 18.4% faster aggregated `forge test` time (3m 23s to 2m 45s) and 18.0% for isolated tests. Neither the Foundry team nor the Hardhat team publishes an official, continuously updated Foundry vs Hardhat head-to-head benchmark. Independent posts in 2025-2026 show Foundry still tends to be faster for large Solidity-only suites because it never leaves native code, but Hardhat 3 narrowed the gap a lot after moving its core to Rust. The honest practice is to benchmark on your own code: time `forge test` against your Hardhat suite on the same machine and same solc version.

If you choose Hardhat today, prefer Hardhat 3. It added a Rust-based runtime, Solidity tests, and foundry.toml interop. If you start greenfield and care most about testing, start with Foundry and add Hardhat later only if you need its ecosystem.

## How to get started today

1. Install as above and verify `forge --version` prints a v1.x line. Check github.com/foundry-rs/foundry/releases if you want the exact tag.
2. Run `forge init hello-foundry && cd hello-foundry` and inspect `foundry.toml`, `src/Counter.sol`, `test/Counter.t.sol`, `script/Counter.s.sol`.
3. Set an explicit compiler in `foundry.toml`, for example `solc_version = "0.8.28"`, enable optimizer if you ship to mainnet, and commit the lock for lib versions.
4. Run `forge build`, then `forge test -vv`. Change `Counter` to break a test and run `forge test -vvv` to read the trace and backtrace.
5. Start `anvil` in one terminal and in another try `forge test --fork-url http://127.0.0.1:8545` or `cast block-number --rpc-url http://127.0.0.1:8545`.
6. Add gas discipline: `forge snapshot` and track `.gas-snapshot` in git to catch regressions.
7. Read the Foundry Book cover to cover: installation, project layout, Forge testing, cheatcodes, Cast, Anvil, Chisel, and config reference at getfoundry.sh. Add `foundry-rs/foundry-toolchain` to your GitHub Actions and mirror the local Foundry version there.

Handle secrets safely. Use `cast wallet import` or environment variables like `PRIVATE_KEY` and `RPC_URL`, never commit them, and use `--account` or `--keystore` instead of plain private keys in scripts when possible.

## FAQ

**Do I need Rust to use Foundry?**
No. The default install via `foundryup` downloads prebuilt binaries. You only need Rust if you build from source with `cargo install`.

**Does Foundry support Vyper?**
The project is Solidity-first and Vyper compilation is documented as supported through the same toolchain. Check the current config reference under solc and vyper settings at getfoundry.sh/config.

**Where do I put my RPC URL for fork tests?**
Either pass `--fork-url` on the command line, set `eth_rpc_url` in `foundry.toml` under `[profile.default]`, or use an environment variable. Pin `fork-block-number` for reproducible tests.

**How does Anvil compare to Hardhat Network?**
Both fork chains, control mining, and impersonate accounts. Anvil starts instantly, gives 10 funded accounts by default, and provides Anvil-specific RPCs documented at getfoundry.sh/anvil. Hardhat Network integrates tighter with Hardhat plugins and Hardhat Ignition.

**How do I constrain fuzz inputs?**
With `vm.assume(condition)` to filter or `bound(value, min, max)` to clamp. Forge discards inputs that fail `assume` and counts them toward `max_test_rejects`. Prefer `bound` when you want to keep runs high.

**Can I use Foundry and Hardhat in one repo?**
Yes. Compile the same `src/` with both, pin the same `solc` version, and let Hardhat read `foundry.toml` remappings. Many teams keep tests in Forge and deployments in Hardhat.

**What should I read next?**
The Foundry Book at getfoundry.sh, the cheatcodes reference, the `forge-std` docs at github.com/foundry-rs/forge-std, and the benchmarks page at getfoundry.sh/benchmarks for recent performance notes.
