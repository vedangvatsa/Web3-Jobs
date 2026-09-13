---
title: Preprint Reports Lower Quantum Cost Metric for Bitcoin's Curve
description: >-
  A preprint reports that an open human-and-AI effort reduced the benchmark
  score for a reversible secp256k1 point-addition circuit used in Shor-algorithm
  research, while the authors say the timing of cryptographically relevant
  quantum computing remains uncertain.
image: >-
  /api/og?type=article&title=Preprint%20Reports%20Lower%20Quantum%20Cost%20Metric%20for%20Bitcoin%27s%20Curve
category: News
data-ai-hint: quantum circuit secp256k1 research
publishedDate: '2026-09-12'
lastUpdated: "2026-09-13"
ogTitle: NEW PREPRINT REASSESSES BITCOIN QUANTUM RISK
---

An [arXiv preprint](https://arxiv.org/abs/2609.09582v1), submitted September 9, describes an open project in which people and AI agents optimized a quantum circuit for secp256k1 point addition. The authors report an 86.1% reduction in the project's Q-times-T benchmark score. Secp256k1 is the elliptic curve used for Bitcoin transaction authorization, but the result is a circuit-optimization and resource-estimation result, not a demonstrated quantum attack on Bitcoin.

The [preprint](https://arxiv.org/abs/2609.09582v1) calls the effort ECDSA.Fail and describes its "Open Autoresearch" process as a public leaderboard where contributors submit improvements that an evaluator checks. The project targets a reversible mixed point-addition circuit, which the authors describe as a bottleneck in Shor's algorithm for elliptic-curve cryptography. Its [public repository](https://github.com/Layr-Labs/ecdsafail-challenge) describes the task as adding a classically supplied point to a point represented in quantum registers.

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
