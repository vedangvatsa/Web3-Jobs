---
title: Verifiable AI Inference
description: >-
  Using cryptographic proofs to verify that AI outputs are authentic and
  untampered.
order: 5
readTime: 9 min
difficulty: advanced
prerequisites:
  - introduction
  - compute-networks
quiz:
  - question: What is verifiable inference?
    options:
      - Running AI models faster using specialized hardware.
      - >-
        Cryptographically proving that a specific AI model produced a specific
        output from a specific input.
      - Training AI models on verified datasets.
      - Checking if an AI model has been fine-tuned.
    correct: 1
    explanation: >-
      Verifiable inference uses cryptographic proofs (like ZK proofs or TEE
      attestations) to prove that a given output was produced by a specific
      model with specific inputs, without needing to trust the server.
  - question: Why is verifiable inference important for on-chain AI?
    options:
      - It makes smart contracts run faster.
      - >-
        Smart contracts cannot run AI models natively, so they need a
        trustworthy way to consume off-chain AI outputs.
      - It replaces the need for oracles.
      - It allows blockchains to train AI models.
    correct: 1
    explanation: >-
      Blockchains are too slow to run AI models directly. Instead, AI runs
      off-chain, and verifiable inference lets smart contracts trust the result
      without re-running the computation.
  - question: What is zkML (Zero-Knowledge Machine Learning)?
    options:
      - A machine learning model that runs on a blockchain.
      - >-
        A technique that generates a cryptographic proof that a specific AI
        model produced a specific output, without revealing the model's weights.
      - A privacy-focused cryptocurrency.
      - A method to compress AI models.
    correct: 1
    explanation: >-
      zkML uses zero-knowledge proofs to prove that a particular inference
      result came from a particular model, without exposing the model itself.
      The claim depends on the circuit, verifier, and cryptographic assumptions.
  - question: What is the difference between zkML and opML (Optimistic ML)?
    options:
      - They are the same thing.
      - >-
        zkML proves correctness upfront with cryptographic proofs; opML assumes
        correctness and only verifies if someone challenges the result.
      - opML is faster than zkML in all cases.
      - zkML only works with image models.
    correct: 1
    explanation: >-
      zkML verifies an encoded computation through a proof system. Optimistic
      approaches depend on a dispute process and suitable challengers. Neither
      approach establishes that a model's answer is factually correct.
  - question: Why can't smart contracts just run AI models directly?
    options:
      - Smart contracts don't support Python.
      - >-
        Many models exceed practical on-chain computation and storage budgets,
        so applications often execute them off-chain.
      - Smart contracts can only process text.
      - There aren't enough nodes.
    correct: 1
    explanation: >-
      Even a small neural network requires millions of floating-point
      operations. At Ethereum's gas prices, running inference on-chain would be
      prohibitively expensive. This is why the computation happens off-chain and
      only the verified result is submitted on-chain.
lastUpdated: 2026-09-04
---

## The Trust Problem

A remote inference response does not by itself prove which model, inputs, or execution environment produced it. Verification methods aim to provide evidence about some or all of those details.

The required evidence depends on how the result is used. A result that can authorize a financial action needs different controls from a draft summary that a person will review.

**Verifiable inference** solves this: it creates a cryptographic proof that a specific model produced a specific output from a specific input.

## Why This Matters for Smart Contracts

Smart contracts are deterministic - given the same inputs, they always produce the same outputs. AI models are not deterministic in the same way. This creates a fundamental tension:

- A DeFi protocol wants to use AI to assess loan risk.
- An NFT marketplace wants AI to detect fake art.
- A DAO wants AI to summarize proposals.

In each case, a smart contract needs to consume an AI output. But how does the contract know the AI output is legitimate?

## Approaches to Verification

### Zero-Knowledge Machine Learning (zkML)
A proof system can establish that a specified computation produced an output. The guarantee depends on the circuit, model representation, verifier, and cryptographic assumptions. It does not prove that the model's answer is factually correct.

**Pros:** A verifier can check the encoded computation without repeating all of it.
**Cons:** Extremely computationally expensive. Generating ZK proofs for large neural networks can take hours and cost more than the inference itself.

