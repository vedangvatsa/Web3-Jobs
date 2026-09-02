---
title: Ethereum Merge Explained
description: >-
  What the Merge was, when it happened, and what it changed. Ethereum switched
  from proof-of-work to proof-of-stake on September 15, 2022 without downtime,
  cutting energy use by about 99.95 percent and changing how blocks are
  produced and how ETH is issued.
category: Technology Deep Dives
image: 'https://picsum.photos/seed/ethereum-merge/1200/630'
data-ai-hint: ethereum merge beacon chain
publishedDate: '2022-09-15'
lastUpdated: "2026-09-02"
---

The Merge was Ethereum's switch from proof-of-work to proof-of-stake. On September 15, 2022 at 06:42:42 UTC, Ethereum Mainnet merged with the Beacon Chain and stopped using mining to produce blocks. Validators who stake ETH took over that role.

No history was lost. No balances changed. No user action was required. ETH stayed ETH.

## What the Merge was, in two sentences

Ethereum ran as two systems in parallel. Mainnet handled accounts, balances, smart contracts, and transactions under proof-of-work, while the Beacon Chain ran proof-of-stake consensus without real transactions. The Merge joined them at a preset total difficulty, so the Beacon Chain became the consensus engine for Mainnet's execution layer.

After the Merge there is one Ethereum chain. It uses proof-of-stake for consensus and requires two clients per node: an execution client for transactions and state, and a consensus client for block gossip and fork choice. They talk through the Engine API with a shared JWT secret.

## Who this guide is for

* **Users and holders.** You want to know what changed for your wallet, your ETH, and your fees. Short answer: nothing to do, and fees did not drop because of the Merge itself.
* **Builders and application developers.** You need to know what changed in block structure, timing, randomness, and finality, and what stayed the same for smart contracts.
* **Node operators and stakers.** You need to know the new client requirements, the validator duties, and the risks if you did not upgrade. This includes why running a non-validating node still needs no ETH.
* **Anyone evaluating Ethereum on energy or issuance.** You need the verified numbers on energy, issuance, and supply, not estimates from secondary sources.

If you only need the headline: the Merge was a consensus change to reduce energy use and set up scaling. It was not a scaling upgrade by itself.

## How the Merge worked

### The two chains before September 2022

* **Mainnet (execution layer).** Live since July 30, 2015. Secured by proof-of-work and miners competing with Ethash. Average block time about 13.3 seconds. Uncle blocks and the GHOST protocol helped handle short-term forks.
* **Beacon Chain (consensus layer).** Launched December 1, 2020. A separate proof-of-stake chain with no real Mainnet transactions. It managed validators, attestations, and the fork choice rules. It ran live for about 21 months to prove proof-of-stake worked before touching user funds.

Developers tested the hand-off for more than a year on testnets. Ropsten, Sepolia, and Goerli each went through their own merges before Mainnet.

### The two-step trigger

The Merge was not a flag day at a block height. It was a two-step activation:

1. **Bellatrix** on the consensus layer at Beacon Chain epoch 144896, which the Ethereum Foundation scheduled for 11:34:47 UTC on September 6, 2022. Bellatrix updated consensus clients for the hand-off, including fork choice changes and full validator penalty values.
2. **Paris** on the execution layer at Terminal Total Difficulty (TTD) 58750000000000000000000. When Mainnet's total difficulty reached that value, the next execution block was produced by a Beacon Chain validator instead of a miner. That happened at Mainnet block 15537393 on September 15, 2022 at 06:42:42 UTC. Finality for that first post-TTD block came about two epochs later, about 13 minutes, under normal conditions.

TTD was used instead of block number because hash rate moves. If more miners joined, TTD arrived earlier. If hash rate left, it arrived later. The spec authors chose TTD so the hand-off tracked real work, not a guess at future hash rate.

Sources for those values: ethereum.org/roadmap/merge, ethereum.org/ethereum-forks, and the Mainnet Merge Announcement on blog.ethereum.org dated August 24, 2022.

### What happened at the hand-off

