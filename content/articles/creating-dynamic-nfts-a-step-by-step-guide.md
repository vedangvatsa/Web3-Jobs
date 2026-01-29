---


title: "Creating Dynamic NFTs: A Step-by-Step Guide"
image: "https://images.unsplash.com/photo-1639221314358-2291fb903405?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxuZnR8ZW58MHx8fHwxNzU0OTQ5Njc2fDA&ixlib=rb-4.1.0&q=80&w=1080"
data-ai-hint: "creating dynamic nfts step guide"
description: "Go beyond static JPEGs. This guide explores the world of Dynamic NFTs (dNFTs) and shows you how to create NFTs that can change and evolve based on external data."
category: "Technology Deep Dives"

---



The first wave of NFTs was defined by static assets: JPEG files and video clips whose metadata, once minted, was frozen forever on the blockchain. The next evolution is the **Dynamic NFT (dNFT)**.

A Dynamic NFT is an NFT whose metadata can change and evolve over time based on external conditions. Instead of being a static image, a dNFT can update its appearance, its attributes, or its utility in response to real-world events. This unlocks a massive new design space for creators and developers.

This guide will break down what dNFTs are, how they work, and provide a high-level overview of how you can build one.

### How are Dynamic NFTs Different?

*   **Static NFT:** The token's metadata (the JSON file that points to the image and defines the traits) is typically stored on a decentralized file system like IPFS. Once uploaded, this file is immutable.
*   **Dynamic NFT:** The smart contract for a dNFT contains logic that allows the metadata to be updated. The key is how this update is triggered.

### The Key Component: Blockchain Oracles

The "magic" of dNFTs is made possible by **blockchain oracles**. As we covered in our [guide to oracles](/what-are-oracles), these are services that securely bring real-world, off-chain data onto the blockchain so that smart contracts can use it.

A dNFT's smart contract is designed to call an oracle to fetch external data. Based on the data it receives, the contract can then update its own state or change the metadata URI to point to a new JSON file, effectively changing the NFT's appearance and traits.

### Examples of Dynamic NFTs

The possibilities are endless:

*   **A "Living" Avatar:** An NFT avatar that changes its clothes based on the real-world weather in its owner's city.
*   **A Sports Player NFT:** An NFT of a basketball player whose stats and appearance upgrade in real-time based on their performance in a live game. If they score 20 points, their "Power" attribute increases.
*   **A Real Estate NFT:** An NFT representing a real-world house whose metadata (like its estimated value or maintenance records) is continuously updated.
*   **An RPG Character:** An in-game character NFT that levels up, gains new items, and visually changes as the player progresses through the game.

### How to Build a Dynamic NFT: A High-Level Workflow

Building a dNFT is a more advanced development task that combines standard NFT development with oracle integration.

1.  **Create Your "States":** First, you need to create all the possible images and metadata files for your NFT. For example, if you're creating a weather-based NFT, you would create separate images and JSON files for "Sunny," "Rainy," and "Cloudy" states. You would then upload all of these to IPFS.

2.  **Write the Smart Contract:** This is the core of the project. Your ERC-721 contract needs a few key additions:
    *   **State Variable:** A variable to store the current state of the NFT (e.g., `string public currentState = "Sunny";`).
    *   **Oracle Integration:** You will use a service like Chainlink to request external data. Your contract will have a function that makes a request to a Chainlink oracle for the weather data in a specific location.
    *   **Update Function:** A function that is called by the Chainlink oracle when it has the data. This function will take the data (e.g., the weather condition) and update the `currentState` variable in your contract.
    *   **Modified `tokenURI` Function:** You will override the standard `tokenURI` function. Instead of always returning the same metadata link, it will now construct the link based on the `currentState` variable. For example, if `currentState` is "Rainy", it will return the IPFS link for the `rainy.json` file.

3.  **Set Up an Oracle Job:** You will need to configure a Chainlink job that tells the oracle which API to call for the weather data and how to format the response to be sent back to your smart contract. Chainlink's documentation provides detailed guides on how to do this.

4.  **Fund Your Contract:** Your smart contract will need to hold LINK tokens to pay the Chainlink oracles for their data services.

### The Challenges

*   **Complexity:** Building a dNFT is significantly more complex than a standard NFT project.
*   **Gas Costs:** Every time the NFT's state is updated via an oracle call, it requires an on-chain transaction, which costs gas. For NFTs that update frequently, this can be expensive. This is why many dNFT projects are being built on Layer 2s.
*   **Centralization Risk:** You must trust the oracle network and the off-chain data source. If the data source is unreliable, the dNFT's logic will be too.

Dynamic NFTs represent a major leap forward, transforming digital assets from static collectibles into living, breathing objects that can react to and interact with the world around them. For developers and creators, they offer an exciting new canvas for building more engaging and interactive Web3 experiences.
