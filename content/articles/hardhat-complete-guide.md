---
title: "Hardhat Complete Guide: Build, Test, and Deploy Ethereum Smart Contracts"
image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1080'
data-ai-hint: ethereum smart contract development hardhat
description: >-
  Hardhat is the Ethereum development environment by Nomic Foundation for compiling, testing, debugging, and deploying smart contracts. Learn how its Runner, EDR network, Ignition, and toolbox fit together, when to choose Hardhat, and how to ship a tested contract to Sepolia in under an hour.
category: Technology Deep Dives
slug: hardhat-complete-guide
imageAlt: Developer writing Hardhat smart contract code on laptop
publishedDate: '2026-03-11'
lastUpdated: "2026-08-28"
---

Hardhat is a development environment for Ethereum software that compiles contracts, runs a local network, executes tests, and deploys code from one CLI. It is built by Nomic Foundation, open source at https://github.com/NomicFoundation/hardhat and documented at https://hardhat.org/docs.

This guide explains what Hardhat does, who should use it, how its parts fit together in Hardhat 3, where it helps and where it does not, and how to create a tested project and deploy to Sepolia today.

## What it is

Hardhat is four pieces that install together in a Node.js project:

- **Hardhat Runner.** The task runner you call with `npx hardhat`. It runs compile, test, ignition deploy, node, and custom tasks. Docs at https://hardhat.org/docs/getting-started.
- **Hardhat Network via Ethereum Development Runtime (EDR).** A local Ethereum network for development. Since v2.21.0 and for all of Hardhat 3, the runtime is implemented in Rust on top of revm. It gives Solidity stack traces, `console.log` in Solidity, and clear revert reasons. Docs at https://hardhat.org/docs/explanations/edr-simulated-networks and the EDR repo at https://github.com/NomicFoundation/edr.
- **Hardhat Ignition.** A declarative deployment system. You describe the contracts and calls you want in a module, Ignition plans the batches, runs them in parallel where safe, resumes after a failure, and records results under `ignition/deployments/`. Docs at https://hardhat.org/ignition and https://hardhat.org/docs/guides/deployment/using-ignition.
- **VS Code extension and toolbox.** The official extension is Solidity by Nomic Foundation at https://marketplace.visualstudio.com/items?itemName=NomicFoundation.hardhat-solidity. The recommended plugin bundle is `@nomicfoundation/hardhat-toolbox-viem` at https://hardhat.org/docs/plugins/hardhat-toolbox-viem.

Hardhat 3 is the current major version. It shipped as a beta in August 2025, with Solidity tests as first class, multichain chain types, a Rust runtime, a revamped build system, and Ignition. The stable release was announced on 1 June 2026 at https://blog.nomic.foundation/hardhat-3-is-now-stable/. Hardhat 3.14.0 is a recent small fix release noted on https://hardhat.org. Hardhat 2 is being replaced by Hardhat 3 per https://blog.nomic.foundation/hardhat-2-is-being-replaced-by-hardhat-3/ and will only add Glamsterdam support, not Hegota.

Hardhat 3 is ESM-first, uses declarative config, supports build profiles, typed artifacts, config variables that can be encrypted with the keystore plugin, and a new hook system for plugins. See what changed at https://hardhat.org/docs/hardhat3/whats-new.

All code is free and open source. You pay only for RPC and gas when you deploy to a live network. Local simulations are free.

## Who it is for

Hardhat fits you if:

- You write Solidity for Ethereum or EVM chains and know JavaScript or TypeScript. You want a local workflow where contracts, TypeScript tests, and scripts share the same Node project.
- You need a plugin ecosystem. Hardhat has hundreds of plugins for Viem, Ethers, verification, upgrades, gas reporting, and ledger hardware wallets.
- You deploy to more than one EVM chain and want accurate local simulation. Hardhat 3 lets you pick a chain type per network or per Solidity test run. Supported chain types today are `l1` for Ethereum mainnet and testnets, `op` for OP Stack chains, and `generic` as a permissive fallback that behaves like Hardhat 2. See https://hardhat.org/docs/explanations/multichain-support.
- You want Ignition for reproducible deploys that survive dropped transactions, gas bumps, and nonce issues.

Hardhat may not be your first pick if:

