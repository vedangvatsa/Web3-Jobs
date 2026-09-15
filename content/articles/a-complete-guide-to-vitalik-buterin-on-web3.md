---
title: What does Vitalik Buterin think about Web3
ogTitle: "WHAT DOES VITALIK BUTERIN THINK ABOUT WEB3"
description: >-
  cover the mind of Vitalik Buterin, the creator of Ethereum. This guide covers
  his initial vision for a 'world computer,' his evolving thoughts on.
image: /images/zhenyu-luo-kE0JmtbvXxM-unsplash.jpg
category: Industry Insights
data-ai-hint: man glasses
publishedDate: '2026-03-11'
lastUpdated: "2026-09-15"
---
## What Buterin Means by Web3

Vitalik Buterin's case for Web3 starts with a narrow technical claim: a blockchain can hold both a shared record and programs that change that record under rules that participants can inspect. In his [2013 Ethereum whitepaper](https://ethereum.org/en/whitepaper/), he proposed a blockchain with a built-in programming language. The paper describes applications for currencies, financial contracts, identity systems, decentralized file storage, and decentralized autonomous organizations. It did not promise that every application should move onchain.

That distinction is useful. "Web3" is a loose label used for wallets, tokens, applications, and companies with very different levels of decentralization. Buterin's writing is more specific. He repeatedly asks who can change a system's rules, who can block a user, what data must be public, and whether a user can leave without losing access to their assets or social connections. Those questions explain both his support for Ethereum and his criticism of parts of the crypto sector.

This article separates documented events from Buterin's arguments. His essays are primary sources for his views, not proof that a proposal works or that the wider ecosystem agrees with it.

## From Bitcoin Magazine to Ethereum

Ethereum's official history says Buterin published the whitepaper on November 27, 2013, before the project launched in 2015. The [official timeline](https://ethereum.org/en/history/) also records the ether sale beginning on July 22, 2014 and the Frontier launch on July 30, 2015.

The whitepaper's central move was to make the blockchain more general-purpose. Bitcoin scripts can express certain spending conditions. Ethereum proposed an execution environment in which a program, usually called a smart contract, can hold assets and update its own state when a transaction calls it. A smart contract is not a legal contract by default. It is code deployed to the network. Its behavior depends on the code, the data supplied to it, and the protocol rules that nodes enforce.

This design made a broad category of applications possible, but it also created new failure modes. A contract can contain a bug, an administrator can retain special powers, and an application can use a decentralized settlement layer while depending on a conventional website, cloud service, or identity provider. Ethereum's history provides an early example of the stakes. After an attack on The DAO in 2016, Ethereum changed its rules to move funds from the affected contract. Some participants rejected that decision and continued the old chain as Ethereum Classic. The [Ethereum history page](https://ethereum.org/en/history/) describes both the recovery fork and the split. The episode does not settle the philosophical argument, but it shows that a blockchain's code and its social governance cannot be cleanly separated.

## Decentralization Is a Set of Properties

