---
title: "DAOs: Internet Organizations"
description: "How decentralized autonomous organizations work, vote, and manage money."
order: 13
readTime: "8 min"
difficulty: "beginner"
prerequisites: ["nfts"]
quiz:
 - question: "What is a DAO?"
 options:
 - "A type of cryptocurrency"
 - "A digital autonomous organization where decisions are made by token holders through voting"
 - "A blockchain consensus mechanism"
 - "A government regulatory body"
 correct: 1
 explanation: "A DAO (Decentralized Autonomous Organization) is a group organized through smart contracts. Token holders vote on proposals — how to spend money, change rules, or update the protocol."
 - question: "How are decisions typically made in a DAO?"
 options:
 - "A CEO decides"
 - "The blockchain automatically decides"
 - "Token holders submit and vote on proposals"
 - "Employees vote in meetings"
 correct: 2
 explanation: "Anyone with governance tokens can submit a proposal. Token holders vote yes or no. If the proposal passes (meets quorum and majority), the smart contract executes it automatically."
 - question: "What is a 'treasury' in a DAO?"
 options:
 - "A government reserve"
 - "A pool of funds controlled by the DAO's smart contract, spent through governance votes"
 - "The personal wallet of the DAO's founder"
 - "A type of stablecoin"
 correct: 1
 explanation: "A DAO treasury is a pool of tokens held in a smart contract. The funds can only be spent when a governance vote approves it. Some DAOs manage treasuries worth hundreds of millions of dollars."
 - question: "What is a common challenge DAOs face?"
 options:
 - "They cannot hold money"
 - "Low voter participation — most token holders do not vote"
 - "They cannot be created on Ethereum"
 - "They are illegal everywhere"
 correct: 1
 explanation: "Voter apathy is the biggest challenge for DAOs. In many DAOs, fewer than 5% of token holders participate in governance votes, which means a small minority makes decisions for the entire community."
 - question: "Which of these is a real DAO?"
 options:
 - "Google"
 - "Uniswap governance (UNI holders vote on protocol changes)"
 - "The US Federal Reserve"
 - "Apple shareholders"
 correct: 1
 explanation: "Uniswap's governance is a DAO. UNI token holders can propose and vote on fee changes, treasury spending, and protocol upgrades. All votes happen on-chain."
---

## Companies without a CEO

A traditional company has a hierarchy: CEO makes decisions, board approves, employees execute. A DAO replaces this with code and votes.

In a DAO, token holders are the decision-makers. They propose changes, vote on them, and if a proposal passes, a smart contract executes it. No CEO. No board. No headquarters.

<div class="diagram">
<svg viewBox="0 0 800 220" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
 <!-- Traditional -->
 <rect x="20" y="20" width="340" height="180" rx="12" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
 <text x="190" y="48" text-anchor="middle" font-size="14" font-weight="bold" fill="#991b1b">Traditional Company</text>
 <rect x="140" y="60" width="100" height="35" rx="6" fill="#fee2e2" stroke="#fca5a5"/>
 <text x="190" y="82" text-anchor="middle" font-size="11" fill="#991b1b">CEO</text>
 <line x1="140" y1="95" x2="110" y2="115" stroke="#fca5a5" stroke-width="1.5"/>
 <line x1="240" y1="95" x2="270" y2="115" stroke="#fca5a5" stroke-width="1.5"/>
 <rect x="60" y="115" width="100" height="30" rx="4" fill="#fee2e2" stroke="#fca5a5"/>
 <text x="110" y="135" text-anchor="middle" font-size="10" fill="#991b1b">Managers</text>
 <rect x="220" y="115" width="100" height="30" rx="4" fill="#fee2e2" stroke="#fca5a5"/>
 <text x="270" y="135" text-anchor="middle" font-size="10" fill="#991b1b">Managers</text>
 <text x="190" y="175" text-anchor="middle" font-size="11" fill="#64748b">Top-down decisions</text>

 <!-- DAO -->
 <rect x="420" y="20" width="340" height="180" rx="12" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
 <text x="590" y="48" text-anchor="middle" font-size="14" font-weight="bold" fill="#166534">DAO</text>
 <circle cx="530" cy="90" r="18" fill="#dcfce7" stroke="#86efac"/>
 <text x="530" y="95" text-anchor="middle" font-size="10" fill="#166534">Vote</text>
 <circle cx="590" cy="70" r="18" fill="#dcfce7" stroke="#86efac"/>
 <text x="590" y="75" text-anchor="middle" font-size="10" fill="#166534">Vote</text>
 <circle cx="650" cy="90" r="18" fill="#dcfce7" stroke="#86efac"/>
 <text x="650" y="95" text-anchor="middle" font-size="10" fill="#166534">Vote</text>
 <circle cx="560" cy="130" r="18" fill="#dcfce7" stroke="#86efac"/>
 <text x="560" y="135" text-anchor="middle" font-size="10" fill="#166534">Vote</text>
 <circle cx="620" cy="130" r="18" fill="#dcfce7" stroke="#86efac"/>
 <text x="620" y="135" text-anchor="middle" font-size="10" fill="#166534">Vote</text>
 <text x="590" y="175" text-anchor="middle" font-size="11" fill="#64748b">Token holders decide together</text>
</svg>
</div>

## How a DAO vote works

1. **Proposal**: A token holder writes a proposal (e.g., "Spend $2M from treasury on a marketing campaign")
2. **Discussion**: The community discusses it on a forum (often Discourse or Snapshot)
3. **Vote**: Token holders vote with their tokens. More tokens = more voting power
4. **Execution**: If the vote passes (meets quorum and majority), the smart contract executes the action

Most DAOs require a **quorum** — a minimum percentage of tokens must participate for the vote to be valid. This prevents small groups from pushing proposals through when nobody is paying attention.

## Real DAOs today

| DAO | Governance token | Treasury | What they govern |
| --- | --- | --- | --- |
| Uniswap | UNI | ~$2B | DEX protocol fees and upgrades |
| Aave | AAVE | ~$100M | Lending risk parameters |
| MakerDAO | MKR | ~$3B | DAI stablecoin stability |
| Lido | LDO | ~$300M | ETH staking protocol |
| ENS | ENS | ~$100M | Ethereum Name Service pricing |

## The challenges

DAOs are an experiment. They work, but not perfectly:

**Low participation**: Most token holders do not vote. Typical participation rates are 2-10%. This concentrates power in the hands of a few large holders (whales).

**Speed**: Governance votes take days or weeks. A traditional company CEO can make a decision in hours. This matters during emergencies.

**Coordination**: Reaching consensus among thousands of anonymous token holders is hard. DAOs often struggle to make unpopular but necessary decisions.

**Plutocracy risk**: More tokens = more votes. Wealthy holders have disproportionate influence, which is not so different from traditional shareholder governance.

## Key takeaways

- DAOs are organizations governed by token holders through on-chain voting.
- Governance follows a cycle: propose → discuss → vote → execute.
- Major protocols (Uniswap, Aave, MakerDAO) are governed by DAOs managing billions.
- Low voter participation and whale dominance are ongoing challenges.
