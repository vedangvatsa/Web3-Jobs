---
title: 'From Attention to Intention'
image: /images/alesia-kazantceva-XLm6-fPwK5Q-unsplash.jpg
data-ai-hint: attention economy digital
description: >-
  An examination of intention-driven digital services, the identity and payment
  tools that may support them, and their real privacy and market constraints.
category: Industry Insights
publishedDate: '2026-03-11'
lastUpdated: "2026-09-12"
---

Most consumer internet services make money by selling a product, charging a subscription, taking a transaction fee, or selling advertising. The attention economy names the last model's incentive: a service earns when it can attract, measure, and sell access to an audience. That does not mean every ad-supported product is manipulative or that every user is powerless. It does mean that a user's goal and the service's revenue goal can diverge. A person trying to complete a task quickly may be less valuable to a service than one who continues scrolling.

The phrase intention economy describes a different starting point. Instead of a service inferring a person's wants from clicks, searches, and time spent, a person states a bounded request and chooses who may respond. "I want a flight under these conditions," "I need an accessible apartment near this station," or "I will pay this amount for delivery today" are intentions. A system that carries those requests needs identity, privacy, discovery, payment, reputation, and dispute processes. A blockchain can be one component, but it cannot supply all of them by itself.

Web3 discussions often make an inflated version of this claim: put data in a wallet, then users own it and markets become fair. That skips the difficult parts. Data may be copied after disclosure. A public ledger can make correlation easier. A signature proves control of a key, not a person's legal identity or the accuracy of a preference. An intention market must still decide who can see a request, how offers are ranked, who pays, and what happens when a provider fails to perform.

The useful question is narrower. Which web standards, cryptographic tools, and open protocols can let people express a purpose with less surveillance and more choice than a conventional advertising funnel? The answer depends on the service and the incentives, not on whether an application uses a token.

## Attention is measurable; intention must be represented

Advertising systems use observable behavior because it is plentiful. A page view, a location estimate, a conversion event, and a device identifier can become inputs to targeting or measurement. The person did not necessarily make a direct statement to every company that receives those signals. In the United States, the Federal Trade Commission's [privacy guidance](https://www.ftc.gov/business-guidance/privacy-security) describes privacy and data-security obligations across business contexts; the details vary by law and jurisdiction, but collection, sharing, retention, and security remain concrete design choices.

An intention is more specific than a behavioral trace. It has a requested outcome, constraints, scope, expiry, and an audience. Consider a request for a hotel. The useful information might include dates, location, room accessibility, budget ceiling, cancellation preference, and the consent to receive offers. It should also say when the request expires, whether it can be forwarded, and whether the requester expects a binding offer or merely suggestions.

That structure changes the technical problem. The system no longer asks only, "Which advertisement should this person see?" It asks: who may read a request, how does a provider prove an offer came from it, how does the requester compare terms, and how is an accepted offer recorded? A signed message can establish that the holder of a key created a particular request. It does not make the message private, useful, or enforceable on its own.

