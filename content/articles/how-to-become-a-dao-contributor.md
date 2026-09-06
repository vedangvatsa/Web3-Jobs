---
title: How to Contribute to a DAO and Get Paid
image: /images/anton-maksimov-5642-su-MSzGw5V0ui8-unsplash.jpg
data-ai-hint: dao crypto tokens
description: >-
  A practical guide to getting paid for DAO work. Learn what DAO contributions
  are, who this path fits, how bounties and grants are approved and paid, and
  the exact steps to find work and earn in stablecoins or tokens.
category: Career Guides
publishedDate: '2026-03-11'
lastUpdated: "2026-09-06"
---
A [DAO](/what-is-a-dao) is an organization whose rules and treasury live in [smart contracts](/what-are-smart-contracts) on a public [blockchain](/what-is-a-blockchain). Members propose and vote on how to spend funds, and the code executes the result. Contributing to a DAO and getting paid means doing useful work for that organization - writing, design, community support, analytics, development, or governance - and receiving compensation from its on-chain treasury, usually in stablecoins like USDC or in the DAO's governance [token](/what-is-a-token).

This guide explains who this work fits, how the payment mechanics actually work, the trade-offs, and the specific steps to go from newcomer to paid contributor without hype.

## What is it

Contributing to a DAO and getting paid means doing useful work for a member-owned organization and receiving compensation from its on-chain treasury. In a traditional company you apply for a posted job and a manager assigns tasks. In a DAO you show work in public and earn trust, then you are assigned or approved for paid tasks.

Payment does not come from a company bank account. It comes from a treasury contract. That treasury is most often a Safe multisig wallet on Ethereum or an L2, where a threshold of signers must approve a transaction, or a governance contract that executes only after a vote passes. Safe documents its deployment on 18+ EVM chains as of 2026 and threshold-based authorization, and it is the standard for DAOs holding more than $1M. Optimism, Aave, and Lido all custody treasuries through Safe.

There are three common payment rails:

- **Bounties.**One-off tasks with a fixed price. Example: write a tutorial for $300 in USDC, fix a frontend bug for $800, design a banner for $150.
-**Grants.**Larger scoped work approved by governance vote. Example: produce three months of risk research for $8,000. You post a forum proposal, it goes to a Snapshot signal vote, then to an on-chain vote if required, then to payout via Safe.
-**Stipends and ongoing roles.**Working groups or guilds (marketing, treasury, community) pay monthly stipends for steady work. Full-time roles are usually hired through a foundation or service provider that the DAO funds, for example Steakhouse Financial for Sky or the Uniswap Foundation for Uniswap.

You do not need to be a developer. DAOs pay for non-technical work that moves the protocol forward, but you do need a wallet, the ability to receive on-chain payments, and a public record of what you delivered.

## Who it is for and who it is not for**Good fit:**- Writers, researchers, and analysts who can document protocols, summarize governance calls, or build Dune dashboards that make treasury activity readable.
- Designers and video editors who can produce educational content and social assets for a single protocol you follow closely.
- Community operators who can answer support questions, moderate Discord, and onboard new members consistently.
- Developers and data analysts who can fix issues tracked in GitHub, build small tooling, or review governance proposals for risks.
- People who can work async, show work in public, and handle variable pay that may include volatile tokens.**Poor fit:**- People who need a fixed salary from day one, employer benefits, or a manager who assigns a clear backlog. Early DAO income is task-based and irregular.
- People who cannot tolerate public work. Your Discord posts, forum comments, and completed bounties are your resume. Private credentials count less here.
- People who need fast decisions on every spend. Even small treasury moves can take 14 to 30 days when they require forum discussion, a Snapshot check, an on-chain vote, and a timelock.
- People who cannot manage self-custody. You will receive USDC, ETH, or governance tokens to a wallet you control and you are responsible for gas, bridges, and taxes.

## How it works

### How DAOs approve spending

Most large DAOs use the same four-stage flow. Uniswap documents it clearly and it is representative of others:

1.**Forum discussion.**A draft is posted on Discourse or Commonwealth. Uniswap uses gov.uniswap.org, Sky uses forum.sky.money, Aave uses governance.aave.com. This runs 5 to 14 days. Uniswap requires at least 7 days as Request for Comment (RFC).
2.**Temperature check on Snapshot.**Token holders sign a gasless vote. Snapshot is off-chain and gasless by design, as described in its docs at docs.snapshot.box. It verifies signed messages at a snapshot block, so live balances differ from tallies. Uniswap requires 10M UNI voting for to advance. Voting lasts 5 days.
3.**Binding on-chain vote.**If the check passes, the proposal moves to the governance contract. Many DAOs use Compound Bravo style contracts. Voting lasts 3 to 7 days. Uniswap requires 1M UNI delegated to submit and 40M UNI for to pass. After that comes a 2-day delay before voting starts and a 2-day timelock after it passes before anyone can execute.
4.**Execution via Safe or timelock.**Passed proposals are queued. A Safe multisig or timelock contract then executes the transfer. You can verify the payout on Etherscan and on the DAO's Dune dashboard.

