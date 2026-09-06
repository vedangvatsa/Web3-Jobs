---
title: Consensus Layer Explained - What It Is and How It Works on Ethereum
image: /images/johannes-plenio-FZpCcPss9to-unsplash.jpg
data-ai-hint: ethereum consensus layer
description: >-
  The consensus layer is the proof-of-stake system that secures Ethereum after
  The Merge. Learn what it does, how Gasper and the Engine API work, who needs
  it, trade-offs, and how to run or build on it.
category: Educational
publishedDate: '2026-03-11'
lastUpdated: "2026-09-06"
---
The consensus layer is the part of Ethereum that decides which block is correct and which chain is canonical. Since The Merge on September 15, 2022, Ethereum runs with two linked pieces: an execution layer that runs transactions and an EVM state, and a consensus layer that runs proof-of-stake, selects block proposers, collects validator votes, and finalizes history. Together they form a single Ethereum network. This split replaced proof-of-work mining.

If you run a node, build a dapp, or evaluate validator or protocol work, you interact with the consensus layer even when you only use an execution client.

## What it is

The consensus layer is the network of consensus clients (sometimes called beacon nodes) that implement proof-of-stake consensus for Ethereum. Before The Merge it ran separately as the Beacon Chain, launched December 1, 2020. After The Merge the Beacon Chain became the consensus engine for Mainnet. The older proof-of-work clients stopped handling block gossip and consensus logic. Today every full node runs two pieces of software that talk over the Engine API with a JWT secret: an execution client (Geth, Nethermind, Besu, Erigon, Reth) and a consensus client (Lighthouse, Prysm, Teku, Nimbus, Lodestar).

The consensus layer does not execute smart contracts or track ETH balances by itself. Its jobs are:

- Maintain the validator registry and balances
- Run the fork-choice rule to pick the head of the chain
- Run the finality gadget to mark blocks that cannot be reverted without slashing
- Manage rewards, penalties, and slashings
- Gossip blocks and attestations on its own p2p network

The execution layer still gossips transactions, builds execution payloads, and runs the EVM. A beacon block wraps an execution payload together with consensus data such as the RANDAO reveal, attestations, slashings, deposits, voluntary exits, and sync committee data.

The term consensus layer comes from the 2022 renaming where Eth1 became execution layer and Eth2 became consensus layer. The Ethereum Foundation documented this in The Great Renaming and the Mainnet Merge Announcement. Any reference to Eth2 now means consensus layer.

A consensus mechanism is the full stack of rules and incentives that lets nodes agree on state. Proof-of-stake is only one part of it - the Sybil resistance and block-author selection. Gasper, which combines Casper FFG and LMD-GHOST, is the actual consensus mechanism used on the consensus layer.

## Who it is for

- **Node operators:**You must run both clients to stay on the correct chain. A consensus client without a validator still follows the head and exposes safe and finalized block tags for apps. A full node without a consensus client cannot validate post-Merge blocks.
-**Validators and staking teams:**You add a validator client to a consensus client and stake ETH. You propose blocks when selected and attest every epoch. You accrue rewards or penalties and can be slashed for double voting or double proposing.
-**Application developers:**You should read safe (justified) and finalized checkpoints rather than counting proof-of-work confirmations. Your JSON-RPC calls now have `latest`, `safe`, and `finalized` tags. Handling reorgs correctly depends on understanding when a block is justified versus finalized.
-**Researchers and job seekers:**Protocol teams, L2 teams, wallet teams, and security auditors all expect you to know slot and epoch timing, attestations, weak subjectivity, and the inactivity leak. Roles titled protocol researcher, consensus engineer, or validator operations directly build on this.
-**Hiring managers and analysts:**Energy, issuance, and security comparisons between proof-of-work and proof-of-stake come from this layer.

If you only use a custodial exchange or a hosted RPC and never run infrastructure, you do not need to operate a consensus client. You still benefit from knowing how finality works when you set confirmation policies.

