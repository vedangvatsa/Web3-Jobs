---
title: New iPhone spyware scans crypto wallets, iVerify finds
ogTitle: "NEW IPHONE SPYWARE SCANS CRYPTO WALLETS, IVERIFY FINDS"
description: iVerify disclosed a DarkSword variant called P7 that scans infected iPhones for wallet apps, pulls imToken data and Keychain passwords, and checks for orders every 15 seconds.
image: /images/news/iphone-spyware.jpg
imageCaption: "A hand holding an iPhone. Photo: Jeremy Levin via Wikimedia Commons (CC0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Bridge-gadget-hand-iPhone-macro-1845364_1280.jpg
category: News
data-ai-hint: hand holding iphone
publishedDate: '2026-10-14'
lastUpdated: '2026-10-14'
---

Security firm iVerify has disclosed a new iPhone spyware variant that searches infected phones for cryptocurrency wallets and pulls their data. The company [described](https://www.iverify.com/blog/darksword-variant-threat-research) P7 DarkSword on Oct. 8 after investigating an infection found on a customer's device in August. The name comes from the attacker's use of a p7_ prefix on variables in modified code.

The variant's signature is a check-in every 15 seconds. Once on a phone, the implant sends a tasking-poll request to attacker infrastructure at that interval and runs whatever commands come back, with operators able to change the interval or shut the agent down remotely. Two of its dedicated commands target crypto users: wallet_scan looks for installed wallet apps, and wallet_extract pulls data from imToken, a wallet that supports multiple networks, [according to](https://cryptoslate.com/new-iphone-spyware-can-hunt-for-crypto-wallets-and-extract-their-data-every-15-seconds/) CryptoSlate's account of the report.

The theft goes wider than wallets. The implant sits inside SpringBoard, the iOS process that manages app launches and the home screen, and from there it can send back the app inventory, Apple Notes databases, photos, and iCloud Keychain contents. Older DarkSword builds copied the whole Keychain database for processing on attacker servers; P7 converts the passwords and credentials into JSON on the phone before sending them out, which could hand operators more immediately usable material.

Its other handlers read like a remote toolkit: list directories, download files, enumerate app containers, run arbitrary JavaScript inside the implant, scan the whole filesystem from root and upload the report, and pull selected files from app sandboxes. A sleep command resets the polling interval and an exit command stops the implant, the report shows.

The authors also worked to stay hidden. P7 drops debug logging over HTTP requests and syslog, cuts the number of process injections, and uses browser localStorage to avoid re-exploiting a phone it already holds, which keeps the device stable. Unlike many AI-assisted variants the researchers see, these changes showed real competence with the code, iVerify [said](https://www.iverify.com/blog/darksword-variant-threat-research).

There are firm limits on what is known. iVerify disclosed no evidence of a completed crypto theft, no count of affected wallet users and no financial losses. Finding wallet files on a phone does not by itself hand over private keys, and whether the thieves can move funds depends on what the stolen material actually unlocks. The variant is an evolution of the payload that runs after a compromise, not proof of a fresh hole in Apple's system, CryptoSlate [noted](https://cryptoslate.com/new-iphone-spyware-can-hunt-for-crypto-wallets-and-extract-their-data-every-15-seconds/).

Apple already patched the underlying exploitation chain. Google's Threat Intelligence Group reported in March that DarkSword combined six vulnerabilities to hit iPhones on iOS 18.4 through 18.7, with campaigns involving commercial surveillance vendors and suspected state-backed attackers across Saudi Arabia, Turkey, Malaysia and Ukraine. Apple shipped iOS 18.7.7 on March 24, 2026 and extended it to more devices on April 1. Updating remains the main defense, with Lockdown Mode as the fallback where updates are impossible.

The kit itself keeps spreading. The Hacker News [reported](https://thehackernews.com/2026/10/p7-darksword-ios-exploit-kit-adds.html) the exploit chain is assessed to be a commercial product that leaked into a second-hand market, reaching financially motivated operators late last year. Researchers traced one distribution route through ecomtrack.io, a dead startup's domain re-registered on Sept. 15 that still sat in tracking tags on online stores, serving visitors a bogus crypto trading site that drops the iOS chain. A companion kit called Coruna runs in the browser afterward and harvests recovery phrases, balances and keystore data, with one exposed control panel holding 11 victim phrases and 179 device loot folders, [according to](https://thehackernews.com/2026/10/p7-darksword-ios-exploit-kit-adds.html) the outlet's account of Censys findings. A second China-based operator was spotted running the same kit against its own server with BitKeep added as a wallet target.
