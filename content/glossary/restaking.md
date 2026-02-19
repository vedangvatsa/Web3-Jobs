---
term: "Restaking"
slug: "restaking"
category: "defi"
difficulty: "Intermediate"
image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80"
description: "Staking the same cryptocurrency across multiple protocols or services, earning additional yields by securing additional networks without increasing capital, though introducing correlated slashing risks."
relatedTerms: ["staking", "validator", "yield", "eigenlayer"]
synonyms: ["dual staking", "multi-protocol staking", "yield staking"]
---

**Restaking** is using the same cryptocurrency to secure multiple protocols simultaneously, earning yield from each while risking slashing from any. Instead of choosing a single staking opportunity, restaking enables earning yields from multiple sources with identical capital. A validator might stake 32 ETH to secure Ethereum consensus, then restake the same 32 ETH through Eigenlayer to secure additional protocols, earning both Ethereum staking rewards (~3-5% APY) and additional restaking yields (~5-10%+ additional APY). This capital efficiency is attractive but concentrates slashing risk—if any protocol the validator is restaking for is compromised, the entire 32 ETH can be slashed.

## How Restaking Works

Restaking mechanisms vary by protocol:

**Eigenlayer Model**: Currently the most sophisticated restaking protocol. Validators deposit their staked ETH into Eigenlayer smart contract, granting Eigenlayer authority to slash them on behalf of secured protocols.

**Delegation**: Eigenlayer coordinates between validators and protocols requesting security. Protocols post collateral and security requirements; validators accept risk in exchange for rewards.

**Multi-Protocol Security**: Same validator stake securing Ethereum consensus (earning base APY) + protecting Eigenlayer AVS (Active Validator Sets) like rollups, data availability services, or other protocols (earning additional AVS APY).

**Slashing Mechanism**: If validator misbehaves on secured protocol, both Ethereum and the AVS can slash. Creates compounded slashing risk.

**Reward Distribution**: Validator earns:
- Ethereum staking rewards (base)
- Eigenlayer and AVS rewards (additional)
- Risks slashing from any protocol

This multiplies potential returns at cost of multiplied slashing risk.

## Restaking Opportunities

Eigenlayer and similar protocols are securing:

**Data Availability Layers**: Protocols like Avail and Celestia might use restaking for availability confirmation.

**Rollups**: Arbitrum, Optimism, or other rollups could restake validators to improve security.

**Bridges**: Cross-chain bridges using restaking for transaction validation.

**Oracle Networks**: Chainlink or other oracle services using restaking for price feed security.

**Sidechains**: Cosmos chains or other sidechains using restaking for consensus.

**Custom Applications**: Any protocol needing strong security could use restaking.

The versatility of restaking infrastructure creates ecosystem of additional yields.

## Restaking Economics

Restaking creates interesting economic dynamics:

**Yield Stacking**: Base Ethereum yield (3-5% APY) + AVS yields (2-20% APY depending on demand) = 5-25% total potential APY. Significant returns vs. traditional finance.

**Capital Efficiency**: Single ETH earning multiple yields. No need to deploy different capital to different chains.

**Competition Dynamics**: As more validators restake, individual validator yield decreases (dilution). Market finds equilibrium.

**Risk-Adjusted Returns**: Higher yields reflect higher risks. 15% APY on restaking implies 15% slashing risk if it occurs.

**Economic Security**: Protocols can buy security by rewarding restaking. They pay validators, validators bear slashing risk.

**TVL Metrics**: Eigenlayer TVL (total value restaked) indicates how much security market believes is needed and how attractive yields are.

Restaking enables protocols to bootstrap security without building validator networks themselves.

## Restaking Risks

Restaking introduces risks absent in single-protocol staking:

**Correlated Slashing**: If multiple protocols restaking validators are compromised simultaneously, validators face slashing from multiple sources simultaneously. Worst case: multiple protocols slash, losing 100% of stake.

**Compounding Slashing**: Some proposals suggest slashing could scale nonlinearly—more simultaneous slashing = worse penalties per incident.

**Protocol Risk**: Each additional protocol increases attack surface. New protocol security might be worse than Ethereum's.

**Coordination Risk**: Restaking requires third parties (Eigenlayer) to coordinate between protocols. Third party could be compromised or make mistakes.

**Validator Overextension**: Validators might accept more risk than they understand, building up slashing exposure beyond reasonable levels.

**Liquidity Risk**: If massive slashing occurs, cannot instantly exit. Restaked capital is locked.

