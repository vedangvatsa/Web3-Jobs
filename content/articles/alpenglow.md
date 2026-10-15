---
title: Solana sets Oct. 21 for Alpenglow consensus switch
ogTitle: "SOLANA SETS OCT. 21 FOR ALPENGLOW CONSENSUS SWITCH"
description: The Solana Foundation said Alpenglow activates at epoch 1064 on Oct. 21, 2026, replacing TowerBFT voting with a system targeting 150-millisecond finality.
image: /images/news/alpenglow.jpg
imageCaption: "Server racks in a data center. Photo: Carl Lender via Wikimedia Commons (CC BY 2.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Datacenter%20Server%20Racks%20(22370909788).jpg
category: News
data-ai-hint: server racks in data center
publishedDate: '2026-10-15'
lastUpdated: '2026-10-15'
---

Solana will switch its consensus system on Oct. 21, 2026. The [Solana Foundation said](https://solana.com/upgrades/alpenglow) Alpenglow activates on mainnet in epoch 1064, which starts that Wednesday at about 15:00 UTC. The change replaces TowerBFT, the voting system Solana has used since launch.

Finality is the target. Today a Solana transaction takes about 12.8 seconds to become irreversible, and Alpenglow aims for roughly 150 milliseconds, [the Foundation page says](https://solana.com/upgrades/alpenglow). Decrypt [reported on Oct. 14](https://decrypt.co/380974/solana-alpenglow-upgrade-date) that the upgrade retires TowerBFT and seeks finality near 150 milliseconds. The 150-millisecond figure is a performance target, not a result already measured on mainnet.

Anza, the development group behind the client software, announced the date on Oct. 13. Its post said Alpenglow goes live on mainnet beta on Wednesday, Oct. 21, at about 14:50 UTC, after 18 months of work for a migration that happens in one slot. Decrypt [quoted that post](https://decrypt.co/380974/solana-alpenglow-upgrade-date) in full. Bankless [dated the same switch](https://www.bankless.com/read/news/alpenglow-is-coming-to-solana-mainnet-next-week) to epoch 1064 on Oct. 21 at around 15:00 UTC, citing the Foundation.

What ships on Oct. 21 is Votor, the voting half of Alpenglow. Validators now post votes as on-chain transactions, and a block becomes final once enough of those votes stack up over 32 slots. Under Votor they send votes directly to each other and bundle them into certificates, so a block can lock in after one or two rounds. Bankless [explained that split](https://www.bankless.com/read/news/alpenglow-is-coming-to-solana-mainnet-next-week) as Votor now and Rotor later.

Rotor, the replacement for Turbine block propagation, is not part of this switch. It needs its own governance proposal and has no date yet, [Bankless noted](https://www.bankless.com/read/news/alpenglow-is-coming-to-solana-mainnet-next-week). Decrypt [gave the same division](https://decrypt.co/380974/solana-alpenglow-upgrade-date), with October delivering only Votor while Rotor comes later.

The voting math changes with it. A block finalizes at once when 80 percent or more of stake backs it in the first round. Support between 60 and 80 percent sends the decision to a second round with 60 percent thresholds for finalizing or skipping. The [Foundation describes](https://solana.com/upgrades/alpenglow) tolerance for 20 percent hostile stake plus another 20 percent offline. Decrypt [laid out the same bands](https://decrypt.co/380974/solana-alpenglow-upgrade-date) in its account of the design.

Ordinary users face no action. Wallets and apps keep working as they do today, and signing or sending a transaction does not change. The Solana Virtual Machine, transaction formats, programs and fees stay the same. Developers who read block data face real work, since confirmed and finalized merge into the same state.

The commitment change matters for exchanges, bridges and payment desks. On Solana today a payment looks confirmed quickly, but in theory the block could still drop until the 13-second clock runs out. Real-money handlers tend to wait the full window for that reason. With finality near 150 milliseconds, the irreversible answer arrives almost as fast as the optimistic one.

Vote traffic leaves blocks entirely. Validators stop paying about 1 SOL per epoch in vote transaction fees from their identity accounts. In its place each voting validator pays a flat 0.8 SOL per epoch from its vote account, on top of the rent-exempt minimum, under the Validator Admission Ticket. The fee is burned. A validator that cannot cover it sits out voting and block production for the following epoch.

That accounting shift will move headline numbers. Vote transactions have been a large share of transactions in a block, so counts and transactions-per-second readings will fall sharply without any fall in real activity. The [Foundation warns](https://solana.com/upgrades/alpenglow) indexers to re-baseline any metric that counted votes. Bankless [made the same point](https://www.bankless.com/read/news/alpenglow-is-coming-to-solana-mainnet-next-week), saying non-vote TPS is the figure to watch for like-for-like comparison.

Validator operators have two hard tasks before epoch 1064 begins. They must run an Agave-based client, meaning Agave, Jito-Solana or Harmonic Salsa on a release built on Agave 4.3.0. Firedancer and Frankendancer are not supported during the migration. They must also hold at least 0.8 SOL above the rent-exempt minimum in the vote account to pay the ticket. The first fee is charged at the start of epoch 1064 and pays for epoch 1065.

The switch itself has a short delay built in. The feature gate turns on as epoch 1064 begins, yet TowerBFT stays in charge for another 5,000 slots, about 18 minutes, before Alpenglow takes control at slot 459,653,000. The [Foundation gives that slot number](https://solana.com/upgrades/alpenglow) on its upgrade page. Decrypt [reported the same sequence](https://decrypt.co/380974/solana-alpenglow-upgrade-date) as a stability measure for the handover.

Governance for the change dates to last year. Validators approved Alpenglow in September 2025, when SIMD-0326 passed with 98.27 percent of votes cast in favor. Testing ran through community clusters, with testnet and devnet activations in late September 2026. The mainnet date follows that rehearsal path.

Proof of History stops pacing consensus after the switch. Tick entries leave the shred stream, and the Clock sysvar timestamp gets a new source set by the block leader within a defined range. Programs that read time and pipelines that counted ticks need to adjust. Transaction execution does not.
