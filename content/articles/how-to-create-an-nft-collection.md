---
title: 'How to Create an NFT Collection: From Concept to On-Chain Drop'
image: /images/simon-abrams-k_T9Zj3SE8k-unsplash.jpg
data-ai-hint: nft collection creation
description: >-
  A practical guide to creating an NFT collection in 2026. Learn how collections
  work on chain, when to use ERC-721 vs ERC-1155, how to prepare art and
  metadata, choose a chain and contract, store data on IPFS, and launch through
  OpenSea Studio or Manifold without wasting gas or rights.
category: Getting Started
publishedDate: '2026-03-11'
lastUpdated: "2026-09-04"
---
## What is an NFT collection

An NFT collection is a set of tokens governed by one smart contract. The contract defines the name, symbol, and token standard, and each mint creates a new tokenId under that contract with a tokenURI that points to a JSON file describing the item.

For profile pictures and 1-of-1 art, most collections use ERC-721, where each tokenId is unique and has one owner. For editions, game items, and mixed inventories, many use ERC-1155, where one contract can track many token types and balances per holder. The pair of contract address plus tokenId is the global identifier you verify on a block explorer.

## Who this guide is for

This guide helps you if you already have a body of work and want to release it as a coherent set with clear supply, pricing, and provenance.

It is a good fit for:

- Illustrators, photographers, and designers planning a themed set of 10 to 1,000 pieces
- Generative or creative coders who want a programmatic drop with hash-seeded traits
- Game, music, or product teams who need editioned passes or inventory under one contract
- Web3 job seekers who need to understand contracts, metadata, and creator earnings before interviewing with a marketplace or studio

It is not for you if you expect quick sales, want to avoid managing keys and fees, or plan to copy existing art. Most new collections sell slowly or not at all, market liquidity fell sharply after 2021, and you are responsible for custody, storage, and accurate records. If you only need background for a role, read "How it works" and "Pros and cons" and skip the deployment steps.

## How an NFT collection actually works

### Wallets and custody

You need a self-custodial wallet. MetaMask, Rabby, and Coinbase Wallet are common for Ethereum and Layer 2 chains. When you create a wallet, the app generates a Secret Recovery Phrase, a 12-word phrase that is the master key for all accounts in that wallet. MetaMask documents this at support.metamask.io/start/user-guide-secret-recovery-phrase-password-and-private-keys.

- Write the phrase on paper and store it offline in a private place. Do not store it in cloud notes, email, or screenshots.
- MetaMask cannot recover the phrase for you. Anyone with the phrase can move your assets.
- Your password only opens the app on that device. It does not replace the phrase.
- For higher value, use a hardware wallet and keep a small hot wallet for daily mints. Practice with a tiny transfer on a testnet or on Base before moving larger sums.

You will need a small amount of ETH to pay network fees. The exact amount depends on the chain you choose. On Ethereum mainnet, a contract deployment can cost several dollars in gas. On Base, it is usually cents.

### Contracts and standards

A collection is not created by uploading files alone. You deploy a smart contract that implements a token standard, then call mint functions that assign tokenIds and set a tokenURI.

- **ERC-721** is for unique items. One contract tracks many distinct tokenIds, each with one owner. This is the standard for most art and profile picture collections. Spec: eips.ethereum.org/EIPS/eip-721 and ethereum.org/developers/docs/standards/tokens/erc-721. Proposed in January 2018 by William Entriken, Dieter Shirley, Jacob Evans, and Nastassia Sachs.
- **ERC-1155** is a multi-token standard. One contract can manage many token types with configurable supply per id and allows batch transfers. This is common for editions and games where one id may represent 25 prints or 1,000 consumables. Spec: eips.ethereum.org/EIPS/eip-1155 and ethereum.org/developers/docs/standards/tokens/erc-1155. Proposed in June 2018 by Witek Radomski, Andrew Cooke, Philippe Castonguay, James Therien, Eric Binet, and Ronan Sandford.

The contract stores a tokenURI, a link to a JSON file with name, description, and an image URI. Wallets and marketplaces read that JSON to show the media. The JSON pattern is defined in the ERC-721 metadata extension.

Use ERC-721 when every token should feel like a distinct object with its own traits. Use ERC-1155 when one token id represents many identical copies, when you need batch minting, or when you want fungible and non-fungible items under one contract.

