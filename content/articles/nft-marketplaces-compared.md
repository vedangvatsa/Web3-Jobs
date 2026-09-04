---
title: >-
  NFT Marketplaces Compared: OpenSea, Blur, Magic Eden, Rarible and SuperRare in
  2026
image: /images/ales-nesetril-Im7lZjxeLhg-unsplash.jpg
data-ai-hint: nft marketplace comparison
description: >-
  A practical comparison of leading NFT marketplaces in 2026. Covers verified
  fees, royalty enforcement, supported chains, listing types, and which venue
  fits creators, collectors, and pro traders. Includes OpenSea at 1%, Blur at
  0%, Magic Eden at 2%, Rarible at 1% per side, SuperRare at 15% primary and 10%
  royalty, Zora at 0.000777 ETH per mint, plus notes on Foundation and X2Y2
  shutdowns.
category: Getting Started
publishedDate: '2026-03-11'
lastUpdated: "2026-09-04"
---
## What is an NFT marketplace

An NFT marketplace is a platform where you list, discover, and trade non-fungible tokens. You connect a self-custodial wallet, sign a listing or offer, and the marketplace relies on a smart contract to move the token and the payment on chain when a sale matches. The marketplace never holds your NFT in the same way a custodial exchange holds coins. It holds signed orders off chain until a buyer fulfills them.

The token itself is a contract address plus a tokenId. The marketplace indexes that contract, shows the image and traits from its metadata, and adds sale mechanics such as fixed price, timed auction, collection offer, and in some cases lending or pooling.

## Who this comparison is for

This guide helps you pick a venue based on what you actually plan to do.

It is a good fit for:

- Artists and photographers who want to mint on a chain they own and sell to collectors directly
- Collectors who buy 1-of-1 art or editioned passes and want to know total cost, including fees and gas
- Active traders who sweep floors, place collection bids, or provide liquidity and care about fee drag and execution speed
- Product, ops, and community hires who need to explain marketplace choices to a team or in an interview

It is not for you if you want a promise of quick sales. Trading volume peaked above $17 billion in 2021 to 2022 and fell to about $5.5 to $5.6 billion in 2025, per DappRadar and BlockchainReporter summaries of that period. Most new tokens get little attention. If you only need basics, read "How it works" and "At a glance" and skip the checklist.

## How NFT marketplaces actually work

### Wallets and custody

You trade from a self-custodial wallet such as MetaMask, Rabby, or Coinbase Wallet. The marketplace asks you to sign a listing or to approve a contract to move a token on your behalf. The token stays in your wallet until a sale executes. Private keys and the Secret Recovery Phrase remain with you. No legitimate marketplace will ask for the phrase. Support docs at support.metamask.io/start/user-guide-secret-recovery-phrase-password-and-private-keys describe this setup.

Practice with a small amount first. Send a tiny test on Base or Sepolia, list an item you mint to yourself, then cancel the listing to see how signatures and approvals behave. Use revoke.cash to remove approvals you no longer need. For higher value, keep most assets in a hardware wallet and use a small hot wallet for daily listings.

### Listing mechanics and protocols

Most venues share the same primitives:

- **Fixed price listing.** You set a price in ETH, SOL, or USDC, sign an off-chain order, and pay no gas to list. Gas is paid when the order fills or if you cancel on chain.
- **Offer and collection offer.** A buyer can bid on one token or across an entire collection. Sellers can accept an offer to close the sale.
- **Timed auction or reserve auction.** A start time or reserve price triggers a 24-hour countdown with a 15-minute extension if a bid arrives late. SuperRare uses this model for curated drops.
- **Pool or AMM route.** On Solana, Tensor lets you provide buy and sell curves through TensorSwap so you can market-make a collection.

On Ethereum, OpenSea uses Seaport. Seaport 1.6 was deployed after the March 13, 2024 Dencun upgrade and made some routes about 5% cheaper on gas than Seaport 1.5, per OpenSea and Bitget coverage of the release. Seaport does not hold funds. It validates the signatures, moves the NFT from seller to buyer, and splits payment to seller, creator, and marketplace in one transaction. Blur runs its own order book with aggregation across venues, so a buyer can sweep the cheapest listings regardless of where they were first posted.

### Royalties and enforcement

