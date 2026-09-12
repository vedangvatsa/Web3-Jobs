---
title: What does Naval Ravikant think about Web3
description: Naval Ravikant's case for public blockchains, programmable ownership, individual custody, and the trade-offs that his theory requires readers to face.
image: /images/zhenyu-luo-kE0JmtbvXxM-unsplash.jpg
category: Industry Insights
data-ai-hint: man thinking
publishedDate: '2026-03-11'
lastUpdated: "2026-09-12"
---

## Introduction: blockchains as new markets

Naval Ravikant approaches [Web3](/what-is-web3) as an argument about institutions rather than a catalogue of coins. His recurring interest is what changes when people can hold an asset, verify a rule, and exchange value through software without asking a platform operator, bank, or company to maintain the central ledger. The result, in his account, is a new kind of money and a new kind of market.

That framing makes sense alongside the themes Ravikant has developed elsewhere. In his long-form discussion of wealth, he defines wealth as assets that can earn while their owner is not working and repeatedly emphasizes ownership, code, media, and permissionless distribution. In the ["How to Get Rich" transcript](https://nav.al/rich), he calls software and media forms of permissionless labor because they can be reproduced at very low marginal cost. Blockchains add a different capability: they can make scarce digital balances and executable transfer rules available on a shared network.

This is an analytical position, not an investment recommendation. A blockchain can settle a transfer according to its own rules; it cannot determine whether a business is valuable, whether a token buyer was given adequate disclosure, or whether an asset represents a legal claim outside the network. Ravikant's strongest ideas are useful when they are kept at that level of precision. They identify a new coordination tool. They do not remove economics, security, law, or the need to decide whom to trust.

## Money without a central issuer

Bitcoin was the first broadly used example of the design Ravikant finds important. Its original paper proposed a peer-to-peer electronic cash system in which participants validate a chain of transactions rather than rely on a central payment intermediary. The [Bitcoin paper](https://bitcoin.org/en/bitcoin-paper) describes the mechanism as a way to make online payments directly from one party to another without a financial institution in the middle.

The important property is not that a number appears on the internet. Digital numbers are easy to copy. The difficult question is whether two parties can agree that the same unit was not spent twice and that the ownership record will not be rewritten at the request of an administrator. Bitcoin answers that question through public-key signatures, consensus rules, and an economic cost for proposing blocks. Participants do not need to know one another personally to validate the same history.

Ravikant treats that as a political and economic event. Money normally depends on institutions that manage issuance, settlement, identity checks, and enforcement. Bitcoin separates the ability to hold and transfer the network's unit from membership in a particular bank or country. That does not make it outside the reach of all states: exchanges, merchants, custodians, miners, users, and developers operate under laws where they live. It does mean the base transfer rules are public software rather than a private bank database.

The limits belong in the same sentence. Bitcoin's price can be volatile. Transactions may involve fees and confirmation delays. A holder who loses key material may lose access. A public address is not the same as a private identity, and blockchain records can reveal patterns that users did not expect. A monetary system can be open at the protocol layer while the most convenient ways of buying, storing, and spending its asset are managed by companies. Ravikant's case is about the availability of an alternative rule system, not a promise of frictionless financial life.

## From money to programmable property

Ravikant's interest in Ethereum follows from the idea that a shared ledger can apply rules beyond a single currency. Ethereum's original white paper proposed a general-purpose blockchain on which people could publish contracts that encode state transitions. It explicitly discussed uses including custom currencies, financial instruments, non-fungible assets, and decentralized organizations. Read the [white paper](https://ethereum.org/en/whitepaper/) for the technical statement of that design.

This is the basis for the phrase "blockchains are APIs with money," often associated with Ravikant's way of explaining the space. An application programming interface lets a developer call a service through published rules. A public blockchain offers a similarly accessible interface for state changes, with an asset and fee system native to the network. A program can receive a signed transaction, check a condition, update a balance, and send another transaction under code that anyone can inspect.

The phrase is compact, but it can mislead if it makes blockchains sound like ordinary cloud services. An API call to a conventional provider is usually cheap, fast, private to the relevant parties, and reversible by the provider. A public-chain transaction is broadcast, ordered under a consensus process, paid for with a network fee, and may be difficult or impossible to reverse after confirmation. The cost and slowness are not implementation accidents; they are connected to the system's shared verification model.

Ravikant made this trade-off explicit in his 2022 conversation with Vitalik Buterin. He described Ethereum as a "trusted computer in the cloud" that users can audit, then contrasted that property with conventional computing's performance. The [published transcript](https://nav.al/vitalik) is useful because it records both sides of the claim: the network's rules can be publicly verified, but replicated execution is expensive and cannot replace every database, video service, or real-time application.

## The appeal of permissionless creation

The word permissionless has a precise attraction. A developer can deploy software to a public network without negotiating an API contract with a platform company. A user who meets the protocol's technical requirements can interact with that software without being individually approved by its author. This lowers one kind of gatekeeping. It can let a small team release a financial primitive, a marketplace rule, or a digital collectible contract without first becoming a regulated financial institution or winning a platform-distribution deal.

Ravikant sees that permissionless entry as a source of experimentation. In the earlier web, a person could publish text and code cheaply, but moving money, enforcing a transfer rule, or maintaining a shared ownership record usually required a company, a bank relationship, or a marketplace. A public smart-contract platform makes some of those functions programmable. The arrangement can produce open competition around clients, wallets, analytics, and interfaces because multiple parties can read the same shared state.

The adjective does not mean unrestricted in every sense. A protocol may not require a developer's permission, but an app can still be blocked by a domain registrar, app store, hosted service, payment company, employer, or local law. A contract may technically accept a transaction, while a jurisdiction may still regulate the person offering the product. A user may be able to interact with code without supplying a name, but a regulated exchange may need identity checks before converting local currency. The absence of one gatekeeper does not abolish all of them.

Capital formation is the area where loose language causes the most damage. Tokens have let projects distribute assets to a broad online audience, but a broad technical audience is not automatically an audience that may legally buy an investment. The SEC's former framework, which the agency marked as withdrawn and superseded in 2026, explained that the facts around a digital-asset offer matter: a purchaser's expectation of profit, the promoter's managerial role, the asset's functionality, and the way it is marketed can all affect the analysis. See the [SEC page](https://www.sec.gov/corpfin/framework-investment-contract-analysis-digital-assets). Permissionless code is not a legal exemption.

## Tokens are not automatically equity

Ravikant's language about ownership is productive when it directs attention to incentives, but it needs a sharp distinction between a token and a share. Equity in a corporation is a legal interest with statutory and contractual rights. It can include voting rights, claims on residual value, disclosure rights, and protections that depend on the jurisdiction and governing documents. A token may grant access to software, voting power under code, a fee discount, a membership signal, or no enforceable claim beyond the ability to transfer the token.

Some token designs do create governance rights. Others deliberately avoid them. Some are sold to fund development of a network that does not yet exist. Others circulate after a network is working. These facts change both the economic story and the legal analysis. Calling a token "permissionless equity" collapses differences that a buyer, builder, or regulator must examine.

The Ethereum white paper itself shows the breadth of possible designs. It describes token systems as code that tracks balances and permits transfers under specified rules. That is powerful because a developer can define the rules. It is also a warning: code can represent many different things, and its technical ability to transfer a balance does not tell readers what rights that balance conveys outside the contract.

This is where Ravikant's emphasis on first principles helps. Before asking whether an asset will rise in price, ask what the contract does. Who can alter it? Who controls the upgrade path? What funds are collected, who holds them, and what information do participants receive? Does the holder receive revenue, governance influence, utility, or only exposure to a market price? The answers are more informative than the label "community-owned."

## Self-custody and sovereignty

Ravikant's version of individual sovereignty is most visible in his support for private-key control. A private key can authorize transactions from an address under a blockchain's rules. If the holder, rather than an exchange or bank, controls the key material, the holder is not relying on that intermediary to approve each transfer. That is the concrete meaning behind the familiar [self-custody](/how-to-choose-a-crypto-wallet) claim.

It is a change in responsibility as well as a change in control. An exchange account may offer password recovery, customer support, account monitoring, and sometimes regulated custody obligations. A self-custody wallet can remove an exchange from the signing path, but it introduces risks from seed-phrase theft, malicious software, poor backups, coercion, and user error. An irreversible transaction is not more sovereign because it is irreversible; it is a transaction with different failure modes.

Ravikant discussed these trade-offs in the Buterin conversation when the speakers turned to social recovery wallets. He noted that a person who wants to hold their own assets may find direct key management intimidating and that multisignature or social-recovery arrangements can spread recovery authority among chosen parties. The [transcript](https://nav.al/vitalik) does not present this as a finished answer. It presents the practical problem: a system that gives users more direct control must also give them usable ways to recover from loss.

Sovereignty is also not isolation. A person can hold keys while relying on open-source maintainers, wallet vendors, internet access providers, miners or validators, market makers, and legal systems. The aim is to reduce particular dependencies, especially a single intermediary's ability to block a valid transaction, not to pretend that complex social and technical systems disappear.

## Privacy is a separate property

Public blockchains are often described as anonymous. That is usually wrong. Bitcoin and Ethereum addresses are pseudonymous identifiers, and their transaction histories are publicly observable. An address may not contain a real name, but exchanges, merchants, analytics firms, counterparties, or a person's own repeated behavior can connect activity to an identity. The permanent availability of a ledger can make that analysis easier over time.

Ravikant has treated privacy as an important complement to decentralization. In the conversation with Buterin, the speakers point out that transparent ledgers reveal activity and discuss zero-knowledge proofs as a way to prove a statement without revealing all underlying information. That is a technical direction, not a blanket privacy guarantee. A privacy system depends on its protocol, wallet choices, transaction patterns, counterparties, and the laws governing its users.

The separation is useful. A network may be hard for one party to censor yet expose every transfer. Another may hide transfer amounts but retain centralized validator control. Another may have an open ledger and a centralized interface that collects extensive customer data. "Decentralized," "private," and "self-custodied" answer different questions. Ravikant's philosophy is clearest when it refuses to use one as a stand-in for the others.

## Public chains and private databases

Ravikant has been skeptical of the phrase "blockchain technology" when it refers to a private consortium database. The criticism is not that a consortium cannot keep useful shared records. Companies regularly need audit trails, access controls, replication, and coordinated workflows. The criticism is that a system operated by a known group of institutions has not solved the same problem as a public network that permits unknown participants to verify and submit transactions under neutral rules.

A private database can be faster, more confidential, and easier to change. It can also have clear legal accountability and a defined operator responsible for support. Those are often advantages. It may be the appropriate system for payroll, medical records, confidential supply-chain data, or a regulated settlement process. Calling it a blockchain does not make it censorship resistant or permissionless, and rejecting it for that reason does not make it technically inferior for its intended job.

The architectural choice follows from the trust problem. If one organization is already trusted to operate the ledger, a conventional database may be sufficient. If participants do not want any one organization to own the ledger, they must accept the cost of shared validation and slower coordination. The choice is not between old technology and new technology. It is between different operators, rules, costs, and failure modes.

## What the philosophy leaves open

Ravikant gives Web3 a coherent question: can software create a shared market in which people hold assets and interact under public rules rather than through a platform owner? The question remains valuable even when a specific token, protocol, or company fails. It directs attention to custody, access, interoperability, and who earns the economic upside from a network.

It does not answer whether a project has product-market fit, whether its governance works, whether its token distribution is fair, or whether a smart contract is secure. It cannot decide whether a transaction is ethically desirable or whether an asset's market price reflects use. Those decisions require evidence outside the chain: code reviews, legal terms, financial disclosures, user behavior, and careful analysis of the people who still control essential components.

For Ravikant, the enduring idea is that money and markets can be made programmable and open to global participation. The practical test is less grand. Read the code and terms, identify the administrators and custodians, understand what a token actually grants, and distinguish an open protocol from a company that uses blockchain vocabulary. That is where the philosophy meets a real product.
