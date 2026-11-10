---
title: Anza files Solana proposal to remove durable nonces
ogTitle: "ANZA FILES SOLANA PROPOSAL TO REMOVE DURABLE NONCES"
description: SIMD-0723 would end Solana's durable nonce feature, the mechanism behind pre-signed approvals in the April Drift hack, with no mainnet activation before May 5, 2027.
image: /images/news/simdnonces.jpg
imageCaption: "Rows of illuminated server racks inside a data center. Photo: Carl Lender via Wikimedia Commons (CC BY 2.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Datacenter%20Server%20Racks%20(22370909788).jpg
category: News
data-ai-hint: data center server racks
publishedDate: '2026-11-10'
lastUpdated: '2026-11-10'
---

A developer at Anza has filed a formal proposal to remove durable nonces from Solana, the feature that keeps a signed transaction valid indefinitely instead of tying it to a recent blockhash. The draft, [SIMD-0723, opened on GitHub on Nov. 5](https://github.com/solana-foundation/solana-improvement-documents/pull/723) under the name grod220, would require every transaction to carry a fresh blockhash and would disable the System Program instructions that initialize, advance and upgrade nonce accounts.

[CoinMarketCap identified](https://coinmarketcap.com/academy/article/solana-simd-remove-durable-nonces) the author as Gabe R. of Anza, the firm behind Solana's main validator software, and dated the document to Nov. 5. The pull request is open and carries no approvals yet. Its process requires sign-off from at least one engineer at Anza and one at Firedancer, the validator client built by Jump, before it can merge.

The proposal's case rests on the feature's history rather than on any single hack. "The special cases they require, from transaction validation through replay, have repeatedly caused security vulnerabilities and consensus bugs in validator clients," the draft states, according to CoinMarketCap. It lists a 2019 flaw that let failed nonce transactions be replayed to drain fees, a 2022 incident that halted mainnet for about 4.5 hours, Firedancer bugs between 2024 and 2026, and a 2026 testnet case in which one client rejected a block that others accepted.

Durable nonces were added in 2019 for offline and delayed signing. An ordinary Solana transaction expires once its blockhash passes 150 blocks old, so a nonce account value that never goes stale lets a signature sit for days or weeks. Custodians and exchanges sign on air-gapped machines that cannot broadcast inside that window, which is why the proposal names them as the affected group and points to onchain signature programs, Programmatic Signer and Blueshift Vector, as replacements.

The press tie to the April 1 Drift hack is not in the draft's text. [Coindaro reported](https://www.coindaro.com/solana-durable-nonces-removal-simd-0723/) that the document never mentions Drift, and that the connection comes from coverage led by CoinDesk, whose headline links the proposal to the attack in which security council members pre-signed transactions with durable nonces and those approvals were used more than a week later. Coindaro put the losses across firm estimates at roughly 285 million dollars to 295 million dollars, against CoinDesk's "at least 270 million dollars" figure, and noted that the proposal was filed seven months after the hack.

Usage data shows why the feature draws fire. [Analysis cited in the coverage](https://www.coindaro.com/solana-durable-nonces-removal-simd-0723/) from researcher Max Resnick's June thread found durable nonce transactions made up about 3.1 percent of network activity in one epoch while paying roughly 30 percent of all priority fees, with 555 accounts sending 97.5 percent of them. The proposal separately argues that a sender can sign many transactions against one nonce value, and that once one lands the rest pay nothing while validators still process them.

The draft accepts one cost in writing: a nonce account that holds SOL but was never initialized could be emptied after activation only by a signature from the account's own address, and without that signer the balance stays locked. "This proposal accepts that loss," the text says, as Coindaro noted.

GitHub's own timeline shows where the review stands. Anza engineer apfitzge left comments on Nov. 5, the day of filing, and the author pushed two more commits on Nov. 6 to mention SIMD-0602, a related proposal merged into the repository that bars nonce accounts from serving as program IDs. The draft also waits on SIMD-0610, merged on Sept. 15, which stops nonce accounts from withdrawing their full balance to themselves; that feature must be active on a cluster before SIMD-0723 can activate there. The impact section adds that programs calling the three disabled instructions would break, even when they carry a recent blockhash.

Timing is explicit. Activation cannot reach mainnet-beta before May 5, 2027, giving users at least six months from publication, while the Solana Foundation's separate deprecation page still lists no date, so the real cutoff could land later. The replacement for the softer alternative, SIMD-0571, is already aging out: the repository bot marked that earlier proposal stale on Nov. 9 after 60 days without activity, with automatic closure set for seven days later.