### Metadata, traits, and supply

Each token needs a JSON file like:

```json
{
  "name": "Example Collection #1",
  "description": "A piece from a 100-item series on urban night light.",
  "image": "ipfs://bafybeib.../1.png",
  "attributes": [
    { "trait_type": "Background", "value": "Night Blue" },
    { "trait_type": "Light", "value": "Neon" }
  ]
}
```

For a 100-piece collection you will create 100 images and 100 JSON files, then upload both as directories so the CID preserves filenames. A typical PFP collection also includes a trait breakdown to set rarity. Do not mint before you have tested the full range. Generate 200 previews and sort them into keep, weak, and broken to see if even common outputs look intentional.

Supply and standard are linked. If each piece must be distinct with its own tokenId, ERC-721 fits. If you want 25 identical prints of one photograph under one id, ERC-1155 is more gas efficient because you store one type with balance 25 instead of 25 separate tokenIds.

### Where the images live

Large files are not stored on Ethereum. They are stored off chain and referenced by hash.

- **IPFS with pinning** is the most common. You add the file to IPFS and get a CID such as ipfs://bafybeib... A CID is a hash of the content, not a location. The file stays available only if someone pins it. If no one pins it, it can be garbage collected. Docs: docs.ipfs.tech/how-to/best-practices-for-nft-data. Services like Pinata or Filebase pin for you. Use ipfs:// in the contract, not a specific gateway URL like https://gateway.pinata.cloud.
- **Arweave** offers paid permanent storage with different guarantees and is often used as a backup.
- **On-chain SVG or code** is possible for small generative work but costs more gas. Autoglyphs stored the algorithm inside the contract at 0xd4e4078ca3495DE5B1d4dB434BEbc5a986197782.
- **Centralized server** is fragile. If the server goes down, the token points to a broken link. The token still exists, the media does not.

Best practice from docs.ipfs.tech is to wrap files in a directory when adding, use CIDv1, prefix with ipfs:// for the canonical link, and generate gateway URLs only in your app's presentation layer. Pin the media and JSON with at least one paid pinning service and, if possible, your own node.

### Marketplaces and who controls the contract

You have two main paths.

**Open deploy with your own contract.** Tools like Manifold Studio and OpenSea Studio let you deploy a Creator Contract you own. With Manifold, you choose ERC-721 or ERC-1155, you control mint permissions, metadata updates, and royalty settings, and you can add extensions for custom drops. The contract stays reusable for future releases. Docs: docs.manifold.xyz and help.manifold.xyz/en/contract-deploy. Manifold Creator Contracts use a delegate proxy to the Creator Core implementation and support mint, tokenURI, transfer checks, burn, and royalty configuration per token or per extension.

With OpenSea Studio, you have two modes documented at support.opensea.io/en/articles/8867080-how-do-i-use-opensea-studio:

- **Open Collection** uses ERC-1155. You mint directly into your own wallet, items show immediately, and you set supply per item. Use supply 1 for a unique 1-of-1. This is best for beginners or gradual releases.
- **Scheduled Drop** uses ERC-721. Buyers mint into their own wallets during timed stages. You can configure up to five presale stages plus a required public stage, each with price, per-wallet limit, and allowlist. Allowlist CSV must be headerless, use full 0x addresses, no ENS, no duplicates, up to 30,000 addresses per stage. The public stage is always last and cannot be deleted. Maximum stage duration is 365 days. After deployment you open Media and Metadata, upload up to 10,000 files in JPG, PNG, SVG, or GIF plus a CSV that maps media to tokenIds, set a pre-reveal image, and call Reveal after mint ends. Supply cannot be increased through Studio after minting begins. Increasing it directly on chain can cause OpenSea to delist the collection.

In late 2023 OpenSea removed free lazy minting. As of October 3, 2023, creators deploy their own contract and pay gas to mint. OpenSea Studio currently supports Ethereum, Base, Polygon, Klaytn, Arbitrum, Optimism, and Avalanche for many flows. Check opensea.io/learn/nft/how-to-create-an-nft and support.opensea.io/en/articles/8867023-how-do-i-create-an-nft for the current list. For collections, you cannot move tokens between collections later, so confirm the collection before deploying.

