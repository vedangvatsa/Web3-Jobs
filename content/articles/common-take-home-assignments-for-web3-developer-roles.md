---
title: Common Take-Home Assignments for Web3 Developer Roles
image: >-
  https://images.unsplash.com/photo-1491975474562-1f4e30bc9468?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxhc3NpZ25tZW50fGVufDB8fHx8MTc1NTAzNzEwM3ww&ixlib=rb-4.1.0&q=80&w=1080
data-ai-hint: common take home assignments for web3 developer roles
description: >-
  Prepare for smart-contract and full-stack Web3 take-homes by defining scope,
  testing edge cases, and documenting decisions a reviewer can verify.
category: Career Guides
publishedDate: '2026-03-11'
lastUpdated: '2026-09-12'
---

After an initial call for a [Web3](/what-is-web3) developer role, a company may ask for a take-home assignment. The task can be a small contract, a frontend that talks to an existing contract, a code review, or a tightly scoped product exercise. Its value is not that it recreates a full job. It gives the reviewer something more concrete than a resume or a short technical conversation.

Treat the assignment as an engineering handoff. The reviewer should be able to clone the project, understand the intended behavior, run the tests, and see the trade-offs you made. A feature-heavy submission with no clear setup path often creates more questions than a smaller project that is correct, tested, and explained.

The most useful preparation is not memorizing a particular prompt. It is learning how to turn a vague request into a narrow specification. Read every line of the assignment, write down what is required, identify what is deliberately left open, and decide what you will not build. If a requirement is unclear, ask a concise question early. If the hiring team does not answer, state the assumption in the README and keep the decision reasonable.

## What the Assignment Should Show

A good take-home lets a reviewer see your habits. Can you name assumptions? Do you distinguish a feature from a security property? Do you make an error state visible? Do your tests prove the behavior you claim? Can another developer run the project without asking for private keys, an unstated RPC endpoint, or a missing environment variable?

Start with a short implementation plan. It can be a few lines in an issue or a `README.md`: required user flows, contract state, interfaces, test cases, and deliberate omissions. This is not bureaucracy. It keeps a small assignment from turning into a weekend-long attempt to build a production protocol.

Make a sensible repository shape. Put contract code, tests, deployment details, frontend code, and configuration where the chosen framework expects them. Use an example environment file rather than committing secrets. Pin or clearly state the compiler and package-manager commands. If deployment is optional, a local test environment may be enough. If the prompt requires a public testnet deployment, provide the chain, address, and a note about whether the deployment is still intended to be used.

Reviewers notice the first five minutes. A project that starts with one command, produces a passing test suite, and tells them where to look makes the actual engineering easier to assess. Do not hide the setup behind an elaborate script that fails silently. Give the normal command and explain any prerequisite it needs.

## 1. A Token Staking Contract

A staking prompt often asks for a contract where users deposit an ERC-20 token and accrue a reward under a stated rule. It looks small, but it tests several decisions: how tokens enter and leave the contract, how balances and reward timing are represented, what happens when rewards are claimed, and who funds the reward pool.

