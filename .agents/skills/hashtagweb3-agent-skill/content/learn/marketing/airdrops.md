---
title: Token Launches and Airdrops
description: How Web3 protocols use tokens to bootstrap growth and reward users.
order: 3
readTime: 8 min
difficulty: intermediate
prerequisites:
  - twitter
quiz:
  - question: What is the primary purpose of a token airdrop?
    options:
      - To avoid paying taxes
      - >-
        To reward early users, decentralize governance, and bootstrap network
        effects
      - To hack user wallets
      - To replace Bitcoin
    correct: 1
    explanation: >-
      Airdrops distribute tokens to early users to reward them for testing the
      protocol, while simultaneously distributing voting power (governance) to
      decentralize the network.
  - question: What is a 'Sybil attacker' in the context of airdrops?
    options:
      - A virus that deletes tokens
      - >-
        A user who creates thousands of fake wallets to farm an airdrop,
        stealing tokens meant for real users
      - A developer who writes bad code
      - A type of smart contract
    correct: 1
    explanation: >-
      Sybil attackers use bots to create thousands of wallets and execute fake
      transactions. Protocols must use advanced analytics to filter these out so
      real users get the rewards.
  - question: What is 'Tokenomics'?
    options:
      - The study of traditional economics
      - >-
        The economic design of a token, including its total supply, emission
        rate, utility, and distribution
      - A website for tracking token prices
      - The code used to mine Bitcoin
    correct: 1
    explanation: >-
      Tokenomics (Token Economics) dictates how a token works. Bad tokenomics
      (like infinite supply or no utility) will cause the token price to crash,
      ruining the protocol's marketing efforts.
  - question: What is a 'Vesting Schedule'?
    options:
      - A timeline for updating the website
      - >-
        A lock-up period that prevents founders and investors from selling all
        their tokens immediately after launch
      - A plan for hiring new employees
      - A schedule for smart contract audits
    correct: 1
    explanation: >-
      Vesting schedules lock tokens in a smart contract. They unlock gradually
      over years (e.g., 4 years). This aligns the team's incentives with the
      long-term success of the protocol.
  - question: Why do some protocols launch 'Points' programs before a token?
    options:
      - Because points are legally binding
      - >-
        To gamify user activity and track who deserves an airdrop without
        explicitly promising financial rewards
      - Because smart contracts cannot handle tokens
      - To charge users money
    correct: 1
    explanation: >-
      Points programs (like loyalty points) track user engagement. They are a
      marketing tool to drive usage before a token is ready, often serving as a
      precursor to an official airdrop.
---

## The Cold Start Problem

In Web2, starting a new marketplace (like Uber) is incredibly hard. You need drivers, but drivers won't join without riders. Riders won't join without drivers. This is the **cold start problem**. Companies solve this by spending billions on Facebook ads and subsidies.

In Web3, protocols solve the cold start problem with **Tokens**. 

If you build a new decentralized exchange (DEX), you can tell early users: *"Provide liquidity to our platform today. Even though there are no traders yet, we will give you ownership in the protocol (our token) as a reward."*

The token creates financial incentive for early adopters to use the product before it achieves network effects.

## The Airdrop

An **Airdrop** is the moment a protocol distributes its new token for free to its early users. 

Famous airdrops like Uniswap (UNI), Arbitrum (ARB), and Optimism (OP) gave thousands of dollars to regular users simply for testing the protocol early on.

### The Marketing Power of Airdrops

Airdrops are the ultimate marketing tool. When a protocol announces an airdrop:
1. **Virality:** Crypto Twitter erupts. Everyone talks about the "free money."
2. **Loyalty:** Early users suddenly become partial owners of the protocol. They become evangelists, telling their friends to use it.
3. **Decentralization:** The founders give away a massive chunk of voting power to the community, making the protocol legally and practically decentralized.

### The Danger: Sybil Attacks and Mercenaries

Airdrops have massive flaws.

**Sybil Attackers:** Because wallets are anonymous, one person can write a script to create 10,000 wallets, do one transaction on each, and steal 10,000 airdrops. Marketing teams now have to hire data scientists to track IP addresses, on-chain linkages, and transaction patterns to filter out bots and ensure real humans get the tokens.

**Mercenary Capital:** Many users only use the protocol to get the airdrop. The day the token launches, they sell it and never use the product again. To fix this, modern marketing teams use **Points Programs**.

## Points Programs

Instead of promising an airdrop, protocols give users "Points" for doing specific actions (trading, lending, referring friends). 

Points act as a psychological gamification tool. Users compete on leaderboards. While there is an *implicit* understanding that points will eventually convert into an airdrop, the protocol doesn't explicitly promise it, avoiding legal issues and keeping mercenary capital engaged for longer periods.

## Tokenomics 101 for Marketers

If you are a marketing lead, you must understand the basic economics of the token you are launching. If the tokenomics are bad, the community will revolt.

<div class="diagram">
<svg viewBox="0 0 800 240" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
 <rect x="50" y="20" width="700" height="40" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
 <text x="400" y="45" text-anchor="middle" font-size="14" font-weight="bold" fill="#334155">Total Token Supply (e.g., 1 Billion Tokens)</text>

 <!-- Distribution Pie Chart alternative (horizontal bar) -->
 <rect x="50" y="80" width="350" height="40" fill="#3b82f6"/>
 <text x="225" y="105" text-anchor="middle" font-size="12" fill="white" font-weight="bold">Community / Airdrop (50%)</text>

 <rect x="400" y="80" width="140" height="40" fill="#10b981"/>
 <text x="470" y="105" text-anchor="middle" font-size="12" fill="white" font-weight="bold">Team (20%)</text>

 <rect x="540" y="80" width="140" height="40" fill="#f59e0b"/>
 <text x="610" y="105" text-anchor="middle" font-size="12" fill="white" font-weight="bold">Investors (20%)</text>

 <rect x="680" y="80" width="70" height="40" fill="#8b5cf6"/>
 <text x="715" y="105" text-anchor="middle" font-size="12" fill="white" font-weight="bold">Treasury</text>

 <!-- Explanations -->
 <text x="225" y="145" text-anchor="middle" font-size="11" fill="#475569">Given to early users to</text>
 <text x="225" y="160" text-anchor="middle" font-size="11" fill="#475569">reward loyalty and decentralize.</text>

 <text x="540" y="145" text-anchor="middle" font-size="11" fill="#475569">Subject to strict</text>
 <text x="540" y="160" text-anchor="middle" font-size="11" font-weight="bold" fill="#475569">Vesting Schedules</text>
 <text x="540" y="175" text-anchor="middle" font-size="11" fill="#475569">so they can't dump on users.</text>
</svg>
</div>

**Vesting:** Team and investor tokens must be locked in a smart contract. They should unlock slowly over 3-4 years. If a team has no vesting, the community will accuse them of planning a "rug pull" (selling everything and abandoning the project).

**Utility:** The token must do something. Does it grant voting rights in the DAO? Does it give a discount on protocol fees? Do holders get a share of protocol revenue? If it does nothing, the price will go to zero.

## Key takeaways

- Airdrops solve the cold-start problem by giving early users financial incentive and ownership.
- Marketing teams must actively fight Sybil attackers (bots) to ensure real users get rewarded.
- Points programs are used to gamify engagement before a token launches.
- A transparent token distribution pie chart and strict team vesting schedules are required to build trust.

## Congratulations

You have completed the Web3 Marketing & Community track! You now understand Discord community dynamics, Crypto Twitter strategies, and the mechanics of token launches.
