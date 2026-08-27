---
title: How to Prepare for a Technical Interview
image: 'https://picsum.photos/seed/technical-interview/1200/630'
data-ai-hint: technical interview coding whiteboard
description: >-
  A practical guide to preparing for technical interviews in 2026, with specific
  steps for coding rounds, system design, take-home projects, live Solidity challenges,
  security checks, and behavioral questions.
category: Career Guides
publishedDate: '2026-03-11'
lastUpdated: "2026-08-28"
---

## What a technical interview actually tests

A technical interview checks whether you can do the work, not whether you can describe it. In 2026 most companies use a sequence of filters: resume screen, automated coding check, then a live round where you write, explain, and debug code with an engineer watching. For Web3 roles the same sequence applies, but the live round adds chain-specific checks: EVM behavior, gas cost, and security.

Expect four parts across most pipelines: coding and data structures, system or contract design, a deep dive on your past projects, and behavioral questions. Mid-level and senior roles add design. You need to pass each part separately. Strength in one does not cancel a weak score in another.

## Who this guide is for

This guide is for software engineers preparing for a general technical interview and for Web3 developers preparing for Solidity or EVM interviews.

It fits you if you:

- Write code weekly in JavaScript, TypeScript, Python, or Solidity and can ship a small project end to end
- Have 4 to 8 weeks to prepare, with 8 to 12 hours per week
- Want a checklist you can verify against official docs, not a list of slogans

It is not for you if you are looking for trick questions to memorize the night before. Interviewers in 2026 often let you use an IDE and docs. They score how you reason, test, and handle trade-offs.

## How the process works in 2026

Most teams follow the same five stages, with different weight by company size.

1. **Resume and portfolio screen.** Automated parsing plus a recruiter scan. They look for exact tool names, deployed links, and test coverage. A GitHub repo with a verified contract on Sepolia and a README that shows how to run tests beats a longer resume with no links.

2. **Automated coding assessment.** HackerRank, Codility, or CodeSignal. You get 60 to 90 minutes for 2 to 3 problems. No interviewer. This is pass or fail. The problems test patterns, not trivia.

3. **Take-home or live coding.** Startups and mid-size Web3 teams lean to take-homes. About 47 percent of hiring managers in a 2025 LinkedIn survey said they prefer take-homes over live coding for mid-level hires. Large tech companies lean to live coding. Take-homes test code quality and testing over 2 to 7 days. Live rounds test thinking aloud, debugging, and collaboration in 45 to 90 minutes.

4. **System design or contract architecture.** This used to start at senior level. It now starts at mid-level, roughly L4 on Google's ladder. For Web3 this means designing a token system, staking vault, or upgrade path across on-chain and off-chain parts.

5. **Behavioral.** Expect 30 to 40 percent of interview time to be behavioral, even in technical loops. Hiring managers use structured questions like "tell me about a time you disagreed on a technical decision" and score them with STAR: Situation, Task, Action, Result.

Knowing the stage helps you prepare the right artifact for each: a clean resume for stage 1, pattern fluency for stage 2, a tested repo for stage 3, a whiteboard framework for stage 4, and short stories with numbers for stage 5.

## What to master for the coding round

You do not need 500 problems. You need reliable recall of about 12 patterns and the ability to apply them in code that compiles and is tested.

Priority order that matches most interview banks:

- Arrays and hashing: two pointers, sliding window, prefix sums
- Strings: anagrams, substring search
- Stacks and queues
- Linked lists
- Binary trees and binary search trees
- Binary search on answer space and rotated arrays
- Graphs: BFS, DFS, topological sort
- Heaps: top-K and merge
- Backtracking: permutations, combinations, subsets
- Dynamic programming: 1D, 2D, knapsack and string DP
- Greedy and intervals
- Bit manipulation basics

Practice plan that works:

- Do 75 to 120 curated problems, not random grinding. Use a pattern-based list like NeetCode 150 and filter to your gaps.
- For each problem, write the brute force first, state its time and space, then optimize once. Interviewers score the trade-off discussion.
- Time yourself at 35 minutes per problem. In a real round you have about 20 minutes to code after clarifying.
- Always write a test or a brute-force checker for the solution before you call it done.

Tooling: LeetCode remains the standard practice platform. Run mock interviews on Pramp or with a peer. Record yourself explaining the approach in under 2 minutes. If you cannot explain it, you cannot whiteboard it.

## What to master for a Solidity technical interview

If your loop includes a Solidity role, add EVM and security on top of the general coding base. Interviewers treat security as the primary filter.

**1. Solidity fundamentals.** Be able to write and explain from memory:

