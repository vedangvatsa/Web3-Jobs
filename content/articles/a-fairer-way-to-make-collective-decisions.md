---

title: "Quadratic Funding: A Fairer Way to Fund Public Goods"
image: "/images/anton-maksimov-5642-su-MSzGw5V0ui8-unsplash.jpg"
data-ai-hint: "fairness balance scale"
description: "A deep dive into Quadratic Funding, the innovative mechanism that uses a matching pool to amplify the power of small community donations, creating a more."
category: "Industry Insights"
publishedDate: "2026-03-11"
lastUpdated: "2026-03-11"
---

How does a society decide what to build? In the traditional world, the funding of "public goods"-things like parks, scientific research, and open-source software that benefit everyone-is a difficult problem. These goods are important, but because they are non-excludable and non-rivalrous, there's no direct profit motive for any single individual or company to create them. They are often underfunded, relying on government grants or philanthropy, which can be slow, bureaucratic, and subject to the biases of a small group of decision-makers.

[Web3](/what-is-web3), with its focus on new models of governance and coordination, has pioneered a powerful new solution to this problem: **Quadratic Funding (QF)**. It's a mathematically optimal way to fund public goods that amplifies the voice of the community over the wealth of a few. Developed by Vitalik Buterin, Zoe Hitzig, and Glen Weyl, QF is a core component of the **[Web3 for Good](/web3-for-good-careers-in-social-impact-[daos](/what-is-a-dao))** movement and has the potential to revolutionize how we make collective decisions. This guide will explain how Quadratic Funding works, why it's so powerful, and how it's being used in the real world.

### The Problem with "1 Dollar, 1 Vote"

The simplest way to make a collective funding decision is to let money vote. If Project A gets $10,000 in donations and Project B gets $1,000, then Project A is clearly what the community wants more. Right?

Not necessarily. What if Project A's funding came from a single wealthy whale, while Project B's funding came from 100 passionate small contributors? The "1 dollar, 1 vote" model gives all the power to the wealthy, drowning out the preferences of the broader community. This is plutocracy, not democracy.

### How Quadratic Funding Works: The Power of the Crowd

Quadratic Funding solves this problem by introducing a **matching pool**. This is a large pool of funds, often donated by a foundation or a protocol's treasury. The magic of QF is in how it allocates these matching funds. The amount a project receives from the matching pool is determined not by the *total donation amount* it receives, but by the *number of unique contributors* it has.

The formula is as follows: The matching amount for a project is proportional to the **square of the sum of the square roots of each individual contribution.**

That sounds complex, so let's use a simple example.

Imagine a matching pool of $10,000.

-   **Scenario 1: The Whale**
    -   A single wealthy donor gives **$100** to Project A.
    -   The sum of the square roots of contributions is: `sqrt(100) = 10`.
    -   The squared result is: `10 * 10 = 100`. Project A receives a **$100** match.
    -   Total funding for Project A: $100 (donation) + $100 (match) = $200.

-   **Scenario 2: The Community**
    -   One hundred different people each donate **$1** to Project B.
    -   The sum of the square roots of contributions is: `100 * sqrt(1) = 100 * 1 = 100`.
    -   The squared result is: `100 * 100 = 10,000`. Project B receives a **$10,000** match.
    -   Total funding for Project B: $100 (donations) + $10,000 (match) = $10,100.

**The Insight:** Even though both projects received the same total donation amount ($100), Project B received a 100x larger match from the pool. Why? Because the QF algorithm cares more about the *number* of people who showed support than the *amount* of their support. It amplifies the voice of the many over the [wallet](/how-to-choose-a-crypto-wallet) of the few. It's a system that reflects what the community wants, not just what the wealthy want.

### Practical Insights: Gitcoin and the Real-World Impact

The most prominent and successful implementation of Quadratic Funding is **Gitcoin**. Gitcoin runs regular "Grants Rounds" where the community can donate to a wide range of Web3 public goods projects-from open-source software and infrastructure to media and community initiatives.

-   **How it Works:** The [Ethereum](/what-is-ethereum) Foundation and other large protocols contribute millions of dollars to a matching pool. Thousands of individuals then donate small amounts of crypto to the projects they believe in. The QF algorithm then distributes the matching pool funds, providing critical early-stage funding to hundreds of valuable ecosystem projects.
-   **The Impact:** Gitcoin has become the primary funding mechanism for the public goods layer of the Ethereum ecosystem. Many essential tools and projects that developers use every day got their start through a Gitcoin grant. It has created a sustainable, community-driven economy for open-source development.

### Challenges and the Future

Quadratic Funding is not without its challenges. The biggest is **sybil resistance**. Because the system rewards unique contributors, there is a strong incentive for a single person to create many fake accounts ("sybil attacks") to make it seem like a project has more supporters than it really does, thereby attracting a larger share of the matching pool.

Projects like Gitcoin are actively working on this problem, using a combination of on-chain analytics, social verification, and decentralized identity solutions (like Gitcoin Passport) to verify the "humanity" and uniqueness of contributors.

Despite these challenges, Quadratic Funding represents a major breakthrough in social coordination. It provides a democratic and scalable mechanism for communities to collectively fund the projects they value most. As the tools for identity and sybil resistance improve, QF is poised to move beyond the Web3 ecosystem and become a powerful tool for funding public goods of all kinds, from local community projects to global scientific research. It's a practical and elegant expression of Web3's promise to build fairer and more equitable systems for the world.