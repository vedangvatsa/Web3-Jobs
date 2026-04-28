---
title: "NFTs: Digital Ownership"
description: "What NFTs actually are, the standards behind them, and real use cases beyond art."
order: 12
readTime: "9 min"
difficulty: "beginner"
prerequisites: ["layer-2-making-blockchains-fast"]
quiz:
  - question: "What makes an NFT 'non-fungible'?"
    options:
      - "It cannot be transferred"
      - "Each token is unique and not interchangeable with another"
      - "It is more expensive than regular tokens"
      - "It can only exist on Ethereum"
    correct: 1
    explanation: "Non-fungible means unique. One USDC is identical to any other USDC (fungible). But each NFT has a unique token ID and can represent something different — a specific image, a concert ticket, or a deed."
  - question: "Where is the image for most NFTs stored?"
    options:
      - "Directly on the Ethereum blockchain"
      - "In the smart contract code"
      - "Off-chain, usually on IPFS or a server, with a link stored on-chain"
      - "In your wallet"
    correct: 2
    explanation: "Storing images on-chain is too expensive. Most NFTs store metadata and images on IPFS (a decentralized file system) or centralized servers. The blockchain only stores the token ID and a link to the metadata."
  - question: "What standard do most NFTs on Ethereum use?"
    options:
      - "ERC-20"
      - "ERC-721"
      - "ERC-1559"
      - "ERC-4626"
    correct: 1
    explanation: "ERC-721 is the standard for non-fungible tokens on Ethereum. Each ERC-721 token has a unique ID. ERC-1155 is a newer standard that supports both fungible and non-fungible tokens in one contract."
  - question: "Which is a real use case for NFTs beyond art?"
    options:
      - "Mining cryptocurrency faster"
      - "Event tickets that cannot be counterfeited"
      - "Speeding up internet connections"
      - "Replacing email"
    correct: 1
    explanation: "NFTs can represent event tickets (verifiable, non-counterfeitable), domain names (Ethereum Name Service), game items (tradeable across platforms), and membership passes (token-gated communities)."
  - question: "What does 'royalties' mean for NFTs?"
    options:
      - "A tax the government collects"
      - "A percentage the original creator earns on every resale"
      - "A fee to mint the NFT"
      - "The price increase over time"
    correct: 1
    explanation: "Some NFT marketplaces enforce royalties — a percentage (often 2.5-10%) of every resale goes back to the original creator. This lets artists earn ongoing revenue from their work."
---

## Beyond the hype

NFTs got famous for $69 million art sales and cartoon apes. Behind the hype, the technology is simple and useful: NFTs let you prove you own a unique digital item on a blockchain.

An NFT is a token with a unique ID. Unlike USDC (where every token is the same), each NFT is one-of-a-kind. The blockchain records who owns it, who created it, and its entire transaction history.

## How NFTs work technically

An NFT is just a number (token ID) stored in a smart contract, linked to a wallet address.

<div class="diagram">
<svg viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:700px">
  <!-- Smart contract -->
  <rect x="200" y="20" width="400" height="160" rx="12" fill="#f8fafc" stroke="#334155" stroke-width="1.5"/>
  <text x="400" y="48" text-anchor="middle" font-size="14" font-weight="bold" fill="#1e293b">NFT Smart Contract (ERC-721)</text>
  <line x1="220" y1="58" x2="580" y2="58" stroke="#e2e8f0"/>

  <text x="240" y="82" font-size="11" font-weight="600" fill="#334155">Token ID</text>
  <text x="370" y="82" font-size="11" font-weight="600" fill="#334155">Owner</text>
  <text x="510" y="82" font-size="11" font-weight="600" fill="#334155">Metadata URI</text>
  <line x1="220" y1="90" x2="580" y2="90" stroke="#e2e8f0"/>

  <text x="240" y="110" font-size="11" fill="#64748b">#1</text>
  <text x="370" y="110" font-size="11" font-family="monospace" fill="#3b82f6">0xA1b2...c3d4</text>
  <text x="510" y="110" font-size="11" fill="#64748b">ipfs://Qm...abc</text>

  <text x="240" y="132" font-size="11" fill="#64748b">#2</text>
  <text x="370" y="132" font-size="11" font-family="monospace" fill="#22c55e">0xE5f6...g7h8</text>
  <text x="510" y="132" font-size="11" fill="#64748b">ipfs://Qm...def</text>

  <text x="240" y="154" font-size="11" fill="#64748b">#3</text>
  <text x="370" y="154" font-size="11" font-family="monospace" fill="#eab308">0xI9j0...k1l2</text>
  <text x="510" y="154" font-size="11" fill="#64748b">ipfs://Qm...ghi</text>
</svg>
</div>

The smart contract is a table. Each row has a token ID, an owner address, and a link (URI) to metadata. The metadata (stored off-chain, usually on IPFS) contains the name, description, and image URL.

When you "buy" an NFT, the smart contract changes the owner field from the seller's address to yours. The blockchain records this permanently.

## Use cases beyond art

| Use case | How NFTs help | Examples |
| --- | --- | --- |
| Art and collectibles | Provable ownership and royalties | Foundation, SuperRare |
| Event tickets | Cannot be counterfeited, easy to transfer | GET Protocol |
| Domain names | Own a .eth name as an NFT | Ethereum Name Service (ENS) |
| Game items | Trade items across games and markets | Gods Unchained, Axie Infinity |
| Membership passes | Token-gate access to communities | Bored Ape Yacht Club |
| Real-world assets | Represent ownership of physical items | Real estate tokens, luxury goods |

## The ERC-1155 standard

ERC-721 creates one token per item. ERC-1155 allows a single contract to manage both fungible and non-fungible tokens. A game studio can use one ERC-1155 contract for both unique swords (non-fungible, each is different) and gold coins (fungible, all identical).

## Key takeaways

- NFTs are tokens with unique IDs that prove ownership of a specific item.
- ERC-721 is the standard for unique tokens; ERC-1155 supports both unique and identical tokens.
- Images and metadata are usually stored off-chain (IPFS), not on the blockchain itself.
- Real use cases extend beyond art: tickets, domains, game items, memberships.

## Next steps

1. **DAOs: Internet Organizations** — how groups govern on-chain
2. **DeFi: Banking Without Banks** — the financial system built on smart contracts
