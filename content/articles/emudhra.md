---
title: Tech giants block eMudhra certificates as CertiK warns crypto apps may stay exposed
ogTitle: "EMUDHRA CERT BLOCKS DEPLOYED; CERTIK FLAGS CRYPTO RISK"
description: Google, Apple, Microsoft, Mozilla and Cloudflare blocked eight flawed eMudhra intermediate certificates, while CertiK warned crypto bots and exchange apps may remain exposed outside browser ecosystems.
image: /images/news/emudhra.jpg
imageCaption: "EU cyber security conference 2017. Photo: Rain Ottis via Wikimedia Commons."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:EU_cyber_security_conference_2017_-_Rain_Ottis.jpg
category: News
data-ai-hint: cyber security conference
publishedDate: '2026-10-22'
lastUpdated: '2026-10-22'
---

Major technology companies deployed emergency blocks this week against eight vulnerable intermediate certificates issued by India-based certificate authority eMudhra Limited after discovering that their private keys were insufficiently secure, with [CertiK warning](https://cointelegraph.com/news/certik-warning-crypto-emudhra-flaw-risks) that crypto trading bots and exchange applications may remain exposed.

By Tuesday, browser developers and other major technology companies had protections against the eight certificates in place, [Cointelegraph reported](https://cointelegraph.com/news/tech-giants-rush-to-block-flawed-emudhra-certs-that-could-enable-fake-sites). Mozilla cryptography engineer Dennis Jackson wrote in an incident report that Mozilla independently recovered the private keys when it first received notice of the flaw on Saturday, confirming that the key-generation process was "flawed" and "trivial to exploit."

An attacker who intercepts a user's connection could use fraudulent certificates to impersonate a legitimate website and potentially read or alter the information exchanged, according to Mozilla.

## What browsers and Cloudflare did

Firefox blocked the affected certificates in Firefox using OneCRL on Saturday and released browser updates for Desktop and Android. Chrome had blocked the certificates since Saturday, Apple devices since Monday, and Microsoft platforms since Tuesday, Jackson said.

[Cloudflare said](https://blog.cloudflare.com/emudhra-certificate-compromise/) it became aware of the report on Monday and released updates for Cloudflare One and WARP Clients and Cloudflare Tunnel on Tuesday, alongside mitigations across its services. The company said its security review had not identified active exploitation of the issue on Cloudflare services.

Jackson said there is no evidence that Firefox, Chrome, Edge, and Safari have been attacked this way, as there were no entries in the certificate transparency logs for the intermediate certificates since April 2025. "However, many clients outside of the browser ecosystem do not enforce Certificate Transparency. We do not know if attackers exploited the flawed key generation to target these clients," he said.

## CertiK's crypto-specific warning

CertiK's senior director of digital assets security, Peiyu Wang, told Cointelegraph that major browser blocks substantially reduce the risk for clients that receive and enforce them, but some applications outside the browser ecosystem do not enforce Certificate Transparency or receive the same revocation protections.

Wang said attackers could exploit compromised certificates to impersonate the HTTPS connections used by exchanges, wallet interfaces, and APIs. Attackers could specifically impersonate crypto services and replace deposit addresses or trick users into approving malicious transactions. Such attacks would also require intercepting or redirecting users' internet traffic, while the compromised certificate authority keys alone would not expose wallet private keys.

Wang urged crypto operators to update their software and certificate trust stores and verify that their applications reject the affected certificates. The incident recalls the 2011 DigiNotar breach, when hackers compromised the Dutch certificate authority and issued 531 fraudulent SSL certificates. Those rogue certificates allowed threat actors to pose as Google and spy on approximately 300,000 Iranian Gmail accounts.

## Who uses eMudhra certificates

eMudhra is an India-based certificate authority that issues intermediate certificates trusted by major browsers and operating systems. Intermediate certificates sit between a root certificate authority and the end-entity certificates that websites present. When an intermediate's private key is weak, anyone who recovers that key can mint certificates for any domain, defeating the trust chain that HTTPS depends on.

Cloudflare said eight eMudhra intermediate certificates were affected. The company prioritized updating services that use public certificates to authenticate remote endpoints, including proxies connecting to origins and applications calling external APIs. In parallel, Cloudflare updated shared trust stores, base images, and other shared foundations, then paired those updates with reloads, restarts, and image deployments to activate them.

Cloudflare's remediation covered Cloudflare One and WARP clients, Cloudflare Tunnel, CDN and server-side Zero Trust products, and guidance for customers who run their own origin TLS servers or mutual TLS configurations. The company said some customers would still need to take action on software or trust configurations they operate, especially on origin servers.

Mozilla's Jackson said the certificates were responsibly disclosed to downstream trust stores on Oct. 19. He maintained a public list of commonly used packages and their patch status, and a test site that checks whether a given client rejects the affected certificates. Cloudflare advised developers not to resolve resulting certificate errors by disabling verification, which would remove the authentication protection the updates are meant to restore.
