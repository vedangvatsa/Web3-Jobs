---
title: Ethereum Economic Zone Tests First Atomic L1 to L2 Transaction
ogTitle: "ETHEREUM ECONOMIC ZONE TESTS FIRST ATOMIC L1 TO L2 TRANSACTION"
description: The Ethereum Economic Zone demonstrated a first atomic cross-layer transaction on mainnet on Oct. 5-6, linking layer 1 and layer 2 in one all-or-nothing operation.
image: /images/news/eez-atomic.jpg
category: News
data-ai-hint: code on a computer monitor
publishedDate: '2026-10-06'
lastUpdated: '2026-10-06'
imageCaption: "Code displayed on a computer monitor. Developers tested a cross-layer call that links Ethereum with a layer-2 network. Photo: Markus Spiske markusspiske via Wikimedia Commons (CC0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Code_on_computer_monitor_%28Unsplash%29.jpg
---

The Ethereum Economic Zone completed its first atomic transaction spanning Ethereum mainnet and a layer-2 network, with contributors announcing the result on Oct. 5-6. Core contributor Eduardo Antuna Diez shared the transaction and described it as the first atomic cross-chain call from layer 1 to layer 2, [Cointelegraph reported](https://cointelegraph.com/news/ethereum-eez-atomic-l1-l2-transaction-mainnet).

The transaction logs record a cross-chain call carrying 0.001 ether along with a state update for a rollup. In an atomic transaction, linked actions across networks either all succeed together or all reverse if any part fails. That property removes the middle state where funds leave one network but never arrive on the other.

The project frames the result as proof that synchronous composability can run on live blocks rather than only on paper. Composability is the ability of smart contracts to call one another like fitted parts. Synchronous means those calls happen inside one transaction instead of across a delay with bridge waits in between. Antuna Diez presented the test as the starting point for broader work on cross-layer interaction and unified liquidity.

Under the design, operations are packaged together and submitted through a function called postAndVerifyBatch on a layer-1 smart contract, [Crypto Briefing reported](https://cryptobriefing.com/ethereum-economic-zone-first-atomic-transaction/). Everything is processed inside a single Ethereum block under layer-1 builder sequencing. In plain terms, Ethereum block production sets the final order, so the layer-1 and layer-2 pieces land in the same slot.

Shared sequencing sits behind that mechanism. Layer-2 operators propose transaction order, while Ethereum keeps final authority over execution. Rollups that join accept that ordering tradeoff in exchange for calls that can reach across networks without separate bridge messages. Not every layer-2 team may want to give up that control, and the [same report](https://cryptobriefing.com/ethereum-economic-zone-first-atomic-transaction/) flagged it as a design choice to watch.

The framework was publicly introduced on March 29, 2026 at the EthCC conference in Cannes. Gnosis and Zisk launched it with co-funding from the Ethereum Foundation, with the stated goal of building rollups that strengthen Ethereum rather than split activity across isolated networks.

September served as the run-up to the mainnet attempt. The team worked through audit preparations, put live blob encoding in place and tested the system against real applications including CoW Swap and Uniswap v4. An experimental mainnet deployment followed that testing period and produced the first atomic transaction.

The bridge-free claim addresses a long-running complaint about layer-2 growth. In March, developers behind the project said the framework was designed to let rollups interact with each other and with mainnet inside a single transaction, [according to Cointelegraph](https://cointelegraph.com/news/ethereum-eez-atomic-l1-l2-transaction-mainnet). Gnosis co-founder Friederike Ernst has previously told the outlet that the absence of synchronous composability forces protocols to maintain separate deployments across networks, which splits liquidity into multiple markets.

Reaction from builders was quick. Jakub Gregus, co-founder of the Hydration decentralized finance protocol, called the demonstration one of the most important milestones in crypto and said the technology could directly benefit Ethereum, [the report added](https://cointelegraph.com/news/ethereum-eez-atomic-l1-l2-transaction-mainnet).

The project aims to reconnect liquidity and applications spread across separate layer-2 networks, [Cointelegraph noted](https://cointelegraph.com/news/ethereum-eez-atomic-l1-l2-transaction-mainnet). That goal speaks to a setup where money and programs sit in different places and cannot be combined in one step today.

For developers, the near-term effect is design freedom if the system matures. Applications could run logic across layer 1 and participating layer-2 networks without building around bridge delays or asynchronous messaging. Research behind the project points to smaller liquidity silos, and the CoW Swap and Uniswap v4 tests hint at where early use may appear.

Limits remain clear. The deployment is described as experimental, and one successful transaction is a proof of concept rather than a production system carrying real volume. Audits were still in preparation as recently as September. The next signals to track are which layer-2 networks agree to take part, how the audits conclude and whether applications move from testing into live cross-layer use, [Crypto Briefing noted](https://cryptobriefing.com/ethereum-economic-zone-first-atomic-transaction/).
