---
title: Papertrade launches 1000x perps, then tightens limits after manipulation claims
ogTitle: "PAPERTRADE LAUNCHES 1000X PERPS, TIGHTENS LIMITS"
description: Papertrade opened 1000x perpetuals on HyperEVM on Oct. 10 with heavy early volume and staker payouts, then limited new exposure on Oct. 11 after observers alleged oracle manipulation around a trader's $1.28 million run.
image: /images/news/papertrade.jpg
imageCaption: "Traders on the floor of the New York Stock Exchange. Photo: Thomas J. O'Halloran via Wikimedia Commons (public domain)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:NY_stock_exchange_traders_floor_LC-U9-10548-6.jpg
category: News
data-ai-hint: stock exchange trading floor
publishedDate: '2026-10-12'
lastUpdated: '2026-10-12'
---

Papertrade, a perpetuals venue offering up to 1000x on every trade, opened on HyperEVM on Oct. 10 at 10 a.m. ET. The launch drew outsized early flows and staker payouts, then an allegation of oracle manipulation and a round of tighter limits within 48 hours.

The venue runs fully on chain with no orderbook, no funding payments and no slippage quotes. Traders buy and sell in one click against a house pool, with prices set by a BBO-midpoint oracle read through HyperCore precompiles. There was no pre-mint, no team allocation and no venture round. A PAPER token mints from realized trader losses at 100 PAPER per $1 of loss while the tracked pool sits under $2 million, with the rate decaying above that and a $5 million staker cap, according to the [project docs](https://docs.papertrade.xyz/). Deposits paused at 9:45 a.m. ET ahead of the open, with frontend and approved relayers as the only routes in, Chaincatcher [reported](https://www.kucoin.com/news/flash/hyperevm-perpetual-exchange-papertrade-launches-oct-10-with-1000x-leverage) on Oct. 10.

Pre-launch deposits tracked by DefiLlama sat near $85.3 million, every readable copy attributes the number to DefiLlama, and no second tracker has confirmed it. Reported first-hour open interest near $3 billion comes from analyst Josh Ong's 10:51 a.m. ET post, explicitly not independently verified on chain, Phemex [reported](https://phemex.com/news/article/papertrade-trading-launches-with-3-billion-firsthour-open-interest-99424) on Oct. 10. Hours after launch the platform showed $10.3 million in cumulative staker rewards, against a $5 million pool with $4.44 million in house funds and negative $556,000 in open profit and loss.

## The $1.28 million trader and the allegation

One wallet, ending 840e, netted about $1.28 million within hours on Oct. 10. Between 6:01 and 6:02 p.m. ET it bought about 6,060 ETH, nudging the price up roughly 0.12 percent, then sold about 5,210 ETH a minute later. Roughly $231 million in Hyperliquid ETH volume and $52,000 in fees surrounded the sequence. Withdrawals near $2.48 million exceeded $1.2 million in deposits. At 7:13 p.m. the wallet opened 30 ETH shorts at 660x, about $297 million notional, sold about 6,590 ETH down to $2,504.40, held for over three hours, and was liquidated at $2,509.95 for a $450,000 loss, minting about 17.6 million PAPER along the way. The minute-by-minute reconstruction comes from The Block's reporting, which other outlets rewrote without adding their own verification.

Observers cried foul. Pseudonymous watcher Boblob alleged two wallets near $20 million each on Hyperliquid moved ETH by 10 to 20 basis points while holding hundreds of millions in nominal Papertrade longs, exploiting the gap between Papertrade's midpoint and Hyperliquid's mark price. RedStone co-founder Marcin Kazmierczak shared the pattern as an interesting weekend oracle-manipulation strategy without publishing his own transaction analysis, the Cryptonomist [reported](https://en.cryptonomist.ch/2026/10/11/papertrade-trading-limits) on Oct. 11. The allegation is unconfirmed everywhere it appears. Profit alone does not prove manipulation, and the cited wallet's gains fell from about $1.73 million to $1.28 million as the night ran on.

Launch-day totals frame the staker side. Net realized trader losses hit $18.2 million, with $12.6 million in cumulative staking rewards flowing to PAPER stakers rather than refunding losers, Phemex [reported](https://phemex.com/news/article/papertrade-records-182m-in-net-trading-losses-at-launch-99429) on Oct. 10. Those figures come from the platform feed via Defiant coverage, and the rewrites add no independent count.

## The tightening

On Oct. 11 Papertrade said it was limiting new exposure on chain and through approved relayers. The starting setup, $1 billion in open interest per market and side plus $10 million per atomic position, had allowed excessive exposure. The team said that was not an oversight and that the new settings would make manipulation almost unprofitable, TokenPost [reported](https://www.tokenpost.com/news/investing/29892) on Oct. 11. A Sunday dashboard snapshot showed $2.81 million in house funds against $4.39 million in LP with zero queue.

Claims that the trader gave winnings back through new accounts or agreed reversals for PAPER could not be verified, and withdrawals still exceed deposits by about the $1.28 million net. The contracts run behind a 2-of-3 multisig, and a freeze mechanism lets existing positions close at a paused midpoint without confirming any wallet blacklist. The pool stood near $4.30 million on Oct. 11 against $3.14 million earlier, both with zero queue, the Cryptonomist [noted](https://en.cryptonomist.ch/2026/10/11/papertrade-trading-limits).
