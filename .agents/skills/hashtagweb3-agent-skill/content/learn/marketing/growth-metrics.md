---
title: Growth Metrics and Analytics
description: >-
  The metrics Web3 protocols actually track - TVL, DAU, retention, and how they
  differ from Web2 KPIs.
order: 5
readTime: 7 min
difficulty: intermediate
prerequisites:
  - community
quiz:
  - question: What does Total Value Locked (TVL) measure?
    options:
      - The total market cap of a protocol's token
      - >-
        The total dollar value of crypto deposited into a protocol's smart
        contracts
      - The number of users who have interacted with the protocol
      - The protocol's annual revenue
    correct: 1
    explanation: >-
      TVL counts all assets sitting in a protocol's smart contracts. If users
      have deposited $500M of ETH and USDC into Aave's lending pools, Aave's TVL
      is $500M. It is the closest equivalent to 'assets under management' in
      traditional finance.
  - question: Why is TVL alone a misleading metric?
    options:
      - Because TVL is hard to calculate
      - >-
        Because TVL can be inflated by incentive farming - users deposit money
        to earn token rewards, then leave when rewards stop
      - Because TVL doesn't include Bitcoin
      - Because TVL is calculated differently on each chain
    correct: 1
    explanation: >-
      During 'DeFi Summer' and beyond, protocols offered massive token rewards
      to attract deposits. TVL spiked, but the capital was mercenary - it left
      the moment rewards decreased. TVL without revenue or retention data is
      vanity.
  - question: What is the Web3 equivalent of Monthly Active Users (MAU)?
    options:
      - Token holders
      - >-
        Unique Active Wallets (UAW) - the number of distinct wallet addresses
        interacting with contracts in a given period
      - Twitter followers
      - Discord members
    correct: 1
    explanation: >-
      Unique Active Wallets counts how many distinct addresses called a
      protocol's smart contracts. It is imperfect - one person can control
      multiple wallets (sybil) - but it is the best on-chain proxy for actual
      usage. Dune Analytics and Flipside are the standard tools for tracking
      UAW.
  - question: What does the 'Protocol Revenue' metric tell you that TVL doesn't?
    options:
      - How much the team has raised from investors
      - >-
        How much real economic value flows through the protocol - actual fees
        paid by real users for a real service
      - How many tokens have been burned
      - How many partnerships the protocol has signed
    correct: 1
    explanation: >-
      Protocol revenue is the total fees users pay to use the protocol. Uniswap
      generates ~$2-5M per day in swap fees. This is real demand, not subsidized
      by token incentives. A protocol with high TVL but low revenue means users
      are only there for incentives.
  - question: >-
      Which analytics platform is most commonly used to build custom Web3
      dashboards?
    options:
      - Google Analytics
      - >-
        Dune Analytics - it lets you write SQL queries against decoded
        blockchain data
      - Mixpanel
      - Tableau
    correct: 1
    explanation: >-
      Dune Analytics indexes and decodes blockchain transaction data into
      SQL-queryable tables. Anyone can write queries like 'SELECT COUNT(DISTINCT
      sender) FROM uniswap_v3.swaps WHERE block_time > now() - interval '7
      days'' to get weekly active traders. Dashboards are public and forkable.
---

## Web3 Metrics Are Different

In Web2, you measure success with signups, monthly active users, and revenue. In Web3, the data is fundamentally different because everything happens on-chain and user identity is pseudonymous.

You cannot track emails. You cannot track logins. You track wallet addresses and smart contract interactions.

<div class="diagram">
<svg viewBox="0 0 800 160" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
 <rect x="20" y="25" width="145" height="110" rx="10" fill="#dcfce7" stroke="#22c55e" stroke-width="1.5"/>
 <text x="92" y="55" text-anchor="middle" font-size="22">💰</text>
 <text x="92" y="78" text-anchor="middle" font-size="12" font-weight="bold" fill="#166534">TVL</text>
 <text x="92" y="95" text-anchor="middle" font-size="10" fill="#22c55e">Capital locked</text>
 <text x="92" y="110" text-anchor="middle" font-size="9" fill="#64748b">DeFiLlama</text>

 <rect x="185" y="25" width="145" height="110" rx="10" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
 <text x="257" y="55" text-anchor="middle" font-size="22">👛</text>
 <text x="257" y="78" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e40af">UAW</text>
 <text x="257" y="95" text-anchor="middle" font-size="10" fill="#3b82f6">Active wallets</text>
 <text x="257" y="110" text-anchor="middle" font-size="9" fill="#64748b">Dune Analytics</text>

 <rect x="350" y="25" width="145" height="110" rx="10" fill="#fefce8" stroke="#eab308" stroke-width="1.5"/>
 <text x="422" y="55" text-anchor="middle" font-size="22">📊</text>
 <text x="422" y="78" text-anchor="middle" font-size="12" font-weight="bold" fill="#854d0e">Revenue</text>
 <text x="422" y="95" text-anchor="middle" font-size="10" fill="#eab308">Real fees paid</text>
 <text x="422" y="110" text-anchor="middle" font-size="9" fill="#64748b">Token Terminal</text>

 <rect x="515" y="25" width="145" height="110" rx="10" fill="#faf5ff" stroke="#a855f7" stroke-width="1.5"/>
 <text x="587" y="55" text-anchor="middle" font-size="22">🔄</text>
 <text x="587" y="78" text-anchor="middle" font-size="12" font-weight="bold" fill="#7c3aed">Retention</text>
 <text x="587" y="95" text-anchor="middle" font-size="10" fill="#a855f7">Returning users</text>
 <text x="587" y="110" text-anchor="middle" font-size="9" fill="#64748b">Cohort analysis</text>

 <rect x="680" y="25" width="105" height="110" rx="10" fill="#fff7ed" stroke="#f97316" stroke-width="1.5"/>
 <text x="732" y="55" text-anchor="middle" font-size="22">🏛️</text>
 <text x="732" y="78" text-anchor="middle" font-size="12" font-weight="bold" fill="#c2410c">Distribution</text>
 <text x="732" y="95" text-anchor="middle" font-size="10" fill="#f97316">Token holders</text>
 <text x="732" y="110" text-anchor="middle" font-size="9" fill="#64748b">Nansen</text>
