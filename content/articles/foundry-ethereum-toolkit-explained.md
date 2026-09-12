---
title: 'Foundry Ethereum Toolkit Explained'
image: /images/tommy-texter-T42j_xLOqw0-unsplash.jpg
data-ai-hint: foundry software toolkit
description: >-
  Build a Foundry learning plan covering Forge tests, setup, core competencies,
  and a 12-month path from Ethereum tooling foundations to advanced practice.
category: Getting Started
publishedDate: '2026-03-11'
lastUpdated: "2026-09-12"
---

Foundry is a collection of command-line tools for developing Ethereum applications. It is not a replacement for Solidity knowledge, a deployment process, or security review. It is the working environment around those tasks: compile contracts, run tests, start a local node, inspect chain data, send transactions, and verify source code. The project's [official documentation](https://getfoundry.sh/) describes the toolkit and is the right source for installation commands, release-specific options, and supported chains.

Developers often notice Foundry because its test suite is written in Solidity. That is useful when the code under test and the test both need direct access to EVM concepts: `msg.sender`, block state, reverts, logs, storage, and low-level calls. It is not a claim that JavaScript or TypeScript test suites are inferior. A project can use Foundry beside a web application stack, and a team should choose tooling that it can review and maintain.

The main programs are `forge`, `cast`, `anvil`, and `chisel`. `forge` manages projects, compilation, tests, scripts, and verification. `cast` is a command-line interface for calls, transactions, encoding, decoding, and RPC queries. `anvil` runs a local Ethereum node for development. `chisel` is an interactive Solidity environment. The [Foundry overview](https://getfoundry.sh/introduction/overview/) documents the current role of each program.

## Set up a project you can reproduce

Install Foundry using the command shown in the [official installation page](https://getfoundry.sh/introduction/installation/), rather than copying a command from an old tutorial. That page also documents updates and platform considerations. Confirm the installed versions with `forge --version`, `cast --version`, and `anvil --version`; include the versions in an issue or pull request when a compiler or test problem is hard to reproduce.

Create a project with `forge init`. A typical repository contains `src` for contracts, `test` for Solidity tests, `script` for deployment or operational scripts, `lib` for installed libraries, and `foundry.toml` for configuration. The [project layout reference](https://getfoundry.sh/config/overview/) explains the defaults and configuration keys. Keep configuration small at first. Pin the Solidity compiler version or range intentionally, set the source paths only when the defaults do not fit, and avoid making a test pass by silently changing EVM version or optimizer settings.

Run `forge build` before writing tests. A clean build verifies import paths and compiler selection. Then run `forge test`. The first useful command is usually not an advanced option but a focused failure report: `forge test --match-test testName -vvvv`. The additional trace shows calls, reverts, and emitted events. Read the trace from the failing assertion backward. The earliest unexpected state change often explains more than the final revert message.

Do not place a private key, RPC URL with embedded credentials, or block-explorer API key in a committed configuration file. Foundry accepts environment variables, and its [configuration documentation](https://getfoundry.sh/config/reference/default-config/) identifies settings that affect RPC endpoints, file access, and other execution behavior. Treat a script that broadcasts transactions as production code: review its inputs, account selection, target chain, and stopping conditions.

## Forge is a Solidity test runner

A Foundry test is a Solidity contract whose public functions follow naming conventions. Tests commonly inherit from `forge-std/Test.sol`, which provides assertions and testing helpers. The [forge-std repository](https://github.com/foundry-rs/forge-std) is the primary reference for that library.

Here is a deliberately small example. It tests an observable behavior, not an internal implementation detail.

```solidity
// src/Counter.sol
pragma solidity ^0.8.24;

contract Counter {
    uint256 public number;

    function setNumber(uint256 newNumber) external {
        number = newNumber;
    }

    function increment() external {
        number += 1;
    }
}
```

```solidity
// test/Counter.t.sol
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Counter} from "../src/Counter.sol";

contract CounterTest is Test {
    Counter internal counter;

    function setUp() public {
        counter = new Counter();
    }

    function test_IncrementAddsOne() public {
        counter.setNumber(4);
        counter.increment();

        assertEq(counter.number(), 5);
    }
}
```

The test says that one call to `increment` changes a prepared value of four to five. It does not establish that incrementing cannot overflow under every allowed compiler setting, that only an authorized caller may update the number, or that an integration treats the result correctly. Good tests make that boundary visible. Add tests for access control, zero values, boundary values, reverts, events, and state transitions relevant to the actual contract.

Test setup should be readable. A giant `setUp` function that deploys a dozen contracts can hide the facts a test depends on. Keep common deployment steps in setup, but use small helpers or local setup in a test when the scenario has its own important assumptions. Name actors by role, such as `admin`, `alice`, or `liquidator`, rather than by unexplained addresses.

## Cheatcodes model chain conditions

Foundry's test environment supplies cheatcodes through `vm`. They let a test set a caller, advance time, adjust balances, inspect logs, expect a revert, or create a fork. These are test controls, not Solidity opcodes; production contracts cannot call them. The [cheatcode reference](https://getfoundry.sh/reference/cheatcodes/overview/) defines their semantics and caveats.

`vm.prank(address)` changes `msg.sender` for the next call. Use it to demonstrate that an unprivileged account cannot use an administrator function and that the intended administrator can. `vm.warp(timestamp)` changes the timestamp seen by the next call, which is useful for a vesting or expiry case. `vm.expectRevert()` expresses that a call should fail. Pair it with the exact custom error or selector when practical so the test does not pass for the wrong reason.

Cheatcodes can make a test unrealistic if they bypass behavior the live chain would enforce. Giving an account a token balance by directly writing storage may be fine for isolating a unit, but it does not test minting or transfer rules. Setting a timestamp is appropriate for a time boundary, but an application should not assume a block timestamp is a precise clock. The [Solidity security notes](https://docs.soliditylang.org/en/latest/security-considerations.html) explain why blockchain state and external calls need cautious treatment.

## Use fuzzing for input space, invariants for sequences

A Solidity test that accepts parameters can be fuzzed by Forge. In a function such as `testFuzz_SetNumber(uint256 x)`, Forge supplies generated inputs across repeated runs. Constrain inputs with `vm.assume` only when the excluded values are genuinely outside the function's intended domain. A test that assumes away every hard case can appear healthy while checking almost nothing. The [fuzz-testing guide](https://getfoundry.sh/forge/advanced-testing/fuzz-testing/) covers configuration, failures, and input handling.

Fuzzing is well suited to arithmetic boundaries, parsing, access checks, and functions whose result can be described directly. For a withdrawal function, generate different deposit sizes and withdrawal requests, then assert the account and total accounting remain consistent. Include values around zero, one, type limits, fee thresholds, and any protocol-specific boundaries. A generated counterexample is a starting point: reduce it, understand it, then write a named regression test for the discovered behavior.

Invariant testing exercises a handler through sequences of calls and checks an invariant after those calls. It is appropriate when the danger lies in interaction order rather than one function call. A vault might maintain an invariant that its recorded asset total never exceeds actual assets under the modeled token behavior. A token might maintain that an allowance does not change unless an approval or authorized spending path runs. Foundry's [invariant-testing documentation](https://getfoundry.sh/forge/advanced-testing/invariant-testing/) explains target selection, handlers, and run settings.

An invariant is only as sound as the environment it includes. If an external token can charge a fee, reenter, or rebase, a simple mock may hide a real integration risk. Model hostile or unusual dependencies when the property concerns them. If that is too expensive for a test suite, state the limitation and cover the integration with a fork test or an audit target.

## Anvil gives scripts a local chain

Run `anvil` when you need a local node with funded development accounts and an RPC endpoint. It is useful for testing a script end to end, checking encoded calldata, replaying a transaction against a fork, or connecting a front end during local development. The [Anvil reference](https://getfoundry.sh/anvil/overview/) documents its flags and behavior.

Local success does not prove a transaction will succeed on a public network. The chain ID, account, gas conditions, deployed dependency addresses, bytecode, and current state all matter. Before broadcasting anything, query the intended RPC endpoint with `cast chain-id`, inspect the sender with `cast wallet address`, and compare contract addresses against the deployment record. Put a chain-ID check in operational scripts. A script aimed at the wrong network can create a costly and irreversible mistake.

Fork tests can place a test at a chosen block of a live network. Pin the block number. Without a pin, changing chain state can make a previously passing test nondeterministic and obscure what was actually checked. Use forks for integrations that are too complex to mock faithfully, such as an existing token, oracle, or governance contract. Avoid treating a fork as permission to execute write operations against a live RPC endpoint.

## Cast is for inspection and careful operations

`cast` can read a contract with an `eth_call`, encode ABI data, decode transaction output, inspect storage, and send a transaction when supplied with the necessary signing setup. It is excellent for answering a small operational question without writing a throwaway program. The [Cast reference](https://getfoundry.sh/cast/overview/) lists the commands and their current arguments.

Use read-only commands first. Check a proxy's implementation address, a role holder, a token balance, or a function return value. When preparing a write, independently verify the target address, ABI signature, arguments, value, sender, nonce behavior, gas policy, and network. Record the transaction hash and the reason for the change. Human review is more important than a convenient command when the operation changes privileged state.

Be careful with hexadecimal data. `cast calldata` can show the encoded bytes for a signature and arguments, but it cannot determine whether the business decision behind the call is sound. Compare the decoded request to an approved change record. For a multisignature workflow, have a second reviewer inspect the target, data, and value before collecting signatures.

## Scripts are deployments with a testable story

Foundry scripts are Solidity programs that can deploy contracts and perform configuration. A script should make its assumptions explicit: expected chain ID, deployer, inputs, existing addresses, and post-deployment checks. Use dry-run simulation before broadcast where the workflow permits it. After deployment, verify constructor arguments, ownership, roles, initialized state, and emitted events.

Source verification makes published source and compiler settings available through supported explorers, but it does not certify security. Foundry documents [contract verification](https://getfoundry.sh/forge/deploying/overview/) options and the information required by different services. Preserve the compiler version, optimizer settings, constructor arguments, and library links that produced the deployed artifact. A verified contract with the wrong initialization is still wrong.

For upgradeable systems, scripts need extra discipline. The deployment of an implementation is separate from initializing a proxy, and proxy storage compatibility constrains upgrades. Read the [OpenZeppelin upgrade guidance](https://docs.openzeppelin.com/upgrades-plugins/writing-upgradeable) before assuming a constructor or storage change behaves like a normal deployment. Test the upgrade from representative state, not only from an empty local chain.

## A learning path that reaches production habits

In the first month, learn Solidity syntax, storage versus memory, visibility, events, errors, Ether and token transfers, and the call stack. Build a small contract and write ordinary tests for its public behavior. Run `forge fmt`, `forge build`, and `forge test` until the loop is routine. The [Solidity documentation](https://docs.soliditylang.org/) should outrank tutorial snippets when details conflict.

Over the next few months, add roles, time conditions, ERC-20 interactions, and integration tests. Learn traces, cheatcodes, fuzzing, and invariant tests. Read every revert rather than changing a test until it passes. Use `anvil` to run a script locally and learn `cast` through read-only queries.

After that, practice operational review. Deploy to a test network, verify source, record addresses, and run a post-deployment checklist. Read a few audit reports and reproduce a simple vulnerability in a toy repository. Add static analysis and an independent review before treating a project as ready for real funds.

Foundry can make that daily loop quick and close to EVM behavior. Its value comes from disciplined use: specific tests, honest models of dependencies, reproducible builds, and deployment scripts reviewed as carefully as contracts.