EIP-2981 defines a standard function, royaltyInfo, that returns a recipient and an amount for a given sale price, for example 5% to an address. It is a signal, not a rule. The token transfer does not know whether it was a sale, so a marketplace has to choose to honor the signal. Spec: eips.ethereum.org/EIPS/eip-2981 and ethereum.org/developers/docs/standards/tokens/erc-721.

What that means in practice in 2026:

- If a collection uses standard ERC-721 and lists on most open marketplaces, royalties are optional. The seller chooses whether to add the suggested amount on OpenSea, and the buyer pays it as part of the price.
- If a collection uses ERC721-C or ERC1155-C with creator fee enforcement through Seaport 1.6 and Limit Break Payment Processor, OpenSea can enforce the fee on its own routes and on other Payment Processor venues such as Magic Eden. OpenSea limits this enforced amount to 10% maximum and will match the lowest royalty you set elsewhere if you enforce. Docs: support.opensea.io/en/articles/8867026-how-do-i-set-creator-earnings-on-opensea and docs.opensea.io/docs/creator-fee-enforcement.
- SuperRare enforces royalties at the contract level for work minted on SuperRare.
- Zora enforces a flat mint fee split with on-chain accounting. RARI Chain enforces royalties at the sequencer level, so every sale on that chain pays the set percentage. On Solana, royalties are enforced for Metaplex pNFT collections and optional for standard SPL tokens.

Plan around primary sale price. Treat secondary royalties as possible, not promised, unless your contract and venue explicitly enforce them and you have tested that path.

### Chains and gas costs

All-in cost is marketplace fee plus network fee plus any royalty that applies.

- **Ethereum mainnet.** A basic ETH transfer uses 21,000 gas. An NFT purchase uses more and often costs $1 to $10 in gas depending on congestion and ETH price. Since EIP-1559, fee is base fee plus priority fee, shown as maxFeePerGas and maxPriorityFeePerGas. The base fee is burned on Ethereum. Docs: ethereum.org/developers/docs/gas and eips.ethereum.org/EIPS/eip-1559.
- **Base and other Ethereum L2s.** Base documents a minimum base fee of 0.005 gwei and two components, an L2 execution fee and an L1 security fee for posting data to Ethereum. At 2026 observed levels, a transfer on Base was about $0.007, an ERC-20 transfer about $0.017, and a standard ERC-721 mint $0.04 to $0.05, rising to $0.10 during local congestion. Fees can rise at most 4% per block. Docs: docs.base.org/base-chain/network-information/network-fees.
- **Solana.** Transaction fee is usually under $0.001. Marketplace fee dominates. This is why high-frequency bidding is viable on Solana and less so on mainnet.
- **Bitcoin Ordinals.** Marketplace fee is 0.5% to 2%, but each trade also pays Bitcoin network fees which can be $0.50 to $20 plus during fee spikes.

Listing itself is free on all major venues. You only pay gas for the one-time approval if needed, or use gasless off-chain signatures where supported.

### Aggregation and curation

Open venues such as OpenSea, Blur, and Rarible aggregate listings from multiple sources so you see the best price in one view. An aggregator still respects each order's fee layout, so the final price depends on sale price plus marketplace fee plus royalty.

Curated venues such as SuperRare filter who can mint. Only invited artists can mint there. That curation reduces spam but adds a gate. Foundation used a similar invite model until it closed in 2026. Open venues let anyone mint to their own contract and list.

## Marketplace by marketplace: 2026 snapshot

### OpenSea - the generalist

OpenSea launched in December 2017 by Devin Finzer and Alex Atallah, went through Y Combinator Winter 2018, and became the largest NFT venue by volume. After Blur took daily volume share in early 2023, OpenSea rebuilt the platform as OS2, launched in beta January 26, 2025 and opened publicly in February to May 2025, cut fees, added token trading, and expanded chain coverage.

**Verified fees and chains as of 2026:**