- You want tests only in Solidity and no Node toolchain. Foundry is a Rust binary with no Node dependency and is often faster for large Solidity-only suites. Hardhat 3 added Solidity tests that are Foundry-compatible with fuzz and invariant support, so many teams now keep both. Hardhat 3 includes a Foundry interop plugin `@nomicfoundation/hardhat-foundry@3.0.0` that reads `forge config` and Foundry remappings.
- You build on Solana. Hardhat targets the EVM. For Solana you need Rust and Anchor, not Hardhat.
- You cannot run Node v22.13.0 or later. Hardhat 3 requires Node v22.13.0 or later and pnpm is strongly recommended per https://hardhat.org/docs/getting-started.

If your team lives in a TypeScript monorepo or relies on TypeChain, OpenZeppelin Upgrades, or Viem, Hardhat is the natural fit. If your team audits contracts and cares about fuzz speed above all else, start with Foundry and add Hardhat for scripting and plugins later.

## How it works

### Project layout

`npx hardhat --init` creates a focused layout, documented at https://hardhat.org/docs/getting-started:

```
hardhat-example/
  package.json
  hardhat.config.ts
  contracts/
    Counter.sol
    Counter.t.sol
  test/
    Counter.ts
  ignition/
    modules/
      Counter.ts
  scripts/
    send-op-tx.ts
```

- `package.json` holds Hardhat and plugins as dev dependencies.
- `hardhat.config.ts` defines solc version, networks, plugins, and paths. It must be ESM in Hardhat 3.
- `contracts/` holds production contracts. Files ending in `.t.sol` in `contracts/` or any `.sol` in `test/` are treated as Solidity tests in Hardhat 3.
- `test/` holds TypeScript tests and optionally Solidity tests.
- `ignition/modules/` holds declarative deployment modules.
- `scripts/` holds ad-hoc scripts with full access to the runtime.

A non-interactive init for agents or CI uses:

```bash
npx hardhat --init --template node-test-runner-viem
npx hardhat --init --templates   # list templates
```

This was added in Hardhat 3.5.0 with TypeScript 6 as the default for new templates.

### Compilation and build profiles

Hardhat invokes `solc` per the `solidity` field in config. Since Hardhat 3.4.0, contracts and Solidity tests compile together in one pass, artifacts are smaller by around 50 percent in some projects due to tighter `outputSelection`, and a `production` build profile records `toolVersionsInBuildInfo` so a production build can be reproduced later.

A typical config:

```ts
// hardhat.config.ts
import { defineConfig } from "hardhat/config";
import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";

export default defineConfig({
  plugins: [hardhatToolboxViem],
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    }
  }
});
```

Hardhat supports multiple solc versions, solc via npm artifacts, and full npm support in the build system so remappings from `hardhat-foundry` or Soldeer work out of the box. See https://hardhat.org/docs/guides/writing-contracts/configuring-the-compiler.

### Simulated networks with EDR

When you call `await network.create()` or run `npx hardhat test`, Hardhat creates an in-process simulation via EDR. Each simulation is isolated, so you can open several at once without interference. When you run `npx hardhat node`, Hardhat exposes the same simulation over HTTP at http://127.0.0.1:8545.

Features the network gives you that a live chain does not:

- Solidity stack traces when a transaction reverts, so you see the exact line.
- `console.log` in Solidity, printed to your terminal.
- Forking at a block, impersonation of any address, mining control, snapshotting, and custom `anvil_*` and `evm_*` methods for tests.
- Accurate gas and state for the selected chain type.

Forking example for a config file:

```ts
export default defineConfig({
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
      forking: {
        url: configVariable("MAINNET_RPC_URL"),
        blockNumber: 21000000
      }
    }
  }
});
```

Or pass a chain type per test run for Solidity tests:

```bash
npx hardhat test solidity --chain-type op
```

Read the chain type details at https://hardhat.org/docs/explanations/multichain-support and simulated networks at https://hardhat.org/docs/explanations/edr-simulated-networks.

### Testing in TypeScript with Viem

The recommended toolbox `hardhat-toolbox-viem` bundles `@nomicfoundation/hardhat-viem`, `@nomicfoundation/hardhat-viem-assertions`, `@nomicfoundation/hardhat-node-test-runner`, `@nomicfoundation/hardhat-network-helpers`, `@nomicfoundation/hardhat-ignition`, `@nomicfoundation/hardhat-ignition-viem`, `@nomicfoundation/hardhat-keystore`, and `@nomicfoundation/hardhat-verify`.

TypeScript tests use Viem and the Node test runner `node:test`:

