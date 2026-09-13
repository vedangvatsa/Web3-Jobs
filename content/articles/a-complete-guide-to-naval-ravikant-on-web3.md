---
title: What does Naval Ravikant think about Web3
ogTitle: "WHAT DOES NAVAL RAVIKANT THINK ABOUT WEB3"
description: >-
  A deep dive into the philosophy of Naval Ravikant, a celebrated entrepreneur,
  investor, and philosopher, on Web3. This guide covers his views on.
image: /images/zhenyu-luo-kE0JmtbvXxM-unsplash.jpg
category: Industry Insights
data-ai-hint: man thinking
publishedDate: '2026-03-11'
lastUpdated: "2026-09-13"
---

Naval Ravikant's crypto commentary connects two claims: Bitcoin introduced money that can operate without a central issuer, and public blockchains make it possible to create markets around software. He has been enthusiastic about both ideas, but he has also described the space as early, speculative, and difficult to use. That combination is often lost when individual aphorisms are treated as a complete investment thesis.

Ravikant is the co-founder and former CEO of AngelList. AngelList's [company history](https://www.angellist.com/blog/angellist-10-years) says Ravikant and Babak Nivi started it in 2010 after publishing Venture Hacks. His [personal site](https://nav.al/about) describes him as an entrepreneur and investor and links the podcast and writing used here. Those are direct sources for his biography. They do not verify every portfolio claim often repeated in promotional profiles, so this article does not rely on a list of purported early investments.

## Start with the recorded claims

