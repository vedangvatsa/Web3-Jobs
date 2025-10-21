---
title: "What is Kleros Decentralized Court System"
image: "https://picsum.photos/seed/kleros-court/1200/630"
description: "A detailed look at Kleros, an Ethereum-based protocol that acts as a decentralized third party to arbitrate disputes in a fast, secure, and affordable way."
category: "Educational"
data-ai-hint: "court building"
---

### Introduction

Kleros is a pioneering dispute resolution protocol built on the Ethereum blockchain. It functions as a decentralized arbitration service, designed to settle disputes that are difficult for smart contracts to handle on their own. By combining game theory, blockchain technology, and a crowdsourced panel of jurors, Kleros aims to provide a system of justice that is faster, cheaper, and more accessible than traditional legal systems, especially for disputes in the digital realm.

### How Kleros Works

Kleros operates like a decentralized court system with specialized "sub-courts" for different types of disputes. The entire process is managed through smart contracts and powered by its native token, Pinakion (PNK).

1.  **The Dispute**: A dispute is initiated when two parties disagree on an outcome governed by a smart contract. For example, a client is unhappy with freelance work, or an insurance claim is contested. The smart contract is coded to refer any disputes to Kleros. The party raising the dispute pays an arbitration fee.

2.  **Jury Selection**: This is a key part of the system.
    -   Kleros maintains a pool of potential jurors. To become a juror, a user must stake PNK tokens.
    -   When a dispute arises, the Kleros smart contract randomly selects a small panel of jurors from the pool. The more PNK a user stakes, the higher their chance of being selected, but the selection is still cryptographically random to prevent bribery and collusion.
    -   Jurors are typically assigned to "sub-courts" based on their expertise (e.g., an "English Language" court for content moderation, a "Graphic Design" court for creative disputes).

3.  **Adjudication**: The selected jurors are presented with the evidence submitted by both parties. They review the case independently and vote on the outcome they believe is correct. Jurors are blind to how other jurors are voting.

4Playing on Schelling Points**: Jurors are not just voting for what they personally believe is right; they are incentivized to vote for the outcome they believe the *other jurors* will converge on. The "truth" or the most just outcome is assumed to be a natural focal point (a Schelling Point) that rational, honest jurors will independently select.

5.  **Economic Incentives**: The system is secured by economic incentives.
    -   **Coherent Voting**: Jurors who vote in the majority (the "coherent" group) are rewarded. They receive their share of the arbitration fees and are also redistributed a portion of the staked PNK from the jurors who voted in the minority.
    -   **Incoherent Voting**: Jurors who vote against the final consensus lose a portion of their staked PNK. This creates a strong financial disincentive for lazy or malicious voting.

6.  **Appeals**: If a party is dissatisfied with the ruling, they can pay a fee to appeal. An appeal triggers a new round of voting with a much larger jury (e.g., 2x + 1 the previous jury size). This makes it increasingly expensive to challenge the consensus, ensuring that appeals are only made for significant cases. Once the appeals process is exhausted, the final ruling is enforced by the smart contract.

### Why It Matters

Kleros is a foundational piece of infrastructure for a functional Web3 ecosystem.

-   **Enabling Subjective Smart Contracts**: It allows smart contracts to handle agreements that involve subjective conditions (e.g., "satisfactory quality," "appropriate content"), which are impossible to code objectively.
-   **Accessible Justice**: It offers a low-cost and efficient alternative to traditional courts, which can be prohibitively expensive and slow, especially for small-value, cross-border digital disputes.
-   **Transparency and Neutrality**: The entire process, from evidence submission to jury voting, is publicly auditable on the blockchain. The rules are enforced by neutral code, not a central authority.
-   **Diverse Use Cases**: Kleros can be integrated into a wide range of applications, including insurance, freelance marketplaces, content moderation, and even as an oracle for other protocols.

### Practical Use Case: Token Curated Registries

One of the most popular uses for Kleros is to manage **Token Curated Registries (TCRs)**. A TCR is a decentralized list of items, such as a list of legitimate crypto projects.

1.  A project wants to be added to the list and submits an application with a deposit.
2.  The community can review the application. If someone believes the project is a scam, they can challenge the submission, also with a deposit.
3.  This challenge creates a dispute that is sent to Kleros.
4.  A jury of Kleros jurors is selected to review the evidence (the project's website, whitepaper, etc.) and vote on whether the project is legitimate and should be included in the list.
5.  Based on the Kleros ruling, the project is either accepted or rejected from the list.

### FAQ

**What is the PNK token?**
Pinakion (PNK) is Kleros's native token. Its primary function is a "work token." Users stake PNK to be eligible for selection as a juror. The more PNK they stake, the higher their chance of being selected and earning arbitration fees. It is also the token used for economic penalties and rewards within the voting system.

**Isn't it possible for wealthy individuals to buy up PNK and control the court?**
This is a valid concern known as a 51% attack. However, the system is designed to make such an attack extremely expensive and difficult. An attacker would need to acquire a majority of all staked PNK. Even then, if the community believes the attacker is corrupting the system, it can trigger a "fork," where the honest majority agrees to move to a new version of the protocol, rendering the attacker's tokens worthless.

**What kind of evidence is used?**
Evidence can be anything that can be submitted digitally: documents, images, chat logs, links to transactions, and written arguments. The key is that it must be reviewable by the anonymous jurors.
