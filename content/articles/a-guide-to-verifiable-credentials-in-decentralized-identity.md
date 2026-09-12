---
title: A Guide to Verifiable Credentials in Decentralized Identity
image: /images/austin-distel-tLZhFRLj6nY-unsplash.jpg
data-ai-hint: digital identity credentials
description: >-
  Verifiable Credentials let an issuer sign claims that a holder can present to
  a verifier, with careful choices required for trust, privacy, status, and keys.
category: Technology Deep Dives
publishedDate: '2026-03-11'
lastUpdated: "2026-09-12"
---

A diploma, employee badge, driver's licence, membership card, and background check all make claims. They say that an issuer checked something about a subject at a particular time. The holder needs to show the claim to a third party. The third party needs to decide whether the issuer, the claim, and its current status are good enough for the decision at hand.

A Verifiable Credential, or VC, is a standard way to express that process in software. The [W3C Verifiable Credentials Data Model v2.0](https://www.w3.org/TR/vc-data-model-2.0/) became a Recommendation in May 2025. It defines a data model for claims, the issuer-holder-verifier roles, and ways to protect a credential cryptographically. It does not turn every digital file into a trustworthy credential. It supplies a common language for a system that still has to establish issuer trust, key control, privacy, and revocation or suspension rules.

That distinction is the starting point for a useful VC design. A valid digital signature answers a narrow question: did the holder of a particular signing key create or authorize this protected data? It does not prove that the claim was true when issued, that the issuer was competent to make it, that the person presenting it is the subject, or that the claim is suitable for a job, loan, border crossing, or age check. Those are separate checks.

## The Four Roles in a VC Exchange

The W3C model describes three core parties and a supporting registry role. Keeping them separate prevents several common misunderstandings.

An **issuer** makes claims about one or more subjects, creates a credential, protects it with a securing mechanism, and sends it to a holder. A university issuing an academic record is an issuer. So is an employer issuing a staff credential or an organization attesting that a person completed a course. The issuer is accountable for the claims it makes. Cryptography can show which signing key was used. It cannot make a careless or dishonest issuer reliable.

A **holder** possesses one or more credentials and creates a presentation when a verifier asks for proof. The holder is often the subject, but not always. A parent could hold a child's credential, or an organization could hold a credential about a device. The W3C specification uses the term [credential repository](https://www.w3.org/TR/vc-data-model-2.0/#terminology) for software that stores and protects access to credentials. That repository might be wallet software, a secure vault, a file system, or another application. A blockchain wallet is one possible interface, not a requirement.

A **verifier** receives a credential or a verifiable presentation and evaluates it. A verifier may be an employer checking a qualification, a website checking an age assertion, or a building system checking an access credential. It must do more than run signature code. The VC data model distinguishes **verification**, which checks authenticity, currency, and the specified securing mechanism, from **validation**, which applies the verifier's policy before relying on the claim. An authentic credential from an unknown training provider may still fail an employer's validation policy.

A **verifiable data registry** supplies information needed by the other roles. It might provide an issuer's verification key, a credential schema, or status information. The W3C model explicitly allows this role to be filled by a trusted database, a distributed database, a government database, or a distributed ledger. A VC system does not require a blockchain. Choosing a ledger does not remove the need to protect personal data or define who is allowed to update records.

## A Degree Credential, Step by Step

Consider a university degree. The university checks its records and creates a credential saying that a named graduate completed a specific program. It protects that credential using a key it controls and delivers the protected data to the graduate's credential repository.

Later, an employer asks the graduate to demonstrate the qualification. The graduate can send the credential directly or create a verifiable presentation that packages the relevant credential data for that employer. The employer then checks the credential's format, the proof, the issuer's verification material, its validity period if one exists, and any configured status information. It also decides whether it trusts that university for the role it is hiring for and whether the claims meet its own requirements.

The W3C model permits a presentation to include one or more credentials and extra data. A presentation can also carry a holder's proof. In a properly designed request-response flow, the verifier supplies a challenge and an expected domain or audience. The holder signs or proves over those values. That binding helps prevent a presentation made for one website from being replayed at another. The [Data Integrity specification](https://www.w3.org/TR/vc-data-integrity/) describes `challenge` as a replay mitigation and `domain` as a way to constrain the intended security context.

The employer does not necessarily need to call the university during every check. It can verify a signature with published verification material and use cached status data if its policy permits. That does not mean every check is offline. Key resolution, fresh status checks, and issuer policy information may require network access. The right design depends on how quickly the underlying claim can change and how much risk the verifier can accept.

## What the Credential Data Contains

A VC is a data model, not one mandatory storage product. The W3C data model defines concepts such as contexts, types, issuer, credential subject, validity periods, status, and securing mechanisms. A concrete representation can package those concepts in different ways. The important question is not whether a field has a familiar name. It is whether the verifier can interpret the protected claim under the same rules as the issuer.

A typical credential includes the following information:

- A **type** tells software what sort of credential it is. `VerifiableCredential` is commonly one type, with a second type for the domain claim, such as an education or employee credential.
- An **issuer** identifies the party making the claims. It can be an identifier or an object. It is not required to be a decentralized identifier.
- A **credential subject** contains one or more claims about the subject. The subject can be a person, organization, physical item, or digital item.
- A **validity period** can state when the credential becomes valid and when it expires. The v2.0 model uses `validFrom` and `validUntil` where applicable.
- **Status information** can point to a mechanism that says whether the digital credential is suspended, revoked, refreshed, or otherwise changed.
- A **securing mechanism** protects the credential's integrity and lets a verifier check authorship. In a JSON-LD Data Integrity representation, a `proof` object can identify the cryptosuite, verification method, purpose, and proof value.

Some fields are optional. An `id` can identify a credential, but not every credential needs one. A subject can have an identifier, but the VC specification does not require every subject to have a DID. Treating optional fields as mandatory makes supposedly interoperable systems reject otherwise valid data.

The `@context` field often causes confusion. In JSON-LD, it maps terms to defined vocabularies so different systems can attach the same meaning to a property. Contexts are powerful and therefore sensitive. The Data Integrity Recommendation tells implementers to use static, versioned contexts and check their published hashes when they depend on JSON-LD processing. Fetching an arbitrary context at verification time can change interpretation, slow processing, or expose the verifier's activity.

## Decentralized Identifiers Help, but They Are Optional

A Decentralized Identifier, or DID, is a separate W3C standard. DID Core defines a DID as a URI associated with a subject and resolvable to a DID document that may contain verification methods and service endpoints. The [DID Core Recommendation](https://www.w3.org/TR/did-1.0/) does not require a particular blockchain, cryptographic algorithm, or network. A DID method defines how identifiers are created, resolved, updated, and deactivated for that method.

DIDs can be useful in a VC system because an issuer can publish or rotate verification material without tying the credential to a single commercial identity provider. They can also give a holder separate identifiers for different relationships. The benefit depends on the method and the operational design. Reusing the same DID everywhere can make a person easier to correlate. Publishing personal data in a DID document can create a durable privacy problem. A DID is an identifier and a resolution system, not proof that its controller is a specific human.

An issuer can instead use a conventional HTTPS URL, an X.509-backed identity, or another identifier with a policy for key discovery. A verifier should not award extra trust merely because an issuer identifier begins with `did:`. It needs an out-of-band reason to trust the issuer and the method used to resolve its keys.

## A Digital Signature Does Not Verify the Claim's Truth

VC terminology is careful about this point. The v2.0 data model says a verifiable credential is tamper-evident and its authorship can be cryptographically verified. It also says that verification does not imply the truth of the claims. A verifier must evaluate the issuer, proof, subject, and claims against its own policies before relying on the result.

That means an implementation needs a trust registry, policy list, or equivalent decision process. An online retailer may accept a particular age issuer. A regulated employer may accept only named educational institutions. A building may accept only credentials issued by its own access system. The credential format keeps these decisions machine-readable. It does not make them universal.

The same principle applies to time. A credential may accurately record that an employee worked at a company two years ago while being unsuitable as proof of current employment. A diploma may remain valid while the signing key used for its digital representation is compromised. A verifier should consider the claim's validity period, the proof's status, the issuer's key lifecycle, and the purpose of the decision. Calling a credential "verified" without naming those checks hides the actual risk decision.

## Selective Disclosure Is a Capability, Not a Default

The privacy appeal of VCs is often overstated. A holder may be able to choose which credential to share, but that alone does not mean the holder can reveal one attribute while hiding the rest. If a credential contains a birth date, address, photo, and licence class, presenting the whole credential exposes all of them.

Selective disclosure requires a compatible credential format and proof system. The W3C's [BBS cryptosuite draft](https://www.w3.org/TR/vc-di-bbs/) describes signatures that can produce selectively disclosed, unlinkable derived proofs. The document is a Candidate Recommendation Draft, not a finished Recommendation, and it specifies a particular `bbs-2023` approach. Other ecosystems use different formats and disclosure methods. A verifier and holder must support the same one.

For an age check, the desired claim is usually "this person is over the required age," not the person's full date of birth. A cryptographic derived proof can reveal only the necessary fact. It may also make separate presentations hard to link to one another at the cryptographic layer. That is useful, but it is not total anonymity. IP addresses, browser fingerprints, account logins, requested attributes, repeated identifiers, and the verifier's own records can still correlate a person across interactions.

Selective disclosure also does not replace holder binding. A bearer credential can be copied and presented by anyone who obtains it. A system that needs to know the presenter controls the credential can require a holder proof bound to a challenge and domain, use device-bound keys, or choose another authentication arrangement. Each option has recovery and accessibility consequences. A person who loses a device should not automatically lose every credential and account.

## Status, Revocation, and Privacy

Some claims change. An employee leaves a company. A licence is suspended. A credential was issued in error. The issuer needs a way to signal a change without contacting every holder and verifier individually.

The VC data model has a `credentialStatus` extension point. It does not require one revocation system. The [W3C Bitstring Status List v1.0](https://www.w3.org/TR/vc-bitstring-status-list/) is one standardized approach. It lets an issuer publish status for a large set of credentials as a compressed bitstring. A credential points to a position in that list, which can represent a status such as revocation or suspension.

The aggregation is a privacy design choice. A one-to-one status URL can tell an issuer which credential was checked, when, and potentially which verifier made the check. The status-list specification describes this correlation risk and uses a shared list to create group privacy. It also permits a holder to provide a status list directly to a verifier, though the verifier may choose to fetch a newer copy if its policy requires fresh information.

Status is about the digital credential, not necessarily the underlying fact. A university may revoke a credential because its signing key was compromised while the degree itself remains legitimate. A verifier needs rules for that difference. It may accept a reissued digital record, seek a fresh confirmation, or reject the old proof. The answer should be documented before a high-stakes credential is deployed.

## Key Management Is the Hard Part People See Last

VC systems use cryptography, but the most damaging failures are often operational. An issuer that loses a signing key needs a rotation and incident plan. A verifier needs to know which historical keys were valid at which time. A holder needs secure local storage, backup or recovery, and a way to move credentials to a new device without silently giving a vendor access to every claim.

The W3C Data Integrity model treats the verification method and proof purpose as first-class parts of a proof. A proof intended for an assertion should not be repurposed as an authentication proof. A challenge and domain can limit replay. Those mechanisms help only when implementers check them. Accepting any valid signature from a known key, without checking the intended purpose or audience, creates a path for misuse.

Key recovery presents a policy choice. A custodial wallet can offer familiar account recovery while becoming a high-value party that can observe or control credentials. A self-managed wallet can reduce that dependency while putting more responsibility on the holder. Social recovery, encrypted backups, hardware-bound keys, and delegated recovery contacts each move risk to a different place. There is no universal best option. Systems should state who can recover access, under what evidence, and whether that process can reveal a holder's credential inventory.

## Build the Exchange Before Choosing the Label

A sound VC project begins with the decision it supports. Write down the claim the verifier actually needs. Identify the issuer that has authority to make it. Decide whether the holder must prove possession, whether the claim changes, how long it remains valid, and what minimum data should be disclosed. Only then choose a VC representation, cryptosuite, identifier method, status mechanism, and wallet interface.

For a simple course certificate, a signed credential and a known issuer key may be enough. For age checks, selective disclosure and anti-replay binding may be central. For regulated access, fresh status, issuer accreditation, audit logs, and clear recovery may matter more than a blockchain. The technology should narrow disclosure and make verification easier. It should not make a system harder to contest, recover, or understand.

Verifiable Credentials can give people a portable way to present claims without repeatedly handing raw documents to every service. That is valuable only when the system earns trust at each boundary: the issuer's authority, the holder's control, the verifier's policy, the security of the proof, and the privacy of the exchange. The standard supplies the vocabulary. The design has to supply the judgment.
