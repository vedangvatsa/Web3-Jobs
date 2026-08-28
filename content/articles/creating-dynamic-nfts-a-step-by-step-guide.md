---
title: 'Creating Dynamic NFTs: A Step-by-Step Guide'
image: >-
 https://images.unsplash.com/photo-1639221314358-2291fb903405?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxuZnR8ZW58MHx8fHwxNzU0OTQ5Njc2fDA&ixlib=rb-4.1.0&q=80&w=1080
data-ai-hint: creating dynamic nfts step guide
description: >-
 Go beyond static JPEGs. This guide explores the world of Dynamic NFTs (dNFTs)
 and shows you how to create NFTs that can change and evolve based on.
category: Technology Deep Dives
publishedDate: '2026-03-11'
lastUpdated: "2026-08-28"
---

The first generation of NFTs primarily consisted of static assets, such as JPEG files and video clips. Once minted, these NFTs had unchangeable metadata on the [blockchain](/what-is-a-blockchain). The evolution of NFTs introduces the **Dynamic [NFT](/what-are-nfts)**, or dNFT, which allows for changing metadata over time.

Dynamic NFTs can update their attributes, appearance, or utility in response to real-world events. This capability opens up a wide range of creative possibilities for developers and artists.

This article provides a detailed overview of dynamic NFTs, how they function, and a structured approach to creating one.

### Differences Between Static and Dynamic NFTs

| Feature | Static NFT | Dynamic NFT |
|----------------------|------------------------------------------------------|----------------------------------------------------|
| Metadata Storage | Immutable metadata stored on decentralized systems like IPFS | Metadata can be updated through smart contracts |
| Update Mechanism | No mechanism for updates; once minted, it is fixed | Smart contract logic enables updates based on triggers |
| Examples | Digital art, collectibles | Interactive avatars, real-time sports stats |

In static NFTs, the [token](/what-is-a-token) metadata, typically a JSON file that defines traits and points to images, remains unchanged once uploaded. In contrast, a dynamic NFT's [smart contract](/what-are-smart-contracts) includes logic for metadata updates based on external inputs.

### The Role of Blockchain Oracles

Dynamic NFTs rely on **blockchain oracles** to function. As explained in our [guide to oracles](/what-are-oracles), these services securely bring off-chain data onto the blockchain. By using oracles, a dynamic NFT can reference real-world data.

The smart contract governing a dNFT calls an oracle to fetch external data. Once the data is received, the contract can update its state or change the metadata URI, thereby altering the NFT's appearance or characteristics.

### Real-World Examples of Dynamic NFTs

The applications of dynamic NFTs are diverse and new:

- **Living Avatar**: An NFT avatar that updates its clothing based on real-time weather conditions in the owner's location.
- **Sports Player NFT**: An NFT depicting a basketball player whose appearance and stats evolve in real-time according to their performance during a game. For example, if a player scores points, their power attribute increases.
- **Real Estate NFT**: An NFT that represents a physical property, continuously updating its metadata with current value estimates and maintenance history.
- **RPG Character**: An NFT representing a character in a role-playing game that levels up, acquires new items, and visually transforms as the player progresses.

### Workflow for Building a Dynamic NFT

Creating a dynamic NFT involves advanced development that merges standard NFT creation with oracle integration. Here's a structured workflow:

1. **Define Possible States**: Begin by creating all potential images and metadata files for your NFT. For a weather-related NFT, you would prepare distinct images and JSON files for states like "Sunny," "Rainy," and "Cloudy." Upload these files to IPFS.

2. **Develop the Smart Contract**: The smart contract forms the backbone of your project. Key components include:
 - **State Variable**: A variable to track the current state, such as `string public currentState = "Sunny";`.
 - **Oracle Integration**: Use services like Chainlink to request external data. The contract should contain a function to request weather data from a Chainlink oracle.
 - **Update Function**: This function is triggered by the Chainlink oracle when it receives the data, updating the `currentState` variable based on the data (e.g., current weather).
 - **Modified `tokenURI` Function**: Override the default `tokenURI` function to construct links based on the `currentState`. For example, if `currentState` is "Rainy," it will return the link to the `rainy.json` file.

3. **Configure an Oracle Job**: Set up a Chainlink job detailing which API will provide the weather data and how the response should be formatted. Chainlink's documentation includes extensive instructions for this process.

4. **Fund Your Contract**: Ensure your smart contract holds LINK tokens to compensate the Chainlink oracles for their data services.

### Challenges in Building Dynamic NFTs

Creating dynamic NFTs comes with its own set of challenges:

- **Increased Complexity**: Developing a dNFT requires more complex coding than standard NFT projects.
- **Gas Fees**: Each time the NFT's state updates via an oracle call, it incurs an on-chain transaction fee. Frequent updates can lead to high costs, prompting many projects to consider Layer 2 solutions.
- **Centralization Risks**: The reliability of the oracle network and the data source is critical. An unreliable data source can compromise the logic of the dNFT.

Dynamic NFTs transform static digital assets into interactive objects that can respond to real-world stimuli. This innovation presents an good opportunity for creators and developers to craft more engaging [Web3](/what-is-web3) experiences.

### Importance of Understanding Dynamic NFTs

Grasping the concept of dynamic NFTs is essential for professionals aiming to excel in the evolving digital asset field. Mastery in this area can lead to better career opportunities, particularly in Web3 organizations where new communication and collaboration are vital.
