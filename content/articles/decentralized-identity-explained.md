---
title: Decentralized Identity Explained
image: /images/carl-heyerdahl-KE0nC8-58MQ-unsplash.jpg
description: >-
  A practical explanation of decentralized identifiers, verifiable credentials,
  wallet sign-in, trust decisions, privacy risks, and where these systems fit.
category: Industry Insights
publishedDate: '2026-03-11'
lastUpdated: "2026-09-12"
---

Decentralized identity is a set of technical patterns for proving control of an identifier or presenting a signed claim without making one company the permanent operator of every interaction. It is not a single product, a universal ID card, or proof that a person is who they say they are. Those distinctions matter. A signed message can prove control of a key. A credential can show that an issuer made a claim. Neither fact automatically proves a legal name, a reputation, or eligibility for a particular service.

The term is often used for three related but separate ideas: an identifier controlled through cryptographic keys, credentials issued by an organization and stored by a holder, and a way to sign in without a conventional password. They can work together. They do not require each other. A good implementation states exactly which problem it is solving.

The [W3C DID Core Recommendation](https://www.w3.org/TR/did-core/) defines a decentralized identifier, or DID, as a URI such as `did:example:123`. It can refer to a person, organization, device, document, or other subject. A DID resolves to a DID document that can contain public verification material and service endpoints. The DID controller is the entity permitted by the chosen DID method to change that document. In many systems the controller proves that authority by controlling private keys.

The word "decentralized" does not mean "stored on a blockchain." DID Core deliberately does not require one underlying technology. A DID method may use a distributed ledger, a peer-to-peer network, a decentralized file system, or another registry. The method defines how identifiers are created, resolved, updated, recovered, and deactivated. That method, along with its software and governance, is part of the security model. A prefix alone tells you very little.

## Identity is several different claims

Online systems use "identity" to mean different things. A username labels an account. An authentication event shows that a browser or wallet controlled a secret. An email address provides a contact route. A government document may support a claim about a legal person. An employer may attest to a role. A reputation score summarizes an application's own history. Treating those concepts as one portable object creates both design and privacy mistakes.

Start with the question the relying service needs answered. Does a forum merely need to know that the same participant returned today? Does an adult-content service need an age threshold? Does an employer need to verify a certification? Does a financial service need identity proofing under a specific regulatory scheme? These requests require different evidence, different retention rules, and different recovery paths.

NIST defines identity proofing as establishing a relationship between a person using an online service and a real-life person to a stated level of assurance. Its [SP 800-63A guidance](https://pages.nist.gov/800-63-4/sp800-63a.html) separates identity resolution, evidence validation, attribute validation, and verification of the applicant. A DID does not perform those steps. A wallet signature does not perform them either. It can bind a session to a key, but the service must still decide whether the issuer, evidence, and verification process satisfy its purpose.

This is not a weakness unique to decentralized systems. Every identity system depends on a trust decision. A corporate SSO provider may be trusted for employment status but not for age. A university may be trusted for a degree but not for a home address. A carefully designed credential system makes the issuer, claim, status, and intended verifier visible instead of hiding them behind a generic "verified" badge.

## DIDs and DID documents

A DID is an identifier, not a profile page. A DID document commonly publishes public keys or other verification methods and may list services. It should not be a dump of a person's personal data. The W3C standard explicitly warns about privacy and correlation risks, including the danger that a persistent identifier can link a person's activity across contexts. Review the [DID Core privacy considerations](https://www.w3.org/TR/did-core/#privacy-considerations) before designing a public identity record.

The basic flow is simple. A verifier receives a DID or DID URL. It uses the applicable method to resolve the current DID document. The document tells it which verification material is valid for the purpose it needs, such as authentication or assertion. The verifier checks a signature or proof against that material. If the proof is valid, it has evidence that the signer controlled the associated key at that point in time.

Several limitations appear immediately. Key loss can lock a person out. Key compromise can let an attacker impersonate the controller. Key rotation needs to be reliable. A resolver can fail or return stale data. A user may be the DID subject but not the controller. A company, guardian, or recovery service may control the identifier instead. A system that says "self-sovereign" while keeping unilateral recovery power should say so plainly.

Recovery deserves design time before launch. Password reset has familiar problems, but key recovery is not solved by refusing to offer it. A person may lose a device, die, become incapacitated, or face coercion. Recovery can involve additional keys, trusted contacts, a hardware backup, an enterprise administrator, or a custodial service. Each choice changes who can take control and what evidence they need. There is no recovery option that is both effortless and free of trust.

Use separate identifiers or keys for separate contexts when correlation is a concern. A public creator profile, a workplace credential, and a health-related credential should not automatically share a global handle. A stable identifier makes account migration easier, but it also makes cross-service tracking easier. Privacy comes from a system's disclosure and data-handling choices, not from putting an identifier in a wallet.

## Verifiable credentials are signed claims

A verifiable credential is a data format for claims made by an issuer. The [W3C Verifiable Credentials Data Model 2.0](https://www.w3.org/TR/vc-data-model-2.0/) describes an ecosystem with an issuer, holder, and verifier. An issuer creates a credential containing claims and cryptographic protection. A holder stores it. A verifier receives a credential or a presentation and checks the proof, validity data, and status before deciding whether to rely on the claim.

Think of an educational credential. A university could issue a credential saying that a named or pseudonymous subject completed a program on a certain date. The holder can later present it to an employer. The employer checks whether the signature traces to a university key it trusts, whether the credential is current or revoked, whether it was presented by the right holder where holder binding is required, and whether the program satisfies the employer's own rule.

Cryptographic verification protects authorship and integrity. It does not make a claim true. The W3C standard says verifiability does not imply the truth of the claims encoded in a credential. A verifier still evaluates the issuer, proof, subject, claims, and its own policies before relying on it. That sentence prevents a great deal of marketing confusion. A beautifully signed credential from an issuer you do not trust has limited value.

Credentials should carry the information a verifier needs to make that judgment: issuer, issuance date, validity period when applicable, credential type, proof method, and a way to check status where revocation matters. A credential that cannot be revoked may be unsuitable for a terminated employee badge. A credential that phones home to an issuer every time it is shown may create a surveillance record. The design must balance current status against holder privacy.

Selective disclosure is a useful goal, not a property of every credential format. A holder may be able to present an age threshold rather than a full date of birth, or prove membership without exposing a member number. Whether that works depends on the credential format, cryptographic suite, wallet, verifier, and policy. The VC data model supports privacy-preserving approaches, including presentations that may be synthesized from credentials, but it does not promise that every implementation provides unlinkable disclosure. Read the [VC privacy section](https://www.w3.org/TR/vc-data-model-2.0/#privacy-considerations) before claiming a system "shares only what is needed."

## Sign-in is a narrower use case

Many Web3 products use a wallet to sign in. That is decentralized authentication, not necessarily decentralized identity in the credential sense. The user signs a challenge, the server verifies the signature, and the server creates a session. The account address is a persistent identifier unless the user uses a different address for each context.

[Sign-In with Ethereum](https://eips.ethereum.org/EIPS/eip-4361) specifies a standard message for this flow. The message includes the requesting domain, the Ethereum address, a URI, chain ID, nonce, and issuance time. The service must check the signature and the message content. The nonce helps prevent an intercepted signature from being replayed as a new session. Wallets should verify that the message domain matches the actual request origin to reduce phishing risk.

This is useful when a service needs proof of wallet control or wants a user-controlled sign-in method. It is a poor fit when a service needs a recoverable consumer account for people who do not use wallets, needs to verify a legal identity, or must revoke access centrally after an employment change. A mature service can offer wallet sign-in alongside passkeys, email, SSO, or another method. The user should not have to understand private-key custody merely to read a public page.

Never treat a generic signature request as harmless. A user must inspect the domain, statement, expiry, and requested resources. A builder should use unique nonces, short-lived sessions, HTTPS, server-side verification, and clear consent text. The SIWE specification lists replay, phishing, key management, and identifier reuse as security considerations. Those are product requirements, not optional polish.

## Data storage and privacy choices

Putting personal data on a public chain is usually a bad default. Immutable and widely replicated records are difficult to correct or delete. Even a hash can create risk if it is derived from low-entropy or easily guessed personal data. A DID document should contain only the minimum verification and routing information necessary for the selected method.

Credentials can be stored in a wallet, a device-bound store, an encrypted cloud backup, an enterprise wallet, or a hybrid system. Each option has a failure mode. A device-only wallet may be private but hard to recover. A cloud backup can help recovery but becomes a target and a trust dependency. An employer-controlled wallet may simplify onboarding and offboarding but does not give an employee sole control. State the tradeoff rather than assigning the same ownership language to all three.

Verifiers also need a data policy. Ask whether they need to retain the credential, a derived fact, a hash, an audit record, or nothing after a decision. A venue that needs to know "over 18 at entry" may not need a permanent copy of a birth date. An employer may need a durable record that a required certificate was checked. The least data that satisfies the actual requirement is often the safest starting point.

## Where decentralized identity fits

Decentralized identity works well when parties need portable, cryptographically checkable claims across organizational boundaries. Education records, professional certifications, delegated access, device identity, proof of account control, and some age or membership checks are plausible examples. The benefit is not that trust disappears. The benefit is that issuers and verifiers can use interoperable evidence without every interaction requiring the same account provider to mediate it.

It fits poorly when a system needs high-assurance proofing but has no trusted issuer, when users cannot safely manage keys, or when the information should be private but the selected protocol exposes it widely. It also does not remove ordinary product obligations: accessible recovery, fraud response, customer support, consent, record correction, compliance review, and a way to resolve mistakes.

For a builder, start with a narrow statement such as "a partner needs to verify that a user completed our training" or "a user needs to authorize this app to post under a separate key." Name the issuer, holder, verifier, trust registry, credential format, storage location, recovery model, revocation model, and retention policy. Test the unhappy paths: lost device, compromised key, issuer key rotation, revoked credential, unavailable resolver, and a user who wants to leave. That is where an identity design becomes a usable system instead of a diagram.
