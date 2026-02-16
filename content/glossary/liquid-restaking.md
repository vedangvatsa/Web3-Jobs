---
term: Liquid Restaking
slug: liquid-restaking
category: defi
difficulty: intermediate
image: https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1200&q=80
description: Liquid restaking combines restaking with liquidity by issuing fungible tokens (Liquid Restaking Tokens or LRTs) that represent restaked positions. Users deposit staked assets into restaking protocols and receive tradable tokens, maintaining liquidity while earning staking, restaking, and DeFi yields simultaneously.
relatedTerms:
  - restaking
  - liquid-staking-token
  - eigenlayer
  - staking
  - yield
synonyms:
  - LRT
  - Liquid restaking tokens
  - Restaked LST
---

# Liquid Restaking

**Liquid restaking** combines the capital efficiency of restaking with the liquidity of liquid staking tokens, creating a powerful primitive that enables users to **earn multiple layers of yield while maintaining asset liquidity**. By depositing liquid staking tokens (like stETH or rETH) into restaking protocols and receiving Liquid Restaking Tokens (LRTs) in return, users can simultaneously earn base staking rewards, restaking rewards from AVS validation, and additional DeFi yields—all while keeping their assets liquid and composable.

This innovation, pioneered by protocols like EtherFi, Puffer Finance, and Renzo, has attracted over $10 billion in total value locked as of 2026, representing a significant evolution beyond both traditional staking and first-generation restaking. Liquid restaking abstracts away the complexity of validator operation and AVS selection while maintaining the economic benefits of participating in Ethereum's expanding security ecosystem.

LRTs have become a foundational DeFi primitive, integrated into lending protocols, DEX liquidity pools, and yield aggregators, creating a multi-layered yield stack that represents the cutting edge of capital efficiency in crypto.

## How Liquid Restaking Works

The liquid restaking process follows these steps:

### For LST Holders

1. **Start with LST**: User holds a liquid staking token (stETH, rETH, cbETH, swETH, etc.) earning base staking yield (~3-4% APR)

2. **Deposit to LRT Protocol**: User deposits LST into a liquid restaking protocol (EtherFi, Puffer, Renzo, Kelp)

3. **Receive LRT**: Protocol issues a Liquid Restaking Token (eETH, pufETH, ezETH, rsETH) representing the restaked position

4. **Automatic Restaking**: Protocol operators handle:
   - Selecting optimal AVSs to validate
   - Running required infrastructure
   - Managing slashing risks
   - Distributing rewards

5. **Earn Multiple Yields**: User now earns:
   - **Base staking yield** (3-4%): From underlying ETH validation
   - **Restaking yield** (2-5%): From AVS validation via EigenLayer
   - **Protocol incentives** (varies): Token emissions from the LRT protocol
   - **DeFi yields** (varies): By using LRT in lending, LP pools, etc.

6. **Maintain Liquidity**: LRTs can be:
   - Traded on DEXs (swapped back to ETH or other assets)
   - Used as collateral in lending protocols (Aave, Compound)
   - Deposited in liquidity pools (Curve, Uniswap)
   - Held in yield aggregators (Yearn, Pendle)

### For Protocols

LRT protocols manage the complexity on behalf of users:

**Operator Selection**: Choose professional EigenLayer operators with good track records and security practices

**AVS Diversification**: Spread restaking across multiple AVSs to diversify risk and maximize yield

**Risk Management**: Monitor AVS health, slashing conditions, and operator performance

**Reward Distribution**: Collect rewards from all sources and distribute proportionally to LRT holders

**Liquidity Management**: Maintain exit liquidity for users who want to withdraw

## Major Liquid Restaking Protocols

Several protocols dominate the liquid restaking landscape:

### EtherFi

**Overview**: Largest LRT protocol with $5B+ TVL, issues eETH

**Key Features**:
- Non-custodial staking (users maintain control)
- Decentralized operator network
- Integrated with 50+ DeFi protocols
- ETHFI token for governance and incentives

**Yields**: Base staking + EigenLayer AVS rewards + ETHFI incentives = 5-10% APY

### Puffer Finance

**Overview**: Security-focused LRT protocol, issues pufETH

**Key Features**:
- Secure-Signer technology (anti-slashing protection via secure enclaves)
- Emphasis on decentralization and home stakers
- Lower capital requirements for validators (2 ETH vs 32 ETH)
- Native restaking to EigenLayer

**Yields**: Base staking + restaking + potential PUFFER token = 5-8% APY

### Renzo Protocol

**Overview**: Fast-growing LRT aggregator, issues ezETH

**Key Features**:
- Multi-AVS exposure through curated strategies
- Simple UX (deposit and forget)
- Cross-chain expansion (Arbitrum, Base, Linea, BNB Chain)
- REZ token for governance

