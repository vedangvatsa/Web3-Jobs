---
title: Ethereum Merges Fix for Glamsterdam Staking Deposit Bug
ogTitle: "ETHEREUM MERGES FIX FOR GLAMSTERDAM STAKING DEPOSIT BUG"
description: Developers merged a consensus-specs change on Oct. 26 that stops builder deposits from capturing ETH meant for new validators under the coming Glamsterdam upgrade.
image: /images/news/depositbug.jpg
imageCaption: "Ethereum co-founder Vitalik Buterin at TechCrunch Disrupt London in 2015. Photo: John Phillips via Wikimedia Commons (CC BY 2.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Vitalik_Buterin_TechCrunch_London_2015.jpg
category: News
data-ai-hint: ethereum founder at conference
publishedDate: '2026-10-28'
lastUpdated: '2026-10-28'
---

Ethereum developers merged a fix on Oct. 26 for a flaw in the coming Glamsterdam upgrade that could have let a block builder receive ETH that staking services deposited to start new validators. The change, [pull request 5736](https://github.com/ethereum/consensus-specs/pull/5736) in the ethereum/consensus-specs repository, was authored by researcher avsetsin and merged by specification maintainer Justin Traglia after an initial rejection a week earlier.

The bug sat in rules still under development for how Ethereum would process validator deposits waiting at the moment of the upgrade. Under the draft logic, if an operator first registered as a builder using a particular public key and a staking service then deposited ETH to start a validator under that same key, both deposits could be credited to the builder. "The operator can withdraw the protocol's funds," avsetsin wrote in the GitHub report quoted by [CoinDesk](https://www.coindesk.com/tech/2026/10/27/ethereum-fixes-glamsterdam-bug-that-could-have-sent-staking-deposits-to-builders).

No validator would be created in that scenario, so the staking service could not produce the proof it needed to recover the deposit. Avsetsin examined how Lido, Origin and Rocket Pool could be affected in what the researcher called quick AI research. Those findings depended on how each protocol handles deposits, and were described as conditional code findings rather than confirmed live exploits. Existing checks rejecting an earlier builder deposit could stop the attack in some paths. No losses have been reported.

Developers closed the proposed fix on Oct. 19. "There was not enough support from clients to make this change at this time," Traglia wrote at the time. Clients are the separate software programs validators run to take part in the network. The pull request was reopened after further review, avsetsin added tests on Oct. 23 covering cases where builder and validator deposits share a public key but require separate handling, and reviewer potuz approved the approach while asking for more tests, [crypto.news noted](https://crypto.news/ethereum-glamsterdam-validator-deposit-bug-fix/). Traglia merged the change on Oct. 26 after further client review.

Under the new rules, pending deposits are sorted by their withdrawal credentials, the setting that determines where a deposit's funds can eventually go. Validator deposits stay in the validator queue even if a builder is using the same key. A valid builder deposit registers or tops up the builder, even if a validator uses the same key, [the merged pull request states](https://github.com/ethereum/consensus-specs/pull/5736). An invalid builder deposit without a builder stays queued only if a validator with the key exists or an earlier valid validator deposit is queued.

The correction is now part of Ethereum's consensus specifications, but client teams still have to build the revised rules into their software and finish testing. The merged change contains regression tests covering how deposits are classified during the Gloas transition, the consensus half of Glamsterdam. Before the updated rules can operate during a network upgrade, each client must implement the specification change and complete further testing.

Glamsterdam splits up two jobs that are bundled together today. Builders package transactions into blocks, and validators, who stake ETH to help secure the network, pick and confirm them. Both roles can deposit ETH, and the upgrade is meant to track their money separately through enshrined proposer-builder separation. The deposit flaw showed how a shared public key could blur that separation during the fork transition itself, when deposits still waiting to be credited are processed under the new rules.

Glamsterdam has already run on the Sepolia test network, where developers examined block construction changes and higher transaction-processing capacity. Its planned October activation on Hoodi was postponed over a separate issue involving EIP-8037 and existing smart contracts. Ethereum researcher Toni Wahrstätter explained that EIP-8037 could interfere with contracts relying on assumptions about gas remaining during execution. That contract-compatibility problem is distinct from the builder-deposit flaw. No new Hoodi date has been set, and mainnet scheduling depends on that remaining testnet rehearsal.
