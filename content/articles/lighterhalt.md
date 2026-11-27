---
title: Lighter restores withdrawals and recovers $5 million after $10.4 million exploit
ogTitle: "LIGHTER RESTORES WITHDRAWALS AND RECOVERS $5 MILLION AFTER $10.4 MILLION EXPLOIT"
description: A compromised trader API key let an attacker pull 10.39 million USDC out of Lighter's Ethereum contract; the DEX paused withdrawals, recovered about $5 million and reopened transfers.
image: /images/news/lighterhalt.jpg
imageCaption: "A data center server hall. Photo: BalticServers.com via Wikimedia Commons (CC BY-SA 3.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:BalticServers%20data%20center.jpg
category: News
data-ai-hint: data center server hall
publishedDate: '2026-11-18'
lastUpdated: '2026-11-27'
---

Decentralized derivatives exchange Lighter paused all withdrawals on Nov. 16 after an attacker pulled 10.39 million USDC out of its Ethereum contract, then reopened them the same day after recovering about $5 million for the affected trader. Lighter said a leaked API key for one trader's account caused the incident and that its protocol and smart contracts were never touched, according to [Cointelegraph's updated report](https://cointelegraph.com/news/lighter-dex-pauses-withdrawals-10m-exploit) on the incident.

Blockchain analytics firm Bubblemaps put the withdrawn total at about $10.4 million in USDC. Lighter's own [on-chain record](https://bitquery.io/investigations/lighter-hack) shows a single transfer of 10,393,057 USDC leaving the exchange's contract at 10:11 UTC on Nov. 16, paid to one wallet. The attacker moved fast: 96 seconds after the withdrawal, the wallet began selling USDC on CoW Swap, and five orders cleared $10.36 million into 5,752 ether within four minutes, Bitquery found.

The exit route ran through Hyperliquid. Over the next 96 minutes the wallet sent 160 ether at a time to twelve new addresses, moving 1,920 ETH in total. Each receiving wallet bridged its funds through LI.FI within minutes, and accounts sharing those addresses then bought XMR1, a token on Hyperliquid named after Monero, on the same venue. The twelve accounts spent $3.46 million on 6,705 XMR1, Bitquery reported. Another 3,845 ETH, about $7.0 million, was still sitting in the original wallet as of 11:55 UTC that morning.

Withdrawals stopped inside the hour. Lighter activated what it calls Guardian mode, freezing withdrawals and new pool creation while its Security Council secured the platform, Cointelegraph reported. Posts on X that Bitquery reviewed claimed two market maker accounts were drained for about $15.5 million combined, though the second figure, $5.09 million, had not left Lighter's contract when Bitquery last read the chain. The exchange's statement speaks of one compromised trader account.

Lighter published a postmortem at 18:20 UTC the same day. The attacker obtained private API keys through a trader's custom signing software, which reused cryptographic nonces, letting the keys be recalculated from publicly available signatures. With those keys the attacker created a public pool, moved funds into it and withdrew them through an attacker-controlled account. The exchange said Guardian mode held the funds in place long enough for the Security Council to return roughly $5 million in USDC to the trader.

The exchange has already changed how its API works. Transfers to public pools now require wallet signatures, API-key signatures are no longer public, and Lighter plans to add IP allowlists and configurable permissions for keys. The exchange said its protocol, smart contracts and official software development kits were unaffected, and it restored withdrawals after the recovery.

Bitquery traced a similar pattern in two other incidents that day: a Safe wallet drained of about $6.45 million at 11:35 UTC, 84 minutes after the Lighter withdrawal, and a Kava exploit two days earlier. All three sets of funds moved through LI.FI into XMR1 purchases on Hyperliquid, but the firm found no on-chain transfer linking the cases and cautioned that a shared route alone is weak evidence of a common attacker.

Scam bots followed the money as it moved. The wallet's first 160 ETH transfer drew a fake copy from an address-poisoning bot 12 seconds later, and within the hour the wallet's history held fifteen fake transfers to look-alike addresses. None of the real payments went to a fake receiver, Bitquery said.

Cointelegraph placed the incident in a wider year of exploits, noting the $6.3 billion Binance hack on Oct. 29 as the largest so far. The exchange told users it aimed to finish a contract upgrade and reopen withdrawals by the end of Nov. 16, and its updated report confirms transfers resumed after the recovery.

At 11:55 UTC the attacker wallet still held 67% of the swapped ether, and 3,845 ETH remained in it hours later. The twelve Hyperliquid accounts held almost all of their 6,700 XMR1 at the last snapshot Bitquery read, 12:44 UTC on Nov. 16.
