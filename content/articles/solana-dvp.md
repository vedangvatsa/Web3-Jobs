---
title: Solana Foundation Launches DvP Atomic Settlement Program for Banks
ogTitle: "SOLANA FOUNDATION LAUNCHES DVP ATOMIC SETTLEMENT PROGRAM FOR BANKS"
description: Solana Foundation released an open-source delivery-versus-payment program on Oct. 5 with input from J.P. Morgan, aiming to settle institutional trades atomically in seconds.
image: /images/news/solana-dvp.jpg
category: News
data-ai-hint: stock exchange trading floor
publishedDate: '2026-10-06'
lastUpdated: '2026-10-06'
imageCaption: "Traders work on the floor of the New York Stock Exchange. Solana Foundation pitched its new settlement program to similar institutions. Photo: Thomas J. O'Halloran via Wikimedia Commons (Public domain)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:NY_stock_exchange_traders_floor_LC-U9-10548-6.jpg
---

Solana Foundation introduced an open-source settlement program for banks and other financial firms on Oct. 5, publishing code that lets two sides of a securities trade move at the same instant on Solana. The program, called Solana DvP, offers a standard application programming interface for delivery-versus-payment settlement, [the Foundation said in its release](https://www.prnewswire.com/news-releases/solana-foundation-launches-solana-dvp-an-atomic-settlement-program-built-for-financial-institutions-302898811.html).

Delivery-versus-payment means the asset leg and the cash leg settle together or neither settles at all. Traditional securities markets achieve that result through clearinghouses, depositories and custodians over one to two days. The release presents the new program as a single atomic transaction with finality in seconds rather than days.

The code carries the permissive MIT license, so any firm can inspect, copy and adapt it without negotiating a proprietary license first. [Decrypt reported](https://decrypt.co/380126/solana-institutional-settlement-standard-jp-morgan) that the release replaces bespoke smart contracts, which institutions have typically commissioned trade by trade, with one reusable standard.

J.P. Morgan provided input on institutional settlement practices and requirements while the Foundation built the program. Rhodel D'souza, the bank's head of markets digital assets, said a shared open standard for atomic delivery-versus-payment is the type of base infrastructure market participants need to operate at scale without added settlement risk, [according to the release](https://www.prnewswire.com/news-releases/solana-foundation-launches-solana-dvp-an-atomic-settlement-program-built-for-financial-institutions-302898811.html).

The release carries a disclaimer that limits how that contribution should be read. J.P. Morgan's involvement was confined to input on settlement practices, and the notice states it should not be read as the bank designing, developing, operating, approving, certifying, warranting, endorsing or guaranteeing the program or its performance.

Catherine Gu, head of product for digital assets at Solana Foundation, said atomic settlement removes counterparty risk found in traditional finance and gives institutions one open standard across the Solana ecosystem on public infrastructure. Her statement put the practical contrast in time terms, with finality in seconds instead of days, [the release says](https://www.prnewswire.com/news-releases/solana-foundation-launches-solana-dvp-an-atomic-settlement-program-built-for-financial-institutions-302898811.html).

The program supports SPL Token and Token-2022 assets, including extensions that regulated issuers depend on such as permanent delegate, pausable tokens and transfer hooks. Any two counterparties can use it with any settlement agent, whether a bank, a custodian or an exchange. The design isolates each trade in escrow and enforces deadlines, so a missed step leaves both sides where they started.

External security auditors reviewed the code, and the Foundation described it as ready for use with real funds. Privacy features are planned next, so that trade settlements can be kept confidential. The Foundation invited design partners and early participants ahead of a production release and pointed developers to the code on GitHub.

A December 2025 transaction served as an early proof point for the approach. J.P. Morgan arranged a 50 million dollar commercial paper issuance for Galaxy Digital Holdings LP on Solana, [Crypto Briefing reported](https://cryptobriefing.com/solana-launches-dvp-institutional-settlement/), with the delivery-versus-payment function handling both issuance and redemption in USDC. Commercial paper is short-term corporate debt used to fund day-to-day operations, and Galaxy sat on the issuer side of that deal.

The same [report](https://cryptobriefing.com/solana-launches-dvp-institutional-settlement/) described atomic execution in under one second and finality on Solana at around 400 milliseconds with low fees, against one to two days in traditional settlement. It added that the reference implementation swaps a tokenized security such as commercial paper against USDC in one step, so one party is never left with nothing while the other holds both legs.

Tokenized/U.S. stock efforts give the timing added context. Kraken has used Solana to offer tokenized U.S. stocks to overseas customers through its xStocks product, [Decrypt noted](https://decrypt.co/380126/solana-institutional-settlement-standard-jp-morgan). BlackRock in August launched a tokenized money market fund for stablecoin reserves that records ownership on Solana alongside Ethereum, structured to qualify as a reserve asset under the GENIUS Act.

Solana had already moved toward enterprise tooling earlier in the year. It launched a developer platform on March 24, 2026 with enterprise interfaces for issuing and settling tokenized assets, [Crypto Briefing wrote](https://cryptobriefing.com/solana-launches-dvp-institutional-settlement/). Morgan Stanley, BNY, State Street and Societe Generale are among the firms that have piloted or put Solana capabilities to work in asset workflows, the outlet added.

For banks, the open question is operational rather than theoretical. Institutions will want evidence that the network stays reliable under load and that on-chain finality maps cleanly onto existing legal definitions of a completed trade. The Foundation did not disclose commercial terms, fee schedules or a list of committed launch users in the release.
