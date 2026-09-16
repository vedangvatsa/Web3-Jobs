---
title: MEV Bot Yoink Seized $7.7M in rsETH After Ethereum Wallet Exploit
ogTitle: "MEV BOT YOINK SEIZED $7.7M IN RSETH AFTER WALLET EXPLOIT"
description: >-
  An attacker drained about 2,900 rsETH from an Ethereum Safe wallet on Sept. 15,
  but an MEV bot front-ran the theft and took the tokens, while Kelp put the
  receiving address under a 24-hour pause.
image: /images/news/kelp-intercept.jpg
imageCaption: "A hand holding a physical Bitcoin token. Photo: Satheesh Sankaran via Wikimedia Commons (CC BY 2.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Holding%20Bitcoin%20cryptocurrency%20coin.jpg
category: News
data-ai-hint: hand holding bitcoin coin
publishedDate: '2026-09-15'
lastUpdated: "2026-09-15"
---

An attacker drained about 2,900 rsETH, worth roughly $7.8 million, from an Ethereum wallet in the early hours of Sept. 15. The tokens never reached the attacker. An automated trading bot called Yoink spotted the theft while it sat in the public transaction queue, paid about $47,000 to jump ahead of it, and took the funds for itself, [CoinDesk reported](https://www.coindesk.com/business/2026/09/15/how-a-simple-coding-mistake-let-a-hacker-drain-usd7-8-million-from-a-crypto-wallet).

Blockchain security firm Blockaid first flagged the incident. The affected wallet was a Safe belonging to an unidentified user, and about $7.73 million in rsETH had been taken at the time of its initial report, [Cointelegraph reported](https://cointelegraph.com/news/mev-bot-intercepts-77m-in-rseth-from-ethereum-wallet-exploit). RsETH is the liquid restaking token issued by Kelp, and the attack put a large holder balance in play within minutes.

The attacker worked through a custom module connected to the victim Safe. In a [post on X](https://x.com/blockaid_/status/2099732957803999342), Blockaid said the attacker used a public keeper multicall to direct a custom Uniswap v4 liquidity module into an attacker-created hooked pool, where a form of wrapped rsETH was unwound into plain rsETH. That sequence let the attacker pull the tokens out of the wallet and route them toward the rigged pool.

The flaw sat in a helper contract the wallet owner had approved, not in the Safe software itself. SlowMist and BlockSec traced the failure to an authorization check that approved anyone who named the helper contract itself as its target, [according to CoinDesk](https://www.coindesk.com/business/2026/09/15/how-a-simple-coding-mistake-let-a-hacker-drain-usd7-8-million-from-a-crypto-wallet). The wallet had been set up to let the helper move money on its behalf, a common arrangement for users who automate trading. The helper was supposed to confirm the caller had permission. Instead the check waved through a caller that pointed at the helper itself.

With that approval in hand, the attacker tipped around 2,900 rsETH into a trading pool that had been built only minutes earlier around a worthless token called Permissionless Attacker Token. The wallet received a receipt token worth nothing in return, CoinDesk reported. The pool existed only to absorb the stolen rsETH, and its timing shows the attacker had prepared the destination before striking.

Yoink moved first in the ordering race. MEV bots watch the queue of pending blockchain transactions for profit openings, and this one paid roughly $47,000 in fees to have its own copy of the theft processed ahead of the original, [CoinDesk reported](https://www.coindesk.com/business/2026/09/15/how-a-simple-coding-mistake-let-a-hacker-drain-usd7-8-million-from-a-crypto-wallet). The bot ended up sending 2,882 rsETH to a separate address it controlled. Transaction data cited by Cointelegraph shows Yoink also transferred about 18.93 ETH, worth roughly $46,000, to an address labeled as a block builder in the same transaction, the kind of payment bots make to secure priority ordering.

Kelp reacted within hours by freezing movement at the destination. "We've detected potential suspicious activity on an address that received rsETH a few hours ago," the protocol [wrote on X](https://x.com/KelpDAO/status/2099740756865159562). "Out of an abundance of caution, we've placed that address under a temporary 24-hour pause. During this window, rsETH cannot move in or out of it." The pause operates at the wallet level, and Kelp said its own contracts were unaffected.

"This is a precautionary, wallet-level measure only," Kelp said in the same statement. "Kelp contracts are safe, rsETH remains fully backed." Minting, withdrawals and connected integrations kept running normally while the protocol said it was working with security experts to investigate, [Cointelegraph reported](https://cointelegraph.com/news/mev-bot-intercepts-77m-in-rseth-from-ethereum-wallet-exploit). The apparent attack path ran through the custom module attached to the victim Safe, which Kelp said left its own contracts untouched.

Other security firms backed that reading of the fault. "The root cause was a flawed authorization check in the Multicall contract," AstraSec [said in a post on X](https://x.com/AstraSecAI/status/2099775550802059527). BlockSec analysts at Phalcon and the SlowMist team reached the same conclusion in [their own posts](https://x.com/Phalcon_xyz/status/2099741447776096270), [according to CoinDesk](https://www.coindesk.com/business/2026/09/15/how-a-simple-coding-mistake-let-a-hacker-drain-usd7-8-million-from-a-crypto-wallet). Their agreement points to a component the wallet owner had chosen to trust rather than to the widely used Safe contracts underneath. SlowMist laid out the faulty check in a [separate post](https://x.com/SlowMist_Team/status/2099779127662493875).

The episode fits a pattern in which the thief is not the only party watching an exploit. Front-running bots routinely copy profitable pending transactions and outbid the originator, which means stolen funds can change hands before the attacker ever holds them. Here the interception left the rsETH sitting in an address Yoink controls, with Kelp's pause stopping further movement for a day.

What happens next is undecided. Kelp moved about two hours after the drain, at 06:03 UTC on Sept. 15, which put the 24-hour pause on course to lift around 06:03 UTC on Sept. 16. No published source has confirmed an extension, a recovery, or an unpausing since, and nothing published says whether the bot operator intends to return anything. "Whoever runs it has said nothing publicly," [a Sept. 16 reconstruction notes](https://crypto-jazz.com/defi/2026/09/16/mev-bot-yoink-7-8-million-rseth-safe-drain/), leaving the funds in limbo at an address Yoink controls. The victim remains identified only by wallet address.

There is a template for a peaceful ending. In January, an MEV builder returned about 920 of 1,023 ETH from the Makina exploit and kept a 10 percent bounty under a whitehat safe-harbor framework, [Unchained noted](https://unchainedcrypto.com/a-bot-robbed-the-hacker-who-drained-7-8-million-in-rseth-from-a-safe-wallet/). Nothing indicates Yoink has offered similar terms. Kelp has not disclosed whether it is in contact with the bot operator or what it expects when the pause lifts. Cointelegraph said it had contacted Blockaid and Kelp for additional comment but had received no response by publication.
