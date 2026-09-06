---
title: Avalanche Blockchain Platform and Its Unique Features
image: /images/nasa-Q1p7bh3SHj8-unsplash.jpg
data-ai-hint: avalanche blockchain network
description: >-
  Discover how Avalanche enables high-speed, low-cost transactions on DeFi and
  Web3 applications.
category: Educational
publishedDate: '2026-03-11'
lastUpdated: "2026-09-06"
---
Avalanche is a Layer 1 blockchain for launching decentralized applications and custom Layer 1 networks with sub-second finality. It went live on mainnet on September 21, 2020, built by Ava Labs, a company founded in 2018 by Emin Gun Sirer, Kevin Sekniqi, and Maofan Ted Yin.

The network separates asset exchange, validator coordination, and smart contract execution across three primary chains, and lets teams launch sovereign Avalanche L1s with their own rules, fees, and validator sets.

## Who Avalanche is for

* **EVM developers who want lower fees and faster settlement.** The C-Chain runs the Ethereum Virtual Machine and supports Solidity, Hardhat, Foundry, and MetaMask with chain ID 43114. You can port contracts with little change and pay fees that are typically cents during normal load.
* **Game studios and high-throughput apps that need dedicated blockspace.** A game like Off The Grid (Gunzilla) and MapleStory Universe runs on its own L1 so an NFT mint on the C-Chain does not spike its gas price or latency.
* **Enterprises and institutions that need permissioning and compliance.** Evergreen L1s like Spruce let banks such as Citi and Wellington test tokenization with allowlisted validators, location rules, and KYC at the chain level. Private L1s keep transaction data visible only to approved validators.
* **Teams that need native cross-chain messaging.** Interchain Messaging (ICM) lets one L1 send a verified message to another without a third-party bridge, using signatures checked against the P-Chain.

If you need a single shared state with Ethereum mainnet security, use an Ethereum rollup. If you need a dedicated chain where you control fees, token, and access rules, Avalanche L1s fit that need.

## How Avalanche works

### The Primary Network: X-Chain, P-Chain, C-Chain

Avalanche is a heterogeneous network. The Primary Network is a special Avalanche L1 that runs three blockchains, described in detail at build.avax.network/docs/primary-network:

* **X-Chain (Exchange Chain).** Manages creation and transfer of Avalanche Native Tokens. It is an instance of the Avalanche Virtual Machine (AVM). AVAX itself lives on the X-Chain and on the other primary chains via cross-chain transfers.
* **P-Chain (Platform Chain).** Coordinates validators, tracks active Avalanche L1s, and handles staking. It is an instance of the PlatformVM. Creating a new L1, adding a validator, and staking or delegating all go through the P-Chain. On mainnet you validate the Primary Network by staking at least 2,000 AVAX. Delegators need at least 25 AVAX, pick a validator by NodeID, and pay that validator's delegation fee (minimum 2 percent).
* **C-Chain (Contract Chain).** Executes smart contracts. It is an instance of Coreth, a fork of go-ethereum, and exposes the same JSON-RPC as Geth. Mainnet chain ID is 43114, Fuji testnet is 43113, RPC is https://api.avax.network/ext/bc/C/rpc and https://api.avax-test.network/ext/bc/C/rpc respectively. Explorer is https://explorer.avax.network.

Avalanche mainnet is the Primary Network plus all deployed Avalanche L1s. Every L1 validator must sync the P-Chain for interoperability, even after the Etna upgrade.

### Snowman consensus and finality

Avalanche does not use leader election or proof of work mining. It uses the Snowman protocol, from the Snow family (Slush, Snowflake, Snowball). Validators repeatedly sample a small, random subset of other validators.

Parameters control the process: k is sample size, alpha is the quorum threshold to switch preference, beta is the number of consecutive successful samples needed to decide. The defaults in AvalancheGo are tuned so that an uncontested transaction finalizes in about 1 to 2 seconds. The network description at build.avax.network/docs/nodes/architecture/consensus notes sub-second finality and quiescence: if there is no work, the protocol does nothing, which saves energy compared with constant mining.

Snowman is leaderless and probabilistically safe. The probability that two correct nodes disagree can be made arbitrarily small by adjusting alpha and beta. If a block is accepted, its ancestors are also considered preferred, which gives a linear chain suitable for smart contracts. The X-Chain was moved to the same linear Snowman model with the Cortina upgrade in April 2023. Earlier docs described the X-Chain as DAG-based; current docs list all three primary chains as Snowman.

Why sampling helps: traditional BFT needs all-to-all messages (O(n squared)) and struggles past a few hundred nodes. Sampling keeps messages at O(k) per query, so thousands of validators can participate without a single bottleneck.

### Avalanche L1s: what changed from subnets

