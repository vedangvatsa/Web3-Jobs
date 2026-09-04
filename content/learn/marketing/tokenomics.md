---
title: Tokenomics Fundamentals
description: >-
  How token supply, distribution, and incentive design determine the success of
  Web3 projects.
order: 7
readTime: 12 min
difficulty: intermediate
prerequisites:
  - token-launches
quiz:
  - question: What does 'Fully Diluted Valuation' (FDV) represent?
    options:
      - The current market cap of a token.
      - >-
        The total value of all tokens that will ever exist, at the current
        price.
      - The value of tokens held by the team.
      - The amount of tokens in circulation.
    correct: 1
    explanation: >-
      FDV = current token price × total max supply. It represents what the
      project would be worth if all tokens (including locked, unvested, and
      future emissions) were in circulation at today's price.
  - question: Why is a high FDV relative to market cap considered risky?
    options:
      - It means the token is overvalued.
      - >-
        It means large amounts of tokens are locked and will eventually enter
        circulation, potentially diluting current holders.
      - It means the project has too many users.
      - It means the token is on too many exchanges.
    correct: 1
    explanation: >-
      A high FDV/MC ratio means most tokens haven't been released yet. When they
      unlock (team vesting, ecosystem emissions), selling pressure increases
      dramatically.
  - question: What is the difference between 'circulating supply' and 'total supply'?
    options:
      - They are the same thing.
      - >-
        Circulating supply is the number of tokens currently tradeable on the
        market; total supply includes locked, vesting, and unreleased tokens.
      - Total supply is always smaller.
      - Circulating supply includes future tokens.
    correct: 1
    explanation: >-
      Circulating supply reflects what's actually available for trading right
      now. Total supply includes everything - team tokens still vesting,
      ecosystem funds locked in smart contracts, and tokens yet to be minted.
      The gap between them determines future sell pressure.
  - question: What is a 'cliff' in token vesting?
    options:
      - The point where a token's price drops.
      - >-
        An initial period (usually 6-12 months) during which zero tokens unlock,
        after which tokens begin releasing on a regular schedule.
      - A type of smart contract bug.
      - A trading strategy.
    correct: 1
    explanation: >-
      The cliff protects early investors and community members from team/insider
      dumps. If a team has a 1-year cliff with 4-year vesting, they receive zero
      tokens for the first year. This aligns incentives - the team must build
      real value before receiving any tokens.
  - question: What is a red flag in token distribution?
    options:
      - A large community allocation.
      - >-
        Insiders (team + investors) holding over 50% of the supply with short
        vesting periods - this concentrates power and creates massive future
        sell pressure.
      - Having a fixed supply.
      - Using vesting schedules.
    correct: 1
    explanation: >-
      When insiders hold the majority of tokens with aggressive unlock
      schedules, they can dump on retail investors after launch. Healthy
      distributions typically give 50%+ to community, ecosystem, and treasury,
      with insider tokens vesting over 3-4 years.
lastUpdated: 2026-09-04
---

## What Is Tokenomics?

Tokenomics is the economic design of a cryptocurrency token: how many tokens exist, who gets them, when they unlock, and what utility they provide. Good tokenomics align the incentives of users, builders, and investors. Bad tokenomics create pump-and-dump cycles that destroy value.

## Supply Mechanics

### Fixed vs. Inflationary Supply
- **Fixed supply** (Bitcoin, 21M cap): Scarcity increases over time as demand grows. Deflationary pressure.
- **Inflationary** (Ethereum pre-merge, Solana): New tokens are continuously minted to pay validators. Can be offset by burn mechanisms.
- **Deflationary** (Ethereum post-merge with EIP-1559): More tokens are burned in fees than created through staking rewards during high network usage.

### Key Metrics

| Metric | Definition | Why It Matters |
| --- | --- | --- |
| Circulating Supply | Tokens currently tradeable | Determines current market cap |
| Total Supply | All tokens that exist now | Includes locked/vesting tokens |
| Max Supply | Maximum tokens that will ever exist | Upper bound on dilution |
| Market Cap | Price × Circulating Supply | Current valuation |
| FDV | Price × Max Supply | Future dilution risk |

## Token Distribution

How tokens are allocated at launch determines who benefits and who gets diluted. A typical allocation:

- **Team & Founders:** 15-20% (vested over 3-4 years)
- **Investors (Seed/Series A):** 15-25% (vested over 1-2 years)
- **Ecosystem/Community:** 25-40% (grants, airdrops, liquidity mining)
- **Treasury:** 10-20% (DAO-controlled)
- **Advisors:** 3-5% (vested)

