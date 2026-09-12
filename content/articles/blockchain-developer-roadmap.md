---
title: Blockchain Developer Roadmap
image: /images/alexandre-debieve-FO7JIlwjOtU-unsplash.jpg
data-ai-hint: developer roadmap journey
description: >-
  A practical roadmap for learning EVM application development through protocol
  fundamentals, Solidity, testing, public projects, and security review.
category: Getting Started
publishedDate: '2026-03-11'
lastUpdated: '2026-09-12'
---

An EVM application developer writes code that runs partly in a browser or server and partly on a public network. The onchain part is a smart contract: code and state at an Ethereum address. Users invoke its functions by submitting signed transactions. The offchain part prepares calls, displays data, manages the user interface, and often indexes events for fast queries. Ethereum's [developer documentation](https://ethereum.org/developers/docs/) maps these layers across accounts, transactions, the EVM, smart contracts, client APIs, development networks, storage, and data tools.

That scope should shape a learning plan. Do not begin by copying a token contract and calling yourself job-ready. Start by learning what a transaction does, what code can and cannot know, how a contract's state changes, and what happens when a call fails. Then build small systems that prove you can test assumptions, inspect a transaction, explain a permission, and ship a readable repository.

This roadmap concentrates on EVM application development. It is not a roadmap for cryptography research, consensus-client work, protocol economics, or every blockchain language. Those are legitimate specialties with different prerequisites. Pick a boundary early. Depth in one complete stack is more useful than a folder full of unfinished tutorials.

## Learn the State Model Before Solidity

