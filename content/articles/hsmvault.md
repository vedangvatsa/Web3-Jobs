---
title: Blockstream Launches Offline Bitcoin Custody System Built With Thales
ogTitle: "BLOCKSTREAM LAUNCHES OFFLINE BITCOIN CUSTODY SYSTEM BUILT WITH THALES"
description: >-
  Blockstream's institutional custody product pairs Thales hardware security modules
  with the company's Secure-MPC signing, keeping keys and key shares inside dedicated
  hardware for banks, prime brokers and other professional clients.
image: /images/news/hsmvault.jpg
imageCaption: "Adam Back in 2014. Photo: Joi Ito via Wikimedia Commons (CC BY 2.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Adam_Back_2014.jpg
category: News
data-ai-hint: portrait of technology founder
publishedDate: '2026-11-14'
lastUpdated: '2026-11-14'
---

Blockstream launched an institutional Bitcoin custody product on Friday built with French technology group Thales, pairing Thales hardware security modules with Blockstream's Secure-MPC signing so that transaction approval happens inside dedicated security hardware. The combination lets institutions authorize transactions while keeping sensitive cryptographic operations inside the hardware, according to the company. Blockstream announced the product on Nov. 13, the same day it walked through the architecture at the Digital Assets Forum in New York, according to [Crypto Briefing](https://cryptobriefing.com/blockstream-thales-bitcoin-custody-offline-security/).

Unlike conventional MPC deployments that run parts of the signing flow outside dedicated hardware, Blockstream said its design executes the entire signing protocol within the Thales HSMs. Private keys and MPC key shares never cross the hardware boundary during signing, [the report said](https://cryptobriefing.com/blockstream-thales-bitcoin-custody-offline-security/). Signing authority is split into shares that several parties combine to produce a valid signature, and no single share can move funds on its own.

The product is aimed at custodial banks, prime brokers and other institutional holders of Bitcoin. Its feature list includes policy controls, segregated accounts, multisignature options and cryptographic audit trails, and Blockstream Enterprise custody and tokenization services have been in beta with select private clients since the third quarter of 2026. Blockstream Enterprise also supports air-gapped signing setups alongside multisignature systems, [the Crypto Briefing report said](https://cryptobriefing.com/blockstream-thales-bitcoin-custody-offline-security/).

The company's stated goal is to let an institution custody Bitcoin and issue tokenized assets through one provider, building on the Liquid Network's existing issuance tools. Blockstream research materials frame the launch as a way to win over institutional investors who held back over key-security concerns.

Blockstream co-founder and CEO Adam Back argued in an interview that many MPC protocols are too interactive for cold storage. "When people talk about MPC, they're talking about some very esoteric and complicated protocols that are hard to secure and are very interactive. So you can't really use them in a cold storage setting," [he told Cointelegraph](https://cointelegraph.com/news/adam-back-simpler-security-blockstream-bitcoin-custody-system).

Back tied the pitch to the Binance hack disclosed in late October, in which attackers stole an estimated $6.3 billion. He pointed to the exchange's investigation, which [found](https://cointelegraph.com/news/adam-back-simpler-security-blockstream-bitcoin-custody-system) that the intruders compromised employee devices and obtained credentials reaching wallet-signing infrastructure. "If you connect equipment to the internet, even if it's via firewalls and so on, there is risk that you can get unauthorized access. You can get hackers into the network, get hackers with access to logins they shouldn't have and so on," Back said.

He also said artificial intelligence could make those risks harder to manage by helping attackers spot weaknesses that human reviewers miss. "The AIs can help attackers find small implementation errors and things like that, which may not be obvious," he said. Asked whether the custody industry would move toward offline models, Back said he hoped institutions would "adapt to the environment" and shift assets into cold storage, summing up his position in five words: "Complexity is the enemy of security."

Back is a cryptographer whose Hashcash system helped lay the groundwork for Bitcoin's proof-of-work mechanism. Blockstream was co-founded by Back in 2014 and is known for Bitcoin infrastructure work including the Liquid Network, a Bitcoin sidechain for faster settlement and issuing digital assets that recently passed $3 billion in total value locked, [Crypto Briefing reported](https://cryptobriefing.com/blockstream-thales-bitcoin-custody-offline-security/). The company opened an office in Lugano in late 2026 as it expanded enterprise services.

The launch lands as exchanges and infrastructure firms rebuild custody practices after the Binance theft and as a growing number of banks evaluate Bitcoin holdings for clients. Blockstream's answer keeps the signing keys in certified hardware and offline, a design that removes the network path that attackers used in October. Back argued that institutions facing AI-assisted attacks should treat simplicity as the defense: fewer moving parts leave fewer openings for someone who gets onto a network.