```ts
// test/Counter.ts
import { describe, it } from "node:test";
import hre from "hardhat";

const { viem, networkHelpers } = await hre.network.create();

describe("Counter", function () {
  it("emits Increment when calling inc()", async function () {
    const counter = await viem.deployContract("Counter");
    await viem.assertions.emitWithArgs(
      counter.write.inc(),
      counter,
      "Increment",
      [1n],
    );
  });
});
```

Common helpers:

- `viem.deployContract("Counter")` deploys with type-safe args.
- `viem.assertions.emitWithArgs` and `revertWith` check logs and reverts.
- `networkHelpers.loadFixture`, `impersonateAccount`, `setBalance`, `time`, and `mine` control state. `loadFixture` runs a setup once and then resets state to that snapshot for each test, which is faster than redeploying.

Run with:

```bash
npx hardhat test
npx hardhat test nodejs
npx hardhat test test/Counter.ts
```

See https://hardhat.org/docs/guides/testing/using-viem.

### Testing in Solidity

Hardhat 3 treats a Solidity file as a test if it is in `test/` or in `contracts/` and ends with `.t.sol`. Any contract with a function starting with `test` is a test contract. Hardhat deploys each test contract and calls each test function. If the call reverts, the test failed.

```solidity
// contracts/Counter.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
contract Counter {
  uint256 public x;
  event Increment(uint256 by);
  function inc() public {
    x += 1;
    emit Increment(1);
  }
  function incBy(uint256 by) public {
    x += by;
    emit Increment(by);
  }
}
```

```solidity
// contracts/Counter.t.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import {Test} from "forge-std/Test.sol";
import {Counter} from "./Counter.sol";

contract CounterTest is Test {
  Counter counter;
  function setUp() public {
    counter = new Counter();
  }
  function test_Inc() public {
    counter.inc();
    assertEq(counter.x(), 1);
  }
  function testFuzz_IncBy(uint256 by) public {
    counter.incBy(by);
    assertEq(counter.x(), by);
  }
}
```

Fuzz tests are functions that take parameters. Hardhat generates random values and calls them many times. Control runs in `hardhat.config.ts` or per test with inline config via `/// forge-config: default.fuzz.runs = 1000` style comments added in Hardhat 3.3.0. Cheatcodes via `vm` are available: `vm.prank`, `vm.warp`, `vm.roll`, `vm.deal`, `vm.store`, `vm.expectRevert`, `vm.expectEmit`, plus EIP-712 cheatcodes added in 3.5.0.

Run with:

```bash
npx hardhat test solidity
npx hardhat test --grep testFuzz_IncBy
npx hardhat test solidity --chain-type l1
```

Extra flags added across Hardhat 3.x: `--coverage` now produces HTML at `coverage/html/index.html` plus markdown and lcov, `--gas-stats` and `--gas-stats-json` for CI, `--snapshot` and `--snapshot-check` for gas snapshots in Solidity tests, and `--verbosity` for tracing even in TypeScript tests. Docs at https://hardhat.org/docs/guides/testing/using-solidity and https://hardhat.org/docs/guides/testing/code-coverage.

### Deployment with Ignition

Ignition modules declare what to deploy, not how to send it. Ignition resolves dependencies, batches independent transactions in parallel, bumps gas for stuck transactions, and journals progress so an interrupted run resumes.

```ts
// ignition/modules/Counter.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CounterModule", (m) => {
  const counter = m.contract("Counter");
  m.call(counter, "incBy", [5n]);
  return { counter };
});
```

Deploy locally by starting a node in one terminal:

```bash
npx hardhat node
```

Then in another:

```bash
npx hardhat ignition deploy ignition/modules/Counter.ts
npx hardhat ignition deploy ignition/modules/Counter.ts --network sepolia --verify
```

Results are written to `ignition/deployments/chain-<id>`. Commit that folder to keep deployments reproducible and verifiable. Verification hits Etherscan, Blockscout, and Sourcify. Sourcify is on by default, Blockscout needs no API key, Etherscan needs a key stored via `hardhat keystore set ETHERSCAN_API_KEY`. See https://hardhat.org/docs/guides/deployment/using-ignition and the plugin docs at https://hardhat.org/docs/plugins/hardhat-verify.

For one-off scripts outside Ignition, Hardhat still supports plain scripts with full access to `hre.network`.

### Debugging