**Yields**: Base staking + diversified AVS yields + REZ incentives = 6-12% APY

### Kelp DAO

**Overview**: Community-governed LRT protocol, issues rsETH

**Key Features**:
- DAO-controlled AVS selection and strategy
- Multi-LST support (stETH, ETHx, sfrxETH)
- Focus on decentralization and governance
- Integration with major DeFi platforms

**Yields**: Base staking + AVS yields + KELP governance incentives = 5-9% APY

## LRT vs LST vs Native Staking

| Aspect | Liquid Restaking (LRT) | Liquid Staking (LST) | Native Staking |
|--------|----------------------|---------------------|---------------|
| **Liquidity** | Fully liquid (tradable) | Fully liquid (tradable) | Locked (32 ETH minimum) |
| **Yield Sources** | Staking + Restaking + DeFi | Staking + small DeFi fee | Staking only |
| **APY** | 5-15%+ (stacked yields) | 3-4% | 3-4% |
| **Complexity** | High (multiple layers) | Medium (LST protocol) | Low (direct staking) |
| **Slashing Risk** | Higher (ETH + AVS slashing) | Standard (ETH slashing only) | Standard (ETH slashing only) |
| **Smart Contract Risk** | 3 layers (LST + LRT + DeFi) | 1 layer (LST protocol) | None (protocol native) |
| **Capital Requirement** | Any amount (from $1) | Any amount (from $1) | 32 ETH ($60k+) |
| **DeFi Composability** | Very high (LRT is token) | High (LST is token) | None (validator locked) |
| **Minimum Deposit** | $10-100 (varies by protocol) | $0.01+ (any amount) | 32 ETH |

## Yield Stacking with LRTs

LRTs enable sophisticated yield stacking strategies:

**Level 1 - Base Staking** (3-4% APY):
- ETH staked to Beacon Chain through liquid staking protocol
- Earns base validator rewards

**Level 2 - Restaking Yields** (2-5% APY):
- LST restaked via EigenLayer to validate AVSs
- Earns AVS validation rewards (varies by AVS selection)

**Level 3 - Protocol Incentives** (2-8% APY):
- LRT protocol issues governance tokens (ETHFI, REZ, PUFFER, KELP)
- Token incentives to bootstrap liquidity and TVL

**Level 4 - DeFi Yields** (3-10%+ APY):
- Use LRT as collateral in lending (Aave: earn interest on borrowed stables)
- Provide liquidity in DEX pools (Curve, Uniswap: earn trading fees + LP incentives)
- Deposit in yield aggregators (Yearn, Pendle: optimized strategies)

**Total Potential APY**: 10-25%+ depending on strategy and market conditions

**Example Stack**:
1. Buy 10 ETH worth of stETH (earns 3.5% APY)
2. Deposit stETH into EtherFi, receive 10 eETH (adds 3% restaking yield)
3. Deposit eETH in Pendle PT-eETH pool (adds 5% from Pendle incentives)
4. Total yield: 11.5% APY on original ETH, fully liquid via PT-eETH tokens

## Risks and Considerations

Liquid restaking introduces layered risks:

**Slashing Risk Amplification**: Can be slashed for failures on Ethereum validation OR any AVS being validated—double (or triple+) jeopardy.

**Smart Contract Risk Stacking**: Every layer adds smart contract risk:
- LST protocol (stETH, rETH contracts)
- LRT protocol (EtherFi, Puffer contracts)
- EigenLayer core contracts
- DeFi protocols using the LRT (Aave, Curve, etc.)

**Depeg Risk**: LRTs can depeg from their underlying value during market stress, similar to LST depegs but potentially worse due to added complexity.

**Liquidity Risk**: During extreme market events, LRT liquidity can evaporate, making exits difficult or requiring large slippage.

**AVS Risk**: Untested AVSs may have bugs, economic exploits, or slashing conditions that aren't well understood.

**Complexity Risk**: Multiple layers of protocols mean users may not fully understand where their assets are or what risks they're exposed to.

**Regulatory Risk**: Stacked yield products may attract regulatory scrutiny as potentially being securities or leveraged products.

**Operator Centralization**: If LRT protocols rely on a small number of EigenLayer operators, centralization risks emerge.

## LRT Integrations in DeFi

LRTs have been rapidly integrated across DeFi:

**Lending Protocols**:
- **Aave**: Use eETH, ezETH as collateral to borrow stablecoins
- **Compound**: Similar collateral use cases
- **Morpho**: Peer-to-peer lending with LRT collateral

**DEX Liquidity**:
- **Curve**: eETH/ETH, ezETH/ETH pools with high yields
- **Uniswap V3**: Concentrated liquidity pools for LRTs
- **Balancer**: Weighted pools with multiple LRTs

