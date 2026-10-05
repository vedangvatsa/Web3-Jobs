---
title: Zcash activates NU7 on public testnet with 25-second blocks
ogTitle: "ZCASH ACTIVATES NU7 ON PUBLIC TESTNET WITH 25-SECOND BLOCKS"
description: Zcash activated the NU7 upgrade on its public testnet at block 4,465,026 on Oct. 4, starting a trial of 25-second blocks ahead of a Nov. 5 mainnet target.
image: /images/news/zcash-testnet.jpg
imageCaption: "Rows of cryptocurrency mining machines in a warehouse. Photo: Marco Krohn via Wikimedia Commons (CC BY-SA 4.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Cryptocurrency%20Mining%20Farm.jpg
category: News
data-ai-hint: cryptocurrency mining farm
publishedDate: '2026-10-05'
lastUpdated: '2026-10-05'
---

Zcash switched on its NU7 network upgrade on the public testnet at block 4,465,026 on Oct. 4, cutting the target time between blocks to 25 seconds from 75 seconds, the foundation said in its [release notes](https://zfnd.org/zebra-7-0-0-rc-0-nu7-arrives-on-testnet/). The activation starts a live trial about a month before a planned Nov. 5 mainnet upgrade. CoinDesk [reported](https://www.coindesk.com/tech/2026/10/05/zcash-s-25-second-blocks-go-live-on-public-testnet-ahead-of-schedule) that the new rules now show as active on public testnet, while an earlier separate testing network has been shut down.

The testnet switch arrived about two days earlier than projected. The foundation had pointed to Oct. 6 in its Oct. 2 notes for Zebra 7.0.0-rc.0, but activation follows a block height rather than a calendar date, Unchained [wrote](https://unchainedcrypto.com/zcash-activates-nu7-on-public-testnet-opening-a-trial-run-for-25-second-blocks/). Test blocks arrive when miners find them, so the calendar time can drift from forecasts. Operators had to run compatible software before the height arrived to stay on the upgraded chain.

Each block records a batch of payments, and producing them three times as often shortens confirmation waits. Under the old spacing a user waited 75 seconds on average for a first confirmation, while NU7 cuts that average to 25 seconds, according to the [foundation account](https://zfnd.org/zebra-7-0-0-rc-0-nu7-arrives-on-testnet/). A service waiting for three confirmations would face a target wait near 75 seconds instead of 225 seconds with the same policy, CoinDesk [noted](https://www.coindesk.com/tech/2026/10/05/zcash-s-25-second-blocks-go-live-on-public-testnet-ahead-of-schedule). Real block times still vary around the target.

The foundation pointed to point-of-sale payments, exchange deposits and cross-chain bridges as places where the difference appears first, in its [explanation](https://zfnd.org/zebra-7-0-0-rc-0-nu7-arrives-on-testnet/) of the change. A merchant can see a first confirmation in under half a minute on average. An exchange can finish the same confirmation policy in roughly a third of the time.

Testnet coins carry no monetary value, which gives builders a place to check the new rules before real ZEC is affected. Wallet teams, indexers and explorers can run against the faster cadence without putting user funds at risk, as [described](https://www.coindesk.com/tech/2026/10/05/zcash-s-25-second-blocks-go-live-on-public-testnet-ahead-of-schedule) in testnet coverage. Faults found now can be fixed before any mainnet height is chosen.

Both node programs support the trial. Valar Group and Project Tachyon, which build Zakura, shipped the testnet activation in version 1.6.0 on Oct. 1, while the Zcash Foundation published its Zebra candidate the next day, Unchained [explained](https://unchainedcrypto.com/zcash-activates-nu7-on-public-testnet-opening-a-trial-run-for-25-second-blocks/). Anyone running testnet infrastructure, mining on testnet or building wallets and indexers needed the new build in time. The foundation [stated](https://zfnd.org/zebra-7-0-0-rc-0-nu7-arrives-on-testnet/) that mainnet operators do not need to act yet because no mainnet height has been set and the Zebra build is a release candidate rather than a stable release.

Faster blocks do not create more new coins per day. Each block's scheduled reward drops to one-third, and the remaining halving intervals stretch three times as long, so daily issuance stays the same, the foundation [said](https://zfnd.org/zebra-7-0-0-rc-0-nu7-arrives-on-testnet/). Funding-stream periods move to match the new spacing. The four-year halving rhythm and the 21 million ZEC cap stay unchanged.

NU7 also redirects part of every fee. Miners keep 40 percent of each block's transaction fees, while the other 60 percent leaves circulation and enters a reserve for the Network Sustainability Mechanism, according to the [foundation breakdown](https://zfnd.org/zebra-7-0-0-rc-0-nu7-arrives-on-testnet/). The reserve is intended to help pay for security later as new issuance falls. Each block then reissues a small predictable slice of that reserve on top of its normal reward. Coin holders voted in September to begin paying that reserve back through block rewards in February 2031, Unchained [added](https://unchainedcrypto.com/zcash-activates-nu7-on-public-testnet-opening-a-trial-run-for-25-second-blocks/).

The upgrade caps shielded activity in each block, with 330 Orchard or Ironwood actions and 300 Sapling inputs and outputs plus a shared budget, the foundation [listed](https://zfnd.org/zebra-7-0-0-rc-0-nu7-arrives-on-testnet/). The caps more than double Orchard throughput while cutting the worst sync load on light wallets by about 37 percent.

NU7 turns off version 4 transactions, which suspends Sprout, the network's first shielded pool. Holders with funds still in Sprout must move them before mainnet activation to keep the ability to spend them, as [covered](https://www.coindesk.com/tech/2026/10/05/zcash-s-25-second-blocks-go-live-on-public-testnet-ahead-of-schedule) in the testnet report. A participant in the timeline thread said funds left in Sprout after the upgrade would in practice be stuck. The testnet switch does not strand mainnet coins by itself, but it rehearses the rule that will apply at mainnet.

Mining procedures tighten under the new design. Because the coinbase depends on the chosen fees and the parent reserve, pools should request a fresh template rather than edit the set, the foundation [warned](https://zfnd.org/zebra-7-0-0-rc-0-nu7-arrives-on-testnet/). Coinbases claim only the miner's 40 percent fee share, and testnet mining now needs a synced node.

Developers will use the run to settle the mainnet step. They plan a go or no-go choice plus a mainnet height decision on Oct. 20, with Nov. 5 held as the target, according to a [schedule](https://forum.zcashcommunity.com/t/nu7-timeline/57655) posted by Zcash co-founder Sean Bowe and [summarized](https://unchainedcrypto.com/zcash-activates-nu7-on-public-testnet-opening-a-trial-run-for-25-second-blocks/) in testnet coverage. Bowe wrote that wallets should see no major effect, while full nodes, indexers and explorers may need work. As of early Monday UTC the Zakura dashboard showed a median gap of 19.5 seconds over the latest 300 blocks, against a 17.3-second median expected when blocks average 25 seconds.