**Curated galleries.** SuperRare accepts artists by application and review. Only invited artists can mint there, and work is typically 1-of-1. Info: help.superrare.com/en/articles/10629742-offers-auctions-and-pricing. Foundation, which was a large curated platform from 2021, closed permanently. The platform went offline on April 27, 2026 after its sale to Blackdove did not complete, as stated at foundation.app and in the founder letter of April 15, 2026. Its contracts remain on chain and media stays pinned through April 27, 2027, but you cannot mint there now.

For most beginners, deploying on Base via Manifold or OpenSea Studio is the lowest cost path with full contract ownership. Apply to SuperRare later once you have a coherent body of work and consistent sales.

### Gas fees in practice

Ethereum gas is the price you pay for computation. Since EIP-1559, a transaction fee is base fee plus priority fee, often shown as maxFeePerGas and maxPriorityFeePerGas. The base fee is set by protocol and burned on Ethereum. The priority fee is a tip to the validator who includes your transaction. A basic ETH transfer uses 21,000 gas. Minting uses more. Docs: ethereum.org/developers/docs/gas and github.com/ethereum/EIPs/blob/master/EIPS/eip-1559.md.

Costs move with congestion and with ETH price. As a current reference:

- Ethereum mainnet after the 2024 to 2025 upgrades often shows base fees well under 1 gwei in quiet periods, so a simple transfer can be cents, but a contract deployment or mint during a busy drop still costs dollars. Always check a live tracker like Etherscan Gas Tracker before signing.
- Base uses EIP-1559 with a minimum base fee of 0.005 gwei (5,000,000 wei) and two components, an L2 execution fee and an L1 security fee for posting data to Ethereum. Docs: docs.base.org/base-chain/network-information/network-fees. At $2,000 ETH, a 200,000 gas transaction is about $0.002 for the L2 part. Observed Base costs in early 2026 were about $0.007 for a transfer, $0.017 for an ERC-20 transfer, and $0.04 to $0.05 for a standard ERC-721 mint, rising to $0.10 during local congestion. Base sets elasticity to 6 and base fee change denominator to 125, so the fee can rise at most 4 percent per block, about 36 seconds to double. Fees can be 3 to 5 times higher for a few minutes during a featured Coinbase drop.

Takeaway: if you want to experiment cheaply, launch the collection on Base or another low-fee Layer 2. Reserve Ethereum mainnet for higher value 1-of-1 work where collector preference for mainnet matters.

### Royalties and creator earnings

EIP-2981 defines royaltyInfo to signal a recipient and amount, for example 5 percent to an address. It is a lookup, not enforcement. The token transfer itself does not know if it was a sale. Marketplaces must decide to honor the signal. Spec: eips.ethereum.org/EIPS/eip-2981.

In practice:

- OpenSea supports two lanes. If you deploy in OpenSea Studio after 10:00 a.m. PT on April 2, 2024, or you use an ERC721-C or ERC1155-C compatible custom contract, you can enforce creator earnings via Seaport v1.6 hooks. Enforcement works on OpenSea and on marketplaces using Limit Break Payment Processor, currently including Magic Eden. The maximum you can set in OpenSea is 10 percent. For older or non-compatible contracts, earnings are optional and the buyer chooses at checkout. Source: support.opensea.io/en/articles/8867026-how-do-i-set-creator-earnings-on-opensea, opensea.io/blog/articles/creator-earnings-erc721-c-compatibility-on-opensea, and docs.opensea.io/docs/creator-fee-enforcement. Seaport 1.6 was enabled by the March 13, 2024 Dencun upgrade.
- SuperRare enforces royalties at the contract level. Primary sale split is 85 percent to the artist, 15 percent to the SuperRare DAO Treasury. Secondary sale is 90 percent to the seller, 10 percent to the original artist as royalty, plus a 3 percent marketplace fee paid by the buyer. Source: help.superrare.com.
- Many open marketplaces made royalties optional in 2022 to 2023 to attract traders. Expect lower or zero royalty payment on those venues. Plan your collection economics around primary sales and direct collector relationships. OpenSea notes that if you enforce earnings, sales are only supported on OpenSea and Payment Processor venues, and it will match the lowest royalty you set elsewhere.