## How it works

### Time, slots, and RANDAO selection

Time is divided into slots of 12 seconds and epochs of 32 slots (6.4 minutes). One validator is pseudo-randomly selected to propose a block in each slot. There is no true randomness across nodes. Ethereum uses RANDAO, where each proposer mixes a hash with a seed that updates each block. The selection is fixed two epochs in advance and is weighted by effective balance. The maximum effective balance is 32 ETH for legacy validators and up to 2048 ETH for compounding validators after the Pectra upgrade in May 2025. Balance above the cap does not increase selection weight.

Only one block per slot should exist. Proposing two different blocks for the same slot is a slashable equivocation.

### Beacon block and execution payload

When it is your slot, your consensus client asks your execution client for an execution payload. That payload contains transactions from the mempool, a state root, and other execution data. The execution client executes the transactions locally to produce the post-state. The consensus client wraps the payload in a beacon block along with `randao_reveal`, `eth1_data`, graffiti, proposer slashings, attester slashings, deposits, voluntary exits, and the `sync_aggregate`. The block is signed and gossiped on the consensus layer network. Peers verify the parent, slot, proposer index, RANDAO reveal, signatures, and then ask their own execution client to re-execute the transactions before accepting.

### Committees and attestations

Every active validator attests once per epoch, not every slot. Each epoch the validator set is shuffled with the RANDAO seed and spread across the 32 slots. Each slot can be split into up to 64 committees. At current validator counts each committee holds several hundred validators.

An attestation carries two votes:

- An LMD-GHOST vote for the block the validator sees as the head of the chain
- A Casper FFG vote for a checkpoint pair that the validator considers correct

Weight is by staked ETH, not validator count. The threshold that matters is a two-thirds supermajority of total staked ETH.

### Fork choice: LMD-GHOST

If two blocks appear at the same height due to latency or equivocation, nodes need a rule to pick one. Ethereum uses LMD-GHOST, short for Latest Message Driven Greedy Heaviest Observed Sub-Tree. Each validator looks at the attestations it has seen and picks the fork with the greatest accumulated weight. If a validator sent multiple votes, only the latest counts. Under normal conditions with one honest proposer per slot, the fork choice does little work. When forks exist, it is the defense that keeps nodes converging.

### Finality: Casper FFG and Gasper

Only checkpoints can be justified or finalized. The first block of each epoch is a checkpoint. When validators holding at least two-thirds of total stake vote that checkpoint B is the correct descendant of checkpoint A, that forms a supermajority link. The newer checkpoint becomes justified. When the next checkpoint is justified on top of a justified one, the earlier justified checkpoint becomes finalized.

Gasper is the combination of Casper FFG (the justification and finalization gadget) and LMD-GHOST. The flow is:

1. Collect FFG votes for a checkpoint pair
2. If two-thirds vote for it, mark the target as justified
3. If a justified checkpoint gets another justified checkpoint built on it, mark the first as finalized

Under normal operation, finalization takes about two epochs, roughly 13 minutes. A finalized block cannot be reverted unless at least one-third of total staked ETH is destroyed for double voting. Reverting two consecutive finalized blocks would require two-thirds collusion. Slashing removes part or all of the offending stake and ejects the validator. The correlation penalty on day 18 is larger when many validators are slashed at once. The exit for a slashed validator takes 36 days, with an initial penalty of up to 1 ETH on day 1.

Gasper provides plausible liveness: as long as two-thirds of stake follows the protocol, the chain can finalize regardless of other activity. If the chain fails to finalize for more than four epochs, the inactivity leak activates. It slowly drains the stake of validators that are not attesting to the majority chain until the majority regains two-thirds and finality resumes.

### Rewards, penalties, and slashings

Honest validators receive rewards for proposing and attesting correctly, scaled by base rewards derived from total active stake. A proposer receives a fraction of base reward for each valid attestation included, plus a small reward for reporting slashings. Validators that are offline miss rewards and incur small penalties roughly equal to missed rewards.

