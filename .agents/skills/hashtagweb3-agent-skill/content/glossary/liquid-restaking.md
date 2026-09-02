---
term: Liquid Restaking
slug: liquid-restaking
category: defi
difficulty: intermediate
image: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1200&q=80'
description: >-
  Liquid restaking combines restaking with liquidity by issuing fungible tokens
  (Liquid Restaking Tokens or LRTs) that represent restaked positions. Users
  deposit staked assets into restaking protocols and receive tradable tokens,
  maintaining liquidity while earning staking, restaking, and DeFi yields
  simultaneously.
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

- **Liquid restaking** combines the capital efficiency of restaking with the liquidity of liquid staking tokens, enabling users to earn multiple layers of yield while maintaining asset liquidity. By depositing liquid staking tokens (like stETH or rETH) into restaking protocols and receiving Liquid Restaking Tokens (LRTs) in return, users can simultaneously earn base staking rewards, restaking rewards from AVS validation, and additional DeFi yields while keeping their assets liquid and composable.

Liquid restaking abstracts away the complexity of validator operation and AVS selection while maintaining the economic benefits of participating in Ethereum's security ecosystem.

LRTs have become a foundational DeFi primitive, integrated into lending protocols, DEX liquidity pools, and yield aggregators, creating a multi-layered yield stack that represents capital efficiency in crypto.

## How Liquid Restaking Works

The liquid restaking process follows these steps:

### For LST Holders

1. **Start with LST**: User holds a liquid staking token (stETH, rETH, cbETH, swETH, etc.) earning base staking yield.

2. **Deposit to LRT Protocol**: User deposits LST into a liquid restaking protocol (EtherFi, Puffer, Renzo, Kelp).

3. **Receive LRT**: Protocol issues a Liquid Restaking Token (eETH, pufETH, ezETH, rsETH) representing the restaked position.

4. **Automatic Restaking**: Protocol operators handle:
 - Selecting optimal AVSs to validate
 - Running required infrastructure
 - Managing slashing risks
 - Distributing rewards

5. **Earn Multiple Yields**: User now earns:
 - **Base staking yield**: From underlying ETH validation
 - **Restaking yield**: From AVS validation via EigenLayer
 - **Protocol incentives**: Token emissions from the LRT protocol
 - **DeFi yields**: By using LRT in lending, LP pools, etc.

6. **Maintain Liquidity**: LRTs can be:
 - Traded on DEXs (swapped back to ETH or other assets)
 - Used as collateral in lending protocols (Aave, Compound)
 - Deposited in liquidity pools (Curve, Uniswap)
 - Held in yield aggregators (Yearn, Pendle)

### For Protocols

LRT protocols manage the complexity on behalf of users:

- **Operator Selection**: Choose professional EigenLayer operators with good track records and security practices.

- **AVS Diversification**: Spread restaking across multiple AVSs to diversify risk and maximize yield.

- **Risk Management**: Monitor AVS health, slashing conditions, and operator performance.

- **Reward Distribution**: Collect rewards from all sources and distribute proportionally to LRT holders.

- **Liquidity Management**: Maintain exit liquidity for users who want to withdraw.

## Major Liquid Restaking Protocols

Several protocols dominate the liquid restaking market:

### EtherFi

- **Overview**: Largest LRT protocol, issues eETH.

- **Key Features**:
  - Non-custodial staking (users maintain control)
  - Decentralized operator network
  - Integrated with multiple DeFi protocols
  - ETHFI token for governance and incentives

### Puffer Finance

- **Overview**: Security-focused LRT protocol, issues pufETH.

- **Key Features**:
  - Secure-Signer technology (anti-slashing protection via secure enclaves)
  - Emphasis on decentralization and home stakers
  - Lower capital requirements for validators
  - Native restaking to EigenLayer

### Renzo Protocol

- **Overview**: Fast-growing LRT aggregator, issues ezETH.

- **Key Features**:
  - Multi-AVS exposure through curated strategies
  - Simple UX (deposit and forget)
  - Cross-chain expansion (Arbitrum, Base, Linea, BNB Chain)
  - REZ token for governance

### Kelp DAO

- **Overview**: Community-governed LRT protocol, issues rsETH.

- **Key Features**:
  - DAO-controlled AVS selection and strategy
  - Multi-LST support (stETH, ETHx, sfrxETH)
  - Focus on decentralization and governance
  - Integration with major DeFi platforms

## LRT vs LST vs Native Staking

| Aspect | Liquid Restaking (LRT) | Liquid Staking (LST) | Native Staking |
|--------|----------------------|---------------------|---------------|
| **Liquidity** | Fully liquid (tradable) | Fully liquid (tradable) | Locked (32 ETH minimum) |
| **Yield Sources** | Staking + Restaking + DeFi | Staking + small DeFi fee | Staking only |
| **Complexity** | High (multiple layers) | Medium (LST protocol) | Low (direct staking) |
| **Slashing Risk** | Higher (ETH + AVS slashing) | Standard (ETH slashing only) | Standard (ETH slashing only) |
| **Smart Contract Risk** | 3 layers (LST + LRT + DeFi) | 1 layer (LST protocol) | None (protocol native) |
| **Capital Requirement** | Any amount | Any amount | 32 ETH |
| **DeFi Composability** | Very high (LRT is token) | High (LST is token) | None (validator locked) |

## Yield Stacking with LRTs

