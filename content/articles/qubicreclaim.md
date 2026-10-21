---
title: Qubic restarts mainnet and opens claims after $14 million drain
ogTitle: "QUBIC RESTARTS MAINNET AND OPENS CLAIMS AFTER $14 MILLION DRAIN"
description: Qubic restarted its mainnet on Oct. 19 and opened recovery claims after a roughly $14 million attack that froze the chain for two days.
image: /images/news/qubicreclaim.jpg
imageCaption: "PDC server room. Photo: Esquilo via Wikimedia Commons (CC BY-SA 3.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:PDC_server_room.jpg
category: News
data-ai-hint: server room racks datacenter
publishedDate: '2026-10-21'
lastUpdated: '2026-10-21'
---

Qubic restarted its mainnet on Oct. 19 at 8:00 p.m. UTC, resuming at tick 85371952, roughly two days after an attacker drained about 2.94 trillion QU, worth roughly $1.3 million to $1.4 million, from 1,404 accounts. Recovery claims are open until May 1, 2027, under a plan approved by the network's Computor validators.

[Cointelegraph](https://cointelegraph.com/news/qubic-restarts-blockchain-opens-recovery-claims-after-14m-hack) reported that the halt began Sunday at tick 85371949 to stop further transfers after the seed-generation flaw was confirmed. Affected users can check their address and file through Qubic's reclaim platform. The project said wallets created before web wallet version 4.26.4, released Oct. 19, should be treated as insecure and replaced with a fresh wallet. Users were told to update, create a new wallet, move funds as soon as possible and never reuse the old seed.

SlowMist traced the theft to weak randomness in the web wallet's seed construction. In a [Crypto Briefing summary](https://cryptobriefing.com/slowmist-qubic-wallet-key-recovery-flaw/) of the firm's postmortem, each 55-letter account seed was built from JavaScript's Math.random() without mixing in password or device entropy. A related "dejaVu" value forwarded over plaintext network headers let an observer rebuild the generator state from six consecutive observations in about 15 milliseconds and predict seeds, then verify them against public keys sent in balance requests.

Seeds created on iPhones and iPads in any browser, on Macs using Safari before Oct. 18, or in the Qubic iOS app before July 2025 were affected. About 87.1% of the stolen QU remains frozen onchain; the remaining 12.9% reached MEXC, which froze the receiving account roughly an hour after the deposit. Validators retained authority to pause again if claims processing exposes further issues. The drain window ran from 23:42 UTC on Oct. 17 to 01:26 UTC on Oct. 18, according to Crowdfund Insider figures cited by Crypto Briefing.

Qubic's earlier security incident, covered in prior reporting on this site, involved a different drain pattern and predates the seed-generation flaw. This restart is the first full mainnet resume since the October attack, and the claims deadline of May 1, 2027 gives affected holders a multi-month window to file after updating to the fixed wallet.

The seed-generation flaw was specific to certain device and browser combinations rather than to Qubic's consensus layer. Math.random() in V8 has a bounded state space that becomes predictable once an attacker observes enough outputs. Because the wallet reused the same random stream for a network header value, six observations were enough to reconstruct state and predict seeds. Version 4.26.4 switched to cryptographically secure randomness.

The 87.1% of stolen QU that remains frozen onchain is recoverable only if validators or exchanges continue to hold the freeze through the claims process. The 12.9% that reached MEXC was largely locked after the receiving account was frozen about an hour after deposit, but that portion depends on MEXC cooperation and any legal process against the account. Restitution decisions sit with the Computor quorum rather than with a traditional claims administrator.

Qubic's pause and restart follows a pattern seen in other layer-1 chains after key-management failures: halt, fix derivation, open claims, resume. The multi-month claims window until May 1, 2027 is longer than some comparable recovery programs, which gives users time to update wallets and re-derive addresses. The project has not published a final dollar figure for total recoverable losses beyond the $1.3 million to $1.4 million range reported during the incident.

Crowdfund Insider, cited by Crypto Briefing, put the drain window between 23:42 UTC on Oct. 17 and 01:26 UTC on Oct. 18. The halt at tick 85371949 and the restart at 85371952 imply a gap of three ticks during which the network processed no new activity. That short tick gap in wall-clock terms still covered the full weekend halt because ticks are produced continuously.

The reclaim platform requires users to prove control of the affected address and to confirm they have updated to wallet 4.26.4 or later. The project has said the old wallet must never be reused, even if funds were never stolen, because the seed itself remains predictable to anyone who observed the relevant header values. That guidance is broader than the set of addresses that actually lost funds.