For small bounties, many DAOs skip the full vote. A working group with a quarterly budget approved by the DAO pays from its own Safe within a policy. That is faster but requires trust in the signers.

### Where paid work is posted

-**Dework.**The most used task board for DAOs. Find it at app.dework.xyz/bounties. DAOs create tasks, contributors apply with their wallet profile, and payment is done via Gnosis Safe batch transactions in the DAO's chosen token. Dework states support for 20+ chains, wallet-only onboarding via MetaMask, Safe, WalletConnect, Phantom, no email or KYC, and built-in Discord and GitHub sync. See dework.xyz for current details.
-**Layer3.**Task and quest platform at layer3.xyz for ecosystem bounties that often pay in tokens, NFTs, or XP. Good for learning a protocol while earning a small amount.
-**Discord and Notion.**Most DAOs run a #bounties or #contributors channel and a public Notion board. BanklessDAO and Gitcoin have long used this pattern.
-**Coordinape.**Used for contributor circles where peers allocate rewards after a period of work.
-**Governance forums.**A forum post that proposes a solution to a stated problem is often the best way to create a paid grant, more so than waiting for a listed bounty.

Tally was a common governance dashboard for on-chain proposals at vote.uniswapfoundation.org and tally.xyz, but it wound down operations in March 2026 per CoinDesk and The Block reporting, with the app continuing under Scopelift as of April 2026. Check Uniswap's governance docs for the current interface.

### How membership is tracked

You do not need to buy a token to help, but voting and some paid roles do require it:

-**Token-based.**You buy or earn the governance token and can vote. Used by Uniswap (UNI), Sky (SKY, converted from MKR at 1:24,000 in Aug 2024), Aave (AAVE).
-**Share-based.**You submit a join proposal and receive shares. This is the Moloch model used on DAOhaus. If you leave, you can ragequit with your pro-rata share of the treasury.
-**Reputation-based.**Non-transferable points earned by contributions, not purchase. Used where buying influence would be harmful.

All three can use Snapshot for gasless signaling and Safe for custody. Your wallet address is your identity in these systems, so keep one address for DAO work and keep its history clean.

### How treasuries are funded and tracked

DAOs fund treasuries from initial allocations, protocol fees routed to the collector, and yield on idle assets. As of Q1 2026, trackers vary by method: DeepDAO's site shows a static snapshot as of Nov 24 2025 with $13.6B total and states "DeepDAO is not currently updating data. Do not use it for research," while its Q1 2026 figures cited via eco.com put collective DAO treasuries over $20B with large concentration in the top DAOs. CoinLaw's March 2026 review of DeepDAO data puts liquid assets at $21.4B and total treasury value at $24.5B, with the top five DAOs holding over 60 percent of assets.

By example, figures cited for Q1 2026 on-chain treasuries include Uniswap around $4.8B, Sky around $3.9B, Optimism around $2.1B, Arbitrum around $1.7B, and Lido around $1.4B, per eco.com and NeuralWired citing DeepDAO. Expect 60 to 90 percent of most treasuries to be in the native token, so only the stablecoin and ETH slice is readily spendable without moving the price and requiring a vote.

Check a DAO's finances directly before you commit time. Open its Safe address on Etherscan, its Dune dashboard for stablecoin runway, and its Snapshot space for recent voter turnout.

## Pros and cons

