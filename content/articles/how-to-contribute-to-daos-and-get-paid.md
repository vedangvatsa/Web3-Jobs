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

Contributing to a DAO and getting paid means doing useful work for a member-owned organization and receiving compensation from its on-chain treasury. In a traditional company you apply for a posted job and a manager assigns tasks. In a DAO you show work in public and earn trust, then you are approved for paid tasks.

Payment does not come from a company bank account. It comes from a treasury contract. That treasury is most often a Safe smart account on Ethereum or an L2, where a threshold of signers must approve a transaction, or a governance contract that executes only after a vote passes.

Safe documents this threshold model at docs.safe.global. A Safe stores a list of owner addresses and a threshold, and it verifies at least that many valid signatures before it executes. It supports standard ECDSA signatures, EIP-1271 contract signatures, and pre-approved hashes. As of 2026 Safe lists support for more than a dozen EVM networks including Ethereum mainnet, Polygon, Arbitrum One, Optimism, Base, BNB Chain, Avalanche C-Chain, Gnosis Chain, zkSync Era, Linea, Scroll and Celo, with the full list at docs.safe.global. The protocol secures tens of billions in aggregate and is the default treasury wallet for DAOs, foundations and on-chain teams, as described in Safe's own docs and in independent overviews such as Eco's 2026 deep dive.

There are three common payment rails:

- **Bounties.**One-off tasks with a fixed price. Example: write a tutorial for $300 in USDC, fix a frontend bug for $800, design a banner for $150.
-**Grants.**Larger scoped work approved by governance vote. Example: produce three months of risk research for $8,000. You post a forum proposal, it goes to a Snapshot signal vote, then to an on-chain vote if required, then to payout via Safe or timelock.
-**Stipends and ongoing roles.**Working groups or guilds (marketing, treasury, community) pay monthly stipends for steady work. Many full-time roles are hired through a foundation or service provider that the DAO funds, for example the Uniswap Foundation for Uniswap. Check the DAO's forum for which contributors are funded this way.

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

Most large DAOs use the same flow. Uniswap documents it clearly at developers.uniswap.org and it is representative of others:

1.**Forum discussion.**A draft is posted on Discourse or Commonwealth. Uniswap uses gov.uniswap.org, Sky uses forum.sky.money, Aave uses governance.aave.com. Uniswap's process requires at least 7 days as Request for Comment (RFC) to gather feedback before any vote. If consensus is unclear, the proposal should not advance.
2.**Temperature check on Snapshot.**Token holders sign a gasless vote. Snapshot is off-chain and gasless by design, as described at docs.snapshot.box and in its GitHub docs. Votes are signed messages verified at a snapshot block, so live balances can differ from tallies. Uniswap requires 10M UNI voting for to advance and the poll lasts 5 days.
3.**Binding on-chain vote.**If the check passes, the proposal moves to the governance contract. Many DAOs use a Compound Bravo style Governor. Uniswap's current parameters, updated after a December 2023 proposal to lower the threshold, require 1M UNI delegated to submit and 40M UNI voting for to pass. Voting follows a 2-day delay before voting starts, a 7-day voting period, and a 2-day timelock after it passes before anyone can execute. You can verify the exact quorum and threshold in the GovernorAlpha contract on GitHub (quorumVotes = 40M, proposalThreshold = 1M after the update).
4.**Execution via Safe or timelock.**Passed proposals are queued. A Safe multisig or timelock contract then executes the transfer. You can verify the payout on Etherscan and on the DAO's Dune dashboard.

For small bounties, many DAOs skip the full vote. A working group with a quarterly budget approved by the DAO pays from its own Safe within a written policy. That is faster but requires trust in the signers. Dework's own docs note that payouts depend on the DAO's governance, not on the platform.

### Where paid work is posted