## Pros and cons

### Where a collection helps

- Direct sale and provenance. You can sell a themed set to a global collector base without gallery consignment and give buyers a public record of mint, editions, and transfer history under one contract.
- Custody and portability. A collector holds the token in their wallet and can list on any compatible marketplace that supports the contract.
- Programmable terms. You can set edition size, allowlist stages, delayed reveals, or dynamic updates via extensions if your contract supports them.
- Batch efficiency with ERC-1155. One contract can govern many types with batch mint and batch transfer in a single transaction, which reduces gas for large distributions.
- Low cost experimentation on Layer 2. Base and similar networks let you deploy and mint for cents, so you can test pricing and audience without large upfront risk.

### What to watch for

- Thin demand. Trading volumes peaked near $25 billion per year in 2021 to 2022 per DappRadar. By early 2025, monthly volumes reported by The Defiant fell to about $23.8 million. Most new collections get little attention and many assets become illiquid.
- Royalties are not guaranteed. EIP-2981 is a signal. Only specific contract setups plus marketplace support make fees enforceable, and only on those routes.
- Storage risk. Media can break if you rely on a single server or unpinned IPFS. Keep at least one pinned backup and avoid gateway URLs in the contract.
- Rights are limited by default. Buying the token does not transfer copyright. Unless your license says otherwise, the buyer gets the token and a personal display license.
- Irreversible choices. Contract name and symbol cannot be changed after deployment on OpenSea Studio. Supply increases through Studio after mint starts are not allowed. Early on-chain history is permanent.
- Security and support burden. You manage keys, approvals, gas timing, and collector questions. A bad approval can move assets. There is no password reset. Use revoke.cash to remove stale approvals.
- Tax and compliance. In the US, primary sales and royalties are ordinary income when received, often reported on Schedule C if you operate as a business, and subject to self-employment tax. Secondary sales of collected work are capital gains. Brokers report many dispositions on Form 1099-DA from 2025 transactions onward. Keep records for every mint, sale, and gas payment. This is general information, not tax advice. Confirm with a professional.

## How to get started: a practical checklist

### 1. Define the concept and supply before you mint

Choose one visual direction and make ten to twenty finished pieces in that style before minting anything. For a generative collection, lock the algorithm and test at least 200 outputs. Decide if each piece is 1-of-1 (ERC-721) or an edition (ERC-1155), what total supply makes sense (many curated collections use 200 to 1,000, open tests on fxhash often use 64 to 512), and what traits define rarity. A small, coherent series is easier to explain and price than scattered singles.

Write a one-sentence pitch, a short description, and a trait sheet. List trait types and values, for example Background, Palette, Structure, and set approximate percentages. This becomes your metadata attributes.

### 2. Prepare art and metadata that will not break

- Export files to marketplace limits. Most accept PNG, JPEG, GIF, SVG, MP4, and GLB under 100 MB per file. Keep the master files and checksums in a separate backup. Do not mix PNG and MP4 in one OpenSea Open Collection.
- Build the JSON for each token with name, description, image as ipfs://CID, and attributes. Validate that every JSON resolves and that the image loads from multiple gateways before mainnet.
- For a reveal collection, prepare two sets: the pre-reveal placeholder image and the final images plus CSV mapping of tokenId to file. OpenSea recommends CSV for drops and provides a 50-item example ZIP as a template. Studio CSV uploads currently support string traits only.

### 3. Choose your chain and contract strategy

- For affordable testing, choose Base. For higher value 1-of-1 art where collectors prefer Ethereum, choose Ethereum. You can run the same contract model on both later and many teams launch on Base first, then do a smaller Ethereum edition.
- If you want full control and portability, deploy a Manifold Creator Contract or an OpenSea Studio contract you own. Avoid shared factory contracts for work you hope to keep long term. With Manifold you pick ERC-721 for distinct pieces or ERC-1155 for editions and batching. With OpenSea you pick Open Collection for ERC-1155 gradual mints or Scheduled Drop for ERC-721 timed sales.
- Record the contract address, token standard, and chain in your own notes. This is your source of truth. Never trust a contract address from a search ad.

### 4. Set up wallets, funds, and testnets correctly