This work has real benefits and real limits. Weigh both before you start.**What this path does well:**-**Open entry.**You can contribute without an interview by posting work that is useful. Forum summaries, support answers, and small fixes are often valued more than a resume.
-**Global and remote.**DAOs pay to a wallet on any chain. No visa or location check. Reviews are based on output visible to anyone.
-**Direct tie to protocol success.**If you are paid partly in governance tokens and the protocol grows, that allocation can appreciate. Many grants include a token component for that reason.
-**Low setup cost to start a DAO or working group.**As of mid-2026, launching on Snapshot is free and gasless, on DAOhaus or Aragon is often $30 to $200 in gas on an L2 or mainnet, and on Realms on Solana costs cents, per DAOTimes platform comparison. Custom Governor contracts cost $20,000 to $100,000+ and take months.**Where it struggles:**-**Irregular pay and token volatility.**Bounty income varies month to month. If you are paid in a DAO token, that token can fall 50 to 90 percent between assignment and payout. Consider converting a portion to stablecoins.
-**Voter apathy and concentration.**Typical participation is 5 to 15 percent of supply, and research cited by CoinLaw and Frontiers notes less than 1 percent of holders can control 90 percent of voting power in major DAOs. In 17 of 23 major DAOs reviewed by OpenZeppelin in 2024, the top 10 delegates together held enough power to pass proposals alone. Your thoughtful forum post may matter more than your token weight.
-**Slow or inconsistent process.**A full governance cycle is 14 to 30 days. Bounties within a working group are faster, but dispute resolution is per DAO, not platform arbitrated. Dework itself notes payouts depend on the DAO's governance, not on the platform.
-**Security and reversibility risk.**On-chain votes and transfers are public and hard to undo. Bugs can be costly. The DAO in 2016 lost about 3.6M ETH to a reentrancy bug, which led to the Ethereum hard fork that created Ethereum Classic. Modern DAOs use audits, bug bounties, and timelocks to reduce this, but risk remains.
-**Legal and tax ambiguity.**Wyoming recognized DAO LLCs on July 1 2021 under SF0038, but only a handful of states have similar statutes. Most large DAOs use a foundation wrapper to sign contracts and handle taxes. You are responsible for reporting income in your jurisdiction, and foundation vs direct DAO payment changes the paperwork.

## How to get started

### Pick one or two DAOs you will actually use

Do not join ten Discords. Choose by interest and by treasury health.

-**By interest:**If you follow DeFi, study governance forums for Uniswap, Sky, Aave, Curve, or Lido. If you like public goods, look at Gitcoin and ENS. If you like community and media, look at BanklessDAO and Friends with Benefits. For investment clubs, study FlamingoDAO and MetaCartel.
-**By health:**On DeepDAO or Tally Explore (now under Scopelift), check voters and proposal makers, treasury composition (native token vs stablecoins and ETH), and recent proposal activity. A treasury that is 85 percent native token has less spendable runway than one with 12 to 24 months of stablecoin runway. As noted above, treat DeepDAO's current site as a static snapshot and cross-check with Dune and the Safe address.

Write down why you chose each DAO and what you want to learn there. That focus shows in your contributions.

### Lurk, listen, and learn for two weeks

After joining Discord, do not pitch. Observe.

- Read the welcome channel, docs, and the last 20 forum posts. Note how proposals move from forum to Snapshot to on-chain, and what a passing proposal looks like.
- Attend two weekly community calls and take notes. Listen for active working groups and for repeated questions from newcomers.
- Map who the delegates and working group leads are on Agora, Snapshot, or the DAO's forum. If the top 10 delegates hold a clear majority, expect delegated governance in practice.

By the end of this period you should be able to explain the DAO's last three votes, who proposed them, what the quorum was, and whether execution matched the description.

### Make a first contribution that needs no approval

Your first proof of work should be small, useful, and completable in a few hours.

-**The scribe.**Publish a clear summary of a community call in Discord and on the forum. Include timestamps, decisions, and links to proposals mentioned. Core contributors often lack time for this, so it fills a real gap.
-**The helper.**Answer five newcomer questions in #general or #support with links to docs, not just opinions. Track which docs were missing or confusing and note that.
-**The analyst.**Post a short, data-backed comment on an active proposal. Reference prior votes, Dune data, or specific forum replies. Avoid voting without rationale. Show your reasoning.

Post each contribution with your wallet-linked profile and keep a simple portfolio doc: link, date, outcome, feedback received.

### Take on a paid bounty

When you have two or three visible contributions, apply for a first bounty.

-**Where to find them:**Check the DAO's #bounties channel and its Dework board. Browse app.dework.xyz/bounties and filter by chain, token, and skill. Watch for boards that look inactive despite open listings - check last payout date and contributor counts.
-**How to apply:**Link your prior work, state your deliverable, timeline, and price in writing, and confirm the payout token. Ask: will this be paid in USDC or the native token, on which chain, and via which Safe? Get confirmation in the task thread before you start.
-**How to deliver:**Treat the first bounty as a test. Ship on time, include source files, and post a short summary of what changed and how to verify it. Request a review in the thread and keep the feedback.

Third-party commentary compiled in 2026 puts typical small DAO bounties at $50 to $500 and substantive dev bounties at $200 to $2,000, with active contributors stitching together $1,000 to $3,000 per month across multiple DAOs. These are estimates from commentary, not platform guarantees. Your early goal is reputation, not maximum pay.

### Move to grants and working groups

Consistent bounties build trust. Next steps are larger scoped work.

