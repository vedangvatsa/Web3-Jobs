---
title: Coinbase Wallet and Base Are Again Presented as Separate Products
description: >-
  Coinbase's current wallet, help and Base materials distinguish the Coinbase
  Wallet self-custody product from the Base blockchain, after Coinbase Wallet
  was introduced as the Base App in July 2025.
image: /images/news/base-wallet-cover.jpg
category: News
data-ai-hint: coinbase wallet base blockchain
publishedDate: '2026-09-12'
lastUpdated: "2026-09-13"
ogTitle: COINBASE WALLET & BASE PRODUCT SEPARATION
---

Coinbase's current customer-facing materials draw a line between two names that were deliberately brought together in 2025. **Coinbase Wallet** is now the name on the company's wallet website, help center and current wallet terms. **Base** is the public blockchain described in Base's website and developer documentation. The two are connected products, but they do different work: one is software used to hold keys and sign transactions; the other is the network on which transactions and applications can run.

The distinction follows a documented, one-way historical change. On July 16, 2025, Coinbase introduced the **Base App** as the replacement for Coinbase Wallet, according to [contemporaneous reporting on the launch](https://www.cnbc.com/2025/07/16/coinbase-steps-into-consumer-market-with-stablecoin-powered-everything-app-that-goes-beyond-trading.html). Coinbase's Base team had set out the direction months earlier: its February 2025 post said Base would support developers while Coinbase Wallet would bring people onchain, and described a rebuilt wallet with social discovery and mini-apps planned around that model in [its own announcement](https://blog.base.org/evolving-coinbase-wallet-to-bring-the-world-onchain).

What can be verified now is more limited and more useful than a broad claim about another rename. Coinbase's live [wallet site](https://wallet.coinbase.com/) calls the product Coinbase Wallet and describes it as a self-custodial wallet that works across Bitcoin, Ethereum, Solana and other networks. Coinbase's [current wallet terms](https://wallet.coinbase.com/terms-of-service) also define the mobile application and related account services as Coinbase Wallet. Those pages establish the present name of the wallet product. They do not, on their own, document a formal Base App-to-Coinbase Wallet rebrand, so this report does not make that assertion.

Base, meanwhile, remains the name of the blockchain. The [Base home page](https://base.org/) calls it a blockchain built by Coinbase, while the [technical documentation](https://docs.base.org/get-started/base) describes Base as an EVM chain. EVM, short for Ethereum Virtual Machine, refers to the common transaction and smart-contract environment used by Ethereum-compatible networks. Base's documentation says Ethereum tools, wallets and libraries can connect to Base by using its network settings; it lists Base Mainnet's chain ID as `8453` and Base Sepolia's testnet chain ID as `84532` in its [connection reference](https://docs.base.org/get-started/connect-to-base).

That is the practical answer to a common naming problem. A user can hold an address in Coinbase Wallet, send an asset over Base, or use a third-party application that runs on Base. The wallet, network and application are not interchangeable names for the same service.

## The 2025 Base App launch

Coinbase presented the Base App in July 2025 as a larger consumer application than a conventional wallet. CNBC reported at the time that the launch combined wallet, trading, payment, messaging, social and mini-app functions, and that activity in the app would run on the Base network. The outlet's report is a useful record of the launch because it states directly that Base App replaced Coinbase Wallet, rather than treating the shared word "Base" as evidence that the blockchain itself had been renamed.

The earlier Base post supplies the primary-source context for that decision. It separated the roles in plain terms: Base was for developers building onchain, Coinbase Wallet was for onboarding people, and the wallet was intended to help people discover those applications. The post also said Coinbase Wallet and Base had joined forces. That was a product strategy, not a statement that a wallet and a chain had become one technical object. A blockchain is a network of records and transaction rules; a wallet is software that authorizes transactions for an address.

The 2025 rollout also explains why old references remain relevant. A report, user guide, app-store listing or integration written during the Base App period may use that name for the consumer application. It should not be read as a reference to the Base network in general. Conversely, a developer saying an application is "on Base" normally means the application uses the Base chain, not that it is inside a Coinbase-operated wallet.

The current picture has another layer. Base's [vision page](https://base.org/about/vision) still describes a product called Base App in passages about trading, payments and consumer access. Its [brand site](https://brand.base.org/) links to "Base App" at `base.app`. Yet visiting [base.app](https://base.app/) currently opens a site headed "Coinbase Wallet" and identifies the consumer product as a self-custodial wallet. These are live naming surfaces that coexist. They show brand and product language in use; they are not a substitute for a dated corporate announcement of a reverse rename.

## What Coinbase Wallet is now

Coinbase's present descriptions place the wallet on the user side of an onchain transaction. The company says in its [getting-started guide](https://help.coinbase.com/en/base/getting-started/get-started) that Coinbase Wallet can be used to trade, earn, send, discover opportunities and chat, and that it does not require a Coinbase account. Its [wallet overview](https://help.coinbase.com/en/wallet) labels the same product Coinbase Wallet and groups its support articles under wallet, trading and security tasks.

Self-custody is the important qualification. Coinbase says in its [explanation of Base wallets](https://help.coinbase.com/en/wallet/getting-started/what-is-coinbase-wallet) that the private keys representing ownership of crypto are stored on the user's mobile device rather than with a centralized exchange. A private key is the credential that can authorize movement of assets at an address. In the related [comparison of a Coinbase account and Coinbase Wallet](https://help.coinbase.com/en/wallet/getting-started/what-s-the-difference-between-coinbase-com-and-wallet), the company says a Coinbase account holds crypto on Coinbase's platform after purchase, while Coinbase Wallet is self-custodial.

That does not mean every wallet setup has identical recovery mechanics. Coinbase's current terms distinguish between a self-custodial externally owned account, commonly called an EOA, and a self-custodial smart wallet account. The terms say users are responsible for the recovery phrase associated with an EOA and for the passkeys or recovery credentials tied to a smart wallet. The company also says it cannot recover crypto if the relevant recovery phrase or passkeys are lost. These are product terms and risk disclosures, not a promise that every wallet feature is available in every country or on every device.

The same terms define Coinbase Wallet as software that can access onchain applications and authorize peer-to-peer transactions on blockchain networks. They also draw a boundary around those connections. Decentralized exchanges, lending protocols, perpetual-futures protocols, prediction markets and other services accessible through the wallet are described as third-party services. Coinbase says it provides that access for convenience, does not control those services' content, and does not warrant or endorse their availability or legitimacy. A wallet interface can therefore make a protocol easier to reach without turning the protocol into a Coinbase product.

Coinbase Wallet is also not confined to Base. The live wallet site says it supports BTC, ETH, SOL and dozens of other chains. The company can promote Base use within the wallet, and its help center can direct people toward Base-specific flows, without making the wallet synonymous with Base. For a user, the distinction affects basic questions: which network will receive an asset, what fees apply, and which address or signing credential controls the transaction.

## What Base is now

Base is the network layer in this account. Base's documentation calls it a standard EVM chain, which means software built for Ethereum-compatible networks can be configured to use it. The documentation publishes a mainnet RPC endpoint, `https://mainnet.base.org`, alongside the chain ID and the BaseScan block explorer. An RPC endpoint is the server interface through which a wallet or application reads network data and submits a signed transaction. Those settings are network infrastructure, not a consumer wallet account.

The difference becomes visible when a transaction is made. Base's [transaction guide](https://docs.base.org/get-started/make-a-transaction) shows an application creating a wallet client, selecting the Base chain and sending a transaction to an address. The example warns developers never to expose a private key. The network receives and processes the signed transaction; the wallet or application is where a person or program controls the signing authority. Base documents the chain's transaction model and endpoints, while Coinbase Wallet documents the consumer software that may manage credentials and present a transaction for approval.

Base's own guidance also makes clear that its ecosystem is larger than Coinbase Wallet. Its [bridge documentation](https://docs.base.org/get-started/bridge-to-base) lists routes for moving assets to Base from a Coinbase account, Ethereum, Solana and Bitcoin. For Ethereum assets, it names external bridge providers and says Coinbase Technologies provides links to those independent providers without taking responsibility for their operations. The page is a network guide: it describes routes into Base, rather than presenting Base as a custody service or a single wallet.

The Base website's current language is aimed at both companies and builders. It says businesses can use Base for trading, payments and agents, and directs developers to the documentation and dashboard. Those are claims made by Base about its intended use and performance. The relevant product fact here is narrower: the site, technical reference and published network identifiers consistently use Base as the blockchain name.

## Why the help center uses both names

Coinbase's support navigation is one reason the names can appear blurred. The [Coinbase Wallet help landing page](https://help.coinbase.com/en/wallet) has a section titled Coinbase Wallet, but links to articles called "Buy and trade on Base," "Send and receive on Base," and "Sign in to your Base account." Its [sign-in article](https://help.coinbase.com/en/base/getting-started/sign-in) instructs people to open Coinbase Wallet, then describes recovery-phrase and passkey paths. It also refers to upgrading a legacy wallet to access "Base mode."

That wording records an integrated product journey. It does not alter the basic categories set out elsewhere in Coinbase's materials. The support pages call the client Coinbase Wallet; the chain documentation calls the network Base. "Base wallet," "Base account" and "Base mode" are terms used in particular support flows and should be read with the page's instructions, rather than treated as universal product names.

The current official materials retain both naming sets. The [Base documentation](https://docs.base.org/get-started/connect-to-base) continues to publish separate mainnet and testnet configuration for Base, while Coinbase's [wallet terms](https://wallet.coinbase.com/terms-of-service) continue to define Coinbase Wallet as the self-custodial software service.