* Execution clients stopped mining and disabled proof-of-work block production and propagation.
* Consensus clients started proposing and attesting to blocks that carry execution payloads. Validators now propose blocks in 12-second slots. Thirty-two slots make one epoch (6.4 minutes). A validator is pseudo-randomly selected by RANDAO to propose each slot, and a committee attests to each block.
* History was preserved. All accounts, contracts, balances, and receipts from genesis remained intact. The execution payload is now wrapped inside a beacon block.

After the hand-off, a full node is the pair of clients. Running only one side leaves you offline from the network view. This was the main operational change for node operators and stakers.

### How consensus works after the Merge

**Attestations and fork choice.** Validators attest to the block they see as the head. The fork choice rule is LMD-GHOST (Latest Message Driven Greediest Heaviest Observed SubTree). In simple terms, the chain with the greatest weight of latest validator votes is the canonical head. The execution layer still validates transactions, but whether a payload is canonical depends on the surrounding consensus block.

**Finality with Gasper and Casper FFG.** Slots handle liveness, epochs handle finality. The first block of each epoch is a checkpoint. Validators vote on pairs of checkpoints. When a pair gets votes representing at least two-thirds of total staked ETH, the target is justified and the source is finalized. Once finalized, reverting a block requires burning at least one-third of staked ETH. That is why exchanges and bridges can treat a finalized block as economically settled. If finality stalls for more than four epochs, the inactivity leak gradually reduces balances of non-attesting validators until two-thirds can agree again.

**Rewards and penalties.** Issuance goes to validators who attest and propose correctly. Offline validators miss rewards and incur small penalties. Validators who equivocate by proposing two blocks in one slot, or who submit contradictory attestations, can be slashed. Slashing starts with an immediate penalty of about 1/4096 of effective balance (up to 0.5 ETH), adds a correlation penalty around day 18 if many validators are slashed together, and ends with ejection around day 36. The correlation penalty means a solo mistake costs less than a coordinated attack, which can destroy the full stake.

**Randomness, timing, and opcodes.** Applications that used difficulty as randomness now read prevRandao from the PREVRANDAO opcode (0x44, previously DIFFICULTY). Block times became fixed 12-second slots instead of variable proof-of-work intervals, so average block production is about 10 percent more frequent than before. Safe head and finalized block tags were introduced for confirmations; many apps now check the finalized tag instead of a count of confirmations.

## What changed, what did not, and the trade-offs

### What the Merge delivered

**Energy.** The largest measurable change. Per ethereum.org and the CCRI bottom-up study commissioned before the Merge, annualized network energy use fell from about 21 TWh per year under proof-of-work to about 0.0026 TWh per year after, about 2,601 MWh. Carbon fell from about 11,016,000 tonnes CO2e to about 870 tonnes. That is a reduction of about 99.95 percent on ethereum.org's summary, and 99.988 percent electricity and 99.992 percent carbon in the CCRI figures. Either way, mining hardware no longer secures Ethereum.

**Issuance.** Per ethereum.org/roadmap/merge/issuance, miners received about 13,000 ETH per day before the Merge between execution issuance and Beacon issuance. After the Merge, execution issuance is zero and only consensus issuance remains, about 1,700 ETH per day at about 14 million ETH staked. Annualized issuance fell from about 4.61 percent to about 0.52 percent, a net drop of about 88 to 89 percent. At the time of the Merge total supply was about 120,520,000 ETH. The ETH burn from EIP-1559 continues: the base fee is burned each block. When average gas price is at least about 16 gwei, the daily burn offsets daily issuance and net supply is flat or negative for that day. Higher demand burns more.

**Hardware and participation.** Mining needed specialized rigs and cheap power. Validating needs 32 ETH to activate a validator, plus a consumer machine with about 1 to 2 TB of storage, a stable internet connection, and uptime. The deposit joins an activation queue that limits how fast new validators join. Pools and staking services let users participate with less than 32 ETH, but they add counterparty risk. The result is lower hardware barriers and more participants counted as block producers, but capital requirements remain high for solo stakers.

