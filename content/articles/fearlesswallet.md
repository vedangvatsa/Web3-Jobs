---
title: Polkadot tells Fearless Wallet users to move funds after private-key leak
ogTitle: "POLKADOT TELLS FEARLESS WALLET USERS TO MOVE FUNDS AFTER KEY LEAK"
description: The Polkadot Community Foundation said four versions of the third-party Fearless Wallet browser extension sent private keys to an attacker-controlled server, and urged anyone who used the extension since February 2025 to generate new keys and move funds.
image: /images/news/fearlesswallet.jpg
imageCaption: "A physical padlock on a laptop. Photo via Wikimedia Commons."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Lock_it_down_(4040440).jpeg
category: News
data-ai-hint: padlock laptop security
publishedDate: '2026-10-22'
lastUpdated: '2026-10-22'
---

The Polkadot Community Foundation published a security notice on Oct. 21 telling anyone who used the Fearless Wallet browser extension since February 2025 to treat every account in that extension as compromised, create a new keypair in a different wallet, and move funds immediately.

Fearless Wallet is a third-party product built and maintained by an independent team. The foundation said it is not, and has never been, an official Polkadot wallet.

## What the notice says happened

According to the [foundation's forum post](https://forum.polkadot.network/t/security-notice-fearless-wallet-browser-extension-leaked-private-keys/19058), versions 3.0.1, 3.0.3, 3.0.4 and 3.0.5 of the Fearless Wallet browser extension contained code that sent a user's private key to a server run by an attacker when the wallet was unlocked.

A private key is the mathematical basis of a blockchain account. Whoever holds a copy can sign transfers without knowing a password and without needing access to the user's machine.

The offending code entered the extension's public source code on Feb. 19, 2025, through a large pull request titled "TON ecosystem" in the project's GitHub repository. Polkadot said the code was active at different times between February 2025 and Oct. 10, 2026, and could be enabled again in installed copies of versions 3.0.3 to 3.0.5.

[Crypto Briefing](https://cryptobriefing.com/polkadot-fearless-wallet-private-key-leak/), [CoinMarketCap](https://coinmarketcap.com/academy/article/fearless-wallet-extension-leaked-private-keys-polkadot) and [CryptoTicker](https://cryptoticker.io/en/polkadot-fearless-wallet-private-key-leak/) reported the same day. The leak is confirmed for the Chrome version. The foundation said the Firefox extension used the same code and is no longer listed, but users of that build should also treat keys as compromised.

## Reported losses and affected installs

Eight users have reported unauthorized transactions that the foundation attributed to the exploit, totaling 17,286 DOT. The notice notes that a leaked key can sit unused until an attacker decides to move, so the number of exposed accounts may exceed the number of drained ones.

When the warning went out, the Chrome Web Store still listed an affected version of the extension with around 6,000 users, according to the foundation and contemporaneous reports. That figure counts installations, not confirmed victims, and CryptoTicker noted that not every install would have held a balance.

## What users are told to do

The foundation told affected users to generate a new keypair outside Fearless Wallet, then transfer balances to the new account. It named Nova Wallet as one destination option. Changing a password or reinstalling the extension does not help, because an attacker who already holds a copy of a private key keeps a working signature capability for that account. Moving to a different wallet app only protects a user if that move also creates a fresh keypair.

Staked DOT, funds in nomination pools, and tokens locked in governance votes cannot be moved at once. The foundation pointed users toward tools such as PAPI Rescue for certain recovery scenarios and said Polkadot nominators can unbond in as little as one or two days. CryptoTicker separately reported that Polkadot's standard unbonding window can run 28 days depending on the staking path, which leaves funds at an address whose key may already be in someone else's hands until the period ends.

Mobile Android and iOS versions of Fearless were reviewed and do not contain the same code, the foundation said. Any seed phrase that was ever restored into the browser extension is still compromised wherever that phrase is used, including on mobile.

The notice also warned of recovery scams that typically follow public key-leak disclosures, and said Polkadot does not have an official X support account that will message users first. The foundation told users to preserve transaction hashes and dates if they have already lost funds, and said those reports can be filed with SEAL 911 and local police.

## Timeline of disclosure

Complaints describing similar losses after a Fearless update appeared in Polkadot community forums as early as October 2025. The detailed public explanation of the coding flaw arrived with the October 2026 notice, leaving roughly a year between the first user reports and a full public accounting of how the malicious code entered the extension.

Nothing in the foundation's notice describes a flaw in the Polkadot relay chain or in on-chain consensus. The transfers that moved funds were validly signed with keys the extension had already exposed. Polkadot Technical Fellowship reviewed the code on behalf of the Community Foundation, according to CoinMarketCap's report of the investigation.
