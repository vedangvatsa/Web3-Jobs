---
title: AI-Agent Circuit Challenge Cuts a Quantum Cost Metric for Bitcoin's Curve
description: An open human-and-AI effort reduced the benchmark score for a reversible secp256k1 point-addition circuit used in Shor-algorithm research, while the paper says the timing of cryptographically relevant quantum computing remains uncertain.
image: /api/og?type=article&title=AI-Agent%20Circuit%20Challenge%20Cuts%20a%20Quantum%20Cost%20Metric%20for%20Bitcoin%27s%20Curve
category: News
data-ai-hint: quantum circuit secp256k1 research
publishedDate: '2026-09-12'
lastUpdated: "2026-09-12"
---

An open research project in which people and AI agents iteratively optimized a quantum circuit has cut the project's score for a secp256k1 point-addition task by 86.1%, according to the authors of the new [ECDSA.Fail paper on arXiv](https://arxiv.org/html/2609.09582v1). Secp256k1 is the elliptic curve used for Bitcoin transaction signatures. The work is a resource-estimation and circuit-optimization result, not a demonstration of a working quantum attack on Bitcoin.

The paper describes an effort called ECDSA.Fail, which used what its authors call "Open Autoresearch": a public, verifier-gated process in which human contributors and AI agents submit candidate improvements to a machine-checkable benchmark. [Decrypt's report on the project](https://decrypt.co/377925/ai-agents-slash-cost-quantum-attack-bitcoin) brought the result to the attention of crypto readers because the underlying curve is central to Bitcoin's signature system. The researchers' actual target, however, is a reversible point-addition circuit, one component of an implementation of Shor's algorithm for the elliptic-curve discrete logarithm problem.

That distinction sets the limits of the result. A smaller estimate for one circuit component does not supply a fault-tolerant quantum computer, does not run Shor's algorithm against a Bitcoin key, and does not show that Bitcoin can presently be attacked. The paper itself says the timing of a cryptographically relevant quantum computer remains uncertain. It describes the security consequence conditionally: such a computer, if capable of solving the elliptic-curve discrete logarithm problem, could recover private signing keys from exposed public keys and forge ECDSA signatures.

![ECDSA.Fail benchmark score trajectory](https://arxiv.org/html/2609.09582v1/figs/ecdsafail-QxT-score-trajectory.png)

*Figure from the [ECDSA.Fail paper](https://arxiv.org/html/2609.09582v1), showing the benchmark score trajectory described by the authors.*

## A benchmark for one hard part of Shor's algorithm

ECDSA, short for the Elliptic Curve Digital Signature Algorithm, is the signature scheme relevant to the paper's discussion of Bitcoin. A private key is used to produce a signature; a corresponding public key lets others verify it. The paper frames the quantum concern around the elliptic-curve discrete logarithm problem, or ECDLP: deriving a private scalar from a public elliptic-curve point. Classical computers are not known to solve the properly sized ECDLP efficiently, which is why the problem supports elliptic-curve cryptography.

Shor's algorithm is the quantum algorithm the authors examine. In principle, a sufficiently capable fault-tolerant quantum computer could use it to solve discrete logarithms on elliptic curves. But "in principle" carries substantial engineering requirements. The algorithm needs a large, error-corrected computation, and researchers estimate its cost through logical qubits, gates, circuit depth, hardware assumptions, error-correction choices, and other details. None of those resources is furnished by an improved arithmetic circuit on its own.

The ECDSA.Fail challenge isolates a narrow arithmetic task within that wider problem: reversible mixed point addition on secp256k1. Point addition is an operation on an elliptic curve. In the challenge's form, one point is represented in a quantum register while the other addend is supplied classically. The paper calls this operation a bottleneck in Shor's algorithm for elliptic-curve cryptography because it must be implemented coherently and reversibly inside a quantum circuit.

Reversibility is not an incidental constraint. Ordinary computing can overwrite temporary values as it proceeds. A quantum circuit must preserve the information needed to reverse a calculation and clean up temporary state before later operations can use its registers safely. Designing point addition under those constraints requires arithmetic circuits for operations such as modular multiplication, inversion, comparisons, and control flow, along with a way to remove intermediate data. The benchmark gave participants a concrete place to look for reductions in those costs.

The project scores a submitted circuit with Q multiplied by T. Q is peak logical-qubit width, and T is average executed Toffoli count. A Toffoli gate is a standard multi-qubit operation used in reversible computation; the paper uses its count as a measure of nontrivial reversible work. Multiplying width by this gate-count measure creates a spacetime-inspired score rather than a direct prediction of a machine's physical size, price, or time to attack a particular key.

That metric is useful for comparing entries under the challenge's stated rules, but it also narrows what the number means. It does not by itself include every physical implementation issue. The authors state that the score omits Toffoli depth and parallelism, so two circuits can receive the same Q-times-T score even if their gate schedules differ. They also caution that the benchmark's interface and accounting conventions differ from other published or reported point-addition results.

## What the reported reduction measures

At the paper's data cutoff of July 26, 2026, the best Q-times-T circuit used 1,151 logical qubits and an average executed Toffoli count of 1,299,453. That produces a score of about 1.496 billion, the paper reports. The project's initial baseline was 10.75 billion, so the reduction to the cutoff result was 86.1% under the benchmark's scoring method.

The numbers describe a tradeoff, not a count of physical qubits in an existing device. Logical qubits are error-corrected computational units in a fault-tolerant design. A physical quantum computer needs many physical qubits and an error-correction architecture to form and operate logical qubits reliably. The paper's Q measure is a circuit-resource value, while the translation from logical resources to a deployed quantum machine depends on assumptions beyond this benchmark.

The authors also report a later result after their data cutoff. A submission using what the paper calls a comparison-free "ping-pong" dialog-GCD technique brought the Q-times-T score to approximately 1.259 billion, with Q equal to 1,321 and T equal to 952,707. The same paper reports a separate later circuit using 813 qubits in its low-width track. Those entries show that a lower product score and a lower qubit count can be different optimization targets; reducing one resource can require spending more of another.

The paper compares its cutoff result with a reported Google/Babbush point-addition operating point and an open design by Martin Schrottenloher. It says the challenge result is more than 50% below Google's reported Q-times-T point. Yet the authors explicitly say that different interfaces and accounting conventions preclude formal dominance over the reported Google point. That caveat is part of the result, not a footnote that can be dropped when the numbers are repeated.

One reason is the addend interface. In the core benchmark, one addend is classical. In a windowed version of Shor's algorithm, an addend must be selected coherently, which changes the circuit interface. To address that gap, the researchers constructed a windowed-addition-compatible variant of their best cutoff circuit. They report 1,162 logical qubits and 1,684,161 average executed Toffoli gates for that single-call variant, along with an empirical success probability of 0.99809 on 100,000 random inputs.

The authors present a retry-adjusted proxy of Q times T divided by the observed success probability for that variant, about 1.961 billion. They do not present the benchmark score as a complete, end-to-end cost for running Shor's algorithm against secp256k1, much less as a timetable for breaking a Bitcoin address. The paper's own comparison language remains contextual because the circuits do not use identical interfaces, correctness assumptions, or resource accounting.

## How human and AI participants worked

The project's methodological claim is as notable as its final score. ECDSA.Fail did not ask an AI system to generate a finished quantum attack independently. It set up an open repository, leaderboard, evaluator, and challenge rules so that contributors could submit a proposed circuit change and receive a machine-checked result. The paper says more than 100 leaderboard contributors and more than 400 promoted submissions were in the public record at the data cutoff.

The authors describe human insight and agent automation as complementary. Participants could inspect a baseline, form an idea about an arithmetic or register-use change, make an implementation, run the evaluator, and publish an improvement if it passed. AI agents could contribute to that loop by generating hypotheses, editing code, running experiments, and analyzing score changes. The verifier, rather than an agent's prose account of success, was the gate for a leaderboard improvement.

That setup matters because circuit optimization produces many ideas that are invalid, fail tests, increase a different resource, or cannot be reconciled with reversible computation. An automated evaluator makes those failures cheaper to identify. It does not convert a passing finite test set into a mathematical proof of correctness, and the paper identifies that limit directly. Approximate circuits can pass finite validation, the authors write, while the score itself is sampled and can be affected by support selection.

The paper identifies several techniques used across the submissions: jump-2 Euclidean steps, compressed transcript codecs, comparison-free ping-pong dialog-GCD, Karatsuba squaring with pseudo-Mersenne reduction, register sharing, constant propagation, and dead-code elimination. These are circuit-design and compiler-style optimizations. They reduce temporary space, reversible operations, or unnecessary computation within the task; they are not new cryptanalytic breaks of ECDSA or secp256k1.

The dialog-GCD work illustrates the scope. Modular inversion is expensive in elliptic-curve arithmetic, and reversible inversion must record enough information to undo itself. The paper builds on record-and-replay extended Euclidean approaches and changes how the transcript is produced, represented, and replayed. The later ping-pong method avoids comparisons in a part of that process. Those changes can lower a benchmarked quantum-circuit cost without changing the mathematical problem that secp256k1 presents to ordinary computers.

The open structure also gives researchers a record that can be inspected after the fact. The paper says its artifacts include a public challenge repository, a frozen dataset for the cutoff frontier, circuit descriptions, and an evaluator. That is different from treating a single estimate as a black box, but reproducible circuit artifacts still need to be read with their stated tests, score definitions, and implementation assumptions in mind.

## The Bitcoin connection is conditional

Bitcoin uses secp256k1 for transaction authorization, which is why a secp256k1 resource estimate has direct relevance to Bitcoin's long-term cryptographic planning. The connection becomes operational only under conditions the paper does not claim have been met: a cryptographically relevant quantum computer would need to be capable of running a complete ECDLP-solving computation at the required scale, with fault tolerance and resources adequate for the task.

The paper specifies an additional condition for the private-key scenario it describes: the public key must be exposed. Given an exposed public key, a CRQC capable of solving ECDLP could derive the corresponding private signing key and produce a forged ECDSA signature, according to the authors. That statement describes a potential capability of a future class of machine. It does not establish that current quantum hardware can recover a Bitcoin private key, that a practical attack exists, or that Bitcoin is currently vulnerable to such an attack.

Public-key exposure is relevant because an attacker needs the elliptic-curve public point to pose the discrete-logarithm problem in this form. The paper does not turn that fact into a claim about any specific Bitcoin holder, transaction, wallet implementation, or current attack window. It makes a cryptographic observation about what a sufficiently capable machine could do when the necessary public-key information is available.

Resource studies matter because a future threshold is influenced by how costly the best known quantum circuits are. If a component consumes fewer logical qubits or fewer executed Toffoli gates under a given model, that can improve a researcher's estimate relative to a less efficient component. But it does not settle when usable hardware will arrive. The paper says Q-day's timing remains uncertain even while noting that post-quantum migration work is already under way in other settings.

That uncertainty extends beyond the point-addition circuit. A full practical estimate must account for the rest of Shor's algorithm, logical error rates, the cost of producing magic states or comparable resources, error-correction code choices, physical gate quality, connectivity, runtime scheduling, and assumptions about how much hardware can operate in parallel. ECDSA.Fail's Q-times-T number deliberately tracks a smaller task. It is evidence about one bottleneck, not an all-inclusive security forecast.

The paper also warns against treating the visible leaderboard as a complete measure of the search process. Its public archive has an incomplete denominator of attempts, meaning not every unsuccessful idea or private trial necessarily appears in the record. And because contributors used differing combinations of human direction and AI assistance, the trajectory is observational rather than a controlled causal experiment that can quantify what an agent did versus what a human did.

Those limitations make the project's result more precise, rather than less useful. It supplies a reported reduction in a defined, independently evaluable circuit metric and an open account of techniques that produced it. It does not supply a present-day attack against Bitcoin. The authors' own conclusion leaves the timing question unresolved: progress in circuit design can lower estimates for an eventual cryptographically relevant quantum computer, while the existence and arrival date of such a machine remain uncertain.
