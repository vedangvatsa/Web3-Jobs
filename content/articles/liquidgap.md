---
title: Liquid reserve gap narrows to 600 BTC after test transfer
ogTitle: "LIQUID RESERVE GAP NARROWS TO 600 BTC AFTER TEST TRANSFER"
description: A 2.53 BTC test transfer on Oct. 27 left Liquid's federation wallet about 600 BTC short of circulating L-BTC, and JAN3 CEO Samson Mow said the remainder will be covered within days.
image: /images/news/liquidgap.jpg
imageCaption: "A Casascius physical bitcoin token. Photo: Steve Jurvetson via Wikimedia Commons (CC BY 2.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Casascius_coin.jpg
category: News
data-ai-hint: bitcoin physical coin
publishedDate: '2026-10-29'
lastUpdated: '2026-10-29'
---

A test deposit of 2.53048101 BTC reached the Liquid federation wallet on Oct. 27, leaving the sidechain's bitcoin reserve roughly 600 BTC behind the L-BTC tokens in circulation. After the transfer, the federation wallet held about 3,649 BTC against 4,249 L-BTC, coverage of roughly 85.88%, [Crypto Briefing reported](https://cryptobriefing.com/samson-mow-liquid-600-btc-shortfall/). Samson Mow, CEO of JAN3 and a member of the Liquid Federation, said the remaining shortfall will be filled in the coming days.

The deposit put reserves at about 85.88% coverage of circulating L-BTC, leaving a gap of approximately 600 BTC. A ChainCatcher report carried by [KuCoin](https://www.kucoin.com/news/flash/liquid-network-reserve-gap-narrows-to-600-btc-after-test-transfer) cited the same coverage figure of about 85.8% and noted that reserve coverage must return to full backing before direct redemptions can restart.

Peg-outs, the process of moving bitcoin off Liquid back to Bitcoin's main chain, have only partly resumed. Users can exit through third-party swap services, but direct peg-outs through the federation remain paused. Those direct withdrawals will stay restricted until the reserve again matches circulating L-BTC one for one, according to [the report](https://cryptobriefing.com/samson-mow-liquid-600-btc-shortfall/).

## The September exploit

The shortfall dates to Sept. 6, when an attacker exploited a vulnerability in Elements, the open-source software Liquid runs on. In its [published incident assessment](https://blog.blockstream.com/liquid-network-security-incident-assessment/), Blockstream said the flaw sat in Elements' rangeproof verification cache. A single transaction passed validation even though its output was not backed by its inputs, inflating the L-BTC supply by roughly 4,000 tokens with no bitcoin behind them.

The attacker moved the unbacked tokens out through Liquid's standard peg-out process via SideSwap, a federation member holding a Peg-out Authorization Key. That produced a withdrawal of about 4,000 BTC on Bitcoin's main chain. Smaller peg-outs confirmed before the network halted cut the federation reserve from roughly 4,205 BTC down to 197 BTC, the [assessment said](https://blog.blockstream.com/liquid-network-security-incident-assessment/).

The attacker identified on-chain within hours and returned 3,400 BTC on Sept. 7 after negotiations, leaving about 602 BTC outstanding at the time of the September report. Blockstream coordinated a halt of Liquid's bridge nodes, deployed an emergency patch, and released Elements v23.3.4 within days to close the vulnerability.

Blockstream has said it will cover the remaining gap rather than push the loss onto L-BTC holders. Crypto Briefing described the company's position as a matter of when, not if, the shortfall would be made whole, and Mow's Oct. 27 comments put a rough timeline on that.

ChainCatcher reported that the attacker minted roughly 4,000 L-BTC through a rangeproof validation cache flaw and redeemed them through SideSwap's peg-out channel, with about 602 BTC still under recovery after the attacker returned 3,400 BTC. The company suspended bridge nodes, told exchanges to pause L-BTC deposits and withdrawals, and shipped the v23.3.4 patch, the report said. Transactions have since resumed, but direct redemptions remain suspended.

Filling the roughly 600 BTC gap is the precondition for reopening the federation's direct peg-out path. Until then, exits from Liquid continue to run through third-party swap services rather than the bridge itself.

## The code defect

The assessment traced the root cause to a cache-key design that dated to an April 2018 Elements commit. The key omitted the asset commitment and the scriptPubKey, so a cached rangeproof result could be treated as valid for a different output. An external researcher reported a related defect, called Bug A, on Aug. 2, 2026, and a fix went to bridge nodes the next day. That fix combined fields without length prefixes, which the assessment described as a second defect, Bug B. The attacker exploited Bug B on Sept. 6.

No internal or external reviewer identified Bug B before the exploit, the assessment said. Liquid runs on 15 geographically distributed functionary nodes, and blocks require signatures from at least 11 of them.

SideSwap, the federation member whose peg-out channel processed the attacker's withdrawal, published its own statement saying its peg-out signing key had been kept online despite the federation charter requiring it offline, and that payouts were forwarded automatically in the same Bitcoin block. SideSwap also said it applied no size limit or wallet-history check to peg-out orders.

An external security audit of the recovery work was completed by Oct. 20, after which certain recovery measures were put in place, [Crypto Briefing reported](https://cryptobriefing.com/samson-mow-liquid-600-btc-shortfall/). The attacker had posted an on-chain message claiming to be a white-hat researcher within hours of the exploit; Blockstream replied on-chain asking that person to contact its security mailbox.
