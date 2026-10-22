---
title: Eclair ships second Lightning security patch in five days
ogTitle: "ECLAIR SHIPS SECOND LIGHTNING SECURITY PATCH IN FIVE DAYS"
description: ACINQ released Eclair 0.14.5 on Oct. 20, urging node operators to upgrade after fixing peer-exploitable flaws days after blocking a browser-based attack route.
image: /images/news/eclairpatches.jpg
imageCaption: "A physical bitcoin statistic coin. Photo: AntanaCoins via Wikimedia Commons (CC BY-SA 3.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Physical_bitcoin_statistic_coin.JPG
category: News
data-ai-hint: physical bitcoin coin
publishedDate: '2026-10-22'
lastUpdated: '2026-10-22'
---

Bitcoin Lightning developer ACINQ urged node operators to upgrade Eclair after patching security flaws that malicious peers could exploit, releasing version 0.14.5 on Oct. 20, its second security-focused update in five days, [CryptoSlate reported](https://cryptoslate.com/bitcoin-lightning-developers-sound-alarm-over-security-flaws-as-second-patch-lands-in-five-days/).

Eclair powers Bitcoin Lightning nodes that maintain payment channels and route transactions across the network. The developers credited security researchers Nuhiat-Arefin and mptfire with responsibly disclosing problems addressed in the [0.14.5 release](https://github.com/ACINQ/eclair/releases/tag/v0.14.5), published Oct. 20 at 16:12 UTC. ACINQ called it a patch release containing security hardening fixes and said it "highly recommend[s] upgrading, as some of these issues can be exploited by malicious nodes." CryptoBriefing characterized the peer-behavior flaws as bugs that could have allowed peers to steal funds or disrupt payments.

ACINQ has not detailed the newly patched exploit mechanisms or specified which older versions are affected. The announcement reported no confirmed attacks or financial losses, leaving the potential financial consequences unclear.

## How the upgrade works

The developers sought to minimize disruption from the upgrade. According to the release instructions, operators can install the update without closing existing payment channels. They must stop Eclair, install the new version, and restart the software. This avoids the blockchain transactions and channel reconfiguration that closing and reopening Lightning channels can require.

ACINQ added safeguards to the installation process, including signed release files and SHA-256 checksums that let operators verify downloaded software before deploying it. Those checks matter most for infrastructure handling Bitcoin-funded payment channels, where installing compromised software could introduce risks beyond the vulnerabilities being repaired.

## The prior patch and browser attack route

The latest warning follows an Oct. 15 security release that introduced additional protections against malicious nodes and addressed a vulnerability involving Eclair's administrative interface. That earlier update, version 0.14.4, blocked API requests carrying an Origin header, preventing direct browser access to the software's application programming interface.

The developers explained that browsers could automatically attach cached login credentials to cross-site requests. The API relied on HTTP Basic authentication, so those credentials could sit cached in a browser, [CryptoBriefing reported](https://cryptobriefing.com/eclair-patches-lightning-network-theft-bugs/) from the release details. As a result, a malicious website a node operator visits could send authenticated commands to the node through a simple web form, potentially triggering channel management actions and unauthorized payments without the operator's direct oversight. The change eliminated that attack route by rejecting browser-originated requests while preserving ordinary command-line access. The 0.14.4 release also bundled earlier fixes for funding-fee and signer-related issues, with merge dates running up to Sept. 15.

The change also introduced an operational requirement for businesses and developers using browser-based Lightning management tools. Those interfaces now need an intermediary backend to communicate with Eclair's API.

Operators who installed the Oct. 15 release must upgrade again to obtain the protections introduced five days later. The remaining question is how widely older deployments are exposed. ACINQ has not published a detailed vulnerability breakdown or list of affected versions, leaving operators without a documented basis to determine whether their existing software can safely remain in production.

## What Eclair runs in the Lightning stack

Eclair is one of several Lightning node implementations used by businesses and sophisticated operators. Unlike some client-focused wallets, Eclair is designed for servers that open channels, route payments, and expose an API for management tasks. That API surface is what the Oct. 15 patch restricted when it rejected requests carrying an Origin header, cutting off a path that browser-based tools had used to talk to the node directly.

Lightning payment channels hold bitcoin on the Bitcoin blockchain while allowing off-chain payments between channel partners. A vulnerability that lets a malicious peer manipulate channel state or drain funds would put real sats at risk, which is why ACINQ framed the 0.14.5 flaws as potentially exploitable by hostile nodes rather than only by internet outsiders.

The project's release process includes signed tags and published checksums so operators can verify that the binary they install matches what ACINQ shipped. For infrastructure handling customer funds or routing significant volume, that verification step is part of a standard security review before any upgrade window opens.

Other Lightning implementations, including Core Lightning and LDK-based stacks, were not named in the advisory. Operators running those clients were not affected by the Eclair-specific release, though the broader pattern of peer-facing bugs has kept Lightning security on the agenda for multi-implementation operators throughout 2026.
