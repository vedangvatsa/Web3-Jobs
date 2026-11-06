---
title: "LDK Patch Blocks Probe Linking Private Channels to Their Funding Output"
ogTitle: "LDK PATCH BLOCKS PROBE LINKING PRIVATE CHANNELS TO THEIR FUNDING OUTPUT"
description: A merged LDK pull request stops onion-message forwarding from resolving real short-channel IDs for unannounced channels, closing a probe that could tie hidden channels to onchain outputs.
image: /images/news/ldkprobe.jpg
imageCaption: "A lightning strike at night. Photo: Rollingskyphoto via Wikimedia Commons (CC BY 4.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:High%20Quality%20Lightning%20Strike.jpg
category: News
data-ai-hint: lightning night sky
publishedDate: '2026-11-06'
lastUpdated: '2026-11-06'
---

The Lightning Development Kit, the software library teams use to build Bitcoin Lightning applications, has merged a change that blocks an onion-message probe capable of linking an unannounced channel to the Bitcoin output that funds it. Bitcoin Optech [described the fix](https://bitcoinops.org/en/newsletters/2026/10/30) in its Oct. 30 newsletter, and CryptoSlate [covered it](https://cryptoslate.com/bitcoin-lightning-fix-blocks-a-probe-linking-private-channels-to-onchain-funding/) on Nov. 3.

An unannounced channel stays off the public network map, but staying off that map alone did not stop the probe. A real short-channel ID works like blockchain coordinates: under BOLT 7 it encodes the funding transaction's block height, the transaction's position in that block, and the output's position in that transaction. An attacker can derive a candidate ID from an output's location on the chain without yet knowing whether that output backs a channel between two nodes they suspect.

The probe supplies the missing confirmation. The attacker opens connections to both suspected endpoints and builds an onion-message path through them that returns to the attacker. Before the fix, LDK's channel lookup could resolve a real short-channel ID for an unannounced channel once its funding confirmed, so a successful return told the attacker that the guessed output and the channel between those nodes matched. The demonstrated leak joins a Bitcoin funding output to the Lightning nodes using it.

Two conditions have to hold at the same time for the probe to work: live connections to both suspected channel endpoints, and a guessed real short-channel ID that matches the funding output. The attacker routes the message through both nodes so the path comes back around. CryptoSlate's breakdown of the pull request shows the lookup resolving the real ID after the funding transaction confirms, at which point the returned message ties one specific Bitcoin output to one specific pair of Lightning nodes. Publicly announced channels were never the target; the value of the probe lies in confirming links that gossip deliberately keeps off the network map.

The fix, tracked as pull request 5314, was merged on Oct. 25. LDK now refuses to resolve real short-channel IDs for unannounced channels when forwarding onion messages, while SCID aliases remain usable, so senders can still address a channel through an allowed alias. Optech noted that the change complements the HTLC-forwarding privacy protections it covered in an earlier newsletter.

After the change, the node that would resolve a real ID for an unannounced channel rejects the lookup unless the value equals its own outbound alias. Senders therefore cannot pull an unannounced channel's blockchain coordinates through onion-message forwarding, while channels addressed by alias keep working. CryptoSlate's before-and-after diagram shows the path stopping at that node instead of completing the round trip to the attacker. The peer running the probe is an outsider connected to both suspected endpoints, not one of the channel's own nodes.

The pull request makes the lookup stricter than the HTLC payment-relay path, which can permit real IDs for some private channels under configuration, CryptoSlate reported. Under BOLT 4's onion-routing rules, an onion-message short-channel ID must correspond to an announced identifier or a local alias.

Scope is limited. The reviewed pull request and technical summary show a funding-output link under the documented probe conditions. They provide no evidence of stolen bitcoin, compromised private keys, unrelated wallet holdings being revealed, or exposure of every Lightning channel. The rejection also exempts a value equal to the channel's outbound alias.

The fix does not change which channels appear in public network gossip, and the merge establishes a source-code fix only. CryptoSlate noted that the official changelog does not establish which release or deployed wallet version contains it, so a user cannot tell from the version number alone whether installed software carries the protection.
