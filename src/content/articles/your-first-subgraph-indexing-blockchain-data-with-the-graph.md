---
title: "Your First Subgraph: Indexing Blockchain Data with The Graph"
image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8ZGF0YXxlbnwwfHx8fDE3NTUwMzYzNzV8MA&ixlib=rb-4.1.0&q=80&w=1080"
description: "Learn how to build a subgraph using The Graph Protocol. This guide provides a step-by-step tutorial on how to index smart contract data and serve it via a GraphQL API."
category: "Getting Started"
---

Building a decentralized application (dApp) involves two main components: writing smart contracts (the on-chain backend) and building a user interface (the off-chain frontend). A major challenge for dApp developers is getting data from the blockchain to display on the frontend. Reading data directly from a smart contract can be slow, inefficient, and limited.

This is the problem that **The Graph** solves. The Graph is a decentralized protocol for indexing and querying data from blockchains. It allows you to define which data you care about from a smart contract, how to process it, and then serves that data to your frontend via a fast and efficient **GraphQL API**.

Learning to build a "subgraph" is an essential skill for any full-stack Web3 developer. This guide will walk you through the process.

### Why Do We Need Subgraphs?

Imagine you want to display a list of all the NFTs a user owns from your collection. To do this by reading directly from the blockchain, you would have to:
1.  Look through every `Transfer` event ever emitted by your NFT contract.
2.  Filter them to find the ones where the user was the recipient.
3.  Keep track of which ones they later sent away.
4.  Finally, compile a list of the tokens they currently own.

This is incredibly slow and complex to do on the client-side. A subgraph does all this work on a server and then provides you with a simple API to ask, "Hey, give me all the NFTs owned by this address."

### The Core Components of a Subgraph

A subgraph project consists of three main files:

1.  **The Subgraph Manifest (`subgraph.yaml`):** This is the configuration file. It tells The Graph which smart contracts to listen to (the `dataSource`), which events on those contracts to pay attention to, and which functions (called "handlers") to run when those events occur.

2.  **The Schema (`schema.graphql`):** This is a GraphQL schema file. You use it to define the shape of the data you want to store and query. For example, you might define an `NFT` entity with properties like `id`, `owner`, and `tokenURI`.

3.  **The Mappings (`src/mapping.ts`):** This is the code that transforms the blockchain data into the entities you defined in your schema. It's written in AssemblyScript (a subset of TypeScript). You write a "handler" function for each event you're interested in. When The Graph sees that event on the blockchain, it runs your handler function, which takes the event data, creates or updates your entities, and saves them to the database.

### Step-by-Step Guide to Building a Simple Subgraph

Let's imagine we want to build a subgraph for a simple ERC-721 NFT contract.

**Prerequisites:** You'll need to have Node.js and npm installed. Then, install The Graph CLI globally:
`npm install -g @graphprotocol/graph-cli`

**Step 1: Initialize the Subgraph**

The Graph CLI can initialize a new subgraph from an existing contract address. Find an NFT contract on a testnet like Sepolia Etherscan and use its address.

```bash
graph init --from-contract <CONTRACT_ADDRESS> --network sepolia my-nft-subgraph
```

The CLI will introspect the contract and generate a basic template for all three core files based on the contract's events.

**Step 2: Define Your Schema (`schema.graphql`)**

Let's define what data we want to save. We want to track each NFT and who currently owns it.

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

*   `@entity`: This directive tells The Graph to save `Token` and `User` as top-level data entities.
*   `@derivedFrom`: This creates a relationship. The `tokens` field on the `User` entity is derived from the `owner` field on the `Token` entity.

**Step 3: Write the Mapping Logic (`src/mapping.ts`)**

The CLI will have created a boilerplate handler function for the `Transfer` event. We need to fill it in.

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
    // You might need to call the contract to get the tokenURI
    // let contract = MyNFT.bind(event.address)
    // token.tokenURI = contract.tokenURI(event.params.tokenId)
    token.tokenURI = "/placeholder.json"; // Placeholder for simplicity
  }
  
  // Update the owner of the token
  token.owner = to.id;
  token.save();
}
```

This function is triggered every time a `Transfer` event happens. It creates a `User` entity for the new owner if one doesn't exist, creates a `Token` entity if it's the first time we've seen this token, and then updates the token's `owner` field to point to the new user.

**Step 4: Deploy the Subgraph**

1.  **Authenticate:** `graph auth --studio <YOUR_DEPLOY_KEY>`
2.  **Codegen & Build:** `graph codegen && graph build`
3.  **Deploy:** `graph deploy --studio <SUBGRAPH_NAME>`

After deploying to The Graph's hosted service (the "Subgraph Studio"), it will start indexing the data from your chosen contract. Once it's synced, you'll have a GraphQL endpoint that your dApp can use to instantly query for NFT and owner data.

Learning to build subgraphs is a fundamental step in becoming a full-stack Web3 developer. It's the bridge that connects your on-chain logic to your off-chain user experience, enabling you to build fast, rich, and data-intensive decentralized applications.