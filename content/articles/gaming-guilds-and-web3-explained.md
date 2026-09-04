---
title: 'Gaming Guilds and Web3 Explained: Scholarships, SubDAOs, and Onchain Guilds'
image: >-
  https://images.unsplash.com/photo-1542751371-adc38448a05e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxnYW1pbmd8ZW58MHx8fHwxNzU1MDA4OTAyfDA&ixlib=rb-4.1.0&q=80&w=1080
description: >-
  What Web3 gaming guilds are, how the scholarship model worked, why it broke in
  2022, and how leading guilds now use questing, subDAOs, and onchain
  reputation. Includes mechanics, costs, revenue splits, and practical steps to
  join.
category: Technology Deep Dives
publishedDate: '2026-03-11'
lastUpdated: '2026-09-04'
---
A Web3 gaming guild is a coordinated group that pools capital to acquire game assets and distributes access to players who play, complete tasks, or provide data in exchange for a share of rewards. The model started as NFT lending for play-to-earn games and now includes questing, reputation tracking, and game publishing.

This guide explains how guilds work, who they suit, what they cost, where they failed, and how to participate without relying on hype.

## What a Web3 gaming guild is

A Web3 gaming guild buys or manages in-game assets that have onchain ownership, then delegates access to those assets to players. The guild tracks performance onchain and splits rewards through smart contracts.

The earliest version was the scholarship. A guild bought NFT characters or land needed to play, lent them to a player called a scholar, and divided the tokens the scholar earned. The scholar did not own the NFT and could not transfer or sell it. The owner retained custody via wallet delegation or smart contract permissions.

By 2025 the definition expanded. Guilds became distribution networks and coordination layers. They run quest systems, issue non-transferable badges for reputation, manage sub-treasuries, and publish or test games for studios.

Yield Guild Games (YGG) is the reference case. YGG was founded in 2020 by Gabby Dizon, Beryl Li, and Owl of Moistness. It formalized the scholarship model around Axie Infinity during 2021, then rebuilt around quests, subDAOs, and a protocol for onchain guilds. By August 2026 YGG described itself as a sector-agnostic infrastructure layer for AI data work, not only gaming. See yieldguild.io and YGG 3.0 August 2026 paper.

## Who this is for

**Players without capital:** You want to try blockchain games but do not want to buy a $400 to $1,500 starter team. Guilds historically lowered that barrier. Current entry is more often through free quests than through direct asset loans.

**Skilled players seeking distribution:** You perform well in specific games and want access to early builds, tournaments, or publishing support. Guilds route high-reputation players to partners who need testers and early users.

**Game studios needing users:** You need verified players, feedback, and regional coverage. Guilds offer player routing, campaign management, and analytics through their protocol tools.

**Contributors seeking micro-work:** Since 2024 YGG has added non-gaming work such as data labeling, moderation, and model evaluation under Future of Work. This suits people in regions with strong English and mobile coverage, especially Southeast Asia, who can do task-based work for token or stablecoin payouts.

**Investors and researchers:** You want exposure to Web3 gaming without picking single titles. Guild treasuries and tokens bundle many bets. This is high risk and correlates to game retention and token prices.

This is not for casual players who want a traditional AAA experience. Many blockchain games still lack polish, have volatile economies, and require wallet and security handling that adds friction.

## How it works

### 1. The original scholarship mechanics

The scholarship addressed a concrete cost problem. Axie Infinity required three Axie NFTs to play. Prices moved sharply with demand:

- In November 2020 a starter team could cost about $300.
- By July 2021 Coingecko recorded a floor price around $230 per Axie, or about $690 for three, and 62% of respondents called cost a high barrier.
- By August 2021 a battle-ready team was cited at $1,500 minimum. In October 2021 the floor was about $146 per Axie, or about $438 for three.

In the Philippines, where most early scholars were based, that entry cost exceeded a month of income. Philippines average monthly salary in 2020 was cited near $892 in one earnings analysis, and Malaysia basic income near $285 in the same Coingecko survey. The loan model removed upfront cost for the player.

The three-party flow worked like this:

1. **Guild treasury** buys NFTs from the market or from a game studio allocation. Assets are held in a multisig wallet controlled by founders or later by DAO vote. YGG's whitepaper states assets are acquired and controlled via multisig hardware wallets.
2. **Community manager** recruits, screens, and mentors scholars. Managers distribute guild-owned Axies to local players, provide training, and monitor daily earnings.
3. **Scholar** plays on an account linked to the guild's wallet. The scholar earns the game's reward token. Axie's reward token was Smooth Love Potion (SLP). Tokens go to a wallet the scholar can use for play but not for asset transfers.