### Red Flags in Distribution
- Team + investors holding > 50% → Centralization risk
- No vesting for insiders → Immediate dump potential
- Vague "ecosystem" allocation with no clear plan → Often used as a slush fund

<div class="diagram">
<svg viewBox="0 0 800 130" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
 <text x="400" y="20" text-anchor="middle" font-size="13" font-weight="bold" fill="#666">Typical Token Distribution</text>

 <!-- Stacked bar -->
 <rect x="50" y="40" width="136" height="40" rx="4" fill="#dbeafe" stroke="#3b82f6" stroke-width="1"/>
 <text x="118" y="64" text-anchor="middle" font-size="10" font-weight="600" fill="#1e40af">Team 17%</text>

 <rect x="186" y="40" width="152" height="40" rx="4" fill="#fef3c7" stroke="#f59e0b" stroke-width="1"/>
 <text x="262" y="64" text-anchor="middle" font-size="10" font-weight="600" fill="#92400e">Investors 19%</text>

 <rect x="338" y="40" width="240" height="40" rx="4" fill="#dcfce7" stroke="#22c55e" stroke-width="1"/>
 <text x="458" y="64" text-anchor="middle" font-size="10" font-weight="600" fill="#166534">Community/Ecosystem 30%</text>

 <rect x="578" y="40" width="120" height="40" rx="4" fill="#fdf2f8" stroke="#ec4899" stroke-width="1"/>
 <text x="638" y="64" text-anchor="middle" font-size="10" font-weight="600" fill="#9d174d">Treasury 15%</text>

 <rect x="698" y="40" width="52" height="40" rx="4" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>
 <text x="724" y="64" text-anchor="middle" font-size="9" fill="#374151">Other</text>

 <!-- Labels below -->
 <text x="118" y="100" text-anchor="middle" font-size="9" fill="#64748b">4yr vest</text>
 <text x="262" y="100" text-anchor="middle" font-size="9" fill="#64748b">1-2yr vest</text>
 <text x="458" y="100" text-anchor="middle" font-size="9" fill="#64748b">Grants + airdrops</text>
 <text x="638" y="100" text-anchor="middle" font-size="9" fill="#64748b">DAO-controlled</text>

 <text x="400" y="125" text-anchor="middle" font-size="10" fill="#ef4444">Red flag: insiders (team + investors) > 50%</text>
</svg>
</div>

## Vesting and Cliffs

**Vesting** means tokens unlock gradually over time. **Cliffs** are periods where no tokens unlock at all.

Example: "4-year vest with 1-year cliff" means:
- Year 0-1: No tokens unlock (the cliff)
- Year 1: 25% unlocks at once
- Years 1-4: Remaining 75% unlocks monthly/quarterly

### Why Vesting Matters
Without vesting, insiders can dump tokens immediately at launch. This happened infamously with many 2021-era projects where VCs sold at launch, crashing prices.

## Token Utility

A token needs genuine utility to sustain value. Common utility types:

1. **Governance:** Voting on protocol decisions (UNI, AAVE)
2. **Staking:** Locking tokens to secure the network and earn rewards (ETH, SOL)
3. **Payment:** Required to use the protocol's services (LINK for oracle data, FIL for storage)
4. **Fee discount:** Holding reduces trading fees (BNB on Binance)
5. **Revenue sharing:** Token holders earn a share of protocol revenue (MKR buyback-and-burn)

### The "Do You Actually Need a Token?" Test
Many projects launch tokens that have no real utility. Ask: could this protocol function equally well with ETH or USDC instead of its own token? If yes, the token exists primarily to raise money, not to solve a problem.

## Emission Schedules

Emission = the rate at which new tokens enter circulation. This is the single most important factor in long-term token price performance.

High emissions (aggressive liquidity mining, large ecosystem grants) create constant selling pressure as recipients sell rewards to cover costs. Sustainable projects design emissions that decrease over time (Bitcoin's halving model).

## Real-World Analysis

When evaluating any token:
1. Check circulating supply vs. FDV ratio. If FDV is 10x+ market cap, expect heavy dilution.
2. Look at upcoming unlock dates on Token Unlocks or CoinGecko.
3. Verify that the token has real utility beyond speculation.
4. Check if the protocol generates revenue. If it does, how does value flow to token holders?

## Key Takeaways

- Tokenomics is the single most important factor in a token's long-term viability.
- FDV vs. market cap ratio reveals dilution risk.
- Vesting schedules protect retail investors from insider dumps.
- Genuine token utility (staking, payment, governance) sustains demand.
- Sustainable emission schedules prevent death spirals.
