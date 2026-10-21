---
title: Mastercard opens early access for AI agent payments after pilots
ogTitle: "MASTERCARD OPENS EARLY ACCESS FOR AI AGENT PAYMENTS AFTER PILOTS"
description: Mastercard opened early access to Agent Pay for Machines, which lets AI agents buy digital services within human-set budgets after pilots with Coinbase, Base and Cloudflare.
image: /images/news/agentpay.jpg
imageCaption: "Mastercard headquarters at 2000 Purchase Street, Purchase, New York. Photo: USGS (public domain)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:2000PurchaseSt-USGS.jpg
category: News
data-ai-hint: payment card terminal desk
publishedDate: '2026-10-21'
lastUpdated: '2026-10-21'
---

Mastercard opened early access on Oct. 20 to Agent Pay for Machines, a payments service that lets autonomous software agents buy data, models and computing power inside spending limits set by a business. The company demonstrated the system at Cloudflare's Connect conference, where chief product officer Jorn Lambert showed an agent running a marketing campaign across nine payments to two merchants on a single approved budget.

The flow rests on x402, an open protocol for requesting payment online. When an agent hits a paid service that returns "402 Payment Required," it generates a digitally signed voucher promising payment within its approved limit. Providers verify the voucher and deliver the service; redemptions can be batched later. Mastercard said those exchanges run off-chain at machine speed rather than waiting for on-chain confirmation on every hop.

In the demo, a marketing agency called Hype gave an agent a protein-bar campaign brief and a fixed budget. The agent discovered registered providers, purchased social media research from AIsa and campaign images through Cloudflare AI Gateway, and completed nine payments to two merchants with no separate accounts or invoices. Coinbase Developer Platform supplied the wallet infrastructure, Base provided on-chain settlement, and BVNK, the stablecoin firm Mastercard acquired in August, handled payment and settlement in fiat or stablecoins through Mastercard's Global Money Platform.

Pilots ran with Cloudflare, Ant International, AIsa, Base, BVNK, Coinbase and Hype before the early-access launch. Early access now includes buyer- and seller-side APIs, a toolkit, a sandbox and developer documentation, Mastercard said. [Decrypt](https://decrypt.co/381373/mastercard-opens-up-ai-agent-payments-with-early-access-and-live-demo) reported the same pilot partners and the nine-payment demo structure, framing the release as the shift from a June product announcement to a working transaction path for agent-to-agent commerce. [CoinMarketCap](https://coinmarketcap.com/academy/article/mastercard-agent-pay-machines-early-access) also summarized the pilot roster and control model for agent spend limits.

Mastercard has not published commercial terms, minimum volumes or a general availability date beyond the early-access program. The service joins a growing set of agent payment rails that include Coinbase's x402 work and various stablecoin settlement stacks. How fraud liability, chargeback rights and merchant protections apply when an agent, rather than a person, initiates a purchase remains an open question Mastercard has not fully addressed in its materials.

Mastercard's early access does not yet cover consumer checkout flows. The product is aimed at machine-to-machine purchases of digital services, where the buyer is an agent operating under a corporate budget rather than a person with a card. That framing lets Mastercard apply existing commercial card and account controls to agent spend without immediately reopening consumer fraud liability questions under Reg E and Reg Z. How those rules apply when an agent initiates a purchase remains unresolved for any bank that will sponsor the product.

Competing agent payment stacks have taken different routes. Coinbase's x402 work focuses on HTTP-native payment requests that agents can call directly over the web. Stablecoin settlement firms emphasize on-chain finality and open ledgers. Mastercard's pitch is that issuers, acquirers and fraud tools already in place can govern agent spend the same way they govern corporate card programs, with Mastercard acting as the liability and settlement layer rather than as a blockchain. BVNK's acquisition in August gave Mastercard a stablecoin settlement capability that can clear outside banking hours.

The sandbox and documentation in early access cover buyer-side and seller-side integrations. Mastercard has not said which issuers will be first to enable agent credentials, how dispute resolution works when an agent buys the wrong service, or whether agents will carry their own identity attestations. Cloudflare's role as both pilot partner and infrastructure provider for the Connect demo means the first production traffic is likely to stay inside the pilot circle until broader issuer support arrives.

The nine-payment demo is intentionally small enough to walk through on stage but large enough to show batching. Two merchants, multiple service types and a single budget envelope demonstrate the control surface Mastercard is selling. Production deployments will face harder cases: refunds, partial fulfillment, currency conversion when the merchant invoices in a non-dollar stablecoin, and what happens when an agent exhausts its budget mid-campaign.

Mastercard's Global Money Platform, the settlement layer BVNK plugs into, has been used for cross-border money movement between traditional accounts. Extending it to agent-initiated machine payments is a new use case for the same rails. The company has not said whether agent payments will use a separate BIN, a virtual card product, or a pure account-to-account transfer instruction under the existing commercial program.
