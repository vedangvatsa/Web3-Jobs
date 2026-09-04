---
title: What is a 51 Percent Attack in Blockchain?
description: >-
 A detailed explanation of the 51% attack, one of the most discussed security
 threats to Proof-of-Work blockchains like Bitcoin, and how it can enable.
category: Educational
image: 'https://picsum.photos/seed/51attack/1200/630'
data-ai-hint: 51 percent attack
publishedDate: '2026-03-11'
lastUpdated: "2026-09-04"
---

## What is a 51% Attack in Blockchain?

A fundamental security principle of a Proof-of-Work (PoW) [blockchain](/what-is-a-blockchain) like [Bitcoin](/what-is-bitcoin) is that no single entity should control more than half of the network's mining power. A **51% attack**, also known as a majority attack, occurs when a single miner or a coordinated group of miners gains control of over 50% of the network's total hashing power.

This control enables attackers to undermine the blockchain's integrity. They can halt new transactions from being confirmed and most critically, reverse their own transactions that were in the process of being confirmed. This scenario is often referred to as a **[double-spend attack](/double-spending-problem-in-cryptocurrency)**.

### Understanding the 51% Attack

* **Core Concept**: A 51% attack occurs when an entity or group commands over 50% of the hashrate of a PoW blockchain.
* **Main Threats**: The primary risks include **transaction censorship** and **double-spending**.
* **Capabilities of Attackers**: Attackers can orphan valid blocks from other miners and reverse their own transactions.
* **Limitations for Attackers**: Attackers cannot steal funds from others' wallets, create new tokens from nothing, or alter the underlying protocol rules.
* **Execution Feasibility**: While theoretically possible, launching a 51% attack on a prominent blockchain like Bitcoin is prohibitively costly and difficult. Smaller PoW cryptocurrencies with lower hashrates are significantly more vulnerable.

### Mechanics of a 51% Attack: Majority Hashrate Power

In a Proof-of-Work system, the "longest chain" is regarded as the authentic, valid chain due to the **[fork choice rule](/what-is-a-blockchain-fork-choice-rule)**. Miners use computational power (hashrate) to compete for the next block. As finding a block is probabilistic, the miner with the most hashrate typically discovers the most blocks over time.

An entity that controls more than half of the hashrate can statistically build a new chain more rapidly than the rest of the network combined. This capability enables the execution of a double-spend attack.

#### Double-Spend Scenario Explained

Here's a detailed example of how an attacker could apply a 51% attack to double-spend their coins:

1. **Setup**: The attacker secures a majority of the network's hashrate and possesses a significant amount of cryptocurrency they wish to spend twice.

2. **First Transaction (Public)**: The attacker broadcasts a transaction to the public network, sending their coins to a merchant (such as a cryptocurrency exchange) in exchange for goods or another currency (like USD). An honest miner includes this transaction in a block on the public chain.

3. **Private Chain Mining**: At the same time, the attacker mines a *secret, private* version of the blockchain using their majority hashrate. In this secret chain, they create a different transaction that sends the *identical coins* back to a [wallet](/how-to-choose-a-crypto-wallet) they control. With the majority hashrate, they can generate blocks for their private chain faster than honest miners can for the public chain.

4. **Waiting for Confirmation**: The attacker waits for the merchant to consider their initial transaction finalized. Typically, exchanges require several block confirmations before crediting a deposit. While the honest network continues to add blocks to the public chain, the attacker is secretly adding blocks more quickly to their private chain.

5. **Revealing the Secret Chain**: After the merchant has accepted the payment and delivered the goods, the attacker's secret chain is now longer than the public chain. The attacker then broadcasts this longer, private chain to the network.

6. **Reorganization (Re-org)**: Adhering to the "longest chain" rule, all nodes in the network recognize this new, longer chain and accept it as the valid history. They discard the original public chain they were working on.

7. **Final Outcome**: The initial transaction to the merchant becomes part of an orphaned chain and is effectively erased from history. The attacker's second transaction, sending the coins back to themselves, is now part of the canonical chain. The attacker successfully received goods from the merchant while retaining their original coins, effectively achieving double-spending.

### Capabilities and Limitations of a 51% Attack

Recognizing the boundaries of a 51% attack is essential.

**An attacker CAN:**
* Reverse their own transactions to double-spend coins.
* Prevent specific transactions from gaining confirmation (transaction censorship).
* Hinder other miners from discovering blocks by orphaning their blocks.

**An attacker CANNOT:**
* Steal coins from other users' wallets, as they do not possess access to others' private keys.
* Alter the rules of the network, such as increasing the block reward or creating new coins. Such blocks would be rejected by all other nodes as invalid.
* Reverse transactions initiated by other users. They can only reorganize transactions they themselves initiated.

### Cost and Feasibility of a 51% Attack

While a 51% attack represents a significant threat, carrying one out on a large, established blockchain is exceptionally challenging and costly.

| **Cost Factors** | **Details** |
|------------------------|-------------------------------------------------|
| **Hardware Costs** | An attacker must acquire an extensive amount of specialized mining hardware (ASICs). For Bitcoin, this often means obtaining more hardware than currently exists in the entire global network. This operation can be prohibitively expensive and logistically impossible to conduct secretly. |
| **Energy Costs** | The electricity required to power this hardware would be exceedingly expensive. |
| **Economic Disincentive** | If successful, news of the attack would likely cause the cryptocurrency's price to plummet. This devaluation would impact the very coins the attacker is attempting to double-spend and the costly mining equipment they acquired, rendering the attack economically irrational. |

Due to these factors, smaller Proof-of-Work cryptocurrencies with lower total network hashrates are far more susceptible. Documented cases of successful 51% attacks have occurred on smaller coins like [Ethereum](/what-is-ethereum) Classic, Verge, and Bitcoin Gold, where acquiring the necessary hashrate proved feasible for determined attackers.

### Frequently Asked Questions (FAQ)

**Can a 51% attack occur on a Proof-of-[Stake](/how-to-become-a-web3-staking-specialist) (PoS) network?** 
Yes, although the mechanics differ. In a PoS network, an attacker must acquire over 50% of the total staked cryptocurrency. PoS protocols typically include a defense mechanism called "slashing." This feature allows the protocol to automatically detect attempts to compromise the network (for instance, by validating two different blocks at the same height) and destroy a significant portion of the attacker's staked funds. This makes the attack costly and self-defeating.

**Why is 51% the critical threshold? Why not 49%?** 
Mining operates as a probabilistic game. An attacker with 49% of the hashrate could theoretically find several blocks in sequence, but statistically, this outcome is highly unlikely. Controlling over 50% of the hashrate guarantees an attacker the statistical ability to build a longer chain over time.

**Has Bitcoin ever faced a 51% attack?** 
No, the Bitcoin network has never been successfully attacked in this manner. The scale and expense associated with its mining network render it one of the most secure blockchains in existence.

**What is the greatest risk associated with a 51% attack?** 
While double-spending is frequently mentioned, the most significant danger is the loss of trust. A successful 51% attack on a major blockchain would severely undermine its perceived immutability and security, leading to a substantial drop in its value and utility.
