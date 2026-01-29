---
title: "What is a Snapshot in Cryptocurrency Airdrops"
image: "/images/maxim-hopman-8vn4KvfU640-unsplash.jpg"
data-ai-hint: "camera snapshot"
description: "A snapshot is a record of the state of a blockchain at a specific block height. It's a crucial mechanism used by Web3 projects to determine eligibility for airdrops and governance votes."
category: "Educational"
---

In the world of Web3, the term **"snapshot"** has a specific and very important meaning. It refers to the action of recording the entire state of a blockchain at a precise moment in time, specifically at a particular block height. This record is then used as the definitive source of truth for an event like an **[airdrop](/understanding-airdrop-campaigns-in-web3)** or a governance vote.

### How Does a Snapshot Work?

A blockchain is a continuously growing chain of blocks, with each new block containing a set of transactions. A snapshot is created by choosing a specific block number. The state of the blockchain *at the exact moment that block was created* is then recorded. This includes:

-   The balance of every token in every wallet address.
-   The storage of every smart contract.
-   The history of all transactions up to that point.

Because the blockchain is a public and immutable ledger, anyone can go back and verify the state of the chain at any historical block height. This makes a snapshot a fair and transparent mechanism.

### The Primary Use Case: Airdrop Eligibility

The most common use of a snapshot is to determine who is eligible to receive a token airdrop.

Let's say a new DeFi protocol wants to reward the early users of Uniswap with its new governance token. The process would look like this:

1.  **The Snapshot:** The project team announces, "We will be taking a snapshot of the Ethereum blockchain at block number 15,000,000."
2.  **Data Analysis:** After that block has been mined, the team uses tools to analyze the state of the blockchain up to that point. They will look at all the transactions that have interacted with the Uniswap smart contracts.
3.  **Defining Criteria:** They then define the eligibility criteria based on this data. For example, "Every address that has performed at least 5 swaps on Uniswap before block 15,000,000 will be eligible for the airdrop."
4.  **Distribution:** The list of eligible addresses is generated based on the snapshot data, and the airdrop is distributed to them.

By using a snapshot, the project ensures that the distribution is based on a fixed and verifiable set of historical data. It prevents users from trying to "game the system" by performing actions after the airdrop has been announced.

### Other Use Cases for Snapshots

-   **DAO Governance:** DAOs use snapshots to determine who has the right to vote on a proposal. To vote on a new proposal, you must have held the governance token in your wallet at the time of the proposal's snapshot block. This prevents people from buying tokens just to vote on a specific issue and then immediately selling them.
-   **Hard Forks and Chain Splits:** When a blockchain undergoes a hard fork, a snapshot is effectively taken at the fork block. Users who held tokens on the original chain will often receive an equal amount of tokens on the new, forked chain.

### Snapshot.org: A Tool for Gasless Voting

The concept of a snapshot is so central to governance that it has inspired the name of the most popular off-chain voting tool for DAOs: **Snapshot.org**.

This platform allows projects to create proposals and let their token holders vote using their wallets, but without requiring an on-chain transaction (and thus, no gas fees). It works by taking a "snapshot" of token holder balances at a specific block number and using that data to weight the votes. While these votes are not binding on-chain, they are a crucial tool for gauging community sentiment before moving to a formal, on-chain vote.

In essence, a snapshot is a powerful tool for creating fair and verifiable criteria in a decentralized environment. It's the mechanism that allows projects to look back at a specific moment in on-chain history and use it as the "source of truth" for distributing rewards and power.

