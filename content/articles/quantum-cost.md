---
title: StarkWare reports 79% cut in estimated quantum-safe Bitcoin compute cost
ogTitle: "QUANTUM-SAFE BITCOIN COMPUTE ESTIMATE FALLS 79%"
description: An open GPU optimization challenge reduced the estimated cost of preparing an experimental Bitcoin transaction to about $67, with production testing and access limits still unresolved.
image: /images/news/quantum-cost.jpg
imageCaption: "Nvidia RTX 4090 Founders Edition graphics card and packaging; the challenge benchmarks GPU code on an RTX 4090. Photo: ZMASLO via Wikimedia Commons (CC BY 3.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:NVIDIA%20RTX%204090%20Founders%20Edition%20-%20Verpackung%20(ZMASLO).png
category: News
data-ai-hint: Nvidia RTX 4090 graphics hardware packaging
publishedDate: '2026-09-24'
lastUpdated: '2026-09-24'
---

StarkWare said on September 23 that an open software-optimization competition had reduced the estimated GPU cost of preparing a quantum-safe Bitcoin transaction to about $67, down from roughly $320. The [company's week-one update](https://starkware.co/blog/ai-research-competition-cut-quantum-safe-bitcoin-costs-by-79-in-a-week/) puts the reduction at about 79%, while cautioning that the benchmark improvements still need to be measured in the production transaction-building software.

The Quantum-Safe Bitcoin Optimization Challenge is run by StarkWare, Yukon Research and Eigen Labs. It targets the computation required before an experimental transaction can be sent to a miner. The reported saving therefore concerns preparation costs, rather than a reduction in Bitcoin network fees or a change to the network's consensus rules.

"The $67 is an estimate under stated hardware assumptions, not a price," StarkWare wrote. The figure changes as competitors improve the code. By September 24, [Unchained reported](https://unchainedcrypto.com/ai-assisted-developers-cut-quantum-safe-bitcoin-cost-estimate-to-66-in-starkware-contest/) that the live dashboard displayed $66. Both figures are estimates, rather than a fixed transaction service charge.

## Faster searches before a transaction reaches Bitcoin

Quantum-Safe Bitcoin, or QSB, uses hash-based protection in a transaction construction that works under existing Bitcoin consensus rules. StarkWare researcher Avihu Levy published the design in April. [Cointelegraph's account of the new results](https://cointelegraph.com/news/bitcoins-last-resort-quantum-safe-solution-just-got-79-cheaper-starkware) says the first QSB transaction was confirmed on mainnet on August 26, after approximately 3,100 GPU-hours of preparation across roughly 100 GPUs. Its approximately $320 compute bill excluded Bitcoin network fees.

The expensive work is a search performed offchain. As [StarkWare explains](https://starkware.co/blog/ai-research-competition-cut-quantum-safe-bitcoin-costs-by-79-in-a-week/), the construction needs a hash output whose bytes satisfy Bitcoin's required signature format. Suitable outputs are rare, so the software changes inputs, hashes them and checks the results repeatedly. Processing more candidates per second reduces the GPU time needed for that search.

The competition separates the work into transaction pinning and subset selection. At the September 23 cutoff, pinning throughput had risen from 146.09 million verified candidates per second to just over 820 million on the benchmark RTX 4090. Subset selection had increased from about 62 million to approximately 623.5 million per second. The company reported 62 promoted submissions across the two tracks, with 23 solvers participating in pinning and 17 in subset selection.

Entrants build on previously verified improvements. According to the [update's description of the evaluation process](https://starkware.co/blog/ai-research-competition-cut-quantum-safe-bitcoin-costs-by-79-in-a-week/), each submission is checked against a CPU reference implementation, and timing uses inputs the solver has not previously seen. Faster code that skips required work is rejected. Developers have used different AI tools to help produce candidate implementations, rather than submitting one shared optimization approach.

## Benchmark savings leave deployment limits intact

The benchmark does not construct Bitcoin transactions itself. It reproduces the GPU demands of the search and applies measured improvements to the earlier cost baseline. As [Cointelegraph notes](https://cointelegraph.com/news/bitcoins-last-resort-quantum-safe-solution-just-got-79-cheaper-starkware), the latest gains have been demonstrated in benchmark tests. They are not evidence that an optimized transaction has already been mined at the quoted cost.

The hardware assumptions also differ between measurement and cost modeling. [Unchained's report](https://unchainedcrypto.com/ai-assisted-developers-cut-quantum-safe-bitcoin-cost-estimate-to-66-in-starkware-contest/) describes the cost dashboard as modeling a simulated fleet of 100 RTX 3090 cards, while the competition measures candidate throughput on an RTX 4090.

There are also limits unrelated to GPU speed. QSB transactions are nonstandard and do not pass through the ordinary mempool, so they must be submitted directly to a miner. The construction protects only coins whose public keys have not already been exposed, [the company says](https://starkware.co/blog/ai-research-competition-cut-quantum-safe-bitcoin-costs-by-79-in-a-week/). Faster preparation does not extend protection to already-exposed keys or remove the direct-submission requirement.

The underlying cryptographic assumptions need care too. Hash functions are affected by quantum algorithms, although differently from the elliptic-curve signatures used by Bitcoin. StarkWare's update cites the QSB paper's approximately 118-bit second-preimage security estimate and a rough reduction to 59 bits under Grover's algorithm. The company identifies that reduction as something to reassess as quantum hardware improves.

StarkWare continues to favor a soft fork for broad, long-term quantum protection on Bitcoin. Its September 23 update presents QSB as an emergency construction available under current rules, with production measurement of the benchmark speedups still outstanding.
