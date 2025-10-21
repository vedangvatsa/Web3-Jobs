---
title: "What is Kleros Decentralized Court System"
image: "https://picsum.photos/seed/kleros-court/1200/630"
description: "A deep dive into Kleros, an innovative protocol that acts as a decentralized third party to arbitrate disputes in Web3."
category: "DeFi"
data-ai-hint: "decentralized justice"
---

## What is Kleros: A Decentralized Court System

Kleros is a decentralized dispute resolution protocol built on Ethereum. It acts as a "decentralized third party" to arbitrate a wide range of disputes, from simple contract disagreements to more complex issues like insurance claims and content moderation.

Think of it as a **decentralized court system** for the digital world, where disputes are settled by a panel of pseudonymous jurors drawn from around the globe.

### The Problem Kleros Solves

Smart contracts are excellent at automating agreements based on objective, machine-readable data. However, they cannot handle subjective or ambiguous situations that require human judgment.

For example, a smart contract can't determine:
-   If a freelancer's graphic design work meets the "quality standards" of a client.
-   Whether a news article is "fake news."
-   If an insurance claim for a "damaged" real-world asset is valid.

Kleros is designed to bridge this gap by providing a system for obtaining fair, human-adjudicated judgments for disputes that smart contracts can then act upon.

### How Kleros Works: A Step-by-Step Guide

The Kleros protocol is a fascinating blend of game theory, blockchain technology, and crowdsourcing.

1.  **Staking to Become a Juror**:
    -   To become a juror, users must stake Kleros's native token, **Pinakion (PNK)**, into a specific court (e.g., the "Curation" court or the "Smart Contract" court).
    -   The more PNK a user stakes, the higher their probability of being randomly selected to serve on a case.

2.  **Dispute Submission**:
    -   A dispute is sent to the Kleros protocol, and the parties involved pay arbitration fees. These fees are used to compensate the jurors.

3.  **Juror Selection**:
    -   The Kleros smart contract randomly selects a small panel of jurors (e.g., 3 or 5) from the pool of staked users. This random selection prevents bribery and collusion.

4.  **Evidence and Voting**:
    -   The parties to the dispute submit their evidence.
    -   The selected jurors review the evidence privately and vote on the outcome.

5.  **Incentives and Coherence (The Schelling Point)**:
    -   This is the core of the system. Jurors are incentivized to be honest and diligent.
    -   **Reward**: Jurors who vote with the majority (the "coherent" group) receive a portion of the arbitration fees and also win the PNK tokens staked by the jurors who voted in the minority.
    -   **Penalty**: Jurors who vote in the minority (the "incoherent" group) lose their staked PNK.
    -   This system creates a powerful financial incentive for jurors to carefully analyze the evidence and try to converge on the most logical and just outcome—the Schelling Point.

6.  **Appeals**:
    -   If a party is unhappy with the ruling, they can pay to fund an appeal. An appeal draws a larger panel of jurors (e.g., 7, then 15, etc.). This makes it exponentially more expensive to try and corrupt the outcome of a case.

### Use Cases for Kleros

Kleros can be integrated into any dApp that needs subjective judgment:

-   **Token Curated Registries (TCRs)**: Deciding if a token should be included on a reputable list.
-   **Insurance**: Verifying the validity of insurance claims.
-   **Freelance Marketplaces**: Resolving disputes between freelancers and clients.
-   **Content Moderation**: Deciding if user-generated content violates platform rules.

Kleros represents a bold experiment in decentralized justice, offering a potentially faster, cheaper, and more accessible alternative to traditional legal systems for the internet age.