-**Dework.**The most used task board for DAOs. Find it at app.dework.xyz and app.dework.xyz/bounties. DAOs create tasks, contributors apply with a wallet profile, and payment is done via Gnosis Safe batch transactions in the DAO's chosen token. Dework's docs describe wallet-based onboarding via MetaMask, Safe, WalletConnect, Phantom, no email or KYC by default, and built-in Discord and GitHub sync. The global bounty board surfaces open bounties across hundreds of DAOs.
-**Layer3.**Task and quest platform at layer3.xyz for ecosystem bounties that often pay in tokens or XP. Useful for learning a protocol while earning a small amount.
-**Discord and Notion.**Most DAOs run a #bounties or #contributors channel and a public Notion board. BanklessDAO and Gitcoin have long used this pattern.
-**Coordinape.**Used for contributor circles where peers allocate rewards after a period of work.
-**Governance forums.**A forum post that proposes a solution to a stated problem is often the best way to create a paid grant, more so than waiting for a listed bounty.

Tally was the main dashboard for on-chain proposals at tally.xyz and vote.uniswapfoundation.org. It announced it would wind down operations on March 17 2026, as covered by CoinDesk and confirmed in Tally's own shutdown post. ScopeLift agreed to take over operation of the platform on March 31 2026 and to keep it live during a transition and rebrand, with tally.xyz redirecting to a new domain. For current on-chain votes, check the DAO's governance docs. As of 2026, Uniswap and other large protocols point to Agora (vote.uniswapfoundation.org) for on-chain votes, while Snapshot remains the venue for off-chain signal votes and Realms at realms.today serves Solana DAOs.

### How membership is tracked

You do not need to buy a token to help, but voting and some paid roles do require it:

-**Token-based.**You buy or earn the governance token and can vote. Used by Uniswap (UNI), Sky (SKY, converted from MKR at 1:24,000), Aave (AAVE). MakerDAO rebranded to Sky on Aug 27 2024, with MKR upgradeable to SKY at 1:24,000 and DAI to USDS at 1:1, rolling out Sept 18 2024, as reported by The Block and documented in Sky's converter docs at 0xA1Ea1bA18E88C381C724a75F23a130420C403f9a. A delayed upgrade penalty that reduces SKY received per MKR took effect in Sept 2025.
-**Share-based.**You submit a join proposal and receive shares. This is the Moloch model used on DAOhaus. If you leave, you can ragequit with your pro-rata share of the treasury.
-**Reputation-based.**Non-transferable points earned by contributions, not purchase. Used where buying influence would be harmful, such as Colony's reputation system.

All three can use Snapshot for gasless signaling and Safe for custody. Your wallet address is your identity in these systems, so keep one address for DAO work and keep its history clean.

### How treasuries are funded and tracked

DAOs fund treasuries from initial allocations, protocol fees routed to the collector, and yield on idle assets. Do not rely on a single tracker.

DeepDAO was the largest aggregator from 2021 to late 2025. As of 2026 its site states: "DeepDAO is not currently updating data. The last update was on 11.24.25. This site is a static snapshot meant to showcase the platform's breadth. Do not use it for research, analysis, or decision-making." Its static page shows about $13.6B total treasury across tracked DAOs at that date. Because the data is frozen, treat any 2026 figures cited elsewhere that claim to be DeepDAO live data with caution and verify on-chain.

The most reliable check is direct. Open the DAO's Safe address on Etherscan or the relevant block explorer, its Dune dashboard for stablecoin runway, and its Snapshot space for recent voter turnout. Expect many treasuries to hold a large share in the native token, so only the stablecoin and ETH slice is readily spendable without moving the price. Before you commit weeks of work, confirm the DAO has 12 to 24 months of stablecoin runway for the kind of spend you are proposing.

## Pros and cons

