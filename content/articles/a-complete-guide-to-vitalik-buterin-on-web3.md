---
title: What does Vitalik Buterin think about Web3
description: >-
  Vitalik Buterin's work on Ethereum connects programmable public infrastructure
  with cautions about power, governance, privacy, and technical trade-offs.
image: /images/zhenyu-luo-kE0JmtbvXxM-unsplash.jpg
category: Industry Insights
data-ai-hint: man glasses
publishedDate: '2026-03-11'
lastUpdated: '2026-09-08'
---

## More Than a "World Computer"

Vitalik Buterin's view of Web3 starts with a technical proposal and ends with a political question: how can people use shared digital systems without handing too much power to their operators? Ethereum is the main vehicle for that question, but his writing repeatedly resists the idea that a blockchain solves social problems by itself. A protocol can spread authority across more participants. It can also create new concentrations of wealth, technical control, surveillance, and governance power.

The original Ethereum proposal aimed at a blockchain with a built-in, Turing-complete programming language so developers could encode their own state-transition rules. The [2014 whitepaper](https://ethereum.org/en/whitepaper/) describes smart contracts, custom assets, and decentralized organizations as applications of that general-purpose layer. It did not predict a finished social system. It proposed a common execution environment where applications could share a settlement layer rather than each launching its own chain.

That is the useful meaning behind the old "world computer" phrase. Ethereum does not run all programs in the world, and it is not a cloud service with a single operator. It is a shared state machine: users submit transactions, the network applies the agreed rules, and nodes can independently check the resulting state. The advantages depend on the task. A public asset registry or an onchain exchange may value shared verification. A private database holding sensitive records may be better served by ordinary access controls and a conventional database.

Buterin's contribution is therefore not one answer to "what is Web3?" It is a set of design pressures. Keep the base layer open enough for new applications. Make rules inspectable. Give users a way to verify important claims themselves. Avoid placing a small group in a position where it can silently rewrite outcomes. Admit the costs when a design fails those tests.

## Ethereum Was Designed as a General-Purpose Layer

The whitepaper came before the network. Ethereum's historical timeline records the introductory paper in November 2013, the ether sale in July 2014, and Frontier's launch in July 2015 on [ethereum.org](https://ethereum.org/en/ethereum-forks/). Those dates matter because they separate a proposal from a deployed protocol. The 2014 text is still useful for its original ambition, while ethereum.org explicitly warns that it no longer describes Ethereum as it exists after years of upgrades.

Bitcoin demonstrated a network that could maintain a scarce digital asset without a central issuer. Ethereum extended the model by making the rules that govern assets and applications programmable. A contract can hold funds, expose functions, store state, and enforce conditions chosen by its authors. That makes new forms of coordination possible. It also means a bug in a contract can affect real balances under the exact rules the software contains.

This distinction is central to Buterin's work. The point of programmability is not that every application should put every action on a blockchain. It is that applications that need common verification can use the same base settlement system. A token standard, a lending market, an auction, or a governance module can interoperate because they share an execution environment and public transaction history. That shared environment carries fees, latency, and public visibility. It is not free infrastructure.

The early vision also explains why Ethereum has attracted more than currency applications. The whitepaper specifically discusses token systems, financial contracts, organizations, and non-financial applications such as voting and governance. That breadth led to DeFi, NFTs, DAO tooling, attestations, and experiments that did not fit neatly into a payment-only model. It also made Ethereum's security and scaling constraints harder, because a general platform has to deal with many kinds of activity rather than a narrow transaction format.

## Decentralization Is a Property to Measure

Buterin often treats decentralization as a question of trust assumptions rather than a badge. In his ["Trust Models" essay](https://vitalik.eth.limo/general/2020/08/20/trust.html), he asks how many parties must behave as expected, out of how many, what motivates them, and how the system fails when the assumption breaks. That framing is more demanding than asking whether a project has a token or a public blockchain.

A service controlled by one company has a 1-of-1 dependence for many decisions. If that company is unavailable, censored, compromised, or changes policy, users may have no practical alternative. A system where any one honest watcher can challenge invalid activity has a different shape. A system that requires a majority of validators to stay honest has another. None is absolute trustlessness. Each gives users a different failure mode.

This way of thinking avoids a common overstatement. Ethereum is decentralized in some respects because independent nodes can validate its rules and users can run their own software. It still has dependencies: client implementations, validator operators, wallets, block builders, hosted RPC providers, stablecoin issuers, bridges, and the people who coordinate upgrades. A design becomes stronger when those dependencies are visible and when a user can switch away from one of them without losing the ability to verify or withdraw.

The practical question is not whether a system has removed every intermediary. It is whether a particular intermediary can block, alter, or capture a user's critical action. A wallet can be convenient without controlling the asset. A hosted node can be useful while a user retains the option to verify through another node. A bridge or stablecoin can add a much stronger dependency. The details decide the result.

## The Trilemma Is About Costs, Not a Slogan

The phrase "blockchain trilemma" is usually shorthand for a hard design tension among scalability, decentralization, and security. Buterin's [explanation of sharding](https://vitalik.eth.limo/general/2021/04/07/sharding.html) defines scalability as processing more transactions than a regular node can verify, decentralization as avoiding reliance on a small group that users cannot join with consumer hardware, and security as resisting a large share of participating nodes attacking the system.

The point is not that every chain may select any two properties and discard the third. It is that simple solutions make the trade-off obvious. If every node executes every transaction, verification remains accessible but throughput is limited by what each node can process. If only a small group runs high-capacity machines, throughput can increase while users have to trust that group. If activity is split across many independent chains, capacity rises but the security of one weak chain can become a problem for applications that rely on it.

Buterin's research approach has been to look for techniques that move the boundary rather than pretending it is gone. Rollups execute many transactions away from Ethereum's base layer and post data or proofs back to Ethereum. The base layer becomes a place for settlement and data availability, while the rollup handles most execution. That model still has concrete security questions. Who sequences transactions? Can users force a withdrawal? Is the data available? Does the proof system work as claimed? Does a bridge introduce a separate trust assumption?

The trilemma is most useful when it makes those questions explicit. A claim of high throughput says little until the reader knows who verifies the state and what hardware that verification requires. A claim of decentralization says little until the reader knows which parties a user must trust to exit, transact, or retrieve data.

## Proof of Stake Changed One Part of the System

The Merge moved Ethereum Mainnet from proof-of-work to proof-of-stake on 15 September 2022. Ethereum's [Merge documentation](https://ethereum.org/en/roadmap/merge/) describes the change as the joining of the original execution layer with the Beacon Chain consensus layer. It removed proof-of-work mining from Ethereum's block-production process. It did not alter user balances, convert assets into a new token, or solve layer-1 fee pressure by itself.

That last qualification matters. The Merge changed consensus. It did not add enough execution capacity to make block space abundant. Ethereum's own documentation says the upgrade was not intended to lower gas fees. Conflating consensus with scaling turns a useful technical change into a vague promise.

The energy effect was more direct. Ethereum.org cites an estimate that proof-of-stake reduced annualized electricity use by more than 99.988 percent, while also noting that such network-wide estimates are not exact and change with the network's configuration. The [energy explanation](https://ethereum.org/en/energy-consumption/) is careful on another point: energy per transaction is a poor metric when the cost of proposing and verifying a block is not proportional to the number of transactions inside it.

Buterin's broader concern is not that proof-of-stake ends every security debate. It changes the resource used to participate in consensus and introduces its own questions around validator concentration, liquid staking, client diversity, and governance expectations. The relevant standard remains the same: can ordinary users verify the chain's rules, and what happens when a powerful participant acts against them?

## The Roadmap Moved Execution Toward Rollups

In his 2020 [rollup-centric roadmap](https://ethereum-magicians.org/t/a-rollup-centric-ethereum-roadmap/4698), Buterin argued that Ethereum's base layer should focus on security and data availability while rollups handle much of transaction execution. The claim was a response to a practical constraint: increasing base-layer computation makes it harder for ordinary nodes to keep up, while rollups can batch work and inherit important settlement guarantees from Ethereum.

Rollups are not identical. Optimistic designs generally rely on a challenge period and fraud proofs. Zero-knowledge rollups use validity proofs to show that a state transition followed the rules. Both need data availability if users are to independently reconstruct state or leave the system. They may also begin with centralized sequencers or other operational dependencies. A low transaction fee is only one property of a rollup.

EIP-4844, implemented in the Dencun upgrade in March 2024, added blob-carrying transactions for rollup data. The [EIP specification](https://eips.ethereum.org/EIPS/eip-4844) says the data cannot be accessed by EVM execution, while its commitment can be. The aim is to provide cheaper data availability for rollups without keeping that data in Ethereum's execution state forever. Ethereum's scaling guide explains the same trade-off: rollup data is temporarily stored in blobs because permanent calldata storage is costly.

This is a concrete example of Buterin's preference for narrow base-layer duties. Ethereum does not need to execute every rollup transaction itself to provide a security anchor. It needs to make enough data available and enforce the settlement rules that let users verify or exit. Whether a specific rollup meets that standard depends on its implementation, not its marketing category.

## Governance Cannot Be Reduced to Token Holdings

Buterin has been unusually direct about the problems of simple coin voting. In ["Moving beyond coin voting governance"](https://vitalik.eth.limo/general/2021/08/16/voting3.html), he argues that token-weighted systems can privilege wealthy and coordinated holders, concentrate attention on token price, and expose a protocol to vote buying or borrowed voting power. The argument is not that onchain governance is always wrong. It is that holding a transferable financial asset is an incomplete measure of who should decide every issue.

The problem becomes sharp when a governance vote controls a treasury, an oracle, a smart-contract upgrade, or user funds. A majority can be formally valid and still have incentives that conflict with users, developers, or minority participants. Timelocks can give people time to react, but they do not turn a captured vote into a good decision. Delegation can improve participation while introducing its own concentration risks.

This is why Buterin repeatedly returns to limited governance. Put fewer decisions under a token vote. Constrain what a vote can change. Delay sensitive changes. Leave some decisions to offchain social coordination where users can reject an upgrade or fork away. These measures are not a universal recipe. They are ways to reduce the damage a captured mechanism can do.

Quadratic funding belongs in the same line of thought. The mechanism gives a matching advantage to projects supported by many contributors, rather than only by the largest direct donations. It does not create a perfect democracy. It needs a credible answer to fake identities, collusion, and the source of the matching pool. Its value is that it makes the funding rule visible and makes a particular choice about whose support should count more.

## Soulbound Ideas and the Limits of Onchain Reputation

Buterin's 2022 ["Soulbound" essay](https://vitalik.eth.limo/general/2022/01/26/soulbound.html) explores non-transferable onchain items. The core use case is simple. A credential intended to show that a person attended an event, completed a course, or performed a role loses much of its meaning if anyone can buy it from the original recipient.

The essay is a proposal, not a completed identity system or a guarantee that an NFT can be bound to a human. Buterin points out that naive non-transferability is weak: a person can transfer control of an account that holds the item, or need to move assets to a new wallet after a security problem. A useful design may need revocation, recovery, privacy, and a way to distinguish the holder of an address from the subject of a claim.

That caution is more important than the label. Public onchain reputation can make people easier to profile. A credential can be validly signed and still be false, obsolete, coerced, or used in a context the issuer never intended. A governance system based on participation can favor people who had time, access, or money to participate. A credential system needs contestability and data minimization as much as it needs signatures.

## The Throughline: Useful Power With Visible Limits

Buterin's Web3 philosophy is coherent because it joins technical design to limits on power. The Ethereum whitepaper supplied a general-purpose execution layer. Proof-of-stake changed the network's consensus mechanism. Rollups and blobs shift much execution away from the base layer. Governance research asks who gets to change the rules. Identity work asks what a credential should reveal and whether it can be transferred.

None of those pieces creates a finished decentralized society. They create choices that users and builders have to examine. Who can stop a transfer? Who can change a contract? Who can read a credential? Who pays for verification? Who can leave if the operator fails? A project that gives clear answers to those questions has done more for Web3 than one that only repeats the word decentralization.
