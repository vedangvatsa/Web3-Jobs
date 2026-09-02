---
title: 'How to Choose a Crypto Wallet: A Complete Guide'
image: >-
  https://images.unsplash.com/photo-1637597383775-cf7b69e0a9c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxjcnlwdG8lMjB3YWxsZXR8ZW58MHx8fHwxNzU1MDA1MzEzfDA&ixlib=rb-4.1.0&q=80&w=1080
data-ai-hint: crypto wallet
description: >-
  From hot wallets to cold storage, this guide breaks down the different types
  of crypto wallets and helps you choose the right one based on your security.
category: Getting Started
publishedDate: '2026-03-11'
lastUpdated: "2026-09-02"
---

A crypto wallet does not hold coins the way a leather wallet holds cash. Coins and tokens stay on the blockchain. The wallet holds your private keys and lets you sign transactions, prove ownership, and connect to apps. If you plan to hold crypto, use [DeFi](/what-is-defi), collect [NFTs](/what-are-nfts), or join a [DAO](/what-is-a-dao), you need a wallet that matches how you will actually use the chain.

This guide explains how wallets work, who each type fits, and how to pick a setup you can keep secure over time. It covers custodial vs non-custodial control, hot vs cold connectivity, specific products you can verify today, and a simple two-wallet pattern most people use.

## What a crypto wallet is in one minute

A wallet is an interface that creates and manages private keys. A private key is a random large number that proves you control an address on the blockchain. You sign a transaction with the private key, the network checks the signature with your public key, and the transaction updates balances on chain.

