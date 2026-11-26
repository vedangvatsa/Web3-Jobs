---
title: Ethereum Foundation doubles security team for post-quantum overhaul
ogTitle: "ETHEREUM FOUNDATION DOUBLES POST-QUANTUM SECURITY TEAM"
description: The Ethereum Foundation has doubled its dedicated security engineering headcount to accelerate post-quantum cryptography research and protocol upgrades.
image: /og-news.png
category: News
publishedDate: '2026-11-26'
lastUpdated: '2026-11-26'
---

The Ethereum Foundation has doubled the size of its internal security team as part of a multi-year effort to prepare the Ethereum protocol for post-quantum cryptography.

The expanded team will focus on researching, prototyping, and auditing quantum-resistant signature schemes, hash-based commitments, and account-abstraction migration paths. While large-scale fault-tolerant quantum computers capable of breaking elliptic-curve cryptography remain years away, core researchers view early protocol readiness as essential given the time required to coordinate network-wide upgrades across thousands of validators, wallet providers, and Layer 2 rollups.

Currently, Ethereum relies on ECDSA (secp256k1) for user transaction signatures and BLS signatures for consensus attestations—both of which would be vulnerable to Shor's algorithm on a sufficiently powerful quantum computer. Transitioning the network requires not only selecting mathematically sound replacements, but also ensuring those schemes do not bloat block sizes or degrade node verification performance.

Key workstreams for the expanded security group include evaluating lattice-based and hash-based signature alternatives, minimizing calldata and verification overhead for post-quantum proofs, and designing backward-compatible migration paths through account abstraction so existing externally owned accounts can upgrade smoothly.

The hiring expansion reflects a broader industry shift toward long-term cryptographic resilience across Layer 1 networks. By investing in dedicated security engineering now, the Ethereum Foundation aims to ensure that quantum-resistant standards are thoroughly battle-tested long before quantum hardware poses a practical threat to onchain assets.
