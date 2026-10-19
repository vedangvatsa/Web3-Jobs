---
title: Zcash builder Zakura proposes per-swap keys to close a quantum privacy gap
ogTitle: "ZCASH BUILDER ZAKURA PROPOSES PER-SWAP KEYS TO CLOSE A QUANTUM PRIVACY GAP"
description: Zakura published a design giving each shielded Zcash address posted during a NEAR Intents swap its own viewing key, limiting what a future quantum computer could link.
image: /images/news/zcashquantum.jpg
imageCaption: "A quantum computer laboratory at Chalmers University of Technology in 2017. Photo: Anita Fors via Wikimedia Commons (CC BY-SA 4.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Quantum-computer-Chalmers%202017.jpg
category: News
data-ai-hint: quantum computer laboratory
publishedDate: '2026-10-19'
lastUpdated: '2026-10-19'
---

Zakura, a team that builds Zcash full node and wallet software, published a design to give every shielded address posted during a swap through NEAR Intents its own viewing key, limiting what a future quantum computer could learn from any single address.

The proposal, written by Zakura developer Adam Tucker and [posted on the project's engineering page](https://zakura.com/engineering/quantum-unlinkability/), is listed as in review and has not shipped. It would need no network upgrade, Zakura said in a [post on X](https://x.com/ZakuraZcash/status/2111697529003978865).

Zcash shielded transactions hide the sender, recipient and amount. Each shielded account has a single incoming viewing key behind all of its addresses, which a wallet uses to find and decrypt payments. A classical computer cannot recover that key from an address, but a sufficiently powerful quantum computer running Shor's algorithm could, [Decrypt reported](https://decrypt.co/381257/zcash-developer-zakura-proposes-fix-to-stop-quantum-computers-linking-shielded-swaps). It would then be able to read the value and memo of every payment the account received and tie them together.

The exposure concentrates in swaps through NEAR Intents, a cross-chain service. When a user swaps ZEC through it, the wallet supplies a shielded address that NEAR publishes on its public chain as a refund destination, whether or not a refund is ever made, [CoinDesk reported](https://www.coindesk.com/tech/2026/10/19/zcash-developers-plan-a-fix-to-keep-zec-swaps-private-from-future-quantum-computers). The addresses look unrelated, but one key sits behind all of them. "Until Tachyon ships, there is a glaring hole: a single published shielded address lets a quantum attacker link every payment that address's key has ever received," Tucker wrote, referring to the planned Zcash scalability upgrade.

Zakura's fix derives a separate incoming viewing key for each address that has to be published while leaving the account's spending key untouched. An attacker who breaks one posted address would learn only about payments to that address. The change affects only the randomness that goes into the viewing key, with each swap's key derived from a hashed index, [Unchained reported](https://unchainedcrypto.com/zcash-builder-zakura-proposes-per-swap-viewing-keys-to-close-a-quantum-privacy-gap/).

Opening a new account per swap was ruled out because Keystone hardware wallets sign only from the first account and Ledger devices spend from one account per transaction, which Tucker called an unacceptable user experience, Unchained reported.

The design also addresses a practical cost. A wallet with many swaps would hold many keys, and restoring from a seed phrase would normally require a full chain scan for each one. Under the proposal, the wallet stores an encrypted memo recording each swap's index, checks published filters, then uses private information retrieval to look up matching NEAR bridge payouts without the server learning which addresses were queried. For swaps into ZEC, the wallet checks addresses in order and stops after 30 unused ones in a row.

Wallets built on Zakura's open-source libraries, including Vizor, could add the feature for software wallets "in the coming weeks," the post said, with hardware wallets following once their firmware supports it. No quantum computer has been demonstrated that can recover these keys.

The work follows Zakura's plan earlier this month for quantum-safe transparent addresses, which also uses private information retrieval and said post-quantum signature opcodes were expected in Zcash in January, Decrypt reported. Zcash Open Development Lab chief executive Josh Swihart said in May that Zcash was aiming for full post-quantum status within 12 to 18 months. Swihart said around $600 million to $700 million had flowed through Zcash's NEAR Intents route by May.

The proposal arrives as concern grows over the cryptography protecting wallets. Google said last week that its Willow quantum chip had produced near-perfect versions of one of the components an attack would use, a step toward a machine powerful enough to run the calculation. Quantum computers capable of that are still likely years away, and there is no firm timeline for building one. Ethereum Foundation researcher Justin Drake and Ethereum co-founder Vitalik Buterin have warned that AI could break encryption before quantum computers do, Decrypt reported.

ZEC traded at about $1,165 on Monday morning, up 3.6% on the day, according to Decrypt.