Most modern wallets are hierarchical deterministic (HD) wallets. One master seed generates a tree of keys under standards BIP-32 and BIP-44. That seed is shown to you as a secret recovery phrase, also called a seed phrase, under BIP-39. The phrase is 12, 15, 18, 21, or 24 words taken from a fixed list of 2048 words. 12 words encode 128 bits of entropy plus a 4-bit checksum. 24 words encode 256 bits plus an 8-bit checksum. The checksum lets wallets reject a mistyped or misordered phrase. With the same phrase and the same derivation path (for example m/44'/60'/0'/0/0 for Ethereum), any compatible wallet can restore all your accounts.

Source you can check: BIP-39 standard and wordlists on https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki and Ledger Academy on HD wallets and seed phrases at https://www.ledger.com/academy/bip-39-the-low-key-guardian-of-your-crypto-freedom and https://www.ledger.com/academy/basic-basics/2-how-to-own-crypto/what-is-a-crypto-wallet

## Who this guide is for

- New holders who bought on an exchange and want to move to self-custody.
- Active users who trade, stake, or try apps weekly and need quick access without putting long-term savings at risk.
- Long-term holders who plan to keep most funds untouched for months or years.
- Teams or couples who need shared control rather than one person holding a single key.

If you only buy once and never interact with apps, needs are different from someone who signs three DeFi transactions a day. Decide first how often you will sign, how much value you will store, and whether you need to connect to dApps.

## How wallets work

1. **Key generation.** When you create a wallet, the device or app generates random entropy and turns it into a seed phrase. Hardware signers like Ledger and Trezor do this on the device, offline. Ledger's Secure Element uses a true random number generator on chip. Trezor Safe devices generate entropy on device and show the backup on the device screen.
2. **Key storage.** The wallet stores the private keys in software or in a secure chip. MetaMask, Phantom, Trust Wallet, and other hot wallets keep keys on the same phone or computer that browses the web. Hardware signers keep keys in an isolated Secure Element chip that never exposes the key to the computer.
3. **Address derivation.** The wallet derives addresses for each network from the same seed. One seed can control Bitcoin, Ethereum, Solana, and others, each under its own path.
4. **Signing.** To send funds or approve a token, you create a transaction on the computer or phone, the wallet shows the details for review, and you approve. With a hardware signer the approve step and the signing happen on the device itself. The signed transaction then goes back to the computer to be broadcast. The key itself does not touch the internet.
5. **Recovery.** If the device is lost, you restore by entering the same 12, 20, or 24 words in order into a compatible wallet. Ledger devices use 24 words (BIP-39). Trezor Safe 3, Safe 5, and Safe 7 default to a 20-word single-share backup (SLIP-39) since June 2024, with 12-word and 24-word BIP-39 still available as an option in Trezor Suite. No company can reset it for you if you use non-custodial wallets. If you use a custodial wallet, recovery is through email, password reset, and identity checks with the provider.

## The two decisions that matter

Every wallet asks you to choose on two axes. Those choices decide security and convenience.

### 1. Custodial vs non-custodial: who holds the keys

**Custodial wallet.** A company holds the private keys. You log in with an email and password, similar to a bank. Examples are the default wallets on centralized exchanges such as Coinbase, Kraken, or Binance. The provider signs transactions on its servers.

Pros:
- Familiar login and password reset. Support can help recover access.
- Often includes compliance checks, account monitoring, and in some cases insurance or proof-of-reserves.
- No need to manage a seed phrase.

Cons:
- You hold a claim against the company, not direct on-chain control. The saying in crypto is "Not your keys, not your coins."
- The provider can freeze accounts for legal, risk, or maintenance reasons.
- You inherit the provider's security. If the exchange is breached, goes offline during volatility, or becomes insolvent, your access is at risk. Centralized failures have happened repeatedly in crypto history.

**Non-custodial wallet.** You hold the keys and the seed phrase. No third party can move funds without your signature. Examples are MetaMask, Phantom, Trust Wallet, Rabby, Ledger, and Trezor.

Pros:
- You have direct control. No one can censor or freeze your on-chain funds.
- You can connect to any dApp on supported networks without asking permission.
- Pseudonymous creation with no KYC database linking your identity to the wallet.

Cons:
- You are responsible for backup. Lose the seed phrase and the funds cannot be recovered. Share it and the funds can be taken.
- Learning curve is steeper. You must verify addresses, approvals, and transaction details yourself.

For anyone who wants to use [Web3](/what-is-web3) apps directly, a non-custodial wallet is required. Custodial accounts are convenient for buying and selling, but they do not let you sign dApp transactions with your own keys.

### 2. Hot vs cold: is the key online

**Hot wallet (software, always online).** Keys live on an internet-connected device.

Types you will see:
- Browser extensions: MetaMask, Rabby, Phantom. Since 2016 MetaMask has been the default for Ethereum and other EVM chains because most dApps support it first.
- Mobile apps: Trust Wallet, Phantom mobile, Rainbow Wallet, Coinbase Wallet self-custody mode.
- Desktop apps: Exodus, Trust Wallet desktop, and Trezor Suite in view-only mode.

Best for small daily balances, trying new apps, claiming, swapping, and NFT mints. You open the app, connect, sign, and you are done.

Risk: always online means malware, phishing sites, clipboard hijackers, and fake app stores can target the key. Screens on phones and laptops can be tampered with to show one transaction while signing another.

**Cold wallet (offline key storage).** Keys are generated and kept offline, and signing happens offline.

Types you will see:
- Hardware signers: Ledger Nano S Plus, Ledger Nano X, Ledger Nano Gen5, Ledger Flex, Ledger Stax, Trezor Safe 3, Trezor Safe 5, Trezor Safe 7, and others. These use a Secure Element chip with Common Criteria certification and a secure screen that shows what you are actually signing.
- Paper wallets: a printed private key or seed phrase, with a QR. Completely offline but difficult to use, no HD structure, one key per paper, easy to lose or damage, and cannot connect to apps.

Best for the bulk of holdings you do not touch often. You connect with USB or Bluetooth only to sign, and keys never leave the device.

Risk: physical loss, damage, or theft of the device or paper, plus buying counterfeits.

Verified hardware details you can check today:
- Ledger Nano S Plus uses ST33K1M5 Secure Element, CC EAL6+ certified, USB-C, monochrome OLED, no Bluetooth. Ledger Nano X uses ST33J2M0, CC EAL5+ certified, USB-C plus Bluetooth. Ledger Nano Gen5 uses ST33K1M5 EAL6+, 2.8-inch E Ink touchscreen, USB-C plus NFC. Ledger Flex uses ST33K1M5 EAL6+, 2.84-inch E Ink touchscreen, USB-C plus Bluetooth 5.2 plus NFC plus Qi option. Ledger Stax uses ST33K1M5 EAL6+, 3.7-inch curved E Ink touchscreen, USB-C plus Bluetooth 5.2 plus NFC plus Qi wireless charging. Official source: https://shop.ledger.com and Ledger Academy on Secure Element at https://www.ledger.com/academy/security/the-secure-element-whistanding-security-attacks
- Trezor Safe 3, Safe 5, and Safe 7 all use EAL6+ certified Secure Elements. Safe 3 is button-controlled with monochrome screen, USB-C, no Bluetooth. Safe 5 adds color touchscreen. Safe 7 adds Secure Element with auditable design, touchscreen, Bluetooth, and Qi2 wireless charging. Official source: https://trezor.io/store and pricing verified July 2026 at https://comparedge.com/tools/trezor/pricing
- Current US list prices checked early August 2026: Ledger Nano S Plus about $79, Ledger Nano X $149, Ledger Nano Gen5 $179, Ledger Flex $249, Ledger Stax $399. Trezor Safe 3 $59, Trezor Safe 5 $129, Trezor Safe 7 $249. Tax, shipping, and promotions change checkout totals. Check https://shop.ledger.com and https://trezor.io/store before buying.

### Other custody models to know

- **Multi-signature (multisig).** A shared wallet that needs M of N keys to sign, for example 2 of 3 or 3 of 5. Common for DAOs and team treasuries. Tooling includes Safe (formerly Gnosis Safe) on EVM chains at https://safe.global and https://app.safe.global. Safe is a smart contract wallet, assets live in the contract, and each approval is an on-chain signature until the threshold is met. Setup is chain-specific and on-chain approvals are visible.
- **Multi-party computation (MPC).** The private key is split into shares that never combine in one place. Shares sign together off-chain, which is chain-agnostic and hides governance details off-chain. Used by many custodians and institutions in 2026 for treasury and payment flows. Standard retail wallets do not use MPC by default.

For individuals, hardware signers or well-managed multisig are the practical cold-storage choices today. MPC matters more for teams and companies handling high volume across chains.

## At a glance

| Wallet type | Connectivity | Who holds key | Security level | Cost | Best for |
| --- | --- | --- | --- | --- | --- |
| Custodial exchange wallet | Hot | Company | Medium, depends on provider | Free to create, fees per trade | Beginners buying or trading often |
| Browser extension (MetaMask, Rabby) | Hot | You | Moderate | Free | EVM DeFi, daily dApp use |
| Mobile app (Trust Wallet, Phantom, Rainbow) | Hot | You | Moderate | Free | Everyday sends, mobile DeFi and NFTs on supported chains |
| Desktop app (Exodus) | Hot | You | Moderate | Free | Desktop portfolio with built-in swap |
| Hardware signer (Ledger, Trezor) | Cold | You, offline chip | High | $59 to $399 device | Long-term savings, large balances |
| Paper wallet | Cold | You, paper | High if stored well, poor if damaged | Free | Legacy cold storage, rarely used today |
| Multisig (Safe) | Varies | Shared control | High for teams | Network fees per approval | Team treasury, requires multiple signers |
| MPC | Hot with distributed shares | Distributed | High for institutions | Enterprise pricing | High-frequency treasury, chain-agnostic needs |

| Feature | Custodial | Non-custodial |
| --- | --- | --- |
| Ownership of keys | Third party | You |
| Account recovery | Password reset and support | 12, 20, or 24-word phrase only |
| Censorship risk | Provider can freeze or limit | No third party can freeze |
| Ease of use | Familiar login | More steps, you verify details |
| DApp access | Limited, through provider | Direct to any supported app |

## Pros and cons summary

**Custodial**
Pros: easy onboarding, familiar recovery, less chance to mistype a seed.
Cons: third-party risk, possible freezes, KYC linkage, provider as target.

**Hot non-custodial**
Pros: free, fast, broad dApp support, works on phone or browser.
Cons: key exposed to internet, phishing risk, you manage every backup.

**Cold hardware signer**
Pros: keys offline, certified secure chip, secure screen, works with hot interfaces via USB, Bluetooth, or NFC. Clear Signing can show human-readable intent on device when the dApp provides ERC-7730 descriptors.
Cons: upfront cost, physical device to keep safe, a bit slower per transaction.

**Paper**
Pros: offline and free.
Cons: fragile, hard to use, no app connectivity, easy to create insecurely if you generate the key while online.

Note on Clear Signing: Ledger introduced Clear Signing to replace blind signing. It turns raw calldata into readable details on the secure screen using the ERC-7730 standard. In May 2026 governance of ERC-7730 moved to the Ethereum Foundation's One Trillion Dollar Security Initiative, with tooling at https://clearsigning.org and docs at https://developers.ledger.com/docs/clear-signing/overview and https://www.ledger.com/academy/topics/ledgersolutions/what-is-clear-signing. It works best inside Ledger Wallet where Ledger controls parsing. Outside Ledger Wallet it depends on dApps publishing correct ERC-7730 descriptors. Treat it as one layer among others, not a guarantee.

## How to choose: a five-step checklist

**Step 1: How much will sit in the wallet and how often will you sign?**
- Under a few hundred dollars and testing apps? A hot wallet is enough to learn.
- Several thousand dollars or more, or funds you will not touch for weeks? Add a hardware signer.
- Signing daily across multiple chains? Pick a hot wallet native to your main chain and pair it with a signer.

**Step 2: Which chains and assets must work on day one?**
- Ethereum and EVM chains including Base, Polygon, Arbitrum, Optimism, BNB Chain: MetaMask and Rabby cover the most apps.
- Solana plus Ethereum and Bitcoin expansion: Phantom supports Solana, Ethereum, Bitcoin, Polygon, Base and others in one app and is strong on NFTs. Check supported networks at https://phantom.com and https://help.phantom.com/hc/en-us/articles/41372840389651-Supported-networks-chains-in-Phantom
- 100+ chains in one mobile app: Trust Wallet supports the widest list in one place. Verified at https://trustwallet.com
- Multi-chain hardware signers: Ledger supports 500+ assets in Ledger Wallet and 15,000+ via third-party wallets per https://www.ledger.com/supported-crypto-assets. Trezor supports 8,000+ coins and tokens per https://trezor.io/coins. For rarer tokens you connect the signer to a third-party interface like MetaMask.

**Step 3: Self-custody and recovery.**
- Do you want a password reset path? That points to custodial.
- Do you want sole control and will you store a seed offline? That points to non-custodial with a written backup. For Trezor Safe you will choose between a 20-word SLIP-39 single-share (default), 12-word BIP-39, or 24-word BIP-39 during setup. For Ledger you will write 24 words.
- Need shared team control? Look at multisig with a defined signer set, for example 2 of 3 founders on Safe at https://app.safe.global.

**Step 4: Device and workflow fit.**
- Mobile-first: Trust Wallet, Phantom, Rainbow.
- Browser-heavy DeFi: MetaMask or Rabby as extensions.
- Desktop: Exodus, or Ledger Wallet app for portfolio with signer security. Trezor Suite for Trezor devices.
- Check OS support before you buy. Ledger Wallet requires Windows 10/11, macOS Monterey/Ventura, or Ubuntu LTS 20.04/22.04 (excluding ARM), Android 10+ for mobile, and is not compatible with Chromebooks per https://shop.ledger.com. Some companion apps lag on less common OS builds.

**Step 5: Verify security properties before you fund.**
- Does the device use a certified Secure Element and a secure screen that cannot be spoofed by the computer? Check chip: Ledger Nano S Plus, Flex, Stax, Nano Gen5 are EAL6+; Nano X is EAL5+. Trezor Safe 3, 5, 7 are EAL6+.
- Can you review the exact contract address, amount, and approval type on the device? That is Clear Signing vs blind signing.
- Is firmware open source or audited, and do updates come from the official site or app store? Ledger firmware is closed source with open companion apps; Trezor firmware and hardware designs are open source and audited. Decide which trust model you prefer.
- Does the wallet let you avoid blind signing or warn on it? Ledger's Clear Signing translates complex data into human-readable details to reduce mistakes. Safe wallets show full transaction simulation before signing.

Work through the checklist and you will see two or three options that clearly fit. Ignore products that do not meet the chain and recovery needs, even if they advertise more features.

## The setup most people keep

Use two wallets with clear roles.

1. **Vault (cold signer).** A hardware signer holds 70 to 90 percent of value you will not move this month. Ledger and Trezor both keep keys offline and verify on-device. Even if the laptop is infected, the keys do not leave the chip. Configure a strong PIN, write the seed phrase by hand, test recovery with a small amount, and update firmware from official sources only.
2. **Spending wallet (hot).** A browser or mobile wallet such as MetaMask or Phantom holds a small amount for weekly activity. Keep balances low enough that losing the phone or approving a bad contract does not threaten the vault. Use it to connect to sites, try new mints, and swap.
3. **Link them when needed.** Most hot wallets let you connect a hardware signer. With MetaMask you can add hardware accounts so the address comes from the Ledger or Trezor and every transaction still needs a physical button press or tap on the device. You get the familiar dApp interface and the offline signing guarantee.

This pattern balances convenience and loss limits. Phishing and exchange outages remain the most common loss vectors in 2025 and 2026. Isolating savings on a signer reduces that exposure.

## How to get started, safely

### Setting up a non-custodial hot wallet

1. Download only from official sources: https://metamask.io for MetaMask, https://phantom.com for Phantom, https://trustwallet.com for Trust Wallet. Check the publisher in app stores. Avoid cloned versions.
2. Create new wallet, set a strong device password, and write the 12-word phrase on paper in order. Do not screenshot, copy to notes, email, or cloud drive. For Trezor-connected hot usage, the phrase stays on the device, not in the browser.
3. Verify the phrase in the app, then lock the app and test recovery on a second install with the phrase offline before sending any real funds.
4. Send a tiny test transaction. Confirm the receiving address matches on both sides. Verify the network is correct. Sending to the wrong network is a common and avoidable loss.

### Adding a hardware signer

1. Buy from the manufacturer or an authorized reseller only. Ledger at https://shop.ledger.com, Trezor at https://trezor.io/store. Do not buy used. Check the authorized reseller list if buying retail (for example Best Buy in the US for Ledger).
2. Generate the seed phrase on the device itself during initial setup. Write the words by hand. Ledger devices use 24 words. Trezor Safe defaults to 20 words (SLIP-39 single-share) since June 2024, with optional 12 or 24-word BIP-39.
3. Install the companion app: Ledger Wallet (formerly Ledger Live) or Trezor Suite. Verify the device is genuine in the app using the built-in check. Ledger devices run attestation via Ledger Wallet; Trezor Suite verifies bootloader and firmware.
4. Add chain accounts, update firmware when prompted, and send a small test. Keep firmware updated, but only from the official app. Do not sideload.
5. To use with DeFi, connect the signer to MetaMask or Phantom via their hardware connect option. The hot interface prepares the transaction, the signer displays and signs it. If the dApp supports ERC-7730, Ledger will show Clear Signing details on the secure screen.

### If you already hold on an exchange

Do not move everything at once. Create the non-custodial wallet first, back up the phrase, move a small amount, verify arrival at the correct address on the right network, then move the rest. Keep a small exchange balance only if you trade frequently.

## Security practices that actually help

- **Store the phrase offline, twice.** Write two copies by hand or stamp on a metal plate rated for fire and water. Keep them in two separate secure places, such as a home safe and a bank safety deposit box. Never store the phrase in a photo, messenger app, password manager that syncs to cloud, or email draft. For metal backups, Trezor Keep Metal is built for 20-word SLIP-39, Cryptosteel and Billfodl cover 24-word BIP-39. First four letters uniquely identify each BIP-39 word, so stamping four letters per word is enough.
- **Never type the phrase on a website.** No real support team will ask for it. Anyone who does is trying to steal funds.
- **Consider a passphrase.** BIP-39 lets you add a 13th or 25th word of your choice that is not from the wordlist. It creates hidden wallets and adds protection if the paper is found. SLIP-39 also supports passphrases in Trezor Suite. If you use one, store it separately from the words. Lose it and the phrase alone will not restore the wallet.
- **Consider Shamir Backup for larger holdings.** Trezor's SLIP-39 Multi-share lets you split the seed into up to 16 shares with a threshold (for example 2 of 3). Supported on Trezor Model T and Safe 3, 5, 7. Each share is 20 words (33 for 256-bit). Store shares in different locations. This removes a single point of failure but adds complexity. Single-share vs multi-share comparison at https://trezor.io/learn/advanced/standards-proposals/what-is-shamir-backup
- **Use a strong device password and OS updates.** Hot wallet security assumes the phone or laptop is patched and locked.
- **Add 2FA on custodial accounts.** Prefer authenticator apps or hardware keys over SMS where available. Ledger devices can also act as FIDO2 security keys via Ledger Security Key.
- **Verify what you sign.** Stop blind signing. On EVM chains, token approvals with "Permit" or "Approve unlimited" let apps spend without a new prompt. Use tools such as https://revoke.cash to review and revoke stale approvals. On Ledger, prefer Clear Signing when available and treat any blind-sign request as high risk.
- **Keep a low-balance tester.** Try new mints, airdrops, and links with a separate wallet that holds little value. Keep vault addresses disconnected.
- **Update only from official channels.** Fake update popups and sideloaded extensions are a common trap. Bookmark official update pages: https://support.ledger.com and https://trezor.io/support
- **Plan for inheritance or recovery.** Document where the backup is and how a trusted person can find it if needed, without leaving the phrase in plain email or cloud.

Security checklist published by Ledger for 2026 is a practical reference: https://www.ledger.com/academy/topics/security/crypto-wallet-security-checklist-protect-crypto-with-ledger

## FAQ

**What is the safest crypto wallet?**
For most retail users, a hardware signer that stores keys in a certified Secure Element and verifies transactions on its own screen offers the highest practical security, keeping keys offline while still letting you sign. Ledger Nano S Plus, Flex, Stax, and Nano Gen5 are EAL6+, Nano X is EAL5+. Trezor Safe 3, 5, 7 are EAL6+ with open-source firmware. That does not remove risk from signing a malicious transaction, which is why Clear Signing and careful review matter. The device protects the key, you protect the approval.

**Do I need a wallet if I keep crypto on an exchange?**
You need one for direct app use. On an exchange you have a custodial account. It is easy for buying and selling, but you cannot sign DeFi transactions or hold keys yourself. If the exchange restricts withdrawals or has an outage, you wait. Moving long-term holdings to a non-custodial wallet gives you direct control. Keep an exchange account only for liquidity you trade.

**What happens if I lose my seed phrase?**
With a non-custodial wallet there is no company reset. If the device is lost and the phrase is gone, access is gone. If others find the phrase, they can take the funds. If you use SLIP-39 multi-share, loss of some shares is tolerable up to the threshold, but loss beyond threshold is also permanent. That is why two offline copies in separate places, or distributed Shamir shares, are the baseline.

**Can one seed phrase control many chains?**
Yes. The same 12, 20, or 24 words can derive addresses for multiple networks under BIP-32 and BIP-44. For example, a single phrase can derive Bitcoin addresses at m/44'/0'/0'/0/0 and Ethereum at m/44'/60'/0'/0/0. Restore the phrase in a wallet that supports the chain you need. One limitation: BIP-39 phrases translated to a different language wordlist produce a completely different seed, so stay with the English list as recommended in the BIP-39 spec.

**MetaMask vs Phantom vs Trust Wallet, which should I pick?**
Pick based on chain. MetaMask has the widest EVM dApp support and pairs well with hardware signers. It is available as a browser extension for Chrome, Firefox, Brave, and Edge and as a mobile app. Download only at https://metamask.io. Phantom is strongest for Solana and NFTs but now supports Ethereum, Bitcoin, Polygon, Base and others in one app. Download at https://phantom.com. Trust Wallet covers the largest number of blockchains in a single mobile app (100+ chains, about 10 million assets) and charges no extra platform fee beyond network fees. Download at https://trustwallet.com. All three are non-custodial. Many users keep two, for example MetaMask for EVM plus Phantom for Solana, with a shared hardware signer for larger amounts.

**Should I use multisig or MPC?**
Multisig fits small teams that want transparent, on-chain shared control, for example a 2 of 3 DAO treasury on Safe. Safe powers over $100 billion secured and supports Ethereum and other EVM chains, verified at https://safe.global. MPC fits larger operations that need fast signing, chain-agnostic coverage, and hidden approval rules. For individual holders, a single hardware signer is simpler than either. Adding a passphrase to that signer already gives plausible deniability without team coordination.

**Are hardware wallets worth it for small amounts?**
If the total you hold is close to or above the price of the device, the device usually pays for itself in risk reduction. Ledger Nano S Plus and Trezor Safe 3 start around $59 to $79, the typical entry point in 2026. If you hold for years, even small amounts can grow. Many people start with a hot wallet, then add a signer once the balance they would hate to lose is larger than the device cost. The cost is one-time, no subscription.

**Can I switch wallets later?**
Yes. Your funds are on chain, not inside an app. Import the same seed phrase into another compatible wallet to move, or create a fresh seed and send funds on chain to the new addresses. Sending on chain is safer than reusing the same phrase across apps indefinitely. If moving from BIP-39 to SLIP-39 or the reverse, you must create a new wallet and transfer funds, the two formats derive different seeds from the same entropy.
