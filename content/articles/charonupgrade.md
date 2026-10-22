---
title: Obol ships urgent Charon patch after eMudhra certificate compromise
ogTitle: "OBOL SHIPS URGENT CHARON PATCH AFTER E-MUDHRA COMPROMISE"
description: Obol released Charon v1.11.2 on Oct. 21, urging mainnet operators to upgrade after the eMudhra certificate authority incident affected Go certificate checks used by the distributed-validator client.
image: /images/news/charonupgrade.jpg
imageCaption: "Close-up of a physical Ethereum coin resting on fiat coins. Photo: Ivan Radic via Wikimedia Commons (CC BY 2.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Close-up_of_a_physical_Ethereum_coin_(51002904687).jpg
category: News
data-ai-hint: physical Ethereum coin
publishedDate: '2026-10-22'
lastUpdated: '2026-10-22'
---

Obol Network shipped Charon v1.11.2 on Oct. 21, an urgent patch for its distributed-validator middleware after intermediate certificates issued by certificate authority eMudhra were found to use weak private keys, [Crypto Briefing reported](https://cryptobriefing.com/obol-charon-upgrade-ca-key-compromise/).

The project urged mainnet operators running the Go-based Charon client to upgrade immediately, and the [release notes](https://github.com/ObolNetwork/charon/releases/tag/v1.11.2) carry a caution calling v1.11.2 a required release for all operators. Obol's mainnet cluster balances totaled 422,862 ETH in its latest daily snapshot, and that capital runs through the client being patched.

## What the release changes

Charon v1.11.2 centers on certificate validation. It bumps the Go programming language underneath Charon to 1.27.3, which updates how the client checks certificates and corrects known vulnerabilities connected to the eMudhra CA compromise, including those tracked as CVE-2026-111943. The release also distrusts the emSign and AAA roots inside the Docker image that operators use to deploy Charon, meaning the software now refuses to accept certificate issuers it previously would have trusted.

The broader eMudhra incident was designated CVE-2026-111943 and reported around Oct. 17. Mozilla, Google, Apple, and Microsoft have blocked the affected CA roots in browsers and operating systems. Obol's patch puts Charon in line with that industry response.

## Why Charon is exposed

Charon is middleware for distributed validators. Rather than one operator running a validator alone, Charon lets several operators share the job in a fault-tolerant setup through distributed key generation, which splits a validator's key into shares spread across operators so the full private key never sits in one location.

That design reduces single points of failure, but the communication between those keyholders still depends on trust infrastructure, which is where certificate validation comes into play. Browsers protect people reading websites; Charon protects machines coordinating Ethereum validators.

For node operators, the action item is to upgrade to v1.11.2. Any cluster still running an older version keeps trusting certificate roots that major browser and operating-system vendors have moved to block. For stakers whose ETH sits in Obol-powered clusters, the 422,862 ETH figure frames the exposure. That balance does not mean funds are at risk today, and nothing in the disclosure says any funds were affected.

Obol has undergone several audits over its lifetime, including work by Trail of Bits and Quantstamp, focused on distributed key generation and key management. The CA compromise was reported around Oct. 17 and Obol shipped its fix on Oct. 21, a four-day turnaround for infrastructure that had to navigate Go toolchain updates and Docker image changes.

## How the eMudhra incident reached Ethereum staking

The eMudhra flaw allowed anyone who recovered the weak private keys to mint certificates for any domain, defeating the trust chain that HTTPS and many inter-service authentication systems depend on. Browser vendors blocked the affected intermediate certificates within days. Infrastructure projects that embed Go's certificate verification, or that ship Docker images with their own trust stores, had to ship their own patches because they do not receive browser revocation lists automatically.

Charon operators run the client as middleware between a validator client and the consensus-layer node, often across machines controlled by different parties in a distributed validator cluster. Those machines exchange messages over TLS connections that validate certificates. If a compromised intermediate is still trusted by an older Charon build, an attacker in a position to intercept traffic could in theory present a forged certificate accepted by that build.

Obol's patch does not claim that any cluster was attacked. The disclosure frames the upgrade as closing a trust-store gap that the wider industry has already closed in browsers and major operating systems. Operators who delay leave their Charon instances trusting roots that Mozilla, Google, Apple, and Microsoft have already blocked.

The 422,862 ETH figure comes from Obol's daily mainnet snapshot and represents aggregate balances across clusters running Charon, not a single pool or a custody account controlled by Obol the company. Obol develops the open-source middleware; the stake itself is controlled by the distributed validator teams and their operators.

## Operator steps

Operators running the Go-based Charon client are directed to the [v1.11.2 release notes](https://github.com/ObolNetwork/charon/releases/tag/v1.11.2) and Docker image tags published with the patch. The release is the project's latest tagged version on GitHub. Clusters still on earlier builds keep the previous certificate-trust behavior until the image is updated and redeployed.

Nothing in the Obol disclosure reported confirmed exploitation of Charon clusters via the eMudhra certificates. The advisory is preventive, matching the posture browser and cloud vendors took when they blocked the same roots without evidence of active misuse in their own fleets.
