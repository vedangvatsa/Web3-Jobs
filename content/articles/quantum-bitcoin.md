---
title: Preprint Reports Lower Quantum Cost Metric for Bitcoin's Curve
description: >-
  A preprint reports that an open human-and-AI effort reduced the benchmark
  score for a reversible secp256k1 point-addition circuit used in Shor-algorithm
  research, while the authors say the timing of cryptographically relevant
  quantum computing remains uncertain.
image: /images/news/quantum-bitcoin.jpg
imageCaption: "IBM Quantum System One quantum computer. Photo: OJB Quantum via Wikimedia Commons (CC BY 4.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:IBM_Quantum_System_One.jpg
category: News
data-ai-hint: ibm quantum computer dilution refrigerator
publishedDate: '2026-09-12'
lastUpdated: "2026-09-15"
ogTitle: NEW PREPRINT REASSESSES BITCOIN QUANTUM RISK
---

An [arXiv preprint](https://arxiv.org/abs/2609.09582v1), submitted September 9, describes an open project in which people and AI agents optimized a quantum circuit for secp256k1 point addition. The authors report an 86.1% reduction in the project's Q-times-T benchmark score. Secp256k1 is the elliptic curve used for Bitcoin transaction authorization, but the result is a circuit-optimization and resource-estimation result, not a demonstrated quantum attack on Bitcoin.

The [preprint](https://arxiv.org/abs/2609.09582v1) calls the effort ECDSA.Fail and describes its "Open Autoresearch" process as a public leaderboard where contributors submit improvements that an evaluator checks. The author list runs to 36 names, including researchers from Eigen Labs, the Ethereum Foundation's Justin Drake, and contributors tied to StarkWare and Trail of Bits. The live leaderboard site describes itself as an Eigen Labs project and greets visitors with the prompt "Will you beat Google?", [the site says](https://ecdsa.fail/). More than 100 contributors had logged over 400 promoted submissions at the cutoff. The project targets a reversible mixed point-addition circuit, which the authors describe as a bottleneck in Shor's algorithm for elliptic-curve cryptography. Its [public repository](https://github.com/Layr-Labs/ecdsafail-challenge) describes the task as adding a classically supplied point to a point represented in quantum registers.

![ECDSA.Fail benchmark score trajectory](https://arxiv.org/html/2609.09582v1/figs/ecdsafail-QxT-score-trajectory.png)

*Figure from the [ECDSA.Fail preprint](https://arxiv.org/html/2609.09582v1), showing the benchmark score trajectory reported by its authors.*

## What the metric measures

The benchmark scores a circuit as Q multiplied by T, where Q is peak logical-qubit width and T is average executed Toffoli count, according to the [preprint](https://arxiv.org/abs/2609.09582v1). The authors present it as a spacetime-inspired comparison metric, not a direct estimate of the physical size, cost, or runtime of a machine that could attack a particular Bitcoin key.

At the July 26, 2026 data cutoff, the [authors report](https://arxiv.org/abs/2609.09582v1) a best score of about 1.496 billion, from 1,151 logical qubits and 1,299,453 average executed Toffoli gates. They report an initial baseline of 10.75 billion, producing the stated 86.1% reduction under the benchmark's accounting method.

The [paper](https://arxiv.org/abs/2609.09582v1) says the score omits Toffoli depth and parallelism, and that differences in interfaces and accounting conventions prevent formal dominance claims over other reported point-addition results. In particular, its core benchmark supplies one addend classically, whereas a windowed implementation of Shor's algorithm must select an addend coherently.

The [authors also report](https://arxiv.org/abs/2609.09582v1) a windowed-addition-compatible single-call variant with 1,162 qubits and 1,684,161 average executed Toffoli gates. On 100,000 random inputs, they report an empirical success probability of 0.99809 and a retry-adjusted Q-times-T proxy of about 1.961 billion; they explicitly say that proxy is not a full-Shor success estimate.

After the cutoff, the [preprint reports](https://arxiv.org/abs/2609.09582v1) a Q-times-T result of about 1.259 billion using 1,321 qubits and 952,707 average executed Toffoli gates, as well as a separate low-width result of 813 qubits. These are different optimization targets: a lower product score does not necessarily mean a lower qubit count.

## Limits of the result

The [paper says](https://arxiv.org/abs/2609.09582v1) a cryptographically relevant quantum computer capable of solving the elliptic-curve discrete logarithm problem could recover private signing keys from exposed public keys and forge ECDSA signatures. It also says the timing of such a machine, which it calls Q-day, remains uncertain.

The reported circuit result does not provide a fault-tolerant quantum computer, run a complete implementation of Shor's algorithm against a Bitcoin key, or establish a present-day Bitcoin attack. The [authors note](https://arxiv.org/abs/2609.09582v1) that a full estimate depends on factors outside this point-addition benchmark, including error correction, hardware assumptions, the rest of Shor's algorithm, and runtime scheduling.

The [authors further caution](https://arxiv.org/abs/2609.09582v1) that the benchmark score is sampled, approximate circuits can pass finite validation, the public archive does not include every attempt, and the mix of human and AI contribution is observational rather than a controlled causal comparison. The preprint is publicly available with its [challenge code](https://github.com/Layr-Labs/ecdsafail-challenge), but its claims remain those of the authors' submitted research rather than a completed attack or a timetable for breaking Bitcoin.

## The Google baseline it chases

The "beat Google" framing refers to a March 2026 paper from Google researchers estimating that Shor's algorithm could break 256-bit elliptic-curve keys with either fewer than 1,200 logical qubits and 90 million Toffoli gates, or fewer than 1,450 qubits and 70 million gates. On superconducting hardware with standard error rates, the circuits could run in minutes on fewer than half a million physical qubits, [that paper says](https://arxiv.org/abs/2603.28846). The ECDSA.Fail authors caution that their score sits more than 50 percent below Google's thresholds only under different accounting conventions, and that differing interfaces and validation scope rule out formal dominance claims.

Independent reconstruction has partly validated the open approach. Google withheld its circuits in March; within 63 days an independent researcher had rebuilt them, matching the qubit counts and beating gate counts by about 10 percent. The leaderboard's credibility rests on thousands of automated checks covering ancilla cleanup, phase correctness, and inverse-restores-state properties, [postquantum.com recounted in June](https://postquantum.com/post-quantum/quantum-attack-ecc-circuit-floor). The longer history shows steady compression: a 2017 reference design needed 2,330 qubits and around 130 billion Toffoli gates for the same curve, with windowing techniques trading qubits for gates since, [the same account says](https://postquantum.com/post-quantum/quantum-attack-ecc-circuit-floor).

## Bitcoin's side of the ledger

Bitcoin developers are not waiting for certainty. BIP-361, assigned in February as a draft proposal, sketches a post-quantum migration with a sunset for legacy signatures: roughly three years after activation, sending to quantum-vulnerable addresses would be disallowed, with signature verification tightened two years later, [the proposal text says](https://bitcoin.org/bip/361). Its motivation section counts more than 34 percent of all bitcoin sitting behind revealed public keys as of March 1, and cites standard-setters' post-quantum standards alongside roadmaps putting a capable machine as early as 2027 to 2030. A companion proposal, BIP-360, would let users receive through Merkle roots instead of exposing Taproot keys at funding time, [Blockstream explains](https://blog.blockstream.com/quantum-computing-and-bitcoin-eli5).

Hardware remains far short of any of this. IBM's Condor reached 1,121 qubits in 2023, Google's Willow chip demonstrated below-threshold error correction with 105 qubits in late 2024, and a 6,100-qubit neutral-atom array counts raw qubits rather than usable compute, [the Blockstream explainer notes](https://blog.blockstream.com/quantum-computing-and-bitcoin-eli5). Physical-qubit requirements have fallen roughly twentyfold across three papers from 2025 into 2026, from around 13 million to under half a million in Google's estimate, with the most aggressive unproven designs below 10,000. Expert timing guesses span widely: a 2025 survey put 28 to 49 percent odds on a capable machine within ten years, Adam Back estimates 20 to 40 years, and a rough consensus sits at 10 to 20, [per the same piece](https://blog.blockstream.com/quantum-computing-and-bitcoin-eli5). About 30 percent of circulating bitcoin, some 6 million coins, sits behind already-exposed keys, while roughly 65 percent rests behind unrevealed addresses until spent.

The paper's own line on timing stays where the field is: uncertain, citing standards bodies retiring 112-bit classical security after 2030 and one hardware-gated window of 2027 to 2033. Circuit optimization keeps shrinking the machine anyone would need. Building it is a different problem, and the preprint does not claim otherwise.