Buterin does not use decentralization as a yes-or-no label. In [The Limits to Blockchain Scalability](https://vitalik.ca/general/2021/05/23/scaling.html), he distinguishes architectural, political, and logical decentralization. Architectural decentralization concerns how many computers run a system. Political decentralization concerns how many people or organizations control it. Logical decentralization concerns whether the system behaves as one object or many independent objects.

That framework avoids a common shortcut. A system can have many nodes yet still be politically concentrated if a small group controls the client software, a key hosting provider, a bridge, a sequencer, or the user-facing interface. Conversely, adding a token does not make an application politically decentralized. The relevant evidence is practical: who holds upgrade keys, what a user needs to transact, and whether an alternative operator can take over without permission.

In the same essay, Buterin gives three reasons to value decentralization: fault tolerance, resistance to attacks, and resistance to collusion. They are claims about risk, not guarantees. A decentralized network can still fail through software defects, incentive problems, compromised infrastructure, or coordinated behavior. More independent operators can also make upgrades slower and coordination harder. Those costs are part of the trade-off, not an exception to it.

Buterin's related idea of [credible neutrality](https://vitalik.ca/general/2020/08/20/credibly-neutral.html) concerns systems that many rival parties need to use. He argues that a neutral mechanism should not discriminate against people or outcomes, should be easy to verify, and should not depend on a trusted authority's judgment. His examples include protocols and public infrastructure. The phrase describes a design goal. It does not show that every protocol calling itself neutral has achieved it.

## A Programmable Base Layer, Not an App Store

The Ethereum whitepaper presents the protocol as a platform for programs with shared state. That differs from an app store model in one important respect: an Ethereum transaction is validated by network rules, not approved by a single platform operator. In principle, anyone can deploy a contract and anyone with the required funds can send a valid transaction.

In practice, users often encounter intermediaries first. They may use a hosted wallet, a centralized exchange, a wallet's default RPC provider, a domain name, a browser extension, or a company-operated interface. Buterin made this distinction directly in [The Third Crypto Renaissance](https://vitalik.ca/general/2023/12/28/renaissance.html). He wrote that the original crypto vision centered on public, permissionless networks and observed that users often rely on centralized services for access and convenience.

His commentary therefore focuses on the full stack. Self-custody matters because a user who does not control their signing key can lose the ability to move assets. Open standards matter because they can let a person use another interface or provider. Local verification and lightweight clients matter because users otherwise have to trust a service to tell them the chain's state. None of these properties makes a product safe. A user can still sign a malicious transaction, send funds to the wrong address, or interact with a flawed contract.

The practical reading is narrower than the slogan "replace intermediaries." A decentralized protocol can reduce a particular party's control over settlement or data. It does not remove the need for software maintenance, dispute resolution, customer support, legal compliance, or careful key management. Whether decentralization is worth its added complexity depends on the threat model and the application.

## Scaling Through Rollups

Ethereum's base layer has limited block space. If every application executed every transaction directly on mainnet, fees would rise when demand exceeds that capacity. Buterin has argued for a [rollup-centric Ethereum roadmap](https://ethereum-magicians.org/t/a-rollup-centric-ethereum-roadmap/4698), where layer 2 systems execute many transactions and publish data or proofs to Ethereum.

A rollup is not one product category with one security model. Ethereum's [layer 2 documentation](https://ethereum.org/en/layer-2/) distinguishes optimistic rollups from zero-knowledge rollups. Optimistic systems generally allow challenges during a dispute window. Zero-knowledge rollups submit cryptographic validity proofs. The details vary by implementation, including who operates sequencing, how withdrawals work, what data reaches Ethereum, and which upgrades can change the system.

The factual change on Ethereum was EIP-4844, also called proto-danksharding. It activated in the Cancun-Deneb upgrade on March 13, 2024, according to the [official fork history](https://ethereum.org/en/history/). The upgrade added blob-carrying transactions. Blobs provide a less expensive, temporary place for rollups to publish data than ordinary calldata. Ethereum's [danksharding documentation](https://ethereum.org/en/roadmap/danksharding/) says blob data is not accessible to the Ethereum Virtual Machine and is pruned after a fixed period, about 18 days at the time of writing.

The limitation matters. Lower data costs can reduce one cost paid by a rollup, but they do not automatically make every layer 2 transaction cheap. A user's fee can also depend on the rollup's own demand, its fee policy, the cost of proofs or sequencing, and the exchange rate of the assets involved. Full danksharding remains a roadmap item. The official documentation says it requires further work, including data availability sampling and proposer-builder separation.

## Proof of Stake and Its Boundaries

Ethereum switched from proof of work to proof of stake on September 15, 2022. The [Paris upgrade specification](https://github.com/ethereum/execution-specs/blob/master/network-upgrades/mainnet-upgrades/paris.md) defines the change, and Ethereum's [Merge documentation](https://ethereum.org/en/roadmap/merge/) explains that proof-of-work mining stopped while the Beacon Chain's proof-of-stake consensus took over.

Under proof of stake, validators put up ETH as collateral and participate in proposing and attesting to blocks. A validator that breaks certain protocol rules can be penalized through slashing. The mechanism changes the security model. It does not mean Ethereum has no operators or that each participant has the same influence. Running a validator requires technical operations, and many ETH holders use staking pools or service providers instead of running validators themselves.

Buterin has argued that proof of stake makes attacks more costly to sustain and makes certain recovery responses more feasible than in proof of work. Those are arguments in his [proof-of-stake FAQ](https://vitalik.ca/general/2020/11/06/pos2020.html), not measurements of a permanently solved security problem. Concentration in staking services, client diversity, censorship pressure, and the incentives around block construction remain live design concerns. The protocol can reduce some dependencies while creating others.

## Governance, Public Goods, and Coin Voting

Buterin is skeptical of using token ownership as the only measure of political legitimacy. In [Moving Beyond Coin Voting Governance](https://vitalik.ca/general/2021/08/16/voting3.html), he lists several ways coin voting can fail: wealthy holders can buy influence, voters may have interests outside a protocol, and attackers may borrow tokens or use short-term positions to affect a vote. He does not argue that governance is unnecessary. He argues that one-token-one-vote should not be treated as a complete answer.

His alternatives are experiments with different trade-offs. Quadratic funding allocates matching funds partly by the number of distinct contributors to a project, rather than only by the amount contributed. In his [introduction to quadratic funding](https://vitalik.ca/general/2020/08/21/quadratic-funding.html), Buterin explains that a project with broad small-dollar support can receive more matching support than a project backed by a few large donors. The method requires identity or anti-Sybil protections. Without them, one actor can split money across many accounts and imitate broad support.

The public-goods argument follows from a concrete funding problem. Open-source software, research, and shared infrastructure can benefit people who do not pay their builders. A market transaction alone may underfund them because the provider cannot easily charge every beneficiary. Quadratic funding is one proposed response. It is not a neutral algorithm that discovers social value, because the matching pool, identity rules, and eligibility criteria are governance choices.

Buterin and collaborators have also explored proof of personhood: systems intended to limit one person to one account without requiring a conventional government identity. The problem is difficult. Any method has to balance privacy, accessibility, resistance to fake identities, and the risk of excluding people who cannot meet its requirements. His writing treats it as an open technical and social problem, not as a completed foundation for online democracy.

## Identity, Reputation, and DeSoc

In 2022, Buterin, E. Glen Weyl, and Puja Ohlhaver published [Decentralized Society: Finding Web3's Soul](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4105763). The paper proposes "soulbound" accounts and non-transferable attestations as building blocks for a decentralized society, or DeSoc. The authors use examples such as educational credentials, membership, and repayment history. Their goal is to model relationships and commitments that a tradable token cannot represent well.

The paper is a proposal, not an Ethereum standard or a deployed universal identity system. Its authors also describe serious risks. Public, permanent attestations can expose sensitive information. A lost key can make recovery difficult. Social graphs can enable surveillance or discrimination. Non-transferability alone cannot prove that a credential is true, fair, or issued by a trustworthy institution.

This is one area where Buterin's Web3 view is often simplified. He does not present token ownership as enough to represent a person or community. The DeSoc paper argues that an ecosystem built only around transferable financial assets misses social context. That is commentary about what networks should support. The facts that would determine whether any implementation is acceptable are concrete: what gets stored, who can read it, who can issue or revoke it, how recovery works, and whether people can participate without exposing themselves.

## What the Record Supports

The documentary record supports several clear points. Buterin authored Ethereum's initial whitepaper. Ethereum launched in 2015, moved to proof of stake in 2022, and added blob transactions in 2024. He has published detailed arguments for decentralization, credible neutrality, rollups, alternatives to coin voting, public-goods funding, and identity systems that account for social relationships.

It does not support treating those arguments as guarantees. Ethereum's protocol is maintained through a broad set of client teams, researchers, validators, application developers, and users. Buterin is influential, but he does not unilaterally deploy network upgrades. The [Ethereum governance documentation](https://ethereum.org/en/governance/) describes an off-chain process involving discussion, specifications, client implementation, and community adoption. A valid assessment of Web3 should examine the actual control points and trade-offs of a particular system, rather than infer them from Ethereum's name or Buterin's stated ideals.
