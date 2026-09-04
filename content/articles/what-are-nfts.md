---
title: What are NFTs? An Explainer for Non-Fungible Tokens
image: /images/austin-distel-tLZhFRLj6nY-unsplash.jpg
description: >-
  NFTs have taken the world by storm. This guide explains what Non-Fungible
  Tokens are, how they work, and why they represent a breakthrough in digital
  ownership.
category: Industry Insights
data-ai-hint: nft explainer
publishedDate: '2026-03-11'
lastUpdated: "2026-09-04"
---
## What is an NFT

An NFT is a unique token recorded on a [blockchain](/what-is-a-blockchain) that proves ownership of a specific item. Unlike one bitcoin that equals any other bitcoin, each NFT is distinct and cannot be swapped one-for-one.

Think of it as a digital deed. The deed itself lives on the blockchain, while the item it points to can be digital art, a game item, a ticket, or a record of attendance. Owning the deed does not always mean you own copyright to the art. It means you own that one token, with a verifiable history of who created it and who held it before you.

## Who this guide is for

This guide is for you if you are new to [Web3](/what-is-web3) and want a clear, no-hype explanation before you buy, build, or evaluate work in NFTs. It is useful if you are:

- A creator or artist weighing whether to mint work on chain
- A developer learning token standards for the first time
- A product, community, or marketing professional assessing NFT projects for a job or partnership
- A collector who wants to avoid common mistakes around storage, royalties, and rights

If you only need exposure to NFTs for a specific role, skip to the sections on how they work and the trade-offs. If you plan to mint or trade, read the practical steps at the end.

## How NFTs work

### The ledger and the token ID

Most NFTs live on Ethereum, though they also exist on Solana, Polygon, Base, and others. The blockchain acts as a public ledger. When an NFT is minted, the ledger creates a record with the contract address and a `uint256` tokenId. That pair must be globally unique. Anyone can look up who owns which tokenId and see its transfer history.

