---
term: "Wrapped Asset"
slug: "wrapped-asset"
category: "cryptocurrencies"
difficulty: "Intermediate"
image: "https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=1200&q=80"
description: "A token representing an asset from another blockchain, created when the original asset is locked by a bridge, enabling cross-chain utilization."
relatedTerms: ["wrapped-token", "bridge", "cross-chain", "token"]
synonyms: ["bridged asset", "synthetic asset", "cross-chain token"]
---

**Wrapped assets** represent assets from other blockchains. Wrap Bitcoin into Wrapped Bitcoin (wBTC) on Ethereum: Lock 1 BTC, receive 1 wBTC. wBTC is ERC-20 token on Ethereum, behaves like ETH-based token. Use in DeFi: Provide wBTC to Curve, earn yield. Peg: 1 wBTC theoretically = 1 BTC (but can deviate slightly). Peg maintenance: If wBTC trades <$39k while BTC trades $40k, arbitrageurs buy wBTC, unwrap to BTC, profit. Wrapped assets enable cross-chain liquidity. $20B+ in wrapped assets across bridges. Wrapped assets have peg risk—if backing asset questioned, peg breaks.

## Wrapped Asset Mechanics

How wrapping works:

**Locking**: Original asset locked in custody smart contract on source chain.

**Minting**: Equivalent wrapped token minted on destination chain.

**1:1 Backing**: Wrapped token backed by locked asset. Can always unwrap.

**Transfer**: Use wrapped asset on destination chain normally.

**Unwrapping**: Burn wrapped asset, receive original asset from custody.

**Custody**: Bridge/custodian holds original asset. Custody security critical.

Wrapped assets are backed by locked originals.

## Wrapped Asset Examples

Common examples:

**Wrapped Bitcoin (wBTC)**: $4B+ supply. Most liquid Bitcoin bridge.

**Wrapped Ether**: Wrapped ETH on side-chains and other chains. ~$2B+ total.

**Wrapped Staked ETH (wstETH)**: Wrapped staked ETH from Lido. ~$10B+ supply.

**Wrapped versions**: Nearly every major token has wrapped versions on other chains.

Wrapping enables cross-chain capital allocation.

## Wrapped vs Native

Comparing asset types:

| Aspect | Native | Wrapped |
|--------|--------|---------|
| **Source** | Issued on chain | Issued on other chain |
| **Backing** | Blockchain security | Custody + bridge security |
| **Liquidity** | Native to chain | Depends on bridge adoption |
| **Peg Risk** | None | Custody failure risk |
| **Use Cases** | All | Limited to bridges |

Native assets simpler; wrapped assets enable cross-chain use.

## Wrapped Asset Risks

Potential issues:

**Custody Risk**: Bridge/custodian could steal or lose backing assets.

**Peg Risk**: Wrapped asset can trade <underlying. wBTC briefly traded $100 discount.

**Bridge Exploit Risk**: Bridge vulnerability could make wrapped asset worthless.

**Liquidity Risk**: Large unwraps could exceed available liquidity.

**Counterparty Risk**: Depends on bridge operator's integrity.

Wrapped assets have centralization risks.

## Peg Maintenance

How pegs stay stable:

**Arbitrage**: If wBTC trades <BTC, arbitrageurs buy wBTC, unwrap, sell BTC. Pushes wBTC up.

**Market Makers**: Market makers provide liquidity maintaining tight peg.

**Liquidity**: Deep liquidity pools keep wBTC price stable.

**Confidence**: If users doubt backing, peg breaks. Must maintain trust.

Pegs stable if arbitrage works and trust maintained.

## Peg Maintenance Detailed

How pegs stay stable:

**Arbitrage Economics**: If wBTC trades at $39,500 while BTC trades at $40,000, arbitrageur:
- Buys wBTC for $39,500 × 100 = $3,950,000
- Unwraps to 100 BTC
- Sells BTC for $40,000 × 100 = $4,000,000
- Profit: $50,000

Arbitrage is profitable when discount > unwrapping fees.

**Market Makers**: Maintain tight bid-ask spread. Large spreads indicate low confidence in peg.

**Liquidity Pools**: Deep liquidity (1Inch, Curve) enables large swaps without price movement. Supports peg.

**Trust in Backing**: If users doubt backing, refuse to hold wBTC at any price. Peg breaks.

**Exchange Support**: If major exchanges delist wBTC or make unwrapping hard, peg breaks. Network effects critical.

Pegs stable if arbitrage profitable and users trust backing.

## Custodial Risk Examples

Historical issues:

**Wrapped Bitcoin (wBTC)**: Custodied by Merchant (company), Kyber, and others. If compromise, $4B+ risk.

**Wrapped Staked ETH (wstETH)**: Custodied by Lido. If Lido hacked, $10B+ risk.

**Nomad Bridge Hack**: $190M drained when bridge verification bug exploited. Wrapped assets worth zero.

**Poly Network Hack**: $625M stolen. Demonstrates custodial concentration risk.

Custodial risk is serious consideration for wrapped assets.

## Career Opportunities

Wrapped asset infrastructure creates roles:

**Bridge Engineers** building bridges earn $130,000-$320,000+.

**Custodians** managing locked assets earn $110,000-$260,000+.

**Liquidity Providers** providing wrapped asset liquidity earn $50,000-$500,000+ (variable).

**Risk Managers** assessing wrapped asset risk earn $110,000-$260,000+.

**Arbitrage Traders** maintaining pegs earn $80,000-$300,000+.

**Smart Contract Auditors** auditing bridge contracts earn $100,000-$280,000+.

## Best Practices

Using wrapped assets:

**Understand Backing**: Know what backs wrapped asset.

**Monitor Bridge**: Track bridge security and TVL.

**Diversify**: Use multiple bridges rather than single dependency.

**Plan Exits**: Ensure can unwrap when needed.

**Peg Monitoring**: Alert if wrapped asset significantly deviates from peg.

## The Future of Wrapped Assets

Evolution:

**Better Bridges**: Safer, more efficient bridges.

**Native Cross-Chain**: Building native cross-chain compatibility into L1s.

**Unified Standards**: Common standards for wrapped assets.

**Real Asset Wrapping**: Wrapping real-world assets on blockchain.

## Enable Cross-Chain Capital

Wrapped assets enable capital to flow across chains. Essential infrastructure for multi-chain future. Understanding wrapped assets helps you navigate cross-chain DeFi safely. If you're interested in bridges or cross-chain infrastructure, explore [cross-chain careers](/) at bridge teams. These roles focus on safe cross-chain infrastructure.
