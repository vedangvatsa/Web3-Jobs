---

title: "What is a Snapshot in Cryptocurrency Airdrops"
image: "/images/maxim-hopman-8vn4KvfU640-unsplash.jpg"
data-ai-hint: "camera snapshot"
description: "A snapshot is a record of the state of a blockchain at a specific block height. It's a important mechanism used by Web3 projects to determine eligibility."
category: "Educational"

publishedDate: "2026-03-11"
lastUpdated: "2026-05-20"
---

In the [Web3](/what-is-web3) sector, the term **"snapshot"** holds significant importance. It denotes the process of capturing the complete state of a [blockchain](/what-is-a-blockchain) at a specific moment, marked by a particular block height. This recorded state serves as the authoritative reference for important events such as an **[airdrop](/understanding-airdrop-campaigns-in-web3)** or a governance vote.

### How Snapshots Function

A blockchain comprises a series of blocks, each containing a set of transactions. When a snapshot occurs, a specific block number is selected. The state of the blockchain at that block's creation is recorded, encompassing:

- The balance of every [token](/what-is-a-token) in all [wallet](/how-to-choose-a-crypto-wallet) addresses.
- The data stored in every [smart contract](/what-are-smart-contracts).
- The history of all transactions leading up to that block.

Since the blockchain operates as a public and immutable ledger, anyone can verify its state at historical block heights. This transparency makes snapshots a fair and reliable mechanism for various applications.

### Primary Use Case: Airdrop Eligibility

Snapshots commonly determine eligibility for token [airdrops](/understanding-airdrop-campaigns-in-web3). For instance, consider a new [DeFi](/what-is-defi) protocol wishing to reward early Uniswap users with its governance token. The process unfolds as follows:

1. **The Snapshot Announcement:** The project team declares, "We will take a snapshot of the [Ethereum](/what-is-ethereum) blockchain at block number 15,000,000."
2. **Data Analysis:** After mining that block, the team analyzes the blockchain's state up to that moment, focusing on all transactions interacting with Uniswap smart contracts.
3. **Eligibility Criteria Definition:** They establish criteria based on this data. For example, "Addresses with a minimum of 5 swaps on Uniswap before block 15,000,000 qualify for the airdrop."
4. **Distribution Process:** The team generates a list of eligible addresses from the snapshot data and distributes the airdrop accordingly.

By using a snapshot, the project ensures that the distribution relies on a fixed, verifiable set of historical data. This prevents manipulation by users attempting to engage in actions after the airdrop announcement.

### Additional Use Cases for Snapshots

- **[DAO](/what-is-a-dao) Governance:** Decentralized Autonomous Organizations (DAOs) use snapshots to identify voting rights on proposals. To vote, individuals must hold governance tokens in their wallets at the time of the proposal's snapshot block, preventing token purchases solely for voting purposes.
- **Hard Forks and Chain Splits:** During a hard fork, a snapshot is taken at the fork block. Users holding tokens on the original chain typically receive an equivalent amount on the new, forked chain.

### Snapshot.org: A Tool for Gasless Voting

Snapshots play a central role in governance, leading to the development of Snapshot.org, a widely used off-chain voting tool for DAOs. This platform enables projects to create proposals and allows token holders to vote via their wallets without incurring on-chain transaction fees. It operates by taking a "snapshot" of token holder balances at a specific block number, using this data to weight votes. Although these votes are not binding on-chain, they serve as an essential gauge of community sentiment prior to formal on-chain voting.

A snapshot is an effective tool for establishing fair and verifiable criteria within a decentralized context. It allows projects to refer back to a specific moment in on-chain history, serving as the "source of truth" for distributing rewards and governance rights.
