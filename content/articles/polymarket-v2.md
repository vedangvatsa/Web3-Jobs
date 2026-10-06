---
title: Polymarket Rebuilds Core Contracts With Protocol V2
ogTitle: "POLYMARKET REBUILDS CORE CONTRACTS WITH PROTOCOL V2"
description: Polymarket introduced Protocol V2 on Oct. 5, a rebuilt contract system with a single ERC-1155 positions contract, with new markets tentatively moving over Nov. 2.
image: /images/news/polymarket-v2.jpg
category: News
data-ai-hint: financial trading charts and hands
publishedDate: '2026-10-06'
lastUpdated: '2026-10-06'
imageCaption: "A trader studies market charts on screens. Polymarket plans to move new prediction markets onto rebuilt contracts. Photo: forextime.com via Wikimedia Commons (CC BY 2.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:CFD_trading_concept_image.jpg
---

Polymarket introduced a ground-up rebuild of the smart contracts behind its prediction markets on Oct. 5, with new markets tentatively set to move to the system on Nov. 2. Head of Protocol Rajath Alex announced Protocol V2 in a post on X, describing it as a rebuild from the position token up, [Unchained reported](https://unchainedcrypto.com/polymarket-rebuilds-its-core-smart-contracts-with-protocol-v2-targets-nov-2-switchover/).

A small set of canary markets started trading on V2 in production that day and will keep running through Oct. 30. Alex wrote that Polymarket has tentatively scheduled new markets to move to the system on Nov. 2. Existing positions under the old framework will not be converted, so open trades stay where they are until they resolve.

The rebuild addresses debt from fast growth. Polymarket was built on the Conditional Tokens Framework, general-purpose code Gnosis released in 2019. Alex said the platform was never designed on that base for what it later became. Each market type added afterward needed its own contract stacked in front of the framework, with separate adapters, exchanges and resolution pieces.

"It worked, and it carried Polymarket this far," he wrote. "But every new feature meant another layer, another approval for you, another contract for integrators, and another thing that cannot be changed once it is deployed." The quote, [carried in the Unchained report](https://unchainedcrypto.com/polymarket-rebuilds-its-core-smart-contracts-with-protocol-v2-targets-nov-2-switchover/), sums up why the team chose a fresh base rather than another adapter.

V2 consolidates that stack into a single ERC-1155 contract for positions, pUSD as the only collateral, one exchange for each market type and one router. ERC-1155 is a token standard that lets one contract manage many token types at once. Position identifiers now carry the market type, market and outcome inside them, so the protocol can identify a holding without extra lookups.

Four market modules ship at launch. They cover binary markets, atomic neg-risk markets, incremental neg-risk markets and combinatorial markets. The modules can support added operations for positions and could allow different ways of holding capital inside markets, [The Crypto Times reported](https://www.cryptotimes.io/2026/10/06/polymarket-introduces-protocol-v2-with-new-market-infrastructure).

Resolution moves to a new OracleAggregator. The component uses modules to connect to sources such as UMA and Chainlink, giving different market types a common layer for settlement while leaving room for added sources later. Chainlink handling of price-based outcomes and UMA handling of event-based outcomes are among the paths the design supports.

Cross-chain support is built in but not switched on. The contracts are designed to move positions, collateral and resolutions to other chains, which Polymarket plans to activate when it expands beyond one network. The system can be upgraded through a governance process. Alex listed scalar resolution and directional collateral return as follow-on features in development.

Security review came from six firms. Cantina, Certora, Quantstamp, Sigma Prime, Zellic and Pashov Audit Group audited the code, and Certora also formally verified it. A bug bounty pays up to 5 million dollars for critical findings. The audit set and bounty size were [detailed by Unchained](https://unchainedcrypto.com/polymarket-rebuilds-its-core-smart-contracts-with-protocol-v2-targets-nov-2-switchover/) and separately listed in the Crypto Times account.

For people who use the app or website, the migration guide says no technical migration is required beyond accepting approval prompts. Developers and market makers carry the heavier load. They get the four-week canary period, with weekly office hours, to integrate. Polymarket pointed builders to its developer channel on Discord for canary market details.

A new Data API V2 arrives with the protocol change. The service is written in Rust and runs on Polymarket's in-house on-chain indexer. It standardizes response formats, wraps responses in a data field and replaces offset paging with cursor-based paging for trade and activity feeds. Several position endpoints merge into one route with status filters for open, redeemable, mergeable and closed positions, [The Crypto Times wrote](https://www.cryptotimes.io/2026/10/06/polymarket-introduces-protocol-v2-with-new-market-infrastructure).

Older API users face a separate deadline. Data API V1 retires on Oct. 24, 2026. New integrations are directed to V2, while existing integrations can migrate route by route. The documentation notes that one accounting snapshot endpoint has no V2 equivalent yet and stays on its existing route.

The rebuild follows an April overhaul when Polymarket swapped the bridged USDC.e it had used on Polygon for pUSD, its own collateral token redeemable one-to-one for Circle's USDC. In September it launched Polymarket Perps for eligible international users with up to 20 times position size across an initial set of 10 markets. Protocol V2 remains separate from the Perps product and covers the base used for prediction markets.