This work has real benefits and real limits. Weigh both before you start.**What this path does well:**-**Open entry.**You can contribute without an interview by posting work that is useful. Forum summaries, support answers, and small fixes are often valued more than a resume.
-**Global and remote.**DAOs pay to a wallet on any chain. No visa or location check. Reviews are based on output visible to anyone.
-**Direct tie to protocol success.**If you are paid partly in governance tokens and the protocol grows, that allocation can appreciate. Many grants include a token component for that reason.
-**Low setup cost to start.**As of mid-2026, DAOTimes' guide to creating a DAO lists: Snapshot is free and gasless and takes about 30 minutes, Realms on Solana costs cents, DAOhaus and Aragon typically cost $30 to $200 in gas on an L2 or mainnet depending on congestion and take 1 to 2 hours, and custom Governor contracts cost $20,000 to $100,000+ and take 2 to 6 months. That makes it cheap to experiment with a community-run treasury, but audits ($15,000 to $50,000) and a legal wrapper ($250 to $25,000) are extra if you hold real funds.**Where it struggles:**-**Irregular pay and token volatility.**Bounty income varies month to month. If you are paid in a DAO token, that token can fall sharply between assignment and payout. Consider asking for a stablecoin base and converting a portion promptly.
-**Voter apathy and concentration.**Turnout is often low and power is concentrated. That is why your thoughtful forum post can matter more than your token weight, and why delegation research on Agora or Snapshot is worth doing before you align with a DAO.
-**Slow or inconsistent process.**A full governance cycle is typically 14 to 30 days including forum, Snapshot, on-chain vote and timelock. Bounties within a working group are faster, but dispute resolution is per DAO, not platform arbitrated.
-**Security and reversibility risk.**On-chain votes and transfers are public and hard to undo. Bugs can be costly. In June 2016 The DAO was exploited via a reentrancy bug in its split function. About 3.6M ETH moved to a child DAO subject to a 28-day hold. The community executed a hard fork at block 1,920,000 on July 20 2016 that moved about 12M ETH to a recovery contract. The original chain continued as Ethereum Classic. The event is documented in the Ethereum Foundation blog, in EIP-779, and in the clients' code. Modern DAOs use audits, bug bounties, and timelocks to reduce this, but risk remains.
-**Legal and tax ambiguity.**Wyoming recognized DAO LLCs on July 1 2021 under SF0038 (SEA No. 0073, Chapter 162), which supplements the Wyoming Limited Liability Company Act. The act requires the name include DAO, LAO or DAO LLC and allows management via smart contracts, with details at wyoleg.gov and sos.wyo.gov. Only a handful of states have similar statutes. Most large DAOs use a foundation wrapper to sign contracts and handle taxes. You are responsible for reporting income in your jurisdiction, and foundation vs direct DAO payment changes the paperwork.

## How to get started

### Pick one or two DAOs you will actually use

Do not join ten Discords. Choose by interest and by treasury health.

-**By interest:**If you follow DeFi, study governance forums for Uniswap, Sky, Aave, Curve, or Lido. If you like public goods, look at Gitcoin and ENS. If you like community and media, look at BanklessDAO and Friends with Benefits. For investment clubs, study FlamingoDAO and MetaCartel, noting that many investment-club platforms have left the space and teams now assemble a stack of Safe, Snapshot and a legal wrapper.
-**By health:**On DeepDAO (as a static reference), Agora, or Tally under ScopeLift, check voters and proposal makers, treasury composition (native token vs stablecoins and ETH), and recent proposal activity. A treasury that is 85 percent native token has less spendable runway than one with 12 to 24 months of stablecoin runway. Cross-check any aggregator with Dune and the Safe address itself.

Write down why you chose each DAO and what you want to learn there. That focus shows in your contributions.

### Lurk, listen, and learn for two weeks

After joining Discord, do not pitch. Observe.

- Read the welcome channel, docs, and the last 20 forum posts. Note how proposals move from forum to Snapshot to on-chain, and what a passing proposal looks like.
- Attend two weekly community calls and take notes. Listen for active working groups and for repeated questions from newcomers.
- Map who the delegates and working group leads are on Agora, Snapshot, or the DAO's forum. If a small set of delegates holds a clear majority, expect delegated governance in practice.

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
-**Build a delegation or analyst track if you enjoy governance.**Delegate programs exist in ENS, Optimism, and Sky. Publish a delegate platform that states how you will vote and share reasoning after each vote. On-chain analysis with Dune or Agora helps you assess participation, delegation networks, and quorum health.

Avoid asking for full-time early. Show three to five completed paid tasks first. Hiring managers in DAOs check public work, not resumes, and they often fund a short paid trial for important roles.

### What good bounties and proposals look like

