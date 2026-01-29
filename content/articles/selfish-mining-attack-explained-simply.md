---


title: "Selfish Mining Attack Explained Simply"
description: "A comprehensive guide to selfish mining, a strategic attack where a Proof-of-Work miner can earn disproportionate rewards by selectively withholding discovered blocks."
category: "Educational"
image: "https://picsum.photos/seed/selfish/1200/630"
data-ai-hint: "selfish mining"

---



## Selfish Mining Attack Explained Simply: A Complete Guide

In a Proof-of-Work (PoW) blockchain like Bitcoin, the core principle is that honest miners work together to extend the longest valid chain. They immediately broadcast any new block they find to the network. However, what if a miner acted "selfishly" by not sharing their discoveries? This is the premise of a **selfish mining attack**, a strategic form of mining where a miner (or pool) can increase their revenue relative to their share of the network's hash power by selectively withholding their own valid blocks.

This attack exploits network latency and the "longest chain" rule of Nakamoto Consensus. By creating a secret, private chain and only revealing it at opportune moments, a selfish miner can force other honest miners to waste their computational power on blocks that will ultimately be orphaned, increasing the selfish miner's share of the total block rewards.

This guide provides a simple yet comprehensive explanation of how selfish mining works, why it's a threat to blockchain security, and what measures can be taken to mitigate it.

### Key Insights

*   **Core Idea**: A selfish miner keeps their discovered blocks private, aiming to get a head start on building a longer secret chain.
*   **The Goal**: To make honest miners waste their work on a public chain that will later be orphaned, thus increasing the selfish miner's relative share of the total rewards.
*   **Key Exploit**: The attack leverages the **[fork choice rule](/what-is-a-blockchain-fork-choice-rule)** (longest chain wins) and the natural **[block propagation](/what-is-block-propagation-in-networks)** delay in a distributed network.
*   **Threat Level**: While theoretically possible, successful selfish mining is difficult and requires a significant portion of the network's hash rate (though not necessarily a full 51%). It represents a threat to a blockchain's fairness and security.

### The Honest Mining Process (The Standard Way)

Before explaining the attack, let's recap how honest mining works:
1.  A miner finds a new valid block.
2.  They immediately broadcast this block to the entire network.
3.  All other miners hear about this new block, verify it, and start mining on top of it, trying to find the next block.

This collaborative process ensures the whole network works together to extend one single, canonical chain.

### The Selfish Mining Attack: Step-by-Step

A selfish miner deviates from this honest strategy. Let's walk through a scenario where a selfish pool, "S," competes against the rest of the honest miners, "H."

**Step 1: Find a Block and Keep it Secret**
*   The selfish pool "S" finds a new block (S1).
*   Instead of broadcasting it, "S" keeps it private and immediately starts trying to find the next block (S2) on top of S1.

**Step 2: The Race Begins (The Delta)**
Now there are two "races" happening in parallel:
*   The selfish pool "S" is mining on its private chain, which is currently one block ahead.
*   The honest miners "H" are still mining on the previous public block, unaware of S1's existence.

At this point, we have a "delta" of 1 block between the secret chain and the public chain. The outcome depends on who finds the next block.

**Scenario A: The Honest Miners Find a Block**
*   The honest miners "H" find a block (H1). They broadcast it to the network.
*   The selfish pool "S" sees H1. Their secret chain (S1) is now the same length as the new public chain (H1).
*   To prevent their block from being wasted, "S" immediately broadcasts their secret block S1.
*   The network is now split. Some nodes see H1 first, and some see S1 first. The race is now about who finds the next block on top of their respective chains. The selfish miner has effectively turned their advantage into a 50/50 race, rather than losing their block entirely.

**Scenario B: The Selfish Miner Finds Another Block (The Best Case)**
*   While the honest miners are still working, the selfish pool "S" finds a second block (S2) on top of its secret block S1.
*   Their secret chain (S1 -> S2) is now two blocks ahead of the public chain (delta = 2).
*   At this point, "S" has a guaranteed win. Even if the honest miners find a block now, their chain will only be one block long. The selfish chain is two blocks long.
*   The selfish miner can now wait. Whenever the honest miners find and publish a block, the selfish miner can release their longer chain, invaliding the honest miners' work and claiming the rewards for both S1 and S2.
*   By continuing this strategy, the selfish miner can consistently orphan the blocks of honest miners, increasing their revenue beyond what their hash power would normally earn.

### Why is Selfish Mining a Threat?

1.  **Unfair Rewards**: It breaks the fundamental assumption that a miner's reward is proportional to their contributed hash power. A selfish miner can earn more than their fair share.
2.  **Centralization Pressure**: If selfish mining becomes profitable, it creates an incentive for other miners to join the selfish pool to get a share of the increased profits. This could lead to the selfish pool growing larger and larger, potentially reaching the **[51% threshold](/what-is-a-51-percent-attack-in-blockchain)**, at which point it could take full control of the network.
3.  **Wasted Energy**: The attack forces honest miners to waste significant computational power and energy on blocks that are ultimately discarded, reducing the overall efficiency of the network.

### Mitigation and Defenses

Blockchains are not defenseless against selfish mining.
*   **Increased Network Connectivity**: The attack relies on the selfish miner's ability to propagate their hidden chain faster than the honest miners can propagate theirs. The better-connected the network is, the smaller the time advantage for the selfish miner.
*   **Protocol-Level Changes**: Some protocols have proposed changes to the fork choice rule to penalize this behavior. For example, a rule could be introduced that prefers a chain that was published earlier if two competing chains have the same length. Ethereum's original GHOST protocol, which rewarded **[Uncle blocks](/understanding-uncle-blocks-in-ethereum)**, was also a partial mitigation as it reduced the penalty for having a block orphaned, thus decreasing the relative profitability of the selfish strategy.

In practice, for a large and highly decentralized network like Bitcoin, a successful selfish mining attack is considered very difficult to pull off. It requires a substantial amount of the network's hash rate and carries the risk that the selfish miner's own blocks could be orphaned if their network connection is not perfect.

### Frequently Asked Questions (FAQ)

**Q: How much hash power is needed for a selfish mining attack to be profitable?**
A: Early academic papers showed that the attack could theoretically be profitable with as little as 25-33% of the network's hash rate, depending on network conditions. However, this is a theoretical bound, and in the real world, the required hash power is likely higher.

**Q: Is selfish mining the same as a 51% attack?**
A: No. A 51% attack requires a majority of the hash power and gives the attacker full control to double-spend and censor transactions. Selfish mining is a revenue-maximization strategy that can be performed (theoretically) by a minority miner. However, a successful selfish mining strategy can be a stepping stone to a 51% attack if it attracts more miners to the selfish pool.

**Q: Has selfish mining ever happened on a major blockchain?**
A: There is no definitive, publicly proven case of a large-scale selfish mining attack on a major blockchain like Bitcoin. However, it is possible that small-scale or subtle versions have been attempted. The strategy's profitability is highly dependent on ideal network conditions that may not exist in the real world.

**Q: Does Proof-of-Stake (PoS) suffer from selfish mining?**
A: PoS systems are not vulnerable to the same type of selfish mining because creating blocks is not a race of computational power. However, they are vulnerable to different but conceptually similar strategic attacks where a validator might withhold attestations or blocks to gain an advantage. PoS protocols have different mechanisms (like slashing penalties) to discourage this behavior.
