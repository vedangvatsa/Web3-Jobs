---
title: Ethereum Activates Glamsterdam Upgrade on Sepolia Testnet
ogTitle: "ETHEREUM ACTIVATES GLAMSTERDAM UPGRADE ON SEPOLIA TESTNET"
description: Ethereum activated the Glamsterdam upgrade on the Sepolia testnet on Oct. 6 at 13:53 UTC to test a 200 million gas limit and new block rules.
image: /images/news/sepolia-fork.jpg
category: News
data-ai-hint: small computer server hardware
publishedDate: '2026-10-06'
lastUpdated: '2026-10-06'
imageCaption: "A compact server unit used for testing software. Sepolia gives developers a public network to test the Glamsterdam rules. Photo: https://www.flickr.com/photos/jm3 via Wikimedia Commons (CC BY-SA 2.0)."
imageCreditUrl: https://commons.wikimedia.org/wiki/File:Custom_Miniature_Linux_Server_%282005%29.jpeg
---

Ethereum activated its Glamsterdam upgrade on the Sepolia test network on Oct. 6 at 13:53:36 UTC, moving the next major set of protocol changes into public testing. Community contributor Pooja Ranjan announced the activation in an afternoon post after the fork slot passed, [Cointelegraph reported](https://cointelegraph.com/news/ethereums-glamsterdam-upgrade-launches-on-sepolia-testnet).

The fork was scheduled for epoch 353024 and slot 11296768, [the Ethereum Foundation announcement says](https://blog.ethereum.org/2026/09/17/glamsterdam-testnet-announcement). Sepolia is a public test network that uses tokens with no real value, so application teams and infrastructure providers can run software against new rules before those rules reach users who hold real ether.

Rony Roy, writing for crypto.news, [put the activation](https://crypto.news/ethereum-glamsterdam-hits-sepolia-with-200-million-gas-limit-test/) at 1:53 p.m. UTC and described it as one of the last public stages before developers set dates for the Hoodi test network and the main network. No date has been fixed for either of those networks. The Foundation announcement states that Hoodi and mainnet activation times will be announced once client teams decide them.

The headline test on Sepolia is capacity. The network is trying a 200 million gas limit, more than three times the roughly 60 million level used before the upgrade. Gas is the unit Ethereum uses to measure computing work per block, so the higher ceiling leaves room for more payments, swaps and other activity in each block. The Foundation set 200 million as the floor for Glamsterdam testing, with any mainnet number to depend on how clients handle the added load.

[crypto.news noted](https://crypto.news/ethereum-glamsterdam-hits-sepolia-with-200-million-gas-limit-test/) that a higher limit does not by itself guarantee lower fees. Validators still must process, execute and check the extra work without imposing hardware or networking demands that smaller operators cannot meet. Sepolia now provides a public setting where developers can watch client behavior under conditions that are harder to control than a private development network.

Two protocol changes sit at the center of the upgrade. Enshrined proposer-builder separation, tracked as EIP-7732, brings the split between block proposers and block builders into consensus rules. A proposer includes a builder's commitment to an execution payload, and the builder then reveals that payload, with payment to the proposer handled by the protocol. The design reduces reliance on outside middleware for the exchange between the two roles.

Block-level access lists, tracked as EIP-7928, record the accounts and storage locations touched during a block along with resulting state changes. Clients can use those lists to read state from disk at the same time, check eligible transactions at the same time and compute state roots with less repeated work. [The Foundation announcement describes](https://blog.ethereum.org/2026/09/17/glamsterdam-testnet-announcement) the pair as a base for higher throughput while keeping block checks practical for node operators.

Gas accounting changes arrive in the same package and will force application teams to test carefully. EIP-8037 raises and separately meters the cost of creating new state, while EIP-8038 updates state access costs. Contracts that rely on fixed gas stipends, hardcoded limits or assumptions about remaining gas may need changes, and the Foundation points developers to a repricing impact guide for affected-contract searches.

[crypto.news warned](https://crypto.news/ethereum-glamsterdam-hits-sepolia-with-200-million-gas-limit-test/) that wallets and gas estimation tools with fixed assumptions could break under the new pricing. A basic ether transfer to an existing account can continue to use 21000 gas, while operations that create new state can cost more. Teams were told to recheck estimation paths on Sepolia after activation.

Node operators faced a firm deadline before the fork. They needed to update both execution and consensus software to releases whose notes confirm support for the scheduled activation, because a node without the new rules cannot follow the upgraded network afterward. Listed execution releases include Besu, Erigon, go-ethereum, Nethermind, Reth and Ethrex builds, while consensus releases include Grandine, Lighthouse, Lodestar, Nimbus, Prysm and Teku builds, [according to the announcement](https://blog.ethereum.org/2026/09/17/glamsterdam-testnet-announcement).

Public testing brings risks that private networks avoid. Developers have cautioned that builders could abuse Sepolia because test ether is cheap and easy to obtain, letting a malicious builder win block auctions repeatedly and then withhold payloads in ways that would carry real cost on the main network. Longer-running adversarial work continued on a separate environment while Sepolia prepared for the public fork.

After Sepolia, developers plan to review client performance and then set an activation schedule for Hoodi. [Cointelegraph said](https://cointelegraph.com/news/ethereums-glamsterdam-upgrade-launches-on-sepolia-testnet) the team will determine the Hoodi date from Sepolia results before fixing a mainnet date. Work on Hegota, the upgrade planned after Glamsterdam, has already started with dozens of proposals under review, and developers narrowed 66 candidates in August.