Revenue split varied but followed a pattern. YGG's own explainer from 2021 to 2022 listed 70% to the scholar, 20% to the manager, and 10% to the guild treasury. Coingecko's August 2021 study found typical scholar shares of 50% to 70%, with managers tracking payouts biweekly or monthly and freezing inactive scholars after two to four weeks. Some guilds used 60/30/10 or similar ranges. By May 2026 guides cited common ranges between 50/30/20 and 70/20/10, scholar first.

Smart contract delegation enforced the split. Before delegation was automated, guilds tracked earnings in databases. Later YGG routed earnings through its Guild Protocol smart contracts with automated distribution and onchain performance tracking.

Sponsor-A-Scholar showed scale and limits. YGG reported its first sponsor, Flying Falcon, funded 50 scholars in May 2021. Leaping Corgi funded 87 in July 2021 and FTX funded 137 in August 2021. A survey of 230 of those scholars between September and December 2021 found 63% were from the Philippines, and 86% said the scholarship was their first time using crypto.

### 2. Why the model broke after 2022

The model required constant demand for reward tokens and NFTs. That demand did not hold.

- **Token inflation:** Axie issued SLP without a hard cap. Supply grew without equivalent burns. SLP fell from about $0.40 at peak to about $0.004 by late 2022, a 99% drop cited across Yellow, Financial News, and CryptoGames3D reviews.
- **Revenue collapse:** Axie weekly revenue fell from about $275 million in August 2021 to about $988,000 in late 2022, a 99.7% decline reported by Yellow Research.
- **User drop:** Weekly active users fell from about 2.7 million to about 250,000 in the same period.
- **Asset deflation:** Axie floor prices fell from about $340 to about $6.
- **Security shock:** The Ronin bridge hack in March 2022 drained about $620 million to $625 million, accelerating the decline.

Other titles followed a similar curve. StepN's GMT fell 85% from peak and GST fell 99% by late 2022. By 2025 analysts estimated about 93% of GameFi projects were effectively inactive. When tokens lost value, grinding no longer covered fees or time. Managers withdrew capital. Scholarship counts fell across 2022 and 2023 even as guilds added subDAOs.

### 3. The shift to quests and reputation

YGG replaced blanket lending with a merit system.

**Guild Advancement Program (GAP):** Season 1 launched in April 2022. Players completed game-specific quests to earn badges, NFTs, and tokens. The guild could observe completion history before allocating scarce assets. Season 9 drew 27,702 questers. Season 10, which included Ragnarok Landverse and YGG's self-published LOL Land, drew 76,841 questers, a 177% increase. Gap seasons ended after Season 10 in August 2025 as YGG moved to continuous questing.

**Soulbound tokens (SBTs):** YGG issues non-transferable achievement badges for quest completion. Leaders use them to verify members and route access. Partners use them to identify cohorts with proven activity.

**SubDAOs and Onchain Guilds:** Regional and game-specific subDAOs manage their own assets and activities. Early examples included YGG SEA, IndiGG, Ola GG, YGG Japan, and BAYZ. By late 2025 YGG reported more than 42 regional and game-specific guilds. One reported structure had subDAOs retaining 70% of earnings and routing 30% to the main YGG DAO. Onchain Guilds were formalized in the Guild Protocol concept paper released September 2024 and deployed on Base. By July 2025 YGG counted 108 Onchain Guilds averaging 98 members. Creating an Onchain Guild requires a YGG account and YGG tokens. Each guild gets a multisig treasury, a management dashboard, work modules, and authority to issue SBTs.

**Publishing:** YGG Play became a publishing arm. Its first title, LOL Land on Abstract L2, launched May 23, 2025. It drew over 25,000 players in its opening weekend, then reported over 631,000 monthly active users and over 69,000 daily active users in July, with an average spend of $434 per paying player. YGG reported $4.5 million lifetime revenue for LOL Land by August 2025, $8.59 million lifetime later in Q1 2026 reporting, and over $9 million across YGG Play in Q1 2026. Q1 2026 alone contributed $876,000, with $563,599 from LOL Land. YGG used profits for token buybacks. On July 31, 2025 it completed a 135 ETH buyback valued near $518,000. Total buybacks reached 24.1 million YGG for about $3.7 million by early 2026, about 3.84% of circulating supply.

