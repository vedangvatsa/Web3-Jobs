---
term: "Proof of Authority"
slug: "proof-of-authority"
category: "consensus-mechanism"
difficulty: "Intermediate"
image: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=1200&q=80"
description: "A consensus mechanism where designated trusted validators create blocks and validate transactions, sacrificing decentralization for efficiency and speed in private or semi-public blockchains."
relatedTerms: ["consensus-mechanism", "proof-of-stake", "validator", "blockchain"]
synonyms: ["PoA", "trusted validator consensus", "designated validator"]
---

**Proof of Authority (PoA)** is a consensus mechanism where a set of approved validators create blocks and validate transactions. Instead of requiring computational work (PoW) or staking capital (PoS), PoA relies on validator identity and reputation. Validators are pre-approved, known entities risking reputation if they misbehave. If validator cheats, they lose approval and reputation damage. PoA enables fast, efficient consensus (blocks every few seconds, minimal fees) but sacrifices decentralization—centralized to whoever approved the validators. PoA is used in private blockchains, testnets (Ropsten, Goerli), and some sidechains, but is unsuitable for decentralized public blockchains.

## How PoA Works

The mechanism:

**Validator Selection**: Set of trusted, pre-approved validators are designated to create blocks.

**Block Creation**: Validators take turns creating blocks. Each block is signed by creator.

**Validation**: Other validators verify signature belongs to approved validator.

**Consensus**: Block is accepted if signed by approved validator. No mining competition.

**Misbehavior Handling**: If validator signs conflicting blocks or otherwise misbehaves, they can be removed from validator set.

**Finality**: Blocks are final after being included. No risk of reorg.

Speed and efficiency are PoA's strengths—no computational work needed, no PoS capital requirement.

## PoA Characteristics

Defining traits:

**Centralized Approval**: Who decides which validators are approved? Usually central authority, making PoA centralized.

**Identity-Based**: Validators must reveal identity. Reputational risk deters misbehavior.

**Fast Blocks**: Seconds per block, minimal latency. Orders of magnitude faster than PoW/PoS.

**Low Fees**: Minimal resource usage means minimal fees.

**Energy Efficient**: No computational work means essentially zero energy usage.

**Validator Set Risk**: If all approved validators collude, they can attack network. Risk concentrated to small set.

**Permissioned**: Blockchains using PoA are permissioned—only approved validators can participate.

PoA is designed for speed and efficiency in private/controlled settings, not for trustless public consensus.

## PoA Examples

Practical implementations:

**Ethereum Testnets** (Goerli, Sepolia): Ethereum's public testnets use PoA. Testers get free ETH from faucets. Consensus is by designated validators.

**VeChain (VET)**: Public blockchain using PoA for fast, efficient transactions. ~6 second blocks.

**Aura** (Substrate): Proof-of-Authority for Substrate-based chains.

**Polygon PoS** (Pre-Polygon 2.0): Polygon sidechain used PoA for validator management initially.

**Binance Smart Chain** (BSC): Initially used PoA with Binance-approved validators.

Many public chains use PoA initially for speed during early days, planning transition to more decentralized consensus.

## PoA Risks

Inherent risks:

**Centralized Control**: Validator approval is centralized. Whoever controls approval controls consensus.

**Collusion**: If validators collude, they can attack network, double-spend, rewrite history.

**Validator Theft**: Approved validators could steal funds without consequence if removing them is slow.

**Governance Capture**: Central authority approving validators might be captured, leading to bad validator selection.

**No Trustlessness**: Fundamentally requires trusting validators. Not truly decentralized.

**Single Point of Failure**: Disappearance of central authority leaves chain in limbo.

PoA is suitable only where centralization risk is acceptable.

## PoA Adoption Patterns

How blockchains use PoA:

**Testnets**: Used for public testnets. Safe because failure doesn't risk real funds.

**Early Stages**: Many new chains start with PoA for speed, planning transition to PoS/PoW.

**Private Blockchains**: Enterprise blockchains use PoA for controlled, fast consensus.

**Sidechains**: Sidechain often uses PoA for speed, with cross-chain bridge providing security.

**Governance Sidechains**: Using PoA for governance-specific chains handling voting efficiently.

PoA sees use in specific contexts where decentralization isn't paramount.

## PoA vs. Other Mechanisms

Comparing approaches:

| Mechanism | Decentralization | Speed | Energy | Finality |
|-----------|-----------------|-------|--------|----------|
| **PoA** | Very Low | Very Fast | Very Low | Instant |
| **PoS** | High | Fast | Low | Minutes |
| **PoW** | High | Slow | High | Probabilistic |

PoA optimizes for speed and efficiency at cost of decentralization.

## Transitioning Away from PoA

Chains moving to decentralized consensus:

**Ethereum**: Goerli testnet planning transition from PoA to more decentralized mechanism.

**Polygon**: Transitioning from PoA toward more decentralized validation.

**Binance Chain**: Planned to transition toward more decentralized consensus.

As blockchains mature, they often seek to decentralize beyond PoA.

## Career Opportunities

PoA creates specific roles:

**PoA Validator Operators** running approved validators earn $80,000-$200,000+.

**Governance Coordinators** managing validator approval earn $80,000-$180,000+.

**Client Developers** implementing PoA earn $130,000-$280,000+.

**Protocol Designers** improving PoA earn $130,000-$300,000+.

## Best Practices

Using PoA blockchains:

**Understand Risks**: PoA chains are centralized. Accept this risk or avoid.

**Monitor Validators**: Know who validators are and assess their trustworthiness.

**Diversify Chains**: Don't concentrate assets in single PoA chain.

**Plan Transitions**: If using PoA chain, understand their plan for future decentralization.

## The Future of PoA

PoA evolution:

**Better Validator Selection**: More sophisticated mechanisms for selecting and approving validators.

**Multi-Chain PoA**: Using PoA for specific functions while maintaining PoS consensus overall.

**Delegation**: Delegating validation to approved parties while majority decides approval.

**Regulatory PoA**: Potential PoA mechanisms designed specifically for regulatory compliance.

## Centralized for Speed

Proof of Authority enables fast, efficient consensus in controlled settings but sacrifices decentralization and trustlessness. If you're interested in blockchain infrastructure, consensus design, or enterprise blockchain, explore [blockchain engineering careers](/) at enterprise blockchain firms and platforms using PoA. These roles focus on building efficient consensus suitable for specific use cases.