When a TypeScript or Solidity test reverts, Hardhat prints a Solidity stack trace with file and line. Add `import "hardhat/console.sol";` and `console.log("x is", x);` in a contract to print during tests or on the local node. Use `-vvv` style verbosity to see traces: `npx hardhat test --verbosity 3` traces failing tests, `4` traces all tests. Since 3.3.0, verbosity works for TypeScript tests as well.

### VS Code and type safety

The Solidity by Nomic Foundation extension supplies syntax highlighting, inline compiler errors, go to definition, and completion for both Hardhat and Foundry projects. Hardhat 3 generates typed artifacts by default, so Viem calls are checked at compile time. If types look stale after a build, run `npx hardhat build` and reload the TS server with Command Palette then TypeScript: Reload Project. Disable other Solidity extensions such as Juan Blanco's to avoid duplicate diagnostics.

## Pros and cons, honestly

**Strengths:**

- One install for the whole loop. Compile, local network, tests in two languages, coverage, gas stats, and deploys share one config and one CLI.
- Strong debugging. Solidity stack traces, `console.log` in Solidity, and explicit revert reasons save time compared with parsing raw EVM errors.
- Reproducible deploys. Ignition journals every step, resumes after a dropped transaction, handles nonce gaps, and records a deployment that other tools can verify.
- Multichain accuracy. Chain types let you simulate L1 and OP Stack behavior locally and expose chain-specific client methods like `estimateL1Gas` only when `chainType: "op"` is selected.
- Plugin depth. Toolbox Viem wires Viem, network helpers, keystore, ignition, and verify together. Foundry interop reads `foundry.toml` remappings so a repo can keep Forge tests while migrating scripts to Hardhat.
- CI ready. Gas stats with JSON export, coverage in HTML plus lcov, and `--snapshot-check` for gas regression.

**Trade-offs:**

- Node dependency. You must maintain Node v22.13.0 or later, pnpm, and a TypeScript toolchain. Foundry needs only a Rust binary.
- EVM only. Hardhat does not build Solana programs. You will learn a different stack for Rust and Anchor.
- Startup and build time on very large contracts can lag a pure Rust run. Nomic Foundation optimized bootstrap, networking, and Solidity test execution across 3.1 to 3.6, but Forge can still be faster for large Solidity-only suites where no JS work is needed.
- History is short on Hardhat 3 stable. Beta was August 2025, stable was 1 June 2026, so migration docs and plugin ports for edge cases are still being polished. Pin solc, Foundry version, and Hardhat version in CI to keep local and CI builds identical.
- Generic chain type is permissive. If you use `generic` for a chain that diverges from mainnet gas or precompiles, you may miss chain-specific bugs. Test with the exact chain type you ship to.

Hardhat 3 narrowed the gap with Foundry on speed and test language, while keeping the plugin and TypeScript advantages that made Hardhat 2 popular. The practical pattern in 2026 is both: Viem tests and Ignition for app code, Solidity tests for unit and fuzz, with `hardhat-foundry` keeping compilation in sync.

## How to get started

This path gets you from zero to a deployed and verified contract on Sepolia in about 60 minutes.

### 1. Install prerequisites

- Node.js v22.13.0 or later at https://nodejs.org
- pnpm is strongly recommended at https://pnpm.io. npm and yarn also work.
- VS Code at https://code.visualstudio.com with extension Solidity by Nomic Foundation at https://marketplace.visualstudio.com/items?itemName=NomicFoundation.hardhat-solidity

Verify:

```bash
node -v
pnpm -v
```

### 2. Create a project

```bash
mkdir hardhat-example
cd hardhat-example
npx hardhat --init
```

Accept defaults. Choose `A TypeScript Hardhat project using Node Test Runner and Viem` if you see a template prompt. For non-interactive:

```bash
npx hardhat --init --template node-test-runner-viem
```

Inspect what was created:

```
package.json
hardhat.config.ts
contracts/Counter.sol
contracts/Counter.t.sol
test/Counter.ts
ignition/modules/Counter.ts
scripts/send-op-tx.ts
```

Check setup:

```bash
npx hardhat --help
npx hardhat test
```

You should see both Solidity and TypeScript tests pass. If `test` reports separate summaries for Solidity and `node:test`, you are on a pre-3.1 setup. Update to 3.1 or later where output is unified per https://blog.nomic.foundation/hardhat-3-is-now-stable/.

### 3. Write a contract and two test suites

