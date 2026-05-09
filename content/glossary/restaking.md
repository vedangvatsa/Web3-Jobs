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

Restaking is the practice of using already-staked cryptocurrency to secure additional protocols simultaneously, multiplying yield opportunities without deploying more capital. When a validator stakes 32 ETH to participate in Ethereum consensus, they can then restake that same collateral through platforms like EigenLayer to provide security for other decentralized services, earning rewards from multiple sources at once. However, restaking introduces correlated slashing risks, meaning that if any of the secured protocols experiences a fault or attack, the validator's entire stake can be penalized across all commitments. The growth of restaking protocols has created strong demand for professionals who understand validator economics, risk modeling, and the technical architecture of shared security systems across Web3 organizations.

## How Restaking Works

Restaking mechanisms vary by protocol:

- **Eigenlayer Model**: Currently the most sophisticated restaking protocol. Validators deposit their staked ETH into Eigenlayer smart contract, granting Eigenlayer authority to slash them on behalf of secured protocols.

- **Delegation**: Eigenlayer coordinates between validators and protocols requesting security. Protocols post collateral and security requirements; validators accept risk in exchange for rewards.

- **Multi-Protocol Security**: Same validator stake securing Ethereum consensus (earning base APY) plus protecting Eigenlayer AVS (Active Validator Sets) like rollups, data availability services, or other protocols (earning additional AVS APY).

- **Slashing Mechanism**: If a validator misbehaves on a secured protocol, both Ethereum and the AVS can slash. This creates compounded slashing risk.

- **Reward Distribution**: Validator earns:
- Ethereum staking rewards (base)
- Eigenlayer and AVS rewards (additional)
- Risks slashing from any protocol

This multiplies potential returns at the cost of multiplied slashing risk.

## Restaking Opportunities

Eigenlayer and similar protocols are securing:

- **Data Availability Layers**: Protocols like Avail and Celestia might use restaking for availability confirmation.

- **Rollups**: Arbitrum, Optimism, or other rollups could restake validators to improve security.

- **Bridges**: Cross-chain bridges using restaking for transaction validation.

- **Oracle Networks**: Chainlink or other oracle services using restaking for price feed security.

- **Sidechains**: Cosmos chains or other sidechains using restaking for consensus.

- **Custom Applications**: Any protocol needing strong security could use restaking.

The versatility of restaking infrastructure creates an ecosystem of additional yields.

## Restaking Economics

Restaking creates interesting economic dynamics:

- **Yield Stacking**: Base Ethereum yield plus AVS yields equals total potential APY. Significant returns compared to traditional finance.

- **Capital Efficiency**: Single ETH earning multiple yields. No need to deploy different capital to different chains.

- **Competition Dynamics**: As more validators restake, individual validator yield decreases. The market finds equilibrium.

- **Risk-Adjusted Returns**: Higher yields reflect higher risks. A higher APY on restaking implies a corresponding slashing risk if it occurs.

- **Economic Security**: Protocols can buy security by rewarding restaking. They pay validators, who bear slashing risk.

- **TVL Metrics**: Eigenlayer TVL indicates how much security the market believes is needed and how attractive yields are.

Restaking enables protocols to bootstrap security without building validator networks themselves.

## Restaking Risks

Restaking introduces risks absent in single-protocol staking:

- **Correlated Slashing**: If multiple protocols restaking validators are compromised simultaneously, validators face slashing from multiple sources. In the worst case, multiple protocols could slash, losing the entire stake.

- **Compounding Slashing**: Some proposals suggest slashing could scale nonlinearly; more simultaneous slashing results in worse penalties per incident.

- **Protocol Risk**: Each additional protocol increases the attack surface. New protocol security might be worse than Ethereum's.

- **Coordination Risk**: Restaking requires third parties (Eigenlayer) to coordinate between protocols. A third party could be compromised or make mistakes.

- **Validator Overextension**: Validators might accept more risk than they understand, building up slashing exposure beyond reasonable levels.

- **Liquidity Risk**: If massive slashing occurs, validators cannot instantly exit. Restaked capital is locked.

- **Regulatory Risk**: Additional protocols might face regulatory issues. Validators could be implicated.