The [W3C DID Core Recommendation](https://www.w3.org/TR/did-core/) specifies decentralized identifiers as identifiers that can be controlled without a centralized registration authority. A DID document can contain verification methods and service endpoints. This can help a person or organization prove control of a chosen identifier, but DID Core deliberately does not make a DID a universal identity system. Different DID methods have different resolution, recovery, privacy, and governance properties.

Likewise, a wallet address is a cryptographic identifier, not a complete profile. Reusing it across contexts can link activity that a person meant to keep separate. W3C's DID specification includes explicit [privacy considerations](https://www.w3.org/TR/did-core/#privacy-considerations) about correlation and personal data. A product claiming to return control should explain whether it uses separate identifiers, how it limits logs, and what information a counterparty can retain.

## A request needs consent and boundaries

An intention-driven service should give a person a clear action before it sends a request to providers. The request should be inspectable: destination, dates, budget, conditions, expiry, recipient set, and any payment authorization. A broad "find the best deal" instruction is easy to market and hard to govern. It leaves unanswered whether an agent may prefer a provider that pays it, disclose the budget to every bidder, or make a purchase without a final confirmation.

Consent should be revocable for future use, though revocation cannot recall data already copied by a recipient. That distinction belongs in product copy and in the protocol design. A service can stop sharing a live feed, rotate a credential, or reject new requests from a delegate. It cannot promise to erase a booking request from a provider's internal systems without a contractual and technical process that addresses storage, backups, and legal retention.

Verifiable credentials can support a narrower form of disclosure. The [W3C Verifiable Credentials Data Model 2.0](https://www.w3.org/TR/vc-data-model-2.0/) defines an issuer, holder, and verifier model for cryptographically protected claims. A credential can make authorship tamper-evident, but verification does not establish that every claim is true or appropriate for every purpose. The verifier must still evaluate the issuer, validity, status, and its own policy.

For example, a venue may need proof that a guest meets an age threshold, not the guest's full date of birth. Privacy-preserving presentation mechanisms may reduce disclosure, but product teams must test their actual implementation for linkability, replay, and metadata leakage. The W3C model warns that digital credentials can increase correlation when identifiers, signatures, or presentation patterns are reused. The engineering task is to make the minimum disclosure usable, not to attach the word private to a public record.

## What a Web3 stack can contribute

Blockchains are useful when participants need a shared, append-only record or a common settlement mechanism without placing all authority in one operator. Ethereum describes smart contracts as programs at blockchain addresses that execute defined functions when transactions call them. Its [smart-contract documentation](https://ethereum.org/en/developers/docs/smart-contracts/) also notes that contract interactions are generally irreversible. That makes contracts suitable for clear, bounded commitments and unsuitable for storing a person's full preference history in public.

Payments are one plausible use. A requester might place funds in escrow after accepting an offer, with release conditions that are visible to both parties. The contract can record a payment rule, but it cannot decide whether a hotel room was clean or a physical good arrived intact. A real service needs an oracle, a dispute policy, a human process, insurance, or some combination. Hiding that off-chain responsibility creates a worse user experience than a conventional marketplace because it implies a certainty the code cannot provide.

Account abstraction may make a wallet less like a raw keypair and more like a configurable account. [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337) specifies a `UserOperation` flow in which smart-contract accounts can use custom validation and paymasters can sponsor transaction fees. A product could use this to sponsor a request submission, support recovery logic, or batch a confirmation with payment. The standard does not guarantee free transactions, safe recovery, or anonymity. Those are choices made by account, paymaster, bundler, and application operators.

Naming systems can improve legibility, but they are also public infrastructure with their own policies. The [ENS protocol documentation](https://docs.ens.domains/learn/protocol) describes a registry, resolvers, and the assignment of records to names. An ENS name can make a counterparty easier to recognize; it should not be treated as proof that a seller is trustworthy without independent verification.

Zero-knowledge proofs are often mentioned as a cure for data extraction. Their more disciplined use is to prove a limited statement without revealing all underlying inputs. The claim might be "this holder is eligible" rather than "here is their entire account history." The proof system, trusted setup where relevant, circuit, credential issuer, verifier policy, and surrounding metadata all matter. A proof can narrow disclosure, while an application still leaks the same information through timing, IP addresses, or a persistent identifier.

## A travel request, built without magical assumptions

Take the travel example seriously enough to expose the trade-offs. A traveler creates a request: two passengers, a route, a date range, a maximum all-in price, and a preference for one checked bag. The client asks whether the traveler wants the request sent to a selected group of airlines and licensed agencies, or published to a broader marketplace. The request expires after a stated time.

The client can sign the request so providers can verify it has not been altered. The signature should be bound to the exact domain and request purpose to reduce replay in another context. The traveler might use a distinct identifier for travel rather than a main wallet address. The request itself can live off-chain, encrypted to approved recipients, because putting dates and budget on a public chain would expose information the traveler is trying to control.

Providers return offers that name the fare rules, total price, taxes, baggage treatment, refund rules, offer expiry, and the provider responsible for ticketing. A comparison client can sort offers by a user-selected rule, but it should disclose paid placement, commissions, and any preferences. The traveler accepts one offer after reviewing it. Only then might the system make a payment authorization or call an escrow contract.

This flow has Web3-compatible pieces, but it may be implemented with conventional cryptography and regulated payments as well. The point is not to force every interaction on-chain. The point is that the user can express a purpose, restrict circulation, see the response terms, and choose. If the service centralizes the directory, ranking, and dispute process, it should say so. Openness is a property of specific interfaces and governance, not a mood.

## Markets need rules against new forms of extraction

Moving from inferred behavior to declared requests can create new abuses. A request carrying a high budget may invite discriminatory pricing. A provider directory can become a gatekeeper. An agent that recommends "best" offers may quietly optimize affiliate revenue. A wallet provider can become a data broker if it records every request. A public reputation score can punish people for a single contested event and make it hard to start over.

Builders should decide what data is necessary at each stage. A provider may need a route and date before making an offer, but not a legal name. A payment processor may need regulated identity checks after acceptance, but not during initial discovery. Store sensitive material where access can be controlled; avoid treating a blockchain as a general database. Smart-contract data is observable, including values marked private, as the [Solidity security documentation](https://docs.soliditylang.org/en/latest/security-considerations.html#private-information-and-randomness) makes explicit.

Interoperability also has limits. A portable request format is useful only if recipients interpret its fields consistently. Define currency, tax treatment, time zone, expiry, delivery obligation, and cancellation conditions. If an agent is allowed to act, give it a narrow mandate and a spending cap. A signature that permits an agent to buy anything from any provider is not intentional commerce; it is an unbounded delegation.

Reputation should be contestable. A provider can prove that it issued an offer or fulfilled a recorded rule, but subjective quality and identity disputes need due process. Avoid immutable publication of allegations or personal data. Give participants a way to inspect the evidence, correct an error, and understand who controls the rules.

## Choosing the right problem

The intention economy is most convincing where a person already has a concrete objective and receives little value from prolonged browsing: procurement, travel, hiring, accessibility services, recurring household purchases, or business-to-business sourcing. It is less convincing where people genuinely want discovery, entertainment, or a feed chosen by editors and friends. Attention is not inherently wasteful. The problem is opacity and misaligned incentives when a service presents surveillance as a free convenience.

For a builder, the test is practical. Can the user state the request in a form they understand? Can the product limit who sees it? Can providers make comparable offers? Can the user choose without hidden ranking incentives? Can the system explain payment, cancellation, and dispute paths? Can a person leave with their own records and credentials without exposing everyone else's data? If the answer is no, adding a wallet connection will not repair the model.

For users, a signed request deserves the same care as a payment approval. Read the recipient, scope, cost, expiry, and revocation route. Keep separate identities for separate contexts when the product supports them. Prefer services that disclose their business model and data handling in specific terms. Intention becomes meaningful when a person can name a goal, retain a meaningful choice over the response, and understand the commitment they are making.
