---
term: Wrapped Token Custody Models
slug: wrapped-token-v2
category: cryptocurrencies
difficulty: Beginner
image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80'
description: >-
  A representation of an asset from one blockchain on another blockchain,
  enabling assets to move between chains and participate in different ecosystems
  while maintaining value parity.
relatedTerms:
  - token
  - bridge
  - cross-chain
  - defi
synonyms:
  - wrapped asset
  - bridge token
  - pegged token
lastUpdated: 2026-09-04
---

Wrapped Token Custody Models describe the ways a token on one network represents an asset that is held, locked, or otherwise accounted for elsewhere. A wrapped token is not the native asset. It is a separate token contract that represents a claim on, or an economic link to, that asset. The model matters because it determines who can mint and redeem the token, what backs it, and what must be trusted for its price to stay close to the underlying asset.

## How It Works

In a custodial model, a designated company or group receives the native asset and holds it in reserve. It then mints the same amount of the wrapped token on the destination chain. If a user later redeems the wrapped token, the operator burns it and releases the reserve asset. For example, a Bitcoin-backed token on Ethereum may be issued only after the operator has received one bitcoin. The intended relationship is one wrapped token for one bitcoin, less any stated fees.

The reserve can be held in several ways. A single custodian can control the wallet holding the assets. A federation can require several independent signers to approve movements. A smart contract can lock assets on a chain that supports the required contract logic. Some bridges instead use validators that attest to deposits and authorize minting. These are different custody models even when users see a similar token in their wallet.

Minting and burning are supply controls. A credible design prevents the wrapped token supply from exceeding the assets it claims to represent. Operators may publish reserve addresses, audit reports, or proof-of-reserves data. Those checks can show that assets are present at a point in time, but they do not by themselves prove control of every liability, the legal claim of token holders, or the safety of the redemption process.

The market price can differ from the backing ratio. Traders may buy a wrapped token below the asset's market price if they believe it can be redeemed, then redeem it for the native asset. That arbitrage can narrow a price gap. It only works when redemptions are open, affordable, and trusted.

## Concrete Example

Wrapped Bitcoin, commonly called WBTC, is an ERC-20 token designed to represent bitcoin on Ethereum. A merchant sends bitcoin to the custody arrangement and requests issuance. After the deposit is verified, the corresponding amount of WBTC is minted to an Ethereum address. The holder can transfer that WBTC or use it in an Ethereum application that accepts ERC-20 tokens, such as a lending market.

To leave the system, the holder sends WBTC through the redemption process. The token is burned, and the custodian releases the matching bitcoin to a Bitcoin address. An Ethereum application does not receive native bitcoin from this process. It receives an Ethereum token whose value depends on the reserve, the issuer's controls, and the ability to redeem.

## Limitations And Risks

The central risk is a broken backing claim. A custodian could lose the reserve, become insolvent, freeze redemptions, or be forced by a legal order to restrict transfers. A multisignature arrangement reduces dependence on one key holder, but does not remove operational, legal, or collusion risk.

Bridge-issued tokens add software and validation risk. A bug in a lock contract, a compromised validator set, or an error in message verification can allow unbacked tokens to be minted. If that happens, the token may lose its peg even though the native asset itself is unaffected. Chains with finality delays also face reorganization risk: a bridge that treats a deposit as final too early might mint against a deposit that later disappears.

Liquidity is another limit. A token can be fully backed yet trade below its reference asset when few buyers are available, redemptions are slow, or market participants fear a freeze. Fees, minimum redemption sizes, identity checks, and withdrawal queues can make arbitrage impractical for smaller holders.

## Relevant Distinctions

A wrapped token differs from a synthetic asset. A synthetic token tracks a price through collateral, debt, or market incentives and may not hold one unit of the native asset for each token. It also differs from a native multi-chain token. A native token is issued by the same project on multiple chains under its own supply rules, rather than representing an asset locked on one chain.

Wrapped Ether, or WETH, is a special case. ETH is native to Ethereum but does not follow the ERC-20 interface. A contract can hold ETH and issue WETH so applications can handle it like other ERC-20 tokens. This is wrapping for interface compatibility, not a cross-chain bridge or an external custody arrangement. A wrapped token's name alone does not reveal its custody model. The issuer, reserve rules, mint authority, and redemption path do.
