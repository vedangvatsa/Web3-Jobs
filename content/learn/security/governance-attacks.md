---
title: "Governance Attacks and Defenses"
description: "How governance systems get exploited, and how DAOs defend against hostile takeovers."
order: 6
readTime: "10 min"
difficulty: "advanced"
prerequisites: ["exploits"]
quiz:
  - question: "What is a governance attack?"
    options:
      - "Hacking a DAO's smart contract code."
      - "Using economic power (flash loans or token accumulation) to pass malicious governance proposals."
      - "DDoS attacking a DAO's website."
      - "Social engineering a DAO's multisig signers."
    correct: 1
    explanation: "Governance attacks exploit the voting mechanism itself. An attacker acquires enough voting power (often via flash loans) to push through proposals that drain the treasury or change protocol parameters."
  - question: "What is a common defense against flash loan governance attacks?"
    options:
      - "Removing governance entirely."
      - "Requiring token holders to lock tokens before a snapshot block to be eligible to vote."
      - "Increasing gas fees."
      - "Using proof of work for voting."
    correct: 1
    explanation: "Time-locking or snapshotting voting power before a proposal is created prevents attackers from flash-borrowing tokens to vote, since they need to hold them before the snapshot."
  - question: "How did the Beanstalk attacker use a flash loan to take over governance?"
    options:
      - "They bribed the validators."
      - "They borrowed billions in tokens within a single transaction, voted to transfer the treasury to themselves, and returned the borrowed tokens — all in one block."
      - "They hacked the voting contract."
      - "They bought all tokens on the open market."
    correct: 1
    explanation: "The attacker flash-borrowed governance tokens, used them to pass a proposal transferring $182M from the treasury, collected the funds, repaid the loan, and pocketed the difference — all within a single Ethereum transaction. The entire attack took seconds."
  - question: "What is 'quorum exploitation' in governance attacks?"
    options:
      - "Having too many voters."
      - "Passing malicious proposals when voter participation is low, because fewer tokens are needed to reach the minimum vote threshold."
      - "Voting multiple times."
      - "Bribing validators."
    correct: 1
    explanation: "If a DAO requires 10% of tokens to vote for a proposal to pass (quorum), and most token holders are inactive, an attacker needs far fewer tokens than expected. During weekends or holidays, participation drops, making quorum easier to reach with a smaller stake."
  - question: "What is a 'timelock' in governance and why is it important?"
    options:
      - "A lock on the token's price."
      - "A mandatory delay (typically 24-72 hours) between a proposal passing and its execution, giving the community time to detect and respond to malicious proposals."
      - "A lock on staking rewards."
      - "A time limit on voting."
    correct: 1
    explanation: "Without a timelock, a malicious proposal executes immediately upon passing. A 48-hour timelock gives the community time to review the proposal's on-chain actions, raise alarms, and potentially veto or exit their positions before the proposal takes effect."
---

## What Is a Governance Attack?

Most DeFi protocols are governed by token holders who vote on proposals. This is designed to be democratic. But like any democracy, it can be gamed.

A governance attack occurs when an entity acquires enough voting power to pass proposals that benefit them at the expense of other users — typically draining the treasury or changing protocol parameters.

## The Beanstalk Flash Loan Attack

In April 2022, Beanstalk (a stablecoin protocol) was attacked for $182 million. The attacker:

1. Flash-borrowed massive amounts of tokens across multiple protocols.
2. Used those tokens to gain a supermajority of governance voting power.
3. Proposed and instantly passed a malicious proposal that transferred all treasury funds to their wallet.
4. Repaid the flash loan within the same transaction.

Total cost to the attacker: about $10 in gas fees. Total stolen: $182 million.

## Attack Vectors

### Flash Loan Voting
Borrow tokens in the same block as a vote. This gives temporary but overwhelming voting power without any capital at risk.

### Vote Buying
Platforms like Convex (for Curve governance) and hidden OTC deals allow entities to accumulate voting power without buying the underlying token, through bribery and vote delegation markets.

### Low Quorum Exploitation
Many DAOs have low voter turnout. If quorum is 4% and normal participation is 3%, an attacker with just 2% of tokens can pass anything during low-activity periods (holidays, weekends).

### Proposal Spam
Flooding a DAO with dozens of complex proposals so that voters suffer fatigue and stop reviewing them carefully, allowing a malicious proposal to slip through.

## Defenses

### Time-Locked Voting
Require tokens to be locked (staked) for a minimum period before they are eligible to vote. This prevents flash-loan attacks because borrowed tokens cannot meet the lockup requirement.

### Voting Delay
Insert a mandatory delay between when a proposal is created and when voting begins. This gives the community time to review and organize opposition.

### Timelocks on Execution
Even after a proposal passes, enforce a waiting period (24-72 hours) before it can be executed. This allows the community to exit the protocol if a malicious proposal passes.

### Optimistic Governance
Assume proposals will pass unless explicitly challenged. A security council can veto dangerous proposals during the timelock window. Used by Optimism and Arbitrum.

### Quadratic Voting
Voting power scales with the square root of tokens held, not linearly. This reduces the power of whales while amplifying the voice of smaller holders.

## Key Takeaways

- Governance is an attack surface, not just a feature.
- Flash loan attacks can pass proposals in a single transaction.
- Time locks, voting delays, and snapshot mechanisms are essential defenses.
- Low quorum is dangerous — DAOs should actively incentivize voter participation.
