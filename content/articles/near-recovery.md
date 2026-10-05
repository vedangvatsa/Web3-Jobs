---
title: NEAR Intents recovers full $3.8M and closes exploit investigation
ogTitle: "NEAR INTENTS RECOVERS FULL $3.8M AND CLOSES EXPLOIT INVESTIGATION"
description: NEAR Intents said on Oct. 2, 2026 that the party behind the Oct. 1 exploit returned about $3.8 million in full, ending the investigation with users to be made whole.
image: /images/news/near-recovery.jpg
imageCaption: "Person coding on a laptop. Photo: TechEquity via Wikimedia Commons (CC BY-SA 4.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Playing-video-game-on-laptop-coding.jpg
category: News
data-ai-hint: person coding on laptop
publishedDate: '2026-10-05'
lastUpdated: '2026-10-05'
---

NEAR Intents confirmed on Oct. 2 that the full $3.8 million drained a day earlier had been sent back, and closed its investigation. General manager Alex Shevchenko [wrote on X](https://decrypt.co/380014/near-intents-recovers-3-8-million-after-48-hour-ultimatum), in a post quoted by Decrypt on Oct. 4, "The funds from the $3.8M NEAR Intents hack were sent back in full. We are stopping the investigation."

The return followed a public 48-hour window. A day earlier Shevchenko had posted Bitcoin, BNB/Ethereum and Solana addresses for the return and addressed the recipient directly with "We have identified you, sir." He framed the interval as a last chance at responsible disclosure, the practice of reporting a flaw to developers instead of using it, and warned the window would close.

Unchained [reported on Oct. 5](https://unchainedcrypto.com/near-intents-says-exploited-3-8-million-is-back-closes-its-hack-investigation/) that the money came back less than a day after that post, roughly 14 hours later. Co-founder Illia Polosukhin put completion at 14:30 UTC on Oct. 2, writing that the team identified the responsible party in under 24 hours, established contact and received everything back.

The bitcoin leg is visible on chain. The posted Bitcoin address took in about 34.6 BTC across several transfers between 14:31 and 15:05 UTC on Oct. 2, according to blockchain data cited in that account. An on-chain researcher estimated the bitcoin covered about 78% of the $3.8 million and asked whether the rest arrived another way. "You are right. It did indeed," Shevchenko replied, without saying how.

About an hour after the bitcoin arrived, a transaction to the BNB/Ethereum return address carried a note in its data field reading "We've returned all the funds, we were in the wrong." Decrypt [quoted the same message](https://decrypt.co/380014/near-intents-recovers-3-8-million-after-48-hour-ultimatum) and noted its contrite tone, including thanks to the NEAR team and a line urging others to use bug bounties.

Polosukhin credited SHIELD, the AI security layer on Intents, alongside determined detective work. Asked who performed the tracing, Shevchenko answered "Internal team." Neither executive detailed the method used to identify the party, and the team has not published its promised detailed report on the flaw.

The Oct. 1 incident itself, covered here on Oct. 2, came from a bug in how the Omni deposit and withdrawal layer interacted with the main Intents contract. CoinDesk [wrote on Oct. 1](https://www.coindesk.com/tech/2026/10/01/near-intents-hit-by-usd3-8-million-exploit-as-crypto-s-rough-year-of-hacks-continues), in a piece updated Oct. 2, that the contract-side flaw had been patched and affected users would be reimbursed in full. With the funds back, the reimbursement pledge is now a backstop rather than the route to recovery.

Polosukhin added that day that the flaw was confined to USDT on BNB Chain and was patched in under an hour. The NEAR blockchain and its token were unaffected, he said, drawing a line between the cross-chain infrastructure and the underlying network. The protocol, in his telling, handles more than $4 billion a month in trading and payments and had avoided a major exploit until now.

Service stopped while the team responded. Deposits and withdrawals went dark on BNB Smart Chain, Polygon, TON, Optimism, Avalanche, Stellar, Monad, X Layer, ADI, Scroll and Plasma, with core trading expected back quickly and fund movements held until each fix cleared. The status page tracked the per-network outages through the response.

Blockchain investigator ZachXBT traced the opening move to irregular withdrawals from a BNB Chain hot wallet tied to NEAR Intents. The funds moved to KuCoin and were bridged into bitcoin, in his account, which CoinDesk [carried in its Oct. 1 reporting](https://www.coindesk.com/tech/2026/10/01/near-intents-hit-by-usd3-8-million-exploit-as-crypto-s-rough-year-of-hacks-continues). That trail matches the bitcoin-heavy shape of the return a day later.

The week had already been turbulent. Two days before the exploit, NEAR Intents blocked a $50 million swap attempt tied to the roughly $387.5 million Bitget breach, which Bitget and Elliptic linked to North Korea. Days earlier a spot NEAR exchange-traded fund from Bitwise began trading. Decrypt [set the recovery against that backdrop](https://decrypt.co/380014/near-intents-recovers-3-8-million-after-48-hour-ultimatum) without tying the events together.

Shevchenko asked hackers to use bug bounties instead of disrupting services, and Polosukhin echoed him. The protocol told users a detailed public report would follow in the coming days, and said the incident had been reported to law enforcement alongside work with security and analytics partners to trace the funds.
