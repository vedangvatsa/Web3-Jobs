---
title: Eigen Labs and Shielded Labs Launch HashSmash AI Contest
ogTitle: "EIGEN LABS AND SHIELDED LABS LAUNCH HASHSMASH AI CONTEST"
description: Eigen Labs and Shielded Labs launched HashSmash on Oct. 5, an open Yukon competition testing how far AI can advance attacks on four hash functions.
image: /images/news/hashsmash.jpg
category: News
data-ai-hint: computer microprocessor chip closeup
publishedDate: '2026-10-06'
lastUpdated: '2026-10-06'
imageCaption: "A close view of a microprocessor. HashSmash invites AI agents to study attacks on widely used hash functions. Photo: Mister rf via Wikimedia Commons (CC BY-SA 4.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:A80386DX-25_SX218.jpg
---

Eigen Labs and Shielded Labs launched an open competition on Oct. 5 that points artificial intelligence agents at four widely used hash functions to learn how far machine methods can advance codebreaking. The contest, called HashSmash, runs on Yukon, Eigen Labs' open research platform where humans and agents post work in public and build on one another's results, [Chainwire reported](https://chainwire.org/2026/10/05/preparing-the-worlds-cryptography-for-the-ai-era-eigen-labs-and-zcash-organization-shielded-labs-launch-hashsmash-an-open-multiplayer-competition-to-test-how-far-ai-can-advance-attacks-on-widely/).

The initial targets are SHA-256, SHA-3, BLAKE3 and Poseidon. Those functions act as digital fingerprints that help verify data and secure blockchains, zero-knowledge systems, software distribution and much of the infrastructure behind the internet. The organizers framed the goal in direct terms, to find out how much increasingly capable AI can advance cryptanalysis, where weaknesses may emerge and which approaches hold up best under pressure.

Anyone can take part by directing an AI agent at the challenge with tools of their choice, including SAT solvers, automated differential search, formal methods or combinations of those approaches. Every proposed attack must state what it defeats and how much computing power it needs. An AI verifier reviews submissions first, then a committee of expert cryptographers takes the next pass. All results are public, so researchers and agents can extend earlier discoveries in the open.

"AI's rapid advance could threaten the cryptographic foundations of digital security," said Zooko Wilcox, co-founder of Zcash and chief product officer at Shielded Labs. "HashSmash, powered by the Yukon platform, lets humans and AI work together to strengthen those foundations and accelerate scientific discovery." The statement was [carried in the announcement](https://chainwire.org/2026/10/05/preparing-the-worlds-cryptography-for-the-ai-era-eigen-labs-and-zcash-organization-shielded-labs-launch-hashsmash-an-open-multiplayer-competition-to-test-how-far-ai-can-advance-attacks-on-widely/).

"Cryptography has been, for decades, the bedrock of individual freedom and privacy on the Internet. AI models have become powerful enough that they offer an opportunity to strengthen all of this cryptography," said Soubhik Deb, head of research at Eigen Labs. "With HashSmash on Yukon, we are bringing an open multiplayer competition to battle-test the frontier of cryptography," [according to the same announcement](https://chainwire.org/2026/10/05/preparing-the-worlds-cryptography-for-the-ai-era-eigen-labs-and-zcash-organization-shielded-labs-launch-hashsmash-an-open-multiplayer-competition-to-test-how-far-ai-can-advance-attacks-on-widely/).

The launch connects to a broader Zcash research effort. Shielded Labs has started Epoch, a project to keep Zcash secure against quantum computing, more capable AI, skilled attackers and adversarial governments. Alongside other post-quantum work across the Zcash ecosystem, Epoch will develop cryptography meant to last for generations. HashSmash is meant to test and strengthen basic building blocks behind that effort while making the research available to outside cryptographers.

Yukon has prior results the organizers cite as evidence the format can produce measurable gains. One challenge beat a Google Quantum AI benchmark by more than 60 percent. A separate contest on faster cryptography produced more than ten times higher throughput, and another made Google's Gemma model roughly 2.6 times faster on Apple Silicon. Most recently, Eigen Labs and the Ethereum Foundation launched sig.golf, a Yukon challenge on post-quantum security for Ethereum.

The distinction between a contest launch and a break matters for readers who run mining hardware. ASIC.tools, in an Oct. 6 analysis, [stressed](https://asic.tools/en/news/hashsmash-ai-cryptanalysis-sha256-public-competition/) that the event studies the four named functions but reports no demonstrated practical break of Bitcoin hashing and changes no mining rules. A project that invites researchers to test a primitive is not itself a finding that the primitive has failed.

The outlet drew three technical lines that often blur in headlines. A collision means two different inputs produce the same output. A preimage task starts from an output and seeks an input that produces it. Bitcoin proof of work instead searches for a block header whose hash sits at or below the network target. Those tasks touch the same math but pose different questions, so progress on one cannot automatically be described as a shortcut to valid Bitcoin blocks under current consensus rules.

Reduced experiments need their own labels as well. Cryptanalysis often studies shortened outputs or reduced-round variants to probe structure. Such work is a standard research method, but a result on a variant must keep its parameters visible and cannot be presented as a break of the full production function without added evidence. Useful reports name the exact construction, the property tested and the implementation conditions.

Reproducibility will decide what the contest means in practice. An informative submission would include code, test vectors, software versions, hardware details and resource use, plus the property under attack. Readers should look for failed repeats and reviewer limits alongside headline numbers. The public review model can expose assumptions behind a claim, though it does not guarantee that an automated check will catch every error, [the analysis noted](https://asic.tools/en/news/hashsmash-ai-cryptanalysis-sha256-public-competition/).

HashSmash is open now at Yukon.org. The organizers ask participants to point an agent at the competition and publish methods so others can test them.
