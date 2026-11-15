---
title: Kava Lend exploit borrows 55.2 million KAVA as Korean exchanges halt deposits
ogTitle: "KAVA LEND EXPLOIT DRAINS 55.2M KAVA"
description: Attackers borrowed 55.2 million KAVA from Kava Lend through 127 loans on a dormant BUSD market, sold most for $2.09 million, and Upbit, Bithumb and Coinone suspended deposits.
image: /images/news/kavalendhack.jpg
imageCaption: "N Seoul Tower above the city. Upbit, Bithumb and Coinone, South Korea's major crypto exchanges, halted KAVA deposits and withdrawals after the exploit. Photo: Larry Koester via Wikimedia Commons (CC BY 2.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Seoul_Tower_View.jpg
category: News
data-ai-hint: Seoul tower city view
publishedDate: '2026-11-15'
lastUpdated: '2026-11-15'
---

Kava's KAVA token lost about 40% of its value on Nov. 14 after attackers drained its Kava Lend borrowing protocol, and South Korea's three largest crypto exchanges froze transfers of the coin. Upbit, Bithumb and Coinone suspended KAVA deposits and withdrawals while assessing the situation, [Crypto Briefing reported](https://cryptobriefing.com/kava-token-incident-bridge-shutdown/). Upbit issued a caution notice and put the token on its delisting watchlist; Bithumb and Coinone halted transfers as a precaution.

The attackers borrowed about 55.2 million KAVA from Kava Lend and never repaid it. The protocol's pooled deposits, held in the lending module's account, fell from 55.33 million KAVA to 0.19 KAVA in a little over an hour and a half, according to an [on-chain investigation by Bitquery](https://bitquery.io/investigations/kava-hack). [TokenPost](https://www.tokenpost.com/news/technology/57560) put the pre-attack market value of the borrowed coins at about $3.76 million, at the $0.068 price KAVA traded at before the attack.

The theft ran through the lending market for BUSD, the Binance-branded stablecoin whose issuer Paxos stopped minting in February 2023. By November the pool was close to empty: the investigation's data shows it owed lenders 440,145 BUSD while holding 0.003 BUSD in cash, with a supply index of 2.76. The attackers first drove the pool's supply figure down to two hundred-millionths of a dollar. Over the next three minutes the interest index climbed about 243,000 times, turning a small BUSD deposit into roughly 1.26 billion BUSD of paper collateral.

With that inflated collateral, a second wallet borrowed KAVA 127 times in 98 minutes, from 04:04 to 05:42 UTC on Nov. 14. Each loan was liquidated one block later, and the liquidation closed the debt without recovering the collateral, so the helper wallet kept the coins and the borrowing cap opened up again for the next round. The loop left the pool holding 519 KAVA, Bitquery said. The investigation also found the wallets had run repeated deposit and borrow cycles in the market since Nov. 8 to prepare.

About 49.2 million of the borrowed KAVA was then bridged to BNB Chain through LayerZero, TokenPost reported. A third wallet sold 48.4 million of those coins there in 35 minutes across 46 transfers for about $2.09 million in BNB and USDT, and the BNB was moved out soon after. Another roughly 4.58 million KAVA went to five unlabeled addresses on the Kava network.

Part of the money did not make it through. The review found the Relay bridge blocked 612,416 USDT, about 29% of the sale proceeds, under a wallet-block rule, and the funds had not moved. The same review traced $1.17 million of the proceeds into a 2,190 XMR1 position opened across eight accounts on Hyperliquid, which had not shifted by 16:14 UTC on Nov. 14.

Kava told users the event was confined to Kava Lend. "This is not an infinite mint," the team wrote on X, and said the incident was isolated and contained within the lending app, per the investigation's summary of those posts. The project addressed reports that KAVA had been bridged to BNB Smart Chain and sold, a wave of transfers that drove the token's decline. Kava also paused its Axelar bridge as a precaution, halting cross-chain withdrawals through that service, even though the stolen coins left the network through LayerZero.

Price data showed KAVA falling from about $0.068 to $0.041 over 24 hours, a 41% decline, according to CoinGecko figures cited by Crypto Briefing. Bitquery's hourly chart shows the price held steady for six hours after the pool was emptied and only moved once the coins reached BNB Chain, when it lost about a third of its value in 35 minutes.

Kava Lend is the lending and borrowing application on Kava, a DeFi-focused layer 1 built with the Cosmos SDK and Tendermint consensus that pairs an Ethereum co-chain for Solidity contracts with a Cosmos co-chain for native modules and IBC transfers. The team said it would publish a complete incident report once it was ready, and Korean exchanges kept their restrictions in place while waiting.