Before December 2024, a subnet validator had to stake 2,000 AVAX and also validate the Primary Network. That linked launch cost to AVAX staking and to running full primary infrastructure.

With the Etna upgrade (mainnet activation December 16, 2024, Fuji November 25, 2024, described in the Avalanche blog post Etna: Enhancing the Sovereignty of Avalanche L1 Networks), subnets became Avalanche L1s:

* **No mandatory Primary Network validation for L1-only validators.** An L1 validator pays a continuous fee to the P-Chain instead of locking 2,000 AVAX. Documentation and support articles put the fee at about 1.33 AVAX per month, adjusted by a dynamic fee model (ACP-103).
* **Custom validator management on chain.** L1 creators deploy a ValidatorManager contract that defines who can join, whether stake uses AVAX or another token, and whether the set is proof-of-authority or proof-of-stake. This is defined in ACP-77.
* **Custom fee market and gas token.** A Subnet-EVM chain can set its own genesis allocation, decide if fees are burned or sent to a treasury contract, and use any token for gas. The C-Chain still uses AVAX for gas; an L1 does not have to.
* **Isolation.** Load on one L1 does not raise gas prices on another. That avoids the noisy neighbor effect you see when a popular mint crowds a shared EVM chain.
* **Compliance and privacy controls.** An L1 can require validators to be in a specific country, hold a license, or pass KYC/AML, or make the chain private so data is visible only to approved validators.

After Etna, the Primary Network still requires 2,000 AVAX. L1 deployment cost fell by over 99 percent according to Ava Labs, which is why teams compare it to cloud-style pay-as-you-go rather than a large upfront bond.

### Native interoperability: ICM and Warp Messaging

Avalanche Interchain Messaging (ICM), formerly Avalanche Warp Messaging (AWM), is the primitive for cross-L1 calls. The P-Chain stores each L1's validator set and BLS public keys. When a contract on L1 A sends a message, validators of A sign it, signatures are aggregated into a single BLS aggregate signature off chain, and a relayer submits it to L1 B. The receiving VM verifies the aggregate against the canonical validator set at that P-Chain height.

On top of that, ICM Contracts make the flow developer friendly. Teleporter (TeleporterMessenger) is the production ICM contract for EVM L1s. It handles message delivery, retry, and fee handling so developers call a contract instead of building signature aggregation themselves. ICM Services releases track versions (ICM Relayer v1.7.5 and Signature Aggregator v0.5.4 as of January 27, 2026) and must match the AvalancheGo version.

## Performance, fees, and token mechanics you can check

* **Throughput and finality:** Official sites state over 4,500 transactions per second on the Primary Network and finality in under one second on the C-Chain, with custom L1s able to reach under 100 milliseconds. Avalanche's academy page Throughput vs. Time to Finality lists Avalanche / Avalanche L1 at about 2,500 TPS and about 0.8 second finality in a controlled benchmark, versus Bitcoin at 7 TPS and 60 minutes and Ethereum at 30 TPS and about 6.4 minutes. Real mainnet TPS varies with demand; explorers at explorer.avax.network and Chainspect show live volume around tens of TPS per hour during normal periods, not the peak benchmark.
* **Fees:** Fees are burned, not paid to validators. The C-Chain uses EIP-1559. ACP-125, activated with Etna, lowered the C-Chain minimum base fee from 25 nAVAX to 1 nAVAX, a 96 percent reduction in the floor during low activity. L1s set their own fee rules via Subnet-EVM precompiles.
* **Supply:** AVAX has a hard cap of 720 million tokens. 360 million were minted at genesis. The rest are minted as staking rewards on the P-Chain. Burned fees are not reused for rewards. You can view burned fees at burnedavax.com or avascan.info/stats/burnedfees. When supply nears the cap, protocol reward rates fall.
* **Staking and security trade-offs:** There is no slashing on the Primary Network. A validator that falls below the uptime threshold forfeits rewards for that period but does not lose principal. The threshold is more than 80 percent uptime (pre-Helicon) when observed by stake-weighted peers; Helicon and ACP-267 raise it to 90 percent for auto-renewed validation. Staking locks AVAX for 2 weeks to 1 year with no early exit, and stake cannot be increased mid-period. Rewards are minted on the P-Chain and paid only at the end of the period to the addresses supplied in the staking transaction. Delegation capacity per validator is capped by a formula that limits active delegation relative to validator stake.

## Real deployments on Avalanche today

These are listed on avax.network and build.avax.network and are verifiable in Explorer:

