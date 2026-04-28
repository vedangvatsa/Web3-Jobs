---
term: "Delegation"
slug: "delegation"
category: "governance"
difficulty: "Intermediate"
image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80"
description: "Transferring voting or staking power to a representative without transferring token ownership, enabling participation in governance without active involvement while maintaining token control."
relatedTerms: ["governance", "voting", "staking", "governance-token"]
synonyms: ["vote delegation", "stake delegation", "proxy voting"]
---

Delegation is the process of transferring voting or staking power to another address without giving up token ownership. This allows token holders to participate in blockchain governance indirectly. When you hold governance tokens like UNI or COMP but lack the time or expertise to evaluate every proposal, you can delegate your voting power to a trusted representative who votes on your behalf. Uniswap's governance system allows any UNI holder to delegate to community researchers or protocol politicians who specialize in analyzing proposals. You retain full ownership of your tokens and can revoke delegation at any time, reclaiming your voting rights instantly. This mechanism is critical for achieving practical decentralized governance at scale. Professionals who understand delegation dynamics are increasingly sought after for roles in protocol governance, DAO operations, and token economics design.

## How Delegation Works

The mechanism:

- **Ownership vs. Voting**: Token holder retains ownership but transfers voting power.

- **Smart Contract Delegation**: User calls smart contract: `delegate(recipient_address)`. Voting power transfers.

- **Accumulated Power**: Delegatee's total voting power equals own tokens plus delegated tokens.

- **Voting with Delegated Power**: Delegatee votes using delegated power. Token holder cannot vote while delegated.

- **Undelegation**: Delegator reclaims power anytime: `delegate(self_address)`. Voting power transfers back.

- **No Token Transfer**: Tokens remain in delegator's wallet. Only voting power transfers.

This model enables participation without requiring direct voting by every token holder.

## Delegation Applications

Uses:

- **Governance Participation**: Active governance participants accumulate delegation, gaining power to represent stakeholders.

- **Institutional Participation**: Institutions delegate to specialists who understand protocols.

- **Lazy Governance**: Token holders not interested in governance delegate to trusted parties.

- **Expertise Representation**: Researchers delegate to domain experts they trust.

- **Protocol Alignment**: Delegating to core developers or teams aligns incentives.

Delegation enables diverse participation models.

## Delegation Risks

Potential issues:

- **Delegation Concentration**: Few delegates might accumulate large power, centralizing governance.

- **Bad Delegation Decisions**: Token holders might delegate to bad actors.

- **Inactive Delegates**: Delegatees might disappear, leaving tokens unable to vote.

- **Principal-Agent Problem**: Delegatee's interests might not align with delegator's.

- **Vote Farming**: Delegates might vote based on incentives rather than protocol health.

Delegation introduces governance complexity that must be managed.

## Delegate Incentives

Why become a delegate:

- **Governance Influence**: Delegates have power to influence protocol direction.

- **Reputation**: Successful delegates build reputation, attracting more delegation.

- **Token Rewards**: Some protocols reward active delegates with additional tokens.

- **Professional Opportunity**: Some delegates work for governance services, paid by protocols.

- **Protocol Alignment**: Teams and developers delegate to represent their interests.

Delegates are motivated by influence, reputation, or compensation.

## Delegation Patterns

Observed behaviors:

- **Power Concentration**: Few delegates accumulate large voting power. Uniswap has a small number of delegates controlling a significant portion of voting power.

- **Founder Delegation**: Core teams or founders often receive substantial delegation.

- **Active Participants**: Users actively participating in governance accumulate delegation over time.

- **Sleeping Delegates**: Many token holders delegate to founders or core teams and do not reassess.

Real delegation often shows concentration rather than distributed power.

## Career Opportunities

Delegation creates roles:

- **Governance Delegates** earning fees or compensation for representing stakeholders.

- **Governance Service Providers** operating delegation platforms.

- **Governance Researchers** analyzing delegation patterns.

- **Protocol Economists** designing delegation mechanisms.

## Best Practices

Using delegation:

- **Understand Delegatee**: Know who you're delegating to and what they stand for.

- **Assess Alignment**: Ensure delegatee's interests align with yours.

- **Monitor Voting**: Check how delegatee votes with your power.

- **Diversify**: Do not delegate all tokens to a single party.

- **Reassess**: Periodically review delegation. Redelegate if needed.

- **Active Option**: If particularly interested, do not delegate; vote yourself.

## Improving Delegation

Mechanisms for better delegation:

- **Quadratic Delegation**: Voting power increases sub-linearly with delegated amounts, reducing plutocracy.

- **Delegation Revocability**: Easy revocation of delegation if delegatee votes poorly.

- **Delegation Transparency**: Clear visibility of delegatee voting history and rationale.

- **Delegation Pools**: Multiple delegates pooling power for stronger representation.

- **Retroactive Evaluation**: Assessing delegatee effectiveness and adjusting future delegation.

Better delegation mechanisms can improve governance quality.

## The Future of Delegation

Delegation evolution:

- **Automated Delegation**: Protocols auto-assigning delegation based on stakeholder preferences.

- **Dynamic Delegation**: Changing delegation based on proposal type.

- **Cross-Protocol Delegation**: Delegating voting power across multiple protocols simultaneously.

- **Delegation DAOs**: DAOs specializing in delegation, managing large voting pools.

## Represent Stakeholders

Delegation enables realistic governance where not all token holders actively participate but can delegate to trusted representatives. This improves governance quality by having specialists make decisions. If you're interested in governance, protocol design, or decentralized coordination, explore governance careers at governance protocols and governance service providers. These roles focus on improving decentralized decision-making.