- 1% fee for selling NFTs, 10% fee for minting an NFT in a primary drop through OpenSea, 0% for swaps, with private listings typically at 0% at this time. Source: support.opensea.io/en/articles/8867091-what-fees-do-i-pay-on-opensea, updated May 12, 2026.
- Fee timeline: 2.5% original, then 0.5% during OS2 beta, then a 0% promotion around the planned SEA token window, then 1% from September 15, 2025 for all chains as final phase of rewards. Source: docs.opensea.io/changelog/opensea-fee-update, September 9, 2025.
- Chain coverage: over 20 chains after OS2, including Ethereum, Base, Polygon, Arbitrum, Optimism, Avalanche, Zora, Blast, Sei, Berachain, Ronin, and others. Solana and Bitcoin assets can be browsed, but full trading is EVM-focused. The May 2025 OS2 launch listed 14 chains at first, then expanded. Sources: support.opensea.io and thenftbuzz.com summary of OS2 February 13, 2025 launch.
- Creator earnings: optional by default. Enforced only if you deploy through OpenSea Studio after April 2, 2024 at 10:00 a.m. PT or use an ERC721-C or ERC1155-C compatible contract with enforcement turned on via Seaport 1.6 and Payment Processor support. Max 10%.
- Rewards and token: SEA token announced February 2025, planned for Q2 2026, with US eligibility confirmed and eligibility tied to historical activity and the Voyages rewards program. The SEC Wells Notice sent in August 2024 was closed in February 2025 without charges.
- Position: about 71.5% of Ethereum NFT volume in February 2025 after the SEA announcement, per The Block and multiple marketplace reports that tracked the jump from about 25.5% to 71.5% in one week, and about 382,000 monthly active users in 2026 versus about 38,300 for Blur in the same reports.

**Best for:** widest discovery, beginners, multi-chain collectors, teams that want one venue that indexes almost everything. You pay 1% plus chain gas plus any royalty the seller included or the collection enforces. For a $1,000 sale with 1% marketplace fee and 5% enforced royalty, the seller nets $940 before gas, the creator gets $50, the venue gets $10.

**Trade-offs:** primary drop commission is high if you mint through OpenSea at 10%. Royalties are not enforced for most older collections. Verification and search quality have improved with OS2, but you still need to verify contract addresses yourself.

### Blur - the pro trader venue

Blur launched in October 2022, backed by a seed round led by model, and went live with the BLUR token in February 2023. It targets professional traders.

**Verified fees and chains as of 2026:**

- 0% marketplace fee. That has been the model since launch. A governance proposal to add a 0.5% protocol fee did not pass as of mid-2026. Sources: blockchainreporter.net review May 27, 2026 and spark.money fee comparison mid-2026.
- Minimum 0.5% creator royalty enforced on standard orders, and full royalty enforcement for collections that block trading on OpenSea, per Blur docs at mirror.xyz/blurdao.
- Ethereum only as of May 2026. No Solana or multi-chain trading.
- Blend is a peer-to-peer perpetual NFT lending protocol with no fixed expiry and no fixed fee, where a holder can borrow ETH against an NFT. Blend processed 169,900 ETH in its first 22 days in 2023 and saw liquidation waves in 2024 when floors fell.
- BLUR token fell from an all-time high of $5.02 in February 2023 to about $0.02 in May 2026, down about 99.6%, with circulating supply near 2.8 billion of 3 billion. Token is used for governance but does not accrue marketplace fees.

**Best for:** traders who batch list, sweep floors, place laddered collection bids, and use real-time analytics and aggregator routing. If you care about per-trade fee drag, 0% with optional royalty is the lowest on Ethereum.

**Trade-offs:** interface assumes you already understand floor depth, bid incentives, and Blend liquidation risk. No mobile app. No royalty guarantee for most collections. Token incentives that drove 2023 volume have faded, and monthly active users are about one tenth of OpenSea.

### Magic Eden - Solana leader with multi-asset roots

Magic Eden launched in 2021 on Solana and later expanded to Ethereum, Polygon, and Bitcoin Ordinals. In early 2026 it refocused.

**Verified fees and chains as of 2026:**

