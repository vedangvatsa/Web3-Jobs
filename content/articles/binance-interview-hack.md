---
title: Binance Says $6.34 Billion Hack Began With Fake Job Interview
ogTitle: "BINANCE SAYS $6.34 BILLION HACK BEGAN WITH FAKE JOB INTERVIEW"
description: >-
  Binance's first public account of the Oct. 29 theft says a five-month campaign
  started with a poisoned software download and a fake job interview that handed
  attackers a channel into its wallet engineers' machines.
image: /images/news/fakeinterview.jpg
category: News
data-ai-hint: job interview
publishedDate: '2026-11-05'
lastUpdated: '2026-11-05'
imageCaption: "A job interview in progress. Photo: Alan Cleaver via Wikimedia Commons (CC BY 2.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Job_interview.jpg
---

Binance published its first public account of the Oct. 29 theft on Tuesday, saying the $6.34 billion drain was the last step of a five-month campaign that began with a poisoned software download and a fake job interview. The incident report landed alongside a media briefing by co-CEO Richard Teng and chief security officer Jimmy Su, and [Bitcoin Magazine reported](https://bitcoinmagazine.com/news/binance-says-6-34-billion-hack-job) that the document describes a chain of social engineering moves against the exchange's wallet engineers.

The first foothold came in June, according to the report. A wallet DevOps engineer searched for a popular AI coding tool and downloaded a tampered Homebrew installer. Binance's security team caught the anomaly, replaced the device and rotated credentials, but the episode had already exposed the engineer's role and the names of colleagues working on wallet infrastructure.

In September, a second engineer was contacted through a legitimate job-hunting platform by someone posing as a project director, the report states. A video interview with a purported HR representative followed, and the interviewer shared a personal social media account to build trust. A second conversation with a supposed CEO ended with an assignment: a code repository the engineer was told to install on his work machine. The repository swapped a legitimate pyenv component for a malicious version and opened a channel to an attacker-controlled server, and Binance said the zero-day malware was not flagged by its endpoint tools at the time. [The BBC's report](https://www.bbc.com/news/articles/ck5ynwz9gy67o) described the same sequence, noting that the fake representatives used personal images in their profiles to make the approach look real.

On Oct. 20 the attackers used that machine and an internal AI tool to reach two more wallet engineers, one of whom held a container deployment token. On Oct. 29, between 17:15 and 19:56 UTC, they logged into a third engineer's computer, deployed a container with the stolen credentials and started moving funds.

The money left fast. Between 20:05 and 20:09 UTC, five hot wallets sent 233.46 million XRP to an attacker address, with wallets on Solana and Optimism following with about 970,500 SOL and 44.2 million OP. A Binance hot wallet then sent 18,270 BTC. The attackers also used Ethereum's EIP-7702 upgrade, which lets an account delegate execution rights to a smart contract, to give an attacker-controlled contract partial control of a hot wallet. Suspending withdrawals did not stop that channel: the group had already submitted 50 signing transactions to establish on-chain delegations that operated outside Binance's withdrawal infrastructure. Because the wallet used multi-party computation, no single key existed to revoke them, and the team had to build a procedure on the spot. The final unauthorized transfer, 2,961.9 ETH, settled at 23:56 UTC, and Binance cleared the delegation at 00:10 UTC on Oct. 30.

Binance said it has frozen or intercepted about $2.85 billion of the stolen assets and replenished 98% of the affected tokens from its own funds, with the balance bought on the open market. Teng wrote on X that the episode "wasn't one mistake or one breach" and that the company was publishing the full report because the lessons reach beyond Binance. Customers pulled $10.97 billion out in the 46 hours after withdrawals reopened Sunday, against net outflows of $5.28 billion, and by 03:00 UTC hourly deposits were running ahead of withdrawals, according to data Teng shared Tuesday. The exchange reopened withdrawals for dozens more assets across nine networks the same day.

The report says Binance blocked 57 other suspected North Korea-linked attempts this year using similar lures. The FBI has attributed the attack to North Korea, a finding the report cites without adding its own attribution, while Pyongyang rejected the claim on Monday: Kim Yo Jong called the accusation a "grave political provocation" through state media, as [the BBC reported](https://www.bbc.com/news/articles/ck5ynwz9gy67o). Binance has rebuilt the wallet system and the internal AI tool in new environments, replaced affected devices, revoked the engineers' credentials and expanded behavioral anomaly detection, and it said it is commissioning an independent review.