LRTs enable sophisticated yield stacking strategies:

- **Level 1 - Base Staking**:
  - ETH staked to Beacon Chain through liquid staking protocol
  - Earns base validator rewards

- **Level 2 - Restaking Yields**:
  - LST restaked via EigenLayer to validate AVSs
  - Earns AVS validation rewards

- **Level 3 - Protocol Incentives**:
  - LRT protocol issues governance tokens (ETHFI, REZ, PUFFER, KELP)
  - Token incentives to bootstrap liquidity

- **Level 4 - DeFi Yields**:
  - Use LRT as collateral in lending
  - Provide liquidity in DEX pools
  - Deposit in yield aggregators

## Risks and Considerations

Liquid restaking introduces layered risks:

- **Slashing Risk Amplification**: Can be slashed for failures on Ethereum validation or any AVS being validated.

- **Smart Contract Risk Stacking**: Every layer adds smart contract risk:
- LST protocol (stETH, rETH contracts)
- LRT protocol (EtherFi, Puffer contracts)
- EigenLayer core contracts
- DeFi protocols using the LRT

- **Depeg Risk**: LRTs can depeg from their underlying value during market stress.

- **Liquidity Risk**: During extreme market events, LRT liquidity can evaporate, making exits difficult.

- **AVS Risk**: Untested AVSs may have bugs or slashing conditions that aren't well understood.

- **Complexity Risk**: Multiple layers of protocols mean users may not fully understand where their assets are or what risks they're exposed to.

- **Regulatory Risk**: Stacked yield products may attract regulatory scrutiny.

- **Operator Centralization**: If LRT protocols rely on a small number of EigenLayer operators, centralization risks emerge.

## LRT Integrations in DeFi

LRTs have been integrated across DeFi:

- **Lending Protocols**:
  - **Aave**: Use eETH, ezETH as collateral to borrow stablecoins.
  - **Compound**: Similar collateral use cases.

- **DEX Liquidity**:
  - **Curve**: eETH/ETH, ezETH/ETH pools with high yields.
  - **Uniswap V3**: Concentrated liquidity pools for LRTs.

- **Yield Aggregators**:
  - **Pendle**: Tokenize future yields of LRTs.
  - **Yearn**: Automated LRT strategies.

This integration makes LRTs a core primitive of modern DeFi.

## LRT Market Dynamics

The LRT market has competitive dynamics:

- **TVL Competition**: Protocols compete for TVL through:
- Higher yields
- Token incentives
- Better UX and integrations
- Security and reputation

- **Yield Optimization**: Protocols differentiate on:
- AVS selection algorithms
- Operator relationships
- Fee structures

- **Defensive Moats**:
  - **First-mover**: EtherFi captured early market share.
  - **Integrations**: Protocols deeply integrated into DeFi have network effects.
  - **Reputation**: Security track records build trust.
  - **Liquidity**: Deeper liquidity attracts more users.

## Career Opportunities in Liquid Restaking

The liquid restaking ecosystem offers specialized roles:

- **LRT Protocol Engineers**: Build core LRT infrastructure, managing operator relationships, reward distribution, and user interfaces.

- **Restaking Strategists**: Optimize AVS selection, operator delegation, and risk-reward profiles for LRT protocols.

- **DeFi Integration Engineers**: Integrate LRTs into lending, DEX, and yield aggregator protocols.

- **Risk Analysts**: Model slashing risks, smart contract risks, and develop risk frameworks for LRT exposure.

- **Tokenomics Designers**: Design token emission schedules, incentive structures, and governance models for LRT protocols.

- **Smart Contract Auditors**: Audit LRT contracts for security vulnerabilities and integration risks.

LRT expertise combines staking knowledge, EigenLayer understanding, DeFi integration, and risk management.

## Best Practices for LRT Users

When using liquid restaking:

- **Start Small**: Begin with a small position to understand the product before committing significant capital.

- **Diversify Protocols**: Spread exposure across multiple LRT protocols to reduce single-protocol risk.

- **Understand Risks**: Read documentation on slashing conditions, smart contract risks, and operator practices.

- **Monitor Yields**: Track actual vs expected yields.

- **Check Liquidity**: Ensure sufficient DEX liquidity to exit your position if needed.

- **Verify Integrations**: When using LRTs in DeFi, verify the integration is official and audited.

- **Stay Informed**: Follow LRT protocol updates and AVS launches.

- **Consider Insurance**: Evaluate insurance options for smart contract coverage.

- **Tax Awareness**: Understand tax implications of yield stacking and token emissions in your jurisdiction.

## The Future of Liquid Restaking

Liquid restaking continues to evolve:

- **Multi-Asset LRTs**: Expanding beyond ETH to BTC and other assets.

- **Cross-Chain LRTs**: LRTs available natively on multiple chains without bridging.

- **Institutional LRTs**: Compliant, institutional-grade LRT products.

- **Automated AVS Optimization**: AVS selection that dynamically adjusts based on yields and risks.

- **LRT Derivatives**: Options, futures, and structured products built on LRTs.

- **Native DeFi Integration**: Protocols building restaking directly into their architecture.

- **Standardization**: ERC standards for LRTs enabling smooth interoperability across DeFi.

Liquid restaking represents the future of staking, capital efficient, liquid, and composable. As the AVS ecosystem matures and yields stabilize, LRTs will likely become fundamental to DeFi.