In a 2014 talk, Ravikant described Bitcoin as "a way to move money across the world for free" and compared the invention to the early internet. The talk is available in the [Naval podcast archive](https://nav.al/bitcoin). His language was aspirational and came before later fee cycles, exchange failures, and years of scaling work. It should not be read as a guarantee that a Bitcoin transaction will always be free or fast.

His recurring point is that the internet made information cheap to copy, while cryptographic networks can create scarce digital units and transfer them without a bank maintaining a central ledger. Bitcoin's [white paper](https://bitcoin.org/bitcoin.pdf) describes the basic mechanism: participants broadcast signed transactions, nodes order them into proof-of-work blocks, and each node can validate the chain under shared rules. The white paper supports the design description. Claims that Bitcoin is desirable money, resistant enough to censorship, or superior to state currencies are political and economic judgments.

Ravikant has framed this as a separation of money and state, by analogy with the printing press and information. In his [conversation with Balaji Srinivasan](https://nav.al/balaji), he described Bitcoin as a way to create a new form of money outside government control. The analogy has limits. Governments still regulate exchanges, taxes, energy markets, and companies that handle crypto. Bitcoin holders also face price volatility, transaction fees, key loss, and legal obligations. The system can reduce reliance on a particular intermediary for a valid on-chain transfer; it does not remove a person from law or from every financial institution.

## Money is only one layer

Ravikant's broader Web3 view relies on programmable blockchains. Bitcoin's base protocol records bitcoin transfers with intentionally limited scripting. Ethereum's [developer documentation](https://ethereum.org/en/developers/docs/intro-to-ethereum/) describes a different model: a shared state machine on which smart contracts, programs stored and executed by the network, can run. A smart contract is not automatically legally binding, secure, or autonomous in every practical sense. It is code whose effects depend on the blockchain and the rules surrounding it.

In the first of his 2022 interviews with Vitalik Buterin, Ravikant said blockchains are "APIs with money." The [published transcript](https://nav.al/vitalik) provides the context. An API is an interface through which software can request a service. The phrase means that a developer can call an open network and have the call affect a shared asset ledger. A token transfer, decentralized exchange trade, or collateral deposit can be combined with other programs without asking a bank for access to its internal system.

This composability is a real technical property of public smart-contract platforms, but it has practical limits. A contract may call another contract only under the rules and costs of the chain. A user still needs a wallet, transaction fee funds, and a correctly signed transaction. Contract interactions can fail because of a bug, a changed oracle feed, insufficient liquidity, a network outage, or a malicious approval request. When the service connects to facts outside the chain, it needs an oracle, which creates another trust and reliability question.

Ravikant's language about new markets follows from this. A public ledger can represent balances, claims, membership rights, or a unique token. Programs can set exchange rules and settle trades. This makes it cheaper to create a market mechanism than negotiating a custom agreement for every transaction. It does not ensure that the represented claim is legally enforceable, that the asset has value, or that a market is liquid. Tokenizing an off-chain asset adds custody, issuer, and legal questions rather than removing them.

## Permissionless capital formation

Ravikant has argued that crypto enables "permissionless capital formation." In a [2017 appearance on the Tim Ferriss Show](https://tim.blog/2017/10/27/naval-ravikant/), he described tokens as a new way to finance networks and align users, investors, and contributors. The claim describes lower technical barriers: someone can deploy a token contract or sell a token globally without the gatekeeping process used by a traditional venture fund or stock exchange.

Lower barriers are not the same as no rules. In the United States, the Securities and Exchange Commission's [Framework for 'Investment Contract' Analysis](https://www.sec.gov/corpfin/framework-investment-contract-analysis-digital-assets) explains factors it considers when evaluating whether a digital asset is offered and sold as an investment contract. Whether a particular token is a security depends on facts and circumstances. The framework is not a blanket classification, but it directly contradicts the idea that a technical launch makes securities law disappear.

There is also a distribution problem. A token sale can broaden access beyond a small set of venture investors. It can also transfer risk to buyers who cannot assess code, token supply, release schedules, or the legal entity behind the project. Early token purchasers and insiders may hold a large share of voting power. A project can call its sale community ownership while retaining administrator keys and effective control of the treasury. These are observable governance questions, not objections to the existence of tokens.

Ravikant's formulation is strongest when it identifies a new funding mechanism. It is weakest when readers turn it into an assurance that the mechanism is fair. A permissionless system can make participation easier while making diligence and recovery the participant's responsibility. The same feature that lets a small developer deploy a contract also lets an anonymous promoter deploy a misleading one.

## Ownership, custody, and exit

Another thread in Ravikant's work is individual sovereignty. In a public-key system, a private key authorizes transactions from an address. Self-custody means the user, rather than an exchange, controls that key material. The Bitcoin developer guide explains key generation and signing in its [wallet section](https://developer.bitcoin.org/devguide/wallets.html). This is the concrete basis for the saying "not your keys, not your coins."

Self-custody offers a specific form of control. A custodian cannot refuse a valid transaction simply because it dislikes the recipient, provided the user can broadcast the transaction and the network accepts it. But control comes with irreversible risks. A stolen private key lets an attacker sign. A lost recovery phrase can eliminate access permanently. On-chain transfers usually cannot be reversed by a customer-support team. Hardware wallets, multisignature arrangements, and careful backups can reduce particular risks, but they introduce their own operational choices.

Ravikant often treats exit as a check on power: if a service, jurisdiction, or network behaves badly, people should have a route to leave. A blockchain may provide exit at the asset layer when a user can move tokens to another address or interface. It does not guarantee an exit from every dependency. Stablecoins can have issuer controls. Bridges depend on their operators and contracts. A decentralized social protocol still needs client software, hosting, moderation decisions, and a way for other people to find each other. A useful analysis asks which layer permits exit and which layer still has a gatekeeper.

This is also where slogans about a "personal operating system" need grounding. A wallet can manage keys. A decentralized identifier can associate public keys with a controller. Verifiable credentials can let an issuer sign a claim that a verifier checks. The World Wide Web Consortium's [DID Core recommendation](https://www.w3.org/TR/did-core/) defines the DID data model and operations. It does not create a universal identity network, require any company to accept a credential, or solve how a person recovers access after losing keys.

## Public chains and private databases

Ravikant has been skeptical of corporate uses of the phrase "blockchain technology" when the system is permissioned. The reason is clear: if one company or a small consortium chooses the validators and can edit rules, the system does not provide the same censorship resistance or open participation as Bitcoin or Ethereum. A conventional database may be faster and simpler for parties that already trust an administrator.

That critique should be applied carefully. Permissioned ledgers can be useful when regulated entities need defined membership, audit trails, and privacy controls. They are not failed versions of public chains. They make a different trade-off. Public chains make shared verification available to outsiders, but data availability, fees, privacy, and governance can be difficult. Private systems restrict participation, but can define accountability through contracts and regulation. Calling one a blockchain does not settle which model fits a use case.

The same caution applies to decentralization. A public chain can have many node operators and still concentrate development influence, stake, mining power, or access through a few exchanges. A company-run product can publish source code or support data export while remaining centrally operated. Ravikant's distinction is a prompt to inspect the trust model, not a substitute for doing so.

## How to read the philosophy

Ravikant offers a useful lens for understanding why crypto supporters care about public networks. They see a new kind of asset ledger, programmable settlement, and a route around some traditional permission systems. His recorded statements make the strongest case for examining whether an intermediary is necessary and whether users can leave with their assets or data.

They do not establish that every token is an investment, that every smart contract is safe, or that a public chain removes legal and social power. The technology changes who must be trusted in a transaction. It often shifts more responsibility to the user, software author, validator set, and surrounding interface. Keeping those limits alongside Ravikant's claims gives a clearer account of his Web3 view than either praise or dismissal alone.