- Install MetaMask or similar, create a new wallet, write the 12-word phrase on paper, store it offline, and test recovery on a second device before funding.
- Add the networks you will use, Ethereum and Base at minimum, plus Polygon or others if your audience uses them.
- Fund with a small amount of ETH from a reputable exchange, then send a tiny test transaction. Verify you can see it on Etherscan or Basescan.
- Test on a testnet first, Sepolia for Ethereum or Base Sepolia for Base, to catch URI errors without spending mainnet funds. Get Sepolia ETH from a faucet and practice the full deploy and mint flow.

### 5. Upload and pin storage that lasts

- Upload images to IPFS as a directory, get the CID, insert ipfs://CID/filename into your JSON metadata, then upload the JSON directory and capture its CID. That JSON CID plus filename is your tokenURI.
- Pin the media and JSON with at least one paid pinning service and, if possible, your own node. Do not use a single HTTP gateway URL in the contract. For work that must stay for years, add Arweave as a second copy and keep local masters with hashes so you can re-pin if a service closes.
- Test resolution on ipfs.io, dweb.link, and a dedicated gateway. Check that wallets like MetaMask and marketplaces show the preview correctly.

A note on NFT.Storage: Classic NFT.Storage stopped accepting new uploads in July 2024 and its successor paths have wound down. The IPFS concepts still hold, but you should pin with an active service you control now, not rely on legacy free storage.

### 6. Deploy the contract and mint

**Using OpenSea Studio as a reference, the flow documented at support.opensea.io is:**

For an Open Collection (ERC-1155, mint to yourself):

1. Go to Studio, click Create new, then Create Collection. You cannot move tokens between collections later.
2. Deploy the smart contract. Add logo, contract name, symbol, and choose the chain. Sign the deployment transaction and pay gas. Contract name and symbol cannot be changed after deployment.
3. Edit collection details and set creator earnings, up to 10 percent, and a payout address.
4. Go to the Media and Metadata tab, upload the media, set name and supply. Supply 1 makes a 1-of-1. Higher supply makes identical copies under ERC-1155. Add description and traits if needed.
5. Click Mint, approve the transaction in your wallet, and wait for confirmation. Verify the token on the explorer and in your wallet.
6. Add more items later via the Upload tab as the collection grows.

For a Scheduled Drop (ERC-721, buyers mint):

1. From Studio, click Create new, select Scheduled Drop, deploy the contract, and set earnings.
2. Open Drop Setup, choose the format, set Number of items and Mint start date and time. You can edit the start time until the drop begins, but every schedule change costs gas.
3. Create stages. You must have a public sale stage as the final stage. Add up to five presale stages with their own price, per-wallet limit, and allowlist CSV. Remember additive allowlist behavior: a wallet's limits stack across stages.
4. In Media and Metadata, select Upload, add up to 10,000 media files plus the CSV, check View/Edit for names and traits, and set the pre-reveal image.
5. After mint ends, if the collection did not mint out, reduce supply to the number actually minted, then click Reveal, wait for the IPFS upload, and sign Complete Reveal.

With Manifold, the steps are similar: deploy a Creator Contract at studio.manifold.xyz, choose ERC-721 or ERC-1155, add ASCII branding and symbol, deploy, then mint through Studio or through an extension you register for staged drops like open editions, burn-to-redeem, or ranked auctions. See help.manifold.xyz and docs.manifold.xyz. With Manifold you can also deploy an extension contract and call registerExtension on your Creator Core to add custom claim logic.

Test the contract on an explorer. On Etherscan or Basescan confirm the contract is verified, holders look correct, and tokenURI returns valid ipfs:// JSON.

### 7. Price, list, and set earnings correctly

- Research comparable sales on the same chain, not only headline outliers like Beeple at Christie's on March 11, 2021 for about $69 million or Bored Ape Yacht Club mints at 0.08 ETH in April 2021. Those set a record, not a median.
- For a first collection on Base, 0.01 to 0.05 ETH or a fixed dollar price like $20 to $60 in USDC is a common test range. Open editions on Zora or Base often test at 0.001 to 0.01 ETH. On Ethereum 1-of-1 collections, many emerging artists start at 0.1 to 0.5 ETH and adjust after the first few sales. List one price, see response, then change. Do not undercut your own early collectors without a clear reason.
- If you used a post-April 2024 OpenSea Studio contract or an ERC721-C or ERC1155-C contract, turn on Enforce earnings to require the fee on supported routes. Be aware this limits sales to OpenSea and other Payment Processor venues like Magic Eden, and OpenSea will match the lowest royalty you set elsewhere. If you use an older contract without that capability, treat royalties as optional and focus on primary pricing.
- Set the payout address to a wallet you control and test a small withdrawal. For shared collections, use a multisig or a split contract and document it.