* **DeFi:** Aave, Benqi, LFJ (formerly Trader Joe), Dexalot (its own L1 with about 6 million transactions per 30 days), Euler, Pharaoh, and GMX. They use the C-Chain for EVM execution and in some cases an L1 for orderbook or isolated settlement.
* **Gaming and consumer:** Gunzilla's Off The Grid (an L1 that processed about 12.9 million transactions per 30 days on the public dashboard), MapleStory Universe (Henesys L1), Beam (gaming infrastructure), and Lamina1.
* **Institutions and tokenization:** JPMorgan Onyx on Evergreen Spruce, Citi with Wellington Management and WisdomTree exploring private market tokenization, Franklin Templeton's Benji money market fund, BlackRock's BUIDL share classes via Securitize, Apollo via Securitize, Grove Finance targeting 250 million dollars, Intain's multi-trillion dollar securitized finance subnet, and the Wyoming stable token FRNT.
* **Enterprise and public sector:**California DMV digitizing 42 million car titles on Avalanche, Kite AI, T-Rowe Price collaboration, Dinari Financial Network, and Lynq.

Older guides often cite Pangolin, Crabada, and Kalao. Those projects existed on Avalanche in 2021 to 2022 but are no longer representative of largest volume on the network. Check Explorer or core.app/discover for current app rankings rather than relying on dated lists.

## Pros and cons**Pros:**

* **EVM familiarity with lower cost and faster settlement.** If you already ship Solidity, you keep the same language, wallets, and tooling while getting typical fees in cents and settlement in 1 to 2 seconds versus about 12 to 15 seconds for a block on Ethereum and near-finality only after multiple confirmations.
* **Isolated scaling via L1s.** Each L1 processes its own transactions, so growth is horizontal. A breakout game or market event on one L1 does not require all other apps to compete for the same block gas limit.
* **Flexible sovereignty.** You control the VM choice, gas token, fee handling, upgrade policy, validator admission, and privacy. That is useful for regulated use cases where a public permissionless chain cannot meet audit or residency rules.
* **No slashing on principal.** Poor uptime forfeits rewards but does not burn staked AVAX, which differs from chains that slash for double signing or downtime.
* **Native messaging without a custodial bridge.**Warp-based ICM uses the P-Chain validator registry and BLS aggregation, so trust rests on the source L1 validator set rather than a separate bridge multisig.**Cons:**

* **Liquidity and user fragmentation.** Sovereign chains can split liquidity, tooling attention, and users across many L1s. You will need an ICTT or Teleporter bridge and routing strategy if users or stablecoins must move between L1s.
* **Smaller per-L1 validator sets.** The Primary Network has hundreds of validators; a single L1 may have 5 to 20 validators (for example, many L1s listed in Explorer show fewer than 15). That is fine for an app chain but offers less decentralization for that chain than Ethereum mainnet.
* **Operational work.** Running an L1 means operating validators, managing the ValidatorManager contract, running ICM relayers or signature aggregators, and monitoring P-Chain fee balances so validators are not removed for non-payment after Etna.
* **EVM lock-in on the C-Chain.** If you need a non-EVM VM, you must build and maintain it as an L1 rather than deploying to the shared C-Chain. Custom VMs need their own audits.
* **Fixed lock periods for staking.**Native staking locks AVAX for weeks to months. You cannot unstake early. Liquid staking pools like sAVAX or ggAVAX keep tokens transferable but add smart contract and depeg risk.

## How to try it or build on it

1.**Set up a wallet.**Install Core (core.app) for full P-Chain support, including staking and cross-chain transfers, or use MetaMask for C-Chain only. Add Avalanche C-Chain (mainnet 43114, Fuji 43113) if your wallet does not include it. Verify RPC URLs at build.avax.network/docs/primary-network.
2.**Get test funds.**On Fuji, use the official faucet at core.app/tools/testnet-faucet/?subnet=c&token=c for up to 2 AVAX per claim, or QuickNode or Chainlink faucets for smaller drips. Test AVAX has no monetary value and works only on Fuji.
3.**Deploy a contract on the C-Chain.**Use Hardhat or Foundry with Solidity. Point your config to `https://api.avax-test.network/ext/bc/C/rpc` on Fuji and `https://api.avax.network/ext/bc/C/rpc` on mainnet, set chain ID accordingly, and deploy as you would on any EVM chain. Verify on Snowtrace (snowtrace.io on mainnet, testnet.snowtrace.io on Fuji).
4.**Try staking without running a node.**In Core, move AVAX to the P-Chain, choose staking then delegation, select a validator by NodeID, and set amount (at least 25 AVAX), duration, and reward address. Rewards arrive only at the end of the period if the validator stays above the uptime threshold.
5.**Launch an L1 (when you need isolation).**Use Avalanche CLI (`avalanche` binary) and the L1 Toolbox. The Fuji workflow lets you create a Subnet-EVM config, deploy a test L1, test gas tuning and allowlists, and test Teleporter messages between chains before mainnet. Post-Etna, fund the L1's P-Chain fee balance (about 1.33 AVAX per validator per month at launch parameters) and deploy your ValidatorManager contract.
6.**Handle cross-chain assets properly.**Do not assume liquidity follows code. Decide on a home token and use the Interchain Token Transfer (ICTT) flow so transfers are attested by source-L1 signatures rather than a wrapped bridge you must trust separately.

