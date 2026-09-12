---
term: Composability
slug: composability
category: technical
difficulty: Intermediate
image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80'
description: >-
  The ability of smart contracts and DeFi protocols to interact and combine
  smoothly, enabling complex financial applications built from modular pieces.
relatedTerms:
  - defi
  - smart-contract
  - protocol
  - lego
synonyms:
  - smart contract composability
  - DeFi composability
  - protocol layering
lastUpdated: 2026-09-04
---

Composability is the ability to combine software components. In blockchain systems, smart contracts can often call other smart contracts through public interfaces. A token issued by one contract can become collateral in a lending contract, a deposit in a vault, or payment in a marketplace. This makes applications more modular, but it also joins their assumptions and risks.

## How It Works

Smart contracts expose functions and follow shared standards. An ERC-20 token, for example, has common functions for balances, transfers, and approvals. A lending protocol can work with an ERC-20 token without knowing who built its user interface. ERC-4626 defines common functions for tokenized vaults, allowing other applications to calculate deposits, withdrawals, and share values in a predictable way.

One contract can call another during the same transaction. The calls are atomic: either all required calls succeed or the transaction reverts. This lets a user exchange a token, deposit the received token, and borrow against the deposit as one operation. Contracts can also compose across separate transactions. In that case, the later action observes a new blockchain state and is not guaranteed to occur on the terms expected during the earlier action.

Composability needs more than compatible function names. The calling contract must understand token decimals, approval behavior, fee rules, price sources, and failure conditions. It also needs to decide which version of an external contract it trusts. A standard interface helps connect systems, but it does not guarantee that every implementation behaves safely or has the same economic design.

## Concrete Example

A user has 10,000 USDC and wants exposure to ETH while keeping a lending position. In one transaction, an application can call a decentralized exchange to swap the USDC for ETH. It then calls a lending protocol to deposit the ETH as collateral and borrow USDC against it. The final USDC can be used in another contract, such as a vault that accepts the stablecoin.

Each component performs a limited task. The exchange provides a swap, the lending protocol tracks collateral and debt, and the vault manages deposits. The application does not need to rebuild those functions. If the swap cannot deliver enough ETH, or the lending protocol rejects the collateral, the atomic transaction reverts and the user keeps the original state, aside from gas spent on the failed attempt.

The position still depends on every component. The ETH price used by the lending protocol, the liquidity of the exchange route, the vault's share accounting, and the contracts' permissions all affect the result. A single application screen can hide a chain of contracts with separate owners and upgrade rules.

## Limitations And Risks

Composability can spread a failure. If a widely used token, oracle, bridge, or lending market has a bug or loses its intended price, applications that accept it can be affected at the same time. A lending protocol that treats a faulty token as valuable collateral may issue bad debt. A vault holding that debt can then pass the loss to its depositors.

External calls create technical risk. A target contract can revert, change behavior after an upgrade, charge unexpected fees, or attempt reentrancy during a transfer. Contracts need to account for hostile or unusual token behavior rather than assuming every ERC-20 works like a simple balance record. Composed transactions can also run into gas limits when they include too many calls.

Price and liquidity assumptions are frequent weak points. A composition may use a pool price as an oracle, even though a large trade or flash loan can move that price within one transaction. Flash loans do not create a vulnerability by themselves. They make it possible to borrow large temporary amounts, which can expose a protocol that relies on manipulable prices or weak checks.

Dependencies can become difficult to see. A user may deposit in a vault that holds liquidity-provider tokens, which represent assets in another pool, which accepts a bridged token. The user is exposed to the whole dependency chain, not just the vault. Cross-chain compositions add message delays and separate finality rules, so they cannot provide the same simple atomicity as calls on one chain.

## Relevant Distinctions

Composability differs from interoperability. Interoperability is the ability of systems, often different blockchains, to exchange data or assets. Composability is the ability to combine functions into a larger operation. Interoperability can enable cross-chain composition, but a bridge alone does not make two systems atomically composable.

It also differs from integration. An integration may be a custom adapter built for two particular services. Composability is broader: common interfaces and permissionless access let many applications combine without each pair negotiating a private connection. "Money legos" is a common metaphor, but real contracts do not fit together automatically. Their economic assumptions, permissions, and failure behavior must still be compatible.
