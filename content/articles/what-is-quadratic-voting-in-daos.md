---
title: "What is Quadratic Voting in DAOs"
image: "https://picsum.photos/seed/quadratic-voting/1200/630"
description: "Discover Quadratic Voting, a novel voting mechanism that aims to balance the influence of large and small token holders in DAO governance."
category: "Educational"
data-ai-hint: "voting poll"
---

### Introduction

In the world of Decentralized Autonomous Organizations (DAOs), one of the biggest challenges is creating a fair and effective governance system. The standard "one token, one vote" model, while simple, has a major flaw: it gives disproportionate power to a few large token holders ("whales"), who can easily outvote the rest of the community. **Quadratic Voting (QV)** is a novel voting mechanism designed to address this problem by changing the way votes are counted. It aims to better reflect the *preference* of a community, not just the capital distribution.

### The Problem with "One Token, One Vote"

In a standard token-based voting system, a user's voting power is directly proportional to the number of tokens they hold.
-   Alice has 100 tokens, so she has 100 votes.
-   Bob has 10,000 tokens, so he has 10,000 votes.

This means Bob's opinion has 100 times more weight than Alice's, even if Alice is a more active and informed community member. This can lead to voter apathy among smaller holders and risks the DAO being controlled by a few wealthy individuals.

### How Quadratic Voting Works

Quadratic Voting introduces a new formula for casting and counting votes. The core principle is that the *cost* of each additional vote for a particular issue increases quadratically.

**The Formula**:
*Cost of Votes = (Number of Votes)²*

-   To cast **1 vote**, it costs you 1 token (1² = 1).
-   To cast **2 votes**, it costs you 4 tokens (2² = 4).
-   To cast **3 votes**, it costs you 9 tokens (3² = 9).
-   To cast **10 votes**, it costs you 100 tokens (10² = 100).

The key insight is that it becomes exponentially more expensive to express a strong preference for a single issue.

### Why It Matters

This quadratic cost structure has profound implications for governance.

1.  **Diminishing Returns for Whales**: A wealthy whale can no longer use their entire stack of tokens to dominate a single vote. To cast 100 votes, Bob would need 10,000 tokens. To cast 101 votes, it would cost him an additional 201 tokens (101² - 100²), a much higher marginal cost. This forces large holders to be more judicious with their voting power.

2.  **Empowers the Broader Community**: It makes it easier for a large group of individuals with weaker preferences to overcome a small group with a very strong preference. For example:
    -   100 community members each cast 1 vote for a proposal (Total Cost: 100 * 1² = 100 tokens). They have collectively cast 100 votes.
    -   A single whale who opposes the proposal would need to spend 100² = 10,000 tokens to match those 100 votes.
    This system favors consensus and broad support over the concentrated power of a few.

3.  **Measures Intensity of Preference**: QV allows voters to express *how strongly* they care about an issue. If a user feels extremely passionate about a proposal, they can choose to spend more of their voting credits to have a greater say, but at a quadratically increasing cost. It measures not just the direction of preference, but its intensity.

### Practical Example

Imagine a DAO is voting on a proposal.
-   Alice has 100 tokens. She cares moderately and decides to cast 5 votes. This costs her 5² = 25 tokens. She has 75 tokens left for other proposals.
-   Bob, a whale, has 10,000 tokens. He strongly opposes the proposal and wants to cast 50 votes. This costs him 50² = 2,500 tokens.
-   Carol, another whale, also has 10,000 tokens. She is mildly in favor and decides to cast 10 votes, costing her 10² = 100 tokens.

In this scenario, Bob had to spend a significant portion of his capital to express his strong preference, while the system allowed Alice to have a meaningful impact despite her smaller holdings. It encourages a more efficient allocation of "political capital."

### Challenges and Implementations

While powerful in theory, pure Quadratic Voting has challenges. One major issue is **collusion** or **sybil attacks**, where a single entity could split their tokens across many different wallets to bypass the quadratic cost, effectively reverting to a "one token, one vote" system.

Because of this, QV is often used in combination with other mechanisms or in specific contexts:

-   **Gitcoin Grants**: Uses QV for its community funding rounds. It helps to direct funds to projects that have broad community support, rather than just one or two wealthy backers.
-   **Identity Verification**: Combining QV with a decentralized identity system can help to mitigate sybil attacks by ensuring that each vote comes from a unique individual.

### FAQ

**Is Quadratic Voting used in real DAOs?**
Yes, but often in modified forms. Its most famous and successful implementation is in Gitcoin's funding rounds. Some DAOs use it for specific types of non-binding or community signaling votes.

**Where do the "spent" tokens go?**
This depends on the implementation. In some models, the spent tokens are sent to a community treasury. In others, using a mechanism called "Quadratic Funding," the spent "voice credits" are not tokens but are used to match funds from a central pool, creating a public goods funding model.

**What is the main goal of Quadratic Voting?**
The main goal is to find a more optimal balance between the voice of the majority and the rights of minorities, producing outcomes that better reflect the collective welfare of a group. It is seen as a potential solution to the tyranny of the majority and the dominance of capital in DAO governance.