## FAQ**What exactly is Avalanche?**Avalanche is a network of blockchains anchored by a Primary Network of three chains (X-Chain, P-Chain, C-Chain) plus many sovereign Avalanche L1s. It uses the Snowman consensus protocol, which reaches agreement by repeated random sampling rather than leader proposal or mining.**How does Snowman differ from proof of work or proof of stake?**Snowman is not work-based and is leaderless. Any staked validator can propose, and agreement forms when repeated samples show the same preference for enough rounds (beta). That gives fast, energy-efficient finality without the long probabilistic settlement of Nakamoto chains, where a block can be reorganized after inclusion.**What are the current validator requirements?**On the Primary Network, a validator stakes at least 2,000 AVAX on the P-Chain. On an Avalanche L1 after Etna, a validator pays a continuous P-Chain fee (about 1.33 AVAX per month) and follows the L1's ValidatorManager rules instead of the 2,000 AVAX requirement, and does not have to validate the Primary Network.**Are fees on Avalanche low?**Typically yes when activity is moderate. The C-Chain minimum base fee is 1 nAVAX after ACP-125, so simple transfers cost fractions of a cent to a few cents. Fees are burned. L1s can set even lower fees or different models, and during high demand fees rise under EIP-1559-like pricing.**Does Avalanche slash stakers?**No. Avalanche does not slash principal on the Primary Network. If a validator misses the uptime threshold (80 percent for periods started before Helicon, 90 percent after, when observed by stake-weighted peers), the validator and its delegators receive no rewards for that period, but principal returns at the end of the lock.**What is the difference between a subnet and an Avalanche L1?**Subnet was the old term for a set of validators. Avalanche L1 is the post-Etna term for the sovereign chain itself, with its own validator management contract and continuous fee model. Docs still show both terms; new work uses Avalanche L1.**How do Avalanche L1s talk to each other?**Through ICM (Interchain Messaging) using Avalanche Warp Messaging. Source-chain validators sign a message, signatures are aggregated via BLS, and the destination chain verifies the aggregate against the P-Chain validator registry. Teleporter provides a contract-level interface on EVM L1s.**What AVAX supply and wallet facts should I know?**Cap is 720 million AVAX. 360 million at genesis, remainder as staking issuance. Current circulating supply and stake share are shown at stats.avax.network. Fees across all chains that use AVAX for gas are burned.**When should I choose C-Chain versus my own L1?**Start on the C-Chain if your transaction rate is modest, you want immediate access to stablecoins, custody, wallets, and DeFi liquidity, and you do not need custom compliance. Move to an L1 when you need your own gas token, predictable fees under your own load, permissioning, privacy, or VM changes that the C-Chain cannot provide.**Where can I verify these details?**
Primary Network and consensus docs at build.avax.network/docs/primary-network and docs/avax-consensus, staking guide at build.avax.network/docs/primary-network/validate, ICM at build.avax.network/docs/cross-chain/avalanche-warp-messaging, Etna changes at avax.network/about/blog/etna-enhancing-the-sovereignty-of-avalanche-l1-networks, and live network stats at explorer.avax.network, status.avax.network, and avascan.info.

## Verifiable Primary Sources & References

1. [Ethereum EIP-721 Non-Fungible Token Standard Specification](https://eips.ethereum.org/EIPS/eip-721)
2. [Ethereum EIP-1559 Fee Market Change Specification](https://eips.ethereum.org/EIPS/eip-1559)
3. [Ethereum EIP-712 Typed Structured Data Hashing and Signing](https://eips.ethereum.org/EIPS/eip-712)
4. [Ethereum Official Yellow Paper & Protocol Specification](https://ethereum.github.io/yellowpaper/paper.pdf)
5. [Ethereum Consensus Specs & Proof of Stake Architecture](https://github.com/ethereum/consensus-specs)
6. [Solidity Compiler Official Documentation & Language Spec](https://docs.soliditylang.org/)
7. [Foundry Book Development & Testing Framework Documentation](https://book.getfoundry.sh/)
8. [Hardhat Ethereum Development Environment Documentation](https://hardhat.org/docs)
9. [Aave v3 Technical Protocol Architecture Documentation](https://docs.aave.com/developers/)
10. [Chainlink Decentralized Oracle Networks Architecture Whitepaper](https://chain.link/whitepaper)