Ethereum is not a remote database that accepts arbitrary writes. It is a distributed state machine. The [EVM documentation](https://ethereum.org/developers/docs/evm/) describes it as an environment that executes code consistently across nodes. Given a valid prior state and valid transactions, it produces a new state under network rules. That model explains several facts that surprise new developers.

A smart contract is an account with code and state. It can receive transactions, hold a balance, and call other contracts, but it cannot originate a transaction by itself. An externally owned account, controlled through a private key, starts the transaction. The [smart-contract documentation](https://ethereum.org/developers/docs/smart-contracts/) also notes that deployed contracts normally cannot be deleted and that their interactions are irreversible. Treating a deployed address as an ordinary web-service deployment produces expensive mistakes.

Study these concepts until you can explain each in your own words:

- An address identifies an account. It does not reveal a person's name or prove a particular frontend owns the address.
- A private key authorizes signatures. It is not an API token to paste into a repository or browser bundle.
- A transaction is a signed instruction that changes Ethereum state. Its `to` field can target another user account or a contract.
- The transaction's `data` field carries encoded function selection and arguments when it calls a contract.
- A nonce orders transactions sent from one account. A stuck or replaced transaction can affect later transactions with higher nonces.
- Gas measures computation. A sender sets a gas limit and fee fields, while the actual execution consumes some amount of gas.
- Contract storage persists between transactions. Memory is temporary during execution. Events create logs for offchain consumers; they are not contract storage.

The [transaction reference](https://ethereum.org/developers/docs/transactions/) lists the fields that matter in practice: sender, recipient, signature, nonce, value, input data, gas limit, and fee caps. It also explains that a contract call can execute code at the target address. Read a completed transaction on an explorer after studying those fields. Map each displayed row back to the transaction instead of treating the explorer as a magic dashboard.

Learn the difference between `view`, `pure`, and state-changing functions. Calls to `view` and `pure` functions from an externally owned account can be evaluated through `eth_call` without changing state or paying transaction gas. A function that writes storage, transfers assets, emits a state-changing result, or calls a state-changing function needs a transaction. A frontend that uses a wallet signature for a read-only balance query creates needless friction.

Spend time on failure paths. A call may revert because a condition is false, because an external call fails, or because it runs out of gas. A transaction can be accepted into a wallet and then fail when executed. Your interface needs to show the result and transaction hash rather than announcing success as soon as a user approves a wallet prompt.

## Learn Solidity as a Constrained Language

Solidity is an object-oriented, statically typed language designed for the EVM. The official [Solidity documentation](https://docs.soliditylang.org/en/latest/) says its syntax draws from C++, Python, and JavaScript, but familiarity with JavaScript is not a security guarantee. Solidity has storage locations, visibility, value transfer, ABI encoding, and external calls with consequences that front-end JavaScript does not share.

Build and test very small contracts before you build a token. Start with a counter, an address-to-value mapping, and a contract that records a proposal and vote. Each should have clear rules a test can express. For example, a counter can have an owner-only reset. A voting contract can reject votes after a deadline. A registry can reject a duplicate identifier. The purpose is to learn state, authorization, events, reverts, and deployment without a large protocol obscuring the basics.

Then learn these language features in a useful order:

1. Types, `uint`, `address`, `bool`, `bytes`, strings, arrays, structs, enums, mappings, and the difference between value and reference types.
2. Function visibility and mutability: `external`, `public`, `internal`, `private`, `view`, `pure`, and `payable`.
3. State variables, local variables, constants, immutables, constructors, modifiers, custom errors, events, and inheritance.
4. Data locations: `storage`, `memory`, and `calldata`. Understand whether a variable is persistent, copied for a call, or a reference to call input.
5. Interfaces and imports. Use an interface when your contract needs to call another contract without owning its implementation.
6. The ABI. A frontend must encode the function selector and parameters in the format the contract expects.

Read the compiler's warnings. Solidity's documentation recommends the latest released compiler because current releases receive security fixes. Pin a compiler version in the project configuration and explain upgrades in pull requests. Do not use a loose pragma merely because a tutorial used one. A compiler change can alter code generation or language behavior.

Write errors before you write a user interface. A function should say what it expects and reject inputs that violate the rule. Name the rule. `InsufficientBalance`, `Unauthorized`, and `VotingClosed` tell a tester more than an unexplained arithmetic failure. In the frontend, decode and display the error without claiming the transaction failed for a reason you have not confirmed.

## Treat Security as Part of the First Project

Public contracts invite calls from anyone, including callers who do not follow your intended user flow. The official [security considerations](https://docs.soliditylang.org/en/latest/security-considerations.html) make the point plainly: it is easy to write code that works as expected and much harder to rule out behavior the author did not anticipate. Every contract interaction is public, and a bug-free contract is not enough if the compiler, platform, keys, or surrounding system fail.

Start with a threat list beside the contract. Who can call each function? Which state can they change? What funds or permissions could they gain? What happens if they call methods in an unexpected sequence? Which external contracts are trusted, and which may be hostile? Where does price, identity, or randomness come from? A short written answer prevents the usual mistake of adding access control after every function already assumes an honest caller.

External calls deserve special attention. If contract A transfers ETH or calls contract B, B can execute code before A's call finishes. Solidity documents this as the basis of reentrancy. Its recommended Checks-Effects-Interactions order puts validation first, state updates second, and interactions with external contracts last. Do not memorize the phrase and stop there. Write a test with a malicious recipient contract that attempts to call back into the first contract.

Avoid unbounded loops over storage in state-changing functions. The Solidity documentation warns that a loop whose iteration count depends on storage can grow past the block gas limit and leave a contract function unusable. A leaderboard that iterates through every user may work in a ten-account test and fail after normal use. Design pagination, claims, batches, or offchain indexing before the data structure becomes the problem.

Access control is another design task, not a single `onlyOwner` modifier pasted everywhere. OpenZeppelin's [access-control guide](https://docs.openzeppelin.com/contracts/5.x/access-control) describes `Ownable` for a single administrator and `AccessControl` for distinct roles such as a minter and burner. Make a permissions table for every administrative action. State who can pause, mint, upgrade, change an oracle, or transfer ownership. Test both the allowed call and the rejected call for each role.

Use established libraries deliberately. OpenZeppelin Contracts provides implementations of standards such as ERC-20 and ERC-721 along with reusable permission components. Its docs say tagged `latest` releases are audited and warn Foundry users not to track the development branch by default [in the installation guidance](https://docs.openzeppelin.com/contracts/5.x/). Import a tagged release, read the contract you inherit, and keep your own extension small. An audited library does not audit the business rules you add around it.

## Use One Toolchain Long Enough to Learn It

Tool hopping produces shallow familiarity. Choose one contract framework and use it through several projects. Foundry is a solid default for a Solidity-first path. Its [getting-started guide](https://getfoundry.sh/introduction/getting-started/) identifies four tools: `forge` to build, test, debug, deploy, and verify contracts; `cast` to query contracts and send transactions; `anvil` to run a local Ethereum node; and `chisel` as a Solidity REPL.

Create a project with `forge init`, then make `forge build` and `forge test` part of every change. Use Anvil for local deployments and tests that need controllable accounts, balances, timestamps, or block numbers. A local development network creates a blockchain instance without public-network costs. Ethereum's [development-networks guide](https://ethereum.org/developers/docs/development-networks/) explains that such tools can seed deterministic accounts, produce blocks immediately, and provide debugging features.

Learn a JavaScript or TypeScript client library after you understand the contract boundary. Viem provides TypeScript primitives for Ethereum. Its [quick start](https://viem.sh/docs/getting-started) demonstrates a public client configured with a chain and HTTP transport, then uses it to read the current block number. Build the same operation yourself: create a read client, display a contract value, then add a wallet client only for a state-changing write. Keep the network chain ID explicit in configuration and in the interface.

Use a browser wallet on test networks, but do not make it the source of truth for application state. A wallet signs and sends transactions. Your app still needs to handle account changes, network changes, pending states, rejected signatures, failed execution, and refreshed data after confirmation. Read the receipt and relevant events before updating a displayed balance.

Add an explorer workflow to the toolchain. Verify deployed source code where the explorer supports it. Etherscan describes verification as matching uploaded source code with the compiled code onchain [on its verification page](https://etherscan.io/verifyContract). Preserve the exact compiler version, optimizer settings, constructor arguments, source files, and deployment address in the repository. A deployed address without reproducible build information is difficult for another developer to review.

## Build Projects That Show Specific Competence

Each portfolio project should answer a technical question. "Built an NFT marketplace" answers almost nothing. A clear project says what users can do, what runs onchain, what runs offchain, which network it uses, what threats were considered, and how someone can reproduce the tests.

Start with a state-machine exercise. Build a timed escrow for a fixed amount of test ETH. The buyer funds it. The seller can claim after a buyer approval. The buyer can recover funds after a deadline if approval never happens. Write tests for funding twice, claiming without authority, claiming after cancellation, cancellation before a deadline, and cancellation after a claim. This is a small contract with explicit states, value transfer, authorization, time, and failure cases.

Next, build an ERC-20 integration without inventing a currency narrative. Use OpenZeppelin's ERC-20 implementation to issue a test token. Add a separate contract that accepts deposits and allows a user to withdraw exactly their recorded amount. Your tests should include a user attempting to withdraw another user's balance, a token transfer that fails, and a malicious recipient if the project transfers ETH. Explain why the contract needs each permission.

For an event-driven application, build a registry that emits a well-designed event when a record changes. Then write a frontend that queries the contract and uses events to refresh a list. If historical queries become awkward, learn indexing. The Graph's [quick start](https://thegraph.com/docs/en/quick-start/) describes a subgraph as an index built from a deployed contract, an ABI, a start block, a manifest, a GraphQL schema, and mapping code that turns events into entities. Build a subgraph only after the direct contract queries are clear. It should solve a real query problem, not decorate a portfolio.

One project should include an integration with an existing deployed protocol or token on a forked network. Keep the scope narrow: read an oracle value, display a token allowance, or simulate a single swap path without asking users to send funds. Fork testing lets you exercise code against a copy of existing chain state. Ethereum's [testing guide](https://ethereum.org/developers/docs/smart-contracts/testing/) describes this as a local sandbox, so changes do not affect the real protocol or require real ETH.

For every finished project, include these files and details:

- A README with a one-paragraph problem statement, supported network, contract addresses, prerequisites, commands, test coverage boundaries, and known limits.
- A diagram or short sequence showing the user action, frontend call, contract action, emitted event, and state update.
- A deployment script that reads configuration from environment variables without committing private keys.
- Tests for ordinary use, rejected authorization, invalid inputs, state transitions, and any important external call.
- A link to the verified contract address if you deployed to a public test network.
- A short video or GIF that shows one complete action and one handled failure, with no secret values visible.

## Test Beyond the Happy Path

Tests are evidence only when they test a claim. Before adding a test, write the invariant in ordinary language. For an escrow, "the contract cannot release the same deposit twice" is an invariant. For a token vault, "the total recorded user balances cannot exceed the tokens held by the vault" is an invariant. For an access-controlled method, "only addresses with the minter role can mint" is an invariant.

Write unit tests for isolated functions, then integration tests for interactions between contracts. Ethereum's testing guide recommends a suite that combines approaches because different methods find different classes of flaw. It distinguishes automated tests from manual testing, covers unit and integration tests, and describes property-based testing that generates many inputs instead of only a few hand-written examples [in its testing overview](https://ethereum.org/developers/docs/smart-contracts/testing/).

Add negative tests early. Test zero values, maximum sensible values, repeated calls, wrong caller, wrong order, stale deadline, failed token transfer, and unexpected receiver behavior. If your test suite only proves that a cooperative user can follow the intended path, it has not tested the security boundary.

Fuzz simple properties when the input space is larger than a few examples. For a deposit function, generate many valid amounts and assert that a user's recorded balance increases by the deposited amount. Generate invalid inputs and assert a revert. Fuzzing will not prove a project safe, but it can expose assumptions hidden by hand-picked values. Static analysis and independent review add other kinds of scrutiny.

Use a public testnet for end-to-end testing after local tests pass. A testnet has no-value ETH, but it still has public transactions, users, and network conditions. Test wallet switching, transaction replacement, failure display, contract verification, and recovery after a page refresh. Never describe a testnet deployment as a production-ready protocol merely because it has an explorer link.

## Choose a Specialization From Repeated Work

After several complete projects, look at the work you return to voluntarily. Security-oriented developers read exploit writeups, write adversarial tests, study access control, and review diffs. Protocol developers model state transitions, incentives, and integration boundaries. Frontend-oriented Web3 developers make transactions understandable, handle wallets correctly, and build interfaces that expose risk before a signature. Data-oriented developers index events, maintain query schemas, and validate the provenance of displayed numbers.

Choose one area and make the next project deeper rather than broader. A security project might reproduce a reentrancy bug on a local chain, add a fix, and explain the failing and passing tests. A protocol project might implement a small auction with withdrawal accounting and time-based state changes. A frontend project might build a transaction review screen that decodes calldata and refuses to present opaque contract calls as safe. A data project might index a registry's events and compare its indexed state with direct contract reads.

Keep the repository history readable. GitHub's [pull-request tutorial](https://docs.github.com/en/get-started/start-your-journey/hello-world) explains that commits document what changed and why, while pull requests expose diffs for review. Use that workflow even when working alone. A reviewer should be able to see a problem statement, a focused change, the tests added for it, and any security tradeoff you accepted. That is stronger evidence of engineering judgment than a long list of tools in a profile.
