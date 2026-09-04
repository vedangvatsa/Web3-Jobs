---
title: Generative Art and NFTs - How Code Becomes Collectible Art
description: >-
  Learn what generative art is, how it works with NFTs, and why platforms like
  Art Blocks and fxhash changed collecting. Covers history, on-chain mechanics,
  key projects, trade-offs, and how to start.
category: Educational
data-ai-hint: generative code art
publishedDate: '2026-03-11'
lastUpdated: "2026-09-04"
---
Generative art is art made with a system. The artist writes code that sets rules, adds controlled randomness, and then lets the system produce the output. An NFT is a unique token on a blockchain that records ownership of that output.

Together they create long-form generative art. The artist publishes an algorithm on chain. Each collector mint generates a new hash. That hash seeds the algorithm to create a one-of-one piece no one has seen before, including the artist.

## Who this is for

This guide helps three groups:

* **Artists and creative coders** who want to understand how generative systems become NFTs and where to publish them.
* **Collectors** who want to evaluate projects beyond floor price, from on-chain storage to trait rarity.
* **Builders and curators** looking at generative art for products, community drops, or museum programs.

If you just want to collect a single piece you like, you can skip the code details and start in the "How to get started" section.

## How generative art became on-chain art

### Early system art before blockchains

Generative art did not start with NFTs. Hungarian artist Vera Molnar began using computers in 1968 to explore order and disorder with plotter drawings. She is widely cited by Sotheby's, the Victoria and Albert Museum, and others as one of the first artists to use computers for art. American artist Sol LeWitt wrote wall drawings as text instructions for others to execute. The instruction was the artwork. That idea maps directly to code. Other early contributors include Frieder Nake, Manfred Mohr, Harold Cohen with AARON, and Casey Reas who co-created the Processing language.

### What changed with NFTs

NFTs gave generative systems a way to produce, record, and trade unique outputs with provenance.

* **ERC-721.** Ethereum's ERC-721 standard, proposed in 2018 by William Entriken, Dieter Shirley, Jacob Evans, and Nastassia Sachs, defines how to create and track unique tokens. Each token has a tokenId, an ownerOf address, and a tokenURI that points to metadata and media.
* **The mint as performance.** Instead of the artist choosing outputs, the collector's mint transaction generates a hash that seeds the script. The same hash always produces the same image. Art Blocks describes this as "art is the algorithm, the algorithm is the art."
* **Storage choices.** Most NFTs store metadata and images off chain on IPFS or Arweave and link to them via tokenURI. Fully on-chain projects store the generator and sometimes the output itself inside the smart contract. On-chain costs more to deploy but survives without external servers.

## How it works on Art Blocks and fxhash

### Art Blocks on Ethereum

Art Blocks launched in November 2020. It was founded by Erick Calderon, known as Snowfro. The platform stores the artist's script on the Ethereum blockchain. When you mint, the chain creates a unique hash. The front end feeds that hash into the script in your browser. The result is deterministic and reproducible from the hash.

Types on Art Blocks have included:

* **Curated.** Reviewed by a curation board for technical and aesthetic rigor.
* **Playground.** For artists who have already had a Curated project.
* **Presents and Collaborations.** Other curated paths and Engine partnerships.

The platform now operates on Ethereum, Arbitrum, and Base. It documents its generator, storage, and minter contracts in public docs at docs.artblocks.io.

### fxhash on Tezos

fxhash launched in November 2021. It was created by generative artist ciphrd as an open, no-curation platform on Tezos. Artists upload HTML, CSS, and JavaScript that renders deterministically from a per-mint hash. Collectors mint iterations of a parent generator. The project was built to lower fees and open access after Ethereum gas prices in summer 2021 regularly added hundreds of dollars to a mint. In 2023 to 2024, fxhash expanded to support EVM chains as well, but Tezos remains its origin and core community.

Both platforms use the same core flow: publish generator, set supply and price, collector mints with a hash, script renders unique output, token records owner and hash on chain.

## Key projects to know

Use these as references when you evaluate new drops. They show different systems, constraints, and markets.

### Autoglyphs by Larva Labs - 2019 - the first on-chain generative art

Autoglyphs was deployed in April 2019 by Matt Hall and John Watkinson of Larva Labs. The team asked if art could be both recorded and created on chain after CryptoPunks. The result is 512 glyphs made of text symbols on a 64 by 64 grid. The generative algorithm lives inside the Ethereum smart contract at 0xd4e4078ca3495DE5B1d4dB434BEbc5a986197782. Each mint ran the code on the Ethereum network itself and stored the ASCII output in the transaction event data.

Details verified on larvalabs.com:

* Supply: 512, capped forever. Generator shut off after the last mint.
* Mint price: 0.2 ETH, about 35 to 40 dollars at the time. Proceeds went to 350.org, totaling about 13,670 dollars.
* Mint duration: sold out in about four hours.
* Gas impact: near the maximum computation per transaction, at one point 13.27 percent of total Ethereum capacity during minting.
* Legacy: Autoglyph #25 is in the permanent collection of the Centre Pompidou. Autoglyph #115 was acquired by the Whitney Museum of American Art in 2024. Larva Labs notes the work draws on LeWitt's instruction art. Today the set is often called the cave paintings of on-chain art.

