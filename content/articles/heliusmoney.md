---
title: Decrypt Money Account adds confidential transfers through Helius privacy rings
ogTitle: "DECRYPT MONEY ACCOUNT ADDS CONFIDENTIAL TRANSFERS THROUGH HELIUS PRIVACY RINGS"
description: Helius launched Solana Privacy Rings on mainnet Nov. 10 and integrated them with the Decrypt Money Account, hiding transfer amounts while wallet addresses stay visible.
image: /images/news/heliusmoney.jpg
imageCaption: "Servers at the Wikimedia Foundation data center. Photo: Victorgrigas via Wikimedia Commons (CC BY-SA 3.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Wikimedia%20Foundation%20Servers-8055%2013.jpg
category: News
data-ai-hint: data center servers
publishedDate: '2026-11-13'
lastUpdated: '2026-11-13'
---

Decrypt has partnered with Solana infrastructure company Helius to add confidential transfers to the Decrypt Money Account, using Helius' Solana Privacy Rings system, the two companies said on Nov. 10. Users of the account will be able to send funds without the amounts showing on Solana's public ledger.

The core programs went live on Solana mainnet the same day, Helius said in a post on X that called the rings programmable onchain environments for encrypting money, markets and finance without leaving Solana. [Decrypt described](https://decrypt.co/382806/decrypt-money-account-gets-confidential-transfers-with-solana-privacy-firm-helius) how the integration works for Money Account users, and [CryptoSlate examined](https://cryptoslate.com/helius-encrypts-solana-transfers-without-removing-operator-trust/) the protocol's trust model in detail. Sender and recipient wallet addresses remain visible onchain; the asset and amount inside the transfer are encrypted.

"For users, confidential transfers work like any other Solana transfer," said Tilo Palfner, product lead at Helius. "Solana Privacy Rings feel like any Solana transfer: almost instant. The difference is that the world cannot see what you're sending." The Decrypt Money Account operates without seed phrases, gas fees or bridging, and succinct zero-knowledge proofs let users prove they own and can spend a balance without revealing it, Palfner said.

For now the privacy feature covers sending funds only. It does not yet cover Jupiter-powered swaps on The Information Exchange, Earn positions or prediction market positions. "This is the first step," Palfner said, adding that the rings lay groundwork for private swaps, lending and yield products later.

Decrypt co-founder and COO Ilan Hazan said privacy is a core component of the product. The Money Account is part of Decrypt's evolution into The Information Exchange, which brings reading, trading and prediction markets together in a single account, the company said. Chief product officer Alex Solleiro said the ability to transfer and trade privately supports onboarding more users and use cases onto on-chain finance. Helius chief executive Mert Mumtaz argued that privacy is the remaining scaling problem for the wider crypto space: "When people talk about adoption and scaling in crypto, they mistakenly only think about throughput and latency, but the final scaling frontier in crypto is actually privacy." He added, "You can not hack what you cannot see," and said that for crypto to grow a thousandfold from here, privacy must be treated as a first-class citizen.

The system is designed to work alongside compliance tools. Users can share access to private balances through viewing keys, either kept on the device or delegated to an authorized provider that can read balances and history but cannot spend. Blockchain analytics firms including Range, Chainalysis, Elliptic and TRM Labs support wallet screening to identify sanctioned addresses, according to Helius. "Privacy and compliance do not have to be at odds," Palfner said, adding that each application "still needs to define and enforce its compliance policies."

CryptoSlate's technical review found that the documented default prover processes secret transaction inputs inside an attested AWS Nitro enclave while the wallet retains the signing key. Wallets can check the enclave's certificate chain, software measurements and encryption-key binding against an approved policy, but code review, AWS isolation and the operator's key-management policy binding remain separate trust dependencies, the report said. Even correctly encrypted requests leave metadata such as paths, queries, timing and sizes visible to the parent host, and the path reveals the circuit shape of the proof, CryptoSlate noted. Helius says Certora, OtterSec and ZK Security audited the programs and circuits; CryptoSlate's reading of the firm's security page lists Certora in October and zkSecurity in August, with OtterSec awaiting a report.

Custom Rings, which will let institutions set their own compliance controls and auditor access, are planned for the fourth quarter of 2026, Decrypt reported. The default ring is permissionless, has no global auditor key, and lets users recover private balances directly from Solana without relying on a separate provider to store their encrypted data.