**AI pivot:** On July 6, 2026 YGG announced the sunset of YGG Play and cut 35 jobs, then retired the YGG Play sites and questing platform on July 31, 2026. In August 2026 YGG launched YGG 3.0, repositioning the Guild Protocol for AI data work: RLHF, red-teaming, output verification, and telemetry for game engines. Products include GIG Rewards and GIG, built with BreederDAO, YGG Pilipinas, and ED3N Ventures, with distribution via a partnership with a major Philippines telco. YGG reported a $20.6 million treasury at end of Q1 2026, with $6.2 million in stablecoins, T-bills, and large-cap tokens, and described runway near four years post-restructuring.

### 4. Token and treasury facts

- **Supply:** YGG has a 1 billion max supply. In May 2026 about 740 million were circulating. About 79.7% had been released with vesting into 2027.
- **Price context:** YGG traded near $0.042 in early May 2026, down about 99.6% from the $11.17 all-time high in November 2021, after hitting about $0.0335 in March 2026. These are volatile and should not be read as valuation models. Buybacks are events, not recurring revenue.
- **Treasury path:** YGG reported $38.0 million on July 31, 2025, $21.5 million on December 31, 2025, and $20.6 million at end of Q1 2026. An Ecosystem Pool of 50 million YGG, about $7.5 million at transfer in August 2025, was allocated to a proprietary Onchain Guild for yield strategies.
- **Governance:** YGG is a DAO where YGG tokens represent voting rights. Early execution remained under multisig control of founders, with proposals routing treasury actions.

## Pros and cons

### What works

- **Lowers entry barrier:** Players try games without buying NFTs. YGG's survey found the model onboarded first-time crypto users at high rates.
- **Distribution for new games:** Studios get targeted users, early feedback, and regional coverage without building community from scratch.
- **Reputation layer:** SBTs and quest history give studios a filter beyond wallet balance. This reduces allocation to inactive or low-quality accounts.
- **Skill pathways:** High-skill players can access competitive assets and revenue tied to performance rather than grinding alone.

### What does not

- **Dependent on token prices:** If reward tokens inflate or demand falls, scholar income falls faster than fees. Grinding at $0.004 SLP did not cover time or gas.
- **Power imbalance:** Scholars depend on managers for access. Managers can reassign assets, change splits, or remove players with little recourse. Governance token concentration can leave DAOs dominated by early holders.
- **Correlated risk:** A guild holding a game's token, NFTs, incentives, and publishing revenue can lose on all sides at once when retention drops.
- **Mercenary behavior:** Quest systems attract reward farmers who complete minimum tasks and rotate. YGG and others note the need for credible sinks and long-term reputation to counter this.
- **Regulatory uncertainty:** Reward tokens and NFTs can face securities or consumer protection review in some jurisdictions. Scholarship splits have been examined as revenue-share agreements.
- **Quality gap:** Many Web3 games still lack the polish of AAA titles. Financial incentives can mask weak gameplay until incentives fade.

## How to get started

This applies to YGG's current system. Other guilds use similar steps with different names.

**1. Create a YGG account and set up a wallet.** You need a self-custody wallet that supports Base and Ronin or other chains the target game uses. Never share seed phrases. Verify links on yieldguild.io.

**2. Build a player profile.** Create a Player Profile on the YGG platform. Link Discord and wallet. This tracks quests, earnings, and SBTs. Early GAP seasons required this before accessing scholarships or quest rewards.

**3. Start with quests, not loans.** Complete free quests and seasonal campaigns. Collect SBT badges. Managers and the protocol use this history to assess dependability, game knowledge, and performance.

**4. Review open roles by game.** Filter by game title on the guild list. Check hardware needs, region, and daily time expectations. Guides in 2026 cited managers expecting 15 to 20 hours per week. Some games require partner server access, such as Legend of YMIR in March 2026.

**5. Apply with specifics.** Include wallet-linked profile, proof of play such as screenshots or usernames, hours available, and why you fit the game. Managers look for reliability and understanding of that game's economy, not only rank.

**6. Expect a trial period.** Typical probation is 7 to 14 days. Managers view daily output via onchain metrics in the Guild Protocol. If you miss thresholds, assets are reassigned.

**7. Understand payout mechanics.** Delegated NFTs stay owned by the guild. Earnings split per the guild's preset percentages. Payouts are automated via smart contracts on weekly or biweekly cycles and distributed in the game's native token. You can hold, swap to stablecoins via a DEX, or unstake per that game's rules. If you stake rewards in liquidity pools, understand impermanent loss.

