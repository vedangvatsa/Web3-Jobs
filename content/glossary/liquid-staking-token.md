---
term: Liquid Staking Token
slug: liquid-staking-token
category: defi
difficulty: Intermediate
image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80'
description: >-
  A token representing staked assets that can be traded or used in DeFi while
  the underlying assets remain staked and earning staking rewards.
relatedTerms:
  - staking
  - validator
  - restaking
  - liquid-staking
synonyms:
  - LST
  - staked token
  - liquid staking asset
lastUpdated: 2026-09-04
---

A liquid staking token, or LST, is a token that represents assets deposited into a staking service. It lets the holder transfer or use that representation while the deposited assets remain staked in a proof-of-stake network. The LST is a claim on the underlying stake and its rewards, subject to the provider's rules, fees, and withdrawal process. It is not the same asset as the network's native token, even when it is intended to have a similar value.

## How It Works

A user deposits a stakeable asset, such as ETH, into a liquid staking protocol. The protocol assigns the assets to validators directly or through a validator set it manages. It issues an LST to the depositor according to its exchange rate. The protocol collects validator rewards, deducts its fee, and reflects the remaining value in the LST design.

Some LSTs are rebasing tokens. The holder's token balance increases as net staking rewards are added. Other LSTs use a changing exchange rate. The token balance stays fixed, but each token represents an increasing amount of the underlying asset. This difference affects how applications calculate balances and how users see rewards. It does not remove the risk that the LST's market price can differ from its redemption value.

When a holder wants the native asset back, the protocol may process a withdrawal request. The request can require validators to exit or reduce their stake, which takes time under the network's rules. Until redemption is processed, the holder can instead sell the LST on a market. A liquid market gives the token practical liquidity, but it does not guarantee a one-to-one price at every moment.

An LST can be deposited into a lending market, exchanged in a liquidity pool, or used in another smart contract. Those uses are separate from staking. The original stake keeps earning protocol rewards, while the LST holder takes on the risks of each additional application.

## Concrete Example

An ETH holder deposits 10 ETH into a liquid staking provider that issues a rebasing token. After the provider's fee, the holder receives 10 units of the LST. Over time, validator rewards are reflected by an increase in the holder's balance, so the wallet might later show 10.2 units. The exact amount depends on rewards, provider fees, and any validator penalties.

The holder then supplies the LST to a lending protocol as collateral and borrows USDC. The lending protocol accepts the LST because it has a price feed and sufficient liquidity. If the holder needs ETH, they can request withdrawal from the staking provider and wait for its exit process, or sell the LST for ETH in a market. If the LST trades at a discount, selling is faster but returns less ETH than its stated redemption value.

## Limitations And Risks

The staking provider's contracts and operations are a primary risk. A contract bug, key compromise, faulty upgrade, or failure in the withdrawal mechanism can affect the LST even if the base network works normally. Validators selected by the provider can be slashed for certain protocol violations. Slashing losses, missed rewards, and provider fees reduce the value represented by the token.

LSTs can depeg. In stressed markets, holders may sell quickly while few buyers are willing to wait for withdrawals. The market price can fall below the value of the represented stake. An LST used as lending collateral can then trigger liquidation, even if the underlying validators remain sound. Price-oracle design and the depth of LST trading markets matter for this reason.

Using an LST in other protocols compounds risk. A holder may face the staking provider's risk, a lending protocol's smart contract risk, a liquidity pool's price risk, and the added exposure from borrowing. The extra yield sometimes offered by those activities is not the same as the network's staking reward and can disappear or create losses.

Large providers can also concentrate validator influence. If one provider controls a substantial portion of a network's stake, its governance, operational choices, or outage can have network-level effects. Different LSTs have different validator selection, governance, custody, and withdrawal models.

## Relevant Distinctions

Native staking usually means delegating or locking the native asset through the network's own staking rules. It does not necessarily issue a transferable receipt. Liquid staking introduces a separate token and a provider between the holder and the validators. The trade is broader usability for extra contract, provider, and market risk.

An LST differs from liquid restaking. Liquid restaking tokens may represent assets that are staked and then committed to secure additional services, which can add further slashing and protocol risks. An LST also differs from a wrapped token. Wrapping often changes an asset's format or chain, while liquid staking represents a claim on a staked position whose value changes with rewards, fees, and penalties.