### Chromie Squiggle by Snowfro - November 27, 2020 - Project #0 on Art Blocks

Chromie Squiggle is the inaugural Art Blocks collection. Each piece is a colorful, flowing line built from segments. Traits vary by type (Normal, Bold, Fuzzy, Slinky, Ribbed, Pipe) and by color behavior such as color spread, steps between colors, and segment count. The collection is capped at 10,000. It was left open for years, with the final token, Squiggle #9999, live-minted starting July 15, 2024 and gifted to the Los Angeles County Museum of Art on August 21, 2024 after a public farewell period.

### Ringers by Dmitri Cherniak - January 31, 2021 - 1,000 pieces

Canadian artist Dmitri Cherniak, based in New York, created Ringers as a study of strings wrapped around pegs. Each output is generated in JavaScript in the browser from a transaction hash. Features include peg count, size, layout, and wrap orientation. The series minted at 0.1 ETH.

Market history shows extreme variance within one series:

* Ringers #109 sold for 2,100 ETH in October 2021, about 6.9 million dollars at the time.
* Ringers #879, nicknamed The Goose, sold at Sotheby's in New York on June 15, 2023 for 6.2 million dollars, with a hammer of 5.4 million dollars. It remains the auction high for the series.

### Fidenza by Tyler Hobbs - June 11, 2021 - 999 pieces on Art Blocks Curated

Tyler Hobbs, a generative artist from Austin, Texas with a BS in Computer Science from the University of Texas at Austin, built Fidenza around a flow field algorithm he had used since 2016. Flow fields create organic, non-overlapping curves. Fidenza adds chunky blocks, probabilistic color palettes (14 palettes prepared for the project), and features such as scale, turbulence, spiral forms, and textured fills. Hobbs calls it his most versatile algorithm as of 2021.

The project is Art Blocks Curated, supply 999. It sold for about 3.3 million dollars for Fidenza #313 in August 2021 (1,000 ETH to collector Punk6529). The series is widely used as a reference for quality control in long-form generative art: varied, yet consistently coherent.

### Other widely collected fxhash projects

fxhash has no curated gate, so curation happened through collecting. Notable examples often cited by volume and critical response include Zancan's Garden, Monoliths (256 mints, December 2021, the platform's top volume project at the time) and William Mapan's Dragons. These use Tezos fees that are typically cents rather than dollars, which let artists test ideas without a large upfront cost.

## Pros and cons to weigh before you mint or build

| Aspect | What works well | What to watch |
| --- | --- | --- |
| Provenance and ownership | ERC-721 records owner, creator, and history on chain. Anyone can verify. | If media is stored off chain on IPFS or a server, that link can break if not pinned on durable storage. Prefer pinned IPFS, Arweave, or fully on-chain. |
| Creative range | One script can produce billions of possible outputs. Collectors co-create by triggering the hash. | Quality control is hard. A weak generator makes many dull outputs. Test the generator's range before minting. |
| Creator royalties | EIP-2981 defines a standard way to signal royalties. Many platforms support it. | Enforcement is per marketplace, not by the token itself. Do not assume royalties apply everywhere you resell. |
| Cost and scale | Tezos and Ethereum Layer 2 options keep mint costs low. Ethereum mainnet gives the largest collector base. | Fully on-chain generators cost more to deploy. Ethereum mainnet mints can still spike during drops. |
| Display and longevity | Generative outputs are often resolution independent and can be re-rendered, plotted, or printed. | Rendering depends on browser and library versions. Pin specific library versions and test live view vs thumbnail. |
| Legal and rights | Many projects give collectors broad display and commercial rights, often described in the project's license. | Rights vary by project. Check the license for each collection. AI training, commercial use, and derivatives differ. |

## How to get started

### As a collector

1. **Set up a wallet.**MetaMask for Ethereum, Arbitrum, and Base is common. Temple or Kukai for Tezos if you use fxhash on Tezos. Back up your seed phrase offline. Never share it.
2.**Add funds.**For Art Blocks you need ETH. For fxhash on Tezos you need XTZ. Start small. Mint fees plus gas are separate from the art price.
3.**Evaluate the generator before you mint.**
   * Open the live view or test mints if the project offers them. Generate 20 to 30 outputs locally if the code is available.
   * Read the project description for supply, mint price, and which hash is used.
   * Check storage: is the script on chain and where does tokenURI point. Art Blocks stores the script on chain. Many fxhash projects do as well.
   * Review traits. On Art Blocks, traits affect rarity and price. On fxhash, the community often tracks traits after launch.
4. **Mint or buy secondary.**
   * Primary: mint from artblocks.io or fxhash.xyz. You get a random hash. You cannot choose the output.
   * Secondary: buy on OpenSea for Ethereum projects or on fxhash secondary and Objkt for Tezos. Verify the contract address matches the official site.
