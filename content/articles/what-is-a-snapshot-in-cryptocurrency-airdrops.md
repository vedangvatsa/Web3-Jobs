---
title: What is a Snapshot in Cryptocurrency Airdrops
image: /images/maxim-hopman-8vn4KvfU640-unsplash.jpg
data-ai-hint: camera snapshot
description: >-
  A snapshot is a record of the state of a blockchain at a specific block
  height. It's an important mechanism used by Web3 projects to determine
  eligibility.
category: Educational
publishedDate: '2026-03-11'
lastUpdated: "2026-09-08"
---
In [Web3](/what-is-web3), a snapshot is a record of the complete state of a [blockchain](/what-is-a-blockchain) at a specific moment, identified by a block height. The selected block gives a project a precise historical reference. That record can then be used as the authoritative basis for an airdrop, a governance vote, or another decision that depends on what was true on the chain at that point.

The term is easy to mistake for a general announcement or an approximate cutoff date. It is neither. A snapshot fixes the data set to which a project will apply a rule. The project still has to explain the rule: which balances, transactions, or contract interactions count, and what threshold applies. The snapshot supplies the stable historical record against which those criteria can be tested.

This is especially useful for [airdrops](/understanding-airdrop-campaigns-in-web3). A project that wants to reward past activity needs a way to distinguish that activity from actions taken after the eligibility criteria become public. By naming a block height, it can state exactly where the relevant history ends. Participants can then assess eligibility against the same record rather than against a moving set of later transactions.

## What a snapshot records

A blockchain is a series of blocks, each containing a set of transactions. When a snapshot is taken, a specific block number is selected and the state at that block's creation is recorded. In this context, the record encompasses:

- The balance of every [token](/what-is-a-token) in all [wallet](/how-to-choose-a-crypto-wallet) addresses.
- The data stored in every [smart contract](/what-are-smart-contracts).
- The history of all transactions leading up to that block.

The record can therefore support several kinds of eligibility condition. A project may look at a token balance in a wallet, interaction with a smart contract, or transactions completed before the selected block. The snapshot establishes the same historical boundary for each question. It tells the project and participants where to look when applying a stated rule.

The block height is the anchor. A project can publish a block number instead of relying on language such as "before launch" or "early users." That makes the reference more precise. A participant can compare the published condition with the state at the stated block, while the project can use the same state to generate its list of eligible addresses or its voting weights.

Because a blockchain is a public and immutable ledger, anyone can verify its state at historical block heights. This transparency is why snapshots are described as fair and reliable. The record is fixed rather than changing as later activity occurs. It does not decide whether a project's criterion is wise or desirable; it establishes which historical data the project used to apply that criterion.

The distinction between the snapshot and the final distribution list is important. The snapshot is the historical record. The distribution list is what a project produces after it applies its stated criterion to that record. Keeping those steps separate makes it possible to assess whether the rule matches the data being used. It also prevents a project announcement from treating the word "snapshot" as if it explained the eligibility condition on its own.

## Airdrop eligibility in practice

Snapshots commonly determine eligibility for token airdrops. Consider a new [DeFi](/what-is-defi) protocol that wants to reward early Uniswap users with its governance token. The project needs to define who counts as an early user and apply that definition consistently. A snapshot gives it a fixed historical record from which to do so.

1. **Announce the snapshot block.** The project team states: "We will take a snapshot of the [Ethereum](/what-is-ethereum) blockchain at block number 15,000,000." This identifies the block height that will serve as the cutoff. Activity after that block is outside the stated historical record.

2. **Analyze the data through the cutoff.** After that block is mined, the team analyzes the blockchain state up to that moment. In this example, it focuses on transactions that interacted with Uniswap smart contracts. The analysis is looking back to the chosen point, not continuously adding later transactions.

3. **Define the eligibility rule.** The team uses the snapshot data to set a condition. For example: "Addresses with a minimum of 5 swaps on Uniswap before block 15,000,000 qualify for the airdrop." The rule has two parts: the required number of swaps and the block-height deadline for those swaps.

