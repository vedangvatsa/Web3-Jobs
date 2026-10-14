---
title: LDK patches reconnect flaw that let peers steal forwarded bitcoin
ogTitle: "LDK PATCHES RECONNECT FLAW THAT LET PEERS STEAL FORWARDED BITCOIN"
description: LDK's Oct. 1 security releases v0.2.7 and v0.1.13 fix a channel-reconnect lie that could cost forwarding nodes a payment, plus an LSPS2 amount check and a stale-state loss.
image: /images/news/ldk-fix.jpg
imageCaption: "Lightning over the ESO headquarters. Photo: ESO/P. Horalek via Wikimedia Commons (CC BY 4.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Lightning_over_ESO_Headquarters.jpg
category: News
data-ai-hint: lightning storm night sky
publishedDate: '2026-10-14'
lastUpdated: '2026-10-14'
---

The Lightning Development Kit has patched a flaw that let a malicious channel peer steal the value of a forwarded payment by lying after reconnecting. The Oct. 1 security releases v0.2.7 and v0.1.13 close the hole on the 0.2 and 0.1 branches, with details published in the Bitcoin Optech [newsletter](https://bitcoinops.org/en/newsletters/2026/10/09/) on Oct. 9. Application developers must build the patched library into the software they ship before their users are protected.

The attack starts with a peer acknowledging a channel update, then reconnecting and claiming in a channel_reestablish message that it never got it. Before the fix, LDK could accept the false claim and sign a fresh commitment transaction without recording it in its ChannelMonitor, the component that tracks onchain claims. The peer could publish that transaction, let the forwarded payment settle downstream, then reclaim the incoming contract at expiry even though the forwarder knew the secret needed to claim it. The forwarder paid out and never got the incoming funds back.

The fix, tracked as PR 5057, permits retransmission only while the peer's acknowledgment is still outstanding. When a peer claims it missed an update it already acknowledged, LDK now force-closes the channel instead of signing, CryptoSlate [reported](https://cryptoslate.com/unpatched-ldk-apps-can-lose-bitcoin-when-a-lightning-peer-lies-after-reconnecting/).

Version 0.2.7 carries two more money fixes. PR 5042 closes an LSPS2 just-in-time payment gap where a liquidity service opens a channel while handling a payment. The service trusted the forwarding amount stated in the payer's onion packet without checking the incoming payment, so a malicious payer could request a larger outgoing transfer while sending less, leaving the service to cover the gap from its own funds. The patched handlers verify the requested amount against the actual incoming payment and fail the transfer back before opening a channel or forwarding anything when the numbers do not match.

PR 5046 stops a loss on restart. A node that reboots from an older ChannelManager state than its ChannelMonitor could treat an outgoing payment as never sent downstream and fail the incoming one back upstream, while the downstream peer still claims the funds onchain. LDK now checks which blocked monitor updates already applied before force-closing, so payments committed downstream stay with the monitor instead of being failed back wrongly, [according to](https://bitcoinops.org/en/newsletters/2026/10/09/) the Optech account.

Both releases also fix a denial-of-service path in Electrum-based synchronization. Version 0.1.13 repairs a channel manager deserialization failure on invalid payments that 0.2.6 had already fixed on the newer branch.

The fixes only matter once they ship inside apps. LDK is a library compiled directly into wallets and payment software, so each application's developers must pull in the patched code and release it. Teams running LSPS2 flows face an extra step: payment contracts queued under older versions keep their unvalidated amounts, and those pending contracts need separate review alongside the upgrade.

Developers also get a privacy default for new hidden channels. LDK now makes alias-only forwarding standard when opening unannounced channels with peers that support it, so invoices and forwarding probes no longer expose the channel's real funding output, [according to](https://bitcoinops.org/en/newsletters/2026/10/09/) the newsletter. The old negotiation setting is gone; setup falls back to an unprotected channel when the peer does not support or accept the new behavior, while existing channels keep whatever they negotiated.

The same week brought fixes elsewhere. Core Lightning ported 77 commits of security and reliability work to its main branch, including a block on deriving a reserved secret through a remote call that could otherwise forge unrestricted authorization tokens. Eclair's signer-mode repair independently verifies fee amounts fetched by transaction ID and rejects invalid change positions, closing the gap where a compromised backend could overpay miners from the node's funds.

The same Optech newsletter lists companion fixes across the ecosystem. Core Lightning 26.06.9 is a security release covering channel reestablishment, splicing, payment handling and access controls, with the project strongly recommending an upgrade. The defects differ from the splice-fee diversion and saved-state loading bugs in LDK v0.2.6 from Sept. 13. A third release candidate for LDK v0.3 adds fee bumping for pending splices and negotiates anchor channels by default.
