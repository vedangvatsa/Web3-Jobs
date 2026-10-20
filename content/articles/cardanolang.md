---
title: Hoskinson says he is writing a new Cardano language with Groth16 proofs
ogTitle: "HOSKINSON REVEALS NEW CARDANO LANGUAGE"
description: Charles Hoskinson said on Oct. 18 he is personally building a Cardano programming language with Lucas Rosa, enabling intents and proof-carrying data via Groth16, with no name, code or launch date yet.
image: /images/news/cardanolang.jpg
imageCaption: "Code on a monitor. Photo: Markus Spiske via Wikimedia Commons (CC0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Code_on_computer_monitor_(Unsplash).jpg
category: News
data-ai-hint: source code on monitor
publishedDate: '2026-10-20'
lastUpdated: '2026-10-20'
---

Charles Hoskinson is writing a new programming language for Cardano, and he is doing it himself. The Cardano founder said in an Oct. 18 reply on X that he is "personally developing a programming language for Cardano," calling it "the first of its kind, enabling intents and PCD via Groth16 proofs." He named one collaborator: the developer behind the handle @rvcas.

That handle belongs to Lucas Rosa, a co-creator of Aiken, the existing smart contract language for Cardano. The [Aiken credits page](https://aiken-lang.org/credits) lists Rosa as a maintainer and links his name to the rvcas GitHub account. Unchained [reported](https://unchainedcrypto.com/charles-hoskinson-reveals-work-on-a-cardano-programming-language-using-groth16-proofs/) that Rosa's personal site lists his current role as tooling architect at Midnight; CryptoSlate described him as a software engineer at Input Output Global.

## What the buzzwords mean

Intent-based systems let a user specify the outcome they want from a transaction, with software handling the steps to get there. For financial applications that can mean multi-leg exchanges, automated execution, and settlement logic written as a goal rather than a sequence. Proof-carrying data attaches cryptographic evidence to information so a verifier can check validity without re-running the original computation. Groth16 is the zero-knowledge proof system that makes those attestations small enough to verify cheaply.

Cardano already supports the primitives needed to verify pairing-based zero-knowledge proofs, and the network deployed a zero-knowledge smart contract capability earlier. The new language would package those primitives for developers rather than leaving them as library work. What it does not have yet is a name, published source code, an architecture document, or a release date. Hoskinson has shared none of those.

## The adoption problem underneath

The announcement arrived as Hoskinson separately declared that the coming Leios scalability upgrade would complete his original vision for the blockchain, [CryptoSlate reported](https://cryptoslate.com/hoskinson-reveals-new-code-for-cardano-but-63m-tvl-exposes-a-gap/). The vision includes decentralized consensus and governance, extended UTXO accounting, Plutus smart contracts, formal verification, and multiple independent node implementations. Leios is meant to add the throughput piece, with roadmap targets of 10 to 65 times capacity through phased implementation.

That vision has been stable for years. What has not kept pace is the financial activity sitting on top of it. Cardano's developer tooling story, from Plutus to Aiken, has been one of steadily lowering the barrier to writing contracts. A new language aimed at intents and proofs is the next attempt at that same goal, aimed this time at the parts of DeFi where settlement logic and verifiable claims matter more than raw contract count.

The financial numbers set the stakes. ADA's market capitalization sits near $8.3 billion, while decentralized finance applications on the network hold about $63 million. Decentralized exchanges processed roughly $927,000 over 24 hours as of Oct. 19, with weekly volume near $8.35 million, down 25% from the prior seven days. The network recorded 12,716 active addresses and 28,146 transactions that day, generating about $2,196 in fees. Stablecoin supply stands near $70 million.

For comparison, Solana held roughly $5.9 billion in DeFi deposits and $1.45 billion in daily decentralized exchange volume in the same window, with stablecoin supply above $15.5 billion. Solana's market capitalization, about $62 billion, is roughly seven times Cardano's, while its DeFi deposits are more than 90 times larger.

## What comes next

A language without code is a demo of intent. For developers to care, Hoskinson and Rosa will need to publish specifications, show working compilers, and prove that intents and proof-carrying data can be packaged without the friction that has kept Cardano's existing tools in a narrow lane. Leios still awaits deployment, and the language has no timeline. Both are now on the same list: technical work announced ahead of the demand it is meant to serve.
