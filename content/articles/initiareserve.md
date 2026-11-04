---
title: Initia hack drove its USDC bridge reserve down to $63 as withdrawals failed
ogTitle: "INITIA HACK DROVE ITS USDC BRIDGE RESERVE DOWN TO $63 AS WITHDRAWALS FAILED"
description: An Oct. 23 exploit on Initia printed $7.48 million in unbacked tokens, paid out $2.73 million from bridge reserves, and left the Noble USDC reserve holding $63 while ordinary withdrawals bounced.
image: /images/news/initiareserve.jpg
imageCaption: "Server racks inside a data center. Photo: BalticServers.com via Wikimedia Commons (CC BY-SA 3.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:BalticServers_data_center.jpg
category: News
data-ai-hint: data center servers
publishedDate: '2026-10-26'
lastUpdated: '2026-10-26'
---

One account on Initia created $7.48 million in tokens out of nothing in 13 seconds on Oct. 23, then cashed $2.73 million of real coins out of the bridges that back assets on the chain, according to an [on-chain investigation by Bitquery](https://bitquery.io/investigations/initia-hack). The attack emptied Noble's USDC reserve from $1.09 million to $63 in 36 minutes, and ordinary users' USDC withdrawals began failing as the reserve ran dry.

Initia is a layer 1 blockchain designed to connect app-specific rollups. Tokens on the chain that arrived through bridges are copies backed by real assets held on other networks: when a holder returns a copy, the bridge's reserve releases the matching real coin. The attacker minted copies without depositing anything behind them, then sent those copies back over three bridges to draw down the reserves.

Bitquery traced four batches of token creation beginning at 14:59:17 UTC on Oct. 23. The program minted $3 million in iUSD, Initia's own dollar coin, plus copies worth $2 million in USDC, $2 million in AUSD and about $481,000 in wrapped ether, all at face value. None of it was backed. Over the following half hour the account made 11 attempts to move tokens off the chain; four succeeded, pulling $1.4 million in AUSD, about $1.08 million in USDC and 105 ether into Ethereum, [the investigation found](https://bitquery.io/investigations/initia-hack).

Noble, the Cosmos chain that issues Circle's USDC to chains like Initia, held the reserve backing USDC copies on Initia. That reserve fell to $63 at 15:37 UTC and held about $24,000 at Bitquery's 18:52 UTC check later that day. Three larger USDC withdrawal requests from the attacker bounced with insufficient-funds errors, but the $1 million and $80,000 transfers that got through, plus a wave of ordinary withdrawals, drained what remained. By the time the chain stopped, 55 normal USDC withdrawal attempts had failed, most from a single trading bot resubmitting the same balance.

[CryptoSlate reported](https://cryptoslate.com/initia-hack-drove-its-usdc-bridge-reserve-down-to-63-as-withdrawals-failed/) that the attacker's early $2.6 million count from security researcher Spreek was close to the final figure: the hacker's Ethereum wallet held about $2.73 million in ether by the time Initia halted. Bitquery valued the real assets paid out from reserves at $2.73 million, distinct from roughly $7 million in unauthorized balances that remained stuck on Initia, most of it iUSD that could never sell near face value. The ether reserve on Ethereum lost 96% of its coins and the AUSD reserve lost 71%.

Initia's L1 and its rollups halted at 15:41:30 UTC on Oct. 23, [the project said](https://phemex.com/news/article/initia-reveals-attack-details-movevm-script-caching-flaw-led-to-27m-theft-100894). In an update the next day it attributed the exploit to a MoveVM script-caching bug that let the attacker bypass security checks and forge balances of WETH, iUSD and USDC without changing the corresponding total supplies. No native INIT was minted, the project said. Co-founder Zonny estimated in an early post that about $3 million had been bridged out before the pause.

The stolen funds were swapped into 1,135.52 ETH on Ethereum within minutes and moved to a fresh wallet five seconds after the halt, [Bitquery's report states](https://bitquery.io/investigations/initia-hack). That wallet had not moved the funds when investigators checked at 18:52 UTC. None of the money reached Base, Arbitrum, BNB Chain, Optimism or Polygon; LayerZero recorded zero deliveries from Initia on those chains since Oct. 22.

Agora, which issues AUSD, said its contract was never deployed on Initia and no AUSD was minted there. The affected exposure was a separate third-party product using AUSD on Ethereum that Agora does not operate, [CryptoSlate reported](https://cryptoslate.com/initia-hack-drove-its-usdc-bridge-reserve-down-to-63-as-withdrawals-failed/). Agora said later on Oct. 23 that it would freeze AUSD held by the attacker's addresses, but the attacker had already swapped all of its AUSD for ether.

At 08:46 UTC on Oct. 24, Initia said its systems remained halted and that a fix was expected to be completed and audited within days, with asset recovery ongoing alongside security partners and exchanges. The update gave no firm restart date and no terms for reimbursing users whose bridge-backed balances lost their reserves. How the roughly $1.55 million in real-coin copies still stuck on Initia, plus the empty reserves behind them, will be made whole remains unanswered.
