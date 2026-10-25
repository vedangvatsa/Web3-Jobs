---
title: Pump.fun makes its own Pump Bridge the default crosschain route
ogTitle: "PUMP.FUN MAKES ITS OWN PUMP BRIDGE THE DEFAULT ROUTE"
description: Pump.fun replaced Relay with its in-house Pump Bridge for crosschain trades, publishing test data that shows buy errors falling from 11.2% to 0.9% and typical buys dropping from 3.88 seconds to 1.95 seconds.
image: /images/news/pumpbridge.jpg
imageCaption: "The Vasco da Gama Bridge in Lisbon, Portugal. Photo: William Warby / Bruce1ee via Wikimedia Commons (CC BY 2.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Vasco%20da%20Gama%20Bridge%20B%26W%20(crop2).jpg
category: News
data-ai-hint: bridge over water
publishedDate: '2026-10-25'
lastUpdated: '2026-10-25'
---

Pump.fun switched its app to an in-house crosschain router on Oct. 21, making Pump Bridge the default path for trades that cross chains and dropping Relay, the outside provider it had used since adding swaps in May. [Crypto Briefing](https://cryptobriefing.com/pumpfun-pump-bridge-replaces-relay/) reported the change the same day, and Pump.fun's own test data put buys through the new route at about twice the speed with 92% fewer errors.

The comparison ran from Sept. 28 to Oct. 7 inside the Pump.fun app, where users were randomly assigned to Relay or Pump Bridge for crosschain trades on Robinhood Chain, BSC, Base, Arc and Ink. In that window the typical buy landed in 1.95 seconds on Pump Bridge against 3.88 seconds on Relay, and buy errors fell from 11.2% to 0.9%, [Bankless reported](https://www.bankless.com/read/news/pump-fun-ditches-relay-for-in-house-pump-bridge) on Oct. 22. [TokenPost](https://www.tokenpost.com/news/technology/37651) cited the same published comparison the day before and described the error drop as a 92% reduction.

Latency drove the switch. Under Relay a typical crosschain trade took around 4 seconds and more than 10% of trades took longer than 7 seconds, Crypto Briefing wrote, adding that Pump.fun puts the fastest theoretical buy at roughly 1.1 seconds. TokenPost separately reported that the company presents that 1.1-second figure as a floor for what is mathematically possible rather than a time users should expect on every trade.

Every performance number comes from Pump.fun, and no outside party has published a replication of the test. The timing set covers 383,326 timed trades, with Robinhood Chain accounting for about 53% of them and BSC about 39%, a mix that shows how much of the app's crosschain flow now runs through the Robinhood Chain memecoin market. On execution quality the median buy still landed 3.0% below the spot price shown in the app against 3.6% on Relay, so fills improved without becoming exact. Pump.fun also said the gap between the reference price and the tokens received came out about 17% smaller on its bridge than on Relay, a claim that rests on the same internal data.

Pump Bridge adds no separate bridging fee at the moment, and that description does not cover other trading or transaction costs, according to TokenPost. Cofounder alon made the pricing case in an X Article titled "How your social trading app has been robbing you," which pitched Pump.fun's 0.45% platform fee as the lowest of any social trading app.

Pump.fun has run its memecoin launchpad on Solana since January 2024 and added crosschain swap support in May 2026 across ecosystems including Ethereum, Base and BNB Chain, Crypto Briefing reported. Those first crosschain trades ran through Relay, and complaints about latency and execution quality pushed the company to build its own route rather than keep renting one. The change leaves the timing of future router updates with Pump.fun instead of a provider that a rival still depends on. Rival social trading app Fomo still sends its crosschain orders through Relay, and the switch landed days after Pump.fun added Hyperliquid perpetual futures to the app. Neither Relay nor Fomo had publicly answered as of Wednesday evening, the Bankless report said.

Relay broke that silence a day later. [Its response, relayed by TokenPost](https://www.tokenpost.com/news/technology/38862) on Oct. 23, highlighted developer reach and data scale: the platform serves thousands of developers and supports wallets, payments, real-world asset projects, prediction markets, perpetual futures and trading. As relayed in that report, the reply did not engage with the 11.2% error rate or the 1.95-second timing Pump.fun published, and it arrived a day after the comparison had already circulated. Relay said its data covers about 100 times the transaction scale, with larger orders, more routes and more use cases, and that results can vary substantially based on how an application integrates its software, adding that it has released several updates recently.