5. **Save and display correctly.**Save a high-resolution render or print via the live view. Note that the canonical view is what the script produces from the hash, not just a cached PNG.

### As an artist

1.**Learn the stack.**Most generative artists use p5.js or plain JavaScript with canvas. Processing veterans use p5.js for web parity. Keep libraries pinned to specific versions.
2.**Build for determinism.**Use the hash provided at mint time as the only source of randomness. Do not use Math.random without seeding from the hash. Art Blocks provides a tokenData field and helpers for this. fxhash provides fxhash and fxrand.
3.**Test range, not just favorites.**Generate at least 200 outputs and sort them into keep, weak, and broken. Adjust parameter probabilities until even lower-tier outputs feel intentional. Fidenza's work on probabilistic palettes and scale mixing is a good model for balancing variety and quality.
4.**Decide storage early.**For durability, store the script on chain and media assets on IPFS or Arweave. If you need fully on-chain visuals, keep the code and assets tiny, as Autoglyphs did.
5.**Plan supply and price.**Supply for Art Blocks Curated often ranges from 200 to 1,000. Open fxhash projects have seen supplies from 64 to 512 for accessible tests and up to 1,000 for larger ideas. Price low for experiments, higher when you can show a strong preview set.
6.**Apply or publish.**
   * Art Blocks Curated requires an application and review. See artblocks.io and docs.artblocks.io for current requirements.
   * fxhash lets you publish directly after testing. No application needed.

## What to check before you pay

* **Is the contract correct.** Confirm the contract address on the project's official page, not a screenshot.
* **What does the license allow.** Display, print, and commercial use differ. Do not assume you own the underlying algorithm.
* **How is royalty handled.** Check if the marketplace you plan to use respects EIP-2981 for that contract.
* **Energy use.**Ethereum switched to proof of stake in September 2022, which the Ethereum Foundation estimates cut energy use by about 99.95 percent. Tezos uses proof of stake with similarly low per-transaction energy. This matters if your team has sustainability reporting.

## Frequently asked questions**What is generative art in simple terms**It is art made by a system the artist builds. The artist writes rules and parameters. The system makes each specific image or animation within those rules.**Why use NFTs for generative art**The NFT records who owns which output, preserves the link to the generator and hash, and lets the market trade outputs without a gallery. The mint transaction itself creates the unique piece.**Is the image stored on the blockchain**Sometimes. Autoglyphs stores the art inside the contract's event data. Art Blocks stores the generator on chain and re-renders the art from the hash on demand. Many projects store only a pointer (tokenURI) to IPFS or Arweave. Ask where the metadata lives for any project you consider.**Who owns the art after I buy**You own the token and the rights the project's license gives you. You usually do not own the code or the right to reuse the generator. Read the license for each collection.**Can I print or plot my piece**Yes for most projects, and many are designed for it. Autoglyphs includes instructions for rendering as a drawing with a plotter. Art Blocks pieces are often printed from the live view. Check resolution options and whether the animation is part of the canonical work.**Do I need to know code to collect**No. You need to evaluate the system like you would any art: range, consistency, and whether average outputs still look intentional. You do not need to read the source.**What makes a generative series good**Collectors often look for three things. First, variety: outputs feel distinct. Second, quality at the low end: even common pieces feel considered. Third, coherence: the whole set reads as one series with a clear visual identity. Fidenza and Ringers are often cited because they score high on all three.**Where do I start with low cost**Open a Tezos wallet and try fxhash with a few XTZ. Mint fees are low, often under one XTZ for many projects, and you can study how hash-seeded rendering works without a large outlay.**Are generative art NFTs still active**
Yes. Art Blocks continues to release curated projects, hosts the annual Marfa Weekend gallery in Texas, and documents its protocol publicly. fxhash continues as an open platform on Tezos and EVM chains. Secondary sales for top series like Fidenza, Ringers, and Chromie Squiggle still report daily floor prices on OpenSea and other marketplaces.

## Verifiable Primary Sources & References

1. [Ethereum EIP-721 Non-Fungible Token Standard Specification](https://eips.ethereum.org/EIPS/eip-721)
2. [Ethereum EIP-2981 NFT Royalty Standard Specification](https://eips.ethereum.org/EIPS/eip-2981)
3. [Ethereum Official Yellow Paper & Protocol Specification](https://ethereum.github.io/yellowpaper/paper.pdf)
4. [Ethereum Consensus Specs & Proof of Stake Architecture](https://github.com/ethereum/consensus-specs)
5. [Solidity Compiler Official Documentation & Language Spec](https://docs.soliditylang.org/)
6. [Uniswap v3 Core Architecture Protocol Whitepaper](https://uniswap.org/whitepaper-v3.pdf)
7. [MakerDAO Technical Documentation & Maker Protocol Specs](https://docs.makerdao.com/)
8. [Curve Finance Automated Market Maker Specification](https://curve.fi/files/stableswap-paper.pdf)
9. [Arbitrum Nitro Protocol Technical Specifications](https://developer.arbitrum.io/)
10. [Base Layer 2 Network Official Documentation](https://docs.base.org/)
