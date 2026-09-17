---
title: Ethereum Glamsterdam Rehearsal Clears Path to Sepolia Test
ogTitle: "ETHEREUM GLAMSTERDAM REHEARSAL CLEARS PATH TO SEPOLIA TEST"
description: Ethereum's Glamsterdam upgrade kept confirming blocks on its Devnet-11 rehearsal network this week, with Nethermind passing all 2,302 performance tests and the gas limit raised to 200 million, ahead of a proposed Oct. 6 Sepolia deployment.
image: /images/news/glamsterdam.jpg
imageCaption: "A technician works on a server rack. Ethereum validators run similar hardware to process blocks. Photo: Derrick Coetzee via Wikimedia Commons (CC0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Technician_with_laptop_working_on_server_rack_at_NERSC.jpg
category: News
data-ai-hint: server rack technician hardware
publishedDate: '2026-09-17'
lastUpdated: '2026-09-17'
---

Ethereum's coming Glamsterdam upgrade kept confirming blocks under new block-building rules this week, clearing a key rehearsal before a proposed Oct. 6 deployment on the Sepolia public test network, [CoinDesk reported](https://www.coindesk.com/tech/2026/09/17/ethereum-s-upcoming-glamsterdam-upgrade-clears-rehearsal-for-a-big-jump-in-capacity). The test network raised its limit on work per block toward 200 million gas as developers prepare for that public test.

Nethermind, one of the programs computers use to run Ethereum, followed on Wednesday with a performance test of the upgrade's biggest change. Its execution software completed all 2,302 tests while processing 570.7 billion gas in three minutes and 15 seconds, an average of about 2.9 billion gas per second, [according to the report](https://www.coindesk.com/tech/2026/09/17/ethereum-s-upcoming-glamsterdam-upgrade-clears-rehearsal-for-a-big-jump-in-capacity). The benchmark measured the execution software rather than the speed of the full network.

The tests covered block-level access lists, the feature meant to let Ethereum process many transactions at once. The lists tell the network's computers which accounts and stored data a block will use before processing starts, so machines can fetch data and check unrelated transactions together. Ethereum currently handles much of that work in sequence, which limits how much activity fits safely into each block.

The Foundation describes the same lists as the core of its parallel-processing plan. Block-level access lists, or EIP-7928, give the network an upfront map of transaction dependencies, and a companion networking change lets nodes share those lists across the peer-to-peer network, [the Foundation's roadmap page says](https://ethereum.org/roadmap/glamsterdam/). Because the lists carry final results as well as access records, new nodes can copy those results instead of replaying every transaction from scratch.

Glamsterdam raised its block gas limit from 60 million to 200 million about an hour after going live on the test network. Gas measures the computing work transactions require, so the higher ceiling creates room for more payments, token swaps and other activity in each block. A 200 million limit would let Ethereum absorb more activity before users begin outbidding one another for block space, which could soften fee spikes when activity surges.

That setting remains a test value rather than a commitment for the main network. The 200 million limit is not yet planned for Ethereum's main chain, and Devnet-11 was built as a controlled rehearsal without deliberate attacks, [CoinDesk noted](https://www.coindesk.com/tech/2026/09/17/ethereum-s-upcoming-glamsterdam-upgrade-clears-rehearsal-for-a-big-jump-in-capacity). Larger blocks are harder to check and could leave smaller operators unable to keep up, so the upgrade tries to gain capacity without making the chain too costly to run.

Specialized builders package transactions while validators check the resulting blocks and secure the chain. Glamsterdam would place that handoff and the accompanying payments inside Ethereum's own rules, reducing dependence on outside relay services. The change also stretches the time to spread block data across the network from about two seconds to nine seconds, giving validators longer to receive and check the larger blocks.

The name joins the upgrade's two halves. Glamsterdam combines Amsterdam, the execution-layer half named after a past Devconnect location, with Gloas, the consensus-layer half named after a star, [according to the roadmap page](https://ethereum.org/roadmap/glamsterdam/). The page lists the upgrade status as testing on devnets, puts the main network in the fourth quarter of 2026 with the date not yet confirmed, and names the Sepolia fork on Oct. 6, 2026 as the next milestone.

The rehearsal network behind this week's results is Devnet-11. Its specification set genesis for Sept. 14 at 12:00 UTC, the Gloas fork for Sept. 16 at 12:00 UTC, and the gas-limit jump to 200 million for later that same day, [the devnet specification records](https://notes.ethereum.org/@ethpandaops/glamsterdam-devnet-11). The spec calls the network a happy-path fork-transition test aimed at layer-2 teams, with no new proposals and no adversarial testing, and it removed EIP-7610 while updating the state-gas repayment rule in EIP-8037.

Client readiness going into the test was mixed. A Sept. 8 check in the specification showed Geth, Nethermind, Erigon, Lodestar and Teku aligned with the current test versions, while Reth, Prysm and Grandine lagged behind and Besu showed memory failures plus an estimation error under load, [the specification's readiness table shows](https://notes.ethereum.org/@ethpandaops/glamsterdam-devnet-11). Two more execution clients still enforced the removed EIP-7610 rule with no fix proposed.

The Oct. 6 Sepolia date comes from the 186th consensus-layer developer call on Sept. 3, where client teams settled on a switchover corresponding to Oct. 6 at about 13:53 UTC, [CryptoTicker traced](https://cryptoticker.io/en/ethereum-glamsterdam-client-readiness/). The Foundation's roadmap page has carried that date as the next milestone since. Lido and Optimism had asked for at least one stable day of operation on a test network before a fork is scheduled, a condition that was not yet met on Sept. 11.

A Sept. 11 survey of all ten major Ethereum clients found none carrying a stable version with any Glamsterdam reference in its name. The visible work sat in pre-releases and nightly test builds, including a Nethermind release candidate from Sept. 2, which means operators had nothing new to install yet, [the survey showed](https://cryptoticker.io/en/ethereum-glamsterdam-client-readiness/).

For the main network there is still no date. The roadmap page gives only the unconfirmed fourth-quarter window, and developer discussion of a December slot binds nobody, [CryptoTicker noted](https://cryptoticker.io/en/ethereum-glamsterdam-client-readiness/). Anyone quoting a main-network date today is quoting an expectation rather than a decision.

Everyday users would feel two of the changes first. One proposal cuts the base fee for simple transfers between existing accounts by up to 71 percent, while keeping a surcharge where a payment creates a brand-new account record, [the roadmap page says](https://ethereum.org/roadmap/glamsterdam/). Related changes reprice creating and reading permanent data so fees match the storage burden those operations place on node hardware.

Stakers face a direct change in the exit queue. EIP-8061 raises the churn limit that governs how many validators may leave or consolidate per unit of time, with exits no longer capped and consolidations given their own lane, [according to the roadmap page](https://ethereum.org/roadmap/glamsterdam/). At current staking levels the page puts the gain at roughly four times the exit capacity and twice the consolidation capacity.

Holders of ether need to do nothing for any of this. No swap, migration or deadline touches existing balances, and addresses stay the same across the upgrade. Application teams get the first real trial on Sepolia, where they can test software against the new rules before those rules reach Ethereum users, and the Oct. 6 date still requires formal confirmation, [according to the report](https://www.coindesk.com/tech/2026/09/17/ethereum-s-upcoming-glamsterdam-upgrade-clears-rehearsal-for-a-big-jump-in-capacity).
