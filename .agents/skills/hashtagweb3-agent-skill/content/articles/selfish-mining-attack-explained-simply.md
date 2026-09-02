---
title: Selfish Mining Attack Explained Simply
description: >-
 A full guide to selfish mining, a strategic attack where a Proof-of-Work miner
 can earn disproportionate rewards by selectively withholding.
category: Educational
image: 'https://picsum.photos/seed/selfish/1200/630'
data-ai-hint: selfish mining
publishedDate: '2026-03-11'
lastUpdated: "2026-08-28"
---

## Selfish Mining Attack Explained Simply

In a Proof-of-Work (PoW) [blockchain](/what-is-a-blockchain) such as [Bitcoin](/what-is-bitcoin), honest miners collaborate to extend the longest valid chain by broadcasting newly found blocks to the network. However, when a miner withholds their discoveries, they engage in a **selfish mining attack**. This strategic approach allows a miner or mining pool to increase their revenue disproportionately compared to their share of the network's hash power.

The selfish mining attack capitalizes on network latency and the "longest chain" rule established by Nakamoto Consensus. By maintaining a private chain of blocks and revealing it selectively, a selfish miner can compel honest miners to waste their computational resources on blocks that will eventually become orphaned. This increases the selfish miner's share of the total block rewards.

This article clarifies the mechanics of selfish mining, its implications for blockchain security, and the strategies available for mitigation.

### Key Insights

| Insight | Details |
|------------------------------|-------------------------------------------------------------------------------------------------------------------------|
| **Core Idea** | A selfish miner keeps their discovered blocks private to gain a head start on constructing a longer secret chain. |
| **The Goal** | To force honest miners to waste their efforts on a public chain that will later be orphaned, thus increasing the selfish miner's relative share of rewards. |
| **Key Exploit** | This attack exploits the **[fork choice rule](/what-is-a-blockchain-fork-choice-rule)** and the inherent delays in block propagation in distributed networks. |
| **Threat Level** | Although theoretically possible, executing a successful selfish mining attack is challenging and typically requires a significant portion of the network's hash rate. It poses a threat to the fairness and security of blockchains. |

### The Honest Mining Process

To understand selfish mining, it is essential to first recognize how honest mining operates:

1. A miner discovers a new valid block.
2. They immediately broadcast this block to the entire network.
3. Other miners receive the new block, verify it, and begin mining on top of it, aiming to find the next block.

This collaborative effort ensures that the network extends a single, canonical chain.

### The Selfish Mining Attack: Step-by-Step

A selfish miner diverges from the standard honest mining strategy. Consider a scenario where a selfish mining pool, "S," competes against a group of honest miners, "H."

**Step 1: Find a Block and Keep it Secret** 
* The selfish pool "S" discovers a new block (S1).
* Instead of broadcasting it, "S" keeps S1 private and immediately begins mining the next block (S2) on top of S1.

**Step 2: The Race Begins** 
At this stage, two races are occurring:
* The selfish pool "S" builds on its private chain, which is now one block ahead.
* The honest miners "H" continue to mine on the previous public block, unaware of S1's existence.

This creates a "delta" of one block between the secret and public chains. The outcome will depend on who finds the next block.

**Scenario A: The Honest Miners Find a Block** 
* The honest miners "H" discover a block (H1) and broadcast it.
* The selfish pool "S" becomes aware of H1. Their secret chain (S1) is now equal in length to the public chain (H1).
* To avoid wasting their block, "S" broadcasts S1.
* The network splits, with some nodes receiving H1 first and others S1 first. The competition now focuses on who finds the next block on their respective chains, effectively creating a 50/50 race instead of losing their block entirely.

**Scenario B: The Selfish Miner Finds Another Block** 
* While the honest miners continue their work, the selfish pool "S" discovers a second block (S2) on top of S1.
* Their secret chain (S1 -> S2) is now two blocks ahead of the public chain (delta = 2).
* The selfish miner has a guaranteed advantage. Even if the honest miners find a block now, their chain remains only one block long, while the selfish chain is two blocks long.
* The selfish miner can wait and reveal their longer chain whenever the honest miners publish a block. This invalidates the honest miners' work while allowing the selfish miner to claim rewards for both S1 and S2.
* By using this strategy, the selfish miner can consistently orphan honest miners' blocks, increasing their revenue beyond what their hash power alone would typically yield.

### Why is Selfish Mining a Threat?

1. **Unfair Rewards**: Selfish mining disrupts the fundamental principle that a miner's reward should correlate with their contributed hash power. A selfish miner can earn more than their fair share.
2. **Centralization Pressure**: If selfish mining proves profitable, it incentivizes other miners to join the selfish pool for a share of the enhanced profits. This can lead to the pool growing larger, potentially reaching the **[51% threshold](/what-is-a-51-percent-attack-in-blockchain)**, enabling full control over the network.
3. **Wasted Energy**: The attack forces honest miners to expend significant computational power and energy on blocks that will ultimately be discarded, reducing the network's overall efficiency.

### Mitigation and Defenses

Blockchains can implement several strategies to defend against selfish mining:

* **Increased Network Connectivity**: The attack depends on the selfish miner's ability to propagate their hidden chain faster than honest miners can propagate theirs. Enhancing network connectivity can diminish the time advantage of the selfish miner.
* **Protocol-Level Changes**: Some protocols propose alterations to the fork choice rule to deter selfish mining. For instance, a rule could prioritize chains published earlier when two competing chains have the same length. [Ethereum](/what-is-ethereum)'s original GHOST protocol, which rewarded **[Uncle blocks](/understanding-uncle-blocks-in-ethereum)**, partially mitigated selfish mining by reducing the penalty for having a block orphaned, thus lowering the relative profitability of the selfish strategy.

In highly decentralized networks like Bitcoin, executing a successful selfish mining attack is exceedingly difficult. It requires a substantial portion of the network's hash rate while carrying the risk of orphaning the selfish miner's own blocks if their network connection is suboptimal.

### Frequently Asked Questions (FAQ)

**Q: How much hash power is needed for a selfish mining attack to be profitable?** 
A: Research indicates that selfish mining could theoretically become profitable with a minority of the network's hash rate, contingent on network conditions. However, this estimate is theoretical; actual required hash power is likely higher in practice.

**Q: Is selfish mining the same as a 51% attack?** 
A: No. A 51% attack requires a majority of hash power, granting the attacker full control to double-spend and censor transactions. Selfish mining focuses on maximizing revenue and can (theoretically) be executed by a minority miner. Nevertheless, a successful selfish mining strategy can open the door to a 51% attack if it attracts additional miners to the selfish pool.

**Q: Has selfish mining ever occurred on a major blockchain?** 
A: There is no definitive, publicly verified case of a large-scale selfish mining attack on a major blockchain like Bitcoin. However, small-scale or subtle attempts may have occurred. The strategy's profitability is heavily reliant on ideal network conditions, which may not be present in real-world scenarios.

**Q: Does Proof-of-[Stake](/how-to-become-a-web3-staking-specialist) (PoS) suffer from selfish mining?** 
A: PoS systems do not face the same risks as PoW in terms of selfish mining since block creation does not depend on computational power races. However, they can experience different strategic attacks where a validator withholds attestations or blocks to gain an advantage. PoS protocols implement various mechanisms, such as slashing penalties, to deter such behaviors.
