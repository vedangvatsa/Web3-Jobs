---
term: On-Chain Governance
slug: on-chain-governance
category: governance
difficulty: Intermediate
image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80'
description: >-
  A governance model where protocol decisions are proposed, voted on, and
  executed directly by smart contracts on the blockchain, creating transparent
  and enforceable governance.
relatedTerms:
  - governance
  - dao
  - governance-token
  - voting
synonyms:
  - protocol governance
  - onchain voting
  - smart contract governance
lastUpdated: 2026-09-04
---

## Definition

On-chain governance is a way for a blockchain protocol to make certain decisions through smart contracts. A proposal, the voting record, and the final result are stored on the chain. If a proposal passes under the contract's rules, the same system can execute the approved action without an administrator manually applying it.

The actions subject to governance vary by protocol. They can include changing a borrowing limit, adding a supported asset, allocating treasury funds, changing fees, or upgrading a contract through a controlled proxy. The rules are also code: who may submit a proposal, how long voting lasts, how many votes are required, and what happens after approval.

On-chain governance does not mean every project decision is made by token holders. It means that specified protocol controls are governed through transactions that the network can inspect and verify.

## How It Works

A governance contract usually gives voting power to holders of a governance token. It may measure the holder's balance at a recorded block, called a snapshot block, rather than at the time each vote is cast. Some systems require delegated tokens for voting. Delegation lets a holder assign voting power to another address while keeping ownership of the tokens.

A proposal commonly contains executable transaction data. For example, it can call a lending-market contract with a new collateral factor. The contract checks whether the proposer meets a threshold, then opens a voting period. Voters choose for, against, or abstain. The proposal must often meet both a majority condition and a quorum, which is a minimum level of participating voting power.

After a successful vote, a timelock may delay execution for one or more days. During that interval, users and security monitors can review the queued transaction and react to a harmful result. When the delay ends, anyone may usually send the execution transaction. The governance contract then makes the approved calls exactly as encoded, provided its permissions have not changed.

Voting can be token-weighted, where one token gives one vote. Other designs use delegated representatives, token lockups that increase voting weight over time, or quadratic methods that reduce the influence of additional tokens. Each method changes who can influence an outcome.

## Concrete Example

Suppose a lending protocol has a governance token and a contract that controls the maximum amount users may borrow against ETH. A token holder submits a proposal to lower the limit because ETH price swings have increased. The proposal specifies the exact new value and includes the contract call needed to set it.

At the snapshot block, 20 million votes are eligible. Voting stays open for five days. The rules require at least 2 million votes for quorum and more votes for than against. Three million votes participate: 2.3 million for, 500,000 against, and 200,000 abstaining. The proposal passes if abstentions count toward quorum but not the majority calculation, as defined by that protocol.

The proposal enters a two-day timelock. Users can see its code and confirm it changes only the borrowing limit. After the delay, an address calls `execute`. The governance contract calls the lending contract, and the new limit takes effect. No committee member needs to edit the setting by hand.

## Limitations And Risks

Voting power can concentrate in large holders, exchanges, founders, or investment funds. A public vote record also does not show why a voter supported a change or whether votes were coordinated through private agreements. Delegation can improve participation, but it can also concentrate influence in a small number of delegates.

Low turnout is another problem. A proposal can pass with little attention if quorum is too low. If quorum is too high, needed changes can fail because holders do not vote. Token ownership is not the same as technical or risk-management expertise, so a majority can approve a change with poorly understood consequences.

Smart contracts execute instructions, not intent. A proposal with an error can perform an unintended but valid action. Timelocks slow response to both harmful proposals and genuine emergencies. Borrowed voting power and vote buying can also distort outcomes. Controls that reduce these risks can add trust assumptions or centralization.

## Relevant Distinctions

On-chain governance differs from off-chain governance. Off-chain systems may use forums, polls, or signed messages to signal a decision, then rely on a multisignature wallet or team to carry it out. That can be cheaper and easier to change, but execution is not automatically enforced by the vote.

It also differs from a DAO as a broad organizational term. A DAO may use on-chain voting for treasury transfers, off-chain voting for social decisions, or a mix of both. Token voting is one governance mechanism, not a synonym for decentralized decision-making. Finally, a timelock is a security feature within a governance process. It is not itself a voting system.
