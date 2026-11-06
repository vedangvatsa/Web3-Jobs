---
title: Liquid Network restores full bitcoin backing two months after exploit
ogTitle: "LIQUID NETWORK RESTORES FULL BITCOIN BACKING TWO MONTHS AFTER EXPLOIT"
description: The Liquid Federation said its bitcoin reserves now back every LBTC one for one, closing the roughly 600 BTC shortfall left by the September exploit, while direct federation peg-outs stay restricted.
image: /images/news/liquidbacking.jpg
imageCaption: "Blockstream CEO Adam Back. Photo: Joi Ito via Wikimedia Commons (CC BY 2.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Adam%20Back%202014.jpg
category: News
data-ai-hint: adam back portrait
publishedDate: '2026-11-06'
lastUpdated: '2026-11-06'
---

The Liquid Federation said on Nov. 3 that the network's bitcoin reserves have been fully restored, "reestablishing 1:1 BTC backing for all LBTC," two months after an exploit drained most of the reserve. In its [announcement](https://x.com/Liquid_BTC/status/2117407283391214047), posted at 12:03 AM UTC, the federation said the milestone follows the restoration of BTC-to-LBTC swaps several weeks earlier through participating swap providers, and that node operators can verify its proof of reserves directly while balances appear on the public dashboard at liquid.network.

Liquid is a [production Bitcoin sidechain](https://blog.blockstream.com/liquid-network-security-incident-assessment/) built on Elements, the open-source platform Blockstream develops. BTC locked through a peg-in is matched one for one by LBTC issued on Liquid, so the reserve has to track circulating LBTC for the token to stay redeemable.

The dashboard backed the claim. [SideSwap](https://testnet.sideswap.io/news/the-liquid-peg-is-back-to-one-to-one/), a federation member that runs a peg-out service, said liquid.network showed 4,270.54 L-BTC in circulation against 4,270.54 BTC in the federation reserve on the morning of Nov. 3, matching the position that existed before Sept. 6. [crypto.news](https://crypto.news/liquid-network-restores-bitcoin-reserves-exploit) reported roughly 4,268.95 BTC against an equal amount of LBTC at the moment the shortfall closed, with the figure rising to 4,270.54 by the following day.

The last gap closed in steps visible on the Bitcoin chain. According to SideSwap, deposits of 2.5 BTC on Oct. 27 and 50 BTC on Oct. 28 were followed on Nov. 2 by transfers of 300 BTC and then 250 BTC into the federation's peg wallet. [crypto.news](https://crypto.news/liquid-network-restores-bitcoin-reserves-exploit) described the same sequence of four deposits totaling roughly 602.5 BTC.

Neither the announcement nor the federation identified who supplied the replacement bitcoin. [Decrypt](https://decrypt.co/382397/liquid-network-restores-full-bitcoin-backing-two-months-after-320m-exploit) noted that the statement did not say how the shortfall was covered. Asked on X where the coins were coming from, Liquid Federation board member Samson Mow [wrote](https://x.com/Excellion/status/2117362160116388041), "As stated many times, Blockstream." SideSwap thanked Blockstream and the federation's members for completing the recovery but declined to name the funding source itself, and the federation has published no allocation of the replacement funds.

The hole dates to Sept. 6, when a flaw in Elements, the software Liquid runs on, let an attacker create about 4,000 LBTC with nothing behind them and redeem them for bitcoin. [Blockstream's incident assessment](https://blog.blockstream.com/liquid-network-security-incident-assessment/) attributed the exploit to a defect in the rangeproof verification cache introduced in 2018, and said smaller peg-outs before the halt cut the reserve from about 4,205 BTC to 197 BTC. The attacker posted on-chain hours later that "we are whitehats. contact us on chain," then returned 3,400 BTC on Sept. 7 after negotiations, leaving roughly 602 BTC outstanding at the time of the report. Blockstream shipped the fixed release, Elements v23.3.4, on Sept. 9.

[Decrypt](https://decrypt.co/382397/liquid-network-restores-full-bitcoin-backing-two-months-after-320m-exploit) reported that the group kept around 598 BTC of the roughly 4,000 BTC withdrawn, and that Blockstream refused to pay a ransom for the remainder, saying in September that "taking assets without authorization and withholding their return is a crime, not responsible disclosure" and "it is theft."

Blockstream CEO Adam Back, whose company develops the technology behind Liquid, [posted](https://x.com/adam3us/status/2117380116158538022) a screenshot of the reserve dashboard showing assets matching liabilities at 100% with a deficit of 0.00 BTC. Asked what would prevent a repeat, he [listed](https://x.com/adam3us/status/2117527154288120188) three hardened lines of defense: peg-out authorization keys refreshed into cold hardware wallets, proof validation caches disabled alongside a node bug fix, and consensus rules hardened to "fail closed," plus multiple third-party audits. He also urged developers to "treat with suspicion (don't trust, verify) AI suggested fixes."

Backed reserves are not the same as a fully open bridge. Direct peg-outs through the federation remain restricted with no confirmed reopening date, according to [crypto.news](https://crypto.news/liquid-network-restores-bitcoin-reserves-exploit). The SideSwap service has offered peg-outs since Oct. 20 at a one-to-one rate less a 0.1% fee, but those payouts come from its own bitcoin wallet, which it refills by hand, so queued orders can wait for the next refill. The federation's own [staged recovery update](https://blog.liquid.net/liquid-network-staged-recovery-update/) of Oct. 20 placed the controlled reactivation of peg-outs for authorized key holders after full 1:1 backing, subject to completion of the remaining security and operational requirements.

The federation said it is modernizing its governance structure, introducing clearer responsibilities and oversight, and adding further technical and operational safeguards, with more details to come in the coming weeks.