- 2% per transaction. Help articles updated March 8 to 9, 2026 state Magic Eden takes 2% on all transactions and that royalties are honored if set in metadata. Source: help.magiceden.us/en/articles/5858632-what-fees-will-i-pay-to-list-or-sell-nfts-on-magic-eden and breakingnft.news March 16, 2026 overview.
- Chain coverage: marketplace discovery lists Solana, Bitcoin, Ethereum, Base, Polygon and others, but operational wallet and app support narrowed in 2026. Spark.money notes that Magic Eden shut down its Bitcoin Ordinals and EVM marketplaces on March 9, 2026 to focus on Solana and its Dicey gaming platform. The largest Bitcoin marketplace role moved to UniSat after that date. Verify on magiceden.io before you plan a Bitcoin mint.
- Accepted chains and currencies include SOL for Solana NFTs and ETH for Ethereum NFTs, with fiat via Crossmint conversion, per help.magiceden.us/en/articles/6483913-supported-currencies-and-blockchains-for-nft-transactions-on-magic-eden, March 9, 2026.
- Rewards: staking $ME gives staking power and governance rights, per help.magiceden.io/articles/12151516 and 10256546. Rewards can add a small boost for frequent trading but should not drive sizing.

**Best for:** Solana collectors and gaming drops where sub-cent gas and 2% buyer-side cost suit low-ticket items and frequent repricing.

**Trade-offs:** narrowing to Solana means you need another venue for Ethereum 1-of-1 art. 2% buyer fee plus any collection royalty is higher than Blur on Ethereum for the same dollar sale.

### Tensor - Solana pro alternative

Tensor is a Solana-native venue for active traders. Official fee schedule is 2% taker and 0% maker, per docs.tensor.trade. Makers list or post bids, takers buy listings or sell into bids. Royalties follow Metaplex MIP-1 expectations for pNFTs. TensorSwap lets you market-make with pools that quote on both sides and earn fees, but you take inventory risk if the floor moves.

**Best for:** Solana traders who want to provide liquidity and be paid rather than pay, and who want depth views from maker and taker perspectives.

**Trade-offs:** Solana only. Using taker flow for everything adds 2% plus royalty on every trade. Pools are not passive yield. Thin collections can trap you.

### Rarible - multichain marketplace and protocol

Rarible is a multichain marketplace and an aggregator that surfaces native and external listings. It also ships the Rarible Protocol, an open source SDK for teams that want to run their own marketplace with indexing, order, and royalty handling.

**Verified fees and chains as of 2026:**

- About 1% buyer fee and 1% seller fee. Several guides list 1% per side, with listing free and lazy minting available so the buyer pays gas on purchase. Source: plisio.net rarible guide August 24, 2026 and milkroad.com review May 28, 2026. Some fee comparisons show a sliding scale of 0.5% to 7.5% per side based on size, with RARI stakers able to reach 0%. Use the checkout summary for the exact split. Overall about 2% combined is the planning number.
- Chain list published July 30, 2025 at help.rarible.com/hc/en-us/articles/10457638858253-which-blockchains-does-rarible-support includes RARI Chain, Ethereum, Polygon, Immutable X, zkSync Era, Base, Arbitrum, Celo, Moonbeam, Etherlink, Lisk, Palm, Aptos, Aleph Zero, Shape, Telos, Matchain, Abstract, Hedera EVM, and Goat Network. That is over 20 networks.
- Creator setting: creators can set royalties up to 50% in the tooling, and Rarible supports ERC721-C workflows. Royalties are configurable per collection.
- RARI Chain is a Layer 3 built with Arbitrum Orbit that enforces royalties at the chain level. If you set 5%, every sale on RARI Chain pays 5% regardless of marketplace. Adoption is early.
- Lazy minting: you can list without writing to chain until a buyer purchases, so you can list many items at zero upfront gas.

**Best for:** collectors who want to shop across many chains in one place, and studios that want to run a branded marketplace without building indexing and order matching from scratch. For creators who prioritize royalty certainty, RARI Chain is the concrete path, but only for sales that happen on that chain.

**Trade-offs:** aggregation means you should compare net price after both sides of the fee and any royalty, not just floor display. RARI staking promos that drop fees to 0% depend on token lock.

### SuperRare - curated 1-of-1 art

SuperRare launched in 2018 with founders John Crain, Charles Crain, and Jonathan Perkins. It is a curated Ethereum marketplace for single-edition art.

**Verified fees and chains as of 2026:**