**Projects:** EZKL, Modulus Labs, Giza.

### Optimistic Machine Learning (opML)
Similar to optimistic rollups. Assume the AI output is correct, but allow a dispute window where anyone can challenge it by re-running the inference.

**Pros:** Much cheaper than zkML. Only expensive when disputes happen.
**Cons:** Requires a dispute period (latency). Security depends on having honest challengers.

**Projects:** ORA Protocol.

### Trusted Execution Environments (TEEs)
Run the AI model inside a hardware enclave (Intel SGX, AMD SEV, ARM TrustZone) that produces an attestation proving the code ran untampered.

**Pros:** Fast, practical, works with any model size.
**Cons:** Depends on the hardware, firmware, attestation service, and protection against relevant attacks.

**Projects:** Phala Network, Marlin.

## The Spectrum of Trust

| Method | Trust Assumption | Speed | Cost | Best For |
| --- | --- | --- | --- | --- |
| zkML | Proof system, circuit, verifier, and input commitments | Workload-dependent | Workload-dependent | Checking specified computations |
| opML | Honest challengers | Medium | Low | General use |
| TEE | Hardware vendor | Fast | Low | Real-time apps |

Compare these methods for the particular workload. Proof generation, dispute periods, hardware trust, privacy requirements, and recovery from failure can lead to different choices.

<div class="diagram">
<svg viewBox="0 0 800 160" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
 <text x="400" y="20" text-anchor="middle" font-size="13" font-weight="bold" fill="#666">Trust Spectrum: less trust needed →</text>

 <rect x="30" y="40" width="200" height="80" rx="10" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
 <text x="130" y="65" text-anchor="middle" font-size="13" font-weight="600" fill="#92400e">TEE</text>
 <text x="130" y="82" text-anchor="middle" font-size="10" fill="#b45309">Trust: hardware vendor</text>
 <text x="130" y="97" text-anchor="middle" font-size="10" fill="#b45309">Speed: fast</text>
 <text x="130" y="112" text-anchor="middle" font-size="10" fill="#b45309">Cost: low</text>

 <rect x="280" y="40" width="200" height="80" rx="10" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
 <text x="380" y="65" text-anchor="middle" font-size="13" font-weight="600" fill="#1e40af">opML</text>
 <text x="380" y="82" text-anchor="middle" font-size="10" fill="#3b82f6">Trust: honest challengers</text>
 <text x="380" y="97" text-anchor="middle" font-size="10" fill="#3b82f6">Speed: medium</text>
 <text x="380" y="112" text-anchor="middle" font-size="10" fill="#3b82f6">Cost: low</text>

 <rect x="530" y="40" width="200" height="80" rx="10" fill="#dcfce7" stroke="#22c55e" stroke-width="2"/>
 <text x="630" y="65" text-anchor="middle" font-size="13" font-weight="600" fill="#166534">zkML</text>
 <text x="630" y="82" text-anchor="middle" font-size="10" fill="#166534">Trust: math only</text>
 <text x="630" y="97" text-anchor="middle" font-size="10" fill="#166534">Speed: slow</text>
 <text x="630" y="112" text-anchor="middle" font-size="10" fill="#166534">Cost: high</text>

 <line x1="230" y1="80" x2="280" y2="80" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#atrust)"/>
 <line x1="480" y1="80" x2="530" y2="80" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#atrust)"/>

 <text x="400" y="150" text-anchor="middle" font-size="11" fill="#94a3b8">Most production systems use TEE or opML today; zkML is the goal</text>

 <defs>
 <marker id="atrust" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#94a3b8"/></marker>
 </defs>
</svg>
</div>

## Real-World Applications

- **AI Oracles:** Protocols like ORA bring AI model outputs on-chain with verification, enabling smart contracts to use GPT-level intelligence.
- **Content Authentication:** Proving that a piece of content was generated by a specific model (useful for deepfake detection).
- **Autonomous Trading:** DeFi protocols that use AI for trading strategies need verifiable execution to prevent operators from front-running.

State precisely what the verification establishes, and keep that separate from claims about model quality or the truth of its output.