**Security model.** Proof-of-work security was the cost of energy and hardware to out-mine the chain. Proof-of-stake security is the cost to acquire and risk losing staked ETH. A 51 percent style attack now means controlling a majority of staked ETH and voting it dishonestly, which can be slashed and, if needed, socially forked away by the community's choice of client. Research and client implementation make long-range attacks and many reorg forms harder than under the old rules, though no system removes all attack vectors.

**Roadmap enablement.** The Merge did not itself add data space for rollups. It removed the proof-of-work constraint that blocked sharding and data availability sampling. That opened the path to later upgrades like EIP-4844 Proto-Danksharding, which shipped with Dencun on March 13, 2024 and cut rollup data costs by adding blob-carrying transactions.

### What the Merge did not do

* **It did not lower gas fees.** Fees are set by demand versus capacity. Capacity did not increase. A rollup-centric scaling plan is what lowers user fees.
* **It did not speed up transactions for users in a noticeable way.** Slots are 12 seconds, compared with about 13.3 seconds before. Confirmation feel is similar.
* **It did not enable staking withdrawals.** Withdrawals stayed disabled until the Shanghai/Capella upgrade on April 12, 2023. Only fee tips and MEV went to the validator's fee recipient right away. Staked principal and consensus rewards stayed locked until that later upgrade, and exits are still rate limited to about 0.33 percent of staked ETH per day.
* **It did not require users to swap tokens.** There is no ETH1 or ETH2, no new address format, and no migration. Anyone who offered a swap was running a scam.

### Honest trade-offs

| Area | Before the Merge | After the Merge | What to weigh |
| --- | --- | --- | --- |
| Energy | High, miners burned power per block | Very low, validators attest | Clear win on sustainability, but new reliance on client software correctness |
| Issuance and supply | About 13,000 ETH per day, about 4.6 percent annualized | About 1,700 ETH per day at 14M staked, about 0.5 percent. Burn can offset issuance above about 16 gwei | Lower dilution for holders, but staking yield varies with total staked and network demand |
| Hardware | ASIC and GPU farms, economies of scale in power | Ordinary hardware, 32 ETH per validator | More accessible to run a node, harder to solo stake without capital |
| Client complexity | One execution client per node | Execution plus consensus plus validator client, Engine API with JWT auth | Better modularity, more to operate and monitor |
| Fork choice and finality | Longest work chain, probabilistic confirmations only | LMD-GHOST plus Casper FFG, economic finality in two epochs | Faster strong settlement, but relies on at least two-thirds honest stake and correct checkpoint voting |
| MEV and block building | Miners ordered transactions and kept fees | Validators propose, builders can order via MEV-boost style pipelines | Same ordering economics, now with proposers and builders separated and more transparent |

## How to use Ethereum after the Merge

### If you hold ETH or use apps

1. Do nothing to your funds. Keep your seed phrase and hardware wallet as before.
2. Ignore any message about upgrading ETH or swapping to a new token. That is not real.
3. If you check confirmations, prefer the finalized tag where your wallet or explorer offers it. On layer 1, finality now has a defined gadget instead of a rule of thumb like 12 confirmations.

### If you run a node and do not validate

1. Run both clients. Pick one execution client (Geth, Besu, Erigon, or Nethermind) and one consensus client (Lighthouse, Lodestar, Nimbus, Prysm, or Teku). As of the Merge announcements, the recommended Merge-ready versions were Geth 1.10.23, Besu 22.7.2, Erigon v2022.09.01-alpha, Nethermind 1.14.1, and Lighthouse 3.1.0, Lodestar 1.0.0, Nimbus 22.9.0, Prysm 3.1.1, Teku 22.9.0. Check current releases before you install today.
2. Generate a JWT secret and pass it to both clients so the Engine API authenticates. Without it both sides report as offline.
3. Watch client diversity. Avoid running the majority client on both layers at once if you can. Guides and live share data are on clientdiversity.org.

