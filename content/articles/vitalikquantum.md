---
title: Vitalik Buterin backs leanPCS as the fast route to quantum-safe Ethereum
ogTitle: "VITALIK BUTERIN BACKS LEANPCS AS THE FAST ROUTE TO QUANTUM-SAFE ETHEREUM"
description: Buterin reversed his earlier view of leanPCS in an X thread on EIP-8288, the draft that would keep bulky quantum-safe signatures and proofs off Ethereum's blocks.
image: /images/news/vitalikquantum.jpg
imageCaption: "Vitalik Buterin speaking at TechCrunch London in 2015. Photo: John Phillips via Wikimedia Commons (CC BY 2.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Vitalik_Buterin_TechCrunch_London_2015.jpg
category: News
data-ai-hint: developer speaking conference
publishedDate: '2026-11-17'
lastUpdated: '2026-11-27'
---

Ethereum co-founder Vitalik Buterin publicly endorsed leanPCS on Nov. 16 as the quickest route to a quantum-safe Ethereum, reversing his earlier skepticism in a long thread about a draft proposal he co-wrote.

"Over the past few weeks I've gone from thinking leanPCS is total bull to being a total bull," Buterin wrote on X, in an explainer of how the network should handle the much larger signatures and proofs that quantum-resistant cryptography requires. [Decrypt](https://decrypt.co/383294/vitalik-buterin-now-a-total-bull-on-leanpcs-as-fast-track-to-quantum-safe-ethereum) reported the post the same day, and [Unchained](https://unchainedcrypto.com/vitalik-buterin-says-ethereums-quantum-safe-plan-can-ship-sooner-with-this-design/) covered it later on Nov. 16.

The proposal at the center of the thread is [EIP-8288](https://eips.ethereum.org/EIPS/eip-8288), a Standards Track Core draft Buterin authored with developer Thomas Coratger and first published on June 3, 2026. The EIP adds a frame mode through which transactions declare signature and proof dependencies. Nodes then fold those dependencies into a single recursive STARK off-chain, and a block carries only the aggregate proof rather than the underlying data.

Size is the problem the draft targets. Buterin wrote that signatures would grow from 65 bytes today to between 1 and 6 kilobytes, while zero-knowledge proofs would balloon from a few hundred bytes to roughly 128 kilobytes. "This is unsustainable to put on chain, and 8288 fixes this," he wrote.

The thread compares three designs for what users might submit. leanSPHINCS supports one hash-based signature type at low cost but nothing else. leanSTARK would accept a proof of any computation, but only after Ethereum settles on an instruction set architecture for user programs, a step Buterin called "a really big deal" that is "likely to take time to agree on the details of it." leanPCS sits between them: it offers the same generality as leanSTARK while requiring only the choice of a mathematical field, [according to Unchained's summary of the thread](https://unchainedcrypto.com/vitalik-buterin-says-ethereums-quantum-safe-plan-can-ship-sooner-with-this-design/).

That middle path would let Ethereum verify a STARK for roughly 20,000 to 40,000 gas, Unchained reported. The gas math behind the push has been in public view since June, when a [post on the Ethereum Research forum](https://ethresear.ch/t/sphincs-minus-efficient-stateless-post-quantum-signature-verification-on-the-evm/25165) described SPHINCS-, a family of hash-based signature variants tuned for the Ethereum Virtual Machine. The post found that a smart contract can already check a NIST-aligned SPHINCS+ variant for about 150,000 gas with no protocol change, with tested variants ranging from roughly 94,000 to 276,000 gas. The variants draw on SPHINCS+, the scheme the US National Institute of Standards and Technology standardized in 2024 as SLH-DSA, Unchained noted.

Under protocol-level aggregation, a future leanSPHINCS verification would cost about 3,000 gas, [Decrypt reported](https://decrypt.co/383294/vitalik-buterin-now-a-total-bull-on-leanpcs-as-fast-track-to-quantum-safe-ethereum), against roughly 3,000 gas for an ECDSA signature today, an estimate Buterin has given earlier. In his own words in the thread, leanSPHINCS would charge "4096 for the 64 bytes," which Unchained quoted, while limiting users to one specific signature scheme. The draft's own constant table sets the frame's verification gas at 3,000 for each leanSPHINCS dependency and 30,000 for each leanSTARK dependency, with at most 16 leanSPHINCS signatures allowed per transaction.

The design moves the work out of block execution. Under the EIP, transactions declare their signatures and proofs as dependencies, mempool nodes bundle them into wrappers roughly every second, and builders attach one recursive proof to the block header. The draft leans on the same Lean Ethereum tooling being developed for consensus-layer signature aggregation, so both layers share a codebase. It is also written to stay compatible with FOCIL, the inclusion-list proposal under discussion for Ethereum's roadmap.

Buterin argued the payoff could arrive sooner than developers expect. A route to what he called "the cryptographic proof singularity" runs "much faster than any of us expected," he wrote, "and that route runs through 8288 with leanPCS." Decrypt noted that leanSTARK, the general option, would wait on the language question, while leanPCS could ship first and leave room to add leanSTARK later.

The urgency behind the thread is not new. The Ethereum Foundation put together a dedicated post-quantum team in January, developers have proposed overhauling the staking deposit contract so it can hold post-quantum validator keys, and Buterin has pushed plans to cut the cost of quantum-safe privacy on the network. Layer 2 Starknet has also weighed becoming a layer 1 to chase quantum resistance by 2027, Unchained reported, with StarkWare CEO Eli Ben-Sasson warning that the quantum threat "may be MUCH closer than we think."

EIP-8288 remains a draft. Its text states that activation requires a network upgrade, and the change would be consensus-breaking, since nodes that do not implement the EIP would reject transactions carrying the new frame mode.