Slashable behavior includes:

- Proposing two different blocks for the same slot
- Attesting to two different blocks for the same slot
- Surround votes that contradict prior checkpoint votes

These are penalized harshly because they indicate intentional misbehavior, not accidental downtime.

### The Engine API and node architecture

Execution clients gossip transactions and maintain transaction pools and state tries. Consensus clients gossip blocks and attestations, run fork choice, and track the Beacon state. The two clients communicate over a local authenticated RPC called the Engine API. Both sides are given the same JWT secret. For block proposal, the consensus client requests an execution payload. For block validation, the consensus client unbundles the payload and the execution client re-executes it.

This modular design let The Merge reuse battle-tested execution clients and run five independent consensus clients, which helps client diversity.

### Weak subjectivity, sync, and withdrawals

Proof-of-stake is subjectively secure: a new node syncing from genesis cannot know which chain is canonical from protocol rules alone. It needs a recent weak subjectivity checkpoint, typically a finalized block within the last few weeks. Checkpoint sync fetches state from such a checkpoint instead of replaying from genesis, with the same trust assumption as using a trusted execution snapshot.

Withdrawals were enabled in the Shanghai/Capella (Shapella) upgrade on April 12, 2023. Two paths exist:

-**Partial withdrawals (reward sweeps):**For legacy Type 1 validators with 0x01 credentials, any balance above 32 ETH is automatically swept to the withdrawal address every few days. No gas is needed. For compounding Type 2 validators with 0x02 credentials introduced in Pectra, rewards compound into effective balance up to 2048 ETH. Only balance above 2048 ETH is auto-swept. Amounts below that require a manual partial withdrawal from the execution layer that costs gas.
-**Full withdrawals (exits):**A validator submits a voluntary exit, enters an exit queue capped at 256 ETH per epoch (about 57,600 ETH per day), waits about 256 epochs (around 27 hours) to become withdrawable, then is included in a sweep of up to 16 withdrawals per block (115,200 per day if no slots are missed). For compounding validators, partial withdrawal requests share the same exit queue and up to 8 per block.

Activation also uses a queue with the same 256 ETH per epoch churn limit. Ethereum limits churn with EIP-7514 to bound validator set growth.

### Numbers you can verify

- Merge date: September 15, 2022 (Terminal Total Difficulty 58750000000000000000000, Consensus layer upgrade Bellatrix before Paris)
- Beacon Chain genesis: December 1, 2020
- Slot 12 seconds, epoch 32 slots, 6.4 minutes
- Effective balance caps: 32 ETH legacy, 2048 ETH compounding after May 2025
- Finality needs two-thirds, reversion without slashing impossible, slashing destroys at least one-third for finality reversal
- Energy: CCRI measurements show post-Merge consumption around 0.0026 TWh per year, a reduction of about 99.98% from about 78 TWh per year pre-Merge. Ethereum.org cites the same order of magnitude.