**Regulatory Risk**: Additional protocols might face regulatory issues. Validators could be implicated.

Current restaking (Eigenlayer) is experimental and carries substantial unquantified risks.

## Eigenlayer's Role

Eigenlayer Protocol is the primary restaking infrastructure:

**Smart Contract Layer**: Enables ETH stakers to opt-in to Eigenlayer, granting slashing authority.

**AVS Coordination**: Matches protocols needing security with validators willing to bear risk.

**Rewards**: Distributes AVS rewards to validators proportional to stake and performance.

**Slashing Execution**: Executes slashing from AVS protocols if validators misbehave.

**Governance**: Early decisions centralized, longer-term decentralization planned.

Eigenlayer is essentially a marketplace for validator security where security buyers (protocols) can purchase security from validators.

## Restaking Strategies

Validators approach restaking with different strategies:

**Conservative**: Minimal restaking, only accept security for proven protocols. Lower yields but lower risk.

**Moderate**: Restake to 2-3 established AVS, accepting reasonable risk for 8-12% additional APY.

**Aggressive**: Restake to many protocols, chasing maximum yields. Accept high slashing risk for 15-20%+ APY.

**Hedged**: Diversify across many protocols to reduce single-protocol slashing impact.

Different risk tolerances lead to different strategies.

## Restaking vs. Solo Staking

Comparing approaches:

**Solo Staking ETH**:
- Earn ~3-5% APY in staking rewards
- Single slashing risk
- Simple and straightforward
- Requires running validator infrastructure

**Staking with Service (Lido)**:
- Earn ~3.5-4% APY, split with service
- Lido manages validator, you get liquid staking token
- Relying on Lido's validator security
- Easy onboarding

**Restaking to AVS**:
- Earn ~5-25% APY depending on AVS
- Multiple slashing risks
- Experiment-stage infrastructure
- Potential for larger gains but unproven

For risk-averse, solo or service staking makes sense. For sophisticated validators comfortable with risk, restaking offers better returns.

## Historical Context and Future

Restaking is nascent:

**Eigenlayer**: Launched early 2024 on mainnet after extensive testnet. First meaningful restaking infrastructure.

**Early Validators**: Those staking in Eigenlayer early are either maximally risk-tolerant or FOMO-driven.

**Potential Catalysts**: As major protocols (rollups, DA layers) begin requesting restaking for security, demand increases and restaking becomes more mainstream.

**Risk Evolution**: As protocols request restaking, market will learn what reasonable slashing rates are. Economics will mature.

## Career Opportunities

Restaking creates sophisticated roles:

**Risk Managers** evaluating restaking protocols and slashing risk earn $120,000-$250,000+.

**Validator Operators** running sophisticated restaking strategies earn $100,000-$300,000+ depending on capital and performance.

**Protocol Engineers** building restaking infrastructure and AVS earn $150,000-$350,000+.

**Researchers** studying slashing economics and protocol security earn $130,000-$300,000+.

**Smart Contract Auditors** specializing in restaking security earn $150,000-$350,000+.

## Best Practices

Approaching restaking safely:

**Start Small**: Begin with minimal restaking to understand mechanics and risks.

**Understand Slashing**: Know exactly what slashing conditions exist and their severity.

**Risk Assessment**: Evaluate each AVS security model independently before restaking.

**Diversification**: Don't concentrate all stake in single AVS. Diversify across multiple protocols.

**Insurance**: Consider insurance/hedging if major slashing scenarios concern you.

**Monitoring**: Actively monitor restaking positions and AVS for any signs of issues.

**Regular Assessment**: Periodically re-evaluate whether additional yields justify risks.

## The Future of Restaking

Restaking evolution:

**AVS Proliferation**: More protocols requesting restaking as infrastructure matures.

**Slashing Events**: Market will test slashing mechanics. Early slashing events will educate market on real risks.

**Derivatives**: Restaking derivatives enabling exposure to yields without validator operation.

**Insurance**: Insurance products protecting against restaking slashing.

**Protocol Evolution**: Protocols might improve slashing mechanisms to be more granular and fair.

**Mainstream Adoption**: If risks prove manageable, restaking becomes standard validator revenue source.

## Maximize Validator Yield

Restaking offers significant capital efficiency for validators willing to bear additional risks. If you're interested in blockchain protocol security, validator economics, or building next-generation security infrastructure, explore [blockchain infrastructure careers](/) at Eigenlayer, protocols building AVS, and validator services. These roles focus on evolving validator economics and protocol security in more capital-efficient directions.