- Primary sale: artist receives 85%, SuperRare DAO Community Treasury receives 15%. Source: help.superrare.com/en/articles/10629742-offers-auctions-and-pricing, March 17, 2025.
- Secondary sale: seller receives 90%, original artist receives 10% as royalty. This contract-level royalty is enforced on SuperRare.
- Marketplace fee: 3% added on top of the sale price and paid by the buyer on all sales. It goes to the Treasury. Auctions do not show it in the list price but it still applies. Source: same SuperRare help article.
- Ethereum only. Payment in ETH. Curation requires application and review. A 15% primary commission is higher than the 1% to 2% on open venues. RARE token is used for governance and staking.

**Best for:** artists with a coherent 1-of-1 practice who want gallery-style provenance, enforced resale royalties, and auction tools such as scheduled and reserve auctions with 24-hour countdowns and 15-minute extensions. Collectors who want scarcity over volume.

**Trade-offs:** high primary cost, single chain with mainnet gas, and a gate that rejects many applicants. Secondary liquidity is thinner than on OpenSea, so price discovery can be slower.

### Zora - creator network with flat mint fee

Zora started as an NFT marketplace around 2020 and now runs as a Layer 2 network on OP Stack integrated with Base. It promotes content coins and creator coins, where posts can become tradable tokens paired with $ZORA.

**Verified fees and chains as of 2026:**

- 0.000777 ETH per mint for NFTs created through Zora, about $1.40 at the time of the 2023 change, per CoinDesk and Binance coverage of the August 3, 2023 Zora announcement.
- Revenue split: creators get at least 42.9% of mint fees from free mints and 100% from paid mints, with the rest to protocol and referrers. Zora docs describe this split at docs.zora.co.
- Chains: Zora Network, Base, and Ethereum. Minting on Zora L2 is low cost, and Zora no longer charges a creation or listing fee.
- Token: $ZORA launched in April 2025 after a surge in activity. DappRadar and CreatorEconomyTools summaries place the mint fee and split as above, with $ZORA used for trading fees and referrals.

**Best for:** creators who want free or cheap open editions, no-code drops, and a built-in referral share. If your audience already uses Base, Zora is a low-friction test bed.

**Trade-offs:** audience is crypto-native and smaller than OpenSea. Content coin volatility is high. Past pivots from marketplace to SocialFi create questions about long-term direction.

### Platforms that have closed or wound down

Do not plan around these venues. Accounts of shutdowns are useful for risk assessment.

- **Foundation.** Closed permanently April 15, 2026 after a sale to Blackdove announced January 27, 2026 did not complete. Foundation processed about $230 million in primary sales since 2021. The team pledged to keep its IPFS gateway through April 27, 2027 and to provide delisting tools for escrowed NFTs. Contracts remain on chain and tokens stay in wallets, but frontend, listings, and gallery pages are offline. Sources: foundation.app closing letter April 27, 2026, The Defiant April 16, 2026, and Gate News summary April 18, 2026.
- **X2Y2.** Sunsetting as an NFT marketplace on April 30, 2025 after three years and about $5.6 billion in cumulative volume. Volume fell about 90% from peak to about $53 million in the trailing year, per Token Terminal via InsideBitcoins March 31, 2025. Blog at mirror.xyz/x2y2.eth announced the pivot to an AI project. Smart contracts stay active.
- **Other exits 2024 to 2026.** Nifty Gateway closed in February 2026, MakersPlace in January 2025, KnownOrigin wound down in July 2024 after its eBay acquisition, and Quidd closed January 3, 2025. Magic Eden closed its Bitcoin Ordinals and EVM marketplaces in March 2026, keeping Solana active. These moves reflect consolidation after the 2022 to 2024 volume decline.

## At a glance: fees, chains, and royalties

Use this as a planning sheet. Check the live checkout before you list, because fees can change and gas moves by block.

