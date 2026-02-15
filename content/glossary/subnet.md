---
term: "Subnet"
slug: "subnet"
category: "blockchain-fundamentals"
difficulty: "Intermediate"
image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80"
description: "A custom blockchain running on top of a validator network, sharing security with the base network while enabling specialized applications and custom configurations."
relatedTerms: ["sidechain", "layer2", "validator", "blockchain"]
synonyms: ["subchain", "custom blockchain", "application-specific chain"]
---

**Subnets** are custom blockchains running on shared validator infrastructure. Avalanche pioneered subnets. Create subnet, write custom rules, run custom validators, still inherit security from Avalanche mainnet. Example: Gaming company creates game-specific subnet for low latency and high throughput. Subnet uses same validators as mainnet but runs independently. Subnets enable specialization—optimize for specific use case (gaming, DeFi, RWA). Subnets reduce competition for blockspace on mainnet. Subnets are emerging approach enabling multi-chain ecosystems while sharing security.

## Subnet Architecture

How subnets work:

**Validator Set**: Each subnet has validator set (can be mainnet validators + additional validators).

**Custom Rules**: Subnet can implement custom consensus, execution, economic rules.

**Shared Security**: Inherit security from parent network validators.

**Independent State**: Subnet state independent from mainnet.

**Cross-Chain Bridge**: Subnets can bridge assets to mainnet and other subnets.

**Custom Virtual Machine**: Can run custom VM (EVM, custom VM, etc).

Subnets enable customization while maintaining security.

## Subnet Examples

Real implementations:

**Avalanche Subnets**: WAGMI Subnet (gaming), Core Subnet (e-commerce), others.

**Polkadot Parachains**: Similar concept to subnets (parachains share security).

**Cosmos Zones**: Independent blockchains sharing security through Hub.

**Optimism Chains**: L2 chains building on Optimism stack.

Subnets enabling multi-chain ecosystems.

## Subnet Benefits

Advantages:

**Customization**: Custom rules, parameters, virtual machines for specific use cases.

**Throughput**: Subnet gets full throughput (~4,500 TPS on Avalanche) for single application.

**Low Latency**: Reduce network size = lower latency. Important for games, real-time apps.

**Economic Model**: Custom tokenomics and incentives.

**Flexibility**: Change parameters without mainnet coordination.

Subnets enable specialized blockchains.

## Subnet Risks

Challenges:

**Validator Requirements**: Need validators to run subnet. Capital requirement.

**Security Inherited**: If parent network compromised, subnets vulnerable.

**Bridge Risk**: Cross-chain bridges add complexity and risk.

**Liquidity Fragmentation**: Fragmented liquidity across subnets.

**Coordination**: Coordinating validators across subnets complex.

Subnets add complexity while enabling customization.

## Subnet vs Sidechain vs Layer 2

Comparing models:

| Aspect | Subnet | Sidechain | Layer 2 |
|--------|--------|-----------|--------|
| **Security** | Inherited | Independent | L1 secured |
| **Consensus** | Shared validators | Own validators | L1 consensus |
| **Finality** | Subnet finality | Own finality | L1 finality |
| **Customization** | Full | Full | Limited |
| **Complexity** | Medium | High | Low |

Different models have different security/flexibility tradeoffs.

## Career Opportunities

Subnets create roles:

**Subnet Developers** building subnets earn $110,000-$260,000+.

**Protocol Designers** designing subnet mechanics earn $120,000-$300,000+.

**Validator Operators** running validators earn $60,000-$200,000+.

**Bridge Engineers** building cross-chain bridges earn $130,000-$320,000+.

**Application Developers** building on subnets earn $100,000-$250,000+.

## Best Practices

Using subnets:

**Understand Trade-offs**: Subnets enable customization but add complexity.

**Validator Participation**: Ensure sufficient validators backing subnet.

**Bridge Security**: Audit bridges between subnets.

**Liquidity**: Plan for liquidity fragmentation.

## The Future of Subnets

Evolution:

**Better Bridges**: More secure cross-subnet bridges.

**Cross-Subnet Composability**: Easier composition across subnets.

**Validator Marketplaces**: Markets for renting validators.

**Native Cross-Subnet**: Built-in cross-subnet protocols.

## Specialize Through Subnets

Subnets enable custom blockchains inheriting parent security. Important innovation for specialized applications. If you're interested in custom blockchains or application-specific chains, explore [chain development careers](/) at protocol teams. These roles focus on enabling specialized blockchain applications.
