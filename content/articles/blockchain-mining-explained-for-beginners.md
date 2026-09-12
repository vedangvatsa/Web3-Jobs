---
title: Blockchain Mining Explained for Beginners
image: /images/brian-kostiuk-S4jSvcHYcOs-unsplash.jpg
data-ai-hint: blockchain mining hardware
description: >-
  A plain-language explanation of proof-of-work mining, block construction,
  targets, pools, rewards, and the limits of a majority-hashrate attack.
category: Educational
publishedDate: '2026-03-11'
lastUpdated: "2026-09-08"
---

Mining is how a proof-of-work network proposes blocks and makes its history expensive to rewrite. It is not the process of discovering coins hidden in a computer. On a network such as [Bitcoin](/what-is-bitcoin), miners compete to publish a block whose header satisfies a difficulty rule. The accepted block can include valid transactions, and the winning miner may claim the block subsidy and the transaction fees assigned by the protocol.

Not every blockchain has miners. [Ethereum's proof-of-stake documentation](https://ethereum.org/en/developers/docs/consensus-mechanisms/pos/) says Ethereum switched from proof of work in 2022 and now uses validators that put ETH at risk rather than compete with hashing hardware. Many other networks use yet other consensus designs. This article uses Bitcoin's proof-of-work process because it shows the mechanics clearly. The terms are often applied too loosely to every cryptocurrency.

Mining also does less than beginners are often told. A miner does not decide whether a payment is morally legitimate, and it cannot make an invalid transaction valid. Full nodes apply the network's consensus rules. They check transaction structure, signatures, spending conditions, and the block's rules before accepting a block. Mining gives a valid block a place in the chain and makes competing histories costly.

## What a Bitcoin transaction needs

Bitcoin does not maintain a bank-style account balance for each user. A transaction spends unspent transaction outputs, often shortened to UTXOs. Each output has a locking condition. To spend it, a later transaction supplies data that satisfies that condition, commonly a signature from the required key. The transaction creates new outputs for the recipient and, usually, the sender's change.

When a node receives a transaction, it checks the relevant rules before considering it for relay or inclusion. A miner selects a set of candidate transactions from those it knows about and builds a candidate block. Selection is a policy choice within the consensus rules. Transaction fees, block space, dependencies between transactions, and the miner's own policies can all affect which transactions it includes.

The candidate block also contains a special first transaction called the coinbase transaction. This is not an exchange named Coinbase. In Bitcoin, the coinbase transaction creates the allowed block subsidy and collects the fees from the selected transactions. The [Bitcoin block reference](https://developer.bitcoin.org/reference/block_chain.html) states that a coinbase transaction is invalid if it claims more value than the allowed subsidy plus fees. Other nodes enforce that limit; a miner cannot pay itself an arbitrary amount.

## The block header and the puzzle

Miners do not repeatedly hash an entire block from scratch in the simple way many diagrams suggest. They repeatedly hash a compact block header. Bitcoin's header is 80 bytes and includes these fields:

- A version field that signals which validation rules apply.
- The hash of the previous block's header.
- A Merkle root, which commits to the transactions in the block.
- A timestamp supplied by the miner, subject to consensus limits.
- `nBits`, a compact encoding of the current target threshold.
- A nonce, a value the miner can change to make a different header hash.

The previous-block hash links the candidate to a particular chain tip. The Merkle root changes if the block's transaction set changes. The nonce changes without changing the transaction list. The [Bitcoin developer reference](https://developer.bitcoin.org/reference/block_chain.html) explains that a valid header hash must be less than or equal to the target. A smaller target makes success less likely because fewer possible hashes meet the condition.

People often describe a valid Bitcoin hash as one that starts with a certain number of zeroes. That is a visual shortcut for the numeric target rule, not the rule itself. The network compares a 256-bit hash value with the target. The number of visible leading zeroes is a convenient way to picture why a smaller numerical result is rare.

Cryptographic hashing gives miners no method to reason their way to the right nonce. A hash function produces an output that is hard to predict from the input. The practical method is repeated trial: prepare a header, hash it, compare the result with the target, alter a field, and try again. A successful result is quick for every node to verify because the node only needs to hash the submitted header once and apply the target comparison.

The four-byte nonce does not give a modern mining machine enough combinations by itself. Mining software can change an extra nonce in the coinbase transaction, rebuild the Merkle root, update the timestamp within allowed bounds, or work on a different transaction set. The [Bitcoin mining guide](https://developer.bitcoin.org/devguide/mining.html) describes this process and the way software passes header work and a target threshold to application-specific integrated circuits, or ASICs.

## From candidate block to accepted block

The sequence is straightforward, though each step has technical detail behind it.

1. A node or mining pool receives transactions and checks them against its rules.
2. Mining software constructs a candidate block that points to the current chain tip and includes a coinbase transaction.
3. It calculates the Merkle root for the selected transactions and constructs a header.
4. ASIC hardware hashes changing versions of that header until one result is at or below the network target.
5. The miner broadcasts the full block, not only the winning hash.
6. Receiving full nodes independently validate the header, the proof of work, every transaction, and the block's relationship to the chain they consider best.
7. If the block is valid, nodes add it to their local view of the chain and miners begin work on a block that references it.

The final two steps are essential. Finding a low hash is not permission to include invalid payments. A block that fails transaction validation, spends an output twice, breaks a consensus limit, or claims too much reward is rejected even if its hash is below the target. Mining and validation work together, but they are different jobs.

There can be short-lived competition between two valid blocks that extend the same parent. Different nodes may hear different blocks first. Miners generally build on the chain with the most accumulated proof of work. Eventually one branch receives further blocks and the other becomes a stale branch. A payment gains confidence as more work accumulates after its block, because replacing it requires an attacker to recreate work and catch up with the honest chain.

## Difficulty and block timing

Hashrate is the rate at which miners across the network generate hash attempts. More hashrate means more chances to find a valid hash in a given period. Without an adjustment mechanism, improved hardware or more miners would produce blocks more frequently. The protocol instead sets a target that changes over time to keep the expected block cadence near its intended rate.

Difficulty is a way to express how restrictive the target is. Higher difficulty means a lower target and more expected work before a hash succeeds. It does not guarantee that each individual block will take a particular number of minutes. Hashing is probabilistic. A block can appear quickly by chance, followed by a long wait, while the average over a large number of attempts follows the target probability.

This explains why a miner cannot promise a fixed payout interval when mining alone. A solo miner with a small share of the network has a correspondingly small chance of finding any given block. It may find one soon, or wait much longer than expected. The expected value and the timing of actual results are different things.

## Why mining pools exist

A mining pool combines the work of many miners so the group finds blocks more frequently. The pool distributes work and assigns a separate, easier target for shares. A share proves that a worker performed a measurable amount of hashing, even though the submitted hash is usually not low enough to create a Bitcoin block.

The mining guide explains that a pool pays participants roughly according to the shares they submit, while an occasional share also satisfies the network target and becomes a real block. The network does not know or care about a pool's internal share target. Consensus accepts only blocks that satisfy the network target and every other block rule.

Pooling reduces payment variance for participants, but it creates a relationship with the pool operator. The pool commonly decides the block template and receives the block reward before distributing its chosen payout. A miner should understand the pool's payout method, fee, payment threshold, custody model, and the degree of control it has over transaction selection. The existence of pools is a practical reason to distinguish raw network hashrate from the organizations coordinating that hashrate.

## Rewards, fees, and the word subsidy

The reward for a valid block has two parts. The block subsidy issues new bitcoin according to the protocol's schedule. Transaction fees come from the difference between a transaction's inputs and outputs and are collected by the miner through the coinbase transaction. The Bitcoin reference calls the combined amount the block reward.

The subsidy does not mean that every mining operation is profitable. A miner's costs can include hardware, electricity, cooling, space, network access, pool fees, maintenance, and financing. Revenue depends on the chance of finding valid blocks or shares, the reward rules, and the value of the asset received. Mining is a business calculation as well as a protocol activity. This article describes the consensus mechanism, not an investment case or a recommendation to buy hardware.

Fees also matter for long-term incentives because a block producer can receive them even when the subsidy changes under Bitcoin's predetermined schedule. A healthy fee market is not something a miner can create by itself. It depends on people submitting transactions that compete for limited block space and on users deciding what fees they are willing to pay.

## What proof of work protects

Proof of work makes alteration expensive because every block includes the previous block's header hash. Change a transaction in an old block and its Merkle root changes. That changes the block header hash. The following block no longer points to the changed header, so its header must also be rebuilt and mined again. The attacker must then produce a competing chain with enough accumulated work to overtake the honest chain.

This is why proof of work is a deterrent rather than a magic lock. An attacker with a large share of hashrate may be able to delay or censor some transactions, reorganize recent blocks, or attempt to spend its own coins twice after paying someone. It still cannot create a valid signature for coins it does not control, change the block-subsidy rule, or make nodes accept an invalid transaction. The [Ethereum consensus documentation](https://ethereum.org/en/developers/docs/consensus-mechanisms/pos/attack-and-defense/) makes the same distinction for proof-of-stake attacks: control over block selection does not let an attacker generate currency or drain arbitrary accounts because nodes still execute and validate transactions.

The phrase "51% attack" is a rough label, not a statement that an attacker controls every outcome at exactly one percentage point. The relevant question is whether the attacker can reliably outpace or dominate the honest chain's accumulated work for the attack it wants to perform. The cost includes equipment, energy, coordination, and the economic consequences of damaging a network on which the attacker may depend.

Proof of work does not protect a lost private key, a compromised exchange account, a fraudulent website, or a vulnerable smart contract on another chain. Those are different attack surfaces. A chain can be working exactly as designed while a user signs a malicious transaction.

## Proof of stake is not mining

Ethereum's proof-of-stake validators do not run a hash race. A validator deposits ETH, checks blocks proposed by peers, and votes through attestations. Ethereum's [proof-of-stake documentation](https://ethereum.org/en/developers/docs/consensus-mechanisms/pos/) says dishonest behavior such as conflicting proposals or attestations can cause some or all of the stake to be destroyed. Validators use ordinary computing hardware compared with proof-of-work mining's specialised hash hardware, but they still need reliable software, keys, and connectivity.

Both systems try to make dishonest control expensive. Proof of work ties block production to ongoing external resource expenditure. Proof of stake ties it to capital that the protocol can penalize. Neither makes a network invulnerable, and neither removes the need for users to protect keys or for developers to test applications.

Mining makes more sense once its limits are clear. It is a competition to publish valid proof of work, an incentive for maintaining a chain, and a cost imposed on rewriting recent history. It is not a shortcut to free currency and not a substitute for the validation rules that every full node applies.