| Marketplace | Marketplace fee | Who pays | Creator royalties | Primary chains as of 2026 | Status |
| --- | --- | --- | --- | --- | --- |
| OpenSea (OS2) | 1% for sales, 10% for primary drops via OpenSea, 0% for swaps and private listings | Seller for sales | Optional by default, enforced only with ERC721-C or ERC1155-C plus Payment Processor, max 10% | 20+ chains including Ethereum, Base, Polygon, Arbitrum, Optimism, Avalanche, Zora, Blast, Sei, Berachain, Ronin | Active |
| Blur | 0% | No venue fee, buyer still pays chain gas and any royalty | Minimum 0.5% default, full if collection blocks OpenSea | Ethereum only | Active |
| Magic Eden | 2% per transaction | Buyer side per help article, generally quoted as total 2% | Supported per collection, optional | Solana focused after March 2026, plus prior support for Ethereum, Polygon, Bitcoin Ordinals | Active on Solana |
| Tensor | 2% taker, 0% maker | Taker pays | Enforced for pNFTs, optional otherwise per docs.tensor.trade | Solana | Active |
| Rarible | About 1% buyer plus 1% seller, sliding scale 0.5% to 7.5% per side with staking discount | Both sides combined about 2% | Configurable per collection, up to 50%, enforced on RARI Chain | 20+ including Ethereum, Polygon, Base, Arbitrum, RARI Chain, Aptos, Immutable X, zkSync Era | Active and aggregator |
| SuperRare | 15% primary to Treasury, 3% buyer fee on all sales | Seller primary commission, buyer marketplace fee | 10% enforced secondary to original artist | Ethereum | Active curated |
| Zora | About 0.000777 ETH per mint | Minter | Creator gets 42.9% of free mint fees, 100% of paid mint, enforced on Zora | Ethereum, Base, Zora L2 (OP Stack) | Active |
| Foundation | 5% platform fee plus 10% royalty when active | Seller | Was 10% when active | Ethereum | Closed April 2026 |
| X2Y2 | 0.5% former fee | Seller | Former optional | Ethereum | Closed April 2025 |

Listing an NFT is free on all major venues. The only cost to list is the one-time chain approval gas if your wallet has not approved that marketplace before.

## Pros and cons: where each type helps and where it falls short

### Where these venues help

- **Widest reach with lowest setup cost.** OpenSea and Rarible let you mint to your own contract on Base and list across many chains without curation. That is useful for a small edition or for testing pricing before a larger launch.
- **Lowest fee for active trading.** Blur at 0% and Tensor at 0% maker reduce drag when you place many bids or sweeps. On Solana, sub-cent gas makes dozens of reprices cheap.
- **Strong royalty promise for 1-of-1 art.** SuperRare enforces 10% to the artist on every resale on the platform, with a clear split: 85% to artist on primary, 15% to Treasury, plus 3% buyer fee. Curation also keeps spam low.
- **Cheap experimentation.** Zora at about 0.000777 ETH per mint and Base with $0.04 to $0.05 mint gas let you test an idea with a 20-item group for a few dollars of chain cost plus 2% or less venue fee.
- **Chain-level enforcement option.** RARI Chain gives creators who need a guarantee a chain where the royalty cannot be bypassed, unlike EIP-2981 alone.

### What to watch for

- **Thin demand and concentrated liquidity.** Even with lower fees, many collections have few buyers. By early 2025 monthly NFT volume was in the tens of millions, not billions. A low fee does not create a buyer.
- **Royalties are not guaranteed on open venues.** Assume optional unless you use a specific enforced contract on a venue that supports it and you have verified that checkout shows the royalty.
- **Chain fragmentation.** A collection on Solana does not show up for Ethereum collectors without bridging. Magic Eden's focus on Solana after March 2026 means you will need a second venue for Ethereum work. Blurs Ethereum-only scope means you need Magic Eden or Tensor for Solana.
- **Curation as a gate.** SuperRare rejects many applicants. Foundation's closure shows that curation does not guarantee platform longevity. Keep your contract owned by you so work survives a frontend shutdown.
- **Smart contract risk and support burden.** You manage approvals, gas timing, and collector questions. A bad operator approval can move assets. Keep revoke.cash in your routine and verify every contract address from the official site, not a search ad.

## How to choose and get started: a practical checklist

### 1. Define the work and sale type before you pick a venue

Write one sentence for the piece, decide if it is 1-of-1 (use ERC-721) or an edition (use ERC-1155 or Solana editions), and set total supply. If every token should have distinct traits, pick an ERC-721 venue such as OpenSea or SuperRare. If one image has 25 identical prints, an ERC-1155 or Zora edition is more gas efficient.

### 2. Pick the chain based on fee and collector