- Data locations: `storage`, `memory`, and `calldata`, and when each copies. `calldata` is read-only and cheapest for external inputs. `storage` persists and costs the most.
- Visibility: `public`, `private`, `internal`, `external`. Use `external` when the function is only called from outside the contract to save gas on copying.
- Function types: `view`, `pure`, and `payable`. A `view` reads state, a `pure` reads no state, a `payable` can receive ETH.
- Error handling: `require`, `revert`, `assert`, and custom errors. Custom errors introduced in Solidity 0.8.4 cost less gas than string messages because they encode a selector, not a string.
- Inheritance and libraries. Understand C3 linearization for base contract order.

**2. The EVM.** The EVM is a stack machine that each node runs. Know:

- The stack, memory which is cleared after the call, and storage which persists. A cold storage write costs 20,000 gas, a warm write about 2,900, a cold read about 2,100, a warm read about 100. These numbers come from the EVM fee schedule and explain why minimizing state writes dominates optimization.
- Opcodes you will be asked about: `SSTORE`, `SLOAD`, `ADD`, `MSTORE`, `CALLDATALOAD`. Transient storage with `TSTORE` and `TLOAD` from EIP-1153 costs 100 gas and clears after the transaction. It shipped with the Cancun upgrade in March 2024 and requires Solidity 0.8.24 or later and `evmVersion: "cancun"`.
- Call types: `call`, `delegatecall`, and `staticcall`. With `call`, `msg.sender` is the caller. With `delegatecall`, code runs in the caller's storage, so `msg.sender` stays the original sender, which is how proxies work. Never use `tx.origin` for authorization. `tx.origin` is the original external account, not the immediate caller, so a phishing contract can bypass it.

**3. Security, the most important filter.** Follow the Checks-Effects-Interactions pattern from the Solidity docs at docs.soliditylang.org. The pattern is: check inputs first, update your state second, interact with other contracts last.

A vulnerable withdraw sends before it updates:

```solidity
// Do not use - sends before state update
function withdraw() public {
    uint amount = balances[msg.sender];
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);
    balances[msg.sender] = 0;
}
```

