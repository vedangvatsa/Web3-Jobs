---
title: Symbiosis Recovers 15 BTC After Bitcoin Bridge Exploit, Offers 20% Bounty
description: >-
  Cross-chain protocol Symbiosis recovered about 15 BTC from a Sept. 11 exploit
  that minted billions of unbacked synthetic bitcoin, and offered the attacker a
  20% bounty, while liquidity providers await a compensation plan.
image: /images/news/symbiosis-bridge.jpg
imageCaption: "Physical Bitcoin coins. Photo: Jorge Franganillo via Wikimedia Commons (CC BY 2.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Bitcoins.jpg
category: News
data-ai-hint: physical bitcoin coins
publishedDate: '2026-09-14'
lastUpdated: "2026-09-15"
ogTitle: SYMBIOSIS RECOVERS 15 BTC AFTER BRIDGE EXPLOIT
---

Cross-chain liquidity protocol Symbiosis said it recovered approximately 15 BTC after an attacker exploited a vulnerability in its Bitcoin Bridge on Sept. 11. The bitcoin, worth roughly $1.15 million at current prices, is now held in a team-controlled [multisig wallet](https://www.theblock.co/news/defi/2026-09-13-symbiosis-says-it-recovered-15-btc-after-bitcoin-bridge-exploit-offers-attacker-20-bounty-414568).

The exploit occurred at approximately 04:28 UTC on Sept. 11. Symbiosis did not disclose the nature of the vulnerability in its Bitcoin Bridge. The project halted its native bitcoin routes and isolated the affected bridge from the rest of its infrastructure. Other routes across EVM networks, TRON, and TON, as well as its Octopools product, remained operational, according to the protocol. Symbiosis has since restored bitcoin swaps through third-party partners Chainflip and THORChain, though its own Bitcoin Bridge stays paused. The project's relayer network also continues to operate, [according to Symbiosis](https://www.theblock.co/news/defi/2026-09-13-symbiosis-says-it-recovered-15-btc-after-bitcoin-bridge-exploit-offers-attacker-20-bounty-414568). Symbiosis did not immediately respond to a request for comment from The Block.

## Billions of unbacked syBTC minted

Blockchain security firm [Blockaid said](https://x.com/blockaid_/status/2098275381417513149) it detected an exploit on BNB Chain in which a call to Symbiosis's BridgeV2 contract minted roughly 46.1 billion syBTC, the protocol's synthetic bitcoin token, and sent the tokens to a fresh address. The quantity is more than 2,000 times bitcoin's maximum 21 million coin supply.

The attack targeted the minting function of the BridgeV2 contract on BNB Chain. In cross-chain bridge designs, synthetic tokens are typically minted on a destination chain to represent assets locked on a source chain. The attacker exploited a flaw that allowed minting syBTC without depositing corresponding BTC, producing tokens backed by nothing. The 46.1 billion syBTC figure represents the total unauthorized supply created, though the actual economic damage was limited by how much the attacker could convert into usable assets.

The gap between the minted tokens and the actual funds extracted is large. Blockaid said the attacker sold only approximately 4.39 WBTC through Uniswap v4 on Ethereum, realizing about $336,000 in proceeds. The attacker moved the unbacked syBTC across chains and converted a small fraction into Wrapped BTC on Ethereum before selling through the decentralized exchange. [DeFiLlama classified](https://defillama.com/hacks) the incident as an "unbacked cross-chain mint" with a $336,000 loss. The discrepancy between the notional value of 46.1 billion syBTC and the $336,000 realized proceeds reflects the constraints of moving large volumes through decentralized exchanges without exhausting liquidity or triggering protocol-level alerts.

The pattern of massive token minting but limited actual extraction is not unique to this exploit. In April, an attacker [exploited Polkadot-focused Hyperbridge](https://www.theblock.co/news/ecosystems/2026-04-13-bridged-dot-hyperbridge-exploit-397167) to mint 1 billion bridged DOT but ultimately netted only about $237,000, a fraction of the theoretical value of the tokens. The gap typically reflects the difficulty of moving large volumes through decentralized exchanges and across bridge liquidity without triggering alerts or exhausting available liquidity.

## The bounty and what remains unresolved

Symbiosis offered the attacker a white-hat bounty equal to 20% of the funds, valid through Sept. 13. After that window closed, the protocol said the same 20% reward would shift to anyone who provides information leading to further recovery. As of Sept. 14, there was no public confirmation that the attacker accepted the offer.

"We are contacting every affected LP directly," Symbiosis wrote. "We are building a compensation framework and will publish the criteria shortly." The protocol said the final loss figure is still being calculated. The bounty structure follows a pattern common in DeFi exploits, where protocols attempt to recover funds by offering the attacker a percentage rather than pursuing legal action, which can be slow and uncertain across jurisdictions.

The incident comes less than a week after an attacker exploited a separate bug in Blockstream's Liquid Network to create roughly 4,000 unbacked LBTC, redeeming them for bitcoin held by the network. The party responsible later returned approximately 3,400 BTC, though Blockstream [refused a ransom demand](https://www.theblock.co/news/ecosystems/2026-09-11-return-the-bitcoin-blockstream-refuses-ransom-demand-for-remaining-600-btc-from-liquid-exploit-414247) for the approximately 598.5 BTC still outstanding. The back-to-back incidents have raised questions about the security of cross-chain infrastructure more broadly.

## Protocol scale and TVL

Symbiosis says it has processed more than $10 billion in transaction volume since launching about five years ago. The protocol currently has roughly $7 million in total value locked, per [DefiLlama data](https://defillama.com/protocol/symbiosis), and about $3.19 billion in bridge volume since its data series began. Bitcoin itself was not compromised in the exploit.

The relatively low TVL compared to the volume processed reflects Symbiosis's role as a routing and swap protocol rather than a lending or yield platform. Liquidity providers deposit assets into pools that settle cross-chain swaps, and the exploit specifically targeted the synthetic bitcoin minting mechanism used to bridge BTC across chains. The LP compensation framework announced by Symbiosis will determine how the losses are distributed among participants who provided liquidity to the affected pools. The protocol has not yet disclosed how much liquidity was locked in the affected pools at the time of the exploit or how many LPs are impacted.

## What the recovery and bounty mean

The 15 BTC recovered represents a partial restitution of the funds the attacker extracted from the protocol. In White Hat ecosystems, such recoveries typically occur after the attacker recognizes the funds cannot be laundered cleanly or after negotiations with the protocol. Symbiosis has not stated whether the recovery was voluntary or the result of on-chain action. The 20% bounty offered through Sept. 13 applies to the total funds, meaning the attacker could claim a share of the 15 BTC already recovered if they returned the remainder, or the reward could go to a third party who provides information leading to further recovery.

Bridge exploits have historically varied widely in their outcomes. Some result in full recovery through white-hat negotiations, while others end with funds unrecovered and protocols compensating victims from treasury reserves or closing entirely. The Liquid Network case, which preceded this incident by days, saw roughly 3,400 of approximately 4,000 BTC returned, but the outstanding balance remained disputed after Blockstream declined an attacker ransom demand.

The timing of the two incidents in the same week has drawn attention to the state of cross-chain security. Bridges remain among the most targeted categories of DeFi infrastructure because they consolidate large amounts of locked assets behind a single contract that must enforce complex cross-chain state transitions. Security firms have repeatedly flagged the risk posed by bridge contracts that handle both minting and locking logic in a single code path.

For Symbiosis users, the primary operational takeaway so far is that non-bitcoin routes remain functional and that the protocol has published a clear escalation path for LP compensation. The exact criteria for that compensation, and the final damage assessment, remain pending. The protocol has said it will publish the framework shortly but has not given a date. As of Sept. 14, the affected Bitcoin Bridge remains paused pending a fix, and Symbiosis has not announced a timeline for reopening it.