## Pros and cons**Where it helps**-**Energy use is far lower:**No puzzle race means validators run on modest hardware, even a low-power device. This cut issuance needs because validators do not pay large power bills, which allows lower inflation and, when fees are burned, a net deflationary effect.
-**Economic security is explicit:**An attacker needs to acquire and risk ETH directly. Controlling liveness needs at least 33% of stake, content of future blocks at least 51%, and rewriting finalized history more than 66%. Misbehavior is slashable and attributable, unlike hardware that can be reused after a proof-of-work attack. Research on equilibrium security finds proof-of-stake more secure than equivalent proof-of-work at scale.
-**Enables the scaling roadmap:**The validator registry and slashing make data availability sampling and danksharding practical. Rollups inherit security by posting data to this layer.
-**Light clients and checkpoint sync:**SSZ hash trees give a single 32-byte state root per block and enable compact Merkle proofs for light clients and for syncing from weak subjectivity checkpoints in minutes instead of days.**Trade-offs and limits**-**More complex to build and operate:**Proof-of-stake clients implement Gasper, RANDAO, committees, fork choice, rewards and penalties, and weak subjectivity. You now run two clients plus a validator if you stake, manage a JWT secret, and keep clocks roughly within a slot of peers.
-**Capital barrier and centralization pressure:**32 ETH per validator prices out many solo operators. Liquid staking derivatives lower the minimum but concentrate stake in a few providers. The protocol incentive is identical percentage yield for all stake sizes, so there are no mining economies of scale, but delegation pools still create central points.
-**New failure modes:**Nothing-at-stake and long-range attacks are prevented by slashing and weak subjectivity, yet they add conceptual overhead versus the objective longest-chain rule in proof-of-work. A new node must trust a recent checkpoint provider.
-**Queue delays:**Entry, exit, and sweeps are rate-limited. Even with empty queues, activation takes at least 16 hours to initialize plus the churn queue. Unstaking needs exit queue time plus about 27 hours plus sweep time, which can stretch to around 9 days when many validators exit.
-**Proposer targeting:**One known proposer per slot can be targeted for denial of service, a vector absent in proof-of-work where the next miner is unknown.

## How to get started**If you want to understand it deeply**1. Read the core pages on ethereum.org: proof-of-stake, Gasper, block proposal, and node architecture. Then skim the consensus specs on github.com/ethereum/consensus-specs for validator, Beacon block, and Beacon state definitions.
2. Run a full node on a testnet such as Hoodi or Sepolia. Install one execution client and one consensus client, generate a JWT secret, and start with checkpoint sync from a trusted finalized checkpoint. Compare `latest`, `safe`, and `finalized` with `curl` against both the JSON-RPC (execution) and the Beacon API (consensus).
3. Inspect live data: slots and epochs on a beacon explorer, committee assignments per slot, and Gasper votes. Watch a reorg on a slot with a missed proposer to see LMD-GHOST resolve it, then watch justification and finalization advance every two epochs.**If you want to operate a validator**1. Choose clients: common pairs are Geth plus Lighthouse, Nethermind plus Prysm, Besu plus Teku, Erigon plus Nimbus, or Reth plus Lodestar. Check current client diversity dashboards before deciding.
2. Prepare hardware: a modern CPU, 32 GB RAM, and a fast 2 TB SSD are typical recommendations, with reliable internet and backup power. Keep OS and clients updated and subscribe to client security lists.
3. Create keys with the staking deposit CLI and deposit at least 32 ETH per validator to the deposit contract. Set 0x01 credentials for legacy auto-sweeps or 0x02 for compounding up to 2048 ETH. Providing a withdrawal address once is required before any withdrawals flow.
4. Join the activation queue. Budget for the initialization delay and the churn of 8 validators per epoch. Monitor inclusion, attest correctly every epoch, and avoid running the same keys on two machines.
5. Plan exits in advance. Submit a voluntary exit, account for the exit queue and the 27-hour withdrawability delay, then wait for the sweep. For compounding validators, use execution-layer partial withdrawals for amounts below 2048 ETH.**If you build dapps or data pipelines**- Use execution layer `eth_getBlockByNumber` with tags `safe` and `finalized` for confirmations. Treat `safe` as justified and unlikely to reorg without collusion or severe latency, and `finalized` as canonical unless one-third of stake was slashed.
- For consensus data, query the Beacon API on a consensus node for validators, duties, attestations, and checkpoints, not the execution JSON-RPC.
- Account for missed slots. A missing proposer leaves an empty slot. Your indexer should handle non-consecutive slot numbers and still track epoch boundary checkpoints for finality.**Trusted starting points**- ethereum.org roadmap for the Beacon Chain, the Merge, and the engine API
- Ethereum Foundation blog posts on The Great Renaming and the Mainnet Merge Announcement
- Consensus specs and Engine API specs on GitHub

