---
term: Soulbound Token
slug: soulbound-token
category: nfts
difficulty: Intermediate
image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80'
description: >-
  A non-transferable token bound to a wallet address representing credentials,
  achievements, or identity that cannot be sold or traded, creating permanent
  records of accomplishments.
relatedTerms:
  - nft
  - token
  - identity
  - credential
synonyms:
  - SBT
  - non-transferable token
  - identity token
lastUpdated: 2026-09-04
---

A Soulbound Token, or SBT, is a token whose contract rules prevent an ordinary transfer from one wallet to another. It is often used to record a credential, membership, attendance record, or reputation signal at an address. The word "soulbound" describes non-transferability, not a guarantee that the token proves a person's identity or remains forever. A wallet address can be lost, sold, or controlled by several people. The credibility of an SBT depends mainly on its issuer and its rules.

## How It Works

An issuer calls a token contract to mint an SBT to a recipient address. The contract records the token ID, holder, and any permitted metadata. Its transfer function either always rejects transfers or allows them only in narrow cases, such as a recovery procedure. A public blockchain lets another application check that the token exists, which contract issued it, and which address holds it.

The credential details may be stored directly on-chain, in a linked file, or in a private system. On-chain data is easy to inspect but difficult to remove. A token can instead store a reference, a hash, or a status flag. A verifier can compare a document to its hash without putting the document itself on-chain. This helps reduce disclosure, but the verifier must still trust the issuer's process.

Non-transferability does not solve revocation by itself. A diploma might be valid permanently, while a license can expire or be suspended. The issuer may burn an invalid token, mark it revoked in the contract, or publish a revocation registry. Applications need to check that status rather than assuming every issued token is still valid.

Wallet recovery needs separate design. A contract wallet could let approved guardians move the account's credentials after a verified recovery. A simple non-transferable token held by a lost externally owned account cannot move, even if the holder can prove who they are. Some systems issue a replacement token and mark the earlier one invalid instead.

## Concrete Example

A training provider completes an identity check and issues an SBT for a passed safety course. The token metadata includes the course identifier, issue date, and a link to the provider's credential record. A workplace application asks an applicant to connect the wallet holding the token. It verifies that the token came from the provider's known contract and has not been revoked.

The application learns that the connected address holds the credential. It does not automatically learn the holder's legal name, course score, or whether the address belongs to one person. If the provider later discovers that the course was issued in error, it can change the status to revoked. The workplace must check the status when it needs a current answer.

## Limitations And Risks

Public tokens can expose sensitive facts. A visible token for a medical condition, employment history, political group, or financial hardship can link an address to information the holder did not intend to reveal. Even vague metadata can become identifying when combined with transaction history. Hashing data does not always protect privacy if the original values come from a small, guessable set.

An SBT can also create a permanent negative label. An inaccurate reputation token or a public record of a failed action can be hard to correct and may follow an address into unrelated applications. Issuers need a clear way to correct mistakes, but issuer-controlled revocation gives that issuer continuing power over a holder's record.

The system is vulnerable to issuer fraud and weak verification. Anyone can deploy a token contract and use a familiar name. A real token from an untrustworthy issuer is still untrustworthy. Sybil attacks are another problem: one person can use many wallets to collect tokens or obtain credentials through weak identity checks.

## Relevant Distinctions

An SBT is usually a non-transferable NFT, but the terms are not identical. An NFT is normally transferable and may represent a collectible or ownership right. An SBT is designed to stay associated with an address. Some non-transferable tokens are only access passes and make no identity claim.

An SBT also differs from a verifiable credential. Verifiable credentials are signed digital statements that a holder can present selectively, often without placing each credential on a public chain. An SBT makes its existence visible at an address unless paired with privacy tools. An attestation is the broader concept of a statement made by an issuer. It may be stored on-chain, off-chain, transferable, non-transferable, public, or private. SBTs are one way to represent an attestation, not a complete identity system.