4. **Generate the distribution list.** The team derives eligible addresses from the snapshot data and distributes the airdrop accordingly. The resulting list is the product of the stated rule applied to the selected historical state, not a general list of everyone who has ever used Uniswap.

The sequence is worth separating into stages. The block number defines the data boundary. The analysis identifies relevant activity within that boundary. The eligibility rule turns the data into a criterion. The distribution follows from the resulting address list. A snapshot does not eliminate the need for a project to describe each stage, but it gives each stage the same verifiable reference point.

### Why the cutoff matters

By using a snapshot, a project bases its distribution on a fixed, verifiable set of historical data. This prevents manipulation by users who attempt to take qualifying actions after the airdrop announcement. In the Uniswap example, swaps completed after the selected block cannot change what was recorded before block 15,000,000.

An airdrop condition should be read as a complete rule. It is not enough to know that Uniswap use matters; the example requires at least five swaps, and they must occur before the named block. The same discipline applies to a balance or smart-contract interaction. The question is what the address held or did at, or before, the block selected by the project, not what it did later.

For participants, the practical reading order is simple: identify the blockchain, the snapshot block, the activity or balance being measured, and the threshold. These details turn a general promise of rewards into an eligibility process. They also explain why two addresses with similar histories may receive different results under a particular rule.

The same record can be checked from more than one perspective. A project can use the snapshot to generate its list, while a participant can use the named block and criteria to understand why an address does or does not qualify. That shared reference is the practical benefit of a public historical ledger. It does not remove the need for clear criteria, but it gives the criteria a fixed basis rather than leaving them to a later description.

## Governance and chain splits

Snapshots also determine voting rights in [DAO](/what-is-a-dao) governance. A Decentralized Autonomous Organization can use a proposal's snapshot block to establish which governance-token balances count for that proposal. To vote, an individual must hold the governance tokens in their wallet at the time of the snapshot. The recorded balance is then used to weight the vote.

This setup prevents token purchases made solely for voting purposes. The proposal is the decision before the community; the snapshot is the mechanism used to identify the historical holdings that qualify for that decision. Separating those ideas matters. A snapshot does not state what the DAO should decide. It identifies the voting rights that apply at the defined point in chain history.

Hard forks and chain splits use the same principle. At a fork block, a snapshot is taken. Users who hold tokens on the original chain typically receive an equivalent amount on the new, forked chain. The snapshot establishes the holdings at the moment the chains divide, so later activity does not alter the stated basis for the new-chain balance.

The use cases differ, but the mechanism is consistent. An airdrop uses a snapshot to identify reward recipients. A DAO uses one to identify voting rights. A hard fork uses one to identify balances at the split. In each case, a fixed historical state provides the reference for a later distribution or decision.

## Snapshot.org and gasless voting

Snapshots are central to governance, which led to the development of Snapshot.org, a widely used off-chain voting tool for DAOs. The platform lets projects create proposals and lets token holders vote through their wallets without incurring on-chain transaction fees. It takes a snapshot of token-holder balances at a specified block and uses that data to weight votes.

The votes on Snapshot.org are not binding on-chain. They are an essential gauge of community sentiment before formal on-chain voting. The distinction is important: the platform can collect a gasless, balance-weighted expression of token-holder views, while formal on-chain voting remains a separate step. The snapshot gives the off-chain process a defined basis for voting weight rather than relying on balances acquired after the specified block.

For a voter or proposal reader, the relevant questions are the same as they are for an airdrop: which proposal is being considered, which block supplies the snapshot, and how is the recorded balance used? Those questions separate the subject of a vote from the historical record used to determine the weight of the vote.

## A verifiable historical reference

A snapshot is often called a "source of truth" because it lets a project return to a specific moment in on-chain history when distributing rewards or governance rights. The phrase should be used narrowly. It means the historical data used for the decision is fixed and verifiable; it does not settle every argument about the project or its rule.

That narrow function is what makes snapshots useful in a decentralized context. A project can name a block height, state criteria, derive an address list or voting weight from the recorded state, and explain how it applied the rule. Participants can inspect the same historical record. The result is a more precise and transparent basis for an airdrop, a governance vote, or a chain split.
