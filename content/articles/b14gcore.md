---
title: Hacker Drains 97 Million CORE From Bitcoin Staking Platform b14g
ogTitle: "HACKER DRAINS 97 MILLION CORE FROM BITCOIN STAKING PLATFORM B14G"
description: >-
  An attacker took about 97 million CORE, worth 1.47 million dollars, from
  b14g on Oct. 31 by filing zero-value withdrawal requests that Core's
  staking code read as a demand for the full balance.
image: /images/news/b14gcore.jpg
imageCaption: "A Hut 8 bitcoin mining facility in Medicine Hat, Alberta. Photo: Curtis Huisman via Wikimedia Commons (CC BY 4.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Hut_8_Medicine_Hat_box_1.jpg
category: News
data-ai-hint: bitcoin mining facility
publishedDate: '2026-11-02'
lastUpdated: '2026-11-02'
---

An attacker drained about 97 million CORE, worth 1.47 million dollars, from b14g, a Bitcoin staking app on the Core chain, on Saturday, Oct. 31, by sending the protocol withdrawal requests for zero tokens that Core's staking code read as a demand for everything, Bitquery's [on-chain investigation](https://bitquery.io/investigations/b14g-hack) found. The single transaction emptied 91 staking positions at 09:29:51 UTC.

Core's staking contract holds an unusual provision: a withdrawal request for zero tokens is treated as an instruction to release the entire staked balance. The attacker filed 99 such requests against positions it had never funded, and b14g's contract passed them through rather than rejecting them, [the investigation](https://bitquery.io/investigations/b14g-hack) showed. The staking contract logged 97,045,563 CORE released, all of it to the wallet that asked.

No stolen administrator key and no hastily deployed code were involved. b14g's contract is a proxy, and the logic it ran during the drain had been its standing version for about 17 months, with the multisig putting the same logic back after each of 36 upkeep swaps since late December, most recently the day before the attack, [the same investigation](https://bitquery.io/investigations/b14g-hack) reported. The attacker's wallet was about 29 minutes old, funded once with 615.62 CORE for fees, and its first call to b14g was the drain itself. The [investigation](https://bitquery.io/investigations/b14g-hack) cautioned that it had not read b14g's source code and cannot name the exact faulty line.

The response took 66 minutes. b14g's multisig ran a routine upkeep step on seven contracts eight minutes after the drain and left withdrawals open; the pause switch did not fire until 10:35:51 UTC. Within that hour the attacker had moved 23.4 million CORE out through a chain of new addresses, and 42 seconds after the pause the rest was swept into a second wallet, the [timeline](https://bitquery.io/investigations/b14g-hack) shows. b14g said it paused the contracts as soon as it identified the problem, and the on-chain record does not establish when it found out.

By 19:43 UTC that evening, 68.15 million CORE, about 70 percent of the total, had not moved: 63.65 million sat in the second wallet and 4.5 million in two new ones. The rest reached exchange and service wallets. Two addresses fed a Bybit hot wallet, another path led to Gate.io deposits, and a service that had supplied the attacker's fee money that morning later took 11.0 million CORE and passed it to a MEXC deposit address, the [tracing](https://bitquery.io/investigations/b14g-hack) found. Those services also hold other customers' coins, so the transfers show where CORE went without proving which coins were stolen.

b14g [confirmed](https://cryptoslate.com/zero-token-withdrawals-let-a-hacker-drain-97-million-core-from-bitcoin-staking-platform-b14g/) the unauthorized withdrawals and said it paused the affected contracts while coordinating with the Core team, security partners and exchanges. The platform said the breach was limited to CORE deposits and that Bitcoin staked through the protocol remains time-locked on the Bitcoin blockchain, unaffected by the theft. It also reported that exchange partners had frozen about 9 million CORE linked to the attacker, a figure that happens inside exchange books and cannot be confirmed on-chain, [the report](https://bitquery.io/investigations/b14g-hack) noted.

Core DAO [said](https://www.tokenpost.com/news/regulation/45685) the exploit did not compromise the Core network, with consensus, validators and staking contracts continuing to operate normally, and that CORE staked directly with its validators or through other protocols was untouched. The DAO said it is helping b14g and exchange partners track and freeze funds and that most of the stolen CORE remains on the Core blockchain.

Bitquery put the price impact at 8.5 percent over 24 hours, with CORE at 0.0139 dollars by 19:43 UTC against 0.0151 just before the drain. b14g has promised a post-mortem covering the technical cause, the extent of user losses and next steps for affected depositors, but has not disclosed a compensation plan.