The proposal that defined this model is ERC-721, proposed in January 2018 by William Entriken, Dieter Shirley, Jacob Evans, and Nastassia Sachs. It is documented at [eips.ethereum.org/EIPS/eip-721](https://eips.ethereum.org/EIPS/eip-721) and summarized on [ethereum.org/developers/docs/standards/tokens/erc-721](https://ethereum.org/developers/docs/standards/tokens/erc-721).

### Smart contracts: ERC-721 and ERC-1155

You do not create an NFT by uploading a file alone. You deploy or interact with a [smart contract](/what-are-smart-contracts) that implements a token standard.

- **ERC-721**is for strictly unique items. One contract tracks many distinct NFTs. Each tokenId has one owner. This is the standard behind most art and profile picture collections, including Bored Ape Yacht Club and CryptoKitties.

-**ERC-1155**is a multi-token standard. One contract can manage fungible tokens, non-fungible tokens, and semi-fungible items together, and it allows batch transfers in a single transaction. This is common in games that need currency, consumable items, and rare collectibles in the same system. The standard is described at [ethereum.org/developers/docs/standards/tokens/erc-1155](https://ethereum.org/developers/docs/standards/tokens/erc-1155).

Both standards include functions to transfer tokens, check balances, approve operators, and signal ownership changes through events like `Transfer`. Minting and burning are not part of the core ERC-721 spec. Those are added by the contract author.

### Metadata and tokenURI

The contract does not usually store the image itself. It stores a link called `tokenURI` that points to a JSON file with metadata. The ERC-721 metadata JSON schema includes fields such as `name`, `description`, and `image`, where `image` is a URI to the media file. Wallets and marketplaces read this JSON to display the NFT.

Example pattern from the spec:

```json
{
  "name": "Example Piece #123",
  "description": "Description of the item this token represents",
  "image": "ipfs://bafybeib.../image.png"
}
```

If the metadata or image link breaks or is changed without notice, the token still exists but may show a broken image. This is a design choice, not a blockchain failure. Some projects accept mutability for assets that should update, such as a house deed image. Most art projects aim for immutability.

### Where the file lives

Because storing large files on Ethereum is expensive, files are usually stored off chain and referenced by hash. Common options:

-**IPFS with pinning.**The file is added to the InterPlanetary File System and addressed by a CID, a cryptographic hash of the content like `ipfs://bafybeib...`. IPFS is peer to peer, so the file only stays available if someone pins it. Pinning means a node promises to keep the data. Without pinning, garbage collection will eventually delete it. Official guidance is at [docs.ipfs.tech/how-to/best-practices-for-nft-data](https://docs.ipfs.tech/how-to/best-practices-for-nft-data/). Services like Pinata or NFT.Storage pin on your behalf, or you can run your own IPFS nodes. Use `ipfs://` in the contract, not a specific gateway URL like `https://gateway.pinata.cloud/ipfs/...`, so wallets can resolve through any gateway.

-**Arweave or Filecoin**for longer term paid storage with different guarantees.

-**On-chain storage**for small generative art where the code or SVG is stored fully in the contract. This costs more gas but removes external links.

-**Centralized server or cloud storage.** This is cheapest and fastest but reintroduces a single point of failure. If the server goes down, the NFT points to nothing.

### Minting and transfers

Minting calls a function in the contract that assigns a new tokenId to your wallet and sets its tokenURI. You pay a network gas fee for the transaction. Fees vary by chain and congestion. Transferring or selling the NFT is another on-chain transaction that updates ownership and emits a `Transfer` event. Marketplaces handle approvals: before a marketplace can move your NFT, you must approve its contract as an operator.

## Where NFTs are used, and where they are stretched

### Digital art and collectibles

This is the best known use case. On March 11, 2021, Christie's sold Beeple's *Everydays: The First 5000 Days* for about $69 million, the first purely digital NFT sold by a major auction house. It showed that provenance and scarcity could drive value for digital art, but it is an outlier, not a baseline.

Bored Ape Yacht Club by Yuga Labs is a 10,000-item profile picture collection on Ethereum. It minted at 0.08 ETH in April 2021 and sold out within about 12 hours. Each ape also acted as a membership card with access to private channels and events. Floor price peaked around 145 ETH in early May 2022, then fell sharply in the bear market. As with most 2021-era collections, prices since 2024 have remained far below peak, with typical floor prices in single-digit ETH and day-to-day changes that make any fixed dollar figure quickly out of date.

Takeaway: art and collectibles prove the tech, but most lose value. Treat trading volume from 2021 to 2022, about $25 billion in organic volume per year per DappRadar reports, as a historical peak driven by speculation, not a norm.

### Gaming

Games use NFTs for characters, items, or land that players own in their wallet and can trade outside the game's internal market. Axie Infinity pioneered this in 2021 with Axies as ERC-721 tokens on its Ronin sidechain, plus its SLP and AXS tokens. The model showed that ownership can matter to players, but it also showed fragility. SLP inflated because it was minted with every battle, and the economy depended on new entrants. Interoperability is also limited. A sword earned in one game rarely works in another without explicit integration by both game studios. ERC-1155 helps by letting one contract manage currency, items, and unique gear with batch transfers, which lowers gas costs for active games.

### Membership, tickets, and identity

- **Membership:**an NFT as an access pass to a community, course, or software feature. Value depends on what the membership actually provides.
-**Tickets:**an NFT ticket can reduce counterfeiting and allow controlled resale with rules set in the contract.
-**Proof of attendance and identity:**POAP delivers free NFTs for attending an event, ENS names map readable names to addresses, and some universities have experimented with verifiable credentials. These use cases work because the token is a simple, verifiable record, not because the image is scarce.

### Tokenized real-world assets

Projects are testing NFTs that represent property titles, club shares, or serial numbers for physical goods like trading cards. This remains early. Legal recognition, custody, and redemption are handled off chain, so the token alone does not guarantee enforceable ownership without supporting contracts and jurisdiction-specific law.

## Pros and cons: the trade-offs

### What NFTs do well

-**Verifiable ownership and provenance.**Anyone can confirm who minted the token, who owned it, and when it moved, without asking a company to share a private database.
-**User custody.**The holder controls the token in a non-custodial [wallet](/how-to-choose-a-crypto-wallet) and can sell it on any compatible marketplace, not only the issuer's site.
-**Programmable signals for royalties.**EIP-2981 defines `royaltyInfo(uint256 _tokenId, uint256 _salePrice)` to return a recipient and amount. Any marketplace can query it. It is a simple building block, not enforcement. See [eips.ethereum.org/EIPS/eip-2981](https://eips.ethereum.org/EIPS/eip-2981).
-**Composability.**Because NFTs use open standards, other apps can build on them. An NFT from one project can be read by wallets, explorers, and DeFi protocols without custom deals.

### What to watch out for

-**Royalties are voluntary.**EIP-2981 signals what the creator asks for, but the core ERC-721 `transferFrom` cannot force a payment during a sale. Marketplaces decide. In 2022 to 2023, competing marketplaces such as X2Y2, SudoSwap, and Blur made royalties optional or as low as 0.5 percent to attract traders. OpenSea announced on August 17, 2023 that it would retire its Operator Filter enforcement tool and make creator fees optional for new collections starting August 31, 2023, keeping enforcement only for some existing collections through February 29, 2024. Creator royalty income fell across the market as a result.
-**Links can break.**If the image is on a single server or unpinned IPFS node, the token may survive while the media disappears. Check storage method before you buy.
-**Copyright stays with the creator by default.**Buying an NFT usually gives you the token and a license to display the art for personal use, not the copyright. The artist retains reproduction and commercial rights unless a written license transfers them. Some projects grant commercial rights up to a cap, such as the early CryptoKitties license, but this is project-specific and must be in the terms.
-**UX and custody risk.**You manage seed phrases, private keys, gas fees, and contract approvals. A wrong approval can let a malicious contract move your assets. There is no password reset.
-**Market volatility and quality.**The 2021 to 2022 boom filled marketplaces with low effort collections. Many now have near zero liquidity. Past sale price does not predict future demand.
-**Energy use changed with Ethereum.**Ethereum switched from proof of work to proof of stake on September 15, 2022 in an event called The Merge. According to [ethereum.org/roadmap/merge](https://ethereum.org/roadmap/merge), energy use fell by about 99.95 percent. Minting on Ethereum today is not comparable to pre-Merge mining. Other chains such as Tezos, Flow, and Solana also used low-energy consensus before and after The Merge.
-**Legal gaps.**Tax, securities, and consumer protection rules for NFTs vary by country and are still evolving.

## How to use, buy, create, and stay safe

### Set up a wallet first

Use a non-custodial wallet such as MetaMask, Rabby, or Phantom. Write down the seed phrase offline and never share it. For amounts you cannot afford to lose, consider a hardware wallet. On a new wallet, practice with a small transaction on a testnet or low-fee chain before moving larger sums.

### Buying checklist

1.**Verify the contract.**Go to the project's official site or official social account and copy the contract address. Check it on Etherscan or the relevant explorer. Look for a verified contract and the correct `tokenId` range. Fake collections often use similar names.
2.**Check storage.**Look at the tokenURI and image link. An `ipfs://` URI with a CID that resolves on multiple gateways is more durable than a single-domain `https://` link.
3.**Review rights.**Read the license in the project docs. Does ownership give you personal display only, commercial use to a limit, or full transfer of copyright? If nothing is stated, assume no rights transfer.
4.**Compare across marketplaces.**OpenSea, Blur, and Magic Eden show different liquidity and fees. Historical volume leaders change. Check that the listing is on a marketplace that respects creator royalties if that matters to you or the creator.
5.**Check approvals.**After buying, revoke unnecessary operator approvals in your wallet or on a tool like revoke.cash.

### Creating checklist

1.**Choose the standard.**Use ERC-721 for one-of-one art where each piece should be distinct. Use ERC-1155 if you need editions, batches, or fungible elements such as game currency in the same contract.
2.**Prepare metadata correctly.**Generate images, upload them to IPFS, get the CID, insert `ipfs://CID` into the JSON, then upload the JSON and record its CID as the tokenURI. Validate JSON syntax and that the image resolves.
3.**Implement EIP-2981 if you want to signal royalties.**Add `royaltyInfo` to your contract and register the interface ID `0x2a55205a`. Understand that this is a request, not enforcement, and that marketplaces may ignore it.
4.**Plan pinning and longevity.**Decide who pins the data and for how long. If you use a pinning service, keep at least one backup pin or your own node.
5.**Test on testnet.**Mint, view in a wallet, list, and transfer on a test network before mainnet. This catches URI errors without wasting gas.

### Red flags to avoid

- Anonymous team that refuses any proof of work or funds history, plus promises of high returns
- Roadmap that changes every few weeks or that relies only on future mints for revenue
- Art copied from other collections or pulled from AI generators without disclosure
- Contract that is not verified on the block explorer, or that requests unlimited approvals

### Security habits

- Never sign a blind signature that lets an operator move all your tokens.
- Keep high-value NFTs separate from your daily trading wallet.
- Confirm gas and recipient address on every transaction. Scam sites mimic real mint pages exactly.

## FAQ**Do I own the artwork copyright when I buy an NFT?**No, not by default. You own the token. Copyright remains with the creator unless a written license or assignment says otherwise. Check the project's license before you assume you can print, merchandise, or license the image.**Where is the NFT image actually stored?**Usually outside the blockchain. The contract holds a URI to JSON metadata, which holds a URI to the media. That media may be on IPFS with a CID, on Arweave, on a centralized server, or in rare cases fully on chain. Only on-chain storage keeps the media inside the blockchain itself.**Do NFTs still use a lot of energy?**On Ethereum, no longer at pre-2022 levels. The Merge on September 15, 2022 moved Ethereum to proof of stake and cut network energy use by about 99.95 percent. Individual mint and transfer costs are now small compute transactions, not mining. Other proof of stake chains report single-transaction energy similar to a few web searches. Environmental critiques now relate to broader network use, not NFT-specific mining.**What is the difference between ERC-721 and ERC-1155?**ERC-721 is for unique, non-interchangeable items with one owner per tokenId. ERC-1155 can manage many token types, including fungible and non-fungible items, in one contract and allows batch operations that save gas. Use ERC-721 for art and collectibles where each piece must be distinct, and ERC-1155 for games or systems with large inventories.**Can I force royalties on every resale?**No. EIP-2981 lets your contract signal the royalty you request, such as 5 percent to a wallet address, but ERC-721 transfers do not know if a transfer is a sale. Only the marketplace can collect and forward the fee, and it can choose not to. Some contracts try allowlists that block marketplaces that do not pay, but this limits where buyers can trade and is seen as trade-off between control and openness.**Can someone copy the image behind my NFT?**Yes. Anyone can right-click and save the image. The NFT proves you own the verified token that points to that image with on-chain provenance, not that copies cannot exist. Value comes from that provenance, the community or utility attached, and demand, not from preventing copies.**Are NFTs still a viable career area?**
There are durable roles, but fewer speculative ones than in 2021. Developers who know Solidity, ERC-721 and ERC-1155, gas optimization, and secure contract patterns work on minting platforms and games. Backend and frontend developers build indexers, metadata services, and wallet-connected interfaces. Community, marketing, design, and operations roles exist, yet hiring follows market cycles and is tighter in bear markets. Pick teams with real users, audited contracts, and clear licensing, and avoid projects that cannot explain utility beyond resale.

## Verifiable Primary Sources & References

1. [Ethereum EIP-20 Token Standard Specification](https://eips.ethereum.org/EIPS/eip-20)
2. [Ethereum EIP-1155 Multi-Token Standard Specification](https://eips.ethereum.org/EIPS/eip-1155)
3. [Ethereum EIP-712 Typed Structured Data Hashing and Signing](https://eips.ethereum.org/EIPS/eip-712)
4. [Ethereum Official Yellow Paper & Protocol Specification](https://ethereum.github.io/yellowpaper/paper.pdf)
5. [Ethereum Consensus Specs & Proof of Stake Architecture](https://github.com/ethereum/consensus-specs)
