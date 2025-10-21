---
title: "What is Quadratic Voting in DAOs"
image: "https://picsum.photos/seed/quadratic-voting/1200/630"
description: "An explanation of Quadratic Voting, a mechanism designed to improve fairness in DAO governance over standard coin voting."
category: "DeFi"
data-ai-hint: "voting system"
---

## What is Quadratic Voting in DAOs?

**Quadratic Voting (QV)** is a voting mechanism designed to provide a more equitable way for communities to make collective decisions. In the context of Decentralized Autonomous Organizations (DAOs), it is often proposed as a solution to the problems of standard coin voting (one-token, one-vote), which can give wealthy "whale" token holders disproportionate influence.

The core principle of QV is simple: **it makes casting additional votes for a single proposal exponentially more expensive.**

### How Does Quadratic Voting Work?

In a QV system, voters are given a budget of "voice credits." They can allocate these credits to express not just their preference for a proposal, but also the *intensity* of that preference.

The cost of votes follows a quadratic formula:

-   **Cost = (Number of Votes)^2**

Let's see how this plays out:
-   1 vote on a proposal costs 1 credit (1^2 = 1).
-   2 votes on the same proposal cost 4 credits (2^2 = 4).
-   3 votes on the same proposal cost 9 credits (3^2 = 9).
-   ...
-   10 votes on the same proposal cost 100 credits (10^2 = 100).

### Why is This a More Democratic System?

The quadratic cost structure has a profound effect on voting behavior and power dynamics.

**1. It Protects Minority Interests:**
Imagine a community of 10 people with 100 voice credits each.
-   **Proposal A** is mildly beneficial to 9 people. Each of them is willing to cast 1 vote for it.
    -   Total Cost: 9 people * (1 vote)^2 = 9 credits.
    -   Total Votes: 9.
-   **Proposal B** is critically important to 1 person, who feels very strongly about it. They are willing to use almost their entire budget to cast 9 votes for it.
    -   Total Cost: 1 person * (9 votes)^2 = 81 credits.
    -   Total Votes: 9.

Even though 9 people voted for Proposal A, the passionate minority member was able to match their voting power on Proposal B. In a standard one-person-one-vote system, Proposal A would have won 9-to-1. QV allows for the intensity of preference to be expressed, giving a voice to passionate minorities.

**2. It Diminishes the Power of Whales:**
In a one-token, one-vote system, a whale with 1,000,000 tokens has 1,000 times more power than someone with 1,000 tokens.

In a QV system, the whale's power is dramatically diminished. While they have more voice credits, casting a huge number of votes on a single issue becomes prohibitively expensive. It is more rational for them to spread their votes across many different proposals that they care about moderately, rather than using their entire budget to dominate a single vote.

### Challenges of Quadratic Voting

-   **Sybil Attacks**: The biggest vulnerability of QV is the "sybil attack," where a single person creates multiple fake identities (wallets) to circumvent the quadratic cost. If a whale can split their holdings across 10 wallets, they can cast 1 vote from each wallet at a much lower cost than casting 10 votes from a single wallet. This is why QV often needs to be paired with a Sybil-resistance mechanism, like a proof-of-humanity system (e.g., Worldcoin, BrightID).
-   **Collusion**: Voters could agree to pool their credits to vote on a single proposal, also circumventing the intended cost structure.

Despite these challenges, Quadratic Voting represents a significant step forward in designing fairer and more democratic governance systems for the digital age. It provides a mathematical framework for balancing the preferences of the many with the passions of the few.