## FAQ**Is the consensus layer the same as proof-of-stake?**No. Proof-of-stake selects who can propose and how weight is counted. The consensus layer is the whole system that uses proof-of-stake plus Gasper, fork choice, gossip, and incentives to agree on the canonical chain.**How is the consensus layer different from the execution layer?**The execution layer executes transactions and holds accounts and storage. The consensus layer organizes those execution payloads into beacon blocks, collects votes, picks the head with LMD-GHOST, and marks history final with Casper FFG. They gossip on separate p2p networks and sync together via the Engine API.**What happened to Eth2?**The name was retired in early 2022. Eth1 is now execution layer, Eth2 is now consensus layer, and Ethereum is execution plus consensus. No roadmap features were removed, only names.**How long until a transaction is finalized?**A block is produced every 12 seconds when the proposer is online. It becomes justified after one epoch boundary receives two-thirds of votes and finalized one more justified checkpoint later, typically about 13 minutes after inclusion when the chain is healthy.**Can a finalized block be reverted?**Only if at least one-third of total staked ETH double votes and is slashed. The protocol destroys that stake. Social consensus could also coordinate to ignore an attacker fork, but the economic cost remains.**Why do withdrawals take time?**The protocol limits how quickly stake can enter or leave to keep the validator set stable. Entry and exit each cap at 256 ETH per epoch. After exiting, a validator waits about 256 epochs to become withdrawable, then waits for the round-robin sweep that processes up to 16 withdrawals per block.**What do legacy and compounding validators mean?**Legacy 0x01 validators have a 32 ETH effective balance cap. Any excess is auto-swept. Compounding 0x02 validators after Pectra can have up to 2048 ETH effective, so rewards add to weight and auto-sweeps only trigger above 2048 ETH.**Does the consensus layer use energy?**Far less than proof-of-work Ethereum. Third-party bottom-up measurements put the full network near 0.0026 TWh per year, on the order of a few thousand US homes, compared with tens of TWh per year before the Merge.**Do I need to run a consensus client if I only care about smart contracts?**If you run a full node, yes. After the Merge the execution client cannot determine the canonical head alone. If you rely on a provider, the provider runs both. Your app still benefits from using safe and finalized tags for important state reads.**Where does Solana proof-of-history or Cosmos Tendermint fit?**
Those are different consensus designs for other networks. Solana adds a verifiable delay function to order events before proof-of-stake voting, and Cosmos chains use CometBFT, a BFT protocol with Propose, Prevote, and Precommit steps and proposer selection weighted by voting power. Ethereum does not use proof-of-history. The term consensus layer is specific to Ethereum's post-Merge architecture.

## Verifiable Primary Sources & References

1. [Ethereum EIP-712 Typed Structured Data Hashing and Signing](https://eips.ethereum.org/EIPS/eip-712)
2. [Ethereum Official Yellow Paper & Protocol Specification](https://ethereum.github.io/yellowpaper/paper.pdf)
3. [Ethereum Consensus Specs & Proof of Stake Architecture](https://github.com/ethereum/consensus-specs)
4. [Solidity Compiler Official Documentation & Language Spec](https://docs.soliditylang.org/)
5. [OpenZeppelin Smart Contract Standard Libraries & Security Audits](https://docs.openzeppelin.com/)
6. [Base Layer 2 Network Official Documentation](https://docs.base.org/)
7. [Solana Core Architecture Documentation](https://docs.solana.com/)
8. [zkSync Era Documentation & Zero Knowledge Proofs Architecture](https://docs.zksync.io/)
9. [U.S. Securities and Exchange Commission (SEC) EDGAR Database](https://www.sec.gov/edgar/searchedgar/companysearch)
10. [Ethereum Official Developer Resources & Specs](https://ethereum.org/en/developers/docs/)
