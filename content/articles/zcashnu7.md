---
title: Zcash developers lock Nov. activation height for NU7 upgrade
ogTitle: "ZCASH DEVELOPERS LOCK NOV. ACTIVATION HEIGHT FOR NU7"
description: Zcash developers merged the NU7 mainnet activation height of 3,543,405, expected around Nov. 5, and shipped Zebra 7.0.0 carrying the change that cuts block times from 75 seconds to 25 seconds.
image: /images/news/zcashnu7.jpg
imageCaption: "Server racks in a data center. Photo: Carl Lender via Wikimedia Commons (CC BY 2.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Datacenter_Server_Racks_(22370909788).jpg
category: News
data-ai-hint: server racks data center
publishedDate: '2026-10-22'
lastUpdated: '2026-10-22'
---

Zcash developers fixed the mainnet activation height for the NU7 upgrade at block 3,543,405, expected around Nov. 5, and merged the change into the protocol's ZIP repository on Oct. 21. [The pull request](https://github.com/zcash/zips/pull/1405), filed by developer Sean Bowe after a ZIP editor meeting, shows as merged with the height set in ZIP 259.

[CoinDesk](https://www.coindesk.com/markets/2026/10/21/zcash-developers-confirm-november-date-for-upgrade-that-triples-payment-speed), reporting before the merge, said the proposal had two approvals and still needed to be folded into the deployment specification. That merge closed Oct. 21, and the Zcash Foundation's Zebra node software shipped [version 7.0.0](https://github.com/ZcashFoundation/zebra/releases) on Oct. 22 carrying the same height.

The merged pull request also published the mainnet Non-Sprout-to-Non-Sprout reissuance height calculated from the activation block, 8,939,664, under ZIP 237, and set the end height of the Revision 2 funding streams at 6,132,390 in ZIP 214. ZIP 259 and the other NU7 ZIPs moved to Proposed status in the same merge.

## What NU7 changes

NU7 cuts the time between Zcash blocks from 75 seconds to 25 seconds, tripling payment confirmation speed. An exchange that waits for three confirmations before crediting a ZEC deposit could reduce the delay from nearly four minutes to about 75 seconds. The upgrade has run on Zcash's test network since early October.

The upgrade also pulls 60% of the fees collected in each block out of circulation. Those coins will be paid back to miners starting around February 2031, while preserving Zcash's existing schedule for reducing mining rewards by 50%. The fee mechanism is designed to balance short-term supply pressure against long-term miner incentives as the network shifts toward faster block production.

Sprout, Zcash's original privacy system from the 2016 launch, shuts down entirely. Any coins still sitting there when NU7 activates become unspendable, so holders have until activation in early November to move them. Sapling, introduced in 2018, and Orchard, introduced with the 2022 NU5 upgrade, remain active after NU7. The fee burn and the Sprout cutoff have been the two most discussed NU7 components among node operators and long-time holders, because exchanges that still credit Sprout deposits and wallets that have not migrated users off the old pool must finish that work before the activation block.

## Remaining work

The Zebra 7.0.0 release notes state that mainnet nodes must upgrade before the activation height to stay on the consensus chain. The release is supported for eight weeks rather than the usual 12, so it will halt about 56 days after its estimated release height. The ZIP pull request also noted that the full protocol specification still needs changes the NU7 update ZIPs specify, work tracked separately from the height assignment.

NU7 activated on Zcash's public test network in early October, giving operators weeks of run time on the new rules before mainnet. The Zcash Foundation's NU7 readiness tracker showed six of 12 tasks completed as of Oct. 21, with remaining work involving Zebra node synchronization issues and mainnet preparations, [Cointelegraph reported](https://cointelegraph.com/markets/zcash-zec-rallies-12-percent-nu7-mainnet-upgrade). Developers have not confirmed whether those outstanding issues could affect the planned activation date. A related open Zebra issue tracks node sync problems that could delay operators upgrading their infrastructure in time for the activation block.

## Market reaction

ZEC traded around $1,270 on Oct. 21 after rising about 12% over the prior 24 hours, according to CoinGecko figures Cointelegraph cited. The privacy-focused cryptocurrency was up more than 148% year to date. The rally coincided with the activation-height proposal rather than separate protocol news, and CoinDesk noted in a related markets piece that Zcash extended its gains after the upgrade date was set.

Exchanges that still credit Sprout deposits will need to disable those paths before the activation block, and any wallet that has not migrated users off Sprout faces the same deadline. With the ZIP merged and Zebra 7.0.0 out, operators have a firm block number to plan around while the remaining specification and sync work continues. The Zakura NU7 dashboard lists 3,543,405 as the planned mainnet activation point.
