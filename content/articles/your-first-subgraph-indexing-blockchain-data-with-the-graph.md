---
title: 'Your First Subgraph: Indexing Blockchain Data with The Graph'
image: >-
 https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8ZGF0YXxlbnwwfHx8fDE3NTUwMzYzNzV8MA&lib=rb-4.0.3
description: >-
 Learn how to build a subgraph using The Graph Protocol. This guide provides a
 step-by-step tutorial on how to index smart contract data and serve it via a.
category: Getting Started
publishedDate: '2026-03-11'
lastUpdated: "2026-09-02"
---

Building a decentralized application (dApp) requires two key components: smart contracts, which serve as the on-chain backend, and a user interface, which functions as the off-chain frontend. A significant hurdle for dApp developers is retrieving data from the [blockchain](/what-is-a-blockchain) for display on the frontend. Accessing data directly from a [smart contract](/what-are-smart-contracts) can be slow and inefficient, presenting a challenge for development.

**The Graph** addresses this issue. It is a decentralized protocol designed for indexing and querying blockchain data. With The Graph, developers can specify the data they need from smart contracts, outline how to process this data, and retrieve it efficiently via a **GraphQL API**.

Understanding how to build a "subgraph" is essential for any full-stack [Web3](/what-is-web3) developer. This article outlines the step-by-step process for creating a subgraph.

### The Need for Subgraphs

When displaying a list of all the [NFTs](/what-are-nfts) owned by a user, accessing this information directly from the blockchain can be cumbersome. The process involves:

1. Searching through every `Transfer` event emitted by your NFT contract.
2. Filtering for events where the user is the recipient.
3. Tracking any NFTs the user has transferred away.
4. Compiling the list of tokens they currently own.

This method is slow and complicated on the client-side. A subgraph performs all these operations server-side and offers a straightforward API to retrieve the necessary data, such as "all NFTs owned by this address."

### Core Components of a Subgraph

A subgraph project consists of three primary files:

1. **Subgraph Manifest (`subgraph.yaml`):** This configuration file informs The Graph which smart contracts to monitor (the `dataSource`), which events to track, and which functions (referred to as "handlers") to execute in response to those events.

2. **Schema (`schema.graphql`):** This GraphQL schema file defines the data structure to store and query. For instance, an `NFT` entity may have properties like `id`, `owner`, and `tokenURI`.

3. **Mappings (`src/mapping.ts`):** This code transforms blockchain data into the defined entities within the schema. Written in AssemblyScript (a subset of TypeScript), you create a "handler" function for each event of interest. When The Graph detects an event, it executes your handler function, which processes the event data, creates or updates entities, and stores them in the database.

### Step-by-Step Guide to Building a Simple Subgraph

To illustrate, we will build a subgraph for a basic ERC-721 NFT contract.

**Prerequisites:** Ensure Node.js and npm are installed. Install The Graph CLI globally using the following command:

```bash
npm install -g @graphprotocol/graph-cli
```

**Step 1: Initialize the Subgraph**

The Graph CLI can create a new subgraph from an existing contract address. Locate an NFT contract on a testnet, such as Sepolia Etherscan, and retrieve its address.

```bash
graph init --from-contract <CONTRACT_ADDRESS> --network sepolia my-nft-subgraph
```

The CLI will analyze the contract and generate a basic template for the three core files based on the contract's events.

**Step 2: Define Your Schema (`schema.graphql`)**

Next, define the data you wish to save. For tracking each NFT and its current owner, use the following schema:

```graphql
type Token @entity {
 id: ID! # The token ID
 tokenURI: String!
 owner: User!
}

type User @entity {
 id: ID! # The user's address
 tokens: [Token!]! @derivedFrom(field: "owner")
}
```

- The `@entity` directive indicates that `Token` and `User` will be treated as top-level data entities.
- The `@derivedFrom` directive establishes a relationship, linking the `tokens` field of the `User` entity to the `owner` field of the `Token` entity.

**Step 3: Write the Mapping Logic (`src/mapping.ts`)**

After initializing, the CLI will create a boilerplate handler function for the `Transfer` event. Complete the function as follows:

```typescript
import { Transfer as TransferEvent } from "../generated/MyNFT/MyNFT";
import { Token, User } from "../generated/schema";

export function handleTransfer(event: TransferEvent): void {
 // Find or create the User (the recipient of the NFT)
 let to = User.load(event.params.to.toHex());
 if (!to) {
 to = new User(event.params.to.toHex());
 to.save();
 }

 // Find or create the Token
 let tokenId = event.params.tokenId.toString();
 let token = Token.load(tokenId);
 if (!token) {
 token = new Token(tokenId);
 // Optionally call the contract to get the tokenURI
 // let contract = MyNFT.bind(event.address)
 // token.tokenURI = contract.tokenURI(event.params.tokenId)
 token.tokenURI = "/placeholder.json"; // Placeholder for simplicity
 }

 // Update the owner of the token
 token.owner = to.id;
 token.save();
}
```

This function activates with each `Transfer` event. It creates a `User` entity for the new owner if it does not exist, creates a `Token` entity if it's the first instance of this token, and updates the token's `owner` field to reflect the new user.

**Step 4: Deploy the Subgraph**

1. **Authenticate:** Use the command:
 ```bash
 graph auth --studio <YOUR_DEPLOY_KEY>
 ```
2. **Codegen & Build:** Execute:
 ```bash
 graph codegen && graph build
 ```
3. **Deploy:** Run:
 ```bash
 graph deploy --studio <SUBGRAPH_NAME>
 ```

Upon deployment to The Graph's hosted service (the "Subgraph Studio"), it will begin indexing data from your selected contract. After syncing, you'll have a GraphQL endpoint that your dApp can use to query NFT and owner data efficiently.

Building subgraphs is a fundamental step toward becoming a full-stack Web3 developer. It bridges your on-chain logic with the off-chain user experience, enabling the development of fast, data-rich decentralized applications.