The fixed version from the official security considerations:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Fund {
    mapping(address => uint) private shares;

    function withdraw() public {
        uint share = shares[msg.sender];
        shares[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: share}("");
        require(success);
    }
}
```

Other security topics you will be asked to whiteboard:

- Reentrancy, including cross-function and read-only reentrancy. Know `nonReentrant` from OpenZeppelin and why it pairs with the pattern above.
- Integer overflow. Since Solidity 0.8.0 the compiler checks arithmetic by default, so classic overflow is rarer. Still know when `unchecked` is safe and why it saves gas.
- Access control. Use `onlyOwner` or role-based modifiers from OpenZeppelin AccessControl, and test that each sensitive function rejects non-owners.
- Oracle manipulation and flash loans. Do not trust spot prices from a single pool.

Tools to name and use: Slither for static analysis, Echidna for fuzzing, and Foundry's built-in fuzz with `testFuzz_` functions.

**4. Gas optimization you can defend.**

- Pack storage. Variables that are declared next to each other and fit in 32 bytes share a slot. Reordering a struct from `uint256, uint8, uint256` to `uint256, uint256, uint8` can waste a slot. Packing can save about 20,000 gas per slot on deployment.
- Cache storage reads in memory when you use a value more than once in a function.
- Use `calldata` for external inputs, `constant` and `immutable` for fixed values, and short custom errors.
- Prefer events over storage for logs. An event costs about 375 gas plus 8 per byte, far less than persistent storage.

**5. Standards and upgrade patterns.**

- Tokens: ERC-20, ERC-721, ERC-1155, and ERC-4626 for vaults.
- Upgrades: Transparent proxy and UUPS. Know that Transparent routes admin calls through the proxy, while UUPS puts upgrade logic in the implementation. State layout and storage collisions are the risk in both.

## The live coding challenge

This round induces stress because you code while you talk. Interviewers score process over perfect syntax.

How to run it:

- Start by restating the problem and giving examples, including an edge case. Ask about input limits and whether ETH, tokens, or reentrancy matter.
- Write the function signature and state variables first. Add `require` checks early.
- Talk through the approach before you type. Say "I will keep balances in a mapping, update before the external call, and emit an event" rather than coding silently.
- Write a test first if the interviewer allows it. Say "should I sketch the test for deposit and withdraw with a reentrancy attempt". That signals a mature workflow.
- When you call another contract, state the risk aloud: "I am zeroing the balance before the call to follow Checks-Effects-Interactions, and I would add a reentrancy guard for a production vault."
- Use the compiler errors. Fix the first error fully before you chase the next one.

Example prompt you can practice with peers: "Write a staking vault where users deposit an ERC-20, earn rewards at a fixed rate, and can withdraw. Include deposit, withdraw, and claim, and make it testable." Time box to 45 minutes. A strong answer has state updates before transfers, access control, events, and at least one fuzz test for reward math.

## Take-home assignments: what reviewers actually check

Take-homes mimic real work: a small staking contract, an on-chain auction for an NFT, or a wallet dashboard that reads balances with Viem or Ethers.js and handles connection states.

Reviewers usually check in this order:

1. **Did you follow instructions.** Scope, network, and submission format matter more than extra features.
2. **Tests and docs.** A README that shows `forge test` or `npm test`, how to run with `anvil` or a local node, and addresses of deployed contracts on Sepolia. Include edge cases and a negative test that would have caught a reentrancy bug.
3. **Security and code quality.** Small tested contracts beat a large untested repo. Import OpenZeppelin Contracts v5 instead of copying token code. Verify source on Etherscan.
4. **Trade-offs written down.** Note what you left out and why. For example: "used `pull` payments over `push` to avoid reentrancy, kept `runs: 200` on the optimizer for deployment size."

Avoid over-engineering. Deliver correct, tested, and documented code that meets the brief. Note any known limitation you would fix with more time.

## System design and contract architecture

For senior roles you will design a simple DeFi protocol or dApp end to end.

A framework that maps to most prompts:

1. Clarify requirements and constraints. Throughput, trust model, upgrade path, and who pays gas.
2. Sketch the data model. Which state lives on chain, what goes to IPFS or a subgraph, where you need an oracle.
3. Pick contracts and off-chain services. For example: ERC-20 plus vault plus rewards distributor on chain, a Next.js frontend with Wagmi and Viem, and a subgraph via The Graph for history.
4. Handle failure. What happens if an oracle stalls, a call reverts, or an upgrade is needed. Pin the proxy choice and the storage layout.
5. Size the costs. Estimate storage writes and external calls. Explain why batching or using `transient` storage for a lock saves gas at 100 per access versus 20,000 cold.

Practice with three Web3 prompts: a fee-splitting vault, an English auction, and a price oracle consumer that handles stale data.

## Behavioral: answer with STAR and numbers

Behavioral questions predict how you work when things get hard. Use STAR without announcing it.

- Situation: one sentence of context
- Task: your specific responsibility
- Action: what you personally did, with a decision point
- Result: a measurable outcome or a lesson you now apply

Example prompt: "Tell me about a time you disagreed with a teammate on a technical choice."

Strong shape: "We disagreed on whether to use `push` or `pull` payments for a rewards vault. My task was to ship the safest version before audit. I wrote a short doc with gas and security trade-offs, built a minimal proof with checks-effects-interactions, and ran Slither. We shipped `pull`, audit found no reentrancy issue, and we kept that pattern for later vaults."

Prepare five stories that cover: a bug you caught before deploy, a time you simplified a design, a conflict you resolved, a deadline you met with a clear cut in scope, and a failure you learned from. Keep each to about 90 seconds and end with a number when you can: latency cut by 30 percent, gas down by 12,000 per call, build time down from 9 minutes to 6.

## Pros and cons to weigh

**Pros of a live coding round:**

- Shows how you think and collaborate under time pressure, which predicts close collaboration on the job
- Harder to delegate to tools without being noticed

**Cons:**

- Rewards speed and recall, which favors recent graduates over experienced builders
- Small syntax slips can be over-scored if the rubric is weak

**Pros of a take-home:**

- Shows real craftsmanship: tests, docs, and product thinking
- Mirrors how you will actually work

**Cons:**

- Takes 6 to 12 hours of unpaid time across a pipeline, and is easier to delegate to AI, so reviewers now look harder at your explanation round

If you are applying to both formats at once, keep two prep tracks: daily timed coding for live rounds, and a polished repo template for take-homes with tests, lint, and deploy scripts ready to copy.

## How to prepare: an 8-week plan you can follow

Adjust the hours, but keep the order.

**Weeks 1 to 2: fundamentals and tooling.** Re-read the Solidity docs security considerations and the Ethereum docs on the EVM, accounts, and gas. Set up Foundry (`forge init`, `forge test`, `anvil`) and a wallet for Sepolia, Chain ID 11155111. Practice storage packing and the withdraw pattern above until you can write it without looking.

**Weeks 3 to 4: coding fluency.** Do 4 problems per week from the priority list, timed. For each, write the trade-off note and a simple test. Start one take-home template: an ERC-20 with OpenZeppelin, a staking vault, a Next.js frontend with Viem, and a README. Deploy to Sepolia and verify.

**Weeks 5 to 6: security and design.** Work through Ethernaut or Damn Vulnerable DeFi for one level per session. Run Slither on your vault. Mock a system design session: design a simple lending pool with liquidation, or an NFT auction with time logic, and write the data flow and failure modes on one page.

**Weeks 7 to 8: interview simulation.** Do two live mocks per week where you talk while you code. Record and review for filler words and silent typing gaps. Refine five STAR stories to 90 seconds each. For each story, write the metric you will quote.

Daily habit that helps most candidates: 35 minutes of problem solving, 15 minutes of writing the explanation, and one small test or doc improvement to your template repo.

## Before, during, and after the interview

**Before.** Research the company's chain, contracts, and recent deploys. Read the job description line by line and map each requirement to a file or commit in your portfolio. Test your setup for virtual rounds: camera, mic, shared editor, and a clean repo you can open quickly. Prepare three good questions, such as "what does a typical review cycle look like for a contract before it hits testnet" and "how do you measure success for this role in the first 90 days."

**During.** Dress to the norm the recruiter states, be explicit about your assumptions, and state trade-offs. If you do not know an answer, say so plainly and show how you would find it: "I have not used that proxy variant, here is how I would check the OpenZeppelin docs and test for storage collision." Interviewers score honesty and debugging higher than a forced answer.

**After.** Send a short thank-you within 24 hours. Restate one specific topic you discussed and your next step if any. If the timeline passes, send a brief follow-up that references the stage you are in.

## Common red flags to avoid

- You cannot explain `storage` versus `memory`, or you use `tx.origin` for access control. Either is a quick fail for a Solidity role.
- Code that sends value before updating state, or that copies strings in errors instead of using custom errors without a reason.
- A GitHub with large unverified contracts and no tests. Reviewers read tests first.
- Claiming every project went well. Interviewers expect at least one clear lesson from a failure.
- Poor communication: long silent typing, or jumping to code before clarifying the problem.

## FAQ

**How many LeetCode problems should I do?**
Aim for 75 to 120 well-chosen problems across the 12 patterns, with notes on trade-offs. That range is enough to cover most onsite banks if you can also explain each solution without running it.

**How long does a real technical interview take?**
Most pipelines run 45 to 90 minutes per live round, plus a 2 to 7 day async window if there is a take-home. Expect 3 to 4 rounds after the initial screen.

**Do I need a degree in cryptography?**
No. Know hash functions, public and private keys, and how a signature proves ownership. Deep topics like zero-knowledge proofs are a specialization after you can ship and test basic contracts.

**Solidity or Rust first?**
Pick Solidity for the largest job market. Every EVM chain uses it, and most new apps in 2026 deploy to a Layer 2 EVM rollup first. Add Rust after you can ship tested Solidity projects, especially if you target Solana or chain infrastructure.

**Hardhat or Foundry for interview prep?**
Start with Foundry. Tests are in Solidity, fuzz is built in, and it is fast. Keep Hardhat when you need its plugin ecosystem for deployments. Hardhat 3 runs Foundry-compatible Solidity tests, so many teams use both.

**Which testnet should I use?**
Sepolia. Chain ID 11155111. It is the Ethereum general application testnet with broad faucet and tooling support. Hoodi is for validator testing, not general dApps. Holesky was shut down in September 2025.

**What if I get stuck on a question?**
Pause and state what you know. Ask for a hint. It is better to say "I do not have direct experience with that opcode, here is how I would approach it and test it" than to invent an answer. Interviewers want to see debugging, not bluffing.

## Further reading

Check the primary sources behind the claims in this guide:

- Solidity docs at docs.soliditylang.org: language reference, security considerations, and Checks-Effects-Interactions pattern
- Ethereum docs at ethereum.org: proof of stake, EVM, accounts, transactions, and gas
- Foundry Book at book.getfoundry.sh: forge, cast, anvil, and fuzz testing
- Hardhat at hardhat.org: Ignition deployments and Solidity test runner in Hardhat 3
- OpenZeppelin docs at docs.openzeppelin.com: ERC-20, ERC-721, access control, and ReentrancyGuard
- The Graph docs at thegraph.com: subgraphs and GraphQL indexing for dApps
- Scaffold-ETH 2 at docs.scaffoldeth.io: Next.js plus Wagmi plus Viem starter

If you can explain each choice in your repo without notes, handle a live edit that adds access control or a reentrancy guard, and walk through a STAR story with a number, you are ready for most technical interviews in 2026.