Begin with the token interface. [ERC-20](https://eips.ethereum.org/EIPS/eip-20) defines common functions including `balanceOf`, `transfer`, `approve`, `allowance`, and `transferFrom`. A deposit flow normally requires the user to approve the staking contract before the contract can call `transferFrom`. Explain that sequence in the UI and README. Do not assume a user understands why a wallet first asks for an approval and then asks for a deposit transaction.

Define the reward formula before writing Solidity. Is the reward based on elapsed time, completed epochs, a fixed share of a pool, or an externally supplied rate? When does accrual start and stop? Can the rate change? What happens to accrued rewards when the user deposits more? Avoid a formula that is easy to type but difficult to reason about. Use a small number of named state variables, and write tests with hand-calculated expected values.

The assignment does not need a complex reward engine to demonstrate skill. A fixed rate with a clear time boundary is often sufficient. If you add variable rates or compounding, explain why and cover the transitions. Do not claim that a simplified contract is production-ready if it has no reward funding model, no emergency response, and no security review.

Tests should cover at least a successful deposit, an attempted deposit without approval, withdrawal after time passes, withdrawal before a reward is available if that is possible, repeated claims, and more than one user. Test the accounting around zero amounts and exact boundaries. Use a mock token for the normal path, then consider whether the contract assumes every token behaves like a standard ERC-20. State any such assumption rather than leaving it implicit.

## 2. A Simple Onchain Auction

An auction assignment tests time, competing users, asset custody, and settlement. The prompt may ask for an English auction with ascending bids or a Dutch auction with a declining price. Do not start by optimizing gas. Start by defining the phases: created, active, ended, settled, and canceled if cancellation exists. Then define which actions are allowed in each phase.

For an NFT auction, identify the asset standard and custody path. ERC-721 standardizes ownership, approval, and transfer methods for non-fungible tokens. Its [safe transfer rules](https://eips.ethereum.org/EIPS/eip-721) call `onERC721Received` when the recipient is a contract, so an auction contract that receives NFTs needs the right receiving behavior. A project can use a mock NFT in tests, but it should still make clear who owns the NFT before the auction, when custody changes, and what happens if the auction never receives a valid bid.

For an ETH-denominated English auction, a bidder should not lose money merely because another bidder submits a higher amount. Record refundable balances and let users withdraw them, rather than sending money to every outbid participant inside `bid`. This pull-payment pattern reduces the amount of external behavior in the bidding function. It also gives you a clear test: an outbid account can withdraw exactly its prior bid once and cannot withdraw twice.

Use `block.timestamp` according to the prompt, but explain its role and do not build a pretend high-frequency market around it. Enforce the start and end times in the contract, reject late bids, and test the boundary. Decide whether a bid must exceed the current bid by a minimum amount. Decide what happens when the auctioneer settles. A short design note that names these decisions is more valuable than extra screens.

Review reentrancy and authorization around refunds, settlement, NFT transfers, and cancellation. A contract that transfers ETH before clearing a claim can be entered again by a receiving contract. The Solidity [security guidance](https://docs.soliditylang.org/en/latest/security-considerations.html) describes the checks-effects-interactions order that avoids this common failure pattern. Apply it in the code and test the path with a hostile receiver if the assignment scope allows it.

## 3. A Security Review and Repair

Some assignments give you a short contract with intentional flaws and ask you to identify, explain, and repair them. Do not respond with a list of buzzwords. Review the code as a system.

First, write down the assets and privileges. Which functions move ETH or tokens? Who can call them? Which values are supplied by an untrusted caller? What assumptions does the code make about time, prices, external contracts, or the order of operations? Then trace each public function from input to storage write to external call.

For every issue you report, include four parts: the location, the precondition, the consequence, and the fix. "Possible reentrancy" is weak. "`withdraw` sends ETH before clearing `credit`; a caller with a receiving contract can call `withdraw` again while its credit remains nonzero; clear the credit before the transfer and test the callback" is useful. Keep the fix as narrow as possible. A rewrite that changes unrelated behavior makes it hard to verify what solved the problem.

Write an exploit test when you can. Foundry test contracts can deploy collaborators and call them as different accounts, while its test runner supports fuzzing functions that take parameters. The [Foundry testing documentation](https://book.getfoundry.sh/forge/writing-tests) shows the standard conventions and testing tools. A convincing submission proves that the vulnerable version fails under the stated condition and that the corrected version rejects the same attempt or preserves the invariant.

Be precise about compiler behavior. Solidity 0.8.x checks overflow and underflow by default, unless code uses `unchecked`; older code may have different behavior. Cite the compiler version in the project and do not report an overflow as exploitable without checking the version and code path. Security review is an exercise in evidence, not an excuse to list every issue you remember reading about.

## 4. A Wallet Dashboard

A full-stack assignment may ask for a React or Next.js page that connects a wallet, shows an address, reads balances, and handles a user action. The visual design matters, but the important question is whether the interface accurately represents what the chain and wallet can do.

Separate read state from signing state. A public client can read a contract without a wallet connection, while a state-changing action needs an account and user signature. Viem's [`readContract`](https://viem.sh/docs/contract/readContract) documentation describes reads as calls to `view` or `pure` functions that do not change state and do not require gas. Reflect that difference in the interface. A balance display can load before connection; a transfer button should explain why it is disabled until the right wallet and network are available.

Handle the states a user will see: no wallet, connection request, rejected connection, wrong network, loading balance, empty balance, failed RPC request, transaction awaiting signature, submitted transaction, reverted transaction, and confirmed result. You do not need elaborate animation for each state. Direct text and a retry path are enough. Do not display a transaction as successful when you only know that the wallet accepted the signature.

Use exact values for token amounts. JavaScript floating-point arithmetic is a poor place to represent units that a contract expects as integers. Keep values in the smallest unit until formatting for display, and convert user input with a library function that knows the token decimals. State the network and token contract explicitly. A dashboard that quietly reads mainnet while the user expects a testnet has failed before its first interaction.

Keep the first version small. A clean address, chain indicator, native balance, one ERC-20 balance, and a narrow transaction flow can show more judgment than a dashboard with price charts, portfolio history, and unsupported buttons. If you add a transfer form, validate the address, display the amount and recipient for confirmation, and surface a useful error without exposing raw provider objects to the user.

## 5. An Interface for an Existing Contract

Another common exercise is a frontend for an already deployed testnet contract. You may receive the address and ABI, or you may need to read the repository. The task is not to guess what the contract does. The task is to understand its actual interface and represent it accurately.

The Solidity [ABI specification](https://docs.soliditylang.org/en/latest/abi-spec.html) describes the ABI as the standard way to interact with Ethereum contracts, with the schema needed to decode typed call data. Read every function in the supplied ABI. Mark which are `view`, which are `payable`, which change state, which return values, and which events provide useful confirmation. Then map the user flow to those functions.

Do not put a contract method name directly on a button and call that a user experience. Translate the method into the user's goal. A `deposit(uint256)` function needs information about the token, the amount unit, any prior approval, the recipient or account credited, and the outcome when it reverts. If the contract has a `withdraw` function, find out whether it requires a separate claim, has a time condition, or sends a different asset than the one deposited.

Test against the actual deployment on the required network and against a local or mocked path where practical. If the public RPC is unreliable, say so and include a reproducible alternative. A reviewer should not need to infer whether a failure is in your UI, the RPC provider, the wallet, or the testnet contract.

## Finish the Assignment Like a Handoff

Before submitting, read the prompt once more and compare every requirement against the repository. Remove features that are incomplete, dead code, copied template screens, and secrets. Run the formatter, type checker, compiler, and full test command from a clean terminal. Open the app from the documented setup steps. Read the README as if you did not write it.

Your README should cover the purpose, prerequisites, install and run commands, test command, design choices, assumptions, and known limits. Mention the compiler version, chain, deployed addresses, and environment variables where relevant. If you chose a simple reward formula, a pull-payment refund, or a limited set of UI states, say why. Honest limits show judgment. Hidden limits become bugs for the reviewer to find.

Submit on time. If the task grew beyond the time available, deliver the core requirement in a clean state and list the next work you would do. A take-home is a chance to show how you make trade-offs under constraints. Correctness, tests, and clear communication beat an overbuilt project that cannot be run.