Current restaking is experimental and carries substantial unquantified risks.

## Eigenlayer's Role

Eigenlayer Protocol is the primary restaking infrastructure:

- **Smart Contract Layer**: Enables ETH stakers to opt-in to Eigenlayer, granting slashing authority.

- **AVS Coordination**: Matches protocols needing security with validators willing to bear risk.

- **Rewards**: Distributes AVS rewards to validators proportional to stake and performance.

- **Slashing Execution**: Executes slashing from AVS protocols if validators misbehave.

- **Governance**: Early decisions are centralized, with longer-term decentralization planned.

Eigenlayer is a marketplace for validator security where security buyers (protocols) can purchase security from validators.

## Restaking Strategies

Validators approach restaking with different strategies:

- **Conservative**: Minimal restaking, only accept security for proven protocols. Lower yields but lower risk.

- **Moderate**: Restake to 2-3 established AVS, accepting reasonable risk for additional APY.

- **Aggressive**: Restake to many protocols, chasing maximum yields. Accept high slashing risk for higher APY.

- **Hedged**: Diversify across many protocols to reduce single-protocol slashing impact.

Different risk tolerances lead to different strategies.

## Restaking vs. Solo Staking

Comparing approaches:

- **Solo Staking ETH**:
- Earn staking rewards
- Single slashing risk
- Simple and straightforward
- Requires running validator infrastructure

- **Staking with Service (Lido)**:
- Earn staking rewards, split with service
- Lido manages validator, you receive a liquid staking token
- Relying on Lido's validator security
- Easy onboarding

- **Restaking to AVS**:
- Earn APY depending on AVS
- Multiple slashing risks
- Experiment-stage infrastructure
- Potential for larger gains but unproven

For risk-averse individuals, solo or service staking makes sense. For sophisticated validators comfortable with risk, restaking offers better returns.

## Historical Context and Future

Restaking is nascent:

- **Eigenlayer**: Launched on mainnet after extensive testnet. First meaningful restaking infrastructure.

- **Early Validators**: Those staking in Eigenlayer early are either maximally risk-tolerant or driven by market trends.

- **Potential Catalysts**: As major protocols begin requesting restaking for security, demand increases and restaking becomes more mainstream.

- **Risk Evolution**: As protocols request restaking, the market will learn what reasonable slashing rates are. Economics will mature.

## Career Opportunities

Restaking creates sophisticated roles:

- **Risk Managers** evaluating restaking protocols and slashing risk.

- **Validator Operators** running sophisticated restaking strategies.

- **Protocol Engineers** building restaking infrastructure and AVS.

- **Researchers** studying slashing economics and protocol security.

- **Smart Contract Auditors** specializing in restaking security.

## Best Practices

Approaching restaking safely:

- **Start Small**: Begin with minimal restaking to understand mechanics and risks.

- **Understand Slashing**: Know exactly what slashing conditions exist and their severity.

- **Risk Assessment**: Evaluate each AVS security model independently before restaking.

- **Diversification**: Don't concentrate all stake in a single AVS. Diversify across multiple protocols.

- **Insurance**: Consider insurance or hedging if major slashing scenarios concern you.

- **Monitoring**: Actively monitor restaking positions and AVS for any signs of issues.

- **Regular Assessment**: Periodically re-evaluate whether additional yields justify risks.

## The Future of Restaking

Restaking evolution:

- **AVS Proliferation**: More protocols requesting restaking as infrastructure matures.

- **Slashing Events**: The market will test slashing mechanics. Early slashing events will educate the market on real risks.

- **Derivatives**: Restaking derivatives enabling exposure to yields without validator operation.

- **Insurance**: Insurance products protecting against restaking slashing.

- **Protocol Evolution**: Protocols might improve slashing mechanisms to be more granular and fair.

- **Mainstream Adoption**: If risks prove manageable, restaking may become a standard validator revenue source.

## Maximize Validator Yield

Restaking offers significant capital efficiency for validators willing to bear additional risks. If you're interested in blockchain protocol security, validator economics, or building modern security infrastructure, explore [blockchain infrastructure careers](/) at Eigenlayer, protocols building AVS, and validator services. These roles focus on evolving validator economics and protocol security in more capital-efficient directions.
