---
title: What is a Paper Wallet for Cryptocurrency
image: /images/chris-ried-ieic5Tq8YMk-unsplash.jpg
data-ai-hint: paper document
description: >-
  A paper wallet is a form of 'deep cold storage' where a cryptocurrency's
  private and public keys are printed onto a piece of paper. Learn how they
  work.
category: Educational
publishedDate: '2026-03-11'
lastUpdated: "2026-09-12"
---
A paper [wallet](/how-to-choose-a-crypto-wallet) is one of the oldest methods used to secure cryptocurrency assets. It is a form of cold storage: the private key is kept completely offline and disconnected from the internet. In its simplest form, a paper wallet is a physical document containing the information required to access and manage cryptocurrency.

Paper wallets have largely been replaced by more user-friendly [hardware wallets](/understanding-hardware-wallets-for-crypto-security). They nevertheless remain useful for understanding the fundamentals of crypto key management. Their design makes the distinction between a public address and a private key especially visible. It also shows why keeping a key offline is only one part of self-custody. A person using a physical document must still protect it from exposure, damage, loss, and mistakes during spending.

## The Two Pieces of Information on a Paper Wallet

A paper wallet typically contains two components, shown both as text and as scannable QR codes. The two components serve different purposes and should not be handled in the same way.

### Public key or address

The public key or address is the information that allows other people to send funds to the wallet. It is comparable to a bank account number in the limited sense that it identifies where funds can be sent. Sharing the public address is safe. A person receiving funds can provide that address without revealing the information that controls the funds.

### Private key

The private key is the secret component. It grants control over the funds associated with the public address. Anyone who possesses the private key can access the cryptocurrency. That is why a paper wallet must be treated as a confidential document, not simply as a printed record.

The QR code format does not change that rule. It can make the information easier to scan, but it does not change which component is public and which component must remain confidential. A paper wallet holder should always be clear about which code is being used and why. Confusing the public address with the private key, or treating both as equally shareable, defeats the separation on which the wallet depends.

## Creating a Paper Wallet

Users typically create a paper wallet with an open-source key generation tool. For optimal security, the process should take place on an air-gapped computer so that the private key never interacts with the internet. The user generates a new public/private key pair, prints the result, and erases the computer's memory to eliminate data remnants.

For that reason, a paper wallet should not be treated as a casual printout. Its purpose is to provide deep cold storage, and that purpose depends on keeping the private key offline from creation onward. The process is simple in concept but unforgiving in execution: there is only one private key pair on the document, and it is the information that gives control over the funds.

## Receiving Funds

Receiving funds is the straightforward part of using a paper wallet. The holder provides the public address, and funds can be sent to that address at any time. The address is the part intended for this purpose, so it can be shared without disclosing the private key.

The distinction also makes the wallet useful as a physical record of the receiving address. The document may be offline, but others can still send funds to the public address. The fact that a receiving address can be shared does not weaken the cold-storage premise. It is the private key, rather than the address, that must remain disconnected from online activity until the owner chooses to spend.

## Spending Funds: Sweeping the Key

Spending from a paper wallet is more complex than receiving. The private key must be "swept" into a software wallet, also called a hot wallet. In practical terms, the software wallet's import function is used to scan the QR code of the private key. Once the key is imported, the software wallet gains control of the funds and can create and sign a transaction to send them elsewhere.

The word "sweep" is important because it describes a transition in the key's security context. Before the sweep, the paper wallet's private key is offline. During the sweep, the key is scanned into software on an online device. That step makes spending possible, but it also means the private key has been exposed to an online environment. The convenience of the software wallet comes with a change in the original cold-storage condition.

## Treat a Swept Paper Wallet as Retired

A paper wallet should function as a one-time savings device. Once the private key has been swept in order to spend funds, the key should be considered compromised because it has been exposed to an online device. The recommended response is to transfer all funds out of the paper wallet at the same time and not use it again.

