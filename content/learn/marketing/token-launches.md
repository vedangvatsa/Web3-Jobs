---
title: "Token Launch Strategy"
description: "How Web3 protocols plan and execute token launches — from tokenomics design to exchange listings."
order: 4
readTime: "8 min"
difficulty: "intermediate"
prerequisites: ["community"]
quiz:
  - question: "What are 'tokenomics'?"
    options:
      - "The price history of a token"
      - "The design of a token's supply, distribution, vesting schedules, and utility within a protocol"
      - "A marketing strategy for promoting tokens"
      - "The legal framework for token regulation"
    correct: 1
    explanation: "Tokenomics is the economic design of a token: how many tokens exist, who gets them, when they unlock, what they're used for, and how supply changes over time. Bad tokenomics (e.g., team selling large unlocks) is one of the primary reasons tokens lose value."
  - question: "Why do teams use vesting schedules for insider token allocations?"
    options:
      - "To comply with SEC regulations"
      - "To prevent insiders from dumping tokens immediately after launch, which would crash the price and destroy user trust"
      - "Because smart contracts require vesting"
      - "To make the token more scarce"
    correct: 1
    explanation: "If a team holds 20% of tokens with no lockup, they can sell everything on day one and walk away. Vesting schedules (e.g., 12-month cliff, 36-month linear unlock) force insiders to stay aligned with the project's long-term success. Users check vesting schedules before investing."
  - question: "What is a 'cliff' in a vesting schedule?"
    options:
      - "The maximum price a token can reach"
      - "A period after launch where no insider tokens unlock at all, typically 6-12 months"
      - "The minimum amount of tokens required to vote"
      - "A type of smart contract vulnerability"
    correct: 1
    explanation: "A cliff means zero tokens unlock for a set period after launch. A '12-month cliff with 36-month linear vesting' means: no tokens for year one, then tokens unlock gradually over the next three years. This protects early buyers from immediate insider selling."
  - question: "What is a Token Generation Event (TGE)?"
    options:
      - "When a new blockchain is created"
      - "The moment a token is first minted and distributed — when it starts trading on exchanges or DEXs"
      - "A fundraising event for the development team"
      - "An airdrop to all Ethereum users"
    correct: 1
    explanation: "TGE is the launch day. The token smart contract is deployed, initial distributions occur (community allocation, liquidity pools), and trading begins. The circulating supply at TGE is a critical number — it determines initial price discovery and market cap."
  - question: "What percentage of supply is typically circulating at TGE for a well-designed token?"
    options:
      - "100%"
      - "5-15%, with the rest locked in vesting contracts"
      - "50%"
      - "0% — all tokens are locked initially"
    correct: 1
    explanation: "Most well-structured launches put 5-15% of supply in circulation at TGE (for liquidity, airdrops, and community rewards). The rest unlocks over 3-5 years. This creates a predictable supply schedule. If too much circulates at launch, there is heavy sell pressure."
---

## Token Launches Are Protocol-Defining Events

A token launch is not just a marketing milestone — it fundamentally restructures a protocol's incentives, governance, and economics. A well-executed launch aligns the community, creates sustainable liquidity, and establishes long-term value. A poorly executed launch destroys trust in hours.

## Designing Tokenomics

Before any code is written, the team must answer five questions:

### 1. Total Supply

How many tokens will ever exist? Common approaches:

- **Fixed supply** (like Bitcoin): 21 million BTC, never more. Creates scarcity.
- **Inflationary** (like Ethereum post-merge): Small issuance rate, offset by fee burning. Supply grows slowly or shrinks depending on usage.
- **Deflationary with burns**: A percentage of every transaction is burned. Supply shrinks over time.

### 2. Allocation

Who gets the tokens?

| Recipient | Typical Range | Purpose |
|---|---|---|
| Community/Ecosystem | 30-50% | Airdrops, grants, incentive programs |
| Team & Advisors | 15-25% | Compensation (always vested) |
| Investors | 10-20% | Seed, Series A (always vested) |
| Treasury | 10-20% | Protocol development fund |
| Liquidity | 5-10% | DEX trading pools at launch |

Red flag: if the team + investors hold over 50%, the community has limited governance power and faces heavy future sell pressure from insider unlocks.

### 3. Vesting Schedule

All insider tokens should vest. A standard structure:

```
Team:      12-month cliff → 36-month linear unlock
Investors: 6-month cliff  → 24-month linear unlock
Community: No cliff, distributed via usage incentives
```

Platforms like TokenUnlocks.app track vesting schedules publicly. Large unlock dates consistently correlate with price drops.

### 4. Utility

What can holders do with the token?

- **Governance:** Vote on protocol parameters (Uniswap's UNI)
- **Fee discount:** Reduced trading fees when holding the token (BNB on Binance)
- **Staking:** Lock tokens to secure the network and earn rewards (ETH)
- **Access:** Required to use certain protocol features (LINK for Chainlink oracles)

A token without clear utility is speculative by default.

### 5. Value Accrual

How does protocol revenue flow back to token holders?

- **Fee sharing:** A portion of protocol revenue is distributed to stakers (Curve's veCRV model)
- **Buyback and burn:** Protocol uses revenue to buy tokens from the open market and destroy them (reducing supply)
- **Treasury growth:** Revenue accumulates in a governance-controlled treasury

## The Launch Sequence

### Pre-Launch (Months Before)
1. Audit the token contract (ERC-20 with vesting logic).
2. Set up vesting contracts for team and investors using tools like Sablier or Hedgey.
3. Establish initial DEX liquidity — typically through a Liquidity Bootstrapping Pool (LBP) on Balancer, which starts at a high price and decreases until demand stabilizes.
4. Finalize airdrop criteria (snapshot block number, eligibility rules).

### Launch Day (TGE)
1. Deploy the token contract to mainnet.
2. Seed DEX liquidity pools (e.g., TOKEN/ETH on Uniswap).
3. Execute the airdrop — distribute tokens to eligible wallets.
4. Publish all contract addresses, tokenomics documentation, and vesting schedules publicly.

### Post-Launch (Ongoing)
1. Monitor liquidity depth — thin liquidity causes extreme price swings.
2. Track token distribution — is it concentrating in few wallets?
3. Manage governance proposals — the community now has voting power.
4. Communicate unlock schedules in advance to avoid surprise sell-offs.

## Common Mistakes

- **No vesting for insiders:** Immediate selling by team/investors destroys community trust.
- **Over-promising utility:** Claiming the token will be used for everything, then delivering nothing.
- **Insufficient initial liquidity:** If the DEX pool is too small, early buyers face extreme slippage and bots extract value.
- **Opaque allocation:** Not publishing a clear breakdown of who holds what.

## Key takeaways

- Tokenomics is the economic architecture of a token — supply, allocation, vesting, utility, and value accrual.
- Insider tokens (team, investors) must vest. Standard: 12-month cliff, 36-month unlock.
- 5-15% of supply typically circulates at TGE; the rest unlocks predictably over years.
- A token without clear utility or value accrual mechanism is pure speculation.
