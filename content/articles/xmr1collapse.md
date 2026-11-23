---
title: Wrapped Monero token XMR1 collapses 99.8% after $13.5 million sell-off
ogTitle: "WRAPPED MONERO TOKEN XMR1 COLLAPSES 99.8% AFTER $13.5 MILLION SELL-OFF"
description: XMR1, Wagyu's wrapped Monero token on Hyperliquid, fell from about $500 to near zero on Nov. 20 as a deployer-linked wallet sold $13.5 million of the asset; the operator blamed a breach at its web host.
image: /images/news/xmr1collapse.jpg
imageCaption: "A server room. Photo: The National Archives (UK) via Wikimedia Commons (CC BY 3.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:A_view_of_the_server_room_at_The_National_Archives.jpg
category: News
data-ai-hint: server room racks
publishedDate: '2026-11-23'
lastUpdated: '2026-11-23'
---

XMR1, a wrapped Monero token issued by the cross-chain service Wagyu and traded on Hyperliquid, lost more than 99% of its value on Nov. 20 after a wallet linked to the token's deployer sold about $13.5 million of the asset. [Cointelegraph reported](https://cointelegraph.com/news/wrapped-monero-token-crashes-998-amid-suspected-135m-exploit) that the token fell from roughly $500 to $1 in about 30 minutes, a 99.8% decline, citing blockchain analytics firm Bitquery.

Bitquery's onchain analysis shows the deployer account sent 5.2 million XMR1 tokens to a newly created wallet before the sales. [Decrypt reported](https://decrypt.co/383732/wrapped-monero-token-collapses-99-after-13-million-hack-blamed-on-web-host) that the new account sold about 364,000 tokens to 388 buyers for $13.5 million, then converted the proceeds to ether, with roughly 7,350 ETH sitting across three wallets at Bitquery's last check. Cointelegraph's account of the same tracing says $13.28 million in USDC moved to Arbitrum, where $13.22 million was exchanged for 7,467 ETH through CoW Protocol before most of it was bridged to Ethereum.

Native Monero was not affected; XMR1 is the token that represents Monero on Hyperliquid, which users receive when they deposit the privacy coin through Wagyu and can later redeem. Monero runs on its own blockchain and cannot trade natively on Hyperliquid, so wrapped tokens like XMR1 carry it onto other networks and can be traded outside their native chains. The collapse hit the wrapped token only.

Cointelegraph said it contacted the operator for additional details about the suspected breach and reimbursement plans but had not received a response by publication.

PerpetualCow, the pseudonymous founder of Wagyu, blamed the incident on a breach at 1984.hosting, an Icelandic web hosting provider. According to PerpetualCow, the XMR1 deployer private key had been stored on an old server there that he had deleted, but the host apparently kept its logs and files. "Lesson to learn here is that these hosting providers keep your data/logs even after you delete your server with them," he wrote on X. He pledged to personally refund everyone who lost money and said Wagyu would relaunch later, without giving a timeline.

The hosting provider confirmed a serious incident. 1984 ehf. said it had suffered an extensive and serious cyberattack on its IT infrastructure, according to a joint statement with CERT-IS, Iceland's national cybersecurity response team, which Decrypt described in its report, citing the Icelandic outlet DV. Early findings pointed to a well-organized and technically sophisticated attack, the statement said, and the company could not rule out that more systems were affected than confirmed. It shut down all services temporarily. The statement did not mention Wagyu or say whether customer data was taken.

Bitquery said its onchain investigation could not establish how the deployer account's private key was obtained or who controlled it during the transfers, leaving the circumstances of the suspected compromise unconfirmed. The firm also said it cannot see how much Monero currently backs the remaining XMR1, because the Monero side of the bridge is not visible onchain. The sources reviewed do not specify how refunds will be calculated or when Wagyu will relaunch.

The tracing also connected earlier November incidents to the token. Bitquery found that proceeds from four hacks earlier in November, involving Across Protocol, Kava, Lighter and Safe, had been used to buy about $6.6 million of XMR1, apparently as a route to native Monero. The firm said it found no onchain evidence linking those incidents to Friday's suspected exploit.

Decrypt added that the attacker's account received its first funds from the crypto mixer Tornado Cash minutes before it was created, and that the same deployer account still controls nearly all of ZEC1, a Zcash token. Wagyu had disclosed a separate data leak in October, saying at the time that funds were unaffected, and the service surfaced earlier in November in ZachXBT's tracing of a suspected $106 million theft from an unnamed European entity, part of which was converted to Monero through the service.