**Yield Aggregators**:
- **Pendle**: Tokenize future yields of LRTs (PT-eETH, YT-eETH)
- **Yearn**: Automated LRT strategies
- **Convex/Aura**: Boosted yields on LRT liquidity pools

**Derivatives**:
- **Index Protocols**: LRT indexes (baskets of eETH, pufETH, ezETH)
- **Options**: Covered call strategies on LRTs (Ribbon, Aevo)
- **Leveraged Positions**: Borrow against LRT to buy more LRT (leveraged restaking)

This deep integration makes LRTs a core primitive of modern DeFi.

## LRT Market Dynamics

The LRT market has interesting competitive dynamics:

**TVL Competition**: Protocols compete for TVL through:
- Higher yields (more aggressive AVS selection)
- Token incentives (emissions programs)
- Better UX and integrations
- Security and reputation

**Yield Optimization**: Protocols differentiate on:
- AVS selection algorithms
- Operator relationships
- Fee structures (lower fees = higher user yields)
- Additional revenue sources (MEV, liquidations, etc.)

**Defensive Moats**:
- **First-mover**: EtherFi captured early market share
- **Integrations**: Protocols deeply integrated into DeFi have network effects
- **Reputation**: Security track records build trust
- **Liquidity**: Deeper liquidity attracts more users

**Market Share** (as of 2026):
- EtherFi: ~40%
- Renzo: ~25%
- Puffer: ~15%
- Kelp: ~10%
- Others: ~10%

## Career Opportunities in Liquid Restaking

The liquid restaking ecosystem offers specialized roles:

**LRT Protocol Engineers** ($180,000 - $400,000+): Build core LRT infrastructure, managing operator relationships, reward distribution, and user interfaces.

**Restaking Strategists** ($160,000 - $360,000+): Optimize AVS selection, operator delegation, and risk-reward profiles for LRT protocols.

**DeFi Integration Engineers** ($170,000 - $380,000+): Integrate LRTs into lending, DEX, and yield aggregator protocols.

**Risk Analysts** ($140,000 - $320,000+): Model slashing risks, smart contract risks, and develop risk frameworks for LRT exposure.

**Tokenomics Designers** ($150,000 - $340,000+): Design token emission schedules, incentive structures, and governance models for LRT protocols.

**Smart Contract Auditors** ($170,000 - $400,000+): Audit LRT contracts for security vulnerabilities, economic exploits, and integration risks.

LRT expertise combines staking knowledge, EigenLayer understanding, DeFi integration, and risk management.

## Best Practices for LRT Users

When using liquid restaking:

**Start Small**: Begin with a small position to understand the product before committing significant capital.

**Diversify Protocols**: Spread exposure across multiple LRT protocols (EtherFi, Puffer, Renzo) to reduce single-protocol risk.

**Understand Risks**: Read documentation on slashing conditions, smart contract risks, and operator practices.

**Monitor Yields**: Track actual vs expected yields—significant deviations may indicate issues.

**Check Liquidity**: Ensure sufficient DEX liquidity to exit your position if needed (check Curve/Uniswap depth).

**Verify Integrations**: When using LRTs in DeFi, verify the integration is official and audited.

**Stay Informed**: Follow LRT protocol updates, AVS launches, and EigenLayer developments.

**Consider Insurance**: Evaluate insurance options (Nexus Mutual, InsurAce) for smart contract coverage.

**Tax Awareness**: Understand tax implications of yield stacking and token emissions in your jurisdiction.

## The Future of Liquid Restaking

Liquid restaking continues to evolve:

**Multi-Asset LRTs**: Expanding beyond ETH to BTC (via Babylon), SOL, and other assets.

**Cross-Chain LRTs**: LRTs available natively on multiple chains (Arbitrum, Base, Optimism) without bridging.

**Institutional LRTs**: Compliant, institutional-grade LRT products with KYC, custody, and reporting.

**Automated AVS Optimization**: AI-driven AVS selection that dynamically adjusts based on yields and risks.

**LRT Derivatives**: Options, futures, and structured products built on LRTs.

**Native DeFi Integration**: Protocols building restaking directly into their architecture (native LRT support in lending, DEXs).

**Standardization**: ERC standards for LRTs enabling seamless interoperability across DeFi.

Liquid restaking represents the future of staking—capital efficient, liquid, and composable. As the AVS ecosystem matures and yields stabilize, LRTs will likely become as fundamental to DeFi as LSTs are today.

**Ready to explore liquid restaking?** Start with a reputable protocol like EtherFi or Puffer, begin with conservative exposure, and gradually build understanding of the restaking ecosystem and AVS landscape.
