---
title: XRP Ledger patched decade-old bug that could have minted trillions
ogTitle: "XRP LEDGER PATCHED DECADE-OLD BUG THAT COULD HAVE MINTED TRILLIONS"
description: Developers disclosed a payment-engine overflow that could have created 18 trillion XRP in one transaction, found by Veria AI and patched in xrpld 3.4.1 after bypassing the normal validator vote.
image: /images/news/xrpl-overflow.jpg
imageCaption: "Computer code on a monitor. Photo: Markus Spiske via Wikimedia Commons (CC0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Code_on_computer_monitor_(Unsplash).jpg
category: News
data-ai-hint: computer code on screen
publishedDate: '2026-10-11'
lastUpdated: '2026-10-11'
---

XRP Ledger developers disclosed on Oct. 9 a payment-engine flaw that could have let an attacker create about 18 trillion XRP in a single transaction, roughly 180 times the token fixed supply of 100 billion, according to the [vulnerability report](https://xrpl.org/blog/2026/vulnerabilitydisclosurereport-bug-20261009).

The bug dated to 2015 and was found by researcher Cayden Liao and Veria AI, then reported through the bug bounty program on Sept. 22, [CoinDesk reported](https://www.coindesk.com/tech/2026/10/10/xrp-ledger-patched-decade-old-bug-that-could-create-billions-of-dollars-in-xrp-from-nothing). Engineers at RippleX reproduced the attack on a standalone server and confirmed the created XRP could be spent in a later transaction.

RippleX said it found no evidence the flaw was exploited on any public network, the [disclosure states](https://xrpl.org/blog/2026/vulnerabilitydisclosurereport-bug-20261009). Liao [said](https://verialabs.com/blog/biggest-hack-in-crypto-history/) the flaw put XRP $94 billion market value at risk by threatening the supply cap that holders and institutions rely on.

All 100 billion XRP were created when the ledger launched in 2012, and the software is built so no more can ever be added. The flaw would have broken that rule, [CoinDesk noted](https://www.coindesk.com/tech/2026/10/10/xrp-ledger-patched-decade-old-bug-that-could-create-billions-of-dollars-in-xrp-from-nothing).

## Two flaws chained into one mint

Veria AI system analyzed rippled, the software that runs the ledger, and identified two weaknesses that were harmless alone but dangerous together, [CryptoSlate reported](https://cryptoslate.com/ai-discovers-xrp-ledger-flaw-that-could-mint-18-trillion-tokens-and-put-94-billion-market-at-risk/).

The first was an integer overflow in the payment engine. Specially built trading offers could make the system miscalculate what a buyer owed, so sellers received full XRP payments while the buyer paid a fraction, and the difference was XRP that never existed, [according to the report](https://cryptoslate.com/ai-discovers-xrp-ledger-flaw-that-could-mint-18-trillion-tokens-and-put-94-billion-market-at-risk/).

The second sat in the supply safeguard itself. The check meant to catch exactly this kind of creation used the same flawed arithmetic, so it failed to notice the new XRP, [CryptoSlate wrote](https://cryptoslate.com/ai-discovers-xrp-ledger-flaw-that-could-mint-18-trillion-tokens-and-put-94-billion-market-at-risk/).

The [disclosure](https://xrpl.org/blog/2026/vulnerabilitydisclosurereport-bug-20261009) explains the mechanics. When a payment crosses the built-in exchange, the engine sums amounts from many offers with plain 64-bit addition and no overflow check. A few hundred offers, each asking a very large amount of XRP, can push the total past what the number type holds, and the sum wraps to a tiny value. Each offer owner is still paid the full amount while the buyer is charged the wrapped total.

The post-transaction safety check summed balance changes the same way, so it wrapped identically and saw only what looked like a normal fee burn, the [report states](https://xrpl.org/blog/2026/vulnerabilitydisclosurereport-bug-20261009). A separate per-account limit did not trigger because the minted XRP was spread across hundreds of accounts, each kept under the cap.

An attacker would first open a few hundred accounts and post offers selling a tiny amount of some token for a very large amount of XRP, then send one payment that bought through all of them at once, [CoinDesk described](https://www.coindesk.com/tech/2026/10/10/xrp-ledger-patched-decade-old-bug-that-could-create-billions-of-dollars-in-xrp-from-nothing). The setup needed only a few hundred XRP in largely refundable reserves plus ordinary fees.

No normal payment could trigger the bug by accident. It required hundreds of deliberately mispriced offers, and the [disclosure](https://xrpl.org/blog/2026/vulnerabilitydisclosurereport-bug-20261009) says testing showed ordinary payments returned the same results with or without those offers present.

The underlying payment-engine code dated to 2015, while the affected safeguard was added in 2017. The codebase had passed more than a dozen audits and contests since 2024, including one with a $550,000 prize pool, and bounty programs had paid over $1 million, yet the combined flaw stayed hidden until the AI system built a working exploit on a local network, [CryptoSlate reported](https://cryptoslate.com/ai-discovers-xrp-ledger-flaw-that-could-mint-18-trillion-tokens-and-put-94-billion-market-at-risk/).

Veria received the program maximum bounty of $250,000. Liao described it as the largest known reward for a flaw found entirely by an AI agent, [his post says](https://verialabs.com/blog/biggest-hack-in-crypto-history/).

## Emergency fix skipped the validator vote

The severity forced an unusual call. Changes to transaction processing normally need support from more than 80 percent of trusted validators for two straight weeks before activation. Developers decided that wait would leave the flaw exposed while the network voted on its repair, and publishing the fix would show attackers where the bug sat, the [disclosure explains](https://xrpl.org/blog/2026/vulnerabilitydisclosurereport-bug-20261009).

RippleX, the XRP Ledger Foundation and validators instead coordinated an emergency upgrade that took effect on each server as soon as it installed version 3.4.1. The patch shipped first as binaries, with source temporarily withheld to limit reverse engineering during deployment. The [report](https://xrpl.org/blog/2026/vulnerabilitydisclosurereport-bug-20261009) calls it the first deliberate bypass of the amendment process for a transaction-processing change in more than ten years.

The shortcut carried risk. Servers on different versions could disagree on whether an exploit transaction was valid, which could disrupt consensus or halt the network. Developers judged a short halt preferable to letting counterfeit XRP enter circulation, since normal transactions never reach the faulty code path and only an exploit attempt could cause a split.

Validators moved fast. More than 80 percent of the default trusted list ran 3.4.1 on release day, Sept. 25, even before the source was public. Foundation contributor Vet said the coordinated response preserved network integrity and made 3.4.1 the new minimum after separate Batch amendments activated Oct. 9, [CryptoSlate noted](https://cryptoslate.com/ai-discovers-xrp-ledger-flaw-that-could-mint-18-trillion-tokens-and-put-94-billion-market-at-risk/).

The same disclosure covers a second flaw in the Batch feature wrapper validation, reported during re-verification of Sherlock Attackathon findings. That fix went through the normal amendment route as fixBatchV1_2 and activated Oct. 9, since the Batch amendment had not yet gone live and no mainnet funds were at stake, the [report says](https://xrpl.org/blog/2026/vulnerabilitydisclosurereport-bug-20261009).

RippleX head of engineering J. Ayo Akinyele said the incident showed the need to revisit assumptions about legacy code. He outlined plans to expand AI-assisted discovery, strengthen adversarial testing of the payment engine, consensus and networking layers, and accelerate formal verification work already under way on the lending protocol with CommonPrefix and the Foundation. The Oct. 9 disclosure added one procedural change: security findings marked as resolved must now be retested against release candidates before closure.