### 8. Build distribution that respects your time

X is still the primary discovery channel for NFT collections. Post progress shots, explain the idea behind the work, and reply to other artists and collectors with specific comments. Relying only on mint announcements rarely works. You need a small group of collectors who like your niche, not a large follower count.

Keep a simple site or mirror page with your contract address, chain, total supply, mint price, license, and contact. Document your license in plain language: personal display only, commercial use to a limit, or full transfer. For many art collections, buyers get a display and personal use license but not the underlying art copyright. If you do not state it, assume no copyright transfer.

Track every transaction from day one: deployment gas, mint gas, marketplace fees, platform splits, sale proceeds in ETH and fiat value at time of receipt, and royalty payments. US creators should plan for ordinary income treatment of primary and royalty receipts, Schedule C if active and continuous, and keep receipts for gas and software as possible deductions. Confirm with a CPA. Keep a CSV of tokenId, buyer address, price, date, and tx hash for audits.

### Common mistakes to avoid

- Minting before the series is coherent. Early on-chain history is permanent and hard to explain.
- Choosing the wrong standard. Do not use ERC-721 for 500 identical copies when ERC-1155 would batch. Do not use ERC-1155 when collectors expect distinct ERC-721 provenance.
- Storing the phrase online or sharing it with support accounts that ask for it. No legitimate team will ask for it.
- Using a single centralized image link with no pin. The token remains, the image goes missing.
- Approving unlimited operator access to an unfamiliar site. Use revoke.cash to remove stale approvals.
- Changing supply or price after collectors have paid without clear communication. On drops, lowering supply after mint starts is permanent and can affect listings.
- Setting a 10 percent royalty and expecting it everywhere. On many routes it will be ignored. Test your contract on the marketplaces you care about before promising payouts to collaborators.

## FAQ

**What does it cost to create an NFT collection in 2026?**

Software cost is low. The direct cost is gas plus pinning. Deploying a standard ERC-721 contract and minting one token on Base can be under $0.50 in total at quiet base fees, based on the 0.005 gwei minimum and observed ranges of $0.04 for a mint. A 100-item collection on Base might be $4 to $10 in mint gas plus deployment. The same actions on Ethereum mainnet vary from a few dollars to tens or hundreds of dollars depending on congestion. A custom ERC-721 deploy on Base is often $1 to $5, on Ethereum $40 to $250. Add about $5 to $20 per month for pinning if you use a paid service, plus time for art, metadata, and support.

**Should I use ERC-721 or ERC-1155 for my collection?**

Use ERC-721 if each piece must be distinct with one owner per tokenId, such as PFPs, 1-of-1 art, or numbered editions where each tokenId has its own metadata. Use ERC-1155 if you need editions, batch transfers, or to manage many token types in one contract, such as a game where one id is a sword with supply 1,000 and another is a consumable with supply 10,000. For photography with 25 identical prints of one image, ERC-1155 is more gas efficient. For a PFP set where every trait combination is unique, ERC-721 is simpler and has broader marketplace familiarity.

**Where should a new creator launch a collection first?**

Start where you can own the contract and test cheaply. Deploy your own contract via Manifold or OpenSea Studio on Base, mint a small set to your wallet, then list on OpenSea which indexes Base and Ethereum. This gives you ownership and reach without curation delay. For open editions or free mints, Zora on Base is a common low-cost path. After you have consistent sales and a clear style, consider curation on SuperRare for 1-of-1 work. Do not plan around Foundation, which went offline on April 27, 2026.

**What is the difference between an OpenSea Open Collection and a Scheduled Drop?**

