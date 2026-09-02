---
term: Wrapped Token
slug: wrapped-token
category: cryptocurrencies
difficulty: Beginner
image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80'
description: >-
  A token representing an external asset (another cryptocurrency or asset)
  locked in a smart contract, enabling that asset to be used on different
  blockchains or within protocols.
relatedTerms:
  - token
  - bridge
  - cross-chain-bridge
  - ethereum
synonyms:
  - synthetic token
  - pegged token
  - bridged token
---

Wrapped Token refers to a cryptocurrency asset that represents another asset locked in a smart contract, enabling that underlying asset to be used on blockchains or within protocols where it does not natively exist. The most prominent example is Wrapped Bitcoin (WBTC), which allows Bitcoin holders to participate in Ethereum-based decentralized finance applications by depositing their BTC with a custodian and receiving an equivalent amount of WBTC tokens. The wrapping process is reversible, meaning users can burn their wrapped tokens at any time to reclaim the original underlying asset. Understanding wrapped token mechanics, including custody models, minting procedures, and security considerations, is valuable for professionals seeking roles in cross-chain infrastructure development, DeFi protocol engineering, and blockchain integration architecture.

## How Wrapping Works

The mechanism is straightforward:

- **Asset Lock**: You deposit the original asset (Bitcoin, Ethereum, etc.) into a smart contract on the custodian's system.

- **Custodian Safeguard**: The custodian (such as Coinbase or BitGo for Wrapped Bitcoin) securely holds the deposited asset.

- **Token Issue**: The smart contract on the destination blockchain issues an equivalent amount of the wrapped token. 1 BTC locked = 1 WBTC issued.

- **User Possession**: You now own wrapped tokens on the destination chain and can use them for trading, lending, staking, etc.

- **Unwrapping**: You burn wrapped tokens on the destination chain, and the custodian releases the original asset to your address on the source chain.

- **Trust in Custodian**: You trust that the custodian holds the assets honestly and has not been hacked.

## Types of Wrapped Tokens

Different wrapper designs include:

- **Custodial Wrapped (WBTC, WETH on L2s)**: A trusted custodian holds the original asset. This design is centralized but simple. The risk is related to custodian security and honesty.

- **Multi-Sig Wrapped**: Multiple independent custodians must cooperate to move assets. This design offers more security but is more complex.