Replace `contracts/Counter.sol` with a minimal ownable counter if you want more than the sample:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Counter {
  uint256 public x;
  address public owner;
  event Increment(uint256 by);
  constructor() { owner = msg.sender; }
  function inc() public {
    require(msg.sender == owner, "only owner");
    x += 1;
    emit Increment(1);
  }
  function incBy(uint256 by) public {
    require(by > 0, "incBy: by must be positive");
    x += by;
    emit Increment(by);
  }
}
```

Add a Solidity fuzz test in `contracts/Counter.t.sol` as shown in the How it works section.

Add or update `test/Counter.ts`:

```ts
import { describe, it } from "node:test";
import hre from "hardhat";

const { viem, networkHelpers } = await hre.network.create();

describe("Counter", function () {
  async function deployCounterFixture() {
    const counter = await viem.deployContract("Counter");
    return { counter };
  }

  it("inc as owner emits Increment", async function () {
    const { counter } = await networkHelpers.loadFixture(deployCounterFixture);
    await viem.assertions.emitWithArgs(counter.write.inc(), counter, "Increment", [1n]);
  });

  it("reverts for non owner", async function () {
    const { counter } = await networkHelpers.loadFixture(deployCounterFixture);
    const alice = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    await networkHelpers.impersonateAccount(alice);
    await networkHelpers.setBalance(alice, 10n ** 18n);
    await viem.assertions.revertWith(
      counter.write.inc({ account: alice }),
      "only owner"
    );
  });
});
```

Run the full suite with coverage and gas:

```bash
npx hardhat test --coverage
npx hardhat test --gas-stats
open coverage/html/index.html   # or xdg-open on Linux
```

### 4. Fund a Sepolia deployer

You need a Sepolia RPC URL and a private key funded with Sepolia ETH.

- Get an RPC URL from Alchemy at https://www.alchemy.com or another provider.
- Get Sepolia ETH from a faucet such as https://www.alchemy.com/faucets/ethereum-sepolia.

Store secrets with the encrypted keystore, not in plain `.env` if you use the toolbox:

```bash
npx hardhat keystore set SEPOLIA_RPC_URL
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
npx hardhat keystore set ETHERSCAN_API_KEY
```

Or use environment variables and read via `configVariable`. Never commit a raw private key. Bots scan GitHub pushes for keys and drain wallets within minutes.

Make sure `hardhat.config.ts` has the Sepolia network as shown earlier.

### 5. Deploy with Ignition

Dry run on the simulated network first:

```bash
npx hardhat ignition deploy ignition/modules/Counter.ts
```

Then deploy to Sepolia:

```bash
npx hardhat ignition deploy ignition/modules/Counter.ts --network sepolia --verify
```

Ignition writes `ignition/deployments/chain-11155111`. Commit that folder. Check the address on Sepolia Etherscan at https://sepolia.etherscan.io and verify the source tab shows the flattened, verified code. If you pass `--verify`, Hardhat will call the verify plugin for Etherscan, Blockscout, and Sourcify in that run.

For a plain script deploy without Ignition, see https://hardhat.org/docs/guides/deployment/using-scripts.

### 6. Keep health checks in CI

Add to GitHub Actions:

```yaml
- uses: pnpm/action-setup@v4
- uses: actions/setup-node@v4
  with: { node-version: "22.13.0" }
