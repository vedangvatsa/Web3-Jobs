---
title: Keystone to destroy almost 19,000 wallets after breach exposes customer data and device verification key
ogTitle: "KEYSTONE TO DESTROY 19,000 WALLETS AFTER BREACH"
description: Keystone said a website intruder obtained shipping data on almost 26,000 records and the WebAuth key used to verify devices, so it will destroy about 19,000 unshipped wallets and suspend shipping.
image: /images/news/keystonebreach.jpg
imageCaption: "A Ledger hardware wallet during a Bitcoin transaction. Photo: FlippyFlink via Wikimedia Commons (CC BY-SA 4.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:An_actual_Bitcoin_transaction_from_the_Kraken_cryptocurrency_exchange_to_a_hardware_LedgerWallet.jpg
category: News
data-ai-hint: hardware wallet device
publishedDate: '2026-10-27'
lastUpdated: '2026-10-27'
---

Hardware wallet maker Keystone said it will destroy almost 19,000 unshipped devices and suspend shipping after an attacker who broke into its online store also obtained the WebAuth key the company uses to verify that a device is genuine. The disclosure followed a customer-data breach first confirmed on Oct. 24 that exposed names, shipping addresses and order details.

Keystone detected unauthorized access to its official website on Oct. 20 and confirmed on Oct. 23, after reviewing API activity with Shopify, that a third party had obtained customer shipping information, the company said in a post on X. The confirmation came roughly 18 hours after a customer reported a "social engineering" call in which someone used Keystone order information, [Protos reported](https://protos.com/keystone-to-destroy-almost-19000-wallets-after-device-key-leak/). In a later update published by Oct. 26, the company put the total at almost 26,000 affected records from purchases made through Shopify on its site, plus about 13,000 incomplete purchase records with partial order information.

The same update carried the more serious admission. "The attacker also obtained the WebAuth key we use to verify whether a device is genuine," the company said, according to the Protos report. Newly built wallets will use a replacement key, shipping stays suspended until that change is complete, and almost 19,000 units of existing un-shipped inventory will be destroyed.

## What was and was not exposed

Keystone said payment card and bank details, recovery phrases, private keys and wallet passwords were not compromised. It blocked access, patched the vulnerability, opened an investigation and began emailing affected customers. The company warned that scammers could pose as Keystone staff by phone, text, email or mail, offering refunds, replacement devices or fixes for order addresses, and it told customers never to enter a recovery phrase into a device they had not ordered.

[Crypto Briefing's report](https://cryptobriefing.com/keystone-data-breach-exposed-2026/) recorded the initial Oct. 24 disclosure and the company's warning about impersonation attempts. Keystone is a Hong Kong-based self-custody brand known for air-gapped, QR-code-based transaction signing, with wallet software integrations including MetaMask, Keplr and OKX Wallet.

The update also conceded problems with Keystone's own data retention. The company had long advertised that shipping data is permanently deleted 180 days after an order. It said another 25,000 records had already been erased under its retention policy, but that its automated deletion tool "did not operate reliably," leaving some personal information stored beyond the permitted period, Protos reported.

## Customers report old orders in the breach

Several customers said they received breach notifications for purchases far older than 180 days. [Cointelegraph reported](https://cointelegraph.com/news/keystone-says-website-breach-exposed-hardware-wallet-buyers-addresses) that one X user said they bought a device more than two years earlier and still got the notice. The same user, posting as "OG DEGEN," described a call from someone claiming to be law enforcement investigating a fraud case; the caller referenced details matching a Keystone order the user placed in 2024, well outside the advertised retention window. Another user, trintaetres, also said the notification arrived despite a purchase made more than two years earlier, the report said. Keystone did not respond to Cointelegraph's questions about the retention policy or the number of customers affected by publication time.

Security researcher Taylor Monahan raised a further risk beyond phishing: leaked shipping addresses could expose holders to physical attacks and kidnappings, according to the Cointelegraph report. Blockchain security firm CertiK counted 52 verified "wrench attacks" worldwide in the first half of 2026, up 33% from 39 in the same period a year earlier, the firm told Cointelegraph.

The incident is one of several to hit hardware wallet vendors in recent weeks. Trezor disclosed a customer data breach at its logistics provider ShipMonk in August, and Ledger said earlier this month that criminals had modified genuine wallets to steal recovery phrases and resold them through Southeast Asian resellers, [Crypto Briefing reported](https://cryptobriefing.com/keystone-data-breach-exposed-2026/). Foundation Passport users also received phishing emails this week that the company traced to compromised Cloudflare API keys, [Protos reported](https://protos.com/keystone-to-destroy-almost-19000-wallets-after-device-key-leak/).

Keystone has said a detailed report on the breach is coming. Shipping remains paused while the device verification key is replaced, and the almost 19,000 unshipped units are destroyed.