- **Atomic Wrapped**: Smart contracts manage wrapping across compatible blockchains (such as Polkadot's XCMP). This design is less custodial but requires compatible chain infrastructure.

- **Decentralized Wrapped**: Decentralized networks of validators guard custody, enabling wrapped tokens without a single custodian. This design is complex and still developing.

Different designs make different security and efficiency tradeoffs.

## Popular Wrapped Tokens

The wrapped asset ecosystem includes:

- **Wrapped Bitcoin (WBTC)**: The largest wrapped asset, backed by Coinbase and BitGo custody.

- **Wrapped Ethereum (WETH)**: Used across Ethereum DeFi protocols. It serves as a simple wrapper for gas optimization and standardization.

- **Lido stETH**: Represents Ethereum staked through Lido, functioning similarly to wrapped tokens.

- **Wrapped Solana (SOL)**: Solana tokens used on Ethereum and other chains for liquidity.

- **Wrapped USDT/USDC**: Stablecoins on non-native chains that enable USD-denominated transactions across chains.

Wrapped tokens enable capital to move across blockchain silos.

## Wrapped Token Economics

Wrapping creates economic implications:

- **Liquidity Fragmentation**: Bitcoin exists natively on Bitcoin, as WBTC on Ethereum, and as wrapped Bitcoin on Solana. This leads to fragmented liquidity.

- **Yield Arbitrage**: If Bitcoin yields 3% through native staking but 8% on Ethereum lending, arbitrageurs wrap to Ethereum for yield. This drives wrapping.

- **Bridge Risk Premium**: WBTC yields slightly less than native Bitcoin to account for custodian risk. Rational pricing reflects this risk.

- **Fee Structure**: Wrapping and unwrapping incur fees. If fees are high, arbitrage becomes less profitable, discouraging wrapping.

- **Capital Efficiency**: Wrapped assets enable deploying capital where yields are highest, regardless of the native chain.

## Wrapped Token Risks

Wrapping introduces new risks:

- **Custodian Risk**: The custodian could be hacked, disappear, or intentionally steal assets. If the WBTC custodian is hacked, all WBTC holders may lose funds.

- **Peg Risk**: The wrapped token should trade 1:1 with the original asset. If the custodian appears compromised, the peg may break, and WBTC might trade at a discount.

- **Bridge Risk**: If the bridge used to wrap is hacked, wrapped tokens may become worthless. A bridge compromise could prevent WBTC from being unwrapped.

- **Counterparty Risk**: You depend on the custodian's continued operation. If the company disappears, you might not be able to unwrap.

- **Regulatory Risk**: If regulation restricts wrapped assets, WBTC might become unusable despite being technically sound.

## Custodian Selection

Choosing custodians involves trust:

- **Reputation**: Established custodians (such as Coinbase and BitGo) have a reputation to maintain, making them less likely to steal than unknown entities.

- **Insurance**: Some custodians offer insurance protecting against theft, which adds cost but reduces risk.

- **Transparency**: Well-established custodians regularly publish proof-of-reserves confirming the assets backing wrapped tokens.

- **Decentralization**: More custodians involved in multi-sig arrangements increase security, as one compromise is not catastrophic.

- **Audit History**: Custodians that have undergone security audits are preferable to those that have not.

Due diligence on custodians is essential before using wrapped assets.

## Cross-Chain Interoperability

Wrapped tokens enable cross-chain usage:

- **Liquidity Aggregation**: Wrapped assets enable aggregating liquidity across chains, such as WBTC on Ethereum, Polygon, and Arbitrum.

- **Multi-Chain Applications**: Applications can support multiple chains by accepting wrapped versions of assets.

- **Price Discovery**: Wrapped assets provide price feeds between chains, enabling arbitrage opportunities.

- **Capital Flow**: Capital can follow yields across chains through wrapped assets.

Wrapped tokens are essential infrastructure for multi-chain DeFi.

## Wrapped vs. Native Assets

Comparing approaches:

| Factor | Native | Wrapped |
|--------|--------|---------|
| **Security** | Native chain security | Custodian and bridge security |
| **Yields** | Native yields | Cross-chain yields |
| **Liquidity** | Chain-native liquidity | Distributed across chains |
| **Risk** | Chain consensus risk | Custodian and bridge risk |
| **Convenience** | Simple | Requires wrapping and unwrapping |

Native assets are simpler, but wrapped assets enable higher capital efficiency if custodian risk is acceptable.

## Career Opportunities

Wrapped assets create roles:

- **Custody Operations** managing wrapped asset backing.

- **Bridge Engineers** building wrapping infrastructure.

- **Risk Analysts** assessing custodian and counterparty risks.

- **Compliance Officers** ensuring wrapped assets meet regulations.

- **Protocol Developers** building wrapped-asset-aware DeFi applications.

## Best Practices

Using wrapped tokens safely:

- **Understand Custodian**: Know who is holding your assets and whether you trust them.

- **Start Small**: Test with small amounts before committing significant capital.

- **Verify Proof-of-Reserves**: Check that custodians regularly publish proof they hold promised assets.

- **Unwrap Periodically**: Regular unwrapping ensures the wrapping process works and allows you to exit.

- **Diversify**: Avoid concentrating in a single wrapped asset. Spread investments across multiple chains and custodians.

- **Monitor News**: Stay informed about custody hacks or custodian issues affecting wrapped assets.

## The Future of Wrapped Assets

Wrapped token evolution may include:

- **Decentralized Custody**: Moving from centralized custodians to decentralized networks securing assets.

- **Cross-Chain Standardization**: Improved standards enabling wrapped assets across more chains smoothly.

- **Programmable Wrapped Assets**: Wrapped assets might carry additional functionality beyond simple 1:1 mapping.

- **Regulatory Clarity**: Clearer regulations around wrapped asset issuance and custody.

- **Protocol-Native Cross-Chaining**: Long-term, better cross-chain mechanisms might reduce the need for wrapping.

## Bridge Digital Assets

Wrapped tokens enable capital mobility across blockchain silos, though they introduce custodial risks. If you're interested in custody, bridge infrastructure, or multi-chain systems, explore blockchain infrastructure careers at custodians, bridge protocols, and institutional crypto firms. These roles focus on safely moving assets across blockchain boundaries.