This recommendation follows directly from the distinction between offline storage and a hot wallet. A paper wallet is valuable because its private key has remained offline. After the key has been scanned into an online software wallet, that condition no longer applies. Continuing to rely on the original paper as though it were untouched cold storage would ignore the security change created by the sweep.

## Advantages and Disadvantages

The strengths and weaknesses of paper wallets are closely related. Their offline design can protect a private key from internet-based threats, but the same design transfers responsibility to the person handling a physical document. The table below separates the main points without treating either side as decisive in every situation.

### Advantages

| Advantage | Description |
| --- | --- |
| Offline security | When created correctly on an air-gapped machine, the private key remains entirely offline, protecting it from online threats such as hacking and phishing. |
| Simplicity | The concept is straightforward: a paper wallet serves as a physical backup of the keys. |

Offline security is the core case for a paper wallet. If the private key never interacts with the internet during creation or storage, online threats such as hacking and phishing cannot reach it through an internet connection. That is a meaningful property, but it is conditional. The key must be generated correctly, kept offline, and not exposed through careless handling.

The conceptual simplicity is also real. A holder can see that the document contains a public address for receiving and a private key for control. That visibility can make the relationship between the two easier to understand than it is in an interface that hides the details. At the same time, simplicity of concept should not be confused with simplicity of safe use. The paper carries all the responsibility that a single private key pair creates.

### Disadvantages

| Disadvantage | Description |
| --- | --- |
| Physical vulnerability | Paper is fragile. It can be lost, damaged by water or fire, or fade over time. |
| Risk of human error | Errors can occur during creation or use. Generating keys on a non-secure computer risks exposure, and mistakes while sweeping can lead to loss of funds. |
| Not user-friendly | Paper wallets are cumbersome to use. The holder typically must sweep the entire balance rather than spend portions. |
| No seed phrase | Unlike modern wallets that use a hierarchical deterministic (HD) structure, a paper wallet consists of a single key pair without a recovery seed phrase. |

Physical vulnerability is the most obvious drawback. The document can be lost, damaged by water or fire, or fade over time. Each of those outcomes affects the holder's access to the information on the paper. Cold storage removes an online connection; it does not make the physical medium durable.

Human error is the broader concern. Generating a key on a non-secure computer risks exposure before the document exists. Mistakes during sweeping can lead to loss of funds after the document has been used. The creation and spending stages therefore need the same level of attention as storage. A paper wallet cannot be evaluated only by where it is kept; it must be evaluated across the full lifecycle of generating, receiving, sweeping, and retiring the key.

The wallet is also not user-friendly. To spend, the holder typically must sweep the entire balance rather than spend portions. That makes a paper wallet cumbersome for ordinary use and reinforces the idea that it should function as a one-time savings device rather than an everyday spending tool.

Finally, a paper wallet consists of a single key pair without a recovery seed phrase. Modern wallets use a hierarchical deterministic, or HD, structure and provide a different recovery model. The absence of a seed phrase is not a minor interface difference. It means the paper document's particular key pair is the key material the holder must preserve and use correctly.

## Why Hardware Wallets Became the Modern Alternative

Hardware wallets, including Ledger and Trezor, have largely supplanted paper wallets. They offer the same primary benefit of keeping private keys offline in a more secure and user-friendly format. A hardware wallet is a dedicated electronic device designed to sign transactions without exposing the private key to the connected computer. It also provides a backup seed phrase for recovery if the device is lost or damaged.

The contrast clarifies why paper wallets have declined. Both approaches seek to keep a private key offline, but the hardware wallet is designed to make transaction signing and recovery more manageable. The paper wallet asks the holder to move the private key into a hot wallet in order to spend. The hardware wallet is designed to sign without exposing that private key to the connected computer. That distinction addresses the exact moment when a paper wallet's cold-storage condition changes.

Paper wallets remain an important part of cryptocurrency history despite their declining use. They represent an early effort to achieve secure self-custody and make the fundamental relationship between public and private keys visible. Their main lesson is durable: public information can be shared to receive funds, while the private key must remain confidential because control follows possession of that key.
