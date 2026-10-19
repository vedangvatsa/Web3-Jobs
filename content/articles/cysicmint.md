---
title: Cysic halts bridge after unauthorized mint of 10 million CYS
ogTitle: "CYSIC HALTS BRIDGE AFTER UNAUTHORIZED MINT OF 10 MILLION CYS"
description: Cysic suspended its cross-chain bridge after 10 million CYS were minted without authorization on BNB Smart Chain, then blacklisted the recipient address with about 2.8 million tokens still in it.
image: /images/news/cysicmint.jpg
imageCaption: "A data center server room. Photo: BalticServers.com via Wikimedia Commons (CC BY-SA 3.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:BalticServers%20data%20center.jpg
category: News
data-ai-hint: data center server room
publishedDate: '2026-10-19'
lastUpdated: '2026-10-19'
---

Cysic suspended its cross-chain bridge after an attacker minted 10 million CYS tokens without authorization on BNB Smart Chain on Oct. 17. The Cysic Foundation said in an [incident report](https://x.com/cysic_fdn/status/2111761749116637687) that the mint occurred at 12:31:38 UTC and that the recipient address was blacklisted at 13:47:52 UTC.

About 2.8 million CYS remained at the blacklisted address when transfers were restricted, according to the report. The remaining tokens had left the address before the freeze, Cysic said, so the blacklist captured only part of the unauthorized supply. The foundation said the transfers, swaps and eventual losses remain under review, and that the number of tokens minted does not establish the final dollar loss.

Cysic said the incident was confined to the bridge's message processing and minting functions. The mainnet, block production, transaction confirmation and EVM execution were not affected, and existing user assets were not stolen, according to the foundation. The bridge remains closed and will reopen only after a security review, with no reopening date announced.

Preliminary findings point to unauthorized access to a database used by services supporting the bridge. The attacker then exploited a vulnerability in the bridge's processing logic to submit a fraudulent mint message, Cysic said. The foundation has not confirmed the full attack path or root cause and said it hired an outside security firm to investigate and trace the funds. The incident report, published Oct. 18, links to the mint transaction and the blacklist transaction on BNB Smart Chain.

The foundation said it is reviewing message processing, permission settings and related asset records. It plans to publish a follow-up report covering the verified impact, actual losses, tracing progress and remediation. The report did not identify the security firm and said sensitive details about the attacker's identity and tracing would be withheld while the investigation continues.

Cysic said it will reopen the bridge only after remediation and validation. The foundation did not say when that review would be complete or what changes it would make to the bridge's database access and minting controls.

Cysic runs a decentralized compute network. CYS is the utility token, while CGT handles governance and is obtained through staking, [Crypto Briefing reported](https://cryptobriefing.com/cysic-halts-bridge-unauthorized-cys-mint/). The bridge incident involved CYS, and Cysic has not reported any impact on CGT. CYS coordinates incentives for users, compute providers, governance participants and contributors, according to tokenomics documentation cited by Cointelegraph.

The incident report lists the recipient address as 0xA4e1827Fe2664fD0797a55e442b2e2639449C255 and links to the mint and blacklist transactions on BscScan. Cysic has not disclosed the dollar value of the 2.8 million frozen tokens at the time of the blacklist.

The unauthorized mint added a large amount of supply relative to the circulating total. Cysic said about 160.8 million CYS were in circulation at the time, according to CoinMarketCap data cited by [Cointelegraph](https://cointelegraph.com/news/cysic-crypto-bridge-halted-after-unauthorized-mint-of-10m-cys). The minted tokens equal roughly 6% of that circulating supply. CYS has a maximum supply of 1 billion tokens.

Crypto Briefing said the project launched its mainnet and held its token generation event in December 2025. The mainnet and event followed a funding round and testnets, the publication reported, adding that the launch drew criticism over token distribution and financial transparency.

The incident is the first notable security problem tied to Cysic's bridge infrastructure, according to Crypto Briefing. The publication compared it with a bridge mint exploit at Syscoin in June 2026, where an attacker also created tokens outside the intended process. Those incidents point to the controls around minting functions, Crypto Briefing wrote.

Bridge users cannot move CYS across chains through Cysic's bridge until it reopens. The foundation said cross-chain services remain unavailable and that it will announce reopening arrangements through official channels. It has not said whether the blacklisted 2.8 million CYS will be burned, returned or handled another way.

Cysic also said it would share material updates as the investigation proceeds. The foundation's report did not give a timetable for the next update or say how much the incident has cost the project.