</svg>
</div>

## The Core Metrics

### 1. Total Value Locked (TVL)

TVL is the total dollar value of crypto deposited in a protocol's smart contracts. It is the most-quoted metric in DeFi and the most misunderstood.

**What it tells you:** How much capital the protocol has attracted. A lending protocol with $2B TVL has $2B available for borrowers.

**What it doesn't tell you:** Whether that capital is sticky. During yield farming booms, TVL can 10x overnight when a protocol offers generous token rewards, then collapse to near-zero when those rewards end.

**The better metric:** TVL adjusted for incentives. How much TVL remains when you subtract the token rewards? That's your organic demand.

Track at: [DeFiLlama](https://defillama.com)

### 2. Unique Active Wallets (UAW)

The on-chain equivalent of MAU. Count the distinct wallet addresses that interacted with your contracts in a given period.

| Timeframe | What it measures |
|---|---|
| Daily Active Wallets (DAW) | Engagement intensity |
| Weekly Active Wallets (WAW) | Healthy usage cadence |
| Monthly Active Wallets (MAW) | Broad adoption |

**Caveat:** One person can own many wallets. Airdrop farmers routinely operate 50-100 wallets (sybil activity). Cross-reference with other signals like transaction value and frequency to filter noise.

### 3. Protocol Revenue

The real fees users pay. Not token incentives, not VC money - actual demand for the protocol's service.

| Protocol | Revenue Source | Daily Revenue (2025) |
|---|---|---|
| Uniswap | 0.01-1% swap fee | ~$2-5M |
| Aave | Interest spread on loans | ~$500K-1M |
| Lido | 10% of staking rewards | ~$1-2M |
| OpenSea | 2.5% marketplace fee | ~$200-500K |

Track at: [Token Terminal](https://tokenterminal.com)

### 4. Retention

What percentage of wallets that transact in week 1 return in week 2, 4, and 12?

This is harder to measure on-chain than in Web2 (no session tracking), but Dune Analytics queries can approximate it by tracking wallet cohorts over time.

```sql
-- Example: 7-day retention for a DEX
WITH first_swap AS (
 SELECT
 sender,
 MIN(DATE_TRUNC('week', block_time)) AS first_week
 FROM dex.trades
 WHERE project = 'uniswap'
 GROUP BY sender
)
SELECT
 first_week,
 COUNT(DISTINCT f.sender) AS cohort_size,
 COUNT(DISTINCT CASE
 WHEN t.block_time BETWEEN f.first_week + INTERVAL '7 days'
 AND f.first_week + INTERVAL '14 days'
 THEN f.sender
 END) AS retained_week_2
FROM first_swap f
LEFT JOIN dex.trades t ON f.sender = t.sender
GROUP BY first_week
ORDER BY first_week DESC
```

Good DeFi protocols retain 15-25% of users after 30 days. Exceptional ones retain 30%+.

### 5. Token Holder Distribution

How concentrated is token ownership? If 10 wallets hold 80% of the supply, governance is effectively centralized regardless of what the documentation says.

**Healthy distribution:** Top 10 holders control <40% of circulating supply, with a clear separation between protocol treasury, vesting contracts, and individual holders.

## Tools of the Trade

| Tool | What it does | Cost |
|---|---|---|
| **Dune Analytics** | Custom SQL dashboards on blockchain data | Free (paid for private queries) |
| **DeFiLlama** | TVL tracking across all chains and protocols | Free |
| **Token Terminal** | Revenue, earnings, and valuation metrics | Free tier + paid |
| **Flipside Crypto** | Blockchain analytics with bounty programs | Free |
| **Nansen** | Wallet labeling and smart money tracking | Paid ($150+/mo) |

## Key takeaways

- TVL is the most-quoted metric but is easily inflated by token incentives. Always look at TVL alongside revenue.
- Unique Active Wallets is the closest on-chain equivalent to MAU, but is susceptible to sybil inflation.
- Protocol revenue is the single best indicator of product-market fit - real users paying real fees.
- Retention analysis requires Dune SQL queries tracking wallet cohorts over time.
- Dune Analytics and DeFiLlama are free and cover 90% of what you need.