Open Collection uses ERC-1155 and mints directly into your wallet. Items show immediately after upload and mint. Scheduled Drop uses ERC-721 and lets buyers mint into their own wallets during timed stages. Drops support bulk upload up to 10,000 files, presale stages and allowlists, and a delayed reveal. If you want a timed sale where the community mints, use a Drop. If you want to mint gradually yourself and list later, use an Open Collection.

**Can I guarantee royalties on every resale of my collection?**

No. ERC-2981 lets you signal the amount, but only contract-level enforcement plus marketplace support makes it required, and only on those supported paths. On OpenSea, that means a post-April 2024 Studio contract or an ERC721-C or ERC1155-C contract with enforcement turned on, which then limits sales to OpenSea and other Payment Processor venues like Magic Eden. SuperRare enforces 10 percent on its own platform. Elsewhere, sellers may pay zero. The top 10 collections have earned over $345 million in royalties since inception, but that figure reflects early enforcement that later became optional on many venues.

**Do I keep copyright when someone buys from my collection?**

Yes, by default you keep it. The buyer owns the token and typically a license to display the art personally. You keep reproduction and commercial rights unless a written license transfers them. Put the license in the project docs and in each token description. Common choices are personal display only, limited commercial use up to a cap like $100,000, or full commercial rights as with some PFP projects. Be explicit, because "owning the NFT" does not equal owning the art copyright.

**What file storage should I trust for a collection?**

Pin to IPFS with at least one independent pin and test resolution on multiple gateways. Wrap files in a directory so filenames are preserved, use CIDv1, and store ipfs:// in the contract. For work that must stay for years, add Arweave as a backup. Avoid pointing only to a single domain you control, and keep local masters with hashes so you can re-pin if a service closes. Foundation has said it will keep its IPFS gateway pinned through April 27, 2027, but you should still copy your own media now and not rely on any single gateway.

**How do I know if a collection is legitimate before I buy or collaborate?**

Copy the contract address from the official site or verified social account, check it on Etherscan or Basescan for a verified contract, review the holders and transfer history, and inspect the tokenURI. An ipfs:// CID that resolves widely is a better sign than a single https link. A non-verified contract that asks for unlimited approvals is a red flag. For generative collections, verify that the hash is the only randomness source and that library versions are pinned.

**Are NFT collections still a viable path in 2026?**

There are durable roles tied to NFT tech, but fewer speculative ones than in 2021. Developers who know Solidity, gas optimization, and ERC-721 and ERC-1155 patterns work on minting tools and games. Product, community, design, and operations roles exist and follow market cycles. As a solo creator, treat the first six months as testing and community building with modest sales expectations, not as a full salary replacement. Prioritize teams and collectors with real usage, clear licensing, and audited contracts, and keep costs low by building on Layer 2 first.

**What should I read next on this site?**

Start with /what-are-nfts for the underlying standards, /what-is-a-blockchain for ledger basics, /what-are-smart-contracts for how contracts execute, /generative-art-and-nfts for long-form generative mechanics, and /how-to-choose-a-crypto-wallet for custody. For pricing and rights, see /nft-artist-royalties. For a single-piece workflow, see /how-to-become-an-nft-creator.

## Verifiable Primary Sources & References

1. [Ethereum EIP-20 Token Standard Specification](https://eips.ethereum.org/EIPS/eip-20)
2. [Ethereum EIP-721 Non-Fungible Token Standard Specification](https://eips.ethereum.org/EIPS/eip-721)
3. [Ethereum EIP-1155 Multi-Token Standard Specification](https://eips.ethereum.org/EIPS/eip-1155)
4. [Ethereum EIP-1559 Fee Market Change Specification](https://eips.ethereum.org/EIPS/eip-1559)
5. [Ethereum EIP-4844 Proto-Danksharding Specification](https://eips.ethereum.org/EIPS/eip-4844)
6. [Ethereum EIP-2981 NFT Royalty Standard Specification](https://eips.ethereum.org/EIPS/eip-2981)
7. [Ethereum Official Yellow Paper & Protocol Specification](https://ethereum.github.io/yellowpaper/paper.pdf)
8. [Ethereum Consensus Specs & Proof of Stake Architecture](https://github.com/ethereum/consensus-specs)
9. [Solidity Compiler Official Documentation & Language Spec](https://docs.soliditylang.org/)
10. [Foundry Book Development & Testing Framework Documentation](https://book.getfoundry.sh/)
