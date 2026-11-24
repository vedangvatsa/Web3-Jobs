---
title: Qubic halts network after attacker drains 1,404 wallets
ogTitle: "QUBIC HALTS NETWORK AFTER ATTACKER DRAINS 1,404 WALLETS"
description: Qubic stopped its mainnet after an attacker drained 1,404 wallets holding about 2.94 trillion QU, and most of the tokens remain frozen on the network.
image: /images/news/qubicdrain.jpg
imageCaption: "Server racks in the Wikimedia Foundation data center. Photo: Victorgrigas via Wikimedia Commons (CC BY-SA 3.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Wikimedia%20Foundation%20Servers-8055%2013.jpg
category: News
data-ai-hint: data center server racks
publishedDate: '2026-10-19'
lastUpdated: '2026-10-19'
---

Qubic halted its mainnet on Oct. 18 after an attacker drained 1,404 wallets holding about 2.94 trillion QU. The project said in a [statement](https://x.com/_qubic_/status/2111796725677715474) that Computors, the operators who run the network, coordinated a protective halt and that no transactions are processing while the loss is handled.

The attacker moved funds between 23:42 UTC on Oct. 17 and 01:26 UTC on Oct. 18, a window of about 1 hour and 44 minutes. [Crypto Briefing](https://cryptobriefing.com/qubic-halts-mainnet-wallet-drain/) put the value at about $1.3 million at the time of the drain, while [Cointelegraph](https://cointelegraph.com/news/qubic-freezes-chain-after-attacker-drains-14k-wallets-with-weak-seeds) reported the figure at about $1.4 million.

Qubic said the loss did not come from a flaw in the protocol. The affected wallet seeds were generated with insufficient randomness on some legacy Apple devices and software, the project said. Seeds are affected if they were created in any browser on an iPhone or iPad before Oct. 18, in Safari on a Mac before that date, or in the Qubic iOS app before July 2025. The attacker used the weak seeds to reach the wallets, Qubic said.

Validators stopped the chain at tick 85,371,949. A tick is Qubic's unit of network progress, roughly comparable to a block on other chains. Halting at that point freezes the ledger, so the drained tokens cannot be moved or sold while the network is paused.

Qubic said 87.1% of the drained funds never left its network and remain frozen in place. The remaining 12.9% was sent to the exchange MEXC, which froze the receiving account within about an hour, according to the project. Qubic said it notified exchanges and that they suspended QUBIC deposits and withdrawals. Crypto Briefing reported that Bitget suspended QUBIC deposits and withdrawals as a precaution.

Qubic released client version 4.26.4 to fix the seed generation weakness. A GitHub commit for the release shows the project replaced JavaScript's Math.random() function, which is not suitable for cryptographic secrets, with the cryptographically secure crypto.getRandomValues() function when creating wallet seeds. Cointelegraph reported the change. Qubic said no new weak seeds can be created. The project said QEARN, its staking feature, was not affected.

What happens to the frozen funds is a decision for the Computor quorum under the network's rules. Qubic said its core team is identifying every affected identity and preparing options for the quorum to vote on. A community poll is open on Discord, and the team said it would publish a full technical report once a recovery plan is settled. Qubic has not announced when the network will restart.

Affected users are being told to file reports with police or cybercrime authorities in their countries and to include their wallet ID, the amount lost and the transaction link from the Qubic explorer. Qubic said formal reports help exchanges keep funds frozen.

Qubic is a layer-1 network that processes transactions and smart contracts without fees. Cointelegraph reported that it uses a consensus mechanism it calls Useful Proof of Work, which repurposes mining energy to train artificial intelligence, and that its QU token had a market capitalization of about $62.6 million at the time of writing, citing CoinGecko.

The incident is the second time in 2026 that Qubic has been hit through a component next to its core network, according to Crypto Briefing. In August 2026, the Vottun Bridge was exploited. The publication tied that breach to operational risks in the network's outer components.

The wallet drain adds to a run of incidents tied to weak or leaked seeds. In July, Coldcard disclosed that attackers had stolen funds from wallets whose seeds were weakened by a firmware bug, a case Cointelegraph reported. Similar flaws affected Trust Wallet's browser extension and the Libbitcoin Explorer tool in 2023, the outlet reported.

Qubic has not said whether affected users will be reimbursed or how the frozen tokens would be returned. The project also has not given a date for the next update or for the resumption of deposits and withdrawals at exchanges that paused QUBIC transfers.