You still need no ETH to run a non-validating node. That misconception persists, but it has never been true.

### If you stake or plan to stake

1. Deposit 32 ETH per validator through the official launchpad and run an execution client plus a consensus client plus a validator client.
2. Set a fee recipient address on the validator client. Tips and MEV go there immediately. Consensus rewards accrue on the Beacon Chain.
3. Set a withdrawal address after Shanghai/Capella if you have not. Partial withdrawals sweep excess balance above 32 ETH automatically. Full withdrawals require an exit and are rate limited.
4. Plan for penalties. Keep your validator online and do not run duplicate keys. A double proposal or double attestation can trigger slashing.
5. If you use a pool or staking service, check how it splits tips, MEV, and consensus rewards, and how it handles slashing or downtime.

### If you build apps

1. Stop using DIFFICULTY for randomness. Read PREVRANDAO and document the switch for auditors.
2. Review code that assumes proof-of-work timing or block hash behavior. Slots are now exactly 12 seconds and empty slots can occur when a validator is offline.
3. Use safe head and finalized tags for important state reads. Do not assume immediate finality from a single confirmation.
4. Test on a post-Merge testnet flow. The Merge left most user and contract APIs unchanged, but off-chain tooling, indexers, and deployment pipelines needed checks. Run a full deploy and monitor on Sepolia or a current testnet and report client issues to the client's tracker.

## FAQ

**Did the Merge change gas fees?**
No. The Merge changed how blocks are produced, not how much data fits in a block. Fees stayed driven by demand. EIP-1559 still sets a base fee that is burned and a tip that goes to the fee recipient. The later Dencun upgrade with EIP-4844 is what made rollup data cheaper.

**Do I need to do anything with my ETH or wallet?**
No. Your ETH, tokens, and NFTs stayed where they were. Wallets work the same before and after. The Foundation repeated this before and after the Merge because scam sites claimed a swap was needed. Do not sign those transactions.

**Does running a node require 32 ETH?**
No. Running a node that verifies blocks and serves your own RPC requires only disk, bandwidth, and both clients. Staking 32 ETH is only for validators who propose blocks. Most nodes are non-validating and are important for decentralization.

**When could stakers withdraw?**
Not at the Merge. Withdrawals were enabled by the Shanghai/Capella upgrade on April 12, 2023. After that, you can set a withdrawal address and receive auto-sweeps of balance above 32 ETH. Full exits are rate limited and validator churn is capped per epoch.

**How much did energy use really drop?**
ethereum.org reports about 99.95 percent. The CCRI measurement report commissioned for ethereum.org breaks it down as 99.988 percent for electricity and 99.992 percent for carbon, to 0.0026 TWh per year and about 870 tonnes CO2e. Both figures describe the same drop at slightly different measurement scopes. The before figure was about 21 TWh per year.

**What happened to Eth2?**
The name was retired. Eth1 is now called the execution layer and Eth2 is the consensus layer. Nothing in the roadmap changed, only the names, to avoid users thinking they held a different asset.

**Did the Merge make Ethereum more centralized?**
It changed where centralization pressure sits. Mining was concentrated in pools with cheap power and hardware supply chains. Staking can be concentrated in large pools and hosted services because 32 ETH is a high deposit and running validators has operational work. Client diversity, geographically distributed nodes, and distributed validator technology are the current mitigations. The data to watch is share of stake by entity and share of clients by implementation.

**How does finality work now?**
In normal operation a transaction is included in a block within a slot, then justified and finalized across two epochs, about 12.8 minutes from the epoch boundary. Finalized means the protocol would need to burn at least one-third of staked ETH to revert it. Apps that need strong settlement wait for finalized.

**Where can I verify this?**
Start with the pages that shipped the Merge: ethereum.org/roadmap/merge, ethereum.org/roadmap/beacon-chain, ethereum.org/energy-consumption, ethereum.org/roadmap/merge/issuance, and the protocol announcement on blog.ethereum.org dated August 24, 2022. The consensus and execution specs for Bellatrix and Paris are linked from those pages.
