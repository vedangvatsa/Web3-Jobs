---
title: Liquid Staking and Restaking
description: >-
  How protocols like Lido and EigenLayer let you earn yield on staked ETH while
  keeping it liquid.
order: 7
readTime: 7 min
difficulty: intermediate
prerequisites:
  - yield
quiz:
  - question: What problem does liquid staking solve?
    options:
      - It makes staking faster
      - >-
        It lets you earn staking rewards without locking your ETH - you get a
        tradeable receipt token instead
      - It eliminates the need for validators
      - It reduces Ethereum gas fees
    correct: 1
    explanation: >-
      Normally, staking ETH locks it in a validator for months. Liquid staking
      protocols like Lido give you stETH (a receipt token) that represents your
      staked ETH. You earn staking rewards while the stETH remains tradeable and
      usable in DeFi.
  - question: What is stETH?
    options:
      - A new cryptocurrency competing with ETH
      - >-
        A receipt token from Lido representing staked ETH plus accrued staking
        rewards
      - A governance token for Ethereum
      - A stablecoin
    correct: 1
    explanation: >-
      stETH is a liquid staking derivative. If you stake 10 ETH through Lido,
      you receive 10 stETH. The stETH balance automatically increases daily as
      staking rewards accrue (a mechanism called rebasing). You can sell, lend,
      or use stETH in DeFi at any time.
  - question: What is restaking (EigenLayer)?
    options:
      - Staking the same ETH twice on Ethereum
      - >-
        Taking ETH that is already staked and opting it in to secure additional
        protocols, earning extra yield
      - Unstaking and re-staking at a different validator
      - Converting staked ETH to Bitcoin
    correct: 1
    explanation: >-
      EigenLayer lets validators take their already-staked ETH and use it as
      economic security for other services (oracles, bridges, data availability
      layers). The staker earns additional rewards from these services on top of
      their base Ethereum staking yield.
  - question: What is the main risk of restaking?
    options:
      - Higher gas fees
      - >-
        Slashing - if a service you're securing has a bug or acts maliciously,
        your staked ETH can be partially confiscated
      - Your ETH changes to a different token permanently
      - Restaking is risk-free
    correct: 1
    explanation: >-
      Restaking extends your slashing conditions. You're not just subject to
      Ethereum's slashing rules - you're also exposed to the slashing conditions
      of every additional service you opt in to. A bug in one of those services
      could result in a portion of your ETH being slashed.
  - question: Why do DeFi protocols prefer stETH over regular ETH?
    options:
      - stETH is cheaper to transfer
      - >-
        stETH earns ~3-4% staking yield while sitting in a lending pool or LP
        position, creating stacked returns
      - stETH has better smart contract security
      - Regulators prefer it
    correct: 1
    explanation: >-
      If you deposit ETH into a lending pool, you earn lending fees but miss out
      on staking rewards. If you deposit stETH, you earn lending fees AND your
      stETH continues accruing staking yield in the background. This capital
      efficiency is why stETH dominates DeFi collateral.
lastUpdated: 2026-09-04
---

## The Locking Problem

Ethereum moved to Proof of Stake in September 2022. Validators must lock 32 ETH to participate in securing the network and earn ~3-4% annual rewards. The problem: that ETH is stuck. You cannot sell it, lend it, or use it in DeFi while it is staked.