- For affordable testing and editions: Base via OpenSea Studio, Manifold, or Zora on Base and Zora L2.
- For higher value 1-of-1 Ethereum art where collectors expect mainnet provenance: Ethereum via OpenSea or SuperRare if you have an invite.
- For low-ticket gaming or frequent trading: Solana via Magic Eden or Tensor.

### 3. Compare all-in cost on a sample price

Take your target price and run the split. Example on OpenSea at $500: seller pays 1% venue fee $5 plus 5% enforced royalty $25, nets $470 before L2 or mainnet gas. On Blur at $500 with 0% venue fee and 0.5% royalty: nets $497.50 before gas. On SuperRare primary at $500: artist gets $425, Treasury $75, buyer pays $515 with the 3% buyer fee.

### 4. Set up wallet and funding correctly

Install MetaMask or similar, write the 12-word phrase on paper, store offline, and test recovery on a second device. Fund with a small amount of ETH or SOL, send a tiny test transfer, then practice on a testnet: Sepolia for Ethereum or Base Sepolia for Base. Confirm you can see the transfer on Etherscan or Basescan.

### 5. Deploy a contract you own

Use Manifold Studio or OpenSea Studio for Ethereum and Base, or Magic Eden Launchpad for Solana. With Manifold you choose ERC-721 or ERC-1155 and keep control of mint permissions and royalties. With OpenSea Studio deploy your own contract, pay the gas once, then set earnings up to 10% and a payout address you control. On OpenSea, supply cannot be increased through Studio after minting begins, and name and symbol cannot be changed after deployment.

### 6. Prepare media and metadata that will not break

Export to marketplace limits, usually PNG, JPEG, GIF, SVG, MP4, or GLB under 100 MB. Create one JSON per token with name, description, image as ipfs:// plus attributes. Upload images as a directory to IPFS, pin with a paid service such as Pinata, and use ipfs:// in the contract, not a single gateway URL. Wrap files in a directory, use CIDv1, and test on ipfs.io and dweb.link. Keep local masters with hashes so you can re-pin if a service closes. For Foundation work, copy media now. The Foundation gateway stays pinned only through April 27, 2027.

### 7. List with the right sale type

- For discovery: fixed price with a 7 to 30 day expiry. You sign off chain, no gas to list.
- For price discovery when demand is uncertain: timed auction on SuperRare or collection offers on Blur and Tensor.
- For controlled mints where buyers mint to their own wallets: OpenSea Scheduled Drop with ERC-721 stages, allowlists, and delayed reveal.

Check the checkout preview for fee breakdown, royalty line, and net proceeds before sharing the link.

### 8. Build distribution that respects your time

X is still the primary discovery channel. Post progress shots and explain the idea, not just mint links. Keep a simple site with contract address, chain, supply, price, license, and contact. State your license in plain language: personal display only, limited commercial use, or full commercial rights. By default, buying the token does not transfer copyright.

Track every transaction: deployment gas, mint gas, venue fees, royalties paid or received, sale proceeds in ETH and fiat value at time of receipt, and tx hashes. US creators should plan for ordinary income on primary and royalty receipts and keep receipts for deductions. This is general information, not tax advice.

### Common mistakes to avoid

- Minting before the series is coherent. Early on-chain history is permanent.
- Choosing the wrong standard. Do not use ERC-721 for 500 identical copies or ERC-1155 when collectors expect distinct ERC-721 provenance.
- Relying on a single server for media. Pin to IPFS and keep a backup.
- Approving unlimited operator access on an unfamiliar site. Limit approvals and revoke after the sale.
- Assuming royalties will be paid elsewhere. Test the royalty path on the exact venues you plan to sell.
- Ignoring chain mismatch. Listing a Solana NFT on an Ethereum-only venue will not surface to Ethereum collectors.
- Setting price from headline outliers. Beeple at $69 million on March 11, 2021 and Bored Ape Yacht Club at 0.08 ETH in April 2021 set records, not medians.

## FAQ

**What is the cheapest way to list an NFT in 2026?**

Use Base or Zora L2 through OpenSea or Zora. Listing is off-chain and free everywhere. Minting on Base was observed at about $0.04 to $0.05 per token in quiet periods, and Zora charges about 0.000777 ETH per mint with no creation fee. On Ethereum mainnet the same mint can be dollars depending on congestion. Pick the chain before you pick the venue.

**Should I use OpenSea or Blur?**

