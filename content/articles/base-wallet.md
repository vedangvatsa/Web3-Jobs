---
title: Coinbase's Wallet Naming Still Separates Wallet From Base
description: Coinbase's current official product pages describe Coinbase Wallet and the Base app alongside each other, while its documentation keeps the wallet, the exchange account, and the Base network distinct.
image: /images/news/base-wallet-cover.jpg
category: News
data-ai-hint: coinbase wallet base app
publishedDate: '2026-09-12'
lastUpdated: '2026-09-12'
---

Coinbase's current official materials do not support the claim that the company has renamed the Base app to Coinbase Wallet. The [Coinbase Wallet site](https://wallet.coinbase.com/) presents a self-custodial, multi-chain trading product under the Coinbase Wallet name. Separately, Coinbase's Help Center still directs users to information about signing in to and selling or cashing out from the [Base app](https://help.coinbase.com/en/wallet). The [Base website](https://base.org/) describes Base as a blockchain built by Coinbase.

That vocabulary does not settle every product-boundary question. Coinbase has changed its wallet interfaces and names over time, and its Help Center uses several related terms, including "Base wallet," "Coinbase Wallet," and "smart wallet." It does, however, establish a point that gets lost when a network, an app, and a wallet are grouped under one label: they are not interchangeable descriptions of the same thing.

This report reviewed the official Wallet site, the Coinbase Help Center's Wallet pages, Base's public site, and Base's developer documentation on September 12, 2026. Those pages describe overlapping products and services, but none of the pages reviewed announces a transition of a product called "Base App" back to Coinbase Wallet. Coinbase's current materials should therefore be read as documentation of the products it presents today, not as confirmation of the previously reported rebrand.

## What Coinbase calls Base

Base is the network layer in Coinbase's current description. Its public homepage calls it "the blockchain for global finance" and says it is built by Coinbase. The [developer documentation](https://docs.base.org/get-started/base) likewise describes Base as a blockchain, while the network-connection guide identifies Base Mainnet with chain ID 8453, ETH as its currency, an RPC endpoint, and a block explorer. Those are network parameters. They are not attributes of a consumer wallet application.

That distinction has practical consequences. A wallet can connect to Base, sign transactions for an address, and show assets associated with that address. The Base connection guide says Base is a standard EVM chain, meaning Ethereum-compatible wallets and software can be configured with its network details. Coinbase Wallet is therefore one possible interface to Base, not the network's definition or its only route to use it.

The relationship is still close. Coinbase operates both the wallet brand and Base, and its Help Center groups several Base-related tasks inside the Wallet support area. The support index links readers to "Buy and trade on Base," "Send and receive on Base," and "Sign in to your Base account." That navigation shows product integration. It does not change the protocol-level fact that Base has public network details that other compatible wallets can use.

The difference also prevents a misleading inference about custody. A network does not hold a person's private keys. A wallet may hold key material locally or arrange access through a different account model. Coinbase's choices about an application interface and the Base protocol's choices about transaction execution are connected in a user's experience, but they are separate technical and operational questions.

## What Coinbase calls Coinbase Wallet

Coinbase's Wallet support documentation describes Coinbase Wallet as a self-custody wallet. In its ["Base wallets explained" article](https://help.coinbase.com/en/wallet/getting-started/what-is-coinbase-wallet), Coinbase says the private keys representing ownership of a user's crypto are stored on the user's mobile device rather than with a centralized exchange. The same article says a Coinbase account is not required to use Coinbase Wallet.

The Wallet site's current language is broader than a basic send-and-receive product. It says users can trade crypto, stocks, commodities, predictions, and perpetual futures in one self-custodial wallet, while the Help Center's [getting-started page](https://help.coinbase.com/en/base/getting-started/get-started) says the app allows users to trade, earn, send, discover opportunities, and chat. These are Coinbase's product descriptions, not independently tested statements about availability, eligibility, or outcomes. The site itself says that some products are rolling out and attaches eligibility qualifications to its USDC rewards disclosure.

The same Wallet page says users can trade BTC, ETH, SOL, and assets across dozens of chains. Coinbase's support material gives a more useful technical limit: different wallet types inside the product do not necessarily support the same networks. That is a narrower and more verifiable statement than calling the entire product uniformly multi-chain.

Coinbase also distinguishes the wallet from a Coinbase exchange account. Its [account-versus-wallet explainer](https://help.coinbase.com/en/wallet/getting-started/what-s-the-difference-between-coinbase-com-and-wallet) says crypto purchased on Coinbase.com is stored on that platform, whereas Coinbase Wallet is self-custodial and stores the relevant private keys on the user's device. The article uses an ordinary-wallet analogy for the latter. It does not say that every feature advertised in the Wallet interface carries the same custody model, so users should not treat a shared brand as a substitute for checking the terms of a particular action.

## The Base app appears in support, not as a replacement name

Coinbase's Help Center is the clearest official evidence that "Base app" remains live terminology. On the Wallet landing page, the links include a page to [sell or cash out crypto from the Base app](https://help.coinbase.com/en/wallet). The Wallet getting-started page also lists "Base sign in options and troubleshooting" as related documentation. These links establish that Coinbase uses the name in its support taxonomy.

They do not provide a release note saying exactly how a Base app relates to every Coinbase Wallet client, browser session, extension, or wallet type. The Help Center page does not state whether a user should expect a particular store listing to change names, whether an existing local wallet is migrated, or whether a recovery phrase changes. Those omissions are material. A support-navigation label is evidence of terminology; it is not evidence of a completed account migration.

This is where the original rebrand account went beyond the available record. It asserted that Coinbase had consolidated brands after a year-long experiment, that user feedback had shown confusion, and that account keys, recovery phrases, histories, and balances would be unaffected. The official pages reviewed do not substantiate those claims. In particular, neither the Wallet site nor the Help Center page examined for this report supplies a date for a rename, a statement about user research, or transition terms for existing accounts.

That leaves a limited conclusion. Coinbase's current documentation presents a Base app and Coinbase Wallet in the same product-support orbit, while preserving distinct names in places. It does not document the purported rebrand. Readers looking for a confirmed change to a specific app installation should rely on a dated Coinbase release note, an in-app notice, or an App Store or Google Play update published by Coinbase rather than a general-purpose product page.

## Wallet types matter more than a single brand label

Coinbase's [smart-wallet documentation](https://help.coinbase.com/en/wallet/getting-started/smart-wallet) demonstrates why it is unsafe to assume that one wallet label describes one key system or one asset set. The company says smart wallet is one of several wallet types a person can create or import in Coinbase Wallet. It lists smart wallets, email or social-login wallets, and mnemonic wallets, and says users can hold up to 10 wallets under a single account and switch among them.

According to Coinbase, its smart wallet uses passkeys and supports EVM networks only. The support article says Bitcoin, Solana, and other non-EVM assets require an email or social-login wallet or a mnemonic wallet in the same Coinbase Wallet app. It also says each wallet displays its own balances and assets rather than offering a combined balance view across wallets. The multi-chain claim on the Wallet marketing page is therefore best understood as a description of the application and its available wallet types, not a promise that every address within it can receive every asset.

Coinbase says the smart wallet can be accessed through Coinbase Wallet or wallet.coinbase.com and that it cannot be accessed through the Coinbase app or Coinbase Wallet extension. It also says apps can sponsor a smart wallet's network fees or batch transactions. Those capabilities arise from the wallet's smart-contract design, according to the support page, and can increase Ethereum network fees compared with a Base wallet because smart-contract use adds cost per transaction.

This is a useful correction to another loose claim in the previous draft: "gasless" is not a blanket property of the wallet or of Base. Coinbase says applications can sponsor network fees for smart-wallet users. Whether a particular transaction is sponsored depends on the application and the transaction flow. The cited documentation does not say that all Coinbase Wallet or Base-app transactions carry no user-paid fee.

## Recovery language needs the same precision

The words "recovery phrase" can also obscure different wallet models. Coinbase says a smart wallet uses a passkey and that cloud-based or hardware passkeys, such as Apple or Google passkeys, can make the wallet accessible across devices. It says a mnemonic wallet is recovered solely with a 12-word recovery phrase. The company warns that smart wallets and mnemonic wallets without an email or social sign-in method cannot be recovered if the user loses the passkey or recovery phrase.

Those statements mean that an assurance about a user's "recovery phrase" cannot describe all Wallet users accurately. Some may have a mnemonic wallet; some may use a passkey-based smart wallet; a person may have multiple wallet types. Coinbase's documentation says users can inspect a wallet's type in its settings page. It does not state, on the pages reviewed, that a hypothetical Base-app brand change would preserve every credential, balance display, or transaction history.

The custody distinction also affects how users should assess support communications. Coinbase's self-custody explanation says private keys are stored on the mobile device, while the smart-wallet page describes recovery arrangements that can involve passkeys and optional sign-in methods. Neither description justifies sharing a recovery phrase or private key with a person claiming to be Coinbase support. Coinbase directs Wallet users to its [scam-avoidance guidance](https://help.coinbase.com/en/wallet/security/avoiding-crypto-scams) from the Wallet support index.

## What the official record does and does not establish

The verified record is narrower than a story about a brand reversal. Base's official documentation identifies an Ethereum-compatible blockchain with public connection parameters. Coinbase's Help Center identifies Coinbase Wallet as a self-custody product distinct from a Coinbase exchange account. The Wallet site advertises a broader trading and discovery product, and the Help Center still uses "Base app" in linked support topics.

The record does not establish a date or terms for a rebrand from Base app to Coinbase Wallet. It does not establish that Coinbase conducted a year-long naming experiment, that it changed names because of user confusion, or that it is replacing an app-store listing. It also does not establish a universal guarantee about existing keys, phrases, balances, or transaction histories. These may be subjects of future Coinbase communications, but the sources reviewed here do not make those commitments.

The remaining concrete point is the one readers can verify directly: Coinbase has product pages that use Coinbase Wallet and support pages that continue to refer to the Base app, while Base's developer materials describe a separate blockchain network. Any future renaming notice should specify which wallet type, client, credentials, and networks it covers before it can support broader claims about user access.
