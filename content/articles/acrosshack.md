---
title: Across restores website after domain hijack as Bitquery traces $402,000 in losses
ogTitle: "ACROSS RESTORES WEBSITE AFTER DOMAIN HIJACK AS BITQUERY TRACES $402,000 IN LOSSES"
description: Across Protocol said on Nov. 11 it regained across.to after a social engineering attack on Namecheap, and a Bitquery trace put losses at $401,900 across nine wallets on five chains.
image: /images/news/acrosshack.jpg
imageCaption: "Network cables in a server rack. Photo: Kim Scarborough via Wikimedia Commons (CC BY-SA 2.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Server_Rack_with_Spaghetti-Like_Mass_of_Network_Cables.jpg
category: News
data-ai-hint: server rack network cables
publishedDate: '2026-11-13'
lastUpdated: '2026-11-13'
---

Across Protocol said on Nov. 11 it had taken back control of its across.to website after attackers redirected the domain to a phishing page, and an investigation published by blockchain analytics firm Bitquery put the haul at $401,900 from nine wallets. The cross-chain bridge blamed a social engineering attack on its domain registrar, Namecheap.

Across announced the restoration on X at 01:16 UTC on Wednesday, saying the bridge was "fully restored, and all systems are operational" about six and a half hours after the attack began, [Unchained reported](https://unchainedcrypto.com/across-back-online-after-namecheap-social-engineering-handed-domain-to-attacker/). "All affected users will be made whole. We'll share a full post-mortem in the coming days," the team said in the same post, which also thanked Namecheap founder Richard Kirkendall for responding on X, helping secure the account and opening an investigation.

The trouble started on Nov. 10 at roughly 18:45 UTC, when Across said a social engineering attack on Namecheap handed an attacker control of the domain and the team pointed visitors at a fake copy of the app. Across said it learned of the attack within 15 minutes and moved to take the site offline. SEAL911, a crypto security emergency hotline, flagged the address to major wallets as a phishing site, and Cloudflare helped label the domain risky before stripping its DNS records, the entries that tell browsers which server a name points to.

Earlier, Across had said Namecheap had not responded to its requests for help and that its domain "was fully locked down with best-in-class security practices," adding that "this unauthorized takeover should not have been possible." The team promised a post-mortem covering how the takeover happened.

Visitors who reached across.to before Cloudflare shut the page off completely "may have been affected," Across said, while third-party integrations and developers using its API were not. The team asked anyone hit to message it with transaction details and to revoke any permissions granted to the attacker. The protocol warned users on Tuesday to avoid its app amid reports of drained wallets, and it has not disclosed its own loss total or a count of affected users.

[GoPlus Security](https://unchainedcrypto.com/across-back-online-after-namecheap-social-engineering-handed-domain-to-attacker/) estimated user losses at $350,000 spread over Ethereum, Arbitrum, Base, BNB Chain, Ink and Plasma, a figure Across has not confirmed. GoPlus said the fake page asked users to sign token approvals the attacker could then use to move funds, including EIP-2612 permits, which grant spending rights through an offchain signature, and Permit2 authorizations, which let a single signature approve transfers from a wallet.

The independent trace arrived next. [Bitquery's investigation](https://bitquery.io/investigations/across-protocol-domain-hijack) says $401,900 was taken from nine wallets on Ethereum, Arbitrum, Base, BNB Chain and Optimism between 19:02 and 21:53 UTC on Nov. 10, valued at the time each drain happened. One Aave depositor lost about $305,000 of that total, roughly 76% of the traced losses, and each token drain paid 80% to the thief and 20% to the seller of the drainer kit.

[CryptoSlate](https://cryptoslate.com/across-protocol-website-attack-reached-an-aave-deposit-new-402000-loss-trace-shows/) reported Bitquery's Nov. 12 update in detail. The largest victim's asset was aWETH, an interest-bearing token representing an Aave deposit. Transaction records show an unlimited approval at 20:09:23 UTC on Nov. 10 followed by transfers of about 115.23 aWETH to an attacker wallet and 28.81 aWETH to a fee wallet, with four pulls running until 20:12:23 UTC before the owner revoked the approval a minute later.

Bitquery said a widely shared $294,000 loss figure actually matched the fee wallet's holdings, most of which predated the hijack, and that a separate 26.38 ether sweep from another victim, worth about $54,000 at the time, had initially been missed. Within an hour of gathering the ether in one wallet, the thief had moved it off Ethereum into a Monero token, an online casino and Bitcoin. Bitquery said it ties the drains to across.to through transaction timing and recipient wallets, while noting that blockchain records cannot show which site a victim visited.
