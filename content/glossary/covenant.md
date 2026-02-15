---
term: "Covenant"
slug: "covenant"
category: "blockchain-fundamentals"
difficulty: "Advanced"
image: "https://images.unsplash.com/photo-1554224311-beee415c15c9?w=1200&q=80"
description: "A smart contract or Bitcoin script that restricts how an output can be spent, enabling more complex spending conditions than traditional transactions."
relatedTerms: ["smart-contract", "script", "bitcoin", "utxo"]
synonyms: ["output constraint", "spending restriction", "conditional lock"]
---

**Covenants** restrict how Bitcoin outputs can be spent. Standard Bitcoin: You own Bitcoin, can spend however you want. Covenant: You own Bitcoin but can only spend it in specific ways. Example: Covenant restricting output to only be spent to one specific address. Covenants enable more complex protocols on Bitcoin—vaults, payment channels, recursion. Bitcoin doesn't natively support covenants (limited by SCRIPT language). Proposed Bitcoin upgrades (OP_CHECKTEMPLATEVERIFY) would enable covenants. Covenants are researched heavily. Covenants could dramatically expand Bitcoin programmability.

## Covenant Mechanics

How they work:

**Standard UTXO**: You own UTXO, can spend to any address, any amount.

**Covenant**: UTXO restricted: "Can only be spent to address X", or "Can only be spent in this specific transaction template".

**Verification**: When spending, Bitcoin script enforces covenant restrictions.

**Limitations**: Violating covenant makes transaction invalid.

Covenants add constraints to spending.

## Covenant Use Cases

Applications:

**Vaults**: Create Bitcoin vaults with withdrawal delays. Covenant ensures withdrawal goes through specified path.

**Payment Channels**: Covenants enable Bitcoin payment channels similar to Lightning.

**Recursion**: Covenants enable Bitcoin scripts to call themselves recursively.

**Cross-Chain**: Covenants enable atomic swaps between Bitcoin and other chains.

**Savings Accounts**: Create Bitcoin savings accounts with restrictions.

Covenants enable complex protocols on Bitcoin.

## Proposed Covenant Upgrades

Bitcoin improvements:

**OP_CHECKTEMPLATEVERIFY**: Proposed opcode verifying transaction follows specific template.

**OP_CTV**: Shorthand for OP_CHECKTEMPLATEVERIFY. Enables simple covenants.

**OP_VAULT**: Proposed opcode creating vaults with specific properties.

**OP_TXHASH**: Proposed opcode enabling more general covenants.

Each proposal has different capabilities and tradeoffs.

## Covenant Debates

Community discussion:

**Proponents' Arguments**:
- Enable important protocols (vaults, channels) currently impossible
- Improve Bitcoin flexibility for modern applications
- Relatively simple addition to SCRIPT language
- Successful precedent in other blockchains (Ethereum contracts)

**Critics' Arguments**:
- Add complexity to SCRIPT language, potential for unintended consequences
- Bitcoin philosophy is simplicity and battle-tested primitives
- Potential privacy risks (covenants could enable surveillance)
- Could enable unintended smart contract bugs at scale
- Slippery slope—if covenants allowed, what next?

**Safety Concerns**:
- Covenants enable powerful recursion. Infinite loops possible if not careful.
- Must prevent Bitcoin from becoming too smart-contract-like
- Each covenant proposal requires careful analysis of all implications

Community consensus required for controversial features like covenants.

## Covenant Activation Challenges

Technical requirements:

**Soft Fork Deployment**: Covenants likely deployed via soft fork, not hard fork.

**Activation Mechanism**: Requires validator/miner consensus activation (threshold voting).

**Backwards Compatibility**: Covenant outputs must be unspendable by old nodes (maintaining soft fork property).

**Testing**: Extensive testnet and signet testing required before mainnet.

**Community Education**: Community must understand covenants before voting.

Covenant activation is multi-year effort requiring community consensus.

## Bitcoin Script Innovation

Broader context:

**Current Script**: Bitcoin SCRIPT language is deliberately limited. Most powerful opcodes disabled (Satoshi disabled them after OP_CAT used in exploit).

**Design Philosophy**: Restricted opcodes reduce attack surface. Safer than permissive scripting.

**Covenant Impact**: Covenants would enable more general computation. More powerful = more risky.

**Smart Contract Risk**: Bitcoin philosophy resists becoming smart contract platform. Covenants push in that direction.

Covenants represent fundamental design direction for Bitcoin.

## Covenant Examples

Proposed use:

**Bitcoin Vaults**: User creates covenant requiring 2-day delay for withdrawals, preventing immediate theft.

**Payment Channels**: Covenants enable recursive channels similar to Lightning.

**Savings Accounts**: Create account where only N% per year can be withdrawn.

**Inheritance**: Create account where after fixed time, transfers to specified heirs.

Covenants enable creative Bitcoin protocols.

## Career Opportunities

Bitcoin development creates roles:

**Bitcoin Core Developers** working on protocol earn $120,000-$300,000+.

**Protocol Researchers** studying covenants earn $130,000-$320,000+.

**Application Developers** building covenant applications earn $100,000-$250,000+.

**Security Researchers** analyzing covenant safety earn $120,000-$300,000+.

## Best Practices

Following covenant developments:

**Monitor Proposals**: Stay informed on covenant proposals.

**Understand Trade-offs**: Each proposal has different implications.

**Community Engagement**: Participate in community discussions.

**Security Focus**: Prioritize safety over features.

## The Future of Covenants

Covenant evolution:

**Bitcoin Upgrade**: Likely covenant-enabling upgrade in future.

**New Protocols**: Covenants enabling entirely new protocols on Bitcoin.

**Recursive Scripts**: Potential for much more powerful scripting.

**Cross-Chain**: Covenants enabling trustless cross-chain protocols.

## Enable Complex Bitcoin Protocols

Covenants could dramatically expand Bitcoin programmability. Important proposed upgrade generating active debate. If you're interested in Bitcoin development, explore [Bitcoin careers](/) at Bitcoin teams. These roles focus on Bitcoin's evolution.