-**Join a guild.**Many DAOs have semi-formal groups for marketing, treasury, or community. They often receive a quarterly budget via governance and pay stipends from their own Safe. Attend their calls, ask where help is needed, and reference your completed bounties.
-**Write a grant proposal.**If you see a problem worth a few months of work, draft a forum post with scope, milestones, cost, and success metrics. Example structure: problem statement, proposed solution, three milestones with dates, budget in stablecoins, and how to verify completion on-chain or via Dune. Post as RFC, gather feedback for at least 7 days, then move to Snapshot if the community asks for a signal vote.
-**Build a delegation or analyst track if you enjoy governance.**Delegate programs exist in ENS, Optimism, and Sky. Publish a delegate platform that states how you will vote and share reasoning after each vote. On-chain analysis with Dune or Tally helps you assess participation, delegation networks, and quorum health.

Avoid asking for full-time early. Show three to five completed paid tasks first. Hiring managers in DAOs check public work, not resumes, and they often fund a short paid trial for important roles.

### What good bounties and proposals look like

Before you accept work, verify scope in writing. A good bounty states deliverable, format, deadline, reviewer, payout token and chain, and gas handling. Example: "Deliver a 1,200-word tutorial with screenshots, via forum post and Markdown file in GitHub, by May 10, reviewed by @lead, paid 400 USDC on Base via Safe batch - gas not deducted." If any of those fields are missing, ask for them in the thread.

A good grant proposal states the same plus milestones and clawback. If the DAO uses a timelock, your payout will arrive after the 2 to 7 day delay. Plan for that in your schedule.

## Frequently asked questions**Do I need to hold a token to contribute?**No for most bounties and community help. Yes if you want to vote or propose on-chain. In token-based DAOs you need the governance token or a delegation to you. Snapshot votes are gasless but still weighted by your holdings at the snapshot block. In share-based DAOs on DAOhaus you need approved shares. In reputation DAOs you earn voting power by contributions.**How am I paid - crypto only or fiat?**Most DAOs pay in USDC, DAI, ETH, or their native token to your wallet via Safe. Some larger DAOs and foundations can pay in fiat via payroll services, but crypto is the norm. You need a wallet like MetaMask or Rabby and a small amount of ETH for gas on Ethereum or cents on an L2 or Solana. If you are a US person or in another jurisdiction with DAO-related taxes, keep records of each payout's fair value at receipt.**What if I have no Web3 experience?**Start with basics: create a wallet, learn to sign a Snapshot vote, and send a small test transaction. Then join a DAO with strong onboarding, such as BanklessDAO or Developer DAO, and do scribe and helper work first. Those tasks teach you the governance cycle while being useful.**Are DAO roles full-time?**Most start as part-time bounties alongside other work. Full-time roles exist but are usually funded after you have a track record. Many contributors stay part-time across two or three DAOs. The more useful question is not hours but whether the DAO has stablecoin runway for 12 to 24 months and a clear path to revenue beyond its native token.**How do I avoid scams?**Never pay to join a DAO or to receive a job. Verify the treasury on-chain via its Safe address and Dune dashboard, check that recent proposals executed as described, and confirm that bounties are posted from the DAO's verified Dework workspace or Discord, not via DM. Stay with well-known DAOs first and cross-check forum history.**What is the difference between Snapshot and an on-chain vote?**Snapshot votes are signed messages verified off-chain at a specific block. They cost no gas and signal sentiment, but they do not move funds by themselves. On-chain votes are transactions that, if they pass quorum and majority and clear the timelock, execute automatically. DAOs often use Snapshot first to test support, then an on-chain vote for binding treasury moves.**Can a DAO's treasury disappear?**
Not silently. Treasury moves are public. The risks are concentration in the native token, which can fall sharply; mispriced bounties or grants; and smart contract bugs or governance attacks. Check holder concentration, stablecoin allocation, audit history, and whether the DAO uses a timelock and multisig threshold that fits its size.

## Verifiable Primary Sources & References

1. [Ethereum EIP-721 Non-Fungible Token Standard Specification](https://eips.ethereum.org/EIPS/eip-721)
2. [Ethereum Official Yellow Paper & Protocol Specification](https://ethereum.github.io/yellowpaper/paper.pdf)
3. [Ethereum Consensus Specs & Proof of Stake Architecture](https://github.com/ethereum/consensus-specs)
4. [Solidity Compiler Official Documentation & Language Spec](https://docs.soliditylang.org/)
5. [OpenZeppelin Smart Contract Standard Libraries & Security Audits](https://docs.openzeppelin.com/)
6. [Ethers.js Complete Web3 Library Documentation](https://docs.ethers.org/)
7. [Uniswap v3 Core Architecture Protocol Whitepaper](https://uniswap.org/whitepaper-v3.pdf)
8. [Aave v3 Technical Protocol Architecture Documentation](https://docs.aave.com/developers/)
9. [MakerDAO Technical Documentation & Maker Protocol Specs](https://docs.makerdao.com/)
10. [Curve Finance Automated Market Maker Specification](https://curve.fi/files/stableswap-paper.pdf)
