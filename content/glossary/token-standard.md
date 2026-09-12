---
term: Token Standard
slug: token-standard
category: technical
difficulty: Intermediate
image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80'
description: >-
  A specification that defines how tokens are created, transferred, and managed
  on a blockchain, enabling interoperability and ensuring consistent behavior
  across applications.
relatedTerms:
  - erc-20
  - erc-721
  - smart-contract
  - token
synonyms:
  - token specification
  - token protocol
  - token interface
lastUpdated: 2026-09-04
---

## Definition

A token standard is a published interface and set of behavior rules for token smart contracts. It tells wallets, exchanges, marketplaces, and other contracts how to read balances, transfer assets, request spending permission, and identify events. A contract that follows the relevant standard can work with software that already supports that interface.

On Ethereum, standards are commonly proposed as Ethereum Requests for Comments, or ERCs. ERC-20 defines a common interface for fungible tokens. Each unit of a fungible token is interchangeable with another unit of the same token. ERC-721 defines unique token identifiers for non-fungible tokens. ERC-1155 lets one contract manage multiple token types, including fungible and non-fungible items.

A standard does not guarantee that a token has value, is secure, or is honestly administered. It defines an expected contract interface. The contract's code and any extra permissions still determine its actual behavior.

## How It Works

An ERC-20 contract tracks balances by address. Its `transfer` function moves tokens from the caller to a recipient. Its `approve` function records an allowance, which lets another address spend up to a stated amount. A decentralized exchange can then call `transferFrom` to take the allowed amount when a user trades. The contract emits `Transfer` and `Approval` events so indexers and wallets can track these changes.

ERC-721 uses a token ID as well as an owner address. `ownerOf` returns the current owner of a particular ID, and transfer functions move that specific asset. The contract may provide a `tokenURI` that points to metadata, often a JSON document. The standard does not require the metadata or media file to stay online.

ERC-1155 represents balances by both account and token ID. The same contract may treat ID 1 as a fungible game currency and ID 2 as a unique item. Its batch functions can transfer several IDs and amounts in one call. Receiver contracts can implement callback functions to signal that they can accept these tokens safely.

Standards can add optional extensions. ERC-2612, for example, allows a holder to sign a permit for an ERC-20 allowance. A relayer submits the signature on-chain, so the holder may avoid sending a separate approval transaction. ERC-4626 defines a common interface for tokenized vaults, including depositing assets and redeeming shares.

## Concrete Example

Consider a wallet that supports ERC-20. A user adds the address of a new ERC-20 token. The wallet calls `symbol`, `decimals`, and `balanceOf` to display the asset. When the user sends 25 units, the wallet creates a transaction calling `transfer(recipient, 25 * 10^decimals)`.

The same token can be traded on an exchange without the exchange writing a custom method for it. Before a swap, the user approves the exchange's router to spend 25 units. The router calls `transferFrom` during the swap and sends the output token to the user. This works because the token and router use the standard allowance and transfer methods.

If the token contract also has an administrator-only `mint` function, that function is not part of ERC-20. It can increase supply even though the standard transfer functions remain compatible. A wallet may display the token correctly while knowing nothing about the minting rule.

## Limitations And Risks

The ERC-20 allowance pattern has a known operational risk. Changing a nonzero allowance directly can allow a spender to use both the old and new amounts if transactions are ordered unfavorably. Many interfaces ask users to set the allowance to zero first, or they use increase and decrease allowance methods when available. Unlimited approvals also expose users if the approved contract is compromised.

Contracts can claim compatibility while implementing confusing or nonstandard behavior. Transfer fees, rebasing balances, blacklist functions, pauses, upgrade permissions, and nonstandard return values can affect integrations. A token's displayed name and symbol are not unique identifiers. The contract address and chain identify the asset more reliably.

NFT metadata may be mutable or stored on a server controlled by the issuer. Bridged tokens introduce additional risk because their value depends on the bridge's custody or verification design. Standards also do not resolve regulatory status, redemption claims, or reserve quality for stablecoins.

## Relevant Distinctions

A token standard is different from a token contract. The standard is the specification; the contract is a particular implementation. Two ERC-20 contracts can share the same basic interface while having different supplies, permissions, and economic rules.

Fungible, non-fungible, and semi-fungible tokens describe asset behavior, not value. ERC-20 is normally fungible. ERC-721 gives each token ID separate ownership. ERC-1155 can represent both models in one contract. A wrapped token is usually a token contract that represents an asset from another chain. It may use a familiar standard, but its security depends on the wrapping or bridge mechanism, not on the standard alone.
