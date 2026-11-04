---
title: Osmosis Votes to End OSMO Inflation and Fund Staking From Revenue
ogTitle: "OSMOSIS VOTES TO END OSMO INFLATION, FUND STAKING FROM REVENUE"
description: Governance Proposal 1053 passed with 91.07% support, stopping all new OSMO minting so staking rewards come only from protocol revenue and the daily developer token release pauses.
image: /images/news/osmosis.jpg
imageCaption: "A view of the server room at The National Archives in Kew, London. Photo: The National Archives (UK) via Wikimedia Commons (CC BY 3.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:A_view_of_the_server_room_at_The_National_Archives.jpg
category: News
data-ai-hint: data center server racks
publishedDate: '2026-10-27'
lastUpdated: '2026-10-27'
---

Osmosis governance passed Proposal 1053, titled End OSMO Inflationary Emissions, ending inflationary emissions of the OSMO token. The [proposal text on the chain's governance explorer](https://www.mintscan.io/osmosis/proposals/1053) states that the mint module stops issuing new OSMO, staking rewards from issuance and the community pool allocation end, and staking rewards come entirely from protocol revenue. The daily developer vesting release, which runs through the same mint mechanism, pauses with it.

The vote drew 91.07% in favor, or 95,127,296 OSMO, with 8.93% abstaining; no and veto shares each rounded to 0.00%. Turnout reached 65.52% against a 30% quorum requirement, according to the [tally recorded on Valopers](https://osmosis.valopers.com/proposals/1053). Voting ran from October 20 to October 25. The proposal carried a 30,000 OSMO deposit from proposer address osmo19w2t4ue7qpdh6022.

Before the change, the mint module still distributed about 121,766 OSMO per day. Most of that never entered circulating supply: 67% went to the community pool as a soft burn, 25% funded a daily developer vesting release, and only 8%, roughly 9,740 OSMO, went to staking rewards in circulating supply, the proposal explains. [TechFlow reported](https://www.techflowpost.com/en-US/newsletter/141452) that the developer vesting release of about 30,440 OSMO a day pauses with the same mechanism, leaving roughly 51.9 million pre-minted tokens in the developer vesting module account. Those coins were minted at genesis, not issued through inflation, and any future release would need a separate governance decision, the proposal says. The developer address was set by earlier Proposal 997 and has sat untouched since December 2025.

Issuance had already been cut in stages through Proposals 957 and 967, which reduced the staking subsidy in two steps below the taker fee burn rate and redirected most of each day's mint to the community pool as a soft burn. OSMO was already net deflationary before this vote: OSMO burned from taker fees and ProtoRev revenue over the prior year outpaced the OSMO issued into circulating supply, according to the proposal. Redirecting issuance to the community pool kept OSMO out of circulation but still created it. Ending issuance at the source removes that soft-burn redirect, so every coin burned from fees directly reduces total supply.

The mechanism is a parameter change rather than a code fork. The mint start epoch moves to 100,000,000, a height the chain does not reach at one epoch per day, and distribution proportions shift so staking, pool incentives and developer rewards read zero. The stored epoch provisions value still shows about 121,766 OSMO per day in queries, but nothing is minted against it.

Stakers keep their share of taker fees and transaction fees. The roughly two percentage points of staking APR that came from issuance ends. The proposal estimates that Proposal 1052, which raised the share of trading fees routed to stakers, adds about 1.7 percentage points of APR to offset most of that loss. [Phemex noted](https://phemex.com/news/article/osmosis-ends-osmo-inflation-shifts-staking-rewards-to-feebased-model-101201) that daily new issuance drops from about 91,324 tokens to zero as of October 26, and that future staking rewards are funded by network fees rather than newly minted tokens.

The community pool stops receiving newly minted OSMO. Before the vote it absorbed about 81,580 OSMO a day from the mint, a balance that governance manages and that did not circulate. The proposal lists the end of that daily community pool allocation among its impacts.

[The forum discussion](https://forum.osmosis.zone/t/end-osmo-inflationary-emissions/4159) that preceded the on-chain vote made the same case: staking rewards were already funded largely by protocol revenue from taker fees and transaction fees, ending emissions completes the move to a yield made entirely of revenue, and without soft-burn issuance every coin burned from fees directly reduces supply. No OSMO is minted or released from the first daily epoch after passage, the proposal states.
