---
title: A Guide to Verifiable Credentials in Decentralized Identity
ogTitle: "A GUIDE TO VERIFIABLE CREDENTIALS IN DECENTRALIZED IDENTITY"
image: /images/austin-distel-tLZhFRLj6nY-unsplash.jpg
data-ai-hint: digital identity credentials
description: >-
  A deep dive into Verifiable Credentials (VCs), the W3C standard that is the
  backbone of decentralized identity, enabling a future of user-owned.
category: Technology Deep Dives
publishedDate: '2026-03-11'
lastUpdated: "2026-09-15"
---
A verifiable credential is a digital record of claims made by an issuer about a subject. A university can assert that a person earned a degree. An employer can assert that someone holds a role. A government authority can assert that a person is eligible for a service. The [W3C Verifiable Credentials Data Model v2.0](https://www.w3.org/TR/vc-data-model-2.0/) defines a common way to express those claims and attach cryptographic evidence of who issued them.

The name needs care. "Verifiable" does not mean that every statement inside a credential is true, current, or sufficient for a particular decision. It means a verifier can check cryptographic evidence of authorship and integrity. The verifier must still decide whether it recognizes the issuer, understands the credential type, accepts its age and status, and considers the claim suitable for the transaction. W3C calls that second step validation, and leaves the policy decision to the verifier.

This guide is for people evaluating a VC-based identity flow or trying to understand what a wallet presentation is doing. It separates the standard data model from features that depend on a chosen credential format and protocol.

## The parties and the claim

The usual VC flow has three roles. They are roles, not fixed kinds of company or person. One entity can perform more than one role in different transactions.

An **issuer** makes a claim, creates a credential, secures it with a cryptographic proof, and gives it to a holder. A school issuing a degree record is an issuer. So is an employer issuing an employment credential, or an organization issuing a membership credential. The issuer is accountable for its assertion. A signature can show that a key authorized for the issuer created the proof. It cannot show that the issuer checked a student's coursework properly, or that the issuer deserves trust.

A **holder** possesses credentials and creates a presentation when a verifier requests evidence. The holder is often the credential subject, but not always. A parent might hold a credential about a child, and an organization could hold a credential about equipment it owns. A holder may use a wallet, a secure device store, a browser-based application, or another credential repository. The W3C model does not require a particular wallet or a blockchain.

A **verifier** receives a credential or a verifiable presentation and evaluates it. An employer checking a degree, a venue checking an age-related assertion, and an application checking an access entitlement are all verifiers. A presentation can include one or more credentials and extra information needed for the exchange. It may also include proof from the holder, which can show that the presenter controls a key tied to the presentation.

The **subject** is the thing a claim is about. It can be a person, organization, product, or document. Keeping "holder" and "subject" separate prevents a common mistake: possession of a credential is not automatically proof that the presenter is the subject. Whether a holder needs to prove that relationship depends on the credential format and the verifier's policy.

In a degree example, a university checks its records, issues a credential to a graduate, and signs it. Later, an employer requests proof of a degree. The graduate's wallet creates a presentation for that employer. The employer verifies the issuer's proof, checks validity and status, and applies its own hiring policy. The cryptography reduces the need to manually inspect a PDF or contact the registrar for every check. It does not replace the employer's decision about which institutions or qualifications it accepts.

## What the credential contains

The VC Data Model is an extensible data model. A conforming VC commonly includes a `type`, an `issuer`, a `credentialSubject`, validity information such as `validFrom` or `validUntil`, and a securing mechanism. It may also carry an `id`, status information, evidence, terms of use, and schema references. Claims about the subject live under `credentialSubject`.

For example, a degree credential might identify its type as `VerifiableCredential` and `UniversityDegreeCredential`, name the university in `issuer`, state a validity date, and place the degree name and graduation information under `credentialSubject`. The exact vocabulary for "degree" or "graduation" is not invented by the core model. An ecosystem needs an agreed vocabulary or schema so that a verifier does not mistake one field's meaning for another.

Credentials are often represented as JSON-LD, but JSON-LD is not a synonym for a VC. The data model also supports secured representations that use JSON Web Tokens, Selective Disclosure JWTs, or CBOR Object Signing and Encryption. The [W3C JOSE and COSE specification](https://www.w3.org/TR/vc-jose-cose/) describes these options. Two credentials can make equivalent claims while using different encodings and proof mechanisms. A verifier must support the particular combination in use.

Decentralized identifiers, or DIDs, are optional. A DID is a URI that can resolve to a DID document containing public verification methods and service information. The [W3C DID Core specification](https://www.w3.org/TR/did-core/) does not require a blockchain and does not make DIDs mandatory for VCs. An issuer can be identified by a DID, an HTTPS URL, or another supported identifier. What matters is that the verifier can obtain trustworthy public-key material and determine that the key was authorized to make the issuer's assertion.

## Proofs and verification

A proof binds the credential data to cryptographic material. With a digital signature, the issuer signs data using a private key. A verifier uses the corresponding public key and the specified algorithm to check that the signed data has not changed and that the signer controlled the private key. If someone changes the degree name after issuance, the original signature should fail verification.

The [W3C Data Integrity specification](https://www.w3.org/TR/vc-data-integrity/) defines one proof model. A `DataIntegrityProof` can identify its cryptographic suite, a verification method, a proof purpose, a creation time, and the proof value. The proof purpose helps prevent a key or proof intended for one action from being treated as authorization for a different action. For an issuer's credential assertion, `assertionMethod` is the relevant purpose.

Other VC formats place the proof around the payload rather than as an embedded `proof` object. A JWS-secured credential, for example, uses a JSON Web Signature. The important question for a verifier is not whether a document has a field called `proof`. It is whether the expected security format verifies under the rules that apply to that format.

A careful verification process has more than a signature check:

- Parse the credential using a supported format and reject malformed or unsecured input.
- Verify the proof with the right algorithm, public key, and proof purpose.
- Confirm the issuer identity and decide whether that issuer is trusted for this credential type.
- Check validity dates and, where relevant, credential status.
- Confirm that the presentation was intended for this verifier and this transaction, particularly when holder binding is required.
- Interpret the claims under an agreed schema and apply the verifier's own eligibility rules.

Presentation binding matters because a copied credential can otherwise be replayed. A verifier can provide a fresh challenge, often called a nonce, and its domain or origin. The holder signs a presentation that includes those values. The verifier then checks that the response is recent and intended for it. The VC Data Model identifies replay and cloning as security concerns; a bare credential passed around as a bearer artifact does not prove who is presenting it.

Key management is part of the security boundary. Issuers need protected signing keys, key rotation, and a reliable way to publish current public keys. Holders need recovery and device-loss procedures that do not let an attacker silently take over their credentials. Verifiers need rules for expired, revoked, unknown, or compromised keys. None of these operational decisions is solved by placing a credential in a wallet.

## Revocation, suspension, and freshness

A signature proves that a credential was issued in a particular form. It does not by itself say whether it remains acceptable today. Some claims have a natural expiry date. Others need a status check because the credential was issued in error, the holder lost eligibility, or the issuer's signing method was compromised.

Revocation and suspension are distinct. Revocation cancels acceptance of the credential and is not reversible in the [W3C Bitstring Status List v1.0](https://www.w3.org/TR/vc-bitstring-status-list/) model. Suspension temporarily prevents acceptance and can be reversed. Status applies to the digital credential, which is not always the same thing as the underlying fact. A university might revoke a digitally signed degree credential after a key compromise while the person's degree remains valid; it can then issue a replacement credential.

The W3C status-list mechanism places an index from each credential into a signed, compressed bitstring shared by many credentials. A verifier fetches or receives the list, verifies the list's proof, and reads the bit at the credential's index. Large shared lists help avoid a one-to-one status URL that would disclose every presentation event to the status publisher. The specification sets a default minimum list length of 131,072 entries for group privacy.

That design still has trade-offs. A verifier fetching a status list directly may reveal timing or network metadata. Caching, content distribution, or holder-provided status information can reduce that exposure, but a verifier may insist on a newer list for a high-risk decision. Status availability also creates a dependency: a verifier needs a defined response when a list cannot be retrieved or cannot be verified. Accepting a cached list trades freshness for availability. Rejecting every unavailable list may block legitimate holders during an outage.

Status is optional in the core data model. A verifier should not assume that an absent status field means a credential cannot be revoked. It should know the issuer's stated lifecycle policy: short-lived credentials may rely mainly on expiry, while long-lived credentials may require a status mechanism.

## Privacy is a property of the whole flow

VCs can reduce unnecessary disclosure, but they do not automatically provide privacy. The W3C data model warns that persistent identifiers, signatures, metadata, network requests, and credential aggregation can let parties correlate a person's activity across transactions.

Consider a credential that contains a person's full name, address, date of birth, and a claim that they are over 18. Sending the whole credential to prove age exposes more information than the verifier needs. Selective disclosure lets a holder reveal only selected claim values. With an SD-JWT, for example, an issuer prepares some claims for later disclosure, and the holder supplies disclosures for the claims requested. A normal JWT does not offer this: revealing any part of its claims set reveals the whole set. The [W3C JOSE and COSE specification](https://www.w3.org/TR/vc-jose-cose/#securing-verifiable-credentials) makes that contrast explicit.

Selective disclosure is not the same as a zero-knowledge proof. A selective-disclosure format may reveal a signed attribute while withholding others. A zero-knowledge proof can, with a suitable cryptographic scheme, prove a statement such as "the holder is over 18" without revealing the underlying birth date. These features require support from the credential's proof format, wallet, and verifier. They are not supplied by the VC data model alone.

Even a carefully minimized presentation can be linkable. Reusing a stable subject identifier across verifiers creates an easy correlation point. Reusing a deterministic signature can do the same. A verifier can also combine a credential's disclosed claims with browser fingerprinting, IP addresses, payment data, or data from other credentials. Using separate identifiers and transaction-specific presentations may help, but it does not stop a verifier from retaining disclosed data or combining it with outside records.

Privacy also depends on where credentials are stored. A cloud wallet provider may learn which credentials a user holds or when they are accessed. An issuer contacted during every verification can build a log of the holder's activity. A blockchain is usually a poor place for personal credential data because its records can be widely replicated and difficult to remove. The W3C DID specification advises keeping personal data private and calls out DID and DID-document correlation risks. Encryption protects data in transit or at rest, but it does not erase the information a verifier receives after the holder chooses to disclose it.

## Interoperability and limits

W3C standardization gives systems common terms and data-model rules. It does not guarantee that any wallet can accept any issuer's credential or that any verifier can process any presentation. Interoperability depends on the full stack: credential vocabulary, schema, encoding, cryptographic suite, status format, issuer-key discovery, presentation protocol, and trust rules. Supporting `application/vc+sd-jwt` does not mean a verifier also supports a Data Integrity proof with a different selective-disclosure suite.

Trust is also outside the cryptography. An attacker can create a correctly signed credential claiming to be a prestigious university. The signature only proves control of the attacker's key. Verifiers need a way to recognize the real university's identifier and decide which credential types it may issue. In regulated use cases, that decision may depend on law, contracts, accreditation, assurance levels, audit records, and liability arrangements.

Credential semantics can fail in quieter ways. A field named `employee` might mean current employee in one schema and former employee in another. A date could be an issuance date, an employment start date, or the date the claim was last checked. A verifier that skips schema and policy checks can make a wrong decision while every signature verifies correctly.

Accessibility, recovery, and consent remain practical constraints. People may lose devices, share access with a guardian, have limited connectivity, or need an accessible way to review the claims a wallet will disclose. A system that assumes every holder can manage private keys independently excludes some legitimate users. It also needs a process for a disputed claim, a mistaken issuance, and an issuer that no longer operates.
