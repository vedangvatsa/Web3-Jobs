---
term: "Wrapped Token"
slug: "wrapped-token"
category: "cryptocurrencies"
difficulty: "Beginner"
image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80"
description: "A token representing an external asset (another cryptocurrency or asset) locked in a smart contract, enabling that asset to be used on different blockchains or within protocols."
relatedTerms: ["token", "bridge", "cross-chain-bridge", "ethereum"]
synonyms: ["synthetic token", "pegged token", "bridged token"]
---

**Wrapped tokens** are cryptocurrency tokens representing other assets locked in smart contracts. Wrapping enables using assets on different blockchains or within protocols not natively supporting them. Deposit 1 Bitcoin on Ethereum, receive 1 WBTC (wrapped Bitcoin), which can be used in DeFi. WBTC is backed 1:1 by actual Bitcoin held in custody. You can always unwrap by burning WBTC and receiving original BTC back. Wrapped tokens enable capital efficiency—billions in wrapped Bitcoin and Ethereum are deployed in DeFi, earning yields unavailable on native blockchains.

## How Wrapping Works

The mechanism is straightforward:

**Asset Lock**: You deposit original asset (Bitcoin, Ethereum, etc.) into smart contract on custodian's system.

**Custodian Safeguard**: Custodian (Wrapped Bitcoin's Coinbase/BitGo, for example) securely holds deposited asset.

**Token Issue**: Smart contract on destination blockchain issues equivalent amount of wrapped token. 1 BTC locked = 1 WBTC issued.

**User Possession**: You now own wrapped tokens on destination chain, use them however you want (trade, lend, stake, etc.).

**Unwrapping**: Burn wrapped tokens on destination chain, custodian releases original asset to your address on source chain.

**Trust in Custodian**: You trust custodian holds assets honestly, hasn't been hacked, won't disappear.

## Types of Wrapped Tokens

Different wrapper designs:

**Custodial Wrapped (WBTC, WETH on L2s)**: Trusted custodian holds original asset. Centralized but simple. Risk is custodian security/honesty.

**Multi-Sig Wrapped**: Multiple independent custodians must cooperate to move assets. More security but more complex.

**Atomic Wrapped**: Smart contracts manage wrapping across compatible blockchains (Polkadot's XCMP). Less custodial but requires compatible chain infrastructure.

**Decentralized Wrapped**: Decentralized networks of validators guard custody, enabling wrapped tokens without single custodian. Complex and immature.

Different designs make different security/efficiency tradeoffs.

## Popular Wrapped Tokens

Massive wrapped asset ecosystem:

**Wrapped Bitcoin (WBTC)**: $3B+ supply, largest wrapped asset. Backed by Coinbase, BitGo custody.

**Wrapped Ethereum (WETH)**: Used across Ethereum DeFi protocols. Simple wrapper for gas optimization and standardization.

**Lido stETH**: Not technically wrapped but similar—represents Ethereum staked through Lido. $10B+ supply.

**Wrapped Solana (SOL)**: Solana tokens used on Ethereum and other chains for liquidity.

**Wrapped USDT/USDC**: Stablecoins on non-native chains. Enable USD-denominated transactions across chains.

Wrapped tokens enable capital to move across blockchain silos.

## Wrapped Token Economics

Wrapping creates economic implications:

**Liquidity Fragmentation**: Bitcoin exists natively on Bitcoin, as WBTC on Ethereum, as wrapped Bitcoin on Solana, etc. Liquidity is fragmented.

**Yield Arbitrage**: If Bitcoin yields 3% through native staking but 8% on Ethereum lending, arbitrageurs wrap to Ethereum for yield. This drives wrapping.

**Bridge Risk Premium**: WBTC yields slightly less than native Bitcoin to account for custodian risk. Rational pricing reflects risk.

**Fee Structure**: Wrapping/unwrapping costs fees. If fees are high, arbitrage is less profitable, discouraging wrapping.

**Capital Efficiency**: Wrapped assets enable deploying capital where yields are highest regardless of native chain.

## Wrapped Token Risks

Wrapping introduces new risks:

**Custodian Risk**: Custodian could be hacked, disappear, or intentionally steal. If WBTC custodian is hacked, all WBTC holders lose funds.

**Peg Risk**: Wrapped token should trade 1:1 with original asset. If custodian appears compromised, peg breaks and WBTC might trade at discount.

**Bridge Risk**: If bridge used to wrap is hacked, wrapped tokens become worthless. Example: bridge compromise = WBTC unable to be unwrapped = WBTC worthless.

**Counterparty Risk**: You depend on custodian's continued operation. If company disappears, you might not be able to unwrap.

**Regulatory Risk**: If regulation restricts wrapped assets, WBTC might become unusable despite being technically sound.

## Custodian Selection

Choosing custodians involves trust:

**Reputation**: Established custodians (Coinbase, BitGo) have reputation to maintain. Less likely to steal than unknowns.

**Insurance**: Some custodians offer insurance protecting against theft. Adds cost but reduces risk.

**Transparency**: Well-established custodians regularly publish proof-of-reserves confirming assets backing wrapped tokens.

**Decentralization**: More custodians involved in multi-sig increase security. One compromise isn't catastrophic.

**Audit History**: Custodians that have undergone security audits are preferable to unaudited ones.

Due diligence on custodians is essential before using wrapped assets.

## Cross-Chain Interoperability

Wrapped tokens enable cross-chain usage:

**Liquidity Aggregation**: Wrapped assets enable aggregating liquidity across chains. WBTC on Ethereum, WBTC on Polygon, WBTC on Arbitrum, etc.

**Multi-Chain Applications**: Apps can support multiple chains by accepting wrapped version of assets.

**Price Discovery**: Wrapped assets provide price feeds between chains, enabling arbitrage.

**Capital Flow**: Capital can follow yields across chains through wrapped assets.

Wrapped tokens are essential infrastructure for multi-chain DeFi.

## Wrapped vs. Native Assets

Comparing approaches:

| Factor | Native | Wrapped |
|--------|--------|---------|
| **Security** | Native chain security | Custodian + bridge security |
| **Yields** | Native (3-5%) | Cross-chain yields (often higher) |
| **Liquidity** | Chain-native liquidity | Distributed across chains |
| **Risk** | Chain consensus risk | Custodian + bridge risk |
| **Convenience** | Simple | Requires wrapping/unwrapping |

Native assets are simpler but wrapped enable higher capital efficiency if custodian risk is acceptable.

## Career Opportunities

Wrapped assets create roles:

**Custody Operations** managing wrapped asset backing earn $100,000-$200,000+.

**Bridge Engineers** building wrapping infrastructure earn $150,000-$350,000+.

**Risk Analysts** assessing custodian and counterparty risks earn $110,000-$220,000+.

**Compliance Officers** ensuring wrapped assets meet regulations earn $100,000-$200,000+.

**Protocol Developers** building wrapped-asset-aware DeFi earn $130,000-$280,000+.

## Best Practices

Using wrapped tokens safely:

**Understand Custodian**: Know who's holding your assets and whether you trust them.

**Start Small**: Test with small amounts before committing significant capital.

**Verify Proof-of-Reserves**: Check custodians regularly publish proof they hold promised assets.

**Unwrap Periodically**: Regular unwrapping ensures wrapping process works and you can exit.

**Diversify**: Don't concentrate in single wrapped asset. Spread across multiple chains/custodians.

**Monitor News**: Watch for custody hacks or custodian issues affecting wrapped assets.

## The Future of Wrapped Assets

Wrapped token evolution:

**Decentralized Custody**: Moving from centralized custodians to decentralized networks securing assets.

**Cross-Chain Standardization**: Better standards enabling wrapped assets across more chains seamlessly.

**Programmable Wrapped Assets**: Wrapped assets might carry additional functionality beyond simple 1:1 mapping.

**Regulatory Clarity**: Clearer regulations around wrapped asset issuance and custody.

**Protocol-Native Cross-Chaining**: Long-term, better cross-chain mechanisms might reduce wrapping needs.

## Bridge Digital Assets

Wrapped tokens enable capital mobility across blockchain silos, though they introduce custodial risks. If you're interested in custody, bridge infrastructure, or multi-chain systems, explore [blockchain infrastructure careers](/) at custodians, bridge protocols, and institutional crypto firms. These roles focus on safely moving assets across blockchain boundaries.