**8. Manage risk.** Track token emission schedules, burn mechanisms, and treasury disclosures. Check YGG's quarterly updates for treasury values and buyback details. Do not assume past yields repeat. Keep play time within limits you would accept if token prices fall.

**9. To create a guild instead of joining one.** You need a YGG account and YGG tokens to register an Onchain Guild on Base. You get a multisig treasury, member list, and SBT issuance. The YGG Guild Protocol concept paper describes the full module set.

## FAQ

**Do I need to buy NFTs to join a guild?**
No. The original model required managers to own NFTs, not scholars. Since 2022 YGG moved to quest-based entry where you earn access and reputation without an upfront purchase. Some third-party guilds still require you to hold entry badges, but YGG's core path starts free.

**What share do scholars actually keep?**
Historical ranges were 50% to 70% for the scholar, with 20% to 30% to the guild and 5% to 20% to the manager, depending on game and guild. YGG's cited split was 70% scholar, 20% manager, 10% guild treasury. Current onchain guilds can set their own splits, often retaining 70% locally and routing 30% to the parent DAO.

**Can guilds make play-to-earn income stable?**
No. Early play-to-earn economies were inflationary. When new player inflows slowed, token prices fell and income went near zero. Newer models aim for supply caps, burns through crafting or repair fees, and competitive rewards, but sustainability depends on retention and real demand, not emission.

**Are guild DAOs truly decentralized?**
Early YGG treasury control required two of three founders to sign, even under a DAO label. Governance weight follows token holdings, which can concentrate. SubDAOs add localization but do not fix concentration at the top.

**What happened to YGG Play and LOL Land?**
YGG Play sunset was announced July 6, 2026 and completed July 31, 2026. Sites yggplay.fun, app.yggplay.fun, and community.yggplay.fun were retired. In-game points were to be redeemed for YGG before the deadline, with unredeemed eligible balances snapshotted for conversion. LOL Land and Waifu Sweeper went offline under YGG, with GIGACHADBAT moving to Delabs.

**What is YGG doing now?**
As of August 2026 YGG focuses on the Guild Protocol as infrastructure for AI work. It routes verified human signal for data collection, annotation, RLHF, and embodied AI data through GIG Rewards, with telco distribution in the Philippines. Gaming-related via VibeCode remains as a sandbox for agent testing, but publishing is no longer core.

**How do guilds pick who to accept?**
Managers check dependability (daily activity versus a weekly threshold), game intellect (do you understand sinks, emissions, and meta), and performance in probation. Reliability matters more than peak rank for most yield-focused slots.

**What should I verify before joining any guild?**
Confirm the contract address on the official site, read the exact split and payout cadence, check treasury reports and token vesting schedule, and search for past security incidents such as the Ronin bridge hack that liquidated guild assets. Treat player counts as distribution, not revenue. Only deposit time or tokens you can afford to lose.

**Is scholarship income taxable or regulated?**
Treat tokens as income where you live and keep records of each payout's value at receipt. Some regions review reward tokens as securities or require KYC for distributions. Guilds have offered tax guidance in some regions but do not replace professional advice. Check local rules before consolidating large earnings.

## Verifiable Primary Sources & References

1. [Ethereum EIP-721 Non-Fungible Token Standard Specification](https://eips.ethereum.org/EIPS/eip-721)
2. [Ethereum Official Yellow Paper & Protocol Specification](https://ethereum.github.io/yellowpaper/paper.pdf)
3. [Bitcoin: A Peer-to-Peer Electronic Cash System Whitepaper](https://bitcoin.org/bitcoin.pdf)
4. [Ethereum Consensus Specs & Proof of Stake Architecture](https://github.com/ethereum/consensus-specs)
5. [Solidity Compiler Official Documentation & Language Spec](https://docs.soliditylang.org/)
6. [Uniswap v3 Core Architecture Protocol Whitepaper](https://uniswap.org/whitepaper-v3.pdf)
7. [Aave v3 Technical Protocol Architecture Documentation](https://docs.aave.com/developers/)
8. [MakerDAO Technical Documentation & Maker Protocol Specs](https://docs.makerdao.com/)
9. [Curve Finance Automated Market Maker Specification](https://curve.fi/files/stableswap-paper.pdf)
10. [Base Layer 2 Network Official Documentation](https://docs.base.org/)