- run: pnpm install
- run: npx hardhat test --gas-stats-json gas.json --coverage
- run: npx hardhat ignition deploy ignition/modules/Counter.ts --network sepolia --verify
```

Pin the Hardhat version in `package.json` and, if you keep Forge, pin Forge with `foundry-rs/foundry-toolchain` so local and CI match exactly.

## Frequently asked questions

**Do I need to pay for Hardhat?**

No. Hardhat, Hardhat Toolbox, and Hardhat Ignition are free and open source. You pay only for network fees when you send transactions to a live network. Local tests, simulations, and `npx hardhat node` cost nothing.

**What Node version do I need?**

Node v22.13.0 or later, per https://hardhat.org/docs/getting-started. If `node -v` is lower, update via https://nodejs.org or a version manager before running `npx hardhat --init`.

**How is Hardhat 3 different from Hardhat 2?**

Hardhat 3 is a rewrite with EDR in Rust, Solidity tests, multichain chain types, ESM-first config, a Network Manager where you create connections explicitly, test runner as a plugin, declarative config, config variables, build profiles, npm-native builds, typed artifacts, programmatic HRE creation, and built-in coverage. See https://hardhat.org/docs/hardhat3/whats-new. Hardhat 2 reached end of life after the stable and will only get Glamsterdam support.

**Can I use Solidity tests and TypeScript tests together?**

Yes. Keep unit and fuzz tests in Solidity under `contracts/*.t.sol` or `test/*.sol`, keep integration tests in TypeScript under `test/*.ts` with Viem. Run all with `npx hardhat test`, only Solidity with `npx hardhat test solidity`, only TypeScript with `npx hardhat test nodejs`. Docs at https://hardhat.org/docs/guides/testing/using-solidity and https://hardhat.org/docs/guides/testing/using-viem.

**Do I still need Foundry if I use Hardhat 3?**

Not required, but many teams keep both. Foundry is still fast for pure Solidity fuzz and invariant testing and has Cast and Anvil for chain scripting. Hardhat 3 added equivalent Solidity test features and a plugin `@nomicfoundation/hardhat-foundry@3.0.0` that syncs `foundry.toml` remappings. You can compile the same `src/` with both and choose per task.

**How does Hardhat compare to Foundry on speed?**

Both now run EVM work in Rust. Hardhat 2.21 and Hardhat 3 with EDR improved test speed about 2 times to 10 times over older Hardhat per the 2024 Rust-powered Hardhat post at https://blog.nomic.foundation/rust-powered-hardhat-present-future. Foundry publishes version-over-version Forge benchmarks at https://www.getfoundry.sh/benchmarks, not a stable cross-tool number. In practice Forge tends to be faster for large Solidity-only suites because it never starts Node, while Hardhat adds TypeScript integration and plugins. Benchmark `forge test` against `npx hardhat test` on your repo with the same solc version.

**What does Hardhat Network do that Remix VM does not?**

Hardhat Network is local to your repo, runs via EDR in-process for speed and control, supports forking any block, impersonation, access to chain types, console.log and stack traces that map to your project sources, and integrates with Viem, fixtures, and Ignition. Remix VM at https://remix.ethereum.org is browser based with 10 demo accounts and resets on reload. It is good for a first contract, but not for reproducible CI or multi-file projects. See comparison in https://hashtagweb3.com/articles/best-smart-contract-ide-for-beginners.

**How do I debug a revert?**

Run with traces: `npx hardhat test --verbosity 3` traces failures, `4` traces all. Add `import "hardhat/console.sol";` and `console.log` in the failing contract and rerun. In Viem tests, use `viem.assertions.revertWith` to assert the exact reason. Check the Solidity stack trace for file and line.

**How do I verify on Etherscan?**

Use the verify plugin that comes with the toolbox. After deploy, run `npx hardhat verify --network sepolia <address> <constructorArgs>` or deploy with `npx hardhat ignition deploy ... --verify`. Configure keys via `npx hardhat keystore set ETHERSCAN_API_KEY`. The plugin also supports Blockscout and Sourcify in one call.

**Where should I put tests?**

TypeScript tests in `test/` as `*.ts`, Solidity tests in `contracts/*.t.sol` or `test/*.sol`. Tests in `contracts/Counter.t.sol` are handy when a test belongs to one contract. Tests in `test/` keep product code separate. Both are built before tests run.

**Can Hardhat fork mainnet?**

Yes. Set `forking.url` and optional `blockNumber` in the network config, or pass `--fork-url` style options via config variables. Tests then run against real balances and deployed contracts. Cache helps repeated runs stay fast. Pin the block number for deterministic tests.

**Is `console.log` safe for mainnet?**

Remove it before a production deployment. `import "hardhat/console.sol"` adds code that only works on Hardhat Network. Leave it in, and mainnet deploys still succeed but cost extra gas and add dead code. Strip the import or guard behind a build profile.

**Where do I go next?**

Run the official tutorial at https://hardhat.org/docs/tutorial, then read gas stats at https://hardhat.org/docs/guides/testing/gas-statistics, coverage at https://hardhat.org/docs/guides/testing/code-coverage, and the Ignition guides at https://hardhat.org/ignition.

## Next steps

Create one Hardhat 3 project this week with `npx hardhat --init --template node-test-runner-viem`, copy the Counter example, and make both test suites pass with `--coverage`. Then deploy once to Sepolia with Ignition, verify on Etherscan and Sourcify, and read the gas report. That single loop teaches compilation, simulations, fixtures, cheatcodes, and journalling, and gives you a repo pattern you can reuse for any EVM project.