Before you accept work, verify scope in writing. A good bounty states deliverable, format, deadline, reviewer, payout token and chain, and gas handling. Example: "Deliver a 1,200-word tutorial with screenshots, via forum post and Markdown file in GitHub, by May 10, reviewed by @lead, paid 400 USDC on Base via Safe batch - gas not deducted." If any of those fields are missing, ask for them in the thread.

A good grant proposal states the same plus milestones and clawback. If the DAO uses a timelock, your payout will arrive after the delay, typically 2 days after passage. Plan for that in your schedule.

## Frequently asked questions**Do I need to hold a token to contribute?**No for most bounties and community help. Yes if you want to vote or propose on-chain. In token-based DAOs you need the governance token or a delegation to you. Snapshot votes are gasless but still weighted by your holdings at the snapshot block. In share-based DAOs on DAOhaus you need approved shares. In reputation DAOs you earn voting power by contributions.**How am I paid - crypto only or fiat?**Most DAOs pay in USDC, DAI, ETH, or their native token to your wallet via Safe. Some larger DAOs and foundations can pay in fiat via payroll services, but crypto is the norm. You need a wallet like MetaMask or Rabby and a small amount of ETH for gas on Ethereum or cents on an L2 or Solana. If you are a US person or in another jurisdiction with DAO-related taxes, keep records of each payout's fair value at receipt.**What if I have no Web3 experience?**Start with basics: create a wallet, learn to sign a Snapshot vote, and send a small test transaction on an L2 where fees are cents. Then join a DAO with strong onboarding, such as BanklessDAO or Developer DAO, and do scribe and helper work first. Those tasks teach you the governance cycle while being useful.**Are DAO roles full-time?**Most start as part-time bounties alongside other work. Full-time roles exist but are usually funded after you have a track record. Many contributors stay part-time across two or three DAOs. The more useful question is not hours but whether the DAO has stablecoin runway for 12 to 24 months and a clear path to revenue beyond its native token.**How do I avoid scams?**Never pay to join a DAO or to receive a job. Verify the treasury on-chain via its Safe address and Dune dashboard, check that recent proposals executed as described, and confirm that bounties are posted from the DAO's verified Dework workspace or Discord, not via DM. Stay with well-known DAOs first and cross-check forum history.**What is the difference between Snapshot and an on-chain vote?**Snapshot votes are signed messages verified off-chain at a specific block. They cost no gas and signal sentiment, but they do not move funds by themselves. On-chain votes are transactions that, if they pass quorum and majority and clear the timelock, execute automatically. DAOs often use Snapshot first to test support, then an on-chain vote for binding treasury moves.**Can a DAO's treasury disappear?**
Not silently. Treasury moves are public. The risks are concentration in the native token, which can fall sharply; mispriced bounties or grants; and smart contract bugs or governance attacks. Check holder concentration, stablecoin allocation, audit history, and whether the DAO uses a timelock and multisig threshold that fits its size.

## Verifiable Primary Sources & References

1. [Ethereum EIP-712 Typed Structured Data Hashing and Signing](https://eips.ethereum.org/EIPS/eip-712)
2. [Ethereum Official Yellow Paper & Protocol Specification](https://ethereum.github.io/yellowpaper/paper.pdf)
3. [Ethereum Consensus Specs & Proof of Stake Architecture](https://github.com/ethereum/consensus-specs)
4. [Solidity Compiler Official Documentation & Language Spec](https://docs.soliditylang.org/)
5. [Ethers.js Complete Web3 Library Documentation](https://docs.ethers.org/)
6. [Uniswap v3 Core Architecture Protocol Whitepaper](https://uniswap.org/whitepaper-v3.pdf)
7. [Aave v3 Technical Protocol Architecture Documentation](https://docs.aave.com/developers/)
8. [MakerDAO Technical Documentation & Maker Protocol Specs](https://docs.makerdao.com/)
9. [Curve Finance Automated Market Maker Specification](https://curve.fi/files/stableswap-paper.pdf)
10. [OP Stack Open Source Rollup Specifications](https://stack.optimism.io/)