Use OpenSea if you want the largest collector base and 20+ chain access with a 1% sales fee plus any royalty that applies. Check support.opensea.io/en/articles/8867091 for the current schedule. Use Blur if you are an Ethereum trader who wants 0% venue fee, batch tools, and collection bidding, and you accept Ethereum-only coverage and optional royalties.

**Which marketplace is best for Solana NFTs?**

Magic Eden and Tensor cover most Solana volume. Magic Eden charges 2% per transaction and is more accessible for casual collectors. Tensor uses 2% taker and 0% maker and suits traders who provide liquidity through TensorSwap. Both enforce royalties for pNFT collections and treat standard collections as optional.

**Are creator royalties guaranteed?**

No, not by default. EIP-2981 signals the amount. Only specific contracts plus venue support make it required. On OpenSea that means a post-April 2024 Studio contract or an ERC721-C or ERC1155-C contract with enforcement on via Payment Processor. SuperRare enforces 10% on its platform. RARI Chain enforces at the chain level. Zora enforces the mint fee split on chain. Elsewhere, expect optional.

**Is SuperRare worth the 15% primary commission?**

It can be if you have a strong 1-of-1 practice and value enforced secondary royalties plus curation. Primary at 15% plus 3% buyer fee is higher than 1% to 2% on open venues, and it is Ethereum only, so gas is higher. Many artists apply after they have consistent sales on an open venue.

**What happened to Foundation and X2Y2?**

Foundation closed permanently on April 15, 2026 after a planned sale to Blackdove announced January 27, 2026 did not complete. The site published its closing letter on April 27, 2026 and will keep its IPFS gateway through April 27, 2027. Contracts remain on chain, but the frontend and listings are offline. X2Y2 sunset its marketplace on April 30, 2025 after volume fell about 90% and cumulative volume of $5.6 billion over three years, per its mirror.xyz post and Token Terminal data.

**How do I know if a listing is legitimate?**

Copy the contract address from the official project site or verified social account, check it on Etherscan or Basescan for a verified contract, review holders and transfer history, and open the tokenURI. An ipfs:// CID that resolves on multiple gateways is a better sign than a single https link. A non-verified contract that asks for unlimited approvals is a red flag. Verify on Etherscan that the contract is verified and that tokenURI returns valid JSON.

**Are NFTs still a viable path in 2026?**

There are durable uses such as art provenance, passes, and in-game items, but speculative volume is far below 2021. Developers who know Solidity and standards, designers who can ship coherent series, and traders who manage fee drag and inventory still find work. As a solo creator, treat the first six months as testing and community building with modest sales expectations and low chain costs.

**What should I read next on this site?**

Start with /what-are-nfts for standards, /what-is-a-blockchain for ledger basics, /what-are-smart-contracts for execution, and /how-to-create-and-sell-nfts for the mint to listing flow. For wallet choice, see /how-to-choose-a-crypto-wallet. For hands-on marketplace building, see /how-to-get-started-as-a-web3-nft-marketplace-developer.

## Verifiable Primary Sources & References

1. [Ethereum EIP-20 Token Standard Specification](https://eips.ethereum.org/EIPS/eip-20)
2. [Ethereum EIP-721 Non-Fungible Token Standard Specification](https://eips.ethereum.org/EIPS/eip-721)
3. [Ethereum EIP-1155 Multi-Token Standard Specification](https://eips.ethereum.org/EIPS/eip-1155)
4. [Ethereum EIP-1559 Fee Market Change Specification](https://eips.ethereum.org/EIPS/eip-1559)
5. [Ethereum EIP-712 Typed Structured Data Hashing and Signing](https://eips.ethereum.org/EIPS/eip-712)
6. [Ethereum EIP-2981 NFT Royalty Standard Specification](https://eips.ethereum.org/EIPS/eip-2981)
7. [Ethereum Official Yellow Paper & Protocol Specification](https://ethereum.github.io/yellowpaper/paper.pdf)
8. [Ethereum Consensus Specs & Proof of Stake Architecture](https://github.com/ethereum/consensus-specs)
9. [Solidity Compiler Official Documentation & Language Spec](https://docs.soliditylang.org/)
10. [Ethers.js Complete Web3 Library Documentation](https://docs.ethers.org/)
