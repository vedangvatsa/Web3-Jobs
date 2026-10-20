---
title: Ethereum sets Oct. 26 for Glamsterdam's Hoodi testnet activation
ogTitle: "GLAMSTERDAM HOODI ACTIVATION SET FOR OCT. 26"
description: Ethereum's Glamsterdam upgrade activates on the Hoodi testnet on Oct. 26 at 17:42:48 UTC, pushing the testnet's gas target to 200 million and forcing operators to update clients.
image: /images/news/hoodiupgrade.jpg
imageCaption: "Server racks in a data center. Testnet operators run similar hardware. Photo: Wilweterings via Wikimedia Commons (public domain)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Datacenter.jpg
category: News
data-ai-hint: data center server racks
publishedDate: '2026-10-20'
lastUpdated: '2026-10-20'
---

Ethereum's next major upgrade gets its third public test on Oct. 26. Glamsterdam activates on the Hoodi testnet at 17:42:48 UTC that day, giving node operators a one-week software deadline and pushing the test network's block gas target to 200 million, [CryptoSlate reported](https://cryptoslate.com/ethereum-sets-october-26-scaling-test-with-hoodi-node-upgrades-required/). The date was earlier flagged by WuBlockchain and covered by [Crypto Briefing](https://cryptobriefing.com/ethereum-sets-october-26-for-glamsterdam-upgrade-on-hoodi-testnet/). Hoodi sits between the small developer networks and the big public tests, which makes it a useful place to rehearse client updates before mainnet forks follow.

## What operators have to do

Every Hoodi operator must update both execution and consensus clients before activation. Validators need to update their consensus-layer node and validator client as well, and should review new duties, builder-tooling compatibility, and gas-limit settings once the upgraded rules take over. The Ethereum Foundation published a list of confirmed Hoodi releases, checked as of Oct. 17. Ethrex's listed version is still a release candidate. Grandine, Lighthouse, Erigon, go-ethereum, and Reth were not on that list, meaning operators should only run releases whose notes explicitly confirm this Hoodi activation.

The 200 million gas figure is a target, not an instantaneous switch. Hoodi's rules guide a gradual block-limit adjustment toward that ceiling under the network's existing mechanics. Throughput will still depend on transaction complexity, and user fees will still depend on demand.

## What Glamsterdam changes

Glamsterdam bundles execution-layer and consensus-layer work. On the pricing side, it revises how the network charges for state creation and state access, the operations that have historically crowded Ethereum's fee market. State is what contracts store, and access is what any transaction needs to read or touch that storage. Pricing both differently changes which transactions compete for block space and how much a contract call costs when it touches hot vs cold storage.

It also carries broader execution and block-accounting changes, following an earlier deployment of the same protocol package on the Sepolia testnet. Block accounting covers how validators count and attest to the work inside a block, the layer beneath every fee users actually pay. Getting it wrong on a testnet is the point of the exercise. Getting it wrong on mainnet costs real money.

## Why Hoodi gets this test

Hoodi is the youngest of Ethereum's public test networks, spun up after the Merge to cover staking and validator flows the older tests did not isolate. Running Glamsterdam there gives operators a clean environment to rehearse client updates without the accumulated state of Sepolia or Holesky. It follows the upgrade's earlier run on Sepolia, which tested the same protocol package on a network with a longer history.

The upgrade matters most to applications that assumed fixed gas stipends, hardcoded limits, or certain remaining-gas behavior. Changed state pricing can break those assumptions. The Foundation is telling teams to retest contracts and gas estimation under the new rules before mainnet follows. Wallet and infrastructure teams face a similar chore: update, then verify that fee estimation still lands where users expect.

## What is still missing

No mainnet activation date has been announced. Glamsterdam's earlier milestones put the upgrade on a public path that ends with a mainnet fork, but that final date remains unset. Hoodi is the next checkpoint. If the network holds, clients stabilize, and the gas-limit ramp behaves, the case for scheduling mainnet gets stronger. If something breaks on Oct. 26, or in the days after, the calendar slips and the client teams get another round of bug reports to fold into their release trains.

Either way, the operator deadline is fixed. Nodes that have not updated by Oct. 26 will fall out of consensus on Hoodi the moment the activation epoch arrives, which is the entire reason the date was published in advance.