<div class="diagram">
<svg viewBox="0 0 800 240" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
 <!-- Layer 1: ETH -->
 <rect x="100" y="180" width="600" height="45" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
 <text x="400" y="200" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e40af">ETH (Base Asset)</text>
 <text x="400" y="216" text-anchor="middle" font-size="10" fill="#3b82f6">Market price exposure</text>

 <!-- Layer 2: Staking -->
 <rect x="130" y="125" width="540" height="45" rx="8" fill="#dcfce7" stroke="#22c55e" stroke-width="1.5"/>
 <text x="400" y="145" text-anchor="middle" font-size="12" font-weight="bold" fill="#166534">Liquid Staking (Lido → stETH)</text>
 <text x="400" y="161" text-anchor="middle" font-size="10" fill="#22c55e">+3-4% APY staking rewards</text>

 <!-- Layer 3: DeFi -->
 <rect x="160" y="70" width="480" height="45" rx="8" fill="#fefce8" stroke="#eab308" stroke-width="1.5"/>
 <text x="400" y="90" text-anchor="middle" font-size="12" font-weight="bold" fill="#854d0e">DeFi (Aave / Uniswap)</text>
 <text x="400" y="106" text-anchor="middle" font-size="10" fill="#eab308">+1-3% APY lending or LP fees</text>

 <!-- Layer 4: Restaking -->
 <rect x="190" y="15" width="420" height="45" rx="8" fill="#faf5ff" stroke="#a855f7" stroke-width="1.5"/>
 <text x="400" y="35" text-anchor="middle" font-size="12" font-weight="bold" fill="#7c3aed">Restaking (EigenLayer)</text>
 <text x="400" y="51" text-anchor="middle" font-size="10" fill="#a855f7">+2-5% APY AVS rewards</text>

 <!-- Side labels -->
 <text x="55" y="200" text-anchor="middle" font-size="9" fill="#64748b">Risk ↓</text>
 <text x="55" y="40" text-anchor="middle" font-size="9" fill="#64748b">Risk ↑</text>
 <line x1="55" y1="55" x2="55" y2="185" stroke="#e2e8f0" stroke-width="1" marker-end="url(#arrD)" marker-start="url(#arrU)"/>
 <defs>
 <marker id="arrD" markerWidth="6" markerHeight="6" refX="3" refY="6" orient="auto"><path d="M0,0 L3,6 L6,0" fill="#e2e8f0"/></marker>
 <marker id="arrU" markerWidth="6" markerHeight="6" refX="3" refY="0" orient="auto"><path d="M0,6 L3,0 L6,6" fill="#e2e8f0"/></marker>
 </defs>
</svg>
</div>

For individual users, there is an additional barrier: 32 ETH costs roughly $100,000. Most people cannot afford a full validator.

## Liquid Staking: Lido's Solution

Lido solves both problems.

1. **Pool:** You deposit any amount of ETH (even 0.01 ETH) into Lido's smart contract.
2. **Receipt:** Lido gives you stETH - a token that represents your share of the staking pool.
3. **Rewards:** Your stETH balance automatically increases daily as the validators earn rewards.
4. **Liquidity:** You can trade stETH on DEXs, use it as collateral on Aave, or provide liquidity - all while earning staking yield.

As of 2025, Lido holds over $15B in staked ETH, making it the largest DeFi protocol by total value locked.

### Other Liquid Staking Protocols

| Protocol | Token | Mechanism |
|---|---|---|
| Lido | stETH | Rebasing (balance grows) |
| Rocket Pool | rETH | Value-accruing (price grows) |
| Coinbase | cbETH | Value-accruing (centralized) |
| Frax | sfrxETH | Value-accruing (dual token) |

The difference between **rebasing** (stETH balance increases) and **value-accruing** (rETH price increases) is cosmetic. Both achieve the same economic outcome - your position grows over time.

## Restaking: EigenLayer

EigenLayer introduced a concept called **restaking** in 2023. The idea: Ethereum validators already have ETH at stake. Why not let them use that same economic security to protect other services too?

### How It Works

1. You stake ETH normally on Ethereum (or hold stETH).
2. You opt in to EigenLayer, which lets you extend your staked ETH as security for **Actively Validated Services (AVSs)** - protocols like oracles, bridges, and data availability layers.
3. These AVSs pay you additional rewards for the security you provide.
4. In exchange, you accept additional slashing conditions. If an AVS you're securing fails or acts maliciously, a portion of your ETH can be slashed.

### The Risk Stack

Each layer adds yield and risk:

```
Layer 3: AVS rewards (EigenLayer) +2-5% APY ← slashing risk from each AVS
Layer 2: DeFi yield (Aave, Uniswap) +1-3% APY ← smart contract risk
Layer 1: ETH staking rewards (Lido) +3-4% APY ← Ethereum slashing risk
───────────────────────────────────────────────────
Base: ETH ← market price risk
```

The more layers you stack, the higher the yield - but each layer introduces a new vector where you can lose funds.

## The Centralization Concern

Lido controls roughly 28% of all staked ETH. If one entity controls too much stake, it could theoretically censor transactions or reorganize blocks. The Ethereum community actively debates concentration limits. Rocket Pool's permissionless validator model was designed specifically to address this - anyone can run a Rocket Pool node with just 8 ETH.

## Key takeaways

- Liquid staking lets you earn Ethereum staking rewards without locking your ETH. You get a receipt token (stETH, rETH) that stays tradeable.
- Restaking (EigenLayer) extends staked ETH to secure additional protocols for extra yield, at the cost of additional slashing risk.
- Stacking DeFi yield on top of staking yield on top of restaking yield creates compounding returns - and compounding risk.
- Concentration of stake in a single protocol (like Lido) is an active concern for Ethereum's decentralization.
